import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../../lib/axios";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  Loader
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Area,
  AreaChart
} from "recharts";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#8b5cf6"];

const UserAnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalRevenue: 0,
    categoryData: [],
    revenueByCategory: [],
  });
  const [dailySalesData, setDailySalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      try {
        const res = await axios.get("/analytics/my-analytics");
        setAnalyticsData(res.data.analyticsData);
        // Format dates for the chart
        const formattedData = res.data.dailySalesData.map(item => ({
          ...item,
          dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
        setDailySalesData(formattedData);
      } catch (err) {
        console.error("Error fetching user analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 gap-4">
        <Loader className="animate-spin text-primary-600" size={32} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading stats...</p>
      </div>
    );
  }

  return (
    <div className='max-w-6xl mx-auto space-y-10 pb-12'>
       {/* Header */}
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
                    <Target size={12}/> My Stats
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Personal Analytics</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Track your book sales and earnings.</p>
            </div>
        </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AnalyticsCard
          title='Total Products'
          value={analyticsData.totalProducts.toLocaleString()}
          icon={Package}
          color="bg-primary-500"
          subtitle="Books posted"
          delay={0.1}
        />
        <AnalyticsCard
          title='Total Sales'
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color="bg-emerald-500"
          subtitle="Successful sales"
          delay={0.2}
        />
        <AnalyticsCard
          title='Total Revenue'
          value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color="bg-amber-500"
          subtitle="Money earned"
          delay={0.3}
        />
      </div>

      {/* Performance Chart */}
      <motion.div
        className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white">
            <TrendingUp size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sales & Revenue</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Activity over the last 7 days</p>
          </div>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={dailySalesData}>
              <defs>
                <linearGradient id="userColorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="userColorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='4 4' stroke="#e2e8f0" vertical={false} className="dark:hidden" />
              <CartesianGrid strokeDasharray='4 4' stroke="#1e293b" vertical={false} className="hidden dark:block" />
              <XAxis dataKey='dateLabel' stroke='#94a3b8' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId='left' stroke='#94a3b8' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId='right' orientation='right' stroke='#94a3b8' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }}
                itemStyle={{ fontSize: '11px', fontWeight: 700 }}
              />
              <Area
                yAxisId='left'
                type='monotone'
                dataKey='sales'
                stroke='#6366f1'
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#userColorSales)"
                activeDot={{ r: 6 }}
                name='Sales'
              />
              <Area
                yAxisId='right'
                type='monotone'
                dataKey='revenue'
                stroke='#10b981'
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#userColorRevenue)"
                activeDot={{ r: 6 }}
                name='Revenue'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Mix */}
        <motion.div
          className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-blue-600">
              <PieChartIcon size={24} />
            </div>
            <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Category Stats</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">My books by category</p>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={analyticsData.categoryData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {analyticsData.categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Top Selling Categories */}
        <motion.div
          className='bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/20 rounded-2xl text-purple-600">
              <BarChart3 size={24} />
            </div>
            <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Best Sellers</h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Revenue by category</p>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={analyticsData.revenueByCategory} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray='4 4' stroke="#e2e8f0" horizontal={false} className="dark:hidden" />
                <CartesianGrid strokeDasharray='4 4' stroke="#1e293b" horizontal={false} className="hidden dark:block" />
                <XAxis type="number" hide />
                <YAxis dataKey='name' type="category" width={80} stroke='#94a3b8' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '1rem', color: '#fff' }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey='value' fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20}>
                  {analyticsData.revenueByCategory?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AnalyticsCard = ({ title, value, icon: Icon, color, delay, subtitle }) => (
  <motion.div
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative group overflow-hidden"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -3 }}
  >
    <div className='flex justify-between items-start relative z-10 gap-x-2'>
        <div className="space-y-4 flex-1">
            <div className="space-y-1">
                <p className='text-slate-400 text-[9px] font-black uppercase tracking-widest leading-tight'>{title}</p>
                <p className="text-slate-500 font-bold text-[9px] leading-tight">{subtitle}</p>
            </div>
            <h3 className='text-slate-900 dark:text-white text-xl sm:text-2xl font-black tracking-tight break-words pb-1'>{value}</h3>
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-white shadow-sm flex-shrink-0 transition-all`}>
            <Icon className={`h-5 w-5 dark:opacity-90`} strokeWidth={2.5} />
        </div>
    </div>
  </motion.div>
);

export default UserAnalyticsTab;
