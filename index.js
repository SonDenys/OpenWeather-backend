const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

// Mongoose connect
mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

// Import des routes
const citiesRoutes = require("./routes/city");
app.use(citiesRoutes);

const favoritesRoutes = require("./routes/favorites");
app.use(favoritesRoutes);

const autoCompleteRoutes = require("./routes/autoComplete");
app.use(autoCompleteRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "Page not found !" });
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});

module.exports = app;
