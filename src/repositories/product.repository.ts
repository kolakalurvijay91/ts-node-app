import mongoose from "mongoose";

import {
  IProduct,
  ProductDocument,
  ProductModel,
} from "../models/product.model.js";

export class ProductRepository {
  // Create product
  async create(productData: IProduct): Promise<ProductDocument> {
    return ProductModel.create(productData);
  }

  // Get products with pagination
  async findAll(page: number = 1, limit: number = 20): Promise<IProduct[]> {
    const skip = (page - 1) * limit;

    return ProductModel.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  // Get product by ID
  async findById(productId: string): Promise<ProductDocument | null> {
    return ProductModel.findById(productId);
  }

  // Count products
  async count(filter: mongoose.QueryFilter<IProduct> = {}): Promise<number> {
    return ProductModel.countDocuments(filter);
  }

  // Update product
  async updateById(
    productId: string,
    updateData: mongoose.UpdateQuery<IProduct>,
  ): Promise<ProductDocument | null> {
    return ProductModel.findByIdAndUpdate(productId, updateData, {
      new: true,
      runValidators: true,
    });
  }

  // Delete product
  async deleteById(productId: string): Promise<ProductDocument | null> {
    return ProductModel.findByIdAndDelete(productId);
  }
}
