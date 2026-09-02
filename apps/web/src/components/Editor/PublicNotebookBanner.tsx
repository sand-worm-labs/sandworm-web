import ViewSwitcher, { type NotebookView } from "./ViewSwitcher";

interface PublicNotebookBannerProps {
  view: NotebookView;
  onChangeView: (view: NotebookView) => void;
}

export default function PublicNotebookBanner({
  view,
  onChangeView,
}: PublicNotebookBannerProps) {
  return (
    <div className="w-full bg-base-100 border-b border-base-200 border-t border-border-secondary text-sm font-primary relative">
      <span className="text-base-400 bg-green-100 border-b border-green-400 font-medium w-full py-3 inline-block px-5">
        Read-only preview. Fork this notebook to edit and run your own code.
      </span>

      <div className="py-4 flex items-center justify-between px-5">
        <ViewSwitcher view={view} onChange={onChangeView} />

        <button
          type="button"
          className="flex items-center gap-1.5 px-5 py-1.5 rounded-md text-white text-sm font-medium bg-primary hover:bg-primary/90 transition-colors"
        >
          Fork
        </button>
      </div>
    </div>
  );
}
