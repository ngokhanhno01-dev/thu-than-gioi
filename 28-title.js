/* ===== 28-title.js — DANH HIỆU MÙA (đọc titles/{uid} trên Realtime Database) =====
   Danh hiệu do GitHub Actions ghi (người chơi chỉ đọc). Hiển thị:
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
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rdb(){try{return firebase.database()}catch(_){return null}}

function parse(val){
  const out=[];
  if(val&&typeof val==='object')for(const k of Object.keys(val)){
    const s=+k,t=+val[k];
    if(s>0&&t>=1&&t<=3)out.push({s,tier:t})}
  out.sort((a,b)=>b.s-a.s);return out}

function get(uid){
  if(!uid)return Promise.resolve([]);
  const c=cache[uid];
  if(c&&c.list&&Date.now()-c.t<TTL)return Promise.resolve(c.list);
  if(c&&c.p)return c.p;
  const r=rdb();if(!r)return Promise.resolve([]);
  const p=r.ref('titles/'+uid).once('value').then(sn=>{
    const list=parse(sn.val());cache[uid]={t:Date.now(),list,p:null};return list})
   .catch(e=>{cache[uid]={t:Date.now()-TTL+30000,list:[],p:null};return[]});   /* lỗi: thử lại sau 30 giây */
  cache[uid]=Object.assign(cache[uid]||{t:0,list:null},{p});
  return p}

function text(x){const C=CFG();return C&&x?C.titleText(x.tier,x.s):''}
function iconOf(x){const C=CFG();return(C&&x&&C.TITLE_ICONS[x.tier])||''}

/* biểu tượng của danh hiệu mới nhất, chỉ đọc từ bộ nhớ (không gọi mạng). '' nếu chưa biết/không có */
function icon(uid){const c=cache[uid];return(c&&c.list&&c.list.length)?iconOf(c.list[0]):''}
function prefetch(uid,cb){if(!uid)return;const c=cache[uid];if(c&&c.list&&Date.now()-c.t<TTL)return;get(uid).then(l=>{if(l.length&&cb)cb()})}

/* điền danh hiệu vào 1 phần tử (thẻ thú) */
function fill(uid,el){
  if(!el||!uid)return;
  get(uid).then(l=>{
    if(!el.isConnected||!l.length)return;
    const first=l[0],more=l.length-1;
    el.innerHTML='<div class="tt1">'+iconOf(first)+' <b>'+esc(text(first))+'</b></div>'+
      (more>0?'<div class="tt2">+ '+more+' danh hiệu các mùa trước</div>':'')})}

/* ---------- CSS ---------- */
{const s=document.createElement('style');
 s.textContent=
  '#cv-body .ti{text-align:center;margin:0 0 6px}'+
  '#cv-body .ti .tt1{font-size:17px!important;color:#ffd24a;text-shadow:1px 1px 0 #071116}'+
  '#cv-body .ti .tt2{font-size:13px!important;color:#b7bda9}'+
  '#ttg-pt{position:absolute;top:6px;left:0;right:0;z-index:4;text-align:center;pointer-events:none;font-size:12px;font-weight:800;color:#ffd24a;text-shadow:0 1px 3px #000,0 0 6px #000;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 8px}';
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
    get(u).then(l=>{el.textContent=l.length?(iconOf(l[0])+' '+text(l[0])):''})}}
setInterval(()=>{try{mountOwn()}catch(_){}},15000);
setTimeout(()=>{try{mountOwn()}catch(_){}},4000);

window.TTGTITLE={get,text,icon,prefetch,fill,refresh(uid){delete cache[uid||ownUid]}};
})();
