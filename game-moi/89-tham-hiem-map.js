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
   DEBUG MASK: nút nhỏ "Debug Mask" góc trên trái (hoặc phím M). Bật lên: phủ màu xanh bán trong suốt lên vùng đi được; ngón tay/chuột kéo trên map để tô (✏ Vẽ) hoặc xoá (🧽 Tẩy);
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
     TTGMAP.close()      Dừng/Esc: dọn sạch, trả màn hình về sảnh
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
  rung:20000,                 /* ms điểm rung hiện trước khi tự biến mất */
  hoi:15000,                  /* ms điểm hồi lại sau khi biến mất / sau khi chạm */
  soDiemHien:[3,4],           /* mỗi khu cùng lúc hiện 3-4 điểm (trong 4 điểm cố định) */
  banKinhCham:24,             /* đơn vị map: khoảng cách chạm vào điểm rung */
  banKinhMaskDiem:0,          /* đơn vị map: vòng tròn đi được quanh mỗi điểm rung/boss, bất chấp mask */
  cooldownSauTran:900,        /* ms không cho chạm lại sau khi quay về map */
  nhanVat:{toc:190,kich:64,anh:null,nhun:3},   /* toc = đơn vị map/giây; anh = đường dẫn ảnh 512x512 quay PHẢI (null = vẽ tạm bằng THU_MOI.draw/chibi); nhun = biên độ nhún khi đi (px) */
  camera:{zoom:1},
  joystick:{kinh:152,kinhNho:136,hanhTrinh:0.58},
  boss:{hoiMs:15*60*1000,luuKhoa:'ttg_map_boss_'}   /* hồi theo GIỜ THỰC (Date.now), lưu localStorage theo từng vùng */
};
var BRUSH=[1,2,4,7];          /* bán kính cọ Debug Mask, tính theo ô lưới */
var MASK_KEY='ttg_map_mask_'; /* + slug vùng: bản nháp mask */

/* ---------- DỮ LIỆU VÙNG ----------
   khu: y0 (trên) -> y1 (dưới) theo ảnh 1536x1024; khu 1 ở dưới cùng. ti = tỉ lệ ra thú (%), tổng mỗi khu phải = 100 (checkCfg() báo nếu lệch).
   diem: các chỗ núp cố định mỗi khu (hiện ngẫu nhiên CFG.soDiemHien), đặt cạnh chỗ núp vẽ trên ảnh, nằm trên ô đi được (checkCfg() cảnh báo nếu không tới được).
   Tên khu 1, 3, 4 là TÊN TẠM tự đặt theo cảnh trong ảnh (chỉ khu 2 "Cầu Đá" là theo mô tả) - sửa ten ở đây. */
