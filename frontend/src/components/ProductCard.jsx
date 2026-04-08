import { Link } from "react-router-dom";
import { ArrowRight, Bookmark } from "lucide-react";

const ProductCard = ({ product }) => {
	return (
		<Link to={`/product/${product._id}`} className='group relative flex flex-col w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-primary-500/5 hover:-translate-y-1.5 active:scale-[0.98]'>
			{/* Image Section */}
			<div className='relative aspect-square overflow-hidden m-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800'>
				<img
					className='object-cover w-full h-full transition-transform duration-700 group-hover:scale-105'
					src={product.image}
					alt={product.name}
				/>
                <div className="absolute top-3 right-3 z-20">
                    <button className="bg-white/90 dark:bg-slate-950/80 backdrop-blur-md p-2.5 rounded-xl text-slate-400 hover:text-primary-600 transition-colors shadow-sm border border-slate-200/20">
                        <Bookmark size={16} aria-label="Bookmark" />
                    </button>
                </div>
				<div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</div>

			{/* Content section */}
			<div className='p-5 pt-2 flex flex-col flex-1'>
				<div className="mb-3">
					<span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">
						{(product.category || 'Uncategorized').replace(/-/g, ' ')}
					</span>
				</div>

				<h3 className='text-base font-bold text-slate-900 dark:text-white leading-snug mb-3 group-hover:text-primary-600 transition-colors line-clamp-2'>
					{product.name}
				</h3>

				<div className='mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60'>
					<div className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-0.5">Price</span>
                        {product.price === 0 ? (
                            <span className='text-lg font-black text-emerald-500 uppercase'>Free</span>
                        ) : (
                            <span className='text-lg font-black text-slate-900 dark:text-white'>₹{product.price.toLocaleString()}</span>
                        )}
                    </div>
					<div className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
						<ArrowRight size={18} />
					</div>
				</div>
			</div>
		</Link>
	);
};
export default ProductCard;
