import { useState } from "react";
import { PlusCircle, ShoppingBasket, BarChart } from "lucide-react";



const SidebarLayout = ({ activeItem, setActiveItem, children, navItems, title }) => {
  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-8 text-cyan-400">{title}</h2>
        <nav className="flex flex-col space-y-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveItem(id)}
              className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200 ${
                activeItem === id
                  ? "bg-cyan-600 text-white"
                  : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-gray-900 overflow-auto">{children}</main>
    </div>
  );
};

export default SidebarLayout;
