const express = require('express');
const router = express.Router();
const Category = require('../models/ServiceCategory');

// ✅ יצירת קטגוריה חדשה עם תתי־קטגוריות (שם + מחיר)
router.post('/categories', async (req, res) => {
  try {
    const { name, subcategories } = req.body;

    if (!name || !Array.isArray(subcategories)) {
      return res.status(400).json({ error: 'Missing name or subcategories array' });
    }

    const category = new Category({ name, subcategories });
    const saved = await category.save();

    res.status(201).json({ message: '📁 Category created', category: saved });
  } catch (err) {
    console.error('❌ Error creating category:', err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// 📥 קבלת כל הקטגוריות + תתי־קטגוריות
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error('❌ Error fetching categories:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;
