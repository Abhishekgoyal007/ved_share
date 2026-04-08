import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import GoogleAuthButton from "../components/GoogleAuthButton";
import useRecaptcha, { RecaptchaBadge } from "../hooks/useRecaptcha";

const SignUpPage = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const { password } = formData;
	const { signup, loading } = useUserStore();
	const navigate = useNavigate();
	const { executeRecaptcha, isConfigured } = useRecaptcha();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			let captchaToken = null;
			if (isConfigured) {
				captchaToken = await executeRecaptcha('signup');
			}

			const result = await signup({ ...formData, captchaToken });
			if (result?.success) {
				navigate('/verify-otp', { state: { fromSignup: true } });
			}
		} catch (error) {
			console.error("Signup error:", error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center px-4">
			<div className="w-full max-w-[480px]">
				{/* Brand & Heading */}
				<div className="text-center mb-10">
					<h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Create Account</h1>
					<p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Start your professional learning journey with us.</p>
				</div>

				{/* Content Card */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none relative"
				>
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Full Name</label>
							<div className="relative group">
								<User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all"
									placeholder="Johnathan Doe"
								/>
							</div>
						</div>

						<div>
							<label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Email Address</label>
							<div className="relative group">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
								<input
									type="email"
									required
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all"
									placeholder="john@example.com"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Password</label>
								<div className="relative group">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
									<input
										type="password"
										required
										value={formData.password}
										onChange={(e) => setFormData({ ...formData, password: e.target.value })}
										className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all"
										placeholder="••••••••"
									/>
								</div>
							</div>
							<div>
								<label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1">Confirm Password</label>
								<div className="relative group">
									<Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors" size={18} />
									<input
										type="password"
										required
										value={formData.confirmPassword}
										onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
										className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-900 dark:text-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/50 outline-none transition-all"
										placeholder="••••••••"
									/>
								</div>
							</div>
						</div>

						<PasswordStrengthMeter password={password} />

						<button
							type="submit"
							disabled={loading}
							className="w-full py-4 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
						>
							{loading ? <Loader className="animate-spin" /> : <UserPlus size={18} />}
							{loading ? "Signing Up..." : "Sign Up"}
						</button>
					</form>

					<div className="flex items-center gap-4 my-8">
						<div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1" />
						<span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">Or register via</span>
						<div className="h-[1px] bg-slate-100 dark:bg-slate-800 flex-1" />
					</div>

					<GoogleAuthButton onSuccess={() => window.location.href = "/"} />
					
					<div className="mt-8 text-center">
						<p className="text-xs text-slate-500 font-medium">
							Already a member? <Link to="/login" className="text-primary-600 font-bold hover:underline">Log in</Link>
						</p>
					</div>
				</motion.div>

				<div className="mt-8 text-center space-y-4">
					<p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
						By creating an account, you consent to our <br/> 
						<a href="#" className="text-slate-500 hover:text-primary-600 underline">Community Guidelines</a> and <a href="#" className="text-slate-500 hover:text-primary-600 underline">Privacy Policy</a>
					</p>
					<RecaptchaBadge />
				</div>
			</div>
		</div>
	);
};

export default SignUpPage;
