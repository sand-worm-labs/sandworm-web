import PublicNotebookBanner from "@/components/Editor/PublicNotebookBanner";

export default function PublicNotebookPage() {
  return (
    <div className="flex flex-col h-screen bg-base-100">
      <PublicNotebookBanner />
      {/* editor goes here */}
    </div>
  );
}
