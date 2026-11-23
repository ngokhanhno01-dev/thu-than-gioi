/* DANH HIỆU NỔI TRÊN ĐẦU THÚ (sảnh). Không sửa index.html: bọc THU_MOI.draw, mỗi lần sảnh vẽ thú (size 128, fine=true, canvas #g)
   thì vẽ luôn ảnh danh hiệu ĐANG MẶC (TTGTB.dangMac -> món có dh -> img) ngay trên đầu thú, nhấp nhô cùng nhịp thở.
   Chỉnh vị trí/kích thước ở 3 số dưới đây. Mọi lỗi đều bị nuốt (try/catch) để không bao giờ làm sập vòng vẽ. */
(function(root){'use strict';
var TW=130,        /* chiều rộng ảnh danh hiệu (điểm game) */
    DY=0,          /* nâng ảnh danh hiệu lên cao thêm bấy nhiêu điểm (số âm = hạ xuống sát đầu) */
    MINTOP=4;      /* không cho ảnh vượt quá mép trên canvas */
var imgs={};
function getImg(src){var e=imgs[src];if(!e){e=imgs[src]=new Image();e.src=src;}return(e.complete&&e.naturalWidth)?e:null;}
function worn(){try{var tb=root.TTGTB;if(!tb||!tb.dangMac)return null;var a=tb.dangMac(),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].dh&&a[i].img)return a[i].img;}catch(e){}return null;}
function hook(){var M=root.THU_MOI;if(!M||!M.draw||M.draw.__dh)return false;
 var orig=M.draw;
 M.draw=function(ctx,id,bac,cx,by,size,fine){
  var ok=orig.apply(this,arguments);
  try{if(ok&&fine===true&&size===128&&ctx&&ctx.canvas&&ctx.canvas.id==='g'){
   var src=worn(),im=src&&getImg(src);
   if(im){var w=TW,h=w*im.naturalHeight/im.naturalWidth,bottom=by-128+34-DY;
    /* by-128 = đỉnh khung thú 128; +34 vì thú thường thấp hơn đỉnh khung; DY = khoảng hở trên đầu */
    var top=bottom-h;if(top<MINTOP){var k=(bottom-MINTOP)/h;if(k<.55)k=.55;w*=k;h*=k;top=bottom-h;}
    ctx.save();try{var tm=ctx.getTransform&&ctx.getTransform();if(tm&&tm.a<0){ctx.translate(cx,0);ctx.scale(-1,1);ctx.translate(-cx,0);}}catch(e){}/* thú sảnh quay mặt (lật ngang) thì lật lại để chữ danh hiệu không bị ngược */ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=6;ctx.shadowOffsetY=2;
    ctx.drawImage(im,cx-w/2,top,w,h);ctx.restore();}}}catch(e){}
  return ok;};
 M.draw.__dh=1;return true;}
if(!hook()){var n=0,iv=setInterval(function(){if(hook()||++n>100)clearInterval(iv);},100);}
})(window);
