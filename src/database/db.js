import mongoose from "mongoose";

const connectDatabase = () => {
  console.log("Wait, connecting to the database...");

  mongoose
    .connect(process.env.MONGODB_URI, {
      //useNewUrlParser: true, // Mantém esta opção, pois ainda é relevante
    })
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("Database connection error:", error));
};

export default connectDatabase;
