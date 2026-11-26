import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { access, mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root=path.dirname(fileURLToPath(import.meta.url)),temp=await mkdtemp(path.join(os.tmpdir(),"storyspace-media-"));
const admin="test-admin-secret-with-at-least-32-characters",invite="test-uploader-secret-with-at-least-32-characters";
const staging=path.join(temp,"staging"),expiredId="11111111-1111-4111-8111-111111111111",expiredTime=new Date(Date.now()-8*24*60*60*1000);
const activeId="22222222-2222-4222-8222-222222222222";
await mkdir(staging,{recursive:true});
for(const suffix of [".json",".part"]){const file=path.join(staging,expiredId+suffix);await writeFile(file,"expired");await utimes(file,expiredTime,expiredTime);}
const activePart=path.join(staging,activeId+".part"),activeMeta=path.join(staging,activeId+".json");
await writeFile(activePart,"partial");await utimes(activePart,expiredTime,expiredTime);
await writeFile(activeMeta,JSON.stringify({id:activeId,title:"Recover Me",extension:".mp4",contentType:"video/mp4",size:16,offset:0,createdAt:new Date().toISOString()}));
const portProbe=createServer();
await new Promise((resolve,reject)=>{portProbe.once("error",reject);portProbe.listen(0,"127.0.0.1",resolve);});
const port=portProbe.address().port;
await new Promise((resolve,reject)=>portProbe.close(error=>error?reject(error):resolve()));
const base="http://127.0.0.1:"+port;
const server=spawn(process.execPath,[path.join(root,"server.mjs")],{env:{...process.env,STORYSPACE_MEDIA_ADMIN_TOKEN:admin,STORYSPACE_MEDIA_UPLOAD_TOKEN:invite,STORYSPACE_MEDIA_DIR:path.join(temp,"media"),STORYSPACE_MEDIA_STAGING_DIR:staging,STORYSPACE_MEDIA_CATALOG_FILE:path.join(temp,"catalog.json"),STORYSPACE_MEDIA_HOST:"127.0.0.1",STORYSPACE_MEDIA_PORT:String(port),STORYSPACE_MEDIA_MAX_UPLOAD_BYTES:"2048",STORYSPACE_MEDIA_MAX_CHUNK_BYTES:"8"},stdio:["ignore","ignore","pipe"]});
let serverError="";
server.stderr.setEncoding("utf8");server.stderr.on("data",chunk=>{serverError+=chunk;});
const serverExit=new Promise(resolve=>server.once("exit",(code,signal)=>resolve({code,signal})));
const headers={"x-storyspace-upload-token":invite};
try{
 let ready=false;for(let i=0;i<60;i++){try{if((await fetch(base+"/health")).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}
 assert.equal(ready,true,"server starts"+(serverError?": "+serverError:""));
 for(const suffix of [".json",".part"]){await assert.rejects(access(path.join(staging,expiredId+suffix)), "stale upload session artifacts are removed on startup");}
 const recoveredSession=JSON.parse(await readFile(activeMeta,"utf8"));
 assert.equal(recoveredSession.offset,7,"startup recovers committed bytes after an interrupted metadata update");
 await access(activePart);
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
 const concurrentChunks=await Promise.all(["01234567","ABCDEFGH"].map(payload=>fetch(base+"/api/uploads/"+session.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"0"},body:Buffer.from(payload)})));
 const concurrentStatuses=concurrentChunks.map(response=>response.status).sort((a,b)=>a-b);
 assert.deepEqual(concurrentStatuses,[200,409],"parallel chunks at the same offset cannot both append");
 const concurrentBodies=await Promise.all(concurrentChunks.map(response=>response.json()));
 assert.equal(concurrentBodies.find(body=>body.offset===8)?.offset,8,"one concurrent chunk advances the session exactly once");
 const concurrentStatus=await (await fetch(base+"/api/uploads/"+session.uploadId,{headers})).json();
 assert.equal(concurrentStatus.offset,8,"serialized status reports the committed offset");

 const staleOffset=await fetch(base+"/api/uploads/"+session.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"7"},body:Buffer.from("x")});
 assert.equal(staleOffset.status,409,"stale chunk offsets are rejected");
 assert.equal((await staleOffset.json()).offset,8,"offset conflict reports the authoritative position");
 assert.equal((await fetch(base+"/admin/pending")).status,401,"pending queue requires owner authorization");
 const incompleteInit=await fetch(base+"/api/uploads/init",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({title:"Incomplete",filename:"incomplete.mp4",size:4})});
 assert.equal(incompleteInit.status,201);const incompleteSession=await incompleteInit.json();
 const prematureComplete=await fetch(base+"/api/uploads/"+incompleteSession.uploadId+"/complete",{method:"POST",headers});
 assert.equal(prematureComplete.status,409,"incomplete upload cannot enter moderation");
 const incompleteStatus=await (await fetch(base+"/api/uploads/"+incompleteSession.uploadId,{headers})).json();
 assert.equal(incompleteStatus.offset,0);assert.equal(incompleteStatus.size,4);
 const resumed=await fetch(base+"/api/uploads/"+session.uploadId,{headers});assert.equal((await resumed.json()).offset,8);
 const part2=await fetch(base+"/api/uploads/"+session.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"8"},body:Buffer.from("89abcdef")});
 assert.equal(part2.status,200);
 const done=await fetch(base+"/api/uploads/"+session.uploadId+"/complete",{method:"POST",headers});assert.equal(done.status,201);
 assert.equal((await (await fetch(base+"/api/catalog")).json()).length,0,"pending upload stays private");
 const pending=await fetch(base+"/admin/pending",{headers:{"x-storyspace-admin-token":admin}});assert.equal(pending.status,200);assert.equal((await pending.json()).length,1);
 assert.equal((await fetch(base+"/admin/review/"+session.uploadId,{method:"POST",headers:{"x-storyspace-admin-token":admin,"content-type":"application/json"},body:JSON.stringify({action:"approve"})})).status,200);
 const catalog=await (await fetch(base+"/api/catalog")).json();assert.equal(catalog.length,1);
 const ranged=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=3-7"}});assert.equal(ranged.status,206);assert.equal(await ranged.text(),"34567");
 // A rejected upload must disappear from the pending queue and remain private.
 const rejectedInit=await fetch(base+"/api/uploads/init",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({title:"Reject Me",filename:"reject.mp4",size:4})});
 assert.equal(rejectedInit.status,201);const rejectedSession=await rejectedInit.json();
 const rejectedChunk=await fetch(base+"/api/uploads/"+rejectedSession.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"0"},body:Buffer.from("nope")});
 assert.equal(rejectedChunk.status,200);assert.equal((await rejectedChunk.json()).offset,4);
 const rejectedDone=await fetch(base+"/api/uploads/"+rejectedSession.uploadId+"/complete",{method:"POST",headers});assert.equal(rejectedDone.status,201);
 const pendingBeforeReject=await (await fetch(base+"/admin/pending",{headers:adminHeaders})).json();
 assert.equal(pendingBeforeReject.length,1);assert.equal(pendingBeforeReject[0].id,rejectedSession.uploadId);
 const invalidReview=await fetch(base+"/admin/review/"+rejectedSession.uploadId,{method:"POST",headers:{...adminHeaders,"content-type":"application/json"},body:JSON.stringify({action:"publish"})});
 assert.equal(invalidReview.status,400,"unknown moderation action is rejected");
 const rejectResponse=await fetch(base+"/admin/review/"+rejectedSession.uploadId,{method:"POST",headers:{...adminHeaders,"content-type":"application/json"},body:JSON.stringify({action:"reject"})});
 assert.equal(rejectResponse.status,200);assert.deepEqual(await rejectResponse.json(),{id:rejectedSession.uploadId,status:"rejected"});
 const pendingAfterReject=await (await fetch(base+"/admin/pending",{headers:adminHeaders})).json();
 assert.equal(pendingAfterReject.length,0,"rejected item is removed from pending queue");
 const stillPublished=await (await fetch(base+"/api/catalog")).json();
 assert.equal(stillPublished.length,1,"rejecting another item does not remove approved media");
 assert.equal((await fetch(base+"/media/"+rejectedSession.uploadId)).status,404,"rejected media cannot be streamed");
 // Concurrent direct uploads must not overwrite each other in the shared catalog.
 const directUploads=await Promise.all(["Admin A","Admin B"].map(title=>fetch(base+"/admin/upload?title="+encodeURIComponent(title)+"&filename=admin.mp4",{method:"POST",headers:adminHeaders,body:Buffer.from(title)})));
 assert.deepEqual(directUploads.map(response=>response.status),[201,201],"parallel admin uploads both complete");
 const directResults=await Promise.all(directUploads.map(response=>response.json()));
 assert.equal(new Set(directResults.map(item=>item.id)).size,2,"parallel admin uploads receive distinct media IDs");
 const pendingAfterParallel=await (await fetch(base+"/admin/pending",{headers:adminHeaders})).json();
 assert.equal(pendingAfterParallel.length,2,"catalog lock preserves both parallel admin uploads");
 console.log("Storyspace media tests passed: invite auth, chunk resume, approval and rejection gates, catalog visibility, byte ranges.");
}finally{if(server.exitCode===null&&server.signalCode===null)server.kill("SIGTERM");await serverExit;await rm(temp,{recursive:true,force:true});}
