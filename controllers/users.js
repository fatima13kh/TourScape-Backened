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

// Get user's favorites with populated tour data
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favourites.tour',
        populate: {
          path: 'company',
          select: 'username email description'
        }
      });

    res.json(user.favourites);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Add tour to favorites
router.post('/favorites/:tourId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Check if tour is already in favorites
    const alreadyFavorited = user.favourites.some(
      fav => fav.tour.toString() === req.params.tourId
    );

    if (alreadyFavorited) {
      return res.status(400).json({ err: 'Tour already in favorites' });
    }

    // Add tour to favorites
    user.favourites.push({ tour: req.params.tourId });
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Remove tour from favorites
router.delete('/favorites/:tourId', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Remove tour from favorites
    user.favourites = user.favourites.filter(
      fav => fav.tour.toString() !== req.params.tourId
    );

    await user.save();

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
