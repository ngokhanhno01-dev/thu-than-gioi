
/* ===== 19-save.js — LƯU GAME · TÀI KHOẢN · THƯỞNG NGOẠI TUYẾN =====
   Luồng:
   1. Mở game -> nếu đã đăng nhập từ lần trước thì vào thẳng, không thì hiện bảng Đăng nhập / Đăng ký / Chơi khách.
   2. Tiến trình tự lưu: mỗi AUTO_MS, sau khi xu/uy danh đổi (stats), khi ẩn tab / đóng trang.
   3. Vào lại game: khôi phục thú, cấp, xu, balo, trang bị, thuốc, cửa hàng, vùng thám hiểm + tính thưởng ngoại tuyến.
   4. Nút 👤 góc trái dưới: Lưu ngay · Xuất file · Nhập file · Đăng xuất · Xóa dữ liệu.

   LƯU Ý QUAN TRỌNG: hiện tài khoản & dữ liệu nằm trong localStorage của TRÌNH DUYỆT trên thiết bị này.
   - Mật khẩu chỉ là "khóa" giữa nhiều người dùng chung một máy, KHÔNG phải bảo mật thật.
   - Muốn đăng nhập ở nhiều thiết bị cần máy chủ: chỉ cần thay 3 hàm ở khối "KHO LƯU TRỮ" bên dưới (readSave/writeSave/...) bằng gọi API.
   Mọi con số sửa ngay dưới đây. */
(()=>{
'use strict';
const VER=1;                  /* phiên bản định dạng file lưu */
const AUTO_MS=10000;          /* tự lưu mỗi 10 giây */
const OFF_ON=true;            /* bật thưởng ngoại tuyến */
/* Thiết kế chống "tắt game -> canh giờ vào nhận -> tắt tiếp":
   - Hiệu suất thấp: chơi thật ~15-20 giây/trận, ngoại tuyến 120 giây/trận => chỉ ~15% hiệu quả, không bao giờ lợi hơn chơi thật.
   - Vắng dưới OFF_MIN_SEC thì KHÔNG có gì (và thời gian đó mất luôn, không dồn lại).
   - Mỗi lần nhận tối đa OFF_MAX_H giờ; cộng dồn trong 24 giờ chỉ được OFF_DAILY_H giờ => chia nhỏ lần nhận cũng không nhận thêm. */
const OFF_SEC_PER_WIN=120;    /* bao nhiêu giây ngoại tuyến thì tương đương 1 trận thắng (càng lớn càng ít thưởng) */
const OFF_MIN_SEC=600;        /* vắng dưới 10 phút: không tính */
const OFF_MAX_H=4;            /* mỗi lần nhận tối đa tính bao nhiêu giờ vắng */
const OFF_DAILY_H=6;          /* tổng số giờ ngoại tuyến được tính trong mỗi chu kỳ 24 giờ */
let fameSeason=0;              /* mùa mà uy danh hiện tại thuộc về (0 = chưa set) */
let arenaTickets=10;           /* số vé Đấu trường hiện có (0–10), Bước 2 */
let arenaTicketAt=0;           /* mốc giờ máy chủ (ms) lần tính vé gần nhất; 0 = chưa set */
const OFF_WINDOW_MS=24*3600*1000;
const GUEST='__guest';
const P='ttg_';
/* ===== DÁN CẤU HÌNH FIREBASE CỦA BẠN VÀO ĐÂY (Project settings -> Your apps -> Web app) ===== */
const FB_CONFIG={
  apiKey:'AIzaSyB_LfMna798-9lpK8m205F3sKtUQwTlyQo',
  authDomain:'thu-than-gioi.firebaseapp.com',
  projectId:'thu-than-gioi',
  databaseURL:'https://thu-than-gioi-default-rtdb.asia-southeast1.firebasedatabase.app',
  appId:'1:422450444342:web:95516a9cdf2f50c0f28097'
};
const CLOUD_MS=300000;        /* đẩy lên máy chủ tối đa mỗi 5 phút (tiết kiệm quota Firestore). Bản lưu trên máy vẫn ghi mỗi 10 giây; nút 💾 Lưu ngay, ẩn tab, đóng trang sẽ đẩy ngay */
const NOTICE_ON=true;          /* bật bảng thông báo khẩn nhắc lưu game khi vừa vào game */

/* ====================== KHO LƯU TRỮ (thay khối này khi có máy chủ) ====================== */
const LS={
  get(k){try{return localStorage.getItem(k)}catch(_){return null}},
  set(k,v){try{localStorage.setItem(k,v);return true}catch(_){return false}},
  del(k){try{localStorage.removeItem(k)}catch(_){}}
};
const kSave=u=>P+'save_'+u, kBak=u=>P+'bak_'+u;
const readSave=u=>LS.get(kSave(u));
const readBak=u=>LS.get(kBak(u));
const writeSave=(u,s)=>{const prev=LS.get(kSave(u));if(prev)LS.set(kBak(u),prev);return LS.set(kSave(u),s)};
const accounts=()=>{try{return JSON.parse(LS.get(P+'acc')||'{}')||{}}catch(_){return{}}};
const putAccounts=a=>LS.set(P+'acc',JSON.stringify(a));

/* ---------- ĐỒNG BỘ ĐÁM MÂY (Firebase Auth + Firestore) ----------
   Bản lưu vẫn ghi vào localStorage như cũ (làm bộ nhớ đệm, chạy cả khi mất mạng),
   rồi được đẩy lên Firestore: saves/{uid} = {raw, t, name}. Vào máy khác -> kéo bản MỚI HƠN về. */
let fbOk=false,auth=null,db=null,unsub=null,pushAt=0,pushQ=0,cloudBad=false,srv=null; /* srv = {last,now}: giờ MÁY CHỦ lần lưu cuối & hiện tại (chống chỉnh giờ điện thoại) */
function fbInit(){
  if(fbOk)return true;
  if(!window.firebase||!FB_CONFIG.apiKey||FB_CONFIG.apiKey.indexOf('DIEN_')===0)return false;
  try{firebase.initializeApp(FB_CONFIG);auth=firebase.auth();db=firebase.firestore();fbOk=true}catch(e){console.error('[cloud]',e)}
  return fbOk}
const docRef=uid=>db.collection('saves').doc(uid);
async function emailOf(n){   /* tên có dấu/khoảng trắng -> email giả hợp lệ (không gửi mail nào cả) */
  const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('ttg:'+keyOf(n)));
  return 'u'+Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,30)+'@thuthangioi.app'}
async function pull(uid){    /* lấy bản mới hơn giữa máy này và máy chủ */
  const snap=await docRef(uid).get(),c=snap.exists?snap.data():null,l=parseSave(readSave(uid));
  if(c&&c.raw&&parseSave(c.raw)&&(!l||num(c.t)>num(l.t))){LS.set(kSave(uid),c.raw);return}
  if(l&&(!c||num(l.t)>num(c.t))){KEYU=uid;user={key:uid,name:''};await cloudPush(true)}}
