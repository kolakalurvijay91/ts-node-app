import { expect } from "chai";
import request from "supertest";
import mongoose from "mongoose";

import app from "../src/app";
import { validProduct } from "./helpers/product-test-data";

describe("Product API", () => {
  let productId: string;

  describe("POST /api/products", () => {
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

    it("should create a product successfully", async () => {
      const response = await request(app)
        .post("/api/products")
        .send(validProduct)
        .expect(201);

      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Product created successfully");

      expect(response.body.data).to.have.property("_id");
      expect(response.body.data.name).to.equal(validProduct.name);
      expect(response.body.data.price).to.equal(validProduct.price);
      expect(response.body.data.quantity).to.equal(validProduct.quantity);

      productId = response.body.data._id;
    });
  });

  describe("GET /api/products", () => {
    it("should return all products", async () => {
      const response = await request(app).get("/api/products").expect(200);

      expect(response.body.success).to.equal(true);

      expect(response.body.data).to.be.an("object");

      expect(response.body.data.products).to.be.an("array");

      expect(response.body.data).to.have.property("pagination");

      expect(response.body.data.pagination).to.be.an("object");
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/products?page=1&limit=5")
        .expect(200);

      expect(response.body.success).to.equal(true);

      expect(response.body.data).to.be.an("object");

      expect(response.body.data.products).to.be.an("array");

      expect(response.body.data.pagination).to.be.an("object");

      expect(response.body.data.pagination.page).to.equal(1);

      expect(response.body.data.pagination.limit).to.equal(5);
    });
  });

  describe("GET /api/products/:id", () => {
    it("should return a product by ID", async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.success).to.equal(true);
      expect(response.body.data._id).to.equal(productId);
      expect(response.body.data.name).to.equal(validProduct.name);
    });

    it("should reject an invalid product ID", async () => {
      const response = await request(app)
        .get("/api/products/invalid-id")
        .expect(400);

      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Request validation failed");
    });

    it("should return 404 when the product does not exist", async () => {
      const nonExistingId = "507f1f77bcf86cd799439011";

      const response = await request(app)
        .get(`/api/products/${nonExistingId}`)
        .expect(404);

      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Product not found");
    });
  });

  describe("PATCH /api/products/:id", () => {
    it("should update a product successfully", async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .send({
          price: 3000,
          quantity: 15,
        })
        .expect(200);

      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Product updated successfully");

      expect(response.body.data.price).to.equal(3000);
      expect(response.body.data.quantity).to.equal(15);
    });

    it("should reject invalid update data", async () => {
      const response = await request(app)
        .patch(`/api/products/${productId}`)
        .send({
          price: -500,
        })
        .expect(400);

      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Request validation failed");
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete a product successfully", async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .expect(200);

      expect(response.body.success).to.equal(true);
      expect(response.body.message).to.equal("Product deleted successfully");
    });

    it("should return 404 when deleting a non-existing product", async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .expect(404);

      expect(response.body.success).to.equal(false);
      expect(response.body.message).to.equal("Product not found");
    });
  });

  it("should return 400 when product name is missing", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        description: "Product without a name",
        price: 1000,
        quantity: 5,
        category: "Electronics",
      })
      .expect(400);

    expect(response.body.success).to.equal(false);

    expect(response.body.message).to.equal("Request validation failed");

    expect(response.body.errors).to.be.an("array");
  });

  it("should return 400 when price is negative", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: "Invalid Product",
        description: "Product with invalid price",
        price: -100,
        quantity: 5,
        category: "Electronics",
      })
      .expect(400);

    expect(response.body.success).to.equal(false);

    expect(response.body.message).to.equal("Request validation failed");

    expect(response.body.errors).to.be.an("array");
  });

  it("should return 400 when quantity is negative", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: "Invalid Quantity Product",
        description: "Product with invalid quantity",
        price: 1000,
        quantity: -5,
        category: "Electronics",
      })
      .expect(400);

    expect(response.body.success).to.equal(false);

    expect(response.body.message).to.equal("Request validation failed");

    expect(response.body.errors).to.be.an("array");
  });

  it("should return 400 when product ID is invalid", async () => {
    const response = await request(app)
      .get("/api/products/invalid-product-id")
      .expect(400);

    expect(response.body.success).to.equal(false);

    expect(response.body.message).to.equal("Request validation failed");

    expect(response.body.errors).to.be.an("array");
  });

  it("should return 404 when product does not exist", async () => {
    const productId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .get(`/api/products/${productId}`)
      .expect(404);

    expect(response.body).to.deep.equal({
      success: false,
      message: "Product not found",
    });
  });

  it("should return 404 when updating a missing product", async () => {
    const productId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .patch(`/api/products/${productId}`)
      .send({
        price: 9000,
      })
      .expect(404);

    expect(response.body).to.deep.equal({
      success: false,
      message: "Product not found",
    });
  });

  it("should return 404 when deleting a missing product", async () => {
    const productId = new mongoose.Types.ObjectId().toString();

    const response = await request(app)
      .delete(`/api/products/${productId}`)
      .expect(404);

    expect(response.body).to.deep.equal({
      success: false,
      message: "Product not found",
    });
  });

  it("should return 400 when page is invalid", async () => {
    const response = await request(app)
      .get("/api/products?page=0&limit=10")
      .expect(400);

    expect(response.body.success).to.equal(false);

    expect(response.body.message).to.equal("Request validation failed");

    expect(response.body.errors).to.be.an("array");
  });

  it("should return 400 when limit is invalid", async () => {
    const response = await request(app)
      .get("/api/products?page=1&limit=0")
      .expect(400);

    expect(response.body.success).to.equal(false);

    expect(response.body.message).to.equal("Request validation failed");

    expect(response.body.errors).to.be.an("array");
  });
});
