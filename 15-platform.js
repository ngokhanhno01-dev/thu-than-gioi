/* ===== 15-platform.js — BỆ DƯỚI CHÂN THÚ dạng PIXEL ART, riêng cho từng VÙNG (17 hệ) =====
   Thay cho vòng tròn vector cũ (hàm formation trong 03-game-core.js).
   Cách gọi (đã có điểm móc ở formation):  PLAT.draw(c, t, sp)  →  true nếu đã vẽ
     sp = 0..16 (hệ/vùng, đúng thứ tự SCN / EPI) ; sp < 0 (đang là trứng, chưa chọn hệ) → bệ mặc định "Khởi Nguyên" (index 17)
   Mỗi bệ gồm: mặt bệ có vân (nứt/đá/băng...), thành bệ dày 4 pixel, vòng rune chạy sáng, biểu tượng ở giữa xoay/nhấp nháy,
   quầng sáng chấm dithering bên ngoài, và các hạt/chi tiết riêng của vùng (băng rủ, lửa liếm, tia sét, cánh hoa...).
   Mọi thứ vẽ ở độ phân giải thấp (1 pixel bệ = 2 pixel màn hình), 12 khung hình/vòng (6 khung/giây), tạo 1 lần rồi cache.
   Muốn đổi màu một vùng: sửa bảng PAL (dòng 'pal'). Muốn bệ to/nhỏ: sửa RX, RY. */
(()=>{
'use strict';
const TAU=Math.PI*2,SIN=Math.sin,COS=Math.cos,PI=Math.PI,ATAN=Math.atan2,HYP=Math.hypot,ABS=Math.abs,FLOOR=Math.floor;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, frac=v=>v-FLOOR(v);
const W=84,H=48,CX=42,CY=18,RX=34,RY=10,TH=4,S=RX/RY,SQ=2,FR=12,PX=2,FPS=6;
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const bay=(x,y)=>(BAY[(y&3)*4+(x&3)]+.5)/16;
function hash(x,y,k){let h=(Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul((k|0)+1,1274126177))>>>0;h=Math.imul(h^(h>>>13),1274126177)>>>0;return((h^(h>>>16))>>>0)/4294967296}
const rgb=h=>{h=h.replace('#','');return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]};
const segD=(px,py,x0,y0,x1,y1)=>{const dx=x1-x0,dy=y1-y0,l=dx*dx+dy*dy,t=l?clamp(((px-x0)*dx+(py-y0)*dy)/l,0,1):0;return HYP(x0+t*dx-px,y0+t*dy-py)};
const rot2=(x,y,a)=>{const c=COS(a),s=SIN(a);return[x*c+y*s,-x*s+y*c]};
/* Voronoi (nứt/mảng đá). Trả khoảng cách tới đường biên giữa 2 ô (nhỏ = đang nằm trên đường nứt) và id ô gần nhất */
let VID=0;
function vorEdge(x,y,cell,seed){
 const gx=FLOOR(x/cell),gy=FLOOR(y/cell);let d1=1e9,d2=1e9,id=0;
 for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=gx+i,cy=gy+j,fx=(cx+hash(cx,cy,seed))*cell,fy=(cy+hash(cx,cy,seed+7))*cell,d=HYP(x-fx,y-fy);
  if(d<d1){d2=d1;d1=d;id=hash(cx,cy,seed+13)}else if(d<d2)d2=d}
 VID=id;return d2-d1}

/* ============================================================
   BẢNG MÀU & KIỂU CHO 18 BỆ  (0..16 = 17 vùng, 17 = mặc định)
   pal   : 6 màu [viền, tối2, tối1, giữa, sáng, rất sáng]   ring: màu vạch rune chạy sáng ngoài rìa
   e1,e2,e3 : màu biểu tượng giữa (chính / lõi sáng / bóng tối)   glow: màu quầng sáng
   crack : {cell,seed,w,col(hex),flick} vân nứt/mảng trên mặt bệ (tuỳ chọn)
   ============================================================ */
