/* ===== 38-attack-fx-2d.js — [FX 2D] Vùng 14-16 vẽ bằng CODE (không ảnh): Thiên Không, Linh Hoa Viên, Thần Điện =====
   Chạy SAU 37-attack-fx-2c-detail.js: bọc lại API.drawAttack / drawImpact, chỉ nhận vùng 14-16, mọi thứ khác chuyển nguyên cho file trước.
   Cùng quy ước với 33-37: trúng lúc t=.665s (u=.35), hết đòn t=1.68s, lớp pixel nửa độ phân giải, hạt dùng engine riêng (không Math.random).
   Mỗi vùng gồm lớp chính (Run) + lớp bổ sung (X) vẽ sau: tụ lực → các đợt phụ → trúng nổ nhiều đợt → dư ảnh ở lại rồi tan dần.
   14 Thiên Không: 3 tia sáng xanh trời XOẮN vào nhau; trúng: vòng gió nổ, vệt khí cuộn, 4 lốc xoáy, lưỡi gió chém.
   15 Linh Hoa Viên: hạt giống bay vòng cung, cắm đất, mọc cuống rồi nở bung cụm hoa phát sáng; trúng: cánh hoa bão, phấn hoa, bướm sáng.
   16 Thần Điện: pháp trận vàng vẽ dưới đất, 3 trụ sáng thần giáng (lõi rỗng để thấy quái), giáo ánh sáng cắm đất, cánh sáng; trúng: lông vũ bay lên, pháp trận tan từng đoạn. */
