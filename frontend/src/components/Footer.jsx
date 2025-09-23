import { Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import toast from "react-hot-toast";
import { Send } from "lucide-react";
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
    <footer className="bg-black text-gray-300 border-t border-gray-800 py-10">
<div className="max-w-7xl mx-auto px-4 flex justify-center  text-center sm:text-left sm:divide-x divide-white/10">

        {/* Section 1: Site Links */}
       <div className="col-span-12 sm:col-span-3 sm:px-6 justify-center text-center">
          <h2 className="text-cyan-400 text-lg font-semibold mb-4">Important Links</h2>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
            <li><Link to="/learning-desk" className="hover:text-white transition">Learning Desk</Link></li>
            <li><Link to="/about" className="hover:text-white transition">About</Link></li>
          </ul>
        </div>

        {/* Section 2: Creators */}
      <div className="col-span-12 sm:col-span-5 sm:px-6 ">
  <h2 className="text-cyan-400 text-lg font-semibold mb-4 text-center">Creators</h2>
  <div className="flex justify-center text-center gap-x-6 gap-y-2 text-sm">
    <a
      href="https://www.linkedin.com/in/creator1"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white transition"
    >
      Krish Jain
    </a>
    <span className="text-gray-500">|</span>
    <a
      href="https://www.linkedin.com/in/creator2"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white transition"
    >
      Niharika Ravi <br />Kumar
    </a>
    <span className="text-gray-500">|</span>
    <a
      href="https://www.linkedin.com/in/creator3"
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-white transition"
    >
      Abhishek <br />Goyal
    </a>
    {/* Add more if needed */}
  </div>
</div>

        {/* Section 3: Platform Info */}
        <div className="col-span-12 sm:col-span-4 justify-center text-center sm:px-6">
          <h2 className="text-cyan-400 text-lg font-semibold mb-4">VedShare 📚</h2>
          <p className="text-sm text-gray-400">
            Buy, Sell & Learn <br />— all in one platform.
            </p> 
            <p className="text-sm text-gray-400 mt-6">
            Built with ❤️ by students,<br /> for students.
          </p>
        </div>
      </div>

      {/* Feedback Form (only for logged-in users) */}
{user && (
  <div className="max-w-4xl mx-auto mt-10 px-4 text-center">
    <h2 className="text-cyan-400 text-lg font-semibold mb-2">Talk to us!!</h2>

    <div className="relative h-6 overflow-hidden mb-4">
      <AnimatePresence mode="wait">
        <motion.p
          key={rotatingTexts[currentTextIndex]}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute w-full text-sm text-gray-400"
        >
          {rotatingTexts[currentTextIndex]}
        </motion.p>
      </AnimatePresence>
    </div>

    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-gray-800 border border-gray-700 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-cyan-500 transition"
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="bg-gray-800 text-white text-sm px-4 py-2 border-r border-gray-700 outline-none cursor-pointer"
      >
        <option value="feedback">General Feedback</option>
        <option value="bug">Report a Bug</option>
        <option value="feature">Suggest a Feature</option>
      </select>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your message here..."
        className="flex-1 bg-transparent text-white text-sm px-4 py-2 focus:outline-none placeholder-gray-400"
      />

      <button
        type="submit"
        disabled={submitting || !message.trim()}
        className="px-4 py-2 text-cyan-400 hover:text-cyan-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        aria-label="Send feedback"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  </div>
)}


      {/* Copyright */}
      <div className="mt-10 text-center text-xs text-gray-500 border-t border-gray-800 pt-4">
        © {new Date().getFullYear()} VedShare. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
