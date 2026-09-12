import mongoose from "mongoose";

import { AppError } from "../errors/app-error";
import { IProduct } from "../models/product.model";

import { ProductRepository } from "../repositories/product.repository";

export class ProductService {
  private readonly productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  private validateProductId(productId: string): void {
    if (!mongoose.isValidObjectId(productId)) {
      throw new AppError("Invalid Product ID", 400);
    }
  }
  async createProduct(productData: IProduct) {
    return this.productRepository.create(productData);
  }

  async getProducts(page: number = 1, limit: number = 20) {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100);

    const [products, total] = await Promise.all([
      this.productRepository.findAll(validPage, validLimit),
      this.productRepository.count(),
    ]);

    return {
      products,
      pagination: {
        page: validPage,
        limit: validLimit,
        total,
        totalPages: Math.ceil(total / validLimit),
      },
    };
  }

  async getProductById(productId: string) {
    this.validateProductId(productId);
    return this.productRepository.findById(productId);
  }

  async updateProduct(productId: string, updateData: Partial<IProduct>) {
    this.validateProductId(productId);
    return this.productRepository.updateById(productId, updateData);
  }

  async deleteProduct(productId: string) {
    this.validateProductId(productId);
    return this.productRepository.deleteById(productId);
  }
}
