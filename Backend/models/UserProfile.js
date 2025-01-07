const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: { type: String, default: "Default Name" },
  email: { type: String, required: true },  // Ensure 'email' is required
  address: { type: String, default: "Default Address" },
  phone: { type: String, required: true, }
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = { UserProfile };
