(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const DB_NAME="storyspace-media-uploads",STORE="queue",CONFIG_KEY="storyspace.mediaHost";
  let dbPromise=null,active=false,selectedFile=null,selectedHandle=null;
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
    const res=await fetch(root+path,{...options,credentials:"omit",headers:requestHeaders});
    let data={};try{data=await res.json()}catch{}
    if(!res.ok){const e=new Error(data.error||"Media server request failed ("+res.status+")");e.status=res.status;e.data=data;throw e}return data;
  }
  function fmt(bytes){if(!Number.isFinite(bytes))return "—";const units=["B","KB","MB","GB","TB"];let n=bytes,i=0;while(n>=1024&&i<units.length-1){n/=1024;i++}return n.toFixed(i?1:0)+" "+units[i]}
  function setProgress(done,total,message){$("mediaProgress").hidden=false;$("mediaProgressFill").style.width=(total?Math.min(100,done/total*100):0)+"%";$("mediaProgressText").textContent=message}
  async function getFile(item){
    if(item.handle){try{let permission=await item.handle.queryPermission({mode:"read"});if(permission!=="granted")permission=await item.handle.requestPermission({mode:"read"});if(permission==="granted")return await item.handle.getFile()}catch{}}
    if(selectedFile&&selectedFile.name===item.filename&&selectedFile.size===item.size)return selectedFile;
    throw new Error("Select the original file again to resume this upload.");
  }
  async function runUpload(item,file){
    const cfg=readConfig(),root=cleanRoot(cfg.root),token=cfg.uploadToken;
    if(!validRoot(root)||!token||token.length<32)throw new Error("Save a valid HTTPS media server address and uploader invitation key first.");
    if(!item.uploadId){
      const init=await request(root,"/api/uploads/init",token,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({title:item.title,filename:item.filename,size:item.size})});
      item.uploadId=init.uploadId;item.offset=0;item.status="uploading";await storeItem(item);
    }else{
      const status=await request(root,"/api/uploads/"+encodeURIComponent(item.uploadId),token);
      item.offset=status.offset;await storeItem(item);
    }
    const chunkSize=8*1024*1024;
    while(item.offset<item.size){
      const end=Math.min(item.size,item.offset+chunkSize),blob=file.slice(item.offset,end);
      const response=await request(root,"/api/uploads/"+encodeURIComponent(item.uploadId)+"/chunk",token,{method:"PUT",headers:headers(token,{"x-upload-offset":String(item.offset)}),body:blob});
      item.offset=response.offset;item.status="uploading";await storeItem(item);
      setProgress(item.offset,item.size,"Uploading "+fmt(item.offset)+" / "+fmt(item.size)+" · "+Math.floor(item.offset/item.size*100)+"%");
    }
    await request(root,"/api/uploads/"+encodeURIComponent(item.uploadId)+"/complete",token,{method:"POST",headers:headers(token)});
    item.status="Pending owner approval";item.completedAt=Date.now();item.handle=null;await storeItem(item);
    setProgress(item.size,item.size,"Upload complete · waiting for owner approval");
    await renderQueue();
  }
  async function renderQueue(){
    const target=$("mediaQueueList");if(!target)return;
    try{const items=await getItems();target.replaceChildren();if(!items.length){target.textContent="No queued uploads yet.";target.className="media-muted";return}
      items.sort((a,b)=>(b.updatedAt||b.createdAt||0)-(a.updatedAt||a.createdAt||0)).forEach(item=>{
        const row=document.createElement("div");row.className="media-queue-item";const info=document.createElement("div");const title=document.createElement("b");title.textContent=item.title;const meta=document.createElement("small");meta.textContent=(item.status||"Queued")+" · "+fmt(item.offset||0)+" / "+fmt(item.size);info.append(title,meta);row.append(info);
        if(item.status!=="Pending owner approval"){const retry=document.createElement("button");retry.type="button";retry.className="secondary-button";retry.textContent="Resume";retry.addEventListener("click",()=>resumeOne(item.id));row.append(retry)}target.append(row);
      });
    }catch(error){target.textContent=error.message;target.className="media-muted"}
  }
  async function resumeOne(id){
    if(active)return;active=true;
    try{const items=await getItems(),item=items.find(x=>x.id===id);if(!item)return;const file=await getFile(item);await runUpload(item,file);showToast("Upload sent for owner approval")}
    catch(error){setProgress(0,1,error.message);showToast(error.message)}
    finally{active=false;await renderQueue()}
  }
  async function resumeAll(){
    if(active||!navigator.onLine)return;
    let items=[];try{items=await getItems()}catch{return}
    const next=items.find(x=>x.status!=="Pending owner approval"&&x.handle);
    if(next)await resumeOne(next.id);
  }
  async function refreshCommunityCatalog(){
    const cfg=readConfig(),root=cleanRoot(cfg.root);if(!validRoot(root))return;
    try{
      const res=await fetch(root+"/api/catalog");if(!res.ok)return;const items=await res.json();if(!Array.isArray(items))return;
      const existing=new Set(movies.map(m=>String(m.mediaId||"")));
      items.forEach(item=>{if(!item||!item.id||existing.has(String(item.id)))return;const stream=new URL(item.streamUrl||("/media/"+item.id),root).href;movies.push({id:"media-"+item.id,mediaId:item.id,title:String(item.title||"Untitled upload"),type:"movie",year:new Date(item.addedAt||Date.now()).getFullYear(),rating:"NR",duration:"Community upload",genre:"Community",score:0,original:true,description:"Owner-approved community upload.",cast:"Community media",poster:"",progress:0,streamUrl:stream});});
      let section=$("communitySection");if(!section){section=document.createElement("section");section.className="movie-section";section.id="communitySection";section.innerHTML="<div class=\"section-heading\"><div><span class=\"section-kicker\">COMMUNITY LIBRARY</span><h2>Movies shared with Storyspace</h2></div></div><div class=\"movie-row\" id=\"communityRow\"></div>";document.querySelector(".content-area")?.append(section)}
      renderRow("communityRow",movies.filter(m=>String(m.id).startsWith("media-")));
      section.hidden=!movies.some(m=>String(m.id).startsWith("media-"));
    }catch(error){console.warn("Community catalog unavailable",error)}
  }
  async function loadPending(){
    const root=cleanRoot(readConfig().root),token=$("mediaAdminToken").value.trim(),target=$("mediaPendingList");
    if(!validRoot(root)||!token){target.textContent="Enter a valid media server address and owner admin key.";return}
    target.textContent="Loading pending uploads…";
    try{
      const items=await request(root,"/admin/pending",token,{headers:{"x-storyspace-admin-token":token}});
      target.replaceChildren();if(!items.length){target.textContent="No pending uploads.";return}
      items.forEach(item=>{
        const row=document.createElement("div");row.className="media-pending-item";const info=document.createElement("div"),title=document.createElement("b"),meta=document.createElement("small");title.textContent=item.title;meta.textContent=fmt(item.size)+" · "+new Date(item.addedAt).toLocaleString();info.append(title,meta);
        const actions=document.createElement("div");actions.className="media-pending-actions";
        for(const action of ["approve","reject"]){const button=document.createElement("button");button.type="button";button.className=action==="approve"?"primary-button":"secondary-button";button.textContent=action==="approve"?"Approve":"Reject";button.addEventListener("click",async()=>{button.disabled=true;try{await request(root,"/admin/review/"+encodeURIComponent(item.id),token,{method:"POST",headers:{"x-storyspace-admin-token":token,"content-type":"application/json"},body:JSON.stringify({action})});showToast(action==="approve"?"Movie published":"Upload rejected");await loadPending();if(action==="approve")await refreshCommunityCatalog()}catch(error){showToast(error.message);button.disabled=false}});actions.append(button)}
        row.append(info,actions);target.append(row);
      });
    }catch(error){target.textContent=error.message}
  }
  function openHub(){
    $("mediaHubBackdrop").hidden=false;document.body.style.overflow="hidden";
    const cfg=readConfig();$("mediaServerRoot").value=cfg.root||"";$("mediaUploadToken").value=cfg.uploadToken||"";
    $("mediaAdminToken").value=sessionStorage.getItem("storyspace.mediaAdmin")||"";
    renderQueue();refreshCommunityCatalog();
  }
  function closeHub(){$("mediaHubBackdrop").hidden=true;document.body.style.overflow=""}
  $("openMediaHub")?.addEventListener("click",openHub);
  $("mediaHubClose")?.addEventListener("click",closeHub);
  $("mediaHubBackdrop")?.addEventListener("click",e=>{if(e.target===$("mediaHubBackdrop"))closeHub()});
  $("mediaConfigForm")?.addEventListener("submit",e=>{
    e.preventDefault();const root=cleanRoot($("mediaServerRoot").value),uploadToken=$("mediaUploadToken").value.trim();
    if(!validRoot(root)){showToast("Use a valid HTTPS media server address");return}
    saveConfig({root,uploadToken});showToast("Media server address saved for this session");refreshCommunityCatalog();
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
    const ext=file.name.split(".").pop().toLowerCase();if(!["mp4","m4v","webm","mov"].includes(ext)){showToast("Supported formats: MP4, M4V, WebM, MOV");return}
    const item={id:crypto.randomUUID(),title,filename:file.name,size:file.size,offset:0,status:"Queued",createdAt:Date.now(),updatedAt:Date.now(),handle};
    try{await storeItem(item)}catch(error){showToast("Could not save queue metadata: "+error.message);return}
    $("mediaUploadStart").disabled=true;active=true;
    try{await runUpload(item,file);$("mediaMovieTitle").value="";showToast("Upload complete · awaiting approval")}
    catch(error){item.status="Paused · "+error.message;await storeItem(item);setProgress(item.offset||0,item.size,error.message);showToast("Upload paused; resume when connected")}
    finally{active=false;$("mediaUploadStart").disabled=false;await renderQueue()}
  });
  window.addEventListener("online",resumeAll);
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)resumeAll()});
  window.setInterval(resumeAll,30000);
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("mediaHubBackdrop").hidden)closeHub()});
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{renderQueue();refreshCommunityCatalog()},{once:true});else{renderQueue();refreshCommunityCatalog()}
})();