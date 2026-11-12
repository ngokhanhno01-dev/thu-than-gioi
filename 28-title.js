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
 {id:'vip7',  name:'Thần Thú Đế Tôn',    icon:'🌟', col:'#ff7be0', glow:true, img:'img-title-vip7.webp'},
 /* Danh hiệu Top mùa 1 gắn tay để TEST (ảnh có sẵn chữ "Mùa 1"). Id phải có trong Rules RTDB adminTitles. */
 {id:'top1',  name:'Chí Tôn Đấu Trường · Mùa 1', icon:'👑', col:'#ffd24a', glow:true, img:'img-title-top1-s1.webp'},
 {id:'top2',  name:'Cao Thủ Đấu Trường · Mùa 1', icon:'🥈', col:'#e0a060', img:'img-title-top2-s1.webp'},
 {id:'top3',  name:'Vô Địch Đấu Trường · Mùa 1', icon:'🥉', col:'#9fc7ff', img:'img-title-top3-s1.webp'}];
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
/* Huy hiệu cho khung chat: CHỈ ảnh danh hiệu + hạt lấp lánh (không icon, không chữ). '' nếu chưa có ảnh / chưa nạp xong. */
function chatBadge(uid,cls,rm){
  const c=cache[uid];if(!(c&&c.list&&c.list.length))return'';
  const x=c.list[0],src=imgOf(x);if(!src)return'';
  return'<span class="'+(cls||'ttg-cb')+'" title="'+esc(text(x))+'"><img src="'+src+'" alt="" onerror="'+(rm||'this.parentNode.remove()')+'"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>'}
function icon(uid){const c=cache[uid];return(c&&c.list&&c.list.length)?iconOf(c.list[0]):''}
function prefetch(uid,cb){if(!uid)return;const c=cache[uid];if(c&&c.list&&Date.now()-c.t<TTL)return;get(uid).then(l=>{if(l.length&&cb)cb()})}

/* điền danh hiệu vào 1 phần tử (thẻ thú) */
function fill(uid,el){
  if(!el||!uid)return;
  get(uid).then(l=>{
    if(!el.isConnected||!l.length)return;
    const first=l[0],more=l.length-1;
    const bn=imgOf(first)?chatBadge(uid,'ttg-hb',"this.parentNode.outerHTML=''"):'';   /* có ảnh -> ảnh treo vắt viền trên khung ảnh thú + hạt lấp lánh; chưa có ảnh -> giữ chữ cũ */
    el.classList.toggle('hb',!!bn);
    const more_html=(more>0?'<div class="tt2">+ '+more+(first.manual?' danh hiệu mùa':' danh hiệu các mùa trước')+'</div>':'');
    el.innerHTML=(bn?bn:'<div class="tt1" style="'+styleOf(first)+'">'+iconOf(first)+' <b>'+esc(text(first))+'</b></div>')+more_html})}

