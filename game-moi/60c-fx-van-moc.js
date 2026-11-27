/* ===== 60c-fx-van-moc.js — kỹ năng boss VẠN MỘC HỒI XUÂN (tự hồi máu, sprite) =====
   Nạp SAU 57-fx-ky-nang-boss.js; chờ API.__fxBoss rồi bọc drawAttack. Chỉ nhận S.kyNang === 'van-moc-hoi-xuan', còn lại chuyển nguyên cho chuỗi cũ.
   Kỹ năng DÙNG LÊN BẢN THÂN: FX nằm ngay chân người dùng (S.sx), không bay sang đối thủ, không có nhánh trượt/hụt.
   Canvas FX 360x250, mặt đất y=204. Sheet 3x2 fx-boss/van-moc.png (1672x941, ô ~557x470, neo từng ô đo từ ảnh gốc, nền đã tách trong suốt).
   Mốc thời gian (giây, t=u*1.9): 1 trận pháp .0-.2 · 2 xoáy lá .2-.6 · 3 cột sáng .5-.95 (HỒI MÁU áp ở TH=.665) · 4 sen nở .66-1.2 · 5 khói dấu cộng 1.0-1.5 · 6 tàn sáng 1.3-END.
   Ảnh chưa nạp được: dùng hiệu ứng của chuỗi cũ. */
(()=>{
 'use strict';
 const KN='van-moc-hoi-xuan',GY=204,END=1.68,SK=.36;
 const FW=1672/3,FH=941/2;                       /* kích thước ô trong ảnh gốc */
 const AX=[274,277,282,281,281,283],AY=[329,333,340,348,345,335];   /* neo từng khung: (giữa trận pháp x, mặt đất y) trong ô */
 const base=((document.currentScript&&document.currentScript.src)||'').replace(/[^\/]*$/,'');
 const sh={ok:false,img:new Image()};sh.img.onload=()=>{sh.ok=true};sh.img.src=base+'fx-boss/van-moc.png';
 const cl=v=>v<0?0:v>1?1:v,ph=(v,a,b)=>cl((v-a)/(b-a)),eo=v=>1-(1-v)*(1-v);
 /* vẽ khung i (0..5): (x,y) = tâm trận pháp trên canvas, s = tỉ lệ, a = độ đậm */
 function spr(g,i,x,y,s,a){
  if(a<=.01)return;
  const sx=Math.floor((i%3)*FW),sy=Math.floor(Math.floor(i/3)*FH),w=Math.floor(((i%3)+1)*FW)-sx,h=Math.floor((Math.floor(i/3)+1)*FH)-sy;
  g.save();g.globalAlpha*=cl(a);g.translate(x,y);g.scale(s,s);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(sh.img,sx,sy,w,h,-AX[i],-AY[i],w,h);
  g.restore();
 }
 function skill(g,S){
  const t=cl(+S.u||0)*1.9,sx=typeof S.sx==='number'?S.sx:(S.pa?85:272),y=GY+6;
  if(t>END+.1)return true;
  spr(g,0,sx,y,SK*(.8+.25*eo(ph(t,0,.25))),ph(t,0,.2)*(1-.6*ph(t,.55,.75))*(1-ph(t,1.2,1.4)));   /* trận pháp hiện, mờ bớt rồi tan */
  spr(g,1,sx,y,SK*(.9+.1*ph(t,.2,.62)),ph(t,.2,.36)*(1-ph(t,.6,.78)));                              /* xoáy lá */
  spr(g,2,sx,y,SK*(.95+.05*ph(t,.5,.95)),ph(t,.5,.62)*(1-ph(t,.8,.95)));                             /* cột sáng, đỉnh lúc hồi máu */
  spr(g,3,sx,y,SK*(.82+.2*eo(ph(t,.66,.95))),ph(t,.66,.8)*(1-ph(t,1.05,1.2)));                      /* sen nở */
  spr(g,4,sx,y-6*ph(t,1,1.5),SK,ph(t,1,1.15)*(1-ph(t,1.38,1.5)));                                    /* khói + dấu cộng */
  spr(g,5,sx,y-10*ph(t,1.3,END),SK*(1+.04*ph(t,1.3,END)),ph(t,1.3,1.42)*(1-ph(t,1.5,END)));          /* tàn sáng */
  return true;
 }
 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.drawAttack||!API.__fxBoss){if(tries++<600)setTimeout(boot,50);return}
  if(API.__fxVanMoc)return;API.__fxVanMoc=1;
  const prev=API.drawAttack;
  API.drawAttack=function(g,T,S){
   try{if(S&&S.kyNang===KN&&sh.ok)return skill(g,S)}catch(e){window.__fxBossErr='60c: '+(e&&e.message||e)}
   return prev.apply(this,arguments);
  };
 }
 boot();
})();
