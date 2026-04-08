import Document from "../models/document.model.js";
import Keyword from "../models/keyword.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload to temporary directory (for Vercel serverless functions)
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadPath = path.join(os.tmpdir(), "vedshare-uploads");
		if (!fs.existsSync(uploadPath)) {
			fs.mkdirSync(uploadPath, { recursive: true });
		}
		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + "-" + file.originalname);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = [
		"application/pdf",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
		"application/msword",
		"application/vnd.ms-powerpoint",
	];

	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Invalid file type. Only PDF, Word, and PowerPoint files are allowed."));
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 10 * 1024 * 1024, // 10MB limit
	},
});

// Simple keyword extraction function (you can enhance this with better NLP)
const extractKeywords = (text) => {
	// Remove special characters and convert to lowercase
	const cleanText = text
		.toLowerCase()
		.replace(/[^\w\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	// Split into words
	const words = cleanText.split(" ");

	// Common stop words to filter out
	const stopWords = new Set([
		"a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "he",
		"in", "is", "it", "its", "of", "on", "that", "the", "to", "was", "will", "with",
		"the", "this", "but", "they", "have", "had", "what", "said", "each", "which",
		"she", "do", "how", "their", "if", "up", "out", "many", "then", "them", "these",
		"so", "some", "her", "would", "make", "like", "into", "him", "time", "has", "two",
		"more", "very", "what", "know", "just", "first", "get", "over", "think", "also",
		"your", "work", "life", "only", "can", "still", "should", "after", "being",
		"now", "made", "before", "here", "through", "when", "where", "much", "go", "me",
		"back", "with", "well", "were", "been", "too", "any", "may", "say", "she",
		"use", "her", "all", "there", "each", "which", "do", "how", "if", "it", "who",
		"did", "yes", "his", "could", "no", "or", "my", "see", "him", "between", "both",
		"about", "other", "please", "thank", "thanks", "hello", "hi", "good", "great",
		"best", "better", "day", "today", "tomorrow", "yesterday", "week", "month", "year"
	]);

	// Count word frequencies and filter out stop words and short words
	const wordCount = {};
	words.forEach(word => {
		if (word.length > 3 && !stopWords.has(word) && !word.match(/^\d+$/)) {
			wordCount[word] = (wordCount[word] || 0) + 1;
		}
	});

	// Sort by frequency and take top keywords
	const sortedKeywords = Object.entries(wordCount)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 50) // Take top 50 keywords
		.map(([word, frequency]) => ({
			text: word,
			frequency,
			confidence: Math.min(frequency / words.length * 100, 100)
		}));

	return sortedKeywords;
};

// Extract text from different file types
const extractTextFromFile = async (filePath, fileType) => {
	try {
		let text = "";

		if (fileType === "application/pdf") {
			// Extract text from PDF using pdf2json
			text = await new Promise((resolve, reject) => {
				const pdfParser = new PDFParser();
				
				pdfParser.on("pdfParser_dataError", errData => {
					reject(new Error(errData.parserError));
				});
				
				pdfParser.on("pdfParser_dataReady", pdfData => {
					let extractedText = "";
					if (pdfData.Pages) {
						pdfData.Pages.forEach(page => {
							if (page.Texts) {
								page.Texts.forEach(textItem => {
									if (textItem.R) {
										textItem.R.forEach(textRun => {
											if (textRun.T) {
												extractedText += decodeURIComponent(textRun.T) + " ";
											}
										});
									}
								});
							}
						});
					}
					resolve(extractedText);
				});
				
				pdfParser.loadPDF(filePath);
			});
		} else if (
			fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
			fileType === "application/msword"
		) {
			// Extract text from Word document using mammoth
			const result = await mammoth.extractRawText({ path: filePath });
			text = result.value;
		} else if (
			fileType === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
			fileType === "application/vnd.ms-powerpoint"
		) {
			// For PowerPoint, extract basic text (placeholder implementation)
			text = "PowerPoint document uploaded. Text extraction from PowerPoint files is currently limited. Please try uploading a PDF or Word document for better keyword extraction.";
		}

		return text;
	} catch (error) {
		console.error("Error extracting text:", error);
		throw new Error("Failed to extract text from document");
	}
};

export const uploadDocument = async (req, res) => {
	try {
		console.log("Keyword extractor upload called");
		console.log("User:", req.user);
		console.log("File:", req.file);
		
		if (!req.file) {
			return res.status(400).json({ message: "No file uploaded" });
		}

		const userId = req.user._id;
		const { originalname, mimetype, size, path: filePath, filename } = req.file;

		// Extract text from the uploaded file
		let extractedText;
		try {
			extractedText = await extractTextFromFile(filePath, mimetype);
			console.log("Extracted text length:", extractedText.length);
		} catch (textExtractionError) {
			console.error("Text extraction error:", textExtractionError);
			return res.status(400).json({ 
				message: "Failed to extract text from document. Please ensure the file is not corrupted.",
				error: textExtractionError.message
			});
		}
		
		// Extract keywords from the text
		const keywordsData = extractKeywords(extractedText);
		console.log("Extracted keywords count:", keywordsData.length);

		// Save document to database
		const document = new Document({
			filename,
			originalName: originalname,
			fileType: mimetype,
			fileSize: size,
			filePath,
			userId,
		});

		await document.save();

		// Save keywords to database
		const keywords = await Promise.all(
			keywordsData.map(async (keywordData) => {
				const keyword = new Keyword({
					text: keywordData.text,
					confidence: keywordData.confidence,
					frequency: keywordData.frequency,
					documentId: document._id,
					userId,
				});
				await keyword.save();
				return keyword;
			})
		);

		// Update document with keyword references
		document.keywords = keywords.map(k => k._id);
		await document.save();

		res.status(200).json({
			message: "Document uploaded and keywords extracted successfully",
			document,
			keywords,
		});
	} catch (error) {
		console.error("Error uploading document:", error);
		res.status(500).json({ 
			message: "Failed to upload document and extract keywords",
			error: error.message 
		});
	}
};

export const getUserDocuments = async (req, res) => {
	try {
		console.log("Get user documents for keyword extractor called");
		console.log("User:", req.user);
		
		const userId = req.user._id;
		const documents = await Document.find({ userId })
			.populate("keywords")
			.sort({ createdAt: -1 });

		res.status(200).json({ documents });
	} catch (error) {
		console.error("Error fetching documents:", error);
		res.status(500).json({ message: "Failed to fetch documents" });
	}
};

export const getDocumentWithKeywords = async (req, res) => {
	try {
		const { documentId } = req.params;
		const userId = req.user._id;

		const document = await Document.findOne({ _id: documentId, userId })
			.populate("keywords");

		if (!document) {
			return res.status(404).json({ message: "Document not found" });
		}

		res.status(200).json({ 
			document,
			keywords: document.keywords 
		});
	} catch (error) {
		console.error("Error fetching document:", error);
		res.status(500).json({ message: "Failed to fetch document" });
	}
};

export const updateKeyword = async (req, res) => {
	try {
		const { keywordId } = req.params;
		const { text } = req.body;
		const userId = req.user._id;

		const keyword = await Keyword.findOneAndUpdate(
			{ _id: keywordId, userId },
			{ text },
			{ new: true }
		);

		if (!keyword) {
			return res.status(404).json({ message: "Keyword not found" });
		}

		res.status(200).json({ keyword });
	} catch (error) {
		console.error("Error updating keyword:", error);
		res.status(500).json({ message: "Failed to update keyword" });
	}
};

export const deleteKeyword = async (req, res) => {
	try {
		const { keywordId } = req.params;
		const userId = req.user._id;

		const keyword = await Keyword.findOneAndDelete({ _id: keywordId, userId });

		if (!keyword) {
			return res.status(404).json({ message: "Keyword not found" });
		}

		// Remove keyword reference from document
		await Document.updateOne(
			{ _id: keyword.documentId },
			{ $pull: { keywords: keywordId } }
		);

		res.status(200).json({ message: "Keyword deleted successfully" });
	} catch (error) {
		console.error("Error deleting keyword:", error);
		res.status(500).json({ message: "Failed to delete keyword" });
	}
};

export const addKeyword = async (req, res) => {
	try {
		const { text, documentId } = req.body;
		const userId = req.user._id;

		// Verify document exists and belongs to user
		const document = await Document.findOne({ _id: documentId, userId });
		if (!document) {
			return res.status(404).json({ message: "Document not found" });
		}

		const keyword = new Keyword({
			text,
			confidence: 100, // User-added keywords have full confidence
			frequency: 1,
			documentId,
			userId,
		});

		await keyword.save();

		// Add keyword reference to document
		await Document.updateOne(
			{ _id: documentId },
			{ $push: { keywords: keyword._id } }
		);

		res.status(201).json({ keyword });
	} catch (error) {
		console.error("Error adding keyword:", error);
		res.status(500).json({ message: "Failed to add keyword" });
	}
};

export const deleteDocument = async (req, res) => {
	try {
		const { documentId } = req.params;
		const userId = req.user._id;

		const document = await Document.findOne({ _id: documentId, userId });
		if (!document) {
			return res.status(404).json({ message: "Document not found" });
		}

		// Delete associated keywords
		await Keyword.deleteMany({ documentId });

		// Delete file from filesystem
		if (fs.existsSync(document.filePath)) {
			fs.unlinkSync(document.filePath);
		}

		// Delete document from database
		await Document.deleteOne({ _id: documentId });

		res.status(200).json({ message: "Document deleted successfully" });
	} catch (error) {
		console.error("Error deleting document:", error);
		res.status(500).json({ message: "Failed to delete document" });
	}
};