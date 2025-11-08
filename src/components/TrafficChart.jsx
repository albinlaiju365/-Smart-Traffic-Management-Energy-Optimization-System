import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// --- 1. Mock Data (Replace this with API data) ---
const mockTrafficData = [
  { time: "00:00", vehicles: 120 },
  { time: "01:00", vehicles: 85 },
  { time: "02:00", vehicles: 70 },
  { time: "03:00", vehicles: 60 },
  { time: "04:00", vehicles: 80 },
  { time: "05:00", vehicles: 150 },
  { time: "06:00", vehicles: 400 },
  { time: "07:00", vehicles: 900 },
  { time: "08:00", vehicles: 1100 },
  { time: "09:00", vehicles: 1000 },
  { time: "10:00", vehicles: 800 },
  { time: "11:00", vehicles: 750 },
  { time: "12:00", vehicles: 850 },
  { time: "13:00", vehicles: 950 },
  { time: "14:00", vehicles: 1050 },
  { time: "15:00", vehicles: 1200 },
  { time: "16:00", vehicles: 1400 },
  { time: "17:00", vehicles: 1600 },
  { time: "18:00", vehicles: 1300 },
  { time: "19:00", vehicles: 900 },
  { time: "20:00", vehicles: 650 },
  { time: "21:00", vehicles: 450 },
  { time: "22:00", vehicles: 300 },
  { time: "23:00", vehicles: 200 },
];

// --- 2. Custom Tooltip Component ---
// This makes the tooltip match your Shadcn theme
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-card text-card-foreground border border-border rounded-lg shadow-lg">
        <p className="label text-sm font-bold text-primary">{`${label}`}</p>
        <p className="intro text-sm">{`Vehicles: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// --- 3. The Main Chart Component ---
export default function TrafficChart() {
  // In a real app, you'd fetch this data from your backend
  const [data, setData] = useState(mockTrafficData);

  // --- Example of how to fetch data ---
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const res = await fetch("http://127.0.0.1:5000/api/traffic_history");
  //       const apiData = await res.json();
  //       setData(apiData); // Assuming API returns data in the correct format
  //     } catch (err) {
  //       console.error("Error fetching traffic data:", err);
  //     }
  //   };
  //   fetchData();
  //   // Optional: set an interval to refetch
  //   const interval = setInterval(fetchData, 60000); // Refetch every 60 seconds
  //   return () => clearInterval(interval);
  // }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Hourly Traffic Volume</CardTitle>
        <CardDescription>Vehicle count over the past 24 hours.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* The chart container MUST have a defined height */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 20, left: -20, bottom: 5 }}
            >
              {/* This <defs> creates the color gradient for the chart */}
              <defs>
                <linearGradient id="colorVehicles" x1="0" y1="0" x2="0" y2="1">
                  {/* Use your theme's primary color */}
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                // Only show every 3rd label to prevent clutter
                interval={2} 
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="vehicles"
                stroke="var(--color-primary)"
                fillOpacity={1}
                fill="url(#colorVehicles)"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}