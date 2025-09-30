import mongoose from "mongoose";

export async function connectToDatabase() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
        throw new Error("❌ MONGODB_URI is not defined in .env");
    }
    try {
        await mongoose.connect(mongoUri);
        console.log("MongoDb connected");
    } catch (err) {
        console.log(`Error while connecting DB: ${err}`)
    }
}
