import express from "express";
import 'dotenv/config';

const app = express();

const port = process.env.PORT || 3000;

app.get('/', (req, res)=>{
    res.send("Hello!");
});

app.listen(port, ()=>{
    console.log(`Listening on http://localhost${port}`);
})