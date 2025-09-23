// frontend/src/components/admin/EnrollStudent.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, AlertTriangle, UserPlus, ArrowLeft } from 'lucide-react';

// Define the structure of a student object
interface Student {
    id: number;
    firstName: string;
    lastName: string;
    registrationNumber: string;
    department: string;
}

interface EnrollStudentProps {
    onBack: () => void;
}

const EnrollStudent: React.FC<EnrollStudentProps> = ({ onBack }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    // 1. The canvasRef is created here
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const IMAGES_NEEDED = 5;

    // (All your functions like useEffect, handleCapture, handleSubmit remain the same)
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/students-without-faces');
                if (!response.ok) throw new Error('Failed to fetch students from the server.');
                const data: Student[] = await response.json();
                setStudents(data);
            } catch (err: any) {
                setMessage({ type: 'error', text: err.message });
            }
        };
        fetchStudents();
    }, []);

    const startWebcam = async () => {
        setIsCapturing(true);
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                setMessage({ type: 'error', text: 'Could not access webcam. Please enable camera permissions.' });
                setIsCapturing(false);
            }
        }, 100);
    };

    const handleCapture = () => {
        // This check prevents the error
        if (videoRef.current && canvasRef.current && capturedImages.length < IMAGES_NEEDED) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            setCapturedImages([...capturedImages, canvas.toDataURL('image/jpeg')]);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (capturedImages.length < IMAGES_NEEDED || !selectedStudent) return;
        
        setIsLoading(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('name', `${selectedStudent.firstName} ${selectedStudent.lastName}`);
        formData.append('reg_no', selectedStudent.registrationNumber);
        
        for (let i = 0; i < capturedImages.length; i++) {
            const blob = await (await fetch(capturedImages[i])).blob();
            formData.append('images[]', blob, `capture_${i}.jpg`);
        }

        try {
            const response = await fetch('http://localhost:5000/api/register-face', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            setMessage({ type: 'success', text: data.message });
            setSelectedStudent(null);
            setCapturedImages([]);
            setIsCapturing(false);
            const updatedStudents = students.filter(s => s.id !== selectedStudent.id);
            setStudents(updatedStudents);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-gray-500 hover:text-gray-800 mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">Enroll Student</h2>
            </div>
            
            {/* ... (message and form JSX) ... */}
            {message && (
                <div className={`p-4 mb-4 rounded-md flex items-center ${
                    message.type === 'success' ? 'bg-green-100 text-green-800' : 
                    message.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {message.type === 'success' ? <CheckCircle className="mr-2" /> : <AlertTriangle className="mr-2" />}
                    {message.text}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                    <div className="p-6 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Select Student</h3>
                        <select
                            value={selectedStudent?.id || ''}
                            onChange={(e) => {
                                const student = students.find(s => s.id === parseInt(e.target.value));
                                setSelectedStudent(student || null);
                            }}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="" disabled>Select a student to enroll</option>
                            {students.map(student => (
                                <option key={student.id} value={student.id}>
                                    {student.firstName} {student.lastName} - ({student.registrationNumber})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="p-6 border rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">Capture Facial Data</h3>
                        <p className="text-sm text-gray-500 mb-4">Capture at least {IMAGES_NEEDED} different facial angles for better recognition accuracy.</p>
                        <button type="button" onClick={startWebcam} disabled={!selectedStudent || isCapturing} className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 flex items-center justify-center">
                            <Camera className="mr-2" /> Start Face Capture
                        </button>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${(capturedImages.length / IMAGES_NEEDED) * 100}%` }}></div>
                        </div>
                        <p className="text-center text-sm mt-1 text-gray-600">{IMAGES_NEEDED - capturedImages.length} more images needed</p>
                    </div>
                </div>

                {isCapturing && (
                    <div className="mt-8 p-6 border rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Live Camera</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="aspect-video bg-gray-900 rounded-md overflow-hidden">
                                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                                {/* 2. This hidden canvas MUST be here for the ref to work */}
                                <canvas ref={canvasRef} className="hidden"></canvas>
                            </div>
                            <div className="flex flex-col items-center">
                                <button type="button" onClick={handleCapture} disabled={capturedImages.length >= IMAGES_NEEDED} className="w-full mb-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                                    Capture Image ({capturedImages.length}/{IMAGES_NEEDED})
                                </button>
                                <div className="grid grid-cols-5 gap-2 w-full">
                                    {capturedImages.map((src, index) => <img key={index} src={src} className="w-full aspect-square object-cover rounded-md bg-gray-200" alt={`capture ${index + 1}`} />)}
                                    {Array(IMAGES_NEEDED - capturedImages.length).fill(0).map((_, i) => <div key={i} className="w-full aspect-square bg-gray-200 rounded-md" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="mt-8 flex justify-end">
                    <button type="submit" disabled={capturedImages.length < IMAGES_NEEDED || isLoading} className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center">
                        <UserPlus className="mr-2" /> {isLoading ? 'Enrolling...' : 'Enroll Student with Face Recognition'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EnrollStudent;