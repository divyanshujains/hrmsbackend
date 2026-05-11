const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private/Admin
const getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find()
      .populate('employee', 'employeeCode department')
      .populate({
        path: 'employee',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(true, 'Leaves fetched successfully', leaves));
  } catch (error) {
    next(error);
  }
};

// @desc    Get my leave requests
// @route   GET /api/leaves/my
// @access  Private/Employee
const getMyLeaves = async (req, res, next) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json(new ApiResponse(false, 'No employee profile associated with this user'));
    }

    const leaves = await Leave.find({ employee: req.user.employeeId }).sort({ createdAt: -1 });
    res.status(200).json(new ApiResponse(true, 'Leaves fetched successfully', leaves));
  } catch (error) {
    next(error);
  }
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private/Employee
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!req.user.employeeId) {
      return res.status(400).json(new ApiResponse(false, 'No employee profile associated with this user'));
    }

    // Check dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json(new ApiResponse(false, 'End date cannot be before start date'));
    }

    const leave = await Leave.create({
      employee: req.user.employeeId,
      leaveType,
      startDate,
      endDate,
      reason
    });

    res.status(201).json(new ApiResponse(true, 'Leave applied successfully', leave));
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id/status
// @access  Private/Admin
const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json(new ApiResponse(false, 'Leave request not found'));
    }

    leave.status = status;
    leave.approvedBy = req.user._id;

    await leave.save();

    // If approved, we might deduct from leaveBalance, but let's keep it simple for now or implement it.
    if (status === 'Approved') {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const employee = await Employee.findById(leave.employee);
      if (employee) {
        employee.leaveBalance = employee.leaveBalance - diffDays;
        await employee.save();
      }
    }

    res.status(200).json(new ApiResponse(true, 'Leave status updated successfully', leave));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllLeaves,
  getMyLeaves,
  applyLeave,
  updateLeaveStatus,
};
