const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceById,
  createAttendance,
  bulkCreateAttendance,
  updateAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');
const { requireAuth } = require('../middleware/auth');

// All attendance operations require authentication
router.use(requireAuth);

router.route('/')
  .get(getAttendance)
  .post(createAttendance);

router.post('/bulk', bulkCreateAttendance);

router.route('/:id')
  .get(getAttendanceById)
  .put(updateAttendance)
  .delete(deleteAttendance);

module.exports = router;
