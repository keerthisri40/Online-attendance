// frontend/src/components/student/StudentDashboard.tsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner'; // Assuming you have a loading component

// Define types for our data
interface OverallStats {
    overallPercentage: number;
    classesAttended: number;
    classesMissed: number;
    totalSubjects: number;
}
interface SubjectStats {
    subjectName: string;
    attended: number;
    total: number;
    percentage: number;
}
interface DashboardData {
    overallStats: OverallStats;
    subjectWise: SubjectStats[];
}

const StudentDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.registrationNumber) {
            const fetchData = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/api/student-dashboard/${user.registrationNumber}`);
                    if (!response.ok) {
                        throw new Error('Could not fetch dashboard data.');
                    }
                    const data: DashboardData = await response.json();
                    setDashboardData(data);
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    if (loading) {
        return <LoadingSpinner />;
    }
    
    if (error || !dashboardData) {
        return <div className="text-center p-8 text-red-500">{error || 'No data available.'}</div>;
    }

    const { overallStats, subjectWise } = dashboardData;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="flex items-center justify-between p-4 bg-white border-b">
                 <div className="flex items-center">
                    <div className="p-2 mr-4 bg-blue-100 rounded-full">
                       <span className="font-bold text-blue-600">{user?.firstName.charAt(0)}{user?.lastName.charAt(0)}</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Student Dashboard</h1>
                        <p className="text-sm text-gray-500">Welcome back, {user?.firstName}!</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-700">{user?.firstName} {user?.lastName}</span>
                    <button onClick={logout} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600">
                        <LogOut size={16} className="mr-2" />
                        Logout
                    </button>
                </div>
            </header>

            <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Overall Stats */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="p-6 bg-white rounded-lg shadow text-center">
                        <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}`} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4" />
                        <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-gray-500">{user?.registrationNumber}</p>
                        <p className="text-gray-500">{user?.department} Department</p>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow">
                        <h3 className="text-lg font-bold mb-4">Overall Attendance</h3>
                        <div className="text-center text-5xl font-bold text-green-600 mb-4">{overallStats.overallPercentage}%</div>
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-4 bg-green-100 rounded-lg">
                                <p className="text-2xl font-bold text-green-800">{overallStats.classesAttended}</p>
                                <p className="text-sm text-green-700">Classes Attended</p>
                            </div>
                            <div className="p-4 bg-red-100 rounded-lg">
                                <p className="text-2xl font-bold text-red-800">{overallStats.classesMissed}</p>
                                <p className="text-sm text-red-700">Classes Missed</p>
                            </div>
                        </div>
                         <div className="mt-4 p-4 bg-blue-100 rounded-lg text-center">
                            <p className="text-2xl font-bold text-blue-800">{overallStats.totalSubjects}</p>
                            <p className="text-sm text-blue-700">Total Subjects</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Subject-wise Attendance */}
                <div className="lg:col-span-2 p-6 bg-white rounded-lg shadow">
                     <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Subject-wise Attendance</h3>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Download Report
                        </button>
                    </div>
                    <div className="space-y-6">
                        {subjectWise.map(subject => (
                            <div key={subject.subjectName}>
                                <div className="flex justify-between mb-1">
                                    <p className="font-medium text-gray-700">{subject.subjectName}</p>
                                    <p className="text-sm text-gray-500">{subject.attended} / {subject.total} classes</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-4">
                                    <div className="bg-green-500 h-4 rounded-full text-xs text-white flex items-center justify-center" style={{ width: `${subject.percentage}%` }}>
                                        {subject.percentage}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;