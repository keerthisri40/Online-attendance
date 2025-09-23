import React from 'react';
import { TrendingUp } from 'lucide-react';

const AttendanceChart: React.FC = () => {
  // Mock data for the chart
  const data = [
    { day: 'Mon', attendance: 85 },
    { day: 'Tue', attendance: 92 },
    { day: 'Wed', attendance: 78 },
    { day: 'Thu', attendance: 88 },
    { day: 'Fri', attendance: 95 },
    { day: 'Sat', attendance: 82 },
    { day: 'Sun', attendance: 90 }
  ];

  const maxAttendance = Math.max(...data.map(d => d.attendance));

  return (
    <div className="w-full h-64">
      <div className="flex items-end justify-between h-48 px-4">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center space-y-2 flex-1">
            <div className="relative w-8 bg-gray-200 rounded-t-lg overflow-hidden" style={{ height: '150px' }}>
              <div
                className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all duration-500 ease-out"
                style={{ height: `${(item.attendance / maxAttendance) * 100}%` }}
              ></div>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700 bg-white px-2 py-1 rounded shadow-sm">
                {item.attendance}%
              </div>
            </div>
            <span className="text-sm font-medium text-gray-600">{item.day}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600">
        <TrendingUp className="h-4 w-4 text-green-500" />
        <span>Average attendance: {Math.round(data.reduce((sum, item) => sum + item.attendance, 0) / data.length)}%</span>
      </div>
    </div>
  );
};

export default AttendanceChart;