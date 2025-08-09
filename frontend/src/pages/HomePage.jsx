import { useEffect } from "react";
import CategoryItem from "../components/CategoryItem";
import { useProductStore } from "../stores/useProductStore";
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

	useEffect(() => {
		fetchFeaturedProducts();
	}, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-cyan-400 mb-4'>
					Explore Our Categories
				</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
					Books Worth Sharing, Readers Worth Connecting!
					<br /> Buy and Sell Books without any hassle
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;
