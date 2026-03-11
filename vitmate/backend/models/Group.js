const mongoose = require('mongoose');

const ROOM_TYPES = ['6NAC','6AC','4NAC','4AC','3NAC','3AC','2NAC','2AC','1NAC','1AC'];
const ROOM_CAPACITY = { '6NAC':6,'6AC':6,'4NAC':4,'4AC':4,'3NAC':3,'3AC':3,'2NAC':2,'2AC':2,'1NAC':1,'1AC':1 };
const BLOCKS = ['A Block','B Block','C Block','D Block','E Block','G Block','H Block','No Preference'];

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true },
  text: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const groupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Group title is required'],
    trim: true,
    maxlength: 60
  },
  roomType: {
    type: String,
    required: true,
    enum: ROOM_TYPES
  },
  maxMembers: {
    type: Number
  },
  block: {
    type: String,
    enum: BLOCKS,
    default: 'No Preference'
  },
  description: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    regNo: String,
    branch: String,
    year: String,
    rank: Number,
    joinedAt: { type: Date, default: Date.now }
  }],
  messages: [messageSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Auto-set maxMembers from roomType
groupSchema.pre('save', function(next) {
  if (this.isModified('roomType') || this.isNew) {
    this.maxMembers = ROOM_CAPACITY[this.roomType];
  }
  next();
});

// Virtual: spots left
groupSchema.virtual('spotsLeft').get(function() {
  return this.maxMembers - this.members.length;
});

// Virtual: isFull
groupSchema.virtual('isFull').get(function() {
  return this.members.length >= this.maxMembers;
});

groupSchema.set('toJSON', { virtuals: true });
groupSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Group', groupSchema);
