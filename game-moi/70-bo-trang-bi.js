/* 70-bo-trang-bi.js — Aura BỘ TRANG BỊ (chép hiệu ứng từ main: 41-gear-aura / 42-gear-pixel / 43-gear-scene).
   Chỉ VẼ, không đụng chỉ số/trận/lưu. Hiệu ứng 17 bộ nằm trong window.TTGGearAura (41), mỗi bộ ứng với 1 vùng z (0..16):
   0 frost, 1 mist, 2 cloud, 3 wind, 4 thunder, 5 counter, 6 sun, 7 shield, 8 thorn, 9 revive, 10 grove, 11 lava, 12 ambush, 13 star, 14 first, 15 weaken, 16 judge.
   Quy tắc (giống main): mặc ĐỦ 4 món cùng bộ thì mới hiện aura. Món trang bị khai trường  bo = số vùng (0..16), vd {slot:0,bo:3,...} = món của bộ Phong Nguyên.
   XEM THỬ không cần đồ: thêm ?bo=3 (hoặc ?bo=wind) vào link game. API: TTGBO.kind() -> tên bộ đang hiện | null ; TTGBO.draw(ctx, x, chanY, ts, T, q, sc) */
(function(root){
'use strict';
var K=['frost','mist','cloud','wind','thunder','counter','sun','shield','thorn','revive','grove','lava','ambush','star','first','weaken','judge'];
var NEED=4;
function forced(){
  try{var m=/[?&]bo=([\w-]+)/.exec(location.search);if(!m)return undefined;var v=m[1];
    if(/^\d+$/.test(v))return K[+v]||null;return K.indexOf(v)>=0?v:null;}catch(e){return undefined;}
}
function kind(){
  var f=forced();if(f!==undefined)return f;
  try{
    var l=root.TTGTB&&root.TTGTB.dangMac?root.TTGTB.dangMac():[],cnt={},z;
    l.forEach(function(t){z=Math.floor(Number(t&&t.bo));if(z>=0&&z<K.length)cnt[z]=(cnt[z]||0)+1;});
    for(z in cnt)if(cnt[z]>=NEED)return K[+z];
  }catch(e){}
  return null;
}
/* Vẽ aura của bộ `k` với chân thú tại (x, chanY) — hệ tọa độ hiệu ứng 360x250 (mặt đất y=203) được phóng sc lần.
   T = giây từ đầu trận (0 ở sảnh), q = 1→0 là nhịp bùng lúc vào trận (0 ở sảnh), ts = mili-giây trên đồng hồ trang. */
function draw(g,x,chanY,ts,T,q,sc,k){
  k=k||kind();
  var A=root.TTGGearAura,FX=root.TTGCombatFX,E=FX&&FX.engine;
  if(!k||!A||!E||typeof A[k]!=='function')return false;
  g.save();
  try{
    g.translate(x,chanY);g.scale(sc||1.1,sc||1.1);g.translate(-180,-203);
    g.globalAlpha=1;g.globalCompositeOperation='source-over';
    A[k](g,180,q||0,ts/1000,T||0,E);
  }catch(e){root.__boErr=e&&e.message||String(e);}
  g.restore();
  return true;
}
root.TTGBO={KINDS:K,NEED:NEED,kind:kind,draw:draw};
})(typeof window!=='undefined'?window:globalThis);
