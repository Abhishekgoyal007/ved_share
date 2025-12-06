import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Trash2, MessageSquare, Mail, User, Calendar, Eye } from "lucide-react";
import Modal from "../Modal";
import { motion } from "framer-motion";

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
      toast.error("Failed to fetch feedbacks");
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
      toast.error("Failed to delete feedback");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-600 mb-3" />
        <p>No feedbacks submitted yet.</p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 shadow-xl rounded-2xl overflow-hidden max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <MessageSquare className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white">User Feedbacks</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700/50">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50 bg-transparent">
              {feedbacks.map((fb, index) => (
                <motion.tr
                  key={fb._id}
                  className="hover:bg-gray-700/30 transition-colors duration-200"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {fb.user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-white">{fb.user?.name || "Unknown"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{fb.user?.email || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${fb.type === "bug"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : fb.type === "feature"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}>
                      {fb.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                      onClick={() => setSelectedMessage(fb.message)}
                    >
                      <Eye className="w-4 h-4" />
                      Read Message
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300">{new Date(fb.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setConfirmDeleteId(fb._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors duration-200"
                      title="Delete Feedback"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Message Modal */}
      <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Feedback Message</h3>
        </div>
        <p className="text-sm text-gray-300 whitespace-pre-wrap bg-gray-700/30 p-4 rounded-lg border border-gray-600">
          {selectedMessage}
        </p>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Trash2 className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Confirm Deletion</h3>
        </div>
        <p className="text-sm text-gray-300 mb-6">
          Are you sure you want to delete this feedback? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm text-white transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={deleteFeedback}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg text-sm text-white transition-all duration-200"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FeedbackList;
