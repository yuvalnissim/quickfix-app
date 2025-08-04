const express = require('express');
const router = express.Router();
const Provider = require('../models/User'); // הנחת בסיס: ספקים הם רשומים בטבלת User
const authMiddleware = require('../middleware/authMiddleware');

// ✅ עדכון סטטוס אונליין/אופליין של ספק
router.post('/set-online', authMiddleware, async (req, res) => {
    try {
      const { isOnline } = req.body;
      const userId = req.userId; // ✅ קיבלנו אותו מה־JWT
  
      const updatedProvider = await Provider.findByIdAndUpdate(
        userId,
        { isOnline },
        { new: true }
      );
  
      if (!updatedProvider) {
        return res.status(404).json({ message: 'Provider not found' });
      }
  
      res.json({ message: `Status updated to ${isOnline ? 'online' : 'offline'}` });
    } catch (err) {
      console.error('Error updating online status:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

// ✅ שליפת סטטוס נוכחי של ספק
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json({ isOnline: provider.isOnline || false });
  } catch (err) {
    console.error('Error fetching provider status:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
