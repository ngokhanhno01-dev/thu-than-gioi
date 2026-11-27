/* 56b-loai.js - BẢNG LOÀI 6 VÙNG (60 thú): vai trò + hệ. Thuần dữ liệu, KHÔNG DOM, KHÔNG vẽ. Mở rộng window.TTGCS.
   Nạp SAU 56-chi-so.js. id theo 51-thu-moi.js (1a..1j Tuyết Nguyên, 2x Sương Cốc, 3x Vân Đảo, 4x Lôi Vực, 5x Nguyệt Cung, 6x Phong Nguyên).
   HỆ ĐÃ ĐỐI CHIẾU THEO MÔ TẢ (khung/cảm hứng) trong thu-moi/<vùng>/*.md, KHÔNG đặt theo tên (chốt 19/11/2026).
   Muốn đổi vai/hệ một con: sửa đúng một dòng trong bảng BANG bên dưới. Hệ ghi theo khóa của HE_TEN (56-chi-so.js).
   API: TTGCS.doHiem(id) -> 'thuong'..'truyenthuyet' | null ; TTGCS.hiemInfo(id) -> {key,ten,mau,ts} | null ; TTGCS.DO_HIEM (bảng 5 bậc độ hiếm). TTGCS.loai(id) -> {id, ten, goc (vùng QUÊ của loài = khóa trong bảng BANG), vung (vùng dùng TÍNH CHỈ SỐ, có thể khác goc), vai, he, boss} | null ; TTGCS.dsLoai(z) ; TTGCS.heVung(z) ; TTGCS.mangDuocSach(id,heSach) ; TTGCS.LOAI */
(function(root){
'use strict';

/* hệ chủ đạo của vùng z (hệ của kỹ năng cơ bản vùng, dùng ở bước D). Khớp mục 8 THIET_KE_CHI_SO.md */
var HE_VUNG=['bang','thuy','tien','phong','loi','tam','thuy','hoa','moc'];
HE_VUNG[16]='khonggian';   /* z16 Thần Điện (boss Đế Giang, hệ Không Gian) */  /* z0..z5, z6 Thủy Nguyệt Cảnh, z7 Xích Hỏa Địa, z8 Thanh Lâm */

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
  ],
  /* 3 THÚ KHỞI ĐẦU (21/11/2026): hệ chủ Thường + hệ phụ. Mỗi vùng mới tạm chỉ có 1 con; phần tử thứ 5 = false nghĩa là KHÔNG phải boss (mặc định dòng cuối vùng là boss); phần tử thứ 6 = vung dùng để TÍNH CHỈ SỐ (0 = ngang thú vùng 1, để thú khởi đầu không mạnh hơn thú Tuyết Nguyên). Khi làm đủ 10 thú cho vùng thì sắp lại. */
  6:[ /* Thủy Nguyệt Cảnh (thuy) */
    ['k2','Lưu Diêu','n',['thuong','thuy'],false,0],
    ['7a','Thủy Giáp Tướng','t',['thuy']],
    ['7b','Thủy Lãng Quỳ','t',['thuy']],
    ['7c','Thủy Linh Nhu','n',['thuy']],
    ['7d','Thủy Huyền Quy','t',['thuy']],
    ['7e','Thủy Sát Giao','c',['thuy']],
    ['7f','Thủy Nguyệt Liên','b',['thuy']],
    ['7g','Thủy Vũ Vệ','n',['thuy']],
    ['7h','Thủy Thương Long','c',['thuy']],
    ['7i','Thủy Thánh Trạch','b',['thuy']],
    ['7j','Hoài Thủy Vô Chi Kỳ','c',['thuy']]
  ],
  7:[ /* Xích Hỏa Địa (hoa) */
    ['k1','Viêm Sư','c',['thuong','hoa'],false,0],
    ['8a','Hỏa Tinh Thử','n',['hoa']],
    ['8b','Hỏa Nham Giác','t',['hoa']],
    ['8c','Hỏa Nham Yết','c',['hoa']],
    ['8d','Hỏa Diễm Đấu','c',['hoa']],
    ['8e','Hỏa Dạ Bức','n',['hoa']],
    ['8f','Tam Nhãn Hỏa Viên','c',['hoa']],
    ['8g','Hỏa Linh Phương','n',['hoa']],
    ['8h','Hỏa Viêm Giao','t',['hoa']],
    ['8i','Hỏa Thanh Ly','b',['hoa']],
    ['8j','Xích Diễm Ma Vương','c',['hoa']]
  ],
  8:[ /* Thanh Lâm (moc) */
    ['k3','Lâm Trư','t',['thuong','moc'],false,0],
    ['9a','Mộc Nhĩ Thố','n',['moc']],
    ['9b','Mộc Giác Tượng','t',['moc']],
    ['9c','Mộc Phong Trùng','c',['moc']],
    ['9d','Mộc Linh Lộc','n',['moc']],
    ['9e','Mộc Nha Trư','t',['moc']],
    ['9f','Mộc Điệp Linh','n',['moc']],
    ['9g','Mộc Khổng Tước','n',['moc']],
    ['9h','Mộc Nham Hùng','t',['moc']],
    ['9i','Mộc Thanh Lân','c',['moc']],
    ['9j','Thanh Lâm Cùng Kỳ','c',['moc']]
  ],
  16:[ /* Thần Điện (khonggian): BOSS THẦN, phẩm chất Thần. Chỉ số tính như boss vùng cuối z16, cấp tối đa 270 (xem THIET_KE_CHI_SO.md mục 9). Chưa đăng ký vào vùng/map, chưa có ảnh thú. */
    ['th1','Đế Giang','c',['khonggian'],true,16]
  ]
};

