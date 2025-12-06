import { motion } from "framer-motion";
import { Shield, User } from "lucide-react";
import { useUserStore } from "../stores/useUserStore";

const SidebarLayout = ({ activeItem, setActiveItem, children, navItems, title }) => {
  const { user } = useUserStore();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-800/40 backdrop-blur-md border-r border-gray-700/50 flex flex-col">
        {/* User Info Section */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">{user?.name || "User"}</h3>
              <p className="text-gray-400 text-xs truncate">{user?.email || ""}</p>
            </div>
          </div>
          {user?.role === "admin" && (
            <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-xs font-semibold">Admin Access</span>
            </div>
          )}
        </div>

        {/* Title */}
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {title}
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }, index) => (
            <motion.button
              key={id}
              onClick={() => setActiveItem(id)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeItem === id
                  ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "hover:bg-gray-700/50 text-gray-300 hover:text-white"
                }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${activeItem === id ? "scale-110" : "group-hover:scale-110"
                }`} />
              <span className="font-medium text-sm">{label}</span>
              {activeItem === id && (
                <motion.div
                  layoutId="activeIndicator"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="text-xs text-gray-500 text-center">
            VedShare © 2024
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SidebarLayout;
