// controllers/tours.js
const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Tour = require("../models/tour.js");
const User = require("../models/user.js");
const router = express.Router();

// Routes

// create
router.post("/", verifyToken, async (req, res) => {
  try {
    // Check if user is a tour company
    if (req.user.role !== 'tourCompany') {
      return res.status(403).json({ err: "Only tour companies can create tours" });
    }

    req.body.company = req.user._id;
    const tour = await Tour.create(req.body);
    
    // Add tour to company's travelPosts
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { travelPosts: tour._id } }
    );

    tour._doc.company = req.user;
    res.status(201).json(tour);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// index
router.get("/", verifyToken, async (req, res) => {
  try {
    const tours = await Tour.find({})
      .populate("company")
      .sort({ datePosted: "desc" });
    res.status(200).json(tours);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


// show
router.get("/:tourId", verifyToken, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.tourId).populate("company");
    res.status(200).json(tour);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});


// update
router.put("/:tourId", verifyToken, async (req, res) => {
  try {
    // Find the tour:
    const tour = await Tour.findById(req.params.tourId);

    // Check permissions:
    if (!tour.company.equals(req.user._id)) {
      return res.status(403).json({ err: "You're not allowed to do that!" });
    }

    // Update tour:
    const updatedTour = await Tour.findByIdAndUpdate(
      req.params.tourId,
      req.body,
      { new: true }
    );

    // Append req.user to the company property:
    updatedTour._doc.company = req.user;

    // Issue JSON response:
    res.status(200).json(updatedTour);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// delete
router.delete("/:tourId", verifyToken, async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.tourId);

    if (!tour.company.equals(req.user._id)) {
      return res.status(403).json({ err: "You're not allowed to do that!" });
    }

    // Check if tour has any bookings
    if (tour.attendees && tour.attendees.length > 0) {
      return res.status(400).json({ err: "Cannot delete a tour that already has bookings" });
    }

    // Remove tour from company's travelPosts
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { travelPosts: tour._id } }
    );

    const deletedTour = await Tour.findByIdAndDelete(req.params.tourId);
    res.status(200).json(deletedTour);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;