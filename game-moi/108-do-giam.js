/* ===== 108-do-giam.js (TTGDOGIAM): MÀN ĐỒ GIÁM, BẢN THỬ HIỆU ỨNG LẬT TRANG, BỘ ẢNH MỚI 8 KHUNG (28/11/2026) =====
   Mở: nút Đồ Giám (81-nut-moi.js). Chạm trang PHẢI hoặc vuốt sang trái = trang sau; chạm trang TRÁI hoặc vuốt sang phải = trang trước (chạy ngược khung).
   Đóng: nút X trên khung, chạm ngoài sách, Esc.
   Ảnh: game-moi/do-giam/lat-0..7.webp (1280x718, nền trong suốt, đã canh khít theo ảnh gốc): 0 = sách phẳng (khung nghỉ), 1..7 = các khung lật. Lật tới: 0,1,2,3,4,5,6,7,0; lật lùi chạy ngược.
   CHƯA CÓ NỘI DUNG: số trang chỉ là tạm (TRANG) để thấy trang đã đổi. Chỉnh nhịp lật ở NHIP: giu = giữ nguyên khung (ms), hoa = hòa sang khung kế (ms). */
(function(root){
'use strict';
var D=document,IW=1280,IH=718,N=8,TRANG=5,DIR='game-moi/do-giam/lat-';
var NHIP=[{giu:0,hoa:55},{giu:15,hoa:55},{giu:15,hoa:55},{giu:15,hoa:55},{giu:15,hoa:55},{giu:15,hoa:60},{giu:15,hoa:70},{giu:20,hoa:130}];   /* 8 chặng: gốc->k1, k1->k2, ..., k6->k7, k7->gốc (tổng ~650ms) */
var XB={x:1197,y:122,r:48};   /* tâm + bán kính chạm của nút X, theo pixel ảnh */
var IMG=[],ov=null,cv=null,cx=null,page=0,anim=null,raf=0,down=null;
function nap(){if(IMG.length)return;for(var i=0;i<N;i++){var im=new Image();im.onload=ve;im.src=DIR+i+'.webp?v=2';IMG.push(im);}}
function san(){return IMG.length===N&&IMG.every(function(i){return i.complete&&i.naturalWidth>0;});}
function build(){
  var s=D.createElement('style');s.textContent='#dg-ov{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(2,4,18,.78);-webkit-tap-highlight-color:transparent;touch-action:none;user-select:none;-webkit-user-select:none}#dg-ov canvas{position:static;display:block;image-rendering:auto}';D.head.appendChild(s);
  ov=D.createElement('div');ov.id='dg-ov';cv=D.createElement('canvas');ov.appendChild(cv);D.body.appendChild(ov);cx=cv.getContext('2d');
  ov.addEventListener('pointerdown',function(e){down={x:e.clientX,y:e.clientY};});
  ov.addEventListener('pointerup',function(e){if(!down)return;var d=down;down=null;var r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*IW,y=(e.clientY-r.top)/r.height*IH,dx=e.clientX-d.x;
    if(Math.abs(dx)>40){lat(dx<0?1:-1);return;}
    if(Math.hypot(x-XB.x,y-XB.y)<=XB.r){close();return;}
    if(x<0||x>IW||y<0||y>IH){close();return;}
    if(y>150&&y<560)lat(x>IW/2?1:-1);});
  ov.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();});
  root.addEventListener('resize',function(){if(isOpen()){size();ve();}});
  D.addEventListener('keydown',function(e){if(!isOpen())return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')lat(1);else if(e.key==='ArrowLeft')lat(-1);});}
function size(){var w=Math.min(innerWidth*.98,innerHeight*.98*IW/IH),h=w*IH/IW,d=Math.min(3,root.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*d);cv.height=Math.round(h*d);}
/* trạng thái lúc t ms: [khung đang có, khung đang hòa vào, độ hòa 0..1, chặng] ; null = lật xong. Chỉ số khung 0..7 = ảnh lat-0..7 */
function moc(t,huong){var seq=huong>0?[0,1,2,3,4,5,6,7,0]:[0,7,6,5,4,3,2,1,0],i,n;
  for(i=0;i<N;i++){n=NHIP[i];if(t<n.giu)return[seq[i],seq[i],0,i];t-=n.giu;if(t<n.hoa){var u=t/n.hoa;return[seq[i],seq[i+1],u*u*(3-2*u),i];}t-=n.hoa;}
  return null;}
function chu(n,x,a){cx.save();cx.globalAlpha=a;cx.font='bold 23px "Noto Serif",Georgia,serif';cx.textAlign='center';cx.textBaseline='middle';cx.lineWidth=6;cx.strokeStyle='rgba(4,10,50,.85)';cx.fillStyle='#ffe9a8';var t='Trang '+n;cx.strokeText(t,x,523);cx.fillText(t,x,523);cx.restore();}
function ve(){
  if(!cx||!isOpen())return;cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,cv.width,cv.height);
  if(!san())return;cx.setTransform(cv.width/IW,0,0,cv.height/IH,0,0);cx.imageSmoothingEnabled=true;try{cx.imageSmoothingQuality='high';}catch(e){}
  var m=anim?moc(performance.now()-anim.t0,anim.huong):null,a=1;
  if(!m){cx.drawImage(IMG[0],0,0);}
  else{cx.drawImage(IMG[m[0]],0,0);if(m[2]>0){cx.globalAlpha=m[2];cx.drawImage(IMG[m[1]],0,0);cx.globalAlpha=1;}
    a=0;if(m[3]===N-1)a=m[2];}   /* chữ ẩn trong lúc trang đang bay, hiện dần khi sách phẳng lại */
  if(a>0){chu(page*2+1,367,a);chu(page*2+2,919,a);}}
function buoc(){raf=0;if(!anim)return;if(!moc(performance.now()-anim.t0,anim.huong)){anim=null;ve();return;}ve();raf=requestAnimationFrame(buoc);}
/* huong: 1 = trang sau, -1 = trang trước. Đang lật hoặc hết trang thì bỏ qua. Trả true nếu bắt đầu lật. */
function lat(huong){if(anim||!isOpen()||!san())return false;var p=page+huong;if(p<0||p>=TRANG)return false;page=p;anim={t0:performance.now(),huong:huong};if(!raf)raf=requestAnimationFrame(buoc);return true;}
function isOpen(){return !!ov&&ov.style.display==='flex';}
function open(){nap();if(!ov)build();page=0;anim=null;ov.style.display='flex';size();ve();}
function close(){anim=null;if(raf){cancelAnimationFrame(raf);raf=0;}if(ov)ov.style.display='none';}
root.TTGDOGIAM={open:open,close:close,isOpen:isOpen,lat:lat,NHIP:NHIP};
})(typeof window!=='undefined'?window:globalThis);
