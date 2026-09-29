const express = require('express');
const { getWeatherByCity } = require('../controllers/weatherController');

const router = express.Router();

// Public: no account required
router.get('/:city', getWeatherByCity);

module.exports = router;
