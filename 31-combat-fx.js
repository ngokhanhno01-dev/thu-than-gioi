/* ===== 31-combat-fx.js — Hiệu ứng chiến đấu theo 17 vùng =====
   Tải sprite PNG tại combat-effects/; hiệu ứng trang bị chỉ xuất hiện khi sự kiện thực sự kích hoạt. */
(()=>{
'use strict';
/* Ảnh hiệu ứng đã được cắt sạch nằm trong fx/ (tạo bằng tools/clean_fx.py). Không còn dùng atlas combat-fx-atlas.png. */
const RECTS={};
const seq=(dir,prefix,count)=>({dir,prefix,count,pad:2,start:1});
const one=file=>({file});
const lone=f=>({file:'loose/'+f});                       /* ảnh lẻ trong fx/ */
const fxs=(prefix,count,pad)=>({dir:'loose',prefix,count,pad:pad||2,start:1});   /* chuỗi khung trong fx/ */
/* make(tên, màu, kiểu đánh, ẢNH ĐÒN ĐÁNH, ẢNH BUFF VÙNG, biểu tượng, độ nhuộm ảnh buff vùng)
   - đòn đánh: mỗi vùng 1 ảnh/1 chuỗi ảnh RIÊNG (nhóm 3 cận chiến, nhóm 4 đánh xa)
   - buff vùng: chỉ dùng ảnh nhóm 1 (dome, cầu, sấm sét, nổ lửa, ngọn lửa nền); KHÔNG dùng ảnh bộ trang bị */
const make=(name,color,mode,attack,field,mark,bt)=>({name,color,mode,attack,field,mark,bt:bt||0});
const ZONES=[
 make('Tuyết Nguyên','#9fe4ff','ranged',lone('atk-tuyet-nguyen.png'),lone('bz-khien-vong.png'),'❄'),
 make('Sương Cốc','#a3e1d4','melee',fxs('mel-suong-coc-',11),lone('bz-cau-xanh.png'),'霧',.4),
 make('Vân Đảo','#c9a8ff','ranged',lone('atk-van-dao.png'),lone('bz-dome-tim-nho.png'),'☁'),
 make('Phong Nguyên','#82f0bb','melee',fxs('mel-phong-nguyen-',6),fxs('flame-',9),'➶',.8),
 make('Lôi Vực','#ffe53a','ranged',lone('atk-loi-vuc.png'),lone('bz-set.png'),'ϟ'),
 make('Nguyệt Cung','#a8b8ff','melee',fxs('mel-nguyet-cung-',8),lone('bz-cau-khien.png'),'☾'),
 make('Dương Sơn','#ffa94d','ranged',lone('atk-duong-son.png'),lone('bz-no-lua.png'),'☼'),
 make('Huyền Uyên','#947aff','melee',fxs('mel-huyen-uyen-',4),lone('bz-dome-tim-lua.png'),'◉'),
 make('Kim Khoáng','#e0b038','melee',fxs('mel-kim-khoang-',4),lone('bz-khien-vong.png'),'◇',.75),
 make('Ngọc Động','#18e0b0','ranged',lone('atk-ngoc-dong.png'),lone('bz-cau-xanh.png'),'⬡',.65),
 make('Thanh Lâm','#8be04a','melee',fxs('mel-thanh-lam-',4),lone('bz-linh-hon.png'),'♧'),
 make('Xích Hỏa Địa','#ff5a1e','ranged',lone('atk-xich-hoa.png'),fxs('flame-',9),'♨',.85),
 make('Hắc Ám Lâm','#b0206a','melee',fxs('mel-hac-am-',4),lone('bz-cau-den.png'),'◈'),
 make('Tử Tinh Hải','#b45cff','ranged',lone('atk-tu-tinh.png'),lone('bz-dome-hong.png'),'✧',.5),
 make('Thiên Không','#6ac4ff','ranged',lone('atk-thien-khong.png'),fxs('flame-',9),'⌁',.2),
 make('Linh Hoa Viên','#ff7ac0','ranged',lone('atk-linh-hoa.png'),lone('bz-dome-hong.png'),'✿'),
 make('Thần Điện','#fff0a0','ranged',lone('atk-than-dien.png'),lone('bz-dome-tim-lua.png'),'✥',.6)
];
/* ---- ảnh dùng chung (mỗi loại 1 nguồn, không trộn nhóm) ---- */
const SHIELD=lone('bz-khien-vong.png');          /* khiên: chỉ còn viền bong bóng, bỏ đĩa đặc */
const LIGHTNING=lone('bz-set.png');              /* sấm sét giáng đất (nhóm 1) */
const LAVA=fxs('flame-',9);                      /* ngọn lửa nền, nhuộm cam khi dùng cho dung nham (nhóm 1) */
/* BUFF BỘ TRANG BỊ (nhóm 2): ngọn lửa khí aura, mỗi bộ 1 màu riêng. Chỉ dùng khung 1–2 (khung 3–4 trong tờ gốc là mảnh cắt dở). */
const AURA=c=>fxs('aura-'+c+'-',2,1);
const HEAL=AURA('xanh-ngoc');
const WARM=AURA('do');
const GEAR_AURA={frost:['xanh-lo-nhat','#bff4ff'],mist:['xanh-ngoc-dam','#8fe9d5'],cloud:['xanh-duong-nhat','#c9d0ff'],wind:['jade','#7affc0'],
 thunder:['vang','#ffe84a'],counter:['hong-do','#ff9a8a'],sun:['gold','#ffd45a'],shield:['blue','#9fb0ff'],thorn:['red','#ff5a4a'],
 revive:['pink','#ffb0d0'],grove:['jade','#8be04a'],lava:['do','#ff8a3a'],ambush:['xanh-duong-dam','#7a8cff'],star:['vang-dam','#e8d05a'],
 first:['hong-do','#ffc08a'],weaken:['pink','#e89ad0'],judge:['gold','#fff0a0']};
const GEAR_DEF=['gold','#ffd45a'];
const gearArt=k=>AURA((GEAR_AURA[k]||GEAR_DEF)[0]);
const gearCol=k=>(GEAR_AURA[k]||GEAR_DEF)[1];
function gearProc(text){
 if(/Dương Diệm/.test(text||''))return{asset:AURA('do'),color:'#ff8a3a'};
 if(/Thần Phán|Tinh Quang/.test(text||''))return{asset:AURA('blue'),color:'#d7a0ff'};
 if(/Thiên Uy/.test(text||''))return{asset:AURA('vang'),color:'#ffe16b'};
 if(/Sương Tán/.test(text||''))return{asset:AURA('xanh-ngoc'),color:'#a9f4e5'};
 return null;
}
const cache=new Map();
let currentZone=0,currentPetZone=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pathFor(d,frame){
 if(d.file)return d.file;
 const n=(d.start||1)+(frame%d.count);
 return d.dir+'/'+d.prefix+String(n).padStart(d.pad||2,'0')+'.png';
}
let atlas=null;
function getAtlas(){
 if(atlas)return atlas;
 atlas=new Image();atlas.onerror=()=>{};atlas.src=ATLAS_SRC;return atlas;
}
function ready(){const a=getAtlas();return a.complete&&a.naturalWidth>0}
const LOOSE=new Map();
function looseImg(k){const n=k.split('/').pop();let im=LOOSE.get(n);if(!im){im=new Image();im.src='fx/'+n;LOOSE.set(n,im)}return im}
function frame(d,p){
 const i=d.count?Math.min(d.count-1,Math.floor(clamp(p,0,.9999)*d.count)):0;
 const k=pathFor(d,i);
 if(k.indexOf('loose/')===0){
  const im=looseImg(k),ok=im.complete&&im.naturalWidth>0;
  return{complete:ok,naturalWidth:ok?im.naturalWidth:0,naturalHeight:ok?im.naturalHeight:0,r:ok?[0,0,im.naturalWidth,im.naturalHeight]:null,k,img:im};
 }
 const r=RECTS[k],ok=!!r&&ready();
 return{complete:ok,naturalWidth:r?r[2]:0,naturalHeight:r?r[3]:0,r,k};
}
/* Nhuộm màu vùng lên ảnh: bộ ảnh gốc chỉ có vài bộ xanh/tím dùng chung cho 17 vùng nên phải nhuộm thì mới khác nhau. Có bộ nhớ đệm. */
const TC=new Map();
function tinted(im,color,a){
 const key=im.k+'|'+color+'|'+a;let c=TC.get(key);
 if(c)return c;
 if(TC.size>320)TC.clear();
 c=document.createElement('canvas');c.width=im.r[2];c.height=im.r[3];
 const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 x.drawImage(im.img||getAtlas(),im.r[0],im.r[1],im.r[2],im.r[3],0,0,im.r[2],im.r[3]);
 x.globalCompositeOperation='source-atop';x.globalAlpha=a;x.fillStyle=color;x.fillRect(0,0,c.width,c.height);
 TC.set(key,c);return c;
}
/* tint = độ nhuộm 0..1 (bỏ trống = giữ màu ảnh gốc), glow = độ sáng viền */
function paint(g,d,p,x,y,w,h,color,alpha,flip,rotate,tint,glow){
 const im=frame(d,p);
 if(!im.complete||!im.r)return false;
 const iw=im.naturalWidth,ih=im.naturalHeight,s=Math.min(w/iw,h/ih),dw=iw*s,dh=ih*s;
 g.save();g.translate(x,y);g.rotate(rotate||0);if(flip)g.scale(-1,1);
 g.globalAlpha=alpha==null?1:alpha;g.imageSmoothingEnabled=false;
 g.shadowColor=color||'#fff';g.shadowBlur=glow==null?3:glow;
 if(tint>0)g.drawImage(tinted(im,color||'#fff',Math.round(tint*20)/20),0,0,iw,ih,-dw/2,-dh/2,dw,dh);
 else g.drawImage(im.img||getAtlas(),im.r[0],im.r[1],iw,ih,-dw/2,-dh/2,dw,dh);
 g.restore();return true;
}

/* ===== Đợt 4: công cụ vẽ hiệu ứng (hạt, vòng, tia, quầng sáng) — không giữ trạng thái, mọi thứ tính từ u/T ===== */
const eo=t=>1-(1-t)*(1-t);
function rnd(n){const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)}
function mote(g,shape,x,y,s,c,a,r){
 if(a<=0.01)return;
 g.save();g.translate(x,y);g.rotate(r||0);g.globalAlpha=clamp(a,0,1);g.fillStyle=c;g.strokeStyle=c;g.shadowColor=c;g.shadowBlur=4;
 switch(shape){
  case'flake':case'star':case'holy':
   g.beginPath();g.moveTo(0,-s*1.7);g.lineTo(s*.4,-s*.4);g.lineTo(s*1.7,0);g.lineTo(s*.4,s*.4);g.lineTo(0,s*1.7);g.lineTo(-s*.4,s*.4);g.lineTo(-s*1.7,0);g.lineTo(-s*.4,-s*.4);g.closePath();g.fill();break;
  case'bolt':
   g.lineWidth=2;g.beginPath();g.moveTo(-s*1.6,-s);g.lineTo(-s*.2,-s*.1);g.lineTo(-s*.7,s*.3);g.lineTo(s*1.6,s*1.2);g.stroke();break;
  case'streak':g.fillRect(-s*2.4,-1,s*4.8,2);break;
  case'ember':g.fillRect(-s*.55,-s*.55,s*1.1,s*1.1);break;
  case'spark':g.fillRect(-s*1.8,-1,s*3.6,2);g.fillRect(-1,-s*.9,2,s*1.8);break;
  case'leaf':g.beginPath();g.ellipse(0,0,s*1.5,s*.6,0,0,6.283);g.fill();break;
  case'petal':g.beginPath();g.ellipse(0,0,s*1.2,s*.75,0,0,6.283);g.fill();break;
  case'shard':g.beginPath();g.moveTo(0,-s*1.5);g.lineTo(s*.8,s);g.lineTo(-s*.8,s);g.closePath();g.fill();break;
  case'gem':g.beginPath();g.moveTo(0,-s*1.3);g.lineTo(s,0);g.lineTo(0,s*1.3);g.lineTo(-s,0);g.closePath();g.fill();break;
  case'soul':g.beginPath();g.arc(0,0,s,0,6.283);g.fill();g.globalAlpha*=.5;g.beginPath();g.arc(0,0,s*1.9,0,6.283);g.fill();break;
  default:g.beginPath();g.arc(0,0,s,0,6.283);g.fill();
 }
 g.restore();
}
function ring(g,x,y,rx,ry,c,a,lw){
 if(a<=0.01)return;
 g.save();g.globalAlpha=clamp(a,0,1);g.strokeStyle=c;g.lineWidth=lw||2;g.shadowColor=c;g.shadowBlur=5;
 g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,6.283);g.stroke();g.restore();
}
function rays(g,x,y,n,r0,r1,c,a,rot,lw){
 if(a<=0.01)return;
 g.save();g.globalAlpha=clamp(a,0,1);g.strokeStyle=c;g.lineWidth=lw||2;g.shadowColor=c;g.shadowBlur=4;
 for(let i=0;i<n;i++){const an=rot+i*6.283/n;g.beginPath();g.moveTo(x+Math.cos(an)*r0,y+Math.sin(an)*r0);g.lineTo(x+Math.cos(an)*r1,y+Math.sin(an)*r1);g.stroke()}
 g.restore();
}
function glow(g,x,y,r,c,a){
 if(a<=0.01)return;
 g.save();g.globalAlpha=clamp(a,0,1);const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,c);gr.addColorStop(1,'rgba(0,0,0,0)');
 g.fillStyle=gr;g.fillRect(x-r,y-r,r*2,r*2);g.restore();
}
function pillar(g,x,y,w,h,c,a){
 if(a<=0.01)return;
 g.save();g.globalAlpha=clamp(a,0,1);const gr=g.createLinearGradient(0,y-h,0,y);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(1,c);
 g.fillStyle=gr;g.fillRect(x-w/2,y-h,w,h);g.restore();
}
/* nổ hạt từ 1 điểm: q 0..1 là tiến độ, rise > 0 thì bay lên */
function spray(g,x,y,c,shape,n,q,spread,seed,rise){
 if(q<=0||q>=1)return;
 for(let i=0;i<n;i++){const an=rnd(seed+i*3.7)*6.283,d=spread*(.3+.7*rnd(seed+i*5.1))*eo(q);
  mote(g,shape,x+Math.cos(an)*d,y+Math.sin(an)*d*.75-(rise||0)*q*34,2.2+rnd(seed+i)*2.4,c,1-q,an+q*3)}
}
function label(g,t,x,y,c,a,sz){
 if(a<=0.01)return;
 g.save();g.globalAlpha=clamp(a,0,1);g.textAlign='center';g.textBaseline='middle';g.font='bold '+(sz||12)+'px monospace';g.lineJoin='round';g.lineWidth=4;
 g.strokeStyle='rgba(16,8,24,.9)';g.strokeText(t,x,y);g.fillStyle=c;g.fillText(t,x,y);g.restore();
}

/* ===== ĐỢT FX 1A: ENGINE VẼ HIỆU ỨNG BẰNG CODE (canvas 2D, KHÔNG ẢNH) =====
   Dùng cho các bước 1B trở đi. Chưa nối vào đòn nào: đây chỉ là bộ công cụ, game chạy y như cũ.
   - PRNG riêng (mulberry32), KHÔNG dùng Math.random() nên không ảnh hưởng số ngẫu nhiên tính trận.
   - Hạt có pool cố định (trần MAX), có trọng lực / lực cản / nảy đất, nhiều dạng hạt vẽ bằng đường cong + gradient.
   - seed(slot,u): mỗi lần đánh mới (u quay về đầu) tự đổi hạt giống → mỗi đòn có chút khác biệt nhưng các khung hình của 1 đòn thì nhất quán.
   - Mọi hàm vẽ tự save/restore, tự dùng 'lighter' cho phần phát sáng. Chỉ nhận màu dạng '#rrggbb'. */
