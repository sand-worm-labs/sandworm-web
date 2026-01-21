import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useContext, createContext, useEffect, useState, useRef } from "react";
import { validate } from "uuid";

import { useStringQuery } from "./useQueryArgs";
import { useSession } from "./useAuth";

const Context = createContext<Socket | null>(null);

interface Props {
  children: React.ReactNode;
}

export function useWebsocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const session = useSession({ redirectToLogin: false });
  const workspaceId = useStringQuery("workspaceId");
  const currentWorkspaceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session.user?.id) {
      return;
    }

    console.log("[WebSocket] Creating socket connection");

    const url = new URL(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003"
    );
    const withoutPathname = url.origin;
    const socketPath =
      url.pathname === "/" ? undefined : `${url.pathname}/socket.io`;

    const newSocket = io(withoutPathname, {
      withCredentials: true,
      path: socketPath,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      extraHeaders: {
        Authorization: `Bearer ${session}`,
      },
    });
    console.log(newSocket);

    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected:", newSocket.id);
    });

    newSocket.on("connect_error", error => {
      console.error("[WebSocket] Connection error:", error.message);
    });

    newSocket.on("disconnect", (reason: Socket.DisconnectReason) => {
      console.log("[WebSocket] Disconnected:", reason);

      if (reason === "io server disconnect") {
        console.log("[WebSocket] Server disconnect, reconnecting in 1s...");
        setTimeout(() => {
          newSocket.connect();
        }, 1000);
      }
    });

    setSocket(newSocket);

    return () => {
      console.log("[WebSocket] Cleaning up socket connection");
      newSocket.removeAllListeners();
      newSocket.disconnect();
      setSocket(null);
      currentWorkspaceRef.current = null;
    };
  }, [session.user?.id]);

  useEffect(() => {
    if (!socket || !validate(workspaceId)) {
      return;
    }

    if (currentWorkspaceRef.current === workspaceId) {
      return;
    }

    console.log("[WebSocket] Joining workspace:", workspaceId);

    const handleConnect = () => {
      console.log("[WebSocket] Connected, joining workspace:", workspaceId);
      socket.emit("join-workspace", { workspaceId });
      currentWorkspaceRef.current = workspaceId;
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);

    return () => {
      console.log("[WebSocket] Leaving workspace:", workspaceId);
      socket.off("connect", handleConnect);

      if (currentWorkspaceRef.current === workspaceId) {
        socket.emit("leave-workspace", { workspaceId });
        currentWorkspaceRef.current = null;
      }
    };
  }, [socket, workspaceId]);

  return socket;
}

export function WebsocketProvider({ children }: Props) {
  const socket = useWebsocket();
  return <Context.Provider value={socket}>{children}</Context.Provider>;
}

export function useWebsocketContext() {
  return useContext(Context);
}
