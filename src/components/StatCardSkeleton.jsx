import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatCardSkeleton() {
  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        {/* Title Skeleton */}
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between space-x-4">
          <div className="flex flex-col space-y-2">
            {/* Value Skeleton */}
            <Skeleton className="h-7 w-16" />
            {/* Subtitle Skeleton */}
            <Skeleton className="h-3 w-24" />
          </div>
          {/* Chart Skeleton */}
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </CardContent>
    </Card>
  );
}