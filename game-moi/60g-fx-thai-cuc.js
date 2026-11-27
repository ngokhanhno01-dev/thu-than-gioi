/* ===== 60g-fx-thai-cuc.js — CẢNH KỸ NĂNG "Thái Cực Đồ" (Thần Vô Cực) =====
   Như 60f: kỹ năng KÉO DÀI qua nhiều lượt nên vẽ theo TRẠNG THÁI o = st.tcd[bên dùng] (index.html):
   o = {by,on,left,need,t0,shots:[{i,t0 (lúc khiên đỡ),tb (lúc phản đòn trúng),last,dmg,crit}]}  (ms = performance.now)
     dur[id]={hit,end} · draw(ctx,f,ts,G) lớp phủ lúc tung chiêu · under(ctx,o,ts,G) TRƯỚC thú: nền tối + bát quái dưới chân địch
     over(ctx,o,ts,G) SAU thú: khiên âm dương nghiêng 3/4 + số tầng + phản đòn · shake(o,ts) rung màn · done(o,ts) vẽ xong
   G = {x0,y0,w,h, ux (x người dùng), tx,ty (thân địch), gy (mặt đất), dir (1 = địch ở bên phải)}.
   Sprite fx-boss/thai-cuc-do.png: 3x2 ô 480x405, nền trong suốt. ô0 bát quái (CỐ ĐỊNH dưới chân địch suốt kỹ năng) · ô1..ô5 = dạng 2..6 dùng khi phản đòn:
     đòn 1..4 lần lượt dạng 2,3,4,5 · đòn CUỐI: dạng 3 (cột sáng) -> 4 (nổ vỡ) -> 5 (xoáy) -> 6 (tàn), to và rung mạnh hơn.
   Khiên: icon-st/thai-cuc-do.png. Chưa xem bằng mắt trong game: cỡ / vị trí là số ước lượng. */
