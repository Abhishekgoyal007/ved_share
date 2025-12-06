// routes/user.route.js
import express from "express";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/user.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET: Get all users (Admin only)
router.get("/", protectRoute, adminRoute, getAllUsers);

// PATCH: Update user role
router.patch("/:id/role", protectRoute, adminRoute, updateUserRole);

// DELETE: Delete user
router.delete("/:id", protectRoute, adminRoute, deleteUser);

export default router;
