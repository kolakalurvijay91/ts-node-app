import express from "express";
import cors from "cors";
import helmet from "helmet";

import productRoutes from "./routes/product.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/not-found.middleware";

const app = express();

//Security middleware
app.use(helmet());

//Enable CORS
app.use(
  cors({
    origin: "http://localhost:4200",
  }),
);

// Parse JSON request body
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Product Management API is running",
  });
});

app.use("/api/products", productRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
