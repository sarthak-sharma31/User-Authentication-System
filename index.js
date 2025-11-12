import express from "express";
import 'dotenv/config';
import connectDB from "./db/db.js";
import authRoutes from "./routes/auth.routes.js"

connectDB();

// Description:
// A backend-only system with signup, login, forgot password, and email verification.
// Concepts learned:
// Authentication (JWT, bcrypt)
// Email sending (NodeMailer)
// Refresh tokens
// Bonus features:
// Password reset with OTP
// Role-based authorization (admin/user)
// Collections:
// users
// tokens (optional)


const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.use("/user", authRoutes);

app.get('/', (req, res)=>{
    res.send("Hello!");
});

app.listen(port, ()=>{
    console.log(`Listening on http://localhost${port}`);
})