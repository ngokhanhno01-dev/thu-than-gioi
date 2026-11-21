/* 43-su-kien-bo.js — Phong Nhận chém thêm chỉ vẽ pha TRÚNG (vệt gió), không vẽ pha ra đòn của vùng. Các sự kiện bộ khác (Dung Nham, Lôi Phạt, Nguyệt Ảnh) dùng đúng nhãn của 31/33–40 nên không cần bọc.
   Nạp SAU 40-attack-fx-3a (chờ API.__fx3a) và TRƯỚC 57-fx-ky-nang-boss (57 chờ API.__procfix để nằm ngoài cùng). Luật bộ trang bị: 70-bo-trang-bi.js. */
(()=>{
 'use strict';
 const WIND=/Phong Nhận(?: chém thêm| -)/;
 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.drawAttack||!API.__fx3a){if(tries++<240)setTimeout(boot,50);return}
  if(API.__procfix)return;API.__procfix=1;
  const prev=API.drawAttack;
  API.drawAttack=function(g,T,S){return WIND.test((S&&S.text)||'')?true:prev.apply(this,arguments)};
 }
 boot();
})();
