import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, CreditCard, Smartphone, CheckCircle2 } from "lucide-react";
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

	const savings = (subtotal || 0) - (total || 0);
	const formattedSubtotal = (subtotal || 0).toLocaleString();
	const formattedSavings = (savings || 0).toLocaleString();

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
			navigate("/upi-payment");
		}
	};

	return (
		<motion.div
			className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 dark:shadow-none'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-primary-100 dark:bg-primary-900/20 rounded-2xl text-primary-600">
                    <CheckCircle2 size={22} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Order Summary</h3>
            </div>
 
			<div className='space-y-8'>
				<div className='space-y-4 pb-8 border-b border-slate-100 dark:border-slate-800/50'>
					<dl className='flex items-center justify-between'>
						<dt className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Subtotal</dt>
						<dd className='text-lg font-bold text-slate-900 dark:text-white'>₹{formattedSubtotal}</dd>
					</dl>
 
					{savings > 0 && (
						<dl className='flex items-center justify-between'>
							<dt className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>Discount Applied</dt>
							<dd className='text-lg font-bold text-emerald-500'>-₹{formattedSavings}</dd>
						</dl>
					)}
 
					{coupon && isCouponApplied && (
						<div className="flex items-center justify-between bg-primary-50/50 dark:bg-primary-900/5 px-4 py-3 rounded-2xl border border-primary-100 dark:border-primary-900/20">
							<span className='text-[10px] font-black text-primary-600 uppercase tracking-widest'>#{coupon.code}</span>
							<span className='text-xs font-black text-primary-600'>-{coupon.discountPercentage}%</span>
						</div>
					)}
				</div>
 
                <dl className='flex items-center justify-between'>
                    <dt className='text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]'>Final Total</dt>
                    <dd className='text-4xl font-black text-primary-600 tracking-tighter'>₹{(total || 0).toFixed(2)}</dd>
                </dl>
 
				{/* Payment Method Selection */}
				<div className="pt-2 space-y-4">
					<p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] text-center">Secure Payment Protocol</p>
					<div className="grid grid-cols-2 gap-3">
						<button
							onClick={() => setPaymentMethod("stripe")}
							className={`flex flex-col items-center gap-2 p-5 rounded-[2rem] border-2 transition-all duration-300 ${paymentMethod === "stripe"
								? "bg-primary-50 dark:bg-primary-900/10 border-primary-500 text-primary-600 scale-[1.02] shadow-lg shadow-primary-500/10"
								: "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-400 hover:border-slate-200 opacity-60"
								}`}
						>
							<CreditCard size={20} />
							<span className="text-[10px] font-black uppercase tracking-widest">Card</span>
						</button>
						<button
							onClick={() => setPaymentMethod("upi")}
							className={`flex flex-col items-center gap-2 p-5 rounded-[2rem] border-2 transition-all duration-300 ${paymentMethod === "upi"
								? "bg-primary-50 dark:bg-primary-900/10 border-primary-500 text-primary-600 scale-[1.02] shadow-lg shadow-primary-500/10"
								: "bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-400 hover:border-slate-200 opacity-60"
								}`}
						>
							<Smartphone size={20} />
							<span className="text-[10px] font-black uppercase tracking-widest">UPI</span>
						</button>
					</div>
				</div>
 
				<button
					className='w-full py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl shadow-primary-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.97] disabled:opacity-50 mt-4'
					onClick={handlePayment}
					disabled={processing}
				>
					{processing ? (
						<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
					) : (
						<>
							Authenticate Transaction
							<MoveRight size={16} />
						</>
					)}
				</button>
 
				<div className='flex items-center justify-center pt-2'>
					<Link
						to='/'
						className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-600 transition-colors'
					>
						Explore Marketplace
					</Link>
				</div>
			</div>
		</motion.div>
	);
};

export default OrderSummary;
