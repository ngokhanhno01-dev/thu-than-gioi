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
})();
