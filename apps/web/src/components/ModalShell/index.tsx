"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, type ReactNode } from "react";

import { CloseIconButton } from "@/components/CloseIconButton";
import { cn } from "@/lib/utils";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  // A wide, fixed-height panel for a multi-step form, with its own header strip
  wide?: boolean;
  headerExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

// =====================================
// ⬢ Modal Shell
// =====================================
export const ModalShell = ({
  isOpen,
  onClose,
  title,
  description,
  wide = false,
  headerExtra,
  children,
  footer,
}: ModalShellProps) => (
  <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <TransitionChild
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/[10.2%]" />
      </TransitionChild>

      <div className="fixed inset-0 font-body">
        <div className="flex h-full items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <DialogPanel
              className={cn(
                "relative flex w-full flex-col rounded-3xl bg-white shadow-xl dark:border dark:border-border-tertiary dark:bg-dropdown-bg",
                wide ? "h-[min(760px,90vh)] max-w-3xl" : "max-h-[90vh] max-w-lg"
              )}
            >
              <div
                className={cn(
                  "shrink-0 px-10 pt-8",
                  headerExtra
                    ? "border-b border-border-secondary pb-6 dark:border-border-tertiary"
                    : "pb-5"
                )}
              >
                <div className="flex items-center justify-between">
                  <DialogTitle
                    as="h2"
                    className="text-base font-medium text-ink-100 dark:text-white"
                  >
                    {title}
                  </DialogTitle>
                  <CloseIconButton onClick={onClose} />
                </div>
                {description && (
                  <p className="mt-2 text-xs text-ink-400">{description}</p>
                )}
                {headerExtra && <div className="mt-5">{headerExtra}</div>}
              </div>
              <div
                className={cn(
                  "min-h-0 flex-1 overflow-y-auto px-10 pb-6",
                  headerExtra && "pt-6"
                )}
              >
                {children}
              </div>
              {footer && (
                <div className="shrink-0 border-t border-border-secondary px-10 py-5 dark:border-border-tertiary">
                  {footer}
                </div>
              )}
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </Transition>
);
