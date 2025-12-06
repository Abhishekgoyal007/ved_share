import { useMemo } from "react";
import { useFocusStore } from "../../../stores/useFocusStore";
import { motion } from "framer-motion";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Calendar, Clock, Flame, Award, Target } from "lucide-react";

const FocusAnalytics = () => {
    const { sessionStats, sessionHistory, getHeatmapData } = useFocusStore();

    // Heatmap data
    const heatmapData = useMemo(() => {
        const data = getHeatmapData();
        return data.map(d => ({
            date: d.date,
            count: d.minutes,
        }));
    }, [getHeatmapData]);

    // Last 7 days sessions
    const last7DaysData = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const sessions = sessionHistory.filter(s => s.date === dateStr);
            days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                sessions: sessions.length,
                minutes: sessions.reduce((sum, s) => sum + s.duration, 0),
            });
        }
        return days;
    }, [sessionHistory]);

    // Last 30 days trend
    const last30DaysTrend = useMemo(() => {
        const days = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const sessions = sessionHistory.filter(s => s.date === dateStr);
            days.push({
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                minutes: sessions.reduce((sum, s) => sum + s.duration, 0),
            });
        }
        return days;
    }, [sessionHistory]);

    // Calculate additional stats
    const avgSessionLength = sessionStats.totalSessions > 0
        ? Math.round(sessionStats.totalMinutes / sessionStats.totalSessions)
        : 0;

    const thisWeekSessions = useMemo(() => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionHistory.filter(s => new Date(s.date) >= weekAgo).length;
    }, [sessionHistory]);

    const mostProductiveDay = useMemo(() => {
        const dayTotals = {};
        sessionHistory.forEach(s => {
            const day = new Date(s.date).toLocaleDateString('en-US', { weekday: 'long' });
            dayTotals[day] = (dayTotals[day] || 0) + s.duration;
        });
        const entries = Object.entries(dayTotals);
        if (entries.length === 0) return "N/A";
        return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
    }, [sessionHistory]);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
                    <p className="text-white font-medium">{payload[0].payload.date || payload[0].name}</p>
                    <p className="text-cyan-400 text-sm">{payload[0].value} {payload[0].dataKey === 'sessions' ? 'sessions' : 'minutes'}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Flame size={18} className="text-orange-400" />
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Current Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{sessionStats.currentStreak}</div>
                    <div className="text-xs text-gray-400 mt-1">days</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Award size={18} className="text-purple-400" />
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Best Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{sessionStats.longestStreak}</div>
                    <div className="text-xs text-gray-400 mt-1">days</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={18} className="text-emerald-400" />
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Total Hours</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{sessionStats.totalHours}</div>
                    <div className="text-xs text-gray-400 mt-1">hours</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar size={18} className="text-blue-400" />
                        <span className="text-gray-400 text-xs uppercase tracking-wide">This Week</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{thisWeekSessions}</div>
                    <div className="text-xs text-gray-400 mt-1">sessions</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={18} className="text-yellow-400" />
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Avg Length</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{avgSessionLength}</div>
                    <div className="text-xs text-gray-400 mt-1">minutes</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/30 rounded-xl p-4"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={18} className="text-pink-400" />
                        <span className="text-gray-400 text-xs uppercase tracking-wide">Best Day</span>
                    </div>
                    <div className="text-lg font-bold text-white truncate">{mostProductiveDay}</div>
                    <div className="text-xs text-gray-400 mt-1">of week</div>
                </motion.div>
            </div>

            {/* Heatmap */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Calendar size={20} className="text-cyan-400" />
                        {sessionHistory.length} sessions in the last year
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-gray-700"></div>
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#0e4429' }}></div>
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#006d32' }}></div>
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#26a641' }}></div>
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#39d353' }}></div>
                        </div>
                        <span>More</span>
                    </div>
                </div>
                <div className="github-heatmap-container overflow-x-auto">
                    <CalendarHeatmap
                        startDate={new Date(new Date().setMonth(new Date().getMonth() - 12))}
                        endDate={new Date()}
                        values={heatmapData}
                        classForValue={(value) => {
                            if (!value || value.count === 0) return 'color-github-0';
                            if (value.count < 20) return 'color-github-1';
                            if (value.count < 40) return 'color-github-2';
                            if (value.count < 60) return 'color-github-3';
                            return 'color-github-4';
                        }}
                        tooltipDataAttrs={(value) => {
                            if (!value || !value.date) return {};
                            const date = new Date(value.date);
                            const formattedDate = date.toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            });
                            return {
                                'data-tip': `${formattedDate}: ${value.count || 0} minutes`,
                            };
                        }}
                        showWeekdayLabels={true}
                    />
                </div>
            </motion.div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Last 7 Days Bar Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4">Last 7 Days</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={last7DaysData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar dataKey="sessions" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* 30 Day Trend Line Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
                >
                    <h3 className="text-lg font-semibold text-white mb-4">30-Day Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={last30DaysTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="date" stroke="#9ca3af" interval={4} />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <style jsx>{`
                .github-heatmap-container {
                    padding: 20px 0;
                }
                .github-heatmap-container :global(.react-calendar-heatmap) {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
                .github-heatmap-container :global(.react-calendar-heatmap text) {
                    font-size: 10px;
                    fill: #9ca3af;
                }
                .github-heatmap-container :global(.react-calendar-heatmap .react-calendar-heatmap-month-label) {
                    font-size: 10px;
                    fill: #9ca3af;
                }
                .github-heatmap-container :global(.react-calendar-heatmap rect) {
                    rx: 2;
                    ry: 2;
                }
                .github-heatmap-container :global(.react-calendar-heatmap .color-github-0) {
                    fill: #161b22;
                    stroke: #1b1f23;
                    stroke-width: 1px;
                }
                .github-heatmap-container :global(.react-calendar-heatmap .color-github-1) {
                    fill: #0e4429;
                }
                .github-heatmap-container :global(.react-calendar-heatmap .color-github-2) {
                    fill: #006d32;
                }
                .github-heatmap-container :global(.react-calendar-heatmap .color-github-3) {
                    fill: #26a641;
                }
                .github-heatmap-container :global(.react-calendar-heatmap .color-github-4) {
                    fill: #39d353;
                }
                .github-heatmap-container :global(.react-calendar-heatmap rect:hover) {
                    stroke: #06b6d4;
                    stroke-width: 2px;
                    opacity: 0.8;
                }
            `}</style>
        </div>
    );
};

export default FocusAnalytics;
