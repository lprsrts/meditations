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
    
    // Handle click tracking for articles
    setupArticleClickTracking();
});

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

// Function to setup click tracking for articles
function setupArticleClickTracking() {
    const articleGrid = document.querySelector('.article-grid');
    
    // If we're on the main page with the article grid
    if (articleGrid) {
        // Get click counts from localStorage
        const clickCounts = getClickCounts();
        
        // Add click counts to articles
        const articleBoxes = document.querySelectorAll('.article-box');
        articleBoxes.forEach(box => {
            const link = box.querySelector('.article-link');
            if (link) {
                const articleId = link.getAttribute('data-id');
                if (articleId) {
                    // Add click count display if article has been clicked
                    const clickCount = clickCounts[articleId] || 0;
                    if (clickCount > 0) {
                        const clickCountElement = document.createElement('span');
                        clickCountElement.className = 'click-count';
                        clickCountElement.textContent = `${clickCount} view${clickCount !== 1 ? 's' : ''}`;
                        box.appendChild(clickCountElement);
                    }
                    
                    // Add click event to update click count and navigate to article
                    box.style.cursor = 'pointer'; // Add pointer cursor to indicate clickable
                    box.addEventListener('click', (e) => {
                        // Only handle clicks on the box itself, not on child elements that might have their own handlers
                        if (e.target === box || !link.contains(e.target)) {
                            e.preventDefault();
                            saveClickCount(articleId);
                            window.location.href = link.getAttribute('href');
                        }
                    });
                    
                    // Make sure the link itself still works properly
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        saveClickCount(articleId);
                        window.location.href = link.getAttribute('href');
                    });
                }
            }
        });
    }
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Helper function to format dates
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}