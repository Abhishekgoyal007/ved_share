import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const SidebarLayout = ({ activeItem, setActiveItem, children, navItems, title }) => {
  const { user } = useUserStore();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-6rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 gap-4 lg:gap-8">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col gap-6">
        {/* User Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-20 w-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-slate-900 dark:text-white font-bold truncate max-w-[180px]">{user?.name}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs truncate max-w-[180px]">{user?.email}</p>
            </div>
          </div>
          
          {user?.role === "admin" && (
            <div className="mt-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center justify-center gap-2">
              <Shield className="w-3 h-3 text-amber-600 dark:text-amber-500" />
              <span className="text-amber-700 dark:text-amber-500 text-[10px] font-bold uppercase tracking-wider">Admin</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Main Menu</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveItem(id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${activeItem === id
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <Icon className={`h-5 w-5 ${activeItem === id ? "opacity-100" : "opacity-70 group-hover:opacity-100"}`} />
              <span className="font-semibold text-sm">{label}</span>
              {activeItem === id && (
                <ChevronRight className="ml-auto w-4 h-4 opacity-50" />
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Mobile Navigation (Visible only on small screens) */}
      <div className="lg:hidden w-full mb-4">
        <nav className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide snap-x">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveItem(id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl whitespace-nowrap transition-all snap-start ${activeItem === id
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-semibold text-xs">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 overflow-hidden">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 sm:p-5 lg:p-6 shadow-sm min-h-[600px]">
          <div className="mb-6 lg:mb-8">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
            <p className="text-slate-500 font-medium text-[10px] uppercase tracking-widest mt-1 opacity-70">{activeItem.replace('-', ' ')} overview</p>
          </div>
          <div className="relative">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
