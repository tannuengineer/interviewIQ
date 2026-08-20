import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";
import connectDB from "./config/connectDb.js";

dotenv.config();

const app = express();

// DB Connect - ye miss tha tere code me
connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://interviewiq-client-qqm4.onrender.com"
    ],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTES
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

// TEST ROUTES
app.get("/", (req, res) => {
  res.status(200).send(" InterviewIQ Server Running");
});

app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working"
  });
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(` InterviewIQ Server Running on http://localhost:${PORT}`);
});