const T=[
/* 0  Tuyết Nguyên */{name:'Băng Đài',    pal:['#16304f','#2c5788','#4a80b8','#79add8','#a6cdea','#e2f4ff'],ring:'#8fd0ff',e1:'#ffffff',e2:'#8fd0ff',e3:'#3d6d9c',glow:'#bfe8ff',crack:{cell:13,seed:2,w:.7,col:'#2c5788'}},
/* 1  Sương Cốc    */{name:'Thạch Sương', pal:['#17302d','#2f5a54','#4f827a','#79a79c','#a6c9be','#d3e8e0'],ring:'#cfe6e0',e1:'#ffffff',e2:'#9fd0c6',e3:'#2f5a54',glow:'#9fd0c6',crack:{cell:10,seed:5,w:.8,col:'#2f5a54'}},
/* 2  Vân Đảo      */{name:'Vân Đài',     pal:['#3a2f6e','#6a5aa8','#8f80c8','#b6a8e6','#d6ccf6','#f4efff'],ring:'#ffffff',e1:'#ffffff',e2:'#c9b8ff',e3:'#6a5aa8',glow:'#c9b8ff'},
/* 3  Phong Nguyên */{name:'Phong Đài',   pal:['#0d3322','#1f6a48','#2f8f64','#4fb98a','#8fe0b6','#c8ffe0'],ring:'#8fffc0',e1:'#ffffff',e2:'#8fffc0',e3:'#1f6a48',glow:'#8fffc0'},
/* 4  Lôi Vực      */{name:'Lôi Đài',     pal:['#0a0a14','#1c1c30','#2c2c4a','#44446a','#64648e','#8c8cb4'],ring:'#ffe86a',e1:'#ffe86a',e2:'#ffffff',e3:'#0a0a14',glow:'#ffd83a',crack:{cell:11,seed:9,w:.8,col:'#ffe86a',flick:1}},
/* 5  Nguyệt Cung  */{name:'Nguyệt Đài',  pal:['#0a0d30','#1a2058','#2c3a8a','#4a5cb8','#7c8ee0','#b8c4ff'],ring:'#d8d8ff',e1:'#eef0ff',e2:'#a8a8ff',e3:'#1a2058',glow:'#a8a8ff'},
/* 6  Dương Sơn    */{name:'Dương Đài',   pal:['#4a1604','#8a3010','#c8581e','#e8803a','#ffb04a','#ffe0a0'],ring:'#fff2c0',e1:'#fff2c0',e2:'#ffffff',e3:'#8a3010',glow:'#ffb84a',crack:{cell:13,seed:4,w:.7,col:'#8a3010'}},
/* 7  Huyền Uyên   */{name:'Huyền Đài',   pal:['#050510','#14142a','#1f1f40','#2e2e58','#46467a','#6666a0'],ring:'#9a86ff',e1:'#b0a0ff',e2:'#e0d8ff',e3:'#000000',glow:'#6a5acd',crack:{cell:12,seed:8,w:.8,col:'#7a66e0',flick:1}},
/* 8  Kim Khoáng   */{name:'Kim Đài',     pal:['#3a2606','#7a5412','#a87a1e','#d8a838','#f4cd5a','#fff2b0'],ring:'#fff7c0',e1:'#fff7c0',e2:'#ffffff',e3:'#6a4410',glow:'#ffc830',crack:{cell:9,seed:6,w:.7,col:'#6a4410'}},
/* 9  Ngọc Động    */{name:'Ngọc Đài',    pal:['#06382c','#14705a','#1f9a7a','#3ac4a0','#7af0cc','#c8ffee'],ring:'#a8ffd8',e1:'#ffffff',e2:'#6affc0',e3:'#0c4a3c',glow:'#6affc0',crack:{cell:8,seed:3,w:.7,col:'#c8ffee'}},
/* 10 Thanh Lâm    */{name:'Mộc Đài',     pal:['#241a0c','#3a2c1a','#5a4428','#7c6038','#a07c4a','#c8a468'],ring:'#7affc0',e1:'#a6f090',e2:'#7affc0',e3:'#1c5a32',glow:'#4aef9a'},
/* 11 Xích Hỏa Địa */{name:'Hỏa Đài',     pal:['#1a0402','#3a1410','#5a2018','#7a2e20','#a0442a','#d0663a'],ring:'#ffd060',e1:'#ffb040',e2:'#fff0a0',e3:'#1a0402',glow:'#ff5a3a',crack:{cell:11,seed:1,w:1.1,col:'#ff9a30',flick:1}},
/* 12 Hắc Ám Lâm   */{name:'Hắc Đài',     pal:['#07030c','#1c1226','#2c1c3c','#40284c','#5a3a6a','#7a5a8a'],ring:'#d6a8e8',e1:'#e8b8ff',e2:'#ff6ad0',e3:'#07030c',glow:'#8a3aa0',crack:{cell:12,seed:11,w:.8,col:'#b060d0',flick:1}},
/* 13 Tử Tinh Hải  */{name:'Tinh Đài',    pal:['#1a0838','#3a1068','#5a2a9a','#7838b0','#a050e0','#d090ff'],ring:'#e0a0ff',e1:'#ffe0ff',e2:'#c06aff',e3:'#2a0a50',glow:'#b050ff',crack:{cell:9,seed:7,w:.7,col:'#e0a0ff'}},
/* 14 Thiên Không  */{name:'Thiên Đài',   pal:['#2a4f82','#4f80bc','#7db0e6','#a6d0f8','#cfe6ff','#ffffff'],ring:'#ffffff',e1:'#ffffff',e2:'#aee0ff',e3:'#4f80bc',glow:'#aee0ff'},
/* 15 Linh Hoa Viên*/{name:'Hoa Đài',     pal:['#5a1a48','#a04a88','#c86aa8','#e890c8','#ffb8e0','#ffe0f4'],ring:'#ffffff',e1:'#ffffff',e2:'#ffd0f0',e3:'#a04a88',glow:'#ffa0e0'},
/* 16 Thần Điện    */{name:'Thần Đài',    pal:['#4a3410','#8a6428','#b88a3c','#dcb050','#f4d27a','#fff4c0'],ring:'#fff6b0',e1:'#fff6b0',e2:'#ffffff',e3:'#8a6428',glow:'#ffe060',crack:{cell:10,seed:12,w:.7,col:'#8a6428'}},
/* 17 mặc định     */{name:'Khởi Nguyên', pal:['#1a0f08','#33231a','#4a3626','#6b5037','#8a6c4a','#b08c5a'],ring:'#f2c76a',e1:'#f2c76a',e2:'#6fd1a0',e3:'#33231a',glow:'#f2c76a'}
];
for(const o of T){o.P=o.pal.map(rgb);o.R=rgb(o.ring);o.E=[null,rgb(o.e1),rgb(o.e2),rgb(o.e3)];o.G=rgb(o.glow);if(o.crack)o.C=rgb(o.crack.col)}

