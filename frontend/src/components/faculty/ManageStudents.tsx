// frontend/src/components/admin/ManageStudents.tsx

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Users, Eye, Trash2 } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

interface ManageStudentsProps {
  onBack: () => void;
}

// Define the Student type to match the backend response
interface Student {
  id: string;
  name: string;
  registrationNumber: string;
  department: string;
  email: string;
  enrolled: boolean; // Indicates if face is registered
  // attendance property is removed as it should be calculated or fetched separately
}

const ManageStudents: React.FC<ManageStudentsProps> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Fetch students from the backend when the component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/students');
        if (!response.ok) {
          throw new Error('Failed to fetch students.');
        }
        const data = await response.json();
        setStudents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const departments = ['All', 'CSE', 'AI&DS', 'AI&ML', 'IT', 'ECE', 'EEE'];

  const filterStudents = () => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment = !departmentFilter || departmentFilter === 'All' || student.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  };

  const handleDeleteFace = async (reg_no: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the face data for ${name}? This cannot be undone.`)) {
        return;
    }
    try {
        const response = await fetch(`http://localhost:5000/api/delete-face/${reg_no}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        
        // Update the student's 'enrolled' status in the UI without a full refetch
        setStudents(currentStudents => 
            currentStudents.map(s => 
                s.registrationNumber === reg_no ? { ...s, enrolled: false } : s
            )
        );
        alert(data.message); // Show success message
    } catch (err: any) {
        alert(`Error: ${err.message}`); // Show error message
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Dashboard</span>
        </button>
        <div className="h-6 w-px bg-gray-300"></div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Students</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or registration number"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Students ({filterStudents().length})</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Face Enrolled</th>
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
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{student.department}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.enrolled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                        {student.enrolled ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 transition-colors p-1"><Eye className="h-4 w-4" /></button>
                      <button 
                        onClick={() => handleDeleteFace(student.registrationNumber, student.name)}
                        disabled={!student.enrolled}
                        className="text-red-600 hover:text-red-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors p-1"
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