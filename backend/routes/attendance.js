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

router.route('/')
  .get(getAttendance)
  .post(createAttendance);

router.post('/bulk', bulkCreateAttendance);

router.route('/:id')
  .get(getAttendanceById)
  .put(updateAttendance)
  .delete(deleteAttendance);

module.exports = router;
