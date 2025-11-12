import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken";

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, username, email, password, admin } = req.body;
    try {
        if (!password) res.status(400).json({ error: "Password is required" });
        if (!(name, email)) res.status(400).json({ error: "All feilds are required" });


        const existingEmail = await User.findOne({ email });
        const existingUser = await User.findOne({ username });

        const isAdmin = admin || "false";
        const newUsername = username || `${name.trim("")}${Math.floor((Math.random(99998, 999998) * 1000000))}`;

        if (existingEmail) { res.status(400).json({ error: `User with this email already exists` }); }
        if (existingUser) { res.status(400).json({ error: `User with this username already exists!` }); }



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
        console.log("Error", error)
    }

});

router.get('/login', async (req, res) => {

    const { email, username, password } = req.body;

    try {
        if (!password) return res.status(400).json({ error: "Password is required!" });
        if (!username && !email) return res.status(400).json({ error: "Email or username is required!" });

        const user = await User.findOne({$or:[{email}, {username}]});
        if (!user) return res.status(400).json({ error: "User Not Found!" });


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const refreshToken = jwt.sign({id: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '30d'})
        const accessToken = jwt.sign({id: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '1hr'})

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            // secure: true,        // only sent over HTTPS
            secure: false,        // false for localhost
            sameSite: "strict",  // or 'lax' depending on your frontend
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return res.json({ accessToken });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie("refreshToken");
})

export default router;