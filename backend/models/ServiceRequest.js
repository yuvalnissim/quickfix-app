const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  serviceType: String,
  description: String,
  status: {
    type: String,
    enum: ['pending', 'assigned', 'completed'],
    default: 'pending'
  },
  assignedProvider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: Number,
  address: String,
  scheduledAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
