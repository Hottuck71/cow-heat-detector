/* Minimal frontend logic
   - talks to backend at BACKEND (default http://localhost:5000)
   - lets user add camera URLs
   - shows a test camera pointing to local uploaded file: file:///mnt/data/IMG_4132.JPEG
*/
const BACKEND = window.__BACKEND__ || (location.hostname === 'localhost' ? 'http://localhost:5000' : `${location.protocol}//${location.hostname}:5000`);
const LOCAL_TEST_URL = 'file:///mnt/data/IMG_4132.JPEG'; // your uploaded image path (used for local test)

const camListEl = document.getElementById('camList');
const liveGrid = document.getElementById('liveGrid');
const clipList = document.getElementById('clipList');
const statusEl = document.getElementById('status');

document.getElementById('addBtn').addEventListener('click', addCamera);
document.getElementById('refreshBtn').addEventListener('click', refreshAll);

async function addCamera(){
  const input = document.getElementById('camInput');
  const url = input.value.trim();
  if(!url) return alert('Enter a camera URL');

  try{
    const res = await fetch(`${BACKEND}/api/addCamera`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({url})
    });
    const data = await res.json();
    if(data.error) return alert('Error: ' + data.error);
    input.value = '';
    status('camera added');
    await refreshAll();
  }catch(e){
    console.error(e);
    alert('Failed to add camera (check backend)');
  }
}

async function fetchCameras(){
  try{
    const res = await fetch(`${BACKEND}/api/listCameras`);
    return await res.json();
  }catch(e){
    console.warn('camera list fetch failed', e);
    return null;
  }
}

function createCamCard(cam){
  const wrapper = document.createElement('div');
  wrapper.className = 'cam-card';
  wrapper.onclick = ()=> focusCamera(cam);

  const thumb = document.createElement('img');
  thumb.className = 'cam-thumb';
  // display thumbnail; if it's a file image, show it; otherwise use a placeholder frame image
  if(cam.url && cam.url.startsWith('file:///')) thumb.src = cam.url;
  else thumb.src = `${BACKEND}/api/thumb/${cam.id}.jpg`; // backend may not have this; placeholder if 404

  const meta = document.createElement('div');
  meta.className = 'cam-meta';
  const name = document.createElement('div'); name.className='name'; name.textContent = cam.name || ('Camera ' + cam.id);
  const url = document.createElement('div'); url.className='url'; url.textContent = cam.url;
  meta.appendChild(name); meta.appendChild(url);

  wrapper.appendChild(thumb);
  wrapper.appendChild(meta);
  return wrapper;
}

function createFeedCard(cam){
  const c = document.createElement('div'); c.className='feed-card';
  const media = document.createElement('div'); media.className='feed-media';

  // if file image show as image; if http(s) show image tag; for other streams show placeholder
  if(cam.url && cam.url.startsWith('file:///')){
    const img = document.createElement('img'); img.src = cam.url;
    media.appendChild(img);
  } else {
    // many IP streams (RTSP) won't play in browser; show placeholder / snapshot endpoint
    const img = document.createElement('img');
    // try to get a thumb via backend if exists
    img.src = `${BACKEND}/api/thumb/${encodeURIComponent(cam.id)}.jpg`;
    img.onerror = ()=> { img.src = '/placeholder.png'; }
    media.appendChild(img);
  }

  const info = document.createElement('div'); info.className='feed-info';
  const title = document.createElement('div'); title.className='feed-title'; title.textContent = cam.name || ('Camera ' + cam.id);
  const actions = document.createElement('div'); actions.className='feed-actions';
  const btn = document.createElement('button'); btn.textContent='Open Clips';
  btn.onclick = (e)=>{ e.stopPropagation(); openClipsFor(cam); };
  actions.appendChild(btn);
  info.appendChild(title); info.appendChild(actions);

  c.appendChild(media); c.appendChild(info);
  return c;
}

function createClipCard(c){
  const wrapper = document.createElement('div'); wrapper.className='clip-card';
  const img = document.createElement('img'); img.className='clip-thumb';
  img.src = `${BACKEND}/api/thumb/${encodeURIComponent(c.meta.thumb || c.meta.clip.replace('.mp4','.jpg'))}`;
  img.onerror = ()=> img.src = '/placeholder.png';

  const meta = document.createElement('div'); meta.className='clip-meta';
  const type = document.createElement('div'); type.className='type'; type.textContent = (c.meta.type || 'alert').toUpperCase();
  const time = document.createElement('div'); time.className='time'; time.textContent = new Date(c.meta.timestamp || Date.now()).toLocaleString();
  meta.appendChild(type); meta.appendChild(time);

  const actions = document.createElement('div'); actions.className='clip-actions';
  const btn = document.createElement('button'); btn.textContent='Play';
  btn.onclick = ()=> window.open(`${BACKEND}/api/clip/${c.file}`, '_blank');
  actions.appendChild(btn);

  wrapper.appendChild(img); wrapper.appendChild(meta); wrapper.appendChild(actions);
  return wrapper;
}

let lastCameraSnapshot = null;

async function refreshAll(){
  status('refreshing...');
  // fetch cameras from backend; if none, show local test camera
  const cams = await fetchCameras();
  camListEl.innerHTML = '';
  liveGrid.innerHTML = '';
  if(cams && Object.keys(cams).length){
    for(const k in cams){
      const cam = cams[k];
      camListEl.appendChild(createCamCard(cam));
      liveGrid.appendChild(createFeedCard(cam));
    }
  } else {
    // show a single local test camera so the UI doesn't feel empty
    const testCam = { id: 'local-test', url: LOCAL_TEST_URL, name: 'Local Test' };
    camListEl.appendChild(createCamCard(testCam));
    liveGrid.appendChild(createFeedCard(testCam));
  }

  // fetch clips
  try{
    const res = await fetch(`${BACKEND}/api/clips`);
    const clips = await res.json();
    clipList.innerHTML = '';
    for(const c of clips){
      clipList.appendChild(createClipCard(c));
    }
  }catch(e){
    console.warn('no clips', e);
    clipList.innerHTML = '<div style="color:var(--muted);font-size:13px">No clips yet</div>';
  }

  status('idle');
}

function focusCamera(cam){
  // Simple: scroll that camera's feed into view (we match by id)
  const feeds = Array.from(liveGrid.children);
  const idx = feeds.findIndex(f=> f.querySelector('.feed-title').textContent === (cam.name || 'Camera ' + cam.id));
  if(idx >= 0) feeds[idx].scrollIntoView({behavior:'smooth', block:'center'});
}

function openClipsFor(cam){
  // filter clip list by camera id (best-effort)
  const all = Array.from(clipList.children);
  for(const el of all){
    // naive filter: check meta text
    if(el.textContent.includes(cam.id) || el.textContent.includes(cam.name)) el.style.display = '';
    else el.style.display = 'none';
  }
}

function status(text){ statusEl.textContent = text; }

refreshAll();
setInterval(refreshAll, 6000); // keep UI fresh
