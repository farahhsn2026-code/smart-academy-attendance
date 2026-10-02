const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');

// Helper to get array of class IDs assigned to a teacher
const getTeacherClassIds = async (teacherId, assignedClasses = []) => {
  const classes = await Class.find({
    $or: [
      { teacherId },
      { _id: { $in: assignedClasses } }
    ]
  }).select('_id');
  return classes.map(c => c._id.toString());
};

// @desc    Get all students (Scoped by role: All for Admin, Assigned Classes for Teacher)
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res, next) => {
  try {
    const { search, status, course, classId, gender, sort = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Role-based scoping
    if (req.user.role === 'teacher') {
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (teacherClassIds.length === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }

      if (classId) {
        // Teacher requested a specific class - ensure they own it
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
      // Admin: can filter by specific classId if provided
      if (classId) query.classId = classId;
    }

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
    const students = await Student.find(query)
      .populate('classId', 'name grade section')
      .sort({ [sort]: sortOrder });

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
// @access  Private
const getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('classId', 'name grade section');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // If teacher, verify ownership through class
    if (req.user.role === 'teacher') {
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (!student.classId || !teacherClassIds.includes(student.classId._id.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Student is not in your assigned classes.'
        });
      }
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
// @access  Private (Admin or Teacher for their assigned class)
const createStudent = async (req, res, next) => {
  try {
    const { fullName, email, phone, gender, course, classId, enrollmentDate, status } = req.body;

    // If teacher, verify classId belongs to them
    if (req.user.role === 'teacher') {
      if (!classId) {
        return res.status(400).json({
          success: false,
          message: 'Please assign the student to one of your classes'
        });
      }
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (!teacherClassIds.includes(classId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only add students to your assigned classes.'
        });
      }
    }

    // Auto-fill course from Class name if not provided
    let derivedCourse = course;
    if (classId && (!course || course === 'General')) {
      const cls = await Class.findById(classId);
      if (cls) derivedCourse = cls.name;
    }

    const student = await Student.create({
      fullName,
      email,
      phone,
      gender,
      course: derivedCourse || 'General',
      classId: classId || null,
      enrollmentDate,
      status
    });

    const populated = await Student.findById(student._id).populate('classId', 'name grade section');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Student created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin or Teacher for their assigned class)
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // If teacher, check ownership
    if (req.user.role === 'teacher') {
      const teacherClassIds = await getTeacherClassIds(req.user._id, req.user.assignedClasses);
      if (!student.classId || !teacherClassIds.includes(student.classId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only edit students in your assigned classes.'
        });
      }

      // If attempting to change classId, ensure target class also belongs to this teacher
      if (req.body.classId && !teacherClassIds.includes(req.body.classId.toString())) {
        return res.status(403).json({
          success: false,
          message: 'Cannot reassign student to a class that is not assigned to you.'
        });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('classId', 'name grade section');

    res.status(200).json({
      success: true,
      data: updatedStudent,
      message: 'Student updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student & associated attendance records
// @route   DELETE /api/students/:id
// @access  Admin only
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
