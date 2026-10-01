import { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Download
} from 'lucide-react';
import { dashboardApi, attendanceApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { formatDate, getStatusBadgeClass } from '../utils/helpers';
import { useToast } from '../components/Toast';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Filter params
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const toast = useToast();

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await dashboardApi.getStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      toast.error('Failed to load statistical metrics');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const params = {
        page,
        limit: 15
      };

      if (statusFilter) params.status = statusFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await attendanceApi.getAll(params);
      if (res.success) {
        setHistory(res.data);
        setTotalPages(res.pages || 1);
        setTotalRecords(res.total || 0);
      }
    } catch (err) {
      toast.error('Failed to fetch attendance history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [page, statusFilter, startDate, endDate]);

  const filteredHistory = history.filter((rec) => {
    if (!search.trim()) return true;
    const name = rec.student?.fullName?.toLowerCase() || '';
    const course = rec.student?.course?.toLowerCase() || '';
    return name.includes(search.toLowerCase()) || course.includes(search.toLowerCase());
  });

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Analytics Summary Header */}
      {loadingStats ? (
        <LoadingSpinner message="Aggregating performance insights..." />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-l-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Logged Entries
                </p>
                <p className="text-3xl font-extrabold text-gray-900 mt-1">
                  {stats?.totalAttendance ?? 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <BarChart3 size={24} />
              </div>
            </div>
          </div>

          <div className="card p-5 border-l-4 border-l-emerald-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Present
                </p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-1">
                  {stats?.totalPresent ?? 0}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>

          <div className="card p-5 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Late
                </p>
                <p className="text-3xl font-extrabold text-amber-600 mt-1">
                  {stats?.totalLate ?? 0}
                </p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock size={24} />
              </div>
            </div>
          </div>

          <div className="card p-5 border-l-4 border-l-rose-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Absent
                </p>
                <p className="text-3xl font-extrabold text-rose-600 mt-1">
                  {stats?.totalAbsent ?? 0}
                </p>
              </div>
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                <AlertCircle size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Visualizer */}
      {stats?.last7Days && stats.last7Days.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              <h3 className="text-base font-bold text-gray-900">Attendance Distribution (Last 7 Days)</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
              Historical Trend
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 sm:gap-4 pt-4 border-t border-gray-100">
            {stats.last7Days.map((day) => {
              const dayDate = new Date(day.date);
              const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });
              const dateStr = dayDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
              const total = day.present + day.absent + day.late;
              const rate = total > 0 ? Math.round((day.present / total) * 100) : 0;

              return (
                <div key={day.date} className="flex flex-col items-center p-3 rounded-xl bg-gray-50/70 border border-gray-100">
                  <span className="text-xs font-bold text-gray-800">{dayName}</span>
                  <span className="text-[10px] text-gray-400 mb-2">{dateStr}</span>

                  <div className="w-12 h-12 rounded-full border-2 border-emerald-500 flex items-center justify-center bg-white shadow-xs my-1">
                    <span className="text-xs font-extrabold text-gray-800">{rate}%</span>
                  </div>

                  <div className="text-[10px] text-gray-500 mt-2 text-center space-y-0.5">
                    <div className="text-emerald-600 font-semibold">{day.present} P</div>
                    <div className="text-amber-600 font-semibold">{day.late} L</div>
                    <div className="text-rose-600 font-semibold">{day.absent} A</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance History Filters & Table */}
      <div className="card overflow-hidden">
        {/* Controls */}
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-900">Attendance History Logs</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Total {totalRecords} records found
              </p>
            </div>

            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800 underline self-start sm:self-auto"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search student or course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 text-xs"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="input-field text-xs bg-white font-medium"
            >
              <option value="">All Statuses</option>
              <option value="Present">Present Only</option>
              <option value="Late">Late Only</option>
              <option value="Absent">Absent Only</option>
            </select>

            {/* Start Date */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs">
              <span className="text-gray-400 font-medium">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-medium text-gray-700 focus:outline-none w-full"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs">
              <span className="text-gray-400 font-medium">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-medium text-gray-700 focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        {/* History Table */}
        {loadingHistory ? (
          <LoadingSpinner message="Retrieving history logs..." />
        ) : filteredHistory.length === 0 ? (
          <EmptyState
            title="No Attendance Logs Found"
            description="Try changing the date range or status filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Course / Class</th>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredHistory.map((rec) => (
                  <tr key={rec._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-gray-900">
                        {rec.student?.fullName || 'Deleted Student'}
                      </div>
                      <div className="text-xs text-gray-400">{rec.student?.email}</div>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-600">
                      {rec.student?.course || 'General'}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-600 font-medium">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={getStatusBadgeClass(rec.status)}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-gray-400 italic">
                      {rec.note || 'None'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing page <span className="font-bold text-gray-800">{page}</span> of{' '}
              <span className="font-bold text-gray-800">{totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
