import { Router } from "express";

import { ProductController } from "../controller/product.controller";

import {
  validateRequest,
  createProductValidation,
  updateProductValidation,
  productIdValidation,
  productPaginationValidation,
} from "../middlewares/product.validation.js";

const router = Router();

const productController = new ProductController();

router.post(
  "/",
  createProductValidation,
  validateRequest,
  productController.createProduct,
);

router.get(
  "/",
  productPaginationValidation,
  validateRequest,
  productController.getProducts,
);

router.get(
  "/:id",
  productIdValidation,
  validateRequest,
  productController.getProductById,
);

router.patch(
  "/:id",
  productIdValidation,
  updateProductValidation,
  validateRequest,
  productController.updateProduct,
);

router.delete(
  "/:id",
  productIdValidation,
  validateRequest,
  productController.deleteProduct,
);

export default router;
