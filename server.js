import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = __dirname;
const preferredPort = Number(process.env.PORT || 4173);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

async function handleRequest(req, res) {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
    const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    let filePath = join(root, safePath);
    try {
      const fileStat = await stat(filePath);
      if (fileStat.isDirectory()) {
        filePath = join(filePath, "index.html");
      }
    } catch (error) {
      if (String(error?.code || "") === "ENOENT" && !extname(filePath)) {
        filePath = join(filePath, "index.html");
      } else {
        throw error;
      }
    }
    const file = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(file);
  } catch (error) {
    const notFound = String(error?.code || "") === "ENOENT";
    res.writeHead(notFound ? 404 : 500, {
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end(notFound ? "Not Found" : "Server Error");
  }
}

function listen(server, port) {
  return new Promise((resolve, reject) => {
    const onError = (error) => {
      server.off("listening", onListening);
      reject(error);
    };

    const onListening = () => {
      server.off("error", onError);
      resolve();
    };

    server.once("error", onError);
    server.once("listening", onListening);
    server.listen(port);
  });
}

let started = false;

for (let port = preferredPort; port < preferredPort + 20; port += 1) {
  const server = createServer(handleRequest);

  try {
    await listen(server, port);
    console.log(`AI Portal Studio running at http://localhost:${port}`);
    started = true;
    break;
  } catch (error) {
    server.close();
    if (error?.code !== "EADDRINUSE") {
      throw error;
    }
  }
}

if (!started) {
  throw new Error(`Could not find a free port starting from ${preferredPort}`);
}
