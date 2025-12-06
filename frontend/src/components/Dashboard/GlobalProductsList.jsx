import { motion } from "framer-motion";
import { Trash, Star, Package } from "lucide-react";
import { useProductStore } from "../../stores/useProductStore";

const GlobalProductsList = () => {
	const { deleteProduct, toggleFeaturedProduct, products } = useProductStore();

	return (
		<motion.div
			className='bg-gray-800/60 backdrop-blur-md border border-gray-700/50 shadow-xl rounded-2xl overflow-hidden max-w-6xl mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
				<div className="p-2 bg-blue-500/10 rounded-lg">
					<Package className="w-6 h-6 text-blue-400" />
				</div>
				<h2 className="text-xl font-bold text-white">All Products</h2>
			</div>

			<div className="overflow-x-auto">
				<table className='min-w-full divide-y divide-gray-700/50'>
					<thead className='bg-gray-800/50'>
						<tr>
							<th
								scope='col'
								className='px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider'
							>
								Product
							</th>
							<th
								scope='col'
								className='px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider'
							>
								Price
							</th>
							<th
								scope='col'
								className='px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider'
							>
								Category
							</th>
							<th
								scope='col'
								className='px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider'
							>
								Seller
							</th>

							<th
								scope='col'
								className='px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider'
							>
								Featured
							</th>
							<th
								scope='col'
								className='px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider'
							>
								Actions
							</th>
						</tr>
					</thead>

					<tbody className='divide-y divide-gray-700/50 bg-transparent'>
						{products?.map((product) => (
							<tr key={product._id} className='hover:bg-gray-700/30 transition-colors duration-200'>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='flex items-center'>
										<div className='flex-shrink-0 h-12 w-12 relative group'>
											<img
												className='h-12 w-12 rounded-xl object-cover border border-gray-700 shadow-sm group-hover:scale-110 transition-transform duration-200'
												src={product.image}
												alt={product.name}
											/>
										</div>
										<div className='ml-4'>
											<div className='text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors'>{product.name}</div>
										</div>
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className='text-sm font-medium text-emerald-400'>₹{product.price.toFixed(2)}</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
										{product.category}
									</span>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<div className="flex items-center gap-2">
										<div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
											<span className="text-white font-bold text-xs">
												{product.userId?.name?.charAt(0).toUpperCase() || "?"}
											</span>
										</div>
										<span className="text-sm text-gray-300">{product.userId?.name || "Unknown"}</span>
									</div>
								</td>
								<td className='px-6 py-4 whitespace-nowrap'>
									<button
										onClick={() => toggleFeaturedProduct(product._id)}
										className={`p-2 rounded-lg transition-all duration-200 ${product.isFeatured
												? "bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20"
												: "bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-yellow-400"
											}`}
										title={product.isFeatured ? "Remove from Featured" : "Add to Featured"}
									>
										<Star className={`h-5 w-5 ${product.isFeatured ? "fill-yellow-400" : ""}`} />
									</button>
								</td>
								<td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
									<button
										onClick={() => deleteProduct(product._id)}
										className='text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors duration-200'
										title="Delete Product"
									>
										<Trash className='h-5 w-5' />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{products?.length === 0 && (
					<div className="text-center py-12 text-gray-400">
						<Package className="mx-auto h-12 w-12 text-gray-600 mb-3" />
						<p>No products found.</p>
					</div>
				)}
			</div>
		</motion.div>
	);
};
export default GlobalProductsList;
