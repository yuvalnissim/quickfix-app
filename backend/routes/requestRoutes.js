// routes/requestRoutes.js
const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');

// ✅ יצירת בקשת שירות חדשה
router.post('/', async (req, res) => {
  try {
    const newRequest = new ServiceRequest(req.body);
    const saved = await newRequest.save();
    res.status(201).json({ message: '📨 Service request created', request: saved });
  } catch (err) {
    console.error('❌ Error creating service request:', err);
    res.status(500).json({ error: 'Failed to create service request' });
  }
});

// 📥 קבלת כל הבקשות של משתמש לפי ID
router.get('/user/:userId', async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ userId: req.params.userId });
    res.json(requests);
  } catch (err) {
    console.error('❌ Error fetching requests:', err);
    res.status(500).json({ error: 'Failed to fetch service requests' });
  }
});

// 🧑‍🔧 קבלת כל הבקשות שהוקצו לנותן שירות
router.get('/provider/:providerId', async (req, res) => {
  try {
    const assigned = await ServiceRequest.find({ assignedProvider: req.params.providerId });
    res.json(assigned);
  } catch (err) {
    console.error('❌ Error fetching assigned requests:', err);
    res.status(500).json({ error: 'Failed to fetch assigned requests' });
  }
});

// ✅ עדכון סטטוס בקשה (למשל: completed)
router.put('/:id/status', async (req, res) => {
  try {
    const updated = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json({ message: '🛠️ Status updated', request: updated });
  } catch (err) {
    console.error('❌ Error updating status:', err);
    res.status(500).json({ error: 'Failed to update request status' });
  }
});

module.exports = router;
