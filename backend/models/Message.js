const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  senderId: { type: String, required: true }, // ID של השולח (לקוח או נותן שירות)
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
