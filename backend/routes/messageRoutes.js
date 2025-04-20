const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Send a message
router.post('/', async (req, res) => {
  const { sender, receiver, content } = req.body;
  try {
    const message = new Message({ sender, receiver, content });
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages between two users
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
