import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Play, Pause, RotateCcw, Plus, Trash2, Clock,
    Coffee, Zap, Target, TrendingUp, Award
} from "lucide-react";
import toast from "react-hot-toast";

const FocusSessionTab = () => {
    const [sessions, setSessions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [sessionStats, setSessionStats] = useState({
        totalSessions: 0,
        totalMinutes: 0,
        streak: 0
    });

    const timerRef = useRef(null);
    const currentSession = sessions[currentIndex] || {};
    const isRunning = currentSession?.isRunning;

    // Preset durations
    const presets = [
        { label: "Quick Focus", duration: 15, icon: Zap, color: "from-yellow-500 to-orange-500" },
        { label: "Deep Work", duration: 25, icon: Target, color: "from-emerald-500 to-cyan-500" },
        { label: "Power Hour", duration: 60, icon: Award, color: "from-purple-500 to-pink-500" },
    ];

    // Timer tick effect
    useEffect(() => {
        if (currentIndex === null || !isRunning) {
            clearInterval(timerRef.current);
            return;
        }

        timerRef.current = setInterval(() => {
            setSessions((prev) => {
                return prev.map((session, idx) => {
                    if (idx === currentIndex) {
                        if (session.timeLeft > 0) {
                            return { ...session, timeLeft: session.timeLeft - 1 };
                        } else {
                            clearInterval(timerRef.current);
                            toast.success(`🎉 ${session.label} completed!`, {
                                duration: 4000,
                                icon: "✅"
                            });
                            // Update stats
                            setSessionStats(prev => ({
                                totalSessions: prev.totalSessions + 1,
                                totalMinutes: prev.totalMinutes + session.duration,
                                streak: prev.streak + 1
                            }));
                            return { ...session, isRunning: false, completed: true };
                        }
                    }
                    return session;
                });
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [currentIndex, isRunning]);

    const toggleSessionRunning = (index) => {
        setSessions((prev) =>
            prev.map((s, i) =>
                i === index
                    ? { ...s, isRunning: !s.isRunning }
                    : { ...s, isRunning: false }
            )
        );
        setCurrentIndex(index);
    };

    const handleReset = () => {
        clearInterval(timerRef.current);
        setSessions((prev) =>
            prev.map((s) => ({
                ...s,
                timeLeft: s.duration * 60,
                isRunning: false,
                completed: false
            }))
        );
        setCurrentIndex(null);
    };

    const handleDeleteSession = (indexToDelete) => {
        setSessions((prev) => {
            const updated = prev.filter((_, idx) => idx !== indexToDelete);

            if (currentIndex === indexToDelete) {
                setCurrentIndex(updated.length ? 0 : null);
            } else if (indexToDelete < currentIndex) {
                setCurrentIndex((prev) => prev - 1);
            }

            return updated;
        });
    };

    const handleStop = () => {
        clearInterval(timerRef.current);
        setSessions((prev) => prev.map((s) => ({ ...s, isRunning: false })));
    };

    const handleAddSession = (label, duration) => {
        setSessions((prev) => [
            ...prev,
            {
                id: Date.now(),
                label,
                duration,
                timeLeft: duration * 60,
                isRunning: false,
                completed: false
            },
        ]);
        setShowAddForm(false);
        if (currentIndex === null) setCurrentIndex(0);
    };

    const handlePresetClick = (preset) => {
        handleAddSession(preset.label, preset.duration);
        toast.success(`${preset.label} session added!`);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    const getProgress = () => {
        if (!currentSession.duration) return 0;
        return ((currentSession.duration * 60 - currentSession.timeLeft) / (currentSession.duration * 60)) * 100;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Focus Sessions
                </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Timer Section */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Timer Display */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl"
                    >
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold text-white mb-6">
                                {currentSession?.label || "No Active Session"}
                            </h3>

                            {/* Circular Progress */}
                            <div className="relative w-64 h-64 mx-auto mb-8">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="120"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-gray-700"
                                    />
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="120"
                                        stroke="url(#gradient)"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 120}`}
                                        strokeDashoffset={`${2 * Math.PI * 120 * (1 - getProgress() / 100)}`}
                                        className="transition-all duration-1000 ease-linear"
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#06b6d4" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-6xl font-bold text-white mb-2">
                                            {formatTime(currentSession?.timeLeft || 0)}
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                            {currentSession?.duration ? `${currentSession.duration} min session` : "Select a session"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="flex justify-center gap-4">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => currentIndex !== null && toggleSessionRunning(currentIndex)}
                                    disabled={currentIndex === null}
                                    className="p-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRunning ? <Pause size={24} /> : <Play size={24} />}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleReset}
                                    className="p-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full shadow-lg"
                                >
                                    <RotateCcw size={24} />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Presets */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Zap size={20} className="text-cyan-400" />
                            Quick Start
                        </h3>
                        <div className="grid grid-cols-3 gap-4">
                            {presets.map((preset) => (
                                <motion.button
                                    key={preset.label}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handlePresetClick(preset)}
                                    className={`p-4 bg-gradient-to-br ${preset.color} rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-shadow`}
                                >
                                    <preset.icon className="mx-auto mb-2" size={24} />
                                    <div className="text-sm">{preset.label}</div>
                                    <div className="text-xs opacity-90">{preset.duration} min</div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-emerald-400" />
                            Your Progress
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Total Sessions</div>
                                <div className="text-2xl font-bold text-white">{sessionStats.totalSessions}</div>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Total Focus Time</div>
                                <div className="text-2xl font-bold text-cyan-400">{sessionStats.totalMinutes} min</div>
                            </div>
                            <div className="bg-gray-700/50 rounded-lg p-4">
                                <div className="text-gray-400 text-sm mb-1">Current Streak</div>
                                <div className="text-2xl font-bold text-emerald-400">{sessionStats.streak} 🔥</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Session Queue */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Clock size={20} className="text-purple-400" />
                                Session Queue
                            </h3>
                            <button
                                onClick={() => setShowAddForm(!showAddForm)}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Add Session Form */}
                        <AnimatePresence>
                            {showAddForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600"
                                >
                                    <input
                                        type="text"
                                        placeholder="Session name"
                                        id="session-name"
                                        className="w-full mb-2 px-3 py-2 bg-gray-600 text-white rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Duration (minutes)"
                                        id="session-duration"
                                        min="1"
                                        className="w-full mb-3 px-3 py-2 bg-gray-600 text-white rounded-lg outline-none focus:ring-2 focus:ring-cyan-500"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                const name = document.getElementById("session-name").value;
                                                const duration = parseInt(document.getElementById("session-duration").value);
                                                if (name && duration) {
                                                    handleAddSession(name, duration);
                                                    document.getElementById("session-name").value = "";
                                                    document.getElementById("session-duration").value = "";
                                                } else {
                                                    toast.error("Please fill in all fields");
                                                }
                                            }}
                                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
                                        >
                                            Add
                                        </button>
                                        <button
                                            onClick={() => setShowAddForm(false)}
                                            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Session List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {sessions.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <Coffee size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="text-sm">No sessions yet.</p>
                                    <p className="text-xs mt-1">Add a session to get started!</p>
                                </div>
                            ) : (
                                sessions.map((session, idx) => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all ${currentIndex === idx
                                                ? "bg-cyan-500/20 border-cyan-500/50"
                                                : "bg-gray-700/50 border-gray-600 hover:border-gray-500"
                                            } ${session.completed ? "opacity-60" : ""}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white font-medium">{session.label}</span>
                                                    {session.completed && <span className="text-xs text-emerald-400">✓</span>}
                                                </div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {session.duration} min • {formatTime(session.timeLeft)} left
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteSession(idx);
                                                }}
                                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default FocusSessionTab;
