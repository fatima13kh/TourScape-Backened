const express = require('express');

const router = express.Router();

const User = require('../models/user');

const verifyToken = require('../middleware/verify-token');

router.get('/', async (req, res) => {
  try {
    // Get a list of all users, but only return their username and _id
    const users = await User.find({}, 'username');

    res.json(users);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/current-user', async (req, res) => {
  try {
    // Get a list of all users, but only return their username and _id
    const user = await User.findById(req.user._id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Get a list of all users, but only return their username and _id
    const user = await User.findById(req.params.id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// update user profile
router.put('/:id', verifyToken, async (req, res) => {
  try {
    // To Ensure the logged-in user matches the profile being updated
    if (req.user._id.toString() != req.params.id) {
      return res.status(403).json({ err: 'You can only edit your own profile' });
    }

    const { username, email, phone, description } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      req.params.id,
      {username, email, phone, description},
      {new: true}
    ).select('-hashedPassword'); // To Exclude password

    res.json(updateUser);

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;
