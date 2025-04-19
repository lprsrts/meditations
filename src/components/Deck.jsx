import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

export default function Deck({ articles }) {
  const [mounted, setMounted] = useState(false);
  const [sortedArticles, setSortedArticles] = useState([]);

  useEffect(() => {
    setMounted(true);
    // Sort articles by date, newest first
    const sorted = [...articles].sort((a, b) => 
      new Date(b.data.date) - new Date(a.data.date)
    );
    setSortedArticles(sorted);
  }, [articles]);

  // Before hydration is complete, render a simplified version
  if (!mounted) {
    return (
      <div className="deck">
        <div className="site-title">DÜŞÜNCELERİ KAYDETME DÜRTÜSÜNDEKİ</div>
      </div>
    );
  }

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