/* ============================================================
   BIỂU TƯỢNG GIỮA BỆ (toạ độ "không gian tròn": x,y tính bằng pixel, bán kính mép bệ = 34)
   Trả về mã: 0 không vẽ · 1 màu chính (e1) · 2 màu lõi (e2) · 3 màu bóng (e3). ph = fi/FR (0..1, lặp vòng)
   ============================================================ */
const EMB=[
/* 0 Tuyết: bông tuyết 6 cánh xoay chậm */
(x,y,ph)=>{[x,y]=rot2(x,y,ph*PI/3);const r=HYP(x,y);if(r<2.4)return 2;if(r>23)return 0;
 const a=ATAN(y,x),m=((a%(PI/3))+PI/3)%(PI/3),fm=Math.min(m,PI/3-m),perp=r*SIN(fm),along=r*COS(fm),sg=m<PI/6?1:-1;
 if(perp<1.3&&along<22)return 1;
 for(const b of[10,16]){if(segD(along,perp,b,0,b+3,5.2)<1.15)return 1}
 return 0},
/* 1 Sương: các cung sương xoay ngược chiều nhau */
(x,y,ph)=>{const r=HYP(x,y),a=ATAN(y,x)/TAU;if(r<3)return 2;
 const rings=[[8,1],[15,-1],[22,1]];for(let i=0;i<3;i++){const R=rings[i][0];if(ABS(r-R)<1.25){if(frac(a*4+rings[i][1]*ph)<.62)return i===1?2:1}}return 0},
/* 2 Vân: đám mây nhấp nhô */
(x,y,ph)=>{y-=3*SIN(ph*TAU);
 const c=(cx,cy,R)=>HYP(x-cx,y-cy)<R;
 const inn=c(-10,2,7)||c(0,-3,10)||c(10,2,7)||(x>-14&&x<14&&y>2&&y<9);
 if(!inn)return 0;return y>3?2:1},
/* 3 Phong: xoáy 3 cánh */
(x,y,ph)=>{const r=HYP(x,y),a=ATAN(y,x);if(r<2)return 2;if(r>25)return 0;
 for(let j=0;j<3;j++){const th=(((a-ph*TAU/3-j*TAU/3)%TAU)+TAU)%TAU,rs=2+th/TAU*22;if(ABS(r-rs)<1.5)return(rs>19)?2:1}return 0},
/* 4 Lôi: tia sét, chớp trắng theo nhịp */
(x,y,ph,fi)=>{const P=[[6,-24],[-3,-6],[4,-6],[-6,24]];
 for(let i=0;i<3;i++)if(segD(x,y,P[i][0],P[i][1],P[i+1][0],P[i+1][1])<2.1)return(fi%4===0)?2:1;
 if(ABS(HYP(x,y)-27)<1&&(fi&1))return 1;return 0},
/* 5 Nguyệt: trăng khuyết + 3 ngôi sao lấp lánh */
(x,y,ph,fi)=>{
 if(HYP(x,y)<14&&HYP(x-6,y+3)>12)return 1;
 const st=[[-19,-5,0],[17,8,3],[-9,14,6]];
 for(const s of st){const tw=.5+.5*SIN((fi+s[2])/FR*TAU),dx=ABS(x-s[0]),dy=ABS(y-s[1]);
  if((dx<1.3&&dy<5*tw)||(dy<1.3&&dx<5*tw))return 2}return 0},
/* 6 Dương: mặt trời 12 tia xoay */
(x,y,ph)=>{const r=HYP(x,y);if(r<6)return 2;if(r<8.2)return 1;
 const a=ATAN(y,x)-ph*TAU/12,dm=ABS(((a%(TAU/12))+TAU/12)%(TAU/12)-TAU/24)-TAU/24,i=FLOOR(((a%TAU)+TAU)%TAU/(TAU/12)+.5)%12;
 const L=(i&1)?19:25;if(r>11&&r<L&&ABS(SIN(dm))*r<1.35)return 1;return 0},
/* 7 Huyền: xoáy đen nuốt vào, tâm hố đen */
(x,y,ph)=>{const r=HYP(x,y),a=ATAN(y,x);if(r<5)return 3;if(r>25)return 0;
 for(let j=0;j<2;j++){const th=(((-a+ph*TAU/2+j*PI)%TAU)+TAU)%TAU,rs=5+th/TAU*20;if(ABS(r-rs)<1.7)return rs<12?2:1}
 if(r<8)return 3;return 0},
/* 8 Kim: bánh răng + sao 4 cánh */
(x,y,ph)=>{const r=HYP(x,y),a=ATAN(y,x);if(r<3.5)return 2;
 if(((ABS(x)/17)**.6+(ABS(y)/17)**.6)<1&&r<17)return 1;
 if(r>17.5&&r<19.5)return 1;
 if(r>=19.5&&r<22.5&&SIN(8*(a+ph*TAU/8))>.2)return 1;return 0},
/* 9 Ngọc: lục giác nhiều mặt */
(x,y,ph,fi)=>{const r=HYP(x,y),R=17,hd=Math.max(ABS(y),ABS(x)*.866+ABS(y)*.5);if(hd>R)return 0;
 if(hd>R-1.7)return 1;
 const a=ATAN(y,x);if(r>3){const m=ABS(((a-PI/6)%(PI/3)+PI/3)%(PI/3)-PI/6);if(r*SIN(m)<1.1)return 2}
 if(r<3.2*(.7+.3*SIN(ph*TAU)))return 2;return 0},
/* 10 Thanh: cỏ bốn lá đung đưa */
(x,y,ph)=>{const sw=.16*SIN(ph*TAU);if(HYP(x,y)<2.6)return 2;
 for(let j=0;j<4;j++){const an=j*PI/2+sw+PI/4,[lx,ly]=rot2(x,y,an),dx=lx-11;
  if((dx/9)**2+(ly/5.2)**2<1)return(ABS(ly)<.9&&dx<7)?2:1}return 0},
/* 11 Xích: ngọn lửa bập bùng */
(x,y,ph)=>{const t=(y+22)/44;if(t<0||t>1)return 0;
 const xo=3.2*SIN(t*5+ph*TAU)*(1-t),hw=13*SIN(PI*Math.pow(t,.8)),k=ABS(x-xo);
 if(k<hw*.5&&t>.35)return 2;if(k<hw)return 1;return 0},
/* 12 Hắc: con mắt */
(x,y,ph)=>{const lens=12*(1-(x/25)**2);if(ABS(x)>25)return 0;
 const ay=ABS(y);if(ay>lens)return 0;
 const pr=7+1.5*SIN(ph*TAU),r=HYP(x,y);
 if(r<3)return 3;if(r<pr)return 2;if(ay>lens-2.6)return 1;return 3},
/* 13 Tử: ngũ giác tinh xoay */
(x,y,ph)=>{const r=HYP(x,y);if(ABS(r-24)<1)return 2;
 const rot=-PI/2+ph*TAU/5,pts=[];for(let k=0;k<5;k++)pts.push([COS(rot+k*TAU/5)*22,SIN(rot+k*TAU/5)*22]);
 for(const[i,j]of[[0,2],[2,4],[4,1],[1,3],[3,0]])if(segD(x,y,pts[i][0],pts[i][1],pts[j][0],pts[j][1])<1.35)return 1;
 return 0},
/* 14 Thiên: đôi cánh vỗ nhẹ */
(x,y,ph)=>{const fl=2.4*SIN(ph*TAU),ax=ABS(x),r=HYP(x,y+1);
 if(r>3&&r<5)return 2;
 const F=[[27,-13+fl],[29,-4+fl*.6],[26,5],[20,13]];
 for(const f of F){const d=segD(ax,y,5,1,f[0],f[1]);if(d<1.5)return 1;if(d<2.7)return 2}return 0},
/* 15 Linh: bông hoa 6 cánh */
(x,y,ph)=>{if(HYP(x,y)<3)return 3;
 for(let j=0;j<6;j++){const an=j*PI/3+ph*PI/3,[lx,ly]=rot2(x,y,an),dx=lx-11;
  if((dx/8.5)**2+(ly/4.4)**2<1)return((dx/5)**2+(ly/2.3)**2<1)?2:1}return 0},
/* 16 Thần: sao hào quang 2 vòng */
(x,y,ph)=>{const r=HYP(x,y);if(r<4.5)return 2;if(r>9&&r<11)return 1;if(r>18.5&&r<20&&frac(ATAN(y,x)/TAU*16+ph)<.5)return 2;
 const a=ATAN(y,x)-ph*TAU/16,dm=ABS(((a%(TAU/8))+TAU/8)%(TAU/8)-TAU/16)-TAU/16,i=FLOOR(((a%TAU)+TAU)%TAU/(TAU/8)+.5)%8;
 const L=(i&1)?17:25;if(r>12&&r<L&&ABS(SIN(dm))*r<1.3)return 1;return 0},
/* 17 Khởi Nguyên: 8 vạch bát quái + vòng ngọc + 3 nan */
(x,y,ph)=>{const r=HYP(x,y),a=ATAN(y,x);
 if(r>16&&r<22&&frac(a/TAU*8+ph/8*8*.125)<.28)return 1;
 if(ABS(r-11.5)<1.1)return 2;
 if(r<11){const b=a-ph*TAU/3*-1;if(frac(b/(TAU/3)+.0)<.08&&r>2)return 2}return 0}
];

