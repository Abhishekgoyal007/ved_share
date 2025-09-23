import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import toast from "react-hot-toast";
import Modal from "../Modal";
import { useUserStore } from "../../stores/useUserStore";
import { motion } from "framer-motion";

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

  if (loading) return <p className="text-center text-gray-400">Loading users...</p>;

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-bold text-cyan-400 mb-6">User Management</h2>

      <motion.div
  className="overflow-x-auto"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.8 }}
>
        <table className="min-w-full text-sm bg-gray-900 border border-gray-700 rounded-md">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Verified</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {users.map((u, index) => (
              <motion.tr
       key={u._id}
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ delay: index * 0.05 }}
    >
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    disabled={currentUser?._id === u._id}
                    className={`bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white ${
                      currentUser?._id === u._id ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-2">{u.isVerified ? "✅" : "❌"}</td>
                <td className="px-4 py-2">
                  {currentUser?._id !== u._id && (
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </motion.tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="text-sm">
          <p className="mb-4">{modalContent?.label}</p>
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setShowModal(false);
                modalContent?.action?.();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersList;
