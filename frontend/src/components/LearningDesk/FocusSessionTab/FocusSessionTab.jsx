import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, RotateCcw, Plus, Trash2, Clock,
    Coffee, Zap, Target, TrendingUp, Award, Edit2, ArrowUp, ArrowDown, Check, PartyPopper, Flame, Trophy, BarChart3, ChevronRight
} from "lucide-react";
import toast from "react-hot-toast";
import { useFocusStore } from "../../../stores/useFocusStore";
import FocusAnalytics from "./FocusAnalytics";

const FocusSessionTab = () => {
    const {
        sessions, currentIndex, isRunning, sessionStats, isLoading,
        addSession, removeSession, updateSession, reorderSessions,
        setCurrentIndex, toggleTimer, resetTimer, setIsRunning, fetchSessions
    } = useFocusStore();

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDuration, setEditDuration] = useState("");

    const currentSession = sessions[currentIndex] || {};
    const nextSession = sessions[currentIndex + 1];

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const presets = [
        { label: "Quick Focus", duration: 15, icon: Zap, color: "from-blue-500 to-indigo-600", lightColor: "from-blue-50 to-indigo-50", textColor: "text-blue-600" },
        { label: "Deep Work", duration: 25, icon: Target, color: "from-emerald-500 to-teal-600", lightColor: "from-emerald-50 to-teal-50", textColor: "text-emerald-600" },
        { label: "Power Hour", duration: 60, icon: Award, color: "from-purple-500 to-indigo-600", lightColor: "from-purple-50 to-indigo-50", textColor: "text-purple-600" },
    ];

    const handleAddSession = (label, duration) => {
        addSession({
            id: Date.now(),
            label,
            duration,
            timeLeft: duration * 60,
            isRunning: false,
            completed: false
        });
        setShowAddForm(false);
        toast.success("Session added to queue");
    };

    const handlePresetClick = (preset) => {
        handleAddSession(preset.label, preset.duration);
    };

    const startEditing = (session) => {
        setEditingId(session.id);
        setEditName(session.label);
        setEditDuration(session.duration);
    };

    const saveEdit = (id) => {
        if (editName && editDuration) {
            updateSession(id, {
                label: editName,
                duration: parseInt(editDuration),
                timeLeft: parseInt(editDuration) * 60
            });
            setEditingId(null);
            toast.success("Session updated");
        }
    };

    const handleStartNext = () => {
        if (nextSession) {
            setCurrentIndex(currentIndex + 1);
            setIsRunning(true);
        }
    };

    const formatTime = (seconds) => {
        if (seconds < 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getProgress = () => {
        if (!currentSession.duration) return 0;
        return ((currentSession.duration * 60 - currentSession.timeLeft) / (currentSession.duration * 60)) * 100;
    };

    const isSessionComplete = currentSession?.completed && currentSession?.timeLeft === 0;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Main Action Hub */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Hero Timer Display */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-grid-slate-100/50 dark:bg-grid-slate-800/20"
                    >
                        {/* Decorative Blur */}
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-8 text-center">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {currentSession?.label || "Standby Mode"}
                                </h3>
                                <p className="text-slate-500 font-medium mt-2">
                                    {isRunning ? "Focus protocols active" : "Timer paused"}
                                </p>
                            </div>

                            {/* Elevated Circular UI */}
                            <div className="relative w-72 h-72 mb-12 transform group">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="144" cy="144" r="136"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                        fill="none"
                                        className="text-slate-100 dark:text-slate-800"
                                    />
                                    <motion.circle
                                        cx="144" cy="144" r="136"
                                        stroke="url(#timerGradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 136}`}
                                        strokeDashoffset={`${2 * Math.PI * 136 * (1 - getProgress() / 100)}`}
                                        strokeLinecap="round"
                                        className="transition-all duration-1000 ease-linear shadow-xl"
                                    />
                                    <defs>
                                        <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#6366f1" />
                                            <stop offset="100%" stopColor="#06b6d4" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <motion.div 
                                        key={currentSession?.timeLeft}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter"
                                    >
                                        {formatTime(currentSession?.timeLeft || 0)}
                                    </motion.div>
                                    <div className="mt-2 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        {currentSession?.duration ? `${currentSession.duration} MIN CAP` : "READY"}
                                    </div>
                                </div>
                            </div>

                            {/* Refined Controls */}
                            {isSessionComplete ? (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                                    <div className="flex items-center justify-center gap-3 mb-4">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-full text-emerald-600 shadow-xl shadow-emerald-500/10">
                                            <PartyPopper size={32} />
                                        </div>
                                    </div>
                                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Protocol Successful</h4>
                                    <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">You've successfully completed your focus block.</p>
                                    {nextSession && (
                                        <button onClick={handleStartNext} className="group px-8 py-4 bg-primary-600 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20 flex items-center gap-3 hover:scale-105 transition-all">
                                            Next Session <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="flex items-center gap-6">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={resetTimer}
                                        className="p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm transition-all"
                                    >
                                        <RotateCcw size={28} />
                                    </motion.button>
                                    
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={toggleTimer}
                                        disabled={!currentSession?.id}
                                        className="w-24 h-24 bg-primary-600 hover:bg-primary-500 text-white rounded-[2.5rem] shadow-2xl shadow-primary-500/30 flex items-center justify-center disabled:opacity-30 disabled:grayscale transition-all"
                                    >
                                        {isRunning ? <Pause size={40} className="fill-current" /> : <Play size={40} className="fill-current ml-2" />}
                                    </motion.button>

                                    <div className="w-16 h-16 flex items-center justify-center text-slate-400 opacity-20">
                                        <Zap size={32} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Quick Access Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {presets.map((p, i) => (
                            <motion.button
                                key={p.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                onClick={() => handlePresetClick(p)}
                                className="relative overflow-hidden group p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-left hover:border-primary-500/50 transition-all shadow-sm"
                            >
                                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    <p.icon size={24} />
                                </div>
                                <h5 className="font-black text-slate-900 dark:text-white tracking-tight">{p.label}</h5>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{p.duration} Minutes</p>
                            </motion.button>
                        ))}
                    </div>

                    <FocusAnalytics />
                </div>

                {/* Status Column */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Integrated Analytics Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-primary-100 dark:bg-primary-900/20 rounded-2xl text-primary-600">
                                <TrendingUp size={20} />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Performance</h4>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Sessions</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white text-center">{sessionStats.totalSessions}</p>
                            </div>
                            <div className="p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Focus Time</p>
                                <p className="text-2xl font-black text-primary-600 text-center">{sessionStats.totalHours}H</p>
                            </div>
                            <div className="p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center">
                                <Flame size={16} className="text-orange-500 mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Streak</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{sessionStats.currentStreak}</p>
                            </div>
                            <div className="p-5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center">
                                <Trophy size={16} className="text-amber-500 mb-2" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">Rank 4</p>
                            </div>
                        </div>
                    </div>

                    {/* Operational Queue */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm h-fit">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-purple-100 dark:bg-purple-900/20 rounded-2xl text-purple-600">
                                    <Clock size={20} />
                                </div>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Focus Queue</h4>
                            </div>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl hover:bg-primary-600 hover:text-white transition-all border border-slate-200 dark:border-slate-700"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showAddForm && (
                                <motion.form
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        if (editName && editDuration) {
                                            handleAddSession(editName, parseInt(editDuration));
                                            setEditName("");
                                            setEditDuration("");
                                        }
                                    }}
                                    className="mb-6 space-y-4 overflow-hidden"
                                >
                                    <input
                                        type="text"
                                        placeholder="Session Label"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Duration (minutes)"
                                        value={editDuration}
                                        onChange={(e) => setEditDuration(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                                        min="1"
                                        max="120"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-primary-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary-500 transition-all"
                                    >
                                        Add to Queue
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="space-y-3">
                            {sessions.map((s, idx) => (
                                <motion.div
                                    key={s.id}
                                    className={`relative group p-4 rounded-3xl border transition-all ${currentIndex === idx ? "bg-primary-50/50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800" : "bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800"}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 cursor-pointer" onClick={() => setCurrentIndex(idx)}>
                                            <p className={`font-black tracking-tight ${currentIndex === idx ? "text-primary-600" : "text-slate-900 dark:text-white"}`}>
                                                {s.label}
                                            </p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                {s.duration} MIN BLOCK
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => removeSession(s.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    {currentIndex === idx && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-600 rounded-r-full" />
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FocusSessionTab;
