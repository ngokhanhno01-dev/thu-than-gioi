/* 55-trang-bi.js - Khung TRANG BỊ của thú (mở từ nút "Trang Bị" trong panel Thú Thần, 54-thu-than.js).
   Ảnh khung: game-moi/khung-trang-bi.webp (1798x798, khung xanh-vàng mới: chữ TRANG BỊ, nút X, chữ THÔNG TIN, 2 nút TRANG BỊ / VỨT BỎ đã VẼ SẴN trong ảnh). Hiển thị đúng cỡ gốc (1 pixel ảnh = 1 pixel máy) để không bị mờ, màn nhỏ thì tự co.
   MỌI TỌA ĐỘ tính theo PIXEL ẢNH ĐÃ CẮT 1798x798 (BW x BH). Cỡ chữ/độ dày trong CSS ({n}) vẫn tính theo thang cũ 1456 (UB) nên không phải chỉnh lại; --u = clientWidth/UB.
   TIẾN ĐỘ: KHUNG + đóng (nút X / bấm ra ngoài / Esc) + thú RA TRẬN đứng trên bục bên trái (có nhịp thở như ở sảnh).
   Không có thú ra trận (TTGTHU.getRaTran() = null) thì KHÔNG hiện thú, chỉ hiện chữ "Chưa có Thú ra trận".
   (21/11/2026) Khung mới 1673x867: thanh vàng = tên, 3 ô tròn = Lv/Bậc/Rank, thú có vòng rune + aura theo Rank (67-rune-rank.js).
   CHƯA LÀM: 8 ô trang bị 2 bên, lưới 4x6 đồ, bảng thông tin bên phải, 2 nút dưới bảng.
   Mở nằm ĐÈ LÊN panel Thú Thần (đóng khung này thì quay lại Thú Thần); đóng panel Thú Thần/mở Balo thì khung này cũng đóng.
   API: TTGTB.open() / .close() / .isOpen() */
