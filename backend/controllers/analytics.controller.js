import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";

export const getAnalyticsData = async () => {
	const totalUsers = await User.countDocuments();
	const totalProducts = await Product.countDocuments();

	const salesData = await Order.aggregate([
		{
			$group: {
				_id: null,
				totalRevenue: { $sum: "$totalAmount" },
			},
		},
	]);

	const { totalRevenue } = salesData[0] || { totalRevenue: 0 };

	// Calculate Total Sales (Quantity of items sold)
	const totalSalesData = await Order.aggregate([
		{ $unwind: "$products" },
		{
			$group: {
				_id: null,
				totalSales: { $sum: "$products.quantity" }
			}
		}
	]);
	const { totalSales } = totalSalesData[0] || { totalSales: 0 };

	// Category Distribution (Product Count)
	const categoryData = await Product.aggregate([
		{ $group: { _id: "$category", value: { $sum: 1 } } },
		{ $project: { name: "$_id", value: 1, _id: 0 } }
	]);

	// Revenue by Category
	const revenueByCategory = await Order.aggregate([
		{ $unwind: "$products" },
		{
			$group: {
				_id: "$products.product",
				quantity: { $sum: "$products.quantity" },
				revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
			}
		},
		{
			$lookup: {
				from: "products",
				localField: "_id",
				foreignField: "_id",
				as: "productDetails"
			}
		},
		{ $unwind: "$productDetails" },
		{
			$group: {
				_id: "$productDetails.category",
				value: { $sum: "$revenue" }
			}
		},
		{ $project: { name: "$_id", value: 1, _id: 0 } },
		{ $sort: { value: -1 } }
	]);

	// Top Selling Products
	const topProducts = await Order.aggregate([
		{ $unwind: "$products" },
		{ $group: { _id: "$products.product", value: { $sum: "$products.quantity" } } },
		{ $sort: { value: -1 } },
		{ $limit: 5 },
		{ $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
		{ $unwind: "$productDetails" },
		{ $project: { name: "$productDetails.name", value: 1, _id: 0 } }
	]);

	return {
		users: totalUsers,
		products: totalProducts,
		totalSales,
		totalRevenue,
		categoryData,
		revenueByCategory,
		topProducts
	};
};

export const getDailySalesData = async (startDate, endDate) => {
	try {
		const dailySalesData = await Order.aggregate([
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
				},
			},
			// First, calculate total quantity for each order (preserve totalAmount)
			{ $unwind: "$products" },
			{
				$group: {
					_id: "$_id",
					createdAt: { $first: "$createdAt" },
					totalAmount: { $first: "$totalAmount" },
					orderQuantity: { $sum: "$products.quantity" }
				}
			},
			// Now group by date
			{
				$group: {
					_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
					sales: { $sum: "$orderQuantity" },
					revenue: { $sum: "$totalAmount" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		const dateArray = getDatesInRange(startDate, endDate);

		return dateArray.map((date) => {
			const foundData = dailySalesData.find((item) => item._id === date);

			return {
				date,
				sales: foundData?.sales || 0,
				revenue: foundData?.revenue || 0,
			};
		});
	} catch (error) {
		throw error;
	}
};

function getDatesInRange(startDate, endDate) {
	const dates = [];
	let currentDate = new Date(startDate);

	while (currentDate <= endDate) {
		dates.push(currentDate.toISOString().split("T")[0]);
		currentDate.setDate(currentDate.getDate() + 1);
	}

	return dates;
}

export const getUserAnalyticsData = async (userId) => {
	const totalProducts = await Product.countDocuments({ userId });

	const salesStats = await Order.aggregate([
		{ $unwind: "$products" },
		{ $match: { "products.userId": userId } },
		{
			$group: {
				_id: null,
				totalSales: { $sum: "$products.quantity" },
				totalRevenue: { $sum: { $multiply: ["$products.quantity", "$products.price"] } },
			},
		},
	]);

	const { totalSales = 0, totalRevenue = 0 } = salesStats[0] || {};

	// User Category Distribution (Product Count)
	const categoryData = await Product.aggregate([
		{ $match: { userId } },
		{ $group: { _id: "$category", value: { $sum: 1 } } },
		{ $project: { name: "$_id", value: 1, _id: 0 } }
	]);

	// User Revenue by Category
	const revenueByCategory = await Order.aggregate([
		{ $unwind: "$products" },
		{ $match: { "products.userId": userId } },
		{
			$group: {
				_id: "$products.product",
				revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } }
			}
		},
		{
			$lookup: {
				from: "products",
				localField: "_id",
				foreignField: "_id",
				as: "productDetails"
			}
		},
		{ $unwind: "$productDetails" },
		{
			$group: {
				_id: "$productDetails.category",
				value: { $sum: "$revenue" }
			}
		},
		{ $project: { name: "$_id", value: 1, _id: 0 } },
		{ $sort: { value: -1 } }
	]);

	// User Top Selling Products
	const topProducts = await Order.aggregate([
		{ $unwind: "$products" },
		{ $match: { "products.userId": userId } },
		{ $group: { _id: "$products.product", value: { $sum: "$products.quantity" } } },
		{ $sort: { value: -1 } },
		{ $limit: 5 },
		{ $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
		{ $unwind: "$productDetails" },
		{ $project: { name: "$productDetails.name", value: 1, _id: 0 } }
	]);

	return { totalProducts, totalSales, totalRevenue, categoryData, revenueByCategory, topProducts };
};

export const getUserDailySalesData = async (userId, startDate, endDate) => {
	const dailySalesData = await Order.aggregate([
		{ $unwind: "$products" },
		{
			$match: {
				"products.userId": userId,
				createdAt: { $gte: startDate, $lte: endDate }
			}
		},
		{
			$group: {
				_id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
				sales: { $sum: "$products.quantity" },
				revenue: { $sum: { $multiply: ["$products.price", "$products.quantity"] } },
			},
		},
		{ $sort: { _id: 1 } }
	]);

	const dateArray = getDatesInRange(startDate, endDate);

	return dateArray.map((date) => {
		const foundData = dailySalesData.find((item) => item._id === date);
		return {
			date,
			sales: foundData?.sales || 0,
			revenue: foundData?.revenue || 0,
		};
	});
};
