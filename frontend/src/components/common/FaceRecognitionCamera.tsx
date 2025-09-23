import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, Check, RotateCcw } from 'lucide-react';

interface FaceRecognitionCameraProps {
  onCapture: (imagePath: string) => void;
  onClose: () => void;
  purpose: 'enrollment' | 'attendance';
}

const FaceRecognitionCamera: React.FC<FaceRecognitionCameraProps> = ({
  onCapture,
  onClose,
  purpose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsStreaming(false);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Start countdown
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(countdownInterval);
          performCapture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const performCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
    }
  };

  const confirmCapture = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      if (purpose === 'enrollment') {
        // For enrollment, continue capturing more images
        return;
      } else {
        // For attendance, close after one capture
        onClose();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {purpose === 'enrollment' ? 'Face Enrollment' : 'Face Recognition Attendance'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-6">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-80 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Face detection overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-4 border-blue-500 rounded-full opacity-50"></div>
                </div>

                {/* Countdown overlay */}
                {countdown && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-6xl font-bold text-white animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-sm bg-black bg-opacity-50 rounded-lg px-4 py-2">
                    Position your face within the circle and click capture
                  </p>
                </div>
              </>
            ) : (
              <div className="relative">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute bottom-4 left-4 right-4 text-center">
                  <p className="text-white text-sm bg-black bg-opacity-50 rounded-lg px-4 py-2">
                    Review your photo
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4">
            {!capturedImage ? (
              <button
                onClick={captureImage}
                disabled={!isStreaming || countdown !== null}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="h-5 w-5" />
                <span>Capture</span>
              </button>
            ) : (
              <>
                <button
                  onClick={retakePhoto}
                  className="flex items-center space-x-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-6 rounded-lg transition-all"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Retake</span>
                </button>
                <button
                  onClick={confirmCapture}
                  className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all"
                >
                  <Check className="h-5 w-5" />
                  <span>Confirm</span>
                </button>
              </>
            )}
          </div>

          {purpose === 'enrollment' && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Capture multiple angles for better recognition accuracy
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FaceRecognitionCamera;