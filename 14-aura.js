/* ===== 14-aura.js — BƯỚC 3: aura / hiệu ứng riêng cho từng BẬC (10) và từng HỆ (17) =====
   Dùng chung cho màn chính (beast trong 03-game-core.js) và trong trận (drawPet trong 06-mobs.js).
   Cách gọi (window.PETAURA, đã có điểm móc ở 2 nơi trên):
     PETAURA.back (g,cx,by,w,h,T,mode,stage,sp,pi,pv,al)  → vẽ PHÍA SAU thú: quầng sáng, tia xoay, cột sáng, vòng chân, sóng xung, hạt ở sau thân
     PETAURA.front(g,cx,by,w,h,T,mode,stage,sp,pi,pv,al)  → vẽ PHÍA TRƯỚC thú: hạt, vệ tinh, vành sáng trên đầu
     PETAURA.rim(stage,pi,battle)                          → chuỗi g.filter viền sáng quanh thân (màu theo phẩm huyết mạch)
       cx,by = giữa chân thú · w,h = rộng/cao thân (px) · T = giây · mode = 'main' | 'battle'
       stage = 0..9 · sp = 0..16 (hệ) · pi = 0..4 (phẩm) · pv = true khi đang xem thử (bỏ qua nhường EVO) · al = độ mờ chung (trong trận khi thú bị đánh)
   QUY TẮC:
     • Bậc (STAGE_FX) quyết định KIỂU và MỨC hiệu ứng. Hệ (ELEMENT_FX) quyết định MÀU, HÌNH HẠT, KIỂU CHUYỂN ĐỘNG, KIỂU TIA.
     • Phẩm huyết mạch (pi) chỉ đổi MÀU VIỀN (vòng chân, viền thân, vành sáng) và ĐỘ SÁNG; không đổi kiểu.
     • Khi EVO (13-evolve.js) đang tiến hóa, màn chính ẩn aura rồi hiện dần lại sau khi xong (không chồng lên hiệu ứng tiến hóa).
   HIỆU NĂNG: hạt vẽ bằng pixel vuông / sprite motif nhỏ đã cache; mọi mảng cố định, không tạo object mỗi khung hình;
   gradient chỉ tạo 1 lần/hệ (cache, bản 32x32 phóng to kiểu pixel). Tổng hạt: ≤30 (màn chính), ≤20 (trong trận). */
