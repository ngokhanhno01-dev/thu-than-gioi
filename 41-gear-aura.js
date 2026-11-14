/* ===== [FX 3C] BUFF BỘ TRANG BỊ — vẽ lại theo ảnh mẫu (trận pháp + lốc xoáy + hạt riêng từng bộ) =====
   Đọc GHI_CHU_GEAR_AURA.md để biết đã làm đến bộ nào.
   Cách móc: 31-combat-fx.js › backGear() gọi window.TTGGearAura[kind](g,x,q,T,e,FXE) nếu bộ đó có ở đây;
   bộ nào chưa có thì backGear dùng code cũ. Mọi thứ vẽ TRƯỚC thú (lớp nền), tính từ T nên không giữ trạng thái.
   Không ảnh, không Math.random (dùng hash theo chỉ số). Chỉ vẽ, không đụng cơ chế trận.
   Mỗi bộ = KIT chung (trận pháp rune + lốc xoắn + nứt đất + quầng) + nét riêng của nguyên tố. */
(()=>{
 'use strict';
 const TAU=Math.PI*2,SQ=.4,GY=203;
 const cl=(v,a,b)=>v<a?a:v>b?b:v;
 const hash=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 const easeBack=t=>{const c=1.4;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2)};
 const REG=window.TTGGearAura=window.TTGGearAura||{};

 /* ---------- KIT CHUNG ---------- */
 /* điểm trên mặt đất (elip) theo góc/bán kính */
 const gp=(x,ang,r)=>[x+Math.cos(ang)*r,GY+Math.sin(ang)*r*SQ];

 /* Trận pháp: đĩa phát sáng, viền kép, dải rune quay, hình sao 6 cánh + hình thoi (quay ngược nhau), lõi sáng, vết nứt.
    P={deep,main,light,core}; al=độ đậm 0..1; o={r,cracks,ph,runeDir} */
 function circle(g,E,x,P,T,al,o){
  o=o||{};const R0=o.r||50,ph=o.ph||0,pulse=.82+.18*Math.sin(T*2.3+ph);
  g.save();
  /* đĩa nền (gradient từ lõi sáng ra rìa tối) */
  g.save();g.translate(x,GY);g.scale(1,SQ);
  let gr=g.createRadialGradient(0,0,0,0,0,R0*1.05);
  gr.addColorStop(0,E.rgba(P.deep,.0));gr.addColorStop(.5,E.rgba(P.deep,.42*al));gr.addColorStop(.9,E.rgba(P.deep,.62*al));gr.addColorStop(1,E.rgba(P.deep,0));
  g.fillStyle=gr;g.beginPath();g.arc(0,0,R0*1.05,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  gr=g.createRadialGradient(0,0,0,0,0,R0);
  gr.addColorStop(0,E.rgba(P.core,.85*al*pulse));gr.addColorStop(.22,E.rgba(P.light,.5*al));gr.addColorStop(.62,E.rgba(P.main,.2*al));gr.addColorStop(1,E.rgba(P.main,.06*al));
  g.fillStyle=gr;g.beginPath();g.arc(0,0,R0,0,TAU);g.fill();
  g.restore();
  /* viền ngoài kép */
  const ell=(r,lw,col,a,add)=>{g.save();g.globalCompositeOperation=add===false?'source-over':'lighter';g.lineWidth=lw;g.strokeStyle=E.rgba(col,a);g.beginPath();g.ellipse(x,GY,r,r*SQ,0,0,TAU);g.stroke();g.restore()};
  ell(R0+1.6,2.2,P.deep,.75*al,false);
  ell(R0,3.4,P.main,.35*al);ell(R0,1.6,P.light,.95*al);ell(R0-2.6,.8,P.core,.7*al);
  ell(R0*.8,1,P.light,.7*al);ell(R0*.93,.8,P.main,.7*al);
  /* dải rune quay */
  const N=34,dir=o.runeDir||1,rr=R0*.865,gs=R0*.042;
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  for(let pass=0;pass<2;pass++){
   g.strokeStyle=E.rgba(pass?P.core:P.light,(pass?.8:.38)*al);g.lineWidth=pass?.8:1.9;g.beginPath();
   for(let k=0;k<N;k++){
    const an=k/N*TAU+T*.11*dir,ca=Math.cos(an),sa=Math.sin(an),v=Math.floor(hash(k*3.1+ph)*5);
    const seg=[[[-1,-1],[1,-1]],[[0,-1],[0,1]],[[-1,1],[1,0],[-1,-1]],[[-1,-1],[0,0],[1,-1],[0,1]],[[-1,0],[1,0],[0,1]]][v];
    seg.forEach((p,i)=>{const a2=p[0]*gs*.8,b2=p[1]*gs,px=ca*(rr+b2)-sa*a2,py=sa*(rr+b2)+ca*a2,X=x+px,Y=GY+py*SQ;i?g.lineTo(X,Y):g.moveTo(X,Y)});
   }
   g.stroke();
  }
  g.restore();
  /* hình sao 6 cánh + hình thoi (quay ngược nhau) */
  const poly=(n,r,rot,lw,col,a)=>{g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineWidth=lw;g.strokeStyle=E.rgba(col,a);g.beginPath();
   for(let i=0;i<=n;i++){const an=rot+i*TAU/n,X=x+Math.cos(an)*r,Y=GY+Math.sin(an)*r*SQ;i?g.lineTo(X,Y):g.moveTo(X,Y)}g.stroke();g.restore()};
  const rot=T*.2*dir+ph;
  for(let t=0;t<2;t++){poly(3,R0*.72,rot+t*Math.PI/3,2.6,P.main,.3*al);poly(3,R0*.72,rot+t*Math.PI/3,1.1,P.light,.95*al)}
  poly(4,R0*.5,-rot*1.4+.78,2.2,P.main,.28*al);poly(4,R0*.5,-rot*1.4+.78,.9,P.light,.85*al);
  ell(R0*.4,.9,P.light,.75*al);ell(R0*.36,.7,P.core,.5*al);
  /* tick nhỏ vòng trong */
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(P.core,.8*al);
  for(let k=0;k<16;k++){const an=k/16*TAU-T*.3*dir,X=x+Math.cos(an)*R0*.38,Y=GY+Math.sin(an)*R0*.38*SQ;g.fillRect(X-.6,Y-.6,1.2,1.2)}
  g.restore();
  /* lõi sáng giữa trận */
  g.save();g.translate(x,GY);g.scale(1,SQ);E.glow(g,0,0,R0*.36*(.9+.1*pulse),P.core,.85*al*pulse,'#ffffff');g.restore();
  /* vết nứt đất */
  if(o.cracks!==false){
   g.save();g.lineCap='round';g.lineJoin='round';
   for(let k=0;k<11;k++){
    const an=hash(k*5.7+ph)*TAU,r0=R0*(.95+hash(k)*.1),len=11+hash(k+9)*17,pts=[gp(x,an,r0)];
    for(let s=1;s<=3;s++){const aa=an+(hash(k*7+s)-.5)*.34;pts.push(gp(x,aa,r0+len*s/3));}
    g.strokeStyle=E.rgba('#10162a',.78*al);g.lineWidth=1.5;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(P.main,.35*al);g.lineWidth=.7;g.stroke();g.globalCompositeOperation='source-over';
   }
   g.restore();
  }
  g.restore();
 }

 /* Lốc xoắn: các dải lưỡi liềm uốn quanh thú, thon hai đầu, có mặt tối/sáng/gân sáng.
    o={n,H,R,turns,spin,wmax,tilt} */
 function swirl(g,E,x,P,T,al,o){
  o=o||{};const n=o.n||6,H=o.H||110,R=o.R||50,turns=o.turns||.78,spin=o.spin||1.25,wmax=o.wmax||15;
  for(let i=0;i<n;i++){
   const base=i/n*TAU+(o.ph||0),sp=T*spin*(.85+.12*(i%3)),yo=(i%3)*H*.3+Math.floor(i/3)*H*.08,hh=H*(.42+.08*(i%2)),pts=[];
   const m=30;
   for(let j=0;j<m;j++){
    const t=j/(m-1),ang=base+sp+t*turns*TAU,rad=R*(.78+.36*Math.sin(Math.PI*t))+3*Math.sin(T*2.1+i*1.7+t*6);
    pts.push([x+Math.cos(ang)*rad,GY-8-yo-t*hh+Math.sin(ang)*rad*.36]);
   }
   const wob=.82+.18*Math.sin(T*1.6+i*2.3),wf=q=>Math.max(.6,wmax*wob*Math.pow(Math.sin(Math.PI*Math.pow(q,.85)),.9));
   E.ribbon(g,pts,q=>wf(q)*1.18,P.deep,al*.5,{add:false,core:P.deep});           /* mặt tối phía dưới */
   E.ribbon(g,pts,wf,P.main,al*.82,{core:P.light});                               /* thân dải */
   E.ribbon(g,pts.slice(3),q=>wf(q)*.42,P.light,al*.62,{core:P.core});            /* gân sáng */
   const tip=pts[m-1];E.glow(g,tip[0],tip[1],6,P.light,.35*al);
  }
 }

 /* sao 4 cánh nhấp nháy */
 function spark4(g,E,x,y,s,col,a){
  if(a<=.02)return;g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(col,a);
  g.beginPath();g.moveTo(x,y-s);g.quadraticCurveTo(x+s*.12,y-s*.12,x+s,y);g.quadraticCurveTo(x+s*.12,y+s*.12,x,y+s);g.quadraticCurveTo(x-s*.12,y+s*.12,x-s,y);g.quadraticCurveTo(x-s*.12,y-s*.12,x,y-s);g.fill();g.restore();
 }
 function sparks(g,E,x,P,T,al,n,top){
  for(let k=0;k<n;k++){
   const px=x+(hash(k*2.3)*2-1)*66,py=GY-(top||120)*hash(k*4.1+1)+8,tw=Math.pow(Math.max(0,Math.sin(T*(1.6+hash(k)*1.8)+k*2.1)),2);
   spark4(g,E,px,py,2.2+hash(k+5)*3,k%3?P.light:P.core,tw*.95*al);
  }
 }

 /* thông số cường độ: nền luôn rõ, lúc vào trận (q>0) bừng hơn */
 function level(q,T,id){
  const a=q>0?Math.min(1,q*1.8):0,rest=.66+.07*Math.sin(T*2.9+id);
  return{a,al:Math.max(rest,.98*a)};
 }
 /* quầng sáng sau lưng thú + sóng bung lúc vào trận */
 function halo(g,E,x,P,T,al,a,q){
  E.glow(g,x,168,64+8*Math.sin(T*2),P.main,.2*al);
  if(a>0){
   const k=1-q;E.wave(g,x,GY,34+k*58,P.light,Math.min(1,q*1.5)*.85,2.4,{t:T,seed:7,sq:SQ,wob:.05,core:P.core});
   E.wave(g,x,GY,22+k*40,P.core,Math.min(1,q*1.5)*.6,1.4,{t:T+1,seed:9,sq:SQ,wob:.05,core:'#ffffff'});
  }
 }

 /* ================= BỘ 0 — FROST (băng): ảnh mẫu Tuyết Nguyên ================= */
 const FROST={deep:'#1d5fa8',main:'#43b6ec',light:'#9fe6ff',core:'#f2fdff'};
 const ICE={dark:'#1767b5',mid:'#36b4e8',light:'#a8ecff',edge:'#e8fbff'};
 function flake(g,E,x,y,r,rot,a,col){
  if(a<=.02||r<2)return;g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';g.lineCap='round';
  for(let pass=0;pass<2;pass++){
   g.strokeStyle=E.rgba(pass?'#ffffff':col,(pass?.9:.4)*a);g.lineWidth=pass?Math.max(.7,r*.08):Math.max(1.6,r*.22);g.beginPath();
   for(let k=0;k<6;k++){
    const c=Math.cos(k*Math.PI/3),s=Math.sin(k*Math.PI/3);
    g.moveTo(0,0);g.lineTo(c*r,s*r);
    for(const [f,l] of [[.5,.38],[.78,.24]]){
     const bx=c*r*f,by=s*r*f;
     for(const sg of [-1,1]){const aa=k*Math.PI/3+sg*Math.PI/3;g.moveTo(bx,by);g.lineTo(bx+Math.cos(aa)*r*l,by+Math.sin(aa)*r*l)}
    }
   }
   g.stroke();
  }
  g.restore();E.glow(g,x,y,r*.7,col,.18*a);
 }
 REG.frost=function(g,x,q,T,e,E){
  const P=FROST,{a,al}=level(q,T,0),grow=e==null?1:cl(e/.55,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   circle(g,E,x,P,T,al,{r:58,ph:.4});
   /* sương lạnh sát đất */
   for(let k=0;k<7;k++){
    const px=x+(hash(k*3.3)*2-1)*58+Math.sin(T*.5+k)*5,py=GY+(hash(k+2)-.2)*6;
    E.blob(g,px,py,18+hash(k+4)*12,4+hash(k+7)*3,P.light,.16*al,T*.6,k*13,{wob:.3,speed:1.4,core:P.core});
   }
   /* tinh thể: cụm trái/phải trận pháp (phía sau thú) */
   const crys=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<7;k++){
     const t=k/6,ang0=-.3+t*1.75,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7)-.5)*.2,rp=58*(.96+hash(k*2+side)*.1),p=gp(x,ang,rp);
     const side2=Math.abs(Math.cos(ang)),hh=(20+hash(k*3+side*5)*36)*(.5+.75*side2),w=hh*.36+5;
     crys.push({x:p[0],y:p[1],h:hh,w,lean:-side*(hh*.2+hash(k+3)*6)+(p[0]-x)*.12,k:k+side*20});
    }
   }
   crys.sort((p,q2)=>p.y-q2.y);
   const drawCr=c=>{
    const br=1+.035*Math.sin(T*2+c.k),sh=.5+.5*Math.sin(T*2.4+c.k*1.7);
    E.crystal(g,c.x,c.y,c.w,c.h*gk*br,c.lean,ICE,Math.min(1,al*1.25),{shine:sh,crack:.6+.4*Math.sin(T*1.3+c.k)});
   };
   crys.filter(c=>c.y<GY).forEach(drawCr);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.3,wmax:16,ph:.3});
   crys.filter(c=>c.y>=GY).forEach(drawCr);
   /* bông tuyết rơi quanh thú */
   for(let k=0;k<13;k++){
    const sp=.045+hash(k*1.9)*.05,p=(T*sp+hash(k*6.1))%1,side=k%2?1:-1,
     fx=x+side*(22+hash(k*2.7)*48)+Math.sin(T*.8+k*1.3)*6,fy=GY-132+p*138,
     r=4.5+hash(k+8)*8.5,fa=Math.pow(Math.sin(Math.PI*p),.7)*al;
    flake(g,E,fx,fy,r,T*.45*side+k,fa,P.light);
   }
   /* mảnh băng nhỏ lơ lửng + lấp lánh */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<9;k++){
    const ang=T*.35*(k%2?1:-1)+k*.7,rr=34+hash(k)*20,px=x+Math.cos(ang)*rr,py=GY-34-hash(k+3)*70+Math.sin(ang)*8,s=1.8+hash(k+6)*2.2;
    g.fillStyle=E.rgba(k%2?P.light:P.core,.8*al);g.beginPath();g.moveTo(px,py-s*1.5);g.lineTo(px+s,py);g.lineTo(px,py+s*1.5);g.lineTo(px-s,py);g.closePath();g.fill();
   }
   g.restore();
   sparks(g,E,x,P,T,al,16,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 1 — MIST (sương): ảnh mẫu Sương Cốc ================= */
 const MIST={deep:'#22857f',main:'#4fd0bd',light:'#a6efdc',core:'#effffb'};
 /* giọt nước bóng (tròn hoặc giọt lê) */
 function bead(g,E,x,y,r,a,drop){
  if(a<=.02||r<1)return;g.save();
  g.globalAlpha=Math.min(1,a);
  const gr=g.createRadialGradient(x-r*.3,y-r*.35,r*.1,x,y,r);
  gr.addColorStop(0,'#d8fffa');gr.addColorStop(.45,'#4fd0e0');gr.addColorStop(1,'#1c7f95');
  g.fillStyle=gr;g.beginPath();
  if(drop){g.moveTo(x,y-r*1.7);g.bezierCurveTo(x+r*.2,y-r*.8,x+r,y-r*.4,x+r,y+r*.1);g.arc(x,y+r*.1,r,0,Math.PI);g.bezierCurveTo(x-r,y-r*.4,x-r*.2,y-r*.8,x,y-r*1.7)}
  else g.arc(x,y,r,0,TAU);
  g.fill();g.lineWidth=Math.max(.6,r*.18);g.strokeStyle='rgba(18,96,120,.75)';g.stroke();
  g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,255,255,.95)';
  g.beginPath();g.arc(x-r*.32,y-r*.38,Math.max(.6,r*.26),0,TAU);g.fill();
  g.restore();E.glow(g,x,y,r*2,'#6fe6e0',.16*a);
 }
 /* vòng xoáy mây (xoắn ốc) */
 function curl(g,E,x,y,r,rot,col,a,w){
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';
  for(let pass=0;pass<2;pass++){
   g.strokeStyle=E.rgba(pass?'#ffffff':col,(pass?.55:.3)*a);g.lineWidth=pass?w*.4:w;g.beginPath();
   for(let i=0;i<=40;i++){const t=i/40,an=rot+t*TAU*1.9,rr=r*t,X=x+Math.cos(an)*rr*1.25,Y=y+Math.sin(an)*rr*.8;i?g.lineTo(X,Y):g.moveTo(X,Y)}
   g.stroke();
  }
  g.restore();
 }
 function crescent(g,E,x,y,r,rot,col,a){
  if(a<=.02)return;g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(col,a);
  g.beginPath();g.arc(0,0,r,-1.1,1.1);g.arc(r*.35,0,r*.82,1.0,-1.0,true);g.closePath();g.fill();g.restore();
 }
 function gem(g,E,x,y,s,a,col){
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(col,a);g.strokeStyle=E.rgba('#ffffff',.8*a);g.lineWidth=.6;
  g.beginPath();g.moveTo(x,y-s*1.4);g.lineTo(x+s,y);g.lineTo(x,y+s*1.4);g.lineTo(x-s,y);g.closePath();g.fill();g.stroke();g.restore();
 }
 REG.mist=function(g,x,q,T,e,E){
  const P=MIST,{a,al}=level(q,T,1),grow=e==null?1:cl(e/.7,0,1);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* bãi sương rộng phía sau: nhiều khối mềm trôi chậm */
   for(let k=0;k<18;k++){
    const side=hash(k*1.7)*2-1,px=x+side*(66+10*Math.abs(side)+8*Math.sin(T*.3+k))+Math.sin(T*.35+k*1.9)*8,
     py=GY-2-hash(k+5)*30*grow,rx=26+hash(k+9)*20,ry=10+hash(k+13)*10;
    E.blob(g,px,py,rx,ry,k%3?P.main:P.light,(.2+.08*hash(k))*al,T*.5,k*17,{wob:.4,speed:1.1,core:P.light});
   }
   /* vòng sương thấp quay quanh trận pháp (nhiều lớp) */
   swirl(g,E,x,P,T,al*.85,{n:5,H:46,R:66,turns:.9,spin:.7,wmax:13,ph:1.1});
   circle(g,E,x,P,T,al,{r:58,ph:1.3,cracks:false,runeDir:-1});
   swirl(g,E,x,P,T,al*.7,{n:4,H:62,R:50,turns:.8,spin:-.9,wmax:11,ph:.2});
   /* vòng xoáy mây ở hai đầu bãi sương */
   for(let k=0;k<5;k++){
    const side=k%2?1:-1,cx=x+side*(62+k*7)+Math.sin(T*.4+k)*4,cy=GY-10-(k%3)*9;
    curl(g,E,cx,cy,13+hash(k)*7,T*.5*side+k,P.light,al,2.4);
   }
   /* tinh thể nhỏ thành cụm */
   for(let k=0;k<4;k++){
    const side=k%2?1:-1,cx=x+side*(70+hash(k)*22),cy=GY-46-hash(k+2)*50;
    for(let j=0;j<5;j++){const ox=(hash(k*5+j)-.5)*14,oy=(hash(k*7+j)-.5)*12,tw=.55+.45*Math.sin(T*2.4+k*2+j);gem(g,E,cx+ox,cy+oy,1.2+hash(j+k)*1.4,al*tw,j%2?P.light:'#7fe9f2')}
   }
   /* giọt nước nổi lên */
   for(let k=0;k<26;k++){
    const sp=.05+hash(k*2.2)*.06,p=(T*sp+hash(k*3.9))%1,side=hash(k*1.3)*2-1,
     bx=x+side*(18+70*Math.abs(side))+Math.sin(T*1.1+k*2.1)*5,by=GY-10-p*128,
     r=1.6+hash(k+4)*3.8,fa=Math.pow(Math.sin(Math.PI*p),.6)*al*1.05;
    bead(g,E,bx,by,r,fa,k%4===0);
   }
   /* vệt trăng khuyết trắng xanh + lấp lánh */
   for(let k=0;k<4;k++){
    const p=(T*.07+k*.25)%1,side=k%2?1:-1;
    crescent(g,E,x+side*(54+k*6)+Math.sin(T+k)*3,GY-24-p*84,7+k%2*3,side*.9+Math.sin(T*.7+k)*.4,'#cfeff2',Math.sin(Math.PI*p)*.7*al);
   }
   sparks(g,E,x,P,T,al,16,120);
  }finally{g.restore()}
 };

 /* ================= BỘ 2 — CLOUD (mây): ảnh mẫu Vân Đảo ================= */
 const CLOUD={deep:'#4a2f86',main:'#8e66d8',light:'#cdb2ff',core:'#f6ecff'};
 const CLOUD_RING={deep:'#7a2a78',main:'#e070c8',light:'#ffb0e8',core:'#fff0fb'};   /* trận pháp hồng tím như ảnh */
 /* ngọn lửa ma: giọt có đuôi cuộn */
 function wisp(g,E,x,y,s,rot,col,a){
  if(a<=.02)return;g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(col,.75*a);g.beginPath();
  g.moveTo(0,s*1.5);g.bezierCurveTo(s*.9,s*1.2,s*.9,s*.1,s*.25,-s*.5);g.bezierCurveTo(-s*.3,-s*1.1,s*.5,-s*1.7,s*.1,-s*2.2);
  g.bezierCurveTo(-s*.7,-s*1.6,-s*.9,-s*.5,-s*.55,s*.3);g.bezierCurveTo(-s*.9,s*.6,-s*.6,s*1.3,0,s*1.5);g.fill();
  g.fillStyle=E.rgba('#ffffff',.55*a);g.beginPath();g.ellipse(-s*.1,s*.45,s*.28,s*.55,0,0,TAU);g.fill();g.restore();
 }
 REG.cloud=function(g,x,q,T,e,E){
  const P=CLOUD,R=CLOUD_RING,{a,al}=level(q,T,2),grow=e==null?1:cl(e/.7,0,1);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   circle(g,E,x,R,T,al,{r:58,ph:2.1,runeDir:1});
   /* khối mây tím dày quấn quanh thân (nhiều cụm tròn chồng nhau, mặt tối + sáng) */
   for(let k=0;k<16;k++){
    const an=k/16*TAU+T*.12*(k%2?1:-1)*.5+hash(k)*.4,rad=40+hash(k+3)*18,
     px=x+Math.cos(an)*rad*1.15,py=GY-26-hash(k+8)*46*grow+Math.sin(an)*rad*.28,rx=17+hash(k+11)*15,ry=11+hash(k+14)*11;
    E.blob(g,px,py+2,rx,ry,P.deep,.5*al,T*.4,k*9,{wob:.28,speed:.8,core:P.deep,add:false});
    E.blob(g,px,py,rx*.88,ry*.85,k%3?P.main:P.light,.62*al,T*.5,k*13,{wob:.3,speed:1,core:P.light});
   }
   swirl(g,E,x,P,T,al,{n:6,H:112,R:48,turns:.8,spin:1.15,wmax:15,ph:.9});
   swirl(g,E,x,P,T,al*.7,{n:3,H:90,R:58,turns:.7,spin:-.8,wmax:10,ph:2.4});
   /* vòng xoáy mây ở rìa */
   for(let k=0;k<3;k++){
    const side=k%2?1:-1;curl(g,E,x+side*(64+k*5),GY-24-k*10,12+k*3,T*.45*side+k,P.light,al*.9,2.4);
   }
   /* tia điện tím lóe thỉnh thoảng trong mây */
   const bl=Math.floor(T*1.7),ph=T*1.7-bl;
   if(ph<.28&&hash(bl*3.3)>.35){
    const bx=x+(hash(bl)*2-1)*38,by=GY-96+hash(bl+2)*22,pts=[[bx,by]];
    for(let j=1;j<=6;j++)pts.push([bx+(hash(bl*7+j)-.5)*20,by+j*11]);
    g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';
    const fa=(1-ph/.28)*al;
    g.strokeStyle=E.rgba(P.main,.6*fa);g.lineWidth=4;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
    g.strokeStyle=E.rgba('#fff0ff',.95*fa);g.lineWidth=1.6;g.stroke();g.restore();
   }
   /* ngọn lửa ma bay lên quanh thú */
   for(let k=0;k<10;k++){
    const sp=.04+hash(k*2.7)*.04,p=(T*sp+hash(k*4.4))%1,side=k%2?1:-1,
     wx=x+side*(40+hash(k*1.9)*34)+Math.sin(T*1.1+k*1.7)*6,wy=GY-6-p*136;
    wisp(g,E,wx,wy,4.4+hash(k+6)*3.6,side*(.25+.2*Math.sin(T+k)),k%3?'#d9a0ff':'#ff9ad0',Math.sin(Math.PI*p)*al*1.05);
   }
   /* hạt hồng/tím + sao */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<14;k++){
    const p=(T*(.06+hash(k)*.05)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*70,py=GY-8-p*120;
    g.fillStyle=E.rgba(k%2?'#ffb0e8':P.light,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,{light:'#ffc0ee',core:'#fff0fb'},T,al,14,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 3 — WIND (gió): ảnh mẫu Phong Nguyên ================= */
 const WIND={deep:'#1f8a6c',main:'#4fd6a0',light:'#a8f5cf',core:'#effff6'};
 function leaf(g,E,x,y,s,rot,spin,col,a){
  if(a<=.02)return;g.save();g.translate(x,y);g.rotate(rot);g.scale(1,.62+.38*Math.abs(Math.cos(spin)));g.globalAlpha=Math.min(1,a);
  g.fillStyle=col;g.beginPath();g.moveTo(-s,0);g.quadraticCurveTo(-s*.1,-s*.78,s,0);g.quadraticCurveTo(-s*.1,s*.78,-s,0);g.fill();
  g.strokeStyle='rgba(200,255,200,.8)';g.lineWidth=Math.max(.7,s*.14);g.beginPath();g.moveTo(-s*.9,0);g.lineTo(s*.75,0);g.stroke();
  g.restore();
 }
 /* vệt chém gió lưỡi liềm: cung elip thon hai đầu quay quanh thú */
 function slash(g,E,x,y,rx,ry,a0,span,w,col,core,al){
  if(al<=.02)return;const pts=[],m=18;
  for(let j=0;j<m;j++){const an=a0+span*j/(m-1);pts.push([x+Math.cos(an)*rx,y+Math.sin(an)*ry]);}
  E.ribbon(g,pts,q=>Math.max(.5,w*Math.pow(Math.sin(Math.PI*q),.8)),col,al*.85,{core:core});
 }
 REG.wind=function(g,x,q,T,e,E){
  const P=WIND,{a,al}=level(q,T,3),grow=e==null?1:cl(e/.7,0,1);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   circle(g,E,x,P,T,al,{r:58,ph:3.2,runeDir:1});
   /* đế mây bạc hà thấp hai bên (bán trong suốt) */
   for(let k=0;k<12;k++){
    const side=hash(k*1.9)*2-1,px=x+side*(52+14*Math.abs(side))+Math.sin(T*.4+k)*6,py=GY-2-hash(k+4)*22*grow,rx=20+hash(k+7)*16,ry=8+hash(k+10)*8;
    E.blob(g,px,py,rx,ry,k%2?P.light:P.main,(.22+.08*hash(k))*al,T*.5,k*11,{wob:.35,speed:1,core:P.light});
   }
   for(let k=0;k<3;k++){const side=k%2?1:-1;curl(g,E,x+side*(62+k*6),GY-12-k*8,10+k*3,T*.5*side+k,P.light,al*.9,2.4)}
   swirl(g,E,x,P,T,al,{n:6,H:112,R:48,turns:.8,spin:1.45,wmax:15,ph:.5});
   swirl(g,E,x,P,T,al*.75,{n:3,H:96,R:58,turns:.7,spin:-1.0,wmax:10,ph:1.9});
   /* vệt chém gió ngoài cùng */
   for(let k=0;k<7;k++){
    const sp=(k%2?1:-1)*(.8+hash(k)*.7),a0=T*sp+k*1.1,ph=(T*.35+k*.19)%1;
    slash(g,E,x,GY-28-hash(k+3)*80,62+hash(k+1)*20,14+hash(k+5)*8,a0,1.1+hash(k+9)*.8,5+hash(k+2)*2.5,'#9ff3e0','#ffffff',Math.min(1,Math.sin(Math.PI*ph)*1.4)*al);
   }
   /* lá xoáy bay lên */
   for(let k=0;k<18;k++){
    const sp=.045+hash(k*2.1)*.05,p=(T*sp+hash(k*5.7))%1,an=T*(.9+hash(k)*.7)*(k%2?1:-1)+k*1.7,rad=34+hash(k+4)*30+p*8;
    leaf(g,E,x+Math.cos(an)*rad,GY-8-p*128+Math.sin(an)*rad*.3,6.2+hash(k+8)*4.2,an*.8+k,T*(2+hash(k+2)*2)+k,k%3?'#2f9a46':'#58c454',Math.sin(Math.PI*p)*al*1.1);
   }
   /* hạt gió + sao */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<12;k++){
    const p=(T*(.08+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*72,py=GY-10-p*118;
    g.fillStyle=E.rgba(k%2?P.light:'#ffffff',Math.sin(Math.PI*p)*.85*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,12,120);
  }finally{g.restore()}
 };

 /* ================= BỘ 4 — THUNDER (sấm): ảnh mẫu Lôi Vực ================= */
 const THUNDER={deep:'#4a3208',main:'#d09a14',light:'#ffd93c',core:'#fffacc'};
 /* tia sét gãy khúc từ (x0,y0) tới (x1,y1); jit = độ lệch ngang */
 function zig(x0,y0,x1,y1,seed,n,jit){
  const pts=[[x0,y0]],dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  for(let j=1;j<n;j++){const t=j/n,o=(hash(seed*7.13+j*3.7)-.5)*2*jit*(1-t*.25);pts.push([x0+dx*t+nx*o,y0+dy*t+ny*o])}
  pts.push([x1,y1]);return pts;
 }
 /* vẽ 1 tia sét: quầng vàng + thân sáng + lõi trắng vàng */
 function bolt(g,E,pts,w,P,al){
  if(al<=.02)return;g.save();g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';
  const path=()=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]))};
  g.strokeStyle=E.rgba(P.main,.4*al);g.lineWidth=w*2.8;path();g.stroke();
  g.strokeStyle=E.rgba(P.light,.95*al);g.lineWidth=w*1.2;path();g.stroke();
  g.strokeStyle=E.rgba(P.core,.9*al);g.lineWidth=Math.max(.9,w*.5);path();g.stroke();
  g.restore();
 }
 /* cành sét rẽ nhánh: thân chính + 2 nhánh phụ */
 function tree(g,E,x0,y0,ang,len,seed,w,P,al){
  const x1=x0+Math.cos(ang)*len,y1=y0+Math.sin(ang)*len,pts=zig(x0,y0,x1,y1,seed,6,len*.12);
  bolt(g,E,pts,w,P,al);
  [2,4].forEach((ix,i)=>{
   const p=pts[ix],sg=hash(seed+i*5.1)>.5?1:-1,a2=ang+sg*(.55+hash(seed+i)*.4),l2=len*(.42+hash(seed+i*2)*.15);
   bolt(g,E,zig(p[0],p[1],p[0]+Math.cos(a2)*l2,p[1]+Math.sin(a2)*l2,seed+i*9,4,l2*.14),w*.7,P,al*.85);
  });
 }
 /* tảng đá nứt phát dung nham đỏ cam */
 function rock(g,E,x,y,s,k,al,T){
  const m=7,pts=[];
  for(let i=0;i<m;i++){const an=i/m*TAU+hash(k+i)*.45,r=s*(.68+hash(k*3+i)*.55);pts.push([x+Math.cos(an)*r,y+Math.sin(an)*r*.9-s*.35])}
  E.glow(g,x,y-s*.3,s*1.7,'#ff6a1c',.3*al);
  g.save();
  g.fillStyle=E.rgba('#2a1822',.95*al);g.strokeStyle=E.rgba('#6e4a5e',.9*al);g.lineWidth=1.2;g.lineJoin='round';
  g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.stroke();
  const pu=.7+.3*Math.sin(T*2.6+k);
  g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  for(let c=0;c<3;c++){
   const p=pts[(c*2+k)%m],mx=x+(p[0]-x)*.5+(hash(k+c)-.5)*s*.3,my=y-s*.35+(p[1]-y+s*.35)*.5;
   g.strokeStyle=E.rgba('#ff5a14',.85*al*pu);g.lineWidth=2.2;g.beginPath();g.moveTo(x,y-s*.35);g.lineTo(mx,my);g.lineTo(p[0],p[1]);g.stroke();
   g.strokeStyle=E.rgba('#ffc24a',.9*al*pu);g.lineWidth=1;g.stroke();
  }
  g.restore();
 }
 /* lốc xoắn tối viền vàng (đen nâu, gân vàng) */
 function dswirl(g,E,x,T,al,o){
  const n=o.n,H=o.H,R=o.R,turns=o.turns,spin=o.spin,wmax=o.wmax;
  for(let i=0;i<n;i++){
   const base=i/n*TAU+(o.ph||0),sp=T*spin*(.85+.12*(i%3)),yo=(i%3)*H*.3+Math.floor(i/3)*H*.08,hh=H*(.42+.08*(i%2)),pts=[],m=30;
   for(let j=0;j<m;j++){
    const t=j/(m-1),ang=base+sp+t*turns*TAU,rad=R*(.78+.36*Math.sin(Math.PI*t))+3*Math.sin(T*2.1+i*1.7+t*6);
    pts.push([x+Math.cos(ang)*rad,GY-8-yo-t*hh+Math.sin(ang)*rad*.36]);
   }
   const wob=.82+.18*Math.sin(T*1.6+i*2.3),wf=q=>Math.max(.6,wmax*wob*Math.pow(Math.sin(Math.PI*Math.pow(q,.85)),.9));
   E.ribbon(g,pts,q=>wf(q)*1.2,'#0a0603',al*.92,{add:false,core:'#0a0603'});
   E.ribbon(g,pts,wf,'#4a3206',al*.95,{add:false,core:'#7a540c'});
   E.ribbon(g,pts.slice(3),q=>wf(q)*.4,'#f0c02a',al*.8,{core:'#fff3a0'});
   const tip=pts[m-1];E.glow(g,tip[0],tip[1],6,'#ffd93c',.3*al);
  }
 }
 /* [FX 3C-4 vẽ lại gọn] Lôi Vực: bản cũ quá rối (12 cành sét + trụ sét liên tục + lốc đen + đá + mảnh bay) → làm lại theo khung gọn như bộ 9–16:
    mây bão tối mờ sau lưng có chớp, 4 cột thu lôi vàng ở hai bên/sau trận pháp, mỗi 1,4s một tia sét NGANG nối 2 cột + một tia giáng xuống tâm,
    lốc xoắn vàng sáng, 5 cầu điện bay quanh; lúc vào trận mây bão bừng + 4 tia sét bổ xuống. Màu vùng Lôi Vực #ffe53a. */
 const LOI={deep:'#8a5c06',main:'#ffd21e',light:'#fff07a',core:'#fffbe0'};
 /* mây bão tối mờ: vài cụm mây tím-xám bán trong suốt, bên trong chớp sáng vàng theo nhịp */
 function stormcloud(g,E,x,y,r,P,T,al,fl){
  if(al<=.02||r<4)return;
  for(let i=0;i<5;i++){
   const an=i*1.7+T*.12,px=x+Math.cos(an)*r*.55,py=y+Math.sin(an*1.3)*r*.22;
   E.blob(g,px,py,r*(.55+.15*hash(i+3)),r*(.3+.08*hash(i+5)),i%2?'#3a3050':'#2a2238',.42*al,T*.4,i*17,{wob:.3,speed:1,core:'#4a4068'});
  }
  E.glow(g,x,y,r*1.2,P.main,(.1+.34*fl)*al,P.light);
 }
 /* cột thu lôi: thân sắt tối hai mặt, hai đai vàng, quả cầu vàng trên đỉnh nhấp nháy tia nhỏ */
 function pylon(g,E,x,y,h,w,k,P,al,T){
  if(al<=.02||h<6)return;
  const ty=y-h,pu=.7+.3*Math.sin(T*3+k*1.7);
  g.save();g.lineJoin='round';
  g.fillStyle=E.rgba('#26200e',.97*al);g.fillRect(x-w,ty,w,h);
  g.fillStyle=E.rgba('#40361a',.97*al);g.fillRect(x,ty,w,h);
  g.fillStyle=E.rgba('#1a1508',.98*al);g.fillRect(x-w*1.4,y-3,w*2.8,3);
  g.strokeStyle=E.rgba('#0e0a04',.9*al);g.lineWidth=1;g.strokeRect(x-w,ty,w*2,h);
  g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(P.main,.9*al*pu);g.fillRect(x-w,ty+h*.3,w*2,1.8);g.fillRect(x-w,ty+h*.62,w*2,1.8);
  g.restore();
  E.glow(g,x,ty,6,P.light,.7*al*pu,P.core);
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(P.core,.95*al);g.beginPath();g.arc(x,ty,2.2,0,TAU);g.fill();g.restore();
  const f=Math.floor(T*8+k*3);
  for(let i=0;i<2;i++){
   if(hash(f*1.7+i+k)<.4)continue;
   const an=hash(f+i*9+k)*TAU,l=7+hash(f+i)*6;
   bolt(g,E,zig(x,ty,x+Math.cos(an)*l,ty+Math.sin(an)*l,f+i+k,3,2),1,P,al*.9);
  }
 }
 /* cầu điện: quả cầu sáng với vòng tia ngắn quanh */
 function orb(g,E,x,y,r,k,P,T,al){
  if(al<=.02||r<1)return;
  E.glow(g,x,y,r*2.6,P.main,.4*al,P.light);
  g.save();g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(P.light,.9*al);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
  g.fillStyle=E.rgba(P.core,.95*al);g.beginPath();g.arc(x,y,r*.5,0,TAU);g.fill();
  g.lineCap='round';g.strokeStyle=E.rgba(P.core,.85*al);g.lineWidth=.9;
  const f=Math.floor(T*10+k*2);
  for(let i=0;i<3;i++){
   const an=hash(f*1.3+i*4+k)*TAU,l=r*(1.5+hash(f+i)*1.2);
   g.beginPath();g.moveTo(x+Math.cos(an)*r,y+Math.sin(an)*r);g.lineTo(x+Math.cos(an+.3)*l,y+Math.sin(an+.3)*l);g.stroke();
  }
  g.restore();
 }
 /* ĐỘ KIẾP: sét đánh xuống từng đợt. Mỗi đợt (3s) có 1→2→3 tia (đợt thứ 3 kết bằng 1 tia KIẾP LÔI to giữa trận), có báo trước (vòng điện co lại),
    tia sét dày + nhánh rẽ + chớp, đánh xuống đất thì sóng xung kích + mảnh vỡ, để lại VẾT CHÁY: hố cháy đen, nứt nẻ rỉ lửa nguội dần, khói bốc lên.
    age = giây kể từ lúc sét đánh (âm = đang báo trước). Vết cháy sống 3.2s. */
 const KLIFE=3.2;
 function kStrikes(T,e){
  const out=[],PER=3,n0=Math.floor(T/PER);
  for(let w=n0-1;w<=n0;w++){
   if(w<0)continue;const ns=1+(w%3);
   for(let j=0;j<ns;j++){
    const seed=w*10+j+1,big=ns===3&&j===ns-1,ts=w*PER+.5+j*.32;
    const dx=big?(hash(seed)-.5)*12:(hash(seed*3.1)*2-1)*46,sx0=dx;
    out.push({seed,big,age:T-ts,dx:big?sx0:(Math.abs(sx0)<12?(sx0<0?-12:12):sx0),dy:(hash(seed*1.7+2)*2-1)*9});
   }
  }
  /* lúc vào trận: 2 tia mở màn */
  if(e!=null&&e<3.4){
   out.push({seed:901,big:true,age:e-.18,dx:-27,dy:3});
   out.push({seed:902,big:false,age:e-.38,dx:30,dy:-2});
  }
  return out;
 }
 /* vết cháy trên đất: hố cháy đen, vòng lửa nguội dần, nứt nẻ rỉ lửa, khói bốc lên */
 function scar(g,E,sx,sy,sz,seed,age,P,al){
  if(age<0||age>KLIFE)return;
  const sc=cl(1-age/KLIFE,0,1),heat=cl(1-age/1.7,0,1),gro=cl(age/.14,0,1);
  g.save();g.lineCap='round';g.lineJoin='round';
  g.fillStyle=E.rgba('#0c0705',.78*sc*al);g.beginPath();g.ellipse(sx,sy,13*sz*gro,5.2*sz*gro,0,0,TAU);g.fill();
  g.fillStyle=E.rgba('#1c120a',.6*sc*al);g.beginPath();g.ellipse(sx,sy,19*sz*gro,7.4*sz*gro,0,0,TAU);g.fill();
  for(let k=0;k<8;k++){
   const an=hash(seed*5.3+k)*TAU,len=(15+hash(seed+k*3)*24)*sz*gro,pts=[[sx+Math.cos(an)*6*sz,sy+Math.sin(an)*2.4*sz]];
   for(let s=1;s<=3;s++){const aa=an+(hash(seed*7+k*5+s)-.5)*.5,r=6*sz+(len-6*sz)*s/3;pts.push([sx+Math.cos(aa)*r,sy+Math.sin(aa)*r*SQ])}
   g.globalCompositeOperation='source-over';g.strokeStyle=E.rgba('#0e0806',.95*sc*al);g.lineWidth=2.6;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
   g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(heat>.55?P.light:'#ff6a1c',.95*heat*al);g.lineWidth=1.3;g.stroke();
  }
  g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba('#ff7a22',.8*heat*al);g.lineWidth=1.6;
  g.beginPath();g.ellipse(sx,sy,14*sz,5.6*sz,0,0,TAU);g.stroke();
  g.restore();
  E.glow(g,sx,sy-2,16*sz,'#ff8a2a',.45*heat*al,P.light);
  /* khói bốc lên từ hố cháy */
  for(let i=0;i<3;i++){
   const u=cl((age-.2-i*.25)/1.6,0,1);if(u<=0||u>=1)continue;
   E.blob(g,sx+(hash(seed+i*4)-.5)*10+Math.sin(age*2+i)*3,sy-6-u*34,5+u*7,3+u*4,'#2a2420',.26*Math.sin(Math.PI*u)*al,age*.5,seed+i*13,{wob:.3,speed:1,core:'#4a4038'});
  }
 }
 /* [FX 3C-4 sửa 3] đường cong MỀM cho tia sét độ kiếp: từ (x0,y0) tới (x1,y1), lệch ngang theo sóng sin mượt (chữ S) thay cho đường gãy khúc;
    hai đầu khớp đúng điểm; ph đổi theo thời gian → tia lắc lư uyển chuyển. */
 function kcurve(x0,y0,x1,y1,seed,n,amp,ph){
  const pts=[],dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L,
   c1=1.1+hash(seed*2.3)*.5,c2=2.3+hash(seed*4.1)*.8,p1=hash(seed*1.7)*TAU,p2=hash(seed*3.3)*TAU;
  for(let j=0;j<=n;j++){
   const t=j/n,env=Math.pow(Math.sin(Math.PI*t),.7),o=amp*env*(Math.sin(TAU*c1*t+p1+ph)+.38*Math.sin(TAU*c2*t+p2+ph*1.3));
   pts.push([x0+dx*t+nx*o,y0+dy*t+ny*o]);
  }
  return pts;
 }
 /* vẽ tia sét mềm: dải thon dần về phía đất (3 lớp: quầng vàng, thân sáng, lõi trắng), tô ĐẶC từ đầu tới cuối (E.ribbon mờ dần đầu đuôi nên không dùng), không có góc gãy */
 function sribbon(g,E,pts,wf,col,a,solid){
  const n=pts.length,L=[],R=[];
  for(let i=0;i<n;i++){
   const p0=pts[Math.max(0,i-1)],p1=pts[Math.min(n-1,i+1)];let dx=p1[0]-p0[0],dy=p1[1]-p0[1];const d=Math.hypot(dx,dy)||1;dx/=d;dy/=d;
   const w=wf(i/(n-1))/2;
   L.push([pts[i][0]-dy*w,pts[i][1]+dx*w]);R.push([pts[i][0]+dy*w,pts[i][1]-dx*w]);
  }
  g.save();g.globalCompositeOperation=solid?'source-over':'lighter';g.fillStyle=E.rgba(col,a);
  g.beginPath();g.moveTo(L[0][0],L[0][1]);
  for(let i=1;i<n-1;i++)g.quadraticCurveTo(L[i][0],L[i][1],(L[i][0]+L[i+1][0])/2,(L[i][1]+L[i+1][1])/2);
  g.lineTo(L[n-1][0],L[n-1][1]);g.lineTo(R[n-1][0],R[n-1][1]);
  for(let i=n-2;i>0;i--)g.quadraticCurveTo(R[i][0],R[i][1],(R[i][0]+R[i-1][0])/2,(R[i][1]+R[i-1][1])/2);
  g.lineTo(R[0][0],R[0][1]);g.closePath();g.fill();g.restore();
 }
 function sbolt(g,E,pts,w,P,al){
  if(al<=.02)return;
  const tp=q=>Math.max(1.3,w*(1.1-.8*q));
  sribbon(g,E,pts,q=>tp(q)*3.4,'#2a1608',.4*al,true);   /* viền tối mỏng cho tia nổi khỏi lốc vàng */
  sribbon(g,E,pts,q=>tp(q)*2.6,P.main,.4*al);
  sribbon(g,E,pts,q=>tp(q)*1.25,P.light,.95*al);
  sribbon(g,E,pts,q=>Math.max(1,tp(q)*.62),P.core,.98*al);
 }
 /* tia sét độ kiếp: báo trước (vòng điện co lại) → tia dày có nhánh + chớp → sóng xung kích + mảnh vỡ */
 function kbolt(g,E,x,T,sx,sy,seed,big,age,P,al){
  if(age<-.45||age>.6)return;
  if(age<0){
   const u=1+age/.45,r=(big?30:20)*(1-u*.6)*(1+.3*Math.sin(T*30));
   g.save();g.globalCompositeOperation='lighter';g.lineWidth=1.4;g.strokeStyle=E.rgba(P.light,.4*u*al);g.beginPath();g.ellipse(sx,sy,r,r*SQ,0,0,TAU);g.stroke();g.restore();
   E.glow(g,sx,sy,6+8*u,P.main,.35*u*al,P.light);
   return;
  }
  const FL=.42,fv=age<FL?Math.pow(1-age/FL,.9)*(.88+.12*Math.sin(age*70+seed)):0,top=GY-124,xs=x+(sx-x)*.55+(hash(seed+3)-.5)*14;
  if(fv>0){
   const ph=age*4.5,pts=kcurve(xs,top,sx,sy,seed,18,big?15:11,ph);
   sbolt(g,E,pts,big?6.4:4.4,P,al*fv);
   [5,9,13].forEach((ix,i)=>{
    const p=pts[ix],sg=hash(seed+i*2.3)>.5?1:-1,L=(big?36:26)*(1-i*.18);
    sbolt(g,E,kcurve(p[0],p[1],p[0]+sg*L*.8,p[1]+L*.75,seed*3+i,9,L*.28,ph*1.2+i),big?3.4:2.4,P,al*fv*.85);
   });
   E.glow(g,sx,sy,(big?34:22)*fv,P.light,.7*al*fv,P.core);
   E.glow(g,x,GY-72,(big?90:74),P.light,.22*al*fv,P.core);   /* chớp sáng TRÒN (bản cũ dùng fillRect 160x150 → hiện thành cái khung) */
  }
  const u=cl(age/.5,0,1);
  E.wave(g,sx,sy,6+u*(big?62:44),P.light,(1-u)*.9*al,2.2,{t:T,seed:seed,sq:SQ,wob:.05,core:P.core});
  g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<9;i++){
   const an=hash(seed+i*1.9)*TAU,d=u*(16+hash(seed*2+i)*(big?44:30)),py=sy-Math.abs(Math.sin(an))*d*.9+u*u*14;
   g.fillStyle=E.rgba(i%2?P.light:'#ff9a2a',(1-u)*al);g.fillRect(sx+Math.cos(an)*d-1,py-1,2.4,2.4);
  }
  g.restore();
 }
 REG.thunder=function(g,x,q,T,e,E){
  const P=LOI,{a,al}=level(q,T,4),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   const ks=kStrikes(T,e);let fl=0,ch=0;
   ks.forEach(k=>{if(k.age>=0&&k.age<.22)fl=Math.max(fl,1-k.age/.22);else if(k.age<0&&k.age>-.45)ch=Math.max(ch,.45*(1+k.age/.45))});
   halo(g,E,x,P,T,al,a,q);
   stormcloud(g,E,x,GY-100,44+(a>0&&e!=null?20*(1-cl(e,0,1)):0),P,T,al,Math.max(fl,ch));
   circle(g,E,x,P,T,al,{r:58,ph:4.3,runeDir:-1});
   /* vết cháy nứt nẻ trên đất (vẽ trên trận pháp, dưới thú) */
   ks.forEach(k=>scar(g,E,x+k.dx,GY+k.dy,k.big?1.5:1,k.seed,k.age,P,al));
   /* cột thu lôi: hai bên và phía sau trận pháp (không che cung trước) */
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<2;k++){
     const ang0=.4+k*.85+(hash(k+side*5+3)-.5)*.1,ang=side<0?Math.PI+ang0:-ang0,p=gp(x,ang,60+k*3),h=(52+k*14+hash(k+side*3)*8)*gk;
     pylon(g,E,p[0],p[1],h,4.2,k+side*10+160,P,al,T);
    }
   }
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.3,wmax:15,ph:.6});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-.95,wmax:10,ph:2.1});
   /* cầu điện bay quanh thú */
   for(let k=0;k<5;k++){
    const an=T*(.55+hash(k)*.3)*(k%2?1:-1)+k*1.3,rr=38+hash(k+2)*28,px=x+Math.cos(an)*rr,py=GY-30-hash(k+3)*84+Math.sin(an)*7;
    orb(g,E,px,py,(2.2+hash(k+6)*1.2)*Math.min(1,grow*1.5),k,P,T,al*(Math.sin(an)>.6?.75:1));
   }
   /* sét độ kiếp đánh xuống từng đợt (vẽ trên cùng) */
   ks.forEach(k=>kbolt(g,E,x,T,x+k.dx,GY+k.dy,k.seed,k.big,k.age,P,al));
   /* tàn điện vàng bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<12;k++){
    const p=(T*(.07+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.5+k*1.7)*5,py=GY-6-p*124;
    g.fillStyle=E.rgba(k%3?P.light:P.main,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,10,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 5 — COUNTER (phản đòn): màu vùng Nguyệt Cung (#a8b8ff), tự thiết kế, không có ảnh mẫu ================= */
 const COUNTER={deep:'#2c3680',main:'#7d92ee',light:'#c3d0ff',core:'#f5f8ff'};
 /* lưỡi gươm/gai cong dựng từ đất: nửa tối + nửa sáng + sống sáng */
 function blade(g,E,x,y,len,w,lean,P,al,pulse){
  if(al<=.02||len<2)return;const tx=x+lean,ty=y-len;
  g.save();g.lineJoin='round';
  g.fillStyle=E.rgba(P.deep,.96*al);g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*.8+lean*.3,y-len*.55,tx,ty);g.lineTo(x,y-len*.08);g.closePath();g.fill();
  g.fillStyle=E.rgba(P.main,.95*al);g.beginPath();g.moveTo(x+w,y);g.quadraticCurveTo(x+w*.8+lean*.3,y-len*.55,tx,ty);g.lineTo(x,y-len*.08);g.closePath();g.fill();
  g.strokeStyle=E.rgba(P.light,.9*al);g.lineWidth=1.4;g.beginPath();g.moveTo(x,y-len*.08);g.lineTo(tx,ty);g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(P.core,.75*al*pulse);g.lineWidth=1.2;g.beginPath();g.moveTo(x+w*.2,y-len*.2);g.lineTo(tx,ty);g.stroke();
  g.restore();E.glow(g,tx,ty,5,P.light,.4*al*pulse);
 }
 REG.counter=function(g,x,q,T,e,E){
  const P=COUNTER,{a,al}=level(q,T,5),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   circle(g,E,x,P,T,al,{r:58,ph:5.1,runeDir:-1});
   /* lưỡi phản đòn quanh trận pháp (phía sau + hai bên, không che cung trước) */
   const bl=[];
   for(let k=0;k<10;k++){
    const side=k%2?1:-1,t=hash(k*2.9+2),an=side>0?-.75+t*1.6:Math.PI-(-.75+t*1.6),rp=60+hash(k+4)*10,p=gp(x,an,rp);
    bl.push({x:p[0],y:p[1],len:(20+hash(k*3+1)*26)*(.6+.6*Math.abs(Math.cos(an))),w:3.4+hash(k+6)*2,lean:(p[0]-x)*.28,k});
   }
   bl.sort((u,v)=>u.y-v.y);
   const dB=b=>blade(g,E,b.x,b.y,b.len*gk*(1+.05*Math.sin(T*3+b.k)),b.w,b.lean,P,al,.6+.4*Math.sin(T*3.4+b.k*1.3));
   bl.filter(b=>b.y<GY).forEach(dB);
   swirl(g,E,x,P,T,al,{n:6,H:108,R:50,turns:.8,spin:-1.35,wmax:15,ph:.8});
   swirl(g,E,x,P,T,al*.7,{n:3,H:88,R:60,turns:.7,spin:1.0,wmax:10,ph:2.2});
   bl.filter(b=>b.y>=GY).forEach(dB);
   /* sóng dội ngược: vòng sáng co dần vào thú */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<3;k++){
    const p=(T*.5+k/3)%1,r=96-72*Math.pow(p,.85),fa=Math.sin(Math.PI*p)*.85*al;
    g.lineWidth=3;g.strokeStyle=E.rgba(P.main,.4*fa);g.beginPath();g.ellipse(x,GY,r,r*SQ,0,0,TAU);g.stroke();
    g.lineWidth=1.5;g.strokeStyle=E.rgba(P.light,fa);g.beginPath();g.ellipse(x,GY,r,r*SQ,0,0,TAU);g.stroke();
   }
   /* mũi tên V chạy dồn vào tâm trên mặt đất */
   for(let k=0;k<10;k++){
    const an=k/10*TAU+hash(k)*.3,p=(T*.45+hash(k*3.1))%1,r=90-52*p,fa=Math.sin(Math.PI*p)*al,
     tip=gp(x,an,r),w1=gp(x,an+.13,r+9),w2=gp(x,an-.13,r+9);
    g.strokeStyle=E.rgba(k%2?P.light:P.core,.9*fa);g.lineWidth=1.8;g.lineCap='round';g.lineJoin='round';
    g.beginPath();g.moveTo(w1[0],w1[1]);g.lineTo(tip[0],tip[1]);g.lineTo(w2[0],w2[1]);g.stroke();
   }
   g.restore();
   /* lúc vào trận: hai nhát chém chéo bật ngược */
   if(a>0){
    for(let s=0;s<2;s++)slash(g,E,x,GY-72,58,20,s?-.4:Math.PI+.4,1.9,6,P.light,P.core,a*.85);
   }
   /* trăng khuyết loảng quanh thú (nét riêng của Nguyệt Cung) */
   for(let k=0;k<4;k++){
    const p=(T*.06+k*.25)%1,side=k%2?1:-1;
    crescent(g,E,x+side*(50+k*7)+Math.sin(T*.8+k)*3,GY-26-p*92,8+k%2*3,side*.9+Math.sin(T*.6+k)*.4,P.light,Math.sin(Math.PI*p)*.8*al);
   }
   /* mảnh gương vỡ lấp lánh */
   for(let k=0;k<9;k++){
    const an=T*.4*(k%2?1:-1)+k*.95,rr=34+hash(k)*34,px=x+Math.cos(an)*rr,py=GY-24-hash(k+3)*96+Math.sin(an)*8,tw=.5+.5*Math.sin(T*3.2+k*2);
    gem(g,E,px,py,1.6+hash(k+6)*1.8,al*tw,k%2?P.light:P.core);
   }
   /* bụi sao bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<14;k++){
    const p=(T*(.07+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*70,py=GY-6-p*118;
    g.fillStyle=E.rgba(k%3?P.light:P.main,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,12,120);
  }finally{g.restore()}
 };

 /* ================= BỘ 6 — SUN (Dương Sơn): màu vùng #ffa94d, tự thiết kế: mặt trời + ngọn lửa + thiên thạch ================= */
 const SUN={deep:'#9a3a0c',main:'#ff9f45',light:'#ffd28c',core:'#fff5da'};
 /* ngọn lửa bập bùng: 4 lớp (tối → cam → vàng → lõi sáng), đỉnh lắc theo thời gian */
 function flame(g,E,x,y,h,w,T,k,P,al){
  if(al<=.02||h<2)return;
  const sw=(Math.sin(T*5+k*2.3)*.35+Math.sin(T*8.3+k)*.15)*w;
  g.save();
  [[1,1,P.deep,.85],[.84,.78,P.main,.92],[.62,.52,P.light,.95],[.36,.3,P.core,.95]].forEach((L,i)=>{
   const hh=h*L[0]*(1+.07*Math.sin(T*7+k+i*1.3)),ww=w*L[1],tx=x+sw*L[0],ty=y-hh;
   g.globalCompositeOperation=i>1?'lighter':'source-over';
   g.fillStyle=E.rgba(L[2],L[3]*al);
   g.beginPath();g.moveTo(x-ww,y);
   g.bezierCurveTo(x-ww*1.1,y-hh*.4,x-ww*.3+sw*.5*L[0],y-hh*.72,tx,ty);
   g.bezierCurveTo(x+ww*.3+sw*.5*L[0],y-hh*.72,x+ww*1.1,y-hh*.4,x+ww,y);
   g.closePath();g.fill();
  });
  g.restore();
  E.glow(g,x,y-h*.35,w*1.9,P.main,.2*al);
 }
 /* mặt trời mờ sau lưng thú: đĩa sáng + vòng + tia lửa uốn lượn */
 function sunDisc(g,E,x,y,r,P,T,al){
  g.save();g.translate(x,y);g.globalCompositeOperation='lighter';
  const N=16,rot=T*.22;
  for(let i=0;i<N;i++){
   const an=rot+i/N*TAU,ca=Math.cos(an),sa=Math.sin(an),L=r*(1.5+.22*Math.sin(T*2.1+i*1.7)+(i%2)*.4),hw=r*(.13+.04*(i%2)),
    bx=ca*r*.9,by=sa*r*.9,px=-sa,py=ca,wig=Math.sin(T*3+i*2.1)*r*.12,
    mx=ca*(r+L)*.5+px*wig,my=sa*(r+L)*.5+py*wig;
   g.fillStyle=E.rgba(i%2?P.main:P.light,.45*al);
   g.beginPath();g.moveTo(bx+px*hw,by+py*hw);
   g.quadraticCurveTo(mx+px*hw*.5,my+py*hw*.5,ca*L,sa*L);
   g.quadraticCurveTo(mx-px*hw*.5,my-py*hw*.5,bx-px*hw,by-py*hw);
   g.closePath();g.fill();
  }
  g.restore();
  E.glow(g,x,y,r*1.25,P.main,.42*al,P.core);
  g.save();g.globalCompositeOperation='lighter';
  g.lineWidth=1.6;g.strokeStyle=E.rgba(P.light,.8*al);g.beginPath();g.arc(x,y,r*.95,0,TAU);g.stroke();
  g.lineWidth=.9;g.strokeStyle=E.rgba(P.core,.7*al);g.beginPath();g.arc(x,y,r*.7,0,TAU);g.stroke();
  g.restore();
 }
 /* thiên thạch: đuôi lửa (ribbon qua các vị trí cũ) + đầu đá nứt rỉ lửa */
 function meteor(g,E,hx,hy,s,pts,P,al,k){
  if(al<=.02||s<.5)return;
  E.ribbon(g,pts,q=>.5+s*1.5*Math.pow(q,.9),P.main,.8*al,{core:P.light});
  E.glow(g,hx,hy,s*2.6,P.main,.5*al,P.core);
  const m=7,rp=[];
  for(let i=0;i<m;i++){const an=i/m*TAU+hash(k+i)*.4,r=s*(.75+hash(k*3+i)*.4);rp.push([hx+Math.cos(an)*r,hy+Math.sin(an)*r])}
  g.save();g.fillStyle=E.rgba('#3a1408',.95*al);g.strokeStyle=E.rgba(P.light,.9*al);g.lineWidth=1.1;g.lineJoin='round';
  g.beginPath();rp.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.stroke();
  g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba('#ff5a14',.85*al);g.lineWidth=1;
  g.beginPath();g.moveTo(hx-s*.4,hy-s*.3);g.lineTo(hx+s*.1,hy);g.lineTo(hx+s*.4,hy+s*.4);g.stroke();
  g.restore();
 }
 REG.sun=function(g,x,q,T,e,E){
  const P=SUN,{a,al}=level(q,T,6),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   sunDisc(g,E,x,GY-72,36*(.94+.06*Math.sin(T*2.4)),P,T,al*.6);
   circle(g,E,x,P,T,al,{r:58,ph:6.2,runeDir:1,cracks:false});
   /* nứt đất: đen cháy, rỉ lửa cam */
   g.save();g.lineCap='round';g.lineJoin='round';
   for(let k=0;k<12;k++){
    const an=hash(k*5.7+6)*TAU,r0=58*(.95+hash(k)*.08),len=14+hash(k+9)*20,pts=[gp(x,an,r0)];
    for(let s=1;s<=3;s++)pts.push(gp(x,an+(hash(k*7+s)-.5)*.36,r0+len*s/3));
    g.strokeStyle=E.rgba('#1c0b05',.85*al);g.lineWidth=1.8;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(k%3?P.main:'#ff5a14',.55*al*(.75+.25*Math.sin(T*3+k)));g.lineWidth=.9;g.stroke();g.globalCompositeOperation='source-over';
   }
   g.restore();
   /* vệt cháy sém trên đất hai bên */
   for(let k=0;k<6;k++){
    const side=k%2?1:-1,px=x+side*(50+hash(k+3)*28),py=GY+hash(k+9)*8;
    E.blob(g,px,py,18+hash(k+5)*10,5+hash(k+1)*3,'#1c0b05',.3*al,T*.3,k*7,{wob:.2,speed:.6,core:'#1c0b05',add:false});
   }
   /* ngọn lửa mọc quanh rìa trận pháp (phía sau + hai bên; phía trước thấp để không che rune) */
   const fl=[];
   for(let k=0;k<13;k++){
    const side=k%2?1:-1,t=hash(k*2.9+3),an=side>0?-.7+t*1.55:Math.PI-(-.7+t*1.55),rp=57+hash(k+4)*9,p=gp(x,an,rp);
    fl.push({x:p[0],y:p[1],h:(16+hash(k*3+1)*26)*(.55+.6*Math.abs(Math.cos(an)))*(p[1]>=GY?.6:1),w:3.6+hash(k+6)*2.6,k});
   }
   fl.sort((u,v)=>u.y-v.y);
   const dF=f=>flame(g,E,f.x,f.y,f.h*gk,f.w,T,f.k,P,al);
   fl.filter(f=>f.y<GY).forEach(dF);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.35,wmax:16,ph:.4});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-1.0,wmax:10,ph:2.0});
   fl.filter(f=>f.y>=GY).forEach(dF);
   /* thiên thạch nhỏ bay vòng quanh thú, kéo đuôi lửa */
   for(let k=0;k<4;k++){
    const sp=(k%2?1:-1)*.8,ph0=k*1.7,rr=54+hash(k+2)*16,h0=40+hash(k*3+1)*64,s=3.4+hash(k+7)*1.8;
    const at=tt=>{const an=tt*sp+ph0;return[x+Math.cos(an)*rr,GY-h0+Math.sin(an)*rr*.3-Math.abs(Math.sin(tt*1.3+k))*4]};
    const pts=[];for(let j=0;j<=10;j++)pts.push(at(T-(1-j/10)*.75));
    const hd=pts[10];meteor(g,E,hd[0],hd[1],s*gk,pts,P,al,k);
   }
   /* lúc vào trận: mưa thiên thạch giáng chéo xuống quanh thú, nổ nhỏ ở đất */
   if(a>0&&e!=null&&e<1){
    for(let k=0;k<5;k++){
     const t0=k*.1;if(e<t0)continue;
     const p=cl((e-t0)/.32,0,1),lx=x+(hash(k*3.3)*2-1)*62,ly=GY-4+(hash(k+5)-.5)*8,sx=lx+70,sy=GY-160;
     if(p<1){
      const hx=sx+(lx-sx)*p,hy=sy+(ly-sy)*p,pts=[];
      for(let j=0;j<=8;j++){const u=j/8;pts.push([hx+(sx-lx)*.3*(1-u),hy+(sy-ly)*.3*(1-u)])}
      meteor(g,E,hx,hy,4.4,pts,P,a*.95,k+20);
     }else{
      const f=cl((e-t0-.32)/.5,0,1);
      E.wave(g,lx,ly,6+f*26,P.light,(1-f)*a,2,{t:T,seed:k,sq:SQ,wob:.05,core:P.core});
      E.glow(g,lx,ly,14*(1-f*.5),P.main,.5*(1-f)*a,P.core);
     }
    }
   }
   /* tàn lửa bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<18;k++){
    const p=(T*(.08+hash(k)*.07)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*2+k*1.7)*5,py=GY-6-p*128;
    g.fillStyle=E.rgba(k%3?P.light:'#ff7a28',Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,10,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 7 — VÙNG HUYỀN UYÊN (key kỹ thuật 'shield'): màu vùng #947aff, tự thiết kế, KHÔNG vẽ khiên =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (vực sâu huyền bí, biểu tượng ◉ = con mắt vực):
    mắt vực mờ sau lưng, vực xoáy dưới trận pháp, xúc tu vực mọc lên, sương tím tối, mắt nhỏ bay quanh, bong bóng vực. */
 const ABYSS={deep:'#3b2a96',main:'#947aff',light:'#cbbdff',core:'#f4f0ff'};
 /* mắt vực ◉: vòng ngoài + vòng trong + đồng tử sáng có chấm tối, đồng tử nhìn quanh */
 function eye(g,E,x,y,r,P,T,al,k){
  if(al<=.02||r<2)return;
  E.glow(g,x,y,r*2.2,P.main,.3*al,P.light);
  const px=x+Math.sin(T*.8+k)*r*.14,py=y+Math.cos(T*.6+k)*r*.1;
  g.save();g.globalCompositeOperation='lighter';
  g.lineWidth=Math.max(1.8,r*.1);g.strokeStyle=E.rgba(P.light,.9*al);g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();
  g.lineWidth=Math.max(1.5,r*.08);g.strokeStyle=E.rgba(P.main,.8*al);g.beginPath();g.arc(x,y,r*.66,0,TAU);g.stroke();
  g.fillStyle=E.rgba(P.core,.9*al);g.beginPath();g.arc(px,py,r*.34,0,TAU);g.fill();
  g.restore();
  g.save();g.fillStyle=E.rgba(P.deep,.95*al);g.beginPath();g.arc(px,py,r*.15,0,TAU);g.fill();g.restore();
 }
 /* vực xoáy trên mặt đất: các nhánh xoắn ốc tối viền sáng quay trong trận pháp */
 function vortex(g,E,x,P,T,al,R,ph){
  for(let k=0;k<4;k++){
   const base=k/4*TAU+ph+T*.9,pts=[];
   for(let j=0;j<24;j++){const t=j/23,an=base+t*2.3,rr=R*(.12+.88*t);pts.push([x+Math.cos(an)*rr,GY+Math.sin(an)*rr*SQ])}
   E.ribbon(g,pts,q=>Math.max(.8,9*Math.sin(Math.PI*Math.pow(q,.9))),P.deep,al*.95,{add:false,core:P.deep});
   E.ribbon(g,pts.slice(2),q=>Math.max(.8,3.4*Math.sin(Math.PI*q)),P.light,al*.95,{core:P.core});
  }
 }
 /* xúc tu vực: thân tối + gân sáng, đung đưa, đầu phát sáng */
 function tendril(g,E,x0,y0,h,lean,T,k,P,al){
  if(al<=.02||h<3)return;const pts=[],m=16;
  for(let j=0;j<m;j++){const t=j/(m-1),sw=Math.sin(T*1.7+k*1.9-t*3.2)*(4+9*t);pts.push([x0+lean*t*t+sw,y0-h*t])}
  E.ribbon(g,pts,q=>Math.max(1,9.5*(1-q)+2),P.deep,al*.97,{add:false,core:P.deep});
  E.ribbon(g,pts.slice(1),q=>Math.max(.8,4.6*(1-q)+1.2),P.main,al*.95,{core:P.light});
  const tp=pts[m-1];E.glow(g,tp[0],tp[1],5,P.light,.5*al*(.7+.3*Math.sin(T*3+k)),P.core);
 }
 REG.shield=function(g,x,q,T,e,E){
  const P=ABYSS,{a,al}=level(q,T,7),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* mắt vực lớn mờ sau lưng thú (như mặt trời mờ của Dương Sơn) */
   eye(g,E,x,GY-84,36*(.95+.05*Math.sin(T*2)),P,T,al*.85,1);
   circle(g,E,x,P,T,al,{r:58,ph:7.3,runeDir:-1});
   vortex(g,E,x,P,T,al,38,.7);
   /* sương vực tím tối sát đất (bán trong suốt) */
   for(let k=0;k<9;k++){
    const side=hash(k*1.9+3)*2-1,px=x+side*(60+8*Math.abs(side))+Math.sin(T*.35+k*1.7)*6,py=GY-2-hash(k+5)*20*grow,rx=22+hash(k+9)*16,ry=8+hash(k+13)*8;
    E.blob(g,px,py,rx,ry,k%3?P.deep:P.main,.3*al,T*.45,k*19,{wob:.35,speed:1,core:P.main,add:false});
   }
   /* xúc tu mọc quanh rìa trận pháp (phía sau + hai bên, không che cung trước) */
   const td=[];
   for(let k=0;k<10;k++){
    const side=k%2?1:-1,t=hash(k*2.9+2),an=side>0?-.75+t*1.6:Math.PI-(-.75+t*1.6),rp=60+hash(k+4)*10,p=gp(x,an,rp);
    td.push({x:p[0],y:p[1],h:(28+hash(k*3+1)*36)*(.6+.6*Math.abs(Math.cos(an))),lean:(p[0]-x)*.35,k});
   }
   td.sort((u,v)=>u.y-v.y);
   const dT=t=>tendril(g,E,t.x,t.y,t.h*gk,t.lean,T,t.k,P,al);
   td.filter(t=>t.y<GY).forEach(dT);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:-1.2,wmax:15,ph:.7});
   swirl(g,E,x,P,T,al*.7,{n:3,H:94,R:60,turns:.7,spin:.9,wmax:10,ph:2.3});
   td.filter(t=>t.y>=GY).forEach(dT);
   /* 3 mắt vực nhỏ bay quanh thú */
   for(let k=0;k<3;k++){
    const an=T*.6+k*TAU/3,rr=64,ey=GY-62-k*12+Math.sin(an)*rr*.3;
    eye(g,E,x+Math.cos(an)*rr,ey,4.8,P,T,al*Math.min(1,grow*1.6)*(Math.sin(an)>.5?.7:1),k+3);
   }
   /* bong bóng vực nổi lên: vòng tròn rỗng + chấm sáng */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<16;k++){
    const p=(T*(.06+hash(k*2.3)*.05)+hash(k*3.9))%1,px=x+(hash(k*1.3)*2-1)*70+Math.sin(T*1.2+k*2.1)*5,py=GY-8-p*126,r=1.8+hash(k+4)*2.4,fa=Math.pow(Math.sin(Math.PI*p),.6)*al;
    g.strokeStyle=E.rgba(k%3?P.light:P.core,.9*fa);g.lineWidth=1.3;g.beginPath();g.arc(px,py,r,0,TAU);g.stroke();
    g.fillStyle=E.rgba(P.core,.85*fa);g.fillRect(px-r*.45-.5,py-r*.45-.5,1.3,1.3);
   }
   g.restore();
   /* lúc vào trận: mắt vực mở to một nhịp + sóng vòng lan ra */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    eye(g,E,x,GY-84,34+30*k,P,T,a*(1-k)*.9,2);
    g.save();g.globalCompositeOperation='lighter';
    g.lineWidth=3;g.strokeStyle=E.rgba(P.main,.5*a*(1-k));g.beginPath();g.ellipse(x,GY,20+78*k,(20+78*k)*SQ,0,0,TAU);g.stroke();
    g.lineWidth=1.5;g.strokeStyle=E.rgba(P.core,.95*a*(1-k));g.stroke();g.restore();
   }
   sparks(g,E,x,P,T,al,12,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 8 — VÙNG KIM KHOÁNG (key kỹ thuật 'thorn'): màu vùng #e0b038, tự thiết kế, KHÔNG vẽ gai =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (mỏ vàng, khoáng thạch, mạch kim loại):
    chùm tia tinh thể vàng mờ sau lưng, cụm tinh thể vàng mọc quanh trận pháp, khối quặng có mạch vàng, nứt đất rỉ vàng,
    mảnh kim loại bay quanh, bụi quặng lấp lánh, lúc vào trận quặng rơi xuống từ trên cao. */
 const ORE={deep:'#5e3f08',main:'#e0b038',light:'#ffdf80',core:'#fff7d6'};
 const GOLD={dark:'#7a5208',mid:'#e0b038',light:'#ffe58a',edge:'#fff8dc'};
 /* khối quặng: đá nâu tối viền đồng, có mạch vàng chạy ngang sáng nhấp nháy */
 function ore(g,E,x,y,s,k,al,T){
  if(al<=.02||s<1)return;
  const m=7,pts=[];
  for(let i=0;i<m;i++){const an=i/m*TAU+hash(k+i)*.45,r=s*(.7+hash(k*3+i)*.5);pts.push([x+Math.cos(an)*r,y+Math.sin(an)*r*.85-s*.4])}
  E.glow(g,x,y-s*.4,s*1.6,'#e0b038',.22*al);
  g.save();g.lineJoin='round';g.lineCap='round';
  g.fillStyle=E.rgba('#2b2216',.96*al);g.strokeStyle=E.rgba('#9a7428',.95*al);g.lineWidth=1.2;
  g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();g.stroke();
  const pu=.7+.3*Math.sin(T*2.2+k*1.7);
  g.globalCompositeOperation='lighter';
  for(let c=0;c<2;c++){
   const a0=pts[(c*3+k)%m],b0=pts[(c*3+k+3)%m],mx=(a0[0]+b0[0])/2+(hash(k+c*4)-.5)*s*.5,my=(a0[1]+b0[1])/2+(hash(k*2+c)-.5)*s*.4;
   g.strokeStyle=E.rgba('#e0b038',.85*al*pu);g.lineWidth=2.4;g.beginPath();g.moveTo(a0[0],a0[1]);g.lineTo(mx,my);g.lineTo(b0[0],b0[1]);g.stroke();
   g.strokeStyle=E.rgba('#fff0b0',.9*al*pu);g.lineWidth=1;g.stroke();
  }
  g.restore();
 }
 /* chùm tia tinh thể vàng toả ra sau lưng thú (nét riêng của mỏ khoáng, thay cho mặt trời/mắt vực) */
 function lode(g,E,x,y,r,P,T,al){
  if(al<=.02)return;
  E.glow(g,x,y,r*1.4,P.main,.32*al,P.core);
  g.save();g.translate(x,y);g.globalCompositeOperation='lighter';g.lineJoin='round';
  const N=11,rot=Math.sin(T*.35)*.1;
  for(let i=0;i<N;i++){
   const an=rot+i/N*TAU,L=r*(1.25+.55*hash(i*2.3+1)+.06*Math.sin(T*1.8+i*1.9)),hw=r*.13,r0=r*.3,
    ca=Math.cos(an),sa=Math.sin(an),mx=ca*(r0+L*.35),my=sa*(r0+L*.35),px=-sa*hw,py=ca*hw;
   g.fillStyle=E.rgba(i%2?P.main:P.light,.42*al);
   g.beginPath();g.moveTo(ca*r0,sa*r0);g.lineTo(mx+px,my+py);g.lineTo(ca*L,sa*L);g.lineTo(mx-px,my-py);g.closePath();g.fill();
   g.strokeStyle=E.rgba(P.core,.5*al);g.lineWidth=1;g.stroke();
  }
  g.restore();
 }
 /* mảnh kim loại góc cạnh bay quanh, có vệt sáng */
 function shard(g,E,x,y,s,rot,col,a){
  if(a<=.02)return;
  g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(col,.8*a);g.beginPath();g.moveTo(0,-s*1.7);g.lineTo(s*.8,-s*.2);g.lineTo(s*.5,s*1.2);g.lineTo(-s*.6,s*1.1);g.lineTo(-s*.9,-s*.3);g.closePath();g.fill();
  g.strokeStyle=E.rgba('#ffffff',.7*a);g.lineWidth=.8;g.stroke();g.restore();
 }
 REG.thorn=function(g,x,q,T,e,E){
  const P=ORE,{a,al}=level(q,T,8),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   lode(g,E,x,GY-80,32*(.95+.05*Math.sin(T*2.1)),P,T,al*.75);
   circle(g,E,x,P,T,al,{r:58,ph:8.4,runeDir:1,cracks:false});
   /* nứt đất đen, rỉ vàng như mạch quặng */
   g.save();g.lineCap='round';g.lineJoin='round';
   for(let k=0;k<12;k++){
    const an=hash(k*5.7+8)*TAU,r0=58*(.95+hash(k)*.08),len=14+hash(k+9)*20,pts=[gp(x,an,r0)];
    for(let s=1;s<=3;s++)pts.push(gp(x,an+(hash(k*7+s)-.5)*.36,r0+len*s/3));
    g.strokeStyle=E.rgba('#150f06',.85*al);g.lineWidth=1.8;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(k%3?P.main:P.light,.6*al*(.75+.25*Math.sin(T*2.6+k)));g.lineWidth=1;g.stroke();g.globalCompositeOperation='source-over';
   }
   g.restore();
   /* cụm tinh thể vàng + khối quặng: hai bên và phía sau trận pháp (không che cung trước) */
   const items=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<5;k++){
     const t=k/4,ang0=-.3+t*1.75,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+3)-.5)*.2,rp=58*(.97+hash(k*2+side+4)*.12),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang)),hh=(16+hash(k*3+side*5+2)*28)*(.5+.75*sd);
     items.push({t:'c',x:p[0],y:p[1],h:hh,w:hh*.34+4,lean:-side*(hh*.16+hash(k+5)*5)+(p[0]-x)*.1,k:k+side*20});
    }
    for(let k=0;k<3;k++){
     const an=side>0?-.5+hash(k*3.1+side)*1.4:Math.PI-(-.5+hash(k*3.1+side)*1.4),rp=70+hash(k+side*3)*14,p=gp(x,an,rp);
     items.push({t:'o',x:p[0],y:p[1],s:5+hash(k*2+side*9)*5,k:k*3+side*7+40});
    }
   }
   items.sort((u,v)=>u.y-v.y);
   const dI=it=>{
    if(it.t==='c'){const br=1+.035*Math.sin(T*2+it.k),sh=.5+.5*Math.sin(T*2.4+it.k*1.7);
     E.crystal(g,it.x,it.y,it.w,it.h*gk*br,it.lean,GOLD,Math.min(1,al*1.25),{shine:sh,crack:.4+.3*Math.sin(T*1.3+it.k)})}
    else ore(g,E,it.x,it.y,it.s*gk,it.k,al,T);
   };
   items.filter(it=>it.y<GY).forEach(dI);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.25,wmax:15,ph:.5});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-.95,wmax:10,ph:2.1});
   items.filter(it=>it.y>=GY).forEach(dI);
   /* mảnh kim loại bay quanh thú */
   for(let k=0;k<8;k++){
    const an=T*.5*(k%2?1:-1)+k*.8,rr=36+hash(k)*30,px=x+Math.cos(an)*rr,py=GY-22-hash(k+3)*92+Math.sin(an)*8,s=2.4+hash(k+6)*2.2,tw=.6+.4*Math.sin(T*3+k*1.9);
    shard(g,E,px,py,s*Math.min(1,grow*1.5),an*2+k,k%2?P.light:P.main,al*tw*(Math.sin(an)>.6?.75:1));
   }
   /* lúc vào trận: quặng vàng rơi từ trên cao xuống quanh thú, va đất toả sóng */
   if(a>0&&e!=null&&e<1){
    for(let k=0;k<5;k++){
     const t0=k*.1;if(e<t0)continue;
     const p=cl((e-t0)/.3,0,1),lx=x+(hash(k*3.3+5)*2-1)*62,ly=GY-4+(hash(k+6)-.5)*8,sy=GY-165;
     if(p<1){
      const hy=sy+(ly-sy)*p*p;
      E.glow(g,lx,hy,9,P.light,.45*a);shard(g,E,lx,hy,4.2,p*6+k,P.light,a);shard(g,E,lx,hy-14*p,2.2,k,P.main,a*.7);
     }else{
      const f=cl((e-t0-.3)/.5,0,1);
      E.wave(g,lx,ly,6+f*26,P.light,(1-f)*a,2,{t:T,seed:k+3,sq:SQ,wob:.05,core:P.core});
      E.glow(g,lx,ly,14*(1-f*.5),P.main,.5*(1-f)*a,P.core);
     }
    }
   }
   /* bụi quặng vàng bốc lên + lấp lánh */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<18;k++){
    const p=(T*(.07+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*70+Math.sin(T*1.6+k*1.7)*4,py=GY-6-p*124;
    g.fillStyle=E.rgba(k%3?P.light:P.main,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,14,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 9 — VÙNG NGỌC ĐỘNG (key kỹ thuật 'revive'): màu vùng #18e0b0, tự thiết kế, KHÔNG vẽ cánh/thập tự =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (hang động ngọc bích, mạch nước, sinh khí):
    vòng ngọc bích mờ sau lưng, măng đá ngọc mọc quanh trận pháp, giọt ngọc rơi tạo gợn sóng, vòng sáng sinh khí dâng lên,
    ngọc châu bay quanh, đom đóm ngọc bốc lên, lúc vào trận vòng ngọc bừng sáng + ngọc châu toả ra. */
 const JADE={deep:'#0b6b57',main:'#18e0b0',light:'#8ff5da',core:'#e8fff8'};
 /* vòng ngọc bích: vành dày, viền sáng trong/ngoài, chấm khắc quay chậm, vệt bóng */
 function bi(g,E,x,y,r,P,T,al){
  if(al<=.02||r<2)return;
  E.glow(g,x,y,r*1.5,P.main,.3*al,P.light);
  g.save();
  g.lineWidth=r*.36;g.strokeStyle=E.rgba(P.deep,.6*al);g.beginPath();g.arc(x,y,r*.72,0,TAU);g.stroke();
  g.globalCompositeOperation='lighter';
  g.lineWidth=r*.3;g.strokeStyle=E.rgba(P.main,.35*al);g.beginPath();g.arc(x,y,r*.72,0,TAU);g.stroke();
  g.lineWidth=1.7;g.strokeStyle=E.rgba(P.light,.85*al);
  g.beginPath();g.arc(x,y,r*.9,0,TAU);g.stroke();g.beginPath();g.arc(x,y,r*.54,0,TAU);g.stroke();
  g.fillStyle=E.rgba(P.core,.85*al);
  for(let k=0;k<12;k++){const an=k/12*TAU+T*.18,X=x+Math.cos(an)*r*.72,Y=y+Math.sin(an)*r*.72;g.fillRect(X-1,Y-1,2,2)}
  g.lineWidth=2.2;g.strokeStyle=E.rgba(P.core,.7*al);g.beginPath();g.arc(x,y,r*.72,-2.5+Math.sin(T*.5)*.15,-1.7+Math.sin(T*.5)*.15);g.stroke();
  g.restore();
 }
 /* măng đá ngọc: nửa tối + nửa sáng + sống sáng, đầu phát sáng, giọt ngọc nhỏ rơi dọc thân */
 function stalag(g,E,x,y,h,w,lean,P,al,T,k){
  if(al<=.02||h<2)return;
  const tx=x+lean,ty=y-h;
  g.save();g.lineJoin='round';
  g.fillStyle=E.rgba(P.deep,.96*al);g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*.5+lean*.2,y-h*.55,tx,ty);g.lineTo(x,y);g.closePath();g.fill();
  g.fillStyle=E.rgba(P.main,.92*al);g.beginPath();g.moveTo(x+w,y);g.quadraticCurveTo(x+w*.5+lean*.2,y-h*.55,tx,ty);g.lineTo(x,y);g.closePath();g.fill();
  g.strokeStyle=E.rgba(P.light,.9*al);g.lineWidth=1.3;g.beginPath();g.moveTo(x,y-h*.05);g.lineTo(tx,ty);g.stroke();
  g.globalCompositeOperation='lighter';
  const dp=(T*.6+hash(k)*3)%1;
  g.fillStyle=E.rgba(P.core,.85*al*Math.sin(Math.PI*dp));g.fillRect(tx+(x-tx)*dp*.2-1,ty+h*dp*.8-1,2,2.4);
  g.restore();E.glow(g,tx,ty,5,P.light,.4*al*(.7+.3*Math.sin(T*2.4+k)));
 }
 /* ngọc châu: viên ngọc tròn bóng, có điểm sáng */
 function pearl(g,E,x,y,r,P,al){
  if(al<=.02||r<1)return;
  E.glow(g,x,y,r*2.4,P.main,.35*al,P.light);
  g.save();g.globalAlpha=Math.min(1,al);
  const gr=g.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);
  gr.addColorStop(0,P.core);gr.addColorStop(.45,P.main);gr.addColorStop(1,P.deep);
  g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
  g.strokeStyle='rgba(8,70,58,.8)';g.lineWidth=Math.max(.7,r*.16);g.stroke();
  g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x-r*.34,y-r*.38,Math.max(.7,r*.24),0,TAU);g.fill();
  g.restore();
 }
 REG.revive=function(g,x,q,T,e,E){
  const P=JADE,{a,al}=level(q,T,9),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   bi(g,E,x,GY-84,34*(.96+.04*Math.sin(T*1.9)),P,T,al*.85);
   circle(g,E,x,P,T,al,{r:58,ph:9.5,runeDir:-1});
   /* sương hang động ngọc, bán trong suốt sát đất */
   for(let k=0;k<7;k++){
    const side=hash(k*1.9+5)*2-1,px=x+side*(58+10*Math.abs(side))+Math.sin(T*.4+k*1.7)*6,py=GY-2-hash(k+5)*20*grow,rx=22+hash(k+9)*16,ry=8+hash(k+13)*8;
    E.blob(g,px,py,rx,ry,k%2?P.light:P.main,.2*al,T*.5,k*23,{wob:.35,speed:1,core:P.light});
   }
   /* măng đá ngọc: hai bên và phía sau trận pháp (không che cung trước) */
   const st=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<4;k++){
     const t=k/3,ang0=-.3+t*1.75,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+11)-.5)*.2,rp=58*(.97+hash(k*2+side+6)*.12),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang)),h=(18+hash(k*3+side*5+4)*30)*(.5+.75*sd);
     st.push({x:p[0],y:p[1],h,w:h*.2+3.5,lean:-side*(h*.12+hash(k+9)*4),k:k+side*20});
    }
   }
   st.sort((u,v)=>u.y-v.y);
   const dS=s=>stalag(g,E,s.x,s.y,s.h*gk,s.w,s.lean,P,al,T,s.k);
   st.filter(s=>s.y<GY).forEach(dS);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.2,wmax:15,ph:.9});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-.9,wmax:10,ph:2.6});
   st.filter(s=>s.y>=GY).forEach(dS);
   /* giọt ngọc rơi xuống trận pháp, chạm đất toả gợn sóng */
   for(let k=0;k<3;k++){
    const p=(T*.55+k*.31)%1,lx=x+(hash(k*4.1+2)*2-1)*30,ly=GY+(hash(k+8)-.5)*6;
    if(p<.78){
     const u=p/.78,dy=GY-150+(ly-GY+150)*u*u;
     g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(P.light,.9*al);
     g.beginPath();g.moveTo(lx,dy-4);g.quadraticCurveTo(lx+2.2,dy,lx,dy+2);g.quadraticCurveTo(lx-2.2,dy,lx,dy-4);g.fill();g.restore();
    }else{
     const f=(p-.78)/.22;
     E.wave(g,lx,ly,3+f*20,P.light,(1-f)*.9*al,1.6,{t:T,seed:k+5,sq:SQ,wob:.04,core:P.core});
    }
   }
   /* vòng sáng sinh khí dâng lên từ trận pháp */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<3;k++){
    const p=(T*.32+k/3)%1,yy=GY-4-p*118,r=46-14*p,fa=Math.sin(Math.PI*p)*.7*al;
    g.lineWidth=3;g.strokeStyle=E.rgba(P.main,.4*fa);g.beginPath();g.ellipse(x,yy,r,r*SQ,0,0,TAU);g.stroke();
    g.lineWidth=1.4;g.strokeStyle=E.rgba(P.light,fa);g.beginPath();g.ellipse(x,yy,r,r*SQ,0,0,TAU);g.stroke();
   }
   g.restore();
   /* ngọc châu bay quanh thú */
   for(let k=0;k<5;k++){
    const an=T*.55*(k%2?1:-1)+k*1.25,rr=40+hash(k)*28,px=x+Math.cos(an)*rr,py=GY-24-hash(k+3)*88+Math.sin(an)*8,r=3+hash(k+6)*2.2;
    pearl(g,E,px,py,r*Math.min(1,grow*1.5),P,al*(Math.sin(an)>.6?.75:1));
   }
   /* lúc vào trận: vòng ngọc bừng sáng + ngọc châu toả ra */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    bi(g,E,x,GY-84,34+30*k,P,T,a*(1-k)*.9);
    for(let j=0;j<6;j++){
     const an=-Math.PI/2+(j-2.5)*.42,d=8+k*74;
     pearl(g,E,x+Math.cos(an)*d,GY-34+Math.sin(an)*d,3.4,P,a*(1-k));
    }
   }
   /* đom đóm ngọc bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<18;k++){
    const p=(T*(.06+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.5+k*1.7)*5,py=GY-6-p*126;
    g.fillStyle=E.rgba(k%3?P.light:P.core,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,14,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 10 — VÙNG THANH LÂM (key kỹ thuật 'grove'): màu vùng #8be04a, tự thiết kế, KHÔNG vẽ một cái cây/khiên đơn lẻ =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (khu rừng cổ thụ, sinh khí xanh lục):
    tán lá toả tia mờ sau lưng, rễ cây cổ thụ có gân rêu mọc quanh trận pháp, nấm phát sáng, lá lớn xoáy quanh thú,
    sương rừng mờ, đom đóm lập loè; lúc vào trận rễ trồi lên + tán lá bừng sáng + lá bắn toả ra. */
 const GROVE={deep:'#2a6a14',main:'#8be04a',light:'#c8f58c',core:'#f5ffe0'};
 const BARK='#4a3516';
 /* tán lá mờ sau lưng: vòng lá thon toả ra từ tâm sáng, mỗi lá có gân sáng */
 function canopy(g,E,x,y,r,P,T,al){
  if(al<=.02||r<2)return;
  E.glow(g,x,y,r*1.5,P.main,.3*al,P.light);
  g.save();g.translate(x,y);g.globalCompositeOperation='lighter';g.lineJoin='round';g.lineCap='round';
  const N=14,rot=Math.sin(T*.3)*.12;
  for(let i=0;i<N;i++){
   const an=rot+i/N*TAU,ca=Math.cos(an),sa=Math.sin(an),L=r*(1.35+.3*hash(i*2.7+1)+.05*Math.sin(T*1.7+i*1.9)),r0=r*.35,hw=r*.2,
    mx=ca*(r0+L)*.5,my=sa*(r0+L)*.5,px=-sa*hw,py=ca*hw;
   g.fillStyle=E.rgba(i%2?P.main:P.light,.4*al);
   g.beginPath();g.moveTo(ca*r0,sa*r0);g.quadraticCurveTo(mx+px*1.4,my+py*1.4,ca*L,sa*L);g.quadraticCurveTo(mx-px*1.4,my-py*1.4,ca*r0,sa*r0);g.closePath();g.fill();
   g.strokeStyle=E.rgba(P.core,.5*al);g.lineWidth=1.1;g.beginPath();g.moveTo(ca*r0,sa*r0);g.lineTo(ca*L*.9,sa*L*.9);g.stroke();
  }
  g.restore();
 }
 /* rễ cây cổ thụ: thân vỏ nâu tối + dải rêu xanh + gân sáng, đung đưa nhẹ, nhú lá non ở giữa và đầu rễ */
 function rootv(g,E,x0,y0,h,lean,T,k,P,al){
  if(al<=.02||h<3)return;const pts=[],m=14;
  for(let j=0;j<m;j++){const t=j/(m-1),sw=Math.sin(T*.9+k*1.9-t*3)*(2+4*t)+Math.sin(t*7+k)*2.5*(1-t*.4);pts.push([x0+lean*t*t+sw,y0-h*t])}
  E.ribbon(g,pts,q=>Math.max(2,15*(1-q*.75)+2),BARK,al*.97,{add:false,core:BARK});
  E.ribbon(g,pts.slice(1),q=>Math.max(1.6,8*(1-q*.75)+1.4),P.deep,al*.98,{add:false,core:P.main});
  E.ribbon(g,pts.slice(2),q=>Math.max(1.2,3.2*(1-q)+1.2),P.main,al*.95,{core:P.light});
  const mid=pts[7],tp=pts[m-1];
  leaf(g,E,mid[0]+3,mid[1],5.2,-.6+Math.sin(T*1.3+k)*.15,T*1.5+k,'#4fa028',al);
  leaf(g,E,tp[0],tp[1]-2,6,-1.45+Math.sin(T*1.1+k)*.2,T*1.7+k*2,'#9be34f',al);
  E.glow(g,tp[0],tp[1],5,P.light,.35*al*(.7+.3*Math.sin(T*2.6+k)));
 }
 /* nấm phát sáng: thân trắng xanh, mũ xanh lục có đốm sáng nhấp nháy */
 function shroom(g,E,x,y,s,k,P,T,al){
  if(al<=.02||s<1)return;
  const pu=.7+.3*Math.sin(T*2+k*1.7);
  E.glow(g,x,y-s*.9,s*2.3,P.main,.28*al*pu,P.light);
  g.save();
  g.fillStyle=E.rgba('#dfeec0',.96*al);g.fillRect(x-s*.28,y-s*1.15,s*.56,s*1.15);
  g.fillStyle=E.rgba(P.deep,.98*al);g.beginPath();g.ellipse(x,y-s*1.1,s,s*.72,0,Math.PI,TAU);g.closePath();g.fill();
  g.fillStyle=E.rgba(P.main,.96*al);g.beginPath();g.ellipse(x,y-s*1.1,s*.82,s*.56,0,Math.PI,TAU);g.closePath();g.fill();
  g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(P.core,.95*al*pu);
  g.beginPath();g.arc(x-s*.32,y-s*1.5,Math.max(.9,s*.17),0,TAU);g.fill();
  g.beginPath();g.arc(x+s*.28,y-s*1.38,Math.max(.8,s*.13),0,TAU);g.fill();
  g.restore();
 }
 REG.grove=function(g,x,q,T,e,E){
  const P=GROVE,{a,al}=level(q,T,10),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* tán lá mờ sau lưng thú */
   canopy(g,E,x,GY-84,42*(.96+.04*Math.sin(T*1.9)),P,T,al*1.05);
   circle(g,E,x,P,T,al,{r:58,ph:10.7,runeDir:1});
   /* sương rừng xanh nhạt sát đất (bán trong suốt) */
   for(let k=0;k<7;k++){
    const side=hash(k*1.9+7)*2-1,px=x+side*(58+10*Math.abs(side))+Math.sin(T*.4+k*1.7)*6,py=GY-2-hash(k+5)*20*grow,rx=22+hash(k+9)*16,ry=8+hash(k+13)*8;
    E.blob(g,px,py,rx,ry,k%2?P.light:P.main,.2*al,T*.5,k*29,{wob:.35,speed:1,core:P.light});
   }
   /* rễ cổ thụ + nấm: hai bên và phía sau trận pháp (không che cung trước) */
   const it=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<4;k++){
     const t=k/3,ang0=-.3+t*1.75,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+17)-.5)*.2,rp=58*(.97+hash(k*2+side+8)*.12),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang)),h=(36+hash(k*3+side*5+6)*40)*(.55+.75*sd);
     it.push({t:'r',x:p[0],y:p[1],h,lean:-side*(h*.3+hash(k+9)*8)+(p[0]-x)*.15,k:k+side*20});
    }
    for(let k=0;k<2;k++){
     const an=side>0?-.45+hash(k*3.1+side+2)*1.3:Math.PI-(-.45+hash(k*3.1+side+2)*1.3),rp=68+hash(k+side*3+5)*8,p=gp(x,an,rp);
     it.push({t:'m',x:p[0],y:p[1],s:11+hash(k*2+side*9+3)*4,k:k*3+side*7+60});
    }
   }
   it.sort((u,v)=>u.y-v.y);
   const dI=o=>{if(o.t==='r')rootv(g,E,o.x,o.y,o.h*gk,o.lean,T,o.k,P,al);else shroom(g,E,o.x,o.y,o.s*gk,o.k,P,T,al)};
   it.filter(o=>o.y<GY).forEach(dI);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.15,wmax:15,ph:.6});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-.85,wmax:10,ph:2.4});
   it.filter(o=>o.y>=GY).forEach(dI);
   /* lá lớn xoáy quanh thú (vàng-lục, khác lá bạc hà của Phong Nguyên) */
   for(let k=0;k<12;k++){
    const sp=.04+hash(k*2.1+3)*.04,p=(T*sp+hash(k*5.7+2))%1,an=T*(.7+hash(k+1)*.5)*(k%2?1:-1)+k*1.9,rad=36+hash(k+4)*28+p*8;
    leaf(g,E,x+Math.cos(an)*rad,GY-8-p*124+Math.sin(an)*rad*.3,7.5+hash(k+8)*4,an*.7+k,T*(1.6+hash(k+2)*1.6)+k,k%3?'#4fa028':'#9be34f',Math.sin(Math.PI*p)*al*1.1);
   }
   /* đom đóm rừng lập loè */
   for(let k=0;k<12;k++){
    const px=x+(hash(k*4.7+1)*2-1)*70+Math.sin(T*.7+k*2.1)*9,py=GY-18-hash(k*3.3+2)*104+Math.sin(T*.9+k*1.3)*8,
     bl=Math.pow(Math.max(0,Math.sin(T*1.8+k*2.3)),2)*al;
    E.glow(g,px,py,4.2,'#eaffa0',.7*bl);
    g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(P.core,.95*bl);g.fillRect(px-1.1,py-1.1,2.2,2.2);g.restore();
   }
   /* lúc vào trận: tán lá bừng sáng + lá bắn toả hình quạt */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    canopy(g,E,x,GY-84,42+30*k,P,T,a*(1-k)*.9);
    for(let j=0;j<8;j++){
     const an=-Math.PI/2+(j-3.5)*.4,d=8+k*76;
     leaf(g,E,x+Math.cos(an)*d,GY-34+Math.sin(an)*d,6.5,an+k*3,k*9+j,'#9be34f',a*(1-k));
    }
   }
   /* bào tử xanh bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<16;k++){
    const p=(T*(.06+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.4+k*1.7)*5,py=GY-6-p*124;
    g.fillStyle=E.rgba(k%3?P.light:P.main,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,12,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 11 — VÙNG XÍCH HỎA ĐỊA (key kỹ thuật 'lava'): màu vùng #ff5a1e, tự thiết kế, KHÔNG vẽ mặt trời/thiên thạch (đã là bộ Dương Sơn) =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (đất dung nham, núi lửa):
    núi lửa mờ sau lưng phun dung nham, nứt đất rộng rực đỏ, cột đá bazan có mạch lửa + hồ dung nham sủi bọt hai bên,
    bom dung nham bay vòng cung, tro đen rơi + than hồng bốc lên; lúc vào trận miệng núi lửa bùng nổ, bom dung nham bắn toả. */
 const LAVA={deep:'#7a1a06',main:'#ff5a1e',light:'#ffb050',core:'#fff0c0'};
 /* núi lửa mờ: sườn đá tối bán trong suốt, dòng dung nham chảy xuống sườn, miệng núi toả sáng + cột lửa phun */
 function volcano(g,E,x,y,w,h,P,T,al,boost){
  if(al<=.02)return;
  const cw=w*.2,top=y-h;
  g.save();
  g.fillStyle=E.rgba('#2a1410',.42*al);
  g.beginPath();g.moveTo(x-w,y);g.lineTo(x-cw,top);g.lineTo(x+cw,top);g.lineTo(x+w,y);g.closePath();g.fill();
  g.lineCap='round';g.lineJoin='round';
  for(let i=0;i<4;i++){
   const sd=i<2?-1:1,off=(i%2?.45:.15),pts=[],sx=x+sd*(cw+(w-cw)*.05*(1+i%2)),pu=.7+.3*Math.sin(T*2.2+i*1.7);
   for(let j=0;j<6;j++){const t=j/5;pts.push([sx+sd*(w-cw)*(t*(.5+off))+Math.sin(t*6+i)*3,top+h*t*.95])}
   g.globalCompositeOperation='source-over';g.strokeStyle=E.rgba(P.deep,.8*al);g.lineWidth=3.4;g.beginPath();pts.forEach((p,j)=>j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
   g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(P.main,.85*al*pu);g.lineWidth=1.8;g.stroke();
   g.strokeStyle=E.rgba(P.light,.8*al*pu);g.lineWidth=.8;g.stroke();
  }
  g.restore();
  E.glow(g,x,top,w*.5*(1+.3*(boost||0)),P.main,.5*al,P.light);
  g.save();g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(P.light,.9*al);g.beginPath();g.ellipse(x,top,cw,cw*.3,0,0,TAU);g.fill();
  g.fillStyle=E.rgba(P.core,.9*al);g.beginPath();g.ellipse(x,top,cw*.5,cw*.16,0,0,TAU);g.fill();g.restore();
 }
 /* cột đá bazan: thân tối hai mặt, mặt trên nứt phát sáng, mạch lửa dọc thân */
 function column(g,E,x,y,h,w,k,P,al,T){
  if(al<=.02||h<3)return;
  const pu=.7+.3*Math.sin(T*2.5+k*1.9),ty=y-h;
  E.glow(g,x,y-h*.4,w*2.4,P.main,.2*al*pu);
  g.save();g.lineJoin='round';
  g.fillStyle=E.rgba('#24120e',.97*al);g.fillRect(x-w,ty,w,h);
  g.fillStyle=E.rgba('#3c2018',.97*al);g.fillRect(x,ty,w,h);
  g.fillStyle=E.rgba('#5a3226',.98*al);g.beginPath();g.ellipse(x,ty,w,w*.38,0,0,TAU);g.fill();
  g.strokeStyle=E.rgba('#0f0806',.9*al);g.lineWidth=1.2;g.strokeRect(x-w,ty,w*2,h);
  g.globalCompositeOperation='lighter';g.lineCap='round';
  g.strokeStyle=E.rgba(P.main,.9*al*pu);g.lineWidth=1.8;g.beginPath();g.moveTo(x,ty+w*.38);g.lineTo(x+(hash(k)-.5)*w*.5,ty+h*.5);g.lineTo(x+(hash(k+3)-.5)*w*.6,y);g.stroke();
  g.strokeStyle=E.rgba(P.light,.85*al*pu);g.lineWidth=.8;g.stroke();
  g.fillStyle=E.rgba(P.light,.85*al*pu);g.beginPath();g.ellipse(x,ty,w*.55,w*.2,0,0,TAU);g.fill();
  g.restore();
 }
 /* hồ dung nham sủi bọt: viền đá tối, mặt đỏ cam, lõi sáng, bọt phồng lên rồi vỡ */
 function pool(g,E,x,y,rx,ry,k,P,al,T){
  if(al<=.02||rx<2)return;
  E.glow(g,x,y,rx*1.3,P.main,.28*al,P.light);
  g.save();
  g.fillStyle=E.rgba('#24120e',.96*al);g.beginPath();g.ellipse(x,y+1,rx*1.18,ry*1.25,0,0,TAU);g.fill();
  g.fillStyle=E.rgba(P.main,.95*al);g.beginPath();g.ellipse(x,y,rx,ry,0,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(P.light,.75*al*(.8+.2*Math.sin(T*2.2+k)));g.beginPath();g.ellipse(x+rx*.1,y,rx*.62,ry*.6,0,0,TAU);g.fill();
  for(let i=0;i<3;i++){
   const p=(T*.5+i*.34+hash(k+i)*2)%1,bx=x+(hash(k*2+i)*2-1)*rx*.6,by=y+(hash(k+i*5)*2-1)*ry*.4,br=1+p*3;
   g.lineWidth=1.2;g.strokeStyle=E.rgba(P.core,(p<.8?.9:.9*(1-p)*5)*al);g.beginPath();g.ellipse(bx,by-p*3,br,br*.7,0,0,TAU);g.stroke();
  }
  g.restore();
 }
 /* bom dung nham: cục lửa bay vòng cung, có đuôi sáng */
 function lbomb(g,E,px,py,s,P,al){
  if(al<=.02||s<.5)return;
  E.glow(g,px,py,s*3,P.main,.5*al,P.light);
  g.save();g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(P.main,.95*al);g.beginPath();g.arc(px,py,s,0,TAU);g.fill();
  g.fillStyle=E.rgba(P.core,.95*al);g.beginPath();g.arc(px,py,s*.5,0,TAU);g.fill();g.restore();
 }
 REG.lava=function(g,x,q,T,e,E){
  const P=LAVA,{a,al}=level(q,T,11),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow),VT=GY-100;
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* núi lửa mờ sau lưng thú */
   volcano(g,E,x,GY-6,76,94*(.5+.5*gk),P,T,al,a>0&&e!=null?1-cl(e,0,1):0);
   circle(g,E,x,P,T,al,{r:58,ph:11.9,runeDir:-1,cracks:false});
   /* nứt đất rộng rực đỏ như mạch dung nham */
   g.save();g.lineCap='round';g.lineJoin='round';
   for(let k=0;k<12;k++){
    const an=hash(k*5.7+11)*TAU,r0=58*(.95+hash(k)*.08),len=14+hash(k+9)*22,pts=[gp(x,an,r0)];
    for(let s=1;s<=3;s++)pts.push(gp(x,an+(hash(k*7+s)-.5)*.36,r0+len*s/3));
    const pu=.75+.25*Math.sin(T*2.4+k);
    g.strokeStyle=E.rgba('#150806',.9*al);g.lineWidth=3.2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(P.main,.9*al*pu);g.lineWidth=1.8;g.stroke();
    g.strokeStyle=E.rgba(P.light,.85*al*pu);g.lineWidth=.8;g.stroke();g.globalCompositeOperation='source-over';
   }
   g.restore();
   /* khói/hơi nóng đỏ sát đất, bán trong suốt */
   for(let k=0;k<6;k++){
    const side=hash(k*1.9+11)*2-1,px=x+side*(58+10*Math.abs(side))+Math.sin(T*.4+k*1.7)*6,py=GY-2-hash(k+5)*18*grow,rx=20+hash(k+9)*14,ry=7+hash(k+13)*7;
    E.blob(g,px,py,rx,ry,k%2?P.main:P.deep,.2*al,T*.5,k*31,{wob:.35,speed:1,core:P.light});
   }
   /* cột đá bazan + hồ dung nham: hai bên và phía sau trận pháp (không che cung trước) */
   const it=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<3;k++){
     const t=k/2,ang0=-.25+t*1.6,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+23)-.5)*.2,rp=58*(.98+hash(k*2+side+10)*.1),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang)),h=(22+hash(k*3+side*5+8)*32)*(.55+.75*sd);
     it.push({t:'c',x:p[0],y:p[1],h,w:5+hash(k+side*3)*2.5,k:k+side*20});
    }
    const an=side>0?.2+hash(side+4)*.5:Math.PI-(.2+hash(side+4)*.5),p=gp(x,an,70);
    it.push({t:'p',x:p[0],y:p[1]+2,rx:13+hash(side+9)*4,ry:5,k:side*7+50});
   }
   it.sort((u,v)=>u.y-v.y);
   const dI=o=>{if(o.t==='c')column(g,E,o.x,o.y,o.h*gk,o.w,o.k,P,al,T);else pool(g,E,o.x,o.y,o.rx*gk,o.ry*gk,o.k,P,al,T)};
   it.filter(o=>o.y<GY).forEach(dI);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.3,wmax:15,ph:.7});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-1,wmax:10,ph:2.2});
   it.filter(o=>o.y>=GY).forEach(dI);
   /* bom dung nham bắn từ miệng núi, bay vòng cung rơi xuống hai bên */
   for(let k=0;k<5;k++){
    const p=(T*.32+k*.2+hash(k+3)*.2)%1,dx=(hash(k*3.7+2)*2-1)*78,px=x+dx*p,py=VT+(GY-6-VT)*p*p-(50+hash(k+6)*40)*Math.sin(Math.PI*Math.min(1,p*1.15))*(1-p*.2);
    for(let t=1;t<=3;t++){const pp=Math.max(0,p-t*.03);lbomb(g,E,x+dx*pp,VT+(GY-6-VT)*pp*pp-(50+hash(k+6)*40)*Math.sin(Math.PI*Math.min(1,pp*1.15))*(1-pp*.2),(2.4-t*.5),P,al*.5*(1-t*.25))}
    lbomb(g,E,px,py,2.8+hash(k+8),P,al*Math.sin(Math.PI*Math.min(1,p*1.05)+.2));
   }
   /* tro đen rơi + than hồng bốc lên */
   g.save();
   for(let k=0;k<10;k++){
    const p=(T*(.05+hash(k+2)*.05)+hash(k*2.9))%1,px=x+(hash(k*4.3)*2-1)*70+Math.sin(T*.8+k*1.7)*6,py=GY-130+p*130;
    g.globalCompositeOperation='source-over';g.fillStyle=E.rgba('#2a1814',Math.sin(Math.PI*p)*.75*al);g.fillRect(px-1.3,py-1,2.6,2);
   }
   g.globalCompositeOperation='lighter';
   for(let k=0;k<18;k++){
    const p=(T*(.07+hash(k)*.07)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.6+k*1.7)*5,py=GY-6-p*126;
    g.fillStyle=E.rgba(k%3?P.light:P.main,Math.sin(Math.PI*p)*.95*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   /* lúc vào trận: miệng núi bùng nổ, bom dung nham bắn toả hình quạt */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    E.glow(g,x,VT,30+40*k,P.light,.7*a*(1-k),P.core);
    for(let j=0;j<8;j++){
     const an=-Math.PI/2+(j-3.5)*.42,d=k*86;
     lbomb(g,E,x+Math.cos(an)*d,VT+Math.sin(an)*d+k*k*60,3.6,P,a*(1-k));
    }
   }
   sparks(g,E,x,P,T,al,12,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 12 — VÙNG HẮC ÁM LÂM (key kỹ thuật 'ambush'): màu vùng #b0206a, tự thiết kế, KHÔNG trùng bộ Thanh Lâm (rừng xanh) =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (rừng tối, phục kích trong bóng đêm):
    trăng đen viền hồng sau lưng, cây khô đen có gân hồng + dây gai đen hai bên trận pháp, từng cặp mắt hồng mở/nhắm trong bóng tối,
    dơi bay vòng quanh thú, sương đen tím bán trong suốt, đốm sáng hồng; lúc vào trận trăng đen bừng, nhiều mắt bật mở, bầy dơi toả ra. */
 const AMB={deep:'#3a0a28',main:'#b0206a',light:'#ee6ab0',core:'#ffd8ec'};
 const NIGHT='#160713';
 /* trăng đen: đĩa tối bán trong suốt, viền hồng sáng, vầng sáng lệch */
 function bmoon(g,E,x,y,r,P,T,al){
  if(al<=.02||r<2)return;
  E.glow(g,x,y,r*1.6,P.main,.26*al,P.light);
  g.save();
  g.fillStyle=E.rgba(NIGHT,.5*al);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  g.lineWidth=3;g.strokeStyle=E.rgba(P.main,.4*al);g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();
  g.lineWidth=1.4;g.strokeStyle=E.rgba(P.light,.9*al);g.beginPath();g.arc(x,y,r,0,TAU);g.stroke();
  const o=Math.sin(T*.4)*.2;
  g.lineWidth=2.2;g.strokeStyle=E.rgba(P.core,.75*al);g.beginPath();g.arc(x,y,r*.9,-2.4+o,-1.4+o);g.stroke();
  g.restore();
 }
 /* cây khô đen: thân + cành xoắn, gân hồng phát sáng chạy dọc */
 function dtree(g,E,x0,y0,h,lean,k,P,al,T){
  if(al<=.02||h<4)return;
  const trunk=[],m=12;
  for(let j=0;j<m;j++){const t=j/(m-1);trunk.push([x0+lean*t*t+Math.sin(t*5+k)*3*t,y0-h*t])}
  const pu=.7+.3*Math.sin(T*2+k*1.9);
  for(let b=0;b<3;b++){
   const j0=4+b*2,p=trunk[j0],sd=(b+k)%2?1:-1,L=h*(.34-.05*b),br=[];
   for(let j=0;j<6;j++){const t=j/5;br.push([p[0]+sd*L*t,p[1]-L*.55*t-Math.sin(t*4+k+b)*3-(t*t)*L*.15])}
   E.ribbon(g,br,q=>Math.max(1.3,5*(1-q)+1),NIGHT,al*.97,{add:false,core:NIGHT});
   E.ribbon(g,br.slice(1),q=>Math.max(.9,1.4*(1-q)+.5),P.main,al*.8*pu,{core:P.light});
  }
  E.ribbon(g,trunk,q=>Math.max(2,12*(1-q*.8)+2),NIGHT,al*.98,{add:false,core:NIGHT});
  E.ribbon(g,trunk.slice(1),q=>Math.max(1,2.6*(1-q*.8)+.8),P.main,al*.9*pu,{core:P.light});
  const tp=trunk[m-1];E.glow(g,tp[0],tp[1],5,P.light,.3*al*pu);
 }
 /* dây gai đen: dây uốn từ đất, gai nhọn hai bên, lõi hồng */
 function thornvine(g,E,x0,y0,h,lean,T,k,P,al){
  if(al<=.02||h<4)return;
  const pts=[],m=12;
  for(let j=0;j<m;j++){const t=j/(m-1),sw=Math.sin(T*1.1+k*1.7-t*3)*(1.5+3*t)+Math.sin(t*8+k)*3*(1-t*.5);pts.push([x0+lean*t*t+sw,y0-h*t])}
  E.ribbon(g,pts,q=>Math.max(1.6,5.5*(1-q*.7)+1),NIGHT,al*.98,{add:false,core:NIGHT});
  E.ribbon(g,pts.slice(1),q=>Math.max(.8,1.4*(1-q*.6)+.5),P.main,al*.9,{core:P.light});
  g.save();g.fillStyle=E.rgba('#240b1e',.98*al);g.strokeStyle=E.rgba(P.main,.8*al);g.lineWidth=.7;
  for(let j=2;j<m-1;j++){
   const p=pts[j],sd=j%2?1:-1,tl=4+hash(k+j)*3;
   g.beginPath();g.moveTo(p[0],p[1]-1.6);g.lineTo(p[0]+sd*tl,p[1]-tl*.9);g.lineTo(p[0],p[1]+1.6);g.closePath();g.fill();g.stroke();
  }
  g.restore();
 }
 /* cặp mắt hồng trong bóng tối: mở/nhắm, đồng tử là khe sáng */
 function eyes(g,E,x,y,s,k,P,T,al){
  const op=cl(Math.sin(T*.8+k*2.7)*3,0,1);
  if(al<=.02||s<1||op<=.03)return;
  const a=al*op;
  E.glow(g,x,y,s*3.2,P.main,.3*a);
  g.save();g.globalCompositeOperation='lighter';
  for(let sd=-1;sd<=1;sd+=2){
   const ex=x+sd*s*1.4;
   g.fillStyle=E.rgba(P.light,.95*a);g.beginPath();g.ellipse(ex,y,s*.9,s*.42*op,sd*.35,0,TAU);g.fill();
   g.fillStyle=E.rgba(P.core,.95*a);g.fillRect(ex-.5,y-s*.38*op,1,s*.76*op);
  }
  g.restore();
 }
 /* dơi: thân tối, cánh vỗ, mắt hồng */
 function bat(g,E,x,y,s,fl,P,al){
  if(al<=.02||s<1)return;
  const w=s*1.7,up=Math.sin(fl)*s*.9;
  g.save();g.lineJoin='round';
  g.fillStyle=E.rgba('#1c0818',.97*al);g.strokeStyle=E.rgba(P.main,.7*al);g.lineWidth=.8;
  for(let sd=-1;sd<=1;sd+=2){
   g.beginPath();g.moveTo(x,y);
   g.quadraticCurveTo(x+sd*w*.6,y-s*.9-up,x+sd*w*1.5,y-up*.8+s*.1);
   g.quadraticCurveTo(x+sd*w*1.05,y+s*.15,x+sd*w*.75,y+s*.6);
   g.quadraticCurveTo(x+sd*w*.35,y+s*.2,x,y+s*.55);
   g.closePath();g.fill();g.stroke();
  }
  g.fillStyle=E.rgba('#2a0e22',.98*al);g.beginPath();g.ellipse(x,y+s*.25,s*.42,s*.6,0,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';g.fillStyle=E.rgba(P.light,.95*al);
  g.fillRect(x-s*.3,y+s*.05,s*.2,s*.2);g.fillRect(x+s*.1,y+s*.05,s*.2,s*.2);
  g.restore();
 }
/* bàn tay bóng tối trồi lên từ đất: cánh tay đen gân hồng, bàn tay xoè 5 ngón co duỗi, vươn lên rồi đung đưa */
 function hand(g,E,x0,y0,h,lean,k,P,al,T){
  if(al<=.02||h<6)return;
  const pts=[],m=9,pu=.7+.3*Math.sin(T*2.2+k*1.7);
  for(let j=0;j<m;j++){const t=j/(m-1),sw=Math.sin(T*1.3+k*2.1-t*2.5)*(1.5+3.5*t);pts.push([x0+lean*t*t+sw,y0-h*t])}
  E.ribbon(g,pts,q=>Math.max(2.4,7*(1-q*.45)+1.4),NIGHT,al*.98,{add:false,core:NIGHT});
  E.ribbon(g,pts.slice(1),q=>Math.max(.8,1.5*(1-q*.5)+.5),P.main,al*.8*pu,{core:P.light});
  const w=pts[m-1],pr=pts[m-2],ba=Math.atan2(w[1]-pr[1],w[0]-pr[0]),fl=h*.3+3;
  g.save();g.lineCap='round';g.lineJoin='round';
  g.fillStyle=E.rgba(NIGHT,.98*al);g.beginPath();g.ellipse(w[0]+Math.cos(ba)*fl*.18,w[1]+Math.sin(ba)*fl*.18,3.6,fl*.26,ba+Math.PI/2,0,TAU);g.fill();
  for(let i=0;i<5;i++){
   const sp=(i-2)*.5,cu=.35+.3*Math.sin(T*2.4+k*1.3+i*.9),an=ba+sp,L=fl*(i===2?1:i%4===0?.62:.85),
    mx=w[0]+Math.cos(an)*L*.55,my=w[1]+Math.sin(an)*L*.55,tx=w[0]+Math.cos(an+cu*sp*-.8+cu*.4)*L,ty=w[1]+Math.sin(an+cu*sp*-.8+cu*.4)*L;
   g.strokeStyle=E.rgba(NIGHT,.98*al);g.lineWidth=2.8;g.beginPath();g.moveTo(w[0],w[1]);g.quadraticCurveTo(mx,my,tx,ty);g.stroke();
   g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(P.light,.85*al*pu);g.lineWidth=.8;g.stroke();g.globalCompositeOperation='source-over';
  }
  g.restore();
  E.glow(g,w[0],w[1]-fl*.4,fl*.9,P.main,.22*al*pu);
  /* đất nứt toả hồng quanh chỗ tay trồi lên */
  g.save();g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(P.main,.7*al);g.lineWidth=1.2;g.beginPath();g.ellipse(x0,y0,6+3*pu,2.4,0,0,TAU);g.stroke();g.restore();
 }
 REG.ambush=function(g,x,q,T,e,E){
  const P=AMB,{a,al}=level(q,T,12),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* trăng đen sau lưng thú */
   bmoon(g,E,x,GY-86,36*(.97+.03*Math.sin(T*1.7)),P,T,al);
   circle(g,E,x,P,T,al,{r:58,ph:12.3,runeDir:1});
   /* sương đen tím sát đất, bán trong suốt */
   for(let k=0;k<7;k++){
    const side=hash(k*1.9+13)*2-1,px=x+side*(58+10*Math.abs(side))+Math.sin(T*.4+k*1.7)*6,py=GY-2-hash(k+5)*20*grow,rx=22+hash(k+9)*16,ry=8+hash(k+13)*8;
    E.blob(g,px,py,rx,ry,k%2?P.deep:P.main,.2*al,T*.5,k*37,{wob:.35,speed:1,core:P.light});
   }
   /* mắt trong bóng tối: hai bên thú, trên cao (không che trận pháp) */
   for(let k=0;k<7;k++){
    const sd=k%2?1:-1,ex=x+sd*(36+hash(k*2.3+1)*38),ey=GY-30-hash(k*3.1+2)*92;
    eyes(g,E,ex,ey,2.2+hash(k+5)*1.3,k,P,T,al*grow);
   }
   /* cây khô + dây gai: hai bên và phía sau trận pháp (không che cung trước) */
   const it=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<4;k++){
     const t=k/3,ang0=-.3+t*1.75,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+29)-.5)*.2,rp=58*(.97+hash(k*2+side+12)*.12),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang)),h=(34+hash(k*3+side*5+10)*38)*(.55+.75*sd);
     it.push({t:k%2?'v':'d',x:p[0],y:p[1],h:k%2?h*.7:h,lean:-side*(h*.22+hash(k+9)*7)+(p[0]-x)*.12,k:k+side*20});
    }
   }
   /* bàn tay trồi lên từ đất: hai bên và phía sau (không che cung trước) */
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<3;k++){
     const ang0=.05+k*.62+hash(k+side*5+31)*.15,ang=side<0?Math.PI+ang0:-ang0,rp=62+hash(k*2+side+14)*10,p=gp(x,ang,rp),sd=Math.abs(Math.cos(ang));
     it.push({t:'h',x:p[0],y:p[1],h:(24+hash(k*3+side*7+12)*14)*(.7+.5*sd),lean:-side*(4+hash(k+3)*6)+(p[0]-x)*.1,k:k+side*20+70});
    }
   }
   it.sort((u,v)=>u.y-v.y);
   const dI=o=>{if(o.t==='h')hand(g,E,o.x,o.y,o.h*gk,o.lean,o.k,P,al,T);else if(o.t==='d')dtree(g,E,o.x,o.y,o.h*gk,o.lean,o.k,P,al,T);else thornvine(g,E,o.x,o.y,o.h*gk,o.lean,T,o.k,P,al)};
   it.filter(o=>o.y<GY).forEach(dI);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.2,wmax:15,ph:.8});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-.9,wmax:10,ph:2.5});
   it.filter(o=>o.y>=GY).forEach(dI);
   /* dơi bay vòng quanh thú */
   for(let k=0;k<5;k++){
    const an=T*(.5+hash(k)*.3)*(k%2?1:-1)+k*1.3,rr=40+hash(k+2)*26,px=x+Math.cos(an)*rr,py=GY-30-hash(k+3)*84+Math.sin(an)*7;
    bat(g,E,px,py,3.4+hash(k+6)*1.6,T*9+k*2,P,al*Math.min(1,grow*1.5)*(Math.sin(an)>.6?.75:1));
   }
   /* lúc vào trận: trăng đen bừng, mắt bật mở, bầy dơi toả hình quạt */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    bmoon(g,E,x,GY-86,36+30*k,P,T,a*(1-k)*.9);
    for(let j=0;j<6;j++){
     const an=-Math.PI/2+(j-2.5)*.5,d=10+k*78;
     bat(g,E,x+Math.cos(an)*d,GY-40+Math.sin(an)*d,3.8,k*18+j*2,P,a*(1-k));
    }
    for(let j=0;j<4;j++)eyes(g,E,x+(j%2?1:-1)*(30+j*12),GY-60-j*14,3,j+1,P,1.2,a*(1-k)*1.2);
   }
   /* đốm sáng hồng lập loè + bụi tối bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<16;k++){
    const p=(T*(.06+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.4+k*1.7)*5,py=GY-6-p*124;
    g.fillStyle=E.rgba(k%3?P.light:P.main,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,12,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 13 — VÙNG TỬ TINH HẢI (key kỹ thuật 'star'): màu vùng #b45cff, tự thiết kế, KHÔNG trùng Vân Đảo (mây tím) hay Huyền Uyên (vực xoáy) =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (biển sao tím: sóng biển + thiên hà):
    thiên hà xoắn ốc mờ sau lưng, sóng biển tím cuộn cao có bọt sao hai bên trận pháp, sao 5 cánh nổi quanh thú,
    sao băng rơi chéo, bụi sao lấp lánh; lúc vào trận thiên hà bừng to, sao 5 cánh bắn toả hình quạt. */
 const STARP={deep:'#4a1a8a',main:'#b45cff',light:'#dcaaff',core:'#f8ecff'};
 /* thiên hà xoắn ốc: đĩa tối mờ + 3 nhánh hạt sao quay chậm + lõi sáng */
 function galaxy(g,E,x,y,r,P,T,al){
  if(al<=.02||r<3)return;
  E.glow(g,x,y,r*1.5,P.main,.28*al,P.light);
  g.save();
  g.fillStyle=E.rgba('#1a0a36',.4*al);g.beginPath();g.ellipse(x,y,r*1.05,r*.62,0,0,TAU);g.fill();
  g.globalCompositeOperation='lighter';
  for(let arm=0;arm<3;arm++){
   for(let j=0;j<24;j++){
    const t=j/23,an=arm*TAU/3+t*3.3+T*.35,rad=r*(.14+.9*t),px=x+Math.cos(an)*rad,py=y+Math.sin(an)*rad*.58,sz=(1-t*.6)*2.6+.6;
    g.fillStyle=E.rgba(j%3?P.light:P.core,(.35+.55*(1-t))*al);g.fillRect(px-sz/2,py-sz/2,sz,sz);
   }
  }
  g.restore();
  E.glow(g,x,y,r*.34,P.core,.7*al,'#ffffff');
 }
 /* sóng biển tím cuộn: dải sóng dựng đứng, đỉnh cuộn về phía dir, bọt sao sáng chạy dọc đỉnh */
 function swell(g,E,x0,y0,h,dir,T,k,P,al){
  if(al<=.02||h<4)return;
  const pts=[],m=14;
  for(let j=0;j<m;j++){
   const t=j/(m-1),bd=Math.sin(T*1.2+k*1.9)*2;
   pts.push([x0+dir*(h*.55*Math.pow(t,2.2)+bd*t),y0-h*(1-Math.pow(1-t,1.8))+Math.sin(t*9+T*1.5+k)*1.2]);
  }
  E.ribbon(g,pts,q=>Math.max(2,15*(1-q*.72)+2),P.deep,al*.9,{add:false,core:P.deep});
  E.ribbon(g,pts.slice(1),q=>Math.max(1.5,9*(1-q*.72)+1.2),P.main,al*.9,{core:P.light});
  E.ribbon(g,pts.slice(3),q=>Math.max(1,3*(1-q)+1),P.light,al*.85,{core:P.core});
  const tp=pts[m-1];
  g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<5;i++){
   const p=pts[7+i],tw=Math.pow(Math.max(0,Math.sin(T*2.6+k*2+i*1.7)),2);
   g.fillStyle=E.rgba(P.core,.95*al*tw);g.fillRect(p[0]-1.1+dir*2,p[1]-3-i*.4,2.2,2.2);
  }
  g.restore();
  E.glow(g,tp[0],tp[1],6,P.light,.4*al);
 }
 /* sao 5 cánh: nửa tối + nửa sáng, viền trắng, quầng nhẹ */
 function star5(g,E,x,y,r,rot,col,a){
  if(a<=.02||r<1)return;
  E.glow(g,x,y,r*2.2,col,.3*a);
  g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';g.lineJoin='round';
  g.fillStyle=E.rgba(col,.85*a);g.beginPath();
  for(let i=0;i<10;i++){const an=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;i?g.lineTo(Math.cos(an)*rr,Math.sin(an)*rr):g.moveTo(Math.cos(an)*rr,Math.sin(an)*rr)}
  g.closePath();g.fill();g.strokeStyle=E.rgba('#ffffff',.85*a);g.lineWidth=.8;g.stroke();g.restore();
 }
 /* sao băng: đầu sáng + đuôi thon */
 function comet(g,E,hx,hy,len,ang,P,al){
  if(al<=.02)return;
  const tx=hx-Math.cos(ang)*len,ty=hy-Math.sin(ang)*len;
  E.ribbon(g,[[tx,ty],[(tx+hx)/2,(ty+hy)/2],[hx,hy]],q=>Math.max(.6,4.2*q),P.main,al*.8,{core:P.light});
  E.glow(g,hx,hy,5,P.core,.7*al,'#ffffff');
 }
 REG.star=function(g,x,q,T,e,E){
  const P=STARP,{a,al}=level(q,T,13),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* thiên hà xoắn ốc mờ sau lưng thú */
   galaxy(g,E,x,GY-86,42*(.97+.03*Math.sin(T*1.8)),P,T,al);
   circle(g,E,x,P,T,al,{r:58,ph:13.4,runeDir:-1});
   /* sương sao tím sát đất, bán trong suốt */
   for(let k=0;k<7;k++){
    const side=hash(k*1.9+17)*2-1,px=x+side*(58+10*Math.abs(side))+Math.sin(T*.4+k*1.7)*6,py=GY-2-hash(k+5)*20*grow,rx=22+hash(k+9)*16,ry=8+hash(k+13)*8;
    E.blob(g,px,py,rx,ry,k%2?P.light:P.main,.2*al,T*.5,k*41,{wob:.35,speed:1,core:P.light});
   }
   /* sóng biển cuộn: hai bên và phía sau trận pháp (không che cung trước) */
   const it=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<4;k++){
     const t=k/3,ang0=-.3+t*1.75,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+37)-.5)*.2,rp=58*(.97+hash(k*2+side+16)*.12),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang)),h=(30+hash(k*3+side*5+14)*34)*(.55+.75*sd);
     it.push({x:p[0],y:p[1],h,dir:-side,k:k+side*20+90});
    }
   }
   it.sort((u,v)=>u.y-v.y);
   const dI=o=>swell(g,E,o.x,o.y,o.h*gk,o.dir,T,o.k,P,al);
   it.filter(o=>o.y<GY).forEach(dI);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.25,wmax:15,ph:1});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-.95,wmax:10,ph:2.7});
   it.filter(o=>o.y>=GY).forEach(dI);
   /* sao 5 cánh nổi quanh thú */
   for(let k=0;k<6;k++){
    const an=T*(.5+hash(k)*.3)*(k%2?1:-1)+k*1.05,rr=38+hash(k+2)*28,px=x+Math.cos(an)*rr,py=GY-24-hash(k+3)*92+Math.sin(an)*8,tw=.7+.3*Math.sin(T*3+k*1.9);
    star5(g,E,px,py,(3.6+hash(k+6)*2.4)*Math.min(1,grow*1.5),T*.8+k,k%2?P.light:P.main,al*tw*(Math.sin(an)>.6?.75:1));
   }
   /* sao băng rơi chéo */
   for(let k=0;k<3;k++){
    const p=(T*.28+k/3)%1,hx=x-70+k*70+p*52,hy=GY-150+p*120;
    comet(g,E,hx,hy,26,.75,P,al*Math.sin(Math.PI*Math.min(1,p*1.05)));
   }
   /* lúc vào trận: thiên hà bừng to + sao 5 cánh bắn toả hình quạt */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    galaxy(g,E,x,GY-86,42+34*k,P,T,a*(1-k)*.9);
    for(let j=0;j<8;j++){
     const an=-Math.PI/2+(j-3.5)*.4,d=8+k*78;
     star5(g,E,x+Math.cos(an)*d,GY-34+Math.sin(an)*d,5,k*8+j,P.light,a*(1-k));
    }
   }
   /* bụi sao lấp lánh bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<16;k++){
    const p=(T*(.06+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.4+k*1.7)*5,py=GY-6-p*124;
    g.fillStyle=E.rgba(k%3?P.light:P.core,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,14,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 14 — VÙNG THIÊN KHÔNG (key kỹ thuật 'first'): màu vùng #6ac4ff, tự thiết kế, KHÔNG trùng Tuyết Nguyên (băng), Vân Đảo (mây tím), Phong Nguyên (gió xanh lá) =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (bầu trời cao, cổng trời):
    cổng trời vòm cung mờ sau lưng toả tia xuống, cột sáng từ trời chiếu xuống hai bên trận pháp,
    mây cao nhỏ trôi, chim sáng bay vòng quanh thú, lông vũ sáng rơi chậm; lúc vào trận cổng trời bừng to, chim + lông vũ bắn toả hình quạt. */
 const SKY={deep:'#1c5aa0',main:'#6ac4ff',light:'#b4e6ff',core:'#f0fbff'};
 /* cổng trời: vòm cung hai cột, lòng cổng sáng, tia sáng toả xuống */
 function gate(g,E,x,y,r,P,T,al){
  if(al<=.02||r<4)return;
  const pu=.8+.2*Math.sin(T*2),cx=r*.7,top=y-r*.15;
  E.glow(g,x,y,r*1.5,P.main,.3*al*pu,P.light);
  g.save();g.lineJoin='round';g.lineCap='round';
  g.beginPath();g.moveTo(x-cx,y+r*.85);g.lineTo(x-cx,top);g.arc(x,top,cx,Math.PI,0);g.lineTo(x+cx,y+r*.85);g.closePath();
  g.fillStyle=E.rgba(P.deep,.3*al);g.fill();
  g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(P.main,.2*al*pu);g.fill();
  for(let i=0;i<9;i++){
   const fx=x+(i-4)*cx*.2,len=r*(.7+.5*hash(i*2.1+4)),tw=.6+.4*Math.sin(T*1.8+i*1.7);
   g.strokeStyle=E.rgba(P.light,.4*al*tw);g.lineWidth=1.4;g.beginPath();g.moveTo(fx,top-cx*.4);g.lineTo(fx+(i-4)*1.5,top-cx*.4+len);g.stroke();
  }
  g.lineWidth=3.4;g.strokeStyle=E.rgba(P.main,.4*al);
  g.beginPath();g.moveTo(x-cx,y+r*.85);g.lineTo(x-cx,top);g.arc(x,top,cx,Math.PI,0);g.lineTo(x+cx,y+r*.85);g.stroke();
  g.lineWidth=1.4;g.strokeStyle=E.rgba(P.core,.9*al);g.stroke();
  g.restore();
 }
 /* cột sáng từ trời: dải sáng thon trên → rộng dưới, lõi sáng, vòng sáng chạm đất, hạt bụi sáng trôi lên */
 function beam(g,E,x,yb,h,w,P,T,al,k){
  if(al<=.02||h<6)return;
  const yt=yb-h,pu=.75+.25*Math.sin(T*2+k*1.7);
  g.save();
  const gr=g.createLinearGradient(x,yt,x,yb);
  gr.addColorStop(0,E.rgba(P.light,0));gr.addColorStop(.6,E.rgba(P.main,.3*al*pu));gr.addColorStop(1,E.rgba(P.light,.55*al*pu));
  g.globalCompositeOperation='lighter';g.fillStyle=gr;
  g.beginPath();g.moveTo(x-w*.35,yt);g.lineTo(x+w*.35,yt);g.lineTo(x+w,yb);g.lineTo(x-w,yb);g.closePath();g.fill();
  g.fillStyle=E.rgba(P.core,.45*al*pu);g.beginPath();g.moveTo(x-w*.12,yt+h*.2);g.lineTo(x+w*.12,yt+h*.2);g.lineTo(x+w*.4,yb);g.lineTo(x-w*.4,yb);g.closePath();g.fill();
  g.lineWidth=1.3;g.strokeStyle=E.rgba(P.light,.8*al*pu);g.beginPath();g.ellipse(x,yb,w*1.05,w*.4,0,0,TAU);g.stroke();
  for(let i=0;i<4;i++){
   const p=(T*(.12+hash(k+i)*.08)+hash(k*3+i))%1;
   g.fillStyle=E.rgba(P.core,Math.sin(Math.PI*p)*.9*al);g.fillRect(x+(hash(k+i*5)*2-1)*w*.6-1,yb-p*h*.85-1,2.2,2.2);
  }
  g.restore();
 }
 /* lông vũ sáng: phiến thon hai nửa + sống lông */
 function feather(g,E,x,y,s,rot,col,a){
  if(a<=.02||s<1)return;
  g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(col,.75*a);g.beginPath();g.moveTo(0,-s*1.5);g.quadraticCurveTo(s*.9,-s*.3,0,s*1.5);g.quadraticCurveTo(-s*.9,-s*.3,0,-s*1.5);g.closePath();g.fill();
  g.strokeStyle=E.rgba('#ffffff',.85*a);g.lineWidth=.8;g.beginPath();g.moveTo(0,-s*1.5);g.lineTo(0,s*1.8);g.stroke();
  g.restore();
 }
 /* chim sáng: hai cánh vỗ hình chữ V cong, thân chấm sáng */
 function bird(g,E,x,y,s,fl,P,al){
  if(al<=.02||s<1)return;
  const up=Math.sin(fl)*s*.8;
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  for(let pass=0;pass<2;pass++){
   g.strokeStyle=E.rgba(pass?P.core:P.main,(pass?.95:.5)*al);g.lineWidth=pass?1.1:2.6;g.beginPath();
   g.moveTo(x-s*2.1,y-up);g.quadraticCurveTo(x-s*.9,y-s*.6+up*.3,x,y);g.quadraticCurveTo(x+s*.9,y-s*.6+up*.3,x+s*2.1,y-up);g.stroke();
  }
  g.fillStyle=E.rgba(P.core,.95*al);g.fillRect(x-.9,y-.6,1.8,1.8);
  g.restore();E.glow(g,x,y,s*1.6,P.light,.25*al);
 }
 REG.first=function(g,x,q,T,e,E){
  const P=SKY,{a,al}=level(q,T,14),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* cổng trời mờ sau lưng thú */
   gate(g,E,x,GY-84,36*(.97+.03*Math.sin(T*1.8)),P,T,al);
   circle(g,E,x,P,T,al,{r:58,ph:14.6,runeDir:1});
   /* mây cao nhỏ trôi bán trong suốt (phía trên, hai bên) */
   for(let k=0;k<5;k++){
    const sd=k%2?1:-1,px=x+sd*(30+hash(k*2.7+1)*40)+Math.sin(T*.3+k*1.9)*8,py=GY-112-hash(k+4)*22*grow,rx=18+hash(k+9)*12,ry=6+hash(k+13)*5;
    E.blob(g,px,py,rx,ry,k%2?P.light:P.core,.22*al,T*.4,k*43,{wob:.3,speed:1,core:P.core});
   }
   /* cột sáng từ trời: hai bên và phía sau trận pháp (không che cung trước) */
   const it=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<3;k++){
     const t=k/2,ang0=-.2+t*1.5,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+41)-.5)*.2,rp=58*(1+hash(k*2+side+18)*.14),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang));
     it.push({x:p[0],y:p[1],h:(110+hash(k*3+side*5+16)*30)*(.8+.3*sd),w:5+hash(k+side*3)*3,k:k+side*20+110});
    }
   }
   it.sort((u,v)=>u.y-v.y);
   const dI=o=>beam(g,E,o.x,o.y,o.h*gk,o.w,P,T,al,o.k);
   it.filter(o=>o.y<GY).forEach(dI);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.3,wmax:15,ph:1.2});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-1,wmax:10,ph:2.9});
   it.filter(o=>o.y>=GY).forEach(dI);
   /* chim sáng bay vòng quanh thú */
   for(let k=0;k<5;k++){
    const an=T*(.55+hash(k)*.3)*(k%2?1:-1)+k*1.3,rr=40+hash(k+2)*28,px=x+Math.cos(an)*rr,py=GY-34-hash(k+3)*84+Math.sin(an)*7;
    bird(g,E,px,py,3.4+hash(k+6)*1.4,T*7+k*2,P,al*Math.min(1,grow*1.5)*(Math.sin(an)>.6?.75:1));
   }
   /* lông vũ sáng rơi chậm, lắc lư */
   for(let k=0;k<9;k++){
    const p=(T*(.05+hash(k+2)*.04)+hash(k*2.9))%1,px=x+(hash(k*4.3)*2-1)*68+Math.sin(T*1.1+k*1.7)*8,py=GY-135+p*128;
    feather(g,E,px,py,3.2+hash(k+7)*1.6,Math.sin(T*1.2+k*2)*.8+.3,k%3?P.light:P.core,Math.sin(Math.PI*p)*al);
   }
   /* lúc vào trận: cổng trời bừng to + chim, lông vũ bắn toả hình quạt */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    gate(g,E,x,GY-84,36+30*k,P,T,a*(1-k)*.9);
    for(let j=0;j<7;j++){
     const an=-Math.PI/2+(j-3)*.45,d=10+k*80;
     if(j%2)bird(g,E,x+Math.cos(an)*d,GY-40+Math.sin(an)*d,4,k*16+j*2,P,a*(1-k));
     else feather(g,E,x+Math.cos(an)*d,GY-40+Math.sin(an)*d,4.4,an+Math.PI/2,P.light,a*(1-k));
    }
   }
   /* hạt sáng bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<16;k++){
    const p=(T*(.06+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.4+k*1.7)*5,py=GY-6-p*124;
    g.fillStyle=E.rgba(k%3?P.light:P.core,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,12,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 15 — VÙNG LINH HOA VIÊN (key kỹ thuật 'weaken'): màu vùng #ff7ac0, tự thiết kế, KHÔNG trùng Thanh Lâm (rừng xanh) và Hắc Ám Lâm (hồng tối) =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (vườn hoa linh, hồng sáng ngọt):
    đoá hoa khổng lồ mờ sau lưng, dây leo hoa nở rộ + hoa đất hai bên trận pháp, bướm hoa vỗ cánh bay vòng,
    cánh hoa rơi xoáy, phấn hoa bốc lên; lúc vào trận đoá hoa nở bừng to, cánh hoa bắn toả hình quạt. */
 const BLOOM={deep:'#a8306e',main:'#ff7ac0',light:'#ffc0e2',core:'#fff0f8'};
 const VINE='#5a2848';
 /* đoá hoa: 2 lớp cánh (tối-ngoài / sáng-trong) so le, nhuỵ sáng giữa; n = số cánh */
 function blossom(g,E,x,y,r,rot,P,a,n){
  if(a<=.02||r<1)return;n=n||6;
  E.glow(g,x,y,r*1.8,P.main,.25*a,P.light);
  g.save();g.translate(x,y);g.rotate(rot);g.lineJoin='round';
  for(let ly=r<6.5?1:0;ly<2;ly++){
   for(let i=0;i<n;i++){
    const an=i/n*TAU+(ly?Math.PI/n:0);
    g.save();g.rotate(an);
    g.fillStyle=E.rgba(ly?P.main:P.deep,(ly?.92:.95)*a);g.beginPath();g.ellipse(r*(ly?.5:.58),0,r*(ly?.42:.5),r*(ly?.22:.27),0,0,TAU);g.fill();
    g.strokeStyle=E.rgba(P.light,.8*a);g.lineWidth=Math.max(.6,r*.07);g.stroke();
    g.restore();
   }
  }
  g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(P.core,.95*a);g.beginPath();g.arc(0,0,r*.2,0,TAU);g.fill();
  g.fillStyle=E.rgba('#ffe27a',.9*a);
  for(let i=0;i<5;i++){const an=i*1.257;g.fillRect(Math.cos(an)*r*.3-.7,Math.sin(an)*r*.3-.7,1.4,1.4)}
  g.restore();
 }
 /* dây leo hoa: dây nâu hồng uốn lượn, gân hồng sáng, nở 3 đoá hoa dọc dây + nụ ở đầu */
 function flowervine(g,E,x0,y0,h,lean,T,k,P,al,gk){
  if(al<=.02||h<4)return;
  const pts=[],m=12;
  for(let j=0;j<m;j++){const t=j/(m-1),sw=Math.sin(T*1+k*1.7-t*3)*(1.5+3*t)+Math.sin(t*7+k)*2.5*(1-t*.5);pts.push([x0+lean*t*t+sw,y0-h*t])}
  E.ribbon(g,pts,q=>Math.max(1.8,6*(1-q*.7)+1),VINE,al*.98,{add:false,core:VINE});
  E.ribbon(g,pts.slice(1),q=>Math.max(.8,1.5*(1-q*.6)+.5),P.main,al*.85,{core:P.light});
  [[5,5.2,-1],[9,5.8,1]].forEach((f,i)=>{
   const p=pts[f[0]],bl=cl(gk*1.3-i*.12,0,1);
   blossom(g,E,p[0]+f[2]*3,p[1],f[1]*bl,T*.3*f[2]+k+i,P,al,5);
  });
  const tp=pts[m-1];E.glow(g,tp[0],tp[1],5,P.light,.3*al*(.7+.3*Math.sin(T*2.4+k)));
 }
 /* cánh hoa rơi: giọt nước thon, có gân sáng */
 function petal(g,E,x,y,s,rot,col,a){
  if(a<=.02||s<1)return;
  g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(col,.8*a);g.beginPath();g.moveTo(0,-s*1.4);g.quadraticCurveTo(s*1.05,-s*.2,0,s*1.2);g.quadraticCurveTo(-s*1.05,-s*.2,0,-s*1.4);g.closePath();g.fill();
  g.strokeStyle=E.rgba('#ffffff',.7*a);g.lineWidth=.7;g.beginPath();g.moveTo(0,-s*1.1);g.lineTo(0,s*.9);g.stroke();
  g.restore();
 }
 /* bướm hoa: 4 cánh hồng vỗ (co giãn ngang theo nhịp), thân nhỏ, quầng sáng */
 function butterfly(g,E,x,y,s,fl,P,al){
  if(al<=.02||s<1)return;
  const sc=Math.abs(Math.cos(fl))*.75+.25;
  g.save();g.translate(x,y);g.scale(sc,1);g.lineJoin='round';
  for(let sd=-1;sd<=1;sd+=2){
   g.fillStyle=E.rgba(P.main,.92*al);g.strokeStyle=E.rgba(P.light,.9*al);g.lineWidth=.8;
   g.beginPath();g.ellipse(sd*s*.85,-s*.45,s*.85,s*.58,sd*.5,0,TAU);g.fill();g.stroke();
   g.fillStyle=E.rgba(P.deep,.92*al);
   g.beginPath();g.ellipse(sd*s*.6,s*.5,s*.55,s*.4,-sd*.4,0,TAU);g.fill();g.stroke();
  }
  g.restore();
  g.save();g.fillStyle=E.rgba(P.core,.95*al);g.fillRect(x-.6,y-s*.7,1.2,s*1.5);g.restore();
  E.glow(g,x,y,s*1.8,P.light,.22*al);
 }
 REG.weaken=function(g,x,q,T,e,E){
  const P=BLOOM,{a,al}=level(q,T,15),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* đoá hoa khổng lồ mờ sau lưng thú, xoay chậm */
   blossom(g,E,x,GY-86,38*(.97+.03*Math.sin(T*1.8)),T*.15,P,al*.6,8);
   circle(g,E,x,P,T,al,{r:58,ph:15.8,runeDir:-1});
   /* sương hoa hồng nhạt sát đất, bán trong suốt */
   for(let k=0;k<7;k++){
    const side=hash(k*1.9+19)*2-1,px=x+side*(58+10*Math.abs(side))+Math.sin(T*.4+k*1.7)*6,py=GY-2-hash(k+5)*20*grow,rx=22+hash(k+9)*16,ry=8+hash(k+13)*8;
    E.blob(g,px,py,rx,ry,k%2?P.light:P.main,.2*al,T*.5,k*47,{wob:.35,speed:1,core:P.light});
   }
   /* dây leo hoa + hoa đất: hai bên và phía sau trận pháp (không che cung trước) */
   const it=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<4;k++){
     const t=k/3,ang0=-.3+t*1.75,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+43)-.5)*.2,rp=58*(.97+hash(k*2+side+20)*.12),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang)),h=(34+hash(k*3+side*5+18)*36)*(.55+.75*sd);
     it.push({t:'v',x:p[0],y:p[1],h,lean:-side*(h*.25+hash(k+9)*7)+(p[0]-x)*.12,k:k+side*20+120});
    }
    for(let k=0;k<2;k++){
     const an=side>0?-.4+hash(k*3.1+side+6)*1.2:Math.PI-(-.4+hash(k*3.1+side+6)*1.2),p=gp(x,an,70+hash(k+side*3+7)*8);
     it.push({t:'f',x:p[0],y:p[1],r:8+hash(k*2+side*9+5)*4,k:k*3+side*7+130});
    }
   }
   it.sort((u,v)=>u.y-v.y);
   const dI=o=>{if(o.t==='v')flowervine(g,E,o.x,o.y,o.h*gk,o.lean,T,o.k,P,al,gk);else blossom(g,E,o.x,o.y-o.r*.2,o.r*gk,o.k+T*.2,P,al,6)};
   it.filter(o=>o.y<GY).forEach(dI);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.2,wmax:15,ph:1.4});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-.9,wmax:10,ph:3.1});
   it.filter(o=>o.y>=GY).forEach(dI);
   /* bướm hoa bay vòng quanh thú */
   for(let k=0;k<5;k++){
    const an=T*(.5+hash(k)*.3)*(k%2?1:-1)+k*1.3,rr=40+hash(k+2)*26,px=x+Math.cos(an)*rr,py=GY-30-hash(k+3)*84+Math.sin(an)*7+Math.sin(T*2+k)*3;
    butterfly(g,E,px,py,3.6+hash(k+6)*1.4,T*8+k*2,P,al*Math.min(1,grow*1.5)*(Math.sin(an)>.6?.75:1));
   }
   /* cánh hoa rơi xoáy quanh thú */
   for(let k=0;k<12;k++){
    const sp=.04+hash(k*2.1+3)*.04,p=(T*sp+hash(k*5.7+2))%1,an=T*(.6+hash(k+1)*.5)*(k%2?1:-1)+k*1.9,rad=34+hash(k+4)*30;
    petal(g,E,x+Math.cos(an)*rad,GY-130+p*124+Math.sin(an)*rad*.3,3.2+hash(k+8)*1.6,an+k+T*.8,k%3?P.light:P.main,Math.sin(Math.PI*p)*al);
   }
   /* lúc vào trận: đoá hoa nở bừng to + cánh hoa bắn toả hình quạt */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    blossom(g,E,x,GY-86,38+32*k,T*.15+k*1.5,P,a*(1-k)*.9,8);
    for(let j=0;j<8;j++){
     const an=-Math.PI/2+(j-3.5)*.4,d=8+k*78;
     petal(g,E,x+Math.cos(an)*d,GY-36+Math.sin(an)*d,4.6,an+Math.PI/2+k*4,P.light,a*(1-k));
    }
   }
   /* phấn hoa bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<16;k++){
    const p=(T*(.06+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.4+k*1.7)*5,py=GY-6-p*124;
    g.fillStyle=E.rgba(k%3?P.light:'#ffe27a',Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,12,125);
  }finally{g.restore()}
 };

 /* ================= BỘ 16 — VÙNG THẦN ĐIỆN (key kỹ thuật 'judge'): màu vùng #fff0a0, tự thiết kế, KHÔNG trùng Lôi Vực (sét vàng) và Thiên Không (cổng trời xanh) =================
    Hiệu ứng khi mặc đủ bộ 4 món của vùng. Nét riêng theo vùng (điện thần, phán xét):
    cán cân vàng mờ sau lưng nghiêng đung đưa, cột đá điện có rãnh vàng hai bên trận pháp, ấn pháp vàng xoay quanh thú,
    ký tự thiêng rơi xuống, bụi vàng bốc lên; lúc vào trận cán cân bừng to, cột sáng phán xét từ trên giáng xuống + ấn pháp bắn toả hình quạt. */
 const TEMPLE={deep:'#8a6a1a',main:'#ffd860',light:'#fff0a0',core:'#fffbe8'};
 /* cán cân: trụ giữa, đòn nghiêng đung đưa, hai đĩa treo bằng dây, đế; mọi nét vàng sáng */
 function scales(g,E,x,y,r,P,T,al){
  if(al<=.02||r<4)return;
  const tilt=Math.sin(T*.8)*.13,bx=Math.cos(tilt)*r,by=Math.sin(tilt)*r,top=y-r*.55;
  E.glow(g,x,y,r*1.5,P.main,.28*al,P.light);
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  for(let pass=0;pass<2;pass++){
   g.strokeStyle=E.rgba(pass?P.core:P.main,(pass?.9:.45)*al);g.lineWidth=pass?1:3;
   g.beginPath();g.moveTo(x,top-3);g.lineTo(x,y+r*.8);g.moveTo(x-r*.35,y+r*.8);g.lineTo(x+r*.35,y+r*.8);g.stroke();
   g.beginPath();g.moveTo(x-bx,top-by);g.lineTo(x+bx,top+by);g.stroke();
   for(let sd=-1;sd<=1;sd+=2){
    const ex=x+sd*bx,ey=top+sd*by,py=ey+r*.62-sd*by*.9;
    g.beginPath();g.moveTo(ex,ey);g.lineTo(ex-r*.3,py);g.moveTo(ex,ey);g.lineTo(ex+r*.3,py);g.stroke();
    g.beginPath();g.ellipse(ex,py,r*.34,r*.12,0,0,Math.PI);g.stroke();
   }
  }
  g.fillStyle=E.rgba(P.core,.95*al);g.beginPath();g.arc(x,top,2.4,0,TAU);g.fill();
  g.restore();
 }
 /* cột đá điện: thân đá sáng hai mặt, rãnh vàng, đầu cột + chân cột, đỉnh phát sáng */
 function pillar(g,E,x,y,h,w,k,P,al,T){
  if(al<=.02||h<6)return;
  const pu=.7+.3*Math.sin(T*2.1+k*1.7),ty=y-h;
  E.glow(g,x,ty,w*2.6,P.main,.26*al*pu,P.light);
  g.save();g.lineJoin='round';
  g.fillStyle=E.rgba('#b8a878',.97*al);g.fillRect(x-w,ty,w,h);
  g.fillStyle=E.rgba('#ece0b8',.97*al);g.fillRect(x,ty,w,h);
  g.fillStyle=E.rgba('#d8c88c',.98*al);g.fillRect(x-w*1.35,ty-3.5,w*2.7,3.5);g.fillRect(x-w*1.35,y-3,w*2.7,3);
  g.strokeStyle=E.rgba('#5a4818',.85*al);g.lineWidth=1;g.strokeRect(x-w,ty,w*2,h);
  g.globalCompositeOperation='lighter';
  g.strokeStyle=E.rgba(P.main,.85*al*pu);g.lineWidth=1.3;
  for(let i=-1;i<=1;i++){g.beginPath();g.moveTo(x+i*w*.55,ty+3);g.lineTo(x+i*w*.55,y-4);g.stroke()}
  g.fillStyle=E.rgba(P.light,.9*al*pu);g.fillRect(x-w*.8,ty-4,w*1.6,1.6);
  g.restore();
 }
 /* ấn pháp: đĩa vàng hai viền, hình thoi quay giữa, chấm khắc quanh */
 function seal(g,E,x,y,r,rot,P,al){
  if(al<=.02||r<1)return;
  E.glow(g,x,y,r*2.2,P.main,.3*al,P.light);
  g.save();g.translate(x,y);g.rotate(rot);g.globalCompositeOperation='lighter';
  g.fillStyle=E.rgba(P.main,.4*al);g.beginPath();g.arc(0,0,r,0,TAU);g.fill();
  g.lineWidth=Math.max(.8,r*.16);g.strokeStyle=E.rgba(P.light,.9*al);g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
  g.lineWidth=.8;g.strokeStyle=E.rgba(P.core,.95*al);g.beginPath();g.arc(0,0,r*.68,0,TAU);g.stroke();
  g.beginPath();g.moveTo(0,-r*.6);g.lineTo(r*.6,0);g.lineTo(0,r*.6);g.lineTo(-r*.6,0);g.closePath();g.stroke();
  g.fillStyle=E.rgba(P.core,.95*al);g.fillRect(-.8,-.8,1.6,1.6);
  for(let i=0;i<8;i++){const an=i*TAU/8;g.fillRect(Math.cos(an)*r*.84-.6,Math.sin(an)*r*.84-.6,1.2,1.2)}
  g.restore();
 }
 /* ký tự thiêng: vài nét thẳng/gãy kiểu rune, sáng vàng */
 function glyph(g,E,x,y,s,k,P,a){
  if(a<=.02||s<1)return;
  const v=Math.floor(hash(k*3.7)*4),seg=[[[-1,-1],[1,-1],[1,1]],[[0,-1],[0,1],[-1,0],[1,0]],[[-1,1],[0,-1],[1,1]],[[-1,-1],[1,1],[1,-1],[-1,1]]][v];
  g.save();g.globalCompositeOperation='lighter';g.lineCap='round';g.lineJoin='round';
  for(let pass=0;pass<2;pass++){
   g.strokeStyle=E.rgba(pass?P.core:P.main,(pass?.9:.5)*a);g.lineWidth=pass?.9:2.4;g.beginPath();
   seg.forEach((p,i)=>i?g.lineTo(x+p[0]*s,y+p[1]*s):g.moveTo(x+p[0]*s,y+p[1]*s));g.stroke();
  }
  g.restore();
 }
 REG.judge=function(g,x,q,T,e,E){
  const P=TEMPLE,{a,al}=level(q,T,16),grow=e==null?1:cl(e/.6,0,1),gk=easeBack(grow);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   /* cán cân vàng mờ sau lưng thú */
   scales(g,E,x,GY-84,40*(.97+.03*Math.sin(T*1.8)),P,T,al*.9);
   circle(g,E,x,P,T,al,{r:58,ph:16.9,runeDir:1});
   /* sương vàng nhạt sát đất, bán trong suốt */
   for(let k=0;k<7;k++){
    const side=hash(k*1.9+23)*2-1,px=x+side*(58+10*Math.abs(side))+Math.sin(T*.4+k*1.7)*6,py=GY-2-hash(k+5)*20*grow,rx=22+hash(k+9)*16,ry=8+hash(k+13)*8;
    E.blob(g,px,py,rx,ry,k%2?P.light:P.main,.2*al,T*.5,k*53,{wob:.35,speed:1,core:P.light});
   }
   /* cột đá điện: hai bên và phía sau trận pháp (không che cung trước) */
   const it=[];
   for(let side=-1;side<=1;side+=2){
    for(let k=0;k<3;k++){
     const t=k/2,ang0=-.25+t*1.65,ang=(side<0?Math.PI+ang0:-ang0)+(hash(k+side*7+47)-.5)*.2,rp=58*(.98+hash(k*2+side+22)*.1),p=gp(x,ang,rp),
      sd=Math.abs(Math.cos(ang)),h=(36+hash(k*3+side*5+20)*34)*(.55+.75*sd);
     it.push({x:p[0],y:p[1],h,w:5+hash(k+side*3)*2,k:k+side*20+140});
    }
   }
   it.sort((u,v)=>u.y-v.y);
   const dI=o=>pillar(g,E,o.x,o.y,o.h*gk,o.w,o.k,P,al,T);
   it.filter(o=>o.y<GY).forEach(dI);
   swirl(g,E,x,P,T,al,{n:6,H:112,R:50,turns:.8,spin:1.2,wmax:15,ph:1.6});
   swirl(g,E,x,P,T,al*.7,{n:3,H:92,R:60,turns:.7,spin:-.9,wmax:10,ph:3.3});
   it.filter(o=>o.y>=GY).forEach(dI);
   /* ấn pháp vàng xoay quanh thú */
   for(let k=0;k<5;k++){
    const an=T*(.5+hash(k)*.3)*(k%2?1:-1)+k*1.3,rr=38+hash(k+2)*28,px=x+Math.cos(an)*rr,py=GY-28-hash(k+3)*88+Math.sin(an)*8;
    seal(g,E,px,py,(3.8+hash(k+6)*1.8)*Math.min(1,grow*1.5),T*.9*(k%2?1:-1)+k,P,al*(Math.sin(an)>.6?.75:1));
   }
   /* ký tự thiêng rơi chậm */
   for(let k=0;k<9;k++){
    const p=(T*(.05+hash(k+2)*.04)+hash(k*2.9))%1,px=x+(hash(k*4.3)*2-1)*68+Math.sin(T*.9+k*1.7)*5,py=GY-135+p*128;
    glyph(g,E,px,py,2.4+hash(k+7),k,P,Math.sin(Math.PI*p)*al);
   }
   /* lúc vào trận: cán cân bừng to + cột sáng phán xét giáng xuống + ấn pháp toả quạt */
   if(a>0&&e!=null&&e<1){
    const k=cl(e,0,1);
    scales(g,E,x,GY-84,40+30*k,P,T,a*(1-k)*.9);
    beam(g,E,x,GY,150,10+8*k,P,T,a*(1-k),77);
    for(let j=0;j<7;j++){
     const an=-Math.PI/2+(j-3)*.45,d=10+k*80;
     seal(g,E,x+Math.cos(an)*d,GY-40+Math.sin(an)*d,4.4,k*6+j,P,a*(1-k));
    }
   }
   /* bụi vàng bốc lên */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<16;k++){
    const p=(T*(.06+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*68+Math.sin(T*1.4+k*1.7)*5,py=GY-6-p*124;
    g.fillStyle=E.rgba(k%3?P.light:P.main,Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,12,125);
  }finally{g.restore()}
 };
})();
