const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isProvider: { type: Boolean, default: false },
  servicesProvided: [String], // רשימת השירותים שהוא נותן
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
