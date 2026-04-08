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
	const { searchProducts, searchResults, searchLoading, clearSearchResults } = useProductStore();
	const navigate = useNavigate();

	const [searchQuery, setSearchQuery] = useState("");
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const searchRef = useRef(null);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const dropdownRef = useRef(null);

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
		<header className='fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg z-50 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4'>
				{/* Logo */}
				<Link to='/' className="flex items-center gap-2 group shrink-0">
					<img src="/logo.png" alt="VedShare" className="h-14 w-14 object-contain" />
					<span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
						VedShare
					</span>
				</Link>

				{/* Search Bar - Center */}
				<div className="relative flex-1 max-w-md hidden md:block" ref={searchRef}>
					<div className="relative group">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors w-4 h-4" />
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setIsSearchOpen(true);
							}}
							onFocus={() => setIsSearchOpen(true)}
							placeholder="Search resources..."
							className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
						/>
						{searchQuery && (
							<button
								onClick={() => {
									setSearchQuery("");
									clearSearchResults();
								}}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
							>
								<X size={14} />
							</button>
						)}
					</div>

					{/* Search Results */}
					<AnimatePresence>
						{isSearchOpen && searchQuery.length >= 2 && (
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50"
							>
								{searchLoading ? (
									<div className="p-8 text-center">
										<div className="animate-spin w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
									</div>
								) : searchResults.length > 0 ? (
									<div className="py-2">
										{searchResults.map((product) => (
											<button
												key={product._id}
												onClick={() => handleSearchSelect(product._id)}
												className="w-full flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
											>
												<img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-800" />
												<div className="flex-1 min-w-0">
													<p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{product.name}</p>
													<p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">₹{product.price}</p>
												</div>
											</button>
										))}
									</div>
								) : (
									<div className="p-8 text-center text-slate-500 text-sm">
										No resources found for "{searchQuery}"
									</div>
								)}
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Actions - Right */}
				<div className="flex items-center gap-2 sm:gap-4 shrink-0">
					<nav className="hidden lg:flex items-center gap-1">
						<Link to="/" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Home</Link>
						<Link to="/about" className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">About</Link>
					</nav>

					<div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 hidden lg:block" />

					<ThemeToggle />

					{user && (
						<Link to="/cart" className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
							<ShoppingCart size={20} />
							{cart.length > 0 && (
								<span className="absolute top-0 right-0 bg-primary-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-950">
									{cart.length}
								</span>
							)}
						</Link>
					)}

					{user ? (
						<div className="relative" ref={dropdownRef}>
							<button
								onClick={() => setIsProfileOpen(!isProfileOpen)}
								className="flex items-center gap-2 p-1 pl-1 pr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
							>
								<div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xs">
									{user.name?.charAt(0).toUpperCase()}
								</div>
								<ChevronDown size={14} className={`text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
							</button>

							<AnimatePresence>
								{isProfileOpen && (
									<motion.div
										initial={{ opacity: 0, scale: 0.95, y: 10 }}
										animate={{ opacity: 1, scale: 1, y: 0 }}
										exit={{ opacity: 0, scale: 0.95, y: 10 }}
										className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50"
									>
										<div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
											<p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
											<p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
										</div>
										<Link to="/dashboard" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
											<LayoutDashboard size={16} /> Dashboard
										</Link>
										<Link to="/learning-desk" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
											<BookOpen size={16} /> Learning Desk
										</Link>
										<Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
											<User size={16} /> Profile Settings
										</Link>
										<div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-2" />
										<button onClick={() => { setIsProfileOpen(false); logout(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
											<LogOut size={16} /> Sign Out
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>
					) : (
						<div className="flex items-center gap-2">
							<Link to="/login" className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors hidden sm:block">Sign In</Link>
							<Link to="/signup" className="px-4 py-2 text-xs sm:text-sm font-semibold bg-primary-600 text-white rounded-full hover:bg-primary-500 transition-all shadow-md shadow-primary-500/20 active:scale-95">Get Started</Link>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Navbar;
