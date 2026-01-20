// App.js
import React, { useState, useEffect, useRef } from 'react';
import PDPAOverlay from './PDPAOverlay.js';
import FaceAnalyzer from './FaceAnalyzer.js';
import TiewSonAI from './TiewSonAI.js';
import NewsFeed from './NewsFeed.js';
import AdminCMS from './AdminCMS.js';
import { User, Activity } from 'lucide-react';

function App() {
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [language, setLanguage] = useState('th');
  const [isPresent, setIsPresent] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const inactivityTimer = useRef(null);
  const noPresenceTimer = useRef(null);
  const [logoClickCount, setLogoClickCount] = useState(0); // 1. เพิ่ม State นี้

  // 2. ฟังก์ชันจัดการการคลิก
  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setShowAdmin(true);
        return 0;
      }
      return newCount;
    });

    if (window.logoTimer) clearTimeout(window.logoTimer);
    window.logoTimer = setTimeout(() => setLogoClickCount(0), 2000);
  };
  // Handle PDPA acceptance
  const handlePDPAAccept = () => {
    setPdpaAccepted(true);
    resetInactivityTimer();
  };

  // Handle face analysis updates
  // ใน App.js
const handleAnalysisUpdate = (analysis) => {
  if (analysis.detected) {
    // เช็คก่อนว่าข้อมูลเปลี่ยนไปจากเดิมหรือไม่
    setUserProfile(prev => {
      if (prev && prev.gender === analysis.gender && prev.age === analysis.age) {
        return prev; // ถ้าข้อมูลเดิม ไม่ต้องทำอะไร (ป้องกันการกระพริบ)
      }
      return {
        gender: analysis.gender,
        age: analysis.age,
        confidence: analysis.confidence
      };
    });
    resetInactivityTimer();
  }
};
  // Handle presence detection
  const handlePresenceChange = (present) => {
    setIsPresent(present);

    if (!present) {
      // Start 30-second timer when no face detected
      if (noPresenceTimer.current) {
        clearTimeout(noPresenceTimer.current);
      }

      noPresenceTimer.current = setTimeout(() => {
        console.log('No presence detected for 30 seconds - resetting...');
        resetToInitialState();
      }, 30000);
    } else {
      // Clear timer when face is detected again
      if (noPresenceTimer.current) {
        clearTimeout(noPresenceTimer.current);
        noPresenceTimer.current = null;
      }
    }
  };

  // Reset to initial state (PDPA screen)
  const resetToInitialState = () => {
    setPdpaAccepted(false);
    setUserProfile(null);
    setLanguage('th');
    setIsPresent(false);

    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    if (noPresenceTimer.current) {
      clearTimeout(noPresenceTimer.current);
    }

    console.log('Session reset for privacy');
  };

  // Reset inactivity timer
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      if (noPresenceTimer.current) {
        clearTimeout(noPresenceTimer.current);
      }
    };
  }, []);

  // Admin access (press Alt+A)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.altKey && e.key === 'a') {
        setShowAdmin(!showAdmin);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAdmin]);

  // Show Admin CMS
  if (showAdmin) {
    return (
      <div>
        <button
          onClick={() => setShowAdmin(false)}
          className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg z-50"
        >
          ออกจากโหมด Admin
        </button>
        <AdminCMS />
      </div>
    );
  }

  // Show PDPA overlay if not accepted
  if (!pdpaAccepted) {
    return <PDPAOverlay onAccept={handlePDPAAccept} language={language} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* ส่วนที่แก้ไขจาก <div className="text-4xl">🏫</div> */}
              <div 
                className="flex-shrink-0 cursor-pointer select-none" 
                onClick={handleLogoClick}
              >
                <img
                  src="/polylogo.png"
                  alt="Lanna Poly Logo"
                  className="w-16 h-16 object-contain drop-shadow-md transition-transform duration-75 active:scale-90"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา เชียงใหม่
                </h1>
                <p className="text-blue-100 text-sm">
                  Lanna Polytechnic Chiangmai Technological College - Interactive Digital Signage
                </p>
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex gap-2">
              {['th', 'en', 'zh', 'ko'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${language === lang
                      ? 'bg-white text-blue-600'
                      : 'bg-blue-500 text-white hover:bg-blue-400'
                    }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Face Analysis */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                {language === 'th' && 'การวิเคราะห์'}
                {language === 'en' && 'Analysis'}
                {language === 'zh' && '分析'}
                {language === 'ko' && '분석'}
              </h2>

              <FaceAnalyzer
                onAnalysisUpdate={handleAnalysisUpdate}
                onPresenceChange={handlePresenceChange}
              />

              {/* User Profile Display */}
              {userProfile && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {language === 'th' && 'ข้อมูลผู้ใช้'}
                    {language === 'en' && 'User Profile'}
                    {language === 'zh' && '用户信息'}
                    {language === 'ko' && '사용자 정보'}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {language === 'th' && 'เพศ:'}
                        {language === 'en' && 'Gender:'}
                        {language === 'zh' && '性别:'}
                        {language === 'ko' && '성별:'}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {userProfile.gender === 'male'
                          ? (language === 'th' ? 'ชาย' : language === 'en' ? 'Male' : language === 'zh' ? '男' : '남성')
                          : (language === 'th' ? 'หญิง' : language === 'en' ? 'Female' : language === 'zh' ? '女' : '여성')
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {language === 'th' && 'อายุ:'}
                        {language === 'en' && 'Age:'}
                        {language === 'zh' && '年龄:'}
                        {language === 'ko' && '나이:'}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {userProfile.age} {language === 'th' ? 'ปี' : language === 'en' ? 'years' : language === 'zh' ? '岁' : '세'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {language === 'th' && 'ความมั่นใจ:'}
                        {language === 'en' && 'Confidence:'}
                        {language === 'zh' && '置信度:'}
                        {language === 'ko' && '신뢰도:'}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {Math.round(userProfile.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Presence Indicator */}
              <div className="mt-4 flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${isPresent ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">
                  {isPresent
                    ? (language === 'th' ? 'ตรวจพบผู้ใช้' : language === 'en' ? 'User Detected' : language === 'zh' ? '检测到用户' : '사용자 감지됨')
                    : (language === 'th' ? 'ไม่พบผู้ใช้' : language === 'en' ? 'No User' : language === 'zh' ? '未检测到用户' : '사용자 없음')
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Main Content - News Feed */}
          <div className="lg:col-span-2">
            <NewsFeed userProfile={userProfile} language={language} />
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <TiewSonAI
        language={language}
        onLanguageChange={setLanguage}
        userProfile={userProfile}
      />

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">
            © 2025 วิทยาลัยเทคโนโลยีโปลิเทคนิคลานนาเชียงใหม่ | Lanna Polytechnic Chiangmai Technological College
          </p>
          <p className="text-xs text-gray-400 mt-2">
            ข้อมูลทั้งหมดได้รับการคุ้มครองตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
          </p>
          <p className="text-xs text-gray-500 mt-1">
            กด Alt+A เพื่อเข้าสู่โหมด Admin
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;