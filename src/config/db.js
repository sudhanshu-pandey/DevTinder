const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected!");
  } 
  catch (error) {
    console.error("Database connection failed: ", error);
  }
};

module.exports = connectDB;
