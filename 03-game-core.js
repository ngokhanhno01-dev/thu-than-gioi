
const $=id=>document.getElementById(id);
let level=1,exp=0,tapsNeed=5,taps=0,rerollLeft=3,lastTick=Date.now(),age=0,prog=0,MAX=5,hatched=false,waiting=false,task=null,gold=50,fame=0,burst=0,shake=0,tapT=-9999,hatchAge=0;
const TASKS=[
 {t:'warm',n:'Sưởi ấm',x:'🔥 Trứng lạnh buốt, cần được sưởi ấm gấp!'},
 {t:'bath',n:'Tắm rửa',x:'💧 Vỏ trứng phủ bụi mờ, cần lau rửa sạch sẽ!'},
 {t:'hug',n:'Ôm ấp',x:'🤲 Trứng khẽ rung, cần bạn truyền linh lực ôm ấp!'}];
const KEYS=['warm','bath','hug'];

$('beads').innerHTML=Array.from({length:MAX},()=>'<div class="bead"></div>').join('');

function log(h){const d=document.createElement('div');d.innerHTML=h;const l=$('log');l.prepend(d);while(l.children.length>30)l.lastChild.remove()}
function setBtns(on){KEYS.forEach(k=>{const b=$('btn-'+k);b.disabled=!on;b.classList.toggle('locked',!on);
  b.classList.toggle('active-task',on&&task&&task.t===k)})}
function stats(){$('h-gold').textContent=gold;$('h-fame').textContent=fame}

setInterval(()=>{
  if(!chosen||Date.now()-lastTick<tickMs())return;
  lastTick=Date.now();
  age++;$('h-age').textContent=age;
},100);

function newTask(){
  waiting=true;task=TASKS[Math.floor(Math.random()*3)];
  $('mission').textContent=task.x;log('⚠️ <b>[Thông báo]</b> '+task.x);setBtns(true);
}
function doTask(k){
  if(hatched||!waiting)return;
  if(k===task.t){
    prog++;document.querySelectorAll('.bead').forEach((b,i)=>b.classList.toggle('on',i<prog));
    log('✅ Chính xác! Hoàn thành: <b style="color:var(--jade)">'+task.n+'</b>.');
    waiting=false;shake=0;$('mission').textContent='Trứng đang hấp thụ linh khí, lớn lên bình yên...';
    task=null;setBtns(false);burst=Math.max(burst,.35);
    if(prog>=MAX)hatch();
  }else log('❌ Nhầm rồi! Lúc này trứng không cần hành động đó.');
}
function hatch(){
  hatched=true;hatchAge=age;burst=1.6;
  gs=growthOf(level);pet=rollPet();const _b=BL[pet.bl];log('🧬 <b>[Huyết mạch]</b> Loài <b>'+genOf(pet.bl,pet.sp).name+'</b> — '+_b.n+' · hệ '+_b.h+' · <b style="color:var(--gold)">'+PL[pet.pi][1]+'</b>');updateStage();
  $('banner').textContent='Trứng Nở Thành Công!';
  setTimeout(()=>{if(hatched)$('banner').textContent=STAGES[stageOf(level)][1]},3000);
  log('<b>[Kỳ tích]</b> Vỏ trứng rạn nứt, hào quang vạn trượng! Một tiểu thần thú đã ra đời!');
  $('s-egg').style.display='none';
  $('main-title').textContent='Tu Luyện Đường';
  ['train','arena','shop'].forEach(k=>{const b=$('btn-'+k);b.disabled=false;b.classList.remove('locked')});
}
function train(){const f=addFame(3);stats();log('🧭 Thần thú thám hiểm, uy danh +'+f+'.')}
function arena(){
  if(Math.random()<.55){gold+=12;const f=addFame(5);log('⚔️ Thắng trận! Xu +12, uy danh +'+f+'.')}
  else{fame=Math.max(0,fame-1);log('⚔️ Thua trận, uy danh -1. Hãy luyện thêm!')}
  stats();
}
function shop(){
  if(gold<20){log('🏪 Không đủ xu mua Linh Đan (20 xu).');return}
  gold-=20;const f=addFame(6);stats();log('🏪 Mua Linh Đan: thú tăng tu vi, uy danh +'+f+'.');
}

/* ===== Cảnh giả 3D ===== */
const cv=$('cv');let c=cv.getContext('2d');
const W=360,H=250,K=cv.width/W;
const SCENE_PIXEL_BUFFER=document.createElement('canvas');
SCENE_PIXEL_BUFFER.width=W/2;SCENE_PIXEL_BUFFER.height=H/2;
const SCENE_PIXEL_CTX=SCENE_PIXEL_BUFFER.getContext('2d');
const stars=Array.from({length:40},()=>({x:Math.random()*W,y:Math.random()*100,s:Math.random()*6}));
const motes=Array.from({length:52},()=>({x:Math.random()*W,y:Math.random()*H,v:.2+Math.random()*.5,r:.6+Math.random()*1.8,p:Math.random()*6}));
const lanterns=[[40,70,0],[320,60,2],[70,105,4],[290,100,1]];

