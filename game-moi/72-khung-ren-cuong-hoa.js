/* 72-khung-ren-cuong-hoa.js - 3 khung CƯỜNG HÓA, RÈN (mở từ 2 nút ở 71-nut-trang-bi.js) và TIẾN HÓA THÚ (mở từ nút "Tiến Hóa" dưới ô thú trong panel Thú Thần, 54-thu-than.js).
   Ảnh: game-moi/khung-cuong-hoa.webp (1671x941), khung-ren.webp (1672x941), khung-tien-hoa.webp (1536x868). Ảnh gốc PNG: game-moi/khung-goc/.
   Các ô mẫu màu hồng trong ảnh gốc đã được tô nền xanh đậm; ở đây đặt sẵn nút bấm trong suốt đúng vị trí từng ô.
   TIẾN ĐỘ: KHUNG + đóng (nút X / bấm ra ngoài / Esc) + ô đã có vị trí + LƯỚI TÚI đã nối dữ liệu thật (xem khối NGUỒN TÚI): chọn ô (viền sáng), cuộn lưới bằng lăn chuột / vuốt dọc. CHƯA có logic Đập / Rèn (bấm nút: báo "Sắp có").
   Toạ độ tính theo PIXEL ẢNH. API: TTGKH.open('ch'|'ren'|'th') / .close() / .isOpen() / .slots(loai) -> [{el,k}] để gắn đồ vào ô. */
