import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function OptimizationScore() {
  const score = 39;
  return (
    // --- THE FIX IS HERE ---
    <div className="bg-card p-6 rounded-xl flex flex-col items-center justify-center text-center relative z-10">
      <div className="w-32 mb-4">
        <CircularProgressbar
          value={score}
          text={`${score}`}
          styles={buildStyles({
            // Using theme-aware CSS variables for a cleaner look
            textColor: "hsl(var(--foreground))",
            pathColor: "rgb(239, 68, 68)", // You can keep this
            trailColor: "hsl(var(--muted))",
          })}
        />
      </div>
      <p className="text-muted-foreground text-sm">Traffic Optimization Score</p>
    </div>
  );
}