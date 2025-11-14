const express = require('express');
const User = require('../models/user');
const Tour = require('../models/tour');
const Favourite = require('../models/favourite');

const router = express.Router();

// Add a tour to favourites
router.post('/favourites', async (req, res) => {
  try {
    const { userId, tourId } = req.body;
    // Basic validation
    if (!userId || !tourId) {
      return res.status(400).json({ message: 'Please provide both userId and tourId — I need both to add a favourite.' });
    }

    // Check if the favourite already exists
    const existingFavourite = await Favourite.findOne({ user: userId, tour: tourId });
    if (existingFavourite) {
      return res.status(400).json({ message: 'Looks like you already saved this tour to your favourites.' });
    }

    const favourite = new Favourite({ user: userId, tour: tourId });
    await favourite.save();

    res.status(201).json({ message: 'Nice — tour saved to your favourites!', favourite });
  } catch (error) {
    console.error('Error adding favourite:', error);
    res.status(500).json({ message: "Sorry — something went wrong while saving that favourite. Try again later." });
  }
});

// Get all favourites for a user
router.get('/favourites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'I need a userId to look up favourites.' });
    }

    const favourites = await Favourite.find({ user: userId }).populate('tour');

    if (!favourites || favourites.length === 0) {
      return res.status(200).json({ message: "You don't have any favourites yet — go explore some tours!", favourites: [] });
    }

    res.status(200).json({ message: 'Here are your favourites:', favourites });
  } catch (error) {
    console.error('Error fetching favourites:', error);
    res.status(500).json({ message: 'Sorry — could not fetch favourites right now.' });
  }
});

// Remove a tour from favourites
router.delete('/favourites', async (req, res) => {
  try {
    const { userId, tourId } = req.body;
    if (!userId || !tourId) {
      return res.status(400).json({ message: 'Please tell me which user and tour to remove from favourites.' });
    }

    const favourite = await Favourite.findOneAndDelete({ user: userId, tour: tourId });
    if (!favourite) {
      return res.status(404).json({ message: 'Favourite not found' });
    }

    res.status(200).json({ message: 'Tour removed from favourites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;    
