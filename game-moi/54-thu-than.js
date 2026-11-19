/* 54-thu-than.js - Nút "Thú Thần" + panel Thú Thần (chứa và trang bị thú đã bắt).
   Cần 52-nut-vuong.js (TTGNV) nạp trước; nạp SAU 53-balo.js (để đóng Balo khi mở panel này).
   TIẾN ĐỘ: BƯỚC 1 = nút + icon + quy tắc đóng/mở (xong). BƯỚC 2 = khung ảnh game-moi/khung-thu.webp (2200x996, hiển thị đúng cỡ gốc 1 pixel ảnh = 1 pixel máy để không bị mờ) + đóng bằng nút X / bấm ngoài / Esc (xong). Bước 3 (bố cục: tên thú, chỉ số, ô kỹ năng, lưới thú, nút Ra trận) chưa làm: khung đang trống.
   QUY TẮC: mở Thú Thần thì đóng Balo, mở Balo thì đóng Thú Thần (53-balo.js gọi TTGTHU.close()).
   API: TTGTHU.open() / .close() / .isOpen() */
(function(){
'use strict';
if(!window.TTGNV)return;
var BW=2200,BH=996,IMG='game-moi/khung-thu.webp?v=4';   /* ảnh khung gốc 2200x996 (không phóng to, nén không mất chất lượng); mọi tọa độ bên dưới tính theo pixel ảnh này */
var isOpen=false,openAt=0,root=null,fr=null;

/* ===== CSS: {n} = n px ảnh (tự co theo --u) ===== */
var css=[
'.tt{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.tt.on{display:flex}',
'.tt-fr{position:relative;width:min(98vw,calc(96vh*2200/996));aspect-ratio:2200/996;background:url('+IMG+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.tt-fr>*{position:absolute;box-sizing:border-box}',
'.tt button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.tt-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}'   /* vùng bấm trong suốt đè lên nút X vẽ sẵn trong ảnh */
].join('\n').replace(/\{(\d+(?:\.\d+)?)\}/g,'calc(var(--u)*$1)');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ===== DỰNG PANEL (một lần) ===== */
function box(c,x,y,w,h){var s=c.style;s.left=(x/BW*100)+'%';s.top=(y/BH*100)+'%';s.width=(w/BW*100)+'%';s.height=(h/BH*100)+'%';return c;}
function mk(tag,cls,x,y,w,h){var c=document.createElement(tag);if(cls)c.className=cls;if(w)box(c,x,y,w,h);fr.appendChild(c);return c;}
/* KHÔNG PHÓNG TO QUÁ CỠ GỐC: chiều rộng khung tối đa = BW / devicePixelRatio (CSS px) => đúng 1 pixel ảnh = 1 pixel màn hình, nét nhất.
   Màn nhỏ hơn thì tự thu nhỏ lại. Muốn khung to hơn (đổi nét lấy kích thước): đổi MAXSCALE lên >1 (vd 1.3). */
var MAXSCALE=1;
function unit(){if(!fr)return;var d=window.devicePixelRatio||1;fr.style.maxWidth=(BW*MAXSCALE/d)+'px';fr.style.setProperty('--u',(fr.clientWidth/BW)+'px');}
function build(){
  root=document.createElement('div');root.className='tt';
  fr=document.createElement('div');fr.className='tt-fr';root.appendChild(fr);
  /* nút X đã vẽ sẵn trong ảnh (tâm ~ x2101,y112 trên ảnh đã cắt): chỉ đặt vùng bấm trong suốt đè lên, đường kính 190 */
  var x=mk('button','tt-x',2006,17,190,190);x.type='button';x.setAttribute('aria-label','Đóng');x.addEventListener('click',close);
  document.body.appendChild(root);
  /* bấm ra ngoài khung thì đóng (chặn 400ms đầu để cú chạm mở nút không đóng luôn) + phím Esc */
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close();});
  window.addEventListener('resize',unit);
}
function open(){
  if(window.TTGBALO&&TTGBALO.close)TTGBALO.close();   /* mở panel này -> đóng Balo */
  if(!root)build();
  isOpen=true;openAt=performance.now();root.classList.add('on');unit();
}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');}

