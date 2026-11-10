/* ===== 22-friends.js — KẾT BẠN QUA BIỆT DANH (bước 2 của chức năng Bạn bè) =====
   Nút "👥" nằm giữa hàng trên cùng (cạnh "🟢 N online"). Bấm mở khung Bạn bè:
     - Nhập biệt danh -> gửi lời mời. Nếu người đó ĐÃ mời bạn từ trước thì kết bạn luôn.
     - Lời mời nhận được: ✔ chấp nhận / ✖ từ chối.   Lời mời đã gửi: Hủy.   Danh sách bạn: ✖ hủy kết bạn.
   Dữ liệu trên Firestore:
     friendreqs/{từ_đến}   = {from, to, t}          lời mời đang chờ (chỉ 2 người liên quan đọc được)
     friendships/{a_b}     = {users:[a,b], t}       tình bạn (a<b theo thứ tự chữ cái, chỉ 2 người đọc được)
   Tên hiển thị lấy từ profiles/{uid} (công khai, không giả mạo được) nên đổi biệt danh là bạn bè thấy tên mới.
   Tiết kiệm quota: chỉ 1 listener cho lời mời nhận được (thường 0 tài liệu); danh sách bạn chỉ tải khi mở khung (cách nhau >= 20 giây).
   Bước 3 sẽ gắn nút "xem thẻ": gán window.TTGFRIENDS.onView=function(uid,nick){...} thì mỗi dòng bạn bè tự hiện nút 👁.
   Không sửa file cũ: bọc TTGNET.start của 20-online.js như 21-card.js. Nạp SAU 21-card.js, TRƯỚC 19-save.js. */
