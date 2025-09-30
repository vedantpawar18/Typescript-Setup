// models/transaction.ts
import mongoose, { Document, Schema, Types } from "mongoose";

export interface Item {
  title: string;
  price: number;
  quantity: number;
}

export interface ITransaction extends Document {
  fromUser: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
  toUser: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
  description: string;
  total: number;
  date: Date;
  business: string;
  items: Item[];
  paymentMethod?: "CASH" | "CARD" | "UPI" | "OTHER";
  status?: "PENDING" | "PAID" | "FAILED";
  itemCount: number;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    fromUser: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    toUser: {
      _id: { type: Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    description: { type: String, required: true },
    total: { type: Number, required: true },
    date: { type: Date, default: Date.now },
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
      default: "CASH",
    },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    itemCount: { type: Number, default: function () { return this.items.length; } },
  },
  { timestamps: true }
);

// Indexes for faster queries
TransactionSchema.index({ "fromUser._id": 1 });
TransactionSchema.index({ "toUser._id": 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ status: 1 });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
