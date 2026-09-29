# AI WeatherWise

RESTful backend built with **Node.js**, **Express.js**, **MongoDB (Mongoose)** and **Google Gemini AI**.
It delivers weather metrics plus AI-generated summaries and personalized recommendations, with JWT
authentication, bcrypt password hashing, favorite-location management, request sanitization and
centralized error handling.

The app works out of the box without external keys:
- No `OPENWEATHER_API_KEY` → `/api/weather/:city` returns deterministic mock data (`"isMock": true`).
- No `GEMINI_API_KEY` → AI endpoints use a rule-based fallback recommendation/summary.

## Requirements
- Node.js 18+ (uses the built-in `fetch`) and npm 8+
- MongoDB running locally or a MongoDB Atlas URI
- Postman / Thunder Client for testing

## Setup
```bash
npm install
# edit .env (see below)
npm start          # or: npm run dev  (nodemon)
```

### Environment variables (`.env`)
| Variable | Purpose |
| --- | --- |
| `PORT` | Server port (default 5000; the doc's Postman tests use 5001) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs. Change it |
| `GEMINI_API_KEY` | Google Gemini API key (optional) |
| `GEMINI_MODEL` | Gemini model name (optional, default `gemini-2.5-flash`) |
| `OPENWEATHER_API_KEY` | OpenWeatherMap key (optional) |

## Project structure
```
src/
  config/db.js                  MongoDB connection
  controllers/                  auth, location, weather, ai
  middleware/                   authMiddleware, sanitizeMiddleware, errorMiddleware
  models/                       User, Location
  routes/                       authRoutes, locationRoutes, weatherRoutes, aiRoutes
  services/                     weatherService (OpenWeatherMap + mock), aiService (Gemini + fallback)
  app.js                        Express app, middleware and routes
  server.js                     Connects to DB, then starts the server
postman_collection.json         Ready-to-import API collection
```

## API endpoints
| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | Register (`name`, `email`, `password`) |
| POST | `/api/auth/login` | – | Login (`email`, `password`) |
| GET / PUT | `/api/auth/me` | Bearer | View / update profile |
| GET / POST | `/api/locations` | Bearer | List / add favorite city (`city`, `country`) |
| GET / PUT / DELETE | `/api/locations/:id` | Bearer | Read / update / remove a favorite |
| GET | `/api/weather/:city` | – | Current weather for a city |
| POST | `/api/ai/weather-recommendation` | Bearer | AI clothing/activity advice (`city`, `temperature`, `humidity`, `condition`) |
| POST | `/api/ai/weather-summary` | Bearer | AI natural-language summary (`city`, optionally the metrics) |
| GET | `/api/health` | – | API health check |

If the AI endpoints are called with only a `city`, the current weather is fetched automatically.
Protected routes need the header `Authorization: Bearer <token>` (returned by register/login).

## Example
```
POST /api/auth/register
{ "name": "John Doe", "email": "john@mail.com", "password": "123456" }

GET /api/weather/bangalore
POST /api/ai/weather-recommendation
{ "city": "Bangalore", "temperature": 34, "humidity": 79, "condition": "Windy" }
```
