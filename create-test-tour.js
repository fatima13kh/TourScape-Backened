const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tourscape');

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  role: { type: String, enum: ['tourCompany', 'customer'], default: null },
  description: { type: String, default: '' },
  favourites: [],
  bookings: [],
  travelPosts: []
});

const User = mongoose.model('User', userSchema);

// Tour schema
const tourSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: { type: String, enum: ['adventure', 'cultural', 'relaxation', 'business', 'family'] },
  datePosted: { type: Date, default: Date.now },
  tripStartDate: Date,
  tripEndDate: Date,
  location: {
    country: String,
    cities: [String]
  },
  pricing: {
    adult: { price: Number, quantity: Number },
    child: { price: Number, quantity: Number },
    toddler: { price: Number, quantity: Number },
    baby: { price: Number, quantity: Number }
  },
  tourGuides: [String],
  toursIncluded: [String],
  bookingDeadline: Date,
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendees: [],
  duration: {
    days: Number,
    nights: Number
  },
  isActive: { type: Boolean, default: true }
});

const Tour = mongoose.model('Tour', tourSchema);

async function createTestTour() {
  try {
    // Find testuser
    const testUser = await User.findOne({ username: 'testuser' });
    if (!testUser) {
      console.log('Test user not found. Please create testuser first.');
      process.exit(1);
    }

    // Update testuser role to tourCompany
    testUser.role = 'tourCompany';
    await testUser.save();
    console.log('Updated testuser role to tourCompany');

    // Check if tour already exists
    const existingTour = await Tour.findOne({ title: 'Amazing Safari Adventure' });
    if (existingTour) {
      console.log('Test tour already exists with ID:', existingTour._id);
      process.exit(0);
    }

    // Create test tour
    const testTour = await Tour.create({
      title: 'Amazing Safari Adventure',
      description: 'Experience the wildlife of Africa in this incredible safari tour',
      category: 'adventure',
      tripStartDate: new Date('2025-12-01'),
      tripEndDate: new Date('2025-12-07'),
      location: {
        country: 'Kenya',
        cities: ['Nairobi', 'Masai Mara']
      },
      pricing: {
        adult: { price: 1500, quantity: 20 },
        child: { price: 750, quantity: 10 },
        toddler: { price: 300, quantity: 5 },
        baby: { price: 0, quantity: 5 }
      },
      tourGuides: ['John Smith', 'Sarah Johnson'],
      toursIncluded: ['Safari drives', 'Accommodation', 'Meals', 'Park fees'],
      bookingDeadline: new Date('2025-11-15'),
      company: testUser._id,
      duration: {
        days: 7,
        nights: 6
      },
      isActive: true
    });

    // Add tour to user's travelPosts
    testUser.travelPosts.push(testTour._id);
    await testUser.save();

    console.log('Test tour created successfully:', testTour._id);
    process.exit(0);
  } catch (err) {
    console.error('Error creating test tour:', err);
    process.exit(1);
  }
}

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
  createTestTour();
});
