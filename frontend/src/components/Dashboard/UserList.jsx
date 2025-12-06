import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import toast from "react-hot-toast";
import Modal from "../Modal";
import { useUserStore } from "../../stores/useUserStore";
import { motion } from "framer-motion";
import { Users, Trash2, Shield, ShieldCheck, Mail, CheckCircle, XCircle } from "lucide-react";

const UsersList = () => {
  const { user: currentUser } = useUserStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("/users");
      setUsers(data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (action, label) => {
    setModalContent({ action, label });
    setShowModal(true);
  };

  const updateRole = async (userId, role) => {
    confirmAction(() => actuallyUpdateRole(userId, role), `Change role to "${role}"?`);
  };

  const actuallyUpdateRole = async (userId, role) => {
    try {
      await axios.patch(`/users/${userId}/role`, { role });
      toast.success("Role updated");
      fetchUsers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = (userId) => {
    confirmAction(() => actuallyDeleteUser(userId), "Are you sure you want to delete this user?");
  };

  const actuallyDeleteUser = async (userId) => {
    try {
      await axios.delete(`/users/${userId}`);
      toast.success("User deleted");
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  useEffect(() => {
    fetchUsers();
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

  return (
    <motion.div
      className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 shadow-xl rounded-2xl overflow-hidden max-w-6xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="p-6 border-b border-gray-700/50 flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg">
          <Users className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white">User Management</h2>
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
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50 bg-transparent">
            {users.map((u, index) => (
              <motion.tr
                key={u._id}
                className="hover:bg-gray-700/30 transition-colors duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {u.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-white">{u.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-300">{u.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    disabled={currentUser?._id === u._id}
                    className={`bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all ${currentUser?._id === u._id ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-700"
                      }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {u.isVerified ? (
                    <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                      <XCircle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {currentUser?._id !== u._id && (
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors duration-200"
                      title="Delete User"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Users className="mx-auto h-12 w-12 text-gray-600 mb-3" />
            <p>No users found.</p>
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-sm">
          <p className="mb-4 text-gray-300">{modalContent?.label}</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setShowModal(false);
                modalContent?.action?.();
              }}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default UsersList;
