import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader, Sparkles } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import GoogleAuthButton from "../components/GoogleAuthButton";
import useRecaptcha, { RecaptchaBadge } from "../hooks/useRecaptcha";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, loading } = useUserStore();
  const { executeRecaptcha, isConfigured } = useRecaptcha();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let captchaToken = null;
    if (isConfigured) {
      captchaToken = await executeRecaptcha('login');
    }
    login(email, password, captchaToken);
  };

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        {/* Brand & Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Access your academic resources and dashboard.</p>
        </div>

        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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

              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                  <Link to="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-500 transition-colors">Forgot?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? <Loader className="animate-spin" /> : <LogIn size={18} />}
              {loading ? "Logging In..." : "Log In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1" />
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Or login with</span>
            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1" />
          </div>

          <GoogleAuthButton onSuccess={() => window.location.href = "/"} />
          
          <div className="mt-10 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Don't have an account? <Link to="/signup" className="text-primary-600 font-bold hover:underline">Register now</Link>
            </p>
          </div>
        </motion.div>

        {/* Legal Info */}
        <div className="mt-8 text-center space-y-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                By logging in, you agree to our <br/> 
                <a href="#" className="text-slate-500 hover:text-primary-600 underline">Terms of Service</a> and <a href="#" className="text-slate-500 hover:text-primary-600 underline">Privacy Policy</a>
            </p>
            <RecaptchaBadge />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
