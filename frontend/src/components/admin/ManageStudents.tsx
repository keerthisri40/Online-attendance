import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Download, Eye, Trash2, Users } from 'lucide-react';

interface ManageStudentsProps {
  onBack: () => void;
}

const ManageStudents: React.FC<ManageStudentsProps> = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('');

  // Mock data
  const students = [
    {
      id: '1',
      name: 'Alice Johnson',
      registrationNumber: '21CS001',
      department: 'CSE',
      attendance: 85.5,
      email: 'alice@student.edu',
      phone: '+1234567890',
      enrolled: true
    },
    {
      id: '2',
      name: 'Bob Smith',
      registrationNumber: '21CS002',
      department: 'CSE',
      attendance: 72.3,
      email: 'bob@student.edu',
      phone: '+1234567891',
      enrolled: true
    },
    {
      id: '3',
      name: 'Carol Davis',
      registrationNumber: '21AI001',
      department: 'AI&DS',
      attendance: 65.8,
      email: 'carol@student.edu',
      phone: '+1234567892',
      enrolled: true
    },
    {
      id: '4',
      name: 'David Wilson',
      registrationNumber: '21IT001',
      department: 'IT',
      attendance: 78.9,
      email: 'david@student.edu',
      phone: '+1234567893',
      enrolled: false
    }
  ];

  const departments = ['All', 'CSE', 'AI&DS', 'AI&ML', 'IT', 'ECE', 'EEE'];
  const attendanceRanges = ['All', 'Above 75%', '70-75%', '65-70%', '60-65%', 'Below 60%'];

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 75) return 'text-green-700 bg-green-100';
    if (attendance >= 70) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };

  const filterStudents = () => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !departmentFilter || departmentFilter === 'All' || student.department === departmentFilter;
      
      let matchesAttendance = true;
      if (attendanceFilter && attendanceFilter !== 'All') {
        switch (attendanceFilter) {
          case 'Above 75%':
            matchesAttendance = student.attendance >= 75;
            break;
          case '70-75%':
            matchesAttendance = student.attendance >= 70 && student.attendance < 75;
            break;
          case '65-70%':
            matchesAttendance = student.attendance >= 65 && student.attendance < 70;
            break;
          case '60-65%':
            matchesAttendance = student.attendance >= 60 && student.attendance < 65;
            break;
          case 'Below 60%':
            matchesAttendance = student.attendance < 60;
            break;
        }
      }
      
      return matchesSearch && matchesDepartment && matchesAttendance;
    });
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    // Mock export functionality
    alert(`Exporting data as ${format.toUpperCase()}...`);
  };

  const handleRemoveStudent = (studentId: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
      // Mock remove functionality
      alert('Student removed successfully!');
    }
  };

  const handleViewStudent = (studentId: string) => {
    alert('Redirecting to student dashboard...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleExport('excel')}
            className="flex items-center space-x-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or registration number"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Attendance</label>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {attendanceRanges.map(range => (
                <option key={range} value={range}>{range}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Students ({filterStudents().length})
            </h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filterStudents().map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.registrationNumber}</div>
                      <div className="text-sm text-gray-500">{student.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {student.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAttendanceColor(student.attendance)}`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.enrolled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {student.enrolled ? 'Enrolled' : 'Not Enrolled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewStudent(student.id)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveStudent(student.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;