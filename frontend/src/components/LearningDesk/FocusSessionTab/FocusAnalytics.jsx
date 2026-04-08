import { useMemo } from "react";
import { useFocusStore } from "../../../stores/useFocusStore";
import { motion } from "framer-motion";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Calendar, Clock, BarChart3, Activity } from "lucide-react";

const FocusAnalytics = () => {
    const { sessionStats, sessionHistory, getHeatmapData } = useFocusStore();

    const heatmapData = useMemo(() => {
        const data = getHeatmapData();
        return data.map(d => ({
            date: d.date,
            count: d.minutes,
        }));
    }, [getHeatmapData]);

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

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900 dark:bg-slate-800 border border-slate-800 dark:border-slate-700 rounded-2xl p-4 shadow-2xl">
                    <p className="text-white font-black text-xs uppercase tracking-widest mb-1">{payload[0].payload.date || payload[0].name}</p>
                    <p className="text-primary-400 font-black text-lg">
                        {payload[0].value} <span className="text-[10px] uppercase tracking-wider">{payload[0].dataKey}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-10 pt-10">
            <div className="flex items-center gap-4 mb-2">
                 <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-2xl text-primary-600">
                    <BarChart3 size={24} />
                 </div>
                 <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Intelligence Hub</h2>
            </div>

            {/* Heatmap Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                            <Activity className="text-primary-600" size={20} />
                            Activity Consistency
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mt-1">Global audit of your focus blocks over the last cycle.</p>
                    </div>
                </div>
                
                <div className="github-heatmap-container overflow-x-auto pb-4">
                    <CalendarHeatmap
                        startDate={new Date(new Date().setMonth(new Date().getMonth() - 12))}
                        endDate={new Date()}
                        values={heatmapData}
                        showWeekdayLabels={true}
                        classForValue={(value) => {
                            if (!value || value.count === 0) return 'color-github-0';
                            if (value.count < 20) return 'color-github-1';
                            if (value.count < 40) return 'color-github-2';
                            if (value.count < 60) return 'color-github-3';
                            return 'color-github-4';
                        }}
                    />
                </div>
            </motion.div>

            {/* Real-time Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm"
                >
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Weekly Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={last7DaysData}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="minutes" fill="url(#blueGradient)" radius={[10, 10, 10, 10]} barSize={24} />
                            <defs>
                                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#a855f7" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm"
                >
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Intensity Trend (30D)</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={last30DaysTrend}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} interval={5} />
                            <YAxis hide />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                                type="monotone" 
                                dataKey="minutes" 
                                stroke="#6366f1" 
                                strokeWidth={4} 
                                dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#fff' }} 
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            <style>{`
                .github-heatmap-container .react-calendar-heatmap rect {
                    rx: 4;
                    ry: 4;
                }
                .github-heatmap-container .react-calendar-heatmap .color-github-0 { fill: var(--heatmap-gray); }
                .github-heatmap-container .react-calendar-heatmap .color-github-1 { fill: #c7d2fe; }
                .github-heatmap-container .react-calendar-heatmap .color-github-2 { fill: #818cf8; }
                .github-heatmap-container .react-calendar-heatmap .color-github-3 { fill: #4f46e5; }
                .github-heatmap-container .react-calendar-heatmap .color-github-4 { fill: #312e81; }
                
                :root { --heatmap-gray: #f1f5f9; }
                .dark { --heatmap-gray: #0f172a; }

                .react-calendar-heatmap text {
                    font-size: 10px;
                    fill: #94a3b8;
                    font-weight: 700;
                }
            `}</style>
        </div>
    );
};

export default FocusAnalytics;
