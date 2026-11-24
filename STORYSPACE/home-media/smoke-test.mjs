import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.dirname(fileURLToPath(import.meta.url)),temp=await mkdtemp(path.join(os.tmpdir(),"storyspace-media-"));
const admin="test-admin-secret-with-at-least-32-characters",invite="test-uploader-secret-with-at-least-32-characters",port=18787,base="http://127.0.0.1:"+port;
const server=spawn(process.execPath,[path.join(root,"server.mjs")],{env:{...process.env,STORYSPACE_MEDIA_ADMIN_TOKEN:admin,STORYSPACE_MEDIA_UPLOAD_TOKEN:invite,STORYSPACE_MEDIA_DIR:path.join(temp,"media"),STORYSPACE_MEDIA_STAGING_DIR:path.join(temp,"staging"),STORYSPACE_MEDIA_CATALOG_FILE:path.join(temp,"catalog.json"),STORYSPACE_MEDIA_HOST:"127.0.0.1",STORYSPACE_MEDIA_PORT:String(port),STORYSPACE_MEDIA_MAX_UPLOAD_BYTES:"2048",STORYSPACE_MEDIA_MAX_CHUNK_BYTES:"8"},stdio:"ignore"});
const headers={"x-storyspace-upload-token":invite};
try{
 let ready=false;for(let i=0;i<60;i++){try{if((await fetch(base+"/health")).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 assert.equal(ready,true,"server starts");
 const uploaderCheck=await fetch(base+"/api/auth/verify/uploader",{method:"POST",headers});
 assert.equal(uploaderCheck.status,200);assert.deepEqual(await uploaderCheck.json(),{ok:true,role:"uploader"});
 const adminHeaders={"x-storyspace-admin-token":admin};
 const adminCheck=await fetch(base+"/api/auth/verify/admin",{method:"POST",headers:adminHeaders});
 assert.equal(adminCheck.status,200);assert.deepEqual(await adminCheck.json(),{ok:true,role:"admin"});
 assert.equal((await fetch(base+"/api/auth/verify/admin",{method:"POST",headers})).status,401,"uploader key cannot authenticate as admin");
 assert.equal((await fetch(base+"/api/auth/verify/uploader",{method:"POST",headers:adminHeaders})).status,401,"admin key cannot authenticate as uploader");
 assert.equal((await fetch(base+"/api/uploads/init",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:"Denied",filename:"x.mp4",size:16})})).status,401);
 const init=await fetch(base+"/api/uploads/init",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({title:"Review Me",filename:"demo.mp4",size:16})});
 assert.equal(init.status,201);const session=await init.json();
 const part1=await fetch(base+"/api/uploads/"+session.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"0"},body:Buffer.from("01234567")});
 assert.equal(part1.status,200);assert.equal((await part1.json()).offset,8);
 const resumed=await fetch(base+"/api/uploads/"+session.uploadId,{headers});assert.equal((await resumed.json()).offset,8);
 const part2=await fetch(base+"/api/uploads/"+session.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"8"},body:Buffer.from("89abcdef")});
 assert.equal(part2.status,200);
 const done=await fetch(base+"/api/uploads/"+session.uploadId+"/complete",{method:"POST",headers});assert.equal(done.status,201);
 assert.equal((await (await fetch(base+"/api/catalog")).json()).length,0,"pending upload stays private");
 const pending=await fetch(base+"/admin/pending",{headers:{"x-storyspace-admin-token":admin}});assert.equal(pending.status,200);assert.equal((await pending.json()).length,1);
 assert.equal((await fetch(base+"/admin/review/"+session.uploadId,{method:"POST",headers:{"x-storyspace-admin-token":admin,"content-type":"application/json"},body:JSON.stringify({action:"approve"})})).status,200);
 const catalog=await (await fetch(base+"/api/catalog")).json();assert.equal(catalog.length,1);
 const ranged=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=3-7"}});assert.equal(ranged.status,206);assert.equal(await ranged.text(),"34567");
 console.log("Storyspace media tests passed: invite auth, chunk resume, approval gate, catalog visibility, byte ranges.");
}finally{server.kill("SIGTERM");await rm(temp,{recursive:true,force:true});}
