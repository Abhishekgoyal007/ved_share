import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
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

  if (loading) return <p className="text-gray-400">Loading feedbacks...</p>;
  if (feedbacks.length === 0)
    return <p className="text-gray-500 text-sm">No feedbacks submitted yet.</p>;

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">User Feedbacks</h2>
        <motion.div
          className="bg-gray-800 rounded-lg shadow overflow-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8 }}
        >
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-700 text-left text-gray-300 uppercase text-xs tracking-wider">
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Type</th>
                <th className="p-3">Message</th>
                <th className="p-3">Submitted At</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 divide-y divide-gray-700">
              {feedbacks.map((fb, index) => (
                <motion.tr
                  key={fb._id}
                  className="hover:bg-gray-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td className="p-3">{fb.user?.name || "Unknown"}</td>
                  <td className="p-3">{fb.user?.email || "N/A"}</td>
                  <td className="p-3 capitalize">{fb.type}</td>
                  <td className="p-3">
                    <button
                      className="text-cyan-400 hover:underline text-xs"
                      onClick={() => setSelectedMessage(fb.message)}
                    >
                      Read Message
                    </button>
                  </td>
                  <td className="p-3">{new Date(fb.createdAt).toLocaleString()}</td>
                  <td className="p-3 flex gap-3">
                    <button
                      onClick={() => setConfirmDeleteId(fb._id)}
                      className="text-red-400 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>

      {/* Message Modal */}
      <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
        <h3 className="text-lg font-bold text-cyan-400 mb-2">Message</h3>
        <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedMessage}</p>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!confirmDeleteId} onClose={() => setConfirmDeleteId(null)}>
        <h3 className="text-lg font-bold text-red-400 mb-4">Confirm Deletion</h3>
        <p className="text-sm text-gray-300 mb-4">
          Are you sure you want to delete this feedback?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setConfirmDeleteId(null)}
            className="px-4 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={deleteFeedback}
            className="px-4 py-1 bg-red-500 rounded hover:bg-red-600 text-sm text-white"
          >
            Delete
          </button>
        </div>
      </Modal>
    </>
  );
};

export default FeedbackList;
