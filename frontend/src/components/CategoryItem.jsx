import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const CategoryItem = ({ category }) => {
	return (
		<Link 
			to={"/category" + category.href}
			className='block group'
		>
			<div className='relative overflow-hidden h-64 sm:h-80 w-full rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary-500/10 group-hover:border-primary-500/50'>
				<img
					src={category.imageUrl}
					alt={category.name}
					className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100'
					loading='lazy'
				/>
				
				{/* Professional Gradient Overlay */}
				<div className='absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent' />
				
				<div className='absolute bottom-0 left-0 right-0 p-6 z-20'>
					<div className="flex items-end justify-between gap-4">
						<div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
							<h3 className='text-white text-xl font-bold tracking-tight mb-1'>{category.name}</h3>
							<p className='text-slate-300 text-xs font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
								View Collection
							</p>
						</div>
						<div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300">
							<ArrowUpRight size={20} />
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default CategoryItem;
