/* ===== FX kỹ năng boss — canvas 2D, không ảnh =====
   Lớp bổ sung chạy sau chuỗi FX hiện có. Chỉ vẽ khi S.kyNang khớp id.
   Trúng ở t=.665s, kết thúc t=1.68s; mọi ngẫu nhiên dùng engine E.rng.
   Lớp boss vẽ ở nửa độ phân giải như 38/39; lỗi lớp mới giữ nguyên FX gốc. */
(()=>{
 'use strict';
 let tries=0;
 /* Sprite sheet kỹ năng 1 (Băng Sơn Áp Đỉnh): 3 cột x 2 hàng, mỗi ô 768x768, nền trong suốt.
    Đường dẫn lấy theo vị trí file script này. Tải lỗi thì tự dùng bản vẽ code cũ. */
 const SPR={ok:false,img:null,cell:768};
 try{
  const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
  const im=new Image();
  im.onload=()=>{SPR.img=im;SPR.cell=Math.floor(im.naturalWidth/3);SPR.ok=im.naturalWidth>=3&&im.naturalHeight>=2};
  im.onerror=()=>{SPR.ok=false};
  im.src=base+'fx-boss/bang-son-ap-dinh.png';
 }catch(e){}
 /* Sprite sheet kỹ năng 2 (Sương Nuốt): cùng bố cục 3x2, ô 768x768. */
 const MS={ok:false,img:null,cell:768};
 try{
  const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
  const im=new Image();
  im.onload=()=>{MS.img=im;MS.cell=Math.floor(im.naturalWidth/3);MS.ok=im.naturalWidth>=3&&im.naturalHeight>=2};
  im.onerror=()=>{MS.ok=false};
  im.src=base+'fx-boss/suong-nuot.png';
 }catch(e){}
 /* Sprite sheet kỹ năng 3 (Côn Bằng Triển Sí): ô 768x768, bỏ khung 1 (không có vòng ấn dưới chân địch). */
 const WS={ok:false,img:null,cell:768};
 try{
  const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
  const im=new Image();
  im.onload=()=>{WS.img=im;WS.cell=Math.floor(im.naturalWidth/3);WS.ok=im.naturalWidth>=3&&im.naturalHeight>=2};
  im.onerror=()=>{WS.ok=false};
  im.src=base+'fx-boss/con-bang.png';
 }catch(e){}
 /* Sprite sheet kỹ năng 4 (Vũ Xà Triền): 3 cột x 2 hàng, ô 768x768, rắn quay đầu sang PHẢI. */
 const VS={ok:false,img:null,cell:768};
 try{
  const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
  const im=new Image();
  im.onload=()=>{VS.img=im;VS.cell=Math.floor(im.naturalWidth/3);VS.ok=im.naturalWidth>=3&&im.naturalHeight>=2};
  im.onerror=()=>{VS.ok=false};
  im.src=base+'fx-boss/vu-xa.png';
 }catch(e){}
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
   const top=base-h,P=(px,py)=>[clamp(px,5,355),py];
   const o=[P(x-w*.5,base),P(x-w*.44,base-h*.23),P(x-w*.34,base-h*.34),
    P(x-w*.28,base-h*.58),P(x-w*.19,base-h*.48),P(x-w*.1,base-h*.8),
    P(x-w*.035,top),P(x+w*.12,base-h*.62),P(x+w*.22,base-h*.55),
    P(x+w*.31,base-h*.39),P(x+w*.4,base-h*.74),P(x+w*.47,base-h*.2),P(x+w*.5,base)];
   g.save();g.globalAlpha=clamp(a,0,1);g.lineJoin='round';
   const gr=g.createLinearGradient(x-w*.52,base,x+w*.48,top);
   gr.addColorStop(0,'#214b63');gr.addColorStop(.24,'#347b9b');
   gr.addColorStop(.48,'#67b4d4');gr.addColorStop(.76,'#b6edfb');gr.addColorStop(1,'#f7ffff');
   poly(g,o,gr,'#e8fbff',a,2.2);
   /* Dark cut faces, a broad luminous spine and thinner ice planes create a heavy faceted silhouette. */
   poly(g,[o[0],o[1],o[2],o[3],o[5],o[6],P(x-w*.08,base)],'#24556f','#8ed8f0',a*.94,1.15);
   poly(g,[o[2],o[3],o[4],o[5],o[6]],'#4389aa','#b7efff',a*.92,1.05);
   poly(g,[P(x-w*.08,base),o[6],o[7],P(x+w*.14,base)],'#b8f0ff','#f3ffff',a*.94,1.15);
   poly(g,[P(x+w*.14,base),o[7],o[8],o[9],o[10],o[11],o[12]],'#32718f','#b5eafa',a*.9,1.1);
   poly(g,[o[8],o[9],o[10],P(x+w*.26,base)],'#6eb7d0','#e5fbff',a*.82,.9);
   poly(g,[o[1],o[2],o[4],P(x-w*.25,base-h*.13)],'rgba(27,73,96,.76)','#a6e8fb',a*.83,.9);
   poly(g,[o[4],o[5],o[6],o[7],o[8]],'rgba(176,233,249,.65)','#f4ffff',a*.7,.8);
   const edge=o.concat([o[0]]);
   stroke(g,edge,'#8bdcf4',4,a*.32,true);
   stroke(g,edge,'#f1ffff',1.25,a*.96,true);
   stroke(g,[o[1],P(x-w*.24,base-h*.21),o[5],o[6],P(x+w*.08,base-h*.34),o[10],o[11]],'#f3ffff',1.25,a*.91,true);
   stroke(g,[o[2],P(x-w*.17,base-h*.24),o[4],P(x-w*.08,base-h*.16)],'#91def4',1.1,a*.86,true);
   stroke(g,[o[7],P(x+w*.22,base-h*.35),o[9],o[10]],'#dffaff',1.05,a*.82,true);
   for(let i=0;i<4;i++){
    const sx=x+(i-1.5)*w*.19,sy=base-h*(.28+(i%2)*.14),gl=1-ph(T,TH-.02,TH+.13);
    stroke(g,[P(sx,sy),P(sx+(i%2?1:-1)*7,sy+11),P(sx-4,sy+19)],'#f4ffff',1.05,gl*a*.82,true);
   }
   g.restore();
   for(let i=0;i<3;i++){
    const px=x+(i-1)*w*.25,py=base-h*(.34+i%2*.13);
    if(py>22)glow(g,px,py,Math.max(5,4+w*.035),COL.ice.light,a*(.22+.08*Math.sin(T*3+i)),COL.ice.core);
   }
  }
  function iceChunk(g,x,y,w,h,rot,a){
   if(a<=.01)return;
   g.save();g.translate(x,y);g.rotate(rot);g.lineJoin='round';
   const grad=g.createLinearGradient(-w*.7,-h,w*.8,h);
   grad.addColorStop(0,'#24546d');grad.addColorStop(.42,'#4f9dbb');grad.addColorStop(.78,'#9fe4ff');grad.addColorStop(1,'#efffff');
   const p=[[-w*.65,h*.18],[-w*.26,-h*.75],[w*.16,-h],[w*.72,-h*.12],[w*.31,h*.62],[-w*.32,h*.48]];
   poly(g,p,grad,'#dffaff',a,1.15);
   poly(g,[p[0],p[1],p[2],[w*.04,h*.25]],'#285e78','#87d5ec',a*.86,.8);
   stroke(g,[p[1],p[2],p[3]],'#f5ffff',1,a*.92,true);
   stroke(g,[p[0],p[5],p[3]],'#83d6ef',.8,a*.75,true);
   g.restore();
   glow(g,x,y,Math.max(4,w*.32),COL.ice.light,a*.2,COL.ice.core);
  }
  function fxIce(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,r=E.rng(st.seed^0x570101);
   if(t<TH){
    const fall=Math.pow(ph(t,0,TH),.72),slide=eo(ph(t,.08,TH)),
     cx=lerp(x-q.dir*24,x-q.dir*16,slide),base=lerp(-80,GY-18,fall),
     h=lerp(148,160,fall)*s,w=Math.min(lerp(164,202,fall)*s,2*Math.min(cx-19,341-cx)),
     warning=1-ph(t,TH-.04,TH+.15),shadow=46+94*fall;
    /* A growing ground shadow, elliptical warning seal and fine cracks are visible even before the ice enters frame. */
    blob(g,x,GY-3,shadow,9+9*fall,'#123c54',.68,T,st.seed+1,'#9fe4ff',.25);
    groundCore(g,x,GY-4,COL.ice.light,(.3+.24*fall)*warning,34+62*fall);
    ring(g,x,GY-2,34+84*fall,6+10*fall,COL.ice.light,.78*warning,1.7);
    ring(g,x,GY-2,19+62*fall,3.5+7*fall,'#e8fbff',.58*warning,1.25);
    for(let i=0;i<8;i++){
     const an=i*TAU/8+T*.04,rx=16+shadow*.82,ry=4+fall*8;
     const p=[point(x+Math.cos(an)*12,GY-2+Math.sin(an)*3),
      point(x+Math.cos(an)*rx*.62,GY-2+Math.sin(an)*ry*.62),
      point(x+Math.cos(an)*rx,GY-2+Math.sin(an)*ry)];
     stroke(g,p,i%2?'#8bdcf4':'#d9f7ff',1.05,.42+.22*fall,true);
    }
    for(const side of [-1,1])fogPuff(g,x+side*43,GY-15,14,7,.3*warning,T,st.seed+33+side,COL.ice);
    /* Narrow falling streaks make the off-screen mass readable at t=0 without hiding either face. */
    for(let i=0;i<5;i++){
     const sx=x+(i-2)*13+Math.sin(T*3+i)*2,sy=10+(i%3)*8,drop=36+70*fall;
     stroke(g,[point(sx,sy),point(sx+(i%2?3:-3),sy+drop)],'#bcefff',1.35,.4*warning,true);
    }
    if(base>60){
     /* The mountain starts above the frame and descends toward the target, growing into a much larger mass. */
     icePeak(g,cx,base,w,h,1-ph(t,TH-.018,TH+.11),T,st.seed+20);
     for(let i=0;i<6;i++){
      const side=i%2?-1:1,yy=base-h*(.18+(i%3)*.18);
      fogPuff(g,cx+side*(w*.43+8+i*1.5),yy,12+i%3*4,9+i%2*4,.38,T,st.seed+12+i,COL.mist);
     }
     for(let i=0;i<5;i++){
      const xx=cx+(i-2)*w*.16;
      stroke(g,[point(xx,base-h*.18),point(xx+(i%2?7:-7),base-h*.34),point(xx+(i%2?11:-11),base-h*.47)],'#dbf7ff',1.1,.28+.22*Math.sin(T*3+i),true);
     }
    }
    for(let n=0;n<E.rate(st,'ice-charge',ph(t,0,TH),28);n++){
     const side=r.sign();
     E.emit({x:x+side*r.range(26,78),y:r.range(16,150),vx:-side*r.range(9,30),vy:r.range(18,48),
      gy:20,drag:.42,life:r.range(.34,.58),s0:r.range(1.2,2.5),s1:.45,
      shape:n%3?'flake':'spark',c:COL.ice.light,c2:COL.ice.core,a:.9,add:true,tag:TAG});
    }
   }
   const d=t-TH;
   if(d>=0&&d<.62){
    const pop=.5+.5*eo(ph(t,TH,TH+.22)),fade=1-ph(t,TH+.54,END);
    if(E.once(st,'ice-impact')){
     burst(st,'ice-fragments',x,GY-12,S.miss?28:58,{
      speed:[52,105],ang:[-Math.PI*.75,-Math.PI*.25],size:[7,14],life:[.55,.82],
      gy:350,drag:.32,shape:'shard',c:COL.ice.deep,c2:COL.ice.core,a:1,vr:[-11,11],floor:GY+3,bounce:.24});
     burst(st,'ice-snow-burst',x,GY-5,S.miss?18:34,{
      speed:[20,68],ang:[-Math.PI,-.02],size:[6,15],life:[.55,.98],
      gy:-10,drag:.72,shape:'mist',c:COL.ice.light,c2:COL.ice.core,a:.7,add:true});
    }
    for(let i=0;i<3;i++){
     const p=ph(t,TH+i*.13,TH+.35+i*.15),f=1-ph(t,TH+i*.13+.25,TH+.42+i*.15);
     if(p>0&&f>0)wave(g,x,GY-3,14+112*eo(p)*s*(1-i*.16),i===1?COL.ice.core:COL.ice.light,f*.72,2.5,T,st.seed+40+i,.18);
    }
    hitBloom(g,x,COL.ice,T,st.seed+35,1-ph(t,TH+.16,TH+.36),s);
    groundCore(g,x,GY-5,COL.ice.light,fade*.32,39*s);
    /* Cracks and a side ring of ice spikes keep the target's face clear. */
    for(let i=0;i<10;i++){
     const side=i%2?-1:1,lane=(i>>1),L=(18+lane*8)*pop,off=side*(8+lane*4);
     const p=[point(x+off,GY-2),point(x+side*(off+L*.42),GY-4-r.range(1,4)),
      point(x+side*(off+L*.76),GY-1+r.range(-2,2)),point(x+side*(off+L),GY-4)];
     stroke(g,p,'#377e9d',2.7*fade,.82,false);stroke(g,p,'#c9f4ff',.9*fade,.94,true);
    }
    for(let i=0;i<8;i++){
     const side=i<4?-1:1,j=i%4,off=side*(40+j*12),h=(42+(j%3)*14+(j===3?7:0))*pop;
     if(h>4)E.crystal(g,clamp(x+off,18,342),GY+1,15+j%2*4,h,side*4,
      {dark:'#285b76',mid:'#5499b8',light:'#b5eafa',edge:'#efffff'},fade*.96,{shine:.82,crack:.24});
    }
    for(let i=0;i<6;i++){
     const side=i%2?-1:1,off=side*(20+i*10),a=fade*(.28+.12*Math.sin(T*2+i));
     fogPuff(g,x+off,GY-5-i%2*5,17+i%3*4,8,a,T,st.seed+70+i,COL.ice);
    }
   }
   if(t>=TH&&t<=END){
    const after=1-ph(t,TH+.58,END),travel=clamp((t-TH)/.72,0,1),span=Math.max(22,Math.min(x-22,338-x)*.86);
    /* Big faceted chunks arc outward under gravity, bounce low, then fade with the snow. */
    for(let i=0;i<10;i++){
     const side=i%2?-1:1,lane=(i>>1),dist=44+lane*5+travel*(8+lane*1.5),xx=clamp(x+side*Math.min(span,dist),12,348),
      vy=164+lane*18,yy=Math.min(GY-3,GY-12-vy*d+240*d*d),size=14+(i%4)*3.5,
      rot=side*(.25+d*(2.1+lane*.12)+lane*.27),a=after*(.76+.04*(i%3));
     iceChunk(g,xx,yy,size,size*.78,rot,a);
    }
    burst(st,'ice-aftershards',x,GY-7,S.miss?12:22,{
     speed:[30,86],ang:[-Math.PI*.75,-Math.PI*.25],size:[3,7],life:[.5,.82],
     gy:250,drag:.4,shape:'shard',c:'#73c9e9',c2:'#effcff',a:.96,floor:GY+3,bounce:.14});
    for(let i=0;i<5;i++){
     const side=i%2?-1:1,off=side*(18+i*12),w=11+(i%3)*3,h=7+(i%2)*4,x0=clamp(x+off,14,346),y0=GY-3;
     poly(g,[point(x0-w,y0),point(x0-2,y0-h),point(x0+w,y0-2),point(x0+w*.5,y0+1)],
      '#315e75','#d9f8ff',after*.82,1.1);
     stroke(g,[point(x0-2,y0-h),point(x0+2,y0-3)],'#f1ffff',1.1,after*.88,true);
    }
    for(let n=0;n<E.rate(st,'ice-settled-snow',ph(t,TH+.28,END),22);n++)
     E.emit({x:x+r.range(-50,50),y:GY-r.range(0,18),vx:r.range(-16,16),vy:-r.range(8,38),
      gy:86,drag:.46,life:r.range(.42,.78),s0:r.range(1.1,2.3),s1:.35,
      shape:'flake',c:COL.ice.light,c2:'#ffffff',a:.9,add:true,tag:TAG});
   }
  }
  /* 1b · Băng Sơn Áp Đỉnh bằng ảnh 6 khung. Chỉnh nhanh ở bảng ICE_SPR bên dưới.
     Mốc thời gian (giây): 1 báo hiệu · 2 núi nổi · 3 rơi · 4 đè (TH) · 5 vỡ · 6 tan.
     dy = độ lệch dọc theo px ảnh gốc (ô 768), rơi nhanh dần ở khung 2-3. */
  const ICE_K=.31;           /* tỉ lệ phóng ảnh -> canvas 360x250 */
  const ICE_GY=655;          /* y mặt đất trong ô ảnh (px ảnh gốc) */
  const ICE_SPR=[
   {f:0,a:0,   b:.2,  dy0:0,   dy1:0,   ease:0},
   {f:1,a:.2,  b:.4,  dy0:-70, dy1:55,  ease:1},
   {f:2,a:.4,  b:TH,  dy0:-25, dy1:34,  ease:1},
   {f:3,a:TH,  b:.9,  dy0:0,   dy1:0,   ease:0},
   {f:4,a:.9,  b:1.3, dy0:0,   dy1:0,   ease:0},
   {f:5,a:1.3, b:END, dy0:0,   dy1:0,   ease:0}
  ];
  function iceSprite(g,t,S){
   const q=aim(S),k=ICE_K*clamp(q.scale,.72,1.05),C=SPR.cell,F=.07,
    half=C*k*.5*.95,ax=q.x; /* đặt đúng giữa địch; mép ngoài cùng của gió có thể bị khung canvas cắt */
   let sh=0,shy=0;
   if(t>=TH){const dk=Math.max(0,1-(t-TH)/.34);sh=Math.sin((t-TH)*95)*3.2*dk;shy=Math.cos((t-TH)*80)*2.2*dk}
   g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   for(const o of ICE_SPR){
    let al=1;
    if(t<o.a-F||t>o.b+F)continue;
    if(o.f>0&&t<o.a+F)al=ph(t,o.a-F,o.a+F);
    if(o.f<5&&t>o.b-F)al*=1-ph(t,o.b-F,o.b+F);
    if(o.f===0)al=Math.min(al,ph(t,0,.08));
    if(o.f===5)al*=1-ph(t,1.35,END);
    if(al<=.01)continue;
    const p=ph(t,o.a,o.b),u=o.ease?p*p:p,dy=lerp(o.dy0,o.dy1,u);
    /* Khung 4: núi bị nén rồi bật lại ngay lúc trúng. */
    const sq=o.f===3?1-.06*Math.max(0,1-(t-TH)/.12):1;
    const col=o.f%3,row=(o.f/3)|0,sx=col*C,sy=row*C;
    const dx=ax-(C/2)*k+sh,dyy=GY-2+(dy-ICE_GY)*k+shy;
    g.globalAlpha=clamp(al,0,1);
    g.save();g.translate(ax+sh,GY-2+shy);g.scale(1,sq);g.translate(-ax-sh,-(GY-2+shy));
    g.drawImage(SPR.img,sx,sy,C,C,dx,dyy,C*k,C*k);
    g.restore();
   }
   g.restore();
  }
  function iceSpriteFx(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,r=E.rng(st.seed^0x570101);
   if(t<TH){
    const fall=Math.pow(ph(t,0,TH),.72);
    /* Bóng đất to dần: cho cảm giác khối núi nặng đang đè xuống. */
    blob(g,x,GY-3,34+84*fall,7+9*fall,'#123c54',.55+.13*fall,T,st.seed+1,'#9fe4ff',.2);
    for(let n=0;n<E.rate(st,'ice-charge',ph(t,0,TH),22);n++){
     const side=r.sign();
     E.emit({x:x+side*r.range(26,78),y:r.range(16,150),vx:-side*r.range(9,30),vy:r.range(18,48),
      gy:20,drag:.42,life:r.range(.34,.58),s0:r.range(1.2,2.5),s1:.45,
      shape:n%3?'flake':'spark',c:COL.ice.light,c2:COL.ice.core,a:.9,add:true,tag:TAG});
    }
   }
   if(t>=TH&&t<=END){
    if(E.once(st,'ice-impact')){
     burst(st,'ice-fragments',x,GY-12,S.miss?20:44,{
      speed:[52,110],ang:[-Math.PI*.8,-Math.PI*.2],size:[6,13],life:[.55,.82],
      gy:350,drag:.32,shape:'shard',c:COL.ice.deep,c2:COL.ice.core,a:1,vr:[-11,11],floor:GY+3,bounce:.24});
     burst(st,'ice-snow-burst',x,GY-5,S.miss?14:28,{
      speed:[20,68],ang:[-Math.PI,-.02],size:[6,14],life:[.55,.98],
      gy:-10,drag:.72,shape:'mist',c:COL.ice.core,c2:'#ffffff',a:.7,add:true});
    }
    for(let i=0;i<3;i++){
     const p=ph(t,TH+i*.13,TH+.35+i*.15),f=1-ph(t,TH+i*.13+.25,TH+.42+i*.15);
     if(p>0&&f>0)wave(g,x,GY-3,14+118*eo(p)*s*(1-i*.16),i===1?COL.ice.core:COL.ice.light,f*.72,2.5,T,st.seed+40+i,.18);
    }
    for(let n=0;n<E.rate(st,'ice-settled-snow',ph(t,TH+.28,END),18);n++)
     E.emit({x:x+r.range(-60,60),y:GY-r.range(0,18),vx:r.range(-16,16),vy:-r.range(8,38),
      gy:86,drag:.46,life:r.range(.42,.78),s0:r.range(1.1,2.3),s1:.35,
      shape:'flake',c:COL.ice.light,c2:'#ffffff',a:.9,add:true,tag:TAG});
   }
  }

  /* 2 · Sương Nuốt: hai hàm sương ngoạm xuống, vòm sương cuộn quanh thân rồi bóp nghẹt, hút sinh khí về người đánh. */
  function mistJaw(g,x,base,W,L,up,a,T,seed){
   /* Hàm sương cong ôm lấy thân: dải mờ dày + hàng nanh cong vào trong; up=1 hàm trên (nanh chĩa xuống), up=-1 hàm dưới. */
   if(a<=.01)return;
   const C=COL.mist,N=8,dir=up>0?1:-1,cur=17,th=12;
   const yb=v=>base-dir*cur*(1-Math.pow(2*v-1,2));
   const edge=[],back=[];
   for(let k=0;k<=24;k++){
    const v=k/24,xx=x+(v-.5)*W;
    edge.push(point(xx,yb(v)));back.push(point(xx,yb(v)-dir*(th-5*Math.abs(2*v-1))));
   }
   g.save();g.globalAlpha=clamp(a,0,1);
   poly(g,edge.concat(back.slice().reverse()),'rgba(20,70,63,.9)','#78cbbd',a*.85,1.3);
   for(let j=0;j<N;j++){
    const v0=j/N,v1=(j+1)/N,vm=(j+.5)/N,u=2*vm-1,xm=x+(vm-.5)*W;
    const len=L*(.5+.5*Math.pow(1-u*u,.6))*(1+.1*Math.sin(j*2.3+seed));
    const t0=point(x+(v0-.5)*W,yb(v0)),t1=point(x+(v1-.5)*W,yb(v1)),
     mid=point(xm,yb(vm)+dir*len*.55),tp=point(xm-u*9,yb(vm)+dir*len);
    poly(g,[t0,mid,tp,t1],j%2?'#2a7a6f':'#3a9387','#bff3e8',a*.9,1.1);
    poly(g,[point(xm-2,yb(vm)),tp,point(xm+(v1-v0)*W*.4,yb(vm))],'rgba(190,243,232,.35)',null,a*.8);
    stroke(g,[t0,tp],'#e8fffa',1,a*.6,true);
   }
   stroke(g,edge,'#c6f6ec',1.1,a*.5,true);
   g.restore();
   for(let i=0;i<6;i++){
    const v=(i+.5)/6;
    fogPuff(g,x+(v-.5)*W,yb(v)-dir*5,15,8,a*.45,T,seed+i,C);
   }
  }
  function fxMist(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,C=COL.mist,r=E.rng(st.seed^0x570201);
   const grow=eo(ph(t,0,.5)),close=ei(ph(t,.1,TH)),
    fade=t<TH+.12?1:1-ph(t,TH+.12,TH+.62),after=1-ph(t,TH+.5,END),
    squeeze=eo(ph(t,TH-.05,TH+.3)),ax=clamp(x-q.dir*172,34,326);
   /* Bóng đất tối, bộ ấn xoáy và vết nứt mờ báo hiệu từ khung đầu tiên. */
   const shadow=40+48*grow;
   blob(g,x,GY-3,shadow,9+7*grow,'#0f3a35',.7*(1-ph(t,TH+.5,END)),T,st.seed+1,'#78cbbd',.25);
   const warn=1-ph(t,TH+.05,TH+.4);
   ring(g,x,GY-3,22+66*grow,5+10*grow,C.light,.8*warn,1.7);
   ring(g,x,GY-3,12+40*grow,3+6*grow,C.core,.55*warn,1.2);
   for(let i=0;i<8;i++){
    const an=i*TAU/8+T*.9,rr=(20+66*grow);
    stroke(g,[point(x+Math.cos(an)*rr*.7,GY-3+Math.sin(an)*rr*.14),point(x+Math.cos(an)*rr,GY-3+Math.sin(an)*rr*.2)],i%2?C.main:C.light,1.2,.6*warn,true);
   }
   groundCore(g,x,GY-4,C.light,(.06+.07*grow)*fade,34+30*grow);
   /* Vòm sương: các lớp mây xoáy lên từ chân, lớp sau tối, lớp trước mờ ở giữa để chừa mặt mục tiêu. */
   const H=(30+88*grow)*(1-.55*squeeze)*s,Rm=(44+22*grow)*(1-.7*squeeze)*s,spin=T*(1.1+2.4*squeeze);
   if(fade>.01){
    blob(g,x,GY-16-H*.5,Rm*1.12,H*.62+10,'#174a43',fade*.5*(1-.6*squeeze),T,st.seed+7,'#4fa89b',.2);
    blob(g,x,GY-12-H*.28,Rm*1.2,H*.36+8,'#1f5d55',fade*.4*(1-.6*squeeze),T,st.seed+8,'#78cbbd',.22);
   }
   const puffs=[];
   for(let lv=0;lv<5;lv++){
    const hf=lv/4,n=7-(lv>2?1:0);
    for(let i=0;i<n;i++){
     const a=spin*(1+hf*.35)+i*TAU/n+lv*.62,bulge=.7+.3*Math.sin(Math.PI*(.15+hf*.8)),
      rr=Rm*bulge*(1-.28*hf),bx=x+Math.cos(a)*rr,by=GY-14-hf*H+Math.sin(a)*7;
     puffs.push({bx,by,d:Math.sin(a),c:Math.cos(a),hf,id:lv*10+i});
    }
   }
   puffs.sort((p,u)=>p.d-u.d);
   if(fade>.01)for(const p of puffs){
    const front=p.d>=0,face=front?.3+.7*Math.min(1,Math.abs(p.c)*1.5):1,
     al=fade*(front?.58:.5)*face*(.5+.5*grow)*(1-.6*squeeze);
    const tone={deep:front?'#2c7a70':'#1b4d46',main:front?'#4fa89b':'#2a7167',light:front?'#8ed6c7':'#4fa89b',core:front?'#bff0e6':'#78cbbd'};
    fogPuff(g,p.bx,p.by,(21+10*(1-p.hf))*(1-.3*squeeze)*s,(14+6*(1-p.hf))*s,al*.9,T,st.seed+10+p.id,tone);
   }
   /* Ba dải sương xoắn ốc leo quanh thân. */
   if(fade>.01)for(let k=0;k<3;k++){
    const pts=[];
    for(let j=0;j<30;j++){
     const v=j/29,a=spin*1.7+v*TAU*1.7+k*TAU/3,rr=Rm*(.82-.3*v)*(1-.3*squeeze);
     pts.push(point(x+Math.cos(a)*rr,GY-12-v*H+Math.sin(a)*8));
    }
    ribbon(g,pts,5-k*.8,k===1?C.light:C.main,fade*(.5-k*.08),C.core);
    ribbon(g,pts,1.2,C.light,fade*.72,'#f6fffd');
   }
   /* Hai hàm sương: hàm trên ập từ trên khung xuống, hàm dưới trồi lên từ đất, khép ở lúc trúng. */
   if(t<TH+.4){
    const jf=t<TH+.04?1:1-ph(t,TH+.04,TH+.38),W=Math.min(2*Math.min(x-20,340-x),118*s),
     upBase=lerp(GY-196,GY-120,close),loBase=lerp(GY+6,GY-3,eo(ph(t,0,TH*.8)));
    mistJaw(g,x,upBase,W,lerp(26,36,close),1,jf*.97,T,st.seed+300);
    mistJaw(g,x,loBase,W*.92,lerp(8,34,eo(ph(t,0,TH*.9))),-1,jf*.97,T,st.seed+330);
    for(const sd of [-1,1])fogPuff(g,x+sd*W*.5,(upBase+loBase)/2,14,24,jf*.34,T,st.seed+360+sd,C);
   }
   if(t<TH){
    for(let n=0;n<E.rate(st,'mist-charge',ph(t,0,TH),30);n++){
     const side=r.sign(),yy=r.range(30,GY-14);
     E.emit({x:x+side*r.range(48,90),y:yy,vx:-side*r.range(14,40),vy:r.range(-12,10),gy:0,drag:.4,
      life:r.range(.34,.6),s0:r.range(1.6,3),s1:.5,shape:n%3?'mist':'orb',c:C.light,c2:C.core,a:.85,add:true,tag:TAG});
    }
   }
   if(t>=TH&&t<=END){
    if(E.once(st,'mist-hit')){
     burst(st,'mist-implosion',x,GY-45,S.miss?24:56,{
      speed:[18,70],ang:[0,TAU],size:[5,12],life:[.5,.9],gy:-8,drag:.66,shape:'mist',c:C.deep,c2:C.light,a:.85,add:true});
     burst(st,'mist-core-drops',x,GY-14,S.miss?18:40,{
      speed:[26,82],ang:[-Math.PI*.92,-Math.PI*.08],size:[1.8,4.2],life:[.45,.84],
      gy:80,drag:.46,shape:'orb',c:C.light,c2:C.core,a:.96,add:true,floor:GY+2,bounce:.1});
    }
    for(let i=0;i<3;i++){
     const start=TH+i*.15,p=ph(t,start,start+.42),f=1-ph(t,start+.2,start+.6);
     if(p>0&&f>0){
      const rr=8+96*eo(p)*s;
      wave(g,x,GY-3,rr,i===1?C.core:C.light,f*.7,2.2,T,st.seed+80+i,.2);
      wave(g,x,GY-4,rr*.66,C.deep,f*.5,1.3,T,st.seed+90+i,.2);
     }
    }
    hitBloom(g,x,C,T,st.seed+95,(1-ph(t,TH+.16,TH+.4))*.95,s);
    ring(g,x,GY-4,lerp(70,16,squeeze),7,C.deep,(1-ph(t,TH+.4,TH+.95))*.85,2.2);
    ring(g,x,GY-4,lerp(54,10,squeeze),4,C.light,(1-ph(t,TH+.4,TH+.95))*.75,1.3);
    /* Dòng sinh khí: ba sợi sương chảy từ mục tiêu về người đánh, đầu sáng dẫn đường. */
    const flow=ph(t,TH+.08,TH+.82),keep=1-ph(t,TH+.76,END),mult=S.miss?.4:1;
    if(flow>0&&keep>0)for(let k=0;k<3;k++){
     const pts=[],head=eo(flow),tailV=Math.max(0,head-.6);
     for(let j=0;j<22;j++){
      const v=lerp(tailV,head,j/21),px=lerp(x-q.dir*16,ax+q.dir*20,v),
       py=GY-58-Math.sin(v*Math.PI)*(26+k*13)+Math.sin(v*TAU*1.2+T*4+k*2.1)*(2.5+k*1.5);
      pts.push(point(px,py));
     }
     stroke(g,pts,C.deep,12-k*2.6,keep*mult*.45,false);
     stroke(g,pts,k===1?C.light:C.main,6.5-k*1.4,keep*mult*.7,true);
     stroke(g,pts,'#f2fffb',1.8,keep*mult*.9,true);
     const hd=pts[pts.length-1];glow(g,hd[0],hd[1],15-k*2,C.light,keep*mult*.75,C.core);
    }
    const arrive=ph(t,TH+.62,TH+.95)*(1-ph(t,TH+.9,END));
    if(arrive>0&&!S.miss){
     glow(g,ax+q.dir*24,GY-58,34,C.light,arrive*.4,C.core);
     wave(g,ax+q.dir*24,GY-8,10+26*arrive,C.light,arrive*.5,1.6,T,st.seed+130,.18);
    }
    for(let n=0;n<E.rate(st,'mist-droplets',ph(t,TH,END),26);n++){
     const an=r.range(0,TAU),rr=r.range(22,60);
     E.emit({x:x+Math.cos(an)*rr,y:GY-r.range(8,70),vx:-q.dir*r.range(18,48),vy:r.range(-18,12),
      gx:-q.dir*r.range(5,16),gy:14,drag:.5,life:r.range(.42,.8),s0:r.range(1.5,3.2),s1:.5,
      shape:n%4?'orb':'mist',c:C.light,c2:C.core,a:.9,add:true,tag:TAG});
    }
    groundCore(g,x,GY-3,C.light,after*.16,30*s);
   }
  }

  /* 2b · Sương Nuốt bằng ảnh 6 khung. Chỉnh nhanh ở MIST_K / MIST_GY / MIST_SPR.
     Mốc (giây): 1 báo hiệu · 2 vòm sương · 3 hàm mở và khép dần · 4 ngoạm (TH) · 5 bóp + hút · 6 tan.
     Dòng sinh khí khung 5 vẽ bằng code (ảnh không có tia/quả cầu). */
  const MIST_K=.31;          /* tỉ lệ phóng ảnh -> canvas 360x250 */
  const MIST_GY=672;         /* y mặt đất trong ô ảnh (px ảnh gốc) */
  const MIST_CUT=388;        /* hàng cắt giữa hàm trên và hàm dưới ở khung 3 */
  const MIST_SPR=[
   {f:0,a:0,   b:.2,  s0:1,   s1:1},
   {f:1,a:.2,  b:.4,  s0:.8,  s1:1},
   {f:2,a:.4,  b:TH,  s0:1,   s1:1, jaw:1},
   {f:3,a:TH,  b:.9,  s0:1,   s1:1, hit:1},
   {f:4,a:.9,  b:1.3, s0:1,   s1:.94, w0:1, w1:.86},
   {f:5,a:1.3, b:END, s0:1,   s1:1}
  ];
  function mistSprite(g,t,S){
   const q=aim(S),k=MIST_K*clamp(q.scale,.72,1.05),C=MS.cell,F=.07,
    half=C*k*.5*.95,ax=q.x;
   let sh=0,shy=0;
   if(t>=TH){const dk=Math.max(0,1-(t-TH)/.34);sh=Math.sin((t-TH)*90)*2.6*dk;shy=Math.cos((t-TH)*75)*1.8*dk}
   const gx=ax+sh,gy=GY-2+shy;
   g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   /* Bóng đất to dần phía sau ảnh, tan đi khi sương tan. */
   const grow=ph(t,0,TH),sa=(1-ph(t,1.3,END))*(.3+.3*grow);
   if(sa>.01){
    g.save();g.globalAlpha=sa;g.fillStyle='#0f3a35';g.beginPath();
    g.ellipse(gx,gy-1,Math.max(8,(40+70*grow)*k/.31),(7+8*grow),0,0,TAU);g.fill();g.restore();
   }
   for(const o of MIST_SPR){
    if(t<o.a-F||t>o.b+F)continue;
    let al=1;
    if(o.f>0&&t<o.a+F)al=ph(t,o.a-F,o.a+F);
    if(o.f<5&&t>o.b-F)al*=1-ph(t,o.b-F,o.b+F);
    if(o.f===0)al=Math.min(al,ph(t,0,.08));
    if(o.f===5)al*=1-ph(t,1.4,END);
    if(al<=.01)continue;
    const p=ph(t,o.a,o.b),sc=lerp(o.s0,o.s1,eo(p)),wx=lerp(o.w0||1,o.w1||1,p),
     sq=o.hit?1-.05*Math.max(0,1-(t-TH)/.12):1,
     sx0=(o.f%3)*C,sy0=((o.f/3)|0)*C;
    g.save();g.globalAlpha=clamp(al,0,1);
    g.translate(gx,gy);g.scale(sc*wx,sc*sq);g.translate(-(C/2)*k,-MIST_GY*k);
    if(o.jaw){
     /* Hàm trên hạ xuống, hàm dưới nâng lên: khép dần trước khi ngoạm. */
     const e=p*p,up=70*e,lo=-24*e;
     g.drawImage(MS.img,sx0,sy0,C,MIST_CUT,0,up*k,C*k,MIST_CUT*k);
     g.drawImage(MS.img,sx0,sy0+MIST_CUT,C,C-MIST_CUT,0,(MIST_CUT+lo)*k,C*k,(C-MIST_CUT)*k);
    }else g.drawImage(MS.img,sx0,sy0,C,C,0,0,C*k,C*k);
    g.restore();
   }
   g.restore();
  }
  function mistSpriteFx(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,C=COL.mist,r=E.rng(st.seed^0x570201),
    ax=clamp(x-q.dir*172,34,326);
   if(t<TH){
    for(let n=0;n<E.rate(st,'mist-charge',ph(t,0,TH),22);n++){
     const side=r.sign(),yy=r.range(30,GY-14);
     E.emit({x:x+side*r.range(48,90),y:yy,vx:-side*r.range(14,40),vy:r.range(-12,10),gy:0,drag:.4,
      life:r.range(.34,.6),s0:r.range(1.6,3),s1:.5,shape:n%3?'mist':'orb',c:C.light,c2:C.core,a:.85,add:true,tag:TAG});
    }
   }
   if(t>=TH&&t<=END){
    if(E.once(st,'mist-hit')){
     burst(st,'mist-implosion',x,GY-45,S.miss?16:36,{
      speed:[18,70],ang:[0,TAU],size:[5,12],life:[.5,.9],gy:-8,drag:.66,shape:'mist',c:C.light,c2:C.core,a:.8,add:true});
     burst(st,'mist-core-drops',x,GY-14,S.miss?14:30,{
      speed:[26,82],ang:[-Math.PI*.92,-Math.PI*.08],size:[1.8,4.2],life:[.45,.84],
      gy:80,drag:.46,shape:'orb',c:C.light,c2:C.core,a:.96,add:true,floor:GY+2,bounce:.1});
    }
    for(let i=0;i<3;i++){
     const start=TH+i*.15,p=ph(t,start,start+.42),f=1-ph(t,start+.2,start+.6);
     if(p>0&&f>0)wave(g,x,GY-3,8+110*eo(p)*s,i===1?C.core:C.light,f*.7,2.2,T,st.seed+80+i,.2);
    }
    /* Dòng sinh khí: ba sợi sương chảy từ mục tiêu về người đánh, đầu sáng dẫn đường. */
    const flow=ph(t,TH+.08,TH+.82),keep=1-ph(t,TH+.76,END),mult=S.miss?.4:1;
    if(flow>0&&keep>0)for(let k=0;k<3;k++){
     const pts=[],head=eo(flow),tailV=Math.max(0,head-.6);
     for(let j=0;j<22;j++){
      const v=lerp(tailV,head,j/21),px=lerp(x-q.dir*16,ax+q.dir*20,v),
       py=GY-58-Math.sin(v*Math.PI)*(26+k*13)+Math.sin(v*TAU*1.2+T*4+k*2.1)*(2.5+k*1.5);
      pts.push(point(px,py));
     }
     stroke(g,pts,C.deep,12-k*2.6,keep*mult*.45,false);
     stroke(g,pts,k===1?C.light:C.main,6.5-k*1.4,keep*mult*.7,true);
     stroke(g,pts,'#f2fffb',1.8,keep*mult*.9,true);
     const hd=pts[pts.length-1];glow(g,hd[0],hd[1],15-k*2,C.light,keep*mult*.75,C.core);
    }
    const arrive=ph(t,TH+.62,TH+.95)*(1-ph(t,TH+.9,END));
    if(arrive>0&&!S.miss){
     glow(g,ax+q.dir*24,GY-58,34,C.light,arrive*.4,C.core);
     wave(g,ax+q.dir*24,GY-8,10+26*arrive,C.light,arrive*.5,1.6,T,st.seed+130,.18);
    }
    for(let n=0;n<E.rate(st,'mist-droplets',ph(t,TH,END),20);n++){
     const an=r.range(0,TAU),rr=r.range(22,60);
     E.emit({x:x+Math.cos(an)*rr,y:GY-r.range(8,70),vx:-q.dir*r.range(18,48),vy:r.range(-18,12),
      gx:-q.dir*r.range(5,16),gy:14,drag:.5,life:r.range(.42,.8),s0:r.range(1.5,3.2),s1:.5,
      shape:n%4?'orb':'mist',c:C.light,c2:C.core,a:.9,add:true,tag:TAG});
    }
   }
  }

  /* 3 · Côn Bằng Triển Sí: Côn Bằng là cá voi khổng lồ mọc đôi cánh nhiều tầng.
     Vỗ cánh bay vòng lên rồi lao xuống đâm vào địch (trúng ở TH), vỡ thành cột nước,
     sóng quét ngang, lông vũ và mưa nước rơi. */
  const SEA={deep:'#1d3a85',main:'#4d86dd',light:'#8ccaff',core:'#eefaff'};
  const WH={back:'#141f58',top:'#26408f',mid:'#3f68c0',low:'#7ea8f0',belly:'#d6e4ff',edge:'#e9f2ff'};
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
  /* Một cánh: xương cánh từ vai theo góc lead, màng nối, rồi ba tầng lông (dài – vừa – ngắn). far=cánh xa, tối hơn. */
  function whaleWing(g,rx,ry,len,lead,a,far){
   if(a<=.01||len<4)return;
   const C=COL.wing,ca=Math.cos(lead),sa=Math.sin(lead),
    tx=rx+ca*len*.94,ty=ry+sa*len*.94;
   poly(g,[[rx,ry],[tx,ty],[tx+Math.cos(lead-.5)*len*.3,ty+Math.sin(lead-.5)*len*.3],
    [rx+Math.cos(lead-1.2)*len*.62,ry+Math.sin(lead-1.2)*len*.62]],
    far?'rgba(46,36,98,.78)':'rgba(70,54,134,.82)',C.light,a*.8,1.1);
   const tiers=[
    {n:11,lm:1,w:15,col:far?C.deep:C.main,al:.88},
    {n:9,lm:.72,w:11,col:far?C.main:C.light,al:.82},
    {n:6,lm:.42,w:7.5,col:C.core,al:.72}];
   for(const tr of tiers){
    for(let i=0;i<tr.n;i++){
     const f=i/(tr.n-1),pos=.12+.78*f,bx=rx+ca*len*pos,by=ry+sa*len*pos,
      an=lead-(1.12*(1-f)+.14),l=len*tr.lm*(.62-.26*f);
     feather(g,bx,by,l,an,tr.w*(1-.3*f),tr.col,a*tr.al);
    }
   }
   stroke(g,[[rx,ry],[rx+ca*len*.5,ry+sa*len*.5],[tx,ty]],'#f1eaff',2.2,a*.9,true);
   stroke(g,[[rx,ry],[tx,ty]],C.light,5,a*.22,true);
   glow(g,tx,ty,Math.max(5,len*.1),C.light,a*.28,C.core);
  }
  function whaleBody(g,L,a,T){
   if(a<=.01)return;
   g.save();g.globalAlpha=clamp(a,0,1);g.lineJoin='round';g.lineCap='round';
   /* Đuôi: cuống đuôi cong lên, hai thùy đuôi vẫy theo nhịp cánh. */
   g.save();g.translate(-.47*L,-.03*L);g.rotate(Math.sin(T*7.5-.9)*.34);
   const fl=[[0,0],[-.07,-.075],[-.2,-.25],[-.105,-.045],[-.225,.11],[-.065,.045]].map(p=>[p[0]*L,p[1]*L]);
   const fg=g.createLinearGradient(0,0,-.22*L,-.1*L);
   fg.addColorStop(0,WH.mid);fg.addColorStop(.6,WH.top);fg.addColorStop(1,WH.low);
   poly(g,fl,fg,WH.edge,a,1.2);
   stroke(g,[fl[0],[-.1*L,-.03*L],fl[2]],'#bcd6ff',1,.7*a,true);
   stroke(g,[[-.105*L,-.045*L],[-.14*L,.0],fl[4]],'#bcd6ff',1,.6*a,true);
   g.restore();
   const body=()=>{
    g.beginPath();g.moveTo(.5*L,.01*L);
    g.bezierCurveTo(.5*L,-.09*L,.4*L,-.19*L,.12*L,-.18*L);
    g.bezierCurveTo(-.15*L,-.17*L,-.34*L,-.08*L,-.47*L,-.045*L);
    g.lineTo(-.47*L,.012*L);
    g.bezierCurveTo(-.34*L,.05*L,-.18*L,.13*L,.02*L,.165*L);
    g.bezierCurveTo(.28*L,.2*L,.5*L,.12*L,.5*L,.01*L);
    g.closePath();
   };
   const bg=g.createLinearGradient(0,-.19*L,0,.19*L);
   bg.addColorStop(0,WH.back);bg.addColorStop(.32,WH.top);bg.addColorStop(.6,WH.mid);bg.addColorStop(1,WH.low);
   g.fillStyle=bg;body();g.fill();
   g.save();body();g.clip();
   /* Bụng sáng có nếp dọc, hàng vân mây xanh nhạt trên hông. */
   const be=g.createLinearGradient(0,.03*L,0,.2*L);
   be.addColorStop(0,'rgba(214,228,255,.55)');be.addColorStop(1,WH.belly);
   g.fillStyle=be;g.beginPath();g.moveTo(.52*L,.05*L);
   g.bezierCurveTo(.3*L,.04*L,.02*L,.075*L,-.25*L,.06*L);g.lineTo(-.5*L,.03*L);
   g.lineTo(-.5*L,.3*L);g.lineTo(.55*L,.3*L);g.closePath();g.fill();
   g.lineWidth=.8;g.strokeStyle='rgba(110,140,215,.55)';
   for(let k=0;k<6;k++){
    g.beginPath();g.moveTo(.4*L,(.075+k*.02)*L);
    g.quadraticCurveTo(.15*L,(.1+k*.022)*L,-.12*L,(.1+k*.017)*L);g.stroke();
   }
   g.strokeStyle='rgba(176,204,255,.38)';g.lineWidth=1.1;
   for(let k=0;k<3;k++){
    g.beginPath();g.moveTo((.08-k*.15)*L,(-.05+k*.012)*L);
    g.quadraticCurveTo((.01-k*.15)*L,(-.085+k*.012)*L,(-.06-k*.15)*L,(-.05+k*.012)*L);g.stroke();
   }
   g.restore();
   g.strokeStyle=E.rgba(WH.edge,.82);g.lineWidth=1.3;body();g.stroke();
   /* Sống lưng sáng, miệng, mắt và lỗ thở. */
   stroke(g,[[.47*L,-.07*L],[.36*L,-.15*L],[.1*L,-.175*L],[-.2*L,-.13*L]],'#cfe2ff',1.2,.62*a,true);
   stroke(g,[[.495*L,.055*L],[.4*L,.085*L],[.26*L,.07*L]],'#0c1546',1.4,.95*a,false);
   g.fillStyle='#fff6df';g.beginPath();g.arc(.355*L,-.005*L,.021*L,0,TAU);g.fill();
   g.fillStyle='#0b1130';g.beginPath();g.arc(.362*L,-.003*L,.0132*L,0,TAU);g.fill();
   g.fillStyle='#ffffff';g.beginPath();g.arc(.366*L,-.008*L,.004*L,0,TAU);g.fill();
   stroke(g,[[.16*L,-.178*L],[.19*L,-.181*L]],'#0c1546',1.3,.8*a,false);
   g.restore();
  }
  function fxWings(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,dir=q.dir,C=COL.wing,r=E.rng(st.seed^0x570300),L=124*s,
    u0=ph(t,0,TH),hitT=Math.max(0,t-TH);
   /* Bóng đáp + vòng ấn báo điểm rơi: hiện từ đầu, tan ngay sau khi trúng. */
   const warning=1-ph(t,TH-.04,TH+.14);
   if(warning>.01){
    blob(g,x,GY-3,34+72*u0,7+8*u0,WH.back,.58*warning,T,st.seed+1,SEA.light,.22);
    groundCore(g,x,GY-4,SEA.light,(.24+.22*u0)*warning,30+54*u0);
    ring(g,x,GY-2,26+68*u0,5+8*u0,SEA.light,.7*warning,1.6);
    ring(g,x,GY-2,14+46*u0,3+6*u0,'#e8fbff',.5*warning,1.2);
    for(let i=0;i<6;i++){
     const side=i%2?-1:1,off=24+(i>>1)*15+(1-u0)*30;
     stroke(g,[point(x+side*(off+16),GY-5),point(x+side*off,GY-4),point(x+side*(off-14),GY-3)],
      i%2?'#8ccaff':'#d9f4ff',1.1,.4*warning,true);
    }
   }
   /* Đường bay: cong lên rồi lao xuống chếch vào địch; sau khi trúng, đà tắt dần khi cá voi tan. */
   const sx=x-dir*132*s,sy=84,cxp=x-dir*74*s,cyp=18,ex=x-dir*14*s,ey=GY-86;
   const bez=u=>{const m=1-u;return[m*m*sx+2*m*u*cxp+u*u*ex,m*m*sy+2*m*u*cyp+u*u*ey]};
   const pu=lerp(u0,u0*u0,.55);
   const wa=t<TH+.03?1:1-ph(t,TH+.03,TH+.24);
   if(wa>.01){
    const a1=bez(clamp(pu-.025,0,1)),b1=bez(clamp(pu+.025,0,1));
    let px,py;
    const p0=bez(clamp(pu,0,1));
    if(t<=TH){px=p0[0];py=p0[1]}
    else{
     const tx=ex-bez(.97)[0],ty=ey-bez(.97)[1],tl=Math.hypot(tx,ty)||1,k=28*eo(ph(t,TH,TH+.3));
     px=ex+tx/tl*k;py=ey+ty/tl*k;
    }
    const ang=clamp(Math.atan2(b1[1]-a1[1],Math.abs(b1[0]-a1[0])||1),-.5,.9);
    const cs=Math.cos(ang),sn=Math.sin(ang),
     W=(lx,ly)=>[px+dir*(cs*lx-sn*ly),py+sn*lx+cs*ly];
    /* Vệt gió và mây phía sau thân. */
    if(u0>.05&&t<=TH+.1){
     const tr=[],tr2=[];
     for(let k=0;k<=12;k++){
      const p=bez(Math.max(0,pu-k*.03));
      tr.push(point(p[0],p[1]-4+Math.sin(T*6+k)*3));
      tr2.push(point(p[0],p[1]+12+Math.sin(T*5+k*.8)*3));
     }
     const fa=(1-ph(t,TH,TH+.12))*wa;
     ribbon(g,tr.reverse(),14,C.main,.78*fa,C.core);
     ribbon(g,tr2.slice().reverse(),7,SEA.light,.66*fa,'#ffffff');
     for(const k of [3,7,11]){
      const p=bez(Math.max(0,pu-k*.03));
      fogPuff(g,p[0],p[1]+7,15+k*.7,9,.46*(1-k/14)*fa,T,st.seed+80+k,
       {deep:'#3a3478',main:C.main,light:C.light,core:C.core});
     }
    }
    /* Vỗ cánh chậm rồi xếp cánh về sau khi lao; lúc trúng thì xòe bung. */
    const dive=ph(u0,.58,.92),flap=Math.sin(T*7.5),
     lead=lerp(-2.2+.5*flap,-2.62,dive)+(t>TH?(1.12*eo(ph(t,TH,TH+.2))):0),
     shoulderX=.06*L,shoulderY=-.15*L,wl=86*s,sq=1-.1*ph(t,TH,TH+.2);
    glow(g,px,py,L*.62,C.light,.18*wa,SEA.core);
    g.save();g.translate(px,py);g.scale(dir,1);g.rotate(ang);g.scale(sq,1/sq);
    whaleWing(g,shoulderX-5,shoulderY-3,wl*.9,lead-.2,wa*.72,true);
    whaleBody(g,L,wa,T);
    whaleWing(g,shoulderX,shoulderY,wl,lead,wa,false);
    g.restore();
    /* Nước phun từ lỗ thở và rớt từ đuôi lúc bay. */
    if(t<TH){
     for(let n=E.rate(st,'whale-spout',ph(t,.04,TH),26);n>0;n--){
      const b=W(.17*L,-.185*L);
      E.emit({x:clamp(b[0],6,354),y:clamp(b[1],6,244),vx:r.range(-14,14),vy:-r.range(34,66),gy:150,drag:.4,
       life:r.range(.34,.6),s0:r.range(1.6,3),s1:.45,shape:'orb',c:SEA.light,c2:SEA.core,a:.92,add:true,tag:TAG});
     }
     for(let n=E.rate(st,'whale-drip',ph(t,.04,TH),30);n>0;n--){
      const b=W(-.58*L,-.06*L);
      E.emit({x:clamp(b[0],6,354),y:clamp(b[1],6,244),vx:-dir*r.range(6,28),vy:r.range(-12,22),gy:110,drag:.5,
       life:r.range(.38,.7),s0:r.range(1.4,2.8),s1:.4,shape:n%3?'orb':'mist',c:SEA.main,c2:SEA.core,a:.85,add:true,tag:TAG});
     }
    }
   }
   if(t>=TH-.04&&t<=END){
    const fade=1-ph(t,TH+.5,END),after=1-ph(t,TH+.4,END);
    if(E.once(st,'whale-impact')){
     burst(st,'whale-water',x,GY-22,S.miss?26:56,{
      speed:[46,128],ang:[-Math.PI*.92,-Math.PI*.08],size:[2,4.6],life:[.55,.98],
      gy:300,drag:.28,shape:'orb',c:SEA.main,c2:SEA.core,a:.96,add:true,floor:GY+3,bounce:.18});
     burst(st,'whale-mist',x,GY-8,S.miss?10:20,{
      speed:[16,58],ang:[-Math.PI,-.02],size:[9,18],life:[.55,.95],
      gy:-10,drag:.7,shape:'mist',c:SEA.light,c2:SEA.core,a:.7,add:true});
     burst(st,'whale-feathers',x,GY-54,S.miss?14:30,{
      speed:[22,74],ang:[-Math.PI*.94,-Math.PI*.06],size:[2.5,5.5],life:[.55,.98],
      gy:86,drag:.42,shape:'leaf',c:C.main,c2:C.core,a:.95,vr:[-8,8],fl:8});
     for(const side of [-1,1])
      burst(st,'whale-sweep'+side,x+side*12,GY-9,S.miss?6:12,{
       speed:[70,140],ang:side>0?[-.28,.04]:[Math.PI-.04,Math.PI+.28],size:[2,4.4],life:[.3,.58],
       gy:20,drag:.5,shape:'streak',c:SEA.light,c2:SEA.core,a:.92,add:true});
    }
    for(let i=0;i<3;i++){
     const start=TH+i*.15,p=ph(t,start,start+.44),f=1-ph(t,start+.22,start+.64);
     if(p>0&&f>0)wave(g,x,GY-4,8+96*eo(p)*s*(1-i*.15),i===1?C.light:SEA.light,f*.74,2.3,T,st.seed+70+i,.18);
    }
    hitBloom(g,x,SEA,T,st.seed+75,(1-ph(t,TH+.16,TH+.38))*.92,s);
    const flash=1-ph(t,TH-.02,TH+.16);
    if(flash>.01)glow(g,x,GY-40,48*s,SEA.light,flash*.5,'#ffffff');
    /* Cột nước vọt lên rồi sụp, kèm hai dải gió nước xoáy bên hông. */
    const col=eo(ph(t,TH,TH+.2))*(1-ph(t,TH+.3,TH+.74));
    if(col>.02){
     const h=84*s*col,pts=[];
     for(let k=0;k<6;k++){
      const v=k/5;
      blob(g,x+Math.sin(T*9+k)*2.5*v,GY-7-h*v,(21-2.8*k)*s,(14-1.5*k)*s,k%2?SEA.main:SEA.deep,col*.82,T,st.seed+90+k,SEA.core,.26);
     }
     for(let j=0;j<14;j++){const v=j/13;pts.push(point(x+Math.sin(v*5+T*8)*3.2*v,GY-6-h*v))}
     ribbon(g,pts,20*s,SEA.main,col*.7,SEA.core);
     ribbon(g,pts,3,SEA.light,col*.9,'#ffffff');
     glow(g,x,GY-8-h,Math.max(6,20*s*col),SEA.light,col*.34,SEA.core);
    }
    const spin=ph(t,TH+.02,TH+.63),twFade=1-ph(t,TH+.48,TH+1.08);
    for(const side of [-1,1]){
     const pts=[];
     for(let j=0;j<26;j++){
      const v=j/25,a=T*5+v*TAU*1.55+side*.9,rr=(7+23*v)*s;
      pts.push(point(x+side*(28+17*v)*s+Math.cos(a)*rr,GY-4-v*53+Math.sin(a)*rr*.3));
     }
     ribbon(g,pts,4.3,C.main,twFade*(.33+.3*spin),C.core);
     ribbon(g,pts,1.1,SEA.light,twFade*.65,'#ffffff');
    }
    /* Vòng nước bắn ra như vương miện rồi rơi xuống đất. */
    for(let i=0;i<10;i++){
     const side=i%2?-1:1,lane=i>>1,vx=side*(30+lane*13),vy=128+lane*14,tt=Math.min(hitT*.9,.8),pts=[];
     if(tt<.04)continue;
     for(let j=0;j<=8;j++){
      const tj=tt*j/8;
      pts.push(point(x+vx*tj,Math.min(GY-2,GY-8-vy*tj+250*tj*tj)));
     }
     ribbon(g,pts,2.6,SEA.light,fade*.68,SEA.core);
    }
    /* Mưa nước và lông vũ rơi dần quanh điểm trúng. */
    for(let n=E.rate(st,'whale-rain',ph(t,TH+.08,END-.1),26);n>0;n--)
     E.emit({x:x+r.range(-46,46),y:GY-r.range(64,112),vx:r.range(-8,8),vy:r.range(10,40),gy:230,drag:.25,
      life:r.range(.45,.78),s0:r.range(1.4,2.6),s1:.6,shape:'orb',c:SEA.main,c2:SEA.core,a:.9,add:true,
      tag:TAG,floor:GY+2,bounce:.1});
    for(let n=E.rate(st,'wing-drift',ph(t,TH,END),22);n>0;n--){
     const xx=x+r.range(-30,30);
     E.emit({x:xx,y:GY-r.range(22,76),vx:r.range(-31,31),vy:-r.range(10,46),
      gy:66,drag:.48,life:r.range(.48,.86),s0:r.range(2,4),s1:.55,
      shape:'leaf',c:n%2?C.main:C.light,c2:C.core,a:.92,tag:TAG,
      rot:r.range(0,TAU),vr:r.range(-6,6),fl:9});
    }
    groundCore(g,x,GY-3,SEA.light,after*.2,32*s);
   }
  }

  /* 3b · Côn Bằng Triển Sí bằng ảnh. Cá voi bay từ phía người đánh vào địch, KHÔNG có vòng ấn dưới chân địch.
     Ảnh dùng khung 2-6 (khung 1 bỏ). Cá voi trong ảnh quay đầu sang PHẢI; bên kia thì lật.
     Mốc (giây): 2 bay lượn 0-.27 · 3 lao xuống .27-TH · 4 va chạm TH-.9 · 5 nổ nước .9-1.3 · 6 tan 1.3-END.
     Chỉnh nhanh: WH_K (khung nước), WH_KW (khung cá voi), WH_GY, WH_A2/WH_A3 (mũi cá voi trong ảnh), WH_SHADOW. */
  const WH_K=.31,WH_KW=.28,WH_GY=648,WH_SHADOW=true;
  const WH_A2=[724,310],WH_A3=[636,640];
  const WH_SPR=[
   {f:1,a:0,   b:.27, fl:1},
   {f:2,a:.27, b:TH,  fl:1},
   {f:3,a:TH,  b:.9,  s0:.9, s1:1},
   {f:4,a:.9,  b:1.3, s0:1,  s1:1.03},
   {f:5,a:1.3, b:END, s0:1,  s1:1}
  ];
  /* Vị trí mũi cá voi: bay ngang rồi cắm chéo xuống, nhanh dần, chạm đất đúng lúc TH. */
  function whaleHead(t,x,dir){
   if(t<.27){const p=ph(t,0,.27);return {hx:x-dir*lerp(200,110,p),hy:lerp(70,92,p),rot:lerp(-.1,.12,p)}}
   const p=ph(t,.27,TH),e=Math.pow(p,1.5);
   return {hx:x-dir*lerp(105,6,e),hy:lerp(96,GY-8,e),rot:lerp(-.18,.02,p)};
  }
  function whaleSprite(g,t,S){
   const q=aim(S),x=q.x,dir=q.dir,sm=clamp(q.scale,.72,1.05),C=WS.cell,F=.06,
    k=WH_K*sm,kw=WH_KW*sm,half=C*k*.5*.8,ax=x;
   let sh=0,shy=0;
   if(t>=TH){const dk=Math.max(0,1-(t-TH)/.4);sh=Math.sin((t-TH)*85)*3.6*dk;shy=Math.cos((t-TH)*70)*2.6*dk}
   g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   /* Bóng chạy theo cá voi trên mặt đất (không phải vòng ấn dưới chân địch). */
   if(WH_SHADOW&&t<TH+.15){
    const u=ph(t,0,TH),h=whaleHead(Math.min(t,TH),x,dir),
     sx=h.hx-dir*lerp(70,10,u),sa=(.18+.22*u)*(1-ph(t,TH,TH+.15));
    g.save();g.globalAlpha=sa;g.fillStyle='#123c54';g.beginPath();
    g.ellipse(clamp(sx,6,354),GY-1,(16+34*u)*sm,3.5+3.5*u,0,0,TAU);g.fill();g.restore();
   }
   for(const o of WH_SPR){
    let al=1;
    if(t<o.a-F||t>o.b+F)continue;
    if(o.f>2&&t<o.a+F)al=ph(t,o.a-F,o.a+F);
    if(o.f>1&&o.f<=2&&t<o.a+F)al=ph(t,o.a-F,o.a+F);
    if(o.f<5&&t>o.b-F)al*=1-ph(t,o.b-F,o.b+F);
    if(o.f===1)al=Math.min(al,ph(t,0,.05)+.35);
    if(o.f===5)al*=1-ph(t,1.4,END);
    al=clamp(al,0,1);if(al<=.01)continue;
    const sx0=(o.f%3)*C,sy0=((o.f/3)|0)*C;
    g.save();g.globalAlpha=al;
    if(o.fl){
     const h=whaleHead(clamp(t,o.a,o.b),x,dir),A=o.f===1?WH_A2:WH_A3;
     g.translate(h.hx+sh,h.hy+shy);g.scale(dir,1);g.rotate(h.rot);g.translate(-A[0]*kw,-A[1]*kw);
     g.drawImage(WS.img,sx0,sy0,C,C,0,0,C*kw,C*kw);
    }else{
     const p=ph(t,o.a,o.b),sc=lerp(o.s0,o.s1,eo(p));
     g.translate(ax+sh,GY-2+shy);g.scale(sc,sc);g.translate(-(C/2)*k,-WH_GY*k);
     g.drawImage(WS.img,sx0,sy0,C,C,0,0,C*k,C*k);
    }
    g.restore();
   }
   g.restore();
  }
  function whaleSpriteFx(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,dir=q.dir,C=COL.wing,r=E.rng(st.seed^0x570300);
   if(t<TH){
    const h=whaleHead(t,x,dir);
    for(let n=E.rate(st,'whale-drip',ph(t,.04,TH),26);n>0;n--){
     E.emit({x:clamp(h.hx-dir*r.range(30,110),6,354),y:clamp(h.hy-r.range(0,34),6,244),vx:-dir*r.range(6,28),vy:r.range(-12,22),
      gy:110,drag:.5,life:r.range(.38,.7),s0:r.range(1.4,2.8),s1:.4,shape:n%3?'orb':'mist',c:SEA.main,c2:SEA.core,a:.85,add:true,tag:TAG});
    }
   }
   if(t>=TH-.04&&t<=END){
    if(E.once(st,'whale-impact')){
     burst(st,'whale-water',x,GY-22,S.miss?18:40,{
      speed:[46,128],ang:[-Math.PI*.92,-Math.PI*.08],size:[2,4.6],life:[.55,.98],
      gy:300,drag:.28,shape:'orb',c:SEA.main,c2:SEA.core,a:.96,add:true,floor:GY+3,bounce:.18});
     burst(st,'whale-feathers',x,GY-54,S.miss?10:24,{
      speed:[22,74],ang:[-Math.PI*.94,-Math.PI*.06],size:[2.5,5.5],life:[.55,.98],
      gy:86,drag:.42,shape:'leaf',c:C.main,c2:C.core,a:.95,vr:[-8,8],fl:8});
     for(const side of [-1,1])
      burst(st,'whale-sweep'+side,x+side*12,GY-9,S.miss?5:10,{
       speed:[70,140],ang:side>0?[-.28,.04]:[Math.PI-.04,Math.PI+.28],size:[2,4.4],life:[.3,.58],
       gy:20,drag:.5,shape:'streak',c:SEA.light,c2:SEA.core,a:.92,add:true});
    }
    for(let i=0;i<3;i++){
     const start=TH+i*.15,p=ph(t,start,start+.44),f=1-ph(t,start+.22,start+.64);
     if(p>0&&f>0)wave(g,x,GY-4,8+112*eo(p)*s*(1-i*.15),i===1?C.light:SEA.light,f*.74,2.3,T,st.seed+70+i,.18);
    }
    const flash=1-ph(t,TH-.02,TH+.16);
    if(flash>.01)glow(g,x,GY-40,52*s,SEA.light,flash*.5,'#ffffff');
    for(let n=E.rate(st,'whale-rain',ph(t,TH+.08,END-.1),22);n>0;n--)
     E.emit({x:x+r.range(-50,50),y:GY-r.range(64,112),vx:r.range(-8,8),vy:r.range(10,40),gy:230,drag:.25,
      life:r.range(.45,.78),s0:r.range(1.4,2.6),s1:.6,shape:'orb',c:SEA.main,c2:SEA.core,a:.9,add:true,
      tag:TAG,floor:GY+2,bounce:.1});
    for(let n=E.rate(st,'wing-drift',ph(t,TH,END),16);n>0;n--){
     const xx=x+r.range(-30,30);
     E.emit({x:xx,y:GY-r.range(22,76),vx:r.range(-31,31),vy:-r.range(10,46),
      gy:66,drag:.48,life:r.range(.48,.86),s0:r.range(2,4),s1:.55,
      shape:'leaf',c:n%2?C.main:C.light,c2:C.core,a:.92,tag:TAG,
      rot:r.range(0,TAU),vr:r.range(-6,6),fl:9});
    }
   }
  }

  /* 4 · Vũ Xà Triền: thân rắn có vảy cuộn quanh mục tiêu, đầu rõ và ngẩng cao. */
  function snakeHead(g,x,y,dir,a,T){
   if(a<=.01)return;
   g.save();g.translate(x,y);g.scale(dir,1);g.scale(1.1,1.08);g.globalAlpha=clamp(a,0,1);g.lineJoin='round';
   const grad=g.createLinearGradient(-27,-17,31,13);
   grad.addColorStop(0,'#174d3c');grad.addColorStop(.4,'#3da775');grad.addColorStop(.78,'#9cf0c3');grad.addColorStop(1,'#eafff4');
   g.fillStyle=grad;g.beginPath();g.moveTo(-27,1);g.quadraticCurveTo(-22,-10,-13,-15);
   g.lineTo(-2,-18);g.quadraticCurveTo(12,-18,21,-11);g.lineTo(31,-4);
   g.lineTo(34,1);g.quadraticCurveTo(27,8,17,11);g.lineTo(2,14);
   g.lineTo(-13,11);g.quadraticCurveTo(-24,9,-27,1);g.closePath();g.fill();
   g.strokeStyle='#eafff4';g.lineWidth=1.8;g.stroke();
   /* Raised crown fins and a dark dorsal ridge make the head silhouette read at small scale. */
   g.fillStyle=E.rgba('#18523f',a*.94);g.beginPath();g.moveTo(-17,-12);g.lineTo(-23,-23);g.lineTo(-7,-16);g.closePath();g.fill();
   g.beginPath();g.moveTo(-6,-16);g.lineTo(1,-25);g.lineTo(7,-16);g.closePath();g.fill();
   stroke(g,[[-20,-7],[-8,-15],[6,-16],[20,-11]],'#c9ffe0',1.25,a*.88,true);
   /* Visible eye, slit pupil, brow, nostril and jaw. */
   g.fillStyle=E.rgba('#f8dc76',a);g.beginPath();g.ellipse(13,-8,5.2,4.2,-.15,0,TAU);g.fill();
   g.fillStyle=E.rgba('#142d27',a);g.beginPath();g.ellipse(14,-8,1.45,3.1,.08,0,TAU);g.fill();
   g.fillStyle=E.rgba('#ffffff',a*.96);g.beginPath();g.arc(12,-9.5,1.1,0,TAU);g.fill();
   stroke(g,[[7,-13],[13,-15],[20,-12]],'#164936',2,a*.95,false);
   g.fillStyle=E.rgba('#164936',a*.88);g.beginPath();g.arc(28,-2,1.35,0,TAU);g.fill();
   g.fillStyle=E.rgba('#113b31',a*.9);g.beginPath();g.moveTo(7,5);g.quadraticCurveTo(19,3,32,1);
   g.lineTo(26,8);g.quadraticCurveTo(15,12,7,9);g.closePath();g.fill();
   stroke(g,[[5,9],[16,12],[26,8]],'#c8ffe0',1.4,a*.92,true);
   stroke(g,[[29,5],[34,8+Math.sin(T*18)*1.2],[39,6]],'#f28eae',1.7,a*.96,true);
   stroke(g,[[34,8+Math.sin(T*18)*1.2],[39,10]],'#ffe0e9',.9,a*.92,true);
   for(let i=0;i<3;i++)stroke(g,[[-11+i*5,2],[-8+i*5,4],[-6+i*5,3]],'#e2fff0',.8,a*.72,true);
   g.restore();
   glow(g,x+dir*7,y-3,20,'#78f3bb',a*.3,'#eafff3');
  }
  function fxSnake(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,C=COL.wind,r=E.rng(st.seed^0x570401),
    tighten=ph(t,.12,TH+.04),bodyFade=t<TH-.07?1:(1-ph(t,TH-.07,TH+.01)),
    radius=Math.min(63,Math.max(42,Math.min(x-30,330-x))),
    coil=1-.24*eo(tighten),hx=clamp(x+q.dir*48*s,50,310),hy=GY-137;
   /* Ground seal and wind are visible from the first frame; the body closes tighter before impact. */
   const pre=1-ph(t,TH-.08,TH+.16);
   ring(g,x,GY-4,34+8*eo(tighten),7,C.light,.18*pre,1.35);
   groundCore(g,x,GY-3,C.light,.09*pre,24+8*eo(tighten));
   if(bodyFade>.01){
    const points=[],depth=[],n=160,turns=1.55;
    for(let i=0;i<n;i++){
     const v=i/(n-1),ang=v*TAU*turns+(q.dir>0?0:Math.PI)+Math.sin(T*1.1)*.12,
      rx=(radius-7*v)*coil*s,
      yy=GY-62+v*52+Math.sin(ang)*15*s;
     points.push(point(x+Math.cos(ang)*rx,yy));depth.push(Math.sin(ang));
    }
    /* Paint far loops dark first, then near loops with a green back and pale belly stripe. */
    const paintSide=(front,color,width,alpha,mode,offset)=>{
     if(alpha<=.01)return;
     g.save();g.globalAlpha=clamp(alpha,0,1);g.globalCompositeOperation=mode||'source-over';
     g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.lineJoin='round';g.beginPath();let open=false;
     for(let i=1;i<points.length;i++){
      const isFront=(depth[i]+depth[i-1])>=0;
      if(isFront!==front){open=false;continue}
      if(!open){g.moveTo(points[i-1][0],points[i-1][1]+(offset||0));open=true}
      g.lineTo(points[i][0],points[i][1]+(offset||0));
     }
     g.stroke();g.restore();
    };
    paintSide(false,'#103d32',18*s*coil,bodyFade*.76,'source-over',0);
    paintSide(false,C.deep,13*s*coil,bodyFade*.92,'source-over',0);
    paintSide(false,C.main,7*s*coil,bodyFade*.7,'source-over',0);
    paintSide(true,'#103d32',21*s*coil,bodyFade*.98,'source-over',0);
    paintSide(true,C.deep,16*s*coil,bodyFade*.96,'source-over',0);
    paintSide(true,C.main,12.5*s*coil,bodyFade*.98,'source-over',0);
    paintSide(true,C.light,3.8*s*coil,bodyFade*.6,'lighter',0);
    paintSide(true,'#d9ffea',1.4*s*coil,bodyFade*.75,'lighter',4*s);
    /* Overlapping raised scales and short ribs make the coils visibly segmented. */
    for(let i=4;i<points.length-4;i+=5){
     const p=points[i],before=points[i-1],after=points[i+1],ang=Math.atan2(after[1]-before[1],after[0]-before[0]),front=depth[i]>=0;
     g.save();g.translate(p[0],p[1]);g.rotate(ang);
     g.fillStyle=E.rgba(front?(i%2?'#64bd8e':'#91dfb1'):C.deep,bodyFade*(front?.72:.66));
     g.beginPath();g.ellipse(0,0,4.9*s,3.35*s,0,0,TAU);g.fill();
     g.strokeStyle=E.rgba(front?'#d5f3df':'#4b9b72',bodyFade*(front?.62:.48));g.lineWidth=.8;
     g.beginPath();g.arc(0,0,4.25*s,.12,Math.PI-.12);g.stroke();
     g.beginPath();g.moveTo(-2.1*s,0);g.lineTo(2.1*s,0);g.stroke();g.restore();
    }
    /* A thick rising neck joins the coil to a large raised head. */
    const neck=[points[0],point(x+q.dir*57*s,GY-77),point(x+q.dir*57*s,GY-77),
     point(x+q.dir*58*s,GY-103),point(hx-q.dir*13,hy+11)];
    stroke(g,neck,'#103d32',23*s,bodyFade*.98,false);
    stroke(g,neck,C.deep,17*s,bodyFade*.98,false);
    ribbon(g,neck,13*s,C.main,bodyFade*.98,C.light);
    stroke(g,neck.map(p=>point(p[0],p[1]+4*s)),C.light,4.2*s,bodyFade*.88,true);
    stroke(g,neck.map(p=>point(p[0],p[1]+4*s)),'#e3fff0',1.2,bodyFade*.9,true);
    for(let i=1;i<7;i++){
     const v=i/7,xx=lerp(neck[0][0],neck[3][0],v),yy=lerp(neck[0][1],neck[3][1],v);
     stroke(g,[point(xx-4*s,yy),point(xx+4*s,yy-2*s)],i%2?C.light:C.deep,1.7,bodyFade*.82,i%2===0);
    }
    snakeHead(g,hx,hy,q.dir,bodyFade,T);
    for(const side of [-1,1]){
     fogPuff(g,x+side*(radius-4)*s,GY-32,19,9,bodyFade*.18,T,st.seed+110+side,
      {deep:C.deep,main:C.main,light:C.light,core:C.core});
     const gust=[];
     for(let j=0;j<16;j++){
      const v=j/15,ang=T*1.35+v*TAU*.7+side*.8;
      gust.push(point(x+side*(radius+9-20*v)*s+Math.cos(ang)*4,GY-61+v*43+Math.sin(ang)*5));
     }
     ribbon(g,gust,2.8,C.light,bodyFade*.17,C.core);
    }
   }
   if(t>=TH&&t<=END){
    if(E.once(st,'snake-burst')){
     burst(st,'snake-wind-body',x,GY-44,S.miss?22:46,{
      speed:[27,84],ang:[-Math.PI*.94,-Math.PI*.06],size:[2.5,5],life:[.5,.88],
      gy:78,drag:.48,shape:'leaf',c:C.main,c2:C.core,a:.95,vr:[-9,9],fl:9});
     burst(st,'snake-wind-glints',x,GY-31,S.miss?14:28,{
      speed:[22,83],ang:[0,TAU],size:[1.2,2.8],life:[.42,.76],
      gy:-8,drag:.5,shape:'streak',c:C.light,c2:'#ffffff',a:.94,add:true});
    }
    if(t>=TH+.18)burst(st,'snake-aftershock-one',x,GY-28,S.miss?10:18,{
     speed:[28,78],ang:[-Math.PI*.78,-Math.PI*.22],size:[2,4.8],life:[.42,.78],
     gy:92,drag:.5,shape:'leaf',c:C.main,c2:C.core,a:.92,vr:[-8,8],fl:8});
    if(t>=TH+.38)burst(st,'snake-aftershock-two',x,GY-13,S.miss?8:14,{
     speed:[34,92],ang:[-Math.PI*.8,-Math.PI*.2],size:[1.4,3.2],life:[.38,.68],
     gy:45,drag:.48,shape:'streak',c:C.light,c2:C.core,a:.93,add:true});
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
  /* 4b · Vũ Xà Triền bằng ảnh 6 khung. Rắn trong ảnh quay đầu sang PHẢI; bên kia lật bằng g.scale(dir,1).
     Mốc (giây): 1 gió tụ 0-.2 · 2 rắn trồi .2-.4 · 3 siết chặt .4-TH · 4 nghiền (trúng) TH-.9 · 5 vỡ thành gió+lá .9-1.3 · 6 tan 1.3-END.
     Chỉnh nhanh: SNK_K (tỉ lệ), SNK_CX (tâm ngang trong ảnh), gy của từng khung (mặt đất trong ô ảnh gốc). */
  const SNK_K=.31,SNK_CX=380;
  const SNK_SPR=[
   {f:0,a:0,   b:.2,  s0:1,  s1:1,  gy:704},
   {f:1,a:.2,  b:.4,  s0:.94,s1:1,  gy:704},
   {f:2,a:.4,  b:TH,  s0:.97,s1:.9, gy:706},
   {f:3,a:TH,  b:.9,  s0:.9, s1:.94,gy:686, hit:1},
   {f:4,a:.9,  b:1.3, s0:.98,s1:1.04,gy:694},
   {f:5,a:1.3, b:END, s0:1,  s1:1.03,gy:700}
  ];
  function snakeSprite(g,t,S){
   const q=aim(S),dir=q.dir,k=SNK_K*clamp(q.scale,.72,1.05),C=VS.cell,F=.07,
    half=C*k*.5*.95,ax=q.x;
   let sh=0,shy=0;
   if(t>=TH){const dk=Math.max(0,1-(t-TH)/.34);sh=Math.sin((t-TH)*92)*2.8*dk;shy=Math.cos((t-TH)*78)*1.9*dk}
   g.save();g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
   for(const o of SNK_SPR){
    if(t<o.a-F||t>o.b+F)continue;
    let al=1;
    if(o.f>0&&t<o.a+F)al=ph(t,o.a-F,o.a+F);
    if(o.f<5&&t>o.b-F)al*=1-ph(t,o.b-F,o.b+F);
    if(o.f===0)al=Math.min(al,ph(t,0,.08));
    if(o.f===5)al*=1-ph(t,1.4,END);
    al=clamp(al,0,1);if(al<=.01)continue;
    const p=ph(t,o.a,o.b),sc=lerp(o.s0,o.s1,o.f===2?p*p:eo(p)),
     /* Khung 4: thân bị nén lại rồi bật nhẹ ngay lúc trúng. */
     sq=o.hit?1-.07*Math.max(0,1-(t-TH)/.14):1,
     sx0=(o.f%3)*C,sy0=((o.f/3)|0)*C;
    g.save();g.globalAlpha=al;
    g.translate(ax+sh,GY-2+shy);g.scale(dir*sc,sc*sq);g.translate(-SNK_CX*k,-o.gy*k);
    g.drawImage(VS.img,sx0,sy0,C,C,0,0,C*k,C*k);
    g.restore();
   }
   g.restore();
  }
  function snakeSpriteFx(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,C=COL.wind,r=E.rng(st.seed^0x570401);
   if(t<TH){
    /* Lá và gió hút vào chân địch trong lúc rắn cuộn. */
    for(let n=0;n<E.rate(st,'snake-gather',ph(t,0,TH),24);n++){
     const side=r.sign();
     E.emit({x:x+side*r.range(50,92),y:GY-r.range(6,70),vx:-side*r.range(22,56),vy:r.range(-14,10),gy:0,drag:.4,
      life:r.range(.34,.6),s0:r.range(1.6,3),s1:.5,shape:n%3?'leaf':'streak',c:C.main,c2:C.core,a:.85,add:true,tag:TAG,
      vr:r.range(-7,7),fl:8});
    }
   }
   if(t>=TH&&t<=END){
    if(E.once(st,'snake-burst')){
     burst(st,'snake-wind-body',x,GY-44,S.miss?18:38,{
      speed:[27,84],ang:[-Math.PI*.94,-Math.PI*.06],size:[2.5,5],life:[.5,.88],
      gy:78,drag:.48,shape:'leaf',c:C.main,c2:C.core,a:.95,vr:[-9,9],fl:9});
     burst(st,'snake-wind-glints',x,GY-31,S.miss?10:22,{
      speed:[22,83],ang:[0,TAU],size:[1.2,2.8],life:[.42,.76],
      gy:-8,drag:.5,shape:'streak',c:C.light,c2:'#ffffff',a:.94,add:true});
    }
    if(t>=TH+.18)burst(st,'snake-aftershock-one',x,GY-28,S.miss?8:14,{
     speed:[28,78],ang:[-Math.PI*.78,-Math.PI*.22],size:[2,4.8],life:[.42,.78],
     gy:92,drag:.5,shape:'leaf',c:C.main,c2:C.core,a:.92,vr:[-8,8],fl:8});
    for(let i=0;i<3;i++){
     const start=TH+i*.18,p=ph(t,start,start+.43),f=1-ph(t,start+.24,start+.66);
     if(p>0&&f>0)wave(g,x,GY-4,10+104*eo(p)*s*(1-i*.17),i===1?C.light:C.main,f*.69,2.1,T,st.seed+150+i,.2);
    }
    for(let n=0;n<E.rate(st,'snake-scales',ph(t,TH,END),16);n++){
     const an=r.range(0,TAU),rr=r.range(18,56);
     E.emit({x:x+Math.cos(an)*rr,y:GY-r.range(14,72),vx:r.range(-34,34),
      vy:-r.range(8,38),gy:70,drag:.42,life:r.range(.5,.84),s0:r.range(1.8,3.6),
      s1:.5,shape:n%3?'leaf':'spark',c:C.main,c2:C.core,a:.94,add:true,tag:TAG,
      vr:r.range(-8,8),fl:8});
    }
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
   if(t>=TH&&t<=END){
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
    if(S.kyNang==='bang-son-ap-dinh'&&SPR.ok){
     /* Ảnh vẽ thẳng lên canvas (giữ nguyên màu); hạt và sóng vẫn đi qua lớp pixel. */
     iceSprite(g,t,S);
     pixelLayer(g,gg=>{iceSpriteFx(gg,T,t,S,st);E.draw(gg,TAG)});
    }else if(S.kyNang==='suong-nuot'&&MS.ok){
     mistSprite(g,t,S);
     pixelLayer(g,gg=>{mistSpriteFx(gg,T,t,S,st);E.draw(gg,TAG)});
    }else if(S.kyNang==='con-bang-trien-si'&&WS.ok){
     whaleSprite(g,t,S);
     pixelLayer(g,gg=>{whaleSpriteFx(gg,T,t,S,st);E.draw(gg,TAG)});
    }else if(S.kyNang==='vu-xa-trien'&&VS.ok){
     snakeSprite(g,t,S);
     pixelLayer(g,gg=>{snakeSpriteFx(gg,T,t,S,st);E.draw(gg,TAG)});
    }else pixelLayer(g,gg=>{run(gg,T,t,S,st);E.draw(gg,TAG)});
   }catch(e){
    window.__fxBossErr='57: '+(e&&e.message||e);
   }
   return result;
  };
  API.setFxStyle=v=>{style=v==='sm'?'sm':'px';if(prevStyle)prevStyle(v)};
 }
 boot();
})();
