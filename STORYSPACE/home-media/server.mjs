import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const mediaDir = path.resolve(process.env.STORYSPACE_MEDIA_DIR || path.join(root, "media"));
const catalogFile = path.resolve(process.env.STORYSPACE_MEDIA_CATALOG_FILE || path.join(root, "catalog.json"));
const host = process.env.STORYSPACE_MEDIA_HOST || "127.0.0.1";
const port = Number(process.env.STORYSPACE_MEDIA_PORT || 8787);
const adminToken = String(process.env.STORYSPACE_MEDIA_ADMIN_TOKEN || "");
const maxUploadBytes = Number(process.env.STORYSPACE_MEDIA_MAX_UPLOAD_BYTES || 15 * 1024 ** 3);
const publicOrigin = String(process.env.STORYSPACE_MEDIA_PUBLIC_ORIGIN || "").replace(/\/+$/, "");
const allowedOrigin = String(process.env.STORYSPACE_MEDIA_CORS_ORIGIN || "*");
const types = new Map([[".mp4","video/mp4"],[".m4v","video/x-m4v"],[".webm","video/webm"],[".mov","video/quicktime"]]);

if (adminToken.length < 32) {
  console.error("Set STORYSPACE_MEDIA_ADMIN_TOKEN to a random secret of at least 32 characters.");
  process.exit(1);
}
fs.mkdirSync(mediaDir, { recursive: true });
if (!fs.existsSync(catalogFile)) fs.writeFileSync(catalogFile, "[]\n", { flag: "wx" });

