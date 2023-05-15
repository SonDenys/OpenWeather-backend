// Récupération de la clé d'API à partir des variables d'environnement
const APP_KEY = process.env.APP_KEY;
function config() {
  if (!APP_KEY) {
    console.log("La clé de votre application n'est pas dans le fichier .env");
    return null;
  }
  return APP_KEY;
}

// Fonction qui renvoie une liste de noms de villes correspondant au nom fourni
// La variable limit sert à spécifier le nombre maximum de résultats retournés
function openWeatherMapClient(cityName, limit) {
  let url;
  if (limit) {
    url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${limit}&appid=${APP_KEY}`;
  } else {
    url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=5&appid=${APP_KEY}`;
  }
  return url;
}

module.exports = { config, openWeatherMapClient };
