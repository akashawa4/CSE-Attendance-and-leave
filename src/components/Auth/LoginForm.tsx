import React, { useState } from 'react';
import { LogIn, Mail, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'email' | 'demo'>('email');
  const { sendEmailLink, login, isLoading, ensureDemoUsersInFirestore } = useAuth();

  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await sendEmailLink(email);
      setSuccess('Sign-in link sent! Check your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send sign-in link.');
    }
  };

  const handleDemoLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await login(email, 'demo123');
    } catch (err: any) {
      setError('Invalid credentials. Please try again.');
    }
  };

  const handleEnsureDemoUsers = async () => {
    setError('');
    setSuccess('');
    try {
      await ensureDemoUsersInFirestore();
      setSuccess('All demo users have been ensured in Firestore!');
    } catch (err: any) {
      setError('Failed to ensure demo users in Firestore.');
    }
  };

  const demoUsers = [
    { role: 'Student', email: 'student.demo@dypsn.edu', password: 'demo123' },
    { role: 'Teacher', email: 'teacher.demo@dypsn.edu', password: 'demo123' },
    { role: 'HOD', email: 'hod.demo@dypsn.edu', password: 'demo123' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">DYPSN Portal</h2>
          <p className="mt-2 text-gray-600">Digital Leave & Attendance System</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <div className="flex mb-6">
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Email Link Sign-In
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'demo' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Demo Account
            </button>
          </div>

          {activeTab === 'email' && (
            <form onSubmit={handleEmailLink} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Sending link...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send Sign-In Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'demo' && (
            <form onSubmit={handleDemoLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Demo Account
                </label>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {demoUsers.map((user, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setEmail(user.email);
                      }}
                      className="text-xs bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-md text-gray-700 transition-colors"
                    >
                      {user.role}
                    </button>
                  ))}
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Demo account email"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">{success}</p>
                </div>
              )}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5" />
                      <span>Sign In as Demo</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleEnsureDemoUsers}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium text-sm"
                >
                  <span>Ensure All Demo Users in Firestore</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;