function mountain(base,amp,col1,col2,off,seed){
  const g=c.createLinearGradient(0,base-amp,0,base+10);g.addColorStop(0,col1);g.addColorStop(1,col2);
  c.fillStyle=g;c.beginPath();c.moveTo(0,base+10);
  for(let x=0;x<=W;x+=6){
    const y=base-amp*(.5+.5*Math.sin(x*.025+seed)*Math.cos(x*.011+seed*2))-amp*.25*Math.sin(x*.07+seed+off);
    c.lineTo(x,y)}
  c.lineTo(W,base+10);c.fill();
}
function floor(t){
  const vy=125;
  const g=c.createLinearGradient(0,vy,0,H);g.addColorStop(0,'#20332c');g.addColorStop(1,'#0c130f');
  c.fillStyle=g;c.fillRect(0,vy,W,H-vy);
  c.strokeStyle='rgba(242,199,106,.18)';c.lineWidth=.8;
  for(let i=-10;i<=10;i++){c.beginPath();c.moveTo(180+i*8,vy);c.lineTo(180+i*55,H);c.stroke()}
  for(let j=0;j<8;j++){const p=((j+t*.15)%8)/8,y=vy+(H-vy)*p*p;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
}
function formation(t,sp){
  if(window.PLAT&&PLAT.ok&&PLAT.draw(c,t,sp===undefined?-1:sp))return; /* 15-platform.js: bệ pixel art theo 17 vùng (nếu lỗi/không có file thì dùng bệ vector cũ bên dưới) */
  const cx=180,cy=190;
  c.save();c.translate(cx,cy);c.scale(1,.3);
  const gl=c.createRadialGradient(0,0,10,0,0,100);gl.addColorStop(0,'rgba(242,199,106,.45)');gl.addColorStop(1,'rgba(242,199,106,0)');
  c.fillStyle=gl;c.beginPath();c.arc(0,0,100,0,7);c.fill();
  // đế đá dày giả 3D
  c.fillStyle='#2b1d13';c.beginPath();c.arc(0,14,64,0,7);c.fill();
  const st=c.createRadialGradient(-15,-10,5,0,0,64);st.addColorStop(0,'#6b5037');st.addColorStop(1,'#33231a');
  c.fillStyle=st;c.beginPath();c.arc(0,0,64,0,7);c.fill();
  c.strokeStyle='#f2c76a';c.lineWidth=3;c.stroke();
  c.lineWidth=1.5;c.beginPath();c.arc(0,0,50,0,7);c.stroke();
  c.rotate(t*.3);
  c.strokeStyle='#f2c76a';c.lineWidth=3;
  for(let i=0;i<8;i++){c.rotate(Math.PI/4);
    c.beginPath();c.moveTo(38,0);c.lineTo(48,0);c.stroke();
    c.beginPath();c.moveTo(38,-5);c.lineTo(48,-5);c.moveTo(38,5);c.lineTo(48,5);c.stroke()}
  c.rotate(-t*.6);c.strokeStyle='rgba(111,209,160,.8)';c.lineWidth=1.5;
  c.beginPath();c.arc(0,0,28,0,7);c.stroke();
  for(let i=0;i<3;i++){c.rotate(Math.PI*2/3);c.beginPath();c.moveTo(0,0);c.lineTo(28,0);c.stroke()}
  c.restore();
}
const EGGP=new Path2D();
{const rx=34,ry=46;EGGP.moveTo(0,-ry);EGGP.bezierCurveTo(rx*.95,-ry,rx*1.2,ry*.2,rx*.8,ry*.75);EGGP.bezierCurveTo(rx*.5,ry*1.05,-rx*.5,ry*1.05,-rx*.8,ry*.75);EGGP.bezierCurveTo(-rx*1.2,ry*.2,-rx*.95,-ry,0,-ry);EGGP.closePath()}
const SR=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
const CRK=[[[-4,-44],[2,-34],[-6,-26],[0,-18]],[[18,-30],[10,-20],[16,-10]],[[-26,-5],[-16,2],[-22,12]],[[20,14],[10,20],[14,32]],[[-6,30],[0,38],[-10,44]]];
function ring(t,qc,front){
  c.save();c.rotate(-.28);c.scale(1,.24);
  c.strokeStyle='rgba('+qc+',.6)';c.lineWidth=2.4;c.beginPath();c.arc(0,0,62,front?0:Math.PI,front?Math.PI:Math.PI*2);c.stroke();
  for(let i=0;i<6;i++){const a=t*.9+i*Math.PI/3,sn=Math.sin(a);if((sn>0)!==front)continue;
    c.save();c.translate(Math.cos(a)*62,sn*62);c.rotate(a);c.scale(1,1/.24);c.fillStyle='rgba('+qc+',.95)';c.fillRect(-3,-3,6,6);c.restore()}
  c.restore();
}
function drawDivineEggShell(q,qc,ep,a){
  c.save();
  c.fillStyle='#17111d';c.fill(EGGP);
  const shell=c.createLinearGradient(-30,-44,30,42);
  shell.addColorStop(0,ep[0]);shell.addColorStop(.28,ep[1]);shell.addColorStop(.7,ep[2]);shell.addColorStop(1,ep[3]);
  c.fillStyle=shell;c.fill(EGGP);
  c.save();c.clip(EGGP);
  const sheen=c.createLinearGradient(-30,0,30,0);
  sheen.addColorStop(0,'rgba(255,255,255,.48)');sheen.addColorStop(.38,'rgba(255,255,255,.08)');sheen.addColorStop(1,'rgba(0,0,0,.3)');
  c.fillStyle=sheen;c.fillRect(-40,-50,80,100);
  // Fine scale facets keep the shell readable without making it look like a creature.
  for(let row=0;row<8;row++)for(let col=-3;col<=3;col++){
    const px=col*10+(row%2?5:0),py=-34+row*10;
    c.beginPath();c.moveTo(px,py-4);c.lineTo(px+4,py-1);c.lineTo(px+4,py+2);
    c.lineTo(px,py+5);c.lineTo(px-4,py+2);c.lineTo(px-4,py-1);c.closePath();
    c.fillStyle=(row+col)%2?'rgba(255,255,255,.13)':'rgba(8,12,25,.12)';c.fill();
    c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=.7;c.stroke();
  }
  c.lineCap='round';c.lineJoin='round';c.lineWidth=2;
  if(q===0){
    for(let i=0;i<8;i++){
      const px=-23+(i%4)*14,py=-24+Math.floor(i/4)*43;
      c.fillStyle=i%2?'rgba(255,255,255,.28)':'rgba(27,30,38,.22)';
      c.beginPath();c.moveTo(px,py);c.lineTo(px+5,py-4);c.lineTo(px+8,py+3);c.lineTo(px+2,py+6);c.closePath();c.fill();
    }
  }else if(q===1){
    c.strokeStyle='rgba('+qc+',.85)';c.lineWidth=2.2;
    for(let i=0;i<3;i++){
      const yy=-27+i*24,shift=Math.sin(a+i)*3;
      c.beginPath();c.moveTo(-25,yy);c.bezierCurveTo(-11,yy-12+shift,3,yy+13-shift,24,yy-3);c.stroke();
    }
  }else if(q===2){
    for(const side of[-1,1])for(let i=0;i<3;i++){
      const px=side*(17+i*2),py=-24+i*18;
      c.fillStyle=i%2?'rgba(255,255,255,.55)':'rgba('+qc+',.42)';
      c.beginPath();c.moveTo(px,py-9);c.lineTo(px+side*6,py+1);c.lineTo(px,py+7);c.lineTo(px-side*3,py);c.closePath();c.fill();
      c.strokeStyle='rgba(255,255,255,.55)';c.stroke();
    }
  }else if(q===3){
    c.strokeStyle='rgba(255,242,255,.72)';c.lineWidth=1.1;
    const stars=[[-17,-24],[-3,-14],[15,-20],[20,2],[4,16],[-15,22]];
    c.beginPath();stars.forEach(([px,py],i)=>i?c.lineTo(px,py):c.moveTo(px,py));c.stroke();
    stars.forEach(([px,py],i)=>drawPixelMotif(px,py,i%2?'star':'moon','#fff4ff',i%2?1:1.4));
  }else{
    c.strokeStyle='rgba(255,244,190,.78)';c.lineWidth=1.4;
    for(let row=0;row<5;row++)for(let col=-2;col<=2;col++){
      const px=col*10+(row%2?5:0),py=-29+row*14;
      c.beginPath();c.moveTo(px,py-4);c.lineTo(px+4,py);c.lineTo(px,py+4);c.lineTo(px-4,py);c.closePath();c.stroke();
    }
  }
  // A sealed core and two curling filigree bands make the object read as a sacred egg.
  c.strokeStyle='rgba(242,199,106,.72)';c.lineWidth=1.4;
  c.beginPath();c.moveTo(-24,-8);c.bezierCurveTo(-6,-18,8,18,24,8);c.stroke();
  c.beginPath();c.moveTo(-22,11);c.bezierCurveTo(-7,21,7,-10,22,-2);c.stroke();
  const core=c.createRadialGradient(-3,-2,1,0,0,13);
  core.addColorStop(0,'rgba(255,255,255,.95)');core.addColorStop(.34,ep[0]);core.addColorStop(1,'rgba('+qc+',.05)');
  c.fillStyle=core;c.beginPath();c.arc(0,2,13,0,Math.PI*2);c.fill();
  c.restore();
  c.lineJoin='round';c.lineWidth=3.2;c.strokeStyle='rgba(14,10,22,.95)';c.stroke(EGGP);
  c.lineWidth=1.4;c.strokeStyle='rgba(242,199,106,.95)';c.stroke(EGGP);
  c.lineWidth=.75;c.strokeStyle='rgba('+qc+',.9)';c.stroke(EGGP);
  c.save();c.globalAlpha=.7;
  const highlight=c.createLinearGradient(-23,0,-8,0);
  highlight.addColorStop(0,'rgba(255,255,255,.5)');highlight.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=highlight;c.beginPath();c.ellipse(-17,-2,5,25,-.18,0,Math.PI*2);c.fill();
  c.restore();
  const crest=['star','gem','crystal','moon','crown'][q];
  c.strokeStyle='rgba(242,199,106,.9)';c.lineWidth=1.3;c.beginPath();c.arc(0,3,15,0,Math.PI*2);c.stroke();
  c.strokeStyle='rgba(242,199,106,.58)';c.beginPath();c.arc(0,3,19,0,Math.PI*2);c.stroke();
  drawPixelMotif(0,3,crest,q===4?'#fff2a2':'#f2c76a',q===4?2.2:1.8);
  if(q<3){
    c.fillStyle='#f2c76a';c.strokeStyle='rgba(24,16,28,.9)';c.lineWidth=1.2;
    c.beginPath();c.moveTo(-7,-42);c.lineTo(-5,-48);c.lineTo(-1,-43);c.lineTo(1,-50);
    c.lineTo(5,-43);c.lineTo(7,-48);c.lineTo(8,-41);c.closePath();c.fill();c.stroke();
  }
  if(q>=3){
    c.fillStyle=q===4?'#ffe28a':'#f2d8ff';c.strokeStyle='rgba(35,20,45,.9)';c.lineWidth=1.5;
    c.beginPath();c.moveTo(-13,-39);c.lineTo(-8,-48);c.lineTo(-2,-41);c.lineTo(2,-53);
    c.lineTo(7,-41);c.lineTo(13,-48);c.lineTo(11,-34);c.lineTo(-11,-34);c.closePath();c.fill();c.stroke();
  }
  c.restore();
}
function egg(t){
  const x=180,y=116+Math.sin(t*1.8)*3,q=eggQ,qc=QC[q],ep=EP[q],a=t*.7;
  const glow=.28+q*.09+prog*.06+(waiting?.18+Math.sin(t*12)*.08:0);
  c.save();c.translate(x,y);
  const ts=Math.max(0,1-(performance.now()-tapT)/380);
  if(ts>0){c.translate(Math.sin(ts*38)*7*ts,-4*ts);c.rotate(Math.sin(ts*30)*.14*ts);c.scale(1+.07*ts,1-.05*ts)}
  const aura=c.createRadialGradient(0,0,8,0,0,78+q*10);
  aura.addColorStop(0,'rgba('+qc+','+glow+')');aura.addColorStop(1,'rgba('+qc+',0)');
  c.fillStyle=aura;c.beginPath();c.arc(0,0,82+q*10,0,Math.PI*2);c.fill();
  // Cấp phẩm chất có vòng nghi lễ và tia sáng riêng.
  if(q>0){
    c.save();c.scale(1,.28);c.rotate(t*(q===4?.24:.12));
    for(let r=0;r<q;r++){
      c.strokeStyle='rgba('+qc+','+(q===4?.6:.28)+')';c.lineWidth=q>=3?2:1.4;
      c.beginPath();c.arc(0,0,55+r*10,0,Math.PI*2);c.stroke();
    }
    c.restore();
  }
  ring(t,qc,false);
  c.translate(waiting?Math.sin(t*40)*2.2:0,0);
  drawDivineEggShell(q,qc,ep,a);
  // Vết nứt tăng dần theo tiến độ chăm sóc.
  c.strokeStyle=q===4?'rgba(255,248,191,.98)':'rgba(255,247,220,.92)';c.lineWidth=2.5;c.lineCap='square';
  for(let i=0;i<prog&&i<CRK.length;i++){c.beginPath();CRK[i].forEach((pt,k)=>k?c.lineTo(pt[0],pt[1]):c.moveTo(pt[0],pt[1]));c.stroke()}
  ring(t,qc,true);
  c.restore();
}
const BL={
 ho:{n:'Bạch Hổ',h:'Kim',c:['#ffffff','#dfe7f2','#8795ab'],ac:'#232833',au:'210,225,255',eye:'#1a0f08',tip:'Công +60%',b:{atk:60}},
 vu:{n:'Huyền Vũ',h:'Thủy',c:['#c4ecf6','#4f9bb8','#1d4a66'],ac:'#f2c76a',au:'90,180,255',eye:'#1a0f08',tip:'Thủ +60%, Sinh Lực +20%',b:{def:60,hp:20}},
 long:{n:'Thanh Long',h:'Mộc',c:['#d6ffdc','#58c878','#1b6a3a'],ac:'#f2c76a',au:'110,230,150',eye:'#1a0f08',mane:['#58c878','#c8ffb0'],tip:'Hồi 6% Sinh Lực/lượt, Linh +20%',b:{regen:6,mag:20}},
 tuoc:{n:'Chu Tước',h:'Hỏa',c:['#ffe3b8','#ff7a4d','#a8281a'],ac:'#ffd45a',au:'255,140,80',eye:'#7a3a00',mane:['#ff4d2a','#ffd45a'],tip:'Tốc +60%',b:{spd:60}},
 lan:{n:'Kỳ Lân',h:'Thổ',c:['#fff4c8','#f0c04a','#a8741a'],ac:'#c0392b',au:'255,215,110',eye:'#1a0f08',mane:['#f2c76a','#ff9a4d'],tip:'Choáng +25%, Sinh Lực +20%',b:{stun:25,hp:20}},
 hu:{n:'Cửu Vĩ Hồ',h:'Huyễn',c:['#ffffff','#e6ccff','#8a5ad0'],ac:'#ff7ad0',au:'210,150,255',eye:'#a040c0',tip:'Né tránh +30%',b:{eva:30}}
};
const QN=['Phàm','Linh','Địa','Thiên','Thần'],QW=[50,30,13,6,1],QC=['190,190,190','110,220,200','110,170,255','200,130,255','255,190,70'];
const PL=[[.1,'Tạp Huyết'],[.3,'Hiển Lộ'],[.5,'Giác Tỉnh'],[.7,'Thuần Huyết'],[1,'Phản Tổ']];
const PT=[[55,30,12,3,0],[35,38,20,6,1],[18,32,32,15,3],[6,20,34,30,10],[0,6,24,40,30]];
const FOXP=[0,.5,2,6,15];
function pick(w){let r=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<w.length;i++){if((r-=w[i])<0)return i}return w.length-1}
const TICK={egg:10000,hatched:30000};
function tickMs(){return hatched?TICK.hatched:TICK.egg}
let chosen=false,rolls=0,hist=[],eggQ=pick(QW),pet=null,pv={on:false,bl:'lan',pi:2,age:10,sp:0};
function rollPet(){
  const fox=Math.random()*100<FOXP[eggQ];
  const bl=fox?'hu':['ho','vu','long','tuoc','lan'][Math.floor(Math.random()*5)];
  let pi=pick(PT[eggQ]);if(fox&&pi<1)pi=1;
  const tot=[50,60,72,86,100][eggQ],base={};
  ['hp','atk','def','spd','mag'].forEach(k=>base[k]=tot/5*(.85+Math.random()*.3));
  return{bl,pi,q:eggQ,base,sp:Math.floor(Math.pow(Math.random(),1/(1+eggQ*.5))*17)};
}
function pur(pi){const t=Math.floor(pi);return Math.min(1,PL[t][0]+(pi-t))}
function statsOf(bl,pi,base,a){
  if(pet&&!pv.on&&bl===pet.bl&&base===pet.base&&pi===pet.pi)pi+=(pet.up||0)*.03;
  const p=pur(pi),b=BL[bl].b,m=1+3*petGrow(a),f=k=>1+(b[k]||0)*p/100;
  return{hp:Math.round(base.hp*8*m*f('hp')),atk:Math.round(base.atk*m*f('atk')),def:Math.round(base.def*m*f('def')),spd:Math.round(base.spd*m*f('spd')),mag:Math.round(base.mag*m*f('mag')),
    eva:Math.min(45,5+(b.eva||0)*p),stun:Math.min(35,(b.stun||0)*p),regen:Math.min(8,(b.regen||0)*p)};
}
function cbAttrs(s,k,c0){const v=i=>k[i]||0,r=x=>Math.round(x*10)/10,cr=(c0||0)+v(4);
  return[['Sinh Lực',s.hp],['Công',s.atk],['Thủ',s.def],['Tốc',s.spd],['Linh',s.mag],['Né tránh',r(s.eva)+'%'],['Chí mạng',r(cr)+'%'],['ST chí mạng',cr>0?r(150+v(4)*3)+'%':'0%'],['Choáng',r(s.stun)+'%'],['Hồi/lượt',r(s.regen)+'%'],['Kháng hiệu ứng',r(v(10))+'%'],['Xuyên giáp',r(v(8))+'%'],['Hút máu',r(v(12))+'%'],['Phản đòn',r(v(7))+'%'],['Liên kích',r(v(3))+'%'],['Khiên',r(v(9))+'%']]}
