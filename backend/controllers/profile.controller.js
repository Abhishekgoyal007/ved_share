import Product from "../models/product.model.js";
import { getUserAnalyticsData, getUserDailySalesData } from "./analytics.controller.js";

export const getProfileDashboard = async (req, res) => {
	try {
		const user = req.user;
		const userId = user._id;

		// Get user's products
		const products = await Product.find({ userId }).sort({ createdAt: -1 });

		// Get analytics
		const analyticsData = await getUserAnalyticsData(userId);

		const endDate = new Date();
		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

		const dailySalesData = await getUserDailySalesData(userId, startDate, endDate);

		res.json({
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				joinedAt: user.createdAt,
			},
			products,
			analytics: {
				...analyticsData,
				dailySalesData,
			},
		});
	} catch (error) {
		console.log("Error in getProfileDashboard", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
