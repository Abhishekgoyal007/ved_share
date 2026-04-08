import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Send, Linkedin, BookOpen, Heart, Github, Twitter } from "lucide-react";
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
    }, 4000);
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
      toast.success("Message sent successfully!");
      setMessage("");
      setType("feedback");
    } catch (error) {
      toast.error("Failed to send message.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 mb-20">
          
          {/* Brand Identity */}
          <div className="md:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
                <img src="/logo.png" alt="" className="h-12 w-12 object-contain" />
              <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">VedShare</span>
            </Link>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              The premier marketplace for academic resources. We connect students across the globe to make learning materials more accessible and sustainable.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><Github size={20}/></a>
              <a href="#" className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><Twitter size={20}/></a>
              <a href="#" className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"><Linkedin size={20}/></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-widest mb-6">Platform</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li><Link to="/" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">Marketplace</Link></li>
              <li><Link to="/learning-desk" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">Learning Desk</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">Our Mission</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-widest mb-6">Development</h3>
            <div className="space-y-4 text-sm font-medium">
                <a href="https://linkedin.com/in/creator3" target="_blank" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" /> Krish Jain
                </a>
                <a href="https://linkedin.com/in/creator3" target="_blank" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" /> Niharika Ravi Kumar
                </a>
                <a href="https://linkedin.com/in/creator3" target="_blank" className="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" /> Abhishek Goyal
                </a>
            </div>
          </div>

          {/* Support/Contact */}
          <div className="md:col-span-3">
            <h3 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-widest mb-6">Feedback</h3>
            {user ? (
               <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <select 
                    value={type} 
                    onChange={(e) => setType(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-[10px] font-bold uppercase outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="feedback">Feed</option>
                    <option value="bug">Bug</option>
                    <option value="feature">Idea</option>
                  </select>
                  <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mind sharing a thought?"
                    className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 dark:text-white"
                  />
                  <button 
                    disabled={submitting || !message.trim()}
                    className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500 disabled:opacity-50 transition-colors"
                  >
                    <Send size={16}/>
                  </button>
                </div>
                <div className="h-4 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={rotatingTexts[currentTextIndex]}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      className="text-[10px] text-slate-400 font-bold uppercase tracking-tight"
                    >
                      {rotatingTexts[currentTextIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
               </form>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-900 p-4 rounded-xl font-medium">
                Log in to provide feedback and help us improve.
              </p>
            )}
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest group">
            Made with <Heart size={14} className="text-red-500 group-hover:scale-125 transition-transform" /> for Students
          </div>
          <div className="flex gap-8 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
