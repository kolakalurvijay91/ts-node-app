import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import { ProductService } from "../../src/services/product.service";
import { ProductRepository } from "../../src/repositories/product.repository";
import { AppError } from "../../src/errors/app-error";

describe("ProductService Unit Tests", () => {
  let productService: ProductService;
  let productRepository: ProductRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
    productService = new ProductService(productRepository);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getProductById()", () => {
    it("should return a product when the product exists", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      const fakeProduct = {
        _id: new mongoose.Types.ObjectId(productId),
        name: "Wireless Keyboard",
        description: "Mechanical keyboard",
        price: 2500,
        quantity: 10,
        category: "Electronics",
      };

      sinon.stub(productRepository, "findById").resolves(fakeProduct as never);

      const result = await productService.getProductById(productId);

      expect(result).to.deep.equal(fakeProduct);
    });

    it("should throw an error for an invalid product ID", async () => {
      try {
        await productService.getProductById("invalid-id");

        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);

        expect((error as AppError).statusCode).to.equal(400);

        expect((error as AppError).message).to.equal("Invalid product ID");
      }
    });

    it("should throw 404 when the product does not exist", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      sinon.stub(productRepository, "findById").resolves(null);

      try {
        await productService.getProductById(productId);

        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);

        expect((error as AppError).statusCode).to.equal(404);

        expect((error as AppError).message).to.equal("Product not found");
      }
    });
  });
});
