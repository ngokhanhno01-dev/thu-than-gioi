/* ===== 31-combat-fx.js — Hiệu ứng chiến đấu theo 17 vùng =====
   Tải sprite PNG tại combat-effects/; hiệu ứng trang bị chỉ xuất hiện khi sự kiện thực sự kích hoạt. */
(()=>{
'use strict';
const ROOT='combat-effects/';
const seq=(dir,prefix,count)=>({dir,prefix,count,pad:2,start:1});
const one=file=>({file});
const make=(name,color,mode,attack,field,mark)=>({name,color,mode,attack,field,mark});
const ZONES=[
 make('Tuyết Nguyên','#9fe4ff','ranged',one('4_don_danh_xa/orbs-sao-bang-xanh/sao-bang-xanh_01.png'),seq('1_buff_vung/dust-ground','dust-ground_',72),'❄'),
 make('Sương Cốc','#a3e1d4','melee',seq('3_don_danh_gan/swirl-blue','swirl-blue_',18),one('1_buff_vung/dome-shield/_sheet_nen-trong.png'),'霧'),
 make('Vân Đảo','#c9a8ff','ranged',seq('4_don_danh_xa/magic-bolts-a','magic-bolts-a_',10),one('1_buff_vung/orbs-dome-hong/dome-hong_01.png'),'☁'),
 make('Phong Nguyên','#82f0bb','melee',seq('3_don_danh_gan/crescent-blue','crescent-blue_',28),seq('1_buff_vung/ground-flame-blue','ground-flame-blue_',9),'➶'),
 make('Lôi Vực','#ffe53a','ranged',seq('4_don_danh_xa/lasers-c','lasers-c_',17),one('1_buff_vung/orbs-sam-set-mat-dat/sam-set-mat-dat_01.png'),'ϟ'),
 make('Nguyệt Cung','#a8b8ff','melee',seq('3_don_danh_gan/crescent-purple','crescent-purple_',28),one('1_buff_vung/orbs-dome-tim-nho/dome-tim-nho_01.png'),'☾'),
 make('Dương Sơn','#ffa94d','ranged',one('4_don_danh_xa/orbs-thien-thach-cam/thien-thach-cam_01.png'),seq('1_buff_vung/ground-flame-blue','ground-flame-blue_',9),'☼'),
 make('Huyền Uyên','#947aff','melee',seq('3_don_danh_gan/slash-pixel-sheet','slash-pixel-sheet_',38),one('1_buff_vung/orbs-dome-tim-lua/dome-tim-lua_01.png'),'◉'),
 make('Kim Khoáng','#e0b038','melee',seq('3_don_danh_gan/attack-pack-cyan','attack-pack-cyan_',47),one('1_buff_vung/orbs-cau-xanh-khien/cau-xanh-khien_01.png'),'◇'),
 make('Ngọc Động','#18e0b0','ranged',one('4_don_danh_xa/orbs-linh-hon-xanh-la/linh-hon-xanh-la_01.png'),one('1_buff_vung/orbs-cau-nang-luong-xanh/cau-nang-luong-xanh_01.png'),'⬡'),
 make('Thanh Lâm','#8be04a','melee',seq('3_don_danh_gan/slash-pixel-sheet','slash-pixel-sheet_',38),seq('1_buff_vung/dust-ground','dust-ground_',72),'♧'),
 make('Xích Hỏa Địa','#ff5a1e','ranged',one('4_don_danh_xa/orbs-hoa-cau-lon/hoa-cau-lon_01.png'),seq('1_buff_vung/ground-flame-blue','ground-flame-blue_',9),'♨'),
 make('Hắc Ám Lâm','#b0206a','melee',seq('3_don_danh_gan/swirl-blue','swirl-blue_',18),one('1_buff_vung/orbs-dome-tim-lua/dome-tim-lua_01.png'),'◈'),
 make('Tử Tinh Hải','#b45cff','ranged',one('4_don_danh_xa/orbs-cau-den-tim/cau-den-tim_01.png'),one('1_buff_vung/orbs-dome-tim-nho/dome-tim-nho_01.png'),'✧'),
 make('Thiên Không','#6ac4ff','ranged',seq('4_don_danh_xa/projectiles-b','projectiles-b_',12),one('1_buff_vung/orbs-cau-nang-luong-xanh/cau-nang-luong-xanh_01.png'),'⌁'),
 make('Linh Hoa Viên','#ff7ac0','melee',seq('3_don_danh_gan/attack-pack-cyan','attack-pack-cyan_',47),one('1_buff_vung/orbs-dome-hong/dome-hong_01.png'),'✿'),
 make('Thần Điện','#fff0a0','ranged',seq('4_don_danh_xa/magic-bolts-a','magic-bolts-a_',10),one('1_buff_vung/dome-shield/_sheet_nen-trong.png'),'✥')
];
const SHIELD=one('1_buff_vung/dome-shield/_sheet_nen-trong.png');
const LIGHTNING=one('1_buff_vung/orbs-sam-set-mat-dat/sam-set-mat-dat_01.png');
const LAVA=seq('1_buff_vung/ground-flame-blue','ground-flame-blue_',9);
const HEAL={dir:'2_buff_bo_trang_bi/aura-flame-colors',prefix:'aura-xanh-ngoc_',count:4,pad:1,start:1};
const WARM={dir:'2_buff_bo_trang_bi/aura-flame-colors',prefix:'aura-do_',count:4,pad:1,start:1};
const STAR=one('4_don_danh_xa/orbs-sao-choi-lua/sao-choi-lua_01.png');
function gearProc(text){
 if(/Dương Diệm/.test(text||''))return{asset:WARM,color:'#ff8a3a'};
 if(/Thần Phán|Tinh Quang/.test(text||''))return{asset:STAR,color:'#d7a0ff'};
 if(/Thiên Uy/.test(text||''))return{asset:one('1_buff_vung/orbs-cau-nang-luong-xanh/cau-nang-luong-xanh_01.png'),color:'#ffe16b'};
 if(/Sương Tán/.test(text||''))return{asset:SHIELD,color:'#a9f4e5'};
 return null;
}
const cache=new Map();
let currentZone=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pathFor(d,frame){
 if(d.file)return ROOT+d.file;
 const n=(d.start||1)+(frame%d.count);
 return ROOT+d.dir+'/'+d.prefix+String(n).padStart(d.pad||2,'0')+'.png';
}
function getImage(path){
 let im=cache.get(path);
 if(im)return im;
 im=new Image();im.onload=()=>{};im.onerror=()=>{};im.src=path;cache.set(path,im);return im;
}
function frame(d,p){
 const i=d.count?Math.min(d.count-1,Math.floor(clamp(p,0,.9999)*d.count)):0;
 return getImage(pathFor(d,i));
}
function paint(g,d,p,x,y,w,h,color,alpha,flip,rotate){
 const im=frame(d,p);
 if(!im.complete||!(im.naturalWidth||im.width))return false;
 const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,s=Math.min(w/iw,h/ih),dw=iw*s,dh=ih*s;
 g.save();g.translate(x,y);g.rotate(rotate||0);if(flip)g.scale(-1,1);
 g.globalAlpha=alpha==null?1:alpha;g.imageSmoothingEnabled=false;
 g.shadowColor=color||'#fff';g.shadowBlur=3;
 g.drawImage(im,-dw/2,-dh/2,dw,dh);
 g.restore();return true;
}
function zone(i){return ZONES[Math.max(0,Math.min(ZONES.length-1,Number(i)||0))]}
function getZone(i){return i==null?zone(currentZone):zone(i)}
function getStartBuffs(P,Q){
 const out=[];
 (P.fx||[]).forEach(f=>{
  if(f.k==='shield'&&(P.sh||0)>0)out.push({name:f.S?f.S.name:'Uyên Khiên',kind:'shield'});
  else if(f.k==='weaken')out.push({name:'Phấn Hoa Suy Yếu',kind:'weaken'});
  else if(f.k==='first')out.push({name:'Thiên Uy',kind:'first'});
  else if(f.k==='ambush'&&P.eqAC)out.push({name:'U Ảnh Ám Sát',kind:'ambush'});
 });
 return out;
}
function begin(i,R){
 currentZone=Math.max(0,Math.min(ZONES.length-1,Number(i)||0));
 const z=zone(currentZone);getImage(pathFor(z.attack,0));getImage(pathFor(z.field,0));getImage(pathFor(SHIELD,0));
 (R&&R.startBuffs||[]).forEach(x=>{if(x.kind==='shield')getImage(pathFor(SHIELD,0))});
}
function zoneBuffArt(b,z){
 switch(b&&b.stat){
  case'def':return SHIELD;
  case'regen':return HEAL;
  case'mag':return STAR;
  case'spd':case'eva':return z.attack;
  case'crit':return LIGHTNING;
  case'atk':return WARM;
  default:return z.attack;
 }
}
function drawField(g,T,elapsed,i,R,shP,shM,hp,mh){
 const z=zone(i),q=clamp(1-elapsed/1.35,0,1),pulse=.55+.45*Math.sin(T*5);
 const ring=(cx,color,opacity)=>{
  g.save();g.globalAlpha=opacity;g.strokeStyle=color;g.lineWidth=2;g.setLineDash([5,4]);g.lineDashOffset=-T*16;
  g.beginPath();g.ellipse(cx,204,36+Math.sin(T*2)*2,7+Math.sin(T*2)*1.2,0,0,Math.PI*2);g.stroke();
  g.setLineDash([]);g.globalAlpha=opacity*.45;g.lineWidth=1;
  for(let k=0;k<5;k++){const a=T*.7+k*Math.PI*2/5;g.fillStyle=color;g.fillRect(cx+Math.cos(a)*29-1,202+Math.sin(a)*6-1,3,3)}
  g.restore();
 };
 ring(85,z.color,.2+.16*pulse);
 ring(272,z.color,.1+.1*pulse);
 if(q>0){
  const grow=1.25-q*.34;
  paint(g,z.field,elapsed*1.4,85,160,100*grow,90*grow,z.color,.25*q,false,0);
  if(R&&R.zoneBuff)paint(g,zoneBuffArt(R.zoneBuff,z),elapsed*1.6,272,157,82,82,z.color,.68*q,false,0);
  g.save();g.globalAlpha=.72*q;g.textAlign='center';g.font='bold 11px monospace';
  const label=z.mark+' '+z.name+' · '+(z.mode==='melee'?'Cận chiến':'Đánh xa');
  g.lineWidth=3;g.strokeStyle='#171020';g.strokeText(label,180,78);
  g.fillStyle=z.color;g.fillText(label,180,78);
  if(R&&R.zoneBuff){
   const buff=R.zoneBuff.label+' · '+R.zoneBuff.desc;
   g.font='bold 9px monospace';g.lineWidth=2.5;g.strokeText(buff,180,94);g.fillStyle='#fff0bd';g.fillText(buff,180,94);
  }
  if(R&&R.startBuffs&&R.startBuffs.length){
   const labels=R.startBuffs.slice(0,2).map(v=>'✦ '+v.name).join('  ');
   g.font='bold 9px monospace';g.lineWidth=2.5;g.strokeText(labels,180,109);g.fillStyle='#ffe8a8';g.fillText(labels,180,109);
  }
  g.restore();
 }
 if(shP>0)paint(g,SHIELD,clamp(.15+T*.12,0,.95),85,157,78,92,'#8fd0ff',.22+.18*pulse,false,0);
 if(shM>0)paint(g,SHIELD,clamp(.15+T*.12,0,.95),272,157,78,92,'#8fd0ff',.18+.14*pulse,false,0);
 if(R&&R.bqP>0&&hp>0&&hp<R.maxP*.5)paint(g,WARM,T*.8,85,157,76,86,'#ff8a3a',.32+.16*pulse,false,0);
 if(R&&R.bqM>0&&mh>0&&mh<R.maxM*.5)paint(g,WARM,T*.8,272,157,76,86,'#ff8a3a',.28+.14*pulse,false,0);
}
function attackMode(z,text){
 if(/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text||''))return'melee';
 if(/Lôi Phạt giáng|Dung Nham Phun Trào/.test(text||''))return'ranged';
 return z.mode;
}
function drawAttack(g,T,S){
 const z=zone(currentZone),u=S.u||0,pa=!!S.pa,dir=pa?1:-1,text=S.text||'',mode=attackMode(z,text);
 const sx=pa?112:248,tx=pa?255:105,ty=148;
 if(/Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng/.test(text)){
  const p=clamp((u-.18)/.7,0,.9999);
  return paint(g,LAVA,p,tx,195,78,74,'#ff632d',.9,false,0)||u>.42;
 }
 if(/Lôi Phạt giáng/.test(text)){
  const p=clamp((u-.22)/.5,0,.9999);
  return paint(g,LIGHTNING,p,tx,ty,82,78,'#ffe53a',.95,false,0)||u>.42;
 }
 if(mode==='ranged'){
  if(u<.18){
   if(u>.035){const charge=clamp((u-.035)/.145,0,1),asset=frame(z.attack,charge*.3);
    if(asset.complete&&(asset.naturalWidth||asset.width))paint(g,z.attack,charge*.3,sx,ty,28+charge*18,28+charge*18,z.color,.55+charge*.35,false,T*.7)}
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
function drawImpact(g,fx,T){
 const z=zone(currentZone),text=fx.text||'',q=clamp(fx.q||0,0,.9999),target=(fx.k==='block'||fx.k==='heal'||fx.k==='stun')?(fx.pp?90:270):(fx.pp?272:90),y=150;
 if(fx.k==='block'||/Khiên hấp thụ|Chắn đòn/.test(text)){
  const a=paint(g,SHIELD,q,target,y,86+q*16,96+q*16,z.color,Math.max(.22,1-q),false,0);
  return a;
 }
 let d=z.attack,w=82,h=72,c=z.color,dir=fx.pp?1:-1;
 if(fx.k==='heal'||/hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh/.test(text)){d=HEAL;w=72;h=70;c='#8be04a'}
 else if(/Lôi Phạt/.test(text)){d=LIGHTNING;w=90;h=76;c='#ffe53a'}
 else if(/Dung Nham|Thiêu đốt|Xích Diệm/.test(text)){d=LAVA;w=92;h=76;c='#ff632d'}
 else if(/Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích/.test(text)){d=zone(5).attack;w=96;h=78}
 else if(fx.k==='stun'){d=LIGHTNING;w=72;h=72;c='#ffe53a'}
 else if(fx.k==='miss'){w=88;h=68}
 const f=q<.35?q/.35:Math.min(.999,(q-.35)/.65);
 const ok=paint(g,d,f,target,y,w,h,c,Math.max(.18,1-q*.86),dir<0,dir*.12);
 const proc=gearProc(text);
 if(ok&&proc)paint(g,proc.asset,q,target,y-5,70,66,proc.color,Math.max(.24,.82-q*.72),false,0);
 if(ok&&fx.k==='crit'){
  g.save();g.globalAlpha=Math.max(0,.7-q);g.strokeStyle='#ffd24a';g.lineWidth=2;g.beginPath();g.arc(target,y,14+q*45,0,Math.PI*2);g.stroke();g.restore();
 }
 return ok;
}
window.TTGCombatFX={
 zones:ZONES,getZone,getStartBuffs,begin,drawField,drawAttack,drawImpact
};
})();
