import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";
import { useProductStore } from "../stores/useProductStore";
import { ShoppingCart, ArrowLeft, X, FileText } from "lucide-react";
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
    const { addToCart } = useCartStore();
    const { createSwapOffer, fetchMyProducts, products: myProducts } = useProductStore();
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [selectedSwapProduct, setSelectedSwapProduct] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`/products/${id}`); // Assuming this endpoint exists or similar
                setProduct(res.data);
            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to load product details");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Added functions
    const handleSwapClick = async () => {
        await fetchMyProducts();
        setIsSwapModalOpen(true);
    };

    const handleSwapSubmit = async () => {
        if (!selectedSwapProduct) return;
        const success = await createSwapOffer(product._id, selectedSwapProduct);
        if (success) {
            setIsSwapModalOpen(false);
            setSelectedSwapProduct(null);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (!product) {
        return (
            <div className='min-h-screen flex flex-col items-center justify-center space-y-4'>
                <h2 className='text-3xl font-bold text-white'>Product not found</h2>
                <Link to='/' className='text-cyan-400 hover:underline'>
                    Go back home
                </Link>
            </div>
        );
    }

    return (
        <div className='min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden'>
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 opacity-50 z-0" />
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
            </div>

            <div className='max-w-7xl mx-auto relative z-10'>
                <button
                    onClick={() => navigate(-1)}
                    className='inline-flex items-center text-gray-400 hover:text-cyan-400 mb-8 transition-colors cursor-pointer'
                >
                    <ArrowLeft className='w-5 h-5 mr-2' />
                    Back
                </button>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20'>
                    {/* Product Image */}
                    <div className='relative group'>
                        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <div className='relative aspect-square rounded-2xl overflow-hidden bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 shadow-2xl'>
                            <img
                                src={product.image}
                                alt={product.name}
                                className='w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105'
                            />
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className='flex flex-col justify-center space-y-8'>
                        <div>
                            <h1 className='text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight'>
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                {product.price === 0 ? (
                                    <span className='text-3xl font-extrabold text-green-400 uppercase tracking-wider'>Free</span>
                                ) : (
                                    <span className='text-3xl font-bold text-cyan-400'>
                                        ₹{product.price.toFixed(2)}
                                    </span>
                                )}
                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
                                    {product.category}
                                </span>
                                {product.isFeatured && (
                                    <span className="px-3 py-1 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-sm font-medium">
                                        Featured
                                    </span>
                                )}
                                {product.isBookSwap && ( // Added Book Swap badge
                                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
                                        Book Swap
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className='prose prose-invert max-w-none'>
                            <h3 className="text-xl font-semibold text-white mb-3">Description</h3>
                            <p className='text-gray-300 text-lg leading-relaxed'>
                                {product.description}
                            </p>
                        </div>

                        {/* Tags Section */}
                        {product.tags && product.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {product.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 text-cyan-300 text-sm font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {product.pdfUrl && (
                            <div className="mt-8">
                                <h3 className="text-xl font-semibold text-white mb-4">Preview</h3>
                                <button
                                    onClick={() => setIsPreviewOpen(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-all hover:border-cyan-500/50 group"
                                >
                                    <FileText className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                                    Preview PDF (First 3 Pages)
                                </button>
                            </div>
                        )}

                        <div className='pt-6 border-t border-gray-700/50'>
                            {product.isBookSwap ? ( // Conditional rendering for swap button
                                <button
                                    onClick={handleSwapClick}
                                    className='w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1 hover:shadow-purple-500/25'
                                >
                                    <ShoppingCart className='w-6 h-6 mr-3' />
                                    Swap with my Book
                                </button>
                            ) : (
                                <button
                                    onClick={() => addToCart(product)}
                                    className='w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transform transition hover:-translate-y-1 hover:shadow-cyan-500/25'
                                >
                                    <ShoppingCart className='w-6 h-6 mr-3' />
                                    Add to Cart
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            <AnimatePresence>
                {isPreviewOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900 z-10">
                            <h3 className="text-lg font-bold text-white truncate max-w-xl">Preview: {product.name}</h3>
                            <button
                                onClick={() => setIsPreviewOpen(false)}
                                className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 flex justify-center">
                            <SecurePDFViewer url={product.pdfUrl} limitPages={3} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Swap Modal */}
            <AnimatePresence>
                {isSwapModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white">Select a Book to Swap</h3>
                                    <button
                                        onClick={() => setIsSwapModalOpen(false)}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 max-h-[60vh] overflow-y-auto">
                                {myProducts?.filter(p => p.isBookSwap).length > 0 ? (
                                    <div className="space-y-4">
                                        {myProducts.filter(p => p.isBookSwap).map((p) => (
                                            <div
                                                key={p._id}
                                                onClick={() => setSelectedSwapProduct(p._id)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedSwapProduct === p._id
                                                    ? "bg-purple-500/20 border-purple-500"
                                                    : "bg-gray-700/30 border-gray-700 hover:border-gray-600"
                                                    }`}
                                            >
                                                <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-lg" />
                                                <div>
                                                    <h4 className="font-semibold text-white">{p.name}</h4>
                                                    <p className="text-sm text-gray-400">{p.category}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-400">
                                        <p>You don't have any books listed for swap.</p>
                                        <Link to="/secret-dashboard" className="text-purple-400 hover:underline mt-2 block">
                                            List a book for swap
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-gray-700 bg-gray-800/50">
                                <button
                                    onClick={handleSwapSubmit}
                                    disabled={!selectedSwapProduct}
                                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Send Swap Offer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductDetailsPage;
