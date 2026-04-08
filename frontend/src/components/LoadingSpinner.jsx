import { motion, AnimatePresence } from "framer-motion";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

const LoadingSpinner = ({ fullScreen = true }) => {
    const [showRetry, setShowRetry] = useState(false);

    useEffect(() => {
        if (!fullScreen) return;
        const timer = setTimeout(() => setShowRetry(true), 6000);
        return () => clearTimeout(timer);
    }, [fullScreen]);

	return (
		<div className={`flex flex-col items-center justify-center ${fullScreen ? 'min-h-screen bg-white dark:bg-slate-950 px-4' : 'py-12 bg-transparent'} font-sans selection:none`}>
			<div className={`relative flex flex-col items-center ${fullScreen ? 'gap-10' : 'gap-6 scale-75'}`}>
				{/* Stylized Logo Pulse */}
				<div className="relative">
					<motion.div 
						className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl"
						animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
						transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
					/>
					<motion.div
						className='w-24 h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10'
						animate={{ y: [0, -10, 0] }}
						transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
					>
                        <div className="relative">
						    <BookOpen size={40} className="text-primary-600" />
                            <motion.div 
                                className="absolute -inset-2 border-2 border-primary-500/30 rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </div>
					</motion.div>
				</div>

				<div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em] translate-x-[0.2em]">VedShare</span>
                    </div>

                    {/* Minimalist Progress Track */}
                    <div className="w-48 h-[2px] bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                        <motion.div 
                            className="absolute inset-0 bg-primary-500"
                            animate={{ 
                                x: ["-100%", "100%"] 
                            }}
                            transition={{ 
                                duration: 1.5, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                            }}
                        />
                    </div>

                    
                    <AnimatePresence>
                        {showRetry && (
                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-primary-600 transition-all"
                                onClick={() => window.location.reload()}
                            >
                                Taking too long? Refresh
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
			</div>
		</div>
	);
};

export default LoadingSpinner;
