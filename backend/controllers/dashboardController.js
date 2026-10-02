const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const User = require('../models/User');

// Helper to get class IDs assigned to teacher
const getTeacherClassIds = async (teacherId, assignedClasses = []) => {
  const classes = await Class.find({
    $or: [
      { teacherId },
      { _id: { $in: assignedClasses } }
    ]
  }).select('_id');
  return classes.map(c => c._id);
};

// @desc    Get dashboard statistics (System-wide for Admin, Scoped for Teacher)
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    const isTeacher = req.user.role === 'teacher';
    let teacherClassIds = [];

    if (isTeacher) {
      teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
    }

    // Build filter queries
    const studentQuery = isTeacher ? { classId: { $in: teacherClassIds } } : {};
    const attendanceScope = isTeacher ? { classId: { $in: teacherClassIds } } : {};

    // Counts
    const totalTeachers = isTeacher ? undefined : await User.countDocuments({ role: 'teacher' });
    const totalClasses = isTeacher
      ? teacherClassIds.length
      : await Class.countDocuments({ isActive: true });

    const totalStudents = await Student.countDocuments(studentQuery);
    const activeStudents = await Student.countDocuments({ ...studentQuery, status: 'Active' });

    // Today's records
    const todayRecords = await Attendance.find({
      ...attendanceScope,
      date: { $gte: todayStart, $lt: todayEnd }
    });

    const presentToday = todayRecords.filter(r => r.status === 'Present').length;
    const absentToday = todayRecords.filter(r => r.status === 'Absent').length;
    const lateToday = todayRecords.filter(r => r.status === 'Late').length;
    const todayTotal = todayRecords.length;
    const todayAttendanceRate = todayTotal > 0
      ? Math.round((presentToday / todayTotal) * 100)
      : 0;

    // Cumulative records
    const totalAttendance = await Attendance.countDocuments(attendanceScope);
    const totalPresent = await Attendance.countDocuments({ ...attendanceScope, status: 'Present' });
    const totalAbsent = await Attendance.countDocuments({ ...attendanceScope, status: 'Absent' });
    const totalLate = await Attendance.countDocuments({ ...attendanceScope, status: 'Late' });
    const overallRate = totalAttendance > 0
      ? Math.round((totalPresent / totalAttendance) * 100)
      : 0;

    // Last 7 days breakdown for trend chart
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setUTCDate(dayStart.getUTCDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

      const records = await Attendance.find({
        ...attendanceScope,
        date: { $gte: dayStart, $lt: dayEnd }
      });

      const pres = records.filter(r => r.status === 'Present').length;
      const abs = records.filter(r => r.status === 'Absent').length;
      const lat = records.filter(r => r.status === 'Late').length;

      last7Days.push({
        date: dayStart.toISOString().split('T')[0],
        present: pres,
        absent: abs,
        late: lat,
        total: records.length
      });
    }

    // Recent 10 attendance records
    const recentAttendance = await Attendance.find(attendanceScope)
      .populate('student', 'fullName email course')
      .populate('classId', 'name grade section')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        role: req.user.role,
        totalTeachers,
        totalClasses,
        totalStudents,
        activeStudents,
        presentToday,
        absentToday,
        lateToday,
        todayTotal,
        todayAttendanceRate,
        totalAttendance,
        totalPresent,
        totalAbsent,
        totalLate,
        overallRate,
        last7Days,
        recentAttendance
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats
};
