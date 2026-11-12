/* ===== 28-title.js — DANH HIỆU MÙA (titles/{uid}) + DANH HIỆU THỦ CÔNG do Admin gắn (adminTitles/{uid}) =====
   Danh hiệu mùa do GitHub Actions ghi (người chơi chỉ đọc). Danh hiệu thủ công chỉ Admin ghi được (xem Rules RTDB).
   Mỗi người giữ tối đa 1 danh hiệu thủ công; nếu có thì nó hiện TRƯỚC danh hiệu mùa. Hiển thị:
     - trong thẻ thú (23-view.js gọi TTGTITLE.fill)
     - cạnh tên trong khung chat (20-online.js gọi TTGTITLE.icon / TTGTITLE.prefetch)
     - trên đầu thú của chính mình ở màn chính (tự gắn vào .stage)
   Tiết kiệm: mỗi uid chỉ đọc 1 lần / 10 phút (dữ liệu rất nhỏ, Realtime Database không tính theo lượt đọc).
   Nạp SAU season-config.js. */
(()=>{
'use strict';
const TTL=10*60*1000;
const cache={};   /* uid -> {t, list:[{s,tier}] (mùa mới nhất trước), p:Promise|null} */
const CFG=()=>window.TTGCFG||null;
/* ---- Bảng danh hiệu thủ công (id phải trùng với danh sách trong Rules RTDB adminTitles) ----
   adminOnly: chỉ tài khoản admin thật mới giữ được (Rules kiểm tra root.admins). Xếp theo mức giàu tăng dần. */
const MANUAL=[
 {id:'admin',     name:'Quản Trị Viên', icon:'🛠️', col:'#ff5a6a', adminOnly:true},
 {id:'cochuttien',name:'Có Chút Tiền',  icon:'🪙', col:'#cdb98c'},
 {id:'giauco',    name:'Giàu Có',       icon:'💰', col:'#ffd24a'},
 {id:'sieugiau',  name:'Siêu Giàu',     icon:'💎', col:'#6fe3ff'},
 {id:'daigia',    name:'Đại Gia',       icon:'👑', col:'#ffb84a'},
 {id:'phunhidai', name:'Phú Nhị Đại',   icon:'🏆', col:'#c08aff'},
 {id:'typhu',     name:'Tỷ Phú',        icon:'🌟', col:'#ff7be0', glow:true}];
const MBY={};MANUAL.forEach(m=>MBY[m.id]=m);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rdb(){try{return firebase.database()}catch(_){return null}}

function parse(val){
  const out=[];
  if(val&&typeof val==='object')for(const k of Object.keys(val)){
    const s=+k,t=+val[k];
    if(s>0&&t>=1&&t<=3)out.push({s,tier:t})}
  out.sort((a,b)=>b.s-a.s);return out}

function parseManual(val){
  if(!val||typeof val!=='object')return null;
  const m=MBY[val.id];return m?{manual:true,id:m.id,name:m.name,icon:m.icon,col:m.col,glow:!!m.glow}:null}

function get(uid){
  if(!uid)return Promise.resolve([]);
  const c=cache[uid];
  if(c&&c.list&&Date.now()-c.t<TTL)return Promise.resolve(c.list);
  if(c&&c.p)return c.p;
  const r=rdb();if(!r)return Promise.resolve([]);
  const ERR={err:true};
  const p=Promise.all([
     r.ref('titles/'+uid).once('value').then(sn=>sn.val()).catch(()=>ERR),
     r.ref('adminTitles/'+uid).once('value').then(sn=>sn.val()).catch(()=>ERR)])
   .then(([sv,mv])=>{
    const list=parse(sv===ERR?null:sv),m=mv===ERR?null:parseManual(mv);
    if(m)list.unshift(m);                                  /* danh hiệu thủ công luôn đứng đầu */
    const bad=(sv===ERR||mv===ERR);                        /* lỗi đọc: thử lại sau 30 giây */
    cache[uid]={t:bad?Date.now()-TTL+30000:Date.now(),list,p:null};return list})
  cache[uid]=Object.assign(cache[uid]||{t:0,list:null},{p});
  return p}

function text(x){if(x&&x.manual)return x.name;const C=CFG();return C&&x?C.titleText(x.tier,x.s):''}
function iconOf(x){if(x&&x.manual)return x.icon;const C=CFG();return(C&&x&&C.TITLE_ICONS[x.tier])||''}
function styleOf(x){return x&&x.manual?'color:'+x.col+(x.glow?';text-shadow:0 0 6px '+x.col+',1px 1px 0 #071116':''):''}

/* biểu tượng của danh hiệu mới nhất, chỉ đọc từ bộ nhớ (không gọi mạng). '' nếu chưa biết/không có */
/* HTML đầy đủ "icon Tên" có màu của danh hiệu mới nhất (chỉ đọc cache, không gọi mạng). '' nếu chưa biết/không có.
   Dùng ở chat, đấu trường, màn chiến đấu. Gọi prefetch(uid,cb) trước để nạp. */
function tag(uid){
  const c=cache[uid];if(!(c&&c.list&&c.list.length))return'';
  const x=c.list[0],st=styleOf(x)||'color:#ffd24a';
  return'<span class="ttg-tag'+(x.manual&&x.id==='admin'?' adm':'')+'" style="'+st+'">'+iconOf(x)+' '+esc(text(x))+'</span>'}
function icon(uid){const c=cache[uid];return(c&&c.list&&c.list.length)?iconOf(c.list[0]):''}
function prefetch(uid,cb){if(!uid)return;const c=cache[uid];if(c&&c.list&&Date.now()-c.t<TTL)return;get(uid).then(l=>{if(l.length&&cb)cb()})}

/* điền danh hiệu vào 1 phần tử (thẻ thú) */
function fill(uid,el){
  if(!el||!uid)return;
  get(uid).then(l=>{
    if(!el.isConnected||!l.length)return;
    const first=l[0],more=l.length-1;
    el.innerHTML='<div class="tt1" style="'+styleOf(first)+'">'+iconOf(first)+' <b>'+esc(text(first))+'</b></div>'+
      (more>0?'<div class="tt2">+ '+more+(first.manual?' danh hiệu mùa':' danh hiệu các mùa trước')+'</div>':'')})}

/* ---------- CSS ---------- */
{const s=document.createElement('style');
 s.textContent=
  '#cv-body .ti{text-align:center;margin:0 0 6px}'+
  '#cv-body .ti .tt1{font-size:17px!important;color:#ffd24a;text-shadow:1px 1px 0 #071116}'+
  '#cv-body .ti .tt2{font-size:13px!important;color:#b7bda9}'+
  '#ttg-pt{position:absolute;top:30px;left:0;right:0;z-index:4;text-align:center;pointer-events:none;font-size:13px;font-weight:800;color:#ffd24a;text-shadow:0 1px 3px #000,0 0 6px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 8px}'+
  '.ttg-tag{font-weight:800;white-space:nowrap}'+
  '.ttg-tag.adm{text-shadow:0 0 5px currentColor}'+
  '#ttg-bt-p,#ttg-bt-m{position:absolute;bottom:4px;z-index:6;pointer-events:none;font-size:11px;font-weight:800;white-space:nowrap;max-width:46%;overflow:hidden;text-overflow:ellipsis;text-shadow:0 1px 2px #000,0 0 5px #000}'+
  '#ttg-bt-p{left:6px}#ttg-bt-m{right:6px;text-align:right}';
 document.head.appendChild(s)}

/* ---------- Danh hiệu của chính mình, trên đầu thú ---------- */
let ownUid='',ownT=0;
function myUid(){
  try{const u=firebase.auth().currentUser;if(u&&!u.isAnonymous)return u.uid}catch(_){}
  return ''}
function mountOwn(){
  const st=document.querySelector('.stage');if(!st)return;
  let el=document.getElementById('ttg-pt');
  if(!el){el=document.createElement('div');el.id='ttg-pt';st.appendChild(el)}
  const u=myUid();
  if(!u){el.textContent='';return}
  if(u!==ownUid||Date.now()-ownT>TTL){ownUid=u;ownT=Date.now();
    get(u).then(l=>{el.textContent=l.length?(iconOf(l[0])+' '+text(l[0])):'';el.style.color=l.length?(styleOf(l[0]).match(/^color:([^;]+)/)||[0,''])[1]:''})}}
setInterval(()=>{try{mountOwn()}catch(_){}},15000);
setTimeout(()=>{try{mountOwn()}catch(_){}},4000);

/* ---------- Màn chiến đấu (thám hiểm + đấu trường): danh hiệu dưới thanh máu mỗi bên ---------- */
function btEl(id){
  const o=document.getElementById('mob');if(!o)return null;
  let el=document.getElementById(id);
  if(!el){el=document.createElement('div');el.id=id;o.appendChild(el)}
  return el}
function btSet(id,uid){
  const el=btEl(id);if(!el)return;
  el.innerHTML='';if(!uid)return;
  get(uid).then(l=>{if(l.length&&el.isConnected)el.innerHTML=tag(uid)})}
function battleTitle(e){
  btSet('ttg-bt-p',myUid());                    /* bên mình */
  btSet('ttg-bt-m',e&&e.uid?e.uid:'')}          /* bên đối thủ (chỉ đấu trường truyền uid) */
if(typeof window.battleHudExtra==='function'){
  const _h=window.battleHudExtra;
  window.battleHudExtra=function(e){const r=_h.apply(this,arguments);try{battleTitle(e)}catch(_){}return r}}

/* ---------- Đấu trường: gắn danh hiệu vào tên trong bảng xếp hạng / danh sách đối thủ ---------- */
function decorate(root){
  if(!root)return;
  root.querySelectorAll('[data-uid]').forEach(el=>{
    const box=(el.classList.contains('slot')||el.classList.contains('tr'))?el:el.closest('.row');
    if(!box)return;const nm=box.querySelector('.nm');
    const uid=el.getAttribute('data-uid');
    if(!nm||!uid||nm.getAttribute('data-tt')===uid)return;
    nm.setAttribute('data-tt',uid);
    get(uid).then(l=>{
      if(!l.length||!nm.isConnected||nm.querySelector('.ttg-tag'))return;
      const t=document.createElement('span');t.innerHTML=tag(uid)+' ';
      if(box.classList.contains('slot')){t.style.display='block';t.style.fontSize='10px'}   /* bục top 3: danh hiệu nằm trên tên */
      nm.insertBefore(t,nm.firstChild)})})}
let arObs=null,arEl=null;
setInterval(()=>{
  const b=document.getElementById('ar-body');
  if(!b){arObs&&arObs.disconnect();arObs=null;arEl=null;return}
  if(b!==arEl){arObs&&arObs.disconnect();arEl=b;
    arObs=new MutationObserver(()=>{try{decorate(b)}catch(_){}});
    arObs.observe(b,{childList:true,subtree:true});try{decorate(b)}catch(_){}}},1000);

window.TTGTITLE={get,text,icon,tag,decorate,prefetch,fill,MANUAL,refresh(uid){delete cache[uid||ownUid];ownT=0}};
})();
