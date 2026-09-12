import { Request, Response, NextFunction } from "express";

import { ProductService } from "../services/product.service";
import { AppError } from "../errors/app-error";

export class ProductController {
  private readonly productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const result = await this.productService.getProducts(page, limit);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await this.productService.getProductById(id.toString());

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await this.productService.updateProduct(
        id.toString(),
        req.body,
      );

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });

        return;
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteProduct = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { id } = req.params;

      const product = await this.productService.deleteProduct(id.toString());

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        data: product,
      });
    } catch (error) {
      next(error);
    }
  };
}
