import { useState } from 'react';
import { User, Lock, Mail, Phone, Shield, BookOpen, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { useToast } from '../components/Toast';

const Profile = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error('Please enter both your current and new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await authApi.changePassword({ currentPassword, newPassword });
      if (res.success) {
        toast.success('Your password has been changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Account Info Card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  user?.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {user?.role === 'admin' ? 'Administrator' : 'Teacher'}
              </span>
              <span className="text-xs text-gray-500">• Smart Academy Staff</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5 mb-1">
              <Mail size={14} /> Official Email
            </span>
            <p className="font-medium text-gray-800 break-all">{user?.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5 mb-1">
              <Phone size={14} /> Phone Number
            </span>
            <p className="font-medium text-gray-800">{user?.phone || 'Not recorded'}</p>
          </div>

          {user?.role === 'teacher' && (
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 sm:col-span-2">
              <span className="text-xs font-semibold uppercase text-gray-400 flex items-center gap-1.5 mb-1.5">
                <BookOpen size={14} /> Assigned Classes
              </span>
              {user.assignedClasses && user.assignedClasses.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.assignedClasses.map((cls) => (
                    <span
                      key={cls._id || cls}
                      className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold"
                    >
                      {cls.name || 'Class Cohort'}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">No classes currently assigned.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Change Password Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <Lock size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Security & Password</h3>
            <p className="text-xs text-gray-500">Update your account login password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg mt-6">
          <div>
            <label className="label">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">New Password (minimum 6 characters)</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="input-field"
              required
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={changingPassword}
              className="btn-primary"
            >
              <Save size={16} />
              <span>{changingPassword ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
