const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// Create a new post
router.post('/', async (req, res) => {
  const { user, content, media } = req.body;
  try {
    const post = new Post({ user, content, media });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username').sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
