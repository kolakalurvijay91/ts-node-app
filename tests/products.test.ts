import { expect } from "chai";
import request from "supertest";

import app from "../src/app";

describe("Product API Validation", () => {
  it("should reject a product with invalid data", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: "",
        price: -100,
        quantity: "invalid",
        category: "",
      })
      .expect(400);

    expect(response.body.success).to.equal(false);

    expect(response.body.message).to.equal("Request validation failed");

    expect(response.body.errors).to.be.an("array");
  });
});
