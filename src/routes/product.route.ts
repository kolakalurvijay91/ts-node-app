import { Router } from "express";

import { ProductController } from "../controller/product.controller";

const router = Router();

const productController = new ProductController();

router.post("/", productController.createProduct);

router.get("/", productController.getProducts);

router.get("/:id", productController.getProductById);

router.patch("/:id", productController.updateProduct);

router.delete("/:id", productController.deleteProduct);

export default router;
