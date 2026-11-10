
/* ===== 20-online.js — CHAT · SỐ NGƯỜI ONLINE · TOÀN MÀN HÌNH =====
   - Nút "⛶" (góc trái hàng nút trên cùng): bật/tắt toàn màn hình.
   - "🟢 N online": số người đang chơi. Mỗi người đã đăng nhập ghi 1 "nhịp tim" vào Firestore presence/{uid} = {name,t}
     mỗi HB_MS; ai có nhịp tim trong ONLINE_MS gần nhất thì tính là đang online.
   - Nút "💬" góc phải dưới: mở khung chat chung. Tin nhắn nằm ở Firestore chat/{id} = {uid,name,text,t}.
   - Chỉ hiện tin nhắn từ lúc người chơi vào game (không có lịch sử cũ). Khung chat đóng mà có tin mới của người khác -> hiện số đỏ (1, 2, 3... tối đa 99+) trên nút 💬; mở chat thì số về 0.
   - Khách (chưa đăng nhập) xem được số online + đọc chat nhưng không gửi được.
   Móc vào game qua 19-save.js: sau khi vào game, 19-save gọi TTGNET.start({db,uid,name,guest}). File này phải được nạp TRƯỚC 19-save.js.
   Mọi con số chỉnh ngay dưới đây. Luật Firestore cần thiết: xem file FIRESTORE_RULES.txt. */
