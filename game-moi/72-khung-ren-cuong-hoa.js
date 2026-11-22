/* 72-khung-ren-cuong-hoa.js - 3 khung CƯỜNG HÓA, RÈN (mở từ 2 nút ở 71-nut-trang-bi.js) và TIẾN HÓA THÚ (mở từ nút "Tiến Hóa" dưới ô thú trong panel Thú Thần, 54-thu-than.js).
   Ảnh: game-moi/khung-cuong-hoa.webp (1671x941), khung-ren.webp (1672x941), khung-tien-hoa.webp (1536x868). Ảnh gốc PNG: game-moi/khung-goc/.
   Các ô mẫu màu hồng trong ảnh gốc đã được tô nền xanh đậm; ở đây đặt sẵn nút bấm trong suốt đúng vị trí từng ô.
   MÓC: TTGKH.on('open'|'close'|'btn'|'pick',fn) + TTGKH.frame(k) -> {root,fr,d,slots}; logic Rèn / Cường hóa nằm ở 74-ren-cuong-hoa.js (luật ở 73-luat-trang-bi.js).
   TIẾN ĐỘ: KHUNG + đóng (nút X / bấm ra ngoài / Esc) + ô đã có vị trí + LƯỚI TÚI đã nối dữ liệu thật (xem khối NGUỒN TÚI): chọn ô (viền sáng), cuộn lưới bằng lăn chuột / vuốt dọc. CHƯA có logic Đập / Rèn (bấm nút: báo "Sắp có").
   Toạ độ tính theo PIXEL ẢNH. API: TTGKH.open('ch'|'ren'|'th') / .close() / .isOpen() / .slots(loai) -> [{el,k}] để gắn đồ vào ô.
   SỬA LỖI 22/11/2026: canvas thú ở ô to khung Tiến Hóa (.kh-pc) bị luật chung canvas{position:fixed} của index.html phóng to che cả màn hình. Đã ghi đè vị trí/kích thước bằng !important (giống .tt-c canvas.pc bên 54-thu-than.js). Canvas luôn nằm TRONG ô, rộng tối đa 92% ô, giữ tỉ lệ vuông.
   BỐ CỤC NÚT KHUNG TIẾN HÓA (22/11/2026): nút "Tự Động" vẽ sẵn trong ảnh khung đã được che bằng 1 mảnh nền sao cắt từ chính ảnh khung (div .kh-pa, không thêm ảnh mới) và thay bằng 4 nút nhỏ làm từ nut-trong.webp, xếp 2x2 đúng chỗ cũ: hàng trên Tự Động - Chọn, hàng dưới Khóa - Vứt Bỏ. Thanh nút dưới khung chỉ còn "Bỏ chọn" / "Chọn tất cả" (chỉ hiện khi bật Chọn nhiều). Muốn chỉnh vị trí/kích thước: sửa TH_PL + TH_PATCH bên dưới. */