async function srvTime(uid){   /* lấy giờ máy chủ: last = lần đẩy lưu cuối, now = bây giờ (ghi serverTimestamp rồi đọc lại) */
  const ref=docRef(uid),snap=await ref.get(),c=snap.exists?snap.data():null;
  const last=c&&c.st&&c.st.toMillis?c.st.toMillis():0;
  await ref.set({seen:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
  const s2=await ref.get({source:'server'}),d2=s2.data();
  if(!d2||!d2.seen||!d2.seen.toMillis)throw new Error('notime');
  return{last,now:d2.seen.toMillis()}}
function cloudPush(force){
  if(!db||!user||user.key===GUEST||!KEYU)return Promise.resolve();
  if(window.TTGNET&&TTGNET.blocked&&TTGNET.blocked())return Promise.resolve();   /* server đầy: chưa có chỗ -> chưa ghi lên máy chủ (bản trên máy vẫn lưu) */
  const now=Date.now();
  if(!force&&now-pushAt<CLOUD_MS){clearTimeout(pushQ);pushQ=setTimeout(()=>cloudPush(true),CLOUD_MS-(now-pushAt));return Promise.resolve()}
  const raw=readSave(KEYU),d=parseSave(raw);if(!d)return Promise.resolve();
  pushAt=now;
  return docRef(KEYU).set({raw,t:d.t,name:user.name||'',st:firebase.firestore.FieldValue.serverTimestamp()}).then(()=>{if(cloudBad){cloudBad=false;warn('')}})
    .catch(e=>{console.warn('[cloud]',e);if(!cloudBad){cloudBad=true;warn('⚠️ Chưa đồng bộ được lên máy chủ (mất mạng?). Tiến trình vẫn được lưu trên máy này.')}})}
function flushCloud(minGap){   /* đẩy ngay lên máy chủ (dùng khi ẩn tab / đóng trang / bấm Lưu ngay); minGap = khoảng cách tối thiểu so với lần đẩy trước */
  if(!db||!user||user.key===GUEST||!KEYU)return Promise.resolve();
  if(Date.now()-pushAt<(minGap||0))return Promise.resolve();
  return cloudPush(true)}
function watch(){             /* thiết bị khác vừa lưu bản mới hơn -> tab này tự khóa để khỏi ghi đè */
  if(unsub)unsub();
  unsub=docRef(KEYU).onSnapshot(sn=>{
    if(!sn.exists||sn.metadata.hasPendingWrites)return;
    const c=sn.data(),d=parseSave(c.raw);
    if(d&&d.tab!==TAB&&num(c.t)>knownT)conflict()},e=>console.warn('[cloud] watch',e))}
const authErr=e=>({
  'auth/invalid-credential':'Sai tên hoặc mật khẩu.','auth/wrong-password':'Sai tên hoặc mật khẩu.','auth/user-not-found':'Sai tên hoặc mật khẩu.',
  'auth/email-already-in-use':'Tên này đã có người dùng.','auth/weak-password':'Mật khẩu cần ít nhất 6 ký tự.',
  'auth/network-request-failed':'Không kết nối được mạng.','auth/too-many-requests':'Thử quá nhiều lần, hãy đợi một lát.',
  'auth/operation-not-allowed':'Chưa bật đăng nhập Email/Mật khẩu trong Firebase.',
  'permission-denied':'Chưa mở quyền hồ sơ/biệt danh trên máy chủ (xem FIRESTORE_RULES.txt).','unavailable':'Không kết nối được máy chủ, thử lại.','resource-exhausted':'Máy chủ đã hết lượt dùng trong ngày, hãy thử lại sau (khoảng 15h chiều).'}[e&&e.code]||'Có lỗi, thử lại.');
/* ---------- BIỆT DANH (Firestore) ----------
   nicks/{nickKey}  = {uid, nick}   -> giữ chỗ để KHÔNG ai trùng biệt danh (nickKey = bỏ dấu, bỏ cách, chữ thường)
   profiles/{uid}   = {nick, nickKey, t} -> hồ sơ công khai: chat, bảng xếp hạng dùng cái này thay cho tên tài khoản */
async function loadNick(uid){
  const sn=await db.collection('profiles').doc(uid).get();
  return sn.exists&&sn.data().nick?String(sn.data().nick):''}
async function claimNick(uid,nick){
  const key=nickKey(nick),nref=db.collection('nicks').doc(key),ex=await nref.get();
  if(ex.exists&&ex.data().uid!==uid)throw new Error('taken');
  const b=db.batch();
  if(!ex.exists)b.set(nref,{uid,nick});
  b.set(db.collection('profiles').doc(uid),{nick,nickKey:key,t:firebase.firestore.FieldValue.serverTimestamp()});
  await b.commit();
  try{await auth.currentUser.updateProfile({displayName:nick})}catch(_){}}
async function changeNick(uid,nick){   /* đổi biệt danh: giữ chỗ tên mới, rồi cố nhả tên cũ cho người khác dùng */
  let oldKey='';
  try{const ps=await db.collection('profiles').doc(uid).get();oldKey=ps.exists?String(ps.data().nickKey||''):''}catch(_){}
  await claimNick(uid,nick);
  const nk=nickKey(nick);
  if(oldKey&&oldKey!==nk){try{await db.collection('nicks').doc(oldKey).delete()}catch(e){console.warn('[nick] không nhả được tên cũ (xem FIRESTORE_RULES_NICK.txt)',e)}}}
/* ======================================================================================= */

const $s=id=>document.getElementById(id);
const TAB=Math.random().toString(36).slice(2);
let user=null,KEYU='',noSave=false,locked=false,lastSave=0,saveT=0,storageBad=false,knownT=0,offSt={t0:Date.now(),used:0}; /* knownT = thời điểm bản lưu mới nhất mà tab NÀY biết */
const clampI=(v,a,b)=>{v=Math.floor(Number(v));return isFinite(v)?Math.max(a,Math.min(b,v)):a};
const num=(v,d)=>{v=Number(v);return isFinite(v)?v:(d||0)};

/* ---------- CSS ---------- */
{const s=document.createElement('style');
 s.textContent=
 '#ttg-login,#ttg-accp,#ttg-nick,#ttg-nc,#ttg-notice{position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(4,10,14,.86);padding:12px;box-sizing:border-box}'+
 '#ttg-login.show,#ttg-accp.show,#ttg-nick.show,#ttg-nc.show,#ttg-notice.show{display:flex}'+
 '.ttg-bx{width:min(90vw,340px);max-height:90vh;overflow-y:auto;box-sizing:border-box;text-align:center;padding:12px 14px 14px;border:3px solid #f6c66a;background:#14272d;box-shadow:0 3px 0 0 #040a0e,0 0 0 2px #040a0e,inset 0 0 0 2px #78613a;font-family:"VT323",monospace;color:#f5edcf}'+
 '.ttg-bx .t{font-size:30px;color:#f6c66a;text-shadow:1px 1px 0 #071116;line-height:1.1}'+
 '.ttg-bx .s{font-size:18px;color:#b7bda9;margin:2px 0 8px}'+
 '.ttg-bx input[type=text],.ttg-bx input[type=password]{display:block;width:100%;box-sizing:border-box;margin:6px 0;padding:7px 9px;font:inherit;font-size:20px;color:#f5edcf;background:#0b1a20;border:2px solid #78613a;outline:none;border-radius:0}'+
 '.ttg-bx input:focus{border-color:#72e4b0}'+
 '.ttg-bx button{font-family:"VT323",monospace;font-size:20px;padding:7px 10px;margin:4px 0;width:100%;cursor:pointer;color:#14272d;background:#72e4b0;border:2px solid #040a0e;box-shadow:inset 0 -3px 0 #397858;border-radius:0}'+
 '.ttg-bx button.alt{background:#f6c66a;box-shadow:inset 0 -3px 0 #a07a2a}'+
 '.ttg-bx button.dim{background:#3b4a4f;color:#f5edcf;box-shadow:inset 0 -3px 0 #232e32}'+
 '.ttg-bx button.bad{background:#e34e48;color:#fff;box-shadow:inset 0 -3px 0 #741e2b}'+
 '.ttg-bx button:disabled{opacity:.5}'+
 '.ttg-bx .row{display:grid;grid-template-columns:1fr 1fr;gap:6px}'+
 '.ttg-bx .n{font-size:15px;color:#b7bda9;margin-top:8px;line-height:1.15}'+
 '.ttg-bx label{display:block;font-size:16px;margin:4px 0;text-align:left}'+
 '#lg-msg,#ap-msg,#nk-msg,#nc-msg{min-height:20px;font-size:17px;color:#ff8a7a;margin:2px 0}'+
 '#ap-msg{color:#72e4b0}'+
 '#nk-msg,#nc-msg{color:#ff8a7a}'+
 '#ttg-acc{position:fixed;left:10px;bottom:calc(12px + env(safe-area-inset-bottom,0px));z-index:60;display:none;font-family:"VT323",monospace;font-size:18px;color:#f5edcf;background:#14272d;border:2px solid #f6c66a;padding:3px 9px;cursor:pointer;box-shadow:0 2px 0 #040a0e;border-radius:0;max-width:46vw;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '#ttg-warn{position:fixed;left:0;right:0;top:0;z-index:210;display:none;padding:8px 12px;text-align:center;font-family:"VT323",monospace;font-size:19px;color:#fff;background:#a72f42;border-bottom:2px solid #040a0e}'+
 '#ttg-warn button{font:inherit;margin-left:8px;padding:1px 8px;cursor:pointer}';
 document.head.appendChild(s)}

/* ---------- băm mật khẩu ---------- */
async function hpw(pw,salt,alg){
  const s=salt+':'+pw;
  if(alg==='s'){
    if(!(window.crypto&&crypto.subtle))throw new Error('nosubtle');
    const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));
    return Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('')}
  let h1=0xdeadbeef,h2=0x41c6ce57;
  for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return(4294967296*(2097151&h2)+(h1>>>0)).toString(16)}
