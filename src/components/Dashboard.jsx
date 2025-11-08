import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query"; // 1. For live data
import { toast } from "sonner"; // 2. For alerts
import SystemStatus from "./SystemStatus"; // 3. For the new panel
import UpgradedStatCard from "./UpgradedStatCard";
import OptimizationScore from "./OptimizationScore";
import TrafficChart from "./TrafficChart";
import StatCardSkeleton from "./StatCardSkeleton";
import TrafficChartSkeleton from "./TrafficChartSkeleton";
import { Skeleton } from "@/components/ui/skeleton"; 
import { motion } from "framer-motion";

// --- API Fetcher ---
// This function now gets all data from your live backend
const fetchDashboardData = async () => {
  const res = await fetch("http://127.0.0.1:5000/api/all-stats");
  if (!res.ok) {
    throw new Error("Network response was not ok. Is the Python server running?");
  }
  return res.json();
};

// --- Animation Variants (from your file) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function Dashboard() {
  // --- Live Data Hook ---
  // This replaces your useState(true) and useEffect timer
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData'], // A unique key for this query
    queryFn: fetchDashboardData, // The function that fetches
    refetchInterval: 3000, // Refetches data every 3 seconds
  });

  // --- AI Alert Logic ---
  const prevState = useRef({ incident: null, ev_route: null }); // Track both states

  useEffect(() => {
    // Don't run on load or if data isn't there
    if (!data) return;

    const prev = prevState.current;
    const current = data;

    // --- EV Route Check (Highest Priority) ---
    if (current.ev_route.active && !prev.ev_route?.active) {
      toast.info("🚨 PRIORITY ALERT", {
        description: `${current.ev_route.message}. Forcing green wave.`,
        duration: 10000, // Keep this toast on screen longer
      });
    }
    if (!current.ev_route.active && prev.ev_route?.active) {
      toast.success("✅ Priority Route Cleared", {
        description: "Resuming normal traffic flow.",
      });
    }

    // --- Incident Check (Second Priority) ---
    // Only show incident alerts if an EV route is NOT active
    if (!current.ev_route.active) {
      if (current.incident.active && !prev.incident?.active) {
        toast.error("🚨 CRITICAL INCIDENT", {
          description: `${current.incident.message} at ${current.incident.location}.`,
          duration: 10000,
        });
      }
      if (!current.incident.active && prev.incident?.active) {
         toast.success("✅ Incident Cleared", {
           description: `${prev.incident.message} at ${prev.incident.location} has been resolved.`,
         });
      }
      if (current.incident.optimization_impact > 0 && prev.incident?.optimization_impact <= 0) {
         toast.info("🤖 AI Response", {
           description: `Traffic flow re-optimized. Score is now ${data.optimizationScore}.`,
         });
      }
    }

    // Store the current data for the next check
    prevState.current = {
      incident: current.incident,
      ev_route: current.ev_route
    };
    
  }, [data]); // Re-run this check every time data changes

  // --- Error State ---
  if (error) {
    return (
      <main className="flex-1 p-6 flex items-center justify-center">
        <div className="text-destructive text-center">
          <h2 className="text-2xl font-bold">Error Connecting to Backend</h2>
          <p>{error.message}</p>
        </div>
      </main>
    );
  }

  // --- Create Stats Array from Live Data ---
  const stats = data ? [
    { ...data.stats.cpu, title: "CPU Usage", color: "text-blue-400", chartColor: "#60a5fa" },
    { ...data.stats.memory, title: "Memory", color: "text-green-400", chartColor: "#4ade80" },
    { ...data.stats.latency, title: "Network Latency", color: "text-yellow-400", chartColor: "#facc15" },
    { ...data.stats.cameras, title: "Active Cameras", color: "text-purple-400", chartColor: "#c084fc" },
    { ...data.stats.response, title: "Avg Response", color: "text-orange-400", chartColor: "#fb923c" },
  ] : [];

  return (
    <main className="flex-1 p-6 space-y-6 overflow-y-auto h-full w-full">
      {/* --- TOP STATS SECTION --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* We now use 'isLoading' from useQuery */}
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <StatCardSkeleton key={index} />
          ))
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 col-span-full"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {stats.map((stat) => (
              <UpgradedStatCard
                key={stat.title}
                {...stat}
                variants={itemVariants}
                // Pass live data to props (for flashing)
                value={stat.value} 
                data={stat.data}
              />
            ))}
          </motion.div>
        )}
      </div>
      
      {/* --- LOWER SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? <TrafficChartSkeleton /> : (
            // Pass live data as prop
            <TrafficChart chartData={data.trafficHistory} />
          )}
        </div>
        
        {/* --- MODIFIED THIS COLUMN --- */}
        <div className="lg:col-span-1 space-y-6">
          {/* 1. Add the new Status Panel */}
          {isLoading ? (
            <Skeleton className="h-[126px] w-full rounded-lg" />
          ) : (
            <SystemStatus incident={data.incident} ev_route={data.ev_route} />
          )}
          
          {/* 2. Your existing Optimization Score */}
          {isLoading ? (
            <Skeleton className="h-[300px] w-full rounded-lg" />
          ) : (
            // Pass live data as prop
            <OptimizationScore score={data.optimizationScore} />
          )}
        </div>
        {/* --- END MODIFICATION --- */}
      </div>
    </main>
  );
}