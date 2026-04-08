import { GoogleGenerativeAI } from "@google/generative-ai";
import Interview from "../models/interview.model.js";

export const generateQuestions = async (req, res) => {
    try {
        const { title, description, context } = req.body;

        console.log("Generating questions for:", title);
        console.log("API Key present:", !!process.env.GEMINI_API_KEY);

        if (!process.env.GEMINI_API_KEY) {
            console.error("Gemini API Key is missing from environment variables");
            return res.status(500).json({ message: "Gemini API Key is missing" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        let prompt = `Generate 10 most frequently asked interview questions for the following topic: "${title} - ${description}".`;

        if (context) {
            prompt += `\n\nAdditional Context (Resume/Job Description):\n"${context}"\n\nEnsure at least 5 questions are specifically tailored to the provided context/resume, asking about specific projects, skills, or experiences mentioned.`;
        }

        prompt += `\n\nReturn the response ONLY as a valid JSON array of objects, where each object has a "question" field. 
        Do not include any markdown formatting like \`\`\`json or \`\`\`. 
        Example format: [{"question": "What is X?"}, {"question": "Explain Y."}]`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log("Raw Gemini response:", text);

        // Clean up potential markdown formatting if Gemini ignores the instruction
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const questions = JSON.parse(text);
            res.json({ questions });
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.error("Failed to parse text:", text);
            res.status(500).json({ message: "Failed to parse generated questions", error: parseError.message });
        }

    } catch (error) {
        console.error("Error in generateQuestions controller:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const saveQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        const userId = req.user._id;

        const newInterview = new Interview({
            user: userId,
            title,
            description,
            questions,
        });

        await newInterview.save();

        res.status(201).json(newInterview);
    } catch (error) {
        console.error("Error in saveQuiz controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Interview.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (error) {
        console.error("Error in getAllQuizzes controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getQuizById = async (req, res) => {
    try {
        const quiz = await Interview.findById(req.params.id).populate("user", "name email");
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.json(quiz);
    } catch (error) {
        console.error("Error in getQuizById controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const quiz = await Interview.findById(id);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        if (quiz.questions.length >= 50) {
            return res.status(400).json({ message: "Maximum limit of 50 questions reached" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API Key is missing" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        const prompt = `Generate 5 NEW and UNIQUE interview questions for the topic: "${quiz.title} - ${quiz.description}". 
        Existing questions are: ${JSON.stringify(quiz.questions.map(q => q.question))}.
        Ensure new questions are NOT duplicates of existing ones.
        Return the response ONLY as a valid JSON array of objects, where each object has a "question" field.
        Do not include any markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const newQuestions = JSON.parse(text);

        // Add new questions to the quiz
        quiz.questions.push(...newQuestions);
        await quiz.save();

        res.json(quiz);
    } catch (error) {
        console.error("Error in addQuestions controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const evaluateAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionId, userAnswer } = req.body;

        const quiz = await Interview.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const question = quiz.questions.id(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Gemini API Key is missing" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

        const prompt = `
        You are an expert interviewer. Evaluate the following answer.
        
        Topic: ${quiz.title}
        Question: "${question.question}"
        User Answer: "${userAnswer}"
        
        Determine if the answer is "Spot On", "Almost Correct", or "Wrong".
        
        If "Spot On": Provide a brief positive reinforcement.
        If "Almost Correct": Explain what is missing or slightly off.
        If "Wrong": Explain why it is wrong and provide the correct answer/explanation.
        
        Return response ONLY as a JSON object with "status" and "message" fields.
        Example: {"status": "Spot On", "message": "Excellent answer! You covered..."}
        Do not include markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        const evaluation = JSON.parse(text);

        // Return feedback directly without saving to DB
        res.json({
            questionId: question._id,
            feedback: {
                status: evaluation.status,
                message: evaluation.message
            }
        });

    } catch (error) {
        console.error("Error in evaluateAnswer controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const quiz = await Interview.findById(id);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Ensure the user owns this quiz
        if (quiz.user.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this quiz" });
        }

        await Interview.findByIdAndDelete(id);

        res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
        console.error("Error in deleteQuiz controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const cloneQuiz = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Find the original quiz
        const originalQuiz = await Interview.findById(id);

        if (!originalQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Check if user already has this quiz (avoid duplicates)
        const existingClone = await Interview.findOne({
            user: userId,
            title: originalQuiz.title,
            description: originalQuiz.description
        });

        if (existingClone) {
            return res.status(400).json({ message: "You already have this quiz in your Learning Desk" });
        }

        // Create a new quiz for the current user
        const clonedQuiz = new Interview({
            user: userId,
            title: originalQuiz.title,
            description: originalQuiz.description,
            questions: originalQuiz.questions.map(q => ({
                question: q.question,
                answer: q.answer
            }))
        });

        await clonedQuiz.save();

        res.status(201).json(clonedQuiz);
    } catch (error) {
        console.error("Error in cloneQuiz controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
