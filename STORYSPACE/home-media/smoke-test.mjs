import assert from "node:assert/strict";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { createConnection, createServer } from "node:net";
import { access, mkdir, mkdtemp, readFile, rm, stat, utimes, writeFile } from "node:fs/promises";
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
// Invalid host and numeric limits must fail before the media server opens its storage.
async function assertStartupRejected(overrides,pattern,label) {
 const child=spawn(process.execPath,[path.join(root,"server.mjs")],{env:{...process.env,STORYSPACE_MEDIA_ADMIN_TOKEN:admin,STORYSPACE_MEDIA_UPLOAD_TOKEN:invite,STORYSPACE_MEDIA_HOST:"127.0.0.1",STORYSPACE_MEDIA_PORT:"0",STORYSPACE_MEDIA_DIR:path.join(temp,"invalid-"+label+"-media"),STORYSPACE_MEDIA_STAGING_DIR:path.join(temp,"invalid-"+label+"-staging"),STORYSPACE_MEDIA_CATALOG_FILE:path.join(temp,"invalid-"+label+"-catalog.json"),...overrides},stdio:["ignore","ignore","pipe"]});
 let errorText="";
 child.stderr.setEncoding("utf8");child.stderr.on("data",chunk=>{errorText+=chunk;});
 const exit=await new Promise(resolve=>child.once("exit",(code,signal)=>resolve({code,signal})));
 assert.equal(exit.code,1,label+" configuration is rejected before the server listens");
 assert.match(errorText,pattern,label+" rejection explains the invalid setting");
}
await assertStartupRejected({STORYSPACE_MEDIA_HOST:"0.0.0.0"},/must be a loopback address/,"public-bind");
await assertStartupRejected({STORYSPACE_MEDIA_PORT:"70000"},/STORYSPACE_MEDIA_PORT must be an integer between 0 and 65535/,"port-range");
await assertStartupRejected({STORYSPACE_MEDIA_MAX_UPLOAD_BYTES:"not-a-number"},/STORYSPACE_MEDIA_MAX_UPLOAD_BYTES must be an integer/,"upload-limit");
await assertStartupRejected({STORYSPACE_MEDIA_MAX_CHUNK_BYTES:"0"},/STORYSPACE_MEDIA_MAX_CHUNK_BYTES must be an integer/,"chunk-limit");
await assertStartupRejected({STORYSPACE_MEDIA_MAX_UPLOAD_BYTES:"4",STORYSPACE_MEDIA_MAX_CHUNK_BYTES:"8"},/MAX_CHUNK_BYTES cannot exceed/,"chunk-over-upload");
await assertStartupRejected({STORYSPACE_MEDIA_SESSION_TTL_MS:"not-a-number"},/STORYSPACE_MEDIA_SESSION_TTL_MS must be an integer/,"session-ttl-nan");
await assertStartupRejected({STORYSPACE_MEDIA_SESSION_TTL_MS:"3599999"},/STORYSPACE_MEDIA_SESSION_TTL_MS must be an integer/,"session-ttl-too-short");

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
 const cancelPreflight=await fetch(base+"/api/uploads/"+ "00000000-0000-4000-8000-000000000000",{method:"OPTIONS",headers:{origin:"https://storyspace.example","access-control-request-method":"DELETE","access-control-request-headers":"x-storyspace-upload-token"}});
 assert.equal(cancelPreflight.status,204,"browser DELETE preflight is accepted");
 assert.match(cancelPreflight.headers.get("access-control-allow-methods")||"",/\\bDELETE\\b/,"CORS explicitly permits upload cancellation");
 assert.match(cancelPreflight.headers.get("access-control-allow-headers")||"",/x-storyspace-upload-token/i,"CORS permits the uploader credential header");
 const cancelInit=await fetch(base+"/api/uploads/init",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({title:"Cancel Me",filename:"cancel.mp4",size:4})});
 assert.equal(cancelInit.status,201);const cancelSession=await cancelInit.json();
 assert.equal((await fetch(base+"/api/uploads/"+cancelSession.uploadId,{method:"DELETE"})).status,401,"upload cancellation requires uploader authorization");
 const cancelled=await fetch(base+"/api/uploads/"+cancelSession.uploadId,{method:"DELETE",headers});
 assert.equal(cancelled.status,200);assert.deepEqual(await cancelled.json(),{uploadId:cancelSession.uploadId,status:"cancelled"});
 for(const suffix of [".json",".part"]){await assert.rejects(access(path.join(staging,cancelSession.uploadId+suffix)),"cancelled session metadata and partial data are removed");}
 assert.equal((await fetch(base+"/api/uploads/"+cancelSession.uploadId,{headers})).status,404,"cancelled upload cannot be resumed");
 const malformedInit=await fetch(base+"/api/uploads/init",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({title:"Tamper Check",filename:"tamper.mp4",size:4})});
 assert.equal(malformedInit.status,201);const malformedSession=await malformedInit.json();
 const malformedMeta=path.join(staging,malformedSession.uploadId+".json");
 const malformedValue=JSON.parse(await readFile(malformedMeta,"utf8"));malformedValue.extension="../../outside";
 await writeFile(malformedMeta,JSON.stringify(malformedValue));
 const malformedStatus=await fetch(base+"/api/uploads/"+malformedSession.uploadId,{headers});
 assert.equal(malformedStatus.status,404,"tampered session metadata is rejected before filesystem paths are built");
 await assert.rejects(access(path.join(staging,malformedSession.uploadId+".part")),"invalid session artifacts are removed");
 const init=await fetch(base+"/api/uploads/init",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({title:"Review Me",filename:"demo.mp4",size:16})});
 assert.equal(init.status,201);const session=await init.json();
 const runtimeExpiredInit=await fetch(base+"/api/uploads/init",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({title:"Expire At Runtime",filename:"stale.mp4",size:4})});
 assert.equal(runtimeExpiredInit.status,201);const runtimeExpired=await runtimeExpiredInit.json();
 const runtimeExpiredTime=new Date(Date.now()-8*24*60*60*1000);
 for(const suffix of [".json",".part"]){const file=path.join(staging,runtimeExpired.uploadId+suffix);await utimes(file,runtimeExpiredTime,runtimeExpiredTime);}
 const runtimeExpiredStatus=await fetch(base+"/api/uploads/"+runtimeExpired.uploadId,{headers});
 assert.equal(runtimeExpiredStatus.status,404,"expired sessions are rejected while the server remains running");
 for(const suffix of [".json",".part"]){await assert.rejects(access(path.join(staging,runtimeExpired.uploadId+suffix)),"runtime expiry removes stale session artifacts");}
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
 const emptyChunk=await fetch(base+"/api/uploads/"+session.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"8"},body:Buffer.alloc(0)});
 assert.equal(emptyChunk.status,400,"zero-byte chunks are rejected before opening the staging file");
 assert.equal((await (await fetch(base+"/api/uploads/"+session.uploadId,{headers})).json()).offset,8,"empty chunks cannot move or corrupt the resume offset");
 const oversizedChunk=await fetch(base+"/api/uploads/"+session.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"8"},body:Buffer.from("123456789")});
 assert.equal(oversizedChunk.status,413,"oversized streamed chunks are rejected");
 assert.match((await oversizedChunk.json()).error,/Chunk exceeds limit/,"oversized chunks return a bounded validation error");
 assert.equal((await (await fetch(base+"/api/uploads/"+session.uploadId,{headers})).json()).offset,8,"failed chunk bytes are truncated and cannot be mistaken for committed data");
 // A client that disconnects before its declared Content-Length must not leave
 // uncommitted bytes in staging or poison the next resume attempt.
 const shortBodySocket=createConnection(port,"127.0.0.1");
 await new Promise((resolve,reject)=>{
  shortBodySocket.once("connect",()=>{
   shortBodySocket.write("PUT /api/uploads/"+session.uploadId+"/chunk HTTP/1.1\\r\\nHost: 127.0.0.1\\r\\nConnection: close\\r\\nContent-Type: application/octet-stream\\r\\nContent-Length: 5\\r\\nX-Storyspace-Upload-Token: "+invite+"\\r\\nX-Upload-Offset: 8\\r\\n\\r\\nabc");
   shortBodySocket.end();
  });
  shortBodySocket.once("close",resolve);
  shortBodySocket.once("error",reject);
 });
 assert.equal((await stat(path.join(staging,session.uploadId+".part"))).size,8,"aborted short body is physically rolled back");
 assert.equal((await (await fetch(base+"/api/uploads/"+session.uploadId,{headers})).json()).offset,8,"aborted short body does not advance the resumable offset");

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
 const done=await fetch(base+"/api/uploads/"+session.uploadId+"/complete",{method:"POST",headers});assert.equal(done.status,201);const completedUpload=await done.json();const expectedSha256=crypto.createHash("sha256").update("0123456789abcdef").digest("hex");assert.equal(completedUpload.sha256,expectedSha256,"completed uploads expose the verified SHA-256 digest");
 assert.equal((await (await fetch(base+"/api/catalog")).json()).length,0,"pending upload stays private");
 const pending=await fetch(base+"/admin/pending",{headers:{"x-storyspace-admin-token":admin}});assert.equal(pending.status,200);assert.equal((await pending.json()).length,1);
 assert.equal((await fetch(base+"/admin/review/"+session.uploadId,{method:"POST",headers:{"x-storyspace-admin-token":admin,"content-type":"application/json"},body:JSON.stringify({action:"approve"})})).status,200);
 const catalog=await (await fetch(base+"/api/catalog")).json();assert.equal(catalog.length,1);
 const ranged=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=3-7"}});assert.equal(ranged.status,206);assert.equal(await ranged.text(),"34567");
 const suffixRange=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=-4"}});assert.equal(suffixRange.status,206);assert.equal(await suffixRange.text(),"cdef","suffix byte ranges return the final bytes");
 const openRange=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=12-"}});assert.equal(openRange.status,206);assert.equal(await openRange.text(),"cdef","open-ended byte ranges reach EOF");
 const invalidRange=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=0-1,4-5"}});assert.equal(invalidRange.status,416,"unsupported multi-range requests are rejected explicitly");
 assert.equal(invalidRange.headers.get("content-range"),"bytes */16");
 const headRange=await fetch(base+catalog[0].streamUrl,{method:"HEAD",headers:{range:"bytes=0-3"}});assert.equal(headRange.status,206);assert.equal(headRange.headers.get("content-length"),"4");assert.equal(await headRange.text(),"","HEAD never streams a body");
 const etag=headRange.headers.get("etag")||(await fetch(base+catalog[0].streamUrl)).headers.get("etag");
 const notModified=await fetch(base+catalog[0].streamUrl,{headers:{"if-none-match":etag}});assert.equal(notModified.status,304,"matching ETag avoids retransmitting unchanged media");
 const modifiedSince=await fetch(base+catalog[0].streamUrl,{headers:{"if-modified-since":headRange.headers.get("last-modified")}});assert.equal(modifiedSince.status,304,"If-Modified-Since avoids retransmitting unchanged media when no ETag condition is supplied");
 const etagPrecedence=await fetch(base+catalog[0].streamUrl,{headers:{"if-none-match":'"different"',"if-modified-since":new Date(Date.now()+60000).toUTCString()}});assert.equal(etagPrecedence.status,200,"If-None-Match takes precedence over If-Modified-Since");
 const listNotModified=await fetch(base+catalog[0].streamUrl,{headers:{"if-none-match":'"stale", W/'+etag+'"'}});assert.equal(listNotModified.status,304,"If-None-Match accepts comma-separated weak validators");
 const wildcardNotModified=await fetch(base+catalog[0].streamUrl,{headers:{"if-none-match":"*"}});assert.equal(wildcardNotModified.status,304,"If-None-Match wildcard matches an existing representation");
 const staleWeakRange=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=0-1","if-range":"W/"+etag}});assert.equal(staleWeakRange.status,200,"weak If-Range validators cannot authorize partial responses");assert.equal(await staleWeakRange.text(),"0123456789abcdef");
 const dateRange=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=0-1","if-range":new Date(Date.now()+60000).toUTCString()}});assert.equal(dateRange.status,206,"a valid If-Range modification date permits byte ranges");assert.equal(await dateRange.text(),"01");
 const ignoredRange=await fetch(base+catalog[0].streamUrl,{headers:{range:"bytes=0-1","if-range":"stale"}});assert.equal(ignoredRange.status,200,"stale If-Range falls back to a full response");assert.equal(await ignoredRange.text(),"0123456789abcdef");
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
 // Corrupt catalog entries must never become filesystem paths or public media.
 const catalogFile=path.join(temp,"catalog.json");
 const trustedCatalog=JSON.parse(await readFile(catalogFile,"utf8"));
 const maliciousId="33333333-3333-4333-8333-333333333333";
 trustedCatalog.push({id:maliciousId,title:"Path Escape",fileName:"../../outside.mp4",contentType:"video/mp4",size:4,addedAt:new Date().toISOString(),published:true});
 await writeFile(catalogFile,JSON.stringify(trustedCatalog,null,2)+"\n");
 assert.equal((await (await fetch(base+"/api/catalog")).json()).length,1,"unsafe catalog filenames are excluded from public catalog");
 const safePending=await (await fetch(base+"/admin/pending",{headers:adminHeaders})).json();
 assert.equal(safePending.length,2,"unsafe catalog entries are excluded from moderation");
 const maliciousReview=await fetch(base+"/admin/review/"+maliciousId,{method:"POST",headers:{...adminHeaders,"content-type":"application/json"},body:JSON.stringify({action:"reject"})});
 assert.equal(maliciousReview.status,404,"unsafe catalog entries cannot trigger filesystem deletion");
 assert.equal((await fetch(base+"/media/"+maliciousId)).status,404,"unsafe catalog entries cannot be streamed");
 const mediaDir=path.join(temp,"media");
 const mediaFile=path.join(mediaDir,catalog[0].fileName),originalMediaStat=await stat(mediaFile);
 await writeFile(mediaFile,"truncated");
 const corruptedMedia=await fetch(base+catalog[0].streamUrl);
 assert.equal(corruptedMedia.status,503,"truncated media is not served with a misleading success response");
 assert.match((await corruptedMedia.json()).error,/integrity check/);
 await writeFile(mediaFile,"xxxxxxxxxxxxxxxx");await utimes(mediaFile,originalMediaStat.atime,originalMediaStat.mtime);
 const sameSizeCorruption=await fetch(base+catalog[0].streamUrl);assert.equal(sameSizeCorruption.status,503,"same-size media corruption is rejected by the SHA-256 integrity check");
 assert.match((await sameSizeCorruption.json()).error,/SHA-256 integrity check/);
 // A partially uploaded file must survive a server restart and continue from its committed offset.
 const restartInit=await fetch(base+"/api/uploads/init",{method:"POST",headers:{...headers,"content-type":"application/json"},body:JSON.stringify({title:"Restart Resume",filename:"restart-resume.mp4",size:16})});
 assert.equal(restartInit.status,201);const restartSession=await restartInit.json();
 const firstHalf=await fetch(base+"/api/uploads/"+restartSession.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"0"},body:Buffer.from("restart-")});
 assert.equal(firstHalf.status,200);assert.equal((await firstHalf.json()).offset,8);
 server.kill("SIGTERM");await serverExit;
 const restartedServer=spawn(process.execPath,[path.join(root,"server.mjs")],{env:{...process.env,STORYSPACE_MEDIA_ADMIN_TOKEN:admin,STORYSPACE_MEDIA_UPLOAD_TOKEN:invite,STORYSPACE_MEDIA_DIR:path.join(temp,"media"),STORYSPACE_MEDIA_STAGING_DIR:staging,STORYSPACE_MEDIA_CATALOG_FILE:path.join(temp,"catalog.json"),STORYSPACE_MEDIA_HOST:"127.0.0.1",STORYSPACE_MEDIA_PORT:String(port),STORYSPACE_MEDIA_MAX_UPLOAD_BYTES:"2048",STORYSPACE_MEDIA_MAX_CHUNK_BYTES:"8"},stdio:["ignore","ignore","pipe"]});
 let restartedError="";restartedServer.stderr.setEncoding("utf8");restartedServer.stderr.on("data",chunk=>{restartedError+=chunk});
 const restartedExit=new Promise(resolve=>restartedServer.once("exit",(code,signal)=>resolve({code,signal})));
 try{
  let restartedReady=false;for(let i=0;i<60;i++){try{if((await fetch(base+"/health")).ok){restartedReady=true;break}}catch{}await new Promise(resolve=>setTimeout(resolve,100))}
  assert.equal(restartedReady,true,"media server restarts with the interrupted upload session"+(restartedError?": "+restartedError:""));
  const resumedAfterRestart=await fetch(base+"/api/uploads/"+restartSession.uploadId,{headers});assert.equal(resumedAfterRestart.status,200);
  const recoveredStatus=await resumedAfterRestart.json();assert.equal(recoveredStatus.offset,8,"restart recovery exposes the committed upload offset");assert.equal(recoveredStatus.size,16,"restart recovery preserves the original upload size");
  const secondHalf=await fetch(base+"/api/uploads/"+restartSession.uploadId+"/chunk",{method:"PUT",headers:{...headers,"x-upload-offset":"8"},body:Buffer.from("resumed!")});
  assert.equal(secondHalf.status,200);assert.equal((await secondHalf.json()).offset,16);
  const restartComplete=await fetch(base+"/api/uploads/"+restartSession.uploadId+"/complete",{method:"POST",headers});assert.equal(restartComplete.status,201);
  const restartResult=await restartComplete.json();
  assert.equal(restartResult.sha256,crypto.createHash("sha256").update("restart-resumed!").digest("hex"),"resumed upload checksum covers bytes from before and after restart");
 }finally{if(restartedServer.exitCode===null&&restartedServer.signalCode===null)restartedServer.kill("SIGTERM");await restartedExit;}
 console.log("Storyspace media tests passed: invite auth, chunk resume, approval and rejection gates, catalog visibility, byte ranges, catalog path safety.");
}finally{if(server.exitCode===null&&server.signalCode===null)server.kill("SIGTERM");await serverExit;await rm(temp,{recursive:true,force:true});}
