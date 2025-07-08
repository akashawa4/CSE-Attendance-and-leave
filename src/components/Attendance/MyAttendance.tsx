import React, { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, MapPin, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceService } from '../../firebase/firestore';
import { AttendanceRecord } from '../../types';

const MyAttendance: React.FC = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [viewType, setViewType] = useState<'calendar' | 'list'>('calendar');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Load user's attendance data from Firestore
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const records = await attendanceService.getAttendanceByUser(user.id);

        setAttendanceData(records);
      } catch (error) {
        console.error('Error loading attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAttendanceData();
  }, [user]);

  // Calculate month stats from real data
  const calculateMonthStats = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    
    const monthRecords = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getFullYear() === year && recordDate.getMonth() === month;
    });

    const presentDays = monthRecords.filter(r => r.status === 'present').length;
    const leaveDays = monthRecords.filter(r => r.status === 'leave').length;
    const lateDays = monthRecords.filter(r => r.status === 'late').length;
    const totalDays = monthRecords.length;

    // Calculate average working hours
    const workingHours = monthRecords
      .filter(r => r.workingHours && r.workingHours !== '---')
      .map(r => {
        const hours = r.workingHours.split('h')[0];
        const minutes = r.workingHours.split('h')[1]?.split('m')[0] || '0';
        return parseInt(hours) + parseInt(minutes) / 60;
      });

    const avgHours = workingHours.length > 0 
      ? workingHours.reduce((a, b) => a + b, 0) / workingHours.length 
      : 0;

    const avgWorkingHours = `${Math.floor(avgHours)}h ${Math.round((avgHours % 1) * 60)}m`;

    return {
      totalDays,
      presentDays,
      leaveDays,
      lateDays,
      avgWorkingHours,
      totalOvertime: '2h 15m' // This would be calculated from overtime records
  };
  };

  const monthStats = calculateMonthStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-amber-100 text-amber-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'leave': return 'bg-blue-100 text-blue-800';
      case 'holiday': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const attendance = attendanceData.find(a => a.date === dateStr);
      const isCurrentMonth = currentDate.getMonth() === month;
      const isToday = dateStr === new Date().toISOString().split('T')[0];
      
      days.push({
        date: new Date(currentDate),
        dateStr,
        attendance,
        isCurrentMonth,
        isToday
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMonth(newMonth);
  };

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600">Track your daily attendance and working hours</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType('calendar')}
              className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                viewType === 'calendar' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                viewType === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              List
            </button>
          </div>
          <button className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      ) : (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="bg-white p-2 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Present Days</p>
              <p className="text-2xl font-bold text-green-600">{monthStats.presentDays}</p>
            </div>
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leave Days</p>
              <p className="text-2xl font-bold text-blue-600">{monthStats.leaveDays}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Late Days</p>
              <p className="text-2xl font-bold text-amber-600">{monthStats.lateDays}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance %</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((monthStats.presentDays / monthStats.totalDays) * 100)}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Hours</p>
              <p className="text-2xl font-bold text-indigo-600">{monthStats.avgWorkingHours}</p>
            </div>
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        <div className="bg-white p-2 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overtime</p>
              <p className="text-2xl font-bold text-orange-600">{monthStats.totalOvertime}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-2">
        <div className="xl:col-span-3">
          {viewType === 'calendar' ? (
            <div className="bg-white rounded-lg border border-gray-200 p-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
                
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`p-1 min-h-[60px] border border-gray-100 rounded-lg ${
                      !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
                    } ${day.isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    {day.attendance && day.isCurrentMonth && (
                      <div className="space-y-1">
                        <div className={`text-xs px-1 py-0.5 rounded-full text-center ${getStatusColor(day.attendance.status)}`}>
                          {day.attendance.status.charAt(0).toUpperCase() + day.attendance.status.slice(1)}
                        </div>
                        {day.attendance.status === 'present' || day.attendance.status === 'late' ? (
                          <div className="text-xs text-gray-600 text-center">
                            {day.attendance.clockIn} - {day.attendance.clockOut}
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center space-x-2 mt-2 text-xs">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Present</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-amber-100 rounded"></div>
                  <span className="text-gray-600">Late</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-100 rounded"></div>
                  <span className="text-gray-600">Leave</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-100 rounded"></div>
                  <span className="text-gray-600">Absent</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock In</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clock Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Working Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceData.slice(0, 10).map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(record.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.clockIn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.clockOut}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{record.workingHours}</div>
                          {record.overtime && (
                            <div className="text-xs text-orange-600">+{record.overtime} overtime</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                            {record.location}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Today's Status - Sidebar */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-2 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Today's Status</h3>
          <div className="space-y-2">
            <div className="bg-white p-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Clock In</p>
                  <p className="text-lg font-bold text-gray-900">9:15 AM</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Hours Worked</p>
                  <p className="text-lg font-bold text-gray-900">5h 45m</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-lg font-bold text-gray-900">Block A</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default MyAttendance;