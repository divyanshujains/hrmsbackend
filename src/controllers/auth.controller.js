const User = require('../models/User');
const Employee = require('../models/Employee');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Register user & get token
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json(new ApiResponse(false, 'User already exists'));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'employee',
    });

    if (user.role === 'employee') {
      const employee = await Employee.create({
        user: user._id,
        employeeCode: `EMP${Math.floor(Math.random() * 10000)}`,
        department: 'Unassigned',
        designation: 'New Employee',
        salary: 0,
        joiningDate: new Date(),
        phone: '0000000000',
        address: 'Please update',
      });
      user.employeeId = employee._id;
      await user.save();
    }

    generateToken(res, user._id);

    res.status(201).json(new ApiResponse(true, 'User registered successfully', {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId
    }));
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      generateToken(res, user._id);

      res.status(200).json(new ApiResponse(true, 'Login successful', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId
      }));
    } else {
      res.status(401).json(new ApiResponse(false, 'Invalid email or password'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json(new ApiResponse(true, 'Logged out successfully'));
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res, next) => {
  try {
    const user = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      employeeId: req.user.employeeId
    };
    res.status(200).json(new ApiResponse(true, 'User fetched successfully', user));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
};
