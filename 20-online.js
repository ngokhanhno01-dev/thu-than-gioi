
/* ===== 20-online.js — CHAT · SỐ NGƯỜI ONLINE · TOÀN MÀN HÌNH (dùng Firebase REALTIME DATABASE) =====
   - Nút "⛶" (góc trái hàng nút trên cùng): bật/tắt toàn màn hình.
   - "🟢 N online": mỗi người đã đăng nhập có 1 mục presence/{uid} = {name,t}. Mục này TỰ BỊ XÓA khi người đó đóng game / mất mạng
     (onDisconnect) nên KHÔNG cần gửi nhịp tim, và Realtime Database không tính từng lượt đọc/ghi như Firestore.
   - Giới hạn MAX_ONLINE người cùng lúc: người vào sau thấy màn hình "Server đầy" và game tự thử lại; lúc đó game ngừng ghi lên Firestore.
   - Nút "💬" góc phải dưới: chat chung, lưu ở chat/{uid} = {name,text,t} (chỉ giữ tin mới nhất của mỗi người nên không phình dữ liệu). Mỗi người chỉ gửi được 1 tin mỗi COOLDOWN_MS (luật máy chủ cũng chặn).
   - Chỉ hiện tin từ lúc người chơi vào game. Khung chat đóng mà có tin mới -> số đỏ trên nút 💬.
   - Khách (chưa đăng nhập) xem được số online + đọc chat nhưng không gửi được và không chiếm chỗ.
   - lastSeen/{uid}: lần cuối hoạt động, để thẻ thú hiện "Offline (hoạt động X phút trước)".
   Móc vào game qua 19-save.js: sau khi vào game, 19-save gọi TTGNET.start({db,uid,name,guest}). File này phải được nạp TRƯỚC 19-save.js.
   Luật cần dán: file RTDB_RULES.json (Firebase Console -> Realtime Database -> Rules). */
