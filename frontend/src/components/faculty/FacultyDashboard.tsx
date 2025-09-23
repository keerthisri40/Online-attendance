import React, { useState } from 'react';
import { Users, UserCheck, UserX, TrendingUp, Calendar, Plus, Settings } from 'lucide-react';
import Header from '../common/Header';
import StatCard from '../common/StatCard';
import AttendanceChart from '../common/AttendanceChart';
import ManageStudents from './ManageStudents';
import CreateSession from './CreateSession';
import ManageSessions from './ManageSessions';

type ActiveView = 'dashboard' | 'manage-students' | 'create-session' | 'manage-sessions';

const FacultyDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  // Mock data
  const stats = {
    totalStudents: 85,
    presentToday: 72,
    absentToday: 13,
    attendanceRate: 84.7
  };

  const renderContent = () => {
    switch (activeView) {
      case 'manage-students':
        return <ManageStudents onBack={() => setActiveView('dashboard')} />;
      case 'create-session':
        // --- THIS IS THE FIX ---
        // We need to add the onSessionCreated prop here for the redirect to work
        return (
          <CreateSession 
            onBack={() => setActiveView('dashboard')} 
            onSessionCreated={() => setActiveView('manage-sessions')}
          />
        );
        // --- END OF FIX ---
      case 'manage-sessions':
        return <ManageSessions onBack={() => setActiveView('dashboard')} />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
        <p className="text-blue-100 text-lg">
          Here's what's happening with your attendance system today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={Users}
          gradient="from-green-500 to-green-600"
          change="+5 this week"
          changeType="positive"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          gradient="from-emerald-500 to-emerald-600"
          change="+2.3%"
          changeType="positive"
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          icon={UserX}
          gradient="from-red-500 to-red-600"
          change="-1.2%"
          changeType="positive"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          gradient="from-indigo-500 to-indigo-600"
          change="+1.5%"
          changeType="positive"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Attendance Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Attendance Overview</h3>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                  7 Days
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  30 Days
                </button>
              </div>
            </div>
            <AttendanceChart />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setActiveView('create-session')}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all"
              >
                <Plus className="h-5 w-5" />
                <span>Create Session</span>
              </button>
              <button
                onClick={() => setActiveView('manage-sessions')}
                className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all"
              >
                <Settings className="h-5 w-5" />
                <span>Manage Sessions</span>
              </button>
              <button
                onClick={() => setActiveView('manage-students')}
                className="w-full flex items-center justify-center space-x-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all"
              >
                <Users className="h-5 w-5" />
                <span>Manage Students</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {[
                { action: 'Session created for CSE-A', time: '2 mins ago', type: 'success' },
                { action: 'Attendance marked', time: '15 mins ago', type: 'info' },
                { action: 'Student enrolled', time: '1 hour ago', type: 'success' },
                { action: 'Low attendance alert', time: '2 hours ago', type: 'warning' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
};

export default FacultyDashboard;