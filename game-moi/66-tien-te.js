/* ===== HỆ THỐNG TIỀN TỆ: Tinh Thạch + Thú Thần Thạch (21/11/2026) =====
   - Lưu localStorage khóa ttg_moi_tien = {tt:Tinh Thạch, ttt:Thú Thần Thạch}. Chưa nối online.
   - Tinh Thạch rớt khi THẮNG trận Thám Hiểm: nhiều/ít theo loại địch (quái / thú hoang / boss), VÙNG (z 0..17, chia đều 18 vùng) và RANK (E..SR).
     TT = nền[loại] x (1 + hsVungMoiZ x z) x hsBac[rank] x ngẫu nhiên [0,8..1,2], làm tròn, tối thiểu 1.
   - Thú Thần Thạch: mới có khung + bộ đếm (add/get), chưa có nguồn rơi.
   - Khung hiển thị: game-moi/khung-tien.webp, chỉ vẽ ở SẢNH, ở giữa 2 ô Danh Vọng và EXP. Đổi vị trí/kích cỡ ở HUD, tọa độ ô số ở NUM (px ảnh gốc 1968x401). */
(function(root){
'use strict';
var KEY='ttg_moi_tien';
var CFG={
  nen:{quai:6,thu:9,boss:50},                 /* Tinh Thạch gốc (vùng 0, rank C) */
  hsVungMoiZ:0.2,                             /* vùng z (0..17) nhân (1 + 0,2 x z): vùng 18 ~ x4,4 */
  hsBac:{E:0.7,D:0.85,C:1,B:1.25,A:1.6,S:2.2,SS:3.2,SR:10},
  rngMin:0.8,rngMax:1.2
};
var HUD={w:236,y:5,src:'game-moi/khung-tien.webp?v=1'};   /* w = bề rộng vẽ (đơn vị logic), y = cách mép trên (cộng thêm tai thỏ) */
var NUM={w:1968,h:401,y:238,l:{x0:458,x1:872},r:{x0:1136,x1:1575}};   /* vùng chữ số trong 2 ô xanh */
var S={tt:0,ttt:0},img=new Image(),imgOK=false;
try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');S.tt=Math.max(0,Math.floor(+o.tt)||0);S.ttt=Math.max(0,Math.floor(+o.ttt)||0);}catch(e){}
img.onload=function(){imgOK=true;};img.src=HUD.src;
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function tinhThach(o){   /* o={loai:'quai'|'thu'|'boss', vung:z, bac:'E'..'SR'} */
  var n=CFG.nen[o.loai]||CFG.nen.quai,z=Math.max(0,+o.vung||0),b=CFG.hsBac[o.bac];if(!b)b=1;
  var r=CFG.rngMin+Math.random()*(CFG.rngMax-CFG.rngMin);
  return Math.max(1,Math.round(n*(1+CFG.hsVungMoiZ*z)*b*r));
}
function add(k,n){n=Math.floor(+n)||0;if(!S.hasOwnProperty(k)||!n)return S[k];S[k]=Math.max(0,S[k]+n);save();return S[k];}
function fmt(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,'.');}   /* 12345 -> 12.345 */
/* Vẽ khung ở giữa: cx = tâm ngang vùng khung trên (đơn vị logic), top = mép trên vùng khung (đã gồm tai thỏ) */
function draw(ctx,cx,top,maxW){
  if(!imgOK)return;
  var w=Math.min(HUD.w,maxW||HUD.w),s=w/NUM.w,h=NUM.h*s,x=cx-w/2,y=top+HUD.y,k,t,x0,x1,fs;
  ctx.save();ctx.drawImage(img,x,y,w,h);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.lineJoin='round';
  [['l',S.tt],['r',S.ttt]].forEach(function(p){k=NUM[p[0]];t=fmt(p[1]);x0=x+k.x0*s;x1=x+k.x1*s;
    fs=Math.max(8,Math.round(NUM.h*s*.2));ctx.font='bold '+fs+'px sans-serif';
    while(fs>6&&ctx.measureText(t).width>(x1-x0)){fs--;ctx.font='bold '+fs+'px sans-serif';}
    ctx.lineWidth=Math.max(2,fs*.28);ctx.strokeStyle='#020618';ctx.fillStyle=p[0]==='l'?'#bdf3ff':'#e6c8ff';
    ctx.strokeText(t,(x0+x1)/2,y+NUM.y*s);ctx.fillText(t,(x0+x1)/2,y+NUM.y*s);});
  ctx.restore();
}
root.TTGTIEN={CFG:CFG,HUD:HUD,get:function(k){return S[k]||0;},add:add,tinhThach:tinhThach,draw:draw,fmt:fmt};
})(typeof window!=='undefined'?window:globalThis);
