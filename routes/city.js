// Import des modules nécessaires
const express = require("express");
const router = express.Router();
const axios = require("axios");
const { config } = require("../config/config.js");

const APP_KEY = config();

// Définition des données météorologiques attendues
const optimalTemp = 27;
const optimalHumidity = 60;
const optimalCloudiness = 15;

// Fonction pour récupérer les données météo actuelles pour une ville donnée
const getWeatherData = async (city_name) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&lang=fr&appid=${APP_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

// Fonction pour récupérer les prévisions météo pour une ville donnée
const getForecastData = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?&lon=${lon}&lat=${lat}&lang=fr&cnt=1&appid=${APP_KEY}`;
  const response = await axios.get(url);
  return response.data;
};

// Fonction qui calcule les différences entre les données météorologiques attendues et réelles d'une ville
function getDatasDiff(forecastData) {
  let tempDiff = 0;
  let humidityDiff = 0;
  let cloudinessDiff = 0;

  forecastData.list.forEach((data) => {
    const tempData = data.main.temp - 273.15; // Formule y(Celius) = x(Kelvin) - 273,15
    const humidityData = data.main.humidity;
    const cloudinessData = data.clouds.all;

    // Calcul les écarts de température, d'humidité et de couverture nuageuse
    if (tempData < optimalTemp) {
      tempDiff += optimalTemp - tempData;
    } else {
      tempDiff += tempData - optimalTemp;
    }

    if (humidityData < optimalHumidity) {
      humidityDiff += optimalHumidity - humidityData;
    } else {
      humidityDiff += humidityData - optimalHumidity;
    }

    if (cloudinessData < optimalCloudiness) {
      cloudinessDiff += optimalCloudiness - cloudinessData;
    } else {
      cloudinessDiff += cloudinessData - optimalCloudiness;
    }
  });

  return [tempDiff, humidityDiff, cloudinessDiff];
}

// Fonction qui calcule le score d'une ville en fonction des différences entre les données météorologiques attendues et réelles.
function getScore(city1, city2) {
  const scores = { scoreCity1: 0, scoreCity2: 0 };

  if (city1.temperature > city2.temperature) {
    scores.scoreCity2 += 20;
  } else {
    scores.scoreCity1 += 20;
  }

  if (city1.humidity > city2.humidity) {
    scores.scoreCity2 += 15;
  } else {
    scores.scoreCity1 += 15;
  }

  if (city1.cloudiness > city2.cloudiness) {
    scores.scoreCity2 += 10;
  } else {
    scores.scoreCity1 += 10;
  }

  return scores;
}

// Définition de la route /chooseNextTrip et traitement de la requête GET
router.get("/chooseNextTrip", async (req, res) => {
  const cityInputValue1 = req.query.city1;
  const cityInputValue2 = req.query.city2;

  if (!cityInputValue1 || !cityInputValue2) {
    res.status(400).json({ message: "Au moins une ville est manquante" });
  } else {
    try {
      // Attente des appels asynchrones pour récupérer les données météorologiques des deux villes
      const [cityWeather1, cityWeather2] = await Promise.all([
        getWeatherData(cityInputValue1),
        getWeatherData(cityInputValue2),
      ]);

      // Attente des appels asynchrones pour récupérer les prévisions météo des deux villes en fonction de leurs coordonnées
      const [cityForecast1, cityForecast2] = await Promise.all([
        getForecastData(cityWeather1.coord.lat, cityWeather1.coord.lon),
        getForecastData(cityWeather2.coord.lat, cityWeather2.coord.lon),
      ]);

      // console.log("cityForecast1 ==", cityForecast1.list);
      // console.log("cityForecast2 ==", cityForecast2.list);

      // Attente des appels asynchrones pour calculer la différence des données entre les prévisions et les données attendues de chaque ville.
      const cityDatasDiff1 = getDatasDiff(cityForecast1);
      const cityDatasDiff2 = getDatasDiff(cityForecast2);

      // console.log("cityDatasDiff1 ==", cityDatasDiff1);
      // console.log("cityDatasDiff2 ==", cityDatasDiff2);

      // Calcul le score de chaque ville à partir des données différences des prévisions.
      const cityScore = getScore(cityDatasDiff1, cityDatasDiff2);

      // Compare les scores de chaque ville et renvoie celle avec le score le plus élevé.
      const result =
        cityScore.scoreCity1 > cityScore.scoreCity2
          ? {
              city: cityInputValue1,
              score: cityScore.scoreCity1,
              temp: cityForecast1.list[0].main.temp - 273.15,
              humidity: cityForecast1.list[0].main.humidity,
              clouds: cityForecast1.list[0].clouds.all,
            }
          : {
              city: cityInputValue2,
              score: cityScore.scoreCity2,
              temp: cityForecast2.list[0].main.temp - 273.15,
              humidity: cityForecast2.list[0].main.humidity,
              clouds: cityForecast2.list[0].clouds.all,
            };

      // Envoie un message JSON avec la ville sélectionnée et son score.
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
