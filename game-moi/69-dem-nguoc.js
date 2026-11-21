/* 69-dem-nguoc.js - CHỮ "VS" GIỮA 2 KHUNG THÔNG TIN + ĐẾM NGƯỢC "3 · 2 · 1 · CHIẾN!" TRƯỚC KHI VÀO TRẬN.
   Chỉ vẽ bằng canvas (không dùng ảnh) nên đổi khung HUD sau này không phải làm lại.

   VS: vẽ ở khe giữa 2 khung (index.html truyền mép trong của khung trái x0, mép trong của khung phải x1, và tâm dọc y).
       Cỡ chữ TỰ CO theo bề rộng khe trừ lề CFG.vs.margin ở mỗi bên => đổi cỡ/kiểu khung (HM, hw trong index.html) thì VS tự co giãn, không đè lên viền khung.
       Muốn chừa lề nhiều/ít hơn: sửa CFG.vs.margin. Muốn to/nhỏ tối đa: CFG.vs.max / CFG.vs.min. Muốn hạ/nâng theo chiều dọc khung: CFG.vs.dy (0.45 = ngang hàng thanh máu).
   ĐẾM NGƯỢC: TTGDEM.start(callback) -> 3, 2, 1, CHIẾN! rồi gọi callback (index.html dùng để bắt đầu đánh). Mỗi nhịp: số lao vào từ rất to, rung nhẹ, sóng xung kích, tia sáng xoay, tia lửa tóe, nháy sáng; "CHIẾN!" có thêm vệt chém + 2 vòng sóng.
   Tăng/giảm thời gian: CFG.dur (ms mỗi nhịp). Đổi màu: bảng COL.
   API: TTGDEM.start(cb) | reset() | active() | under(ctx,ts,A) (vẽ nền tối + tia sáng, gọi TRƯỚC khung HUD) | draw(ctx,ts,A) (vẽ số, gọi SAU cùng) | vs(ctx,ts,x0,x1,y) | CFG
   A = {x,y,w,h,cx,cy} vùng khung trên (đơn vị game). */
(function(root){
'use strict';
var CFG={steps:['3','2','1','CHIẾN!'],dur:[850,850,850,950],dim:.45,
 vs:{margin:5,max:46,min:12,dy:.45,slam:450}};
var FONT='italic 900 {S}px "Noto Serif",Georgia,serif';
var COL=[
 {a:'#ffffff',b:'#aef0ff',c:'#1f86d0',g:'#4fd0ff',r:'150,230,255'},   /* 3: băng */
 {a:'#fffbe2',b:'#ffe066',c:'#d99410',g:'#ffc83a',r:'255,224,110'},   /* 2: vàng */
 {a:'#fff1e4',b:'#ff9a5c',c:'#cc3412',g:'#ff6a2a',r:'255,150,90'},    /* 1: cam */
 {a:'#fff8d0',b:'#ffb02e',c:'#d8201a',g:'#ff3a1a',r:'255,120,60'}];   /* CHIẾN: lửa */
var S={on:false,t:0,last:0,cb:null},V={on:false,t0:0};
function f(s){return FONT.replace('{S}',Math.round(s));}
function rnd(n){var r=Math.sin(n*127.1+311.7)*43758.5453;return r-Math.floor(r);}
function eo(t){t=Math.max(0,Math.min(1,t));return 1-Math.pow(1-t,3);}
function bo(t){t=Math.max(0,Math.min(1,t));var c=2.70158;return 1+c*Math.pow(t-1,3)+1.70158*Math.pow(t-1,2);}
function total(){var s=0,i;for(i=0;i<CFG.dur.length;i++)s+=CFG.dur[i];return s;}
function cur(){var t=S.t,i=0;for(;i<CFG.dur.length;i++){if(t<CFG.dur[i])break;t-=CFG.dur[i];}
 if(i>=CFG.dur.length){i=CFG.dur.length-1;t=CFG.dur[i];}return {i:i,l:t,p:t/CFG.dur[i]};}
function tick(ts){if(!S.on)return;if(!S.last)S.last=ts;
 var dt=Math.min(50,Math.max(0,ts-S.last));S.last=ts;S.t+=dt;   /* tab ẩn/giật hình thì không nhảy vọt */
 if(S.t>=total()){S.on=false;var cb=S.cb;S.cb=null;if(cb)cb();}}
function start(cb){S.on=true;S.t=0;S.last=0;S.cb=cb||null;V.on=true;V.t0=performance.now();}
function reset(){S.on=false;S.cb=null;V.on=false;}

/* Nền tối + vignette + tia sáng xoay (vẽ TRƯỚC khung HUD để HUD vẫn sáng) */
function under(ctx,ts,A){
 if(!S.on)return;tick(ts);if(!S.on)return;
 var T=total(),inn=Math.min(1,S.t/250),out=1-Math.max(0,Math.min(1,(S.t-(T-320))/320)),k=inn*out,c=cur(),col=COL[c.i];
 ctx.save();ctx.beginPath();ctx.rect(A.x,A.y,A.w,A.h);ctx.clip();
 ctx.fillStyle='rgba(2,6,24,'+(CFG.dim*k)+')';ctx.fillRect(A.x,A.y,A.w,A.h);
 var R=Math.hypot(A.w,A.h)*.6,vg=ctx.createRadialGradient(A.cx,A.cy,A.h*.25,A.cx,A.cy,R);
 vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,12,'+(.55*k)+')');ctx.fillStyle=vg;ctx.fillRect(A.x,A.y,A.w,A.h);
 var fa=Math.min(1,c.l/120)*(1-Math.max(0,(c.p-.6)/.4))*k,N=14,j,a0,g;
 ctx.translate(A.cx,A.cy);ctx.rotate(S.t/1800*(c.i%2?-1:1)+c.i);ctx.globalCompositeOperation='lighter';
 g=ctx.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,'rgba('+col.r+','+(.5*fa)+')');g.addColorStop(1,'rgba('+col.r+',0)');ctx.fillStyle=g;
 for(j=0;j<N;j++){a0=j/N*6.2832;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,R,a0,a0+6.2832/N*.42);ctx.closePath();ctx.fill();}
 ctx.restore();}

