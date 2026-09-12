import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";
import { Request, Response } from "express";

import { AppError } from "../../src/errors/app-error.js";
import { errorMiddleware } from "../../src/middlewares/error.middleware.js";

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

describe("Global Error Middleware Unit Tests", () => {
  let req: Request;
  let res: Response & {
    status: sinon.SinonStub;
    json: sinon.SinonStub;
  };
  let next: sinon.SinonStub;

  beforeEach(() => {
    req = {
      method: "GET",
      originalUrl: "/api/products",
    } as Request;

    res = createMockResponse();

    next = sinon.stub();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should handle AppError correctly", () => {
    const error = new AppError("Product not found", 404);

    errorMiddleware(error, req, res, next);

    expect(res.status.calledOnceWithExactly(404)).to.equal(true);

    expect(
      res.json.calledOnceWithExactly({
        success: false,
        message: "Product not found",
      }),
    ).to.equal(true);
  });

  it("should handle a 400 AppError", () => {
    const error = new AppError("Invalid product data", 400);

    errorMiddleware(error, req, res, next);

    expect(res.status.calledOnceWithExactly(400)).to.equal(true);

    expect(
      res.json.calledOnceWithExactly({
        success: false,
        message: "Invalid product data",
      }),
    ).to.equal(true);
  });

  it("should handle unexpected errors with status 500", () => {
    const error = new Error("Unexpected database failure");

    errorMiddleware(error, req, res, next);

    expect(res.status.calledOnceWithExactly(500)).to.equal(true);

    expect(
      res.json.calledOnceWithExactly({
        success: false,
        message: "Internal server error",
      }),
    ).to.equal(true);
  });

  it("should handle Mongoose validation errors", () => {
    const error = new mongoose.Error.ValidationError();

    error.addError(
      "name",
      new mongoose.Error.ValidatorError({
        path: "name",
        message: "Name is required",
        value: "",
      }),
    );

    errorMiddleware(error, req, res, next);

    expect(res.status.calledOnceWithExactly(400)).to.equal(true);

    expect(res.json.calledOnce).to.equal(true);

    const responseBody = res.json.firstCall.args[0];

    expect(responseBody.success).to.equal(false);

    expect(responseBody.message).to.equal("Validation failed");
  });

  it("should handle Mongoose cast errors", () => {
    const error = new mongoose.Error.CastError("ObjectId", "invalid-id", "_id");

    errorMiddleware(error, req, res, next);

    expect(res.status.calledOnceWithExactly(400)).to.equal(true);

    expect(res.json.calledOnce).to.equal(true);

    const responseBody = res.json.firstCall.args[0];

    expect(responseBody.success).to.equal(false);

    expect(responseBody.message).to.equal("Invalid product ID");
  });
});
