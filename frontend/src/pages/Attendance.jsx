import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  X as CloseIcon,
  Clock,
  Search,
  Save,
  CheckCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { studentsApi, attendanceApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../components/Toast';
import { getTodayString } from '../utils/helpers';

const STATUSES = [
  { key: 'Present', label: 'Present', color: 'emerald', icon: Check },
  { key: 'Late', label: 'Late', color: 'amber', icon: Clock },
  { key: 'Absent', label: 'Absent', color: 'rose', icon: CloseIcon }
];

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { [studentId]: 'Present' | 'Late' | 'Absent' }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const toast = useToast();

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch active students and existing attendance for the chosen date concurrently
      const [studentsRes, attendanceRes] = await Promise.all([
        studentsApi.getAll({ status: 'Active' }),
        attendanceApi.getAll({ date: selectedDate, limit: 200 })
      ]);

      const activeStudents = studentsRes.data || [];
      setStudents(activeStudents);

      // Populate existing attendance records map
      const mapped = {};
      if (attendanceRes.data) {
        attendanceRes.data.forEach((rec) => {
          const studentId = typeof rec.student === 'object' ? rec.student?._id : rec.student;
          if (studentId) {
            mapped[studentId] = rec.status;
          }
        });
      }

      setAttendanceMap(mapped);
    } catch (err) {
      toast.error(err.message || 'Error loading attendance roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const handleMarkStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleMarkAll = (status) => {
    const nextMap = { ...attendanceMap };
    filteredStudents.forEach((student) => {
      nextMap[student._id] = status;
    });
    setAttendanceMap(nextMap);
    toast.info(`Marked ${filteredStudents.length} students as ${status}`);
  };

  const handleSaveAttendance = async () => {
    const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
      student: studentId,
      date: selectedDate,
      status
    }));

    if (records.length === 0) {
      toast.warning('Please mark status for at least one student before saving.');
      return;
    }

    try {
      setSaving(true);
      const res = await attendanceApi.bulkCreate(records);
      if (res.success) {
        toast.success(`Successfully saved attendance for ${records.length} students`);
        loadData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  // Filter students based on search and course
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse ? student.course === selectedCourse : true;
    return matchesSearch && matchesCourse;
  });

  // Calculate live counters
  const totalStudents = filteredStudents.length;
  const markedPresent = filteredStudents.filter((s) => attendanceMap[s._id] === 'Present').length;
  const markedLate = filteredStudents.filter((s) => attendanceMap[s._id] === 'Late').length;
  const markedAbsent = filteredStudents.filter((s) => attendanceMap[s._id] === 'Absent').length;
  const unrecorded = totalStudents - (markedPresent + markedLate + markedAbsent);

  return (
    <div className="space-y-6">
      {/* Date & Control Panel */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <CalendarIcon size={18} className="text-blue-600 flex-shrink-0" />
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none"
              />
            </div>

            <button
              onClick={loadData}
              className="btn-secondary"
              title="Reload attendance data"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          {/* Quick Mark All & Save Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => handleMarkAll('Present')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-white transition-all shadow-sm"
              >
                All Present
              </button>
              <button
                onClick={() => handleMarkAll('Late')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 hover:bg-white transition-all shadow-sm"
              >
                All Late
              </button>
              <button
                onClick={() => handleMarkAll('Absent')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-white transition-all shadow-sm"
              >
                All Absent
              </button>
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="btn-primary"
            >
              <Save size={18} />
              <span>{saving ? 'Saving Records...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>

        {/* Live Scorebar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase">Present</p>
              <p className="text-2xl font-bold text-emerald-700">{markedPresent}</p>
            </div>
            <Check className="text-emerald-500" size={24} />
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase">Late</p>
              <p className="text-2xl font-bold text-amber-700">{markedLate}</p>
            </div>
            <Clock className="text-amber-500" size={24} />
          </div>

          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase">Absent</p>
              <p className="text-2xl font-bold text-rose-700">{markedAbsent}</p>
            </div>
            <CloseIcon className="text-rose-500" size={24} />
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">Unrecorded</p>
              <p className="text-2xl font-bold text-gray-700">{unrecorded}</p>
            </div>
            <Info className="text-gray-400" size={24} />
          </div>
        </div>
      </div>

      {/* Roster Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search student in roster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="input-field w-full sm:w-auto text-xs font-medium bg-white"
        >
          <option value="">All Cohorts / Classes</option>
          <option value="Full-Stack Web Development">Web Development</option>
          <option value="Data Science & AI">Data Science & AI</option>
          <option value="UI/UX Product Design">UI/UX Design</option>
          <option value="Cybersecurity Analyst">Cybersecurity</option>
          <option value="Cloud & DevOps Engineering">Cloud & DevOps</option>
          <option value="Mobile App Development">Mobile App Dev</option>
        </select>
      </div>

      {/* Students Attendance Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching roster for selected date..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={CheckCheck}
            title="No Active Students Found"
            description="Ensure you have active students enrolled in this course to mark attendance."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6 hidden sm:table-cell">Class / Program</th>
                  <th className="py-3.5 px-6">Status Indicator</th>
                  <th className="py-3.5 px-6 text-right">Attendance Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredStudents.map((student) => {
                  const currentStatus = attendanceMap[student._id];

                  return (
                    <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Student info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center flex-shrink-0 text-sm">
                            {student.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 leading-tight">
                              {student.fullName}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-4 px-6 text-gray-600 hidden sm:table-cell text-xs font-medium">
                        {student.course}
                      </td>

                      {/* Status indicator badge */}
                      <td className="py-4 px-6">
                        {currentStatus ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : currentStatus === 'Late'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-500'
                                  : currentStatus === 'Late'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                            {currentStatus}
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-400 italic">
                            Unrecorded
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex rounded-xl bg-gray-100 p-1 gap-1">
                          {STATUSES.map((s) => {
                            const isSelected = currentStatus === s.key;
                            return (
                              <button
                                key={s.key}
                                type="button"
                                onClick={() => handleMarkStatus(student._id, s.key)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isSelected
                                    ? s.key === 'Present'
                                      ? 'bg-emerald-600 text-white shadow-sm'
                                      : s.key === 'Late'
                                      ? 'bg-amber-500 text-white shadow-sm'
                                      : 'bg-rose-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                }`}
                              >
                                <s.icon size={13} />
                                <span>{s.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;
