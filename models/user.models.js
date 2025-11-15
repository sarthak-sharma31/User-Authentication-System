import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    admin: {
        type: String,
        default: "false"
    },
    resetOTP: {
        type: String
    },
    resetOTPExpires: {
        type: Date
    }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);