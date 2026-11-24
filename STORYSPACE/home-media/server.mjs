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
const port = Number(process.env.STORYSPACE_MEDIA_PORT || 8787);
const adminToken = String(process.env.STORYSPACE_MEDIA_ADMIN_TOKEN || "");
const uploadToken = String(process.env.STORYSPACE_MEDIA_UPLOAD_TOKEN || "");
const maxUploadBytes = Number(process.env.STORYSPACE_MEDIA_MAX_UPLOAD_BYTES || 15 * 1024 ** 3);
const maxChunkBytes = Number(process.env.STORYSPACE_MEDIA_MAX_CHUNK_BYTES || 8 * 1024 ** 2);
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

function readCatalog() {
  try {
    const data = JSON.parse(fs.readFileSync(catalogFile, "utf8"));
    return Array.isArray(data) ? data.filter(x => x && /^[a-f0-9-]{36}$/i.test(x.id) && typeof x.fileName === "string") : [];
  } catch { return []; }
}
function writeCatalog(items) {
  const temp = catalogFile + ".tmp";
  fs.writeFileSync(temp, JSON.stringify(items, null, 2) + "\n", { flag:"w", mode:0o600 });
  fs.renameSync(temp, catalogFile);
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
  try { const value=JSON.parse(fs.readFileSync(files.data,"utf8")); return value.id===id ? value : null; } catch { return null; }
}
function writeSession(session) {
  const files=sessionPaths(session.id), temp=files.data+".tmp";
  fs.writeFileSync(temp,JSON.stringify(session),{mode:0o600});
  fs.renameSync(temp,files.data);
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
    if(!isUploader(req)) return json(res,401,{error:"Upload invitation required"});
    const session=readSession(chunkMatch[1]); if(!session) return json(res,404,{error:"Upload session not found"});
    const files=sessionPaths(session.id), current=fs.statSync(files.part).size;
    const offset=Number(req.headers["x-upload-offset"]);
    if(!Number.isSafeInteger(offset)||offset!==current||offset!==session.offset) return json(res,409,{error:"Upload offset mismatch",offset:current});
    let received=0;
    const limiter=new Transform({transform(chunk,enc,cb){received+=chunk.length;if(received>maxChunkBytes||current+received>session.size)cb(Object.assign(new Error("Chunk too large"),{statusCode:413}));else cb(null,chunk);}});
    try{
      await pipeline(req,limiter,fs.createWriteStream(files.part,{flags:"a",mode:0o600}));
      if(received===0) return json(res,400,{error:"Empty chunk"});
      session.offset=current+received;writeSession(session);
      return json(res,200,{uploadId:session.id,offset:session.offset,complete:session.offset===session.size});
    }catch(error){return json(res,error.statusCode||400,{error:error.statusCode===413?"Chunk exceeds limit":"Chunk upload failed",offset:fs.existsSync(files.part)?fs.statSync(files.part).size:0});}
  }

  const statusMatch=url.pathname.match(/^\/api\/uploads\/([a-f0-9-]{36})$/i);
  if(statusMatch&&req.method==="GET"){
    if(!isUploader(req)) return json(res,401,{error:"Upload invitation required"});
    const session=readSession(statusMatch[1]);if(!session)return json(res,404,{error:"Upload session not found"});
    const files=sessionPaths(session.id),offset=fs.existsSync(files.part)?fs.statSync(files.part).size:0;
    if(offset!==session.offset){session.offset=offset;writeSession(session);}
    return json(res,200,{uploadId:session.id,offset:session.offset,size:session.size,chunkSize:maxChunkBytes,status:"uploading"});
  }

  const completeMatch=url.pathname.match(/^\/api\/uploads\/([a-f0-9-]{36})\/complete$/i);
  if(completeMatch&&req.method==="POST"){
    if(!isUploader(req)) return json(res,401,{error:"Upload invitation required"});
    const session=readSession(completeMatch[1]);if(!session)return json(res,404,{error:"Upload session not found"});
    const files=sessionPaths(session.id),actual=fs.statSync(files.part).size;
    if(actual!==session.size||session.offset!==session.size)return json(res,409,{error:"Upload is incomplete",offset:actual,size:session.size});
    const fileName=session.id+session.extension,destination=path.join(mediaDir,fileName);
    fs.renameSync(files.part,destination);
    const item={id:session.id,title:session.title,fileName,contentType:session.contentType,size:session.size,addedAt:new Date().toISOString(),published:false,uploadedBy:"invite"};
    const items=readCatalog();items.push(item);writeCatalog(items);
    fs.rmSync(files.data,{force:true});
    return json(res,201,{id:item.id,title:item.title,size:item.size,status:"pending_approval"});
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
    const items=readCatalog(),index=items.findIndex(x=>x.id===reviewMatch[1]);
    if(index<0||items[index].published===true)return json(res,404,{error:"Pending upload not found"});
    if(action==="approve"){items[index].published=true;items[index].approvedAt=new Date().toISOString();writeCatalog(items);return json(res,200,{id:items[index].id,status:"published"});}
    const item=items[index];items.splice(index,1);writeCatalog(items);fs.rmSync(path.join(mediaDir,item.fileName),{force:true});
    return json(res,200,{id:item.id,status:"rejected"});
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
      const items=readCatalog();items.push(item);writeCatalog(items);
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
    const headers={"content-type":item.contentType,"accept-ranges":"bytes","cache-control":"public, max-age=60","content-disposition":"inline; filename=\""+item.fileName+"\"","x-content-type-options":"nosniff"};
    const range=req.headers.range;
    if(range){
      const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m){res.writeHead(416,{"content-range":"bytes */"+stat.size});return res.end();}
      let start=m[1]?Number(m[1]):NaN,end=m[2]?Number(m[2]):NaN;
      if(Number.isNaN(start)){const suffix=end;if(!suffix){res.writeHead(416,{"content-range":"bytes */"+stat.size});return res.end();}start=Math.max(0,stat.size-suffix);end=stat.size-1;}
      else if(Number.isNaN(end))end=stat.size-1;
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||start>=stat.size){res.writeHead(416,{"content-range":"bytes */"+stat.size});return res.end();}
      end=Math.min(end,stat.size-1);headers["content-range"]="bytes "+start+"-"+end+"/"+stat.size;headers["content-length"]=String(end-start+1);
      res.writeHead(206,headers);if(req.method==="HEAD")return res.end();return fs.createReadStream(file,{start,end}).pipe(res);
    }
    headers["content-length"]=String(stat.size);res.writeHead(200,headers);if(req.method==="HEAD")return res.end();return fs.createReadStream(file).pipe(res);
  }
  return json(res,404,{error:"Not found"});
}
const server=http.createServer((req,res)=>{handle(req,res).catch(error=>{if(!res.headersSent)json(res,error.statusCode||500,{error:error.statusCode===413?"Request too large":"Internal server error"});else res.destroy();});});
server.listen(port,host,()=>console.log("Storyspace Home Media listening on http://"+host+":"+port+" (loopback only)"));
process.on("SIGINT",()=>server.close(()=>process.exit(0)));
process.on("SIGTERM",()=>server.close(()=>process.exit(0)));
