/* ===== 35-attack-fx-2c.js — [FX 2C] Vùng 10-13 vẽ bằng CODE (không ảnh): Thanh Lâm, Xích Hỏa Địa, Hắc Ám Lâm, Tử Tinh Hải =====
   Chạy SAU 34-attack-fx-2b.js: bọc lại API.drawAttack / drawImpact, chỉ nhận vùng 10-13, mọi thứ khác chuyển nguyên cho file trước.
   Cùng quy ước với 33/34: trúng lúc t=.665s (u=.35), hết đòn t=1.68s, lớp pixel nửa độ phân giải, hạt dùng engine riêng (không Math.random). */
(()=>{
'use strict';
let tries=0;
function boot(){
 const API=window.TTGCombatFX;
 if(!API||!API.engine||!API.__atk17||!API.codeZone||(!API.__fx2b&&tries<60)){if(tries++<200)setTimeout(boot,50);return}
 if(API.__fx2c)return;
 API.__fx2c=1;
 const prevA=API.drawAttack,prevI=API.drawImpact,prevCZ=API.codeZone,prevSty=API.setFxStyle,zones=API.zones,E=API.engine;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const zi=s=>Math.max(0,Math.min(zones.length-1,Number(s)||0));
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const ph=E.ph,eo=E.eOut,TAU=Math.PI*2;
 const strokePts=(g,p)=>{g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()};
 /* ---- lớp pixel (giống 33/34): vẽ nửa độ phân giải, 6 mức/kênh, rồi phóng to không làm mịn ---- */
 let STY='px';
 const pxC=document.createElement('canvas');pxC.width=180;pxC.height=125;
 const pxG=pxC.getContext('2d',{willReadFrequently:true});
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
 /* cú lao tới của game (06-mobs.js) — chỉ đọc */
 const lungeCopy=x=>{if(x<=0)return 0;if(x<.14)return -14*Math.sin(x/.14*Math.PI/2);if(x<.35){const q=(x-.14)/.21;return -14+114*q*q*(1.4-.4*q)}if(x<.42)return 100;if(x<.72){const q=(x-.42)/.3;return 100*(1-q*q*(3-2*q))}return 0};
 const lungeX=x=>window.TTGFX&&window.TTGFX.lungeAt?window.TTGFX.lungeAt(x):lungeCopy(x);
 const polyPath=(g,pts)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath()};
 function hexa(g,x,y,R,rot,sq,col,a,lw){
  if(a<=.01||R<1)return;
  g.save();g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(col,a);g.lineWidth=lw||1.4;g.lineJoin='round';
  const p=[];for(let i=0;i<6;i++){const an=rot+i*TAU/6;p.push([x+Math.cos(an)*R,y+Math.sin(an)*R*sq])}
  polyPath(g,p);g.stroke();g.restore();
 }
 function star4(g,x,y,R,col,a,rot){
  if(a<=.01||R<1)return;
  g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.rotate(rot||0);g.fillStyle=E.rgba(col,a);
  g.beginPath();g.moveTo(0,-R);g.quadraticCurveTo(R*.1,-R*.1,R,0);g.quadraticCurveTo(R*.1,R*.1,0,R);g.quadraticCurveTo(-R*.1,R*.1,-R,0);g.quadraticCurveTo(-R*.1,-R*.1,0,-R);g.fill();g.restore();
 }
 /* cục khói phồng nhiều thùy (3 lớp bóng → thân → sáng) */
 const LOBES=[[0,0,.62],[-.6,.14,.46],[.62,.1,.48],[-.22,-.5,.46],[.3,-.44,.42],[0,.3,.4]];
 function puff(g,x,y,r,a,t,sd,sq,pal){
  if(a<=.02||r<1.5)return;
  const fl=hs(sd)<.5?-1:1;
  g.save();g.translate(x,y);if(sq&&sq!==1)g.scale(1,sq);g.globalAlpha=Math.min(1,a);
  const pass=(c,dx,dy,k,only)=>{g.fillStyle=c;g.beginPath();
   for(let i=0;i<LOBES.length;i++){if(only&&i>=only)break;const l=LOBES[i],w=1+.09*E.noise(sd*.013+i*2.3+t*1.7),rr=l[2]*r*k*w,cx=l[0]*fl*r*k+dx,cy=l[1]*r*k+dy;g.moveTo(cx+rr,cy);g.arc(cx,cy,rr,0,TAU)}
   g.fill()};
  pass(pal.sh,0,r*.1,1.02);pass(pal.md,-r*.05,-r*.05,.9);pass(pal.lt,-r*.16,-r*.2,.62,4);
  g.restore();
 }
 /* lưỡi lửa/khí bập bùng mọc từ (x,y) lên cao h, gradient c1 (gốc) → c2 (ngọn) */
 function flame(g,x,y,w,h,a,t,sd,c1,c2){
  if(a<=.02||h<2)return;
  const sw=E.noise(sd*.01+t*6)*w*.35,k1=1+.25*E.noise(sd*.02+t*9);
  g.save();g.globalCompositeOperation='lighter';
  const gr=g.createLinearGradient(x,y,x,y-h);gr.addColorStop(0,E.rgba(c1,a));gr.addColorStop(.55,E.rgba(c2,a*.8));gr.addColorStop(1,E.rgba(c2,0));
  g.fillStyle=gr;g.beginPath();g.moveTo(x-w/2,y);
  g.bezierCurveTo(x-w*.62,y-h*.4,x+sw*.6-w*.2,y-h*.7,x+sw,y-h*k1);
  g.bezierCurveTo(x+sw*.6+w*.2,y-h*.7,x+w*.62,y-h*.4,x+w/2,y);
  g.closePath();g.fill();g.restore();
 }
 /* nét thon tô 1 đa giác (nhẹ): dày w0 ở đầu mảng, mỏng w1 ở cuối (gốc → ngọn), đầu mút tròn */
 function taper(g,p,w0,w1,col,a,add){
  const n=p.length;if(n<2||a<=.01)return;
  const L=[],R=[];
  for(let i=0;i<n;i++){
   const p0=p[Math.max(0,i-1)],p1=p[Math.min(n-1,i+1)];let dx=p1[0]-p0[0],dy=p1[1]-p0[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
   const w=Math.max(.5,w0+(w1-w0)*i/(n-1))/2;L.push([p[i][0]-dy*w,p[i][1]+dx*w]);R.push([p[i][0]+dy*w,p[i][1]-dx*w]);
  }
  g.save();g.globalCompositeOperation=add?'lighter':'source-over';g.fillStyle=E.rgba(col,a);
  g.beginPath();g.moveTo(L[0][0],L[0][1]);for(let i=1;i<n;i++)g.lineTo(L[i][0],L[i][1]);
  g.arc(p[n-1][0],p[n-1][1],Math.max(.25,w1/2),0,TAU);
  for(let i=n-1;i>=0;i--)g.lineTo(R[i][0],R[i][1]);
  g.closePath();g.fill();g.restore();
 }
 const wrap=(key,run,ex)=>(g,T,S)=>{
  const u=clamp(S.u||0,0,1),s=E.seed(key,u);
  E.setSpeed(window.BSPD||1);
  if(E.once(s,'init'))E.clear();
  layer(g,gg=>{run(gg,T,u*1.9,!!S.pa,!!S.miss,!!S.cr,s);if(ex)ex(gg,T,u*1.9,!!S.pa,!!S.miss,!!S.cr,s)});
  return true;
 };
 const TG='fx2c';

 /* ================= 10 THANH LÂM (gần): rễ & dây leo mọc từ đất quấn quanh quái rồi siết lại =================
    Lấy đà: lá xoáy quanh người đánh. Hai rễ gai bò sát đất từ chân thú tới quái, 3 dây leo xoắn ốc mọc quanh thân quái (vẫn thấy quái), lá nảy dọc thân,
    rồi SIẾT lại. Trúng: nụ nở ở ngọn dây, lá bay xoáy, bào tử sáng, sóng xanh. Dây khô lại và tan dần. */
 const LA='#8be04a',LB='#d8ff9a',LD='#1c5a14',LR='#5a3a1c',LY='#ffe45a',LM='#2e8a2a';
 function leafAt(g,x,y,L,ang,c1,c2,a){
  if(a<=.02||L<1)return;
  g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=Math.min(1,a);
  const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,-L*.42,L,0);g.quadraticCurveTo(L*.5,L*.42,0,0);g.fill();
  g.strokeStyle=E.rgba(LB,.5);g.lineWidth=.8;g.beginPath();g.moveTo(L*.08,0);g.lineTo(L*.85,0);g.stroke();
  g.restore();
 }
 function grass(g,x,y,h,lean,w,a,t,sd,c1,c2){
  if(a<=.02||h<2)return;
  const sw=lean+E.noise(sd*.01+t*3)*h*.18;
  g.save();const gr=g.createLinearGradient(x,y,x+sw,y-h);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.globalAlpha=Math.min(1,a);
  g.beginPath();g.moveTo(x-w/2,y);g.quadraticCurveTo(x-w*.2+sw*.3,y-h*.6,x+sw,y-h);g.quadraticCurveTo(x+w*.2+sw*.4,y-h*.55,x+w/2,y);g.closePath();g.fill();g.restore();
 }
 /* dây leo xoắn quanh thân (tc = tâm, base = mặt đất, H = cao). Trả về điểm ngọn */
 function vine(g,T,tc,base,H,Rx,Ry,turns,ph0,grow,sq,w,a,t,sd){
  if(grow<=.02||a<=.02)return null;
  const N=34,m=Math.max(2,Math.floor(N*grow)),pts=[];
  for(let i=0;i<=m;i++){const k=i/N,an=ph0+k*turns*TAU+.25*E.noise(sd*.01+i*.6+t*3),rx=Rx*(1-.28*k)*sq;
   pts.push([tc+Math.cos(an)*rx,base-k*H+Math.sin(an)*Ry*(1-.25*k)])}
  taper(g,pts,w*1.15,w*.35,'#0c2a08',.9*a,false);
  taper(g,pts,w*.8,w*.22,LM,.95*a,false);
  taper(g,pts,w*.35,w*.1,LB,.8*a,true);
  for(let i=3;i<pts.length-1;i+=4){
   const lp=Math.min(1,(pts.length-1-i)/4),sgn=i%8<4?1:-1,an=Math.atan2(pts[i+1][1]-pts[i][1],pts[i+1][0]-pts[i][0])+sgn*1.15;
   leafAt(g,pts[i][0],pts[i][1],(8+4*hs(i+sd%9))*lp*(.6+.4*sq),an,LD,LA,a*.95);
  }
  return pts[pts.length-1];
 }
 /* rễ gai bò sát đất từ x0 tới x1, ngọn hơi ngóc lên (lift) */
 function root(g,x0,x1,grow,w,a,t,sd,lift){
  if(grow<=.02||a<=.02)return;
  const N=26,pts=[],dx=x1-x0,m=Math.max(2,Math.floor(N*grow));
  for(let i=0;i<=m;i++){const k=i/N,ww=Math.sin(k*9+sd*.01)*4*(1-k*.5),up=lift*k*k*k;pts.push([x0+dx*k,203+ww*.5-up])}
  taper(g,pts,w*1.1,w*.4,'#1a0e06',.95*a,false);
  taper(g,pts,w*.75,w*.25,LR,.95*a,false);
  taper(g,pts,w*.25,w*.08,'#d8b070',.6*a,true);
  g.save();g.fillStyle=E.rgba('#a07a44',a*.9);
  for(let i=4;i<pts.length;i+=5){const p=pts[i],q=2.4+hs(i+sd%7)*1.6;g.beginPath();g.moveTo(p[0]-q,p[1]);g.lineTo(p[0]+q*.2,p[1]-q*2.2);g.lineTo(p[0]+q,p[1]);g.closePath();g.fill()}
  g.restore();
 }
 /* hoa/nụ nở: 2 lớp cánh bầu, gradient tối → sáng, viền sáng */
 function bloom(g,x,y,R,open,a,rot,c1,c2,cc){
  if(open<=.02||a<=.02||R<2)return;
  g.save();g.translate(x,y);g.rotate(rot);g.lineJoin='round';
  for(let l=0;l<2;l++){
   const n=l?5:6,o=eo(ph(open,l*.25,.6+l*.25)),L=R*(l?.62:1)*o,W=L*.42;if(o<=.02)continue;
   for(let i=0;i<n;i++){
    g.save();g.rotate(i*TAU/n+(l?TAU/12:0));g.globalAlpha=Math.min(1,a);
    const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(.6,c2);gr.addColorStop(1,'#f4ffd0');
    g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*.2,-W*1.1,L*.85,-W*.8,L,0);g.bezierCurveTo(L*.85,W*.8,L*.2,W*1.1,0,0);g.fill();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(LB,.6*a);g.lineWidth=1;g.stroke();
    g.restore();
   }
  }
  g.restore();
  E.glow(g,x,y,R*.5,cc,.5*a*open);
 }
 function leafRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,u=t/1.9,sd=s.seed,r=E.rng(sd^0xa17),cap=l=>Math.max(.12,Math.min(l,END-t)),
   lk=miss?.6:1,ax=x=>pa?85+.84*lungeX(x)*lk:272-.78*lungeX(x)*lk,sc=(miss?.78:1)*(cr?1.18:1);
  /* lấy đà: lá xoáy quanh người đánh */
  if(u<.22){const bx=ax(u),c=ph(u,0,.14),o=1-ph(u,.14,.24);
   E.glow(g,bx,GY-40,34*eo(c),LA,.4*o);
   for(let i=0;i<5;i++){const an=t*8+i*TAU/5,d=(1-c)*28+10;leafAt(g,bx+Math.cos(an)*d,GY-40+Math.sin(an)*d*.8,5+4*c,an+1.5,LD,LA,(.4+.5*c)*o)}
   E.wave(g,bx,GY,8+24*eo(c),LA,.7*o,1.4,{seed:sd,t:T,sq:.3})}
  /* vệt lao: lá rơi sau lưng */
  if(u>.1&&u<.55){for(let m=E.rate(s,'rs',ph(u,.1,.42),26);m>0;m--)E.emit({x:ax(u)-dir*r.range(4,20),y:GY-r.range(6,60),vx:-dir*r.range(10,50),vy:r.range(-20,10),gy:60,life:cap(r.range(.4,.7)),s0:r.range(2,3.2),s1:.8,rot:r.range(0,TAU),vr:r.range(-6,6),shape:'leaf',c:LA,c2:LB,a:.95,fl:r.range(6,12),tag:'z10'})}
  const vis=1-ph(t,TH+.58,TH+1.1),sq=1-.4*eo(ph(t,TH-.04,TH+.12))+.05*Math.sin(t*26)*ph(t,TH+.1,TH+.4);
  /* 2 rễ gai bò sát đất từ chân người đánh tới quái */
  const xh=x0+dir*34;
  [[xh,tc-dir*28*sc,TH-.42,7],[xh+dir*10,tc-dir*52*sc,TH-.36,6]].forEach((q,k)=>{const gw=eo(ph(t,q[2],q[2]+.3));if(gw>0)root(g,q[0],q[1],gw,q[3],vis,t,sd+k*13,6)});
  /* 3 dây leo xoắn quanh quái, rồi siết */
  const tips=[];
  for(let k=0;k<3;k++){const t0=TH-.34+k*.06,gw=eo(ph(t,t0,t0+.34)),tp=vine(g,T,tc,GY-2,112*sc,34*sc,9*sc,1.9,k*TAU/3+k*.4,gw,sq,4.6,vis,t,sd+k*17);if(tp)tips.push(tp)}
  if(t>=TH-.03){
   const p=ph(t,TH-.03,TH+.6),bo=ph(t,TH+.02,TH+.4);
   tips.forEach((q,i)=>bloom(g,q[0],q[1],(10+4*(i%2))*sc,bo,vis,t*.8+i,LM,LA,LY));
   if(E.once(s,'hit')){const rb=E.rng(sd^0x3c1);
    E.burst(rb,tc,GY-50,miss?10:30,{speed:[40,170],ang:[0,TAU],size:[3,5.5],life:[cap(.7),cap(1.3)],gy:70,drag:.7,shape:'leaf',c:LA,c2:LB,a:1,tag:'z10',vr:[-8,8],fl:11});
    E.burst(rb,tc,GY-30,miss?8:26,{speed:[20,110],ang:[0,TAU],size:[1.4,2.8],life:[cap(.8),cap(1.5)],gy:-20,drag:.6,shape:'orb',c:LY,c2:LB,a:1,add:true,tag:'z10'})}
   E.wave(g,tc,GY,8+(miss?60:96)*eo(p),LA,(1-p)*.8,2,{seed:sd+3,t:T,sq:.28});
   E.wave(g,tc,GY,6+(miss?36:62)*eo(ph(t,TH,TH+.5)),LB,(1-ph(t,TH+.1,TH+.55))*.6,1.3,{seed:sd+4,t:T,sq:.28});
   E.glow(g,tc,GY-30,50*sc,LA,.3*(1-p));
   for(let n=E.rate(s,'sp',ph(t,TH,TH+1),miss?16:50);n>0;n--)E.emit({x:tc+r.range(-46,46)*sc,y:GY-r.range(0,60),vx:r.range(-8,8),vy:-r.range(14,50),gy:-4,drag:.4,life:cap(r.range(.7,1.3)),s0:r.range(1.4,2.6),s1:.5,shape:'orb',c:LY,c2:LB,a:.95,add:true,tag:'z10'});
  }
  E.draw(g,'z10');
 }
 /* lớp bổ sung: cỏ mọc dọc đường, 2 dây phụ quấn ngược, bão lá, ấn rune, dư chấn siết, mảnh rễ vỡ */
 function leafX(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=(pa?85:272)+dir*20,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.18:1),hk=miss?.6:1,sd=s.seed,r=E.rng(sd^0x2c7),
   cap=l=>Math.max(.12,Math.min(l,END-t)),vis=1-ph(t,TH+.6,1.15),sq=1-.4*eo(ph(t,TH-.04,TH+.12));
  for(let i=0;i<11;i++){const f=i/10,gx=x0+(tc-x0)*(.1+.9*f)+(hs(i+sd%9)-.5)*8,t0=.12+f*.4,gk=eo(ph(t,t0,t0+.22));
   grass(g,gx,GY,(10+14*hs(i+3))*gk*hk,(hs(i+8)-.5)*8,5,vis*.9,t,sd+i,LD,LA)}
  for(let k=0;k<2;k++){const t0=TH-.28+k*.07,gw=eo(ph(t,t0,t0+.3));vine(g,T,tc,GY-2,96*sc,40*sc,11*sc,-1.6,k*Math.PI+1,gw,sq,3,vis,t,sd+200+k*23)}
  /* bão lá xoáy lên quanh mục tiêu sau khi trúng */
  {const tau=ph(t,TH+.02,TH+1.1),pa2=ph(t,TH,TH+.12)*(1-ph(t,TH+.8,1.4)),n=miss?7:18;
   if(pa2>0)for(let i=0;i<n;i++){const an=i*2.39+t*(3.5+hs(i)*2),rad=(30+34*hs(i+5))*(.4+.6*eo(tau)),x=tc+Math.cos(an)*rad*1.1,y=GY-8-tau*(30+110*hs(i+9))+Math.sin(an)*rad*.25;
    leafAt(g,x,y,5+3*hs(i+2),an*2+i,LD,LA,pa2*.9)}}
  /* ấn rune lá dưới đất */
  {const ra=ph(t,TH-.1,TH+.15)*(1-ph(t,1.2,END)),R0=80*sc;
   if(ra>0&&!miss){E.wave(g,tc,GY,R0,LA,.6*ra,1.4,{seed:sd+9,t:T,sq:.3});E.wave(g,tc,GY,R0*.66,LB,.5*ra,1.1,{seed:sd+10,t:T,sq:.3});
    for(let i=0;i<6;i++){const an=t*.8+i*TAU/6;hexa(g,tc+Math.cos(an)*R0*.8,GY+Math.sin(an)*R0*.8*.3,4,t*2+i,1,LB,.9*ra,1.2);leafAt(g,tc+Math.cos(an)*R0*.5,GY+Math.sin(an)*R0*.5*.3,6,an,LD,LA,.8*ra)}}}
  /* dư chấn: vòng siết co lại lần 2 */
  {const p2=ph(t,TH+.14,TH+.5),a2=Math.sin(p2*Math.PI);
   if(p2>0&&p2<1)E.wave(g,tc,GY-2,(1-p2)*84*hk+10,LB,a2*.7,1.6,{seed:sd+14,t:T,sq:.3})}
  if(t>=TH+.12&&E.once(s,'x10')){const rb=E.rng(sd^0x4e9);
   E.burst(rb,tc,GY-8,miss?4:12,{speed:[50,170],ang:[-Math.PI*.95,-Math.PI*.05],size:[2.6,4.6],life:[cap(.6),cap(1.1)],gy:380,drag:.2,shape:'shard',c:'#5a3a1c',c2:'#c8a060',a:1,tag:TG,vr:[-10,10],floor:GY+4,bounce:.35});
   E.burst(rb,tc,GY-30,miss?10:30,{speed:[30,150],ang:[0,TAU],size:[3,5],life:[cap(.8),cap(1.4)],gy:60,drag:.6,shape:'leaf',c:LM,c2:LB,a:1,tag:TG,vr:[-8,8],fl:10})}
  for(let n=E.rate(s,'sp2',ph(t,TH,TH+1),miss?12:40);n>0;n--)E.emit({x:tc+r.range(-60,60)*sc,y:GY-r.range(0,10),vx:r.range(-6,6),vy:-r.range(24,80),gy:-6,drag:.4,life:cap(r.range(.7,1.3)),s0:r.range(1.2,2.4),s1:.4,shape:r()<.3?'spark':'orb',c:LA,c2:LB,a:.95,add:true,tag:TG,rot:r.range(0,TAU),vr:r.range(-3,3)});
  E.draw(g,TG);
 }

 /* ================= 11 XÍCH HỎA ĐỊA (xa): sóng lửa cuộn trên mặt đất lan tới quái, bùng thành cột lửa =================
    Tụ lực: đất nứt phát sáng + lửa mọc ở chân thú. Sóng lửa cuộn sát đất (đầu sóng cao, đuôi thấp, dải dung nham chảy dưới chân sóng), nứt đất lan theo.
    Trúng: 2 cột lửa xoắn hai bên + 1 cột mờ ở giữa, vũng dung nham nguội dần, dung nham văng nảy đất, khói đen cuộn, tàn lửa. */
 const RA='#ff5a1e',RB='#ffb347',RC='#ffe9a0',RK='#1c0a06';
 const SMK={sh:'#1a1210',md:'#3a2a26',lt:'#6a524a'};
 /* sóng lửa lan từ sx tới ex trong [t0,t1]; a = độ đục (đã gồm tan dần). Trả về vị trí đầu sóng */
 function fireWave(g,T,t,sx,ex,t0,t1,hk,a,sd,s,key,r,tag){
  const wp=ph(t,t0,t1),front=sx+(ex-sx)*Math.pow(wp,1.3),len=Math.abs(front-sx),dir=Math.sign(ex-sx)||1;
  if(t<t0||len<4||a<=.02)return front;
  const pts=E.curve(sx,205,front,205,24,3,6,-t*16);
  E.ribbon(g,pts,q=>(2+7*q)*hk,RA,.9*a,{core:RC});
  const n=Math.min(24,Math.floor(len/7)+2);
  for(let j=0;j<n;j++){const f=j/(n-1),px=sx+(front-sx)*f,crest=Math.pow(f,1.6);
   flame(g,px,204,(8+8*crest)*hk,(9+36*crest*hk)*(.7+.3*Math.sin(t*16+j*1.9+sd%5)),.85*a,t,sd+j*3,RA,RB)}
  if(wp<1){E.blob(g,front,204-16*hk,16*hk,18*hk,RA,.85*a,T,sd,{core:RB,wob:.35,speed:5});E.blob(g,front,204-12*hk,9*hk,11*hk,RB,.9*a,T,sd+5,{core:RC,wob:.35,speed:6});
   for(let n2=E.rate(s,key,wp,50);n2>0;n2--)E.emit({x:front+r.range(-6,6),y:204-r.range(0,26),vx:dir*r.range(10,60),vy:-r.range(20,80),gy:120,life:r.range(.3,.6),s0:r.range(1.6,3),s1:.5,shape:'orb',c:RA,c2:RB,a:.9,add:true,tag:tag})}
  return front;
 }
 function lavaRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),hk=sc,sd=s.seed,r=E.rng(sd^0xb11),
   cap=l=>Math.max(.12,Math.min(l,END-t));
  /* tụ lực: đất nứt phát sáng, lửa mọc quanh chân thú */
  const ch=ph(t,0,.3),co=1-ph(t,.3,.46);
  if(t<.5){
   E.glow(g,x0,GY-6,(30+24*eo(ch))*co,RA,.5*co);
   g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
   for(let i=0;i<7;i++){const rb=E.rng(sd+i*17+Math.floor(t*10)),an=rb.range(0,TAU),L=14+34*ch;g.strokeStyle=E.rgba(i%2?RB:RA,.85*co);g.lineWidth=1.4;
    strokePts(g,E.jag(rb,x0,GY+2,x0+Math.cos(an)*L*1.4,GY+2+Math.sin(an)*L*.3,5,3))}
   g.restore();
   for(let j=0;j<3;j++)flame(g,x0+(j-1)*11,GY,9,(12+24*ch)*(.7+.3*Math.sin(t*14+j*2)),.8*co,t,sd+j,RA,RB);
   E.wave(g,x0,GY,10+30*eo(ch),RA,.8*co,1.6,{seed:sd,t:T,sq:.3});
   for(let n=E.rate(s,'ch',ph(t,0,.3),46);n>0;n--)E.emit({x:x0+r.range(-18,18),y:GY-r.range(0,8),vx:r.range(-10,10),vy:-r.range(30,90),gy:-20,life:r.range(.3,.55),s0:r.range(1.8,3),s1:.5,shape:'orb',c:RA,c2:RB,a:.9,add:true,tag:'z11'})}
  /* sóng lửa chính */
  const sx=x0+dir*30,vis=1-ph(t,TH+.35,TH+.8),front=fireWave(g,T,t,sx,tc,.24,TH+.02,hk,vis,sd,s,'wv',r,'z11');
  /* nứt dung nham ở lại dọc đường sóng đã đi qua */
  {const heat=1-ph(t,TH+.2,1.4),keep=1-ph(t,1.35,END);
   if(t>.3&&keep>0){g.save();g.lineCap='round';g.lineJoin='round';
    for(let i=0;i<8;i++){const f=(i+.5)/8,xi=sx+(tc-sx)*f;if(Math.abs(xi-sx)>Math.abs(front-sx))continue;
     const rb=E.rng(sd+700+i),pp=E.jag(rb,xi-8,GY+2,xi+8,GY+3+(hs(i)-.5)*3,4,2.5);
     g.globalCompositeOperation='source-over';g.strokeStyle=E.rgba('#140806',.7*keep);g.lineWidth=2.6;strokePts(g,pp);
     g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(RA,Math.min(1,.8*heat+.1)*keep);g.lineWidth=1.3;strokePts(g,pp)}
    g.restore()}}
  /* trúng: cột lửa xoắn + nổ */
  if(t>=TH-.02){
   const p=ph(t,TH,TH+.55),fo=1-ph(t,TH+.45,1.25);
   if(E.once(s,'hit')){const rb=E.rng(sd^0x5d1);
    E.burst(rb,tc,GY-10,miss?10:34,{speed:[60,230],ang:[-Math.PI*.97,-Math.PI*.03],size:[2,4.4],life:[cap(.5),cap(1.1)],gy:340,drag:.25,shape:'orb',c:RA,c2:RC,a:1,add:true,tag:'z11',floor:GY+3,bounce:.3});
    E.burst(rb,tc,GY-10,miss?6:22,{speed:[90,280],ang:[-Math.PI*.95,-Math.PI*.05],size:[2,3.4],life:[cap(.4),cap(.8)],gy:380,drag:.3,shape:'streak',c:RB,c2:RC,a:1,add:true,tag:'z11'});
    E.burst(rb,tc,GY-12,miss?3:8,{speed:[8,34],ang:[-Math.PI*.9,-Math.PI*.1],size:[16,28],life:[cap(.9),cap(1.5)],gy:-24,drag:.8,shape:'mist',c:'#1a1210',a:.85,tag:'z11'})}
   if(!miss){
    [[-30,.8,1],[30,.8,1.05],[0,.42,.8]].forEach((c,ci)=>{
     const H=c[2]*126*sc*eo(ph(t,TH,TH+.3));
     for(let j=0;j<8;j++){const q=j/7,y=GY-6-H*q,x=tc+c[0]+Math.sin(q*5+t*11+ci*2)*7*q,w=19-8*q;
      E.blob(g,x,y,w,w*1.15,q<.5?RA:RB,fo*c[1]*(.85-.4*q),T,sd+ci*13+j,{core:q<.5?RB:RC,wob:.35,speed:5})}});
    for(let k=0;k<3;k++)E.wave(g,tc,GY,8+(118-k*22)*eo(ph(t,TH+k*.04,TH+.85)),[RA,RB,RC][k],(1-ph(t,TH+.2+k*.04,TH+.85))*(.8-k*.1),2-k*.4,{seed:sd+k,t:T,sq:.28});
    /* vũng dung nham nguội dần: cam sáng → đỏ thẫm */
    const cool=ph(t,TH+.2,1.45),pv=ph(t,TH,TH+.1)*(1-ph(t,1.45,END));
    E.blob(g,tc,GY+2,40*sc,8,E.mix(RB,'#4a1208',cool),.8*pv,T,sd+8,{add:false,core:E.mix(RC,RA,cool),wob:.2});
    for(let i=0;i<5;i++){const q=ph(t,TH+.1+i*.06,TH+1.1);puff(g,tc+(hs(i+20)-.5)*60,GY-16-q*70,6+10*q,Math.sin(q*Math.PI)*.45,T,sd+300+i*7,1,SMK)}
   }
   for(let n=E.rate(s,'emb',ph(t,TH,TH+1),miss?20:64);n>0;n--)E.emit({x:tc+r.range(-60,60)*hk,y:GY-r.range(0,14),vx:r.range(-14,14),vy:-r.range(40,110),gy:-12,drag:.35,life:cap(r.range(.7,1.4)),s0:r.range(1.2,2.4),s1:.4,shape:'orb',c:RA,c2:RB,a:.95,add:true,tag:'z11'});
  }
  E.draw(g,'z11');
 }
 /* lớp bổ sung: 2 sóng phụ lệch nhịp, 4 mạch dung nham phun quanh quái, bom dung nham có đuôi, 2 dòng dung nham chảy, 3 cột khói cao, tro rơi */
 function lavaX(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,hk=(cr?1.22:1)*(miss?.62:1),sd=s.seed,r=E.rng(sd^0xb2d),
   cap=l=>Math.max(.12,Math.min(l,END-t)),sx=x0+dir*30,fa=1-ph(t,TH+.3,TH+.75);
  fireWave(g,T,t,sx,tc-dir*10,.3,TH+.04,.6,.7*fa,sd+40,s,'w2',r,TG);
  fireWave(g,T,t,sx+dir*10,tc+dir*14,.36,TH+.08,.5,.6*fa,sd+80,s,'w3',r,TG);
  if(t>=TH-.02){
   /* 4 mạch dung nham phun lệch nhịp quanh quái */
   [-76,-52,56,80].forEach((ox,i)=>{
    const t0=TH+.04+i*.05,e=ph(t,t0,t0+.4),fo=1-ph(t,t0+.25,t0+.7),x=tc+ox*(miss?.6:1);
    if(t<t0||fo<=0)return;
    for(let j=0;j<3;j++)flame(g,x+(j-1)*6,GY,8,(18+30*hs(i*3+j))*eo(e)*hk*(.7+.3*Math.sin(t*15+i+j)),.8*fo,t,sd+60+i*7+j,RA,RB);
    E.wave(g,x,GY,5+30*eo(e),RA,(1-e)*.7,1.4,{seed:sd+90+i,t:T,sq:.3});
    if(E.once(s,'gz'+i)){const rb=E.rng(sd+500+i*19);
     E.burst(rb,x,GY-6,miss?4:12,{speed:[50,190],ang:[-Math.PI*.9,-Math.PI*.1],size:[1.6,3.2],life:[cap(.5),cap(1)],gy:360,drag:.3,shape:'orb',c:RA,c2:RC,a:1,add:true,tag:TG,floor:GY+3,bounce:.3})}
   });
   /* bom dung nham bay theo parabol, có đuôi */
   {const tau=t-TH-.01,n=miss?3:7,fa2=1-ph(t,TH+.8,1.45);
    if(tau>0&&fa2>0)for(let i=0;i<n;i++){
     const an=-Math.PI*(.15+.7*hs(i*3+sd%11)),v=130+150*hs(i*5+2+sd%7),vx=Math.cos(an)*v,vy=Math.sin(an)*v,
      pos=q=>[tc+vx*q,Math.min(GY-10+vy*q+340*q*q,GY+3)],hd=pos(tau),pts=[];
     for(let j=0;j<=6;j++)pts.push(pos(Math.max(0,tau-(6-j)*.022)));
     E.ribbon(g,pts,q=>1+5*q,RA,.8*fa2,{core:RC});
     E.blob(g,hd[0],hd[1],5*hk+2,4.5*hk+2,RA,.9*fa2,T,sd+i*5,{core:RB,wob:.3,speed:5})}}
   /* 2 dòng dung nham chảy ra hai bên rồi nguội */
   if(!miss){const fl=eo(ph(t,TH+.1,TH+.6)),cool=ph(t,TH+.3,1.5),fv=1-ph(t,1.4,END);
    if(fv>0)[-1,1].forEach((sg,i)=>{const pts=E.curve(tc,GY+3,tc+sg*(26+84*fl),GY+3,20,2.5,3,i*2);E.ribbon(g,pts,q=>2+6*q,E.mix(RA,'#4a1208',cool),.75*fv,{core:E.mix(RC,RA,cool),add:false})})}
   /* 3 cột khói đen cao */
   if(!miss)[[-44,0],[40,1],[4,2]].forEach(c=>{for(let j=0;j<4;j++){const q=ph(t,TH+.12+j*.07+c[1]*.05,TH+1.15);puff(g,tc+c[0]+Math.sin(q*4+c[1])*8,GY-28-q*(96+c[1]*14),6+11*q,Math.sin(q*Math.PI)*.4,T,sd+600+c[1]*31+j*7,1,SMK)}});
   /* tro rơi + tàn lửa */
   for(let n=E.rate(s,'ash',ph(t,TH+.1,1.4),miss?14:46);n>0;n--)E.emit({x:tc+r.range(-70,70),y:GY-r.range(50,130),vx:r.range(-8,8),vy:r.range(0,16),gy:16,drag:.2,life:cap(r.range(.8,1.5)),s0:r.range(1.2,2),s1:.8,shape:'orb',c:'#2a1c18',a:.7,tag:TG});
   E.wave(g,tc,GY-40,12+80*eo(ph(t,TH,TH+.5)),RB,(1-ph(t,TH+.1,TH+.5))*.3,1.2,{seed:sd+7,t:T,sq:.8});
  }
  E.draw(g,TG);
 }

 /* ================= 12 HẮC ÁM LÂM (gần): xúc tu/bàn tay bóng tối trồi từ vũng tối dưới chân quái, kéo co vào tâm =================
    Lấy đà: bóng tối quanh người đánh, vệt lao khói đen. Vũng tối đen viền hồng sẫm loang dưới chân quái (có mắt trồi lên), 6 xúc tu có giác + vuốt trồi lên cong dần vào tâm.
    Trúng: xúc tu kéo co hết vào tâm, vòng sóng co lại, khói đen tím cuộn; xúc tu tan thành khói, vũng tối thu nhỏ rồi biến mất. */
 const DA='#b0206a',DB='#ff6ab8',DC='#ffc0e8',DK='#0a0310',DM='#34081f';
 const DSM={sh:'#0e0412',md:'#2a0a28',lt:'#5a1a48'};
 function pool(g,T,cx,cy,rx,a,t,sd){
  if(a<=.02||rx<3)return;
  E.blob(g,cx,cy,rx,rx*.3,DM,a,t,sd,{add:false,core:DK,wob:.14,speed:1.5});
  E.blob(g,cx,cy,rx*.7,rx*.2,DK,a,t,sd+3,{add:false,core:DK,wob:.12,speed:2});
  E.wave(g,cx,cy,rx*.95,DA,a*.8,1.8,{sq:.3,wob:.1,t:t,seed:sd});
  E.wave(g,cx,cy,rx*.55*(.9+.1*Math.sin(t*6)),DB,a*.4,1.2,{sq:.3,wob:.1,t:t,seed:sd+5});
 }
 function eye(g,x,y,sz,a,t,sd){
  if(a<=.02||sz<=0)return;
  const bl=.25+.75*Math.abs(Math.sin(t*2.2+sd%5));
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(DB,.9*a);g.beginPath();g.ellipse(x,y,sz*1.6,sz*.6*bl+.3,0,0,TAU);g.fill();
  g.fillStyle=E.rgba('#ffffff',.9*a);g.beginPath();g.ellipse(x,y,sz*.5,sz*.5*bl+.2,0,0,TAU);g.fill();g.restore();
  E.glow(g,x,y,sz*3.4,DA,.4*a);
 }
 /* vuốt: 4 ngón cong, đen viền hồng */
 function claw(g,x,y,ang,sz,a,t,sd){
  if(a<=.02)return;
  g.save();g.translate(x,y);g.rotate(ang);g.lineCap='round';g.lineJoin='round';
  const op=.45+.35*Math.sin(t*9+sd%7);
  for(let i=-1;i<=2;i++){const fa=(i-.5)*.5*(1+op*.3),L=sz*((i===-1||i===2)?.8:1.05),ex=Math.cos(fa)*L,ey=Math.sin(fa)*L;
   g.globalCompositeOperation='source-over';g.strokeStyle=E.rgba('#05010a',a*.95);g.lineWidth=sz*.34;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,fa*L*.6,ex,ey);g.stroke();
   g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(DB,a*.7);g.lineWidth=.9;g.stroke()}
  g.restore();
 }
 /* xúc tu: gốc (bx,by), dài L, nghiêng lean, cong dần curl (+ phải, − trái), mọc grow, dày w; hand=có vuốt ở ngọn. Trả về điểm ngọn */
 function tentacle(g,T,bx,by,L,lean,curl,grow,w,a,t,sd,hand){
  if(grow<=.02||a<=.02)return null;
  const N=28,m=Math.max(2,Math.floor(N*grow)),step=L/N,pts=[[bx,by]];
  let x=bx,y=by,an=-Math.PI/2+lean;
  for(let i=1;i<=m;i++){const k=i/N;an+=curl/N*(.4+1.6*k)+.05*E.noise(sd*.01+i*.5+t*2.2);x+=Math.cos(an)*step;y+=Math.sin(an)*step;pts.push([x,y])}
  taper(g,pts,w*1.2,w*.3,'#05010a',.95*a,false);
  taper(g,pts,w*.9,w*.2,DM,.95*a,false);
  taper(g,pts,w*.28,w*.08,DB,.75*a,true);
  g.save();g.globalCompositeOperation='lighter';
  for(let i=3;i<pts.length-2;i+=4){const q=1-i/pts.length;g.fillStyle=E.rgba(DB,.55*a*q);g.beginPath();g.arc(pts[i][0]+1.5,pts[i][1],1.1+q*.9,0,TAU);g.fill()}
  g.restore();
  const tip=pts[pts.length-1],pr=pts[Math.max(0,pts.length-3)];
  if(hand&&grow>.6)claw(g,tip[0],tip[1],Math.atan2(tip[1]-pr[1],tip[0]-pr[0]),9*(w/5),a,t,sd);
  return tip;
 }
 function shadowRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,u=t/1.9,sd=s.seed,r=E.rng(sd^0xd13),cap=l=>Math.max(.12,Math.min(l,END-t)),
   lk=miss?.6:1,ax=x=>pa?85+.84*lungeX(x)*lk:272-.78*lungeX(x)*lk,sc=(miss?.78:1)*(cr?1.18:1);
  /* lấy đà: bóng tối ngưng tụ quanh người đánh */
  if(u<.22){const bx=ax(u),c=ph(u,0,.14),o=1-ph(u,.14,.24);
   E.glow(g,bx,GY-40,34*eo(c),DA,.35*o);
   E.blob(g,bx,GY-38,16+14*c,26+10*c,DK,.55*o*c,T,sd,{add:false,core:DK,wob:.35,speed:3});
   E.wave(g,bx,GY,8+26*eo(c),DA,.7*o,1.4,{seed:sd,t:T,sq:.3});
   for(let n=E.rate(s,'dk',ph(u,0,.14),20);n>0;n--)E.emit({x:bx+r.range(-14,14),y:GY-r.range(8,60),vx:r.range(-8,8),vy:-r.range(10,34),life:r.range(.3,.5),s0:r.range(6,10),s1:3,shape:'mist',c:'#14061a',a:.8,tag:'z12'})}
  /* vệt lao: bóng đen viền hồng */
  if(u>.1&&u<.55){const al=1-ph(u,.42,.55);for(let j=0;j<6;j++){const uj=Math.max(0,u-j*.026),x=ax(uj)-dir*(6+j*3);E.blob(g,x,GY-34,10+j,24,DK,.5*al*(1-j/6),T,sd+j,{add:false,core:DK,wob:.3});E.glow(g,x,GY-34,22,DA,.18*al*(1-j/6))}
   for(let m=E.rate(s,'rs',ph(u,.1,.42),24);m>0;m--)E.emit({x:ax(u)-dir*r.range(4,20),y:GY-r.range(6,60),vx:-dir*r.range(8,40),vy:r.range(-24,-4),life:cap(r.range(.4,.8)),s0:r.range(7,12),s1:r.range(2,4),shape:'mist',c:'#14061a',a:.8,tag:'z12'})}
  /* vũng tối dưới chân quái */
  const pin=eo(ph(t,TH-.46,TH-.14)),sh=ph(t,TH+.5,TH+1.0),tv=1-sh,pv=ph(t,TH-.46,TH-.34)*(1-ph(t,TH+.55,TH+1.05));
  pool(g,T,tc,GY+2,(22+54*pin)*sc*(1+.06*Math.sin(t*9)),pv,t,sd);
  {const ea=ph(t,TH-.32,TH-.2)*(1-ph(t,TH-.02,TH+.18))*pv;
   for(let i=0;i<3;i++)eye(g,tc+(-30+30*i)*sc,GY+2+(i%2?3:-1),2.6*sc,ea,t,sd+i*13)}
  /* 6 xúc tu trồi lên, cong dần vào tâm, rồi kéo co */
  const pull=eo(ph(t,TH-.1,TH+.08));
  [[-60,100,.2,TH-.40,5.6,1],[60,104,-.2,TH-.37,5.6,1],[-40,78,.14,TH-.34,5.2,0],[40,80,-.14,TH-.31,5.2,1],[-76,116,.3,TH-.28,4.6,0],[76,118,-.3,TH-.25,4.6,1]].forEach((q,i)=>{
   const gw=eo(ph(t,q[3],q[3]+.3));if(gw<=.02)return;
   const sg=q[0]<0?1:-1;
   tentacle(g,T,tc+q[0]*sc,GY+2+(i%2)*2,q[1]*sc*(1-.22*pull),q[2],sg*(.9+.9*pull),gw,q[4],tv,t,sd+i*19,q[5]);
  });
  if(t>=TH-.06){
   const p=ph(t,TH-.06,TH+.6);
   if(E.once(s,'hit')){const rb=E.rng(sd^0x6b3);
    E.burst(rb,tc,GY-60,miss?4:12,{speed:[10,50],ang:[0,TAU],size:[14,26],life:[cap(.9),cap(1.5)],gy:-14,drag:.8,shape:'mist',c:'#14061a',a:.85,tag:'z12'});
    E.burst(rb,tc,GY-60,miss?8:28,{speed:[30,160],ang:[0,TAU],size:[1.6,3.2],life:[cap(.5),cap(1.1)],gy:30,drag:.9,shape:'orb',c:DB,c2:DC,a:1,add:true,tag:'z12'})}
   E.wave(g,tc,GY-60,(1-ph(t,TH-.1,TH+.08))*60+6,DB,ph(t,TH-.2,TH-.05)*(1-ph(t,TH+.05,TH+.12))*.8,1.5,{sq:1,seed:sd+4,t:T});
   E.wave(g,tc,GY,8+(miss?60:98)*eo(p),DA,(1-p)*.8,2,{seed:sd+3,t:T,sq:.28});
   E.glow(g,tc,GY-50,60*sc,DA,.28*(1-ph(t,TH+.05,TH+.5)));
   for(let i=0;i<6;i++){const q=ph(t,TH+.02+i*.05,TH+1.15);puff(g,tc+(hs(i+30)-.5)*56,GY-30-q*60,8+12*q,Math.sin(q*Math.PI)*.55,T,sd+400+i*5,1,DSM)}
   for(let n=E.rate(s,'dis',sh,40);n>0;n--)E.emit({x:tc+r.range(-40,40),y:GY-r.range(20,90),vx:r.range(-10,10),vy:-r.range(8,40),life:cap(r.range(.4,.8)),s0:r.range(6,12),s1:r.range(2,4),shape:'mist',c:'#1a0a24',a:.8,tag:'z12'});
  }
  E.draw(g,'z12');
 }
 /* lớp bổ sung: xoáy hút trên mặt đất, 5 xúc tu mảnh lệch nhịp, 4 bàn tay vuốt từ đất, hồn bóng bay lên, mảnh bóng vỡ, vết bóng ở lại */
 function shadowX(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.18:1),hk=miss?.6:1,sd=s.seed,r=E.rng(sd^0xd2f),
   cap=l=>Math.max(.12,Math.min(l,END-t)),pull=eo(ph(t,TH-.1,TH+.08)),tv=1-ph(t,TH+.5,TH+1.0);
  /* xoáy hút trên mặt đất */
  {const pv=ph(t,TH-.3,TH+.05),va=ph(t,TH-.3,TH-.12)*(1-ph(t,TH+.05,TH+.3));
   if(va>0)for(let arm=0;arm<3;arm++){const pts=[];
    for(let i=0;i<14;i++){const k=i/13,an=arm*TAU/3-t*9+(1-k)*3,rad=70*sc*(1-.7*pv)*(1-k*.88);pts.push([tc+Math.cos(an)*rad*1.1,GY+2+Math.sin(an)*rad*.28])}
    E.ribbon(g,pts,q=>1+4*q,DA,.8*va,{core:DB})}}
  /* 5 xúc tu mảnh lệch nhịp */
  [[-92,70,.34,TH-.22,3.4,0],[92,72,-.34,TH-.2,3.4,1],[-52,58,.2,TH-.18,3,0],[54,60,-.2,TH-.16,3,1],[-20,52,.1,TH-.14,2.8,0]].forEach((q,i)=>{
   const gw=eo(ph(t,q[3],q[3]+.26));if(gw<=.02)return;
   tentacle(g,T,tc+q[0]*sc*hk,GY+3,q[1]*sc*(1-.2*pull),q[2],(q[0]<0?1:-1)*(.8+.8*pull),gw,q[4],tv*.9,t,sd+100+i*23,q[5])});
  /* 4 bàn tay vuốt trồi từ đất ở hai bên, chộp vào tâm rồi kéo xuống */
  if(!miss)[[-98,.3],[98,-.3],[-70,.2],[72,-.2]].forEach((q,i)=>{
   const t0=TH-.2+i*.04,gw=eo(ph(t,t0,t0+.2)),dn=eo(ph(t,TH+.06,TH+.34));
   if(gw<=.02||tv<=0)return;
   const bx=tc+q[0]*sc,tip=tentacle(g,T,bx,GY+3,(34+18*(i%2))*sc*(1-.6*dn),q[1]*.6,(q[0]<0?1:-1)*(1.2-.4*dn),gw,5,tv,t,sd+300+i*17,1);
   if(tip)E.glow(g,tip[0],tip[1],10,DB,.35*tv)});
  /* sau trúng: mảnh bóng vỡ, hồn bóng bay lên, vết bóng ở lại */
  if(t>=TH-.02){
   if(E.once(s,'x12')){const rb=E.rng(sd^0x91a);
    E.burst(rb,tc,GY-60,miss?4:14,{speed:[40,180],ang:[0,TAU],size:[3,6],life:[cap(.6),cap(1.1)],gy:300,drag:.4,shape:'shard',c:'#0a0310',c2:DB,a:1,tag:TG,vr:[-10,10],floor:GY+4,bounce:.3});
    E.burst(rb,tc,GY-40,miss?6:20,{speed:[10,60],ang:[-Math.PI,0],size:[1.6,3],life:[cap(.8),cap(1.4)],gy:-30,drag:.6,shape:'spark',c:DA,c2:DC,a:1,add:true,tag:TG,vr:[-4,4]})}
   const sc2=ph(t,TH,TH+.12)*(1-ph(t,1.35,END));
   if(sc2>0)E.blob(g,tc,GY+2,(miss?22:36)*sc*(1-.3*ph(t,TH+.4,1.4)),8,DK,.6*sc2,T,sd+8,{add:false,core:DK,wob:.2});
   for(let n=E.rate(s,'wsp',ph(t,TH,TH+1),miss?10:34);n>0;n--){const an=r.range(0,TAU),d=r.range(10,60);E.emit({x:tc+Math.cos(an)*d,y:GY-10-r.range(0,50),vx:Math.cos(an)*r.range(4,20),vy:-r.range(10,50),gy:-8,drag:.5,life:cap(r.range(.7,1.2)),s0:r.range(1.4,2.6),s1:.4,shape:r()<.4?'spark':'orb',c:DA,c2:DB,a:.95,add:true,tag:TG,rot:r.range(0,TAU),vr:r.range(-3,3)})}
  }
  E.draw(g,TG);
 }

 /* ================= 13 TỬ TINH HẢI (xa): ngôi sao tím nở ra tại quái, tia pha lê phóng tỏa theo hình sao =================
    Tụ lực: sao nhỏ xoay quanh tay → sao băng nhỏ bay vòng cung tới quái → ngôi sao tím 8 cánh nở ra quanh quái (viền sáng, trống ở giữa để thấy quái) cùng 8 tia pha lê phóng ra,
    ấn sao dẹt dưới đất. Trúng: pha lê vỡ văng nảy đất, bụi sao rơi lấp lánh, vòng sóng tím hồng. */
 const QA='#b45cff',QB='#f4dcff',QC='#ff8af0',QD='#3c1478',QE='#7a3cff';
 const QPAL={dark:'#3c1478',mid:'#b45cff',light:'#e6c4ff',edge:'#f4dcff'};
 /* lăng kính pha lê chỉ ra ngoài từ (x,y) theo góc ang, dài L, rộng W: 2 mặt sáng/tối */
 function spike(g,x,y,ang,L,W,a){
  if(a<=.02||L<2)return;
  g.save();g.translate(x,y);g.rotate(ang);g.lineJoin='round';g.globalAlpha=Math.min(1,a);
  let gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,QD);gr.addColorStop(.6,QA);gr.addColorStop(1,QB);
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(L*.3,-W/2);g.lineTo(L,0);g.closePath();g.fill();
  gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,'#220a4a');gr.addColorStop(.6,QE);gr.addColorStop(1,QC);
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(L*.3,W/2);g.lineTo(L,0);g.closePath();g.fill();
  g.strokeStyle=E.rgba(QB,.9);g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(L*.3,-W/2);g.lineTo(L,0);g.lineTo(L*.3,W/2);g.closePath();g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba('#ffffff',.6*a);g.lineWidth=.9;g.beginPath();g.moveTo(L*.1,0);g.lineTo(L*.95,0);g.stroke();
  g.restore();
 }
 function starPath(g,x,y,R,r2,n,rot){g.beginPath();for(let i=0;i<n*2;i++){const an=rot+i*Math.PI/n,rr=i%2?r2:R,px=x+Math.cos(an)*rr,py=y+Math.sin(an)*rr;i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath()}
 /* ngôi sao 8 cánh: viền sáng + lớp mờ bên trong, sq<1 để ép dẹt thành ấn dưới đất */
 function bigStar(g,x,y,R,sq,rot,a){
  if(a<=.02||R<3)return;
  g.save();g.translate(x,y);g.scale(1,sq);g.globalCompositeOperation='lighter';g.lineJoin='round';
  const gr=g.createRadialGradient(0,0,R*.2,0,0,R);gr.addColorStop(0,E.rgba(QC,0));gr.addColorStop(.7,E.rgba(QA,.2*a));gr.addColorStop(1,E.rgba(QA,.4*a));
  starPath(g,0,0,R,R*.5,8,rot);g.fillStyle=gr;g.fill();
  g.strokeStyle=E.rgba(QA,.45*a);g.lineWidth=5;g.stroke();
  g.strokeStyle=E.rgba(QB,.9*a);g.lineWidth=1.5;g.stroke();
  starPath(g,0,0,R*.62,R*.3,8,-rot*1.3);g.strokeStyle=E.rgba(QC,.7*a);g.lineWidth=1.2;g.stroke();
  g.restore();
 }
 function starRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),sd=s.seed,r=E.rng(sd^0xe27),
   cap=l=>Math.max(.12,Math.min(l,END-t)),hx=x0+dir*26,hy=150,cx=tc,cy=148;
  /* tụ lực: sao nhỏ xoay quanh tay */
  const ch=ph(t,0,.28),co=1-ph(t,.28,.46);
  if(t<.5){
   E.glow(g,hx,hy,(14+22*eo(ch))*co,QA,.55*co);
   for(let i=0;i<4;i++){const an=t*(6+i)+i*1.57,d=(1-ch)*30+8;star4(g,hx+Math.cos(an)*d,hy+Math.sin(an)*d*.8,2+4*ch,i%2?QB:QC,.9*co,an)}
   bigStar(g,hx,hy,(8+16*eo(ch)),1,t*2,.9*co);
   E.wave(g,x0,GY,8+26*eo(ch),QA,.7*co,1.5,{seed:sd,t:T,sq:.3});
   for(let n=E.rate(s,'ch',ph(t,0,.28),40);n>0;n--){const an=r.range(0,TAU),d=r.range(34,60);E.emit({x:hx+Math.cos(an)*d,y:hy+Math.sin(an)*d*.7,vx:-Math.cos(an)*d*3,vy:-Math.sin(an)*d*2,life:.3,s0:r.range(1.6,2.6),s1:.5,shape:'orb',c:QA,c2:QB,a:.9,add:true,tag:'z13'})}
  }
  /* sao băng bay vòng cung tới quái */
  if(t>=.26&&t<TH-.12){
   const e=Math.pow(ph(t,.26,TH-.14),1.4),pos=q=>[hx+(cx-dir*6-hx)*q,hy+(cy-hy)*q-Math.sin(q*Math.PI)*34],hd=pos(e),pts=[];
   for(let j=0;j<=10;j++)pts.push(pos(Math.max(0,e-(10-j)*.04)));
   E.ribbon(g,pts,q=>1+9*q,QA,.85,{core:QB});
   E.blob(g,hd[0],hd[1],8,8,QA,.9,T,sd,{core:QB,wob:.25,speed:4});
   star4(g,hd[0],hd[1],11,'#ffffff',.9,t*8);
   for(let n=E.rate(s,'tr',ph(t,.26,TH-.14),60);n>0;n--)E.emit({x:hd[0]+r.range(-4,4),y:hd[1]+r.range(-4,4),vx:-dir*r.range(10,40),vy:r.range(-20,20),gy:40,life:r.range(.3,.6),s0:r.range(1.4,2.6),s1:.4,shape:r()<.4?'spark':'orb',c:QA,c2:QB,a:.95,add:true,tag:'z13',rot:r.range(0,TAU),vr:r.range(-5,5)});
  }
  /* ngôi sao nở quanh quái, 8 tia pha lê, ấn sao dưới đất */
  if(t>=TH-.2){
   const bl=E.eBack(ph(t,TH-.16,TH+.12)),R=62*bl*sc,life=1-ph(t,TH+.3,TH+.62),ground=ph(t,TH-.16,TH-.02)*(1-ph(t,1.3,END));
   bigStar(g,cx,cy-4,R,1,t*.9,.85*life);
   bigStar(g,tc,GY,R*1.5,.3,-t*.7,.8*ground*(miss?.6:1));
   E.glow(g,cx,cy,60,QA,.2*life);
   for(let i=0;i<8;i++){
    const an=i*TAU/8+t*.25,r0=R*.64,sn=Math.sin(an),px=cx+Math.cos(an)*r0,py=cy+sn*r0;
    let L=((i%2)?28:46)*sc*eo(ph(t,TH-.08+(i%4)*.03,TH+.16+(i%4)*.03));
    if(sn>.5)L=Math.min(L,Math.max(0,(GY+10-py)/sn));
    spike(g,px,py,an,L,(i%2?9:12)*sc,life)}
   if(E.once(s,'hit')){const rb=E.rng(sd^0x3e5);
    E.burst(rb,cx,cy,miss?8:24,{speed:[30,150],ang:[0,TAU],size:[1.4,3],life:[cap(.6),cap(1.2)],gy:20,drag:.7,shape:'spark',c:QC,c2:'#ffffff',a:1,add:true,tag:'z13',vr:[-6,6]})}
   if(t>=TH+.3&&E.once(s,'shat')){const rb=E.rng(sd^0x7a1);
    E.burst(rb,cx,cy,miss?10:28,{speed:[60,230],ang:[0,TAU],size:[3,6],life:[cap(.6),cap(1.1)],gy:300,drag:.4,shape:'shard',c:QD,c2:QB,a:1,tag:'z13',vr:[-10,10],floor:GY+4,bounce:.3});
    E.burst(rb,cx,cy,miss?14:48,{speed:[20,140],ang:[0,TAU],size:[1.2,2.8],life:[cap(.9),cap(1.6)],gy:26,drag:.8,shape:'spark',c:QC,c2:'#ffffff',a:1,add:true,tag:'z13',vr:[-5,5]})}
   if(t>=TH){const p=ph(t,TH,TH+.8);
    for(let k=0;k<3;k++)E.wave(g,tc,GY,8+(110-k*24)*eo(ph(t,TH+k*.04,TH+.85)),[QA,QC,QB][k],(1-ph(t,TH+.2+k*.04,TH+.85))*(.8-k*.1),2-k*.4,{seed:sd+k,t:T,sq:.28});
    for(let n=E.rate(s,'dust',ph(t,TH+.3,TH+1.2),miss?14:50);n>0;n--)E.emit({x:tc+r.range(-60,60)*sc,y:GY-r.range(40,130),vx:r.range(-6,6),vy:r.range(0,14),gy:14,drag:.3,life:cap(r.range(.8,1.4)),s0:r.range(1.2,2.4),s1:.5,shape:'spark',c:QC,c2:'#ffffff',a:.95,add:true,tag:'z13',rot:r.range(0,TAU),vr:r.range(-3,3)})}
  }
  E.draw(g,'z13');
 }
 /* lớp bổ sung: mưa sao băng nhỏ trước khi trúng, sao nhỏ nở lấp lánh hai bên, 4 trụ pha lê mọc từ đất rồi vỡ, mảnh pha lê nằm lại lấp lánh */
 function starX(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.18:1),sd=s.seed,r=E.rng(sd^0xe4b),cap=l=>Math.max(.12,Math.min(l,END-t));
  const OX=[-70,52,-34,78,-92];
  for(let i=0;i<5;i++){
   const t0=.18+i*.07,la=t0+.28,lx=tc+OX[i]*(miss?.55:1),sx=lx-dir*100,sy=-26;
   if(t>=t0&&t<la){
    const k=ph(t,t0,la),pos=q=>{const e=Math.pow(clamp(q,0,1),1.5);return[sx+(lx-sx)*e,sy+(GY-1-sy)*e]},hd=pos(k),pts=[];
    for(let j=0;j<=8;j++)pts.push(pos(k-(8-j)*.05));
    E.ribbon(g,pts,q=>1+8*q,QA,.8,{core:QB});
    star4(g,hd[0],hd[1],7,'#ffffff',.9,t*7+i);
    for(let n=E.rate(s,'ms'+i,k,22);n>0;n--)E.emit({x:hd[0]+r.range(-3,3),y:hd[1]+r.range(-3,3),vx:-dir*r.range(8,30),vy:r.range(-10,20),gy:60,life:r.range(.25,.5),s0:r.range(1.2,2.2),s1:.4,shape:'orb',c:QA,c2:QB,a:.9,add:true,tag:TG})}
   if(t>=la){
    if(E.once(s,'ml'+i)){const rb=E.rng(sd+i*71);E.burst(rb,lx,GY-3,miss?4:9,{speed:[30,120],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.2,2.6],life:[cap(.4),cap(.8)],gy:240,drag:.4,shape:'spark',c:QC,c2:'#ffffff',a:1,add:true,tag:TG,vr:[-6,6]})}
    const e=ph(t,la,la+.3);E.wave(g,lx,GY,4+26*eo(e),QA,(1-e)*.7,1.3,{seed:sd+i,t:T,sq:.3})}
  }
  if(t>=TH-.12){
   /* sao nhỏ nở lấp lánh quanh quái */
   [[-74,-44],[72,-30],[-58,-86],[62,-92],[8,-118]].forEach((q,i)=>{
    const t0=TH-.1+i*.05,a=ph(t,t0,t0+.14)*(1-ph(t,t0+.4,t0+.7));
    if(a>0&&!(miss&&i>2))star4(g,tc+q[0]*sc,GY+q[1]*sc,(8+6*(i%2))*sc*(.7+.3*Math.sin(t*12+i)),i%2?QB:QC,a*.9,t*2+i)});
   /* 4 trụ pha lê mọc từ đất rồi vỡ */
   [-84,-62,60,86].forEach((ox,i)=>{
    const t0=TH-.06+i*.03,o=eo(ph(t,t0,t0+.24)),h=(30+22*hs(i+sd%7))*o*sc*(miss?.7:1),kill=TH+.55+i*.03;
    if(t<kill&&h>2)E.crystal(g,tc+ox*sc*(miss?.6:1),GY+1,h*.46,h,Math.sign(ox)*5,QPAL,1,{crack:.5,shine:.7});
    if(t>=kill&&E.once(s,'cb'+i)){const rb=E.rng(sd+800+i*29);
     E.burst(rb,tc+ox*sc,GY-h*.4,miss?5:12,{speed:[40,170],ang:[0,TAU],size:[2.6,5],life:[cap(.6),cap(1.1)],gy:320,drag:.3,shape:'shard',c:QD,c2:QB,a:1,tag:TG,vr:[-12,12],floor:GY+4,bounce:.35});
     E.burst(rb,tc+ox*sc,GY-h*.4,miss?4:12,{speed:[20,110],ang:[0,TAU],size:[1.2,2.4],life:[cap(.7),cap(1.3)],gy:30,drag:.7,shape:'spark',c:QC,c2:'#ffffff',a:1,add:true,tag:TG,vr:[-5,5]})}
   });
   /* mảnh pha lê nằm lại trên đất, thỉnh thoảng lóe */
   {const fa=ph(t,TH+.5,TH+.65)*(1-ph(t,1.3,END));
    if(fa>0&&!miss)for(let i=0;i<9;i++){
     const x=tc+(hs(i+sd%9)-.5)*150,y=GY+1+hs(i+4)*4,sz=2.4+2.2*hs(i+7);
     g.save();g.translate(x,y);g.rotate(hs(i+2)*TAU);g.globalAlpha=fa;g.fillStyle=E.rgba(QA,1);g.strokeStyle=E.rgba(QB,.9);g.lineWidth=.8;
     polyPath(g,[[0,-sz*1.3],[sz*.7,0],[0,sz*1.3],[-sz*.7,0]]);g.fill();g.stroke();g.restore();
     const tw=Math.sin(t*10+i*2.3);if(tw>.6)star4(g,x,y-2,4+4*(tw-.6)*2.5,'#ffffff',.9*fa,0)}}
   /* vòng rune sao dưới đất */
   {const ra=ph(t,TH-.04,TH+.16)*(1-ph(t,1.2,END)),R0=88*sc;
    if(ra>0&&!miss){E.wave(g,tc,GY,R0,QA,.55*ra,1.3,{seed:sd+9,t:T,sq:.3});
     for(let i=0;i<6;i++){const an=-t*1.1+i*TAU/6;star4(g,tc+Math.cos(an)*R0,GY+Math.sin(an)*R0*.3,4.5,i%2?QB:QC,.9*ra,t*2+i)}}}
   for(let n=E.rate(s,'tw',ph(t,TH,TH+1),miss?10:36);n>0;n--)E.emit({x:tc+r.range(-70,70)*sc,y:GY-r.range(0,100),vx:r.range(-6,6),vy:-r.range(0,30),gy:-4,drag:.5,life:cap(r.range(.4,.9)),s0:r.range(1.4,3),s1:.3,shape:'spark',c:QA,c2:'#ffffff',a:1,add:true,tag:TG,rot:r.range(0,TAU),vr:r.range(-4,4)});
  }
  E.draw(g,TG);
 }

 const ZF={10:wrap('leaf',leafRun,leafX),11:wrap('lava',lavaRun,lavaX),12:wrap('shadow',shadowRun,shadowX),13:wrap('star',starRun,starX)};
 const ATK_SPECIAL=/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng/;
 const NOCODE_ATK=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/,
  NOCODE_IMP=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích|Xuyên giáp|Liên kích -|Phong Nhận(?: chém| -)|Dương Diệm|Thần Phán|Tinh Quang|Thiên Uy|Sương Tán/,
  IMP_SPECIAL=/Khiên hấp thụ|Chắn đòn|hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh|Hút máu|Lôi Phạt|Lôi Kích -|Dung Nham|Thiêu đốt|Xích Diệm/;
 API.drawAttack=function(g,T,S){
  try{
   const idx=zi(S.s),text=S.text||'';
   if(ZF[idx]&&S.cl!==3&&!ATK_SPECIAL.test(text)&&!NOCODE_ATK.test(text))return ZF[idx](g,T,S);
  }catch(e){if(window.__ATK17_DEBUG)throw e}
  return prevA(g,T,S);
 };
 API.drawImpact=function(g,fx,T){
  try{
   const idx=zi(fx.s),text=fx.text||'';
   if(ZF[idx]&&(fx.k==='hit'||fx.k==='crit'||fx.k==='miss')&&!NOCODE_IMP.test(text)&&!IMP_SPECIAL.test(text)){
    /* chí mạng "đau thật" (critPain) của 33 lấy màu vùng 0; mượn màu vùng này trong lúc gọi, rồi trả lại. */
    if(fx.k==='crit'&&fx.d){const z0=zones[0],old=z0.color;z0.color=zones[idx].color;try{prevI(g,Object.assign({},fx,{s:0,text:''}),T)}finally{z0.color=old}}
    return true;
   }
  }catch(e){if(window.__ATK17_DEBUG)throw e}
  return prevI(g,fx,T);
 };
 API.codeZone=i=>!!ZF[zi(i)]||prevCZ(i);
 API.setFxStyle=v=>{STY=v==='sm'?'sm':'px';if(prevSty)prevSty(v)};
}
boot();
})();
