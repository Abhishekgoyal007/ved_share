import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Trash2, MessageSquare, Mail, Calendar, Eye, Inbox, Loader, Ghost, AlertTriangle } from "lucide-react";
import Modal from "../Modal";
import { motion, AnimatePresence } from "framer-motion";

const FeedbackList = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get("/feedback");
      setFeedbacks(res.data);
    } catch {
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const deleteFeedback = async () => {
    try {
      await axios.delete(`/feedback/${confirmDeleteId}`);
      setFeedbacks((prev) => prev.filter((fb) => fb._id !== confirmDeleteId));
      toast.success("Feedback deleted");
    } catch {
      toast.error("Error deleting feedback");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader className="animate-spin text-primary-600" size={32} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Feedback...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                    <Inbox size={12}/> Feedback Hub
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">User Feedback</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Review bug reports, feature requests, and messages from users.</p>
            </div>
        </div>

        {/* Feedback List */}
        <div className="overflow-x-auto pb-10">
            <table className="w-full text-left border-separate border-spacing-y-2 min-w-[850px]">
                <thead>
                    <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="px-8 pb-3">From User</th>
                        <th className="px-8 pb-3">Feedback Type</th>
                        <th className="px-8 pb-3">Message</th>
                        <th className="px-8 pb-3">Received On</th>
                        <th className="px-8 pb-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-transparent">
                    {feedbacks.map((fb, index) => (
                        <motion.tr
                            key={fb._id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
                        >
                            <td className="px-8 py-4 rounded-l-2xl border-y border-l border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-sm">
                                        <span className="text-white font-black text-xs uppercase">{fb.user?.name?.charAt(0) || "U"}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate leading-none mb-1">{fb.user?.name || "Anonymous"}</div>
                                        <div className="text-[9px] font-bold text-slate-400 truncate">{fb.user?.email || "No Email"}</div>
                                    </div>
                                </div>
                            </td>

                            <td className="px-8 py-4 border-y border-slate-50 dark:border-slate-800">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${fb.type === "bug" 
                                    ? "bg-red-50 dark:bg-red-900/10 text-red-500 border-red-100 dark:border-red-900/20" 
                                    : fb.type === "feature"
                                        ? "bg-blue-50 dark:bg-blue-900/10 text-blue-500 border-blue-100 dark:border-blue-900/20"
                                        : "bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500 border-emerald-100 dark:border-emerald-900/20"}`}
                                >
                                    {fb.type === "bug" ? <AlertTriangle size={10} /> : <MessageSquare size={10} />}
                                    {fb.type}
                                </div>
                            </td>

                            <td className="px-8 py-4 border-y border-slate-50 dark:border-slate-800">
                                <button
                                    onClick={() => setSelectedMessage(fb.message)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary-600 transition-all"
                                >
                                    <Eye size={12} />
                                    Read Message
                                </button>
                            </td>

                            <td className="px-8 py-4 border-y border-slate-50 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Calendar size={12} />
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                </div>
                            </td>

                            <td className="px-8 py-4 rounded-r-2xl border-y border-r border-slate-50 dark:border-slate-800 text-right">
                                <button
                                    onClick={() => setConfirmDeleteId(fb._id)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
            
            {feedbacks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-4 text-slate-300">
                        <Ghost size={48} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">No Feedbacks</h3>
                    <p className="text-slate-500 text-xs font-medium">There are no messages from users to display at the moment.</p>
                </div>
            )}
        </div>

      {/* Message Modal */}
      <AnimatePresence>
        {selectedMessage && (
            <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
                <div className="p-2 text-center">
                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-500 flex items-center justify-center mx-auto mb-6">
                        <MessageSquare size={32} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Feedback Details</h4>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl mb-8 text-left">
                         <p className="text-slate-700 dark:text-slate-300 font-bold text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedMessage}
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedMessage(null)}
                        className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                        Close
                    </button>
                </div>
            </Modal>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {confirmDeleteId && (
            <Modal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
                <div className="p-2 text-center">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl text-red-500 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle size={32} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Delete Feedback</h4>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-8">Are you sure you want to delete this message? This cannot be undone.</p>
                    <div className="flex gap-4">
                        <button
                            onClick={deleteFeedback}
                            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                        >
                            Delete
                        </button>
                        <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeedbackList;
