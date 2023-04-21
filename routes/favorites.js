const express = require("express");
const router = express.Router();

// Import models
const Favorites = require("../models/Favorites");

router.post("/favorites/add", async (req, res) => {
  try {
    const favorites = await Favorites.findOne({
      //   owner: req.fields.userId,
      cityName: req.fields.cityName,
      cityId: req.fields.cityId,
    });

    if (!favorites) {
      const newFavorites = new Favorites({
        // owner: req.fields.userId,
        cityName: req.fields.cityName,
        cityId: req.fields.cityId,
      });

      await newFavorites.save();

      res.status(200).json(newFavorites);
    } else {
      res
        .status(409)
        .json({ message: "Cette ville fait déjà partie de tes favoris" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/favorites/delete", async (req, res) => {
  try {
    const cityName = req.fields.cityName;

    // Supprime le document qui a cityName correspondant à cityName
    const result = await Favorites.deleteOne({ cityName: cityName });

    if (result.deletedCount === 0) {
      res.status(409).json("Cette ville n'existe pas dans tes favoris");
    } else {
      res.status(200).send("Favoris supprimés !");
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/favorites", async (req, res) => {
  try {
    const favorites = await Favorites.find();
    // .populate({
    //   path: "owner",
    //   select: "account",
    // })

    res.status(200).json({ favorites: favorites });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
