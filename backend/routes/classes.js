const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  updateClassStatus,
  deleteClass
} = require('../controllers/classController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// All class routes require authentication
router.use(requireAuth);

router.route('/')
  .get(getClasses) // Teachers get assigned classes, Admin gets all
  .post(requireAdmin, createClass);

router.route('/:id')
  .get(getClass)
  .put(requireAdmin, updateClass)
  .delete(requireAdmin, deleteClass);

router.patch('/:id/status', requireAdmin, updateClassStatus);

module.exports = router;
