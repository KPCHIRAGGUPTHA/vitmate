const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  regNo: {
    type: String,
    required: [true, 'Register number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^\d{2}[A-Z]{3}\d{4}$/, 'Invalid register number format (e.g. 22BCE1001)']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  branch: {
    type: String,
    required: true,
    enum: ['CSE','ECE','EEE','MECH','CIVIL','IT','BIOMED','CHEM','AIDS','AIML','CSD','MIS','ISE','OTHER']
  },
  year: {
    type: String,
    required: true,
    enum: ['1st Year','2nd Year','3rd Year','4th Year','5th Year']
  },
  rank: {
    type: Number,
    required: [true, 'Allotment rank is required'],
    min: 1
  },
  currentGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  avatar: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
