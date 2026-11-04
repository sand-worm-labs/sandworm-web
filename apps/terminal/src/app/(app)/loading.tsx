import { Card } from "@sandworm/ui/kit/card";
import { Skeleton } from "@sandworm/ui/kit/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Loading" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <Card className="h-28 animate-pulse" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="h-72 animate-pulse lg:col-span-2" />
        <Card className="h-72 animate-pulse" />
      </div>
    </div>
  );
}
