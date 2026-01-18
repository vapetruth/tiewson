import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Play, Image as ImageIcon, Calendar, Users, X, ExternalLink } from 'lucide-react';

const NewsFeed = ({ userProfile, language }) => {
    const [newsItems, setNewsItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchNews();
    }, [userProfile?.gender, userProfile?.age]);

    const convertUrl = (url, type) => {
        if (!url || !url.includes('drive.google.com')) return url;
        const fileId = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1] || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
        if (!fileId) return url;
        if (type === 'video') return `https://drive.google.com/file/d/${fileId}/preview`;
        return `https://drive.google.com/thumbnail?sz=w1000&id=${fileId}`;
    };

    const fetchNews = async () => {
        try {
            setLoading(true);
            const newsRef = collection(db, 'news');
            const q = query(newsRef, orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (userProfile) {
                    const matchesGender = !data.targetGender || data.targetGender === 'all' || data.targetGender === userProfile.gender;
                    const matchesAge = !data.targetAgeMin || (userProfile.age >= data.targetAgeMin && userProfile.age <= (data.targetAgeMax || 100));
                    if (matchesGender && matchesAge) items.push({ id: doc.id, ...data });
                } else {
                    items.push({ id: doc.id, ...data });
                }
            });
            setNewsItems(items);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- ส่วนที่ปรับปรุงเรื่องภาษา ---
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

    const getUILabel = () => {
        const labels = {
            th: 'ข่าวสารและกิจกรรม',
            en: 'News & Activities',
            zh: '新聞與活動',
            ko: '뉴스 및 활동'
        };
        return labels[language] || labels.en;
    };

    const getCloseBtnLabel = () => {
        const labels = {
            th: 'ปิดหน้าต่าง',
            en: 'Close',
            zh: '關閉',
            ko: '닫기'
        };
        return labels[language] || labels.en;
    };
    // ----------------------------

    if (loading) return (
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="bg-gray-200 h-80 rounded-xl" />)}
        </div>
    );

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
                {getUILabel()}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all cursor-pointer transform hover:-translate-y-1"
                    >
                        <div className="relative h-48 bg-gray-100">
                            {item.mediaType === 'video' ? (
                                <div className="w-full h-full flex items-center justify-center bg-black">
                                    <Play className="w-12 h-12 text-white opacity-50" />
                                </div>
                            ) : (
                                <img src={convertUrl(item.mediaUrl, 'image')} alt="" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="p-5">
                            <h3 className="text-xl font-bold mb-2 line-clamp-2">{getTitle(item)}</h3>
                            <p className="text-gray-600 text-sm line-clamp-3">{getDescription(item)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* FULLSCREEN POPUP MODAL */}
            {selectedItem && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-95 z-[999] flex flex-col items-center justify-center p-4 md:p-10"
                    onClick={() => setSelectedItem(null)}
                >
                    <button className="absolute top-6 right-6 text-white hover:text-red-500 transition-colors z-[1001]">
                        <X size={40} />
                    </button>

                    <div 
                        className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()}
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
                                    <Calendar size={14}/> {selectedItem.createdAt?.seconds ? new Date(selectedItem.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </span>
                                <span className="capitalize px-2 py-1 bg-blue-50 text-blue-600 rounded">
                                    {selectedItem.targetGender || 'All'}
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
                                    {getCloseBtnLabel()}
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

export default NewsFeed;