function renderInfo(){
  const el=$('info');
  const src=pv.on?{bl:pv.bl,sp:pv.sp,pi:pv.pi,a:pv.age,base:pet?pet.base:{hp:12,atk:12,def:12,spd:12,mag:12}}:(pet?{bl:pet.bl,sp:pet.sp,pi:pet.pi,a:level,base:pet.base}:null);
  const q=pet?pet.q:eggQ,qs='<b style="color:rgb('+QC[q]+')">'+QN[q]+' phẩm</b>';
  if(!src){el.innerHTML='Phẩm chất trứng: '+qs+'<br><small>Huyết mạch được giấu đến lúc trứng nở...</small>';return}
  const B=BL[src.bl],s=statsOf(src.bl,src.pi,src.base,src.a),L=PL[src.pi],upN=(!pv.on&&pet?pet.up||0:0),pe=pur(src.pi+upN*.03),r=x=>Math.round(x*10)/10;
  const cells=cbAttrs(s,(()=>{const k={};k[src.sp]=spInfo(src.sp,src.pi+upN*.03,q).v;return k})(),s.crit);
  el.innerHTML='Trứng '+qs+(pv.on?' <small>(đang xem thử)</small>':'')+'<br>Huyết mạch: <b style="color:rgb('+B.au+')">'+B.n+'</b> · hệ <b>'+B.h+'</b><br>Loài: <b>'+genOf(src.bl,src.sp).name+'</b><br>Độ đậm: <b style="color:var(--gold)">'+L[1]+(upN?' +'+upN:'')+' ('+Math.round(pe*100)+'%)</b><br><small>'+B.tip+' khi Phản Tổ</small><div class="stg">'+cells.map(x=>'<div>'+x[0]+'<b>'+x[1]+'</b></div>').join('')+'</div>';
}
function pvSet(k,v){pv.on=true;pv[k]=v;
  document.querySelectorAll('[data-k]').forEach(b=>b.classList.toggle('sel',String(pv[b.dataset.k])===b.dataset.v));pvLabel();renderInfo()}
