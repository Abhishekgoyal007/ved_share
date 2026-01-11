import { ShoppingCart, UserPlus, LogIn, LogOut, LayoutDashboard, BookOpen, User, ChevronDown, PlusCircle, Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "../stores/useCartStore";
import { useProductStore } from "../stores/useProductStore";
import { useState, useRef, useEffect } from "react";
import vs_logo from "/vs_logo.png";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
	const { user, logout } = useUserStore();
	const isAdmin = user?.role === "admin";
	const { cart } = useCartStore();
	const { pendingOffersCount, fetchPendingOffersCount, searchProducts, searchResults, searchLoading, clearSearchResults } = useProductStore();
	const navigate = useNavigate();

	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const searchRef = useRef(null);

	useEffect(() => {
		if (user) fetchPendingOffersCount();
	}, [fetchPendingOffersCount, user]);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Debounced search
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			if (searchQuery.trim().length >= 2) {
				searchProducts(searchQuery);
			} else {
				clearSearchResults();
			}
		}, 300);
		return () => clearTimeout(timeoutId);
	}, [searchQuery, searchProducts, clearSearchResults]);

	// Close search dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (searchRef.current && !searchRef.current.contains(event.target)) {
				setIsSearchOpen(false);
			}
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsProfileOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSearchSelect = (productId) => {
		navigate(`/product/${productId}`);
		setSearchQuery("");
		setIsSearchOpen(false);
		clearSearchResults();
	};

	return (
		<header className='fixed top-0 left-0 w-full bg-gray-900/95 backdrop-blur-md shadow-xl z-40 border-b border-gray-800'>
			<div className='container mx-auto px-4 py-3'>
				<div className='flex flex-wrap justify-between items-center gap-3'>
					{/* Logo */}
					<Link to='/' className="flex items-center text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent hover:from-cyan-300 hover:to-blue-400 transition-all duration-300">
						<img
							src={vs_logo}
							alt="VedShare Logo"
							className="h-10 w-auto mr-2"
						/>
						<span className="hidden sm:inline">VedShare</span>
					</Link>

					{/* Search Bar */}
					<div className="relative flex-1 max-w-md mx-4 hidden md:block" ref={searchRef}>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setIsSearchOpen(true);
								}}
								onFocus={() => setIsSearchOpen(true)}
								placeholder="Search books, notes, tags..."
								className="w-full bg-gray-800/80 border border-gray-700/50 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-200"
							/>
							{searchQuery && (
								<button
									onClick={() => {
										setSearchQuery("");
										clearSearchResults();
									}}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
								>
									<X size={18} />
								</button>
							)}
						</div>

						{/* Search Results Dropdown */}
						<AnimatePresence>
							{isSearchOpen && searchQuery.length >= 2 && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto z-50"
								>
									{searchLoading ? (
										<div className="p-4 text-center text-gray-400">
											<div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto"></div>
											<p className="mt-2 text-sm">Searching...</p>
										</div>
									) : searchResults.length > 0 ? (
										<div>
											{searchResults.map((product) => (
												<button
													key={product._id}
													onClick={() => handleSearchSelect(product._id)}
													className="w-full flex items-center gap-3 p-3 hover:bg-gray-700/50 transition-colors text-left"
												>
													<img
														src={product.image}
														alt={product.name}
														className="w-12 h-12 rounded-lg object-cover"
													/>
													<div className="flex-1 min-w-0">
														<p className="text-white font-medium truncate">{product.name}</p>
														<div className="flex items-center gap-2">
															<span className="text-cyan-400 text-sm font-semibold">₹{product.price}</span>
															{product.tags && product.tags.length > 0 && (
																<div className="flex gap-1">
																	{product.tags.slice(0, 2).map((tag) => (
																		<span key={tag} className="text-xs text-gray-400 bg-gray-700/50 px-1.5 py-0.5 rounded">
																			#{tag}
																		</span>
																	))}
																</div>
															)}
														</div>
													</div>
												</button>
											))}
										</div>
									) : (
										<div className="p-4 text-center text-gray-400">
											<p className="text-sm">No products found</p>
										</div>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					<nav className='flex flex-wrap items-center gap-3'>
						{/* Theme Toggle */}
						<ThemeToggle />

						{/* Navigation Links */}
						<Link
							to={"/"}
							className='text-gray-300 hover:text-cyan-400 transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800/50'
						>
							Home
						</Link>

						<Link
							to={"/about"}
							className='text-gray-300 hover:text-cyan-400 transition-all duration-200 font-medium px-3 py-2 rounded-lg hover:bg-gray-800/50'
						>
							About
						</Link>

						{/* Cart */}
						{user && (
							<Link
								to={"/cart"}
								className='relative group text-gray-300 hover:text-cyan-400 transition-all duration-200 px-3 py-2 rounded-lg hover:bg-gray-800/50'
							>
								<ShoppingCart className='inline-block mr-1' size={20} />
								<span className='hidden sm:inline'>Cart</span>
								{cart.length > 0 && (
									<motion.span
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className='absolute -top-1 -right-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-lg'
									>
										{cart.length}
									</motion.span>
								)}
							</Link>
						)}

						{/* Dashboard Button */}
						{user && (
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Link
									className='bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center gap-2 relative'
									to={"/dashboard"}
								>
									<LayoutDashboard size={18} />
									<span className='hidden sm:inline'>Dashboard</span>
									{pendingOffersCount > 0 && (
										<span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse shadow-sm border border-white/20'>
											{pendingOffersCount}
										</span>
									)}
								</Link>
							</motion.div>
						)}

						{/* Learning Desk Button */}
						{user && (
							<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
								<Link
									className='bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 flex items-center gap-2'
									to={"/learning-desk"}
								>
									<BookOpen size={18} />
									<span className="hidden sm:inline">Learning Desk</span>
								</Link>
							</motion.div>
						)}

						{/* Auth Buttons / Profile Dropdown */}
						{user ? (
							<div className="relative" ref={dropdownRef}>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className='bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-2 px-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md'
									onClick={() => setIsProfileOpen(!isProfileOpen)}
								>
									<div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
										<span className="text-white font-bold text-sm">
											{user.name?.charAt(0).toUpperCase() || "U"}
										</span>
									</div>
									<span className='hidden sm:inline'>{user.name}</span>
									<ChevronDown size={16} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
								</motion.button>

								<AnimatePresence>
									{isProfileOpen && (
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -10 }}
											transition={{ duration: 0.2 }}
											className="absolute right-0 mt-2 w-56 bg-gray-800/95 backdrop-blur-md border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50"
										>
											<div className="p-3 border-b border-gray-700">
												<p className="text-sm font-semibold text-white">{user.name}</p>
												<p className="text-xs text-gray-400">{user.email}</p>
											</div>
											<div className="py-2">
												<Link
													to="/profile"
													className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-cyan-400 transition-colors"
													onClick={() => setIsProfileOpen(false)}
												>
													<User size={18} />
													Your Profile
												</Link>
												<Link
													to="/dashboard?tab=create"
													className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-cyan-400 transition-colors"
													onClick={() => setIsProfileOpen(false)}
												>
													<PlusCircle size={18} />
													Create Product
												</Link>
												<button
													onClick={() => {
														setIsProfileOpen(false);
														logout();
													}}
													className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-red-400 transition-colors"
												>
													<LogOut size={18} />
													Logout
												</button>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						) : (
							<>
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Link
										to={"/signup"}
										className='bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium shadow-lg'
									>
										<UserPlus size={18} />
										<span className='hidden sm:inline'>Sign Up</span>
									</Link>
								</motion.div>
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Link
										to={"/login"}
										className='bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md'
									>
										<LogIn size={18} />
										<span className='hidden sm:inline'>Login</span>
									</Link>
								</motion.div>
							</>
						)}
					</nav>
				</div>
			</div>
		</header>
	);
};

export default Navbar;
