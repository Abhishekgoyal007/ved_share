import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Save, Share2, Loader, FileText, Sparkles, Send, CheckCircle, XCircle, AlertCircle, Trash2, Mic, MicOff, Volume2, VolumeX, UploadCloud, Briefcase, Zap } from "lucide-react";
import axios from "../../../lib/axios";
import toast from "react-hot-toast";

const InterviewPrepTab = ({ initialData, onDataConsumed }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [view, setView] = useState("list"); // list, create, preview, detail
    const [formData, setFormData] = useState({ title: "", description: "", context: "" });
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [answering, setAnswering] = useState({});
    const [userAnswers, setUserAnswers] = useState({});

    const [isListening, setIsListening] = useState(false);
    const [listeningQuestionId, setListeningQuestionId] = useState(null);
    const recognitionRef = useRef(null);

    useEffect(() => {
        fetchQuizzes();
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const startListening = (questionId) => {
        if (!('webkitSpeechRecognition' in window)) {
            toast.error("Speech recognition is not supported in this browser.");
            return;
        }

        if (isListening) {
            stopListening();
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
            setListeningQuestionId(questionId);
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setUserAnswers(prev => ({
                    ...prev,
                    [questionId]: (prev[questionId] || '') + ' ' + finalTranscript
                }));
            }
        };

        recognition.onerror = () => stopListening();
        recognition.onend = () => {
            if (isListening) {
                setIsListening(false);
                setListeningQuestionId(null);
            }
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            setListeningQuestionId(null);
        }
    };

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                description: initialData.description,
                title: "Quiz from Keywords"
            }));
            setView("create");
            if (onDataConsumed) onDataConsumed();
        }
    }, [initialData, onDataConsumed]);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/interview");
            setQuizzes(res.data);
        } catch (error) {
            toast.error("Failed to fetch quizzes");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) {
            toast.error("Please fill in title and description");
            return;
        }

        try {
            setGenerating(true);
            const res = await axios.post("/interview/generate", formData);
            setGeneratedQuestions(res.data.questions);
            setView("preview");
        } catch (error) {
            toast.error("Failed to generate questions. Try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = { ...formData, questions: generatedQuestions };
            const res = await axios.post("/interview", payload);
            setQuizzes([res.data, ...quizzes]);
            toast.success("Quiz saved successfully!");
            setView("list");
            setFormData({ title: "", description: "", context: "" });
            setGeneratedQuestions([]);
        } catch (error) {
            toast.error("Failed to save quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = (quizId) => {
        const link = `${window.location.origin}/interview/${quizId}`;
        navigator.clipboard.writeText(link);
        toast.success("Link copied to clipboard!");
    };

    const handleAddMoreQuestions = async () => {
        if (!selectedQuiz) return;
        try {
            setGenerating(true);
            const res = await axios.post(`/interview/${selectedQuiz._id}/add-questions`);
            setSelectedQuiz(res.data);
            setQuizzes(quizzes.map(q => q._id === res.data._id ? res.data : q));
            toast.success("5 new questions added!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add questions");
        } finally {
            setGenerating(false);
        }
    };

    const handleSubmitAnswer = async (questionId) => {
        const answer = userAnswers[questionId];
        if (!answer?.trim()) return;

        try {
            setAnswering(prev => ({ ...prev, [questionId]: true }));
            const res = await axios.post(`/interview/${selectedQuiz._id}/evaluate`, {
                questionId,
                userAnswer: answer
            });

            const updatedQuestions = selectedQuiz.questions.map(q => {
                if (q._id === questionId) {
                    return { ...q, feedback: res.data.feedback, userAnswer: answer };
                }
                return q;
            });

            const updatedQuiz = { ...selectedQuiz, questions: updatedQuestions };
            setSelectedQuiz(updatedQuiz);
            setQuizzes(quizzes.map(q => q._id === updatedQuiz._id ? updatedQuiz : q));

            toast.success("Answer evaluated!");
        } catch (error) {
            toast.error("Failed to evaluate answer");
        } finally {
            setAnswering(prev => ({ ...prev, [questionId]: false }));
        }
    };

    const handleDelete = async (quizId) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`/interview/${quizId}`);
            setQuizzes(quizzes.filter(q => q._id !== quizId));
            toast.success("Quiz deleted!");
            if (selectedQuiz?._id === quizId) {
                setView("list");
                setSelectedQuiz(null);
            }
        } catch (error) {
            toast.error("Failed to delete quiz");
        }
    };

    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speakingId, setSpeakingId] = useState(null);
    const fileInputRef = useRef(null);
    const [parsingPdf, setParsingPdf] = useState(false);

    const speakText = (text, id) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            if (isSpeaking && speakingId === id) {
                setIsSpeaking(false);
                setSpeakingId(null);
                return;
            }
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onstart = () => { setIsSpeaking(true); setSpeakingId(id); };
            utterance.onend = () => { setIsSpeaking(false); setSpeakingId(null); };
            window.speechSynthesis.speak(utterance);
        }
    };

    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || file.type !== 'application/pdf') return;

        try {
            setParsingPdf(true);
            const pdfjsLib = await import('pdfjs-dist/build/pdf');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                fullText += textContent.items.map(item => item.str).join(' ') + "\n";
            }
            setFormData(prev => ({ ...prev, context: (prev.context + "\n" + fullText).trim() }));
            toast.success("Resume parsed!");
        } catch (error) {
            toast.error("Failed to read PDF.");
        } finally {
            setParsingPdf(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10">
            {/* Header Module */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        <Briefcase size={12}/> Career Accelerator
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">AI Interview Coach</h2>
                    <p className="text-slate-500 font-medium mt-2">Generate tailored interview simulations based on your documents.</p>
                </div>
                {view === "list" && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setView("create")}
                        className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-emerald-500/20 transition-all"
                    >
                        <Plus size={18} /> New Coaching Session
                    </motion.button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* Dashboard List */}
                {view === "list" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={quizzes.length === 0 ? "flex flex-col items-center justify-center py-20" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"}
                    >
                        {loading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <Loader className="animate-spin text-emerald-600" size={40} />
                            </div>
                        ) : quizzes.length === 0 ? (
                            <>
                                <div className="p-8 bg-slate-100 dark:bg-slate-900 rounded-[3rem] mb-6 text-slate-300">
                                    <Sparkles size={64} strokeWidth={1} />
                                </div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No active simulations</p>
                            </>
                        ) : (
                            quizzes.map((q) => (
                                <motion.div
                                    key={q._id}
                                    whileHover={{ y: -5 }}
                                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                                    onClick={() => { setSelectedQuiz(q); setView("detail"); }}
                                >
                                    <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                        <Briefcase size={140} strokeWidth={1} />
                                    </div>
                                    <div className="relative z-10 w-full h-full flex flex-col">
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-emerald-600 transition-colors uppercase tracking-tight line-clamp-1">{q.title}</h3>
                                        <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2 flex-grow">{q.description}</p>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(q.createdAt).toLocaleDateString()}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase">{q.questions.length} Qs</span>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(q._id); }} 
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}

                {/* Simulation Factory */}
                {view === "create" && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none"
                    >
                         <button onClick={() => setView("list")} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 dark:hover:text-white mb-10 transition-all text-xs font-black uppercase tracking-widest">
                            <ArrowLeft size={16} /> Dashboard
                        </button>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight">Prime Simulation</h3>
                        <form onSubmit={handleGenerate} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Google UX Challenge"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] px-8 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Focus Topics</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Advanced React Performance and UX"
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] px-8 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                            </div>
                            <div className="space-y-2 relative">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Context / Resume</label>
                                <textarea
                                    value={formData.context}
                                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                                    placeholder="Paste job details or resume data..."
                                    rows={6}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] px-8 py-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                />
                                <div className="absolute top-10 right-4">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={parsingPdf}
                                        className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2"
                                    >
                                        {parsingPdf ? <Loader size={12} className="animate-spin" /> : <UploadCloud size={14} />}
                                        Inject PDF
                                    </button>
                                    <input ref={fileInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
                                </div>
                            </div>
                            <button
                                disabled={generating}
                                type="submit"
                                className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all"
                            >
                                {generating ? <Loader className="animate-spin" size={20} /> : <Zap size={20} />}
                                {generating ? "Synthesizing Questions..." : "Commence Simulation"}
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Question Live Feed (Simulation View) */}
                {view === "detail" && selectedQuiz && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-12"
                    >
                         <div className="flex justify-between items-center sm:bg-white dark:sm:bg-slate-900 sm:border border-slate-200 dark:border-slate-800 p-8 sm:rounded-[3.5rem]">
                            <button onClick={() => setView("list")} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                                <ArrowLeft size={18} /> Exit Simulation
                            </button>
                            <div className="flex gap-4">
                                <button onClick={() => handleShare(selectedQuiz._id)} className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-3xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"><Share2 size={20}/></button>
                                <button onClick={handleAddMoreQuestions} disabled={generating} className="px-8 py-3 bg-primary-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary-500/20 flex items-center gap-3 transition-all">
                                    {generating ? <Loader className="animate-spin" size={14} /> : <Plus size={14} />}
                                    Expand
                                </button>
                            </div>
                        </div>

                        <div className="space-y-10">
                            {selectedQuiz.questions.map((q, idx) => (
                                <motion.div
                                    key={q._id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-10 md:p-14 shadow-sm relative group overflow-hidden"
                                >
                                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-slate-50 dark:bg-slate-950 rounded-full flex items-center justify-center -rotate-12 group-hover:rotate-0 transition-transform">
                                        <span className="text-4xl font-black text-slate-200 dark:text-slate-800">{idx + 1}</span>
                                    </div>
                                    
                                    <div className="relative z-10 flex flex-col gap-10">
                                        <div className="flex justify-between items-start gap-6">
                                            <h4 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">{q.question}</h4>
                                            <button onClick={() => speakText(q.question, q._id)} className={`p-4 rounded-3xl transition-all ${speakingId === q._id ? "bg-primary-600 text-white scale-110" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                                                {speakingId === q._id ? <VolumeX size={24} /> : <Volume2 size={24} />}
                                            </button>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {q.feedback ? (
                                                <motion.div key="feedback" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                                     <div className={`inline-flex items-center gap-3 px-6 py-2 rounded-2xl font-black text-[10px] uppercase tracking-widest border ${q.feedback.status === "Spot On" ? "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 border-emerald-100 dark:border-emerald-800" : "bg-primary-50 dark:bg-primary-900/10 text-primary-600 border-primary-100 dark:border-primary-800"}`}>
                                                        {q.feedback.status === "Spot On" ? <CheckCircle size={16}/> : <AlertCircle size={16}/>}
                                                        {q.feedback.status}
                                                    </div>
                                                    <div className="p-8 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Critique</p>
                                                        <p className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">{q.feedback.message}</p>
                                                    </div>
                                                    <div className="opacity-40 italic text-sm text-slate-500 line-clamp-2">" {q.userAnswer} "</div>
                                                </motion.div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="relative">
                                                        <textarea
                                                            value={userAnswers[q._id] || ""}
                                                            onChange={(e) => setUserAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                                                            placeholder="Synthesizing response components..."
                                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] px-10 py-8 text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none min-h-[160px]"
                                                        />
                                                        <button 
                                                            onClick={() => startListening(q._id)} 
                                                            className={`absolute bottom-6 right-6 p-4 rounded-3xl transition-all ${isListening && listeningQuestionId === q._id ? "bg-red-500 text-white scale-110 shadow-lg" : "bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-500"}`}
                                                        >
                                                            {isListening && listeningQuestionId === q._id ? <MicOff size={24} /> : <Mic size={24} />}
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <button
                                                            disabled={!userAnswers[q._id] || answering[q._id]}
                                                            onClick={() => handleSubmitAnswer(q._id)}
                                                            className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all"
                                                        >
                                                            {answering[q._id] ? <Loader className="animate-spin" size={18} /> : <Send size={18} />}
                                                            {answering[q._id] ? "Evaluating..." : "Submit Response"}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InterviewPrepTab;