/* ============================================================
   CHI TIẾT RIÊNG TỪNG VÙNG (vẽ sau cùng, đè lên bệ). p(x,y,[r,g,b],alpha) đặt 1 pixel
   ============================================================ */
const edgeY=x=>{const u=(x+.5-CX)/RX;return u*u>=1?CY:CY+RY*Math.sqrt(1-u*u)};   /* mép dưới mặt bệ tại cột x */
const ep=(a,fx,fy)=>[Math.round(CX+COS(a)*RX*(fx||1)),Math.round(CY+SIN(a)*RY*(fy||1))];
function puffs(p,col1,col2,fi,n,r0){for(let i=0;i<n;i++){const cx=Math.round(CX-RX*.78+i*(RX*1.56/(n-1))),cy=Math.round(edgeY(cx)+TH+(i&1?0:1)+SIN(fi/FR*TAU+i*1.3)*.8),R=r0+(i%3===1?1:0);
  for(let y=-R;y<=R;y++)for(let x=-R;x<=R;x++)if(x*x+y*y<=R*R+1)p(cx+x,cy+y,(y>0)?col2:col1,255)}}
function crystals(p,T0,angs,hs,fi){angs.forEach((a,i)=>{const[bx,by]=ep(a,1,1),h=hs[i];
  for(let k=0;k<h;k++){const w=Math.max(0,Math.round((1-k/h)*2.2));for(let x=-w;x<=w;x++)p(bx+x,by-k-1,x<0?T0.P[3]:x>0?T0.P[5]:T0.P[4],255)}
  if(((fi+i*4)%FR)<3){p(bx,by-h-2,T0.E[2],255);p(bx-1,by-h-1,T0.E[2],150);p(bx+1,by-h-1,T0.E[2],150)}})}
