/* ===== VÒNG RUNE DƯỚI CHÂN THEO RANK (21/11/2026, bản 2) =====
   Ảnh: game-moi/rune/rank-{D,C,B,A,S,SS,SR}.webp (nền trong suốt, tâm vòng = tâm ảnh). Rank E: không có vòng.
   KHÔNG xoay ảnh (ảnh có lửa/tia dựng đứng, xoay theo phối cảnh sẽ méo). Thay vào đó ảnh giữ nguyên, còn ÁNH SÁNG CHẠY VÒNG quanh vòng:
   2 cung sáng đối nhau + 1 vệt trắng ở đầu cung, quay theo đường elip (hệ số nén CFG.f) => nhìn như vòng đang xoay, không biến dạng.
   Vẽ 2 lượt để thú đứng GIỮA vòng: 'sau' (trước khi vẽ thú) = cả vòng; 'truoc' (sau khi vẽ thú) = nửa dưới, mờ hơn.
   Chỉnh: rong (bề rộng, đơn vị logic), dy (nâng tâm vòng khỏi mặt đất), xuong (cho tràn xuống dưới mặt đất), toc (số vòng/giây, âm = ngược), toi (độ tối phần không sáng, 0..1). */
(function(root){
'use strict';
var CFG={
  rong:190,dy:.25,xuong:32,
  alSau:1,alTruoc:.55,
  toi:.62,                   /* phần vòng không có ánh chạy sáng còn bấy nhiêu (1 = không tối, ánh chạy không thấy) */
  toc:{D:.25,C:.28,B:.31,A:.34,S:.4,SS:.45,SR:.5},
  f:{D:3.76,C:3.44,B:3.3,A:3.74,S:2.52,SS:2.68,SR:2.04},   /* nén dọc đường chạy của ánh sáng, đo từ elip vòng chính */
  sang:.35,                 /* độ sáng cộng thêm (0 = tắt). Tăng nếu vẫn nhạt, giảm nếu nền sáng bị bệt */
  ow:320                    /* bề rộng canvas phụ để dựng khung hình (nhỏ cho nhẹ máy) */
};
var IM={},CV={};
function ld(r){if(IM[r])return IM[r];var o={img:new Image(),ok:false};o.img.onload=function(){o.ok=true;};o.img.src='game-moi/rune/rank-'+r+'.webp?v=2';IM[r]=o;return o;}
var HASCONIC=typeof document!=='undefined'&&typeof CanvasRenderingContext2D!=='undefined'&&!!CanvasRenderingContext2D.prototype.createConicGradient;
/* dựng 1 khung hình của vòng (cache theo ts: nhiều thú cùng Rank trong 1 khung hình dùng chung) */
function build(rank,ts){
  var o=ld(rank);if(!o.ok)return null;
  var c=CV[rank];
  if(!c){var I=o.img,w=CFG.ow,h=Math.round(w*I.naturalHeight/I.naturalWidth),cv=document.createElement('canvas');cv.width=w;cv.height=h;c=CV[rank]={cv:cv,cx:cv.getContext('2d'),w:w,h:h,ts:-1};}
  if(c.ts===ts)return c;c.ts=ts;
  var x=c.cx,w=c.w,h=c.h,f=CFG.f[rank]||3,a=(ts/1000)*CFG.toc[rank]*6.2832;
  x.setTransform(1,0,0,1,0,0);x.globalCompositeOperation='source-over';x.globalAlpha=1;x.clearRect(0,0,w,h);x.drawImage(o.img,0,0,w,h);
  if(HASCONIC&&CFG.toi<1){
    x.save();x.translate(w/2,h/2);x.scale(1,1/f);   /* không gian "tròn": cung sáng chạy theo elip của vòng */
    var R=Math.max(w,h*f)*2,t=CFG.toi,g=x.createConicGradient(a,0,0);
    g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.12,'rgba(0,0,0,.8)');g.addColorStop(.3,'rgba(0,0,0,'+t+')');
    g.addColorStop(.5,'rgba(0,0,0,1)');g.addColorStop(.62,'rgba(0,0,0,.8)');g.addColorStop(.8,'rgba(0,0,0,'+t+')');g.addColorStop(1,'rgba(0,0,0,1)');
    x.globalCompositeOperation='destination-in';x.fillStyle=g;x.fillRect(-R,-R,2*R,2*R);        /* làm tối phần ngoài cung sáng */
    var g2=x.createConicGradient(a,0,0);                                                       /* vệt trắng ở đầu mỗi cung sáng */
    g2.addColorStop(0,'rgba(255,255,255,.65)');g2.addColorStop(.035,'rgba(255,255,255,0)');g2.addColorStop(.5,'rgba(255,255,255,.65)');g2.addColorStop(.535,'rgba(255,255,255,0)');g2.addColorStop(1,'rgba(255,255,255,.65)');
    x.globalCompositeOperation='source-atop';x.fillStyle=g2;x.fillRect(-R,-R,2*R,2*R);
    x.restore();}
  return c;
}
/* pass: 'sau' | 'truoc'. x = tâm ngang thú, gy = mặt đất (chân thú), a = độ trong suốt thêm (thú gục/hiệu ứng bắt) */
function ring(ctx,rank,x,gy,ts,pass,a){
  if(!rank||!CFG.toc[rank])return;                  /* E hoặc lạ: không vòng */
  var c=build(rank,Math.floor(ts||0));if(!c)return;
  var dw=CFG.rong,dh=dw*c.h/c.w,cy=gy-dh*CFG.dy,t=(ts||0)/1000,
      al=(pass==='truoc'?CFG.alTruoc:CFG.alSau)*(.94+.06*Math.sin(t*2.2))*(a==null?1:a);
  if(al<=0)return;
  var top=pass==='truoc'?cy:gy-dh*3;                 /* lượt trước: chỉ nửa dưới (từ tâm vòng xuống) */
  ctx.save();ctx.beginPath();ctx.rect(x-dw*1.3,top,dw*2.6,gy+CFG.xuong-top);ctx.clip();
  ctx.globalAlpha=Math.min(1,al);ctx.drawImage(c.cv,x-dw/2,cy-dh/2,dw,dh);
  if(CFG.sang>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,al*CFG.sang);ctx.drawImage(c.cv,x-dw/2,cy-dh/2,dw,dh);}   /* lớp phát sáng thêm cho đậm */
  ctx.restore();
}
root.TTGRUNE={CFG:CFG,ring:ring};
})(typeof window!=='undefined'?window:globalThis);
