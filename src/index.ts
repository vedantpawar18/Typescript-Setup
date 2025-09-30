import express, { Request, Response } from "express";
import { connectToDatabase } from "./lib/dbConnection";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import transactionRouter from "./routes/transactions";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(bodyParser.json());

app.use("/api/transactions", transactionRouter);

// Example route
app.get("/", (req: Request, res: Response) => {
    res.send("Hello from Express + TypeScript server 🚀");
});

// API route
app.get("/api/users", (req: Request, res: Response) => {
    res.json([{ id: 1, name: "Vedant" }, { id: 2, name: "Pawar" }]);
});

connectToDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("Failed to start server:", err);
});