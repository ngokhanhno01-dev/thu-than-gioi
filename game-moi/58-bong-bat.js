/* 58-bong-bat.js — BÓNG BẮT THÚ + BẢNG TỈ LỆ + HẰNG SỐ THÁM HIỂM (Bước 1, chưa gắn giao diện).
   Hàm thuần, không DOM. Mọi con số nằm ở khối CFG ngay dưới để dễ chỉnh.
   Nạp sau 53-balo.js (cần window.TTGBALO.reg). */
(function(){
'use strict';

/* ================= CFG: CHỈNH SỐ Ở ĐÂY ================= */
var CFG={
  /* --- BÓNG: 6 cấp, 17 vùng chia đều: mỗi cấp bóng "phụ trách" 3 vùng (z 0-2 -> bóng 1, 3-5 -> bóng 2, ... 15-16 -> bóng 6) --- */
  capBongMax:6,
  vungMoiCap:3,            /* số vùng mỗi cấp bóng phụ trách. capVung(z) = min(capBongMax, floor(z / vungMoiCap) + 1) */

  /* --- TỈ LỆ BẮT: bóng đúng cấp vùng (chênh = 0). Mốc HP còn lại, tính theo % --- */
  mocHP:[20,30,40,50,60],  /* dưới 20, dưới 30, dưới 40, dưới 50, dưới 60. Từ 60 trở lên: KHÔNG ném được (tinhTiLe trả null) */
  /* xác suất (0..1) ứng với từng mốc ở trên, theo thứ tự */
  tiLeThuong:[0.65,0.50,0.38,0.28,0.18],
  tiLeBoss:  [0.25,0.18,0.12,0.08,0.05],   /* boss khó bắt hơn */

  /* --- BÓNG CAO HƠN VÙNG: mỗi cấp chênh làm xác suất "trượt" nhân thêm (1 - buMoiCap).
         tiLe = 1 - (1 - tiLeGoc) * (1 - buMoiCap)^chenh. Ví dụ buMoiCap 0,35: chênh 1 -> trượt còn 65% so với gốc. --- */
  buMoiCapThuong:0.35,
  buMoiCapBoss:0.30,
  tiLeToiDa:0.99,          /* không bao giờ chắc chắn 100% */

  /* --- BÓNG THẤP HƠN VÙNG: capBong < capVung -> KHÔNG bắt được (tinhTiLe trả null) --- */

  /* --- BÓNG: tên + emoji tạm (sẽ thay bằng ảnh) --- */
  bong:[
    {cap:1,ten:'Bóng cấp 1',ic:'⚪'},
    {cap:2,ten:'Bóng cấp 2',ic:'🟢'},
    {cap:3,ten:'Bóng cấp 3',ic:'🔵'},
    {cap:4,ten:'Bóng cấp 4',ic:'🟣'},
    {cap:5,ten:'Bóng cấp 5',ic:'🟠'},
    {cap:6,ten:'Bóng cấp 6',ic:'🔴'}
  ],

  /* ================= THÁM HIỂM (dùng ở Bước 2) ================= */
  tx:{
    tiLeBoss:0.05,                         /* 5% mỗi lượt, KHÔNG có chống đen */
    trongSoLoai:[15,14,13,12,11,10,8,6,6], /* thú 1..9 của vùng, tổng 95 (khớp 95% còn lại) */
    trongSoBac:{1:1,2:1,3:1},              /* bậc tiến hóa thú thường khi gặp: mặc định chia đều */
    bacBoss:3,                             /* boss luôn bậc 3 */
    bacKhiBat:1,                           /* bắt về luôn bậc 1 */
    chenhThuong:[-2,10],                   /* cấp thú hoang = L + số nguyên đều trong [min,max] */
    chenhBoss:10,                          /* boss = L + 10 */
    chenhQuai:[-5,0],                      /* quái cày (chưa có trong game-moi, để dùng sau) */
    capMin:1,capMax:100,
    soLanNem:3,                            /* số lần ném mỗi lần bắt (Bước 3) */
    bongMoiLanNem:1                        /* mỗi lần ném trừ 1 bóng (CHỜ CHỐT) */
  }
};

/* ================= HÀM ================= */
function clamp(x,a,b){return x<a?a:(x>b?b:x);}

/* cấp bóng "đúng" của một vùng; z = chỉ số vùng 0..16 */
function capVung(z){
  z=(z|0);if(z<0)z=0;
  return Math.min(CFG.capBongMax,Math.floor(z/CFG.vungMoiCap)+1);
}

/* xác suất bắt (0..1) hoặc null nếu không ném được.
   capBong: 1..6. phanTramHP: 0..100 (HP còn lại của thú hoang). laBoss: true/false. vung: chỉ số vùng z của thú hoang (mặc định 0). */
function tinhTiLe(capBong,phanTramHP,laBoss,vung){
  capBong=capBong|0;
  if(!(capBong>=1))return null;
  if(!(phanTramHP<CFG.mocHP[CFG.mocHP.length-1]))return null;   /* từ 60% trở lên (hoặc NaN) */
  var chenh=capBong-capVung(vung||0);
  if(chenh<0)return null;                                        /* bóng thấp, vùng quá cao */
  var bang=laBoss?CFG.tiLeBoss:CFG.tiLeThuong,i=0;
  while(i<CFG.mocHP.length-1&&phanTramHP>=CFG.mocHP[i])i++;
  var goc=bang[i],bu=laBoss?CFG.buMoiCapBoss:CFG.buMoiCapThuong;
  var p=1-(1-goc)*Math.pow(1-bu,chenh);
  return Math.min(CFG.tiLeToiDa,p);
}

/* bóng có dùng được ở vùng này không (để Bước 3 lọc bóng trong Balo) */
function dungDuoc(capBong,vung){return (capBong|0)>=capVung(vung||0);}

/* id item trong Balo cho từng cấp: bong-1 .. bong-6 */
function idBong(cap){return 'bong-'+cap;}

/* khai item vào Balo */
function dangKy(){
  var B=window.TTGBALO;
  if(!B||typeof B.reg!=='function')return false;
  var o={},i,b,z0,z1;
  for(i=0;i<CFG.bong.length;i++){
    b=CFG.bong[i];
    z0=(b.cap-1)*CFG.vungMoiCap+1;
    z1=b.cap>=CFG.capBongMax?17:b.cap*CFG.vungMoiCap;
    o[idBong(b.cap)]={loai:'bong',ten:b.ten,cap:b.cap,ic:b.ic,
      mo:'Dành cho vùng '+z0+'-'+z1+'. Ném vùng thấp hơn thì tỉ lệ bắt cao hơn; vùng cao hơn thì không bắt được.'};
  }
  B.reg(o);
  return true;
}
dangKy();

window.TTGBONG={CFG:CFG,capVung:capVung,tinhTiLe:tinhTiLe,dungDuoc:dungDuoc,idBong:idBong,dangKy:dangKy};
})();
