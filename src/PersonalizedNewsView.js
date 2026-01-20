// PersonalizedNewsView.js
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { User, X, ExternalLink, Calendar } from 'lucide-react';

const PersonalizedNewsView = ({ userProfile, language, onNoPresence }) => {
  const [newsItems, setNewsItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const lastDetectionTime = useRef(Date.now());
  const presenceCheckInterval = useRef(null);

  useEffect(() => {
    fetchPersonalizedNews();
  }, [userProfile]);

  // ตรวจสอบว่ามีคนอยู่หรือไม่ทุก 1 วินาที
  useEffect(() => {
    presenceCheckInterval.current = setInterval(() => {
      const timeSinceLastDetection = Date.now() - lastDetectionTime.current;
      if (timeSinceLastDetection > 30000) { // 30 วินาที
        console.log('No presence for 30 seconds, returning to carousel...');
        onNoPresence();
      }
    }, 1000);

    return () => {
      if (presenceCheckInterval.current) {
        clearInterval(presenceCheckInterval.current);
      }
    };
  }, [onNoPresence]);

  const fetchPersonalizedNews = async () => {
    try {
      const newsRef = collection(db, 'news');
      const q = query(newsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const matchesGender = !data.targetGender || data.targetGender === 'all' || data.targetGender === userProfile.gender;
        const matchesAge = !data.targetAgeMin || (userProfile.age >= data.targetAgeMin && userProfile.age <= (data.targetAgeMax || 100));
        
        if (matchesGender && matchesAge) {
          items.push({ id: doc.id, ...data });
        }
      });
      
      setNewsItems(items);
    } catch (error) {
      console.error('Error fetching personalized news:', error);
    }
  };

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

  const getUIText = (key) => {
    const texts = {
      newsTitle: { th: 'ข่าวสารและกิจกรรมสำหรับคุณ', en: 'News & Activities for You', zh: '为您推荐的新闻与活动', ko: '맞춤 뉴스 및 활동' },
      userProfile: { th: 'ข้อมูลผู้ใช้', en: 'User Profile', zh: '用户信息', ko: '사용자 정보' },
      gender: { th: 'เพศ:', en: 'Gender:', zh: '性别:', ko: '성별:' },
      age: { th: 'อายุ:', en: 'Age:', zh: '年龄:', ko: '나이:' },
      confidence: { th: 'ความมั่นใจ:', en: 'Confidence:', zh: '置信度:', ko: '신뢰도:' },
      male: { th: 'ชาย', en: 'Male', zh: '男', ko: '남성' },
      female: { th: 'หญิง', en: 'Female', zh: '女', ko: '여성' },
      years: { th: 'ปี', en: 'years', zh: '岁', ko: '세' },
      close: { th: 'ปิด', en: 'Close', zh: '关闭', ko: '닫기' }
    };
    return texts[key][language] || texts[key].th;
  };

  // Reset timer เมื่อมีการโต้ตอบ
  const handleInteraction = () => {
    lastDetectionTime.current = Date.now();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50" onClick={handleInteraction}>
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/polylogo.png" alt="Logo" className="w-16 h-16 object-contain drop-shadow-md" />
              <div>
                <h1 className="text-2xl font-bold">วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่</h1>
                <p className="text-blue-100 text-sm">Lanna Polytechnic Chiangmai Technological College</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - User Profile */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                {getUIText('userProfile')}
              </h2>

              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{getUIText('gender')}</span>
                  <span className="font-semibold text-gray-800">
                    {userProfile.gender === 'male' ? getUIText('male') : getUIText('female')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{getUIText('age')}</span>
                  <span className="font-semibold text-gray-800">
                    {userProfile.age} {getUIText('years')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{getUIText('confidence')}</span>
                  <span className="font-semibold text-gray-800">
                    {Math.round(userProfile.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Auto-reset warning */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800 text-center">
                  {language === 'th' ? 'ระบบจะรีเซ็ตอัตโนมัติหากไม่มีการใช้งาน 30 วินาที' :
                   language === 'en' ? 'System will auto-reset after 30 seconds of inactivity' :
                   language === 'zh' ? '系统将在30秒后自动重置' :
                   '30초 후 자동으로 재설정됩니다'}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content - News Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">{getUIText('newsTitle')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedItem(item);
                    handleInteraction();
                  }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
                >
                  <div className="relative h-48 bg-gray-100">
                    <img 
                      src={convertUrl(item.mediaUrl, 'image')} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{getTitle(item)}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{getDescription(item)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Detail Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-10"
          onClick={() => {
            setSelectedItem(null);
            handleInteraction();
          }}
        >
          <button className="absolute top-6 right-6 text-white hover:text-red-500 transition z-10">
            <X size={40} />
          </button>

          <div 
            className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Media Section */}
            <div className="w-full md:w-2/3 bg-black flex items-center justify-center min-h-[300px]">
              {selectedItem.mediaType === 'video' ? (
                <iframe
                  src={convertUrl(selectedItem.mediaUrl, 'video')}
                  className="w-full h-full aspect-video"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  title="Video content"
                />
              ) : (
                <img 
                  src={convertUrl(selectedItem.mediaUrl, 'image')} 
                  className="max-w-full max-h-full object-contain"
                  alt="News content"
                />
              )}
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/3 p-8 overflow-y-auto bg-white flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{getTitle(selectedItem)}</h2>
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar size={14}/> 
                  {selectedItem.createdAt?.seconds ? 
                    new Date(selectedItem.createdAt.seconds * 1000).toLocaleDateString() : 
                    'N/A'}
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-line text-lg">
                {getDescription(selectedItem)}
              </p>
              
              <div className="mt-auto pt-6 border-t flex gap-4">
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  {getUIText('close')}
                </button>
                <a 
                  href={selectedItem.mediaUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                >
                  <ExternalLink size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalizedNewsView;