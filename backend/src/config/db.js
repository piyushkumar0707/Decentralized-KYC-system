import mongoose from "mongoose";

const connectDB= async ()=>{
    try {
        const mongoUri = process.env.MONGO_URI?.replace(/\/+$/, "");
        const connectionInstance=await mongoose.connect(`${mongoUri}/kyc`)
        console.log(`MongoDB connected: ${connectionInstance.connection.host}`)

    } catch (error) {
        console.error("Error connecting to the database.")
        process.exit(1);
    }
}
export default connectDB;
