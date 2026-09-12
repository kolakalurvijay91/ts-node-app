import { expect } from "chai";
import sinon from "sinon";
import mongoose from "mongoose";

import { ProductModel, IProduct } from "../../src/models/product.model.js";

import { ProductRepository } from "../../src/repositories/product.repository.js";

describe("ProductRepository Unit Tests", () => {
  let productRepository: ProductRepository;

  beforeEach(() => {
    productRepository = new ProductRepository();
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should create a product", async () => {
    const productData: IProduct = {
      name: "Laptop",
      description: "Business laptop",
      price: 75000,
      quantity: 10,
      category: "Electronics",
    };

    const createdProduct = {
      _id: new mongoose.Types.ObjectId(),
      ...productData,
    };

    const createStub = sinon
      .stub(ProductModel, "create")
      .resolves(createdProduct as never);

    const result = await productRepository.create(productData);

    expect(createStub.calledOnce).to.equal(true);
    expect(createStub.calledWith(productData)).to.equal(true);
    expect(result).to.equal(createdProduct);
  });

  it("should return paginated products", async () => {
    const products = [
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Laptop",
        description: "Business laptop",
        price: 75000,
        quantity: 10,
        category: "Electronics",
      },
      {
        _id: new mongoose.Types.ObjectId(),
        name: "Mouse",
        description: "Wireless mouse",
        price: 1500,
        quantity: 20,
        category: "Accessories",
      },
    ];

    const leanStub = sinon.stub().resolves(products);

    const limitStub = sinon.stub().returns({
      lean: leanStub,
    });

    const skipStub = sinon.stub().returns({
      limit: limitStub,
    });

    sinon.stub(ProductModel, "find").returns({
      skip: skipStub,
    } as never);

    const result = await productRepository.findAll(2, 5);

    expect(skipStub.calledOnceWithExactly(5)).to.equal(true);
    expect(limitStub.calledOnceWithExactly(5)).to.equal(true);
    expect(leanStub.calledOnce).to.equal(true);
    expect(result).to.deep.equal(products);
  });

  it("should find a product by ID", async () => {
    const productId = new mongoose.Types.ObjectId().toString();

    const product = {
      _id: new mongoose.Types.ObjectId(productId),
      name: "Laptop",
      description: "Business laptop",
      price: 75000,
      quantity: 10,
      category: "Electronics",
    };

    const findByIdStub = sinon
      .stub(ProductModel, "findById")
      .resolves(product as never);

    const result = await productRepository.findById(productId);

    expect(findByIdStub.calledOnceWithExactly(productId)).to.equal(true);

    expect(result).to.equal(product);
  });

  it("should count products", async () => {
    const filter = {
      category: "Electronics",
    };

    const countStub = sinon.stub(ProductModel, "countDocuments").resolves(12);

    const result = await productRepository.count(filter);

    expect(countStub.calledOnce).to.equal(true);

    expect(countStub.firstCall.args[0]).to.deep.equal(filter);

    expect(result).to.equal(12);
  });

  it("should update a product by ID", async () => {
    const productId = new mongoose.Types.ObjectId().toString();

    const updateData: Partial<IProduct> = {
      price: 80000,
      quantity: 15,
    };

    const updatedProduct = {
      _id: new mongoose.Types.ObjectId(productId),
      name: "Laptop",
      description: "Business laptop",
      price: 80000,
      quantity: 15,
      category: "Electronics",
    };

    const updateStub = sinon
      .stub(ProductModel, "findByIdAndUpdate")
      .resolves(updatedProduct as never);

    const result = await productRepository.updateById(productId, updateData);

    expect(
      updateStub.calledOnceWithExactly(productId, updateData, {
        new: true,
        runValidators: true,
      }),
    ).to.equal(true);

    expect(result).to.equal(updatedProduct);
  });

  it("should delete a product by ID", async () => {
    const productId = new mongoose.Types.ObjectId().toString();

    const deletedProduct = {
      _id: new mongoose.Types.ObjectId(productId),
      name: "Laptop",
      description: "Business laptop",
      price: 75000,
      quantity: 10,
      category: "Electronics",
    };

    const deleteStub = sinon
      .stub(ProductModel, "findByIdAndDelete")
      .resolves(deletedProduct as never);

    const result = await productRepository.deleteById(productId);

    expect(deleteStub.calledOnceWithExactly(productId)).to.equal(true);

    expect(result).to.equal(deletedProduct);
  });
});
