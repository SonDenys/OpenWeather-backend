const request = require("supertest");
const app = require("../index");

describe("Test /chooseNextTrip route", () => {
  it("should return the correct city and score for two cities", async () => {
    const res = await request(app)
      .get("/chooseNextTrip")
      .query({ city1: "Paris", city2: "Berlin" });

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body.score).toEqual("number");

    if (res.body.city === "Paris") {
      expect(res.body.score).toBeGreaterThan(0);
      expect(res.body.city).toEqual("Paris");
    } else if (res.body.city === "Berlin") {
      expect(res.body.score).toBeGreaterThan(0);
      expect(res.body.city).toEqual("Berlin");
    }
  });

  it("should return an error when only one input is provided", async () => {
    const res = await request(app)
      .get("/chooseNextTrip")
      .query({ city1: "Paris" });

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toEqual("Au moins une ville est manquante");
  });
});
