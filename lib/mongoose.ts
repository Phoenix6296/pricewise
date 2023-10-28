import mongoose from "mongoose";

let isConnected = false;
export const connectToDB = async () => {
  const url = process.env.MONGODB_URI;
  mongoose.set("strictQuery", true);
  if (!url) {
    console.log("MONGODB_URI is not defined");
    return;
  }
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }
  try {
    await mongoose.connect(url);
    isConnected = true;
    console.log("MongoDB is connected");
  } catch (error: any) {
    console.log(error);
  }
};
