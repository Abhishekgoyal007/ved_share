import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, FileText, X, Loader, Upload, Trash2, Image as ImageIcon, File, AlertTriangle } from "lucide-react";
import axios from "../../../lib/axios";
import SecurePDFViewer from "../../SecurePDFViewer";
import toast from "react-hot-toast";

const LibraryTab = () => {
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [userDocuments, setUserDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [password, setPassword] = useState("");
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [activeTab, setActiveTab] = useState("purchased");
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchLibraryData();
    }, []);

    const fetchLibraryData = async () => {
        try {
            const [productsRes, documentsRes] = await Promise.all([
                axios.get("/payments/purchased-products"),
                axios.get("/documents")
            ]);
            setPurchasedProducts(productsRes.data);
            setUserDocuments(documentsRes.data);
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
        setIsPasswordModalOpen(true);
        setPassword("");
    };

    const handleDocumentClick = (document) => {
        if (document.fileType === "pdf") {
            setSelectedDocument(document);
            setIsPasswordModalOpen(true);
            setPassword("");
        } else {
            window.open(document.fileUrl, '_blank');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setVerifying(true);
        try {
            await axios.post("/auth/verify-password", { password });
            setIsPasswordModalOpen(false);
            setIsViewerOpen(true);
            toast.success("Access granted");
        } catch (error) {
            console.error("Password verification failed:", error);
            const errorMessage = error.response?.data?.message || "Invalid password";
            toast.error(typeof errorMessage === "string" ? errorMessage : "Verification failed");
        } finally {
            setVerifying(false);
        }
    };

    const closeViewer = () => {
        setIsViewerOpen(false);
        setSelectedProduct(null);
        setSelectedDocument(null);
        setPassword("");
    };

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Only PDF, JPEG, and PNG are allowed.");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error("File size too large. Maximum 10MB allowed.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name);

        try {
            const res = await axios.post("/documents/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setUserDocuments([res.data, ...userDocuments]);
            toast.success("Document uploaded successfully!");
            setActiveTab("uploaded");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error(error.response?.data?.message || "Failed to upload document");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleDeleteDocument = async (docId) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            await axios.delete(`/documents/${docId}`);
            setUserDocuments(userDocuments.filter(doc => doc._id !== docId));
            toast.success("Document deleted successfully");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to delete document");
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Library</h2>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {uploading ? (
                        <>
                            <Loader className="w-4 h-4 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload size={18} />
                            Upload Document
                        </>
                    )}
                </motion.button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-700">
                <button
                    onClick={() => setActiveTab("purchased")}
                    className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === "purchased"
                        ? "text-cyan-400"
                        : "text-gray-400 hover:text-gray-300"
                        }`}
                >
                    Purchased ({purchasedProducts.length})
                    {activeTab === "purchased" && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                        />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("uploaded")}
                    className={`pb-3 px-4 font-medium transition-colors relative ${activeTab === "uploaded"
                        ? "text-cyan-400"
                        : "text-gray-400 hover:text-gray-300"
                        }`}
                >
                    My Uploads ({userDocuments.length})
                    {activeTab === "uploaded" && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
                        />
                    )}
                </button>
            </div>

            {/* Purchased Products Tab */}
            {activeTab === "purchased" && (
                <AnimatePresence mode="wait">
                    {purchasedProducts.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-gray-400 py-12"
                        >
                            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No purchased documents found.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {purchasedProducts.map((product) => (
                                <motion.div
                                    key={product._id}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 cursor-pointer hover:border-cyan-500/50 transition-colors"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <div className="aspect-[4/3] bg-gray-900 rounded-lg mb-4 overflow-hidden relative group">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {product.pdfUrl ? (
                                                <Lock className="w-8 h-8 text-cyan-400" />
                                            ) : (
                                                <AlertTriangle className="w-8 h-8 text-yellow-400" />
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                                    <p className="text-sm text-gray-400 mt-1">{product.category}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Uploaded Documents Tab */}
            {activeTab === "uploaded" && (
                <AnimatePresence mode="wait">
                    {userDocuments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center text-gray-400 py-12"
                        >
                            <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>No uploaded documents yet.</p>
                            <p className="text-sm mt-2">Click "Upload Document" to add your first document.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {userDocuments.map((doc) => (
                                <motion.div
                                    key={doc._id}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 relative group"
                                >
                                    <div
                                        className="aspect-[4/3] bg-gray-900 rounded-lg mb-4 overflow-hidden relative cursor-pointer"
                                        onClick={() => handleDocumentClick(doc)}
                                    >
                                        {doc.fileType === "image" ? (
                                            <img
                                                src={doc.fileUrl}
                                                alt={doc.name}
                                                className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <File className="w-16 h-16 text-cyan-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {doc.fileType === "pdf" ? (
                                                <Lock className="w-8 h-8 text-cyan-400" />
                                            ) : (
                                                <ImageIcon className="w-8 h-8 text-cyan-400" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-semibold text-white truncate">{doc.name}</h3>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {doc.fileType.toUpperCase()} • {formatFileSize(doc.size)}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteDocument(doc._id);
                                            }}
                                            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group/delete"
                                        >
                                            <Trash2 size={16} className="text-gray-400 group-hover/delete:text-red-400" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Password Modal */}
            <AnimatePresence>
                {isPasswordModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => {
                            setIsPasswordModalOpen(false);
                            setSelectedProduct(null);
                            setSelectedDocument(null);
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Enter Password</h3>
                                <button
                                    onClick={() => {
                                        setIsPasswordModalOpen(false);
                                        setSelectedProduct(null);
                                        setSelectedDocument(null);
                                    }}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <p className="text-gray-400 text-sm mb-4">
                                Enter your account password to access this document
                            </p>
                            <form onSubmit={handlePasswordSubmit}>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 mb-4"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={verifying || !password}
                                    className="w-full py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {verifying ? (
                                        <>
                                            <Loader className="w-4 h-4 animate-spin" />
                                            Verifying...
                                        </>
                                    ) : (
                                        "Unlock Document"
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* PDF Viewer */}
            {isViewerOpen && (selectedProduct || selectedDocument) && (
                <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-900">
                        <h3 className="text-lg font-bold text-white truncate max-w-xl">
                            {selectedProduct?.name || selectedDocument?.name}
                        </h3>
                        <button
                            onClick={closeViewer}
                            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <SecurePDFViewer url={selectedProduct?.pdfUrl || selectedDocument?.fileUrl} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryTab;
