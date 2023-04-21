const request = require("supertest");
const app = require("../index");
const Favorites = require("../models/Favorites");
const mongoose = require("mongoose");

describe("test favorites routes", () => {
  // Hook qui s'exécute avant chaque test afin d'éviter les doublons
  beforeEach(async () => {
    await Favorites.deleteMany({});
  });

  // Test POST /favorites/add
  describe("POST /favorites/add", () => {
    it("should add a new favorite", async () => {
      const response = await request(app)
        .post("/favorites/add")
        .send({ cityName: "Paris", cityId: 12345 });

      expect(response.status).toBe(200);
      expect(response.body.cityName).toBe("Paris");
      expect(response.body.cityId).toBe(12345);

      const favoriteInDb = await Favorites.findOne({ cityName: "Paris" });
      expect(favoriteInDb.cityId).toBe(12345);
    });

    it("should return an error if the city is already in favorites", async () => {
      const existingFavorite = new Favorites({
        cityName: "Paris",
        cityId: 12345,
      });

      await existingFavorite.save();

      const response = await request(app)
        .post("/favorites/add")
        .send({ cityName: "Paris", cityId: 12345 });

      expect(response.status).toBe(409);
      expect(response.body.message).toBe(
        "Cette ville fait déjà partie de tes favoris"
      );
    });
  });

  // Test POST /favorites/delete
  describe("POST /favorites/delete", () => {
    it("should delete a favorite by cityName", async () => {
      const existingFavorite = new Favorites({
        cityName: "Paris",
        cityId: 12345,
      });

      await existingFavorite.save();

      const response = await request(app)
        .post("/favorites/delete")
        .send({ cityName: "Paris" });

      expect(response.status).toBe(200);
      expect(response.text).toBe("Favoris supprimés !");

      const favoriteInDb = await Favorites.findOne({ cityName: "Paris" });
      expect(favoriteInDb).toBeNull();
    });

    it("should return an error if the city does not exist in favorites", async () => {
      const response = await request(app)
        .post("/favorites/delete")
        .send({ cityName: "Londres" });

      expect(response.status).toBe(409);
      expect(response.body).toBe("Cette ville n'existe pas dans tes favoris");
    });
  });

  // Test GET /favorites
  describe("GET /favorites", () => {
    it("should return all favorites", async () => {
      const favorite1 = new Favorites({
        cityName: "Paris",
        cityId: 12345,
      });

      const favorite2 = new Favorites({
        cityName: "Londres",
        cityId: 67890,
      });

      await favorite1.save();
      await favorite2.save();

      const response = await request(app).get("/favorites");

      expect(response.status).toBe(200);
      expect(response.body.favorites.length).toBe(2);
      expect(response.body.favorites[0].cityName).toBe("Paris");
      expect(response.body.favorites[0].cityId).toBe(12345);
      expect(response.body.favorites[1].cityName).toBe("Londres");
      expect(response.body.favorites[1].cityId).toBe(67890);
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
