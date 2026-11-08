
/* ===== V2: Phong cảnh 17 hệ + Balo ===== */
const SCN=[
['Tuyết Nguyên',['#0d1b2e','#2a4a6b','#b8d8ea'],['#dcecf5','#6f98b4'],'#9bbcd4','200,235,255','aurora','spike','snow'],
['Sương Cốc',['#1a2a2a','#3f5a58','#a8c4be'],['#5e8079','#1f3532'],'#6f918b','210,235,228','fog','rock','mist'],
['Vân Đảo',['#2b2552','#6a5aa8','#e6c9ee'],['#8a7bc0','#3a3070'],'#9a8ad0','240,230,255','cloud','rock','mist'],
['Phong Nguyên',['#0f2a22','#2f7a5a','#c8f5dc'],['#3c9a64','#134a2e'],'#4ba777','200,255,224','none','grass','streak'],
['Lôi Vực',['#0a0a18','#2a2450','#5a4a88'],['#2a2a40','#0a0a14'],'#34305a','255,232,106','bolt','spike','spark'],
['Nguyệt Cung',['#080a1e','#1a2058','#5a64b8'],['#3a3f8a','#10133a'],'#2a3070','216,216,255','moon','tree','star'],
['Dương Sơn',['#3a1204','#c8581e','#ffd28a'],['#b8683a','#4a1e0c'],'#c06a30','255,210,138','sun','rock','ember'],
['Huyền Uyên',['#05050a','#1a1a2e','#3a3a5a'],['#25253a','#06060c'],'#16162a','140,140,190','rift','spike','star'],
['Kim Khoáng',['#1c1204','#5a3e0c','#d8a838'],['#9a7420','#3a2606'],'#8a6418','255,210,74','none','crystal','glint'],
['Ngọc Động',['#04201a','#0f6a54','#8affd0'],['#2a9a7a','#0a3a2e'],'#1f8a6c','168,255,216','none','gem','glint'],
['Thanh Lâm',['#06180c','#1c5a32','#a6e8a0'],['#2c8a44','#0c3016'],'#2a7a40','122,255,192','fog','tree','leaf'],
['Xích Hỏa Địa',['#1a0404','#7a1a0a','#ff7a3a'],['#5a1a10','#1a0402'],'#6a1a0e','255,122,106','lava','rock','ember'],
['Hắc Ám Lâm',['#030308','#140c1e','#2c1c3c'],['#1c1226','#05030a'],'#100818','146,119,149','none','dead','eyes'],
['Tử Tinh Hải',['#0a0420','#3a1068','#a85ae0'],['#5a2a9a','#1a0a3a'],'#4a2088','192,106,255','galaxy','crystal','star'],
['Thiên Không',['#2a5ea8','#6aaee8','#e8f6ff'],['#9ac8ee','#4a7ab0'],'#b0d4f0','174,224,255','cloud','pillar','feather'],
['Linh Hoa Viên',['#2a0a24','#8a2a74','#ffc8e8'],['#c85a9a','#4a1a3a'],'#b04a8c','255,208,240','none','blossom','petal'],
 ['Thần Điện',['#101a36','#354c74','#fff0bc'],['#9f783d','#30251c'],'#8e713c','255,226,132','halo','pillar','glint']
];
const SCENE_ART_DATA=[
  "img-scenes-scene-01.png",
  "img-scenes-scene-02.png",
  "img-scenes-scene-03.png",
  "img-scenes-scene-04.png",
  "img-scenes-scene-05.png",
  "img-scenes-scene-06.png",
  "img-scenes-scene-07.png",
  "img-scenes-scene-08.png",
  "img-scenes-scene-09.png",
  "img-scenes-scene-10.png",
  "img-scenes-scene-11.png",
  "img-scenes-scene-12.png",
  "img-scenes-scene-13.png",
  "img-scenes-scene-14.png",
  "img-scenes-scene-15.png",
  "img-scenes-scene-16.png",
  "img-scenes-scene-17.png"
];
const SCENE_ART=SCENE_ART_DATA.map(src=>{const img=new Image();img.src=src;return img;});
const AMBIENT_SPRITES=new Image();
AMBIENT_SPRITES.src="img-misc-ambient-sprites.png";
function tri(a,b,d,e,g,h){c.beginPath();c.moveTo(a,b);c.lineTo(d,e);c.lineTo(g,h);c.closePath()}
function sceneBg(b,t,A,F){
 if(b=='moon'){const x=270,y=58,r=30,g=c.createRadialGradient(x,y,r*.6,x,y,r*3);g.addColorStop(0,F(.35));g.addColorStop(1,F(0));c.fillStyle=g;c.fillRect(x-100,y-100,200,200);
  c.fillStyle='#eef0ff';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.fillStyle='rgba(120,130,190,.35)';
  [[-8,-6,6],[9,4,8],[-3,12,4]].forEach(m=>{c.beginPath();c.arc(x+m[0],y+m[1],m[2],0,7);c.fill()})}
 else if(b=='sun'){c.save();c.translate(180,118);c.rotate(t*.05);c.fillStyle=F(.13);
  for(let i=0;i<20;i++){const a=i*Math.PI/10;tri(0,0,Math.cos(a-.05)*260,Math.sin(a-.05)*260,Math.cos(a+.05)*260,Math.sin(a+.05)*260);c.fill()}
  c.restore();const g=c.createRadialGradient(180,118,4,180,118,50);g.addColorStop(0,'#fffbd0');g.addColorStop(.6,'#ffc050');g.addColorStop(1,'rgba(255,150,50,0)');
  c.fillStyle=g;c.fillRect(120,60,120,70)}
 else if(b=='aurora'){for(let i=0;i<3;i++){c.strokeStyle=['rgba(120,255,200,.16)','rgba(140,190,255,.16)','rgba(200,150,255,.14)'][i];c.lineWidth=14;c.beginPath();
  for(let x=0;x<=W;x+=8){const y=36+i*16+Math.sin(x*.02+t*.6+i*1.7)*11;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}}
 else if(b=='bolt'){c.fillStyle='rgba(18,16,40,.85)';
  for(let i=0;i<6;i++){c.beginPath();c.ellipse((i*70+t*6)%460-50,22+(i%3)*12,60,16,0,0,7);c.fill()}
  const T=t%3,s=Math.floor(t/3);
  if(T<.35){const a=1-T/.35;c.fillStyle=F(.2*a);c.fillRect(0,0,W,H);c.strokeStyle='rgba(255,250,200,'+a+')';c.lineWidth=2.4;c.beginPath();
   let x=60+SR(s)*240,y=30;c.moveTo(x,y);for(let k=0;k<7;k++){x+=(SR(s*9+k)-.5)*34;y+=14;c.lineTo(x,y)}c.stroke()}}
 else if(b=='cloud'){c.fillStyle=F(.22);
  for(let i=0;i<7;i++){const x=(i*62+t*5*(1+i%3))%440-40,y=30+(i*23)%70;c.beginPath();c.ellipse(x,y,34,9,0,0,7);c.fill();c.beginPath();c.ellipse(x+14,y-5,20,8,0,0,7);c.fill()}
  [[60,78,0],[300,96,2]].forEach(([x,y,p])=>{y+=Math.sin(t+p)*4;c.fillStyle='#4a4660';tri(x-26,y,x+26,y,x,y+30);c.fill();
   c.fillStyle='rgba(120,230,150,.9)';c.beginPath();c.ellipse(x,y,28,6,0,0,7);c.fill()})}
 else if(b=='halo'){c.save();c.translate(180,96);c.rotate(t*.06);c.fillStyle=F(.1);
  for(let i=0;i<16;i++){const a=i*Math.PI/8;tri(0,0,Math.cos(a-.07)*280,Math.sin(a-.07)*280,Math.cos(a+.07)*280,Math.sin(a+.07)*280);c.fill()}
  c.restore();c.strokeStyle=F(.6);c.lineWidth=2;c.beginPath();c.arc(180,96,52+Math.sin(t*2)*2,0,7);c.stroke();c.beginPath();c.arc(180,96,66,0,7);c.stroke()}
 else if(b=='galaxy'){for(let a=0;a<3;a++)for(let r=3;r<95;r+=2){const q=t*.08+a*2.094+r*.055;c.fillStyle=F(Math.max(0,.75-r/130));c.fillRect(180+Math.cos(q)*r*1.9,66+Math.sin(q)*r*.5,2,2)}
  const g=c.createRadialGradient(180,66,0,180,66,24);g.addColorStop(0,'rgba(255,240,255,.9)');g.addColorStop(1,F(0));c.fillStyle=g;c.fillRect(150,40,60,50)}
 else if(b=='rift'){const g=c.createRadialGradient(180,72,4,180,72,70);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.5,'rgba(10,6,24,.9)');g.addColorStop(1,F(0));c.fillStyle=g;c.fillRect(100,20,160,100);
  c.strokeStyle=F(.85);c.lineWidth=2;c.setLineDash([7,9]);c.lineDashOffset=-t*22;c.beginPath();c.ellipse(180,72,52,22,0,0,7);c.stroke();
  c.lineDashOffset=t*16;c.beginPath();c.ellipse(180,72,36,15,0,0,7);c.stroke();c.setLineDash([])}
 else if(b=='lava'){const g=c.createLinearGradient(0,60,0,128);g.addColorStop(0,F(0));g.addColorStop(1,F(.45));c.fillStyle=g;c.fillRect(0,60,W,68);
  c.fillStyle='#240a0a';tri(240,128,296,64,352,128);c.fill();c.fillStyle='rgba(255,140,60,'+(.6+.3*Math.sin(t*3))+')';c.beginPath();c.ellipse(296,66,10,3,0,0,7);c.fill()}
}
function ob(k,x,y,s,t,A,i){
 const F=a=>'rgba('+A+','+a+')',sw=Math.sin(t*1.4+i*1.9)*2;
 const fl=a=>{c.fillStyle='rgba(8,8,16,.8)';c.fill();c.fillStyle=F(a);c.fill();c.stroke()};
 c.save();c.translate(x,y);c.scale(s,s);
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,1,15,3.5,0,0,7);c.fill();
 c.lineWidth=1.3;c.strokeStyle=F(.9);
 if(k=='spike'){for(let j=-1;j<=1;j++){const h=38-Math.abs(j)*13+(i%3)*3,x0=j*10;tri(x0-6,0,x0,-h,x0+6,0);fl(.3);tri(x0-6,0,x0,-h,x0,0);c.fillStyle=F(.3);c.fill()}}
 else if(k=='grass'){c.lineWidth=2;for(let j=-3;j<=3;j++){c.beginPath();c.moveTo(j*4,0);c.quadraticCurveTo(j*4+sw,-14,j*5+sw*2.2,-22-(3-Math.abs(j))*3);c.stroke()}}
 else if(k=='crystal'){[[-10,30],[0,46],[10,26]].forEach(([x0,h])=>{c.beginPath();c.moveTo(x0-5,0);c.lineTo(x0-5,-h+9);c.lineTo(x0,-h);c.lineTo(x0+5,-h+9);c.lineTo(x0+5,0);c.closePath();fl(.3);
  c.beginPath();c.moveTo(x0-5,0);c.lineTo(x0-5,-h+9);c.lineTo(x0,-h);c.lineTo(x0,0);c.closePath();c.fillStyle=F(.3);c.fill()})}
 else if(k=='gem'){[[-7,-20,1],[8,-34,.7],[0,-8,.5]].forEach(([x0,y0,q])=>{const b=y0+sw*q;c.beginPath();c.moveTo(x0,b-13*q);c.lineTo(x0+8*q,b);c.lineTo(x0,b+13*q);c.lineTo(x0-8*q,b);c.closePath();fl(.5);
  c.beginPath();c.moveTo(x0-8*q,b);c.lineTo(x0+8*q,b);c.stroke()})}
 else if(k=='tree'){c.fillStyle='#2a1a12';c.fillRect(-2,-16,4,16);for(let j=0;j<3;j++){tri(-14+j*2.5,-14-j*13,0,-32-j*13,14-j*2.5,-14-j*13);fl(.45-j*.08)}}
 else if(k=='dead'){c.strokeStyle='#0a0610';c.lineWidth=4;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(-5,-20,2,-38);c.moveTo(-2,-16);c.lineTo(-15,-30);c.moveTo(1,-28);c.lineTo(13,-42);c.moveTo(-1,-34);c.lineTo(-9,-46);c.stroke();
  c.strokeStyle=F(.5);c.lineWidth=1;c.stroke()}
 else if(k=='blossom'){c.fillStyle='#2c1424';c.fillRect(-2,-20,4,20);[[0,-34,14],[-11,-27,10],[11,-27,10],[1,-44,9]].forEach(([x0,y0,r])=>{c.beginPath();c.arc(x0+sw*.4,y0,r,0,7);fl(.7)})}
 else if(k=='pillar'){c.beginPath();c.rect(-6,-48,12,46);fl(.22);c.fillStyle=F(.7);c.fillRect(-9,-52,18,4);c.fillRect(-9,-3,18,3);
  c.strokeStyle=F(.35);c.beginPath();c.moveTo(-2,-46);c.lineTo(-2,-4);c.moveTo(2,-46);c.lineTo(2,-4);c.stroke()}
 else{c.beginPath();c.moveTo(-15,0);c.lineTo(-11,-14);c.lineTo(-3,-21);c.lineTo(8,-16);c.lineTo(15,0);c.closePath();fl(.18)}
 c.restore();
}
function scPt(p,t,A,F){
 let i,x,y;
 if(p=='snow')for(i=0;i<40;i++){x=(i*53+t*7*(1+i%3*.3)+Math.sin(t+i)*9)%W;y=(i*37+t*(16+i%4*6))%H;c.fillStyle='rgba(255,255,255,.85)';c.fillRect(x,y,1+i%2,1+i%2)}
 else if(p=='mist')for(i=0;i<8;i++){x=(i*61+t*6)%420-30;y=130+(i*29)%110;const g=c.createRadialGradient(x,y,2,x,y,32);g.addColorStop(0,F(.12));g.addColorStop(1,F(0));c.fillStyle=g;c.fillRect(x-32,y-32,64,64)}
 else if(p=='streak'){c.strokeStyle=F(.4);c.lineWidth=1;for(i=0;i<14;i++){x=(t*110*(1+i%3*.5)+i*67)%(W+80)-40;y=14+i*16;c.beginPath();c.moveTo(x,y);c.lineTo(x+22+i%3*10,y);c.stroke()}}
 else if(p=='spark')for(i=0;i<16;i++){if(Math.sin(t*9+i*3)>.6){c.fillStyle=F(.95);c.fillRect(SR(i)*W,SR(i+7)*H,2,2+i%3)}}
 else if(p=='star')for(i=0;i<34;i++){c.fillStyle='rgba(255,255,255,'+(.2+.7*Math.abs(Math.sin(t*1.3+i)))+')';c.fillRect(Math.round(SR(i)*W),Math.round(SR(i+3)*115),i%5?1:2,i%5?1:2)}
 else if(p=='ember')for(i=0;i<26;i++){x=(i*41+Math.sin(t+i)*14)%W;y=H-((t*(18+i%5*7)+i*29)%H);c.fillStyle=F(Math.min(1,y/H+.2));c.fillRect(x,y,2,2)}
 else if(p=='glint')for(i=0;i<16;i++){const a=Math.sin(t*2+i*1.7);if(a<.1)continue;x=SR(i+20)*W;y=70+SR(i+40)*170;c.fillStyle=F(a);c.fillRect(x-3,y,7,1);c.fillRect(x,y-3,1,7)}
 else if(p=='leaf'||p=='petal'||p=='feather'){const fe=p=='feather';for(i=0;i<22;i++){x=(i*47+t*9+Math.sin(t*.8+i)*16)%W;y=(t*(13+i%3*5)+i*31)%H;c.save();c.translate(x,y);c.rotate(t+i);
  c.fillStyle=p=='leaf'?F(.85):p=='petal'?'rgba(255,170,215,.85)':'rgba(255,255,255,.8)';c.fillRect(-3,-1,fe?7:5,fe?1:2);c.restore()}}
 else if(p=='eyes')for(i=0;i<6;i++){if(Math.sin(t*.7+i*2.3)>.2){x=20+SR(i+60)*320;y=96+SR(i+70)*110;if(Math.abs(x-180)<70)continue;c.fillStyle='rgba(255,70,70,.95)';c.fillRect(x,y,2,2);c.fillRect(x+6,y,2,2)}}
}
function scPoly(points,fill,stroke){
 c.beginPath();c.moveTo(points[0][0],points[0][1]);
 for(let i=1;i<points.length;i++)c.lineTo(points[i][0],points[i][1]);
 c.closePath();c.fillStyle=fill;c.fill();
 if(stroke){c.strokeStyle=stroke;c.stroke()}
}
function scFir(x,y,s,leaf,light,snow=false){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
 c.fillStyle='#211b20';c.fillRect(-2,-15,4,15);
 for(let j=0;j<3;j++){
   const top=-54+j*13,wide=18-j*3;
   scPoly([[-wide,top+20],[0,top],[wide,top+20],[0,top+15]],leaf);
   c.fillStyle=light;c.fillRect(-1,top+8,2,8);
   if(snow){c.fillStyle='rgba(245,252,255,.82)';c.fillRect(-wide+3,top+17,wide-3,2);c.fillRect(1,top+8,wide*.48,2)}
 }
 c.restore();
}
function scCrystal(x,y,s,color,glow,t){
 c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
 const pulse=.55+.25*Math.sin(t*2.3+x*.05);
 c.fillStyle='rgba('+glow+','+(.16+pulse*.16)+')';c.beginPath();c.arc(0,-17,22,0,Math.PI*2);c.fill();
 scPoly([[-12,0],[-9,-27],[-2,-41],[5,-26],[11,0]],color,'rgba(255,255,255,.45)');
 scPoly([[-9,-4],[-5,-26],[-2,-35],[0,-5]],'rgba(255,255,255,.28)');
  c.fillStyle='rgba(255,255,255,'+(.35+.4*Math.max(0,Math.sin(t*3+x)))+')';c.fillRect(-2,-30,2,5);
 c.restore();
}
function scPillar(x,y,h,color,glow){
 c.fillStyle=color;c.fillRect(x-7,y-h,14,h);
 c.fillStyle='rgba(255,255,255,.12)';c.fillRect(x-4,y-h+3,2,h-6);
 c.fillStyle=glow;c.fillRect(x-10,y-h-3,20,4);c.fillRect(x-9,y-2,18,3);
 for(let j=0;j<3;j++){c.fillStyle='rgba(255,255,255,.10)';c.fillRect(x-3,y-h+12+j*13,6,2)}
}
function scBrickPillar(x,y,h,deep,stone,light){
 c.fillStyle='#171b28';c.fillRect(x-13,y-h-7,26,h+10);
 c.fillStyle=deep;c.fillRect(x-10,y-h,20,h);
 c.fillStyle=stone;c.fillRect(x-7,y-h+3,14,h-6);
 c.fillStyle='rgba(255,238,177,.55)';c.fillRect(x-8,y-h+2,2,h-4);
 c.fillStyle='rgba(0,0,0,.32)';c.fillRect(x+5,y-h+3,3,h-6);
 for(let j=0;j<h;j+=13){
   c.fillStyle=deep;c.fillRect(x-10,y-h+j,20,2);
   c.fillStyle='rgba(255,230,155,.45)';c.fillRect(x-7,y-h+j+3,5,1);c.fillRect(x+2,y-h+j+6,4,1);
 }
 c.fillStyle=deep;c.fillRect(x-15,y-h-8,30,7);c.fillRect(x-17,y-3,34,6);
 c.fillStyle=light;c.fillRect(x-16,y-h-8,32,2);c.fillRect(x-18,y-3,36,2);
 c.fillStyle='rgba(255,245,196,.75)';c.fillRect(x-2,y-h+11,3,3);c.fillRect(x-1,y-h+10,1,5);
}
function drawScenePixelTexture(t,k,A){
 const [,sky,ground,,]=SCN[k];
 c.save();c.globalCompositeOperation='screen';
 // Scattered, deterministic glints give each sky a finer pixel-scale texture.
 const skyDots=k===16?31:18;
 for(let i=0;i<skyDots;i++){
   const x=Math.round(SR(k*73+i*17)*W),y=Math.round(SR(k*131+i*29)*116);
   const blink=.2+.65*Math.abs(Math.sin(t*1.7+i*2.13+k));
   c.fillStyle='rgba('+A+','+blink+')';
   if(i%7===0){c.fillRect(x-2,y,5,1);c.fillRect(x,y-2,1,5)}
   else c.fillRect(x,y,i%4===0?2:1,i%4===0?2:1);
 }
 c.restore();
 c.save();c.globalAlpha=.45;
 // Small block highlights make the ground read as stone, snow, grass, or crystal.
 for(let i=0;i<58;i++){
   const x=Math.round(SR(k*311+i*11)*W),y=134+Math.round(SR(k*173+i*37)*(H-139));
   const w=2+(i%4),h=1+(i%3===0?1:0);
   c.fillStyle=i%4===0?'rgba('+A+',.72)':(i%2?ground[0]:sky[1]);
   c.fillRect(x,y,w,h);
   if(i%9===0){c.fillStyle='rgba(255,255,255,.32)';c.fillRect(x,y,w,1)}
 }
 c.restore();
 if(k===0){
   c.save();c.globalAlpha=.62;c.fillStyle='rgba(231,247,255,.78)';
   for(let i=0;i<18;i++){const x=(i*23+Math.sin(t*.55+i)*5)%W,y=130+(i*31%112);c.fillRect(x,y,5+i%3,1+i%2)}
   c.restore();
 }else if(k===11||k===6){
   c.save();c.globalCompositeOperation='screen';
   for(let i=0;i<15;i++){const x=(i*31+11)%W,y=144+(i*19%99),glow=.12+.38*Math.max(0,Math.sin(t*2+i));c.fillStyle='rgba(255,92,27,'+glow+')';c.fillRect(x,y,3+i%4,1+i%2)}
   c.restore();
 }else if(k===13){
   c.save();c.globalAlpha=.42;c.strokeStyle='rgba('+A+',.75)';c.lineWidth=1;
   for(let i=0;i<10;i++){const y=142+i*10+Math.sin(t+i)*2;c.beginPath();c.moveTo(0,y);c.lineTo(W,y+Math.sin(t*.5+i)*3);c.stroke()}
   c.restore();
 }else if(k===16){
   c.save();c.globalAlpha=.78;
   // Perspective floor seams lead toward the altar and catch the central beam.
   c.strokeStyle='rgba(255,223,139,.48)';c.lineWidth=1;
   for(let i=-6;i<=6;i++){c.beginPath();c.moveTo(180+i*5,220);c.lineTo(180+i*28,H);c.stroke()}
   for(let y=226;y<H;y+=7){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
   c.globalCompositeOperation='screen';c.fillStyle='rgba(255,221,114,'+(.08+.05*Math.sin(t*2))+')';c.fillRect(173,210,14,40);
   c.restore();
 }
}
function drawSceneSprites(t,k,A,F){
 const deep=SCN[k][1][0],mid=SCN[k][1][1],light=SCN[k][1][2],accent=SCN[k][3];
 const drift=Math.sin(t*.42+k)*2.4;
 c.save();c.globalAlpha=.58;
 if(k===16){
   c.globalCompositeOperation='screen';
   const beam=c.createLinearGradient(180,0,180,205);
   beam.addColorStop(0,'rgba(255,250,205,.78)');beam.addColorStop(.45,'rgba(255,219,112,.22)');beam.addColorStop(1,'rgba(255,196,73,0)');
   scPoly([[165,0],[195,0],[244,205],[116,205]],beam);
   c.globalCompositeOperation='source-over';
 }
 // Far silhouettes give each region a skyline that shifts subtly at a different depth.
 if(k===0||k===10||k===12||k===15){
   for(const [x,s] of [[18,.78],[54,.58],[306,.65],[344,.88]]){
     if(k===12){c.strokeStyle=deep;c.lineWidth=4;c.beginPath();c.moveTo(x,128);c.quadraticCurveTo(x-7,91,x+drift,64);c.lineTo(x-13,83);c.moveTo(x+drift,92);c.lineTo(x+14,75);c.moveTo(x-3,105);c.lineTo(x-18,93);c.stroke()}
     else if(k===15){
       c.fillStyle=deep;c.fillRect(x-2,86,4,42);c.fillRect(x-2,98,13,3);c.fillRect(x-10,107,12,3);
       c.fillStyle=accent;c.fillRect(x-7,91,5,5);c.fillRect(x+7,96,5,5);c.fillRect(x-12,103,5,5);
       c.fillStyle=light;c.fillRect(x-5,92,2,2);c.fillRect(x+9,97,2,2);c.fillRect(x-10,104,2,2);
     }
     else scFir(x,128,s,deep,light,k===0);
   }
 }else if(k===1||k===9){
   for(let i=0;i<7;i++){
     const x=18+i*54+drift*(i%2?1:-1),h=12+(i*17%29);
     scPoly([[x-7,0],[x+6,0],[x+2,h],[x-2,h+5]],deep);
     c.fillStyle=light;c.fillRect(x-1,h-3,2,5);
   }
   if(k===9){scCrystal(37,128,.45,mid,A,t);scCrystal(322,128,.52,mid,A,t+1)}
 }else if(k===2||k===14){
   for(let i=0;i<4;i++){
     const x=(28+i*96+drift*(i%2?1:-1));
     const y=72+(i%2)*23+Math.sin(t*.5+i)*3;
     c.fillStyle='rgba(255,255,255,.16)';c.beginPath();c.ellipse(x,y,27,7,0,0,7);c.fill();
     scPoly([[x-22,y+3],[x+21,y+3],[x+10,y+13],[x-8,y+17]],deep);
     c.fillStyle=light;c.fillRect(x-12,y+4,2,6);c.fillRect(x+7,y+7,2,5);
     if(k===14&&i%2===0)scPillar(x,y+3,24,deep,light);
   }
 }else if(k===3){
   for(let i=0;i<9;i++){const x=i*46+10+drift,y=130-(i%3)*7;
     scPoly([[x-20,y],[x-7,y-23-(i%2)*8],[x+3,y-9],[x+15,y-31],[x+26,y]],deep);
     c.fillStyle=light;c.fillRect(x-6,y-13,2,3);c.fillRect(x+14,y-19,2,3)}
  }else if(k===16){
    scBrickPillar(29,204,148,'#25283a','#78613b',light);
    scBrickPillar(331,204,148,'#25283a','#78613b',light);
    scBrickPillar(78,161,76,deep,mid,light);
    scBrickPillar(282,161,76,deep,mid,light);
    for(let side of[-1,1]){
     const x=29+side*2;
      scPoly([[x,75],[x+side*10,60],[x+side*18,43],[x+side*23,50],[x+side*32,38],[x+side*27,57],[x+side*17,70],[x+side*9,83]],'#d5a64e','rgba(255,235,160,.72)');
      c.strokeStyle='rgba(255,243,190,.8)';c.lineWidth=2;
      c.beginPath();c.moveTo(x+side*8,70);c.lineTo(x+side*28,44);c.moveTo(x+side*11,76);c.lineTo(x+side*22,51);c.stroke();
    }
    c.strokeStyle='rgba(255,221,126,.9)';c.lineWidth=3;
    for(let i=0;i<=22;i++){const a=Math.PI+i*Math.PI/22,x=180+Math.cos(a)*66,y=130+Math.sin(a)*47;c.fillStyle=i%3?'#b28d48':'#fff0ad';c.fillRect(Math.round(x)-2,Math.round(y)-2,4,4)}
  }else if(k===4||k===5){
   for(const [x,h] of [[23,48],[62,31],[298,38],[339,55]])scPillar(x,130,h,deep,light);
    if(k===5){scFir(83,128,.55,deep,light);scFir(278,128,.62,deep,light)}
 }else if(k===6||k===11){
   for(let i=0;i<5;i++){
     const x=18+i*81+drift,y=131,h=23+(i*13%35);
     scPoly([[x-28,y],[x-12,y-h*.72],[x-5,y-h],[x+4,y-h*.55],[x+14,y-h*.82],[x+29,y]],deep);
     c.fillStyle=light;c.fillRect(x-7,y-h+8,3,Math.max(5,h*.34));
   }
 }else if(k===7){
   for(const [x,h] of [[28,43],[72,25],[291,31],[334,50]]){
     scPoly([[x-12,130],[x-5,130-h*.72],[x+1,130-h],[x+5,130-h*.35],[x+13,130]],deep,'rgba('+A+',.35)');
     c.strokeStyle=accent;c.lineWidth=1;c.beginPath();c.moveTo(x,130-h*.8);c.lineTo(x-4,130-h*.42);c.lineTo(x+3,130-h*.2);c.stroke();
   }
 }else if(k===8||k===10){
   if(k===8){
     for(const x of[28,74,286,332]){c.strokeStyle=deep;c.lineWidth=5;c.beginPath();c.moveTo(x,128);c.lineTo(x,76);c.lineTo(x+18,76);c.lineTo(x+18,128);c.stroke();c.lineWidth=2;c.strokeStyle=light;c.beginPath();c.moveTo(x-2,86);c.lineTo(x+20,86);c.stroke()}
     scCrystal(104,128,.5,'#e5bb55','255,220,110',t);scCrystal(253,128,.6,'#f5d66c','255,220,110',t+2);
   }else{scFir(34,128,.85,deep,light);scFir(326,128,.78,deep,light)}
 }else if(k===13){
   // Coral silhouettes and rising bubbles make the crystal sea read as underwater.
   for(const x of[22,67,297,342]){
     c.strokeStyle=deep;c.lineWidth=4;c.beginPath();c.moveTo(x,130);c.lineTo(x,101);c.lineTo(x-9,91);c.moveTo(x,111);c.lineTo(x+10,99);c.moveTo(x-1,118);c.lineTo(x-12,109);c.stroke();
     c.fillStyle=light;c.fillRect(x-10,89,3,3);c.fillRect(x+8,97,3,3);
   }
 }else{
   scCrystal(28,128,.68,mid,A,t);scCrystal(332,128,.7,mid,A,t+1);
 }
 c.restore();
 // Foreground accents stay close to the edges so they frame, rather than hide, the creature.
 c.save();c.globalAlpha=.78;
 if(k===3||k===10||k===15){
   for(const x of[7,15,345,353]){const sway=Math.sin(t*2+x)*3;c.strokeStyle=light;c.lineWidth=2;c.beginPath();c.moveTo(x,246);c.quadraticCurveTo(x+sway,232,x+sway*1.8,220-(x%3)*3);c.stroke();
     if(k===15){c.fillStyle=accent;c.fillRect(x+sway*1.8-2,218-(x%3)*3,5,5)}}
 }else if(k===0||k===8||k===9||k===13){
   for(const x of[12,348])scCrystal(x,246,.34,k===0?'#d9f4ff':mid,A,t+x);
 }else if(k===16){
   // Pixel-stone altar and descending stairs, echoing the reference without its egg.
   scPoly([[0,226],[27,202],[54,183],[83,174],[277,174],[306,183],[333,202],[360,226],[346,250],[14,250]],'#241d1c');
   scPoly([[12,219],[39,197],[64,182],[89,178],[271,178],[296,182],[321,197],[348,219],[322,226],[38,226]],'#6e542d','rgba(255,230,157,.8)');
   scPoly([[37,215],[62,195],[82,186],[278,186],[298,195],[323,215],[296,222],[64,222]],'#b18a42');
   c.strokeStyle='rgba(255,238,166,.7)';c.lineWidth=2;
   for(let r=0;r<3;r++){c.beginPath();c.ellipse(180,202+r*5,65+r*17,6+r*2,0,0,Math.PI*2);c.stroke()}
   scPoly([[129,215],[231,215],[257,250],[103,250]],'#372a25');
   scPoly([[137,215],[223,215],[246,250],[114,250]],'#ad8138');
   c.strokeStyle='rgba(255,228,135,.9)';c.lineWidth=2;
   for(let y=220;y<249;y+=5){const inset=(y-214)*.62;c.beginPath();c.moveTo(140-inset,y);c.lineTo(220+inset,y);c.stroke()}
   c.fillStyle='rgba(255,246,184,.7)';c.fillRect(174,218,12,32);
   c.fillStyle='rgba(255,255,220,.82)';c.fillRect(178,224,4,23);
   for(const x of[10,350]){c.fillStyle=light;c.fillRect(x-5,230,10,16);c.fillRect(x-8,227,16,3)}
 }
 c.restore();
 // Localized glints, drifting sparks and bubbles add motion without external sprite files.
 c.save();c.globalCompositeOperation='screen';
 for(let i=0;i<12;i++){
   const x=(i*67+Math.sin(t*.7+i+k)*10+360)%360;
   const y=48+(i*43%150)+Math.sin(t*1.4+i*1.7)*5;
   const a=.18+.5*Math.abs(Math.sin(t*2+i*1.9+k));
   c.fillStyle='rgba('+A+','+a+')';
   if(k===13){const by=245-((t*22+i*29)%190);c.beginPath();c.arc(x,by,1+i%2,0,Math.PI*2);c.strokeStyle='rgba('+A+','+a+')';c.stroke()}
   else if(i%4===0){c.fillRect(Math.round(x)-2,Math.round(y),5,1);c.fillRect(Math.round(x),Math.round(y)-2,1,5)}
   else c.fillRect(Math.round(x),Math.round(y),i%3===0?2:1,i%3===0?2:1);
 }
 c.restore();
}
function drawSceneSpriteLayer(t,k,A){
  c.save();c.globalCompositeOperation='screen';
  const spriteFrames=[0,5,5,1,5,5,3,7,5,7,1,3,5,4,6,2,5];
  for(let i=0;i<16;i++){
    const seed=k*83+i*17,pulse=.22+.68*Math.abs(Math.sin(t*2+i*1.73));
    let x=(SR(seed)*W+Math.sin(t*.7+i)*8+W)%W;
    let y=SR(seed+1)*H;
    if(AMBIENT_SPRITES.complete&&AMBIENT_SPRITES.naturalWidth){
      const frame=spriteFrames[k];
      if(k===0)y=(y+t*(13+i%4*5))%(H+20)-10;
      else if(k===3){x=(x+t*(20+i%3*8))%W;y=24+i*13}
      else if(k===6||k===11)y=H-((y+t*(12+i%5*5))%(H+20));
      else if(k===10||k===15){x=(x+Math.sin(t*.8+i)*17+W)%W;y=(y+t*(8+i%4*4))%H}
      else if(k===13)y=H-((y+t*(8+i%4*5))%(H+20));
      else if(k===14)y=(y+t*(7+i%4*3))%H;
      else y=H-((y+t*(5+i%4*3))%(H+20));
      if(k===12&&x>132&&x<228)x=x<180?106:254;
      const size=10+i%4*2;
      c.globalAlpha=.42+pulse*.5;c.save();c.translate(Math.round(x),Math.round(y));
      c.rotate(k===0||k===5?0:t*.6+i*1.31);
      c.drawImage(AMBIENT_SPRITES,(frame%4)*32,Math.floor(frame/4)*32,32,32,-size/2,-size/2,size,size);
      c.restore();c.globalAlpha=1;
      continue;
    }
    if(k===0){
      y=(y+t*(13+i%4*5))%H;c.fillStyle='rgba(235,250,255,'+pulse+')';
      c.fillRect(Math.round(x),Math.round(y),i%4===0?2:1,i%4===0?3:2);
    }else if(k===3){
      x=(t*(55+i%3*22)+SR(seed)*W)%(W+46)-23;y=22+i*13;
      c.strokeStyle='rgba('+A+','+(.2+pulse*.45)+')';c.lineWidth=1;
      c.beginPath();c.moveTo(x,y);c.lineTo(x+13+i%4*3,y);c.stroke();
    }else if(k===4){
      if(pulse<.68)continue;c.fillStyle='rgba(255,239,155,'+pulse+')';
      c.fillRect(Math.round(x),Math.round(y),2,2);c.fillRect(Math.round(x)-2,Math.round(y)+1,5,1);
    }else if(k===5){
      y=SR(seed+1)*112;c.fillStyle='rgba(222,229,255,'+pulse+')';
      c.fillRect(Math.round(x),Math.round(y),2,2);if(i%4===0)c.fillRect(Math.round(x)-2,Math.round(y)+1,6,1);
    }else if(k===6||k===11){
      y=H-((y+t*(12+i%5*5))%H);c.fillStyle='rgba(255,151,76,'+(.25+pulse*.55)+')';
      c.fillRect(Math.round(x),Math.round(y),i%3===0?2:1,2);
    }else if(k===10||k===15){
      x=(x+Math.sin(t*.8+i)*17+W)%W;y=(y+t*(8+i%4*4))%H;
      c.save();c.translate(Math.round(x),Math.round(y));c.rotate(t*.7+i);
      c.fillStyle=k===15?'rgba(255,176,218,'+pulse+')':'rgba(153,235,139,'+pulse+')';
      c.fillRect(-2,-1,5,2);c.restore();
    }else if(k===13){
      y=H-((y+t*(8+i%4*5))%H);c.strokeStyle='rgba('+A+','+(.28+pulse*.45)+')';
      c.lineWidth=1;c.beginPath();c.arc(x,y,1+i%3,0,Math.PI*2);c.stroke();
      c.fillStyle='rgba(255,255,255,'+pulse+')';c.fillRect(Math.round(x),Math.round(y),1,1);
    }else if(k===14){
      y=(y+t*(7+i%4*3))%H;c.save();c.translate(Math.round(x),Math.round(y));
      c.rotate(-.5+Math.sin(t+i)*.25);c.fillStyle='rgba(246,251,255,'+(.24+pulse*.55)+')';
      c.fillRect(-3,0,7,1);c.fillRect(1,-1,2,1);c.restore();
    }else if(k===12){
      if(x>132&&x<228)x=x<180?106:254;
      c.fillStyle='rgba(201,139,255,'+pulse+')';c.fillRect(Math.round(x),Math.round(y),2,2);
      if(i%3===0)c.fillRect(Math.round(x)+4,Math.round(y),2,2);
    }else if(k===1||k===2||k===7){
      y=H-((y+t*(5+i%4*3))%H);c.fillStyle='rgba('+A+','+(.2+pulse*.42)+')';
      c.fillRect(Math.round(x),Math.round(y),i%5===0?2:1,i%5===0?2:1);
    }else{
      c.fillStyle='rgba('+A+','+(.2+pulse*.55)+')';
      c.fillRect(Math.round(x),Math.round(y),1,2);
      if(i%4===0){c.fillRect(Math.round(x)-2,Math.round(y)+1,5,1)}
    }
  }
  c.restore();
}
function sceneDraw(t,k){
  const outputCtx=c;
  c=SCENE_PIXEL_CTX;
  c.setTransform(SCENE_PIXEL_BUFFER.width/W,0,0,SCENE_PIXEL_BUFFER.height/H,0,0);
  c.globalAlpha=1;c.globalCompositeOperation='source-over';c.setLineDash([]);
  c.imageSmoothingEnabled=false;
  c.clearRect(0,0,W,H);
  const [nm,sk,gr,mt,A,bg,o,p]=SCN[k],F=a=>'rgba('+A+','+a+')';
  const art=SCENE_ART[k],useArt=art&&art.complete&&art.naturalWidth>0;
  if(useArt){
    c.drawImage(art,0,0,W,H);
    sceneBg(bg,t,A,F);
    drawScenePixelTexture(t,k,A);
    drawSceneSpriteLayer(t,k,A);
  }else{
    const g=c.createLinearGradient(0,0,0,135);g.addColorStop(0,sk[0]);g.addColorStop(.55,sk[1]);g.addColorStop(1,sk[2]);
    c.fillStyle=g;c.fillRect(0,0,W,H);
    if(p=='star')scPt(p,t,A,F);
    sceneBg(bg,t,A,F);
    c.save();c.globalAlpha=.9;
    mountain(114,46,mix(mt,sk[2],.5),mix(mt,'#000000',.6),0,k+1);
    mountain(126,34,mix(mt,sk[2],.2),mix(mt,'#000000',.7),t*.2,k+3);
    c.restore();
    const gg=c.createLinearGradient(0,124,0,H);gg.addColorStop(0,gr[0]);gg.addColorStop(1,gr[1]);c.fillStyle=gg;c.fillRect(0,124,W,H-124);
    drawScenePixelTexture(t,k,A);
    const hz=c.createLinearGradient(0,112,0,134);hz.addColorStop(0,F(0));hz.addColorStop(.6,F(.22));hz.addColorStop(1,F(0));c.fillStyle=hz;c.fillRect(0,112,W,22);
    drawSceneSprites(t,k,A,F);
    [[130,.5,[18,52,88,272,308,342]],[158,.85,[14,66,294,346]],[224,1.3,[28,332]]].forEach(([y,s,xs],r)=>xs.forEach((x,j)=>ob(o,x,y,s,t,A,r*7+j)));
  }
  if(bg=='lava'){c.lineWidth=4;for(let i=0;i<3;i++){c.strokeStyle='rgba(255,'+(110+i*30)+',40,'+(.55+.25*Math.sin(t*2+i))+')';c.beginPath();c.moveTo(180+(i-1)*14,130);c.bezierCurveTo(180+(i-1)*60,170,180+(i-1)*130,200,180+(i-1)*190,H);c.stroke()}}
  if(bg=='fog'){for(let i=0;i<4;i++){const y=118+i*28+Math.sin(t*.4+i)*4,fg=c.createLinearGradient(0,y,0,y+24);fg.addColorStop(0,F(0));fg.addColorStop(.5,F(.17));fg.addColorStop(1,F(0));c.fillStyle=fg;c.fillRect(0,y,W,24)}}
  if(p!='star')scPt(p,t,A,F);
  c.fillStyle='rgba(255,255,255,.72)';c.font='bold 20px monospace';c.textAlign='left';c.fillText('✦ '+nm,8,H-8);
  c=outputCtx;
  c.save();c.imageSmoothingEnabled=false;c.setTransform(K,0,0,K,0,0);
  c.drawImage(SCENE_PIXEL_BUFFER,0,0,W,H);c.restore();
}

/* ===== Balo ===== */
const BAG_SLOTS=20,STACK=99;
const SELL_PRICE={qua:3,thuoc:5,dan:10,huyet:150},SELL_MAT=6; /* giá bán tạm, sửa ở đây */
function sellPrice(id){return SELL_PRICE[id]!==undefined?SELL_PRICE[id]:SELL_MAT}
const ITEMS={
  qua:{n:'Linh Quả',i:'🍎',d:'Quả chứa linh khí. Thú ăn vào no bụng, uy danh +2.',use:()=>{const f=addFame(2);stats();log('🍎 Thú ăn Linh Quả, uy danh +'+f+'.')}},
 thuoc:{n:'Thảo Dược',i:'🌿',d:'Dùng chữa bệnh cho thú (áp dụng khi có yêu cầu bệnh).',use:null},
  dan:{n:'Linh Đan',i:'💊',d:'Thú tăng tu vi, uy danh +6.',use:()=>{const f=addFame(6);stats();log('💊 Thú dùng Linh Đan, uy danh +'+f+'.')}},
 huyet:{n:'Giọt Huyết Mạch',i:'🩸',d:'Cực hiếm. Sau này dùng để tăng nhẹ % huyết mạch (chưa mở).',use:null}
};
for(let k=0;k<17;k++)ITEMS['mat'+k]={n:'Tinh Hoa '+EPI[k][0],i:'◆',col:EPI[k][1],d:'Nguyên liệu hệ '+EPI[k][0]+' (dùng để chế tạo, sắp có).',use:null};
let bag=[],bagSel=-1;
function addItem(id,n=1){let left=n;
 for(const s of bag)if(s.id==id&&s.n<STACK){const a=Math.min(STACK-s.n,left);s.n+=a;left-=a}
 while(left>0&&bag.length<BAG_SLOTS){const a=Math.min(STACK,left);bag.push({id,n:a});left-=a}
 renderBag();return n-left}
function takeSlot(i,n=1){const s=bag[i];if(!s)return;s.n-=n;if(s.n<=0){bag.splice(i,1);bagSel=-1}renderBag()}
function renderBag(){
 $('bag-sum').textContent='🎒 Balo ('+bag.length+'/'+BAG_SLOTS+' ô)';
 let h='';for(let i=0;i<BAG_SLOTS;i++){const s=bag[i];
  if(!s){h+='<button class="slot" disabled style="opacity:.35"></button>';continue}
  const it=ITEMS[s.id];h+='<button class="slot'+(i==bagSel?' sel':'')+'" onclick="bagPick('+i+')"><span style="color:'+(it.col||'inherit')+'">'+it.i+'</span><b>'+s.n+'</b></button>'}
 $('bag').innerHTML=h;
 const s=bag[bagSel];$('bag-info').innerHTML=s?'<b style="color:var(--gold)">'+ITEMS[s.id].n+'</b> ×'+s.n+'<br><small>'+ITEMS[s.id].d+'</small><br><small>Giá bán: '+sellPrice(s.id)+' xu/cái</small>':'<small>Chạm vào ô để xem vật phẩm.</small>'}
function bagPick(i){bagSel=i;renderBag()}
function bagUse(){const s=bag[bagSel];if(!s)return;const it=ITEMS[s.id];
 if(!it.use){log('🎒 <b>'+it.n+'</b> chưa dùng được lúc này.');return}
 if(!hatched){log('🎒 Cần nở thú trước.');return}
 it.use();takeSlot(bagSel)}
function bagDrop(){const s=bag[bagSel];if(!s){log('🎒 Hãy chạm vào một ô vật phẩm trước.');return}
 const inp=$('sell-qty');let q=Math.floor(Number(inp.value));
 if(!q||q<1){log('🗑️ Hãy nhập số lượng lớn hơn 0.');return}
 if(q>s.n)q=s.n;
 const it=ITEMS[s.id];takeSlot(bagSel,q);
 log('🗑️ Vứt <b>'+it.n+'</b> ×'+q+'.');inp.value=1}
function bagSell(){const s=bag[bagSel];if(!s){log('🎒 Hãy chạm vào một ô vật phẩm trước.');return}
 const inp=$('sell-qty');let q=Math.floor(Number(inp.value));
 if(!q||q<1){log('💰 Hãy nhập số lượng lớn hơn 0.');return}
 if(q>s.n)q=s.n;
 const it=ITEMS[s.id],g=q*sellPrice(s.id);
 takeSlot(bagSel,q);gold+=g;stats();
 log('💰 Bán <b>'+it.n+'</b> ×'+q+', nhận <b style="color:var(--gold)">'+g+'</b> xu.');
 inp.value=1}
function dropRand(){const sp=pet?pet.sp:Math.floor(Math.random()*17),r=Math.random();
 return r<.02?'huyet':r<.35?'qua':r<.6?'thuoc':r<.8?'dan':'mat'+sp}
window.arena=function(){if(!hatched)return;
  if(Math.random()<.55){gold+=12;const f=addFame(5);log('⚔️ Thắng trận! Xu +12, uy danh +'+f+'.');
  if(Math.random()<.4){const id=dropRand();log(addItem(id,1)?'🎒 Nhặt được <b>'+ITEMS[id].n+'</b>.':'🎒 Balo đầy, bỏ lại <b>'+ITEMS[id].n+'</b>!')}}
 else{fame=Math.max(0,fame-1);log('⚔️ Thua trận, uy danh -1. Hãy luyện thêm!')}
 stats()};
window.shop=function(){
 if(gold<20){log('🏪 Không đủ xu mua Linh Đan (20 xu).');return}
 if(!addItem('dan',1)){log('🎒 Balo đầy, không mua được.');return}
 gold-=20;stats();log('🏪 Mua Linh Đan (20 xu), đã cất vào balo.')};
renderBag();

