/* ===== VÒNG RUNE DƯỚI CHÂN THEO RANK (21/11/2026) =====
   Ảnh: game-moi/rune/rank-{D,C,B,A,S,SS,SR}.webp (nền trong suốt, đã cắt đối xứng quanh tâm vòng). Rank E: không có vòng.
   Cách vẽ: ảnh vòng là hình elip (nhìn nghiêng). Để XOAY đúng phối cảnh: kéo dọc ra thành hình tròn (x f) -> xoay -> nén lại (/ f).
   Vẽ 2 lượt để thú đứng GIỮA vòng: lượt "sau" (trước khi vẽ thú) = cả vòng; lượt "trước" (sau khi vẽ thú) = nửa dưới, mờ hơn, đè lên chân thú.
   Chỉnh: CFG.rong (bề rộng vòng, đơn vị logic), CFG.toc (tốc độ xoay rad/giây theo Rank, âm = ngược chiều), CFG.dy (nâng tâm vòng lên khỏi mặt đất), CFG.xuong (giới hạn tràn xuống). */
(function(root){
'use strict';
var CFG={
  rong:150,                 /* bề rộng vòng trên màn hình (thú vẽ 128) */
  dy:.3,                    /* tâm vòng CAO hơn mặt đất bấy nhiêu x chiều cao vòng (0 = tâm đúng chân thú) */
  xuong:4,                  /* vòng chỉ được vẽ tới mặt đất + số này (khỏi tràn xuống khung nút/viền) */
  alSau:.95,alTruoc:.5,     /* độ đậm lượt sau / lượt trước */
  toc:{D:.35,C:.4,B:.45,A:.5,S:.6,SS:.7,SR:.8},
  f:{D:3.42,C:2.78,B:2.45,A:2.53,S:2.04,SS:1.8,SR:1.84}   /* hệ số kéo dọc để vòng elip thành tròn (đo từ ảnh) */
};
var IM={};
function ld(r){if(IM[r])return IM[r];var o={img:new Image(),ok:false};o.img.onload=function(){o.ok=true;};o.img.src='game-moi/rune/rank-'+r+'.webp?v=1';IM[r]=o;return o;}
/* pass: 'sau' | 'truoc'. x = tâm ngang thú, gy = mặt đất (chân thú), a = độ trong suốt thêm (thú gục/hiệu ứng bắt) */
function ring(ctx,rank,x,gy,ts,pass,a){
  if(!rank||!CFG.toc[rank])return;                  /* E hoặc lạ: không vòng */
  var o=ld(rank);if(!o.ok)return;
  var I=o.img,f=CFG.f[rank],dw=CFG.rong,dh=dw*I.naturalHeight/I.naturalWidth,t=(ts||0)/1000,
      ang=t*CFG.toc[rank],pulse=.92+.08*Math.sin(t*2.2),cy=gy-dh*CFG.dy,al=(pass==='truoc'?CFG.alTruoc:CFG.alSau)*pulse*(a==null?1:a);
  if(al<=0)return;
  ctx.save();
  var top=pass==='truoc'?cy:gy-dh*3;   /* lượt trước: chỉ nửa dưới (từ tâm vòng xuống) */
  ctx.beginPath();ctx.rect(x-dw*1.3,top,dw*2.6,gy+CFG.xuong-top);ctx.clip();
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,al);
  ctx.translate(x,cy);ctx.scale(1,1/f);ctx.rotate(ang);ctx.scale(1,f);
  ctx.drawImage(I,-dw/2,-dh/2,dw,dh);
  ctx.restore();
}
root.TTGRUNE={CFG:CFG,ring:ring};
})(typeof window!=='undefined'?window:globalThis);
