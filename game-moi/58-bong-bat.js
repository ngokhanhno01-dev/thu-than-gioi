/* 58-bong-bat.js — NGỰ THÚ CHÂU (bóng bắt thú) + BẢNG TỈ LỆ + HẰNG SỐ THÁM HIỂM.
   Hàm thuần, không DOM. Mọi con số nằm ở khối CFG ngay dưới để dễ chỉnh.
   Nạp sau 53-balo.js (cần window.TTGBALO.reg). */
(function(){
'use strict';

/* ================= CFG: CHỈNH SỐ Ở ĐÂY ================= */
var CFG={
  /* --- NGỰ THÚ CHÂU (đổi 27/11/2026): châu 1-4 = 4 BẬC thường (Hoàng < Huyền < Địa < Thiên Giai), châu 5-6 = bậc ĐẶC BIỆT.
     Không còn giới hạn vùng: châu nào cũng ném được ở mọi vùng. Không phụ thuộc máu, không phụ thuộc Rank. --- */
  capBongMax:6,
  bong:[
    {cap:1,ten:'Thương Hải Châu',bac:'Hoàng Giai',ic:'🔵'},
    {cap:2,ten:'Thanh Mộc Châu',bac:'Huyền Giai',ic:'🟢'},
    {cap:3,ten:'Xích Viêm Châu',bac:'Địa Giai',ic:'🔴'},
    {cap:4,ten:'Tử Tiêu Châu',bac:'Thiên Giai',ic:'🟣'},
    {cap:5,ten:'Tinh Thần Châu',bac:'Đặc Biệt',ic:'⭐',dacBiet:true},
    {cap:6,ten:'Hỗn Độn Thần Châu',bac:'Đặc Biệt',ic:'⚫',dacBiet:true}
  ],

  /* --- TỈ LỆ BẮT châu thường (cap 1-4) ở VÙNG 1, theo độ hiếm loài (56b-loai.js). Thứ tự cột = cap 1..4.
     Vùng N (vùng người chơi thấy, = z + 1): tiLe = goc * (1 - giamMoiVung[cap])^(N - 1). Giảm theo tỉ lệ nên không bao giờ về 0.
     Boss thú hoang dùng CHUNG bảng này theo độ hiếm (Truyền Thuyết), không còn bảng boss riêng. --- */
  tiLeGoc:{
    thuong:      [0.86,0.92,0.96,0.99],
    hiem:        [0.60,0.74,0.86,0.94],
    suthi:       [0.30,0.48,0.66,0.82],
    huyenthoai:  [0.10,0.22,0.40,0.60],
    truyenthuyet:[0.02,0.07,0.18,0.35]
  },
  giamMoiVung:[0.07,0.05,0.035,0.02],
  tiLeToiDa:0.99,          /* châu thường không bao giờ chắc chắn 100% */
  doHiemKhongBat:['than'], /* 3 thú Thần chỉ có từ trứng */

  /* --- CHÂU ĐẶC BIỆT: bắt 100% mọi thú bắt được, và TUNG LẠI Rank trong khoảng riêng (để săn Rank).
     Trọng số TẠM (người dùng nhờ tính, chưa chốt), tổng = 100. Rank lúc gặp cao hơn Rank tung ra thì giữ Rank lúc gặp. --- */
  rankDacBiet:{
    5:{B:45,A:32,S:18,SS:5},          /* Tinh Thần Châu: B..SS */
    6:{A:50,S:33,SS:15,SR:2}          /* Hỗn Độn Thần Châu: A..SR */
  },
  rankThuTu:['E','D','C','B','A','S','SS','SR'],

  /* ================= THÁM HIỂM (dùng ở Bước 2) ================= */
  tx:{
    tiLeBoss:0.04,                          /* 4% cơ hội Boss QUÁI tại điểm rung Khu 4; Boss thú vẫn đứng riêng trên bản đồ */
    tiLeQuaiMain:0.7,                      /* trong 95% lượt thường: 70% gặp QUÁI (pool main, 102 quái), 30% gặp THÚ HOANG (pool demo, 60 thú). Chỉnh số này để đổi tỉ lệ (0.5 = ngang nhau) */
    trongSoQuaiMain:[1,1,1,1,1],           /* 5 quái thường main chọn đều */
    trongSoBoss:{main:7,demo:1},            /* boss quái 7 : boss thú hoang 1 (boss quái ~3,5%/lượt, boss thú hoang ~0,5%/lượt) */
    trongSoLoai:[15,14,13,12,11,10,8,6,6], /* trọng số tương đối cho 9 thú demo */
    trongSoBac:{1:6,2:3,3:1},              /* V1 60%, V2 30%, V3 10% cho mọi lượt sinh thú/quái */
    bacBoss:3,                             /* boss luôn bậc 3 */
    bacKhiBat:1,                           /* bắt về luôn bậc 1 */
    chenhThuong:[-2,10],                   /* DỰ PHÒNG tương thích; cấp mới lấy theo vùng + độ hiếm trong 61 */
    chenhBoss:10,                          /* DỰ PHÒNG tương thích; Boss mới lấy cấp theo vùng */
    chenhQuai:[-5,0],                      /* DỰ PHÒNG tương thích; quái mới lấy cấp theo vùng + độ hiếm */
    capMin:1,capMax:270,
    soLanNem:2,                            /* tối đa 2 lần ném mỗi con (chốt 27/11/2026); trúng thì dừng */
    bongMoiLanNem:1,                       /* mỗi lần ném trừ 1 bóng (ĐÃ CHỐT) */
    thoiGianChonGiay:30                    /* thú gục: 30 giây chung cho chọn Bắt/Giết VÀ ném. Hết giờ: chưa ném lần nào = Giết; đã ném hụt = thú chạy */
  }
};

/* ICON ẢNH của từng bậc châu = sprite trạng thái 1 (closed) của bộ Ngự Thú Châu mới: game-moi/img/chau/bac{1..6}-closed.png (PNG nền trong suốt, sinh bằng tools/cat_chau_vfx.py; dùng chung bộ ảnh -absorbing/-shaking/-success/-failed của 62-bat-thu.js). Chưa có file thì item vẫn dùng emoji ic ở trên, có file thì tự đổi sang ảnh. */
var ANH_ICON={1:'game-moi/img/chau/bac1-closed.png',2:'game-moi/img/chau/bac2-closed.png',3:'game-moi/img/chau/bac3-closed.png',4:'game-moi/img/chau/bac4-closed.png',5:'game-moi/img/chau/bac5-closed.png',6:'game-moi/img/chau/bac6-closed.png'};

/* ================= HÀM ================= */
function laDacBiet(cap){var b=CFG.bong[(cap|0)-1];return !!(b&&b.dacBiet);}

/* xác suất bắt (0..1), hoặc null nếu con này không bắt được bằng châu.
   cap: 1..6. doHiem: 'thuong'..'truyenthuyet' (TTGCS.doHiem). z: chỉ số vùng trong code (0 = Vùng 1). */
function tiLeBat(cap,doHiem,z){
  cap=cap|0;if(cap<1||cap>CFG.capBongMax)return null;
  if(CFG.doHiemKhongBat.indexOf(doHiem)>=0)return null;
  if(laDacBiet(cap))return 1;
  var hang=CFG.tiLeGoc[doHiem]||CFG.tiLeGoc.thuong,n=Math.max(0,Math.floor(Number(z)||0));
  return Math.min(CFG.tiLeToiDa,hang[cap-1]*Math.pow(1-CFG.giamMoiVung[cap-1],n));
}
/* tương thích chỗ gọi cũ (62-bat-thu.js): tham số máu & boss bỏ qua, cần thêm doHiem */
function tinhTiLe(cap,_hp,_boss,z,doHiem){return tiLeBat(cap,doHiem||(_boss?'truyenthuyet':'thuong'),z);}

/* Rank của thú bắt được. Châu thường: giữ Rank lúc gặp. Châu đặc biệt: tung lại trong khoảng, giữ cái cao hơn. */
function rankKhiBat(cap,rankGap,rng){
  var T=CFG.rankDacBiet[cap|0];if(!T)return rankGap;
  rng=typeof rng==='function'?rng:Math.random;
  var ks=Object.keys(T),tong=0,i,x;for(i=0;i<ks.length;i++)tong+=T[ks[i]];
  x=rng()*tong;var r=ks[ks.length-1];for(i=0;i<ks.length;i++){x-=T[ks[i]];if(x<0){r=ks[i];break;}}
  var o=CFG.rankThuTu;return o.indexOf(rankGap)>o.indexOf(r)?rankGap:r;
}

/* không còn giới hạn vùng (giữ hàm cho chỗ gọi cũ) */
function capVung(){return 1;}
function dungDuoc(){return true;}

/* id item trong Balo cho từng cấp: bong-1 .. bong-6 */
function idBong(cap){return 'bong-'+cap;}

/* khai item vào Balo */
function dangKy(){
  var B=window.TTGBALO;
  if(!B||typeof B.reg!=='function')return false;
  var o={},i,b,R;
  for(i=0;i<CFG.bong.length;i++){
    b=CFG.bong[i];R=CFG.rankDacBiet[b.cap];
    o[idBong(b.cap)]={loai:'bong',ten:b.ten,cap:b.cap,bac:b.bac,ic:b.ic,
      mo:b.dacBiet?('Bậc '+b.bac+'. Bắt chắc chắn mọi thú hoang bắt được. Thú bắt được nhận Rank '+Object.keys(R)[0]+' đến '+Object.keys(R).slice(-1)[0]+' (Rank lúc gặp cao hơn thì giữ).')
        :('Bậc '+b.bac+'. Ném được ở mọi vùng; vùng càng cao, thú càng hiếm thì tỉ lệ càng thấp.')};
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

window.TTGBONG={CFG:CFG,capVung:capVung,tinhTiLe:tinhTiLe,tiLeBat:tiLeBat,rankKhiBat:rankKhiBat,laDacBiet:laDacBiet,dungDuoc:dungDuoc,idBong:idBong,dangKy:dangKy};
})();
