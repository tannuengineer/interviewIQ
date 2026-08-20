import jwt from "jsonwebtoken";

const genToken = async (userId) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing");
        }

        const token = jwt.sign(
            { userId },
            process.env.JWT_SECRET.trim(),
            { expiresIn: "7d" }
        );

        return token;

    } catch (error) {
        console.log("🔥 TOKEN ERROR:", error);
        throw error;
    }
};

export default genToken;