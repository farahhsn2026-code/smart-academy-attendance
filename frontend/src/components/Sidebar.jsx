import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Settings,
  UserCheck,
  LogOut,
  X,
  School
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/teachers', label: 'Teachers', icon: UserCheck },
    { to: '/classes', label: 'Classes', icon: BookOpen },
    { to: '/students', label: 'Students', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  const teacherLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/classes', label: 'My Classes', icon: BookOpen },
    { to: '/students', label: 'My Students', icon: Users },
    { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/profile', label: 'My Profile', icon: GraduationCap }
  ];

  const links = isAdmin ? adminLinks : teacherLinks;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex-shrink-0">
        <SidebarContent
          links={links}
          user={user}
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-slate-900 text-slate-100 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-end p-4 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarContent
          links={links}
          user={user}
          isAdmin={isAdmin}
          onLogout={handleLogout}
          onNavClick={onClose}
        />
      </aside>
    </>
  );
};

const SidebarContent = ({ links, user, isAdmin, onLogout, onNavClick }) => (
  <div className="flex flex-col h-full">
    {/* Brand Header */}
    <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800/80">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
        <School size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        <h1 className="text-lg font-bold tracking-tight text-white truncate">Smart Academy</h1>
        <p className="text-[11px] font-medium text-slate-400 truncate">Attendance System</p>
      </div>
    </div>

    {/* Menu Items */}
    <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
        {isAdmin ? 'Admin Portal' : 'Teacher Portal'}
      </p>
      {links.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavClick}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`
          }
        >
          <item.icon size={19} className="flex-shrink-0" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>

    {/* User Badge & Logout in Footer */}
    <div className="p-3 mx-3 mb-4 rounded-xl bg-slate-800/50 border border-slate-800 flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm flex-shrink-0">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
          <p className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">
            {isAdmin ? 'Administrator' : 'Teacher'}
          </p>
        </div>
      </div>

      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-rose-500/20 mt-1"
      >
        <LogOut size={14} />
        <span>Sign Out</span>
      </button>
    </div>
  </div>
);

export default Sidebar;
