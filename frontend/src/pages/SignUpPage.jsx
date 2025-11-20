import { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, User, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useNavigate } from "react-router-dom";

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

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const result = await signup(formData);
			if (result?.success) {
				navigate('/verify-otp', { state: { fromSignup: true } });
			}
		} catch (error) {
			console.error("Signup error:", error);
		}
	};

	return (
		<div className='flex flex-col justify-center py-12 sm:px-6 lg:px-8 min-h-screen relative'>
			{/* Subtle gradient background */}
			<div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />

			{/* Subtle accent gradient */}
			<div className="absolute inset-0 bg-gradient-to-tl from-emerald-900/10 via-transparent to-cyan-900/10" />

			<motion.div
				className='sm:mx-auto sm:w-full sm:max-w-md relative z-10'
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
			>
				<h2 className='mt-6 text-center text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent'>
					Join VedShare
				</h2>
				<p className="mt-2 text-center text-sm text-gray-400">
					Start your learning journey today
				</p>
			</motion.div>

			<motion.div
				className='mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10'
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				<div className='bg-gray-800/80 backdrop-blur-sm border border-gray-700 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10'>
					<form onSubmit={handleSubmit} className='space-y-5'>
						<div>
							<label htmlFor='name' className='block text-sm font-medium text-gray-300'>
								Full name
							</label>
							<div className='mt-2 relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<User className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='name'
									type='text'
									required
									value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className='block w-full px-3 py-3 pl-10 bg-gray-700 border border-gray-600 
										rounded-xl shadow-sm placeholder-gray-400 text-white
										focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
										transition-all duration-200'
									placeholder='John Doe'
								/>
							</div>
						</div>

						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-300'>
								Email address
							</label>
							<div className='mt-2 relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Mail className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='email'
									type='email'
									required
									value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className='block w-full px-3 py-3 pl-10 bg-gray-700 border border-gray-600 
										rounded-xl shadow-sm placeholder-gray-400 text-white
										focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
										transition-all duration-200'
									placeholder='you@example.com'
								/>
							</div>
						</div>

						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-300'>
								Password
							</label>
							<div className='mt-2 relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='password'
									type='password'
									required
									value={formData.password}
									onChange={(e) => setFormData({ ...formData, password: e.target.value })}
									className='block w-full px-3 py-3 pl-10 bg-gray-700 border border-gray-600 
										rounded-xl shadow-sm placeholder-gray-400 text-white
										focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
										transition-all duration-200'
									placeholder='••••••••'
								/>
							</div>
							<PasswordStrengthMeter password={password} />
						</div>

						<div>
							<label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-300'>
								Confirm Password
							</label>
							<div className='mt-2 relative'>
								<div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
									<Lock className='h-5 w-5 text-gray-400' aria-hidden='true' />
								</div>
								<input
									id='confirmPassword'
									type='password'
									required
									value={formData.confirmPassword}
									onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
									className='block w-full px-3 py-3 pl-10 bg-gray-700 border border-gray-600 
										rounded-xl shadow-sm placeholder-gray-400 text-white
										focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
										transition-all duration-200'
									placeholder='••••••••'
								/>
							</div>
						</div>

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							type='submit'
							className='w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent 
								rounded-xl shadow-lg text-sm font-semibold text-white 
								bg-gradient-to-r from-emerald-600 to-cyan-600 
								hover:from-emerald-500 hover:to-cyan-500
								focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 
								disabled:opacity-50 disabled:cursor-not-allowed
								transition-all duration-200'
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader className='h-5 w-5 animate-spin' aria-hidden='true' />
									Creating account...
								</>
							) : (
								<>
									<UserPlus className='h-5 w-5' aria-hidden='true' />
									Sign up
									<ArrowRight className='h-5 w-5' />
								</>
							)}
						</motion.button>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-600" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-gray-800 text-gray-400">
									Already have an account?
								</span>
							</div>
						</div>

						<div className="mt-6">
							<Link
								to='/login'
								className='w-full flex justify-center items-center gap-2 py-3 px-4 border-2 border-emerald-500/50 
									rounded-xl shadow-sm text-sm font-semibold text-emerald-400 
									hover:bg-emerald-500/10 hover:border-emerald-400
									transition-all duration-200'
							>
								Login here
								<ArrowRight className='h-4 w-4' />
							</Link>
						</div>
					</div>
				</div>
			</motion.div>
		</div>
	);
};

export default SignUpPage;
