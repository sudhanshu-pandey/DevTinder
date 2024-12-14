const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isEmail, isStrongPassword, isMobilePhone } = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 4,
    maxlength:50,
  },
  lastName: {
    type: String,
    required: true,
    minlength: 4,
  },
  //if you make field unique then mongodb automatically create it index to true
  email: {
    type: String,
    required: true,
    trim:true,
    lowercase: true,
    unique: true,
    validate: [isEmail, 'Please enter a valid email address'],
  },
  password: {
    type: String,
    required: true,
    validate: [isStrongPassword, 'Please enter a strong password']
  },
  mobileNo: {
    type: String,
    validate: [isMobilePhone,'Please enter valid mobile number']
  },
  gender: {
    type: String,
    enum: {
      values: ['Male', 'Female', 'Other'],
      message: '{VALUE} is not valid gender type'
    }
  },
  about: {
    type: String,
    maxlength: 100,
    default: "I am a software developer"
  },
  skills: {
    type: [String],
    default: ["developer"]
  },
  photoURL: {
    type: String,
    default: "https://www.ijaist.com/wp-content/uploads/2018/02/default-male-photo.png"
  }
},{timestamps: true});

// Password hashing before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = new mongoose.model('User', userSchema);

module.exports = User;
