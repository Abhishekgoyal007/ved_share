import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { uploadDocument, getUserDocuments, deleteDocument } from "../controllers/document.controller.js";
import multer from "multer";

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", protectRoute, upload.single("file"), uploadDocument);
router.get("/", protectRoute, getUserDocuments);
router.delete("/:id", protectRoute, deleteDocument);

export default router;
