import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pipeline } from "node:stream/promises";
import { Transform } from "node:stream";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const mediaDir = path.resolve(process.env.STORYSPACE_MEDIA_DIR || path.join(root, "media"));
const stagingDir = path.resolve(process.env.STORYSPACE_MEDIA_STAGING_DIR || path.join(root, ".uploads"));
const catalogFile = path.resolve(process.env.STORYSPACE_MEDIA_CATALOG_FILE || path.join(root, "catalog.json"));
const host = process.env.STORYSPACE_MEDIA_HOST || "127.0.0.1";
if (!["127.0.0.1","::1","localhost"].includes(host)) {
  console.error("STORYSPACE_MEDIA_HOST must be a loopback address (127.0.0.1, ::1, or localhost).");
  process.exit(1);
}
function readIntegerSetting(name, fallback, min, max) {
  const raw = process.env[name];
  const value = raw === undefined || raw === "" ? fallback : Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    console.error(name + " must be an integer between " + min + " and " + max + ".");
    process.exit(1);
  }
  return value;
}
const port = readIntegerSetting("STORYSPACE_MEDIA_PORT", 8787, 0, 65535);
const adminToken = String(process.env.STORYSPACE_MEDIA_ADMIN_TOKEN || "");
const uploadToken = String(process.env.STORYSPACE_MEDIA_UPLOAD_TOKEN || "");
const maxUploadBytes = readIntegerSetting("STORYSPACE_MEDIA_MAX_UPLOAD_BYTES", 15 * 1024 ** 3, 1, Number.MAX_SAFE_INTEGER);
const maxChunkBytes = readIntegerSetting("STORYSPACE_MEDIA_MAX_CHUNK_BYTES", 8 * 1024 ** 2, 1, Number.MAX_SAFE_INTEGER);
const uploadSessionTtlMs = readIntegerSetting("STORYSPACE_MEDIA_SESSION_TTL_MS", 7 * 24 * 60 * 60 * 1000, 60 * 60 * 1000, Number.MAX_SAFE_INTEGER);
if (maxChunkBytes > maxUploadBytes) {
  console.error("STORYSPACE_MEDIA_MAX_CHUNK_BYTES cannot exceed STORYSPACE_MEDIA_MAX_UPLOAD_BYTES.");
  process.exit(1);
}

const publicOrigin = String(process.env.STORYSPACE_MEDIA_PUBLIC_ORIGIN || "").replace(/\/+$/, "");
const allowedOrigin = String(process.env.STORYSPACE_MEDIA_CORS_ORIGIN || "*");
const types = new Map([[".mp4","video/mp4"],[".m4v","video/x-m4v"],[".webm","video/webm"],[".mov","video/quicktime"]]);

if (adminToken.length < 32 || uploadToken.length < 32) {
  console.error("Set STORYSPACE_MEDIA_ADMIN_TOKEN and STORYSPACE_MEDIA_UPLOAD_TOKEN to separate random secrets (32+ characters).");
  process.exit(1);
}
fs.mkdirSync(mediaDir, { recursive:true });
fs.mkdirSync(stagingDir, { recursive:true });
if (!fs.existsSync(catalogFile)) fs.writeFileSync(catalogFile, "[]\n", { flag:"wx" });

const sessionLocks = new Map();
function removeExpiredUploadSessions(now=Date.now()) {
  let removed=0;
  let entries;
  try { entries=fs.readdirSync(stagingDir,{withFileTypes:true}); }
  catch(error) {
    if(error.code==="ENOENT")return removed;
    throw error;
  }
  const ids=new Set();
  for (const entry of entries) {
    const match=entry.isFile() && entry.name.match(/^([a-f0-9-]{36})\\.(?:json|part)$/i);
    if (match) ids.add(match[1]);
  }
  for (const id of ids) {
    if(sessionLocks.has(id))continue;
    const files=sessionPaths(id);
    const activity=[files.data,files.part].reduce((latest,file)=>{
      try { return Math.max(latest,fs.statSync(file).mtimeMs); } catch { return latest; }
    },0);
    if (!activity || now-activity < uploadSessionTtlMs)continue;
    try {
      fs.rmSync(files.data,{force:true});
      fs.rmSync(files.part,{force:true});
      removed++;
    } catch(error) {
      console.warn("Could not remove expired upload session",id,error);
    }
  }
  return removed;
}
try { removeExpiredUploadSessions(); }
catch(error) { console.warn("Initial upload session cleanup failed",error); }
const uploadSessionCleanup=setInterval(()=>{try{removeExpiredUploadSessions()}catch(error){console.warn("Upload session cleanup failed",error)}},30*60*1000);
uploadSessionCleanup.unref?.();

