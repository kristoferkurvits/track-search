import mongoose from "mongoose";
import AppConfig from "../config/appConfig";
const config = AppConfig.getInstance();

async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.DB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

export { connectToDatabase };
