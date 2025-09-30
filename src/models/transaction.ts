// models/transaction.ts
import mongoose, { Document, ObjectId, Schema } from "mongoose";

// Interface for Transaction
export interface Item {
    title: string;
    price: number;   // price in INR, e.g., 188 means ₹188
    quantity: number;
}

export interface Transaction extends Document {
    fromUser: ObjectId;       // sender
    toUser: ObjectId;
    description: string;
    total: number;      // total amount in INR
    date: Date; 
    business: string;
    items: Item[];
    paymentMethod?: "CASH" | "CARD" | "UPI" | "OTHER";
    status?: "PENDING" | "PAID" | "FAILED";
}

// Mongoose Schema
const TransactionSchema: Schema<Transaction> = new Schema({
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true },
    total: { type: Number, required: true }, // store amount in INR
    date: { type: Date, required: true, default: Date.now }, 
    business: { type: String, required: true },
    items: [
        {
            title: { type: String, required: true },
            price: { type: Number, required: true },
            quantity: { type: Number, required: true },
        },
    ],
    paymentMethod: {
        type: String,
        enum: ["CASH", "CARD", "UPI", "OTHER"],
        default: "CASH"
    },
    status: {
        type: String,
        enum: ["PENDING", "PAID", "FAILED"],
        default: "PENDING"
    },
});

// Export the model
export default mongoose.model<Transaction>("Transaction", TransactionSchema);
