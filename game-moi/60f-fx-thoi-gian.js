/* ===== 60f-fx-thoi-gian.js — CẢNH KỸ NĂNG "Thời Gian Tỉnh Lặng" (Thần Chúc Long, hệ Thời Gian) =====
   Khác Tinh Hà Vẫn Lạc (một cảnh dài rồi hết): kỹ năng này KÉO DÀI qua nhiều lượt, nên hình vẽ theo TRẠNG THÁI st.tl (index.html), không theo đồng hồ của riêng một lần tung chiêu.
   st.tl = {by,tgt,k,on,need,hits,sum,form,t0,t2,t3,tb,tBoom,tHit}  (ms = performance.now)
     t0     lúc bắt đầu tung chiêu · t2/t3 lúc đồng hồ lên dạng 2 (đòn 3) / dạng 3 (đòn 5) · tb lúc đòn cuối trúng · tBoom lúc NỔ (sát thương áp đúng lúc này) · tHit lúc đòn gần nhất
   index.html móc vào bằng:
     TTGThoiGian.dur[id]={hit,end}          thời lượng cảnh tung chiêu (thay KN_T_HIT / KN_T_END, giống 60e)
     TTGThoiGian.draw(ctx,f,ts,G)           lớp phủ cảnh tung chiêu (qua skFx.tm): sóng ngưng đọng + chớp lúc trúng
     TTGThoiGian.under(ctx,st,ts,G)         VẼ TRƯỚC thú: nền tối + đồng hồ sau lưng thú bị ngưng đọng (dạng 1/2/3)
     TTGThoiGian.over(ctx,st,ts,G)          VẼ SAU thú: icon ngưng đọng trên đầu + số đòn 1..5 (biến mất lúc nổ) + nổ lớn
     TTGThoiGian.shake(tl,ts)               biên độ rung màn (px); index.html rung cả canvas
     TTGThoiGian.done(tl,ts)                đã vẽ xong cảnh nổ -> index.html xóa st.tl
     TTGThoiGian.WIND / BOOM                ms dồn lực (rung dữ dội) trước khi nổ / ms cảnh nổ
   G = {x0,y0,w,h,tx,ty,gy,hy}: khung trận, tâm thân thú bị ngưng đọng, mặt đất, đỉnh đầu thú đó.
   Sprite fx-boss/thoi-gian-tinh-lang.png: 3x2 ô 384, nền trong suốt. ô0 đồng hồ dạng 1 · ô1 dạng 2 · ô2 dạng 3 · ô3 nổ · ô4 xoáy vụn · ô5 tàn. Icon: icon-st/ngung-dong.png.
   Mốc (ms từ t0): 0-900 nền tối lan · 300-1100 đồng hồ dạng 1 hiện sau lưng · 650-1500 sóng ngưng đọng lan ra · 1500 TRÚNG (chớp, icon bật lên trên đầu).
   Ảnh chưa nạp: vẫn chạy bằng nền tối + quầng sáng + hạt (không lỗi). Chưa xem bằng mắt trong game. */
