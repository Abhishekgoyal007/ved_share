import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useUserStore } from "../stores/useUserStore";
import { ShoppingCart, ArrowLeft, X, FileText, Share2, ShieldCheck, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner";
import SecurePDFViewer from "../components/SecurePDFViewer";

const ProductDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [activeImage, setActiveImage] = useState("");
    const { addToCart } = useCartStore();
    const { user } = useUserStore();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/products/${id}`);
                setProduct(res.data);
                setActiveImage(res.data.image);
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Resource not found");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!user) {
            toast.error("Please login to add to collection");
            navigate("/login");
            return;
        }
        addToCart(product);
    };

    if (loading) return <LoadingSpinner />;

    if (!product) {
        return (
            <div className='flex flex-col items-center justify-center py-40 gap-6'>
                <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                    <X size={48} className="text-slate-300" />
                </div>
                <h2 className='text-3xl font-black text-slate-900 dark:text-white'>Resource not found</h2>
                <Link to='/' className='bg-primary-600 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-primary-500/20'>
                    Return to Library
                </Link>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <button
                onClick={() => navigate(-1)}
                className='inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold text-xs uppercase tracking-widest mb-12 transition-colors'
            >
                <ArrowLeft size={16} />
                Return
            </button>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start pb-20'>
            {/* Visual Assets - Enhanced Image Container */}
            <div className="lg:col-span-6 sticky top-28">
                <div className="relative group">
                    <div className="absolute -inset-1 px-8 py-8 bg-gradient-to-r from-primary-500/20 to-indigo-500/20 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='relative aspect-[4/5] rounded-[3.5rem] overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none'
                    >
                        <motion.img
                            key={activeImage || product.image}
                            src={activeImage || product.image}
                            alt={product.name}
                            className='w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110'
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute top-8 right-8 flex flex-col gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                             <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-2xl shadow-xl text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer border border-white/20">
                                <Share2 size={22} />
                             </div>
                        </div>
                    </motion.div>
                </div>
                
                {product.images && Object.values(product.images).some(url => url) && (
                    <div className="mt-6 flex gap-4 overflow-x-auto custom-scrollbar pb-2 px-2">
                        <button 
                            onClick={() => setActiveImage(product.image)}
                            className={`relative flex-shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === product.image ? 'border-primary-500 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                            <img src={product.image} className="w-full h-full object-cover" alt="Main cover" />
                        </button>
                        {['back', 'left', 'right'].map(angle => {
                            const url = product.images[angle];
                            if (!url) return null;
                            return (
                                <button 
                                    key={angle}
                                    onClick={() => setActiveImage(url)}
                                    className={`relative flex-shrink-0 w-20 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === url ? 'border-primary-500 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={url} className="w-full h-full object-cover" alt={`${angle} view`} />
                                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/60 backdrop-blur-sm text-[8px] font-black text-white uppercase text-center py-1">
                                        {angle}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 px-2">
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 flex items-center gap-5 shadow-sm">
                        <div className="p-3.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl text-emerald-600">
                            <ShieldCheck size={26} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Community Verified</p>
                            <p className="text-base font-bold text-slate-900 dark:text-white">Authentic Material</p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 flex items-center gap-5 shadow-sm">
                        <div className="p-3.5 bg-blue-100 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                            <BadgeCheck size={26} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Indexing Quality</p>
                            <p className="text-base font-bold text-slate-900 dark:text-white">HD Digital Scan</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details & Actions */}
            <div className='lg:col-span-6 py-4'>
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-12"
                >
                    <div className="space-y-8">
                        <div className="flex flex-wrap gap-2">
                            <div className="px-5 py-2 bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-primary-100 dark:border-primary-800 shadow-sm">
                                {product.category.replace(/-/g, ' ')}
                            </div>
                        </div>
                        
                        <h1 className='text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05]'>
                            {product.name}
                        </h1>

                        <div className='flex items-center gap-6'>
                            {product.price === 0 ? (
                                <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900 rounded-2xl">
                                    <span className='text-5xl font-black text-emerald-500 tracking-tighter'>FREE</span>
                                </div>
                            ) : (
                                <div className="flex items-baseline gap-4">
                                    <span className='text-6xl font-black text-slate-900 dark:text-white tracking-tighter'>₹{product.price.toLocaleString()}</span>
                                    <span className="text-slate-300 dark:text-slate-600 font-bold line-through text-2xl tracking-tight">₹{(product.price * 1.5).toFixed(0)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</h3>
                        <p className='text-slate-600 dark:text-slate-400 text-lg leading-relaxed'>
                            {product.description}
                        </p>
                    </div>

                    {product.tags && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag) => (
                                <span key={tag} className="text-xs font-bold text-slate-400 dark:text-slate-500">#{tag}</span>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            onClick={handleAddToCart}
                            className='flex-1 py-5 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-3xl shadow-2xl shadow-primary-500/20 transition-all flex items-center justify-center gap-3 active:scale-95'
                        >
                            <ShoppingCart size={24} />
                            Add to Collection
                        </button>
                        
                        {product.pdfUrl && (
                            <button
                                onClick={() => setIsPreviewOpen(true)}
                                className="px-8 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-slate-900 dark:text-white font-bold hover:bg-slate-50 transition-all shadow-sm"
                            >
                                <FileText size={24} />
                            </button>
                        )}
                    </div>
                    
                    <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Secure payment & verified delivery guaranteed.
                    </p>
                </motion.div>
            </div>
        </div>

        <AnimatePresence>
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPreviewOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[3rem] overflow-hidden shadow-2xl">
                         <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                             <h3 className="text-xl font-bold font-sans">Document Preview</h3>
                             <button onClick={() => setIsPreviewOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
                         </div>
                         <div className="flex-1 h-full overflow-hidden">
                            <SecurePDFViewer url={product.pdfUrl} limitPages={3} />
                         </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </div>
    );
};

export default ProductDetailsPage;
