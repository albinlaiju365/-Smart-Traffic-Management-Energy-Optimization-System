import React from "react";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Activity,
  Lightbulb,
  Bot,
  Video,
} from "lucide-react";
// 1. Import NavLink from React Router. We'll rename it to avoid conflicts.
import { NavLink as RouterNavLink } from "react-router-dom";

// 2. Your custom NavLink component is GONE.

export default function Sidebar() {
  // 3. The 'currentPath' variable is GONE.
  
  // 4. The 'active' prop is REMOVED from the array.
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { name: "Live Cameras", icon: Video, href: "/live-cameras" },
    { name: "Signal Control", icon: Activity, href: "/signal" },
    { name: "Street Light", icon: Lightbulb, href: "/streetlight" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <aside className="w-64 bg-card text-card-foreground flex flex-col justify-between p-4 border-r border-border h-screen">
      <div>
        <div className="flex items-center gap-3 mb-8 px-3 py-2">
          <Bot className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-bold text-foreground">TrafficAI</h1>
        </div>
        
        <ul className="space-y-3">
          {/* 5. We map and render the RouterNavLink directly */}
          {menuItems.map((item) => (
            <li key={item.name}>
              <RouterNavLink
                to={item.href}
                // 6. 'className' is now a function.
                // React Router passes 'isActive' to it automatically.
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer
                  transition-all duration-200
                  ${
                    isActive
                      ? "bg-primary text-primary-foreground" // Active state
                      : "text-muted-foreground hover:bg-muted hover:text-primary" // Default state
                  }
                `
                }
              >
                <item.icon size={18} /> 
                {item.name}
              </RouterNavLink>
            </li>
          ))}
        </ul>
      </div>

      <button className="flex items-center gap-2 p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-all duration-200">
        <LogOut size={18} /> Log Out
      </button>
    </aside>
  );
}