/* Số / chữ CHIẾN! + sóng xung kích + tia lửa + nháy sáng (vẽ SAU CÙNG) */
function draw(ctx,ts,A){
 if(!S.on)return;
 var c=cur(),col=COL[c.i],last=c.i===CFG.dur.length-1,p=c.p,l=c.l,cx=A.cx,cy=A.cy,k,q,i;
 ctx.save();ctx.beginPath();ctx.rect(A.x,A.y,A.w,A.h);ctx.clip();
 /* nháy sáng lúc đập số */
 var fl=Math.max(0,1-l/140);if(fl>0){ctx.fillStyle='rgba(255,255,255,'+(.4*fl*(last?1.4:1))+')';ctx.fillRect(A.x,A.y,A.w,A.h);}
 /* sóng xung kích (elip cho có chiều sâu) */
 ctx.globalCompositeOperation='lighter';
 for(k=0;k<(last?2:1);k++){q=(l-k*110)/520;if(q<=0||q>=1)continue;var rr=A.h*(.15+.95*eo(q));
  ctx.strokeStyle='rgba('+col.r+','+(.9*(1-q))+')';ctx.lineWidth=Math.max(1,(1-q)*A.h*.06);
  ctx.beginPath();ctx.ellipse(cx,cy,rr*1.25,rr*.8,0,0,6.2832);ctx.stroke();}
 /* tia lửa tóe ra */
 var NP=last?46:26,LIFE=650;ctx.lineCap='round';
 for(i=0;i<NP;i++){q=l/LIFE;if(q>=1)break;
  var ang=rnd(i+c.i*50)*6.2832,sp=A.h*(.5+rnd(i*3.1+c.i)*.9),g1=A.h*.25*q*q,g0=A.h*.25*Math.pow(Math.max(0,q-.08),2),
   d1=sp*eo(q),d0=sp*eo(Math.max(0,q-.08)),ca=Math.cos(ang),sa=Math.sin(ang)*.8;
  ctx.strokeStyle='rgba('+col.r+','+(1-q)+')';ctx.lineWidth=i%4?1.3:2.2;
  ctx.beginPath();ctx.moveTo(cx+ca*d0,cy+sa*d0+g0);ctx.lineTo(cx+ca*d1,cy+sa*d1+g1);ctx.stroke();}
 /* vệt chém ngang (chỉ CHIẾN!) */
 if(last&&l<300){q=l/300;var sx=A.x+A.w*eo(q),sg=ctx.createLinearGradient(sx-A.w*.3,0,sx+A.w*.04,0);
  sg.addColorStop(0,'rgba(255,255,255,0)');sg.addColorStop(1,'rgba(255,250,230,'+(1-q)+')');ctx.strokeStyle=sg;ctx.lineWidth=Math.max(1,A.h*.05*(1-q));
  ctx.beginPath();ctx.moveTo(sx-A.w*.3,cy+A.h*.3);ctx.lineTo(sx+A.w*.04,cy-A.h*.3);ctx.stroke();}
 ctx.globalCompositeOperation='source-over';
 /* chữ */
 var txt=CFG.steps[c.i],fs=last?A.h*.5:A.h*.66;
 if(last){ctx.font=f(fs);var mw=ctx.measureText(txt).width,mx=A.w*.82;if(mw>mx)fs=fs*mx/mw;}
 var sc,al=Math.min(1,p/.06),rot=0,os=last?.8:.74;
 if(p<.2)sc=3.2-2.28*eo(p/.2);else if(p<.32)sc=.92+.08*eo((p-.2)/.12);else sc=1+.1*Math.min(1,(p-.32)/(os-.32));
 if(p>os){q=(p-os)/(1-os);sc=1.1+(last?.25:.6)*q*q;al*=1-q;}
 if(last)rot=-.14*(1-eo(p/.25));
 var am=A.h*.022*Math.max(0,1-p/.3),dx=(rnd(Math.floor(S.t/28)+7)-.5)*2*am,dy=(rnd(Math.floor(S.t/28)+19)-.5)*2*am;
 ctx.translate(cx+dx,cy+dy);ctx.rotate(rot);ctx.scale(sc,sc);ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.font=f(fs);
 ctx.globalAlpha=Math.max(0,al);
 /* bóng mờ phía sau (cảm giác lao tới) */
 if(p<.5){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,al)*.2*(1-p/.5);ctx.scale(1.18,1.18);ctx.fillStyle=col.g;ctx.fillText(txt,0,0);ctx.restore();}
 /* viền tối dày + vầng sáng */
 ctx.shadowColor=col.g;ctx.shadowBlur=fs*.35;ctx.lineWidth=fs*.17;ctx.strokeStyle='rgba(8,12,40,.95)';ctx.strokeText(txt,0,0);ctx.shadowBlur=0;
 /* viền màu */
 ctx.lineWidth=fs*.08;ctx.strokeStyle=col.c;ctx.strokeText(txt,0,0);
 /* ruột chữ: gradient dọc */
 var gr=ctx.createLinearGradient(0,-fs*.5,0,fs*.5);gr.addColorStop(0,col.a);gr.addColorStop(.5,col.b);gr.addColorStop(1,col.c);ctx.fillStyle=gr;ctx.fillText(txt,0,0);
 /* viền sáng mảnh bên trong */
 ctx.lineWidth=Math.max(1,fs*.012);ctx.strokeStyle='rgba(255,255,255,.65)';ctx.strokeText(txt,0,0);
 ctx.restore();}

