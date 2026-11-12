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
 {id:'admin', name:'Quản Trị Viên',      icon:'🛠️', col:'#ff5a6a', adminOnly:true, img:'img-title-admin.webp'},
 {id:'vip1',  name:'Tinh Anh Kỵ Sĩ',     icon:'🛡️', col:'#8fc4ee', img:'img-title-vip1.webp'},
 {id:'vip2',  name:'Ngự Thú Nam Tước',   icon:'🐺', col:'#6fd08a', img:'img-title-vip2.webp'},
 {id:'vip3',  name:'Linh Thú Bá Tước',   icon:'🦌', col:'#7fb4ff', img:'img-title-vip3.webp'},
 {id:'vip4',  name:'Thánh Thú Hầu Tước', icon:'🦄', col:'#c08aff', img:'img-title-vip4.webp'},
 {id:'vip5',  name:'Long Thần Công Tước',icon:'🐲', col:'#ff8a4a', img:'img-title-vip5.webp'},
 {id:'vip6',  name:'Vạn Thú Quân Vương', icon:'👑', col:'#ffd24a', img:'img-title-vip6.webp'},
 {id:'vip7',  name:'Thần Thú Đế Tôn',    icon:'🌟', col:'#ff7be0', glow:true, img:'img-title-vip7.webp'}];
/* Ảnh danh hiệu mùa: img-title-top{hạng}-s{mùa}.webp. Làm xong ảnh mùa nào thì thêm số mùa đó vào đây (mùa chưa có ảnh dùng icon + chữ). */
const TOPIMG={1:1};
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
  const m=MBY[val.id];return m?{manual:true,id:m.id,name:m.name,icon:m.icon,col:m.col,glow:!!m.glow,img:m.img}:null}

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

function imgOf(x){if(!x)return'';if(x.manual)return x.img||'';return(TOPIMG[x.s]&&x.tier>=1&&x.tier<=3)?'img-title-top'+x.tier+'-s'+x.s+'.webp':''}
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
  '#ttg-pt{position:absolute;left:0;top:0;z-index:4;pointer-events:none;display:none;width:150px;line-height:0;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}'+
  '#ttg-pt img{width:150px;height:auto;display:block}'+
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
let ownImg='';
function mountOwn(){
  const st=document.querySelector('.stage');if(!st)return;
  let el=document.getElementById('ttg-pt');
  if(!el){el=document.createElement('div');el.id='ttg-pt';st.appendChild(el)}
  const u=myUid();
  if(!u){ownImg='';el.innerHTML='';return}
  if(u!==ownUid||Date.now()-ownT>TTL){ownUid=u;ownT=Date.now();
    get(u).then(l=>{
      const src=l.length?imgOf(l[0]):'';
      if(src!==ownImg){ownImg=src;el.innerHTML=src?'<img src="'+src+'" alt="" onerror="this.parentNode.innerHTML=\'\';">':''}})}}
/* Đặt danh hiệu ngay trên đầu thú (03-game-core.js ghi window.__petHead mỗi khung vẽ). Canvas 360x250, object-fit:cover, object-position center 55% */
function placeOwn(){
  const el=document.getElementById('ttg-pt'),st=document.querySelector('.stage'),H=window.__petHead;
  if(!el||!st)return;
  const mob=document.getElementById('mob');
  if(!ownImg||!H||Date.now()-H.t>800||(mob&&mob.style.display!=='none')){el.style.display='none';return}
  const w=st.clientWidth,h=st.clientHeight,k=Math.max(w/360,h/250);
  const x=(w-360*k)*.5+H.x*k,y=(h-250*k)*.55+H.top*k;
  /* Tỉ lệ cao/rộng của ảnh (mỗi danh hiệu một khổ). Thú càng lớn thì đầu càng sát mép trên: nếu ảnh không đủ chỗ
     thì THU NHỎ cho vừa (tối thiểu 80px) thay vì bị kẹt cứng ở mép trên và đứng yên khi thú chuyển động. */
  const im=el.firstChild,ar=(im&&im.naturalWidth)?im.naturalHeight/im.naturalWidth:.5;
  let tw=Math.min(150,w*.42);
  const room=y+4-2-10;                            /* chừa 10px dư để danh hiệu còn chỗ nhúc nhích theo nhịp thở của thú */                               /* chỗ trống từ mép trên khung tới đầu thú */
  if(tw*ar>room)tw=Math.max(80,Math.floor(room/ar/12)*12);   /* làm tròn theo nấc 12px: kích thước đứng yên trong nấc nên danh hiệu vẫn nhúc nhích theo thú */
  const th=tw*ar;
  el.style.width=tw+'px';if(im)im.style.width=tw+'px';
  el.style.display='block';el.style.left=Math.round(x-tw/2)+'px';el.style.top=Math.max(2,Math.round(y-th+4))+'px'}
setInterval(()=>{try{mountOwn()}catch(_){}},15000);
setTimeout(()=>{try{mountOwn()}catch(_){}},4000);
(function loop(){try{placeOwn()}catch(_){}requestAnimationFrame(loop)})();   /* mỗi khung hình, để danh hiệu chuyển động mượt cùng thú */

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

window.TTGTITLE={imgOf,get,text,icon,tag,decorate,prefetch,fill,MANUAL,refresh(uid){delete cache[uid||ownUid];ownT=0}};
})();
