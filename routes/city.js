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
  const url = `https://api.openweathermap.org/data/2.5/forecast?&lon=${lon}&lat=${lat}&lang=fr&cnt=1&appid=17304dd6384ae9418f6afd8506993ead`;
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
function getScore(cityDatas1, cityDatas2) {
  let scoreCity1 = 0;
  let scoreCity2 = 0;

  if (cityDatas1[0] > cityDatas2[0]) {
    scoreCity2 += 20;
  } else {
    scoreCity1 += 20;
  }

  if (cityDatas1[1] > cityDatas2[1]) {
    scoreCity2 += 15;
  } else {
    scoreCity1 += 15;
  }
  if (cityDatas1[2] > cityDatas2[2]) {
    scoreCity2 += 10;
  } else {
    scoreCity1 += 10;
  }

  return { scoreCity1, scoreCity2 };
}

// Définition de la route /chooseNextTrip et traitement de la requête GET
router.get("/chooseNextTrip", async (req, res) => {
  const cityInputValue1 = req.query.city1;
  const cityInputValue2 = req.query.city2;

  if (!cityInputValue1 || !cityInputValue2) {
    res.status(500).json({ message: "Au moins une ville est manquante" });
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
      const [cityDatasDiff1, cityDatasDiff2] = await Promise.all([
        getDatasDiff(cityForecast1),
        getDatasDiff(cityForecast2),
      ]);

      // console.log("cityDatasDiff1 ==", cityDatasDiff1);
      // console.log("cityDatasDiff2 ==", cityDatasDiff2);

      // Calcul le score de chaque ville à partir des données différences des prévisions.
      const cityScore = getScore(cityDatasDiff1, cityDatasDiff2);

      // console.log("cityScore1 ==", cityScore.scoreCity1);
      // console.log("cityScore2 ==", cityScore.scoreCity2);

      // Compare les scores de chaque ville et renvoie celle avec le score le plus élevé.
      const result =
        cityScore.scoreCity1 > cityScore.scoreCity2
          ? { city: cityInputValue1, score: cityScore.scoreCity1 }
          : { city: cityInputValue2, score: cityScore.scoreCity2 };

      // Envoie un message JSON avec la ville sélectionnée et son score.
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
});

module.exports = router;
