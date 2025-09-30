import express, { Request, Response } from "express";
import { connectToDatabase } from "./lib/dbConnection";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import transactionRouter from "./routes/transactions";
import userRouter from "./routes/user";
import adminRouter from "./routes/admin";
import cors from "cors";
import logger from "./lib/logger";
import { requestLogger } from "./middleware/loggerMiddleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.json({ limit: "10kb" }));
app.use(cors({ origin: process.env.CORS_ORIGIN as string, credentials: true }));

// Request logging middleware
app.use(requestLogger);

// Routes
app.use("/api/transactions", transactionRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

// Example route
app.get("/", (req: Request, res: Response) => {
    logger.info("Root route accessed");
    res.send("Hello from Express + TypeScript server 🚀");
});

// API route
app.get("/api/users", (req: Request, res: Response) => {
    logger.info("Fetching users list");
    res.json([{ id: 1, name: "Vedant" }, { id: 2, name: "Pawar" }]);
});

// Start server
connectToDatabase()
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        logger.error(`Failed to start server: ${err}`);
    });