(()=>{
'use strict';
const TAU=Math.PI*2, SIN=Math.sin, COS=Math.cos, PI=Math.PI;
const clamp=(v,a,b)=>v<a?a:v>b?b:v, frac=v=>v-Math.floor(v);

/* ============================================================
   BẢNG 1 — CẤU HÌNH THEO BẬC (10 dòng, bậc 1 → bậc 10)
   n      tổng số hạt ở màn chính (≤30; trong trận tự quy về ≤20)      orbs  số vệ tinh quay quanh (nằm trong n)
   halo   độ đậm quầng sáng nền (0 = tắt)   hr  cỡ quầng (x thân)       ring  vòng chân: 0 / 1 / 2 vòng
   rays   độ đậm tia xoay phía sau (0 = tắt) rays2 1 = thêm lớp tia thứ hai quay ngược
   pillar độ đậm cột sáng                    crown 1 = vành sáng trên đầu    pulse chu kỳ sóng xung từ chân (giây, 0 = tắt)
   mf     tỉ lệ hạt dùng hình motif của hệ (còn lại là hạt vuông)           pu    cỡ pixel của motif (1 hoặc 2)
   rim    độ rộng viền sáng quanh thân (px, màu theo phẩm; 0 = không)       ★ = mốc nhảy vọt (đổi hẳn kiểu hiệu ứng)
   pz     (tuỳ chọn) cỡ hạt vuông tính bằng px, ghi đè mặc định          rt  (tuỳ chọn) độ dày vòng chân: 1 = mảnh, 2 = dày (mặc định 1)
   ============================================================ */
const STAGE_FX=[
 /* B1  */{name:'Sơ Sinh',  kind:'Không có (chỉ bóng dưới chân)',                          n:0, orbs:0,halo:0,  hr:0,   ring:0,rays:0,   rays2:0,pillar:0,   crown:0,pulse:0,  mf:0,  pu:1,rim:0},
 /* B2  */{name:'Ấu Thú',   kind:'Quầng sáng + 1 vòng chân MẢNH + vài hạt vuông',          n:6, orbs:0,halo:.60,hr:1.15,ring:1,rays:0,   rays2:0,pillar:0,   crown:0,pulse:0,  mf:0,  pu:1,rim:2,pz:3,rt:1},
 /* B3 ★*/{name:'Thiếu Thú',kind:'MỚI: vòng chân DÀY + hạt hình riêng của hệ + viền sáng', n:10,orbs:0,halo:.76,hr:1.28,ring:1,rays:0,   rays2:0,pillar:0,   crown:0,pulse:0,  mf:.55,pu:1,rim:3,pz:4,rt:2},
 /* B4  */{name:'Linh Thú', kind:'MỚI: thêm vòng chân thứ 2 (màu hệ) + hạt dày',          n:15,orbs:0,halo:.88,hr:1.40,ring:2,rays:0,   rays2:0,pillar:0,   crown:0,pulse:0,  mf:.55,pu:1,rim:3,pz:4,rt:2},
 /* B5  */{name:'Yêu Thú',  kind:'MỚI: sóng xung lan từ chân + hạt motif lớn + viền đậm', n:21,orbs:0,halo:.96,hr:1.52,ring:2,rays:0,   rays2:0,pillar:0,   crown:0,pulse:4.2,mf:.55,pu:2,rim:4,pz:4,rt:2},
 /* B6 ★*/{name:'Hung Thú', kind:'MỐC 2: tia xoay phía sau + 2 vòng chân + hạt motif lớn',n:20,orbs:0,halo:.90,hr:1.60,ring:2,rays:.42, rays2:0,pillar:0,   crown:0,pulse:0,  mf:.45,pu:2,rim:2},
 /* B7  */{name:'Trưởng Thú',kind:'Tia xoay đậm hơn, hạt dày',                            n:23,orbs:0,halo:.92,hr:1.68,ring:2,rays:.50, rays2:0,pillar:0,   crown:0,pulse:0,  mf:.45,pu:2,rim:3},
 /* B8  */{name:'Đại Thú',  kind:'Thêm 2 vệ tinh quay quanh + cột sáng mờ',               n:26,orbs:2,halo:.94,hr:1.76,ring:2,rays:.32, rays2:0,pillar:.10, crown:0,pulse:0,  mf:.50,pu:2,rim:3},
 /* B9  */{name:'Chí Tôn',  kind:'3 vệ tinh, cột sáng, sóng xung chậm',                   n:28,orbs:3,halo:.96,hr:1.84,ring:2,rays:.38, rays2:0,pillar:.16, crown:0,pulse:3.4,mf:.50,pu:2,rim:4},
 /* B10★*/{name:'Thần Thú', kind:'MỐC 3: vành sáng trên đầu + 2 lớp tia + cột sáng + 4 vệ tinh + sóng xung',n:27,orbs:4,halo:1.00,hr:1.96,ring:2,rays:.76,rays2:1,pillar:.38,crown:1,pulse:2.4,mf:.50,pu:2,rim:5}
];
const MAX_N={main:30,battle:20};

/* ============================================================
   BẢNG 2 — CẤU HÌNH THEO HỆ (17 dòng, đúng thứ tự EPI / VanKiepSprites.elements)
   c  màu chính   a  màu nhấn (lõi, tia sáng)   d  màu tối (khói/lửa tàn)   h  màu quầng sáng nền
   m  kiểu chuyển động của hạt:
      fall  rơi thẳng, lắc nhẹ        drift  trôi ngang sát đất        puff   bốc lên, phình to
      helix xoáy ốc quanh thân        jolt   giật tia (nhảy vị trí)    glow   đứng yên, sáng tắt mềm
      radial tỏa từ tâm ra ngoài      suck   bị hút xoáy vào tâm        glint  lóe chớp hình chữ thập
      orbit  quay quanh thân (xa/gần) orbit2 quay nghiêng, ngược chiều pend   lá đung đưa rơi
      flame  bốc lửa nhanh từ chân    smoke  khói đen chậm             float  lông vũ bay chéo lên
      spiral cánh hoa xoay rơi        holy   hạt vàng bay lên thành cột
   ray  kiểu tia phía sau (bậc 6+): line | zig | snow | tongue | spiral | ring | cloud | cross | wing | petal
   sp   tốc độ hạt (x)   mf  hạt motif nhiều/ít (nhân vào STAGE_FX.mf)   sz  cỡ hạt vuông (x)
   ============================================================ */
const ELEMENT_FX=[
 /* 0 Tuyết  */{c:'#dff4ff',a:'#8fd0ff',d:'#5a98c0',h:'#bfe8ff',m:'fall',   ray:'snow',  sp:.60,mf:1.0,sz:1},
 /* 1 Sương  */{c:'#cfe6e0',a:'#ffffff',d:'#6fa89e',h:'#9fd0c6',m:'drift',  ray:'ring',  sp:.50,mf:.8, sz:1.5},
 /* 2 Vân    */{c:'#e9e0ff',a:'#ffffff',d:'#9a86d0',h:'#c9b8ff',m:'puff',   ray:'cloud', sp:.40,mf:1.2,sz:1.5},
 /* 3 Phong  */{c:'#c8ffe0',a:'#ffffff',d:'#3fa070',h:'#8fffc0',m:'helix',  ray:'spiral',sp:1.40,mf:.9, sz:1},
 /* 4 Lôi    */{c:'#ffe86a',a:'#ffffff',d:'#c8901a',h:'#ffd83a',m:'jolt',   ray:'zig',   sp:1.00,mf:.6, sz:1},
 /* 5 Nguyệt */{c:'#d8d8ff',a:'#ffffff',d:'#7078c8',h:'#a8a8ff',m:'glow',   ray:'ring',  sp:.50,mf:1.0,sz:1},
 /* 6 Dương  */{c:'#ffd28a',a:'#fff2c0',d:'#d8782a',h:'#ffb84a',m:'radial', ray:'line',  sp:.90,mf:.8, sz:1},
 /* 7 Huyền  */{c:'#8c8cae',a:'#d0d0ff',d:'#4a4a7a',h:'#6a5acd',m:'suck',   ray:'spiral',sp:1.00,mf:.9, sz:1},
 /* 8 Kim    */{c:'#ffd24a',a:'#fff7c0',d:'#b8780e',h:'#ffc830',m:'glint',  ray:'cross', sp:.80,mf:.5, sz:1},
 /* 9 Ngọc   */{c:'#a8ffd8',a:'#ffffff',d:'#3a9a80',h:'#6affc0',m:'orbit',  ray:'line',  sp:1.00,mf:1.0,sz:1},
 /*10 Thanh  */{c:'#7affc0',a:'#c8ffa0',d:'#2f8f58',h:'#4aef9a',m:'pend',   ray:'tongue',sp:1.10,mf:1.2,sz:1},
 /*11 Xích   */{c:'#ff7a6a',a:'#ffd060',d:'#9a2a20',h:'#ff5a3a',m:'flame',  ray:'tongue',sp:2.60,mf:.35,sz:1.2},
 /*12 Hắc    */{c:'#8a6a98',a:'#d6a8e8',d:'#40284c',h:'#8a3aa0',m:'smoke',  ray:'spiral',sp:.70,mf:.5, sz:1.5},
 /*13 Tử     */{c:'#c06aff',a:'#ffe0ff',d:'#7838b0',h:'#b050ff',m:'orbit2', ray:'cross', sp:1.00,mf:1.0,sz:1},
 /*14 Thiên  */{c:'#aee0ff',a:'#ffffff',d:'#5a98c8',h:'#8fd0ff',m:'float',  ray:'wing',  sp:.70,mf:1.2,sz:1},
 /*15 Linh   */{c:'#ffd0f0',a:'#ffffff',d:'#c85aa0',h:'#ffa0e0',m:'spiral', ray:'petal', sp:.90,mf:1.2,sz:1},
 /*16 Thần   */{c:'#fff2a0',a:'#fff6b0',d:'#d8a028',h:'#ffe060',m:'holy',   ray:'line',  sp:1.10,mf:1.0,sz:1.2}
];

/* ============================================================
   BẢNG 3 — PHẨM HUYẾT MẠCH (pi 0..4: Tạp Huyết → Phản Tổ): chỉ MÀU VIỀN và ĐỘ SÁNG
   ============================================================ */
const PI_COL=['#b0a297','#65dcb5','#639eff','#c773ff','#ffca49'];
const PI_BRI=[.72,.84,.95,1.05,1.2];

/* ---------- nội bộ ---------- */
const SEED=new Float32Array(32);           /* số ngẫu nhiên cố định cho từng hạt (không random mỗi frame) */
{let s=20260611;for(let i=0;i<32;i++){s=(s*1664525+1013904223)>>>0;SEED[i]=s/4294967296}}
const MOTIF_ID=new Uint8Array(32);         /* hạt nào dùng motif: rải đều theo mf */
for(let i=0;i<32;i++)MOTIF_ID[i]=(i*7+3)%10; /* 0..9 */
const A={on:true};
const mk=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const stat={particles:0,layers:0,ms:0,frames:0};

/* ---------- cache sprite (tạo 1 lần, lười) ---------- */
const cHalo=[],cRays=[],cRays2=[],cPillar=[],cRingO=[],cRingI=[],cMotif=[];
function haloSpr(sp){
 let s=cHalo[sp];if(s)return s;
 s=mk(32,32);const g=s.getContext('2d'),col=ELEMENT_FX[sp].h;
 const gr=g.createRadialGradient(16,16,1,16,16,16);
 gr.addColorStop(0,col+'ff');gr.addColorStop(.35,col+'88');gr.addColorStop(.7,col+'26');gr.addColorStop(1,col+'00');
 g.fillStyle=gr;g.fillRect(0,0,32,32);return cHalo[sp]=s}
function raysSpr(sp,variant){
 const arr=variant?cRays2:cRays;let s=arr[sp];if(s)return s;
 const E=ELEMENT_FX[sp];s=mk(96,96);const g=s.getContext('2d');
 const P=(x,y,c,z)=>{z=Math.max(2,(z||1)+1);g.fillStyle=c;g.fillRect(Math.round(x)-(z>>1),Math.round(y)-(z>>1),z,z)};
 const C=48,col=E.c,acc=E.a;
 const ray=(a,r0,r1,w)=>{for(let r=r0;r<=r1;r++){const t=(r-r0)/(r1-r0),z=Math.max(1,Math.round(w*(1-t)));P(C+COS(a)*r,C+SIN(a)*r,t>.85?acc:col,z)}};
 const k=E.ray,off=variant?PI/12:0;
 if(k==='line'){const n=sp===9?6:sp===6?16:12;for(let i=0;i<n;i++)ray(i*TAU/n+off,10,i%2?34:45,i%2?1:2)}
 else if(k==='zig'){for(let i=0;i<8;i++){const a=i*TAU/8+off;let px=0;for(let r=12;r<=46;r++){if(r%5===0)px=(px===0?2:px>0?-2:2);const t=(r-12)/34;P(C+COS(a)*r-SIN(a)*px,C+SIN(a)*r+COS(a)*px,t>.8?acc:col,t<.5?2:1)}}}
 else if(k==='snow'){for(let i=0;i<6;i++){const a=i*TAU/6+off;ray(a,8,44,2);for(const r of[22,32])for(const sg of[-1,1]){const b=a+sg*PI/3;for(let q=0;q<8;q++)P(C+COS(a)*r+COS(b)*q,C+SIN(a)*r+SIN(b)*q,col,1)}}}
 else if(k==='tongue'){const n=10;for(let i=0;i<n;i++){const a=i*TAU/n+off;for(let r=10;r<=46;r++){const t=(r-10)/36,hw=Math.round(3.2*(1-t)),wob=SIN(r*.35+i)*1.4;for(let q=-hw;q<=hw;q++)P(C+COS(a)*r-SIN(a)*(q+wob),C+SIN(a)*r+COS(a)*(q+wob),(t>.7||Math.abs(q)<1&&t<.5)?acc:col,1)}}}
 else if(k==='spiral'){const dir=(sp===7||sp===12)?-1:1;for(let i=0;i<4;i++){const a0=i*TAU/4+off;for(let r=8;r<=46;r++){const t=(r-8)/38,a=a0+dir*(r-8)*.05;P(C+COS(a)*r,C+SIN(a)*r,t>.8?acc:col,t<.6?2:1)}}}
 else if(k==='ring'){for(const r of[18,30,43]){const n=Math.round(r*TAU/3);for(let i=0;i<n;i++){if(i%3===2)continue;const a=i*TAU/n+off;P(C+COS(a)*r,C+SIN(a)*r,(i%9===0)?acc:col,1)}}}
 else if(k==='cloud'){for(const[r,n]of[[38,9],[24,7]]){for(let i=0;i<n;i++){const a=i*TAU/n+(r===24?PI/n:0)+off;for(let q=-2;q<=2;q++)for(let w=-2;w<=2;w++)if(q*q+w*w<=5)P(C+COS(a)*r+q,C+SIN(a)*r+w,(q<0&&w<0)?acc:col,1)}}}
 else if(k==='cross'){for(let i=0;i<8;i++){const a=i*TAU/8+off,L=i%2?30:46;for(let r=8;r<=L;r++){const t=(r-8)/(L-8);P(C+COS(a)*r,C+SIN(a)*r,t>.8?acc:col,Math.max(1,Math.round((i%2?2:3)*(1-t))))}}}
 else if(k==='wing'){for(const sg of[0,1]){for(let i=0;i<7;i++){const a=(sg?PI:0)+(i-3)*.2*(sg?-1:1)+off*.3,L=26+i*3;ray(a,12,L,2)}}for(let i=0;i<3;i++)ray(-PI/2+(i-1)*.35,12,26,1)}
 else if(k==='petal'){const n=8;for(let i=0;i<n;i++){const a=i*TAU/n+off;for(let t=0;t<40;t++){const b=t*TAU/40,ex=COS(b)*13,ey=SIN(b)*5,rr=30;P(C+COS(a)*(rr+ex)-SIN(a)*ey,C+SIN(a)*(rr+ex)+COS(a)*ey,t%10===0?acc:col,1)}}}
 return arr[sp]=s}
function pillarSpr(sp){
 let s=cPillar[sp];if(s)return s;
 s=mk(16,64);const g=s.getContext('2d'),E=ELEMENT_FX[sp];
 for(let y=0;y<64;y++){const lv=Math.ceil((y/64)*5)/5;for(let x=0;x<16;x++){const e=Math.abs(x-7.5)/8,a=lv*(1-e*e);if(a<.05)continue;g.globalAlpha=a;g.fillStyle=(Math.abs(x-7.5)<2.5&&lv>.6)?E.a:E.c;g.fillRect(x,y,1,1)}}
 return cPillar[sp]=s}
function ringPts(g,rx,ry,col,ph,th){ /* elip pixel nét đứt, ph = pha nét đứt (đổi pha = "kiến bò") */
 g.fillStyle=col;const seen={};let k=0;
 for(let i=0;i<240;i++){const a=i*TAU/240,x=Math.round(32+COS(a)*rx),y=Math.round(8+SIN(a)*ry),key=x*100+y;if(seen[key])continue;seen[key]=1;
  if(((k+ph*3)%6)<4)g.fillRect(x,y,th>1?2:1,th>1?2:1);k++}}
function ringO(pi,ph,th){th=th>1?1:0;const a=cRingO[pi*2+th]||(cRingO[pi*2+th]=[]);if(a[ph])return a[ph];const s=mk(64,16);ringPts(s.getContext('2d'),31,7,PI_COL[pi],ph,th+1);return a[ph]=s}
function ringI(sp,ph,th){th=th>1?1:0;const a=cRingI[sp*2+th]||(cRingI[sp*2+th]=[]);if(a[ph])return a[ph];const s=mk(64,16);ringPts(s.getContext('2d'),22,5,ELEMENT_FX[sp].c,ph,th+1);return a[ph]=s}
function motifSpr(sp,unit,ci){ /* ci: 0 màu chính, 1 màu nhấn, 2 màu tối */
 const key=sp*6+(unit-1)*3+ci;let s=cMotif[key];if(s)return s;
 const E=ELEMENT_FX[sp],pts=MOTIF_PIXELS[EPI[sp][2]]||MOTIF_PIXELS.star,col=ci===1?E.a:ci===2?E.d:E.c;
 s=mk(7*unit,7*unit);const g=s.getContext('2d');g.fillStyle=col;
 for(let i=0;i<pts.length;i++)g.fillRect((pts[i][0]+3)*unit,(pts[i][1]+3)*unit,unit,unit);
 return cMotif[key]=s}
const COLN=['c','a','d'];

/* ---------- chuyển động hạt: ghi kết quả vào biến toàn cục (không tạo object) ---------- */
let X=0,Y=0,AL=0,D=1,CI=0,Z=1,KX=0;
function hash(q,i,k){return frac(SIN(q*12.9898+i*78.233+k*37.719)*43758.5453)}
function motion(m,i,N,T,sp){
 const s=SEED[i],v=sp*(.85+.3*SEED[(i+5)&31]),u=frac(T*.16*v+i/N+s*.37),w=SIN(u*PI);
 X=0;Y=0;AL=w;D=((i&3)===3)?-1:1;CI=(i%3===0)?1:0;Z=1;KX=0;
 switch(m){
 case 'fall':   X=(s*2-1)*.95+SIN(T*.9+s*6.3)*.14;Y=1.3-u*1.4;break;
 case 'drift':  X=(u*2-1)*1.05*(s<.5?1:-1);Y=.06+s*.55+SIN(T*.6+s*9)*.04;AL=w*.8;break;
 case 'puff':   X=(s*2-1)*.75+SIN(T*.5+s*7)*.1;Y=.12+u*.85;AL=w*.85;Z=1+u*.8;break;
 case 'helix':{const a=s*TAU+T*2.2+u*6;X=COS(a)*(.55+.12*u);Y=.05+u*1.1;D=SIN(a)<0?-1:1;break}
 case 'jolt':{const q=Math.floor(T*10+i*1.37);X=(hash(q,i,1)*2-1)*.9;Y=.05+hash(q,i,2)*1.0;AL=(frac(T*10+i*1.37)<.6?1:.2)*(s>.35?1:.5);KX=(i&1)?0:1;break}
 case 'glow':{X=COS(s*TAU*3.1)*(.35+.55*frac(s*7.7));Y=.12+.85*frac(s*13.7)+SIN(T*.4+s*5)*.02;const p=.5+.5*SIN(T*1.0+s*20);AL=p*p*.9;break}
 case 'radial':{const a=s*TAU+T*.12,r=.2+.95*u;X=COS(a)*r;Y=.5+SIN(a)*r*.8;AL=(1-u)*Math.min(1,u*6);break}
 case 'suck':{const a=s*TAU+T*1.4+u*3.2,r=1.05*(1-u);X=COS(a)*r;Y=.5+SIN(a)*r*.75;D=SIN(a)<0?-1:1;break}
 case 'glint':{X=(s*2-1)*.85;Y=.05+frac(s*7.31)*1.0;const p=frac(T*.45*sp+s*5);AL=p<.2?SIN(p/.2*PI):0;KX=1;break}
 case 'orbit':{const a=T*sp*1.3+i*TAU/N;X=COS(a)*.85;Y=.52+SIN(a)*.2+SIN(T*.7+i)*.05;D=SIN(a)<0?-1:1;AL=.55+.45*(SIN(a)*.5+.5);break}
 case 'orbit2':{const a=-T*sp*1.1+i*TAU/N;X=COS(a)*.8;Y=.5+SIN(a)*.3+COS(a)*.12;D=SIN(a)<0?-1:1;AL=(.5+.5*(SIN(a)*.5+.5))*(.6+.4*SIN(T*5+i));KX=(i%4===0)?1:0;break}
 case 'pend':   X=(s*2-1)*.5+SIN(T*1.7+s*6.3)*(.3+.25*s);Y=1.3-u*1.4;break;
 case 'flame':  X=(s*2-1)*.5*(1-u*.55)+SIN(T*9+i*1.7)*.05;Y=.03+u*1.05;AL=Math.min(1,(1-u)*1.6);Z=1.4-u;CI=u<.28?1:(u<.65?0:2);break;
 case 'smoke':  X=(s*2-1)*.5+SIN(T*.6+s*8)*.18*u;Y=.04+u*1.15;AL=w*.75;Z=1+u*.9;CI=(i%5===0)?1:0;break;
 case 'float':  X=(s*2-1)*.55+u*.55+SIN(T*.8+s*6.3)*.1;Y=.08+u*1.15;break;
 case 'spiral':{const a=T*1.3+s*TAU+u*4;X=COS(a)*(.4+.2*s);Y=1.25-u*1.3+SIN(a)*.05;D=SIN(a)<0?-1:1;break}
 case 'holy':{const j=i&1;X=j?(s*2-1)*.55:COS(s*TAU)*(.25+.55*frac(s*5.3));Y=u*1.4;Z=1.2;CI=j?1:0;D=1;break}
 }}

/* ---------- gom thông số cho 1 lần gọi ---------- */
let curN=0,curOrbs=0,curCfg=null,curEl=null,curMF=0;
function prep(stage,sp,mode){
 const c=STAGE_FX[clamp(stage|0,0,9)],e=ELEMENT_FX[clamp(sp|0,0,16)];
 curCfg=c;curEl=e;
 const cap=(MAX_N[mode]||30)-(c.crown?3:0); /* vành sáng đầu có 3 điểm sáng, tính vào tổng */
 curN=Math.min(cap,mode==='battle'?Math.round(c.n*20/30):c.n);
 curOrbs=Math.min(c.orbs,curN);
 curMF=clamp(c.mf*e.mf,0,.9);
}

/* ---------- nhường EVO: ẩn aura khi đang tiến hóa, hiện dần sau đó (chỉ màn chính) ---------- */
/* ---------- HIỆU ỨNG LÊN BẬC: khi bậc tăng (màn chính, không phải xem thử) → bùng sáng ~2 giây ----------
   Chờ EVO xong (aura hiện lại) rồi mới chạy. Mạnh dần theo bậc đích. */
let prevSt=-1,burstT=-1,burstPend=false,burstSt=0;
function trackStage(T,mode,stage,pv,f){
 if(mode!=='main'||pv)return;
 stage=clamp(stage|0,0,9);
 if(prevSt>=0&&stage>prevSt&&stage>=1){burstPend=true;burstSt=stage;burstT=-1}
 prevSt=stage;
 if(burstPend&&f>.35){burstPend=false;burstT=T}
}
const BURST_LEN=2.4;
let fade=1,lastT=-1;
function gate(T,mode,pv){
 if(mode!=='main'||pv)return 1;
 if(T!==lastT){const dt=lastT<0?0:clamp(T-lastT,0,.1);lastT=T;
  const E=window.EVO,busy=!!(E&&(E.on||(E.queue&&E.queue.length)));
  fade=busy?Math.max(0,fade-dt*4):Math.min(1,fade+dt*.85)}
 return fade}

/* ---------- vẽ 1 hạt ---------- */
function drawPart(g,i,px,py,al,sp,unit,sz){
 g.globalAlpha=al;
 px=Math.round(px/2)*2;py=Math.round(py/2)*2;
 if(MOTIF_ID[i]<curMF*10){
  const sp2=motifSpr(sp,unit,CI>2?2:CI),h=(7*unit)>>1;g.drawImage(sp2,px-h,py-h);
 }else{
  const z=Math.max(1,Math.round((curCfg.pz||(curCfg.n<=4?1:curCfg.pu===2?3:2))*sz*curEl.sz*(Z>1.8?1.8:Z)));
  g.fillStyle=curEl[COLN[CI>2?2:CI]];g.fillRect(px-(z>>1),py-(z>>1),z,z);
  if(KX&&al>.45){g.fillStyle=curEl.a;g.fillRect(px-1,py-4,2,8);g.fillRect(px-4,py-1,8,2)}
 }}

function layerParticles(g,side,cx,by,W2,H,T,sp,unit,bright,al){ /* side: -1 = phía sau thân, 1 = phía trước */
 const N=curN,m=curEl.m,spd=curEl.sp,nP=N-curOrbs;let cnt=0;
 for(let i=0;i<nP;i++){
  motion(m,i,nP,T,spd);
  if(D!==side)continue;
  const a=AL*bright*al;if(a<.03)continue;
  drawPart(g,i,cx+X*W2,by-Y*H,a>1?1:a,sp,unit,1);cnt++;
 }
 /* vệ tinh quay quanh thân (bậc 8+): hình motif + lõi trắng */
 for(let j=0;j<curOrbs;j++){
  const dir=(j&1)?-1:1,a=T*.85*dir+j*TAU/curOrbs,dep=SIN(a)<0?-1:1;
  if(dep!==side)continue;
  const px=Math.round((cx+COS(a)*W2*1.15)/2)*2,py=Math.round((by-H*(.55+SIN(a)*.2)-SIN(T*1.3+j)*3)/2)*2,k=.75+.25*dep;
  g.globalAlpha=Math.min(1,.95*bright*al*k);
  g.drawImage(motifSpr(sp,2,1),px-7,py-7);
  g.fillStyle='#ffffff';g.fillRect(px-1,py-1,2,2);cnt++;
 }
 stat.particles+=cnt;
}

/* ============================================================ API ============================================================ */
const API=window.PETAURA={
 ok:true, STAGE_FX, ELEMENT_FX, PI_COL, PI_BRI, MAX_N, stat, timing:false,
 back(g,cx,by,w,h,T,mode,stage,sp,pi,pv,al){
  const t0=API.timing?performance.now():0;
  if(al==null)al=1;const f=gate(T,mode,pv);stat.particles=0;stat.layers=0;trackStage(T,mode,stage,pv,f);
  if(f<=.01||!A.on)return;
  prep(stage,sp,mode);const c=curCfg;if(c.n<=0)return;
  pi=clamp(pi|0,0,4);al*=f;const bri=PI_BRI[pi],bat=mode==='battle';
  const W2=Math.max(w*.55,h*.42),cy=by-h*.52;
  g.save();g.imageSmoothingEnabled=false;
  if(c.halo>0){ /* quầng sáng nền (sprite 32x32 cache, phóng to kiểu pixel) */
   const d=c.hr*Math.max(h*1.9,W2*2.4)*(bat?.9:1),pulse=.92+.08*SIN(T*1.6);
   g.globalAlpha=clamp(c.halo*bri*al*pulse,0,1);g.drawImage(haloSpr(sp),cx-d/2,cy-d/2,d,d);stat.layers++}
  if(c.rays>0){ /* tia xoay phía sau (kiểu tia theo hệ) */
   const d=h*1.75*(bat?.9:1);
   g.globalAlpha=clamp(c.rays*bri*al,0,1);g.save();g.translate(cx,cy);g.rotate(T*.22*((curEl.m==='suck'||curEl.m==='smoke')?-1:1));g.drawImage(raysSpr(sp,0),-d/2,-d/2,d,d);g.restore();stat.layers++;
   if(c.rays2){g.globalAlpha=clamp(c.rays*.7*bri*al,0,1);g.save();g.translate(cx,cy);g.rotate(-T*.15);const d2=d*1.22;g.drawImage(raysSpr(sp,1),-d2/2,-d2/2,d2,d2);g.restore();stat.layers++}}
  if(c.pillar>0){ /* cột sáng */
   const pw=W2*.95,ph=h*1.6,fl=.8+.2*SIN(T*3.1);
   g.globalAlpha=clamp(c.pillar*bri*al*fl,0,1);g.drawImage(pillarSpr(sp),cx-pw/2,by-ph,pw,ph);stat.layers++}
  if(c.ring>0){ /* vòng chân: ngoài = màu phẩm, trong = màu hệ */
   const ph=(Math.floor(T*5)&1),rw=W2*2.15,rh=rw*.25,pz=.5+.5*SIN(T*2.2);
   g.globalAlpha=clamp((.62+.3*pz)*bri*al,0,1);g.drawImage(ringO(pi,ph,c.rt),cx-rw/2,by-rh/2+1,rw,rh);stat.layers++;
   if(c.ring>1){g.globalAlpha=clamp((.4+.35*(1-pz))*bri*al,0,1);const r2=rw*.78;g.drawImage(ringI(sp,ph,c.rt),cx-r2/2,by-r2*.125+1,r2,r2*.25);stat.layers++}}
  if(c.pulse>0){ /* sóng xung lan ra từ chân */
   const p=frac(T/c.pulse),rw=W2*2.15*(.6+p*1.3),rh=rw*.25;
   g.globalAlpha=clamp((1-p)*.55*bri*al,0,1);g.drawImage(ringO(pi,0),cx-rw/2,by-rh/2+1,rw,rh);stat.layers++}
  if(burstT>=0&&mode==='main'&&!pv){ /* sóng vòng bùng ra + quầng chớp khi vừa lên bậc */
   const bt=T-burstT,pw=.8+burstSt*.1;
   if(bt>=0&&bt<BURST_LEN){
    const fl=clamp(1-bt/1.1,0,1),d2=Math.max(h*1.9,W2*2.4)*(1.5+bt*.5);
    if(fl>0){g.globalAlpha=clamp(fl*.95*al,0,1);g.drawImage(haloSpr(sp),cx-d2/2,cy-d2/2,d2,d2)}
    for(let k=0;k<3;k++){const p=(bt-k*.38)/1.5;if(p<0||p>=1)continue;
     const rw=W2*2.15*(.4+p*(2.2+burstSt*.12)),rh=rw*.25;
     g.globalAlpha=clamp((1-p)*pw*al,0,1);g.drawImage(ringO(pi,0,2),cx-rw/2,by-rh/2+1,rw,rh);
     if(k===1){g.globalAlpha=clamp((1-p)*.8*al,0,1);g.drawImage(ringI(sp,0,2),cx-rw*.39,by-rw*.0975+1,rw*.78,rw*.195)}}
    stat.layers+=3}}
  layerParticles(g,-1,cx,by,W2,h,T,sp,c.pu,bri,al);
  g.restore();
  if(t0){stat.ms+=performance.now()-t0}
 },
 front(g,cx,by,w,h,T,mode,stage,sp,pi,pv,al){
  const t0=API.timing?performance.now():0;
  if(al==null)al=1;const f=gate(T,mode,pv);
  if(f<=.01||!A.on)return;
  prep(stage,sp,mode);const c=curCfg;if(c.n<=0)return;
  pi=clamp(pi|0,0,4);al*=f;const bri=PI_BRI[pi],W2=Math.max(w*.55,h*.42);
  g.save();g.imageSmoothingEnabled=false;
  layerParticles(g,1,cx,by,W2,h,T,sp,c.pu,bri,al);
  if(c.crown){ /* vành sáng trên đầu (bậc 10): vòng màu phẩm + vòng màu hệ + 3 điểm sáng */
   const ph=(Math.floor(T*4)&1),rw=W2*1.05,rh=rw*.3,hy=by-h*1.06+SIN(T*2)*2;
   g.globalAlpha=clamp(.9*bri*al,0,1);g.drawImage(ringO(pi,ph),cx-rw/2,hy-rh/2,rw,rh);
   g.globalAlpha=clamp(.7*bri*al,0,1);const r2=rw*.7;g.drawImage(ringI(sp,ph),cx-r2/2,hy-r2*.15,r2,r2*.3);
   g.globalAlpha=clamp(bri*al,0,1);g.fillStyle=curEl.a;
   for(let k=0;k<3;k++){const a=T*1.4+k*TAU/3;g.fillRect(Math.round((cx+COS(a)*rw*.48)/2)*2,Math.round((hy+SIN(a)*rh*.48)/2)*2,2,2)}
   stat.layers++;stat.particles+=3}
  if(burstT>=0&&mode==='main'&&!pv){ /* tia lửa toả ra từ thân */
   const bt=T-burstT;
   if(bt>=0&&bt<BURST_LEN-.6){
    const nn=12+burstSt*2,sz=burstSt>=4?6:4;
    for(let i=0;i<nn;i++){
     const a=i*TAU/nn+SEED[i&31]*.6,v=.55+SEED[(i+9)&31]*.8,r=bt*v*h*.9,q=bt/(BURST_LEN-.6),al2=clamp(1.15-q*q*1.15,0,1)*al;
     const px=Math.round((cx+COS(a)*r*1.25)/2)*2,py=Math.round((by-h*.5-SIN(a)*r*.85+bt*bt*h*.25)/2)*2;
     g.globalAlpha=clamp(al2,0,1);g.fillStyle=(i&1)?curEl.a:curEl.c;g.fillRect(px-(sz>>1),py-(sz>>1),sz,sz)}
    stat.particles+=nn}}
  g.restore();
  g.globalAlpha=1;
  if(t0){stat.ms+=performance.now()-t0;stat.frames++}
 },
 rim(stage,pi,battle){ /* chuỗi g.filter viền sáng (màu = phẩm huyết mạch). Cache theo (bậc, phẩm, chế độ) */
  const k=(stage|0)*10+(pi|0)*2+(battle?1:0),r=rimCache[k];if(r!==undefined)return r;
  const b=STAGE_FX[clamp(stage|0,0,9)].rim,dark='drop-shadow(0 0 1px rgba(10,6,14,.95))';
  let s;
  if(b<=0)s=battle?dark:'none';
  else{const al=Math.round(clamp(.55*PI_BRI[clamp(pi|0,0,4)],0,.95)*255).toString(16).padStart(2,'0');
   s=(battle?dark+' ':'')+'drop-shadow(0 0 '+b+'px '+PI_COL[clamp(pi|0,0,4)]+al+')'}
  return rimCache[k]=s},
 setEnabled(v){A.on=!!v}
};
const rimCache=[];
})();
