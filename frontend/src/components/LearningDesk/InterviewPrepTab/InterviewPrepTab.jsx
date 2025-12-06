import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowLeft, Save, Share2, Loader, FileText, Sparkles, Send, CheckCircle, XCircle, AlertCircle, Trash2 } from "lucide-react";
import axios from "../../../lib/axios";
import toast from "react-hot-toast";

const InterviewPrepTab = ({ initialData, onDataConsumed }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [view, setView] = useState("list"); // list, create, preview, detail
    const [formData, setFormData] = useState({ title: "", description: "" });
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [answering, setAnswering] = useState({}); // { questionId: boolean }
    const [userAnswers, setUserAnswers] = useState({}); // { questionId: string }

    useEffect(() => {
        fetchQuizzes();
    }, []);

    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                description: initialData.description,
                title: "Quiz from Keywords" // Optional default title
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
            toast.error("Please fill in all fields");
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
            const payload = {
                ...formData,
                questions: generatedQuestions,
            };
            const res = await axios.post("/interview", payload);
            setQuizzes([res.data, ...quizzes]);
            toast.success("Quiz saved successfully!");
            setView("list");
            setFormData({ title: "", description: "" });
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
            // Update the quiz in the main list as well
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

            // Update local state with feedback
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
        if (!window.confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
            return;
        }

        try {
            await axios.delete(`/interview/${quizId}`);
            setQuizzes(quizzes.filter(q => q._id !== quizId));
            toast.success("Quiz deleted successfully!");
            if (selectedQuiz?._id === quizId) {
                setView("list");
                setSelectedQuiz(null);
            }
        } catch (error) {
            toast.error("Failed to delete quiz");
        }
    };

    const getFeedbackColor = (status) => {
        switch (status) {
            case "Spot On": return "text-emerald-400 border-emerald-500/50 bg-emerald-500/10";
            case "Almost Correct": return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
            case "Wrong": return "text-red-400 border-red-500/50 bg-red-500/10";
            default: return "text-gray-400 border-gray-700 bg-gray-800";
        }
    };

    const getFeedbackIcon = (status) => {
        switch (status) {
            case "Spot On": return <CheckCircle size={20} />;
            case "Almost Correct": return <AlertCircle size={20} />;
            case "Wrong": return <XCircle size={20} />;
            default: return null;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
                    AI Interview Prep
                </h2>
                {view === "list" && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setView("create")}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg transition-colors"
                    >
                        <Plus size={20} />
                        Create New Quiz
                    </motion.button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === "list" && (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {loading ? (
                            <div className="col-span-full flex justify-center py-12">
                                <Loader className="animate-spin text-emerald-500" size={40} />
                            </div>
                        ) : quizzes.length === 0 ? (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                <FileText size={64} className="mx-auto mb-4 opacity-50" />
                                <p className="text-xl">No quizzes yet. Create one to get started!</p>
                            </div>
                        ) : (
                            quizzes.map((quiz) => (
                                <motion.div
                                    key={quiz._id}
                                    whileHover={{ y: -5 }}
                                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors group relative"
                                >
                                    <div
                                        onClick={() => {
                                            setSelectedQuiz(quiz);
                                            setView("detail");
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                            {quiz.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                            {quiz.description}
                                        </p>
                                        <div className="flex justify-between items-center text-xs text-gray-500">
                                            <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                                            <span className="bg-gray-700 px-2 py-1 rounded text-gray-300">
                                                {quiz.questions.length} Questions
                                            </span>
                                        </div>
                                    </div>

                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="absolute top-4 right-4 p-2 bg-red-600/80 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(quiz._id);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </motion.button>
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                )}

                {view === "create" && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8"
                    >
                        <button
                            onClick={() => setView("list")}
                            className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft size={20} /> Back to List
                        </button>

                        <h3 className="text-2xl font-bold text-white mb-6">Create New Quiz</h3>
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Quiz Title
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., React Senior Developer Interview"
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Description / Topic
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Describe what you want to be asked about (e.g., 'Advanced React patterns, hooks, performance optimization, and state management')"
                                    rows={4}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={generating}
                                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <Loader className="animate-spin" size={20} /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={20} /> Generate Questions
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                )}

                {view === "preview" && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => setView("create")}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                            >
                                <ArrowLeft size={20} /> Edit Details
                            </button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg transition-colors"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : <Save size={20} />}
                                Save Quiz
                            </motion.button>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
                            <h3 className="text-2xl font-bold text-white mb-2">{formData.title}</h3>
                            <p className="text-gray-400 mb-8">{formData.description}</p>

                            <div className="space-y-4">
                                {generatedQuestions.map((q, idx) => (
                                    <div
                                        key={idx}
                                        className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4"
                                    >
                                        <div className="flex gap-4">
                                            <span className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold">
                                                {idx + 1}
                                            </span>
                                            <p className="text-gray-200 mt-1">{q.question}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === "detail" && selectedQuiz && (
                    <motion.div
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <button
                                onClick={() => setView("list")}
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                            >
                                <div className="p-2 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors">
                                    <ArrowLeft size={20} />
                                </div>
                                <span className="font-medium">Back to List</span>
                            </button>
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleAddMoreQuestions}
                                    disabled={generating || selectedQuiz.questions.length >= 50}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {generating ? <Loader className="animate-spin" size={18} /> : <Plus size={18} />}
                                    Add Questions
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleShare(selectedQuiz._id)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 hover:border-gray-600 rounded-xl transition-all font-medium"
                                >
                                    <Share2 size={18} />
                                    Share
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleDelete(selectedQuiz._id)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600/80 hover:bg-red-500 text-white rounded-xl transition-all font-medium"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </motion.button>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
                                <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">{selectedQuiz.title}</h3>
                                <p className="text-gray-400 text-lg leading-relaxed">{selectedQuiz.description}</p>
                            </div>

                            <div className="space-y-6">
                                {selectedQuiz.questions.map((q, idx) => (
                                    <motion.div
                                        key={q._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-gray-800/40 backdrop-blur-md border border-gray-700/50 rounded-2xl overflow-hidden hover:border-gray-600/50 transition-colors"
                                    >
                                        <div className="p-6 md:p-8">
                                            <div className="flex gap-5">
                                                <div className="flex-shrink-0">
                                                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 text-emerald-400 font-bold text-lg border border-emerald-500/20 shadow-inner">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                                <div className="flex-grow">
                                                    <p className="text-xl text-gray-100 font-medium leading-relaxed mb-6">{q.question}</p>

                                                    <AnimatePresence mode="wait">
                                                        {q.feedback ? (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className={`rounded-xl border overflow-hidden ${q.feedback.status === "Spot On" ? "bg-emerald-900/10 border-emerald-500/30" :
                                                                    q.feedback.status === "Almost Correct" ? "bg-yellow-900/10 border-yellow-500/30" :
                                                                        "bg-red-900/10 border-red-500/30"
                                                                    }`}
                                                            >
                                                                <div className={`px-5 py-3 border-b flex items-center gap-3 font-semibold ${q.feedback.status === "Spot On" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                                                    q.feedback.status === "Almost Correct" ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                                                                        "bg-red-500/10 border-red-500/20 text-red-400"
                                                                    }`}>
                                                                    {getFeedbackIcon(q.feedback.status)}
                                                                    <span>{q.feedback.status}</span>
                                                                </div>

                                                                <div className="p-5 space-y-4">
                                                                    <div>
                                                                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">AI Feedback</p>
                                                                        <p className="text-gray-300 leading-relaxed">{q.feedback.message}</p>
                                                                    </div>

                                                                    <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                                                                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Your Answer</p>
                                                                        <p className="text-gray-400 italic">"{q.userAnswer}"</p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                className="space-y-4"
                                                            >
                                                                <textarea
                                                                    value={userAnswers[q._id] || ""}
                                                                    onChange={(e) => setUserAnswers(prev => ({ ...prev, [q._id]: e.target.value }))}
                                                                    placeholder="Type your answer here..."
                                                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-gray-200 placeholder-gray-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 outline-none transition-all resize-none text-base"
                                                                    rows={4}
                                                                />
                                                                <div className="flex justify-end">
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.02 }}
                                                                        whileTap={{ scale: 0.98 }}
                                                                        onClick={() => handleSubmitAnswer(q._id)}
                                                                        disabled={!userAnswers[q._id] || answering[q._id]}
                                                                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-emerald-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                                                                    >
                                                                        {answering[q._id] ? (
                                                                            <Loader className="animate-spin" size={18} />
                                                                        ) : (
                                                                            <Send size={18} />
                                                                        )}
                                                                        Submit Answer
                                                                    </motion.button>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InterviewPrepTab;
