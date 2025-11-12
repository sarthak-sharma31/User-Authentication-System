import express from "express";
import bcrypt from "bcrypt";
import {User} from "../models/user.models.js"

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, username, email, password, admin } = req.body;
    try {
        if (!password) res.status(400).json({ error: "Password is required" });
        if (!(name, email)) res.status(400).json({ error: "All feilds are required" });

        
        const existingEmail = await User.findOne({email});
        const existingUser = await User.findOne({username});

        const isAdmin = admin || "false";
        const newUsername = username || `${name.trim("")}${Math.floor((Math.random(99998, 999998)*1000000))}`;

        if(existingEmail){res.status(400).json({error: `User with this email already exists`});}
        if(existingUser){res.status(400).json({error: `User with this username already exists!`});}


        
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username: newUsername,
            email,
            password: hashedPassword,
            admin: isAdmin
        });

        return res.status(200).json({ message: `User created successfully: name:${name}, username:${newUsername}, email = ${email}, admin: ${isAdmin}` })
    } catch (error) {
        console.log("Errormon", error)
    }

});

export default router;