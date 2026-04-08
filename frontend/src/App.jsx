import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useTheme } from "./stores/useThemeStore";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import CategoryPage from "./pages/CategoryPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";

import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import CartPage from "./pages/CartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import LearningDeskPage from "./pages/LearningDeskPage";
import AboutPage from "./pages/AboutPage";
import ProfilePage from "./pages/ProfilePage";
import KeywordExtractorPage from "./pages/KeywordExtractorPage";
import InterviewSharedPage from "./pages/InterviewSharedPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import UPIPaymentPage from "./pages/UPIPaymentPage";
import Footer from './components/Footer';
import GlobalFocusTimer from "./components/GlobalFocusTimer";

function App() {
	const { user, checkAuth, checkingAuth } = useUserStore();
	const { getCartItems } = useCartStore();
	const { theme } = useTheme();
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		const root = window.document.documentElement;
		if (theme === 'dark') {
			root.classList.add('dark');
		} else {
			root.classList.remove('dark');
		}
	}, [theme]);

	useEffect(() => {
		if (!user) return;

		getCartItems();
	}, [getCartItems, user]);

	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	if (checkingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen bg-white transition-colors duration-300 select-none dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-primary-200 dark:selection:bg-primary-900/40 relative'>
			{/* Professional background element */}
			<div className='fixed inset-0 z-0 pointer-events-none'>
				<div className='absolute inset-0 bg-slate-50 dark:bg-[#020617]' />
				<div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.03),transparent_40%)]' />
				<div className='absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(6,182,212,0.03),transparent_40%)]' />
			</div>

			<div className='relative z-10 flex flex-col min-h-screen'>
				<Navbar />
				
				<main className='flex-grow pt-24 pb-12'>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/about' element={<AboutPage />} />
						<Route path='/signup' element={!user ? <SignUpPage /> : <Navigate to='/' />} />
						<Route path='/login' element={!user ? <LoginPage /> : <Navigate to='/' />} />
						<Route path='/verify-otp' element={<EmailVerificationPage />} />
						<Route path='/forgot-password' element={<ForgotPasswordPage />} />
						<Route path='/reset-password/:token' element={<ResetPasswordPage />} />
						<Route
							path='/dashboard'
							element={user ? <DashboardPage /> : <Navigate to='/login' />}
						/>
						<Route
							path='/learning-desk'
							element={user ? <LearningDeskPage /> : <Navigate to='/login' />}
						/>
						<Route
							path='/keyword-extractor'
							element={user ? <KeywordExtractorPage /> : <Navigate to='/login' />}
						/>
						<Route
							path='/profile'
							element={user ? <ProfilePage /> : <Navigate to='/login' />}
						/>
						<Route path='/interview/:id' element={<InterviewSharedPage />} />
						<Route path='/product/:id' element={<ProductDetailsPage />} />
						<Route path='/category/:category' element={<CategoryPage />} />
						<Route path='/cart' element={user ? <CartPage /> : <Navigate to='/login' />} />
						<Route
							path='/purchase-success'
							element={user ? <PurchaseSuccessPage /> : <Navigate to='/login' />}
						/>
						<Route path='/purchase-cancel' element={user ? <PurchaseCancelPage /> : <Navigate to='/login' />} />
						<Route path='/upi-payment' element={user ? <UPIPaymentPage /> : <Navigate to='/login' />} />
					</Routes>
				</main>

				<Footer />
			</div>

			<GlobalFocusTimer />
			<Toaster position="bottom-right" />
		</div>
	);
}

export default App;
