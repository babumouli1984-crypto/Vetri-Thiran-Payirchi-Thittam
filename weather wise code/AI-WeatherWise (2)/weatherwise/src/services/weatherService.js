// Weather retrieval. Uses OpenWeatherMap when OPENWEATHER_API_KEY is set,
// otherwise (or if the upstream call fails) returns deterministic mock data
// so the API keeps working without external keys.

const CONDITIONS = ['Clear', 'Clouds', 'Windy', 'Rain', 'Haze', 'Thunderstorm'];

const hashString = (str) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
};

const mockWeather = (city) => {
  const h = hashString(city.toLowerCase());
  return {
    city: formatCity(city),
    temperature: 18 + (h % 21),          // 18 - 38 C
    humidity: 40 + (h % 51),             // 40 - 90 %
    windSpeed: 3 + (h % 25),             // 3 - 27 km/h
    condition: CONDITIONS[h % CONDITIONS.length],
    isMock: true
  };
};

const formatCity = (city) =>
  city.trim().replace(/\s+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const fetchWeather = async (city) => {
  const name = String(city || '').trim();
  if (!name) {
    const err = new Error('City is required');
    err.statusCode = 400;
    throw err;
  }

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return mockWeather(name);

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(name)}&units=metric&appid=${key}`;
    const response = await fetch(url);

    if (response.status === 404) {
      const err = new Error(`City not found: ${name}`);
      err.statusCode = 404;
      throw err;
    }
    if (!response.ok) throw new Error(`OpenWeatherMap responded with ${response.status}`);

    const data = await response.json();
    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round((data.wind?.speed || 0) * 3.6), // m/s -> km/h
      condition: data.weather?.[0]?.main || 'Unknown',
      isMock: false
    };
  } catch (error) {
    if (error.statusCode) throw error;
    console.warn(`Weather API unavailable, using mock data: ${error.message}`);
    return mockWeather(name);
  }
};

module.exports = { fetchWeather, mockWeather };
