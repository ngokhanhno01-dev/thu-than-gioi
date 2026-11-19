/* ===== FX kỹ năng boss — Canvas 2D, không ảnh =====
   Chỉ bổ sung hình ảnh khi S.kyNang khớp chính xác một id bên dưới.
   Bọc TTGCombatFX.drawAttack giống 40-attack-fx-3a.js; luôn gọi hiệu ứng
   trước trước, lỗi lớp mới thì giữ nguyên kết quả gốc.
   Mốc va chạm t=.665s, kết thúc t=1.68s (t = S.u * 1.9), đất GY=204. */
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

  const prevA=API.drawAttack,E=API.engine;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const ph=E.ph,eo=E.eOut,ei=E.eIn,TAU=E.TAU||Math.PI*2;
  const GY=204,TH=.665,END=1.68,TAG='bossfx';
  const COL={
   ice:'#9fe4ff',mist:'#a3e1d4',wing:'#c9a8ff',
   wind:'#82f0bb',bolt:'#ffe53a',moon:'#a8b8ff'
  };

  /* Cùng hướng/điểm ngắm với file 40. */
  function aim(S){
   const dir=S.pa?1:-1,tx=S.pa?272:85;
   return {dir,x:S.miss?tx-dir*80:tx,scale:(S.miss?.56:1)*(S.cr?1.22:1),
    miss:!!S.miss,crit:!!S.cr};
  }
  function wave(g,x,y,r,c,a,w,t,seed,sq){
   if(a<=.01||r<1)return;
   E.wave(g,x,y,r,c,clamp(a,0,1),w,{t,seed,sq:sq==null?.28:sq,wob:.075,core:'#f4ffff'});
  }
  function blob(g,x,y,rx,ry,c,a,t,seed,core,wob){
   if(a<=.01||rx<1||ry<1)return;
   E.blob(g,x,y,rx,ry,c,clamp(a,0,1),t,seed,
    {wob:wob==null?.32:wob,speed:2.1,core:core||c});
  }
  function ribbon(g,pts,w,c,a,core){
   if(!pts||pts.length<3||a<=.01)return;
   E.ribbon(g,pts,q=>Math.max(.7,w*(.2+.8*Math.sin(Math.PI*q))),
    c,clamp(a,0,1),{core:core||'#ffffff'});
  }
  function bolt(g,pts,c,w,a,core){
   if(!pts||pts.length<2||a<=.01)return;
   g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
   [[w*3.4,c,.18],[w*1.5,c,.62],[Math.max(.7,w*.48),core||'#fffbe1',.95]].forEach(v=>{
    g.strokeStyle=E.rgba(v[1],v[2]*clamp(a,0,1));g.lineWidth=v[0];g.beginPath();
    pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
   });
   g.restore();
  }
  function emitBurst(st,key,x,y,n,o){
   if(E.once(st,key))E.burst(E.rng(st.seed^keyHash(key)),x,y,n,
    Object.assign({tag:TAG},o));
  }
  function keyHash(s){
   let h=2166136261;
   for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);
   return h>>>0;
  }
  function polygon(g,pts,fill,stroke,a){
   if(!pts||pts.length<3||a<=.01)return;
   g.save();g.globalAlpha=clamp(a,0,1);g.fillStyle=fill;
   g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));
   g.closePath();g.fill();
   if(stroke){g.strokeStyle=stroke;g.lineWidth=1.2;g.stroke()}
   g.restore();
  }
  function groundCore(g,x,y,c,a,r){
   E.glow(g,x,y,r,c,a,'#f4ffff');
   E.glow(g,x-25,y+1,r*.46,c,a*.62);
   E.glow(g,x+25,y+1,r*.46,c,a*.62);
  }

  /* 1. Băng Sơn Áp Đỉnh: tinh thể núi rơi, vỡ thành mảnh và sương sát đất. */
  function icePeak(g,x,base,w,h,a){
   if(a<=.01)return;
   g.save();g.globalAlpha=clamp(a,0,1);g.lineJoin='round';
   const gr=g.createLinearGradient(x-w/2,base,x+w/2,base-h);
   gr.addColorStop(0,'#397aa5');gr.addColorStop(.48,'#9fe4ff');gr.addColorStop(1,'#f2fdff');
   polygon(g,[[x-w*.52,base],[x-w*.39,base-h*.38],[x-w*.17,base-h*.31],
    [x-w*.03,base-h],[x+w*.15,base-h*.43],[x+w*.35,base-h*.64],
    [x+w*.53,base]],gr,'#dbf8ff',a);
   polygon(g,[[x-w*.03,base-h],[x+w*.15,base-h*.43],[x+w*.02,base-h*.29],
    [x-w*.14,base-h*.53]],'rgba(255,255,255,.60)',null,a);
   polygon(g,[[x-w*.52,base],[x-w*.39,base-h*.38],[x-w*.17,base-h*.31],
    [x-w*.03,base-h],[x-w*.10,base]],'rgba(51,132,179,.62)',null,a);
   g.restore();
   /* Hai tinh thể phụ giữ khoảng trống ở giữa để không che nhân vật. */
   E.crystal(g,x-w*.58,base+1,w*.3,h*.47,-w*.08,
    {dark:'#397aa5',mid:'#78c9ed',light:'#dff8ff',edge:'#efffff'},a*.86,{shine:.7});
   E.crystal(g,x+w*.58,base+1,w*.27,h*.39,w*.06,
    {dark:'#397aa5',mid:'#78c9ed',light:'#dff8ff',edge:'#efffff'},a*.78,{shine:.7});
  }
  function fxIce(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,r=E.rng(st.seed^0x570101);
   if(t<TH){
    const fall=ei(ph(t,.08,TH)),base=lerp(-92,GY-8,fall);
    const vis=1-ph(t,TH-.025,TH+.1);
    E.wave(g,x,GY,14+36*eo(ph(t,0,.45)),COL.ice,.32*(1-ph(t,.35,TH)),1.5,T,st.seed,.24);
    icePeak(g,x,base,76*s,145*s,vis);
    for(let n=E.rate(st,'ice-charge',ph(t,0,TH),26);n>0;n--){
     const side=r.sign(),d=r.range(42,96);
     E.emit({x:x+side*d,y:r.range(18,115),vx:-side*r.range(18,58),vy:r.range(22,74),
      gy:24,drag:.35,life:r.range(.34,.62),s0:r.range(1.2,2.5),s1:.5,
      shape:n%3?'flake':'spark',c:COL.ice,c2:'#f6ffff',a:.92,add:true,tag:TAG});
    }
   }
   const d=t-TH;
   if(d>=0&&d<.3){
    const crack=1-ph(t,TH+.12,TH+.42);
    if(E.once(st,'ice-impact')){
     E.burst(E.rng(st.seed^0x570102),x,GY-9,S.miss?12:S.cr?46:38,{
      speed:[42,168],ang:[-Math.PI*.97,-Math.PI*.03],size:[2.4,5.8],
      life:[.48,.96],gy:250,drag:.34,shape:'shard',c:'#79cbed',c2:'#eafcff',
      a:.98,tag:TAG,vr:[-11,11],floor:GY+4,bounce:.24});
     E.burst(E.rng(st.seed^0x570103),x,GY-3,S.miss?7:18,{
      speed:[10,56],ang:[-Math.PI,-.03],size:[9,19],life:[.55,.94],
      gy:-8,drag:.8,shape:'mist',c:COL.ice,c2:'#eaffff',a:.56,add:true,tag:TAG});
    }
    wave(g,x,GY,8+104*eo(ph(t,TH,TH+.48))*s,COL.ice,crack*.72,2.2,T,st.seed+11,.25);
    wave(g,x,GY,5+64*eo(ph(t,TH+.06,TH+.52))*s,'#eaffff',crack*.47,1.25,T,st.seed+12,.23);
    groundCore(g,x,GY-4,COL.ice,crack*.32,35*s);
    if(t>=TH+.18)emitBurst(st,'ice-aftershock',x,GY-4,S.miss?5:16,{
     speed:[28,112],ang:[-Math.PI*.98,-.02],size:[1.8,4.1],life:[.42,.78],
     gy:180,drag:.48,shape:'shard',c:'#9fe4ff',c2:'#f7ffff',a:.9,
     floor:GY+4,bounce:.12});
   }
   if(t>=TH+.3&&t<=END){
    const after=1-ph(t,TH+.3,END);
    for(let i=0;i<8;i++){
     const side=i%2?-1:1,xx=x+side*(26+i*8),rr=E.rng(st.seed+0x570110+i);
     blob(g,xx,GY-1,18+8*rr(),5,COL.ice,after*.25,T,st.seed+80+i,'#effcff',.38);
    }
    for(let n=E.rate(st,'ice-snow',ph(t,TH+.3,END),18);n>0;n--)
     E.emit({x:x+r.range(-74,74),y:GY-r.range(0,17),vx:r.range(-16,16),
      vy:-r.range(8,40),gy:86,drag:.42,life:r.range(.42,.8),s0:r.range(1.1,2.2),
      s1:.4,shape:'flake',c:COL.ice,c2:'#ffffff',a:.85,add:true,tag:TAG});
   }
  }

  /* 2. Sương Nuốt: màn sương cuộn quanh mục tiêu rồi rút về phía người đánh. */
  function fxMist(g,T,t,S,st){
   const q=aim(S),x=q.x,r=E.rng(st.seed^0x570201);
   const gather=ph(t,TH-.26,TH+.24),fade=t<TH?1:1-ph(t,TH+.46,END);
   const center=lerp(x,x-q.dir*76,gather),radius=lerp(80,18,gather);
   if(t<TH+.55&&fade>.01){
    /* Sương thành hai cuộn hở, chừa vùng giữa cơ thể và lõi sáng sát đất. */
    for(let i=0;i<16;i++){
     const a=i*TAU/16+T*(2.6+gather*4.2),rr=radius*(.72+.28*Math.sin(T*2+i));
     const bx=center+Math.cos(a)*rr,by=GY-42+Math.sin(a)*34;
     blob(g,bx,by,13+4*Math.sin(T*3+i),9,COL.mist,fade*(.26+.1*Math.sin(i+T)),T,
      st.seed+30+i,'#eafff9',.42);
    }
    for(let k=0;k<3;k++){
     const pts=[];
     for(let j=0;j<18;j++){
      const v=j/17,a=T*(3+k*.25)+v*TAU*1.35+k*TAU/3,
       rr=radius*(.18+.82*v);
      pts.push([center+Math.cos(a)*rr,GY-38+Math.sin(a)*25-v*14]);
     }
     ribbon(g,pts,3.1-k*.45,COL.mist,fade*.32,'#edfffb');
    }
    E.wave(g,x,GY,12+24*eo(ph(t,0,TH)),COL.mist,fade*.32,1.1,T,st.seed+41,.26);
    groundCore(g,center,GY-5,COL.mist,fade*.2,25);
    for(let n=E.rate(st,'mist-swirl',ph(t,0,TH+.42),42);n>0;n--){
     const a=r.range(0,TAU),rr=r.range(35,98),sx=x+Math.cos(a)*rr;
     E.emit({x:sx,y:GY-r.range(4,82),vx:-q.dir*r.range(22,70),
      vy:r.range(-12,15),gx:-q.dir*r.range(10,24),gy:-8,drag:.62,
      life:r.range(.38,.78),s0:r.range(3,7),s1:.7,shape:'mist',
      c:COL.mist,c2:'#effffb',a:.72,add:true,tag:TAG});
    }
   }
   if(t>=TH-.02&&t<=END){
    if(E.once(st,'mist-hit')){
     E.burst(E.rng(st.seed^0x570202),x,GY-23,S.miss?12:32,{
      speed:[20,90],ang:[0,TAU],size:[5,12],life:[.48,.86],gy:-12,drag:.58,
      shape:'mist',c:COL.mist,c2:'#effffb',a:.72,add:true,tag:TAG});
     for(let side of [-1,1])E.burst(E.rng(st.seed+0x570203+side),x+side*34,GY-5,10,{
      speed:[12,58],ang:[-Math.PI*.96,-Math.PI*.04],size:[2,4.5],
      life:[.4,.74],gy:68,drag:.48,shape:'orb',c:COL.mist,c2:'#f2fffb',
      a:.88,add:true,tag:TAG});
    }
    [[0,.44,1],[.16,.48,.72],[.34,.52,.5]].forEach((z,i)=>{
     const p=ph(t,TH+z[0],TH+z[0]+z[1]),a=(1-ph(t,TH+z[0]+.2,TH+z[0]+z[1]+.24));
     if(p<=0||a<=0)return;
     const rr=(8+86*eo(p))*z[2];
     wave(g,x,GY-2,rr,COL.mist,a*.57,1.8,T,st.seed+50+i,.23);
     blob(g,x,GY-12,18+14*eo(p),7,COL.mist,a*.24,T,st.seed+60+i,'#edfffb',.45);
    });
    const after=1-ph(t,TH+.34,END);
    for(let i=0;i<8;i++){
     const a=i*TAU/8-T*2.2,rr=16+Math.min(64,(t-TH)*78);
     blob(g,x+Math.cos(a)*rr,GY-8+Math.sin(a)*rr*.25,7,4,COL.mist,after*.25,T,
      st.seed+90+i,'#f3fffc',.4);
    }
    E.glow(g,x,GY-9,20,COL.mist,after*.17,'#eafff9');
   }
  }

  /* Nét lông cánh dạng lá dài, vẽ trực tiếp bằng đường cong Canvas. */
  function feather(g,x,y,len,ang,w,c,a){
   if(len<2||a<=.01)return;
   g.save();g.translate(x,y);g.rotate(ang);g.globalAlpha=clamp(a,0,1);
   const gr=g.createLinearGradient(0,0,len,0);
   gr.addColorStop(0,'rgba(90,61,151,0)');gr.addColorStop(.52,c);
   gr.addColorStop(1,'rgba(244,237,255,.88)');
   g.fillStyle=gr;g.beginPath();g.moveTo(0,0);
   g.bezierCurveTo(len*.25,-w*.64,len*.76,-w*.42,len,0);
   g.bezierCurveTo(len*.74,w*.34,len*.22,w*.45,0,0);g.fill();
   g.strokeStyle=E.rgba('#f4edff',.48*a);g.lineWidth=.8;
   g.beginPath();g.moveTo(len*.06,0);g.quadraticCurveTo(len*.56,-w*.05,len*.94,0);g.stroke();
   g.restore();
  }
  /* 3. Côn Bằng Triển Sĩ: cánh mở rộng, quét ngang, mây và vòng gió. */
  function fxWings(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,r=E.rng(st.seed^0x570300);
   const open=eo(ph(t,.04,TH-.1)),fold=1-ph(t,TH+.28,TH+.68);
   const wingAlpha=t<TH?.54:fold*.5;
   if(t<TH+.68){
    for(const side of [-1,1]){
     const rootX=x+side*13*s,rootY=GY-70*s;
     for(let i=0;i<7;i++){
      const f=i/6,ang=(side>0?-1:Math.PI)+side*(.12+f*.72),
       len=(48+40*Math.sin(f*Math.PI*.72))*s*open,
       sweep=t<TH?0:side*q.dir*ph(t,TH-.08,TH+.16)*16;
      feather(g,rootX+sweep,rootY+i*1.5,len,ang,(12+8*(1-f))*s,COL.wing,
       wingAlpha*(.78-.25*f));
     }
    }
    /* Ba dải gió quét ngang qua đầu và hai bên, không phủ giữa thân. */
    const sweep=eo(ph(t,TH-.25,TH+.12));
    for(let k=0;k<3;k++){
     const y=GY-105+k*24,pts=[];
     for(let j=0;j<16;j++){
      const v=j/15;
      pts.push([x+(v-.5)*(178+36*sweep)*s,
       y+Math.sin(v*TAU+T*3+k)*8*s+q.dir*(v-.5)*28*sweep]);
     }
     ribbon(g,pts,3.3-k*.55,COL.wing,(t<TH?.3:.5)*fold,'#f5efff');
    }
    /* Mây cuộn ở hai mép cánh. */
    for(let side of [-1,1]){
     const bx=x+side*(72+18*open)*s,by=GY-79+Math.sin(T*2+side)*4;
     blob(g,bx,by,27,12,COL.wing,wingAlpha*.32,T,st.seed+110+side,'#f4efff',.38);
     blob(g,bx+side*18,by+5,17,8,'#a98be5',wingAlpha*.26,T,st.seed+120+side,'#f4efff',.44);
    }
   }
   if(t>=TH-.08&&t<=END){
    if(E.once(st,'wing-impact')){
     E.burst(E.rng(st.seed^0x570301),x,GY-47,S.miss?12:34,{
      speed:[60,185],ang:[-Math.PI*.96,-.04],size:[2,5],life:[.4,.82],
      gy:88,drag:.42,shape:'leaf',c:COL.wing,c2:'#f8f3ff',a:.93,
      tag:TAG,vr:[-8,8],fl:8});
     E.burst(E.rng(st.seed^0x570302),x,GY-70,S.miss?6:15,{
      speed:[22,105],ang:[-Math.PI*.98,-.02],size:[1.4,3.2],life:[.38,.7],
      gy:-12,drag:.6,shape:'streak',c:COL.wing,c2:'#ffffff',a:.86,
      add:true,tag:TAG});
    }
    [[0,.46,1],[.17,.52,.72],[.38,.58,.5]].forEach((z,i)=>{
     const p=ph(t,TH+z[0],TH+z[0]+z[1]),a=1-ph(t,TH+z[0]+.21,TH+z[0]+z[1]+.18);
     if(p>0&&a>0)wave(g,x,GY-2,9+92*eo(p)*z[2],COL.wing,a*.6,2,T,st.seed+130+i,.26);
    });
    const after=1-ph(t,TH+.44,END);
    for(let n=E.rate(st,'wing-feathers',ph(t,TH+.02,END),30);n>0;n--)
     E.emit({x:x+Math.sin(T*2+n)*62,y:GY-r.range(12,70),vx:r.range(-48,48),
      vy:-r.range(12,64),gy:72,drag:.42,life:r.range(.45,.82),s0:r.range(2,4),
      s1:.6,shape:'leaf',c:COL.wing,c2:'#f5efff',a:.9,tag:TAG,
      rot:r.range(0,TAU),vr:r.range(-7,7),fl:8});
    groundCore(g,x,GY-3,COL.wing,after*.17,34*s);
   }
  }

  /* 4. Vũ Xà Triển: thân gió xoắn quanh mục tiêu, đầu ngẩng rồi bung thành lốc. */
  function snakeHead(g,x,y,dir,a){
   if(a<=.01)return;
   polygon(g,[[x-dir*13,y],[x-dir*4,y-9],[x+dir*10,y-7],
    [x+dir*18,y],[x+dir*7,y+7],[x-dir*4,y+5]],'rgba(49,157,119,.95)',
    '#dcfff0',a);
   E.glow(g,x+dir*3,y-3,13,COL.wind,a*.34,'#eafff3');
   g.save();g.globalAlpha=a;g.fillStyle='#102d2b';
   g.beginPath();g.arc(x+dir*8,y-3,1.5,0,TAU);g.fill();g.restore();
  }
  function fxSnake(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale;
   const coil=1-.57*eo(ph(t,.08,TH+.02)),fade=t<TH?1:1-ph(t,TH+.45,TH+.94);
   if(t<TH+.6&&fade>.01){
    for(let pass=0;pass<2;pass++){
     const pts=[],n=62;
     for(let i=0;i<n;i++){
      const v=i/(n-1),ang=v*TAU*1.75+T*(2.1+pass*.26)+pass*1.1,
       rad=(63-26*v)*coil*s;
      pts.push([x+Math.cos(ang)*rad,
       GY-41+Math.sin(ang)*24*s+v*37*s]);
     }
     ribbon(g,pts,pass?2.2:7.2,pass?'#eafff3':COL.wind,fade*(pass?.74:.7),
      pass?'#effff5':'#45b986');
    }
    const lift=eo(ph(t,.18,TH-.07));
    const hx=x+q.dir*(43+5*Math.sin(T*3))*s,hy=GY-58-34*lift*s;
    snakeHead(g,hx,hy,q.dir,fade);
    /* Dải thân sáng chuyển động, kèm sương gió rất nhẹ. */
    for(let side of [-1,1])blob(g,x+side*33*s,GY-14,17,7,COL.wind,
     fade*.19,T,st.seed+200+side,'#edfff3',.46);
   }
   if(t>=TH-.02&&t<=END){
    if(E.once(st,'snake-burst')){
     E.burst(E.rng(st.seed^0x570401),x,GY-30,S.miss?12:42,{
      speed:[42,150],ang:[-Math.PI*.98,-.02],size:[2,4.8],life:[.42,.82],
      gy:84,drag:.4,shape:'leaf',c:COL.wind,c2:'#eafff3',a:.95,
      tag:TAG,vr:[-8,8],fl:9});
     E.burst(E.rng(st.seed^0x570402),x,GY-12,S.miss?7:18,{
      speed:[25,120],ang:[0,TAU],size:[1.5,3.4],life:[.38,.72],
      gy:-9,drag:.46,shape:'streak',c:COL.wind,c2:'#ffffff',a:.9,
      add:true,tag:TAG});
    }
    [[0,.46,1],[.2,.55,.72],[.42,.62,.5]].forEach((z,i)=>{
     const p=ph(t,TH+z[0],TH+z[0]+z[1]),a=1-ph(t,TH+z[0]+.2,TH+z[0]+z[1]+.18);
     if(p>0&&a>0)wave(g,x,GY-2,10+98*eo(p)*z[2],COL.wind,a*.62,2,T,st.seed+220+i,.23);
    });
    const after=1-ph(t,TH+.5,END);
    /* Lốc dư âm: các dải hở xoay ở hai bên, nhân vật vẫn lộ rõ. */
    for(let side of [-1,1]){
     const pts=[];
     for(let j=0;j<22;j++){
      const v=j/21,an=T*4+v*TAU*1.1+side,
       rad=(8+26*v)*s;
      pts.push([x+side*(25+13*v)*s+Math.cos(an)*rad,
       GY-8-v*52+Math.sin(an)*rad*.3]);
     }
     ribbon(g,pts,3,COL.wind,after*.42,'#effff5');
    }
    groundCore(g,x,GY-3,COL.wind,after*.16,32*s);
   }
  }

  /* 5. Thiên Lôi Giáng: sét dày từ trời, nhánh điện trên đất và sóng nổ. */
  function fxLightning(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,r=E.rng(st.seed^0x570501);
   const cloud=ph(t,.02,.34)*(1-ph(t,TH+.3,TH+.72));
   if(cloud>0){
    for(let i=0;i<7;i++){
     const bx=x+(i-3)*19,by=29+(i%2)*7;
     blob(g,bx,by,19,10,'#827932',cloud*.26,T,st.seed+250+i,'#b9a94b',.3);
    }
    E.glow(g,x,30,34,COL.bolt,cloud*.18,'#fff8ca');
   }
   /* Tia dẫn trước đòn chính; không dùng màn lóe toàn khung. */
   if(t>=TH-.09&&t<TH){
    const lead=ph(t,TH-.09,TH);
    const pts=E.jag(E.rng(st.seed^0x570502),x-r.range(-5,5),30,x,GY-5,13,13);
    bolt(g,pts,COL.bolt,4,lead*.8,'#fffbd5');
   }
   const pulses=[TH,TH+.22,TH+.48];
   pulses.forEach((at,i)=>{
    const d=t-at;if(d<-.015||d>.2)return;
    const k=1-ph(t,at+.06,at+.2),xx=x+(i===1?-18:i===2?17:0)*s;
    const seed=st.seed+0x570510+i*43+Math.floor(t*22);
    const pts=E.jag(E.rng(seed),xx+r.range(-8,8),17,xx,GY-3,18,17);
     bolt(g,pts,COL.bolt,(i===0?5.2:3.8)*s,k*(i===0?.84:.62),'#fffbd4');
    /* Nhánh chia ra gần mặt đất, để tia chính vẫn nhìn rõ. */
    const branchR=E.rng(seed^0x27);
    for(let b=0;b<3;b++){
     const idx=5+b*4,p=pts[Math.min(pts.length-2,idx)],side=b%2?-1:1,
      ex=p[0]+side*branchR.range(20,48)*s,ey=Math.min(GY+1,p[1]+branchR.range(16,34));
     bolt(g,E.jag(branchR,p[0],p[1],ex,ey,6,6),COL.bolt,2.2,k*.75,'#fffbd4');
    }
    wave(g,xx,GY,6+60*eo(ph(t,at,at+.34))*s,COL.bolt,
     (1-ph(t,at+.13,at+.37))*.72,1.7,T,st.seed+0x570520+i,.25);
    if(i===0)groundCore(g,xx,GY-3,COL.bolt,k*.33,38*s);
    if(i===0&&E.once(st,'lightning-hit')){
     E.burst(E.rng(st.seed^0x570503),xx,GY-7,S.miss?12:36,{
      speed:[36,156],ang:[-Math.PI*.98,-.02],size:[1.5,3.8],life:[.34,.72],
      gy:180,drag:.5,shape:'spark',c:COL.bolt,c2:'#fffbd4',a:.98,
      add:true,tag:TAG,vr:[-7,7],floor:GY+3,bounce:.12});
    }
   });
   if(t>=TH&&t<=END){
    const after=1-ph(t,TH+.38,END);
    for(let side of [-1,1]){
     const pts=E.jag(E.rng(st.seed+0x570540+side),x,GY+2,
      x+side*(25+64*ph(t,TH,TH+.55))*s,GY+3+side*3,9,3);
     bolt(g,pts,COL.bolt,1.7,after*.48,'#fff6bf');
    }
    for(let n=E.rate(st,'lightning-embers',ph(t,TH,END),25);n>0;n--)
     E.emit({x:x+r.range(-60,60),y:GY-r.range(0,16),vx:r.range(-48,48),
      vy:-r.range(24,90),gy:86,drag:.38,life:r.range(.32,.7),
      s0:r.range(1.2,2.8),s1:.4,shape:'spark',c:COL.bolt,c2:'#fffbd4',
      a:.95,add:true,tag:TAG});
    groundCore(g,x,GY-2,COL.bolt,after*.13,31*s);
   }
  }

  /* 6. Nguyệt Thực Nuốt: bóng che mặt trăng, vòng tối xoáy co vào đất. */
  function fxEclipse(g,T,t,S,st){
   const q=aim(S),x=q.x,s=q.scale,r=E.rng(st.seed^0x570600);
   const mx=clamp(x-q.dir*76,34,326),my=55,R=32*s;
   if(t<TH+.28){
    const appear=eo(ph(t,.03,.22)),cover=ph(t,.16,TH+.02),
     moonFade=1-ph(t,TH+.25,TH+.62);
    E.glow(g,mx,my,R*1.55,COL.moon,appear*.2,'#e9edff');
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=appear*.9;
    const moon=g.createRadialGradient(mx-R*.28,my-R*.3,1,mx,my,R);
    moon.addColorStop(0,'#f4f5ff');moon.addColorStop(.68,'#c4cdf8');moon.addColorStop(1,'#8798dc');
    g.fillStyle=moon;g.beginPath();g.arc(mx,my,R,0,TAU);g.fill();
    /* Bóng trôi qua dần từ trái sang phải, vẫn chừa vành trăng mảnh. */
    const sx=mx+lerp(-R*1.65,0,cover);
    g.globalCompositeOperation='source-over';g.globalAlpha=appear*.96;
    const shadow=g.createRadialGradient(sx-R*.2,my-R*.3,1,sx,my,R*1.04);
    shadow.addColorStop(0,'#080a19');shadow.addColorStop(.82,'#101326');shadow.addColorStop(1,'#232846');
    g.fillStyle=shadow;g.beginPath();g.arc(sx,my,R*.98,0,TAU);g.fill();
    g.globalCompositeOperation='lighter';g.globalAlpha=appear*moonFade*.75;
    g.strokeStyle=E.rgba(COL.moon,.85);g.lineWidth=1.25;
    g.beginPath();g.arc(mx,my,R+2,-.95,Math.PI*.92);g.stroke();
    g.restore();
    for(let i=0;i<3;i++){
     const p=ph(t,.18+i*.09,TH+.08),a=(1-ph(t,TH+.08,TH+.42))*.68;
     if(p<=0||a<=0)continue;
     const an=T*2.4+i*TAU/3,rr=lerp(74,18,p);
     blob(g,x+Math.cos(an)*rr,GY-10+Math.sin(an)*12,8,5,COL.moon,a*.38,T,
      st.seed+330+i,'#eff1ff',.38);
    }
   }
   if(t>=TH-.02&&t<=END){
    const p=eo(ph(t,TH,TH+.72)),fade=1-ph(t,TH+.36,END);
    if(E.once(st,'eclipse-hit')){
     E.burst(E.rng(st.seed^0x570601),x,GY-5,S.miss?8:26,{
      speed:[18,82],ang:[0,TAU],size:[2.2,5.2],life:[.52,.94],
      gy:-4,drag:.58,shape:'mist',c:'#171a35',c2:COL.moon,a:.74,
      tag:TAG});
     E.burst(E.rng(st.seed^0x570602),x,GY-3,S.miss?8:20,{
      speed:[24,92],ang:[-Math.PI*.98,-.02],size:[1.4,3.2],life:[.4,.78],
      gy:82,drag:.48,shape:'spark',c:COL.moon,c2:'#eff1ff',
      a:.9,add:true,tag:TAG});
    }
    /* Các vòng xoáy hút vào tâm, dẹt sát đất; tâm tối nhỏ, không che thú. */
    for(let ring=0;ring<3;ring++){
     const rr=(82-ring*17)*(1-.48*p),pts=[];
     for(let j=0;j<26;j++){
      const v=j/25,an=T*(2.2+ring*.38)+v*TAU*.9+ring*2.05,
       rad=rr*(.32+.68*v);
      pts.push([x+Math.cos(an)*rad,GY-7+Math.sin(an)*rad*.19]);
     }
     ribbon(g,pts,ring===0?4:2.4,COL.moon,fade*(ring===0?.5:.32),
      ring===1?'#dce2ff':'#727fac');
    }
    wave(g,x,GY,8+94*p*s,COL.moon,fade*.52,1.8,T,st.seed+350,.23);
    wave(g,x,GY,5+56*p*s,'#6675af',fade*.27,1.2,T,st.seed+351,.22);
    blob(g,x,GY-5,15+4*p,6,'#080a18',fade*.55,T,st.seed+352,'#11162d',.2);
    for(let side of [-1,1])E.glow(g,x+side*29,GY-6,15,COL.moon,fade*.26,'#edf0ff');
    for(let n=E.rate(st,'eclipse-dust',ph(t,TH,END),22);n>0;n--){
     const a=rngAngle(st,n,T);
     E.emit({x:x+Math.cos(a)*rRadius(st,n,T),y:GY-r.range(0,22),
      vx:-q.dir*r.range(8,34),vy:-r.range(14,54),gy:-5,drag:.46,
      life:r.range(.38,.8),s0:r.range(1.1,2.6),s1:.4,
      shape:n%3?'orb':'spark',c:COL.moon,c2:'#eef1ff',a:.9,
      add:true,tag:TAG});
    }
   }
  }
  function rngAngle(st,n,T){return E.rng(st.seed+Math.floor(T*17)*73+n*19)()*TAU}
  function rRadius(st,n,T){return 18+E.rng(st.seed+Math.floor(T*17)*37+n*23)()*62}

  const FX={
   'bang-son-ap-dinh':fxIce,
   'suong-nuot':fxMist,
   'con-bang-trien-si':fxWings,
   'vu-xa-trien':fxSnake,
   'thien-loi-giang':fxLightning,
   'nguyet-thuc-nuot':fxEclipse
  };
  API.drawAttack=function(g,T,S){
   /* Giữ thứ tự và đối số gốc, không sửa dữ liệu của game. */
   const result=prevA(g,T,S);
   try{
    if(!S)return result;
    const run=FX[S.kyNang];
    if(!run)return result;
    const u=clamp(Number(S.u)||0,0,1),t=u*1.9;
    if(t<0||t>END+.12)return result;
    E.setSpeed(window.BSPD||1);
    const st=E.seed('bossfx:'+S.kyNang+':'+(Number(S.i)||0),u);
    run(g,T,t,S,st);
    E.draw(g,TAG);
   }catch(e){
    window.__fxBossErr='57: '+(e&&e.message||e);
    /* Hiệu ứng gốc đã vẽ ở đầu hàm nên lỗi phần bổ sung không làm dừng trận. */
   }
   return result;
  };
 }
 boot();
})();
