/* ===== 39-attack-fx-2d-detail.js — [FX 2D++] Lớp CHI TIẾT THÊM + BÙNG NỔ cho vùng 14 (Thiên Không), 15 (Linh Hoa Viên), 16 (Thần Điện) =====
   Chạy SAU 38-attack-fx-2d.js: gọi bản trước (vẽ như cũ) rồi vẽ THÊM lớp mới, chỉ khi t >= lúc trúng (.665s). Hạt gắn nhãn 'dt2'. PRNG riêng (E.rng), không dùng Math.random.
   Ba vùng cuối là bậc cao nhất nên nổ nhiều đợt hơn hẳn, to hơn, nhiều chi tiết hơn các vùng trước; màu lõi đặt ở đất và hai bên quái, không chớp trắng che quái.
   14 Thiên Không: phễu lốc xoáy khổng lồ, 4 vòng gió nổ lan, 3 nhát chém gió chéo to, 4 tia sét xanh trời, mây cuộn chân, dư chấn 2 đợt, vệt gió cào đất.
   15 Linh Hoa Viên: 8 hoa nở nổ quanh đất (cột sáng + sóng), 2 cây hoa khổng lồ hai bên, vòng hoa xoay, 3 dải cánh hoa xoắn, 5 pháo hoa cánh trên không, mưa cánh hoa, thảm cánh dư ảnh.
   16 Thần Điện: thần luân (bánh xe sáng) sau lưng quái, 4 vòng ấn rune bay lên thành lồng sáng, 4 tia thánh lôi, 12 trụ phụ phun theo vòng pháp trận, sao thập tự trên đất,
      mảnh vàng vỡ, rune bay lên, lông vũ vàng rơi chậm, 3 đợt sóng dư chấn. */
