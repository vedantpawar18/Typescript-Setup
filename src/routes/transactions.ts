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
                userId?: string; // filter transactions where user is either sender or receiver
                dateFrom?: string;
                dateTo?: string;
            };
        },
        res: Response
    ) => {
        try {
            let { page = "1", userId, dateFrom, dateTo } = req.query;

            const query: any = {};

            // Validate user exists if userId is provided
            if (userId) {
                if (!mongoose.Types.ObjectId.isValid(userId)) {
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid userId",
                    });
                }

                const userExists = await User.findById(userId);
                if (!userExists) {
                    return res.status(404).json({
                        status: "error",
                        message: "User not found",
                    });
                }

                // Filter transactions where user is sender or receiver
                query.$or = [{ fromUser: userId }, { toUser: userId }];
            }

            // Filter by date range
            if (dateFrom || dateTo) {
                query.date = {};
                if (dateFrom) query.date.$gte = new Date(dateFrom);
                if (dateTo) query.date.$lte = new Date(dateTo);
            }

            const perPage = 10;
            const transactions: ITransaction[] = await Transaction.find(query)
                .sort({ date: -1 })
                .skip((Number(page) - 1) * perPage)
                .limit(perPage)
                .populate("fromUser", "name email")
                .populate("toUser", "name email");

            res.status(200).json({
                status: "success",
                message: "Transactions retrieved successfully",
                data: { transactions },
            });
        } catch (error) {
            console.error("Error fetching transactions:", error);
            res.status(500).json({
                status: "error",
                message: "Internal server error",
            });
        }
    }
);

// POST /api/transactions - create a transaction
router.post(
    "/",
    async (
        req: Request & {
            body: {
                fromUser: string;   // sender
                toUser: string;     // receiver
                total: number;
                description: string;
                date: string | Date;
                business: string;
                items: { title: string; quantity: number; price: number }[];
                paymentMethod?: string;
            };
        },
        res: Response
    ) => {
        try {
            const { fromUser, toUser, total, description, date, business, items, paymentMethod = "CASH" } = req.body;

            // Validate required fields
            if (!fromUser || !toUser || !total || !description || !date || !business || !items) {
                return res.status(400).json({ status: "error", message: "Missing required fields" });
            }

            // Validate ObjectId
            if (!mongoose.Types.ObjectId.isValid(fromUser) || !mongoose.Types.ObjectId.isValid(toUser)) {
                return res.status(400).json({ status: "error", message: "Invalid fromUser or toUser ID" });
            }

            if (!Number.isInteger(total) || total <= 0) {
                return res.status(400).json({ status: "error", message: "Total must be a positive whole number" });
            }

            if (!Array.isArray(items) || items.some(i => !i.title || !i.quantity || !i.price)) {
                return res.status(400).json({ status: "error", message: "Items must have title, quantity, and price" });
            }

            // Fetch sender and receiver
            const sender = await User.findById(fromUser);
            const receiver = await User.findById(toUser);

            if (!sender || !receiver) {
                return res.status(404).json({ status: "error", message: "Sender or receiver not found" });
            }

            // Check sender balance
            if (sender.balance < total) {
                return res.status(400).json({ status: "error", message: "Insufficient balance" });
            }

            // Update balances
            sender.balance -= total;
            receiver.balance += total;

            await sender.save();
            await receiver.save();

            // Create transaction
            const transaction = new Transaction({
                fromUser,
                toUser,
                total,
                description,
                date: new Date(date),
                business,
                items,
                paymentMethod,
                status: "PAID"
            });

            await transaction.save();

            return res.status(201).json({ status: "success", message: "Transaction completed successfully", data: { transaction } });

        } catch (error) {
            console.error("Error creating transaction:", error);
            return res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
);


export default router;