const bestAlg=()=>(window.crypto&&crypto.subtle)?'s':'c';
const normName=n=>n.trim().replace(/\s+/g,' ');
const keyOf=n=>normName(n).toLowerCase();
const nameOk=n=>/^[\p{L}\p{N}_ ]{3,20}$/u.test(normName(n));   /* chỉ dùng cho ĐĂNG NHẬP: giữ tương thích tài khoản cũ */

/* ---------- GIỚI HẠN KÝ TỰ (sửa số ở đây) ---------- */
const ACC_MIN=4,ACC_MAX=16;      /* tài khoản MỚI: a-z, 0-9, _ ; không dấu, không dấu cách */
const PW_MIN=6,PW_MAX=32;        /* mật khẩu MỚI */
const NICK_MIN=3,NICK_MAX=16;    /* biệt danh: chữ cái Latin (có dấu tiếng Việt), số 0-9, dấu cách */
/* ===== ĐỔI BIỆT DANH: GIÁ TĂNG DẦN (sửa số ở đây) =====
   Lần đổi thứ n (n bắt đầu từ 0) tốn  NC_BASE * NC_MULT^n  xu, tối đa NC_MAX.  Mặc định: 1.000 -> 2.000 -> 4.000 -> 8.000 -> 16.000 ... */
const NC_BASE=1000,NC_MULT=2,NC_MAX=50000000;
const ncCost=n=>Math.min(NC_MAX,Math.round(NC_BASE*Math.pow(NC_MULT,n)));
const fmtN=n=>Number(n).toLocaleString('vi-VN');
let nickChanges=0;           /* số lần đã đổi biệt danh (lưu trong bản lưu: g.nc) */
const NICK_BAD=/admin|qtv|gamemaster|hethong|system|moderator|thuthangioi/;   /* chặn mạo danh (chỉ chặn ở phía game) */
const accErr=n=>{n=n.trim();
  if(!/^[A-Za-z0-9_]*$/.test(n))return 'Tài khoản chỉ dùng a-z, 0-9 và _ (không dấu, không dấu cách).';
  if(n.length<ACC_MIN||n.length>ACC_MAX)return 'Tài khoản dài '+ACC_MIN+'–'+ACC_MAX+' ký tự.';return ''};
const nickNorm=n=>n.trim().replace(/\s+/g,' ');
const nickKey=n=>nickNorm(n).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]/g,'');
const nickErr=n=>{n=nickNorm(n);
  if(n.length<NICK_MIN||n.length>NICK_MAX)return 'Biệt danh dài '+NICK_MIN+'–'+NICK_MAX+' ký tự.';
  if(!/^[\p{Script=Latin}0-9 ]+$/u.test(n))return 'Biệt danh chỉ dùng chữ cái, số và dấu cách (không ký tự đặc biệt/emoji).';
  const k=nickKey(n);
  if(k.length<NICK_MIN)return 'Biệt danh cần ít nhất '+NICK_MIN+' chữ hoặc số.';
  if(NICK_BAD.test(k))return 'Biệt danh này không được dùng.';return ''};

/* ====================== CHỤP / KHÔI PHỤC TRẠNG THÁI ====================== */
function zoneIdx(){
  const t=($s('btn-zone')||{}).textContent||'';
  const i=VAN_KIEP_ZONES.findIndex(z=>t.includes(z.name));return i<0?0:i}
