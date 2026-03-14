const { createServer } = require("http");
const { parse } = require("url");

const next = require("next");
const httpProxy = require("http-proxy");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const proxy = httpProxy.createProxyServer();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  })
    .on("upgrade", (req, socket, head) => {
      proxy.ws(req, socket, head, {
        target: "ws://192.168.1.76:8080",
        changeOrigin: true,
      });
    })
    .listen(3000, () => console.log("> Ready on http://localhost:3000"));
});
