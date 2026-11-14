/* ===== [FX 3C] Chế độ PIXEL ART cho buff bộ trang bị (xem thử) =====
   Bọc MỌI bộ có trong window.TTGGearAura (file 41, nạp trước file này): nếu TTGGearAura.style==='pixel' thì vẽ bộ đó vào
   khung 240x160 (pixel 1.5 đơn vị), nén sáng + ép màu (6 mức/kênh) + độ trong (4 mức, có dither Bayer), phóng x2 không làm mịn.
   Mặc định style='smooth' (không đổi gì). Bộ mới thêm vào 41 sẽ tự được bọc (vòng lặp theo khoá).
   Đổi kiểu: TTGGearAura.style='pixel'|'smooth' (trang demo có ô chọn). Không ảnh, không Math.random. */
(()=>{
 'use strict';
 const REG=window.TTGGearAura;if(!REG)return;
 if(REG.style==null)REG.style='smooth';
 const W=240,H=160,BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 let cv=null,cx=null,id=null;
 function ensure(){
  if(cx)return true;
  try{cv=document.createElement('canvas');cv.width=W;cv.height=H;cx=cv.getContext('2d');id=cx.createImageData(W,H)}catch(_){cx=null;return false}
  return true;
 }
 /* nén sáng (tránh cháy trắng do cộng ánh sáng) rồi ép 6 mức/kênh */
 const tone=c=>Math.round(Math.pow(c/255,1.7)*.92*5)/5*255;
 function pixelate(fn){
  return function(g,x,q,T,e,E){
   if(REG.style!=='pixel'||!ensure())return fn(g,x,q,T,e,E);
   cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,W,H);cx.setTransform(W/360,0,0,H/240,0,0);
   try{fn(cx,x,q,T,e,E)}finally{cx.setTransform(1,0,0,1,0,0)}
   const im=cx.getImageData(0,0,W,H),d=im.data,o=id.data;
   for(let py=0;py<H;py++)for(let px=0;px<W;px++){
    const i=(py*W+px)*4,a=d[i+3]/255;
    if(a<.04){o[i+3]=0;continue}
    const t=(BAY[(py&3)*4+(px&3)]+.5)/16,al=Math.floor(a*3+t);   /* 0..3 → độ trong 4 mức, dither */
    if(al<=0){o[i+3]=0;continue}
    o[i]=tone(d[i]);o[i+1]=tone(d[i+1]);o[i+2]=tone(d[i+2]);
    o[i+3]=al>=3?255:al===2?190:120;
   }
   cx.putImageData(id,0,0);
   g.save();g.imageSmoothingEnabled=false;g.globalCompositeOperation='source-over';g.globalAlpha=1;g.drawImage(cv,0,0,360,240);g.restore();
  };
 }
 Object.keys(REG).forEach(k=>{if(typeof REG[k]==='function')REG[k]=pixelate(REG[k])});
})();