/* ĐỘ HIẾM LOÀI (6 bậc, khác Rank E..SR của từng cá thể): thuong < hiem < suthi < huyenthoai < truyenthuyet < than.
   ts = trọng số GẶP thú hoang (61-tham-hiem-tran.js): con càng hiếm càng ít gặp. mau = màu chữ nhãn (khớp DO_HIEM_MAU của tools/tao-manh-ghep.py).
   QUY TẮC MẶC ĐỊNH mỗi vùng 10 con theo thứ tự trong BANG: 3 Thường, 3 Hiếm, 2 Sử Thi, 1 Huyền Thoại, con cuối (boss) Truyền Thuyết. Thú khởi đầu (k1-k3) = Thường.
   Muốn đổi 1 con: thêm vào DO_HIEM_RIENG, vd {'1c':'suthi'}. */
var DO_HIEM_THU=['thuong','hiem','suthi','huyenthoai','truyenthuyet','than'];
var DO_HIEM={
  thuong:{ten:'Thường',mau:'#b9c0c9',ts:40},
  hiem:{ten:'Hiếm',mau:'#3ec9a7',ts:25},
  suthi:{ten:'Sử Thi',mau:'#b06cff',ts:12},
  huyenthoai:{ten:'Huyền Thoại',mau:'#ffb020',ts:8},
  truyenthuyet:{ten:'Truyền Thuyết',mau:'#ff3d5a',ts:1},
  than:{ten:'Thần',mau:'#ffd76a',ts:0.1}   /* bậc 6, trên Truyền Thuyết: vàng ánh kim, tỉ lệ gặp 0,1 (Truyền Thuyết = 1). Chỉ số nhân thêm CFG.hsThan (56-chi-so.js) */
};
/* ĐỘ HIẾM TỪNG CON do người dùng chốt (danh-sach-do-hiem, 22/11/2026). Con nào không có ở đây thì theo quy tắc mặc định bên dưới. */
var DO_HIEM_RIENG={
  '1a':'thuong', '1b':'suthi', '1c':'thuong', '1d':'hiem', '1e':'thuong', '1f':'hiem', '1g':'hiem', '1h':'suthi', '1i':'huyenthoai', '1j':'truyenthuyet',
  '2a':'thuong', '2b':'thuong', '2c':'thuong', '2d':'suthi', '2e':'hiem', '2f':'huyenthoai', '2g':'suthi', '2h':'hiem', '2i':'hiem', '2j':'truyenthuyet',
  '3a':'thuong', '3b':'thuong', '3c':'thuong', '3d':'hiem', '3e':'huyenthoai', '3f':'hiem', '3g':'suthi', '3h':'suthi', '3i':'hiem', '3j':'truyenthuyet',
  '6a':'suthi', '6b':'thuong', '6c':'hiem', '6d':'hiem', '6e':'hiem', '6f':'thuong', '6g':'suthi', '6h':'thuong', '6i':'huyenthoai', '6j':'truyenthuyet',
  '4a':'thuong', '4b':'thuong', '4c':'hiem', '4d':'suthi', '4e':'hiem', '4f':'hiem', '4g':'thuong', '4h':'suthi', '4i':'huyenthoai', '4j':'truyenthuyet',
  '5a':'thuong', '5b':'thuong', '5c':'hiem', '5d':'thuong', '5e':'hiem', '5f':'hiem', '5g':'suthi', '5h':'suthi', '5i':'huyenthoai', '5j':'truyenthuyet',
  '7a':'thuong', '7b':'thuong', '7c':'thuong', '7d':'hiem', '7e':'hiem', '7f':'hiem', '7g':'suthi', '7h':'suthi', '7i':'huyenthoai', '7j':'truyenthuyet',
  '8a':'thuong', '8b':'thuong', '8c':'thuong', '8d':'hiem', '8e':'hiem', '8f':'hiem', '8g':'suthi', '8h':'suthi', '8i':'huyenthoai', '8j':'truyenthuyet',
  'th1':'than',
  '9a':'thuong', '9b':'thuong', '9c':'thuong', '9d':'hiem', '9e':'hiem', '9f':'hiem', '9g':'suthi', '9h':'suthi', '9i':'huyenthoai', '9j':'truyenthuyet'
};
/* ĐỘ HIẾM CỦA HỆ (khác độ hiếm loài): hệ có vùng riêng = thuong; Độc/Trùng = hiem; Võ/Nham = suthi; Ma = huyenthoai; Long = truyenthuyet.
   CHỈ LÀ DỮ LIỆU: sau này mỗi hệ hiếm sẽ có nội tại riêng theo độ hiếm; hiện chưa dùng ở đâu. Hệ không ghi ở đây = thuong. */
