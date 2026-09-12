import { HydratedDocument, Schema, model } from "mongoose";

export interface IProduct {
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
}

export type ProductDocument = HydratedDocument<IProduct>;

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  {
    timestamps: true,
  },
);

// Index for category filtering
productSchema.index({ category: 1 });

export const ProductModel = model<IProduct>("Product", productSchema);
