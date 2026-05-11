const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: 'admin@hrms.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    await User.create({
      name: 'Admin User',
      email: 'admin@hrms.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin user seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error with data seed');
    console.error(error);
    process.exit(1);
  }
};

seedAdmin();
