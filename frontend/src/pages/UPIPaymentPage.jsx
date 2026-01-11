import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import { Copy, Check, Clock, ArrowLeft, QrCode, Smartphone, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import axios from "../lib/axios";
import toast from "react-hot-toast";

const UPI_ID = "vedshare@paytm"; // Your business UPI ID
const PAYMENT_EXPIRY_MINUTES = 10;

const UPIPaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { total, cart, coupon, clearCart } = useCartStore();

    const [copied, setCopied] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, verifying, success, failed
    const [timeLeft, setTimeLeft] = useState(PAYMENT_EXPIRY_MINUTES * 60);
    const [transactionId, setTransactionId] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Countdown timer
    useEffect(() => {
        if (timeLeft <= 0 || paymentStatus === "success") return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setPaymentStatus("expired");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, paymentStatus]);

    // Generate QR Code URL with amount
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        `upi://pay?pa=${UPI_ID}&pn=VedShare&am=${total.toFixed(2)}&cu=INR&tn=VedShare_Order`
    )}`;

    // Generate UPI deep links for payment apps
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=VedShare&am=${total.toFixed(2)}&cu=INR&tn=VedShare_Order`;

    const handleCopyUPI = () => {
        navigator.clipboard.writeText(UPI_ID);
        setCopied(true);
        toast.success("UPI ID copied!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerifyPayment = async () => {
        if (!transactionId.trim()) {
            toast.error("Please enter the UPI Transaction ID");
            return;
        }

        setIsVerifying(true);
        setPaymentStatus("verifying");

        try {
            const res = await axios.post("/payments/upi", {
                products: cart,
                couponCode: coupon ? coupon.code : null,
                upiId: UPI_ID,
                transactionId: transactionId.trim(),
            });

            if (res.data.success) {
                setPaymentStatus("success");
                toast.success("Payment verified successfully!");
                clearCart();

                // Redirect to success page after a short delay
                setTimeout(() => {
                    navigate(`/purchase-success?session_id=${res.data.orderId}&source=upi`);
                }, 2000);
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            setPaymentStatus("failed");
            toast.error(error.response?.data?.message || "Payment verification failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleBack = () => {
        navigate("/cart");
    };

    // If no cart items, redirect
    useEffect(() => {
        if (!cart || cart.length === 0) {
            navigate("/cart");
        }
    }, [cart, navigate]);

    if (!cart || cart.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-white">Complete Your Payment</h1>
                    <p className="text-gray-400 mt-2">Pay securely using any UPI app</p>
                </motion.div>

                {/* Payment Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gray-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Amount Header */}
                    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-cyan-100 text-sm font-medium">Amount to Pay</p>
                                <p className="text-3xl font-bold text-white">₹{total.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                                <Clock size={18} />
                                <span className={`font-mono text-lg ${timeLeft < 60 ? "text-red-400" : ""}`}>
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="p-6 space-y-8">
                        {paymentStatus === "success" ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center py-8"
                            >
                                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Payment Successful!</h3>
                                <p className="text-gray-400 mt-2">Redirecting to order confirmation...</p>
                            </motion.div>
                        ) : paymentStatus === "expired" ? (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center py-8"
                            >
                                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                                    <AlertCircle className="w-12 h-12 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Payment Expired</h3>
                                <p className="text-gray-400 mt-2">Please go back and try again</p>
                                <button
                                    onClick={handleBack}
                                    className="mt-4 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                >
                                    Return to Cart
                                </button>
                            </motion.div>
                        ) : (
                            <>
                                {/* QR Code Section */}
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="bg-white p-4 rounded-2xl shadow-lg">
                                            <img
                                                src={qrCodeUrl}
                                                alt="UPI QR Code"
                                                className="w-56 h-56"
                                            />
                                        </div>
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-1.5 rounded-full">
                                            <QrCode className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-gray-300 mt-6 text-center">
                                        Scan the QR code with any UPI app to pay
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-700"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-gray-800/60 text-gray-400">or pay using UPI ID</span>
                                    </div>
                                </div>

                                {/* UPI ID Section */}
                                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4">
                                    <p className="text-sm text-gray-400 mb-2">UPI ID</p>
                                    <div className="flex items-center justify-between gap-3">
                                        <code className="text-lg font-mono text-cyan-400 bg-gray-800 px-4 py-2 rounded-lg flex-1">
                                            {UPI_ID}
                                        </code>
                                        <button
                                            onClick={handleCopyUPI}
                                            className={`p-3 rounded-lg transition-all ${copied
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-gray-700 hover:bg-gray-600 text-white"
                                                }`}
                                        >
                                            {copied ? <Check size={20} /> : <Copy size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Pay Apps */}
                                <div>
                                    <p className="text-sm text-gray-400 mb-3 text-center">Quick pay with</p>
                                    <div className="grid grid-cols-3 gap-3">
                                        <a
                                            href={upiLink}
                                            className="flex flex-col items-center gap-2 p-4 bg-gray-700/30 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 hover:border-cyan-500/30 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">G</span>
                                            </div>
                                            <span className="text-sm text-gray-300 group-hover:text-white">GPay</span>
                                        </a>
                                        <a
                                            href={upiLink}
                                            className="flex flex-col items-center gap-2 p-4 bg-gray-700/30 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 hover:border-cyan-500/30 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">Pe</span>
                                            </div>
                                            <span className="text-sm text-gray-300 group-hover:text-white">PhonePe</span>
                                        </a>
                                        <a
                                            href={upiLink}
                                            className="flex flex-col items-center gap-2 p-4 bg-gray-700/30 border border-gray-700/50 rounded-xl hover:bg-gray-700/50 hover:border-cyan-500/30 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">Pm</span>
                                            </div>
                                            <span className="text-sm text-gray-300 group-hover:text-white">Paytm</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Transaction ID Input */}
                                <div className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Enter UPI Transaction ID / Reference Number
                                        </label>
                                        <input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="e.g., 312456789012"
                                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            You can find this in your UPI app after successful payment
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleVerifyPayment}
                                        disabled={isVerifying || !transactionId.trim()}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-900/20"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <RefreshCw className="w-5 h-5 animate-spin" />
                                                Verifying Payment...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" />
                                                I've Made the Payment
                                            </>
                                        )}
                                    </button>
                                </div>

                                {paymentStatus === "failed" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                        <p className="text-sm text-red-300">
                                            Verification failed. Please check the transaction ID and try again, or contact support if the issue persists.
                                        </p>
                                    </motion.div>
                                )}

                                {/* Info */}
                                <div className="flex items-start gap-3 p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                                    <Smartphone className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gray-300">
                                        After completing the payment in your UPI app, enter the Transaction ID above and click "I've Made the Payment" to confirm your order.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* Order Summary Mini */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4"
                >
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Order Summary</h3>
                    <div className="space-y-2">
                        {cart.map((item) => (
                            <div key={item._id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-300 truncate max-w-[200px]">
                                    {item.name} × {item.quantity}
                                </span>
                                <span className="text-white font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="border-t border-gray-700 pt-2 flex items-center justify-between">
                            <span className="font-medium text-white">Total</span>
                            <span className="font-bold text-cyan-400">₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UPIPaymentPage;
