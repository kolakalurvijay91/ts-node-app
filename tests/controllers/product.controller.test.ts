import { expect } from "chai";
import sinon from "sinon";
import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

import { ProductController } from "../../src/controller/product.controller";
import { ProductService } from "../../src/services/product.service";

const createMockResponse = () => {
  const response = {
    status: sinon.stub(),
    json: sinon.stub(),
  };

  response.status.returns(response);

  return response as unknown as Response & {
    status: sinon.SinonStub;
    json: sinon.SinonStub;
  };
};

const createMockNext = () => {
  return sinon.stub() as unknown as NextFunction & sinon.SinonStub;
};

describe("ProductController Unit Tests", () => {
  let productService: ProductService;
  let productController: ProductController;

  beforeEach(() => {
    productService = new ProductService();

    productController = new ProductController(productService);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createProduct()", () => {
    it("should create a product and return status 201", async () => {
      const productData = {
        name: "Laptop",
        description: "Business laptop",
        price: 75000,
        quantity: 5,
        category: "Computers",
      };

      const fakeProduct = {
        _id: new mongoose.Types.ObjectId(),
        ...productData,
      };

      sinon
        .stub(productService, "createProduct")
        .resolves(fakeProduct as never);

      const req = {
        body: productData,
      } as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.createProduct(req, res, next);

      expect(res.status.calledWith(201)).to.equal(true);

      expect(
        res.json.calledWith({
          success: true,
          message: "Product created successfully",
          data: fakeProduct,
        }),
      ).to.equal(true);

      expect(next.called).to.equal(false);
    });

    it("should pass service errors to next()", async () => {
      const serviceError = new Error("Database error");

      sinon.stub(productService, "createProduct").rejects(serviceError);

      const req = {
        body: {},
      } as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.createProduct(req, res, next);

      expect(next.calledOnce).to.equal(true);
      expect(next.calledWith(serviceError)).to.equal(true);
    });
  });

  describe("getProducts()", () => {
    it("should return products with status 200", async () => {
      const fakeResult = {
        products: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };

      const getProductsStub = sinon
        .stub(productService, "getProducts")
        .resolves(fakeResult);

      const req = {
        query: {},
      } as unknown as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.getProducts(req, res, next);

      expect(getProductsStub.calledWith(1, 20)).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(
        res.json.calledWith({
          success: true,
          data: fakeResult,
        }),
      ).to.equal(true);

      expect(next.called).to.equal(false);
    });

    it("should read page and limit from query parameters", async () => {
      const fakeResult = {
        products: [],
        pagination: {
          page: 2,
          limit: 5,
          total: 10,
          totalPages: 2,
        },
      };

      const getProductsStub = sinon
        .stub(productService, "getProducts")
        .resolves(fakeResult);

      const req = {
        query: {
          page: "2",
          limit: "5",
        },
      } as unknown as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.getProducts(req, res, next);

      expect(getProductsStub.calledWith(2, 5)).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);
    });
  });

  describe("getProductById()", () => {
    it("should return a product with status 200", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      const fakeProduct = {
        _id: new mongoose.Types.ObjectId(productId),
        name: "Laptop",
        price: 75000,
      };

      sinon
        .stub(productService, "getProductById")
        .resolves(fakeProduct as never);

      const req = {
        params: {
          id: productId,
        },
      } as unknown as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.getProductById(req, res, next);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(
        res.json.calledWith({
          success: true,
          data: fakeProduct,
        }),
      ).to.equal(true);
    });

    it("should pass service errors to next()", async () => {
      const serviceError = new Error("Product not found");

      sinon.stub(productService, "getProductById").rejects(serviceError);

      const req = {
        params: {
          id: "invalid-id",
        },
      } as unknown as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.getProductById(req, res, next);

      expect(next.calledOnce).to.equal(true);
      expect(next.calledWith(serviceError)).to.equal(true);
    });
  });

  describe("updateProduct()", () => {
    it("should update a product and return status 200", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      const updateData = {
        price: 80000,
        quantity: 8,
      };

      const updatedProduct = {
        _id: new mongoose.Types.ObjectId(productId),
        name: "Laptop",
        price: 80000,
        quantity: 8,
      };

      sinon
        .stub(productService, "updateProduct")
        .resolves(updatedProduct as never);

      const req = {
        params: {
          id: productId,
        },
        body: updateData,
      } as unknown as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.updateProduct(req, res, next);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(
        res.json.calledWith({
          success: true,
          message: "Product updated successfully",
          data: updatedProduct,
        }),
      ).to.equal(true);
    });
  });

  describe("deleteProduct()", () => {
    it("should delete a product and return status 200", async () => {
      const productId = new mongoose.Types.ObjectId().toString();

      const deleteStub = sinon.stub(productService, "deleteProduct").resolves();

      const req = {
        params: {
          id: productId,
        },
      } as unknown as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.deleteProduct(req, res, next);

      expect(deleteStub.calledWith(productId)).to.equal(true);

      expect(res.status.calledWith(200)).to.equal(true);

      expect(
        res.json.calledWith({
          success: true,
          message: "Product deleted successfully",
        }),
      ).to.equal(true);
    });

    it("should pass service errors to next()", async () => {
      const serviceError = new Error("Delete failed");

      sinon.stub(productService, "deleteProduct").rejects(serviceError);

      const req = {
        params: {
          id: "invalid-id",
        },
      } as unknown as Request;

      const res = createMockResponse();
      const next = createMockNext();

      await productController.deleteProduct(req, res, next);

      expect(next.calledOnce).to.equal(true);
      expect(next.calledWith(serviceError)).to.equal(true);
    });
  });
});