(()=>{
'use strict';
const MAX_FRIENDS=50;       /* tối đa số bạn của mỗi người (chặn ở máy) */
const ADD_COOLDOWN=1500;    /* giãn cách giữa 2 lần bấm "Mời" */
const REFRESH_MS=20000;     /* mở khung nhiều lần trong 20 giây thì không tải lại */

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* giống 19-save.js: bỏ dấu, bỏ cách, chữ thường */
const nickKey=n=>String(n).trim().replace(/\s+/g,' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]/g,'');
const pid=(a,b)=>a<b?a+'_'+b:b+'_'+a;
const SV=()=>firebase.firestore.FieldValue.serverTimestamp();

let db=null,me=null,started=false,open=false,lastAdd=0,lastRef=0,working=false;
let friends=[],outgoing=[],incoming=[];     /* mỗi phần tử là 1 uid */
const names={};                              /* uid -> biệt danh */

/* ---------- CSS ---------- */
{const s=document.createElement('style');
 s.textContent=
 '#fr-btn{position:relative}'+
 '#fr-btn b{display:none;position:absolute;top:-9px;right:-9px;min-width:18px;padding:0 4px;font-size:14px!important;line-height:18px;text-align:center;color:#fff;background:#e34e48;border:2px solid #040a0e}'+
 '#fr-btn.has b{display:block}'+
 '#fr-panel{position:fixed;left:50%;transform:translateX(-50%);top:calc(48px + env(safe-area-inset-top,0px));z-index:91;width:min(94vw,340px);max-height:min(72vh,480px);display:none;flex-direction:column;box-sizing:border-box;border:3px solid #f6c66a;background-color:#14272d;background-image:repeating-conic-gradient(#1a3335 0 25%,#12262e 0 50%);background-size:4px 4px;box-shadow:0 3px 0 0 #040a0e,0 0 0 2px #040a0e,inset 0 0 0 2px #78613a;color:#f5edcf}'+
 '#fr-panel.show{display:flex}'+
 '#fr-panel .h{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:2px solid #78613a;font-size:20px!important;color:#f6c66a;text-shadow:1px 1px 0 #071116}'+
 '#fr-panel .h span{font-size:16px!important;color:#72e4b0;margin-left:6px;text-shadow:none}'+
 '#fr-panel .h button{width:auto;margin:0 0 0 4px;min-height:0;height:auto;padding:0 8px;font-size:20px!important;line-height:1.1;cursor:pointer;color:#f5edcf;background:#3b4a4f;border:2px solid #040a0e;box-shadow:inset 0 -2px 0 #232e32;border-radius:0}'+
 '#fr-form{display:flex;gap:4px;padding:5px;border-bottom:2px solid #78613a}'+
 '#fr-in{flex:1;min-width:0;width:auto;margin:0;padding:4px 7px;font-size:18px!important;color:#f5edcf;background:#0b1a20;border:2px solid #78613a;outline:none;border-radius:0}'+
 '#fr-in:focus{border-color:#72e4b0}'+
 '#fr-add{width:auto;margin:0;padding:2px 10px;font-size:19px!important;cursor:pointer;color:#14272d;background:#72e4b0;border:2px solid #040a0e;box-shadow:inset 0 -3px 0 #397858;border-radius:0;min-height:0;height:auto}'+
 '#fr-add:disabled{opacity:.5}'+
 '#fr-msg{padding:2px 8px;font-size:16px!important;line-height:1.1;min-height:0;text-align:center;color:#ff9a8f}'+
 '#fr-msg.ok{color:#72e4b0}'+
 '#fr-msg:empty{display:none}'+
 '#fr-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 8px 6px;font-size:18px!important;line-height:1.15}'+
 '#fr-body .s{margin:6px 0 2px;font-size:16px!important;color:#f6c66a;border-bottom:1px solid #78613a}'+
 '#fr-body .e{color:#b7bda9;font-size:16px!important;text-align:center;margin:2px 0}'+
 '#fr-body .r{display:flex;justify-content:space-between;align-items:center;gap:6px;margin:0 0 3px;font-size:18px!important}'+
 '#fr-body .nm{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f5edcf;font-size:18px!important}'+
 '#fr-body .ac{display:flex;gap:4px;flex:none}'+
 '#fr-body .ac button{width:auto;margin:0;min-height:0;height:auto;padding:0 8px;font-size:17px!important;line-height:1.2;cursor:pointer;color:#f5edcf;background:#3b4a4f;border:2px solid #040a0e;box-shadow:inset 0 -2px 0 #232e32;border-radius:0}'+
 '#fr-body .ac button.y{color:#14272d;background:#72e4b0;box-shadow:inset 0 -2px 0 #397858}'+
 '#fr-body .ac button.n{background:#a72f42;box-shadow:inset 0 -2px 0 #6e1d2b}';
 document.head.appendChild(s)}

/* ---------- Giao diện ---------- */
function buildUI(){
  if($('fr-panel'))return;
  const box=$('ol-top');
  if(box){
    const b=document.createElement('button');b.type='button';b.className='ol-pill';b.id='fr-btn';b.title='Bạn bè';b.innerHTML='👥<b></b>';
    const fs=$('ol-fs');box.insertBefore(b,fs&&fs.parentNode===box?fs:null);
    b.onclick=()=>toggle();
  }
  const p=document.createElement('div');p.id='fr-panel';
  p.innerHTML='<div class="h"><div>👥 Bạn bè<span id="fr-cnt"></span></div><div><button type="button" id="fr-rf" title="Tải lại">⟳</button><button type="button" id="fr-x" title="Đóng">✕</button></div></div>'+
    '<form id="fr-form" autocomplete="off"><input id="fr-in" type="text" maxlength="24" placeholder="Biệt danh bạn muốn mời..." autocomplete="off" enterkeyhint="send"><button type="submit" id="fr-add">Mời</button></form>'+
    '<div id="fr-msg"></div><div id="fr-body"><div class="e">Đang tải...</div></div>';
  document.body.appendChild(p);
  $('fr-x').onclick=()=>toggle(false);
  $('fr-rf').onclick=()=>{for(const k in names)delete names[k];refresh(true)};
  $('fr-form').onsubmit=e=>{e.preventDefault();addByNick($('fr-in').value)};
  $('fr-body').addEventListener('click',onBodyClick);
  p.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')toggle(false)});   /* gõ chữ không kích hoạt phím tắt của game */
  p.addEventListener('keyup',e=>e.stopPropagation());
}
function toggle(v){
  open=v===undefined?!open:v;
  const p=$('fr-panel');if(!p)return;
  p.classList.toggle('show',open);
  if(open){
    const c=$('ol-chat');if(c)c.classList.remove('show');   /* tránh 2 khung chồng nhau */
    setMsg('');render();refresh(false);
    setTimeout(()=>{try{$('fr-in').focus()}catch(_){}},50)}}
function setMsg(t,ok){const m=$('fr-msg');if(!m)return;m.textContent=t||'';m.className=ok?'ok':''}
function badge(){const b=$('fr-btn');if(!b)return;b.classList.toggle('has',incoming.length>0);b.querySelector('b').textContent=incoming.length>99?'99+':String(incoming.length)}
const nm=u=>esc(names[u]||'...');

function render(){
  const body=$('fr-body');if(!body)return;
  const c=$('fr-cnt');if(c)c.textContent=friends.length+'/'+MAX_FRIENDS;
  let h='';
  if(incoming.length){
    h+='<div class="s">📨 Lời mời nhận được ('+incoming.length+')</div>';
    incoming.forEach(u=>{h+='<div class="r"><span class="nm">'+nm(u)+'</span><span class="ac"><button type="button" class="y" data-a="acc" data-u="'+esc(u)+'" title="Chấp nhận">✔</button><button type="button" class="n" data-a="dec" data-u="'+esc(u)+'" title="Từ chối">✖</button></span></div>'})}
  if(outgoing.length){
    h+='<div class="s">📤 Đã gửi, chờ trả lời ('+outgoing.length+')</div>';
    outgoing.forEach(u=>{h+='<div class="r"><span class="nm">'+nm(u)+'</span><span class="ac"><button type="button" data-a="can" data-u="'+esc(u)+'">Hủy</button></span></div>'})}
  h+='<div class="s">🤝 Bạn bè ('+friends.length+')</div>';
  if(!friends.length)h+='<div class="e">Chưa có bạn. Nhập biệt danh ở trên để mời nhé!</div>';
  const view=window.TTGFRIENDS&&typeof window.TTGFRIENDS.onView==='function';
  friends.slice().sort((a,b)=>String(names[a]||'').localeCompare(String(names[b]||''),'vi')).forEach(u=>{
    h+='<div class="r"><span class="nm">'+nm(u)+'</span><span class="ac">'+(view?'<button type="button" data-a="view" data-u="'+esc(u)+'" title="Xem thẻ">👁</button>':'')+'<button type="button" class="n" data-a="del" data-u="'+esc(u)+'" title="Hủy kết bạn">✖</button></span></div>'});
  body.innerHTML=h}

function onBodyClick(e){
  const b=e.target.closest('button[data-a]');if(!b)return;
  const a=b.dataset.a,u=b.dataset.u;
  if(a==='acc')accept(u);
  else if(a==='dec')decline(u);
  else if(a==='can')cancel(u);
  else if(a==='del')unfriend(u);
  else if(a==='view'){try{window.TTGFRIENDS.onView(u,names[u]||'')}catch(err){console.warn('[friends] onView',err)}}}

/* ---------- Dữ liệu ---------- */
async function loadNames(uids){
  const need=[...new Set(uids)].filter(u=>u&&names[u]===undefined);
  for(let i=0;i<need.length;i+=10){
    const ch=need.slice(i,i+10);
    try{
      const sn=await db.collection('profiles').where(firebase.firestore.FieldPath.documentId(),'in',ch).get();
      sn.forEach(d=>{names[d.id]=String(d.data().nick||'Ẩn danh')})
    }catch(e){console.warn('[friends] tải tên lỗi',e)}
    ch.forEach(u=>{if(names[u]===undefined)names[u]='Ẩn danh'})}}

async function refresh(force){
  if(!db||!me)return;
  if(!force&&Date.now()-lastRef<REFRESH_MS){loadNames([...friends,...outgoing,...incoming]).then(render);return}
  try{
    const [f,o]=await Promise.all([
      db.collection('friendships').where('users','array-contains',me.uid).limit(MAX_FRIENDS+20).get(),
      db.collection('friendreqs').where('from','==',me.uid).limit(50).get()]);
    friends=f.docs.map(d=>((d.data().users||[]).find(x=>x!==me.uid))).filter(Boolean);
    outgoing=o.docs.map(d=>d.data().to).filter(Boolean);
    lastRef=Date.now();
    await loadNames([...friends,...outgoing,...incoming]);
    render();
  }catch(e){
    console.warn('[friends] tải lỗi',e);
    setMsg(e&&e.code==='permission-denied'?'Chưa mở quyền Bạn bè trên máy chủ (dán luật friendreqs + friendships).':'Không tải được danh sách (mất mạng?).')}}

function listenIncoming(){
  db.collection('friendreqs').where('to','==',me.uid).limit(30).onSnapshot(sn=>{
    incoming=sn.docs.map(d=>d.data().from).filter(Boolean);
    badge();
    if(open)loadNames(incoming).then(render)
  },e=>console.warn('[friends] nghe lời mời lỗi (đã dán luật chưa?)',e))}

const errText=e=>e&&e.code==='permission-denied'?'Không được phép (đã là bạn, lời mời đã hết hạn, hoặc chưa dán luật).':'Lỗi mạng, thử lại nhé.';

async function addByNick(raw){
  if(!db||!me||working)return;
  const key=nickKey(raw);
  if(key.length<3){setMsg('Biệt danh gồm chữ và số, tối thiểu 3 ký tự.');return}
  const now=Date.now();if(now-lastAdd<ADD_COOLDOWN){setMsg('Chậm lại một chút nhé...');return}
  lastAdd=now;working=true;$('fr-add').disabled=true;setMsg('');
  try{
    const ns=await db.collection('nicks').doc(key).get();
    if(!ns.exists){setMsg('Không tìm thấy người chơi này.');return}
    const u=String(ns.data().uid||''),nick=String(ns.data().nick||raw);
    names[u]=nick;
    if(!u||u===me.uid){setMsg('Đây là biệt danh của chính bạn mà 🙂');return}
    if(friends.includes(u)){setMsg(nick+' đã là bạn của bạn rồi.');return}
    if(outgoing.includes(u)){setMsg('Bạn đã gửi lời mời cho '+nick+' rồi.');return}
    if(friends.length>=MAX_FRIENDS){setMsg('Danh sách bạn đã đầy ('+MAX_FRIENDS+').');return}
    if(incoming.includes(u)){working=false;await accept(u,true);return}   /* họ đã mời mình -> kết bạn luôn */
    await db.collection('friendreqs').doc(me.uid+'_'+u).set({from:me.uid,to:u,t:SV()});
    outgoing.push(u);$('fr-in').value='';
    setMsg('Đã gửi lời mời tới '+nick+'.',true);render();
  }catch(e){console.warn('[friends] mời lỗi',e);setMsg(errText(e))}
  finally{working=false;const a=$('fr-add');if(a)a.disabled=false}}

async function accept(u,auto){
  if(!db||!me||working)return;
  if(friends.length>=MAX_FRIENDS){setMsg('Danh sách bạn đã đầy ('+MAX_FRIENDS+').');return}
  working=true;
  try{
    const b=db.batch(),users=[me.uid,u].sort();
    b.set(db.collection('friendships').doc(pid(me.uid,u)),{users,t:SV()});
    b.delete(db.collection('friendreqs').doc(u+'_'+me.uid));                       /* lời mời của họ */
    if(outgoing.includes(u))b.delete(db.collection('friendreqs').doc(me.uid+'_'+u));  /* nếu mình cũng lỡ mời họ */
    await b.commit();
    if(!friends.includes(u))friends.push(u);
    incoming=incoming.filter(x=>x!==u);outgoing=outgoing.filter(x=>x!==u);
    badge();setMsg((auto?'Họ đã mời bạn từ trước nên kết bạn luôn! ':'Đã kết bạn với ')+(names[u]||'')+(auto?'':'.'),true);
    if(auto&&$('fr-in'))$('fr-in').value='';
    render();
  }catch(e){console.warn('[friends] chấp nhận lỗi',e);setMsg(errText(e))}
  finally{working=false}}

async function removeDoc(ref,after,okMsg){
  if(!db||!me||working)return;working=true;
  try{await ref.delete();after();badge();setMsg(okMsg,true);render()}
  catch(e){console.warn('[friends] xóa lỗi',e);setMsg(errText(e))}
  finally{working=false}}
function decline(u){removeDoc(db.collection('friendreqs').doc(u+'_'+me.uid),()=>{incoming=incoming.filter(x=>x!==u)},'Đã từ chối lời mời.')}
function cancel(u){removeDoc(db.collection('friendreqs').doc(me.uid+'_'+u),()=>{outgoing=outgoing.filter(x=>x!==u)},'Đã hủy lời mời.')}
function unfriend(u){
  if(!confirm('Hủy kết bạn với '+(names[u]||'người này')+'?'))return;
  removeDoc(db.collection('friendships').doc(pid(me.uid,u)),()=>{friends=friends.filter(x=>x!==u)},'Đã hủy kết bạn.')}

/* ---------- Khởi động ---------- */
function startFriends(o){
  if(!o||!o.db||o.guest||started)return;
  started=true;db=o.db;me={uid:o.uid,name:o.name||''};
  buildUI();listenIncoming()}

window.TTGFRIENDS={
  list:()=>friends.map(u=>({uid:u,nick:names[u]||''})),
  open:()=>toggle(true),
  onView:null          /* bước 3 gán hàm xem thẻ vào đây */
};

/* Bọc TTGNET (20-online.js) để không phải sửa 19-save.js */
const N=window.TTGNET;
if(N){
  const st=N.start;
  N.start=function(o){const r=st.apply(this,arguments);try{startFriends(o)}catch(e){console.warn('[friends]',e)}return r};
}
})();
