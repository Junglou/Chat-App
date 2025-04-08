import mongoose from "mongoose";

export const ConnectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`The Chat_DB is connected: ${conn.connection.host}`);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