(()=>{
'use strict';
let tries=0;
function boot(){
 const API=window.TTGCombatFX;
 if(!API||!API.engine||!API.__fx2d){if(tries++<240)setTimeout(boot,50);return}
 if(API.__fx2dd)return;
 API.__fx2dd=1;
 const prevA=API.drawAttack,prevSty=API.setFxStyle,zones=API.zones,E=API.engine;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const zi=s=>Math.max(0,Math.min(zones.length-1,Number(s)||0));
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const ph=E.ph,eo=E.eOut,TAU=Math.PI*2,GY=204,TH=.665,END=1.68,TG='dt2';
 /* ease có nảy nhẹ (tự viết, không phụ thuộc engine) */
 const eb=x=>{x=clamp(x,0,1);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
 const SA='#6ac4ff',SB='#d4f0ff',SC='#2a86ff',SD='#14408a';
 const PA='#ff7ac0',PB='#ffd6ee',PC='#ffe27a',PD='#a8265f',PG='#4fbf5a',PL='#2c7a34',PM='#a6ff9a';
 const GA='#ffd24a',GB='#fff2a8',GC='#ff9a2e',GD='#8a5a10',GW='#fffbe8';
 let STY='px',CNT=0;
 const ST={};
 /* ---- lớp pixel (giống 33-38) ---- */
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
 const strokePts=(g,p)=>{g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()};
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
 function star4(g,x,y,R,col,a,rot){
  if(a<=.01||R<1)return;
  g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.rotate(rot||0);g.fillStyle=E.rgba(col,a);
  g.beginPath();g.moveTo(0,-R);g.quadraticCurveTo(R*.1,-R*.1,R,0);g.quadraticCurveTo(R*.1,R*.1,0,R);g.quadraticCurveTo(-R*.1,R*.1,-R,0);g.quadraticCurveTo(-R*.1,-R*.1,0,-R);g.fill();g.restore();
 }
 function leaf(g,x,y,L,ang,c1,c2,a){
  if(a<=.02||L<1)return;
  g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=Math.min(1,a);
  const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,-L*.42,L,0);g.quadraticCurveTo(L*.5,L*.42,0,0);g.fill();
  g.strokeStyle=E.rgba(PM,.5);g.lineWidth=.8;g.beginPath();g.moveTo(L*.08,0);g.lineTo(L*.85,0);g.stroke();
  g.restore();
 }
 /* hoa 3 lớp cánh: open 0..1, sq = ép dẹt */
 function blossom(g,x,y,R,open,a,rot,sq,t){
  if(a<=.02||R<2||open<=.02)return;
  g.save();g.translate(x,y);g.scale(1,sq);g.rotate(rot);g.lineJoin='round';
  const LY=[[9,1,0],[7,.72,TAU/14],[5,.46,.3]];
  LY.forEach((ly,l)=>{
   const o=eo(ph(open,.05+l*.15,.55+l*.15)),n=ly[0],L=R*ly[1]*o,W=L*.44;if(o<=.02)return;
   for(let i=0;i<n;i++){
    g.save();g.rotate(i*TAU/n+ly[2]+Math.sin(t*2+i+l)*.03);g.globalAlpha=Math.min(1,a);
    const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,PD);gr.addColorStop(.55,PA);gr.addColorStop(1,PB);
    g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*.2,-W*1.1,L*.85,-W*.8,L,0);g.bezierCurveTo(L*.85,W*.8,L*.2,W*1.1,0,0);g.fill();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(PB,.6*a);g.lineWidth=1;g.stroke();
    g.restore();
   }
  });
  const o2=eo(ph(open,.3,.8)),c2=R*.14*o2;
  if(c2>1){const gr=g.createRadialGradient(0,0,0,0,0,c2);gr.addColorStop(0,PC);gr.addColorStop(1,'#ff9a3a');g.globalAlpha=Math.min(1,a);g.fillStyle=gr;g.beginPath();g.arc(0,0,c2,0,TAU);g.fill()}
  g.restore();
  E.glow(g,x,y,R*.6,PA,.4*a*Math.min(1,open*2));
 }
 function feather(g,x,y,L,ang,a,c1,c2){
  if(a<=.02||L<3)return;
  g.save();g.translate(x,y);g.rotate(ang);g.globalCompositeOperation='lighter';g.globalAlpha=Math.min(1,a);
  const W=L*.2,gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(.7,c2);gr.addColorStop(1,E.rgba(c2,.15));
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*.2,-W,L*.7,-W*1.1,L,0);g.bezierCurveTo(L*.7,W*1.1,L*.2,W,0,0);g.fill();
  g.strokeStyle=E.rgba(GB,.7);g.lineWidth=1;g.beginPath();g.moveTo(-L*.08,0);g.lineTo(L*.98,0);g.stroke();
  g.restore();
 }
 function rune(g,x,y,s,sd,a){
  if(a<=.02||s<1)return;
  g.save();g.translate(x,y);g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(GA,.9*a);g.lineWidth=1.1;g.lineCap='round';
  const n=2+Math.floor(hs(sd)*3);g.beginPath();g.moveTo(0,-s);g.lineTo(0,s);
  for(let i=0;i<n;i++){const yy=-s+(i+.5)*2*s/n,d=hs(sd+i*3)<.5?-1:1;g.moveTo(0,yy);g.lineTo(d*s*.7,yy+(hs(sd+i)-.5)*s*.8)}
  g.stroke();g.restore();
  E.glow(g,x,y,s*1.7,GA,.22*a);
 }
 /* cánh hoa rơi/nằm: ellipse nghiêng */
 function petalFlat(g,x,y,sz,rot,c,a){
  if(a<=.02)return;
  g.save();g.globalAlpha=Math.min(1,a);g.fillStyle=E.rgba(c,1);g.beginPath();g.ellipse(x,y,sz*1.2,sz*.5,rot,0,TAU);g.fill();g.restore();
 }

 const D={
 /* ===================== 14 THIÊN KHÔNG ===================== */
 14:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,keep=1-ph(t,1.3,END),r=E.rng(sd^0x14a);
  /* phễu lốc xoáy khổng lồ: chồng 9 cung elip, rộng dần lên cao */
  {const gw=eo(ph(t,TH-.02,TH+.34)),f=keep*(1-ph(t,TH+.75,1.4));
   if(gw>.02&&f>.02){g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
    for(let j=0;j<9;j++){const q=j/8,y=GY-6-q*150*k*gw,rx=(30+q*52)*k*(.7+.3*gw),sw=Math.sin(q*5+t*7)*7*q,a0=t*(11-q*5)+j*1.1;
     g.strokeStyle=E.rgba(j%2?SA:SB,(.6-.3*q)*f);g.lineWidth=2.4-1.1*q;g.beginPath();g.ellipse(tc+sw,y,rx,rx*.24,0,a0,a0+3.3);g.stroke()}
    g.restore()}}
  /* 4 vòng gió nổ lan theo mặt phẳng đứng quanh thân quái */
  for(let i=0;i<4;i++){
   const t0=TH+i*.07,p=ph(t,t0,t0+.75);if(p<=0||p>=1)continue;
   E.wave(g,tc,GY-52,8+(m?70:(150-i*18)*Math.min(k,1.3))*eo(p),[SA,SB,SC,SA][i],(1-ph(p,.3,1))*(.75-i*.1),2.4-i*.4,{sq:.95,seed:sd+i,t:T});
  }
  /* 3 nhát chém gió chéo to, lệch nhịp */
  for(let i=0;i<3;i++){
   const t0=TH-.02+i*.06,kh=ph(t,t0,t0+.14),al=1-ph(t,t0+.12,t0+.42);
   if(kh<=0||al<=0)continue;
   const rot=(i-1)*.95+(i===1?.25:0),R=(78+10*i)*k*(m?.7:1),pts=[],cs=Math.cos(rot),sn=Math.sin(rot);
   for(let j=0;j<=12;j++){const q=clamp(kh-(12-j)*.045,0,1),an=-1.15+q*2.3,x=Math.cos(an)*R,y=Math.sin(an)*R*.55;pts.push([tc+x*cs-y*sn,GY-58+x*sn+y*cs])}
   taper(g,pts,1,10,SC,.5*al,true);taper(g,pts,.6,6,i%2?SA:SB,.9*al,true);
   const hd=pts[12];E.glow(g,hd[0],hd[1],11,SB,.5*al);
   if(st.once('sl'+i)){const rb=E.rng(sd+1400+i*17);E.burst(rb,hd[0],hd[1],m?4:10,{speed:[40,170],ang:[0,TAU],size:[1.4,2.8],life:[cap(.4),cap(.8)],gy:20,drag:.8,shape:'streak',c:SA,c2:SB,a:1,add:true,tag:TG})}
  }
  /* 4 tia sét xanh trời giáng hai bên quái, chớp theo lát thời gian */
  [-96,-58,60,98].forEach((ox,i)=>{
   const t0=TH+.02+i*.06,p=ph(t,t0,t0+.2);if(p<=0||p>=1)return;
   const x=tc+ox*k*(m?.7:1),rb=E.rng(sd+1500+i*13+Math.floor(t*24)),pp=E.jag(rb,x+(i%2?-18:18),-10,x,GY-2,9,8),al=1-p;
   g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
   g.strokeStyle=E.rgba(SC,.5*al);g.lineWidth=4;strokePts(g,pp);g.strokeStyle=E.rgba(SB,.95*al);g.lineWidth=1.4;strokePts(g,pp);
   const br=E.jag(rb,pp[4][0],pp[4][1],pp[4][0]+(i%2?-34:34),pp[4][1]+34,5,5);g.strokeStyle=E.rgba(SA,.8*al);g.lineWidth=1;strokePts(g,br);
   g.restore();E.glow(g,x,GY-2,16*k,SA,.4*al);
   if(st.once('bt'+i)){const rb2=E.rng(sd+1600+i*19);E.burst(rb2,x,GY-4,m?4:9,{speed:[40,170],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,2.8],life:[cap(.4),cap(.9)],gy:240,drag:.4,shape:'orb',c:SA,c2:SB,a:1,add:true,tag:TG,floor:GY+3,bounce:.3})}
  });
  /* tia sáng trời xanh chéo */
  {const a=ph(t,TH,TH+.2)*(1-ph(t,1.2,1.6))*.2;
   if(a>0){g.save();g.globalCompositeOperation='lighter';
    for(let i=0;i<3;i++){const x=tc+(-80+80*i)*k+Math.sin(t*1.7+i)*6,gr=g.createLinearGradient(0,0,0,GY);gr.addColorStop(0,E.rgba(SB,a));gr.addColorStop(1,E.rgba(SA,0));
     g.fillStyle=gr;g.beginPath();g.moveTo(x-5,0);g.lineTo(x+9,0);g.lineTo(x+40,GY);g.lineTo(x-24,GY);g.closePath();g.fill()}
    g.restore()}}
  /* dư chấn 2 đợt trên đất + mây cuộn chân */
  [.45,.8].forEach((dl,i)=>{
   const p=ph(t,TH+dl,TH+dl+.55);if(p<=0||p>=1)return;
   E.wave(g,tc,GY,8+(m?60:(120-i*25)*Math.min(k,1.3))*eo(p),i?SA:SC,(1-p)*.65,1.8,{seed:sd+60+i,t:T,sq:.28});
   if(st.once('af'+i)){const rb=E.rng(sd+1700+i*23);
    E.burst(rb,tc,GY-10,m?6:16,{speed:[30,150],ang:[-Math.PI*.97,-Math.PI*.03],size:[1.6,3],life:[cap(.5),cap(1)],gy:140,drag:.6,shape:'orb',c:SA,c2:SB,a:1,add:true,tag:TG,floor:GY+3,bounce:.25});
    E.burst(rb,tc,GY-12,m?3:8,{speed:[10,50],ang:[-Math.PI*.9,-Math.PI*.1],size:[14,24],life:[cap(.9),cap(1.4)],gy:-12,drag:.8,shape:'mist',c:'#9ccaf5',a:.65,tag:TG})}
  });
  /* vệt gió cào đất, tan dần */
  {const gs=ph(t,TH,TH+.12)*(1-ph(t,1.3,END));
   if(gs>0&&!m){g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
    for(let i=0;i<10;i++){const L=(26+14*(i%3))*k,xx=tc+(hs(i+sd%9)-.5)*180,yy=GY+1+i*.9;g.strokeStyle=E.rgba(i%2?SA:SB,.7*gs);g.lineWidth=1.3;g.beginPath();g.moveTo(xx-L,yy);g.lineTo(xx+L,yy);g.stroke()}
    g.restore()}}
  /* hạt gió xoáy tỏa lên theo hình phễu */
  for(let n=st.rate('sw',ph(t,TH,1.25),m?26:78);n>0;n--){
   const an=r.range(0,TAU),d=r.range(16,70)*k;
   E.emit({x:tc+Math.cos(an)*d,y:GY-r.range(0,12),vx:-Math.sin(an)*r.range(60,150),vy:-r.range(30,90),gy:-6,drag:.5,life:cap(r.range(.5,1)),s0:r.range(1.4,2.6),s1:.4,shape:r()<.5?'streak':'orb',c:SA,c2:SB,a:.95,add:true,tag:TG});
  }
  E.draw(g,TG);
 },
 /* ===================== 15 LINH HOA VIÊN ===================== */
 15:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,keep=1-ph(t,1.3,END),fo=1-ph(t,1.25,1.55),kk=Math.min(k,1.3),r=E.rng(sd^0x15d);
  /* 8 hoa nở nổ quanh đất, lần lượt, mỗi hoa kèm sóng + cột sáng mềm */
  for(let i=0;i<8;i++){
   const an=i*TAU/8+.3,d=(52+46*hs(i+sd%7))*k,x=tc+Math.cos(an)*d*1.25,t0=TH+.02+i*.04,pp=ph(t,t0,t0+.34),e=eb(pp);
   if(pp<=.01)continue;
   const h=(16+14*hs(i+2))*kk*Math.min(1,e),stem=[[x,GY],[x+(hs(i+6)-.5)*8,GY-h*.5],[x,GY-h]];
   E.wave(g,x,GY,4+24*eo(pp),PA,(1-pp)*.6,1.2,{seed:sd+i,t:T,sq:.3});
   taper(g,stem,3,1.4,PG,.95*keep,false);
   blossom(g,x,GY-h-3,(10+5*hs(i+4))*kk,clamp(ph(t,t0+.06,t0+.4),0,1),keep,t*.5+i,.85,t);
   {const gr=g.createLinearGradient(0,GY,0,GY-86*e);gr.addColorStop(0,E.rgba(PA,.28*keep));gr.addColorStop(1,E.rgba(PA,0));
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;g.beginPath();g.moveTo(x-5,GY);g.lineTo(x-2,GY-86*e);g.lineTo(x+2,GY-86*e);g.lineTo(x+5,GY);g.closePath();g.fill();g.restore()}
   if(st.once('gf'+i)){const rb=E.rng(sd+1800+i*29);E.burst(rb,x,GY-h,m?3:7,{speed:[30,130],ang:[0,TAU],size:[2.6,4.6],life:[cap(.7),cap(1.3)],gy:50,drag:.6,shape:'petal',c:PA,c2:PB,a:1,tag:TG,vr:[-6,6],fl:9})}
  }
  /* 2 cây hoa khổng lồ hai bên quái */
  [-1,1].forEach((sg,vi)=>{
   const t0=TH+.06+vi*.05,grow=eo(ph(t,t0,t0+.32));if(grow<=.02)return;
   const bx=clamp(tc+sg*92*k,24,336),P0=[bx,GY],P1=[bx+sg*26,GY-70*k],P2=[bx-sg*12,GY-124*k],N=22,m2=Math.max(2,Math.floor(N*grow)),pts=[];
   for(let i=0;i<=m2;i++){const f=i/N,a=(1-f)*(1-f),b=2*f*(1-f),c=f*f;pts.push([a*P0[0]+b*P1[0]+c*P2[0]+Math.sin(f*9+vi)*2,a*P0[1]+b*P1[1]+c*P2[1]])}
   taper(g,pts,6,2,'#10361a',.95*keep,false);taper(g,pts,4.4,1.4,PG,.95*keep,false);taper(g,pts,1.2,.4,PM,.6*keep,true);
   for(let i=3;i<pts.length-1;i+=3){const p=pts[i],q=pts[i+1],an=Math.atan2(q[1]-p[1],q[0]-p[0])+(i%6<3?-1:1)*1.4;leaf(g,p[0],p[1],8+3*hs(i+vi),an,PL,PG,.95*keep)}
   const tip=pts[pts.length-1],op=clamp(ph(t,t0+.22,t0+.62),0,1);
   blossom(g,tip[0],tip[1],30*kk,eb(op),keep,t*.35+vi,.85,t);
   E.glow(g,tip[0],tip[1],34*kk,PA,.2*keep*op);
   if(op>.3&&st.once('gb'+vi)){const rb=E.rng(sd+1900+vi*37);
    E.burst(rb,tip[0],tip[1],m?8:22,{speed:[40,170],ang:[0,TAU],size:[3,5.5],life:[cap(.9),cap(1.5)],gy:50,drag:.6,shape:'petal',c:PA,c2:PB,a:1,tag:TG,vr:[-8,8],fl:10});
    E.burst(rb,tip[0],tip[1],m?6:18,{speed:[20,110],ang:[0,TAU],size:[1.2,2.6],life:[cap(.8),cap(1.4)],gy:-24,drag:.6,shape:'orb',c:PC,c2:'#fff4c0',a:1,add:true,tag:TG})}
  });
  /* vòng hoa nhỏ xoay quanh quái */
  for(let i=0;i<10;i++){
   const op=clamp(ph(t,TH+.2+i*.02,TH+.42+i*.02),0,1);if(op<=0)continue;
   const a=t*1.8+i*TAU/10,rx=(62+8*Math.sin(t*3+i))*k,x=tc+Math.cos(a)*rx,y=GY-62+Math.sin(a)*14+Math.sin(t*2+i)*5,sc=.75+.25*Math.sin(a);
   blossom(g,x,y,(7+2*hs(i+1))*sc*Math.min(k,1.2),eb(op),fo,t*.6+i,.8,t);
  }
  /* 3 dải cánh hoa xoắn bay lên quanh quái */
  for(let a3=0;a3<3;a3++){
   const tau=t-(TH+.04+a3*.05);if(tau<=0)continue;
   const pts=[],al=Math.min(1,tau*4)*fo;
   for(let j=0;j<=14;j++){const tj=Math.max(0,tau-j*.03),an=a3*2.09+tj*6,rad=(36+tj*40)*k;pts.push([tc+Math.cos(an)*rad*1.1,GY-8-tj*130+Math.sin(an)*rad*.2])}
   E.ribbon(g,pts,q=>1+5*q,[PA,PB,PC][a3],.7*al,{core:PB});
   const hd=pts[14];E.glow(g,hd[0],hd[1],8,PA,.5*al);
   if(st.once('hr'+a3)){const rb=E.rng(sd+2000+a3*41);E.burst(rb,hd[0],hd[1],m?4:10,{speed:[20,100],ang:[0,TAU],size:[2.6,4.4],life:[cap(.7),cap(1.3)],gy:30,drag:.6,shape:'petal',c:PA,c2:PB,a:1,tag:TG,vr:[-6,6],fl:8})}
  }
  /* 5 pháo hoa cánh trên không, nổ nhiều đợt */
  [[-58,-120],[54,-132],[0,-152],[-92,-92],[96,-100]].forEach((q,i)=>{
   const t0=TH+.04+i*.09,p=ph(t,t0,t0+.5);if(p<=0)return;
   const x=tc+q[0]*k*(m?.7:1),y=GY+q[1]*Math.min(k,1.2)*(m?.8:1);
   if(p<1){E.wave(g,x,y,6+44*kk*eo(p),i%2?PB:PA,(1-p)*.7,1.6,{sq:.95,seed:sd+70+i,t:T});star4(g,x,y,14*kk*(1-p),PC,.55*(1-p),t*3+i)}
   if(st.once('fw'+i)){const rb=E.rng(sd+2100+i*43);
    E.burst(rb,x,y,m?8:16,{speed:[40,150],ang:[0,TAU],size:[3,5.4],life:[cap(.9),cap(1.5)],gy:60,drag:.6,shape:'petal',c:PA,c2:PB,a:1,tag:TG,vr:[-7,7],fl:10});
    E.burst(rb,x,y,m?6:14,{speed:[30,120],ang:[0,TAU],size:[1.4,2.8],life:[cap(.7),cap(1.2)],gy:40,drag:.6,shape:'orb',c:PC,c2:'#fff4c0',a:1,add:true,tag:TG})}
  });
  /* thảm cánh hoa nằm trên đất (dư ảnh) */
  {const fa=ph(t,TH+.35,TH+.6)*keep;
   if(fa>0&&!m)for(let i=0;i<20;i++)petalFlat(g,tc+(hs(i+sd%9)-.5)*200,GY+1+hs(i+4)*5,2.2+1.6*hs(i+7),hs(i+2)*3,i%2?PA:PB,fa*.85)}
  /* mưa cánh hoa dày từ trời + phấn hoa bay lên */
  for(let n=st.rate('pr',ph(t,TH+.05,1.4),m?24:70);n>0;n--)E.emit({x:tc+r.range(-140,140)*k,y:r.range(-6,30),vx:r.range(-14,14),vy:r.range(24,54),gy:14,drag:.3,life:cap(r.range(.8,1.4)),s0:r.range(2.4,4.2),s1:1.8,rot:r.range(0,TAU),vr:r.range(-4,4),shape:'petal',c:PA,c2:PB,a:.95,fl:r.range(5,9),tag:TG});
  for(let n=st.rate('po',ph(t,TH,1.4),m?14:40);n>0;n--)E.emit({x:tc+r.range(-100,100)*k,y:GY-r.range(0,60),vx:r.range(-6,6),vy:-r.range(10,40),gy:-4,drag:.4,life:cap(r.range(.7,1.3)),s0:r.range(1.2,2.4),s1:.4,shape:'orb',c:PC,c2:'#fff4c0',a:.95,add:true,tag:TG});
  E.draw(g,TG);
 },
 /* ===================== 16 THẦN ĐIỆN ===================== */
 16:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,keep=1-ph(t,1.3,END),kk=Math.min(k,1.3),r=E.rng(sd^0x16e);
  /* thần luân: bánh xe sáng đứng sau lưng quái (chỉ vẽ viền + tia, không che thân) */
  {const a=ph(t,TH-.08,TH+.2)*(1-ph(t,1.2,1.5));
   if(a>.02){const R=(86+8*Math.sin(t*4))*k*(m?.8:1);
    g.save();g.translate(tc,GY-64);g.globalCompositeOperation='lighter';g.lineCap='round';
    g.strokeStyle=E.rgba(GA,.75*a);g.lineWidth=2.2;g.beginPath();g.arc(0,0,R,0,TAU);g.stroke();
    g.strokeStyle=E.rgba(GB,.5*a);g.lineWidth=1.1;g.beginPath();g.arc(0,0,R*.9,0,TAU);g.stroke();
    g.save();g.rotate(t*.9);g.strokeStyle=E.rgba(GA,.8*a);g.lineWidth=1.6;
    for(let i=0;i<16;i++){const an=i*TAU/16,L=i%2?R*.12:R*.26;g.beginPath();g.moveTo(Math.cos(an)*R*1.03,Math.sin(an)*R*1.03);g.lineTo(Math.cos(an)*(R*1.03+L),Math.sin(an)*(R*1.03+L));g.stroke()}
    g.restore();
    g.save();g.rotate(-t*.6);g.setLineDash([5,7]);g.strokeStyle=E.rgba(GA,.6*a);g.lineWidth=1.2;g.beginPath();g.arc(0,0,R*.78,0,TAU);g.stroke();g.restore();
    g.restore()}}
  /* 4 vòng ấn rune bay lên thành lồng sáng */
  for(let i=0;i<4;i++){
   const t0=TH+.04+i*.07,p=ph(t,t0,t0+.6);if(p<=0||p>=1)continue;
   const y=GY-4-p*132*k,R=(68-10*p)*k,al=Math.sin(p*Math.PI)*.85;
   g.save();g.translate(tc,y);g.scale(1,.26);g.rotate(t*(i%2?1.4:-1.4));g.globalCompositeOperation='lighter';g.lineCap='round';
   g.strokeStyle=E.rgba(GA,.85*al);g.lineWidth=2.6;g.beginPath();g.arc(0,0,R,0,TAU);g.stroke();
   g.strokeStyle=E.rgba(GB,.6*al);g.lineWidth=1.3;g.beginPath();g.arc(0,0,R*.84,0,TAU);g.stroke();
   g.lineWidth=1.6;g.strokeStyle=E.rgba(GA,.8*al);for(let j=0;j<16;j++){const an=j*TAU/16;g.beginPath();g.moveTo(Math.cos(an)*R*.9,Math.sin(an)*R*.9);g.lineTo(Math.cos(an)*R*1.1,Math.sin(an)*R*1.1);g.stroke()}
   g.restore();
  }
  /* 4 tia thánh lôi vàng giáng hai bên, rẽ nhánh */
  [-112,-70,72,114].forEach((ox,i)=>{
   const t0=TH-.04+i*.05,p=ph(t,t0,t0+.24);if(p<=0||p>=1)return;
   const x=tc+ox*k*(m?.7:1),rb=E.rng(sd+2200+i*13+Math.floor(t*22)),pp=E.jag(rb,x+(i%2?-20:20),-10,x,GY-2,9,8),al=1-p;
   g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
   g.strokeStyle=E.rgba(GC,.5*al);g.lineWidth=4;strokePts(g,pp);g.strokeStyle=E.rgba(GB,.95*al);g.lineWidth=1.4;strokePts(g,pp);
   const br=E.jag(rb,pp[5][0],pp[5][1],pp[5][0]+(i%2?-30:30),pp[5][1]+30,5,5);g.strokeStyle=E.rgba(GA,.8*al);g.lineWidth=1;strokePts(g,br);
   g.restore();E.glow(g,x,GY-2,18*k,GA,.4*al);
   if(st.once('lg'+i)){const rb2=E.rng(sd+2300+i*19);E.burst(rb2,x,GY-4,m?4:10,{speed:[40,180],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,3],life:[cap(.4),cap(.9)],gy:320,drag:.3,shape:'orb',c:GA,c2:GB,a:1,add:true,tag:TG,floor:GY+3,bounce:.3})}
  });
  /* 12 trụ phụ phun theo vòng pháp trận, lần lượt */
  for(let i=0;i<12;i++){
   const t0=TH+i*.032,p=ph(t,t0,t0+.5);if(p<=0||p>=1)continue;
   const an=i*TAU/12+.2,Rg=80*k*1.2,x=tc+Math.cos(an)*Rg,y=GY+2+Math.sin(an)*Rg*.28;
   const rise=eo(ph(p,0,.35)),fade=1-ph(p,.45,1),H=(62+46*hs(i+2))*k*rise,w=7*kk;
   if(H>2){g.save();g.globalCompositeOperation='lighter';
    const gr=g.createLinearGradient(0,y,0,y-H);gr.addColorStop(0,E.rgba(GB,.85*fade));gr.addColorStop(1,E.rgba(GA,0));
    g.fillStyle=gr;g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x-w*.18,y-H);g.lineTo(x+w*.18,y-H);g.lineTo(x+w/2,y);g.closePath();g.fill();g.restore();
    E.glow(g,x,y-2,12*kk,GA,.35*fade)}
   if(st.once('mp'+i)){const rb=E.rng(sd+2400+i*31);E.burst(rb,x,y,m?2:4,{speed:[30,120],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.2,2.4],life:[cap(.4),cap(.8)],gy:300,drag:.3,shape:'orb',c:GA,c2:GB,a:1,add:true,tag:TG,floor:GY+3,bounce:.3})}
  }
  /* sao thập tự thần dẹt trên đất */
  {const a=ph(t,TH,TH+.1)*(1-ph(t,TH+.35,TH+.95));
   if(a>0){g.save();g.translate(tc,GY-3);g.scale(1,.3);star4(g,0,0,(96+30*a)*k,GA,.55*a,t*.5);star4(g,0,0,(70+20*a)*k,GB,.35*a,t*.5+Math.PI/4);g.restore()}}
  /* 3 đợt sóng dư chấn: 1 vòng đứng + 2 vòng trên đất */
  [.15,.4,.65].forEach((dl,i)=>{
   const p=ph(t,TH+dl,TH+dl+.6);if(p<=0||p>=1)return;
   const R=8+(m?60:(130-i*20)*Math.min(k,1.3))*eo(p);
   if(i===0)E.wave(g,tc,GY-58,R*1.1,GA,(1-p)*.7,2.2,{sq:.95,seed:sd+80,t:T});
   E.wave(g,tc,GY,R,i%2?GB:GA,(1-p)*.7,1.8,{sq:.28,seed:sd+81+i,t:T});
  });
  /* mảnh vàng vỡ + hạt nảy đất, một lần lúc trúng */
  if(st.once('bs')){const rb=E.rng(sd^0x2f7);
   E.burst(rb,tc,GY-6,m?6:18,{speed:[60,210],ang:[-Math.PI*.95,-Math.PI*.05],size:[2.4,4.4],life:[cap(.7),cap(1.2)],gy:360,drag:.2,shape:'shard',c:GC,c2:GB,a:1,tag:TG,vr:[-10,10],floor:GY+4,bounce:.35});
   E.burst(rb,tc,GY-10,m?8:26,{speed:[50,220],ang:[-Math.PI*.97,-Math.PI*.03],size:[1.6,3.4],life:[cap(.5),cap(1.1)],gy:300,drag:.4,shape:'orb',c:GA,c2:GB,a:1,add:true,tag:TG,floor:GY+3,bounce:.3})}
  /* rune bay lên từ pháp trận */
  for(let i=0;i<12;i++){
   const t0=TH+.08+hs(i+2)*.3,tau=t-t0;if(tau<=0)continue;
   const a=Math.sin(clamp(tau/1.0,0,1)*Math.PI)*keep;
   rune(g,tc+(hs(i)-.5)*220*k,GY-10-hs(i+4)*20-tau*(34+30*hs(i+6)),4+3*hs(i+8),sd+i*5,a);
  }
  /* lông vũ vàng rơi chậm từ trời, nằm lại rồi tan */
  for(let i=0;i<12;i++){
   const t0=TH+hs(i+5)*.5,tau=t-t0;if(tau<=0)continue;
   const x=tc+(hs(i+1)-.5)*240*k+Math.sin(t*2+i)*10,y=-10+tau*(70+30*hs(i+3)),land=y>=GY-1,yy=Math.min(y,GY-1);
   feather(g,x,yy,10+5*hs(i),land?.2:Math.PI/2+Math.sin(t*3+i)*.5,keep*Math.min(1,tau*4)*(m?.6:1),GA,GB);
  }
  /* suối tàn vàng + khói sáng mịn từ vòng pháp trận */
  for(let n=st.rate('em',ph(t,TH,1.35),m?26:76);n>0;n--){const an=r.range(0,TAU),d=r.range(0,84*k);E.emit({x:tc+Math.cos(an)*d,y:GY+2+Math.sin(an)*d*.28,vx:r.range(-10,10),vy:-r.range(50,150),gy:60,drag:.3,life:cap(r.range(.6,1.2)),s0:r.range(1.4,2.8),s1:.4,shape:r()<.35?'spark':'orb',c:GA,c2:GB,a:.95,add:true,tag:TG,rot:r.range(0,TAU),vr:r.range(-4,4)})}
  E.draw(g,TG);
 }};
 const ATK_SPECIAL=/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng/;
 const NOCODE_ATK=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/;
 const mkState=idx=>{
  const st={sd:(++CNT*7919+idx*211)>>>0,last:0,t:0,f:{},c:{}};
  st.once=n=>st.f[n]?false:(st.f[n]=1,true);
  st.cap=l=>Math.max(.12,Math.min(l,END-st.t));
  st.rate=(key,p,total)=>{const n=Math.floor(clamp(p,0,1)*total)-(st.c[key]||0);if(n>0){st.c[key]=(st.c[key]||0)+n;return n}return 0};
  return st;
 };
 API.drawAttack=function(g,T,S){
  const res=prevA(g,T,S);
  try{
   const idx=zi(S.s),text=S.text||'';
   if(D[idx]&&S.cl!==3&&!ATK_SPECIAL.test(text)&&!NOCODE_ATK.test(text)){
    const t=clamp(S.u||0,0,1)*1.9;
    if(t>=TH-.02){
     let st=ST[idx];if(!st||t<st.last-.02)st=ST[idx]=mkState(idx);
     st.last=t;st.t=t;
     const pa=!!S.pa,miss=!!S.miss,cr=!!S.cr,dir=pa?1:-1,tx=pa?272:85;
     const o={tc:miss?tx-dir*80:tx,k:(miss?.55:1)*(cr?1.4:1),m:miss,st:st};
     layer(g,gg=>D[idx](gg,T,t,o));
    }else ST[idx]=null;
   }
  }catch(e){window.__fxErr='39: '+(e&&e.message);if(window.__ATK17_DEBUG)throw e}
  return res;
 };
 API.setFxStyle=v=>{STY=v==='sm'?'sm':'px';if(prevSty)prevSty(v)};
}
boot();
})();
