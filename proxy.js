"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
var node_http_1 = __importDefault(require("node:http"));
var http_proxy_1 = __importDefault(require("http-proxy"));
var ws_1 = __importStar(require("ws"));
var PROXY_PORT = parseInt((_a = process.env.PROXY_PORT) !== null && _a !== void 0 ? _a : "4000", 10);
var UPSTREAM_URL = (_b = process.env.UPSTREAM_URL) !== null && _b !== void 0 ? _b : "http://localhost:3000";
var upstreamWsUrl = UPSTREAM_URL.replace(/^http/, "ws");
// ---------------------------------------------------------------------------
// HTTP proxy (non-upgrade requests)
// ---------------------------------------------------------------------------
var proxy = http_proxy_1.default.createProxyServer({ target: UPSTREAM_URL, ws: true });
proxy.on("error", function (err, _req, res) {
    console.error("[proxy] HTTP error:", err.message);
    if (res && "writeHead" in res) {
        res.writeHead(502);
        res.end("Bad Gateway");
    }
});
var server = node_http_1.default.createServer(function (req, res) {
    proxy.web(req, res);
});
// ---------------------------------------------------------------------------
// WebSocket relay
// ---------------------------------------------------------------------------
var wss = new ws_1.WebSocketServer({ noServer: true });
function extractUpstreamHeaders(req) {
    var _a, _b, _c, _d, _e;
    var headers = {};
    // Forward cookies
    if (req.headers.cookie) {
        headers["cookie"] = req.headers.cookie;
    }
    // Forward real client IP
    var clientIp = (_d = (_c = (_b = (_a = req.headers["x-forwarded-for"]) === null || _a === void 0 ? void 0 : _a.split(",")[0]) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : req.socket.remoteAddress) !== null && _d !== void 0 ? _d : "";
    if (clientIp) {
        headers["x-forwarded-for"] = clientIp;
        headers["x-real-ip"] = clientIp;
    }
    // Forward auth token — check Authorization header first, then ?token= query param
    var authHeader = req.headers.authorization;
    if (authHeader) {
        headers["authorization"] = authHeader;
    }
    else {
        var url = new URL((_e = req.url) !== null && _e !== void 0 ? _e : "/", "http://localhost");
        var token = url.searchParams.get("token");
        if (token) {
            headers["authorization"] = "Bearer ".concat(token);
        }
    }
    return headers;
}
server.on("upgrade", function (req, socket, head) {
    wss.handleUpgrade(req, socket, head, function (clientWs) {
        var _a;
        var upstreamHeaders = extractUpstreamHeaders(req);
        // Preserve the original path (room/doc routing) when connecting upstream
        var url = new URL((_a = req.url) !== null && _a !== void 0 ? _a : "/", "http://localhost");
        var upstreamTarget = "".concat(upstreamWsUrl).concat(url.pathname).concat(url.search);
        console.log("[proxy] WS relay: ".concat(req.url, " \u2192 ").concat(upstreamTarget));
        var upstreamWs = new ws_1.default(upstreamTarget, { headers: upstreamHeaders });
        // Client → Upstream
        clientWs.on("message", function (data, isBinary) {
            if (upstreamWs.readyState === ws_1.default.OPEN) {
                upstreamWs.send(data, { binary: isBinary });
            }
        });
        // Upstream → Client
        upstreamWs.on("message", function (data, isBinary) {
            if (clientWs.readyState === ws_1.default.OPEN) {
                clientWs.send(data, { binary: isBinary });
            }
        });
        // Relay close events
        clientWs.on("close", function (code, reason) {
            if (upstreamWs.readyState === ws_1.default.OPEN) {
                upstreamWs.close(code, reason);
            }
        });
        upstreamWs.on("close", function (code, reason) {
            if (clientWs.readyState === ws_1.default.OPEN) {
                clientWs.close(code, reason);
            }
        });
        // Error handling
        clientWs.on("error", function (err) {
            console.error("[proxy] Client WS error:", err.message);
            upstreamWs.terminate();
        });
        upstreamWs.on("error", function (err) {
            console.error("[proxy] Upstream WS error:", err.message);
            clientWs.terminate();
        });
        upstreamWs.on("open", function () {
            console.log("[proxy] Upstream WS connected: ".concat(upstreamTarget));
        });
    });
});
// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------
server.listen(PROXY_PORT, function () {
    console.log("[proxy] Listening on port ".concat(PROXY_PORT));
    console.log("[proxy] Upstream: ".concat(UPSTREAM_URL));
});
