const express = require('express');
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employee.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { check } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Only admin can manage employees

router
  .route('/')
  .get(getEmployees)
  .post(
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
      check('employeeCode', 'Employee code is required').not().isEmpty(),
      check('department', 'Department is required').not().isEmpty(),
      check('designation', 'Designation is required').not().isEmpty(),
      check('salary', 'Salary is required').isNumeric(),
      check('joiningDate', 'Joining date is required').not().isEmpty(),
      check('phone', 'Phone number is required').not().isEmpty(),
      check('address', 'Address is required').not().isEmpty(),
      validate,
    ],
    createEmployee
  );

router
  .route('/:id')
  .get(getEmployeeById)
  .put(updateEmployee)
  .delete(deleteEmployee);

module.exports = router;
