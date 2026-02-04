import mongoose from "mongoose";


export const connectDB = async () => {
  try {
    const {connection} = await mongoose.connect(process.env.MONGO_URI)
    const URL = `${connection.host}:${connection.port}`
    console.log(`DB connected in ${URL}`);

  }catch (error) {
    console.log('DB connection error:', error);
  }
};