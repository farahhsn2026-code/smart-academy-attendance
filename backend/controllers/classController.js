const Class = require('../models/Class');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Get classes (All for Admin, Assigned for Teacher)
// @route   GET /api/classes
// @access  Private (Admin or Teacher)
const getClasses = async (req, res, next) => {
  try {
    let query = {};

    // If teacher, only return assigned classes
    if (req.user.role === 'teacher') {
      query = {
        $or: [
          { teacherId: req.user._id },
          { _id: { $in: req.user.assignedClasses || [] } }
        ],
        isActive: true
      };
    }

    const classes = await Class.find(query)
      .populate('teacherId', 'name email phone')
      .sort({ grade: 1, section: 1, name: 1 });

    // Attach student count to each class
    const classesWithCounts = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ classId: cls._id });
        const obj = cls.toObject();
        obj.studentCount = studentCount;
        return obj;
      })
    );

    res.status(200).json({
      success: true,
      count: classesWithCounts.length,
      data: classesWithCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
const getClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id).populate(
      'teacherId',
      'name email phone'
    );

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // If teacher, check that this class belongs to them
    if (
      req.user.role === 'teacher' &&
      (!cls.teacherId || cls.teacherId._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not assigned to this class.'
      });
    }

    const students = await Student.find({ classId: cls._id }).sort({ fullName: 1 });
    const classData = cls.toObject();
    classData.students = students;
    classData.studentCount = students.length;

    res.status(200).json({
      success: true,
      data: classData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Admin only
const createClass = async (req, res, next) => {
  try {
    const { name, grade, section, academicTerm, teacherId, isActive } = req.body;

    if (!name || !grade) {
      return res.status(400).json({
        success: false,
        message: 'Class name and grade level are required'
      });
    }

    const cls = await Class.create({
      name: name.trim(),
      grade: grade.trim(),
      section: section ? section.trim() : 'A',
      academicTerm: academicTerm ? academicTerm.trim() : 'Fall 2026 / Spring 2027',
      teacherId: teacherId || null,
      isActive: isActive !== undefined ? isActive : true
    });

    // If teacher assigned, update teacher's assignedClasses
    if (teacherId) {
      await User.findByIdAndUpdate(teacherId, {
        $addToSet: { assignedClasses: cls._id }
      });
    }

    const populated = await Class.findById(cls._id).populate('teacherId', 'name email phone');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Class created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Admin only
const updateClass = async (req, res, next) => {
  try {
    const { name, grade, section, academicTerm, teacherId, isActive } = req.body;

    const cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    const previousTeacherId = cls.teacherId ? cls.teacherId.toString() : null;

    if (name) cls.name = name.trim();
    if (grade) cls.grade = grade.trim();
    if (section !== undefined) cls.section = section.trim();
    if (academicTerm) cls.academicTerm = academicTerm.trim();
    if (isActive !== undefined) cls.isActive = isActive;

    if (teacherId !== undefined) {
      cls.teacherId = teacherId || null;

      // If previous teacher was different, remove this class from their assignedClasses
      if (previousTeacherId && previousTeacherId !== teacherId) {
        await User.findByIdAndUpdate(previousTeacherId, {
          $pull: { assignedClasses: cls._id }
        });
      }

      // Add to new teacher's assignedClasses
      if (teacherId) {
        await User.findByIdAndUpdate(teacherId, {
          $addToSet: { assignedClasses: cls._id }
        });
      }
    }

    await cls.save();

    const updated = await Class.findById(cls._id).populate('teacherId', 'name email phone');

    res.status(200).json({
      success: true,
      data: updated,
      message: 'Class updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle class active status
// @route   PATCH /api/classes/:id/status
// @access  Admin only
const updateClassStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isActive status is required'
      });
    }

    const cls = await Class.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(isActive) },
      { new: true }
    ).populate('teacherId', 'name email phone');

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: cls,
      message: `Class ${cls.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Admin only
const deleteClass = async (req, res, next) => {
  try {
    const cls = await Class.findById(req.params.id);

    if (!cls) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Unassign from teachers
    if (cls.teacherId) {
      await User.findByIdAndUpdate(cls.teacherId, {
        $pull: { assignedClasses: cls._id }
      });
    }

    // Clear classId on enrolled students
    await Student.updateMany({ classId: cls._id }, { $unset: { classId: 1 } });

    await Class.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClasses,
  getClass,
  createClass,
  updateClass,
  updateClassStatus,
  deleteClass
};
