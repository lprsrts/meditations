#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to parse frontmatter from markdown content
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

// Path to articles directory
const articlesDir = path.join(__dirname, 'articles');
const outputFile = path.join(__dirname, 'articles-data.js');

// Read all markdown files from the articles directory
const articleFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.md'));

// Parse each article file
const articles = articleFiles.map(file => {
    const filePath = path.join(articlesDir, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const article = parseFrontMatter(fileContent);
    
    // Ensure id is a number
    if (article.id) {
        article.id = parseInt(article.id, 10);
    }
    
    return article;
});

// Sort articles by date (newest first)
articles.sort((a, b) => new Date(b.date) - new Date(a.date));

// Generate JavaScript file with embedded article data
const jsContent = `// This file is auto-generated from markdown files in the articles directory
// Last generated: ${new Date().toISOString()}

export const articles = ${JSON.stringify(articles, null, 2)};
`;

// Write to output file
fs.writeFileSync(outputFile, jsContent);

console.log(`Generated ${outputFile} with ${articles.length} articles`);