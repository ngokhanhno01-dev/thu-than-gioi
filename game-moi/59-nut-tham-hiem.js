/* Nạp thêm màn chọn thú đồng hành (65-chon-thu-dau.js). Tạm đặt ở đây để khỏi sửa index.html (78KB); khi sửa index.html lần sau thì chuyển thành 1 dòng <script src="game-moi/65-chon-thu-dau.js"> rồi xóa đoạn này. */
(function(){var s=document.createElement('script');s.src='game-moi/65-chon-thu-dau.js?v=1';document.head.appendChild(s);})();
(function(){
'use strict';
if(!window.TTGNV)return;
TTGNV.add({id:'tham-hiem',ten:'Thám hiểm',image:'game-moi/nut-tham-hiem.webp',w:98,h:40,center:true,onTap:function(){if(window.TTGTHAMHIEM&&TTGTHAMHIEM.start)TTGTHAMHIEM.start();},r:0,offsetY:-1});
})();
