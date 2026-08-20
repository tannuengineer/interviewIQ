import genToken from "../config/token.js";
import User from "../models/user.model.js";

export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body;

        console.log("🔥 GOOGLE AUTH BODY:", req.body);

        if (!name || !email) {
            return res.status(400).json({
                message: "Name and email are required"
            });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name,
                email
            });
        }

        const token = await genToken(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        console.log("✅ GOOGLE LOGIN SUCCESS:", user.email);

        return res.status(200).json(user);

    } catch (error) {
        console.log("🔥 GOOGLE AUTH ERROR:", error);

        return res.status(500).json({
            message: `Google auth error: ${error.message}`
        });
    }
};


// LOGOUT
export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        });

        return res.status(200).json({
            message: "Logout Successfully"
        });

    } catch (error) {
        console.log("🔥 LOGOUT ERROR:", error);

        return res.status(500).json({
            message: `Logout error: ${error.message}`
        });
    }
};