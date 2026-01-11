import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { User, Mail, Shield, CheckCircle, XCircle, Package, ShoppingCart, IndianRupee, BookOpen, FileText, Camera, Loader, Pencil } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import axios from "../lib/axios";

const ProfilePage = () => {
  const { user, uploadProfilePicture, updateProfile, loading: storeLoading } = useUserStore();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [learningStats, setLearningStats] = useState({
    totalQuizzes: 0,
    totalDocuments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [learningLoading, setLearningLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const res = await axios.get("/analytics/my-analytics");
        setStats(res.data.analyticsData);
      } catch (error) {
        console.error("Error fetching user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLearningStats = async () => {
      try {
        const [quizzesRes, docsRes] = await Promise.all([
          axios.get("/interview"),
          axios.get("/documents"),
        ]);
        setLearningStats({
          totalQuizzes: quizzesRes.data.length || 0,
          totalDocuments: docsRes.data.length || 0,
        });
      } catch (error) {
        console.error("Error fetching learning stats:", error);
      } finally {
        setLearningLoading(false);
      }
    };

    fetchUserStats();
    fetchLearningStats();
  }, []);

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    await uploadProfilePicture(file);
  };

  const handleNameUpdate = async () => {
    if (!newName.trim() || newName === user?.name) {
      setIsEditingName(false);
      return;
    }

    const result = await updateProfile({ name: newName.trim() });
    if (result.success) {
      setIsEditingName(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <motion.div
          className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 shadow-xl rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-6">
            {/* Profile Picture with Upload */}
            <div className="relative group">
              <div className="h-24 w-24 rounded-full overflow-hidden shadow-lg ring-4 ring-gray-700">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={storeLoading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                {storeLoading ? (
                  <Loader className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                className="hidden"
              />
            </div>

            <div className="flex-1">
              {/* Editable Name */}
              <div className="flex items-center gap-2 mb-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="text-2xl font-bold bg-gray-700 text-white px-3 py-1 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                      autoFocus
                    />
                    <button
                      onClick={handleNameUpdate}
                      disabled={storeLoading}
                      className="px-3 py-1 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-500 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false);
                        setNewName(user.name);
                      }}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-500 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-white">{user.name}</h1>
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${user.role === "admin"
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  }`}>
                  <Shield className="w-3 h-3" />
                  {user.role === "admin" ? "Admin" : "User"}
                </span>
                {user.isVerified ? (
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
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Product Statistics</h2>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl">
                    <Package className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Products</p>
                    <p className="text-white text-2xl font-bold">{stats.totalProducts}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <ShoppingCart className="w-8 h-8 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Sales</p>
                    <p className="text-white text-2xl font-bold">{stats.totalSales}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl">
                    <IndianRupee className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Revenue</p>
                    <p className="text-white text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Learning Desk Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Learning Desk Overview</h2>
          {learningLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <BookOpen className="w-8 h-8 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Interview Quizzes</p>
                    <p className="text-white text-2xl font-bold">{learningStats.totalQuizzes}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-xl">
                    <FileText className="w-8 h-8 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Study Documents</p>
                    <p className="text-white text-2xl font-bold">{learningStats.totalDocuments}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
