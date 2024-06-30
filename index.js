// index.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

const API_KEY = '690d53365cdd45b4939173703242906';
const BASE_URL = 'https://api.weatherapi.com/v1';

// Middleware
app.use(express.json());
app.use(cors());

// Temporary storage in memory
let weatherHistory = [];

// Endpoint to fetch weather forecast data including astronomy, daily forecast and hourly data
app.get('/weather', async (req, res) => {
  const { location, days = 14 } = req.query; // Default to 5 days if not specified

  // Check if there's recent weather data for the requested location
  const recentWeather = weatherHistory.find(entry => entry.location.toLowerCase() === location.toLowerCase());
  if (recentWeather) {
    console.log(`Returning cached weather data for ${location}`);
    return res.json(recentWeather.weatherData);
  }

  // If not found in history, fetch from weather API
  try {
    const response = await axios.get(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=${days}`);
    const weatherData = response.data;

    // Store temporary weather data
    const currentTime = new Date();
    const newEntry = {
      location,
      weatherData,
      timestamp: currentTime
    };
    weatherHistory.push(newEntry);

    // Clean up history for entries older than today
    const today = new Date().setHours(0, 0, 0, 0);
    weatherHistory = weatherHistory.filter(entry => new Date(entry.timestamp).setHours(0, 0, 0, 0) === today);

    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Endpoint to get weather history for today
app.get('/weather/history', (req, res) => {
  const today = new Date().setHours(0, 0, 0, 0);
  const todayEntries = weatherHistory.filter(entry => new Date(entry.timestamp).setHours(0, 0, 0, 0) === today);
  res.json(todayEntries);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
