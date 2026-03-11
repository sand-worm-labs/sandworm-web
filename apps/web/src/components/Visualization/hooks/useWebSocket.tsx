import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useContext, createContext, useEffect, useState } from "react";
import { validate } from "uuid";

import { useStringQuery } from "./useQueryArgs";
import { useSession } from "./useAuth";

const Context = createContext<Socket | null>(null);

interface Props {
  children: React.ReactNode;
}

// Provider contains all logic - only mounted once
export function WebsocketProvider({ children }: Props) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const session = useSession({ redirectToLogin: false });
  const workspaceId = useStringQuery("workspace");

  useEffect(() => {
    if (!session.user?.id) {
      return;
    }

    const url = new URL(
      process.env.NEXT_PUBLIC_API_WS_URL || "http://localhost:8003"
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
    });

    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected, id:", newSocket.id);
    });

    newSocket.on("connect_error", error => {
      console.error("[WebSocket] Connection error:", error.message);
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
      return;
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

export function useWebsocket() {
  return useContext(Context);
}