function isValidCatalogItem(item) {
  if (!item || !/^[a-f0-9-]{36}$/i.test(String(item.id || ""))) return false;
  if (typeof item.fileName !== "string" || path.basename(item.fileName) !== item.fileName) return false;
  const extension = path.extname(item.fileName).toLowerCase();
  return item.fileName === item.id + extension &&
    types.has(extension) && item.contentType === types.get(extension) &&
    safeTitle(item.title) !== "" &&
    Number.isSafeInteger(item.size) && item.size > 0 &&
    typeof item.addedAt === "string";
}
function readCatalog() {
  try {
    const data = JSON.parse(fs.readFileSync(catalogFile, "utf8"));
    return Array.isArray(data) ? data.filter(isValidCatalogItem) : [];
  } catch { return []; }
}
function writeCatalog(items) {
  const temp = catalogFile + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(items, null, 2) + "\n", { flag:"w", mode:0o600 });
  fs.renameSync(temp, catalogFile);
}

// Serialize catalog read-modify-write transactions across different uploads.
let catalogQueue=Promise.resolve();
async function withCatalogLock(task) {
  const previous=catalogQueue;
  let release;
  catalogQueue=new Promise(resolve=>{release=resolve;});
  await previous.catch(()=>{});
  try { return await task(); }
  finally { release(); }
}
function json(res, status, value) {
  res.writeHead(status, { "content-type":"application/json; charset=utf-8", "cache-control":"no-store", "x-content-type-options":"nosniff" });
  res.end(JSON.stringify(value));
}
function secretMatches(supplied, expected) {
  const a = Buffer.from(String(supplied || "")), b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a,b);
}
function isAdmin(req) { return secretMatches(req.headers["x-storyspace-admin-token"], adminToken); }
function isUploader(req) { return secretMatches(req.headers["x-storyspace-upload-token"], uploadToken); }
function safeTitle(value) {
  const title = String(value || "").trim().replace(/\s+/g, " ");
  return title.length > 0 && title.length <= 160 && !/[\u0000-\u001f\u007f]/.test(title) ? title : "";
}
function cors(res) {
  if (allowedOrigin === "*") res.setHeader("access-control-allow-origin", "*");
  else res.setHeader("access-control-allow-origin", allowedOrigin);
  res.setHeader("vary", "Origin");
  res.setHeader("access-control-allow-methods", "GET, HEAD, POST, PUT, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type, x-storyspace-admin-token, x-storyspace-upload-token, x-upload-offset, range");
  res.setHeader("access-control-expose-headers", "content-length, content-range, accept-ranges, content-type, upload-offset");
}
function publicItem(item) {
  return { id:item.id, title:item.title, fileName:item.fileName, contentType:item.contentType, size:item.size, addedAt:item.addedAt,
    streamUrl:(publicOrigin || "") + "/media/" + item.id };
}
function sessionPaths(id) {
  if (!/^[a-f0-9-]{36}$/i.test(id)) return null;
  return { data:path.join(stagingDir,id+".json"), part:path.join(stagingDir,id+".part") };
}
function readSession(id) {
  const files=sessionPaths(id);
  if (!files || !fs.existsSync(files.data)) return null;
  // Enforce retention during the lifetime of the process, not only at startup.
  // The newest metadata or chunk timestamp represents the session's last activity.
  const activity=[files.data,files.part].reduce((latest,file)=>{
    try { return Math.max(latest,fs.statSync(file).mtimeMs); } catch { return latest; }
  },0);
  if (!activity || Date.now()-activity >= uploadSessionTtlMs) {
    fs.rmSync(files.data,{force:true});
    fs.rmSync(files.part,{force:true});
    return null;
  }
  try {
    const value=JSON.parse(fs.readFileSync(files.data,"utf8"));
    const partStat=fs.statSync(files.part);
    const valid=value.id===id && safeTitle(value.title)!=="" &&
      typeof value.extension==="string" && types.has(value.extension) &&
      value.contentType===types.get(value.extension) &&
      Number.isSafeInteger(value.size) && value.size>0 && value.size<=maxUploadBytes &&
      Number.isSafeInteger(value.offset) && value.offset>=0 && value.offset<=value.size &&
      partStat.isFile() && partStat.size<=value.size;
    if (!valid) {
      fs.rmSync(files.data,{force:true});
      fs.rmSync(files.part,{force:true});
      return null;
    }
    return value;
  } catch {
    fs.rmSync(files.data,{force:true});
    fs.rmSync(files.part,{force:true});
    return null;
  }
}
function writeSession(session) {
  const files=sessionPaths(session.id), temp=files.data+".tmp";
  fs.writeFileSync(temp,JSON.stringify(session),{mode:0o600});
  fs.renameSync(temp,files.data);
}

