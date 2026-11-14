/* ===== 45-enh-border.js — [CUONG HOA 1B] Hiệu ứng viền icon trang bị theo cấp cường hóa +e =====
   Chỉ dùng CSS (transform/opacity), KHÔNG vẽ bằng JS mỗi khung hình → kho 100 ô vẫn nhẹ.
   Nạp NGAY SAU 12-equip.js. Không sửa 12-equip.js: bọc renderEquip() và eqItemHtml() rồi thêm class lên ô.
   +0: không hiệu ứng. +1..+10: class "enh enh-N" trên ô (ô đang mặc, ô kho, khung xem chi tiết).
   Vệt sáng chạy quanh viền = 1 lớp <i class="enh-rg"> (viền khoét bằng mask) chứa nền conic-gradient XOAY bằng transform
   (nhẹ hơn và chạy cả máy cũ, không cần @property). Máy không hỗ trợ mask thì chỉ còn viền phát sáng tĩnh/nhấp nháy.
   Lấp lánh từ +7: <i class="enh-sp"> (3 lớp đốm lệch pha). Tôn trọng prefers-reduced-motion (đứng yên, giữ màu).
   Bảng cấp (màu, số vệt, giây/vòng) nằm ở khối CSS bên dưới: .enh-1 … .enh-10 → sửa tại đó.
   Hàm dùng chung cho tab Cường hóa (đợt 5): window.ENHFX.cls(it) / .inner(it) / .decorate(el,it). */
