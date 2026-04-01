import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useContext, createContext, useEffect, useState } from "react";
import { validate } from "uuid";

import { useStringQuery } from "./useQueryArgs";
import { useSession } from "./useAuth";

// =====================================
// ⬢ Constants
// =====================================
const WS_URL = process.env.NEXT_PUBLIC_API_WS_URL || "http://localhost:8003";

// =====================================
// ⬢ Context
// =====================================
const Context = createContext<Socket | null>(null);

// =====================================
// ⬢ Utils
// =====================================
function buildSocketConfig(rawUrl: string): {
  origin: string;
  path: string | undefined;
} {
  const url = new URL(rawUrl);
  return {
    origin: url.origin,
    path: url.pathname === "/" ? undefined : `${url.pathname}/socket.io`,
  };
}

// =====================================
// ⬢ Provider
// =====================================
interface Props {
  children: React.ReactNode;
}

export function WebsocketProvider({ children }: Props) {
  // ── state ──
  const [socket, setSocket] = useState<Socket | null>(null);

  // ── hooks ──
  const session = useSession({ redirectToLogin: false });
  const workspaceId = useStringQuery("workspace");

  // ── effects ──
  useEffect(() => {
    if (!session.user?.id) {
      return () => {};
    }

    const { origin, path } = buildSocketConfig(WS_URL);

    const newSocket = io(origin, {
      withCredentials: true,
      path,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      auth: { token: session.user?.token },
    });

    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected, id:", newSocket.id);
    });

    newSocket.on("connect_error", err => {
      console.error("[WebSocket] Connection error:", err.message);
    });

    newSocket.on("disconnect", (reason: Socket.DisconnectReason) => {
      if (reason === "io server disconnect") {
        setTimeout(() => newSocket.connect(), 1000);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.removeAllListeners();
      newSocket.disconnect();
    };
  }, [session.user?.id]);

  useEffect(() => {
    if (!socket || !validate(workspaceId)) {
      return () => {};
    }

    const onConnect = () => {
      console.log("[WebSocket] Emitting join-workspace:", workspaceId);
      socket.emit("join-workspace", { workspaceId });
    };

    socket.on("connect", onConnect);
    socket.emit("join-workspace", { workspaceId });

    return () => {
      socket.off("connect", onConnect);
      socket.emit("leave-workspace", { workspaceId });
    };
  }, [socket, workspaceId]);

  return <Context.Provider value={socket}>{children}</Context.Provider>;
}

// =====================================
// ⬢ Use Websocket Hook
// =====================================
export function useWebsocket(): Socket | null {
  return useContext(Context);
}
