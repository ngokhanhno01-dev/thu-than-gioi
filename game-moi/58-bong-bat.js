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

  /* --- NGỰ THÚ CHÂU: 6 bậc. ic = emoji tạm (hiện khi chưa có file ảnh). Ảnh icon: xem ANH_ICON bên dưới --- */
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
    tiLeBoss:0.04,                          /* 4% mỗi lượt gặp boss; boss thú hoang (Truyền Thuyết) ~0,5% mỗi lượt, vẫn hiếm hơn Huyền Thoại (~1%) */
    tiLeQuaiMain:0.7,                      /* trong 95% lượt thường: 70% gặp QUÁI (pool main, 102 quái), 30% gặp THÚ HOANG (pool demo, 60 thú). Chỉnh số này để đổi tỉ lệ (0.5 = ngang nhau) */
    trongSoQuaiMain:[1,1,1,1,1],           /* 5 quái thường main chọn đều */
    trongSoBoss:{main:7,demo:1},            /* boss quái 7 : boss thú hoang 1 (boss quái ~3,5%/lượt, boss thú hoang ~0,5%/lượt) */
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

/* ICON ẢNH của từng bậc châu = sprite trạng thái 1 (closed) của bộ Ngự Thú Châu mới: game-moi/img/chau/bac{1..6}-closed.png (PNG nền trong suốt, sinh bằng tools/cat_chau_vfx.py; dùng chung bộ ảnh -absorbing/-shaking/-success/-failed của 62-bat-thu.js). Chưa có file thì item vẫn dùng emoji ic ở trên, có file thì tự đổi sang ảnh. */
var ANH_ICON={1:'game-moi/img/chau/bac1-closed.png',2:'game-moi/img/chau/bac2-closed.png',3:'game-moi/img/chau/bac3-closed.png',4:'game-moi/img/chau/bac4-closed.png',5:'game-moi/img/chau/bac5-closed.png',6:'game-moi/img/chau/bac6-closed.png'};

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
    o[idBong(b.cap)]={loai:'bong',ten:b.ten,cap:b.cap,ic:b.ic,
      mo:'Dành cho vùng '+z0+'-'+z1+'. Vùng sau trong dải thì tỉ lệ giảm dần; vùng thấp hơn thì dễ bắt hơn; vùng cao hơn dải thì không ném được.'};
  }
  B.reg(o);
  /* nâng icon emoji lên ảnh khi file ảnh tải được (không có file thì giữ emoji) */
  Object.keys(ANH_ICON).forEach(function(cap){
    var im=new Image(),id=idBong(cap);
    im.onload=function(){var it=o[id];if(it){it.img=ANH_ICON[cap];var u={};u[id]=it;B.reg(u);}};
    im.src=ANH_ICON[cap];
  });
  return true;
}
dangKy();

window.TTGBONG={CFG:CFG,capVung:capVung,tinhTiLe:tinhTiLe,dungDuoc:dungDuoc,idBong:idBong,dangKy:dangKy};
})();
