const Employee = require('../models/Employee');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');
const bcrypt = require('bcryptjs');

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private/Admin
const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().populate('user', 'name email role');
    res.status(200).json(new ApiResponse(true, 'Employees fetched successfully', employees));
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private/Admin
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'name email role');
    if (!employee) {
      return res.status(404).json(new ApiResponse(false, 'Employee not found'));
    }
    res.status(200).json(new ApiResponse(true, 'Employee fetched successfully', employee));
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private/Admin
const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, role, employeeCode, department, designation, salary, joiningDate, phone, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json(new ApiResponse(false, 'User with this email already exists'));
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
    });

    // Create employee
    const employee = await Employee.create({
      user: user._id,
      employeeCode,
      department,
      designation,
      salary,
      joiningDate,
      phone,
      address,
    });

    // Update user with employeeId
    user.employeeId = employee._id;
    await user.save();

    res.status(201).json(new ApiResponse(true, 'Employee created successfully', employee));
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private/Admin
const updateEmployee = async (req, res, next) => {
  try {
    const { name, department, designation, salary, phone, address } = req.body;

    let employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json(new ApiResponse(false, 'Employee not found'));
    }

    // Update Employee fields
    employee.department = department || employee.department;
    employee.designation = designation || employee.designation;
    employee.salary = salary || employee.salary;
    employee.phone = phone || employee.phone;
    employee.address = address || employee.address;

    await employee.save();

    // Update User field (name)
    if (name) {
      await User.findByIdAndUpdate(employee.user, { name });
    }

    const updatedEmployee = await Employee.findById(req.params.id).populate('user', 'name email role');

    res.status(200).json(new ApiResponse(true, 'Employee updated successfully', updatedEmployee));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json(new ApiResponse(false, 'Employee not found'));
    }

    await User.findByIdAndDelete(employee.user);
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json(new ApiResponse(true, 'Employee deleted successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
