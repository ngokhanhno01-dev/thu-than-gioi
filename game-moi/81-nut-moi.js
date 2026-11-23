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
FN.forEach(function(f){TTGNV.add({id:f[0],ten:f[1],onTap:soon(f[1])});});
})();
