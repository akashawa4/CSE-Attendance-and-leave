import React, { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, X, Calendar, TrendingUp, User, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { leaveService, attendanceService } from '../../firebase/firestore';
import { LeaveRequest } from '../../types';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const DashboardStats: React.FC = () => {
  const { user } = useAuth();
  const [selectedModal, setSelectedModal] = useState<string | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's leave requests for stats
  useEffect(() => {
    const loadLeaveRequests = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const requests = await leaveService.getLeaveRequestsByUser(user.id);
        setLeaveRequests(requests);
      } catch (error) {
        console.error('Error loading leave requests for stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaveRequests();
  }, [user]);

  // Calculate stats from real data
  const calculateStats = () => {
    if (!user) return [];

    const pendingRequests = leaveRequests.filter(req => req.status === 'pending').length;
    const approvedRequests = leaveRequests.filter(req => req.status === 'approved').length;
    const totalRequests = leaveRequests.length;

    if (user.accessLevel === 'full') {
      // Admin stats
      return [
        {
          id: 'staff',
          title: 'Total Staff',
          value: '156',
          change: '+5 this month',
          changeType: 'positive' as const,
          icon: Clock,
          color: 'blue'
        },
        {
          id: 'approvals',
          title: 'Pending Approvals',
          value: pendingRequests.toString(),
          change: 'Requires attention',
          changeType: 'warning' as const,
          icon: AlertCircle,
          color: 'amber'
        },
        {
          id: 'present',
          title: 'Today Present',
          value: '142/156',
          change: '91% attendance',
          changeType: 'positive' as const,
          icon: CheckCircle,
          color: 'green'
        },
        {
          id: 'leaves',
          title: 'Monthly Leaves',
          value: totalRequests.toString(),
          change: `${approvedRequests} approved`,
          changeType: 'neutral' as const,
          icon: FileText,
          color: 'purple'
        }
      ];
    } else {
      // Teacher stats
      return [
    {
      id: 'attendance',
      title: 'This Month Attendance',
      value: '22/24',
      change: '+2.5%',
      changeType: 'positive' as const,
      icon: Clock,
      color: 'blue'
    },
    {
      id: 'balance',
      title: 'Leave Balance',
      value: '8 days',
      change: 'CL: 3, EL: 5',
      changeType: 'neutral' as const,
      icon: FileText,
      color: 'green'
    },
    {
      id: 'pending',
      title: 'Pending Requests',
          value: pendingRequests.toString(),
      change: 'Awaiting approval',
      changeType: 'warning' as const,
      icon: AlertCircle,
      color: 'amber'
    },
    {
      id: 'approved',
      title: 'Approved Leaves',
          value: approvedRequests.toString(),
      change: 'This month',
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'green'
    }
  ];
    }
  };

  const stats = calculateStats();

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      amber: 'bg-amber-50 text-amber-600',
      purple: 'bg-purple-50 text-purple-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getChangeColor = (type: string) => {
    const typeMap = {
      positive: 'text-green-600',
      negative: 'text-red-600',
      warning: 'text-amber-600',
      neutral: 'text-gray-600'
    };
    return typeMap[type as keyof typeof typeMap] || typeMap.neutral;
  };

  const renderModalContent = (modalId: string) => {
    switch (modalId) {
      case 'attendance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Working Days</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">24</p>
                <p className="text-sm text-blue-700">This month</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Present Days</span>
                </div>
                <p className="text-2xl font-bold text-green-900">22</p>
                <p className="text-sm text-green-700">91.7% attendance</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Recent Attendance</h4>
              <div className="space-y-2">
                {[
                  { date: 'Today', time: '9:15 AM - 5:30 PM', status: 'Present', hours: '8h 15m' },
                  { date: 'Yesterday', time: '9:10 AM - 5:25 PM', status: 'Present', hours: '8h 15m' },
                  { date: 'Mar 20', time: '9:20 AM - 5:35 PM', status: 'Present', hours: '8h 15m' },
                  { date: 'Mar 19', time: '---', status: 'Leave', hours: '---' },
                  { date: 'Mar 18', time: '9:05 AM - 5:20 PM', status: 'Present', hours: '8h 15m' }
                ].map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="font-medium text-gray-900">{record.date}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{record.time}</p>
                      <p className="text-xs text-gray-500">{record.hours}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <h4 className="font-semibold text-amber-900 mb-2">Monthly Summary</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-amber-900">8h 12m</p>
                  <p className="text-xs text-amber-700">Avg. Daily Hours</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-900">2</p>
                  <p className="text-xs text-amber-700">Late Arrivals</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-900">0</p>
                  <p className="text-xs text-amber-700">Early Departures</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'balance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {[
                { type: 'Casual Leave (CL)', available: 3, used: 9, total: 12, color: 'blue' },
                { type: 'Earned Leave (EL)', available: 5, used: 7, total: 12, color: 'green' },
                { type: 'Medical Leave (ML)', available: 8, used: 4, total: 12, color: 'purple' },
                { type: 'Compensatory Off (COH)', available: 2, used: 1, total: 3, color: 'amber' }
              ].map((leave, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{leave.type}</h4>
                    <span className="text-sm font-bold text-gray-900">{leave.available} days left</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${
                        leave.color === 'blue' ? 'bg-blue-500' :
                        leave.color === 'green' ? 'bg-green-500' :
                        leave.color === 'purple' ? 'bg-purple-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${(leave.used / leave.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Used: {leave.used} days</span>
                    <span>Total: {leave.total} days</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-3">Leave Policy Information</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Leave balance resets every financial year (April 1st)</li>
                <li>• Maximum 3 consecutive casual leaves without prior approval</li>
                <li>• Medical leave requires doctor&apos;s certificate for &gt;2 days</li>
                <li>• Compensatory offs expire after 90 days if not used</li>
                <li>• Earned leave can be carried forward (max 30 days)</li>
              </ul>
            </div>
          </div>
        );

      case 'pending':
        return (
          <div className="space-y-6">
            <div className="border border-amber-200 bg-amber-50 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900">Casual Leave Request</h4>
                  <p className="text-sm text-amber-800 mt-1">March 25, 2024 (1 day)</p>
                  <p className="text-sm text-amber-700 mt-2">Reason: Personal work - family function</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-amber-600">Submitted: Mar 22, 2024 at 2:30 PM</span>
                    <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Pending with HOD</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Application Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Application Submitted</p>
                    <p className="text-xs text-gray-500">Mar 22, 2024 at 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Pending HOD Approval</p>
                    <p className="text-xs text-gray-500">Dr. Michael Chen (Computer Science)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Principal Approval</p>
                    <p className="text-xs text-gray-400">Awaiting HOD approval</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Registrar Approval</p>
                    <p className="text-xs text-gray-400">Awaiting Principal approval</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">HR Executive Final Approval</p>
                    <p className="text-xs text-gray-400">Awaiting Registrar approval</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Approval Flow Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>• <strong>Step 1:</strong> HOD Approval (Department Level)</p>
                <p>• <strong>Step 2:</strong> Principal Approval (Academic Level)</p>
                <p>• <strong>Step 3:</strong> Registrar Approval (Administrative Level)</p>
                <p>• <strong>Step 4:</strong> HR Executive Final Approval (HR Level)</p>
              </div>
              <div className="flex space-x-2 mt-3">
                <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  View Full Application
                </button>
                <button className="px-3 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300">
                  Withdraw Request
                </button>
              </div>
            </div>
          </div>
        );

      case 'approved':
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              {[
                {
                  type: 'Medical Leave',
                  dates: 'March 15-16, 2024',
                  days: 2,
                  approver: 'Mr. Arjun Kumar (HR Executive)',
                  approvedDate: 'Mar 14, 2024',
                  status: 'Approved',
                  approvalFlow: 'HOD → Principal → Registrar → HR Executive'
                },
                {
                  type: 'Casual Leave',
                  dates: 'March 8, 2024',
                  days: 1,
                  approver: 'Mr. Arjun Kumar (HR Executive)',
                  approvedDate: 'Mar 7, 2024',
                  status: 'Approved',
                  approvalFlow: 'HOD → Principal → Registrar → HR Executive'
                }
              ].map((leave, index) => (
                <div key={index} className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-green-900">{leave.type}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {leave.status}
                        </span>
                      </div>
                      <p className="text-sm text-green-800">{leave.dates} ({leave.days} day{leave.days > 1 ? 's' : ''})</p>
                      <p className="text-xs text-green-700 mt-2">Final approval by: {leave.approver}</p>
                      <p className="text-xs text-green-600">Approved on: {leave.approvedDate}</p>
                      <p className="text-xs text-green-600 mt-1">Flow: {leave.approvalFlow}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-blue-900">95%</p>
                <p className="text-sm text-blue-700">Approval Rate</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <Clock className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-lg font-bold text-green-900">2.5 days</p>
                <p className="text-sm text-green-700">Avg. Processing Time</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Leave History Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total leaves taken this year:</span>
                  <span className="font-medium text-gray-900">21 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Most common leave type:</span>
                  <span className="font-medium text-gray-900">Casual Leave</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longest consecutive leave:</span>
                  <span className="font-medium text-gray-900">5 days (Medical)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average approval time:</span>
                  <span className="font-medium text-gray-900">2.5 days</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>No details available</div>;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isClickable = user?.accessLevel !== 'full';
          
          return (
            <div 
              key={index} 
              className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 transition-all duration-200 ${
                isClickable ? 'hover:shadow-md hover:scale-105 cursor-pointer' : 'hover:shadow-md'
              }`}
              onClick={() => isClickable && setSelectedModal(stat.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className={`text-xs ${getChangeColor(stat.changeType)}`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              {isClickable && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-blue-600 font-medium">Click for details →</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modals */}
      <DetailModal
        isOpen={selectedModal === 'attendance'}
        onClose={() => setSelectedModal(null)}
        title="Attendance Details"
      >
        {renderModalContent('attendance')}
      </DetailModal>

      <DetailModal
        isOpen={selectedModal === 'balance'}
        onClose={() => setSelectedModal(null)}
        title="Leave Balance Details"
      >
        {renderModalContent('balance')}
      </DetailModal>

      <DetailModal
        isOpen={selectedModal === 'pending'}
        onClose={() => setSelectedModal(null)}
        title="Pending Requests"
      >
        {renderModalContent('pending')}
      </DetailModal>

      <DetailModal
        isOpen={selectedModal === 'approved'}
        onClose={() => setSelectedModal(null)}
        title="Approved Leaves"
      >
        {renderModalContent('approved')}
      </DetailModal>
    </>
  );
};

export default DashboardStats;