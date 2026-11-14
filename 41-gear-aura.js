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
 REG.thunder=function(g,x,q,T,e,E){
  const P=THUNDER,{a,al}=level(q,T,4),grow=e==null?1:cl(e/.7,0,1),drop=e==null?1:cl(e/.3,0,1);
  g.save();
  try{
   halo(g,E,x,P,T,al,a,q);
   circle(g,E,x,P,T,al,{r:58,ph:4.3,runeDir:-1,cracks:false});
   /* vết nứt đất đen + ánh vàng/đỏ (to hơn bản dùng chung) */
   g.save();g.lineCap='round';g.lineJoin='round';
   for(let k=0;k<12;k++){
    const an=hash(k*5.7+4)*TAU,r0=58*(.95+hash(k)*.08),len=14+hash(k+9)*20,pts=[gp(x,an,r0)];
    for(let s=1;s<=3;s++)pts.push(gp(x,an+(hash(k*7+s)-.5)*.36,r0+len*s/3));
    g.strokeStyle=E.rgba('#120b06',.85*al);g.lineWidth=1.8;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
    g.globalCompositeOperation='lighter';g.strokeStyle=E.rgba(k%3?P.main:'#ff6a1c',.5*al);g.lineWidth=.9;g.stroke();g.globalCompositeOperation='source-over';
   }
   g.restore();
   /* đá nứt dung nham hai bên + sau trận pháp */
   const rocks=[];
   for(let k=0;k<9;k++){
    const side=k%2?1:-1,t=hash(k*2.3+1),an=side>0?-.55+t*1.5:Math.PI-(-.55+t*1.5),rp=62+hash(k+5)*12,p=gp(x,an,rp);
    rocks.push({x:p[0],y:p[1],s:5+hash(k+8)*5,k:k*3+1});
   }
   rocks.sort((u,v)=>u.y-v.y);
   rocks.filter(r=>r.y<GY).forEach(r=>rock(g,E,r.x,r.y,r.s*grow,r.k,al,T));
   dswirl(g,E,x,T,al,{n:6,H:112,R:50,turns:.8,spin:1.3,wmax:16,ph:.6});
   dswirl(g,E,x,T,al*.8,{n:3,H:92,R:60,turns:.7,spin:-.95,wmax:10,ph:2.1});
   rocks.filter(r=>r.y>=GY).forEach(r=>rock(g,E,r.x,r.y,r.s*grow,r.k,al,T));
   /* trụ sét vàng giáng từ trời xuống tâm trận pháp */
   const fk=Math.floor(T*13),top=GY-170,bot=top+(GY-4-top)*drop,sw=1+a*.7;
   g.save();g.translate(x,GY);g.scale(1,SQ);E.glow(g,0,0,34*sw,P.light,.55*al*(.85+.15*Math.sin(T*17)),P.core);g.restore();
   const col=zig(x+(hash(fk)-.5)*6,top,x,bot,fk,16,6);
   E.ribbon(g,col,q2=>(3+11*Math.pow(q2,.7))*sw*(.9+.1*Math.sin(T*21)),P.main,.5*al,{core:P.light});
   bolt(g,E,col,3.2*sw,P,al);
   bolt(g,E,zig(x,top+10,x+(hash(fk+3)-.5)*8,bot,fk+7,14,9),1.5,P,al*.8);
   /* cành sét rẽ nhánh quanh lốc xoắn, mỗi cành sống ~1s rồi đổi hình */
   for(let k=0;k<12;k++){
    const per=.8+hash(k*1.7)*.6,tt=T+hash(k*2.9)*7,c=Math.floor(tt/per),p=tt/per-c;
    if(p>.72)continue;
    const fa=Math.pow(Math.sin(Math.PI*p/.72),.5)*(.8+.2*Math.sin(T*25+k))*al,sd=k*11+c*3.7,
     an=(k/12)*TAU+hash(sd)*.5,ox=x+Math.cos(an)*30,oy=GY-24-hash(sd+2)*88,dir=Math.cos(an)>0?-.35:Math.PI+.35;
    tree(g,E,ox,oy,dir+(hash(sd+4)-.5)*1.1+(Math.sin(an)<0?-.4:.3),30+hash(sd+6)*30,sd,1.6,P,fa);
   }
   /* điện chạy trên mặt đất theo rìa trận pháp */
   for(let k=0;k<4;k++){
    const f=Math.floor(T*9+k*3),vis=hash(f*1.3+k)>.35;if(!vis)continue;
    const a1=hash(f+k*5)*TAU,pA=gp(x,a1,56),pB=gp(x,a1+.8+hash(f+9)*.7,60);
    bolt(g,E,zig(pA[0],pA[1],pB[0],pB[1],f+k,6,3),1.4,P,al*.9);
   }
   /* lúc vào trận: các tia sét bổ từ trời xuống quanh thú */
   if(a>0&&e!=null&&e<1){
    const ef=Math.floor(e*11);
    for(let k=0;k<5;k++){
     const bx=x+(hash(ef*3+k)*2-1)*64,by=GY-6+(hash(ef+k*7)-.5)*8;
     bolt(g,E,zig(bx+(hash(ef+k)-.5)*30,GY-165,bx,by,ef*5+k,10,8),2,P,a*Math.pow(1-e,.6)*.95);
     E.glow(g,bx,by,12,P.light,.5*a*(1-e));
    }
   }
   /* mảnh sét vàng, vòng sáng nhỏ bay quanh */
   g.save();g.globalCompositeOperation='lighter';
   for(let k=0;k<12;k++){
    const an=T*.5*(k%2?1:-1)+k*.9,rr=36+hash(k)*34,px=x+Math.cos(an)*rr,py=GY-18-hash(k+3)*100+Math.sin(an)*8,s=2+hash(k+6)*2.6,tw=.55+.45*Math.sin(T*3+k*1.9);
    g.save();g.translate(px,py);g.rotate(an*2+k);
    if(k%4===0){g.strokeStyle=E.rgba(P.light,.85*al*tw);g.lineWidth=1.4;g.beginPath();g.arc(0,0,s*1.2,0,TAU);g.stroke()}
    else{g.fillStyle=E.rgba(k%2?P.light:P.core,.85*al*tw);g.beginPath();g.moveTo(-s*.5,-s*1.6);g.lineTo(s*.8,-s*.1);g.lineTo(-s*.1,0);g.lineTo(s*.5,s*1.6);g.lineTo(-s*.8,s*.1);g.lineTo(s*.1,0);g.closePath();g.fill()}
    g.restore();
   }
   /* tàn lửa vàng bốc lên */
   for(let k=0;k<14;k++){
    const p=(T*(.07+hash(k)*.06)+hash(k*3.1))%1,px=x+(hash(k*5.3)*2-1)*70,py=GY-6-p*122;
    g.fillStyle=E.rgba(k%3?P.light:'#ff9a2a',Math.sin(Math.PI*p)*.9*al);g.fillRect(px-1,py-1,2.4,2.4);
   }
   g.restore();
   sparks(g,E,x,P,T,al,12,125);
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
})();
