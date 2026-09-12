import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

//Security middleware
app.use(helmet());

//Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Product Management API is running",
  });
});

export default app;
