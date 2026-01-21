// FullscreenNewsCarousel.js
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';

const FullscreenNewsCarousel = ({ language }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchAllNews();
  }, []);

  const fetchAllNews = async () => {
    try {
      const newsRef = collection(db, 'news');
      const q = query(newsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewsItems(items);
    } catch (error) {
      console.error('Error fetching news:', error);
    }
  };

  useEffect(() => {
    if (newsItems.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % newsItems.length);
    }, 5000); // เปลี่ยนทุก 5 วินาที

    return () => clearInterval(interval);
  }, [newsItems.length]);

  const convertUrl = (url, type) => {
    if (!url || !url.includes('drive.google.com')) return url;
    const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
    if (!fileId) return url;
    if (type === 'video') return `https://drive.google.com/file/d/${fileId}/preview`;
    return `https://drive.google.com/thumbnail?sz=w1000&id=${fileId}`;
  };

  const getTitle = (item) => {
    if (language === 'th') return item.titleTh || item.title;
    if (language === 'en') return item.titleEn || item.title;
    if (language === 'zh') return item.titleZh || item.titleEn || item.title;
    if (language === 'ko') return item.titleKo || item.titleEn || item.title;
    return item.title;
  };

  const getDescription = (item) => {
    if (language === 'th') return item.descriptionTh || item.description;
    if (language === 'en') return item.descriptionEn || item.description;
    if (language === 'zh') return item.descriptionZh || item.descriptionEn || item.description;
    if (language === 'ko') return item.descriptionKo || item.descriptionEn || item.description;
    return item.description;
  };

  if (newsItems.length === 0) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-white text-4xl font-bold animate-pulse">
          {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <div 
        ref={containerRef}
        className="flex h-full transition-transform duration-1000 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {newsItems.map((item, index) => (
          <div key={item.id} className="min-w-full h-full relative flex items-center justify-center">
            {/* Background Media */}
            <div className="absolute inset-0">
              {item.mediaType === 'video' ? (
                <iframe
                  src={convertUrl(item.mediaUrl, 'video')}
                  className="w-full h-full object-contain"
                  allow="autoplay"
                  title={getTitle(item)}
                />
              ) : (
                <img 
                  src={convertUrl(item.mediaUrl, 'image')} 
                  alt={getTitle(item)}
                  className="w-full h-full object-contain"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 max-w-5xl mx-auto px-12 text-white">
              <h1 className="text-7xl font-bold mb-6 drop-shadow-2xl leading-tight">
                {getTitle(item)}
              </h1>
              <p className="text-3xl leading-relaxed drop-shadow-lg line-clamp-4">
                {getDescription(item)}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {newsItems.map((_, i) => (
                <div 
                  key={i}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    i === currentIndex ? 'w-16 bg-white' : 'w-3 bg-white/40'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logo Overlay 
      <div className="fixed top-6 left-6 z-20" onClick={onLogoClick}>
        <img
          src="/polylogo.png"
          alt="Lanna Poly Logo"
          className="w-20 h-20 object-contain drop-shadow-2xl"
        />
      </div>*/}

      {/* School Name Overlay */}
      <div className="fixed bottom-6 left-6 z-20 text-white">
        <h2 className="text-2xl font-bold drop-shadow-lg">
          วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่
        </h2>
        <p className="text-lg text-white/90 drop-shadow-lg">
          Lanna Polytechnic Chiangmai Technological College
        </p>
      </div>
    </div>
  );
};

export default FullscreenNewsCarousel;