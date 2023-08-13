import mongoose from "mongoose";

let isConnected = false;
export const connectedToDB = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URI)
    return console.log("Mongodb url not found");
  if (isConnected) return console.log("Successfully connected");
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("successfully connected");
  } catch (error) {
    isConnected = false;
    console.log("Error", error);
  }
};
