/* 58-bong-bat.js - BÓNG BẮT THÚ + BẢNG TỈ LỆ BẮT + SỐ LIỆU THÁM HIỂM (thuần số liệu, chưa gắn giao diện).
   Cần 53-balo.js (TTGBALO) nạp trước. Xuất window.TTGBONG.
   MỌI SỐ CHỈNH Ở KHỐI CFG NGAY DƯỚI (đây là số ĐỀ XUẤT MẶC ĐỊNH, chờ chủ game chốt).
   API: TTGBONG.tinhTiLe(capBong, phanTramHP, laBoss) -> xác suất 0..1, hoặc null nếu không ném được (HP từ 60% trở lên, hoặc cấp bóng không có)
        TTGBONG.idBong(cap) -> id item trong Balo ('bong-1'..), TTGBONG.CFG */
(function(root){
'use strict';

/* ===== CFG: toàn bộ số chỉnh ở đây ===== */
var CFG={
  /* Mốc %HP còn lại của thú hoang: phần trăm < mốc thì dùng cột đó. Từ MOC_MAX trở lên KHÔNG ném được. */
  moc:[20,30,40,50,60],
  /* Tỉ lệ bắt (%) theo cấp bóng. Mỗi dòng = 5 mốc HP: [<20, <30, <40, <50, <60]. Cấp bóng = số thứ tự dòng (bóng 1 = dòng đầu). */
  thuong:[
    [65,50,38,28,18],   /* bóng 1 */
    [80,68,55,43,32],   /* bóng 2 */
    [92,84,74,62,50]    /* bóng 3 */
  ],
  boss:[                /* boss khó bắt hơn hẳn */
    [25,18,12,8,5],     /* bóng 1 */
    [40,30,22,15,10],   /* bóng 2 */
    [60,48,38,28,20]    /* bóng 3 */
  ],
  /* Item Bóng trong Balo (tạm dùng emoji, chờ ảnh) */
  item:[
    {ten:'Bóng thường',ic:'⚪',mo:'Bóng bắt thú cơ bản.'},
    {ten:'Bóng bạc',ic:'🥈',mo:'Tỉ lệ bắt cao hơn bóng thường.'},
    {ten:'Bóng vàng',ic:'🥇',mo:'Bóng bắt thú cao cấp.'}
  ],
  /* ----- Số liệu Thám hiểm (dùng ở Bước 2, đã chốt) ----- */
  bossPct:5,                                  /* % mỗi lượt gặp boss, KHÔNG chống đen */
  trongSoLoai:[15,14,13,12,11,10,8,6,6],      /* % cho thú thường 1..9 của vùng (tổng 95) */
  trongSoBac:[1,1,1],                         /* trọng số bậc tiến hóa 1/2/3 của thú thường (chia đều); boss luôn bậc 3 */
  bacBoss:3,
  bacKhiBat:1,                                /* bắt về luôn bậc 1 */
  chenhCap:{min:-2,max:10},                   /* cấp thú hoang = cấp thú ra trận + ngẫu nhiên đều min..max, kẹp [1,100] */
  chenhCapBoss:{min:10,max:10},               /* boss: mặc định +10 (chưa chốt) */
  chenhCapQuai:{min:-5,max:0}                 /* quái cày (chưa có trong game mới) */
};

function idBong(cap){return 'bong-'+cap;}

/* Xác suất bắt (0..1). phanTramHP là 0..100. Trả null nếu không ném được. */
function tinhTiLe(capBong,phanTramHP,laBoss){
  var b=laBoss?CFG.boss:CFG.thuong,c=Math.floor(+capBong),p=+phanTramHP,i;
  if(!(c>=1&&c<=b.length)||!(p>=0)||p>=CFG.moc[CFG.moc.length-1])return null;
  for(i=0;i<CFG.moc.length;i++)if(p<CFG.moc[i])return b[c-1][i]/100;
  return null;
}

/* Khai 3 bóng vào Balo (id bong-1..3, khác id bóng demo ?balo=demo nên không đụng nhau) */
if(root.TTGBALO&&root.TTGBALO.reg){
  var o={};
  CFG.item.forEach(function(it,i){o[idBong(i+1)]={loai:'bong',ten:it.ten,cap:i+1,ic:it.ic,mo:it.mo};});
  root.TTGBALO.reg(o);
}

root.TTGBONG={CFG:CFG,tinhTiLe:tinhTiLe,idBong:idBong};
if(typeof module!=='undefined'&&module.exports)module.exports=root.TTGBONG;
})(typeof window!=='undefined'?window:this);