const FXE=(()=>{
 const TAU=Math.PI*2;
 const cl=(v,a,b)=>v<a?a:v>b?b:v;
 const lerp=(a,b,t)=>a+(b-a)*t;
 const ph=(u,a,b)=>cl((u-a)/(b-a),0,1);                       /* tiến độ 0..1 của u trong đoạn [a,b] */
 const eOut=t=>1-Math.pow(1-t,3),eIn=t=>t*t*t,eIO=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
 const eBack=t=>{const c=1.70158;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};   /* vọt quá rồi về (0→1) */
 /* --- PRNG riêng --- */
 function rng(seed){
  let s=(seed>>>0)||1;
  const f=()=>{s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296};
  f.range=(a,b)=>a+(b-a)*f();f.int=(a,b)=>Math.floor(a+(b-a+1)*f());f.sign=()=>f()<.5?-1:1;f.pick=a=>a[Math.floor(f()*a.length)%a.length];
  return f;
 }
 let seedCtr=((Date.now()&0xffffff)^0x5bd1e9)>>>0;
 const kr=rng(seedCtr^0xa5a5);
 const slots={};
 /* trạng thái của 1 lần đánh: {seed, u, fired:{}}; u quay lui > .25 = đòn mới → hạt giống mới */
 function seed(slot,u){
  let s=slots[slot];
  if(!s||u<s.u-.25){seedCtr=(Math.imul(seedCtr,1664525)+1013904223)>>>0;s=slots[slot]={seed:seedCtr,u:u,fired:{}}}
  s.u=u;return s;
 }
 const once=(s,key)=>{if(s.fired[key])return false;s.fired[key]=1;return true};          /* true đúng 1 lần mỗi đòn */
 const rate=(s,key,u,per)=>{const n=Math.floor(u*per),d=n-(s[key]||0);s[key]=n;return d>0?d:0};   /* số hạt cần phát thêm (per hạt trên mỗi 1.0 của u) */
 /* --- noise 1 chiều mượt (-1..1) --- */
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const noise=x=>{const i=Math.floor(x),f=x-i,s=f*f*(3-2*f);return lerp(hash(i),hash(i+1),s)*2-1};
 /* --- màu --- */
 const rgbC={};
 function rgb(c){let v=rgbC[c];if(v)return v;let h=String(c).replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  v=rgbC[c]=[parseInt(h.substr(0,2),16)||0,parseInt(h.substr(2,2),16)||0,parseInt(h.substr(4,2),16)||0];return v}
 const rgba=(c,a)=>{const v=rgb(c);return'rgba('+v[0]+','+v[1]+','+v[2]+','+(a<0?0:a>1?1:+a.toFixed(3))+')'};
 const mix=(c1,c2,t)=>{const a=rgb(c1),b=rgb(c2);return'#'+[0,1,2].map(i=>('0'+Math.round(lerp(a[i],b[i],t)).toString(16)).slice(-2)).join('')};
 /* --- quầng sáng nhiều điểm màu (lõi trắng → màu → trong suốt), cộng sáng --- */
 function gl(g,x,y,r,c,a,core){
  if(a<=.01||r<=0)return;
  g.save();g.globalCompositeOperation='lighter';
  const gr=g.createRadialGradient(x,y,0,x,y,r);
  gr.addColorStop(0,rgba(core||'#ffffff',a*.9));gr.addColorStop(.25,rgba(c,a*.6));gr.addColorStop(.6,rgba(c,a*.18));gr.addColorStop(1,rgba(c,0));
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.restore();
 }
 /* --- đốm mềm méo liên tục (bập bùng, không phải hình tròn cố định). o:{n,wob,rot,speed,core,add} --- */
 function blob(g,x,y,rx,ry,c,a,t,sd,o){
  if(a<=.01||rx<=0||ry<=0)return;o=o||{};
  const n=o.n||14,wob=o.wob==null?.28:o.wob,sp=o.speed||2,R=Math.max(rx,ry);
  g.save();g.translate(x,y);g.rotate(o.rot||0);if(o.add!==false)g.globalCompositeOperation='lighter';
  const gr=g.createRadialGradient(0,0,0,0,0,R*(1+wob));
  gr.addColorStop(0,rgba(o.core||'#ffffff',a));gr.addColorStop(.35,rgba(c,a*.75));gr.addColorStop(.75,rgba(c,a*.25));gr.addColorStop(1,rgba(c,0));
  g.fillStyle=gr;
  const pts=[];
  for(let i=0;i<n;i++){const an=i/n*TAU,k=1+wob*noise((sd||0)*.0007+i*1.7+t*sp);pts.push([Math.cos(an)*rx*k,Math.sin(an)*ry*k])}
  const m=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];
  const s0=m(pts[n-1],pts[0]);g.beginPath();g.moveTo(s0[0],s0[1]);
  for(let i=0;i<n;i++){const p=pts[i],q=m(p,pts[(i+1)%n]);g.quadraticCurveTo(p[0],p[1],q[0],q[1])}
  g.closePath();g.fill();g.restore();
 }
 /* --- dải thon uốn lượn: pts=[[x,y]...] từ ĐUÔI tới ĐẦU; wf=bề rộng cố định hoặc hàm của t(0 đuôi..1 đầu). o:{core,edge,edgeW,add} --- */
 function ribbon(g,pts,wf,c,a,o){
  const n=pts.length;if(n<3||a<=.01)return;o=o||{};
  const L=[],R=[];
  for(let i=0;i<n;i++){
   const p0=pts[Math.max(0,i-1)],p1=pts[Math.min(n-1,i+1)];let dx=p1[0]-p0[0],dy=p1[1]-p0[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
   const w=(typeof wf==='function'?wf(i/(n-1)):wf)/2;
   L.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);R.push([pts[i][0]+dy*w,pts[i][1]-dx*w]);
  }
  g.save();if(o.add!==false)g.globalCompositeOperation='lighter';
  const a0=pts[0],a1=pts[n-1],gr=g.createLinearGradient(a0[0],a0[1],a1[0],a1[1]);
  gr.addColorStop(0,rgba(c,0));gr.addColorStop(.5,rgba(c,a*.6));gr.addColorStop(1,rgba(o.core||c,a));
  g.fillStyle=gr;g.beginPath();g.moveTo(L[0][0],L[0][1]);
  for(let i=1;i<n-1;i++)g.quadraticCurveTo(L[i][0],L[i][1],(L[i][0]+L[i+1][0])/2,(L[i][1]+L[i+1][1])/2);
  g.lineTo(L[n-1][0],L[n-1][1]);g.lineTo(R[n-1][0],R[n-1][1]);
  for(let i=n-2;i>0;i--)g.quadraticCurveTo(R[i][0],R[i][1],(R[i][0]+R[i-1][0])/2,(R[i][1]+R[i-1][1])/2);
  g.lineTo(R[0][0],R[0][1]);g.closePath();g.fill();
  if(o.edge){g.strokeStyle=rgba(o.edge,a*.8);g.lineWidth=o.edgeW||1;g.stroke()}
  g.restore();
 }
 /* điểm dọc theo đường lượn sóng (cho ribbon): amp=biên độ, freq=số nửa sóng, phase=pha (cho nó bơi) */
 function curve(x0,y0,x1,y1,n,amp,freq,phase){
  const out=[],dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;
  for(let i=0;i<n;i++){const k=i/(n-1),o=Math.sin(k*freq*TAU+(phase||0))*amp*Math.sin(k*Math.PI);out.push([x0+dx*k+nx*o,y0+dy*k+ny*o])}
  return out;
 }
 /* đường gấp khúc giật (tia sét): r=PRNG, n=số đoạn, jit=độ lệch */
 function jag(r,x0,y0,x1,y1,n,jit){
  const out=[[x0,y0]],dx=x1-x0,dy=y1-y0,d=Math.hypot(dx,dy)||1,nx=-dy/d,ny=dx/d;
  for(let i=1;i<n;i++){const k=i/n,o=(r()-.5)*2*jit*Math.sin(k*Math.PI);out.push([x0+dx*k+nx*o,y0+dy*k+ny*o])}
  out.push([x1,y1]);return out;
 }
 /* --- gai/tinh thể nhiều mặt mọc từ đất. (x,y)=chân, w=rộng đáy, h=cao, lean=lệch ngang của đỉnh,
        pal={dark,mid,light,edge}, a=độ đục, o:{crack:0..1 vết nứt sáng, shine:0..1 ánh bóng} --- */
 function crystal(g,x,y,w,h,lean,pal,a,o){
  if(h<2||a<=.01)return;o=o||{};
  const hw=w/2,tx=x+lean,ty=y-h,kl=[x-hw*.92+lean*.38,y-h*.56],kr=[x+hw*.86+lean*.42,y-h*.48],rb=[x+w*.1+lean*.12,y+1];
  g.save();g.lineJoin='round';g.globalAlpha=a;
  let gr=g.createLinearGradient(x-hw,y,tx,ty);gr.addColorStop(0,pal.dark);gr.addColorStop(.6,pal.mid);gr.addColorStop(1,pal.light);
  g.fillStyle=gr;g.beginPath();g.moveTo(x-hw,y);g.lineTo(kl[0],kl[1]);g.lineTo(tx,ty);g.lineTo(rb[0],rb[1]);g.closePath();g.fill();
  gr=g.createLinearGradient(x+hw,y,tx,ty);gr.addColorStop(0,pal.mid);gr.addColorStop(.55,pal.light);gr.addColorStop(1,'#ffffff');
  g.fillStyle=gr;g.beginPath();g.moveTo(rb[0],rb[1]);g.lineTo(tx,ty);g.lineTo(kr[0],kr[1]);g.lineTo(x+hw,y);g.closePath();g.fill();
  g.strokeStyle=rgba(pal.edge,.5);g.lineWidth=1;g.beginPath();g.moveTo(kl[0],kl[1]);g.lineTo(x+w*.1+lean*.5,y-h*.42);g.lineTo(kr[0],kr[1]);g.stroke();   /* mặt phụ */
  g.strokeStyle=rgba(pal.edge,.9);g.lineWidth=1.3;g.beginPath();g.moveTo(rb[0],rb[1]);g.lineTo(tx,ty);g.stroke();                                          /* sống */
  g.beginPath();g.moveTo(x-hw,y);g.lineTo(kl[0],kl[1]);g.lineTo(tx,ty);g.lineTo(kr[0],kr[1]);g.lineTo(x+hw,y);g.stroke();                              /* viền */
  g.globalCompositeOperation='lighter';
  g.fillStyle=rgba('#ffffff',.2+.25*(o.shine||0));g.beginPath();g.moveTo(tx,ty);g.lineTo(tx+(kr[0]-tx)*.55,ty+(kr[1]-ty)*.55);g.lineTo(tx+(rb[0]-tx)*.45,ty+(rb[1]-ty)*.45);g.closePath();g.fill();
  if(o.crack>0){
   g.strokeStyle=rgba('#ffffff',.85*cl(o.crack,0,1));g.lineWidth=1.1;g.beginPath();g.moveTo(rb[0],rb[1]);
   g.lineTo(rb[0]-w*.09,y-h*.2*o.crack);g.lineTo(rb[0]+w*.07,y-h*.38*o.crack);g.lineTo(rb[0]-w*.03,y-h*.56*o.crack);g.stroke();
  }
  g.restore();
  gl(g,x,y,w*.9,pal.mid,.3*a);                                                                                                                      /* quầng ở chân */
 }
 /* --- vòng sóng bầu dục dưới đất, viền thon mềm, hơi gợn. o:{sq,wob,t,seed,core} --- */
 function wave(g,x,y,rx,c,a,lw,o){
  if(a<=.01||rx<=1)return;o=o||{};
  const sq=o.sq||.32,wob=o.wob==null?.06:o.wob,tt=o.t||0,n=40,w0=lw||2;
  g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';
  const pass=(w,col,al)=>{g.lineWidth=w;g.strokeStyle=rgba(col,al);g.beginPath();
   for(let i=0;i<=n;i++){const an=i/n*TAU,k=1+wob*noise((o.seed||0)*.0007+(i%n)*.9+tt*2),px=x+Math.cos(an)*rx*k,py=y+Math.sin(an)*rx*sq*k;if(i)g.lineTo(px,py);else g.moveTo(px,py)}
   g.closePath();g.stroke()};
  pass(w0*3.4,c,a*.28);pass(w0,c,a*.7);pass(w0*.45,o.core||'#ffffff',a*.8);
  g.restore();
 }
 /* --- HẠT (pool cố định, có trọng lực/lực cản/nảy đất) --- */
 const MAX=1000,P=[];for(let i=0;i<MAX;i++)P.push({on:false});
 let head=0,lastT=0,ts=1;
 function fill(p,o){
  p.on=true;p.x=o.x||0;p.y=o.y||0;p.vx=o.vx||0;p.vy=o.vy||0;p.gx=o.gx||0;p.gy=o.gy||0;p.drag=o.drag||0;p.life=o.life||1;p.age=0;
  p.s0=o.s0==null?3:o.s0;p.s1=o.s1==null?p.s0:o.s1;p.rot=o.rot||0;p.vr=o.vr||0;p.shape=o.shape||'orb';p.c=o.c||'#ffffff';p.c2=o.c2||'#ffffff';
  p.a=o.a==null?1:o.a;p.add=!!o.add;p.tag=o.tag||'';p.fo=o.fo==null?1:o.fo;p.delay=o.delay||0;p.floor=o.floor==null?null:o.floor;p.bounce=o.bounce||0;
  p.fl=o.fl||0;p.k=o.k==null?kr():o.k;return p;
 }
 /* phát 1 hạt. Trường: x,y,vx,vy,gx,gy(gia tốc),drag,life(giây),s0→s1 (cỡ đầu→cuối),rot,vr,shape,c,c2,a,add,tag,fo(độ mờ cuối),delay,floor,bounce,fl(vẫy lá) */
 function emit(o){
  for(let k=0;k<MAX;k++){const p=P[(head+k)%MAX];if(!p.on){head=(head+k+1)%MAX;return fill(p,o)}}
  const p=P[head];head=(head+1)%MAX;return fill(p,o);       /* hết chỗ: ghi đè hạt cũ, không cấp thêm bộ nhớ */
 }
 /* phát n hạt toả ra: r=PRNG; o.speed/ang/size/life/vr là [min,max]; o.s1 là hệ số cỡ cuối; jx,jy = xê dịch điểm xuất phát */
 function burst(r,x,y,n,o){
  const sp=o.speed||[20,80],an=o.ang||[0,TAU],sz=o.size||[2,4],lf=o.life||[.5,1],vr=o.vr||[0,0];
  for(let i=0;i<n;i++){
   const a=r.range(an[0],an[1]),v=r.range(sp[0],sp[1]),s0=r.range(sz[0],sz[1]);
   emit({x:x+(o.jx?r.range(-o.jx,o.jx):0),y:y+(o.jy?r.range(-o.jy,o.jy):0),vx:Math.cos(a)*v,vy:Math.sin(a)*v,gx:o.gx,gy:o.gy,drag:o.drag,life:r.range(lf[0],lf[1]),
    s0:s0,s1:o.s1==null?s0:s0*o.s1,rot:r.range(0,TAU),vr:r.range(vr[0],vr[1]),shape:o.shape,c:o.c,c2:o.c2,a:o.a,add:o.add,tag:o.tag,fo:o.fo,delay:o.delay,floor:o.floor,bounce:o.bounce,fl:o.fl?o.fl*r.range(.7,1.3):0});
  }
 }
 function clear(){for(let i=0;i<MAX;i++)P[i].on=false}
 function count(){let n=0;for(let i=0;i<MAX;i++)if(P[i].on)n++;return n}
 function tick(){
  const now=(typeof performance!=='undefined'?performance.now():Date.now())/1000;
  if(lastT&&now-lastT<.004)return;                          /* nhiều lớp gọi draw trong 1 khung: chỉ cập nhật 1 lần */
  let dt=lastT?now-lastT:.016;lastT=now;
  if(dt>.25){clear();return}                                /* bị ngưng lâu (chuyển tab, hết trận): bỏ hạt cũ */
  if(dt>.05)dt=.05;dt*=ts;
  for(let i=0;i<MAX;i++){
   const p=P[i];if(!p.on)continue;
   if(p.delay>0){p.delay-=dt;continue}
   p.age+=dt;if(p.age>=p.life){p.on=false;continue}
   const dr=Math.exp(-p.drag*dt);
   p.vx=(p.vx+p.gx*dt)*dr;p.vy=(p.vy+p.gy*dt)*dr;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;
   if(p.floor!=null&&p.y>p.floor&&p.vy>0){p.y=p.floor;p.vy*=-p.bounce;p.vx*=.7;p.vr*=.6}
  }
 }
 function drawP(g,p){
  const t=p.age/p.life,al=p.a*Math.min(t/.08,1)*Math.pow(1-t,p.fo);if(al<=.01)return;
  const s=lerp(p.s0,p.s1,t);if(s<=.05)return;
  g.save();g.translate(p.x,p.y);g.globalCompositeOperation=p.add?'lighter':'source-over';
  switch(p.shape){
   case'mist':{const gr=g.createRadialGradient(0,0,0,0,0,s);gr.addColorStop(0,rgba(p.c,al*.5));gr.addColorStop(1,rgba(p.c,0));g.fillStyle=gr;g.beginPath();g.arc(0,0,s,0,TAU);g.fill();break}
   case'shard':{g.rotate(p.rot);const gr=g.createLinearGradient(0,-s,0,s);gr.addColorStop(0,rgba(p.c2,al));gr.addColorStop(1,rgba(p.c,al));g.fillStyle=gr;
    g.beginPath();g.moveTo(0,-s*1.3);g.lineTo(s*(.45+.4*p.k),s*.15);g.lineTo(s*.15,s);g.lineTo(-s*(.35+.35*p.k),s*.55);g.closePath();g.fill();
    g.strokeStyle=rgba(p.c2,al*.8);g.lineWidth=.8;g.lineJoin='round';g.stroke();break}
   case'flake':{g.rotate(p.rot);g.strokeStyle=rgba(p.c,al);g.lineWidth=1.1;g.lineCap='round';g.beginPath();
    for(let i=0;i<3;i++){const a=i*Math.PI/3,cx=Math.cos(a),cy=Math.sin(a);g.moveTo(-cx*s,-cy*s);g.lineTo(cx*s,cy*s);
     for(const sg of[-1,1]){const bx=cx*s*.55*sg,by=cy*s*.55*sg;g.moveTo(bx,by);g.lineTo(bx+Math.cos(a+1)*s*.3,by+Math.sin(a+1)*s*.3);g.moveTo(bx,by);g.lineTo(bx+Math.cos(a-1)*s*.3,by+Math.sin(a-1)*s*.3)}}
    g.stroke();break}
   case'streak':{const an=Math.atan2(p.vy,p.vx),len=s*(1.5+Math.hypot(p.vx,p.vy)*.03);g.rotate(an);
    const gr=g.createLinearGradient(-len,0,0,0);gr.addColorStop(0,rgba(p.c,0));gr.addColorStop(1,rgba(p.c2,al));g.strokeStyle=gr;g.lineWidth=Math.max(1,s*.35);g.lineCap='round';
    g.beginPath();g.moveTo(-len,0);g.lineTo(0,0);g.stroke();break}
   case'leaf':{g.rotate(p.rot);if(p.fl)g.scale(1,.35+.65*Math.abs(Math.cos(p.age*p.fl)));g.fillStyle=rgba(p.c,al);
    g.beginPath();g.moveTo(-s,0);g.quadraticCurveTo(0,-s*.75,s,0);g.quadraticCurveTo(0,s*.75,-s,0);g.fill();
    g.strokeStyle=rgba(p.c2,al*.6);g.lineWidth=.7;g.beginPath();g.moveTo(-s*.8,0);g.lineTo(s*.8,0);g.stroke();break}
   case'petal':{g.rotate(p.rot);if(p.fl)g.scale(1,.4+.6*Math.abs(Math.cos(p.age*p.fl)));
    const gr=g.createRadialGradient(-s*.3,0,0,0,0,s*1.2);gr.addColorStop(0,rgba(p.c2,al));gr.addColorStop(1,rgba(p.c,al));g.fillStyle=gr;
    g.beginPath();g.moveTo(-s,0);g.bezierCurveTo(-s*.4,-s*.9,s*.8,-s*.7,s*1.1,0);g.bezierCurveTo(s*.8,s*.7,-s*.4,s*.9,-s,0);g.fill();break}
   case'spark':{g.rotate(p.rot);g.fillStyle=rgba(p.c2,al);g.beginPath();g.moveTo(0,-s*1.8);g.quadraticCurveTo(s*.12,-s*.12,s*1.8,0);g.quadraticCurveTo(s*.12,s*.12,0,s*1.8);g.quadraticCurveTo(-s*.12,s*.12,-s*1.8,0);g.quadraticCurveTo(-s*.12,-s*.12,0,-s*1.8);g.fill();break}
   default:{const gr=g.createRadialGradient(0,0,0,0,0,s);gr.addColorStop(0,rgba(p.c2,al));gr.addColorStop(.4,rgba(p.c,al*.7));gr.addColorStop(1,rgba(p.c,0));g.fillStyle=gr;g.beginPath();g.arc(0,0,s,0,TAU);g.fill()}
  }
  g.restore();
 }
 /* vẽ hạt: tag = chỉ vẽ hạt mang nhãn đó (vd 'atk','imp'); bỏ trống = vẽ tất cả */
 function draw(g,tag){
  tick();
  for(let i=0;i<MAX;i++){const p=P[i];if(p.on&&p.delay<=0&&(tag===undefined||p.tag===tag))drawP(g,p)}
 }
 return{TAU,cl,lerp,ph,eOut,eIn,eIO,eBack,rng,seed,once,rate,noise,rgb,rgba,mix,glow:gl,blob,ribbon,curve,jag,crystal,wave,emit,burst,draw,clear,count,
  setSpeed:v=>{ts=cl(+v||1,.05,4)}};
})();

