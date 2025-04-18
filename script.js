// Theme toggle functionality
document.addEventListener('DOMContentLoaded', async () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check for saved theme preference or use default light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.toggle('dark-mode', savedTheme === 'dark');
    
    // Toggle between light and dark mode
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    });
    
    // Load articles from markdown files
    await loadArticles();
});

// Articles will be loaded from markdown files in the articles directory
let articles = [];

// Load click counts from localStorage
function getClickCounts() {
    const savedCounts = localStorage.getItem('articleClickCounts');
    return savedCounts ? JSON.parse(savedCounts) : {};
}

// Save click counts to localStorage
function saveClickCount(articleId) {
    const counts = getClickCounts();
    counts[articleId] = (counts[articleId] || 0) + 1;
    localStorage.setItem('articleClickCounts', JSON.stringify(counts));
    return counts[articleId];
}

// Function to parse markdown frontmatter
function parseFrontMatter(text) {
    const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = text.match(frontMatterRegex);
    
    if (!match) return { content: text };
    
    const frontMatter = match[1];
    const content = match[2].trim();
    
    const metadata = {};
    const lines = frontMatter.split('\n');
    
    lines.forEach(line => {
        const [key, value] = line.split(': ');
        if (key && value) {
            metadata[key.trim()] = value.trim();
        }
    });
    
    return { ...metadata, content };
}

// Function to fetch and parse article files
async function fetchArticles() {
    try {
        const response = await fetch('articles/');
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const links = Array.from(doc.querySelectorAll('a'));
        
        const articlePromises = links
            .filter(link => link.href.endsWith('.md'))
            .map(async link => {
                const fileName = link.href.split('/').pop();
                const articleResponse = await fetch(`articles/${fileName}`);
                const markdown = await articleResponse.text();
                const article = parseFrontMatter(markdown);
                article.id = parseInt(article.id);
                return article;
            });
        
        articles = await Promise.all(articlePromises);
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return articles;
    } catch (error) {
        console.error('Error loading articles:', error);
        return [];
    }
}

// Function to load articles into the grid
async function loadArticles() {
    const articleGrid = document.querySelector('.article-grid');
    
    // If we're on the main page with the article grid
    if (articleGrid) {
        // Fetch articles from markdown files
        await fetchArticles();
        
        // Get click counts from localStorage
        const clickCounts = getClickCounts();
        
        // Sort articles by click count (descending), then by date if counts are equal
        articles.sort((a, b) => {
            const countA = clickCounts[a.id] || 0;
            const countB = clickCounts[b.id] || 0;
            
            if (countA !== countB) {
                return countB - countA; // Sort by click count (most clicked first)
            } else {
                return new Date(b.date) - new Date(a.date); // Then by date
            }
        });
        
        articles.forEach(article => {
            const articleBox = document.createElement('div');
            articleBox.className = 'article-box';
            
            // Apply grid size from article metadata
            const gridSize = article.gridSize || '1x1';
            const [width, height] = gridSize.split('x').map(Number);
            
            // Set grid properties based on size
            articleBox.style.gridColumn = `span ${width}`;
            articleBox.style.gridRow = `span ${height}`;
            
            // Extract the first paragraph from article content
            const firstParagraph = article.content.split('\n\n')[0]; 
            
            // Assign random grid sizes instead of calculating based on content length
            let gridWidth, gridHeight;
            
            // First check if there's a specific size in metadata
            if (article.gridSize) {
                const [width, height] = article.gridSize.split('x').map(Number);
                if (width && height) {
                    gridWidth = width;
                    gridHeight = height;
                }
            } else {
                // Generate random sizes with weighted probabilities
                const sizeOptions = [
                    { width: 1, height: 1, weight: 40 },  // 1x1 (40% chance)
                    { width: 2, height: 1, weight: 30 },  // 2x1 (30% chance)
                    { width: 1, height: 2, weight: 20 },  // 1x2 (20% chance)
                    { width: 2, height: 2, weight: 10 }   // 2x2 (10% chance)
                ];
                
                // Create weighted random selection
                const totalWeight = sizeOptions.reduce((sum, option) => sum + option.weight, 0);
                let random = Math.random() * totalWeight;
                
                for (const option of sizeOptions) {
                    random -= option.weight;
                    if (random <= 0) {
                        gridWidth = option.width;
                        gridHeight = option.height;
                        break;
                    }
                }
            }
            
            articleBox.innerHTML = `
                <div>
                    <h2 class="article-title">${article.title}</h2>
                    <p class="article-date">${formatDate(article.date)}</p>
                    <p class="article-preview">${firstParagraph}</p>
                </div>
            `;
            
            // Set grid properties based on calculated size
            articleBox.style.gridColumn = `span ${gridWidth}`;
            articleBox.style.gridRow = `span ${gridHeight}`;
            
            // Add click count display if article has been clicked
            const clickCount = clickCounts[article.id] || 0;
            if (clickCount > 0) {
                const clickCountElement = document.createElement('span');
                clickCountElement.className = 'click-count';
                clickCountElement.textContent = `${clickCount} view${clickCount !== 1 ? 's' : ''}`;
                articleBox.appendChild(clickCountElement);
            }
            
            // Add click event to navigate to article page and update click count
            articleBox.addEventListener('click', () => {
                saveClickCount(article.id);
                window.location.href = `article.html?id=${article.id}`;
            });
            
            articleGrid.appendChild(articleBox);
        });
    } else {
        // If we're on an article page
        loadArticlePage();
    }
}

// Function to load individual article page
async function loadArticlePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = parseInt(urlParams.get('id'));
    
    // Fetch articles if they haven't been loaded yet
    if (articles.length === 0) {
        await fetchArticles();
    }
    
    // Update click count when article page is loaded
    // We don't increment here as it was already incremented on the main page click
    
    const article = articles.find(a => a.id === articleId);
    
    if (article) {
        const articleTitle = document.getElementById('article-title');
        const articleDate = document.getElementById('article-date');
        const articleContent = document.getElementById('article-content');
        
        if (articleTitle && articleDate && articleContent) {
            articleTitle.textContent = article.title;
            articleDate.textContent = formatDate(article.date);
            articleContent.textContent = article.content;
        }
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}