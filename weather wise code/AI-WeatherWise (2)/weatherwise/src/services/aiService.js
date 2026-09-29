// Google Gemini integration with a rule-based fallback so the endpoints
// still respond when GEMINI_API_KEY is missing or the AI call fails.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const describe = ({ city, temperature, humidity, windSpeed, condition }) =>
  `City: ${city}; Temperature: ${temperature}°C; Humidity: ${humidity}%; ` +
  `Wind: ${windSpeed ?? 'n/a'} km/h; Condition: ${condition}`;

const askGemini = async (prompt) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;

  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey: key });
    const response = await ai.models.generateContent({ model: MODEL, contents: prompt });
    const text = (response.text || '').trim();
    return text || null;
  } catch (error) {
    console.warn(`Gemini unavailable, using fallback: ${error.message}`);
    return null;
  }
};

const fallbackRecommendation = ({ temperature, humidity, condition = '' }) => {
  const cond = String(condition).toLowerCase();
  let advice;

  if (temperature >= 30) advice = 'Stay hydrated, and wear light cotton clothes.';
  else if (temperature >= 20) advice = 'Pleasant weather: light layers are enough, great for outdoor activities.';
  else if (temperature >= 10) advice = 'It is cool: carry a light jacket.';
  else advice = 'It is cold: wear warm layers and limit time outdoors.';

  if (/rain|drizzle/.test(cond)) advice += ' Carry an umbrella.';
  else if (/thunder|storm/.test(cond)) advice += ' Avoid open areas and postpone outdoor plans.';
  else if (/snow/.test(cond)) advice += ' Wear waterproof, non-slip footwear.';
  else if (/fog|mist|haze/.test(cond)) advice += ' Visibility may be low, so take care while travelling.';

  if (humidity >= 85 && temperature >= 25) advice += ' It will feel muggy, so take breaks in the shade.';
  return advice;
};

const fallbackSummary = ({ city, temperature, humidity, windSpeed, condition }) =>
  `${city} is currently ${temperature}°C with ${String(condition).toLowerCase()} conditions, ` +
  `${humidity}% humidity` +
  (windSpeed !== undefined ? ` and winds around ${windSpeed} km/h.` : '.');

const getRecommendation = async (weather) => {
  const prompt =
    'You are a helpful weather assistant. Based on these live conditions, give a short, ' +
    'practical recommendation (max 2 sentences) covering clothing and outdoor activities.\n' +
    describe(weather);
  return (await askGemini(prompt)) || fallbackRecommendation(weather);
};

const getSummary = async (weather) => {
  const prompt =
    'You are a helpful weather assistant. Write a friendly natural-language weather summary ' +
    '(max 3 sentences) for these live conditions.\n' + describe(weather);
  return (await askGemini(prompt)) || fallbackSummary(weather);
};

module.exports = { getRecommendation, getSummary };
