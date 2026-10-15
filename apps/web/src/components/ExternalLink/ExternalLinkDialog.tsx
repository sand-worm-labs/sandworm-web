"use client";

import { useEffect, useState } from "react";
import { PiCheck, PiCopy, PiWarningCircle } from "react-icons/pi";

import { ModalShell } from "@/web3/components/ModalShell";
import {
  modalInlinePrimaryButtonClassName,
  modalSecondaryButtonClassName,
} from "@/web3/components/modalStyles";
import { LINK_WARNING_TEXT, describeLink } from "@/lib/externalLink";

interface ExternalLinkDialogProps {
  href: string | null;
  onClose: () => void;
  onContinue: (href: string) => void;
}

// =====================================
// ⬢ External Link Dialog
// =====================================
export const ExternalLinkDialog = ({
  href,
  onClose,
  onContinue,
}: ExternalLinkDialogProps) => {
  const [copied, setCopied] = useState(false);
  const link = href ? describeLink(href) : null;

  useEffect(() => {
    setCopied(false);
  }, [href]);

  const copy = async () => {
    if (!href) return;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
    } catch {
      // Clipboard not allowed here: the address is on screen to copy by hand.
    }
  };

  return (
    <ModalShell
      isOpen={link !== null}
      onClose={onClose}
      title="Leave Sandworm?"
      footer={
        link && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              data-autofocus
              onClick={onClose}
              className={`${modalSecondaryButtonClassName} shrink-0 whitespace-nowrap`}
            >
              Stay on Sandworm
            </button>
            <button
              type="button"
              onClick={() => href && onContinue(href)}
              className={modalInlinePrimaryButtonClassName}
            >
              <span className="max-w-[16rem] truncate">
                Continue to {link.host}
              </span>
            </button>
          </div>
        )
      }
    >
      {link && (
        <>
          <div className="flex gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
            <PiWarningCircle size={20} className="mt-0.5 shrink-0" />
            <p className="break-words">
              This link opens{" "}
              <strong className="font-semibold">{link.host}</strong>, a site
              Sandworm doesn&apos;t run or check. Only continue if you trust
              where the link came from.
            </p>
          </div>

          <p className="mt-5 text-xs font-medium text-ink-100 dark:text-white">
            Where it goes
          </p>
          <div
            className="mt-2 break-all rounded-xl border border-border bg-inputBg px-3 py-2.5 font-mono text-xs text-ink-400 dark:border-border-tertiary dark:bg-dropdown-bg"
            data-testid="external-link-url"
          >
            {link.before}
            <strong className="font-semibold text-ink-100 dark:text-white">
              {link.url.host}
            </strong>
            {link.after}
          </div>

          <button
            type="button"
            onClick={copy}
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-100 dark:hover:text-white"
          >
            {copied ? <PiCheck size={14} /> : <PiCopy size={14} />}
            {copied ? "Copied" : "Copy link"}
          </button>

          {link.warnings.length > 0 && (
            <ul className="mt-4 space-y-1.5 rounded-2xl bg-red-50 p-4 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {link.warnings.map(warning => (
                <li key={warning}>{LINK_WARNING_TEXT[warning]}</li>
              ))}
            </ul>
          )}

          <p className="mt-5 text-xs text-ink-400">
            Sandworm never asks for your password or keys on another site.
          </p>
        </>
      )}
    </ModalShell>
  );
};
