// TiewSonAI.js - Production Ready Version
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, Volume2, VolumeX, Globe } from 'lucide-react';

// ========================== CONFIGURATIONS ==========================
const SYSTEM_PROMPTS = {
    th: `คุณคือ "น้องทิวสน" มาสคอตผู้หญิงของวิทยาลัยเทคโนโลยีโปลิเทคนิคลานนา ตอบเป็นภาษาไทยเท่านั้น สุภาพ เป็นกันเอง ตอบสั้นๆ 3-4 ประโยค`,

    en: `You are "Tiew Son", the female mascot of Lanna Polytechnic College. 
       CRITICAL: You MUST answer in ENGLISH language only. 
       Keep it friendly and concise (3-4 sentences).`,

    zh: `你是"小松鼠"，兰纳理工学院的吉祥物。
       重要提示：你必须仅且只用“中文”回答。
       回答要友好且简洁（最多3-4句话）。`,

    ko: `당신은 "띠우손"입니다. 란나 폴리테크닉 대학의 마스코트입니다.
       중요: 반드시 "한국어"로만 답변하십시오.
       친근하고 간결하게 답변하세요 (최대 3-4문장).`
};

const GREETINGS = {
    th: 'สวัสดีค่ะ! น้องทิวสนยินดีต้อนรับค่ะ มีอะไรให้ช่วยไหมคะ?',
    en: 'Hello! I\'m Tiew Son. How can I help you?',
    zh: '你好！我是小松鼠。我能帮你什么？',
    ko: '안녕하세요! 띠우손입니다. 무엇을 도와드릴까요?'
};

const FALLBACK_RESPONSES = {
    th: {
        'สาขา': 'เรามีหลายสาขาค่ะ เช่น ช่างยนต์ คอมพิวเตอร์ บัญชี โรงแรม และท่องเที่ยว สนใจสาขาไหนคะ?',
        'รับสมัคร': 'เปิดรับสมัครช่วงมีนาคม-พฤษภาคมค่ะ สมัครได้ที่วิทยาลัยหรือออนไลน์ค่ะ',
        'default': 'น้องทิวสนพร้อมช่วยเหลือค่ะ ถามเรื่องสาขาหรือการสมัครเรียนได้เลยนะคะ'
    },
    en: { 'default': 'I\'m here to help! Ask me about courses or admission.' },
    zh: { 'default': '我在这里帮助你！问我关于课程或入学的问题。' },
    ko: { 'default': '도와드리겠습니다! 과정이나 입학에 대해 물어보세요.' }
};

const WAKE_WORDS = ['สวัสดีทิวสน', 'สวัสดีคิวสน', 'สวัสดีผิวสน', 'ทิวสน', 'tiewson'];

