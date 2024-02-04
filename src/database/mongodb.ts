import mongoose from "mongoose";
import AppConfig from "../config/appConfig";
const config = AppConfig.getInstance();
import logger from "../config/loggerConfig";

async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.DB_URL);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error.message);
  }
}

export { connectToDatabase };
