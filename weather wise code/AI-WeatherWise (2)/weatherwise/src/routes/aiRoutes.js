const express = require('express');
const { weatherRecommendation, weatherSummary } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/weather-recommendation', weatherRecommendation);
router.post('/weather-summary', weatherSummary);

module.exports = router;