// Reconcile durable staging files after an unclean process exit.
function recoverUploadSessions() {
  for (const entry of fs.readdirSync(stagingDir,{withFileTypes:true})) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const id=entry.name.slice(0,-5), files=sessionPaths(id);
    if (!files) continue;
    let session;
    try { session=JSON.parse(fs.readFileSync(files.data,"utf8")); } catch { session=null; }
    const valid=session && session.id===id && safeTitle(session.title) && types.has(session.extension) &&
      types.get(session.extension)===session.contentType && Number.isSafeInteger(session.size) && session.size>0 &&
      session.size<=maxUploadBytes && Number.isSafeInteger(session.offset) && session.offset>=0;
    if (!valid || !fs.existsSync(files.part)) {
      fs.rmSync(files.data,{force:true});
      fs.rmSync(files.part,{force:true});
      continue;
    }
    const actual=fs.statSync(files.part).size;
    if (actual>session.size) {
      fs.rmSync(files.data,{force:true});
      fs.rmSync(files.part,{force:true});
      continue;
    }
    if (session.offset!==actual) { session.offset=actual; writeSession(session); }
  }
}
recoverUploadSessions();

// Serialize mutations and offset reads for each upload within this server process.
async function withSessionLock(id, task) {
  const previous = sessionLocks.get(id) || Promise.resolve();
  let release;
  const current = new Promise(resolve => { release = resolve; });
  sessionLocks.set(id, current);
  await previous.catch(() => {});
  try { return await task(); }
  finally {
    release();
    if (sessionLocks.get(id) === current) sessionLocks.delete(id);
  }
}
async function readJson(req, limit=16*1024) {
  const chunks=[]; let size=0;
  for await (const chunk of req) { size+=chunk.length; if(size>limit) throw Object.assign(new Error("Request too large"),{statusCode:413}); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw Object.assign(new Error("Invalid JSON"),{statusCode:400}); }
}
async function handle(req,res) {
  cors(res);
  if(req.method==="OPTIONS"){res.writeHead(204);return res.end();}
  const url=new URL(req.url||"/","http://localhost");
  if(url.pathname==="/health"&&req.method==="GET") return json(res,200,{ok:true,service:"storyspace-home-media",version:2});
  if(url.pathname==="/api/catalog"&&req.method==="GET") return json(res,200,readCatalog().filter(x=>x.published===true).map(publicItem));

  // Explicit, non-mutating credential checks let clients distinguish uploader and owner keys.
  if(url.pathname==="/api/auth/verify/uploader"&&req.method==="POST"){
    if(!isUploader(req)) return json(res,401,{error:"Uploader invitation key was rejected"});
    return json(res,200,{ok:true,role:"uploader"});
  }
  if(url.pathname==="/api/auth/verify/admin"&&req.method==="POST"){
    if(!isAdmin(req)) return json(res,401,{error:"Owner admin key was rejected"});
    return json(res,200,{ok:true,role:"admin"});
  }

  if(url.pathname==="/api/uploads/init"&&req.method==="POST"){
    if(!isUploader(req)) return json(res,401,{error:"Upload invitation required"});
    const body=await readJson(req);
    const title=safeTitle(body.title), ext=path.extname(String(body.filename||"")).toLowerCase(), contentType=types.get(ext);
    const size=Number(body.size);
    if(!title) return json(res,400,{error:"Title must be 1–160 characters"});
    if(!contentType) return json(res,415,{error:"Supported formats: MP4, M4V, WebM, MOV"});
    if(!Number.isSafeInteger(size)||size<1||size>maxUploadBytes) return json(res,413,{error:"Invalid file size or upload limit exceeded"});
    const id=crypto.randomUUID(), session={id,title,extension:ext,contentType,size,offset:0,createdAt:new Date().toISOString()};
    const files=sessionPaths(id);
    fs.writeFileSync(files.part,Buffer.alloc(0),{flag:"wx",mode:0o600});
    writeSession(session);
    return json(res,201,{uploadId:id,offset:0,chunkSize:maxChunkBytes,status:"uploading"});
  }

  const chunkMatch=url.pathname.match(/^\/api\/uploads\/([a-f0-9-]{36})\/chunk$/i);
  if(chunkMatch&&req.method==="PUT"){
    return withSessionLock(chunkMatch[1], async () => {
    if(!isUploader(req)) return json(res,401,{error:"Upload invitation required"});
    const session=readSession(chunkMatch[1]); if(!session) return json(res,404,{error:"Upload session not found"});
    const files=sessionPaths(session.id), current=fs.statSync(files.part).size;
    const offset=Number(req.headers["x-upload-offset"]);
    if(!Number.isSafeInteger(offset)||offset!==current||offset!==session.offset) return json(res,409,{error:"Upload offset mismatch",offset:current});
    const declaredLength=req.headers["content-length"];
    if(declaredLength!==undefined){
      const expected=Number(declaredLength);
      if(!Number.isSafeInteger(expected)||expected<0) return json(res,400,{error:"Invalid chunk length"});
      if(expected===0) return json(res,400,{error:"Empty chunk"});
      if(expected>maxChunkBytes||current+expected>session.size) return json(res,413,{error:"Chunk exceeds limit"});
    }
    let received=0;
    const limiter=new Transform({transform(chunk,enc,cb){received+=chunk.length;if(received>maxChunkBytes||current+received>session.size)cb(Object.assign(new Error("Chunk too large"),{statusCode:413}));else cb(null,chunk);}});
    try{
      await pipeline(req,limiter,fs.createWriteStream(files.part,{flags:"a",mode:0o600}));
      if(received===0) return json(res,400,{error:"Empty chunk"});
      session.offset=current+received;writeSession(session);
      return json(res,200,{uploadId:session.id,offset:session.offset,complete:session.offset===session.size});
    }catch(error){return json(res,error.statusCode||400,{error:error.statusCode===413?"Chunk exceeds limit":"Chunk upload failed",offset:fs.existsSync(files.part)?fs.statSync(files.part).size:0});}
    });
  }

  const statusMatch=url.pathname.match(/^\/api\/uploads\/([a-f0-9-]{36})$/i);
  if(statusMatch&&req.method==="GET"){
    return withSessionLock(statusMatch[1], async () => {
    if(!isUploader(req)) return json(res,401,{error:"Upload invitation required"});
    const session=readSession(statusMatch[1]);if(!session)return json(res,404,{error:"Upload session not found"});
    const files=sessionPaths(session.id),offset=fs.existsSync(files.part)?fs.statSync(files.part).size:0;
    if(offset!==session.offset){session.offset=offset;writeSession(session);}
    return json(res,200,{uploadId:session.id,offset:session.offset,size:session.size,chunkSize:maxChunkBytes,status:"uploading"});
    });
  }

  if(statusMatch&&req.method==="DELETE"){
    return withSessionLock(statusMatch[1], async () => {
      if(!isUploader(req)) return json(res,401,{error:"Upload invitation required"});
      const session=readSession(statusMatch[1]);
      if(!session) return json(res,404,{error:"Upload session not found"});
      const files=sessionPaths(session.id);
      fs.rmSync(files.part,{force:true});
      fs.rmSync(files.data,{force:true});
      return json(res,200,{uploadId:session.id,status:"cancelled"});
    });
  }

  const completeMatch=url.pathname.match(/^\/api\/uploads\/([a-f0-9-]{36})\/complete$/i);
  if(completeMatch&&req.method==="POST"){
    return withSessionLock(completeMatch[1], async () => {
    if(!isUploader(req)) return json(res,401,{error:"Upload invitation required"});
    const session=readSession(completeMatch[1]);if(!session)return json(res,404,{error:"Upload session not found"});
    const files=sessionPaths(session.id),actual=fs.statSync(files.part).size;
    if(actual!==session.size||session.offset!==session.size)return json(res,409,{error:"Upload is incomplete",offset:actual,size:session.size});
    return withCatalogLock(async()=>{
      const fileName=session.id+session.extension,destination=path.join(mediaDir,fileName);
      if(fs.existsSync(destination)) return json(res,409,{error:"Media destination already exists"});
      fs.renameSync(files.part,destination);
      const item={id:session.id,title:session.title,fileName,contentType:session.contentType,size:session.size,addedAt:new Date().toISOString(),published:false,uploadedBy:"invite"};
      try { const items=readCatalog();items.push(item);writeCatalog(items); }
      catch(error) { try { fs.renameSync(destination,files.part); } catch {} throw error; }
      fs.rmSync(files.data,{force:true});
      return json(res,201,{id:item.id,title:item.title,size:item.size,status:"pending_approval"});
    });
    });
  }

  if(url.pathname==="/admin/pending"&&req.method==="GET"){
    if(!isAdmin(req))return json(res,401,{error:"Admin authorization required"});
    return json(res,200,readCatalog().filter(x=>x.published!==true).map(x=>({id:x.id,title:x.title,fileName:x.fileName,size:x.size,addedAt:x.addedAt,uploadedBy:x.uploadedBy||"admin"})));
  }
  const reviewMatch=url.pathname.match(/^\/admin\/review\/([a-f0-9-]{36})$/i);
  if(reviewMatch&&req.method==="POST"){
    if(!isAdmin(req))return json(res,401,{error:"Admin authorization required"});
    const body=await readJson(req),action=String(body.action||"");
    if(!["approve","reject"].includes(action))return json(res,400,{error:"Action must be approve or reject"});
    return withCatalogLock(async()=>{
      const items=readCatalog(),index=items.findIndex(x=>x.id===reviewMatch[1]);
      if(index<0||items[index].published===true)return json(res,404,{error:"Pending upload not found"});
      if(action==="approve"){items[index].published=true;items[index].approvedAt=new Date().toISOString();writeCatalog(items);return json(res,200,{id:items[index].id,status:"published"});}
      const item=items[index];items.splice(index,1);writeCatalog(items);fs.rmSync(path.join(mediaDir,item.fileName),{force:true});
      return json(res,200,{id:item.id,status:"rejected"});
    });
  }

  if(url.pathname==="/admin/upload"&&req.method==="POST"){
    if(!isAdmin(req))return json(res,401,{error:"Unauthorized"});
    const title=safeTitle(url.searchParams.get("title")),ext=path.extname(url.searchParams.get("filename")||"").toLowerCase(),contentType=types.get(ext);
    if(!title)return json(res,400,{error:"Provide a valid title"});if(!contentType)return json(res,415,{error:"Unsupported file type"});
    const declared=Number(req.headers["content-length"]||0);if(declared>maxUploadBytes)return json(res,413,{error:"Upload exceeds configured size limit"});
    const id=crypto.randomUUID(),fileName=id+ext,destination=path.join(mediaDir,fileName);let bytes=0;
    const limiter=new Transform({transform(chunk,enc,cb){bytes+=chunk.length;if(bytes>maxUploadBytes)cb(Object.assign(new Error("Too large"),{statusCode:413}));else cb(null,chunk);}});
    try{
      await pipeline(req,limiter,fs.createWriteStream(destination,{flags:"wx",mode:0o600}));
      if(!bytes){fs.rmSync(destination,{force:true});return json(res,400,{error:"Empty upload"});}
      const item={id,title,fileName,contentType,size:bytes,addedAt:new Date().toISOString(),published:false,uploadedBy:"admin"};
      await withCatalogLock(async()=>{const items=readCatalog();items.push(item);writeCatalog(items);});
      return json(res,201,{...publicItem(item),status:"pending_approval"});
    }catch(error){fs.rmSync(destination,{force:true});return json(res,error.statusCode||400,{error:error.statusCode===413?"Upload exceeds configured size limit":"Upload failed"});}
  }

  const match=url.pathname.match(/^\/media\/([a-f0-9-]{36})$/i);
  if(match&&(req.method==="GET"||req.method==="HEAD")){
    const item=readCatalog().find(x=>x.id===match[1]&&x.published===true);
    if(!item)return json(res,404,{error:"Media not found"});
    const file=path.join(mediaDir,item.fileName);let stat;
    try{stat=fs.statSync(file);}catch{return json(res,404,{error:"Media file is offline"});}
    if(!stat.isFile()||path.basename(file)!==item.fileName)return json(res,404,{error:"Media not found"});
    if(stat.size!==item.size)return json(res,503,{error:"Media file failed its catalog size integrity check"});
    const etag='"'+stat.size.toString(16)+'-'+Math.trunc(stat.mtimeMs).toString(16)+'"';
    const headers={"content-type":item.contentType,"accept-ranges":"bytes","cache-control":"public, max-age=60","etag":etag,"last-modified":stat.mtime.toUTCString(),"content-disposition":"inline; filename=\""+item.fileName+"\"","x-content-type-options":"nosniff"};
    if(req.headers["if-none-match"]===etag){res.writeHead(304,headers);return res.end();}
    let range=req.headers.range;
    if(range&&req.headers["if-range"]&&req.headers["if-range"]!==etag&&req.headers["if-range"]!==headers["last-modified"]) range=null;
    let start=0,end=stat.size-1,status=200;
    if(range){
      const parsed=/^bytes=(\d*)-(\d*)$/.exec(range.trim());
      if(!parsed||stat.size===0){res.writeHead(416,{"content-range":"bytes */"+stat.size,"cache-control":"no-store"});return res.end();}
      const first=parsed[1],last=parsed[2];
      if(!first&&!last){res.writeHead(416,{"content-range":"bytes */"+stat.size,"cache-control":"no-store"});return res.end();}
      if(!first){
        const suffix=Number(last);
        if(!Number.isSafeInteger(suffix)||suffix<=0){res.writeHead(416,{"content-range":"bytes */"+stat.size,"cache-control":"no-store"});return res.end();}
        start=Math.max(0,stat.size-suffix);
      }else{
        start=Number(first);
        end=last?Number(last):stat.size-1;
        if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||start>=stat.size){res.writeHead(416,{"content-range":"bytes */"+stat.size,"cache-control":"no-store"});return res.end();}
        end=Math.min(end,stat.size-1);
      }
      status=206;
      headers["content-range"]="bytes "+start+"-"+end+"/"+stat.size;
    }
    headers["content-length"]=String(status===206?end-start+1:stat.size);
    res.writeHead(status,headers);
    if(req.method==="HEAD")return res.end();
    await pipeline(fs.createReadStream(file,{start,end}),res);
    return;
  }
  return json(res,404,{error:"Not found"});
}
const server=http.createServer((req,res)=>{handle(req,res).catch(error=>{if(!res.headersSent)json(res,error.statusCode||500,{error:error.statusCode===413?"Request too large":"Internal server error"});else res.destroy();});});
// Bound slow headers and idle keep-alive sockets without imposing a short cap on large uploads.
server.headersTimeout = 15_000;
server.requestTimeout = 30 * 60 * 1000;
server.keepAliveTimeout = 5_000;
server.maxHeadersCount = 100;
server.maxRequestsPerSocket = 1_000;

server.listen(port,host,()=>console.log("Storyspace Home Media listening on http://"+host+":"+port+" (loopback only)"));
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("Storyspace Home Media received " + signal + "; draining active requests");
  server.close(error => {
    if (error) {
      console.error("Media server shutdown failed:", error);
      process.exitCode = 1;
    }
    process.exit();
  });
  server.closeIdleConnections?.();
  const forceClose = setTimeout(() => {
    console.error("Media server shutdown grace period expired; closing remaining connections");
    server.closeAllConnections?.();
  }, 30_000);
  forceClose.unref();
}
process.on("SIGINT",()=>shutdown("SIGINT"));
process.on("SIGTERM",()=>shutdown("SIGTERM"));