/* VS giữa 2 khung: x0 = mép trong khung trái, x1 = mép trong khung phải, y = tâm dọc */
function vs(ctx,ts,x0,x1,y){
 if(!V.on)return;
 var C=CFG.vs,gap=x1-x0;if(gap<8)return;
 var maxW=gap-2*C.margin;if(maxW<4)return;
 ctx.save();ctx.font=f(100);var w100=ctx.measureText('VS').width||100,fs=Math.max(C.min,Math.min(C.max,100*maxW/w100));
 var q=Math.max(0,(ts-V.t0)/C.slam),sc=1,al=1;
 if(q<1){sc=3-2*bo(q);al=Math.min(1,q*4);}
 sc*=1+.03*Math.sin(ts/230);
 ctx.translate((x0+x1)/2,y);ctx.scale(sc,sc);ctx.globalAlpha=al;ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';ctx.font=f(fs);
 ctx.shadowColor='#ff5a1a';ctx.shadowBlur=fs*.4*(.8+.2*Math.sin(ts/160));ctx.lineWidth=fs*.2;ctx.strokeStyle='rgba(10,6,30,.95)';ctx.strokeText('VS',0,0);
 ctx.shadowBlur=0;ctx.lineWidth=fs*.09;ctx.strokeStyle='#a8200e';ctx.strokeText('VS',0,0);
 var g=ctx.createLinearGradient(0,-fs*.5,0,fs*.5);g.addColorStop(0,'#fff8d6');g.addColorStop(.5,'#ffb830');g.addColorStop(1,'#e0301a');ctx.fillStyle=g;ctx.fillText('VS',0,0);
 ctx.lineWidth=Math.max(.8,fs*.02);ctx.strokeStyle='rgba(255,255,255,.6)';ctx.strokeText('VS',0,0);
 ctx.restore();}

root.TTGDEM={start:start,reset:reset,active:function(){return S.on;},under:under,draw:draw,vs:vs,CFG:CFG};
})(typeof window!=='undefined'?window:globalThis);
