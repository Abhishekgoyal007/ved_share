import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import toast from "react-hot-toast";
import { Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const EmailVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  const { error, isLoading, verifyOtp, resendOtp } = useUserStore();

  const handleChange = (index, value) => {
    const newCode = [...code];

    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setCode(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const verificationCode = code.join("");
    try {
      const result = await verifyOtp(verificationCode);
      if (result) {
        navigate("/");
        toast.success("Email verified successfully");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleResendOtp = async () => {
    try {
      await resendOtp();
      toast.success("New verification code sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend code");
    }
  };

  useEffect(() => {
    if (code.every((digit) => digit !== "")) {
      handleSubmit(new Event("submit"));
    }
  }, [code]);

  return (
    <div className="flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[440px]">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Verify Email</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Enter the 6-digit code sent to your inbox.</p>
        </div>

        {/* Content Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2 sm:gap-4">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:outline-none transition-all"
                />
              ))}
            </div>
            
            {error && <p className="text-red-500 text-xs font-bold text-center animate-shake">{error}</p>}

            <button
              type="submit"
              disabled={isLoading || code.some((digit) => !digit)}
              className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Mail size={18} />}
              {isLoading ? "Verifying..." : "Verify Identity"}
            </button>

            <div className="text-center border-t border-slate-50 dark:border-slate-800/50 pt-6">
              <p className="text-xs text-slate-400 font-medium">
                Didn't receive a code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-primary-600 font-bold hover:underline"
                >
                  Resend OTP
                </button>
              </p>
            </div>
          </form>
        </motion.div>

        <div className="mt-8 text-center">
            <Link to="/login" className="text-xs font-bold text-slate-400 hover:text-primary-600 transition-colors">
                Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;