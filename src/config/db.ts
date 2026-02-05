import colors from 'colors';
import mongoose from "mongoose";
import User, {IUser}  from '../models/User';


export const connectDB = async () => {
  try {
    const {connection} = await mongoose.connect(process.env.MONGO_URI)
    const URL = `${connection.host}:${connection.port}`
    console.log(colors.magenta.bold(`DB connected in ${URL}`));

  }catch (error) {
    console.log(colors.bgRed.white.bold(`DB connection error: ${error}`));
  }
};