var VUNG={
  'tuyet-nguyen':{
    ten:'Tuyết Nguyên',
    anh:DIR+'map-tham-hiem-tuyet-nguyen.webp?v=2',
    rong:1536,cao:1024,
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
  if(ev&&ev.loai==='boss'){opts={boss:true};var bi=ev.bossId||(S&&S.boss&&S.boss.id);if(bi!=null)opts.bossId=bi;}
  else opts={encounter:'auto',khu:ev&&ev.khu,hiem:ev&&ev.hiem};
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
  var stop=el('button','position:absolute;right:max(12px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));'+BTN+';font-size:14px;padding:8px 14px','⏸ Dừng');
  var rot=el('div','position:absolute;left:0;right:0;bottom:max(150px,calc(env(safe-area-inset-bottom) + 150px));display:none;justify-content:center;pointer-events:none');
  rot.appendChild(el('div','background:rgba(8,16,28,.8);color:#ffd45c;font-size:13px;padding:6px 12px;border-radius:999px','↻ Xoay ngang màn hình để chơi'));
  var jb=el('div','position:absolute;left:18px;top:18px;width:152px;height:152px;opacity:0;pointer-events:none;border-radius:50%;background:rgba(10,22,38,.34);border:2px solid rgba(225,242,255,.42);box-shadow:0 4px 22px rgba(0,0,0,.24);touch-action:none;transition:opacity .08s');
  var kn=el('div','position:absolute;left:50%;top:50%;border-radius:50%;background:rgba(255,255,255,.55);border:2px solid rgba(255,255,255,.85);pointer-events:none');
  jb.appendChild(kn);
  /* Debug Mask: nút nhỏ góc trên trái + bảng công cụ */
  var dbgBtn=el('button','position:absolute;left:max(12px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));'+BTN+';font-size:12px;padding:6px 10px','Debug Mask');
  var panel=el('div','position:absolute;left:max(12px,env(safe-area-inset-left));top:calc(max(10px,env(safe-area-inset-top)) + 38px);display:none;flex-direction:column;gap:6px;align-items:flex-start');
  var r1=el('div','display:flex;gap:6px'),r2=el('div','display:flex;gap:6px'),r3=el('div','display:flex;gap:6px');
  var bPaint=el('button',BTN+';font-size:12px;padding:6px 10px','✏ Vẽ'),bErase=el('button',BTN+';font-size:12px;padding:6px 10px','🧽 Tẩy'),
      bBrush=el('button',BTN+';font-size:12px;padding:6px 10px','Cọ'),bCopy=el('button',BTN+';font-size:12px;padding:6px 10px','Copy Mask'),
      bClear=el('button',BTN+';font-size:12px;padding:6px 10px','Xoá hết'),
      info=el('div','pointer-events:none;color:#fff;font-size:11px;background:rgba(8,16,28,.72);border-radius:8px;padding:4px 8px');
  r1.appendChild(bPaint);r1.appendChild(bErase);r2.appendChild(bBrush);r2.appendChild(bCopy);r3.appendChild(bClear);
  panel.appendChild(r1);panel.appendChild(r2);panel.appendChild(r3);panel.appendChild(info);
  root_.appendChild(cv);root_.appendChild(hud);root_.appendChild(load);root_.appendChild(rot);root_.appendChild(jb);root_.appendChild(stop);
  root_.appendChild(dbgBtn);root_.appendChild(panel);
  D.body.appendChild(root_);
  s.root=root_;s.cv=cv;s.ctx=cv.getContext('2d');s.load=load;s.hud=hud;s.rot=rot;s.joyBase=jb;s.joyKnob=kn;
  s.dbgBtn=dbgBtn;s.dbgPanel=panel;s.bPaint=bPaint;s.bErase=bErase;s.bBrush=bBrush;s.dbgInfo=info;
  stop.addEventListener('click',function(e){e.preventDefault();stopReq();});
  dbgBtn.addEventListener('click',function(e){e.preventDefault();if(S)setDbg(S,!S.dbg);});
  bPaint.addEventListener('click',function(e){e.preventDefault();if(S){S.tool='paint';refreshDbg(S);}});
  bErase.addEventListener('click',function(e){e.preventDefault();if(S){S.tool='erase';refreshDbg(S);}});
  bBrush.addEventListener('click',function(e){e.preventDefault();if(S){S.bi=(S.bi+1)%BRUSH.length;refreshDbg(S);}});
  bCopy.addEventListener('click',function(e){e.preventDefault();copyMask();});
  bClear.addEventListener('click',function(e){e.preventDefault();if(S)clearMask(S);});
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
  if(c==='KeyM'){if(!e.repeat)setDbg(s,!s.dbg);e.preventDefault();return;}
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
    rd=g.pts.filter(function(q){return !q.on&&s.clock>=q.hoiAt;});
    if(!rd.length)break;
    p=rd[Math.floor(Math.random()*rd.length)];
    p.on=true;p.hiem=tungHiem(g.k);p.until=s.clock+CFG.rung*(jit?rnd(0.6,1):1);n++;}}
function buildSpots(s){
  var v=s.v;
  s.groups=v.khu.map(function(k){
    return {k:k,target:soDiemCan(),pts:(v.diem[k.id]||[]).map(function(d){
      return {id:d.id,x:d.x,y:d.y,khu:k.id,on:false,hoiAt:0,until:0,hiem:'thuong',ph:Math.random()*6.283};})};});
  s.groups.forEach(function(g){spawnSpots(s,g,true);});}