(function(){
'use strict';
var D={
 ch:{img:'game-moi/khung-cuong-hoa.webp?v=1',w:1671,h:941,x:{x:1530,y:68,s:116},sb:{x:1574,y:285,w:26,h:387},
  btn:[{x:140,y:716,w:400,h:110,t:'Đập'}],
  sl:{
   main:[[278,233,149,136]],
   ring:[[129,446,92,92],[475,446,93,92],[297,561,109,104]],
   bag:(function(){var a=[],X=[1099,1219,1338,1456],Y=[239,345,449,552,656];Y.forEach(function(y){X.forEach(function(x){a.push([x,y,96,84]);});});return a;})()}},
 th:{img:'game-moi/khung-tien-hoa.webp?v=2',w:1536,h:868,x:{x:1405,y:26,s:104},sb:{x:1452,y:232,w:30,h:393},
  btn:[{x:85,y:640,w:420,h:125,t:'Tiến Hóa'},{x:1090,y:680,w:365,h:100,t:'Tự Động'}],
  sl:{
   main:[[236,212,132,127]],
   ring:[[104,444,84,84],[409,445,83,83],[253,480,91,87]],
   bag:(function(){var a=[],X=[1066,1163,1258,1352],Y=[189,288,384,479,574];Y.forEach(function(y){X.forEach(function(x){a.push([x,y,83,83]);});});return a;})()}},
 ren:{img:'game-moi/khung-ren.webp?v=1',w:1672,h:941,x:{x:1525,y:105,s:110},sb:{x:1576,y:322,w:22,h:349},
  btn:[{x:130,y:745,w:410,h:105,t:'Rèn'}],
  sl:{
   top:[[306,255,76,75]],
   main:[[279,428,132,121]],
   side:[[113,557,78,77],[493,557,79,77]],
   set:(function(){var a=[],Y=[255,383,511,632];Y.forEach(function(y){a.push([673,y,128,94],[872,y,126,94]);});return a;})(),
   bag:(function(){var a=[],X=[1101,1220,1337,1456],Y=[283,400,517,636];Y.forEach(function(y){X.forEach(function(x){a.push([x,y,93,93]);});});return a;})()}}
};
var P={},cur=null,openAt=0;
/* ===== NGUỒN TÚI cho lưới 'bag' của từng khung =====
   ch  (Cường hóa)  -> Balo CHÍNH (53-balo.js: TTGBALO.list)
   th  (Tiến Hóa)   -> lưới phải = Balo chính, chỉ món loai:'th' (vật phẩm tiến hóa, hiện CHƯA có món nào); ô to bên trái = thú ĐANG RA TRẬN (TTGTHU.getRaTran)
   Mọi túi tối đa CAP=100 ô (25 hàng x 4), cuộn bằng thanh cuộn bên phải (kéo thanh / lăn chuột / vuốt dọc)
   ren (Rèn)        -> túi TRANG BỊ (55-trang-bi.js: TTGTB.list trừ món đang mặc). Đồ rèn ra: TTGKH.renOut(món) -> vào túi này. */
function esc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function ico(o){return o.img?'<img src="'+esc(o.img)+'" alt="" draggable="false">':'<b>'+esc(o.ic||'❔')+'</b>';}
var SRC={
 ch:function(){if(!window.TTGBALO||!TTGBALO.list)return [];return TTGBALO.list().map(function(o){return {key:o.id,html:ico(o),q:o.n>1?o.n:'',ten:o.ten};});},
 th:function(){if(!window.TTGBALO||!TTGBALO.list)return [];return TTGBALO.list('th').map(function(o){return {key:o.id,html:ico(o),q:o.n>1?o.n:'',ten:o.ten};});},
 ren:function(){if(!window.TTGTB||!TTGTB.list)return [];var eq=TTGTB.equipped?TTGTB.equipped():{},mac={};for(var k in eq)mac[eq[k]]=1;
  return TTGTB.list().filter(function(t){return !mac[t.uid];}).map(function(t){return {key:t.uid,html:ico(t),q:'',ten:t.ten};});}
};
var SEL={},OFF={};
var CAP=100,COLS=4,ROWS_ALL=CAP/COLS;
function maxOff(k){var p=P[k];return Math.max(0,ROWS_ALL-p.slots.bag.length/COLS);}
function renderBag(k){
 var p=P[k];if(!p||!p.slots.bag)return;var a=(SRC[k]?SRC[k]():[]).slice(0,CAP),cols=COLS;
 var mo=maxOff(k);if(!(OFF[k]>0))OFF[k]=0;if(OFF[k]>mo)OFF[k]=mo;
 if(SEL[k]&&!a.some(function(o){return o.key===SEL[k];}))SEL[k]=null;
 p.slots.bag.forEach(function(c,i){var o=a[OFF[k]*cols+i],el=c.el;c.item=o||null;
  if(!o){el.innerHTML='';el.classList.remove('sel','has');el.removeAttribute('title');return;}
  el.innerHTML='<span class="kh-i">'+o.html+'</span>'+(o.q!==''?'<span class="kh-q">'+esc(o.q)+'</span>':'');
  el.classList.add('has');el.classList.toggle('sel',o.key===SEL[k]);el.title=o.ten||'';});
 renderMain(k);thumb(k);
}
/* ô to bên trái của Tiến Hóa: thú đang ra trận */
function renderMain(k){
 if(k!=='th')return;var p=P[k],c=p.slots.main&&p.slots.main[0];if(!c)return;
 var t=window.TTGTHU&&TTGTHU.getRaTran?TTGTHU.getRaTran():null,a=t&&TTGTHU.anh?TTGTHU.anh(t):'';
 c.item=t||null;c.el.innerHTML=a?'<img class="kh-pet kh-big" src="'+esc(a)+'" alt="" draggable="false">':'';c.el.classList.toggle('has',!!a);c.el.title=t&&TTGTHU.ten?TTGTHU.ten(t):'';
}
function thumb(k){
 var p=P[k];if(!p||!p.th)return;var mo=maxOff(k),vis=ROWS_ALL-mo,h=Math.max(0.08,vis/ROWS_ALL),f=mo?OFF[k]/mo:0;
 p.th.style.height=(h*100)+'%';p.th.style.top=(f*(1-h)*100)+'%';
}
function wireBag(k){
 var p=P[k];if(!p.slots.bag)return;
 p.slots.bag.forEach(function(c){c.el.addEventListener('click',function(){if(!c.item)return;SEL[k]=(SEL[k]===c.item.key)?null:c.item.key;renderBag(k);});});
 var st=null;p.root.addEventListener('wheel',function(e){var d=e.deltaY>0?1:-1;OFF[k]=(OFF[k]||0)+d;renderBag(k);e.preventDefault();},{passive:false});
 p.root.addEventListener('touchstart',function(e){st=e.touches[0].clientY;},{passive:true});
 p.root.addEventListener('touchmove',function(e){if(st==null)return;var dy=st-e.touches[0].clientY;if(Math.abs(dy)>46){OFF[k]=(OFF[k]||0)+(dy>0?1:-1);st=e.touches[0].clientY;renderBag(k);}},{passive:true});
 /* thanh cuộn: nền trong suốt đè lên thanh vàng vẽ sẵn, thanh kéo = vùng đang xem */
 var tr=p.tr,drag=false;
 function setFrom(e){var r=tr.getBoundingClientRect(),mo=maxOff(k),h=(ROWS_ALL-mo)/ROWS_ALL,f=(e.clientY-r.top-h*r.height/2)/(r.height*(1-h));f=Math.max(0,Math.min(1,f));OFF[k]=Math.round(f*mo);renderBag(k);}
 tr.addEventListener('pointerdown',function(e){drag=true;try{tr.setPointerCapture(e.pointerId);}catch(x){}setFrom(e);e.preventDefault();});
 tr.addEventListener('pointermove',function(e){if(drag)setFrom(e);});
 tr.addEventListener('pointerup',function(){drag=false;});tr.addEventListener('pointercancel',function(){drag=false;});
}
function renOut(t){if(!window.TTGTB||!TTGTB.addItem)return null;var u=TTGTB.addItem(t);if(cur==='ren')renderBag('ren');return u;}

function toast(t){if(window.TTGTBAO&&TTGTBAO.toast){TTGTBAO.toast(t,1800);return;}if(window.toast)window.toast(t);}
function build(k){
 var d=D[k],root=document.createElement('div');root.className='kh';
 var fr=document.createElement('div');fr.className='kh-fr';fr.style.aspectRatio=d.w+'/'+d.h;fr.style.width='min(98vw,calc(96vh*'+d.w+'/'+d.h+'))';fr.style.backgroundImage='url('+d.img+')';
 function box(c,x,y,w,h){var s=c.style;s.left=(x/d.w*100)+'%';s.top=(y/d.h*100)+'%';s.width=(w/d.w*100)+'%';s.height=(h/d.h*100)+'%';fr.appendChild(c);return c;}
 var slots={};
 Object.keys(d.sl).forEach(function(g){slots[g]=d.sl[g].map(function(r,i){var c=document.createElement('button');c.type='button';c.className='kh-c';c.setAttribute('data-g',g);c.setAttribute('data-k',i);box(c,r[0]-4,r[1]-4,r[2]+8,r[3]+8);return {el:c,k:i};});});
 d.btn.forEach(function(o){var b=document.createElement('button');b.type='button';b.className='kh-b';b.setAttribute('aria-label',o.t);box(b,o.x,o.y,o.w,o.h);b.addEventListener('click',function(){toast(o.t+': sắp có');});});
 var x=document.createElement('button');x.type='button';x.className='kh-x';x.setAttribute('aria-label','Đóng');box(x,d.x.x,d.x.y,d.x.s,d.x.s);x.addEventListener('click',close);
 root.appendChild(fr);
 root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
 var tr=document.createElement('div');tr.className='kh-tr';box(tr,d.sb.x,d.sb.y,d.sb.w,d.sb.h);var th=document.createElement('div');th.className='kh-th';tr.appendChild(th);
 document.body.appendChild(root);
 P[k]={root:root,fr:fr,d:d,slots:slots,tr:tr,th:th};wireBag(k);
}
function css(){
 var s=document.createElement('style');
 s.textContent='.kh{position:fixed;left:0;top:0;right:0;bottom:0;z-index:63;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74)}'+
 '.kh.on{display:flex}.kh-fr{position:relative;background-size:100% 100%;background-repeat:no-repeat;max-width:1672px}'+
 '.kh-fr>*{position:absolute;box-sizing:border-box}.kh button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent;padding:0;border:0;background:transparent;cursor:pointer}'+
 '.kh-x{border-radius:50%}.kh-b{border-radius:14px}.kh-c{border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff}'+
 '.kh-i{display:flex;align-items:center;justify-content:center;width:80%;height:80%;pointer-events:none}.kh-i img{width:100%;height:100%;object-fit:contain}.kh-i img.kh-pet{image-rendering:pixelated}.kh-i b{font-size:calc(var(--u)*46);line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,.7))}'+
 '.kh-q{position:absolute;right:9%;bottom:6%;font-size:calc(var(--u)*24);font-weight:800;line-height:1;text-shadow:0 1px 2px #000,0 0 3px #000;pointer-events:none}'+
 '.kh-t{position:absolute;left:0;right:0;bottom:2%;text-align:center;font-size:calc(var(--u)*19);font-weight:800;color:#bfffd0;text-shadow:0 1px 2px #000,0 0 3px #000;pointer-events:none}'+
 '.kh-tr{touch-action:none;cursor:pointer;border-radius:12px}.kh-th{position:absolute;left:8%;right:8%;border-radius:10px;background:rgba(40,14,0,.42);box-shadow:inset 0 0 0 calc(var(--u)*2) rgba(255,246,190,.85);pointer-events:none}'+
 '.kh-i img.kh-big,.kh-c img.kh-big{width:88%;height:88%;object-fit:contain;image-rendering:pixelated}'+
 '.kh-c.sel{box-shadow:0 0 0 calc(var(--u)*3) #fff3a0,0 0 calc(var(--u)*14) calc(var(--u)*4) rgba(255,211,77,.85);background:rgba(255,211,77,.12)}';
 document.head.appendChild(s);
}
function open(k){if(!D[k])return;if(cur)close();if(!document.querySelector('style[data-kh]')){css();document.head.lastChild.setAttribute('data-kh','1');}
 if(!P[k])build(k);cur=k;openAt=performance.now();P[k].root.classList.add('on');unit(k);renderBag(k);}
function unit(k){var p=P[k];if(p)p.fr.style.setProperty('--u',(p.fr.clientWidth/p.d.w)+'px');}
window.addEventListener('resize',function(){if(cur)unit(cur);});
function close(){if(!cur)return;P[cur].root.classList.remove('on');cur=null;}
document.addEventListener('keydown',function(e){if(cur&&e.key==='Escape'){e.stopImmediatePropagation();close();}},true);
window.TTGKH={open:open,close:close,isOpen:function(){return !!cur;},slots:function(k){return P[k]?P[k].slots:null;},refresh:function(k){renderBag(k||cur);},selected:function(k){return SEL[k]||null;},renOut:renOut};
})();
