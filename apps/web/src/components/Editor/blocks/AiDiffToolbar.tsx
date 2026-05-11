import {
  CheckIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/20/solid";
import clsx from "clsx";

interface AiDiffToolbarProps {
  visible: boolean;
  pendingCount: number;
  totalAi: number;
  accepted: number;
  rejected: number;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onUndoAll: () => void;
}

function AiDiffToolbar({
  visible,
  pendingCount,
  totalAi,
  accepted,
  rejected,
  onAcceptAll,
  onRejectAll,
  onUndoAll,
}: AiDiffToolbarProps) {
  const allReviewed = pendingCount === 0;
  const hasReviewed = accepted + rejected > 0;

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes ai-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ai-pulse-ring {
          0%   { box-shadow: 0 0 0 0 rgba(139,92,246,0.25); }
          70%  { box-shadow: 0 0 0 6px rgba(139,92,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(139,92,246,0); }
        }
        .ai-spinner {
          width: 14px; height: 14px;
          border: 1.5px solid #e5e7eb;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: ai-spin 0.9s linear infinite;
          flex-shrink: 0;
        }
        .ai-toolbar-wrap {
          animation: ai-pulse-ring 2s ease-out infinite;
        }
      `}</style>

      <div
        className={clsx(
          "ai-toolbar-wrap print:hidden max-w-[700px] mx-auto",
          "flex items-center justify-between gap-x-3",
          "px-4 py-2.5 mb-3",
          "rounded-full border border-gray-200 bg-white shadow-sm",
          "text-sm text-gray-500"
        )}
      >
        {/* Left */}
        <div className="flex items-center gap-x-2.5">
          {!allReviewed ? (
            <span className="ai-spinner" />
          ) : (
            <CheckIcon className="h-3.5 w-3.5 text-green-500" />
          )}

          <span className="text-ink-400 font-medium">
            {allReviewed
              ? "All blocks reviewed"
              : `${pendingCount} of ${totalAi} block${totalAi !== 1 ? "s" : ""} pending`}
          </span>

          {accepted > 0 && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-green-600 text-xs">
                {accepted} accepted
              </span>
            </>
          )}
          {rejected > 0 && (
            <>
              <span className="text-gray-200">·</span>
              <span className="text-red-500 text-xs">{rejected} rejected</span>
            </>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-x-2">
          {hasReviewed && (
            <button
              type="button"
              onClick={onUndoAll}
              className="flex items-center gap-x-1 px-3 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 text-xs transition-colors"
            >
              <ArrowUturnLeftIcon className="h-3 w-3" /> Undo all
            </button>
          )}
          {pendingCount > 0 && (
            <>
              <button
                type="button"
                onClick={onRejectAll}
                className="flex items-center gap-x-1 px-3 py-1 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs transition-colors"
              >
                <XMarkIcon className="h-3 w-3" /> Reject all
              </button>
              <button
                type="button"
                onClick={onAcceptAll}
                className="flex items-center gap-x-1 px-3 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 text-xs transition-colors"
              >
                <CheckIcon className="h-3 w-3" /> Accept all
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AiDiffToolbar;