function readCatalog() {
  try {
    const data = JSON.parse(fs.readFileSync(catalogFile, "utf8"));
    return Array.isArray(data) ? data.filter(x => x && /^[a-f0-9-]{36}$/i.test(x.id) && typeof x.fileName === "string") : [];
  } catch { return []; }
}
function writeCatalog(items) {
  const temp = catalogFile + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(items, null, 2) + "\n", { flag: "w", mode: 0o600 });
  fs.renameSync(temp, catalogFile);
}
function json(res, status, value) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  res.end(JSON.stringify(value));
}
function authorized(req) {
  const supplied = String(req.headers["x-storyspace-admin-token"] || "");
  const a = Buffer.from(supplied), b = Buffer.from(adminToken);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function safeTitle(value) {
  const title = String(value || "").trim().replace(/\s+/g, " ");
  return title.length > 0 && title.length <= 160 && !/[\u0000-\u001f\u007f]/.test(title) ? title : "";
}
function cors(req, res) {
  const origin = req.headers.origin;
  if (allowedOrigin === "*") res.setHeader("access-control-allow-origin", "*");
  else if (origin === allowedOrigin) res.setHeader("access-control-allow-origin", allowedOrigin);
  res.setHeader("vary", "Origin");
  res.setHeader("access-control-allow-methods", "GET, HEAD, POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, x-storyspace-admin-token, range");
  res.setHeader("access-control-expose-headers", "content-length, content-range, accept-ranges, content-type");
}
function publicItem(item) {
  return { id:item.id, title:item.title, fileName:item.fileName, contentType:item.contentType, size:item.size, addedAt:item.addedAt,
    streamUrl: (publicOrigin || "") + "/media/" + item.id };
}
async function handle(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
  const url = new URL(req.url || "/", "http://localhost");
  if (url.pathname === "/health" && req.method === "GET") return json(res, 200, { ok:true, service:"storyspace-home-media", version:1 });
  if (url.pathname === "/api/catalog" && req.method === "GET") return json(res, 200, readCatalog().map(publicItem));
  if (url.pathname === "/admin/upload" && req.method === "POST") {
    if (!authorized(req)) return json(res, 401, { error:"Unauthorized" });
    const title = safeTitle(url.searchParams.get("title"));
    if (!title) return json(res, 400, { error:"Provide a title (1–160 characters) in ?title=" });
    const ext = path.extname(url.searchParams.get("filename") || "").toLowerCase();
    const contentType = types.get(ext);
    if (!contentType) return json(res, 415, { error:"Supported file types: MP4, M4V, WebM, MOV" });
    const declared = Number(req.headers["content-length"] || 0);
    if (declared > maxUploadBytes) return json(res, 413, { error:"Upload exceeds configured size limit" });
    const id = crypto.randomUUID();
    const fileName = id + ext;
    const destination = path.join(mediaDir, fileName);
    let bytes = 0;
    const limiter = new (await import("node:stream")).Transform({
      transform(chunk, enc, cb) {
        bytes += chunk.length;
        if (bytes > maxUploadBytes) cb(Object.assign(new Error("Upload exceeds configured size limit"), { statusCode:413 }));
        else cb(null, chunk);
      }
    });
    try {
      await pipeline(req, limiter, fs.createWriteStream(destination, { flags:"wx", mode:0o600 }));
      if (!bytes) { fs.rmSync(destination, { force:true }); return json(res, 400, { error:"Empty upload" }); }
      const items = readCatalog();
      const item = { id, title, fileName, contentType, size:bytes, addedAt:new Date().toISOString(), published:true };
      items.push(item); writeCatalog(items);
      return json(res, 201, publicItem(item));
    } catch (error) {
      fs.rmSync(destination, { force:true });
      return json(res, error.statusCode || 400, { error:error.statusCode === 413 ? "Upload exceeds configured size limit" : "Upload failed" });
    }
  }
  const match = url.pathname.match(/^\/media\/([a-f0-9-]{36})$/i);
  if (match && (req.method === "GET" || req.method === "HEAD")) {
    const item = readCatalog().find(x => x.id === match[1] && x.published === true);
    if (!item) return json(res, 404, { error:"Media not found" });
    const file = path.join(mediaDir, item.fileName);
    let stat;
    try { stat = fs.statSync(file); } catch { return json(res, 404, { error:"Media file is offline" }); }
    if (!stat.isFile() || path.basename(file) !== item.fileName) return json(res, 404, { error:"Media not found" });
    const headers = { "content-type":item.contentType, "accept-ranges":"bytes", "cache-control":"public, max-age=60", "content-disposition":"inline; filename=\""+item.fileName+"\"", "x-content-type-options":"nosniff" };
    const range = req.headers.range;
    if (range) {
      const m = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!m) { res.writeHead(416, { "content-range":"bytes */"+stat.size }); return res.end(); }
      let start = m[1] ? Number(m[1]) : NaN, end = m[2] ? Number(m[2]) : NaN;
      if (Number.isNaN(start)) { const suffix = end; if (!suffix) { res.writeHead(416, { "content-range":"bytes */"+stat.size }); return res.end(); } start = Math.max(0, stat.size-suffix); end = stat.size-1; }
      else if (Number.isNaN(end)) end = stat.size-1;
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end < start || start >= stat.size) { res.writeHead(416, { "content-range":"bytes */"+stat.size }); return res.end(); }
      end = Math.min(end, stat.size-1);
      headers["content-range"] = "bytes "+start+"-"+end+"/"+stat.size;
      headers["content-length"] = String(end-start+1);
      res.writeHead(206, headers);
      if (req.method === "HEAD") return res.end();
      return fs.createReadStream(file, { start, end }).pipe(res);
    }
    headers["content-length"] = String(stat.size);
    res.writeHead(200, headers);
    if (req.method === "HEAD") return res.end();
    return fs.createReadStream(file).pipe(res);
  }
  return json(res, 404, { error:"Not found" });
}
const server = http.createServer((req,res) => { handle(req,res).catch(() => { if (!res.headersSent) json(res,500,{error:"Internal server error"}); else res.destroy(); }); });
server.listen(port, host, () => console.log("Storyspace Home Media listening on http://"+host+":"+port+" (loopback only)"));
process.on("SIGINT", () => server.close(() => process.exit(0)));
process.on("SIGTERM", () => server.close(() => process.exit(0)));
