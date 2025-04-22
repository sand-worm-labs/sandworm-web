import { RotateCcw } from "lucide-react";

interface VersionEntry {
  id: number;
  createdAt: string;
  query: string;
}

export const QueryCard: React.FC<{ version: VersionEntry }> = ({ version }) => {
  const handleRestore = (query: string) => {
    console.log("Restoring query:", query);
  };

  return (
    <div className="p-3 border-b transition-colors">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">{version.createdAt}</span>
        <button
          type="button"
          className="p-1 hover:bg-white/15 rounded-full"
          onClick={() => handleRestore(version.query)}
          title="Restore this version"
        >
          <RotateCcw size={14} className="text-orange-500" />
        </button>
      </div>
      <div
        className="text-xs font-mono p-2 rounded overflow-hidden text-ellipsis whitespace-nowrap"
        title={version.query}
      >
        {version.query}
      </div>
    </div>
  );
};
