import http from "node:http";
import httpProxy from "http-proxy";
import WebSocket, { WebSocketServer } from "ws";

const PROXY_PORT = parseInt(process.env.PROXY_PORT ?? "4000", 10);
const UPSTREAM_URL = process.env.UPSTREAM_URL ?? "http://localhost:3000";

const upstreamWsUrl = UPSTREAM_URL.replace(/^http/, "ws");

// ---------------------------------------------------------------------------
// HTTP proxy (non-upgrade requests)
// ---------------------------------------------------------------------------
const proxy = httpProxy.createProxyServer({ target: UPSTREAM_URL, ws: true });

proxy.on("error", (err, _req, res) => {
  console.error("[proxy] HTTP error:", err.message);
  if (res && "writeHead" in res) {
    (res as http.ServerResponse).writeHead(502);
    (res as http.ServerResponse).end("Bad Gateway");
  }
});

const server = http.createServer((req, res) => {
  proxy.web(req, res);
});

// ---------------------------------------------------------------------------
// WebSocket relay
// ---------------------------------------------------------------------------
const wss = new WebSocketServer({ noServer: true });

function extractUpstreamHeaders(req: http.IncomingMessage): Record<string, string> {
  const headers: Record<string, string> = {};

  // Forward cookies
  if (req.headers.cookie) {
    headers["cookie"] = req.headers.cookie;
  }

  // Forward real client IP
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "";
  if (clientIp) {
    headers["x-forwarded-for"] = clientIp;
    headers["x-real-ip"] = clientIp;
  }

  // Forward auth token — check Authorization header first, then ?token= query param
  const authHeader = req.headers.authorization;
  if (authHeader) {
    headers["authorization"] = authHeader;
  } else {
    const url = new URL(req.url ?? "/", "http://localhost");
    const token = url.searchParams.get("token");
    if (token) {
      headers["authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
}

server.on("upgrade", (req, socket, head) => {
  wss.handleUpgrade(req, socket as never, head, (clientWs) => {
    const upstreamHeaders = extractUpstreamHeaders(req);

    // Preserve the original path (room/doc routing) when connecting upstream
    const url = new URL(req.url ?? "/", "http://localhost");
    const upstreamTarget = `${upstreamWsUrl}${url.pathname}${url.search}`;

    console.log(`[proxy] WS relay: ${req.url} → ${upstreamTarget}`);

    const upstreamWs = new WebSocket(upstreamTarget, { headers: upstreamHeaders });

    // Client → Upstream
    clientWs.on("message", (data, isBinary) => {
      if (upstreamWs.readyState === WebSocket.OPEN) {
        upstreamWs.send(data, { binary: isBinary });
      }
    });

    // Upstream → Client
    upstreamWs.on("message", (data, isBinary) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(data, { binary: isBinary });
      }
    });

    // Relay close events
    clientWs.on("close", (code, reason) => {
      if (upstreamWs.readyState === WebSocket.OPEN) {
        upstreamWs.close(code, reason);
      }
    });

    upstreamWs.on("close", (code, reason) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close(code, reason);
      }
    });

    // Error handling
    clientWs.on("error", (err) => {
      console.error("[proxy] Client WS error:", err.message);
      upstreamWs.terminate();
    });

    upstreamWs.on("error", (err) => {
      console.error("[proxy] Upstream WS error:", err.message);
      clientWs.terminate();
    });

    upstreamWs.on("open", () => {
      console.log(`[proxy] Upstream WS connected: ${upstreamTarget}`);
    });
  });
});

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
server.listen(PROXY_PORT, () => {
  console.log(`[proxy] Listening on port ${PROXY_PORT}`);
  console.log(`[proxy] Upstream: ${UPSTREAM_URL}`);
});