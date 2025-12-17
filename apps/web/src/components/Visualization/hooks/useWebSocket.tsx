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
export function useWebsocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const session = useSession({ redirectToLogin: false });
  const workspaceId = useStringQuery("workspaceId");
  useEffect(() => {
    if (session.user?.id) {
      const url = new URL(
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      );
      const withoutPathname = url.origin;

      const socket = io(withoutPathname, {
        withCredentials: true,
        path: url.pathname === "/" ? undefined : `${url.pathname}/socket.io`,
      });
      setSocket(socket);

      const onDisconnect = (reason: Socket.DisconnectReason) => {
        if (reason === "io server disconnect") {
          // the disconnection was initiated by the server,
          // we need to reconnect manually in this case
          setTimeout(() => {
            socket.connect();
          }, 1000);
        }
      };
      socket.on("disconnect", onDisconnect);

      return () => {
        console.log("disconnect!");
        socket.off("disconnect", onDisconnect);
        socket.disconnect();
      };
    }
  }, [session.data?.id, setSocket]);

  useEffect(() => {
    if (!socket || !validate(workspaceId)) {
      return;
    }

    const onConnect = () => {
      socket.emit("join-workspace", { workspaceId });
    };
    socket.on("connect", onConnect);

    socket.emit("join-workspace", { workspaceId });
    return () => {
      socket.off("connect", onConnect);
      socket.emit("leave-workspace", { workspaceId });
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