var HE_DO_HIEM={doc:'hiem',trung:'hiem',vo:'suthi',nham:'suthi',ma:'huyenthoai',long:'truyenthuyet'};
function doHiemHe(he){return HE_DO_HIEM[he]||'thuong';}
var DO_HIEM_MD=['thuong','thuong','thuong','hiem','hiem','hiem','suthi','suthi','huyenthoai'];

var LOAI={},THEO_VUNG={},DO_HIEM_LOAI={};
Object.keys(BANG).forEach(function(zs){
  var z=+zs;THEO_VUNG[z]=[];
  BANG[zs].forEach(function(r,i){
    var o={id:r[0],ten:r[1],goc:z,vung:r[5]!=null?r[5]:z,vai:VAI[r[2]],he:r[3].slice(),boss:r[4]!==undefined?!!r[4]:i===BANG[zs].length-1};
    LOAI[o.id]=o;THEO_VUNG[z].push(o.id);
    DO_HIEM_LOAI[o.id]=DO_HIEM_RIENG[o.id]||(z>=6?'thuong':(o.boss?'truyenthuyet':DO_HIEM_MD[Math.min(i,8)]));
  });
});

function loai(id){var o=LOAI[id];return o?{id:o.id,ten:o.ten,goc:o.goc,vung:o.vung,vai:o.vai,he:o.he.slice(),boss:o.boss}:null;}
/* độ hiếm của loài: khóa 'thuong'|'hiem'|'suthi'|'huyenthoai'|'truyenthuyet' hoặc null nếu không phải loài thú (vd quái main) */
function doHiem(id){return DO_HIEM_LOAI[id]||null;}
/* {key,ten,mau,ts} để vẽ nhãn, hoặc null */
function hiemInfo(id){var k=DO_HIEM_LOAI[id],d=k&&DO_HIEM[k];return d?{key:k,ten:d.ten,mau:d.mau,ts:d.ts}:null;}
function dsLoai(z){return (THEO_VUNG[z]||[]).map(loai);}
/* sách kỹ năng: thú chỉ mang được sách thuộc 1 trong 2 hệ của chính nó (hệ khác không mang được). heSach = khóa hệ như 'bang','vo'. */
function mangDuocSach(id,heSach){var o=LOAI[id];return !!o&&o.he.indexOf(heSach)>=0;}
function heVung(z){return HE_VUNG[z]||null;}

root.TTGCS=Object.assign(root.TTGCS||{},{LOAI:LOAI,loai:loai,dsLoai:dsLoai,heVung:heVung,mangDuocSach:mangDuocSach,HE_VUNG:HE_VUNG,DO_HIEM:DO_HIEM,DO_HIEM_THU:DO_HIEM_THU,doHiem:doHiem,hiemInfo:hiemInfo,HE_DO_HIEM:HE_DO_HIEM,doHiemHe:doHiemHe});
if(typeof module!=='undefined'&&module.exports)module.exports=root.TTGCS;
})(typeof window!=='undefined'?window:globalThis);

/* Nạp 56c-buff.js ngay sau file này (đồng bộ, đúng thứ tự). Chỉ chạy trong trình duyệt, bỏ qua khi test bằng node.
   Nếu sau này thêm thẻ <script src="game-moi/56c-buff.js"> vào index.html thì dòng này tự bỏ qua (đã có TTGCS.modTinh) hoặc xóa đi. */
if(typeof document!=='undefined'&&document.write&&!(window.TTGCS&&window.TTGCS.modTinh)){document.write('<script src="game-moi/56c-buff.js"><\/script>');}