/* tải trước toàn bộ ảnh lẻ của 17 vùng (sau khi trang tải xong) để đòn đánh đầu tiên không bị trống */
setTimeout(()=>{try{const ds=[SHIELD,LIGHTNING,LAVA,HEAL,WARM];ZONES.forEach(z=>{ds.push(z.attack,z.field)});Object.keys(GEAR_AURA).forEach(k=>ds.push(gearArt(k)));
 ds.forEach(d=>{if(!d)return;const n=d.count||1;for(let i=0;i<n;i++){const k=pathFor(d,i);if(k.indexOf('loose/')===0)looseImg(k)}})}catch(_){}},800);
function zone(i){return ZONES[Math.max(0,Math.min(ZONES.length-1,Number(i)||0))]}
function getZone(i){return i==null?zone(currentZone):zone(i)}
/* Mô tả ngắn hiệu ứng từng bộ trang bị (ch=tỉ lệ %, pct/mul=độ mạnh %) */
function setDesc(k,v){
 const m={
  frost:v=>'Bị đánh '+v.ch+'% đóng băng địch',
  mist:v=>v.ch+'% giảm nửa ST nhận',
  cloud:v=>v.ch+'% né đòn kế/hiệp',
  wind:v=>v.ch+'% chém thêm '+v.pct+'% ST',
  thunder:v=>v.ch+'% Lôi Phạt +'+v.pct+'% ST',
  counter:v=>'Né: '+v.ch+'% phản '+v.mul+'% ST',
  sun:v=>'+'+v.pct+'% ST khi địch >60% HP',
  shield:v=>'Khiên '+v.pct+'% HP đầu trận',
  thorn:v=>v.ch+'% phản '+v.pct+'% ST nhận',
  revive:v=>'Hồi sinh 1 lần '+v.pct+'% HP',
  grove:v=>'Hồi '+v.pct+'% HP mỗi hiệp',
  lava:v=>v.ch+'% dung nham '+v.pct+'% Công',
  ambush:v=>v.ch+'% đòn đầu chí mạng',
  star:v=>'Chí mạng +'+v.pct+'% ST',
  first:v=>'Ra đòn trước, đòn đầu +'+v.pct+'%',
  weaken:v=>'Địch -'+v.pct+'% Công',
  judge:v=>'Địch <30% HP chịu +'+v.pct+'% ST'};
 try{return m[k]?m[k](v):''}catch(_){return ''}
}
function getStartBuffs(P,Q){
 const out=[];
 /* Buff bộ trang bị đang kích hoạt (2+ món cùng bộ) lấy từ eqSetInfo() trong 12-equip.js */
 try{
  if(typeof eqSetInfo==='function'){
   eqSetInfo().filter(x=>x.on).forEach(x=>out.push({name:x.S.name+' '+x.n+'/4',kind:x.S.k,full:!!x.full,desc:setDesc(x.S.k,x.v||{})}));
   if(out.length)return out;
  }
 }catch(_){}
 (P.fx||[]).forEach(f=>{
  if(f.k==='shield'&&(P.sh||0)>0)out.push({name:f.S?f.S.name:'Uyên Khiên',kind:'shield'});
  else if(f.k==='weaken')out.push({name:'Phấn Hoa Suy Yếu',kind:'weaken'});
  else if(f.k==='first')out.push({name:'Thiên Uy',kind:'first'});
  else if(f.k==='ambush'&&P.eqAC)out.push({name:'U Ảnh Ám Sát',kind:'ambush'});
 });
 return out;
}
function begin(i,R,petSp){
 currentZone=Math.max(0,Math.min(ZONES.length-1,Number(i)||0));
 currentPetZone=Math.max(0,Math.min(ZONES.length-1,Number(petSp)||0));
 const z=zone(currentZone);
}
/* Bảng thông tin cố định ở 2 góc TRÊN khung, hiện suốt trận (không mờ dần, không đè lên tên/thanh máu) */
function wrapLines(g,t,w,max){const words=String(t).split(' '),out=[];let cur='';
 for(const wd of words){const n=cur?cur+' '+wd:wd;if(cur&&g.measureText(n).width>w){out.push(cur);cur=wd}else cur=n}
 if(cur)out.push(cur);if(out.length>max){out.length=max;out[max-1]=out[max-1].replace(/.{0,2}$/,'…')}return out}
function panel(g,x,y,w,color,lines){
 /* Gọn: chữ 7px, KHÔNG nền/khung, chỉ viền chữ tối để vẫn đọc được; dòng đầu (tên vùng) mờ hơn */
 const lh=8;g.save();g.textAlign='left';g.textBaseline='top';g.font='bold 7px monospace';g.lineJoin='round';g.lineWidth=2.5;g.strokeStyle='rgba(16,8,24,.85)';
 lines.forEach((l,k)=>{g.globalAlpha=k?.95:.75;g.strokeText(l.t,x+2,y+1+k*lh);g.fillStyle=l.c;g.fillText(l.t,x+2,y+1+k*lh)});g.restore()}
function infoPanels(g,z,zp,R){
 g.save();g.font='bold 7px monospace';const W=172,iw=W-6,mode=v=>v.mode==='melee'?'Cận chiến':'Đánh xa';
 const L=[{t:zp.mark+' '+zp.name+' · '+mode(zp),c:zp.color}];
 /* Buff vùng của thú chỉ có ở ĐẤU TRƯỜNG (xem drawArenaPanels); thám hiểm không hiện, không tính. */
 /* Buff bộ trang bị: mỗi bộ 1 dòng, ghi rõ hiệu ứng */
 if(R&&R.startBuffs&&R.startBuffs.length){
  const sb=R.startBuffs,show=sb.length>3?2:sb.length;
  for(let k=0;k<show;k++)wrapLines(g,'✦ '+sb[k].name+(sb[k].desc?': '+sb[k].desc:''),iw,1).forEach(t=>L.push({t,c:sb[k].full?'#ffe27a':'#ffe8a8'}));
  if(sb.length>show)L.push({t:'+'+(sb.length-show)+' bộ khác',c:'#ffe8a8'});
 }
 const M=[{t:z.mark+' '+z.name+' · '+mode(z),c:z.color}];
 if(R&&R.zoneBuff)wrapLines(g,R.zoneBuff.label+': '+R.zoneBuff.desc,iw,2).forEach(t=>M.push({t,c:'#fff0bd'}));
 const CW=360,CH=230,lh=8,bot=2;
 const yL=CH-(L.length*lh+2)-bot,yM=CH-(M.length*lh+2)-bot;
 panel(g,3,yL,W,zp.color,L);panel(g,CW-3-W,yM,W,z.color,M);g.restore()}
/* Bảng 2 góc dưới cho ĐẤU TRƯỜNG: vùng thú + buff vùng thật (bP/bM = {text} do 26-arena.js tính) */
function drawArenaPanels(g,spP,spM,bP,bM){
 const zp=zone(spP),zm=zone(spM),W=172,iw=W-6,CW=360,CH=230,lh=8,bot=2,mode=v=>v.mode==='melee'?'Cận chiến':'Đánh xa';
 g.save();g.font='bold 7px monospace';
 const mk=(z,b)=>{const L=[{t:z.mark+' '+z.name+' · '+mode(z),c:z.color}];if(b&&b.text)wrapLines(g,'✦ '+b.text,iw,2).forEach(t=>L.push({t,c:'#fff0bd'}));return L};
 const L=mk(zp,bP),M=mk(zm,bM);
 panel(g,3,CH-(L.length*lh+2)-bot,W,zp.color,L);panel(g,CW-3-W,CH-(M.length*lh+2)-bot,W,zm.color,M);g.restore()}
