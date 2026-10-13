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
import { tintPillDarkClassName } from "@/styles/interactive";

// The field and the full-width action every escrow modal uses
export const modalInputClassName =
  "w-full px-3 py-2.5 rounded-xl bg-inputBg dark:bg-base-400 border border-border dark:border-border-tertiary text-ink-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-medium";

export const modalPrimaryButtonClassName = `w-full py-3.5 px-4 bg-primary hover:bg-primary-720 disabled:bg-disabled dark:disabled:bg-[#4a4a48] text-border-secondary font-medium rounded-xl transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm border border-transparent ${tintPillDarkClassName}`;

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
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
            <DialogPanel className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-xl dark:border dark:border-border-tertiary dark:bg-dropdown-bg">
              <div className="shrink-0 px-10 pt-8 pb-5">
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
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-10 pb-6">
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
