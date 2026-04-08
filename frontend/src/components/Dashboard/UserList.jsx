import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "../../lib/axios";
import { User, Mail, Shield, Trash2, Search, ArrowRight, Loader, UserCheck, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

const UsersList = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await axios.get("/users");
            setUsers(res.data);
        } catch (err) {
            toast.error("Access Denied: Neural connection failed");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleRole = async (user) => {
        const newRole = user.role === "admin" ? "user" : "admin";
        try {
            const res = await axios.patch(`/users/${user._id}/role`, { role: newRole });
            setUsers(users.map(u => u._id === user._id ? { ...u, role: res.data.user.role } : u));
            toast.success(`Role updated: ${res.data.user.role.toUpperCase()}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update role");
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("Terminate this identity record permanently?")) return;
        try {
            await axios.delete(`/users/${userId}`);
            setUsers(users.filter(u => u._id !== userId));
            toast.success("Identity record purged from mainframe");
        } catch (err) {
            toast.error(err.response?.data?.message || "Purge protocol failed");
        }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <Loader className="animate-spin text-primary-600" size={24} />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Querying identity database...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-600 rounded-lg text-white shadow-lg shadow-primary-500/20">
                        <User size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">User List</h2>
                        <p className="text-slate-500 font-medium text-[10px] uppercase tracking-widest leading-none mt-1">Total Members: {users.length}</p>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={16} />
                    <input 
                        type="text"
                        placeholder="SEARCH USERS..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-black tracking-widest w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all uppercase"
                    />
                </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto custom-scrollbar -mx-2 sm:mx-0">
                <table className="w-full text-left border-separate border-spacing-y-2 min-w-[700px]">
                    <thead>
                        <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest opacity-70">
                            <th className="px-4 pb-2 w-[40%]">User</th>
                            <th className="px-4 pb-2 text-center w-[20%]">Role</th>
                            <th className="px-4 pb-2 text-center w-[20%]">Admin Access</th>
                            <th className="px-4 pb-2 text-right w-[20%]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-transparent">
                        <AnimatePresence>
                            {filteredUsers.map((u, idx) => (
                                <motion.tr 
                                    key={u._id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    transition={{ delay: idx * 0.02 }}
                                    className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary-500/30 transition-all"
                                >
                                    {/* Name & Email */}
                                    <td className="px-4 py-3 rounded-l-2xl border-y border-l border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-all duration-300">
                                                <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 group-hover:text-white uppercase">{u.name?.charAt(0)}</span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-slate-900 dark:text-white text-[11px] truncate uppercase tracking-tight">{u.name}</p>
                                                <div className="flex items-center gap-1.5 opacity-60">
                                                    <Mail size={8} className="text-slate-400" />
                                                    <span className="text-[9px] font-bold text-slate-500 truncate lowercase max-w-[150px]">{u.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Role Badge */}
                                    <td className="px-4 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
                                        <div className={`inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                            u.role === 'admin' 
                                                ? "bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-amber-600" 
                                                : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-slate-400"
                                        }`}>
                                            {u.role === 'admin' ? <ShieldAlert size={10} /> : <UserCheck size={10} />}
                                            {u.role}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3 border-y border-slate-100 dark:border-slate-800 text-center">
                                        <button 
                                            onClick={() => toggleRole(u)}
                                            className={`px-4 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all inline-flex items-center gap-2 shadow-sm ${
                                                u.role === 'admin' 
                                                    ? "bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-100 dark:border-red-900/20" 
                                                    : "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                                            }`}
                                        >
                                            <Shield size={10} />
                                            {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                                        </button>
                                    </td>

                                    {/* Delete User */}
                                    <td className="px-4 py-3 rounded-r-2xl border-y border-r border-slate-100 dark:border-slate-800 text-right">
                                        <button 
                                            onClick={() => deleteUser(u._id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No matching identity records found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersList;
