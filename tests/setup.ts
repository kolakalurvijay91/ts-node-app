import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

export const mochaHooks = {
  async beforeAll(): Promise<void> {
    const mongoUri = process.env.MONGODB_TEST_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_TEST_URI is not defined");
    }

    await mongoose.connect(mongoUri);

    console.log("Test MongoDB connection established");
  },

  async afterAll(): Promise<void> {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();

    console.log("Test MongoDB connection closed");
  },
};
