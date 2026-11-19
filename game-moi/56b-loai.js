/* 56b-loai.js - BẢNG LOÀI 6 VÙNG (60 thú): vai trò + hệ. Thuần dữ liệu, KHÔNG DOM, KHÔNG vẽ. Mở rộng window.TTGCS.
   Nạp SAU 56-chi-so.js. id theo 51-thu-moi.js (1a..1j Tuyết Nguyên, 2x Sương Cốc, 3x Vân Đảo, 4x Lôi Vực, 5x Nguyệt Cung, 6x Phong Nguyên).
   HỆ ĐÃ ĐỐI CHIẾU THEO MÔ TẢ (khung/cảm hứng) trong thu-moi/<vùng>/*.md, KHÔNG đặt theo tên (chốt 19/11/2026).
   Muốn đổi vai/hệ một con: sửa đúng một dòng trong bảng BANG bên dưới. Hệ ghi theo khóa của HE_TEN (56-chi-so.js).
   API: TTGCS.loai(id) -> {id, ten, vung, vai, he, boss} | null ; TTGCS.dsLoai(z) ; TTGCS.heVung(z) ; TTGCS.mangDuocSach(id,heSach) ; TTGCS.LOAI */
(function(root){
'use strict';

/* hệ chủ đạo của vùng z (hệ của kỹ năng cơ bản vùng, dùng ở bước D). Khớp mục 8 THIET_KE_CHI_SO.md */
var HE_VUNG=['bang','thuy','tien','phong','loi','tam'];  /* z0..z5 */

/* vai: t = tank, c = cong (công), n = nhanh, b = canbang (cân bằng) */
var VAI={t:'tank',c:'cong',n:'nhanh',b:'canbang'};

/* [id, tên, vai, [hệ chủ đạo ghi trước, hệ phụ]]  - dòng cuối mỗi vùng là BOSS.
   z theo 51-thu-moi.js: Tuyết Nguyên 0, Sương Cốc 1, Vân Đảo 2, Phong Nguyên 3, Lôi Vực 4, Nguyệt Cung 5 (id Phong Nguyên bắt đầu bằng 6, vùng z=3) */
var BANG={
  0:[ /* Tuyết Nguyên (bang) */
    ['1a','Tuyết Cầu','b',['bang']],
    ['1b','Tuyết Hùng','t',['bang','vo']],          /* gấu bắc cực (cũ: bang+tho) */
    ['1c','Băng Lộc','n',['bang','moc']],
    ['1d','Tuyết Báo','c',['bang','vo']],
    ['1e','Băng Hải','t',['bang','thuy']],
    ['1f','Tuyết Cú','n',['bang','phong']],
    ['1g','Băng Dương','b',['bang','tho']],
    ['1h','Băng Linh','c',['bang','tam']],
    ['1i','Băng Nham','t',['bang','nham']],
    ['1j','Băng Sơn Cự Thú','t',['bang','nham']]
  ],
  1:[ /* Sương Cốc (thuy) */
    ['2a','Sương Thát','n',['thuy']],
    ['2b','Vụ Dực','n',['thuy','phong']],
    ['2c','Sương Xuyên','t',['thuy','tho']],        /* tê tê lòng đất (cũ: thuy+kim) */
    ['2d','Sương Khải','c',['thuy','nham']],
    ['2e','Sương Diệp','t',['thuy','trung']],       /* tam diệp trùng (cũ: thuy+moc) */
    ['2f','Vụ Tiêu','b',['thuy','long']],           /* rồng-ốc Tiêu Đồ (cũ: thuy+tam) */
    ['2g','Sương Viên','c',['thuy','vo']],
    ['2h','Vụ Tùng','b',['thuy','moc']],
    ['2i','Sương Nha','c',['thuy','moc']],          /* hổ răng kiếm, giáp lá (cũ: thuy+am) */
    ['2j','Vạn Trượng Vụ Thú','t',['thuy','nham']]  /* Thao Thiết thân đá rêu (cũ: thuy+ma) */
  ],
  2:[ /* Vân Đảo (tien) */
    ['3a','Vân Cảnh','t',['tien','moc']],           /* khủng long mang đảo vườn, môi trường đất (cũ: tien+phong) */
    ['3b','Vân Loa','b',['tien','thuy']],
    ['3c','Vân Địa Lãn','b',['tien','tho']],
    ['3d','Vân Giáp','t',['tien','kim']],
    ['3e','Vân Trãi','c',['tien','tam']],
    ['3f','Vân Khổng','c',['tien','phong']],
    ['3g','Vân Đình','n',['tien','trung']],
    ['3h','Vân Châu','n',['tien','thuy']],          /* sứa tinh thể (cũ: tien+doc) */
    ['3i','Vân Đăng','t',['tien','hoa']],
    ['3j','Vân Đảo Côn Bằng','n',['phong','tien']]  /* Côn Bằng: vua tốc độ (Sơn Hải Kinh) */
  ],
  3:[ /* Phong Nguyên (phong) - id bắt đầu bằng 6 */
    ['6a','Phong Túc','n',['phong','vo']],          /* chim khủng bố Phorusrhacos (cũ: phong+trung) */
    ['6b','Phong Phi','n',['phong']],
    ['6c','Phong Giác','t',['phong','tho']],        /* tê giác Elasmotherium (cũ: phong+nham) */
    ['6d','Phong Liêm','c',['phong','doc']],        /* đầu chim, thân báo, đuôi rắn (cũ: phong+kim) */
    ['6e','Phong Ngư','b',['phong','thuy']],
    ['6f','Phong Tiêu','t',['phong','thuong']],     /* cầy meerkat (cũ: phong+hoa) */
    ['6g','Phong Bi','t',['phong','nham']],         /* golem bia đá (cũ: phong+tho) */
    ['6h','Phong Lô','b',['phong','moc']],
    ['6i','Phong Tích','c',['phong','long']],       /* thằn lằn cổ xếp (cũ: phong+doc) */
    ['6j','Phong Nguyên Vũ Xà','n',['phong','long']] /* rắn lông vũ, tượng trưng cho gió */
  ],
  4:[ /* Lôi Vực (loi) */
    ['4a','Lôi Ưng','n',['loi','phong']],
    ['4b','Lôi Ngư','n',['loi','thuy']],
    ['4c','Lôi Ngưu','t',['loi','tho']],
    ['4d','Lôi Mãng','b',['loi','doc']],
    ['4e','Lôi Cô','b',['loi','moc']],              /* nấm sấm, thực vật (cũ: loi) */
    ['4f','Lôi Giáp','t',['loi','kim']],
    ['4g','Lôi Sư','c',['loi']],                    /* sư tử sấm (cũ: loi+hoa) */
    ['4h','Lôi Linh','c',['loi','tam']],
    ['4i','Lôi Đồng','c',['loi','vo']],             /* đồng tử cầm búa, trống (cũ: loi+nham) */
    ['4j','Lôi Vực Chiến Thần','c',['loi','vo']]    /* chiến thần cầm búa (cũ: loi+long) */
  ],
  5:[ /* Nguyệt Cung (tam) */
    ['5a','Nguyệt Thố','b',['tam','thuong']],
    ['5b','Nguyệt Hạc','n',['tam','phong']],
    ['5c','Nguyệt Thiềm','t',['tam','doc']],
    ['5d','Nguyệt Đằng','c',['tam','moc']],
    ['5e','Nguyệt Nga','n',['tam','trung']],
    ['5f','Nguyệt Kình','b',['tam','thuy']],
    ['5g','Nguyệt Tượng','t',['tam','tho']],
    ['5h','Nguyệt Quy','t',['tam','nham']],
    ['5i','Nguyệt Tiên','c',['tam','tien']],
    ['5j','Nguyệt Thực Tế Quân','c',['am','tam']]
  ]
};

var LOAI={},THEO_VUNG={};
Object.keys(BANG).forEach(function(zs){
  var z=+zs;THEO_VUNG[z]=[];
  BANG[zs].forEach(function(r,i){
    var o={id:r[0],ten:r[1],vung:z,vai:VAI[r[2]],he:r[3].slice(),boss:i===BANG[zs].length-1};
    LOAI[o.id]=o;THEO_VUNG[z].push(o.id);
  });
});

function loai(id){var o=LOAI[id];return o?{id:o.id,ten:o.ten,vung:o.vung,vai:o.vai,he:o.he.slice(),boss:o.boss}:null;}
function dsLoai(z){return (THEO_VUNG[z]||[]).map(loai);}
/* sách kỹ năng: thú chỉ mang được sách thuộc 1 trong 2 hệ của chính nó (hệ khác không mang được). heSach = khóa hệ như 'bang','vo'. */
function mangDuocSach(id,heSach){var o=LOAI[id];return !!o&&o.he.indexOf(heSach)>=0;}
function heVung(z){return HE_VUNG[z]||null;}

root.TTGCS=Object.assign(root.TTGCS||{},{LOAI:LOAI,loai:loai,dsLoai:dsLoai,heVung:heVung,mangDuocSach:mangDuocSach,HE_VUNG:HE_VUNG});
if(typeof module!=='undefined'&&module.exports)module.exports=root.TTGCS;
})(typeof window!=='undefined'?window:globalThis);

/* Nạp 56c-buff.js ngay sau file này (đồng bộ, đúng thứ tự). Chỉ chạy trong trình duyệt, bỏ qua khi test bằng node.
   Nếu sau này thêm thẻ <script src="game-moi/56c-buff.js"> vào index.html thì dòng này tự bỏ qua (đã có TTGCS.modTinh) hoặc xóa đi. */
if(typeof document!=='undefined'&&document.write&&!(window.TTGCS&&window.TTGCS.modTinh)){document.write('<script src="game-moi/56c-buff.js"><\/script>');}
