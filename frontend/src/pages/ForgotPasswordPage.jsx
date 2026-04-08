import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import useRecaptcha, { RecaptchaBadge } from "../hooks/useRecaptcha";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { loading, forgotPassword } = useUserStore();
  const { executeRecaptcha, isConfigured } = useRecaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let captchaToken = null;
    if (isConfigured) {
      captchaToken = await executeRecaptcha('forgot_password');
    }
    await forgotPassword(email, captchaToken);
    setIsSubmitted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Forgot Password</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">No worries, we'll help you regain access.</p>
        </div>

        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative"
        >
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all"
                    placeholder="name@university.edu"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {loading ? <Loader className="animate-spin" /> : <ArrowRight size={18} />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-600">
                <Mail size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check Your Inbox</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                If an account exists for <span className="text-primary-600 font-bold">{email}</span>, you will receive a password reset link shortly.
              </p>
            </div>
          )}

          <div className="mt-8 text-center pt-4 border-t border-slate-50 dark:border-slate-800/50">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-bold text-primary-600 hover:text-primary-500 transition-all">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </motion.div>

        <div className="mt-8">
            <RecaptchaBadge />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;