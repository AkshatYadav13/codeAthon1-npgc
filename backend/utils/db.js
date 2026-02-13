import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI
, {
  family: 4
}
    );
    console.log("Database connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
  }
};

export default connectDB;

