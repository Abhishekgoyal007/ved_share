import { useEffect, useRef } from "react";
import { useFocusStore } from "../stores/useFocusStore";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Play, PartyPopper, CheckCircle } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

const GlobalFocusTimer = () => {
    const {
        sessions, currentIndex, isRunning,
        tick, setIsRunning, toggleTimer, setCurrentIndex, completeSession
    } = useFocusStore();

    const navigate = useNavigate();
    const location = useLocation();
    const timerRef = useRef(null);

    const currentSession = currentIndex !== null ? sessions[currentIndex] : null;

    // Hide badge only when on Learning Desk AND Focus Session tab is active
    const isLearningDesk = location.pathname === "/learning-desk";
    const hash = location.hash.replace("#", "");
    const isFocusSessionTab = hash === "focus" || (!hash && isLearningDesk); // Default tab is focus
    const shouldHideBadge = isLearningDesk && isFocusSessionTab;

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                // Call tick first to update time and stats
                tick();

                const state = useFocusStore.getState();
                const current = state.sessions[state.currentIndex];

                // Check if session just completed (timeLeft is now 0 after tick)
                if (current && current.timeLeft === 0 && current.completed) {
                    setIsRunning(false);
                    clearInterval(timerRef.current);

                    // Record session completion in history
                    completeSession(current.label, current.duration);

                    // Play Alarm (Longer sound)
                    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg");
                    audio.play().catch(e => console.error("Audio play failed", e));

                    // Check for next session
                    const nextIndex = state.currentIndex + 1;
                    const nextSession = state.sessions[nextIndex];

                    if (nextSession) {
                        toast((t) => (
                            <div className="flex flex-col gap-3 p-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <PartyPopper size={24} className="text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-900">{current.label} completed!</div>
                                        <div className="text-sm text-gray-600">Great work! Keep the momentum going.</div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                    <div className="text-xs text-gray-500 mb-1">Up Next</div>
                                    <div className="font-medium text-gray-900">{nextSession.label}</div>
                                    <div className="text-sm text-gray-600">{nextSession.duration} minutes</div>
                                </div>
                                <button
                                    onClick={() => {
                                        setCurrentIndex(nextIndex);
                                        setIsRunning(true);
                                        toast.dismiss(t.id);
                                        if (!isLearningDesk) navigate("/learning-desk");
                                    }}
                                    className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-600 flex items-center justify-center gap-2 shadow-sm transition-all"
                                >
                                    <Play size={16} /> Start Next Session
                                </button>
                            </div>
                        ), {
                            duration: 10000,
                            icon: <CheckCircle size={18} className="text-emerald-400" />,
                            style: {
                                minWidth: '320px'
                            }
                        });
                    } else {
                        toast.success(<span className="flex items-center gap-2"><PartyPopper size={16} />{current.label} completed!</span>, {
                            duration: 5000,
                            icon: <CheckCircle size={18} className="text-emerald-400" />
                        });
                    }
                }
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }

        return () => clearInterval(timerRef.current);
    }, [isRunning, tick, setIsRunning, setCurrentIndex, completeSession, navigate, isLearningDesk]);

    if (!currentSession || shouldHideBadge) return null;

    const progress = ((currentSession.duration * 60 - currentSession.timeLeft) / (currentSession.duration * 60)) * 100;

    const formatTime = (seconds) => {
        if (seconds < 0) return "00:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <AnimatePresence>
            {(isRunning || currentSession.timeLeft < currentSession.duration * 60) && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 20 }}
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-4"
                >
                    <div className="relative group">
                        {/* Circular Progress Badge */}
                        <div className="relative w-16 h-16 bg-gray-800 rounded-full shadow-lg border border-gray-700 cursor-pointer overflow-hidden"
                            onClick={() => navigate("/learning-desk")}
                        >
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                    className="text-gray-700"
                                />
                                <circle
                                    cx="32"
                                    cy="32"
                                    r="28"
                                    stroke="#06b6d4"
                                    strokeWidth="4"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 28}`}
                                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                                    className="transition-all duration-1000 ease-linear"
                                    strokeLinecap="round"
                                />
                            </svg>

                            {/* Time Display */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90 group-hover:bg-gray-800 transition-colors">
                                <span className="text-xs font-bold text-white group-hover:hidden">
                                    {formatTime(currentSession.timeLeft)}
                                </span>
                                <Maximize2 size={20} className="text-cyan-400 hidden group-hover:block" />
                            </div>
                        </div>

                        {/* Label Tooltip */}
                        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow border border-gray-700 whitespace-nowrap">
                                {currentSession.label}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlobalFocusTimer;
