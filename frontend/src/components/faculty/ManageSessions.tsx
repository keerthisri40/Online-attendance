// frontend/src/components/faculty/ManageSessions.tsx
import React, { useState } from 'react';
import AttendanceCameraModal from './AttendanceCameraModal';

const sessions = [
  { name: 'Data Structures - Morning Batch', students: 45, attendance: 85.3 },
  { name: 'Algorithms - Evening Batch', students: 42, attendance: 82.3 },
];

const ManageSessions: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; sessionName: string }>({ 
    isOpen: false, 
    sessionName: '' 
  });

  const handleMarkAttendanceClick = (sessionName: string) => {
    setModalState({ isOpen: true, sessionName });
  };

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">&larr; Back to Dashboard</button>
        <h2 className="text-2xl font-bold ml-4">Manage Sessions</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sessions.map(session => (
          <div key={session.name} className="bg-white p-6 rounded-lg shadow-md border">
            <h3 className="text-lg font-bold">{session.name}</h3>
            <p className="text-sm text-gray-500">{session.students} students - {session.attendance}% attendance</p>
            <div className="mt-4">
              <button 
                onClick={() => handleMarkAttendanceClick(session.name)}
                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-semibold"
              >
                Mark Attendance
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalState.isOpen && (
        <AttendanceCameraModal 
          sessionName={modalState.sessionName}
          onClose={() => setModalState({ ...modalState, isOpen: false })}
        />
      )}
    </div>
  );
};

export default ManageSessions;