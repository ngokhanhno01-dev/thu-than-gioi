/* DANH HIỆU NỔI TRÊN ĐẦU NHÂN VẬT (26/11/2026: chuyển từ đầu THÚ sang đầu NHÂN VẬT).
   File này chỉ còn là HÀM VẼ DÙNG CHUNG: TTGDHDAU.draw(ctx, cx, headY, w) vẽ ảnh danh hiệu ĐANG MẶC (TTGTB.dangMac -> món có dh -> img)
   căn giữa theo cx, đáy ảnh nằm ngay trên đỉnh đầu (headY). Không có danh hiệu đang mặc thì không vẽ gì.
   Nơi gọi: sảnh = 84b-nhan-vat-sanh.js (hàm draw), đi thám hiểm = 89-tham-hiem-map.js (drawPlayer). Giao diện chiến đấu KHÔNG vẽ.
   Mọi lỗi đều bị nuốt (try/catch) để không bao giờ làm sập vòng vẽ. */
(function(root){'use strict';
var imgs={};
function getImg(src){var e=imgs[src];if(!e){e=imgs[src]=new Image();e.src=src;}return(e.complete&&e.naturalWidth)?e:null;}
function worn(){try{var tb=root.TTGTB;if(!tb||!tb.dangMac)return null;var a=tb.dangMac(),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].dh&&a[i].img)return a[i].img;}catch(e){}return null;}
/* w = bề rộng ảnh danh hiệu (đơn vị của ctx); gap = khoảng hở giữa đáy danh hiệu và đỉnh đầu (số âm = đè xuống đầu) */
function draw(c,cx,headY,w,gap){
  try{var src=worn(),im=src&&getImg(src);if(!im)return false;
    var h=w*im.naturalHeight/im.naturalWidth,top=headY-(gap||0)-h;
    c.save();c.imageSmoothingEnabled=true;try{c.imageSmoothingQuality='high';}catch(e1){}
    c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=w*.04;c.shadowOffsetY=w*.012;
    c.drawImage(im,cx-w/2,top,w,h);c.restore();return true;}
  catch(e){try{c.restore();}catch(e2){}return false;}}
root.TTGDHDAU={draw:draw,worn:worn};
})(window);
