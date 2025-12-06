import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "../lib/axios";
import { useState } from "react";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
	"pk_test_51QtqEi4NkYn5T4rupaMHo9mIND5rk9LBdvccm8P95N9IIVh9Zws1haZuPymJjOKA3BjjGhjeziv0PgZ6Ed8gfbWq00NjmTR4IN"
);

const OrderSummary = () => {
	const { total, subtotal, coupon, isCouponApplied, cart } = useCartStore();

	const savings = subtotal - total;
	const formattedSubtotal = subtotal.toFixed(2);
	const formattedTotal = total.toFixed(2);
	const formattedSavings = savings.toFixed(2);

	const [paymentMethod, setPaymentMethod] = useState("stripe");
	const [processing, setProcessing] = useState(false);

	const handlePayment = async () => {
		if (paymentMethod === "stripe") {
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
			}
		} else {
			// UPI Payment Simulation
			setProcessing(true);
			toast.loading("Simulating UPI Payment...", { id: "upi-payment" });

			// Simulate scanning delay
			await new Promise(resolve => setTimeout(resolve, 2000));

			try {
				const res = await axios.post("/payments/upi", {
					products: cart,
					couponCode: coupon ? coupon.code : null,
					upiId: "demo@upi", // Hardcoded for simulation
				});

				if (res.data.success) {
					toast.success("Payment Successful!", { id: "upi-payment" });
					window.location.href = `/purchase-success?session_id=${res.data.orderId}&source=upi`;
				}
			} catch (error) {
				console.error("UPI Payment Error:", error);
				toast.error(error.response?.data?.message || "Payment failed", { id: "upi-payment" });
				setProcessing(false);
			}
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
							className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${paymentMethod === "stripe"
								? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
								: "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700"
								}`}
						>
							<span className="font-medium">Card</span>
						</button>
						<button
							onClick={() => setPaymentMethod("upi")}
							className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${paymentMethod === "upi"
								? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
								: "bg-gray-700/50 border-gray-600 text-gray-400 hover:bg-gray-700"
								}`}
						>
							<span className="font-medium">UPI</span>
						</button>
					</div>
				</div>

				{paymentMethod === "upi" && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						className="space-y-4 bg-gray-900/50 p-4 rounded-xl border border-gray-700/50"
					>
						<div className="flex flex-col items-center gap-4">
							<div className="relative w-48 h-48 bg-white p-2 rounded-xl shadow-lg">
								{/* Simulated QR Code */}
								<div className="w-full h-full border-4 border-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
									<div className="absolute inset-0 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=vedshare@upi&pn=VedShare&am=100')] bg-cover bg-center opacity-90" />
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="bg-white p-2 rounded-full shadow-md">
											<img src="/logo.png" alt="UPI" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display = 'none'} />
										</div>
									</div>
									{/* Scanning Animation */}
									{processing && (
										<motion.div
											className="absolute top-0 left-0 w-full h-1 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)] z-10"
											animate={{ top: ["0%", "100%", "0%"] }}
											transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
										/>
									)}
								</div>
							</div>
							<div className="text-center">
								<p className="text-sm font-medium text-white">Scan with any UPI App</p>
								<p className="text-xs text-gray-400 mt-1">GPay, PhonePe, Paytm, etc.</p>
							</div>
						</div>
					</motion.div>
				)}

				<motion.button
					className='flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-3 text-sm font-bold text-white hover:from-cyan-500 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-cyan-900 shadow-lg shadow-cyan-900/20 disabled:opacity-50 disabled:cursor-not-allowed'
					whileHover={{ scale: 1.02 }}
					whileTap={{ scale: 0.98 }}
					onClick={handlePayment}
					disabled={processing}
				>
					{processing ? "Processing..." : paymentMethod === "stripe" ? "Proceed to Checkout" : "Click to Complete Payment (Simulated)"}
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
