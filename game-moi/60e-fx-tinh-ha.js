/* ===== 60e-fx-tinh-ha.js — CẢNH KỸ NĂNG "Tinh Hà Vẫn Lạc" (Thần Đế Giang, hệ Không Gian) =====
   Khác các kỹ năng boss khác (1,7s trong canvas FX 360x250): đây là cảnh dài ~11,8s vẽ thẳng lên canvas trận, cỡ màn hình.
   index.html móc vào bằng:  TTGTinhHa.dur[id] = {hit,end} (ms; thay KN_T_HIT / KN_T_END cho riêng kỹ năng này),
                             TTGTinhHa.under(ctx,f,ts,G) (nền đen — vẽ TRƯỚC thú),  TTGTinhHa.draw(ctx,f,ts,G) (lỗ + đạn + nổ — vẽ SAU thú).
   f = st.skFx (cần f.t0 = performance.now() lúc bắt đầu). G = {x0,y0,w,h,tx,ty,gy}: khung trận, tâm thân địch, mặt đất.
   Mốc thời gian (ms):
     0-1300   nền tối đen lan từ giữa ra hết
     900-2400 6 lỗ không gian hiện lần lượt quanh địch (mỗi lỗ cách 300ms, bật to rồi rung nhẹ tạo áp lực)
     2500-8300 14 phát bắn xen kẽ các lỗ, càng lúc càng dồn dập; mỗi phát bay ~420ms rồi nổ trên địch
     8500-9300 dồn lực: lỗ phình to, tia sáng nối vào địch, tinh thể hút về lỗ
     9300-9900 6 lỗ đồng loạt bắn tinh cầu lớn
     9900     TRÚNG (index.html áp sát thương + hiện số) · nổ lớn, chớp trắng, sóng không gian
     10000-10700 lỗ đóng · 10300-11600 xoáy vụn + tinh vân tan · 10600-11800 nền sáng trở lại
   Sprite fx-boss/tinh-ha-van-lac.png: 3x2 ô 384, nền trong suốt. ô0 lỗ · ô1 lỗ+tinh cầu · ô2 tinh cầu lao (đầu hướng phải-xuống) · ô3 nổ · ô4 xoáy vụn · ô5 tinh vân.
   Ảnh chưa nạp: vẫn chạy bằng nền đen + quầng sáng + hạt (không lỗi). Chưa xem bằng mắt trong game. */
