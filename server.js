import http from "node:http";
import { readFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const port = Number(process.env.PORT || 3000);
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webmanifest": "application/manifest+json"
};

function send(res, status, data, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "Cache-Control": "no-store" });
  res.end(typeof data === "string" ? data : JSON.stringify(data));
}

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 100_000) throw new Error("Request too large");
  }
  return JSON.parse(raw || "{}");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/status") {
    return send(res, 200, { aiConnected: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL || "gpt-6.2-sol" });
  }

  if (req.method === "POST" && url.pathname === "/api/chat") {
    try {
      const body = await readBody(req);
      const message = String(body.message || "").trim();
      const employee = String(body.employee || "AI Manager").slice(0, 80);
      const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
      if (!message) return send(res, 400, { error: "Please enter a message." });
      if (!process.env.OPENAI_API_KEY) {
        return send(res, 503, { error: "AI is not connected yet. Add OPENAI_API_KEY to the server environment to enable live AI. Demo mode is still available in the app." });
      }

      const instructions = `You are ${employee}, an employee in a small virtual general-purpose company. You report to the human CEO. Be practical, concise, and transparent. You may plan, research from your own knowledge, draft, analyze, and propose tasks. You cannot claim to have sent messages, spent money, accessed private accounts, browsed live websites, or completed external actions unless a connected tool actually did so. Ask for CEO approval before any external, financial, irreversible, or privacy-impacting action. When useful, structure your answer as: Summary, Steps, Deliverable, Approval needed.`;
      const input = [
        ...history.filter(x => x && ["user", "assistant"].includes(x.role)).map(x => ({ role: x.role, content: String(x.content).slice(0, 5000) })),
        { role: "user", content: message }
      ];
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-6.2-sol",
          instructions,
          input,
          max_output_tokens: 900
        })
      });
      const result = await response.json();
      if (!response.ok) {
        return send(res, response.status, { error: result?.error?.message || "AI request failed." });
      }
      return send(res, 200, { reply: result.output_text || "I couldn't produce a text response. Please try again." });
    } catch (error) {
      return send(res, 500, { error: error.message || "Server error." });
    }
  }

  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, { error: "Method not allowed." });
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.normalize(path.join(publicDir, pathname));
  if (!filePath.startsWith(publicDir)) return send(res, 403, { error: "Forbidden" });
  try {
    const stat = await import("node:fs/promises").then(fs => fs.stat(filePath));
    if (!stat.isFile()) throw new Error("Not a file");
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
    if (req.method === "HEAD") return res.end();
    createReadStream(filePath).pipe(res);
  } catch {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Virtual AI Company running on http://localhost:${port}`);
});
