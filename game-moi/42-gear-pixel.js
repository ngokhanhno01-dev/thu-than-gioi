/* ===== [FX 3C] Chế độ PIXEL ART cho buff bộ trang bị (xem thử) =====
   Bọc MỌI bộ có trong window.TTGGearAura (file 41, nạp trước file này): nếu TTGGearAura.style==='pixel' thì vẽ bộ đó vào
   khung 240x160 (pixel 1.5 đơn vị), nén sáng + ép màu (6 mức/kênh) + độ trong (4 mức, có dither Bayer), phóng x2 không làm mịn.
   Mặc định style='pixel' (người dùng chọn); 'smooth' là bản vẽ mượt gốc. Bộ mới thêm vào 41 sẽ tự được bọc (vòng lặp theo khoá).
   Đổi kiểu: TTGGearAura.style='pixel'|'smooth' (trang demo có ô chọn). Không ảnh, không Math.random. */
(()=>{
 'use strict';
 const REG=window.TTGGearAura;if(!REG)return;
 if(REG.style==null)REG.style='pixel';   /* người dùng đã chọn pixel art (hợp với thú pixel) */
 const W=240,H=160,BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
 let cv=null,cx=null,id=null;const OP=new Uint8Array(W*H);
 function ensure(){
  if(cx)return true;
  try{cv=document.createElement('canvas');cv.width=W;cv.height=H;cx=cv.getContext('2d');id=cx.createImageData(W,H)}catch(_){cx=null;return false}
  return true;
 }
 /* nén sáng (tránh cháy trắng do cộng ánh sáng) rồi ép 6 mức/kênh */
 const tone=c=>Math.min(255,Math.round(Math.pow(c/255,1.5)*5)/5*255);
 function pixelate(fn){
  return function(g,x,q,T,e,E){
   if(REG.style!=='pixel'||!ensure())return fn(g,x,q,T,e,E);
   cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,W,H);cx.setTransform(W/360,0,0,H/240,0,0);
   try{fn(cx,x,q,T,e,E)}finally{cx.setTransform(1,0,0,1,0,0)}
   const im=cx.getImageData(0,0,W,H),d=im.data,o=id.data,op=OP;
   /* 1) alpha 3 tầng: đặc (>=.5), bán trong suốt (.14–.5), trong; màu ép mức */
   for(let py=0;py<H;py++)for(let px=0;px<W;px++){
    const i=(py*W+px)*4,a=d[i+3]/255,k=py*W+px,t=(BAY[(py&3)*4+(px&3)]+.5)/16;
    if(a>=.5){o[i]=tone(d[i]);o[i+1]=tone(d[i+1]);o[i+2]=tone(d[i+2]);o[i+3]=255;op[k]=1}
    else if(a>=.14){o[i]=tone(d[i]);o[i+1]=tone(d[i+1]);o[i+2]=tone(d[i+2]);o[i+3]=a>=.3?125:70;op[k]=2}   /* bán trong suốt (sương, khói) */
    else{o[i+3]=0;op[k]=0}
   }
   /* 2) viền tối 1 pixel quanh hình (đặc trưng pixel art) */
   for(let py=0;py<H;py++)for(let px=0;px<W;px++){
    const k=py*W+px;if(op[k])continue;
    if((px>0&&op[k-1]===1)||(px<W-1&&op[k+1]===1)||(py>0&&op[k-W]===1)||(py<H-1&&op[k+W]===1)){
     const i=k*4;o[i]=14;o[i+1]=26;o[i+2]=52;o[i+3]=190;
    }
   }
   cx.putImageData(id,0,0);
   g.save();g.imageSmoothingEnabled=false;g.globalCompositeOperation='source-over';g.globalAlpha=1;g.drawImage(cv,0,0,360,240);g.restore();
  };
 }
 Object.keys(REG).forEach(k=>{if(typeof REG[k]==='function')REG[k]=pixelate(REG[k])});
})();
