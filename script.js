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

// Function to get articles - embedded directly to avoid GitHub Pages 404 errors
async function fetchArticles() {
    try {
        // Instead of fetching from files, we'll embed the article content directly
        // This avoids 404 errors when deployed to GitHub Pages
        const embeddedArticles = [
            {
                id: 1,
                title: "The Process",
                date: "2023-05-15",
                content: "This is the process. Every day sketches, brainfarts and ideas flying around in my backpack and apartment. I hope they can inspire or help someone out there.\n\nCreativity isn't a straight line. It's a winding path with unexpected turns and discoveries. Some days the ideas flow freely, and other days they hide in the shadows, requiring patience and persistence to coax them out.\n\nThe most important thing is to keep showing up. Keep making marks on the page, keep typing words, keep building. The process itself is where the magic happens, not just in the final product."
            },
            {
                id: 2,
                title: "Mindfulness",
                date: "2023-06-10",
                content: "Mindfulness is the practice of being fully present and engaged in the moment, aware of your thoughts and feelings without distraction or judgment.\n\nIn our fast-paced world, the mind is constantly pulled in multiple directions. Mindfulness brings you back to what's happening right now.\n\nStart with just five minutes a day of focused breathing. Notice the sensation of your breath entering and leaving your body. When your mind wanders, gently bring it back to your breath."
            },
            {
                id: 3,
                title: "Digital Minimalism",
                date: "2023-07-05",
                content: "Digital minimalism is a philosophy that helps you question what digital communication tools (and behaviors surrounding these tools) add the most value to your life.\n\nIt's about using technology intentionally and purposefully, rather than letting it use you.\n\nTry a digital declutter: remove optional technologies from your life for 30 days, then slowly reintroduce only the ones that serve your values."
            },
            {
                id: 4,
                title: "Deep Work",
                date: "2023-08-20",
                content: "Deep work is the ability to focus without distraction on a cognitively demanding task.\n\nIt's becoming increasingly rare in our world of instant messages and social media, yet it's incredibly valuable.\n\nTo cultivate deep work: schedule deep work blocks, embrace boredom, quit social media, drain the shallows of your day."
            },
            {
                id: 5,
                title: "Stoicism",
                date: "2023-09-15",
                content: "Stoicism teaches that virtue (wisdom, courage, justice, temperance) is the only true good and that external events are outside our control.\n\nFocus on what you can control—your judgments and actions—and accept what you cannot.\n\nPractice negative visualization: imagine losing what you value. This helps you appreciate what you have and prepares you for life's challenges."
            },
            {
                id: 6,
                title: "Ikigai",
                date: "2023-10-30",
                content: "Ikigai is a Japanese concept meaning 'a reason for being.' It lies at the intersection of what you love, what you're good at, what the world needs, and what you can be paid for.\n\nFinding your ikigai requires deep self-reflection and patience.\n\nStart by listing what you love, what you're good at, what the world needs, and what you can be paid for. Look for connections between these areas."
            }
        ];
        
        articles = embeddedArticles;
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
            
            // Convert markdown-like content to HTML
            const paragraphs = article.content.split('\n\n');
            articleContent.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        }
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}