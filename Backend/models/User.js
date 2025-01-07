const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobile_number: { type: String, required: true, unique: true },
  otp: { type: String },
  otp_expiry: { type: Date },
  created_at: { type: Date, default: Date.now },
  email: { type: String, required: true },  
  userProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' },
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
