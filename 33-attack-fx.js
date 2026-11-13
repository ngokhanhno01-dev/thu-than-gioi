/* ===== 33-attack-fx.js — 17 kiểu đòn đánh riêng cho 17 vùng (bước 2) =====
   Chỉ thay phần HÌNH ẢNH của đòn đánh/va chạm: không đụng chỉ số, công thức hay diễn biến trận.
   Cách làm: bọc TTGCombatFX.drawAttack / drawImpact của 31-combat-fx.js. Sprite vẫn do 31 chọn khung,
   file này tô màu theo vùng, đổi quỹ đạo, phóng to, thêm hạt/vệt riêng cho từng vùng.
   Lỗi bất kỳ → tự quay về hiệu ứng gốc của 31, không làm đứng trận. */
(()=>{
'use strict';
let tries=0;
function boot(){
 const API=window.TTGCombatFX;
 if(!API||!API.zones||!API.drawAttack||!API.drawImpact){if(tries++<200)setTimeout(boot,50);return}
 if(API.__atk17)return;
 API.__atk17=1;
 const orig={drawAttack:API.drawAttack,drawImpact:API.drawImpact};
 const zones=API.zones;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const rnd=seed=>{let s=(seed|0)||1;return()=>{s=(Math.imul(s,1664525)+1013904223)|0;return((s>>>0)%10007)/10007}};
 const rgb=h=>{const n=parseInt(String(h).slice(1),16);return[n>>16&255,n>>8&255,n&255]};
 const lighten=(h,t)=>'rgb('+rgb(h).map(v=>Math.round(v+(255-v)*t)).join(',')+')';
 const zi=s=>Math.max(0,Math.min(zones.length-1,Number(s)||0));

 /* ---------- Cấu hình 17 vùng ----------
  r = đòn đánh xa, m = đòn cận chiến, i = va chạm. Vùng nào không có r/m thì dùng mặc định theo màu vùng.
  r: path(quỹ đạo) sc(cỡ) spin(số rad xoay cả chặng bay) trail{k,n,gap,s} chg{k,n} tint glow add fan spread ghost
  m: sc rot0 sweep(xoay thêm) grow[đầu,cuối] copies[{ox,oy,r,d,sc}] part{k,n,R,grav,inward} tint glow pulse
  i: k(loại hạt) n R ring pillar sc grav */
 const SZR=1.3,SZM=1.28,SZI=1.3;      /* phóng to đòn xa / đòn gần / va chạm so với bản gốc */
 /* quầng sáng màu vùng sau viên đạn / nhát chém: để nhìn là biết vùng nào kể cả khi ảnh gốc giống nhau */
 function halo(g,x,y,r,col,a){
  if(a<=.01)return;
  g.save();g.globalAlpha=clamp(a,0,1);g.globalCompositeOperation='lighter';
  const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,col);gr.addColorStop(.45,col);gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
 }
 /* Hướng ĐẦU của từng ảnh đòn xa (rad, 0 = đầu quay sang phải, y hướng xuống). Ảnh vẽ đầu hướng góc dưới-trái thì xoay lại cho đầu hướng tới đối thủ. */
 const FACE={0:3.1416,2:-2.88,4:3.1416,6:2.40,9:0,11:0,13:3.1416,14:0,15:0,16:0};   /* hướng đầu của ảnh mới: tia băng/sấm/sao tím có đầu quay TRÁI */
 /* độ nhuộm màu vùng cho từng ảnh (0 = giữ màu gốc của ảnh; chỉ nhuộm ảnh lệch màu vùng) */
 const ZT={0:0,1:.35,2:0,3:.6,4:0,5:0,6:0,7:.75,8:.8,9:0,10:0,11:0,12:.55,13:0,14:0,15:0,16:0};   /* ảnh đòn đã đúng màu vùng nên không nhuộm; chỉ nhuộm các chuỗi cận chiến xanh/hồng dùng lại */
 const DEF_R={path:'lob',arc:30,sc:1.35,trail:{k:'spark',n:6,gap:.05,s:2},chg:{k:'spark',n:6},tint:.5};
 const DEF_M={sc:1.3,sweep:.6,part:{k:'spark',n:8,R:46},tint:.5};
 const PROF=[
 /* 0 Tuyết Nguyên — băng lao vòng cung cao, xoay, rơi tuyết */
 {r:{path:'lob',arc:30,sc:1.3,trail:{k:'snow',n:9,gap:.045,s:2.4,grav:1.4},chg:{k:'snow',n:8},tint:0,glow:12},
  i:{k:'snow',n:14,R:58,ring:1,sc:1.45,grav:.4}},
 /* 1 Sương Cốc — vòng sương xoáy tròn quanh mục tiêu */
 {m:{sc:1.45,rot0:0,sweep:5.4,part:{k:'mist',n:8,R:46},tint:.45,glow:10,pulse:1},
  i:{k:'mist',n:8,R:50,sc:1.4}},
 /* 2 Vân Đảo — đạn mây uốn lượn như sóng */
 {r:{path:'wave',amp:16,freq:2.5,sc:1.4,trail:{k:'cloud',n:8,gap:.05,s:2.4},chg:{k:'cloud',n:7},tint:.45,glow:10},
  i:{k:'cloud',n:9,R:52,ring:1,sc:1.4}},
 /* 3 Phong Nguyên — lưỡi gió chém quét từ dưới lên, lá bay */
 {m:{sc:1.5,rot0:-.55,sweep:1.9,part:{k:'leaf',n:11,R:58,grav:.3},tint:.5,glow:10},
  i:{k:'leaf',n:12,R:62,sc:1.45,grav:.3}},
 /* 4 Lôi Vực — tia chớp bay giật zíc-zắc cực nhanh */
 {r:{path:'zig',amp:15,steps:14,sc:1.45,trail:{k:'bolt',n:7,gap:.035,s:2.2},chg:{k:'bolt',n:6},tint:.35,glow:14,add:.35},
  i:{k:'bolt',n:10,R:60,ring:1,sc:1.5}},
 /* 5 Nguyệt Cung — hai nhát trăng khuyết chém chéo, nhát sau lệch nhịp */
 {m:{sc:1.3,rot0:-.9,sweep:.7,copies:[{r:0},{r:.95,d:.22,sc:.9,ox:-4,oy:6}],part:{k:'spark',n:9,R:48},tint:.5,glow:11},
  i:{k:'spark',n:10,R:56,ring:1,sc:1.4}},
 /* 6 Dương Sơn — thiên thạch lửa từ trên giáng xuống, to */
 {r:{path:'drop',h:125,back:80,sc:1.7,trail:{k:'ember',n:11,gap:.04,s:2.6,grav:1.2},chg:{k:'ember',n:8},tint:.3,glow:14},
  i:{k:'ember',n:16,R:66,ring:1,sc:1.75,grav:.6}},
 /* 7 Huyền Uyên — chém chữ X, bụi rune tím */
 {m:{sc:1.25,rot0:0,sweep:.3,copies:[{r:.75},{r:-.75,d:.08}],part:{k:'rune',n:9,R:46},tint:.5,glow:12},
  i:{k:'rune',n:10,R:54,sc:1.45}},
 /* 8 Kim Khoáng — ba vuốt kim loại chém song song, tóe tia lửa */
 {m:{sc:1.1,rot0:-.25,sweep:.4,copies:[{oy:-18,ox:6},{oy:0,d:.08},{oy:18,ox:-6,d:.16}],part:{k:'spark',n:14,R:64},tint:.55,glow:10},
  i:{k:'spark',n:14,R:64,sc:1.35}},
 /* 9 Ngọc Động — đạn ngọc xoắn ốc, vệ tinh xanh bay quanh */
 {r:{path:'helix',amp:14,turns:3,sc:1.25,trail:{k:'spark',n:9,gap:.04,s:2.2},chg:{k:'spark',n:7},tint:.5,glow:12},
  i:{k:'spark',n:12,R:56,ring:1,sc:1.4}},
 /* 10 Thanh Lâm — chém hất lên, lá rơi */
 {m:{sc:1.35,rot0:.6,sweep:-1.3,part:{k:'leaf',n:12,R:50,grav:.9},tint:.5,glow:9},
  i:{k:'leaf',n:12,R:60,sc:1.45,grav:.8}},
 /* 11 Xích Hỏa Địa — cầu lửa nặng nảy 2 lần, tàn lửa lớn */
 {r:{path:'lob',arc:20,sc:1.5,trail:{k:'ember',n:12,gap:.035,s:3,grav:1},chg:{k:'ember',n:9},tint:0,glow:14},
  i:{k:'ember',n:18,R:70,ring:1,sc:1.8,grav:.5}},
 /* 12 Hắc Ám Lâm — xoáy tối co lại vào tâm (hút) */
 {m:{sc:1,grow:[1.75,.85],rot0:0,sweep:-5,part:{k:'mist',n:9,R:56,inward:1},tint:.55,glow:12,pulse:1},
  i:{k:'mist',n:9,R:54,sc:1.45}},
 /* 13 Tử Tinh Hải — sao tím bay đường chữ S, để lại bóng mờ */
 {r:{path:'S',rise:22,amp:22,sc:1.4,ghost:3,trail:{k:'shard',n:8,gap:.045,s:1.8},chg:{k:'shard',n:7},tint:0,glow:13},
  i:{k:'shard',n:12,R:60,ring:1,sc:1.5}},
 /* 14 Thiên Không — 3 mũi phóng hội tụ về mục tiêu, vệt gió */
 {r:{path:'none',fan:[-1,0,1],spread:22,sc:1.05,trail:{k:'line',n:6,gap:.05,s:2.2},chg:{k:'line',n:6},tint:.45,glow:10},
  i:{k:'line',n:10,R:64,ring:1,sc:1.4}},
 /* 15 Linh Hoa Viên — chém cánh hoa, hoa bay tản */
 {r:{path:'lob',arc:26,sc:1.4,trail:{k:'petal',n:10,gap:.045,s:2.4,grav:.8},chg:{k:'petal',n:8},tint:0,glow:12},
  i:{k:'petal',n:14,R:62,sc:1.45,grav:.3}},
 /* 16 Thần Điện — trụ sáng thần giáng thẳng từ trên xuống */
 {r:{path:'down',h:140,sc:1.55,trail:{k:'spark',n:10,gap:.04,s:2.2},chg:{k:'spark',n:8},tint:.3,glow:14,add:.3,pillar:1},
  i:{k:'spark',n:12,R:60,ring:1,pillar:1,sc:1.5}}
 ];

 /* ---------- Tô màu sprite (cache) ---------- */
 const TC=new Map();
 function tinted(img,sx,sy,sw,sh,col,amt,idx){
  const key=idx+'|'+col+'|'+amt+'|'+sx+','+sy+','+sw+','+sh;
  if(TC.has(key))return TC.get(key);
  if(TC.size>700)TC.clear();
  let c=null;
  try{
   c=document.createElement('canvas');c.width=sw;c.height=sh;
   const x=c.getContext('2d');x.imageSmoothingEnabled=false;
   x.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
   /* đổi hẳn sắc độ sang màu vùng nhưng giữ sáng/tối của ảnh, rồi trả lại viền trong suốt của ảnh gốc */
   x.globalCompositeOperation='color';x.globalAlpha=amt;x.fillStyle=col;x.fillRect(0,0,sw,sh);
   x.globalCompositeOperation='destination-in';x.globalAlpha=1;x.drawImage(img,sx,sy,sw,sh,0,0,sw,sh);
   x.globalCompositeOperation='lighter';x.globalAlpha=.3;x.drawImage(c,0,0);
  }catch(_){c=null}
  TC.set(key,c);return c;
 }
 /* Bọc ctx: chặn đúng lần drawImage đầu (sprite chính) để tô màu/phóng to/xoay; mọi lệnh khác chuyển thẳng cho ctx thật. */
 function drawMain(g,o,a){
  const img=a[0],sx=a[1],sy=a[2],sw=a[3],sh=a[4],dx=a[5],dy=a[6],dw=a[7],dh=a[8];
  const amt=o.tint==null?0:o.tint,src=amt>.04?(tinted(img,sx,sy,sw,sh,o.col,amt,o.idx)||img):img,tc=src!==img;
  const put=()=>tc?g.drawImage(src,0,0,sw,sh,dx,dy,dw,dh):g.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
  g.save();
  if(o.spin)g.rotate(o.spin);
  if(o.sc&&o.sc!==1)g.scale(o.sc,o.sc);
  if(o.alpha!=null)g.globalAlpha=clamp(g.globalAlpha*o.alpha,0,1);
  g.shadowColor=o.col;g.shadowBlur=o.glow==null?8:o.glow;
  put();
  if(o.add){g.globalCompositeOperation='lighter';g.globalAlpha=clamp(g.globalAlpha*o.add,0,1);g.shadowBlur=0;put()}
  g.restore();
 }
 function hook(g,o){
  let n=0;
  return new Proxy(g,{
   get(t,k){
    if(k==='drawImage')return function(){const a=arguments;if(++n===1&&a.length===9)return drawMain(t,o,a);return t.drawImage.apply(t,a)};
    const v=t[k];return typeof v==='function'?v.bind(t):v;
   },
   set(t,k,v){t[k]=v;return true}
  });
 }
 function callOrig(g,T,S,u,o,dx,dy){
  const S2=Object.assign({},S,{u});
  g.save();
  if(dx||dy)g.translate(dx||0,dy||0);
  try{return orig.drawAttack(hook(g,o),T,S2)}finally{g.restore()}
 }

 /* ---------- Hạt (pixel) ---------- */
 function part(g,k,x,y,s,col,col2,rot,a){
  g.save();g.globalAlpha=clamp(a==null?1:a,0,1);g.translate(x,y);if(rot)g.rotate(rot);
  switch(k){
   case'snow':g.fillStyle=col2;g.fillRect(-s,-.5,s*2+1,1);g.fillRect(-.5,-s,1,s*2+1);g.fillStyle=col;g.fillRect(-1,-1,2,2);break;
   case'ember':case'spark':g.fillStyle=col;g.fillRect(-s,-s,s*2,s*2);g.fillStyle=col2;g.fillRect(-s*.5,-s*.5,s,s);break;
   case'leaf':g.fillStyle=col;g.beginPath();g.ellipse(0,0,s*2,s*.9,0,0,7);g.fill();g.fillStyle=col2;g.fillRect(-s,-.5,s*2,1);break;
   case'petal':g.fillStyle=col;g.beginPath();g.ellipse(0,0,s*1.8,s*1.1,0,0,7);g.fill();g.fillStyle=col2;g.beginPath();g.ellipse(-s*.3,-s*.2,s*.8,s*.4,0,0,7);g.fill();break;
   case'cloud':case'mist':g.fillStyle=col;g.beginPath();g.arc(0,0,s*1.6,0,7);g.fill();g.globalAlpha*=.6;g.fillStyle=col2;g.beginPath();g.arc(-s*.5,-s*.4,s,0,7);g.fill();break;
   case'bolt':g.lineJoin='round';g.strokeStyle=col2;g.lineWidth=2.2;g.beginPath();g.moveTo(-s*2,-s);g.lineTo(-s*.5,0);g.lineTo(-s*1.2,s*.5);g.lineTo(s*2,s);g.stroke();g.strokeStyle=col;g.lineWidth=1;g.stroke();break;
   case'shard':g.fillStyle=col;g.beginPath();g.moveTo(0,-s*2);g.lineTo(s,0);g.lineTo(0,s*2);g.lineTo(-s,0);g.closePath();g.fill();g.fillStyle=col2;g.fillRect(-.5,-s,1,s*2);break;
   case'rune':g.fillStyle=col;g.fillRect(-s,-.5,s*2+1,1);g.fillRect(-.5,-s,1,s*2+1);g.fillStyle=col2;g.fillRect(-s,-s,2,2);g.fillRect(s-1,s-1,2,2);break;
   case'line':g.fillStyle=col2;g.fillRect(-s*3,-.5,s*6,1);g.fillStyle=col;g.fillRect(-s*2,.5,s*4,1);break;
   default:g.fillStyle=col;g.fillRect(-s,-s,s*2,s*2);
  }
  g.restore();
 }
 function pillar(g,x,y,a,col){
  const gd=g.createLinearGradient(x,y-140,x,y+20);
  gd.addColorStop(0,'rgba(255,255,255,0)');gd.addColorStop(.6,col);gd.addColorStop(1,'rgba(255,255,255,0)');
  g.save();g.globalAlpha=clamp(a,0,1)*.55;g.fillStyle=gd;g.fillRect(x-7,y-140,14,160);g.globalAlpha*=.6;g.fillRect(x-14,y-140,28,160);g.restore();
 }

 /* ---------- Quỹ đạo đòn đánh xa (độ lệch cộng thêm vào đường bay gốc) ---------- */
 function pathOff(c,f,sx,tx,dir,seed){
  const env=Math.sin(f*Math.PI);
  switch(c.path){
   case'lob':return[0,-env*c.arc];
   case'wave':return[0,Math.sin(f*6.283*c.freq)*c.amp*env];
   case'zig':{const k=Math.floor(f*c.steps),r=rnd(seed*13+k)();return[0,(r-.5)*2*c.amp*env]}
   case'drop':return[(1-f)*((tx-sx)-dir*c.back),-(1-f)*c.h];
   case'down':return[(tx-sx)*(1-f),-(1-f)*c.h];
   case'helix':return[0,Math.sin(f*6.283*c.turns)*c.amp*(.35+.65*env)];
   case'S':return[0,-env*c.rise+Math.sin(f*6.283)*c.amp];
   case'bounce':return[0,-Math.abs(Math.sin(f*Math.PI*c.n))*c.h*(1-f*.4)];
   default:return[0,0];
  }
 }

 function atkRanged(g,T,S,idx,z,c){
  const u=S.u||0,pa=!!S.pa,dir=pa?1:-1,sx=pa?112:248,tx=pa?255:105,ty=148,col=z.color,col2=lighten(col,.6),big=S.cr?1.18:1;
  const base={col,idx,tint:ZT[idx],glow:c.glow,add:c.add},head=FACE[idx]||0;
  if(u<.18){
   if(u<=.035)return orig.drawAttack(g,T,S);
   const ch=clamp((u-.035)/.145,0,1),r=rnd(S.i*31+idx),n=c.chg?c.chg.n:6,k=c.chg?c.chg.k:'spark';
   g.save();
   for(let j=0;j<n;j++){const a=r()*6.283+T*3,d=(1-ch)*(34+r()*18)+6;part(g,k,sx+Math.cos(a)*d,ty+Math.sin(a)*d*.7,1.5+ch*1.5,col,col2,0,.35+ch*.6)}
   g.restore();
   halo(g,sx,ty,(26+ch*34)*(c.sc||1.3),col,.3+ch*.4);
   return callOrig(g,T,S,u,Object.assign({},base,{sc:Math.min(2.3,(c.sc||1.3)*SZR)*(.95+ch*.45),spin:-head+(dir>0?-T*.7:T*.7)}),0,0);
  }
  if(u<.43){
   const f=clamp((u-.18)/.25,0,1);
   const pos=ft=>{const o=pathOff(c,ft,sx,tx,dir,S.i||0);return[sx+(tx-sx)*ft+o[0],ty-Math.sin(ft*Math.PI)*18+o[1]]};
   const off=pathOff(c,f,sx,tx,dir,S.i||0);
   /* góc bay tại f (đã tính phía bị lật khi đối thủ bắn sang trái) -> xoay ảnh cho ĐẦU hướng về phía trước */
   const ang=ft=>{const a=pos(Math.max(0,ft-.08)),b=pos(Math.min(1,ft+.08));return Math.atan2(b[1]-a[1],(b[0]-a[0])*dir)};
   /* vệt hạt phía sau */
   if(c.trail){const t=c.trail,r=rnd((S.i||0)*17+idx);g.save();
    for(let i=1;i<=t.n;i++){const ft=f-i*t.gap;if(ft<0)break;const p=pos(ft),k=i/t.n;
     part(g,t.k,p[0]+(r()-.5)*8,p[1]+(r()-.5)*8+(t.grav?i*t.grav:0),Math.max(1,(t.s||2)*(1.25-k*.7)),col,col2,r()*6.28,(1-k)*.9)}
    g.restore()}
   /* bóng mờ phía sau */
   if(c.ghost){for(let k=1;k<=c.ghost;k++){const f2=f-k*.055;if(f2<0)break;const o2=pathOff(c,f2,sx,tx,dir,S.i||0);
    callOrig(g,T,S,.18+f2*.25,Object.assign({},base,{sc:Math.min(2.3,(c.sc||1.3)*SZR)*big*.9,spin:ang(f2)-head+f2*(c.spin||0),alpha:.3/k}),o2[0],o2[1])}}
   /* thân đạn (có thể chia nhiều mũi) */
   const fan=c.fan||[0];let ret=null;
   const hp=pos(f);halo(g,hp[0],hp[1],46*(c.sc||1.3),col,.55);
   fan.forEach(k=>{
    const o={...base,sc:Math.min(2.3,(c.sc||1.3)*SZR)*big*(k===0?1.12:1),spin:ang(f)-head+f*(c.spin||0)};
    const r=callOrig(g,T,S,u,o,off[0],off[1]+k*(c.spread||0)*(1-f));
    if(ret===null||k===0)ret=r;
   });
   if(c.pillar&&f>.8)pillar(g,tx,ty,(f-.8)/.2,col2);
   return ret;
  }
  return orig.drawAttack(g,T,S);
 }

 function atkMelee(g,T,S,idx,z,c){
  const u=S.u||0,pa=!!S.pa,dir=pa?1:-1,tx=pa?255:105,ty=148,col=z.color,col2=lighten(col,.6);
  if(u<.23||u>=.6)return orig.drawAttack(g,T,S);
  const f=clamp((u-.23)/.37,0,1),copies=c.copies||[{}];
  let ret=null;
  copies.forEach((k,ci)=>{
   const fc=f-(k.d||0);if(fc<0)return;
   const uc=.23+clamp(fc,0,.9999)*.37;
   let sc=Math.min(2.4,(c.sc||1.3)*SZM)*(k.sc||1)*(S.cr?1.15:1);
   if(c.grow)sc*=c.grow[0]+(c.grow[1]-c.grow[0])*clamp(fc/.8,0,1);
   const spin=(c.rot0||0)+(k.r||0)+(c.sweep||0)*(clamp(fc,0,1)-.5);
   const al=c.pulse?.8+.2*Math.sin(T*18+ci):1;
   if(ci===0)halo(g,tx,ty,(40+fc*26)*sc,col,.5*Math.sin(Math.PI*clamp(fc,0,1))+.15);
   const r=callOrig(g,T,S,uc,{col,idx,tint:ZT[idx],glow:c.glow,add:c.add,sc,spin,alpha:al},(k.ox||0)*dir,k.oy||0);
   if(ret===null)ret=r;
  });
  if(c.part&&f>.28){
   const p=c.part,r=rnd((S.i||0)*53+idx),pf=(f-.28)/.72;
   g.save();
   for(let j=0;j<p.n;j++){
    const a=r()*6.283,k=.35+r()*.65,rr=p.inward?(p.R||50)*(1-pf)*k+4:(p.R||50)*k*(1-(1-pf)*(1-pf));
    part(g,p.k,tx+Math.cos(a)*rr,ty+Math.sin(a)*rr*.75+(p.grav||0)*pf*pf*40,1.5+r()*1.5,col,col2,r()*6.28,1-pf*.7);
   }
   g.restore();
  }
  return ret===null?true:ret;
 }

 /* Đòn đặc biệt (dung nham/Lôi Phạt) vẫn dùng hiệu ứng gốc của 31 */
 const ATK_SPECIAL=/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng/;
 const IMP_SPECIAL=/Khiên hấp thụ|Chắn đòn|hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh|Hút máu|Lôi Phạt|Lôi Kích -|Dung Nham|Thiêu đốt|Xích Diệm/;

 function drawAttackX(g,T,S){
  try{
   const text=S.text||'';
   if(ATK_SPECIAL.test(text))return orig.drawAttack(g,T,S);
   const idx=zi(S.s),z=zones[idx],P=PROF[idx];
   const melee=/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text)||z.mode==='melee';
   return melee?atkMelee(g,T,S,idx,z,P.m||DEF_M):atkRanged(g,T,S,idx,z,P.r||DEF_R);
  }catch(e){if(window.__ATK17_DEBUG)throw e;return orig.drawAttack(g,T,S)}
 }

 function drawImpactX(g,fx,T){
  try{
   const text=fx.text||'';
   if(fx.k==='block'||fx.k==='heal'||fx.k==='stun'||IMP_SPECIAL.test(text))return orig.drawImpact(g,fx,T);
   const idx=zi(fx.s),z=zones[idx],P=PROF[idx],c=P.i||{k:'spark',n:10,R:56,sc:1.3};
   const col=z.color,col2=lighten(col,.6),q=clamp(fx.q||0,0,.9999),tgt=fx.pp?272:90,y=150,miss=fx.k==='miss',crit=fx.k==='crit';
   const o={col,idx,tint:ZT[idx],spin:-(FACE[idx]||0),sc:Math.min(2.3,(c.sc||1.3)*SZI)*(crit?1.2:1)*(miss?.8:1),glow:14};
   let ok;
   g.save();
   if(!miss)halo(g,tgt,y,52*(c.sc||1.3),col,.55*(1-q));
   try{ok=orig.drawImpact(hook(g,o),fx,T)}finally{g.restore()}
   if(ok){
    const n=Math.round((c.n||10)*(crit?1.5:1)*(miss?.35:1)),r=rnd((fx.i||0)*71+idx*7+1),R=c.R||56;
    g.save();
    for(let j=0;j<n;j++){
     const a=r()*6.283,sp=.5+r()*.8,d=(8+q*R)*sp;
     part(g,c.k,tgt+Math.cos(a)*d,y+Math.sin(a)*d*.8+(c.grav||0)*q*q*46,1.5+r()*1.5,col,col2,r()*6.28,(1-q)*.95);
    }
    if(c.ring&&!miss){
     const rr=10+q*R*.9;
     g.globalAlpha=(1-q)*.75;g.strokeStyle=col2;g.lineWidth=2+(1-q)*2;
     g.beginPath();g.ellipse(tgt,y+6,rr,rr*.45,0,0,7);g.stroke();
    }
    g.restore();
    if(c.pillar&&!miss)pillar(g,tgt,y,1-q,col2);
   }
   return ok;
  }catch(e){if(window.__ATK17_DEBUG)throw e;return orig.drawImpact(g,fx,T)}
 }

 API.drawAttack=drawAttackX;
 API.drawImpact=drawImpactX;
 API.attackProfiles=PROF;
}
boot();
})();
