import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { checkoutSuccess, createCheckoutSession, getPurchasedProducts, processUPIPayment } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", checkoutSuccess);
router.post("/upi", protectRoute, processUPIPayment);
router.get("/purchased-products", protectRoute, getPurchasedProducts);

export default router;
