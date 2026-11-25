/* DANH HIỆU NỔI TRÊN ĐẦU THÚ (sảnh). Không sửa index.html: bọc THU_MOI.draw, mỗi lần sảnh vẽ thú (size 128, fine=true, canvas #g)
   thì vẽ luôn ảnh danh hiệu ĐANG MẶC (TTGTB.dangMac -> món có dh -> img) ngay trên đầu thú, nhấp nhô cùng nhịp thở.
   Chỉnh vị trí/kích thước ở 3 số dưới đây. Mọi lỗi đều bị nuốt (try/catch) để không bao giờ làm sập vòng vẽ. */
(function(root){'use strict';
var TW=165,        /* chiều rộng ảnh danh hiệu (điểm game) */
    DY=0,          /* khoảng hở giữa đáy danh hiệu và ĐỈNH ĐẦU thú (điểm game; số âm = đè xuống đầu thú) */
    MINTOP=4;      /* không cho ảnh vượt quá mép trên canvas */
var imgs={};
function getImg(src){var e=imgs[src];if(!e){e=imgs[src]=new Image();e.src=src;}return(e.complete&&e.naturalWidth)?e:null;}
function topFrac(im){if(!im||!im.naturalWidth)return .27;if(im.__tf!==undefined)return im.__tf;var tf=.27;
 try{var c=document.createElement('canvas'),w=c.width=im.naturalWidth,h=c.height=im.naturalHeight,g=c.getContext('2d'),d,y,x;g.drawImage(im,0,0);d=g.getImageData(0,0,w,h).data;
  for(y=0;y<h;y++){for(x=0;x<w;x++)if(d[(y*w+x)*4+3]>40){tf=y/h;y=h;break;}}}catch(e){}
 im.__tf=tf;return tf;}
function worn(){try{var tb=root.TTGTB;if(!tb||!tb.dangMac)return null;var a=tb.dangMac(),i;for(i=0;i<a.length;i++)if(a[i]&&a[i].dh&&a[i].img)return a[i].img;}catch(e){}return null;}
function hook(){var M=root.THU_MOI;if(!M||!M.draw||M.draw.__dh)return false;
 var orig=M.draw;
 M.draw=function(ctx,id,bac,cx,by,size,fine){
  var spr=null,od=ctx&&ctx.drawImage,own=!!ctx&&Object.prototype.hasOwnProperty.call(ctx,'drawImage');
  if(od){ctx.drawImage=function(a){if(!spr&&a&&a.naturalWidth)spr=a;return od.apply(this,arguments);};}   /* bắt ảnh thú vừa vẽ để đo đỉnh đầu thật */
  var ok;try{ok=orig.apply(this,arguments);}finally{if(od){if(own)ctx.drawImage=od;else delete ctx.drawImage;}}
  try{if(ok&&fine===true&&size===128&&ctx&&ctx.canvas&&ctx.canvas.id==='g'){
   var src=worn(),im=src&&getImg(src);
   if(im){var w=TW,h=w*im.naturalHeight/im.naturalWidth,bottom=by-128+topFrac(spr)*128-DY;
    /* by-128 = đỉnh khung thú 128; topFrac = tỉ lệ hàng pixel đầu tiên có thú (đo thật từng ảnh) nên thú to/nhỏ/cao đều nằm đúng trên đầu */
    var top=bottom-h;if(top<MINTOP){var k=(bottom-MINTOP)/h;if(k<.55)k=.55;w*=k;h*=k;top=bottom-h;}
    ctx.save();try{var tm=ctx.getTransform&&ctx.getTransform();if(tm&&tm.a<0){ctx.translate(cx,0);ctx.scale(-1,1);ctx.translate(-cx,0);}}catch(e){}/* thú sảnh quay mặt (lật ngang) thì lật lại để chữ danh hiệu không bị ngược */ctx.shadowColor='rgba(0,0,0,.55)';ctx.shadowBlur=6;ctx.shadowOffsetY=2;
    ctx.drawImage(im,cx-w/2,top,w,h);ctx.restore();}}}catch(e){}
  return ok;};
 M.draw.__dh=1;return true;}
if(!hook()){var n=0,iv=setInterval(function(){if(hook()||++n>100)clearInterval(iv);},100);}
})(window);
