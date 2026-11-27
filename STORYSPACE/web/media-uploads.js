(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const DB_NAME="storyspace-media-uploads",STORE="queue",CONFIG_KEY="storyspace.mediaHost";
  let dbPromise=null,active=false,activeItemId=null,cancelRequested=false,selectedFile=null,selectedHandle=null;
  const readConfig=()=>{try{return JSON.parse(sessionStorage.getItem(CONFIG_KEY)||"{}")}catch{return {}}};
  const saveConfig=value=>sessionStorage.setItem(CONFIG_KEY,JSON.stringify(value));
  const cleanRoot=value=>String(value||"").trim().replace(/\/+$/,"");
  const validRoot=value=>{try{const u=new URL(value);return u.protocol==="https:"||["localhost","127.0.0.1"].includes(u.hostname)}catch{return false}};
  function openDb(){
    if(!("indexedDB" in window))return Promise.reject(new Error("This browser does not support a persistent upload queue."));
    if(!dbPromise)dbPromise=new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:"id"})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});
    return dbPromise;
  }
  async function storeItem(item){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
  async function getItems(){const db=await openDb();return new Promise((resolve,reject)=>{const req=db.transaction(STORE).objectStore(STORE).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>reject(req.error)})}
  async function removeItem(id){const db=await openDb();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
  function headers(token,extra={}){return {"x-storyspace-upload-token":token,...extra}}
  async function request(root,path,token,options={}){
    const requestHeaders={...(options.headers||{})};
    // Never send the owner-only admin secret in the uploader-token header.
    if(token&&!requestHeaders["x-storyspace-admin-token"]&&!requestHeaders["x-storyspace-upload-token"]){requestHeaders["x-storyspace-upload-token"]=token}
    const controller=!options.signal&&typeof AbortController!=="undefined"?new AbortController():null;
    const {timeoutMs:deadlineMs=25000,...fetchOptions}=options;
    const requestOptions={...fetchOptions,credentials:"omit",headers:requestHeaders,...(controller?{signal:controller.signal}:{})};
    let timeout=0;
    const fetchPromise=fetch(root+path,requestOptions);
    const deadline=new Promise((_,reject)=>{timeout=setTimeout(()=>{controller?.abort();reject(new Error("Media server request timed out after "+Math.round(deadlineMs/1000)+" seconds."))},deadlineMs)});
    let res;try{res=await Promise.race([fetchPromise,deadline])}finally{clearTimeout(timeout)}
    let data={};try{data=await res.json()}catch{}
    if(!res.ok){const e=new Error(data.error||"Media server request failed ("+res.status+")");e.status=res.status;e.data=data;throw e}return data;
  }
  function fmt(bytes){if(!Number.isFinite(bytes))return "—";const units=["B","KB","MB","GB","TB"];let n=bytes,i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toFixed(i?1:0)+" "+units[i]}
  function setProgress(done,total,message){
    const fill=$("mediaProgressFill"),track=fill?.parentElement,percent=total?Math.max(0,Math.min(100,Math.round(done/total*100))):0;
    $("mediaProgress").hidden=false;
    if(fill)fill.style.width=percent+"%";
    if(track){track.setAttribute("role","progressbar");track.setAttribute("aria-label","Video upload progress");track.setAttribute("aria-valuemin","0");track.setAttribute("aria-valuemax","100");track.setAttribute("aria-valuenow",String(percent));track.setAttribute("aria-valuetext",message)}
    $("mediaProgressText").textContent=message;
  }
  async function getFile(item){
    if(item.handle){
      try{
        let permission=await item.handle.queryPermission({mode:"read"});
        if(permission!=="granted")permission=await item.handle.requestPermission({mode:"read"});
        if(permission==="granted"){
          const file=await item.handle.getFile();
          if(file.name!==item.filename||file.size!==item.size||(item.lastModified&&file.lastModified!==item.lastModified))throw new Error("The selected file has changed since this upload was queued. Choose the original video again.");
          return file;
        }
        item.status="Paused · file permission required";
        await storeItem(item);
        throw new Error("Browser permission to read this video is not granted. Tap Resume and reselect the original file, then allow file access.");
      }catch(error){
        if(/has changed|permission to read/.test(error.message))throw error;
        // File System Access handles can become stale after a browser restart or file move.
      }
    }
    if(selectedFile&&selectedFile.name===item.filename&&selectedFile.size===item.size&&(!item.lastModified||selectedFile.lastModified===item.lastModified))return selectedFile;
    throw new Error("This browser needs you to reselect the original video before resuming. Your server-side upload progress is preserved.");
  }
  function waitForOnline(item){
    if(navigator.onLine)return Promise.resolve();
    setProgress(item.offset,item.size,"Offline · "+fmt(item.offset)+" saved; waiting for connection");
    return new Promise((resolve,reject)=>{
      const online=()=>{cleanup();resolve()};
      const cancelled=()=>{cleanup();reject(Object.assign(new Error("Upload cancelled"),{code:"UPLOAD_CANCELLED"}))};
      const cleanup=()=>{window.removeEventListener("online",online);window.removeEventListener("storyspace-upload-cancel",cancelled)};
      window.addEventListener("online",online,{once:true});
      window.addEventListener("storyspace-upload-cancel",cancelled,{once:true});
    });
  }
  const retryableUploadError=error=>!navigator.onLine||!error.status||error.status===408||error.status===425||error.status===429||error.status>=500;
  const retryDelay=attempt=>Math.min(15000,1000*Math.pow(2,attempt-1))+Math.floor(Math.random()*350);
  function waitBeforeRetry(ms){
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{cleanup();resolve()},ms);
      const cancelled=()=>{cleanup();reject(Object.assign(new Error("Upload cancelled"),{code:"UPLOAD_CANCELLED"}))};
      const cleanup=()=>{clearTimeout(timer);window.removeEventListener("storyspace-upload-cancel",cancelled)};
      window.addEventListener("storyspace-upload-cancel",cancelled,{once:true});
    });
  }
  async function putChunkWithRetry(root,token,item,blob,end){
    let lastError;
    for(let attempt=1;attempt<=5;attempt++){
      if(cancelRequested)throw Object.assign(new Error("Upload cancelled"),{code:"UPLOAD_CANCELLED"});
      await waitForOnline();
      try{
        return await request(root,"/api/uploads/"+encodeURIComponent(item.uploadId)+"/chunk",token,{method:"PUT",headers:headers(token,{"x-upload-offset":String(item.offset)}),body:blob,timeoutMs:120000});
      }catch(error){
        lastError=error;
        if(!retryableUploadError(error)||attempt===5)throw error;
        // A timeout or lost response may occur after the server committed the chunk.
        // Reconcile before retrying so the same bytes are never appended twice.
        if(error.status===409)throw error;
        try{
          const status=await request(root,"/api/uploads/"+encodeURIComponent(item.uploadId),token,{timeoutMs:15000});
          if(Number.isSafeInteger(status.offset)&&status.offset>item.offset&&status.offset<=end)return {offset:status.offset};
          if(!Number.isSafeInteger(status.offset)||status.offset!==item.offset)throw new Error("Server upload position changed unexpectedly; refresh the queue before retrying.");
        }catch(reconcileError){
          if(reconcileError.status===401||reconcileError.status===404)throw reconcileError;
          if(!navigator.onLine)await waitForOnline(item);
        }
        setProgress(item.offset,item.size,"Connection interrupted · retry "+attempt+" of 5");
        await waitBeforeRetry(retryDelay(attempt));
      }
    }
    throw lastError||new Error("Upload retry limit reached");
  }
  async function runUpload(item,file){
    const cfg=readConfig(),root=cleanRoot(cfg.root),token=cfg.uploadToken;
    if(!validRoot(root)||!token||token.length<32)throw new Error("Save a valid HTTPS media server address and uploader invitation key first.");
    if(!item.uploadId){
      const init=await request(root,"/api/uploads/init",token,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:item.title,filename:item.filename,size:item.size})});
      if(!init||typeof init.uploadId!=="string"||!init.uploadId.trim()||init.uploadId.length>200)throw new Error("Media server did not return a valid upload session. Retry after checking the server.");
      item.uploadId=init.uploadId;item.offset=0;item.status="uploading";item.updatedAt=Date.now();await storeItem(item);await renderQueue();
    }else{
      const status=await request(root,"/api/uploads/"+encodeURIComponent(item.uploadId),token);
      if(!status||!Number.isSafeInteger(status.offset)||status.offset<0||status.offset>item.size)throw new Error("Media server returned an invalid saved upload position. Your local queue was left unchanged.");
      item.offset=status.offset;item.updatedAt=Date.now();await storeItem(item);
    }
    const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
    const mobile=matchMedia("(max-width: 700px), (pointer: coarse)").matches||/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const constrained=mobile||connection?.saveData||["slow-2g","2g","3g"].includes(connection?.effectiveType)||((navigator.deviceMemory||8)<=4);
    const chunkSize=constrained?4*1024*1024:8*1024*1024;
    setProgress(item.offset,item.size,"Ready to upload · "+fmt(item.offset)+" / "+fmt(item.size)+(constrained?" · mobile-friendly chunks":""));
    while(item.offset<item.size){
      if(cancelRequested)throw Object.assign(new Error("Upload cancelled"),{code:"UPLOAD_CANCELLED"});
      const end=Math.min(item.size,item.offset+chunkSize),blob=file.slice(item.offset,end);
      const response=await putChunkWithRetry(root,token,item,blob,end);
      if(!Number.isSafeInteger(response.offset)||response.offset<=item.offset||response.offset>end)throw new Error("Media server returned an invalid or non-advancing upload position. Refresh the queue before retrying.");
      item.offset=response.offset;item.status="uploading";item.updatedAt=Date.now();await storeItem(item);
      setProgress(item.offset,item.size,"Uploading "+fmt(item.offset)+" / "+fmt(item.size)+" · "+Math.floor(item.offset/item.size*100)+"%");
    }
    if(cancelRequested)throw Object.assign(new Error("Upload cancelled"),{code:"UPLOAD_CANCELLED"});
    const completed=await request(root,"/api/uploads/"+encodeURIComponent(item.uploadId)+"/complete",token,{method:"POST",headers:headers(token)});
    if(!completed||typeof completed.sha256!=="string"||!/^[a-f0-9]{64}$/i.test(completed.sha256))throw new Error("Media server completed the upload without a valid SHA-256 checksum. Keep this item queued and ask the owner to verify the server catalog.");
    item.sha256=completed.sha256;
    item.status="Pending owner approval";item.completedAt=Date.now();item.updatedAt=item.completedAt;item.handle=null;await storeItem(item);
    setProgress(item.size,item.size,"Upload complete · waiting for owner approval");
    await renderQueue();
  }
  function isTerminalQueueStatus(status){return status==="Pending owner approval"||status==="Approved · published"||status==="Rejected or removed on server"}
  async function syncOwnerQueueStatuses(pendingItems){
    const cfg=readConfig(),root=cleanRoot(cfg.root),token=$("mediaAdminToken")?.value.trim()||sessionStorage.getItem("storyspace.mediaAdmin")||"";
    if(!validRoot(root)||token.length<32)return;
    const catalog=await request(root,"/api/catalog",token,{headers:{"x-storyspace-admin-token":token},cache:"no-store"});
    if(!Array.isArray(catalog))throw new Error("Media server returned an invalid catalog");
    const pendingIds=new Set((Array.isArray(pendingItems)?pendingItems:[]).map(item=>String(item.id)));
    const publishedIds=new Set(catalog.map(item=>String(item.id)));
    const queued=await getItems();let changed=false;
    for(const item of queued){
      if(!item.uploadId||!item.status||!item.status.startsWith("Pending owner approval"))continue;
      const id=String(item.uploadId);
      const next=pendingIds.has(id)?"Pending owner approval":publishedIds.has(id)?"Approved · published":"Rejected or removed on server";
      if(item.status!==next){item.status=next;item.updatedAt=Date.now();changed=true;await storeItem(item)}
    }
    if(changed)await renderQueue();
  }
  async function renderQueue(){
    const target=$("mediaQueueList");if(!target)return;
    try{const items=await getItems();target.replaceChildren();if(!items.length){target.textContent="No queued uploads yet.";target.className="media-muted";return}
      items.sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0)).forEach(item=>{
        const row=document.createElement("div");row.className="media-queue-item";const info=document.createElement("div");const title=document.createElement("b");title.textContent=item.title;const meta=document.createElement("small");meta.textContent=(item.status||"Queued")+" · "+fmt(item.offset||0)+" / "+fmt(item.size);info.append(title,meta);row.append(info);
        if(active&&activeItemId===item.id){
          const cancel=document.createElement("button");cancel.type="button";cancel.className="secondary-button";cancel.textContent="Cancel upload";cancel.disabled=!item.uploadId||cancelRequested;
          cancel.addEventListener("click",async()=>{
            if(!active||activeItemId!==item.id||!item.uploadId||cancelRequested)return;
            const cfg=readConfig(),root=cleanRoot(cfg.root),token=cfg.uploadToken;
            if(!window.confirm("Cancel this upload and delete its unfinished server-side video data?"))return;
            cancelRequested=true;window.dispatchEvent(new Event("storyspace-upload-cancel"));cancel.disabled=true;item.status="Cancelling upload";item.updatedAt=Date.now();await storeItem(item);await renderQueue();showToast("Cancelling upload safely…");
            try{
              await request(root,"/api/uploads/"+encodeURIComponent(item.uploadId),token,{method:"DELETE",headers:headers(token)});
              await removeItem(item.id);showToast("Upload cancelled and partial server data removed");
            }catch(error){cancelRequested=false;item.status="Paused · cancellation failed";item.updatedAt=Date.now();await storeItem(item);showToast("Could not cancel server upload: "+error.message)}
            await renderQueue();
          });row.append(cancel);
        }else if(!isTerminalQueueStatus(item.status)&&!String(item.status||"").startsWith("Cancelling")){const retry=document.createElement("button");retry.type="button";retry.className="secondary-button";retry.textContent="Resume";retry.disabled=active;retry.addEventListener("click",()=>resumeOne(item.id));row.append(retry)}
        const remove=document.createElement("button");remove.type="button";remove.className="secondary-button";remove.textContent="Remove";remove.setAttribute("aria-label","Remove "+item.title+" from this device's upload queue");remove.disabled=active;remove.addEventListener("click",async()=>{if(active)return;const pending=item.status==="Pending owner approval";const message=pending?"Remove this completed upload from this device's queue? The server copy and owner approval status will not be changed.":"Remove this upload from this device's queue? Any server-side partial upload may remain until the media host cleans it up.";if(!window.confirm(message))return;remove.disabled=true;try{await removeItem(item.id);showToast("Removed from this device's upload queue");await renderQueue()}catch(error){showToast("Could not remove queue item: "+error.message);remove.disabled=false}});row.append(remove);target.append(row);
      });
    }catch(error){target.textContent=error.message;target.className="media-muted"}
  }
  async function resumeOne(id){
    if(active)return;active=true;activeItemId=id;cancelRequested=false;await renderQueue();
    let item=null;
    try{const items=await getItems();item=items.find(x=>x.id===id);if(!item)return;const file=await getFile(item);await runUpload(item,file);showToast("Upload sent for owner approval")}
    catch(error){if(error.code!=="UPLOAD_CANCELLED"){if(item){item.status="Paused · "+error.message;item.updatedAt=Date.now();try{await storeItem(item)}catch{}}setProgress(item?.offset||0,item?.size||1,error.message);showToast(error.message)}}
    finally{active=false;activeItemId=null;cancelRequested=false;await renderQueue()}
  }
  async function resumeAll(){
    if(active||!navigator.onLine)return;
    let items=[];try{items=await getItems()}catch{return}
    const next=items.find(x=>!isTerminalQueueStatus(x.status)&&!String(x.status||"").startsWith("Cancelling")&&(x.handle||(selectedFile&&selectedFile.name===x.filename&&selectedFile.size===x.size)));
    if(next)await resumeOne(next.id);
  }
  const communityCacheKey=root=>"storyspace.communityCatalog.v1:"+root;
  function readCommunityCatalogCache(root){try{const cached=JSON.parse(localStorage.getItem(communityCacheKey(root))||"null");return cached&&cached.root===root&&Array.isArray(cached.items)?cached.items:null}catch{return null}}
  function saveCommunityCatalogCache(root,items){try{localStorage.setItem(communityCacheKey(root),JSON.stringify({root,items,updatedAt:Date.now()}))}catch{/* Public catalog cache is optional and must not block uploads or playback. */}}
  async function refreshCommunityCatalog(){
    const cfg=readConfig(),root=cleanRoot(cfg.root);if(!validRoot(root))return;
    let items=[],offline=false;
    try{items=await request(root,"/api/catalog",cfg.uploadToken||"",{cache:"no-store"});if(!Array.isArray(items))throw new Error("Invalid community catalog");saveCommunityCatalogCache(root,items)}
    catch(error){items=readCommunityCatalogCache(root)||[];offline=items.length>0;if(!offline){console.warn("Community catalog unavailable",error);return}}
    const existing=new Set(movies.map(m=>String(m.mediaId||"")));
    items.forEach(item=>{if(!item||!item.id||existing.has(String(item.id)))return;const stream=new URL(item.streamUrl||("/media/"+item.id),root).href;movies.push({id:"media-"+item.id,mediaId:item.id,title:String(item.title||"Untitled upload"),type:"movie",year:new Date(item.addedAt||Date.now()).getFullYear(),rating:"NR",duration:"Community upload",genre:"Community",score:0,original:true,description:"Owner-approved community upload.",cast:"Community media",poster:"",progress:0,streamUrl:stream});});
    let section=$("communitySection");if(!section){section=document.createElement("section");section.className="movie-section";section.id="communitySection";section.innerHTML="<div class=\"section-heading\"><div><span class=\"section-kicker\">COMMUNITY LIBRARY</span><h2>Movies shared with Storyspace</h2></div></div><p id=\"communityCatalogStatus\" class=\"media-muted\" role=\"status\"></p><div class=\"movie-row\" id=\"communityRow\"></div>";document.querySelector(".content-area")?.append(section)}
    let status=$("communityCatalogStatus");if(status){status.textContent=offline?"Offline · showing saved catalog":"Connected · owner-approved uploads";status.hidden=!offline&&items.length===0}
    renderRow("communityRow",movies.filter(m=>String(m.id).startsWith("media-")));
    section.hidden=!movies.some(m=>String(m.id).startsWith("media-"));
  }
  async function loadPending(){
    const root=cleanRoot(readConfig().root),token=$("mediaAdminToken").value.trim(),target=$("mediaPendingList");
    if(!validRoot(root)||!token){target.textContent="Enter a valid media server address and owner admin key.";return}
    target.textContent="Loading pending uploads…";
    try{
      await request(root,"/api/auth/verify/admin",token,{method:"POST",headers:{"x-storyspace-admin-token":token}});
      const items=await request(root,"/admin/pending",token,{headers:{"x-storyspace-admin-token":token}});
      await syncOwnerQueueStatuses(items);
      target.replaceChildren();if(!items.length){target.textContent="No pending uploads.";return}
      items.forEach(item=>{
        const row=document.createElement("div");row.className="media-pending-item";const info=document.createElement("div"),title=document.createElement("b"),meta=document.createElement("small");title.textContent=item.title;meta.textContent=fmt(item.size)+" · "+new Date(item.addedAt).toLocaleString();info.append(title,meta);
        const actions=document.createElement("div");actions.className="media-pending-actions";
        for(const action of ["approve","reject"]){const button=document.createElement("button");button.type="button";button.className=action==="approve"?"primary-button":"secondary-button";button.textContent=action==="approve"?"Approve":"Reject";button.addEventListener("click",async()=>{button.disabled=true;try{await request(root,"/admin/review/"+encodeURIComponent(item.id),token,{method:"POST",headers:{"x-storyspace-admin-token":token,"content-type":"application/json"},body:JSON.stringify({action})});showToast(action==="approve"?"Movie published":"Upload rejected");await loadPending();if(action==="approve")await refreshCommunityCatalog()}catch(error){showToast(error.message);button.disabled=false}});actions.append(button)}
        row.append(info,actions);target.append(row);
      });
    }catch(error){
      target.textContent=error.status===401
        ?"Owner admin key was rejected by this media server. Copy the adminToken from this PC's media-host.json and restart the media server after any key changes."
        :error.message;
    }
  }

  function showHealth(state,title,detail,latency){
    const dot=$("mediaHealthDot"),heading=$("mediaHealthTitle"),note=$("mediaHealthDetail"),panel=$("mediaServerHealth");
    if(!dot||!heading||!note||!panel)return;
    dot.className="media-health-dot "+state;heading.textContent=title;note.textContent=detail+(latency!==undefined?" · "+latency+" ms":"");panel.dataset.state=state;
  }
  async function checkServerHealth(){
    const root=cleanRoot($("mediaServerRoot")?.value||readConfig().root),token=$("mediaUploadToken")?.value.trim()||readConfig().uploadToken||"";
    if(!validRoot(root)){showHealth("offline","Server address missing","Enter a valid HTTPS media server URL.");return false}
    const button=$("mediaHealthCheck");if(button)button.disabled=true;
    showHealth("checking","Checking connection","Contacting the media host securely…");
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000),started=performance.now();
    try{
      const response=await fetch(root+"/health",{credentials:"omit",cache:"no-store",signal:controller.signal});
      if(!response.ok)throw new Error("HTTP "+response.status);
      const data=await response.json(),latency=Math.round(performance.now()-started);
      if(data.ok!==true||data.service!=="storyspace-home-media")throw new Error("URL is not a Storyspace media server");
      let detail="Host online · version "+String(data.version||"unknown");
      if(token.length>=32){await request(root,"/api/auth/verify/uploader",token,{method:"POST",headers:headers(token),signal:controller.signal});detail+=" · upload key accepted"}
      else detail+=" · upload key not configured";
      showHealth("online","Connected",detail,latency);return true;
    }catch(error){showHealth("offline","Unavailable",error.name==="AbortError"?"Connection timed out (8 seconds)":error.message||"Could not reach media host");return false}
    finally{clearTimeout(timeout);if(button)button.disabled=false}
  }
  $("mediaHealthCheck")?.addEventListener("click",checkServerHealth);
  function openHub(){
    $("mediaHubBackdrop").hidden=false;document.body.style.overflow="hidden";
    const cfg=readConfig();$("mediaServerRoot").value=cfg.root||"";$("mediaUploadToken").value=cfg.uploadToken||"";
    $("mediaAdminToken").value=sessionStorage.getItem("storyspace.mediaAdmin")||"";
    renderQueue();refreshCommunityCatalog();checkServerHealth();
  }
  function closeHub(){$("mediaHubBackdrop").hidden=true;document.body.style.overflow=""}
  $("openMediaHub")?.addEventListener("click",openHub);
  $("mediaHubClose")?.addEventListener("click",closeHub);
  $("mediaHubBackdrop")?.addEventListener("click",e=>{if(e.target===$("mediaHubBackdrop"))closeHub()});
  $("mediaConfigForm")?.addEventListener("submit",async e=>{
    e.preventDefault();const root=cleanRoot($("mediaServerRoot").value),uploadToken=$("mediaUploadToken").value.trim();
    if(!validRoot(root)){showToast("Use a valid HTTPS media server address");return}
    if(uploadToken.length<32){showToast("Paste the uploader invitation key (32+ characters)");return}
    const saveButton=$("mediaConfigForm").querySelector('button[type="submit"]');
    if(saveButton)saveButton.disabled=true;
    const started=performance.now();
    try{
      const healthData=await request(root,"/health","",{cache:"no-store",timeoutMs:8000});
      if(healthData.ok!==true||healthData.service!=="storyspace-home-media")throw new Error("This URL is not a Storyspace Home Media server");
      await request(root,"/api/auth/verify/uploader",uploadToken,{method:"POST",headers:headers(uploadToken)});
      saveConfig({root,uploadToken});showHealth("online","Connected","Host online · uploader key accepted",Math.round(performance.now()-started));showToast("Connection verified · uploader key accepted");refreshCommunityCatalog();resumeAll();
    }catch(error){
      showHealth("offline","Verification failed",error.status===401?"Uploader invitation key rejected":error.message||"Could not reach media host");
      showToast(error.status===401
        ?"Uploader invitation key rejected. Copy uploadToken from this PC's media-host.json; restart the media server if you changed it."
        :"Could not verify media server: "+error.message);
    }finally{if(saveButton)saveButton.disabled=false}
  });
  $("mediaAdminLoad")?.addEventListener("click",()=>{const token=$("mediaAdminToken").value.trim();if(token.length<32){showToast("Admin key must contain at least 32 characters");return}sessionStorage.setItem("storyspace.mediaAdmin",token);loadPending()});
  $("mediaQueueRefresh")?.addEventListener("click",renderQueue);
  $("mediaMovieFile")?.addEventListener("change",e=>{selectedFile=e.target.files?.[0]||null;selectedHandle=null;$("mediaFileNote").textContent=selectedFile?selectedFile.name+" · "+fmt(selectedFile.size):"MP4, M4V, WebM or MOV · up to 15 GB (server limit)"});
  $("mediaUploadStart")?.addEventListener("click",async()=>{
    const title=$("mediaMovieTitle").value.trim();let file=selectedFile,handle=null;
    if(!title){showToast("Enter a movie title");return}
    if(!file&&window.showOpenFilePicker){
      try{[handle]=await window.showOpenFilePicker({multiple:false,types:[{description:"Movie video",accept:{"video/mp4":[".mp4",".m4v"],"video/webm":[".webm"],"video/quicktime":[".mov"]}}]});file=await handle.getFile();selectedFile=file;selectedHandle=handle}
      catch(error){if(error.name==="AbortError")return}
    }
    if(!file){showToast("Choose a movie file first");return}
    if(!Number.isFinite(file.size)||file.size<=0){showToast("The selected video file is empty or unreadable");return}
    if(file.size>15*1024*1024*1024){showToast("This video exceeds the 15 GB media server limit");return}
    const ext=file.name.split(".").pop().toLowerCase();if(!["mp4","m4v","webm","mov"].includes(ext)){showToast("Supported formats: MP4, M4V, WebM, MOV");return}
    // Reuse a matching unfinished queue entry instead of creating duplicate uploads.
    try{
      const queued=await getItems();
      const sameFile=x=>x.filename===file.name&&x.size===file.size&&(!x.lastModified||!file.lastModified||x.lastModified===file.lastModified);
      const duplicate=queued.find(x=>sameFile(x)&&!isTerminalQueueStatus(x.status)&&!String(x.status||"").startsWith("Cancelling"));
      if(duplicate){
        selectedFile=file;selectedHandle=handle;
        if(handle){duplicate.handle=handle;await storeItem(duplicate)}
        showToast("This video is already queued · resuming the existing upload");
        $("mediaUploadStart").disabled=true;
        await resumeOne(duplicate.id);
        return;
      }
    }catch(error){showToast("Could not check for duplicate uploads: "+error.message);return}
    const item={id:crypto.randomUUID(),title,filename:file.name,size:file.size,lastModified:file.lastModified||0,offset:0,status:"Queued",createdAt:Date.now(),updatedAt:Date.now(),handle};
    try{await storeItem(item)}catch(error){showToast("Could not save queue metadata: "+error.message);return}
    $("mediaUploadStart").disabled=true;active=true;activeItemId=item.id;cancelRequested=false;await renderQueue();
    try{await runUpload(item,file);$("mediaMovieTitle").value="";showToast("Upload complete · awaiting approval")}
    catch(error){if(error.code!=="UPLOAD_CANCELLED"){item.status="Paused · "+error.message;item.updatedAt=Date.now();await storeItem(item);setProgress(item.offset||0,item.size,error.message);showToast("Upload paused; resume when connected")}}
    finally{active=false;activeItemId=null;cancelRequested=false;$("mediaUploadStart").disabled=false;await renderQueue()}
  });
  window.addEventListener("online",resumeAll);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)resumeAll()});
  window.setInterval(resumeAll,30000);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("mediaHubBackdrop").hidden)closeHub()});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{renderQueue();refreshCommunityCatalog()},{once:true});else{renderQueue();refreshCommunityCatalog()}
})();