// ========================== MAIN COMPONENT ==========================
const TiewSonAI = ({ language, onLanguageChange, userProfile }) => {
    // --- States ---
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isWakeWordListening, setIsWakeWordListening] = useState(false);
    const [mascotAnimation, setMascotAnimation] = useState('idle'); // idle, bounce, talking

    // --- Refs ---
    const recognitionRef = useRef(null);
    const wakeWordRecognitionRef = useRef(null);
    const messagesEndRef = useRef(null);
    const utteranceRef = useRef(null);
    const isRecognitionActive = useRef(false);
    const isWakeWordActive = useRef(false);
    const isMobileDevice = useRef(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // ========================== SPEECH SYNTHESIS (iOS/Android Compatible) ==========================
    const speak = useCallback((text) => {
        if (!('speechSynthesis' in window)) return;

        // iOS Safari Requirement: Must stop all speech first
        window.speechSynthesis.cancel();
        setIsSpeaking(false);

        // iOS Safari: Requires user interaction first time
        // This callback is already triggered by user action (button/voice)

        // Delay for iOS compatibility
        setTimeout(() => {
            try {
                // Split long text for iOS (iOS has character limit ~250 chars per utterance)
                const maxLength = 200;
                const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
                let chunks = [];
                let currentChunk = '';

                sentences.forEach(sentence => {
                    if ((currentChunk + sentence).length > maxLength) {
                        if (currentChunk) chunks.push(currentChunk.trim());
                        currentChunk = sentence;
                    } else {
                        currentChunk += sentence;
                    }
                });
                if (currentChunk) chunks.push(currentChunk.trim());

                // If text is short, use single utterance
                if (text.length <= maxLength) {
                    chunks = [text];
                }

                const langCodes = { th: 'th-TH', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR' };
                let currentIndex = 0;

                const speakChunk = () => {
                    if (currentIndex >= chunks.length) {
                        setIsSpeaking(false);
                        setMascotAnimation('idle');
                        return;
                    }

                    const utterance = new SpeechSynthesisUtterance(chunks[currentIndex]);
                    utterance.lang = langCodes[language] || 'th-TH';
                    utterance.rate = 1.05;
                    utterance.pitch = 1.25;
                    utterance.volume = 1.0;

                    utterance.onstart = () => {
                        setIsSpeaking(true);
                        setMascotAnimation('talking');
                    };

                    utterance.onend = () => {
                        currentIndex++;
                        if (currentIndex < chunks.length) {
                            // Small delay between chunks for natural flow
                            setTimeout(speakChunk, 100);
                        } else {
                            setIsSpeaking(false);
                            setMascotAnimation('idle');
                            utteranceRef.current = null;
                        }
                    };

                    utterance.onerror = (e) => {
                        console.warn('TTS Error:', e.error);
                        // Try next chunk on error
                        currentIndex++;
                        if (currentIndex < chunks.length) {
                            setTimeout(speakChunk, 500);
                        } else {
                            setIsSpeaking(false);
                            setMascotAnimation('idle');
                            utteranceRef.current = null;
                        }
                    };

                    utteranceRef.current = utterance;
                    window.speechSynthesis.speak(utterance);
                };

                // Start speaking
                speakChunk();

                // iOS/Safari failsafe: Force stop after 60 seconds
                if (isMobileDevice.current) {
                    setTimeout(() => {
                        if (window.speechSynthesis.speaking) {
                            window.speechSynthesis.cancel();
                            setIsSpeaking(false);
                            setMascotAnimation('idle');
                        }
                    }, 60000);
                }

            } catch (error) {
                console.error('TTS Init Error:', error);
                setIsSpeaking(false);
                setMascotAnimation('idle');
            }
        }, isMobileDevice.current ? 200 : 100);
    }, [language]);

    const stopSpeaking = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        setIsSpeaking(false);
        setMascotAnimation('idle');
        utteranceRef.current = null;
    }, []);

    // ========================== iOS TTS INITIALIZATION ==========================
    // iOS requires TTS to be initialized on first user interaction
    useEffect(() => {
        if (isMobileDevice.current && 'speechSynthesis' in window) {
            // Create a silent utterance to initialize TTS on iOS
            const initTTS = () => {
                const utterance = new SpeechSynthesisUtterance('');
                utterance.volume = 0;
                window.speechSynthesis.speak(utterance);
                window.speechSynthesis.cancel();

                // Remove listener after first init
                document.removeEventListener('touchstart', initTTS);
                document.removeEventListener('click', initTTS);
            };

            // Wait for first user interaction
            document.addEventListener('touchstart', initTTS, { once: true });
            document.addEventListener('click', initTTS, { once: true });

            return () => {
                document.removeEventListener('touchstart', initTTS);
                document.removeEventListener('click', initTTS);
            };
        }
    }, []);

    // ========================== SPEECH RECOGNITION SETUP ==========================
    useEffect(() => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.warn('Speech Recognition not supported');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        // Wake Word Recognition
        try {
            const wakeWord = new SpeechRecognition();
            wakeWord.continuous = true;
            wakeWord.interimResults = false;
            wakeWord.lang = 'th-TH';

            wakeWord.onstart = () => {
                isWakeWordActive.current = true;
                setIsWakeWordListening(true);
            };

            wakeWord.onend = () => {
                isWakeWordActive.current = false;
                setIsWakeWordListening(false);
            };

            wakeWord.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();

                if (WAKE_WORDS.some(word => transcript.includes(word))) {
                    console.log('✅ Wake word detected:', transcript);
                    setMascotAnimation('bounce');
                    setTimeout(() => setMascotAnimation('idle'), 1000);

                    setIsExpanded(true);
                    const greeting = GREETINGS[language];
                    setMessages([{ role: 'assistant', content: greeting }]);
                    speak(greeting);

                    // Stop wake word listening
                    wakeWord.stop();
                }
            };

            wakeWord.onerror = (e) => {
                if (e.error !== 'no-speech' && e.error !== 'aborted') {
                    console.warn('Wake word error:', e.error);
                }
            };

            wakeWordRecognitionRef.current = wakeWord;

        } catch (error) {
            console.error('Wake word init failed:', error);
        }

        // Chat Recognition
        try {
            const chatRecognition = new SpeechRecognition();
            chatRecognition.continuous = false;
            chatRecognition.interimResults = false;

            chatRecognition.onstart = () => {
                isRecognitionActive.current = true;
                setIsListening(true);
            };

            chatRecognition.onend = () => {
                isRecognitionActive.current = false;
                setIsListening(false);
            };

            chatRecognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                handleSendMessage(transcript);
            };

            chatRecognition.onerror = (e) => {
                if (e.error !== 'no-speech' && e.error !== 'aborted') {
                    console.warn('Recognition error:', e.error);
                }
                setIsListening(false);
                isRecognitionActive.current = false;
            };

            recognitionRef.current = chatRecognition;

        } catch (error) {
            console.error('Chat recognition init failed:', error);
        }

        return () => {
            wakeWordRecognitionRef.current?.stop();
            recognitionRef.current?.stop();
            stopSpeaking();
        };
    }, [language, speak, stopSpeaking]);

    // ========================== WAKE WORD CONTROL ==========================
    useEffect(() => {
        const manageWakeWord = () => {
            if (isExpanded || isListening) {
                // Stop wake word when chat is active
                if (isWakeWordActive.current) {
                    wakeWordRecognitionRef.current?.stop();
                }
            } else {
                // Start wake word when idle
                if (!isWakeWordActive.current && wakeWordRecognitionRef.current) {
                    setTimeout(() => {
                        try {
                            wakeWordRecognitionRef.current?.start();
                        } catch (e) {
                            if (e.message !== 'Failed to execute \'start\' on \'SpeechRecognition\': recognition has already started.') {
                                console.warn('Wake word start failed:', e.message);
                            }
                        }
                    }, 500);
                }
            }
        };

        manageWakeWord();
    }, [isExpanded, isListening]);

    // ========================== HANDLERS ==========================
    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            stopSpeaking();

            setTimeout(() => {
                try {
                    const langCodes = { th: 'th-TH', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR' };
                    if (recognitionRef.current) {
                        recognitionRef.current.lang = langCodes[language] || 'th-TH';
                        recognitionRef.current.start();
                    }
                } catch (e) {
                    if (!e.message.includes('already started')) {
                        console.error('Mic start failed:', e);
                    }
                }
            }, 200);
        }
    }, [isListening, language, stopSpeaking]);

    const handleSendMessage = useCallback(async (text = inputText) => {
        if (!text?.trim() || isProcessing) return;

        setMessages(prev => [...prev, { role: 'user', content: text }]);
        setInputText('');
        setIsProcessing(true);
        setMascotAnimation('bounce');

        try {
            const GEMINI_API_KEY = 'AIzaSyADGdTkXOvwWQG33F-Yt77UE0f_KgzgV90';
            const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

            const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        //parts: [{ text: `${SYSTEM_PROMPTS[language]}\n\nคำถาม: ${text}` }]
                        parts: [{
                            text: `Instruction: ${SYSTEM_PROMPTS[language]}\n
                                    User Question: ${text}\n
                                    Response Language: ${language.toUpperCase()}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 300, // เพิ่มเป็น 300 เพื่อให้ตอบครบ
                        topP: 0.8,
                        topK: 40
                    }
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', response.status, errorText);
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // Extract text with better error handling
            let aiResponse = '';

            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];

                if (candidate.content && candidate.content.parts) {
                    // Combine all text parts
                    aiResponse = candidate.content.parts
                        .filter(part => part.text)
                        .map(part => part.text)
                        .join(' ')
                        .trim();
                }
            }

            if (!aiResponse) {
                console.warn('Empty AI response, using fallback');
                throw new Error('Empty response from API');
            }

            console.log('AI Response:', aiResponse); // Debug log

            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

            // iOS: Ensure speak is called after user interaction context
            setTimeout(() => speak(aiResponse), 100);

        } catch (error) {
            console.warn('Using fallback response:', error.message);

            const fallbacks = FALLBACK_RESPONSES[language] || FALLBACK_RESPONSES.th;
            const lowerText = text.toLowerCase();
            const matchedKey = Object.keys(fallbacks).find(key =>
                key !== 'default' && lowerText.includes(key)
            );

            const response = fallbacks[matchedKey] || fallbacks.default;
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);

            // iOS: Ensure speak is called after user interaction context
            setTimeout(() => speak(response), 100);

        } finally {
            setIsProcessing(false);
            setTimeout(() => setMascotAnimation('idle'), 1000);
        }
    }, [inputText, isProcessing, language, speak]);

    // ========================== AUTO SCROLL ==========================
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // ========================== LANGUAGE CHANGE HANDLER ==========================
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // Update recognition language when language changes
        if (recognitionRef.current) {
            const langCodes = { th: 'th-TH', en: 'en-US', zh: 'zh-CN', ko: 'ko-KR' };
            recognitionRef.current.lang = langCodes[language] || 'th-TH';
        }
    }, [language]);

    // ========================== RENDER ==========================
    return (
        <>
            {/* ========== FLOATING MASCOT ========== */}
            {!isExpanded && (
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        onClick={() => {
                            setIsExpanded(true);
                            setMascotAnimation('bounce');
                            setTimeout(() => setMascotAnimation('idle'), 1000);
                        }}
                        className="relative group"
                        aria-label="Open Tiew Son Assistant"
                    >
                        {/* Mascot Image */}
                        <img
                            src="/tiewson.png"
                            alt="น้องทิวสน"
                            className={`w-32 h-32 object-cover rounded-full shadow-2xl border-4 border-white transition-all duration-300 ${mascotAnimation === 'bounce' ? 'animate-bounce' :
                                    mascotAnimation === 'talking' ? 'scale-105' :
                                        'hover:scale-110'
                                }`}
                            style={{
                                animation: mascotAnimation === 'talking' ? 'pulse 1s ease-in-out infinite' : undefined
                            }}
                        />

                        {/* Tooltip */}
                        <div className="absolute -top-20 right-0 bg-white px-4 py-3 rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                            <p className="text-sm text-gray-800 font-semibold">
                                {language === 'th' && '🎤 พูดว่า "สวัสดีทิวสน"'}
                                {language === 'en' && '🎤 Say "Hello Tiewson"'}
                                {language === 'zh' && '🎤 说"你好小松鼠"'}
                                {language === 'ko' && '🎤 "안녕 띠우손" 말하기'}
                            </p>
                            <div className="absolute bottom-0 right-8 transform translate-y-1/2 rotate-45 w-3 h-3 bg-white"></div>
                        </div>

                        {/* Status Indicators */}
                        {isWakeWordListening && (
                            <>
                                <div className="absolute inset-0 rounded-full bg-green-400 opacity-20 animate-ping"></div>
                                <div className="absolute -top-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs animate-pulse">🎤</span>
                                </div>
                            </>
                        )}

                        {isListening && (
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}

                        {isSpeaking && (
                            <div className="absolute -top-1 -right-1 w-7 h-7 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
                        )}
                    </button>

                    {/* Listening Badge */}
                    {isWakeWordListening && (
                        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-4 py-1.5 rounded-full shadow-lg animate-pulse whitespace-nowrap">
                            🎤 กำลังฟัง...
                        </div>
                    )}
                </div>
            )}

            {/* ========== CHAT WINDOW ========== */}
            {isExpanded && (
                <div className="fixed bottom-6 right-6 w-96 bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-blue-100 z-40 animate-slideIn">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src="/tiewson.png"
                                alt="น้องทิวสน"
                                className={`w-12 h-12 rounded-full border-2 border-white object-cover ${isSpeaking ? 'animate-pulse' : ''
                                    }`}
                            />
                            <div>
                                <h3 className="text-white font-bold">น้องทิวสน</h3>
                                <p className="text-blue-100 text-xs">Lanna Polytechnic Assistant</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Language Switcher */}
                            <button
                                onClick={() => {
                                    const langs = ['th', 'en', 'zh', 'ko'];
                                    const nextLang = langs[(langs.indexOf(language) + 1) % langs.length];
                                    onLanguageChange(nextLang);
                                }}
                                className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
                                aria-label="Change language"
                            >
                                <Globe className="w-5 h-5" />
                            </button>

                            {/* Close Button */}
                            <button
                                onClick={() => {
                                    setIsExpanded(false);
                                    stopSpeaking();
                                    recognitionRef.current?.stop();
                                }}
                                className="text-white hover:bg-blue-800 p-2 rounded-lg transition"
                                aria-label="Close chat"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="h-80 overflow-y-auto p-4 bg-gray-50">
                        {/* iOS Audio Unlock Notice */}
                        {isMobileDevice.current && messages.length === 1 && (
                            <div className="mb-3 text-center">
                                <div className="inline-block bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded-lg">
                                    🔊 หาก iOS ไม่มีเสียง กรุณาคลิกปุ่มลำโพงเพื่อเปิดเสียง
                                </div>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                            >
                                <div
                                    className={`inline-block max-w-[80%] p-3 rounded-2xl whitespace-pre-wrap ${msg.role === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-800 shadow-md'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {/* Loading Indicator */}
                        {isProcessing && (
                            <div className="text-left mb-3">
                                <div className="inline-block bg-white p-3 rounded-2xl shadow-md">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Controls */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex gap-2">
                            {/* Microphone */}
                            <button
                                onClick={toggleListening}
                                className={`p-3 rounded-xl transition-all ${isListening
                                        ? 'bg-red-500 text-white scale-110'
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                    }`}
                                disabled={isProcessing}
                                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            {/* Text Input */}
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                placeholder={language === 'th' ? 'พิมพ์ข้อความ...' : 'Type message...'}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                disabled={isProcessing}
                            />

                            {/* Send Button */}
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputText.trim() || isProcessing}
                                className="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                aria-label="Send message"
                            >
                                <Send className="w-5 h-5" />
                            </button>

                            {/* Speaker Toggle */}
                            <button
                                onClick={() => {
                                    if (isSpeaking) {
                                        stopSpeaking();
                                    } else {
                                        // Test TTS for iOS
                                        const testMsg = language === 'th' ? 'ทดสอบเสียง' : 'Testing audio';
                                        speak(testMsg);
                                    }
                                }}
                                className={`p-3 rounded-xl transition-all ${isSpeaking
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                aria-label={isSpeaking ? 'Stop speaking' : 'Test speaker'}
                                title={isSpeaking ? 'หยุดพูด' : 'ทดสอบเสียง'}
                            >
                                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TiewSonAI;