/* Buff vùng 0–8: pixel art vẽ bằng canvas, nằm sau thú; palette lấy riêng từ màu từng vùng. */
const BUFFSH={atk:'ember',def:'shard',spd:'streak',mag:'star',eva:'streak',crit:'spark',regen:'leaf',hp:'petal'};
const BUFFSEC=2.4;
function buffPixel(g,x,y,c,a,u,w,h){
 if(a<=.012)return;u=Math.max(1.4,u||2.2);w=Math.max(1,Math.round(w||1));h=Math.max(1,Math.round(h||1));
 const ww=w*u,hh=h*u;g.globalAlpha=FXE.cl(a,0,1);g.fillStyle=c;
 g.fillRect(Math.round((x-ww/2)/u)*u,Math.round((y-hh/2)/u)*u,ww,hh);
}
function buffLine(g,pts,c,a,u,width){
 if(!pts||pts.length<2||a<=.012)return;const step=Math.max(1.4,u||2.2),w=width||1,seen=new Set();
 for(let i=1;i<pts.length;i++){const p=pts[i-1],q=pts[i],n=Math.max(1,Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/step));
  for(let j=0;j<=n;j++){const t=j/n,xx=p[0]+(q[0]-p[0])*t,yy=p[1]+(q[1]-p[1])*t,key=Math.round(xx/step)+':'+Math.round(yy/step);if(seen.has(key))continue;seen.add(key);buffPixel(g,xx,yy,c,a,step,w,w)}}
}
function buffArc(g,x,y,rx,ry,a0,a1,c,a,u,T,dash){
 if(a<=.012)return;const step=Math.max(1.4,u||2.2),n=Math.max(2,Math.ceil(Math.abs(a1-a0)*Math.max(rx,ry)/step)),seen=new Set();
 for(let i=0;i<=n;i++){if(dash&&Math.floor(i/4+T*2.5)%3===1)continue;const an=a0+(a1-a0)*i/n,xx=x+Math.cos(an)*rx,yy=y+Math.sin(an)*ry,key=Math.round(xx/step)+':'+Math.round(yy/step);if(seen.has(key))continue;seen.add(key);buffPixel(g,xx,yy,c,a,step)}
}
function buffDiamond(g,x,y,r,c,a,u){
 const n=Math.max(1,Math.round(r));for(let row=-n;row<=n;row++){const w=n-Math.abs(row);
  for(let col=-w;col<=w;col++)buffPixel(g,x+col*u,y+row*u,c,a,u)}
}
function buffSpark(g,x,y,r,c,a,u){
 const n=Math.max(2,Math.round(r));for(let i=-n;i<=n;i++){
  buffPixel(g,x+i*u,y,c,a,u);buffPixel(g,x,y+i*u,c,a,u);
  if(Math.abs(i)%2===0){buffPixel(g,x+i*u,y+i*u,c,a*.72,u);buffPixel(g,x+i*u,y-i*u,c,a*.72,u)}
 }
}
function buffStatPixel(g,shape,x,y,sz,col,pale,a,u,T,stat){
 if(a<=.02)return;const n=Math.max(2,Math.round(sz));
 if(shape==='shard'||shape==='petal')buffDiamond(g,x,y,n,col,a,u);
 else if(shape==='ember'){for(let j=0;j<n;j++)buffPixel(g,x,y+(n-j)*u,pale,a,u,Math.max(1,n-j),1);buffPixel(g,x,y-n*u,col,a,u)}
 else if(shape==='streak'){
  buffLine(g,[[x-n*u,y+u],[x,y],[x+n*u,y-u]],col,a,u,1);
  if(stat==='eva')buffArc(g,x,y,n*u*1.4,n*u*.65,-.25,Math.PI*1.2,pale,a*.8,u,T,1);
 }else if(shape==='leaf'){
  buffLine(g,[[x-n*u,y+n*u],[x,y],[x+n*u,y-n*u]],col,a,u,1);buffPixel(g,x,y,pale,a,u);
 }else buffSpark(g,x,y,n,col,a,u);
}
function backZoneCode(g,x,z,q,T,shape,k,zoneId,stat){
 const a=FXE.cl(q,0,1),u=Math.max(1.5,2.2*(k||1)),col=z.color;
 const pale=FXE.mix(col,'#fff3c5',.52),deep=FXE.mix(col,'#101827',.7),mid=FXE.mix(col,'#ffffff',.18);
 const y=204,pulse=.74+.26*Math.sin(T*3.1+zoneId*.83),w=a*pulse;
 g.save();
 /* Dấu chân pixel thay vòng mượt cũ; mỗi vùng chồng lên một huy hiệu khác nhau. */
 buffArc(g,x,y,36*k,5*k,.16,Math.PI*2-.12,deep,a*.72,u,T,1);
 buffArc(g,x,y,30*k,3*k,T*.7, T*.7+Math.PI*1.12,col,a*.86,u,T,1);
 for(let i=0;i<5;i++){const an=T*.45+i*Math.PI*2/5+zoneId*.17;buffPixel(g,x+Math.cos(an)*33*k,y+Math.sin(an)*5*k,pale,a*.8,u,1,1)}
 switch(zoneId){
  case 0:{ /* Tuyết Nguyên: cụm tinh thể mọc tầng bậc */
   for(let i=-2;i<=2;i++){const h=13+Math.max(0,5-Math.abs(i))*2+Math.floor((Math.sin(T*2+i)*1.5+1));
    for(let r=0;r<h;r++){const half=Math.max(0,Math.floor((h-r)/5)),xx=x+i*12*u,yy=y-u*(r+1),shade=r%4===0?pale:(r%3===0?mid:col);
     buffPixel(g,xx,yy,deep,w*.92,u,half*2+2,1);buffPixel(g,xx-u,yy,shade,w*.95,u,Math.max(1,half),1);if(r%2===0)buffPixel(g,xx+u,yy,pale,w*.82,u,1,1)}}
   buffDiamond(g,x-27*u,y-9*u,2,pale,w*.75,u);buffDiamond(g,x+28*u,y-14*u,2,mid,w*.8,u);break}
  case 1:{ /* Sương Cốc: bậc hơi nước uốn thành cột mềm */
   for(let colN=-1;colN<=1;colN++){const pts=[];for(let j=0;j<24;j++){const v=j/23,xx=x+colN*17*u+Math.sin(T*1.4+v*6+colN)*4*u,yy=y-v*25*u;pts.push([xx,yy])}
    buffLine(g,pts,deep,w*.55,u,2);buffLine(g,pts.slice(2),col,w*.92,u,1);for(let j=3;j<22;j+=5)buffPixel(g,pts[j][0]-u,pts[j][1],pale,w*.72,u,2,1)}
   for(let i=0;i<7;i++){const an=T*.6+i*Math.PI*2/7;buffPixel(g,x+Math.cos(an)*26*u,y-12*u+Math.sin(an)*8*u,pale,w*.78,u,2,2)}break}
  case 2:{ /* Vân Đảo: mây vuông xoáy thành vòng tím */
   for(let ring=0;ring<3;ring++)buffArc(g,x,y-19*u,(17+ring*8)*k,(7+ring*3)*k,T*(ring%2?-.65:.5)+ring*1.4,T*(ring%2?-.65:.5)+ring*1.4+Math.PI*1.48,ring===1?pale:col,w*(.85-ring*.12),u,T,1);
   for(let i=0;i<6;i++){const an=T*.55+i*Math.PI/3,xx=x+Math.cos(an)*30*k,yy=y-16*u+Math.sin(an)*10*k;buffPixel(g,xx,yy,deep,w*.9,u,3,2);buffPixel(g,xx+u,yy-u,pale,w*.8,u,2,1)}
   buffLine(g,[[x-20*u,y-29*u],[x-17*u,y-26*u],[x-19*u,y-23*u],[x-13*u,y-20*u]],pale,w*.85,u);break}
  case 3:{ /* Phong Nguyên: các dải gió xoáy và lá bay */
   for(let side of [-1,1]){const pts=[];for(let j=0;j<22;j++){const v=j/21,an=T*1.5+v*4.5+side*.7;pts.push([x+side*(8+28*v)*k+Math.sin(an)*7*k,y-7*u-v*23*u+Math.cos(an)*2*u])}
    buffLine(g,pts,deep,w*.62,u,2);buffLine(g,pts.slice(3),col,w*.95,u)}
   for(let i=0;i<5;i++){const an=T*1.2+i*2.4,xx=x+Math.sin(an)*31*k,yy=y-12*u-(i%3)*7*u;buffLine(g,[[xx-2*u,yy+u],[xx,yy],[xx+2*u,yy-u]],pale,w*.9,u,2)}break}
  case 4:{ /* Lôi Vực: tia sét rẽ nhánh, nét vàng bậc thang */
   for(let side of [-1,1]){const sx=x+side*16*k,pts=[[sx-3*u,y-31*u],[sx+u,y-27*u],[sx-2*u,y-23*u],[sx+2*u,y-19*u],[sx,y-15*u],[sx+4*u,y-11*u],[sx+2*u,y-6*u],[sx+6*u,y-2*u]];
    buffLine(g,pts,deep,w*.7,u,3);buffLine(g,pts,col,w,u,1);buffLine(g,[pts[2],[sx+side*9*k,y-20*u],[sx+side*12*k,y-16*u]],pale,w*.8,u,1)}
   for(let i=-3;i<=3;i++)buffPixel(g,x+i*8*k,y-2*u,mid,w*.82,u,2,1);break}
  case 5:{ /* Nguyệt Cung: trăng lưỡi liềm bằng cung ô pixel và sao */
   for(let side of [-1,1]){const cx=x+side*23*k,cy=y-20*u,rot=T*.32+side*.9;
    buffArc(g,cx,cy,10*k,12*k,rot+.55,rot+Math.PI*1.8,pale,w,u,T,0);
    buffArc(g,cx+4*u,cy-2*u,8*k,10*k,rot+.7,rot+Math.PI*1.7,deep,w*.95,u,T,0)}
   buffSpark(g,x,y-27*u,2,pale,w*.9,u);buffDiamond(g,x-34*k,y-18*u,1,col,w,u);buffDiamond(g,x+35*k,y-10*u,1,mid,w,u);break}
  case 6:{ /* Dương Sơn: đài lửa pixel bật lên từ vòng đất */
   for(let i=-4;i<=4;i++){const height=8+Math.floor((Math.sin(T*4+i*1.7)+1)*4)+(4-Math.abs(i));
    for(let r=0;r<height;r++){const width=r<3?2:(r<height*.55?1:0),xx=x+i*7*u,yy=y-u*(r+1),c=r<3?pale:(r%3===0?mid:col);
     buffPixel(g,xx,yy,deep,w*.88,u,width+1,1);buffPixel(g,xx-u,yy,c,w*.9,u,width,1)} }
   for(let i=0;i<6;i++)buffPixel(g,x+Math.sin(T*2+i*4)*34*k,y-(10+i%4*5)*u,mid,w*.9,u,1,2);break}
  case 7:{ /* Huyền Uyên: khe nứt vuông tối và các vết nứt tím */
   const jit=Math.sin(T*1.7)*u;for(let j=0;j<20;j++){const yy=y-4*u-j*1.15*u,xx=x+jit+Math.sin(j*.92+T)*2*u;buffPixel(g,xx,yy,deep,w*.95,u,Math.max(1,3-(j%4===0?2:0)),1);if(j%3===0)buffPixel(g,xx+3*u,yy+u,pale,w*.9,u,1,1)}
   for(let side of [-1,1])buffLine(g,[[x+side*5*u,y-10*u],[x+side*10*u,y-14*u],[x+side*7*u,y-18*u],[x+side*15*u,y-24*u],[x+side*12*u,y-30*u]],col,w,u,2);
   buffDiamond(g,x-24*k,y-18*u,2,mid,w*.9,u);buffDiamond(g,x+24*k,y-26*u,2,pale,w*.9,u);break}
  case 8:{ /* Kim Khoáng: lưỡi kiếm vàng dựng chéo, tia kim loại */
   for(let i=0;i<5;i++){const side=i%2?1:-1,xx=x+side*(12+i*5)*k,yy=y-(8+(i%3)*6)*u,pts=[[xx-3*u,yy+8*u],[xx-u,yy+4*u],[xx+u,yy],[xx+3*u,yy-5*u],[xx+5*u,yy-7*u]];
    buffLine(g,pts,deep,w*.8,u,3);buffLine(g,pts.slice(1),i%2?pale:col,w,u,1)}
   buffArc(g,x,y-18*u,34*k,14*k,T*.55,T*.55+Math.PI*1.2,pale,w*.85,u,T,1);break}
 }
 /* Hạt chỉ số vẫn đổi hình theo Công/Thủ/Tốc/Né/Pháp/Chí mạng/Hồi phục/HP. */
 const sh=BUFFSH[stat]||shape||'star';
 for(let i=0;i<7;i++){const p=(T*(.2+(i%3)*.055)+i*.163+zoneId*.071)%1,fade=Math.sin(Math.PI*p)*a;
  const side=Math.sin(i*17.3+zoneId*4.1),xx=x+side*(20+8*Math.sin(T*1.2+i))*k,yy=y-(8+p*38)*k,sz=1+(i%3===0?1:0);
  buffStatPixel(g,sh,xx,yy,sz,i%2?col:pale,pale,fade*.92,u,T,stat)}
 g.restore();
}
/* Buff nền pixel art cho vùng 9–16; mỗi vùng có silhouette riêng, chỉ dùng fillRect theo ô. */
function backZoneCode3B(g,x,z,q,T,shape,k,zoneId,stat){
 const a=FXE.cl(q,0,1),u=Math.max(1.5,2.2*(k||1)),col=z.color;
 const pale=FXE.mix(col,'#fff1c9',.54),deep=FXE.mix(col,'#111426',.72),mid=FXE.mix(col,'#ffffff',.2);
 const y=204,pulse=.73+.27*Math.sin(T*2.7+zoneId*.61),w=a*pulse;
 g.save();buffArc(g,x,y,37*k,5*k,.08,Math.PI*2-.08,deep,a*.72,u,T,1);
 buffArc(g,x,y,29*k,3*k,T*.63,T*.63+Math.PI*1.1,col,a*.9,u,T,1);
 for(let i=0;i<5;i++){const an=T*.38+i*Math.PI*2/5+zoneId*.13;buffPixel(g,x+Math.cos(an)*34*k,y+Math.sin(an)*5*k,pale,a*.82,u)}
 switch(zoneId){
  case 9:{ /* Ngọc Động: rắn linh khí ngọc cuộn qua cụm hoa */
   for(let strand=0;strand<2;strand++){const pts=[];for(let j=0;j<29;j++){const v=j/28;pts.push([x+(v-.5)*64*k,y-(12+Math.sin(v*7+T*1.45+strand*.8)*8+v*8)*k])}buffLine(g,pts,deep,w*.68,u,3);buffLine(g,pts.slice(2),strand?pale:col,w,u)}
   for(let i=0;i<6;i++){const an=T*.55+i*Math.PI/3,xx=x+Math.cos(an)*16*k,yy=y-23*k+Math.sin(an)*9*k;buffDiamond(g,xx,yy,2,i%2?pale:mid,w*.9,u)}buffDiamond(g,x,y-23*k,2,col,w,u);break}
  case 10:{ /* Thanh Lâm: dây leo mọc bậc, nhánh lá xanh */
   for(let side of [-1,1]){const pts=[];for(let j=0;j<27;j++){const v=j/26;pts.push([x+side*(10+29*v)*k+Math.sin(T*1.1+v*5+side)*4*k,y-v*29*k])}buffLine(g,pts,deep,w*.76,u,3);buffLine(g,pts.slice(3),col,w,u);
    for(let j=5;j<25;j+=5){const p=pts[j],dir=(j%2?1:-1)*side;buffLine(g,[[p[0],p[1]],[p[0]+dir*4*u,p[1]-2*u],[p[0]+dir*6*u,p[1]-2*u]],pale,w*.9,u);buffDiamond(g,p[0]+dir*6*u,p[1]-3*u,1,mid,w,u)}}buffPixel(g,x,y-12*u,pale,w,u,2,2);break}
  case 11:{ /* Xích Hỏa Địa: sóng lửa ngang và cột lửa đỏ */
   for(let i=-5;i<=5;i++){const h=5+Math.floor((Math.sin(T*3.8+i*1.4)+1)*3)+(5-Math.abs(i));for(let row=0;row<h;row++){const ww=row<2?2:(row<h*.5?1:0),xx=x+i*6.5*u,yy=y-(row+1)*u;buffPixel(g,xx,yy,deep,w*.8,u,ww+2,1);buffPixel(g,xx-u,yy,row<3?pale:(row%2?mid:col),w*.98,u,ww+1,1)}}
   for(let side of [-1,1])buffLine(g,[[x+side*11*k,y-4*u],[x+side*18*k,y-10*u],[x+side*22*k,y-17*u],[x+side*29*k,y-21*u]],col,w*.8,u,2);break}
  case 12:{ /* Hắc Ám Lâm: xúc tu bóng đen dựng từ vũng tối */
   buffPixel(g,x,y-4*u,deep,w*.96,u,12,3);buffPixel(g,x,y-6*u,col,w*.72,u,7,1);
   for(let side of [-1,1])for(let arm=0;arm<3;arm++){const pts=[];for(let j=0;j<19;j++){const v=j/18,xx=x+side*(7+arm*5+v*(12+arm*4))*k+Math.sin(T*1.7+v*4+arm)*3*u,yy=y-5*u-v*(17+arm*3)*u;pts.push([xx,yy])}buffLine(g,pts,deep,w*.95,u,3);buffLine(g,pts.slice(8),arm%2?pale:col,w*.88,u)}
   buffDiamond(g,x-3*u,y-10*u,1,pale,w*.8,u);buffDiamond(g,x+3*u,y-10*u,1,pale,w*.8,u);break}
  case 13:{ /* Tử Tinh Hải: tinh thể sáu cánh và mảnh sao lơ lửng */
   for(let i=0;i<8;i++){const an=T*.18+i*Math.PI/4,rr=(19+(i%2)*8)*k,xx=x+Math.cos(an)*rr,yy=y-21*k+Math.sin(an)*rr*.6,tip=[xx+Math.cos(an)*5*u,yy+Math.sin(an)*5*u],back=[xx-Math.cos(an)*4*u,yy-Math.sin(an)*4*u];
    buffLine(g,[back,[xx-Math.sin(an)*2*u,yy+Math.cos(an)*2*u],tip,[xx+Math.sin(an)*2*u,yy-Math.cos(an)*2*u],back],deep,w*.8,u,2);buffLine(g,[back,tip],i%2?pale:col,w,u)}
   buffDiamond(g,x,y-21*k,3,col,w,u);buffDiamond(g,x,y-21*k,1,pale,w,u);buffArc(g,x,y-21*k,30*k,12*k,T*.3,T*.3+Math.PI*1.3,mid,w*.75,u,T,1);break}
  case 14:{ /* Thiên Không: ba dải khí xanh xoắn riêng nhịp */
   for(let strand=0;strand<3;strand++){const pts=[];for(let j=0;j<31;j++){const v=j/30,an=T*(strand===1?-.9:.72)+v*5.8+strand*2.05,rr=(11+22*v)*k;pts.push([x+Math.cos(an)*rr,y-18*k+Math.sin(an)*rr*.52-v*4*u])}buffLine(g,pts,deep,w*.65,u,3);buffLine(g,pts.slice(4),strand===1?pale:col,w*.92,u)}
   for(let side of [-1,1])buffSpark(g,x+side*31*k,y-18*k,1,pale,w*.84,u);break}
  case 15:{ /* Linh Hoa Viên: thân cỏ và bông hoa pixel nhiều cánh */
   for(let i=0;i<5;i++){const side=i-2,xx=x+side*13*k,top=y-(16+(i%3)*5)*k;buffLine(g,[[xx,y-2*u],[xx+Math.sin(T*.7+i)*2*u,top]],FXE.mix(col,'#183c25',.48),w*.92,u,1);buffLine(g,[[xx,top+7*u],[xx+side*3*u,top+4*u],[xx+side*5*u,top+4*u]],col,w*.82,u,1);
    for(let petal=0;petal<4;petal++){const an=petal*Math.PI/2+T*.17;buffDiamond(g,xx+Math.cos(an)*2*u,top+Math.sin(an)*2*u,1,petal%2?pale:mid,w,u)}buffPixel(g,xx,top,col,w,u)}buffArc(g,x,y-3*u,34*k,8*k,T*.3,T*.3+Math.PI,col,w*.75,u,T,1);break}
  case 16:{ /* Thần Điện: pháp trận vuông bậc, trụ sáng và lông vũ vàng */
   const rot=T*.16;for(let side of [-1,1]){const xx=x+side*28*k;buffLine(g,[[xx-2*u,y-2*u],[xx-2*u,y-16*u],[xx,y-19*u],[xx+2*u,y-16*u],[xx+2*u,y-2*u]],deep,w*.8,u,2);buffLine(g,[[xx,y-16*u],[xx,y-3*u]],pale,w,u,1);for(let j=0;j<4;j++)buffPixel(g,xx+side*(j%2)*u,y-(5+j*3)*u,mid,w*.9,u,1,2)}
   buffArc(g,x,y-12*u,30*k,18*k,rot,rot+Math.PI*1.82,col,w*.88,u,T,1);buffArc(g,x,y-12*u,22*k,12*k,-rot,-rot+Math.PI*1.55,pale,w*.8,u,T,1);
   for(let i=0;i<8;i++){const an=T*.24+i*Math.PI/4;buffDiamond(g,x+Math.cos(an)*22*k,y-12*u+Math.sin(an)*12*k,1,mid,w*.9,u)}break}
 }
 const sh=BUFFSH[stat]||shape||'star';for(let i=0;i<7;i++){const p=(T*(.19+(i%3)*.06)+i*.157+zoneId*.053)%1,fade=Math.sin(Math.PI*p)*a,an=i*2.399+T*.22,rr=(19+5*Math.sin(T+i))*k;
  buffStatPixel(g,sh,x+Math.cos(an)*rr,y-(7+p*40)*k,1+(i%3===1?1:0),i%2?col:pale,pale,fade*.88,u,T,stat)}
 g.restore();
}
/* ===== HIỆU ỨNG BUFF — QUY TẮC: tất cả vẽ TRƯỚC thú (lớp nền, gọi từ drawBack/drawArenaBack) nên thú luôn nằm trên,
   hiệu ứng chỉ lộ ra quanh người. Lớp trên (drawField/drawArenaBuffs) chỉ còn chữ nhãn + viền khiên mảnh. Không có ảnh nào đè lên thân thú. =====
   BUFF VÙNG   = pixel art vẽ riêng cho từng vùng (0–16), màu vùng, hạt theo chỉ số.
   BUFF BỘ TRANG BỊ = ngọn lửa aura nhóm 2, mỗi bộ 1 màu (GEAR_AURA). Hai loại KHÔNG dùng chung ảnh. */
