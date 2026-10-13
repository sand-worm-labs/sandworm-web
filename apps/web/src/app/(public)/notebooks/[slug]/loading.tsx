import { PublicSkeleton } from "@/components/Editor/PublicSkeleton";
import { PublicHeaderSkeleton } from "@/components/Skeletons";

// What a public notebook shows while its page loads: the shape of a document, not the app-wide loader.
export default function PublicNotebookLoading() {
  return (
    <div className="flex flex-col h-screen bg-base-100 dark:bg-page-surface font-body">
      <PublicHeaderSkeleton />
      <div className="flex-1 min-w-0 overflow-hidden">
        <PublicSkeleton />
      </div>
    </div>
  );
}
