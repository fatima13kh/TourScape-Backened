const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const User = require("../models/user.js");
const Tour = require("../models/tour.js");
const router = express.Router();

// Get all companies (tour companies only)
router.get("/", verifyToken, async (req, res) => {
  try {
    const companies = await User.find({ role: 'tourCompany' })
      .select('username email description phone')
      .sort({ username: 1 });

    res.status(200).json(companies);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

// Get single company profile with their tours
router.get("/:companyId", verifyToken, async (req, res) => {
  try {
    const company = await User.findById(req.params.companyId)
      .select('username email description phone role');
    
    if (!company || company.role !== 'tourCompany') {
      return res.status(404).json({ err: "Company not found" });
    }

    // Get company's tours
    const tours = await Tour.find({ 
      company: req.params.companyId,
      isActive: true 
    }).sort({ datePosted: "desc" });

    res.status(200).json({
      company,
      tours
    });
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
});

module.exports = router;