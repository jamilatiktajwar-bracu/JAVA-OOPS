import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const temp = await mkdtemp(path.join(os.tmpdir(), "storyspace-home-media-"));
const token = "test-only-secret-token-with-at-least-32-characters";
const port = 18787;
const base = "http://127.0.0.1:" + port;
const server = spawn(process.execPath, [path.join(root, "server.mjs")], {
  env: { ...process.env, STORYSPACE_MEDIA_ADMIN_TOKEN:token, STORYSPACE_MEDIA_DIR:path.join(temp,"media"),
    STORYSPACE_MEDIA_CATALOG_FILE:path.join(temp,"catalog.json"), STORYSPACE_MEDIA_HOST:"127.0.0.1",
    STORYSPACE_MEDIA_PORT:String(port), STORYSPACE_MEDIA_MAX_UPLOAD_BYTES:"1024" },
  stdio:"ignore"
});
try {
  let ready = false;
  for (let i=0;i<60;i++) {
    try { const r=await fetch(base+"/health"); if(r.ok){ready=true;break;} } catch {}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.equal(ready,true,"server should start");
  const denied = await fetch(base+"/admin/upload?title=Nope&filename=nope.mp4",{method:"POST",body:"x"});
  assert.equal(denied.status,401,"upload requires admin token");
  const bytes = Buffer.from("0123456789abcdef");
  const uploaded = await fetch(base+"/admin/upload?title=Range%20Test&filename=test.mp4",{
    method:"POST",headers:{"x-storyspace-admin-token":token,"content-type":"application/octet-stream"},body:bytes
  });
  assert.equal(uploaded.status,201,"authorized upload succeeds");
  const item = await uploaded.json();
  assert.equal(item.title,"Range Test");
  assert.equal(item.size,bytes.length);
  const catalog = await (await fetch(base+"/api/catalog")).json();
  assert.equal(catalog.length,1,"uploaded title appears in public catalog");
  const ranged = await fetch(base+item.streamUrl,{headers:{range:"bytes=3-7"}});
  assert.equal(ranged.status,206,"byte range returns partial content");
  assert.equal(ranged.headers.get("content-range"),"bytes 3-7/16");
  assert.equal(await ranged.text(),"34567");
  console.log("Storyspace Home Media smoke tests passed (auth, upload, catalog, byte-range).");
} finally {
  server.kill("SIGTERM");
  await rm(temp,{recursive:true,force:true});
}
