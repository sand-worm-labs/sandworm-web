import { Map } from "immutable";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useSyncExternalStore,
} from "react";

import {
  type KernelSnapshot,
  getKernelStatus,
  restartKernel,
  subscribeKernelStatus,
  warmUpKernel,
} from "@/lib/pyodide/kernel";

import { useWebsocket } from "./useWebSocket";

// =====================================
// ⬢ Types
// =====================================
export type EnvironmentStatus =
  | "Running"
  | "Stopped"
  | "Failing"
  | "Starting"
  | "Stopping";

export type StateItem = {
  loading: boolean;
  error: string | null;
  status: EnvironmentStatus;
  startedAt: string | null;
};
type State = Map<string, StateItem>;

type API = {
  getEnvironmentStatus: (workspaceId: string) => void;
  restart: (workspaceId: string) => void;
};

type ContextValue = [State, API];
const Context = createContext<ContextValue>([
  Map(),
  {
    getEnvironmentStatus: () => {},
    restart: () => {},
  },
]);

type Props = {
  children: React.ReactNode;
};

type UseEnvironmentStatus = {
  status: EnvironmentStatus;
  loading: boolean;
  error: string | null;
  restart: () => void;
  startedAt: string | null;
};

function getDefaultStateItem(): StateItem {
  return {
    loading: true,
    error: null,
    status: "Stopped",
    startedAt: null,
  };
}

// =====================================
// ⬢  Environment Status Provider
// =====================================
export function EnvironmentStatusProvider(props: Props) {
  const socket = useWebsocket();
  const [state, setState] = useState<State>(Map());

  useEffect(() => {
    if (!socket) {
      return () => {};
    }

    const onStatus = (data: {
      workspaceId: string;
      status: EnvironmentStatus;
      startedAt: string | null;
    }) => {
      setState(s =>
        s.set(data.workspaceId, {
          loading: false,
          error: null,
          status: data.status,
          startedAt: data.startedAt ? data.startedAt : null,
        })
      );
    };
    socket.on("environment-status-update", onStatus);

    const onError = (data: { workspaceId: string; error: string }) => {
      setState(s =>
        s.set(data.workspaceId, {
          ...(s.get(data.workspaceId) ?? getDefaultStateItem()),
          error: data.error,
        })
      );
    };
    socket.on("environment-status-error", onError);

    return () => {
      socket.off("environment-status-update", onStatus);
      socket.off("environment-status-error", onError);
    };
  }, [socket, setState]);

  useEffect(() => {
    if (!socket) {
      return () => {};
    }

    const onDisconnect = () => {
      setState(s => s.map(item => ({ ...item, loading: true, error: null })));
    };
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("disconnect", onDisconnect);
    };
  }, [socket, setState]);

  const getEnvironmentStatus = useCallback(
    (workspaceId: string) => {
      if (!socket) {
        return;
      }

      socket.emit("get-environment-status", { workspaceId });
    },
    [socket]
  );

  const restart = useCallback(
    (workspaceId: string) => {
      if (!socket) {
        return;
      }

      socket.emit("restart-environment", { workspaceId });
    },
    [socket]
  );

  const value: ContextValue = useMemo(
    () => [
      state,
      {
        getEnvironmentStatus,
        restart,
      },
    ],
    [state, getEnvironmentStatus]
  );
  return <Context.Provider value={value}>{props.children}</Context.Provider>;
}

// =====================================
// ⬢  Browser Runtime
// =====================================
// Live notebooks run in the browser: inside this provider, the "environment"
// is the tab's Pyodide kernel instead of the workspace's cloud environment.
const BrowserRuntimeContext = createContext(false);

export function BrowserRuntimeProvider(props: {
  enabled: boolean;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (props.enabled) warmUpKernel();
  }, [props.enabled]);

  return (
    <BrowserRuntimeContext.Provider value={props.enabled}>
      {props.children}
    </BrowserRuntimeContext.Provider>
  );
}

export function useIsBrowserRuntime(): boolean {
  return useContext(BrowserRuntimeContext);
}

const KERNEL_ENVIRONMENT_STATUS: Record<
  KernelSnapshot["status"],
  EnvironmentStatus
> = {
  off: "Stopped",
  loading: "Starting",
  ready: "Running",
  failed: "Failing",
};

function useKernelSnapshot(): KernelSnapshot {
  return useSyncExternalStore(
    subscribeKernelStatus,
    getKernelStatus,
    getKernelStatus
  );
}

// =====================================
// ⬢  Use Environment Status Hook
// =====================================
export function useEnvironmentStatus(
  workspaceId: string
): UseEnvironmentStatus {
  const [state, api] = useContext(Context);
  const isBrowserRuntime = useContext(BrowserRuntimeContext);
  const kernel = useKernelSnapshot();

  useEffect(() => {
    if (!isBrowserRuntime) api.getEnvironmentStatus(workspaceId);
  }, [api.getEnvironmentStatus, workspaceId, isBrowserRuntime]);

  const restart = useCallback(() => {
    if (isBrowserRuntime) restartKernel();
    else api.restart(workspaceId);
  }, [api.restart, workspaceId, isBrowserRuntime]);

  return useMemo(() => {
    if (isBrowserRuntime) {
      return {
        status: KERNEL_ENVIRONMENT_STATUS[kernel.status],
        loading: false,
        error: kernel.error,
        startedAt: kernel.startedAt,
        restart,
      };
    }
    return { ...(state.get(workspaceId) ?? getDefaultStateItem()), restart };
  }, [state, workspaceId, isBrowserRuntime, kernel, restart]);
}