function pvOff(){pv.on=false;document.querySelectorAll('[data-k]').forEach(b=>b.classList.remove('sel'));renderInfo()}
$('pv-bl').innerHTML=Object.keys(BL).map(k=>`<button class="mini jade" data-k="bl" data-v="${k}" onclick="pvSet('bl','${k}')">${BL[k].n}</button>`).join('');
$('pv-pi').innerHTML=PL.map((l,i)=>`<button class="mini" data-k="pi" data-v="${i}" onclick="pvSet('pi',${i})">${l[1]}</button>`).join('');
$('pv-age').innerHTML=[1,11,21,31,41,51,61,71,81,91].map(a=>`<button class="mini" data-k="age" data-v="${a}" onclick="pvSet('age',${a})">Cấp ${a}</button>`).join('');

const SPD=[['Chậm',10000,30000],['Vừa',5000,10000],['Nhanh',1500,3000]];
function setSpeed(i){TICK.egg=SPD[i][1];TICK.hatched=SPD[i][2];document.querySelectorAll('[data-s]').forEach(b=>b.classList.toggle('sel',b.dataset.s==i));log('⏱ Tốc độ thời gian: <b>'+SPD[i][0]+'</b> ('+SPD[i][2]/1000+'s mỗi năm).')}
$('spd').innerHTML=SPD.map((x,i)=>`<button class="mini${i==0?' sel':''}" data-s="${i}" onclick="setSpeed(${i})">${x[0]}<br>${x[2]/1000}s/năm</button>`).join('');
const EP=[['#f4f1ea','#cfc8b8','#8f8776','#3e3a30'],['#e0fff8','#6fe0c8','#2a9a88','#0e4a42'],['#e0efff','#7ab4ff','#3a6ed0','#142a66'],['#f4e0ff','#c58aff','#8a3ad0','#35106a'],['#fff6d8','#f2c76a','#c2862a','#5a3208']];
function renderPick(){
  $('pick-desc').innerHTML='Linh trứng hiện tại: <b style="color:rgb('+QC[eggQ]+')">'+QN[eggQ]+' phẩm</b><br><small>Phẩm chất càng cao, huyết mạch càng dễ đậm. Huyết mạch được giấu đến lúc nở.<br>Đã quay: '+rolls+' lần</small>';
  $('pick-hist').innerHTML=hist.length?hist.map((q,i)=>`<button class="mini" onclick="swapEgg(${i})" style="border-color:rgb(${QC[q]})">↩ ${QN[q]}</button>`).join(''):'<div style="grid-column:1/-1;text-align:center;font-size:11px;color:var(--mute)">Chưa có lượt quay cũ</div>';
  renderInfo();
}
function rerollEgg(){if(chosen||rerollLeft<=0)return;rerollLeft--;hist.unshift(eggQ);hist=hist.slice(0,3);eggQ=pick(QW);rolls++;burst=Math.max(burst,.5);renderPick()}
function swapEgg(i){if(chosen)return;const q=hist[i];hist[i]=eggQ;eggQ=q;burst=Math.max(burst,.3);renderPick()}
function confirmEgg(){
  if(chosen)return;chosen=true;lastTick=Date.now();
  $('s-pick').style.display='none';$('s-egg').style.display='';
  $('banner').textContent='Ấm Quả Trứng Thần Thú';$('h-status').textContent='Ấm Trứng Thần Thú';
  log('🥚 Bạn chọn linh trứng <b style="color:rgb('+QC[eggQ]+')">'+QN[eggQ]+' phẩm</b>. Thời gian bắt đầu trôi...');
  renderInfo();
}
let gs=0,curStage=-1,vs=0; /* vs = kích thước thú đang hiển thị (mượt dần tới kích thước của bậc) */
/* 10 bậc, mỗi bậc 10 cấp: bậc 1 = cấp 1-10, bậc 2 = cấp 11-20 ... bậc 10 = cấp 91-100. Mốc [cấp bắt đầu, tên]. */
const STAGES=[[0,'Sơ Sinh (Bậc 1)'],[11,'Ấu Thú (Bậc 2)'],[21,'Thiếu Thú (Bậc 3)'],[31,'Linh Thú (Bậc 4)'],[41,'Yêu Thú (Bậc 5)'],[51,'Hung Thú (Bậc 6)'],[61,'Trưởng Thú (Bậc 7)'],[71,'Đại Thú (Bậc 8)'],[81,'Chí Tôn (Bậc 9)'],[91,'Thần Thú (Bậc 10)']];
const PET_STAGE_MAX_SIZE=130; /* cạnh khung thú (px) ở bậc 10 trên màn chính; bậc thấp nhỏ hơn theo VanKiepSprites.stageScale */
function stageOf(a){let r=0;STAGES.forEach((q,i)=>{if(a>=q[0])r=i});return r}
function growthOf(a){return Math.min(1,Math.max(0,(a-1)/99))}
function petGrow(a){return growthOf(a)+.25*(1-Math.exp(-(a-1)/7))} /* thú: tuyến tính + bonus đầu game (cấp 9 x1,75; cấp 100 x4,75) */
function updateStage(){
  if(!hatched)return;
  const i=stageOf(level);
  /* EVO (13-evolve.js): hiệu ứng tiến hóa ~5s tiếp quản log/banner/tên bậc; nếu không có EVO thì chạy như cũ */
  const evo=!!(window.EVO&&curStage>=0&&i!==curStage&&EVO.onStage(curStage,i));
  if(!evo&&!(window.EVO&&EVO.holdStatus()))$('h-status').textContent=STAGES[i][1];
  if(curStage>=0&&i!==curStage&&!evo){
    log('🌟 <b>[Tiến hóa]</b> Thú đã lớn thành <b style="color:var(--gold)">'+STAGES[i][1]+'</b>!');
    $('banner').textContent=STAGES[i][1];burst=Math.max(burst,1);
  }
  curStage=i;renderInfo();
}
const EPI=[['Tuyết','#dff4ff','snow'],['Sương','#cfe6e0','mist'],['Vân','#e9e0ff','cloud'],['Phong','#c8ffe0','wind'],['Lôi','#ffe86a','bolt'],['Nguyệt','#d8d8ff','moon'],['Dương','#ffd28a','sun'],['Huyền','#6a6a9a','void'],['Kim','#ffd24a','crystal'],['Ngọc','#a8ffd8','gem'],['Thanh','#7affc0','leaf'],['Xích','#ff7a6a','flame'],['Hắc','#4a3a5a','shadow'],['Tử','#c06aff','star'],['Thiên','#aee0ff','feather'],['Linh','#ffd0f0','petal'],['Thần','#fff2a0','crown']];
const MOTIF_PIXELS={
 snow:[[0,-2],[0,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[0,1],[0,2],[-1,-1],[1,-1],[-1,1],[1,1]],
 mist:[[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[2,-1],[3,-1],[-2,2],[-1,2],[0,2],[1,2],[1,1]],
 cloud:[[-3,1],[-2,0],[-1,0],[0,-1],[1,-1],[2,0],[3,1],[-2,2],[-1,2],[0,2],[1,2],[2,2]],
 wind:[[-3,-1],[-2,-1],[-1,-1],[0,-1],[1,-1],[1,0],[0,1],[-1,1],[-2,1],[-2,2],[-1,2],[0,2]],
 bolt:[[0,-3],[1,-3],[0,-2],[0,-1],[-1,-1],[0,0],[1,0],[0,1],[-1,2],[0,2]],
 moon:[[-1,-3],[0,-3],[1,-2],[1,-1],[1,0],[1,1],[0,2],[-1,2],[-2,1],[-1,1],[0,0]],
 sun:[[0,-3],[0,-2],[-2,-2],[2,-2],[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[-2,2],[0,2],[2,2],[0,3]],
 void:[[0,-3],[0,-2],[-1,-1],[1,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[1,1],[0,2],[0,3]],
 crystal:[[0,-3],[0,-2],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]],
 gem:[[0,-3],[-1,-2],[0,-2],[1,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]],
 leaf:[[-2,-2],[-1,-2],[0,-1],[1,-1],[2,0],[1,0],[0,1],[-1,1],[-2,2],[-1,0],[0,0]],
 flame:[[0,-3],[-1,-2],[1,-2],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]],
 shadow:[[-3,-1],[-2,-2],[-1,-1],[0,-2],[1,-1],[2,-2],[3,-1],[-2,1],[-1,0],[0,1],[1,0],[2,1],[0,3]],
 star:[[0,-3],[0,-2],[-1,-1],[0,-1],[1,-1],[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[-1,1],[0,1],[1,1],[0,2],[0,3]],
 feather:[[-2,-3],[-1,-2],[0,-1],[1,0],[2,1],[1,1],[0,1],[-1,2],[-2,3],[-1,0],[0,0]],
 petal:[[0,-3],[0,-2],[-2,-1],[-1,-1],[0,-1],[1,-1],[2,-1],[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[-2,1],[-1,1],[0,1],[1,1],[2,1],[0,2],[0,3]],
 crown:[[-3,-2],[-3,-1],[-2,-1],[-1,-1],[0,-2],[1,-1],[2,-1],[3,-2],[3,-1],[-3,0],[-2,0],[-1,0],[0,0],[1,0],[2,0],[3,0],[-3,1],[-2,1],[-1,1],[0,1],[1,1],[2,1],[3,1]]
};
function drawPixelMotif(x,y,type,color,unit=2){
  const pts=MOTIF_PIXELS[type]||MOTIF_PIXELS.star;
  c.save();c.fillStyle=color;
  pts.forEach(([dx,dy])=>c.fillRect(Math.round(x+dx*unit),Math.round(y+dy*unit),unit,unit));
  c.restore();
}
const NOUN={ho:'Hổ',vu:'Quy',long:'Long',tuoc:'Tước',lan:'Lân',hu:'Hồ'},BKEYS=['ho','vu','long','tuoc','lan','hu'];
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
function genOf(bl,sp){const r=rng(sp*7919+BKEYS.indexOf(bl)*104729+17);
  return{ep:EPI[sp],name:EPI[sp][0]+' '+NOUN[bl],horn:Math.floor(r()*4),wing:Math.floor(r()*3),mark:Math.floor(r()*4),ext:Math.floor(r()*3),fx:Math.floor(r()*4),orb:r()<.4,sz:.92+r()*.16}}
function mix(a,b,t){const f=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),x=f(a),y=f(b);return'rgb('+x.map((v,i)=>Math.round(v+(y[i]-v)*t)).join(',')+')'}
function pvLabel(){$('pv-spn').textContent=genOf(pv.bl,pv.sp).name+' ('+(pv.sp+1)+'/17)'}
function pvSp(d){pv.on=true;pv.sp=d==='r'?Math.floor(Math.random()*17):(pv.sp+d+17)%17;pvLabel();renderInfo()}
const PIXEL_ATLAS=new Image();
PIXEL_ATLAS.src='img-misc-pixel-atlas.png';
PIXEL_ATLAS.src='img-misc-pixel-atlas-2.png';
const BABY_ATLAS=new Image();
BABY_ATLAS.src='img-misc-baby-atlas.png';
const spriteLayer=document.createElement('canvas');spriteLayer.width=128;spriteLayer.height=128;
const spriteCtx=spriteLayer.getContext('2d');
const SPRITE_CACHE=Object.create(null);
function spriteFor(bl,elementIndex){
  const id=bl+'-'+elementIndex;
  if(!SPRITE_CACHE[id]){
    const image=new Image();
    image.src=(window.VAN_KIEP_ASSETS&&window.VAN_KIEP_ASSETS[id])||'sprites/'+id+'.png';
    SPRITE_CACHE[id]=image;
  }
  return SPRITE_CACHE[id];
}
function beast(t){
  const A=pv.on?pv.age:level,st=window.EVO?EVO.dispStage(stageOf(A),pv.on):stageOf(A),purity=pv.on?pv.pi:pet.pi; /* EVO: giữ sprite cũ tới lúc flash */
  const liveAge=pv.on?A:level+Math.min(1,exp/expNeed(level));
  gs+=(growthOf(liveAge)-gs)*.035;
  const key=pv.on?pv.bl:pet.bl,sp=pv.on?pv.sp:pet.sp,G=genOf(key,sp),B=BL[key];
  const g=gs,p=PL[purity][0],au=B.au,elementColor=G.ep[1],motif=G.ep[2];
  // Kích thước theo bậc (bảng STAGE_SCALE trong 02-sprites-engine.js), mượt dần khi lên bậc.
  const spriteApi=window.VanKiepSprites;
  const tgt=spriteApi?spriteApi.stageScale(st):.5;vs=vs?vs+(tgt-vs)*.035:tgt;
  const size=PET_STAGE_MAX_SIZE*G.sz*vs,x=180,y=194+Math.sin(t*3.8)*1.7;
  const stImg=spriteApi?spriteApi.getStageImage(key,sp,st):null;
  const bodyH=stImg?stImg.bb.h*size/128:size*.8;
  const tierAura=['176,162,151','101,220,181','99,158,255','199,115,255','255,202,73'][purity];
  const tierAlpha=[.12,.2,.27,.34,.43][purity],ringCount=[0,1,2,2,3][purity];
  const AX=window.PETAURA,axOn=!!(AX&&AX.ok),bodyW=stImg?stImg.bb.w*size/128:size*.7; /* AURA (14-aura.js): hào quang theo bậc + hệ */
  const haloY=y-bodyH*.55,haloR=56+purity*11+22*g;
  if(axOn)AX.back(c,x,y,bodyW,bodyH,t,'main',st,sp,purity,pv.on); /* AURA hook 1: quầng, tia, cột sáng, vòng chân (phía sau thú) */
  else{
  const glow=c.createRadialGradient(x,haloY,4,x,haloY,haloR);
  glow.addColorStop(0,'rgba('+tierAura+','+tierAlpha+')');
  glow.addColorStop(.55,'rgba('+au+','+(tierAlpha*.4)+')');
  glow.addColorStop(1,'rgba('+tierAura+',0)');
  c.fillStyle=glow;c.fillRect(x-haloR,y-size*1.3,haloR*2,size*1.5);}
  c.fillStyle='rgba(0,0,0,.42)';c.beginPath();c.ellipse(x,y+1,size*.38,7,0,0,Math.PI*2);c.fill();
  // Năm cấp huyết mạch có màu, số vòng và độ sáng khác nhau. (chỉ còn dùng khi không có 14-aura.js)
  if(!axOn){
  c.save();c.translate(x,haloY);c.scale(1,.28);c.rotate(t*(.08+purity*.045));
  for(let r=0;r<ringCount;r++){
    c.strokeStyle='rgba('+tierAura+','+(.38+purity*.1)+')';c.lineWidth=purity>=3?2:1.3;
    c.beginPath();c.arc(0,0,34+r*10+Math.sin(t*2+r)*1.5,0,Math.PI*2);c.stroke();
  }
  if(purity===4){
    c.fillStyle='rgba(255,231,153,.9)';
    for(let i=0;i<12;i++){const a=i*Math.PI/6,rr=54+(i%2)*7;c.fillRect(Math.cos(a)*rr-1.5,Math.sin(a)*rr-1.5,3,3)}
  }
  c.restore();}
  // Mỗi bậc là bản giảm chi tiết của ảnh trưởng thành (getStageImage), chân thú đặt đúng mặt đất.
  if(stImg){
    const bb=stImg.bb,u=size/128,beat=(key==='tuoc'||G.wing>0)?Math.sin(t*8)*.035:Math.sin(t*3)*.012;
    const dw=Math.max(1,Math.round(bb.w*u)),dh=Math.max(1,Math.round(bb.h*u*(1+beat)));
    if(!(window.EVO&&EVO.petDraw(c,stImg,bb,x,y,dw,dh))){ /* EVO: rung/bóng trắng/hiện hình khi đang tiến hóa */
    c.save();c.translate(Math.round(x),Math.round(y));c.imageSmoothingEnabled=false;if(axOn)c.filter=AX.rim(st,purity,false); /* AURA: viền sáng theo phẩm */
    c.drawImage(stImg,bb.x,bb.y,bb.w,bb.h,-Math.round(dw/2),-dh,dw,dh);c.restore();}
  }
  // Mỗi tên thú trong 17 hệ có sắc tố, hoa văn hạt sáng và phù hiệu riêng.
  if(axOn)AX.front(c,x,y,bodyW,bodyH,t,'main',st,sp,purity,pv.on); /* AURA hook 2: hạt, vệ tinh, vành sáng (phía trước thú) */
  else for(let i=0;i<8;i++){
    const u=(t*.17+i/8)%1,px=x+Math.sin(i*2.4+t*.6)*(size*.5),py=y-size*.2-u*size*.75;
    const motifType=i%2?['petal','flame','crystal','bolt'][G.fx]:motif;
    c.globalAlpha=Math.sin(u*Math.PI)*(.45+purity*.1);
    drawPixelMotif(px,py,motifType,elementColor,1.6+(i%2)*.5);
  }
  c.globalAlpha=1;
  if(G.mark>0&&(!axOn||st>=2))drawPixelMotif(x,y-size*.68,motif,elementColor,2+G.mark*.35);
  // Hào quang bậc cao quyện với hiệu ứng riêng của hệ thú. (cũ, chỉ dùng khi không có 14-aura.js)
  if(!axOn&&(G.orb||purity>=3)){
    const ox=x+Math.cos(t*1.1)*size*.48,oy=y-size*.72+Math.sin(t*1.7)*7;
    const og=c.createRadialGradient(ox,oy,0,ox,oy,10);
    og.addColorStop(0,'rgba(255,255,255,.98)');og.addColorStop(.4,elementColor);og.addColorStop(1,'rgba('+tierAura+',0)');
    c.fillStyle=og;c.beginPath();c.arc(ox,oy,10,0,Math.PI*2);c.fill();
  }
}
function lantern(x,y,p,t){
  const yy=y+Math.sin(t+p)*4;
  c.fillStyle='rgba(255,170,70,.25)';c.beginPath();c.arc(x,yy,16,0,7);c.fill();
  c.strokeStyle='#5a1a10';c.lineWidth=1;c.beginPath();c.moveTo(x,yy-14);c.lineTo(x,yy-9);c.stroke();
  const g=c.createRadialGradient(x-2,yy-2,1,x,yy,10);g.addColorStop(0,'#ffd27a');g.addColorStop(1,'#c0392b');
  c.fillStyle=g;c.beginPath();c.ellipse(x,yy,7,9,0,0,7);c.fill();
  c.fillStyle='#f2c76a';c.fillRect(x-4,yy-10,8,2);c.fillRect(x-4,yy+8,8,2);
  c.strokeStyle='#f2c76a';c.beginPath();c.moveTo(x,yy+10);c.lineTo(x,yy+16);c.stroke();
}

function frame(ms){
  const t=ms/1000;
  c.setTransform(K,0,0,K,0,0);c.clearRect(0,0,W,H);
  const aura=(hatched&&pet)?BL[pet.bl].au:(pv.on?BL[pv.bl].au:QC[eggQ]);
  const SE=(hatched&&pet)?pet.sp:(pv.on?pv.sp:-1);
  if(SE>=0)sceneDraw(t,SE);else{
  const sky=c.createLinearGradient(0,0,0,H);
  sky.addColorStop(0,'#100b17');sky.addColorStop(.48,'#281321');sky.addColorStop(1,'#100b13');
  c.fillStyle=sky;c.fillRect(0,0,W,H);
  // Tia sáng chuyển động phía sau linh thú.
  c.save();c.translate(180,128);c.rotate(t*.018);
  for(let i=0;i<30;i++){
    const a=i*Math.PI*2/30,w=.025+(i%3)*.009,len=430;
    c.fillStyle='rgba(214,66,67,'+(.07+.07*(.5+.5*Math.sin(t*1.4+i)))+')';
    c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a-w)*len,Math.sin(a-w)*len);
    c.lineTo(Math.cos(a+w)*len,Math.sin(a+w)*len);c.closePath();c.fill();
  }
  c.restore();
  const center=c.createRadialGradient(180,135,4,180,135,145);
  center.addColorStop(0,'rgba('+aura+',.24)');center.addColorStop(.42,'rgba(222,68,68,.12)');center.addColorStop(1,'rgba(120,25,42,0)');
  c.fillStyle=center;c.fillRect(0,0,W,H);
  const beam=c.createLinearGradient(180,0,180,140);
  beam.addColorStop(0,'rgba(255,231,216,.14)');beam.addColorStop(1,'rgba(255,150,132,0)');
  c.fillStyle=beam;c.beginPath();c.moveTo(143,0);c.lineTo(217,0);c.lineTo(194,140);c.lineTo(166,140);c.closePath();c.fill();
  stars.forEach(s=>{c.fillStyle='rgba(255,221,190,'+(.25+.55*Math.abs(Math.sin(t+s.s)))+')';c.fillRect(Math.round(s.x),Math.round(s.y),2,2)});
  // Lớp núi và sương giữ chiều sâu, nhưng chìm vào nền tối.
  c.save();c.globalAlpha=.48;
  mountain(113,43,'#3c2336','#251623',0,1);
  mountain(130,35,'#2a1b2c','#1a121d',t*.2,3);
  c.restore();
  c.fillStyle='rgba(255,154,137,'+(.025+.018*Math.sin(t*1.2)+.018)+')';c.fillRect(0,125+Math.sin(t*.5)*2,W,16);
  const ground=c.createLinearGradient(0,132,0,H);
  ground.addColorStop(0,'rgba(55,25,38,.75)');ground.addColorStop(1,'#100b13');
  c.fillStyle=ground;c.fillRect(0,132,W,H-132);
  c.strokeStyle='rgba(255,133,111,.075)';c.lineWidth=.8;
  for(let i=-7;i<=7;i++){c.beginPath();c.moveTo(180+i*10,136);c.lineTo(180+i*42,H);c.stroke()}
  for(let j=0;j<6;j++){const p=((j+t*.12)%6)/6,y=136+(H-136)*p*p;c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  // Cột đá tối làm khung cảnh, để linh thú luôn là điểm nhìn chính.
  for(const s of[-1,1]){const px=s<0?18:342;
    c.fillStyle='#24131d';c.fillRect(px-5,78,10,105);c.fillStyle='rgba(207,113,81,.42)';c.fillRect(px-7,74,14,4);c.fillRect(px-7,181,14,4);
    c.fillStyle='rgba(255,220,200,.08)';c.fillRect(px-3,78,2,105)}
  lanterns.forEach(l=>lantern(l[0],l[1],l[2],t));}
  formation(t,SE);
  if(window.EVO)EVO.pre(c,ms); /* EVO: màn tối + tia sáng, chạy trước khi vẽ thú */
  try{(hatched||pv.on)?beast(t):egg(t)}catch(e){console.error(e)}
  // Hào quang nở rộng khi trứng đổi trạng thái, nở hoặc tiến hóa.
  if(burst>0){
    const r=(1.6-burst)*120+10;
    c.strokeStyle='rgba(255,185,118,'+Math.min(1,burst)+')';c.lineWidth=4*burst;
    c.beginPath();c.arc(180,125,r,0,7);c.stroke();
    c.fillStyle='rgba(255,164,121,'+burst*.12+')';c.fillRect(0,0,W,H);
    burst-=.012;
  }
  // Linh khí lấp lánh như những hạt pixel.
  motes.forEach(m=>{m.y-=m.v;m.x+=Math.sin(t+m.p)*.2;if(m.y<0){m.y=H;m.x=Math.random()*W}
    const col=(hatched||pv.on)?aura:'255,153,111';
    c.fillStyle='rgba('+col+','+(.28+.55*Math.sin(t*2+m.p)**2)+')';
    const sz=Math.max(1,Math.round(m.r));c.fillRect(Math.round(m.x),Math.round(m.y),sz,sz)});
  // Viền tối kiểu màn hình arcade.
  const v=c.createRadialGradient(180,125,90,180,125,230);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.55)');
  c.fillStyle=v;c.fillRect(0,0,W,H);
  if(window.EVO)EVO.top(c); /* EVO: hạt, sóng xung kích, flash trắng (vẽ sau viền tối) */
  requestAnimationFrame(frame);
}
// thanh thời gian tới tuổi mới
setInterval(()=>{
  if(!chosen){$('tb-fill').style.width='0%';$('tb-text').textContent='Đang chọn trứng';return}
    const T=tickMs(),e=Date.now()-lastTick,p=Math.min(1,e/T);
  $('tb-fill').style.width=(p*100)+'%';
  $('tb-text').textContent=Math.max(0,Math.ceil((T-e)/1000))+'s';
},50);
pvLabel();renderPick();$('banner').textContent='Chọn Linh Trứng';$('h-status').textContent='Đang chọn Linh Trứng';
// rung trứng khi cần chăm sóc

requestAnimationFrame(frame);
