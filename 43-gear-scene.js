/* ===== [FX 3C-mở rộng] Buff bộ trang bị hiện ở SẢNH CHÍNH, THẺ (23-view), KHUNG TOP + trận ĐẤU TRƯỜNG =====
   Dùng lại đúng hiệu ứng TTGGearAura (41/42), chỉ VẼ, không đụng cơ chế/chỉ số/lưu.
   - Sảnh chính, thẻ, khung top đều gọi formation() (bệ dưới chân thú) → bọc formation: vẽ aura NGAY SAU bệ, trước khi vẽ thú.
     TTGGearScene.cur: undefined = dùng bộ đang mặc của mình (sảnh chính); null = không có bộ; chuỗi = kind bộ của thẻ người khác.
   - Đấu trường (trận): 26-arena.js gọi TTGGearScene.arena(...) ngay sau drawArenaBack.
   Chỉ hiện khi mặc ĐỦ 4 món cùng bộ (người dùng yêu cầu). */
(()=>{
 'use strict';
 const S=window.TTGGearScene={cur:undefined};
 /* kind bộ từ mảng eq của thẻ ({z,s,q}); null nếu không đủ 2 món cùng bộ */
 S.kindFromEq=function(eq){
  try{
   if(!Array.isArray(eq)||typeof EQ_SETS==='undefined')return null;
   const cnt={};
   eq.forEach(it=>{if(!it||it.z==null)return;const z=Math.floor(Number(it.z));if(z>=0&&z<17)cnt[z]=(cnt[z]||0)+1});
   for(const z in cnt)if(cnt[z]>=4&&EQ_SETS[z])return EQ_SETS[z].k;
  }catch(_){}
  return null;
 };
 /* kind bộ đang mặc của người chơi (giống getStartBuffs) */
 S.ownKind=function(){
  try{
   if(typeof eqSetInfo!=='function')return null;
   const on=eqSetInfo().filter(x=>x.full)[0];
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

/* ===== [FX 4A sửa] Sự kiện bộ trang bị (Dung Nham / Lôi Kích / Phong Nhận) chỉ chạy hiệu ứng SỰ KIỆN, không chạy kèm đòn thường =====
   Nguyên nhân: đấu trường đặt nhãn "Dung Nham -N", "Lôi Kích -N", "Phong Nhận -N" khác nhãn thám hiểm ("Dung Nham Phun Trào",
   "Lôi Phạt giáng xuống") nên các lớp 33–40 không nhận ra đây là sự kiện đặc biệt → vẽ thêm cả đòn đánh thường (thú lao tới + đạn/vệt chém của vùng)
   rồi mới tới hiệu ứng sự kiện = 2 hiệu ứng cùng lúc.
   Cách sửa (chỉ VẼ, không đụng sát thương/chỉ số/lưu): ở pha ra đòn, đổi tên tạm cho khớp nhãn thám hiểm để các lớp trước giao lại cho hiệu ứng gốc
   của 31 (dung nham nứt đất / sét giáng); Phong Nhận không vẽ pha ra đòn (vệt gió vẽ ở pha trúng); fxClass coi Dung Nham đấu trường là lớp 2 (không lao tới). */
(()=>{
 'use strict';
 const LAVA=/Dung Nham(?! Phun Trào)\s*-/,THUN=/Lôi Kích\s*-/,WIND=/Phong Nhận(?: chém thêm| -)/;
 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.drawAttack||!API.__fx3a){if(tries++<240)setTimeout(boot,50);return}   /* chờ 40-attack-fx-3a bọc xong để bọc ngoài cùng */
  if(API.__procfix)return;API.__procfix=1;
  const prev=API.drawAttack;
  API.drawAttack=function(g,T,S){
   const t=(S&&S.text)||'';
   if(WIND.test(t))return true;
   let t2=t;
   if(LAVA.test(t))t2=t.replace('Dung Nham','Dung Nham Phun Trào');
   else if(THUN.test(t))t2=t.replace('Lôi Kích','Lôi Phạt giáng xuống');
   if(t2===t)return prev.apply(this,arguments);
   S.text=t2;
   try{return prev.apply(this,arguments)}finally{S.text=t}
  };
 }
 boot();
 const F=window.TTGFX;
 if(F&&typeof F.fxClass==='function'&&!F.fxClass.__proc){
  const o=F.fxClass,w=function(x){return LAVA.test((x&&x.t)||'')?2:o(x)};
  w.__proc=1;F.fxClass=w;
 }
})();

/* ===== [FX 4A] Nhãn tên SỰ KIỆN bộ trang bị ngay trên thú trong ĐẤU TRƯỜNG (thú mình và thú đối thủ đều có) =====
   Khi buff bộ kích hoạt (ví dụ Dung Nham Phun Trào) → hiện 1 dòng chữ tên sự kiện phía trên đầu thú CHỦ BUFF, hiện nhanh, giữ, rồi mờ dần.
   Chỉ VẼ: bọc TTGFX.impact (đấu trường lấy hàm này lúc bắt đầu trận); không đụng sát thương/chỉ số/lưu.
   [regex khớp, tên hiển thị, màu, chủ buff: 0 = bên ra sự kiện, 1 = bên đối diện (buff phòng thủ)] */
(()=>{
 'use strict';
 const EVN=[
  [/Dung Nham Phun Trào|Dung Nham\s*-/,'Dung Nham Phun Trào','#ff8a3a',0],
  [/Lôi Phạt giáng|Lôi Kích\s*-/,'Lôi Phạt Giáng Xuống','#ffe53a',0],
  [/Phong Nhận(?: chém thêm| -)/,'Phong Nhận Chém Thêm','#a0ffd0',0],
  [/Nguyệt Ảnh phản kích/,'Nguyệt Ảnh Phản Kích','#b8a8ff',0],
  [/Sinh Cơ(?: Cổ Thụ)? \+/,'Sinh Cơ Cổ Thụ','#8be04a',0],
  [/\(Ngọc Hộ Mệnh\)/,'Ngọc Hộ Mệnh','#ffe27a',0],
  [/ẩn mình trong mây/,'Vân Ẩn','#c9d8ff',1],
  [/Sương Tán giảm nửa/,'Sương Tán','#9fd9c8',1]
 ];
 function evName(t){for(const a of EVN)if(a[0].test(t))return a;return null}
 function banner(g,fx){
  const a=evName(fx.text||'');if(!a)return;
  const own=a[3]?!fx.pp:!!fx.pp;                 /* true = thú của mình (bên trái x=85), false = thú đối thủ (x=272) */
  const q=Math.max(0,Math.min(1,fx.q||0));
  const al=Math.min(1,q/.1,(1-q)/.25+.15);       /* hiện nhanh, giữ, mờ dần ở cuối */
  if(!(al>.01))return;
  g.save();
  g.globalAlpha=Math.max(0,Math.min(1,al));g.font='bold 13px monospace';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
  const w=g.measureText(a[1]).width,x=Math.max(w/2+4,Math.min(356-w/2,own?85:272)),y=50-q*5;
  g.lineWidth=4;g.strokeStyle='rgba(16,8,24,.92)';g.strokeText(a[1],x,y);
  g.fillStyle=a[2];g.fillText(a[1],x,y);
  g.restore();
 }
 const F=window.TTGFX;
 if(F&&typeof F.impact==='function'&&!F.impact.__evn){
  const o=F.impact,w=function(g,fx){
   const r=o.apply(this,arguments);
   try{if(fx)banner(g,fx)}catch(_){}
   return r;
  };
  w.__evn=1;F.impact=w;
 }
})();
