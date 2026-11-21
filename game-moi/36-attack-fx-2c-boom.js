/* ===== 36-attack-fx-2c-boom.js — [FX 2C+] Lớp NỔ NHIỀU ĐỢT khi trúng đòn cho vùng 10-13 (Thanh Lâm, Xích Hỏa Địa, Hắc Ám Lâm, Tử Tinh Hải) =====
   Chạy SAU 35-attack-fx-2c.js: bọc lại API.drawAttack, gọi bản trước (vẽ như cũ) rồi vẽ THÊM lớp nổ lên trên, chỉ khi t >= lúc trúng (.665s).
   Mỗi vùng: nổ chính (t=.665) -> nổ phụ (+.14~.18) -> dư chấn (+.32~.36), vòng sóng, vật bay có đuôi rơi nảy đất, hạt có trọng lực, màu lõi ở đất và hai bên (không che quái).
   Số ngẫu nhiên dùng E.rng (PRNG riêng), không Math.random. Hạt gắn nhãn 'bm'. Muốn chỉnh độ mạnh: đổi các số trong BOOM[10..13] hoặc hệ số k.
   [sửa] Lỗi gọi sai tham số (BOOM[idx](gg,T,t,o)) làm lớp này không vẽ gì. */
(()=>{
'use strict';
let tries=0;
function boot(){
 const API=window.TTGCombatFX;
 if(!API||!API.engine||!API.__fx2c){if(tries++<240)setTimeout(boot,50);return}
 if(API.__fx2cb)return;
 API.__fx2cb=1;
 const prevA=API.drawAttack,prevSty=API.setFxStyle,zones=API.zones,E=API.engine;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const zi=s=>Math.max(0,Math.min(zones.length-1,Number(s)||0));
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const ph=E.ph,eo=E.eOut,TAU=Math.PI*2,GY=204,TH=.665,END=1.68;
 const LA='#8be04a',LB='#d8ff9a',LY='#ffe45a',LR='#5a3a1c';
 const RA='#ff5a1e',RB='#ffb347',RC='#ffe9a0';
 const DA='#b0206a',DB='#ff6ab8',DC='#ffc0e8',DM='#34081f';
 const QA='#b45cff',QB='#f4dcff',QC='#ff8af0',QD='#3c1478';
 let STY='px',CNT=0;
 const ST={};
 /* lớp pixel giống 33/34/35 */
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
 /* ---- helper vẽ ---- */
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
 function star4(g,x,y,R,col,a,rot){
  if(a<=.01||R<1)return;
  g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.rotate(rot||0);g.fillStyle=E.rgba(col,a);
  g.beginPath();g.moveTo(0,-R);g.quadraticCurveTo(R*.1,-R*.1,R,0);g.quadraticCurveTo(R*.1,R*.1,0,R);g.quadraticCurveTo(-R*.1,R*.1,-R,0);g.quadraticCurveTo(-R*.1,-R*.1,0,-R);g.fill();g.restore();
 }
 function blade(g,x,y,ang,L,W,c1,c2,a){
  if(a<=.02||L<2)return;
  g.save();g.translate(x,y);g.rotate(ang);g.globalCompositeOperation='lighter';
  const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,E.rgba(c1,a));gr.addColorStop(.6,E.rgba(c1,a*.7));gr.addColorStop(1,E.rgba(c2,0));
  g.fillStyle=gr;g.beginPath();g.moveTo(0,-W/2);g.quadraticCurveTo(L*.5,-W*.35,L,0);g.quadraticCurveTo(L*.5,W*.35,0,W/2);g.closePath();g.fill();
  g.fillStyle=E.rgba(c2,a*.55);g.beginPath();g.moveTo(0,-W*.14);g.lineTo(L*.8,0);g.lineTo(0,W*.14);g.closePath();g.fill();
  g.restore();
 }
 const ringW=(g,T,t,o)=>{
  const p=ph(t,o.t0,o.t0+o.dur);if(t<o.t0||p>=1)return;
  E.wave(g,o.x,o.y||GY,6+o.R*eo(p),o.c,(1-p)*(o.a||.8),o.lw||2,{seed:o.sd,t:T,sq:o.sq||.28});
 };
 /* vật bay parabol có đuôi, rơi nảy đất */
 function bombs(g,T,t,st,o){
  const tau=t-o.t0;if(tau<=0)return;
  const fa=1-ph(t,END-.35,END);if(fa<=0)return;
  for(let i=0;i<o.n;i++){
   const an=-Math.PI*(.12+.76*hs(i*3+o.sd%11)),v=(o.v0+o.v1*hs(i*5+2+o.sd%7))*o.k,vx=Math.cos(an)*v,vy=Math.sin(an)*v,
    pos=q=>[o.x+vx*q,Math.min(GY-6+vy*q+o.g*q*q,GY+3)],
    tl=(-vy+Math.sqrt(vy*vy+36*o.g))/(2*o.g),q0=Math.min(tau,tl),hd=pos(q0),pts=[];
   for(let j=0;j<=6;j++)pts.push(pos(Math.max(0,q0-(6-j)*.022)));
   const al=tau<tl?1:Math.max(0,1-(tau-tl)/.2);
   if(al>0){E.ribbon(g,pts,q=>1+o.w*q,o.c1,.85*fa*al,{core:o.c2});E.glow(g,hd[0],hd[1],4+o.w,o.c1,.4*fa*al)}
   if(tau>=tl){
    const lx=o.x+vx*tl,e=ph(tau-tl,0,.3);
    E.wave(g,lx,GY,4+22*o.k*eo(e),o.c1,(1-e)*.7*fa,1.3,{seed:i+o.sd,t:T,sq:.3});
    if(st.once(o.key+i)){const rb=E.rng(st.sd+i*61+o.sd);E.burst(rb,lx,GY-3,o.nb,{speed:[30,130],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,3],life:[st.cap(.4),st.cap(.8)],gy:360,drag:.3,shape:o.shape||'orb',c:o.c1,c2:o.c2,a:1,add:true,tag:'bm',floor:GY+3,bounce:.3,vr:[-6,6]})}
   }
  }
 }
 /* vệt rơi từ trên cao xuống quanh quái (tránh đúng thân quái) */
 function fallers(g,T,t,st,o){
  const fa=1-ph(t,END-.3,END);if(fa<=0)return;
  for(let i=0;i<o.n;i++){
   const t0=o.t0+i*o.dt,tau=t-t0;if(tau<=0)continue;
   let x=o.x+(hs(i*7+st.sd%13)-.5)*2*o.sp;if(Math.abs(x-o.x)<o.av)x+=(x>=o.x?1:-1)*o.av;
   const fall=ph(tau,0,o.dur);
   if(fall<1){
    const pts=[];for(let j=0;j<=6;j++){const f2=Math.max(0,fall-(6-j)*.05);pts.push([x+o.sl*(1-f2),-24+(GY+23)*f2*f2])}
    E.ribbon(g,pts,q=>1+o.w*q,o.c1,.85*fa,{core:o.c2});
    const hd=pts[6];if(o.star)star4(g,hd[0],hd[1],6,o.c2,.9*fa,t*8+i);else E.glow(g,hd[0],hd[1],6,o.c1,.5*fa);
   }else{
    const e=ph(tau,o.dur,o.dur+.28);
    E.wave(g,x,GY,3+o.R*eo(e),o.c1,(1-e)*.7*fa,1.3,{seed:i+o.sd,t:T,sq:.3});
    if(st.once(o.key+i)){const rb=E.rng(st.sd+i*53+o.sd);E.burst(rb,x,GY-4,o.nb,{speed:[30,150],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,3],life:[st.cap(.4),st.cap(.8)],gy:360,drag:.3,shape:o.shape||'orb',c:o.c1,c2:o.c2,a:1,add:true,tag:'bm',floor:GY+3,bounce:.3,vr:[-6,6]})}
   }
  }
 }

 const BOOM={
 /* ===== 10 THANH LÂM: bùng nở hoa lá + gai rễ quất ra hai bên + hạt giống nổ + bào tử ===== */
 10:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,fo=1-ph(t,TH+.75,END);
  E.glow(g,tc,GY-6,(70+30*eo(ph(t,TH,TH+.3)))*k,LA,.32*(1-ph(t,TH+.1,TH+.9)));
  ringW(g,T,t,{x:tc,t0:TH,R:120*k,dur:.55,c:LB,sd:sd+1});
  ringW(g,T,t,{x:tc,t0:TH+.16,R:150*k,dur:.6,c:LA,sd:sd+2,a:.7});
  ringW(g,T,t,{x:tc,t0:TH+.34,R:176*k,dur:.6,c:LY,sd:sd+3,a:.55,lw:1.5});
  for(let i=0;i<8;i++){
   const sg=i%2?1:-1,j=i>>1,t0=TH+.02+j*.05,gw=eo(ph(t,t0,t0+.28));if(gw<=.02)continue;
   const Ln=(46+54*hs(i+sd%9))*k*gw,pts=[];
   for(let q=0;q<=14;q++){const f=q/14;pts.push([tc+sg*(34*k+f*Ln),GY-2-Math.sin(f*Math.PI*.8)*(14+12*hs(i+3))*k*gw+Math.sin(f*7+i)*2])}
   taper(g,pts,7*k+2,1.2,'#1a0e06',.9*fo,false);taper(g,pts,5*k+1.5,.8,LR,.9*fo,false);taper(g,pts,1.6,.5,LB,.7*fo,true);
   const tp=pts[pts.length-1];E.glow(g,tp[0],tp[1],7,LY,.5*fo*gw);
  }
  bombs(g,T,t,st,{x:tc,t0:TH+.02,n:m?3:6,k:k,sd:11,v0:110,v1:150,g:420,w:4,c1:LA,c2:LY,key:'b10',nb:7});
  if(st.once('w1')){const rb=E.rng(sd^0x10a);
   E.burst(rb,tc,GY-40,m?14:34,{speed:[50,210],ang:[0,TAU],size:[3,6],life:[cap(.7),cap(1.3)],gy:70,drag:.65,shape:'leaf',c:LA,c2:LB,a:1,tag:'bm',vr:[-9,9],fl:12});
   E.burst(rb,tc,GY-30,m?10:26,{speed:[30,150],ang:[0,TAU],size:[1.4,3],life:[cap(.8),cap(1.5)],gy:-24,drag:.6,shape:'orb',c:LY,c2:LB,a:1,add:true,tag:'bm'})}
  if(t>=TH+.14&&st.once('w2')){const rb=E.rng(sd^0x10b);
   E.burst(rb,tc,GY-30,m?3:6,{speed:[12,50],ang:[0,TAU],size:[14,26],life:[cap(.9),cap(1.5)],gy:-18,drag:.8,shape:'mist',c:'#4a9a30',a:.6,tag:'bm'});
   E.burst(rb,tc,GY-30,m?10:24,{speed:[90,260],ang:[0,TAU],size:[3,5.5],life:[cap(.6),cap(1.2)],gy:90,drag:.6,shape:'leaf',c:'#5ac030',c2:LB,a:1,tag:'bm',vr:[-10,10],fl:11})}
  if(t>=TH+.32&&st.once('w3')){const rb=E.rng(sd^0x10c);
   E.burst(rb,tc,GY-20,m?10:28,{speed:[20,100],ang:[-Math.PI,0],size:[1.4,2.8],life:[cap(.8),cap(1.4)],gy:-34,drag:.5,shape:'orb',c:LY,c2:LB,a:1,add:true,tag:'bm'});
   E.burst(rb,tc,GY-10,m?4:12,{speed:[50,170],ang:[-Math.PI*.95,-Math.PI*.05],size:[2.6,4.6],life:[cap(.6),cap(1.1)],gy:380,drag:.2,shape:'shard',c:LR,c2:'#c8a060',a:1,tag:'bm',vr:[-10,10],floor:GY+4,bounce:.35})}
  E.draw(g,'bm');
 },
 /* ===== 11 XÍCH HỎA ĐỊA: vành lửa lan, 2 cột lửa hai bên, mưa dung nham, bom lửa, khói tro ===== */
 11:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd;
  E.glow(g,tc,GY-6,80*k,RA,.34*(1-ph(t,TH+.1,TH+1)));
  ringW(g,T,t,{x:tc,t0:TH,R:130*k,dur:.5,c:RB,sd:sd+1});
  ringW(g,T,t,{x:tc,t0:TH+.14,R:160*k,dur:.55,c:RA,sd:sd+2,a:.75});
  ringW(g,T,t,{x:tc,t0:TH+.32,R:185*k,dur:.6,c:RC,sd:sd+3,a:.5,lw:1.5});
  {const p=ph(t,TH,TH+.5),R=130*k*eo(p),fa2=1-ph(t,TH+.35,TH+.85),n=16;
   if(t>=TH&&fa2>0)for(let i=0;i<n;i++){const an=i*TAU/n+.2,x=tc+Math.cos(an)*R,y=GY+Math.sin(an)*R*.14;if(Math.abs(x-tc)<26*k)continue;
    flame(g,x,y,10*k+4,(20+30*hs(i+5))*k*fa2,.85*fa2,t,sd+i*3,RA,RB)}}
  [-1,1].forEach((sg,ci)=>{
   const t0=TH+.16+ci*.05,e=eo(ph(t,t0,t0+.3)),f2=1-ph(t,t0+.35,t0+.75);if(t<t0||f2<=0)return;
   const x=tc+sg*70*k;
   for(let j=0;j<4;j++)flame(g,x+(j-1.5)*7,GY,16,(60+50*hs(j+ci*4))*k*e*(.8+.2*Math.sin(t*13+j)),.85*f2,t,sd+40+ci*9+j,RA,RB);
   E.glow(g,x,GY-24,34*k,RB,.4*f2*e);
  });
  fallers(g,T,t,st,{x:tc,sp:100*k,av:24,n:m?6:13,t0:TH+.06,dt:.04,dur:.28,sl:-18,w:4,R:20*k,c1:RA,c2:RC,key:'r11',nb:5,sd:21});
  bombs(g,T,t,st,{x:tc,t0:TH+.02,n:m?4:8,k:k,sd:31,v0:120,v1:170,g:380,w:5,c1:RA,c2:RC,key:'b11',nb:8});
  if(st.once('w1')){const rb=E.rng(sd^0x11a);
   E.burst(rb,tc,GY-10,m?12:36,{speed:[60,240],ang:[-Math.PI*.97,-Math.PI*.03],size:[2,4.4],life:[cap(.5),cap(1.1)],gy:340,drag:.25,shape:'orb',c:RA,c2:RC,a:1,add:true,tag:'bm',floor:GY+3,bounce:.3});
   E.burst(rb,tc,GY-10,m?6:22,{speed:[90,290],ang:[-Math.PI*.95,-Math.PI*.05],size:[2,3.4],life:[cap(.4),cap(.8)],gy:380,drag:.3,shape:'streak',c:RB,c2:RC,a:1,add:true,tag:'bm'});
   E.burst(rb,tc,GY-12,m?2:5,{speed:[8,34],ang:[-Math.PI*.9,-Math.PI*.1],size:[16,28],life:[cap(.9),cap(1.5)],gy:-24,drag:.8,shape:'mist',c:'#1a1210',a:.8,tag:'bm'})}
  if(t>=TH+.18&&st.once('w2')){const rb=E.rng(sd^0x11b);
   E.burst(rb,tc,GY-14,m?12:32,{speed:[40,200],ang:[-Math.PI*.95,-Math.PI*.05],size:[2,4],life:[cap(.6),cap(1.2)],gy:260,drag:.35,shape:'orb',c:RB,c2:RC,a:1,add:true,tag:'bm',floor:GY+3,bounce:.3})}
  if(t>=TH+.36&&st.once('w3')){const rb=E.rng(sd^0x11c);
   E.burst(rb,tc,GY-16,m?10:26,{speed:[20,120],ang:[-Math.PI,0],size:[1.4,2.8],life:[cap(.7),cap(1.3)],gy:-16,drag:.5,shape:'orb',c:RA,c2:RB,a:.95,add:true,tag:'bm'});
   E.burst(rb,tc,GY-20,m?2:4,{speed:[10,40],ang:[-Math.PI*.9,-Math.PI*.1],size:[18,30],life:[cap(.8),cap(1.2)],gy:-20,drag:.8,shape:'mist',c:'#2a1c18',a:.7,tag:'bm'})}
  E.draw(g,'bm');
 },
 /* ===== 12 HẮC ÁM LÂM: sóng bóng tối, xúc tu quất ra hai bên, nổ co rồi bung, mảnh bóng + hồn bay lên ===== */
 12:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,fo=1-ph(t,TH+.75,END);
  E.glow(g,tc,GY-24,(66+26*eo(ph(t,TH,TH+.3)))*k,DA,.3*(1-ph(t,TH+.1,TH+.9)));
  ringW(g,T,t,{x:tc,t0:TH,R:130*k,dur:.5,c:DA,sd:sd+1});
  ringW(g,T,t,{x:tc,t0:TH+.12,R:110*k,dur:.5,c:DB,sd:sd+2,a:.7});
  ringW(g,T,t,{x:tc,t0:TH+.3,R:166*k,dur:.6,c:DA,sd:sd+3,a:.55,lw:1.5});
  {const p=ph(t,TH+.2,TH+.4);if(p>0&&p<1)E.wave(g,tc,GY-50,(1-p)*70*k+6,DB,Math.sin(p*Math.PI)*.8,1.5,{sq:1,seed:sd+4,t:T})}
  for(let i=0;i<8;i++){
   const sg=i%2?1:-1,j=i>>1,t0=TH+.02+j*.05,gw=eo(ph(t,t0,t0+.28));if(gw<=.02)continue;
   const Ln=(46+56*hs(i+sd%9))*k*gw,pts=[];
   for(let q=0;q<=14;q++){const f=q/14;pts.push([tc+sg*(34*k+f*Ln),GY-2-Math.sin(f*Math.PI*.85)*(18+14*hs(i+3))*k*gw+Math.sin(f*8+i)*2.4])}
   taper(g,pts,7*k+2,1.2,'#05010a',.95*fo,false);taper(g,pts,5*k+1.5,.8,DM,.95*fo,false);taper(g,pts,1.6,.5,DB,.8*fo,true);
   const tp=pts[pts.length-1];E.glow(g,tp[0],tp[1],8,DB,.55*fo*gw);
  }
  bombs(g,T,t,st,{x:tc,t0:TH+.02,n:m?3:7,k:k,sd:41,v0:110,v1:150,g:400,w:4,c1:DA,c2:DC,key:'b12',nb:7});
  if(st.once('w1')){const rb=E.rng(sd^0x12a);
   E.burst(rb,tc,GY-50,m?3:7,{speed:[14,60],ang:[0,TAU],size:[14,26],life:[cap(.9),cap(1.5)],gy:-14,drag:.8,shape:'mist',c:'#14061a',a:.85,tag:'bm'});
   E.burst(rb,tc,GY-40,m?10:28,{speed:[40,200],ang:[0,TAU],size:[1.6,3.2],life:[cap(.5),cap(1.1)],gy:30,drag:.85,shape:'orb',c:DB,c2:DC,a:1,add:true,tag:'bm'})}
  if(t>=TH+.14&&st.once('w2')){const rb=E.rng(sd^0x12b);
   E.burst(rb,tc,GY-50,m?6:16,{speed:[60,220],ang:[0,TAU],size:[3,6],life:[cap(.6),cap(1.1)],gy:300,drag:.4,shape:'shard',c:'#0a0310',c2:DB,a:1,tag:'bm',vr:[-10,10],floor:GY+4,bounce:.3});
   E.burst(rb,tc,GY-30,m?8:20,{speed:[10,60],ang:[-Math.PI,0],size:[1.6,3],life:[cap(.8),cap(1.4)],gy:-40,drag:.6,shape:'spark',c:DA,c2:DC,a:1,add:true,tag:'bm',vr:[-4,4]})}
  if(t>=TH+.34&&st.once('w3')){const rb=E.rng(sd^0x12c);
   E.burst(rb,tc,GY-50,m?3:5,{speed:[12,50],ang:[0,TAU],size:[16,28],life:[cap(.8),cap(1.2)],gy:-16,drag:.8,shape:'mist',c:'#1a0a24',a:.75,tag:'bm'});
   E.burst(rb,tc,GY-50,m?8:22,{speed:[20,130],ang:[0,TAU],size:[1.4,2.8],life:[cap(.7),cap(1.3)],gy:20,drag:.7,shape:'orb',c:DB,c2:DC,a:1,add:true,tag:'bm'})}
  E.draw(g,'bm');
 },
 /* ===== 13 TỬ TINH HẢI: 12 tia pha lê phóng tỏa, vòng sao nở ra, sao băng rơi, pha lê vỡ + bụi sao ===== */
 13:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,fo=1-ph(t,TH+.7,END),cy=GY-50;
  E.glow(g,tc,GY-14,(70+28*eo(ph(t,TH,TH+.3)))*k,QA,.3*(1-ph(t,TH+.1,TH+.9)));
  ringW(g,T,t,{x:tc,t0:TH,R:126*k,dur:.5,c:QB,sd:sd+1});
  ringW(g,T,t,{x:tc,t0:TH+.14,R:156*k,dur:.55,c:QC,sd:sd+2,a:.75});
  ringW(g,T,t,{x:tc,t0:TH+.32,R:184*k,dur:.6,c:QA,sd:sd+3,a:.55,lw:1.5});
  for(let i=0;i<12;i++){
   const an=i*TAU/12+.13,sn=Math.sin(an),r0=36*k,px=tc+Math.cos(an)*r0,py=cy+sn*r0,t0=TH+(i%3)*.04;
   let L=(70+50*hs(i+sd%9))*k*eo(ph(t,t0,t0+.2));
   if(sn>.45)L=Math.min(L,Math.max(0,(GY+8-py)/sn));
   blade(g,px,py,an,L,(i%2?8:11)*k,QA,QB,.85*fo);
  }
  {const e=eo(ph(t,TH,TH+.7)),sa=Math.sin(ph(t,TH,TH+.8)*Math.PI);
   if(t>=TH&&sa>0)for(let i=0;i<10;i++){const an=i*TAU/10+t*.9,R=(40+110*e)*k;star4(g,tc+Math.cos(an)*R,cy+Math.sin(an)*R*.7,(6+5*(i%2))*k,i%2?QB:QC,.9*sa,t*3+i)}}
  fallers(g,T,t,st,{x:tc,sp:110*k,av:26,n:m?5:9,t0:TH+.04,dt:.045,dur:.3,sl:-20,w:5,R:20*k,c1:QA,c2:QB,star:true,key:'r13',nb:7,shape:'spark',sd:51});
  bombs(g,T,t,st,{x:tc,t0:TH+.02,n:m?3:6,k:k,sd:61,v0:110,v1:150,g:400,w:4,c1:QC,c2:QB,key:'b13',nb:7,shape:'spark'});
  if(st.once('w1')){const rb=E.rng(sd^0x13a);
   E.burst(rb,tc,cy,m?10:30,{speed:[40,200],ang:[0,TAU],size:[1.4,3],life:[cap(.6),cap(1.2)],gy:22,drag:.7,shape:'spark',c:QC,c2:'#ffffff',a:1,add:true,tag:'bm',vr:[-6,6]});
   E.burst(rb,tc,cy,m?5:14,{speed:[60,230],ang:[0,TAU],size:[3,6],life:[cap(.6),cap(1.1)],gy:300,drag:.4,shape:'shard',c:QD,c2:QB,a:1,tag:'bm',vr:[-10,10],floor:GY+4,bounce:.3})}
  if(t>=TH+.15&&st.once('w2')){const rb=E.rng(sd^0x13b);
   E.burst(rb,tc,cy,m?6:18,{speed:[70,250],ang:[0,TAU],size:[3,6],life:[cap(.6),cap(1.1)],gy:320,drag:.35,shape:'shard',c:QD,c2:QB,a:1,tag:'bm',vr:[-12,12],floor:GY+4,bounce:.35});
   E.burst(rb,tc,cy,m?10:30,{speed:[30,160],ang:[0,TAU],size:[1.2,2.8],life:[cap(.8),cap(1.4)],gy:26,drag:.75,shape:'spark',c:QB,c2:'#ffffff',a:1,add:true,tag:'bm',vr:[-5,5]})}
  if(t>=TH+.32&&st.once('w3')){const rb=E.rng(sd^0x13c);
   E.burst(rb,tc,cy,m?12:36,{speed:[15,110],ang:[0,TAU],size:[1.2,2.6],life:[cap(.9),cap(1.5)],gy:30,drag:.8,shape:'spark',c:QC,c2:'#ffffff',a:1,add:true,tag:'bm',vr:[-4,4]})}
  E.draw(g,'bm');
 }};
 const ATK_SPECIAL=/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng/;
 const NOCODE_ATK=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/;
 const mkState=idx=>{
  const st={sd:(++CNT*7919+idx*131)>>>0,last:0,t:0,f:{}};
  st.once=n=>st.f[n]?false:(st.f[n]=1,true);
  st.cap=l=>Math.max(.12,Math.min(l,END-st.t));
  return st;
 };
 API.drawAttack=function(g,T,S){
  const res=prevA(g,T,S);
  try{
   const idx=zi(S.s),text=S.text||'';
   if(BOOM[idx]&&S.cl!==3&&!ATK_SPECIAL.test(text)&&!NOCODE_ATK.test(text)){
    const t=clamp(S.u||0,0,1)*1.9;
    if(t>=TH-.02){
     let st=ST[idx];if(!st||t<st.last-.02)st=ST[idx]=mkState(idx);
     st.last=t;st.t=t;
     const pa=!!S.pa,miss=!!S.miss,cr=!!S.cr,dir=pa?1:-1,tx=pa?272:85;
     const o={tc:miss?tx-dir*80:tx,k:(miss?.55:1)*(cr?1.4:1),m:miss,st:st};
     layer(g,gg=>BOOM[idx](gg,T,t,o));
    }else ST[idx]=null;
   }
  }catch(e){window.__fxErr='36: '+(e&&e.message);if(window.__ATK17_DEBUG)throw e}
  return res;
 };
 API.setFxStyle=v=>{STY=v==='sm'?'sm':'px';if(prevSty)prevSty(v)};
}
boot();
})();