function groundRing(g,x,col,a,T,r){
 const u=2.2,rx=(r||36)+Math.sin(T*2)*2;g.save();
 buffArc(g,x,204,rx,7+Math.sin(T*2)*1.2,0,Math.PI*2,col,a,u,T,1);
 for(let k=0;k<5;k++){const an=T*.7+k*Math.PI*2/5;buffPixel(g,x+Math.cos(an)*(rx-7),202+Math.sin(an)*6,col,a*.78,u,1,1)}
 g.restore();
}
/* buff vùng, lớp nền: quầng + vòng chân + hiệu ứng vùng phía SAU thú + hạt bay lên */
function backZone(g,x,z,q,T,e,shape,k,stat){
 if(q<=0)return;k=k||1;
 const zoneId=ZONES.indexOf(z);
 if(zoneId>=0&&zoneId<=8){backZoneCode(g,x,z,q,T,shape||'star',k,zoneId,stat||shape);return}
  if(zoneId>=9&&zoneId<=16){backZoneCode3B(g,x,z,q,T,shape||'star',k,zoneId,stat||shape);return}
 const a=Math.min(1,q*1.8),gr=1.25-q*.25;
 glow(g,x,176,74*k*gr,z.color,.34*a);
 ring(g,x,204,(46+(1-q)*28)*k,(10+(1-q)*6)*k,z.color,.85*a,2.5);
 ring(g,x,204,(30+(1-q)*14)*k,(7+(1-q)*3)*k,'#ffffff',.5*a,1.5);
 rays(g,x,150,10,40*k,(56+52*(1-q))*k,z.color,.22*a,T*.7,2);
 paint(g,z.field,clamp(e*.9,0,.99),x,156,152*k*gr,152*k*gr,z.color,.72*a,false,0,z.bt||0,9);
 for(let i=0;i<12;i++){const ph=(T*.7+i*.083)%1;
  mote(g,shape||'star',x+(rnd(i*9.1)-.5)*84*k,y0(k)-ph*100*k,2+rnd(i)*2.2,z.color,Math.sin(ph*3.1416)*a,T*2+i)}
}
const y0=k=>206;
/* Buff bộ trang bị 17 bộ: pixel-aura nhiều dải uốn, màu và silhouette độc lập với buff vùng. */
const GEAR_PIXEL_STYLE={
 frost:{id:0,n:4,h:32,form:'ice'},mist:{id:1,n:4,h:31,form:'mist'},cloud:{id:2,n:4,h:34,form:'cloud'},wind:{id:3,n:4,h:29,form:'wind'},
 thunder:{id:4,n:4,h:35,form:'bolt'},counter:{id:5,n:4,h:32,form:'orbit'},sun:{id:6,n:4,h:35,form:'sun'},shield:{id:7,n:4,h:30,form:'shield'},
 thorn:{id:8,n:4,h:33,form:'thorn'},revive:{id:9,n:4,h:35,form:'feather'},grove:{id:10,n:4,h:31,form:'vine'},lava:{id:11,n:4,h:34,form:'lava'},
 ambush:{id:12,n:4,h:29,form:'shadow'},star:{id:13,n:4,h:34,form:'star'},first:{id:14,n:4,h:36,form:'spear'},weaken:{id:15,n:4,h:30,form:'drip'},judge:{id:16,n:4,h:36,form:'crown'}
};
function backGear(g,x,kind,q,T,e){
 const st=GEAR_PIXEL_STYLE[kind]||GEAR_PIXEL_STYLE.judge,id=st.id,u=2.2,col=gearCol(kind);
 const pale=FXE.mix(col,'#fff4cf',.58),deep=FXE.mix(col,'#101321',.72),mid=FXE.mix(col,'#ffffff',.22);
 const a=q>0?Math.min(1,q*1.8):0,rest=.31+.09*Math.sin(T*3.7+id),al=Math.max(rest,.88*a),pulse=.72+.28*Math.sin(T*2.6+id*.9),w=al*pulse;
 g.save();
 /* Rãnh chân pixel; aura trang bị dựng cao hơn và xoắn nhiều lớp hơn buff vùng. */
 buffArc(g,x,204,43,8,0,Math.PI*2,deep,al*.7,u,T,1);
 buffArc(g,x,204,38,5,T*.45,T*.45+Math.PI*1.7,col,al*.9,u,T,1);
 buffArc(g,x,204,30,3,-T*.55,-T*.55+Math.PI*1.2,pale,al*.74,u,T,1);
 for(let i=0;i<st.n;i++){
  const side=i%2?1:-1,offset=(i-(st.n-1)/2)*5.5*u,phase=T*(1.2+(i%3)*.18)+id*.67+i*1.7,pts=[];
  for(let j=0;j<22;j++){const v=j/21;let bend=0;
   switch(st.form){
    case'ice':bend=side*(3+v*10)*u+Math.sin(v*5+phase)*2*u;break;
    case'mist':bend=Math.sin(v*8+phase)*7*u+side*2*u;break;
    case'cloud':bend=Math.sin(v*5+phase)*8*u+Math.cos(v*9+phase)*3*u;break;
    case'wind':bend=side*(5+v*17)*u+Math.sin(v*6+phase)*3*u;break;
    case'bolt':bend=Math.round(Math.sin(v*14+phase)*3)*u+side*v*7*u;break;
    case'orbit':bend=Math.sin(v*FXE.TAU*1.35+phase)*9*u+side*2*u;break;
    case'sun':bend=side*v*14*u+Math.sin(v*4+phase)*3*u;break;
    case'shield':bend=side*(v<.3?3:7+v*10)*u+Math.sin(v*4+phase)*2*u;break;
    case'thorn':bend=side*(v*15+Math.sin(v*5+phase)*3)*u;break;
    case'feather':bend=side*5*u+Math.sin(v*6+phase)*6*u;break;
    case'vine':bend=side*(5+v*15)*u+Math.sin(v*4+phase)*4*u;break;
    case'lava':bend=side*v*13*u+Math.sin(v*5+phase)*5*u;break;
    case'shadow':bend=Math.sin(v*FXE.TAU*.85+phase)*11*u+side*2*u;break;
    case'star':bend=side*v*14*u+Math.sin(v*9+phase)*4*u;break;
    case'spear':bend=side*(1+v*17)*u+Math.sin(v*5+phase)*2*u;break;
    case'drip':bend=Math.sin(v*7+phase)*5*u+side*2*u;break;
    default:bend=side*(4+v*12)*u+Math.sin(v*3+phase)*4*u;
   }
   const lift=st.h*v,xx=x+offset+bend,yy=202-lift*u;
   if(st.form==='wind'&&i%2===0&&j>3&&j%4<2)continue;
   pts.push([xx,yy]);
  }
  const outline=pts.map(p=>[p[0]+side*u,p[1]+u]);buffLine(g,outline,deep,w*.72,u,1);buffLine(g,pts.slice(2),i%2?pale:col,w*(.84+(i%3)*.05),u,1);
 }
 switch(kind){
  case'frost':for(let i=-2;i<=2;i++)buffDiamond(g,x+i*9*u,164-Math.abs(i)*3,i%2===0?2:1,i%2?pale:mid,w,u);break;
  case'mist':for(let i=0;i<3;i++)buffArc(g,x,174-i*7,17+i*7,7+i*2,T+i*1.4,T+i*1.4+Math.PI*1.25,col,w*.85,u,T,1);for(let i=0;i<5;i++)buffPixel(g,x+(i-2)*8*u,165+(i%2)*5*u,pale,w*.85,u,2,1);break;
  case'cloud':for(let i=0;i<4;i++){const an=T*.4+i*Math.PI/2,xx=x+Math.cos(an)*21,yy=165+Math.sin(an)*10;buffPixel(g,xx,yy,col,w,u,3,2);buffPixel(g,xx+2*u,yy-u,pale,w*.9,u,2,1)}break;
  case'wind':for(let i=0;i<4;i++){const yy=168+i*5,shift=Math.sin(T*1.7+i)*8;buffLine(g,[[x-27+shift,yy],[x-12+shift,yy-u],[x+7+shift,yy-u],[x+23+shift,yy-2*u]],i%2?pale:col,w*.9,u,1);buffDiamond(g,x+18+shift,yy-4*u,1,mid,w,u)}break;
  case'thunder':for(let s of [-1,1])buffLine(g,[[x+s*17,143],[x+s*12,151],[x+s*18,158],[x+s*10,166],[x+s*13,174],[x+s*5,181]],pale,w,u,2);break;
  case'counter':buffArc(g,x,166,26,18,T*.8,T*.8+Math.PI*1.5,pale,w,u,T,1);buffArc(g,x,166,18,12,-T*.9,-T*.9+Math.PI*1.35,col,w*.9,u,T,1);buffDiamond(g,x-24,164,1,mid,w,u);buffDiamond(g,x+24,164,1,mid,w,u);break;
  case'sun':for(let i=0;i<12;i++){const an=i*Math.PI/6+T*.12;buffLine(g,[[x+Math.cos(an)*8,168+Math.sin(an)*7],[x+Math.cos(an)*17,168+Math.sin(an)*14],[x+Math.cos(an)*24,168+Math.sin(an)*20]],i%2?pale:col,w*.9,u,1)}buffDiamond(g,x,168,2,pale,w,u);break;
  case'shield':buffLine(g,[[x-25,165],[x-20,153],[x-9,148],[x,151],[x+9,148],[x+20,153],[x+25,165],[x+17,177],[x,184],[x-17,177],[x-25,165]],pale,w,u,1);buffLine(g,[[x-17,165],[x,158],[x+17,165],[x,176],[x-17,165]],col,w*.9,u,1);break;
  case'thorn':for(let s of [-1,1])for(let i=0;i<4;i++){const xx=x+s*(10+i*7),yy=177-i*7;buffLine(g,[[xx-s*3*u,yy+u],[xx,yy],[xx+s*4*u,yy-3*u]],pale,w,u,1)}break;
  case'revive':buffArc(g,x,157,23,8,Math.PI,Math.PI*2,pale,w,u,T,1);for(let i=-2;i<=2;i++){const xx=x+i*11;buffLine(g,[[xx,167],[xx+2*u,160],[xx,153],[xx-2*u,160],[xx,167]],i%2?col:mid,w*.9,u,1)}break;
  case'grove':for(let i=-2;i<=2;i++){const xx=x+i*10,yy=168-Math.abs(i)*5;buffLine(g,[[xx,196],[xx,yy]],col,w,u,1);buffDiamond(g,xx-2*u,yy+3*u,1,pale,w,u);buffDiamond(g,xx+2*u,yy-2*u,1,mid,w,u)}break;
  case'lava':for(let i=-4;i<=4;i++){const h=3+Math.floor((Math.sin(T*4+i)*1.5+1)*2);for(let j=0;j<h;j++)buffPixel(g,x+i*6*u,195-j*2*u,j%2?pale:col,w,u,2,1)}break;
  case'ambush':buffPixel(g,x,193,deep,w,u,14,3);for(let i=-2;i<=2;i++)buffLine(g,[[x+i*8,190],[x+i*8+Math.sin(T*2+i)*8,183],[x+i*8+Math.sin(T*2.5+i)*13,174]],i%2?pale:col,w*.85,u,2);break;
  case'star':for(let i=0;i<8;i++){const an=T*.25+i*Math.PI/4,xx=x+Math.cos(an)*25,yy=164+Math.sin(an)*13;buffSpark(g,xx,yy,1,i%2?pale:mid,w,u)}buffDiamond(g,x,164,2,col,w,u);break;
  case'first':buffLine(g,[[x-27,171],[x-12,169],[x+4,166],[x+22,163],[x+29,160],[x+22,157],[x+4,160]],pale,w,u,2);buffDiamond(g,x+21,163,2,col,w,u);for(let i=0;i<4;i++)buffLine(g,[[x-22,178+i*3],[x-8,176+i*3]],col,w*.8,u,1);break;
  case'weaken':for(let i=-2;i<=2;i++){const xx=x+i*11,dropY=154+((T*8+i*13)%24);buffDiamond(g,xx,dropY,1,pale,w,u);buffLine(g,[[xx,dropY+2*u],[xx,dropY+5*u]],col,w*.9,u,1)}break;
  case'judge':buffLine(g,[[x-28,177],[x-20,160],[x-12,171],[x,151],[x+12,171],[x+20,160],[x+28,177],[x-28,177]],pale,w,u,2);buffArc(g,x,177,30,9,T*.2,T*.2+Math.PI*1.75,col,w*.86,u,T,1);buffDiamond(g,x,151,1,mid,w,u);break;
 }
 /* Hạt pixel đi lên theo từng nhịp, giữ lại aura nhẹ sau lúc buff vừa kích hoạt. */
 for(let i=0;i<8;i++){const p=(T*.42+i*.125+id*.037)%1,fade=Math.sin(Math.PI*p)*al,side=Math.sin(i*2.7+id)*((18+i%3*4)*u),xx=x+side+Math.sin(T*1.4+i+id)*2*u,yy=202-p*78;
  if(i%3===0)buffDiamond(g,xx,yy,1,i%2?pale:mid,fade,u);else if(i%3===1)buffSpark(g,xx,yy,1,col,fade*.9,u);else buffPixel(g,xx,yy,pale,fade,u,2,2)}
 g.restore();
}
/* nhãn nổi trên đầu (lớp trên): nằm ở đỉnh khung, không chạm thân thú */
function bannerFx(g,x,col,txt,q,sub){
 if(q<=0||!txt)return;
 const a=Math.min(1,q*2);
 label(g,txt,x,sub?64:52,col,a,11);
}

