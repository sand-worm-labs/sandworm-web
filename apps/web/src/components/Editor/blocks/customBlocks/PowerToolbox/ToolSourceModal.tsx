"use client";

// =====================================
// ⬢ Imports
// =====================================
import {
  DialogPanel,
  DialogTitle,
  Dialog,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useApolloClient } from "@apollo/client";

import { CloseIconButton } from "@/components/CloseIconButton";
import {
  RenderToolSourceDocument,
  type RenderToolSourceQuery,
  type RenderToolSourceQueryVariables,
} from "@/generated/graphql";

import { ReadOnlyCode } from "../CodeEditor/ReadOnlyCode";

// =====================================
// ⬢ Types
// =====================================
interface ToolSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  toolId: string;
  toolLabel: string;
  inputs: Record<string, unknown>;
  /** Omitted when the viewer can't edit the notebook. */
  onOpenInPythonBlock?: (source: string) => void;
}

// =====================================
// ⬢ Component
// =====================================
export function ToolSourceModal({
  isOpen,
  onClose,
  toolId,
  toolLabel,
  inputs,
  onOpenInPythonBlock,
}: ToolSourceModalProps) {
  const client = useApolloClient();
  const [source, setSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Block attrs hand back a fresh object each render; key the effect on the
  // content so an open modal doesn't refetch in a loop.
  const inputsKey = JSON.stringify(inputs);

  // Rendered on the server from the tool's template and this block's current
  // inputs, the same render the executor does on Run, so this is the code
  // that would execute. The raw template never reaches the client.
  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;
    setSource(null);
    setError(null);

    client
      .query<RenderToolSourceQuery, RenderToolSourceQueryVariables>({
        query: RenderToolSourceDocument,
        variables: { toolId, inputs: JSON.parse(inputsKey) },
        fetchPolicy: "network-only",
      })
      .then(({ data }) => {
        if (!cancelled) setSource(data?.renderToolSource ?? "");
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, client, toolId, inputsKey]);

  const handleOpenInPython = () => {
    if (source === null || !onOpenInPythonBlock) return;
    onOpenInPythonBlock(source);
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        {/* ✦ Backdrop ✦ */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/[10.2%]" aria-hidden="true" />
        </TransitionChild>

        {/* ✦ Panel ✦ */}
        <div className="fixed inset-0 flex items-center justify-center p-4 font-body">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95 translate-y-1"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-1"
          >
            <DialogPanel className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-dropdown-bg rounded-3xl shadow-xl p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <DialogTitle className="text-base font-semibold text-gray-900 dark:text-white">
                    Tool source
                  </DialogTitle>
                  <p className="text-xs text-ink-400 mt-0.5 truncate">
                    Rendered from {toolLabel} with this block&apos;s current
                    inputs
                  </p>
                </div>
                <CloseIconButton
                  onClick={onClose}
                  iconSize={18}
                  className="-mr-1 -mt-0.5"
                />
              </div>

              <div className="min-h-[8rem] overflow-hidden rounded-xl border border-border-secondary dark:border-border-tertiary bg-inputBg dark:bg-header-surface">
                {error ? (
                  <p className="p-4 text-sm text-red-600 dark:text-red-400">
                    Couldn&apos;t render this tool: {error}
                  </p>
                ) : source === null ? (
                  <div className="p-4 space-y-2 animate-pulse">
                    <div className="h-3 w-2/3 rounded bg-base-200 dark:bg-base-600" />
                    <div className="h-3 w-1/2 rounded bg-base-200 dark:bg-base-600" />
                    <div className="h-3 w-3/4 rounded bg-base-200 dark:bg-base-600" />
                  </div>
                ) : (
                  <ReadOnlyCode source={source} />
                )}
              </div>

              {onOpenInPythonBlock && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-ink-400">
                    Opens a new Python block below. This tool block stays
                    unchanged.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenInPython}
                    disabled={source === null}
                    className="shrink-0 px-4 py-1.5 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    Open in Python block
                  </button>
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
