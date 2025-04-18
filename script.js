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
        
        articles.forEach(article => {
            const articleBox = document.createElement('div');
            articleBox.className = 'article-box';
            
            // Apply grid size from article metadata
            const gridSize = article.gridSize || '1x1';
            const [width, height] = gridSize.split('x').map(Number);
            
            // Set grid properties based on size
            articleBox.style.gridColumn = `span ${width}`;
            articleBox.style.gridRow = `span ${height}`;
            
            articleBox.innerHTML = `
                <div>
                    <h2 class="article-title">${article.title}</h2>
                    <p class="article-date">${formatDate(article.date)}</p>
                </div>
            `;
            
            // Add click event to navigate to article page
            articleBox.addEventListener('click', () => {
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