/* ===== FX 4A: trạng thái/sự kiện vẽ trực tiếp bằng canvas + pool hạt chung ===== */
function statusKey(fx){return 'impact:'+String(fx.k||'hit')+':'+String(fx.s||0)+':'+(fx.pp?'p':'m')}
function statusHash(s){let h=2166136261;for(let i=0;i<s.length;i++)h=Math.imul(h^s.charCodeAt(i),16777619);return h>>>0}
function statusBurst(slot,key,x,y,n,o){if(FXE.once(slot,key))FXE.burst(FXE.rng(slot.seed^statusHash(key)),x,y,n,o)}
function shieldOutline(g,x,y,T,a,scale){
 if(a<=.01)return;const k=scale||1,p=.5+.5*Math.sin((T%100)*3.1+x*.03);
 g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';
 g.strokeStyle=FXE.rgba('#bff2ff',a*(.72+.18*p));g.shadowColor='#65cfff';g.shadowBlur=5;
 g.lineWidth=1.25+.45*p;g.beginPath();g.moveTo(x,y-45*k);
 g.bezierCurveTo(x+19*k,y-54*k,x+35*k,y-35*k,x+35*k,y-12*k);
 g.bezierCurveTo(x+34*k,y+14*k,x+19*k,y+34*k,x,y+43*k);
 g.bezierCurveTo(x-19*k,y+34*k,x-34*k,y+14*k,x-35*k,y-12*k);
 g.bezierCurveTo(x-35*k,y-35*k,x-19*k,y-54*k,x,y-45*k);g.stroke();
 g.strokeStyle=FXE.rgba('#71cfff',a*.55);g.lineWidth=.8;g.beginPath();
 g.moveTo(x-25*k,y-24*k);g.quadraticCurveTo(x,y-42*k,x+25*k,y-24*k);
 g.moveTo(x-28*k,y+8*k);g.quadraticCurveTo(x,y+32*k,x+28*k,y+8*k);g.stroke();
 for(let i=0;i<4;i++){const an=(T*.8+i*1.5708)%(Math.PI*2),rx=30*k,ry=39*k,px=x+Math.cos(an)*rx,py=y-3*k+Math.sin(an)*ry;
  g.globalAlpha=a*(.42+.4*Math.sin(T*3+i));g.fillStyle=i%2?'#d9f8ff':'#72d7ff';g.beginPath();g.arc(px,py,1.2,0,Math.PI*2);g.fill()}
 g.restore();
}
function bqAura(g,x,T,elapsed,side){
 const phase=(T%100)*2.4+side*1.7,pulse=.62+.38*Math.sin(phase);
 FXE.glow(g,x,185,42,'#ff513a',.22+.14*pulse,'#ffb04b');
 FXE.wave(g,x,203,27+4*pulse,'#ff6845',.26+.12*pulse,1.2,{seed:side*19+3,t:phase,sq:.2,wob:.05,core:'#ffd078'});
 g.save();g.globalCompositeOperation='lighter';
 for(let i=0;i<7;i++){
  const ph=phase+i*1.31,base=x+(i-3)*8+Math.sin(ph*.7)*3,h=25+16*(.5+.5*Math.sin(ph*1.2)),tip=base+Math.sin(ph)*7;
  const pts=FXE.curve(base,202,tip,202-h,8,3.5,1.1,ph);
  FXE.ribbon(g,pts,j=>Math.sin(Math.PI*j)*(7+(i%3)*1.6),'#ff6338',.34+.16*pulse,{core:i%2?'#ffd166':'#ff9b44',edge:'#ffb35c',edgeW:.65,add:true});
  FXE.blob(g,base,197-h*.35,7,11,'#e93128',.22+.08*pulse,ph,side*31+i,{n:9,wob:.42,speed:3,core:'#ffbc55'});
 }
 for(let i=0;i<5;i++){const p=(phase*.11+i*.217)%1,xx=x+Math.sin(phase+i*2.4)*(14+p*22),yy=197-p*(42+12*Math.sin(i));FXE.glow(g,xx,yy,3.2,'#ff9a4a',.45*(1-p),'#ffe7a3')}
 g.restore();
}
function statusStroke(g,pts,color,width,alpha){if(!pts||pts.length<2)return;g.save();g.globalCompositeOperation='lighter';g.globalAlpha=alpha;g.lineCap='round';g.lineJoin='round';g.strokeStyle=color;g.lineWidth=width;g.shadowColor=color;g.shadowBlur=4;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();g.restore()}
function statusShield(g,fx,T,q,x,y,s){
 const fa=1-q;shieldOutline(g,x,y,T,.82*fa,1.05+.08*Math.sin(T*4));FXE.wave(g,x,197,9+q*70,'#87ddff',.7*fa,1.35,{seed:s.seed,t:T,sq:.24,wob:.045,core:'#d9fbff'});FXE.glow(g,x,y+8,38,'#70ccff',.13*fa,'#d3f4ff');
 if(q>.2){for(let i=0;i<3;i++){const an=-.9+i*.9+q*1.1,rr=22+q*10,px=x+Math.cos(an)*rr,py=y+Math.sin(an)*rr*1.2;statusStroke(g,[[px-3,py-6],[px+1,py-1],[px-2,py+4],[px+4,py+8]],'#bfeeff',1.1,.7*fa)}}
 statusBurst(s,'shield',x,192,17,{speed:[18,86],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,3.1],life:[.35,.85],gy:210,drag:.5,shape:'shard',c:'#73cfff',c2:'#e1fbff',a:.9,add:true,tag:'status',vr:[-5,5],floor:204,bounce:.22});return true;
}
function statusHeal(g,fx,T,q,x,y,s,text){
 const rev=/Hồi sinh/.test(text),drain=/Hút máu/.test(text),col=rev?'#ffd166':drain?'#f15b78':'#62efaa',hi=rev?'#fff0b2':drain?'#ffb6bb':'#c8ffe0',fa=1-q,phase=(T%100)*2.2;
 FXE.wave(g,x,202,12+q*(rev?78:58),col,.78*fa,1.4,{seed:s.seed,t:phase,sq:.2,wob:.06,core:hi});FXE.glow(g,x,166,33+(rev?12:0),col,.2*fa,hi);
 if(drain){for(let i=0;i<7;i++){const a=i*.897+phase*.18,r=58-q*34+Math.sin(phase+i)*4,pts=FXE.curve(x+Math.cos(a)*r,174+Math.sin(a)*r*.55,x+Math.cos(a+.8)*10,153+Math.sin(a+.8)*10,9,6,1.1,phase+i);FXE.ribbon(g,pts,j=>Math.sin(Math.PI*j)*(5-j*2.2),col,.26*fa,{core:hi,edge:hi,edgeW:.7,add:true})}}
 else{for(let i=0;i<(rev?7:5);i++){const p=(phase*.08+i/(rev?7:5))%1,xx=x+Math.sin(phase*.6+i*2.4)*(12+8*p),yy=198-p*(rev?94:78),sz=(rev?6:4)+2*Math.sin(phase+i);FXE.blob(g,xx,yy,sz,sz*1.5,col,.34*fa*(.5+.5*Math.sin(phase+i)),phase,s.seed+i,{n:9,wob:.5,speed:2,core:hi})}}
 if(rev){for(let i=0;i<8;i++){const an=i*Math.PI/4+phase*.14,len=28+18*Math.sin(phase+i);statusStroke(g,[[x+Math.cos(an)*14,159+Math.sin(an)*9],[x+Math.cos(an)*len,159+Math.sin(an)*len*.38]],col,1.2,.45*fa)}}
 statusBurst(s,'heal',x,190,rev?30:18,{speed:[20,100],ang:[-Math.PI*.91,-Math.PI*.09],size:[1.3,3.4],life:[.45,1.05],gy:-52,drag:.55,shape:rev?'petal':'spark',c:col,c2:hi,a:.92,add:true,tag:'status',vr:[-4,4]});
 if(drain)statusBurst(s,'drain',x,157,12,{speed:[24,76],ang:[0,Math.PI*2],size:[1.4,2.8],life:[.3,.7],gy:10,drag:1.1,shape:'mist',c:col,c2:hi,a:.55,add:true,tag:'status'});return true;
}
function statusFire(g,fx,T,q,x,y,s,text){
 const lava=/Dung Nham|Xích Diệm/.test(text),fa=1-q,phase=(T%100)*2.7,scale=lava?1.28:1,env=(.38+.62*FXE.eOut(FXE.ph(q,0,.16)))*(1-FXE.ph(q,.66,1));
 FXE.glow(g,x,195,42*scale,'#fa4b27',.23*env,'#ff9d45');g.save();g.globalCompositeOperation='lighter';g.globalAlpha=.28*fa;
 const ash=g.createRadialGradient(x,201,2,x,201,42*scale);ash.addColorStop(0,'rgba(120,35,20,.45)');ash.addColorStop(.55,'rgba(66,34,37,.27)');ash.addColorStop(1,'rgba(20,20,28,0)');g.fillStyle=ash;g.beginPath();g.ellipse(x,202,42*scale,8*scale,0,0,Math.PI*2);g.fill();g.restore();
 FXE.wave(g,x,201,10+q*(lava?98:70),'#ff7137',.68*fa,1.5,{seed:s.seed,t:phase,sq:.18,wob:.07,core:'#ffd166'});
 for(let i=0;i<(lava?9:7);i++){const base=x+(i-(lava?4:3))*7.5,osc=Math.sin(phase+i*1.8),h=(22+((i*13)%29)+12*osc)*scale*env,tip=base+Math.sin(phase*.7+i)*6,pts=FXE.curve(base,202,tip,202-h,9,4+2*osc,1.15,phase+i*1.7);
  FXE.ribbon(g,pts,t=>Math.sin(Math.PI*t)*(8+(i%3)*1.8)*scale,lava?'#ff542b':'#ff7137',(.33+.12*(i%2))*fa,{core:i%2?'#ffd46b':'#fff0a8',edge:'#ffae4d',edgeW:.8,add:true});if(i%2===0)FXE.blob(g,base,197-h*.25,7,12,'#e83a2d',.17*env,phase,s.seed+i,{n:9,wob:.46,speed:3,core:'#ffd071'})}
 for(let i=0;i<4;i++){const p=(phase*.06+i*.24)%1;FXE.blob(g,x+Math.sin(phase+i)*28,184-p*28,8+p*4,11+p*4,'#352634',.11*fa*(1-p),phase,s.seed+40+i,{n:8,wob:.38,speed:1.4,core:'#8c4a3d',add:false})}
 statusBurst(s,'fire',x,193,lava?26:18,{speed:[24,lava?135:96],ang:[-Math.PI*.94,-Math.PI*.06],size:[1.5,3.5],life:[.4,1.15],gy:135,drag:.42,shape:'spark',c:'#ff6235',c2:'#ffd16b',a:.95,add:true,tag:'status',vr:[-8,8],floor:204,bounce:.26});return true;
}
function statusLightning(g,fx,T,q,x,y,s){
 const fa=1-q,phase=Math.floor((T%100)*14),r=FXE.rng(s.seed^phase),top=38+Math.sin(T%6*2)*5,pts=FXE.jag(r,x-7,top,x,202,13,8),col='#ffe45d';
 FXE.glow(g,x,192,34,'#ffd43b',.24*fa,'#fff0a0');statusStroke(g,pts,'#ffba42',7,.23*fa);statusStroke(g,pts,col,3.1,.78*fa);statusStroke(g,pts,'#fff2aa',1.15,.55*fa);
 for(let i=0;i<4;i++){const p=FXE.ph(q,.03+i*.07,.26+i*.08);if(p>.02){const idx=Math.max(1,Math.min(pts.length-2,Math.floor((1-p)*(pts.length-1)))),a=pts[idx],br=FXE.jag(FXE.rng(s.seed^phase^(i*77)),a[0],a[1],a[0]+(i%2?1:-1)*(20+12*p),a[1]+22+8*p,5,5);statusStroke(g,br,'#ffe77e',1.5,.52*fa)}}
 FXE.wave(g,x,201,9+q*88,'#ffd84d',.68*fa,1.3,{seed:s.seed,t:T,sq:.19,wob:.045,core:'#fff1a6'});
 if(q>.24){g.save();g.globalCompositeOperation='source-over';g.globalAlpha=.16*(1-FXE.ph(q,.25,.9));g.fillStyle='#3c2d24';g.beginPath();g.ellipse(x,203,18+q*16,3+q*2,0,0,Math.PI*2);g.fill();g.restore()}
 statusBurst(s,'bolt',x,197,24,{speed:[28,130],ang:[-Math.PI*.98,-Math.PI*.02],size:[1.2,2.9],life:[.3,.78],gy:260,drag:.48,shape:'spark',c:'#ffe45d',c2:'#fff2ad',a:1,add:true,tag:'status',vr:[-7,7],floor:204,bounce:.18});return true;
}
function statusCounter(g,fx,T,q,x,y,s){
 const fa=1-q,dir=fx.pp?1:-1,col='#ffa3a2',phase=(T%100)*2.1;FXE.wave(g,x,194,13+q*72,'#ffcc77',.62*fa,1.2,{seed:s.seed,t:phase,sq:.2,wob:.06,core:'#ffe7ae'});
 for(let i=0;i<5;i++){const side=i%2?1:-1,pts=FXE.curve(x-dir*side*58,174+(i-2)*12,x+dir*side*24,147+(i-2)*6,12,8+2*Math.sin(phase+i),1.5,phase+i*1.7);FXE.ribbon(g,pts,t=>Math.sin(Math.PI*t)*(9-i*.7),col,(.29+i%2*.08)*fa,{core:'#ffe8b8',edge:'#ffd16b',edgeW:.7,add:true})}
 FXE.glow(g,x,156,28,'#fa7180',.17*fa,'#ffe2bb');statusBurst(s,'counter',x,164,20,{speed:[26,112],ang:[-Math.PI*.9,-Math.PI*.1],size:[1.3,3.2],life:[.35,.92],gy:190,drag:.52,shape:'spark',c:'#ff9a92',c2:'#ffe38b',a:.95,add:true,tag:'status',vr:[-8,8],floor:204,bounce:.18});return true;
}
function statusFreeze(g,fx,T,q,x,y,s){
 const fa=1-q,phase=(T%100)*1.7,freeze=/đóng băng|băng|đông cứng/i.test(fx.text||''),col=freeze?'#8fe8ff':'#ffe06a';
 if(freeze){FXE.glow(g,x,157,38,'#55cafa',.17*fa,'#dffaff');for(let i=0;i<7;i++){const a=i*6.283/7+phase*.2,rx=31+(i%3)*3,ry=37+(i%2)*5,px=x+Math.cos(a)*rx,py=157+Math.sin(a)*ry;
  if(i%2===0)FXE.crystal(g,px,py+6,8+2*(i%3),15+5*(i%3),Math.sin(phase+i)*3,{dark:'#347fa6',mid:'#65caeb',light:'#c9f7ff',edge:'#e8ffff'},.48*fa,{crack:FXE.ph(q,.12,.5),shine:.5+.5*Math.sin(phase+i)});
  else{const pts=FXE.curve(px,py+7,px+Math.sin(phase+i)*5,py-12,7,3,1,phase+i);FXE.ribbon(g,pts,t=>Math.sin(Math.PI*t)*3,'#8fe8ff',.45*fa,{core:'#e6ffff',edge:'#d7faff',edgeW:.8,add:true})}}
  FXE.wave(g,x,199,12+q*68,col,.63*fa,1.3,{seed:s.seed,t:phase,sq:.2,wob:.04,core:'#e6ffff'});statusBurst(s,'freeze',x,166,20,{speed:[16,78],ang:[-Math.PI*.95,-Math.PI*.05],size:[1.4,3.2],life:[.45,1],gy:96,drag:.5,shape:'flake',c:'#8fe8ff',c2:'#ffffff',a:.9,add:true,tag:'status',vr:[-3,3],floor:204,bounce:.18})}
 else{for(let i=0;i<5;i++){const a=phase+i*1.2566,px=x+Math.cos(a)*31,py=116+Math.sin(a)*5;FXE.glow(g,px,py,8,'#ffe45d',.35*fa,'#fff1a0');statusStroke(g,[[px-4,py+3],[px,py-4],[px+4,py+3]],'#ffe45d',1.6,.7*fa)}statusBurst(s,'stun',x,116,12,{speed:[16,76],ang:[-Math.PI,0],size:[1.4,2.8],life:[.35,.8],gy:68,drag:.65,shape:'spark',c:'#ffd94d',c2:'#fff0a2',a:.9,add:true,tag:'status',vr:[-5,5]})}return true;
}
function statusMiss(g,fx,T,q,x,y,s){
 const fa=1-q,dir=fx.pp?1:-1,phase=(T%100)*2;FXE.wave(g,x+dir*q*20,158,8+q*38,'#7fe8ff',.48*fa,1.1,{seed:s.seed,t:phase,sq:.56,wob:.04,core:'#dffaff'});
 for(let i=0;i<6;i++){const yy=y-35+i*12,shift=Math.sin(phase+i)*4,len=22+(i%3)*10,qx=x-dir*(10+q*24)+shift,pts=FXE.curve(qx,yy,qx-dir*len,yy+Math.sin(phase+i)*3,6,2,1,phase+i);FXE.ribbon(g,pts,t=>Math.sin(Math.PI*t)*(2.5-i%2*.5),'#8fe8ff',.32*fa,{core:'#eaffff',add:true})}
 statusBurst(s,'miss',x,196,10,{speed:[14,55],ang:[-Math.PI*.92,-Math.PI*.08],size:[1.1,2.6],life:[.3,.62],gy:190,drag:.8,shape:'mist',c:'#86eaff',c2:'#edffff',a:.58,add:true,tag:'status'});return true;
}
function statusCrit(g,fx,T,q,x,y,s,z){
 const fa=1-q,col=(z&&z.color)||'#ffd24a',phase=(T%100)*2.8;FXE.glow(g,x,155,48,'#e34440',.23*fa,'#ff8a64');FXE.glow(g,x,155,32,col,.28*fa,'#ffe7a0');FXE.wave(g,x,198,10+q*78,col,.66*fa,1.5,{seed:s.seed,t:phase,sq:.21,wob:.055,core:'#fff0a8'});
 for(let i=0;i<4;i++){const side=i%2?1:-1,pts=FXE.curve(x-side*45,112+i*14,x+side*42,196-i*8,9,5,1.4,phase+i);FXE.ribbon(g,pts,t=>Math.sin(Math.PI*t)*(6-i*.6),col,(.32+i*.04)*fa,{core:'#fff0a7',edge:'#ffd45b',edgeW:.75,add:true})}
 statusBurst(s,'crit',x,155,26,{speed:[32,148],ang:[-Math.PI*.96,-Math.PI*.04],size:[1.4,3.4],life:[.35,.9],gy:250,drag:.46,shape:'spark',c:col,c2:'#ffe89a',a:.95,add:true,tag:'status',vr:[-9,9],floor:204,bounce:.22});return true;
}
function statusImpact(g,fx,T,z,text,q,target,y){
 const s=FXE.seed(statusKey(fx),q);
 if(fx.k==='block'||/Khiên hấp thụ|Chắn đòn/.test(text))return statusShield(g,fx,T,q,target,y,s);
 if(fx.k==='heal'||/hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh|Hút máu/i.test(text))return statusHeal(g,fx,T,q,target,y,s,text);
 if(/Lôi Phạt|Lôi Kích\s*-/.test(text))return statusLightning(g,fx,T,q,target,y,s);
 if(/Dung Nham|Thiêu đốt|Xích Diệm/.test(text))return statusFire(g,fx,T,q,target,y,s,text);
 if(/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text))return statusCounter(g,fx,T,q,target,y,s);
 if(fx.k==='stun')return statusFreeze(g,fx,T,q,target,y,s);
 if(fx.k==='miss')return statusMiss(g,fx,T,q,target,y,s);
 if(fx.k==='crit')return statusCrit(g,fx,T,q,target,y,s,z);
 return null;
}
function drawLavaAttackCode(g,T,S){
 const u=clamp(S.u||0,0,1),pa=!!S.pa,dir=pa?1:-1,sx=pa?112:248,tx=pa?255:105,p=clamp((u-.18)/.7,0,1),x=sx+(tx-sx)*FXE.eOut(p),phase=(T%100)*2.5,fade=1-FXE.ph(p,.82,1),slot=FXE.seed('special-lava:'+(pa?'p':'m'),u),r=FXE.rng(slot.seed^0x1a7);
 FXE.wave(g,x,201,16+36*FXE.eOut(p),'#ff6534',.56*fade,1.6,{seed:slot.seed,t:phase,sq:.16,wob:.07,core:'#ffd166'});FXE.glow(g,x,195,32,'#f34a28',.23*fade,'#ffb64a');
 for(let i=0;i<6;i++){const bx=x-dir*(i*12),h=16+22*(.5+.5*Math.sin(phase+i*1.8))*fade,pts=FXE.curve(bx,203,bx+Math.sin(phase+i)*5,203-h,7,3,1.1,phase+i);FXE.ribbon(g,pts,t=>Math.sin(Math.PI*t)*(6-i*.45),'#ff6a32',.36*fade,{core:'#ffe080',edge:'#ff9d48',edgeW:.7,add:true})}
 if(u>=.35&&FXE.once(slot,'hit'))FXE.burst(r,x,194,17,{speed:[25,110],ang:[-Math.PI*.96,-Math.PI*.04],size:[1.5,3.1],life:[.4,.9],gy:130,drag:.5,shape:'spark',c:'#ff6336',c2:'#ffe07a',a:.9,add:true,tag:'status',vr:[-7,7],floor:204,bounce:.2});return true;
}
function drawLightningAttackCode(g,T,S){
 const u=clamp(S.u||0,0,1),pa=!!S.pa,x=pa?255:105,p=clamp((u-.22)/.5,0,1),slot=FXE.seed('special-lightning:'+(pa?'p':'m'),u),phase=(T%100)*2.4,charge=1-FXE.ph(p,.12,.3),strike=FXE.ph(p,.22,.3)*(1-FXE.ph(p,.52,.92));
 FXE.blob(g,x,48,24+10*charge,10+5*charge,'#6673a8',.28*charge,phase,slot.seed,{n:12,wob:.28,speed:2,core:'#dddafa',add:false});FXE.glow(g,x,116,29,'#ffd951',.17*charge,'#fff0a1');
 if(strike>.01){const r=FXE.rng(slot.seed^Math.floor(phase*5)),pts=FXE.jag(r,x-5,54,x,201,12,7);statusStroke(g,pts,'#ffbe45',8,.22*strike);statusStroke(g,pts,'#ffe45d',3.4,.82*strike);statusStroke(g,pts,'#fff1a5',1,.5*strike);
  for(let i=0;i<3;i++){const b=FXE.jag(FXE.rng(slot.seed^i*91),x,193,x+(i-1)*28,200,5,4);statusStroke(g,b,'#ffdd57',1.5,.55*strike)}FXE.wave(g,x,201,12+30*FXE.eOut(p),'#ffd54a',.55*strike,1.3,{seed:slot.seed,t:phase,sq:.2,wob:.04,core:'#fff0a0'});
  if(FXE.once(slot,'bolt'))FXE.burst(FXE.rng(slot.seed^0x51),x,194,18,{speed:[32,128],ang:[-Math.PI*.97,-Math.PI*.03],size:[1.3,2.8],life:[.3,.75],gy:250,drag:.5,shape:'spark',c:'#ffe45d',c2:'#fff0a0',a:1,add:true,tag:'status',vr:[-7,7],floor:204,bounce:.18})}return true;
}

