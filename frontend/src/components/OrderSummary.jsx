import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, CreditCard, Smartphone } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
	"pk_test_51QtqEi4NkYn5T4rupaMHo9mIND5rk9LBdvccm8P95N9IIVh9Zws1haZuPymJjOKA3BjjGhjeziv0PgZ6Ed8gfbWq00NjmTR4IN"
);

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();
	const navigate = useNavigate();

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);

	const [paymentMethod, setPaymentMethod] = useState("stripe");
	const [processing, setProcessing] = useState(false);

	const handlePayment = async () => {
		if (paymentMethod === "stripe") {
			setProcessing(true);
			try {
				const stripe = await stripePromise;
				const res = await axios.post("/payments/create-checkout-session", {
					products: cart,
					couponCode: coupon ? coupon.code : null,
				});

				const session = res.data;
				const result = await stripe.redirectToCheckout({
					sessionId: session.id,
				});

				if (result.error) {
					console.error("Error:", result.error);
					toast.error("Payment failed. Please try again.");
				}
			} catch (error) {
				console.error("Checkout Error:", error);
				toast.error(error.response?.data?.message || "Failed to initiate checkout");
			} finally {
				setProcessing(false);
			}
		} else {
			// Navigate to the dedicated UPI Payment page
			navigate("/upi-payment");
		}
	};

	return (
		<motion.div
			className='space-y-4 rounded-xl border border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4 shadow-lg sm:p-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<p className='text-xl font-bold text-white'>Order Summary</p>

			<div className='space-y-4'>
				<div className='space-y-2'>
					<dl className='flex items-center justify-between gap-4'>
						<dt className='text-base font-normal text-gray-300'>Original price</dt>
						<dd className='text-base font-medium text-white'>₹{formattedSubtotal}</dd>
					</dl>

					{savings > 0 && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Savings</dt>
							<dd className='text-base font-medium text-cyan-400'>-₹{formattedSavings}</dd>
						</dl>
					)}

					{coupon && isCouponApplied && (
						<dl className='flex items-center justify-between gap-4'>
							<dt className='text-base font-normal text-gray-300'>Coupon ({coupon.code})</dt>
							<dd className='text-base font-medium text-cyan-400'>-{coupon.discountPercentage}%</dd>
						</dl>
					)}
					<dl className='flex items-center justify-between gap-4 border-t border-gray-700 pt-2'>
						<dt className='text-base font-bold text-white'>Total</dt>
						<dd className='text-base font-bold text-cyan-400'>₹{formattedTotal}</dd>
					</dl>
				</div>

				{/* Payment Method Selection */}
				<div className="pt-4 border-t border-gray-700">
					<p className="text-sm font-medium text-gray-300 mb-3">Payment Method</p>
					<div className="grid grid-cols-2 gap-3">
						<button
							onClick={() => setPaymentMethod("stripe")}
							className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${paymentMethod === "stripe"
								? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
								: "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700"
								}`}
						>
							<CreditCard size={18} />
							<span className="font-medium">Card</span>
						</button>
						<button
							onClick={() => setPaymentMethod("upi")}
							className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all ${paymentMethod === "upi"
								? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
								: "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700"
								}`}
						>
							<Smartphone size={18} />
							<span className="font-medium">UPI</span>
						</button>
					</div>
				</div>

				{paymentMethod === "upi" && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl"
					>
						<p className="text-sm text-cyan-300 text-center">
							You'll be redirected to a secure UPI payment page with QR code and payment options.
						</p>
					</motion.div>
				)}

				<motion.button
					className='flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-bold text-white hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-cyan-900 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed'
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={handlePayment}
					disabled={processing}
				>
					{processing ? (
						"Processing..."
					) : paymentMethod === "stripe" ? (
						<>
							<CreditCard size={18} />
							Proceed to Checkout
						</>
					) : (
						<>
							<Smartphone size={18} />
							Pay with UPI
						</>
					)}
				</motion.button>

				<div className='flex items-center justify-center gap-2'>
					<span className='text-sm font-normal text-gray-400'>or</span>
					<Link
						to='/'
						className='inline-flex items-center gap-2 text-sm font-medium text-cyan-400 underline hover:text-cyan-300 hover:no-underline transition-colors'
					>
						Continue Shopping
						<MoveRight size={16} />
					</Link>
				</div>
			</div>
		</motion.div>
	);
};
export default OrderSummary;
