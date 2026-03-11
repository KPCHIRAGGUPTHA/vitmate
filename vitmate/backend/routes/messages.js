const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect } = require('../middleware/auth');

// @route  POST /api/messages/:groupId
// @desc   Send message to group
// @access Private
router.post('/:groupId', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message cannot be empty' });
    }

    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Only members can send messages
    const isMember = group.members.find(m => m.regNo === req.user.regNo);
    if (!isMember) {
      return res.status(403).json({ message: 'Only group members can send messages' });
    }

    const message = {
      sender: req.user._id,
      senderName: req.user.name,
      text: text.trim(),
      createdAt: new Date()
    };

    group.messages.push(message);
    await group.save();

    // Return last message
    const savedMsg = group.messages[group.messages.length - 1];
    res.status(201).json(savedMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route  GET /api/messages/:groupId
// @desc   Get all messages for a group
// @access Private
router.get('/:groupId', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .select('messages members')
      .populate('messages.sender', 'name regNo');

    if (!group) return res.status(404).json({ message: 'Group not found' });

    res.json(group.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
