// routes/user.ts
import express, { Request, Response } from "express";
import User from "../models/user";
import { httpResponse } from "../lib/httpResponse";
import mongoose from "mongoose";

const router = express.Router();

/**
 * GET /api/users
 * Get all users (for admin)
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const users = await User.find().select("-passwordHash -passwordSalt").lean();
        return httpResponse(200, "Users retrieved successfully", { users }, res);
    } catch (error) {
        console.error("Error fetching users:", error);
        return httpResponse(500, "Internal server error", {}, res);
    }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return httpResponse(400, "Invalid user ID", {}, res);
        }

        const user = await User.findById(id).select("-passwordHash -passwordSalt").lean();
        if (!user) return httpResponse(404, "User not found", {}, res);

        return httpResponse(200, "User retrieved successfully", { user }, res);
    } catch (error) {
        console.error("Error fetching user:", error);
        return httpResponse(500, "Internal server error", {}, res);
    }
});

/**
 * POST /api/users/register
 * Register a new user
 */
router.post("/register", async (req: Request, res: Response) => {
    try {
        const { name, email, balance = 0, sampatirli = "", color, password } = req.body;

        if (!name || !email || !color || !password) {
            return httpResponse(400, "Missing required fields", {}, res);
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return httpResponse(400, "Email already registered", {}, res);

        const newUser = new User({ name, email, balance, sampatirli, color });
        newUser.setPassword(password); // sets passwordHash & passwordSalt

        await newUser.save();

        // Remove sensitive info before sending response
        const { passwordHash, passwordSalt, ...safeUser } = newUser.toObject();

        return httpResponse(201, "User registered successfully", { user: safeUser }, res);
    } catch (error) {
        console.error("Error registering user:", error);
        return httpResponse(500, "Internal server error", {}, res);
    }
});

/**
 * POST /api/users/login
 * Login user and validate password
 */
router.post("/login", async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) return httpResponse(400, "Missing email or password", {}, res);

        const user = await User.findOne({ email });
        if (!user || !user.validatePassword(password)) {
            return httpResponse(400, "Invalid email or password", {}, res);
        }

        // Remove sensitive info before sending response
        const { passwordHash, passwordSalt, ...safeUser } = user.toObject();

        return httpResponse(200, "Login successful", { user: safeUser }, res);
    } catch (error) {
        console.error("Error logging in:", error);
        return httpResponse(500, "Internal server error", {}, res);
    }
});

/**
 * PUT /api/users/:id/balance
 * Update user's balance
 */
router.put("/:id/balance", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { balance } = req.body;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return httpResponse(400, "Invalid user ID", {}, res);
        }

        if (typeof balance !== "number") {
            return httpResponse(400, "Balance must be a number", {}, res);
        }

        const user = await User.findByIdAndUpdate(
            id,
            { balance },
            { new: true }
        )
            .select("-passwordHash -passwordSalt")
            .lean();

        if (!user) return httpResponse(404, "User not found", {}, res);

        return httpResponse(200, "Balance updated successfully", { user }, res);
    } catch (error) {
        console.error("Error updating balance:", error);
        return httpResponse(500, "Internal server error", {}, res);
    }
});

export default router;
