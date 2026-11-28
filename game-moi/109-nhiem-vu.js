/* 109-nhiem-vu.js - BẢNG NHIỆM VỤ (nút "Nhiệm vụ" ở thanh nút, 81-nut-moi.js gọi TTGNHIEMVU.open).
   BƯỚC 1 (28/11/2026): khung + rương điểm hoạt động. BƯỚC 2: 2 tab đổi sáng + danh sách cuộn + thanh cuộn thật.
   BƯỚC 3 (28/11/2026): NỘI DUNG NHIỆM VỤ THẬT, XOAY VÒNG: mỗi ngày 5 nhiệm vụ (100 điểm) khác nhau, mỗi tuần 10 nhiệm vụ (100 điểm) khác nhau; ngày lặp theo tháng (31 bộ), tuần lặp mỗi 4 tuần.
   BƯỚC 4 (28/11/2026): (1) ICON NHIỆM VỤ = PIXEL ART 2D 16x16 vẽ bằng dữ liệu chữ (khối PX bên dưới, KHÔNG dùng emoji nữa; tham số thứ 3 của Q() là TÊN icon: gio kiem chan bua tien ngoc bando khien quy vuong sao rong lich catcat cup). (2) BỎ Thú Thần Thạch khỏi phần thưởng nhiệm vụ + rương: thay bằng Hộp/Rương Ngự Thú, Ngự Thú Châu, nguyên liệu Tiến Hóa (Lõi/Châu/Thần Ấn). (3) BẤM vào ô phần thưởng (trong hàng) hoặc vào RƯƠNG => hiện bảng thông tin: vật phẩm là gì, số lượng, mô tả; rương thì liệt kê sẽ nhận được gì + nút Nhận khi đủ điểm.
   ẢNH: khung-nhiem-vu.webp (khung trống 1281x1164) | nhiem-vu-hang-trong.webp (1 hàng, KHÔNG có nút) | nhiem-vu-nut-sang.webp (nút Nhận sáng: đã xong, bấm được) | nhiem-vu-nut-xam.webp (nút Nhận xám: chưa xong) | "Đã nhận" = chữ xám vẽ bằng CSS | nhiem-vu-tab-sang.webp, nhiem-vu-ic-ngay/tuan.webp.
   3 TRẠNG THÁI NÚT: chưa xong = xám (bấm báo tiến độ) | xong chưa nhận = sáng (bấm để nhận thưởng + cộng điểm) | đã nhận = dấu "Đã nhận".
   ĐIỂM HOẠT ĐỘNG: cộng khi BẤM NHẬN (không cộng lúc hoàn thành). Mỗi tab có thanh điểm + 4 rương riêng (mốc 25/50/75/100).
   LÀM MỚI: tab Ngày reset 0h mỗi ngày; tab Tuần reset 0h sáng thứ Hai (giờ máy người chơi). Phần chưa nhận thì mất.
   LƯU: localStorage khóa ttg_moi_nhiemvu_v2.
   ĐẾM TIẾN ĐỘ: các file khác gọi TTGNHIEMVU.sk(sự kiện, giá trị). Sự kiện: 'thang' (thắng trận Thám Hiểm, truyền enemy), 'bat' (bắt thành công 1 thú), 'cuonghoa', 'tienhoa', 'mua' (1 lần mua ở Kỳ Trân Các), 'chi' (số Tinh Thạch đã chi, truyền số), 'bosstg' (đánh Boss Thế Giới), 'daututruong' (thắng Vạn Thú Tranh Phong - hệ thống chưa làm), 'daydu' (tự phát khi tab Ngày đủ 100 điểm).
   PHẦN THƯỞNG: {t:'tt'|'chau'|'hop'|'ruong'|'it'|'ttt', n:số, cap:bậc châu, id:id vật phẩm}. tt = Tinh Thạch, it = vật phẩm bất kỳ trong Balo theo id (vd th-z0-loi), ttt = Thú Thần Thạch (TIỀN NẠP: nhiệm vụ KHÔNG còn dùng, chỉ giữ để tương thích). Sửa số ở CFG.slot (kho nhiệm vụ xoay vòng) / CFG.diem / CFG.ruong. Xem bộ nhiệm vụ: TTGNHIEMVU.lich('ngay'|'tuan', 'YYYY-MM-DD'), TTGNHIEMVU.hienTai('ngay'|'tuan').
   API: TTGNHIEMVU.open() | .close() | .isOpen() | .tab(t) | .sk(ev,v) | .diem() | .setDiem(n) (thử) | .xong(id) (thử: đặt nhiệm vụ đã đủ) | .daNhan(i) | .reset()
   Đóng: nút X, chạm ngoài khung, Esc. */
