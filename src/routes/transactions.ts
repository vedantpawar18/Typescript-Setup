// routes/transaction.ts
import express, { Request, Response } from "express";
import User from "../models/user";
import Transaction, { Transaction as ITransaction } from "../models/transaction";
import { httpResponse } from "../lib/httpResponse";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/transactions - list with filters & pagination
router.get(
    "/",
    async (
        req: Request & {
            query: {
                page?: string;
                user?: string;
                dateFrom?: string;
                dateTo?: string;
                totalFrom?: string;
                totalTo?: string;
            };
        },
        res: Response
    ) => {
        try {
            let { page = "1", user, dateFrom, dateTo, totalFrom, totalTo } = req.query;

            const query: any = {};

            if (user && mongoose.Types.ObjectId.isValid(user)) {
                query.user = user;
            }

            if (dateFrom || dateTo) {
                query.date = {};
                if (dateFrom) query.date.$gte = new Date(dateFrom);
                if (dateTo) query.date.$lte = new Date(dateTo);
            }

            if (totalFrom || totalTo) {
                query.total = {};
                if (totalFrom) query.total.$gte = Number(totalFrom);
                if (totalTo) query.total.$lte = Number(totalTo);
            }

            const perPage = 10;
            const transactions: ITransaction[] = await Transaction.find(query)
                .sort({ date: -1 })
                .skip((Number(page) - 1) * perPage)
                .limit(perPage)
                .populate("user", "name email");

            return httpResponse(200, "Transactions retrieved successfully", { transactions }, res);
        } catch (error) {
            console.error("Error getting transactions:", error);
            return httpResponse(500, "Internal server error", {}, res);
        }
    }
);

// POST /api/transactions - create a transaction
router.post(
    "/",
    async (
        req: Request & {
            body: {
                user: string;
                total: number;
                description: string;
                date: string | Date;
                business: string;
                items: { title: string; quantity: number; price: number }[];
            };
        },
        res: Response
    ) => {
        try {
            const { user, total, description, date, business, items } = req.body;

            // Basic validation
            if (!user || !total || !description || !date || !business || !items) {
                return httpResponse(400, "Missing required fields", {}, res);
            }

            if (!Number.isInteger(total)) {
                return httpResponse(400, "Total must be a whole number (in INR)", {}, res);
            }

            if (!Array.isArray(items) || items.some((i) => !i.title || !i.quantity || !i.price)) {
                return httpResponse(400, "Items must have title, quantity, and price", {}, res);
            }

            // Validate user exists
            const userDoc = await User.findById(user);
            if (!userDoc) {
                return httpResponse(400, "User not found", {}, res);
            }

            // Create transaction
            const transactionDoc = new Transaction({
                user,
                total,
                description,
                date: new Date(date),
                business,
                items,
            });

            await transactionDoc.save();

            // Update user's balance
            userDoc.balance += total;
            await userDoc.save();

            return httpResponse(201, "Transaction created successfully", { transaction: transactionDoc }, res);
        } catch (error) {
            console.error("Error creating transaction:", error);
            return httpResponse(500, "Internal server error", {}, res);
        }
    }
);

export default router;
