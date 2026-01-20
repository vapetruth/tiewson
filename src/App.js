// App.js
import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'lucide-react';
import PDPAOverlay from './PDPAOverlay.js';
import FullscreenNewsCarousel from './FullscreenNewsCarousel.js';
import FaceAnalyzerPopup from './FaceAnalyzerPopup.js';
import PersonalizedNewsView from './PersonalizedNewsView.js';
import TiewSonAI from './TiewSonAI.js';
import AdminCMS from './AdminCMS.js';

function App() {
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [language, setLanguage] = useState('th');
  const [userProfile, setUserProfile] = useState(null);
  const [showFaceAnalyzer, setShowFaceAnalyzer] = useState(false);
  const [mode, setMode] = useState('carousel'); // 'carousel' or 'personalized'
  const [showAdmin, setShowAdmin] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  // Logo click handler for admin access
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
  };

  // Handle face detection trigger
  const handleFaceDetected = () => {
    setShowFaceAnalyzer(true);
  };

  // Handle face analysis completion
  const handleAnalysisComplete = (profile) => {
    setUserProfile(profile);
    setShowFaceAnalyzer(false);
    setMode('personalized');
  };

  // Handle no presence (return to carousel)
  const handleNoPresence = () => {
    setMode('carousel');
    setUserProfile(null);
  };

  // Admin access (Alt+A)
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
    <>
    {/* Logo - วางไว้นอก component */}
    <div 
      className="fixed top-6 left-6 z-50 cursor-pointer select-none"
      onClick={handleLogoClick}
    >
      <img
        src="/polylogo.png"
        alt="Lanna Poly Logo"
        className="w-20 h-20 object-contain drop-shadow-2xl transition-transform duration-75 active:scale-90 hover:scale-105"
      />
    </div>
      {/* Language Selector - Always visible */}
      <div className="fixed top-6 right-6 z-30 flex gap-2">
        {['th', 'en', 'zh', 'ko'].map(lang => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-4 py-2 rounded-lg font-semibold transition shadow-lg ${
              language === lang
                ? 'bg-blue-600 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-white'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {mode === 'carousel' ? (
        <FullscreenNewsCarousel 
          language={language}
          onLogoClick={handleLogoClick}  // เพิ่มบรรทัดนี้
        />
      ) : (
        <PersonalizedNewsView
          userProfile={userProfile}
          language={language}
          onNoPresence={handleNoPresence}
        />
      )}

      {/* Face Analyzer Popup */}
      {showFaceAnalyzer && (
        <FaceAnalyzerPopup
          onClose={() => setShowFaceAnalyzer(false)}
          onAnalysisComplete={handleAnalysisComplete}
          language={language}
        />
      )}

      {/* Tiew Son AI - Always floating */}
      <TiewSonAI language={language} onLanguageChange={setLanguage} />

      {/* Trigger Button for Face Detection */}
      {mode === 'carousel' && (
        <button
          onClick={handleFaceDetected}
          className="fixed bottom-6 left-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-105 z-30 flex items-center gap-2"
        >
          <Camera className="w-5 h-5" />
          <span className="font-semibold">
            {language === 'th' ? 'เริ่มวิเคราะห์' : 
             language === 'en' ? 'Start Analysis' :
             language === 'zh' ? '开始分析' : 
             '분석 시작'}
          </span>
        </button>
      )}
    </>
  );
}

export default App;