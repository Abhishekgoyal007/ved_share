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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];

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
        setDailySalesData(res.data.dailySalesData);
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
      <div className="flex justify-center items-center h-96">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8'>
      {/* Key Metrics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        <AnalyticsCard
          title='Your Products'
          value={analyticsData.totalProducts.toLocaleString()}
          icon={Package}
          color='from-emerald-500 to-teal-600'
          delay={0.1}
        />
        <AnalyticsCard
          title='Your Sales'
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color='from-blue-500 to-indigo-600'
          delay={0.2}
        />
        <AnalyticsCard
          title='Your Revenue'
          value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
          icon={IndianRupee}
          color='from-purple-500 to-pink-600'
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales & Revenue Trend */}
        <motion.div
          className='bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl lg:col-span-2'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Sales & Revenue Trend</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray='3 3' stroke="#374151" vertical={false} />
                <XAxis dataKey='name' stroke='#9CA3AF' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId='left' stroke='#9CA3AF' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis yAxisId='right' orientation='right' stroke='#9CA3AF' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line
                  yAxisId='left'
                  type='monotone'
                  dataKey='sales'
                  stroke='#10B981'
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981', strokeWidth: 2, stroke: '#064E3B' }}
                  activeDot={{ r: 6 }}
                  name='Sales'
                />
                <Line
                  yAxisId='right'
                  type='monotone'
                  dataKey='revenue'
                  stroke='#3B82F6'
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#1E3A8A' }}
                  activeDot={{ r: 6 }}
                  name='Revenue'
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          className='bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <PieChartIcon className="text-blue-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Product Distribution</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={analyticsData.categoryData}
                  cx='50%'
                  cy='50%'
                  innerRadius={60}
                  outerRadius={100}
                  fill='#8884d8'
                  paddingAngle={5}
                  dataKey='value'
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {analyticsData.categoryData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Revenue by Category */}
        <motion.div
          className='bg-gray-800/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-xl'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BarChart3 className="text-purple-400" size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Revenue by Category</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={analyticsData.revenueByCategory} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray='3 3' stroke="#374151" horizontal={false} />
                <XAxis type="number" stroke='#9CA3AF' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis dataKey='name' type="category" width={100} stroke='#9CA3AF' tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '0.5rem', color: '#F3F4F6' }}
                  cursor={{ fill: '#374151', opacity: 0.4 }}
                  formatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Bar dataKey='value' fill='#8B5CF6' radius={[0, 4, 4, 0]} barSize={30}>
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

export default UserAnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    className={`bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-lg overflow-hidden relative group`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
  >
    <div className='flex justify-between items-start z-10 relative'>
      <div>
        <p className='text-gray-400 text-sm font-medium mb-1'>{title}</p>
        <h3 className='text-white text-3xl font-bold tracking-tight'>{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-10`}>
        <Icon className='h-6 w-6 text-white' />
      </div>
    </div>

    {/* Decorative background gradient */}
    <div className={`absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
  </motion.div>
);
