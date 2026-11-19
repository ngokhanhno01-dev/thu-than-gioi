/* 55-trang-bi.js - Khung TRANG BỊ của thú (mở từ nút "Trang Bị" trong panel Thú Thần, 54-thu-than.js).
   Ảnh khung: game-moi/khung-trang-bi.webp (1456x669). Hiển thị đúng cỡ gốc (1 pixel ảnh = 1 pixel máy) để không bị mờ, màn nhỏ thì tự co.
   MỌI TỌA ĐỘ tính theo PIXEL ẢNH ĐÃ CẮT 1456x669 (BW x BH), tự co theo màn hình bằng biến --u (= 1 px ảnh).
   TIẾN ĐỘ: KHUNG + đóng (nút X / bấm ra ngoài / Esc) + chữ "Trang Bị" + thú RA TRẬN đứng trên bục bên trái (có nhịp thở như ở sảnh).
   Không có thú ra trận (TTGTHU.getRaTran() = null) thì KHÔNG hiện thú, chỉ hiện chữ "Chưa có Thú ra trận".
   CHƯA LÀM: 8 ô trang bị 2 bên, lưới 4x6 đồ, bảng thông tin bên phải, 2 nút dưới bảng.
   Mở nằm ĐÈ LÊN panel Thú Thần (đóng khung này thì quay lại Thú Thần); đóng panel Thú Thần/mở Balo thì khung này cũng đóng.
   API: TTGTB.open() / .close() / .isOpen() */
(function(){
'use strict';
var BW=1456,BH=669,IMG='game-moi/khung-trang-bi.webp?v=1';
var isOpen=false,openAt=0,root=null,fr=null,E={};
/* ===== THÚ TRÊN BỤC (chỗ chỉnh số, px ảnh khung 1456x669) =====
   cx = tâm ngang bục, by = đường chân thú (mặt bục), size = cạnh ảnh thú (ảnh gốc 192px, to quá sẽ mờ). */
var PET={cx:377,by:480,size:250};
var TXT={x:190,y:300,w:370,h:120};   /* khối chữ "Chưa có Thú ra trận" (giữa 2 cột ô trang bị, phía trên bục) */
/* NHỊP THỞ: giống sảnh (index.html petSanh: nhấp nhô sin(ts/380)*2 px trên ảnh thú 128px => biên độ 2/128 cỡ thú, chu kỳ ~2,39s).
   Ở đây dùng CSS: chạy lên-xuống qua lại (alternate) mỗi nửa chu kỳ 1,194s. Muốn thở mạnh/yếu: đổi BOB (px ảnh khung). */
var BOB=PET.size*2/128;

var css=[
'.tb{--fh:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;position:fixed;left:0;top:0;right:0;bottom:0;z-index:62;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.tb.on{display:flex}',
'.tb-fr{position:relative;width:min(98vw,calc(96vh*1456/669));aspect-ratio:1456/669;background:url('+IMG+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.tb-fr>*{position:absolute;box-sizing:border-box}',
'.tb button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.tb-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}',   /* vùng bấm trong suốt đè lên nút X vẽ sẵn trong ảnh */
'.tb-pet{display:flex;align-items:flex-end;justify-content:center;pointer-events:none}',
'.tb-pet img{width:100%;height:100%;object-fit:contain;-webkit-user-drag:none;user-select:none;filter:drop-shadow(0 {6} {10} rgba(0,0,0,.55));animation:tbBob 1.194s ease-in-out infinite alternate}',
'@keyframes tbBob{from{transform:translateY(calc(var(--u)*-'+BOB+'))}to{transform:translateY(calc(var(--u)*'+BOB+'))}}',
'.tb-emp{display:flex;align-items:center;justify-content:center;text-align:center;font-size:{28};line-height:1.4;color:#7c83b8;padding:0 {20}}',
'.tb-t{display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{26};line-height:1;white-space:nowrap;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7)}'
].join('\n').replace(/\{(\d+(?:\.\d+)?)\}/g,'calc(var(--u)*$1)');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function box(c,x,y,w,h){var s=c.style;s.left=(x/BW*100)+'%';s.top=(y/BH*100)+'%';s.width=(w/BW*100)+'%';s.height=(h/BH*100)+'%';return c;}
function mk(tag,cls,x,y,w,h,txt){var c=document.createElement(tag);if(cls)c.className=cls;if(txt!=null)c.textContent=txt;if(w)box(c,x,y,w,h);fr.appendChild(c);return c;}
/* KHÔNG PHÓNG TO QUÁ CỠ GỐC (như panel Thú Thần): muốn khung to hơn thì đổi MAXSCALE lên >1 */
var MAXSCALE=1;
function unit(){if(!fr)return;var d=window.devicePixelRatio||1;fr.style.maxWidth=(BW*MAXSCALE/d)+'px';fr.style.setProperty('--u',(fr.clientWidth/BW)+'px');}

function build(){
  root=document.createElement('div');root.className='tb';
  fr=document.createElement('div');fr.className='tb-fr';root.appendChild(fr);
  mk('div','tb-t',271,146,209,30,'Trang Bị');   /* thanh vàng trên-trái (x271-480,y146-176) */
  E.pet=mk('div','tb-pet',PET.cx-PET.size/2,PET.by-PET.size,PET.size,PET.size);
  E.emp=mk('div','tb-emp',TXT.x,TXT.y,TXT.w,TXT.h,'Chưa có Thú ra trận');
  /* nút X vẽ sẵn trong ảnh (tâm ~ x1394,y78): vùng bấm trong suốt 120x120 */
  var x=mk('button','tb-x',1334,18,120,120);x.type='button';x.setAttribute('aria-label','Đóng');x.addEventListener('click',close);
  document.body.appendChild(root);
  /* bấm ra ngoài khung thì đóng (chặn 400ms đầu để cú chạm mở không đóng luôn) */
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  /* Esc: bắt ở pha capture và chặn lại, để chỉ đóng khung này, KHÔNG đóng luôn panel Thú Thần bên dưới */
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape'){e.stopImmediatePropagation();close();}},true);
  window.addEventListener('resize',unit);
}
/* hiện thú ra trận (lấy từ TTGTHU.getRaTran()); không có thì ẩn thú, hiện chữ */
function render(){
  var t=window.TTGTHU&&TTGTHU.getRaTran&&TTGTHU.getRaTran(),a=t&&TTGTHU.anh?TTGTHU.anh(t):'';
  if(a){E.pet.innerHTML='<img src="'+a.replace(/"/g,'&quot;')+'" alt="">';E.pet.style.display='';E.emp.style.display='none';}
  else{E.pet.innerHTML='';E.pet.style.display='none';E.emp.style.display='flex';}
}
function open(){if(!root)build();render();isOpen=true;openAt=performance.now();root.classList.add('on');unit();}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');}

window.TTGTB={open:open,close:close,isOpen:function(){return isOpen;}};
})();
