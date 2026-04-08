import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Lock, Loader, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { toast } from "react-hot-toast";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const { password, confirmPassword } = formData;
  const { token } = useParams();
  const navigate = useNavigate();
  const { loading, resetPassword } = useUserStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const result = await resetPassword(token, password);
      if (result?.success) {
        toast.success(result.message);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(result?.message || "Password reset failed");
      }
    } catch (error) {
      console.error("Full error details:", error);
      toast.error(error?.message || error.response?.data?.message || "Error resetting password");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">New Password</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Create a strong password to secure your account.</p>
        </div>

        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <PasswordStrengthMeter password={password} />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Confirm New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" /> : <Lock size={18} />}
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="mt-8 text-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-500 transition-all">
              Already have an account? Log In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;