/* ---------- CSS ---------- */
{const s=document.createElement('style');
 s.textContent=
  '#cv-body .ti{text-align:center;margin:0 0 6px}'+
  '#cv-body .ti .tt1{font-size:17px!important;color:#ffd24a;text-shadow:1px 1px 0 #071116}'+
  '#cv-body .ti .tt2{font-size:13px!important;color:#b7bda9}'+
  '#ttg-pt{position:absolute;left:0;top:0;z-index:4;pointer-events:none;display:none;width:150px;line-height:0;filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}'+
  '#ttg-pt img{width:150px;height:auto;display:block}'+
  '.ttg-tag{font-weight:800;white-space:nowrap}'+
  '.ttg-cb{position:relative;display:inline-block;vertical-align:middle;margin-right:5px;height:32px;line-height:0}'+
  '.ttg-cb img{display:block;height:32px;width:auto;max-width:104px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))}'+
  '.ttg-cb i,.ttg-pb i,.ttg-rb i,.ttg-hb i,.ttg-frm i{position:absolute;width:4px;height:4px;background:#fff;box-shadow:0 0 3px 1px #ffe28a,0 0 7px 2px rgba(255,210,74,.55);opacity:0;pointer-events:none;animation:ttgSp 2.4s ease-in-out infinite;animation-duration:var(--d,2.4s)!important;animation-iteration-count:infinite!important}'+
  '.ttg-cb i:nth-of-type(1),.ttg-pb i:nth-of-type(1),.ttg-rb i:nth-of-type(1),.ttg-hb i:nth-of-type(1),.ttg-frm i:nth-of-type(1){left:6%;top:18%;animation-delay:0s}'+
  '.ttg-cb i:nth-of-type(2),.ttg-pb i:nth-of-type(2),.ttg-rb i:nth-of-type(2),.ttg-hb i:nth-of-type(2),.ttg-frm i:nth-of-type(2){left:24%;top:72%;width:3px;height:3px;animation-delay:.7s;--d:1.9s}'+
  '.ttg-cb i:nth-of-type(3),.ttg-pb i:nth-of-type(3),.ttg-rb i:nth-of-type(3),.ttg-hb i:nth-of-type(3),.ttg-frm i:nth-of-type(3){left:42%;top:10%;width:5px;height:5px;animation-delay:1.3s}'+
  '.ttg-cb i:nth-of-type(4),.ttg-pb i:nth-of-type(4),.ttg-rb i:nth-of-type(4),.ttg-hb i:nth-of-type(4),.ttg-frm i:nth-of-type(4){left:58%;top:64%;animation-delay:.3s;--d:2.8s}'+
  '.ttg-cb i:nth-of-type(5),.ttg-pb i:nth-of-type(5),.ttg-rb i:nth-of-type(5),.ttg-hb i:nth-of-type(5),.ttg-frm i:nth-of-type(5){left:73%;top:22%;width:3px;height:3px;animation-delay:1.8s;--d:2s}'+
  '.ttg-cb i:nth-of-type(6),.ttg-pb i:nth-of-type(6),.ttg-rb i:nth-of-type(6),.ttg-hb i:nth-of-type(6),.ttg-frm i:nth-of-type(6){left:88%;top:58%;animation-delay:1s}'+
  '.ttg-cb i:nth-of-type(7),.ttg-pb i:nth-of-type(7),.ttg-rb i:nth-of-type(7),.ttg-hb i:nth-of-type(7),.ttg-frm i:nth-of-type(7){left:33%;top:42%;width:3px;height:3px;animation-delay:2.1s;--d:2.6s}'+
  '.ttg-cb i:nth-of-type(8),.ttg-pb i:nth-of-type(8),.ttg-rb i:nth-of-type(8),.ttg-hb i:nth-of-type(8),.ttg-frm i:nth-of-type(8){left:80%;top:84%;animation-delay:.5s;--d:2.2s}'+
  '#ar-podium .slot{position:relative}'+
  '.ttg-pbw{position:relative;height:28px;pointer-events:none}'+
  '.ttg-pb{position:absolute;left:50%;top:-24px;transform:translateX(-50%);height:46px;line-height:0;z-index:3}'+
  '.ttg-pb img{display:block;height:46px;width:auto;max-width:118px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))}'+
  '.ttg-rb{position:relative;display:inline-block;vertical-align:middle;margin-right:5px;height:28px;line-height:0}'+
  '.ttg-rb img{display:block;height:28px;width:auto;max-width:90px;filter:drop-shadow(0 1px 2px rgba(0,0,0,.65))}'+
  '.ttg-hb{position:relative;display:block;width:120px;margin:0 0 -18px -4px;line-height:0;z-index:3;pointer-events:none}'+
  '.ttg-hb img{display:block;width:120px;height:auto;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))}'+
  '#cv-body .ti.hb{position:relative;margin:0;text-align:left}'+
  '#cv-body .ti.hb .tt2{position:absolute;left:132px;top:3px;right:0;text-align:left;white-space:nowrap}'+
  '#cv-body .ti.hb + .top{align-items:flex-start}'+
  '#mob .ttg-fr{position:relative;container-type:inline-size}'+
  '#mob .ttg-frm{position:relative;width:100%;pointer-events:none;line-height:0}'+
  '#mob .ttg-frm img{display:block;width:100%;height:auto;filter:drop-shadow(0 2px 3px rgba(0,0,0,.7))}'+
  '#mob .ttg-frm .pl{position:absolute;z-index:1;background:var(--pc);border-radius:2px;box-shadow:inset 0 0 0 1px var(--pd),inset 0 0 5px 1px rgba(0,0,0,.75),0 0 0 1px #000}'+
  '#mob .ttg-frm i{z-index:2}'+
  '#mob .ttg-fr .ttg-fn{position:absolute!important;z-index:4;left:calc(var(--px) + 3px);top:calc(var(--py) + 1px);width:calc(var(--pw) - 30px);height:9px;margin:0!important;font-size:11px!important;line-height:9px!important;letter-spacing:-.3px;overflow:hidden!important;text-overflow:ellipsis;white-space:nowrap;text-shadow:-1px 0 0 #000,1px 0 0 #000,0 -1px 0 #000,0 1px 0 #000,-1px -1px 0 #000,1px 1px 0 #000,-1px 1px 0 #000,1px -1px 0 #000!important}'+
  '#mob .ttg-fr .ttg-fb{position:absolute!important;z-index:4;left:calc(var(--px) + 3px);width:calc(var(--pw) - 6px);height:8px;top:calc(var(--pb) - 10px);box-sizing:border-box;border:2px solid #000!important;border-radius:0!important;background:#050a0d;box-shadow:0 0 0 1px rgba(255,255,255,.28)}'+
  '#mob .ttg-fr .ttg-fc{z-index:4;top:calc(var(--py) + 0px)!important;right:calc(var(--pr) + 3px)!important}'+
  '#mob .ttg-fr .ttg-fc span{font-size:9px!important;line-height:9px!important;padding:0 2px!important;margin:0!important}'+
  '#mob .ttg-fr .ttg-ft{padding-right:0!important;margin-top:2px}'+
  '@keyframes ttgSp{0%,100%{opacity:0;transform:scale(.3) translateY(2px)}40%{opacity:1;transform:scale(1.15) translateY(-1px)}70%{opacity:.7;transform:scale(.6) translateY(-4px)}}'+
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
     thì THU NHỎ cho vừa (tối thiểu 70px) thay vì bị kẹt cứng ở mép trên và đứng yên khi thú chuyển động. */
  const im=el.firstChild,ar=(im&&im.naturalWidth)?im.naturalHeight/im.naturalWidth:.5;
  let tw=Math.min(150,w*.42);
  const room=y+4-2;                               /* chỗ trống từ mép trên khung tới đầu thú */
  if(tw*ar>room)tw=Math.max(70,room/ar);
  const th=tw*ar;
  el.style.width=tw+'px';if(im)im.style.width=tw+'px';
  el.style.display='block';el.style.left=Math.round(x-tw/2)+'px';el.style.top=Math.max(2,Math.round(y-th+4))+'px'}
