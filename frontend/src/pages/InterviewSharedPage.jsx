import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader, AlertCircle, CheckCircle, Save } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";

const InterviewSharedPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useUserStore();
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await axios.get(`/interview/${id}`);
                setQuiz(res.data);
            } catch (err) {
                setError("Quiz not found or link is invalid.");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    const handleSaveToDesk = async () => {
        if (!user) {
            toast.error("Please login to save this quiz");
            navigate("/login");
            return;
        }

        try {
            setSaving(true);
            await axios.post(`/interview/${id}/clone`);
            toast.success("Quiz saved to your Learning Desk!");
            setTimeout(() => {
                navigate("/learning-desk");
            }, 1500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to save quiz");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <Loader className="animate-spin text-emerald-500" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-center p-6">
                <AlertCircle className="text-red-500 mb-4" size={64} />
                <h2 className="text-2xl font-bold text-white mb-2">Oops!</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <Link
                    to="/"
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                >
                    Go Home
                </Link>
            </div>
        );
    }

    const isOwnQuiz = user && quiz.user?._id === user._id;

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto"
            >
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-2xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-4">
                            {quiz.title}
                        </h1>
                        <p className="text-gray-400 text-lg">{quiz.description}</p>
                        <div className="mt-4 text-sm text-gray-500">
                            Created by {quiz.user?.name || "a user"} on{" "}
                            {new Date(quiz.createdAt).toLocaleDateString()}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {quiz.questions.map((q, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-6 hover:border-emerald-500/30 transition-colors"
                            >
                                <div className="flex gap-4">
                                    <span className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center font-bold text-lg">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-xl text-gray-200 font-medium">{q.question}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-700">
                        {!isOwnQuiz && user && (
                            <div className="text-center mb-6">
                                <p className="text-gray-400 mb-4">Like this quiz? Save it to your Learning Desk!</p>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSaveToDesk}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader className="animate-spin" size={20} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={20} />
                                            Save to My Learning Desk
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        )}

                        <div className="text-center">
                            <p className="text-gray-400 mb-4">
                                {isOwnQuiz ? "This is your quiz!" : "Want to create your own interview quizzes?"}
                            </p>
                            <Link
                                to="/learning-desk"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                            >
                                <CheckCircle size={20} />
                                {isOwnQuiz ? "Go to Learning Desk" : "Create Your Own"}
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default InterviewSharedPage;
