import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

export default function Deck({ articles }) {
  // Sort articles by date, newest first
  const sortedArticles = [...articles].sort((a, b) => 
    new Date(b.data.date) - new Date(a.data.date)
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
      <div className="site-title">DÜŞÜNCELERİ KAYDETME DÜRTÜSÜNDEKİ</div>
    </div>
  );
}