import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

const connectDB = async ()=>{
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB!")
    } catch (error) {
        console.log("DB connection error", error)
    }
}

export default connectDB;