import express from "express";
import authRoutes from "../src/routes/auth.route";
import userRoutes from "../src/routes/user.route";
import cookieParser from "cookie-parser";
import helmet from "helmet";
const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

export default app;