(()=>{
 'use strict';
 const ID='thai-cuc-do',HIT=1500,END=2300,BAY=360,BAY5=800,CW=480,CH=405,TAN=1800;
 /* điểm neo [x,y] trong ô của 6 ô (tâm đĩa / tâm nổ) */
 const AN=[[247,199],[241,192],[245,214],[240,170],[239,184],[244,211]];
 const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
 const SP={ok:false,img:new Image()},IC={ok:false,img:new Image()};
 SP.img.onload=()=>{SP.ok=true};SP.img.src=base+'fx-boss/thai-cuc-do.png';
 IC.img.onload=()=>{IC.ok=true};IC.img.src=base+'icon-st/thai-cuc-do.png';
 const cl=v=>v<0?0:v>1?1:v,ph=(v,a,b)=>cl((v-a)/(b-a)),eo=v=>1-(1-v)*(1-v),lerp=(a,b,v)=>a+(b-a)*v;
 const back=v=>{const c=1.70158;v=cl(v)-1;return 1+(c+1)*v*v*v+c*v*v};
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const K=G=>Math.max(.55,Math.min(1.1,G.w/720));
 function cell(g,i,x,y,s,a,sy,rot){
  if(!SP.ok||a<=.01||s<=.001)return;
  g.save();g.globalAlpha*=cl(a);g.translate(x,y);g.scale(s,s*(sy||1));if(rot)g.rotate(rot);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(SP.img,(i%3)*CW,Math.floor(i/3)*CH,CW,CH,-AN[i][0],-AN[i][1],CW,CH);g.restore()}
 function glow(g,x,y,r,rgb,a){
  if(a<=.01||r<=1)return;
  const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+rgb+','+cl(a)+')');q.addColorStop(1,'rgba('+rgb+',0)');
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function ring(g,x,y,rx,ry,a,w,col){
  if(a<=.01)return;
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=cl(a);g.strokeStyle=col||'#8dffd0';g.lineWidth=w;
  g.beginPath();g.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,6.2832);g.stroke();g.restore()}
 function sparks(g,x,y,p,n,R,seed){
  if(p<=0||p>=1)return;
  g.save();g.globalAlpha*=1-p;
  for(let i=0;i<n;i++){const an=hs(seed+i)*6.2832,r=R*(.3+.7*hs(seed+i*3))*eo(p),sz=1+Math.round(hs(seed+i*7)*2.5);
   g.fillStyle=i%3?'#5dffc0':i%2?'#c9ffe6':'#ffffff';g.fillRect(Math.round(x+Math.cos(an)*r),Math.round(y+Math.sin(an)*r+26*p*p),sz,sz)}
  g.restore()}
 function clip(g,G){g.beginPath();g.rect(G.x0,G.y0,G.w,G.h);g.clip()}
 const lastShot=o=>o.shots[o.shots.length-1];
 const done=(o,ts)=>{const s=lastShot(o);return !o.on&&(!s||ts>s.tb+TAN)};
 /* 1 -> 0 khi kỹ năng kết thúc (sau cảnh phản đòn cuối) */
 const tail=(o,ts)=>{const s=lastShot(o);return (!o.on&&s)?1-ph(ts,s.tb+1100,s.tb+TAN):1};

 /* NỀN TỐI + BÁT QUÁI DƯỚI CHÂN ĐỊCH (vẽ TRƯỚC thú) */
 function under(g,o,ts,G){
  const t=ts-o.t0;if(t<0||done(o,ts))return;
  const end=tail(o,ts),a=eo(ph(t,0,900))*end;if(a<=0)return;
  const k=K(G),cx=G.x0+G.w/2,cy=G.y0+G.h*.5,R=Math.hypot(G.w,G.h)*.8*Math.max(eo(ph(t,0,900)),.001);
  g.save();clip(g,G);
  const q=g.createRadialGradient(cx,cy,R*.88,cx,cy,Math.max(R,1));q.addColorStop(0,'rgba(1,8,10,'+(.9*a)+')');q.addColorStop(1,'rgba(1,8,10,0)');
  g.fillStyle=q;g.fillRect(G.x0,G.y0,G.w,G.h);
  for(let i=0;i<50;i++){const x=G.x0+hs(i*1.7)*G.w,y=G.y0+hs(i*2.9)*G.h;
   if(Math.hypot(x-cx,y-cy)>R*.8)continue;
   g.globalAlpha=a*(.35+.5*Math.abs(Math.sin(ts/800+i*1.3)));g.fillStyle=i%3?'#8dffd0':'#ffffff';g.fillRect(Math.round(x),Math.round(y),1,1)}
  g.globalAlpha=1;
  /* bát quái: dạng 1, đứng cố định (không xoay), chỉ thở sáng */
  const ap=ph(t,300,1400),bs=.52*k*(.7+.3*back(ap));
  glow(g,G.tx,G.gy-4,150*k,'60,255,180',(.28+.08*Math.sin(ts/420))*ap*end);
  cell(g,0,G.tx,G.gy-8*k,bs,ap*end,.8);
  g.restore()}

 /* LỚP PHỦ LÚC TUNG CHIÊU */
 function draw(g,f,ts,G){
  const t=ts-f.t0;if(t<0||t>END)return;
  const k=K(G);g.save();clip(g,G);
  const p=ph(t,700,1500);if(p>0&&p<1){ring(g,G.tx,G.gy,30*k+300*k*eo(p),9*k+80*k*eo(p),(1-p)*.9,4)}
  const fl=ph(t,HIT-60,HIT+60)*(1-ph(t,HIT+60,HIT+420));
  if(fl>0){g.fillStyle='rgba(220,255,240,'+(.4*fl)+')';g.fillRect(G.x0,G.y0,G.w,G.h)}
  g.restore()}

 /* KHIÊN ÂM DƯƠNG NGHIÊNG 3/4 trước mặt người dùng: bóp ngang + xiên dọc, chồng vài lớp mờ phía sau tạo bề dày */
 function shield(g,o,ts,G){
  const t=ts-o.t0,k=K(G),sl=lastShot(o);
  let a=ph(t,HIT-500,HIT);
  const hit=sl?1-ph(ts,sl.t0,sl.t0+320):0;
  /* khiên đỡ được cả đòn đến trước khi dựng xong */
  if(sl)a=1;
  if(!o.on&&sl)a=1-ph(ts,sl.tb-120,sl.tb+120);
  if(a<=.01)return;
  const x=G.ux+G.dir*(56*k+(hit>0?-7*hit:0)),y=G.gy-60*k+Math.sin(ts/420)*3,
   S=96*k*(.5+.5*back(ph(t,HIT-500,HIT+100))+(sl?.5:0)*(t<HIT+100?1-ph(t,HIT-500,HIT+100):0))*(1+.14*hit);
  glow(g,x,y,S*.85,'60,255,180',(.3+.45*hit)*a);
  g.save();g.translate(x,y);g.transform(.56,-.2*G.dir,0,1,0,0);
  if(IC.ok){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   for(let d=4;d>0;d--){g.globalAlpha=.2*a;g.drawImage(IC.img,-S/2-G.dir*d*3*k,-S/2,S,S)}
   g.globalAlpha=.96*a;g.shadowColor='#3dffb0';g.shadowBlur=14;g.drawImage(IC.img,-S/2,-S/2,S,S);g.shadowBlur=0}
  ring(g,0,0,S*.52,S*.52,a*(.55+.25*Math.sin(ts/260)),2.5);
  if(hit>0&&hit<1){ring(g,0,0,S*(.52+.55*(1-hit)),S*(.52+.55*(1-hit)),hit,4,'#ffffff')}
  g.restore();
  if(o.left>0){const fs=Math.round(22*k*(1+.45*hit));g.save();g.globalAlpha=a;g.font='bold '+fs+'px sans-serif';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
   g.lineWidth=Math.max(3,fs*.22);g.strokeStyle='#00180f';g.fillStyle='#d8ffee';
   g.strokeText(String(o.left),x+G.dir*S*.26,y+S*.46);g.fillText(String(o.left),x+G.dir*S*.26,y+S*.46);g.restore()}}

 /* tia phản đòn bay từ khiên sang địch */
 function bolt(g,s,ts,G){
  if(ts<s.t0||ts>=s.tb)return;
  const k=K(G),sx=G.ux+G.dir*56*k,sy=G.gy-60*k,q=ph(ts,s.t0,s.tb),charge=s.last?.5:0;
  if(s.last&&q<charge){const c=q/charge;   /* đòn cuối: tụ lực ở khiên trước */
   glow(g,sx,sy,40*k+80*k*c,'140,255,210',.4+.5*c);ring(g,sx,sy,(1-c)*110*k+10,(1-c)*110*k+10,c,3);
   g.save();g.globalCompositeOperation='lighter';for(let j=0;j<20;j++){const u=(ts/300+j/20)%1,an=hs(j*5.3)*6.2832,r=(1-u)*120*k;g.fillStyle=j%2?'#5dffc0':'#ffffff';g.fillRect(Math.round(sx+Math.cos(an)*r),Math.round(sy+Math.sin(an)*r),2,2)}g.restore();return}
  const p=Math.pow((q-charge)/(1-charge),1.5),x=lerp(sx,G.tx,p),y=lerp(sy,G.ty,p)-Math.sin(p*Math.PI)*18*k,R=(s.last?30:16)*k;
  for(let j=6;j>=0;j--){const pp=Math.max(0,p-j*.045);glow(g,lerp(sx,G.tx,pp),lerp(sy,G.ty,pp)-Math.sin(pp*Math.PI)*18*k,R*(2-j*.2),'60,255,180',.75-j*.1)}
  if(IC.ok){g.save();g.translate(x,y);g.rotate(ts/70);g.drawImage(IC.img,-R,-R,R*2,R*2);g.restore()}}

 function burst(g,s,ts,G){
  const d=ts-s.tb;if(d<0)return;
  const k=K(G),x=G.tx,y=G.ty;
  if(!s.last){
   if(d>760)return;
   const i=Math.max(1,Math.min(4,s.i)),a=ph(d,0,70)*(1-ph(d,380,740)),sc=k*(.4+.2*eo(ph(d,0,320)));
   const fl=1-ph(d,0,200);if(fl>0){g.fillStyle='rgba(200,255,230,'+(.28*fl)+')';g.fillRect(G.x0,G.y0,G.w,G.h)}
   glow(g,x,y,150*k,'80,255,190',.7*a);
   cell(g,i,x,i===2?y+8*k:y,sc,a,1,i===4?d/900:0);
   ring(g,x,G.gy,20*k+200*k*eo(ph(d,0,520)),7*k+55*k*eo(ph(d,0,520)),1-ph(d,0,520),3);
   sparks(g,x,y,ph(d,0,650),20,130*k,13*s.i);return}
  if(d>TAN)return;
  const fl=1-ph(d,0,430);if(fl>0){g.fillStyle='rgba(235,255,246,'+(.95*fl)+')';g.fillRect(G.x0,G.y0,G.w,G.h)}
  const fl2=ph(d,300,350)*(1-ph(d,350,620));if(fl2>0){g.fillStyle='rgba(210,255,232,'+(.6*fl2)+')';g.fillRect(G.x0,G.y0,G.w,G.h)}
  glow(g,x,y,300*k,'80,255,190',.9*(1-ph(d,500,1300)));
  cell(g,2,x,y+10*k,k*(.7+.25*eo(ph(d,0,350))),ph(d,0,60)*(1-ph(d,330,600)),1.1);
  cell(g,3,x,y,k*(.55+.6*eo(ph(d,260,720))),ph(d,260,340)*(1-ph(d,760,1100)),1);
  cell(g,4,x,y-6*k,k*(.7+.45*ph(d,650,1350)),ph(d,650,850)*(1-ph(d,1100,1450)),1,d/1100);
  cell(g,5,x,y,k*(.9+.15*ph(d,1100,TAN)),ph(d,1100,1300)*(1-ph(d,1400,TAN)),1);
  for(let j=0;j<3;j++){const rp=ph(d,j*220,j*220+850);if(rp>0&&rp<1)ring(g,x,G.gy,40*k+430*k*eo(rp),12*k+125*k*eo(rp),(1-rp)*.95,6-j,j%2?'#ffffff':'#8dffd0')}
  sparks(g,x,y,ph(d,0,950),40,250*k,71);sparks(g,x,y,ph(d,280,1300),34,220*k,117)}

 function over(g,o,ts,G){
  if(ts<o.t0||done(o,ts))return;
  g.save();clip(g,G);
  shield(g,o,ts,G);
  for(const s of o.shots){bolt(g,s,ts,G);burst(g,s,ts,G)}
  g.restore()}

 /* RUNG MÀN (px): mỗi lần phản đều rung; lần cuối rung dồn lúc tụ lực, mạnh nhất lúc nổ + dư chấn */
 function shake(o,ts){
  let a=0;
  for(const s of o.shots){
   const h=ts-s.t0;if(h>=0&&h<180)a=Math.max(a,4*(1-h/180));
   const d=ts-s.tb;
   if(s.last){
    if(d<0&&h>=0)a=Math.max(a,3+8*ph(ts,s.t0,s.tb));
    if(d>=0&&d<1200)a=Math.max(a,30*Math.pow(1-d/1200,1.3));
    if(d>=300&&d<750)a=Math.max(a,22*(1-(d-300)/450))
   }else if(d>=0&&d<420)a=Math.max(a,13*(1-d/420))}
  return a}

 window.TTGThaiCuc={ID,BAY,BAY5,dur:{[ID]:{hit:HIT,end:END}},under,draw,over,shake,done};
})();
