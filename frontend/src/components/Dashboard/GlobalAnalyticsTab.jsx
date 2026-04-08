import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { Users, Package, ShoppingCart, IndianRupee, TrendingUp, PieChart as PieChartIcon, BarChart3, Globe, Loader } from "lucide-react";
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

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#8B5CF6"];

const GlobalAnalyticsTab = () => {
	const [analyticsData, setAnalyticsData] = useState({
		users: 0,
		products: 0,
		totalSales: 0,
		totalRevenue: 0,
		categoryData: [],
		revenueByCategory: [],
	});
	const [isLoading, setIsLoading] = useState(true);
	const [dailySalesData, setDailySalesData] = useState([]);

	useEffect(() => {
		const fetchAnalyticsData = async () => {
			try {
				const response = await axios.get("/analytics");
				setAnalyticsData(response.data.analyticsData);
				// Format the date for cleaner display
				const formattedData = response.data.dailySalesData.map(item => ({
					...item,
					date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
				}));
				setDailySalesData(formattedData);
			} catch (error) {
				console.error("Error fetching analytics data:", error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchAnalyticsData();
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
		<div className='max-w-7xl mx-auto space-y-10 pb-12'>
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
				<div>
					<div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-3">
						<Globe size={12} /> Platform Stats
					</div>
					<h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Marketplace Overview</h2>
					<p className="text-slate-500 font-medium text-sm mt-1">Real-time performance data for all users and products.</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
				<AnalyticsCard
					title='Total Users'
					value={analyticsData.users.toLocaleString()}
					icon={Users}
					color='bg-blue-500'
					delay={0.1}
					subtitle="Platform members"
				/>
				<AnalyticsCard
					title='Total Products'
					value={analyticsData.products.toLocaleString()}
					icon={Package}
					color='bg-emerald-500'
					delay={0.2}
					subtitle="Active listings"
				/>
				<AnalyticsCard
					title='Total Sales'
					value={analyticsData.totalSales.toLocaleString()}
					icon={ShoppingCart}
					color='bg-purple-500'
					delay={0.3}
					subtitle="Orders filled"
				/>
				<AnalyticsCard
					title='Total Revenue'
					value={`₹${analyticsData.totalRevenue.toLocaleString()}`}
					icon={IndianRupee}
					color='bg-amber-500'
					delay={0.4}
					subtitle="Platform earnings"
				/>
			</div>

			{/* Charts */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
				{/* Sales Trend */}
				<motion.div
					className='lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
				>
					<div className="flex items-center gap-4 mb-10">
						<div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-900 dark:text-white">
							<TrendingUp size={24} />
						</div>
						<div>
							<h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Activity</h3>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Sales and revenue (Last 7 Days)</p>
						</div>
					</div>
					<div className="h-[350px]">
						<ResponsiveContainer width='100%' height='100%'>
							<AreaChart data={dailySalesData}>
								<defs>
									<linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2} />
										<stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
										<stop offset="95%" stopColor="#10B981" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray='3 3' stroke="#E2E8F0" vertical={false} className="dark:hidden" />
								<CartesianGrid strokeDasharray='3 3' stroke="#1E293B" vertical={false} className="hidden dark:block" />
								<XAxis dataKey='date' stroke='#9CA3AF' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} dy={10} />
								<YAxis yAxisId='left' stroke='#9CA3AF' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
								<YAxis yAxisId='right' orientation='right' stroke='#9CA3AF' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
								<Tooltip
									contentStyle={{
										backgroundColor: '#0F172A',
										borderRadius: '1rem',
										border: 'none',
										color: '#F8FAFC'
									}}
									itemStyle={{ fontWeight: 700, fontSize: '12px' }}
								/>
								<Area
									yAxisId='left'
									type='monotone'
									dataKey='sales'
									stroke='#8B5CF6'
									strokeWidth={3}
									fillOpacity={1}
									fill="url(#colorSales)"
									activeDot={{ r: 6 }}
									name='Sales'
								/>
								<Area
									yAxisId='right'
									type='monotone'
									dataKey='revenue'
									stroke='#10B981'
									strokeWidth={3}
									fillOpacity={1}
									fill="url(#colorRevenue)"
									activeDot={{ r: 6 }}
									name='Revenue'
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</motion.div>

				{/* Category Pie */}
				<motion.div
					className='lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.6 }}
				>
					<div className="flex items-center gap-4 mb-10">
						<div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-blue-600">
							<PieChartIcon size={24} />
						</div>
						<div>
							<h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Popularity</h3>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Products by category</p>
						</div>
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
									paddingAngle={5}
									dataKey='value'
									label={({ name, percent }) => `${name.split('-')[0]} ${(percent * 100).toFixed(0)}%`}
									labelLine={false}
								>
									{analyticsData.categoryData?.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip
									contentStyle={{ backgroundColor: '#0F172A', borderRadius: '1rem', border: 'none', color: '#F8FAFC' }}
								/>
							</PieChart>
						</ResponsiveContainer>
					</div>
				</motion.div>

				{/* Revenue Bar */}
				<motion.div
					className='lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.7 }}
				>
					<div className="flex items-center gap-4 mb-10">
						<div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl text-emerald-600">
							<BarChart3 size={24} />
						</div>
						<div>
							<h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Top Categories</h3>
							<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total revenue per category</p>
						</div>
					</div>
					<div className="h-[300px]">
						<ResponsiveContainer width='100%' height='100%'>
							<BarChart data={analyticsData.revenueByCategory} layout="vertical" margin={{ left: 20 }}>
								<CartesianGrid strokeDasharray='3 3' stroke="#E2E8F0" horizontal={false} className="dark:hidden" />
								<CartesianGrid strokeDasharray='3 3' stroke="#1E293B" horizontal={false} className="hidden dark:block" />
								<XAxis type="number" stroke='#9CA3AF' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
								<YAxis dataKey='name' type="category" width={80} stroke='#9CA3AF' tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
								<Tooltip
									contentStyle={{ backgroundColor: '#0F172A', borderRadius: '1rem', border: 'none', color: '#F8FAFC' }}
									formatter={(value) => `₹${value.toLocaleString()}`}
								/>
								<Bar dataKey='value' fill='#8B5CF6' radius={[0, 8, 8, 0]} barSize={24}>
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
			<div className={`p-4 rounded-2xl ${color} bg-opacity-10 text-white shadow-sm flex-shrink-0`}>
				<Icon className={`h-5 w-5 dark:opacity-90`} strokeWidth={2.5} />
			</div>
		</div>
	</motion.div>
);

export default GlobalAnalyticsTab;
