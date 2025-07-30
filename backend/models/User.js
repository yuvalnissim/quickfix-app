// backend/models/User.js

const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true },  // למשל: "בית", "עבודה"
  street: { type: String, required: true },
  city: { type: String, required: true },
  zip: { type: String, required: true },
  floor: { type: String, default: '' },     // ✅ קומה (אופציונלי)
  apt: { type: String, default: '' }        // ✅ מספר דירה (אופציונלי)
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isProvider: { type: Boolean, default: false },
  servicesProvided: [String], // רשימת השירותים שיכול לספק
  addresses: [addressSchema]  // ✅ כולל את הקומה והדירה
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
