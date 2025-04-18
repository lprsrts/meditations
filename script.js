// Theme toggle functionality
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Load articles from sample data
    loadArticles();
});

// Sample article data (in a real application, this would come from a database or API)
const articles = [
    {
        id: 1,
        title: 'The Process',
        date: '2023-05-15',
        content: 'This is the process. Every day sketches, brainfarts and ideas flying around in my backpack and apartment. I hope they can inspire or help someone out there.'
    },
    {
        id: 2,
        title: 'The Project',
        date: '2023-06-22',
        content: 'Projects are the manifestation of ideas. They take shape through consistent effort and iteration. This article explores the journey from concept to completion.'
    },
    {
        id: 3,
        title: 'The Files',
        date: '2023-07-10',
        content: 'Organization is key to productivity. How we structure our files and thoughts determines how efficiently we can retrieve and build upon them later.'
    },
    {
        id: 4,
        title: 'The Human',
        date: '2023-08-05',
        content: 'At the center of all creation is the human experience. Our perceptions, emotions, and interactions shape the work we produce and how it\'s received.'
    },
    {
        id: 5,
        title: 'The Sound',
        date: '2023-09-18',
        content: 'Sound influences our environment in subtle yet profound ways. This exploration of audio landscapes reveals how sound shapes our creative process.'
    },
    {
        id: 6,
        title: 'Minimal Design',
        date: '2023-10-30',
        content: 'Less is more. The principles of minimal design focus on removing the unnecessary to emphasize what truly matters. This article examines how reduction leads to clarity.'
    }
];

// Function to load articles into the grid
function loadArticles() {
    const articleGrid = document.querySelector('.article-grid');
    
    // If we're on the main page with the article grid
    if (articleGrid) {
        articles.forEach(article => {
            const articleBox = document.createElement('div');
            articleBox.className = 'article-box';
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
function loadArticlePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = parseInt(urlParams.get('id'));
    
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