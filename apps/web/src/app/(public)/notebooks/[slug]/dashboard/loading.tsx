import {
  DashboardPageSkeleton,
  PublicHeaderSkeleton,
} from "@/components/Skeletons";

// What a public dashboard shows while its page loads: the shape of the page, not the app-wide loader,
// so the first thing painted is already what will be there.
export default function PublicDashboardLoading() {
  return (
    <div className="flex flex-col h-screen bg-base-100 dark:bg-page-surface font-body">
      <PublicHeaderSkeleton />
      <div className="flex-1 min-w-0 overflow-hidden">
        <DashboardPageSkeleton />
      </div>
    </div>
  );
}
