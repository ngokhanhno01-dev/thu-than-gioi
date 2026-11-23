/* 62b-hut-vfx.js — VFX HÚT / THU PHỤC LINH THÚ của Ngự Thú Châu (6 bậc).
   Nạp tự động bởi 62-bat-thu.js (TTGBAT). Chưa nạp xong / lỗi => 62-bat-thu.js dùng 6 hiệu ứng hút cũ làm dự phòng.

   KIẾN TRÚC
   - Canvas 2D, cộng sáng (globalCompositeOperation='lighter'). KHÔNG cấp phát đối tượng trong vòng vẽ:
     mọi dải/hạt là "slot" tái chế theo pha (phase recycling) trên bộ đệm Float32Array dựng sẵn (object pool);
     sprite ánh sáng vẽ sẵn 1 lần / màu rồi drawImage (không createRadialGradient mỗi frame).
   - Quỹ đạo: Bezier bậc 3 (S-curve) từ Linh Thú -> miệng châu + xoắn ốc (vortex thu nhỏ bán kính) + sóng sin.
   - Gia tốc: đầu dải/hạt đi theo easeInCubic (hoặc easeInExpo cho Thiên Hà / Hỗn Độn): ban đầu chậm, sát châu lao nhanh.
   - 3 lớp: (1) dải lụa/đuôi sáng  (2) hạt linh khí  (3) tâm phong ấn (lõi xoáy). + vòng trận pháp, sóng xung kích, ép phong ấn.
   Dùng: TTGHUT.open(...) lúc châu mở · TTGHUT.back(...) trước khi vẽ ảnh châu · TTGHUT.front(...) sau khi vẽ ảnh châu ·
         TTGHUT.orbScale(...) nhịp nảy 1.0->1.18->1.0 · TTGHUT.beast(...) độ rung của thú (cho enemyFx). */
