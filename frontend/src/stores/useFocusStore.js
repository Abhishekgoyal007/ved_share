import { create } from "zustand";
import { persist } from "zustand/middleware";

// Helper function to get date string (YYYY-MM-DD)
const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

// Helper function to calculate streaks
const calculateStreaks = (sessionHistory) => {
    if (!sessionHistory || sessionHistory.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique dates sorted in descending order
    const uniqueDates = [...new Set(sessionHistory.map(s => s.date))].sort().reverse();

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = getDateString();
    const yesterday = getDateString(new Date(Date.now() - 86400000));

    // Calculate current streak
    for (let i = 0; i < uniqueDates.length; i++) {
        const date = uniqueDates[i];

        if (i === 0) {
            // First date should be today or yesterday
            if (date === today || date === yesterday) {
                currentStreak = 1;
                tempStreak = 1;
            } else {
                break; // Streak is broken
            }
        } else {
            const prevDate = uniqueDates[i - 1];
            const dayDiff = (new Date(prevDate) - new Date(date)) / 86400000;

            if (dayDiff === 1) {
                currentStreak++;
                tempStreak++;
            } else {
                break;
            }
        }
    }

    // Calculate longest streak
    tempStreak = 1;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const dayDiff = (new Date(uniqueDates[i]) - new Date(uniqueDates[i + 1])) / 86400000;

        if (dayDiff === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
        } else {
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { currentStreak, longestStreak };
};

export const useFocusStore = create(
    persist(
        (set, get) => ({
            sessions: [],
            currentIndex: null,
            isRunning: false,
            sessionHistory: [], // Array of { date, label, duration, timestamp }
            sessionStats: {
                totalSessions: 0,
                totalMinutes: 0,
                totalHours: 0,
                currentStreak: 0,
                longestStreak: 0,
                lastSessionDate: null,
            },

            // Actions
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

                    // Adjust currentIndex if necessary
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

            // Complete a session and record it in history
            completeSession: (sessionLabel, sessionDuration) =>
                set((state) => {
                    const newHistory = [
                        ...state.sessionHistory,
                        {
                            date: getDateString(),
                            label: sessionLabel,
                            duration: sessionDuration,
                            timestamp: Date.now(),
                        }
                    ];

                    const streaks = calculateStreaks(newHistory);
                    const totalMinutes = state.sessionStats.totalMinutes + sessionDuration;

                    return {
                        sessionHistory: newHistory,
                        sessionStats: {
                            totalSessions: state.sessionStats.totalSessions + 1,
                            totalMinutes,
                            totalHours: Math.round(totalMinutes / 60 * 10) / 10,
                            currentStreak: streaks.currentStreak,
                            longestStreak: streaks.longestStreak,
                            lastSessionDate: getDateString(),
                        }
                    };
                }),

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
            }), // Don't persist isRunning to avoid issues on reload
        }
    )
);
