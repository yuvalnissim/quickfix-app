const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// שליפת כל ההודעות של בקשה מסוימת
router.get('/:requestId', async (req, res) => {
  try {
    const messages = await Message.find({ requestId: req.params.requestId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('❌ Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// שמירת הודעה חדשה
router.post('/', async (req, res) => {
  try {
    const newMsg = new Message(req.body);
    const saved = await newMsg.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error saving message:', err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

module.exports = router;
