// backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

// 🔐 רישום משתמש חדש
router.post('/register', async (req, res) => {
  const { email, password, name, phone, isProvider, servicesProvided } = req.body;

  console.log('📥 Received register data:', req.body);

  if (!email || !password || !name || !phone) {
    return res.status(400).json({ error: 'נא למלא את כל השדות הנדרשים' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: '🛑 האימייל כבר קיים' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      phone,
      email,
      password: hashed,
      isProvider,
      servicesProvided: isProvider ? servicesProvided : []
    });

    await newUser.save();
    res.status(201).json({
      message: '🎉 ההרשמה בוצעה בהצלחה',
      token: 'mock-token',
      role: isProvider ? 'provider' : 'client',
      userId: newUser._id
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'שגיאה בעת ההרשמה' });
  }
});

// 🔑 התחברות
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('🔑 Attempt login for:', email);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'אימייל או סיסמה שגויים' });
    }

    res.status(200).json({
      message: '🎉 התחברת בהצלחה',
      token: 'mock-token',
      role: user.isProvider ? 'provider' : 'client',
      userId: user._id
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'שגיאה בעת ההתחברות' });
  }
});

// 🏠 📍 כתובות – RESTful routes

// שליפת כל הכתובות של המשתמש
router.get('/addresses/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });
    res.json(user.addresses || []);
  } catch (err) {
    console.error('❌ Error fetching addresses:', err);
    res.status(500).json({ error: 'שגיאה בשליפת כתובות' });
  }
});

// הוספת כתובת חדשה
router.post('/addresses/:userId', async (req, res) => {
  const { label, street, city, zip, floor = '', apt = '' } = req.body;
  if (!label || !street || !city || !zip) {
    return res.status(400).json({ error: 'נא למלא את כל פרטי הכתובת' });
  }

  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'משתמש לא נמצא' });

    user.addresses.push({ label, street, city, zip, floor, apt });
    await user.save();
    res.status(201).json({ message: '✅ כתובת נוספה', addresses: user.addresses });
  } catch (err) {
    console.error('❌ Error adding address:', err);
    res.status(500).json({ error: 'שגיאה בהוספת כתובת' });
  }
});

// עדכון כתובת לפי אינדקס
router.put('/addresses/:userId/:index', async (req, res) => {
  const { label, street, city, zip, floor = '', apt = '' } = req.body;
  const index = parseInt(req.params.index);

  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.addresses || !user.addresses[index]) {
      return res.status(404).json({ error: 'כתובת לא נמצאה' });
    }

    user.addresses[index] = { label, street, city, zip, floor, apt };
    await user.save();
    res.json({ message: '✏️ כתובת עודכנה', addresses: user.addresses });
  } catch (err) {
    console.error('❌ Error updating address:', err);
    res.status(500).json({ error: 'שגיאה בעדכון כתובת' });
  }
});

// מחיקת כתובת לפי אינדקס
router.delete('/addresses/:userId/:index', async (req, res) => {
  const index = parseInt(req.params.index);

  try {
    const user = await User.findById(req.params.userId);
    if (!user || !user.addresses || !user.addresses[index]) {
      return res.status(404).json({ error: 'כתובת לא נמצאה' });
    }

    user.addresses.splice(index, 1);
    await user.save();
    res.json({ message: '🗑️ כתובת נמחקה', addresses: user.addresses });
  } catch (err) {
    console.error('❌ Error deleting address:', err);
    res.status(500).json({ error: 'שגיאה במחיקת כתובת' });
  }
});

module.exports = router;
