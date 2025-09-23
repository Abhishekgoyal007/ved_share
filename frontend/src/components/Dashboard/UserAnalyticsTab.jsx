import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "../../lib/axios";
import {
  Package,
  ShoppingCart,
  DollarSign,
  LineChart as LineChartIcon,
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
} from "recharts";

const UserAnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
  totalProducts: 0,
  totalSales: 0,
  totalRevenue: 0,
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
    return <div>Loading...</div>;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8'>
        <AnalyticsCard
          title='Your Products'
          value={analyticsData.totalProducts.toLocaleString()}
          icon={Package}
          color='from-emerald-500 to-green-700'
        />
        <AnalyticsCard
          title='Your Sales'
          value={analyticsData.totalSales.toLocaleString()}
          icon={ShoppingCart}
          color='from-emerald-500 to-cyan-700'
        />
        <AnalyticsCard
          title='Your Revenue'
          value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color='from-emerald-500 to-lime-700'
        />
      </div>

      <motion.div
        className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <ResponsiveContainer width='100%' height={400}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='name' stroke='#D1D5DB' />
            <YAxis stroke='#D1D5DB' />
            <Tooltip />
            <Legend />
            <Line
              type='monotone'
              dataKey='sales'
              stroke='#10B981'
              activeDot={{ r: 8 }}
              name='Sales'
            />
            <Line
              type='monotone'
              dataKey='revenue'
              stroke='#3B82F6'
              activeDot={{ r: 8 }}
              name='Revenue'
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

export default UserAnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className='flex justify-between items-center'>
      <div className='z-10'>
        <p className='text-cyan-300 text-sm mb-1 font-semibold'>{title}</p>
        <h3 className='text-white text-3xl font-bold'>{value}</h3>
      </div>
    </div>
    <div className='absolute inset-0 bg-gradient-to-br from-cyan-600 to-emerald-900 opacity-30' />
    <div className='absolute -bottom-4 -right-4 text-cyan-800 opacity-50'>
      <Icon className='h-32 w-32' />
    </div>
  </motion.div>
);
