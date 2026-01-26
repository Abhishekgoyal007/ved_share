import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader, Image as ImageIcon, X, Tag } from "lucide-react";
import { useProductStore } from "../../stores/useProductStore";

const categories = [
	"printed-textbooks",
	"etextbooks",
	"hardcopy-notes",
	"enotes",
	"printed-novels",
	"printed-nonfiction"
];

const CreateProductForm = () => {
	const [newProduct, setNewProduct] = useState({
		name: "",
		description: "",
		price: "",
		category: "",
		image: "",
		images: {
			front: "",
			back: "",
			left: "",
			right: ""
		},
		pdf: "",
		isBookSwap: false,
		tags: [],
	});
	const [isFree, setIsFree] = useState(false);
	const [isBookSwap, setIsBookSwap] = useState(false);
	const [tagInput, setTagInput] = useState("");

	const { createProduct, loading } = useProductStore();

	const handleFreeToggle = (checked) => {
		setIsFree(checked);
		if (checked) {
			setIsBookSwap(false);
			setNewProduct({ ...newProduct, price: "0", isBookSwap: false });
		} else {
			setNewProduct({ ...newProduct, price: "" });
		}
	};

	const handleBookSwapToggle = (checked) => {
		setIsBookSwap(checked);
		if (checked) {
			setIsFree(false);
			setNewProduct({ ...newProduct, price: "0", isBookSwap: true });
		} else {
			setNewProduct({ ...newProduct, price: "", isBookSwap: false });
		}
	};

	const handleAddTag = () => {
		const tag = tagInput.trim().toLowerCase();
		if (tag && newProduct.tags.length < 7 && !newProduct.tags.includes(tag)) {
			setNewProduct({ ...newProduct, tags: [...newProduct.tags, tag] });
			setTagInput("");
		}
	};

	const handleRemoveTag = (tagToRemove) => {
		setNewProduct({
			...newProduct,
			tags: newProduct.tags.filter(tag => tag !== tagToRemove)
		});
	};

	const handleTagKeyDown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleAddTag();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await createProduct(newProduct);
			// Only clear form data on successful creation
			setNewProduct({ 
				name: "", 
				description: "", 
				price: "", 
				category: "", 
				image: "", 
				images: {
					front: "",
					back: "",
					left: "",
					right: ""
				},
				pdf: "", 
				isBookSwap: false, 
				tags: [] 
			});
			setIsFree(false);
			setIsBookSwap(false);
			setTagInput("");
		} catch (error) {
			// On error, keep form data intact for user to fix and resubmit
			console.log("error creating a product:", error);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();

			reader.onloadend = () => {
				setNewProduct({ ...newProduct, image: reader.result });
			};

			reader.readAsDataURL(file); // base64
		}
	};

	const handleAngleImageChange = (e, angle) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();

			reader.onloadend = () => {
				setNewProduct({
					...newProduct,
					images: {
						...newProduct.images,
						[angle]: reader.result
					}
				});
			};

			reader.readAsDataURL(file); // base64
		}
	};

	const handlePdfChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();

			reader.onloadend = () => {
				setNewProduct({ ...newProduct, pdf: reader.result });
			};

			reader.readAsDataURL(file); // base64
		}
	};

	return (
		<motion.div
			className='bg-gray-800/60 backdrop-blur-md border border-gray-700/50 shadow-xl rounded-2xl p-8 mb-8 max-w-2xl mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.8 }}
		>
			<h2 className='text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500'>
				Create New Product
			</h2>

			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-6">
						<div>
							<label htmlFor='name' className='block text-sm font-medium text-gray-300 mb-2'>
								Product Name
							</label>
							<input
								type='text'
								id='name'
								name='name'
								value={newProduct.name}
								onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
								className='block w-full bg-gray-700/50 border border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200'
								placeholder="e.g., Physics NCERT"
								required
							/>
						</div>

						<div>
							<div className="flex items-center justify-between mb-2">
								<label htmlFor='price' className='block text-sm font-medium text-gray-300'>
									Price (₹)
								</label>
								<div className="flex items-center gap-4">
									<div className="flex items-center">
										<input
											type="checkbox"
											id="isFree"
											checked={isFree}
											onChange={(e) => handleFreeToggle(e.target.checked)}
											className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
										/>
										<label htmlFor="isFree" className="ml-2 text-sm font-medium text-gray-300 cursor-pointer">
											List for Free
										</label>
									</div>
									<div className="flex items-center">
										<input
											type="checkbox"
											id="isBookSwap"
											checked={isBookSwap}
											onChange={(e) => handleBookSwapToggle(e.target.checked)}
											className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
										/>
										<label htmlFor="isBookSwap" className="ml-2 text-sm font-medium text-gray-300 cursor-pointer">
											Book Swap
										</label>
									</div>
								</div>
							</div>
							<input
								type='number'
								id='price'
								name='price'
								value={newProduct.price}
								onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
								step='0.01'
								className='block w-full bg-gray-700/50 border border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
								placeholder="0.00"
								required
								disabled={isFree || isBookSwap}
							/>
						</div>

						<div>
							<label htmlFor='category' className='block text-sm font-medium text-gray-300 mb-2'>
								Category
							</label>
							<select
								id='category'
								name='category'
								value={newProduct.category}
								onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
								className='block w-full bg-gray-700/50 border border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200'
								required
							>
								<option value=''>Select a category</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className="space-y-6">
						<div>
							<label htmlFor='description' className='block text-sm font-medium text-gray-300 mb-2'>
								Description
							</label>
							<textarea
								id='description'
								name='description'
								value={newProduct.description}
								onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
								rows='4'
								className='block w-full bg-gray-700/50 border border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 resize-none'
								placeholder="Describe your product..."
								required
							/>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Product Image
							</label>
							<div className="flex items-center justify-center w-full">
								<label
									htmlFor='image'
									className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200 group overflow-hidden relative'
								>
									{newProduct.image ? (
										<img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
									) : (
										<div className='flex flex-col items-center justify-center pt-5 pb-6'>
											<Upload className='w-8 h-8 mb-3 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200' />
											<p className='text-sm text-gray-400 group-hover:text-gray-300'>
												<span className='font-semibold'>Click to upload</span> or drag and drop
											</p>
										</div>
									)}
									<input type='file' id='image' className='hidden' accept='image/*' onChange={handleImageChange} />
								</label>
							</div>
						</div>
					</div>
				</div>

				{/* Tags Section */}
				<div className="mt-6">
					<label className='block text-sm font-medium text-gray-300 mb-2'>
						<Tag className="inline-block w-4 h-4 mr-1" />
						Tags <span className="text-gray-500">(max 7 - helps with search)</span>
					</label>
					<div className="flex flex-wrap gap-2 mb-3">
						{newProduct.tags.map((tag, index) => (
							<motion.span
								key={tag}
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium"
							>
								#{tag}
								<button
									type="button"
									onClick={() => handleRemoveTag(tag)}
									className="hover:text-red-400 transition-colors"
								>
									<X size={14} />
								</button>
							</motion.span>
						))}
					</div>
					{newProduct.tags.length < 7 && (
						<div className="flex gap-2">
							<input
								type="text"
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={handleTagKeyDown}
								className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl shadow-sm py-2.5 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
								placeholder="Type a tag and press Enter..."
								maxLength={30}
							/>
							<button
								type="button"
								onClick={handleAddTag}
								className="px-4 py-2.5 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 rounded-xl text-cyan-400 hover:from-cyan-600/50 hover:to-blue-600/50 transition-all duration-200 font-medium"
							>
								Add
							</button>
						</div>
					)}
					{newProduct.tags.length >= 7 && (
						<p className="text-yellow-400 text-sm">Maximum 7 tags reached</p>
					)}
				</div>

				{(newProduct.category === "etextbooks" || newProduct.category === "enotes") && (
					<div className="mt-6">
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Upload PDF
						</label>
						<div className="flex items-center justify-center w-full">
							<label
								htmlFor='pdf'
								className='flex flex-col items-center justify-center w-full h-24 border-2 border-gray-600 border-dashed rounded-xl cursor-pointer bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200 group'
							>
								<div className='flex flex-col items-center justify-center pt-5 pb-6'>
									<Upload className='w-8 h-8 mb-3 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200' />
									<p className='text-sm text-gray-400 group-hover:text-gray-300'>
										{newProduct.pdf ? "PDF Selected" : <><span className='font-semibold'>Click to upload PDF</span> or drag and drop</>}
									</p>
								</div>
								<input type='file' id='pdf' className='hidden' accept='.pdf' onChange={handlePdfChange} />
							</label>
						</div>
					</div>
				)}

				{/* Multiple Angle Images Section */}
				<div className="mt-6">
					<label className='block text-sm font-medium text-gray-300 mb-3'>
						<ImageIcon className="inline-block w-4 h-4 mr-1" />
						Additional Product Images <span className="text-gray-500">(Optional - Front, Back, Left, Right)</span>
					</label>
					<p className="text-xs text-gray-400 mb-4">Adding multiple angles increases probability of purchase</p>
					<div className="grid grid-cols-2 gap-4">
						{['front', 'back', 'left', 'right'].map((angle) => (
							<div key={angle}>
								<label className='block text-xs font-medium text-gray-400 mb-2 capitalize'>
									{angle} View
								</label>
								<label
									htmlFor={`image-${angle}`}
									className='flex flex-col items-center justify-center w-full h-28 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700/30 hover:bg-gray-700/50 transition-colors duration-200 group overflow-hidden relative'
								>
									{newProduct.images[angle] ? (
										<img src={newProduct.images[angle]} alt={`${angle} view`} className="w-full h-full object-cover" />
									) : (
										<div className='flex flex-col items-center justify-center'>
											<Upload className='w-5 h-5 mb-1 text-gray-400 group-hover:text-cyan-400 transition-colors duration-200' />
											<p className='text-xs text-gray-400 text-center px-2'>Click to upload</p>
										</div>
									)}
									<input 
										type='file' 
										id={`image-${angle}`} 
										className='hidden' 
										accept='image/*' 
										onChange={(e) => handleAngleImageChange(e, angle)} 
									/>
								</label>
							</div>
						))}
					</div>
				</div>

				<button
					type='submit'
					className='w-full flex justify-center py-3 px-4 border border-transparent rounded-xl 
					shadow-lg text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
					focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] mt-6'
					disabled={loading}
				>
					{loading ? (
						<>
							<Loader className='mr-2 h-5 w-5 animate-spin' aria-hidden='true' />
							Creating Product...
						</>
					) : (
						<>
							<PlusCircle className='mr-2 h-5 w-5' />
							Create Product
						</>
					)}
				</button>
			</form>
		</motion.div>
	);
};
export default CreateProductForm;