function huntOn(){const b=$s('btn-hunt');return b?/BẬT/.test(b.textContent):true}
function eligible(){
  if(!chosen)return false;                                            /* chưa chọn trứng: chưa có gì để lưu */
  if(window.REBIRTH&&(REBIRTH.on||REBIRTH.fx))return false;           /* đang trong màn Tái Sinh: giữ bản lưu trước đó */
  return true}
function snap(){
  const g={
    level,exp,age,gold,fame,fameSeason:(typeof fameSeason!=='undefined'?fameSeason:0),hatched,hatchAge,chosen,eggQ,rolls,rerollLeft,hist:hist.slice(),
    taps,tapsNeed,pet:hatched?pet:null,
    bag:bag.map(s=>({id:s.id,n:s.n})),
    eqWorn,ebag,eqUid,
    buffs:Object.assign({},buffs),
    shop:{stock:Object.assign({},shopStock),next:shopNextAt},
    zone:zoneIdx(),hunt:huntOn(),off:{t0:offSt.t0,used:offSt.used},nc:nickChanges,
    arenaTickets:(typeof arenaTickets!=='undefined'?arenaTickets:10),
    arenaTicketAt:(typeof arenaTicketAt!=='undefined'?arenaTicketAt:0)
  };
  return{v:VER,t:Date.now(),tab:TAB,g}}
const validPet=p=>p&&BL[p.bl]&&Number.isInteger(p.sp)&&p.sp>=0&&p.sp<17&&p.pi>=0&&p.pi<5&&p.q>=0&&p.q<5&&p.base&&['hp','atk','def','spd','mag'].every(k=>isFinite(p.base[k]));
const validEq=it=>(it&&Number.isInteger(it.z)&&it.z>=0&&it.z<VAN_KIEP_ZONES.length&&Number.isInteger(it.s)&&it.s>=0&&it.s<4&&Number.isInteger(it.q)&&it.q>=0&&it.q<5&&Array.isArray(it.L)&&isFinite(it.uid))?it:null;

function parseSave(raw){
  if(!raw)return null;
  try{const d=JSON.parse(raw);
    if(!d||typeof d!=='object'||!d.g||typeof d.g!=='object')return null;
    if(d.v>VER)return null;               /* file từ bản game mới hơn */
    return d}catch(_){return null}}

function restore(d){
  const g=d.g;
  nickChanges=clampI(g.nc,0,999);
  level=clampI(g.level,1,MAXLV);exp=Math.max(0,num(g.exp));age=Math.max(0,clampI(g.age,0,1e9));
  gold=Math.max(0,Math.floor(num(g.gold,50)));fame=Math.max(0,Math.floor(num(g.fame)));fameSeason=Math.max(0,Math.floor(num(g.fameSeason,0)));
  arenaTickets=Math.max(0,Math.min(10,Math.floor(num(g.arenaTickets,10))));
  arenaTicketAt=Math.max(0,Math.floor(num(g.arenaTicketAt,0)));
  rolls=clampI(g.rolls,0,1e9);rerollLeft=clampI(g.rerollLeft,0,99);
  hist=Array.isArray(g.hist)?g.hist.filter(q=>q>=0&&q<5).slice(0,3):[];
  eggQ=clampI(g.eggQ,0,4);
  $s('h-age').textContent=age;

  if(g.hatched&&validPet(g.pet)){
    chosen=true;hatched=true;hatchAge=clampI(g.hatchAge,0,1e9);pet=g.pet;pet.up=clampI(pet.up,0,UP_MAX);
    gs=growthOf(level);lastTick=Date.now();
    $s('s-pick').style.display='none';$s('s-egg').style.display='none';
    $s('main-title').textContent='Sảnh Chính';
    ['train','arena','shop'].forEach(k=>{const b=$s('btn-'+k);b.disabled=false;b.classList.remove('locked')});
    const rb=$s('btn-rebirth');if(rb){rb.disabled=false;rb.classList.remove('locked')}
    updateStage();$s('banner').textContent=STAGES[stageOf(level)][1];
  }else if(g.chosen){
    chosen=false;hatched=false;confirmEgg();                           /* sang màn ấp trứng như bình thường */
    tapsNeed=clampI(g.tapsNeed,5,8);taps=clampI(g.taps,0,tapsNeed-1);
    prog=Math.min(CRK.length,Math.ceil(taps/tapsNeed*CRK.length));
    $s('beads').innerHTML=Array.from({length:tapsNeed},(_,i)=>'<div class="bead'+(i<taps?' on':'')+'"></div>').join('');
    if(taps>0)$s('mission').textContent='Vỏ trứng nứt thêm... ('+taps+'/'+tapsNeed+')';
    age=Math.max(0,age)}
  renderExp();stats();

  try{ /* balo */
    if(Array.isArray(g.bag)){
      bag=g.bag.filter(s=>s&&typeof s.id==='string'&&ITEMS[s.id]&&num(s.n)>0).map(s=>({id:s.id,n:Math.min(STACK,Math.floor(s.n))})).slice(0,BAG_SLOTS);
      bagSel=-1;renderBag()}
  }catch(e){console.warn('[save] balo',e)}
  try{ /* trang bị */
    const w=Array.isArray(g.eqWorn)?g.eqWorn:[];
    eqWorn=[0,1,2,3].map(i=>{const it=validEq(w[i]);return it&&it.s===i?it:null});
    ebag=(Array.isArray(g.ebag)?g.ebag:[]).map(validEq).filter(Boolean).slice(0,EQ_BAG);
    const mx=[].concat(eqWorn,ebag).reduce((a,it)=>it?Math.max(a,it.uid):a,0);
    eqUid=Math.max(clampI(g.eqUid,1,1e9),mx+1);eqSel=null;renderEquip();
  }catch(e){console.warn('[save] trang bị',e)}
  try{ /* thuốc buff */
    Object.keys(buffs).forEach(k=>{buffs[k]=Math.max(0,clampI(g.buffs&&g.buffs[k],0,9999))})
  }catch(e){console.warn('[save] buff',e)}
  try{ /* cửa hàng */
    if(g.shop){Object.keys(shopStock).forEach(k=>{if(g.shop.stock&&isFinite(g.shop.stock[k]))shopStock[k]=clampI(g.shop.stock[k],0,999)});
      if(isFinite(g.shop.next))shopNextAt=g.shop.next}
  }catch(e){console.warn('[save] shop',e)}
  try{ /* vùng + săn boss (nằm trong IIFE của 06-mobs nên đi qua giao diện) */
    if(hatched){
      const el=document.querySelector('#zone-list [data-z="'+clampI(g.zone,0,VAN_KIEP_ZONES.length-1)+'"]');if(el)el.click();
      if(huntOn()!==!!g.hunt){const hb=$s('btn-hunt');if(hb)hb.click()}}
  }catch(e){console.warn('[save] vùng',e)}
}

