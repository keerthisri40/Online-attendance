// frontend/src/components/faculty/CreateSession.tsx

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, PlusCircle } from 'lucide-react';

interface Props {
  onBack: () => void;
  onSessionCreated: () => void; 
}

const CreateSession: React.FC<Props> = ({ onBack, onSessionCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    sessionName: '',
    subject: '',
    department: '',
    year: '',
    section: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          facultyEmail: user?.email,
          year: parseInt(formData.year) || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create session.');
      }
      onSessionCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md border">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-4">
          <ArrowLeft />
        </button>
        <h2 className="text-2xl font-bold">Create Session</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input name="sessionName" value={formData.sessionName} onChange={handleChange} placeholder="Session Name (e.g., Data Structures - Morning Batch)" required className="p-3 border rounded-md" />
          <input name="subject" value={formData.subject} onChange={handleChange} placeholder="Subject (e.g., Data Structures)" required className="p-3 border rounded-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <select name="department" value={formData.department} onChange={handleChange} required className="p-3 border rounded-md bg-white">
            <option value="">Select Department</option>
            <option value="AI&DS">AI&DS</option><option value="CSE">CSE</option><option value="IT">IT</option>
          </select>
          <select name="year" value={formData.year} onChange={handleChange} required className="p-3 border rounded-md bg-white">
            <option value="">Select Year</option>
            <option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option>
          </select>
          <select name="section" value={formData.section} onChange={handleChange} required className="p-3 border rounded-md bg-white">
            <option value="">Select Section</option>
            <option value="A">Section A</option><option value="B">Section B</option><option value="C">Section C</option>
          </select>
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onBack} className="px-6 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200">Cancel</button>
          <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 flex items-center">
            <PlusCircle size={20} className="mr-2" />
            {isLoading ? 'Creating...' : 'Create Session'}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CreateSession;