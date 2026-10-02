const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Class = require('../models/Class');

// Helper to normalize date to UTC Midnight (00:00:00.000)
const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

// Helper to get class IDs assigned to teacher
const getTeacherClassIds = async (teacherId, assignedClasses = []) => {
  const classes = await Class.find({
    $or: [
      { teacherId },
      { _id: { $in: assignedClasses } }
    ]
  }).select('_id');
  return classes.map(c => c._id.toString());
};

// @desc    Get attendance records with filtering and pagination
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res, next) => {
  try {
    const { date, studentId, classId, teacherId, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};

    // Role-based scope
    if (req.user.role === 'teacher') {
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (teacherClassIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          total: 0,
          page: 1,
          pages: 1,
          data: []
        });
      }

      if (classId) {
        if (!teacherClassIds.includes(classId.toString())) {
          return res.status(403).json({
            success: false,
            message: 'Access denied. You are not assigned to this class.'
          });
        }
        query.classId = classId;
      } else {
        query.classId = { $in: teacherClassIds };
      }
    } else {
      // Admin filters
      if (classId) query.classId = classId;
      if (teacherId) query.teacherId = teacherId;
    }

    if (date) {
      const normalized = normalizeDate(date);
      const nextDay = new Date(normalized);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      query.date = { $gte: normalized, $lt: nextDay };
    }

    if (startDate && endDate) {
      const start = normalizeDate(startDate);
      const end = normalizeDate(endDate);
      end.setUTCDate(end.getUTCDate() + 1);
      query.date = { $gte: start, $lt: end };
    } else if (startDate) {
      query.date = { $gte: normalizeDate(startDate) };
    } else if (endDate) {
      const end = normalizeDate(endDate);
      end.setUTCDate(end.getUTCDate() + 1);
      query.date = { $lt: end };
    }

    if (studentId) query.student = studentId;
    if (status) query.status = status;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('student', 'fullName email course classId status')
      .populate('classId', 'name grade section')
      .populate('teacherId', 'name email')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: records
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
const getAttendanceById = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id)
      .populate('student', 'fullName email course')
      .populate('classId', 'name grade section')
      .populate('teacherId', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // If teacher, check permission
    if (req.user.role === 'teacher') {
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (
        record.classId &&
        !teacherClassIds.includes(record.classId._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot view attendance for another teacher\'s class.'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark individual attendance
// @route   POST /api/attendance
// @access  Private
const createAttendance = async (req, res, next) => {
  try {
    const { student: studentId, date, status, note, classId } = req.body;

    if (!studentId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Student, date, and status are required'
      });
    }

    // Verify student and class
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const targetClassId = classId || student.classId;

    if (req.user.role === 'teacher') {
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (!targetClassId || !teacherClassIds.includes(targetClassId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. This student does not belong to your assigned classes.'
        });
      }
    }

    const normalizedDate = normalizeDate(date);

    const record = await Attendance.findOneAndUpdate(
      { student: studentId, date: normalizedDate },
      {
        status,
        note: note || '',
        classId: targetClassId || null,
        teacherId: req.user._id
      },
      { upsert: true, new: true, runValidators: true }
    )
      .populate('student', 'fullName email course')
      .populate('classId', 'name grade section')
      .populate('teacherId', 'name email');

    res.status(201).json({
      success: true,
      data: record,
      message: 'Attendance saved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk mark attendance
// @route   POST /api/attendance/bulk
// @access  Private
const bulkCreateAttendance = async (req, res, next) => {
  try {
    const { records, classId } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Records array is required'
      });
    }

    let teacherClassIds = [];
    if (req.user.role === 'teacher') {
      teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (classId && !teacherClassIds.includes(classId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You are not assigned to this class.'
        });
      }
    }

    const saved = [];
    for (const item of records) {
      if (!item.student || !item.date || !item.status) continue;

      let itemClassId = item.classId || classId;
      if (!itemClassId) {
        const studentDoc = await Student.findById(item.student);
        if (studentDoc && studentDoc.classId) itemClassId = studentDoc.classId;
      }

      // Teacher ownership verification
      if (req.user.role === 'teacher' && itemClassId) {
        if (!teacherClassIds.includes(itemClassId.toString())) {
          continue; // Skip student if teacher doesn't own the class
        }
      }

      const normalizedDate = normalizeDate(item.date);
      const updated = await Attendance.findOneAndUpdate(
        { student: item.student, date: normalizedDate },
        {
          status: item.status,
          note: item.note || '',
          classId: itemClassId || null,
          teacherId: req.user._id
        },
        { upsert: true, new: true, runValidators: true }
      );
      saved.push(updated);
    }

    res.status(200).json({
      success: true,
      message: `Successfully processed ${saved.length} attendance records`,
      count: saved.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private
const updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Teacher ownership verification
    if (req.user.role === 'teacher') {
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (
        record.classId &&
        !teacherClassIds.includes(record.classId.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot edit attendance for this class.'
        });
      }
    }

    const updated = await Attendance.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        teacherId: req.user._id // log last modified teacher
      },
      { new: true, runValidators: true }
    )
      .populate('student', 'fullName email course')
      .populate('classId', 'name grade section')
      .populate('teacherId', 'name email');

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin or Teacher owner)
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    if (req.user.role === 'teacher') {
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (
        record.classId &&
        !teacherClassIds.includes(record.classId.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You cannot delete this record.'
        });
      }
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAttendance,
  getAttendanceById,
  createAttendance,
  bulkCreateAttendance,
  updateAttendance,
  deleteAttendance
};