(()=>{
 'use strict';
 const ID='tinh-ha-van-lac',HIT=9900,END=11800,CELL=384;
 const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
 const SP={ok:false,img:new Image()};
 SP.img.onload=()=>{SP.ok=true};SP.img.src=base+'fx-boss/tinh-ha-van-lac.png';
 const cl=v=>v<0?0:v>1?1:v,ph=(v,a,b)=>cl((v-a)/(b-a)),eo=v=>1-(1-v)*(1-v),ei=v=>v*v,lerp=(a,b,v)=>a+(b-a)*v;
 const back=v=>{const c=1.70158;v=cl(v)-1;return 1+(c+1)*v*v*v+c*v*v};
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const NP=6,ANG=[-165,-125,-85,-45,-10,150],ORDER=[0,3,1,4,2,5];
 const T_APPEAR=900,GAP=300,B0=2500,B1=8300,NS=14,FLY=420,CH0=8500,LAUNCH=9300,CLOSE0=10000;
 const SHOTS=[];
 for(let k=0;k<NS;k++)SHOTS.push({t:B0+(B1-B0)*Math.pow(k/(NS-1),.75),p:ORDER[k%NP],jx:(hs(k*3.1)-.5)*80,jy:(hs(k*5.7)-.5)*70,k});
 const K=G=>Math.max(.55,Math.min(1.1,G.w/720));
 function ppos(G,i){const k=K(G),a=ANG[i]*Math.PI/180,rx=Math.min(210,G.w*.3),ry=130*k;
  return{x:Math.max(G.x0+60*k,Math.min(G.x0+G.w-60*k,G.tx+Math.cos(a)*rx)),y:Math.max(G.y0+70*k,Math.min(G.gy+10,G.ty+Math.sin(a)*ry))}}
 function cell(g,i,x,y,s,a,rot){
  if(!SP.ok||a<=.01||s<=.001)return;
  g.save();g.globalAlpha*=cl(a);g.translate(x,y);if(rot)g.rotate(rot);g.scale(s,s);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(SP.img,(i%3)*CELL,Math.floor(i/3)*CELL,CELL,CELL,-CELL/2,-CELL/2,CELL,CELL);g.restore()}
 function glow(g,x,y,r,rgb,a){
  if(a<=.01||r<=1)return;
  const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba('+rgb+','+cl(a)+')');q.addColorStop(1,'rgba('+rgb+',0)');
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=q;g.fillRect(x-r,y-r,r*2,r*2);g.restore()}
 function sparks(g,x,y,p,n,R,seed,col){
  if(p<=0||p>=1)return;
  g.save();g.globalAlpha*=1-p;
  for(let i=0;i<n;i++){const an=hs(seed+i)*6.2832,r=R*(.3+.7*hs(seed+i*3))*eo(p),sz=1+Math.round(hs(seed+i*7)*2);
   g.fillStyle=col||(i%3?'#b66bff':'#f1dcff');g.fillRect(Math.round(x+Math.cos(an)*r),Math.round(y+Math.sin(an)*r+26*p*p),sz,sz)}
  g.restore()}
 function ring(g,x,y,rx,ry,a,w){
  if(a<=.01)return;
  g.save();g.globalCompositeOperation='lighter';g.globalAlpha*=cl(a);g.strokeStyle='#d9a8ff';g.lineWidth=w;
  g.beginPath();g.ellipse(x,y,Math.max(1,rx),Math.max(1,ry),0,0,6.2832);g.stroke();g.restore()}
 function clip(g,G){g.beginPath();g.rect(G.x0,G.y0,G.w,G.h);g.clip()}

 /* NỀN: tối đen lan từ giữa khung ra hết, sao lấp lánh, lúc cuối sáng lại. Vẽ TRƯỚC thú (thú nằm trên nền đen). */
 function under(g,f,ts,G){
  const t=ts-f.t0;if(t<0||t>END)return;
  const r=eo(ph(t,0,1300)),a=1-ph(t,10600,END);if(r<=0||a<=0)return;
  const cx=G.x0+G.w/2,cy=G.y0+G.h*.5,R=Math.hypot(G.w,G.h)*.8*r;
  g.save();clip(g,G);
  const q=g.createRadialGradient(cx,cy,R*.88,cx,cy,Math.max(R,1));q.addColorStop(0,'rgba(3,0,14,'+a+')');q.addColorStop(1,'rgba(3,0,14,0)');
  g.fillStyle=q;g.fillRect(G.x0,G.y0,G.w,G.h);
  g.globalAlpha=a;
  for(let i=0;i<70;i++){const x=G.x0+hs(i*1.7)*G.w,y=G.y0+hs(i*2.9)*G.h;
   if(Math.hypot(x-cx,y-cy)>R*.8)continue;
   const tw=.4+.6*Math.abs(Math.sin(t/420+i*1.3)),sz=hs(i*4.1)>.85?2:1;g.fillStyle=i%4?'#c9a6ff':'#ffffff';g.globalAlpha=a*tw;g.fillRect(Math.round(x),Math.round(y),sz,sz)}
  g.globalAlpha=1;
  glow(g,G.tx,G.ty,G.w*.35*r,'110,40,200',.22*a*(1+.4*ph(t,CH0,HIT)));
  g.restore()}

 function portal(g,i,t,G,k){
  const a=ph(t,T_APPEAR+i*GAP,T_APPEAR+i*GAP+420),cl0=ph(t,CLOSE0+i*80,CLOSE0+i*80+700);
  if(a<=0||cl0>=1)return;
  const P=ppos(G,i),ch=ph(t,CH0,LAUNCH)*(1-ph(t,LAUNCH,LAUNCH+300)),
   s=k*.3*back(a)*(1-eo(cl0))*(1+.05*Math.sin(t/160+i*1.7)+ch*(.28+.1*Math.sin(t/55+i))),
   rot=(i%2?1:-1)*(t/1800)+(1-a)*3;
  const pr=ph(t,T_APPEAR+i*GAP,T_APPEAR+i*GAP+600);   /* vòng áp lực nở ra lúc lỗ mở */
  ring(g,P.x,P.y,70*k*eo(pr),48*k*eo(pr),(1-pr)*.8,2);
  glow(g,P.x,P.y,90*k*(1-eo(cl0))*(1+ch*.5),'150,70,255',.45*a+.3*ch);
  cell(g,0,P.x,P.y,s,a*(1-cl0),rot);
  let fl=0;
  for(const S of SHOTS)if(S.p===i){const d=t-S.t;if(d>-50&&d<220)fl=Math.max(fl,1-Math.abs(d-40)/180)}
  if(fl>0){cell(g,1,P.x,P.y,s*1.08,cl(fl)*.9,rot*.3);glow(g,P.x,P.y,130*k,'230,190,255',.55*fl)}
 }
 function planet(g,x0,y0,x1,y1,p,sc,a){
  const x=lerp(x0,x1,ei(p)*.6+p*.4),y=lerp(y0,y1,ei(p)*.6+p*.4),ang=Math.atan2(y1-y0,x1-x0);
  g.save();g.translate(x,y);g.rotate(ang-.45);g.scale(sc,sc);
  glow(g,0,0,120,'190,110,255',.5*a);
  if(SP.ok){g.globalAlpha*=cl(a);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   g.drawImage(SP.img,2*CELL,0,CELL,CELL,-CELL/2-96,-CELL/2-31,CELL,CELL)}
  g.restore();
  return{x,y}}
 function expl(g,x,y,p,sc,seed){
  if(p<=0||p>=1)return;
  const a=(1-p)*(p<.12?p/.12:1);
  glow(g,x,y,95*sc*(.5+eo(p)),'255,235,255',.7*a);
  cell(g,3,x,y,sc*(.55+.45*eo(p)),a,0);
  sparks(g,x,y,p,14,95*sc,seed)}

 function draw(g,f,ts,G){
  const t=ts-f.t0;if(t<0||t>END)return;
  const k=K(G),fin=1-ph(t,HIT,HIT+700);
  let hitAge=999;for(const S of SHOTS){const d=t-(S.t+FLY);if(d>=0&&d<160)hitAge=Math.min(hitAge,d)}
  const sh=(hitAge<160?(1-hitAge/160)*2.2:0)+(t>=HIT?fin*7:0)+ph(t,CH0,LAUNCH)*1.5*(t<LAUNCH?1:0);
  g.save();clip(g,G);
  if(sh>.05)g.translate((hs(Math.floor(t/33))-.5)*sh,(hs(Math.floor(t/33)+9)-.5)*sh);
  g.imageSmoothingEnabled=true;
  for(let i=0;i<NP;i++)portal(g,i,t,G,k);
  /* dồn lực: tia nối lỗ -> địch + tinh thể hút về lỗ */
  const ch=ph(t,CH0,LAUNCH)*(1-ph(t,LAUNCH,LAUNCH+250));
  if(ch>0){
   g.save();g.globalCompositeOperation='lighter';
   for(let i=0;i<NP;i++){const P=ppos(G,i);
    g.strokeStyle='rgba(200,140,255,'+(.15+.45*ch)+')';g.lineWidth=1+2*ch;g.beginPath();g.moveTo(P.x,P.y);g.lineTo(G.tx,G.ty);g.stroke();
    for(let j=0;j<7;j++){const q=(t/520+j/7+i*.13)%1,rr=(1-q)*95*k,an=hs(i*7+j)*6.2832;
     g.fillStyle=j%2?'#e6c8ff':'#a56bff';g.fillRect(Math.round(P.x+Math.cos(an)*rr),Math.round(P.y+Math.sin(an)*rr),2,2)}}
   g.restore();glow(g,G.tx,G.ty,70*k*(1+ch),'200,150,255',.35*ch)}
  /* 14 phát bắn xen kẽ */
  for(const S of SHOTS){
   const d=t-S.t,P=ppos(G,S.p);if(d<0||d>FLY+420)continue;
   const tx=G.tx+S.jx*k,ty=G.ty+S.jy*k;
   if(d<FLY){const p=d/FLY;planet(g,P.x,P.y,tx,ty,p,k*(.13+.12*p),Math.min(1,p*6))}
   else{const p=(d-FLY)/420;expl(g,tx,ty,p,k*.5,S.k*17);glow(g,G.tx,G.ty,80*k,'190,120,255',.4*(1-p))}
  }
  /* cú chót: 6 lỗ đồng loạt bắn tinh cầu lớn, trúng ở HIT */
  if(t>=LAUNCH&&t<HIT+60){
   for(let i=0;i<NP;i++){const P=ppos(G,i),p=ph(t,LAUNCH+i*14,HIT),aa=1-ph(t,HIT,HIT+60);
    if(p>0&&aa>0)planet(g,P.x,P.y,G.tx+(hs(i*5)-.5)*30*k,G.ty+(hs(i*9)-.5)*30*k,p,k*(.2+.14*p),aa)}
   const lf=ph(t,LAUNCH-60,LAUNCH+80)*(1-ph(t,LAUNCH+80,LAUNCH+400));
   if(lf>0)for(let i=0;i<NP;i++){const P=ppos(G,i);glow(g,P.x,P.y,150*k,'240,210,255',.7*lf)}
  }
  /* nổ lớn + sóng không gian + xoáy vụn + tinh vân */
  if(t>=HIT){
   const p1=ph(t,HIT,HIT+1100),p2=ph(t,HIT+120,HIT+1300);
   expl(g,G.tx,G.ty,p1,k*1.15,777);
   expl(g,G.tx,G.ty+10*k,p2,k*.8,333);
   const rp=ph(t,HIT,HIT+1000);
   ring(g,G.tx,G.gy,40*k+300*k*eo(rp),12*k+85*k*eo(rp),(1-rp)*.9,4);
   ring(g,G.tx,G.gy,30*k+210*k*eo(ph(t,HIT+150,HIT+1100)),9*k+60*k*eo(ph(t,HIT+150,HIT+1100)),(1-ph(t,HIT+150,HIT+1100))*.7,2);
   const a4=ph(t,HIT+100,HIT+500)*(1-ph(t,HIT+800,HIT+1500));
   cell(g,4,G.tx,G.ty,k*(.7+.25*ph(t,HIT+100,HIT+1500)),a4,(t-HIT)/1400);
   const a5=ph(t,HIT+400,HIT+900)*(1-ph(t,HIT+1300,END-100));
   cell(g,5,G.tx,G.ty-8*k*ph(t,HIT+400,END),k*(.85+.1*ph(t,HIT+400,END)),a5,0);
   sparks(g,G.tx,G.ty,ph(t,HIT,HIT+1500),40,170*k,555,'#f1dcff');
  }
  /* chớp trắng lúc trúng */
  const fa=ph(t,HIT-40,HIT+30)*(1-ph(t,HIT+30,HIT+480));
  if(fa>.01){g.save();g.globalAlpha=.85*fa;g.fillStyle='#f3e6ff';g.fillRect(G.x0-20,G.y0-20,G.w+40,G.h+40);g.restore()}
  g.restore()}

 /* RUNG MÀN (px, rung cả canvas ở index.html): mỗi lần lỗ không gian bắn ra rung 1 cái; dồn lực (CH0-LAUNCH) rung dữ dội dần; 6 lỗ bắn đồng loạt 1 cái mạnh; NỔ LỚN ở HIT rung mạnh nhất rồi tắt dần. Cùng kiểu Thời Gian Tỉnh Lặng. */
 function shake(f,ts){
  const t=ts-f.t0;if(t<0||t>END)return 0;let a=0;
  for(const S of SHOTS){const d=t-S.t;if(d>=0&&d<220)a=Math.max(a,5*(1-d/220))}
  if(t>=CH0&&t<LAUNCH)a=Math.max(a,3+8*ph(t,CH0,LAUNCH));
  if(t>=LAUNCH&&t<LAUNCH+300)a=Math.max(a,12*(1-(t-LAUNCH)/300));
  if(t>=HIT&&t<HIT+1100)a=Math.max(a,28*Math.pow(1-(t-HIT)/1100,1.5));
  return a}
 window.TTGTinhHa={ID,dur:{[ID]:{hit:HIT,end:END}},under,draw,shake,sp:SP,SHOTS};
})();
