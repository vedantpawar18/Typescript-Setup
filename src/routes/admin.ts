// routes/admin.ts
import express, { Request, Response } from "express";
import User from "../models/user";
import Transaction from "../models/transaction";

const router = express.Router();

// DELETE /api/admin/delete-all
// Delete all users and transactions
router.delete("/delete-all", async (req: Request, res: Response) => {
  try {
    // Delete all transactions first
    await Transaction.deleteMany({});
    
    // Delete all users
    await User.deleteMany({});
    
    res.status(200).json({
      status: "success",
      message: "All users and transactions have been deleted",
    });
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

export default router;
