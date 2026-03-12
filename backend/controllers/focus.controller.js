import FocusSession from '../models/focusSession.model.js';

// Helper function to get date string (YYYY-MM-DD)
const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0];
};

// Helper function to calculate streaks from sessions
const calculateStreaks = (sessions) => {
    if (!sessions || sessions.length === 0) {
        return { currentStreak: 0, longestStreak: 0 };
    }

    // Get unique dates sorted in descending order
    const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();

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

// @desc    Get all focus sessions for current user
// @route   GET /api/focus
// @access  Private
export const getFocusSessions = async (req, res) => {
    try {
        const sessions = await FocusSession.find({ user: req.user._id })
            .sort({ timestamp: -1 });

        // Calculate stats
        const totalSessions = sessions.length;
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
        const streaks = calculateStreaks(sessions);
        const lastSessionDate = sessions.length > 0 ? sessions[0].date : null;

        res.json({
            sessions,
            stats: {
                totalSessions,
                totalMinutes,
                totalHours,
                currentStreak: streaks.currentStreak,
                longestStreak: streaks.longestStreak,
                lastSessionDate,
            }
        });
    } catch (error) {
        console.error('Error fetching focus sessions:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new focus session (when timer completes)
// @route   POST /api/focus
// @access  Private
export const createFocusSession = async (req, res) => {
    try {
        const { label, duration, date, timestamp } = req.body;

        if (!label || !duration) {
            return res.status(400).json({ message: 'Label and duration are required' });
        }

        const session = await FocusSession.create({
            user: req.user._id,
            label,
            duration,
            date: date || getDateString(),
            timestamp: timestamp || Date.now(),
        });

        // Fetch updated stats
        const allSessions = await FocusSession.find({ user: req.user._id });
        const totalSessions = allSessions.length;
        const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
        const streaks = calculateStreaks(allSessions);

        res.status(201).json({
            session,
            stats: {
                totalSessions,
                totalMinutes,
                totalHours,
                currentStreak: streaks.currentStreak,
                longestStreak: streaks.longestStreak,
                lastSessionDate: getDateString(),
            }
        });
    } catch (error) {
        console.error('Error creating focus session:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get focus session stats
// @route   GET /api/focus/stats
// @access  Private
export const getFocusStats = async (req, res) => {
    try {
        const sessions = await FocusSession.find({ user: req.user._id });

        const totalSessions = sessions.length;
        const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;
        const streaks = calculateStreaks(sessions);
        const lastSessionDate = sessions.length > 0
            ? sessions.sort((a, b) => b.timestamp - a.timestamp)[0].date
            : null;

        res.json({
            totalSessions,
            totalMinutes,
            totalHours,
            currentStreak: streaks.currentStreak,
            longestStreak: streaks.longestStreak,
            lastSessionDate,
        });
    } catch (error) {
        console.error('Error fetching focus stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get heatmap data (sessions by date)
// @route   GET /api/focus/heatmap
// @access  Private
export const getHeatmapData = async (req, res) => {
    try {
        const sessions = await FocusSession.find({ user: req.user._id });

        const heatmapData = {};
        sessions.forEach(session => {
            if (!heatmapData[session.date]) {
                heatmapData[session.date] = { date: session.date, count: 0, minutes: 0 };
            }
            heatmapData[session.date].count++;
            heatmapData[session.date].minutes += session.duration;
        });

        res.json(Object.values(heatmapData));
    } catch (error) {
        console.error('Error fetching heatmap data:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get sessions by date range
// @route   GET /api/focus/range?days=30
// @access  Private
export const getSessionsByRange = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const cutoffDate = getDateString(new Date(Date.now() - days * 86400000));

        const sessions = await FocusSession.find({
            user: req.user._id,
            date: { $gte: cutoffDate }
        }).sort({ timestamp: -1 });

        res.json(sessions);
    } catch (error) {
        console.error('Error fetching sessions by range:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a focus session
// @route   DELETE /api/focus/:id
// @access  Private
export const deleteFocusSession = async (req, res) => {
    try {
        const session = await FocusSession.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('Error deleting focus session:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
