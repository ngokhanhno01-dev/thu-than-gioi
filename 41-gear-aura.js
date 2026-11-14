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

 /* Trận pháp: đĩa phát sáng, viền kép, dải rune quay, hình sao 6 cánh + hình thoi quay ngược, lõi sáng, vết nứt.
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
})();
