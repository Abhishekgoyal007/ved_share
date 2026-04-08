import { Trash, Minus, Plus } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const CartItem = ({ item }) => {
	const { removeFromCart, updateQuantity } = useCartStore();

	return (
		<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm mb-4 transition-all hover:shadow-md'>
			<div className='flex flex-col sm:flex-row items-center gap-6'>
				<div className='shrink-0'>
					<img className='w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-800' src={item.image} alt={item.name} />
				</div>

				<div className='flex-1 min-w-0 space-y-2'>
					<div className="flex justify-between items-start gap-4">
						<div>
							<h3 className='text-lg font-bold text-slate-900 dark:text-white truncate max-w-[200px]'>
								{item.name}
							</h3>
							<p className='text-xs font-bold text-slate-400 uppercase tracking-widest mt-1'>{(item?.category || 'Uncategorized').replace(/-/g, ' ')}</p>
						</div>
						<button
							className='p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all'
							onClick={() => removeFromCart(item._id)}
						>
							<Trash size={18} />
						</button>
					</div>
					
					<p className='text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed'>
						{item.description}
					</p>

					<div className="flex items-center justify-between pt-4">
						<div className="flex items-center bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded-xl border border-slate-100 dark:border-slate-800">
							<button 
								onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
								className="p-1.5 text-slate-500 hover:text-primary-600 transition-colors"
							>
								<Minus size={14} />
							</button>
							<span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</span>
							<button 
								onClick={() => updateQuantity(item._id, item.quantity + 1)}
								className="p-1.5 text-slate-500 hover:text-primary-600 transition-colors"
							>
								<Plus size={14} />
							</button>
						</div>
						<p className='text-xl font-black text-slate-900 dark:text-white'>₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</p>
					</div>
				</div>
			</div>
		</div>
	);
};
export default CartItem;
