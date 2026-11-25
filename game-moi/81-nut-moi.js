/* 81-nut-moi.js - 8 NÚT MỚI ở thanh nút (khung dưới). CHỨC NĂNG CHƯA LÀM: bấm chỉ hiện "Sắp ra mắt".
   Icon: game-moi/icon/<id>.webp (khai ở TTGNV.cfg.art), VỊ TRÍ: bảng TTGNV.cfg.bo ở 52-nut-vuong.js.
   Gắn chức năng thật: thay hàm trong bảng FN bên dưới (hoặc gọi TTGNV.add lại ở file riêng của hệ thống đó rồi xóa dòng ở đây).
   Đặt: Vạn Thú Tranh Phong = Đấu trường, Đồ Giám = Sưu tầm, Kỳ Trân Các = Cửa hàng, Bí Cảnh = Phó bản. */
(function(){
'use strict';
if(!window.TTGNV)return;
function soon(ten){return function(){var T=window.TTGTBAO&&TTGTBAO.toast;if(T)T(ten+': sắp ra mắt',2200);};}
var FN=[
  ['dau-truong','Vạn Thú Tranh Phong'],['boss-the-gioi','Boss Thế Giới'],['pho-ban','Bí Cảnh'],['thap-thi-luyen','Tháp Thí Luyện'],
  ['cua-hang','Kỳ Trân Các'],['diem-danh','Điểm danh'],['nhiem-vu','Nhiệm vụ'],['do-giam','Đồ Giám']
];
FN.forEach(function(f){var o={id:f[0],ten:f[1],onTap:soon(f[1])};if(f[0]==='cua-hang')o.onTap=function(){if(window.TTGSHOP)TTGSHOP.open();else soon(f[1])();};/* Kỳ Trân Các: mở bảng cửa hàng (85-cua-hang.js) */if(f[0]==='pho-ban'){o.beside='r';o.w=62;o.h=62;}else if(f[0]==='dau-truong'){o.beside='l';o.w=74;o.h=74;}/* Vạn Thú Tranh Phong (trái) và Bí Cảnh (phải) kẹp hai bên nút Thám hiểm, to hơn nút thường */TTGNV.add(o);});
})();

/* 86-hop-ruong.js (25/11/2026): Hộp Ngự Thú Ngẫu Nhiên + Rương Ngự Thú Tự Chọn. Nạp động cạnh file này nên không cần sửa index.html. */
(function(){try{var cs=document.currentScript,s=document.createElement('script');s.src=(cs&&cs.src?cs.src.replace(/[^\/?#]*([?#].*)?$/,''):'game-moi/')+'86-hop-ruong.js?v=1';s.async=false;document.head.appendChild(s);}catch(e){}})();

/* 87-npc.js (25/11/2026): NPC 6 loại mỗi vùng (dữ liệu + ảnh + khung thoại, Bước 3). Nạp động cạnh file này nên không cần sửa index.html. */
(function(){try{var cs=document.currentScript,s=document.createElement('script');s.src=(cs&&cs.src?cs.src.replace(/[^\/?#]*([?#].*)?$/,''):'game-moi/')+'87-npc.js?v=3';s.async=false;document.head.appendChild(s);}catch(e){}})();

/* 88-npc-boss.js (25/11/2026): bộ máy NPC loại Boss (Khiêu chiến, địch NPC trong trận, phần thưởng). Nạp SAU 87-npc.js (async=false giữ đúng thứ tự). */
(function(){try{var cs=document.currentScript,s=document.createElement('script');s.src=(cs&&cs.src?cs.src.replace(/[^\/?#]*([?#].*)?$/,''):'game-moi/')+'88-npc-boss.js?v=2';s.async=false;document.head.appendChild(s);}catch(e){}})();
