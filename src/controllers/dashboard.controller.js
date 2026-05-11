const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    if (req.user.role === 'admin') {
      const totalEmployees = await Employee.countDocuments();
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayAttendance = await Attendance.find({
        date: { $gte: today, $lt: tomorrow }
      });

      let presentToday = 0;
      let absentToday = 0;

      todayAttendance.forEach(att => {
        if (['Present', 'Half Day', 'Work From Home'].includes(att.status)) {
          presentToday++;
        } else if (att.status === 'Absent') {
          absentToday++;
        }
      });

      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
      const approvedLeaves = await Leave.countDocuments({ status: 'Approved' });
      const rejectedLeaves = await Leave.countDocuments({ status: 'Rejected' });

      return res.status(200).json(new ApiResponse(true, 'Admin stats fetched', {
        totalEmployees,
        presentToday,
        absentToday,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves
      }));
    } else {
      // Employee Dashboard
      if (!req.user.employeeId) {
        return res.status(400).json(new ApiResponse(false, 'No employee profile'));
      }

      const employeeId = req.user.employeeId;
      const employee = await Employee.findById(employeeId);

      const attendanceRecords = await Attendance.find({ employee: employeeId });
      let presentCount = 0;
      let absentCount = 0;

      attendanceRecords.forEach(att => {
        if (['Present', 'Half Day', 'Work From Home'].includes(att.status)) presentCount++;
        else if (att.status === 'Absent') absentCount++;
      });

      const leaves = await Leave.find({ employee: employeeId });
      let pendingLeaves = 0;
      let approvedLeaves = 0;

      leaves.forEach(l => {
        if (l.status === 'Pending') pendingLeaves++;
        else if (l.status === 'Approved') approvedLeaves++;
      });

      return res.status(200).json(new ApiResponse(true, 'Employee stats fetched', {
        attendanceSummary: {
          present: presentCount,
          absent: absentCount,
        },
        leaveSummary: {
          pending: pendingLeaves,
          approved: approvedLeaves,
          balance: employee.leaveBalance,
        },
        recentAttendance: attendanceRecords.slice(0, 5)
      }));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
