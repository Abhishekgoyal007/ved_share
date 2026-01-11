import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Hand } from "lucide-react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
import { useUserStore } from "../stores/useUserStore";
import FeaturedProducts from "../components/FeaturedProducts";

const categories = [
	{ href: "/printed-textbooks", name: "Printed Textbooks", imageUrl: "/printed-textbooks.jpg" },
	{ href: "/etextbooks", name: "eTextbooks", imageUrl: "/etextbooks.jpg" },
	{ href: "/hardcopy-notes", name: "Hardcopy Notes", imageUrl: "/hardcopy-notes.jpg" },
	{ href: "/enotes", name: "eNotes", imageUrl: "/enotes.jpg" },
	{ href: "/printed-novels", name: "Printed Novels", imageUrl: "/printed-novels.jpg" },
	{ href: "/printed-nonfiction", name: "Printed Non Fiction", imageUrl: "/printed-nonfiction.jpg" },
];

const specialCategories = [
	{ href: "/free-section", name: "Free Section", imageUrl: "/free-section.png" },
	{ href: "/book-swap", name: "Book Swap", imageUrl: "/bookswap.jpg" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading, pendingOffersCount, fetchPendingOffersCount } = useProductStore();
	const { user } = useUserStore();

	useEffect(() => {
		fetchFeaturedProducts();
		if (user) fetchPendingOffersCount();
	}, [fetchFeaturedProducts, fetchPendingOffersCount, user]);

	return (
		<div className="relative min-h-screen text-white overflow-hidden">
			{/* Hero Section */}
			<div className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white min-h-screen flex items-center">
				{/* Subtle gradient overlay */}
				<div className="absolute inset-0 bg-gradient-to-br from-cyan-900/10 via-transparent to-blue-900/10" />

				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between w-full py-20">
					{/* Left side text */}
					<div className="md:w-1/2 text-center md:text-left">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent mb-6 flex items-center gap-4"
						>
							VedShare <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-cyan-400" />
						</motion.h1>

						<motion.p
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, delay: 0.2 }}
							className="text-xl sm:text-2xl text-gray-300 mb-8"
						>
							{user ? (
								<span className="text-2xl sm:text-3xl flex items-center gap-2">
									<Hand className="w-8 h-8 text-yellow-400 animate-wave" /> Welcome back, <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent font-semibold">{user.name}</span>!
								</span>
							) : (
								<span className="leading-relaxed">
									Buy, Sell & Learn — all in one platform.
									<br />
									<span className="text-gray-400 text-lg">Join thousands of students sharing knowledge</span>
								</span>
							)}
						</motion.p>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 1, delay: 0.4 }}
							className="flex flex-wrap justify-center md:justify-start gap-4"
						>
							{!user ? (
								<>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Link
											to="/signup"
											className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
										>
											Get Started
											<ArrowRight size={20} />
										</Link>
									</motion.div>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Link
											to="/login"
											className="px-8 py-4 rounded-xl border-2 border-cyan-500/50 text-cyan-400 font-semibold hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-200 flex items-center gap-2"
										>
											Login
											<ArrowRight size={20} />
										</Link>
									</motion.div>
								</>
							) : (
								<>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Link
											to="/dashboard"
											className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold shadow-lg transition-all duration-200 flex items-center gap-2 relative"
										>
											Dashboard
											<ArrowRight size={20} />
											{pendingOffersCount > 0 && (
												<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
													{pendingOffersCount}
												</span>
											)}
										</Link>
									</motion.div>
									<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
										<Link
											to="/learning-desk"
											className="px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-semibold shadow-lg transition-all duration-200 flex items-center gap-2"
										>
											Learning Desk
											<ArrowRight size={20} />
										</Link>
									</motion.div>
								</>
							)}
						</motion.div>
					</div>

					{/* Right side image */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1, delay: 0.3 }}
						className="md:w-1/2 mt-16 md:mt-0 flex justify-center"
					>
						<div className="relative">
							<img
								src="/hero-image2.png"
								alt="Books"
								className="relative w-full max-w-2xl rounded-3xl shadow-2xl"
							/>
						</div>
					</motion.div>
				</div>
			</div>

			{/* Categories Section */}
			<div className="relative z-10 bg-gray-900 py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className="text-center mb-16"
					>
						<h2 className="text-4xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
							Explore Our Categories
						</h2>
						<p className="text-xl text-gray-400 max-w-2xl mx-auto">
							Books Worth Sharing, Readers Worth Connecting!
							<br />
							<span className="text-gray-500">Buy and Sell Books without any hassle</span>
						</p>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"
					>
						{categories.map((category, index) => (
							<motion.div
								key={category.name}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<CategoryItem category={category} />
							</motion.div>
						))}
					</motion.div>

					{/* Special Categories (Free & Book Swap) */}
					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8, delay: 0.4 }}
						className="grid grid-cols-1 md:grid-cols-2 gap-6"
					>
						{specialCategories.map((category, index) => (
							<motion.div
								key={category.name}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.1 }}
							>
								<CategoryItem category={category} />
							</motion.div>
						))}
					</motion.div>

					{!isLoading && products.length > 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8 }}
							className="mt-20"
						>
							<FeaturedProducts featuredProducts={products} />
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default HomePage;
