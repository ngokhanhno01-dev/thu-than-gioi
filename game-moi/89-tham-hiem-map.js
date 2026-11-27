/* ===== 89-tham-hiem-map.js (TTGMAP): ENGINE "THÁM HIỂM ĐI BỘ" =====
   THAY cho build()/script() của 82-tham-hiem-auto.js (màn "đang tìm" giả). Vùng làm trước: Tuyết Nguyên.
   TRẠNG THÁI: B1 cấu hình + hàm thuần | B3 canvas/camera/joystick/WASD/nhân vật | B4 điểm rung + HUD khu | B5 boss
               B6 ĐÃ NỐI: resume(kq), sprite Boss thật, TTGTX (82) gọi TTGMAP.open/pause/resume/close, tungDich(opts {hiem,boss}).
               B2 (mới, thay bản cũ): lưới va chạm 192x128 (mỗi ô 8x8 đơn vị map) lưu dạng CHUỖI NÉN trong VUNG[...].maskData + nút "Debug Mask" (bút vẽ/tẩy + Copy Mask).

   TOẠ ĐỘ: mọi toạ độ trong CFG tính theo ảnh GỐC 1536x1024 ("đơn vị map"). Engine tự nhân hệ số (ảnh.naturalWidth/1536), nên đổi ảnh khác độ phân giải vẫn đúng.
   CHỈNH TAY: chỉ sửa khối CFG bên dưới (điểm rung, khu, tỉ lệ, boss, thời gian) và VUNG[...].maskData (dán chuỗi từ nút Copy Mask).

   MASK ĐƯỜNG ĐI (B2 mới):
     - Lưới maskW x maskH = 192x128 ô, mỗi ô = rong/maskW = 8 đơn vị map. 1 = đi được, 0 = chặn.
     - maskData = chuỗi nén RLE dạng  "192x128:<bit đầu 0|1>:<độ dài các đoạn, hệ 36, cách nhau dấu phẩy>"  (đọc theo hàng, từ trái sang phải, trên xuống dưới).
     - maskData rỗng (hoặc toàn 0) => KHÔNG chặn gì, nhân vật đi tự do. Chuỗi hỏng / sai kích thước => bỏ qua + cảnh báo console, đi tự do.
     - CFG.banKinhMaskDiem = 0: điểm rung không còn bẻ mask. Riêng boss giữ vòng đi được bằng boss.banKinhCham.
     - Đang bật Debug Mask thì KHÔNG chặn (đi xuyên để tới chỗ cần tô); tắt Debug Mask mới có va chạm.
     - Bản nháp tự lưu localStorage (khóa ttg_map_mask_<vùng>) CHỈ khi maskData trong file còn rỗng; khi đã dán chuỗi cố định vào file thì file thắng.
   DEBUG MASK (27/11/2026: ĐÃ GỠ nút "Debug Mask" và phím M khỏi giao diện, chỉ còn code vẽ mask bên dưới không có bảng công cụ; muốn tô lại mask thì phải làm lại nút/bảng). Mô tả cũ: nút nhỏ "Debug Mask" góc trên trái (hoặc phím M). Bật lên: phủ màu xanh bán trong suốt lên vùng đi được; ngón tay/chuột kéo trên map để tô (✏ Vẽ) hoặc xoá (🧽 Tẩy);
     "Cọ" đổi cỡ cọ; "Copy Mask" chép chuỗi vào clipboard (và console.log) để dán vào maskData; "Xoá hết" xoá toàn bộ. Joystick/WASD vẫn đi được khi đang tô để cuộn camera.

   GIAO DIỆN VỚI CODE HIỆN CÓ:
     - TTGTHAMHIEM.prep(npcId[,opts]) = prepExplore (index.html): chọn thú ra trận + tung địch -> {player,ps,enemy,tag} | null.
       tungDich(ev) dưới đây truyền opts {hiem|boss,bossId} xuống createEncounter(player,rng,opts) (61). Nếu prepExplore trong index.html CHƯA nhận opts (prep.length<2)
       thì tungDich tạm bọc TTGTHAMHIEM.createEncounter trong đúng lần gọi prep đó (xong là trả lại bản gốc).
     - TTGTHAMHIEM.battle(pre) = startExplore(pre): vào trận. 82 bọc lại thành TTGTX.vaoTran(pre).
     - TTGTX.next() (thắng/thua/bắt thú xong) và TTGTX.stop() do index.html gọi. TTGTX.active() = đang chạy vòng lặp.
   HỢP ĐỒNG TTGMAP <-> 82:
     TTGMAP.open(host)   host = {vung, onTouch(ev), onStop()}   ev = {loai:'diem'|'boss', hiem:'thuong'|..., khu:1..4, diemId}
     TTGMAP.pause()      vào trận: dừng rAF + bỏ listener phím + ẨN màn bản đồ + thoát fullscreen, GIỮ NGUYÊN vị trí/trạng thái điểm/đồng hồ
     TTGMAP.resume(kq)   sau trận: kq = {diemId?, boss?:true}; điểm vừa chạm biến mất rồi hồi theo CFG.hoi; boss => bossDanhXong() (đếm 15 phút); bật cooldown chạm; hiện lại màn bản đồ
     TTGMAP.close()      Quay lại (nút góc trên phải, trước đây là Dừng)/Esc: dọn sạch, trả màn hình về sảnh
   BOSS TRÊN MAP: lấy từ dữ liệu game theo slug vùng: boss thú hoang (THU_MOI.zones[].thu[].boss -> vẽ bằng THU_MOI.draw) ưu tiên; không có thì boss quái
     (TTG_QUAI_MAIN.zones[].quai[].boss -> ảnh game-moi/quai/<imageFile>); chưa nạp xong ảnh / không có dữ liệu thì dùng hình vẽ tạm. Trận đánh Boss ép đúng con này (opts.bossId).
*/
(function(root){
'use strict';
if(root.TTGMAP)return;   /* nạp 2 lần (thẻ script + tự nạp từ 82) thì bỏ qua lần sau */
var D=document,DIR='game-moi/';

/* ---------- ĐỘ HIẾM (khoá trùng TTGCS.DO_HIEM trong 56b-loai.js: thuong|hiem|suthi|huyenthoai; 'truyenthuyet' chỉ dành cho boss nên KHÔNG có trên điểm rung) ---------- */
var HIEM={
  thuong:{ten:'Thường',mau:'#35e0bd'},
  hiem:{ten:'Hiếm',mau:'#4aa8ff'},
  suthi:{ten:'Sử thi',mau:'#b56cff'},
  huyenthoai:{ten:'Huyền thoại',mau:'#ffd45c'}
};
var HIEM_KEYS=['thuong','hiem','suthi','huyenthoai'];

/* ---------- CẤU HÌNH CHUNG ---------- */
var CFG={
  debugMask:false,            /* true = mở sẵn Debug Mask lúc vào map (bật/tắt bằng nút "Debug Mask" hoặc phím M) */
  zIndex:50,                  /* bằng lớp phủ cũ của 82: thông báo thắng/thua (.tbo) vẫn nằm TRÊN màn bản đồ */
  rung:60000,                 /* ms mỗi con thú/quái tồn tại (có đếm ngược trên đầu) rồi biến mất */
  /* nhảy quanh chỗ núp, theo khu: banKinh = tầm quanh quẩn; buoc = dài 1 cú nhảy; tg = giây 1 cú; nghi = nghỉ [min,max] giây */
  nhay:{1:{banKinh:35,buoc:18,tg:0.52,nghi:[1.4,2.8]},2:{banKinh:50,buoc:22,tg:0.46,nghi:[1.0,2.2]},
        3:{banKinh:65,buoc:26,tg:0.42,nghi:[0.7,1.7]},4:{banKinh:80,buoc:30,tg:0.38,nghi:[0.5,1.4]},cao:12},
  /* QUÁI (mọi độ hiếm): người chơi tới gần (< gan) thì tự nhào tới `soCu` cú rồi nghỉ `cho` giây (để còn né được); xaNha = không rời chỗ núp quá */
  nhao:{gan:130,soCu:4,buoc:34,tg:0.3,cho:4,xaNha:170},
  /* THÚ sử thi + huyền thoại: người chơi tới gần (< gan) thì nhảy tránh `soCu` cú rồi hết sức trong `cho` giây (để còn bắt được); xaNha = không rời chỗ núp quá */
  chay:{loai:['suthi','huyenthoai'],gan:105,soCu:3,buoc:36,tg:0.28,cho:5,xaNha:170},
  hoi:15000,                  /* ms điểm hồi lại sau khi biến mất / sau khi chạm */
  soDiemHien:[2,2],           /* mỗi khu cùng lúc hiện tối đa 2 điểm (trong các chỗ núp cố định) */
  cachNhau:180,               /* đơn vị map: 2 con đang hiện phải cách nhau ít nhất ngần này (tính cả khác khu) */
  cachNguoi:130,              /* đơn vị map: không cho thú mới hiện sát nhân vật */
  hienThu:{xa:150,gan:70,co:56},  /* đơn vị map: cách xa < xa thì bắt đầu hiện bóng, <= gan thì rõ thú; co = cỡ thú trên map */
  banKinhCham:24,             /* đơn vị map: khoảng cách chạm vào điểm rung */
  banKinhMaskDiem:0,          /* đơn vị map: vòng tròn đi được quanh mỗi điểm rung/boss, bất chấp mask */
  cooldownSauTran:3000,       /* ms không cho chạm lại sau khi quay về map */
  nhanVat:{toc:190,kich:64,anh:null,nhun:3},   /* toc = đơn vị map/giây; anh = đường dẫn ảnh 512x512 quay PHẢI (null = vẽ tạm bằng THU_MOI.draw/chibi); nhun = biên độ nhún khi đi (px) */
  camera:{zoom:1},
  joystick:{kinh:152,kinhNho:136,hanhTrinh:0.58},
  boss:{hoiMs:15*60*1000,luuKhoa:'ttg_map_boss_'},   /* hồi theo GIỜ THỰC (Date.now), lưu localStorage theo từng vùng */
  than:{banKinhCham:42,tocDo:70,buocMin:90,buocMax:290,nghiMin:1.2,nghiMax:3.5}   /* boss Thần thế giới (103): vòng chạm; tocDo = đơn vị map/giây khi đi lang thang (người chơi 190); mỗi bước đi dài buocMin..buocMax, nghỉ nghiMin..nghiMax giây */
};
var BRUSH=[1,2,4,7];          /* bán kính cọ Debug Mask, tính theo ô lưới */
var MASK_KEY='ttg_map_mask_'; /* + slug vùng: bản nháp mask */

/* ---------- DỮ LIỆU VÙNG ----------
   khu: y0 (trên) -> y1 (dưới) theo ảnh 1536x1024; khu 1 ở dưới cùng. ti = tỉ lệ ra thú (%), tổng mỗi khu phải = 100 (checkCfg() báo nếu lệch).
   diem: các chỗ núp cố định mỗi khu (hiện ngẫu nhiên CFG.soDiemHien), đặt cạnh chỗ núp vẽ trên ảnh, nằm trên ô đi được (checkCfg() cảnh báo nếu không tới được).
   Tên khu 1, 3, 4 là TÊN TẠM tự đặt theo cảnh trong ảnh (chỉ khu 2 "Cầu Đá" là theo mô tả) - sửa ten ở đây. */
var VUNG={
  'thuy-nguyet-canh':{
    ten:'Thủy Nguyệt Cảnh',
    anh:DIR+'map-tham-hiem-thuy-nguyet-canh.webp?v=3',
    rong:1536,cao:1024,
    camNhay:[[740,565,885,632],[740,350,865,400],[690,850,860,920]],   /* cầu: thú không nhảy vào */
    dauHieu:'thuy',
    maskW:192,maskH:128,
    maskData:'192x128:0:2a7,13,46,19,41,1g,3t,1m,3o,1q,3j,1u,3g,1x,3e,1y,3d,1z,3d,1y,3e,1w,3h,1t,3l,1q,3m,1o,3o,1n,3h,1u,3h,1i,3,8,3k,1h,3,8,3m,1f,3,8,3p,1y,3i,23,3g,2,6,1q,3o,1o,3s,1k,3u,1h,3y,1c,33,i,h,17,35,m,g,c,4,m,37,p,e,b,7,h,37,u,c,a,a,b,37,10,a,a,3r,13,7,b,3r,15,5,b,3r,16,3,c,3s,1k,3,e,3c,20,3d,1z,3d,1x,3g,1v,3i,1m,3t,18,46,13,4b,7,7,n,4d,3,d,j,4u,i,p,2,43,j,h,c,40,l,b,j,3x,m,8,m,3w,n,5,p,3v,1i,3u,1l,3h,2,8,w,6,k,3a,19,b,h,39,19,e,e,3b,18,g,a,3e,18,i,5,3h,18,46,15,48,14,4a,12,4b,11,6,7,40,z,6,7,43,w,5,8,44,w,3,7,48,12,4b,11,4c,10,4d,10,4c,12,4a,12,4a,12,4a,11,4c,z,4e,y,4e,y,4e,y,4e,z,4d,11,4b,14,49,14,4b,11,4b,11,4b,10,4c,w,4g,v,4h,t,4j,s,4k,r,4l,q,4m,p,4p,l,46,f,8,i,45,j,7,g,45,l,6,g,44,m,6,g,44,m,5,h,45,l,5,h,46,k,4,j,45,k,4,j,45,17,3n,2,g,17,3j,9,c,19,3h,1w,3g,1x,3f,s,4,12,3d,s,7,11,3d,q,9,12,3c,p,a,13,3b,n,b,15,3b,k,c,18,3m,2,h,1f,3z,1d,3z,1d,1r',
    xuatPhat:{x:790,y:1000},
    khu:[
      {id:1,ten:'Khu 1 – Cầu Gỗ Đầu Hồ',y0:660,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Đảo Đá Sen',y0:415,y1:660,ti:{thuong:60,hiem:30,suthi:8,huyenthoai:2}},
      {id:3,ten:'Khu 3 – Bờ Sen Trăng',y0:225,y1:415,ti:{thuong:35,hiem:35,suthi:22,huyenthoai:8}},
      {id:4,ten:'Khu 4 – Quảng Trường Hang Thác',y0:0,y1:225,ti:{thuong:15,hiem:30,suthi:35,huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:636,y:716,ghiChu:'cạnh vật cản'},
         {id:'1b',x:700,y:820,ghiChu:'cạnh vật cản'},
         {id:'1c',x:908,y:988,ghiChu:'cạnh vật cản'},
         {id:'1d',x:700,y:932,ghiChu:'cạnh vật cản'},
         {id:'1e',x:868,y:740,ghiChu:'cạnh vật cản'},
         {id:'1f',x:684,y:996,ghiChu:'cạnh vật cản'},
         {id:'1g',x:852,y:804,ghiChu:'cạnh vật cản'}],
      2:[{id:'2a',x:788,y:436,ghiChu:'cạnh vật cản'},
         {id:'2b',x:668,y:548,ghiChu:'cạnh vật cản'},
         {id:'2c',x:604,y:452,ghiChu:'cạnh vật cản'},
         {id:'2d',x:796,y:540,ghiChu:'cạnh vật cản'},
         {id:'2e',x:644,y:620,ghiChu:'cạnh vật cản'},
         {id:'2f',x:884,y:644,ghiChu:'cạnh vật cản'}],
      3:[{id:'3a',x:540,y:340,ghiChu:'cạnh vật cản'},
         {id:'3b',x:852,y:316,ghiChu:'cạnh vật cản'},
         {id:'3c',x:644,y:260,ghiChu:'cạnh vật cản'},
         {id:'3d',x:652,y:356,ghiChu:'cạnh vật cản'},
         {id:'3e',x:940,y:268,ghiChu:'cạnh vật cản'},
         {id:'3f',x:692,y:308,ghiChu:'cạnh vật cản'}],
      4:[{id:'4a',x:972,y:204,ghiChu:'cạnh vật cản'},
         {id:'4b',x:700,y:156,ghiChu:'cạnh vật cản'},
         {id:'4c',x:636,y:164,ghiChu:'cạnh vật cản'},
         {id:'4d',x:900,y:148,ghiChu:'cạnh vật cản'}]
    },
    boss:{x:800,y:158,banKinhCham:38,ten:'Boss Truyền Thuyết'}
  },
  'xich-hoa-dia':{
    ten:'Xích Hỏa Địa',
    anh:DIR+'map-tham-hiem-xich-hoa-dia.webp?v=3',
    rong:1536,cao:1024,
    camNhay:[[783,291,955,400],[777,491,966,629]],   /* cầu: thú không nhảy vào */
    dauHieu:'hoa',
    maskW:192,maskH:128,
    maskData:'192x128:0:1zx,8,4u,s,4k,14,48,16,46,19,3k,5,e,1a,35,8,5,7,c,1b,35,8,5,8,b,1b,35,9,5,1s,9,3,2u,9,6,1o,9,d,2n,9,8,1j,b,e,2o,a,6,1i,b,f,2o,b,5,1h,c,f,2q,1t,d,k,2n,1s,d,n,2m,1q,9,t,2k,2s,2k,2s,2k,2q,2l,2l,2i,2m,2q,2d,2z,2d,32,2a,34,28,36,2c,3e,22,3a,1d,4,l,3b,17,c,h,3d,14,48,12,4c,q,4m,p,4n,p,4a,8,4,q,4a,12,44,17,11,8,2w,17,10,9,2w,17,10,9,2w,1l,l,a,2x,1q,7,i,2x,2f,n,2,28,2i,4,8,4,c,1v,3l,1l,2j,3,17,1h,2l,3,18,1f,2m,3,18,1f,3x,1f,3v,1e,3s,1k,3n,1p,3n,1u,2,9,1u,4,19,25,1r,8,18,25,1r,c,13,24,1s,g,x,27,1p,n,d,2n,e,3,18,3s,7,8,13,4a,11,4c,y,4f,s,4l,r,4m,q,4m,q,46,8,8,q,43,e,5,t,l,7,36,h,3,x,g,a,28,f,i,1o,6,e,27,h,g,28,27,i,d,2a,28,j,9,2c,2a,5,3,30,2e,31,k,3,1o,35,f,6,1m,35,f,7,1l,37,d,8,1l,36,d,9,1q,30,c,b,1x,2u,8,f,1v,3j,1t,3m,1n,3r,1h,3x,1e,3y,1e,3x,1f,3u,1h,3r,1i,3d,1y,c,6,2u,20,a,9,2s,21,9,c,2o,23,8,f,2k,25,8,m,2c,25,8,s,26,25,9,w,21,24,9,y,20,25,6,e,1,m,20,26,2,f,7,i,20,2m,b,f,20,2l,d,d,21,2k,i,8,23,2i,2v,2h,2v,2h,2v,2h,2w,2g,2e,7,b,2g,2c,b,9,2g,2b,e,6,2h,2a,h,4,2i,28,35,25,38,21,3d,1x,3f,1x,22',
    xuatPhat:{x:790,y:1000},
    khu:[
      {id:1,ten:'Khu 1 – Nền Đá Cháy',y0:680,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Cầu Đá Dung Nham',y0:430,y1:680,ti:{thuong:60,hiem:30,suthi:8,huyenthoai:2}},
      {id:3,ten:'Khu 3 – Dốc Tro Nóng',y0:220,y1:430,ti:{thuong:35,hiem:35,suthi:22,huyenthoai:8}},
      {id:4,ten:'Khu 4 – Đài Cổng Lửa',y0:0,y1:220,ti:{thuong:15,hiem:30,suthi:35,huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:316,y:756,ghiChu:'cạnh vật cản'},
         {id:'1b',x:324,y:852,ghiChu:'cạnh vật cản'},
         {id:'1c',x:1276,y:748,ghiChu:'cạnh vật cản'},
         {id:'1d',x:1148,y:764,ghiChu:'cạnh vật cản'},
         {id:'1e',x:1388,y:764,ghiChu:'cạnh vật cản'},
         {id:'1f',x:1076,y:900,ghiChu:'cạnh vật cản'},
         {id:'1g',x:236,y:908,ghiChu:'cạnh vật cản'}],
      2:[{id:'2a',x:1092,y:644,ghiChu:'cạnh vật cản'},
         {id:'2b',x:1196,y:452,ghiChu:'cạnh vật cản'},
         {id:'2c',x:1396,y:524,ghiChu:'cạnh vật cản'},
         {id:'2d',x:492,y:540,ghiChu:'cạnh vật cản'},
         {id:'2e',x:1276,y:636,ghiChu:'cạnh vật cản'},
         {id:'2f',x:492,y:652,ghiChu:'cạnh vật cản'},
         {id:'2g',x:404,y:484,ghiChu:'cạnh vật cản'}],
      3:[{id:'3a',x:548,y:324,ghiChu:'cạnh vật cản'},
         {id:'3b',x:1396,y:412,ghiChu:'cạnh vật cản'},
         {id:'3c',x:1236,y:268,ghiChu:'cạnh vật cản'},
         {id:'3d',x:1300,y:372,ghiChu:'cạnh vật cản'},
         {id:'3e',x:444,y:300,ghiChu:'cạnh vật cản'},
         {id:'3f',x:452,y:396,ghiChu:'cạnh vật cản'},
         {id:'3g',x:1204,y:332,ghiChu:'cạnh vật cản'}],
      4:[{id:'4a',x:596,y:124,ghiChu:'cạnh vật cản'},
         {id:'4b',x:516,y:164,ghiChu:'cạnh vật cản'},
         {id:'4c',x:1100,y:188,ghiChu:'cạnh vật cản'},
         {id:'4d',x:892,y:132,ghiChu:'cạnh vật cản'},
         {id:'4e',x:1212,y:204,ghiChu:'cạnh vật cản'}]
    },
    boss:{x:790,y:152,banKinhCham:38,ten:'Boss Truyền Thuyết'}
  },
  'thanh-lam':{
    ten:'Thanh Lâm',
    anh:DIR+'map-tham-hiem-thanh-lam.webp?v=3',
    rong:1536,cao:1024,
    camNhay:[[745,545,925,625]],   /* cầu: thú không nhảy vào */
    dauHieu:'lam',
    maskW:192,maskH:128,
    maskData:'192x128:0:1zs,9,52,h,4v,h,4u,j,4t,j,4r,m,4b,1k,3r,1o,3n,1s,3k,1v,3h,1x,3f,1z,3d,20,3c,20,3c,20,3c,1r,3k,1q,3m,1p,3m,1o,3m,1q,3l,1q,3m,1q,3m,1q,3m,1q,3n,1q,3n,1r,3m,1y,3g,1w,3i,1u,3j,1t,3k,1s,3l,1r,3l,1r,3l,1s,3k,1s,3k,1t,3g,1y,2v,2l,2l,2u,2i,2w,2g,2y,2e,30,2c,31,2b,31,2c,30,2d,2z,2d,2z,2d,2y,2f,2w,2h,2u,2i,2o,2p,27,3c,1n,3r,1h,3x,1d,41,1b,44,18,4m,r,4w,g,4x,g,4x,g,4x,g,4x,h,4v,n,4p,p,4n,s,4k,v,4g,y,3q,7,e,13,3l,1t,3g,1y,3b,26,35,2g,2s,2l,29,3,7,2t,27,36,26,36,25,37,25,37,25,38,24,38,24,38,26,36,27,35,29,32,2b,31,2d,2z,2f,2x,2h,2v,2k,2s,2k,2r,2l,2r,2n,2p,2s,2j,2v,2h,2x,2e,2z,2d,30,2b,32,29,33,28,34,27,35,26,35,26,36,25,36,25,34,27,34,27,35,26,36,25,37,24,39,20,3d,1x,3f,1u,3j,1s,3k,1s,1s',
    xuatPhat:{x:780,y:1000},
    khu:[
      {id:1,ten:'Khu 1 – Bãi Cỏ Đầu Rừng',y0:740,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Suối Cầu Gỗ',y0:480,y1:740,ti:{thuong:60,hiem:30,suthi:8,huyenthoai:2}},
      {id:3,ten:'Khu 3 – Đồng Cỏ Đá Cổ',y0:270,y1:480,ti:{thuong:35,hiem:35,suthi:22,huyenthoai:8}},
      {id:4,ten:'Khu 4 – Cửa Hang Cổ Thụ',y0:0,y1:270,ti:{thuong:15,hiem:30,suthi:35,huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:396,y:828,ghiChu:'cạnh vật cản'},
         {id:'1b',x:980,y:852,ghiChu:'cạnh vật cản'},
         {id:'1c',x:532,y:908,ghiChu:'cạnh vật cản'},
         {id:'1d',x:1116,y:932,ghiChu:'cạnh vật cản'},
         {id:'1e',x:1100,y:852,ghiChu:'cạnh vật cản'},
         {id:'1f',x:396,y:940,ghiChu:'cạnh vật cản'},
         {id:'1g',x:508,y:844,ghiChu:'cạnh vật cản'}],
      2:[{id:'2a',x:436,y:532,ghiChu:'cạnh vật cản'},
         {id:'2b',x:1012,y:572,ghiChu:'cạnh vật cản'},
         {id:'2c',x:948,y:580,ghiChu:'cạnh vật cản'},
         {id:'2d',x:956,y:676,ghiChu:'cạnh vật cản'},
         {id:'2e',x:1052,y:500,ghiChu:'cạnh vật cản'},
         {id:'2f',x:1124,y:588,ghiChu:'cạnh vật cản'},
         {id:'2g',x:1068,y:692,ghiChu:'cạnh vật cản'}],
      3:[{id:'3a',x:484,y:332,ghiChu:'cạnh vật cản'},
         {id:'3b',x:1068,y:356,ghiChu:'cạnh vật cản'},
         {id:'3c',x:1140,y:444,ghiChu:'cạnh vật cản'},
         {id:'3d',x:420,y:452,ghiChu:'cạnh vật cản'},
         {id:'3e',x:452,y:396,ghiChu:'cạnh vật cản'},
         {id:'3f',x:1060,y:284,ghiChu:'cạnh vật cản'},
         {id:'3g',x:1132,y:380,ghiChu:'cạnh vật cản'}],
      4:[{id:'4a',x:924,y:180,ghiChu:'cạnh vật cản'},
         {id:'4b',x:540,y:228,ghiChu:'cạnh vật cản'},
         {id:'4c',x:652,y:244,ghiChu:'cạnh vật cản'},
         {id:'4d',x:636,y:164,ghiChu:'cạnh vật cản'},
         {id:'4e',x:1028,y:212,ghiChu:'cạnh vật cản'}]
    },
    boss:{x:789,y:140,banKinhCham:38,ten:'Boss Truyền Thuyết'}
  },
  'nguyet-cung':{
    ten:'Nguyệt Cung',
    anh:DIR+'map-tham-hiem-nguyet-cung.webp?v=3',
    rong:1536,cao:1024,
    camNhay:[[450,500,705,620]],   /* cầu đá cong khu 2: thú không nhảy vào */
    dauHieu:'nguyet',
    maskW:192,maskH:128,
    maskData:'192x128:0:36k,11,48,17,42,1c,3w,1j,3q,1o,3l,s,2,z,3f,w,2,10,3a,23,39,23,38,24,38,25,37,25,37,25,37,25,37,25,37,25,37,25,37,25,37,25,36,25,37,25,37,25,37,25,32,2a,2w,2g,2w,2g,2w,27,35,27,35,27,35,27,35,27,35,27,35,27,35,27,35,27,35,27,35,27,35,27,35,27,35,27,35,2g,2w,2g,2w,2g,2w,2g,2w,2g,2x,2f,2z,2d,2z,2d,30,2c,31,2b,32,24,38,24,39,23,3a,22,9,2,36,1v,9,3,3b,1p,9,5,3e,1k,9,6,3e,1j,9,5,3g,1i,9,5,3g,1i,9,5,3h,1h,9,5,2i,3,x,1g,9,5,2e,a,u,1g,9,5,2a,g,s,1t,2a,k,p,1t,29,n,m,1u,28,s,i,1u,28,11,8,1v,28,34,28,34,28,34,28,34,28,34,28,33,2b,31,2f,2x,2k,2s,2o,2o,2s,2k,2v,2g,2w,2f,2x,2e,2y,2d,2z,2c,30,2b,31,2b,31,2b,31,2b,31,2b,31,2b,31,2b,31,2b,31,2b,30,2c,2w,2g,2s,2k,2o,2o,2k,2s,2k,2s,2k,2s,2k,2s,2k,2s,2k,2s,2k,2s,2k,2s,2k,2s,2k,2s,1d',
    xuatPhat:{x:800,y:1000},
    khu:[
      {id:1,ten:'Khu 1 – Bậc Đá Nguyệt',y0:720,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Cầu Đá Cong',y0:490,y1:720,ti:{thuong:60,hiem:30,suthi:8,huyenthoai:2}},
      {id:3,ten:'Khu 3 – Đèn Lồng',y0:300,y1:490,ti:{thuong:35,hiem:35,suthi:22,huyenthoai:8}},
      {id:4,ten:'Khu 4 – Cổng Nguyệt Cung',y0:0,y1:300,ti:{thuong:15,hiem:30,suthi:35,huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:579,y:788,ghiChu:'cạnh bụi/đá khu 1'},
         {id:'1b',x:1083,y:795,ghiChu:'cạnh bụi/đá khu 1'},
         {id:'1c',x:898,y:852,ghiChu:'cạnh bụi/đá khu 1'},
         {id:'1d',x:634,y:900,ghiChu:'cạnh bụi/đá khu 1'},
         {id:'1e',x:1004,y:900,ghiChu:'cạnh bụi/đá khu 1'},
         {id:'1f',x:980,y:956,ghiChu:'cạnh bụi/đá khu 1'},
         {id:'1g',x:476,y:972,ghiChu:'cạnh bụi/đá khu 1'}],
      2:[{id:'2a',x:778,y:516,ghiChu:'cạnh bụi/đá khu 2'},
         {id:'2b',x:898,y:596,ghiChu:'cạnh bụi/đá khu 2'},
         {id:'2c',x:994,y:636,ghiChu:'cạnh bụi/đá khu 2'},
         {id:'2d',x:1196,y:651,ghiChu:'cạnh bụi/đá khu 2'},
         {id:'2e',x:699,y:675,ghiChu:'cạnh bụi/đá khu 2'},
         {id:'2f',x:1035,y:699,ghiChu:'cạnh bụi/đá khu 2'}],
      3:[{id:'3a',x:730,y:346,ghiChu:'cạnh bụi/đá khu 3'},
         {id:'3b',x:1028,y:394,ghiChu:'cạnh bụi/đá khu 3'},
         {id:'3c',x:915,y:428,ghiChu:'cạnh bụi/đá khu 3'},
         {id:'3d',x:476,y:435,ghiChu:'cạnh bụi/đá khu 3'},
         {id:'3e',x:579,y:452,ghiChu:'cạnh bụi/đá khu 3'},
         {id:'3f',x:1059,y:476,ghiChu:'cạnh bụi/đá khu 3'}],
      4:[{id:'4a',x:675,y:260,ghiChu:'cạnh bụi/đá khu 4'},
         {id:'4b',x:1076,y:274,ghiChu:'cạnh bụi/đá khu 4'},
         {id:'4c',x:596,y:284,ghiChu:'cạnh bụi/đá khu 4'},
         {id:'4d',x:980,y:284,ghiChu:'cạnh bụi/đá khu 4'}]
    },
    boss:{x:868,y:214,banKinhCham:38,ten:'Boss Truyền Thuyết'}
  },
  'loi-vuc':{
    ten:'Lôi Vực',
    anh:DIR+'map-tham-hiem-loi-vuc.webp?v=3',
    rong:1536,cao:1024,
    camNhay:[[686,594,891,674]],   /* cầu đá bắc qua vực: thú không nhảy vào */
    dauHieu:'loi',
    maskW:192,maskH:128,
    maskData:'192x128:0:2fo,z,4d,z,4d,z,4c,11,4b,11,4b,11,4b,12,49,13,49,13,49,18,43,1k,3r,1r,3i,1v,3f,1y,3c,21,3a,22,39,24,2i,3,n,25,2g,3,o,1k,a,b,2f,4,o,1k,a,a,2f,5,a,3,b,1k,a,a,2e,6,a,3,b,1k,a,a,2d,7,a,3,b,1k,a,a,2c,8,a,3,b,1k,a,9,2d,8,a,3,b,1k,a,9,2c,9,b,1x,a,9,2b,a,b,1x,a,8,2c,b,a,1x,a,8,2b,c,a,1x,a,8,2b,c,a,1x,a,8,2b,c,a,1x,a,7,2c,c,a,1x,a,7,2c,c,a,1x,a,7,2d,b,4,2k,2d,2y,2f,2x,2f,2x,2f,x,9,1r,2g,w,9,1r,2k,s,9,1q,2q,n,9,1q,2u,j,9,1q,2z,e,9,1q,33,a,9,1q,3v,1h,3w,1f,3y,19,44,14,49,y,4e,s,4k,q,4m,p,4n,o,4o,m,4q,l,4r,k,4u,h,4x,f,4y,f,3x,1,w,i,3r,w,3,m,3l,14,1,m,3j,1t,3r,1k,g,5,37,1k,d,9,8,2,2w,1i,c,c,8,4,2u,1h,b,e,8,5,2t,1c,g,e,8,7,2r,17,l,e,8,9,2p,17,k,f,8,b,2n,18,j,f,8,b,2n,18,j,f,8,c,2m,1a,h,f,8,c,2m,1c,f,f,8,c,2m,1d,e,f,8,d,2l,26,8,d,2l,2r,2l,2r,2l,2q,2m,2q,2m,2p,2n,2p,2n,2o,2o,2o,2p,2n,2q,8,1,2d,2r,6,2,2d,2s,3,4,2d,2t,1,5,2d,2z,2d,2z,2d,2z,2d,2z,2d,2z,2d,2z,2c,30,2b,31,2b,31,2a,32,29,33,29,33,28,34,28,34,27,2x,2f,2w,2f,2w,2g,2u,2i,2t,2i,2s,2k,2r,2l,2p,2m,2p,2n,1d',
    xuatPhat:{x:740,y:990},
    khu:[
      {id:1,ten:'Khu 1 – Bậc Đá Lôi',y0:730,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Cầu Vực',y0:460,y1:730,ti:{thuong:60,hiem:30,suthi:8,huyenthoai:2}},
      {id:3,ten:'Khu 3 – Bia Lôi',y0:250,y1:460,ti:{thuong:35,hiem:35,suthi:22,huyenthoai:8}},
      {id:4,ten:'Khu 4 – Cổng Lôi Điện',y0:0,y1:250,ti:{thuong:15,hiem:30,suthi:35,huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:980,y:884,ghiChu:'cạnh tinh thể/đá khu 1'},
         {id:'1b',x:860,y:876,ghiChu:'cạnh tinh thể/đá khu 1'},
         {id:'1c',x:660,y:788,ghiChu:'cạnh tinh thể/đá khu 1'},
         {id:'1d',x:620,y:916,ghiChu:'cạnh tinh thể/đá khu 1'},
         {id:'1e',x:524,y:780,ghiChu:'cạnh tinh thể/đá khu 1'},
         {id:'1f',x:1068,y:788,ghiChu:'cạnh tinh thể/đá khu 1'},
         {id:'1g',x:980,y:756,ghiChu:'cạnh tinh thể/đá khu 1'}],
      2:[{id:'2a',x:500,y:660,ghiChu:'cạnh tinh thể/đá khu 2'},
         {id:'2b',x:676,y:620,ghiChu:'cạnh tinh thể/đá khu 2'},
         {id:'2c',x:556,y:692,ghiChu:'cạnh tinh thể/đá khu 2'},
         {id:'2d',x:964,y:692,ghiChu:'cạnh tinh thể/đá khu 2'},
         {id:'2e',x:1028,y:668,ghiChu:'cạnh tinh thể/đá khu 2'},
         {id:'2f',x:1156,y:724,ghiChu:'cạnh tinh thể/đá khu 2'},
         {id:'2g',x:924,y:540,ghiChu:'cạnh tinh thể/đá khu 2'}],
      3:[{id:'3a',x:356,y:380,ghiChu:'cạnh tinh thể/đá khu 3'},
         {id:'3b',x:572,y:340,ghiChu:'cạnh tinh thể/đá khu 3'},
         {id:'3c',x:572,y:396,ghiChu:'cạnh tinh thể/đá khu 3'},
         {id:'3d',x:700,y:356,ghiChu:'cạnh tinh thể/đá khu 3'},
         {id:'3e',x:868,y:428,ghiChu:'cạnh tinh thể/đá khu 3'},
         {id:'3f',x:1020,y:452,ghiChu:'cạnh tinh thể/đá khu 3'},
         {id:'3g',x:1100,y:436,ghiChu:'cạnh tinh thể/đá khu 3'}],
      4:[{id:'4b',x:612,y:244,ghiChu:'cạnh tinh thể/đá khu 4'},
         {id:'4c',x:828,y:244,ghiChu:'cạnh tinh thể/đá khu 4'},
         {id:'4d',x:916,y:228,ghiChu:'cạnh tinh thể/đá khu 4'},
         {id:'4e',x:996,y:212,ghiChu:'cạnh tinh thể/đá khu 4'},
         {id:'4f',x:1076,y:244,ghiChu:'cạnh tinh thể/đá khu 4'}]
    },
    boss:{x:777,y:150,banKinhCham:38,ten:'Boss Truyền Thuyết'}
  },
  'suong-coc':{
    ten:'Sương Cốc',
    anh:DIR+'map-tham-hiem-suong-coc.webp?v=3',
    rong:1536,cao:1024,
    camNhay:[[700,645,845,732],[765,358,902,422]],   /* 2 cầu gỗ: thú không nhảy vào */
    dauHieu:'suong',
    maskW:192,maskH:128,
    maskData:'192x128:0:201,h,4t,k,4q,m,4o,q,2,5,4d,11,6,1,42,1d,3x,1i,3t,1l,3q,1k,3q,1l,3g,1v,3h,1j,41,19,46,t,7,3,49,s,4k,q,4n,p,4m,p,4l,q,4l,q,4m,p,4n,o,4p,m,4r,k,4r,o,4m,s,4j,v,4g,x,4g,x,4g,y,4f,1,5,s,4l,t,4k,u,4j,v,4g,u,4f,v,49,11,4a,11,4a,11,4a,10,4c,10,4d,z,4e,y,4g,x,4g,w,4i,v,4i,x,4m,v,8,9,40,1d,40,1c,42,1b,43,18,45,16,46,15,47,15,47,15,47,16,46,16,3o,1,b,1d,3m,1q,3l,1q,3m,1q,3m,1p,3o,1o,3o,1o,3p,1m,3t,1j,3w,1g,3z,1b,45,m,7,a,4d,f,4x,c,4z,d,4p,3,6,d,4l,r,4k,r,4j,u,4h,w,4g,x,4e,10,4c,11,4a,14,48,16,46,18,45,1d,3z,1h,3v,1i,3k,1,9,1i,3j,5,7,1i,3h,8,3,1k,3h,1v,3i,1u,3j,1s,3k,1k,1,6,3m,1i,3v,1g,3z,1d,42,1b,47,17,46,18,45,18,45,16,4a,12,4b,10,4d,z,4d,m,4r,g,4w,f,4x,f,4x,f,4x,f,4x,f,4x,f,4x,f,4x,e,2l',
    xuatPhat:{x:740,y:990},
    khu:[
      {id:1,ten:'Khu 1 – Bậc Đá Sương',y0:690,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Cầu Gỗ',y0:450,y1:690,ti:{thuong:60,hiem:30,suthi:8,huyenthoai:2}},
      {id:3,ten:'Khu 3 – Ao Sen',y0:260,y1:450,ti:{thuong:35,hiem:35,suthi:22,huyenthoai:8}},
      {id:4,ten:'Khu 4 – Gốc Cổ Thụ',y0:0,y1:260,ti:{thuong:15,hiem:30,suthi:35,huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:500,y:820,ghiChu:'nấm tím trái'},
         {id:'1b',x:600,y:800,ghiChu:'cụm đá trái đường'},
         {id:'1c',x:630,y:872,ghiChu:'bụi hoa dưới'},
         {id:'1d',x:868,y:780,ghiChu:'tảng đá nhỏ phải'},
         {id:'1e',x:948,y:920,ghiChu:'nấm tím cạnh biển KHU 1'},
         {id:'1f',x:985,y:805,ghiChu:'bụi cây cạnh cổng đá phải'},
         {id:'1g',x:640,y:722,ghiChu:'bụi hoa đầu cầu'}],
      2:[{id:'2a',x:635,y:590,ghiChu:'dương xỉ bờ trái'},
         {id:'2b',x:705,y:590,ghiChu:'khối đá vuông'},
         {id:'2c',x:790,y:525,ghiChu:'bụi cỏ giữa'},
         {id:'2d',x:1048,y:595,ghiChu:'hoa trắng phải'},
         {id:'2e',x:955,y:640,ghiChu:'đá dưới biển KHU 2'},
         {id:'2f',x:950,y:498,ghiChu:'nấm tím cạnh đá'},
         {id:'2g',x:885,y:628,ghiChu:'hoa xanh'}],
      3:[{id:'3a',x:863,y:448,ghiChu:'cụm đá phải'},
         {id:'3b',x:615,y:430,ghiChu:'bụi hoa trái'},
         {id:'3c',x:665,y:392,ghiChu:'nấm tím trái biển KHU 3'},
         {id:'3d',x:725,y:362,ghiChu:'đá thấp cạnh biển'},
         {id:'3e',x:862,y:350,ghiChu:'bờ ao sen'},
         {id:'3f',x:655,y:268,ghiChu:'nấm tím phía trên'},
         {id:'3g',x:796,y:298,ghiChu:'bụi hoa phải'}],
      4:[{id:'4a',x:625,y:196,ghiChu:'nấm tím cạnh cột đá'},
         {id:'4b',x:696,y:231,ghiChu:'bụi hoa trái'},
         {id:'4c',x:924,y:196,ghiChu:'bụi cây phải'},
         {id:'4d',x:1085,y:165,ghiChu:'đá rìa quảng trường'},
         {id:'4e',x:990,y:185,ghiChu:'hoa dưới cột phải'}]
    },
    boss:{x:835,y:160,banKinhCham:38,ten:'Boss Truyền Thuyết'}
  },
  'van-dao':{
    ten:'Vân Đảo',
    anh:DIR+'map-tham-hiem-van-dao.webp?v=3',
    rong:1536,cao:1024,
    camNhay:[[700,665,880,752],[730,438,890,528],[715,292,845,352]],   /* 3 cầu gỗ: thú không nhảy vào */
    dauHieu:'van',
    maskW:192,maskH:128,
    maskData:'192x128:0:2kr,19,40,1c,40,1c,40,1c,3t,1o,3o,1s,3k,1y,3f,1z,3d,1z,3d,1z,3d,1z,3d,1z,3d,1z,3d,16,1,o,3h,16,4,4,3y,15,4s,k,4s,k,4s,k,4s,k,4t,2,2,b,2,1,4y,b,51,b,51,b,51,b,4,g,3j,u,4,b,3,h,35,1a,2,b,2,i,33,29,33,29,33,29,33,29,33,29,2w,1,6,29,2v,2h,9,4,2i,2h,9,4,2i,2u,2i,2u,2i,2u,2i,1m,2,f,2,p,2i,1i,6,f,2,j,3h,1,a,e,6,f,2,f,3w,e,6,f,2,f,3w,e,6,f,2,f,3w,e,6,f,2,f,3w,e,6,f,2,f,3w,e,6,f,2,f,3w,3,5,a,2,f,2,i,3t,3,5,a,2,f,2,r,3k,2,6,a,2,f,2,e,5,6,3m,3,5,17,5,6,3m,1f,5,6,3m,1f,5,6,3m,1f,5,6,5,1,3d,1i,5,6,4,3,5,a,2w,1j,5,6,4,3,5,a,3c,13,5,6,4,i,3c,13,5,6,4,i,3c,13,5,6,4,n,37,13,5,6,4,4,7,c,37,13,5,6,4,4,7,c,37,13,5,6,4,4,8,2,3g,13,5,6,4,4,3q,1m,3q,1m,3c,20,3c,1v,3i,1m,3q,f,2,i,1,d,3z,b,6,i,2,2,4q,i,4a,i,2,i,4e,e,2,i,40,4,a,e,2,i,3z,5,a,e,2,i,3z,5,a,e,2,i,3j,3,d,5,a,e,2,i,3i,4,d,5,a,e,2,i,1,3,3d,5,d,5,a,16,38,6,d,5,a,1a,33,7,d,5,a,18,34,8,d,5,a,18,34,8,d,5,a,18,34,8,d,5,a,18,34,8,d,5,a,18,2l,1,i,q,a,18,2j,3,i,q,a,18,2h,5,i,q,a,18,2f,7,c,2e,2d,9,c,2e,2d,9,c,2e,2d,9,c,2e,2d,9,c,2e,2d,2z,2i,2u,a,6,7,6,1y,32,5,8,23,2w,5,9,28,1y,7,10,2d,1s,7,10,2g,1p,7,10,2k,1l,7,10,2o,1h,7,10,2s,1d,7,v,34,1s,3q,1d,45,14,4b,y,4e,t,4j,p,4n,p,4n,p,4n,p,2f',
    xuatPhat:{x:740,y:990},
    khu:[
      {id:1,ten:'Khu 1 – Bãi Pha Lê',y0:690,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Cổng Torii',y0:450,y1:690,ti:{thuong:60,hiem:30,suthi:8,huyenthoai:2}},
      {id:3,ten:'Khu 3 – Đình Mây',y0:290,y1:450,ti:{thuong:35,hiem:35,suthi:22,huyenthoai:8}},
      {id:4,ten:'Khu 4 – Thiên Điện',y0:0,y1:290,ti:{thuong:15,hiem:30,suthi:35,huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:320,y:815,ghiChu:'tinh thể cạnh khung gỗ'},
         {id:'1b',x:138,y:852,ghiChu:'bụi hoa góc trái'},
         {id:'1c',x:470,y:895,ghiChu:'tảng đá thấp'},
         {id:'1d',x:600,y:905,ghiChu:'tinh thể trái biển KHU 1'},
         {id:'1e',x:430,y:830,ghiChu:'bụi hoa trắng'},
         {id:'1f',x:850,y:800,ghiChu:'tinh thể phải đường'},
         {id:'1g',x:900,y:840,ghiChu:'tinh thể nhỏ phải'},
         {id:'1h',x:990,y:920,ghiChu:'cụm đá dưới cây phải'},
         {id:'1i',x:1150,y:925,ghiChu:'dưới cây hoa phải'},
         {id:'1j',x:650,y:760,ghiChu:'bụi cỏ chân cầu'}],
      2:[{id:'2a',x:715,y:525,ghiChu:'tinh thể chân cầu'},
         {id:'2b',x:640,y:560,ghiChu:'bụi hoa dưới cây nhỏ'},
         {id:'2c',x:640,y:665,ghiChu:'tinh thể gờ đá trái'},
         {id:'2d',x:950,y:545,ghiChu:'tinh thể phải đường'},
         {id:'2e',x:925,y:605,ghiChu:'bụi hoa cạnh biển KHU 2'},
         {id:'2f',x:990,y:660,ghiChu:'tảng đá thấp phải'},
         {id:'2g',x:1060,y:585,ghiChu:'hoa giữa cổng torii'},
         {id:'2h',x:1238,y:600,ghiChu:'gờ đá rào phải'},
         {id:'2i',x:905,y:495,ghiChu:'tinh thể đầu dốc phải'},
         {id:'2j',x:1130,y:625,ghiChu:'cạnh tinh thể to phải'}],
      3:[{id:'3a',x:400,y:435,ghiChu:'tinh thể rìa trái'},
         {id:'3b',x:330,y:428,ghiChu:'hàng rào rìa trái'},
         {id:'3c',x:540,y:348,ghiChu:'bụi hoa trước đình'},
         {id:'3d',x:630,y:392,ghiChu:'tảng đá cạnh biển KHU 3'},
         {id:'3e',x:925,y:430,ghiChu:'tảng đá phải'},
         {id:'3f',x:900,y:358,ghiChu:'bụi hoa phải trên'},
         {id:'3g',x:1075,y:430,ghiChu:'cây nhỏ sau cột đá'},
         {id:'3h',x:470,y:395,ghiChu:'bụi hoa trái'}],
      4:[{id:'4a',x:612,y:232,ghiChu:'tinh thể trái quảng trường'},
         {id:'4b',x:560,y:200,ghiChu:'bụi hoa cạnh cột đá trái'},
         {id:'4c',x:968,y:220,ghiChu:'tinh thể phải quảng trường'},
         {id:'4d',x:1048,y:212,ghiChu:'hàng rào bậc đá phải'},
         {id:'4e',x:690,y:252,ghiChu:'bụi hoa dưới biển KHU 4'},
         {id:'4f',x:900,y:232,ghiChu:'bụi hoa phải đường'}]
    },
    boss:{x:800,y:170,banKinhCham:38,ten:'Boss Truyền Thuyết'}
  },
  'phong-nguyen':{
    ten:'Phong Nguyên',
    anh:DIR+'map-tham-hiem-phong-nguyen.webp?v=3',
    rong:1536,cao:1024,
    camNhay:[[740,360,855,425],[740,615,885,685]],   /* 2 cầu gỗ: thú không nhảy vào */
    dauHieu:'phong',
    maskW:192,maskH:128,
    maskData:'192x128:0:24u,t,4j,t,a,1,47,u,a,1,46,v,a,2,43,x,a,2,3q,5,6,z,a,9,3i,1b,a,b,3h,1w,3g,1y,3f,21,3b,26,2o,5,e,1u,a,6,2f,a,c,1v,a,7,2e,b,b,1v,a,7,2f,2g,a,7,2f,2g,a,7,2f,2g,a,7,2f,1s,b,u,31,16,b,u,32,15,b,u,d,1,2p,14,b,u,d,2,2p,13,b,u,d,2,2q,b,7,k,b,u,d,1,2r,6,c,k,b,u,d,1,2s,4,d,k,b,u,d,1,2t,3,d,k,b,u,d,1,2v,1,d,k,b,u,d,1,39,1t,9,1,1o,4,1h,23,1i,j,16,25,1h,s,11,22,1h,r,16,1x,1h,s,19,d,2y,s,b,9,p,d,2y,s,b,f,j,d,2z,r,b,l,d,d,2z,r,b,q,8,d,30,1w,3,e,30,2b,33,29,37,26,3b,24,3b,y,a,v,3c,v,a,y,3e,q,a,10,3i,k,a,12,4a,14,48,17,3w,1j,3s,1o,3o,14,c,c,3k,14,c,f,3h,14,c,g,3g,14,c,i,3e,14,c,j,3d,14,c,j,3d,14,c,j,30,1h,c,j,2z,1i,c,6,a,3,2z,1i,c,4,3e,1i,c,4,3e,1x,3f,1x,3f,1x,3f,1h,3v,1h,3v,h,j,h,4v,h,4v,h,4v,h,4v,h,4u,j,4t,k,4s,1h,3r,1m,33,e,5,14,6,h,2m,u,5,14,6,j,29,15,5,13,7,5,4,p,1u,15,6,12,7,3,8,p,1s,15,2,16,7,3,a,o,1r,2n,a,o,1r,2n,a,o,1r,2n,a,p,1q,2m,b,p,1q,2m,b,p,1q,2m,b,o,1r,3l,1k,3r,z,7,7,3z,z,4c,z,4c,10,26,a,1v,13,24,a,1t,16,u,5,14,a,1s,18,r,a,11,a,1q,1c,o,b,11,a,1o,1q,c,b,11,a,1n,1z,4,b,11,a,1m,23,1,b,11,a,1l,24,1,b,11,a,1l,24,1,b,11,a,1e,2b,1,b,11,a,r,2,k,2c,1,b,r,7,3,a,p,8,g,2c,1,b,o,n,n,c,e,2c,1,c,n,d,w,d,e,2c,1,c,n,d,w,d,e,2c,10,d,w,d,l,25,10,d,w,d,8,4,9,25,z,e,w,d,4,d,4,25,z,f,v,d,4,2m,2q,2m,2q,2m,2q,2n,2o,1m',
    xuatPhat:{x:800,y:1000},
    khu:[
      {id:1,ten:'Khu 1 – Đồng Gió',y0:690,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Triền Lá Đỏ',y0:370,y1:690,ti:{thuong:60,hiem:30,suthi:8,huyenthoai:2}},
      {id:3,ten:'Khu 3 – Bãi Trụ Đá',y0:200,y1:370,ti:{thuong:35,hiem:35,suthi:22,huyenthoai:8}},
      {id:4,ten:'Khu 4 – Cổng Đá Cổ',y0:0,y1:200,ti:{thuong:15,hiem:30,suthi:35,huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:150,y:855,ghiChu:'bụi cỏ lòng đảo trái'},
         {id:'1b',x:360,y:785,ghiChu:'cạnh gốc cây trái'},
         {id:'1c',x:430,y:900,ghiChu:'cỏ gió cạnh trụ đá'},
         {id:'1d',x:500,y:965,ghiChu:'cỏ dưới trụ đá'},
         {id:'1e',x:560,y:830,ghiChu:'cỏ gió trái biển KHU 1'},
         {id:'1f',x:640,y:790,ghiChu:'bụi cỏ cạnh đá nhỏ'},
         {id:'1g',x:900,y:880,ghiChu:'bụi cỏ phải biển KHU 1'},
         {id:'1h',x:960,y:810,ghiChu:'cỏ gió phải đường'},
         {id:'1i',x:1100,y:860,ghiChu:'bụi cỏ lớn phải'},
         {id:'1j',x:1240,y:800,ghiChu:'rìa đảo phải'}],
      2:[{id:'2a',x:230,y:395,ghiChu:'cỏ gió rìa trái'},
         {id:'2b',x:330,y:430,ghiChu:'bụi cỏ trái'},
         {id:'2c',x:520,y:405,ghiChu:'cỏ lau cạnh trụ đá'},
         {id:'2d',x:610,y:420,ghiChu:'bụi cỏ trên tảng đá'},
         {id:'2e',x:500,y:610,ghiChu:'bụi hoa tầng dưới'},
         {id:'2f',x:640,y:590,ghiChu:'bụi cỏ cạnh đá'},
         {id:'2g',x:700,y:515,ghiChu:'cỏ trái đường'},
         {id:'2h',x:830,y:450,ghiChu:'cỏ phải đường'},
         {id:'2i',x:1010,y:540,ghiChu:'bụi cỏ cạnh biển KHU 2'},
         {id:'2j',x:1078,y:545,ghiChu:'cỏ gần dốc phải'}],
      3:[{id:'3a',x:420,y:235,ghiChu:'rìa trái khu 3'},
         {id:'3b',x:520,y:245,ghiChu:'bụi cỏ trái'},
         {id:'3c',x:640,y:255,ghiChu:'cỏ gió trên đá'},
         {id:'3d',x:705,y:320,ghiChu:'cạnh đá lớn'},
         {id:'3e',x:975,y:290,ghiChu:'cỏ phải biển KHU 3'},
         {id:'3f',x:1040,y:275,ghiChu:'bụi cỏ gần đống đá'},
         {id:'3g',x:1105,y:335,ghiChu:'cỏ lau chân trụ đá'},
         {id:'3h',x:930,y:348,ghiChu:'cỏ gần cầu'}],
      4:[{id:'4a',x:545,y:190,ghiChu:'bụi cỏ cạnh cây trái'},
         {id:'4b',x:640,y:195,ghiChu:'cỏ trái quảng trường'},
         {id:'4c',x:885,y:190,ghiChu:'dưới biển KHU 4'},
         {id:'4d',x:965,y:185,ghiChu:'cỏ phải quảng trường'},
         {id:'4e',x:1020,y:180,ghiChu:'cạnh đống đá phải'}]
    },
    boss:{x:770,y:150,banKinhCham:38,ten:'Boss Truyền Thuyết'}
  },
  'tuyet-nguyen':{
    ten:'Tuyết Nguyên',
    anh:DIR+'map-tham-hiem-tuyet-nguyen.webp?v=2',
    rong:1536,cao:1024,
    camNhay:[[600,480,895,615]],              /* [x0,y0,x1,y1] thú không được nhảy vào (cầu đá, tránh chắn lối) */
    dauHieu:'tuyet',                          /* kiểu dấu hiệu môi trường (bảng DAUHIEU) */
    maskW:192,maskH:128,                      /* lưới va chạm: mỗi ô = rong/maskW = 8 đơn vị map */
    maskData:'192x128:0:2fo,v,6,2,42,3,1,11,1,5,3w,2,1,1f,7,3,38,27,37,24,3a,22,3c,20,3d,1z,3e,1y,3f,1w,3g,1s,3l,1o,3p,1m,3q,g,5,10,3t,e,6,y,3v,d,6,z,3v,c,5,10,3v,e,1,12,3v,1h,3v,1h,3v,1h,3w,1h,41,1b,42,1a,44,19,43,1a,43,19,43,1d,40,1h,3x,1i,a,2,3j,1t,3i,1u,3g,1l,7,4,3e,1l,2u,5,p,1m,2y,8,7,1y,31,2b,35,a,3,1t,39,5,6,1s,3c,2,6,1j,4,5,3k,1i,8,1,3l,1e,3y,1d,42,1a,43,19,44,d,8,o,43,d,f,h,3z,1,3,h,4r,q,36,7,18,u,33,6,19,w,31,6,19,x,30,5,v,2,f,v,30,5,h,2,8,a,e,t,2z,6,g,l,h,p,2z,6,g,l,j,n,1s,2,14,8,f,c,4,6,l,p,1m,3,13,a,e,b,6,6,m,18,10,4,11,b,f,b,7,7,m,16,r,5,3,5,z,d,f,a,8,a,k,15,p,g,x,e,f,2,7,1,8,c,j,14,9,1,d,i,w,e,g,1,h,d,j,14,7,3,c,i,x,c,g,1,h,g,i,15,3,11,w,a,g,2,h,h,j,2a,t,a,f,4,a,1,4,k,j,2a,q,c,a,8,9,r,l,27,l,1,3,f,6,d,4,u,n,25,k,21,o,1y,o,a,3,1s,n,1v,p,9,5,1u,m,1c,2,f,o,a,5,1y,i,1a,7,4,3,5,p,8,7,22,c,1a,9,2,4,5,q,7,7,26,7,10,3,7,a,2,5,4,r,6,7,3c,s,4,s,5,7,3b,t,4,u,4,5,3c,t,3,w,2,7,39,u,3,17,37,v,2,18,19,7,1r,w,1,18,18,a,1o,27,16,c,1n,27,15,d,1n,26,e,d,f,d,1n,26,b,j,c,d,1b,4,3,3,3,1v,2,8,7,r,9,c,1a,6,1,5,2,1v,2,7,6,u,8,b,1b,c,3,n,1,15,5,3,7,x,7,9,1b,e,1,n,3,p,3,b,f,z,8,5,1d,w,9,p,3,c,d,11,1p,x,9,o,2,e,b,13,1o,x,c,l,2,e,b,13,1p,x,b,l,2,e,b,13,1q,5,1,r,b,k,3,c,c,14,3,4,1j,2,4,q,b,k,3,c,c,14,1,7,1p,p,b,k,5,8,f,12,2,8,1o,p,b,k,t,10,2,9,1o,p,c,j,j,5,5,z,3,9,1o,p,c,j,i,7,3,z,4,a,1n,p,5,5,3,i,9,3,5,9,1,t,a,b,1n,p,3,8,3,h,2,4,1,6,4,11,c,b,1n,p,2,a,3,g,1,d,2,n,1,a,c,f,1q,l,3,b,3,t,2,n,m,g,1w,6,2,5,4,c,6,1,1,p,1,m,m,h,26,2,5,c,9,o,1,l,n,g,2e,d,8,o,1,c,2,5,o,h,2e,d,8,o,1,b,w,g,2f,d,8,o,1,b,w,9,1,5,2g,c,9,o,1,b,w,9,2m,c,9,o,1,b,x,8,2m,c,9,n,3,9,y,7,2o,a,a,n,4,7,10,6,2p,8,c,l,6,5,12,3,2s,6,d,8',   /* DÁN chuỗi từ nút "Copy Mask" vào đây (rỗng = đi tự do) */
    xuatPhat:{x:790,y:980},
    khu:[
      {id:1,ten:'Khu 1 – Hồ Băng',     y0:780,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Cầu Đá',      y0:520,y1:780, ti:{thuong:60,hiem:30,suthi:8,  huyenthoai:2}},
      {id:3,ten:'Khu 3 – Thác Nước',   y0:270,y1:520, ti:{thuong:35,hiem:35,suthi:22, huyenthoai:8}},
      {id:4,ten:'Khu 4 – Cổng Hang Băng',y0:0, y1:270, ti:{thuong:15,hiem:30,suthi:35, huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:650,y:868,ghiChu:'bụi tuyết trái biển KHU 1'},
         {id:'1b',x:668,y:806,ghiChu:'cạnh cụm đá nâu'},
         {id:'1c',x:868,y:802,ghiChu:'cạnh bụi đá bên phải đường'},
         {id:'1d',x:970,y:925,ghiChu:'cạnh cụm đá tuyết gần hang dưới'},
         {id:'1e',x:1228,y:978,ghiChu:'tinh thể góc dưới phải'},
         {id:'1f',x:352,y:968,ghiChu:'tảng đá dưới hồ băng'},
         {id:'1g',x:578,y:1001,ghiChu:'gốc thông cạnh đá dưới'},
         {id:'1h',x:210,y:816,ghiChu:'đá bờ trái hồ băng'},
         {id:'1i',x:1006,y:796,ghiChu:'bụi cạnh cụm thông phải'}],
      2:[{id:'2a',x:548,y:678,ghiChu:'bụi cây cạnh suối'},
         {id:'2b',x:652,y:740,ghiChu:'bụi tuyết trái đường'},
         {id:'2c',x:1042,y:704,ghiChu:'bụi tuyết dưới biển KHU 2'},
         {id:'2d',x:390,y:708,ghiChu:'cụm đá gần cây khô'},
         {id:'2e',x:868,y:652,ghiChu:'bụi tuyết đầu cầu'},
         {id:'2f',x:960,y:754,ghiChu:'tinh thể nhỏ phải đường'},
         {id:'2g',x:492,y:748,ghiChu:'dãy đá trên hồ băng'},
         {id:'2h',x:520,y:624,ghiChu:'tinh thể cạnh suối'},
         {id:'2i',x:184,y:660,ghiChu:'tinh thể gần cây khô'},
         {id:'2j',x:1160,y:668,ghiChu:'trước hang đá'}],
      3:[{id:'3a',x:745,y:456,ghiChu:'cụm đá giữa trái'},
         {id:'3b',x:870,y:466,ghiChu:'bụi tuyết gần sông'},
         {id:'3c',x:968,y:400,ghiChu:'bụi tuyết dưới biển KHU 3'},
         {id:'3d',x:736,y:300,ghiChu:'bụi đá trái đường'},
         {id:'3e',x:722,y:384,ghiChu:'tinh thể nhỏ trái đường'},
         {id:'3f',x:1096,y:384,ghiChu:'bụi cây dưới tháp'},
         {id:'3g',x:684,y:452,ghiChu:'bụi đá gần rừng thông'}],
      4:[{id:'4a',x:676,y:212,ghiChu:'bụi đá trái quảng trường'},
         {id:'4b',x:848,y:232,ghiChu:'tinh thể dưới biển KHU 4'},
         {id:'4c',x:950,y:252,ghiChu:'bụi tuyết phải'},
         {id:'4d',x:632,y:165,ghiChu:'tinh thể trái quảng trường'},
         {id:'4e',x:654,y:268,ghiChu:'cây con trái đường'},
         {id:'4f',x:894,y:172,ghiChu:'tinh thể trước hang'}]
    },
    boss:{x:780,y:168,banKinhCham:38,ten:'Boss Truyền Thuyết'},   /* đứng cố định giữa quảng trường khu 4, KHÔNG có tỉ lệ ngẫu nhiên; ten chỉ là tên dự phòng khi chưa lấy được boss thật */
    /* GỢI Ý vùng nên tô khi Debug Mask (đa giác quảng trường khu 4, vẽ viền vàng đứt nét lúc bật Debug Mask). KHÔNG tự thêm vào mask. */
    maskThem:[
      {loai:'da-giac',ten:'quảng trường khu 4',pts:[[560,70],[1060,70],[1120,200],[1000,260],[560,260],[520,160]]}
    ]
  }
};

/* ---------- HÀM THUẦN (không DOM) ---------- */
function rnd(a,b,rng){return a+(rng||Math.random)()*(b-a);}
function vung(slug){return VUNG[slug||'tuyet-nguyen']||null;}

/* khu chứa toạ độ y (đơn vị map). Ngoài biên thì kẹp vào khu gần nhất. */
function khuTai(v,y){
  var i,k;if(!v)return null;
  for(i=0;i<v.khu.length;i++){k=v.khu[i];if(y>=k.y0&&y<k.y1)return k;}
  return y<v.khu[v.khu.length-1].y0?v.khu[v.khu.length-1]:v.khu[0];}

/* tung độ hiếm theo tỉ lệ của khu; trả khoá HIEM ('thuong'|'hiem'|'suthi'|'huyenthoai'). Tỉ lệ không cần tổng đúng 100 (chuẩn hoá). */
function tungHiem(khu,rng){
  var t=khu&&khu.ti,sum=0,i,w,x;if(!t)return 'thuong';
  for(i=0;i<HIEM_KEYS.length;i++)sum+=Math.max(0,+t[HIEM_KEYS[i]]||0);
  if(sum<=0)return 'thuong';
  x=(rng||Math.random)()*sum;
  for(i=0;i<HIEM_KEYS.length;i++){w=Math.max(0,+t[HIEM_KEYS[i]]||0);x-=w;if(x<0)return HIEM_KEYS[i];}
  return 'thuong';}

/* số điểm rung cần hiện trong 1 lần làm mới của khu (3-4) */
function soDiemCan(rng){var a=CFG.soDiemHien;return Math.floor(rnd(a[0],a[1]+1,rng));}

/* ---------- ĐỒNG HỒ BOSS (giờ thực, sống qua đóng/mở game) ---------- */
function bossKey(slug){return CFG.boss.luuKhoa+(slug||'tuyet-nguyen');}
function bossReadyAt(slug){var v=0;try{v=+localStorage.getItem(bossKey(slug))||0;}catch(e){}return v;}
function bossConLai(slug,now){return Math.max(0,bossReadyAt(slug)-(now==null?Date.now():now));}   /* ms còn lại; 0 = boss đang đứng đó */
/* ---------- BOSS THẦN THẾ GIỚI (27/11/2026) ----------
   Trạng thái + lịch ở 103-boss-than-the-gioi.js (TTGBTG). Map chỉ ĐỌC trạng thái ~250ms/lần và vẽ:
   - đúng vùng + đang trong khung có mặt + chưa chết: đứng ở 1 ô đi được trong khu cao nhất (vị trí cố định theo lần xuất hiện + số lần chạy, không phụ thuộc người chơi)
   - có người khác đang đánh (1 vs 1): boss ẨN, hiện icon 2 kiếm chéo + chữ "Đang giao chiến"
   - người chơi này vừa thua: boss mờ + đếm ngược khóa (khoaCon), chạm không vào được tới khi hết khóa */
function thanSlug(z){var Z=root.THU_MOI&&root.THU_MOI.zones,i;if(Z)for(i=0;i<Z.length;i++)if(Z[i].z===z)return Z[i].slug;return null;}
function thanUid(){return root.TTGBTG&&root.TTGBTG.uid?root.TTGBTG.uid():'local';}
function thanRng(str){var h=2166136261,i;for(i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
  return function(){h^=h<<13;h>>>=0;h^=h>>>17;h^=h<<5;h>>>=0;return h/4294967296;};}
/* ô đi được (chừa 1 ô quanh) giống choNhay, không cần group */
function thanDiDuoc(s,x,y){
  var m=s.mask,v=s.v,cw,ch,i,o=[[0,0],[1,0],[-1,0],[0,1],[0,-1]],gx,gy;
  if(m&&m.n>0){cw=v.rong/m.w;ch=v.cao/m.h;
    for(i=0;i<o.length;i++){gx=Math.floor(x/cw)+o[i][0];gy=Math.floor(y/ch)+o[i][1];
      if(gx<0||gy<0||gx>=m.w||gy>=m.h||m.g[gy*m.w+gx]!==1)return false;}}
  return !(v.camNhay||[]).some(function(r){return x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];});}
function thanViTri(s,key){
  var v=s.v,k=v.khu&&v.khu[v.khu.length-1],b=v.boss,rnd=thanRng(key),i,x,y,y0,y1;
  y0=k?k.y0:0;y1=k?k.y1:v.cao;
  for(i=0;i<80;i++){
    x=80+rnd()*(v.rong-160);y=y0+(y1-y0)*(0.15+rnd()*0.7);
    if(b&&Math.pow(x-b.x,2)+Math.pow(y-b.y,2)<130*130)continue;
    if(thanDiDuoc(s,x,y))return {key:key,x:x,y:y};}
  return {key:key,x:b?b.x-130:v.rong/2,y:b?b.y+30:v.cao/2};}
function thanLamMoi(s){
  var B=root.TTGBTG,st,key,o;
  s.than=null;
  if(!B)return;
  try{st=B.trangThai();}catch(e){return;}
  if(!st||!st.coMat||st.chet||thanSlug(st.vung)!==s.slug)return;
  key=st.maLan+'|'+st.vung+'|'+(st.soChay||0);
  if(!s.thanPos||s.thanPos.key!==key)s.thanPos=thanViTri(s,key);
  o=root.THU_MOI&&root.THU_MOI.byId&&root.THU_MOI.byId[st.loai];
  s.than={loai:st.loai,ten:(o&&o.ten)||st.loai,hp:st.hp,dangDanh:st.dangDanh,hien:!!st.hien,khoa:B.khoaCon(thanUid()),x:s.thanPos.x,y:s.thanPos.y,r:CFG.than.banKinhCham};}
/* BOSS THẦN ĐI LANG THANG (27/11/2026): chỉ đi trên ô đi được (mask, tránh vùng cấm nhảy), mỗi bước chọn điểm gần (buocMin..buocMax) có đường thẳng đi được, rồi nghỉ. Đứng yên khi ẩn (có người đánh). Vị trí do phiên map này giữ (chưa có online), khóa theo lần xuất hiện + số lần chạy nên chạy sang vùng khác thì sinh vị trí mới */
function thanDuongTrong(s,x0,y0,x1,y1){var n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)/10)),i;for(i=1;i<=n;i++)if(!thanDiDuoc(s,x0+(x1-x0)*i/n,y0+(y1-y0)*i/n))return false;return true;}
function thanDi(s,dt){
  var P=s.thanPos,w=s.thanWalk,C=CFG.than,rnd,i,a,d,x,y,dx,dy,dist,st;
  if(!P||!s.than||!s.than.hien)return;
  if(!w||w.key!==P.key)w=s.thanWalk={key:P.key,n:0,tx:null,ty:null,wait:C.nghiMin};
  if(w.wait>0){w.wait-=dt;return;}
  if(w.tx==null){
    rnd=thanRng(P.key+'|'+(w.n++));
    for(i=0;i<30;i++){
      a=rnd()*Math.PI*2;d=C.buocMin+rnd()*(C.buocMax-C.buocMin);
      x=P.x+Math.cos(a)*d;y=P.y+Math.sin(a)*d;
      if(x<60||y<60||x>s.v.rong-60||y>s.v.cao-60)continue;
      if(thanDiDuoc(s,x,y)&&thanDuongTrong(s,P.x,P.y,x,y)){w.tx=x;w.ty=y;break;}}
    if(w.tx==null){w.wait=C.nghiMin;return;}}
  dx=w.tx-P.x;dy=w.ty-P.y;dist=Math.hypot(dx,dy);st=C.tocDo*dt;
  if(dist<=st){P.x=w.tx;P.y=w.ty;w.tx=null;w.wait=C.nghiMin+thanRng(P.key+'|n'+w.n)()*(C.nghiMax-C.nghiMin);}
  else{P.x+=dx/dist*st;P.y+=dy/dist*st;}
  s.than.x=P.x;s.than.y=P.y;}
function bossDanhXong(slug,now){var t=(now==null?Date.now():now)+CFG.boss.hoiMs;try{localStorage.setItem(bossKey(slug),String(t));}catch(e){}return t;}
function dinhDangDem(ms){var s=Math.ceil(ms/1000),m=Math.floor(s/60);s%=60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;}

/* ---------- MASK: nén / giải nén chuỗi (hàm thuần) ----------
   "WxH:b:r1,r2,r3..."  b = giá trị của đoạn đầu (0|1), mỗi đoạn kế tiếp đổi giá trị; r = độ dài đoạn (hệ 36). Tổng r phải = W*H. */
function maskEnc(g,w,h){
  var n=w*h,out=[],first=g[0]?1:0,cur=first,run=0,i,b;
  for(i=0;i<n;i++){b=g[i]?1:0;if(b===cur)run++;else{out.push(run.toString(36));cur=b;run=1;}}
  out.push(run.toString(36));
  return w+'x'+h+':'+first+':'+out.join(',');}
function maskDec(str){
  var m,w,h,n,runs,g,v,pos,i,r;
  if(!str||typeof str!=='string')return null;
  m=/^(\d+)x(\d+):([01]):([0-9a-z,]+)$/.exec(str.trim());if(!m)return null;
  w=+m[1];h=+m[2];n=w*h;if(!(w>0&&h>0&&n<=4000000))return null;
  runs=m[4].split(',');g=new Uint8Array(n);v=+m[3];pos=0;
  for(i=0;i<runs.length;i++){
    r=parseInt(runs[i],36);if(!(r>=0)||pos+r>n)return null;
    if(v&&r)g.fill(1,pos,pos+r);
    pos+=r;v^=1;}
  if(pos!==n)return null;
  return {w:w,h:h,g:g};}

/* kiểm tra bảng cấu hình, trả mảng cảnh báo (rỗng = ổn). Tự chạy 1 lần lúc nạp file. */
/* cảnh báo điểm rung/boss nằm ở ô chặn hoặc không nối liền với điểm xuất phát */
function checkToi(v,slug,dec,w){
  var W=dec.w,H=dec.h,seen=new Uint8Array(W*H),q=[],i,x,y;
  function o(p){return clamp(Math.floor(p.y/(v.cao/H)),0,H-1)*W+clamp(Math.floor(p.x/(v.rong/W)),0,W-1);}
  function them(k){if(dec.g[k]===1&&!seen[k]){seen[k]=1;q.push(k);}}
  them(o(v.xuatPhat));
  while(q.length){i=q.pop();x=i%W;y=(i-x)/W;
    if(x>0)them(i-1);if(x<W-1)them(i+1);if(y>0)them(i-W);if(y<H-1)them(i+W);}
  v.khu.forEach(function(k){(v.diem[k.id]||[]).forEach(function(p){if(!seen[o(p)])w.push(slug+' điểm '+p.id+': ở ô chặn hoặc không tới được');});});
  if(v.boss&&!seen[o(v.boss)])w.push(slug+': boss ở ô chặn hoặc không tới được');}
function checkCfg(){
  var w=[],slug,v,i,k,sum,j,d,dec;
  for(slug in VUNG){v=VUNG[slug];
    for(i=0;i<v.khu.length;i++){k=v.khu[i];sum=0;
      for(j=0;j<HIEM_KEYS.length;j++)sum+=+k.ti[HIEM_KEYS[j]]||0;
      if(Math.abs(sum-100)>0.001)w.push(slug+' khu '+k.id+': tổng tỉ lệ = '+sum+' (cần 100)');
      d=v.diem[k.id]||[];
      if(d.length<CFG.soDiemHien[1])w.push(slug+' khu '+k.id+': chỉ có '+d.length+' điểm, cần >= '+CFG.soDiemHien[1]);
      d.forEach(function(p){if(p.y<k.y0||p.y>=k.y1)w.push(slug+' điểm '+p.id+' (y='+p.y+') nằm ngoài khu '+k.id);});
      if(i&&k.y1!==v.khu[i-1].y0)w.push(slug+': khu '+k.id+' và khu '+v.khu[i-1].id+' không liền nhau');}
    if(v.boss.y>=v.khu[v.khu.length-1].y1)w.push(slug+': boss nằm ngoài khu cao nhất');
    if(v.maskData){dec=maskDec(v.maskData);
      if(!dec)w.push(slug+': maskData sai định dạng (sẽ bị bỏ qua, đi tự do)');
      else if(dec.w!==(v.maskW||192)||dec.h!==(v.maskH||128))w.push(slug+': maskData '+dec.w+'x'+dec.h+' khác maskW/maskH '+(v.maskW||192)+'x'+(v.maskH||128));
      else checkToi(v,slug,dec,w);}}
  return w;}

/* ---------- CẦU NỐI TUNG ĐỊCH ----------
   Gọi SAU KHI đã chốt độ hiếm của điểm (hoặc boss). opts: {hiem} lọc thú hoang đúng độ hiếm | {boss:true,bossId} ép boss (giữ nguyên Rank gacha E–SS, tung ở createEncounter).
   Nếu prepExplore (index.html) đã nhận opts (prep.length>=2) thì truyền thẳng; chưa thì bọc tạm createEncounter đúng trong lần gọi prep này. */
function tungDich(ev){
  var h=root.TTGTHAMHIEM,opts,orig,pre=null;
  if(!h||!h.prep)return null;
  if(ev&&ev.loai==='than'){opts={than:ev.bossId};}   /* boss Thần: 61 dựng riêng (cấp 270, V3, bậc C) */
  else if(ev&&ev.loai==='boss'){opts={boss:true};var bi=ev.bossId||(S&&S.boss&&S.boss.id);if(bi!=null)opts.bossId=bi;}
  else opts={encounter:'auto',khu:ev&&ev.khu,hiem:ev&&ev.hiem,chon:ev&&ev.chon};
  if(h.prep.length>=2)return h.prep(null,opts);
  orig=h.createEncounter;
  if(typeof orig!=='function')return h.prep(null);
  h.createEncounter=function(pl,rng,o){return orig.call(h,pl,rng,o||opts);};
  try{pre=h.prep(null);}finally{h.createEncounter=orig;}
  return pre;}

/* boss của vùng theo dữ liệu game (không bịa): thú hoang boss (vẽ THU_MOI.draw) -> boss quái (ảnh quai/<imageFile>) -> null (hình vẽ tạm) */
function findBoss(slug){
  var T=root.THU_MOI,i,j,z,t,bt=3;
  try{var cx=root.TTGBONG&&root.TTGBONG.CFG&&root.TTGBONG.CFG.tx;if(cx&&cx.bacBoss)bt=Math.max(1,Math.min(3,cx.bacBoss|0));}catch(e){}
  /* Chỉ Boss THÚ đứng riêng trên bản đồ. Boss QUÁI từ 102 chỉ có cơ hội xuất hiện ở điểm rung Khu 4. */
  try{if(T&&T.zones)for(i=0;i<T.zones.length;i++){z=T.zones[i];if(z.slug!==slug||!z.thu)continue;
    for(j=0;j<z.thu.length;j++){t=z.thu[j];if(t.boss)return {src:'demo',id:t.id,ten:t.ten,tien:bt};}}}catch(e){}
  return null;}

/* ====================================================================
   ENGINE B3-B6: canvas fullscreen, camera, nhân vật, joystick, điểm rung, HUD khu, boss, mask
   Toàn bộ vẽ/di chuyển tính theo "đơn vị map" (1536x1024); camera + zoom đổi sang pixel màn hình.
   Đồng hồ điểm rung chạy theo S.clock (cộng dồn dt trong vòng lặp) nên pause() đóng băng đúng trạng thái.
   Đồng hồ boss chạy theo giờ thực (bossConLai) như thiết kế B1.
   ==================================================================== */
var S=null;   /* phiên đang mở (null = chưa mở) */

function el(tag,css,txt){var e=D.createElement(tag);if(css)e.style.cssText=css;if(txt!=null)e.textContent=txt;return e;}
function clamp(v,a,b){return v<a?a:(v>b?b:v);}
function hexA(h,a){var n=parseInt(h.slice(1),16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';}
function fmtPct(n){return (Math.round((+n||0)*10)/10)+'%';}
function txt(c,str,x,y,size,fill){
  c.font='bold '+size+'px sans-serif';c.textAlign='center';c.textBaseline='middle';
  c.lineJoin='round';c.lineWidth=4;c.strokeStyle='rgba(0,0,0,.75)';c.strokeText(str,x,y);
  c.fillStyle=fill;c.fillText(str,x,y);}

/* ---------- MASK: nạp / va chạm / tô ---------- */
function maskCount(m){var n=0,i,g=m.g;for(i=0;i<g.length;i++)if(g[i])n++;m.n=n;return n;}
function loadMask(v,slug){
  var w=v.maskW||192,h=v.maskH||128,src=v.maskData||'',dec=null,m;
  if(!src){try{src=localStorage.getItem(MASK_KEY+slug)||'';}catch(e){src='';}}
  if(src){
    dec=maskDec(src);
    if(!dec)warn('maskData sai định dạng, bỏ qua (đi tự do)');
    else if(dec.w!==w||dec.h!==h){warn('maskData '+dec.w+'x'+dec.h+' khác lưới '+w+'x'+h+', bỏ qua');dec=null;}}
  m={w:w,h:h,g:dec?dec.g:new Uint8Array(w*h),n:0};
  maskCount(m);
  return m;}
function warn(msg){try{console.warn('[TTGMAP] '+msg);}catch(e){}}
function saveDraft(s){
  if(s.v.maskData)return;   /* đã có chuỗi cố định trong file: không ghi nháp */
  try{if(s.mask.n>0)localStorage.setItem(MASK_KEY+s.slug,maskEnc(s.mask.g,s.mask.w,s.mask.h));else localStorage.removeItem(MASK_KEY+s.slug);}catch(e){}}
/* vòng tròn đi được quanh mọi điểm rung + boss */
function buildOpen(v){
  var L=[],r=CFG.banKinhMaskDiem,k,b=v.boss,rb;
  v.khu.forEach(function(kh){(v.diem[kh.id]||[]).forEach(function(d){L.push({x:d.x,y:d.y,r2:r*r});});});
  if(b){rb=Math.max(r,b.banKinhCham);L.push({x:b.x,y:b.y,r2:rb*rb});}
  return L;}
/* đứng được tại (x,y)? Không có mask (n=0) hoặc đang Debug Mask => luôn được */
/* Mask trống: dùng hành lang đi bộ dự phòng theo đường đất của Tuyết Nguyên,
   cộng các nhánh nối tới điểm rung/Boss. Khi có maskData thật, mask luôn được ưu tiên. */
function segDist2(x,y,a,b){
  var dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,
      t=den?clamp(((x-a.x)*dx+(y-a.y)*dy)/den,0,1):0,
      px=a.x+t*dx,py=a.y+t*dy,ex=x-px,ey=y-py;
  return ex*ex+ey*ey;}
function fallbackWalkable(s,x,y){
  var path=[{x:790,y:-40},{x:800,y:150},{x:770,y:260},{x:690,y:370},
    {x:650,y:480},{x:680,y:580},{x:750,y:680},{x:830,y:780},
    {x:820,y:875},{x:760,y:1024}],i,a,b,rr=190,o,pts=[],best,proj;
  for(i=0;i<path.length-1;i++)if(segDist2(x,y,path[i],path[i+1])<=rr*rr)return true;
  /* Nhánh nối từ đường chính tới từng điểm rung/Boss. */
  for(i=0;i<s.v.khu.length;i++){
    var list=s.v.diem[s.v.khu[i].id]||[];
    for(var j=0;j<list.length;j++)pts.push(list[j]);}
  if(s.v.boss)pts.push(s.v.boss);
  for(i=0;i<pts.length;i++){
    o=pts[i];best=Infinity;proj=null;
    for(var q=0;q<path.length-1;q++){
      a=path[q];b=path[q+1];
      var dx=b.x-a.x,dy=b.y-a.y,den=dx*dx+dy*dy,
          t=den?clamp(((o.x-a.x)*dx+(o.y-a.y)*dy)/den,0,1):0,
          px=a.x+t*dx,py=a.y+t*dy,d2=(o.x-px)*(o.x-px)+(o.y-py)*(o.y-py);
      if(d2<best){best=d2;proj={x:px,y:py};}}
    if(proj&&segDist2(x,y,proj,o)<=76*76)return true;}
  return false;}
function canStand(s,x,y){
  var m=s.mask,v=s.v,i,o,dx,dy,gx,gy;
  if(s.dbg)return true;
  for(i=0;i<s.open.length;i++){o=s.open[i];dx=x-o.x;dy=y-o.y;if(dx*dx+dy*dy<=o.r2)return true;}
  if(m.n<=0)return fallbackWalkable(s,x,y);
  gx=clamp(Math.floor(x/(v.rong/m.w)),0,m.w-1);gy=clamp(Math.floor(y/(v.cao/m.h)),0,m.h-1);
  return m.g[gy*m.w+gx]===1;}
/* tô/tẩy 1 dấu cọ tại toạ độ map */
function stamp(s,wx,wy){
  var m=s.mask,cw=s.v.rong/m.w,chh=s.v.cao/m.h,cx=wx/cw,cy=wy/chh,r=BRUSH[s.bi],r2=r*r,val=s.tool==='paint'?1:0,
      x0=Math.max(0,Math.floor(cx-r)),x1=Math.min(m.w-1,Math.ceil(cx+r)),y0=Math.max(0,Math.floor(cy-r)),y1=Math.min(m.h-1,Math.ceil(cy+r)),
      gx,gy,dx,dy,k,ch=false;
  for(gy=y0;gy<=y1;gy++)for(gx=x0;gx<=x1;gx++){
    dx=gx+0.5-cx;dy=gy+0.5-cy;
    if(dx*dx+dy*dy<=r2){k=gy*m.w+gx;if(m.g[k]!==val){m.g[k]=val;m.n+=val?1:-1;ch=true;}}}
  if(ch)s.maskDirty=true;}
function strokeTo(s,x,y){
  var l=s.last2,dx,dy,d,st,n,i;
  if(!l)stamp(s,x,y);
  else{dx=x-l.x;dy=y-l.y;d=Math.sqrt(dx*dx+dy*dy);st=Math.max(2,s.v.rong/s.mask.w/2);n=Math.max(1,Math.ceil(d/st));
    for(i=1;i<=n;i++)stamp(s,l.x+dx*i/n,l.y+dy*i/n);}
  s.last2={x:x,y:y};}
function worldAt(s,e){var r=s.cv.getBoundingClientRect();return {x:s.cam.x+(e.clientX-r.left)/s.zoom,y:s.cam.y+(e.clientY-r.top)/s.zoom};}

/* ---------- Debug Mask (UI) ---------- */
var BTN='padding:7px 11px;border-radius:10px;border:1px solid rgba(255,255,255,.35);background:rgba(8,16,28,.78);color:#fff;font-size:13px;font-weight:bold;cursor:pointer;touch-action:manipulation;font-family:sans-serif';
var BG_OFF='rgba(8,16,28,.78)',BG_ON='rgba(40,160,90,.9)';
function note(s,msg){
  var h=s.hud;while(h.firstChild)h.removeChild(h.firstChild);
  h.appendChild(el('div','font-size:14px;font-weight:bold',msg));h.style.opacity='1';
  clearTimeout(s.hudTimer);s.hudTimer=setTimeout(function(){if(S===s)h.style.opacity='0';},2600);}
function refreshDbg(s){
  var m=s.mask;
  if(s.bPaint)s.bPaint.style.background=s.tool==='paint'?BG_ON:BG_OFF;
  if(s.bErase)s.bErase.style.background=s.tool==='erase'?BG_ON:BG_OFF;
  if(s.bBrush)s.bBrush.textContent='Cọ '+(s.bi+1)+'/'+BRUSH.length;
  if(s.dbgInfo)s.dbgInfo.textContent='Đi được: '+m.n+'/'+(m.w*m.h)+' ô'+(m.n?'':' · rỗng = đi tự do')+' · đang Debug thì đi xuyên';}
function setDbg(s,on){
  on=!!on;s.dbg=on;CFG.debugMask=on;s.pid=null;s.last2=null;s.cursor=null;
  if(s.dbgPanel)s.dbgPanel.style.display=on?'flex':'none';
  if(s.dbgBtn)s.dbgBtn.style.background=on?BG_ON:BG_OFF;
  if(!on)saveDraft(s);
  refreshDbg(s);}
function copyText(t,cb){
  function fb(){var ok=false,ta=D.createElement('textarea');
    ta.value=t;ta.style.cssText='position:fixed;left:-9999px;top:0;opacity:0';D.body.appendChild(ta);ta.select();
    try{ok=D.execCommand('copy');}catch(e){ok=false;}
    D.body.removeChild(ta);cb(ok);}
  try{if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){cb(true);},fb);return;}}catch(e){}
  fb();}
function copyMask(){
  var s=S,str;if(!s)return null;
  str=maskEnc(s.mask.g,s.mask.w,s.mask.h);
  try{console.log('[TTGMAP] maskData (dán vào VUNG[\''+s.slug+'\'].maskData):\n'+str);}catch(e){}
  copyText(str,function(ok){if(S===s)note(s,ok?('Đã copy mask · '+str.length+' ký tự'+(s.mask.n?'':' (đang rỗng)')):'Không copy được, xem console (F12)');});
  return str;}
function clearMask(s){
  var ok=true;try{ok=root.confirm('Xoá toàn bộ mask đã tô?');}catch(e){}
  if(!ok)return;
  s.mask.g.fill(0);s.mask.n=0;s.maskDirty=true;saveDraft(s);refreshDbg(s);}

/* ---------- DOM ---------- */
function buildDom(s){
  var root_=el('div','position:fixed;left:0;top:0;right:0;bottom:0;z-index:'+CFG.zIndex+';background:#0a1018;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;font-family:sans-serif');
  var cv=el('canvas','position:absolute;left:0;top:0;width:100%;height:100%;display:block');
  var load=el('div','position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;color:#cfe6ff;font-size:16px;pointer-events:none','Đang tải bản đồ…');
  var hud=el('div','position:absolute;left:50%;top:max(10px,env(safe-area-inset-top));transform:translateX(-50%);max-width:92%;text-align:center;pointer-events:none;background:rgba(8,16,28,.72);border:1px solid rgba(255,255,255,.18);border-radius:12px;padding:6px 12px;color:#fff;opacity:0;transition:opacity .35s');
  /* NÚT QUAY LẠI (thay nút Dừng cũ): khung vàng-đỏ (khung-nut-do.webp = khung-nut.webp đã đổi xanh đêm sang đỏ, giữ viền vàng) + mũi tên cong phát sáng đỏ + chữ vàng bên dưới. Bấm = stopReq() (về sảnh, như Dừng/Esc cũ). Chỉnh cỡ ở BACK_S. */
  var BACK_S=58;
  var stop=el('button','position:absolute;right:max(12px,env(safe-area-inset-right));top:max(8px,env(safe-area-inset-top));width:'+BACK_S+'px;padding:0;border:0;background:none;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;display:flex;flex-direction:column;align-items:center;gap:1px;outline:none;transition:transform .08s,filter .12s;filter:drop-shadow(0 3px 5px rgba(0,0,0,.55))');
  stop.setAttribute('aria-label','Quay lại');
  var bw=el('div','position:relative;width:'+BACK_S+'px;height:'+BACK_S+'px');
  bw.appendChild(el('div','position:absolute;left:15%;top:15%;right:15%;bottom:15%;border-radius:9px;background:radial-gradient(circle at 50% 40%,#8a1a22 0%,#4a0a14 62%,#25050c 100%)'));
  var bfr=el('div','position:absolute;left:0;top:0;width:100%;height:100%;background:url(game-moi/khung-nut-do.webp?v=1) center/100% 100% no-repeat;pointer-events:none');
  var bic=el('div','position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;pointer-events:none');
  bic.innerHTML='<svg viewBox="0 0 64 64" width="'+Math.round(BACK_S*.5)+'" height="'+Math.round(BACK_S*.5)+'" style="filter:drop-shadow(0 0 4px #ff5a4a) drop-shadow(0 0 9px rgba(255,90,70,.75))"><defs><linearGradient id="ttgBackG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset=".55" stop-color="#ffb3a0"/><stop offset="1" stop-color="#ffd86a"/></linearGradient></defs><path d="M27 13 8 31l19 18V38h13c8 0 13 4 16 12 1-15-7-26-20-26H27z" fill="url(#ttgBackG)" stroke="#5a0c14" stroke-width="3" stroke-linejoin="round"/></svg>';
  bw.appendChild(bic);bw.appendChild(bfr);stop.appendChild(bw);
  stop.appendChild(el('div','font:bold 11px/1.1 \'Noto Serif\',Georgia,serif;color:#ffe9a8;letter-spacing:.2px;text-shadow:0 0 3px #000,0 1px 2px #000,0 0 7px rgba(255,200,80,.5);white-space:nowrap;pointer-events:none','Quay lại'));
  stop.addEventListener('pointerdown',function(){stop.style.transform='scale(.92)';stop.style.filter='brightness(1.25) drop-shadow(0 2px 3px rgba(0,0,0,.6))';});
  ['pointerup','pointerleave','pointercancel'].forEach(function(n){stop.addEventListener(n,function(){stop.style.transform='';stop.style.filter='drop-shadow(0 3px 5px rgba(0,0,0,.55))';});});
  var rot=el('div','position:absolute;left:0;right:0;bottom:max(150px,calc(env(safe-area-inset-bottom) + 150px));display:none;justify-content:center;pointer-events:none');
  rot.appendChild(el('div','background:rgba(8,16,28,.8);color:#ffd45c;font-size:13px;padding:6px 12px;border-radius:999px','↻ Xoay ngang màn hình để chơi'));
  var jb=el('div','position:absolute;left:18px;top:18px;width:152px;height:152px;opacity:0;pointer-events:none;border-radius:50%;background:rgba(10,22,38,.34);border:2px solid rgba(225,242,255,.42);box-shadow:0 4px 22px rgba(0,0,0,.24);touch-action:none;transition:opacity .08s');
  var kn=el('div','position:absolute;left:50%;top:50%;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid rgba(255,255,255,.85);pointer-events:none');
  jb.appendChild(kn);
  root_.appendChild(cv);root_.appendChild(hud);root_.appendChild(load);root_.appendChild(rot);root_.appendChild(jb);root_.appendChild(stop);
  D.body.appendChild(root_);
  s.root=root_;s.cv=cv;s.ctx=cv.getContext('2d');s.load=load;s.hud=hud;s.rot=rot;s.joyBase=jb;s.joyKnob=kn;
  stop.addEventListener('click',function(e){e.preventDefault();stopReq();});
  /* tô mask bằng ngón tay/chuột trực tiếp trên canvas (chỉ khi Debug Mask bật) */
  cv.addEventListener('pointerdown',function(e){
    var s2=S,w;if(!s2||!s2.dbg||s2.paused||s2.pid!==null)return;
    s2.pid=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(_){}
    s2.last2=null;w=worldAt(s2,e);s2.cursor=w;strokeTo(s2,w.x,w.y);e.preventDefault();});
  cv.addEventListener('pointermove',function(e){
    var s2=S,w;if(!s2||!s2.dbg||s2.paused)return;
    w=worldAt(s2,e);
    if(e.pointerId===s2.pid){s2.cursor=w;strokeTo(s2,w.x,w.y);e.preventDefault();}
    else if(e.pointerType==='mouse')s2.cursor=w;});
  function endStroke(e){
    var s2=S;if(!s2||e.pointerId!==s2.pid)return;
    s2.pid=null;s2.last2=null;if(e.pointerType!=='mouse')s2.cursor=null;saveDraft(s2);}
  cv.addEventListener('pointerup',endStroke);
  cv.addEventListener('pointercancel',endStroke);
  /* Joystick kiểu MOBA: chạm bất kỳ đâu ở nửa trái màn hình để gọi cần analog nổi. */
  cv.addEventListener('pointerdown',function(e){
    var s2=S,big,r,px,py;
    if(!s2||s2.dbg||s2.paused||s2.joy.id!==null||e.clientX>window.innerWidth*0.62)return;
    if(e.pointerType==='mouse'&&e.button!==0)return;
    s2.joy.id=e.pointerId;
    big=s2.joyBase.offsetWidth||CFG.joystick.kinhNho;
    r=big/2;px=clamp(e.clientX,r+4,window.innerWidth-r-4);py=clamp(e.clientY,r+4,window.innerHeight-r-4);
    s2.joy.cx=px;s2.joy.cy=py;
    s2.joyBase.style.left=(px-r)+'px';s2.joyBase.style.top=(py-r)+'px';
    s2.joyBase.style.opacity='1';
    try{cv.setPointerCapture(e.pointerId);}catch(_){}
    joyMove(e);e.preventDefault();});
  cv.addEventListener('pointermove',function(e){if(S&&e.pointerId===S.joy.id){joyMove(e);e.preventDefault();}});
  cv.addEventListener('pointerup',joyEnd);
  cv.addEventListener('pointercancel',joyEnd);
}
function joyMove(e){
  var s=S,R=s.joyBase.offsetWidth/2,travel=R*CFG.joystick.hanhTrinh,
      dx=e.clientX-s.joy.cx,dy=e.clientY-s.joy.cy,len=Math.sqrt(dx*dx+dy*dy);
  if(len>travel&&len>0){dx*=travel/len;dy*=travel/len;}
  s.joy.x=travel?dx/travel:0;s.joy.y=travel?dy/travel:0;
  s.joyKnob.style.transform='translate('+dx+'px,'+dy+'px)';}
function joyEnd(e){
  var s=S;if(!s)return;
  if(e&&e.pointerId!==s.joy.id)return;
  joyReset(s);}
function joyReset(s){
  s.joy.id=null;s.joy.x=0;s.joy.y=0;
  if(s.joyKnob)s.joyKnob.style.transform='translate(0px,0px)';
  if(s.joyBase)s.joyBase.style.opacity='0';}

function fit(){
  var s=S;if(!s)return;
  var w=window.innerWidth,h=window.innerHeight,d=Math.min(2,window.devicePixelRatio||1),big,ks;
  s.vw=w;s.vh=h;s.dpr=d;
  s.cv.width=Math.round(w*d);s.cv.height=Math.round(h*d);
  big=Math.min(w,h)<420?CFG.joystick.kinhNho:CFG.joystick.kinh;ks=Math.round(big*0.42);
  s.joyBase.style.width=big+'px';s.joyBase.style.height=big+'px';
  s.joyKnob.style.width=ks+'px';s.joyKnob.style.height=ks+'px';
  s.joyKnob.style.marginLeft=(-ks/2-2)+'px';s.joyKnob.style.marginTop=(-ks/2-2)+'px';
  s.rot.style.display=h>w?'flex':'none';
  if(s.ready)draw(s);}

/* ---------- INPUT ---------- */
function onKeyDown(e){
  var s=S;if(!s)return;
  var c=e.code;
  if(c==='Escape'){e.preventDefault();stopReq();return;}
  if(c==='KeyW'||c==='KeyA'||c==='KeyS'||c==='KeyD'||c==='ArrowUp'||c==='ArrowDown'||c==='ArrowLeft'||c==='ArrowRight'){
    s.keys[c]=true;e.preventDefault();}}
function onKeyUp(e){var s=S;if(!s)return;if(s.keys[e.code]){s.keys[e.code]=false;e.preventDefault();}}
function onBlur(){if(S)S.keys={};}
function bindKeys(){window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp);window.addEventListener('blur',onBlur);}
function unbindKeys(){window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('blur',onBlur);}
function stopReq(){
  var s=S;if(!s)return;
  var h=s.host;
  if(h&&typeof h.onStop==='function'){try{h.onStop();}catch(e){try{console.error('[TTGMAP] onStop lỗi',e);}catch(_){}close();}}
  else close();}
function readInput(s){
  var k=s.keys,x=0,y=0,j=s.joy,m,jm;
  if(k.KeyA||k.ArrowLeft)x-=1;
  if(k.KeyD||k.ArrowRight)x+=1;
  if(k.KeyW||k.ArrowUp)y-=1;
  if(k.KeyS||k.ArrowDown)y+=1;
  m=Math.sqrt(x*x+y*y);if(m>1){x/=m;y/=m;}
  jm=Math.sqrt(j.x*j.x+j.y*j.y);
  if(jm>0.12){x=j.x;y=j.y;}
  return {x:x,y:y};}

/* ---------- ĐIỂM RUNG (B4) ---------- */
function visCount(g){var n=0;g.pts.forEach(function(p){if(p.on)n++;});return n;}
function spawnSpots(s,g,jit){
  var n=visCount(g),rd,p;
  while(n<g.target){
    rd=g.pts.filter(function(q){
      if(q.on||s.clock<q.hoiAt)return false;
      if(s.p&&Math.pow(q.x-s.p.x,2)+Math.pow(q.y-s.p.y,2)<CFG.cachNguoi*CFG.cachNguoi)return false;
      return !s.groups.some(function(h){return h.pts.some(function(o){return o.on&&Math.pow(q.x-o.x,2)+Math.pow(q.y-o.y,2)<CFG.cachNhau*CFG.cachNhau;});});});
    if(!rd.length)break;
    p=rd[Math.floor(Math.random()*rd.length)];
    p.on=true;p.hiem=tungHiem(g.k);p.chon=null;p.thuLai=0;p.fade=0;p.x=p.nx;p.y=p.ny;p.hop=null;p.z=0;p.conCu=0;p.choChay=0;p.nghiToi=s.clock+rnd(300,1800);p.until=s.clock+CFG.rung;n++;}}
function buildSpots(s){
  var v=s.v;
  s.groups=v.khu.map(function(k){
    return {k:k,target:soDiemCan(),pts:(v.diem[k.id]||[]).map(function(d){
      return {id:d.id,x:d.x,y:d.y,nx:d.x,ny:d.y,khu:k.id,on:false,hoiAt:0,until:0,hiem:'thuong',ph:Math.random()*6.283};})};});
  s.groups.forEach(function(g){spawnSpots(s,g,true);});}
function tatSpot(s,p){p.on=false;p.hop=null;p.z=0;p.x=p.nx;p.y=p.ny;p.hoiAt=s.clock+CFG.hoi;}
function tickSpots(s){
  s.groups.forEach(function(g){
    g.pts.forEach(function(p){
      if(!p.on||s.clock<p.until)return;
      tatSpot(s,p);g.target=soDiemCan();});   /* hết 1 phút -> biến mất, chỗ đó hồi sau CFG.hoi */
    spawnSpots(s,g,false);});}

/* ---------- THÚ NHẢY QUANH CHỖ NÚP ---------- */
/* thú đặt chân được ở (x,y)? ô đi được (chừa 1 ô quanh), đúng khu, ngoài vùng cấm, không dồn vào con khác / boss */
function choNhay(s,sp,k,x,y){
  var m=s.mask,v=s.v,cw=v.rong/m.w,ch=v.cao/m.h,i,q,o=[[0,0],[1,0],[-1,0],[0,1],[0,-1]],gx,gy,b=v.boss;
  if(y<k.y0||y>=k.y1)return false;
  if(m.n>0)for(i=0;i<o.length;i++){gx=Math.floor(x/cw)+o[i][0];gy=Math.floor(y/ch)+o[i][1];
    if(gx<0||gy<0||gx>=m.w||gy>=m.h||m.g[gy*m.w+gx]!==1)return false;}
  if((v.camNhay||[]).some(function(r){return x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];}))return false;
  if(b&&Math.pow(x-b.x,2)+Math.pow(y-b.y,2)<70*70)return false;
  return !s.groups.some(function(g){return g.pts.some(function(q){return q!==sp&&q.on&&Math.pow(x-q.x,2)+Math.pow(y-q.y,2)<60*60;});});}
/* tìm 1 cú nhảy theo hướng goc (lệch dần nếu vướng) */
function timCu(s,sp,k,goc,buoc,xaNha){
  var lech=[0,0.5,-0.5,1,-1,1.5,-1.5],i,a,x,y,d0=Math.hypot(sp.x-sp.nx,sp.y-sp.ny),d;
  for(i=0;i<lech.length;i++){
    a=goc+lech[i];x=sp.x+Math.cos(a)*buoc;y=sp.y+Math.sin(a)*buoc*0.8;d=Math.hypot(x-sp.nx,y-sp.ny);
    if(d>xaNha&&d>=d0)continue;   /* ngoài tầm thì chỉ được nhảy về gần chỗ núp */
    if(choNhay(s,sp,k,x,y)&&choNhay(s,sp,k,(sp.x+x)/2,(sp.y+y)/2))return {x:x,y:y};}
  return null;}
function nhaySpots(s,dt){
  var C=CFG.chay;
  s.groups.forEach(function(g){
    var N=CFG.nhay[g.k.id]||CFG.nhay[1];
    g.pts.forEach(function(sp){
      var h=sp.hop,r,dx,dy,dich,chay=false,goc,d,quai=!!(sp.chon&&sp.chon.source==='main'),M=quai?CFG.nhao:C,buoc;
      if(!sp.on)return;
      if(h){
        h.p=Math.min(1,h.p+dt/h.tg);
        sp.x=h.x0+(h.x1-h.x0)*h.p;sp.y=h.y0+(h.y1-h.y0)*h.p;sp.z=Math.sin(h.p*Math.PI)*CFG.nhay.cao;
        if(h.p>=1){sp.hop=null;sp.z=0;sp.dapDat=s.clock;
          sp.nghiToi=s.clock+(sp.conCu>0?40:rnd(N.nghi[0],N.nghi[1])*1000);}
        return;}
      dx=sp.x-s.p.x;dy=sp.y-s.p.y;
      if(sp.chon&&(quai||C.loai.indexOf(sp.hiem)>=0)&&!sp.conCu&&s.clock>=sp.choChay&&s.clock>=s.coolUntil&&dx*dx+dy*dy<M.gan*M.gan){
        sp.conCu=M.soCu;sp.choChay=s.clock+M.cho*1000;sp.nghiToi=s.clock;}
      if(s.clock<sp.nghiToi)return;
      if(sp.conCu>0){chay=true;sp.conCu--;goc=quai?Math.atan2(-dy,-dx)+rnd(-0.15,0.15):Math.atan2(dy,dx)+rnd(-0.3,0.3);}   /* quái lao tới, thú chạy ra xa */
      else{
        d=Math.hypot(sp.x-sp.nx,sp.y-sp.ny);
        goc=d>N.banKinh?Math.atan2(sp.ny-sp.y,sp.nx-sp.x)+rnd(-0.4,0.4):rnd(0,6.2832);}
      buoc=chay?(quai?Math.min(M.buoc,Math.hypot(dx,dy)):M.buoc):N.buoc;
      dich=timCu(s,sp,g.k,goc,buoc,chay?M.xaNha:N.banKinh);
      if(!dich){sp.conCu=0;sp.nghiToi=s.clock+700;return;}
      sp.hop={x0:sp.x,y0:sp.y,x1:dich.x,y1:dich.y,p:0,tg:chay?C.tg:N.tg};});});}

/* ---------- HUD KHU (B4) ---------- */
function showHud(s,k){
  var h=s.hud,row;
  while(h.firstChild)h.removeChild(h.firstChild);
  h.appendChild(el('div','font-size:17px;font-weight:bold;margin-bottom:3px',k.ten));
  row=el('div','');
  HIEM_KEYS.forEach(function(key){
    row.appendChild(el('span','display:inline-block;margin:2px 3px;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid '+HIEM[key].mau+';color:'+HIEM[key].mau,HIEM[key].ten+' '+fmtPct(k.ti[key])));});
  h.appendChild(row);
  h.style.opacity='1';
  clearTimeout(s.hudTimer);
  s.hudTimer=setTimeout(function(){if(S===s)h.style.opacity='0';},4500);}

/* ---------- CẬP NHẬT ---------- */
function clampCam(val,view,size){return size<=view?(size-view)/2:clamp(val,0,size-view);}
function snapCam(s){
  var z=s.zoom;
  s.cam.x=clampCam(s.p.x-s.vw/z/2,s.vw/z,s.v.rong);
  s.cam.y=clampCam(s.p.y-s.vh/z/2,s.vh/z,s.v.cao);}
function update(s,dt){
  var v=s.v,p=s.p,z=s.zoom,inp,len,k,i,g,j,sp,dx,dy,r,b,nx,ny,ox,oy,here;
  s.clock+=dt*1000;
  /* di chuyển (có va chạm mask: trượt dọc tường; đang kẹt trong ô chặn thì cho đi tự do để thoát) */
  inp=readInput(s);len=Math.sqrt(inp.x*inp.x+inp.y*inp.y);
  p.moving=false;
  if(len>0.05){
    ox=p.x;oy=p.y;
    nx=clamp(p.x+inp.x*CFG.nhanVat.toc*dt,0,v.rong);
    ny=clamp(p.y+inp.y*CFG.nhanVat.toc*dt,0,v.cao);
    here=canStand(s,p.x,p.y);
    if(!here||canStand(s,nx,p.y))p.x=nx;
    if(!here||canStand(s,p.x,ny))p.y=ny;
    p.moving=(p.x!==ox||p.y!==oy);
    if(inp.x<-0.05)p.face=-1;else if(inp.x>0.05)p.face=1;
    p.dir=(Math.abs(inp.y)>0.05&&Math.abs(inp.y)>Math.abs(inp.x)*1.2)?(inp.y>0?'truoc':'sau'):'phai';}   /* đi xuống rõ rệt = chính diện, đi lên rõ rệt = quay lưng; còn lại = ngang */
  if(p.moving)p.walk+=dt*12;else p.walk=0;
  /* camera bám nhân vật, kẹp trong biên map */
  s.cam.x+=(clampCam(p.x-s.vw/z/2,s.vw/z,v.rong)-s.cam.x)*Math.min(1,dt*9);
  s.cam.y+=(clampCam(p.y-s.vh/z/2,s.vh/z,v.cao)-s.cam.y)*Math.min(1,dt*9);
  s.cam.x=clampCam(s.cam.x,s.vw/z,v.rong);s.cam.y=clampCam(s.cam.y,s.vh/z,v.cao);
  /* bước vào khu mới -> HUD */
  k=khuTai(v,p.y);
  if(k&&k.id!==s.khuId){s.khuId=k.id;showHud(s,k);}
  /* điểm rung */
  tickSpots(s);
  try{nhaySpots(s,dt);}catch(eN){}
  /* đồng hồ boss (đọc localStorage mỗi ~250ms) */
  if(s.bossT<0||s.clock-s.bossT>=250){s.bossT=s.clock;s.bossMs=bossConLai(s.slug);}
  if(s.thanT<0||s.clock-s.thanT>=250){s.thanT=s.clock;thanLamMoi(s);}   /* boss Thần: đọc trạng thái thế giới */
  try{thanDi(s,dt);}catch(eT){}   /* boss Thần đi lang thang */
  /* chạm (không trong cooldown; không chạm khi đang tô mask) */
  if(s.clock<s.coolUntil||s.dbg)return;
  r=CFG.banKinhCham;
  for(i=0;i<s.groups.length;i++){
    g=s.groups[i];
    for(j=0;j<g.pts.length;j++){
      sp=g.pts[j];if(!sp.on)continue;
      dx=p.x-sp.x;dy=p.y-sp.y;
      if(dx*dx+dy*dy<=r*r){fireTouch(s,{loai:'diem',chon:sp.chon||null,hiem:sp.hiem,khu:sp.khu,diemId:sp.id});return;}}}
  if(s.than&&s.than.hien&&s.than.khoa===0){   /* chạm boss Thần (ẩn khi có người đánh, không chạm khi đang bị khóa) */
    dx=p.x-s.than.x;dy=p.y-s.than.y;
    if(dx*dx+dy*dy<=s.than.r*s.than.r){fireTouch(s,{loai:'than',khu:4,bossId:s.than.loai});return;}}
  b=v.boss;
  if(b&&s.bossMs===0){
    dx=p.x-b.x;dy=p.y-b.y;
    if(dx*dx+dy*dy<=b.banKinhCham*b.banKinhCham){fireTouch(s,{loai:'boss',khu:4,bossId:s.boss?s.boss.id:undefined});return;}}}
function fireTouch(s,ev){
  s.coolUntil=s.clock+CFG.cooldownSauTran;   /* chống gọi lặp nếu host chưa kịp pause() */
  var h=s.host;
  if(h&&typeof h.onTouch==='function'){try{h.onTouch(ev);}catch(e){try{console.error('[TTGMAP] onTouch lỗi',e);}catch(_){}}}}

/* ---------- VẼ ---------- */
function ellipse(c,x,y,rx,ry,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.2832);c.fill();}
/* ---------- DẤU HIỆU MÔI TRƯỜNG + BÓNG THÚ (thay vòng tròn hình thoi) ----------
   Xa: chỉ có dấu hiệu theo vùng (VUNG[...].dauHieu). Gần dần (CFG.hienThu): bóng đen -> thú thật + hào quang màu độ hiếm dưới chân.
   Thú được tung sẵn (chonThu) rồi ép đúng con đó vào trận qua ev.chon -> opts.chon của createEncounter. */
var DAUHIEU={
  /* tia chớp tím giật + tia lửa điện */
  loi:function(c,t,ph){
    var i,x,y,k,j;
    k=Math.sin(t*5+ph)>0.55?1:0.45;
    c.lineCap='round';c.lineJoin='round';
    for(j=0;j<2;j++){c.strokeStyle=j?'rgba(255,245,200,'+k+')':'rgba(170,90,255,'+(0.5*k)+')';c.lineWidth=j?1.6:4;
      c.beginPath();c.moveTo(-3,-34);c.lineTo(4,-24);c.lineTo(-4,-18);c.lineTo(5,-8);c.lineTo(-2,-1);c.stroke();}
    for(i=0;i<4;i++){x=(i-1.5)*11+Math.sin(t*3+i*1.9+ph)*4;y=-6-((t*0.8+ph*0.3+i*0.25)%1)*22;
      c.fillStyle='rgba(200,150,255,'+(0.5+0.4*Math.sin(t*6+i))+')';c.beginPath();c.arc(x,y,2,0,6.2832);c.fill();}},
  /* đốm sáng nấm tím nhấp nháy + vài sợi sương mỏng */
  suong:function(c,t,ph){
    var i,x,y,k,r,w;
    c.lineCap='round';
    for(i=0;i<3;i++){w=Math.sin(t*1.1+ph+i*2.1)*7;y=-4-i*9;
      c.strokeStyle='rgba(225,238,245,'+(0.5-i*0.1)+')';c.lineWidth=4-i;
      c.beginPath();c.moveTo(-22+w,y);c.quadraticCurveTo(-8+w,y-7,4+w,y);c.quadraticCurveTo(14+w,y+6,23+w,y-1);c.stroke();}
    for(i=0;i<4;i++){k=0.5+0.5*Math.sin(t*3+ph+i*1.7);x=(i-1.5)*11+Math.sin(t*1.6+i)*3;y=-10-(i%2)*17-Math.sin(t*2+ph+i)*3;r=2.2+k*1.8;
      c.fillStyle='rgba(186,110,255,'+(0.18+0.27*k)+')';c.beginPath();c.arc(x,y,r*2.6,0,6.2832);c.fill();
      c.fillStyle='rgba(240,215,255,'+(0.55+0.45*k)+')';c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();}},
  /* đom đóm trăng xanh nhạt + cánh hoa hồng rơi chậm */
  nguyet:function(c,t,ph){
    var i,x,y,k,r;
    for(i=0;i<4;i++){k=0.5+0.5*Math.sin(t*2.4+ph+i*1.9);x=(i-1.5)*11+Math.sin(t*1.3+i+ph)*4;y=-8-(i%2)*15-Math.sin(t*1.8+ph+i)*3;r=2+k*1.6;
      c.fillStyle='rgba(150,225,255,'+(0.18+0.25*k)+')';c.beginPath();c.arc(x,y,r*2.6,0,6.2832);c.fill();
      c.fillStyle='rgba(235,250,255,'+(0.55+0.45*k)+')';c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();}
    for(i=0;i<3;i++){k=((t*0.35+ph*0.1+i*0.33)%1);x=(i-1)*13+Math.sin(t*1.5+i*2+ph)*5;y=-30+k*28;
      c.save();c.translate(x,y);c.rotate(t*1.2+i);c.globalAlpha*=Math.sin(k*3.1416)*0.9;
      c.fillStyle='rgba(255,170,210,1)';c.beginPath();c.ellipse(0,0,4.2,2.2,0,0,6.2832);c.fill();c.restore();}},
  /* mây trôi xoáy nhẹ + cánh hoa tím bay lên */
  van:function(c,t,ph){
    var i,x,y,k,w;
    for(i=0;i<3;i++){w=Math.sin(t*0.9+ph+i*2.2)*6;x=(i-1)*13+w;y=-6-(i%2)*8;
      c.fillStyle='rgba(245,235,255,'+(0.45-i*0.08)+')';
      c.beginPath();c.ellipse(x,y,13-i*2,5.5-i,0,0,6.2832);c.fill();
      c.beginPath();c.ellipse(x+6,y-3,7,4,0,0,6.2832);c.fill();}
    for(i=0;i<4;i++){k=((t*0.45+ph*0.3+i*0.25)%1);x=(i-1.5)*10+Math.sin(t*2+i*1.9+ph)*5;y=-6-k*30;
      c.save();c.translate(x,y);c.rotate(t*2+i);c.globalAlpha*=1-k;
      c.fillStyle='rgba(225,120,255,.9)';c.beginPath();c.ellipse(0,0,3.4,1.8,0,0,6.2832);c.fill();c.restore();}},
  /* gió xoáy mảnh + lá đỏ cam bay lượn */
  phong:function(c,t,ph){
    var i,x,y,k,a;
    c.lineCap='round';
    for(i=0;i<3;i++){a=t*2.2+ph+i*2.094;y=-6-i*8;
      c.strokeStyle='rgba(220,250,240,'+(0.7-i*0.15)+')';c.lineWidth=2.4-i*0.3;
      c.beginPath();c.ellipse(0,y,13+i*3,4.5,0,a,a+3.2);c.stroke();}
    for(i=0;i<4;i++){k=((t*0.5+ph*0.3+i*0.25)%1);x=(i-1.5)*10+Math.sin(t*3+i*1.7+ph)*6;y=-6-k*28;
      c.save();c.translate(x,y);c.rotate(t*3+i*1.3);c.globalAlpha*=1-k;
      c.fillStyle=i%2?'#e0742c':'#c9442a';c.beginPath();c.ellipse(0,0,3.8,2,0,0,6.2832);c.fill();c.restore();}},
  /* gợn sóng nước xanh + cánh sen/giọt sáng bay lên */
  thuy:function(c,t,ph){
    var i,x,y,k,r;
    c.lineWidth=1.8;
    for(i=0;i<3;i++){k=((t*0.5+ph*0.2+i*0.33)%1);r=6+k*20;
      c.strokeStyle='rgba(150,225,255,'+(0.75*(1-k))+')';c.beginPath();c.ellipse(0,-3,r,r*0.38,0,0,6.2832);c.stroke();}
    for(i=0;i<4;i++){k=((t*0.4+ph*0.3+i*0.25)%1);x=(i-1.5)*10+Math.sin(t*2+i*1.9+ph)*4;y=-6-k*30;
      c.fillStyle='rgba(190,240,255,'+(0.9*(1-k))+')';c.beginPath();c.arc(x,y,2.2,0,6.2832);c.fill();
      c.fillStyle='rgba(120,190,255,'+(0.3*(1-k))+')';c.beginPath();c.arc(x,y,5,0,6.2832);c.fill();}},
  /* tàn lửa bay lên + khói nóng */
  hoa:function(c,t,ph){
    var i,x,y,k,w;
    for(i=0;i<2;i++){w=Math.sin(t*1.4+ph+i*2)*5;y=-10-i*12;
      c.fillStyle='rgba(70,40,40,'+(0.35-i*0.1)+')';c.beginPath();c.ellipse(w,y,12-i*2,5,0,0,6.2832);c.fill();}
    for(i=0;i<5;i++){k=((t*0.6+ph*0.3+i*0.2)%1);x=(i-2)*8+Math.sin(t*3+i*1.7+ph)*5;y=-4-k*34;
      c.fillStyle=i%2?'rgba(255,200,70,'+(1-k)+')':'rgba(255,110,40,'+(1-k)+')';c.beginPath();c.arc(x,y,2.4*(1-k*0.5),0,6.2832);c.fill();}},
  /* đom đóm xanh lục + lá xanh rơi */
  lam:function(c,t,ph){
    var i,x,y,k,r;
    for(i=0;i<4;i++){k=0.5+0.5*Math.sin(t*2.6+ph+i*1.9);x=(i-1.5)*11+Math.sin(t*1.3+i+ph)*4;y=-8-(i%2)*15-Math.sin(t*1.8+ph+i)*3;r=2+k*1.6;
      c.fillStyle='rgba(190,255,120,'+(0.18+0.25*k)+')';c.beginPath();c.arc(x,y,r*2.6,0,6.2832);c.fill();
      c.fillStyle='rgba(245,255,200,'+(0.55+0.45*k)+')';c.beginPath();c.arc(x,y,r,0,6.2832);c.fill();}
    for(i=0;i<3;i++){k=((t*0.35+ph*0.1+i*0.33)%1);x=(i-1)*13+Math.sin(t*1.5+i*2+ph)*5;y=-30+k*28;
      c.save();c.translate(x,y);c.rotate(t*1.5+i);c.globalAlpha*=Math.sin(k*3.1416)*0.9;
      c.fillStyle='rgba(90,190,70,1)';c.beginPath();c.ellipse(0,0,4.4,2.2,0,0,6.2832);c.fill();c.restore();}},
  /* xoáy tuyết nhỏ + tinh thể băng lấp lánh */
  tuyet:function(c,t,ph){
    var i,j,a,x,y,r,k;
    c.lineCap='round';c.lineWidth=2.2;
    for(i=0;i<3;i++){a=t*2.4+ph+i*2.094;r=9+i*4;
      c.strokeStyle='rgba(70,150,225,.75)';c.beginPath();c.ellipse(0,-5-i*6,r,r*0.36,0,a,a+2.3);c.stroke();
      c.fillStyle='#ffffff';c.beginPath();c.arc(Math.cos(a+2.3)*r,-5-i*6+Math.sin(a+2.3)*r*0.36,2.2,0,6.2832);c.fill();}
    for(j=0;j<3;j++){k=0.5+0.5*Math.sin(t*3.2+ph+j*2.3);x=(j-1)*15;y=-14-(j%2)*15+Math.sin(t*2+j)*2;r=2.5+k*3.5;
      c.fillStyle='rgba(235,252,255,'+(0.35+0.65*k)+')';c.strokeStyle='rgba(40,125,215,'+(0.35+0.55*k)+')';c.lineWidth=1;
      c.beginPath();c.moveTo(x,y-r*1.7);c.lineTo(x+r*0.6,y);c.lineTo(x,y+r*1.7);c.lineTo(x-r*0.6,y);c.closePath();c.fill();c.stroke();}}
};
function chonThu(khu,hiem){
  try{
    var h=root.TTGTHAMHIEM,pl=root.TTGTHU&&root.TTGTHU.getRaTran?root.TTGTHU.getRaTran():null,e;
    if(!h||!h.createEncounter||!pl)return null;
    e=h.createEncounter(pl,Math.random,{encounter:'auto',khu:khu,hiem:hiem});
    if(!e)return null;
    return {source:e.source,id:e.id,boss:!!e.boss,tien:e.tien,imageFile:e.record&&e.record.imageFile};
  }catch(err){return null;}}
/* khung ảnh con thú + bản bóng đen (dựng 1 lần, đủ ảnh mới nhận); chưa tải xong -> null */
var THU_ANH={};
function anhThu(s,ch){
  var key=ch.source+'|'+ch.id+'|'+ch.tien,o=THU_ANH[key],T,cv,x,im,w,h,N=192;
  if(o&&o.ok)return o;
  if(!o)o=THU_ANH[key]={ok:false,img:null};
  try{
    cv=D.createElement('canvas');cv.width=cv.height=N;x=cv.getContext('2d');
    if(ch.source==='demo'){
      T=root.THU_MOI;if(!T||!T.draw)return null;
      if(!s.frame192&&T.setFrame){T.setFrame(192);s.frame192=true;}
      if(!T.draw(x,ch.id,ch.tien||1,N/2,N,N,true))return null;
    }else{
      if(!ch.imageFile)return null;
      if(!o.img){o.img=new Image();o.img.src=DIR+'quai/'+ch.imageFile;}
      im=o.img;if(!im.complete||!im.naturalWidth)return null;
      w=im.naturalWidth;h=im.naturalHeight;var k=Math.min(N/w,N/h);w*=k;h*=k;
      x.drawImage(im,(N-w)/2,N-h,w,h);
    }
    o.that=cv;
    o.bong=D.createElement('canvas');o.bong.width=o.bong.height=N;x=o.bong.getContext('2d');
    x.drawImage(cv,0,0);x.globalCompositeOperation='source-in';x.fillStyle='#0b1226';x.fillRect(0,0,N,N);
    o.ok=true;return o;
  }catch(err){return null;}}
function haoQuang(c,col,t,ph){
  var p=1+Math.sin(t*3+ph)*0.07,g,i,a;
  c.save();c.scale(1,0.38);
  g=c.createRadialGradient(0,0,4,0,0,38*p);g.addColorStop(0,hexA(col,0.75));g.addColorStop(0.65,hexA(col,0.35));g.addColorStop(1,hexA(col,0));
  c.fillStyle=g;c.beginPath();c.arc(0,0,38*p,0,6.2832);c.fill();
  c.lineWidth=3.5;c.strokeStyle=col;c.beginPath();c.arc(0,0,29*p,0,6.2832);c.stroke();
  c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.85)';
  for(i=0;i<3;i++){a=t*1.6+ph+i*2.094;c.beginPath();c.arc(0,0,22,a,a+0.9);c.stroke();}
  c.restore();}
function drawSpot(s,sp){
  try{
    var c=s.ctx,t=s.clock/1000,left=sp.until-s.clock,H=CFG.hienThu,a=1,dx=s.p.x-sp.x,dy=s.p.y-sp.y,d,dich,f,bong,that,o=null,size=H.co,tho;
    if(left<3000)a=0.45+0.55*Math.abs(Math.sin(t*9));
    d=Math.sqrt(dx*dx+dy*dy);
    dich=clamp((H.xa-d)/(H.xa-H.gan),0,1);
    f=sp.fade=(sp.fade||0)+(dich-(sp.fade||0))*0.15;   /* chuyển mượt */
    if(f>0.01){
      if(!sp.chon&&s.clock>=(sp.thuLai||0)){sp.chon=chonThu(sp.khu,sp.hiem);sp.thuLai=s.clock+1000;}
      if(sp.chon)o=anhThu(s,sp.chon);}
    bong=clamp(f*2.5,0,1);that=clamp(f*2-1,0,1);
    c.save();c.translate(sp.x,sp.y);
    var z=sp.z||0,nhun=(!sp.hop&&sp.dapDat&&s.clock-sp.dapDat<160)?Math.sin((s.clock-sp.dapDat)/160*Math.PI)*0.1:0;
    if(!o||bong<1){c.globalAlpha=a*(o?1-bong:1);c.save();c.translate(0,-z);DAUHIEU[s.v.dauHieu||'tuyet'](c,t,sp.ph);c.restore();}
    if(f>0.01){c.globalAlpha=a*bong;c.save();c.scale(size/68,size/68);haoQuang(c,HIEM[sp.hiem].mau,t,sp.ph);c.restore();}
    if(o){
      tho=1+Math.sin(t*2.6+sp.ph)*0.025;
      c.globalAlpha=a*bong;ellipse(c,0,1,size*0.28,size*0.08,'rgba(0,0,0,.28)');
      c.translate(0,-z);c.scale(1+nhun*0.7,tho-nhun);
      if(that<1){c.globalAlpha=a*bong*(1-that);c.drawImage(o.bong,-size/2,-size+4,size,size);}
      if(that>0){c.globalAlpha=a*that;c.drawImage(o.that,-size/2,-size+4,size,size);}}
    c.restore();
    txt(c,Math.max(0,Math.ceil(left/1000))+'s',sp.x,sp.y-z-(40+(size-30)*bong),13,left<10000?'#ff8a7a':'#ffffff');
  }catch(err){try{s.ctx.restore();}catch(_){}}}

/* Sprite Boss thật (gốc toạ độ = chân Boss). true = đã vẽ; false = chưa có/chưa nạp xong => dùng hình vẽ tạm */
function drawBossSprite(s,c,r,bob){
  var B=s.boss,T,size=r*3.6,im,h,w;
  if(!B||B.fail)return false;
  if(B.src==='demo'){
    T=root.THU_MOI;if(!T||!T.draw)return false;
    try{if(!s.frame192&&T.setFrame){T.setFrame(192);s.frame192=true;}return !!T.draw(c,B.id,B.tien||3,0,bob,size,true);}
    catch(e){B.fail=true;return false;}}
  if(B.src==='main'&&B.imageFile){
    if(!B.img){B.img=new Image();B.img.onerror=function(){B.fail=true;};B.img.src=DIR+'quai/'+B.imageFile;}
    im=B.img;if(!im.complete||!im.naturalWidth)return false;
    h=size*1.15;w=h*(im.naturalWidth/im.naturalHeight||1);c.drawImage(im,-w/2,bob-h,w,h);return true;}
  return false;}

function drawBoss(s){
  var b=s.v.boss,c=s.ctx,t=s.clock/1000,ms=s.bossMs,wait=ms>0,r=b.banKinhCham,bob=Math.sin(t*2)*3,g,y0=-r*0.9+bob,
      nm=(s.boss&&s.boss.ten)||b.ten||'Boss',spr,lab;
  c.save();c.translate(b.x,b.y);
  c.globalAlpha=wait?0.35:1;
  ellipse(c,0,0,r*0.9,r*0.28,'rgba(0,0,0,.35)');
  if(!wait){
    g=c.createRadialGradient(0,y0,r*0.3,0,y0,r*1.7+Math.sin(t*3)*6);
    g.addColorStop(0,'rgba(255,212,92,.45)');g.addColorStop(1,'rgba(255,120,60,0)');
    c.fillStyle=g;c.beginPath();c.arc(0,y0,r*1.8,0,6.2832);c.fill();}
  spr=drawBossSprite(s,c,r,bob);
  if(!spr){
    /* hình vẽ tạm (chỉ khi chưa lấy được ảnh Boss) */
    c.fillStyle='#e8f3ff';
    c.beginPath();c.moveTo(-r*0.6,y0-r*0.5);c.lineTo(-r*0.95,y0-r*1.25);c.lineTo(-r*0.2,y0-r*0.8);c.closePath();c.fill();
    c.beginPath();c.moveTo(r*0.6,y0-r*0.5);c.lineTo(r*0.95,y0-r*1.25);c.lineTo(r*0.2,y0-r*0.8);c.closePath();c.fill();
    g=c.createLinearGradient(0,y0-r,0,y0+r);g.addColorStop(0,'#6f55d6');g.addColorStop(1,'#2c2470');
    c.fillStyle=g;c.beginPath();c.arc(0,y0,r*0.9,0,6.2832);c.fill();
    c.lineWidth=3;c.strokeStyle=wait?'#8aa0c0':'#ffd45c';c.stroke();
    c.fillStyle=wait?'#c8d6ea':'#ffd45c';
    ellipse(c,-r*0.33,y0-r*0.1,r*0.16,r*0.1,c.fillStyle);ellipse(c,r*0.33,y0-r*0.1,r*0.16,r*0.1,c.fillStyle);}
  c.restore();
  /* nhãn trên đầu (không bị mờ) */
  lab=spr?r*3.9:r*2.15;
  c.save();c.globalAlpha=1;
  if(wait)txt(c,'⏳ '+dinhDangDem(ms),b.x,b.y-lab,15,'#ffffff');
  else txt(c,nm,b.x,b.y-lab,15,'#ffd45c');
  c.restore();}

/* icon 2 kiếm chéo (gốc toạ độ = chân boss) */
function drawKiem(c,r,t){
  var k=r*1.15,sg,pul=0.5+0.5*Math.sin(t*5);
  c.save();c.translate(0,-r*0.95);
  c.fillStyle='rgba(255,70,70,'+(0.18+0.12*pul)+')';c.beginPath();c.arc(0,0,k*(1.0+0.08*pul),0,6.2832);c.fill();
  c.lineJoin='round';c.strokeStyle='#1a2438';c.lineWidth=3;
  for(sg=-1;sg<=1;sg+=2){
    c.save();c.rotate(sg*0.78+Math.sin(t*9)*0.03*sg);
    c.fillStyle='#e8f3ff';c.beginPath();c.rect(-k*0.07,-k*0.95,k*0.14,k*1.3);c.fill();c.stroke();
    c.fillStyle='#ffd45c';c.beginPath();c.rect(-k*0.3,k*0.35,k*0.6,k*0.12);c.fill();c.stroke();
    c.fillStyle='#8a5a2b';c.beginPath();c.rect(-k*0.06,k*0.47,k*0.12,k*0.3);c.fill();c.stroke();
    c.restore();}
  c.restore();}
function drawThan(s){
  var t=s.than,c=s.ctx,T=s.clock/1000,r,bob,size,y0,g,ok=false,khoa,o,lab;
  if(!t)return;
  r=t.r;
  if(t.dangDanh){
    c.save();c.translate(t.x,t.y);ellipse(c,0,0,r*0.9,r*0.28,'rgba(0,0,0,.3)');drawKiem(c,r,T);c.restore();
    c.save();c.globalAlpha=1;txt(c,'Đang giao chiến',t.x,t.y-r*2.5,14,'#ffb0b0');c.restore();return;}
  khoa=t.khoa>0;bob=Math.sin(T*2)*3;size=r*3.6;y0=-r*0.9+bob;
  c.save();c.translate(t.x,t.y);
  c.globalAlpha=khoa?0.4:1;
  ellipse(c,0,0,r*0.9,r*0.28,'rgba(0,0,0,.35)');
  if(!khoa){
    g=c.createRadialGradient(0,y0,r*0.3,0,y0,r*1.7+Math.sin(T*3)*6);
    g.addColorStop(0,'rgba(255,215,106,.55)');g.addColorStop(1,'rgba(180,90,255,0)');
    c.fillStyle=g;c.beginPath();c.arc(0,y0,r*1.8,0,6.2832);c.fill();}
  try{o=root.THU_MOI;if(o&&o.draw){if(!s.frame192&&o.setFrame){o.setFrame(192);s.frame192=true;}ok=!!o.draw(c,t.loai,3,0,bob,size,true);}}catch(e){ok=false;}
  if(!ok){c.fillStyle='#6f55d6';c.beginPath();c.arc(0,y0,r*0.9,0,6.2832);c.fill();c.lineWidth=3;c.strokeStyle='#ffd76a';c.stroke();}   /* hình vẽ tạm khi chưa nạp xong ảnh */
  c.restore();
  lab=ok?r*3.9:r*2.15;
  c.save();c.globalAlpha=1;
  if(khoa)txt(c,'⏳ '+t.khoa+' giây',t.x,t.y-lab,15,'#ffffff');
  else txt(c,t.ten+' · '+Math.round(t.hp*100)+'%',t.x,t.y-lab,15,'#ffd76a');
  c.restore();}

function chibi(c,k){
  c.fillStyle='#3d7be0';c.beginPath();c.ellipse(0,-k*0.24,k*0.22,k*0.24,0,0,6.2832);c.fill();
  c.fillStyle='#ff6b6b';c.fillRect(-k*0.2,-k*0.5,k*0.4,k*0.08);
  c.fillStyle='#ffe0c2';c.beginPath();c.arc(0,-k*0.68,k*0.26,0,6.2832);c.fill();
  c.fillStyle='#e8f3ff';c.beginPath();c.arc(0,-k*0.72,k*0.27,Math.PI,0);c.fill();
  c.fillStyle='#222';c.beginPath();c.arc(k*0.1,-k*0.66,k*0.035,0,6.2832);c.fill();
  c.fillStyle='#2a3f6e';c.fillRect(-k*0.14,-k*0.02,k*0.1,k*0.04);c.fillRect(k*0.04,-k*0.02,k*0.1,k*0.04);}
/* gốc toạ độ = chân nhân vật, quay PHẢI (đã scale(face,1) bên ngoài) */
function drawSprite(s,c,k){
  var sp;
  /* Chỉ dùng sprite khi đã cấu hình ảnh nhân vật hợp lệ. Không gọi THU_MOI.draw()
     với ID 0: hàm đó có thể không vẽ gì nhưng vẫn khiến caller bỏ qua chibi(). */
  /* Ảnh nhân vật: CFG.nhanVat.anh nếu có, không thì ảnh map của nhân vật người chơi đã chọn (64b-chon-nhan-vat.js, kèm skin đang mặc). */
  var src=CFG.nhanVat.anh||(window.TTGNHANVAT&&TTGNHANVAT.anhMap?TTGNHANVAT.anhMap():null);
  if(src){
    if(!s.sprite||s.spriteSrc!==src){s.spriteSrc=src;s.sprite=new Image();s.sprite.onload=function(){if(S===s&&s.ready)draw(s);};s.sprite.src=src;}
    sp=s.sprite;
    if(sp.complete&&sp.naturalWidth){c.drawImage(sp,-k/2,-k,k,k);return true;}
  }
  return false;}
/* dải khung đi bộ (4 khung 512x512 ngang) của nhân vật đã chọn, theo hướng p.dir; chưa có file / lỗi tải thì trả null để rơi về ảnh đứng yên. */
function stripFor(s){
  if(CFG.nhanVat.anh||!window.TTGNHANVAT||!TTGNHANVAT.anhDi)return null;
  var src=TTGNHANVAT.anhDi(s.p.dir||'phai');s.strips=s.strips||{};
  var e=s.strips[src];
  if(!e){e=s.strips[src]={img:new Image(),ok:false,bad:false};e.img.onload=function(){e.ok=true;};e.img.onerror=function(){e.bad=true;};e.img.src=src;}
  return(e.ok&&!e.bad)?e.img:null;}
function drawPlayer(s){
  var p=s.p,c=s.ctx,k=CFG.nhanVat.kich,st=stripFor(s),bob=(!st&&p.moving)?Math.abs(Math.sin(p.walk))*CFG.nhanVat.nhun:0;   /* khung đi bộ đã có nhún sẵn */
  ellipse(c,p.x,p.y,k*0.3*(1-bob*0.03),k*0.1,'rgba(0,0,0,.3)');
  c.save();c.translate(p.x,p.y-bob);c.scale((p.dir==='truoc'||p.dir==='sau')?1:p.face,1);
  if(st){var fi=p.moving?Math.floor(p.walk/1.5)%4:1;   /* 12 đơn vị/giây / 1,5 = 8 khung/giây; đứng yên = khung 2 */
    c.drawImage(st,fi*512,0,512,512,-k/2,-k,k,k);}
  else if(!drawSprite(s,c,k))chibi(c,k);
  c.restore();
  /* danh hiệu đang mặc nổi trên đầu nhân vật khi đi thám hiểm (đỉnh đầu: phải .133 / trước .051 / sau .115) */
  try{if(window.TTGDHDAU){var hf=st?(p.dir==='truoc'?.051:(p.dir==='sau'?.115:.133)):.051;TTGDHDAU.draw(c,p.x,p.y-bob-k+hf*k,k*1.35,1);}}catch(eT){}}

/* lớp phủ mask (chỉ khi Debug Mask): xanh bán trong suốt = đi được; viền vàng đứt nét = gợi ý quảng trường khu 4; vòng trắng = đầu cọ */
function drawMask(s){
  var m=s.mask,c=s.ctx,v=s.v,i,o,d,g=m.g,cw=v.rong/m.w;
  if(!s.ov){s.ov=D.createElement('canvas');s.ov.width=m.w;s.ov.height=m.h;s.ovx=s.ov.getContext('2d');s.ovd=s.ovx.createImageData(m.w,m.h);s.maskDirty=true;}
  if(s.maskDirty){
    d=s.ovd.data;
    for(i=0;i<g.length;i++){o=i*4;if(g[i]){d[o]=40;d[o+1]=220;d[o+2]=120;d[o+3]=110;}else d[o+3]=0;}
    s.ovx.putImageData(s.ovd,0,0);s.maskDirty=false;refreshDbg(s);}
  c.save();c.imageSmoothingEnabled=false;c.drawImage(s.ov,0,0,v.rong,v.cao);
  (v.maskThem||[]).forEach(function(h){
    if(h.loai!=='da-giac'||!h.pts)return;
    c.beginPath();h.pts.forEach(function(p,k){if(k)c.lineTo(p[0],p[1]);else c.moveTo(p[0],p[1]);});c.closePath();
    c.setLineDash([10,8]);c.lineWidth=2;c.strokeStyle='rgba(255,212,92,.9)';c.stroke();});
  c.setLineDash([]);
  if(s.cursor){c.lineWidth=2;c.strokeStyle='#fff';c.beginPath();c.arc(s.cursor.x,s.cursor.y,BRUSH[s.bi]*cw,0,6.2832);c.stroke();}
  c.restore();}

function draw(s){
  var c=s.ctx,v=s.v,z=s.zoom,d=s.dpr,ents=[],i,j,g;
  c.setTransform(1,0,0,1,0,0);c.fillStyle='#0a1018';c.fillRect(0,0,s.cv.width,s.cv.height);
  c.setTransform(d*z,0,0,d*z,-s.cam.x*z*d,-s.cam.y*z*d);
  c.drawImage(s.img,0,0,v.rong,v.cao);
  if(s.dbg)drawMask(s);
  for(i=0;i<s.groups.length;i++){g=s.groups[i];for(j=0;j<g.pts.length;j++)if(g.pts[j].on)ents.push({y:g.pts[j].y,f:(function(sp){return function(st){drawSpot(st,sp);};})(g.pts[j])});}
  if(v.boss)ents.push({y:v.boss.y,f:drawBoss});
  if(s.than)ents.push({y:s.than.y,f:drawThan});
  ents.push({y:s.p.y,f:drawPlayer});
  ents.sort(function(a,b){return a.y-b.y;});
  for(i=0;i<ents.length;i++)ents[i].f(s);}

/* ---------- VÒNG LẶP ---------- */
function frame(t){
  var s=S;if(!s||s.paused)return;
  s.raf=requestAnimationFrame(frame);
  var dt=s.last?Math.min(0.05,(t-s.last)/1000):0;s.last=t;
  update(s,dt);
  if(S!==s)return;   /* onTouch có thể đã close() */
  draw(s);}
function go(s){
  s.paused=false;s.last=0;
  bindKeys();
  if(s.ready&&!s.raf)s.raf=requestAnimationFrame(frame);}

/* ---------- API ---------- */
function open(host){
  var v,s;
  if(S)close();
  host=host||{};
  v=vung(host.vung);
  if(!v){try{console.warn('[TTGMAP] không có vùng: '+host.vung);}catch(e){}return false;}
  s=S={host:host,slug:host.vung||'tuyet-nguyen',v:v,img:null,ready:false,paused:false,raf:0,last:0,clock:0,coolUntil:0,
    keys:{},joy:{id:null,x:0,y:0,cx:0,cy:0},p:{x:v.xuatPhat.x,y:v.xuatPhat.y,face:1,walk:0,moving:false},
    cam:{x:0,y:0},zoom:CFG.camera.zoom||1,vw:0,vh:0,dpr:1,khuId:0,groups:[],bossT:-1,than:null,thanPos:null,thanT:-1,bossMs:bossConLai(host.vung||'tuyet-nguyen'),
    hudTimer:0,sprite:null,thuFail:false,frame192:false,
    boss:null,mask:null,open:[],dbg:false,tool:'paint',bi:1,pid:null,last2:null,cursor:null,ov:null,maskDirty:true};
  s.last=0;
  s.boss=findBoss(s.slug);
  s.mask=loadMask(v,s.slug);
  s.open=buildOpen(v);
  buildDom(s);
  buildSpots(s);
  fit();
  setDbg(s,!!CFG.debugMask);
  window.addEventListener('resize',fit);
  /* 27/11/2026: BỎ requestFullscreen. Gọi nó làm Chrome hiện thông báo 'Để thoát khỏi chế độ toàn màn hình...' mỗi lần vào map. Bản cài (PWA) đã tự toàn màn hình + khóa ngang theo pwa-moi.webmanifest, giống phần còn lại của game (xem chú thích đầu index.html). */
  try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(function(){});}catch(e){}
  s.img=new Image();
  s.img.onload=function(){
    if(S!==s)return;
    s.ready=true;s.load.style.display='none';
    fit();snapCam(s);
    if(!s.paused)go(s);else draw(s);};
  s.img.onerror=function(){if(S===s)s.load.textContent='Không tải được ảnh bản đồ.';};
  s.img.src=v.anh;
  return true;}

/* vào trận: dừng rAF + bỏ listener phím + ẨN màn bản đồ (để thấy trận) + thoát fullscreen của phần tử; GIỮ NGUYÊN vị trí / điểm rung / đồng hồ */
function pause(){
  var s=S;if(!s)return false;
  if(s.raf){cancelAnimationFrame(s.raf);s.raf=0;}
  unbindKeys();
  s.keys={};joyReset(s);
  s.pid=null;s.last=null;
  s.paused=true;s.last=0;s.bossT=-1;
  s.coolUntil=s.clock+CFG.cooldownSauTran;   /* S.clock đứng yên lúc pause => cooldown tính từ lúc quay về map */
  try{if(D.fullscreenElement===s.root&&D.exitFullscreen)D.exitFullscreen().catch(function(){});
      else if(D.webkitFullscreenElement===s.root&&D.webkitExitFullscreen)D.webkitExitFullscreen();}catch(e){}
  if(s.root)s.root.style.display='none';
  return true;}

/* xong trận: kq = {diemId?, boss?:true}. Điểm vừa chạm biến mất rồi hồi sau CFG.hoi; boss => bắt đầu đếm hồi 15 phút (bossDanhXong); bật cooldown; hiện lại màn bản đồ */
function resume(kq){
  var s=S,i,j,g,p;if(!s)return false;
  kq=kq||{};
  if(kq.diemId){
    for(i=0;i<s.groups.length;i++){g=s.groups[i];
      for(j=0;j<g.pts.length;j++){p=g.pts[j];
        if(p.id===kq.diemId){tatSpot(s,p);g.target=soDiemCan();}}}}
  if(kq.boss)bossDanhXong(s.slug);
  s.bossMs=bossConLai(s.slug);s.bossT=-1;s.thanT=-1;thanLamMoi(s);   /* sau trận: đọc lại trạng thái boss Thần ngay (chạy sang vùng khác / chết / khóa) */
  s.coolUntil=s.clock+CFG.cooldownSauTran;
  if(s.root)s.root.style.display='block';
  fit();
  go(s);
  return true;}

/* Dừng/Esc: dọn sạch */
function close(){
  var s=S;if(!s)return false;
  S=null;
  if(s.raf){cancelAnimationFrame(s.raf);s.raf=0;}
  unbindKeys();
  window.removeEventListener('resize',fit);
  clearTimeout(s.hudTimer);
  try{saveDraft(s);}catch(e){}
  s.img&&(s.img.onload=s.img.onerror=null);
  try{if(D.fullscreenElement===s.root&&D.exitFullscreen)D.exitFullscreen().catch(function(){});
      else if(D.webkitFullscreenElement===s.root&&D.webkitExitFullscreen)D.webkitExitFullscreen();}catch(e){}
  try{if(screen.orientation&&screen.orientation.unlock)screen.orientation.unlock();}catch(e){}
  if(s.root&&s.root.parentNode)s.root.parentNode.removeChild(s.root);
  return true;}

/* đang mở và không tạm dừng */
function active(){return !!(S&&!S.paused);}
/* bật/tắt Debug Mask (không truyền = đảo). Trả trạng thái mới. */
function debug(on){
  var v=on==null?!CFG.debugMask:!!on;
  if(S)setDbg(S,v);else CFG.debugMask=v;
  return CFG.debugMask;}

try{var _w=checkCfg();if(_w.length)console.warn('[TTGMAP] cấu hình có vấn đề:\n - '+_w.join('\n - '));}catch(e){}

root.TTGMAP={CFG:CFG,HIEM:HIEM,HIEM_KEYS:HIEM_KEYS,VUNG:VUNG,vung:vung,khuTai:khuTai,tungHiem:tungHiem,soDiemCan:soDiemCan,
  bossReadyAt:bossReadyAt,bossConLai:bossConLai,bossDanhXong:bossDanhXong,dinhDangDem:dinhDangDem,checkCfg:checkCfg,tungDich:tungDich,
  findBoss:findBoss,maskEnc:maskEnc,maskDec:maskDec,copyMask:copyMask,
  open:open,pause:pause,resume:resume,close:close,active:active,debug:debug};
})(typeof window!=='undefined'?window:globalThis);
