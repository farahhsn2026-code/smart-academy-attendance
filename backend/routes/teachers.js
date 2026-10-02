const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  updateTeacherStatus,
  resetTeacherPassword,
  deleteTeacher
} = require('../controllers/teacherController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All teacher management routes require Admin authorization
router.use(requireAuth, requireAdmin);

router.route('/')
  .get(getTeachers)
  .post(createTeacher);

router.route('/:id')
  .get(getTeacher)
  .put(updateTeacher)
  .delete(deleteTeacher);

router.patch('/:id/status', updateTeacherStatus);
router.post('/:id/reset-password', resetTeacherPassword);

module.exports = router;
