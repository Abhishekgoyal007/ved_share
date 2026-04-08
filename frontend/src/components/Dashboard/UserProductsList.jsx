import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trash, ExternalLink, BookMarked, IndianRupee, Layers, ShieldCheck, Box, Activity } from "lucide-react";
import { useProductStore } from "../../stores/useProductStore";

const UserProductsList = () => {
  const { deleteProduct, userProducts, fetchMyProducts, toggleProductSoldStatus } = useProductStore();

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  return (
    <div className='w-full space-y-4'>
        <div className="flex items-center gap-3 mb-2 px-1">
            <div className="p-1.5 bg-primary-100 dark:bg-primary-900/20 rounded-lg text-primary-600">
                <Box size={18} />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">My Books</h2>
                <p className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">Manage your items</p>
            </div>
        </div>

      <div className="overflow-x-auto custom-scrollbar -mx-2 sm:-mx-0">
        <table className="w-full text-left border-separate border-spacing-y-1.5 min-w-full">
          <thead>
            <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <th className="px-4 pb-2 w-[40%]">Book Details</th>
              <th className="px-4 pb-2 text-center w-[15%]">Value</th>
              <th className="px-4 pb-2 text-center w-[20%]">Category</th>
              <th className="px-4 pb-2 text-center w-[15%]">Status</th>
              <th className="px-4 pb-2 text-right w-[10%]">Controls</th>
            </tr>
          </thead>
          <tbody className="bg-transparent">
            {userProducts?.map((product, idx) => (
              <motion.tr 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                key={product._id} 
                className={`group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all hover:border-primary-500/30 ${product.sold ? "opacity-60 grayscale-[0.5]" : ""}`}
              >
                {/* ID Column */}
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
                      <h4 className="font-black text-slate-900 dark:text-white text-[11px] truncate tracking-tight uppercase leading-none">{product.name}</h4>
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-0.5 block truncate opacity-70">ID: {product.serialNumber || product._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </td>
                
                {/* Valuation Column */}
                <td className="px-4 py-2.5 border-y border-slate-100 dark:border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <IndianRupee size={10} className="text-emerald-500" />
                    <span className={`font-black text-xs tracking-tight ${product.price === 0 ? "text-emerald-600" : "text-slate-900 dark:text-white"}`}>
                        {product.price === 0 ? "FREE" : product.price.toLocaleString()}
                    </span>
                  </div>
                </td>

                {/* Classification Column */}
                <td className="px-4 py-2.5 border-y border-slate-100 dark:border-slate-800 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Layers size={9} className="text-primary-500" />
                    <span className="text-[8px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-widest">
                      {product.category.replace(/-/g, ' ')}
                    </span>
                  </div>
                </td>

                {/* Status Column */}
                <td className="px-4 py-2.5 border-y border-slate-100 dark:border-slate-800 text-center">
                   <button
                    onClick={() => toggleProductSoldStatus(product._id)}
                    className={`text-[8px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all border flex items-center gap-1.5 mx-auto ${
                        product.sold 
                        ? "bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20 text-red-500" 
                        : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20 text-emerald-600 shadow-sm"
                    }`}
                  >
                    <Activity size={9} className={product.sold ? "hidden" : "animate-pulse"} />
                    {product.sold ? "SOLD" : "AVAILABLE"}
                  </button>
                </td>

                {/* Controls Column */}
                <td className="px-4 py-2.5 rounded-r-2xl border-y border-r border-slate-100 dark:border-slate-800 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link 
                        to={`/product/${product._id}`} 
                        className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 rounded-lg transition-all"
                    >
                        <ExternalLink size={14}/>
                    </Link>
                    <button 
                        onClick={() => deleteProduct(product._id)} 
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                    >
                        <Trash size={14}/>
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {!userProducts?.length && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-3">
              <BookMarked size={32} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight text-center">Empty Inventory</h3>
            <p className="text-slate-500 mt-1 font-medium text-[10px] text-center">List your academic books or notes here.</p>
            <Link to="/dashboard?tab=create" className="mt-6 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-primary-500/10 hover:scale-105 transition-all">
                List Asset
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProductsList;
