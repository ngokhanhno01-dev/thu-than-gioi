/* ===== 37-attack-fx-2c-detail.js — [FX 2C++] Lớp CHI TIẾT THÊM cho vùng 10 (Thanh Lâm), 11 (Xích Hỏa Địa), 12 (Hắc Ám Lâm) =====
   Chạy SAU 36-attack-fx-2c-boom.js: gọi bản trước (vẽ như cũ) rồi vẽ THÊM lớp chi tiết, chỉ khi t >= lúc trúng (.665s). Hạt gắn nhãn 'dt'. PRNG riêng (E.rng).
   10: cổng dây leo gai nở hoa rồi héo, nấm phát sáng nổ bào tử, đom đóm, lá rơi, tia nắng phấn hoa, nứt rễ.
   11: lốc lửa xoáy, 6 mạch dung nham phun, thiên thạch đá cháy, mạng nứt dung nham nguội dần, vòm nhiệt, suối tàn lửa, cột khói.
   12: ấn pháp trận dưới đất, vết nứt bóng tối, dơi, hồn bóng xoắn ốc, sương đen, và MẶT QUỶ bay lên từ từ rồi tan thành khói.
   [sửa] Lỗi gọi sai tham số (D[idx](gg,T,t,pa,miss,cr,o)) làm lớp này không vẽ gì. Giờ gọi D[idx](gg,T,t,o). */
