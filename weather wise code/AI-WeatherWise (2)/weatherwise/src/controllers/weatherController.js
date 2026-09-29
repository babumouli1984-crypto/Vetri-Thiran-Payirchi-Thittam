const { fetchWeather } = require('../services/weatherService');

// @route GET /api/weather/:city   (public)
const getWeatherByCity = async (req, res, next) => {
  try {
    const data = await fetchWeather(req.params.city);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWeatherByCity };
