const User = require('../models/User');
const Class = require('../models/Class');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Admin only
const getTeachers = async (req, res, next) => {
  try {
    const teachers = await User.find({ role: 'teacher' })
      .populate('assignedClasses', 'name grade section academicTerm')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Admin only
const getTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' })
      .populate('assignedClasses', 'name grade section academicTerm');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Admin only
const createTeacher = async (req, res, next) => {
  try {
    const { name, email, password, phone, assignedClasses, isActive } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and a temporary password are required'
      });
    }

    // Check if email already registered
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    const teacher = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: password,
      role: 'teacher',
      phone: phone ? phone.trim() : '',
      isActive: isActive !== undefined ? isActive : true,
      assignedClasses: assignedClasses || []
    });

    // Update classes with this teacher's ID
    if (assignedClasses && assignedClasses.length > 0) {
      await Class.updateMany(
        { _id: { $in: assignedClasses } },
        { teacherId: teacher._id }
      );
    }

    const populatedTeacher = await User.findById(teacher._id).populate(
      'assignedClasses',
      'name grade section'
    );

    res.status(201).json({
      success: true,
      data: populatedTeacher,
      message: 'Teacher account created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Admin only
const updateTeacher = async (req, res, next) => {
  try {
    const { name, phone, assignedClasses, isActive } = req.body;

    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    if (name) teacher.name = name.trim();
    if (phone !== undefined) teacher.phone = phone.trim();
    if (isActive !== undefined) teacher.isActive = isActive;

    if (assignedClasses !== undefined) {
      // Unlink previous classes assigned to this teacher
      await Class.updateMany(
        { teacherId: teacher._id },
        { $unset: { teacherId: 1 } }
      );

      // Link newly assigned classes
      if (assignedClasses.length > 0) {
        await Class.updateMany(
          { _id: { $in: assignedClasses } },
          { teacherId: teacher._id }
        );
      }

      teacher.assignedClasses = assignedClasses;
    }

    await teacher.save();

    const updated = await User.findById(teacher._id).populate(
      'assignedClasses',
      'name grade section'
    );

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Teacher updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update teacher status (activate/deactivate)
// @route   PATCH /api/teachers/:id/status
// @access  Admin only
const updateTeacherStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive status is required'
      });
    }

    const teacher = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'teacher' },
      { isActive: Boolean(isActive) },
      { new: true }
    ).populate('assignedClasses', 'name grade section');

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      success: true,
      data: teacher,
      message: `Teacher ${teacher.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset teacher password
// @route   POST /api/teachers/:id/reset-password
// @access  Admin only
const resetTeacherPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    teacher.passwordHash = newPassword;
    await teacher.save();

    res.status(200).json({
      success: true,
      message: `Password reset successfully for ${teacher.name}`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Admin only
const deleteTeacher = async (req, res, next) => {
  try {
    const teacher = await User.findOne({ _id: req.params.id, role: 'teacher' });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Unassign classes
    await Class.updateMany(
      { teacherId: teacher._id },
      { $unset: { teacherId: 1 } }
    );

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  updateTeacherStatus,
  resetTeacherPassword,
  deleteTeacher
};
