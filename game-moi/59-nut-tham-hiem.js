/* Nạp thêm màn chọn thú đồng hành (65-chon-thu-dau.js). Tạm đặt ở đây để khỏi sửa index.html (78KB); khi sửa index.html lần sau thì chuyển thành 1 dòng <script src="game-moi/65-chon-thu-dau.js"> rồi xóa đoạn này. */
(function(){var s=document.createElement('script');s.src='game-moi/65-chon-thu-dau.js?v=1';document.head.appendChild(s);})();
/* Nạp nút Admin + kho danh hiệu (76-admin-danh-hieu.js), cũng tạm đặt ở đây; sau này chuyển thành <script src> trong index.html. */
(function(){var s=document.createElement('script');s.src='game-moi/76-admin-danh-hieu.js?v=1';document.head.appendChild(s);})();
(function(){
'use strict';
if(!window.TTGNV)return;
/* NÚT THÁM HIỂM = icon lớn đặt GIỮA thanh nút, cách đều viền trên và viền dưới (kích thước/vị trí: TTGNV.cfg.heroH, heroCy trong 52-nut-vuong.js). Khung dài cuối icon là chỗ hiện tên vùng đang chọn (80-danh-vong.js gắn chữ).
   Bấm icon = mở bảng chọn vùng (80-danh-vong.js, khung-chon-vung.webp); chọn vùng xong tự đi thám hiểm. Thanh tên vùng ở dưới icon chỉ HIỂN THỊ vùng đang ở. */
TTGNV.add({id:'tham-hiem',ten:'Thám hiểm',image:'game-moi/icon/tham-hiem.webp?v=1',hero:true,center:true,ratio:960/879,
  onTap:function(){if(window.TTGDV&&TTGDV.mo)TTGDV.mo();else if(window.TTGTHAMHIEM&&TTGTHAMHIEM.start)TTGTHAMHIEM.start();}});
})();
/* Nạp danh hiệu nổi trên đầu thú ở sảnh (78-danh-hieu-tren-dau.js). */
(function(){var s=document.createElement('script');s.src='game-moi/78-danh-hieu-tren-dau.js?v=2';document.head.appendChild(s);})();
/* Nạp item Khung UI (79-khung-ui.js). */
(function(){var s=document.createElement('script');s.src='game-moi/79-khung-ui.js?v=1';document.head.appendChild(s);})();
/* Nạp Danh Vọng + nút chọn vùng (80-danh-vong.js). */
(function(){var s=document.createElement('script');s.src='game-moi/80-danh-vong.js?v=9';document.head.appendChild(s);})();
