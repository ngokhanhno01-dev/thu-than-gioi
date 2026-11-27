/* ===== 60b-fx-viem-long.js — kỹ năng boss VIÊM LONG PHÁ NHẬT (sprite) =====
   Nạp SAU 57-fx-ky-nang-boss.js; chờ API.__fxBoss rồi bọc drawAttack. Chỉ nhận S.kyNang === 'viem-long-pha-nhat', còn lại chuyển nguyên cho chuỗi cũ.
   Canvas FX 360x250, mặt đất y=204. S.sx = x người dùng chiêu (index.html truyền); S.pa = true thì đánh sang phải.
   Sheet 3x2 fx-boss/viem-long.png (ô 640x400, mặt đất y=370, rồng quay đầu sang PHẢI). Ảnh chưa nạp được: dùng hiệu ứng của chuỗi cũ. */
(()=>{
 'use strict';
 const KN='viem-long-pha-nhat',GY=204,TH=.665,END=1.68,SK=.34,SKG=370,CW=640,CH=400;
 const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
 const sh={ok:false,img:new Image()};sh.img.onload=()=>{sh.ok=true};sh.img.src=base+'fx-boss/viem-long.png';
 const cl=v=>v<0?0:v>1?1:v,ph=(v,a,b)=>cl((v-a)/(b-a)),eo=v=>1-(1-v)*(1-v),lerp=(a,b,v)=>a+(b-a)*v;
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 /* vẽ khung i (0..5): (x,y) = điểm giữa chân trên canvas, s = tỉ lệ, dir = -1 thì lật ngang */
 function spr(g,i,x,y,s,dir,a){
  if(a<=.01)return;
  g.save();g.globalAlpha*=cl(a);g.translate(x,y);g.scale(dir*s,s);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(sh.img,(i%3)*CW,Math.floor(i/3)*CH,CW,CH,-CW/2,-SKG,CW,CH);
  g.restore();
 }
 /* tàn lửa văng từ (x,y), p = 0..1 */
 function embers(g,x,y,p,n,R,seed){
  if(p<=0||p>=1)return;
  g.save();g.globalAlpha*=1-p;
  for(let i=0;i<n;i++){const an=-Math.PI*(.05+.9*hs(seed+i)),r=R*(.35+.65*hs(seed+i*3))*eo(p),sz=1+Math.round(hs(seed+i*7)*2);
   g.fillStyle=i%3?'#ff7a1e':'#ffe27a';g.fillRect(Math.round(x+Math.cos(an)*r),Math.round(y+Math.sin(an)*r+38*p*p),sz,sz)}
  g.restore();
 }
 /* t (giây): 1 ấn nhật -> 2 đầu rồng hiện -> 3 rồng lao -> trúng .665: 4 nổ -> 5 xoáy lửa -> 6 khói tàn */
 function skill(g,S){
  const t=cl(+S.u||0)*1.9,dir=S.pa?1:-1,tx=S.pa?272:85,sx=typeof S.sx==='number'?S.sx:(S.pa?85:272),y=GY+6,seed=(S.i||0)*31;
  if(t>END+.1)return true;
  spr(g,0,sx,y,SK*(.72+.3*eo(ph(t,0,.22))),dir,ph(t,0,.08)*(1-ph(t,.23,.33)));
  const r=ph(t,.22,.34);
  spr(g,1,sx+dir*10*r,y+16*(1-eo(r)),SK*(.86+.18*eo(r)),dir,ph(t,.21,.28)*(1-ph(t,.43,.49)));
  if(t>=.42&&t<TH+.07){
   const f=ph(t,.43,TH),end=tx-dir*70,x=lerp(sx+dir*20,end,f*f*(3-2*f))+(S.miss?dir*60*ph(t,TH-.04,TH+.07):0),a=ph(t,.42,.47)*(1-ph(t,TH,TH+.07));
   spr(g,2,x-dir*28,y-14,SK,dir,a*.3*Math.sin(Math.PI*f));   /* bóng kéo đuôi */
   spr(g,2,x,y-14,SK*(1+.06*f),dir,a);
  }
  if(!S.miss){
   spr(g,3,tx,y+4,SK*(.8+.3*eo(ph(t,TH,TH+.18))),dir,ph(t,TH-.02,TH+.03)*(1-ph(t,.94,1.06)));
   embers(g,tx,y-34,ph(t,TH,TH+.6),40,100,seed+3);
   spr(g,4,tx,y+2,SK*(.9+.14*ph(t,.94,1.34)),dir,ph(t,.92,1.04)*(1-ph(t,1.26,1.42)));
   spr(g,5,tx,y-8*ph(t,1.28,END),SK*(1+.05*ph(t,1.28,END)),dir,ph(t,1.26,1.4)*(1-ph(t,1.46,END)));
  }
  return true;
 }
 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.drawAttack||!API.__fxBoss){if(tries++<600)setTimeout(boot,50);return}
  if(API.__fxViemLong)return;API.__fxViemLong=1;
  const prev=API.drawAttack;
  API.drawAttack=function(g,T,S){
   try{if(S&&S.kyNang===KN&&sh.ok)return skill(g,S)}catch(e){window.__fxBossErr='60b: '+(e&&e.message||e)}
   return prev.apply(this,arguments);
  };
 }
 boot();
})();
