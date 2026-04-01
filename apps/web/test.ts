import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";

// Configuration - Update these values
const CONFIG = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8003",
  workspaceId: "5e636152-b747-4b6b-aec8-2883eb4ffa15",
  documentId: "e79ef315-fef9-4f84-866e-6ae52d96fde8", // Optional
};

console.log("🚀 WebSocket Test Script");
console.log("=".repeat(60));
console.log(`📡 API URL: ${CONFIG.apiUrl}`);
console.log(`🏢 Workspace ID: ${CONFIG.workspaceId}`);
console.log("=".repeat(60));

// Parse URL exactly like your React hook does
const url = new URL(CONFIG.apiUrl);
const withoutPathname = url.origin;
const socketPath =
  url.pathname === "/" ? undefined : `${url.pathname}/socket.io`;

console.log(`\n🔍 Connection Details:`);
console.log(`   Origin: ${withoutPathname}`);
console.log(`   Path: ${socketPath || "/socket.io (default)"}`);
console.log("");

const socket: Socket = io(withoutPathname, {
  withCredentials: true,
  path: socketPath,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
});

// Connection events
socket.io.on("error", error => {
  console.error("❌ Socket.IO error:", error);
});

socket.io.on("reconnect", attempt => {
  console.log(`🔄 Reconnected after ${attempt} attempts`);
});

socket.io.on("reconnect_attempt", attempt => {
  console.log(`🔄 Reconnect attempt ${attempt}...`);
});

socket.io.on("reconnect_error", error => {
  console.error("❌ Reconnect error:", error.message);
});

socket.io.on("reconnect_failed", () => {
  console.error("❌ Reconnection failed");
  process.exit(1);
});

socket.io.on("ping", () => {
  console.log("🏓 Ping");
});

// socket.io.on("packet", packet => {
//     if (packet.d !== "ping" && packet.type !== "pong") {
//         console.log(`📦 Packet type: ${packet.type}`);
//     }
// });

socket.io.engine.on("upgrade", transport => {
  console.log(`⬆️  Upgraded to: ${transport.name}`);
});

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");
  console.log(`   Socket ID: ${socket.id}`);
  console.log(`   Transport: ${socket.io.engine.transport.name}`);
  console.log("");

  console.log(`📤 Emitting: join-workspace`);
  console.log(
    `   Data: ${JSON.stringify({ workspaceId: CONFIG.workspaceId })}`
  );
  socket.emit("join-workspace", { workspaceId: CONFIG.workspaceId });
});

socket.on("connect_error", error => {
  console.error("❌ Connection error:", error.message);
  console.error("   Type:", (error as any).type);
  console.error(
    "   Description:",
    (error as any).description?.message || (error as any).description
  );
});

socket.on("disconnect", reason => {
  console.log(`🔌 Disconnected: ${reason}`);
});

socket.on("workspace-documents", data => {
  console.log("");
  console.log("📄 Received: workspace-documents");
  console.log(`   Workspace: ${data.workspaceId}`);
  console.log(`   Documents: ${data.documents?.length || 0}`);
  if (data.documents && data.documents.length > 0) {
    data.documents.forEach((doc: any, i: number) => {
      console.log(`   ${i + 1}. ${doc.title || "Untitled"} (${doc.id})`);
    });
  }
});

socket.on("environment-status-update", data => {
  console.log("");
  console.log("⚙️  Received: environment-status-update");
  console.log(`   Workspace: ${data.workspaceId}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Started at: ${data.startedAt || "N/A"}`);
});

socket.on("workspace-components", data => {
  console.log("");
  console.log("🧩 Received: workspace-components");
  console.log(`   Workspace: ${data.workspaceId}`);
  console.log(`   Components: ${data.components?.length || 0}`);
});

socket.on("workspace-error", data => {
  console.error("");
  console.error("❌ workspace-error:", data);
});

socket.on("environment-status-error", data => {
  console.error("");
  console.error("❌ environment-status-error:", data);
});

socket.onAny((eventName, ...args) => {
  const knownEvents = [
    "connect",
    "disconnect",
    "connect_error",
    "workspace-documents",
    "environment-status-update",
    "workspace-components",
    "workspace-error",
    "environment-status-error",
  ];

  if (!knownEvents.includes(eventName)) {
    console.log("");
    console.log(`📨 Event: ${eventName}`);
    console.log("   Data:", args);
  }
});

setTimeout(() => {
  if (socket.connected) {
    console.log("");
    console.log("🧪 Testing additional events...");
    console.log("");

    console.log("📤 Emitting: get-environment-status");
    socket.emit("get-environment-status", { workspaceId: CONFIG.workspaceId });
  } else {
    console.error("");
    console.error("❌ Not connected after 3 seconds");
    process.exit(1);
  }
}, 3000);

setTimeout(() => {
  console.log("");
  console.log("✅ Test completed successfully");
  console.log("");
  console.log("📤 Emitting: leave-workspace");
  socket.emit("leave-workspace", { workspaceId: CONFIG.workspaceId });

  setTimeout(() => {
    socket.disconnect();
    process.exit(0);
  }, 500);
}, 8000);

process.on("SIGINT", () => {
  console.log("");
  console.log("⚠️  Interrupted, cleaning up...");
  socket.emit("leave-workspace", { workspaceId: CONFIG.workspaceId });
  socket.disconnect();
  process.exit(0);
});
