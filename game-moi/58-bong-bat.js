/* 58-bong-bat.js — NGỰ THÚ CHÂU (bóng bắt thú) + BẢNG TỈ LỆ + HẰNG SỐ THÁM HIỂM (Bước 1, chưa gắn giao diện).
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

  /* --- BÓNG THẤP/CAO SO VỚI VÙNG (tính theo từng vùng, delta = z - vùng đầu của bóng = z - (cap-1)*vungMoiCap) ---
     delta 0..2 (vùng nằm trong 3 vùng của bóng): tiLe = tiLeGoc * (1 - giamMoiVung)^delta   (vùng đầu đủ tỉ lệ, vùng sau giảm xíu)
     delta >= 3 (vùng quá cao so với bóng): KHÔNG ném được, cần bóng cấp cao hơn
     delta < 0 (bóng cao hơn vùng): xác suất trượt nhân (1 - buMoiCap)^(|delta|/vungMoiCap) => dễ bắt hơn */
  giamMoiVungThuong:0.10,
  giamMoiVungBoss:0.10,
  buMoiCapThuong:0.35,
  buMoiCapBoss:0.30,
  tiLeToiDa:0.99,          /* không bao giờ chắc chắn 100% */

  /* --- NGỰ THÚ CHÂU: 6 bậc. ic = emoji tạm cho bậc chưa có ảnh; icon ảnh khai ở ANH_ICON bên dưới (bậc nào có ảnh thì dùng ảnh) --- */
  bong:[
    {cap:1,ten:'Thương Hải Châu',ic:'🔵'},
    {cap:2,ten:'Thanh Mộc Châu',ic:'🟢'},
    {cap:3,ten:'Xích Viêm Châu',ic:'🔴'},
    {cap:4,ten:'Tử Tiêu Châu',ic:'🟣'},
    {cap:5,ten:'Tinh Thần Châu',ic:'⭐'},
    {cap:6,ten:'Hỗn Độn Thần Châu',ic:'⚫'}
  ],

  /* ================= THÁM HIỂM (dùng ở Bước 2) ================= */
  tx:{
    tiLeBoss:0.05,                         /* 5% mỗi lượt: chọn đều giữa boss demo và boss main */
    tiLeQuaiMain:0.5,                      /* trong 95% lượt thường: chia đều pool main và demo */
    trongSoQuaiMain:[1,1,1,1,1],           /* 5 quái thường main chọn đều */
    trongSoBoss:{main:1,demo:1},            /* 2 boss chọn đều */
    trongSoLoai:[15,14,13,12,11,10,8,6,6], /* trọng số tương đối cho 9 thú demo */
    trongSoBac:{1:1,2:1,3:1},              /* bậc của thú demo thường: mặc định chia đều */
    bacBoss:3,                             /* boss luôn bậc 3 */
    bacKhiBat:1,                           /* bắt về luôn bậc 1 */
    chenhThuong:[-2,10],                   /* cấp thú hoang = L + số nguyên đều trong [min,max] */
    chenhBoss:10,                          /* boss = L + 10 */
    chenhQuai:[-5,0],                      /* quái cày (chưa có trong game-moi, để dùng sau) */
    capMin:1,capMax:100,
    soLanNem:3,                            /* số lần ném mỗi lần bắt (Bước 3) */
    bongMoiLanNem:1,                       /* mỗi lần ném trừ 1 bóng (ĐÃ CHỐT) */
    thoiGianNemGiay:60                     /* hết 60 giây mà chưa bắt được: thú hoang bỏ chạy, về sảnh (ĐÃ CHỐT) */
  }
};

/* ICON ẢNH: ảnh PNG 96x96 nền trong suốt, nhúng dạng data URI. Bậc 1 = Thương Hải Châu. Thêm bậc khác: thêm khóa 2..6 (chuỗi 'data:image/png;base64,...' hoặc đường dẫn file ảnh) */
var ANH_ICON={1:'data:image/png;base64,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'};

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
  var delta=(vung||0)-(capBong-1)*CFG.vungMoiCap;
  if(delta>=CFG.vungMoiCap)return null;                          /* vùng quá cao so với bóng */
  var bang=laBoss?CFG.tiLeBoss:CFG.tiLeThuong,i=0;
  while(i<CFG.mocHP.length-1&&phanTramHP>=CFG.mocHP[i])i++;
  var goc=bang[i],p;
  if(delta>=0)p=goc*Math.pow(1-(laBoss?CFG.giamMoiVungBoss:CFG.giamMoiVungThuong),delta);
  else p=1-(1-goc)*Math.pow(1-(laBoss?CFG.buMoiCapBoss:CFG.buMoiCapThuong),-delta/CFG.vungMoiCap);
  return Math.min(CFG.tiLeToiDa,p);
}

/* bóng có dùng được ở vùng này không (để Bước 3 lọc bóng trong Balo) */
function dungDuoc(capBong,vung){return ((vung||0)-((capBong|0)-1)*CFG.vungMoiCap)<CFG.vungMoiCap;}

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
    o[idBong(b.cap)]={loai:'bong',ten:b.ten,cap:b.cap,ic:b.ic,img:ANH_ICON[b.cap]||null,
      mo:'Dành cho vùng '+z0+'-'+z1+'. Vùng sau trong dải thì tỉ lệ giảm dần; vùng thấp hơn thì dễ bắt hơn; vùng cao hơn dải thì không ném được.'};
  }
  B.reg(o);
  return true;
}
dangKy();

window.TTGBONG={CFG:CFG,capVung:capVung,tinhTiLe:tinhTiLe,dungDuoc:dungDuoc,idBong:idBong,dangKy:dangKy};
})();
