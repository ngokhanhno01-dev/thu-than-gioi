/* ===== [FX 3C-mở rộng] Buff bộ trang bị hiện ở SẢNH CHÍNH, THẺ (23-view), KHUNG TOP + trận ĐẤU TRƯỜNG =====
   Dùng lại đúng hiệu ứng TTGGearAura (41/42), chỉ VẼ, không đụng cơ chế/chỉ số/lưu.
   - Sảnh chính, thẻ, khung top đều gọi formation() (bệ dưới chân thú) → bọc formation: vẽ aura NGAY SAU bệ, trước khi vẽ thú.
     TTGGearScene.cur: undefined = dùng bộ đang mặc của mình (sảnh chính); null = không có bộ; chuỗi = kind bộ của thẻ người khác.
   - Đấu trường (trận): 26-arena.js gọi TTGGearScene.arena(...) ngay sau drawArenaBack.
   Bộ được chọn giống getStartBuffs: bộ đầu tiên có từ 2 món cùng vùng trở lên. */
(()=>{
 'use strict';
 const S=window.TTGGearScene={cur:undefined};
 /* kind bộ từ mảng eq của thẻ ({z,s,q}); null nếu không đủ 2 món cùng bộ */
 S.kindFromEq=function(eq){
  try{
   if(!Array.isArray(eq)||typeof EQ_SETS==='undefined')return null;
   const cnt={};
   eq.forEach(it=>{if(!it||it.z==null)return;const z=Math.floor(Number(it.z));if(z>=0&&z<17)cnt[z]=(cnt[z]||0)+1});
   for(const z in cnt)if(cnt[z]>=2&&EQ_SETS[z])return EQ_SETS[z].k;
  }catch(_){}
  return null;
 };
 /* kind bộ đang mặc của người chơi (giống getStartBuffs) */
 S.ownKind=function(){
  try{
   if(typeof eqSetInfo!=='function')return null;
   const on=eqSetInfo().filter(x=>x.on)[0];
   return on&&on.S?on.S.k:null;
  }catch(_){return null}
 };
 function draw(g,x,kind,T,e,q){
  const A=window.TTGGearAura,FX=window.TTGCombatFX,E=FX&&FX.engine;
  if(!A||!E||!kind||typeof A[kind]!=='function')return;
  g.save();g.globalAlpha=1;g.globalCompositeOperation='source-over';
  try{A[kind](g,x,q||0,T,e,E)}catch(_){}
  g.restore();
 }
 S.draw=draw;
 /* Đấu trường: thú mình ở x=85, đối thủ x=272; q=1→0 trong 2.4s đầu giống thám hiểm */
 S.arena=function(g,tt,T,kp,km){
  const q=Math.max(0,Math.min(1,1-T/2.4));
  if(kp)draw(g,85,kp,tt,T,q);
  if(km)draw(g,272,km,tt,T,q);
 };
 /* bọc formation (hàm toàn cục của 03-game-core.js) */
 if(typeof window.formation==='function'&&!window.formation.__gear){
  const orig=window.formation;
  const wrapped=function(t,sp){
   const r=orig.apply(this,arguments);
   try{
    if(typeof c!=='undefined'&&c&&(sp===undefined||sp>=0)){
     const k=S.cur===undefined?S.ownKind():S.cur;
     if(k){
      /* thú đứng ở (180,~194) trên màn chính; hiệu ứng thiết kế cho mặt đất y=203 → kéo lên, phóng nhẹ */
      c.save();c.translate(180,191);c.scale(1.1,1.1);c.translate(-180,-203);
      draw(c,180,k,t,null,0);
      c.restore();
     }
    }
   }catch(_){}
   return r;
  };
  wrapped.__gear=true;
  window.formation=wrapped;
 }
})();
