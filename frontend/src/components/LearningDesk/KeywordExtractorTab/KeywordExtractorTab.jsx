import { useState, useEffect } from 'react';
import { Upload, FileText, Edit, Trash2, Save, X, Plus, Sparkles, BookOpen, Clock, ArrowRight, Loader, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from '../../../lib/axios';

const KeywordExtractorTab = ({ onCreateQuiz }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [extractedKeywords, setExtractedKeywords] = useState([]);
    const [savedDocuments, setSavedDocuments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [editingKeyword, setEditingKeyword] = useState(null);
    const [editValue, setEditValue] = useState('');
    const [addingKeyword, setAddingKeyword] = useState(false);
    const [newKeyword, setNewKeyword] = useState('');

    useEffect(() => {
        fetchSavedDocuments();
    }, []);

    const fetchSavedDocuments = async () => {
        try {
            const response = await axios.get('/extractor/documents');
            setSavedDocuments(response.data.documents || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setExtractedKeywords([]);
        }
    };

    const handleUploadAndExtract = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const response = await axios.post('/extractor/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setExtractedKeywords(response.data.keywords);
            toast.success('Extraction successful!');
            fetchSavedDocuments();
        } catch (error) {
            toast.error('Failed to extract keywords');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditKeyword = (keyword) => {
        setEditingKeyword(keyword._id);
        setEditValue(keyword.text);
    };

    const handleSaveEdit = async (keywordId) => {
        try {
            await axios.put(`/extractor/keywords/${keywordId}`, { text: editValue });
            setExtractedKeywords(extractedKeywords.map(kw => kw._id === keywordId ? { ...kw, text: editValue } : kw));
            setEditingKeyword(null);
            toast.success('Refined');
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleDeleteKeyword = async (keywordId) => {
        try {
            await axios.delete(`/extractor/keywords/${keywordId}`);
            setExtractedKeywords(extractedKeywords.filter(kw => kw._id !== keywordId));
            toast.success('Removed');
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const handleAddKeyword = async () => {
        if (!newKeyword.trim()) return;
        try {
            const response = await axios.post('/extractor/keywords', {
                text: newKeyword,
                documentId: extractedKeywords[0]?.documentId
            });
            setExtractedKeywords([...extractedKeywords, response.data.keyword]);
            setNewKeyword('');
            setAddingKeyword(false);
            toast.success('Injected');
        } catch (error) {
            toast.error('Addition failed');
        }
    };

    const handleLoadDocument = async (documentId) => {
        try {
            const response = await axios.get(`/extractor/documents/${documentId}`);
            setExtractedKeywords(response.data.keywords);
            setSelectedFile(null);
            toast.success('Sync complete');
        } catch (error) {
            toast.error('Load failed');
        }
    };

    const handleDeleteDocument = async (documentId) => {
        if (!confirm("Are you sure?")) return;
        try {
            await axios.delete(`/extractor/documents/${documentId}`);
            setSavedDocuments(savedDocuments.filter(doc => doc._id !== documentId));
            toast.success('Purged');
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Intel Interface Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                     <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Sparkles size={12}/> AI Analysis Engine
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Keyword Extractor</h2>
                    <p className="text-slate-500 font-medium mt-2">Surface critical concepts and ontological markers from academic files.</p>
                </div>
            </div>

            {/* Neural Input Zone */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/40 dark:shadow-none"
            >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 w-full space-y-2">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Source Document</p>
                         <div className="relative group">
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.ppt,.pptx"
                                onChange={handleFileSelect}
                                className="w-full h-16 opacity-0 absolute inset-0 z-20 cursor-pointer"
                            />
                            <div className="w-full h-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center px-6 gap-4 group-hover:border-primary-500 transition-all">
                                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-400 group-hover:text-primary-600 transition-colors">
                                    <FileText size={20} />
                                </div>
                                <span className="text-slate-600 dark:text-slate-400 font-bold text-sm truncate uppercase tracking-tight">
                                    {selectedFile ? selectedFile.name : "Inject academic file (PDF, DOCX...)"}
                                </span>
                            </div>
                         </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUploadAndExtract}
                        disabled={!selectedFile || isUploading}
                        className="h-16 px-10 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-30"
                    >
                        {isUploading ? <Loader size={20} className="animate-spin" /> : <Sparkles size={20} />}
                        {isUploading ? "Processing..." : "Run Analysis"}
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Extracted Matrix */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Extracted Markers</h3>
                            <span className="px-3 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full text-[10px] font-black">{extractedKeywords.length}</span>
                        </div>
                        {extractedKeywords.length > 0 && onCreateQuiz && (
                            <button
                                onClick={() => onCreateQuiz(extractedKeywords)}
                                className="px-6 py-2 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-primary-500/20"
                            >
                                <Sparkles size={14} /> Intelligence Check
                            </button>
                        )}
                    </div>

                    <div className={extractedKeywords.length === 0 ? "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-20 flex flex-col items-center" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                        {extractedKeywords.length === 0 ? (
                            <>
                                <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[3rem] mb-6 text-slate-200">
                                    <Activity size={64} strokeWidth={1} />
                                </div>
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Awaiting analysis payload</p>
                            </>
                        ) : (
                            extractedKeywords.map((kw, i) => (
                                <motion.div
                                    key={kw._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary-500/50 transition-all shadow-sm"
                                >
                                    {editingKeyword === kw._id ? (
                                        <div className="flex gap-2 w-full">
                                            <input
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 font-bold text-sm focus:outline-none"
                                                autoFocus
                                            />
                                            <button onClick={() => handleSaveEdit(kw._id)} className="p-2 bg-primary-600 text-white rounded-xl"><Save size={14}/></button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight truncate flex-1">{kw.text}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditKeyword(kw)} className="p-2 text-slate-400 hover:text-slate-950 dark:hover:text-white"><Edit size={14}/></button>
                                                <button onClick={() => handleDeleteKeyword(kw._id)} className="p-2 text-slate-400 hover:text-red-500"><Trash2 size={14}/></button>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Archive Panel */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Analysis Archive</h3>
                    </div>
                    <div className="space-y-3">
                        {savedDocuments.map((doc) => (
                            <motion.div
                                key={doc._id}
                                className="group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] hover:shadow-xl transition-all shadow-sm"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="min-w-0">
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight truncate mb-1">{doc.filename}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{doc.keywords?.length || 0} MARKERS • {new Date(doc.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <button onClick={() => handleDeleteDocument(doc._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"><Trash2 size={16}/></button>
                                </div>
                                <button
                                    onClick={() => handleLoadDocument(doc._id)}
                                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all border border-slate-200 dark:border-slate-700"
                                >
                                    Activate Payload
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeywordExtractorTab;
