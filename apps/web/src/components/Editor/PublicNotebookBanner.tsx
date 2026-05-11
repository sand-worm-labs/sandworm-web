export default function PublicNotebookBanner() {
  return (
    <div className="w-full bg-base-100 border-b border-base-200 px-6 py-2 flex items-center justify-between text-sm font-primary">
      <span className="text-base-400">
        Read-only preview. Fork this notebook to edit and run your own code.
      </span>
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-white text-xs font-medium"
        style={{ backgroundColor: "#A308F0" }}
      >
        Fork
      </button>
    </div>
  );
}
