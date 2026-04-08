import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const FeaturedProducts = ({ featuredProducts }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(3);

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

	const nextSlide = () => setCurrentIndex((prev) => prev + 1);
	const prevSlide = () => setCurrentIndex((prev) => prev - 1);

	const isStartDisabled = currentIndex === 0;
	const isEndDisabled = currentIndex >= featuredProducts.length - itemsPerPage;

	return (
		<div className='relative group/carousel px-0 sm:px-12'>
			{/* Left Arrow */}
			<button
				onClick={prevSlide}
				disabled={isStartDisabled}
				className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full border transition-all duration-300 hidden md:flex items-center justify-center ${isStartDisabled
					? "opacity-0 invisible"
					: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 hover:scale-110 shadow-xl"
					}`}
			>
				<ChevronLeft size={24} />
			</button>

			{/* Right Arrow */}
			<button
				onClick={nextSlide}
				disabled={isEndDisabled}
				className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 p-4 rounded-full border transition-all duration-300 hidden md:flex items-center justify-center ${isEndDisabled
					? "opacity-0 invisible"
					: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 hover:scale-110 shadow-xl"
					}`}
			>
				<ChevronRight size={24} />
			</button>

			<div className='overflow-hidden rounded-[2.5rem]'>
				<div
					className='flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)'
					style={{ transform: `translateX(-${currentIndex * (100 / itemsPerPage)}%)` }}
				>
					{featuredProducts?.map((product) => (
						<div key={product._id} className='w-full sm:w-1/2 lg:w-1/3 flex-shrink-0 px-4'>
							<Link to={`/product/${product._id}`} className="group block h-full">
								<div className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10 hover:border-primary-500/30 flex flex-col h-full ring-1 ring-black/5 dark:ring-white/5'>
									{/* Image Section */}
									<div className='relative aspect-square overflow-hidden'>
										<img
											src={product.image}
											alt={product.name}
											className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105'
										/>
										<div className="absolute top-6 right-6">
											<div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 shadow-lg border border-primary-500/10">
												Featured
											</div>
										</div>
										<div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
									</div>

									{/* Content Section */}
									<div className='p-8 flex-1 flex flex-col uppercase'>
										<div className="flex justify-between items-start mb-4">
											<h3 className='text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors'>
												{product.name}
											</h3>
										</div>
										
										<div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
											{product.price === 0 ? (
												<span className='text-3xl font-black text-emerald-500'>FREE</span>
											) : (
												<div className="flex flex-col">
													<span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Pricing</span>
													<span className='text-2xl font-black text-slate-900 dark:text-white'>₹{product.price.toLocaleString()}</span>
												</div>
											)}
											<div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white group-hover:bg-primary-600 group-hover:text-white transition-all transform active:scale-95">
												<ChevronRight size={24} />
											</div>
										</div>
									</div>
								</div>
							</Link>
						</div>
					))}
				</div>
			</div>

			{/* Progress Indicator */}
			<div className="flex justify-center mt-12">
				<div className="h-1.5 w-32 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
					<motion.div 
						animate={{ x: `${(currentIndex / Math.max(1, featuredProducts.length - itemsPerPage)) * 200}%` }}
						className="h-full w-1/3 bg-primary-600 rounded-full"
					/>
				</div>
			</div>
		</div>
	);
};
export default FeaturedProducts;
