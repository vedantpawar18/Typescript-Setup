// routes/user.ts
import express, { Request, Response } from "express";
import User, { IUser } from "../models/user";
import { httpResponse } from "../lib/httpResponse";
import mongoose from "mongoose";
import crypto from "crypto";

const router = express.Router();

/**
 * GET /api/users
 * Get all users (for admin)
 */
router.get("/", async (req: Request, res: Response) => {
    try {
        const users: IUser[] = await User.find().select("-passwordHash -passwordSalt"); // hide sensitive info
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
        const user = await User.findById(id).select("-passwordHash -passwordSalt");
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
router.post(
    "/register",
    async (
        req: Request & {
            body: {
                name: string;
                email: string;
                balance?: number;
                sampatirli?: string;
                color: string;
                password: string;
            };
        },
        res: Response
    ) => {
        try {
            const { name, email, balance = 0, sampatirli = "", color, password } = req.body;

            if (!name || !email || !color || !password) {
                return httpResponse(400, "Missing required fields", {}, res);
            }

            // Check if email exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return httpResponse(400, "Email already registered", {}, res);
            }

            const newUser = new User({ name, email, balance, sampatirli, color });
            newUser.setPassword(password); // sets passwordHash & salt

            await newUser.save();

            return httpResponse(201, "User registered successfully", { user: newUser }, res);
        } catch (error) {
            console.error("Error registering user:", error);
            return httpResponse(500, "Internal server error", {}, res);
        }
    }
);

/**
 * POST /api/users/login
 * Login user and validate password
 */
router.post(
    "/login",
    async (
        req: Request & {
            body: { email: string; password: string };
        },
        res: Response
    ) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return httpResponse(400, "Missing email or password", {}, res);
            }

            const user = await User.findOne({ email });
            if (!user) {
                return httpResponse(400, "Invalid email or password", {}, res);
            }

            const isValid = user.validatePassword(password);
            if (!isValid) {
                return httpResponse(400, "Invalid email or password", {}, res);
            }

            // For now, just return user info (no JWT yet)
            return httpResponse(200, "Login successful", { user }, res);
        } catch (error) {
            console.error("Error logging in:", error);
            return httpResponse(500, "Internal server error", {}, res);
        }
    }
);

/**
 * PUT /api/users/:id/balance
 * Update user's balance
 */
router.put("/:id/balance", async (req: Request & { body: { balance: number } }, res: Response) => {
    try {
        const { id } = req.params;
        const { balance } = req.body;

        const user = await User.findById(id);
        if (!user) return httpResponse(404, "User not found", {}, res);

        if (typeof balance !== "number") {
            return httpResponse(400, "Balance must be a number", {}, res);
        }

        user.balance = balance;
        await user.save();

        return httpResponse(200, "Balance updated successfully", { user }, res);
    } catch (error) {
        console.error("Error updating balance:", error);
        return httpResponse(500, "Internal server error", {}, res);
    }
});

export default router;
