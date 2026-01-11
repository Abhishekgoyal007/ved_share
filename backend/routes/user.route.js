// routes/user.route.js
import express from "express";
import multer from "multer";
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateProfile,
  uploadProfilePicture,
} from "../controllers/user.controller.js";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Multer config for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// User profile routes
router.patch("/profile", protectRoute, updateProfile);
router.post("/profile-picture", protectRoute, upload.single("profilePicture"), uploadProfilePicture);

// Admin routes
router.get("/", protectRoute, adminRoute, getAllUsers);
router.patch("/:id/role", protectRoute, adminRoute, updateUserRole);
router.delete("/:id", protectRoute, adminRoute, deleteUser);

export default router;
