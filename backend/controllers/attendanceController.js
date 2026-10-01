const Attendance = require('../models/Attendance');

// Helper to normalize date to UTC Midnight (00:00:00.000)
const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

// @desc    Get attendance records with filtering and pagination
// @route   GET /api/attendance
const getAttendance = async (req, res, next) => {
  try {
    const { date, studentId, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const query = {};

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
      .populate('student', 'fullName email course status')
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
const getAttendanceById = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id).populate('student', 'fullName email course');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
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
const createAttendance = async (req, res, next) => {
  try {
    const { student, date, status, note } = req.body;

    if (!student || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Student, date, and status are required'
      });
    }

    const normalizedDate = normalizeDate(date);

    // Upsert or create
    const record = await Attendance.findOneAndUpdate(
      { student, date: normalizedDate },
      { status, note: note || '' },
      { upsert: true, new: true, runValidators: true }
    ).populate('student', 'fullName email course');

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
const bulkCreateAttendance = async (req, res, next) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Records array is required'
      });
    }

    const saved = [];
    for (const item of records) {
      if (!item.student || !item.date || !item.status) continue;
      const normalizedDate = normalizeDate(item.date);
      const updated = await Attendance.findOneAndUpdate(
        { student: item.student, date: normalizedDate },
        { status: item.status, note: item.note || '' },
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
const updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('student', 'fullName email course');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: record,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
const deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

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
