import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Check,
  X as CloseIcon,
  Clock,
  Search,
  Save,
  BookOpen,
  RefreshCw,
  Info
} from 'lucide-react';
import { studentsApi, attendanceApi, classesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  const { isTeacher, isAdmin } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const toast = useToast();

  // 1. Load available classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const res = await classesApi.getAll();
        if (res.success && res.data.length > 0) {
          setClasses(res.data);
          setSelectedClassId(res.data[0]._id);
        } else {
          setClasses([]);
        }
      } catch (err) {
        toast.error('Failed to load class list');
      } finally {
        setLoadingClasses(false);
      }
    };

    fetchClasses();
  }, []);

  // 2. Load student roster & existing attendance when date or class changes
  const loadRoster = async () => {
    if (!selectedClassId) {
      setStudents([]);
      setAttendanceMap({});
      return;
    }

    try {
      setLoadingRoster(true);

      const [studentsRes, attendanceRes] = await Promise.all([
        studentsApi.getAll({ classId: selectedClassId, status: 'Active' }),
        attendanceApi.getAll({ date: selectedDate, classId: selectedClassId, limit: 200 })
      ]);

      const activeStudents = studentsRes.data || [];
      setStudents(activeStudents);

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
      toast.error(err.message || 'Error loading attendance records');
    } finally {
      setLoadingRoster(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      loadRoster();
    }
  }, [selectedDate, selectedClassId]);

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
    toast.info(`Marked all ${filteredStudents.length} students as ${status}`);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId) {
      toast.warning('Please select a class first');
      return;
    }

    const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
      student: studentId,
      date: selectedDate,
      classId: selectedClassId,
      status
    }));

    if (records.length === 0) {
      toast.warning('Please mark status for at least one student before saving.');
      return;
    }

    try {
      setSaving(true);
      const res = await attendanceApi.bulkCreate(records, selectedClassId);
      if (res.success) {
        toast.success(`Successfully saved attendance for ${records.length} students`);
        loadRoster();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const term = search.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(term) ||
      student.email.toLowerCase().includes(term)
    );
  });

  const markedPresent = filteredStudents.filter((s) => attendanceMap[s._id] === 'Present').length;
  const markedLate = filteredStudents.filter((s) => attendanceMap[s._id] === 'Late').length;
  const markedAbsent = filteredStudents.filter((s) => attendanceMap[s._id] === 'Absent').length;
  const unrecorded = filteredStudents.length - (markedPresent + markedLate + markedAbsent);

  if (loadingClasses) {
    return <LoadingSpinner message="Loading classes..." />;
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title={isTeacher ? 'No Assigned Classes' : 'No Classes Created'}
        description={
          isTeacher
            ? 'You are not currently assigned as the instructor for any class cohorts. Please contact the administrator.'
            : 'Create classes in the Classes page before recording attendance.'
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Date & Class Selection Panel */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Class Selector Dropdown */}
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
              <BookOpen size={18} className="text-blue-600 flex-shrink-0" />
              <label className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Class:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="bg-transparent text-sm font-bold text-blue-950 focus:outline-none cursor-pointer"
              >
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id} className="text-gray-900">
                    {cls.name} ({cls.grade} - Sec {cls.section})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
              <CalendarIcon size={18} className="text-gray-500 flex-shrink-0" />
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
              onClick={loadRoster}
              className="btn-secondary"
              title="Reload roster"
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

      {/* Roster Search Bar */}
      <div className="card p-4 flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            type="text"
            placeholder="Search student in class roster..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>

        <div className="text-xs font-medium text-gray-500">
          Enrolled in Class: <span className="font-bold text-gray-800">{students.length}</span>
        </div>
      </div>

      {/* Class Attendance Roster Table */}
      <div className="card overflow-hidden">
        {loadingRoster ? (
          <LoadingSpinner message="Fetching students for selected class..." />
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No Active Students Enrolled"
            description="There are currently no active students assigned to this class cohort."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6 hidden sm:table-cell">Status Indicator</th>
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

                      {/* Status indicator badge */}
                      <td className="py-4 px-6 hidden sm:table-cell">
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