/* ---- THÁM HIỂM: lớp NỀN (gọi trước khi vẽ thú) ---- */
function drawBack(g,T,elapsed,i,R,shP,shM,hp,mh,petSp,hold){
 const z=zone(i),zp=zone(petSp==null?currentPetZone:petSp),h=Math.max(0,hold||0),e=Math.max(0,elapsed-Math.max(0,h-.6)),q=elapsed<Math.max(0,h-.6)?0:clamp(1-e/BUFFSEC,0,1),pulse=.55+.45*Math.sin(T*5);
 groundRing(g,85,zp.color,.2+.16*pulse,T);groundRing(g,272,z.color,.1+.1*pulse,T);
 if(R&&R.zoneBuff){backZone(g,272,z,q,T,e,BUFFSH[R.zoneBuff.stat],1,R.zoneBuff.stat);if(q<=0)auraBack(g,272,z.color,T,.2)}
 if(R&&R.startBuffs&&R.startBuffs.length){backGear(g,85,R.startBuffs[0].kind,q,T,e)}
 /* Bất khuất: dưới 50% máu thì ngọn lửa đỏ bừng sau lưng (nằm sau thú, không đè) */
 if(R&&R.bqP>0&&hp>0&&hp<R.maxP*.5)bqAura(g,85,T,elapsed,0);
 if(R&&R.bqM>0&&mh>0&&mh<R.maxM*.5)bqAura(g,272,T,elapsed,1);
}
function auraBack(g,x,col,T,a){glow(g,x,176,58,col,a*1.4*(.6+.4*Math.sin(T*3)))}
/* ---- THÁM HIỂM: lớp TRÊN (sau khi vẽ thú): nhãn + khiên viền mảnh + bảng thông tin ---- */
function drawField(g,T,elapsed,i,R,shP,shM,hp,mh,petSp,hold){
 const z=zone(i),zp=zone(petSp==null?currentPetZone:petSp),h=Math.max(0,hold||0),e=Math.max(0,elapsed-Math.max(0,h-.6)),q=elapsed<Math.max(0,h-.6)?0:clamp(1-e/BUFFSEC,0,1),pulse=.55+.45*Math.sin(T*5);
 if(R&&R.zoneBuff)bannerFx(g,272,z.color,'✦ '+R.zoneBuff.label,q,0);
 if(R&&R.startBuffs&&R.startBuffs.length)bannerFx(g,85,gearCol(R.startBuffs[0].kind),'✦ BỘ TRANG BỊ',q,0);
 infoPanels(g,z,zp,R);
 if(shP>0)shieldOutline(g,85,157,T,.48+.16*pulse,1);
 if(shM>0)shieldOutline(g,272,157,T,.43+.16*pulse,1);
 FXE.draw(g,'status');
}
/* ---- ĐẤU TRƯỜNG: buff vùng của 2 thú. bP/bM = {stat,text} từ 26-arena.js ---- */
function drawArenaBack(g,T,t,spP,spM,bP,bM){
 const q=clamp(1-Math.max(0,t)/BUFFSEC,0,1),e=Math.max(0,t);
 groundRing(g,85,zone(spP).color,.28,T);groundRing(g,272,zone(spM).color,.2,T);
 [[85,spP,bP],[272,spM,bM]].forEach(a=>{
  const b=a[2];if(!b||!b.text)return;
  const z=zone(a[1]);
  backZone(g,a[0],z,q,T,e,BUFFSH[b.stat],1,b.stat);
  if(q<=0)auraBack(g,a[0],z.color,T,.22);
 });
}
function drawArenaBuffs(g,T,t,spP,spM,bP,bM){
 const q=clamp(1-Math.max(0,t)/BUFFSEC,0,1);
 [[85,spP,bP],[272,spM,bM]].forEach(a=>{const b=a[2];if(b&&b.text)bannerFx(g,a[0],zone(a[1]).color,'✦ '+b.text,q,0)});
 FXE.draw(g,'status');
}
/* Trọng tài đếm: số 3-2-1 to giữa sân, mỗi nhịp phóng to rồi thu nhỏ; hết CD thì hô CHIẾN! */
function drawCountdown(g,T,CD,tick,N){
 const out=T>=CD,k=out?clamp((T-CD)/.7,0,1):(T%tick)/tick,n=out?0:N-Math.floor(T/tick);
 if(!out&&(n<1||n>N))return;
 const txt=out?'CHIẾN!':String(n),sc=out?1.15+.35*k:1.5-.5*Math.min(1,k*3),al=out?1-k*k:1;
 g.save();g.globalAlpha=al;g.textAlign='center';g.textBaseline='middle';g.font='bold '+Math.round(38*sc)+'px monospace';
 g.lineWidth=7;g.lineJoin='round';g.strokeStyle='#160e1c';g.strokeText(txt,180,128);
 g.fillStyle=out?'#ff6a3a':n===1?'#ffd24a':'#fff0bd';g.fillText(txt,180,128);
 g.restore()}
