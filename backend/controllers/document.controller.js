import UserDocument from "../models/userDocument.model.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../lib/cloudinary.js";

export const uploadDocument = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Validate file type
        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({ message: "Invalid file type. Only PDF, JPEG, and PNG are allowed." });
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ message: "File size too large. Maximum 10MB allowed." });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file.buffer, file.mimetype.startsWith("image") ? "image" : "raw");

        const fileType = file.mimetype === "application/pdf" ? "pdf" : "image";

        const document = await UserDocument.create({
            user: req.user._id,
            name: name || file.originalname,
            fileUrl: result.secure_url,
            fileType,
            mimeType: file.mimetype,
            size: file.size,
            cloudinaryId: result.public_id,
        });

        res.status(201).json(document);
    } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserDocuments = async (req, res) => {
    try {
        const documents = await UserDocument.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const document = await UserDocument.findOne({ _id: id, user: req.user._id });

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        // Delete from Cloudinary
        await deleteFromCloudinary(document.cloudinaryId);

        // Delete from database
        await UserDocument.findByIdAndDelete(id);

        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
