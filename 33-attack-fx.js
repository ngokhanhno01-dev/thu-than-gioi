/* ===== 33-attack-fx.js — 17 kiểu đòn đánh riêng cho 17 vùng (bước 2) =====
   Chỉ thay phần HÌNH ẢNH của đòn đánh/va chạm: không đụng chỉ số, công thức hay diễn biến trận.
   Cách làm: bọc TTGCombatFX.drawAttack / drawImpact của 31-combat-fx.js. Sprite vẫn do 31 chọn khung,
   file này tô màu theo vùng, đổi quỹ đạo, phóng to, thêm hạt/vệt riêng cho từng vùng.
   Lỗi bất kỳ → tự quay về hiệu ứng gốc của 31, không làm đứng trận.
   [FX 1B/1C] Vùng đã vẽ lại bằng CODE (không ảnh) nằm trong bảng ZFX bên dưới; vùng nào có trong ZFX thì bỏ qua ảnh. */
(()=>{
'use strict';
let tries=0;
function boot(){
 const API=window.TTGCombatFX;
 if(!API||!API.zones||!API.drawAttack||!API.drawImpact){if(tries++<200)setTimeout(boot,50);return}
 if(API.__atk17)return;
 API.__atk17=1;
 const orig={drawAttack:API.drawAttack,drawImpact:API.drawImpact};
 const zones=API.zones;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const rnd=seed=>{let s=(seed|0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return((s>>>0)%10007)/10007}};
 const rgb=h=>{const n=parseInt(String(h).slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const lighten=(h,t)=>'rgb('+rgb(h).map(v=>Math.round(v+(255-v)*t)).join(',')+')';
 const zi=s=>Math.max(0,Math.min(zones.length-1,Number(s)||0));

 /* ===== [FX 1B] VÙNG VẼ BẰNG CODE (canvas 2D, không ảnh) =====
    ZFX[số vùng] = hàm vẽ toàn bộ đòn đánh + va chạm theo S.u (0..1, trúng ở u=.35). Dùng engine API.engine của 31-combat-fx.js. */
 const E=API.engine;
 let STY='px';                                    /* 'px' = pixel (chốt), 'sm' = mịn (chỉ để so sánh trong trang demo) */
 const pxC=document.createElement('canvas');pxC.width=180;pxC.height=125;
 const pxG=pxC.getContext('2d',{willReadFrequently:true});
 /* vẽ fn lên lớp độ phân giải 1/2, giới hạn 6 mức/kênh (216 màu) + 4 mức trong suốt, rồi phóng to không làm mịn → pixel art */
 function layer(g,fn){
  if(STY!=='px'){fn(g);return}
  pxG.setTransform(1,0,0,1,0,0);pxG.clearRect(0,0,180,125);pxG.setTransform(.5,0,0,.5,0,0);
  fn(pxG);
  pxG.setTransform(1,0,0,1,0,0);
  const id=pxG.getImageData(0,0,180,125),d=id.data;
  for(let i=0;i<d.length;i+=4){const a=d[i+3];if(!a)continue;d[i]=Math.round(d[i]/51)*51;d[i+1]=Math.round(d[i+1]/51)*51;d[i+2]=Math.round(d[i+2]/51)*51;d[i+3]=Math.round(a/85)*85}
  pxG.putImageData(id,0,0);
  g.save();g.imageSmoothingEnabled=false;g.drawImage(pxC,0,0,360,250);g.restore();
 }
 const ICE_PAL={dark:'#1b5fa8',mid:'#58b8f0',light:'#c8f2ff',edge:'#e8fbff'},ICE_PAL2={dark:'#27408f',mid:'#6f94e8',light:'#d4e4ff',edge:'#ffffff'};
 /* 0 Tuyết Nguyên: KHÔNG có vật bay. Dải gai băng mọc từ đất, chạy từ chân người đánh tới mục tiêu (thấp → cao), cụm gai lớn nhất bao quanh mục tiêu
    (chừa khoảng giữa để thấy mục tiêu), rồi vỡ dần từ mục tiêu ngược về người đánh. Trúng lúc t=.665s (u=.35). */
 function iceRun(g,T,t,pa,miss,cr,s){
  const GY=204,TS=.08,TH=.665,TSH=.86,END=1.68,dir=pa?1:-1,x0=pa?108:250,tx=pa?272:85,L0=Math.abs(tx-x0),L=miss?L0*.62:L0,hk=cr?1.15:1,
   r=E.rng(s.seed),col='#9fe4ff',cap=l=>Math.max(.12,Math.min(l,END-t)),tHd=miss?TH*.7:TH;
  const main=[],back=[],small=[];
  for(let i=0;i<13;i++){const k=i/12;main.push({k,x:x0+dir*(k*(L-40))+r.range(-4,4),y:GY,h:(14+90*Math.pow(k,1.6)+r.range(0,10))*(miss?.7:hk),w:9+11*k+r.range(0,3),lean:r.range(-4,4)+dir*2,tE:TS+k*(tHd-TS-.1),p:ICE_PAL})}
  if(!miss)[[-34,125,26,0,-1],[34,118,24,.04,1],[-54,86,16,.07,-1],[54,80,16,.1,1]].forEach(c=>main.push({k:1,x:tx+dir*c[0],y:GY,h:c[1]*hk,w:c[2],lean:c[4]*dir*6,tE:TH-.1+c[3],p:ICE_PAL,hi:1}));
  for(let i=0;i<12;i++){const k=i/11;back.push({k,x:x0+dir*(k*L)+r.range(-6,6),y:GY-5,h:(10+.55*(14+90*Math.pow(k,1.6))+r.range(0,8))*(miss?.7:1),w:8+9*k,lean:r.range(-5,5),tE:TS+.03+k*(tHd-TS-.08),p:ICE_PAL2})}
  for(let i=0;i<26;i++){const k=i/25;small.push({k,x:x0+dir*(k*(L+10))+r.range(-5,5),y:GY+3,h:5+r()*9+k*6,w:5+r()*3,lean:r.range(-3,3),tE:TS+.06+k*(tHd-TS-.06),p:ICE_PAL2})}
  const crackA=1-E.ph(t,TSH+.3,TSH+.7),headK=E.eIO(E.ph(t,TS,tHd)),head=x0+dir*L*headK;
  /* tụ lạnh dưới chân người đánh */
  if(t<TS+.3){
   const c=E.ph(t,0,.2);
   E.glow(g,x0,GY-4,34*E.eOut(c),col,.55*(1-E.ph(t,.2,.42)));
   E.wave(g,x0,GY,8+26*E.eOut(E.ph(t,0,.3)),col,(1-E.ph(t,.1,.4))*.85,1.6,{seed:s.seed,t:T});
   for(let n=E.rate(s,'ch',E.ph(t,0,.2),30);n>0;n--)E.emit({x:x0+r.range(-18,18),y:GY-r.range(0,6),vx:r.range(-10,10),vy:r.range(-40,-14),life:r.range(.3,.5),s0:r.range(2,3.5),s1:.5,shape:r()<.5?'flake':'spark',c:col,c2:'#ffffff',a:.9,add:true,tag:'fx',rot:r()*6,vr:r.range(-4,4)});
  }
  /* sương băng phủ mặt đất dọc đường đi */
  for(let i=0;i<9;i++){const k=i/8,p=E.ph(t,TS+k*(tHd-TS),TS+k*(tHd-TS)+.3);
   if(p>0)E.blob(g,x0+dir*L*k,GY+1,32,5,col,.38*p*crackA,T,s.seed+i,{wob:.4,core:'#dff6ff'})}
  /* vết nứt đất chạy theo mũi băng + nhánh */
  if(t>TS&&crackA>0){
   const rc=E.rng(s.seed^0x51ed),pts=E.jag(rc,x0,GY+3,head,GY+3,18,3);
   g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';g.strokeStyle=E.rgba('#dff6ff',.8*crackA);g.lineWidth=2;
   g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
   g.lineWidth=1.4;g.strokeStyle=E.rgba('#9fe4ff',.6*crackA);
   for(let i=2;i<pts.length-1;i++){const p=pts[i],sg=rc.sign(),l=rc.range(8,20);g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+sg*dir*l*.4,p[1]+sg*l*.35);g.lineTo(p[0]+sg*dir*l*.9,p[1]+sg*l*.2);g.stroke()}
   g.restore();
   E.glow(g,head,GY-8,24,col,.5*(1-E.ph(t,tHd,tHd+.2)));
  }
  /* vẽ gai: hàng sau → hàng chính (+ cụm quanh mục tiêu) → hàng trước; mọc, rồi vỡ dần từ mục tiêu ngược về người đánh */
  const drawRow=(a,id,burstN)=>a.forEach((c,i)=>{
   if(t<c.tE)return;
   const ts=(miss?TSH-.2:TSH)+(1-c.k)*(miss?.15:.22)+(i%3)*.02,vis=1-E.ph(t,ts,ts+.05);
   if(vis>0){
    const hh=c.h*E.eBack(E.ph(t,c.tE,c.tE+.24));
    E.crystal(g,c.x,c.y,c.w,hh,c.lean,c.p,vis*(c.hi?.88:1)*(miss?.85:1),{crack:E.ph(t,c.tE+.15,c.tE+.4),shine:Math.sin(T*4+c.k*9+i)*.5+.5});
   }
   if(id!=='s'&&E.once(s,id+'e'+i)){
    const re=E.rng(s.seed+i*31+id.charCodeAt(0));
    E.burst(re,c.x,c.y,4,{speed:[30,90],ang:[-Math.PI,0],size:[2,3.5],life:[cap(.4),cap(.7)],gy:240,drag:.4,shape:'shard',c:c.p.mid,c2:c.p.light,a:.9,tag:'fx',vr:[-8,8],floor:GY+4,bounce:.3});
    E.burst(re,c.x,c.y-2,1,{speed:[4,16],ang:[-Math.PI,0],size:[10,16],life:[cap(.6),cap(.9)],gy:-10,drag:1,shape:'mist',c:'#cfeeff',a:.7,tag:'fx'});
   }
   if(t>=ts&&E.once(s,id+'s'+i)){
    const rb=E.rng(s.seed+i*77+id.charCodeAt(0)*13);
    E.burst(rb,c.x,c.y-c.h*.5,burstN,{speed:[40,150],ang:[-Math.PI*.95,-Math.PI*.05],size:[3,6],life:[cap(.4),cap(.65)],gy:260,drag:.6,shape:'shard',c:c.p.mid,c2:c.p.light,a:.95,tag:'fx',vr:[-9,9],floor:GY+4,bounce:.3});
    if(id==='m')E.burst(rb,c.x,c.y-c.h*.8,2,{speed:[10,50],size:[2,3],life:[cap(.3),cap(.5)],gy:40,drag:1,shape:'spark',c:'#ffffff',c2:'#ffffff',a:1,add:true,tag:'fx',vr:[-4,4]});
    if(id!=='s')E.burst(rb,c.x,c.y-c.h*.4,1,{speed:[10,40],ang:[-Math.PI,0],size:[14,22],life:[cap(.5),cap(.75)],gy:-8,drag:1,shape:'mist',c:'#bfe8ff',a:.8,tag:'fx'});
   }
  });
  drawRow(back,'b',4);drawRow(main,'m',6);drawRow(small,'s',2);
  /* sương băng bốc lên lúc gai mọc */
  for(let n=E.rate(s,'fog',E.ph(t,0,.5),36);n>0;n--)E.emit({x:x0+dir*r.range(0,L),y:GY-r.range(0,8),vx:r.range(-6,6),vy:r.range(-14,-4),life:cap(r.range(.6,1)),s0:8,s1:r.range(18,26),shape:'mist',c:'#bfe8ff',a:.7,tag:'fx'});
  /* khi đòn trúng: quầng lạnh nhẹ + sóng băng quanh mục tiêu (không chớp trắng) */
  if(!miss&&t>TH-.1){
   E.glow(g,tx,GY-36,64,col,.3*E.ph(t,TH-.1,TH)*(1-E.ph(t,TH+.1,TH+.6)));
   E.wave(g,tx,GY,10+100*E.eOut(E.ph(t,TH-.1,TH+.7)),col,(1-E.ph(t,TH+.1,TH+.7))*.85,2,{seed:s.seed+5,t:T});
   E.wave(g,tx,GY,6+60*E.eOut(E.ph(t,TH-.05,TH+.5)),'#ffffff',(1-E.ph(t,TH+.1,TH+.5))*.5,1.2,{seed:s.seed+9,t:T});
  }
  /* bông tuyết rơi + hơi lạnh sau khi vỡ */
  if(t>=TSH+.1&&E.once(s,'snow')){
   const rs=E.rng(s.seed^777);
   [.25,.55,.85].forEach(f=>E.burst(rs,x0+dir*L*f,60,14,{jx:50,jy:14,speed:[2,14],ang:[1.2,1.9],size:[3,5],life:[cap(.7),cap(.9)],gy:28,drag:.4,shape:'flake',c:'#ffffff',a:.9,tag:'fx',vr:[-2,2]}));
  }
  E.draw(g,'fx');
 }
 function iceFx(g,T,S){
  const u=clamp(S.u||0,0,1),s=E.seed('ice',u);
  E.setSpeed(window.BSPD||1);
  if(E.once(s,'init'))E.clear();                 /* đòn mới: bỏ hạt của đòn trước */
  layer(g,gg=>iceRun(gg,T,u*1.9,!!S.pa,!!S.miss,!!S.cr,s));
  return true;
 }
 /* 1 Sương Cốc (gần): thú KHÔNG di chuyển (giữ nguyên vị trí); luồng sương xông từ thú tới sát mục tiêu (như lao tới), rồi 2 nhát chém sương
    bắt chéo tại mục tiêu, rồi các cột sương/nước PHUN từ đất CHỈ quanh mục tiêu (uốn cong như vòi phun, lõi trắng, rìa xanh ngọc, thon dần, cuộn xoáy;
    2 cột lớn hai bên, chừa giữa để thấy mục tiêu). Chân cột có vòng bọt + mảnh tinh thể nhỏ, giọt nước rơi có trọng lực. Trúng lúc t=.665s (u=.35). Rồi tan dần. */
 function mistRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,x0=pa?108:250,tx=pa?272:85,tc=miss?tx-dir*80:tx,hk=cr?1.2:1,
   r=E.rng(s.seed),cap=l=>Math.max(.12,Math.min(l,END-t)),C1='#a3e1d4',C2='#4fd0bf',C3='#e8fffa',
   ex=tc-dir*38,rp=E.eIO(E.ph(t,.12,.52)),fall=1-E.ph(t,.5,.64);
  /* cột phun quanh mục tiêu (hướng cong = hướng ra xa mục tiêu) */
  const cols=[],N=miss?4:9;
  for(let i=0;i<N;i++){
   const k=i/(N-1);let off=-64+k*118+r.range(-5,5);if(Math.abs(off)<20)off=off<0?-20:20;
   const bx=tc+dir*off;
   cols.push({bx,H:(30+34*(1-Math.abs(k-.5)*1.2)+r.range(0,12))*(miss?.65:hk),w:8+4*(1-Math.abs(k-.5)*2)+r.range(0,2),bend:(off<0?-dir:dir)*r.range(.25,.8),ph:r.range(0,6.28),tE:TH-.04+Math.abs(off)/220,tF:(miss?1:1.12)+r.range(0,.18),big:0})}
  if(!miss)[[-27,120,-.95,0],[27,104,.85,.05]].forEach(c=>cols.push({bx:tc+dir*c[0],H:c[1]*hk,w:17,bend:(c[0]<0?-dir:dir)*Math.abs(c[2]),ph:r.range(0,6.28),tE:TH-.02+c[3],tF:1.32,big:1}));
  /* tụ sương dưới chân người đánh */
  if(t<.5){
   const c=E.ph(t,0,.22);
   E.glow(g,x0,GY-6,36*E.eOut(c),C2,.5*(1-E.ph(t,.2,.42)));
   E.wave(g,x0,GY,8+26*E.eOut(E.ph(t,0,.3)),C1,(1-E.ph(t,.1,.4))*.8,1.6,{seed:s.seed,t:T});
   for(let n=E.rate(s,'ch',E.ph(t,0,.2),26);n>0;n--)E.emit({x:x0+r.range(-20,20),y:GY-r.range(0,4),vx:r.range(-8,8),vy:r.range(-46,-18),life:r.range(.3,.5),s0:r.range(1.6,3),s1:.5,shape:'orb',c:C1,c2:'#ffffff',a:.9,add:true,tag:'fx'});
  }
  /* sương phủ mặt đất dọc đường xông */
  for(let i=0;i<9;i++){const k=i/8,p=E.ph(t,.12+k*.4,.12+k*.4+.3);
   if(p>0)E.blob(g,x0+(ex-x0)*k,GY+1,30,5,C1,.32*p*(1-E.ph(t,1.2,1.62)),T,s.seed+i,{wob:.4,core:C3})}
  /* luồng sương xông từ thú tới sát mục tiêu */
  if(t>.13&&fall>0){
   const n=14,tl=Math.max(0,rp-.45),pts=[];
   for(let j=0;j<n;j++){const f=tl+(rp-tl)*j/(n-1);pts.push([x0+(ex-x0)*f,GY-36+Math.sin(j*.9+T*16)*3.5*(j/(n-1))-Math.sin(f*Math.PI)*6])}
   const wf=q=>20*Math.pow(q,.8)*(1+.1*Math.sin(T*14));
   E.ribbon(g,pts,wf,C2,fall*.5,{core:C1});
   E.ribbon(g,pts,q=>wf(q)*.6,C1,fall*.8,{core:C3});
   E.ribbon(g,pts,q=>wf(q)*.25,'#ffffff',fall,{core:'#ffffff'});
   E.glow(g,pts[n-1][0],GY-36,26,C2,.5*fall);
   for(let m=E.rate(s,'rush',E.ph(t,.12,.52),44);m>0;m--)E.emit({x:pts[n-1][0]-dir*r.range(0,18),y:GY-r.range(10,50),vx:-dir*r.range(10,50),vy:r.range(-16,6),life:cap(r.range(.35,.6)),s0:6,s1:r.range(12,18),shape:'mist',c:'#bff3ea',a:.6,tag:'fx'});
  }
  /* các cột phun */
  cols.forEach((c,i)=>{
   const gw=E.eOut(E.ph(t,c.tE,c.tE+.34)),out=1-E.ph(t,c.tF,c.tF+.34);
   if(gw<=.01)return;
   if(E.once(s,'b'+i)){
    const rb=E.rng(s.seed+i*53);
    E.burst(rb,c.bx,GY,c.big?7:3,{speed:[10,40],ang:[-Math.PI,0],size:[2,3.5],life:[cap(.5),cap(.9)],gy:-30,drag:.6,shape:'orb',c:'#d8fff7',c2:'#ffffff',a:.85,add:true,tag:'fx'});
    E.burst(rb,c.bx,GY-2,c.big?3:1,{speed:[30,70],ang:[-Math.PI*.95,-Math.PI*.05],size:[2,3.5],life:[cap(.4),cap(.7)],gy:240,drag:.4,shape:'shard',c:C2,c2:C3,a:.9,tag:'fx',vr:[-8,8],floor:GY+4,bounce:.3});
   }
   if(out<=0)return;
   const len=gw*(.5+.5*out),n=c.big?20:15,pts=[],br=1+.05*Math.sin(T*9+c.ph);
   for(let j=0;j<n;j++){const sv=len*(1-j/(n-1)),yy=c.H*br*(1.25*sv-.75*sv*sv);
    pts.push([c.bx+c.bend*c.H*.5*sv*sv+Math.sin(sv*5+T*7+c.ph)*3.5*sv,GY-yy])}
   const a=out,wk=c.w*(1+.1*Math.sin(T*10+c.ph)),wf=q=>wk*(.12+.88*Math.pow(q,.75));
   E.blob(g,c.bx,GY+1,c.w*1.6+8,3.5+c.w*.25,C3,.5*a*Math.min(1,gw*2),T,s.seed+i*3,{wob:.35,core:'#ffffff'});
   E.wave(g,c.bx,GY+1,6+(c.big?26:15)*E.eOut(E.ph(t,c.tE,c.tE+.45)),C1,.6*a*(1-E.ph(t,c.tE+.2,c.tE+.6)),1.2,{seed:s.seed+i,t:T});
   E.ribbon(g,pts,wf,C2,a*.5,{core:C1});
   E.ribbon(g,pts,q=>wf(q)*.62,C1,a*.8,{core:C3});
   E.ribbon(g,pts,q=>wf(q)*.26,'#ffffff',a,{core:'#ffffff'});
   if(c.big){const p2=pts.map((p,j)=>{const q=j/(n-1);return[p[0]+Math.cos((1-q)*10+T*8+c.ph)*8*(1-q),p[1]]});E.ribbon(g,p2,q=>wf(q)*.2,C1,a*.6,{core:C3})}
   /* giọt nước văng từ ngọn cột, rơi có trọng lực */
   for(let m=E.rate(s,'d'+i,E.ph(t,c.tE+.12,c.tF+.2),c.big?26:10);m>0;m--){const tp=pts[0];
    E.emit({x:tp[0]+r.range(-3,3),y:tp[1],vx:c.bend*r.range(10,40)+r.range(-12,12),vy:-r.range(6,40),gy:300,drag:.3,life:cap(r.range(.5,.85)),s0:r.range(1.6,2.8),s1:.7,shape:'orb',c:C1,c2:'#ffffff',a:.95,add:true,tag:'fx',floor:GY+3,bounce:.12})}
  });
  /* 2 nhát chém sương bắt chéo tại mục tiêu (nhát sau lệch nhịp), kết thúc đúng lúc trúng */
  const slash=(ts,tilt,flip,R,w)=>{
   const sw=E.eOut(E.ph(t,ts,ts+.14)),out=1-E.ph(t,ts+.12,ts+.36);if(sw<.05||out<=0)return;
   const n=14,pts=[],a0=-2.5,a1=.35,ca=Math.cos(tilt),sa=Math.sin(tilt);
   for(let j=0;j<n;j++){const an=a0+(a1-a0)*sw*(j/(n-1)),px=dir*Math.cos(an)*R*.85,py=flip*Math.sin(an)*R;
    pts.push([tc+px*ca-py*sa,GY-56+px*sa+py*ca])}
   const wf=q=>w*Math.sin(Math.min(1,q*1.15)*Math.PI*.85+.15);
   E.ribbon(g,pts,wf,C2,out*.55,{core:C1});
   E.ribbon(g,pts,q=>wf(q)*.6,C1,out*.85,{core:C3});
   E.ribbon(g,pts,q=>wf(q)*.22,'#ffffff',out,{core:'#ffffff'});
  };
  slash(TH-.15,-.5,1,miss?36:50,miss?10:15);
  slash(TH-.09,.5,-1,miss?30:44,miss?8:13);
  /* khi đòn trúng: quầng mát nhẹ + vòng bọt sương toả ra mặt đất (không chớp trắng) */
  if(!miss&&t>TH-.1){
   E.glow(g,tx,GY-30,60,C2,.26*E.ph(t,TH-.1,TH)*(1-E.ph(t,TH+.1,TH+.6)));
   E.wave(g,tx,GY,10+104*E.eOut(E.ph(t,TH-.1,TH+.8)),C1,(1-E.ph(t,TH+.15,TH+.8))*.8,2,{seed:s.seed+5,t:T});
   E.wave(g,tx,GY,6+66*E.eOut(E.ph(t,TH-.05,TH+.6)),'#ffffff',(1-E.ph(t,TH+.1,TH+.6))*.5,1.2,{seed:s.seed+9,t:T});
  }
  if(t>=TH&&E.once(s,'hit')){
   const rb=E.rng(s.seed^0x2b7);
   E.burst(rb,tc,GY-8,miss?8:20,{speed:[20,100],ang:[-Math.PI*.95,-Math.PI*.05],size:[2,5],life:[cap(.5),cap(.9)],gy:120,drag:.9,shape:'orb',c:C1,c2:'#ffffff',a:.9,add:true,tag:'fx'});
   if(!miss)[[-.35,.35],[Math.PI-.35,Math.PI+.35]].forEach(an=>E.burst(rb,tc,GY,5,{speed:[30,90],ang:an,size:[10,16],life:[cap(.6),cap(.95)],gy:-6,drag:1.4,shape:'mist',c:'#bff3ea',a:.7,tag:'fx'}));
  }
  /* hơi sương bốc lên quanh mục tiêu */
  for(let m=E.rate(s,'fog',E.ph(t,.5,1),24);m>0;m--)E.emit({x:tc+r.range(-70,70),y:GY-r.range(0,8),vx:r.range(-6,6),vy:r.range(-14,-4),life:cap(r.range(.6,1)),s0:8,s1:r.range(16,24),shape:'mist',c:'#bff3ea',a:.6,tag:'fx'});
  E.draw(g,'fx');
 }
 function mistFx(g,T,S){
  const u=clamp(S.u||0,0,1),s=E.seed('mist',u);
  E.setSpeed(window.BSPD||1);
  if(E.once(s,'init'))E.clear();                 /* đòn mới: bỏ hạt của đòn trước */
  layer(g,gg=>mistRun(gg,T,u*1.9,!!S.pa,!!S.miss,!!S.cr,s));
  return true;
 }
 /* va chạm của vùng code: mọi thứ đã do ZFX vẽ trong lúc đánh; chỉ còn quầng + tia chí mạng mềm (không chớp trắng) */
 function impactCode(g,fx){
  if(fx.k!=='crit')return true;
  const q=clamp(fx.q||0,0,.9999),tgt=fx.pp?272:90,y=150,fa=1-q;
  layer(g,gg=>{
   E.glow(gg,tgt,y,70,'#ffd24a',.4*Math.max(0,1-q*2.2));
   gg.save();gg.globalCompositeOperation='lighter';gg.lineCap='round';gg.strokeStyle=E.rgba('#ffd24a',.85*fa);gg.lineWidth=3;
   for(let i=0;i<16;i++){const an=i*Math.PI/8,r1=14+q*10,r2=40+q*84;gg.beginPath();gg.moveTo(tgt+Math.cos(an)*r1,y+Math.sin(an)*r1);gg.lineTo(tgt+Math.cos(an)*r2,y+Math.sin(an)*r2);gg.stroke()}
   gg.restore();
  });
  return true;
 }
 const ZFX=E?{0:iceFx,1:mistFx}:{};
 const NOCODE_ATK=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/,NOCODE_IMP=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích|Xuyên giáp|Liên kích -|Phong Nhận(?: chém| -)|Dương Diệm|Thần Phán|Tinh Quang|Thiên Uy|Sương Tán/;

 /* ---------- Cấu hình 17 vùng ----------
  r = đòn đánh xa, m = đòn cận chiến, i = va chạm. Vùng nào không có r/m thì dùng mặc định theo màu vùng.
  r: path(quỹ đạo) sc(cỡ) spin(số rad xoay cả chặng bay) trail{k,n,gap,s} chg{k,n} tint glow add fan spread ghost
  m: sc rot0 sweep(xoay thêm) grow[đầu,cuối] copies[{ox,oy,r,d,sc}] part{k,n,R,grav,inward} tint glow pulse
  i: k(loại hạt) n R ring pillar sc grav */
 const SZR=1.3,SZM=1.28,SZI=1.3;      /* phóng to đòn xa / đòn gần / va chạm so với bản gốc */
 /* quầng sáng màu vùng sau viên đạn / nhát chém: để nhìn là biết vùng nào kể cả khi ảnh gốc giống nhau */
 function halo(g,x,y,r,col,a){
  if(a<=.01)return;
  g.save();g.globalAlpha=clamp(a,0,1);g.globalCompositeOperation='lighter';
  const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(.45,col);gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
 }
 /* Hướng ĐẦU của từng ảnh đòn xa (rad, 0 = đầu quay sang phải, y hướng xuống). Ảnh vẽ đầu hướng góc dưới-trái thì xoay lại cho đầu hướng tới đối thủ. */
 const FACE={0:3.1416,2:-2.88,4:3.1416,6:2.40,9:0,11:0,13:3.1416,14:0,15:0,16:0};   /* hướng đầu của ảnh mới: tia băng/sấm/sao tím có đầu quay TRÁI */
 /* độ nhuộm màu vùng cho từng ảnh (0 = giữ màu gốc của ảnh; chỉ nhuộm ảnh lệch màu vùng) */
 const ZT={0:0,1:.35,2:0,3:.6,4:0,5:0,6:0,7:.75,8:.8,9:0,10:0,11:0,12:.55,13:0,14:0,15:0,16:0};   /* ảnh đòn đã đúng màu vùng nên không nhuộm; chỉ nhuộm các chuỗi cận chiến xanh/hồng dùng lại */
 const DEF_R={path:'lob',arc:30,sc:1.35,trail:{k:'spark',n:6,gap:.05,s:2},chg:{k:'spark',n:6},tint:.5};
 const DEF_M={sc:1.3,sweep:.6,part:{k:'spark',n:8,R:46},tint:.5};
 const PROF=[
 /* 0 Tuyết Nguyên — băng lao vòng cung cao, xoay, rơi tuyết */
 {r:{path:'lob',arc:30,sc:1.3,trail:{k:'snow',n:9,gap:.045,s:2.4,grav:1.4},chg:{k:'snow',n:8},tint:0,glow:12},
  i:{k:'snow',n:14,R:58,ring:1,sc:1.45,grav:.4}},
 /* 1 Sương Cốc — vòng sương xoáy tròn quanh mục tiêu */
 {m:{sc:1.45,rot0:0,sweep:5.4,part:{k:'mist',n:8,R:46},tint:.45,glow:10,pulse:1},
  i:{k:'mist',n:8,R:50,sc:1.4}},
 /* 2 Vân Đảo — đạn mây uốn lượn như sóng */
 {r:{path:'wave',amp:16,freq:2.5,sc:1.4,trail:{k:'cloud',n:8,gap:.05,s:2.4},chg:{k:'cloud',n:7},tint:.45,glow:10},
  i:{k:'cloud',n:9,R:52,ring:1,sc:1.4}},
 /* 3 Phong Nguyên — lưỡi gió chém quét từ dưới lên, lá bay */
 {m:{sc:1.5,rot0:-.55,sweep:1.9,part:{k:'leaf',n:11,R:58,grav:.3},tint:.5,glow:10},
  i:{k:'leaf',n:12,R:62,sc:1.45,grav:.3}},
 /* 4 Lôi Vực — tia chớp bay giật zíc-zắc cực nhanh */
 {r:{path:'zig',amp:15,steps:14,sc:1.45,trail:{k:'bolt',n:7,gap:.035,s:2.2},chg:{k:'bolt',n:6},tint:.35,glow:14,add:.35},
  i:{k:'bolt',n:10,R:60,ring:1,sc:1.5}},
 /* 5 Nguyệt Cung — hai nhát trăng khuyết chém chéo, nhát sau lệch nhịp */
 {m:{sc:1.3,rot0:-.9,sweep:.7,copies:[{r:0},{r:.95,d:.22,sc:.9,ox:-4,oy:6}],part:{k:'spark',n:9,R:48},tint:.5,glow:11},
  i:{k:'spark',n:10,R:56,ring:1,sc:1.4}},
 /* 6 Dương Sơn — thiên thạch lửa từ trên giáng xuống, to */
 {r:{path:'drop',h:125,back:80,sc:1.7,trail:{k:'ember',n:11,gap:.04,s:2.6,grav:1.2},chg:{k:'ember',n:8},tint:.3,glow:14},
  i:{k:'ember',n:16,R:66,ring:1,sc:1.75,grav:.6}},
 /* 7 Huyền Uyên — chém chữ X, bụi rune tím */
 {m:{sc:1.25,rot0:0,sweep:.3,copies:[{r:.75},{r:-.75,d:.08}],part:{k:'rune',n:9,R:46},tint:.5,glow:12},
  i:{k:'rune',n:10,R:54,sc:1.45}},
 /* 8 Kim Khoáng — ba vuốt kim loại chém song song, tóe tia lửa */
 {m:{sc:1.1,rot0:-.25,sweep:.4,copies:[{oy:-18,ox:6},{oy:0,d:.08},{oy:18,ox:-6,d:.16}],part:{k:'spark',n:14,R:64},tint:.55,glow:10},
  i:{k:'spark',n:14,R:64,sc:1.35}},
 /* 9 Ngọc Động — đạn ngọc xoắn ốc, vệ tinh xanh bay quanh */
 {r:{path:'helix',amp:14,turns:3,sc:1.25,trail:{k:'spark',n:9,gap:.04,s:2.2},chg:{k:'spark',n:7},tint:.5,glow:12},
  i:{k:'spark',n:12,R:56,ring:1,sc:1.4}},
 /* 10 Thanh Lâm — chém hất lên, lá rơi */
 {m:{sc:1.35,rot0:.6,sweep:-1.3,part:{k:'leaf',n:12,R:50,grav:.9},tint:.5,glow:9},
  i:{k:'leaf',n:12,R:60,sc:1.45,grav:.8}},
 /* 11 Xích Hỏa Địa — cầu lửa nặng nảy 2 lần, tàn lửa lớn */
 {r:{path:'lob',arc:20,sc:1.5,trail:{k:'ember',n:12,gap:.035,s:3,grav:1},chg:{k:'ember',n:9},tint:0,glow:14},
  i:{k:'ember',n:18,R:70,ring:1,sc:1.8,grav:.5}},
 /* 12 Hắc Ám Lâm — xoáy tối co lại vào tâm (hút) */
 {m:{sc:1,grow:[1.75,.85],rot0:0,sweep:-5,part:{k:'mist',n:9,R:56,inward:1},tint:.55,glow:12,pulse:1},
  i:{k:'mist',n:9,R:54,sc:1.45}},
 /* 13 Tử Tinh Hải — sao tím bay đường chữ S, để lại bóng mờ */
 {r:{path:'S',rise:22,amp:22,sc:1.4,ghost:3,trail:{k:'shard',n:8,gap:.045,s:1.8},chg:{k:'shard',n:7},tint:0,glow:13},
  i:{k:'shard',n:12,R:60,ring:1,sc:1.5}},
 /* 14 Thiên Không — 3 mũi phóng hội tụ về mục tiêu, vệt gió */
 {r:{path:'none',fan:[-1,0,1],spread:22,sc:1.05,trail:{k:'line',n:6,gap:.05,s:2.2},chg:{k:'line',n:6},tint:.45,glow:10},
  i:{k:'line',n:10,R:64,ring:1,sc:1.4}},
 /* 15 Linh Hoa Viên — chém cánh hoa, hoa bay tản */
 {r:{path:'lob',arc:26,sc:1.4,trail:{k:'petal',n:10,gap:.045,s:2.4,grav:.8},chg:{k:'petal',n:8},tint:0,glow:12},
  i:{k:'petal',n:14,R:62,sc:1.45,grav:.3}},
 /* 16 Thần Điện — trụ sáng thần giáng thẳng từ trên xuống */
 {r:{path:'down',h:140,sc:1.55,trail:{k:'spark',n:10,gap:.04,s:2.2},chg:{k:'spark',n:8},tint:.3,glow:14,add:.3,pillar:1},
  i:{k:'spark',n:12,R:60,ring:1,pillar:1,sc:1.5}}
 ];

 /* ---------- Tô màu sprite (cache) ---------- */
 const TC=new Map();
 function tinted(img,sx,sy,sw,sh,col,amt,idx){
  const key=idx+'|'+col+'|'+amt+'|'+sx+','+sy+','+sw+','+sh;
  if(TC.has(key))return TC.get(key);
  if(TC.size>700)TC.clear();
  let c=null;
  try{
   c=document.createElement('canvas');c.width=sw;c.height=sh;
   const x=c.getContext('2d');x.imageSmoothingEnabled=false;
   x.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
   /* đổi hẳn sắc độ sang màu vùng nhưng giữ sáng/tối của ảnh, rồi trả lại viền trong suốt của ảnh gốc */
   x.globalCompositeOperation='color';x.globalAlpha=amt;x.fillStyle=col;x.fillRect(0,0,sw,sh);
   x.globalCompositeOperation='destination-in';x.globalAlpha=1;x.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
   x.globalCompositeOperation='lighter';x.globalAlpha=.3;x.drawImage(c,0,0);
  }catch(_){c=null}
  TC.set(key,c);return c;
 }
 /* Bọc ctx: chặn đúng lần drawImage đầu (sprite chính) để tô màu/phóng to/xoay; mọi lệnh khác chuyển thẳng cho ctx thật. */
 function drawMain(g,o,a){
  const img=a[0],sx=a[1],sy=a[2],sw=a[3],sh=a[4],dx=a[5],dy=a[6],dw=a[7],dh=a[8];
  const amt=o.tint==null?0:o.tint,src=amt>.04?(tinted(img,sx,sy,sw,sh,o.col,amt,o.idx)||img):img,tc=src!==img;
  const put=()=>tc?g.drawImage(src,0,0,sw,sh,dx,dy,dw,dh):g.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
  g.save();
  if(o.spin)g.rotate(o.spin);
  if(o.sc&&o.sc!==1)g.scale(o.sc,o.sc);
  if(o.alpha!=null)g.globalAlpha=clamp(g.globalAlpha*o.alpha,0,1);
  g.shadowColor=o.col;g.shadowBlur=o.glow==null?8:o.glow;
  put();
  if(o.add){g.globalCompositeOperation='lighter';g.globalAlpha=clamp(g.globalAlpha*o.add,0,1);g.shadowBlur=0;put()}
  g.restore();
 }
 function hook(g,o){
  let n=0;
  return new Proxy(g,{
   get(t,k){
    if(k==='drawImage')return function(){const a=arguments;if(++n===1&&a.length===9)return drawMain(t,o,a);return t.drawImage.apply(t,a)};
    const v=t[k];return typeof v==='function'?v.bind(t):v;
   },
   set(t,k,v){t[k]=v;return true}
  });
 }
 function callOrig(g,T,S,u,o,dx,dy){
  const S2=Object.assign({},S,{u});
  g.save();
  if(dx||dy)g.translate(dx||0,dy||0);
  try{return orig.drawAttack(hook(g,o),T,S2)}finally{g.restore()}
 }

 /* ---------- Hạt (pixel) ---------- */
 function part(g,k,x,y,s,col,col2,rot,a){
  g.save();g.globalAlpha=clamp(a==null?1:a,0,1);g.translate(x,y);if(rot)g.rotate(rot);
  switch(k){
   case'snow':g.fillStyle=col2;g.fillRect(-s,-.5,s*2+1,1);g.fillRect(-.5,-s,1,s*2+1);g.fillStyle=col;g.fillRect(-1,-1,2,2);break;
   case'ember':case'spark':g.fillStyle=col;g.fillRect(-s,-s,s*2,s*2);g.fillStyle=col2;g.fillRect(-s*.5,-s*.5,s,s);break;
   case'leaf':g.fillStyle=col;g.beginPath();g.ellipse(0,0,s*2,s*.9,0,0,7);g.fill();g.fillStyle=col2;g.fillRect(-s,-.5,s*2,1);break;
   case'petal':g.fillStyle=col;g.beginPath();g.ellipse(0,0,s*1.8,s*1.1,0,0,7);g.fill();g.fillStyle=col2;g.beginPath();g.ellipse(-s*.3,-s*.2,s*.8,s*.4,0,0,7);g.fill();break;
   case'cloud':case'mist':g.fillStyle=col;g.beginPath();g.arc(0,0,s*1.6,0,7);g.fill();g.globalAlpha*=.6;g.fillStyle=col2;g.beginPath();g.arc(-s*.5,-s*.4,s,0,7);g.fill();break;
   case'bolt':g.lineJoin='round';g.strokeStyle=col2;g.lineWidth=2.2;g.beginPath();g.moveTo(-s*2,-s);g.lineTo(-s*.5,0);g.lineTo(-s*1.2,s*.5);g.lineTo(s*2,s);g.stroke();g.strokeStyle=col;g.lineWidth=1;g.stroke();break;
   case'shard':g.fillStyle=col;g.beginPath();g.moveTo(0,-s*2);g.lineTo(s,0);g.lineTo(0,s*2);g.lineTo(-s,0);g.closePath();g.fill();g.fillStyle=col2;g.fillRect(-.5,-s,1,s*2);break;
   case'rune':g.fillStyle=col;g.fillRect(-s,-.5,s*2+1,1);g.fillRect(-.5,-s,1,s*2+1);g.fillStyle=col2;g.fillRect(-s,-s,2,2);g.fillRect(s-1,s-1,2,2);break;
   case'line':g.fillStyle=col2;g.fillRect(-s*3,-.5,s*6,1);g.fillStyle=col;g.fillRect(-s*2,.5,s*4,1);break;
   default:g.fillStyle=col;g.fillRect(-s,-s,s*2,s*2);
  }
  g.restore();
 }
 function pillar(g,x,y,a,col){
  const gd=g.createLinearGradient(x,y-140,x,y+20);
  gd.addColorStop(0,'rgba(255,255,255,0)');gd.addColorStop(.6,col);gd.addColorStop(1,'rgba(255,255,255,0)');
  g.save();g.globalAlpha=clamp(a,0,1)*.55;g.fillStyle=gd;g.fillRect(x-7,y-140,14,160);g.globalAlpha*=.6;g.fillRect(x-14,y-140,28,160);g.restore();
 }

 /* ---------- Quỹ đạo đòn đánh xa (độ lệch cộng thêm vào đường bay gốc) ---------- */
 function pathOff(c,f,sx,tx,dir,seed){
  const env=Math.sin(f*Math.PI);
  switch(c.path){
   case'lob':return[0,-env*c.arc];
   case'wave':return[0,Math.sin(f*6.283*c.freq)*c.amp*env];
   case'zig':{const k=Math.floor(f*c.steps),r=rnd(seed*13+k)();return[0,(r-.5)*2*c.amp*env]}
   case'drop':return[(1-f)*((tx-sx)-dir*c.back),-(1-f)*c.h];
   case'down':return[(tx-sx)*(1-f),-(1-f)*c.h];
   case'helix':return[0,Math.sin(f*6.283*c.turns)*c.amp*(.35+.65*env)];
   case'S':return[0,-env*c.rise+Math.sin(f*6.283)*c.amp];
   case'bounce':return[0,-Math.abs(Math.sin(f*Math.PI*c.n))*c.h*(1-f*.4)];
   default:return[0,0];
  }
 }

 function atkRanged(g,T,S,idx,z,c){
  const u=S.u||0,pa=!!S.pa,dir=pa?1:-1,sx=pa?112:248,tx=pa?255:105,ty=148,col=z.color,col2=lighten(col,.6),big=S.cr?1.18:1;
  const base={col,idx,tint:ZT[idx],glow:c.glow,add:c.add},head=FACE[idx]||0;
  if(u<.18){
   if(u<=.035)return orig.drawAttack(g,T,S);
   const ch=clamp((u-.035)/.145,0,1),r=rnd(S.i*31+idx),n=c.chg?c.chg.n:6,k=c.chg?c.chg.k:'spark';
   g.save();
   for(let j=0;j<n;j++){const a=r()*6.283+T*3,d=(1-ch)*(34+r()*18)+6;part(g,k,sx+Math.cos(a)*d,ty+Math.sin(a)*d*.7,1.5+ch*1.5,col,col2,0,.35+ch*.6)}
   g.restore();
   halo(g,sx,ty,(26+ch*34)*(c.sc||1.3),col,.3+ch*.4);
   return callOrig(g,T,S,u,Object.assign({},base,{sc:Math.min(2.3,(c.sc||1.3)*SZR)*(.95+ch*.45),spin:-head+(dir>0?-T*.7:T*.7)}),0,0);
  }
  if(u<.43){
   const f=clamp((u-.18)/.25,0,1);
   const pos=ft=>{const o=pathOff(c,ft,sx,tx,dir,S.i||0);return[sx+(tx-sx)*ft+o[0],ty-Math.sin(ft*Math.PI)*18+o[1]]};
   const off=pathOff(c,f,sx,tx,dir,S.i||0);
   /* góc bay tại f (đã tính phía bị lật khi đối thủ bắn sang trái) -> xoay ảnh cho ĐẦU hướng về phía trước */
   const ang=ft=>{const a=pos(Math.max(0,ft-.08)),b=pos(Math.min(1,ft+.08));return Math.atan2(b[1]-a[1],(b[0]-a[0])*dir)};
   /* vệt hạt phía sau */
   if(c.trail){const t=c.trail,r=rnd((S.i||0)*17+idx);g.save();
    for(let i=1;i<=t.n;i++){const ft=f-i*t.gap;if(ft<0)break;const p=pos(ft),k=i/t.n;
     part(g,t.k,p[0]+(r()-.5)*8,p[1]+(r()-.5)*8+(t.grav?i*t.grav:0),Math.max(1,(t.s||2)*(1.25-k*.7)),col,col2,r()*6.28,(1-k)*.9)}
    g.restore()}
   /* bóng mờ phía sau */
   if(c.ghost){for(let k=1;k<=c.ghost;k++){const f2=f-k*.055;if(f2<0)break;const o2=pathOff(c,f2,sx,tx,dir,S.i||0);
    callOrig(g,T,S,.18+f2*.25,Object.assign({},base,{sc:Math.min(2.3,(c.sc||1.3)*SZR)*big*.9,spin:ang(f2)-head+f2*(c.spin||0),alpha:.3/k}),o2[0],o2[1])}}
   /* thân đạn (có thể chia nhiều mũi) */
   const fan=c.fan||[0];let ret=null;
   const hp=pos(f);halo(g,hp[0],hp[1],46*(c.sc||1.3),col,.55);
   fan.forEach(k=>{
    const o={...base,sc:Math.min(2.3,(c.sc||1.3)*SZR)*big*(k===0?1.12:1),spin:ang(f)-head+f*(c.spin||0)};
    const r=callOrig(g,T,S,u,o,off[0],off[1]+k*(c.spread||0)*(1-f));
    if(ret===null||k===0)ret=r;
   });
   if(c.pillar&&f>.8)pillar(g,tx,ty,(f-.8)/.2,col2);
   return ret;
  }
  return orig.drawAttack(g,T,S);
 }

 function atkMelee(g,T,S,idx,z,c){
  const u=S.u||0,pa=!!S.pa,dir=pa?1:-1,tx=pa?255:105,ty=148,col=z.color,col2=lighten(col,.6);
  if(u<.23||u>=.6)return orig.drawAttack(g,T,S);
  const f=clamp((u-.23)/.37,0,1),copies=c.copies||[{}];
  let ret=null;
  copies.forEach((k,ci)=>{
   const fc=f-(k.d||0);if(fc<0)return;
   const uc=.23+clamp(fc,0,.9999)*.37;
   let sc=Math.min(2.4,(c.sc||1.3)*SZM)*(k.sc||1)*(S.cr?1.15:1);
   if(c.grow)sc*=c.grow[0]+(c.grow[1]-c.grow[0])*clamp(fc/.8,0,1);
   const spin=(c.rot0||0)+(k.r||0)+(c.sweep||0)*(clamp(fc,0,1)-.5);
   const al=c.pulse?.8+.2*Math.sin(T*18+ci):1;
   if(ci===0)halo(g,tx,ty,(40+fc*26)*sc,col,.5*Math.sin(Math.PI*clamp(fc,0,1))+.15);
   const r=callOrig(g,T,S,uc,{col,idx,tint:ZT[idx],glow:c.glow,add:c.add,sc,spin,alpha:al},(k.ox||0)*dir,k.oy||0);
   if(ret===null)ret=r;
  });
  if(c.part&&f>.28){
   const p=c.part,r=rnd((S.i||0)*53+idx),pf=(f-.28)/.72;
   g.save();
   for(let j=0;j<p.n;j++){
    const a=r()*6.283,k=.35+r()*.65,rr=p.inward?(p.R||50)*(1-pf)*k+4:(p.R||50)*k*(1-(1-pf)*(1-pf));
    part(g,p.k,tx+Math.cos(a)*rr,ty+Math.sin(a)*rr*.75+(p.grav||0)*pf*pf*40,1.5+r()*1.5,col,col2,r()*6.28,1-pf*.7);
   }
   g.restore();
  }
  return ret===null?true:ret;
 }

 /* Đòn đặc biệt (dung nham/Lôi Phạt) vẫn dùng hiệu ứng gốc của 31 */
 const ATK_SPECIAL=/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng/;
 const IMP_SPECIAL=/Khiên hấp thụ|Chắn đòn|hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh|Hút máu|Lôi Phạt|Lôi Kích -|Dung Nham|Thiêu đốt|Xích Diệm/;

 function drawAttackX(g,T,S){
  try{
   const text=S.text||'';
   if(ATK_SPECIAL.test(text))return orig.drawAttack(g,T,S);
   const idx=zi(S.s),z=zones[idx],P=PROF[idx];
   if(ZFX[idx]&&S.cl!==3&&!NOCODE_ATK.test(text))return ZFX[idx](g,T,S);      /* [FX 1B] vùng đã vẽ bằng code */
   const melee=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text)||z.mode==='melee';
   return melee?atkMelee(g,T,S,idx,z,P.m||DEF_M):atkRanged(g,T,S,idx,z,P.r||DEF_R);
  }catch(e){if(window.__ATK17_DEBUG)throw e;return orig.drawAttack(g,T,S)}
 }

 function drawImpactX(g,fx,T){
  try{
   const text=fx.text||'';
   if(fx.k==='block'||fx.k==='heal'||fx.k==='stun'||IMP_SPECIAL.test(text))return orig.drawImpact(g,fx,T);
   if(ZFX[zi(fx.s)]&&(fx.k==='hit'||fx.k==='crit'||fx.k==='miss')&&!NOCODE_IMP.test(text))return impactCode(g,fx);   /* [FX 1B] */
   const idx=zi(fx.s),z=zones[idx],P=PROF[idx],c=P.i||{k:'spark',n:10,R:56,sc:1.3};
   const col=z.color,col2=lighten(col,.6),q=clamp(fx.q||0,0,.9999),tgt=fx.pp?272:90,y=150,miss=fx.k==='miss',crit=fx.k==='crit';
   const o={col,idx,tint:ZT[idx],spin:-(FACE[idx]||0),sc:Math.min(2.3,(c.sc||1.3)*SZI)*(crit?1.2:1)*(miss?.8:1),glow:14};
   let ok;
   g.save();
   if(!miss)halo(g,tgt,y,52*(c.sc||1.3),col,.55*(1-q));
   try{ok=orig.drawImpact(hook(g,o),fx,T)}finally{g.restore()}
   if(ok){
    const n=Math.round((c.n||10)*(crit?1.5:1)*(miss?.35:1)),r=rnd((fx.i||0)*71+idx*7+1),R=c.R||56;
    g.save();
    for(let j=0;j<n;j++){
     const a=r()*6.283,sp=.5+r()*.8,d=(8+q*R)*sp;
     part(g,c.k,tgt+Math.cos(a)*d,y+Math.sin(a)*d*.8+(c.grav||0)*q*q*46,1.5+r()*1.5,col,col2,r()*6.28,(1-q)*.95);
    }
    if(c.ring&&!miss){
     const rr=10+q*R*.9;
     g.globalAlpha=(1-q)*.75;g.strokeStyle=col2;g.lineWidth=2+(1-q)*2;
     g.beginPath();g.ellipse(tgt,y+6,rr,rr*.45,0,0,7);g.stroke();
    }
    g.restore();
    if(c.pillar&&!miss)pillar(g,tgt,y,1-q,col2);
   }
   return ok;
  }catch(e){if(window.__ATK17_DEBUG)throw e;return orig.drawImpact(g,fx,T)}
 }

 API.drawAttack=drawAttackX;
 API.drawImpact=drawImpactX;
 API.attackProfiles=PROF;
 API.codeZone=i=>!!ZFX[zi(i)];                              /* [FX 1B] vùng nào đã vẽ bằng code */
 API.setFxStyle=v=>{STY=v==='sm'?'sm':'px'};                /* [FX 1B] 'px' pixel (mặc định) | 'sm' mịn (chỉ để so sánh) */
}
boot();
})();
