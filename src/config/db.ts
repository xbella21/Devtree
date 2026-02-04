import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const URL = 'mongodb+srv://izzobee21:KjveMzeExDN2VUil@cluster0.7dl6y7d.mongodb.net/linktree_node_typescript'
    const {connection} = await mongoose.connect(URL)
    const URL2 = `${connection.host}:${connection.port}`
    console.log(`DB connected in ${URL2}`);

  }catch (error) {
    console.log('DB connection error:', error);
  }
};