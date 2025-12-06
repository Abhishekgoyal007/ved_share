import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
	return (
		<div className='flex w-full relative flex-col overflow-hidden rounded-2xl border border-gray-700/50 shadow-lg bg-gray-800/40 backdrop-blur-xl hover:shadow-cyan-500/10 transition-all duration-300 group'>
			<Link to={`/product/${product._id}`} className="flex flex-col h-full">
				<div className='relative mx-3 mt-3 flex h-64 overflow-hidden rounded-xl'>
					<div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					<img
						className='object-cover w-full h-full transition-transform duration-500 group-hover:scale-110'
						src={product.image}
						alt={product.name}
					/>
				</div>

				<div className='mt-4 px-5 pb-5 flex-1 flex flex-col'>
					<h5 className='text-xl font-bold tracking-tight text-white mb-2 group-hover:text-cyan-400 transition-colors line-clamp-1'>
						{product.name}
					</h5>

					<div className='mt-auto flex items-center justify-between gap-4'>
						<p>
							{product.price === 0 ? (
								<span className='text-2xl font-extrabold text-green-400 uppercase tracking-wider'>Free</span>
							) : (
								<span className='text-2xl font-bold text-cyan-400'>₹{product.price}</span>
							)}
						</p>
						{product.isFeatured && (
							<div className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs text-yellow-400 font-medium">
								Featured
							</div>
						)}
					</div>
				</div>
			</Link>
		</div>
	);
};
export default ProductCard;