function orbitDots(p,cols,n,fi,fx,dir,tail){for(let j=0;j<n;j++){for(let k=0;k<tail;k++){const a=dir*((fi-k*.5)/FR*TAU)+j*TAU/n,[x,y]=ep(a,fx,fx);p(x,y,cols[k===0?0:1],k===0?255:Math.round(200-k*60))}}}
function rise(p,cols,n,fi,xr,h,seed){for(let j=0;j<n;j++){const ph=frac(fi/FR+hash(j,seed,1)),x=Math.round(CX+(hash(j,seed,2)*2-1)*xr+SIN(ph*TAU+j)*1.2),y=Math.round(CY+RY*.4-ph*h);
  p(x,y,cols[j%cols.length],Math.round(255*Math.min(1,(1-ph)*2)))}}
function twinkle(p,col,x,y,s){p(x,y,col,255);if(s>0){p(x-1,y,col,170);p(x+1,y,col,170);p(x,y-1,col,170);p(x,y+1,col,170)}}
const PROPS=[
/* 0 băng rủ + lấp lánh */(p,T0,fi)=>{for(let x=CX-RX+4;x<CX+RX-3;x++){if((x%7)!==3)continue;const L=2+FLOOR(hash(x,1,2)*4),y0=Math.round(edgeY(x))+TH+1;for(let k=0;k<L;k++)p(x,y0+k,k<L-1?T0.P[4]:T0.P[5],255);if(L>3)p(x,y0+L,T0.P[3],255)}
  for(let j=0;j<2;j++){const a=hash(FLOOR(fi/2),j,3)*TAU,[x,y]=ep(a,1,1);twinkle(p,T0.E[1],x,y-1,(fi&1)?1:0)}},
/* 1 làn sương trôi */(p,T0,fi)=>{for(let j=0;j<4;j++){const L=4+FLOOR(hash(j,2,1)*4),x0=Math.round(((hash(j,3,1)*W*1.4+fi/FR*W*.5*(j&1?1:-1))%(W+10)+W+10)%(W+10))-5,y=CY+RY+TH-1+(j%3);for(let k=0;k<L;k++)p(x0+k,y,T0.E[1],k===0||k===L-1?70:120)}},
/* 2 chân mây */(p,T0,fi)=>{puffs(p,T0.P[5],T0.P[4],fi,10,3)},
/* 3 gió cuốn */(p,T0,fi)=>{orbitDots(p,[T0.E[1],T0.E[2]],4,fi,1.18,1,4)},
/* 4 tia điện */(p,T0,fi)=>{if(fi%2)return;for(let j=0;j<3;j++){const a=hash(fi,j,5)*TAU,[x,y]=ep(a,1.05,1.05);let cx=x,cy=y;for(let k=0;k<4;k++){p(cx,cy,k&1?T0.E[1]:T0.E[2],255);cx+=(hash(fi,j,k+9)>.5?1:-1);cy+=(k&1?1:0)-1+(k===2?0:0)}}},
/* 5 sao quanh bệ */(p,T0,fi)=>{for(let j=0;j<3;j++){const a=-fi/FR*TAU*.5+j*TAU/3,[x,y]=ep(a,1.2,1.5);twinkle(p,T0.E[1],x,y-3,((fi+j*4)%FR)<4?1:0)}},
/* 6 tàn lửa bay lên */(p,T0,fi)=>{rise(p,[T0.P[5],T0.P[4],T0.E[1]],7,fi,24,6)},
/* 7 hạt bị hút vào + sương đen */(p,T0,fi)=>{for(let j=0;j<6;j++){const ph=frac(fi/FR+j/6),a=j*1.05+ph*TAU*.8,f=1.3-ph*1.05,[x,y]=ep(a,f,f);p(x,y,T0.E[1],Math.round(255*Math.min(1,ph*3,(1-ph)*2)))}
  for(let x=CX-RX+2;x<CX+RX-1;x+=2){if(hash(x,fi>>1,7)<.45)p(x,Math.round(edgeY(x))+TH+1+(hash(x,3,3)>.5?1:0),T0.P[1],140)}},
/* 8 đinh tán + loé sáng */(p,T0,fi)=>{for(let k=0;k<8;k++){const[x,y]=ep(k*PI/4+PI/8,.86,.86);p(x,y,T0.E[2],255)}
  for(let j=0;j<2;j++){const a=hash(FLOOR(fi/3),j,8)*TAU,[x,y]=ep(a,.9,.9);if(fi%3===0)twinkle(p,T0.E[2],x,y,1)}},
/* 9 tinh thể mọc sau bệ */(p,T0,fi)=>{crystals(p,T0,[-2.35,-1.75,-1.2,-.7],[6,8,7,5],fi)},
/* 10 lá & dây leo */(p,T0,fi)=>{const L=[[0.3,0],[1.4,1],[2.3,0],[3.6,1],[4.5,0],[5.5,1]];for(const[a,c]of L){const[x,y]=ep(a,.97,.97);p(x,y,T0.E[c?1:2],255);p(x+1,y,T0.E[c?1:2],255);p(x,y-1,T0.E[c?2:1],255);p(x+1,y+1,T0.E[3],255)}
  const ph=frac(fi/FR);p(Math.round(CX-26+ph*52),Math.round(CY-18+ph*28+SIN(ph*TAU*2)*2),T0.E[1],255);p(Math.round(CX-25+ph*52),Math.round(CY-18+ph*28+SIN(ph*TAU*2)*2),T0.E[2],255)},
/* 11 lửa liếm quanh rìa + tàn lửa */(p,T0,fi)=>{const cols=[[255,122,58],[255,176,64],[255,240,160]];
  for(let j=0;j<12;j++){const a=j*TAU/12+.2,[x,y]=ep(a,.98,.98),h=3+Math.round(2.5+2.5*SIN(fi/FR*TAU+j*1.7));
   for(let k=0;k<h;k++){const col=cols[k<h*.4?0:k<h*.8?1:2],hw=k<h*.5?1:0;for(let w=-hw;w<=hw;w++)p(x+w,y-k,col,255)}}
  rise(p,[T0.E[1],T0.E[2]],5,fi,26,22,11)},
/* 12 khói tím + đôi mắt */(p,T0,fi)=>{rise(p,[T0.P[3],T0.P[2]],6,fi,28,20,12);if((fi%6)<5){const[x,y]=ep(-1.9,1.02,1.02);p(x,y-2,T0.E[2],255);p(x+3,y-2,T0.E[2],255)}},
/* 13 tinh thể tím + sao */(p,T0,fi)=>{crystals(p,T0,[-2.5,-1.9,-1.25,-.65],[5,7,8,6],fi);for(let j=0;j<2;j++){const a=-fi/FR*TAU*.5+j*PI,[x,y]=ep(a,1.18,1.4);twinkle(p,T0.E[1],x,y-2,((fi+j*5)%FR)<4?1:0)}},
/* 14 lông vũ bay + chân mây nhỏ */(p,T0,fi)=>{puffs(p,T0.P[5],T0.P[4],fi,8,2);rise(p,[T0.E[1],T0.E[2]],5,fi,26,26,14)},
/* 15 cánh hoa rơi */(p,T0,fi)=>{for(let j=0;j<6;j++){const ph=frac(fi/FR*.6+hash(j,15,1)),x=Math.round(CX+(hash(j,15,2)*2-1)*30+SIN(ph*TAU*2+j)*3),y=Math.round(CY-20+ph*34);p(x,y,T0.E[j&1?1:2],255);p(x+1,y,T0.E[2],200)}},
/* 16 trụ vàng + hạt thánh */(p,T0,fi)=>{for(const a of[-2.55,-.6]){const[x,y]=ep(a,1.0,1.0);for(let k=0;k<7;k++)for(let w=-1;w<=1;w++)p(x+w,y-k,w<0?T0.P[3]:w>0?T0.P[5]:T0.P[4],255);for(let w=-2;w<=2;w++)p(x+w,y-7,T0.P[5],255);p(x,y-8,T0.E[1],(fi&2)?255:170)}
  rise(p,[T0.E[1],T0.E[2]],7,fi,28,28,16)},
/* 17 mặc định */(p,T0,fi)=>{}
];