function tickSpots(s){
  s.groups.forEach(function(g){
    g.pts.forEach(function(p){
      if(!p.on||s.clock<p.until)return;
      var ready=g.pts.some(function(q){return !q.on&&s.clock>=q.hoiAt;});
      if(visCount(g)>CFG.soDiemHien[0]||ready){p.on=false;p.hoiAt=s.clock+CFG.hoi;g.target=soDiemCan();}   /* hết hạn -> ẩn, hồi sau CFG.hoi */
      else p.until=s.clock+1000;});                                                                        /* giữ đủ tối thiểu 3 điểm/khu */
    spawnSpots(s,g,false);});}

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
  /* đồng hồ boss (đọc localStorage mỗi ~250ms) */
  if(s.bossT<0||s.clock-s.bossT>=250){s.bossT=s.clock;s.bossMs=bossConLai(s.slug);}
  /* chạm (không trong cooldown; không chạm khi đang tô mask) */
  if(s.clock<s.coolUntil||s.dbg)return;
  r=CFG.banKinhCham;
  for(i=0;i<s.groups.length;i++){
    g=s.groups[i];
    for(j=0;j<g.pts.length;j++){
      sp=g.pts[j];if(!sp.on)continue;
      dx=p.x-sp.x;dy=p.y-sp.y;
      if(dx*dx+dy*dy<=r*r){fireTouch(s,{loai:'diem',hiem:sp.hiem,khu:sp.khu,diemId:sp.id});return;}}}
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
function drawSpot(s,sp){
  var c=s.ctx,col=HIEM[sp.hiem].mau,t=s.clock/1000,left=sp.until-s.clock,r=CFG.banKinhCham*0.62,pul=1+Math.sin(t*4+sp.ph)*0.12,a=1,g,f,q;
  if(left<3000)a=0.45+0.55*Math.abs(Math.sin(t*9));
  c.save();c.globalAlpha=a;c.translate(sp.x,sp.y);
  g=c.createRadialGradient(0,0,2,0,0,r*2.2*pul);g.addColorStop(0,hexA(col,0.55));g.addColorStop(1,hexA(col,0));
  c.fillStyle=g;c.beginPath();c.arc(0,0,r*2.2*pul,0,6.2832);c.fill();
  c.shadowColor=col;c.shadowBlur=18;c.lineWidth=3;c.strokeStyle=col;
  c.beginPath();c.arc(0,0,r*pul,0,6.2832);c.stroke();
  q=r*0.5;c.fillStyle=col;c.beginPath();c.moveTo(0,-q);c.lineTo(q*0.7,0);c.lineTo(0,q);c.lineTo(-q*0.7,0);c.closePath();c.fill();
  c.shadowBlur=0;
  f=clamp(left/CFG.rung,0,1);
  c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.85)';
  c.beginPath();c.arc(0,0,r*pul+6,-Math.PI/2,-Math.PI/2+f*6.2832);c.stroke();
  c.restore();}

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
  for(i=0;i<s.groups.length;i++){g=s.groups[i];for(j=0;j<g.pts.length;j++)if(g.pts[j].on)drawSpot(s,g.pts[j]);}
  if(v.boss)ents.push({y:v.boss.y,f:drawBoss});
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
    cam:{x:0,y:0},zoom:CFG.camera.zoom||1,vw:0,vh:0,dpr:1,khuId:0,groups:[],bossT:-1,bossMs:bossConLai(host.vung||'tuyet-nguyen'),
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
  try{var rf=s.root.requestFullscreen||s.root.webkitRequestFullscreen;if(rf){var pr=rf.call(s.root);if(pr&&pr.catch)pr.catch(function(){});}}catch(e){}
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
        if(p.id===kq.diemId){p.on=false;p.hoiAt=s.clock+CFG.hoi;g.target=soDiemCan();}}}}
  if(kq.boss)bossDanhXong(s.slug);
  s.bossMs=bossConLai(s.slug);s.bossT=-1;
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
