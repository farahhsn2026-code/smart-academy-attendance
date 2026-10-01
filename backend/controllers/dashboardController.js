const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));
    const todayEnd = new Date(todayStart);
    todayEnd.setUTCDate(todayEnd.getUTCDate() + 1);

    // Counts
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: 'Active' });

    // Today's records
    const todayRecords = await Attendance.find({
      date: { $gte: todayStart, $lt: todayEnd }
    });

    const presentToday = todayRecords.filter(r => r.status === 'Present').length;
    const absentToday = todayRecords.filter(r => r.status === 'Absent').length;
    const lateToday = todayRecords.filter(r => r.status === 'Late').length;
    const todayTotal = todayRecords.length;
    const todayAttendanceRate = todayTotal > 0
      ? Math.round((presentToday / todayTotal) * 100)
      : 0;

    // Overall records
    const totalAttendance = await Attendance.countDocuments();
    const totalPresent = await Attendance.countDocuments({ status: 'Present' });
    const totalAbsent = await Attendance.countDocuments({ status: 'Absent' });
    const totalLate = await Attendance.countDocuments({ status: 'Late' });
    const overallRate = totalAttendance > 0
      ? Math.round((totalPresent / totalAttendance) * 100)
      : 0;

    // Last 7 days breakdown for trends
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(todayStart);
      dayStart.setUTCDate(dayStart.getUTCDate() - i);
      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

      const records = await Attendance.find({
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
    const recentAttendance = await Attendance.find()
      .populate('student', 'fullName email course')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
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
