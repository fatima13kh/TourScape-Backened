const mongoose = require('mongoose');

const attendeesSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quantities: {
    adults: {
      type: Number,
      required: true,
      min: 0,
    },
    children: {
      type: Number,
      default: 0,
      min: 0,
    },
    toddlers: {
      type: Number,
      default: 0,
      min: 0,
    },
    babies: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  totalPaid: {
    type: Number,
    required: true,
    min: 0,
  },
  bookedAt: {
    type: Date,
    default: Date.now,
  },
});

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['adventure', 'cultural', 'relaxation', 'business', 'family'],
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  tripStartDate: {
    type: Date,
    required: true,
  },
  tripEndDate: {
    type: Date,
    required: true,
  },
  location: {
    country: {
      type: String,
      required: true,
    },
    cities: [
      {
        type: String,
        required: true,
      },
    ],
  },
  pricing: {
    adult: {
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      quantity: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    child: {
      price: {
        type: Number,
        default: 0,
        min: 0,
      },
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    toddler: {
      price: {
        type: Number,
        default: 0,
        min: 0,
      },
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    baby: {
      price: {
        type: Number,
        default: 0,
        min: 0,
      },
      quantity: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  /*images: [
    {
      type: String,
      required: true,
    },
  ],*/
  tourGuides: [
    {
      type: String,
      required: true,
    },
  ],
  toursIncluded: [
    {
      type: String,
      required: true,
    },
  ],
  bookingDeadline: {
    type: Date,
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  attendees: [attendeesSchema],
  duration: {
    days: {
      type: Number,
      required: true,
      min: 1,
    },
    nights: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;