import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/user.models.js"
import jwt from "jsonwebtoken";
import sendMail from "../utils/mail.js";

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, username, email, password, admin } = req.body;
    try {
        if (!password) return res.status(400).json({ error: "Password is required" });
        if (!(name || email)) return res.status(400).json({ error: "All feilds are required" });


        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        const existingUser = await User.findOne({ username });

        const isAdmin = admin || "false";
        const newUsername = username && username.trim()? username.trim(): `${name.trim().replace(/\s+/g, '')}${Math.floor(Math.random() * 900000 + 100000)}`;

        if (existingEmail) { return res.status(400).json({ error: `User with this email already exists` }); }
        if (existingUser) { return res.status(400).json({ error: `User with this username already exists!` }); }



        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username: newUsername,
            email: email.toLowerCase(),
            password: hashedPassword,
            admin: isAdmin
        });

        return res.status(200).json({ message: `User created successfully: name:${name}, username:${newUsername}, email = ${email}, admin: ${isAdmin}` })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ status: 500, message: 'Error in registeration' });
    }

});

router.get('/login', async (req, res) => {

    const { email, username, password } = req.body;

    try {
        if (!password) return res.status(400).json({ error: "Password is required!" });
        if (!username && !email) return res.status(400).json({ error: "Email or username is required!" });

        const user = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
        if (!user) return res.status(400).json({ error: "User Not Found!" });


        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const refreshToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '30d' })
        const accessToken = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1hr' })

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        return res.json({ accessToken });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/request-reset', async (req, res) => {
    const email = req.body.email;
    try {
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (!existingUser) return res.status(200).json({ message: 'If an account exists, an OTP has been generated.' });

        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000);

        existingUser.resetOTP = otp;
        existingUser.resetOTPExpires = expiry;
        await existingUser.save();
        sendMail(email, otp, 10);
        return res.status(201).json({ message: "OTP Sent successfully", otp });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ Error: "Error generating OTP" });
    }
});

router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {

        if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Email, otp and newPassword required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ error: 'Invalid email' });
        if (!user.resetOTP) return res.status(400).json({ error: 'Invalid OTP' });

        if (user.resetOTPExpires < new Date()) return res.status(400).json({ error: 'OTP expired' });

        if (user.resetOTP != otp) return res.status(400).json({ error: 'Invalid OTP' });

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;
        await user.save();
        return res.status(200).json({ message: 'Password reset successful' });
    } catch (error) {
        return res.status(500).json({ Error: "Internal Server Error" });
    }
});


router.get('/logout', (req, res) => {
    res.clearCookie("refreshToken");
})

export default router;