(function(){
'use strict';
var BW=1673,BH=867,UB=1355,IMG='game-moi/khung-trang-bi.webp?v=3',OV_BO='game-moi/nut-bo-trang-bi.webp?v=1';   /* UB = thang đơn vị cũ cho cỡ chữ ({n}) */
var isOpen=false,openAt=0,root=null,fr=null,E={},raf=0,cur=null,petImg=null,petSrc='';
/* ===== THÚ TRÊN BỤC (chỗ chỉnh số, px ảnh khung 1798x798) =====
   cx = tâm ngang bục, by = đường chân thú (mặt bục), size = cạnh ảnh thú (ảnh gốc 192px, to quá sẽ mờ). */
var PET={cx:437,by:656,size:320};
var TXT={x:235,y:300,w:400,h:100};
/* THANH VÀNG TÊN + 3 Ô TRÒN (px ảnh khung 1673x867): tâm 3 ô tròn (353,240),(442,240),(531,240), ruột ~56px */
var NM={x:292,y:160,w:300,h:36},OC_X=[353,442,531],OC_Y=240,OC_S=62;
/* vẽ thú + vòng rune/aura theo Rank trên canvas: CW x (CHU+DOWN) px ảnh, chân thú ở y=CHU. Thú vẽ 128 điểm logic (như ở sảnh) rồi phóng s=PET.size/128 lần */
var CV={w:460,up:420,down:70};   /* khối chữ "Chưa có Thú ra trận" (giữa 2 cột ô trang bị, phía trên bục) */
/* NHỊP THỞ: giống sảnh, nhấp nhô sin(ts/380)*2 điểm logic (ảnh thú 128). */

var css=[
'.tb{--fh:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;position:fixed;left:0;top:0;right:0;bottom:0;z-index:62;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.tb.on{display:flex}',
'.tb-fr{position:relative;width:min(98vw,calc(96vh*1673/867));aspect-ratio:1673/867;background:url('+IMG+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.tb-fr>*{position:absolute;box-sizing:border-box}',
'.tb button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.tb-ov{display:none;pointer-events:none}','.tb-ov.on{display:block}',
'.tb-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}',   /* vùng bấm trong suốt đè lên nút X vẽ sẵn trong ảnh */
'.tb-cv{pointer-events:none}',
'.tb-oc{pointer-events:none;image-rendering:auto}',
'.tb-nm{display:flex;align-items:center;justify-content:center;padding:0 {10};font-family:var(--fh);font-weight:800;font-size:{20};line-height:1;white-space:nowrap;overflow:hidden;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7);pointer-events:none}',
'.tb-emp{display:flex;align-items:center;justify-content:center;text-align:center;font-size:{28};line-height:1.4;color:#7c83b8;padding:0 {20}}',
'.tb-t{display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{26};line-height:1;white-space:nowrap;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7)}'
].join('\n').replace(/\{(\d+(?:\.\d+)?)\}/g,'calc(var(--u)*$1)');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function box(c,x,y,w,h){var s=c.style;s.left=(x/BW*100)+'%';s.top=(y/BH*100)+'%';s.width=(w/BW*100)+'%';s.height=(h/BH*100)+'%';return c;}
function mk(tag,cls,x,y,w,h,txt){var c=document.createElement(tag);if(cls)c.className=cls;if(txt!=null)c.textContent=txt;if(w)box(c,x,y,w,h);fr.appendChild(c);return c;}
/* KHÔNG PHÓNG TO QUÁ CỠ GỐC (như panel Thú Thần): muốn khung to hơn thì đổi MAXSCALE lên >1 */
var MAXSCALE=1;
function unit(){if(!fr)return;var d=window.devicePixelRatio||1;fr.style.maxWidth=(BW*MAXSCALE/d)+'px';fr.style.setProperty('--u',(fr.clientWidth/UB)+'px');sizeCv();}

function build(){
  root=document.createElement('div');root.className='tb';
  fr=document.createElement('div');fr.className='tb-fr';root.appendChild(fr);
  /* thanh vàng = TÊN thú; 3 ô tròn = Lv / Bậc / Rank (cùng cách vẽ với panel Thú Thần); tiêu đề TRANG BỊ đã vẽ sẵn trong khung */
  E.nm=mk('div','tb-nm',NM.x,NM.y,NM.w,NM.h);
  E.oc=OC_X.map(function(cx){var c=mk('canvas','tb-oc',cx-OC_S/2,OC_Y-OC_S/2,OC_S,OC_S);c.width=c.height=208;return c;});
  E.cv=mk('canvas','tb-cv',PET.cx-CV.w/2,PET.by-CV.up,CV.w,CV.up+CV.down);
  E.emp=mk('div','tb-emp',TXT.x,TXT.y,TXT.w,TXT.h,'Chưa có Thú ra trận');
  /* nút BỎ TRANG BỊ: ảnh phủ (x1376,y682 cỡ 182x74) đè lên nút TRANG BỊ vẽ sẵn khi đang chọn món ĐÃ mặc; bật/tắt bằng TTGTB.setBo(true/false) (chờ làm 8 ô trang bị để nối) */
  E.ovB=mk('img','tb-ov',1284,746,153,66);E.ovB.src=OV_BO;E.ovB.alt='';E.ovB.draggable=false;
  /* nút X vẽ sẵn trong ảnh (tâm ~ x1587,y84): vùng bấm trong suốt 124x124 */
  var x=mk('button','tb-x',1525,22,124,124);x.type='button';x.setAttribute('aria-label','Đóng');x.addEventListener('click',close);
  document.body.appendChild(root);
  /* bấm ra ngoài khung thì đóng (chặn 400ms đầu để cú chạm mở không đóng luôn) */
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  /* Esc: bắt ở pha capture và chặn lại, để chỉ đóng khung này, KHÔNG đóng luôn panel Thú Thần bên dưới */
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape'){e.stopImmediatePropagation();close();}},true);
  window.addEventListener('resize',unit);
}
/* hiện thú ra trận (lấy từ TTGTHU.getRaTran()); không có thì ẩn thú, hiện chữ */
function fitName(){var fs=20;E.nm.style.fontSize='calc(var(--u)*'+fs+')';while(E.nm.scrollWidth>E.nm.clientWidth+1&&fs>10){fs--;E.nm.style.fontSize='calc(var(--u)*'+fs+')';}}
function render(){
  var t=window.TTGTHU&&TTGTHU.getRaTran&&TTGTHU.getRaTran(),a=t&&TTGTHU.anh?TTGTHU.anh(t):'';
  cur=a?t:null;
  if(a){if(petSrc!==a){petSrc=a;petImg=new Image();petImg.src=a;}E.cv.style.display='';E.emp.style.display='none';}
  else{petSrc='';petImg=null;E.cv.style.display='none';E.emp.style.display='flex';}
  E.nm.textContent=t&&TTGTHU.ten?TTGTHU.ten(t):'';if(t)fitName();
  if(TTGTHU&&TTGTHU.badges)TTGTHU.badges(E.oc,t||null);
}
/* canvas thú + vòng rune + aura (giống sảnh/Thám Hiểm: lượt 'sau' = vòng+aura, vẽ thú, lượt 'truoc' = nửa vòng đè chân thú) */
function sizeCv(){if(!E.cv)return;var r=E.cv.getBoundingClientRect(),d=window.devicePixelRatio||1,w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(E.cv.width!==w||E.cv.height!==h){E.cv.width=w;E.cv.height=h;}}
function drawPet(ts){
  var cv=E.cv;if(!cv||cv.style.display==='none')return;
  var ctx=cv.getContext('2d'),S=PET.size/128,k=(cv.width/CV.w)*S,x=CV.w/2/S,gy=CV.up/S;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.setTransform(k,0,0,k,0,0);
  var rk=cur?(cur.bac||'C'):null;if(rk&&!(window.TTGBAO&&TTGBAO.RKC&&TTGBAO.RKC[rk]))rk='C';
  var R=window.TTGRUNE;
  if(R&&rk)R.ring(ctx,rk,x,gy,ts,'sau');
  var im=petImg&&petImg.complete&&petImg.naturalWidth?petImg:null;
  if(im){var sc=Math.min(128/im.naturalWidth,128/im.naturalHeight),w=im.naturalWidth*sc,h=im.naturalHeight*sc,bob=Math.sin(ts/380)*2;
    ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x,gy,34,5,0,0,6.2832);ctx.fill();
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x-w/2,gy-h+bob,w,h);}
  if(R&&rk)R.ring(ctx,rk,x,gy,ts,'truoc');
}
function loop(ts){if(!isOpen){raf=0;return;}drawPet(ts);raf=requestAnimationFrame(loop);}
function open(){if(!root)build();render();isOpen=true;openAt=performance.now();root.classList.add('on');unit();sizeCv();fitName();if(!raf)raf=requestAnimationFrame(loop);}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');}

function setBo(on){if(E.ovB)E.ovB.classList.toggle('on',!!on);}   /* on=true: hiện nút BỎ TRANG BỊ đè lên TRANG BỊ */
window.TTGTB={open:open,close:close,isOpen:function(){return isOpen;},setBo:setBo};
})();
