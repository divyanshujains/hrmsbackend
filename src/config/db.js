const mongoose = require('mongoose');

const connectDB = async () => {
  try {
   mongoose
     .connect(process.env.MONGO_URI, {
       serverSelectionTimeoutMS: 5000, // 5 seconds mein fail ho jaye agar connect na ho
       family: 4, // Force IPv4
     })
     .catch((err) => console.error("Database Error:", err));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
