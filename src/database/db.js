import mongoose from "mongoose";

const connectDatabase = () => {
  console.log("wait connecting to the database");

  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((error) => console.error("Database connection error:", error));
};

export default connectDatabase;