/* ====================== THƯỞNG NGOẠI TUYẾN ====================== */
const fmtDur=s=>{s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+' giờ '+m+' phút':m?m+' phút':s+' giây'};
function offline(sec){
  if(!OFF_ON||!hatched||!pet||!srv||sec<OFF_MIN_SEC)return;   /* khách / không lấy được giờ máy chủ: KHÔNG có thưởng ngoại tuyến */
  const now=srv.now;                                        /* giờ máy chủ, không phụ thuộc đồng hồ điện thoại */
  if(now-offSt.t0>=OFF_WINDOW_MS||offSt.t0>now+60000){offSt.t0=now;offSt.used=0}   /* sang chu kỳ 24 giờ mới (đồng hồ bị chỉnh lùi thì KHÔNG reset) */
  const left=Math.max(0,OFF_DAILY_H*3600-offSt.used),s=Math.min(sec,OFF_MAX_H*3600,left);
  const resetIn=Math.max(0,offSt.t0+OFF_WINDOW_MS-now)/1000;
  if(s<OFF_MIN_SEC){
    log('🌙 Bạn vắng <b>'+fmtDur(sec)+'</b> nhưng thú đã tu luyện đủ hạn mức ngoại tuyến hôm nay. Làm mới sau <b>'+fmtDur(resetIn)+'</b>.');return}
  offSt.used+=s;
  const wins=Math.floor(s/OFF_SEC_PER_WIN);
  const zb=VAN_KIEP_ZONE_BOUNDS[zoneIdx()],lv=zb.start+1,sp=spOfPet();
  const ex=Math.round(wins*(14+lv*.9)*(1+(pet.sp===15?sp.v/100:0)));
  const gd=Math.round(wins*(6+lv*.4)*(1+(pet.sp===5?sp.v/100:0)));
  age+=Math.floor(s/(TICK.hatched/1000));$s('h-age').textContent=age;
  gold+=gd;stats();
  const rest=Math.max(0,OFF_DAILY_H*3600-offSt.used),why=sec>s?' (tính '+fmtDur(s)+')':'';
  log('🌙 Bạn vắng mặt <b>'+fmtDur(sec)+'</b>'+why+'. Thú tự tu luyện ~'+wins+' trận, Xu +'+gd+', EXP +'+ex+'. Hạn mức ngoại tuyến còn <b>'+fmtDur(rest)+'</b>.');
  if(typeof popToast==='function')popToast('🌙 CHÀO MỪNG TRỞ LẠI','Vắng <b>'+fmtDur(sec)+'</b>'+why+' · thú tự tu luyện ~'+wins+' trận<br>Xu <b>+'+gd+'</b> · EXP <b>+'+ex+'</b><br><small>Hạn mức ngoại tuyến còn '+fmtDur(rest)+'</small>','ok');
  addExp(ex)}

/* ====================== LƯU ====================== */
function warn(html){
  let w=$s('ttg-warn');if(!w){w=document.createElement('div');w.id='ttg-warn';document.body.appendChild(w)}
  w.innerHTML=html;w.style.display=html?'block':'none'}
/* Chống 2 tab cùng ghi đè: mỗi bản lưu mang mã tab + thời điểm. Tab nào thấy bản lưu MỚI HƠN do tab khác ghi thì tự khóa (không ghi nữa). */
function conflict(){
  if(locked)return;locked=true;
  warn('⚠️ Tài khoản này vừa được lưu từ tab/thiết bị khác nên tab này đã NGỪNG lưu (tránh ghi đè). <button onclick="location.reload()">Tải lại</button>')}
function save(){
  if(!user||noSave||locked||!eligible())return false;
  const cur=parseSave(readSave(KEYU));
  if(cur&&cur.tab&&cur.tab!==TAB&&num(cur.t)>knownT){conflict();return false}
  let sn,s;try{sn=snap();s=JSON.stringify(sn)}catch(e){console.error('[save]',e);return false}
  if(!writeSave(KEYU,s)){if(!storageBad){storageBad=true;warn('⚠️ Trình duyệt không cho lưu (đầy bộ nhớ hoặc đang ở chế độ ẩn danh). Hãy dùng 📤 Xuất file để giữ tiến trình.')}return false}
  if(storageBad){storageBad=false;warn('')}
  knownT=sn.t;lastSave=sn.t;cloudPush();refreshAcc();return true}
function sched(){clearTimeout(saveT);saveT=setTimeout(save,2000)}

/* ====================== GIAO DIỆN TÀI KHOẢN ====================== */
function refreshAcc(){
  const b=$s('ttg-acc');if(b)b.textContent='👤 '+(user?user.name:'');
  const t=$s('ap-last');if(t)t.textContent=lastSave?'Lưu lần cuối: '+new Date(lastSave).toLocaleTimeString('vi-VN'):'Chưa lưu lần nào trong phiên này'}
function buildAcc(){
  if($s('ttg-acc'))return;
  const b=document.createElement('button');b.id='ttg-acc';b.type='button';b.onclick=openPanel;document.body.appendChild(b);b.style.display='block';
  const p=document.createElement('div');p.id='ttg-accp';
  p.innerHTML='<div class="ttg-bx"><div class="t" id="ap-name"></div><div class="s" id="ap-last"></div><div id="ap-msg"></div>'+
   '<button class="alt" id="ap-save">💾 Lưu ngay</button>'+
   '<button id="ap-nick">✏️ Đổi biệt danh</button>'+
   '<div class="row"><button id="ap-exp">📤 Xuất file</button><button id="ap-imp">📥 Nhập file</button></div>'+
   '<button class="dim" id="ap-out">🚪 Đổi tài khoản / Đăng xuất</button>'+
   '<button class="bad" id="ap-del">🗑️ Xóa dữ liệu & chơi lại</button>'+
   '<button class="dim" id="ap-close">Đóng</button>'+
   '<input type="file" id="ap-file" accept=".json,application/json" style="display:none">'+
   '<div class="n">Tiến trình luôn lưu trên máy này; lên máy chủ tự động khoảng mỗi 5 phút. <b>Hãy bấm 💾 Lưu ngay trước khi thoát game hoặc đổi máy.</b> Chơi khách thì chỉ lưu trên máy này (dùng Xuất/Nhập file để chuyển).</div></div>';
  document.body.appendChild(p);
  p.addEventListener('click',e=>{if(e.target===p)closePanel()});
  $s('ap-close').onclick=closePanel;
  $s('ap-save').onclick=()=>{
    if(!save()){msg('⚠️ Chưa lưu được (xem thông báo trên cùng).');return}
    if(!db||!user||user.key===GUEST){msg('✅ Đã lưu trên máy này.');return}
    if(Date.now()-pushAt<8000){msg('✅ Đã lưu lên máy chủ.');return}   /* bấm dồn dập: không ghi lặp */
    const b=$s('ap-save');b.disabled=true;msg('Đang lưu lên máy chủ...');
    flushCloud(0).then(()=>{msg(cloudBad?'⚠️ Đã lưu trên máy, nhưng CHƯA lên được máy chủ (mất mạng hoặc máy chủ hết lượt hôm nay).':'✅ Đã lưu lên máy chủ.')}).then(()=>{b.disabled=false})};
  $s('ap-nick').onclick=openNickChange;
  $s('ap-exp').onclick=exportSave;
  $s('ap-imp').onclick=()=>$s('ap-file').click();
  $s('ap-file').onchange=importSave;
  $s('ap-out').onclick=logout;
  $s('ap-del').onclick=wipe;
  refreshAcc()}
