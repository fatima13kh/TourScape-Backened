const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Tour = require("../models/tour.js");
const User = require("../models/user.js");
const router = express.Router();

// Create booking
router.post("/", verifyToken, async (req, res) => {
  try {
    // Check if user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ err: "Only customers can book tours" });
    }

    const { tourId, quantities } = req.body;

    // Find the tour
    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ err: "Tour not found" });
    }

    // Check if tour is active // change later as model will be updated
    if (!tour.isActive) {
      return res.status(400).json({ err: "This tour is not available" });
    }

    // Check if booking deadline has passed
    if (new Date() > new Date(tour.bookingDeadline)) {
      return res.status(400).json({ err: "Booking deadline has passed" });
    }

    // Check availability for each category
    if (quantities.adults > tour.pricing.adult.quantity) {
      return res.status(400).json({ err: "Not enough adult spots available" });
    }
    if (quantities.children > (tour.pricing.child?.quantity || 0)) {
      return res.status(400).json({ err: "Not enough child spots available" });
    }
    if (quantities.toddlers > (tour.pricing.toddler?.quantity || 0)) {
      return res.status(400).json({ err: "Not enough toddler spots available" });
    }
    if (quantities.babies > (tour.pricing.baby?.quantity || 0)) {
      return res.status(400).json({ err: "Not enough baby spots available" });
    }

    // Calculate total amount
    const adultTotal = quantities.adults * tour.pricing.adult.price;
    const childTotal = quantities.children * (tour.pricing.child?.price || 0);
    const toddlerTotal = quantities.toddlers * (tour.pricing.toddler?.price || 0);
    const babyTotal = quantities.babies * (tour.pricing.baby?.price || 0);
    const totalAmount = adultTotal + childTotal + toddlerTotal + babyTotal;

    // Create booking data for user's embedded bookings
    const bookingData = {
      tour: tourId,
      quantities: quantities,
      totalPaid: totalAmount
    };

    // Add booking to user's embedded bookings
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { bookings: bookingData } },
      { new: true }
    ).populate('bookings.tour');

    // Create attendee data for tour's embedded attendees
    const attendeeData = {
      user: req.user._id,
      quantities: quantities,
      totalPaid: totalAmount
    };

    // Update tour availability and add attendee
    const updatedTour = await Tour.findByIdAndUpdate(
      tourId,
      {
        $push: { attendees: attendeeData },
        $inc: {
          'pricing.adult.quantity': -quantities.adults,
          'pricing.child.quantity': -quantities.children,
          'pricing.toddler.quantity': -quantities.toddlers,
          'pricing.baby.quantity': -quantities.babies
        }
      },
      { new: true }
    ).populate('company').populate('attendees.user');

    // Get the newly created booking
    const newBooking = user.bookings[user.bookings.length - 1];

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
      tour: updatedTour
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Get user's bookings
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('bookings.tour');

    res.status(200).json({ bookings: user.bookings });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;