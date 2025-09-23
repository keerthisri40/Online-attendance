import React, { useState } from 'react';
import { ArrowLeft, Building2, Users, ChevronRight, BookOpen } from 'lucide-react';

interface ManageDepartmentsProps {
  onBack: () => void;
}

const ManageDepartments: React.FC<ManageDepartmentsProps> = ({ onBack }) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  // Mock data
  const departments = [
    {
      code: 'CSE',
      name: 'Computer Science & Engineering',
      faculty: [
        { id: '1', name: 'Dr. John Smith', sessions: 5 },
        { id: '2', name: 'Prof. Alice Brown', sessions: 3 }
      ],
      totalStudents: 120,
      totalSessions: 8
    },
    {
      code: 'AI&DS',
      name: 'Artificial Intelligence & Data Science',
      faculty: [
        { id: '3', name: 'Dr. Sarah Johnson', sessions: 4 },
        { id: '4', name: 'Prof. Mike Davis', sessions: 2 }
      ],
      totalStudents: 85,
      totalSessions: 6
    },
    {
      code: 'IT',
      name: 'Information Technology',
      faculty: [
        { id: '5', name: 'Dr. Emily Wilson', sessions: 6 }
      ],
      totalStudents: 95,
      totalSessions: 6
    },
    {
      code: 'ECE',
      name: 'Electronics & Communication Engineering',
      faculty: [
        { id: '6', name: 'Prof. Robert Taylor', sessions: 4 },
        { id: '7', name: 'Dr. Lisa Anderson', sessions: 3 }
      ],
      totalStudents: 110,
      totalSessions: 7
    }
  ];

  const handleViewDepartment = (deptCode: string) => {
    setSelectedDepartment(deptCode);
  };

  const handleBackToDepartments = () => {
    setSelectedDepartment(null);
  };

  if (selectedDepartment) {
    const dept = departments.find(d => d.code === selectedDepartment)!;
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDepartments}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Departments</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">{dept.name}</h1>
        </div>

        {/* Department Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{dept.totalStudents}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Faculty Members</p>
                <p className="text-2xl font-bold text-gray-900">{dept.faculty.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{dept.totalSessions}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Faculty List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Faculty Members</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {dept.faculty.map((member) => (
              <div key={member.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.sessions} active sessions</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                    View Sessions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Departments</h1>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.code}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all cursor-pointer transform hover:scale-105"
            onClick={() => handleViewDepartment(dept.code)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {dept.code.charAt(0)}
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{dept.code}</h3>
            <p className="text-sm text-gray-600 mb-4">{dept.name}</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Students:</span>
                <span className="font-medium text-gray-900">{dept.totalStudents}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Faculty:</span>
                <span className="font-medium text-gray-900">{dept.faculty.length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sessions:</span>
                <span className="font-medium text-gray-900">{dept.totalSessions}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageDepartments;