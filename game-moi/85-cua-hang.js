/* 85-cua-hang.js - KỲ TRÂN CÁC (cửa hàng). BƯỚC 1 (25/11/2026): chỉ có KHUNG + hiện TIỀN TỆ. CHƯA có vật phẩm, chưa mua bán.
   Ảnh khung: game-moi/khung-cua-hang.webp (1672x941, đã tách nền). Chữ "Kỳ Trân Các", nút X, 4 nhãn bên trái (Tất Cả / Đạo Cụ / Pháp Bảo / Đặc Biệt),
   8 ô vật phẩm trống, 2 ô tiền ở góc phải dưới đều đã VẼ SẴN trong ảnh. Module chỉ phủ vùng bấm trong suốt + vẽ số tiền lên 2 ô tiền.
   Mở: bấm nút Kỳ Trân Các (81-nut-moi.js gọi TTGSHOP.open). Đóng: nút X, chạm ngoài khung, hoặc phím Esc.
   Tiền: đọc từ 66-tien-te.js (TTGTIEN): ô trái (ngọc lam) = Tinh Thạch 'tt', ô phải (ngọc tím) = Thú Thần Thạch 'ttt'. Số tiền tự cập nhật mỗi 0,5s khi bảng đang mở.
   Tọa độ tính theo pixel ảnh khung (SW x SH). Đổi ảnh khung khác thì chỉ sửa khối BOX bên dưới.
   Việc kế tiếp (chưa làm): đưa vật phẩm vào 8 ô (ô nằm ở BOX.slots), 4 tab bên trái (BOX.tabs), ô thông tin dưới trái (BOX.info). */
(function(){
'use strict';
var SW=1672,SH=941,IMG='game-moi/khung-cua-hang.webp?v=1';
var BOX={
  close:{x:1515,y:128,w:130,h:130},                       /* vùng bấm phủ lên nút X vẽ sẵn ở góc phải trên */
  tt:{x:1128,y:802,w:178,h:62},                           /* ô tiền trái (ngọc lam): Tinh Thạch */
  ttt:{x:1402,y:802,w:182,h:62},                          /* ô tiền phải (ngọc tím): Thú Thần Thạch */
  tabs:[{x:92,y:258,w:280,h:118},{x:92,y:392,w:280,h:98},{x:92,y:502,w:280,h:98},{x:92,y:612,w:280,h:98}],   /* Tất Cả / Đạo Cụ / Pháp Bảo / Đặc Biệt (chưa gắn chức năng) */
  info:{x:112,y:812,w:480,h:62}                           /* ô dài dưới trái (để dành: tên/giá món đang chọn) */
};
var root,fr,E={},isOpen=false,openAt=0,timer=0;

var css=[
'.sh{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.sh.on{display:flex}',
'.sh-fr{position:relative;width:min(98vw,calc(96vh*'+SW+'/'+SH+'));aspect-ratio:'+SW+'/'+SH+';background:url('+IMG+') 0 0/100% 100% no-repeat;--u:1px;animation:sh-in .18s ease-out}',
'@keyframes sh-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}',
'.sh-fr>*{position:absolute;box-sizing:border-box}',
'.sh-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer;touch-action:manipulation} /* nút X đã vẽ sẵn trong khung: nút này chỉ là vùng bấm trong suốt */',
'.sh-x:active{box-shadow:0 0 calc(var(--u)*24) rgba(255,224,102,.85),inset 0 0 calc(var(--u)*24) rgba(255,224,102,.35)}',
'.sh-m{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*34);line-height:1;white-space:nowrap;overflow:hidden;pointer-events:none;text-shadow:0 0 calc(var(--u)*6) #02061c,calc(var(--u)*2) calc(var(--u)*2) 0 #02061c,calc(var(--u)*-2) calc(var(--u)*2) 0 #02061c}',
'.sh-m.tt{color:#bdf3ff}',   /* cùng màu với số Tinh Thạch ở sảnh (66-tien-te.js) */
'.sh-m.ttt{color:#e6c8ff}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

function box(c,b){var s=c.style;s.left=(b.x/SW*100)+'%';s.top=(b.y/SH*100)+'%';s.width=(b.w/SW*100)+'%';s.height=(b.h/SH*100)+'%';return c;}
function mk(tag,cls,b){var c=document.createElement(tag);c.className=cls;box(c,b);fr.appendChild(c);return c;}
function unit(){if(fr)fr.style.setProperty('--u',(fr.clientWidth/SW)+'px');}
function fmt(n){return window.TTGTIEN&&TTGTIEN.fmt?TTGTIEN.fmt(n):String(n);}
function get(k){return window.TTGTIEN?TTGTIEN.get(k):0;}
/* Số dài quá ô thì thu nhỏ chữ cho vừa (không bị cắt) */
function fit(el,t){el.textContent=t;el.style.fontSize='';var f=34,u=fr.clientWidth/SW;while(f>12&&el.scrollWidth>el.clientWidth+1){f--;el.style.fontSize='calc(var(--u)*'+f+')';if(u<=0)break;}}
function render(){if(!root)return;fit(E.tt,fmt(get('tt')));fit(E.ttt,fmt(get('ttt')));}

function build(){
  root=document.createElement('div');root.className='sh';
  fr=document.createElement('div');fr.className='sh-fr';root.appendChild(fr);
  E.x=mk('button','sh-x',BOX.close);E.x.type='button';E.x.setAttribute('aria-label','Đóng');
  E.tt=mk('div','sh-m tt',BOX.tt);E.ttt=mk('div','sh-m ttt',BOX.ttt);
  document.body.appendChild(root);
  E.x.addEventListener('click',close);
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});   /* chạm ngoài khung = đóng (chống chạm nhầm 0,4s đầu) */
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close();});
  window.addEventListener('resize',function(){unit();render();});
}
function open(){
  if(window.TTGBALO&&TTGBALO.close)TTGBALO.close();   /* mở cửa hàng -> đóng Balo / panel Thú Thần cho khỏi chồng nhau */
  if(window.TTGTHU&&TTGTHU.close)TTGTHU.close();
  if(!root)build();
  isOpen=true;openAt=performance.now();root.classList.add('on');unit();render();
  clearInterval(timer);timer=setInterval(render,500);
}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');clearInterval(timer);}

window.TTGSHOP={open:open,close:close,BOX:BOX,isOpen:function(){return isOpen;}};
})();
