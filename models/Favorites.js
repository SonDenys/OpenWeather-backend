//Import package
const mongoose = require("mongoose");

// Creation model
const Favorites = mongoose.model(
  "Favorites",
  {
    cityName: { type: String, unique: true, sparse: true },
    cityId: { type: Number, unique: true, sparse: true },
  }
  //   // Link the type and the Favorites
  //   owner: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "User",
  //   },
);

module.exports = Favorites;
