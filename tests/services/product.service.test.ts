import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import { ProductService } from "../../src/services/product.service";
import { ProductRepository } from "../../src/repositories/product.repository";
import { AppError } from "../../src/errors/app-error";

import {
  validProductData,
  createProductResponse,
} from "../fixtures/product.fixture";

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

  describe("getProducts()", () => {
    it("should return products with pagination details", async () => {
      const fakeProducts = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Wireless Keyboard",
          description: "Mechanical keyboard",
          price: 2500,
          quantity: 10,
          category: "Electronics",
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: "Wireless Mouse",
          description: "Optical mouse",
          price: 1200,
          quantity: 20,
          category: "Electronics",
        },
      ];

      const findAllStub = sinon
        .stub(productRepository, "findAll")
        .resolves(fakeProducts as never);

      const countStub = sinon.stub(productRepository, "count").resolves(25);

      const result = await productService.getProducts(2, 10);

      expect(result.products).to.deep.equal(fakeProducts);

      expect(result.pagination).to.deep.equal({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });

      expect(findAllStub.calledOnce).to.equal(true);
      expect(findAllStub.calledWith(2, 10)).to.equal(true);

      expect(countStub.calledOnce).to.equal(true);
    });

    it("should use default page and limit values", async () => {
      const findAllStub = sinon.stub(productRepository, "findAll").resolves([]);

      sinon.stub(productRepository, "count").resolves(0);

      const result = await productService.getProducts();

      expect(result.products).to.deep.equal([]);

      expect(result.pagination).to.deep.equal({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });

      expect(findAllStub.calledWith(1, 20)).to.equal(true);
    });

    it("should prevent page from being less than 1", async () => {
      const findAllStub = sinon.stub(productRepository, "findAll").resolves([]);

      sinon.stub(productRepository, "count").resolves(0);

      const result = await productService.getProducts(0, 10);

      expect(result.pagination.page).to.equal(1);

      expect(findAllStub.calledWith(1, 10)).to.equal(true);
    });

    it("should limit the maximum page size to 100", async () => {
      const findAllStub = sinon.stub(productRepository, "findAll").resolves([]);

      sinon.stub(productRepository, "count").resolves(0);

      const result = await productService.getProducts(1, 500);

      expect(result.pagination.limit).to.equal(100);

      expect(findAllStub.calledWith(1, 100)).to.equal(true);
    });
  });

  describe("createProduct()", () => {
    it("should create and return a product", async () => {
      const createdProduct = createProductResponse();

      const createStub = sinon
        .stub(productRepository, "create")
        .resolves(createdProduct as never);

      const result = await productService.createProduct(validProductData);

      expect(createStub.calledOnce).to.equal(true);

      expect(createStub.firstCall.args[0]).to.deep.equal(validProductData);

      expect(result).to.equal(createdProduct);
    });
  });

  describe("updateProduct()", () => {
    it("should update and return a product", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      const updateData = {
        price: 80000,
        quantity: 8,
      };

      const updatedProduct = {
        _id: new mongoose.Types.ObjectId(productId),
        name: "Laptop",
        description: "Business laptop",
        price: 80000,
        quantity: 8,
        category: "Computers",
      };

      const updateStub = sinon
        .stub(productRepository, "updateById")
        .resolves(updatedProduct as never);

      const result = await productService.updateProduct(productId, updateData);

      expect(result).to.deep.equal(updatedProduct);

      expect(updateStub.calledOnce).to.equal(true);

      expect(updateStub.calledWith(productId, updateData)).to.equal(true);
    });

    it("should throw an error when updating with an invalid ID", async () => {
      try {
        await productService.updateProduct("invalid-id", {
          price: 5000,
        });

        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);

        expect((error as AppError).statusCode).to.equal(400);

        expect((error as AppError).message).to.equal("Invalid product ID");
      }
    });

    it("should throw 404 when the product to update does not exist", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      sinon.stub(productRepository, "updateById").resolves(null);

      try {
        await productService.updateProduct(productId, {
          price: 5000,
        });

        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);

        expect((error as AppError).statusCode).to.equal(404);

        expect((error as AppError).message).to.equal("Product not found");
      }
    });
  });
  describe("deleteProduct()", () => {
    it("should delete a product successfully", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      const deletedProduct = {
        _id: new mongoose.Types.ObjectId(productId),
        name: "Laptop",
        description: "Business laptop",
        price: 75000,
        quantity: 5,
        category: "Computers",
      };

      const deleteStub = sinon
        .stub(productRepository, "deleteById")
        .resolves(deletedProduct as never);

      const result = await productService.deleteProduct(productId);

      expect(result).to.equal(undefined);

      expect(deleteStub.calledOnce).to.equal(true);

      expect(deleteStub.calledWith(productId)).to.equal(true);
    });

    it("should throw an error when deleting with an invalid ID", async () => {
      try {
        await productService.deleteProduct("invalid-id");

        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);

        expect((error as AppError).statusCode).to.equal(400);

        expect((error as AppError).message).to.equal("Invalid product ID");
      }
    });

    it("should throw 404 when the product to delete does not exist", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      sinon.stub(productRepository, "deleteById").resolves(null);

      try {
        await productService.deleteProduct(productId);

        expect.fail("Expected an error to be thrown");
      } catch (error) {
        expect(error).to.be.instanceOf(AppError);

        expect((error as AppError).statusCode).to.equal(404);

        expect((error as AppError).message).to.equal("Product not found");
      }
    });
  });
});
