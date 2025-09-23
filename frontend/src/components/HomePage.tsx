import React, { useState } from 'react';
import { GraduationCap, Users, UserCheck, BookOpen } from 'lucide-react';
import LoginModal from './auth/LoginModal';
import SignupModal from './auth/SignupModal';

const HomePage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'faculty' | 'student' | null>(null);

  const handleRoleSelect = (role: 'admin' | 'faculty' | 'student', action: 'login' | 'signup') => {
    setSelectedRole(role);
    if (action === 'login') {
      setShowLogin(true);
    } else {
      setShowSignup(true);
    }
  };

  const roleCards = [
    {
      role: 'admin' as const,
      title: 'Administrator',
      description: 'Manage the entire attendance system, faculty, and students',
      icon: UserCheck,
      gradient: 'from-purple-500 to-pink-500',
      features: ['Manage Faculty & Students', 'View All Departments', 'System Analytics', 'Export Reports']
    },
    {
      role: 'faculty' as const,
      title: 'Faculty',
      description: 'Create sessions, manage attendance, and track student progress',
      icon: Users,
      gradient: 'from-blue-500 to-teal-500',
      features: ['Create Sessions', 'Mark Attendance', 'Face Recognition', 'Student Analytics']
    },
    {
      role: 'student' as const,
      title: 'Student',
      description: 'View your attendance, track progress, and download reports',
      icon: BookOpen,
      gradient: 'from-green-500 to-blue-500',
      features: ['View Attendance', 'Subject-wise Reports', 'Attendance History', 'Progress Tracking']
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="text-center text-white">
            <div className="flex justify-center mb-8">
              <GraduationCap className="h-24 w-24 text-white" />
            </div>
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Smart Attendance System
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Revolutionary face recognition technology for seamless attendance management. 
              Secure, efficient, and user-friendly.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Face Recognition</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Real-time Tracking</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Analytics Dashboard</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      {/* Role Selection */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Role</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your role to access the appropriate dashboard and features tailored to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roleCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <div key={card.role} className="group">
                <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${card.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{card.title}</h3>
                  <p className="text-gray-600 mb-6">{card.description}</p>
                  
                  <div className="space-y-2 mb-8">
                    {card.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleRoleSelect(card.role, 'login')}
                      className={`w-full bg-gradient-to-r ${card.gradient} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105`}
                    >
                      Login as {card.title}
                    </button>
                    
                    {/* The "Sign Up" button will now ONLY show if the role is 'student' */}
                    {card.role === 'student' && (
                      <button
                        onClick={() => handleRoleSelect(card.role, 'signup')}
                        className="w-full border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:bg-gray-50"
                      >
                        Sign Up
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our System?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Advanced features designed for modern educational institutions
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: 'Face Recognition', desc: 'Advanced AI-powered face detection', icon: '🎯' },
              { title: 'Real-time Analytics', desc: 'Live attendance tracking and insights', icon: '📊' },
              { title: '75% Threshold', desc: 'Automatic alerts for low attendance', icon: '⚠️' },
              { title: 'Export Reports', desc: 'Generate PDF and Excel reports', icon: '📄' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLogin && (
        <LoginModal
          role={selectedRole!}
          onClose={() => {
            setShowLogin(false);
            setSelectedRole(null);
          }}
        />
      )}

      {showSignup && (
        <SignupModal
          role={selectedRole!}
          onClose={() => {
            setShowSignup(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;