const express = require('express');
const router = express.Router();

// In-memory storage - START EMPTY (only admin can add)
let reviews = [
  // Reviews will be added by admin through the UI
  // Hardcoded names removed as requested
];

// GET all reviews
router.get('/', (req, res) => {
  try {
    console.log(`✅ GET /api/reviews - Returning ${reviews.length} reviews`);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('❌ Error in GET /api/reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET single review
router.get('/:id', (req, res) => {
  try {
    const review = reviews.find(r => r._id === req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create review
router.post('/', (req, res) => {
  try {
    const { studentName, position, courseName, text, rating } = req.body;

    if (!studentName || !text) {
      return res.status(400).json({ error: 'Student name and review text are required' });
    }

    const newReview = {
      _id: String(reviews.length + 1),
      studentName,
      position: position || '',
      courseName: courseName || '',
      text,
      rating: rating || 5,
      createdAt: new Date().toISOString(),
    };

    reviews.push(newReview);
    console.log(`✅ Review created: ${studentName}`);

    res.status(201).json(newReview);
  } catch (error) {
    console.error('❌ Error in POST /api/reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE review
router.delete('/:id', (req, res) => {
  try {
    const index = parseInt(req.params.id);
    if (index < 0 || index >= reviews.length) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const deletedReview = reviews.splice(index, 1)[0];
    console.log(`✅ Review deleted: ${deletedReview.studentName}`);

    res.status(200).json({ success: true, deleted: deletedReview });
  } catch (error) {
    console.error('❌ Error in DELETE /api/reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