(function(root){
'use strict';
var TAU=6.283185307,PI=3.141592653;

/* ================= CẤU HÌNH 6 BẬC (chỉnh ở đây) =================
   a,b,core : màu chính / màu viền-quầng / màu lõi        mode: 'ribbon' | 'vine' | 'bolt'
   n: số dải   curv: độ cong Bezier   turns: số vòng xoắn   r0: bán kính xoắn đầu   wA,wF,wS: sóng sin (biên độ, số sóng, tốc độ)
   spin: tốc độ xoáy   jit: rung ngọn lửa   width: độ dày dải   trail: độ dài đuôi (0..1 của chu kỳ)   cyc: chu kỳ ms   expo: easeInExpo
   parts: [{kind,n,cyc,ro,size,lift?}] lớp hạt   vortex: {arms,spin,hole}   bolt: {n,amp,w}   rainbow/pair: hue-shift / xoắn kép */
var TIERS=[
 {id:'thuy',ten:'Thủy',a:'#00E5FF',b:'#0077FF',core:'#FFFFFF',mode:'ribbon',n:6,curv:.22,turns:1.5,r0:30,wA:8,wF:2.2,wS:.004,spin:.0021,jit:0,width:4,trail:.55,cyc:700,expo:0,
  parts:[{kind:'bubble',n:14,cyc:780,ro:8,size:3.6}],vortex:{arms:3,spin:.0026,hole:0}},
 {id:'moc',ten:'Mộc',a:'#00E676',b:'#76FF03',core:'#E8F5E9',mode:'vine',n:5,curv:.17,turns:1.1,r0:22,wA:10,wF:3.4,wS:.0035,spin:.0016,jit:0,width:3,trail:.45,cyc:760,expo:0,
  parts:[{kind:'leaf',n:15,cyc:880,ro:10,size:6.2},{kind:'mote',n:10,cyc:1000,ro:16,size:2.6}],vortex:{arms:4,spin:.002,hole:0}},
 {id:'hoa',ten:'Hỏa',a:'#FF9100',b:'#FF1744',core:'#FFD600',mode:'ribbon',n:6,curv:.2,turns:.9,r0:26,wA:5,wF:3,wS:.006,spin:.0022,jit:7,width:5.2,trail:.5,cyc:640,expo:0,
  parts:[{kind:'ember',n:24,cyc:760,ro:6,size:2.4,lift:40}],vortex:{arms:3,spin:.0034,hole:0}},
 {id:'loi',ten:'Lôi',a:'#D500F9',b:'#651FFF',core:'#E0F7FA',mode:'bolt',n:5,curv:.12,turns:.5,r0:12,wA:0,wF:1,wS:0,spin:.001,jit:0,width:1,trail:.3,cyc:300,expo:0,
  bolt:{n:5,amp:17,w:1},parts:[{kind:'spark',n:20,cyc:340,ro:14,size:5}],vortex:{arms:5,spin:.0042,hole:0}},
 {id:'thienha',ten:'Thiên Hà',a:'#7C4DFF',b:'#1A237E',core:'#FFFFFF',pink:'#FF4081',mode:'ribbon',n:6,curv:.2,turns:2.6,r0:44,wA:5,wF:2.6,wS:.003,spin:.0014,jit:0,width:5.4,trail:.6,cyc:900,expo:1,
  parts:[{kind:'star',n:24,cyc:1000,ro:12,size:7}],vortex:{arms:5,spin:.0022,hole:1}},
 {id:'hondon',ten:'Hỗn Độn',a:'#FFFFFF',b:'#FFFFFF',core:'#FFFFFF',rainbow:1,pair:1,mode:'ribbon',n:10,curv:.2,turns:2.3,r0:38,wA:4,wF:2.4,wS:.003,spin:.0018,jit:0,width:3.8,trail:.55,cyc:860,expo:1,
  bolt:{n:2,amp:7,w:.6},parts:[{kind:'mote',n:26,cyc:960,ro:12,size:6}],vortex:{arms:6,spin:.003,hole:1}}
];
var CFG={q:1,beastR:36,seal:.8};   /* q: hệ số số lượng hạt (tự giảm khi máy yếu) */
for(var ti=0;ti<TIERS.length;ti++)TIERS[ti].seed=ti*5+1;

/* ================= TIỆN ÍCH ================= */
function cl(x){return x<0?0:(x>1?1:x);}
function outC(x){x=1-cl(x);return 1-x*x*x;}
function hsh(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function ease(T,x){return T.expo?.06*x+.94*(x<=0?0:Math.pow(2,10*x-10)):x*x*x;}   /* easeInExpo / easeInCubic */
var RB=[];for(var hi=0;hi<36;hi++)RB.push('hsl('+(hi*10)+',100%,60%)');
function rbIdx(h){return (((h/10)|0)%36+36)%36;}
function tier(cap){return TIERS[(cap>=1&&cap<=TIERS.length?cap:1)-1];}

/* ---- sprite ánh sáng dựng sẵn (1 lần / màu) ---- */
var GL={},DARK=null;
function mk(sz){if(typeof document==='undefined')return null;var c=document.createElement('canvas');c.width=c.height=sz;return c;}
function glowSpr(col){
  var s=GL[col];if(s!==undefined)return s;
  var c=mk(64);if(!c){GL[col]=null;return null;}
  var g=c.getContext('2d'),m;
  g.fillStyle=col;g.fillRect(0,0,64,64);g.globalCompositeOperation='destination-in';
  m=g.createRadialGradient(32,32,0,32,32,32);m.addColorStop(0,'rgba(255,255,255,1)');m.addColorStop(.3,'rgba(255,255,255,.55)');m.addColorStop(.65,'rgba(255,255,255,.14)');m.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle=m;g.fillRect(0,0,64,64);GL[col]=c;return c;
}
function gl(ctx,col,x,y,sz,al){
  if(al<=.004)return;var s=glowSpr(col);ctx.globalAlpha=al>1?1:al;
  if(s)ctx.drawImage(s,x-sz*.5,y-sz*.5,sz,sz);
  else{ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,sz*.25,0,TAU);ctx.fill();}
}
function darkSpr(){
  if(DARK!==null)return DARK;var c=mk(64);if(!c){DARK=false;return DARK;}
  var g=c.getContext('2d'),m=g.createRadialGradient(32,32,0,32,32,32);
  m.addColorStop(0,'rgba(4,0,12,.95)');m.addColorStop(.6,'rgba(12,4,30,.6)');m.addColorStop(1,'rgba(12,4,30,0)');g.fillStyle=m;g.fillRect(0,0,64,64);DARK=c;return c;
}
function star4(ctx,x,y,r,rot){ctx.beginPath();for(var i=0;i<8;i++){var a=rot+i*.7854,rr=i%2?r*.28:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();}

/* ================= POOL (bộ đệm dựng sẵn) ================= */
var SEG=15,SEGB=12;
var PX=new Float32Array(SEG+1),PY=new Float32Array(SEG+1),NX=new Float32Array(SEG+1),NY=new Float32Array(SEG+1),PW=new Float32Array(SEG+1);
var SB=new Float32Array(16*12);          /* trạng thái hình học mỗi dải (stride 12) */
var O=new Float64Array(6);               /* kết quả curve(): x,y,nx,ny,depth */
var BJ={dx:0,dy:0};                      /* rung của thú (tái dùng) */
var perf={last:0,slow:0};

/* ================= HÌNH HỌC: Bezier bậc 3 + xoắn ốc + sóng sin ================= */
function prep(T,n,ex,ey,Hx,Hy){
  var i,j,a,rs,p0x,p0y,p3x,p3y,dx,dy,L,nx,ny,dir,cv,b;
  for(i=0;i<n;i++){
    j=T.pair?(i>>1):i;a=j*2.399+.6;rs=12+10*hsh(j+T.seed);
    p0x=ex+Math.cos(a)*rs;p0y=ey+Math.sin(a)*rs*.9;p3x=Hx+(hsh(i+T.seed*3)-.5)*5;p3y=Hy+(hsh(i+T.seed*7)-.5)*5;
    dx=p3x-p0x;dy=p3y-p0y;L=Math.sqrt(dx*dx+dy*dy)||1;nx=-dy/L;ny=dx/L;dir=(j%2)?1:-1;cv=T.curv*(.8+.4*hsh(j*3+T.seed));
    b=i*12;SB[b]=p0x;SB[b+1]=p0y;
    SB[b+2]=p0x+dx*.28+nx*L*cv*dir;SB[b+3]=p0y+dy*.28+ny*L*cv*dir;      /* điểm điều khiển 1 */
    SB[b+4]=p0x+dx*.72-nx*L*cv*.55*dir;SB[b+5]=p0y+dy*.72-ny*L*cv*.55*dir;   /* điểm điều khiển 2 (ngược chiều => đường chữ S) */
    SB[b+6]=p3x;SB[b+7]=p3y;SB[b+8]=T.r0*(.8+.4*hsh(j+9));
    SB[b+9]=T.pair?(j*1.7+(i&1)*PI):(i*2.1+hsh(i+T.seed)*2);
  }
}
function curve(T,i,u,ts){
  var b=i*12,p0x=SB[b],p0y=SB[b+1],c1x=SB[b+2],c1y=SB[b+3],c2x=SB[b+4],c2y=SB[b+5],p3x=SB[b+6],p3y=SB[b+7],R0=SB[b+8],ph=SB[b+9],
      v=1-u,a=v*v*v,bb=3*v*v*u,c=3*v*u*u,d=u*u*u,
      x=a*p0x+bb*c1x+c*c2x+d*p3x,y=a*p0y+bb*c1y+c*c2y+d*p3y,
      dx=3*v*v*(c1x-p0x)+6*v*u*(c2x-c1x)+3*u*u*(p3x-c2x),dy=3*v*v*(c1y-p0y)+6*v*u*(c2y-c1y)+3*u*u*(p3y-c2y),
      L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L,th=ph+T.turns*TAU*u-ts*T.spin,
      off=R0*v*Math.sqrt(v)*Math.sin(th)+T.wA*v*Math.sin(u*T.wF*TAU+ph*1.7-ts*T.wS);
  if(T.jit)off+=T.jit*v*(Math.sin(u*19+ts*.021+ph*3)*.55+Math.sin(u*43-ts*.037+ph)*.45);   /* bập bùng */
  O[0]=x+nx*off;O[1]=y+ny*off;O[2]=nx;O[3]=ny;O[4]=Math.cos(th);return O;
}

/* ================= LỚP 1: DẢI LỤA / ĐUÔI SÁNG ================= */
function chunk(ctx,s0,s1,wm){
  var k;ctx.beginPath();
  for(k=s0;k<=s1;k++){if(k===s0)ctx.moveTo(PX[k]+NX[k]*PW[k]*wm,PY[k]+NY[k]*PW[k]*wm);else ctx.lineTo(PX[k]+NX[k]*PW[k]*wm,PY[k]+NY[k]*PW[k]*wm);}
  for(k=s1;k>=s0;k--)ctx.lineTo(PX[k]-NX[k]*PW[k]*wm,PY[k]-NY[k]*PW[k]*wm);
  ctx.closePath();ctx.fill();
}
function ribbonPass(ctx,T,i,ts,th,tt,al,wScale){
  var k,u,tp,s,cA,cB,cC,hu,w0=T.width*wScale,uh=ease(T,th),ut=ease(T,tt);
  for(k=0;k<=SEG;k++){
    u=ut+(uh-ut)*k/SEG;curve(T,i,u,ts);PX[k]=O[0];PY[k]=O[1];NX[k]=O[2];NY[k]=O[3];   /* mẫu đều theo QUÃNG ĐƯỜNG (không theo thời gian) => mượt kể cả khi easing rất dốc */
    tp=k/SEG;PW[k]=w0*Math.pow(tp,.8)*(.62+.38*(1-u));   /* dày ở đầu, mảnh dần về đuôi */
  }
  for(s=0;s<3;s++){
    tp=(s+1)/3;
    if(T.rainbow){hu=rbIdx((i*30)+uh*300+s*30+ts/9);cA=RB[hu];cB=RB[(hu+4)%36];}else{cA=T.a;cB=T.b;}
    cC=T.core;
    ctx.fillStyle=cB;ctx.globalAlpha=.17*al*tp;chunk(ctx,s*5,s*5+5,2.5);       /* quầng */
    ctx.fillStyle=cA;ctx.globalAlpha=.72*al*tp;chunk(ctx,s*5,s*5+5,1);         /* thân */
    ctx.fillStyle=cC;ctx.globalAlpha=.85*al*tp;chunk(ctx,s*5,s*5+5,.32);       /* lõi trắng */
  }
}
function ribbons(ctx,T,ts,t,I,n){
  var i,th,tt,al,j,rv,u0,k,s;
  for(i=0;i<n;i++){
    j=T.pair?(i>>1):i;th=((t/T.cyc)+j/(T.pair?(n>>1):n))%1;
    tt=Math.max(0,th-T.trail);al=I*Math.min(1,th*6)*Math.min(1,(1-th)*9);
    if(al<=.01)continue;
    if(T.mode==='vine'){   /* dây leo: mọc từ châu ra phía thú rồi giữ nguyên, ánh sáng chạy về châu */
      rv=outC(t/260);if(rv>0){
        for(k=0;k<=SEG;k++){u0=1-rv*(1-k/SEG);curve(T,i,u0,ts);PX[k]=O[0];PY[k]=O[1];NX[k]=O[2];NY[k]=O[3];PW[k]=(1.3+1.6*(1-u0))*(.35+.65*Math.sin(PI*(k/SEG*.9+.05)));}
        for(s=0;s<3;s++){ctx.fillStyle='#0d3a1a';ctx.globalAlpha=.55*I;chunk(ctx,s*5,s*5+5,1.5);ctx.fillStyle=T.a;ctx.globalAlpha=.5*I;chunk(ctx,s*5,s*5+5,.9);}
      }
    }
    ribbonPass(ctx,T,i,ts,th,tt,al,T.mode==='vine'?1.15:1);
  }
}

/* ================= SÉT GẤP KHÚC (bậc Lôi + vài tia nhỏ ở Hỗn Độn) ================= */
function bolts(ctx,T,B,ts,t,I,ex,ey,Hx,Hy){
  var n=Math.ceil(B.n*(CFG.q<1?.7:1)),i,per=250,off,idx,tau,seed,uh,k,u,jg,al,x,v,pk,fx,fy,fa,col,hu;
  ctx.lineCap='round';ctx.lineJoin='round';
  for(i=0;i<n;i++){
    off=i*per/n+hsh(i)*60;idx=Math.floor((t+off)/per);tau=((t+off)%per)/per;seed=idx*37+i*11;
    uh=ease(T,Math.min(1,tau/.62));al=(tau<.62?1:1-(tau-.62)/.38)*I;if(al<=.02||uh<=.002)continue;
    for(k=0;k<=SEGB;k++){
      u=uh*k/SEGB;curve(T,i,u,ts);v=1-u;
      jg=(hsh(seed+k*7.7)-.5)*2*B.amp*Math.sin(PI*k/SEGB)*(.4+.6*v)+(hsh(seed+k*3+Math.floor(ts/45))-.5)*4*v;   /* gấp khúc + chập chờn */
      PX[k]=O[0]+O[2]*jg;PY[k]=O[1]+O[3]*jg;
    }
    hu=T.rainbow?rbIdx(i*140+ts/6):0;
    for(k=0;k<3;k++){
      col=T.rainbow?(k===2?'#ffffff':RB[(hu+k*5)%36]):(k===0?T.b:(k===1?T.a:T.core));
      ctx.strokeStyle=col;ctx.lineWidth=(k===0?8:(k===1?3:1.2))*B.w;ctx.globalAlpha=(k===0?.26:(k===1?.8:1))*al;
      ctx.beginPath();for(x=0;x<=SEGB;x++){if(x)ctx.lineTo(PX[x],PY[x]);else ctx.moveTo(PX[x],PY[x]);}ctx.stroke();
    }
    for(k=0;k<2;k++){   /* nhánh rẽ */
      pk=2+Math.floor(hsh(seed+k*5)*6);fa=hsh(seed+k*9)*TAU;fx=PX[pk]+Math.cos(fa)*22;fy=PY[pk]+Math.sin(fa)*22;
      ctx.strokeStyle=T.rainbow?RB[(hu+10)%36]:T.a;ctx.lineWidth=1.5*B.w;ctx.globalAlpha=.7*al;
      ctx.beginPath();ctx.moveTo(PX[pk],PY[pk]);ctx.lineTo((PX[pk]+fx)/2+(hsh(seed+k)-.5)*9,(PY[pk]+fy)/2+(hsh(seed+k+4)-.5)*9);ctx.lineTo(fx,fy);ctx.stroke();
    }
    if(tau>.5&&tau<.75)gl(ctx,T.rainbow?RB[hu]:T.a,Hx,Hy,40+30*hsh(seed),.55*I);   /* giật điện tại miệng châu */
  }
}

/* ================= LỚP 2: HẠT LINH KHÍ ================= */
function leaf(ctx,x,y,s,rot){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.beginPath();ctx.moveTo(-s,0);ctx.quadraticCurveTo(0,-s*.8,s,0);ctx.quadraticCurveTo(0,s*.8,-s,0);ctx.fill();ctx.restore();}
var LEAF_COL=['#8de85a','#00E676','#76FF03','#35a34a'],STAR_COL=['#ffffff','#bcd8ff','#d6b0ff','#FF4081'],EMB_COL=['#FFD600','#FF9100','#ff6a1a','#ffe08a'];
function particles(ctx,T,P,ts,t,I,nStr){
  var cnt=Math.max(3,Math.ceil(P.n*CFG.q)),j,i,tau,u,x,y,o2,dep,sc,al,hu,col,rot,k=P.kind,fl;
  for(j=0;j<cnt;j++){
    i=j%nStr;tau=((t/P.cyc)+j*.6180339)%1;u=ease(T,tau);curve(T,i,u,ts);
    o2=P.ro*(1-u)*Math.sin(tau*TAU*3+j*1.3);x=O[0]+O[2]*o2;y=O[1]+O[3]*o2;dep=O[4];
    if(P.lift){y-=P.lift*4*tau*(1-tau)*(.6+.4*hsh(j));x+=Math.sin(ts*.02+j)*1.6*(1-u);}   /* tàn tro vọt lên rồi bị hút xoáy */
    sc=P.size*(1+.25*dep)*(1-u*.35);al=I*Math.min(1,tau*8)*Math.min(1,(1-tau)*10);if(al<=.01)continue;
    if(k==='bubble'){
      gl(ctx,T.b,x,y,sc*5,al*.5);ctx.globalAlpha=al*.9;ctx.fillStyle='rgba(170,240,255,.2)';ctx.strokeStyle='#e8ffff';ctx.lineWidth=1.1;
      ctx.beginPath();ctx.arc(x,y,sc,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x-sc*.35,y-sc*.35,sc*.28,0,TAU);ctx.fill();
    }else if(k==='leaf'){
      rot=Math.atan2(-O[2],O[3])+Math.sin(ts/170+j*2)*.9;ctx.globalAlpha=al*.95;ctx.fillStyle=LEAF_COL[j&3];leaf(ctx,x,y,sc*(.8+.4*hsh(j)),rot);
    }else if(k==='ember'){
      col=EMB_COL[j&3];gl(ctx,col,x,y,sc*6,al*.8);ctx.globalAlpha=al;ctx.fillStyle='#fff6c8';ctx.beginPath();ctx.arc(x,y,sc*.45,0,TAU);ctx.fill();
    }else if(k==='star'){
      col=STAR_COL[j&3];fl=.55+.45*Math.sin(ts/90+j*3);gl(ctx,col,x,y,sc*3.4,al*.5*fl);ctx.globalAlpha=al*fl;ctx.fillStyle=col;star4(ctx,x,y,sc*fl,ts/700+j);ctx.fill();ctx.fillStyle='#fff';star4(ctx,x,y,sc*fl*.45,ts/700+j);ctx.fill();
    }else if(k==='spark'){
      fl=hsh(Math.floor(ts/50)+j*5);rot=fl*TAU;ctx.strokeStyle=fl>.5?'#E0F7FA':'#D500F9';ctx.lineWidth=1.4;ctx.globalAlpha=al*(.5+.5*fl);ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(rot)*sc*1.6,y+Math.sin(rot)*sc*1.6);ctx.stroke();
    }else{   /* 'mote': hạt / sao đổi màu */
      hu=T.rainbow?rbIdx(u*300+ts/6+j*40):0;col=T.rainbow?RB[hu]:T.b;
      gl(ctx,col,x,y,sc*3.2,al*.7);ctx.globalAlpha=al;ctx.fillStyle=T.rainbow?'#fff':T.core;
      if(T.rainbow&&(j&1)){star4(ctx,x,y,sc*(.6+.4*Math.sin(ts/80+j)),ts/500+j);ctx.fill();}else{ctx.beginPath();ctx.arc(x,y,sc*.32,0,TAU);ctx.fill();}
    }
  }
}

/* ================= LỚP 3: TÂM PHONG ẤN (lõi xoáy) ================= */
function armCol(T,k,ts){return T.rainbow?RB[rbIdx(k*60+ts/6)]:(k&1?T.b:T.a);}
function vortexCore(ctx,T,ts,t,Hx,Hy,p,I){
  var V=T.vortex,R=15+15*p,s,k,ang,r,x,y,pulse=1+.07*Math.sin(ts/70),ds;
  if(V.hole){ds=darkSpr();if(ds){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=(.55+.4*p)*I;ctx.drawImage(ds,Hx-R*1.35,Hy-R*1.35,R*2.7,R*2.7);ctx.globalCompositeOperation='lighter';}}
  gl(ctx,T.rainbow?RB[rbIdx(ts/8)]:T.b,Hx,Hy,R*4.6*pulse,(.3+.4*p)*I);        /* bloom ngoài */
  if(T.pink)gl(ctx,T.pink,Hx,Hy,R*3.2,(.2+.3*p)*I);
  ctx.lineCap='round';ctx.lineWidth=2;
  for(k=0;k<V.arms;k++){   /* cánh xoáy log-spiral thu về tâm */
    ctx.strokeStyle=armCol(T,k,ts);ctx.globalAlpha=(.5+.25*p)*I;ctx.beginPath();
    for(s=0;s<=12;s++){r=R*2.3*(1-s/12)+1.5;ang=k*TAU/V.arms-ts*V.spin+s/12*2.7;x=Hx+Math.cos(ang)*r;y=Hy+Math.sin(ang)*r*.9;if(s)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
    ctx.stroke();
  }
  gl(ctx,T.a,Hx,Hy,R*2.3*pulse,(.5+.35*p)*I);
  gl(ctx,T.core,Hx,Hy,R*1.1,(.45+.5*p)*I);                                     /* lõi trắng chói */
}
function magicRing(ctx,T,ts,Hx,Hy,R,al,rot){
  var k,a,c0,c1;
  ctx.lineWidth=1.6;ctx.strokeStyle=T.rainbow?RB[rbIdx(ts/9)]:T.a;ctx.globalAlpha=al;ctx.beginPath();ctx.arc(Hx,Hy,R,0,TAU);ctx.stroke();
  ctx.lineWidth=1;ctx.globalAlpha=al*.7;ctx.beginPath();ctx.arc(Hx,Hy,R*.82,0,TAU);ctx.stroke();
  ctx.strokeStyle=T.rainbow?RB[rbIdx(ts/9+120)]:T.b;ctx.lineWidth=2;ctx.globalAlpha=al*.9;ctx.beginPath();
  for(k=0;k<12;k++){a=rot+k*TAU/12;c0=Math.cos(a);c1=Math.sin(a);ctx.moveTo(Hx+c0*R*.9,Hy+c1*R*.9);ctx.lineTo(Hx+c0*R*1.1,Hy+c1*R*1.1);}
  ctx.stroke();
  ctx.strokeStyle=T.core;ctx.lineWidth=1;ctx.globalAlpha=al*.6;ctx.beginPath();   /* hai tam giác chồng (ấn chú) xoay ngược */
  for(k=0;k<6;k++){a=-rot*1.4+(k%3)*TAU/3+(k>2?PI/3:0);c0=Hx+Math.cos(a)*R*.74;c1=Hy+Math.sin(a)*R*.74;if(k%3===0)ctx.moveTo(c0,c1);else ctx.lineTo(c0,c1);if(k%3===2)ctx.closePath();}
  ctx.stroke();
}
function seal(ctx,T,ts,Hx,Hy,u){   /* bung tia sáng ở tâm khi nuốt trọn */
  var e=outC(u),k,a,r0,r1,f=1-u;
  gl(ctx,'#ffffff',Hx,Hy,30+130*e,f*.95);gl(ctx,T.rainbow?RB[rbIdx(ts/5)]:T.a,Hx,Hy,24+110*e,f*.8);
  ctx.strokeStyle=T.core;ctx.lineCap='round';ctx.lineWidth=2.4*f+.4;ctx.globalAlpha=f;ctx.beginPath();
  for(k=0;k<10;k++){a=k*.6283+.3;r0=8+14*e;r1=14+64*e;ctx.moveTo(Hx+Math.cos(a)*r0,Hy+Math.sin(a)*r0);ctx.lineTo(Hx+Math.cos(a)*r1,Hy+Math.sin(a)*r1);}
  ctx.stroke();
  ctx.strokeStyle=T.rainbow?RB[rbIdx(ts/5+90)]:T.a;ctx.lineWidth=3*f;ctx.globalAlpha=f*.8;ctx.beginPath();ctx.arc(Hx,Hy,8+72*e,0,TAU);ctx.stroke();
}

/* ================= PHẢN HỒI CỦA LINH THÚ ================= */
function beastFx(ctx,T,ts,t,dur,ex,ey,Hx,Hy,p,I){
  var q=p*p,s=1-p*.92,bx=ex+(Hx-ex)*q,by=ey+(Hy-ey)*q,R=CFG.beastR*s,fl=.7+.3*Math.sin(ts/55),ang,st,col=T.rainbow?RB[rbIdx(ts/7)]:T.a;
  gl(ctx,T.b,bx,by,R*3.6,.34*I*(1-p*.4));                                     /* quầng nền */
  ctx.lineCap='round';ctx.strokeStyle=T.b;ctx.lineWidth=6*s+1;ctx.globalAlpha=.18*I*fl;ctx.beginPath();ctx.ellipse(bx,by,R*.8,R,0,0,TAU);ctx.stroke();   /* rim glow 3 lớp */
  ctx.strokeStyle=col;ctx.lineWidth=2.4*s+.6;ctx.globalAlpha=.55*I*fl;ctx.beginPath();ctx.ellipse(bx,by,R*.8,R,0,0,TAU);ctx.stroke();
  ctx.strokeStyle=T.core;ctx.lineWidth=1;ctx.globalAlpha=.7*I*fl;ctx.beginPath();ctx.ellipse(bx,by,R*.8,R,0,0,TAU);ctx.stroke();
  /* linh hồn bị kéo giãn về phía châu */
  st=cl((p-.05)/.9);if(st>0){ang=Math.atan2(Hy-by,Hx-bx);ctx.save();ctx.translate(bx,by);ctx.rotate(ang);ctx.scale(1+st*2.4,1-st*.3);gl(ctx,col,R*.25*st,0,R*2.4,.42*I*(1-st*.3));ctx.restore();}
}
function beast(ts,t,dur){   /* độ rung nhẹ của Linh Thú khi bị hút (dùng trong enemyFx) */
  var p=cl(t/dur),a=2.4*(1-p*.5)*cl(t/90);BJ.dx=Math.sin(ts/23)*a;BJ.dy=Math.sin(ts/31+1)*a*.6;return BJ;
}

/* ================= PHẢN HỒI CỦA NGỰ THÚ CHÂU ================= */
function orbScale(ts,t,dur){   /* nhịp tim lúc hút, rồi nảy 1.0 -> 1.18 -> 1.0 khi nuốt trọn */
  var u2=cl((t/dur-CFG.seal)/(1-CFG.seal));return 1+.03*Math.sin(ts/90)*(1-u2)+.18*Math.sin(PI*u2);
}
function open(ctx,ts,t,cap,Hx,Hy,dur){   /* lúc kích hoạt (châu mở): trận pháp xoay + sóng xung kích */
  var T=tier(cap),p=cl(t/dur),e=outC(p),R;
  ctx.save();ctx.globalCompositeOperation='lighter';
  R=20+26*e;magicRing(ctx,T,ts,Hx,Hy,R,.85*(1-p*p)*Math.min(1,p*5),ts/900);
  ctx.strokeStyle=T.rainbow?RB[rbIdx(ts/6)]:T.a;ctx.lineWidth=3*(1-p)+.5;ctx.globalAlpha=(1-p)*.9;ctx.beginPath();ctx.arc(Hx,Hy,8+66*e,0,TAU);ctx.stroke();   /* sóng xung kích */
  gl(ctx,T.b,Hx,Hy,60+30*p,.3+.2*p);
  ctx.restore();
}

/* ================= ĐIỂM VÀO ================= */
function adapt(ts){   /* máy yếu (frame > 26ms liên tục) -> giảm số hạt */
  if(perf.last){var d=ts-perf.last;if(d>26&&d<200)perf.slow++;else if(perf.slow>0)perf.slow--;if(perf.slow>12&&CFG.q>.55)CFG.q=.6;}
  perf.last=ts;
}
function inten(t,dur){var p=cl(t/dur);return cl(t/130)*(1-cl((p-CFG.seal)/(1-CFG.seal))*.85);}
/* LỚP SAU (trước khi vẽ ảnh châu): thú + trận pháp */
function back(ctx,ts,t,cap,ex,ey,Hx,Hy,dur){
  var T=tier(cap),p=cl(t/dur),I=inten(t,dur);adapt(ts);
  ctx.save();ctx.globalCompositeOperation='lighter';
  beastFx(ctx,T,ts,t,dur,ex,ey,Hx,Hy,p,I);
  magicRing(ctx,T,ts,Hx,Hy,(46-16*p)*(1+.03*Math.sin(ts/70)),.5*I,ts/900);
  ctx.restore();return true;
}
/* LỚP TRƯỚC (sau khi vẽ ảnh châu): dải lụa, hạt, lõi xoáy, phong ấn */
function front(ctx,ts,t,cap,ex,ey,Hx,Hy,dur){
  var T=tier(cap),p=cl(t/dur),I=inten(t,dur),n=T.mode==='bolt'?T.bolt.n:Math.max(2,Math.ceil(T.n*(CFG.q<1?.75:1))),i,u2=(p-CFG.seal)/(1-CFG.seal);
  if(T.pair&&(n&1))n++;
  ctx.save();ctx.globalCompositeOperation='lighter';
  prep(T,T.n,ex,ey,Hx,Hy);
  if(T.mode==='bolt')bolts(ctx,T,T.bolt,ts,t,I,ex,ey,Hx,Hy);else ribbons(ctx,T,ts,t,I,n);
  if(T.mode!=='bolt'&&T.bolt)bolts(ctx,T,T.bolt,ts,t,I*.8,ex,ey,Hx,Hy);
  for(i=0;i<T.parts.length;i++)particles(ctx,T,T.parts[i],ts,t,I,Math.max(n,2));
  vortexCore(ctx,T,ts,t,Hx,Hy,p,I);
  if(u2>0)seal(ctx,T,ts,Hx,Hy,Math.min(1,u2));
  ctx.restore();return true;
}

root.TTGHUT={CFG:CFG,TIERS:TIERS,open:open,back:back,front:front,orbScale:orbScale,beast:beast,glowSpr:glowSpr};
})(typeof window!=='undefined'?window:globalThis);