/* ===== ICON NÚT THÚ THẦN (SVG vẽ tay: dấu chân thú xanh đêm, viền vàng, tinh thể ngọc lam ở chính giữa) =====
   Cùng phong cách icon Balo (xanh đêm + viền vàng + tinh thể). id gradient dùng tiền tố tt để không trùng icon Balo. */
var ICON='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>'
+'<linearGradient id="ttB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f7cff"/><stop offset="1" stop-color="#3a35b0"/></linearGradient>'
+'<linearGradient id="ttG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset=".5" stop-color="#e6b13a"/><stop offset="1" stop-color="#a8701a"/></linearGradient>'
+'<linearGradient id="ttT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9fff7"/><stop offset=".55" stop-color="#2fd1c5"/><stop offset="1" stop-color="#0b7f93"/></linearGradient></defs>'
/* 4 ngón */
+'<g fill="url(#ttB)" stroke="url(#ttG)" stroke-width="1.7">'
+'<ellipse cx="11.5" cy="29" rx="5.6" ry="7.6" transform="rotate(-24 11.5 29)"/>'
+'<ellipse cx="23" cy="17.5" rx="6" ry="8.6" transform="rotate(-8 23 17.5)"/>'
+'<ellipse cx="41" cy="17.5" rx="6" ry="8.6" transform="rotate(8 41 17.5)"/>'
+'<ellipse cx="52.5" cy="29" rx="5.6" ry="7.6" transform="rotate(24 52.5 29)"/></g>'
/* đệm chính */
+'<path d="M32 29.5C40.5 29.5 47.5 37.5 48.6 46C49.4 52.6 44.6 58 38.4 57.2C35.6 56.8 34 55.6 32 55.6C30 55.6 28.4 56.8 25.6 57.2C19.4 58 14.6 52.6 15.4 46C16.5 37.5 23.5 29.5 32 29.5Z" fill="url(#ttB)" stroke="url(#ttG)" stroke-width="2" stroke-linejoin="round"/>'
/* ánh sáng trên các ngón */
+'<g fill="#fff" fill-opacity=".22"><ellipse cx="21.6" cy="13.6" rx="2" ry="3.4" transform="rotate(-8 21.6 13.6)"/><ellipse cx="39.6" cy="13.6" rx="2" ry="3.4" transform="rotate(8 39.6 13.6)"/></g>'
/* tinh thể ngọc lam */
+'<path d="M32 36.5L38.2 45 32 53.5 25.8 45Z" fill="url(#ttT)" stroke="url(#ttG)" stroke-width="1.4" stroke-linejoin="round"/>'
+'<path d="M32 39.2L35 45 32 45Z" fill="#fff" fill-opacity=".75"/>'
/* tia sáng nhỏ */
+'<path d="M56 4.5L57.2 8 60.7 9.2 57.2 10.4 56 14 54.8 10.4 51.3 9.2 54.8 8Z" fill="#c9fff7"/>'
+'<path d="M8.5 6.5L9.3 8.7 11.5 9.5 9.3 10.3 8.5 12.5 7.7 10.3 5.5 9.5 7.7 8.7Z" fill="#fff3b8"/></svg>';

/* Nút thêm sau nút Balo, r:0 = CÙNG HÀNG (hàng trên) với Balo, nằm ngay bên phải. Chữ "Thú Thần" dài hơn "Balo" nên thu nhỏ chữ để không tràn khung nút. */
var btn=TTGNV.add({id:'thu-than',ten:'Thú Thần',icon:ICON,onTap:open,r:0});
var tx=btn.querySelector('.nv-tx');
if(tx){tx.style.fontSize='.82em';tx.style.letterSpacing='0';}   /* chỉnh .82em nếu chữ vẫn tràn / còn nhỏ */

window.TTGTHU={open:open,close:close,isOpen:function(){return isOpen;}};
})();