function openNickChange(){
  if(!user||user.key===GUEST||!db)return;
  closePanel();
  let o=$s('ttg-nc');
  if(!o){
    o=document.createElement('div');o.id='ttg-nc';
    o.innerHTML='<div class="ttg-bx"><div class="t">Đổi biệt danh</div><div class="s" id="nc-cur"></div>'+
     '<input type="text" id="nc-in" placeholder="Biệt danh mới" maxlength="'+NICK_MAX+'" autocomplete="off" autocapitalize="words" spellcheck="false">'+
     '<div class="n" id="nc-cnt"></div><div id="nc-msg"></div>'+
     '<div class="n" id="nc-fee" style="font-size:18px;color:#f6c66a;margin:4px 0 8px"></div>'+
     '<button class="alt" id="nc-ok">Xác nhận đổi</button><button class="dim" id="nc-x">Hủy</button>'+
     '<div class="n">'+NICK_MIN+'–'+NICK_MAX+' ký tự: chữ (có dấu được), số, dấu cách. Không được trùng người khác. Mỗi lần đổi, giá lần sau sẽ tăng.</div></div>';
    document.body.appendChild(o);
    o.addEventListener('click',e=>{if(e.target===o)o.classList.remove('show')});
    $s('nc-x').onclick=()=>o.classList.remove('show');
    o.addEventListener('keydown',e=>e.stopPropagation());o.addEventListener('keyup',e=>e.stopPropagation())}
  const inp=$s('nc-in'),ok=$s('nc-ok'),nm=h=>{$s('nc-msg').textContent=h},cnt=()=>{$s('nc-cnt').textContent=nickNorm(inp.value).length+'/'+NICK_MAX};
  const fee=()=>{const c=ncCost(nickChanges);$s('nc-fee').innerHTML='Phí: <b>'+fmtN(c)+' xu</b> · Bạn có: <b>'+fmtN(gold)+' xu</b>'};
  $s('nc-cur').textContent='Hiện tại: '+user.name;
  inp.value='';nm('');cnt();fee();
  inp.oninput=()=>{nm('');cnt()};
  inp.onkeydown=e=>{if(e.key==='Enter')ok.click()};
  ok.onclick=async()=>{
    const n=nickNorm(inp.value),er=nickErr(n);if(er){nm(er);return}
    if(n===user.name){nm('Trùng với biệt danh hiện tại.');return}
    const cost=ncCost(nickChanges);fee();
    if(gold<cost){nm('Không đủ xu: cần '+fmtN(cost)+', bạn có '+fmtN(gold)+'.');return}
    ok.disabled=true;nm('Đang kiểm tra...');
    gold-=cost;stats();                       /* trừ trước, lỗi thì hoàn lại -> tắt giữa chừng cũng không đổi được miễn phí */
    try{
      await changeNick(user.key,n);
      nickChanges++;user.name=n;
      if(window.TTGNET&&TTGNET.setName)TTGNET.setName(n);
      refreshAcc();save();cloudPush(true);
      o.classList.remove('show');
      log('✏️ Đã đổi biệt danh thành <b>'+esc2(n)+'</b> (−'+fmtN(cost)+' xu). Lần đổi sau: '+fmtN(ncCost(nickChanges))+' xu.');
      if(typeof popToast==='function')popToast('✏️ ĐỔI BIỆT DANH','Biệt danh mới: <b>'+esc2(n)+'</b><br>Xu <b>−'+fmtN(cost)+'</b>','ok')
    }catch(e){
      gold+=cost;stats();
      nm(e&&e.message==='taken'?'Biệt danh này đã có người dùng, chọn tên khác. (Chưa bị trừ xu)':e&&e.code==='permission-denied'?'Biệt danh vừa bị người khác lấy, hoặc chưa mở quyền trên máy chủ (xem FIRESTORE_RULES_NICK.txt). Chưa bị trừ xu.':'Không kết nối được, thử lại. (Chưa bị trừ xu)')}
    ok.disabled=false};
  o.classList.add('show');setTimeout(()=>{try{inp.focus()}catch(_){}},50)}
const esc2=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const msg=h=>{const m=$s('ap-msg');if(m)m.innerHTML=h};
function refreshNickBtn(){
  const b=$s('ap-nick');if(!b||!user)return;
  b.style.display=user.key===GUEST?'none':'block';
  b.textContent='✏️ Đổi biệt danh · '+fmtN(ncCost(nickChanges))+' xu'}
function openPanel(){save();$s('ap-name').textContent=user.name+(user.key===GUEST?' (khách)':'');msg('');refreshAcc();refreshNickBtn();$s('ttg-accp').classList.add('show')}
function closePanel(){$s('ttg-accp').classList.remove('show')}

function exportSave(){
  save();const raw=readSave(KEYU);
  if(!raw){msg('<span style="color:#ff8a7a">Chưa có gì để xuất (hãy chọn trứng trước).</span>');return}
  const blob=new Blob([raw],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(blob);a.download='thu-than-gioi-'+(user.key===GUEST?'khach':keyOf(user.name).replace(/[^\p{L}\p{N}_-]+/gu,'-'))+'.json';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000);msg('✅ Đã tải file lưu.')}
function importSave(ev){
  const f=ev.target.files&&ev.target.files[0];ev.target.value='';if(!f)return;
  const r=new FileReader();
  r.onload=()=>{
    const d=parseSave(String(r.result));
    if(!d){msg('<span style="color:#ff8a7a">File không hợp lệ hoặc từ bản game mới hơn.</span>');return}
    if(!confirm('Nhập file sẽ GHI ĐÈ tiến trình hiện tại của "'+user.name+'". Tiếp tục?'))return;
    noSave=true;const prev=readSave(KEYU);if(prev)LS.set(P+'undo_'+KEYU,prev);
    if(!LS.set(kSave(KEYU),JSON.stringify(Object.assign(d,{t:Date.now()})))){noSave=false;msg('<span style="color:#ff8a7a">Không ghi được vào bộ nhớ trình duyệt.</span>');return}
    location.reload()};
  r.onerror=()=>msg('<span style="color:#ff8a7a">Không đọc được file.</span>');
  r.readAsText(f)}
