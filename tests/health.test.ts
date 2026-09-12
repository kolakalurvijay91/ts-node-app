import { expect } from "chai";
import request from "supertest";

import app from "../src/app.js";

describe("Health API", () => {
  it("should return API health status", async () => {
    const response = await request(app).get("/health").expect(200);

    expect(response.body).to.deep.equal({
      success: true,
      message: "Product Management API is running",
    });
  });
});

describe("Not Found API", () => {
  it("should return 404 for an unknown route", async () => {
    const response = await request(app).get("/api/unknown").expect(404);

    expect(response.body).to.deep.equal({
      success: false,
      message: "Route not found: GET /api/unknown",
    });
  });
});
