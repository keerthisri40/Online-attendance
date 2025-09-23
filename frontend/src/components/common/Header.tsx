import React from 'react';
import { LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'from-purple-600 to-pink-600';
      case 'faculty': return 'from-blue-600 to-teal-600';
      case 'student': return 'from-green-600 to-blue-600';
      default: return 'from-gray-600 to-gray-800';
    }
  };

  const getRoleName = () => {
    switch (user?.role) {
      case 'admin': return 'Administrator';
      case 'faculty': return 'Faculty';
      case 'student': return 'Student';
      default: return 'User';
    }
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor()} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
              {user?.firstName?.[0] || 'U'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getRoleName()} Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.firstName} {user?.lastName}!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-4 py-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;