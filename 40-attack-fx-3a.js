/* ===== [FX 3A] Bổ sung va chạm cho Sương Cốc, Vân Đảo, Phong Nguyên =====
   Lớp phụ chạy sau 39-attack-fx-2d-detail.js.
   Chỉ vẽ thêm hình ảnh; không đổi sát thương, trạng thái trận hay thời điểm trúng.
   t=.665s là lúc va chạm, theo cùng tiến độ u*1.9 của các hiệu ứng trước.
   Hạt dùng engine riêng E và tag fx3a; không dùng Math.random hoặc ảnh. */
(()=>{
 'use strict';
 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.engine||!API.drawAttack||!API.__atk17||!API.__fx2dd){
   if(tries++<240)setTimeout(boot,50);
   return;
  }
  if(API.__fx3a)return;
  API.__fx3a=1;

  const prevA=API.drawAttack,E=API.engine;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const ph=E.ph,eo=E.eOut,TAU=E.TAU||Math.PI*2;
  const GY=204,TH=.665,END=1.68,TAG='fx3a';
  const NO_EXTRA=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích|Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng/;

  const COL={
   mist:{deep:'#348f88',main:'#59cbbb',light:'#a3e1d4',core:'#e8fffb'},
   cloud:{deep:'#58408f',main:'#946fdf',light:'#c9a8ff',core:'#f3eaff'},
   wind:{deep:'#2f9a73',main:'#58d69a',light:'#82f0bb',core:'#e8fff2'}
  };

  function wave(g,x,y,r,c,a,w,t,seed,sq,wob){
   if(a<=.01||r<1)return;
   E.wave(g,x,y,r,c,clamp(a,0,1),w,{t,seed,sq:sq==null?.28:sq,wob:wob==null?.08:wob,core:'#e8fff2'});
  }
  function blob(g,x,y,rx,ry,c,a,t,seed,core,wob){
   if(a<=.01||rx<1||ry<1)return;
   E.blob(g,x,y,rx,ry,c,clamp(a,0,1),t,seed,{wob:wob==null?.34:wob,speed:2.4,core:core||c});
  }
  function ribbon(g,pts,w,c,a,core){
   if(!pts||pts.length<3||a<=.01)return;
   E.ribbon(g,pts,q=>Math.max(.7,w*(.22+.78*Math.sin(Math.PI*q))),c,clamp(a,0,1),{core:core||'#ffffff'});
  }
  function bubble(g,x,y,r,c,a){
   if(a<=.015||r<.7)return;
   g.save();g.globalCompositeOperation='lighter';g.globalAlpha=clamp(a,0,1);
   g.strokeStyle=E.rgba(c,.8);g.lineWidth=Math.max(.8,r*.22);
   g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();
   g.fillStyle=E.rgba('#ffffff',.72*a);g.beginPath();g.arc(x-r*.28,y-r*.3,Math.max(.55,r*.18),0,TAU);g.fill();
   g.restore();
  }
  function bolt(g,pts,c1,c2,w,a){
   if(!pts||pts.length<2||a<=.01)return;
   g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
   [[w*3.1,c1,.2],[w*1.35,c1,.68],[Math.max(.65,w*.48),c2,.85]].forEach(q=>{
    g.strokeStyle=E.rgba(q[1],q[2]*clamp(a,0,1));g.lineWidth=q[0];g.beginPath();
    pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
   });
   g.restore();
  }
  function aim(S){
   const dir=S.pa?1:-1,tx=S.pa?272:85;
   return {dir,x:S.miss?tx-dir*80:tx,scale:(S.miss?.56:1)*(S.cr?1.22:1),miss:!!S.miss,crit:!!S.cr};
  }
  function burstMist(g,T,t,S,st,a){
   const q=aim(S),r=E.rng(st.seed^0x3a101);
   if(E.once(st,'mist-main')){
    E.burst(r,q.x,GY-9,q.miss?15:q.crit?42:34,{speed:[22,125],ang:[-Math.PI*.98,-Math.PI*.02],
     size:[2.2,5.2],life:[.48,.92],gy:112,drag:.56,shape:'orb',c:COL.mist.main,c2:COL.mist.core,
     a:.92,add:true,tag:TAG,floor:GY+3,bounce:.12});
    E.burst(r,q.x,GY-5,q.miss?4:11,{speed:[14,68],ang:[-Math.PI*.95,-Math.PI*.05],
     size:[8,17],life:[.45,.8],gy:-7,drag:.8,shape:'mist',c:COL.mist.light,
     a:.5,add:true,tag:TAG});
   }
   if(t>=TH+.19&&E.once(st,'mist-aftershock')){
    [-1,1].forEach((side,i)=>E.burst(E.rng(st.seed+0x3a120+i),q.x+side*24*q.scale,GY-4,q.miss?5:12,{
     speed:[20,98],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.8,4.3],life:[.42,.78],gy:150,
     drag:.5,shape:'orb',c:COL.mist.light,c2:COL.mist.core,a:.9,add:true,tag:TAG,
     floor:GY+3,bounce:.08
    }));
   }
   if(t>=TH+.39&&E.once(st,'mist-final')){
    E.burst(E.rng(st.seed^0x3a133),q.x,GY+1,q.miss?4:10,{speed:[10,52],ang:[-Math.PI*.98,-Math.PI*.02],
     size:[1.3,3],life:[.5,.85],gy:185,drag:.65,shape:'orb',c:COL.mist.main,
     c2:COL.mist.core,a:.8,add:true,tag:TAG,floor:GY+3,bounce:.06});
   }
  }
  function mistHit(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,d=t-TH,C=COL.mist,r=E.rng(st.seed^0x3a144^Math.floor(t*100));
   if(d<-.035||d>1.02)return;
   burstMist(g,T,t,S,st);
   /* Ba vòng bọt nước nổ lệch nhịp, nằm sát đất để không che thân mục tiêu. */
   [[0,.48,1], [.16,.48,.72], [.37,.55,.5]].forEach((z,i)=>{
    const start=TH+z[0],p=ph(t,start,start+z[1]),fade=1-ph(t,start+.22,start+z[1]+.22);
    if(p<=0||fade<=0)return;
    const rr=(8+88*eo(p))*x*z[2];
    wave(g,x,GY-1,rr,C.main,fade*.68,2.1,T,st.seed+11+i,.24,.09);
    wave(g,x,GY-2,rr*.67,C.light,fade*.52,1.35,T,st.seed+17+i,.21,.05);
    blob(g,x,GY-13,18+20*eo(p),8+5*Math.sin(p*Math.PI),C.main,fade*.35,T,st.seed+30+i,C.core,.5);
    [-1,1].forEach(side=>blob(g,x+side*rr*.45,GY-2,8+5*p,4,C.light,fade*.24,T,st.seed+40+i+side,C.core,.35));
   });
   /* Hơi nước quấn sát chân và hai cột phun mềm ở hai bên. */
   const vortex=ph(t,TH+.02,TH+.75),mistFade=1-ph(t,TH+.55,TH+1.02);
   if(vortex>0&&mistFade>0){
    for(let i=0;i<12;i++){
     const an=T*2.4+i*TAU/12,rr=(18+vortex*49)*x,xx=x+Math.cos(an)*rr,yy=GY-5+Math.sin(an)*8;
     blob(g,xx,yy,5+3*Math.sin(T*5+i),3.2,C.light,mistFade*.37,T,st.seed+90+i,C.core,.38);
    }
    for(let side of [-1,1]){
     const h=(30+23*eo(ph(t,TH+.04,TH+.24)))*x,pts=[];
     for(let j=0;j<10;j++){const v=j/9;pts.push([x+side*(27+8*Math.sin(v*4+T*4))*x+Math.sin(v*5+T*3+side)*5*v,GY-2-v*h])}
     ribbon(g,pts,3.1*x,C.main,mistFade*.48,C.core);
     ribbon(g,pts,1.15*x,C.light,mistFade*.6,'#ffffff');
     blob(g,pts[9][0],pts[9][1],8*x,5*x,C.light,mistFade*.42,T,st.seed+120+side,C.core,.5);
    }
   }
   /* Giọt nước nhỏ rơi theo trọng lực trong suốt dư âm. */
   for(let n=E.rate(st,'mist-drips',ph(t,TH+.08,TH+.84),26);n>0;n--){
    E.emit({x:x+Math.sin(T*5+n)*r.range(18,60)*x,y:GY-r.range(3,22),vx:r.range(-22,22),
     vy:-r.range(24,72),gy:160,drag:.52,life:r.range(.42,.78),s0:r.range(1.4,2.6),
     s1:.55,shape:'orb',c:C.main,c2:C.core,a:.9,add:true,tag:TAG});
   }
   /* Bong bóng viền mảnh, mỗi cụm bung ra ở chân cột. */
   const bq=ph(t,TH+.04,TH+.65),bf=1-ph(t,TH+.45,TH+1.02);
   for(let i=0;i<8;i++){
    const an=i*TAU/8+T*.8,rr=(16+57*eo(bq))*x;
    bubble(g,x+Math.cos(an)*rr,GY-3+Math.sin(an)*5,2.1+1.1*Math.sin(T*4+i),C.light,bf*.52);
   }
  }

  function burstCloud(g,T,t,S,st){
   const q=aim(S);
   if(E.once(st,'cloud-main')){
    const r=E.rng(st.seed^0x3a201);
    E.burst(r,q.x,GY-8,q.miss?12:q.crit?38:30,{speed:[25,125],ang:[-Math.PI*.98,-Math.PI*.02],
     size:[1.7,3.8],life:[.5,.92],gy:92,drag:.62,shape:'orb',c:COL.cloud.main,c2:COL.cloud.core,
     a:.95,add:true,tag:TAG});
    E.burst(r,q.x,GY-23,q.miss?5:14,{speed:[18,82],ang:[-Math.PI,-.02],size:[1.5,3.2],
     life:[.4,.75],gy:55,drag:.7,shape:'spark',c:COL.cloud.light,c2:COL.cloud.core,
     a:.9,add:true,tag:TAG,vr:[-5,5]});
   }
   if(t>=TH+.17&&E.once(st,'cloud-second')){
    E.burst(E.rng(st.seed^0x3a222),q.x,GY-12,q.miss?5:15,{speed:[30,105],ang:[-Math.PI*.98,-Math.PI*.02],
     size:[1.6,3.5],life:[.55,.95],gy:80,drag:.65,shape:'orb',c:COL.cloud.light,
     c2:COL.cloud.core,a:.95,add:true,tag:TAG});
   }
  }
  function cloudHit(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,d=t-TH,C=COL.cloud,r=E.rng(st.seed^0x3a241^Math.floor(t*100));
   if(d<-.035||d>1.02)return;
   burstCloud(g,T,t,S,st);
   /* Ba đợt mây tím bung thành vòng đồng tâm, mỗi vòng lệch pha và co giãn riêng. */
   [[0,.52,1],[.15,.55,.78],[.36,.62,.56]].forEach((z,i)=>{
    const start=TH+z[0],p=ph(t,start,start+z[1]),fade=1-ph(t,start+.19,start+z[1]+.25);
    if(p<=0||fade<=0)return;
    const r=(10+93*eo(p))*s*z[2];
    wave(g,x,GY-4,r,C.main,fade*.69,2,T,st.seed+201+i,.3,.14);
    wave(g,x,GY-9,r*.7,C.light,fade*.45,1.25,T,st.seed+207+i,.26,.1);
    wave(g,x,GY-44,r*.56,C.deep,fade*.34,1.4,T,st.seed+213+i,.68,.12);
   });
   /* Mây xoáy tách thành các cuộn ở rìa, mục tiêu vẫn lộ rõ ở giữa. */
   const swirl=ph(t,TH,TH+.68),fade=1-ph(t,TH+.48,TH+1.15);
   if(swirl>0&&fade>0){
    for(let i=0;i<14;i++){
     const an=i*TAU/14+T*(i%2?2.8:-2.2),r=(21+swirl*(40+10*Math.sin(T*4+i)))*s,
      xx=x+Math.cos(an)*r,yy=GY-11+Math.sin(an)*r*.24;
     blob(g,xx,yy,8+3*Math.sin(T*5+i),4.4,C.main,fade*.48,T,st.seed+230+i,C.core,.46);
    }
    E.glow(g,x,GY-20,29*s,C.light,fade*.2,C.core);
   }
   /* Tia điện tím giật thành nhánh ngắn trên mặt đất, không chớp trắng. */
   for(let i=0;i<6;i++){
    const t0=TH+.025+(i%3)*.13,dt=t-t0;
    if(dt<0||dt>.18)continue;
    const step=Math.floor(t*22),r=E.rng(st.seed+0x3a240+i*17+step*7),an=i*TAU/6+.24,
     len=(28+r.range(12,28))*s,k=1-E.ph(dt,0,.18);
    const x1=x+Math.cos(an)*len,y1=GY-5+Math.sin(an)*len*.28;
    bolt(g,E.jag(r,x,GY-8,x1,y1,7,6*s),C.deep,C.light,2.1,.82*k);
   }
   const after=ph(t,TH,TH+.9),afterFade=1-ph(t,TH+.52,TH+1.18);
   for(let n=E.rate(st,'cloud-motes',ph(t,TH+.08,TH+.85),22);n>0;n--){
    const a=rngAngle(st,n,T),rr=18+Math.abs(Math.sin(T*2+n))*60;
    E.emit({x:x+Math.cos(a)*rr*s,y:GY-r.range(4,28),vx:r.range(-12,12),vy:-r.range(12,58),
     gy:76,drag:.6,life:r.range(.48,.86),s0:r.range(1.3,2.6),s1:.5,
     shape:n%3?'orb':'spark',c:C.main,c2:C.core,a:.9,add:true,tag:TAG,vr:r.range(-3,3)});
   }
   if(after>0&&afterFade>0){
    for(let i=0;i<7;i++){
     const a=i*TAU/7-T*.8,rr=(12+after*64)*s;
     blob(g,x+Math.cos(a)*rr,GY-18+Math.sin(a)*rr*.24,5+after*3,3,C.light,afterFade*.4,T,st.seed+270+i,C.core,.5);
    }
   }
  }
  function rngAngle(st,n,T){
   return E.rng(st.seed+Math.floor(T*19)*131+n*17)()*TAU;
  }

  function burstWind(g,T,t,S,st){
   const q=aim(S);
   if(E.once(st,'wind-main')){
    const r=E.rng(st.seed^0x3a301);
    E.burst(r,q.x,GY-7,q.miss?10:q.crit?34:27,{speed:[42,165],ang:[-Math.PI*.97,-Math.PI*.03],
     size:[2,4.7],life:[.55,1.02],gy:185,drag:.42,shape:'leaf',c:COL.wind.main,
     c2:COL.wind.core,a:.98,tag:TAG,rot:r.range(0,TAU),vr:[-10,10],fl:10,floor:GY+3,bounce:.22});
    E.burst(r,q.x,GY-22,q.miss?4:10,{speed:[40,135],ang:[-Math.PI*.96,-Math.PI*.04],
     size:[1.4,3],life:[.38,.72],gy:120,drag:.5,shape:'streak',c:COL.wind.light,
     c2:COL.wind.core,a:.9,add:true,tag:TAG});
   }
   if(t>=TH+.2&&E.once(st,'wind-aftershock')){
    const r=E.rng(st.seed^0x3a322);
    E.burst(r,q.x,GY-13,q.miss?6:16,{speed:[24,118],ang:[-Math.PI*.98,-Math.PI*.02],
     size:[2,4],life:[.55,.95],gy:160,drag:.48,shape:'leaf',c:COL.wind.light,
     c2:COL.wind.core,a:.9,tag:TAG,vr:[-8,8],fl:11,floor:GY+3,bounce:.18});
   }
  }
  function windHit(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,d=t-TH,C=COL.wind;
   if(d<-.035||d>1.02)return;
   burstWind(g,T,t,S,st);
   /* Ba vòng xung kích gió nằm thấp, sau đó cuộn thành lốc nhỏ tại chỗ. */
   [[0,.42,1],[.14,.5,.74],[.34,.58,.52]].forEach((z,i)=>{
    const start=TH+z[0],p=ph(t,start,start+z[1]),fade=1-ph(t,start+.18,start+z[1]+.2);
    if(p<=0||fade<=0)return;
    const r=(8+82*eo(p))*s*z[2];
    wave(g,x,GY-5,r,C.main,fade*.72,2,T,st.seed+301+i,.22,.1);
    wave(g,x,GY-4,r*.62,C.light,fade*.5,1.2,T,st.seed+307+i,.2,.08);
   });
   /* Ba nhát gió chéo quét lệch nhịp; mỗi lưỡi co và uốn liên tục. */
   for(let i=0;i<3;i++){
    const t0=TH-.018+i*.075,sw=eo(ph(t,t0,t0+.16)),fade=1-ph(t,t0+.19,t0+.47);
    if(sw<=.02||fade<=0)continue;
    const side=i===1?-1:1,pts=[];
    for(let j=0;j<13;j++){
     const v=j/12,xx=x+(v-.5)*116*s,yy=GY-45-side*Math.sin(v*Math.PI)*(17+6*i)*s+
      Math.sin(v*TAU+T*4+i)*4*s*(1-v);
     pts.push([x+(xx-x)*sw,yy+(1-sw)*side*12*s]);
    }
    ribbon(g,pts,(3.8+1.2*(i%2))*s,C.main,fade*.56,C.core);
    ribbon(g,pts,1.15*s,C.light,fade*.68,'#ffffff');
   }
   /* Hai dải lốc gió ôm hai bên mục tiêu, lá bị cuốn xoáy rồi tản ra. */
   const spin=ph(t,TH+.02,TH+.66),tornadoFade=1-ph(t,TH+.5,TH+1.04);
   if(spin>0&&tornadoFade>0){
    for(let side of [-1,1]){
     const pts=[];
     for(let j=0;j<18;j++){
      const v=j/17,an=T*6+v*TAU*1.6+side*.9,rad=(5+18*v)*s;
      pts.push([x+side*(25+12*v)*s+Math.cos(an)*rad,GY-3-v*54*s+Math.sin(an)*rad*.34]);
     }
     ribbon(g,pts,4*s,C.main,tornadoFade*.58,C.core);
     ribbon(g,pts,1.1*s,C.light,tornadoFade*.7,'#ffffff');
    }
   }
   /* Vết gió mảnh trên đất còn lại sau đợt chính. */
   const groundFade=1-ph(t,TH+.34,TH+1.1);
   if(groundFade>0){
    for(let i=0;i<3;i++){
     const off=(i-1)*16*s,pts=[];
     for(let j=0;j<9;j++){const v=j/8;pts.push([x+(v-.5)*120*s,GY-2+off*.12+Math.sin(v*TAU+T*2+i)*2])}
     ribbon(g,pts,1.4,C.deep,groundFade*.38,C.light);
    }
   }
   for(let n=E.rate(st,'wind-leaves',ph(t,TH+.06,TH+.78),24);n>0;n--){
    const an=rngAngle(st,n,T);
    E.emit({x:x+Math.cos(an)*rWind(st,n,T)*s,y:GY-rWind(st,n+3,T)*.25,
     vx:Math.cos(an)*rWind(st,n+5,T)*.75,vy:-rWind(st,n+7,T),gy:150,drag:.48,
     life:.58+E.rng(st.seed+n*13)()*.5,s0:2+E.rng(st.seed+n*19)()*2.2,s1:.55,
     shape:'leaf',c:n%2?C.main:C.light,c2:C.core,a:.96,tag:TAG,vr:(E.rng(st.seed+n*23)()-.5)*16,fl:10});
   }
  }
  function rWind(st,n,T){return 18+E.rng(st.seed+Math.floor(T*17)*31+n*29)()*56}

  const EXTRA={1:mistHit,2:cloudHit,3:windHit};
  API.drawAttack=function(g,T,S){
   const result=prevA(g,T,S);
   try{
    if(!S||S.cl===3||NO_EXTRA.test(S.text||''))return result;
    const idx=clamp(Number(S.s)||0,0,(API.zones||[]).length-1),run=EXTRA[idx];
    if(!run)return result;
    const u=clamp(Number(S.u)||0,0,1),t=u*1.9;
    if(t<TH-.04||t>END+.12)return result;
    const st=E.seed('fx3a-zone-'+idx,u);
    run(g,T,t,S,st);
    E.draw(g,TAG);
   }catch(e){
    window.__fx3aErr='40: '+(e&&e.message||e);
    if(window.__ATK17_DEBUG)throw e;
   }
   return result;
  };
 }
 boot();
})();
