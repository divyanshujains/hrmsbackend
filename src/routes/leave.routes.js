const express = require('express');
const {
  getAllLeaves,
  getMyLeaves,
  applyLeave,
  updateLeaveStatus,
} = require('../controllers/leave.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getAllLeaves);
router.get('/my', authorize('employee'), getMyLeaves);

router.post(
  '/',
  authorize('employee'),
  [
    check('leaveType', 'Leave type is required').isIn(['Sick Leave', 'Casual Leave', 'Paid Leave', 'Unpaid Leave']),
    check('startDate', 'Start date is required').not().isEmpty(),
    check('endDate', 'End date is required').not().isEmpty(),
    check('reason', 'Reason is required').not().isEmpty(),
    validate,
  ],
  applyLeave
);

router.put(
  '/:id/status',
  authorize('admin'),
  [
    check('status', 'Status is required').isIn(['Pending', 'Approved', 'Rejected']),
    validate,
  ],
  updateLeaveStatus
);

module.exports = router;
