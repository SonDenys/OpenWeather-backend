const https = require("https");
const express = require("express");
const router = express.Router();

// Récupération de la clé d'API à partir des variables d'environnement
const APP_KEY = process.env.APP_KEY;

// Fonction qui renvoie une liste de noms de villes correspondant au nom fourni
// La variable limit sert à spécifier le nombre maximum de résultats retournés
const autoComplete = (cityName, limit, callback) => {
  let url = "";

  // Construction de l'URL pour l'appel à l'API en fonction de si la limite est spécifiée ou non
  if (limit) {
    url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${APP_KEY}`;
  } else {
    url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${APP_KEY}`;
  }

  // Appel à l'API avec l'URL construit ci-dessus
  const req = https.get(url, (res) => {
    let data = "";

    // Gestion du flux de données retournées par l'API
    res.on("data", (chunk) => {
      data += chunk;
    });

    // Fin de la réception de la réponse de l'API
    res.on("end", () => {
      // Conversion de la réponse au format JSON en tableau d'objets JavaScript
      const cities = JSON.parse(data);
      // Extraction des noms de villes dans un tableau séparé
      const cityNames = cities.map((city) => city.name);
      // Appel de la fonction de rappel avec le tableau de noms de villes
      callback(cityNames);
    });
  });

  // Gestion d'erreur pour l'appel à l'API
  req.on("error", (error) => {
    console.log("Error: " + error.message);
  });
};

// Route pour l'autocomplétion des noms de villes
router.get("/autocomplete", (req, res) => {
  const cityName = req.query.q;

  // Vérification que le paramètre de requête est présent
  if (!cityName) {
    return res.status(400).send('Missing query parameter "q"');
  }

  let limit; // Initialisation de la limite

  // Détermination de la limite en fonction de la longueur du nom de ville fourni
  if (cityName.length <= 3) {
    limit = 5;
  } else {
    limit = 1;
  }

  // Appel de la fonction qui renvoie la liste de noms de villes correspondante
  autoComplete(cityName, limit, (cityNames) => {
    // Renvoi de la liste de noms de villes au format JSON
    res.json(cityNames);
  });
});

module.exports = router;
