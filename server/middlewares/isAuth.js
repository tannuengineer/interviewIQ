import jwt from "jsonwebtoken";

const isAuth = (req, res, next) => {
    try {
        const token = req.cookies?.token;

        console.log("TOKEN:", token);

        if (!token) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("DECODED:", decoded);

        req.userId = decoded.userId;

        next();

    } catch (error) {
        console.log("🔥 ISAUTH ERROR:", error.message);

        return res.status(401).json({
            message: error.message
        });
    }
};

export default isAuth;