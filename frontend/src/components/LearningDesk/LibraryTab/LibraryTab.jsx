import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, FileText, X, Loader, Upload, Trash2, Image as ImageIcon, File, AlertTriangle, ArrowRight, BookOpen } from "lucide-react";
import axios from "../../../lib/axios";
import SecurePDFViewer from "../../SecurePDFViewer";
import toast from "react-hot-toast";

const LibraryTab = () => {
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [password, setPassword] = useState("");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchLibraryData();
    }, []);

    const fetchLibraryData = async () => {
        try {
            const productsRes = await axios.get("/payments/purchased-products");
            setPurchasedProducts(productsRes.data);
        } catch (error) {
            console.error("Error fetching library:", error);
            toast.error("Failed to load library");
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = (product) => {
        if (!product.pdfUrl) {
            toast.error("This product does not have an attached document.");
            return;
        }
        setSelectedProduct(product);
        setIsViewerOpen(true);
    };

    const closeViewer = () => {
        setIsViewerOpen(false);
        setSelectedProduct(null);
        setPassword("");
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-10 h-10 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Library Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <BookOpen size={12}/> Digital Vault
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Personal Library</h2>
                    <p className="text-slate-500 font-medium mt-2">Manage your academic assets and purchased digital content.</p>
                </div>
            </div>

            {/* Content Rendering */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key="purchased"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={purchasedProducts.length === 0 ? "flex flex-col items-center justify-center py-20" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"}
                    >
                        {purchasedProducts.length === 0 ? (
                            <>
                                <div className="p-8 bg-slate-100 dark:bg-slate-900 rounded-[3rem] mb-6 text-slate-300">
                                    <FileText size={64} strokeWidth={1} />
                                </div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Library is Empty</p>
                            </>
                        ) : (
                            purchasedProducts.map((p) => (
                                <motion.div
                                    key={p._id}
                                    onClick={() => handleProductClick(p)}
                                    className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 hover:shadow-2xl transition-all cursor-pointer"
                                >
                                    <div className="aspect-[4/5] bg-slate-50 dark:bg-slate-950 rounded-[2rem] mb-6 overflow-hidden relative">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center">
                                            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-xl text-primary-600">
                                                <Lock size={18} />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate">{p.name}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{p.category}</p>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>



            {/* High-Fidelity Viewer Interface */}
            {isViewerOpen && selectedProduct && createPortal(
                <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col">
                    <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                             <div className="p-2 bg-primary-600 rounded-xl text-white">
                                <FileText size={20} />
                             </div>
                             <h3 className="text-lg font-black text-white truncate max-w-md uppercase tracking-tight">
                                {selectedProduct.name}
                             </h3>
                        </div>
                        <button onClick={closeViewer} className="p-3 bg-slate-800 hover:bg-red-500 text-white rounded-2xl transition-all">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
                        <SecurePDFViewer url={selectedProduct.pdfUrl} />
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default LibraryTab;