(()=>{
if(typeof renderEquip!=='function'||typeof eqItemHtml!=='function'){console.warn('[enh] thiếu renderEquip/eqItemHtml, bỏ qua hiệu ứng viền');return}
const MAX=(typeof ENH_MAX!=='undefined')?ENH_MAX:10;
const lvOf=it=>{const e=Math.floor(Number(it&&it.e));return isFinite(e)?Math.max(0,Math.min(MAX,e)):0};
const cls=it=>{const e=lvOf(it);return e>0?'enh enh-'+e:''};
const ringHtml=e=>e>0?'<i class="enh-rg"></i>':'';
const sparkHtml=e=>e>=7?'<i class="enh-sp"><s></s></i>':'';
function decorate(el,it){
 if(!el||!it)return;const e=lvOf(it);if(!e)return;
 el.classList.add('enh','enh-'+e);
 el.insertAdjacentHTML('afterbegin',ringHtml(e));
 const sp=sparkHtml(e);if(sp)el.insertAdjacentHTML('beforeend',sp);
 if(el.closest&&el.closest('#eq-bag'))watch(el)}
window.ENHFX={cls,lv:lvOf,decorate,inner:it=>{const e=lvOf(it);return ringHtml(e)+sparkHtml(e)}};

/* ---------- CSS ---------- */
{const s=document.createElement('style');s.id='enh-css';
 s.textContent=
 /* biến theo cấp: --c màu chính, --c2 màu phụ (đuôi vệt), --n số vệt, --d giây/vòng, --gl/--gs độ tỏa/độ dày phát sáng, --sc màu đốm, --td nhịp lấp lánh */
 '.enh-1{--c:#fff;--n:1;--d:3s;--gl:3px;--gs:0px;--ga:.5}'+
 '.enh-2{--c:#fff;--n:1;--d:2.4s;--gl:3px;--gs:0px;--ga:.55}'+
 '.enh-3{--c:#fff;--n:2;--d:2.4s;--gl:4px;--gs:0px;--ga:.6}'+
 '.enh-4{--c:#3aa0ff;--n:2;--d:2s;--gl:6px;--gs:1px}'+
 '.enh-5{--c:#2fe8b4;--n:2;--d:1.8s;--gl:7px;--gs:1px}'+
 '.enh-6{--c:#ffd24a;--n:3;--d:1.6s;--gl:8px;--gs:1px}'+
 '.enh-7{--c:#ff6a2a;--c2:#ff2a2a;--n:3;--d:1.4s;--gl:9px;--gs:1px;--sc:#ffc08a;--td:1.2s}'+
 '.enh-8{--c:#e05cff;--c2:#ff5fa8;--n:3;--d:1.2s;--gl:10px;--gs:2px;--sc:#ffc8f2;--td:.9s}'+
 '.enh-9{--c:#ff4a4a;--n:4;--d:1s;--gl:10px;--gs:2px;--sc:#fff;--td:.7s}'+
 '.enh-10{--c:#ff4a4a;--n:1;--d:1.1s;--gl:12px;--gs:2px;--td:.5s}'+
 /* viền phát sáng (lớp ::after, chỉ vẽ phía ngoài + 1px sát viền; không che icon) */
 '.enh::after{content:"";position:absolute;inset:0;pointer-events:none;box-shadow:0 0 var(--gl,0px) var(--gs,0px) var(--c,#fff),inset 0 0 0 1px var(--c,#fff);opacity:var(--ga,.8)}'+
 '.enh-4::after,.enh-5::after,.enh-6::after{animation:enhPulse 1.6s ease-in-out infinite}'+
 '.enh-7::after,.enh-8::after{animation:enhPulse 1.2s ease-in-out infinite}'+
 '.enh-9::after{animation:enhPulse .9s ease-in-out infinite,enhHue 3s linear infinite}'+
 '.enh-10::after{animation:enhPulse .8s ease-in-out infinite,enhHue 1.6s linear infinite}'+
 /* vệt sáng chạy quanh viền: chỉ hiện khi trình duyệt hỗ trợ mask (nếu không thì lớp này ẩn, KHÔNG che icon) */
 '.enh-rg,.enh-sp{display:none;position:absolute;pointer-events:none;font-style:normal}'+
 '@supports ((-webkit-mask-composite:xor) or (mask-composite:exclude)){'+
  '.enh-rg{display:block;inset:-2px;padding:2px;overflow:hidden;'+
   '-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;'+
   'mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}'+
  '.enh-rg::before{content:"";position:absolute;inset:-25%;'+
   'background:repeating-conic-gradient(transparent 0,transparent calc(68%/var(--n,1)),var(--c2,var(--c,#fff)) calc(88%/var(--n,1)),var(--c,#fff) calc(100%/var(--n,1)));'+
   'animation:enhRot var(--d,2s) linear infinite}'+
  '.enh-9 .enh-rg::before{animation:enhRot var(--d,1s) linear infinite,enhHue 3s linear infinite}'+
  '.enh-10 .enh-rg::before{background:conic-gradient(#ff3b3b,#ffd23b,#3bff5a,#3bf0ff,#3b5aff,#e03bff,#ff3b3b)}'+
 '}'+
 /* lấp lánh từ +7: 3 lớp đốm nhỏ ở mép ô, mỗi lớp lệch pha */
 '.enh-7 .enh-sp,.enh-8 .enh-sp,.enh-9 .enh-sp,.enh-10 .enh-sp{display:block;inset:0;z-index:3;--k1:var(--sc,#fff);--k2:var(--sc,#fff);--k3:var(--sc,#fff)}'+
 '.enh-10 .enh-sp{--k1:#ff5a5a;--k2:#5affd0;--k3:#c06bff;animation:enhHue 1.5s linear infinite}'+
 '.enh-sp::before,.enh-sp::after,.enh-sp s{content:"";position:absolute;inset:0;display:none;text-decoration:none}'+
 '.enh-sp::before{display:block;background:linear-gradient(var(--k1),var(--k1)) 4% 18%/3px 3px no-repeat,linear-gradient(var(--k1),var(--k1)) 96% 40%/3px 3px no-repeat,linear-gradient(var(--k1),var(--k1)) 30% 96%/3px 3px no-repeat;animation:enhTw var(--td,1s) ease-in-out infinite}'+
 '.enh-8 .enh-sp::after,.enh-9 .enh-sp::after,.enh-10 .enh-sp::after{display:block;'+
  'background:linear-gradient(var(--k2),var(--k2)) 70% 4%/3px 3px no-repeat,linear-gradient(var(--k2),var(--k2)) 4% 62%/3px 3px no-repeat,linear-gradient(var(--k2),var(--k2)) 96% 84%/3px 3px no-repeat;'+
  'animation:enhTw var(--td,1s) ease-in-out -.45s infinite}'+
 '.enh-9 .enh-sp s,.enh-10 .enh-sp s{display:block;'+
  'background:linear-gradient(var(--k3),var(--k3)) 40% 4%/3px 3px no-repeat,linear-gradient(var(--k3),var(--k3)) 96% 12%/3px 3px no-repeat,linear-gradient(var(--k3),var(--k3)) 10% 96%/3px 3px no-repeat,linear-gradient(var(--k3),var(--k3)) 62% 96%/3px 3px no-repeat;'+
  'animation:enhTw var(--td,1s) ease-in-out -.25s infinite}'+
 '@keyframes enhRot{to{transform:rotate(360deg)}}'+
 '@keyframes enhPulse{0%,100%{opacity:.4}50%{opacity:1}}'+
 '@keyframes enhTw{0%,100%{opacity:0}50%{opacity:1}}'+
 '@keyframes enhHue{to{filter:hue-rotate(360deg)}}'+
 /* khung xem chi tiết món */
 '.eqpv{position:relative;flex:none;width:40px;height:40px;border:2px solid #4d533b;background:#183036;display:flex;align-items:center;justify-content:center}'+
 '.eqpv .pxi{width:28px;height:28px}'+
 /* ô cuộn ra ngoài khung kho: tạm dừng chuyển động cho nhẹ máy */
 '.enh-off::after,.enh-off .enh-rg::before,.enh-off .enh-sp,.enh-off .enh-sp::before,.enh-off .enh-sp::after,.enh-off .enh-sp s{animation-play-state:paused!important}'+
 /* giảm chuyển động: đứng yên, giữ màu */
 '@media (prefers-reduced-motion:reduce){.enh::after,.enh-rg::before,.enh-sp,.enh-sp::before,.enh-sp::after,.enh-sp s{animation:none!important}}';
 document.head.appendChild(s)}

/* ---------- Chỉ chạy chuyển động cho ô đang nhìn thấy (kho cuộn 100 ô) ---------- */
let io=null;
function watch(el){
 if(typeof IntersectionObserver==='undefined')return;
 if(!io)io=new IntersectionObserver(es=>{for(const x of es)x.target.classList.toggle('enh-off',!x.isIntersecting)},{root:null,threshold:0});
 io.observe(el)}
/* ---------- Gắn class lên ô sau mỗi lần vẽ ---------- */
function enhDecorateAll(){
 const el=document.getElementById('eq-wrap');if(!el)return;
 if(io)io.disconnect();
 el.querySelectorAll('.upslot.eqs').forEach((b,s)=>decorate(b,eqWorn[s]));   /* 4 ô đang mặc (tab Trang bị) */
 const bag=document.getElementById('eq-bag');
 if(bag){const sl=bag.children;for(let i=0;i<sl.length;i++)if(ebag[i])decorate(sl[i],ebag[i])}}   /* ô kho */
{const _re=renderEquip;
 renderEquip=function(){const r=_re.apply(this,arguments);try{enhDecorateAll()}catch(e){console.warn('[enh]',e)}return r}}

/* Khung xem chi tiết / món vừa rèn: thêm ô icon nhỏ có viền hiệu ứng bên trái */
{const _ei=eqItemHtml;
 eqItemHtml=function(it,w){
  const h=_ei.apply(this,arguments);
  if(!it||typeof it!=='object'||!EQ_SLOTS[it.s])return h;
  const e=lvOf(it);
  return'<div style="display:flex;gap:6px;align-items:flex-start"><span class="eqpv'+(e?' enh enh-'+e:'')+'" style="border-color:'+eqRgb(it)+'">'+
   (e?ringHtml(e):'')+eqIco(it.s,it.z)+(e?sparkHtml(e):'')+'</span><div style="min-width:0;flex:1">'+h+'</div></div>'}}

try{renderEquip()}catch(e){}
})();
