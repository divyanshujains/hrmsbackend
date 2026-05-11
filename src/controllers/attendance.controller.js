const Attendance = require('../models/Attendance');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private/Admin
const getAllAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.find()
      .populate('employee', 'employeeCode department')
      .populate({
        path: 'employee',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ date: -1 });
    res.status(200).json(new ApiResponse(true, 'Attendance fetched successfully', attendance));
  } catch (error) {
    next(error);
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my
// @access  Private/Employee
const getMyAttendance = async (req, res, next) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json(new ApiResponse(false, 'No employee profile associated with this user'));
    }

    const attendance = await Attendance.find({ employee: req.user.employeeId }).sort({ date: -1 });
    res.status(200).json(new ApiResponse(true, 'Attendance fetched successfully', attendance));
  } catch (error) {
    next(error);
  }
};

// @desc    Mark attendance
// @route   POST /api/attendance
// @access  Private
const markAttendance = async (req, res, next) => {
  try {
    const { employeeId, date, status } = req.body;

    // Determine target employee ID based on role
    let targetEmployeeId = req.user.employeeId;
    
    // Admin can mark for any employee
    if (req.user.role === 'admin' && employeeId) {
      targetEmployeeId = employeeId;
    }

    if (!targetEmployeeId) {
      return res.status(400).json(new ApiResponse(false, 'Employee ID is required'));
    }

    // Check if attendance already marked for the date
    const parsedDate = new Date(date);
    parsedDate.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(parsedDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const existing = await Attendance.findOne({
      employee: targetEmployeeId,
      date: {
        $gte: parsedDate,
        $lt: nextDate
      }
    });

    if (existing) {
      return res.status(400).json(new ApiResponse(false, 'Attendance already marked for this date'));
    }

    const attendance = await Attendance.create({
      employee: targetEmployeeId,
      date: parsedDate,
      status,
      markedBy: req.user._id
    });

    res.status(201).json(new ApiResponse(true, 'Attendance marked successfully', attendance));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAttendance,
  getMyAttendance,
  markAttendance,
};
