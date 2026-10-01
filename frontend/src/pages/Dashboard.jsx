import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Clock, Calendar, ArrowRight, RefreshCw, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, getStatusBadgeClass } from '../utils/helpers';
import { useToast } from '../components/Toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Calculating attendance metrics..." />;
  }

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-0 shadow-lg shadow-blue-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider mb-1">
              <Calendar size={14} />
              <span>{todayFormatted}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to Smart Academy</h2>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Track attendance, monitor student records, and analyze classroom engagement in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors"
              title="Refresh Stats"
            >
              <RefreshCw size={18} />
            </button>
            <Link
              to="/attendance"
              className="px-4 py-2.5 rounded-xl bg-white text-blue-600 hover:bg-blue-50 font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <span>Mark Attendance</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats?.totalStudents ?? 0}
          subtitle={`${stats?.activeStudents ?? 0} Active students`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Present Today"
          value={stats?.presentToday ?? 0}
          subtitle={`${stats?.todayAttendanceRate ?? 0}% Attendance rate`}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Absent Today"
          value={stats?.absentToday ?? 0}
          subtitle="Requires follow-up"
          icon={UserX}
          color="rose"
        />
        <StatCard
          title="Late Today"
          value={stats?.lateToday ?? 0}
          subtitle="Arrived after bell"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* 7-Day Trend Chart & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Bar Display */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">Attendance Overview</h3>
              <p className="text-xs text-gray-500 mt-0.5">7-Day Attendance Volume</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Present
              </span>
              <span className="flex items-center gap-1.5 font-medium text-amber-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Late
              </span>
              <span className="flex items-center gap-1.5 font-medium text-rose-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Absent
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 pt-6 border-b border-gray-100 pb-2">
            {stats?.last7Days && stats.last7Days.length > 0 ? (
              stats.last7Days.map((day) => {
                const total = day.present + day.absent + day.late;
                const max = Math.max(...stats.last7Days.map((d) => d.present + d.absent + d.late), 1);
                const heightPct = total > 0 ? (total / max) * 100 : 0;

                const presPct = total > 0 ? (day.present / total) * 100 : 0;
                const latePct = total > 0 ? (day.late / total) * 100 : 0;
                const absPct = total > 0 ? (day.absent / total) * 100 : 0;

                const dayDate = new Date(day.date);
                const dayLabel = dayDate.toLocaleDateString('en-US', { weekday: 'short' });

                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                    {/* Tooltip on Hover */}
                    <div className="text-[11px] font-semibold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {total}
                    </div>

                    {/* Stacked Bar */}
                    <div
                      style={{ height: `${Math.max(heightPct, 6)}%` }}
                      className="w-full max-w-[38px] rounded-lg overflow-hidden flex flex-col-reverse shadow-sm bg-gray-100"
                    >
                      <div style={{ height: `${presPct}%` }} className="bg-emerald-500 w-full" />
                      <div style={{ height: `${latePct}%` }} className="bg-amber-500 w-full" />
                      <div style={{ height: `${absPct}%` }} className="bg-rose-500 w-full" />
                    </div>

                    {/* Day name */}
                    <span className="text-[11px] font-medium text-gray-500 mt-2 truncate">
                      {dayLabel}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                No recent attendance records to plot
              </div>
            )}
          </div>
        </div>

        {/* Aggregate Rate Ring & Stats */}
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Performance Summary</h3>
            <p className="text-xs text-gray-500 mb-6">Cumulative academic metrics</p>

            <div className="flex flex-col items-center justify-center my-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-blue-600 transition-all duration-1000 ease-out"
                    strokeDasharray={`${stats?.overallRate || 0}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold text-gray-900">
                    {stats?.overallRate ?? 0}%
                  </span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Overall Rate
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-4 border-t border-gray-100 text-xs">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Total Recorded Entries</span>
              <span className="font-bold text-gray-800">{stats?.totalAttendance ?? 0}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">Total Present Records</span>
              <span className="font-bold text-emerald-600">{stats?.totalPresent ?? 0}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-500">Total Absent Records</span>
              <span className="font-bold text-rose-600">{stats?.totalAbsent ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance Records */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Attendance Records</h3>
            <p className="text-xs text-gray-500 mt-0.5">Latest attendance submissions recorded</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="py-3 px-6">Student</th>
                <th className="py-3 px-6">Course / Class</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {stats?.recentAttendance && stats.recentAttendance.length > 0 ? (
                stats.recentAttendance.map((rec) => (
                  <tr key={rec._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-gray-900">
                        {rec.student?.fullName || 'Unknown Student'}
                      </div>
                      <div className="text-xs text-gray-500">{rec.student?.email}</div>
                    </td>
                    <td className="py-3.5 px-6 text-gray-600">
                      {rec.student?.course || 'General'}
                    </td>
                    <td className="py-3.5 px-6 text-gray-600">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={getStatusBadgeClass(rec.status)}>
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                    No recent attendance records logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
