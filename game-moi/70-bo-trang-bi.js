/* 70-bo-trang-bi.js — ĐÃ TẮT aura bộ trang bị (22/11/2026).
   Lý do: hiệu ứng aura bộ đã có ở Rank; trận chỉ cần hiệu ứng ĐÒN 17 vùng + hiệu ứng KÍCH HOẠT (Dung Nham, Lôi Phạt, Phong Nhận...).
   Giữ file và API TTGBO để index.html (drawGearAura) không lỗi: kind() luôn trả null nên không vẽ gì.
   Có thể xóa file này + 41-gear-aura.js + 42-gear-pixel.js + hàm drawGearAura/thẻ script trong index.html khi dọn dẹp. */
(function(root){
'use strict';
root.TTGBO={KINDS:[],NEED:4,kind:function(){return null;},draw:function(){return false;}};
})(typeof window!=='undefined'?window:globalThis);