async function logout(){
  save();noSave=true;LS.del(P+'session');
  try{if(unsub)unsub();await Promise.race([cloudPush(true),new Promise(r=>setTimeout(r,4000))]);if(auth)await auth.signOut()}catch(_){}
  location.reload()}
async function wipe(){
  if(!confirm('XÓA toàn bộ tiến trình của "'+user.name+'"? Không thể hoàn tác.'))return;
  noSave=true;LS.del(kSave(KEYU));LS.del(kBak(KEYU));
  try{if(unsub)unsub();if(db&&user.key!==GUEST)await docRef(KEYU).delete()}catch(_){}
  location.reload()}

/* ====================== MÀN ĐĂNG NHẬP ====================== */
function showLogin(){
  let o=$s('ttg-login');
  if(!o){
    o=document.createElement('div');o.id='ttg-login';
    o.innerHTML='<div class="ttg-bx"><div class="t">Thú Thần Giới</div><div class="s">Đăng nhập để lưu tiến trình</div>'+
     '<input type="text" id="lg-name" placeholder="Tài khoản (a-z, 0-9, _)" maxlength="20" autocomplete="username" autocapitalize="off" spellcheck="false">'+
     '<input type="password" id="lg-pw" placeholder="Mật khẩu (6–32 ký tự)" autocomplete="current-password">'+
     '<div id="lg-msg"></div>'+
     '<label id="lg-mig" style="display:none"><input type="checkbox" id="lg-mg" checked> Mang tiến trình chơi khách sang tài khoản mới</label>'+
     '<div class="row"><button id="lg-in">Đăng nhập</button><button class="alt" id="lg-reg">Đăng ký</button></div>'+
     '<button class="dim" id="lg-guest">Chơi khách</button>'+
     '<div class="n">Đăng ký mới: tài khoản '+ACC_MIN+'–'+ACC_MAX+' ký tự a-z, 0-9, _ (không dấu, không cách); sau đó bạn sẽ đặt biệt danh. Chơi khách chỉ lưu trên máy này.</div></div>';
    document.body.appendChild(o);
    const go=fn=>()=>{const b=[$s('lg-in'),$s('lg-reg'),$s('lg-guest')];b.forEach(x=>x.disabled=true);fn().catch(e=>lmsg(e&&e.message==='nosubtle'?'Trình duyệt cần https/localhost để kiểm tra mật khẩu.':'Có lỗi, thử lại.')).finally(()=>b.forEach(x=>x.disabled=false))};
    $s('lg-in').onclick=go(doLogin);$s('lg-reg').onclick=go(doRegister);$s('lg-guest').onclick=go(async()=>{begin(GUEST,'Khách')});
    [$s('lg-name'),$s('lg-pw')].forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')$s('lg-in').click()}))}
  $s('lg-mig').style.display=parseSave(readSave(GUEST))?'block':'none';
  o.classList.add('show');setTimeout(()=>{try{$s('lg-name').focus()}catch(_){}},50)}
const lmsg=h=>{const m=$s('lg-msg');if(m)m.textContent=h};
function askNick(u){   /* bước bắt buộc: đặt biệt danh (tài khoản mới, hoặc tài khoản cũ chưa có) */
  return new Promise(res=>{
    let o=$s('ttg-nick');
    if(!o){
      o=document.createElement('div');o.id='ttg-nick';
      o.innerHTML='<div class="ttg-bx"><div class="t">Đặt biệt danh</div><div class="s">Tên hiển thị khi chat & xếp hạng</div>'+
       '<input type="text" id="nk-in" placeholder="Biệt danh" maxlength="'+NICK_MAX+'" autocomplete="off" autocapitalize="words" spellcheck="false">'+
       '<div class="n" id="nk-cnt"></div><div id="nk-msg"></div>'+
       '<button class="alt" id="nk-ok">Xác nhận</button><button class="dim" id="nk-out">Đăng xuất</button>'+
       '<div class="n">'+NICK_MIN+'–'+NICK_MAX+' ký tự: chữ (có dấu được), số, dấu cách. Không được trùng người khác. Đã đặt thì chưa đổi được, hãy chọn kỹ.</div></div>';
      document.body.appendChild(o)}
    const inp=$s('nk-in'),ok=$s('nk-ok'),nm=h=>{$s('nk-msg').textContent=h},cnt=()=>{$s('nk-cnt').textContent=nickNorm(inp.value).length+'/'+NICK_MAX};
    inp.value='';nm('');cnt();inp.oninput=()=>{nm('');cnt()};
    inp.onkeydown=e=>{if(e.key==='Enter')ok.click()};
    ok.onclick=async()=>{
      const n=nickNorm(inp.value),er=nickErr(n);if(er){nm(er);return}
      ok.disabled=true;nm('Đang kiểm tra...');
      try{await claimNick(u.uid,n);o.classList.remove('show');res(n)}
      catch(e){nm(e&&e.message==='taken'?'Biệt danh này đã có người dùng, chọn tên khác.':e&&e.code==='permission-denied'?'Biệt danh vừa bị người khác lấy, hoặc chưa mở quyền trên máy chủ (xem FIRESTORE_RULES.txt).':'Không kết nối được, thử lại.')}
      ok.disabled=false};
    $s('nk-out').onclick=async()=>{LS.del(P+'session');try{await auth.signOut()}catch(_){}location.reload()};
    o.classList.add('show');setTimeout(()=>{try{inp.focus()}catch(_){}},50)})}
async function enter(u){
  lmsg('Đang tải hồ sơ...');
  let nick='';
  try{nick=await loadNick(u.uid);if(nick)LS.set(P+'nick_'+u.uid,nick)}
  catch(e){   /* máy chủ hết lượt trong ngày -> vẫn cho vào game bằng biệt danh đã nhớ trên máy */
    const c=e&&e.code==='resource-exhausted'?LS.get(P+'nick_'+u.uid):'';
    if(!c)throw e;
    nick=c;console.warn('[nick] máy chủ hết lượt, dùng biệt danh đã nhớ',e)}                       /* lỗi (mất mạng / chưa mở quyền) -> ném ra để hiện ở màn đăng nhập */
  if(!nick){const ov=$s('ttg-login');if(ov)ov.classList.remove('show');lmsg('');nick=await askNick(u)}
  lmsg('Đang tải tiến trình...');
  srv=null;
  try{srv=await srvTime(u.uid)}catch(e){console.warn('[cloud] time',e)}   /* phải lấy TRƯỚC pull (pull có thể đẩy lên và ghi đè mốc cũ) */
  try{await pull(u.uid)}catch(e){console.warn('[cloud] pull',e);warn('⚠️ Không tải được từ máy chủ, đang dùng bản lưu trên máy này.')}
  user=null;KEYU='';begin(u.uid,nick)}
async function doLogin(){
  const n=$s('lg-name').value,pw=$s('lg-pw').value;lmsg('');
  if(!nameOk(n)){lmsg('Tên 3–20 ký tự (chữ, số, gạch dưới, dấu cách).');return}
  if(!fbInit()){lmsg('Chưa cấu hình máy chủ (FB_CONFIG). Bạn vẫn có thể Chơi khách.');return}
  try{const cr=await auth.signInWithEmailAndPassword(await emailOf(n),pw);await enter(cr.user)}catch(e){lmsg(authErr(e))}}
async function doRegister(){
  const n=$s('lg-name').value,pw=$s('lg-pw').value;lmsg('');
  const ae=accErr(n);if(ae){lmsg(ae);return}
  if(pw.length<PW_MIN||pw.length>PW_MAX){lmsg('Mật khẩu dài '+PW_MIN+'–'+PW_MAX+' ký tự.');return}
  if(pw.toLowerCase()===n.trim().toLowerCase()){lmsg('Mật khẩu không được trùng tên tài khoản.');return}
  if(!fbInit()){lmsg('Chưa cấu hình máy chủ (FB_CONFIG). Bạn vẫn có thể Chơi khách.');return}
  try{
    const cr=await auth.createUserWithEmailAndPassword(await emailOf(n),pw);
    if($s('lg-mig').style.display!=='none'&&$s('lg-mg').checked){const g0=readSave(GUEST);if(g0){LS.set(kSave(cr.user.uid),g0);LS.del(kSave(GUEST));LS.del(kBak(GUEST))}}
    await enter(cr.user)}catch(e){lmsg(authErr(e))}}

/* ====================== KHỞI ĐỘNG ====================== */
function showSaveNotice(){   /* bảng thông báo khẩn khi vừa vào game: nhắc lưu trước khi thoát. Sửa chữ ngay dưới đây. */
  if(!NOTICE_ON||$s('ttg-notice'))return;
  const guest=!user||user.key===GUEST;
  const body=guest
    ?'Bạn đang chơi <b style="color:#f6c66a">KHÁCH</b>: tiến trình chỉ lưu trên trình duyệt này, xóa dữ liệu trình duyệt là <b style="color:#ff8a7a">MẤT HẾT</b>.<br><br>👉 Hãy <b>đăng ký tài khoản</b> hoặc bấm 👤 → 📤 Xuất file để giữ tiến trình.'
    :'Game tự đồng bộ lên máy chủ <b>khoảng mỗi 5 phút</b>.<br><br>👉 Hãy bấm nút <b>👤</b> (góc trái dưới) → <b style="color:#f6c66a">💾 Lưu ngay</b> <b>TRƯỚC KHI THOÁT GAME</b> hoặc đổi sang máy khác, để không mất <b>tiến trình / thú / xu / vật phẩm vừa nhận gần nhất</b>.<br><br>Trên máy này, game vẫn tự lưu liên tục.';
  const o=document.createElement('div');o.id='ttg-notice';
  o.innerHTML='<div class="ttg-bx"><div class="t">📢 THÔNG BÁO KHẨN</div><div class="s">Đọc trước khi chơi</div>'+
    '<div style="font-size:21px;line-height:1.2;text-align:left;margin:6px 0 10px">'+body+'</div>'+
    '<button class="alt" id="nt-ok">Đã hiểu</button></div>';
  document.body.appendChild(o);
  $s('nt-ok').onclick=()=>o.remove();
  setTimeout(()=>{if(o.parentNode)o.classList.add('show')},700)}
function begin(key,name){
  user={key,name};KEYU=key;LS.set(P+'session',key);
  const ov=$s('ttg-login');if(ov)ov.classList.remove('show');
  let d=parseSave(readSave(key));
  if(!d){const b=parseSave(readBak(key));if(b){d=b;log('⚠️ Bản lưu chính bị lỗi, đã khôi phục từ bản dự phòng.')}}
  knownT=num(d&&d.t,0);
  if(d&&d.g&&d.g.off&&isFinite(d.g.off.t0)&&isFinite(d.g.off.used))offSt={t0:d.g.off.t0,used:Math.max(0,d.g.off.used)};
  if(d){
    try{restore(d);log('💾 Đã tải tiến trình của <b>'+name+'</b>.');offline(srv&&srv.last?(srv.now-srv.last)/1000:0)}
    catch(e){console.error('[save] khôi phục lỗi',e);noSave=true;warn('⚠️ Không đọc được bản lưu (có thể bị hỏng). Tab này sẽ KHÔNG ghi đè. <button onclick="location.reload()">Thử lại</button>')}
  }else if(readSave(key)){noSave=true;warn('⚠️ Bản lưu bị hỏng và không có bản dự phòng. Tab này sẽ KHÔNG ghi đè. Bạn có thể Nhập file từ bản xuất trước đó.')}
  else log('👋 Chào <b>'+name+'</b>! Tiến trình sẽ tự động lưu.');
  buildAcc();refreshAcc();if(db&&key!==GUEST)watch();
  try{fbInit();if(db&&window.TTGNET)TTGNET.start({db,uid:key,name,guest:key===GUEST})}catch(e){console.warn('[online]',e)}   /* chat + số người online (20-online.js) */
  try{if(window.checkAdminStatus && key!==GUEST)checkAdminStatus(key)}catch(e){console.warn('[admin]',e)}
  try{if(db&&window.TTGMAIL)TTGMAIL.start({db,uid:key,guest:key===GUEST})}catch(e){console.warn('[mail]',e)}   /* hộp thư (24-mail.js) */
  try{if(window.TTGSEASON&&typeof TTGSEASON.afterLogin==='function')TTGSEASON.afterLogin({uid:key,name:name,guest:key===GUEST})}catch(e){console.warn('[season]',e)} /* vé + reset mùa (25-season.js) */
  const _st=stats;stats=function(){_st.apply(this,arguments);sched()};      /* xu/uy danh đổi -> lưu sau 2 giây */
  setInterval(save,AUTO_MS);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){save();flushCloud(60000)}});
  window.addEventListener('pagehide',()=>{save();flushCloud(60000)});
  window.addEventListener('storage',e=>{ /* tab khác vừa ghi/xóa bản lưu của tài khoản này */
    if(e.key!==kSave(KEYU)||locked)return;
    const d=e.newValue?parseSave(e.newValue):null;
    if(!d||d.tab!==TAB)conflict()});
  window.addEventListener('beforeunload',()=>{save();flushCloud(60000)});
  showSaveNotice()}

window.TTGSAVE={save,snap,get user(){return user},exportSave,wipe,logout};
const ses=LS.get(P+'session');
if(ses===GUEST)begin(GUEST,'Khách');
else if(fbInit()){let first=true;auth.onAuthStateChanged(u=>{if(!first||user)return;first=false;if(u)enter(u).catch(e=>{showLogin();lmsg(authErr(e))});else showLogin()})}
else{showLogin();lmsg('Chưa cấu hình máy chủ — chỉ Chơi khách được.')}
})();
