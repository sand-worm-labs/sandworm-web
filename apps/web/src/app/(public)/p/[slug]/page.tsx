import V2Editor from "@/components/Editor";
import PublicNotebookBanner from "@/components/Editor/PublicNotebookBanner";

export default function PublicNotebookPage() {
  return (
    <div className="flex flex-col h-screen bg-base-100 font-body">
      <PublicNotebookBanner />
      {/* editor goes here */}
    </div>
  );
}
