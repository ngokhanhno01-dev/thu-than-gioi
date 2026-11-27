/* ===== 60d-fx-de-giang.js — Boss THẦN Đế Giang (th1, hệ Không Gian): ĐÒN THƯỜNG đánh xa (sprite) =====
   Nạp SAU 57-fx-ky-nang-boss.js và 60-fx-thuy-nguyet.js; chờ API.__fxBoss rồi bọc ngoài cùng drawAttack / drawImpact. Chỉ nhận:
     - đòn thường: S.s === 18 (index.html: FX_ZONE 17 -> 18, vì th1 có vung 17), không có nhãn sự kiện (text).
   Mọi thứ khác (kỹ năng, sự kiện trang bị có text) chuyển nguyên cho chuỗi cũ. Kỹ năng Tinh Hà Vẫn Lạc CHƯA có hiệu ứng riêng.
   Canvas FX 360x250, mặt đất y=204. S.sx = x người đánh trong canvas (index.html truyền); không có thì 85 / 272.
   Sprite fx-boss/de-giang-don-thuong.png: 3x2 ô 480x405, ảnh quay đầu sang PHẢI, nền trong suốt.
     ô1 lỗ đen · ô2 lỗ đen + tinh thể ló ra · ô3 tinh thể bay + vệt đuôi · ô4 nổ tinh thể (neo mặt đất) · ô5 mảnh vụn + tinh vân · ô6 tinh vân tan.
   Ảnh lỗi: dùng lại hiệu ứng cũ (hệ số 1). */
(()=>{
 'use strict';
 const ZONE_DG=18,GY=204;
 const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
 function load(file,cw,ch){const o={ok:false,img:new Image(),cw,ch};o.img.onload=()=>{o.ok=true};o.img.src=base+'fx-boss/'+file;return o}
 const DT=load('de-giang-don-thuong.png',480,405);
 const cl=v=>v<0?0:v>1?1:v,ph=(v,a,b)=>cl((v-a)/(b-a)),eo=v=>1-(1-v)*(1-v),lerp=(a,b,v)=>a+(b-a)*v;
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 /* vẽ ô i (0..5): (x,y) = điểm neo trên canvas, ay = neo dọc trong ô, s = tỉ lệ, dir = -1 thì lật ngang */
 function spr(g,sh,i,x,y,ay,s,dir,a){
  if(a<=.01)return;
  g.save();g.globalAlpha*=cl(a);g.translate(x,y);g.scale(dir*s,s);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(sh.img,(i%3)*sh.cw,Math.floor(i/3)*sh.ch,sh.cw,sh.ch,-sh.cw/2,-ay,sh.cw,sh.ch);
  g.restore();
 }
 /* mảnh tinh thể tím văng ra từ (x,y), p = 0..1 */
 function shards(g,x,y,p,n,R,seed){
  if(p<=0||p>=1)return;
  g.save();g.globalAlpha*=1-p;
  for(let i=0;i<n;i++){const an=-Math.PI*(.05+.9*hs(seed+i)),r=R*(.35+.65*hs(seed+i*3))*eo(p),sz=1+Math.round(hs(seed+i*7)*2);
   g.fillStyle=i%3?'#b66bff':'#f1dcff';g.fillRect(Math.round(x+Math.cos(an)*r),Math.round(y+Math.sin(an)*r+40*p*p),sz,sz)}
  g.restore();
 }
 function pos(S){const dir=S.pa?1:-1,tx=S.pa?272:85,sx=typeof S.sx==='number'?S.sx:(S.pa?85:272);return{dir,tx,sx}}

 /* ĐÒN THƯỜNG: u 0..1, trúng ở u=.35. 1 lỗ đen mở trước mặt -> 2 tinh thể ló ra -> 3 tinh thể lao tới -> 4 nổ tinh thể -> 5 vụn + tinh vân -> 6 tan */
 const CY=162;
 function basic(g,S){
  const u=cl(+S.u||0),{dir,tx,sx}=pos(S),y=CY,front=sx+dir*34,seed=(S.i||0)*13;
  const a1=ph(u,0,.05)*(1-ph(u,.15,.24));
  if(a1>0){const k=eo(ph(u,0,.16));
   g.save();g.translate(front,y);g.rotate(dir*k*.9);spr(g,DT,0,0,0,202,.12+.1*k,1,a1);g.restore()}
  if(u>=.13&&u<.38){
   const f=ph(u,.15,.35),end=S.miss?tx+dir*30:tx-dir*8,head=lerp(front+dir*12,end,f*(.55+.45*f)),
    big=f>.3,s=big?.2+.05*ph(f,.3,1):.17+.04*f,off=(big?233:203)*s,   /* off: đầu mũi tinh thể cách tâm ô (px ô * tỉ lệ) để mũi dẫn đầu */
    a=ph(u,.13,.17)*(1-ph(u,S.miss?.31:.35,.38));
   spr(g,DT,big?2:1,head-dir*off,y,202,s,dir,a);
  }
  if(!S.miss){
   const a4=ph(u,.34,.36)*(1-ph(u,.48,.56));
   spr(g,DT,3,tx,GY+4,250,.22+.07*eo(ph(u,.34,.46)),dir,a4);
   shards(g,tx,y+8,ph(u,.35,.62),16,52,seed+5);
   spr(g,DT,4,tx,GY+2,250,.24+.04*ph(u,.5,.7),dir,ph(u,.48,.55)*(1-ph(u,.62,.74)));
   spr(g,DT,5,tx,GY-8*ph(u,.66,.9),250,.27,dir,ph(u,.62,.7)*(1-ph(u,.74,.9)));
  }
  return true;
 }

 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.drawAttack||!API.__fxBoss){if(tries++<600)setTimeout(boot,50);return}
  if(API.__fxDeGiang)return;API.__fxDeGiang=1;
  const prevA=API.drawAttack,prevI=API.drawImpact;
  API.drawAttack=function(g,T,S){
   try{
    if(S&&S.s===ZONE_DG&&!S.kyNang){
     if(!S.text&&DT.ok)return basic(g,S);
     return prevA(g,T,Object.assign({},S,{s:1}));
    }
   }catch(e){window.__fxBossErr='60d: '+(e&&e.message||e)}
   return prevA(g,T,S);
  };
  API.drawImpact=function(g,fx,T){
   if(fx&&fx.s===ZONE_DG){
    if(!fx.text&&DT.ok&&(fx.k==='hit'||fx.k==='miss'))return true;   /* va chạm đã nằm trong sprite đòn thường */
    return prevI(g,Object.assign({},fx,{s:1}),T);
   }
   return prevI.apply(this,arguments);
  };
 }
 boot();
})();
