import React, { useState, useEffect } from 'react';
import { userService, attendanceService } from '../../firebase/firestore';
import { User } from '../../types';

const YEARS = ['2nd', '3rd', '4th'];
const SEMS = ['3', '4', '5', '6', '7', '8'];
const DIVS = ['A', 'B', 'C'];
const SUBJECTS = [
  'Software Engineering',
  'Microprocessor',
  'Operating System',
  'Automata',
  'CN-1'
];

const TakeAttendancePanel: React.FC = () => {
  const [year, setYear] = useState('2nd');
  const [sem, setSem] = useState('3');
  const [div, setDiv] = useState('A');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [presentRolls, setPresentRolls] = useState('');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [present, setPresent] = useState<User[]>([]);
  const [absent, setAbsent] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split('T')[0];

  useEffect(() => {
    // Fetch students from Firestore by year, sem, div
    const fetchStudents = async () => {
      setLoading(true);
      const all = await userService.getAllUsers();
      const filtered = all.filter(u =>
        u.role === 'student' &&
        u.year === year &&
        u.sem === sem &&
        u.div === div
      );
      setStudents(filtered);
      setLoading(false);
    };
    fetchStudents();
  }, [year, sem, div]);

  const handleMarkAllPresent = () => {
    setPresentRolls(students.map(s => s.employeeId || s.id).join(','));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const presentList = presentRolls
      .split(/[\s,]+/)
      .map(r => r.trim())
      .filter(r => r.length > 0);
    const presentStudents = students.filter(s => presentList.includes(s.employeeId || s.id));
    const absentStudents = students.filter(s => !presentList.includes(s.employeeId || s.id));
    setPresent(presentStudents);
    setAbsent(absentStudents);
    setSubmitted(true);
    // Save attendance to Firestore
    for (const s of students) {
      await attendanceService.markAttendance({
        userId: s.id,
        userName: s.name,
        date: todayDate,
        status: presentList.includes(s.employeeId || s.id) ? 'present' : 'absent',
        subject,
        notes: note,
        clockIn: '',
        createdAt: new Date()
      });
    }
  };

  const handleCopy = (list: User[]) => {
    navigator.clipboard.writeText(list.map(s => `${s.name} (${s.employeeId || s.id})`).join(', '));
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-blue-200 shadow mb-6">
      <h2 className="text-lg font-bold text-blue-900 mb-2">Take Attendance</h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <select value={year} onChange={e => setYear(e.target.value)} className="mt-1 block w-full border rounded p-2">
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Semester</label>
          <select value={sem} onChange={e => setSem(e.target.value)} className="mt-1 block w-full border rounded p-2">
            {SEMS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Division</label>
          <select value={div} onChange={e => setDiv(e.target.value)} className="mt-1 block w-full border rounded p-2">
            {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 block w-full border rounded p-2">
            {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Present Student Roll Numbers (comma or space separated)</label>
          <textarea
            value={presentRolls}
            onChange={e => setPresentRolls(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            rows={2}
            placeholder="e.g. 201, 202, 204"
          />
          <button type="button" onClick={handleMarkAllPresent} className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">Mark All Present</button>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Session Note (optional)</label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="mt-1 block w-full border rounded p-2"
            placeholder="Topic covered, remarks, etc."
          />
        </div>
        <div className="md:col-span-2 flex items-center gap-4 mt-2">
          <span className="text-sm text-gray-500">Date: <strong>{todayStr}</strong></span>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" disabled={loading}>Submit Attendance</button>
        </div>
      </form>
      {submitted && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-green-800">Present Students</h3>
              <button onClick={() => handleCopy(present)} className="text-xs text-blue-600 hover:underline">Copy</button>
            </div>
            <div className="text-sm text-green-900">
              {present.length === 0 ? 'None' : present.map(s => `${s.name} (${s.employeeId || s.id})`).join(', ')}
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-red-800">Absent Students</h3>
              <button onClick={() => handleCopy(absent)} className="text-xs text-blue-600 hover:underline">Copy</button>
            </div>
            <div className="text-sm text-red-900">
              {absent.length === 0 ? 'None' : absent.map(s => `${s.name} (${s.employeeId || s.id})`).join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeAttendancePanel; 