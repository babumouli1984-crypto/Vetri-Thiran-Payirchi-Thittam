const { fetchWeather } = require('../services/weatherService');
const { getRecommendation, getSummary } = require('../services/aiService');

// Uses the weather values supplied in the body; if they are missing,
// fetches live weather for the given city instead.
const resolveWeather = async (body) => {
  const { city, temperature, humidity, windSpeed, condition } = body;

  if (!city) {
    const err = new Error('City is required');
    err.statusCode = 400;
    throw err;
  }

  if (temperature === undefined || humidity === undefined || !condition) {
    return fetchWeather(city);
  }

  return {
    city,
    temperature: Number(temperature),
    humidity: Number(humidity),
    windSpeed: windSpeed !== undefined ? Number(windSpeed) : undefined,
    condition
  };
};

// @route POST /api/ai/weather-recommendation
const weatherRecommendation = async (req, res, next) => {
  try {
    const weather = await resolveWeather(req.body);
    const recommendation = await getRecommendation(weather);
    res.json({ success: true, recommendation });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/ai/weather-summary
const weatherSummary = async (req, res, next) => {
  try {
    const weather = await resolveWeather(req.body);
    const summary = await getSummary(weather);
    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
};

module.exports = { weatherRecommendation, weatherSummary };
