"use client";

// =====================================
// ⬢ Imports
// =====================================
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect, useMemo } from "react";
import { X, Check } from "lucide-react";

import type { ApiWorkspace } from "@/types";

import { useWorkspaces } from "../Editor/hooks/useWorkspaces";
import { WorkspaceIcon } from "../Settings/WorkspaceIcon";

// =====================================
// ⬢ Types
// =====================================
export interface ForkToWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: { id: string; title: string };
  onFork: (params: {
    documentId: string;
    workspaceId: string;
  }) => Promise<void>;
  onForkSuccess?: (workspaceId: string, documentId: string) => void;
}

type ModalStatus = "idle" | "loading" | "success" | "error";

// =====================================
// ⬢ Sub-component — WorkspaceRow
// =====================================
interface WorkspaceRowProps {
  workspace: ApiWorkspace;
  selected: boolean;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

function WorkspaceRow({
  workspace,
  selected,
  onSelect,
  disabled,
}: WorkspaceRowProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(workspace.id)}
      className={[
        "w-full flex items-center gap-3 px-3 py-2 rounded-2xl transition-all duration-100 text-left border mb-1.5 border-[#DEE2E6]",
        "focus:outline-none ",
        "disabled:pointer-events-none disabled:opacity-50",
        selected ? "bg-[#F8F9FA] " : "",
      ].join(" ")}
    >
      <WorkspaceIcon icon={workspace.icon} />

      {/* ✦ Name Indicator ✦ */}
      <span
        className={[
          "flex-1 text-sm truncate",
          selected ? "text-gray-900 font-medium" : "text-gray-700",
        ].join(" ")}
      >
        {workspace.name}
      </span>

      {/* ✦ Check Indicator ✦ */}
      <span
        className={[
          "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150",
          selected
            ? "bg-violet-500 opacity-100 scale-100"
            : "opacity-0 scale-75",
        ].join(" ")}
      >
        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
      </span>
    </button>
  );
}

// =====================================
// ⬢ Main Component
// =====================================
export function ForkToWorkspaceModal({
  isOpen,
  onClose,
  document,
  onFork,
  onForkSuccess,
}: ForkToWorkspaceModalProps) {
  const [{ data: workspaces, isLoading: workspacesLoading }] = useWorkspaces();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<ModalStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const isSingle = workspaces.length === 1;
  const selectedWorkspace = workspaces.find(w => w.id === selectedId) ?? null;
  const canFork = status === "idle" && selectedId !== null;

  // ⬢  Pre-select first workspace once list loads
  useEffect(() => {
    if (workspaces.length > 0 && selectedId === null) {
      setSelectedId(workspaces[0]?.id ?? null);
    }
  }, [workspaces, selectedId]);

  useEffect(() => {
    if (isOpen) {
      setStatus("idle");
      setError(null);
    }
  }, [isOpen]);

  async function handleFork() {
    if (!canFork || !selectedId) return;

    setStatus("loading");
    setError(null);

    try {
      await onFork({ documentId: document.id, workspaceId: selectedId });
      setStatus("success");

      setTimeout(() => {
        onClose();
        onForkSuccess?.(selectedId, document.id);
        setTimeout(() => setStatus("idle"), 300);
      }, 850);
    } catch (err) {
      setStatus("error");
      setError(
        err instanceof Error ? err.message : "Failed to fork. Please try again."
      );
    }
  }

  function handleClose() {
    if (status === "loading") return;
    onClose();
  }

  const buttonLabel = useMemo(() => {
    if (status === "loading") return "Forking…";
    if (status === "success") return "Forked ✓";
    return "Fork Notebook";
  }, [status]);

  const buttonClass = useMemo(() => {
    const base =
      "w-full py-3.5 rounded-xl text-[13px] font-medium text-white transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
    if (status === "success")
      return `${base} bg-emerald-500 focus-visible:ring-emerald-400 cursor-default`;
    if (status === "loading") return `${base} bg-[#A308F0] cursor-not-allowed`;
    if (!canFork) return `${base} bg-[#A308F0] cursor-not-allowed`;
    return `${base} bg-[#A308F0] hover:bg-[#A308F0] active:scale-[0.98] focus-visible:ring-violet-500`;
  }, [status, canFork]);

  // =====================================
  // ⬢ Render
  // =====================================
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={handleClose} className="relative z-50">
        {/* ✦ Backdrop ✦ */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0000001A]" aria-hidden="true" />
        </Transition.Child>

        {/* ✦ Panel ✦  */}
        <div className="fixed inset-0 flex items-center justify-center p-4 font-body">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-1"
          >
            <Dialog.Panel className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-5">
              {/* ✦  Header ✦ */}
              <div className="flex items-start justify-between">
                <div>
                  <Dialog.Title className="text-base font-semibold text-gray-900">
                    Fork notebook
                  </Dialog.Title>
                  <p
                    className="text-xs text-gray-400 mt-0.5 truncate max-w-[260px]"
                    title={document.title}
                  >
                    {document.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={status === "loading"}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-40 -mt-0.5 -mr-1"
                >
                  <X className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* ✦  Workspace selector ✦ */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-400">
                  Where would you like to open it?
                </label>

                {/* ✦ Loading skeleton ✦ */}
                {workspacesLoading && (
                  <div className="flex flex-col gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="h-9 rounded-xl bg-gray-100 animate-pulse"
                      />
                    ))}
                  </div>
                )}

                {/* ✦ Has Single workspace ✦  */}
                {!workspacesLoading && isSingle && selectedWorkspace && (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#F8F9FA] border border-[#DEE2E6]">
                    <WorkspaceIcon icon={selectedWorkspace.icon} />

                    <span className="flex-1 text-sm text-ink-400 font-medium truncate capitalize">
                      {selectedWorkspace.name}
                    </span>
                    <span className="text-[11px] text-violet-400 font-medium flex-shrink-0" />
                  </div>
                )}

                {/* ✦  Multiple workspaces ✦  */}
                {!workspacesLoading && !isSingle && (
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto -mx-1 px-1">
                    {workspaces.map(ws => (
                      <WorkspaceRow
                        key={ws.id}
                        workspace={ws}
                        selected={selectedId === ws.id}
                        onSelect={setSelectedId}
                        disabled={status === "loading" || status === "success"}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* ✦ Error Indicator ✦  */}
              {status === "error" && error && (
                <p className="text-xs text-rose-500 -mt-2">{error}</p>
              )}

              {/* ✦  CTA ✦  */}
              <button
                type="button"
                onClick={handleFork}
                disabled={!canFork}
                className={buttonClass}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    {buttonLabel}
                  </span>
                ) : (
                  buttonLabel
                )}
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
