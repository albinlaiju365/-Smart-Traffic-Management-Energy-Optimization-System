import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TrafficChartSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-1/3" />
        {/* Description Skeleton */}
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        {/* Chart Skeleton (matches h-[300px]) */}
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  );
}