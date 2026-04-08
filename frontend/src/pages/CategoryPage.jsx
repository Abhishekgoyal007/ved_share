import { useEffect, useState, useMemo } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "../components/ProductCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, Filter, SlidersHorizontal, BookMarked, Grid2X2, SortDesc, X, Check } from "lucide-react";

const CategoryPage = () => {
  const { fetchProductsByCategory, products, loading } = useProductStore();
  const { category } = useParams();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState(100000);
  const [activeQuickFilter, setActiveQuickFilter] = useState("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    fetchProductsByCategory(category);
  }, [fetchProductsByCategory, category]);

  const displayCategory = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const filteredProducts = useMemo(() => {
    let result = products?.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
      (p.price === 0 || p.price <= priceRange)
    );

    if (activeQuickFilter === "Free") {
        result = result?.filter(p => p.price === 0);
    } else if (activeQuickFilter === "Lowest Price") {
        result = [...(result || [])].sort((a, b) => a.price - b.price);
    } else if (activeQuickFilter === "Newest") {
        result = [...(result || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [products, searchTerm, priceRange, activeQuickFilter]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <style>
        {`
          input::-webkit-outer-spin-button,
          input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-16 px-2">
            <div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                    {displayCategory} <span className="text-primary-600">Collection</span>
                </h1>
                <p className="text-slate-500 font-medium text-sm">Discover high-quality academic books listed by the community.</p>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="relative flex-1 lg:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search books, authors, courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl py-4 pl-12 pr-4 text-sm font-medium focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 outline-none transition-all dark:text-white shadow-sm"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`p-4 border rounded-3xl transition-all shadow-sm flex items-center gap-2 ${isSidebarOpen ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                >
                    <SlidersHorizontal size={20} />
                    <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Filters</span>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Sidebar Filters */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="lg:col-span-3 space-y-10"
                    >
                        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">
                                Refine Your Search
                            </h3>
                            
                            <div className="space-y-10">
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <label className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Maximum Price</label>
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 focus-within:border-primary-500 transition-colors">
                                            <span className="text-xs font-bold text-slate-400">₹</span>
                                            <input 
                                                type="number" 
                                                min="0"
                                                max="50000"
                                                value={priceRange === 0 ? "" : priceRange}
                                                placeholder="0"
                                                onChange={(e) => {
                                                    const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                                    setPriceRange(Math.max(0, val));
                                                }}
                                                className="bg-transparent text-sm font-black text-primary-600 outline-none w-20 text-right appearance-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="relative pt-1">
                                        <input 
                                            type="range" 
                                            min="0" 
                                            max="100000" 
                                            step="500"
                                            value={priceRange}
                                            onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                            className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary-600"
                                            style={{
                                                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(priceRange / 100000) * 100}%, ${document.documentElement.classList.contains('dark') ? '#1e293b' : '#e2e8f0'} ${(priceRange / 100000) * 100}%, ${document.documentElement.classList.contains('dark') ? '#1e293b' : '#e2e8f0'} 100%)`
                                            }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        <span>Min ₹0</span>
                                        <span>Max ₹100,000+</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest mb-6">Quick Filters</label>
                                    <div className="flex flex-col gap-2">
                                        {["All", "Free", "Trending", "Newest", "Lowest Price"].map((tag) => (
                                            <button 
                                                key={tag} 
                                                onClick={() => setActiveQuickFilter(tag)}
                                                className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeQuickFilter === tag ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 border border-primary-200 dark:border-primary-800' : 'bg-slate-50 dark:bg-slate-950/50 text-slate-500 border border-transparent hover:border-slate-200 dark:hover:border-slate-800'}`}
                                            >
                                                {tag}
                                                {activeQuickFilter === tag && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Product Grid Area */}
            <main className={`${isSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12'} transition-all duration-500`}>
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-200 dark:border-slate-800/50">
                    <div>
                        <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-widest mr-4">
                            Catalog
                        </span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            {filteredProducts?.length} Resources Available
                        </span>
                    </div>
                </div>

                {filteredProducts?.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-40 text-center bg-white dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-800 rounded-[3rem]"
                    >
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-8">
                            <Search size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No Results Found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto font-medium">Try broadening your parameters or exploring different categories.</p>
                        <button 
                            onClick={() => {setSearchTerm(""); setPriceRange(10000); setActiveQuickFilter("All");}}
                            className="mt-8 px-6 py-3 bg-primary-100 dark:bg-primary-900/10 text-primary-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 hover:text-white transition-all shadow-sm"
                        >
                            Reset All Filters
                        </button>
                    </motion.div>
                ) : (
                    <motion.div 
                        layout
                        className={`grid grid-cols-1 sm:grid-cols-2 ${isSidebarOpen ? 'xl:grid-cols-3' : 'xl:grid-cols-4'} gap-10`}
                    >
                        {filteredProducts?.map((product, index) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
