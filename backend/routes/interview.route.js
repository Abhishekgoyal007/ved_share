import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    generateQuestions,
    saveQuiz,
    getAllQuizzes,
    getQuizById,
    addQuestions,
    evaluateAnswer,
    deleteQuiz,
    cloneQuiz
} from "../controllers/interview.controller.js";

const router = express.Router();

router.post("/generate", protectRoute, generateQuestions);
router.post("/", protectRoute, saveQuiz);
router.get("/", protectRoute, getAllQuizzes);
router.get("/:id", getQuizById); // Publicly accessible if they have the link (ID)
router.post("/:id/add-questions", protectRoute, addQuestions);
router.post("/:id/evaluate", protectRoute, evaluateAnswer);
router.delete("/:id", protectRoute, deleteQuiz);
router.post("/:id/clone", protectRoute, cloneQuiz);

export default router;
