import { useLocation } from 'react-router-dom';
import { Menu, Bell, Sparkles } from 'lucide-react';

const routeMetadata = {
  '/dashboard': {
    title: 'Dashboard Overview',
    description: 'Monitor real-time student engagement and daily attendance rates.'
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
  }
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const meta = routeMetadata[location.pathname] || {
    title: 'Smart Academy',
    description: 'Student Attendance Management Platform'
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

        {/* Right Action Icons */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200">
            <Sparkles size={14} />
            <span>Bootcamp Edition</span>
          </div>

          <button
            className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
              A
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">Smart Academy Admin</p>
              <p className="text-[11px] text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
