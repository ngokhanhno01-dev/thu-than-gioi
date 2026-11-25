/* ===== 89-tham-hiem-map.js (TTGMAP): ENGINE "THÁM HIỂM ĐI BỘ" =====
   THAY cho build()/script() của 82-tham-hiem-auto.js (màn "đang tìm" giả). Vùng làm trước: Tuyết Nguyên.
   TRẠNG THÁI: B1 = bảng cấu hình + hàm thuần (khu, tỉ lệ, đồng hồ boss) + khung API. CHƯA vẽ, CHƯA nối vào game (nối ở B6).
     B2 mask đường | B3 canvas/joystick/camera/va chạm | B4 điểm rung + HUD khu | B5 boss | B6 nối 82 + index.html.

   TOẠ ĐỘ: mọi toạ độ trong CFG tính theo ảnh GỐC 1536x1024 ("đơn vị map"). Engine tự nhân hệ số (ảnh.naturalWidth/1536), nên đổi ảnh khác độ phân giải vẫn đúng.
   CHỈNH TAY: chỉ sửa khối CFG bên dưới (điểm rung, khu, tỉ lệ, boss, thời gian).

   GIAO DIỆN VỚI CODE HIỆN CÓ (đã đọc 82, 61, prepExplore/startExplore trong index.html):
     - TTGTHAMHIEM.prep(npcId)  = prepExplore: chọn thú ra trận + tung địch (createEncounter) -> {player,ps,enemy,tag} | null. KHÔNG nhận độ hiếm/boss  => B6 phải thêm tham số tuỳ chọn opts {hiem, boss} (xem hàm tungDich bên dưới).
     - TTGTHAMHIEM.battle(pre)  = startExplore(pre): vào trận. 82 bọc lại thành TTGTX.vaoTran(pre).
     - TTGTX.next() (thắng/thua/bắt thú xong) và TTGTX.stop() do index.html gọi. TTGTX.active() = đang chạy vòng lặp.
   HỢP ĐỒNG TTGMAP <-> 82 (B6):
     TTGMAP.open(host)   host = {vung, onTouch(ev), onStop()}   ev = {loai:'diem'|'boss', hiem:'thuong'|..., khu:1..4}
     TTGMAP.pause()      vào trận: dừng rAF + bỏ listener phím, GIỮ NGUYÊN vị trí/trạng thái điểm/đồng hồ
     TTGMAP.resume(kq)   sau trận: kq = {diemId?, boss?:true}; điểm vừa chạm biến mất rồi hồi theo CFG.hoi; boss bắt đầu đếm 15 phút; bật cooldown chạm
     TTGMAP.close()      Dừng/Esc: dọn sạch, trả màn hình về sảnh
*/
(function(root){
'use strict';
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
  debugMask:false,            /* true = hiện lớp mask đường (bật/tắt bằng nút debug hoặc phím M, làm ở B3) */
  rung:20000,                 /* ms điểm rung hiện trước khi tự biến mất */
  hoi:15000,                  /* ms điểm hồi lại sau khi biến mất / sau khi chạm */
  soDiemHien:[3,4],           /* mỗi khu cùng lúc hiện 3-4 điểm (trong 4 điểm cố định) */
  banKinhCham:24,             /* đơn vị map: khoảng cách chạm vào điểm rung */
  banKinhMaskDiem:26,         /* đơn vị map: vòng tròn mở rộng mask quanh mỗi điểm để chạm được dù điểm nằm ngoài đường */
  cooldownSauTran:900,        /* ms không cho chạm lại sau khi quay về map */
  nhanVat:{toc:190,kich:64,anh:null,nhun:3},   /* toc = đơn vị map/giây; anh = đường dẫn ảnh 512x512 quay PHẢI (null = vẽ tạm bằng THU_MOI.draw); nhun = biên độ nhún khi đi (px) */
  camera:{zoom:1},
  joystick:{kinh:112,kinhNho:94},
  boss:{hoiMs:15*60*1000,luuKhoa:'ttg_map_boss_'}   /* hồi theo GIỜ THỰC (Date.now), lưu localStorage theo từng vùng */
};

/* ---------- DỮ LIỆU VÙNG ----------
   khu: y0 (trên) -> y1 (dưới) theo ảnh 1536x1024; khu 1 ở dưới cùng. ti = tỉ lệ ra thú (%), tổng mỗi khu phải = 100 (checkCfg() báo nếu lệch).
   diem: 4 điểm rung cố định mỗi khu, vị trí ƯỚC LƯỢNG (cần chỉnh khi xem debug mask: điểm phải nằm cạnh đường).
   Tên khu 1, 3, 4 là TÊN TẠM tự đặt theo cảnh trong ảnh (chỉ khu 2 "Cầu Đá" là theo mô tả) - sửa ten ở đây. */
var VUNG={
  'tuyet-nguyen':{
    ten:'Tuyết Nguyên',
    anh:DIR+'map-tham-hiem-tuyet-nguyen.webp',
    rong:1536,cao:1024,
    mask:DIR+'mask-tuyet-nguyen.png',        /* B2 tạo file này (1 kênh, trắng = đi được) */
    xuatPhat:{x:790,y:980},
    khu:[
      {id:1,ten:'Khu 1 – Hồ Băng',     y0:780,y1:1024,ti:{thuong:80,hiem:17,suthi:2.7,huyenthoai:0.3}},
      {id:2,ten:'Khu 2 – Cầu Đá',      y0:520,y1:780, ti:{thuong:60,hiem:30,suthi:8,  huyenthoai:2}},
      {id:3,ten:'Khu 3 – Thác Nước',   y0:270,y1:520, ti:{thuong:35,hiem:35,suthi:22, huyenthoai:8}},
      {id:4,ten:'Khu 4 – Cổng Hang Băng',y0:0, y1:270, ti:{thuong:15,hiem:30,suthi:35, huyenthoai:20}}
    ],
    diem:{
      1:[{id:'1a',x:330, y:880,ghiChu:'hồ băng trái'},{id:'1b',x:630, y:850,ghiChu:'gốc cây cụt'},
         {id:'1c',x:120, y:860,ghiChu:'cụm pha lê góc trái'},{id:'1d',x:1100,y:880,ghiChu:'tảng đá lớn phải'}],
      2:[{id:'2a',x:370, y:560,ghiChu:'cây khô cổ thụ'},{id:'2b',x:620, y:650,ghiChu:'suối cạnh cầu'},
         {id:'2c',x:1130,y:600,ghiChu:'hang đá nhỏ phải'},{id:'2d',x:1000,y:620,ghiChu:'pha lê cạnh hang'}],
      3:[{id:'3a',x:330, y:300,ghiChu:'thác nước'},{id:'3b',x:700, y:370,ghiChu:'tảng đá lớn giữa'},
         {id:'3c',x:1020,y:330,ghiChu:'bậc thang phải'},{id:'3d',x:725, y:410,ghiChu:'pha lê'}],
      4:[{id:'4a',x:610, y:150,ghiChu:'cột đá trái'},{id:'4b',x:1010,y:110,ghiChu:'cột đá phải'},
         {id:'4c',x:1170,y:100,ghiChu:'pha lê phải'},{id:'4d',x:780, y:90, ghiChu:'gần cổng hang'}]
    },
    boss:{x:780,y:150,banKinhCham:38,ten:'Boss Truyền Thuyết'},   /* đứng cố định giữa quảng trường khu 4, KHÔNG có tỉ lệ ngẫu nhiên */
    /* hình đa giác quảng trường khu 4 (sàn đá màu khác đường) để B2 THÊM TAY vào mask; toạ độ map, chỉnh khi xem debug */
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
function bossDanhXong(slug,now){var t=(now==null?Date.now():now)+CFG.boss.hoiMs;try{localStorage.setItem(bossKey(slug),String(t));}catch(e){}return t;}
function dinhDangDem(ms){var s=Math.ceil(ms/1000),m=Math.floor(s/60);s%=60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;}

/* kiểm tra bảng cấu hình, trả mảng cảnh báo (rỗng = ổn). Tự chạy 1 lần lúc nạp file. */
function checkCfg(){
  var w=[],slug,v,i,k,sum,j,d;
  for(slug in VUNG){v=VUNG[slug];
    for(i=0;i<v.khu.length;i++){k=v.khu[i];sum=0;
      for(j=0;j<HIEM_KEYS.length;j++)sum+=+k.ti[HIEM_KEYS[j]]||0;
      if(Math.abs(sum-100)>0.001)w.push(slug+' khu '+k.id+': tổng tỉ lệ = '+sum+' (cần 100)');
      d=v.diem[k.id]||[];
      if(d.length<CFG.soDiemHien[1])w.push(slug+' khu '+k.id+': chỉ có '+d.length+' điểm, cần >= '+CFG.soDiemHien[1]);
      d.forEach(function(p){if(p.y<k.y0||p.y>=k.y1)w.push(slug+' điểm '+p.id+' (y='+p.y+') nằm ngoài khu '+k.id);});
      if(i&&k.y1!==v.khu[i-1].y0)w.push(slug+': khu '+k.id+' và khu '+v.khu[i-1].id+' không liền nhau');}
    if(v.boss.y>=v.khu[v.khu.length-1].y1)w.push(slug+': boss nằm ngoài khu cao nhất');}
  return w;}

/* ---------- CẦU NỐI TUNG ĐỊCH (dùng ở B6) ----------
   Gọi TTGTHAMHIEM.prep SAU KHI đã chốt độ hiếm của điểm (hoặc boss). prep hiện chưa nhận opts => B6 thêm: prepExplore(npcId,opts) -> createEncounter(player,rng,opts)
   với opts.hiem = khoá độ hiếm (lọc thú hoang thường theo TTGCS.hiemInfo(id).key; không có thú đúng độ hiếm thì lấy gần nhất bên dưới) và opts.boss = true (ép boss, giữ nguyên Rank gacha). */
function tungDich(ev){
  var h=root.TTGTHAMHIEM;if(!h||!h.prep)return null;
  return ev.loai==='boss'?h.prep(null,{boss:true}):h.prep(null,{hiem:ev.hiem});}

/* ---------- KHUNG API (B3-B6 điền vào) ---------- */
function todo(ten,buoc){try{console.warn('[TTGMAP] '+ten+' chưa làm (bước '+buoc+')');}catch(e){}return false;}
function open(host){return todo('open','B3');}
function pause(){return todo('pause','B3');}
function resume(kq){return todo('resume','B6');}
function close(){return todo('close','B3');}
function active(){return false;}
function debug(on){CFG.debugMask=on==null?!CFG.debugMask:!!on;return CFG.debugMask;}

try{var _w=checkCfg();if(_w.length)console.warn('[TTGMAP] cấu hình có vấn đề:\n - '+_w.join('\n - '));}catch(e){}

root.TTGMAP={CFG:CFG,HIEM:HIEM,HIEM_KEYS:HIEM_KEYS,VUNG:VUNG,vung:vung,khuTai:khuTai,tungHiem:tungHiem,soDiemCan:soDiemCan,
  bossReadyAt:bossReadyAt,bossConLai:bossConLai,bossDanhXong:bossDanhXong,dinhDangDem:dinhDangDem,checkCfg:checkCfg,tungDich:tungDich,
  open:open,pause:pause,resume:resume,close:close,active:active,debug:debug};
})(typeof window!=='undefined'?window:globalThis);
