/* ===== VÒNG RUNE + AURA DƯỚI CHÂN THEO RANK (21/11/2026, bản 3) =====
   Mỗi Rank D..SR (E không có) gồm 2 ảnh trong game-moi/rune/:
   - vong-X.webp = vòng ma pháp NHÌN TỪ TRÊN XUỐNG (hình tròn hoàn hảo). Vẽ bằng cách NÉN DỌC thành elip (CFG.nen) rồi XOAY THẬT quanh tâm
     (xoay trước, nén sau => vòng xoay đúng phối cảnh, không méo).
   - aura-X.webp = lửa/tia sáng bốc lên (dựng đứng, đối xứng), đặt ngay sau lưng thú, đáy đứng ở chân thú, nhấp nháy + lắc nhẹ.
   Thứ tự vẽ: lượt 'sau' (trước khi vẽ thú) = vòng (cả vòng) rồi aura; lượt 'truoc' (sau khi vẽ thú) = nửa dưới của vòng (đè lên chân thú) để thú đứng GIỮA vòng.
   Chỉnh: vongRong (đường kính vòng), nen (độ dẹt elip, nhỏ = dẹt hơn), auraRong/auraAl (cỡ/độ đậm lửa), toc (số vòng/giây, âm = ngược chiều), sang (độ phát sáng cộng thêm). */
(function(root){
'use strict';
var CFG={
  vongRong:145,nen:.36,dyVong:2,       /* tâm vòng thấp hơn chân thú dyVong điểm */
  auraRong:100,auraAl:.7,
  alSau:.75,alTruoc:.45,
  sang:.12,                            /* lớp phát sáng cộng thêm cho vòng (0 = tắt) */
  xuong:30,                            /* vòng được vẽ tới chân thú + số này (khỏi tràn xuống khung nút) */
  toc:{D:.10,C:.12,B:.14,A:.16,S:.20,SS:.24,SR:.30}
};
var IM={};
function ld(kind,r){var k=kind+r;if(IM[k])return IM[k];var o={img:new Image(),ok:false};o.img.onload=function(){o.ok=true;};o.img.src='game-moi/rune/'+kind+'-'+r+'.webp?v=3';IM[k]=o;return o;}
/* pass: 'sau' | 'truoc'. x = tâm ngang thú, gy = chân thú, a = độ trong suốt thêm (thú gục/hiệu ứng bắt) */
function ring(ctx,rank,x,gy,ts,pass,a){
  if(!rank||!CFG.toc[rank])return;                     /* E hoặc lạ: không có */
  var v=ld('vong',rank),au=pass==='sau'?ld('aura',rank):null;if(!v.ok&&!(au&&au.ok))return;
  var t=(ts||0)/1000,ph=(x||0)*.013,A=(a==null?1:a),cy=gy+CFG.dyVong,D=CFG.vongRong;
  ctx.save();
  ctx.beginPath();ctx.rect(x-D*1.2,pass==='truoc'?cy:gy-400,D*2.4,(pass==='truoc'?0:400)+gy+CFG.xuong-(pass==='truoc'?cy:gy));ctx.clip();
  if(v.ok){
    var al=(pass==='truoc'?CFG.alTruoc:CFG.alSau)*(.93+.07*Math.sin(t*2.2+ph))*A;
    if(al>0){
      ctx.save();ctx.translate(x,cy);ctx.scale(1,CFG.nen);ctx.rotate(t*CFG.toc[rank]*6.2832+ph);   /* xoay trước, nén sau */
      ctx.globalAlpha=Math.min(1,al);ctx.drawImage(v.img,-D/2,-D/2,D,D);
      if(CFG.sang>0){ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,al*CFG.sang);ctx.drawImage(v.img,-D/2,-D/2,D,D);}
      ctx.restore();}}
  if(au&&au.ok){
    var w=CFG.auraRong,h=w*au.img.naturalHeight/au.img.naturalWidth,
        fl=1+.035*Math.sin(t*5.3+ph)+.02*Math.sin(t*8.7+ph*2),     /* lửa cao thấp nhấp nháy */
        sw=Math.sin(t*1.7+ph)*1.6,                                   /* lắc ngang rất nhẹ */
        aa=CFG.auraAl*(.82+.18*Math.sin(t*4.1+ph))*A;
    if(aa>0){
      ctx.save();ctx.translate(x+sw,gy+2);ctx.scale(1+.01*Math.sin(t*6.1+ph),fl);   /* đáy aura đứng ở chân thú, co giãn theo chiều cao */
      ctx.globalAlpha=Math.min(1,aa);ctx.drawImage(au.img,-w/2,-h,w,h);
      ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.min(1,aa*.3);ctx.drawImage(au.img,-w/2,-h,w,h);
      ctx.restore();}}
  ctx.restore();
}
root.TTGRUNE={CFG:CFG,ring:ring};
})(typeof window!=='undefined'?window:globalThis);
