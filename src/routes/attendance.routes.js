const express = require('express');
const {
  getAllAttendance,
  getMyAttendance,
  markAttendance,
} = require('../controllers/attendance.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getAllAttendance);
router.get('/my', authorize('employee'), getMyAttendance);

router.post(
  '/',
  [
    check('date', 'Date is required').not().isEmpty(),
    check('status', 'Status is required').isIn(['Present', 'Absent', 'Half Day', 'Work From Home']),
    validate,
  ],
  markAttendance
);

module.exports = router;
