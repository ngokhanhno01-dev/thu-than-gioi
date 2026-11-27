/* ===== 60-fx-thuy-nguyet.js — Vùng 7 Thủy Nguyệt Cảnh: ĐÒN THƯỜNG đánh xa + kỹ năng boss THỦY LONG PHÁ NGUYỆT (sprite) =====
   Nạp SAU 57-fx-ky-nang-boss.js; chờ API.__fxBoss rồi bọc ngoài cùng drawAttack / drawImpact. Chỉ nhận:
     - đòn thường: S.s === 17 (index.html: FX_ZONE 6 -> 17), không có nhãn sự kiện (text);
     - kỹ năng: S.kyNang === 'thuy-long-pha-nguyet'.
   Mọi thứ khác chuyển nguyên cho chuỗi cũ. Sự kiện trang bị (có text) của thú vùng 7 vẫn dùng hiệu ứng vùng 1 (hệ thủy) như trước.
   Canvas FX 360x250, mặt đất y=204. S.sx = x người đánh trong canvas (index.html truyền); không có thì 85 / 272.
   Sheet 3x2: fx-boss/thuy-don-thuong.png (ô 480x320; ô 1-3 neo giữa dọc y=160, ô 4-6 neo mặt đất y=270)
              fx-boss/thuy-long.png (ô 640x400, mặt đất y=370, rồng quay đầu sang PHẢI). Ảnh lỗi: dùng lại hiệu ứng cũ. */
