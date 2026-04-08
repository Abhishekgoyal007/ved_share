import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, Loader, Image as ImageIcon, X, Tag, FileText } from "lucide-react";
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
		images: { front: "", back: "", left: "", right: "" },
		pdf: "",
		tags: [],
	});
	const [isFree, setIsFree] = useState(false);
	const [tagInput, setTagInput] = useState("");

	const { createProduct, loading } = useProductStore();

	const handleFreeToggle = (checked) => {
		setIsFree(checked);
		if (checked) {
			setNewProduct({ ...newProduct, price: "0" });
		} else {
			setNewProduct({ ...newProduct, price: "" });
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await createProduct(newProduct);
			setNewProduct({ 
				name: "", description: "", price: "", category: "", image: "", 
				images: { front: "", back: "", left: "", right: "" },
				pdf: "", tags: [] 
			});
			setIsFree(false); setTagInput("");
		} catch (error) {
			console.log("error creating a product:", error);
		}
	};

	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setNewProduct({ ...newProduct, image: reader.result });
			reader.readAsDataURL(file);
		}
	};

	const handlePdfChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => setNewProduct({ ...newProduct, pdf: reader.result });
			reader.readAsDataURL(file);
		}
	};

	const handleAngleImageChange = (e, angle) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setNewProduct(prev => ({
					...prev,
					images: {
						...prev.images,
						[angle]: reader.result
					}
				}));
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<motion.div
			className='max-w-4xl mx-auto'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			<form onSubmit={handleSubmit} className='space-y-8'>
				{/* Section 1: Basic Info */}
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
					<div className="flex items-center gap-3 mb-6">
						<div className="p-2.5 bg-primary-100 dark:bg-primary-900/20 rounded-2xl text-primary-600">
							<FileText size={20} />
						</div>
						<h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Basic Information</h3>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="space-y-4">
							<div>
								<label className='block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3'>Resource Name</label>
								<input
									type='text'
									value={newProduct.name}
									onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
									className='w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none'
									placeholder="e.g., Organic Chemistry Vol. 1"
									required
								/>
							</div>
							<div>
								<label className='block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3'>Category</label>
								<select
									value={newProduct.category}
									onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
									className='w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none cursor-pointer'
									required
								>
									<option value=''>Select Category</option>
									{categories.map((c) => (
										<option key={c} value={c}>{c.replace(/-/g, ' ')}</option>
									))}
								</select>
							</div>
						</div>
						<div>
							<label className='block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3'>Description</label>
							<textarea
								value={newProduct.description}
								onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
								rows='5'
								className='w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none resize-none'
								placeholder="What makes this resource special? Mention condition, edition, etc."
								required
							/>
						</div>
					</div>
				</div>

				{/* Section 2: Pricing & Metadata */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
								<Tag size={20} />
							</div>
							<h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Pricing</h3>
						</div>
						
						<div className="space-y-6">
							<div className="flex flex-wrap gap-4">
								<label className="flex items-center gap-3 cursor-pointer group">
									<input type="checkbox" checked={isFree} onChange={(e) => handleFreeToggle(e.target.checked)} className="hidden" />
									<div className={`w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center ${isFree ? 'bg-primary-600 border-primary-600 shadow-lg shadow-primary-500/20' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
										{isFree && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
									</div>
									<span className="text-sm font-bold text-slate-700 dark:text-slate-300">Mark as Free Listing</span>
								</label>
							</div>

							<div>
								<label className='block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3'>Price (INR)</label>
								<div className="relative">
									<span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
									<input
										type='number'
										value={newProduct.price}
										onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
										className='w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-10 pr-5 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none disabled:opacity-30'
										placeholder="0.00"
										disabled={isFree}
										required
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
						<div className="flex items-center gap-3 mb-6">
							<div className="p-2.5 bg-purple-100 dark:bg-purple-900/20 rounded-2xl text-purple-600">
								<PlusCircle size={20} />
							</div>
							<h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Tags</h3>
						</div>
						
						<div className="space-y-4">
							<div className="flex flex-wrap gap-2">
								{newProduct.tags.map(tag => (
									<span key={tag} className="px-4 py-1.5 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-900/20 rounded-full text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-2">
										#{tag}
										<button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition-colors"><X size={12}/></button>
									</span>
								))}
							</div>
							<input
								type="text"
								value={tagInput}
								onChange={(e) => setTagInput(e.target.value)}
								onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddTag(); }}}
								className='w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none'
								placeholder="Add search tags... (Enter)"
								disabled={newProduct.tags.length >= 7}
							/>
						</div>
					</div>
				</div>

				{/* Section 3: Visuals */}
				<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
					<div className="flex items-center gap-3 mb-8">
						<div className="p-2.5 bg-amber-100 dark:bg-amber-900/20 rounded-2xl text-amber-600">
							<ImageIcon size={20} />
						</div>
						<h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Media & Document</h3>
					</div>
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
						<div>
							<label className='block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4'>Main Cover Image</label>
							<label className="relative block h-40 bg-white dark:bg-slate-950 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] cursor-pointer hover:border-primary-500/50 transition-all overflow-hidden group mb-6">
								{newProduct.image ? (
									<img src={newProduct.image} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
								) : (
									<div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
										<Upload size={32} className="mb-2" />
										<span className="text-[10px] font-black uppercase tracking-widest">Select Cover Photo</span>
									</div>
								)}
								<input type='file' className='hidden' accept='image/*' onChange={handleImageChange} />
							</label>

							<label className='block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3'>Condition Check (Angles)</label>
							<div className="grid grid-cols-3 gap-3">
								{['back', 'left', 'right'].map((angle) => (
									<label key={angle} className="relative block aspect-square bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-primary-500/50 transition-all overflow-hidden group">
										{newProduct.images?.[angle] ? (
											<img src={newProduct.images[angle]} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
										) : (
											<div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-primary-500 transition-colors">
												<Upload size={14} className="mb-1" />
												<span className="text-[8px] font-black uppercase tracking-widest">{angle}</span>
											</div>
										)}
										<input type='file' className='hidden' accept='image/*' onChange={(e) => handleAngleImageChange(e, angle)} />
									</label>
								))}
							</div>
						</div>
						<div className="flex flex-col justify-center gap-6">
							<div className="bg-slate-50 dark:bg-slate-950 p-6 border border-slate-100 dark:border-slate-800 rounded-3xl">
								<p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
									💡 Premium Tip: High-fidelity scans and clear cover photos increase visibility by up to 60%.
								</p>
							</div>
							{(newProduct.category === "etextbooks" || newProduct.category === "enotes") && (
								<label className="flex items-center justify-center gap-3 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-950 py-5 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer hover:brightness-110 transition-all shadow-xl shadow-slate-900/10 active:scale-95">
									<Upload size={20} />
									{newProduct.pdf ? "Document Ready" : "Upload High-Quality PDF"}
									<input type='file' className='hidden' accept='.pdf' onChange={handlePdfChange} />
								</label>
							)}
						</div>
					</div>
				</div>

				<button
					type='submit'
					disabled={loading}
					className='w-full py-6 bg-primary-600 hover:bg-primary-500 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary-500/30 transition-all flex items-center justify-center gap-4 disabled:opacity-50 active:scale-[0.98]'
				>
					{loading ? <Loader className="animate-spin" /> : <PlusCircle size={26} />}
					Broadcast Listing
				</button>
			</form>
		</motion.div>
	);
};

export default CreateProductForm;
