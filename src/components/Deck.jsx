import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

export default function Deck({ articles }) {
  // Sort articles by date, newest first
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(a.data.date) - new Date(b.data.date)
  );

  return (
    <div className="deck">
      {sortedArticles.map((article, i) => (
        <Card 
          key={article.slug}
          article={{
            slug: article.slug,
            title: article.data.title,
            date: article.data.date
          }}
          index={i}
        />
      ))}
      <div className="site-title">KENDİME DÜŞÜNCELER</div>
    </div>
  );
}