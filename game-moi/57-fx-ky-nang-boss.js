/* ===== FX kỹ năng boss — canvas 2D, không ảnh =====
   Lớp bổ sung chạy sau chuỗi FX hiện có. Chỉ vẽ khi S.kyNang khớp id.
   Trúng ở t=.665s, kết thúc t=1.68s; mọi ngẫu nhiên dùng engine E.rng.
   Lớp boss vẽ ở nửa độ phân giải như 38/39; lỗi lớp mới giữ nguyên FX gốc. */
(()=>{
 'use strict';
 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.engine||!API.drawAttack){
   if(tries++<240)setTimeout(boot,50);
   return;
  }
  if(API.__fxBoss)return;
  API.__fxBoss=1;

  const prevA=API.drawAttack,E=API.engine,prevStyle=API.setFxStyle;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const ph=E.ph,eo=E.eOut,ei=E.eIn,TAU=E.TAU||Math.PI*2;
  const GY=204,TH=.665,END=1.68,TAG='bossfx';
  const COL={
   ice:{deep:'#32739b',main:'#70c9ed',light:'#9fe4ff',core:'#effcff'},
   mist:{deep:'#397e77',main:'#78cbbd',light:'#a3e1d4',core:'#effffb'},
   wing:{deep:'#604d97',main:'#a98be5',light:'#c9a8ff',core:'#f7f0ff'},
   wind:{deep:'#237b60',main:'#53cc91',light:'#82f0bb',core:'#edfff5'},
   bolt:{deep:'#655a16',main:'#d9bd24',light:'#ffe53a',core:'#fffbd2'},
   moon:{deep:'#171a35',main:'#6f7fb7',light:'#a8b8ff',core:'#f1f3ff'}
  };

  /* Nhóm màu và lớp pixel cùng quy ước với 38-39. */
  const pxC=document.createElement('canvas');pxC.width=180;pxC.height=125;
  const pxG=pxC.getContext('2d',{willReadFrequently:true});
  let style='px';
  function pixelLayer(g,fn){
   if(style!=='px'){fn(g);return}
   pxG.setTransform(1,0,0,1,0,0);pxG.clearRect(0,0,180,125);
   pxG.setTransform(.5,0,0,.5,0,0);
   try{fn(pxG)}finally{pxG.setTransform(1,0,0,1,0,0)}
   const im=pxG.getImageData(0,0,180,125),d=im.data;
   for(let i=0;i<d.length;i+=4){
    if(!d[i+3])continue;
    d[i]=Math.round(d[i]/51)*51;
    d[i+1]=Math.round(d[i+1]/51)*51;
    d[i+2]=Math.round(d[i+2]/51)*51;
    d[i+3]=Math.round(d[i+3]/85)*85;
   }
   pxG.putImageData(im,0,0);
   g.save();g.imageSmoothingEnabled=false;g.drawImage(pxC,0,0,360,250);g.restore();
  }
  const point=(x,y)=>[clamp(x,5,355),clamp(y,5,245)];
  const ptsPath=(g,pts)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]))};
  function stroke(g,pts,color,w,a,add){
   if(!pts||pts.length<2||a<=.01)return;
   g.save();g.globalAlpha=clamp(a,0,1);g.globalCompositeOperation=add?'lighter':'source-over';
   g.strokeStyle=color;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';ptsPath(g,pts);g.stroke();g.restore();
  }
  function poly(g,pts,fill,edge,a,w){
   if(!pts||pts.length<3||a<=.01)return;
   g.save();g.globalAlpha=clamp(a,0,1);g.fillStyle=fill;g.lineJoin='round';
   g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
   if(edge){g.strokeStyle=edge;g.lineWidth=w||1.3;g.stroke()}g.restore();
  }
  function wave(g,x,y,r,c,a,w,t,seed,sq){
   r=Math.min(r,Math.max(1,Math.min(x-9,351-x)));
   if(a<=.01||r<1)return;
   E.wave(g,x,y,r,c,clamp(a,0,1),w,{t,seed,sq:sq==null?.22:sq,wob:.065,core:'#f4ffff'});
  }
  function blob(g,x,y,rx,ry,c,a,t,seed,core,wob){
   x=clamp(x,7,353);y=clamp(y,7,243);
   rx=Math.min(rx,x-6,354-x);ry=Math.min(ry,y-6,244-y);
   if(a<=.01||rx<1||ry<1)return;
   E.blob(g,x,y,rx,ry,c,clamp(a,0,1),t,seed,{wob:wob==null?.3:wob,speed:2.2,core:core||c});
  }
  function glow(g,x,y,r,c,a,core){
   x=clamp(x,8,352);y=clamp(y,8,242);
   r=Math.min(r,x-7,353-x,y-7,243-y);
   if(r>1&&a>.01)E.glow(g,x,y,r,c,clamp(a,0,1),core||'#ffffff');
  }
  function ribbon(g,pts,w,c,a,core){
   if(!pts||pts.length<3||a<=.01)return;
   E.ribbon(g,pts,q=>Math.max(.7,w*(.24+.76*Math.sin(Math.PI*q))),
    c,clamp(a,0,1),{core:core||'#ffffff'});
  }
  function ring(g,x,y,rx,ry,c,a,w){
   rx=Math.min(rx,Math.max(1,Math.min(x-9,351-x)));
   if(a<=.01||rx<1||ry<1)return;
   g.save();g.globalCompositeOperation='lighter';g.globalAlpha=clamp(a,0,1);
   g.strokeStyle=E.rgba(c,.35);g.lineWidth=w*2.8;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.stroke();
   g.strokeStyle=E.rgba(c,.78);g.lineWidth=w;g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.stroke();
   g.strokeStyle=E.rgba('#f5ffff',.72);g.lineWidth=Math.max(.7,w*.42);
   g.beginPath();g.ellipse(x,y,rx*.98,ry*.92,0,-.2,Math.PI*.75);g.stroke();g.restore();
  }
  function burst(st,key,x,y,n,o){
   if(E.once(st,key))E.burst(E.rng(st.seed^hash(key)),x,y,n,Object.assign({tag:TAG},o));
  }
  function hash(s){
   let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);
   return h>>>0;
  }
  function groundCore(g,x,y,c,a,r){
   glow(g,x,y,r,c,a,'#f4ffff');
   glow(g,x-22,y+1,r*.43,c,a*.56,'#f4ffff');
   glow(g,x+22,y+1,r*.43,c,a*.56,'#f4ffff');
  }
  function hitBloom(g,x,C,T,seed,a,s){
   if(a<=.01)return;
   blob(g,x,GY-11,20*s,8*s,C.deep,a*.45,T,seed,'#f5ffff',.24);
   blob(g,x,GY-7,13*s,5*s,C.light,a*.66,T,seed+1,C.core,.32);
   for(const side of [-1,1])
    blob(g,x+side*18*s,GY-5,9*s,4*s,C.light,a*.48,T,seed+2+side,C.core,.28);
   ring(g,x,GY-5,17*s,6*s,C.light,a*.78,1.7);
   groundCore(g,x,GY-4,C.light,a*.28,29*s);
  }
  function aim(S){
   const dir=S.pa?1:-1,tx=S.pa?272:85;
   return {dir,x:clamp(S.miss?tx-dir*80:tx,28,332),
    scale:(S.miss?.72:1)*(S.cr?1.08:1),miss:!!S.miss};
  }
  function fogPuff(g,x,y,rx,ry,a,T,seed,C){
   blob(g,x,y,rx,ry,C.deep,a*.72,T,seed,'#d8f5ef',.32);
   blob(g,x-3,y-2,rx*.82,ry*.84,C.main,a*.62,T,seed+1,C.core,.38);
   blob(g,x-7,y-4,rx*.56,ry*.58,C.light,a*.48,T,seed+2,C.core,.42);
  }
  function bolt(g,pts,C,w,a){
   stroke(g,pts,C.deep,w*3.4,a*.28,true);
   stroke(g,pts,C.light,w*1.5,a*.82,true);
   stroke(g,pts,C.core,Math.max(.75,w*.42),a*.94,true);
  }

  /* 1 · Băng Sơn Áp Đỉnh: khối băng nhiều mặt rơi, vỡ, cắm gai và tan. */
  function icePeak(g,x,base,w,h,a,T,seed){
   if(a<=.01)return;
   const top=base-h;
   const outline=[point(x-w*.5,base),point(x-w*.43,base-h*.43),point(x-w*.26,base-h*.35),
    point(x-w*.11,base-h*.66),point(x-w*.04,top),point(x+w*.13,base-h*.57),
    point(x+w*.28,base-h*.48),point(x+w*.39,base-h*.72),point(x+w*.48,base-h*.19),point(x+w*.5,base)];
   g.save();g.globalAlpha=clamp(a,0,1);g.lineJoin='round';
   const gr=g.createLinearGradient(x-w*.55,base,x+w*.5,top);
   gr.addColorStop(0,'#286282');gr.addColorStop(.35,'#60afd3');gr.addColorStop(.68,'#a8e7fa');gr.addColorStop(1,'#f5ffff');
   poly(g,outline,gr,'#effcff',a,2);
   poly(g,[point(x-w*.5,base),outline[1],outline[2],outline[4],point(x-w*.09,base)],
    '#347fa4','#b8efff',a*.9,1);
   poly(g,[point(x-w*.09,base),outline[4],outline[5],point(x+w*.23,base)],
    'rgba(204,247,255,.74)','#efffff',a*.9,1);
   poly(g,[point(x+w*.23,base),outline[5],outline[6],outline[7],outline[8],point(x+w*.5,base)],
    '#4288a8','#d6f7ff',a*.83,1);
   stroke(g,[outline[1],point(x-w*.2,base-h*.22),outline[4],point(x+w*.08,base-h*.32),outline[7],outline[8]],
    '#eaffff',1.15,a*.9,true);
   stroke(g,[point(x-w*.29,base-h*.35),point(x-w*.13,base-h*.28),point(x-w*.09,base-h*.12)],
    '#8bdcf4',1.2,a*.86,true);
   g.restore();
   for(let i=0;i<5;i++){
    const sx=x+(i-2)*w*.16,sy=base-h*(.27+(i%2)*.13);
    const gl=1-ph(T,TH-.02,TH+.11);
    stroke(g,[point(sx,sy),point(sx+(i%2?1:-1)*5,sy+8),point(sx-3,sy+14)],
     '#edfcff',.9,gl*a*.82,true);
   }
  }
  function fxIce(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,r=E.rng(st.seed^0x570101);
   if(t<TH){
    const fall=Math.pow(ph(t,0,TH),1.7),slide=eo(ph(t,TH-.1,TH)),
     cx=lerp(x-q.dir*102,x,slide),base=lerp(112,GY-50,fall),
     h=lerp(100,145,fall),w=Math.min(lerp(88,152,fall)*s,2*Math.min(cx-20,340-cx));
    blob(g,x,GY-3,10+82*fall,4+7*fall,'#23414e',.4,T,st.seed+1,'#94dff5',.28);
    ring(g,x,GY-2,10+82*fall,4+10*fall,COL.ice.light,.58*(1-ph(t,.45,TH)),1.3);
    /* Cold vapor frames the falling mass instead of covering its bright facets. */
    for(let i=0;i<5;i++){
     const side=i%2?-1:1,yy=base-h*(.18+(i%3)*.19);
      fogPuff(g,cx+side*(w*.46+7+i*2),yy,10+i%3*3,8+i%2*3,.36,T,st.seed+12+i,COL.mist);
    }
    icePeak(g,cx,base,w,h,1-ph(t,TH-.018,TH+.11),T,st.seed+20);
    for(let i=0;i<4;i++){
     const xx=cx+(i-1.5)*w*.22;
     const tail=[point(xx,base-h*.26),point(xx+(i%2?5:-5),base-h*.44),point(xx+(i%2?8:-8),base-h*.57)];
     stroke(g,tail,'#b9efff',1.1,.25+.25*Math.sin(T*3+i),true);
    }
    for(let n=0;n<E.rate(st,'ice-charge',ph(t,0,TH),20);n++){
     const side=r.sign();
     E.emit({x:x+side*r.range(25,68),y:r.range(34,143),vx:-side*r.range(8,28),vy:r.range(12,42),
      gy:18,drag:.42,life:r.range(.32,.55),s0:r.range(1.1,2.2),s1:.45,
      shape:n%3?'flake':'spark',c:COL.ice.light,c2:COL.ice.core,a:.88,add:true,tag:TAG});
    }
   }
   const d=t-TH;
   if(d>=0&&d<.58){
    const pop=.46+.54*eo(ph(t,TH,TH+.22)),fade=1-ph(t,TH+.3,TH+.67);
    if(E.once(st,'ice-impact')){
     burst(st,'ice-fragments',x,GY-11,S.miss?24:48,{
      speed:[48,124],ang:[-Math.PI*.88,-Math.PI*.12],size:[3,8],life:[.54,.92],
      gy:240,drag:.34,shape:'shard',c:COL.ice.main,c2:COL.ice.core,a:.98,vr:[-9,9],floor:GY+3,bounce:.23});
     burst(st,'ice-snow-burst',x,GY-4,S.miss?12:26,{
      speed:[18,58],ang:[-Math.PI,-.02],size:[5,13],life:[.48,.88],
      gy:-12,drag:.75,shape:'mist',c:COL.ice.light,c2:COL.ice.core,a:.66,add:true});
    }
    for(let i=0;i<3;i++){
     const p=ph(t,TH+i*.13,TH+.35+i*.15),f=1-ph(t,TH+i*.13+.25,TH+.42+i*.15);
     if(p>0&&f>0)wave(g,x,GY-3,12+102*eo(p)*s*(1-i*.16),i===1?COL.ice.core:COL.ice.light,f*.72,2.4,T,st.seed+40+i,.18);
    }
    hitBloom(g,x,COL.ice,T,st.seed+35,1-ph(t,TH+.16,TH+.36),s);
    groundCore(g,x,GY-5,COL.ice.light,fade*.3,37*s);
    /* Broad ground cracks and a ring of tall side-spikes leave the beast readable. */
    for(let i=0;i<8;i++){
     const side=i%2?-1:1,v=(i>>1)+1,L=(18+v*8)*pop;
     const p=[point(x+side*7,GY-2),point(x+side*(8+L*.38),GY-4-r.range(1,4)),
      point(x+side*(9+L*.7),GY-1+r.range(-2,2)),point(x+side*(10+L),GY-4)];
     stroke(g,p,'#377e9d',2.7*fade,.8,false);stroke(g,p,'#c9f4ff',.85*fade,.92,true);
    }
    for(let i=0;i<6;i++){
     const side=i<3?-1:1,j=i%3,off=side*(34+j*18),h=(38+(2-j%2)*19)*pop;
     if(h>4)E.crystal(g,x+off,GY+1,14+j%2*4,h,side*3,
      {dark:'#32739b',mid:'#67bfe2',light:'#c7f4ff',edge:'#f1ffff'},fade*.94,{shine:.8,crack:.16});
    }
    if(t>=TH+.18)burst(st,'ice-aftershards',x,GY-7,S.miss?10:20,{
     speed:[25,86],ang:[-Math.PI*.94,-Math.PI*.06],size:[2,5],life:[.46,.78],
     gy:210,drag:.42,shape:'shard',c:'#73c9e9',c2:'#effcff',a:.94,floor:GY+3,bounce:.12});
    for(let i=0;i<5;i++){
     const side=i%2?-1:1,off=side*(18+i*12),a=fade*(.32+.1*Math.sin(T*2+i));
     fogPuff(g,x+off,GY-5-i%2*5,16+i%3*3,7,a,T,st.seed+70+i,COL.ice);
    }
   }
   if(t>=TH+.28&&t<=END){
    const after=1-ph(t,TH+.38,END);
    /* Large broken slabs remain on the ground, then dissolve with the snow. */
    for(let i=0;i<5;i++){
     const side=i%2?-1:1,off=side*(21+(i>>1)*17),w=10+(i%3)*3,h=7+(i%2)*4;
     const x0=x+off,y0=GY-3;
     poly(g,[point(x0-w,y0),point(x0-2,y0-h),point(x0+w,y0-2),point(x0+w*.5,y0+1)],
      '#397a9a','#d9f8ff',after*.7,1);
     stroke(g,[point(x0-2,y0-h),point(x0+2,y0-3)],'#f1ffff',1,after*.75,true);
    }
    for(let n=0;n<E.rate(st,'ice-settled-snow',ph(t,TH+.28,END),18);n++)
     E.emit({x:x+r.range(-45,45),y:GY-r.range(0,16),vx:r.range(-14,14),vy:-r.range(8,34),
      gy:74,drag:.48,life:r.range(.4,.72),s0:r.range(1,2),s1:.35,
      shape:'flake',c:COL.ice.light,c2:'#ffffff',a:.88,add:true,tag:TAG});
   }
  }

  /* 2 · Sương Nuốt: màn sương dày khép quanh thân, đuôi xoáy hút về người đánh. */
  function fxMist(g,T,t,S,st){
   const q=aim(S),x=q.x,C=COL.mist,r=E.rng(st.seed^0x570201);
   const gather=eo(ph(t,.1,TH+.42)),fade=t<TH+.48?1:1-ph(t,TH+.48,END);
   const center=lerp(x,x-q.dir*104,gather),rad=lerp(65,13,gather);
   if(fade>.01){
    /* Three opaque-ish layers build a ring around the enemy, leaving its face visible. */
    for(let i=0;i<9;i++){
     const a=i*TAU/9+T*.45,rr=rad*(.72+.22*Math.sin(i*2+T*1.4));
     const bx=center+Math.cos(a)*rr,by=GY-48+Math.sin(a)*26;
     fogPuff(g,bx,by,22+(i%3)*5,13+(i%2)*4,fade*(.5+(i%3)*.08),T,st.seed+10+i,C);
    }
    for(let side of [-1,1]){
     fogPuff(g,x+side*48,GY-40,34,25,fade*.65,T,st.seed+30+side,C);
     fogPuff(g,x+side*38,GY-12,29,15,fade*.48,T,st.seed+40+side,C);
     fogPuff(g,x+side*65,GY-60,20,17,fade*.46,T,st.seed+50+side,C);
    }
    fogPuff(g,x,GY-77,42,13,fade*.38,T,st.seed+60,C);
    /* Three curling stream-tails visibly run from the target toward the attacker. */
    for(let k=0;k<3;k++){
     const trail=[];
     for(let j=0;j<25;j++){
      const v=j/24,cx=lerp(x,center,v),rr=(1-v)*(35-18*gather)+8+gather*5,
       a=T*(2.8+k*.18)+v*TAU*1.45+k*TAU/3;
      trail.push(point(cx+Math.cos(a)*rr,GY-42+Math.sin(a)*rr*.48-v*8));
     }
     ribbon(g,trail,5-k*.8,k===1?C.light:C.main,fade*(.42-k*.06),C.core);
     ribbon(g,trail,1.3,C.light,fade*.66,'#f6fffd');
    }
    for(let i=0;i<4;i++){
     const x0=lerp(x+q.dir*(38+i*5),center,i/4),a=T*3+i*TAU/4,tail=[];
     for(let j=0;j<12;j++){
      const v=j/11,rr=(1-v)*18+2;
      tail.push(point(lerp(x0,center,v)+Math.cos(a+v*TAU)*rr,
       GY-32-v*22+Math.sin(a+v*TAU)*7));
     }
     ribbon(g,tail,3.2,C.light,fade*.5,C.core);
    }
    wave(g,x,GY-3,16+19*eo(ph(t,0,TH)),C.light,fade*.46,1.6,T,st.seed+66,.17);
    groundCore(g,center,GY-4,C.light,fade*.22,28);
   }
   if(t>=TH-.02&&t<=END){
    if(E.once(st,'mist-hit')){
     burst(st,'mist-implosion',x,GY-25,S.miss?24:54,{
      speed:[16,62],ang:[0,TAU],size:[4,10],life:[.5,.84],
      gy:-8,drag:.68,shape:'mist',c:C.deep,c2:C.light,a:.8,add:true});
     burst(st,'mist-core-drops',x,GY-12,S.miss?18:38,{
      speed:[18,66],ang:[-Math.PI*.92,-Math.PI*.08],size:[1.8,4.2],life:[.45,.82],
      gy:68,drag:.48,shape:'orb',c:C.light,c2:C.core,a:.94,add:true,floor:GY+2,bounce:.08});
    }
    for(let i=0;i<3;i++){
     const start=TH+i*.16,p=ph(t,start,start+.4),f=1-ph(t,start+.2,start+.57);
     if(p>0&&f>0){
      const rr=8+91*eo(p);
      wave(g,x,GY-3,rr,C.light,f*.66,2,T,st.seed+80+i,.2);
      wave(g,x,GY-4,rr*.68,C.deep,f*.46,1.2,T,st.seed+90+i,.2);
     }
    }
    const squeeze=ph(t,TH+.03,TH+.55),vFade=1-ph(t,TH+.5,TH+1.02);
    for(let i=0;i<15;i++){
     const a=T*4+i*TAU/15,rr=(62-43*squeeze)*(0.8+.2*Math.sin(T*2+i)),
      xx=x+Math.cos(a)*rr,yy=GY-7+Math.sin(a)*9;
     blob(g,xx,yy,5,3,C.light,vFade*.58,T,st.seed+110+i,C.core,.34);
    }
    ring(g,x,GY-4,lerp(68,14,squeeze),7,C.deep,vFade*.8,2.2);
    ring(g,x,GY-4,lerp(52,9,squeeze),4,C.light,vFade*.72,1.3);
    for(let n=0;n<E.rate(st,'mist-droplets',ph(t,TH,END),26);n++){
     const an=r.range(0,TAU),rr=r.range(25,62);
     E.emit({x:x+Math.cos(an)*rr,y:GY-r.range(10,60),vx:-q.dir*r.range(16,43),
      vy:r.range(-18,12),gx:-q.dir*r.range(5,16),gy:15,drag:.5,
      life:r.range(.42,.78),s0:r.range(1.5,3.2),s1:.55,shape:n%4?'orb':'mist',
      c:C.light,c2:C.core,a:.86,add:true,tag:TAG});
    }
   }
  }

  /* 3 · Côn Bằng Triển Sí: cánh nhiều tầng, quét gió ngang và lông rơi. */
  function feather(g,x,y,len,ang,w,c,a){
   if(len<2||a<=.01)return;
   g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=clamp(a,0,1);
   const gr=g.createLinearGradient(0,0,len,0);
   gr.addColorStop(0,'rgba(73,53,126,0)');gr.addColorStop(.28,'#7560b6');
   gr.addColorStop(.68,c);gr.addColorStop(1,'#f4eeff');
   g.fillStyle=gr;g.beginPath();g.moveTo(0,0);
   g.bezierCurveTo(len*.22,-w*.78,len*.7,-w*.5,len,0);
   g.bezierCurveTo(len*.72,w*.48,len*.25,w*.44,0,0);g.fill();
   g.strokeStyle=E.rgba('#fbf8ff',.62*a);g.lineWidth=.85;
   g.beginPath();g.moveTo(len*.08,0);g.quadraticCurveTo(len*.52,-w*.03,len*.95,0);g.stroke();
   for(let i=1;i<=3;i++){
    const p=i*.2;g.strokeStyle=E.rgba('#d9ccff',.26*a);g.lineWidth=.55;
    g.beginPath();g.moveTo(len*p,0);g.lineTo(len*(p+.11),-w*.28);g.stroke();
   }
   g.restore();
  }
  function fxWings(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,C=COL.wing,r=E.rng(st.seed^0x570300);
    const move=eo(ph(t,.08,TH+.12)),cx=x-q.dir*72*(1-move),
     open=.78+.22*eo(ph(t,0,.28)),fold=1-ph(t,TH+.34,TH+.76),
     pre=t<TH?1:fold,span=Math.min(144,2*Math.min(cx-18,342-cx));
   if(pre>.01){
    /* A dark feather silhouette, a broad violet wing, and a bright feather fan. */
    for(const side of [-1,1]){
      const rootX=cx+side*14,rootY=GY-94;
     for(let i=0;i<9;i++){
      const f=i/8,len=(49+13*Math.sin(f*Math.PI*.86))*s*open,
       ang=side>0?-.28+f*.74:Math.PI+.28-f*.74;
      feather(g,rootX,rootY+i*1.7,len,ang,13-5*f,i%3?C.main:C.deep,pre*.62);
     }
     for(let i=0;i<6;i++){
      const f=i/5,len=(36+12*Math.sin(f*Math.PI))*s*open,
       ang=side>0?-.42+f*.68:Math.PI+.42-f*.68;
      feather(g,rootX+side*2,rootY+4+i*2,len,ang,9-3*f,C.light,pre*.75);
     }
      fogPuff(g,cx+side*(span*.42),GY-83,25,10,pre*.26,T,st.seed+30+side,
      {deep:'#59478b',main:C.main,light:C.light,core:C.core});
    }
   }
   /* Horizontal gusts sweep over the head line and stay clear of the torso. */
   const sweep=eo(ph(t,TH-.24,TH+.14));
   for(let k=0;k<4;k++){
    const line=[];
    for(let j=0;j<20;j++){
      const v=j/19,xx=cx+(v-.5)*span,
       yy=GY-110+k*13+Math.sin(v*TAU+T*3+k)*5+q.dir*move*(v-.5)*12;
     line.push(point(xx,yy));
    }
    const a=t<TH?.35:.58*fold;
    ribbon(g,line,4.4-k*.55,k===1?C.light:C.main,a,C.core);
    if(k%2===0)ribbon(g,line,1.05,C.light,a*.86,'#ffffff');
   }
   if(t>=TH-.04&&t<=END){
    if(E.once(st,'wing-impact')){
     burst(st,'wing-feathers',x,GY-54,S.miss?16:34,{
      speed:[22,70],ang:[-Math.PI*.94,-Math.PI*.06],size:[2.5,5.5],life:[.55,.96],
      gy:86,drag:.42,shape:'leaf',c:C.main,c2:C.core,a:.95,vr:[-8,8],fl:8});
     burst(st,'wing-gust-dust',x,GY-39,S.miss?10:20,{
      speed:[18,76],ang:[-Math.PI,-.02],size:[1.4,3.1],life:[.38,.72],
      gy:-8,drag:.58,shape:'streak',c:C.light,c2:C.core,a:.9,add:true});
    }
    for(let i=0;i<3;i++){
     const start=TH+i*.16,p=ph(t,start,start+.42),f=1-ph(t,start+.21,start+.62);
     if(p>0&&f>0)wave(g,x,GY-5,8+91*eo(p)*s*(1-i*.16),i===1?C.light:C.main,f*.72,2.15,T,st.seed+70+i,.2);
    }
    hitBloom(g,x,C,T,st.seed+75,(1-ph(t,TH+.16,TH+.36))*.92,s);
    const spin=ph(t,TH+.02,TH+.63),twFade=1-ph(t,TH+.48,TH+1.08);
    for(let side of [-1,1]){
     const pts=[];
     for(let j=0;j<26;j++){
      const v=j/25,a=T*5+v*TAU*1.55+side*.9,rr=(7+23*v)*s;
      pts.push(point(x+side*(28+17*v)*s+Math.cos(a)*rr,GY-4-v*53+Math.sin(a)*rr*.3));
     }
     ribbon(g,pts,4.3,C.main,twFade*(.35+.32*spin),C.core);
     ribbon(g,pts,1.1,C.light,twFade*.65,'#ffffff');
    }
    const after=1-ph(t,TH+.4,END);
    for(let n=0;n<E.rate(st,'wing-drift',ph(t,TH,END),22);n++){
     const xx=x+r.range(-27,27);
     E.emit({x:xx,y:GY-r.range(22,69),vx:r.range(-31,31),vy:-r.range(10,46),
      gy:66,drag:.48,life:r.range(.48,.86),s0:r.range(2,4),s1:.55,
      shape:'leaf',c:n%2?C.main:C.light,c2:C.core,a:.92,tag:TAG,
      rot:r.range(0,TAU),vr:r.range(-6,6),fl:9});
    }
    groundCore(g,x,GY-3,C.light,after*.18,32*s);
   }
  }

  /* 4 · Vũ Xà Triền: thân rắn có vảy cuộn quanh mục tiêu, đầu rõ và ngẩng cao. */
  function snakeHead(g,x,y,dir,a,T){
   if(a<=.01)return;
   g.save();g.translate(x,y);g.scale(dir,1);g.globalAlpha=clamp(a,0,1);
   const gr=g.createLinearGradient(-17,-11,18,8);
   gr.addColorStop(0,'#17634e');gr.addColorStop(.52,'#58d29b');gr.addColorStop(1,'#e0fff0');
   g.fillStyle=gr;g.beginPath();g.moveTo(-19,1);g.lineTo(-12,-8);g.lineTo(3,-11);
   g.lineTo(14,-7);g.lineTo(20,-1);g.lineTo(10,7);g.lineTo(-4,9);g.lineTo(-15,6);g.closePath();g.fill();
   g.strokeStyle='#eafff4';g.lineWidth=1.35;g.stroke();
   g.fillStyle='#f5d86a';g.beginPath();g.ellipse(9,-5,3.4,2.6,0,0,TAU);g.fill();
   g.fillStyle='#102a25';g.beginPath();g.ellipse(10,-5,1.1,2.2,0,0,TAU);g.fill();
   stroke(g,[[-10,5],[-3,9],[7,8]],'#14543f',1.3,.9,false);
   stroke(g,[[17,1],[25,3+Math.sin(T*20)*1],[31,1]],'#f5a6bd',1.25,.96,true);
   stroke(g,[[25,3+Math.sin(T*20)*1],[30,5]],'#ffd5e0',.9,.92,true);
   g.restore();
   glow(g,x+dir*4,y-2,16,'#78f3bb',a*.28,'#eafff3');
  }
  function fxSnake(g,T,t,S,st){
    const q=aim(S),x=q.x,s=q.scale,C=COL.wind,r=E.rng(st.seed^0x570401),hit=t>=TH,
     tighten=ph(t,.14,TH+.05),bodyFade=hit?1-ph(t,TH,TH+.22):1;
   if(bodyFade>.01){
     const points=[],n=112,coil=1-.29*eo(tighten);
    for(let i=0;i<n;i++){
      const v=i/(n-1),a=v*TAU*2.75+T*1.35,
       rx=(62-8*v)*coil*s,
       yy=GY-57+v*42+Math.sin(a)*9*s;
     points.push(point(x+Math.cos(a)*rx,yy));
    }
     stroke(g,points,'#123c33',13*s*coil,bodyFade*.95,false);
     stroke(g,points,C.deep,9.5*s*coil,bodyFade*.98,false);
     ribbon(g,points,7.5*s*coil,C.main,bodyFade*.92,C.light);
    stroke(g,points,C.core,1.3,bodyFade*.74,true);
    /* Small raised scales follow the whole coil; the dark edge keeps its silhouette legible. */
    const hx=clamp(x+q.dir*42*s,24,336),hy=GY-126;
     const neck=[point(x+q.dir*52*s,GY-58),point(x+q.dir*54*s,GY-79),
      point(x+q.dir*49*s,GY-105),point(hx-q.dir*8*s,hy+5)];
     stroke(g,neck,'#123c33',17*s*coil,bodyFade*.98,false);
     stroke(g,neck,C.deep,12*s*coil,bodyFade*.98,false);
     ribbon(g,neck,9.5*s*coil,C.main,bodyFade*.96,C.light);
    stroke(g,neck,C.core,1.2,bodyFade*.74,true);
    for(let i=1;i<5;i++){
     const f=i/5,xx=lerp(neck[0][0],neck[3][0],f),yy=lerp(neck[0][1],neck[3][1],f);
     stroke(g,[point(xx-3,yy),point(xx+3,yy-2)],'#a4f5c9',1.1,bodyFade*.72,true);
    }
    for(let i=3;i<points.length-3;i+=3){
     const p=points[i],before=points[i-1],after=points[i+1],
      ang=Math.atan2(after[1]-before[1],after[0]-before[0]);
     g.save();g.translate(p[0],p[1]);g.rotate(ang);
     g.fillStyle=E.rgba(i%2?'#287b60':'#9cf6c7',bodyFade*.83);
     g.beginPath();g.ellipse(0,0,4.2*s,2.7*s,0,0,TAU);g.fill();
     g.strokeStyle=E.rgba('#eafff4',bodyFade*.66);g.lineWidth=.7;
     g.beginPath();g.moveTo(-2*s,0);g.lineTo(2*s,0);g.stroke();g.restore();
    }
    snakeHead(g,hx,hy,q.dir,bodyFade,T);
    for(let side of [-1,1])fogPuff(g,x+side*43*s,GY-20,17,7,bodyFade*.22,T,st.seed+110+side,
     {deep:C.deep,main:C.main,light:C.light,core:C.core});
   }
   if(t>=TH-.02&&t<=END){
    if(E.once(st,'snake-burst')){
     burst(st,'snake-wind-body',x,GY-44,S.miss?22:46,{
      speed:[27,84],ang:[-Math.PI*.94,-Math.PI*.06],size:[2.5,5],life:[.5,.88],
      gy:78,drag:.48,shape:'leaf',c:C.main,c2:C.core,a:.95,vr:[-9,9],fl:9});
     burst(st,'snake-wind-glints',x,GY-31,S.miss?14:28,{
      speed:[22,83],ang:[0,TAU],size:[1.2,2.8],life:[.42,.76],
      gy:-8,drag:.5,shape:'streak',c:C.light,c2:'#ffffff',a:.94,add:true});
    }
    for(let i=0;i<3;i++){
     const start=TH+i*.18,p=ph(t,start,start+.43),f=1-ph(t,start+.24,start+.66);
     if(p>0&&f>0)wave(g,x,GY-4,10+94*eo(p)*s*(1-i*.17),i===1?C.light:C.main,f*.69,2.1,T,st.seed+150+i,.2);
    }
    hitBloom(g,x,C,T,st.seed+155,(1-ph(t,TH+.17,TH+.39))*.92,s);
    const spin=ph(t,TH,TH+.7),fade=1-ph(t,TH+.48,TH+1.08);
    for(let k=0;k<4;k++){
     const pts=[];
     for(let j=0;j<28;j++){
      const v=j/27,a=T*4.2+v*TAU*1.45+k*TAU/4,
       rx=(22+31*v)*s*(1-.24*spin),yy=GY-10-v*58+Math.sin(a)*8;
      pts.push(point(x+Math.cos(a)*rx,yy));
     }
     ribbon(g,pts,5-k*.55,k%2?C.light:C.main,fade*(.32+.33*spin),C.core);
    }
    ring(g,x,GY-4,lerp(68,28,spin),8,C.light,fade*.54,1.5);
    for(let n=0;n<E.rate(st,'snake-scales',ph(t,TH,END),22);n++){
     const an=r.range(0,TAU),rr=r.range(18,51);
     E.emit({x:x+Math.cos(an)*rr,y:GY-r.range(14,68),vx:r.range(-34,34),
      vy:-r.range(8,38),gy:70,drag:.42,life:r.range(.5,.84),s0:r.range(1.8,3.6),
      s1:.5,shape:n%3?'leaf':'spark',c:C.main,c2:C.core,a:.94,add:true,tag:TAG,
      vr:r.range(-8,8),fl:8});
    }
    groundCore(g,x,GY-3,C.light,fade*.18,31*s);
   }
  }

  /* 5 · Thiên Lôi Giáng: cột sét chính/phụ, chấn sóng, điện bò và khói cháy. */
  function fxLightning(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,C=COL.bolt,r=E.rng(st.seed^0x570500);
   const charge=1-ph(t,.38,.82),cloud=1-ph(t,TH+.22,TH+.62);
   /* A visible charged storm sits over the target from frame zero. */
   for(let i=0;i<7;i++){
    const xx=x+(i-3)*16,yy=30+(i%3)*7;
    fogPuff(g,xx,yy,17+(i%2)*5,9,charge*.37,T,st.seed+200+i,
     {deep:'#393820',main:'#766b27',light:'#c4a93b',core:'#fff2a4'});
   }
   glow(g,x,GY-73,36,C.light,charge*.28,'#fff4a0');
   const crackFade=ph(t,0,.36)*(t<TH?1:1-ph(t,TH+.25,END));
   for(let side of [-1,1]){
    const p=[point(x,GY-3),point(x+side*15,GY-6),point(x+side*31,GY-2),point(x+side*51,GY-5)];
    bolt(g,p,C,1.6,crackFade*.66);
   }
   /* The central bolt leads the hit, then three smaller columns answer it. */
   if(t>=TH-.1&&t<TH+.68){
    const columns=[
     {at:TH-.06,off:0,y:15,w:5.4,a:.98},
     {at:TH+.13,off:-38,y:45,w:3.4,a:.76},
     {at:TH+.29,off:38,y:34,w:3.2,a:.72},
     {at:TH+.44,off:-62,y:70,w:2.5,a:.58}
    ];
    columns.forEach((col,i)=>{
     const d=t-col.at;if(d<0||d>.17)return;
     const k=1-ph(t,col.at+.11,col.at+.24),xx=clamp(x+col.off*s,16,344),
      seed=st.seed+0x570510+i*53+Math.floor(T*30),rb=E.rng(seed);
     const p=E.jag(rb,xx+r.range(-5,5),col.y,xx,GY-5,17,12);
     bolt(g,p,C,col.w*s,k*col.a);
     if(i<3){
      for(let b=0;b<2;b++){
       const at=p[5+b*5],side=b%2?1:-1,ex=clamp(at[0]+side*r.range(17,33),12,348);
       bolt(g,E.jag(rb,at[0],at[1],ex,GY-2,6,6),C,1.8,k*.56);
      }
     }
     wave(g,xx,GY-3,8+58*eo(ph(t,col.at,col.at+.3))*s,C.light,
      (1-ph(t,col.at+.13,col.at+.38))*.76,1.8,T,st.seed+0x570550+i,.2);
     if(i===0)groundCore(g,xx,GY-4,C.light,k*.38,34*s);
     if(i===0&&E.once(st,'lightning-hit')){
      burst(st,'lightning-sparks',xx,GY-8,S.miss?20:42,{
       speed:[38,112],ang:[-Math.PI*.92,-Math.PI*.08],size:[1.4,3.7],life:[.4,.74],
       gy:176,drag:.48,shape:'spark',c:C.light,c2:C.core,a:.98,add:true,
       vr:[-7,7],floor:GY+2,bounce:.1});
     }
    });
   }
   if(t>=TH&&t<=END){
    const after=1-ph(t,TH+.42,END);
    for(let side of [-1,1]){
     for(let k=0;k<2;k++){
      const len=(29+k*22)*ph(t,TH+.04+k*.08,TH+.42+k*.1)*s,
       pts=E.jag(E.rng(st.seed+0x570570+side*5+k),x,GY-2,
        clamp(x+side*len,10,350),GY-3+side*2,8,5);
      bolt(g,pts,C,k?1.25:1.7,after*.7);
     }
     fogPuff(g,x+side*30,GY-5,14,6,after*.22,T,st.seed+590+side,
      {deep:'#363227',main:'#71634b',light:'#a58c61',core:'#eedb98'});
    }
    for(let n=0;n<E.rate(st,'lightning-embers',ph(t,TH,END),28);n++)
     E.emit({x:x+r.range(-36,36),y:GY-r.range(0,14),vx:r.range(-35,35),
      vy:-r.range(22,66),gy:76,drag:.42,life:r.range(.35,.68),
      s0:r.range(1.1,2.4),s1:.35,shape:'spark',c:C.light,c2:C.core,a:.94,add:true,tag:TAG});
    groundCore(g,x,GY-3,C.light,after*.14,30*s);
   }
  }

  /* 6 · Nguyệt Thực Nuốt: trăng đen ngay trên địch, hút sáng và nổ tối nhiều đợt. */
  function fxEclipse(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,C=COL.moon,r=E.rng(st.seed^0x570600),
     R=Math.min(46*s,Math.min(x-20,340-x));
   const moonFade=t<TH+.2?1:1-ph(t,TH+.2,TH+.56);
   if(moonFade>.01){
    glow(g,x,59,R*1.52,C.light,moonFade*.23,'#e7ebff');
    g.save();g.globalCompositeOperation='lighter';
    g.strokeStyle=E.rgba(C.light,.62*moonFade);g.lineWidth=1.3;
    g.beginPath();g.arc(x,59,R+2,-.82,Math.PI*.88);g.stroke();
    g.strokeStyle=E.rgba(C.core,.82*moonFade);g.lineWidth=.8;
    g.beginPath();g.arc(x,59,R-1,-.64,Math.PI*.78);g.stroke();g.restore();
    const disc=g.createRadialGradient(x-R*.3,59-R*.35,1,x,59,R);
    disc.addColorStop(0,'#343956');disc.addColorStop(.54,'#101326');disc.addColorStop(1,'#050711');
    g.save();g.globalAlpha=moonFade;g.fillStyle=disc;g.beginPath();g.arc(x,59,R,0,TAU);g.fill();g.restore();
    /* Thin silver corona remains visible around the dark disk. */
    g.save();g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(C.light,.9*moonFade);
    g.lineWidth=1.2;g.beginPath();g.arc(x,59,R+1,-.76,Math.PI*.86);g.stroke();g.restore();
    const drip=eo(ph(t,.03,.38));
    for(let i=0;i<5;i++){
     const side=i%2?-1:1,xx=x+side*(9+(i>>1)*8),len=(20+(i%3)*13)*drip;
     const gr=g.createLinearGradient(xx,59+R*.72,xx+side*4,59+R*.72+len);
     gr.addColorStop(0,E.rgba(C.light,.8*moonFade));gr.addColorStop(.72,E.rgba(C.light,.28*moonFade));gr.addColorStop(1,'rgba(168,184,255,0)');
     g.save();g.globalCompositeOperation='lighter';g.fillStyle=gr;
     g.beginPath();g.moveTo(xx-1.1,59+R*.72);g.lineTo(xx+1.1,59+R*.72);
     g.lineTo(xx+side*3,59+R*.72+len);g.lineTo(xx+side*1,59+R*.72+len+4);g.closePath();g.fill();g.restore();
    }
   }
   /* Dark vortex grows at the feet, then collapses while silver motes spiral inward. */
   const hit=ph(t,TH,TH+.58),after=1-ph(t,TH+.52,END),
    radius=Math.min(68,Math.min(x-14,346-x))*(.56+.46*eo(hit))*(1-.32*ph(t,TH+.46,END));
   glow(g,x,GY-7,Math.min(35,radius*.6),'#1e2347',after*.38,C.deep);
   for(let i=0;i<4;i++){
    const rr=radius*(1-i*.17),pts=[];
    for(let j=0;j<36;j++){
     const v=j/35,a=T*(2.1+i*.28)+v*TAU*.92+i*TAU/4;
     pts.push(point(x+Math.cos(a)*rr,GY-6+Math.sin(a)*(5+i*1.6)));
    }
    ribbon(g,pts,3.1-i*.42,i===0?C.light:C.main,after*(.38-i*.055),i===0?C.core:C.deep);
   }
   g.save();g.globalCompositeOperation='multiply';g.globalAlpha=after*.7;g.fillStyle='#090b18';
   g.beginPath();g.ellipse(x,GY-5,Math.max(8,radius*.48),7.2,0,0,TAU);g.fill();g.restore();
   const darkHit=1-ph(t,TH+.15,TH+.38);
   if(darkHit>0){
    ring(g,x,GY-5,22+18*eo(hit),7,C.light,darkHit*.74,1.8);
    g.save();g.globalCompositeOperation='multiply';g.globalAlpha=darkHit*.82;
    g.fillStyle='#070914';g.beginPath();g.ellipse(x,GY-5,18+8*hit,6.5,0,0,TAU);g.fill();g.restore();
   }
   for(let i=0;i<3;i++){
    const start=TH+i*.2,p=ph(t,start,start+.43),f=1-ph(t,start+.22,start+.66);
    if(p>0&&f>0)wave(g,x,GY-3,8+92*eo(p)*(1-i*.17),i===1?C.deep:C.light,f*.65,2,T,st.seed+50+i,.17);
   }
   /* Silver beams bend toward the foot vortex; they never turn into a full-screen flash. */
   const suck=eo(ph(t,TH-.04,TH+.42));
   for(let i=0;i<7;i++){
    const side=i%2?-1:1,from=x+side*(34+(i>>1)*8),yy=GY-9+(i%3)*3,
     line=[point(from,yy),point(from-side*6,yy-3),point(lerp(from,x,suck),GY-6)];
    stroke(g,line,C.light,1.25,.58*(1-ph(t,TH+.42,END)),true);
    glow(g,line[0][0],line[0][1],5,C.light,.21*after,C.core);
   }
   if(t>=TH-.02&&t<=END){
    if(E.once(st,'eclipse-hit')){
     burst(st,'eclipse-dark-wave',x,GY-6,S.miss?20:42,{
      speed:[14,54],ang:[0,TAU],size:[3,8],life:[.5,.86],
      gy:-5,drag:.6,shape:'mist',c:'#080a18',c2:C.main,a:.83});
     burst(st,'eclipse-silver-dust',x,GY-5,S.miss?18:36,{
      speed:[18,62],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.3,3.1],life:[.46,.82],
      gy:60,drag:.5,shape:'spark',c:C.light,c2:C.core,a:.97,add:true,floor:GY+2,bounce:.08});
    }
    if(t>=TH+.19)burst(st,'eclipse-aftershock-one',x,GY-6,18,{
     speed:[12,46],ang:[0,TAU],size:[2.2,5.2],life:[.55,.9],
     gy:-4,drag:.6,shape:'orb',c:C.deep,c2:C.light,a:.83,add:true});
    if(t>=TH+.4)burst(st,'eclipse-aftershock-two',x,GY-5,16,{
     speed:[15,49],ang:[0,TAU],size:[1.5,3.8],life:[.48,.82],
     gy:28,drag:.52,shape:'spark',c:C.light,c2:C.core,a:.9,add:true});
    for(let n=0;n<E.rate(st,'eclipse-dust',ph(t,TH,END),24);n++){
     const a=r.range(0,TAU),rr=r.range(16,46);
     E.emit({x:x+Math.cos(a)*rr,y:GY-r.range(4,42),vx:-q.dir*r.range(8,27),
      vy:-r.range(12,44),gy:12,drag:.46,life:r.range(.42,.8),
      s0:r.range(1.1,2.6),s1:.4,shape:n%3?'orb':'spark',
      c:C.light,c2:C.core,a:.9,add:true,tag:TAG});
    }
   }
   groundCore(g,x,GY-3,C.light,after*.12,28*s);
  }

  const FX={
   'bang-son-ap-dinh':fxIce,'suong-nuot':fxMist,'con-bang-trien-si':fxWings,
   'vu-xa-trien':fxSnake,'thien-loi-giang':fxLightning,'nguyet-thuc-nuot':fxEclipse
  };
  API.drawAttack=function(g,T,S){
   const result=prevA(g,T,S);
   try{
    if(!S)return result;
    const run=FX[S.kyNang];if(!run)return result;
    const u=clamp(Number(S.u)||0,0,1),t=u*1.9;
    if(t<0||t>END+.12)return result;
    E.setSpeed(window.BSPD||1);
    const st=E.seed('bossfx:'+S.kyNang+':'+(Number(S.i)||0),u);
    pixelLayer(g,gg=>{run(gg,T,t,S,st);E.draw(gg,TAG)});
   }catch(e){
    window.__fxBossErr='57: '+(e&&e.message||e);
   }
   return result;
  };
  API.setFxStyle=v=>{style=v==='sm'?'sm':'px';if(prevStyle)prevStyle(v)};
 }
 boot();
})();
