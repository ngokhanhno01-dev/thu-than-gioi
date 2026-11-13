/* ===== 34-attack-fx-2b.js — [FX 2B] Vùng 6-9 vẽ bằng CODE (không ảnh): Dương Sơn, Huyền Uyên, Kim Khoáng, Ngọc Động =====
   Chạy SAU 33-attack-fx.js: bọc lại API.drawAttack / drawImpact, chỉ nhận vùng 6-9, mọi thứ khác chuyển nguyên cho 33.
   Cùng quy ước với 33: trúng lúc t=.665s (u=.35), hết đòn t=1.68s, lớp pixel nửa độ phân giải, hạt dùng engine riêng (không Math.random). */
(()=>{
'use strict';
let tries=0;
function boot(){
 const API=window.TTGCombatFX;
 if(!API||!API.engine||!API.__atk17||!API.codeZone){if(tries++<200)setTimeout(boot,50);return}
 if(API.__fx2b)return;
 API.__fx2b=1;
 const prevA=API.drawAttack,prevI=API.drawImpact,prevCZ=API.codeZone,prevSty=API.setFxStyle,zones=API.zones,E=API.engine;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const zi=s=>Math.max(0,Math.min(zones.length-1,Number(s)||0));
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const ph=E.ph,eo=E.eOut,TAU=Math.PI*2;
 const strokePts=(g,p)=>{g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.stroke()};
 /* ---- lớp pixel (giống 33): vẽ nửa độ phân giải, 6 mức/kênh, rồi phóng to không làm mịn ---- */
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
 /* cục mây/khói/lửa phồng nhiều thùy (3 lớp bóng → thân → sáng) */
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
 const wrap=(key,run)=>(g,T,S)=>{
  const u=clamp(S.u||0,0,1),s=E.seed(key,u);
  E.setSpeed(window.BSPD||1);
  if(E.once(s,'init'))E.clear();
  layer(g,gg=>run(gg,T,u*1.9,!!S.pa,!!S.miss,!!S.cr,s));
  return true;
 };

 /* ================= 6 DƯƠNG SƠN (xa): thiên thạch lửa giáng chéo =================
    Tụ lực: lửa ở tay + vầng dương (vòng + tia) mở ra trên cao → thiên thạch chui ra, rơi chéo tăng tốc, kéo đuôi lửa 2 lớp + 2 mảnh phụ + tàn lửa + khói.
    Trúng: cầu lửa 3 lớp, vầng dương tàn sau lưng, sóng nóng, tia nắng trên đất, hố cháy nứt dung nham nguội dần, đá nóng nảy đất, tàn lửa bay lên. */
 const FIRE={sh:'#6a1a08',md:'#ff7a28',lt:'#ffd070'},SMOKE={sh:'#2a1c18',md:'#5a4038',lt:'#8a6a58'};
 function sunGlyph(g,x,y,R,a,rot,t){
  if(a<=.01||R<2)return;
  E.wave(g,x,y,R,'#ffa94d',a,1.6,{sq:1,t:t,seed:3});E.wave(g,x,y,R*.62,'#ffe08a',a*.9,1.2,{sq:1,t:t,seed:4});
  g.save();g.globalCompositeOperation='lighter';g.translate(x,y);g.rotate(rot);
  for(let i=0;i<12;i++){const an=i*TAU/12,l=i%2?R*1.28:R*1.5,w=.11;g.fillStyle=E.rgba(i%2?'#ff7a28':'#ffd070',a*.8);
   g.beginPath();g.moveTo(Math.cos(an-w)*R*1.04,Math.sin(an-w)*R*1.04);g.lineTo(Math.cos(an)*l,Math.sin(an)*l);g.lineTo(Math.cos(an+w)*R*1.04,Math.sin(an+w)*R*1.04);g.closePath();g.fill()}
  g.restore();
 }
 function sunRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),sd=s.seed,r=E.rng(sd^0x6d1),
   cap=l=>Math.max(.12,Math.min(l,END-t)),CA='#ffa94d',CR='#ff4a1a',CY='#ffe08a',
   S0=[tc-dir*120,-22],E0=[tc,GY-16],hx=x0+dir*26,hy=150;
  /* --- tụ lực: lửa ở tay, vòng lửa, dòng lửa bay lên vầng dương trên cao --- */
  const ch=ph(t,0,.3),chOut=1-ph(t,.3,.46);
  if(t<.5){
   E.glow(g,hx,hy,(16+22*eo(ch))*chOut,CA,.6*chOut);
   for(let i=0;i<7;i++){const an=i/7*TAU+t*9,d=(1-ch)*34+7;E.glow(g,hx+Math.cos(an)*d,hy+Math.sin(an)*d*.7,4+2*ch,i%2?CR:CY,(.4+.5*ch)*chOut)}
   E.wave(g,x0,GY,10+28*eo(ch),CA,.8*chOut,1.6,{seed:sd,t:T,sq:.3});
   const bp=E.curve(hx,hy,S0[0],S0[1]+16,16,10,1.5,t*7),k=ph(t,.04,.3),cut=Math.max(2,Math.floor(bp.length*k));
   E.ribbon(g,bp.slice(0,cut),q=>1+4*q,CR,.8*chOut,{core:CY});
   for(let n=E.rate(s,'ch',ph(t,0,.3),46);n>0;n--)E.emit({x:hx+r.range(-14,14),y:hy+r.range(-10,10),vx:r.range(-10,10),vy:r.range(-60,-20),gy:-30,life:r.range(.3,.5),s0:r.range(2,3.4),s1:.5,shape:'orb',c:CA,c2:CY,a:.9,add:true,tag:'z6'});
  }
  {const ga=ph(t,.05,.24)*(1-ph(t,.5,.72));
   if(ga>0){sunGlyph(g,S0[0],S0[1]+18,(26+14*eo(ph(t,.05,.3)))*sc,ga*.95,t*1.6,T);E.glow(g,S0[0],S0[1]+18,60*sc,CR,.3*ga)}}
  /* trời nóng phía trên khi thiên thạch rơi */
  E.glow(g,tc-dir*30,20,90,CR,.18*ph(t,.25,.5)*(1-ph(t,TH,TH+.4)));
  /* --- thiên thạch --- */
  const fp=ph(t,.28,TH),pos=q=>{const k=Math.pow(clamp(q,0,1),1.75);return[S0[0]+(E0[0]-S0[0])*k,S0[1]+(E0[1]-S0[1])*k]};
  if(t>=.28&&t<TH+.01){
   const hd=pos(fp),sz=sc*(.55+.45*eo(ph(t,.28,.42)));
   const mk=(off,wid,col,core,al)=>{const pts=[];for(let i=0;i<=11;i++){const p=pos(fp-(11-i)*.045*(1+.2*off)),wv=Math.sin(i*.9+t*18+off*3)*(2+off*2)*(1-i/11*.5);pts.push([p[0]+wv,p[1]+wv*.4])}
    E.ribbon(g,pts,q=>wid*(.1+.9*Math.pow(q,.8)),col,al,{core:core})};
   mk(0,30*sz,CR,CA,.85);mk(.6,19*sz,CA,CY,.9);
   [[-1,.07,10],[1,.12,8]].forEach((f,i)=>{const p=pos(fp-f[1]),px=p[0]+f[0]*dir*-14,py=p[1]-8*f[0];
    const pts=[];for(let j=0;j<=6;j++){const q=pos(fp-f[1]-(6-j)*.04);pts.push([q[0]+f[0]*dir*-14,q[1]-8*f[0]])}
    E.ribbon(g,pts,q=>f[2]*sz*(.15+.85*q),CA,.7,{core:CY});E.blob(g,px,py,f[2]*.8*sz,f[2]*.7*sz,CA,.85,T,sd+i*9,{core:CY,wob:.35})});
   E.blob(g,hd[0],hd[1],24*sz,22*sz,CR,.8,T,sd,{core:CA,wob:.3,speed:3});
   E.blob(g,hd[0],hd[1],15*sz,14*sz,CA,.9,T,sd+4,{core:CY,wob:.3,speed:4});
   g.save();g.translate(hd[0],hd[1]);g.rotate(t*5);
   const rp=[];for(let i=0;i<9;i++){const an=i/9*TAU,rr=(8.5+3*hs(i+sd%17))*sz;rp.push([Math.cos(an)*rr,Math.sin(an)*rr])}
   polyPath(g,rp);g.fillStyle='#3a1c12';g.fill();g.strokeStyle='#ffb050';g.lineWidth=1.3;g.stroke();
   g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(CR,.9);g.lineWidth=1.2;
   g.beginPath();g.moveTo(-5*sz,-2*sz);g.lineTo(-1*sz,1*sz);g.lineTo(4*sz,-3*sz);g.moveTo(-1*sz,1*sz);g.lineTo(1*sz,6*sz);g.stroke();g.restore();
   for(let n=E.rate(s,'tr',ph(t,.28,TH),90);n>0;n--){const a2=r.range(-.7,.7);
    E.emit({x:hd[0]+r.range(-6,6),y:hd[1]+r.range(-6,6),vx:-dir*r.range(10,60)+Math.cos(a2)*20,vy:-r.range(-30,50),gy:140,drag:.8,life:r.range(.3,.7),s0:r.range(1.8,3.6),s1:.6,shape:r()<.3?'streak':'orb',c:r()<.5?CA:CR,c2:CY,a:.95,add:true,tag:'z6'})}
   for(let n=E.rate(s,'sm',ph(t,.3,TH),24);n>0;n--)E.emit({x:hd[0]-r.range(0,14)*dir,y:hd[1]-r.range(0,10),vx:r.range(-10,10),vy:r.range(-24,-4),life:r.range(.5,.9),s0:6,s1:r.range(14,22),shape:'mist',c:'#3a2820',a:.8,tag:'z6'});
  }
  /* --- va chạm --- */
  if(t>=TH-.02){
   const p=ph(t,TH,TH+.6),fo=1-ph(t,TH+.2,TH+.75);
   if(E.once(s,'hit')){
    const rb=E.rng(sd^0x77a);
    E.burst(rb,tc,GY-10,miss?18:42,{speed:[40,200],ang:[-Math.PI*.97,-Math.PI*.03],size:[1.6,3.6],life:[cap(.5),cap(1.1)],gy:210,drag:.5,shape:'orb',c:CA,c2:CY,a:1,add:true,tag:'z6'});
    E.burst(rb,tc,GY-10,miss?8:20,{speed:[90,250],ang:[-Math.PI*.95,-Math.PI*.05],size:[2.2,4],life:[cap(.4),cap(.8)],gy:320,drag:.3,shape:'streak',c:CR,c2:CY,a:1,add:true,tag:'z6'});
    E.burst(rb,tc,GY-6,miss?4:11,{speed:[50,170],ang:[-Math.PI*.95,-Math.PI*.05],size:[3,6],life:[cap(.6),cap(1.1)],gy:380,drag:.2,shape:'shard',c:'#4a2418',c2:'#ff8a30',a:1,tag:'z6',vr:[-9,9],floor:GY+4,bounce:.35});
    E.burst(rb,tc,GY-8,miss?3:7,{speed:[6,30],ang:[-Math.PI*.9,-Math.PI*.1],size:[12,22],life:[cap(.8),cap(1.3)],gy:-16,drag:.8,shape:'mist',c:'#34241e',a:.85,tag:'z6'});
   }
   if(!miss){
    E.blob(g,tc,GY-16-p*22,(20+24*eo(p))*sc,(14+18*eo(p))*sc,CR,.5*fo,T,sd+2,{core:CA,wob:.4,speed:4});
    E.blob(g,tc,GY-14-p*20,(13+16*eo(p))*sc,(10+12*eo(p))*sc,CA,.55*fo,T,sd+3,{core:CY,wob:.4,speed:5});
    E.blob(g,tc,GY-12-p*16,(6+9*eo(p))*sc,(5+7*eo(p))*sc,CY,.55*fo,T,sd+4,{core:'#fff0b0',wob:.4,speed:6});
    const sa=ph(t,TH,TH+.1)*(1-ph(t,TH+.35,TH+.95));
    sunGlyph(g,tc,GY-70,(30+12*eo(p))*sc,.3*sa,-t*1.8,T);
    for(let k=0;k<3;k++)E.wave(g,tc,GY,(8+(120-k*22)*eo(ph(t,TH+k*.04,TH+.85)))*(cr?1.1:1),[CR,CA,CY][k],(1-ph(t,TH+.2+k*.04,TH+.85))*(.8-k*.1),2-k*.4,{seed:sd+k,t:T,sq:.28});
    g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
    for(let i=0;i<14;i++){const an=i/14*TAU+.2,r1=10+30*eo(p),r2=r1+(26+30*hs(i))*eo(p);g.strokeStyle=E.rgba(i%2?CA:CY,.7*fo);g.lineWidth=i%2?2:1.2;
     g.beginPath();g.moveTo(tc+Math.cos(an)*r1*1.4,GY+Math.sin(an)*r1*.3);g.lineTo(tc+Math.cos(an)*r2*1.4,GY+Math.sin(an)*r2*.3);g.stroke()}
    g.restore();
   }
   const sc2=ph(t,TH,TH+.1)*(1-ph(t,1.3,END));
   if(sc2>0){E.blob(g,tc,GY+3,(miss?22:34)*sc,7,'#1a0e0a',.65*sc2,T,sd+8,{add:false,core:'#0a0504',wob:.25});
    if(!miss){const heat=1-ph(t,TH+.1,1.05);g.save();g.lineCap='round';g.lineJoin='round';
     for(let i=0;i<8;i++){const rb=E.rng(sd+700+i),an=i/8*TAU+rb.range(-.25,.25),L=(24+rb.range(0,32))*eo(ph(t,TH,TH+.2)),pp=E.jag(rb,tc,GY+3,tc+Math.cos(an)*L,GY+3+Math.sin(an)*L*.3,5,3);
      g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(CR,.9*heat*sc2);g.lineWidth=1.3;strokePts(g,pp)}
     g.restore()}}
   for(let n=E.rate(s,'ft',ph(t,TH,TH+.9),miss?20:55);n>0;n--)E.emit({x:tc+r.range(-46,46),y:GY-r.range(0,10),vx:r.range(-12,12),vy:r.range(-60,-24),gy:-8,drag:.4,life:cap(r.range(.6,1.1)),s0:r.range(1.4,2.6),s1:.5,shape:'orb',c:CA,c2:CY,a:.95,add:true,tag:'z6'});
   if(!miss)for(let i=0;i<5;i++){const q=ph(t,TH+.05+i*.05,TH+1);puff(g,tc+(hs(i+20)-.5)*70,GY-6-q*40,5+8*q,Math.sin(q*Math.PI)*.3,T,sd+300+i*7,1,SMOKE)}
  }
  E.draw(g,'z6');
 }

 /* ================= 7 HUYỀN UYÊN (gần): chém xé khe nứt không gian =================
    Lấy đà: nứt hairline tím quanh người đánh. Nhát chém quét chéo → khe nứt tím đen mở ra (bên trong tinh vân + sao), vết nứt toả ra không gian,
    hút khí vào tâm (vệt tím + khói đen). Khe thứ hai bắt chéo lệch nhịp. Trúng: khe khép lại cái "tách", mảnh không gian vỡ văng, ấn rune dưới đất. */
 const VA='#947aff',VB='#c9baff',VD='#12062a',VM='#3a1c8a';
 function rift(g,T,cx,cy,len,w,ang,open,a,sd,t){
  if(open<=.02||a<=.02)return;
  const n=18,ca=Math.cos(ang),sa=Math.sin(ang),L=[],R=[];
  for(let i=0;i<=n;i++){const k=i/n,b=Math.pow(Math.sin(k*Math.PI),.75),jt=1+.35*E.noise(sd*.01+i*1.9+t*3)+((i%2)?.12:-.1),hw=w*open*b*jt,off=(k-.5)*len;
   L.push([cx+ca*off-sa*hw*-1,cy+sa*off+ca*hw*-1]);R.push([cx+ca*off-sa*hw,cy+sa*off+ca*hw])}
  const path=()=>{g.beginPath();L.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));for(let i=R.length-1;i>=0;i--)g.lineTo(R[i][0],R[i][1]);g.closePath()};
  g.save();g.globalAlpha=a;path();
  const gr=g.createRadialGradient(cx,cy,0,cx,cy,Math.max(len,w*3)*.55);gr.addColorStop(0,'#04010a');gr.addColorStop(.55,VD);gr.addColorStop(1,VM);
  g.fillStyle=gr;g.fill();
  g.save();path();g.clip();
  E.blob(g,cx,cy,w*open*1.6,len*.22,'#6a3cff',.55,t,sd,{rot:ang+Math.PI/2,core:'#c9baff',wob:.4,speed:3});
  for(let i=0;i<16;i++){const k=hs(i+sd%11),off=(k-.5)*len*.8,sy=(hs(i*3+1)-.5)*w*open*1.4,tw=.5+.5*Math.sin(t*9+i*2.3);
   star4(g,cx+ca*off-sa*sy,cy+sa*off+ca*sy,1.3+2.2*hs(i+7),i%3?VB:'#ffffff',(.5+.5*tw)*a,t*2+i)}
  g.restore();
  g.globalCompositeOperation='lighter';g.lineJoin='round';
  path();g.strokeStyle=E.rgba(VA,.35*a);g.lineWidth=6;g.stroke();
  path();g.strokeStyle=E.rgba(VB,.9*a);g.lineWidth=1.6;g.stroke();
  const rr=E.rng(sd+5);
  for(let i=0;i<6;i++){const sg=i%2?1:-1,end=i<2?1:0,p0=end?(sg>0?R[n-1]:L[n-1]):(sg>0?R[1]:L[1]),an2=ang+(end?0:Math.PI)+sg*rr.range(.2,.9),Ln=(26+rr.range(0,40))*open;
   g.strokeStyle=E.rgba(VA,.8*a);g.lineWidth=1.2;strokePts(g,E.jag(rr,p0[0],p0[1],p0[0]+Math.cos(an2)*Ln,p0[1]+Math.sin(an2)*Ln,5,4))}
  g.restore();
 }
 function voidRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,u=t/1.9,sd=s.seed,r=E.rng(sd^0x7e1),cap=l=>Math.max(.12,Math.min(l,END-t)),
   lk=miss?.6:1,ax=x=>pa?85+.84*lungeX(x)*lk:272-.78*lungeX(x)*lk,sc=(miss?.78:1)*(cr?1.18:1),cx=tc-dir*8,cy=GY-58;
  /* lấy đà: nứt hairline quanh người đánh */
  if(u<.22){const bx=ax(u),c=ph(u,0,.14),o=1-ph(u,.14,.24);
   E.glow(g,bx,GY-40,34*eo(c),VA,.4*o);
   for(let i=0;i<5;i++){const rb=E.rng(sd+i*11+Math.floor(t*14)),an=i/5*TAU+rb.range(-.3,.3);g.save();g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(VB,.8*o*c);g.lineWidth=1.2;
    strokePts(g,E.jag(rb,bx+Math.cos(an)*6,GY-40+Math.sin(an)*10,bx+Math.cos(an)*(16+24*c),GY-40+Math.sin(an)*(22+30*c),5,3));g.restore()}
   E.wave(g,bx,GY,8+24*eo(c),VA,.7*o,1.4,{seed:sd,t:T,sq:.3})}
  /* vệt lao: bóng tím */
  if(u>.1&&u<.55){const al=1-ph(u,.42,.55);for(let j=0;j<6;j++){const uj=Math.max(0,u-j*.026),x=ax(uj)-dir*(6+j*3);E.blob(g,x,GY-34,10+j,24,VA,.4*al*(1-j/6),T,sd+j,{core:VB,wob:.3})}
   for(let m=E.rate(s,'rs',ph(u,.1,.42),26);m>0;m--)E.emit({x:ax(u)-dir*r.range(4,20),y:GY-r.range(6,60),vx:-dir*r.range(8,40),vy:r.range(-10,10),life:cap(r.range(.3,.6)),s0:r.range(1.4,2.4),s1:.5,shape:'orb',c:VA,c2:VB,a:.9,add:true,tag:'z7'})}
  /* nhát chém quét chéo tạo khe */
  const cutP=(t0,sg,len)=>{const k=eo(ph(t,t0,t0+.1)),tl=ph(t,t0+.07,t0+.24),pts=[];
   for(let i=0;i<=8;i++){const q=tl+(k-tl)*i/8;if(k<=tl+.02)return;const o=(q-.5)*len;pts.push([cx+dir*sg*o*.46,cy+o])}
   E.ribbon(g,pts,q=>1.5+4*q,VA,.9*(1-ph(t,t0+.2,t0+.3)),{core:'#ffffff'})};
  cutP(TH-.3,1,118*sc);cutP(TH-.22,-1,96*sc);
  /* hai khe nứt (khe 2 nhỏ hơn, bắt chéo, lệch nhịp) */
  const op=(t0)=>eo(ph(t,t0,t0+.16))*(1-E.eIn(ph(t,TH+.3,TH+.62))),fa=1-ph(t,TH+.55,TH+.7);
  const mis=miss?.7:1;
  rift(g,T,cx,cy,128*sc*mis,15*sc,Math.PI/2+dir*.22,op(TH-.28),.92*fa,sd,t);
  rift(g,T,cx,cy+4,100*sc*mis,11*sc,Math.PI/2-dir*.55,op(TH-.2),.88*fa,sd+77,t);
  /* hút khí vào tâm */
  const sk=ph(t,TH-.2,TH+.3)*(1-ph(t,TH+.28,TH+.34));
  if(sk>0){for(let n=E.rate(s,'su',ph(t,TH-.2,TH+.28),110);n>0;n--){const an=r()*TAU,d=r.range(46,104),px=cx+Math.cos(an)*d,py=cy+Math.sin(an)*d*.8,v=r.range(1.8,2.8);
    E.emit({x:px,y:py,vx:(cx-px)*v,vy:(cy-py)*v,life:.4,s0:r.range(1.8,3),s1:.6,shape:r()<.5?'streak':'orb',c:VA,c2:VB,a:.95,add:true,tag:'z7'})}
   for(let n=E.rate(s,'sk',ph(t,TH-.1,TH+.28),30);n>0;n--){const an=r()*TAU,d=r.range(40,80),px=cx+Math.cos(an)*d,py=cy+Math.sin(an)*d*.8;
    E.emit({x:px,y:py,vx:(cx-px)*1.6,vy:(cy-py)*1.6,life:.45,s0:10,s1:3,shape:'mist',c:'#1a0a38',a:.8,tag:'z7'})}
   E.wave(g,cx,cy,(1-ph(t,TH-.1,TH+.3))*58+6,VA,.5*sk,1.3,{sq:1.3,seed:sd,t:T})}
  /* trúng: tách! khe khép, mảnh không gian vỡ, rune dưới đất */
  if(t>=TH+.3&&E.once(s,'snap')){
   const rb=E.rng(sd^0x3a9);
   E.burst(rb,cx,cy,miss?10:26,{speed:[40,170],ang:[0,TAU],size:[3,7],life:[cap(.5),cap(1)],gy:260,drag:.5,shape:'shard',c:'#1a0a38',c2:VB,a:1,tag:'z7',vr:[-10,10],floor:GY+4,bounce:.3});
   E.burst(rb,cx,cy,miss?8:18,{speed:[30,140],ang:[0,TAU],size:[1.6,3],life:[cap(.4),cap(.9)],gy:60,drag:.8,shape:'spark',c:VA,c2:'#ffffff',a:1,add:true,tag:'z7',vr:[-6,6]});
   E.burst(rb,cx,cy+10,miss?3:7,{speed:[8,40],ang:[-Math.PI,0],size:[12,20],life:[cap(.7),cap(1.2)],gy:-14,drag:.9,shape:'mist',c:'#241048',a:.85,tag:'z7'})}
  if(t>=TH+.28){const sp=ph(t,TH+.28,TH+.45)*(1-ph(t,TH+.5,TH+.75));
   if(sp>0){E.wave(g,cx,cy,8+40*eo(ph(t,TH+.28,TH+.65)),VA,.7*sp,1.6,{sq:1.3,seed:sd+2,t:T});E.glow(g,cx,cy,44,VA,.3*sp)}}
  if(!miss&&t>TH-.1){const a=ph(t,TH-.05,TH+.15)*(1-ph(t,1.15,1.62)),R0=50*sc;
   if(a>0){E.wave(g,tc,GY,R0,VA,.8*a,1.6,{seed:sd+9,t:T,sq:.3});E.wave(g,tc,GY,R0*.62,VB,.6*a,1.2,{seed:sd+10,t:T,sq:.3});
    g.save();g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(VA,.6*a);g.lineWidth=1.2;
    for(let i=0;i<6;i++){const an=t*.9+i*TAU/6;g.beginPath();g.moveTo(tc+Math.cos(an)*R0*.3,GY+Math.sin(an)*R0*.09);g.lineTo(tc+Math.cos(an)*R0,GY+Math.sin(an)*R0*.3);g.stroke()}
    g.restore();
    for(let i=0;i<4;i++){const an=-t*1.3+i*TAU/4;hexa(g,tc+Math.cos(an)*R0*.8,GY+Math.sin(an)*R0*.8*.3,4,t*2+i,1,VB,.9*a,1.2)}}}
  E.draw(g,'z7');
 }

 /* ================= 8 KIM KHOÁNG (gần): chém kim loại liên hoàn =================
    Ánh kim tụ trên người đánh → 5 nhát chém sắc như lưỡi dao liên hoàn từ các góc (nhát cuối nặng nhất, trúng đúng lúc), mỗi nhát: lưỡi trắng nóng viền vàng,
    ánh kim lóe ở mũi, tia lửa kim loại + mảnh kim loại nảy đất, vòng chấn "keng". Vệt chém ở lại phát sáng vàng rồi nguội thành cam đậm. Bụi vàng toả khi cuối. */
 const KG='#e0b038',KL='#fff2a8',KO='#c8741c';
 function blade(g,x0,y0,x1,y1,w,a,bend,col){
  if(a<=.02)return;
  const mx=(x0+x1)/2,my=(y0+y1)/2,dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;
  g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';
  const gr=g.createLinearGradient(x0,y0,x1,y1);gr.addColorStop(0,E.rgba(col,0));gr.addColorStop(.35,E.rgba(col,a*.8));gr.addColorStop(1,E.rgba(KL,a));
  g.fillStyle=gr;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(mx+nx*(w+bend),my+ny*(w+bend),x1,y1);g.quadraticCurveTo(mx+nx*(bend-w*.22),my+ny*(bend-w*.22),x0,y0);g.closePath();g.fill();
  g.strokeStyle=E.rgba('#ffffff',a*.85);g.lineWidth=1.2;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(mx+nx*(w+bend),my+ny*(w+bend),x1,y1);g.stroke();
  g.restore();
 }
 function metalRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,tc=miss?tx-dir*80:tx,u=t/1.9,sd=s.seed,r=E.rng(sd^0x8a3),cap=l=>Math.max(.12,Math.min(l,END-t)),
   lk=miss?.6:1,ax=x=>pa?85+.84*lungeX(x)*lk:272-.78*lungeX(x)*lk,sc=(miss?.8:1)*(cr?1.18:1),cy=GY-54;
  if(u<.22){const bx=ax(u),c=ph(u,0,.14),o=1-ph(u,.14,.24);
   E.glow(g,bx,GY-44,26*eo(c),KG,.35*o);
   for(let i=0;i<4;i++){const an=t*7+i*1.571,d=(1-c)*26+10;star4(g,bx+Math.cos(an)*d,GY-44+Math.sin(an)*d*.8,2+3*c,i%2?KL:KG,(.4+.5*c)*o,an)}
   star4(g,bx+dir*10,GY-60,4+8*c,KL,.8*o*c,0)}
  if(u>.1&&u<.55){const al=1-ph(u,.42,.55);for(let j=0;j<5;j++){const uj=Math.max(0,u-j*.026),x=ax(uj)-dir*(8+j*4);g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(KG,.5*al*(1-j/5));g.fillRect(x-1,GY-60+j,2,50-j*4);g.restore()}
   for(let m=E.rate(s,'rs',ph(u,.1,.42),22);m>0;m--)E.emit({x:ax(u)-dir*r.range(4,18),y:GY-r.range(8,64),vx:-dir*r.range(20,80),vy:r.range(-20,20),gy:200,life:cap(r.range(.3,.5)),s0:r.range(1.2,2),s1:.5,shape:'streak',c:KG,c2:KL,a:.9,add:true,tag:'z8'})}
  /* 5 nhát: [thời điểm, x0,y0, x1,y1, độ dày] (toạ độ so với tâm mục tiêu, nhân dir cho x) */
  const SL=[[TH-.36,-46,-98,34,-12,13],[TH-.28,50,-92,-36,-8,13],[TH-.21,-66,-56,62,-48,12],[TH-.13,28,-104,-22,-4,14],[TH-.03,-58,-104,50,-2,22]];
  SL.forEach((q,i)=>{
   const x0=tc+dir*q[1]*sc,y0=GY+q[2]*sc+0,x1=tc+dir*q[3]*sc,y1=GY+q[4]*sc,k=eo(ph(t,q[0],q[0]+.07)),tl=ph(t,q[0]+.06,q[0]+.17),stay=1-ph(t,q[0]+.17,q[0]+1.1);
   if(t<q[0])return;
   const hx=x0+(x1-x0)*k,hy=y0+(y1-y0)*k;
   if(tl<1&&k>.05){const sx=x0+(x1-x0)*tl,sy=y0+(y1-y0)*tl;blade(g,sx,sy,hx,hy,q[5]*sc*(1-.5*tl),1-tl*.3,-4*(i%2?1:-1),KG);star4(g,hx,hy,(7+6*(i===4))*(1-tl),KL,.9*(1-tl),t*3)}
   const heat=ph(stay,0,1);
   if(k>=1)blade(g,x0,y0,x1,y1,q[5]*.42*sc,stay*.9,-4*(i%2?1:-1),heat>.5?KG:KO);
   if(t>=q[0]+.05&&E.once(s,'sl'+i)){
    const rb=E.rng(sd+i*131),mx=(x0+x1)/2,my=(y0+y1)/2,big=i===4?1.8:1;
    E.burst(rb,mx,my,Math.round((miss?8:15)*big),{speed:[70,240],ang:[-Math.PI,0],size:[1.6,3],life:[cap(.4),cap(.9)],gy:400,drag:.25,shape:'streak',c:KG,c2:KL,a:1,add:true,tag:'z8',floor:GY+4,bounce:.4});
    E.burst(rb,mx,my,Math.round(3*big),{speed:[60,200],ang:[-Math.PI,0],size:[2.6,4.6],life:[cap(.6),cap(1)],gy:440,drag:.15,shape:'shard',c:'#a8862c',c2:KL,a:1,tag:'z8',vr:[-12,12],floor:GY+4,bounce:.38});
    if(i===4)E.burst(rb,tc,GY-6,miss?10:26,{speed:[20,120],ang:[-Math.PI,0],size:[6,12],life:[cap(.6),cap(1.1)],gy:-6,drag:1,shape:'mist',c:'#d8b860',a:.6,tag:'z8'})
   }
   const d=t-q[0]-.05;if(d>0&&d<.14){E.wave(g,(x0+x1)/2,(y0+y1)/2,4+30*eo(d/.14),KL,(1-d/.14)*.8,1.4,{sq:1,seed:sd+i,t:T});E.glow(g,(x0+x1)/2,(y0+y1)/2,26+8*(i===4),KG,.3*(1-d/.14))}
  });
  if(t>=TH-.03){const p=ph(t,TH-.03,TH+.7);
   if(!miss){E.wave(g,tc,GY,8+104*eo(p),KG,(1-ph(p,.25,1))*.8,2,{seed:sd+5,t:T,sq:.28});E.wave(g,tc,GY,5+64*eo(p),KL,(1-ph(p,.2,.8))*.6,1.3,{seed:sd+6,t:T,sq:.28});
    E.glow(g,tc,cy,52,KG,.28*ph(t,TH-.03,TH+.02)*(1-ph(t,TH+.05,TH+.4)));
    const gs=ph(t,TH,TH+.1)*(1-ph(t,1.3,END));
    g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
    for(let i=0;i<3;i++){const L=(20+16*i)*sc;g.strokeStyle=E.rgba(i?KG:KL,.7*gs);g.lineWidth=1.2;g.beginPath();g.moveTo(tc-L+i*9,GY+2+i*2);g.lineTo(tc+L-i*6,GY+3+i*2);g.stroke()}
    g.restore()}}
  for(let n=E.rate(s,'dust',ph(t,TH,TH+.8),miss?10:32);n>0;n--)E.emit({x:tc+r.range(-40,40),y:GY-r.range(0,50),vx:r.range(-10,10),vy:r.range(-10,14),gy:30,life:cap(r.range(.6,1)),s0:r.range(1,1.9),s1:.5,shape:'spark',c:KG,c2:KL,a:.95,add:true,tag:'z8',vr:[-3,3]});
  E.draw(g,'z8');
 }

 /* ================= 9 NGỌC ĐỘNG (xa): linh khí ngọc uốn lượn như rắn =================
    Lục giác ngọc tụ ở tay → 3 dải linh khí ngọc bơi như rắn (thân thon, lấp lánh vảy, lục giác ngọc trôi dọc thân) vượt nhau tới quái.
    Trúng: hoa sen linh khí nở dưới chân (3 lớp cánh, ép dẹt), hoa nhỏ nở trên đầu, trụ ngọc, đốm sáng + cánh hoa bay lên, ấn lục giác trên đất. */
 const JA='#18e0b0',JB='#c8fff0',JD='#0a6a58';
 function lotus(g,cx,cy,R,sq,open,a,rot,t){
  if(open<=.02||a<=.02)return;
  const layers=[[8,1,0,.5],[8,.74,TAU/16,.64],[6,.48,.3,.8]];
  g.save();g.translate(cx,cy);g.scale(1,sq);g.lineJoin='round';
  layers.forEach((ly,li)=>{
   const o=eo(ph(open,li*.18,.55+li*.18)),n=ly[0],L=R*ly[1]*o,W=L*.34;if(o<=.02)return;
   for(let i=0;i<n;i++){
    const an=rot+ly[2]+i*TAU/n,ca=Math.cos(an),sa=Math.sin(an),bw=1+.06*Math.sin(t*3+i+li);
    g.save();g.rotate(an);g.globalAlpha=a*(.8+.2*ly[3]);
    const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,JD);gr.addColorStop(.55,JA);gr.addColorStop(1,JB);
    g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*.25,-W*1.1*bw,L*.8,-W*.8,L,0);g.bezierCurveTo(L*.8,W*.8,L*.25,W*1.1*bw,0,0);g.fill();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(JB,.75*a);g.lineWidth=1.3;g.stroke();
    g.strokeStyle=E.rgba(JB,.4*a);g.lineWidth=1;g.beginPath();g.moveTo(L*.1,0);g.lineTo(L*.85,0);g.stroke();
    g.restore();
   }
  });
  g.restore();
  E.glow(g,cx,cy-R*.1,R*.45,JA,.45*a*open);
 }
 function jadeRun(g,T,t,pa,miss,cr,s){
  const GY=204,TH=.665,END=1.68,dir=pa?1:-1,tx=pa?272:85,x0=pa?85:272,tc=miss?tx-dir*80:tx,sc=(miss?.78:1)*(cr?1.2:1),sd=s.seed,r=E.rng(sd^0x9c5),
   cap=l=>Math.max(.12,Math.min(l,END-t)),hx=x0+dir*26,hy=150,ty=148;
  /* tụ: lục giác ngọc xoay ở tay */
  const ch=ph(t,0,.28),co=1-ph(t,.28,.46);
  if(t<.5){
   E.glow(g,hx,hy,(14+22*eo(ch))*co,JA,.55*co);
   for(let i=0;i<3;i++)hexa(g,hx,hy,(30-i*8)*(1-.5*ch)+6,t*(3+i)*(i%2?-1:1),1,i%2?JB:JA,.9*co,1.4);
   for(let n=E.rate(s,'ch',ph(t,0,.28),40);n>0;n--){const an=r()*TAU,d=r.range(34,60);E.emit({x:hx+Math.cos(an)*d,y:hy+Math.sin(an)*d*.7,vx:-Math.cos(an)*d*3,vy:-Math.sin(an)*d*2,life:.3,s0:r.range(1.6,2.6),s1:.5,shape:'orb',c:JA,c2:JB,a:.9,add:true,tag:'z9'})}
   E.wave(g,x0,GY,8+26*eo(ch),JA,.7*co,1.5,{seed:sd,t:T,sq:.3})
  }
  /* 3 rắn ngọc */
  const fp=eo(ph(t,.22,TH)),sh=ph(t,TH+.02,TH+.3);
  for(let k=0;k<3;k++){
   const ph0=k*2.09,delay=k*.035,hp=clamp(eo(ph(t,.22+delay,TH)),0,1),vis=1-ph(t,TH+.02+k*.03,TH+.34);
   if(hp<=.01||vis<=0)continue;
   const sx=hx,sy=hy+(k-1)*8,ex=tc-dir*10,ey=ty+(k-1)*18,pts=[],N=36,amp=(15+4*k)*(miss?.8:1)*(1-.3*ph(t,TH-.1,TH));
   for(let i=0;i<N;i++){const sp=hp-i*.026;if(sp<0)break;const px=sx+(ex-sx)*sp,py=sy+(ey-sy)*sp,env=Math.sin(Math.min(1,sp)*Math.PI*.9+.1)*amp,wv=Math.sin(sp*TAU*1.6+ph0-t*9)*env;pts.unshift([px,py+wv])}
   if(pts.length>3){
    const lenN=pts.length;
    E.ribbon(g,pts,q=>1+11*Math.sin(Math.min(1,q*1.05)*Math.PI*.55+.05)*(.5+.5*q),JD,.55*vis,{core:JA,add:false});
    E.ribbon(g,pts,q=>1+8*Math.pow(q,.8),JA,.9*vis,{core:JB});
    E.ribbon(g,pts,q=>.5+2.4*q,JB,.9*vis,{core:'#ffffff'});
    for(let i=1;i<lenN-1;i+=3){const p=pts[i],tw=.5+.5*Math.sin(t*14+i+k*2);E.glow(g,p[0],p[1],3+2*tw,JB,.7*vis*(i/lenN))}
    for(let i=2;i<lenN-3;i+=8)hexa(g,pts[i][0],pts[i][1]-6*Math.sin(t*5+i),4+i*.15,t*3+i,1,JB,.7*vis,1.1);
    const hd=pts[lenN-1];E.blob(g,hd[0],hd[1],10*sc,8*sc,JA,.9*vis,T,sd+k*7,{core:JB,wob:.3,speed:4});
    for(let n=E.rate(s,'tr'+k,ph(t,.22,TH),36);n>0;n--)E.emit({x:hd[0]+r.range(-4,4),y:hd[1]+r.range(-4,4),vx:-dir*r.range(6,30),vy:r.range(-24,8),gy:-10,life:cap(r.range(.4,.8)),s0:r.range(1.4,2.6),s1:.4,shape:r()<.35?'petal':'orb',c:JA,c2:JB,a:.95,add:true,tag:'z9',vr:[-4,4],fl:r()<.35?10:0})
   }
  }
  /* hoa sen nở */
  if(t>=TH-.04){
   const o=ph(t,TH-.04,TH+.42),a=(1-ph(t,TH+.5,1.25))*(miss?.6:1),rot=(t-TH)*.5;
   E.wave(g,tc,GY,6+104*eo(ph(t,TH,TH+.8)),JA,(1-ph(t,TH+.2,TH+.8))*.75,2,{seed:sd+5,t:T,sq:.28});
   if(!miss){
    lotus(g,tc,GY-2,60*sc,.36,o,a,rot,T);
    lotus(g,tc,GY-80*sc,24*sc,.8,ph(t,TH+.1,TH+.5),a*.95,-rot*1.6,T);
    const pa2=ph(t,TH,TH+.2)*(1-ph(t,TH+.45,1.3));
    if(pa2>0){g.save();g.globalCompositeOperation='lighter';const gr=g.createLinearGradient(0,GY-130,0,GY);gr.addColorStop(0,E.rgba(JA,0));gr.addColorStop(.6,E.rgba(JA,.2*pa2));gr.addColorStop(1,E.rgba(JB,.3*pa2));
     g.fillStyle=gr;g.fillRect(tc-16,GY-130,32,130);g.restore()}
    const ha=ph(t,TH,TH+.2)*(1-ph(t,1.3,END));
    hexa(g,tc,GY,62*sc,t*.6,.3,JA,.7*ha,1.4);hexa(g,tc,GY,40*sc,-t*.8,.3,JB,.6*ha,1.1)
   }
   if(E.once(s,'bl')){const rb=E.rng(sd^0x41);
    E.burst(rb,tc,GY-12,miss?10:26,{speed:[10,70],ang:[-Math.PI*.97,-Math.PI*.03],size:[3,5],life:[cap(.8),cap(1.4)],gy:-10,drag:.5,shape:'petal',c:JA,c2:JB,a:.95,tag:'z9',vr:[-3,3],fl:9});
    E.burst(rb,tc,GY-8,miss?10:30,{speed:[16,110],ang:[-Math.PI*.97,-Math.PI*.03],size:[1.4,2.8],life:[cap(.7),cap(1.3)],gy:-30,drag:.6,shape:'orb',c:JA,c2:JB,a:1,add:true,tag:'z9'})}
   for(let n=E.rate(s,'rise',ph(t,TH,TH+.95),miss?16:50);n>0;n--)E.emit({x:tc+r.range(-50,50)*sc,y:GY-r.range(0,12),vx:r.range(-6,6),vy:-r.range(30,80),gy:-6,drag:.4,life:cap(r.range(.6,1.2)),s0:r.range(1.4,2.6),s1:.5,shape:r()<.3?'spark':'orb',c:JA,c2:JB,a:1,add:true,tag:'z9'})
  }
  E.draw(g,'z9');
 }

 const ZF={6:wrap('sun',sunRun),7:wrap('void',voidRun),8:wrap('metal',metalRun),9:wrap('jade',jadeRun)};
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
    /* chí mạng "đau thật" của 33 (critPain) lấy màu vùng 0; mượn màu vùng này trong lúc gọi, rồi trả lại. Phần ảnh cũ của vùng 0 không được vẽ vì 33 coi vùng 0 là vùng code. */
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