(()=>{
'use strict';
let tries=0;
function boot(){
 const API=window.TTGCombatFX;
 if(!API||!API.engine||!API.__fx2cb){if(tries++<240)setTimeout(boot,50);return}
 if(API.__fx2cd)return;
 API.__fx2cd=1;
 const prevA=API.drawAttack,prevSty=API.setFxStyle,zones=API.zones,E=API.engine;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const zi=s=>Math.max(0,Math.min(zones.length-1,Number(s)||0));
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const ph=E.ph,eo=E.eOut,TAU=Math.PI*2,GY=204,TH=.665,END=1.68;
 const LA='#8be04a',LB='#d8ff9a',LD='#1c5a14',LM='#2e8a2a',LY='#ffe45a',LR='#5a3a1c',LT='#7affc8';
 const RA='#ff5a1e',RB='#ffb347',RC='#ffe9a0';
 const DA='#b0206a',DB='#ff6ab8',DC='#ffc0e8',DM='#34081f';
 let STY='px',CNT=0;
 const ST={};
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
 function leafAt(g,x,y,L,ang,c1,c2,a){
  if(a<=.02||L<1)return;
  g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=Math.min(1,a);
  const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(1,c2);
  g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*.5,-L*.42,L,0);g.quadraticCurveTo(L*.5,L*.42,0,0);g.fill();
  g.strokeStyle=E.rgba(LB,.5);g.lineWidth=.8;g.beginPath();g.moveTo(L*.08,0);g.lineTo(L*.85,0);g.stroke();
  g.restore();
 }
 function flower(g,x,y,R,open,a,rot,c1,c2){
  if(open<=.02||a<=.02||R<2)return;
  g.save();g.translate(x,y);g.rotate(rot);g.lineJoin='round';
  for(let l=0;l<2;l++){
   const n=l?5:6,L=R*(l?.62:1)*eo(ph(open,l*.25,.6+l*.25)),W=L*.42;if(L<1)continue;
   for(let i=0;i<n;i++){
    g.save();g.rotate(i*TAU/n+(l?TAU/12:0));g.globalAlpha=Math.min(1,a);
    const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,c1);gr.addColorStop(.6,c2);gr.addColorStop(1,'#fff4c0');
    g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*.2,-W*1.1,L*.85,-W*.8,L,0);g.bezierCurveTo(L*.85,W*.8,L*.2,W*1.1,0,0);g.fill();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(LB,.6*a);g.lineWidth=1;g.stroke();
    g.restore();
   }
  }
  g.restore();
  E.glow(g,x,y,R*.5,LY,.5*a*open);
 }
 function bat(g,x,y,s,flap,a){
  if(a<=.02)return;
  g.save();g.translate(x,y);g.globalAlpha=Math.min(1,a);g.fillStyle='#0a0310';
  for(const sg of[-1,1]){g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(sg*s*.7,-s*(.6+flap*.6),sg*s*1.5,-s*(.1+flap*.8));g.quadraticCurveTo(sg*s*1.1,s*.3,sg*s*.8,s*.25);g.quadraticCurveTo(sg*s*.5,s*.5,0,s*.35);g.fill()}
  g.beginPath();g.ellipse(0,s*.1,s*.28,s*.4,0,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(DB,.9);g.beginPath();g.arc(-s*.1,0,s*.08+.4,0,TAU);g.arc(s*.1,0,s*.08+.4,0,TAU);g.fill();
  g.restore();
 }
 /* mặt quỷ: sừng, trán, lông mày, mắt hồng sáng, mũi, miệng nhe nanh. s = nửa chiều rộng, a = độ đục */
 function demon(g,x,y,s,a,t,sd){
  if(a<=.02||s<4)return;
  const fl=E.noise(sd*.01+t*7)*s*.05;
  g.save();g.translate(x+fl,y);g.lineJoin='round';g.lineCap='round';
  E.glow(g,0,0,s*1.9,DA,.35*a);
  for(const sg of[-1,1]){
   g.fillStyle=E.rgba('#0a0310',.95*a);g.beginPath();g.moveTo(sg*s*.42,-s*.78);
   g.bezierCurveTo(sg*s*.95,-s*.95,sg*s*1.25,-s*1.35,sg*s*1.0,-s*1.95);g.bezierCurveTo(sg*s*.95,-s*1.4,sg*s*.7,-s*1.1,sg*s*.18,-s*.95);g.closePath();g.fill();
   g.strokeStyle=E.rgba(DB,.5*a);g.lineWidth=1.1;g.stroke();
  }
  const gr=g.createRadialGradient(0,-s*.2,s*.1,0,0,s*1.1);gr.addColorStop(0,E.rgba('#2a0a30',a));gr.addColorStop(1,E.rgba('#08020c',a));
  g.fillStyle=gr;g.beginPath();g.moveTo(0,-s);
  g.bezierCurveTo(s*.7,-s,s*.98,-s*.45,s*.84,s*.05);g.bezierCurveTo(s*.72,s*.5,s*.36,s*.92,0,s*1.05);
  g.bezierCurveTo(-s*.36,s*.92,-s*.72,s*.5,-s*.84,s*.05);g.bezierCurveTo(-s*.98,-s*.45,-s*.7,-s,0,-s);g.closePath();g.fill();
  g.strokeStyle=E.rgba(DA,.7*a);g.lineWidth=1.4;g.stroke();
  g.strokeStyle=E.rgba('#000000',.9*a);g.lineWidth=s*.13;
  for(const sg of[-1,1]){g.beginPath();g.moveTo(sg*s*.1,-s*.28);g.lineTo(sg*s*.7,-s*.55);g.stroke()}
  g.globalCompositeOperation='lighter';
  const bl=.55+.45*Math.abs(Math.sin(t*2.6+sd%5));
  for(const sg of[-1,1]){
   g.fillStyle=E.rgba(DB,.95*a);g.beginPath();g.moveTo(sg*s*.14,-s*.2);g.quadraticCurveTo(sg*s*.42,-s*(.34*bl+.02),sg*s*.7,-s*.34);g.quadraticCurveTo(sg*s*.44,-s*.1,sg*s*.14,-s*.2);g.fill();
   g.fillStyle=E.rgba('#ffffff',.95*a);g.beginPath();g.ellipse(sg*s*.42,-s*.22,s*.09,s*.05*bl+.3,0,0,TAU);g.fill();
   g.fillStyle=E.rgba(DA,.75*a);g.beginPath();g.ellipse(sg*s*.08,s*.18,s*.035,s*.08,sg*.3,0,TAU);g.fill();
  }
  const op=.5+.5*Math.sin(t*3+sd%7),h=s*(.16+.14*op),my=s*.46;
  g.fillStyle=E.rgba(DA,.9*a);g.beginPath();g.moveTo(-s*.52,my);g.quadraticCurveTo(0,my+h*2.4,s*.52,my);g.quadraticCurveTo(0,my+h*.3,-s*.52,my);g.fill();
  g.fillStyle=E.rgba('#ffe8f4',.9*a);
  for(let i=0;i<6;i++){const fx=-s*.4+i*s*.16,ln=s*(.13+.06*(i%2));g.beginPath();g.moveTo(fx-s*.045,my+s*.01);g.lineTo(fx+s*.045,my+s*.01);g.lineTo(fx,my+ln);g.closePath();g.fill()}
  for(const sg of[-1,1]){g.beginPath();g.moveTo(sg*s*.2-s*.04,my+h*1.6);g.lineTo(sg*s*.2+s*.04,my+h*1.6);g.lineTo(sg*s*.2,my+h*1.6-s*.14);g.closePath();g.fill()}
  g.restore();
 }
 const D={
 /* ===== 10 THANH LÂM ===== */
 10:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,wit=ph(t,1.28,END),vis=1-ph(t,1.55,END);
  /* tia nắng phấn hoa */
  {const a=ph(t,TH,TH+.2)*(1-ph(t,1.4,END))*.22;
   if(a>0){g.save();g.globalCompositeOperation='lighter';
    for(let i=0;i<3;i++){const x=tc+(-70+70*i)*k+Math.sin(t*1.6+i)*6,gr=g.createLinearGradient(0,0,0,GY);gr.addColorStop(0,E.rgba(LY,a));gr.addColorStop(1,E.rgba(LA,0));
     g.fillStyle=gr;g.beginPath();g.moveTo(x-6,0);g.lineTo(x+10,0);g.lineTo(x+46,GY);g.lineTo(x-26,GY);g.closePath();g.fill()}
    g.restore()}}
  /* nứt rễ trên đất */
  {const gw=eo(ph(t,TH,TH+.25)),a=1-ph(t,1.3,END);
   if(gw>0&&a>0){g.save();g.lineCap='round';g.lineJoin='round';
    for(let i=0;i<8;i++){const sg=i%2?1:-1,rb=E.rng(sd+300+i),L=(40+70*hs(i+2))*k*gw,pp=E.jag(rb,tc+sg*24*k,GY+2,tc+sg*(24*k+L),GY+2+(hs(i+9)-.5)*5,5,2.6);
     g.strokeStyle=E.rgba('#1a0e06',.8*a);g.lineWidth=2.6;strokePts(g,pp);g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(LA,.6*a);g.lineWidth=1;strokePts(g,pp);g.globalCompositeOperation='source-over'}
    g.restore()}}
  /* cổng dây leo gai nở hoa rồi héo */
  [-1,1].forEach((sg,vi)=>{
   const gw=eo(ph(t,TH+.04+vi*.05,TH+.42+vi*.05));if(gw<=.02)return;
   const P0=[tc+sg*78*k,GY],P1=[tc+sg*92*k,GY-160*k],P2=[tc+sg*4,GY-138*k],N=30,m2=Math.max(2,Math.floor(N*gw)),pts=[];
   for(let i=0;i<=m2;i++){const f=i/N,a=(1-f)*(1-f),b=2*f*(1-f),c=f*f;pts.push([a*P0[0]+b*P1[0]+c*P2[0]+Math.sin(f*14+vi*2)*2.4,a*P0[1]+b*P1[1]+c*P2[1]])}
   const col=E.mix(LM,'#6a5a2a',wit);
   taper(g,pts,7,2,'#0c2a08',.92*vis,false);taper(g,pts,5,1.3,col,.95*vis,false);taper(g,pts,1.6,.5,LB,.7*vis*(1-wit),true);
   for(let i=3;i<pts.length-1;i+=3){
    const p=pts[i],q=pts[i+1],an=Math.atan2(q[1]-p[1],q[0]-p[0])+(i%6<3?-1:1)*1.5;
    leafAt(g,p[0],p[1],8+3*hs(i+vi),an,LD,E.mix(LA,'#8a7a30',wit),.95*vis);
    if(i%6===0){g.fillStyle=E.rgba('#a07a44',.9*vis);g.beginPath();g.moveTo(p[0]-2,p[1]);g.lineTo(p[0]+Math.cos(an+.6)*5,p[1]+Math.sin(an+.6)*5);g.lineTo(p[0]+2,p[1]);g.closePath();g.fill()}
   }
   [.35,.62,.9].forEach((f,j)=>{
    const a=(1-f)*(1-f),b=2*f*(1-f),c=f*f,fx=a*P0[0]+b*P1[0]+c*P2[0],fy=a*P0[1]+b*P1[1]+c*P2[1],op=eo(ph(t,TH+.3+j*.06+vi*.03,TH+.6+j*.06+vi*.03));
    flower(g,fx,fy,(9+2*j)*Math.min(k,1.2),op,vis*(1-.7*wit),t*.6+j+vi,'#ffb0e0',LY)});
  });
  /* nấm phát sáng nổ bào tử */
  for(let i=0;i<7;i++){
   const ox=(i<4?-1:1)*(34+(i%4)*24+hs(i+sd%5)*10)*k,t0=TH+.1+i*.05,e=eo(ph(t,t0,t0+.2));if(e<=.02)continue;
   const x=tc+ox,h=(10+9*hs(i+2))*e*Math.min(k,1.2),cw=(8+5*hs(i+6))*e*Math.min(k,1.2);
   g.save();g.globalAlpha=vis;g.fillStyle='#d8f0c8';g.fillRect(x-1.6,GY-h,3.2,h);
   const gr=g.createLinearGradient(0,GY-h-cw*.8,0,GY-h);gr.addColorStop(0,LT);gr.addColorStop(1,'#1c8a5a');g.fillStyle=gr;
   g.beginPath();g.ellipse(x,GY-h,cw,cw*.7,0,Math.PI,TAU);g.closePath();g.fill();
   g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(x-cw*.35,GY-h-cw*.3,1.4,0,TAU);g.arc(x+cw*.25,GY-h-cw*.45,1.1,0,TAU);g.fill();g.restore();
   E.glow(g,x,GY-h-cw*.3,cw*1.6,LT,.3*e*vis);
   if(st.once('mu'+i)){const rb=E.rng(sd+60+i*13);E.burst(rb,x,GY-h-cw*.4,m?3:8,{speed:[14,70],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,2.6],life:[cap(.8),cap(1.4)],gy:-18,drag:.5,shape:'orb',c:LT,c2:LB,a:1,add:true,tag:'dt'})}
  }
  /* đom đóm bay vòng */
  for(let i=0;i<9;i++){
   const fa=ph(t,TH+.1,TH+.3)*vis;if(fa<=0)continue;
   const an=t*(1.6+.3*hs(i))+i*1.7,R=(40+70*hs(i+4))*k,x=tc+Math.cos(an)*R*(.9+.2*Math.sin(t*3+i)),y=GY-30-hs(i+7)*90+Math.sin(an*1.3)*14;
   E.glow(g,x,y,7,LY,.7*fa);E.glow(g,x,y,2.5,'#ffffff',.9*fa);
  }
  /* lá rơi + phấn hoa */
  for(let n=st.rate('lf',ph(t,TH+.05,1.45),m?18:44);n>0;n--){const r=E.rng(sd+n*97+st.c.lf);E.emit({x:tc+r.range(-130,130)*k,y:r.range(6,50),vx:r.range(-14,14),vy:r.range(20,50),gy:14,drag:.3,life:cap(r.range(.8,1.3)),s0:r.range(2.4,4),s1:1.6,rot:r.range(0,TAU),vr:r.range(-4,4),shape:'leaf',c:LA,c2:LB,a:.95,fl:r.range(5,9),tag:'dt'})}
  for(let n=st.rate('pl',ph(t,TH,1.5),m?16:40);n>0;n--){const r=E.rng(sd+n*131+st.c.pl);E.emit({x:tc+r.range(-100,100)*k,y:GY-r.range(0,70),vx:r.range(-6,6),vy:-r.range(6,26),gy:-3,drag:.4,life:cap(r.range(.7,1.3)),s0:r.range(1.2,2.2),s1:.4,shape:'orb',c:LY,c2:LB,a:.9,add:true,tag:'dt'})}
  E.draw(g,'dt');
 },
 /* ===== 11 XÍCH HỎA ĐỊA ===== */
 11:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,fa=1-ph(t,END-.3,END),cool=ph(t,TH+.3,1.5);
  /* mạng nứt dung nham nguội dần */
  {const gw=eo(ph(t,TH,TH+.3)),keep=1-ph(t,1.4,END);
   if(gw>0&&keep>0){g.save();g.lineCap='round';g.lineJoin='round';
    for(let i=0;i<10;i++){const an=i*TAU/10+.3,L=(50+90*hs(i+3))*k*gw,rb=E.rng(sd+500+i),pp=E.jag(rb,tc+Math.cos(an)*14,GY+2,tc+Math.cos(an)*L*1.3,GY+2+Math.sin(an)*L*.14,5,3);
     g.strokeStyle=E.rgba('#140806',.8*keep);g.lineWidth=3;strokePts(g,pp);
     g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(E.mix(RB,'#7a2008',cool),.9*keep);g.lineWidth=1.4;strokePts(g,pp);g.globalCompositeOperation='source-over'}
    g.restore()}}
  /* vòm nhiệt */
  {const p=ph(t,TH,TH+.7);if(p>0&&p<1){E.wave(g,tc,GY-50,30+96*eo(p),RB,(1-p)*.38,1.4,{sq:1.05,seed:sd+3,t:T});E.wave(g,tc,GY-50,18+70*eo(p),RA,(1-p)*.3,1.1,{sq:1.05,seed:sd+4,t:T})}}
  /* lốc lửa xoáy */
  {const gw=eo(ph(t,TH+.04,TH+.35)),f2=1-ph(t,TH+.6,TH+1.05);
   if(gw>0&&f2>0)for(let arm=0;arm<4;arm++){const pts=[];
    for(let j=0;j<=12;j++){const f=j/12,an=arm*TAU/4+f*5-t*10,rad=(54-26*f)*k;pts.push([tc+Math.cos(an)*rad,GY-4-f*118*k*gw+Math.sin(an)*rad*.2])}
    E.ribbon(g,pts,q=>1+6*(1-q)*.8+2,RA,.75*f2,{core:RC})}}
  /* 6 mạch dung nham phun */
  [-118,-92,-64,66,94,120].forEach((ox,i)=>{
   const t0=TH+.08+i*.045,p=ph(t,t0,t0+.5);if(p<=0||p>=1)return;
   const x=tc+ox*k*(m?.6:1),H=(46+44*hs(i+3))*k*Math.pow(Math.sin(p*Math.PI),.7);
   for(let j=0;j<3;j++)flame(g,x+(j-1)*6,GY,13,H*(1-.12*Math.abs(j-1)),.85*(1-p*.4),t,sd+90+i*5+j,RA,RB);
   E.glow(g,x,GY-4,24*k,RB,.4*Math.sin(p*Math.PI));
   if(st.once('g'+i)){const rb=E.rng(sd+40+i*37);E.burst(rb,x,GY-6,m?4:9,{speed:[50,190],ang:[-Math.PI*.8,-Math.PI*.2],size:[1.8,3.4],life:[cap(.5),cap(1)],gy:380,drag:.2,shape:'orb',c:RA,c2:RC,a:1,add:true,tag:'dt',floor:GY+3,bounce:.3})}
  });
  /* thiên thạch đá cháy */
  [-104,-72,70,100,-44].forEach((ox,i)=>{
   const t0=TH+.05+i*.07,tau=t-t0;if(tau<=0)return;
   const lx=tc+ox*k*(m?.6:1),fall=ph(tau,0,.32);
   if(fall<1){
    const sx=lx-60,pos=f=>[sx+(lx-sx)*f,-30+(GY-3+30)*f*f],pts=[];
    for(let j=0;j<=7;j++)pts.push(pos(Math.max(0,fall-(7-j)*.045)));
    E.ribbon(g,pts,q=>1+8*q,RA,.85*fa,{core:RC});
    const hd=pos(fall);
    g.save();g.translate(hd[0],hd[1]);g.rotate(t*6+i);g.fillStyle=E.rgba('#2a1a14',.95*fa);g.strokeStyle=E.rgba(RB,.9*fa);g.lineWidth=1;
    g.beginPath();[[-5,-3],[1,-6],[6,-1],[4,5],[-3,6]].forEach((p,j)=>j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.stroke();g.restore();
    E.glow(g,hd[0],hd[1],10,RA,.5*fa);
   }else{
    const e=ph(tau,.32,.6);E.wave(g,lx,GY,4+30*k*eo(e),RA,(1-e)*.7*fa,1.4,{seed:sd+i,t:T,sq:.3});
    if(st.once('rk'+i)){const rb=E.rng(sd+70+i*29);
     E.burst(rb,lx,GY-4,m?4:9,{speed:[50,190],ang:[-Math.PI*.95,-Math.PI*.05],size:[2.4,4.4],life:[cap(.6),cap(1.1)],gy:380,drag:.2,shape:'shard',c:'#2a1a14',c2:RB,a:1,tag:'dt',vr:[-10,10],floor:GY+4,bounce:.35});
     E.burst(rb,lx,GY-4,m?4:10,{speed:[40,170],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.6,3],life:[cap(.5),cap(1)],gy:340,drag:.3,shape:'orb',c:RA,c2:RC,a:1,add:true,tag:'dt',floor:GY+3,bounce:.3})}
   }
  });
  /* suối tàn lửa + cột khói */
  for(let n=st.rate('em',ph(t,TH,1.4),m?30:84);n>0;n--){const r=E.rng(sd+n*89+st.c.em);E.emit({x:tc+r.range(-46,46)*k,y:GY-r.range(0,6),vx:r.range(-40,40),vy:-r.range(90,210),gy:200,drag:.2,life:cap(r.range(.6,1.2)),s0:r.range(1.4,2.8),s1:.4,shape:'orb',c:RA,c2:RB,a:.95,add:true,tag:'dt'})}
  for(let n=st.rate('sm',ph(t,TH+.1,1.3),m?6:14);n>0;n--){const r=E.rng(sd+n*53+st.c.sm);E.emit({x:tc+r.range(-60,60)*k,y:GY-r.range(10,30),vx:r.range(-6,6),vy:-r.range(14,34),gy:-26,drag:.6,life:cap(r.range(.9,1.4)),s0:r.range(10,16),s1:r.range(20,30),shape:'mist',c:'#1a1210',a:.6,tag:'dt'})}
  E.draw(g,'dt');
 },
 /* ===== 12 HẮC ÁM LÂM ===== */
 12:(g,T,t,o)=>{
  const {tc,k,m,st}=o,cap=st.cap,sd=st.sd,fo=1-ph(t,END-.25,END);
  /* sương đen sát đất */
  {const a=ph(t,TH,TH+.2)*(1-ph(t,1.4,END));if(a>0){E.blob(g,tc,GY-2,96*k,12,'#14061a',.55*a,T,sd+2,{add:false,core:'#0a0310',wob:.2,speed:1.5});E.blob(g,tc,GY-1,70*k,7,DM,.4*a,T,sd+5,{add:false,core:DA,wob:.2,speed:2})}}
  /* ấn pháp trận */
  {const a=ph(t,TH-.02,TH+.12)*(1-ph(t,1.3,END));
   if(a>0){const R=84*k;g.save();g.globalCompositeOperation='lighter';g.translate(tc,GY+2);g.scale(1,.3);g.lineJoin='round';
    g.strokeStyle=E.rgba(DA,.8*a);g.lineWidth=2.4;g.beginPath();g.arc(0,0,R,0,TAU);g.stroke();
    g.strokeStyle=E.rgba(DB,.55*a);g.lineWidth=1.2;g.beginPath();g.arc(0,0,R*.82,0,TAU);g.stroke();
    g.rotate(t*.8);g.strokeStyle=E.rgba(DB,.9*a);g.lineWidth=1.6;g.beginPath();
    for(let i=0;i<5;i++){const an=-Math.PI/2+i*TAU*2/5,x=Math.cos(an)*R*.82,y=Math.sin(an)*R*.82;i?g.lineTo(x,y):g.moveTo(x,y)}
    g.closePath();g.stroke();
    for(let i=0;i<10;i++){const an=i*TAU/10;g.beginPath();g.moveTo(Math.cos(an)*R*.9,Math.sin(an)*R*.9);g.lineTo(Math.cos(an)*R*1.08,Math.sin(an)*R*1.08);g.stroke()}
    g.restore()}}
  /* vết nứt bóng tối */
  {const gw=eo(ph(t,TH,TH+.25)),a=1-ph(t,1.35,END);
   if(gw>0&&a>0){g.save();g.lineCap='round';g.lineJoin='round';
    for(let i=0;i<7;i++){const an=i*TAU/7+.4,L=(46+80*hs(i+3))*k*gw,rb=E.rng(sd+400+i),pp=E.jag(rb,tc+Math.cos(an)*16,GY+2,tc+Math.cos(an)*L*1.3,GY+2+Math.sin(an)*L*.14,5,3);
     g.strokeStyle=E.rgba('#05010a',.85*a);g.lineWidth=3;strokePts(g,pp);g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(DB,.8*a);g.lineWidth=1.1;strokePts(g,pp);g.globalCompositeOperation='source-over'}
    g.restore()}}
  /* hồn bóng xoắn ốc bay lên */
  for(let i=0;i<5;i++){
   const t0=TH+.05+i*.07,tau=t-t0;if(tau<=0)continue;
   const al=Math.min(1,tau*4)*fo,pts=[];
   for(let j=0;j<=10;j++){const tj=Math.max(0,tau-j*.03),an=i*1.26+tj*5,rad=(18+tj*46)*k;pts.push([tc+Math.cos(an)*rad*1.1,GY-14-tj*120+Math.sin(an)*rad*.2])}
   E.ribbon(g,pts,q=>1+5*q,DA,.6*al,{core:DC});
   const hd=pts[10];E.glow(g,hd[0],hd[1],7,DB,.5*al);E.glow(g,hd[0]-1.5,hd[1],1.8,'#ffffff',.8*al);E.glow(g,hd[0]+1.5,hd[1],1.8,'#ffffff',.8*al);
  }
  /* dơi bay tỏa ra */
  for(let i=0;i<7;i++){
   const t0=TH+.05+i*.05,tau=t-t0;if(tau<=0)continue;
   const an=-Math.PI*(.12+.76*i/6),sp=(80+50*hs(i+sd%5))*k,x=tc+Math.cos(an)*sp*tau*1.1+Math.sin(tau*9+i)*4,y=GY-46+Math.sin(an)*sp*tau*.9+Math.sin(tau*7+i)*5-tau*20;
   bat(g,x,y,(6+3*hs(i+3))*Math.min(k,1.2),Math.sin(t*30+i*2),Math.min(1,tau*5)*fo);
  }
  /* MẶT QUỶ bay lên từ từ rồi tan */
  {const e=ph(t,TH+.22,END-.02),a=Math.pow(Math.sin(clamp(e,0,1)*Math.PI),.7)*.72*(m?.6:1),sz=(20+15*eo(e))*Math.min(k,1.3),fy=GY-78-84*eo(e);
   if(e>0&&e<1){
    demon(g,tc,fy,sz,a,t,sd);
    for(let n=st.rate('fs',e,m?18:46);n>0;n--){const r=E.rng(sd+n*71+st.c.fs);E.emit({x:tc+r.range(-sz*.7,sz*.7),y:fy+sz*r.range(.7,1.1),vx:r.range(-10,10),vy:r.range(12,34),gy:-8,drag:.5,life:cap(r.range(.5,.9)),s0:r.range(6,10),s1:r.range(2,4),shape:'mist',c:'#14061a',a:.75,tag:'dt'})}
    for(let n=st.rate('fe',e,m?10:30);n>0;n--){const r=E.rng(sd+n*61+st.c.fe);E.emit({x:tc+r.range(-sz*.9,sz*.9),y:fy+r.range(-sz,sz),vx:r.range(-14,14),vy:-r.range(6,30),gy:-6,drag:.4,life:cap(r.range(.5,1)),s0:r.range(1.2,2.2),s1:.4,shape:'orb',c:DB,c2:DC,a:.95,add:true,tag:'dt'})}
    if(e>.78&&st.once('dis')){const rb=E.rng(sd^0x7d1);
     E.burst(rb,tc,fy,m?8:26,{speed:[20,120],ang:[0,TAU],size:[8,16],life:[cap(.5),cap(.9)],gy:-20,drag:.7,shape:'mist',c:'#1a0a24',a:.8,tag:'dt'});
     E.burst(rb,tc,fy,m?10:30,{speed:[20,110],ang:[0,TAU],size:[1.4,2.8],life:[cap(.5),cap(1)],gy:-10,drag:.7,shape:'spark',c:DB,c2:DC,a:1,add:true,tag:'dt',vr:[-4,4]})}
   }}
  E.draw(g,'dt');
 }};
 const ATK_SPECIAL=/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng/;
 const NOCODE_ATK=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/;
 const mkState=idx=>{
  const st={sd:(++CNT*6007+idx*173)>>>0,last:0,t:0,f:{},c:{}};
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
  }catch(e){window.__fxErr='37: '+(e&&e.message);if(window.__ATK17_DEBUG)throw e}
  return res;
 };
 API.setFxStyle=v=>{STY=v==='sm'?'sm':'px';if(prevSty)prevSty(v)};
}
boot();
})();
