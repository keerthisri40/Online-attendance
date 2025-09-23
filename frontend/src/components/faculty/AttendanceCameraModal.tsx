// frontend/src/components/faculty/AttendanceCameraModal.tsx
import React, { useRef, useEffect, useState } from 'react';
import { X, CheckCircle, UserX, Info } from 'lucide-react';

interface Props {
  sessionName: string;
  onClose: () => void;
}

const AttendanceCameraModal: React.FC<Props> = ({ sessionName, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error'; text: string }>({
    type: 'info',
    text: 'Initializing Camera...',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setStatus({ type: 'info', text: 'Ready to scan for faces.' });
      } catch (err) {
        setStatus({ type: 'error', text: 'Could not access webcam.' });
      }
    };
    startWebcam();

    const interval = setInterval(scanFace, 3000);

    return () => {
      clearInterval(interval);
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const scanFace = async () => {
    if (!videoRef.current || isProcessing || document.hidden) return;

    setIsProcessing(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setIsProcessing(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('image', blob, 'scan.jpg');
      formData.append('sessionName', sessionName);

      try {
        const response = await fetch('http://localhost:5000/api/mark-attendance-session', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.status === 'success') setStatus({ type: 'success', text: data.message });
        else setStatus({ type: 'error', text: data.message });
      } catch (err) {
        setStatus({ type: 'error', text: 'Could not connect to server.' });
      } finally {
        setTimeout(() => {
          setStatus({ type: 'info', text: 'Ready to scan for faces.' });
          setIsProcessing(false);
        }, 3000);
      }
    }, 'image/jpeg');
  };

  const statusColors = {
    info: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Marking Attendance: {sessionName}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X /></button>
        </div>
        <div className="aspect-video bg-gray-900 rounded-md overflow-hidden relative">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          {isProcessing && <div className="absolute inset-0 border-4 border-yellow-400 rounded-md animate-pulse"></div>}
        </div>
        <div className={`mt-4 p-4 rounded-md flex items-center justify-center text-lg font-semibold ${statusColors[status.type]}`}>
          {status.type === 'success' ? <CheckCircle className="mr-2" /> : status.type === 'error' ? <UserX className="mr-2" /> : <Info className="mr-2" />}
          {status.text}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCameraModal;