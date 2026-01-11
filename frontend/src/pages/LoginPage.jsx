import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, ArrowRight, Loader } from "lucide-react";
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

    // Get reCAPTCHA token if configured
    let captchaToken = null;
    if (isConfigured) {
      captchaToken = await executeRecaptcha('login');
    }

    login(email, password, captchaToken);
  };

  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen relative">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />

      {/* Subtle accent gradient */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/10 via-transparent to-blue-900/10" />

      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Sign in to continue your learning journey
        </p>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-3 py-3 pl-10 bg-gray-700 border border-gray-600 
                    rounded-xl shadow-sm placeholder-gray-400 text-white
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                    transition-all duration-200"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-3 pl-10 bg-gray-700 border border-gray-600 
                    rounded-xl shadow-sm placeholder-gray-400 text-white
                    focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                    transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent 
                rounded-xl shadow-lg text-sm font-semibold text-white 
                bg-gradient-to-r from-cyan-600 to-blue-600 
                hover:from-cyan-500 hover:to-blue-500
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin h-5 w-5" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign in
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Google Auth Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="mt-6">
              <GoogleAuthButton onSuccess={() => window.location.href = "/"} />
            </div>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">
                  New to VedShare?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/signup"
                className="w-full flex justify-center py-3 px-4 border-2 border-cyan-500/50 
                  rounded-xl shadow-sm text-sm font-semibold text-cyan-400 
                  hover:bg-cyan-500/10 hover:border-cyan-400
                  transition-all duration-200"
              >
                Create an account
              </Link>
            </div>
          </div>

          {/* reCAPTCHA Badge */}
          <RecaptchaBadge />
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
