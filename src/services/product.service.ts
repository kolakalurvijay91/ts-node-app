import mongoose from "mongoose";

import { ProductRepository } from "../repositories/product.repository";

import { IProduct, ProductDocument } from "../models/product.model";

import { AppError } from "../errors/app-error";

export class ProductService {
  private readonly productRepository: ProductRepository;

  constructor(productRepository: ProductRepository = new ProductRepository()) {
    this.productRepository = productRepository;
  }

  async createProduct(productData: IProduct): Promise<ProductDocument> {
    return this.productRepository.create(productData);
  }

  async getProducts(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 100);

    const [products, total] = await Promise.all([
      this.productRepository.findAll(safePage, safeLimit),
      this.productRepository.count(),
    ]);

    return {
      products,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async getProductById(productId: string): Promise<ProductDocument> {
    this.validateProductId(productId);

    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  async updateProduct(
    productId: string,
    updateData: Partial<IProduct>,
  ): Promise<ProductDocument> {
    this.validateProductId(productId);

    const product = await this.productRepository.updateById(
      productId,
      updateData,
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  async deleteProduct(productId: string): Promise<void> {
    this.validateProductId(productId);

    const product = await this.productRepository.deleteById(productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }
  }

  private validateProductId(productId: string): void {
    if (!mongoose.isValidObjectId(productId)) {
      throw new AppError("Invalid product ID", 400);
    }
  }
}
