import React from 'react';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import LeaveApprovalPanel from '../Leave/LeaveApprovalPanel';

interface DashboardProps {
  onPageChange?: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            {user?.accessLevel === 'full' 
              ? 'Here\'s your organization overview for today'
              : 'Here\'s your attendance and leave summary'
            }
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>
      {user?.role === 'student' && (
        <div className="flex justify-end mb-2">
          <button
            onClick={() => onPageChange && onPageChange('profile')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            View Profile
          </button>
        </div>
      )}

      <DashboardStats />

      {user?.accessLevel === 'full' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LeaveApprovalPanel />
          <RecentActivity />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity />
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => onPageChange?.('apply-leave')}
                className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="text-blue-700 font-medium">Apply for Leave</span>
                <span className="text-blue-500">→</span>
              </button>
              <button 
                onClick={() => onPageChange?.('my-attendance')}
                className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="text-green-700 font-medium">View Attendance</span>
                <span className="text-green-500">→</span>
            </button>
              <button 
                onClick={() => onPageChange?.('notifications')}
                className="w-full flex items-center justify-between p-3 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
              >
                <span className="text-amber-700 font-medium">Check Notifications</span>
                <span className="text-blue-500">→</span>
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Dashboard;