(()=>{
'use strict';
let tries=0;
function boot(){
 const API=window.TTGCombatFX;
 if(!API||!API.engine||!API.__atk17||!API.codeZone||(!API.__fx2cd&&tries<120)){if(tries++<240)setTimeout(boot,50);return}
 if(API.__fx2d)return;
 API.__fx2d=1;
 const prevA=API.drawAttack,prevI=API.drawImpact,prevCZ=API.codeZone,prevSty=API.setFxStyle,zones=API.zones,E=API.engine;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const zi=s=>Math.max(0,Math.min(zones.length-1,Number(s)||0));
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const ph=E.ph,eo=E.eOut,TAU=Math.PI*2,GY=204,TH=.665,END=1.68,TG='fx2d';
 const strokePts=(g,p)=>{g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()};
 /* ---- lớp pixel (giống 33-37): vẽ nửa độ phân giải, 6 mức/kênh, rồi phóng to không làm mịn ---- */
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
 const polyPath=(g,pts)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath()};
 function star4(g,x,y,R,col,a,rot){
  if(a<=.01||R<1)return;
  g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.rotate(rot||0);g.fillStyle=E.rgba(col,a);
  g.beginPath();g.moveTo(0,-R);g.quadraticCurveTo(R*.1,-R*.1,R,0);g.quadraticCurveTo(R*.1,R*.1,0,R);g.quadraticCurveTo(-R*.1,R*.1,-R,0);g.quadraticCurveTo(-R*.1,-R*.1,0,-R);g.fill();g.restore();
 }
 /* cục mây/khói phồng nhiều thùy (3 lớp bóng → thân → sáng) */
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
 /* nét thon tô 1 đa giác: dày w0 ở đầu mảng, mỏng w1 ở cuối, đầu mút tròn */
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

 /* ================= 14 THIÊN KHÔNG (xa): ba tia sáng xanh trời xoắn vào nhau quét tới quái =================
    Tụ lực: 3 vòng gió xanh xoáy quanh tay, hạt hút vào. 3 tia xoắn ốc (pha lệch 120°, biên độ thu hẹp dần khi tới nơi), đầu tia kéo mây nhỏ.
    Trúng: 3 vòng gió sáng nổ ra quanh quái, 5 vệt khí cuộn xoắn lan trên đất, mây xanh nở rồi tan, sóng đất, hạt gió. */
 const SA='#6ac4ff',SB='#d4f0ff',SC='#2a86ff',SD='#14408a';
 const CLD={sh:'#3a68aa',md:'#9ccaf5',lt:'#eef8ff'};
 /* 1 sợi xoắn từ (sx,sy) tới (ex,ey): hp = tiến độ đầu sợi 0..1, o.ph0 = pha, o.amp = biên độ, o.freq = số vòng xoắn. Trả về điểm đầu sợi */
 function helix(g,t,o){
  if(o.hp<=.01||o.vis<=.02)return null;
  const N=30,pts=[],dx=o.ex-o.sx,dy=o.ey-o.sy,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;
  for(let i=0;i<N;i++){
   const sp=o.hp-i*.022;if(sp<0)break;
   const env=Math.pow(Math.sin(Math.min(1,sp)*Math.PI*.92+.08),.7),wv=Math.sin(sp*TAU*o.freq+o.ph0-t*13)*o.amp*env;
   pts.unshift([o.sx+dx*sp+nx*wv,o.sy+dy*sp+ny*wv]);
  }
  if(pts.length<4)return null;
  E.ribbon(g,pts,q=>1.5+o.w*1.5*q,SD,.45*o.vis,{add:false});
  E.ribbon(g,pts,q=>.6+o.w*Math.pow(q,.8),o.col,.9*o.vis,{core:o.core});
  return pts[pts.length-1];
 }
 function skyRun(g,T,t,pa,miss,cr,s){
  const dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),sd=s.seed,r=E.rng(sd^0xf14),
   cap=l=>Math.max(.12,Math.min(l,END-t)),hx=x0+dir*26,hy=150,ty=148;
  /* tụ lực */
  const ch=ph(t,0,.28),co=1-ph(t,.28,.46);
  if(t<.5){
   E.glow(g,hx,hy,(14+22*eo(ch))*co,SA,.5*co);
   for(let k=0;k<3;k++){const pts=[];
    for(let j=0;j<=10;j++){const f=j/10,an=t*(10+k*2)+k*TAU/3-f*2.2,rad=(30-18*ch)*(.5+.5*f);pts.push([hx+Math.cos(an)*rad,hy+Math.sin(an)*rad*.55])}
    E.ribbon(g,pts,q=>1+3.5*q,[SA,SB,SC][k],.8*co,{core:SB})}
   E.wave(g,x0,GY,8+26*eo(ch),SA,.7*co,1.5,{seed:sd,t:T,sq:.3});
   for(let n=E.rate(s,'ch',ph(t,0,.28),44);n>0;n--){const an=r.range(0,TAU),d=r.range(34,62);E.emit({x:hx+Math.cos(an)*d,y:hy+Math.sin(an)*d*.7,vx:-Math.cos(an)*d*3,vy:-Math.sin(an)*d*2,life:.3,s0:r.range(1.6,2.6),s1:.5,shape:r()<.4?'streak':'orb',c:SA,c2:SB,a:.9,add:true,tag:'z14'})}
  }
  /* 3 tia xoắn */
  const unw=ph(t,TH-.1,TH+.3);
  for(let k=0;k<3;k++){
   const hp=clamp(eo(ph(t,.2+k*.025,TH)),0,1),vis=1-ph(t,TH+.04+k*.03,TH+.42);
   const hd=helix(g,t,{sx:hx,sy:hy,ex:tc-dir*8,ey:ty,ph0:k*TAU/3,freq:2.4,amp:(15+2*k)*(miss?.8:1)*(1-.55*unw),w:7+k,col:[SA,SB,SC][k],core:SB,hp:hp,vis:vis});
   if(hd){
    E.glow(g,hd[0],hd[1],12+4*k,[SA,SB,SC][k],.6*vis);
    if(k===0)puff(g,hd[0]-dir*10,hd[1],9,.35*vis,T,sd+k,.9,CLD);
    for(let n=E.rate(s,'tr'+k,ph(t,.2,TH),30);n>0;n--)E.emit({x:hd[0]+r.range(-4,4),y:hd[1]+r.range(-4,4),vx:-dir*r.range(10,50),vy:r.range(-20,20),gy:20,life:r.range(.3,.6),s0:r.range(1.4,2.6),s1:.4,shape:r()<.4?'streak':'orb',c:SA,c2:SB,a:.95,add:true,tag:'z14'})}
  }
  /* trúng */
  if(t>=TH-.02){
   const p=ph(t,TH,TH+.6),fo=1-ph(t,TH+.4,1.3),cy=148;
   if(E.once(s,'hit')){const rb=E.rng(sd^0x7f1);
    E.burst(rb,tc,GY-14,miss?10:34,{speed:[60,230],ang:[-Math.PI*.97,-Math.PI*.03],size:[1.6,3.4],life:[cap(.5),cap(1.1)],gy:140,drag:.6,shape:'orb',c:SA,c2:SB,a:1,add:true,tag:'z14',floor:GY+3,bounce:.25});
    E.burst(rb,tc,GY-20,miss?6:22,{speed:[100,290],ang:[0,TAU],size:[2,3.4],life:[cap(.4),cap(.8)],gy:0,drag:1.1,shape:'streak',c:SB,c2:'#ffffff',a:1,add:true,tag:'z14'});
    E.burst(rb,tc,GY-16,miss?3:8,{speed:[10,44],ang:[-Math.PI*.9,-Math.PI*.1],size:[14,26],life:[cap(.9),cap(1.5)],gy:-14,drag:.8,shape:'mist',c:'#9ccaf5',a:.7,tag:'z14'})}
   for(let k=0;k<3;k++)E.wave(g,tc,cy,6+(miss?60:104-k*20)*eo(ph(t,TH+k*.04,TH+.7)),[SA,SB,SC][k],(1-ph(t,TH+.12+k*.04,TH+.7))*(.75-k*.1),2-k*.4,{sq:.9,seed:sd+k,t:T});
   for(let k=0;k<2;k++)E.wave(g,tc,GY,8+(miss?60:104-k*28)*eo(ph(t,TH+k*.05,TH+.8)),[SA,SC][k],(1-ph(t,TH+.2+k*.05,TH+.8))*(.8-k*.1),2-k*.5,{seed:sd+9+k,t:T,sq:.28});
   E.glow(g,tc,GY-30,60*sc,SA,.25*(1-ph(t,TH+.05,TH+.5)));
   /* vệt khí cuộn */
   if(fo>0){const e=eo(p);
    for(let arm=0;arm<5;arm++){const pts=[];
     for(let j=0;j<=12;j++){const f=j/12,an=arm*TAU/5+f*3.4+t*4.5,rad=(8+(miss?70:112)*f)*e;pts.push([tc+Math.cos(an)*rad*1.15,GY-12-f*18*e+Math.sin(an)*rad*.26])}
     E.ribbon(g,pts,q=>1+5*q,[SA,SB,SC][arm%3],.7*fo,{core:SB})}}
   for(let i=0;i<5;i++){const q=ph(t,TH+.02+i*.05,TH+1.1);puff(g,tc+(hs(i+20)-.5)*90,GY-8-q*34,6+10*q,Math.sin(q*Math.PI)*.4,T,sd+300+i*7,.9,CLD)}
   for(let n=E.rate(s,'wd',ph(t,TH,TH+1),miss?16:48);n>0;n--)E.emit({x:tc+r.range(-60,60)*sc,y:GY-r.range(0,30),vx:r.range(-40,40),vy:-r.range(10,60),gy:-8,drag:.5,life:cap(r.range(.6,1.2)),s0:r.range(1.2,2.4),s1:.4,shape:r()<.4?'streak':'orb',c:SA,c2:SB,a:.95,add:true,tag:'z14'});
  }
  E.draw(g,'z14');
 }
 /* lớp bổ sung: 2 sợi xoắn phụ, 5 lưỡi gió chém vòng cung, 4 lốc xoáy hai bên, vệt khí ở lại trên đất, sóng xa, mây tan chậm */
 function skyX(g,T,t,pa,miss,cr,s){
  const dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),hk=miss?.6:1,sd=s.seed,r=E.rng(sd^0xf2b),
   cap=l=>Math.max(.12,Math.min(l,END-t)),hx=x0+dir*26,hy=150,ty=148,unw=ph(t,TH-.1,TH+.3);
  for(let k=3;k<5;k++){
   const hp=clamp(eo(ph(t,.22+k*.02,TH)),0,1),vis=1-ph(t,TH+.04+k*.03,TH+.4);
   helix(g,t,{sx:hx,sy:hy+(k-3.5)*8,ex:tc-dir*8,ey:ty+(k-3.5)*14,ph0:k*1.9+.7,freq:3.1,amp:(10+2*(k-3))*(miss?.8:1)*(1-.6*unw),w:5,col:k%2?SA:SB,core:SB,hp:hp,vis:vis});
  }
  /* lưỡi gió chém vòng cung lệch nhịp */
  for(let i=0;i<5;i++){
   const t0=TH-.26+i*.05,kh=ph(t,t0,t0+.16),al=1-ph(t,t0+.14,t0+.34);
   if(kh<=0||al<=0)continue;
   const sg=i%2?-1:1,Rb=(54+6*i)*sc*hk,yc=GY-28-i*17,pts=[];
   for(let j=0;j<=8;j++){const q=clamp(kh-(8-j)*.07,0,1),an=sg>0?-Math.PI*(1-q):-Math.PI*q;pts.push([tc+Math.cos(an)*Rb,yc+Math.sin(an)*Rb*.35])}
   E.ribbon(g,pts,q=>1+6*q,i%2?SA:SB,.85*al,{core:SB});
   const hd=pts[8];E.glow(g,hd[0],hd[1],9,SB,.5*al);
   if(E.once(s,'bl'+i)){const rb=E.rng(sd+700+i*31);E.burst(rb,hd[0],hd[1],miss?3:8,{speed:[30,140],ang:[0,TAU],size:[1.4,2.8],life:[cap(.4),cap(.8)],gy:20,drag:.8,shape:'streak',c:SA,c2:SB,a:1,add:true,tag:TG})}
  }
  if(t>=TH-.12){
   /* 4 lốc xoáy: chồng các vòng elip xoay, rộng dần lên cao */
   [-92,-60,62,94].forEach((ox,i)=>{
    const t0=TH-.12+i*.04,e=eo(ph(t,t0,t0+.3)),f=1-ph(t,TH+.55+i*.03,TH+1.1);
    if(e<=.02||f<=0)return;
    const x=tc+ox*sc*(miss?.6:1),H=(66+20*(i%2))*e*sc;
    g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
    for(let j=0;j<7;j++){const q=j/6,y=GY-4-H*q,rx=(7+22*q)*sc*(.6+.4*e),sw=Math.sin(q*4+t*6+i)*5*q,a0=t*(9-q*3)+j*1.3+i;
     g.strokeStyle=E.rgba(j%2?SA:SB,(.65-.35*q)*f);g.lineWidth=2-.8*q;g.beginPath();g.ellipse(x+sw,y,rx,rx*.28,0,a0,a0+4.4);g.stroke()}
    g.restore();
    E.glow(g,x,GY-8,16*sc,SA,.3*f*e);
    if(E.once(s,'tw'+i)){const rb=E.rng(sd+800+i*23);E.burst(rb,x,GY-6,miss?3:8,{speed:[30,120],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,2.8],life:[cap(.5),cap(1)],gy:-10,drag:.6,shape:'orb',c:SA,c2:SB,a:1,add:true,tag:TG})}
   });
   /* vệt khí ở lại trên đất rồi tan dần */
   {const gs=ph(t,TH,TH+.12)*(1-ph(t,1.3,END));
    if(gs>0&&!miss){g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
     for(let i=0;i<8;i++){const L=(24+12*(i%3))*sc,xx=tc+(hs(i+sd%9)-.5)*150,yy=GY+1+i*1.2;g.strokeStyle=E.rgba(i%2?SA:SB,.7*gs);g.lineWidth=1.3;g.beginPath();g.moveTo(xx-L,yy);g.lineTo(xx+L,yy);g.stroke()}
     g.restore()}}
   E.wave(g,tc,GY,8+130*hk*eo(ph(t,TH+.1,TH+.8)),SC,(1-ph(t,TH+.25,TH+.85))*.6,1.5,{seed:sd+30,t:T,sq:.28});
   for(let i=0;i<4;i++)puff(g,tc+(i-1.5)*50,GY-6-Math.sin(t*2+i)*3,10+4*(i%2),.3*ph(t,TH+.1,TH+.3)*(1-ph(t,1.2,END)),T,sd+500+i*9,.5,CLD);
   for(let n=E.rate(s,'rise',ph(t,TH,TH+1),miss?14:46);n>0;n--)E.emit({x:tc+r.range(-80,80)*sc,y:GY-r.range(0,10),vx:r.range(-10,10),vy:-r.range(30,90),gy:-6,drag:.4,life:cap(r.range(.6,1.2)),s0:r.range(1.2,2.4),s1:.4,shape:r()<.35?'spark':'orb',c:SA,c2:SB,a:1,add:true,tag:TG,rot:r.range(0,TAU),vr:r.range(-4,4)});
  }
  E.draw(g,TG);
 }

 /* ================= 15 LINH HOA VIÊN (xa): hạt giống bay tới quái, nở bung thành cụm hoa phát sáng =================
    Tụ lực: cánh hoa xoay quanh tay. 4 hạt giống bay vòng cung (đuôi hồng), cắm xuống hai bên quái, mọc cuống có lá, nụ phồng lên rồi NỞ BUNG (3 lớp cánh, nhụy vàng).
    Trúng: cánh hoa bay tản, phấn hoa lấp lánh bay lên, sóng hồng. Cụm hoa giữ lại rồi héo mờ dần. */
 const PA='#ff7ac0',PB='#ffd6ee',PC='#ffe27a',PD='#a8265f',PG='#4fbf5a',PL='#2c7a34',PM='#a6ff9a';
 function leaf(g,x,y,L,ang,c1,c2,a){
  if(a<=.02||L<1)return;
  g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=Math.min(1,a);
  const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,-L*.42,L,0);g.quadraticCurveTo(L*.5,L*.42,0,0);g.fill();
  g.strokeStyle=E.rgba(PM,.5);g.lineWidth=.8;g.beginPath();g.moveTo(L*.08,0);g.lineTo(L*.85,0);g.stroke();
  g.restore();
 }
 function seedAt(g,x,y,sz,ang,a){
  if(a<=.02)return;
  E.glow(g,x,y,sz*2.8,PA,.5*a);
  g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=Math.min(1,a);
  const gr=g.createLinearGradient(-sz,0,sz,0);gr.addColorStop(0,PD);gr.addColorStop(.6,PA);gr.addColorStop(1,PB);
  g.fillStyle=gr;g.beginPath();g.moveTo(sz*1.2,0);g.quadraticCurveTo(0,-sz*.8,-sz,0);g.quadraticCurveTo(0,sz*.8,sz*1.2,0);g.fill();
  g.strokeStyle=E.rgba('#ffffff',.6*a);g.lineWidth=.8;g.stroke();
  g.restore();
 }
 /* hoa: open 0..1 (dưới .3 là NỤ), sq = ép dẹt (1 = nhìn thẳng, .28 = ấn hoa dưới đất) */
 function blossom(g,x,y,R,open,a,rot,sq,t){
  if(a<=.02||R<2||open<=.01)return;
  g.save();g.translate(x,y);g.scale(1,sq);g.rotate(rot);g.lineJoin='round';
  if(open<.3){
   const L=R*.45*(.55+.45*clamp(open/.3,0,1)),gr=g.createRadialGradient(0,-L*.3,1,0,-L*.2,L);
   gr.addColorStop(0,PB);gr.addColorStop(.6,PA);gr.addColorStop(1,PD);
   g.globalAlpha=Math.min(1,a);g.fillStyle=gr;g.beginPath();g.moveTo(0,L*.25);g.bezierCurveTo(L*.7,-L*.1,L*.45,-L*1.0,0,-L*1.1);g.bezierCurveTo(-L*.45,-L*1.0,-L*.7,-L*.1,0,L*.25);g.fill();
  }else{
   const LY=[[9,1,0],[7,.72,TAU/14],[5,.46,.3]];
   LY.forEach((ly,l)=>{
    const o=eo(ph(open,.2+l*.15,.65+l*.15)),n=ly[0],L=R*ly[1]*o,W=L*.44;if(o<=.02)return;
    for(let i=0;i<n;i++){
     g.save();g.rotate(i*TAU/n+ly[2]+Math.sin(t*2+i+l)*.03);g.globalAlpha=Math.min(1,a);
     const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,PD);gr.addColorStop(.55,PA);gr.addColorStop(1,PB);
     g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*.2,-W*1.1,L*.85,-W*.8,L,0);g.bezierCurveTo(L*.85,W*.8,L*.2,W*1.1,0,0);g.fill();
     g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(PB,.7*a);g.lineWidth=1;g.stroke();
     g.restore();
    }
   });
   const o2=eo(ph(open,.35,.8)),cr2=R*.14*o2;
   if(cr2>1){const gr=g.createRadialGradient(0,0,0,0,0,cr2);gr.addColorStop(0,PC);gr.addColorStop(1,'#ff9a3a');g.globalAlpha=Math.min(1,a);g.fillStyle=gr;g.beginPath();g.arc(0,0,cr2,0,TAU);g.fill();
    g.fillStyle=E.rgba('#fff4c0',.9*a);for(let i=0;i<6;i++){const an=i*TAU/6;g.beginPath();g.arc(Math.cos(an)*cr2*1.5,Math.sin(an)*cr2*1.5,1,0,TAU);g.fill()}}
  }
  g.restore();
  E.glow(g,x,y,R*.62,PA,.45*a*Math.min(1,open*2));
 }
 /* cuống có lá, mọc từ đất (x,GY) lên cao H, lệch lean, grow 0..1. Trả về điểm ngọn */
 function stem(g,x,H,lean,grow,a,t,sd){
  if(grow<=.02||a<=.02)return null;
  const N=16,m=Math.max(2,Math.floor(N*grow)),pts=[];
  for(let i=0;i<=m;i++){const k=i/N;pts.push([x+lean*k*k+Math.sin(k*5+sd*.01+t*1.4)*2.2*k,GY-H*k])}
  taper(g,pts,4.2,1.8,'#10361a',.95*a,false);taper(g,pts,3,1.2,PG,.95*a,false);taper(g,pts,1,.4,PM,.6*a,true);
  [[.32,1],[.58,-1]].forEach(q=>{if(grow<=q[0])return;const p=pts[Math.min(pts.length-1,Math.round(q[0]*N))];leaf(g,p[0],p[1],(9+4*grow)*(H/60>.7?1:.8),q[1]>0?-.5:Math.PI+.5,PL,PG,a)});
  return pts[pts.length-1];
 }
 function bloomRun(g,T,t,pa,miss,cr,s){
  const dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),sd=s.seed,r=E.rng(sd^0xa15),
   cap=l=>Math.max(.12,Math.min(l,END-t)),hx=x0+dir*26,hy=150,vis=1-ph(t,1.3,END);
  /* tụ lực: cánh hoa xoay quanh tay */
  const ch=ph(t,0,.28),co=1-ph(t,.28,.46);
  if(t<.5){
   E.glow(g,hx,hy,(14+20*eo(ch))*co,PA,.5*co);
   for(let i=0;i<5;i++){const an=t*7+i*TAU/5,d=(1-ch)*26+8;leaf(g,hx+Math.cos(an)*d,hy+Math.sin(an)*d*.8,4+3*ch,an+1.5,PD,PA,(.4+.5*ch)*co)}
   E.wave(g,x0,GY,8+26*eo(ch),PA,.7*co,1.5,{seed:sd,t:T,sq:.3});
   for(let n=E.rate(s,'ch',ph(t,0,.28),36);n>0;n--){const an=r.range(0,TAU),d=r.range(34,60);E.emit({x:hx+Math.cos(an)*d,y:hy+Math.sin(an)*d*.7,vx:-Math.cos(an)*d*3,vy:-Math.sin(an)*d*2,life:.3,s0:r.range(2,3.4),s1:.8,rot:r.range(0,TAU),vr:r.range(-5,5),shape:'petal',c:PA,c2:PB,a:.9,tag:'z15'})}
  }
  /* 4 hạt giống → cuống → hoa */
  [[-62,66,-6],[-36,40,-3],[38,46,4],[64,76,7]].forEach((f,i)=>{
   const la=TH-.14+i*.03,t0=la-.34,lx=tc+f[0]*sc*(miss?.6:1),open0=TH+i*.02;
   if(t>=t0&&t<la){
    const k=ph(t,t0,la),pos=q=>[hx+(lx-hx)*q,hy+(GY-1-hy)*q-Math.sin(q*Math.PI)*(54+10*i)],hd=pos(k),pts=[];
    for(let j=0;j<=8;j++)pts.push(pos(Math.max(0,k-(8-j)*.045)));
    E.ribbon(g,pts,q=>1+6*q,PA,.8,{core:PB});
    const nx=pos(Math.min(1,k+.03));seedAt(g,hd[0],hd[1],4.4,Math.atan2(nx[1]-hd[1],nx[0]-hd[0]),1);
    for(let n=E.rate(s,'sd'+i,k,26);n>0;n--)E.emit({x:hd[0]+r.range(-3,3),y:hd[1]+r.range(-3,3),vx:-dir*r.range(8,30),vy:r.range(-16,20),gy:40,life:r.range(.3,.55),s0:r.range(1.4,2.4),s1:.4,shape:r()<.35?'petal':'orb',c:PA,c2:PB,a:.95,add:true,tag:'z15',rot:r.range(0,TAU),vr:r.range(-4,4)});
   }
   if(t>=la){
    if(E.once(s,'ls'+i)){const rb=E.rng(sd+i*71);E.burst(rb,lx,GY-3,miss?4:8,{speed:[30,120],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,2.6],life:[cap(.4),cap(.8)],gy:240,drag:.4,shape:'orb',c:PA,c2:PB,a:1,add:true,tag:'z15'})}
    const e=ph(t,la,la+.3);E.wave(g,lx,GY,4+26*eo(e),PA,(1-e)*.7,1.3,{seed:sd+i,t:T,sq:.3});
    const grow=eo(ph(t,la,la+.24)),Hm=f[1]*sc*(miss?.7:1),tip=stem(g,lx,Hm,f[2],grow,vis,t,sd+i*17);
    if(tip){
     const op=t<open0?.18*grow:.18+.82*E.eBack(ph(t,open0,open0+.42));
     blossom(g,tip[0],tip[1],(20+6*(i%2))*sc,clamp(op,0,1),vis,t*.5+i,.82,t);
     if(t>=open0+.05&&E.once(s,'bp'+i)){const rb=E.rng(sd+900+i*37);
      E.burst(rb,tip[0],tip[1],miss?5:14,{speed:[30,140],ang:[0,TAU],size:[3,5],life:[cap(.8),cap(1.5)],gy:50,drag:.6,shape:'petal',c:PA,c2:PB,a:1,tag:'z15',vr:[-6,6],fl:10});
      E.burst(rb,tip[0],tip[1],miss?5:16,{speed:[10,70],ang:[0,TAU],size:[1.2,2.4],life:[cap(.8),cap(1.4)],gy:-24,drag:.6,shape:'orb',c:PC,c2:'#fff4c0',a:1,add:true,tag:'z15'})}
    }
   }
  });
  /* trúng: sóng hồng, phấn hoa, cánh hoa tản */
  if(t>=TH-.02){
   const p=ph(t,TH,TH+.6);
   if(E.once(s,'hit')){const rb=E.rng(sd^0x3f5);
    E.burst(rb,tc,GY-40,miss?10:30,{speed:[40,190],ang:[0,TAU],size:[3,5.5],life:[cap(.8),cap(1.5)],gy:50,drag:.6,shape:'petal',c:PA,c2:PB,a:1,tag:'z15',vr:[-8,8],fl:11});
    E.burst(rb,tc,GY-30,miss?10:34,{speed:[20,120],ang:[0,TAU],size:[1.2,2.6],life:[cap(.8),cap(1.5)],gy:-24,drag:.6,shape:'orb',c:PC,c2:'#fff4c0',a:1,add:true,tag:'z15'})}
   E.wave(g,tc,GY,8+(miss?60:100)*eo(p),PA,(1-p)*.8,2,{seed:sd+3,t:T,sq:.28});
   E.wave(g,tc,GY,6+(miss?36:64)*eo(ph(t,TH+.04,TH+.54)),PB,(1-ph(t,TH+.14,TH+.58))*.6,1.3,{seed:sd+4,t:T,sq:.28});
   E.glow(g,tc,GY-24,56*sc,PA,.26*(1-p));
   for(let n=E.rate(s,'pl',ph(t,TH,TH+1),miss?14:46);n>0;n--)E.emit({x:tc+r.range(-70,70)*sc,y:GY-r.range(0,60),vx:r.range(-8,8),vy:-r.range(8,40),gy:-4,drag:.4,life:cap(r.range(.7,1.3)),s0:r.range(1.2,2.4),s1:.4,shape:'orb',c:PC,c2:'#fff4c0',a:.95,add:true,tag:'z15'});
  }
  E.draw(g,'z15');
 }
 function butterfly(g,x,y,s,flap,a,c1,c2){
  if(a<=.02)return;
  g.save();g.translate(x,y);g.globalAlpha=Math.min(1,a);g.globalCompositeOperation='lighter';
  for(const sg of[-1,1]){
   g.fillStyle=E.rgba(c1,.85);g.beginPath();g.ellipse(sg*s*.55,-s*.25,s*.62*Math.abs(flap)+.4,s*.8,sg*-.4,0,TAU);g.fill();
   g.fillStyle=E.rgba(c2,.7);g.beginPath();g.ellipse(sg*s*.4,s*.45,s*.4*Math.abs(flap)+.3,s*.5,sg*.4,0,TAU);g.fill();
  }
  g.fillStyle=E.rgba('#ffffff',.9);g.fillRect(-.6,-s*.4,1.2,s*1.1);
  g.restore();
  E.glow(g,x,y,s*2,c1,.3*a);
 }
 /* lớp bổ sung: mưa hạt giống nhỏ → hoa nhỏ, thảm hoa dọc đường bay, ấn hoa mandala, bão cánh hoa, bướm sáng, cánh rơi dư ảnh */
 function bloomX(g,T,t,pa,miss,cr,s){
  const dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),hk=miss?.6:1,sd=s.seed,r=E.rng(sd^0xa2d),
   cap=l=>Math.max(.12,Math.min(l,END-t)),hx=x0+dir*26,vis=1-ph(t,1.3,END);
  /* thảm hoa nhỏ mọc dọc đường bay */
  for(let i=0;i<9;i++){
   const f=i/8,gx=hx+(tc-hx)*(.12+.88*f)+(hs(i+sd%9)-.5)*8;
   if(Math.abs(gx-tc)<34*sc)continue;
   const t0=.14+f*.42,gk=eo(ph(t,t0,t0+.2));if(gk<=.02)continue;
   const tip=stem(g,gx,(8+10*hs(i+3))*gk,(hs(i+8)-.5)*6,gk,vis*.95,t,sd+i);
   if(tip)blossom(g,tip[0],tip[1],(5+3*hs(i+5))*gk,clamp(ph(t,t0+.06,t0+.3),0,1),vis*.95,t*.6+i,.8,t);
  }
  /* mưa hạt giống nhỏ rơi quanh quái → hoa nhỏ */
  [-124,-104,-86,90,108,126].forEach((ox,i)=>{
   const t0=.16+i*.06,la=t0+.3,lx=tc+ox*sc*(miss?.6:1),fall=ph(t,t0,la);
   if(t>=t0&&t<la){
    const pts=[];for(let j=0;j<=6;j++){const f2=Math.max(0,fall-(6-j)*.05);pts.push([lx-dir*22*(1-f2),-24+(GY+23)*f2*f2])}
    E.ribbon(g,pts,q=>1+4*q,PA,.8,{core:PB});const hd=pts[6];seedAt(g,hd[0],hd[1],3.4,Math.PI/2,.9);
   }
   if(t>=la){
    if(E.once(s,'sl'+i)){const rb=E.rng(sd+400+i*43);E.burst(rb,lx,GY-3,miss?3:6,{speed:[30,110],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.2,2.4],life:[cap(.4),cap(.8)],gy:240,drag:.4,shape:'orb',c:PA,c2:PB,a:1,add:true,tag:TG})}
    const e=ph(t,la,la+.26);E.wave(g,lx,GY,3+20*eo(e),PA,(1-e)*.65,1.2,{seed:sd+i,t:T,sq:.3});
    const grow=eo(ph(t,la,la+.2)),tip=stem(g,lx,(18+12*hs(i+4))*sc*grow,(i%2?1:-1)*4,grow,vis*.95,t,sd+50+i*9);
    if(tip)blossom(g,tip[0],tip[1],(9+3*hs(i+6))*sc,clamp(ph(t,TH+i*.03,TH+i*.03+.4),0,1)*.9+.1*grow,vis*.95,t*.5+i,.82,t);
   }
  });
  if(t>=TH-.12){
   /* ấn hoa mandala dưới đất */
   const ma=ph(t,TH-.1,TH+.2)*(1-ph(t,1.2,END)),mo=ph(t,TH-.1,TH+.35);
   if(ma>0&&!miss)blossom(g,tc,GY+1,80*sc,clamp(mo,0,1),.5*ma,t*.35,.28,t);
   for(let k=0;k<2;k++)E.wave(g,tc,GY,8+(miss?60:(124-k*30))*eo(ph(t,TH+.08+k*.05,TH+.85)),[PB,PA][k],(1-ph(t,TH+.22+k*.05,TH+.85))*(.7-k*.1),1.8-k*.4,{seed:sd+20+k,t:T,sq:.28});
   /* bão cánh hoa xoáy lên */
   {const pa2=ph(t,TH,TH+.14)*(1-ph(t,TH+.8,1.4)),tau=ph(t,TH,TH+1.1);
    if(pa2>0&&!miss)for(let i=0;i<30;i++){
     const an=i*2.4+t*(4+hs(i)*2),rad=(34+44*hs(i+4))*(.5+.5*eo(tau)),x=tc+Math.cos(an)*rad*1.15,y=GY-10-tau*(40+110*hs(i+7))+Math.sin(an)*rad*.26,sz=2.6+1.8*hs(i+9);
     g.save();g.translate(x,y);g.rotate(an*2+i);g.scale(1,.45+.55*Math.abs(Math.cos(t*7+i)));g.globalAlpha=pa2*.85;g.fillStyle=E.rgba(i%3?PA:PB,.95);
     g.beginPath();g.moveTo(-sz,0);g.bezierCurveTo(-sz*.4,-sz*.9,sz*.8,-sz*.7,sz*1.1,0);g.bezierCurveTo(sz*.8,sz*.7,-sz*.4,sz*.9,-sz,0);g.fill();g.restore()}}
   /* bướm sáng bay vòng */
   for(let i=0;i<6;i++){
    const ba=ph(t,TH-.02+i*.03,TH+.2)*(1-ph(t,1.4,END));if(ba<=0||miss&&i>2)continue;
    const an=t*(1.3+.25*hs(i))+i*1.1,R=(44+50*hs(i+3))*sc,x=tc+Math.cos(an)*R*1.1,y=GY-50-hs(i+7)*70+Math.sin(an*1.4)*12;
    butterfly(g,x,y,5+2*hs(i+1),Math.sin(t*26+i*2),ba,i%2?PA:PC,PB);
   }
   /* cánh hoa rơi dư ảnh + cánh nằm trên đất */
   {const fa=ph(t,TH+.4,TH+.6)*(1-ph(t,1.3,END));
    if(fa>0&&!miss){g.save();g.globalAlpha=fa*.8;
     for(let i=0;i<14;i++){const x=tc+(hs(i+sd%9)-.5)*150,y=GY+1+hs(i+4)*5,sz=2.2+1.6*hs(i+7);g.fillStyle=E.rgba(i%2?PA:PB,1);g.beginPath();g.ellipse(x,y,sz*1.2,sz*.5,hs(i+2)*3,0,TAU);g.fill()}
     g.restore()}}
   for(let n=E.rate(s,'fp',ph(t,TH+.1,1.3),miss?8:26);n>0;n--)E.emit({x:tc+r.range(-100,100)*sc,y:GY-r.range(100,150),vx:r.range(-10,10),vy:r.range(10,30),gy:8,drag:.5,life:cap(r.range(.8,1.4)),s0:r.range(2.4,4),s1:2,rot:r.range(0,TAU),vr:r.range(-3,3),shape:'petal',c:PA,c2:PB,a:.95,fl:r.range(5,9),tag:TG});
   for(let n=E.rate(s,'rise',ph(t,TH,TH+1),miss?10:36);n>0;n--)E.emit({x:tc+r.range(-84,84)*sc,y:GY-r.range(0,14),vx:r.range(-6,6),vy:-r.range(30,90),gy:-8,drag:.4,life:cap(r.range(.7,1.3)),s0:r.range(1.2,2.4),s1:.4,shape:r()<.3?'spark':'orb',c:PC,c2:'#fff4c0',a:1,add:true,tag:TG,rot:r.range(0,TAU),vr:r.range(-3,3)});
  }
  E.draw(g,TG);
 }

 /* ================= 16 THẦN ĐIỆN (xa): trụ sáng thần giáng từ trời kèm pháp trận vàng dưới đất =================
    Tụ lực: vầng sáng + lông vũ xoay quanh tay, pháp trận vàng được vẽ ra dưới chân quái (vòng chia 24 đoạn, rune, sao 6 cánh quay ngược).
    3 trụ sáng giáng từ trời (2 trụ bên sáng rõ, trụ giữa lõi rỗng để quái vẫn thấy), đập đất tóe sóng vàng.
    Trúng: lông vũ ánh sáng bay lên, pháp trận TAN dần từng đoạn rồi biến mất. */
 const GA='#ffd24a',GB='#fff2a8',GC='#ff9a2e',GD='#8a5a10',GW='#fffbe8';
 function feather(g,x,y,L,ang,a,c1,c2,lighter){
  if(a<=.02||L<3)return;
  g.save();g.translate(x,y);g.rotate(ang);if(lighter)g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,a);
  const W=L*.2,gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(.7,c2);gr.addColorStop(1,E.rgba(c2,.15));
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*.2,-W,L*.7,-W*1.1,L,0);g.bezierCurveTo(L*.7,W*1.1,L*.2,W,0,0);g.fill();
  g.strokeStyle=E.rgba(GW,.8);g.lineWidth=1;g.beginPath();g.moveTo(-L*.08,0);g.lineTo(L*.98,0);g.stroke();
  g.strokeStyle=E.rgba(GW,.35);g.lineWidth=.8;g.beginPath();
  for(let j=1;j<=5;j++){const xx=L*(.15+.14*j),wy=W*.85*(1-j/7);g.moveTo(xx,0);g.lineTo(xx+L*.12,-wy);g.moveTo(xx,0);g.lineTo(xx+L*.12,wy)}
  g.stroke();
  g.restore();
 }
 /* pháp trận: dis 0..1 = tan dần từng đoạn (24 đoạn) */
 function sigil(g,x,y,R,sq,rot,a,dis,t){
  if(a<=.02||R<4)return;
  const seg=i=>clamp(1-(dis*1.25-i/24)*5,0,1);
  g.save();g.translate(x,y);g.scale(1,sq);g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  g.save();g.rotate(rot);
  for(let i=0;i<24;i++){
   const k=seg(i)*a;if(k<=.02)continue;
   const a0=i*TAU/24+.02,a1=(i+1)*TAU/24-.02,am=(a0+a1)/2,rr=R*.72,px=Math.cos(am)*rr,py=Math.sin(am)*rr,sz=R*.05;
   g.strokeStyle=E.rgba(GA,.85*k);g.lineWidth=2.2;g.beginPath();g.arc(0,0,R,a0,a1);g.stroke();
   g.strokeStyle=E.rgba(GB,.6*k);g.lineWidth=1.1;g.beginPath();g.arc(0,0,R*.86,a0,a1);g.stroke();
   g.strokeStyle=E.rgba(GA,.7*k);g.lineWidth=1.2;g.beginPath();g.moveTo(Math.cos(a0)*R*.86,Math.sin(a0)*R*.86);g.lineTo(Math.cos(a0)*R*1.06,Math.sin(a0)*R*1.06);g.stroke();
   g.strokeStyle=E.rgba(GB,.85*k);g.lineWidth=1;g.beginPath();
   if(i%3===0){g.moveTo(px-sz,py);g.lineTo(px+sz,py);g.moveTo(px,py-sz);g.lineTo(px,py+sz)}
   else if(i%3===1){g.moveTo(px,py-sz);g.lineTo(px+sz,py+sz);g.lineTo(px-sz,py+sz);g.closePath()}
   else{g.moveTo(px+sz,py);g.arc(px,py,sz,0,TAU)}
   g.stroke();
  }
  g.restore();
  const kk=clamp(1-dis*1.6,0,1)*a;
  if(kk>.02){
   g.save();g.rotate(-rot*1.4);g.strokeStyle=E.rgba(GA,.8*kk);g.lineWidth=1.5;
   for(let k2=0;k2<2;k2++){g.beginPath();for(let i=0;i<3;i++){const an=k2*Math.PI/3-Math.PI/2+i*TAU/3,px=Math.cos(an)*R*.58,py=Math.sin(an)*R*.58;i?g.lineTo(px,py):g.moveTo(px,py)}g.closePath();g.stroke()}
   g.restore();
   g.strokeStyle=E.rgba(GB,.7*kk);g.lineWidth=1.2;g.beginPath();g.arc(0,0,R*.3,0,TAU);g.stroke();
   g.save();g.rotate(t*1.2);g.strokeStyle=E.rgba(GA,.8*kk);g.lineWidth=1;
   for(let i=0;i<12;i++){const an=i*TAU/12;g.beginPath();g.moveTo(Math.cos(an)*R*.12,Math.sin(an)*R*.12);g.lineTo(Math.cos(an)*R*.26,Math.sin(an)*R*.26);g.stroke()}
   g.restore();
  }
  g.restore();
 }
 /* trụ sáng: từ yTop (mờ dần) tới yBot (đậm), chân hơi loe; hollow = lõi mờ, 2 thành sáng */
 function pillar(g,x,w,yTop,yBot,a,hollow){
  if(a<=.02||yBot-yTop<4)return;
  g.save();g.globalCompositeOperation='lighter';
  const wb=w*1.22,gr=g.createLinearGradient(0,yTop,0,yBot);gr.addColorStop(0,E.rgba(GA,0));gr.addColorStop(.35,E.rgba(GA,.35*a));gr.addColorStop(1,E.rgba(GB,.75*a));
  g.fillStyle=gr;g.globalAlpha=hollow?.38:1;
  g.beginPath();g.moveTo(x-w/2,yTop);g.lineTo(x+w/2,yTop);g.lineTo(x+wb/2,yBot);g.lineTo(x-wb/2,yBot);g.closePath();g.fill();g.globalAlpha=1;
  const g2=g.createLinearGradient(0,yTop,0,yBot);g2.addColorStop(0,E.rgba(GB,0));g2.addColorStop(.5,E.rgba(GB,.5*a));g2.addColorStop(1,E.rgba(GW,.9*a));
  g.strokeStyle=g2;g.lineWidth=hollow?2.2:1.4;g.beginPath();g.moveTo(x-w/2,yTop);g.lineTo(x-wb/2,yBot);g.moveTo(x+w/2,yTop);g.lineTo(x+wb/2,yBot);g.stroke();
  g.restore();
 }
 function divineRun(g,T,t,pa,miss,cr,s){
  const dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),sd=s.seed,r=E.rng(sd^0xc16),
   cap=l=>Math.max(.12,Math.min(l,END-t)),hx=x0+dir*26,hy=150;
  /* tụ lực: vầng sáng + lông vũ xoay quanh tay */
  const ch=ph(t,0,.28),co=1-ph(t,.28,.46);
  if(t<.5){
   E.glow(g,hx,hy,(14+22*eo(ch))*co,GA,.55*co);
   star4(g,hx,hy,10+14*eo(ch),GB,.8*co,t*3);
   for(let i=0;i<5;i++){const an=t*6+i*TAU/5,d=(1-ch)*28+9;feather(g,hx+Math.cos(an)*d,hy+Math.sin(an)*d*.8,8+6*ch,an+1.6,(.4+.5*ch)*co,GA,GB,true)}
   E.wave(g,x0,GY,8+26*eo(ch),GA,.7*co,1.5,{seed:sd,t:T,sq:.3});
   for(let n=E.rate(s,'ch',ph(t,0,.28),36);n>0;n--){const an=r.range(0,TAU),d=r.range(34,60);E.emit({x:hx+Math.cos(an)*d,y:hy+Math.sin(an)*d*.7,vx:-Math.cos(an)*d*3,vy:-Math.sin(an)*d*2,life:.3,s0:r.range(1.6,2.6),s1:.5,shape:'orb',c:GA,c2:GB,a:.9,add:true,tag:'z16'})}
  }
  /* pháp trận vàng dưới đất, tan dần từng đoạn sau khi trúng */
  const sa=ph(t,.14,.4)*(1-ph(t,1.4,END)),sr=(miss?60:88)*sc*eo(ph(t,.14,.46)),dis=ph(t,TH+.3,TH+.85);
  E.glow(g,tc,GY,sr*.9,GA,.18*sa*(1-dis));
  sigil(g,tc,GY+2,sr,.3,t*.7,sa,dis,t);
  if(dis>0&&dis<1)for(let n=E.rate(s,'dm',dis,miss?16:46);n>0;n--){const an=r.range(0,TAU);E.emit({x:tc+Math.cos(an)*sr,y:GY+2+Math.sin(an)*sr*.3,vx:r.range(-8,8),vy:-r.range(14,50),gy:-6,drag:.4,life:cap(r.range(.5,1)),s0:r.range(1.2,2.4),s1:.4,shape:'orb',c:GA,c2:GB,a:.95,add:true,tag:'z16'})}
  /* 3 trụ sáng giáng từ trời */
  const pv=1-ph(t,TH+.38,TH+.85);
  [[-52,13,TH-.34,0],[52,13,TH-.3,0],[0,38,TH-.24,1]].forEach((q,i)=>{
   const x=tc+q[0]*sc*(miss?.7:1),w=q[1]*sc,t0=q[2],a=ph(t,t0,TH-.02);
   if(t<t0||pv<=0)return;
   const yB=-30+(GY+30)*E.eIn(a),yT=a>=1?-40:Math.max(-40,yB-170);
   pillar(g,x,w,yT,yB,pv,!!q[3]);
   E.glow(g,x,yB,16*sc,GB,.5*pv);
   if(a>=1){
    if(E.once(s,'ld'+i)){const rb=E.rng(sd+300+i*47);
     E.burst(rb,x,GY-4,miss?6:16,{speed:[40,170],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,3],life:[cap(.4),cap(.9)],gy:320,drag:.3,shape:'orb',c:GA,c2:GB,a:1,add:true,tag:'z16',floor:GY+3,bounce:.3})}
    const e=ph(t,TH-.02,TH+.4);E.wave(g,x,GY,5+(q[3]?46:30)*eo(e),GA,(1-e)*.75,1.5,{seed:sd+i,t:T,sq:.3});
   }
  });
  /* trúng */
  if(t>=TH-.02){
   const p=ph(t,TH,TH+.6);
   if(E.once(s,'hit')){const rb=E.rng(sd^0x6c2);
    E.burst(rb,tc,GY-30,miss?8:26,{speed:[30,130],ang:[-Math.PI*.95,-Math.PI*.05],size:[4,7],life:[cap(1),cap(1.6)],gy:-26,drag:.8,shape:'leaf',c:GA,c2:GB,a:1,add:true,tag:'z16',vr:[-3,3]});
    E.burst(rb,tc,GY-12,miss?10:34,{speed:[50,220],ang:[-Math.PI*.97,-Math.PI*.03],size:[1.6,3.4],life:[cap(.5),cap(1.1)],gy:300,drag:.4,shape:'orb',c:GA,c2:GB,a:1,add:true,tag:'z16',floor:GY+3,bounce:.3});
    E.burst(rb,tc,GY-30,miss?6:20,{speed:[20,120],ang:[0,TAU],size:[1.4,2.8],life:[cap(.7),cap(1.3)],gy:-10,drag:.7,shape:'spark',c:GB,c2:'#ffffff',a:1,add:true,tag:'z16',vr:[-5,5]})}
   for(let k=0;k<3;k++)E.wave(g,tc,GY,8+(miss?60:(112-k*24))*eo(ph(t,TH+k*.04,TH+.85)),[GA,GB,GC][k],(1-ph(t,TH+.2+k*.04,TH+.85))*(.8-k*.1),2-k*.4,{seed:sd+k+5,t:T,sq:.28});
   E.glow(g,tc,GY-8,70*sc,GA,.3*(1-ph(t,TH+.05,TH+.55)));
   for(let n=E.rate(s,'fr',ph(t,TH,TH+1),miss?8:22);n>0;n--){const an=r.range(0,TAU),d=r.range(0,sr*.9);E.emit({x:tc+Math.cos(an)*d,y:GY+Math.sin(an)*d*.3,vx:r.range(-10,10),vy:-r.range(30,80),gy:-6,drag:.5,life:cap(r.range(.9,1.5)),s0:r.range(3.4,5.6),s1:2,rot:r.range(0,TAU),vr:r.range(-2,2),shape:'leaf',c:GA,c2:GB,a:.95,add:true,tag:'z16'})}
  }
  E.draw(g,'z16');
 }
 /* lớp bổ sung: 6 giáo ánh sáng cắm đất, đôi cánh sáng hai bên quái, vòng hào quang, tia sáng từ trời, vệt thánh quang ở lại, lông vũ rơi chậm */
 function divineX(g,T,t,pa,miss,cr,s){
  const dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),hk=miss?.6:1,sd=s.seed,r=E.rng(sd^0xc2e),
   cap=l=>Math.max(.12,Math.min(l,END-t));
  /* giáo ánh sáng rơi quanh quái, cắm đất rồi tan */
  [-122,-100,-82,86,104,124].forEach((ox,i)=>{
   const t0=TH-.36+i*.05,la=t0+.26,lx=tc+ox*sc*(miss?.6:1),fall=ph(t,t0,la),sv=1-ph(t,TH+.55,TH+1.0);
   if(t<t0||sv<=0)return;
   if(t<la){
    const pts=[];for(let j=0;j<=6;j++){const f2=Math.max(0,fall-(6-j)*.05);pts.push([lx-dir*20*(1-f2),-30+(GY+30)*f2*f2])}
    E.ribbon(g,pts,q=>1+4*q,GA,.85,{core:GB});const hd=pts[6];star4(g,hd[0],hd[1],6,GB,.9,t*8+i);
   }else{
    if(E.once(s,'lc'+i)){const rb=E.rng(sd+500+i*43);E.burst(rb,lx,GY-3,miss?4:9,{speed:[30,140],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,2.8],life:[cap(.4),cap(.9)],gy:300,drag:.3,shape:'orb',c:GA,c2:GB,a:1,add:true,tag:TG,floor:GY+3,bounce:.3})}
    const e=ph(t,la,la+.3);E.wave(g,lx,GY,4+24*eo(e),GA,(1-e)*.7,1.3,{seed:sd+60+i,t:T,sq:.3});
    const L=(48+10*hs(i+sd%5))*sc*eo(ph(t,la,la+.12));
    g.save();g.globalCompositeOperation='lighter';
    const gr=g.createLinearGradient(0,GY,0,GY-L);gr.addColorStop(0,E.rgba(GB,.9*sv));gr.addColorStop(1,E.rgba(GA,0));
    g.fillStyle=gr;g.beginPath();g.moveTo(lx-3,GY);g.lineTo(lx,GY-L);g.lineTo(lx+3,GY);g.closePath();g.fill();g.restore();
    E.glow(g,lx,GY-L*.4,12,GA,.3*sv);
   }
  });
  if(t>=TH-.04){
   /* đôi cánh sáng hai bên quái */
   const open=eo(ph(t,TH-.04,TH+.36)),life=1-ph(t,TH+.5,1.15);
   if(open>0&&life>0&&!miss)for(const sg of[-1,1]){
    const bx=tc+sg*28*sc,by=GY-62*sc;
    for(let j=0;j<6;j++){
     const ang=(sg>0?-.15-j*.2:Math.PI+.15+j*.2)+sg*Math.sin(t*5+j)*.04,L=(62-6*j)*sc*open;
     feather(g,bx,by,L,ang,.55*life,GA,GB,true);
    }
   }
   /* vòng hào quang trên đầu quái */
   {const ha=ph(t,TH+.05,TH+.25)*(1-ph(t,TH+.6,1.3));
    if(ha>0){E.wave(g,tc,GY-132*sc,(20+8*Math.sin(t*5))*sc,GA,.85*ha,1.6,{sq:.28,seed:sd+70,t:T});E.glow(g,tc,GY-132*sc,26*sc,GA,.3*ha)}}
   /* tia sáng từ trời */
   {const ra=ph(t,TH-.1,TH+.15)*(1-ph(t,TH+.5,1.1));
    if(ra>0){g.save();g.globalCompositeOperation='lighter';
     for(let i=0;i<6;i++){const xx=tc+(-90+36*i)*sc*hk+Math.sin(t*1.5+i)*5,gr=g.createLinearGradient(0,0,0,GY);gr.addColorStop(0,E.rgba(GB,.2*ra));gr.addColorStop(1,E.rgba(GA,0));
      g.fillStyle=gr;g.beginPath();g.moveTo(xx-4,0);g.lineTo(xx+8,0);g.lineTo(xx+30,GY);g.lineTo(xx-22,GY);g.closePath();g.fill()}
     g.restore()}}
   /* vệt thánh quang ở lại trên đất rồi tan */
   {const gs=ph(t,TH,TH+.2)*(1-ph(t,1.35,END));
    if(gs>0&&!miss){g.save();g.lineCap='round';g.lineJoin='round';g.globalCompositeOperation='lighter';
     for(let i=0;i<8;i++){const an=i*TAU/8+.3,L=(40+60*hs(i+3))*sc,rb=E.rng(sd+600+i),pp=E.jag(rb,tc+Math.cos(an)*16,GY+2,tc+Math.cos(an)*L*1.3,GY+2+Math.sin(an)*L*.18,5,2.6);
      g.strokeStyle=E.rgba(GA,.75*gs);g.lineWidth=1.3;strokePts(g,pp)}
     g.restore()}}
   for(let n=E.rate(s,'sp',ph(t,TH,TH+1),miss?12:40);n>0;n--)E.emit({x:tc+r.range(-80,80)*sc,y:GY-r.range(0,14),vx:r.range(-6,6),vy:-r.range(30,100),gy:-8,drag:.4,life:cap(r.range(.7,1.4)),s0:r.range(1.2,2.6),s1:.4,shape:r()<.4?'spark':'orb',c:GA,c2:GB,a:1,add:true,tag:TG,rot:r.range(0,TAU),vr:r.range(-4,4)});
   for(let n=E.rate(s,'ff',ph(t,TH+.1,1.35),miss?6:18);n>0;n--)E.emit({x:tc+r.range(-100,100)*sc,y:GY-r.range(120,170),vx:r.range(-8,8),vy:r.range(8,26),gy:6,drag:.5,life:cap(r.range(.8,1.4)),s0:r.range(3,5),s1:2,rot:r.range(0,TAU),vr:r.range(-2,2),shape:'leaf',c:GA,c2:GB,a:.9,add:true,tag:TG});
  }
  E.draw(g,TG);
 }

 const ZF={14:wrap('sky',skyRun,skyX),15:wrap('bloom',bloomRun,bloomX),16:wrap('divine',divineRun,divineX)};
 const ATK_SPECIAL=/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng/;
 const NOCODE_ATK=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/,
  NOCODE_IMP=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích|Xuyên giáp|Liên kích -|Phong Nhận(?: chém| -)|Dương Diệm|Thần Phán|Tinh Quang|Thiên Uy|Sương Tán/,
  IMP_SPECIAL=/Khiên hấp thụ|Chắn đòn|hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh|Hút máu|Lôi Phạt|Lôi Kích -|Dung Nham|Thiêu đốt|Xích Diệm/;
 API.drawAttack=function(g,T,S){
  try{
   const idx=zi(S.s),text=S.text||'';
   if(ZF[idx]&&S.cl!==3&&!ATK_SPECIAL.test(text)&&!NOCODE_ATK.test(text))return ZF[idx](g,T,S);
  }catch(e){window.__fxErr='38: '+(e&&e.message);if(window.__ATK17_DEBUG)throw e}
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
  }catch(e){window.__fxErr='38i: '+(e&&e.message);if(window.__ATK17_DEBUG)throw e}
  return prevI(g,fx,T);
 };
 API.codeZone=i=>!!ZF[zi(i)]||prevCZ(i);
 API.setFxStyle=v=>{STY=v==='sm'?'sm':'px';if(prevSty)prevSty(v)};
}
boot();
})();
