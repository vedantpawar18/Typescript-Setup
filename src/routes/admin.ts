import express, { Request, Response } from "express";
import User from "../models/user";
import Transaction from "../models/transaction";

const router = express.Router();

/**
 * DELETE /api/admin/delete-all
 * Delete all users and transactions
 */
router.delete("/delete-all", async (req: Request, res: Response) => {
  try {
    await Transaction.deleteMany({});
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

/**
 * GET /api/admin/user-balances
 * Get all users with their stored balance
 */
router.get("/user-balances", async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, "name email balance color"); 
    // only select required fields

    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching user balances:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

export default router;
