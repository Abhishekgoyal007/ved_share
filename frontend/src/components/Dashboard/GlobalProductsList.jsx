import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash, Star, Package, IndianRupee, ExternalLink, ShieldCheck, Box, Activity } from "lucide-react";
import { useProductStore } from "../../stores/useProductStore";

const GlobalProductsList = () => {
	const { deleteProduct, toggleFeaturedProduct, adminProducts, fetchAllProducts } = useProductStore();

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

	return (
		<div className='w-full space-y-4'>
            <div className="flex items-center gap-3 mb-2 px-1">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600">
                    <Box size={18} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">All Products</h2>
                    <p className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">All items in store</p>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar -mx-2 sm:-mx-0">
                <table className="w-full text-left border-separate border-spacing-y-1.5 min-w-full">
                    <thead>
                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            <th className="px-2 pb-2 w-[40%] text-left">Book Details</th>
                            <th className="px-2 pb-2 text-left w-[10%] whitespace-nowrap">Value</th>
                            <th className="px-2 pb-2 text-center w-[10%]">Featured</th>
                            <th className="px-2 pb-2 text-center w-[15%]">Status</th>
                            <th className="px-2 pb-2 w-[15%] text-center">Owner</th>
                            <th className="px-2 pb-2 text-right w-[10%] whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent">
                        {adminProducts?.map((product, idx) => (
                            <motion.tr 
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                key={product._id} 
                                className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:border-primary-500/30 ${product.sold ? "opacity-60 grayscale-[0.5]" : ""}`}
                            >
                                {/* Identification */}
                                <td className="px-4 py-2.5 rounded-l-2xl border-y border-l border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-8 h-8 rounded-lg overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800">
                                                <img
                                                    src={product.image}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            {product.isFeatured && (
                                                <div className="absolute -top-1 -right-1 bg-amber-400 p-0.5 rounded shadow-sm">
                                                    <ShieldCheck size={8} className="text-white fill-current" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-black text-slate-900 dark:text-white text-[11px] truncate tracking-tight uppercase leading-none">{product.name}</p>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 block truncate opacity-70">{product.category.replace(/-/g, ' ')}</span>
                                        </div>
                                    </div>
                                </td>

                                {/* Value */}
                                <td className="px-2 py-2.5 border-y border-slate-100 dark:border-slate-800 text-left">
                                    <div className="flex items-center justify-start gap-1">
                                        <IndianRupee size={10} className="text-emerald-500" />
                                        <span className="font-black text-xs text-slate-900 dark:text-white">
                                            {product.price.toLocaleString()}
                                        </span>
                                    </div>
                                </td>

                                {/* Featured Status */}
                                <td className="px-4 py-2.5 border-y border-slate-100 dark:border-slate-800 text-center">
                                    <button
                                        onClick={() => toggleFeaturedProduct(product._id)}
                                        className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border flex items-center gap-1.5 mx-auto ${product.isFeatured 
                                            ? "bg-amber-400 text-white border-amber-400 shadow-sm" 
                                            : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400"}`}
                                    >
                                        <Star size={10} className={product.isFeatured ? "fill-current" : ""} />
                                        {product.isFeatured ? "Yes" : "No"}
                                    </button>
                                </td>

                                {/* Market Status */}
                                <td className="px-4 py-2.5 border-y border-slate-100 dark:border-slate-800 text-center">
                                     <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${
                                        product.sold 
                                            ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-500" 
                                            : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-600"
                                     }`}>
                                        <Activity size={10} className={product.sold ? "" : "animate-pulse"} />
                                        {product.sold ? "SOLD" : "AVAILABLE"}
                                     </div>
                                </td>

                                {/* Owner */}
                                <td className="px-4 py-2.5 border-y border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 rounded bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-[8px] font-black text-white shadow-sm">
                                            {product.userId?.name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase truncate max-w-[70px]">{product.userId?.name || "Anonymous"}</p>
                                    </div>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-2.5 rounded-r-2xl border-y border-r border-slate-100 dark:border-slate-800 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                        <Link to={`/product/${product._id}`} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-all">
                                            <ExternalLink size={14}/>
                                        </Link>
                                        <button onClick={() => deleteProduct(product._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all">
                                            <Trash size={14}/>
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {!adminProducts?.length && (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm w-full">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-3">
                            <Package className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Empty Directory</h3>
                        <p className="text-slate-500 mt-1 font-medium text-[10px]">No academic assets found in global storage.</p>
                    </div>
                )}
            </div>
        </div>
	);
};
export default GlobalProductsList;
