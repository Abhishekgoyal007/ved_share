import { motion } from "framer-motion";

const LoadingSpinner = () => {
	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-900'>
			<div className='relative'>
				{/* Outer ring */}
				<motion.div
					className='w-24 h-24 rounded-full border-4 border-gray-700'
					animate={{ rotate: 360 }}
					transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
				/>

				{/* Gradient spinner */}
				<motion.div
					className='w-24 h-24 rounded-full absolute left-0 top-0'
					style={{
						background: 'conic-gradient(from 0deg, transparent 0%, #06b6d4 50%, #3b82f6 100%)',
						WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), white 0)',
						mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), white 0)'
					}}
					animate={{ rotate: 360 }}
					transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
				/>

				{/* Center glow */}
				<div className='absolute inset-0 flex items-center justify-center'>
					<motion.div
						className='w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500'
						animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
						transition={{ duration: 2, repeat: Infinity }}
					/>
				</div>

				<div className='sr-only'>Loading</div>
			</div>

			{/* Loading text */}
			<motion.div
				className='absolute mt-32 text-cyan-400 font-medium'
				animate={{ opacity: [0.5, 1, 0.5] }}
				transition={{ duration: 1.5, repeat: Infinity }}
			>
				Loading...
			</motion.div>
		</div>
	);
};

export default LoadingSpinner;
