import { useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
	{ href: "/free-section", name: "Free Section", imageUrl: "/free-section.png" },
];

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();
	const { user } = useUserStore();

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className="relative min-h-screen text-white overflow-hidden">

			{/* Hero Section */}
			<div className="relative bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white min-h-screen flex items-center">
				<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between w-full">
					
					{/* Left side text */}
					<div className="md:w-1/2 text-center md:text-left">
						<motion.h1
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8 }}
							className="text-5xl sm:text-6xl font-bold text-cyan-400 drop-shadow-lg"
						>
							VedShare 📚
						</motion.h1>

						<motion.p
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={{ duration: 1, delay: 0.2 }}
	className="mt-6 text-xl text-gray-300"
>
	{user ? (
		<span className=  "text-3xl">
			👋 Welcome back, <span className="text-cyan-400 font-semibold">{user.name}</span>!
		</span>
	) : (
		<span>
			Buy, Sell & Learn — all in one platform.
			<br />
		</span>
	)}
</motion.p>

						<motion.div
	initial={{ opacity: 0, y: 20 }}
	animate={{ opacity: 1, y: 0 }}
	transition={{ duration: 1, delay: 0.4 }}
	className="mt-10 flex justify-center md:justify-start gap-6"
>
	{!user ? (
		<>
			<Link
				to="/login"
				className="px-6 py-3 rounded-2xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition"
			>
				Login
			</Link>
			<Link
				to="/register"
				className="px-6 py-3 rounded-2xl border border-cyan-500 text-cyan-400 font-semibold hover:bg-cyan-500 hover:text-black transition"
			>
				Register
			</Link>
		</>
	) : (
		<>
			<Link
				to="/dashboard"
				className="px-6 py-3 rounded-2xl bg-cyan-400 text-black font-semibold hover:bg-cyan-300 transition"
			>
				Dashboard
			</Link>
			<Link
				to="/learning-desk"
				className="px-6 py-3 rounded-2xl border border-cyan-400 text-cyan-300 font-semibold hover:bg-cyan-400 hover:text-black transition"
			>
				Learning Desk
			</Link>
		</>
	)}
</motion.div>
					</div>

					{/* Right side image */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1, delay: 0.3 }}
						className="md:w-1/2 mt-10 md:mt-0 flex justify-center"
					>
						<img
							src="/hero-image2.png"
							alt="Books"
							className="w-3/4 md:w-full rounded-2xl shadow-lg"
						/>
					</motion.div>
				</div>

				{/* Subtle animated background shapes */}
				<motion.div
	initial={{ opacity: 0 }}
	animate={{ opacity: 0.6 }}
	transition={{ duration: 2 }}
	className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0"
>
	{/* Cyan Blob */}
	<div className="absolute w-[400px] h-[400px] bg-cyan-400 rounded-full mix-blend-screen filter blur-[120px] opacity-60 animate-pulse top-[-50px] left-[-50px]"></div>

	{/* Blue Blob */}
	<div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[160px] opacity-50 animate-pulse bottom-[-60px] right-[-60px]"></div>
</motion.div>
			</div>

			{/* Categories Section */}
			<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<h1 className="text-center text-5xl sm:text-6xl font-bold text-cyan-400 mb-4">
					Explore Our Categories
				</h1>
				<p className="text-center text-xl text-gray-300 mb-12">
					Books Worth Sharing, Readers Worth Connecting!
					<br /> Buy and Sell Books without any hassle
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>

				{!isLoading && products.length > 0 && (
					<FeaturedProducts featuredProducts={products} />
				)}
			</div>
		</div>
	);
};

export default HomePage;
