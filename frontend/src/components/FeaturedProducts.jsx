import { useEffect, useState } from "react";
import { ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FeaturedProducts = ({ featuredProducts }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(4);

	const { addToCart } = useCartStore();

	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 640) setItemsPerPage(1);
			else if (window.innerWidth < 1024) setItemsPerPage(2);
			else setItemsPerPage(3);
		};

		handleResize();
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => prevIndex + itemsPerPage);
	};

	const prevSlide = () => {
		setCurrentIndex((prevIndex) => prevIndex - itemsPerPage);
	};

	const isStartDisabled = currentIndex === 0;
	const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

	return (
		<div className='py-20 relative overflow-hidden'>
			{/* Background Elements */}
			<div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-50" />
			<div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
				<div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
				<div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
			</div>

			<div className='container mx-auto px-4 relative z-10'>
				<div className="text-center mb-16">
					<h2 className='text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent inline-block'>
						Featured
					</h2>
					<p className="text-gray-400 text-lg max-w-2xl mx-auto">
						Discover our handpicked selection to elevate your learning and reading journey.
					</p>
				</div>

				<div className='relative group px-4 sm:px-12'>
					<div className='overflow-hidden'>
						<div
							className='flex transition-transform duration-500 ease-out'
							style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
						>
							{featuredProducts?.map((product) => (
								<div key={product._id} className='w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-4 py-4'>
									<div className='group/card relative bg-gray-800/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] h-full flex flex-col'>
										<Link to={`/product/${product._id}`} className="flex flex-col h-full">
											{/* Image Container */}
											<div className='relative overflow-hidden aspect-[4/3]'>
												<div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover/card:opacity-60 transition-opacity duration-300 z-10" />
												<img
													src={product.image}
													alt={product.name}
													className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110'
												/>
											</div>

											{/* Content */}
											<div className='p-6 flex-1 flex flex-col'>
												<h3 className='text-2xl font-bold mb-2 text-white group-hover/card:text-cyan-400 transition-colors line-clamp-1'>
													{product.name}
												</h3>
												<div className="mt-auto flex items-center justify-between">
													{product.price === 0 ? (
														<span className='text-2xl font-extrabold text-green-400 uppercase tracking-wider'>Free</span>
													) : (
														<span className='text-2xl font-bold text-white'>
															₹{product.price.toFixed(2)}
														</span>
													)}
													<div className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-xs text-yellow-400 font-medium">
														Featured
													</div>
												</div>
											</div>
										</Link>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Navigation Buttons */}
					<button
						onClick={prevSlide}
						disabled={isStartDisabled}
						className={`absolute top-1/2 -left-2 sm:-left-4 transform -translate-y-1/2 p-3 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300 ${isStartDisabled
							? "bg-gray-900/50 text-gray-600 cursor-not-allowed"
							: "bg-gray-900/80 text-cyan-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 shadow-lg hover:shadow-cyan-500/25"
							}`}
					>
						<ChevronLeft className='w-6 h-6' />
					</button>

					<button
						onClick={nextSlide}
						disabled={isEndDisabled}
						className={`absolute top-1/2 -right-2 sm:-right-4 transform -translate-y-1/2 p-3 rounded-full border border-white/10 backdrop-blur-md transition-all duration-300 ${isEndDisabled
							? "bg-gray-900/50 text-gray-600 cursor-not-allowed"
							: "bg-gray-900/80 text-cyan-400 hover:bg-cyan-500 hover:text-white hover:border-cyan-500 shadow-lg hover:shadow-cyan-500/25"
							}`}
					>
						<ChevronRight className='w-6 h-6' />
					</button>
				</div>
			</div>
		</div>
	);
};
export default FeaturedProducts;