(()=>{
 'use strict';
 const ID='thoi-gian-tinh-lang',HIT=1500,END=2400,CELL=384,WIND=1300,BOOM=1000,OUT=800;
 const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
 const SP={ok:false,img:new Image()},IC={ok:false,img:new Image()};
 SP.img.onload=()=>{SP.ok=true};SP.img.src=base+'fx-boss/thoi-gian-tinh-lang.png';
 IC.img.onload=()=>{IC.ok=true};IC.img.src=base+'icon-st/ngung-dong.png';
 const cl=v=>v<0?0:v>1?1:v,ph=(v,a,b)=>cl((v-a)/(b-a)),eo=v=>1-(1-v)*(1-v),lerp=(a,b,v)=>a+(b-a)*v;
 const back=v=>{const c=1.70158;v=cl(v)-1;return 1+(c+1)*v*v*v+c*v*v};
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const K=G=>Math.max(.55,Math.min(1.1,G.w/720));
 const SC=[.62,.80,1.0];            /* cỡ đồng hồ dạng 1/2/3 (nhân cỡ ô 384) */
 function cell(g,i,x,y,s,a,rot){
  if(!SP.ok||a<=.01||s<=.001)return;
  g.save();g.globalAlpha*=cl(a);g.translate(x,y);if(rot)g.rotate(rot);g.scale(s,s);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(SP.img,(i%3)*CELL,Math.floor(i/3)*CELL,CELL,CELL,-CELL/2,-CELL/2,CELL,CELL);g.restore()}
 function glow(g,x,y,r,rgb,a){
  if(a<=.01||r<=1)return;
  const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+rgb+','+cl(a)+')');q.addColorStop(1,'rgba('+rgb+',0)');
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function ring(g,x,y,rx,ry,a,w,col){
  if(a<=.01)return;
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=cl(a);g.strokeStyle=col||'#bfe6ff';g.lineWidth=w;
  g.beginPath();g.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,6.2832);g.stroke();g.restore()}
 function sparks(g,x,y,p,n,R,seed,col){
  if(p<=0||p>=1)return;
  g.save();g.globalAlpha*=1-p;
  for(let i=0;i<n;i++){const an=hs(seed+i)*6.2832,r=R*(.3+.7*hs(seed+i*3))*eo(p),sz=1+Math.round(hs(seed+i*7)*2);
   g.fillStyle=col||(i%3?'#ffd76a':i%2?'#9fdcff':'#ffffff');g.fillRect(Math.round(x+Math.cos(an)*r),Math.round(y+Math.sin(an)*r+22*p*p),sz,sz)}
  g.restore()}
 function clip(g,G){g.beginPath();g.rect(G.x0,G.y0,G.w,G.h);g.clip()}
 const finished=(tl,ts)=>!!(tl.tBoom&&!tl.on&&ts>tl.tBoom+BOOM+OUT);

 /* NỀN TỐI + ĐỒNG HỒ SAU LƯNG (vẽ TRƯỚC thú) */
 function under(g,st,ts,G){
  const tl=st&&st.tl;if(!tl)return;
  const t=ts-tl.t0;if(t<0||finished(tl,ts))return;
  const outP=tl.tBoom&&!tl.on?ph(ts,tl.tBoom+BOOM*.4,tl.tBoom+BOOM+OUT):0;
  const a=eo(ph(t,0,900))*(1-outP);if(a<=0)return;
  const k=K(G),cx=G.x0+G.w/2,cy=G.y0+G.h*.5,r=eo(ph(t,0,900)),R=Math.hypot(G.w,G.h)*.8*Math.max(r,.001);
  g.save();clip(g,G);
  /* nền tối lan từ giữa ra, xanh đen */
  const q=g.createRadialGradient(cx,cy,R*.88,cx,cy,Math.max(R,1));q.addColorStop(0,'rgba(2,5,18,'+(.9*a)+')');q.addColorStop(1,'rgba(2,5,18,0)');
  g.fillStyle=q;g.fillRect(G.x0,G.y0,G.w,G.h);
  /* sao lấp lánh, đứng yên (thời gian ngừng): chỉ nhấp nháy rất chậm */
  for(let i=0;i<60;i++){const x=G.x0+hs(i*1.7)*G.w,y=G.y0+hs(i*2.9)*G.h;
   if(Math.hypot(x-cx,y-cy)>R*.8)continue;
   const tw=.55+.45*Math.abs(Math.sin(ts/900+i*1.3));g.globalAlpha=a*tw;g.fillStyle=i%3?'#ffe9a8':'#bfe6ff';g.fillRect(Math.round(x),Math.round(y),hs(i*4.1)>.85?2:1,hs(i*4.1)>.85?2:1)}
  g.globalAlpha=1;
  /* đồng hồ sau lưng thú bị ngưng đọng: 3 dạng, đổi dạng ở đòn 3 và đòn 5 */
  const wind=tl.tb?ph(ts,tl.tb,tl.tBoom||tl.tb+WIND):0,cA=(1-(tl.tBoom&&!tl.on?ph(ts,tl.tBoom,tl.tBoom+260):0));
  const ta=[tl.t0+300,tl.t2||0,tl.t3||0];
  let ccx=G.tx,jx=0,jy=0;
  if(wind>0){const am=2+7*wind;jx=(hs(Math.floor(ts/30))-.5)*am;jy=(hs(Math.floor(ts/30)+9)-.5)*am}
  glow(g,ccx,G.ty,170*k*(1+.6*wind),'255,200,90',(.25+.4*wind)*a*cA*(t>300?1:0));
  glow(g,ccx,G.ty,120*k*(1+.5*wind),'120,190,255',.22*a*cA*(t>300?1:0));
  for(let i=0;i<3;i++){
   if(!ta[i]||ts<ta[i])continue;
   const dur=i===0?800:350,pop=ph(ts,ta[i],ta[i]+(i===0?800:500));
   let al=ph(ts,ta[i],ta[i]+dur);if(ta[i+1]&&ts>=ta[i+1])al*=1-ph(ts,ta[i+1],ta[i+1]+350);
   if(al<=.01)continue;
   const s=SC[i]*k*(.8+.2*back(pop))*(1+.015*Math.sin(ts/420)),
    /* đáy ô (vòng ấn) nằm ngay chân thú: tâm ô = chân - 0,27 cỡ ô */
    yy=G.gy+4-.27*CELL*s;
   cell(g,i,Math.max(G.x0+CELL*s*.4,Math.min(G.x0+G.w-CELL*s*.4,ccx))+jx,yy+jy,s,al*a*cA,0)}
  /* hạt bánh răng/tinh thể bay quanh đồng hồ (đứng yên theo thời gian: chỉ trôi chậm) */
  if(t>500){g.globalCompositeOperation='lighter';
   for(let i=0;i<14;i++){const an=hs(i*7.3)*6.2832+ts/(2600+i*90),rr=(80+hs(i*3.1)*70)*k*(1+.3*wind);
    g.globalAlpha=.55*a*cA*(.5+.5*Math.sin(ts/500+i));g.fillStyle=i%2?'#ffd76a':'#9fdcff';
    g.fillRect(Math.round(ccx+Math.cos(an)*rr*1.2),Math.round(G.ty+Math.sin(an)*rr*.7),2,2)}
   g.globalCompositeOperation='source-over'}
  g.restore()}

 /* LỚP PHỦ CẢNH TUNG CHIÊU (skFx.tm): sóng ngưng đọng lan ra + chớp lúc trúng */
 function draw(g,f,ts,G){
  const t=ts-f.t0;if(t<0||t>END)return;
  const k=K(G);g.save();clip(g,G);
  const p=ph(t,650,1500);
  if(p>0&&p<1){
   ring(g,G.tx,G.ty,40*k+420*k*eo(p),24*k+210*k*eo(p),(1-p)*.9,4);
   ring(g,G.tx,G.ty,25*k+300*k*eo(ph(t,800,1600)),15*k+150*k*eo(ph(t,800,1600)),(1-ph(t,800,1600))*.6,2,'#ffe9a8')}
  const fl=ph(t,HIT-60,HIT+60)*(1-ph(t,HIT+60,HIT+420));
  if(fl>0){g.fillStyle='rgba(235,245,255,'+(.5*fl)+')';g.fillRect(G.x0,G.y0,G.w,G.h);glow(g,G.tx,G.ty,200*k,'255,230,160',.7*fl)}
  g.restore()}

 /* ICON NGƯNG ĐỌNG + SỐ ĐÒN + NỔ (vẽ SAU thú) */
 function over(g,st,ts,G){
  const tl=st&&st.tl;if(!tl)return;
  const t=ts-tl.t0;if(t<0||finished(tl,ts))return;
  const k=K(G);g.save();clip(g,G);
  /* icon trên đầu thú: bật lên lúc trúng chiêu, biến mất lúc nổ */
  const boomed=tl.tBoom&&ts>=tl.tBoom,ia=ph(t,HIT-100,HIT+300)*(boomed?1-ph(ts,tl.tBoom,tl.tBoom+150):1);
  if(ia>.01){
   const S=Math.round(46*k*(.7+.3*back(ph(t,HIT-100,HIT+400)))),hp=tl.tHit?1-ph(ts,tl.tHit,tl.tHit+260):0,
    x=G.tx,y=G.hy-34*k+Math.round(Math.sin(ts/500)*2);
   g.save();g.globalAlpha=ia;
   glow(g,x,y,S*.9,'150,210,255',.5+.4*hp);
   if(IC.ok){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.shadowColor='#7fd0ff';g.shadowBlur=10;g.drawImage(IC.img,x-S*(1+.15*hp)/2,y-S*(1+.15*hp)/2,S*(1+.15*hp),S*(1+.15*hp))}
   if(tl.hits>0){
    const fs=Math.round(24*k*(1+.5*hp));g.font='bold '+fs+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
    g.lineWidth=Math.max(3,fs*.2);g.strokeStyle='#1a0f00';g.fillStyle=tl.hits>=tl.need?'#ff6a3a':'#ffe08a';
    g.shadowBlur=0;g.strokeText(String(tl.hits),x+S*.55,y+S*.28);g.fillText(String(tl.hits),x+S*.55,y+S*.28)}
   g.restore()}
  /* dồn lực trước khi nổ: tia sáng hút vào thú, quầng sáng phình */
  if(tl.tb&&!boomed){
   const w=ph(ts,tl.tb,tl.tBoom||tl.tb+WIND);
   glow(g,G.tx,G.ty,90*k*(1+1.2*w),'255,220,140',.25+.5*w);
   g.globalCompositeOperation='lighter';
   for(let j=0;j<18;j++){const q=(ts/480+j/18)%1,an=hs(j*5.3)*6.2832,rr=(1-q)*(160*k)*(1.1-.3*w);
    g.fillStyle=j%2?'#ffe9a8':'#9fdcff';g.fillRect(Math.round(G.tx+Math.cos(an)*rr),Math.round(G.ty+Math.sin(an)*rr*.75),2,2)}
   g.globalCompositeOperation='source-over'}
  /* NỔ LỚN: chớp, nổ, xoáy vụn đồng hồ, tàn */
  if(boomed){
   const d=ts-tl.tBoom,fl=1-ph(d,0,380);
   if(fl>0){g.fillStyle='rgba(255,248,230,'+(.95*fl)+')';g.fillRect(G.x0,G.y0,G.w,G.h)}
   const pe=ph(d,0,620),ae=(1-ph(d,380,980))*(d<60?d/60:1);
   glow(g,G.tx,G.ty,200*k*(.6+eo(pe)),'255,225,150',.8*ae);
   cell(g,3,G.tx,G.ty,k*1.5*(.5+.5*eo(pe)),ae,0);
   const a4=ph(d,150,450)*(1-ph(d,650,1100));cell(g,4,G.tx,G.ty-10*k,k*1.25*(.8+.3*ph(d,150,1100)),a4,d/1300);
   const a5=ph(d,500,850)*(1-ph(d,950,BOOM+OUT));cell(g,5,G.tx,G.ty,k*1.3,a5,0);
   const rp=ph(d,0,900);
   ring(g,G.tx,G.gy,40*k+380*k*eo(rp),12*k+110*k*eo(rp),(1-rp)*.9,5,'#ffe9a8');
   ring(g,G.tx,G.gy,30*k+260*k*eo(ph(d,120,1000)),9*k+80*k*eo(ph(d,120,1000)),(1-ph(d,120,1000))*.7,3);
   sparks(g,G.tx,G.ty,ph(d,0,1000),26,190*k,41)}
  g.restore()}

 /* RUNG MÀN (px): xung nhỏ mỗi đòn, xung lúc đồng hồ lên dạng, rung dữ dội dần lúc dồn lực, rung mạnh lúc nổ rồi tắt */
 function shake(tl,ts){
  if(!tl)return 0;let a=0;const t=ts-tl.t0;
  if(t>=HIT&&t<HIT+400)a=Math.max(a,9*(1-(t-HIT)/400));
  if(tl.tHit){const d=ts-tl.tHit;if(d>=0&&d<250)a=Math.max(a,4*(1-d/250))}
  if(tl.t2){const d=ts-tl.t2;if(d>=0&&d<500)a=Math.max(a,8*(1-d/500))}
  if(tl.t3){const d=ts-tl.t3;if(d>=0&&d<500)a=Math.max(a,12*(1-d/500))}
  if(tl.tb&&(!tl.tBoom||ts<tl.tBoom))a=Math.max(a,4+12*ph(ts,tl.tb,tl.tb+WIND));
  if(tl.tBoom&&!tl.on){const d=ts-tl.tBoom;if(d>=0&&d<900)a=Math.max(a,26*Math.pow(1-d/900,1.5))}
  return a}

 window.TTGThoiGian={ID,WIND,BOOM,dur:{[ID]:{hit:HIT,end:END}},under,draw,over,shake,done:finished};
})();
