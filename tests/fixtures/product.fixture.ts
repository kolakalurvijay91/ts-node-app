import mongoose from "mongoose";

import { IProduct } from "../../src/models/product.model";

export type ProductTestResponse = IProduct & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const validProductData: IProduct = {
  name: "Laptop",
  description: "Business laptop",
  price: 75000,
  quantity: 10,
  category: "Electronics",
};

export const anotherProductData: IProduct = {
  name: "Wireless Mouse",
  description: "Wireless mouse with USB receiver",
  price: 1500,
  quantity: 20,
  category: "Accessories",
};

export const invalidProductData = {
  missingName: {
    description: "Product without name",
    price: 1000,
    quantity: 5,
    category: "Electronics",
  },

  negativePrice: {
    name: "Invalid Price Product",
    description: "Product with negative price",
    price: -100,
    quantity: 5,
    category: "Electronics",
  },

  negativeQuantity: {
    name: "Invalid Quantity Product",
    description: "Product with negative quantity",
    price: 1000,
    quantity: -5,
    category: "Electronics",
  },

  emptyName: {
    name: "",
    description: "Product with empty name",
    price: 1000,
    quantity: 5,
    category: "Electronics",
  },
};

export const createProductResponse = (
  overrides: Partial<ProductTestResponse> = {},
): ProductTestResponse => {
  return {
    _id: new mongoose.Types.ObjectId(),
    name: validProductData.name,
    description: validProductData.description,
    price: validProductData.price,
    quantity: validProductData.quantity,
    category: validProductData.category,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
};

export const createProductId = (): string => {
  return new mongoose.Types.ObjectId().toString();
};
