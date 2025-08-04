// backend/models/User.js

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  floor: { type: String, default: '' },
  apt: { type: String, default: '' }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isProvider: { type: Boolean, default: false },
  servicesProvided: [String],
  addresses: [addressSchema],
  isOnline: { type: Boolean, default: false } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);