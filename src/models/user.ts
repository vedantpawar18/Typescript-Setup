// models/user.ts
import mongoose, { Document, Schema, ObjectId } from "mongoose";
import crypto from "crypto";

// TypeScript interface for User
export interface IUser extends Document {
    name: string;
    email: string;
    balance: number;
    sampatirli?: string;  // optional
    color: string;
    passwordHash: string;
    passwordSalt: string;

    setPassword(password: string): void;
    validatePassword(password: string): boolean;
}

// Mongoose Schema
const UserSchema: Schema<IUser> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    balance: { type: Number, required: true, default: 0 },
    sampatirli: { type: String },
    color: { type: String, required: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
});

// Method to set password
UserSchema.methods.setPassword = function (password: string) {
    this.passwordSalt = crypto.randomBytes(16).toString("hex");
    this.passwordHash = crypto
        .pbkdf2Sync(password, this.passwordSalt, 1000, 64, "sha512")
        .toString("hex");
};

// Method to validate password
UserSchema.methods.validatePassword = function (password: string): boolean {
    const hash = crypto
        .pbkdf2Sync(password, this.passwordSalt, 1000, 64, "sha512")
        .toString("hex");
    return this.passwordHash === hash;
};

// Export the model
export default mongoose.model<IUser>("User", UserSchema);
