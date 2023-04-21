const request = require("supertest");
const app = require("../index");

describe("Test /chooseNextTrip route", () => {
  it("should return the correct city and score for two cities", async () => {
    const res = await request(app)
      .get("/chooseNextTrip")
      .query({ city1: "Paris", city2: "Berlin" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.city).toEqual("Berlin"); // Résultat attendu selon notre fonction getScore
    expect(typeof res.body.score).toEqual("number");
  });

  it("should return an error when only one input is provided", async () => {
    const res = await request(app)
      .get("/chooseNextTrip")
      .query({ city1: "Paris" });

    expect(res.statusCode).toEqual(500);
    expect(res.body.message).toEqual("Au moins une ville est manquante");
  });
});
