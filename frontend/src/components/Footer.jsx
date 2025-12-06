import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Send, Linkedin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


const Footer = () => {
  const { user } = useUserStore();
  const [message, setMessage] = useState("");
  const [type, setType] = useState("feedback");
  const [submitting, setSubmitting] = useState(false);

  const rotatingTexts = [
    "General Feedback",
    "Suggest a Feature",
    "Report a Bug",
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    setSubmitting(true);
    try {
      await axios.post("/feedback", { type, message });
      toast.success("Message sent!");
      setMessage("");
      setType("feedback");
    } catch (error) {
      toast.error("Failed to send Message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300 border-t border-gray-800/50 py-16 font-sans">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

          {/* Section 1: Brand & Info */}
          <div className="md:col-span-4 space-y-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              VedShare 📚
            </h2>
            <p className="text-gray-400 leading-relaxed">
              Buy, Sell & Learn — all in one platform. <br />
              Empowering students to share knowledge and resources efficiently.
            </p>
            <p className="text-sm text-gray-500">
              Built with ❤️ by students, for students.
            </p>
          </div>

          {/* Section 2: Links */}
          <div className="md:col-span-3 md:col-start-6">
            <h3 className="text-white font-semibold text-lg mb-6">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/" className="hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2">Dashboard</Link></li>
              <li><Link to="/learning-desk" className="hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2">Learning Desk</Link></li>
              <li><Link to="/about" className="hover:text-cyan-400 transition-colors duration-300 flex items-center gap-2">About Us</Link></li>
            </ul>
          </div>

          {/* Section 3: Creators */}
          <div className="md:col-span-3">
            <h3 className="text-white font-semibold text-lg mb-6">Connect with Creators</h3>
            <div className="space-y-4">
              <a href="https://www.linkedin.com/in/creator1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-cyan-500/20 transition-colors">
                  <Linkedin size={18} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span className="group-hover:text-white transition-colors">Krish Jain</span>
              </a>
              <a href="https://www.linkedin.com/in/creator2" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-cyan-500/20 transition-colors">
                  <Linkedin size={18} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span className="group-hover:text-white transition-colors">Niharika Ravi Kumar</span>
              </a>
              <a href="https://www.linkedin.com/in/creator3" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                <div className="p-2 bg-gray-800 rounded-full group-hover:bg-cyan-500/20 transition-colors">
                  <Linkedin size={18} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span className="group-hover:text-white transition-colors">Abhishek Goyal</span>
              </a>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        {user && (
          <div className="border-t border-gray-800/50 pt-12">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">We value your feedback</h3>
                <div className="h-6 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={rotatingTexts[currentTextIndex]}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute w-full text-sm text-cyan-400"
                    >
                      {rotatingTexts[currentTextIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-lg p-1 focus-within:border-cyan-500/50 transition-colors">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="bg-transparent text-gray-300 text-sm px-4 py-3 border-r border-gray-700/50 outline-none cursor-pointer hover:text-white transition-colors"
                  >
                    <option value="feedback" className="bg-gray-900">Feedback</option>
                    <option value="bug" className="bg-gray-900">Bug Report</option>
                    <option value="feature" className="bg-gray-900">Feature Request</option>
                  </select>

                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 bg-transparent text-white text-sm px-4 py-3 focus:outline-none placeholder-gray-500"
                  />

                  <button
                    type="submit"
                    disabled={submitting || !message.trim()}
                    className="px-6 py-2 m-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} VedShare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