setInterval(()=>{try{mountOwn()}catch(_){}},15000);
setTimeout(()=>{try{mountOwn()}catch(_){}},4000);
setInterval(()=>{try{placeOwn()}catch(_){}},120);

/* ---------- Màn chiến đấu (thám hiểm + đấu trường): danh hiệu dưới thanh máu mỗi bên ---------- */
function btEl(id){
  const o=document.getElementById('mob');if(!o)return null;
  let el=document.getElementById(id);
  if(!el){el=document.createElement('div');el.id=id;o.appendChild(el)}
  return el}
/* Bảng chữ (x,y,w,h theo ảnh gốc rộng 320px) mà tấm phủ sẽ che + màu tấm phủ / viền hợp với từng khung */
const PL={
 'img-title-admin.webp':  {h:120,r:[84,48,154,44], bg:'#3b0b10',bd:'#c98a3a'},
 'img-title-top1-s1.webp':{h:175,r:[104,64,158,46],bg:'#4a0a0e',bd:'#e0b050'},
 'img-title-top2-s1.webp':{h:174,r:[84,58,196,44], bg:'#3a2410',bd:'#d6a64a'},
 'img-title-top3-s1.webp':{h:174,r:[110,60,168,44],bg:'#0e2048',bd:'#a9bddf'},
 'img-title-vip1.webp':   {h:87, r:[90,16,202,46], bg:'#1d4468',bd:'#c2cbd4'},
 'img-title-vip2.webp':   {h:88, r:[88,19,196,50], bg:'#123d1e',bd:'#d9a94a'},
 'img-title-vip3.webp':   {h:95, r:[98,23,196,46], bg:'#10286a',bd:'#b9c6df'},
 'img-title-vip4.webp':   {h:107,r:[102,26,188,50],bg:'#3c1370',bd:'#e0b050'},
 'img-title-vip5.webp':   {h:92, r:[100,24,176,46],bg:'#6d1006',bd:'#e0a040'},
 'img-title-vip6.webp':   {h:120,r:[110,42,172,44],bg:'#0e2050',bd:'#e0b050'},
 'img-title-vip7.webp':   {h:178,r:[108,62,168,44],bg:'#1c1450',bd:'#e0b8f0'}};
const SIDE={'mob-pn':['mob-ph','mob-pt','mob-pe'],'mob-mn':['mob-mh','mob-mt','mob-me']};
function frameClear(S){
  S.classList.remove('ttg-fr');
  ['--px','--py','--pw','--pb','--pr','--pc','--pd'].forEach(v=>S.style.removeProperty(v));
  const f=S.querySelector(':scope > .ttg-frm');if(f)f.remove()}
/* Màn chiến đấu: ảnh danh hiệu làm khung cho 'biệt danh + thanh máu + hệ' (bảng chữ gốc bị tấm phủ che).
   Số máu + dòng buff (x2 EXP...) nằm ngay dưới khung. Danh hiệu chưa có ảnh -> HUD cũ. */
