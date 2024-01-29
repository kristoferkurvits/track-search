import mongoose from "mongoose";

async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect("mongodb://mongodb:27017/track-search-database");
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
  }
}

export { connectToDatabase };
