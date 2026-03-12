import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import Product from "../models/product.model.js";

export const createCheckoutSession = async (req, res) => {
	try {
		const { products, couponCode } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		let totalAmount = 0;

		const lineItems = products.map((product) => {
			const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
			totalAmount += amount * product.quantity;

			return {
				price_data: {
					currency: "usd",
					product_data: {
						name: product.name,
						images: [product.image],
					},
					unit_amount: amount,
				},
				quantity: product.quantity || 1,
			};
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
			}
		}

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
			discounts: coupon
				? [
					{
						coupon: await createStripeCoupon(coupon.discountPercentage),
					},
				]
				: [],
			metadata: {
				userId: req.user._id.toString(),
				couponCode: couponCode || "",
				products: JSON.stringify(
					products.map((p) => ({
						id: p._id,
						quantity: p.quantity,
						price: p.price,
					}))
				),
			},
		});

		if (totalAmount >= 20000) {
			await createNewCoupon(req.user._id);
		}
		res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
	} catch (error) {
		console.error("Error processing checkout:", error);
		res.status(500).json({ message: "Error processing checkout", error: error.message });
	}
};

export const checkoutSuccess = async (req, res) => {
	try {
		const { sessionId } = req.body;
		const session = await stripe.checkout.sessions.retrieve(sessionId);
		console.log("Checkout Session Retrieved:", session.id, "Status:", session.payment_status);

		if (session.payment_status === "paid") {
			// Check if order already exists to prevent duplicates (Idempotency)
			const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
			if (existingOrder) {
				return res.status(200).json({
					success: true,
					message: "Order already exists.",
					orderId: existingOrder._id,
				});
			}

			if (session.metadata.couponCode) {
				await Coupon.findOneAndUpdate(
					{
						code: session.metadata.couponCode,
						userId: session.metadata.userId,
					},
					{
						isActive: false,
					}
				);
			}

			// create a new Order
			const products = JSON.parse(session.metadata.products);
			const detailedProducts = await Promise.all(
				products.map(async (item) => {
					const productDoc = await Product.findById(item.id);

					if (!productDoc) {
						throw new Error(`Product not found: ${item.id}`);
					}

					return {
						product: productDoc._id,
						userId: productDoc.userId, // ✅ add seller info
						quantity: item.quantity,
						price: item.price,
					};
				})
			);

			const newOrder = new Order({
				user: session.metadata.userId, // buyer
				products: detailedProducts,
				totalAmount: session.amount_total / 100,
				stripeSessionId: sessionId,
			});

			await newOrder.save();

			res.status(200).json({
				success: true,
				message: "Payment successful, order created, and coupon deactivated if used.",
				orderId: newOrder._id,
			});
		}
	} catch (error) {
		console.error("Error processing successful checkout:", error);
		res.status(500).json({ message: `Error processing checkout: ${error.message}`, error: error.message });
	}
};

async function createStripeCoupon(discountPercentage) {
	const coupon = await stripe.coupons.create({
		percent_off: discountPercentage,
		duration: "once",
	});

	return coupon.id;
}

async function createNewCoupon(userId) {
	await Coupon.findOneAndDelete({ userId });

	const newCoupon = new Coupon({
		code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
		discountPercentage: 10,
		expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		userId: userId,
	});

	await newCoupon.save();

	return newCoupon;
}

export const getPurchasedProducts = async (req, res) => {
	try {
		const orders = await Order.find({ user: req.user._id }).populate("products.product");

		const purchasedProducts = orders.flatMap((order) =>
			order.products.map((item) => item.product)
		).filter((product, index, self) =>
			// Filter out nulls (deleted products) and duplicates
			product && self.findIndex(p => p._id.toString() === product._id.toString()) === index
		);

		res.json(purchasedProducts);
	} catch (error) {
		console.error("Error fetching purchased products:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const processUPIPayment = async (req, res) => {
	try {
		const { products, couponCode, upiId } = req.body;

		if (!Array.isArray(products) || products.length === 0) {
			return res.status(400).json({ error: "Invalid or empty products array" });
		}

		if (!upiId) {
			return res.status(400).json({ error: "UPI ID is required" });
		}

		let totalAmount = 0;
		products.forEach((product) => {
			totalAmount += product.price * product.quantity;
		});

		let coupon = null;
		if (couponCode) {
			coupon = await Coupon.findOne({ code: couponCode, userId: req.user._id, isActive: true });
			if (coupon) {
				totalAmount -= (totalAmount * coupon.discountPercentage) / 100;
			}
		}

		// Mock Stripe Session ID for UPI
		const mockSessionId = `mock_upi_${Date.now()}_${Math.random().toString(36).substring(7)}`;

		// Create detailed products array for the order
		const detailedProducts = products.map(product => ({
			product: product._id,
			userId: product.userId || req.user._id, // Fallback if not present, though it should be
			quantity: product.quantity,
			price: product.price
		}));

		const newOrder = new Order({
			user: req.user._id,
			products: detailedProducts,
			totalAmount: totalAmount,
			stripeSessionId: mockSessionId,
		});

		await newOrder.save();

		// Deactivate coupon if used
		if (coupon) {
			await Coupon.findByIdAndUpdate(coupon._id, { isActive: false });
		}

		if (totalAmount >= 200) { // Threshold for new coupon
			await createNewCoupon(req.user._id);
		}

		res.status(200).json({
			success: true,
			message: "UPI Payment successful",
			orderId: newOrder._id,
		});

	} catch (error) {
		console.error("Error processing UPI payment:", error);
		res.status(500).json({ message: "Error processing UPI payment", error: error.message });
	}
};
