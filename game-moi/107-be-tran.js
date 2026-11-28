/* ===== 107-be-tran.js (TTGBE): BỆ ĐỨNG 2 BÊN TRONG TRẬN (28/11/2026) =====
   Vẽ bằng canvas (không dùng ảnh): đảo đá nổi mặt elip, viền sáng + vòng khắc. MÀU TỰ LẤY THEO NỀN VÙNG đang đánh (lấy màu trung bình nửa dưới ảnh nền).
   index.html gọi TTGBE.draw(ctx,ts,{xs:[tâm bệ trái,tâm bệ phải],y:tâm mặt bệ,m:số pixel máy/1 đơn vị game,bg:ảnh nền|null}) TRƯỚC khi vẽ thú.
   Chỉnh cỡ ở CFG: rx = nửa bề ngang mặt bệ, ry = nửa bề sâu mặt bệ, day = độ dày vách đá, da = độ nhọn đá dưới đáy. */
(function(root){
'use strict';
var CFG={rx:108,ry:22,day:10,da:13,le:16};   /* le = chừa lề quanh hình cho quầng sáng */
var HUE=[],CACHE={};
function hue(img){   /* [h,s] trung bình của nửa dưới ảnh nền; chưa có ảnh thì xanh đêm */
  if(!img||!img.naturalWidth)return[215,45];
  for(var i=0;i<HUE.length;i++)if(HUE[i][0]===img)return HUE[i][1];
  var r=[215,45];
  try{var c=document.createElement('canvas');c.width=c.height=8;var g=c.getContext('2d'),W=img.naturalWidth,H=img.naturalHeight;
    g.drawImage(img,0,H/2,W,H/2,0,0,8,8);var d=g.getImageData(0,0,8,8).data,R=0,G=0,B=0,n=d.length/4;
    for(var k=0;k<d.length;k+=4){R+=d[k];G+=d[k+1];B+=d[k+2];}R/=n*255;G/=n*255;B/=n*255;
    var mx=Math.max(R,G,B),mn=Math.min(R,G,B),df=mx-mn,h=0,l=(mx+mn)/2,s=df?df/(1-Math.abs(2*l-1)):0;
    if(df){h=mx===R?((G-B)/df)%6:mx===G?(B-R)/df+2:(R-G)/df+4;h=(h*60+360)%360;}
    r=[Math.round(h),Math.round(Math.max(.18,Math.min(.65,s))*100)];}catch(e){}
  HUE.push([img,r]);return r;}
function col(h,s,l,a){return'hsla('+h+','+s+'%,'+l+'%,'+(a==null?1:a)+')';}
function rnd(n){var r=Math.sin(n*91.7+13.3)*43758.5453;return r-Math.floor(r);}
function ell(c,x,y,a,b,t0,t1){c.beginPath();c.ellipse(x,y,a,b,0,t0||0,t1==null?6.2832:t1);}
function build(h,s,m,seed){
  var rx=CFG.rx,ry=CFG.ry,day=CFG.day,da=CFG.da,le=CFG.le,w=2*(rx+le),H=2*ry+day+da+2*le;
  var cv=document.createElement('canvas');cv.width=Math.ceil(w*m);cv.height=Math.ceil(H*m);
  var c=cv.getContext('2d');c.scale(m,m);var x=rx+le,y=ry+le,g,i,a,N=22;
  /* bóng đổ + quầng sáng dưới đáy */
  c.save();c.translate(x,y+day+da*.7);c.scale(1,.2);g=c.createRadialGradient(0,0,rx*.2,0,0,rx*1.1);g.addColorStop(0,'rgba(0,4,16,.5)');g.addColorStop(1,'rgba(0,4,16,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,rx*1.1,0,6.2832);c.fill();c.restore();
  /* vách đá: nửa dưới mặt elip nối xuống mép đá lởm chởm */
  c.beginPath();c.ellipse(x,y,rx,ry,0,Math.PI,0,true);
  var P=[];for(i=0;i<=N;i++){a=i/N*Math.PI;var sn=Math.sin(a),sau=day*(.35+.65*sn)+(i%2?da*(.35+.65*rnd(i+seed))*sn:da*.12*rnd(i*3+seed)*sn);P.push([x+Math.cos(a)*rx*(i%2?.97:1),y+sn*ry+sau]);}
  for(i=0;i<=N;i++)c.lineTo(P[i][0],P[i][1]);c.closePath();
  g=c.createLinearGradient(0,y,0,y+ry+day+da);g.addColorStop(0,col(h,s*.7,30));g.addColorStop(.55,col(h,s*.75,17));g.addColorStop(1,col(h,s*.8,8));c.fillStyle=g;c.fill();
  c.lineWidth=1;c.strokeStyle=col(h,s,6,.85);c.stroke();
  /* mặt cắt đá: các vệt sáng/tối chạy dọc vách */
  c.save();c.clip();for(i=1;i<N;i+=2){c.beginPath();c.moveTo(P[i][0],P[i][1]);c.lineTo(P[i-1][0]+2,y+Math.sin((i-1)/N*Math.PI)*ry);c.lineTo(P[i][0]+5,y+Math.sin(i/N*Math.PI)*ry);c.closePath();c.fillStyle=rnd(i*7+seed)>.5?col(h,s,48,.28):'rgba(0,0,10,.3)';c.fill();}c.restore();
  /* mặt bệ */
  g=c.createRadialGradient(x,y-ry*.35,4,x,y,rx);g.addColorStop(0,col(h,s*.55,56));g.addColorStop(.65,col(h,s*.65,40));g.addColorStop(1,col(h,s*.7,27));
  ell(c,x,y,rx,ry);c.fillStyle=g;c.fill();
  /* vân đá lốm đốm */
  c.save();ell(c,x,y,rx,ry);c.clip();for(i=0;i<70;i++){a=rnd(i+seed*5)*6.2832;var d=Math.sqrt(rnd(i*2.7+seed));ell(c,x+Math.cos(a)*d*rx,y+Math.sin(a)*d*ry,1+rnd(i*4.1)*3.5,.6+rnd(i*5.3));c.fillStyle=rnd(i*9+seed)>.5?'rgba(255,255,255,.14)':'rgba(0,0,20,.16)';c.fill();}c.restore();
  /* vòng khắc + vạch chia */
  c.lineWidth=1;c.strokeStyle=col(h,s,82,.5);ell(c,x,y,rx*.8,ry*.76);c.stroke();c.strokeStyle=col(h,s,10,.45);ell(c,x,y+1,rx*.8,ry*.76);c.stroke();
  c.strokeStyle=col(h,s,84,.38);for(i=0;i<16;i++){a=i/16*6.2832;c.beginPath();c.moveTo(x+Math.cos(a)*rx*.82,y+Math.sin(a)*ry*.79);c.lineTo(x+Math.cos(a)*rx*.93,y+Math.sin(a)*ry*.91);c.stroke();}
  /* viền sáng mép bệ: nửa trước đậm hơn */
  c.shadowColor=col(h,Math.min(90,s+35),68,.95);c.shadowBlur=7*m;
  c.lineWidth=1.6;c.strokeStyle=col(h,Math.min(90,s+25),74,.95);ell(c,x,y,rx,ry,0,Math.PI);c.stroke();
  c.shadowBlur=0;c.lineWidth=1;c.strokeStyle=col(h,s,76,.6);ell(c,x,y,rx,ry,Math.PI,6.2832);c.stroke();
  return{cv:cv,w:w,h:H,ox:x,oy:y};}
function draw(ctx,ts,o){
  var hs=hue(o.bg),i;
  for(i=0;i<o.xs.length;i++){
    var k=[hs[0],hs[1],o.m,i].join('|'),b=CACHE[k]||(CACHE[k]=build(hs[0],hs[1],o.m,i+1)),x=o.xs[i];
    ctx.save();ctx.imageSmoothingEnabled=true;ctx.drawImage(b.cv,x-b.ox,o.y-b.oy,b.w,b.h);
    /* mép bệ thở sáng nhẹ */
    ctx.globalCompositeOperation='lighter';ctx.lineWidth=2.5;ctx.strokeStyle=col(hs[0],85,60,.12+.1*Math.sin(ts/520+i*2));ell(ctx,x,o.y,CFG.rx,CFG.ry,0,Math.PI);ctx.stroke();
    ctx.restore();}}
root.TTGBE={draw:draw,CFG:CFG};
})(typeof window!=='undefined'?window:globalThis);
