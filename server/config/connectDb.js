import mongoose from "mongoose";

const connectDb = async () => {
  try {
    console.log("MONGODB_URL:", process.env.MONGODB_URL ? "MIL GAYA" : "NAHI MILA");
    
    const url = process.env.MONGODB_URL || process.env.MONGODB_URI;
    
    if (!url) {
      console.log("All env keys:", Object.keys(process.env).filter(k => k.includes("MONGO")));
      throw new Error("MONGODB_URL is undefined");
    }

    await mongoose.connect(url);
    console.log("DataBase connected");
  } catch (error) {
    console.log("Database Error:", error.message);
  }
};

export default connectDb;