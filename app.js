const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Basic route
app.get('/', (req, res) => {
  res.send('HRMS API is running');
});

// Routes will be imported here
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/employees', require('./src/routes/employee.routes'));
app.use('/api/attendance', require('./src/routes/attendance.routes'));
app.use('/api/leaves', require('./src/routes/leave.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));

// Error Middleware will be added here
app.use(require('./src/middleware/error.middleware').errorHandler);

module.exports = app;
