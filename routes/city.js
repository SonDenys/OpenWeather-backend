// Import des modules nécessaires
const express = require("express");
const router = express.Router();
const axios = require("axios");

// Définition de la clé d'API pour OpenWeatherMap
const APP_KEY = process.env.APP_KEY;

// Définition des données météorologiques attendues
const optimalTemp = 27;
const optimalHumidity = 60;
const optimalCloudiness = 15;

// Fonction pour récupérer les données météo actuelles pour une ville donnée
const getWeatherData = async (city_name) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&lang=fr&appid=17304dd6384ae9418f6afd8506993ead`;
  const response = await axios.get(url);
  return response.data;
};

// Fonction pour récupérer les prévisions météo pour une ville donnée
const getForecastData = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&lang=fr&appid=17304dd6384ae9418f6afd8506993ead`;
  const response = await axios.get(url);
  return response.data;
};

// Fonction qui calcule les différences entre les données météorologiques attendues et réelles d'une ville
function getDatasDiff(forecastData) {
  let tempDiff = 0;
  let humidityDiff = 0;
  let cloudinessDiff = 0;

  forecastData.forEach((data) => {
    const tempData = data.temp - 273.15; // Formule = x(Kelvin) - 273,15 = y(Celius)
    const humidityData = data.humidity;
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
function getScore(cityDatas1, cityDatas2) {
  let score = 0;
  if (cityDatas1.tempDiff > cityDatas2.tempDiff) {
    score += 20;
  }
  if (cityDatas1.humidityDiff > cityDatas2.humidityDiff) {
    score += 15;
  }
  if (cityDatas1.cloudinessDiff > cityDatas2.cloudinessDiff) {
    score += 10;
  }

  return score;
}

// Définition de la route /chooseNextTrip et traitement de la requête GET
router.get("/chooseNextTrip", async (req, res) => {
  const cityInputValue1 = req.query.city1;
  const cityInputValue2 = req.query.city2;

  try {
    // Attente des appels asynchrones pour récupérer les données météorologiques des deux villes
    const [cityWeather1, cityWeather2] = await Promise.all([
      getWeatherData(cityInputValue1),
      getWeatherData(cityInputValue2),
    ]);

    // Attente des appels asynchrones pour récupérer les prévisions météo des deux villes en fonction de leurs coordonnées
    const [cityForecast1, cityForecast2] = await Promise.all([
      getForecastData(cityWeather1.coord.lon, cityWeather1.coord.lat),
      getForecastData(cityWeather2.coord.lon, cityWeather2.coord.lat),
    ]);

    console.log(cityForecast1);

    // Attente des appels asynchrones pour calculer la différence des données entre les prévisions et les données attendues de chaque ville.
    const [cityDatasDiff1, cityDatasDiff2] = await Promise.all([
      getDatasDiff(cityForecast1),
      getDatasDiff(cityForecast2),
    ]);

    // Calcul le score de chaque ville à partir des données différences des prévisions.
    const cityScore1 = getScore(cityDatasDiff1, cityDatasDiff2);
    const cityScore2 = getScore(cityDatasDiff2, cityDatasDiff1);

    // Compare les scores de chaque ville et renvoie celle avec le score le plus élevé.
    const result =
      cityScore1 > cityScore2
        ? { city: cityInputValue1, score: cityScore1 }
        : { city: cityInputValue2, score: cityScore2 };

    // Envoie un message JSON avec la ville sélectionnée et son score.
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