/* ============================================================ DỰNG 1 KHUNG ============================================================ */
function build(k,fi){
 const Th=T[k],P=Th.P,ph=fi/FR;
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;
 const g=cv.getContext('2d'),im=g.createImageData(W,H),D=im.data;
 const put=(x,y,col,a)=>{x|=0;y|=0;if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4;D[i]=col[0];D[i+1]=col[1];D[i+2]=col[2];D[i+3]=a==null?255:a};
 const top=new Uint8Array(W*H),U=new Uint8Array(W*H),dep=new Uint8Array(W*H);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const u=(x+.5-CX)/RX,v=(y+.5-CY)/RY;if(u*u+v*v<=1)top[y*W+x]=1}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(top[i])U[i]=1;else for(let q=1;q<=TH;q++){if(y-q>=0&&top[(y-q)*W+x]){U[i]=2;dep[i]=q;break}}}
 const inU=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&U[y*W+x]>0;
 const pulse=.75+.25*COS(ph*TAU);
 /* quầng sáng chấm dithering bên ngoài */
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(U[y*W+x])continue;const u=(x+.5-CX)/RX,v=(y+.5-CY)/(RY*1.05),r=Math.sqrt(u*u+v*v);
  if(r>1&&r<1.42){const A=(1-(r-1)/.42)*.62*pulse;if(bay(x,y)<A)put(x,y,Th.G,150)}}
 /* thân bệ */
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!U[i])continue;
  const px=x+.5-CX,py=y+.5-CY,u=px/RX,v=py/RY,d=u*u+v*v,r=Math.sqrt(d);
  let col;
  if(U[i]===2){ /* thành bệ */
   const q=dep[i],lit=.5-u*.28+hash(x,y,5)*.1;
   let idx=q===1?3:q===2?2:1;if(lit>.62&&q<3)idx++;if(lit<.28)idx=Math.max(1,idx-1);
   col=P[idx];
   if(((x+(q>2?3:0))%7)===0&&q>1)col=P[Math.max(1,idx-1)];     /* khe gạch dọc */
  }else{ /* mặt bệ */
   const L=.60-.28*d-.12*u-.10*v+(hash(x,y,3)-.5)*.14,t=clamp(L,0,.999)*4,b=FLOOR(t);
   col=P[1+b+((t-b)>bay(x,y)?1:0)];
   if(Th.crack){const cr=Th.crack,e=vorEdge(px,py*SQ,cr.cell,cr.seed);
    if(e<cr.w&&r<.8){if(!cr.flick||hash(x,y,fi%3+20)>.25)col=Th.C}}
   /* vòng rune ngoài: vạch chạy sáng */
   if(r>.80&&r<.90){const a=ATAN(py*S,px),seg=FLOOR((a+PI)/TAU*24);const lit=(((seg-fi*2)%6)+6)%6<3;col=lit?Th.R:P[1]}
   else if(r>=.90&&r<=.97){col=P[2]}
   /* biểu tượng giữa (lấy mẫu 3x3 để nét mảnh vẫn hiện) */
   else if(r<.78){let n1=0,n2=0,n3=0;
    for(let sj=0;sj<3;sj++)for(let si=0;si<3;si++){const qx=px+(si-1)*.33,qy=(py+(sj-1)*.33)*S,m=EMB[k](qx,qy,ph,fi);if(m===1)n1++;else if(m===2)n2++;else if(m===3)n3++}
    const best=Math.max(n1,n2,n3);if(best>=3){col=Th.E[n2===best?2:n1===best?1:3]}}
   /* gờ sáng giữa mặt bệ và thành */
   if(!top[(y+1)*W+x]&&U[(y+1)*W+x]===2)col=P[5];
  }
  put(x,y,col)}
 /* viền ngoài */
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!U[y*W+x])continue;if(!inU(x-1,y)||!inU(x+1,y)||!inU(x,y-1)||!inU(x,y+1))put(x,y,P[0])}
 /* chi tiết riêng của vùng */
 PROPS[k](put,Th,fi);
 g.putImageData(im,0,0);return cv}

const CACHE=[];
function get(k,fi){const a=CACHE[k]||(CACHE[k]=[]);return a[fi]||(a[fi]=build(k,fi))}
window.PLAT={ok:true,names:T.map(o=>o.name),
 draw(c,t,sp){
  sp=sp|0;const k=(sp>=0&&sp<17)?sp:17,fi=FLOOR(t*FPS)%FR;
  try{const spr=get(k,fi);c.save();c.imageSmoothingEnabled=false;c.globalAlpha=1;
   c.drawImage(spr,180-CX*PX,190-CY*PX,W*PX,H*PX);c.restore();return true}catch(e){console.error('PLAT',e);return false}}
};
})();
