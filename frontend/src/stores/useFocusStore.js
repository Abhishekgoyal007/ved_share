import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "../lib/axios";
import toast from "react-hot-toast";

// Helper function to get date string (YYYY-MM-DD)
const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

export const useFocusStore = create(
    persist(
        (set, get) => ({
            // Queue state (local only - not synced)
            sessions: [],
            currentIndex: null,
            isRunning: false,

            // Session history and stats (synced with backend)
            sessionHistory: [],
            sessionStats: {
                totalSessions: 0,
                totalMinutes: 0,
                totalHours: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastSessionDate: null,
            },

            // Loading states
            isLoading: false,
            isSynced: false,

            // Fetch all sessions from backend
            fetchSessions: async () => {
                set({ isLoading: true });
                try {
                    const response = await axios.get('/focus');
                    set({
                        sessionHistory: response.data.sessions,
                        sessionStats: response.data.stats,
                        isSynced: true,
                        isLoading: false,
                    });
                } catch (error) {
                    console.error('Error fetching focus sessions:', error);
                    set({ isLoading: false });
                    // Don't show toast on auth errors (user not logged in)
                    if (error.response?.status !== 401) {
                        toast.error('Failed to sync focus sessions');
                    }
                }
            },

            // Queue management actions (local only)
            setSessions: (sessions) => set({ sessions }),
            addSession: (session) =>
                set((state) => {
                    const newSessions = [...state.sessions, session];
                    return {
                        sessions: newSessions,
                        currentIndex: state.currentIndex === null ? 0 : state.currentIndex,
                    };
                }),
            removeSession: (id) =>
                set((state) => {
                    const indexToDelete = state.sessions.findIndex((s) => s.id === id);
                    if (indexToDelete === -1) return state;

                    const newSessions = state.sessions.filter((s) => s.id !== id);
                    let newIndex = state.currentIndex;

                    if (state.currentIndex === indexToDelete) {
                        newIndex = newSessions.length ? 0 : null;
                    } else if (indexToDelete < state.currentIndex) {
                        newIndex = state.currentIndex - 1;
                    }

                    return {
                        sessions: newSessions,
                        currentIndex: newIndex,
                        isRunning: newSessions.length === 0 ? false : state.isRunning,
                    };
                }),
            updateSession: (id, updates) =>
                set((state) => ({
                    sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
                })),
            reorderSessions: (fromIndex, toIndex) =>
                set((state) => {
                    const newSessions = [...state.sessions];
                    const [movedItem] = newSessions.splice(fromIndex, 1);
                    newSessions.splice(toIndex, 0, movedItem);

                    let newCurrentIndex = state.currentIndex;
                    if (state.currentIndex === fromIndex) {
                        newCurrentIndex = toIndex;
                    } else if (
                        state.currentIndex > fromIndex &&
                        state.currentIndex <= toIndex
                    ) {
                        newCurrentIndex = state.currentIndex - 1;
                    } else if (
                        state.currentIndex < fromIndex &&
                        state.currentIndex >= toIndex
                    ) {
                        newCurrentIndex = state.currentIndex + 1;
                    }

                    return { sessions: newSessions, currentIndex: newCurrentIndex };
                }),
            setCurrentIndex: (index) => set({ currentIndex: index }),
            toggleTimer: () => set((state) => ({ isRunning: !state.isRunning })),
            setIsRunning: (isRunning) => set({ isRunning }),

            // Complete a session and save to backend
            completeSession: async (sessionLabel, sessionDuration) => {
                const sessionData = {
                    label: sessionLabel,
                    duration: sessionDuration,
                    date: getDateString(),
                    timestamp: Date.now(),
                };

                // Optimistically update local state
                set((state) => {
                    const newHistory = [...state.sessionHistory, sessionData];
                    return {
                        sessionHistory: newHistory,
                        sessionStats: {
                            ...state.sessionStats,
                            totalSessions: state.sessionStats.totalSessions + 1,
                            totalMinutes: state.sessionStats.totalMinutes + sessionDuration,
                            totalHours: Math.round((state.sessionStats.totalMinutes + sessionDuration) / 60 * 10) / 10,
                            lastSessionDate: getDateString(),
                        }
                    };
                });

                // Sync with backend
                try {
                    const response = await axios.post('/focus', sessionData);
                    // Update with server response (accurate stats)
                    set({
                        sessionStats: response.data.stats,
                    });
                    toast.success('Session completed! 🎉');
                } catch (error) {
                    console.error('Error saving focus session:', error);
                    // Don't revert local state - just show warning
                    if (error.response?.status !== 401) {
                        toast.error('Session saved locally. Will sync when online.');
                    }
                }
            },

            tick: () =>
                set((state) => {
                    if (state.currentIndex === null || !state.isRunning) return state;

                    const currentSession = state.sessions[state.currentIndex];
                    if (!currentSession) return { isRunning: false };

                    if (currentSession.timeLeft > 0) {
                        const updatedSessions = [...state.sessions];
                        updatedSessions[state.currentIndex] = {
                            ...currentSession,
                            timeLeft: currentSession.timeLeft - 1,
                        };
                        return { sessions: updatedSessions };
                    } else {
                        // Session completed - mark as completed
                        const updatedSessions = [...state.sessions];
                        updatedSessions[state.currentIndex] = {
                            ...currentSession,
                            isRunning: false,
                            completed: true,
                        };

                        return {
                            sessions: updatedSessions,
                            isRunning: false,
                        };
                    }
                }),
            resetTimer: () =>
                set((state) => ({
                    sessions: state.sessions.map((s) => ({
                        ...s,
                        timeLeft: s.duration * 60,
                        isRunning: false,
                        completed: false,
                    })),
                    isRunning: false,
                    currentIndex: state.sessions.length > 0 ? 0 : null,
                })),

            // Analytics helper functions
            getHeatmapData: () => {
                const state = get();
                const heatmapData = {};

                state.sessionHistory.forEach(session => {
                    if (!heatmapData[session.date]) {
                        heatmapData[session.date] = { date: session.date, count: 0, minutes: 0 };
                    }
                    heatmapData[session.date].count++;
                    heatmapData[session.date].minutes += session.duration;
                });

                return Object.values(heatmapData);
            },

            getSessionsByDate: (days = 30) => {
                const state = get();
                const cutoffDate = new Date(Date.now() - days * 86400000);

                return state.sessionHistory.filter(s =>
                    new Date(s.date) >= cutoffDate
                );
            },
        }),
        {
            name: "focus-store",
            partialize: (state) => ({
                sessions: state.sessions,
                currentIndex: state.currentIndex,
                sessionStats: state.sessionStats,
                sessionHistory: state.sessionHistory,
            }),
        }
    )
);