(()=>{
 'use strict';
 const ZONE_TN=17,KN='thuy-long-pha-nguyet',GY=204,TH=.665,END=1.68;
 const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
 function load(file,cw,ch){const o={ok:false,img:new Image(),cw,ch};o.img.onload=()=>{o.ok=true};o.img.src=base+'fx-boss/'+file;return o}
 const DT=load('thuy-don-thuong.png',480,320),TL=load('thuy-long.png',640,400);
 const cl=v=>v<0?0:v>1?1:v,ph=(v,a,b)=>cl((v-a)/(b-a)),eo=v=>1-(1-v)*(1-v),lerp=(a,b,v)=>a+(b-a)*v;
 const hs=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
 /* vẽ ô i (0..5): (x,y) = điểm neo trên canvas, ay = neo dọc trong ô, s = tỉ lệ, dir = -1 thì lật ngang */
 function spr(g,sh,i,x,y,ay,s,dir,a){
  if(a<=.01)return;
  g.save();g.globalAlpha*=cl(a);g.translate(x,y);g.scale(dir*s,s);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(sh.img,(i%3)*sh.cw,Math.floor(i/3)*sh.ch,sh.cw,sh.ch,-sh.cw/2,-ay,sh.cw,sh.ch);
  g.restore();
 }
 /* giọt nước pixel văng ra từ (x,y), p = 0..1 */
 function drops(g,x,y,p,n,R,seed){
  if(p<=0||p>=1)return;
  g.save();g.globalAlpha*=1-p;
  for(let i=0;i<n;i++){const an=-Math.PI*(.05+.9*hs(seed+i)),r=R*(.35+.65*hs(seed+i*3))*eo(p),sz=1+Math.round(hs(seed+i*7)*2);
   g.fillStyle=i%3?'#59c8ff':'#e8fbff';g.fillRect(Math.round(x+Math.cos(an)*r),Math.round(y+Math.sin(an)*r+46*p*p),sz,sz)}
  g.restore();
 }
 function pos(S){const dir=S.pa?1:-1,tx=S.pa?272:85,sx=typeof S.sx==='number'?S.sx:(S.pa?85:272);return{dir,tx,sx}}

 /* ĐÒN THƯỜNG: u 0..1, trúng ở u=.35. 1 ấn tụ nước -> 2 thủy cầu -> 3 thủy tiễn bay xa -> 4 nổ băng nước -> 5 tan -> 6 lấp lánh */
 const CY=162;
 function basic(g,S){
  const u=cl(+S.u||0),{dir,tx,sx}=pos(S),y=CY,front=sx+dir*34,seed=(S.i||0)*13;
  const a1=ph(u,0,.05)*(1-ph(u,.15,.21));
  if(a1>0){const k=eo(ph(u,0,.14));
   g.save();g.translate(front,y);g.rotate(dir*k*.5);spr(g,DT,0,0,0,160,.14+.1*k,1,a1);g.restore()}
  if(u>=.13&&u<.38){
   const f=ph(u,.15,.35),end=S.miss?tx+dir*30:tx-dir*8,head=lerp(front+dir*12,end,f*(.55+.45*f)),
    big=f>.3,s=big?.22+.05*ph(f,.3,1):.2+.05*f,off=(big?196:150)*s,
    a=ph(u,.13,.17)*(1-ph(u,S.miss?.31:.35,.38));
   spr(g,DT,big?2:1,head-dir*off,y,160,s,dir,a);
  }
  if(!S.miss){
   const a4=ph(u,.34,.36)*(1-ph(u,.48,.56));
   spr(g,DT,3,tx,GY+4,270,.22+.07*eo(ph(u,.34,.46)),dir,a4);
   drops(g,tx,y+8,ph(u,.35,.62),18,54,seed+5);
   spr(g,DT,4,tx,GY+2,270,.24+.04*ph(u,.5,.7),dir,ph(u,.48,.55)*(1-ph(u,.62,.74)));
   spr(g,DT,5,tx,GY-8*ph(u,.66,.9),270,.27,dir,ph(u,.62,.7)*(1-ph(u,.74,.9)));
  }
  return true;
 }

 /* KỸ NĂNG: t (giây). 1 trăng nước -> 2 rồng trồi lên -> 3 rồng lao phá nguyệt -> trúng .665: 4 nổ trăng -> 5 sóng -> 6 tan */
 const SK=.34,SKG=370;
 function skill(g,S){
  const t=cl(+S.u||0)*1.9,{dir,tx,sx}=pos(S),y=GY+6,seed=(S.i||0)*29;
  if(t>END+.1)return true;
  spr(g,TL,0,sx,y,SKG,SK*(.78+.24*eo(ph(t,0,.2))),dir,ph(t,0,.08)*(1-ph(t,.22,.32)));
  const r=ph(t,.22,.34);
  spr(g,TL,1,sx+dir*10*r,y+22*(1-eo(r)),SKG,SK*(.86+.18*eo(r)),dir,ph(t,.21,.28)*(1-ph(t,.43,.49)));
  if(t>=.42&&t<TH+.07){
   const f=ph(t,.43,TH),end=tx-dir*78,x=lerp(sx+dir*20,end,f*f*(3-2*f))+(S.miss?dir*60*ph(t,TH-.04,TH+.07):0),a=ph(t,.42,.47)*(1-ph(t,TH,TH+.07));
   spr(g,TL,2,x-dir*26,y,SKG,SK,dir,a*.3*Math.sin(Math.PI*f));   /* bóng kéo đuôi */
   spr(g,TL,2,x,y-8*Math.sin(Math.PI*f),SKG,SK*(1+.06*f),dir,a);
  }
  if(!S.miss){
   spr(g,TL,3,tx,y,SKG,SK*(.8+.3*eo(ph(t,TH,TH+.18))),dir,ph(t,TH-.02,TH+.03)*(1-ph(t,.94,1.06)));
   drops(g,tx,y-34,ph(t,TH,TH+.55),34,96,seed+3);
   spr(g,TL,4,tx+dir*10*ph(t,.94,1.34),y,SKG,SK*(.94+.1*ph(t,.94,1.34)),dir,ph(t,.92,1.04)*(1-ph(t,1.26,1.42)));
   spr(g,TL,5,tx+dir*14*ph(t,1.28,END),y-6*ph(t,1.28,END),SKG,SK*1.02,dir,ph(t,1.26,1.4)*(1-ph(t,1.46,END)));
  }
  return true;
 }

 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.drawAttack||!API.__fxBoss){if(tries++<600)setTimeout(boot,50);return}
  if(API.__fxThuy)return;API.__fxThuy=1;
  const prevA=API.drawAttack,prevI=API.drawImpact;
  API.drawAttack=function(g,T,S){
   try{
    if(S&&S.kyNang===KN){if(TL.ok)return skill(g,S)}
    else if(S&&S.s===ZONE_TN){
     if(!S.text&&DT.ok)return basic(g,S);
     return prevA(g,T,Object.assign({},S,{s:1}));
    }
   }catch(e){window.__fxBossErr='60: '+(e&&e.message||e)}
   return prevA(g,T,S);
  };
  API.drawImpact=function(g,fx,T){
   if(fx&&fx.s===ZONE_TN){
    if(!fx.text&&DT.ok&&(fx.k==='hit'||fx.k==='miss'))return true;   /* va chạm đã nằm trong sprite đòn thường */
    return prevI(g,Object.assign({},fx,{s:1}),T);
   }
   return prevI.apply(this,arguments);
  };
 }
 boot();
})();
