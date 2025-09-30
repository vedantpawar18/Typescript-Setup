import express, { Request, Response } from "express";
import User from "../models/user";
import Transaction from "../models/transaction";
import { httpResponse } from "../lib/httpResponse";
import mongoose from "mongoose";

const router = express.Router();

// GET /api/transactions - list with filters & pagination
router.get("/", async (req: Request, res: Response) => {
    try {
        let { page = "1", userId, dateFrom, dateTo } = req.query as any;

        const query: any = {};

        if (userId) {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return httpResponse(400, "Invalid userId", {}, res);
            }

            const userExists = await User.exists({ _id: userId });
            if (!userExists) return httpResponse(404, "User not found", {}, res);

            query.$or = [
                { "fromUser._id": userId },
                { "toUser._id": userId }
            ];
        }

        if (dateFrom || dateTo) {
            query.date = {};
            if (dateFrom) query.date.$gte = new Date(dateFrom);
            if (dateTo) query.date.$lte = new Date(dateTo);
        }

        const perPage = 10;
        const transactions = await Transaction.find(query)
            .sort({ date: -1 })
            .skip((Number(page) - 1) * perPage)
            .limit(perPage)
            .lean(); // lean for faster query

        return httpResponse(200, "Transactions retrieved successfully", { transactions }, res);
    } catch (error) {
        console.error("Error fetching transactions:", error);
        return httpResponse(500, "Internal server error", {}, res);
    }
});

// POST /api/transactions - create transaction with atomic balance updates
router.post("/", async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fromUser, toUser, total, description, date, business, items, paymentMethod = "CASH" } = req.body;

        if (!fromUser || !toUser || !total || !description || !date || !business || !items) {
            await session.abortTransaction();
            session.endSession();
            return httpResponse(400, "Missing required fields", {}, res);
        }

        if (!mongoose.Types.ObjectId.isValid(fromUser) || !mongoose.Types.ObjectId.isValid(toUser)) {
            await session.abortTransaction();
            session.endSession();
            return httpResponse(400, "Invalid fromUser or toUser ID", {}, res);
        }

        if (!Number.isInteger(total) || total <= 0) {
            await session.abortTransaction();
            session.endSession();
            return httpResponse(400, "Total must be a positive whole number", {}, res);
        }

        if (!Array.isArray(items) || items.some(i => !i.title || !i.quantity || !i.price)) {
            await session.abortTransaction();
            session.endSession();
            return httpResponse(400, "Items must have title, quantity, and price", {}, res);
        }

        // Fetch sender and receiver for embedded info
        const sender = await User.findById(fromUser).session(session);
        const receiver = await User.findById(toUser).session(session);

        if (!sender || !receiver) {
            await session.abortTransaction();
            session.endSession();
            return httpResponse(404, "Sender or receiver not found", {}, res);
        }

        if (sender.balance < total) {
            await session.abortTransaction();
            session.endSession();
            return httpResponse(400, "Insufficient balance", {}, res);
        }

        // Atomic balance update
        sender.balance -= total;
        receiver.balance += total;

        await sender.save({ session });
        await receiver.save({ session });

        // Create transaction with embedded user info
        const transaction = new Transaction({
            fromUser: {
                _id: sender._id,
                name: sender.name,
                email: sender.email
            },
            toUser: {
                _id: receiver._id,
                name: receiver.name,
                email: receiver.email
            },
            total,
            description,
            date: new Date(date),
            business,
            items,
            paymentMethod,
            status: "PAID"
        });

        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        return httpResponse(201, "Transaction completed successfully", { transaction }, res);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error creating transaction:", error);
        return httpResponse(500, "Internal server error", {}, res);
    }
});

export default router;
