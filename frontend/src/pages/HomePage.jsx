import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
	{ href: "/category/free-section", name: "Free Section", imageUrl: "/free-section.png" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, loading } = useProductStore();
	const { user } = useUserStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1
			}
		}
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0 }
	};

	return (
		<div className="flex flex-col gap-20">
			{/* Hero Section */}
			<section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-32 px-4">
				<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
					
                    {/* Left Column: Text Content */}
                    <div className="lg:col-span-7 flex flex-col items-start text-left">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-5xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6"
                        >
                            Knowledge Sharing <br />
                            <span className="text-primary-600 dark:text-primary-500">Simplified for Everyone.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="max-w-xl text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed"
                        >
                            Buy or sell books and study materials with ease. Join a community of students making learning more affordable and accessible.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            {!user ? (
                                <>
                                    <Link
                                        to="/category/all"
                                        className="px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-bold shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 group text-lg"
                                    >
                                        Browse Collection
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-8 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-lg"
                                    >
                                        Log In
                                    </Link>
                                </>
                            ) : (
                                <div className="flex gap-4">
                                    <Link
                                        to="/category/all"
                                        className="px-8 py-4 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-bold shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 group text-lg"
                                    >
                                        Browse Collection
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <Link
                                        to="/learning-desk"
                                        className="px-8 py-4 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-lg"
                                    >
                                        Learning Desk
                                    </Link>
                                </div>
                            )}
                        </motion.div>

                    </div>

                    <motion.div 
                        initial={{ opacity: 0, x: 50, y: 0 }}
                        animate={{ opacity: 1, x: 0, y: -40 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="lg:col-span-5 flex justify-center lg:justify-end"
                    >
                        <div className="relative group w-full max-w-[480px]">
                            {/* Decorative background glow */}
                            <div className="absolute -inset-10 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-[100px] group-hover:bg-primary-500/30 transition-all duration-500" />
                            
                            <img 
                                src="/headerimage.png" 
                                alt="Knowledge Sharing" 
                                className="relative w-full h-auto object-contain drop-shadow-[0_32px_64px_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-transform duration-700" 
                            />
                        </div>
                    </motion.div>
				</div>
			</section>

			{/* Featured Products Section */}
			{!loading && products.length > 0 && (
				<section className="px-4">
					<div className="max-w-7xl mx-auto">
						<div className="flex items-end justify-between mb-10">
							<div>
								<h2 className="text-3xl font-bold dark:text-white mb-2 uppercase">Editor's Choice</h2>
								<p className="text-slate-500 font-medium">Hand-picked resources recommended by our community.</p>
							</div>
							<Link to="/category/all" className="text-primary-600 font-semibold hover:underline flex items-center gap-1 text-sm uppercase">
								View All <ArrowRight size={16} />
							</Link>
						</div>
						<FeaturedProducts featuredProducts={products} />
					</div>
				</section>
			)}

			{/* Categories Section */}
			<section className="px-4 py-24 bg-slate-50 dark:bg-slate-900/30">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 uppercase">
							Browse by Category
						</h2>
						<p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">
							Find exactly what you need from our comprehensive collection of academic resources.
						</p>
					</div>

					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
					>
						{categories.map((category) => (
							<motion.div key={category.name} variants={itemVariants}>
								<CategoryItem category={category} />
							</motion.div>
						))}
					</motion.div>

					{/* Special Section - Full Width */}
					<div className="mt-8">
						{specialCategories.map((category) => (
							<motion.div 
								key={category.name}
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								className="w-full h-80 relative group overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none"
							>
								<Link to={"/category" + category.href} className="block w-full h-full">
									<img 
										src={category.imageUrl} 
										alt={category.name} 
										className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.7] group-hover:brightness-[0.8]" 
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
									<div className="absolute bottom-10 left-10">
										<h3 className="text-4xl font-black text-white tracking-tight mb-2">{category.name}</h3>
										<p className="text-slate-200 font-medium">Access community-contributed resources at zero cost.</p>
										<div className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest group-hover:bg-primary-600 group-hover:text-white transition-all">
											Explore Now <ArrowRight size={16} />
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</section>
		</div>
	);
};

export default HomePage;
