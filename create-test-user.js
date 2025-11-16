const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    if (existingUser) {
      console.log('Test user already exists');
      process.exit(0);
    }

    // Create test user with all required fields
    const hashedPassword = bcrypt.hashSync('TestPass123!', 10);
    const testUser = await User.create({
      username: 'testuser',
      email: 'testuser@example.com',
      phone: '+1234567890',
      hashedPassword: hashedPassword,
      role: 'customer'
    });

    console.log('Test user created successfully:', testUser.username);
    process.exit(0);
  } catch (err) {
    console.error('Error creating test user:', err);
    process.exit(1);
  }
}

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
  createTestUser();
});
