const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tour',
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

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  hashedPassword: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['tourCompany', 'customer'],
    default: null,
  },
  /*profilePhoto: {
    type: String,
    default: '',
  },*/
  description: {
    type: String,
    default: '',
  },
  favourites: [
    {
      tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
      },
    },
  ],
  bookings: [bookingSchema], // Embedded bookings
  travelPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tour',
    },
  ],
});

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;