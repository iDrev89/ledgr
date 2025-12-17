import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function PurchaseTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search bar skeleton */}
      <Skeleton className="h-10 w-full max-w-sm" />

      {/* Table skeleton for desktop / Cards for mobile */}
      <div className="hidden md:block space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>

      {/* Cards skeleton for mobile */}
      <div className="md:hidden grid grid-cols-1 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6 space-y-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

