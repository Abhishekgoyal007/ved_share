import { useState, useEffect } from 'react';
import { Upload, FileText, Edit, Trash2, Save, X, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import axios from '../lib/axios';

const KeywordExtractorPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedKeywords, setExtractedKeywords] = useState([]);
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [editingKeyword, setEditingKeyword] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [addingKeyword, setAddingKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  // Fetch saved documents on component mount
  useEffect(() => {
    fetchSavedDocuments();
  }, []);

  const fetchSavedDocuments = async () => {
    try {
      const response = await axios.get('/extractor/documents');
      setSavedDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (error.response?.status === 404) {
        // Route not found - this is expected when first accessing the feature
        setSavedDocuments([]);
      } else {
        toast.error('Failed to fetch saved documents');
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
      fetchSavedDocuments(); // Refresh the documents list
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to use the Keyword Extractor');
      } else {
        toast.error(error.response?.data?.message || 'Failed to extract keywords');
      }
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
      const response = await axios.put(`/extractor/keywords/${keywordId}`, {
        text: editValue
      });

      setExtractedKeywords(extractedKeywords.map(kw => 
        kw._id === keywordId ? { ...kw, text: editValue } : kw
      ));
      
      setEditingKeyword(null);
      setEditValue('');
      toast.success('Keyword updated successfully');
    } catch (error) {
      console.error('Error updating keyword:', error);
      toast.error('Failed to update keyword');
    }
  };

  const handleDeleteKeyword = async (keywordId) => {
    try {
      await axios.delete(`/extractor/keywords/${keywordId}`);
      setExtractedKeywords(extractedKeywords.filter(kw => kw._id !== keywordId));
      toast.success('Keyword deleted successfully');
    } catch (error) {
      console.error('Error deleting keyword:', error);
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
        documentId: extractedKeywords[0]?.documentId // Assuming all keywords belong to the same document
      });

      setExtractedKeywords([...extractedKeywords, response.data.keyword]);
      setNewKeyword('');
      setAddingKeyword(false);
      toast.success('Keyword added successfully');
    } catch (error) {
      console.error('Error adding keyword:', error);
      toast.error('Failed to add keyword');
    }
  };

  const handleLoadDocument = async (documentId) => {
    try {
      const response = await axios.get(`/extractor/documents/${documentId}`);
      setExtractedKeywords(response.data.keywords);
      setSelectedFile(null); // Clear file input
      toast.success('Document loaded successfully');
    } catch (error) {
      console.error('Error loading document:', error);
      toast.error('Failed to load document');
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await axios.delete(`/extractor/documents/${documentId}`);
      setSavedDocuments(savedDocuments.filter(doc => doc._id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-cyan-400">
          Keyword Extractor - Extract Keywords from Documents
        </h1>

        {/* Upload Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">Upload Document</h2>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileSelect}
                className="w-full text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
              />
              {selectedFile && (
                <p className="mt-2 text-gray-400">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
            <button
              onClick={handleUploadAndExtract}
              disabled={!selectedFile || isUploading}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUploading ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              ) : (
                <Upload size={16} />
              )}
              {isUploading ? 'Processing...' : 'Extract Keywords'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Keywords Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Extracted Keywords</h2>
              {extractedKeywords.length > 0 && (
                <button
                  onClick={() => setAddingKeyword(true)}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-1 text-sm"
                >
                  <Plus size={14} />
                  Add
                </button>
              )}
            </div>

            {extractedKeywords.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No keywords extracted yet. Upload a document to get started!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {addingKeyword && (
                  <div className="flex gap-2 p-2 bg-gray-700 rounded">
                    <input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="Enter new keyword"
                      className="flex-1 px-2 py-1 bg-gray-600 text-white rounded text-sm"
                      autoFocus
                    />
                    <button
                      onClick={handleAddKeyword}
                      className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setAddingKeyword(false);
                        setNewKeyword('');
                      }}
                      className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                {extractedKeywords.map((keyword) => (
                  <div key={keyword._id} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    {editingKeyword === keyword._id ? (
                      <div className="flex gap-2 flex-1">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-2 py-1 bg-gray-600 text-white rounded"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEdit(keyword._id)}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingKeyword(null);
                            setEditValue('');
                          }}
                          className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-200 flex-1">{keyword.text}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditKeyword(keyword)}
                            className="p-1 text-blue-400 hover:text-blue-300"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteKeyword(keyword._id)}
                            className="p-1 text-red-400 hover:text-red-300"
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
          </div>

          {/* Saved Documents Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Saved Documents</h2>
            {savedDocuments.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No saved documents yet. Upload and extract keywords from a document to see it here!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {savedDocuments.map((doc) => (
                  <div key={doc._id} className="flex items-center justify-between p-3 bg-gray-700 rounded">
                    <div className="flex-1">
                      <h3 className="text-white font-medium">{doc.filename}</h3>
                      <p className="text-gray-400 text-sm">
                        {doc.keywords?.length || 0} keywords • {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleLoadDocument(doc._id)}
                        className="px-3 py-1 bg-cyan-600 text-white rounded hover:bg-cyan-700 text-sm"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc._id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-3 text-cyan-400">How it works:</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Upload PDF, Word (.doc/.docx), or PowerPoint (.ppt/.pptx) files</li>
            <li>• Our AI extracts key terms and important concepts from your documents</li>
            <li>• Edit, add, or delete keywords to customize them for your study needs</li>
            <li>• All your documents and keywords are saved for future reference</li>
            <li>• Perfect for creating study guides and reviewing important concepts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default KeywordExtractorPage;