function attackMode(z,text){
 if(/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text||''))return'melee';
 if(/Lôi Phạt giáng|Dung Nham Phun Trào/.test(text||''))return'ranged';
 return z.mode;
}
/* drawAttack: giữ nguyên cách vẽ gốc của đòn thường (33-attack-fx.js bọc hàm này để tô màu/đổi quỹ đạo theo 17 vùng).
   Chỉ có đòn đặc biệt (dung nham, Lôi Phạt) được làm to, rõ hơn vì 33 giao lại cho hàm này. */
function drawAttack(g,T,S){
 const z=getZone(S.s),u=S.u||0,pa=!!S.pa,dir=pa?1:-1,text=S.text||'',mode=attackMode(z,text);
 const sx=pa?112:248,tx=pa?255:105,ty=148;
 if(/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng/.test(text)){
  const p=clamp((u-.18)/.7,0,.9999);
  return paint(g,LAVA,p,tx,190,112,106,'#ff632d',.95,false,0,.8,12)||u>.42;
 }
 if(/Lôi Phạt giáng/.test(text)){
  const p=clamp((u-.22)/.5,0,.9999);
  return paint(g,LIGHTNING,p,tx,142,116,112,'#ffe53a',.98,false,0,.55,12)||u>.42;
 }
 if(mode==='ranged'){
  if(u<.18){
   if(u>.035){const charge=clamp((u-.035)/.145,0,1),asset=frame(z.attack,charge*.3);
    if(asset.complete)paint(g,z.attack,charge*.3,sx,ty,28+charge*18,28+charge*18,z.color,.55+charge*.35,false,T*.7)}
   return true;
  }
  if(u<.43){
   const f=clamp((u-.18)/.25,0,1),x=sx+(tx-sx)*f,y=ty-Math.sin(f*Math.PI)*18;
   return paint(g,z.attack,f,x,y,80,54,z.color,S.miss?.88:1,!pa,0)||u>.39;
  }
  return true;
 }
 if(u>=.23&&u<.6){
  const f=clamp((u-.23)/.37,0,1);
  return paint(g,z.attack,f,tx,ty,104,86,z.color,S.miss?.8:1,!pa,(pa?1:-1)*(f-.5)*.18)||u>.42;
 }
 return u>=.6;
}
/* drawImpact: bước 3 — hiệu ứng to, rõ cho khiên, hồi sức/hồi sinh, chí mạng, né, thiêu đốt, phản đòn, choáng, buff bộ trang bị.
   Đòn trúng thường: sprite vẽ như gốc, hạt theo vùng do 33-attack-fx.js thêm (không vẽ trùng ở đây). */
function drawImpact(g,fx,T){
 const z=getZone(fx.s),text=fx.text||'',q=clamp(fx.q||0,0,.9999),
  target=(fx.k==='block'||fx.k==='heal'||fx.k==='stun')?(fx.pp?90:270):(fx.pp?272:90),y=150,seed=(fx.i||0)*31+(fx.s||0)*7;
 let dir=fx.pp?1:-1;
 const fa=1-q;
 const coded=statusImpact(g,fx,T,z,text,q,target,y);if(coded!==null)return coded;
 /* KHIÊN: vòm lớn, sóng lan, mảnh vỡ */
 if(fx.k==='block'||/Khiên hấp thụ|Chắn đòn/.test(text)){
  const a=paint(g,SHIELD,q,target,y,120+q*22,134+q*22,'#8fd0ff',Math.max(.28,1-q),false,0,.25,11);
  ring(g,target,y+14,30+q*74,20+q*48,'#8fd0ff',.85*fa,3);
  ring(g,target,y+14,16+q*46,11+q*30,'#ffffff',.6*fa,1.5);
  if(q>.2)spray(g,target,y,'#bfe6ff','shard',12,(q-.2)/.8,64,seed,0);
  return a;
 }
 /* HỒI SỨC / SINH CƠ / HỒI SINH: cột sáng, vòng chân, hạt bay lên */
 if(fx.k==='heal'||/hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh/.test(text)){
  const rev=/Hồi sinh/.test(text),drain=/Hút máu/.test(text),hc=rev?'#ffe27a':drain?'#ff4a6a':'#8be04a',sz=rev?1.4:1.1;
  if(drain){                                   /* HÚT MÁU: giọt máu xoáy hút vào người đánh, vòng đỏ co lại */
   for(let i=0;i<18;i++){const an=rnd(seed+i*5)*6.283+q*5,r=(1-q)*(46+rnd(seed+i)*30)+4;mote(g,'soul',target+Math.cos(an)*r,y+Math.sin(an)*r*.8,2+rnd(seed+i*3)*2,hc,Math.min(1,q*4)*fa*1.4,an)}
   ring(g,target,y+20,(1-q)*60+8,(1-q)*30+5,hc,.9*fa+.1,2.5);
   glow(g,target,y,56,hc,.35*Math.sin(Math.min(1,q*1.4)*3.14));
   label(g,'HÚT MÁU',target,y-62-q*14,hc,fa*1.4,11);
   return paint(g,HEAL,q,target,y,86,84,hc,Math.max(.3,1-q*.6),false,0,.9,11);
  }
  pillar(g,target,y+46,(rev?58:38)*Math.sin(Math.min(1,q*3)*1.57),130*sz,hc,.5*fa);
  const a=paint(g,HEAL,q,target,y,98*sz,96*sz,hc,Math.max(.3,1-q*.6),false,0,.2,11);
  ring(g,target,y+46,(18+q*56)*sz,(5+q*15)*sz,hc,.9*fa,2.5);
  for(let i=0;i<(rev?24:15);i++)mote(g,'star',target+(rnd(seed+i*5)-.5)*72*sz,y+48-q*(50+rnd(seed+i)*64)*sz,2+rnd(seed+i*7)*2.4,hc,fa*1.1,T*2+i);
  if(rev){rays(g,target,y,14,20,52+q*64,'#ffe27a',.55*fa,T*.8,2);ring(g,target,y+46,(30+q*90),(9+q*26),'#ffffff',.6*fa,2)}
  return a;
 }
 let d=z.attack,w=82,h=72,c=z.color,tn=0,glowN,kind='hit';
 if(/Lôi Phạt|Lôi Kích -/.test(text)){d=LIGHTNING;w=118;h=104;c='#ffe53a';tn=.55;glowN=12;kind='bolt'}
 else if(/Dung Nham|Thiêu đốt|Xích Diệm/.test(text)){d=LAVA;w=108;h=104;c='#ff632d';tn=.8;glowN=12;kind='burn'}
 else if(/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text)){w=96;h=78;dir=-dir;kind='counter'}
 else if(fx.k==='stun'){d=LIGHTNING;w=84;h=84;c='#ffe53a';tn=.55;glowN=10;kind='stun'}
 else if(fx.k==='miss'){w=88;h=68;kind='miss'}
 const f=q<.35?q/.35:Math.min(.999,(q-.35)/.65);
 const ok=paint(g,d,f,target,y,w,h,c,Math.max(.2,1-q*.82),dir<0,dir*.12,tn,glowN);
 if(kind==='counter'){                                                     /* phản đòn: vòng vàng co lại = sức đòn dội ngược */
  ring(g,target,y+6,12+q*62,8+q*42,'#ffd24a',.9*fa,3);
  ring(g,target,y+6,(1-q)*70+6,(1-q)*46+4,'#ffffff',.7*fa,2);
  rays(g,target,y,10,10,34+q*54,'#ffd24a',.6*fa,0,2);
  spray(g,target,y,'#ffd24a','spark',10,q,58,seed,0);
 }
 if(kind==='bolt'){glow(g,target,y,70,'#ffe53a',.5*Math.max(0,1-q*2.2));spray(g,target,y,'#fff6a0','bolt',10,q,60,seed,0)}
 if(kind==='burn'){for(let i=0;i<12;i++){const ph=(q*1.6+i*.09)%1;mote(g,'ember',target+(rnd(seed+i)-.5)*54,y+44-ph*80,2+rnd(seed+i*3)*2.4,i%2?'#ffb04a':'#ff632d',(1-ph)*fa*1.6,i)}}
 if(kind==='stun'){for(let i=0;i<4;i++){const an=T*5+i*1.571;mote(g,'star',target+Math.cos(an)*28,y-48+Math.sin(an)*8,3.4,'#ffe45a',1-q*.5,an)}}
 if(kind==='miss'){                                                        /* NÉ: vệt gió + sóng xanh */
  for(let k=0;k<6;k++){const yy=y-34+k*13,l=26+rnd(seed+k)*30,x0=target-dir*(8+q*30);g.save();g.globalAlpha=(1-q)*.7;g.strokeStyle='#cfefff';g.lineWidth=2;g.beginPath();g.moveTo(x0,yy);g.lineTo(x0-dir*l,yy);g.stroke();g.restore()}
  ring(g,target+dir*q*14,y+6,16+q*30,30,'#7fe8ff',.5*fa,2);
 }
 if(ok&&/Xuyên giáp/.test(text)){                                          /* XUYÊN GIÁP: 3 mũi xuyên thẳng qua mục tiêu, mảnh giáp vỡ văng ra */
  const L=40+Math.min(1,q*3.5)*74;
  g.save();g.globalAlpha=Math.min(1,fa*2.2);g.lineCap='round';g.shadowColor='#cfe0f0';g.shadowBlur=8;
  [-11,0,11].forEach((oy,k)=>{const x0=target-dir*(L*.55+4),x1=target+dir*(L*.5+14),gr=g.createLinearGradient(x0,0,x1,0);
   gr.addColorStop(0,'rgba(207,224,240,0)');gr.addColorStop(.6,'#e8f2fa');gr.addColorStop(1,'#ffffff');
   g.strokeStyle=gr;g.lineWidth=k===1?3.4:2.2;g.beginPath();g.moveTo(x0,y+oy*(1-q*.5));g.lineTo(x1,y+oy*.35);g.stroke()});
  g.restore();
  ring(g,target,y,8+q*38,8+q*38,'#cfe0f0',.8*fa,2);
  if(q>.15)spray(g,target+dir*10,y,'#9fb4c8','shard',10,(q-.15)/.85,56,seed+17,0);
  label(g,'XUYÊN GIÁP',target,y-58-q*10,'#e8f2fa',fa*1.5,11);
 }
 if(ok&&/Liên kích -/.test(text)){                                          /* LIÊN KÍCH: hai nhát chém chéo bồi thêm */
  const e=Math.min(1,q*4);
  g.save();g.globalAlpha=Math.min(1,fa*2);g.strokeStyle='#ffe45a';g.shadowColor='#ffe45a';g.shadowBlur=9;g.lineCap='round';
  [[-1,1,0],[1,1,.12]].forEach(a=>{const k=Math.max(0,Math.min(1,(e-a[2])/(1-a[2]))),L=44*k;g.lineWidth=3.2-q*1.6;g.beginPath();g.moveTo(target-a[0]*L,y-L*.9);g.lineTo(target+a[0]*L,y+L*.9);g.stroke()});
  g.restore();
  spray(g,target,y,'#fff6a0','spark',9,q,50,seed+23,0);
  label(g,'LIÊN KÍCH',target,y-58-q*10,'#ffe45a',fa*1.5,11);
 }
 if(ok&&/Phong Nhận(?: chém| -)/.test(text)){                               /* PHONG NHẬN: ba lưỡi gió cong quét ngang, lá bay */
  g.save();g.lineCap='round';g.shadowColor='#7affc0';g.shadowBlur=8;
  for(let k=0;k<3;k++){const r=24+k*15+q*26,a=Math.min(1,fa*2)*(1-k*.18);
   g.globalAlpha=a;g.strokeStyle=k===0?'#e8fff4':'#7affc0';g.lineWidth=3.2-k*.8;
   g.beginPath();g.arc(target-dir*(18+q*28),y+(k-1)*4,r,dir>0?-.95:Math.PI-.95+.0,dir>0?.95:Math.PI+.95);g.stroke()}
  g.restore();
  spray(g,target,y,'#a0ffd0','leaf',11,q,60,seed+31,1);
  label(g,'PHONG NHẬN',target,y-58-q*10,'#a0ffd0',fa*1.5,11);
 }
 const proc=gearProc(text);                                                /* buff bộ trang bị kích hoạt */
 if(ok&&proc){
  paint(g,proc.asset,q,target,y-6,104,98,proc.color,Math.max(.3,.9-q*.7),false,0,.25,11);
  ring(g,target,y+6,20+q*58,14+q*38,proc.color,.8*fa,2.5);
  spray(g,target,y-6,proc.color,'star',8,q,50,seed+99,1);
 }
 if(ok&&fx.k==='crit'){                                                    /* CHÍ MẠNG: chớp + tia vàng + vòng đôi */
  glow(g,target,y,80,'#ffd24a',.55*Math.max(0,1-q*2.4));
  rays(g,target,y,16,14,40+q*84,'#ffd24a',.85*fa,T,3);
  ring(g,target,y,14+q*70,14+q*70,'#ffd24a',.85*fa,3);
  ring(g,target,y,8+q*42,8+q*42,'#ffffff',.7*fa,2);
 }
 return ok;
}
window.TTGCombatFX={
 zones:ZONES,getZone,getStartBuffs,begin,drawBack,drawField,drawArenaPanels,drawArenaBack,drawArenaBuffs,drawCountdown,drawAttack,drawImpact,engine:FXE
};
})();