(function(){
'use strict';
var D={
 ch:{img:'game-moi/khung-cuong-hoa.webp?v=1',w:1671,h:941,x:{x:1530,y:68,s:116},sb:{x:1574,y:285,w:26,h:387},
  btn:[{x:140,y:716,w:400,h:110,t:'Đập'},{x:640,y:740,w:400,h:96,t:'Chọn Trang Bị'}],
  sl:{
   main:[[278,233,149,136]],
   ring:[[129,446,92,92],[475,446,93,92],[297,561,109,104]],
   bag:(function(){var a=[],X=[1099,1219,1338,1456],Y=[239,345,449,552,656];Y.forEach(function(y){X.forEach(function(x){a.push([x,y,96,84]);});});return a;})()}},
 th:{img:'game-moi/khung-tien-hoa.webp?v=2',w:1536,h:868,ex:76,tb:true,x:{x:1405,y:26,s:104},sb:{x:1452,y:232,w:30,h:393},
  btn:[{x:85,y:640,w:420,h:125,t:'Tiến Hóa'}],
  sl:{
   main:[[236,212,132,127]],
   ring:[[104,444,84,84],[409,445,83,83],[253,480,91,87]],
   bag:(function(){var a=[],X=[1066,1163,1258,1352],Y=[189,288,384,479,574];Y.forEach(function(y){X.forEach(function(x){a.push([x,y,83,83]);});});return a;})()}},
 ren:{img:'game-moi/khung-ren.webp?v=1',w:1672,h:941,x:{x:1525,y:105,s:110},sb:{x:1576,y:322,w:22,h:349},
  btn:[{x:130,y:745,w:410,h:105,t:'Rèn'},{x:630,y:748,w:420,h:90,t:'Bộ Trang Bị'}],
  sl:{
   top:[[306,255,76,75]],
   main:[[279,428,132,121]],
   side:[[113,557,78,77],[493,557,79,77]],
   set:(function(){var a=[],Y=[255,383,511,632];Y.forEach(function(y){a.push([673,y,128,94],[872,y,126,94]);});return a;})(),
   bag:(function(){var a=[],X=[1101,1220,1337,1456],Y=[283,400,517,636];Y.forEach(function(y){X.forEach(function(x){a.push([x,y,93,93]);});});return a;})()}}
};
/* ex = chiều cao THÊM dưới ảnh khung (px ảnh) để đặt thanh nút; tb = có thanh nút CHỌN / KHÓA / VỨT BỎ / BỎ CHỌN / CHỌN TẤT CẢ (làm từ nut-trong.webp) */
/* KHUNG TIẾN HÓA: mảnh nền che nút Tự Động cũ (đích x,y,w,h = chỗ nút cũ; nguồn sx,sy = vùng nền sao sạch ở giữa ảnh khung) + 4 nút nhỏ 2x2 (tọa độ pixel ảnh).
   key: 'auto' = bắn móc btn 'Tự Động'; chon/khoa/vut = 3 nút của túi (doChon/doKhoa/doVut) */
var TH_PATCH={x:1074,y:667,w:376,h:122,sx:560,sy:478};
var TH_PL=[
 {key:'auto',t:'Tự Động',x:1086,y:670,w:172,h:56},
 {key:'chon',t:'Chọn',x:1264,y:670,w:172,h:56},
 {key:'khoa',t:'Khóa',x:1086,y:730,w:172,h:56},
 {key:'vut',t:'Vứt Bỏ',x:1264,y:730,w:172,h:56}];
var P={},cur=null,openAt=0,MULTI={},PK={};
/* MÓC cho logic bên ngoài (74-ren-cuong-hoa.js): TTGKH.on('open'|'close'|'btn'|'pick',fn). fn trả true ở 'btn' = đã xử lý, khỏi hiện "Sắp có". */
var HK={};
function fire(ev){var a=Array.prototype.slice.call(arguments,1),h=HK[ev]||[],r=false,i;for(i=0;i<h.length;i++){try{if(h[i].apply(null,a)===true)r=true;}catch(e){console.warn('[TTGKH]',ev,e);}}return r;}
/* ===== NGUỒN TÚI cho lưới 'bag' của từng khung =====
   ch  (Cường hóa)  -> Balo CHÍNH (53-balo.js: TTGBALO.list)
   th  (Tiến Hóa)   -> lưới phải = Balo chính, chỉ món loai:'th' (vật phẩm tiến hóa, hiện CHƯA có món nào); ô to bên trái = thú ĐANG RA TRẬN (TTGTHU.getRaTran)
   Mọi túi tối đa CAP=100 ô (25 hàng x 4), cuộn bằng thanh cuộn bên phải (kéo thanh / lăn chuột / vuốt dọc)
   ren (Rèn)        -> túi TRANG BỊ (55-trang-bi.js: TTGTB.list trừ món đang mặc). Đồ rèn ra: TTGKH.renOut(món) -> vào túi này. */
function esc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function ico(o){return o.img?'<img src="'+esc(o.img)+'" alt="" draggable="false">':'<b>'+esc(o.ic||'❔')+'</b>';}
var SRC={
 ch:function(){if(!window.TTGBALO||!TTGBALO.list)return [];return TTGBALO.list().map(function(o){return {key:o.id,html:ico(o),q:o.n>1?o.n:'',ten:o.ten,lk:TTGBALO.isLocked&&TTGBALO.isLocked(o.id)};});},
 th:function(){if(!window.TTGBALO||!TTGBALO.list)return [];return TTGBALO.list('th').map(function(o){return {key:o.id,html:ico(o),q:o.n>1?o.n:'',ten:o.ten,lk:TTGBALO.isLocked&&TTGBALO.isLocked(o.id)};});},
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
  if(!o){el.innerHTML='';el.classList.remove('sel','has','pk');el.removeAttribute('title');return;}
  el.innerHTML='<span class="kh-i">'+o.html+'</span>'+(o.q!==''?'<span class="kh-q">'+esc(o.q)+'</span>':'')+(o.lk?'<span class="kh-lk">🔒</span>':'');
  el.classList.add('has');el.classList.toggle('sel',o.key===SEL[k]&&!MULTI[k]);el.classList.toggle('pk',!!(PK[k]&&PK[k][o.key]));el.title=o.ten||'';});
 renderMain(k);thumb(k);renderTb(k);
}
/* ô to bên trái của Tiến Hóa: thú đang ra trận */
function renderMain(k){
 if(k!=='th')return;var p=P[k],c=p.slots.main&&p.slots.main[0];if(!c)return;
 var t=window.TTGTHU&&TTGTHU.getRaTran?TTGTHU.getRaTran():null,a=t&&TTGTHU.anh?TTGTHU.anh(t):'';
 c.item=t||null;c.el.innerHTML=a?'<canvas class="kh-pc" width="192" height="192" data-u="'+esc(a)+'"></canvas>':'';
 var cv=c.el.querySelector('canvas');if(cv&&TTGTHU.pc)TTGTHU.pc(cv);   /* tự phóng vừa ô: thú nhỏ/vừa/to đều đầy ô như bên Thú Thần */
 c.el.classList.toggle('has',!!a);c.el.title=t&&TTGTHU.ten?TTGTHU.ten(t):'';
}
function thumb(k){
 var p=P[k];if(!p||!p.th)return;var mo=maxOff(k),vis=ROWS_ALL-mo,h=Math.max(0.08,vis/ROWS_ALL),f=mo?OFF[k]/mo:0;
 p.th.style.height=(h*100)+'%';p.th.style.top=(f*(1-h)*100)+'%';
}
function wireBag(k){
 var p=P[k];if(!p.slots.bag)return;
 p.slots.bag.forEach(function(c){c.el.addEventListener('click',function(){if(!c.item)return;if(MULTI[k]){var pk=PK[k]=PK[k]||{};if(pk[c.item.key])delete pk[c.item.key];else pk[c.item.key]=1;SEL[k]=c.item.key;renderBag(k);return;}SEL[k]=(SEL[k]===c.item.key)?null:c.item.key;renderBag(k);fire('pick',k,c.item);});});
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
/* ===== THANH NÚT dưới khung (hiện ở khung có tb): CHỌN nhiều / KHÓA / VỨT BỎ / BỎ CHỌN / CHỌN TẤT CẢ ===== */
function items(k){return SRC[k]?SRC[k]().slice(0,CAP):[];}
function tgts(k){var a=items(k),keys=a.map(function(o){return o.key;});if(MULTI[k])return Object.keys(PK[k]||{}).filter(function(x){return keys.indexOf(x)>=0;});return SEL[k]&&keys.indexOf(SEL[k])>=0?[SEL[k]]:[];}
function lockedOf(k,key){var o=items(k).filter(function(x){return x.key===key;})[0];return !!(o&&o.lk);}
function renderTb(k){var p=P[k];if(!p||!p.tb)return;var t=tgts(k),all=t.length&&t.every(function(x){return lockedOf(k,x);});
 p.tb.khoa.textContent=all?'Mở Khóa':'Khóa';p.tb.chon.classList.toggle('act',!!MULTI[k]);p.tb.bc.classList.toggle('hid',!MULTI[k]);p.tb.tc.classList.toggle('hid',!MULTI[k]);}
function doChon(k){MULTI[k]=!MULTI[k];PK[k]={};if(MULTI[k]&&SEL[k])PK[k][SEL[k]]=1;toast(MULTI[k]?'Chọn nhiều: chạm các ô cần chọn':'Đã tắt chọn nhiều');renderBag(k);}
function doBoChon(k){MULTI[k]=false;PK[k]={};toast('Đã bỏ chọn');renderBag(k);}
function doChonAll(k){var a=items(k);if(!a.length){toast('Túi không có vật phẩm');return;}PK[k]={};a.forEach(function(o){PK[k][o.key]=1;});SEL[k]=a[0].key;toast('Đã chọn tất cả '+a.length+' loại');renderBag(k);}
function doKhoa(k){var t=tgts(k);if(!t.length){toast('Chưa chọn vật phẩm');return;}if(!window.TTGBALO||!TTGBALO.setLock)return;
 var all=t.every(function(x){return lockedOf(k,x);});t.forEach(function(x){TTGBALO.setLock(x,!all);});toast(all?'Đã mở khóa':'Đã khóa '+t.length+' loại');renderBag(k);fire('change',k);}
function doVut(k){var t=tgts(k);if(!t.length){toast('Chưa chọn vật phẩm');return;}
 var ok=t.filter(function(x){return !lockedOf(k,x);});if(!ok.length){toast('Vật phẩm đang khóa');return;}
 var tong=ok.reduce(function(n,x){return n+(window.TTGBALO?TTGBALO.count(x):0);},0),CATx=(window.TTGBALO&&TTGBALO.CAT)||{};
 var tx=ok.length===1?'Vứt bỏ <b>'+esc((CATx[ok[0]]||{}).ten||ok[0])+'</b> x'+tong+'?':'Vứt bỏ <b>'+ok.length+'</b> loại ('+tong+' món)?';
 if(ok.length<t.length)tx+='<br><small>(bỏ qua '+(t.length-ok.length)+' món đã khóa)</small>';
 var xoa=function(){ok.forEach(function(x){TTGBALO.xoa(x);if(PK[k])delete PK[k][x];if(SEL[k]===x)SEL[k]=null;});toast('Đã vứt bỏ');renderBag(k);fire('change',k);};
 if(window.TTGTBAO&&TTGTBAO.confirm){TTGTBAO.confirm(tx,[{t:'Vứt bỏ',cls:'d',cb:xoa},{t:'Hủy'}]);return;}
 if(window.confirm('Vứt bỏ '+ok.length+' loại vật phẩm?'))xoa();}
function renOut(t){if(!window.TTGTB||!TTGTB.addItem)return null;var u=TTGTB.addItem(t);if(cur==='ren')renderBag('ren');return u;}

function toast(t){if(window.TTGTBAO&&TTGTBAO.toast){TTGTBAO.toast(t,1800);return;}if(window.toast)window.toast(t);}
function build(k){
 var d=D[k],H=d.h+(d.ex||0),root=document.createElement('div');root.className='kh';
 var fr=document.createElement('div');fr.className='kh-fr';fr.style.aspectRatio=d.w+'/'+H;fr.style.width='min(98vw,calc(96vh*'+d.w+'/'+H+'))';fr.style.backgroundImage='url('+d.img+')';
 if(d.ex){fr.style.backgroundSize='100% '+(d.h/H*100)+'%';fr.style.backgroundPosition='0 0';}   /* ảnh khung ở trên, phần ex bên dưới để trống cho thanh nút */
 function box(c,x,y,w,h){var s=c.style;s.left=(x/d.w*100)+'%';s.top=(y/H*100)+'%';s.width=(w/d.w*100)+'%';s.height=(h/H*100)+'%';fr.appendChild(c);return c;}
 var slots={};
 Object.keys(d.sl).forEach(function(g){slots[g]=d.sl[g].map(function(r,i){var c=document.createElement('button');c.type='button';c.className='kh-c';c.setAttribute('data-g',g);c.setAttribute('data-k',i);box(c,r[0]-4,r[1]-4,r[2]+8,r[3]+8);return {el:c,k:i};});});
 d.btn.forEach(function(o){var b=document.createElement('button');b.type='button';b.className='kh-b';b.setAttribute('aria-label',o.t);box(b,o.x,o.y,o.w,o.h);b.addEventListener('click',function(){if(fire('btn',k,o.t))return;toast(o.t+': sắp có');});});
 var x=document.createElement('button');x.type='button';x.className='kh-x';x.setAttribute('aria-label','Đóng');box(x,d.x.x,d.x.y,d.x.s,d.x.s);x.addEventListener('click',close);
 root.appendChild(fr);
 root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
 var tr=document.createElement('div');tr.className='kh-tr';box(tr,d.sb.x,d.sb.y,d.sb.w,d.sb.h);var th=document.createElement('div');th.className='kh-th';tr.appendChild(th);
 document.body.appendChild(root);
 P[k]={root:root,fr:fr,d:d,slots:slots,tr:tr,th:th};
 if(d.tb){var tb={},y0=d.h+4,bw=160,bh=68,gap=8,x0=d.w-bw*5-gap*4-62;
  /* mảnh nền che nút Tự Động cũ vẽ sẵn trong ảnh: cắt từ vùng nền sao sạch của chính ảnh khung, viền mờ dần; phải thêm TRƯỚC 4 nút mới */
  var pt=TH_PATCH,pa=document.createElement('div');pa.className='kh-pa';
  pa.style.backgroundImage='url('+d.img+')';pa.style.backgroundRepeat='no-repeat';
  pa.style.backgroundSize=(d.w/pt.w*100)+'% '+(d.h/pt.h*100)+'%';
  pa.style.backgroundPosition=(pt.sx/(d.w-pt.w)*100)+'% '+(pt.sy/(d.h-pt.h)*100)+'%';
  box(pa,pt.x,pt.y,pt.w,pt.h);
  /* 4 nút nhỏ 2x2 trong khung: Tự Động - Chọn / Khóa - Vứt Bỏ */
  TH_PL.forEach(function(o){var b=document.createElement('button');b.type='button';b.className='kh-pl kh-pl2';b.textContent=o.t;box(b,o.x,o.y,o.w,o.h);
   b.addEventListener('click',function(){if(o.key==='auto'){if(!fire('btn',k,'Tự Động'))toast('Tự Động: sắp có');}else if(o.key==='chon')doChon(k);else if(o.key==='khoa')doKhoa(k);else doVut(k);});tb[o.key]=b;});
  /* thanh nút dưới khung: chỉ còn Bỏ chọn / Chọn tất cả (hiện khi bật Chọn nhiều), nằm ở 2 vị trí cuối của thanh cũ */
  [['bc','Bỏ chọn',doBoChon,3],['tc','Chọn tất cả',doChonAll,4]].forEach(function(o){var b=document.createElement('button');b.type='button';b.className='kh-pl';b.textContent=o[1];box(b,x0+o[3]*(bw+gap),y0,bw,bh);b.addEventListener('click',function(){o[2](k);});tb[o[0]]=b;});
  P[k].tb=tb;}
 wireBag(k);
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
 /* canvas thú trong ô: PHẢI ghi đè luật chung canvas{position:fixed...} của index.html, nếu không thú bị phóng to che cả màn hình */
 '.kh-c canvas.kh-pc{position:relative!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;display:block;width:92%!important;height:auto!important;max-width:92%;aspect-ratio:1/1;flex:none;pointer-events:none;image-rendering:auto!important}'+
 '.kh .kh-pl{display:flex;align-items:center;justify-content:center;background:url(game-moi/nut-trong.webp?v=1) 0 0/100% 100% no-repeat;font-family:"Noto Serif","Palatino Linotype",Georgia,serif;font-weight:800;font-size:calc(var(--u)*24);line-height:1;white-space:nowrap;color:#ffe9a0;-webkit-text-stroke:calc(var(--u)*1.4) #3b2200;paint-order:stroke fill;text-shadow:0 calc(var(--u)*2) 0 #5a3000,0 0 calc(var(--u)*6) rgba(0,0,0,.7)}'+
 '.kh .kh-pl2{font-size:calc(var(--u)*23)}'+
 '.kh .kh-pl:active{filter:brightness(1.25)}.kh .kh-pl.act{box-shadow:0 0 calc(var(--u)*14) calc(var(--u)*3) rgba(95,240,224,.85);border-radius:calc(var(--u)*14)}.kh .kh-pl.hid{display:none}'+
 /* mảnh nền che nút Tự Động cũ: viền mờ dần, không nhận chạm */
 '.kh-pa{pointer-events:none;filter:brightness(1.1);-webkit-mask-image:linear-gradient(to right,transparent,#000 calc(var(--u)*6),#000 calc(100% - var(--u)*6),transparent),linear-gradient(to bottom,transparent,#000 calc(var(--u)*6),#000 calc(100% - var(--u)*6),transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(to right,transparent,#000 calc(var(--u)*6),#000 calc(100% - var(--u)*6),transparent),linear-gradient(to bottom,transparent,#000 calc(var(--u)*6),#000 calc(100% - var(--u)*6),transparent);mask-composite:intersect}'+
 '.kh-lk{position:absolute;left:9%;top:7%;font-size:calc(var(--u)*22);line-height:1;text-shadow:0 0 3px #000;pointer-events:none}'+
 '.kh-c.pk::before{content:"";position:absolute;inset:3%;border:calc(var(--u)*3) solid #5ff0e0;border-radius:calc(var(--u)*8);box-shadow:0 0 calc(var(--u)*12) rgba(95,240,224,.7);pointer-events:none}'+
 '.kh-c.sel{box-shadow:0 0 0 calc(var(--u)*3) #fff3a0,0 0 calc(var(--u)*14) calc(var(--u)*4) rgba(255,211,77,.85);background:rgba(255,211,77,.12)}';
 document.head.appendChild(s);
}
function open(k){if(!D[k])return;if(cur)close();if(!document.querySelector('style[data-kh]')){css();document.head.lastChild.setAttribute('data-kh','1');}
 if(!P[k])build(k);cur=k;openAt=performance.now();P[k].root.classList.add('on');unit(k);renderBag(k);fire('open',k);}
function unit(k){var p=P[k];if(p)p.fr.style.setProperty('--u',(p.fr.clientWidth/p.d.w)+'px');}
window.addEventListener('resize',function(){if(cur)unit(cur);});
function close(){if(!cur)return;var k0=cur;MULTI[k0]=false;PK[k0]={};P[cur].root.classList.remove('on');cur=null;fire('close',k0);}
document.addEventListener('keydown',function(e){if(cur&&e.key==='Escape'){e.stopImmediatePropagation();close();}},true);
window.TTGKH={open:open,close:close,isOpen:function(){return !!cur;},slots:function(k){return P[k]?P[k].slots:null;},refresh:function(k){renderBag(k||cur);},selected:function(k){return SEL[k]||null;},renOut:renOut,on:function(ev,fn){(HK[ev]=HK[ev]||[]).push(fn);},frame:function(k){return P[k]||null;},current:function(){return cur;}};
})();
