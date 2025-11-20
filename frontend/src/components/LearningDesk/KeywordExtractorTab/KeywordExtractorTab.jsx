import { useState, useEffect } from 'react';
import { Upload, FileText, Edit, Trash2, Save, X, Plus, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from '../../../lib/axios';

const KeywordExtractorTab = () => {
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
            if (error.response?.status !== 404) {
                console.error('Error fetching documents:', error);
            }
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'application/msword',
                'application/vnd.ms-powerpoint'
            ];

            if (validTypes.includes(file.type)) {
                setSelectedFile(file);
                setExtractedKeywords([]);
            } else {
                toast.error('Please select a valid PDF, Word, or PowerPoint file');
                event.target.value = '';
            }
        }
    };

    const handleUploadAndExtract = async () => {
        if (!selectedFile) {
            toast.error('Please select a file first');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('document', selectedFile);

        try {
            const response = await axios.post('/extractor/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setExtractedKeywords(response.data.keywords);
            toast.success('Keywords extracted successfully!');
            fetchSavedDocuments();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to extract keywords');
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
            await axios.put(`/extractor/keywords/${keywordId}`, {
                text: editValue
            });

            setExtractedKeywords(extractedKeywords.map(kw =>
                kw._id === keywordId ? { ...kw, text: editValue } : kw
            ));

            setEditingKeyword(null);
            setEditValue('');
            toast.success('Keyword updated');
        } catch (error) {
            toast.error('Failed to update keyword');
        }
    };

    const handleDeleteKeyword = async (keywordId) => {
        try {
            await axios.delete(`/extractor/keywords/${keywordId}`);
            setExtractedKeywords(extractedKeywords.filter(kw => kw._id !== keywordId));
            toast.success('Keyword deleted');
        } catch (error) {
            toast.error('Failed to delete keyword');
        }
    };

    const handleAddKeyword = async () => {
        if (!newKeyword.trim()) {
            toast.error('Please enter a keyword');
            return;
        }

        try {
            const response = await axios.post('/extractor/keywords', {
                text: newKeyword,
                documentId: extractedKeywords[0]?.documentId
            });

            setExtractedKeywords([...extractedKeywords, response.data.keyword]);
            setNewKeyword('');
            setAddingKeyword(false);
            toast.success('Keyword added');
        } catch (error) {
            toast.error('Failed to add keyword');
        }
    };

    const handleLoadDocument = async (documentId) => {
        try {
            const response = await axios.get(`/extractor/documents/${documentId}`);
            setExtractedKeywords(response.data.keywords);
            setSelectedFile(null);
            toast.success('Document loaded');
        } catch (error) {
            toast.error('Failed to load document');
        }
    };

    const handleDeleteDocument = async (documentId) => {
        try {
            await axios.delete(`/extractor/documents/${documentId}`);
            setSavedDocuments(savedDocuments.filter(doc => doc._id !== documentId));
            toast.success('Document deleted');
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    Keyword Extractor
                </h2>
            </div>

            {/* Upload Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6"
            >
                <h3 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                    <Upload size={20} />
                    Upload Document
                </h3>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 w-full">
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                            onChange={handleFileSelect}
                            className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                        />
                        {selectedFile && (
                            <p className="mt-2 text-gray-400 text-sm">
                                Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleUploadAndExtract}
                        disabled={!selectedFile || isUploading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg"
                    >
                        {isUploading ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        ) : (
                            <Sparkles size={18} />
                        )}
                        {isUploading ? 'Extracting...' : 'Extract Keywords'}
                    </motion.button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Keywords Section */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">Extracted Keywords</h3>
                        {extractedKeywords.length > 0 && (
                            <button
                                onClick={() => setAddingKeyword(true)}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1 text-sm font-medium"
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        )}
                    </div>

                    {extractedKeywords.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No keywords extracted yet.</p>
                            <p className="text-sm mt-2">Upload a document to get started!</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {addingKeyword && (
                                <div className="flex gap-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                                    <input
                                        type="text"
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        placeholder="Enter new keyword"
                                        className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleAddKeyword}
                                        className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                    >
                                        <Save size={14} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAddingKeyword(false);
                                            setNewKeyword('');
                                        }}
                                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            {extractedKeywords.map((keyword) => (
                                <div key={keyword._id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors">
                                    {editingKeyword === keyword._id ? (
                                        <div className="flex gap-2 flex-1">
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => handleSaveEdit(keyword._id)}
                                                className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                                            >
                                                <Save size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingKeyword(null);
                                                    setEditValue('');
                                                }}
                                                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-gray-200 flex-1 font-medium">{keyword.text}</span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditKeyword(keyword)}
                                                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteKeyword(keyword._id)}
                                                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Saved Documents Section */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                >
                    <h3 className="text-xl font-semibold mb-4 text-white">Saved Documents</h3>
                    {savedDocuments.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No saved documents yet.</p>
                            <p className="text-sm mt-2">Upload a document to see it here!</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {savedDocuments.map((doc) => (
                                <div key={doc._id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:border-purple-500/50 transition-colors">
                                    <div className="flex-1">
                                        <h4 className="text-white font-medium">{doc.filename}</h4>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {doc.keywords?.length || 0} keywords • {new Date(doc.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleLoadDocument(doc._id)}
                                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                                        >
                                            Load
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDocument(doc._id)}
                                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default KeywordExtractorTab;
