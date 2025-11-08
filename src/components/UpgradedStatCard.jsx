import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, Tooltip } from "recharts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion"; // <-- 1. Import motion

// --- 2. Create a "motion" version of the Card ---
const MotionCard = motion(Card);

export default function UpgradedStatCard({
  title,
  value,
  subtitle,
  color,
  chartColor,
  data,
  // --- 3. Accept animation props ---
  variants, 
}) {
  return (
    // --- 4. Use the MotionCard and pass variants ---
    <MotionCard className="shadow-lg" variants={variants}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-end justify-between space-x-4">
          <div className="flex flex-col space-y-1">
            <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
            <p className="text-xs text-gray-500">{subtitle}</p>
          </div>

          <div className="w-[120px] h-10 min-h-10"> 
            {data && data.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    labelStyle={{ display: "none" }}
                    itemStyle={{ color: chartColor }}
                  />
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={chartColor}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </CardContent>
    </MotionCard>
  );
}