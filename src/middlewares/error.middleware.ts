import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";

import { AppError } from "../errors/app-error";

export const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });

    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: Object.values(error.errors).map(
        (validationError) => validationError.message,
      ),
    });

    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
