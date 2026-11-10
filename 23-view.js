/* ===== 23-view.js — XEM THẺ THÚ CỦA BẠN BÈ (bước 3 của chức năng Bạn bè) =====
   Trong khung Bạn bè (22-friends.js), mỗi người bạn có nút 👁. Bấm vào -> mở khung "thẻ thú" của người đó:
   hình thú (đúng loài, đúng bậc), biệt danh, cấp + bậc, phẩm, huyết mạch, loài, độ đậm, chỉ số tổng và 4 món trang bị (kèm dòng chỉ số + buff bộ).
   Dữ liệu đọc từ Firestore cards/{uid} (công khai, do 21-card.js đăng). KHÔNG đọc bản lưu saves/{uid}.
   Tiết kiệm quota: mỗi lần bấm xem = 1 lượt đọc; xem lại cùng 1 người trong CACHE_MS thì dùng bản nhớ trong máy, không đọc lại.
   Không cần thêm luật Firestore (cards đã cho đọc công khai ở bước 1).
   Không sửa file cũ: bọc TTGNET.start của 20-online.js để lấy kết nối db, rồi gán TTGFRIENDS.onView.
   Nạp SAU 22-friends.js, TRƯỚC 19-save.js. */
(()=>{
'use strict';
const CACHE_MS=60000;       /* xem lại cùng 1 người trong 60 giây: không đọc lại Firestore */
const VIEW_COOLDOWN=800;    /* giãn cách giữa 2 lần bấm xem */

const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(x,lo,hi,d)=>{x=+x;if(!isFinite(x))return d;return Math.max(lo,Math.min(hi,x))};
const r1=x=>Math.round((+x||0)*10)/10;

let db=null,open=false,curUid='',lastView=0,raf=0,seq=0;
const cache={};     /* uid -> {t, card} */

/* ---------- CSS ---------- */
{const s=document.createElement('style');
 s.textContent=
 '#cv-ov{position:fixed;inset:0;z-index:95;display:none;align-items:center;justify-content:center;background:rgba(4,10,14,.72);padding:10px;box-sizing:border-box}'+
 '#cv-ov.show{display:flex}'+
 '#cv-box{width:min(96vw,340px);max-height:min(88vh,560px);display:flex;flex-direction:column;box-sizing:border-box;border:3px solid #f6c66a;background-color:#14272d;background-image:repeating-conic-gradient(#1a3335 0 25%,#12262e 0 50%);background-size:4px 4px;box-shadow:0 3px 0 0 #040a0e,0 0 0 2px #040a0e,inset 0 0 0 2px #78613a;color:#f5edcf}'+
 '#cv-box .h{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:2px solid #78613a;font-size:20px!important;color:#f6c66a;text-shadow:1px 1px 0 #071116}'+
 '#cv-box .h .nn{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '#cv-box .h button{width:auto;margin:0 0 0 4px;min-height:0;height:auto;padding:0 8px;font-size:20px!important;line-height:1.1;cursor:pointer;color:#f5edcf;background:#3b4a4f;border:2px solid #040a0e;box-shadow:inset 0 -2px 0 #232e32;border-radius:0;flex:none}'+
 '#cv-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:6px 8px 8px;font-size:18px!important;line-height:1.15}'+
 '#cv-body .e{color:#b7bda9;font-size:17px!important;text-align:center;margin:14px 0}'+
 '#cv-body .top{display:flex;gap:8px;align-items:center;margin-bottom:6px}'+
 '#cv-body canvas{flex:none;width:112px;height:112px;image-rendering:pixelated;border:2px solid #78613a;background:#0b1a20}'+
 '#cv-body .inf{min-width:0;font-size:17px!important;line-height:1.2}'+
 '#cv-body .inf div{font-size:17px!important}'+
 '#cv-body .inf small{font-size:14px!important;color:#b7bda9}'+
 '#cv-body .s{margin:6px 0 3px;font-size:16px!important;color:#f6c66a;border-bottom:1px solid #78613a}'+
 '#cv-body .sg{display:grid;grid-template-columns:1fr 1fr;gap:2px 10px}'+
 '#cv-body .sg div{display:flex;justify-content:space-between;font-size:16px!important;border-bottom:1px dotted #2d4a4e}'+
 '#cv-body .sg b{color:#f6c66a;font-size:16px!important}'+
 '#cv-body .it{margin:0 0 4px;padding:3px 6px;border:2px solid #4d533b;background:#0b1a20;font-size:16px!important;line-height:1.15}'+
 '#cv-body .it b{font-size:17px!important}'+
 '#cv-body .it div{font-size:15px!important;color:#d9d2b4}'+
 '#cv-body .it.no{color:#78864f;border-style:dashed;text-align:center}'+
 '#cv-body .set{margin:0 0 3px;font-size:15px!important;color:#72e4b0}'+
 '#cv-body .ft{margin-top:6px;text-align:center;font-size:13px!important;color:#78864f}';
 document.head.appendChild(s)}

/* ---------- Khung ---------- */
function build(){
  if($('cv-ov'))return;
  const o=document.createElement('div');o.id='cv-ov';
  o.innerHTML='<div id="cv-box"><div class="h"><div class="nn" id="cv-nm">🐾 Thẻ thú</div><div><button type="button" id="cv-rf" title="Tải lại">⟳</button><button type="button" id="cv-x" title="Đóng">✕</button></div></div><div id="cv-body"><div class="e">Đang tải...</div></div></div>';
  document.body.appendChild(o);
  $('cv-x').onclick=()=>show(false);
  $('cv-rf').onclick=()=>{if(curUid){delete cache[curUid];load(curUid,$('cv-nm').dataset.nick||'')}};
  o.addEventListener('click',e=>{if(e.target===o)show(false)});
  document.addEventListener('keydown',e=>{if(open&&e.key==='Escape')show(false)});
}
function show(v){
  open=v;const o=$('cv-ov');if(!o)return;
  o.classList.toggle('show',v);
  if(!v){cancelAnimationFrame(raf);seq++}}   /* seq++: bỏ kết quả tải dở dang */

/* ---------- Dựng nội dung từ thẻ (dữ liệu công khai -> luôn kiểm tra + escape) ---------- */
function statRows(st){
  st=st&&typeof st==='object'?st:{};
  const g=k=>num(st[k],0,1e9,0);
  return[['Sinh Lực',Math.round(g('hp'))],['Công',Math.round(g('atk'))],['Thủ',Math.round(g('def'))],['Tốc',Math.round(g('spd'))],['Linh',Math.round(g('mag'))],
    ['Né tránh',r1(g('eva'))+'%'],['Chí mạng',r1(g('crit'))+'%'],['Choáng',r1(g('stun'))+'%'],['Hồi/lượt',r1(g('regen'))+'%']]}

function itemHtml(it){
  if(!it||typeof it!=='object')return'<div class="it no">— Trống —</div>';
  const z=Math.floor(num(it.z,0,99,-1)),s=Math.floor(num(it.s,0,99,-1)),q=Math.floor(num(it.q,0,4,0));
  const slot=EQ_SLOTS[s],zone=VAN_KIEP_ZONES[z];
  if(!slot||!zone)return'<div class="it no">— Không rõ —</div>';
  const col='rgb('+QC[q]+')';
  const lines=(Array.isArray(it.L)?it.L:[]).slice(0,5).map(l=>{
    if(!Array.isArray(l))return'';
    const d=EQ_STATS[String(l[0])];if(!d)return'';
    return'<div>'+esc(d.n)+' +'+r1(l[1])+(d.t==='p'?'%':'')+'</div>'}).join('');
  return'<div class="it" style="border-color:'+col+'"><b style="color:'+col+'">'+slot.i+' ['+QN[q]+'] '+esc(slot.n+' '+zone.name)+'</b>'+lines+'</div>'}

/* buff bộ: đếm số món cùng bộ (>=2 món thì có buff) */
function setHtml(eq){
  const c={};
  eq.forEach(it=>{if(it&&typeof it==='object'){const z=Math.floor(num(it.z,0,99,-1));if(VAN_KIEP_ZONES[z])c[z]=(c[z]||0)+1}});
  return Object.keys(c).filter(z=>c[z]>=2&&EQ_SETS[z]).map(z=>
    '<div class="set">'+EQ_SETS[z].i+' Bộ '+esc(EQ_SETS[z].name)+' '+c[z]+'/4 — buff bộ '+(c[z]>=4?'đủ 4 món':'2 món')+'</div>').join('')}

function ago(t){
  try{const ms=Date.now()-t.toDate().getTime();if(!(ms>=0))return'';
    const m=Math.floor(ms/60000);
    if(m<2)return'vừa xong';if(m<60)return m+' phút trước';
    const h=Math.floor(m/60);if(h<48)return h+' giờ trước';return Math.floor(h/24)+' ngày trước'}catch(_){return''}}

function render(c,uid,fallbackNick){
  const BLK=['ho','vu','long','tuoc','lan','hu'];
  const bl=BLK.includes(c.bl)?c.bl:'ho',sp=Math.floor(num(c.sp,0,16,0)),pi=Math.floor(num(c.pi,0,4,0)),up=Math.floor(num(c.up,0,10,0)),q=Math.floor(num(c.q,0,4,0));
  const lv=Math.floor(num(c.lv,1,100,1)),st=Math.floor(num(c.st,0,9,0));
  const nick=String(c.nick||fallbackNick||'Ẩn danh').slice(0,20);
  const B=BL[bl],eq=Array.isArray(c.eq)?c.eq.slice(0,4):[];
  let spName=genOf(bl,sp).name,spTxt='';
  try{const si=spInfo(sp,pi+up*.03,q);spTxt=si&&si.text?si.text:''}catch(_){}
  const pe=Math.round(pur(pi+up*.03)*100);
  const nm=$('cv-nm');nm.textContent='🐾 '+nick;nm.dataset.nick=nick;
  const grid=statRows(c.stats).map(x=>'<div>'+x[0]+'<b>'+x[1]+'</b></div>').join('');
  const upd=ago(c.t);
  $('cv-body').innerHTML=
   '<div class="top"><canvas id="cv-cv" width="128" height="128"></canvas><div class="inf">'+
   '<div><b style="color:var(--jade)">Cấp '+lv+'</b></div><div>'+esc(STAGES[st][1])+'</div>'+
   '<div>Phẩm: <b style="color:rgb('+QC[q]+')">'+QN[q]+'</b></div>'+
   '<div>Huyết mạch: <b style="color:rgb('+B.au+')">'+esc(B.n)+'</b> <small>(hệ '+esc(B.h)+')</small></div>'+
   '<div>Độ đậm: <b style="color:var(--gold)">'+esc(PL[pi][1])+(up?' +'+up:'')+'</b> <small>('+pe+'%)</small></div></div></div>'+
   '<div>Loài: <b>'+esc(spName)+'</b></div>'+(spTxt?'<div class="set" style="color:#b7bda9">'+spTxt+'</div>':'')+
   '<div class="s">📊 Chỉ số tổng (đã gồm huyết mạch + trang bị)</div><div class="sg">'+grid+'</div>'+
   '<div class="s">🛡️ Trang bị đang mang</div>'+setHtml(eq)+[0,1,2,3].map(i=>itemHtml(eq[i])).join('')+
   (upd?'<div class="ft">Thẻ cập nhật '+upd+'</div>':'');
  drawPet(bl,sp,st)}

/* Vẽ thú: ảnh có thể chưa tải xong -> thử lại từng khung hình tối đa ~4 giây */
function drawPet(bl,sp,st){
  cancelAnimationFrame(raf);
  const cv=$('cv-cv');if(!cv)return;
  const x=cv.getContext('2d'),api=window.VanKiepSprites;let n=0;
  const step=()=>{
    if(!open)return;
    x.clearRect(0,0,128,128);
    let ok=false;try{ok=!!(api&&api.drawStageCentered(x,bl,sp,st,64,64,128))}catch(_){}
    if(!ok&&++n<240&&open)raf=requestAnimationFrame(step)};
  step()}

/* ---------- Tải thẻ ---------- */
async function load(uid,nick){
  curUid=uid;const my=++seq;
  const c0=cache[uid];
  $('cv-nm').textContent='🐾 '+(nick||'Thẻ thú');$('cv-nm').dataset.nick=nick||'';
  if(c0&&Date.now()-c0.t<CACHE_MS){render(c0.card,uid,nick);return}
  $('cv-body').innerHTML='<div class="e">Đang tải thẻ...</div>';
  if(!db){$('cv-body').innerHTML='<div class="e">Chưa kết nối máy chủ. Hãy đăng nhập rồi thử lại.</div>';return}
  try{
    const d=await db.collection('cards').doc(uid).get();
    if(my!==seq)return;                          /* đã đóng / đã chuyển sang người khác */
    if(!d.exists){$('cv-body').innerHTML='<div class="e">'+esc(nick||'Người này')+' chưa có thẻ thú.<br><small>Cần vào game bản mới một lần (và đã nở trứng) thì thẻ mới xuất hiện.</small></div>';return}
    const card=d.data();cache[uid]={t:Date.now(),card};
    render(card,uid,nick);
  }catch(e){
    if(my!==seq)return;
    console.warn('[view] tải thẻ lỗi',e);
    $('cv-body').innerHTML='<div class="e">'+(e&&e.code==='permission-denied'?'Chưa mở quyền đọc thẻ (kiểm tra luật cards).':'Không tải được thẻ (mất mạng?).')+'</div>'}}

function view(uid,nick){
  const now=Date.now();if(now-lastView<VIEW_COOLDOWN)return;lastView=now;
  if(!uid)return;
  build();show(true);load(uid,nick||'')}

/* ---------- Khởi động ---------- */
window.TTGVIEW={view};
if(window.TTGFRIENDS)window.TTGFRIENDS.onView=view;   /* 22-friends.js tự hiện nút 👁 cho mỗi người bạn */
const N=window.TTGNET;
if(N){
  const st=N.start;
  N.start=function(o){try{if(o&&o.db&&!o.guest)db=o.db}catch(e){console.warn('[view]',e)}return st.apply(this,arguments)};
}
})();
