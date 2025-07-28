const express = require('express');
const router = express.Router();
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');

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

// 🆕 קבלת בקשות זמינות שמתאימות לנותן שירות לפי השירותים שהוא נותן
router.get('/available/:providerId', async (req, res) => {
  try {
    const provider = await User.findById(req.params.providerId);
    if (!provider || !provider.isProvider) {
      return res.status(404).json({ error: 'נותן שירות לא נמצא או לא תקין' });
    }

    const matchingRequests = await ServiceRequest.find({
      status: 'pending',
      serviceType: { $in: provider.servicesProvided }
    });

    res.json(matchingRequests);
  } catch (err) {
    console.error('❌ Error fetching available requests:', err);
    res.status(500).json({ error: 'שגיאה בקבלת בקשות זמינות' });
  }
});

// 🆕 אישור בקשה ע"י נותן שירות (שיבוץ)
router.put('/:id/assign', async (req, res) => {
  const { providerId } = req.body;

  try {
    const provider = await User.findById(providerId);
    if (!provider || !provider.isProvider) {
      return res.status(400).json({ error: 'נותן שירות לא תקין' });
    }

    const updated = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'assigned',
        assignedProvider: providerId
      },
      { new: true }
    );

    res.json({ message: '✅ הבקשה שובצה לנותן השירות', request: updated });
  } catch (err) {
    console.error('❌ Error assigning provider:', err);
    res.status(500).json({ error: 'שגיאה בעת שיבוץ נותן שירות' });
  }
});

// ⭐ הוספת דירוג לבקשה שהושלמה
router.put('/:id/rating', async (req, res) => {
  const { rating } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'דירוג חייב להיות בין 1 ל־5' });
  }

  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'בקשה לא נמצאה' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'ניתן לדרג רק בקשה שהושלמה' });
    }

    request.rating = rating;
    await request.save();

    res.json({ message: '⭐ הדירוג נשמר בהצלחה', request });
  } catch (err) {
    console.error('❌ Error saving rating:', err);
    res.status(500).json({ error: 'שגיאה בשמירת הדירוג' });
  }
});

// 📊 סטטיסטיקות פרופיל לספק
router.get('/provider/:providerId/stats', async (req, res) => {
  const { from, to } = req.query;

  try {
    const match = {
      assignedProvider: req.params.providerId,
      status: 'completed'
    };

    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }

    const completedRequests = await ServiceRequest.find(match);

    const totalJobs = completedRequests.length;
    const totalRevenue = completedRequests.reduce((sum, req) => sum + (req.price || 0), 0);
    const ratings = completedRequests.map(r => r.rating).filter(r => r !== null && r !== undefined);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(2)
      : null;

    res.json({ totalJobs, totalRevenue, avgRating });
  } catch (err) {
    console.error('❌ Error fetching provider stats:', err);
    res.status(500).json({ error: 'שגיאה בקבלת נתוני ספק' });
  }
});

module.exports = router;
