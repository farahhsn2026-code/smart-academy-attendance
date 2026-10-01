const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Get all students (with search, filter, and sort)
// @route   GET /api/students
const getStudents = async (req, res, next) => {
  try {
    const { search, status, course, gender, sort = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    if (search && search.trim() !== '') {
      const regex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { fullName: regex },
        { email: regex },
        { course: regex },
        { phone: regex }
      ];
    }

    if (status) query.status = status;
    if (course) query.course = { $regex: course, $options: 'i' };
    if (gender) query.gender = gender;

    const sortOrder = order === 'asc' ? 1 : -1;
    const students = await Student.find(query).sort({ [sort]: sortOrder });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new student
// @route   POST /api/students
const createStudent = async (req, res, next) => {
  try {
    const student = await Student.create(req.body);

    res.status(201).json({
      success: true,
      data: student,
      message: 'Student created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.status(200).json({
      success: true,
      data: student,
      message: 'Student updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student & associated attendance records
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    await Student.findByIdAndDelete(req.params.id);
    await Attendance.deleteMany({ student: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Student and related attendance records deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
};
