import express, { Request, Response } from "express";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Example route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript server 🚀");
});

// API route
app.get("/api/users", (req: Request, res: Response) => {
  res.json([{ id: 1, name: "Vedant" }, { id: 2, name: "Pawar" }]);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
