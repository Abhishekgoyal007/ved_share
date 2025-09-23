import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getProfileDashboard } from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/", protectRoute, getProfileDashboard);

export default router;