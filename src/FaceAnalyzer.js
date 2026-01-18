// FaceAnalyzer.js v3
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

const FaceAnalyzer = ({ onAnalysisUpdate, onPresenceChange }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const lastDetectionTime = useRef(Date.now());
  const presenceCheckInterval = useRef(null);

  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        
        setModelsLoaded(true);
        console.log('✅ Face-API models loaded successfully');
      } catch (err) {
        console.error('Error loading models:', err);
        setError('ไม่สามารถโหลดโมเดล AI ได้');
      }
    };

    loadModels();
  }, []);

  // Start webcam
  useEffect(() => {
    if (!modelsLoaded) return;

    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            facingMode: 'user'
          }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsLoading(false);
          };
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการใช้งานกล้อง');
        setIsLoading(false);
      }
    };

    startVideo();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded]);

  // Face detection and analysis
  useEffect(() => {
    if (!modelsLoaded || isLoading) return;

    const detectFaces = async () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (canvas) {
          const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight
          };
          faceapi.matchDimensions(canvas, displaySize);
        }

        try {
          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withAgeAndGender();

          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const resizedDetections = faceapi.resizeResults(detections, {
              width: video.videoWidth,
              height: video.videoHeight
            });
            
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
          }

          if (detections && detections.length > 0) {
            lastDetectionTime.current = Date.now();
            onPresenceChange(true);

            // Use the first detected face
            const detection = detections[0];
            const { age, gender, genderProbability } = detection;

            // Determine gender with confidence threshold
            const genderResult = genderProbability > 0.7 ? gender : 'unknown';

            onAnalysisUpdate({
              gender: genderResult,
              age: Math.round(age),
              confidence: genderProbability,
              detected: true
            });
          }
        } catch (err) {
          console.error('Detection error:', err);
        }
      }
    };

    const detectionInterval = setInterval(detectFaces, 1000);

    // Presence check (30 seconds timeout)
    presenceCheckInterval.current = setInterval(() => {
      const timeSinceLastDetection = Date.now() - lastDetectionTime.current;
      if (timeSinceLastDetection > 30000) {
        onPresenceChange(false);
      }
    }, 1000);

    return () => {
      clearInterval(detectionInterval);
      if (presenceCheckInterval.current) {
        clearInterval(presenceCheckInterval.current);
      }
    };
  }, [modelsLoaded, isLoading, onAnalysisUpdate, onPresenceChange]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl">
        <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
        <p className="text-red-700 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-xl z-10">
          <div className="text-white text-center">
            <Camera className="w-12 h-12 mx-auto mb-3 animate-pulse" />
            <p>กำลังเปิดกล้อง...</p>
          </div>
        </div>
      )}
      
      <div className="relative rounded-xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
        <Camera className="w-4 h-4" />
        <span>กล้องกำลังทำงาน</span>
      </div>
    </div>
  );
};

export default FaceAnalyzer;