import express from "express";
import { 
	uploadDocument, 
	getUserDocuments, 
	getDocumentWithKeywords,
	updateKeyword,
	deleteKeyword,
	addKeyword,
	deleteDocument,
	upload
} from "../controllers/extractor.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Test route (no auth required for testing)
router.get("/test", (req, res) => {
	res.json({ message: "Keyword Extractor routes are working!" });
});

// All routes require authentication
router.use(protectRoute);

// Document routes
router.post("/upload", upload.single("document"), uploadDocument);
router.get("/documents", getUserDocuments);
router.get("/documents/:documentId", getDocumentWithKeywords);
router.delete("/documents/:documentId", deleteDocument);

// Keyword routes
router.post("/keywords", addKeyword);
router.put("/keywords/:keywordId", updateKeyword);
router.delete("/keywords/:keywordId", deleteKeyword);

export default router;