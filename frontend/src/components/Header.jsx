import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const routeMetadata = {
  '/dashboard': {
    title: 'Dashboard Overview',
    description: 'Monitor student engagement and daily attendance rates.'
  },
  '/teachers': {
    title: 'Faculty & Teachers',
    description: 'Manage teacher accounts, class allocations, and credentials.'
  },
  '/classes': {
    title: 'Academic Classes',
    description: 'Manage class sections, grade cohorts, and teacher assignments.'
  },
  '/students': {
    title: 'Student Directory',
    description: 'Manage enrollments, student records, and demographic details.'
  },
  '/attendance': {
    title: 'Daily Attendance',
    description: 'Mark and record Present, Absent, or Late attendance statuses.'
  },
  '/reports': {
    title: 'Analytics & Reports',
    description: 'Review historical attendance trends and statistical breakdowns.'
  },
  '/settings': {
    title: 'System Settings',
    description: 'Configure institution profile, parameters, and display options.'
  },
  '/profile': {
    title: 'Staff Profile',
    description: 'View your profile information and update login credentials.'
  }
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();

  const meta = routeMetadata[location.pathname] || {
    title: 'Smart Academy',
    description: 'Student Attendance Management Platform'
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200/80 px-4 sm:px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile toggle & Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-tight truncate">
              {meta.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 hidden sm:block truncate mt-0.5">
              {meta.description}
            </p>
          </div>
        </div>

        {/* Right User Bar */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
            <Sparkles size={14} />
            <span>Smart Academy</span>
          </div>

          <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
            <Link
              to={isAdmin ? '/settings' : '/profile'}
              className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
              title="View Profile"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-900 leading-tight">
                  {isAdmin ? 'Smart Academy Admin' : user?.name || 'Teacher'}
                </p>
                <p className="text-[11px] text-blue-600 font-semibold uppercase tracking-wider">
                  {isAdmin ? 'Administrator' : 'Teacher'}
                </p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
