const express = require("express");
const router = express.Router();
const axios = require("axios");

const City = require("../models/City");
const APP_KEY = process.env.APP_KEY;

const getWeatherData = (city_name) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${API_KEY}`;
  const response = axios.get(url);
  return response.data;
};

const getForecastData = (lat, lon) => {
  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely&appid=${API_KEY}`;
  const response = axios.get(url);
  return response.data;
};

const getScore = (forecastData) => {
  let score = 0;
  forecastData.forEach((data) => {
    if (Math.abs(data.temp - 300) < 3) {
      score += 20;
    }
  });
};

module.exports = router;
