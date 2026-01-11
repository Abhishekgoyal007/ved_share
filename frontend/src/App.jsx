import { Navigate, Route, Routes, useLocation } from "react-router-dom";

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
	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

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
		<div className='min-h-screen bg-gray-900 dark:bg-gray-900 light:bg-gray-50 text-white dark:text-white light:text-gray-900 relative overflow-hidden transition-colors duration-300'>
			{/* Background gradient */}
			<div className='fixed inset-0 z-0'>
				<div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 light:from-gray-50 light:via-white light:to-gray-100 opacity-80' />
				<div className='absolute top-0 left-1/2 -translate-x-1/2 w-full h-full'>
					<div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)] opacity-0' /> {/* Remove old green */}
					<div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 light:bg-cyan-500/5 blur-[120px]" />
					<div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 dark:bg-blue-600/10 light:bg-blue-500/5 blur-[120px]" />
				</div>
			</div>


			<div className='relative z-50 pt-20'>
				<Navbar />

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

				<Footer />
			</div>
			<GlobalFocusTimer />
			<Toaster />


		</div>

	);
}

export default App;
