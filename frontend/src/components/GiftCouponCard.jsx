import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useCartStore } from "../stores/useCartStore";

const GiftCouponCard = () => {
	const [userInputCode, setUserInputCode] = useState("");
	const { coupon, isCouponApplied, applyCoupon, getMyCoupon, removeCoupon } = useCartStore();

	useEffect(() => {
		getMyCoupon();
	}, [getMyCoupon]);

	useEffect(() => {
		if (coupon) setUserInputCode(coupon.code);
	}, [coupon]);

	const handleApplyCoupon = () => {
		if (!userInputCode) return;
		applyCoupon(userInputCode);
	};

	const handleRemoveCoupon = async () => {
		await removeCoupon();
		setUserInputCode("");
	};

	return (
		<motion.div
			className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2 }}
		>
			<div className='space-y-6'>
				<div>
					<label htmlFor='voucher' className='text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block text-center'>
						Redeem Voucher / Gift Card
					</label>
                    <div className="flex gap-2">
                        <input
                            type='text'
                            id='voucher'
                            className='flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all'
                            placeholder='Enter code...'
                            value={userInputCode}
                            onChange={(e) => setUserInputCode(e.target.value)}
                        />
                        <button
                            type='button'
                            className='px-6 py-3 bg-slate-900 dark:bg-primary-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-95'
                            onClick={handleApplyCoupon}
                        >
                            Apply
                        </button>
                    </div>
				</div>
			</div>

			<AnimatePresence>
				{isCouponApplied && coupon && (
					<motion.div 
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className='bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl flex items-center justify-between overflow-hidden'
					>
						<div>
							<p className='text-[10px] font-black text-emerald-600 uppercase tracking-widest'>Active Voucher</p>
							<p className='text-sm font-bold text-slate-900 dark:text-white mt-1'>{coupon.code}</p>
						</div>
						<button
							type='button'
							className='text-emerald-600 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest'
							onClick={handleRemoveCoupon}
						>
							Remove
						</button>
					</motion.div>
				)}
			</AnimatePresence>

			{!isCouponApplied && coupon && (
				<div className='bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20 p-5 rounded-3xl'>
					<h3 className='text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1'>Available for you:</h3>
					<p className='text-sm font-bold text-slate-900 dark:text-white'>
						{coupon.code} <span className="text-primary-600 ml-2">-{coupon.discountPercentage}% OFF</span>
					</p>
                    <p className="text-[10px] text-slate-400 mt-2">Apply this code to save on your order.</p>
				</div>
			)}
		</motion.div>
	);
};

export default GiftCouponCard;
