/* ===== 33-attack-fx.js — 17 kiểu đòn đánh riêng cho 17 vùng (bước 2) =====
   Chỉ thay phần HÌNH ẢNH của đòn đánh/va chạm: không đụng chỉ số, công thức hay diễn biến trận.
   Cách làm: bọc TTGCombatFX.drawAttack / drawImpact của 31-combat-fx.js. Sprite vẫn do 31 chọn khung,
   file này tô màu theo vùng, đổi quỹ đạo, phóng to, thêm hạt/vệt riêng cho từng vùng.
   Lỗi bất kỳ → tự quay về hiệu ứng gốc của 31, không làm đứng trận.
   [FX 1B/1C/2A] Vùng đã vẽ lại bằng CODE (không ảnh) nằm trong bảng ZFX bên dưới; vùng nào có trong ZFX thì bỏ qua ảnh. */
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
 /* Cú lao tới của thú/quái đánh gần do 06-mobs.js lo (lungeAt). Ở đây chỉ ĐỌC lại để biết thân đang ở đâu (không ghi gì ngược). Bản sao dự phòng khi chưa có TTGFX. */
 const lungeCopy=x=>{if(x<=0)return 0;if(x<.14)return -14*Math.sin(x/.14*Math.PI/2);if(x<.35){const q=(x-.14)/.21;return -14+114*q*q*(1.4-.4*q)}if(x<.42)return 100;if(x<.72){const q=(x-.42)/.3;return 100*(1-q*q*(3-2*q))}return 0};
 const lungeX=x=>window.TTGFX&&window.TTGFX.lungeAt?window.TTGFX.lungeAt(x):lungeCopy(x);
 /* 1 Sương Cốc (gần): sương là KHÍ — mây và hơi nước, không phải dải/tia. Thú LAO TỚI thật (06-mobs.js lo việc dịch chuyển). Hiệu ứng:
    mây tụ dưới chân khi lấy đà → vệt mây bám theo thân lúc lao → 2 nhát chém bằng mây bắt chéo tại mục tiêu → các cột hơi nước PHUN từ đất quanh mục tiêu
    (nhiều cục mây phồng cuộn lên, càng cao càng nở, đỉnh cuộn xoáy; hàng sau nhỏ, hàng chính, 2 cột lớn uốn ra hai bên, chừa giữa để thấy mục tiêu),
    sương lan sát đất, bong bóng, giọt nước rơi có trọng lực. Trúng lúc t=.665s (u=.35). Trúng: vòng mây toả ra mặt đất + hơi nước bốc lên, rồi tan dần. */
 const MS_SH='#58aaa2',MS_MD='#a6e5d9',MS_LT='#e8fffb',MS_LOBES=[[0,0,.62],[-.6,.14,.46],[.62,.1,.48],[-.22,-.5,.46],[.3,-.44,.42],[0,.3,.4]];
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 /* một cục mây/hơi nước: nhiều thùy tròn chồng nhau (phập phồng liên tục), tô 3 lớp bóng → thân → sáng + điểm sáng. sq<1 = dẹt (sương sát đất). pal = bảng màu {sh,md,lt} (mặc định xanh ngọc) */
 function puff(g,x,y,r,a,t,sd,sq,pal){
  if(a<=.02||r<1.5)return;
  const L=MS_LOBES,P=pal||{sh:MS_SH,md:MS_MD,lt:MS_LT},fl=hs(sd)<.5?-1:1;
  g.save();g.translate(x,y);if(sq&&sq!==1)g.scale(1,sq);g.globalAlpha=Math.min(1,a);
  const pass=(c,dx,dy,k,only)=>{g.fillStyle=c;g.beginPath();
   for(let i=0;i<L.length;i++){if(only&&i>=only)break;const l=L[i],w=1+.09*E.noise(sd*.013+i*2.3+t*1.7),rr=l[2]*r*k*w,cx=l[0]*fl*r*k+dx,cy=l[1]*r*k+dy;g.moveTo(cx+rr,cy);g.arc(cx,cy,rr,0,6.2832)}
   g.fill()};
  pass(P.sh,0,r*.1,1.02);pass(P.md,-r*.05,-r*.05,.9);pass(P.lt,-r*.16,-r*.2,.62,4);pass('#ffffff',-r*.3,-r*.36,.3,2);
  g.restore();
 }
 function bubble(g,x,y,r,a){
  if(a<=.02)return;
  g.save();g.globalAlpha=Math.min(1,a);g.strokeStyle=MS_LT;g.lineWidth=1.4;g.beginPath();g.arc(x,y,r,0,6.2832);g.stroke();
  g.fillStyle='#ffffff';g.fillRect(x-r*.5,y-r*.5,Math.max(1.5,r*.35),Math.max(1.5,r*.35));g.restore();
 }
 function mistRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,hk=cr?1.2:1,u=t/1.9,sd=s.seed,
   r=E.rng(sd),cap=l=>Math.max(.12,Math.min(l,END-t)),C1='#a3e1d4',C2='#4fd0bf',
   lk=miss?.6:1,ax=x=>pa?85+.84*lungeX(x)*lk:272-.78*lungeX(x)*lk,eo=E.eOut,ph=E.ph;
  /* dữ liệu các cột hơi nước (cố định theo hạt giống của từng đòn) */
  const back=[],cols=[],NB=miss?3:7,N=miss?4:9;
  for(let i=0;i<NB;i++){const k=i/(NB-1);let off=-98+k*196+r.range(-6,6);if(Math.abs(off)<26)off=off<0?-26:26;
   back.push({bx:tc+dir*off,H:(36+30*(1-Math.abs(k-.5)*1.2)+r.range(0,12))*(miss?.6:1),w:9+r.range(0,3),bend:(off<0?-dir:dir)*r.range(.3,.9),ph:r.range(0,6.28),tE:TH-.02+Math.abs(off)/200,tF:(miss?1:1.14)+r.range(0,.16),big:0,row:0})}
  for(let i=0;i<N;i++){const k=i/(N-1);let off=-66+k*118+r.range(-5,5);if(Math.abs(off)<22)off=off<0?-22:22;
   cols.push({bx:tc+dir*off,H:(46+46*(1-Math.abs(k-.5)*1.2)+r.range(0,12))*(miss?.65:hk),w:11+4*(1-Math.abs(k-.5)*2)+r.range(0,2),bend:(off<0?-dir:dir)*r.range(.25,.8),ph:r.range(0,6.28),tE:TH-.05+Math.abs(off)/220,tF:(miss?1:1.12)+r.range(0,.18),big:0,row:1})}
  if(!miss)[[-30,118,.65],[30,112,.85]].forEach(c=>cols.push({bx:tc+dir*c[0],H:c[1]*hk,w:19,bend:(c[0]<0?-dir:dir)*c[2],ph:r.range(0,6.28),tE:TH-.02+(c[0]>0?.05:0),tF:1.34,big:1,row:2}));
  /* lấy đà: mây tụ quanh thân người đánh */
  if(u<.2){
   const bx0=ax(u),c=ph(u,0,.14);
   E.glow(g,bx0,GY-6,34*eo(c),C2,.4*(1-ph(u,.1,.22)));
   for(let i=0;i<7;i++){const an=i/7*6.283+t*2,d=(1-c)*38+8;puff(g,bx0+Math.cos(an)*d,GY-6+Math.sin(an)*d*.3,5+4*c,(.4+.5*c)*(1-ph(u,.12,.2)),T,sd+i*7,.8)}
  }
  /* vệt mây bám theo thân lúc lao (theo đúng vị trí thân thật) */
  if(u>.1&&u<.58){
   const al=1-ph(u,.44,.58),n=9;
   for(let j=n-1;j>=0;j--){const uj=Math.max(0,u-j*.026),px=ax(uj)-dir*(6+j*1.5),py=GY-34+E.noise(j*1.3+t*4)*5-j*1.2;
    puff(g,px,py,(13+j*2.6)*(.9+.1*Math.sin(T*9+j)),al*(1-j/(n-1)*.7)*.95,T,sd+j*11,1)}
   E.glow(g,ax(u),GY-36,26,C2,.3*al);
   for(let m=E.rate(s,'rush',ph(u,.12,.42),26);m>0;m--)E.emit({x:ax(u)-dir*r.range(6,22),y:GY-r.range(6,52),vx:-dir*r.range(10,40),vy:r.range(-10,16),gy:200,life:cap(r.range(.35,.6)),s0:r.range(1.4,2.4),s1:.6,shape:'orb',c:C1,c2:'#ffffff',a:.9,add:true,tag:'fx'});
  }
  /* sương lan sát đất quanh mục tiêu */
  {const gA=ph(t,TH-.12,TH+.2)*(1-ph(t,1.2,1.64));
   if(gA>0)for(let i=0;i<9;i++){const k=i/8;puff(g,tc+dir*(-78+k*156)+Math.sin(t*1.6+i)*5,GY+1-(i%2)*3,24+6*Math.sin(i*2.1),gA*.85,T,sd+300+i*5,.42)}}
  /* một cột hơi nước: các cục mây trồi từ đất, trôi lên, càng cao càng nở, mờ dần ở ngọn; đỉnh cuộn xoáy */
  const col=(c,i)=>{
   const gw=eo(ph(t,c.tE,c.tE+.42)),out=1-ph(t,c.tF,c.tF+.4);if(gw<=.02||out<=0)return;
   if(E.once(s,'b'+i)){
    const rb=E.rng(sd+i*53);
    E.burst(rb,c.bx,GY,c.big?6:2,{speed:[30,70],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.6,2.6],life:[cap(.5),cap(.8)],gy:240,drag:.4,shape:'orb',c:C1,c2:'#ffffff',a:.9,add:true,tag:'fx',floor:GY+3,bounce:.12});
   }
   const n=c.big?12:c.row?9:7,hh=c.H*gw,sp=.42+.1*Math.sin(c.ph),it=[];
   for(let j=0;j<n;j++)it.push({j,p:((j/n)+t*sp)%1});
   it.sort((a,b)=>b.p-a.p);
   const bxT=c.bx+c.bend*c.H*.5*gw;
   puff(g,c.bx,GY,c.w*1.15,out*Math.min(1,gw*2),T,sd+i*31,.5);
   it.forEach(q=>{const p=q.p,rr=c.w*(.5+(c.big?1.55:1.1)*p)*(.85+.15*Math.sin(T*6+q.j+c.ph)),
    x=c.bx+c.bend*c.H*.5*p*p*gw+Math.sin(p*6+t*5+c.ph)*(2+5*p),y=GY-hh*p*(1.12-.12*p),
    al=out*Math.min(1,p*7)*(1-ph(p,.86,1))*(c.row===0?.8:1);
    puff(g,x,y,rr,al,T,sd+i*97+q.j*13,1)});
   if(gw>.7&&c.row>0){for(let q=0;q<5;q++){const an=T*3+q*1.26+c.ph;puff(g,bxT+Math.cos(an)*c.w*1.1,GY-hh+Math.sin(an)*c.w*.55,c.w*(1.1-q*.12),out*.8*gw,T,sd+i*41+q*5,1)}}
   for(let q=0;q<3;q++){const pb=(t*.9+hs(i*3+q))%1;bubble(g,c.bx+(hs(i+q*7)-.5)*c.w*2.4,GY-pb*30,2+hs(q+i)*1.6,out*Math.sin(pb*3.14)*.9)}
   E.wave(g,c.bx,GY+1,6+(c.big?26:15)*eo(ph(t,c.tE,c.tE+.45)),C1,.5*out*(1-ph(t,c.tE+.2,c.tE+.6)),1.2,{seed:sd+i,t:T});
   for(let m=E.rate(s,'d'+i,ph(t,c.tE+.12,c.tF+.2),c.big?22:8);m>0;m--)
    E.emit({x:bxT+r.range(-4,4),y:GY-hh+r.range(0,6),vx:c.bend*r.range(10,40)+r.range(-12,12),vy:-r.range(6,40),gy:300,drag:.3,life:cap(r.range(.5,.85)),s0:r.range(1.6,2.8),s1:.7,shape:'orb',c:C1,c2:'#ffffff',a:.95,add:true,tag:'fx',floor:GY+3,bounce:.12});
  };
  back.forEach((c,i)=>col(c,i+50));
  cols.forEach((c,i)=>col(c,i));
  /* 2 nhát chém bằng mây bắt chéo tại mục tiêu (nhát sau lệch nhịp), kết thúc ngay sau lúc trúng */
  const slash=(ts,tilt,flip,R,w)=>{
   const sw=eo(ph(t,ts,ts+.14)),out=1-ph(t,ts+.12,ts+.4);if(sw<.05||out<=0)return;
   const n=11,a0=-2.5,a1=.35,ca=Math.cos(tilt),sa=Math.sin(tilt),pts=[];
   for(let j=0;j<n;j++){const k=j/(n-1);if(k>sw)break;const an=a0+(a1-a0)*k,px=dir*Math.cos(an)*R*.85,py=flip*Math.sin(an)*R;pts.push([tc+px*ca-py*sa,GY-56+px*sa+py*ca,k])}
   pts.forEach((p,j)=>puff(g,p[0],p[1],w*(.35+.65*Math.sin(Math.min(1,p[2]*1.1)*Math.PI*.9+.1)),out*.9,T,sd+700+j*9+Math.round(ts*100),.85));
   if(pts.length>2){g.save();g.globalAlpha=out*.8;g.strokeStyle='#ffffff';g.lineWidth=2;g.lineCap='round';g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();g.restore()}
  };
  slash(TH-.08,-.5,1,miss?36:50,miss?10:15);
  slash(TH-.03,.5,-1,miss?30:44,miss?8:13);
  /* khi đòn trúng: vòng mây toả ra mặt đất + hơi nước bốc lên (không chớp trắng) */
  if(t>TH-.1){
   const hp=eo(ph(t,TH-.1,TH+.8)),fade=1-ph(t,TH+.2,TH+.85);
   if(!miss){
    E.glow(g,tx,GY-30,60,C2,.26*ph(t,TH-.1,TH)*(1-ph(t,TH+.1,TH+.6)));
    E.wave(g,tx,GY,10+104*eo(ph(t,TH-.1,TH+.8)),C1,(1-ph(t,TH+.15,TH+.8))*.7,2,{seed:sd+5,t:T});
    if(fade>0)for(let i=0;i<10;i++){const an=i/10*6.283+.3,d=hp*(70+hs(i)*40);puff(g,tc+Math.cos(an)*d,GY+Math.sin(an)*d*.26,10+hp*10,fade*.85,T,sd+900+i*3,.55)}
   }
   for(let i=0;i<5;i++){const p=ph(t,TH-.02+i*.04,TH+.9);puff(g,tc+(hs(i+40)-.5)*70,GY-14-p*(50+hs(i)*30),14+16*p,Math.sin(p*3.14)*(miss?.45:.8),T,sd+1000+i*7,1)}
  }
  if(t>=TH&&E.once(s,'hit')){
   const rb=E.rng(sd^0x2b7);
   E.burst(rb,tc,GY-8,miss?8:20,{speed:[20,100],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.6,3.4],life:[cap(.5),cap(.9)],gy:160,drag:.9,shape:'orb',c:C1,c2:'#ffffff',a:.9,add:true,tag:'fx'});
  }
  /* hơi nước nhỏ bốc lên quanh mục tiêu */
  {const env=ph(t,.45,.9)*(1-ph(t,1.4,1.68));
   if(env>0)for(let i=0;i<9;i++){const p=((t*.45)+hs(i*5))%1;puff(g,tc+(hs(i*3+1)-.5)*150,GY-p*60,4+8*p,env*Math.sin(p*3.14)*.7,T,sd+1200+i*5,.9)}}
  E.draw(g,'fx');
 }
 function mistFx(g,T,S){
  const u=clamp(S.u||0,0,1),s=E.seed('mist',u);
  E.setSpeed(window.BSPD||1);
  if(E.once(s,'init'))E.clear();                 /* đòn mới: bỏ hạt của đòn trước */
  layer(g,gg=>mistRun(gg,T,u*1.9,!!S.pa,!!S.miss,!!S.cr,s));
  return true;
 }

 /* ===== [FX 2A] Vùng 2-5: Vân Đảo, Phong Nguyên, Lôi Vực, Nguyệt Cung =====
    Cùng quy ước: trúng lúc t=.665s (u=.35), hết đòn t=1.68s. Vùng gần (3, 5) đọc cú lao tới của game qua lungeX; vùng xa (2, 4) không lao. */
 const wrap=(key,run,ex)=>(g,T,S)=>{
  const u=clamp(S.u||0,0,1),s=E.seed(key,u);
  E.setSpeed(window.BSPD||1);
  if(E.once(s,'init'))E.clear();
  layer(g,gg=>{run(gg,T,u*1.9,!!S.pa,!!S.miss,!!S.cr,s);if(ex)ex(gg,T,u*1.9,!!S.pa,!!S.miss,!!S.cr,s)});
  return true;
 };
 /* lưỡi liềm cong thon hai đầu: cung a0→a1 (rad), dày th, sx=-1 lật ngang, sy<0 lật dọc / dẹt, rot xoay thêm; viền ngoài sáng nhất */
 function crescent(g,cx,cy,R,a0,a1,th,sx,sy,al,pal,rot){
  if(al<=.02||R<2||Math.abs(a1-a0)<.05)return;
  const dl=Math.abs(a1-a0),am=(a0+a1)/2,cr=Math.max(0,2*R-2*th-R*Math.cos(dl/2)),ccw=a1<a0;
  g.save();g.translate(cx,cy);g.rotate(rot||0);g.scale(sx,sy);g.globalAlpha=Math.min(1,al);
  const gr=g.createRadialGradient(0,0,Math.max(1,R-th*2.4),0,0,R);gr.addColorStop(0,pal.md);gr.addColorStop(.55,pal.lt);gr.addColorStop(1,'#ffffff');
  g.fillStyle=gr;g.beginPath();g.moveTo(Math.cos(a0)*R,Math.sin(a0)*R);g.arc(0,0,R,a0,a1,ccw);
  g.quadraticCurveTo(Math.cos(am)*cr,Math.sin(am)*cr,Math.cos(a0)*R,Math.sin(a0)*R);g.closePath();g.fill();
  g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,al)*.5;g.strokeStyle=pal.md;g.lineWidth=2.4;g.beginPath();g.arc(0,0,R+1,a0,a1,ccw);g.stroke();
  g.restore();
 }
 /* tia sét: 3 lớp (quầng mềm, thân, lõi trắng) cộng sáng */
 function bolt(g,pts,w,a,c1,c2){
  if(a<=.02||pts.length<2)return;
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  [[w*3.2,c1,.22],[w*1.5,c1,.75],[w*.6,c2,1]].forEach(q=>{g.strokeStyle=E.rgba(q[1],q[2]*Math.min(1,a));g.lineWidth=q[0];g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()});
  g.restore();
 }
 /* 2 Vân Đảo (xa): mây tím tụ ở tay → xoáy thành cơn lốc mây thu hẹp quanh mục tiêu (đỉnh có mây bão dẹt), thỉnh thoảng lóe điện tím trong lốc.
    Trúng: lốc tan, mây tản thành vòng toả ra, mưa hạt sáng rơi. */
 const CPAL={sh:'#5a46a6',md:'#a287dc',lt:'#ecdfff'};
 function cloudRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.7:1)*(cr?1.15:1),sd=s.seed,r=E.rng(sd),
   cap=l=>Math.max(.12,Math.min(l,END-t)),eo=E.eOut,ph=E.ph,CA='#c9a8ff',CB='#fff0ff',H=118*sc;
  if(t<.42){
   const c=ph(t,0,.3),hx=x0+dir*26;
   E.glow(g,hx,150,26*eo(c),CA,.5*(1-ph(t,.28,.42)));
   for(let i=0;i<7;i++){const an=i/7*6.283+t*6,d=(1-c)*34+6;puff(g,hx+Math.cos(an)*d,150+Math.sin(an)*d*.7,4+4*c,(.3+.6*c)*(1-ph(t,.3,.42)),T,sd+i*7,1,CPAL)}
  }
  {const gA=ph(t,.25,.5)*(1-ph(t,TH+.3,1.2));
   if(gA>0)for(let i=0;i<8;i++){const k=i/7;puff(g,tc+(k-.5)*150+Math.sin(t*1.4+i)*5,GY+1-(i%2)*3,22+5*Math.sin(i*2.1),gA*.7,T,sd+300+i*5,.42,CPAL)}}
  const fa=ph(t,.22,.5)*(1-ph(t,TH+.02,TH+.38));
  if(fa>0){
   const grow=eo(ph(t,.22,.55)),shr=1-.5*ph(t,.4,TH),spin=t*(7+9*ph(t,.3,TH)),it=[];
   for(let i=0;i<30;i++){const h=i/29,th=spin*(1+.5*(1-h))+i*2.4,rho=(14+56*h)*shr*sc*(.9+.2*hs(i));
    it.push({x:tc+Math.cos(th)*rho,y:GY-8-h*H*grow+Math.sin(th)*rho*.22,d:Math.sin(th),r:(7+9*h)*sc*(.9+.2*hs(i+9)),i})}
   it.sort((a,b)=>a.d-b.d);
   it.forEach(p=>puff(g,p.x,p.y,p.r,fa*(.7+.3*p.d),T,sd+p.i*17,1,CPAL));
   for(let i=0;i<5;i++)puff(g,tc+(i-2)*24*sc+Math.sin(t*2+i)*3,GY-H*grow-6+(i%2)*4,(20+5*hs(i+3))*sc,fa,T,sd+500+i*9,.55,CPAL);
  }
  [.46,.57,TH-.03].forEach((bt,i)=>{
   const d=t-bt;if(d<0||d>.1)return;
   const rb=E.rng(sd+i*91+Math.floor(d/.035)),sx=tc+rb.range(-30,30)*sc,pts=E.jag(rb,sx,GY-H*.9,tc+rb.range(-14,14),GY-24,9,12);
   bolt(g,pts,2.2,1-d/.1,CA,CB);E.glow(g,tc,GY-60,50*sc,CA,.3*(1-d/.1));
  });
  if(t>TH-.05){
   const p=eo(ph(t,TH,TH+.85)),fade=1-ph(t,TH+.25,TH+.9);
   if(!miss){
    E.glow(g,tc,GY-50,60,CA,.25*ph(t,TH-.05,TH)*(1-ph(t,TH+.1,TH+.6)));
    E.wave(g,tc,GY,10+100*p,CA,(1-ph(t,TH+.15,TH+.8))*.7,2,{seed:sd+5,t:T});
    if(fade>0)for(let i=0;i<11;i++){const an=i/11*6.283+.2,d=p*(80+hs(i)*35)*sc;puff(g,tc+Math.cos(an)*d,GY-48+Math.sin(an)*d*.28-p*14,12+10*p,fade*.85,T,sd+900+i*3,.8,CPAL)}
   }
   for(let n=E.rate(s,'rain',ph(t,TH,TH+.75),miss?25:70);n>0;n--)E.emit({x:tc+r.range(-70,70),y:GY-r.range(90,125),vx:r.range(-6,6),vy:r.range(40,90),gy:200,life:cap(r.range(.45,.75)),s0:r.range(1.6,2.8),s1:.8,shape:'orb',c:CA,c2:'#ffffff',a:.95,add:true,tag:'fx',floor:GY+3,bounce:.15});
  }
  E.draw(g,'fx');
 }
 /* 3 Phong Nguyên (gần): thú lao tới kéo theo vệt gió + lá; nhiều lưỡi liềm gió quét từ các hướng quanh mục tiêu, cỏ bị cuốn rạp.
    Trúng: lốc nhỏ xoáy tại chỗ (vòng gió + lá xoay), lá bay tản. */
 const WPAL={sh:'#2f9a73',md:'#82f0bb',lt:'#e8fff2'};
 function windRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,u=t/1.9,sd=s.seed,r=E.rng(sd),
   cap=l=>Math.max(.12,Math.min(l,END-t)),eo=E.eOut,ph=E.ph,lk=miss?.6:1,ax=x=>pa?85+.84*lungeX(x)*lk:272-.78*lungeX(x)*lk,sc=(miss?.75:1)*(cr?1.15:1);
  {const env=ph(t,TH-.35,TH-.1)*(1-ph(t,TH+.5,1.3));
   if(env>0)for(let i=0;i<18;i++){
    const gx=tc+(hs(i)-.5)*160,hg=9+10*hs(i+1),bd=(Math.sin(t*10+i)*3+dir*9)*env;
    g.save();g.globalAlpha=env;g.fillStyle=i%2?'#3fbf80':'#82f0bb';g.beginPath();g.moveTo(gx-1.8,GY+2);g.quadraticCurveTo(gx+bd*.3,GY-hg*.6,gx+bd,GY-hg);g.quadraticCurveTo(gx+bd*.4+1.5,GY-hg*.5,gx+1.8,GY+2);g.fill();g.restore();
   }}
  if(u>.08&&u<.56){
   const al=1-ph(u,.42,.56);
   for(let k=0;k<5;k++){const yy=GY-16-k*13,xe=ax(u)-dir*4,xs=ax(Math.max(0,u-.13-k*.012))-dir*(16+k*4);
    g.save();g.globalAlpha=al*(.9-k*.1);g.lineCap='round';g.strokeStyle=k%2?WPAL.md:WPAL.lt;g.lineWidth=2.4-k*.2;g.beginPath();g.moveTo(xs,yy+4);g.quadraticCurveTo((xs+xe)/2,yy-6*Math.sin(T*10+k),xe,yy);g.stroke();g.restore()}
   for(let m=E.rate(s,'lf',ph(u,.1,.5),26);m>0;m--)E.emit({x:ax(u)-dir*r.range(4,24),y:GY-r.range(6,60),vx:-dir*r.range(10,60),vy:r.range(-30,10),gy:30,drag:.6,life:cap(r.range(.4,.7)),s0:r.range(3,5),shape:'leaf',c:'#6fdc8f',c2:'#e8fff2',a:.95,tag:'fx',rot:r()*6,vr:r.range(-8,8),fl:r.range(8,14)});
  }
  const A0=[-2.7,-.5,2.4,.8,-1.4],SG=[1,-1,1,-1,1],RR=[52,60,46,56,40],SQ=[.9,.7,.8,.65,.9],TL=[-.2,.3,.1,-.35,.25];
  E.glow(g,tc,GY-54,60*sc,WPAL.md,.18*ph(t,TH-.3,TH-.1)*(1-ph(t,TH,TH+.3)));
  for(let i=0;i<5;i++){
   const ts=TH-.27+i*.052,hd=eo(ph(t,ts,ts+.16)),tl=ph(t,ts+.07,ts+.3),al=1-ph(t,ts+.2,ts+.4);
   if(hd<.04||al<=0||hd<=tl+.02)continue;
   const sw=SG[i]*2.3*(miss?.8:1),a0=A0[i]+sw*tl,a1=A0[i]+sw*hd,R=RR[i]*sc;
   crescent(g,tc,GY-54+(i%2?6:-4),R,a0,a1,9*sc,dir,SQ[i],al,WPAL,TL[i]*dir);
  }
  if(t>TH-.03){
   const p=ph(t,TH,TH+.95),fade=1-ph(p,.7,1);
   for(let k=0;k<3;k++){g.save();g.globalAlpha=fade*(.8-k*.15);g.strokeStyle=k%2?WPAL.md:WPAL.lt;g.lineWidth=2.2;g.beginPath();g.ellipse(tc,GY-16-k*22-p*10,(30-k*7)*(.55+.45*p)*sc,(8-k*1.5)*(.55+.45*p),0,t*8+k,t*8+k+4.4);g.stroke();g.restore()}
   for(let i=0;i<16;i++){
    const th=hs(i)*6.28+(t-TH)*(7+hs(i+9)*4),rho=(10+p*80)*(.45+hs(i+3))*sc,x=tc+Math.cos(th)*rho,y=GY-18-p*74*(hs(i+5)+.25)+Math.sin(th)*rho*.25;
    g.save();g.globalAlpha=fade;g.translate(x,y);g.rotate(th*1.7);g.fillStyle=i%3?'#4fcf86':'#9ff5c8';g.beginPath();g.ellipse(0,0,4.5,2,0,0,6.2832);g.fill();g.fillStyle='#e8fff2';g.fillRect(-3,-.5,6,1);g.restore();
   }
   if(!miss)for(let i=0;i<6;i++){const an=i/6*6.283,d=eo(p)*70*sc;puff(g,tc+Math.cos(an)*d,GY+Math.sin(an)*d*.25,8+6*p,fade*.6,T,sd+700+i*5,.6,WPAL)}
  }
  E.draw(g,'fx');
 }
 /* 4 Lôi Vực (xa): mây giông tụ trên đầu mục tiêu, tia dẫn bước xuống dần, rồi sét giáng rẽ nhánh giật nhiều nhịp. Tia điện chạy trên mặt đất.
    Trúng: điện giật lan quanh quái, tàn lửa bắn, mặt đất cháy xém có khói. */
 const TPAL={sh:'#2c2650',md:'#5a5090',lt:'#9a90d8'},SMK={sh:'#4a4a58',md:'#8a8a9a',lt:'#c8c8d4'};
 function thunderRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,hk=(cr?1.25:1)*(miss?.85:1),sd=s.seed,
   cap=l=>Math.max(.12,Math.min(l,END-t)),eo=E.eOut,ph=E.ph,CA='#ffe53a',CB='#fff8b8',
   SK=[[.46,-30,.7],[.565,28,.85],[TH,0,1.25],[.775,-12,1]];   /* 4 đợt sét độ kiếp: [thời điểm, lệch ngang, uy lực]; đợt 3 trúng đúng lúc TH */
  /* MÂY GIÔNG TRƯỚC: tụ 0→.3s, giữ suốt các đợt sét, rồi tan */
  const cA=ph(t,0,.3)*(1-ph(t,1.15,1.5));
  let flash=0;SK.forEach(k=>{const d=t-k[0];if(d>-.07&&d<.2)flash=Math.max(flash,(d<0?(d+.07)/.07*.5:1-d/.2)*k[2])});
  if(cA>0){
   const gr=ph(t,0,.3);
   for(let row=0;row<2;row++)for(let i=0;i<9;i++){const k=i/8,pal=row?TPAL:{sh:'#1c1838',md:'#3a3270',lt:'#7a70c0'};
    puff(g,clamp(tc,100,262)+(k-.5)*(row?150:178)+Math.sin(t*1.5+i+row)*5,(row?30:20)+(i%2)*6,(row?20:26)*(.5+.5*gr)+5*Math.sin(i*1.7+1+row),cA*.95,T,sd+i*13+row*97,.6,pal)}
   E.glow(g,clamp(tc,100,262),32,80+30*flash,'#8a7cff',Math.min(.7,.14+.5*flash)*cA);
   const fq=Math.floor(t/.07),rf=E.rng(sd+fq*7);
   if(t>.2&&t<1.2&&rf()<.5){const x=tc+rf.range(-70,70);bolt(g,E.jag(rf,x,26,x+rf.range(-20,20),48,4,6),1,.5*cA,'#a898ff',CB)}   /* chớp ngầm trong mây */
  }
  SK.forEach((k,i)=>{
   const d=t-k[0],pw=k[2]*hk,gx=tc+k[1]*(miss?.6:1);
   if(d>-.07&&d<0){const rl=E.rng(sd+i*17),lead=E.jag(rl,gx+rl.range(-8,8),38,gx,GY-4,14,14);bolt(g,lead.slice(0,Math.max(2,Math.ceil((d+.07)/.07*lead.length))),1,.6,CA,CB)}   /* tia dẫn */
   if(d<0||d>.34)return;
   const wg=Math.floor(d/.04),rm=E.rng(sd+i*131+wg*29),env=(1-ph(d,.08,.3))*(.6+.4*Math.abs(Math.sin(d*55))),
    sx=gx+rm.range(-12,12),pts=E.jag(rm,sx,36,gx,GY-2,16,18*Math.min(1.3,pw)),w=(3.4+(cr?1.2:0))*pw;
   g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';g.strokeStyle=E.rgba(CA,.16*env);g.lineWidth=w*6;strokePts(g,pts);g.restore();
   bolt(g,pts,w,env,CA,CB);
   [3,6,9,12].forEach((q,n)=>{const p=pts[q],sg=n%2?1:-1,en=[p[0]+sg*rm.range(16,40)*pw,p[1]+rm.range(14,32)];bolt(g,E.jag(rm,p[0],p[1],en[0],en[1],4,6),1.5*pw,env*.85,CA,CB)});
   E.glow(g,gx,GY-6,(36+16*pw),CA,.4*env);
   E.wave(g,gx,GY,6+60*pw*eo(ph(d,0,.4)),CA,(1-ph(d,.1,.4))*.7,1.5,{seed:sd+i*5,t:T,sq:.28});
   const ga=eo(ph(d,0,.2)),gf=1-ph(d,.15,.45);
   if(gf>0)for(let j=0;j<4;j++){const sg=j%2?1:-1,L=(24+40*pw)*ga,rg=E.rng(sd+i*37+j+Math.floor(d/.05));bolt(g,E.jag(rg,gx,GY+2+(j>>1)*2,gx+sg*L*(1-.3*(j>>1)),GY+(j>>1)*3,6,4),1.4,gf*.8,CA,CB)}
   if(E.once(s,'k'+i))E.burst(E.rng(sd^(0x3c1+i)),gx,GY-6,Math.round((miss?6:10)+8*pw),{speed:[40,140],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,2.6],life:[cap(.4),cap(.8)],gy:260,drag:.5,shape:'spark',c:CA,c2:'#ffffff',a:1,add:true,tag:'fx',vr:[-6,6]});
  });
  {const sa=ph(t,TH,TH+.1)*(1-ph(t,1.25,END))*(miss?.5:1);
   if(sa>0)E.blob(g,tc,GY+3,34,7,'#1c1424',.6*sa,T,sd,{add:false,core:'#0c0812',wob:.25});}
  if(!miss)for(let i=0;i<5;i++){const p=ph(t,TH+i*.04,TH+.95);puff(g,tc+(hs(i+60)-.5)*40,GY-8-p*60,6+9*p,Math.sin(p*3.14)*.6,T,sd+1100+i*3,1,SMK)}
  if(!miss&&t>TH-.05){
   E.glow(g,tc,GY-24,46,CA,.3*ph(t,TH-.05,TH)*(1-ph(t,TH,TH+.3)));
   E.wave(g,tc,GY,8+70*eo(ph(t,TH-.02,TH+.5)),CA,(1-ph(t,TH+.1,TH+.5))*.8,1.6,{seed:sd+5,t:T,sq:.28});
  }
  E.draw(g,'fx');
 }
 /* 5 Nguyệt Cung (gần): thú lao tới để lại bóng trăng khuyết nhỏ; 2 vệt chém trăng khuyết cong sáng quét ra rồi mờ dần như ánh trăng.
    Trúng: vầng trăng mờ hiện sau mục tiêu rồi tan, bụi sao lấp lánh rơi. */
 const MPAL={sh:'#4a58b8',md:'#a8b8ff',lt:'#e8edff'};
 function moonRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,u=t/1.9,sd=s.seed,r=E.rng(sd),
   cap=l=>Math.max(.12,Math.min(l,END-t)),eo=E.eOut,ph=E.ph,lk=miss?.6:1,ax=x=>pa?85+.84*lungeX(x)*lk:272-.78*lungeX(x)*lk,sc=(miss?.75:1)*(cr?1.15:1),CA='#a8b8ff';
  if(u<.2){
   const bx0=ax(u),c=ph(u,0,.14);
   E.glow(g,bx0,GY-40,30*eo(c),CA,.4*(1-ph(u,.1,.22)));
   crescent(g,bx0,GY-40,14*eo(c),-2.4,.4,4,dir,1,(.3+.6*c)*(1-ph(u,.12,.2)),MPAL,0);
  }
  if(u>.1&&u<.58){
   const al=1-ph(u,.44,.58);
   for(let j=5;j>=0;j--){const uj=Math.max(0,u-j*.03);crescent(g,ax(uj)-dir*(6+j*3),GY-38,13+j*1.5,-2.2,1.0,4,-dir,1,al*(.85-j*.13),MPAL,0)}
   for(let m=E.rate(s,'sp',ph(u,.1,.5),24);m>0;m--)E.emit({x:ax(u)-dir*r.range(4,26),y:GY-r.range(8,64),vx:-dir*r.range(6,30),vy:r.range(-12,12),gy:20,life:cap(r.range(.4,.7)),s0:r.range(1.4,2.6),s1:.5,shape:'spark',c:CA,c2:'#ffffff',a:.95,add:true,tag:'fx',rot:r()*6,vr:r.range(-4,4)});
  }
  const S=[[TH-.22,-2.7,.4,1,60,15,-.3],[TH-.1,2.8,-.3,-1,48,12,.35]];
  S.forEach(q=>{
   const ts=q[0],hd=eo(ph(t,ts,ts+.15)),tl=.75*ph(t,ts+.1,ts+.8),al=1-.6*ph(t,ts+.15,ts+.65)-.4*ph(t,ts+.65,TH+.85);
   if(hd<.04||al<=0||hd<=tl+.02)return;
   const a0=q[1]+(q[2]-q[1])*tl,a1=q[1]+(q[2]-q[1])*hd,R=q[4]*sc;
   crescent(g,tc,GY-54,R,a0,a1,q[5]*sc,dir,q[3]*.85,al,MPAL,q[6]*dir);
   E.glow(g,tc,GY-54,R*.9,CA,.12*al);
  });
  if(t>TH-.02){
   const ma=ph(t,TH,TH+.12)*(1-ph(t,TH+.4,TH+.95))*(miss?.4:.85);
   if(ma>0){E.glow(g,tc,GY-82,52,CA,.25*ma);crescent(g,tc,GY-84,32*sc,-1.2,1.2,16*sc,1,1,ma,MPAL,2.6)}
   for(let i=0;i<20;i++){
    const st=TH+hs(i)*.2,p=ph(t,st,st+.75);if(p<=0||p>=1)continue;
    const x=tc+(hs(i+20)-.5)*130+Math.sin(p*6+i)*5,y=GY-135+p*125*(.7+.3*hs(i+40)),a=Math.sin(p*3.14)*(.6+.4*Math.sin(t*20+i)),sz=1.6+hs(i+60)*1.6;
    g.save();g.globalAlpha=Math.max(0,a);g.fillStyle=i%2?'#ffffff':'#c8d4ff';g.fillRect(x-sz,y-.6,sz*2,1.2);g.fillRect(x-.6,y-sz,1.2,sz*2);g.restore();
   }
   if(!miss)E.wave(g,tc,GY,8+80*eo(ph(t,TH,TH+.7)),CA,(1-ph(t,TH+.15,TH+.7))*.7,1.6,{seed:sd+5,t:T});
  }
  E.draw(g,'fx');
 }
 /* ===== [FX 2A sửa] LỚP CHI TIẾT BỔ SUNG cho vùng 2-5 (vẽ SAU lớp chính, hạt gắn nhãn 'fx2') =====
    Mỗi vùng thêm: tụ lực rõ hơn, nhiều lớp chuyển động lệch nhịp, hiệu ứng "độc quyền" của nguyên tố, và dư âm sau khi trúng. */
 const DUSTP={sh:'#8c7a64',md:'#cdbb9f',lt:'#f4ead6'};
 const orb=(cx,cy,rx,ry,an)=>[cx+Math.cos(an)*rx,cy+Math.sin(an)*ry];
 const strokePts=(g,pts)=>{g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()};

 /* 2 Vân Đảo: khí tím xoắn quanh tay + pháp trận → 4 dải gió xoáy quấn quanh cơn lốc, mắt bão phát sáng, mưa vệt trong lốc, điện tím giật trong mây
    → trúng: vòng sóng, 6 tia điện bò ra đất, chuỗi cầu sáng xoáy ra ngoài, tàn sáng bay lên */
 function cloudX(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.7:1)*(cr?1.15:1),sd=s.seed,r=E.rng(sd^0x2c1),
   cap=l=>Math.max(.12,Math.min(l,END-t)),eo=E.eOut,ph=E.ph,CA='#c9a8ff',CB='#fff0ff',CV='#8f6af0',H=118*sc;
  const ca=ph(t,0,.2)*(1-ph(t,.38,.55));
  if(ca>0){
   for(let k=0;k<3;k++){const pts=[];for(let i=0;i<14;i++){const q=i/13,an=t*9+k*2.09+q*5.2,rr=(32-q*24)*(1-.35*ph(t,.2,.4));pts.push([x0+dir*26+Math.cos(an)*rr,150+Math.sin(an)*rr*.6-q*6])}
    E.ribbon(g,pts,q=>1+4*q,k%2?CA:CV,.8*ca,{core:CB})}
   const rr=14+30*eo(ph(t,0,.3));
   E.wave(g,x0,GY,rr,CA,ca*.85,1.4,{seed:sd,t:T,sq:.3});E.wave(g,x0,GY,rr*.55,CV,ca*.7,1.2,{seed:sd+9,t:T,sq:.3});
   for(let i=0;i<6;i++){const p=orb(x0,GY,rr,rr*.3,T*2.6+i*1.047);E.glow(g,p[0],p[1],5,CA,ca*.9)}
  }
  const fa=ph(t,.22,.5)*(1-ph(t,TH+.02,TH+.38));
  if(fa>0){
   const grow=eo(ph(t,.22,.55)),shr=1-.5*ph(t,.4,TH),sp=t*(8+10*ph(t,.3,TH));
   for(let k=0;k<4;k++){const pts=[];for(let i=0;i<20;i++){const h=i/19,th=sp*(1+.5*(1-h))+k*1.571+h*7,rho=(12+60*h)*shr*sc;pts.push([tc+Math.cos(th)*rho,GY-8-h*H*grow+Math.sin(th)*rho*.22])}
    E.ribbon(g,pts,q=>2+3*q,k%2?CA:CV,.6*fa,{core:'#ffffff'})}
   E.glow(g,tc,GY-H*grow,44*sc,CV,.32*fa);
   E.wave(g,tc,GY,(40+20*Math.sin(T*5))*shr*sc,CV,.55*fa,1.6,{seed:sd+3,t:T,sq:.28});
   for(let n=E.rate(s,'ir',ph(t,.3,TH),40);n>0;n--){const an=r()*6.283,rho=r.range(20,60)*sc;E.emit({x:tc+Math.cos(an)*rho,y:GY-r.range(10,H*grow),vx:-Math.sin(an)*60,vy:r.range(-20,10),life:cap(r.range(.25,.45)),s0:r.range(1.6,2.6),s1:.5,shape:'streak',c:CV,c2:CB,a:.9,add:true,tag:'fx2',drag:1})}
  }
  [.4,.5,.58,.64].forEach((bt,i)=>{const d=t-bt;if(d<0||d>.09)return;const rb=E.rng(sd+i*53+Math.floor(d/.03)),px=tc+rb.range(-36,36)*sc,py=GY-H*(.45+.4*rb());
   bolt(g,E.jag(rb,px,py,px+rb.range(-34,34),py+rb.range(14,40),6,7),1.4,1-d/.09,CV,CB)});
  if(t>TH-.03){
   const p=ph(t,TH,TH+1),fo=1-ph(t,TH+.3,TH+1);
   if(!miss){
    E.wave(g,tc,GY,6+120*eo(ph(t,TH+.05,TH+.9)),CV,(1-ph(t,TH+.2,TH+.9))*.55,1.4,{seed:sd+8,t:T,sq:.28});
    for(let k=0;k<6;k++){const an=k/6*6.283+.3,L=(30+60*eo(p))*sc,pp=E.jag(E.rng(sd+k*7+Math.floor(t/.06)),tc,GY+1,tc+Math.cos(an)*L,GY+Math.sin(an)*L*.28,6,5);bolt(g,pp,1.2,fo*.8,CA,CB)}
    for(let i=0;i<10;i++){const an=i/10*6.283+(t-TH)*5,rho=(8+70*eo(p))*sc;E.glow(g,tc+Math.cos(an)*rho,GY-24+Math.sin(an)*rho*.28-p*18,4+3*hs(i),CA,fo*.9)}
   }
   if(E.once(s,'cx'))E.burst(E.rng(sd^0x99),tc,GY-40,miss?8:20,{speed:[30,110],ang:[-Math.PI,0],size:[1.4,2.4],life:[cap(.5),cap(.9)],gy:120,drag:.8,shape:'spark',c:CV,c2:CB,a:1,add:true,tag:'fx2'});
  }
  E.draw(g,'fx2');
 }

 /* 3 Phong Nguyên: vòng gió + bụi cỏ phía sau lúc lao → 7 dải gió xoắn VÀO tâm từ mọi hướng → trúng: 3 dải lốc xoáy dựng đứng, 2 vòng gió dưới đất, lá cuốn xoáy bay tản */
 function windX(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,u=t/1.9,sd=s.seed,r=E.rng(sd^0x3d7),
   cap=l=>Math.max(.12,Math.min(l,END-t)),eo=E.eOut,ph=E.ph,lk=miss?.6:1,ax=x=>pa?85+.84*lungeX(x)*lk:272-.78*lungeX(x)*lk,sc=(miss?.75:1)*(cr?1.15:1),
   WG='#82f0bb',WL='#e8fff2';
  if(u>.04&&u<.5){
   const al=1-ph(u,.38,.5);
   for(let j=0;j<6;j++){const uj=Math.max(0,u-j*.028),x=ax(uj)-dir*(8+j*5);E.wave(g,x,GY-34,8+j*3.5,WG,al*(.7-j*.1),1.2,{seed:sd+j,t:T,sq:2.1,wob:.1})}
   for(let n=E.rate(s,'dd',ph(u,.08,.36),30);n>0;n--)E.emit({x:ax(u)-dir*r.range(6,20),y:GY-r.range(0,4),vx:-dir*r.range(10,50),vy:r.range(-24,-4),gy:20,drag:1.4,life:cap(r.range(.3,.55)),s0:r.range(3,6),s1:2.2,shape:'mist',c:'#c9e8c0',a:.7,tag:'fx2'});
  }
  for(let k=0;k<7;k++){
   const ts=TH-.38+k*.04,hd=eo(ph(t,ts,ts+.3)),tl=ph(t,ts+.1,ts+.38),al=1-ph(t,ts+.3,ts+.46);
   if(hd<.05||al<=0||hd<=tl)continue;
   const an=(k/7)*6.283+.4,R0=110+hs(k)*40,pts=[];
   for(let i=0;i<14;i++){const q=tl+(hd-tl)*i/13,rr=R0*(1-q)+12,aa=an+q*3.4*(k%2?1:-1);pts.push([tc+Math.cos(aa)*rr,GY-48+Math.sin(aa)*rr*.38+(1-q)*(hs(k+3)-.5)*30])}
   E.ribbon(g,pts,q=>1.4+3*q,k%2?WG:WL,.8*al,{core:'#c8ffe0'});
  }
  if(t>TH-.03){
   const p=ph(t,TH,TH+1),fo=1-ph(p,.65,1);
   if(!miss){
    for(let k=0;k<3;k++){const pts=[];for(let i=0;i<18;i++){const h=i/17,th=(t-TH)*11+k*2.09+h*6,rho=(8+34*h)*sc*(.6+.4*eo(p));pts.push([tc+Math.cos(th)*rho,GY-4-h*86*sc*eo(ph(p,0,.5))+Math.sin(th)*rho*.25])}
     E.ribbon(g,pts,q=>2+3.6*q,k%2?WG:WL,.8*fo,{core:'#c8ffe0'})}
    E.wave(g,tc,GY,10+90*eo(p),WG,fo*.6,1.5,{seed:sd+6,t:T,sq:.26});E.wave(g,tc,GY,6+55*eo(p),WL,fo*.5,1.2,{seed:sd+7,t:T,sq:.26});
   }
   for(let n=E.rate(s,'lv',ph(t,TH,TH+.6),miss?20:50);n>0;n--){const an=r()*6.283,rho=r.range(10,50)*sc;
    E.emit({x:tc+Math.cos(an)*rho,y:GY-r.range(0,20),vx:-Math.sin(an)*r.range(60,110),vy:r.range(-60,-20),gy:-4,drag:.5,life:cap(r.range(.5,.9)),s0:r.range(3,5),shape:'leaf',c:r()<.5?'#4fcf86':'#9ff5c8',c2:WL,a:.95,tag:'fx2',rot:r()*6,vr:r.range(-9,9),fl:r.range(8,14)})}
  }
  E.draw(g,'fx2');
 }

 /* 4 Lôi Vực: tia nhỏ bò từ đất hút điện → sét chính + 3 sét phụ giáng lệch nhịp → mục tiêu BỊ ĐIỆN GIẬT (vòng tia điện quanh thân, tia bò dọc thân)
    → lưới nứt đất cháy cam rồi nguội, vòng sốc đôi, tàn lửa bay lên */
 function thunderX(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,hk=cr?1.25:1,sd=s.seed,ph=E.ph,eo=E.eOut,ST=.45,
   CA='#ffe53a',CB='#fff8b8',CO='#ff9a30',cap=l=>Math.max(.12,Math.min(l,END-t));
  {const a=ph(t,.2,ST)*(1-ph(t,ST,ST+.06));
   if(a>0){const stp=Math.floor(t/.055);
    for(let i=0;i<5;i++){const rb=E.rng(sd+stp*17+i*5),x=tc+rb.range(-44,44);bolt(g,E.jag(rb,x,GY+1,x+rb.range(-8,8),GY-rb.range(14,34)*a,4,4),.9,a*.9,CA,CB)}
    E.glow(g,tc,GY-4,30+20*a,CA,.18*a)}}
  if(t>TH-.02){
   const stp=Math.floor(t/.05);
   if(!miss&&t<TH+.55){
    const fo=1-ph(t,TH+.3,TH+.55);
    for(let i=0;i<5;i++){const rb=E.rng(sd+stp*29+i*13),a0=rb()*6.283,a1=a0+rb.range(1.2,2.6),R=26*hk;
     bolt(g,E.jag(rb,tc+Math.cos(a0)*R*.7,150+Math.sin(a0)*R*1.5,tc+Math.cos(a1)*R*.7,150+Math.sin(a1)*R*1.5,5,9),1.1,fo*.85,CA,CB)}
    for(let i=0;i<3;i++){const rb=E.rng(sd+stp*41+i),x=tc+(i-1)*16;bolt(g,E.jag(rb,x,GY-2,x+rb.range(-10,10),GY-60-rb.range(0,40),7,7),1,fo*.8,CA,CB)}
    E.glow(g,tc,150,40,CA,.14*fo);
   }
   const gp=ph(t,TH-.02,TH+.25),keep=1-ph(t,1.2,END),heat=1-ph(t,TH+.1,TH+.9);
   g.save();g.lineCap='round';g.lineJoin='round';
   for(let i=0;i<7;i++){
    const rb=E.rng(sd+900+i),an=(i/7)*6.283+rb.range(-.3,.3),L=(30+rb.range(0,34))*eo(gp)*(miss?.6:1),pts=E.jag(rb,tc,GY+3,tc+Math.cos(an)*L,GY+3+Math.sin(an)*L*.3,6,3);
    g.globalCompositeOperation='source-over';g.strokeStyle=E.rgba('#1c1424',.8*keep);g.lineWidth=2.4;strokePts(g,pts);
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(CO,.85*heat*keep);g.lineWidth=1.1;strokePts(g,pts);
   }
   g.restore();
   if(!miss){E.wave(g,tc,GY,6+95*eo(ph(t,TH+.04,TH+.6)),CO,(1-ph(t,TH+.2,TH+.6))*.6,1.5,{seed:sd+11,t:T,sq:.28})}
   if(E.once(s,'tx'))E.burst(E.rng(sd^0x5a5),tc,GY-4,miss?6:16,{speed:[14,60],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.3,2.4],life:[cap(.7),cap(1.1)],gy:-18,drag:.6,shape:'orb',c:CO,c2:CB,a:.95,add:true,tag:'fx2'});
  }
  E.draw(g,'fx2');
 }

 /* 5 Nguyệt Cung: trăng tròn lớn hiện trên đầu mục tiêu (có hố, vành sao quay) + pháp trận trăng khuyết dưới đất → sao băng ánh trăng rơi chéo → chùm sáng rọi xuống
    → trúng: trăng khuyết nhỏ trôi lên, bụi sao, vòng sóng; trăng tan chậm */
 function moonX(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,sd=s.seed,r=E.rng(sd^0x5e3),
   cap=l=>Math.max(.12,Math.min(l,END-t)),eo=E.eOut,ph=E.ph,sc=(miss?.75:1)*(cr?1.15:1),CA='#a8b8ff',CW='#f4f6ff';
  {const a=ph(t,TH-.45,TH-.1)*(1-ph(t,TH+.35,TH+1.0))*(miss?.5:1);
   if(a>0){
    const my=GY-128,R=30*sc*(.85+.15*eo(ph(t,TH-.45,TH)));
    E.glow(g,tc,my,R*2.1,CA,.3*a);
    g.save();g.globalAlpha=a*.9;const gr=g.createRadialGradient(tc-R*.3,my-R*.3,2,tc,my,R);gr.addColorStop(0,'#ffffff');gr.addColorStop(.6,'#dfe6ff');gr.addColorStop(1,'#8fa0ee');
    g.fillStyle=gr;g.beginPath();g.arc(tc,my,R,0,6.2832);g.fill();
    g.fillStyle='rgba(120,135,215,.45)';[[-.35,.2,.22],[.3,-.25,.16],[.25,.4,.12]].forEach(c=>{g.beginPath();g.arc(tc+c[0]*R,my+c[1]*R,c[2]*R,0,6.2832);g.fill()});g.restore();
    for(let i=0;i<8;i++){const p=orb(tc,my,R*1.5,R*1.5,T*1.2+i*.785);E.glow(g,p[0],p[1],3.5,CW,a*.9)}
   }}
  {const a=ph(t,TH-.35,TH-.1)*(1-ph(t,TH+.5,1.2));
   if(a>0){const R=34+8*Math.sin(T*3);
    E.wave(g,tc,GY,R,CA,a*.8,1.4,{seed:sd,t:T,sq:.3});E.wave(g,tc,GY,R*.62,CW,a*.6,1,{seed:sd+2,t:T,sq:.3});
    for(let i=0;i<3;i++){const an=T*1.5+i*2.094,p=orb(tc,GY,R,R*.3,an);crescent(g,p[0],p[1],6,-2.2,.9,2.4,1,1,a*.9,MPAL,an)}}}
  for(let k=0;k<5;k++){
   const ts=TH-.3+k*.07,p=ph(t,ts,ts+.38);if(p<=0||p>=1)continue;
   const sx=tc-70+k*34+hs(k+11)*20,sy=GY-190,ex=sx+50,ey=GY-8,hx=sx+(ex-sx)*p,hy=sy+(ey-sy)*p,tl=Math.max(0,p-.28),tx0=sx+(ex-sx)*tl,ty0=sy+(ey-sy)*tl;
   E.ribbon(g,[[tx0,ty0],[(hx+tx0)/2,(hy+ty0)/2],[hx,hy]],q=>1+3*q,CA,.85*(1-ph(p,.8,1)),{core:'#ffffff'});E.glow(g,hx,hy,6,CW,.8*(1-ph(p,.85,1)));
  }
  {const a=ph(t,TH-.12,TH)*(1-ph(t,TH+.1,TH+.7))*(miss?.4:1);
   if(a>0){g.save();g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(0,GY-120,0,GY);gr.addColorStop(0,E.rgba(CA,0));gr.addColorStop(.5,E.rgba(CA,.22*a));gr.addColorStop(1,E.rgba(CW,.32*a));
    g.fillStyle=gr;g.beginPath();g.moveTo(tc-12,GY-120);g.lineTo(tc+12,GY-120);g.lineTo(tc+30,GY);g.lineTo(tc-30,GY);g.closePath();g.fill();g.restore()}}
  if(t>TH-.02){
   for(let i=0;i<7;i++){const st=TH+hs(i+70)*.25,p=ph(t,st,st+.9);if(p<=0||p>=1)continue;
    crescent(g,tc+(hs(i+80)-.5)*90+Math.sin(p*5+i)*6,GY-30-p*70*(.5+hs(i+90)),3+3*hs(i+100),-2.2,.9,1.6,1,1,Math.sin(p*3.14)*.9,MPAL,i)}
   if(!miss)E.wave(g,tc,GY,6+100*eo(ph(t,TH+.05,TH+.8)),CW,(1-ph(t,TH+.2,TH+.8))*.5,1.3,{seed:sd+12,t:T,sq:.3});
   if(E.once(s,'mx'))E.burst(E.rng(sd^0x6b1),tc,GY-60,miss?8:22,{speed:[16,70],ang:[0,6.2832],size:[1.6,2.8],life:[cap(.6),cap(1.1)],gy:26,drag:.6,shape:'spark',c:CA,c2:'#ffffff',a:1,add:true,tag:'fx2'});
  }
  E.draw(g,'fx2');
 }

 /* ===== [FX 2A sửa] CHÍ MẠNG = ĐAU THẬT =====
    Vẽ lên MỤC TIÊU (không chớp trắng): thân đỏ lên, sao nổ có đỉnh nhọn rung giật, vết chém chữ X xé ngang thân, tia xung kích, vòng sốc dưới đất,
    đất nứt (viền cam), bụi tung, giọt máu/tinh huyết văng theo đường parabol + mảnh màu vùng. Tính theo q (0..1) nên không cần trạng thái. */
 function critPain(g,fx){
  const q=clamp(fx.q||0,0,.9999),pp=!!fx.pp,tgt=pp?272:90,cy=146,GY=204,dir=pp?1:-1,seed=((fx.i||0)*977+13)|0,z=zones[zi(fx.s)],ZC=(z&&z.color)||'#ffd24a',
   ph=E.ph,eo=E.eOut,hold=1-ph(q,.38,.8),R=rnd(seed);
  layer(g,gg=>{
   const fl=Math.floor(q*40);
   E.glow(gg,tgt,cy,62,'#ff2a2a',.5*(1-ph(q,.04,.6)),'#ff6a5a');
   /* sao nổ nhọn */
   {const o=eo(ph(q,0,.1))*(1-ph(q,.1,.42));
    if(o>.02){const Ro=(24+46*eo(ph(q,0,.1)))*(1+.05*Math.sin(q*120)),n=14;
     gg.save();gg.globalCompositeOperation='lighter';
     const gr=gg.createRadialGradient(tgt,cy,Ro*.3,tgt,cy,Ro);gr.addColorStop(0,E.rgba('#ffd24a',0));gr.addColorStop(.55,E.rgba('#ffd24a',.7*o));gr.addColorStop(1,E.rgba(ZC,.9*o));
     gg.fillStyle=gr;gg.beginPath();
     for(let i=0;i<n*2;i++){const an=i/(n*2)*6.2832,rr=i%2?Ro*.52:Ro*(.85+.5*hs(i+fl*3+seed%13));gg.lineTo(tgt+Math.cos(an)*rr,cy+Math.sin(an)*rr*.9)}
     gg.closePath();gg.fill();gg.restore()}}
   /* vết chém chữ X */
   const X=[[-46,-62,44,56,0,.09],[46,-58,-44,60,.04,.13]];
   X.forEach(c=>{
    const hd=eo(ph(q,c[4],c[5]));if(hd<.05)return;
    const pts=[];for(let i=0;i<10;i++){const k=hd*i/9;pts.push([tgt+c[0]+(c[2]-c[0])*k,cy+c[1]+(c[3]-c[1])*k])}
    E.ribbon(gg,pts,k=>3+13*Math.sin(Math.min(1,k)*Math.PI*.9)+1,'#7a0f1e',.85*hold,{add:false,core:'#c4202e'});
    E.ribbon(gg,pts,k=>1.5+7*Math.sin(Math.min(1,k)*Math.PI*.9),'#ffd24a',.95*hold,{core:'#ffffff'});
   });
   /* tia xung kích */
   {const a=1-ph(q,.05,.45);
    if(a>0){gg.save();gg.globalCompositeOperation='lighter';gg.lineCap='round';gg.strokeStyle=E.rgba('#ffe9a0',.8*a);gg.lineWidth=2;
     for(let i=0;i<14;i++){const an=i/14*6.2832+.2*hs(i),r1=22+q*60,r2=r1+16+26*hs(i+3);gg.beginPath();gg.moveTo(tgt+Math.cos(an)*r1,cy+Math.sin(an)*r1*.85);gg.lineTo(tgt+Math.cos(an)*r2,cy+Math.sin(an)*r2*.85);gg.stroke()}
     gg.restore()}}
   /* vòng sốc + đất nứt */
   E.wave(gg,tgt,GY,10+120*eo(ph(q,0,.5)),ZC,(1-ph(q,.1,.5))*.85,2,{seed:seed,t:q*6,sq:.3});
   E.wave(gg,tgt,GY,6+80*eo(ph(q,.06,.5)),'#ffd24a',(1-ph(q,.15,.5))*.7,1.5,{seed:seed+4,t:q*6,sq:.3});
   gg.save();gg.lineCap='round';gg.lineJoin='round';
   for(let i=0;i<8;i++){const rb=E.rng(seed+i*31),an=(i/8)*6.2832+rb.range(-.25,.25),L=(26+rb.range(0,40))*eo(ph(q,0,.16)),pts=E.jag(rb,tgt,GY+3,tgt+Math.cos(an)*L,GY+3+Math.sin(an)*L*.3,5,3);
    gg.globalCompositeOperation='source-over';gg.strokeStyle=E.rgba('#1c1424',.85*(1-ph(q,.7,1)));gg.lineWidth=2.4;strokePts(gg,pts);
    gg.globalCompositeOperation='lighter';gg.strokeStyle=E.rgba('#ff8a30',.9*(1-ph(q,.25,.75)));gg.lineWidth=1.1;strokePts(gg,pts)}
   gg.restore();
   /* bụi tung */
   for(let i=0;i<6;i++){const x=tgt+(hs(i+seed)-.5)*80*eo(ph(q,0,.3)),p=ph(q,.02+i*.02,.7);if(p>0&&p<1)puff(gg,x,GY-3-p*16,6+12*p,.8*(1-p),q*3,seed+i*9,.6,DUSTP)}
   /* giọt máu / tinh huyết + mảnh màu vùng văng theo parabol */
   const tau=q*1.1;
   for(let i=0;i<34;i++){
    const an=-Math.PI*(.08+.84*hs(i*3+seed)),v=90+140*hs(i*5+seed+1),vx=Math.cos(an)*v+dir*(i%2?-1:1)*18,vy=Math.sin(an)*v,x=tgt+vx*tau,y0=cy+vy*tau+210*tau*tau,y=Math.min(y0,GY+3),a=1-ph(q,.55,.95);
    if(a<=0)continue;
    if(i<26){
     const wx=vx,wy=vy+420*tau,ln=Math.hypot(wx,wy)||1,sx=-wx/ln*(y0>GY?3:9),sy=-wy/ln*(y0>GY?1.5:9);
     gg.save();gg.lineCap='round';gg.strokeStyle=E.rgba('#d81e30',a);gg.lineWidth=4;gg.beginPath();gg.moveTo(x+sx,y+sy);gg.lineTo(x,y);gg.stroke();
     gg.strokeStyle=E.rgba('#ffb0a0',a);gg.lineWidth=1;gg.beginPath();gg.moveTo(x+sx*.6,y+sy*.6);gg.lineTo(x,y);gg.stroke();gg.restore();
    }else{
     gg.save();gg.translate(x,y);gg.rotate(tau*9+i);gg.fillStyle=E.rgba(ZC,a);gg.beginPath();gg.moveTo(0,-4);gg.lineTo(2.4,0);gg.lineTo(0,4);gg.lineTo(-2.4,0);gg.closePath();gg.fill();gg.restore();
    }
   }
  });
 }

 /* ===== [FX 2A sửa] NÉ TRÁNH: bụi bặm ở chân bên né (bật đất lúc lách đi + chạm đất lúc về) + vệt gió ngang thân.
    06-mobs.js lo dịch chuyển + tàn ảnh (gst); hàm này chỉ vẽ bụi theo u (0..1), pa = bên RA ĐÒN là người chơi → bên né là quái, ngược lại. */
 function drawDodge(g,u,pa,T){
  if(u<.26||u>.9)return;
  const defP=!pa,bx=defP?85:272,away=defP?-1:1,k=defP?.84:.78,off=w=>16*Math.sin(Math.PI*clamp((w-.28)/.42,0,1)),foot=w=>bx+away*off(w)*k,GY=204,seed=defP?31:77;
  layer(g,gg=>{
   const sa=E.ph(u,.28,.36)*(1-E.ph(u,.5,.62));
   if(sa>0){gg.save();gg.globalCompositeOperation='lighter';gg.lineCap='round';
    for(let i=0;i<4;i++){const y=GY-6-i*13,len=(16+10*hs(i+seed))*sa,x1=foot(u)-away*5;
     const gr=gg.createLinearGradient(x1,0,x1-away*len,0);gr.addColorStop(0,E.rgba('#ffffff',.45*sa));gr.addColorStop(1,E.rgba('#ffffff',0));
     gg.strokeStyle=gr;gg.lineWidth=2;gg.beginPath();gg.moveTo(x1,y);gg.lineTo(x1-away*len,y);gg.stroke()}
    gg.restore()}
   for(let i=0;i<16;i++){
    const late=i>=9,ub=late?.58+.1*hs(i+seed):.28+.1*hs(i+seed+3),p=E.ph(u,ub,ub+.2);
    if(p<=0||p>=1)continue;
    const x=foot(ub)-away*(4+p*18)+(hs(i+9)-.5)*10,y=GY-1-p*(late?7:12)-hs(i+4)*3,r=(late?6:9)+(late?7:12)*p;
    puff(gg,x,y,r,.95*Math.pow(1-p,1),T*2,seed+i*11,.7,DUSTP);
   }
  });
 }
 /* va chạm của vùng code: mọi thứ đã do ZFX vẽ trong lúc đánh; chỉ còn quầng + tia chí mạng mềm (không chớp trắng) */
 function impactCode(g,fx){return true}   /* [FX 2A sửa] chí mạng do critPain vẽ (gọi ở đầu drawImpactX) */
 const ZFX=E?{0:iceFx,1:mistFx,2:wrap('cloud',cloudRun,cloudX),3:wrap('wind',windRun,windX),4:wrap('thunder',thunderRun,thunderX),5:wrap('moon',moonRun,moonX)}:{};
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
   if(fx.k==='crit'&&fx.d){try{critPain(g,fx)}catch(_){}}   /* [FX 2A sửa] chí mạng: vẽ cảnh đau thật lên mục tiêu */
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
 API.drawDodge=drawDodge;                                   /* [FX 2A sửa] bụi bặm khi né (06-mobs.js gọi) */
 API.codeZone=i=>!!ZFX[zi(i)];                              /* [FX 1B] vùng nào đã vẽ bằng code */
 API.setFxStyle=v=>{STY=v==='sm'?'sm':'px'};                /* [FX 1B] 'px' pixel (mặc định) | 'sm' mịn (chỉ để so sánh) */
}
boot();
})();
