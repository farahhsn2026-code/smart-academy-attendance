const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
      maxlength: [100, 'Class name cannot exceed 100 characters']
    },
    grade: {
      type: String,
      required: [true, 'Grade/Level is required'],
      trim: true
    },
    section: {
      type: String,
      trim: true,
      default: 'A'
    },
    academicTerm: {
      type: String,
      trim: true,
      default: 'Fall 2026 / Spring 2027'
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Class', classSchema);