(()=>{
'use strict';
const MAX_ONLINE=50;          /* tối đa bao nhiêu người đăng nhập cùng lúc */
const RETRY_MS=20000;         /* khi server đầy: tự thử vào lại mỗi 20 giây */
const CHAT_LIMIT=50;          /* hiện tối đa bao nhiêu tin gần nhất */
const MAX_LEN=200;            /* tối đa ký tự mỗi tin */
const COOLDOWN_MS=10000;      /* giãn cách giữa 2 tin: 10 giây */

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
 '#ol-send:disabled{opacity:.5}'+
 '#ol-full{position:fixed;left:0;top:0;right:0;bottom:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(5,12,16,.95)}'+
 '#ol-full .bx{width:min(88vw,340px);padding:16px;text-align:center;border:3px solid #f6c66a;background:#14272d;box-shadow:0 3px 0 0 #040a0e}'+
 '#ol-full .t{font-size:24px!important;color:#f6c66a;margin-bottom:8px}'+
 '#ol-full .s{font-size:18px!important;color:#f5edcf;line-height:1.25;margin-bottom:12px}'+
 '#ol-full button{width:auto;margin:0;padding:3px 14px;font-size:19px!important;cursor:pointer;color:#14272d;background:#72e4b0;border:2px solid #040a0e;box-shadow:inset 0 -3px 0 #397858;border-radius:0;min-height:0;height:auto}';
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
let joinAt=Date.now(),db=null,rdb=null,me=null,started=false,unsubChat=null,lastSend=0,open=false,unread=0,firstSnap=true,online=null;
let joined=false,full=false,joining=false,retryT=0,offset=0,presRef=null,lastRef=null,list=[],rT=0;
const ONL=new Set();                                   /* uid những người đang online */
const SVR=()=>firebase.database.ServerValue.TIMESTAMP;

function setCount(n){online=n;if(cntEl)cntEl.textContent='🟢 '+n+' online';const h=$('ol-hc');if(h)h.textContent=n+' online'}

/* ---- số người online: nghe thêm/bớt trong presence (chỉ nhận phần thay đổi, rất nhẹ) ---- */
function watchPresence(){
  const r=rdb.ref('presence');
  r.on('child_added',s=>{ONL.add(s.key);setCount(ONL.size)},e=>{console.warn('[online] watch',e);if(cntEl)cntEl.textContent='🟢 ?'});
  r.on('child_removed',s=>{ONL.delete(s.key);setCount(ONL.size)});
  r.once('value',()=>setCount(ONL.size),()=>{})}

/* ---- chiếm chỗ (presence) + tự nhả khi đóng game / mất mạng ---- */
function claim(){
  presRef=rdb.ref('presence/'+me.uid);lastRef=rdb.ref('lastSeen/'+me.uid);
  return Promise.all([presRef.onDisconnect().remove(),lastRef.onDisconnect().set(SVR())])
    .then(()=>presRef.set({name:me.name,t:SVR()}))
    .then(()=>{joined=true;return true})
    .catch(e=>{console.warn('[online] claim (đã dán luật RTDB chưa?)',e);return false})}
function joinCheck(){
  if(joining||!rdb||!me||me.guest)return;joining=true;
  rdb.ref('presence').once('value').then(sn=>{
    if(!sn.hasChild(me.uid)&&sn.numChildren()>=MAX_ONLINE){setFull(true,sn.numChildren());return}
    setFull(false);return claim()
  }).catch(e=>{console.warn('[online] join',e);setFull(false)}).then(()=>{joining=false})}
function setFull(v,n){
  full=v;let o=$('ol-full');
  if(v){
    if(!o){o=document.createElement('div');o.id='ol-full';
      o.innerHTML='<div class="bx"><div class="t">🚫 Server đang đầy</div><div class="s" id="ol-full-s"></div><button type="button" id="ol-full-b">Thử lại ngay</button></div>';
      document.body.appendChild(o);$('ol-full-b').onclick=()=>joinCheck()}
    $('ol-full-s').textContent='Đã có '+n+'/'+MAX_ONLINE+' người chơi. Game tự thử lại mỗi '+(RETRY_MS/1000)+' giây, bạn cứ để màn hình này mở. Tiến trình của bạn vẫn an toàn trên máy.';
    o.style.display='flex';clearTimeout(retryT);retryT=setTimeout(joinCheck,RETRY_MS)
  }else{if(o)o.style.display='none';clearTimeout(retryT)}}

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

const tOf=x=>(+x.t)||(Date.now()+offset);
function render(items){
  const m=$('ol-msgs');if(!m)return;
  const near=m.scrollHeight-m.scrollTop-m.clientHeight<60;
  m.innerHTML='';
  if(!items.length){m.innerHTML='<div class="sys">Chưa có tin nhắn mới. Hãy nói lời chào!</div>';return}
  items.forEach(it=>{
    const x=it.x,ts=tOf(x)-offset;
    const row=document.createElement('div');if(me&&x.uid===me.uid)row.className='me';
    row.innerHTML='<span class="t">'+fmtT(ts)+'</span><span class="n">'+esc(x.name||'Ẩn danh')+':</span> <span class="tx">'+esc(x.text||'')+'</span>';
    m.appendChild(row)});
  if(near||open&&firstSnap)m.scrollTop=m.scrollHeight}
function schedRender(){if(rT)return;rT=setTimeout(()=>{rT=0;list.sort((a,b)=>tOf(a.x)-tOf(b.x));if(list.length>CHAT_LIMIT)list=list.slice(-CHAT_LIMIT);render(list)},40)}
function listenChat(){
  if(unsubChat)unsubChat();firstSnap=true;list=[];
  /* chat/{uid} = tin MỚI NHẤT của người đó (ghi đè tin cũ) -> luật máy chủ so với giờ của chính tin trước để chặn gửi dồn.
     Máy này tự giữ danh sách các tin nhận được. Chỉ lấy tin từ lúc vào game trở đi (giờ máy chủ). */
  const q=rdb.ref('chat').orderByChild('t').startAt(joinAt+offset).limitToLast(CHAT_LIMIT);
  const put=s=>{const v=s.val()||{};
    const x={uid:s.key,name:v.name,text:v.text,t:v.t};
    /* cùng 1 người, cách nhau <3 giây = cùng 1 tin (giờ ước tính -> giờ máy chủ thật) */
    list=list.filter(i=>!(i.x.uid===x.uid&&Math.abs(tOf(i.x)-tOf(x))<3000));
    list.push({x});schedRender();return x};
  const onNew=s=>{const x=put(s);
    if(!firstSnap&&!open&&(!me||x.uid!==me.uid)){unread++;badge()}};
  const onErr=e=>{
    console.warn('[chat]',e);
    const m=$('ol-msgs');if(m)m.innerHTML='<div class="sys">'+(e&&String(e.code||e.message).toLowerCase().indexOf('permission')>=0?'Chưa mở quyền chat trên máy chủ (dán RTDB_RULES.json).':'Không tải được chat (mất mạng?).')+'</div>'};
  q.on('child_added',onNew,onErr);
  q.on('child_changed',onNew,()=>{});
  q.once('value',()=>{firstSnap=false;schedRender()},()=>{});
  unsubChat=()=>{try{q.off()}catch(_){}}}

function send(){
  if(!me||me.guest||!rdb||full)return;
  const i=$('ol-in');let text=i.value.replace(/\s+/g,' ').trim().slice(0,MAX_LEN);if(!text)return;
  const now=Date.now(),wait=COOLDOWN_MS-(now-lastSend);
  if(wait>0){flash('Chờ '+Math.ceil(wait/1000)+' giây nữa mới gửi được nhé...');return}
  lastSend=now;i.value='';
  rdb.ref('chat/'+me.uid).set({name:me.name,text,t:SVR()}).catch(e=>{
    console.warn('[chat] send',e);i.value=text;lastSend=Date.now();
    flash(e&&String(e.code||e.message).toLowerCase().indexOf('permission')>=0?'Không gửi được (gửi quá nhanh hoặc chưa dán luật chat).':'Gửi lỗi, thử lại.')})}
function flash(t){
  const m=$('ol-msgs');if(!m)return;
  const d=document.createElement('div');d.className='sys';d.textContent=t;m.appendChild(d);m.scrollTop=m.scrollHeight;setTimeout(()=>d.remove(),2500)}


/* ---------- 19-save.js gọi hàm này khi người chơi vào game ---------- */
window.TTGNET={
  blocked(){return full},                 /* true = server đầy: 19-save.js / 21-card.js ngừng ghi lên Firestore */
  offset(){return offset},                /* chênh lệch giờ máy chủ - giờ máy (ms) */
  setName(n){if(me){me.name=String(n).slice(0,20);if(joined&&presRef)presRef.set({name:me.name,t:SVR()}).catch(()=>{})}},
  start(o){
    if(started||!o||!o.db)return;started=true;
    db=o.db;me={uid:o.uid,name:(o.name||'Người chơi').slice(0,20),guest:!!o.guest};joinAt=Date.now();
    buildTopBar();buildChat();
    try{rdb=firebase.database()}catch(e){console.warn('[online] thiếu thư viện firebase-database hoặc thiếu databaseURL',e);if(cntEl)cntEl.textContent='🟢 ?';return}
    watchPresence();
    rdb.ref('.info/serverTimeOffset').once('value').then(s=>{offset=+s.val()||0}).catch(()=>{}).then(listenChat);
    if(!me.guest){
      rdb.ref('.info/connected').on('value',s=>{if(s.val()===true)joinCheck()});   /* kết nối (lại) -> vào chỗ */
      window.addEventListener('pagehide',()=>{try{rdb.goOffline()}catch(_){}});   /* đóng trang -> nhả chỗ ngay */
      window.addEventListener('pageshow',()=>{try{rdb.goOnline()}catch(_){}})}}};
})();
