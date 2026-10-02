const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent
} = require('../controllers/studentController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All student routes require authentication
router.use(requireAuth);

router.route('/')
  .get(getStudents)
  .post(createStudent);

router.route('/:id')
  .get(getStudent)
  .put(updateStudent)
  .delete(requireAdmin, deleteStudent); // Only Admin can delete students

module.exports = router;
