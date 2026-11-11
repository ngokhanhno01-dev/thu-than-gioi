/* ===== 21-card.js — THẺ THÚ CÔNG KHAI (bước 1 của chức năng Bạn bè) =====
   Mỗi người chơi đã đăng nhập tự đăng 1 "thẻ" tóm tắt lên Firestore cards/{uid}.
   Bạn bè (bước 2-3) chỉ đọc thẻ này; bản lưu thật saves/{uid} vẫn riêng tư, không ai đọc được.
   Thẻ gồm: biệt danh, cấp + bậc, loài/huyết mạch/độ đậm, chỉ số tổng (đã gồm huyết mạch + trang bị), 4 món trang bị đang mang.
   Tiết kiệm quota: chỉ ghi khi thẻ THAY ĐỔI và cách lần ghi trước >= CARD_MS (mặc định 5 phút). Khách không đăng thẻ.
   Không sửa 19-save.js: file này bọc TTGNET.start/setName của 20-online.js, nên phải nạp SAU 20-online.js và TRƯỚC 19-save.js. */
(()=>{
'use strict';
const CARD_MS=300000;      /* tối thiểu 5 phút giữa 2 lần ghi thẻ */
const CHECK_MS=60000;      /* mỗi 60 giây kiểm tra xem thẻ có đổi không (chỉ đọc biến trong máy, không tốn lượt Firestore) */
let db=null,uid='',nick='',last=0,lastHash='',timer=0,busy=false;

/* Dựng thẻ từ trạng thái game hiện tại. Trả null nếu chưa có thú (chưa nở). */
function buildCard(){
  if(typeof hatched==='undefined'||!hatched||!pet)return null;
  const s=statsOf(pet.bl,pet.pi,pet.base,level),R=x=>Math.round((+x||0)*10)/10;
  const eq=[0,1,2,3].map(i=>{const it=eqWorn[i];
    return it?{z:it.z,s:it.s,q:it.q,L:it.L.map(l=>[String(l[0]),R(l[1])])}:null});
  return{
    nick:String(nick).slice(0,20),
    lv:level,st:stageOf(level),
    sp:pet.sp,bl:pet.bl,pi:pet.pi,up:pet.up||0,q:pet.q,
    stats:{hp:Math.round(s.hp),atk:Math.round(s.atk),def:Math.round(s.def),spd:Math.round(s.spd),mag:Math.round(s.mag),
           eva:R(s.eva),stun:R(s.stun),regen:R(s.regen),crit:R(s.crit)},
    eq};
}

function publish(force){
  if(!db||!uid||busy)return;
  if(window.TTGNET&&TTGNET.blocked&&TTGNET.blocked())return;   /* server đầy */
  let c;try{c=buildCard()}catch(e){console.warn('[card] dựng thẻ lỗi',e);return}
  if(!c)return;
  const h=JSON.stringify(c),now=Date.now();
  if(h===lastHash)return;                        /* không đổi gì -> khỏi ghi */
  if(!force&&now-last<CARD_MS)return;            /* ghi quá dày -> đợi */
  busy=true;
  c.t=firebase.firestore.FieldValue.serverTimestamp();
  db.collection('cards').doc(uid).set(c).then(()=>{lastHash=h;last=Date.now()})
    .catch(e=>console.warn('[card] ghi thẻ lỗi (đã dán luật cards chưa?)',e))
    .then(()=>{busy=false})}

function startCard(o){
  if(!o||!o.db||o.guest||timer)return;
  db=o.db;uid=o.uid;nick=o.name||'';
  setTimeout(()=>publish(true),4000);            /* chờ game khôi phục xong rồi đăng thẻ lần đầu */
  timer=setInterval(()=>publish(false),CHECK_MS);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)publish(false)})}

/* Bọc TTGNET (20-online.js) để không phải sửa 19-save.js */
const N=window.TTGNET;
if(N){
  const st=N.start,sn=N.setName;
  N.start=function(o){const r=st.apply(this,arguments);try{startCard(o)}catch(e){console.warn('[card]',e)}return r};
  N.setName=function(n){const r=sn.apply(this,arguments);nick=String(n).slice(0,20);lastHash='';publish(true);return r};   /* đổi biệt danh -> đăng thẻ ngay */
}
window.TTGCARD={build:buildCard,publish:()=>publish(true)};
})();
