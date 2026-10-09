import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Y from "yjs";

import { base64ToUint8Array } from "@/helpers/formatters";

import { NEXT_PUBLIC_API_URL } from "../../../utils/env";

// How long one request waits on a run before answering. Matches the API's cap.
const WAIT_SECONDS = 50;

type ViewReport = {
  status: "running" | "idle";
  progress?: { completed: number; total: number };
  state: string;
};

type State = {
  isSyncing: boolean;
  running: boolean;
  progress: { completed: number; total: number } | null;
  error: string | null;
};

function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const message = err.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

// ─────────────────────────────────────────────────────────────
// ⬢ HOOK — useViewYDoc
// The saved notebook as the view page shows it: the viewer's own
// copy, fetched over HTTP and hydrated into a local Y.Doc. No
// provider, no socket. `run` re-runs it on the server and applies
// the new results when they come back.
// ─────────────────────────────────────────────────────────────
export function useViewYDoc(workspaceId: string, documentId: string) {
  const yDoc = useMemo(() => new Y.Doc(), [workspaceId, documentId]);
  const url = `${NEXT_PUBLIC_API_URL()}/workspaces/${workspaceId}/documents/${documentId}/view`;
  const abortRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<State>({
    isSyncing: true,
    running: false,
    progress: null,
    error: null,
  });

  // Applies each answer, and keeps asking for as long as the run goes on.
  const follow = useCallback(
    async (
      request: (signal: AbortSignal) => Promise<{ data: ViewReport }>
    ): Promise<void> => {
      const controller = abortRef.current;
      if (!controller) return;

      try {
        const { data } = await request(controller.signal);
        if (controller.signal.aborted) return;

        Y.applyUpdate(yDoc, base64ToUint8Array(data.state));
        setState({
          isSyncing: false,
          running: data.status === "running",
          progress: data.progress ?? null,
          error: null,
        });

        if (data.status === "running") {
          await follow(signal =>
            axios.get<ViewReport>(url, {
              params: { waitSeconds: WAIT_SECONDS },
              withCredentials: true,
              signal,
            })
          );
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setState(prev => ({
          ...prev,
          isSyncing: false,
          running: false,
          progress: null,
          error: errorMessage(err),
        }));
      }
    },
    [yDoc, url]
  );

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ isSyncing: true, running: false, progress: null, error: null });

    follow(signal =>
      axios.get<ViewReport>(url, { withCredentials: true, signal })
    );

    return () => {
      controller.abort();
    };
  }, [url, follow]);

  const run = useCallback(() => {
    setState(prev => ({ ...prev, running: true, progress: null, error: null }));
    follow(signal =>
      axios.post<ViewReport>(
        `${url}/run`,
        { waitSeconds: WAIT_SECONDS },
        { withCredentials: true, signal }
      )
    );
  }, [url, follow]);

  return { yDoc, ...state, run };
}
