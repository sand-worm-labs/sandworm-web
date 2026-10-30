"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";

import { OPEN_LINK_MESSAGE, decideLink, openLink } from "@/lib/externalLink";

import { ExternalLinkDialog } from "./ExternalLinkDialog";

// The marker an output frame carries, so only our own frames can ask for the dialog.
export const LINK_GUARD_FRAME_ATTRIBUTE = "data-link-guard";

// Links in these places are checked: a note's rich text, and anything marked data-external-guard.
// Links elsewhere in the app (the header, a file download) are ours and go straight through.
const GUARDED = ".ProseMirror, [data-external-guard]";

// =====================================
// ⬢ External Link Provider
// =====================================
// One dialog for the whole app. It catches a click on a web link inside notebook content, and a request from an
// output frame (see linkGuardScript.ts), and asks the reader before they leave. Links to our own sites open at once.
export function ExternalLinkProvider({ children }: { children: ReactNode }) {
  const [href, setHref] = useState<string | null>(null);

  const request = useCallback((target: string) => {
    const decision = decideLink(target, window.location.origin);
    if (decision === "warn") setHref(target);
    else if (decision === "open") openLink(target);
  }, []);

  useEffect(() => {
    // Left and middle click both open a link; the capture phase runs before the editor's own handlers.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button > 1) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement) || !anchor.closest(GUARDED)) {
        return;
      }
      // While writing, a plain click puts the cursor in the link; only cmd/ctrl-click follows it.
      const editing = anchor.closest('[contenteditable="true"]') !== null;
      if (editing && !(event.metaKey || event.ctrlKey)) return;
      // Only a link that leaves for an unknown site is stopped; our own pages and #anchors go through untouched.
      if (decideLink(anchor.href, window.location.origin) !== "warn") return;

      event.preventDefault();
      event.stopPropagation();
      request(anchor.href);
    };

    const onMessage = (event: MessageEvent) => {
      if (
        event.data?.type !== OPEN_LINK_MESSAGE ||
        typeof event.data.url !== "string"
      ) {
        return;
      }
      const fromOurFrame = Array.from(
        document.querySelectorAll(`iframe[${LINK_GUARD_FRAME_ATTRIBUTE}]`)
      ).some(
        frame => (frame as HTMLIFrameElement).contentWindow === event.source
      );
      if (fromOurFrame) request(event.data.url);
    };

    document.addEventListener("click", onClick, true);
    document.addEventListener("auxclick", onClick, true);
    window.addEventListener("message", onMessage);
    return () => {
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("auxclick", onClick, true);
      window.removeEventListener("message", onMessage);
    };
  }, [request]);

  return (
    <>
      {children}
      <ExternalLinkDialog
        href={href}
        onClose={() => setHref(null)}
        onContinue={target => {
          setHref(null);
          openLink(target);
        }}
      />
    </>
  );
}