(()=>{
'use strict';
const HB_MS=120000;           /* gửi nhịp tim mỗi 2 phút (tab ẩn thì không gửi) */
const ONLINE_MS=300000;       /* có nhịp tim trong 5 phút gần nhất = đang online */
const COUNT_MS=120000;        /* cập nhật số online mỗi 2 phút */
const CHAT_LIMIT=50;          /* hiện tối đa bao nhiêu tin gần nhất */
const MAX_LEN=200;            /* tối đa ký tự mỗi tin */
const COOLDOWN_MS=2000;       /* giãn cách giữa 2 tin (chống spam) */

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- CSS ---------- */
{const s=document.createElement('style');
 s.textContent=
 '#ol-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;position:relative;z-index:20}'+
 '.ol-pill{display:inline-block;cursor:default;font-size:14px!important;font-weight:700;color:var(--jade);line-height:1.1;padding:1px 8px;border:2px solid #75613b;background-color:#20373a;background-image:repeating-conic-gradient(#284342 0 25%,#1a3036 0 50%);background-size:4px 4px;box-shadow:0 3px 0 0 #040a0e,inset 0 2px 0 0 #927a48,inset 0 -2px 0 0 #0b181b;user-select:none;white-space:nowrap;font-family:inherit}'+
 'button.ol-pill{cursor:pointer;color:var(--gold);width:auto;margin:0;height:auto;min-height:0;flex:none}'+
 'button.ol-pill:active{transform:translateY(2px);box-shadow:0 1px 0 0 #040a0e,inset 0 2px 0 0 #927a48}'+
 '#ol-fs{display:none}'+
 '#ol-fab{position:fixed;right:10px;bottom:calc(60px + env(safe-area-inset-bottom,0px));z-index:59;width:auto;margin:0;padding:3px 10px;cursor:pointer;font-size:18px!important;color:#f5edcf;background:#14272d;border:2px solid #f6c66a;box-shadow:0 2px 0 #040a0e;border-radius:0;display:none}'+
 '#ol-fab b{display:none;position:absolute;top:-9px;right:-8px;min-width:18px;padding:0 4px;font-size:14px!important;line-height:18px;text-align:center;color:#fff;background:#e34e48;border:2px solid #040a0e}'+
 '#ol-fab.has b{display:block}'+
 '#ol-chat{position:fixed;right:8px;bottom:calc(100px + env(safe-area-inset-bottom,0px));z-index:90;width:min(94vw,340px);height:min(56vh,400px);display:none;flex-direction:column;box-sizing:border-box;border:3px solid #f6c66a;background-color:#14272d;background-image:repeating-conic-gradient(#1a3335 0 25%,#12262e 0 50%);background-size:4px 4px;box-shadow:0 3px 0 0 #040a0e,0 0 0 2px #040a0e,inset 0 0 0 2px #78613a;color:#f5edcf}'+
 '#ol-chat.show{display:flex}'+
 '#ol-chat .h{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:2px solid #78613a;font-size:20px!important;color:#f6c66a;text-shadow:1px 1px 0 #071116}'+
 '#ol-chat .h span{font-size:16px!important;color:#72e4b0;margin-left:6px;text-shadow:none}'+
 '#ol-chat .h button{width:auto;margin:0;min-height:0;height:auto;padding:0 8px;font-size:20px!important;line-height:1.1;cursor:pointer;color:#f5edcf;background:#3b4a4f;border:2px solid #040a0e;box-shadow:inset 0 -2px 0 #232e32}'+
 '#ol-msgs{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:5px 8px;font-size:18px!important;line-height:1.15;word-break:break-word}'+
 '#ol-msgs div{margin:0 0 3px;font-size:18px!important}'+
 '#ol-msgs .t{color:#78864f;font-size:14px!important;margin-right:4px}'+
 '#ol-msgs .n{color:#f6c66a;font-weight:700;font-size:18px!important}'+
 '#ol-msgs .me .n{color:#72e4b0}'+
 '#ol-msgs .sys{color:#b7bda9;text-align:center}'+
 '#ol-msgs .tx{color:#f5edcf;font-size:18px!important}'+
 '#ol-form{display:flex;gap:4px;padding:5px;border-top:2px solid #78613a}'+
 '#ol-in{flex:1;min-width:0;width:auto;margin:0;padding:4px 7px;font-size:18px!important;color:#f5edcf;background:#0b1a20;border:2px solid #78613a;outline:none;border-radius:0}'+
 '#ol-in:focus{border-color:#72e4b0}'+
 '#ol-in:disabled{opacity:.6}'+
 '#ol-send{width:auto;margin:0;padding:2px 10px;font-size:19px!important;cursor:pointer;color:#14272d;background:#72e4b0;border:2px solid #040a0e;box-shadow:inset 0 -3px 0 #397858;border-radius:0;min-height:0;height:auto}'+
 '#ol-send:disabled{opacity:.5}';
 document.head.appendChild(s)}

/* ---------- TOÀN MÀN HÌNH (chạy ngay, không cần đăng nhập) ---------- */
const de=document.documentElement;
const fsReq=de.requestFullscreen||de.webkitRequestFullscreen||de.msRequestFullscreen;
const fsEl=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
const fsExit=()=>(document.exitFullscreen||document.webkitExitFullscreen||function(){}).call(document);
let fsBtn=null,cntEl=null;
function buildTopBar(){
  const row=document.querySelector('.bagrow');if(!row||$('ol-top'))return;
  const box=document.createElement('div');box.id='ol-top';
  cntEl=document.createElement('span');cntEl.className='ol-pill';cntEl.id='ol-count';cntEl.title='Số người đang online';cntEl.textContent='🟢 …';
  fsBtn=document.createElement('button');fsBtn.type='button';fsBtn.className='ol-pill';fsBtn.id='ol-fs';fsBtn.title='Toàn màn hình';fsBtn.textContent='⛶';
  box.appendChild(cntEl);box.appendChild(fsBtn);row.parentNode.insertBefore(box,row);
  if(fsReq){   /* iPhone Safari không hỗ trợ toàn màn hình cho trang web -> ẩn nút (iPad/Android/PC vẫn có) */
    fsBtn.style.display='inline-block';
    fsBtn.onclick=()=>{
      try{
        if(fsEl())fsExit();
        else{const p=fsReq.call(de);if(p&&p.catch)p.catch(()=>{})}
      }catch(_){}};
    const sync=()=>{const on=!!fsEl();fsBtn.textContent=on?'🗗':'⛶';fsBtn.title=on?'Thoát toàn màn hình':'Toàn màn hình'};
    document.addEventListener('fullscreenchange',sync);document.addEventListener('webkitfullscreenchange',sync);
    document.addEventListener('keydown',e=>{if((e.key==='f'||e.key==='F')&&!/^(INPUT|TEXTAREA)$/.test((e.target||{}).tagName||'')&&!e.ctrlKey&&!e.metaKey&&!e.altKey)fsBtn.click()});
  }
}
buildTopBar();

/* ---------- ONLINE + CHAT ---------- */
let joinAt=Date.now(),db=null,me=null,started=false,hbT=0,cntT=0,unsubChat=null,lastSend=0,open=false,unread=0,firstSnap=true,online=null;
const TS=()=>firebase.firestore.Timestamp;
const SV=()=>firebase.firestore.FieldValue.serverTimestamp();

function setCount(n){online=n;if(cntEl)cntEl.textContent='🟢 '+n+' online';const h=$('ol-hc');if(h)h.textContent=n+' online'}

function heartbeat(){
  if(!db||!me||me.guest||document.hidden)return;   /* tab ẩn: khỏi ghi (tiết kiệm lượt ghi) */
  db.collection('presence').doc(me.uid).set({name:me.name,t:SV()}).catch(e=>console.warn('[online] hb',e))}
function countOnline(){
  if(!db||document.hidden)return;   /* tab đang ẩn thì khỏi đếm (tiết kiệm lượt đọc) */
  const cut=TS().fromMillis(Date.now()-ONLINE_MS);
  const q=db.collection('presence').where('t','>',cut);
  const viaGet=()=>q.get().then(sn=>({n:sn.size,mine:sn.docs.some(d=>d.id===(me&&me.uid))}));
  /* count() chỉ tính ~1 lượt đọc cho mỗi 1000 người online (thay vì 1 lượt/người); SDK cũ không có thì quay về get() */
  const p=(typeof q.count==='function')?q.count().get().then(s=>({n:s.data().count,mine:true})).catch(viaGet):viaGet();
  p.then(r=>{
    let n=r.n;
    if(me&&!me.guest&&!r.mine)n++;     /* chính mình luôn tính (nhịp tim vừa gửi có thể chưa kịp về) */
    setCount(Math.max(n,1))
  }).catch(e=>{console.warn('[online] count',e);if(cntEl)cntEl.textContent='🟢 ?'})}
function goOffline(){
  if(!db||!me||me.guest)return;
  try{db.collection('presence').doc(me.uid).delete()}catch(_){}}

function buildChat(){
  if($('ol-chat'))return;
  const fab=document.createElement('button');fab.type='button';fab.id='ol-fab';fab.title='Chat';fab.innerHTML='💬<b>0</b>';fab.style.display='block';
  const p=document.createElement('div');p.id='ol-chat';
  p.innerHTML='<div class="h"><div>💬 Chat chung<span id="ol-hc"></span></div><button type="button" id="ol-x" title="Đóng">✕</button></div>'+
    '<div id="ol-msgs"><div class="sys">Đang tải tin nhắn...</div></div>'+
    '<form id="ol-form" autocomplete="off"><input id="ol-in" type="text" maxlength="'+MAX_LEN+'" placeholder="Nhập tin nhắn..." autocomplete="off" enterkeyhint="send"><button type="submit" id="ol-send">Gửi</button></form>';
  document.body.appendChild(fab);document.body.appendChild(p);
  fab.onclick=()=>toggle();$('ol-x').onclick=()=>toggle(false);
  $('ol-form').onsubmit=e=>{e.preventDefault();send()};
  p.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')toggle(false)});   /* gõ chữ không kích hoạt phím tắt của game */
  p.addEventListener('keyup',e=>e.stopPropagation());
  if(!me||me.guest){const i=$('ol-in');i.disabled=true;i.placeholder='Đăng nhập để chat';$('ol-send').disabled=true}
  if(online!=null)setCount(online)}
function toggle(v){
  open=v===undefined?!open:v;
  $('ol-chat').classList.toggle('show',open);
  if(open){unread=0;badge();const m=$('ol-msgs');m.scrollTop=m.scrollHeight;
    if(me&&!me.guest)setTimeout(()=>{try{$('ol-in').focus()}catch(_){}},50)}}
function badge(){const f=$('ol-fab');if(!f)return;f.classList.toggle('has',unread>0);f.querySelector('b').textContent=unread>99?'99+':String(unread)}

function fmtT(ms){const d=new Date(ms);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}
function render(docs){
  const m=$('ol-msgs');if(!m)return;
  const near=m.scrollHeight-m.scrollTop-m.clientHeight<60;
  m.innerHTML='';
  if(!docs.length){m.innerHTML='<div class="sys">Chưa có tin nhắn mới. Hãy nói lời chào!</div>';return}
  docs.forEach(d=>{
    const x=d.data(),ts=x.t&&x.t.toMillis?x.t.toMillis():Date.now();
    const row=document.createElement('div');if(me&&x.uid===me.uid)row.className='me';
    row.innerHTML='<span class="t">'+fmtT(ts)+'</span><span class="n">'+esc(x.name||'Ẩn danh')+':</span> <span class="tx">'+esc(x.text||'')+'</span>';
    m.appendChild(row)});
  if(near||open&&firstSnap)m.scrollTop=m.scrollHeight}
function listenChat(){
  if(unsubChat)unsubChat();firstSnap=true;
  /* Chỉ nghe tin nhắn từ lúc vào game trở đi -> vào lại sẽ không thấy lịch sử cũ, và cũng không tốn lượt đọc tải 50 tin cũ */
  const since=TS().fromMillis(joinAt);
  unsubChat=db.collection('chat').where('t','>',since).orderBy('t','desc').limit(CHAT_LIMIT).onSnapshot(sn=>{
    const docs=sn.docs.slice().reverse();
    render(docs);
    if(!firstSnap&&!open){   /* tin mới của người khác khi đang đóng khung chat -> báo chấm đỏ */
      sn.docChanges().forEach(c=>{if(c.type==='added'&&!c.doc.metadata.hasPendingWrites&&(!me||c.doc.data().uid!==me.uid))unread++});badge()}
    firstSnap=false;
  },e=>{
    console.warn('[chat]',e);
    const m=$('ol-msgs');if(m)m.innerHTML='<div class="sys">'+(e&&e.code==='permission-denied'?'Chưa mở quyền chat trên máy chủ (xem FIRESTORE_RULES.txt).':'Không tải được chat (mất mạng?).')+'</div>'})}

function send(){
  if(!me||me.guest||!db)return;
  const i=$('ol-in');let text=i.value.replace(/\s+/g,' ').trim().slice(0,MAX_LEN);if(!text)return;
  const now=Date.now();
  if(now-lastSend<COOLDOWN_MS){flash('Gửi chậm lại một chút nhé...');return}
  lastSend=now;i.value='';
  db.collection('chat').add({uid:me.uid,name:me.name,text,t:SV()}).catch(e=>{
    console.warn('[chat] send',e);i.value=text;
    flash(e&&e.code==='permission-denied'?'Không gửi được (chưa mở quyền chat).':'Gửi lỗi, thử lại.')})}
function flash(t){
  const m=$('ol-msgs');if(!m)return;
  const d=document.createElement('div');d.className='sys';d.textContent=t;m.appendChild(d);m.scrollTop=m.scrollHeight;setTimeout(()=>d.remove(),2500)}

/* ---------- 19-save.js gọi hàm này khi người chơi vào game ---------- */
window.TTGNET={setName(n){if(me){me.name=String(n).slice(0,20);heartbeat()}},start(o){
  if(started||!o||!o.db)return;started=true;
  db=o.db;me={uid:o.uid,name:(o.name||'Người chơi').slice(0,20),guest:!!o.guest};
  buildTopBar();buildChat();
  heartbeat();countOnline();listenChat();
  hbT=setInterval(heartbeat,HB_MS);cntT=setInterval(countOnline,COUNT_MS);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){heartbeat();countOnline()}});
  window.addEventListener('pagehide',goOffline);
  window.addEventListener('beforeunload',goOffline)}};
})();
