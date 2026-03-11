const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route  GET /api/groups
// @desc   Get all groups with filters
// @access Public
router.get('/', async (req, res) => {
  try {
    const { roomType, ac, block, search } = req.query;
    let query = { isActive: true };

    if (roomType && roomType !== 'ALL') query.roomType = roomType;
    if (block && block !== 'ALL') query.block = block;
    if (ac === 'AC') query.roomType = { $in: ['6AC','4AC','3AC','2AC','1AC'] };
    if (ac === 'NAC') query.roomType = { $in: ['6NAC','4NAC','3NAC','2NAC','1NAC'] };
    if (search) query.title = { $regex: search, $options: 'i' };

    const groups = await Group.find(query)
      .select('-messages')
      .populate('creator', 'name regNo branch year rank')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/groups
// @desc   Create a new group
// @access Private
router.post('/', protect, async (req, res) => {
  try {
    const { title, roomType, block, description } = req.body;

    // Check if user already in a group
    if (req.user.currentGroup) {
      return res.status(400).json({ message: 'You are already in a group. Leave it first.' });
    }

    const group = await Group.create({
      title,
      roomType,
      block,
      description,
      creator: req.user._id,
      members: [{
        user: req.user._id,
        name: req.user.name,
        regNo: req.user.regNo,
        branch: req.user.branch,
        year: req.user.year,
        rank: req.user.rank
      }],
      messages: [{
        sender: req.user._id,
        senderName: req.user.name,
        text: `Group created! Looking for ${roomType} roommates 🏠`
      }]
    });

    // Update user's currentGroup
    await User.findByIdAndUpdate(req.user._id, { currentGroup: group._id });

    const populated = await Group.findById(group._id)
      .populate('creator', 'name regNo branch year rank');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/groups/:id
// @desc   Get single group with messages
// @access Private
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name regNo branch year rank')
      .populate('messages.sender', 'name regNo');

    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/groups/:id/join
// @desc   Join a group
// @access Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    // Check if user already in a group
    if (req.user.currentGroup) {
      return res.status(400).json({ message: 'Leave your current group first' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Check if full
    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: 'Group is full' });
    }

    // Check if already a member
    const alreadyMember = group.members.find(m => m.regNo === req.user.regNo);
    if (alreadyMember) return res.status(400).json({ message: 'Already a member' });

    // Add member
    group.members.push({
      user: req.user._id,
      name: req.user.name,
      regNo: req.user.regNo,
      branch: req.user.branch,
      year: req.user.year,
      rank: req.user.rank
    });

    // Add system message
    group.messages.push({
      sender: req.user._id,
      senderName: 'System',
      text: `${req.user.name} joined the group! 👋`
    });

    await group.save();
    await User.findByIdAndUpdate(req.user._id, { currentGroup: group._id });

    const populated = await Group.findById(group._id)
      .populate('creator', 'name regNo branch year rank');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  POST /api/groups/:id/leave
// @desc   Leave a group
// @access Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Remove member
    group.members = group.members.filter(m => m.regNo !== req.user.regNo);

    // Add system message
    group.messages.push({
      sender: req.user._id,
      senderName: 'System',
      text: `${req.user.name} left the group.`
    });

    // If no members left, deactivate group
    if (group.members.length === 0) {
      group.isActive = false;
    }

    await group.save();
    await User.findByIdAndUpdate(req.user._id, { currentGroup: null });

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  DELETE /api/groups/:id
// @desc   Delete group (creator only)
// @access Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete the group' });
    }

    // Remove group from all members
    await User.updateMany(
      { currentGroup: group._id },
      { currentGroup: null }
    );

    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
