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
/* Hạt đặc trưng theo loại buff vùng */
const BUFFSH={atk:'ember',def:'shard',spd:'streak',mag:'star',eva:'streak',crit:'spark',regen:'leaf',hp:'petal'};
const BUFFSEC=2.4;   /* giây hiệu ứng bật buff rõ rồi mờ dần thành quầng nhẹ */
/* ===== HIỆU ỨNG BUFF — QUY TẮC: tất cả vẽ TRƯỚC thú (lớp nền, gọi từ drawBack/drawArenaBack) nên thú luôn nằm trên,
   hiệu ứng chỉ lộ ra quanh người. Lớp trên (drawField/drawArenaBuffs) chỉ còn chữ nhãn + viền khiên mảnh. Không có ảnh nào đè lên thân thú. =====
   BUFF VÙNG   = ảnh nhóm 1 của vùng đó (z.field), màu vùng, hạt theo chỉ số.
   BUFF BỘ TRANG BỊ = ngọn lửa aura nhóm 2, mỗi bộ 1 màu (GEAR_AURA). Hai loại KHÔNG dùng chung ảnh. */
function groundRing(g,x,col,a,T,r){
 g.save();g.globalAlpha=a;g.strokeStyle=col;g.lineWidth=2;g.setLineDash([5,4]);g.lineDashOffset=-T*16;
 g.beginPath();g.ellipse(x,204,(r||36)+Math.sin(T*2)*2,7+Math.sin(T*2)*1.2,0,0,Math.PI*2);g.stroke();
 g.setLineDash([]);g.globalAlpha=a*.45;g.lineWidth=1;
 for(let k=0;k<5;k++){const an=T*.7+k*Math.PI*2/5;g.fillStyle=col;g.fillRect(x+Math.cos(an)*((r||36)-7)-1,202+Math.sin(an)*6-1,3,3)}
 g.restore();
}
/* buff vùng, lớp nền: quầng + vòng dưới chân + ảnh vùng phía SAU thú + hạt bay lên */
function backZone(g,x,z,q,T,e,shape,k){
 if(q<=0)return;k=k||1;
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
/* buff bộ trang bị, lớp nền: ngọn lửa aura sau lưng thú, đậm lúc bật rồi còn lại quầng nhạt */
function backGear(g,x,kind,q,T,e){
 const col=gearCol(kind),art=gearArt(kind),a=q>0?Math.min(1,q*1.8):0,rest=.34+.1*Math.sin(T*4);
 const al=Math.max(rest,.85*a);
 glow(g,x,176,66,col,.12+.26*a);
 ring(g,x,204,38+Math.sin(T*2)*2,8,col,.35+.5*a,2);
 paint(g,art,(T*3.2)%1,x,166,(88+30*a)*1.18,(100+34*a)*1.18,col,al,false,0,.18,10);
 if(a>0)for(let i=0;i<10;i++){const ph=(T*.8+i*.1)%1;mote(g,'spark',x+(rnd(i*7.3)-.5)*60,206-ph*96,1.8+rnd(i)*1.8,col,Math.sin(ph*3.1416)*a,T*2+i)}
}
/* nhãn nổi trên đầu (lớp trên): nằm ở đỉnh khung, không chạm thân thú */
function bannerFx(g,x,col,txt,q,sub){
 if(q<=0||!txt)return;
 const a=Math.min(1,q*2);
 label(g,txt,x,sub?64:52,col,a,11);
}
/* ---- THÁM HIỂM: lớp NỀN (gọi trước khi vẽ thú) ---- */
function drawBack(g,T,elapsed,i,R,shP,shM,hp,mh,petSp,hold){
 const z=zone(i),zp=zone(petSp==null?currentPetZone:petSp),h=Math.max(0,hold||0),e=Math.max(0,elapsed-Math.max(0,h-.6)),q=elapsed<Math.max(0,h-.6)?0:clamp(1-e/BUFFSEC,0,1),pulse=.55+.45*Math.sin(T*5);
 groundRing(g,85,zp.color,.2+.16*pulse,T);groundRing(g,272,z.color,.1+.1*pulse,T);
 if(R&&R.zoneBuff){backZone(g,272,z,q,T,e,BUFFSH[R.zoneBuff.stat],1);if(q<=0)auraBack(g,272,z.color,T,.2)}
 if(R&&R.startBuffs&&R.startBuffs.length){backGear(g,85,R.startBuffs[0].kind,q,T,e)}
 /* Bất khuất: dưới 50% máu thì ngọn lửa đỏ bừng sau lưng (nằm sau thú, không đè) */
 if(R&&R.bqP>0&&hp>0&&hp<R.maxP*.5)paint(g,AURA('red'),(T*3)%1,85,168,112,126,'#ff5a4a',.55+.2*pulse,false,0,0,10);
 if(R&&R.bqM>0&&mh>0&&mh<R.maxM*.5)paint(g,AURA('red'),(T*3)%1,272,168,112,126,'#ff5a4a',.5+.2*pulse,false,0,0,10);
}
function auraBack(g,x,col,T,a){glow(g,x,176,58,col,a*1.4*(.6+.4*Math.sin(T*3)))}
/* ---- THÁM HIỂM: lớp TRÊN (sau khi vẽ thú): nhãn + khiên viền mảnh + bảng thông tin ---- */
function drawField(g,T,elapsed,i,R,shP,shM,hp,mh,petSp,hold){
 const z=zone(i),zp=zone(petSp==null?currentPetZone:petSp),h=Math.max(0,hold||0),e=Math.max(0,elapsed-Math.max(0,h-.6)),q=elapsed<Math.max(0,h-.6)?0:clamp(1-e/BUFFSEC,0,1),pulse=.55+.45*Math.sin(T*5);
 if(R&&R.zoneBuff)bannerFx(g,272,z.color,'✦ '+R.zoneBuff.label,q,0);
 if(R&&R.startBuffs&&R.startBuffs.length)bannerFx(g,85,gearCol(R.startBuffs[0].kind),'✦ BỘ TRANG BỊ',q,0);
 infoPanels(g,z,zp,R);
 if(shP>0)paint(g,SHIELD,0,85,157,100,112,'#8fd0ff',.5+.2*pulse,false,0,.2,8);
 if(shM>0)paint(g,SHIELD,0,272,157,100,112,'#8fd0ff',.45+.18*pulse,false,0,.2,8);
}
/* ---- ĐẤU TRƯỜNG: buff vùng của 2 thú. bP/bM = {stat,text} từ 26-arena.js ---- */
function drawArenaBack(g,T,t,spP,spM,bP,bM){
 const q=clamp(1-Math.max(0,t)/BUFFSEC,0,1),e=Math.max(0,t);
 groundRing(g,85,zone(spP).color,.28,T);groundRing(g,272,zone(spM).color,.2,T);
 [[85,spP,bP],[272,spM,bM]].forEach(a=>{
  const b=a[2];if(!b||!b.text)return;
  const z=zone(a[1]);
  backZone(g,a[0],z,q,T,e,BUFFSH[b.stat],1);
  if(q<=0)auraBack(g,a[0],z.color,T,.22);
 });
}
function drawArenaBuffs(g,T,t,spP,spM,bP,bM){
 const q=clamp(1-Math.max(0,t)/BUFFSEC,0,1);
 [[85,spP,bP],[272,spM,bM]].forEach(a=>{const b=a[2];if(b&&b.text)bannerFx(g,a[0],zone(a[1]).color,'✦ '+b.text,q,0)});
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
 zones:ZONES,getZone,getStartBuffs,begin,drawBack,drawField,drawArenaPanels,drawArenaBack,drawArenaBuffs,drawCountdown,drawAttack,drawImpact
};
})();
