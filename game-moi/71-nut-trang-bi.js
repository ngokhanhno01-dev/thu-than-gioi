/* 71-nut-trang-bi.js - 3 nút vuông chức năng ở khung dưới (cùng khung khung-nut.webp như Balo / Thú Thần):
   Trang bị (hàng trên, sau Thú Thần) -> mở khung Trang bị (55-trang-bi.js: TTGTB.open) · Rèn (hàng trên, sau Trang bị) · Cường hóa (hàng dưới, cột đầu).
   Rèn và Cường hóa mở khung ở 72-khung-ren-cuong-hoa.js (TTGKH.open('ren'|'ch')); logic Đập / Rèn CHƯA làm.
   Nạp SAU 54-thu-than.js và 55-trang-bi.js để thứ tự cột là Balo, Thú Thần, Trang bị, Rèn. */
(function(){
'use strict';
if(!window.TTGNV)return;
var HEAD='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs>';
function G(id,a,b){return '<linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>';}
/* Trang bị: khiên xanh viền vàng + kiếm chéo */
var ICON_TB=HEAD+G('tbA','#a6f6ff','#2d9cff')+G('tbB','#fff6b0','#ffab25')+'</defs>'+
 '<path d="M32 6L54 14V32C54 45 45 54 32 60C19 54 10 45 10 32V14Z" fill="url(#tbA)" stroke="#06335c" stroke-width="3" stroke-linejoin="round"/>'+
 '<path d="M32 12L48 18V32C48 41 42 48 32 53Z" fill="#fff" opacity=".22"/>'+
 '<path d="M32 16V50M20 28H44" stroke="url(#tbB)" stroke-width="6" stroke-linecap="round"/>'+
 '<path d="M32 16V50M20 28H44" stroke="#7a4a00" stroke-width="1.6" stroke-linecap="round" opacity=".55"/></svg>';
/* Rèn: đe + búa */
var ICON_REN=HEAD+G('rnA','#e8eef6','#7f8ea3')+G('rnB','#ffcf7a','#c9701c')+'</defs>'+
 '<path d="M10 38H48C48 32 44 29 38 29H22C18 29 14 31 10 38Z" fill="url(#rnA)" stroke="#1e2a3a" stroke-width="3" stroke-linejoin="round"/>'+
 '<path d="M24 38H44V44H48V52H14V44H20V38Z" fill="url(#rnA)" stroke="#1e2a3a" stroke-width="3" stroke-linejoin="round"/>'+
 '<g transform="rotate(35 44 16)"><rect x="41" y="12" width="6" height="30" rx="2.5" fill="url(#rnB)" stroke="#4a2400" stroke-width="2.4"/><rect x="33" y="4" width="22" height="12" rx="3" fill="url(#rnA)" stroke="#1e2a3a" stroke-width="2.6"/></g>'+
 '<path d="M16 22l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#fff6b0" stroke="#c9701c" stroke-width="1.2"/></svg>';
/* Cường hóa: mũi tên lên + sao sáng trên nền ngọc */
var ICON_CH=HEAD+G('chA','#fff6b0','#ff9a1f')+G('chB','#b8fff0','#14b8c8')+'</defs>'+
 '<path d="M32 4L54 30H40V58H24V30H10Z" fill="url(#chA)" stroke="#6b3a00" stroke-width="3" stroke-linejoin="round"/>'+
 '<path d="M32 10L46 27H36V54H32Z" fill="#fff" opacity=".28"/>'+
 '<path d="M50 40l2.5 6 6 2.5-6 2.5L50 57l-2.5-6-6-2.5 6-2.5z" fill="url(#chB)" stroke="#04464f" stroke-width="1.8" stroke-linejoin="round"/></svg>';
TTGNV.add({id:'trang-bi',ten:'Trang bị',icon:ICON_TB,r:0,onTap:function(){if(window.TTGTB)TTGTB.open();else toast('Sắp có');}});
TTGNV.add({id:'ren',ten:'Rèn',icon:ICON_REN,r:0,onTap:function(){if(window.TTGKH)TTGKH.open('ren');else toast('Rèn: sắp có');}});
TTGNV.add({id:'cuong-hoa',ten:'Cường hóa',icon:ICON_CH,r:1,onTap:function(){if(window.TTGKH)TTGKH.open('ch');else toast('Cường hóa: sắp có');}});
})();
