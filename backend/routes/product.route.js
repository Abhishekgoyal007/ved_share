import express from "express";
import {
	createProduct,
	deleteProduct,
	getAllProducts,
	getFeaturedProducts,
	getProductsByCategory,
	getRecommendedProducts,
	toggleFeaturedProduct,
	getMyProducts,
	getProductById,
	createSwapOffer,
	acceptSwapOffer,
	rejectSwapOffer,
	getSwapOffers,
	getPendingOffersCount,
	searchProducts
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/search", searchProducts); // Public search endpoint
router.get("/my-products", protectRoute, getMyProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, createProduct); // Removed adminRoute to allow users to create products
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProduct);
router.get("/:id", getProductById);
router.delete("/:id", protectRoute, deleteProduct);

// Swap Offer Routes
router.get("/offers/count", protectRoute, getPendingOffersCount);
router.post("/:id/offer", protectRoute, createSwapOffer);
router.get("/:id/offers", protectRoute, getSwapOffers);
router.put("/:id/offer/:offerId/accept", protectRoute, acceptSwapOffer);
router.put("/:id/offer/:offerId/reject", protectRoute, rejectSwapOffer);

export default router;
