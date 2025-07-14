const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema({
  name: String,
  subcategories: [
    {
      name: String,
      price: Number  // מחיר קבוע מראש לשירות
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