(function(){
'use strict';
var SW=1281,SH=1164,V='?v=3',D='game-moi/',IMG=D+'khung-nhiem-vu.webp'+V,SANG=D+'nhiem-vu-tab-sang.webp'+V,ICN=D+'nhiem-vu-ic-ngay.webp'+V,ICT=D+'nhiem-vu-ic-tuan.webp'+V,HANG=D+'nhiem-vu-hang-trong.webp'+V,BSANG=D+'nhiem-vu-nut-sang.webp'+V,BXAM=D+'nhiem-vu-nut-xam.webp'+V;
var IC={tt:D+'icon-tien/tt.webp?v=1',ttt:D+'icon-tien/ttt.webp?v=1',hop:D+'img/vat-pham/hop-ngu-thu-ngau-nhien.webp',ruong:D+'img/vat-pham/ruong-ngu-thu-tu-chon.webp'};
/* ===== ICON PIXEL ART 2D (16x16) =====
   Mỗi icon = 256 ký tự (16 hàng x 16 cột), '.' = trong suốt, chữ khác = màu trong bảng PXP. Vẽ lên canvas 16x16 rồi phóng bằng CSS image-rendering:pixelated nên giữ nguyên nét vuông. Viền đậm 1px đã vẽ sẵn.
   Thêm icon mới: thêm 1 dòng vào PX (đúng 256 ký tự) rồi gọi tên đó ở tham số thứ 3 của Q(). Tên không có trong PX thì hiện chữ tên (để dễ thấy lỗi). */
var PXP={k:'#2a1230',w:'#ffffff',y:'#ffd23a',Y:'#c98a10',o:'#f08a1c',O:'#b4560f',r:'#e0402e',R:'#8f1d2c',b:'#3aa0ff',B:'#1d5fbf',c:'#9fefff',C:'#4fc3e8',g:'#4cc95a',G:'#1f7a3a',s:'#d6dcea',S:'#808ba4',n:'#a8622c',N:'#5e3216',t:'#f3dc9c',T:'#d0a860',m:'#ff9db8'};
var PX={
  gio:'......................kkkk...........kYYYYk.........kYkkkkYk.......kkYkkkkYkk.....krrrrrrrrrRk....krmrrrrrrrRk....krmrrrrrrrRk....krmrwyyyrrRk....krmryYYyrrRk....krrryYYyrrRk....krrryyyyrrRk....krrrrrrrrrRk....kRRRRRRRRRRk.....kkkkkkkkkk...................',
  kiem:'.kk..........kk.kssk........kssk.kwsk......kswk...kssk....kssk.....kwsk..kswk.......ksskkssk.........kwsswk.......kk..kssk..kk...kYykkswwskkyYk...kYysskkssyYk.....kYyk..kyYk.....knkYk..kYknk...kNk.k....k.kNk.kyk..........kyk.k............k.................',
  chan:'......................k...k..........kok.kok........kyookyook.......koookoook.....kkkoookoookkk..kyokkkk.kkkkyok.koook.kkk.koook.kookkkoookkkook..kkkoooooookkk....kooyyoooook.....kooyooooook.....koooooooOok......kooooOOok........kkoookk...........kkk......',
  bua:'........................kkkkkkk........kwwwwwwwk.......kccssssSk.......kccssssSk.......kccssssSk.......kSSSSSSSk........kNnnkkk........kNnnk..........kNnnk..........kNnnk..........kNnnk..........kNnnk...........knnk.............kk..........................',
  tien:'.....................................kkkkkk.........kttttttk.........kTTTTk..........kTTTTk.........krrrrrrk........kttttttTk......ktttwytttTk....kTttyYYyttTTk...kTttyYYyttTTk...kTtttyytttTTk....kTttttttTTk......kTTTTTTTk........kkTTTkk...........kkk......',
  ngoc:'.....................................kkkkkk.........kcccbbbk.......kcwwcbbbbk.....kcwwccbbbbbk....kCCCCCCCCCCk.....kccccBBBBk.......kcccBBBk.........kccBBk...........kcBk.............kk.......................................................................',
  bando:'..................................kkkkkkkkkkkk...kttttTtttTttTk..kttttTtttTttTk..kttttTtttrtrTk..kttttTtttTrtTk..kttttTttnrtrTk..ktttnTtntTttTk..kttntTnttTttTk..kttttTtttTttTk..kttttTtttTttTk..kTTTTTTTTTTTTk...kkkkkkkkkkkk..................................',
  khien:'...................kkkkkkkkkk.....kssssssssssk....ksbbbbBBBBsk....ksbbbyyBBBsk....ksbbbyyBBBsk....ksbyyYYyyBsk....ksbyyYYyyBsk....ksbbbyyBBBsk.....ksbbyyBBsk.......ksbyyBsk.........ksbBsk...........kssk.............ksk..............k.......................',
  quy:'...................k........k.....kyk......kyk....kyykkkkkkyyk....kryrrrrrryRk....krRRRrrRRRRk....krrwwrrwwrRk....krrwkrrkwrRk....krrrrrrrrrRk....krrrrrrrrrRk....krwwkwkwkwRk....krrkwkwkwrRk....krrrrrrrrrRk.....kRRRRRRRRRk......kkkkkkkkk...................',
  vuong:'..................................k....kk....k...kwk..kwwk..kwk..kyk..kyyk..kyk..kyyk.kyyk.kyyk..kyyykyyyykyyyk..kyyyyyyyyyyyyk..kyybyymryybyyk..kyybyyrryybyyk..kYYYYYYYYYYYYk..kooooooooooook..kooooooooooook...kkkkkkkkkkkk..................................',
  sao:'.......................kk.............kyyk............kwyk........kkkkywyykkkk...kyyyywyyyyyyyk...kywwyyyyyyyk.....kywyyooook......kyyyyooook.......kyyyoook........kyyyoook.......kyyykkoook......kyyk..kook.....kyyk....kook.....kk......kk...................',
  rong:'....k....k.........kyk..kyk........kyykkyyk........kyykkyyk........kyyggyyk........kyygggggkkkk...kggggwyygggggk.kgggggykkggGGgk.kgggggykkgggggk.kgGgggggggGgggk..kGgggggggggGgk...kGggggkwkwkkk....kkGGGGGGGGk......kGGGGGGGGk.......kkkkkkkk..................',
  lich:'....k......k.......kSk....kSk.....kkSkkkkkkSkk...krrSrrrrrrSrrk..krrSrrrrrrSrrk..krrrrrrrrrrrrk..kRRRRRRRRRRRRk..kwwwwwwwwwwwsk..kwwSwSwSwSwwsk..kwwwwwwwwwwwsk..kwwSwSwSwSwwsk..kwwwwwwwwggwsk..kwwSwSwSwGgwsk..kwwwwwwwwwwwsk..kssssssssssssk...kkkkkkkkkkkk..',
  catcat:'...................kkkkkkkkkk.....kyyyyyyyyyyk....kYYYYYYYYYYk.....kcwcccccck.......kwccccck.........kyyyyk...........kyyk............kcck...........kcccck.........kyyyyyyk.......kyyyyyyyyk.....kyyyyyyyyyyk....kYYYYYYYYYYk.....kkkkkkkkkk...................',
  cup:'...................................kkkkkkkkkk.....kYyyyyyyyyYk...kYkywyyyyyokYk..kYkywyooyyokYk..kYkywyooyyokYk...kYyyyyyyyoYk.....kkyyyyyyok........kyyyyok.........kyyyyok.........kkYYkk.........kYYYYYYk........kYYYYYYk.........kkkkkk.....................'
};
var pxCache={};
function pxUrl(name){
  var d=PX[name],c,g,i,ch;if(!d||d.length!==256)return null;
  if(pxCache[name])return pxCache[name];
  try{c=document.createElement('canvas');c.width=c.height=16;g=c.getContext('2d');
    for(i=0;i<256;i++){ch=d.charAt(i);if(ch!=='.'&&PXP[ch]){g.fillStyle=PXP[ch];g.fillRect(i%16,(i/16)|0,1,1);}}
    return pxCache[name]=c.toDataURL('image/png');}catch(e){return null;}
}
/* ICON THẬT CỦA GAME (thay pixel art): tên icon trong Q() -> ảnh trong game-moi. Tên không có ở đây thì rơi về pixel art PX. */
var RIC={gio:'icon-nv/gio.webp',kiem:'icon-nv/kiem.webp',bando:'icon-nv/bando.webp',bua:'icon-nv/bua.webp',tien:'icon-tien/tt.webp',chan:'icon-nv/bat-thu.webp',ngoc:'icon-nv/bat-thu.webp',khien:'icon-nv/khien.webp',quy:'icon-nv/quy.webp',vuong:'icon-nv/vuong.webp',sao:'icon-nv/sao.webp',rong:'icon-nv/rong.webp',lich:'icon-nv/lich.webp',catcat:'icon-nv/lich.webp',cup:'icon-nv/cup.webp'};
function icQ(name){
  if(RIC[name])return '<img src="'+D+RIC[name]+'" alt="">';
  var u=pxUrl(name);return u?'<img class="px" src="'+u+'" alt="">':esc(name);}
/* ===== DỮ LIỆU NHIỆM VỤ (chốt 28/11/2026) =====
   id | ten | mo (dòng mô tả) | ic (tên icon pixel art trong PX) | ev (sự kiện đếm) | need (mục tiêu) | diem (điểm hoạt động khi bấm Nhận) | th (thưởng)
   Điểm: Ngày 15+15+20+25+25 = 100 | Tuần 10 x 10 = 100. Đấu trường KHÔNG thưởng Thú Thần Thạch. Tinh Thạch đã nâng (chợ 50 -> 200). */
function Q(ten,mo,ic,ev,need,th){return {ten:ten,mo:mo,ic:ic,ev:ev,need:need,th:th};}
function TT(n){return {t:'tt',n:n};}function TTT(n){return {t:'ttt',n:n};}function CH(cap,n){return {t:'chau',cap:cap,n:n};}function HOP(n){return {t:'hop',n:n};}function RG(n){return {t:'ruong',n:n};}function IT(id,n){return {t:'it',id:id,n:n};}
var CFG={
  key:'ttg_moi_nhiemvu_v2',
  moc:[25,50,75,100],
  diem:{ngay:[15,15,20,25,25],tuan:[10,10,10,10,10,10,10,10,10,10]},   /* điểm hoạt động theo VỊ TRÍ (ô) nhiệm vụ */
  /* XOAY VÒNG THEO THÁNG: mỗi ô có nhiều biến thể.
     NGÀY: ô i lấy biến thể (ngày trong tháng - 1 + lệch[i]) % số biến thể => 31 ngày không ngày nào trùng bộ 5, sang tháng sau lặp lại.
     TUẦN: ô i lấy biến thể (số tuần + i) % 4, số tuần đếm liên tục theo thứ Hai => 4 tuần liền nhau 4 bộ khác nhau, hết 4 tuần (~1 tháng) lặp lại. */
  lech:[0,2,4,1,3],
  slot:{
  ngay:[
    [Q('Dạo Chợ Kỳ Trân','Mua 1 món ở Kỳ Trân Các','gio','mua',1,TT(200)),Q('Khởi Động','Thắng 5 trận Thám Hiểm','kiem','thang',5,TT(250)),Q('Thử Vận May','Bắt thành công 1 thú','chan','bat',1,TT(250)),Q('Gõ Búa','Cường hóa trang bị 1 lần','bua','cuonghoa',1,TT(250)),Q('Khách Quen','Mua 2 món ở Kỳ Trân Các','gio','mua',2,TT(300)),Q('Tiêu Xài','Chi 500 Tinh Thạch ở Kỳ Trân Các','tien','chi',500,TT(300))],
    [Q('Thám Hiểm','Thắng 10 trận Thám Hiểm','kiem','thang',10,TT(500)),Q('Lên Đường','Thắng 8 trận Thám Hiểm','bando','thang',8,TT(400)),Q('Săn Thú Nhỏ','Bắt thành công 2 thú','chan','bat',2,TT(400)),Q('Rèn Nhẹ','Cường hóa trang bị 2 lần','bua','cuonghoa',2,TT(350)),Q('Đi Đây Đi Đó','Thám Hiểm ở 2 vùng khác nhau','bando','vung',2,TT(450)),Q('Chi Tiêu','Chi 1000 Tinh Thạch ở Kỳ Trân Các','tien','chi',1000,TT(450))],
    [Q('Săn Thú','Bắt thành công 3 thú','chan','bat',3,CH(1,5)),Q('Chiến Binh','Thắng 15 trận Thám Hiểm','khien','thang',15,CH(1,4)),Q('Đánh Thủ Lĩnh','Hạ 1 Boss khi Thám Hiểm','quy','bosskill',1,TT(600)),Q('Thợ Rèn','Cường hóa trang bị 3 lần','bua','cuonghoa',3,TT(450)),Q('Mua Sắm','Mua 3 món ở Kỳ Trân Các','gio','mua',3,CH(1,4)),Q('Thợ Săn Chăm Chỉ','Bắt thành công 4 thú','chan','bat',4,CH(1,6))],
    [Q('Rèn Luyện','Cường hóa trang bị 4 lần','bua','cuonghoa',4,TT(500)),Q('Thợ Săn','Bắt thành công 4 thú','chan','bat',4,CH(1,8)),Q('Bền Bỉ','Thắng 20 trận Thám Hiểm','khien','thang',20,TT(800)),Q('Hạ Thủ Lĩnh','Hạ 2 Boss khi Thám Hiểm','quy','bosskill',2,TT(900)),Q('Du Ngoạn','Thám Hiểm ở 3 vùng khác nhau','bando','vung',3,TT(700)),Q('Đại Gia Nhỏ','Chi 1500 Tinh Thạch ở Kỳ Trân Các','tien','chi',1500,TT(650)),Q('Tay Săn Lão Luyện','Bắt thành công 5 thú','chan','bat',5,CH(2,2))],
    [Q('Diệt Thủ Lĩnh','Hạ 2 Boss khi Thám Hiểm','quy','bosskill',2,HOP(1)),Q('Chinh Phạt','Thắng 30 trận Thám Hiểm','khien','thang',30,TT(1000)),Q('Săn Liên Hoàn','Bắt thành công 5 thú','chan','bat',5,CH(2,3)),Q('Bậc Thầy Rèn','Cường hóa trang bị 6 lần','bua','cuonghoa',6,TT(900)),Q('Sát Thủ Lĩnh','Hạ 3 Boss khi Thám Hiểm','quy','bosskill',3,CH(3,3)),Q('Đại Gia','Chi 2000 Tinh Thạch ở Kỳ Trân Các','tien','chi',2000,TT(1000)),Q('Chiến Thần','Thắng 25 trận Thám Hiểm','kiem','thang',25,CH(2,3))]
  ],
  tuan:[
    [Q('Thám Hiểm Bền Bỉ','Thắng 60 trận Thám Hiểm','khien','thang',60,TT(2500)),Q('Chinh Chiến Không Ngừng','Thắng 40 trận Thám Hiểm','kiem','thang',40,TT(1800)),Q('Binh Đoàn Bất Bại','Thắng 80 trận Thám Hiểm','khien','thang',80,TT(3200)),Q('Anh Hùng Vùng Đất','Thắng 100 trận Thám Hiểm','vuong','thang',100,TT(4000))],
    [Q('Bậc Thầy Săn Thú','Bắt 20 thú','chan','bat',20,CH(2,5)),Q('Thợ Săn Lão Luyện','Bắt 12 thú','chan','bat',12,CH(2,3)),Q('Vua Săn Thú','Bắt 25 thú','vuong','bat',25,CH(2,6)),Q('Truy Tìm Linh Thú','Bắt 30 thú','ngoc','bat',30,CH(3,2))],
    [Q('Du Hành Các Vùng','Thám Hiểm ở 3 vùng khác nhau','bando','vung',3,TT(1800)),Q('Lữ Khách Bốn Phương','Thám Hiểm ở 4 vùng khác nhau','bando','vung',4,TT(2200)),Q('Chinh Phục Bản Đồ','Thám Hiểm ở 5 vùng khác nhau','bando','vung',5,TT(3000)),Q('Khai Phá Biên Cương','Thám Hiểm ở 4 vùng khác nhau','bando','vung',4,TT(2400))],
    [Q('Thợ Rèn Chăm Chỉ','Cường hóa trang bị 20 lần','bua','cuonghoa',20,TT(2200)),Q('Rèn Không Nghỉ','Cường hóa trang bị 15 lần','bua','cuonghoa',15,TT(1700)),Q('Bậc Thầy Lò Rèn','Cường hóa trang bị 25 lần','bua','cuonghoa',25,TT(2800)),Q('Thần Rèn','Cường hóa trang bị 30 lần','bua','cuonghoa',30,TT(3300))],
    [Q('Tiến Hóa','Tiến hóa thú 1 lần','sao','tienhoa',1,IT('th-z0-loi',5)),Q('Đột Phá','Tiến hóa thú 1 lần','sao','tienhoa',1,IT('th-z1-loi',5)),Q('Thăng Hoa','Tiến hóa thú 2 lần','sao','tienhoa',2,IT('th-z2-chau',4)),Q('Hóa Rồng','Tiến hóa thú 2 lần','rong','tienhoa',2,IT('th-z3-chau',4))],
    [Q('Sát Thủ Lĩnh','Hạ 10 Boss khi Thám Hiểm','quy','bosskill',10,IT('th-z0-an',3)),Q('Thợ Săn Thủ Lĩnh','Hạ 8 Boss khi Thám Hiểm','quy','bosskill',8,IT('th-z1-an',2)),Q('Bão Tố Thủ Lĩnh','Hạ 12 Boss khi Thám Hiểm','quy','bosskill',12,IT('th-z2-an',3)),Q('Diệt Vương','Hạ 15 Boss khi Thám Hiểm','vuong','bosskill',15,IT('th-z3-an',4))],
    [Q('Đại Gia Kỳ Trân','Chi 2000 Tinh Thạch ở Kỳ Trân Các','tien','chi',2000,HOP(1)),Q('Khách VIP','Chi 1500 Tinh Thạch ở Kỳ Trân Các','gio','chi',1500,CH(2,5)),Q('Trùm Kỳ Trân','Chi 2500 Tinh Thạch ở Kỳ Trân Các','tien','chi',2500,HOP(2)),Q('Phú Ông','Chi 3000 Tinh Thạch ở Kỳ Trân Các','tien','chi',3000,RG(1))],
    [Q('Siêng Năng','Đạt đủ 100 điểm hoạt động ngày, 5 lần','lich','daydu',5,CH(3,3)),Q('Chăm Chỉ','Đạt đủ 100 điểm hoạt động ngày, 4 lần','lich','daydu',4,CH(3,2)),Q('Kiên Trì','Đạt đủ 100 điểm hoạt động ngày, 6 lần','lich','daydu',6,CH(3,4)),Q('Bền Chí','Đạt đủ 100 điểm hoạt động ngày, 5 lần','catcat','daydu',5,CH(3,3))],
    [Q('Săn Boss Thế Giới','Đánh Boss Thế Giới 3 lần','rong','bosstg',3,RG(1)),Q('Thử Sức Boss Thế Giới','Đánh Boss Thế Giới 2 lần','rong','bosstg',2,HOP(2)),Q('Thợ Săn Cự Thú','Đánh Boss Thế Giới 3 lần','rong','bosstg',3,CH(4,3)),Q('Hạ Boss Thế Giới','Đánh Boss Thế Giới 4 lần','rong','bosstg',4,RG(2))],
    [Q('Đấu Trường','Thắng 5 trận Vạn Thú Tranh Phong','cup','daututruong',5,TT(3000)),Q('Đấu Sĩ Mới','Thắng 3 trận Vạn Thú Tranh Phong','cup','daututruong',3,TT(2000)),Q('Quán Quân','Thắng 7 trận Vạn Thú Tranh Phong','cup','daututruong',7,TT(4000)),Q('Tranh Phong','Thắng 5 trận Vạn Thú Tranh Phong','cup','daututruong',5,TT(3000))]
  ]},
  ruong:{   /* rương mốc 25/50/75/100 điểm của từng tab */
    ngay:[TT(1000),CH(1,10),CH(2,6),HOP(1)],     /* mỗi rương là 1 phần thưởng HOẶC mảng nhiều phần thưởng: [TT(500),HOP(1)] */
    tuan:[TT(3500),CH(3,5),CH(4,3),RG(1)]
  }
};
var BOX={
  sang:{ngay:{x:294,y:166,w:337,h:79},tuan:{x:650,y:166,w:337,h:79}},   /* sprite tab sáng phủ lên tab đang chọn */
  icNgay:{x:338,y:172,w:62,h:64},icTuan:{x:700,y:174,w:58,h:60},
  txNgay:{x:400,y:179,w:196,h:52},txTuan:{x:770,y:179,w:178,h:52},
  list:{x:50,y:256,w:1160,h:654,rowH:136},                          /* vùng danh sách cuộn */
  track:{x:1215,y0:316,y1:868,w:26,min:64},                         /* thanh cuộn */
  up:{x:1214,y:284,w:30,h:30},down:{x:1214,y:876,w:30,h:30},
  close:{x:1137,y:58,w:104,h:104},
  tabNgay:{x:296,y:168,w:333,h:75},
  tabTuan:{x:652,y:168,w:334,h:75},
  ruong:[{cx:394},{cx:626},{cx:864},{cx:1099}],
  ruongY:{y:925,h:170,w:120},
  stamp:{cy:974,w:142,h:48},
  bar:{x:283,y:1016,h:14,xs:[283,394,626,864,1099]}
};
/* toạ độ BÊN TRONG 1 hàng (sprite 1160x136) */
var RW=1160,RH=136;
var R={ic:{x:45,y:8,w:113,h:104},ten:{x:176,y:16,w:326,h:46},mo:{x:176,y:62,w:326,h:52},p:{x:510,y:26,w:248,h:32},bar:{x:515,y:66,w:238,h:20},rw:{x:786,y:12,w:104,h:100},bt:{x:921,y:17,w:214,h:102}};
var root,fr,E={},isOpen=false,openAt=0,tab='ngay',loaded=false,S={ngay:null,tuan:null},ppRuong=-1;

/* ===== TRẠNG THÁI + LÀM MỚI NGÀY/TUẦN ===== */
function dayKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function weekKey(){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return 'T'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function keyOf(t){return t==='ngay'?dayKey():weekKey();}
function planIx(t,d){   /* d = ngày (Date) -> mảng chỉ số biến thể cho từng ô */
  d=d||new Date();var sl=CFG.slot[t],i,ix=[];
  if(t==='ngay'){var dom=d.getDate();for(i=0;i<sl.length;i++)ix.push((dom-1+CFG.lech[i])%sl[i].length);}
  else{var m=new Date(d.getFullYear(),d.getMonth(),d.getDate());m.setDate(m.getDate()-((m.getDay()+6)%7));var wk=Math.floor(Date.UTC(m.getFullYear(),m.getMonth(),m.getDate())/864e5/7)%4;   /* chu kỳ 4 tuần liên tục: 2 tuần liền nhau luôn khác bộ */for(i=0;i<sl.length;i++)ix.push((wk+i)%sl[i].length);}
  return ix;
}
function blank(t){return {k:keyOf(t),ix:planIx(t),diem:0,nhan:[0,0,0,0],q:{},vung:[]};}
function L(t){   /* danh sách nhiệm vụ hiện tại của tab (đã gắn id, điểm) */
  var T=S[t],ix=T&&T.ix,sl=CFG.slot[t];
  return sl.map(function(v,i){var q=v[(ix&&ix[i]|0)%v.length];return {id:t.charAt(0)+i+'_'+((ix&&ix[i]|0)%v.length),ten:q.ten,mo:q.mo,ic:q.ic,ev:q.ev,need:q.need,th:q.th,diem:CFG.diem[t][i]};});
}
function checkReset(){['ngay','tuan'].forEach(function(t){if(!S[t]||S[t].k!==keyOf(t))S[t]=blank(t);});}
function ld(){
  if(loaded){checkReset();return;}
  loaded=true;
  try{var j=JSON.parse(localStorage.getItem(CFG.key)||'null');
    if(j)['ngay','tuan'].forEach(function(t){var o=j[t];if(o&&typeof o==='object'&&o.k===keyOf(t)&&Array.isArray(o.ix)){S[t]={k:o.k,ix:o.ix,diem:Math.max(0,Math.min(100,+o.diem||0)),nhan:[0,1,2,3].map(function(i){return o.nhan&&o.nhan[i]?1:0;}),q:o.q&&typeof o.q==='object'?o.q:{},vung:Array.isArray(o.vung)?o.vung:[]};}});
  }catch(e){}
  checkReset();
}
function save(){try{localStorage.setItem(CFG.key,JSON.stringify(S));}catch(e){}}
function toast(t){var T=window.TTGTBAO&&TTGTBAO.toast;if(T)T(t,2400);}
function qs(t,id){var o=S[t].q;return o[id]||(o[id]={p:0,c:0});}

/* ===== PHẦN THƯỞNG ===== */
function chauItem(cap){try{return TTGBALO.CAT[TTGBONG.idBong(cap)]||null;}catch(e){return null;}}
function catItem(id){try{return TTGBALO.CAT[id]||null;}catch(e){return null;}}
function fmtN(n){return n>=1000?(Math.round(n/100)/10)+'K':String(n);}
function fullN(n){return window.TTGTIEN&&TTGTIEN.fmt?TTGTIEN.fmt(n):String(n);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function tenTh(r){
  if(r.t==='tt')return r.n+' Tinh Thạch';
  if(r.t==='ttt')return r.n+' Thú Thần Thạch';
  if(r.t==='hop')return r.n+' Hộp Ngự Thú Ngẫu Nhiên';
  if(r.t==='ruong')return r.n+' Rương Ngự Thú Tự Chọn';
  if(r.t==='it'){var c=catItem(r.id);return r.n+' '+(c&&c.ten?c.ten:r.id);}
  var it=chauItem(r.cap);return r.n+' '+(it&&it.ten?it.ten:('Ngự Thú Châu bậc '+r.cap));
}
function icTh(r){
  var u=IC[r.t],it;
  if(r.t==='chau'){it=chauItem(r.cap);if(it&&it.img)return '<img src="'+esc(it.img)+'" alt="">';return esc((it&&it.ic)||'⚪');}
  if(r.t==='it'){it=catItem(r.id);if(it&&it.img)return '<img src="'+esc(it.img)+'" alt="">';return esc((it&&it.ic)||'🎁');}
  return u?'<img src="'+esc(u)+'" alt="">':'🎁';
}
function give(r){
  try{
    if(r.t==='tt'||r.t==='ttt'){if(window.TTGTIEN)TTGTIEN.add(r.t,r.n);}
    else if(r.t==='chau'){if(window.TTGBALO&&window.TTGBONG)TTGBALO.add(TTGBONG.idBong(r.cap),r.n);}
    else if(r.t==='hop'){if(window.TTGBALO)TTGBALO.add('hop-ngu-thu-ngau-nhien',r.n);}
    else if(r.t==='ruong'){if(window.TTGBALO)TTGBALO.add('ruong-ngu-thu-tu-chon',r.n);}
    else if(r.t==='it'){if(window.TTGBALO&&r.id)TTGBALO.add(r.id,r.n);}
  }catch(e){}
}
/* THÔNG TIN PHẦN THƯỞNG (bảng hiện khi bấm vào ô thưởng / rương): {ten, loai, mo} */
var LOAI_IT={th:'Nguyên liệu Tiến Hóa',nl:'Vật phẩm',bong:'Ngự Thú Châu',sach:'Sách kỹ năng'};
function info(r){
  var c;
  if(r.t==='tt')return {ten:'Tinh Thạch',loai:'Tiền tệ',mo:'Tiền tệ chính của game. Rơi khi thắng trận Thám Hiểm; dùng để mua đồ ở Kỳ Trân Các và trả phí Tiến Hóa thú.'};
  if(r.t==='ttt')return {ten:'Thú Thần Thạch',loai:'Tiền tệ cao cấp',mo:'Loại tiền cao cấp của game.'};
  if(r.t==='chau'){c=chauItem(r.cap);return {ten:(c&&c.ten)||('Ngự Thú Châu bậc '+r.cap),loai:'Ngự Thú Châu'+(c&&c.bac?' · '+c.bac:'')+' · Bậc '+r.cap,mo:(c&&c.mo)||'Dùng để bắt thú hoang khi Thám Hiểm.'};}
  if(r.t==='hop'){c=catItem('hop-ngu-thu-ngau-nhien');return {ten:(c&&c.ten)||'Hộp Ngự Thú Ngẫu Nhiên',loai:'Vật phẩm đặc biệt',mo:(c&&c.mo)||'Mở ra nhận ngẫu nhiên 1 loại Ngự Thú Châu (châu càng cao càng hiếm).'};}
  if(r.t==='ruong'){c=catItem('ruong-ngu-thu-tu-chon');return {ten:(c&&c.ten)||'Rương Ngự Thú Tự Chọn',loai:'Vật phẩm đặc biệt',mo:(c&&c.mo)||'Mở ra rồi tự chọn 1 loại Ngự Thú Châu.'};}
  c=catItem(r.id);return {ten:(c&&c.ten)||String(r.id),loai:(c&&LOAI_IT[c.loai])||'Vật phẩm',mo:(c&&c.mo)||''};
}

/* ===== ĐẾM TIẾN ĐỘ (các file khác gọi TTGNHIEMVU.sk) ===== */
function tang(ev,n){
  if(!(n>0))return;
  ['ngay','tuan'].forEach(function(t){L(t).forEach(function(q){if(q.ev!==ev)return;var o=qs(t,q.id);if(o.c||o.p>=q.need)return;o.p=Math.min(q.need,o.p+n);});});
}
function vungMoi(z){
  z=String(z);
  ['ngay','tuan'].forEach(function(t){
    var T=S[t];if(T.vung.indexOf(z)>=0)return;T.vung.push(z);
    L(t).forEach(function(q){if(q.ev==='vung'){var o=qs(t,q.id);if(!o.c)o.p=Math.min(q.need,T.vung.length);}});
  });
}
function sk(ev,v){
  try{
    ld();
    if(ev==='thang'){tang('thang',1);if(v&&v.boss)tang('bosskill',1);if(v&&v.vung!=null)vungMoi(v.vung);}
    else if(ev==='chi')tang('chi',Math.max(0,Math.floor(+v)||0));
    else tang(ev,1);
    save();if(isOpen){render();dsHang(true);}
  }catch(e){}
}
var css=[
'.nvq{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.nvq.on{display:flex}',
'.nvq-fr{position:relative;width:min(98vw,calc(96vh*'+SW+'/'+SH+'));aspect-ratio:'+SW+'/'+SH+';background:url('+IMG+') 0 0/100% 100% no-repeat;--u:1px;animation:nvq-in .18s ease-out}',
'@keyframes nvq-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}',
'.nvq-fr>*{position:absolute;box-sizing:border-box}',
'.nvq-x,.nvq-tab{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation}',
'.nvq-x{border-radius:50%}',
'.nvq-x:active{box-shadow:0 0 calc(var(--u)*24) rgba(255,224,102,.85),inset 0 0 calc(var(--u)*24) rgba(255,224,102,.35)}',
'.nvq-tab:active{background:rgba(255,200,80,.12);border-radius:calc(var(--u)*18)}',
/* tab sáng + nhãn */
'.nvq-sang{pointer-events:none;background:url('+SANG+') 0 0/100% 100% no-repeat;opacity:0;transition:opacity .2s}',
'.nvq-sang.on{opacity:1}',
'.nvq-ic{pointer-events:none;background:no-repeat center/100% 100%}',
'.nvq-tx{pointer-events:none;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*33);line-height:1;white-space:nowrap;overflow:hidden;color:#c6ccdb;text-shadow:0 0 calc(var(--u)*4) #0a1638,calc(var(--u)*2) calc(var(--u)*2) 0 #0a1638,calc(var(--u)*-2) calc(var(--u)*2) 0 #0a1638,calc(var(--u)*2) calc(var(--u)*-2) 0 #0a1638,calc(var(--u)*-2) calc(var(--u)*-2) 0 #0a1638;transition:color .2s}',
'.nvq-tx.on{color:#fff3d4;text-shadow:0 0 calc(var(--u)*4) #4a2400,calc(var(--u)*2) calc(var(--u)*2) 0 #4a2400,calc(var(--u)*-2) calc(var(--u)*2) 0 #4a2400,calc(var(--u)*2) calc(var(--u)*-2) 0 #4a2400,calc(var(--u)*-2) calc(var(--u)*-2) 0 #4a2400}',
/* danh sách cuộn (thanh cuộn hệ thống ẩn, dùng thanh vẽ riêng) */
'.nvq-ls{overflow-y:scroll;overflow-x:hidden;overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;scrollbar-width:none}',
'.nvq-ls::-webkit-scrollbar{display:none}',
'.nvq-h{width:100%;height:calc(var(--u)*'+BOX.list.rowH+');background:url('+HANG+') 0 0/100% 100% no-repeat;flex:none}',
'.nvq-th{border-radius:calc(var(--u)*13);border:calc(var(--u)*2) solid #3a1c04;background:linear-gradient(90deg,#c25a02 0,#ffb81e 22%,#fff45c 40%,#ffc02a 62%,#e8820a 86%,#8a3402 100%);box-shadow:0 0 calc(var(--u)*6) rgba(255,190,60,.55);cursor:grab;touch-action:none}',
'.nvq-th:active{cursor:grabbing;filter:brightness(1.12)}',
'.nvq-tk,.nvq-ar{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation}',
'.nvq-ar:active{background:rgba(255,220,110,.28);border-radius:calc(var(--u)*8)}',
/* thanh điểm hoạt động (nằm dưới rương, trên nền thanh vẽ sẵn) */
'.nvq-bar{pointer-events:none;border-radius:calc(var(--u)*8);background:linear-gradient(180deg,#fff3a8,#ffc83a 50%,#e08a12);box-shadow:0 0 calc(var(--u)*8) rgba(255,210,80,.7);transition:width .35s ease}',
/* vùng chạm rương */
'.nvq-r{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.nvq-r:active{filter:brightness(1.25)}',
/* chữ ĐÃ NHẬN màu đỏ đè lên rương */
'.nvq-st{display:none;pointer-events:none;align-items:center;justify-content:center;font-weight:900;font-size:calc(var(--u)*30);line-height:1;letter-spacing:calc(var(--u)*1);white-space:nowrap;color:#e3141c;border:calc(var(--u)*4) solid #e3141c;border-radius:calc(var(--u)*8);background:rgba(12,4,10,.38);transform:rotate(-14deg);text-shadow:0 0 calc(var(--u)*3) #fff3,calc(var(--u)*2) calc(var(--u)*2) 0 rgba(40,0,0,.85),calc(var(--u)*-1) calc(var(--u)*-1) 0 rgba(255,220,220,.35);box-shadow:0 0 calc(var(--u)*10) rgba(0,0,0,.65),inset 0 0 calc(var(--u)*6) rgba(227,20,28,.35)}',
'.nvq-st.on{display:flex;animation:nvq-stamp .22s cubic-bezier(.2,1.6,.4,1)}',
'@keyframes nvq-stamp{from{opacity:0;transform:rotate(-14deg) scale(2.2)}to{opacity:1;transform:rotate(-14deg) scale(1)}}',
'.nvq-dim{pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(2,6,28,.5) 0,rgba(2,6,28,.4) 45%,rgba(2,6,28,0) 70%);opacity:0;transition:opacity .2s}',
'.nvq-dim.on{opacity:1}',
/* ===== HÀNG NHIỆM VỤ (toạ độ theo sprite hàng 1160x136; --u = 1px ảnh khung) ===== */
'.nvq-h{position:relative}',
'.nvq-h>*{position:absolute;box-sizing:border-box}',
'.nvq-hi{display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*62);line-height:1;filter:drop-shadow(0 calc(var(--u)*2) calc(var(--u)*3) rgba(0,0,0,.7))}',
'.nvq-hi img{max-width:84%;max-height:84%;object-fit:contain}',
'.nvq-hi img.px{width:calc(var(--u)*96);height:calc(var(--u)*96);max-width:none;max-height:none;image-rendering:-moz-crisp-edges;image-rendering:crisp-edges;image-rendering:pixelated}',
'.nvq-hn{display:flex;align-items:center;font-weight:800;font-size:calc(var(--u)*30);line-height:1;color:#ffd75a;text-shadow:0 calc(var(--u)*2) calc(var(--u)*3) #1a0c00,0 0 calc(var(--u)*6) rgba(255,190,60,.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.nvq-hm{display:flex;align-items:center;font-weight:600;font-size:calc(var(--u)*23);line-height:1.1;color:#d4dcf2;text-shadow:0 calc(var(--u)*2) calc(var(--u)*3) #050a1c;overflow:hidden}',
'.nvq-hp{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*24);line-height:1;color:#fff;text-shadow:0 calc(var(--u)*2) calc(var(--u)*3) #000}',
'.nvq-hf{border-radius:calc(var(--u)*9);background:linear-gradient(180deg,#fff3a8,#ffc83a 50%,#e08a12);box-shadow:0 0 calc(var(--u)*6) rgba(255,200,70,.6);pointer-events:none}',
'.nvq-hr{display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*56);line-height:1;filter:drop-shadow(0 calc(var(--u)*2) calc(var(--u)*3) rgba(0,0,0,.7))}',
'.nvq-hr img{max-width:82%;max-height:82%;object-fit:contain}',
'.nvq-hr{cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.nvq-hr:active{filter:brightness(1.35) drop-shadow(0 0 calc(var(--u)*8) rgba(255,224,102,.9))}',
'.nvq-hq{display:flex;align-items:flex-end;justify-content:flex-end;padding:0 calc(var(--u)*7) calc(var(--u)*4) 0;font-weight:900;font-size:calc(var(--u)*25);line-height:1;color:#fff;text-shadow:0 0 calc(var(--u)*3) #000,calc(var(--u)*2) calc(var(--u)*2) 0 #000,calc(var(--u)*-2) calc(var(--u)*2) 0 #000;pointer-events:none}',
'.nvq-bt{padding:0;border:0;background:no-repeat center/100% 100%;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.nvq-bt.on:active{filter:brightness(1.25)}',
'.nvq-bt.xam{cursor:default}',
'.nvq-dn{display:flex;align-items:center;justify-content:center;pointer-events:none;font-weight:900;font-size:calc(var(--u)*34);letter-spacing:calc(var(--u)*1);color:#7f8ba6;border:calc(var(--u)*4) solid #7f8ba6;border-radius:calc(var(--u)*9);background:rgba(8,14,36,.55);transform:rotate(-8deg);text-shadow:0 calc(var(--u)*2) calc(var(--u)*2) rgba(0,0,0,.6)}',
'.nvq-h.done .nvq-hi,.nvq-h.done .nvq-hr{opacity:.55}',
/* ===== BẢNG THÔNG TIN (bấm ô thưởng / rương) ===== */
'.nvq-pp{display:none;align-items:center;justify-content:center;z-index:5;border-radius:calc(var(--u)*40);background:rgba(2,4,18,.6)}',
'.nvq-pp.on{display:flex}',
'.nvq-pc{width:calc(var(--u)*780);max-width:94%;max-height:92%;display:flex;flex-direction:column;gap:calc(var(--u)*14);padding:calc(var(--u)*26) calc(var(--u)*30);border:calc(var(--u)*4) solid #d9a43a;border-radius:calc(var(--u)*20);background:linear-gradient(180deg,#1c2c70,#0a1034);box-shadow:0 0 calc(var(--u)*30) rgba(0,0,0,.85),inset 0 0 calc(var(--u)*18) rgba(255,210,100,.18);color:#e8ecff;animation:nvq-in .15s ease-out}',
'.nvq-pt{font-weight:900;font-size:calc(var(--u)*36);line-height:1.1;color:#ffd75a;text-align:center;text-shadow:0 calc(var(--u)*2) calc(var(--u)*3) #1a0c00}',
'.nvq-ps{font-weight:700;font-size:calc(var(--u)*22);color:#9fe8de;text-align:center}',
'.nvq-pl{display:flex;flex-direction:column;gap:calc(var(--u)*14);min-height:0;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;scrollbar-width:none}',
'.nvq-pl::-webkit-scrollbar,.nvq-pd::-webkit-scrollbar{display:none}',
'.nvq-pr{display:flex;align-items:flex-start;gap:calc(var(--u)*20);flex:none}',
'.nvq-pi{flex:none;display:flex;align-items:center;justify-content:center;width:calc(var(--u)*140);height:calc(var(--u)*140);font-size:calc(var(--u)*76);line-height:1;border:calc(var(--u)*3) solid #c9992f;border-radius:calc(var(--u)*14);background:radial-gradient(circle at 50% 35%,#34348f,#12123a);box-shadow:inset 0 0 calc(var(--u)*18) rgba(0,0,0,.6)}',
'.nvq-pi.sm{width:calc(var(--u)*96);height:calc(var(--u)*96);font-size:calc(var(--u)*54)}',
'.nvq-pi img{width:84%;height:84%;object-fit:contain}',
'.nvq-pcol{flex:1;min-width:0}',
'.nvq-pn{font-weight:800;font-size:calc(var(--u)*32);line-height:1.15;color:#ffe9a0}',
'.nvq-pq{font-weight:900;color:#9ff5a8;white-space:nowrap}',
'.nvq-pm{font-weight:700;font-size:calc(var(--u)*21);color:#9fe8de;margin-top:calc(var(--u)*4)}',
'.nvq-pd{font-size:calc(var(--u)*22);line-height:1.35;color:#cfd6ff;margin-top:calc(var(--u)*6);max-height:calc(var(--u)*140);overflow-y:auto;overflow-x:hidden;touch-action:pan-y;scrollbar-width:none}',
'.nvq-pst{text-align:center;font-weight:800;font-size:calc(var(--u)*24);color:#9ff5a8}',
'.nvq-pst.no{color:#ffb08a}',
'.nvq-pb{display:flex;justify-content:center;gap:calc(var(--u)*24)}',
'.nvq-pb button{min-width:calc(var(--u)*170);height:calc(var(--u)*56);padding:0 calc(var(--u)*22);border-radius:calc(var(--u)*10);border:calc(var(--u)*3) solid #c9992f;background:#1d1d5a;color:#ffe9a0;font-family:inherit;font-weight:800;font-size:calc(var(--u)*26);cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.nvq-pb button.ok{background:linear-gradient(180deg,#ffd75a,#e08a12);color:#3a1c04;border-color:#7a4a00}',
'.nvq-pb button:active{filter:brightness(1.25)}'

].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);
[IMG,SANG,ICN,ICT,HANG,BSANG,BXAM].forEach(function(u){try{(new Image()).src=u;}catch(e){}});   /* tải trước cho lần mở đầu không nháy */

function pct(v,t){return (v/t*100)+'%';}
function box(c,b){var s=c.style;s.left=pct(b.x,SW);s.top=pct(b.y,SH);s.width=pct(b.w,SW);s.height=pct(b.h,SH);return c;}
function mk(tag,cls,b){var c=document.createElement(tag);c.className=cls;if(b)box(c,b);fr.appendChild(c);return c;}
function unit(){if(fr)fr.style.setProperty('--u',(fr.clientWidth/SW)+'px');}
function rb(b){return 'left:'+pct(b.x,RW)+';top:'+pct(b.y,RH)+';width:'+pct(b.w,RW)+';height:'+pct(b.h,RH)+';';}

function fit(el){el.style.fontSize='';var f=33;while(f>14&&el.scrollWidth>el.clientWidth+1){f--;el.style.fontSize='calc(var(--u)*'+f+')';}}
function fitAll(){if(E.txN){fit(E.txN);fit(E.txT);}}

/* ===== DANH SÁCH HÀNG + THANH CUỘN ===== */
function rowHtml(t,i){
  var q=L(t)[i],o=qs(t,q.id),done=o.p>=q.need,f=Math.min(1,o.p/q.need),h;
  h='<div class="nvq-h'+(o.c?' done':'')+'" data-i="'+i+'">'
   +'<div class="nvq-hi" style="'+rb(R.ic)+'">'+icQ(q.ic)+'</div>'
   +'<div class="nvq-hn" style="'+rb(R.ten)+'">'+esc(q.ten)+'</div>'
   +'<div class="nvq-hm" style="'+rb(R.mo)+'">'+esc(q.mo)+'</div>'
   +'<div class="nvq-hp" style="'+rb(R.p)+'">'+fmtN(o.p)+'/'+fmtN(q.need)+'</div>'
   +(f>0?'<div class="nvq-hf" style="'+rb({x:R.bar.x,y:R.bar.y,w:R.bar.w*f,h:R.bar.h})+'"></div>':'')
   +'<div class="nvq-hr" data-a="r" role="button" aria-label="Xem thông tin phần thưởng" style="'+rb(R.rw)+'">'+icTh(q.th)+'</div>'
   +'<div class="nvq-hq" style="'+rb(R.rw)+'">'+fmtN(q.th.n)+'</div>';
  if(o.c)h+='<div class="nvq-dn" style="'+rb({x:R.bt.x+20,y:R.bt.y+22,w:R.bt.w-40,h:R.bt.h-44})+'">Đã nhận</div>';
  else if(done)h+='<button type="button" class="nvq-bt on" data-a="n" aria-label="Nhận thưởng" style="'+rb(R.bt)+'background-image:url('+BSANG+')"></button>';
  else h+='<button type="button" class="nvq-bt xam" data-a="n" aria-label="Chưa hoàn thành" style="'+rb(R.bt)+'background-image:url('+BXAM+')"></button>';
  return h+'</div>';
}
function dsHang(keep){
  var n=L(tab).length,h='',i,y=E.ls.scrollTop;
  for(i=0;i<n;i++)h+=rowHtml(tab,i);
  E.ls.innerHTML=h;E.ls.scrollTop=keep?y:0;syncThumb();
}
function maxScroll(){return Math.max(0,E.ls.scrollHeight-E.ls.clientHeight);}
function syncThumb(){
  if(!E.th)return;var T=BOX.track,L=T.y1-T.y0,ch=E.ls.clientHeight||1,sh=E.ls.scrollHeight||1,ms=maxScroll();
  var len=Math.min(L,Math.max(T.min,L*ch/sh)),top=T.y0+(ms?(L-len)*E.ls.scrollTop/ms:0);
  E.th.style.top=pct(top,SH);E.th.style.height=pct(len,SH);E.th.style.display=ms?'':'none';E.thLen=len;
}
function scrollBy(d){E.ls.scrollBy?E.ls.scrollBy({top:d,behavior:'smooth'}):(E.ls.scrollTop+=d);}
function setTab(t){
  if(t===tab&&E.ls.childNodes.length)return;
  closePP();tab=t;E.tn.classList.toggle('on',t==='ngay');E.tt.classList.toggle('on',t==='tuan');
  E.sN.classList.toggle('on',t==='ngay');E.sT.classList.toggle('on',t==='tuan');
  E.txN.classList.toggle('on',t==='ngay');E.txT.classList.toggle('on',t==='tuan');
  render();dsHang();
}
/* ===== BẢNG THÔNG TIN ===== */
function closePP(){ppRuong=-1;if(E.pp)E.pp.classList.remove('on');}
function openPP(h){if(!E.pp)return;E.pc.innerHTML=h;E.pp.classList.add('on');}
function rwRow(r,sm){
  var f=info(r);
  return '<div class="nvq-pr"><div class="nvq-pi'+(sm?' sm':'')+'">'+icTh(r)+'</div><div class="nvq-pcol"><div class="nvq-pn">'+esc(f.ten)+' <span class="nvq-pq">x'+fullN(r.n)+'</span></div><div class="nvq-pm">'+esc(f.loai)+'</div>'+(f.mo?'<div class="nvq-pd">'+esc(f.mo)+'</div>':'')+'</div></div>';
}
function showReward(r){   /* bấm ô thưởng trong hàng nhiệm vụ */
  ppRuong=-1;
  openPP('<div class="nvq-pt">Thông tin phần thưởng</div>'+rwRow(r,false)+'<div class="nvq-pb"><button type="button" data-p="x">Đóng</button></div>');
}
function showRuong(i){   /* bấm rương: liệt kê sẽ nhận được gì, đủ điểm thì có nút Nhận */
  ld();
  var T=S[tab],rs=[].concat(CFG.ruong[tab][i]),can=CFG.moc[i],got=!!T.nhan[i],ok=!got&&T.diem>=can,st;
  if(got)st='<div class="nvq-pst">✔ Đã nhận</div>';
  else if(ok)st='<div class="nvq-pst">Đã đủ điểm, bấm Nhận để lấy thưởng</div>';
  else st='<div class="nvq-pst no">Cần '+can+' điểm hoạt động (hiện có '+T.diem+'/'+can+')</div>';
  openPP('<div class="nvq-pt">Rương '+can+' điểm hoạt động</div><div class="nvq-ps">'+(tab==='ngay'?'Nhiệm vụ ngày':'Nhiệm vụ tuần')+' · Mở rương sẽ nhận được:</div><div class="nvq-pl">'+rs.map(function(r){return rwRow(r,true);}).join('')+'</div>'+st+'<div class="nvq-pb">'+(ok?'<button type="button" class="ok" data-p="n">Nhận</button>':'')+'<button type="button" data-p="x">Đóng</button></div>');
  ppRuong=i;
}
function nhanNV(i){
  ld();var q=L(tab)[i];if(!q)return;
  var o=qs(tab,q.id);
  if(o.c)return;
  if(o.p<q.need)return toast(q.ten+': '+fmtN(o.p)+'/'+fmtN(q.need)+' - chưa hoàn thành');
  o.c=1;give(q.th);
  var T=S[tab],before=T.diem;T.diem=Math.min(100,T.diem+q.diem);
  if(tab==='ngay'&&before<100&&T.diem>=100)tang('daydu',1);
  save();render();dsHang(true);
  toast('Nhận '+tenTh(q.th)+' (+'+q.diem+' điểm hoạt động)');
}

/* ===== THANH ĐIỂM + RƯƠNG (theo tab đang xem) ===== */
function barW(){
  var xs=BOX.bar.xs,p=S[tab].diem,m=CFG.moc,i,a=0,x=xs[0];
  for(i=0;i<m.length;i++){var b=m[i];if(p>=b){x=xs[i+1];a=b;}else{x=xs[i]+(xs[i+1]-xs[i])*(p-a)/(b-a);break;}}
  return Math.max(0,x-xs[0]);
}
function render(){
  if(!root)return;
  var T=S[tab];
  E.bar.style.width=pct(barW(),SW);
  CFG.moc.forEach(function(m,i){
    var on=!!T.nhan[i];
    E.st[i].classList.toggle('on',on);E.dim[i].classList.toggle('on',on);
    E.r[i].setAttribute('aria-label','Rương '+m+' điểm'+(on?' (đã nhận)':''));
  });
}
function nhanRuong(i){
  ld();var T=S[tab],r=CFG.ruong[tab][i],can=CFG.moc[i];
  if(T.nhan[i])return toast('Rương này đã nhận rồi');
  if(T.diem<can)return toast('Cần '+can+' điểm hoạt động (hiện có '+T.diem+'). Rương có '+[].concat(r).map(tenTh).join(', '));
  T.nhan[i]=1;save();[].concat(r).forEach(give);render();
  toast('Mở rương '+can+' điểm: nhận '+[].concat(r).map(tenTh).join(', '));
}
function build(){
  root=document.createElement('div');root.className='nvq';
  fr=document.createElement('div');fr.className='nvq-fr';root.appendChild(fr);
  E.bar=mk('div','nvq-bar',{x:BOX.bar.x,y:BOX.bar.y,w:0,h:BOX.bar.h});E.bar.style.width='0%';
  E.r=[];E.st=[];E.dim=[];
  BOX.ruong.forEach(function(Rg,i){
    var Y=BOX.ruongY,S2=BOX.stamp;
    E.dim[i]=mk('div','nvq-dim',{x:Rg.cx-70,y:Y.y-8,w:140,h:130});
    E.r[i]=mk('button','nvq-r',{x:Rg.cx-Y.w/2,y:Y.y,w:Y.w,h:Y.h});E.r[i].type='button';
    E.r[i].addEventListener('click',function(){showRuong(i);});
    E.st[i]=mk('div','nvq-st',{x:Rg.cx-S2.w/2,y:S2.cy-S2.h/2,w:S2.w,h:S2.h});E.st[i].textContent='Đã nhận';
  });
  /* tab: sprite sáng -> icon -> nhãn -> nút bấm (trong suốt) trên cùng */
  E.sN=mk('div','nvq-sang',BOX.sang.ngay);E.sT=mk('div','nvq-sang',BOX.sang.tuan);
  E.icN=mk('div','nvq-ic',BOX.icNgay);E.icN.style.backgroundImage='url('+ICN+')';
  E.icT=mk('div','nvq-ic',BOX.icTuan);E.icT.style.backgroundImage='url('+ICT+')';
  E.txN=mk('div','nvq-tx',BOX.txNgay);E.txN.textContent='Nhiệm vụ ngày';
  E.txT=mk('div','nvq-tx',BOX.txTuan);E.txT.textContent='Nhiệm vụ tuần';
  E.tn=mk('button','nvq-tab',BOX.tabNgay);E.tn.type='button';E.tn.setAttribute('aria-label','Nhiệm vụ ngày');
  E.tt=mk('button','nvq-tab',BOX.tabTuan);E.tt.type='button';E.tt.setAttribute('aria-label','Nhiệm vụ tuần');
  E.tn.addEventListener('click',function(){setTab('ngay');});
  E.tt.addEventListener('click',function(){setTab('tuan');});
  /* danh sách cuộn + thanh cuộn */
  E.ls=mk('div','nvq-ls',BOX.list);
  E.ls.addEventListener('scroll',syncThumb);
  E.ls.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-a]');if(!b)return;var h=b.closest('.nvq-h');if(!h)return;var i=+h.getAttribute('data-i');if(b.getAttribute('data-a')==='r'){var q=L(tab)[i];if(q)showReward(q.th);}else nhanNV(i);});
  var T=BOX.track;
  E.tk=mk('button','nvq-tk',{x:T.x,y:T.y0,w:T.w,h:T.y1-T.y0});E.tk.type='button';E.tk.setAttribute('aria-label','Thanh cuộn');
  E.tk.addEventListener('click',function(e){if(e.target!==E.tk)return;var r=E.tk.getBoundingClientRect(),y=e.clientY-r.top,thTop=E.th.getBoundingClientRect().top-r.top;scrollBy((y<thTop?-1:1)*E.ls.clientHeight*.8);});
  E.th=mk('div','nvq-th',{x:T.x,y:T.y0,w:T.w,h:T.min});
  (function(){var dy=0,st=0,on=false,sc=0;
    E.th.addEventListener('pointerdown',function(e){on=true;dy=e.clientY;st=E.ls.scrollTop;sc=fr.clientWidth/SW;try{E.th.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
    E.th.addEventListener('pointermove',function(e){if(!on)return;var L=(T.y1-T.y0)*sc-E.thLen*sc,ms=maxScroll();if(L>0)E.ls.scrollTop=st+(e.clientY-dy)/L*ms;});
    function up(){on=false;}E.th.addEventListener('pointerup',up);E.th.addEventListener('pointercancel',up);})();
  E.au=mk('button','nvq-ar',BOX.up);E.au.type='button';E.au.setAttribute('aria-label','Cuộn lên');E.au.addEventListener('click',function(){scrollBy(-BOX.list.rowH);});
  E.ad=mk('button','nvq-ar',BOX.down);E.ad.type='button';E.ad.setAttribute('aria-label','Cuộn xuống');E.ad.addEventListener('click',function(){scrollBy(BOX.list.rowH);});
  E.x=mk('button','nvq-x',BOX.close);E.x.type='button';E.x.setAttribute('aria-label','Đóng');
  /* bảng thông tin phần thưởng / rương: phủ trên cùng, bấm ra ngoài thẻ hoặc nút Đóng để tắt */
  E.pp=mk('div','nvq-pp',{x:20,y:20,w:SW-40,h:SH-40});E.pc=document.createElement('div');E.pc.className='nvq-pc';E.pp.appendChild(E.pc);
  E.pp.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-p]');
    if(b){var a=b.getAttribute('data-p'),i=ppRuong;closePP();if(a==='n'&&i>=0)nhanRuong(i);return;}
    if(e.target===E.pp)closePP();});
  document.body.appendChild(root);
  E.x.addEventListener('click',close);
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape'){if(E.pp&&E.pp.classList.contains('on'))closePP();else close();}});
  window.addEventListener('resize',function(){unit();fitAll();syncThumb();});
}
function open(){
  ld();if(!root)build();
  openAt=performance.now();isOpen=true;root.classList.add('on');unit();E.ls.innerHTML='';setTab('ngay');fitAll();syncThumb();
}
function close(){if(!root)return;closePP();isOpen=false;root.classList.remove('on');}
function refresh(){if(isOpen){render();dsHang(true);}}

window.TTGNHIEMVU={
  xemThuong:function(r){if(root&&r)showReward(r);},   /* thử: TTGNHIEMVU.xemThuong({t:'tt',n:500}) */
  open:open,close:close,tab:function(t){if(t&&root)setTab(t);return tab;},isOpen:function(){return isOpen;},sk:sk,
  diem:function(){ld();return S[tab].diem;},
  setDiem:function(n){ld();S[tab].diem=Math.max(0,Math.min(100,+n||0));save();render();return S[tab].diem;},
  congDiem:function(n){ld();return window.TTGNHIEMVU.setDiem(S[tab].diem+(+n||0));},
  xong:function(id){ld();['ngay','tuan'].forEach(function(t){L(t).forEach(function(q){if(q.id===id||q.ten===id)qs(t,q.id).p=q.need;});});save();refresh();},
  hienTai:function(t){ld();return L(t).map(function(q){return q.id+' '+q.ten+' ('+q.mo+')';});},
  lich:function(t,ngay){var d=ngay?new Date(ngay):new Date(),ix=planIx(t,d);return CFG.slot[t].map(function(v,i){return v[ix[i]].ten;});},
  daNhan:function(i){ld();return !!S[tab].nhan[i];},
  reset:function(){ld();S={ngay:blank('ngay'),tuan:blank('tuan')};save();refresh();},
  CFG:CFG
};
})();
