/* 63-nhan-nut.js - HIỆU ỨNG NHẤN cho MỌI nút trong game-moi (không còn cứng đơ).
   Nhấn xuống: nút co lại nhanh. Nhả ra: nảy lên quá cỡ một chút rồi lắng về 1 (như lò xo).
   Dùng thuộc tính CSS `scale` (độc lập với `transform`) + Web Animations API => KHÔNG đè lên transform/transition của từng nút.
   Chỉ nạp 1 lần, bắt sự kiện ở cấp document nên nút tạo sau (panel mở sau, danh sách vẽ lại) vẫn có hiệu ứng.

   NÚT VẼ SẴN TRONG ẢNH KHUNG (Ra trận, Thả, Trang Bị, X, Khóa/Vứt ở Balo...): nút thật chỉ là vùng bấm trong suốt nên co nó chẳng thấy gì.
   Với nút trong suốt như vậy, lúc nhấn script tự cắt đúng mảnh ảnh khung nằm dưới nút (ảnh nền của khung cha) thành 1 lớp phủ có viền mờ dần,
   rồi co/nảy lớp đó => thấy chính hình nút bị nhấn. Muốn tự điều khiển: đặt sẵn 1 con .pbk trong nút (xem 54-thu-than.js).
   Muốn nút nào KHÔNG có hiệu ứng: thêm thuộc tính data-nopress.
   API: TTGPRESS.sel (chuỗi selector, có thể thêm), TTGPRESS.off = true để tắt hết. */
(function(){
'use strict';
if(window.TTGPRESS)return;
var SEL='button,[role="button"],.nv,.tt-c,.tt-pr,[data-press]';
var ok=window.CSS&&CSS.supports&&CSS.supports('scale','.9');
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var API=window.TTGPRESS={sel:SEL,off:false};
var DOWN=reduce?.97:.9,UP=reduce?1:1.06;   /* co xuống / nảy lên (hệ số) */
var MINHOLD=70;                            /* nhấn nhanh mấy cũng giữ tối thiểu ~70ms cho kịp thấy */
var cur={};                                /* pointerId -> {btn,t,t0,an} */

var st=document.createElement('style');
st.textContent='.pbk{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;opacity:0;border-radius:inherit;'+
  'background-repeat:no-repeat;-webkit-mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent),linear-gradient(180deg,transparent,#000 9%,#000 91%,transparent);'+
  '-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent,#000 9%,#000 91%,transparent),linear-gradient(180deg,transparent,#000 9%,#000 91%,transparent);mask-composite:intersect}'+
  '.pbk.on{opacity:1;filter:brightness(.86)}';
document.head.appendChild(st);

function disabled(b){return b.disabled||b.getAttribute('aria-disabled')==='true'||b.hasAttribute('data-nopress');}
function hasLook(b,cs){   /* nút có hình riêng (chữ, ảnh con, nền) hay chỉ là vùng bấm trong suốt? */
  if(b.querySelector('img,svg,canvas,i,span,b'))return true;
  if((b.textContent||'').trim())return true;
  if(cs.backgroundImage&&cs.backgroundImage!=='none')return true;
  var m=/rgba?\(([^)]+)\)/.exec(cs.backgroundColor||'');
  if(m){var p=m[1].split(',');if(p.length<4||parseFloat(p[3])>.08)return true;}
  return false;
}
/* tìm khung cha có ảnh nền để cắt mảnh dưới nút */
function frameOf(b){
  for(var p=b.parentElement;p&&p!==document.body;p=p.parentElement){
    var cs=getComputedStyle(p);
    if(cs.backgroundImage&&cs.backgroundImage.indexOf('url(')===0)return {el:p,cs:cs};
  }
  return null;
}
function pbkOf(b){
  var k=b.querySelector(':scope>.pbk');
  if(k)return k;
  var cs=getComputedStyle(b);
  if(hasLook(b,cs))return null;
  var f=frameOf(b);if(!f)return null;
  k=document.createElement('i');k.className='pbk';k.setAttribute('data-auto','1');
  if(cs.position==='static')b.style.position='relative';
  b.appendChild(k);
  return k;
}
/* đặt ảnh nền của lớp .pbk khớp mảnh khung nằm dưới nút (ảnh khung vẽ 100% 100% trong khung cha) */
function fitPbk(b,k){
  if(!k.getAttribute('data-auto'))return;
  var f=frameOf(b);if(!f)return;
  var fr=f.el.getBoundingClientRect(),br=b.getBoundingClientRect();
  k.style.backgroundImage=f.cs.backgroundImage;
  k.style.backgroundSize=fr.width+'px '+fr.height+'px';
  k.style.backgroundPosition=(-(br.left-fr.left))+'px '+(-(br.top-fr.top))+'px';
}
function scaleOf(el){var v=parseFloat(getComputedStyle(el).scale);return isFinite(v)?v:1;}
function anim(el,frames,opt){
  try{return el.animate(frames,opt);}catch(e){return null;}
}
function press(b,id){
  var k=pbkOf(b),tg=k||b,rec;
  if(k){fitPbk(b,k);k.classList.add('on');}
  var w=b.getBoundingClientRect().width;
  var to=w>260?(1-(1-DOWN)*.4):(w>120?(1-(1-DOWN)*.7):DOWN);   /* nút to co ít hơn cho đỡ lố */
  if(k)to=Math.max(to,.94);   /* lớp phủ cắt từ ảnh: co ít để không lộ viền ảnh gốc bên dưới */
  var from=scaleOf(tg);
  if(tg._pa)tg._pa.cancel();
  tg.style.scale=String(from);
  var an=anim(tg,[{scale:from},{scale:to}],{duration:90,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'});
  rec={btn:b,tg:tg,k:k,t0:performance.now(),to:to};
  tg._pa=an;cur[id]=rec;
}
function release(id){
  var rec=cur[id];if(!rec)return;delete cur[id];
  var wait=Math.max(0,MINHOLD-(performance.now()-rec.t0));
  setTimeout(function(){
    var tg=rec.tg,from=scaleOf(tg),k=rec.k;
    if(tg._pa)tg._pa.cancel();
    tg.style.scale='';
    var up=Math.max(1,Math.min(UP,1+(1-rec.to)*.55+.02));   /* nảy vừa phải theo độ co */
    var an=anim(tg,[{scale:from},{scale:up,offset:.42},{scale:.985,offset:.72},{scale:1}],{duration:300,easing:'cubic-bezier(.25,.9,.35,1)'});
    tg._pa=an;
    function done(){if(tg._pa===an){tg._pa=null;}if(k&&!cur_has(k))k.classList.remove('on');}
    if(an)an.onfinish=an.oncancel=done;else done();
  },wait);
}
function cur_has(k){for(var i in cur)if(cur[i].k===k)return true;return false;}

if(ok){
  document.addEventListener('pointerdown',function(e){
    if(API.off||e.button>0)return;
    var b=e.target&&e.target.closest&&e.target.closest(API.sel);
    if(!b||disabled(b))return;
    press(b,e.pointerId);
  },true);
  function up(e){release(e.pointerId);}
  document.addEventListener('pointerup',up,true);
  document.addEventListener('pointercancel',up,true);
  /* kéo ngón ra khỏi nút rồi nhả: pointerup vẫn bắn ở document nên cũng được nhả. Mất focus/ẩn tab: nhả hết */
  addEventListener('blur',function(){Object.keys(cur).forEach(release);});
}
})();
