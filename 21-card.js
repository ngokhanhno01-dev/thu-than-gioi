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

/* Chuẩn hóa để Firestore luôn nhận được: không undefined, số hữu hạn, chuỗi có giới hạn.
   QUAN TRỌNG: Firestore KHÔNG cho mảng nằm trong mảng. Nên mỗi dòng chỉ số lưu dạng object {k:'atk',v:5.2}
   (mảng các object thì được). 23-view.js đọc được cả dạng cũ [id,giá trị] lẫn dạng mới này. */
const fin=(x,lo,hi,d)=>{x=+x;if(!isFinite(x))return d;return Math.max(lo,Math.min(hi,x))};
const R=x=>Math.round(fin(x,-1e9,1e9,0)*10)/10;
const I=(x,lo,hi,d)=>Math.floor(fin(x,lo,hi,d));
const BLS=['ho','vu','long','tuoc','lan','hu'];

/* Dựng thẻ từ trạng thái game hiện tại. Trả null nếu chưa có thú (chưa nở). */
function buildCard(){
  if(typeof hatched==='undefined'||!hatched||!pet)return null;
  const s=statsOf(pet.bl,pet.pi,pet.base,level);
  const eq=[0,1,2,3].map(i=>{const it=eqWorn[i];
    if(!it||typeof it!=='object')return null;
    const L=(Array.isArray(it.L)?it.L:[]).slice(0,5).map(l=>{
      /* chấp nhận l là [id,giá trị] (bản game) hoặc {k,v} */
      const k=Array.isArray(l)?l[0]:(l&&l.k),v=Array.isArray(l)?l[1]:(l&&l.v);
      return{k:String(k==null?'':k).slice(0,12),v:R(v)}}).filter(o=>o.k);
    return{z:I(it.z,0,99,0),s:I(it.s,0,99,0),q:I(it.q,0,4,0),L}});
  return{
    nick:String(nick||'').slice(0,20),
    lv:I(level,1,100,1),st:I(stageOf(level),0,9,0),
    sp:I(pet.sp,0,16,0),bl:BLS.includes(pet.bl)?pet.bl:'ho',pi:fin(pet.pi,0,4,0),up:I(pet.up,0,10,0),q:I(pet.q,0,4,0),
    stats:{hp:Math.round(fin(s.hp,0,1e9,0)),atk:Math.round(fin(s.atk,0,1e9,0)),def:Math.round(fin(s.def,0,1e9,0)),spd:Math.round(fin(s.spd,0,1e9,0)),mag:Math.round(fin(s.mag,0,1e9,0)),
           eva:R(s.eva),stun:R(s.stun),regen:R(s.regen),crit:R(s.crit)},
    eq};
}

let warned=false;
function say(t){try{if(typeof log==='function')log(t)}catch(_){}}
/* Đăng thẻ. Trả Promise {ok, why}. manual = người chơi bấm Lưu ngay -> báo kết quả trong Nhật ký. */
function publish(force,manual){
  if(!db||!uid)return Promise.resolve({ok:false,why:'chưa đăng nhập'});
  if(busy)return Promise.resolve({ok:false,why:'đang đăng'});
  if(window.TTGNET&&TTGNET.blocked&&TTGNET.blocked())return Promise.resolve({ok:false,why:'máy chủ đầy'});   /* server đầy */
  let c;try{c=buildCard()}catch(e){console.warn('[card] dựng thẻ lỗi',e);if(manual||!warned){warned=true;say('⚠️ Không dựng được thẻ thú: '+((e&&e.message)||e))}return Promise.resolve({ok:false,why:'dựng thẻ lỗi'})}
  if(!c){if(manual)say('⚠️ Chưa có thú (chưa nở trứng) nên chưa có thẻ thú.');return Promise.resolve({ok:false,why:'chưa nở trứng'})}
  const h=JSON.stringify(c),now=Date.now();
  if(h===lastHash)return Promise.resolve({ok:true,same:true});                  /* không đổi gì -> khỏi ghi */
  if(!force&&now-last<CARD_MS)return Promise.resolve({ok:false,why:'chờ'});     /* ghi quá dày -> đợi */
  busy=true;
  let p;
  try{
    c.t=firebase.firestore.FieldValue.serverTimestamp();
    p=db.collection('cards').doc(uid).set(c)
  }catch(e){p=Promise.reject(e)}
  return p.then(()=>{lastHash=h;last=Date.now();busy=false;warned=false;if(manual)say('✅ Đã đăng thẻ thú lên máy chủ. Bạn bè xem được rồi.');return{ok:true}})
    .catch(e=>{busy=false;const code=String((e&&(e.code||e.message))||e);console.warn('[card] ghi thẻ lỗi (đã dán luật cards chưa?)',e);
      if(manual||!warned){warned=true;say('⚠️ Không đăng được thẻ thú ('+code+').'+(/permission/i.test(code)?' Kiểm tra Rules Firestore mục cards.':/exhaust|quota/i.test(code)?' Máy chủ miễn phí đã hết lượt hôm nay, thử lại ngày mai.':''))}
      return{ok:false,why:code}})}

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
window.TTGCARD={build:buildCard,publish:(manual)=>publish(true,!!manual)};
})();
