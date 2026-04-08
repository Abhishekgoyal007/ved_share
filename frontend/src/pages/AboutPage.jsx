import React from "react";
import { BookOpen, CheckCircle2, Globe, Users, Trophy } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      {/* Hero Section */}
      <div className="text-left mb-32">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-primary-100 dark:border-primary-800"
        >
          <BookOpen size={14}/> The Mission
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter mb-10 leading-[0.9]">
          Knowledge for <br/>
          <span className="text-primary-600 italic">Every Student.</span>
        </h1>
        <p className="max-w-3xl text-slate-600 dark:text-slate-400 text-xl md:text-2xl leading-relaxed font-medium">
          VedShare is a sophisticated academic ecosystem designed to dismantle the barriers of resource accessibility. We believe high-quality learning materials should be a shared asset, not a financial burden.
        </p>
      </div>

      {/* Modern Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
        {[
            { icon: <Globe size={24} />, label: "Community Scale", value: "Pan-India Network", desc: "Connecting students across all major academic institutions." },
            { icon: <Users size={24} />, label: "Student Verified", value: "10k+ Resources", desc: "A massive library of community-vetted study materials." },
            { icon: <Trophy size={24} />, label: "Social Impact", value: "60% Cost Saving", desc: "Making premium education affordable for every aspiring learner." }
        ].map((stat, i) => (
            <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group"
            >
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 mb-6 group-hover:scale-110 transition-transform w-fit">
                    <div className="text-primary-600">{stat.icon}</div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{stat.value}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">{stat.desc}</p>
            </motion.div>
        ))}
      </div>

      {/* Philosophy Section */}
      <div className="bg-slate-900 dark:bg-white rounded-[3.5rem] p-12 md:p-24 text-white dark:text-slate-950 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-10">
            <BookOpen size={400} />
        </div>
        
        <div className="relative z-10 max-w-4xl">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-12">The VedShare <span className="text-primary-400 dark:text-primary-600">Standard.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {[
                    "Verified academic integrity in every listed resource.",
                    "Direct student-to-student marketplace auditing.",
                    "Decentralized knowledge distribution network.",
                    "Eco-conscious circular reuse of physical textbooks.",
                    "Industry-standard secure transaction protocols.",
                    "Real-time resource tracking and verified delivery."
                ].map((text, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <CheckCircle2 className="text-primary-400 dark:text-primary-600 shrink-0 mt-1" size={20} />
                        <span className="font-bold text-lg tracking-tight leading-tight">{text}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      <div className="text-center pt-24">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.6em]">© VedShare Intellectual Property Portfolio</p>
      </div>
    </div>
  );
}
