import express from "express";
import 'dotenv/config';
import connectDB from "./db/db.js";
import authRoutes from "./routes/auth.routes.js"

connectDB();


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