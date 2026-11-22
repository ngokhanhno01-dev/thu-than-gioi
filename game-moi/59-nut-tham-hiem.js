/* Nạp thêm màn chọn thú đồng hành (65-chon-thu-dau.js). Tạm đặt ở đây để khỏi sửa index.html (78KB); khi sửa index.html lần sau thì chuyển thành 1 dòng <script src="game-moi/65-chon-thu-dau.js"> rồi xóa đoạn này. */
(function(){var s=document.createElement('script');s.src='game-moi/65-chon-thu-dau.js?v=1';document.head.appendChild(s);})();
/* Nạp nút Admin + kho danh hiệu (76-admin-danh-hieu.js), cũng tạm đặt ở đây; sau này chuyển thành <script src> trong index.html. */
(function(){var s=document.createElement('script');s.src='game-moi/76-admin-danh-hieu.js?v=1';document.head.appendChild(s);})();
(function(){
'use strict';
if(!window.TTGNV)return;
TTGNV.add({id:'tham-hiem',ten:'Thám hiểm',image:'game-moi/nut-tham-hiem.webp?v=3',w:124,h:31.6,center:true,onTap:function(){if(window.TTGTHAMHIEM&&TTGTHAMHIEM.start)TTGTHAMHIEM.start();},r:0,offsetY:-7});
})();
/* Nạp danh hiệu nổi trên đầu thú ở sảnh (78-danh-hieu-tren-dau.js). */
(function(){var s=document.createElement('script');s.src='game-moi/78-danh-hieu-tren-dau.js?v=1';document.head.appendChild(s);})();
/* Nạp item Khung UI (79-khung-ui.js). */
(function(){var s=document.createElement('script');s.src='game-moi/79-khung-ui.js?v=1';document.head.appendChild(s);})();