function frameSide(nameId,uid){
  const n=document.getElementById(nameId);if(!n)return;
  const S=n.parentNode,ids=SIDE[nameId];if(!S||!ids)return;
  if(!uid){frameClear(S);return}
  get(uid).then(l=>{
    if(!S.isConnected)return;
    const x=l[0],src=x&&imgOf(x),M=src&&PL[src];
    if(!M){frameClear(S);return}
    const bar=document.getElementById(ids[0]),tx=document.getElementById(ids[1]),ch=document.getElementById(ids[2]);
    if(!n.children.length)n.textContent=n.textContent.replace(/\s*·\s*(?:Lv\.|Cấp\s*)(\d+)/,' Lv$1');   /* rút gọn "· Lv.18" -> " Lv18" cho vừa bảng tên */
    n.classList.add('ttg-fn');if(bar&&bar.parentNode)bar.parentNode.classList.add('ttg-fb');
    if(tx)tx.classList.add('ttg-ft');if(ch)ch.classList.add('ttg-fc');
    const k=.3125,[rx,ry,rw,rh]=M.r,st=S.style;
    st.setProperty('--px',(rx*k)+'cqw');st.setProperty('--py',(ry*k)+'cqw');st.setProperty('--pw',(rw*k)+'cqw');
    st.setProperty('--pb',((ry+rh)*k)+'cqw');st.setProperty('--pr',((320-rx-rw)*k)+'cqw');
    st.setProperty('--pc',M.bg);st.setProperty('--pd',M.bd);
    S.classList.add('ttg-fr');
    let f=S.querySelector(':scope > .ttg-frm');
    if(!f){f=document.createElement('div');f.className='ttg-frm';S.insertBefore(f,S.firstChild)}
    f.style.aspectRatio='320/'+M.h;
    f.innerHTML='<img src="'+src+'" alt="" onerror="var S=this.closest(\'.ttg-fr\');if(S)S.classList.remove(\'ttg-fr\');this.parentNode.remove()">'+
      '<div class="pl" style="left:'+(rx/3.2)+'%;top:'+(ry/M.h*100)+'%;width:'+(rw/3.2)+'%;height:'+(rh/M.h*100)+'%"></div><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>'})}

function btSet(id,uid){
  const el=btEl(id);if(!el)return;
  el.innerHTML='';if(!uid)return;
  get(uid).then(l=>{if(l.length&&el.isConnected)el.innerHTML=imgOf(l[0])&&PL[imgOf(l[0])]?'':tag(uid)})}   /* có khung ảnh -> bỏ nhãn chữ cũ */
function battleTitle(e){
  const mu=e&&e.uid?e.uid:'';
  btSet('ttg-bt-p',myUid());                    /* bên mình */
  btSet('ttg-bt-m',mu);                         /* bên đối thủ (chỉ đấu trường truyền uid) */
  frameSide('mob-pn',myUid());frameSide('mob-mn',mu)}
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
      if(!l.length||!nm.isConnected)return;
      if(box.classList.contains('slot')){                 /* bục top 3: ảnh danh hiệu treo vắt ngang viền trên, KHÔNG hiện chữ */
        if(box.querySelector('.ttg-pbw'))return;
        const h=chatBadge(uid,'ttg-pb',"var w=this.closest('.ttg-pbw');if(w)w.remove()");if(!h)return;
        const w=document.createElement('div');w.className='ttg-pbw';w.innerHTML=h;
        box.insertBefore(w,box.firstChild);return}
      if(nm.querySelector('.ttg-rb'))return;               /* hạng 4 trở xuống + danh sách khiêu chiến: ảnh danh hiệu nhỏ trước tên, KHÔNG hiện chữ */
      const h=chatBadge(uid,'ttg-rb');if(!h)return;
      const t=document.createElement('span');t.innerHTML=h;
      nm.insertBefore(t.firstChild,nm.firstChild)})})}
let arObs=null,arEl=null;
setInterval(()=>{
  const b=document.getElementById('ar-body');
  if(!b){arObs&&arObs.disconnect();arObs=null;arEl=null;return}
  if(b!==arEl){arObs&&arObs.disconnect();arEl=b;
    arObs=new MutationObserver(()=>{try{decorate(b)}catch(_){}});
    arObs.observe(b,{childList:true,subtree:true});try{decorate(b)}catch(_){}}},1000);

window.TTGTITLE={imgOf,get,text,icon,tag,chatBadge,frame:frameSide,decorate,prefetch,fill,MANUAL,refresh(uid){delete cache[uid||ownUid];ownT=0}};
})();
