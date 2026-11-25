/* 54-thu-than.js - Nút "Thú Thần" + panel Thú Thần (chứa và trang bị thú đã bắt).
   Cần 52-nut-vuong.js (TTGNV) nạp trước; nạp SAU 53-balo.js (để đóng Balo khi mở panel này) và sau 51-thu-moi.js (lấy ảnh thú).
   Ảnh khung: game-moi/khung-thu.webp (1841x811, khung xanh-vàng: chữ THÚ THẦN, nút X, chữ TRANG BỊ, RA TRẬN và THẢ đã VẼ SẴN trong ảnh; khung mới 21/11/2026 thêm nút THẢ). Hiển thị tối đa đúng cỡ gốc (1 pixel ảnh = 1 pixel máy) để không bị mờ; đóng bằng nút X / bấm ngoài / Esc.
   MỌI TỌA ĐỘ bên dưới tính theo PIXEL ẢNH ĐÃ CẮT 1841x811 (BW x BH). Cỡ chữ/độ dày trong CSS ({n}) vẫn tính theo thang cũ 2200 (UB) nên không phải chỉnh lại; --u = clientWidth/UB.
   TIẾN ĐỘ: BƯỚC 1 (nút + icon) xong. BƯỚC 2 (khung + đóng) xong. BƯỚC 3 (bố cục + chọn thú + ra trận) xong.
   NÚT THẢ: bỏ hẳn thú đang chọn khỏi kho (hỏi xác nhận, sách kỹ năng đang gắn trả về Balo). THẢ 1 con = nhận 1 Mảnh của chính loài đó (TTGTH.manhKhiTha, 75-tien-hoa-thu.js), bất kể Rank/hệ; đây là NGUỒN DUY NHẤT của Mảnh tiến hóa (giết thú không rơi nữa). Nút MỜ khi chưa chọn thú hoặc thú đang chọn đã RA TRẬN; chỉ SÁNG khi chọn thú CHƯA ra trận. Thú 'canh-' (đồng bộ từ sảnh) bị thả thì ghi nhớ ở khóa ttg_moi_thu_tha_v1 để dongBo() không tự thêm lại.
   HIỆU ỨNG NHẤN: do 63-nhan-nut.js lo cho mọi nút (nút vẽ sẵn trong ảnh khung tự được cắt mảnh ảnh để co/nảy). Đừng thêm :active{transform} vào nút nữa kẻo co đôi.
   CHƯA LÀM: bậc thú SS..D (chỉ chừa trường bac), buff/debuff/kỹ năng có sẵn (3 ô tròn), gắn/gỡ sách kỹ năng (6 ô "+"), bảng nổi.
   QUY TẮC: mở Thú Thần thì đóng Balo, mở Balo thì đóng Thú Thần (53-balo.js gọi TTGTHU.close()).
   DỮ LIỆU: danh sách thú {uid, id (loài, khớp THU_MOI.byId), ten, bac (tùy chọn: SR/SS/S/A/B/C/D/E), tien (tiến hóa 1-3 = ảnh -b1/-b2/-b3, mặc định 1), chiso:{hp,tc,pt,td,mm}}
            lưu ở khóa localStorage ttg_moi_thu_v1; uid thú ra trận lưu ở ttg_moi_thu_ratran_v1. Kho tạm KHÔNG giới hạn số thú.
   KỸ NĂNG (5a): mỗi thú có thu.kn = mảng 6 ô (id sách hoặc null). Bấm ô "+" -> danh sách sách kỹ năng trong Balo -> bấm 1 sách -> bảng nổi (Dùng/Đóng);
                 bấm ô đã gắn -> bảng nổi (Gỡ/Đóng). Dùng = trừ 1 sách ở Balo, Gỡ = trả sách về Balo. Danh mục sách mẫu: khối SACH bên dưới (chỗ thêm/sửa kỹ năng).
   API: TTGTHU.open() / .close() / .isOpen() / .add(thu) (trả về uid) / .list() / .getRaTran() (trả thú đang ra trận hoặc null).
   KHỞI TẠO TÀI KHOẢN MỚI (21/11/2026): TTGTHU.khoiTao(thu) = xóa sạch kho thú + thú ra trận + danh sách thả (cả trong bộ nhớ lẫn localStorage), rồi thêm đúng 1 con `thu` và cho RA TRẬN luôn; trả về uid. Gọi từ màn chọn thú đầu game (65-chon-thu-dau.js). Không đụng Balo. Bị bỏ qua ở chế độ ?thu=demo.
   ĐỒNG BỘ SẢNH (dongBo) ĐÃ TẮT (hằng DONGBO = false): đã có chọn thú đầu game + bắt thú thật, không tự thêm thú đang đứng ở sảnh vào kho nữa (nếu không thú cũ sẽ lẫn vào tài khoản mới).
   THỬ: thêm ?thu=demo vào link -> có sẵn vài thú mẫu (không lưu lại). */
(function(){
'use strict';
if(!window.TTGNV)return;
var BW=1841,BH=811,UB=2200,IMG='game-moi/khung-thu.webp?v=8',OV_GOV='game-moi/nut-dang-ra-tran.webp?v=2';   /* ảnh khung gốc 1841x811; UB = thang đơn vị cũ cho cỡ chữ/độ dày ({n}) */
var KEY='ttg_moi_thu_v1',KRT='ttg_moi_thu_ratran_v1',KTHA='ttg_moi_thu_tha_v1';
var demo=/[?&]thu=demo/.test(location.search);
var isOpen=false,openAt=0,root=null,fr=null,E={};

/* ===== CẤU HÌNH (chỗ chỉnh số) ===== */
/* 5 TRANG CHỈ SỐ, mỗi trang tối đa 5 thanh: [khóa trong thu.chiso, tên hiển thị, '%' nếu là tỉ lệ]. Muốn đổi/thêm chỉ số: sửa các mảng này. */
var PAGES=[
  {ten:'Chỉ số chính',ds:[['hp','HP'],['tc','Tấn công'],['pt','Phòng thủ'],['td','Tốc độ'],['mm','May mắn']]},
  {ten:'Chỉ số phụ 1',ds:[['cm','Chí mạng','%'],['hm','Hồi máu','%'],['hutm','Hút máu','%'],['ne','Né tránh','%'],['choang','Choáng','%']]},
  {ten:'Chỉ số phụ 2',ds:[['cx','Chính xác','%'],['pd','Phản đòn','%'],['lk','Liên kích','%'],['stcm','ST chí mạng','%'],['stdb','ST đặc biệt','%']]},   /* ST đặc biệt = sát thương kỹ năng */
  {ten:'Chỉ số phụ 3',ds:[['xg','Xuyên giáp','%'],['khu','Kháng hiệu ứng','%'],['kdb','Kháng đặc biệt','%'],['kc','Kháng choáng','%'],['kne','Kháng né','%']]},   /* kháng hiệu ứng = kháng debuff; kháng đặc biệt = giảm ST kỹ năng */
  {ten:'Chỉ số phụ 4',ds:[['klk','Kháng liên kích','%'],['khutm','Kháng hút máu','%'],['khm','Kháng hồi máu','%'],['kpd','Kháng phản đòn','%']]}
];
var ANH_THU=360;    /* cỡ ảnh thú lớn bên trái (px ảnh khung). Ảnh thú gốc 192px nên to quá sẽ mờ: chỉnh 288~384 */
var BAR_Y=216,BAR_DY=40.8,BAR_X=772,BAR_W=374,BAR_H=27;             /* 5 thanh chỉ số */
var GR_X=[1288,1405,1520,1634],GR_Y=[201,310,420,523],GR_W=105,GR_H=96;  /* lưới thú 4 cột x 4 hàng */
var SK_X=[782,902,1021],SK_Y=[477,592],SK_S=100;                    /* 6 ô kỹ năng (3 cột x 2 hàng) */
var RAIL={x:1754,y:199,w:21,h:422};
var GO={x:1319,y:668,w:206,h:92},THA={x:1542,y:668,w:162,h:92};      /* 2 nút dưới-phải: RA TRẬN và THẢ (vùng tấm vàng vẽ sẵn). Lớp mờ/sáng nới thêm DIM_PAD px mỗi bên */
var GO_OV={x:1286,y:664,w:250,h:100},DIM_PAD=5;                   /* ảnh 'Đang ra trận' phủ lên RA TRẬN */                                  /* rãnh cuộn bên phải lưới */
/* ----- KỸ NĂNG / SÁCH (5a) ----- */
var OC_X=[236,367.5,500],OC_Y=698.5;   /* tâm 3 ô tròn (px ảnh khung, đo từ 4 viên ngọc quanh mỗi vòng trong khung-thu.webp). Muốn nhích chữ: sửa 2 số này */
var NSK=6;                  /* số ô gắn kỹ năng */
var NOI_IMG='';             /* ẢNH KHUNG BẢNG NỔI (nền xanh đã tách, ô giữa trong suốt): khi có file thì điền vd 'game-moi/khung-noi.webp'. Để trống = dùng khung vẽ bằng CSS tạm. */
var POP_LS={x:735,y:180,w:470,h:535};    /* bảng danh sách sách (px ảnh khung) */
var POP_IN={x:785,y:245,w:370,h:420};    /* bảng nổi thông tin kỹ năng */
/* Danh mục sách kỹ năng MẪU. Mỗi sách là 1 item Balo: loai:'sach', ten (tên sách), kn (tên kỹ năng), mo (mô tả), cd (hồi chiêu, lượt), ic (emoji tạm) hoặc img. Muốn thêm: thêm dòng vào đây (hoặc TTGBALO.reg).
   SÁCH BOSS (có trường ky = id kỹ năng): cd và mô tả ĐỌC TỪ bảng KY_NANG_BOSS (56c-buff.js), KHÔNG khai cd/mo ở đây. Quy tắc thêm kỹ năng: xem chú thích trên bảng KY_NANG_BOSS. */
function cdSach(ky){var k=window.TTGCS&&TTGCS.sachKyNang&&TTGCS.sachKyNang('sach-'+ky);return k?k.cd:0;}
var SACH={
  'sach-chem-gio':{loai:'sach',ten:'Sách Chém Gió',kn:'Chém Gió',ic:'🌪️',cd:3,mo:'Chém một đường gió sắc, gây 150% tấn công lên 1 mục tiêu.'},
  'sach-bang-giap':{loai:'sach',ten:'Sách Băng Giáp',kn:'Băng Giáp',ic:'🛡️',cd:4,mo:'Phủ giáp băng, tăng 30% phòng thủ trong 3 lượt.'},
  'sach-hoi-xuan':{loai:'sach',ten:'Sách Hồi Xuân',kn:'Hồi Xuân',ic:'🌿',cd:5,mo:'Hồi 25% máu tối đa cho bản thân.'},
  'sach-loi-de':{loai:'sach',ten:'Sách Lôi Đế',kn:'Lôi Đế',ic:'⚡',cd:5,mo:'Triệu sấm sét gây 200% tấn công, có 20% làm choáng 1 lượt.'},
  'sach-doc-vu':{loai:'sach',ten:'Sách Độc Vụ',kn:'Độc Vụ',ic:'☠️',cd:4,mo:'Phun sương độc, gây sát thương theo thời gian trong 3 lượt (debuff).'},
  'sach-bang-son-ap-dinh':{loai:'sach',ten:'Sách Băng Sơn Áp Đỉnh',kn:'Băng Sơn Áp Đỉnh',ky:'bang-son-ap-dinh',he:'bang',img:'game-moi/icon-kn/bang-son-ap-dinh.png',get cd(){return cdSach(this.ky);},get mo(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky))||'';},get moNgan(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky,1))||'';}},
  'sach-suong-nuot':{loai:'sach',ten:'Sách Sương Nuốt',kn:'Sương Nuốt',ky:'suong-nuot',he:'thuy',img:'game-moi/icon-kn/suong-nuot.png',get cd(){return cdSach(this.ky);},get mo(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky))||'';},get moNgan(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky,1))||'';}},
  'sach-con-bang-trien-si':{loai:'sach',ten:'Sách Côn Bằng Triển Sí',kn:'Côn Bằng Triển Sí',ky:'con-bang-trien-si',he:'phong',img:'game-moi/icon-kn/con-bang-trien-si.png',get cd(){return cdSach(this.ky);},get mo(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky))||'';},get moNgan(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky,1))||'';}},
  'sach-vu-xa-trien':{loai:'sach',ten:'Sách Vũ Xà Triền',kn:'Vũ Xà Triền',ky:'vu-xa-trien',he:'phong',img:'game-moi/icon-kn/vu-xa-trien.png',get cd(){return cdSach(this.ky);},get mo(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky))||'';},get moNgan(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky,1))||'';}},
  'sach-thien-loi-giang':{loai:'sach',ten:'Sách Thiên Lôi Giáng',kn:'Thiên Lôi Giáng',ky:'thien-loi-giang',he:'loi',img:'game-moi/icon-kn/thien-loi-giang.png',get cd(){return cdSach(this.ky);},get mo(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky))||'';},get moNgan(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky,1))||'';}},
  'sach-nguyet-thuc-nuot':{loai:'sach',ten:'Sách Nguyệt Thực Nuốt',kn:'Nguyệt Thực Nuốt',ky:'nguyet-thuc-nuot',he:'am',img:'game-moi/icon-kn/nguyet-thuc-nuot.png',get cd(){return cdSach(this.ky);},get mo(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky))||'';},get moNgan(){return (window.TTGCS&&TTGCS.sachMoTa&&TTGCS.sachMoTa('sach-'+this.ky,1))||'';}},
  'sach-tang-toc':{loai:'sach',ten:'Sách Tăng Tốc',kn:'Tăng Tốc',ic:'💨',cd:3,mo:'Tăng 40% tốc độ trong 2 lượt (buff).'}
};
if(window.TTGBALO&&TTGBALO.reg)TTGBALO.reg(SACH);   /* đăng ký vào Balo (sách đã sở hữu từ trước vẫn nhận ra) */
if(demo&&window.TTGBALO)Object.keys(SACH).forEach(function(k,i){TTGBALO.add(k,i%3+1);});   /* ?thu=demo: tặng sách mẫu (Balo demo, không lưu) */

/* ===== DỮ LIỆU ===== */
var thus=[],rt=null,sel=null,page=0,row0=0,thaList=[];
try{var tl=JSON.parse(localStorage.getItem(KTHA)||'[]');if(Array.isArray(tl))thaList=tl;}catch(e){}
function uid(){return 't'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function demoChiso(k){var c={hp:300+k*37,tc:40+k*7,pt:30+k*5,td:20+(k*11)%60,mm:5+(k*3)%30},n=0;
  PAGES.slice(1).forEach(function(p){p.ds.forEach(function(d){c[d[0]]=((k*7+(n++)*13)%240)/10;});});return c;}   /* chỉ số phụ mẫu 0~24% */
function demoData(){
  var ids=['1a','1b','1d','2a','3a','4a','5a','6a','1c','2b','3b','4b','5b','6b','1e','2c','3c','4c','5c','6j'],bacs=['S','A','B','C','D','SS','E'];
  return ids.map(function(id,i){var k=i+1;
    return {uid:'demo'+i,id:id,tien:1+(i%3),bac:i%2?bacs[i%bacs.length]:undefined,
      chiso:demoChiso(k)};});
}
if(demo){thus=demoData();}
else{try{var v=JSON.parse(localStorage.getItem(KEY)||'[]');if(Array.isArray(v))thus=v.filter(function(t){return t&&t.uid;});rt=localStorage.getItem(KRT)||null;}catch(e){}}
function save(){if(demo)return;try{localStorage.setItem(KEY,JSON.stringify(thus));if(rt)localStorage.setItem(KRT,rt);else localStorage.removeItem(KRT);}catch(e){}}
function byUid(u){for(var i=0;i<thus.length;i++)if(thus[i].uid===u)return thus[i];return null;}
if(rt&&!byUid(rt))rt=null;
function info(t){return (window.THU_MOI&&THU_MOI.byId&&THU_MOI.byId[t.id])||null;}
function tenThu(t){var b=info(t);return t.ten||(b&&b.ten)||'?';}
/* ẢNH THÚ TRONG Ô LƯỚI: đo khung chứa hình thú (bỏ phần trong suốt) rồi phóng vừa ô + căn giữa => thú nhỏ/vừa/lớn đều đầy đặn. Cache theo đường dẫn ảnh. */
var PCV={};
function pcPaint(cv){var u=cv.getAttribute('data-u'),e=PCV[u];
  if(!e){e=PCV[u]={ok:false,w:[],im:new Image()};e.im.onload=function(){try{var tc=document.createElement('canvas');tc.width=tc.height=192;var g=tc.getContext('2d');g.drawImage(e.im,0,0,192,192);var d=g.getImageData(0,0,192,192).data,x0=192,y0=192,x1=-1,y1=-1,i,j;
      for(j=0;j<192;j++)for(i=0;i<192;i++)if(d[(j*192+i)*4+3]>24){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j;}
      if(x1<0){x0=0;y0=0;x1=191;y1=191;}e.b=[x0,y0,x1-x0+1,y1-y0+1];}catch(x){e.b=[0,0,192,192];}
      e.ok=true;e.w.splice(0).forEach(function(c){if(typeof c==='function')c(e);else pcDraw(c,e);});};e.im.src=u;}
  if(e.ok)pcDraw(cv,e);else e.w.push(cv);}
function pcDraw(cv,e){if(!cv.isConnected)return;var g=cv.getContext('2d'),b=e.b,sc=Math.min(184/b[2],184/b[3],4),dw=b[2]*sc,dh=b[3]*sc;
  cv.width=cv.height=192;g.clearRect(0,0,192,192);g.imageSmoothingEnabled=sc<1;if(sc<1)g.imageSmoothingQuality='high';
  g.drawImage(e.im,b[0],b[1],b[2],b[3],(192-dw)/2,(192-dh)/2,dw,dh);}
function anhThu(t){var b=info(t);return b?'thu-game/'+b.zone+'/'+b.slug+'-b'+(t.tien||1)+'-192.png':'';}   /* ảnh 192px, cùng đường dẫn 51-thu-moi.js */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ===== CSS: {n} = n px ảnh (tự co theo --u) ===== */
var css=[
'.tt{--fh:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.tt.on{display:flex}',
'.tt-fr{position:relative;width:min(98vw,calc(96vh*1841/811));aspect-ratio:1841/811;background:url('+IMG+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.tt-fr>*{position:absolute;box-sizing:border-box}',
'.tt button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.tt-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}',   /* vùng bấm trong suốt đè lên nút X vẽ sẵn trong ảnh */
/* TRÁI: tên + ảnh thú */
'.tt-nm{display:flex;align-items:center;justify-content:center;gap:{10};padding:0 {30};font-family:var(--fh);font-weight:800;font-size:{34};line-height:1;white-space:nowrap;overflow:hidden;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7)}',
'.tt-nm i{font-style:normal;font-size:{30};color:#7a1f10}',
'.tt-ph{display:flex;align-items:center;justify-content:center;overflow:hidden}',
'.tt-ph canvas.big{position:relative!important;left:auto!important;top:auto!important;width:100%;height:100%;display:block;pointer-events:none;image-rendering:pixelated}'   /* ghi đè luật chung canvas{position:fixed} của index.html */,
'.tt-ph img{width:{'+ANH_THU+'};height:{'+ANH_THU+'};object-fit:contain;filter:drop-shadow(0 {6} {10} rgba(0,0,0,.55));-webkit-user-drag:none;user-select:none}',
'.tt-eq{padding:0;border:0;border-radius:{26};background:transparent;cursor:pointer}',   /* chữ TRANG BỊ đã vẽ sẵn trong khung: nút chỉ là vùng bấm trong suốt */
'.tt-emp{text-align:center;font-size:{26};line-height:1.45;color:#7c83b8;padding:0 {20}}',
/* GIỮA TRÊN: chỉ số */
'.tt-cap{display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{21};letter-spacing:{1};color:#bfeee8;text-shadow:0 {2} 0 #000}',
'.tt-bar{display:flex;align-items:center;justify-content:space-between;padding:0 {26};font-weight:700;font-size:{25};line-height:1;color:#e8ecff;text-shadow:0 {2} 0 #000;white-space:nowrap}',
'.tt-bar b{font-weight:800;color:#ffe9a0;font-size:{26}}',
'.tt-bar span{color:#bfeee8}',
'.tt-mid{display:flex;align-items:center;justify-content:center;text-align:center;font-size:{24};color:#7c83b8}',
'.tt-pg{display:flex;align-items:center;justify-content:center;padding:0;border-radius:{10};border:{3} solid #c9992f;background:#1d1d5a;color:#ffe9a0;font-size:{36};line-height:1;cursor:pointer}',
'.tt-pg:disabled{opacity:.3;cursor:default}',
/* GIỮA DƯỚI: 6 ô kỹ năng */
'.tt-sk{display:flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:{10};background:transparent;color:#ffd86b;font-size:{78};font-weight:300;line-height:1;text-shadow:0 0 {12} rgba(255,200,80,.6);cursor:pointer}',
'.tt-sk{position:absolute}',
'.tt-sk .n{position:absolute;left:{9};top:{6};font-family:var(--fh);font-weight:800;font-size:{24};line-height:1;color:#ffe9a0;text-shadow:0 0 {4} #000,{1} {1} 0 #000,-{1} {1} 0 #000;pointer-events:none}',
'.tt-sk:active{background:rgba(255,224,102,.18)}',
'.tt-ts{display:none;align-items:center;justify-content:center;text-align:center;padding:0 {14};font-size:{28};font-weight:700;color:#ffe9a0;background:rgba(10,8,40,.94);border:{3} solid #c9992f;border-radius:{12};z-index:9;pointer-events:none}',
/* PHẢI: lưới thú */
'.tt-gr{touch-action:none;user-select:none;-webkit-user-select:none}',
'.tt-gr>*{position:absolute;box-sizing:border-box}',
'.tt-c{padding:0;border:0;background:transparent;cursor:pointer}',
'.tt-c img{position:absolute;left:12%;top:11%;width:76%;height:70%;object-fit:contain;pointer-events:none;-webkit-user-drag:none}',
'.tt-c canvas.pc{position:absolute!important;left:12%!important;top:9%!important;width:76%;height:auto;aspect-ratio:1;pointer-events:none;image-rendering:auto}',
'.tt-c .b{position:absolute;left:{8};top:{2};font-family:"TTGRank","Kaushan Script",cursive;font-weight:400;font-size:{36};line-height:1;color:var(--rl);-webkit-text-stroke:{2} var(--rl);text-shadow:0 0 {3} var(--rc),0 0 {8} var(--rc),0 0 {16} var(--rc);filter:drop-shadow(0 {2} 0 rgba(0,6,40,.85));pointer-events:none}',
'.tt-c .rt{position:absolute;left:8%;right:8%;bottom:{9};height:{25};display:flex;align-items:center;justify-content:center;border-radius:{6};background:linear-gradient(180deg,#ffe58a,#c58a1e);color:#3b2406;font-family:var(--fh);font-weight:800;font-size:{17};line-height:1;white-space:nowrap}',
'.tt-c.sel::after{content:"";position:absolute;left:{3};top:{3};right:{3};bottom:{3};border:{4} solid #ffe066;border-radius:{6};box-shadow:0 0 {16} rgba(255,224,102,.85),inset 0 0 {14} rgba(255,224,102,.4);pointer-events:none}',
/* rãnh + thumb cuộn (phủ kín rãnh vẽ sẵn trong ảnh để không lộ thumb vẽ sẵn ở trên cùng) */
'.tt-rail{border-radius:{9};background:#0d0e34;border:{2} solid #8a6a2a;touch-action:none;cursor:pointer}',
'.tt-th{position:absolute;left:{2};right:{2};border-radius:{7};background:linear-gradient(90deg,#c9992f,#ffe58a,#c9992f);box-shadow:0 0 {6} rgba(255,224,102,.5)}',
/* 3 Ô TRÒN dưới ảnh thú: canvas, chữ bút lông neon (font-rank.woff2 = Kaushan Script cắt nhỏ) */
'.tt-oc{pointer-events:none;image-rendering:auto!important}',
'.tt-hiem{z-index:2;display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{28};line-height:1;white-space:nowrap;border-radius:{18};background:rgba(4,12,40,.78);border:{2} solid currentColor;text-shadow:0 {1} {3} #000;pointer-events:none}',
/* NÚT RA TRẬN */
'.tt-go{padding:0;border:0;border-radius:{18};background:transparent;cursor:pointer}',   /* chữ RA TRẬN đã vẽ sẵn trong khung: nút chỉ là vùng bấm trong suốt */
'.tt-tha{padding:0;border:0;border-radius:{18};background:transparent;cursor:pointer}',   /* chữ THẢ vẽ sẵn trong khung: nút chỉ là vùng bấm trong suốt */
'.tt-go.off,.tt-tha.off{cursor:default}',
/* lớp MỜ / SÁNG: cắt đúng mảnh ảnh khung dưới nút rồi chỉnh độ sáng, viền mờ dần để không lộ hình chữ nhật */
'.tt-dim,.tt-lit{pointer-events:none;background-repeat:no-repeat;opacity:0;transition:opacity .22s ease;-webkit-mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent),linear-gradient(180deg,transparent,#000 9%,#000 91%,transparent);-webkit-mask-composite:source-in;mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent),linear-gradient(180deg,transparent,#000 9%,#000 91%,transparent);mask-composite:intersect}',
'.tt-dim{filter:brightness(.4) saturate(.35)}',
'.tt-dim.on{opacity:.93}',
'.tt-lit{filter:brightness(1.7) saturate(1.25)}',
'.tt-lit.on{opacity:.4;animation:ttLit 1.7s ease-in-out infinite}',
'@keyframes ttLit{0%,100%{opacity:.08}50%{opacity:.42}}',
'.tt-gov{display:none;pointer-events:none;-webkit-user-drag:none;user-select:none}',   /* ảnh nút ĐANG RA TRẬN phủ lên chữ RA TRẬN vẽ sẵn */
/* ô kỹ năng đã gắn + bảng danh sách sách + bảng nổi */
'.tt-sk .ic{display:flex;align-items:center;justify-content:center;font-size:{62};font-weight:400;line-height:1;text-shadow:none}',
'.tt-sk .ic img{width:{74};height:{74};object-fit:contain}',
'.tt-ov{display:none;background:rgba(3,4,18,.55);z-index:6;border-radius:{20}}',
'.tt-pop{display:none;z-index:7;flex-direction:column;padding:{18};color:#e8ecff;font-family:var(--fh);background:linear-gradient(180deg,rgba(44,40,118,.97),rgba(14,14,52,.98));border:{4} solid #d9a93c;border-radius:{18};box-shadow:0 0 {30} rgba(0,0,0,.7),inset 0 0 {24} rgba(120,110,255,.25)}',
'.tt-pop.img{background:center/100% 100% no-repeat;border:0;box-shadow:none;padding:{70} {60}}',
'.tt-pt{font-weight:800;font-size:{30};line-height:1.15;color:#ffe9a0;text-align:center;margin-bottom:{12};text-shadow:0 {2} 0 #000}',
'.tt-pl{flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;scrollbar-width:none}',
'.tt-pl::-webkit-scrollbar{display:none}',
'.tt-pe{display:flex;align-items:center;justify-content:center;height:100%;text-align:center;font-size:{26};line-height:1.4;color:#7c83b8}',
'.tt-pr{display:flex;align-items:center;gap:{14};height:{84};margin-bottom:{8};padding:0 {14};border:{2} solid #b88a2e;border-radius:{10};background:linear-gradient(90deg,rgba(66,54,150,.7),rgba(24,24,80,.7));cursor:pointer}',
'.tt-pr:active{box-shadow:0 0 0 {2} #ffe066}',
'.tt-pr.dis{opacity:.5}',
'.tt-pr .i,.tt-ii .i{display:flex;align-items:center;justify-content:center;flex:none;width:{60};height:{60};font-size:{40};border-radius:{8};background:rgba(8,8,40,.72)}',
'.tt-pr .i img,.tt-ii .i img{width:80%;height:80%;object-fit:contain}',
'.tt-pr .n{flex:1;font-weight:700;font-size:{27};min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}',
'.tt-pr .q{font-weight:800;font-size:{27};color:#bfeee8}',
'.tt-pr .g{font-size:{19};color:#ffe9a0}',
'.tt-ii{display:flex;flex-direction:column;align-items:center;flex:1;min-height:0;overflow:hidden;text-align:center}',
'.tt-ii .i{width:{128};height:{128};font-size:{84};border:{3} solid #c9992f;border-radius:{14};background:radial-gradient(circle at 50% 35%,#34348f,#12123a)}',
'.tt-ii .n{margin-top:{12};font-weight:800;font-size:{34};line-height:1.15;color:#ffe9a0}',
'.tt-ii .m{margin-top:{6};font-size:{23};color:#9fe8de}',
'.tt-ii .d{margin-top:{12};font-size:{25};line-height:1.4;color:#cfd6ff;overflow:hidden}',
'.tt-pb{display:flex;justify-content:center;gap:{22};margin-top:{14}}',
'.tt-pb button{min-width:{150};height:{58};padding:0 {18};border-radius:{10};border:{2} solid #c9992f;background:#1d1d5a;color:#ffe9a0;font-family:var(--fh);font-weight:800;font-size:{28};cursor:pointer}',
'.tt-pb button.p{background:linear-gradient(180deg,#ffe58a,#c58a1e);color:#3b2406}',
'.tt-pb button.d{background:#6b1f2e;border-color:#e0707e;color:#ffd9dd}',
'.tt-pb button.p:active{filter:brightness(1.08)}'
].join('\n').replace(/\{(\d+(?:\.\d+)?)\}/g,'calc(var(--u)*$1)');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
/* font bút lông cho chữ Rank / số: file nhúng sẵn trong repo (không cần mạng) */
var ff=document.createElement('style');ff.textContent='@font-face{font-family:"TTGRank";src:url("game-moi/font-rank.woff2?v=1") format("woff2");font-display:block}';document.head.appendChild(ff);

/* ===== DỰNG PANEL (một lần) ===== */
function box(c,x,y,w,h){var s=c.style;s.left=(x/BW*100)+'%';s.top=(y/BH*100)+'%';s.width=(w/BW*100)+'%';s.height=(h/BH*100)+'%';return c;}
function mk(tag,cls,x,y,w,h,txt){var c=document.createElement(tag);if(cls)c.className=cls;if(txt!=null)c.textContent=txt;if(w)box(c,x,y,w,h);fr.appendChild(c);return c;}
/* đặt phần tử con theo pixel ảnh, tính trong khung cha có gốc (ox,oy) cỡ (W,H) */
function boxIn(c,x,y,w,h,ox,oy,W,H){var s=c.style;s.left=((x-ox)/W*100)+'%';s.top=((y-oy)/H*100)+'%';s.width=(w/W*100)+'%';s.height=(h/H*100)+'%';return c;}
/* KHÔNG PHÓNG TO QUÁ CỠ GỐC: chiều rộng khung tối đa = BW / devicePixelRatio (CSS px) => đúng 1 pixel ảnh = 1 pixel màn hình, nét nhất.
   Màn nhỏ hơn thì tự thu nhỏ lại. Muốn khung to hơn (đổi nét lấy kích thước): đổi MAXSCALE lên >1 (vd 1.3). */
var MAXSCALE=1;
function unit(){if(!fr)return;var d=window.devicePixelRatio||1;fr.style.maxWidth=(BW*MAXSCALE/d)+'px';fr.style.setProperty('--u',(fr.clientWidth/UB)+'px');}
var tt=0,lastDrag=0;
function toast(t){if(window.TTGTBAO){TTGTBAO.toast(t,1500);return;}E.ts.textContent=t;E.ts.style.display='flex';clearTimeout(tt);tt=setTimeout(function(){E.ts.style.display='none';},1500);}

/* cắt mảnh ảnh khung theo box {x,y,w,h} (px ảnh), nới DIM_PAD mỗi bên, làm lớp phủ cùng chỗ (dùng cho mờ/sáng nút vẽ sẵn) */
function bake(cls,b){
  var x=Math.max(0,b.x-DIM_PAD),y=Math.max(0,b.y-DIM_PAD),w=Math.min(BW-x,b.w+DIM_PAD*2),h=Math.min(BH-y,b.h+DIM_PAD*2);
  var c=mk('div',cls,x,y,w,h),s=c.style;
  s.backgroundImage='url('+IMG+')';
  s.backgroundSize=(BW/w*100)+'% '+(BH/h*100)+'%';
  s.backgroundPosition=(BW>w?x/(BW-w)*100:0)+'% '+(BH>h?y/(BH-h)*100:0)+'%';
  return c;
}
function build(){
  var i,j;
  root=document.createElement('div');root.className='tt';
  fr=document.createElement('div');fr.className='tt-fr';root.appendChild(fr);
  /* nút X đã vẽ sẵn trong ảnh (tâm ~ x1738,y100 trên ảnh đã cắt): chỉ đặt vùng bấm trong suốt đè lên, đường kính 136 */
  var x=mk('button','tt-x',1670,32,136,136);x.type='button';x.setAttribute('aria-label','Đóng');x.addEventListener('click',close);

  /* --- TRÁI: thanh vàng tên + bậc (x164-566,y176-229), ảnh thú trong ô lớn (x168-558,y241-570) --- */
  E.nm=mk('div','tt-nm',200,181,330,44);
   E.hiem=mk('div','tt-hiem',283,249,160,32);   /* nhãn ĐỘ HIẾM loài: giữa mép trên ô ảnh thú */
  E.ph=mk('div','tt-ph',168,241,390,329);
  /* nút TIẾN HÓA (trước là TRANG BỊ): vùng bấm trong suốt đè lên tấm vàng "Tiến Hóa" vẽ sẵn dưới ô ảnh thú (x209-522,y575-632). Bấm = mở khung Tiến Hóa Thú (72-khung-ren-cuong-hoa.js). Khung Trang bị vẫn mở được từ nút Trang bị ở hàng nút dưới. */
  var eq=mk('button','tt-eq',215,578,300,52);eq.type='button';eq.setAttribute('aria-label','Tiến Hóa');
  eq.addEventListener('click',function(){if(window.TTGKH)TTGKH.open('th');else toast('Sắp có');});
  /* 3 ô tròn bên dưới (tâm (241,695),(367,695),(498,695), bán kính ~60): ô 1 = Lv, ô 2 = Bậc tiến hóa (1-3), ô 3 = Rank (E,D,C,B,A,S,SS,SR) */
  E.oc=[0,1,2].map(function(k){var c=mk('canvas','tt-oc',OC_X[k]-52,OC_Y-52,104,104);c.width=c.height=208;return c;});   /* canvas 208x208 = 2x để nét; chữ căn giữa theo NÉT CHỮ THẬT (renderBadges) */

  /* --- GIỮA TRÊN: chữ trang + 5 thanh chỉ số + 2 nút ‹ › --- */
  E.cap=mk('div','tt-cap',960,170,290,26);E.cap.style.justifyContent='flex-end';   /* khung mới hết chỗ phía trên 5 thanh: chữ tên trang đặt ở dải trống trên bảng, canh phải để tránh mặt trang trí giữa */
  E.bars=[];
  for(i=0;i<5;i++)E.bars.push(mk('div','tt-bar',BAR_X,BAR_Y+BAR_DY*i,BAR_W,BAR_H));
  E.mid=mk('div','tt-mid',772,300,374,110);   /* chữ báo trang trống (vd "Chưa có chỉ số phụ") */
  E.pv=mk('button','tt-pg',696,287,52,50,'‹');E.pv.type='button';E.pv.setAttribute('aria-label','Trang trước');
  E.nx=mk('button','tt-pg',1172,287,52,50,'›');E.nx.type='button';E.nx.setAttribute('aria-label','Trang sau');
  E.pv.addEventListener('click',function(){if(page>0){page--;renderStats();}});
  E.nx.addEventListener('click',function(){if(page<PAGES.length-1){page++;renderStats();}});

  /* --- GIỮA DƯỚI: 6 ô gắn kỹ năng (CHƯA làm chức năng: bấm "+" chỉ báo "Sắp có") --- */
  E.sk=[];
  for(j=0;j<2;j++)for(i=0;i<3;i++){var s=mk('button','tt-sk',SK_X[i],SK_Y[j],SK_S,SK_S);s.type='button';s.setAttribute('aria-label','Kỹ năng '+(j*3+i+1));E.sk.push(s);   /* nội dung (số thứ tự + dấu + hoặc icon kỹ năng) do renderSkills vẽ */
    (function(k){s.addEventListener('click',function(){moSlot(k);});})(j*3+i);}   /* k = số ô 0..5 */
  E.ts=mk('div','tt-ts',740,686,440,46);

  /* --- PHẢI: lưới 4x4 thú (cuộn theo hàng) + rãnh cuộn --- */
  var gx=GR_X[0],gy=GR_Y[0],gw=GR_X[3]+GR_W-gx,gh=GR_Y[3]+GR_H-gy;
  E.gr=mk('div','tt-gr',gx,gy,gw,gh);
  E.cells=[];
  for(j=0;j<4;j++)for(i=0;i<4;i++){var c=document.createElement('button');c.type='button';c.className='tt-c';boxIn(c,GR_X[i],GR_Y[j],GR_W,GR_H,gx,gy,gw,gh);
    (function(k){c.addEventListener('click',function(){if(performance.now()-lastDrag<250)return;var t=thus[(row0+((k/4)|0))*4+k%4];if(t){hidePop();sel=t.uid;render();}});})(j*4+i);
    E.gr.appendChild(c);E.cells.push(c);}
  E.rail=mk('div','tt-rail',RAIL.x,RAIL.y,RAIL.w,RAIL.h);
  E.th=document.createElement('div');E.th.className='tt-th';E.rail.appendChild(E.th);
  gridScroll();

  /* --- 2 NÚT DƯỚI-PHẢI: RA TRẬN và THẢ (tấm vàng đã vẽ sẵn chữ trong khung). Mỗi nút gồm: lớp MỜ (.tt-dim) + lớp SÁNG (.tt-lit, chỉ THẢ) + ảnh 'Đang ra trận' (chỉ RA TRẬN) + nút bấm trong suốt.
     Lớp dim/lit dựng TRƯỚC nút bấm để nút luôn nằm trên cùng. --- */
  E.goDim=bake('tt-dim',GO);E.thaDim=bake('tt-dim',THA);E.thaLit=bake('tt-lit',THA);
  E.gov=mk('img','tt-gov',GO_OV.x,GO_OV.y,GO_OV.w,GO_OV.h);E.gov.src=OV_GOV;E.gov.alt='';E.gov.draggable=false;   /* ảnh nút ĐANG RA TRẬN đè lên nút RA TRẬN, giống ảnh MỞ KHÓA ở Balo */
  E.go=mk('button','tt-go',GO.x,GO.y,GO.w,GO.h);E.go.setAttribute('aria-label','Ra trận');E.go.type='button';
  E.go.addEventListener('click',function(){if(sel&&sel!==rt){rt=sel;save();render();}});
  E.tha=mk('button','tt-tha',THA.x,THA.y,THA.w,THA.h);E.tha.setAttribute('aria-label','Thả');E.tha.type='button';
  E.tha.addEventListener('click',function(){
    var t=byUid(sel);if(!t)return;
    if(t.uid===rt){toast('Thú đang ra trận, không thể thả');return;}
    moTha(t);
  });

  buildPop();
  document.body.appendChild(root);
  /* bấm ra ngoài khung thì đóng (chặn 400ms đầu để cú chạm mở nút không đóng luôn) + phím Esc */
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape'){if(popOn())hidePop();else close();}});   /* Esc: đóng bảng nổi trước, rồi mới đóng panel */
  window.addEventListener('resize',unit);
}

/* ===== CUỘN LƯỚI THEO HÀNG: lăn chuột / vuốt-kéo dọc trong lưới / kéo thumb hoặc bấm rãnh ===== */
function maxRow(){return Math.max(0,Math.ceil(thus.length/4)-4);}
function setRow(r){r=Math.max(0,Math.min(maxRow(),r));if(r!==row0){row0=r;renderGrid();}}
function gridScroll(){
  var acc=0,dn=null;
  E.gr.addEventListener('wheel',function(e){
    if(!maxRow())return;e.preventDefault();
    acc+=e.deltaY*(e.deltaMode===1?40:1);
    while(acc>=60){setRow(row0+1);acc-=60;}
    while(acc<=-60){setRow(row0-1);acc+=60;}
  },{passive:false});
  E.gr.addEventListener('pointerdown',function(e){dn={y:e.clientY,row:row0,id:e.pointerId,drag:false};});
  E.gr.addEventListener('pointermove',function(e){
    if(!dn)return;var dy=e.clientY-dn.y;
    if(!dn.drag&&Math.abs(dy)>8){dn.drag=true;try{E.gr.setPointerCapture(dn.id);}catch(x){}}   /* chỉ bắt con trỏ khi đã kéo thật, để bấm ô vẫn nhận click */
    if(dn.drag)setRow(dn.row-Math.round(dy/(107.3*fr.clientWidth/BW)));   /* 107.3 = khoảng cách giữa 2 hàng (px ảnh) */
  });
  function up(){if(dn&&dn.drag)lastDrag=performance.now();dn=null;}
  E.gr.addEventListener('pointerup',up);E.gr.addEventListener('pointercancel',up);
  /* rãnh: bấm / kéo = nhảy tới hàng tương ứng */
  var rd=false;
  function rowAt(e){var r=E.rail.getBoundingClientRect();setRow(Math.round(Math.max(0,Math.min(1,(e.clientY-r.top)/r.height))*maxRow()));}
  E.rail.addEventListener('pointerdown',function(e){rd=true;try{E.rail.setPointerCapture(e.pointerId);}catch(x){}rowAt(e);});
  E.rail.addEventListener('pointermove',function(e){if(rd)rowAt(e);});
  E.rail.addEventListener('pointerup',function(){rd=false;});E.rail.addEventListener('pointercancel',function(){rd=false;});
}

/* ===== VẼ LẠI ===== */
function renderGrid(){
  var mr=maxRow(),i;
  if(row0>mr)row0=mr;
  for(i=0;i<16;i++){
    var t=thus[row0*4+i],c=E.cells[i];
    if(t){
      var a=anhThu(t);
      c.innerHTML=(window.TTGTBAO&&t.bac?TTGTBAO.fx(t.bac,4):'')+(a?'<canvas class="pc" width="192" height="192" data-u="'+esc(a)+'"></canvas>':'')+'<span class="b'+(t.bac==='SR'?' sr':'')+'" style="--rc:'+RKC[RKC[t.bac]?t.bac:'C'][0]+';--rl:'+RKC[RKC[t.bac]?t.bac:'C'][1]+'">'+(RKC[t.bac]?t.bac:'C')+'</span>'+(t.uid===rt?'<span class="rt">Ra trận</span>':'');
      var pc=c.querySelector('canvas.pc');if(pc)pcPaint(pc);
      c.setAttribute('aria-label',tenThu(t));c.style.pointerEvents='';
    }else{c.innerHTML='';c.removeAttribute('aria-label');c.style.pointerEvents='none';}
    c.classList.toggle('sel',!!t&&t.uid===sel);
  }
  /* thumb: cao theo tỉ lệ 4 hàng / tổng số hàng (tối thiểu 12%); không cuộn được thì thumb phủ kín rãnh */
  var tot=Math.max(4,Math.ceil(thus.length/4)),hp=Math.max(12,4/tot*100),tp=mr?(100-hp)*row0/mr:0;
  E.th.style.height=hp+'%';E.th.style.top=tp+'%';
}
function renderStats(){
  var t=byUid(sel),pg=PAGES[page],i;
  E.cap.textContent=pg.ten+' ('+(page+1)+'/'+PAGES.length+')';
  E.pv.disabled=page<=0;E.nx.disabled=page>=PAGES.length-1;
  for(i=0;i<5;i++){
    var d=pg.ds[i],b=E.bars[i];
    if(d&&t){var cs=t.chiso;if(!(cs&&Object.keys(cs).some(function(k){return cs[k]>0;}))&&window.TTGCS){try{cs=TTGCS.tinh(t);}catch(e){cs=t.chiso;}}var base=cs,ra=t.uid===rt&&window.TTGLT&&TTGLT.apDung;if(ra){try{cs=TTGLT.apDung(Object.assign({},cs));}catch(e){cs=base;}}   /* thú ĐANG RA TRẬN: cộng chỉ số trang bị đang mặc (giống lúc vào trận) */
    var v=cs&&cs[d[0]],b0=base&&base[d[0]],dl=(ra&&v!=null&&b0!=null)?Math.round((v-b0)*10)/10:0;b.innerHTML='<b>'+esc(d[1])+'</b><span>'+(v==null?'-':esc(v)+(d[2]||''))+(dl>0?'<i style="font-style:normal;font-size:.82em;color:#8dffb0;margin-left:.35em">+'+esc(dl)+(d[2]||'')+'</i>':'')+'</span>';}
    else if(d){b.innerHTML='<b>'+esc(d[1])+'</b><span>-</span>';}
    else b.innerHTML='';
  }
  E.mid.textContent=pg.ds.length?'':'Chưa có '+pg.ten.toLowerCase();
}
/* ẢNH THÚ LỚN: đo khung chứa thân thú (bỏ phần trong suốt) rồi phóng vừa khung + căn giữa => thú nhỏ/vừa/lớn đều đầy đặn như ô trong kho. BIG_FILL = tỉ lệ khung được dùng; BIG_MAX = hệ số phóng tối đa (ảnh gốc 192px nên quá cao sẽ vỡ hạt) */
var BIG_FILL=.92,BIG_MAX=7;
function bigPaint(cv,u){
  var d=document.createElement('canvas');d.setAttribute('data-u',u);pcPaint(d);var e=PCV[u];
  function go(e){if(!cv.isConnected||cv.getAttribute('data-u')!==u)return;var g=cv.getContext('2d'),b=e.b,W=cv.width,H=cv.height,sc=Math.min(W*BIG_FILL/b[2],H*BIG_FILL/b[3],BIG_MAX*2),dw=b[2]*sc,dh=b[3]*sc;
    g.clearRect(0,0,W,H);g.imageSmoothingEnabled=false;
    g.shadowColor='rgba(0,0,0,.55)';g.shadowBlur=14;g.shadowOffsetY=6;
    g.drawImage(e.im,b[0],b[1],b[2],b[3],Math.round((W-dw)/2),Math.round((H-dh)/2),Math.round(dw),Math.round(dh));}
  if(e.ok)go(e);else e.w.push(go);
}
function renderLeft(){
  var t=byUid(sel);
  if(t){E.nm.textContent=tenThu(t);   /* khung vàng chỉ hiện tên */
    var a=anhThu(t);E.ph.innerHTML=a?'<canvas class="big" width="780" height="658" data-u="'+esc(a)+'" aria-label="'+esc(tenThu(t))+'"></canvas>':'';var bc=E.ph.querySelector('canvas.big');if(bc)bigPaint(bc,a);}
  else{E.nm.textContent='Chưa Có Thú';E.ph.innerHTML='<div class="tt-emp">Chưa có thú nào<br>Bắt thú để cất vào đây</div>';}
  renderBadges(t);
  renderHiem(t);
}
/* 3 ô tròn: Lv / Bậc / Rank. VẼ BẰNG CANVAS và căn giữa theo khung NÉT CHỮ thật (actualBoundingBox) nên chữ nghiêng/bút lông vẫn nằm giữa vòng.
   Rank thiếu thì coi là C. Màu neon: [màu phát sáng, màu lõi]. SR (cực hiếm): chữ tô gradient cầu vồng (rb:true). */
var RKC={E:['#ffffff','#ffffff'],D:['#39ff14','#7dff5e'],C:['#00d0ff','#3de0ff'],B:['#cc33ff','#dd77ff'],A:['#ffe600','#fff24d'],S:['#ff8000','#ffa63d'],SS:['#ff1744','#ff5472'],SR:['#ff4fd8','#ffd1f6']};
var F_BR='"TTGRank","Kaushan Script","Brush Script MT",cursive',F_LB='700 {S}px "Noto Serif","Palatino Linotype",Georgia,serif';
function ocBox(g,txt,font){g.font=font;var m=g.measureText(txt);return {l:-m.actualBoundingBoxLeft,r:m.actualBoundingBoxRight,a:m.actualBoundingBoxAscent,d:m.actualBoundingBoxDescent};}
function rbGrad(g,x0,x1){var gr=g.createLinearGradient(x0,0,x1,0),c=['#ff3b3b','#ffb300','#fff04d','#3dff6a','#00d0ff','#8a5cff','#ff3bd4'],i;for(i=0;i<c.length;i++)gr.addColorStop(i/(c.length-1),c[i]);return gr;}
/* items: [{t,font,core,glow,sz?,maxW?,rb?}] xếp dọc, cả khối căn giữa canvas. maxW: thu nhỏ chữ nếu rộng quá. */
function ocDraw(cv,items,gap){
  var g=cv.getContext('2d'),W=cv.width,H=cv.height,cx=W/2,cy=H/2,i,b=[],tot=0;
  g.clearRect(0,0,W,H);g.textBaseline='alphabetic';g.lineJoin='round';
  for(i=0;i<items.length;i++){var it=items[i],sz=it.sz,bx=ocBox(g,it.t,it.font.replace('{S}',sz));
    if(it.maxW&&bx.r-bx.l>it.maxW){sz=Math.floor(sz*it.maxW/(bx.r-bx.l));bx=ocBox(g,it.t,it.font.replace('{S}',sz));}
    it.fs=it.font.replace('{S}',sz);b.push(bx);tot+=bx.a+bx.d+(i?gap:0);}
  var y=cy-tot/2;
  for(i=0;i<items.length;i++){var it=items[i],bx=b[i],x=cx-(bx.l+bx.r)/2,base=y+bx.a,cf=it.rb?rbGrad(g,x+bx.l,x+bx.r):it.core;
    g.font=it.fs;g.shadowColor='transparent';g.shadowBlur=0;
    g.lineWidth=it.lw||5;g.strokeStyle='rgba(0,6,40,.9)';g.strokeText(it.t,x,base+3);   /* bóng tối phía dưới cho nổi trên nền xanh */
    if(it.glow){g.fillStyle=cf;[34,20,10,4].forEach(function(s){g.shadowColor=it.glow;g.shadowBlur=s;g.fillText(it.t,x,base);});}
    g.shadowColor='transparent';g.shadowBlur=0;
    g.strokeStyle=cf;g.lineWidth=it.lw2||3;g.strokeText(it.t,x,base);g.fillStyle=cf;g.fillText(it.t,x,base);   /* lõi: stroke cùng màu làm nét bút đậm hơn */
    y+=bx.a+bx.d+gap;}
}
function renderHiem(t){if(!E.hiem)return;var h=t&&window.TTGCS&&TTGCS.hiemInfo?TTGCS.hiemInfo(t.id):null;E.hiem.style.display=h?'flex':'none';if(h){E.hiem.textContent=h.ten;E.hiem.style.color=h.mau;}}
function renderBadges(t){if(E.oc)drawBadges(E.oc,t);}
/* vẽ 3 ô Lv/Bậc/Rank vào 3 canvas 208x208 (cvs). Dùng chung cho khung Trang Bị (55-trang-bi.js) qua TTGTHU.badges */
function drawBadges(cvs,t){
  if(!t){cvs.forEach(function(c){c.getContext('2d').clearRect(0,0,c.width,c.height);});return;}
  var lv=Math.max(1,Math.floor(t.lv||1)),tien=Math.min(3,Math.max(1,Math.floor(t.tien||1))),bac=RKC[t.bac]?t.bac:'C',rc=RKC[bac];
  var lab=function(s){return {t:s,font:F_LB,sz:40,core:'#c9fbff',glow:'#00c8ff',lw:6,lw2:1};};
  var num=function(s){return {t:String(s),font:'400 {S}px '+F_BR,sz:82,maxW:88,core:'#fff7b0',glow:'#ffb800'};};
  ocDraw(cvs[0],[lab('Lv'),num(lv)],4);
  ocDraw(cvs[1],[{t:'V'+tien,font:'400 {S}px '+F_BR,sz:104,maxW:92,core:'#fff7b0',glow:'#ffb800'}],0);   /* ô giữa: V1/V2/V3 (dạng tiến hóa) */
  ocDraw(cvs[2],[{t:bac,font:'400 {S}px '+F_BR,sz:124,maxW:96,core:rc[1],glow:rc[0],lw:7,lw2:4,rb:bac==='SR'}],0);
}
if(document.fonts&&document.fonts.load){document.fonts.load('40px TTGRank','EDCBASSR0123456789').then(function(){if(root)render();}).catch(function(){});}   /* font nạp xong thì vẽ lại */
function renderGo(){
  var on=!!sel&&sel===rt,t=!!byUid(sel);
  E.gov.style.display=on?'block':'none';   /* chữ RA TRẬN vẽ sẵn không đổi được: đang ra trận thì phủ tấm "Đang ra trận" lên */
  E.go.disabled=!sel||on;
  E.goDim.classList.toggle('on',!sel);   /* chưa chọn thú: làm mờ tấm RA TRẬN */
  /* THẢ: chỉ SÁNG khi chọn thú CHƯA ra trận. Mờ khi không chọn gì HOẶC thú chọn đã ra trận. (aria-disabled thay vì disabled để bấm vào còn báo lý do) */
  var can=t&&sel!==rt;
  E.tha.setAttribute('aria-disabled',can?'false':'true');E.tha.classList.toggle('off',!can);
  E.thaDim.classList.toggle('on',!can);E.thaLit.classList.toggle('on',!!can);
}
function render(){if(!root)return;renderLeft();renderStats();renderGrid();renderGo();renderSkills();}

/* ===== KỸ NĂNG: 6 ô + danh sách sách + bảng nổi (5a) ===== */
function knOf(t){if(!Array.isArray(t.kn))t.kn=[];while(t.kn.length<NSK)t.kn.push(null);return t.kn;}
function sachOf(id){return (window.TTGBALO&&TTGBALO.CAT&&TTGBALO.CAT[id])||SACH[id]||null;}
function icSach(it){return it?(it.img?'<img src="'+esc(it.img)+'" alt="">':esc(it.ic||'?')):'?';}
function renderSkills(){
  var t=byUid(sel),kn=t?knOf(t):[];
  E.sk.forEach(function(b,k){
    var id=kn[k],it=id&&sachOf(id);
    b.innerHTML='<span class="n">'+(k+1)+'</span>'+(id?'<span class="ic">'+icSach(it)+'</span>':'+');
    b.classList.toggle('co',!!id);
    b.setAttribute('aria-label',id?(it&&it.kn)||'Kỹ năng':'Gắn kỹ năng '+(k+1));
  });
}
function buildPop(){
  E.ov=mk('div','tt-ov',0,0,BW,BH);
  E.ls=mk('div','tt-pop',POP_LS.x,POP_LS.y,POP_LS.w,POP_LS.h);
  E.in=mk('div','tt-pop',POP_IN.x,POP_IN.y,POP_IN.w,POP_IN.h);
  if(NOI_IMG){E.in.classList.add('img');E.in.style.backgroundImage='url('+NOI_IMG+')';}   /* có ảnh khung bảng nổi thì dùng */
  E.ov.addEventListener('click',function(){if(E.in.style.display==='flex')E.in.style.display='none';else hidePop();});   /* bấm nền tối: đóng bảng nổi trước, rồi tới danh sách */
}
function popOn(){return !!E.ov&&E.ov.style.display==='block';}
function hidePop(){if(!E.ov)return;E.ov.style.display=E.ls.style.display=E.in.style.display='none';}
/* bấm ô kỹ năng k: trống -> mở danh sách sách; đã gắn -> bảng nổi (Gỡ/Đóng) */
function moSlot(k){
  var t=byUid(sel);if(!t){toast('Chưa có thú');return;}
  var id=knOf(t)[k];
  if(id)moInfo(id,k,'go');else moList(k);
}
function moList(k){
  var t=byUid(sel),kn=knOf(t),C=(window.TTGBALO&&TTGBALO.CAT)||{},rows=[];
  Object.keys(C).forEach(function(id){if(C[id].loai==='sach'&&TTGBALO.count(id)>0)rows.push(id);});
  var h='<div class="tt-pt">Chọn sách kỹ năng · Ô '+(k+1)+'</div><div class="tt-pl">';
  if(!rows.length)h+='<div class="tt-pe">Balo chưa có sách kỹ năng</div>';
  rows.forEach(function(id){var it=C[id],co=kn.indexOf(id)>=0;
    h+='<div class="tt-pr'+(co?' dis':'')+'" data-id="'+esc(id)+'"><span class="i">'+icSach(it)+'</span><span class="n">'+esc(it.ten)+'</span>'+(co?'<span class="g">Đã gắn</span>':'')+'<span class="q">x'+TTGBALO.count(id)+'</span></div>';});
  h+='</div><div class="tt-pb"><button type="button">Đóng</button></div>';
  E.ls.innerHTML=h;
  var pl=E.ls.querySelectorAll('.tt-pr');
  for(var i=0;i<pl.length;i++)(function(r){r.addEventListener('click',function(){moInfo(r.getAttribute('data-id'),k,'dung');});})(pl[i]);
  E.ls.querySelector('.tt-pb button').addEventListener('click',hidePop);
  E.in.style.display='none';E.ov.style.display='block';E.ls.style.display='flex';
}
/* bảng nổi thông tin kỹ năng. mode 'dung' (từ danh sách): Dùng/Đóng. mode 'go' (ô đã gắn): Gỡ/Đóng. */
function moInfo(id,k,mode){
  var it=sachOf(id),t=byUid(sel);if(!it||!t)return;
  if(window.TTGTBAO){TTGTBAO.info({icon:icSach(it),title:esc(it.kn||it.ten),tc:'y',sub:esc(it.ten)+(it.he&&window.TTGCS&&TTGCS.heVi?' · Hệ '+TTGCS.heVi(it.he):'')+(it.cd?' · Hồi chiêu '+it.cd+' lượt':''),text:esc(it.moNgan||it.mo||'')},
   [{t:mode==='go'?'Gỡ':'Dùng',cls:mode==='go'?'d':'',cb:function(){mode==='go'?go(k):dung(id,k);}},{t:'Đóng',cb:function(){if(mode==='go')hidePop();}}]);return;}
  E.in.innerHTML='<div class="tt-ii"><span class="i">'+icSach(it)+'</span><div class="n">'+esc(it.kn||it.ten)+'</div><div class="m">'+esc(it.ten)+(it.he&&window.TTGCS&&TTGCS.heVi?' · Hệ '+TTGCS.heVi(it.he):'')+(it.cd?' · Hồi chiêu '+it.cd+' lượt':'')+'</div><div class="d">'+esc(it.moNgan||it.mo||'')+'</div></div>'
   +'<div class="tt-pb"><button type="button" class="'+(mode==='go'?'d':'p')+'">'+(mode==='go'?'Gỡ':'Dùng')+'</button><button type="button">Đóng</button></div>';
  var bs=E.in.querySelectorAll('button');
  bs[0].addEventListener('click',function(){mode==='go'?go(k):dung(id,k);});
  bs[1].addEventListener('click',function(){E.in.style.display='none';if(mode==='go')hidePop();});
  E.ov.style.display='block';E.in.style.display='flex';
}
/* DÙNG: trừ 1 sách ở Balo, gắn vào ô k (mỗi kỹ năng chỉ gắn 1 lần trên 1 thú) */
function dung(id,k){
  var t=byUid(sel);if(!t)return;var kn=knOf(t);
  if(kn[k]){toast('Ô này đã có kỹ năng');return;}
  if(kn.indexOf(id)>=0){toast('Thú đã có kỹ năng này');return;}
  if(!window.TTGBALO||TTGBALO.count(id)<=0){toast('Balo hết sách này');return;}
  var bk=sachOf(id);if(bk&&bk.he&&window.TTGCS&&TTGCS.mangDuocSach&&!TTGCS.mangDuocSach(t.id,bk.he)){toast('Thú không cùng hệ với sách này');return;}   /* sách có hệ: chỉ thú có hệ chính/phụ trùng mới gắn */
  TTGBALO.add(id,-1);kn[k]=id;save();hidePop();renderSkills();toast('Đã gắn kỹ năng');
}
/* GỠ: trả sách về Balo, trống ô k */
function go(k){
  var t=byUid(sel);if(!t)return;var kn=knOf(t),id=kn[k];if(!id)return;
  if(window.TTGBALO)TTGBALO.add(id,1);kn[k]=null;save();hidePop();renderSkills();toast('Đã gỡ, sách về Balo');
}

/* ===== THẢ THÚ: bỏ hẳn khỏi kho. Hỏi xác nhận (dùng bảng nổi E.in). Thú đang ra trận KHÔNG thả được. ===== */
/* Cảnh báo theo Rank (chữ đỏ = nặng). Rank thiếu coi là C như trong kho. */
var THA_CB={
  E:['','Thú Rank E rất phổ biến, nhưng thả đi vẫn không lấy lại được.'],
  D:['','Thú Rank D khá phổ biến, nhưng thả đi vẫn không lấy lại được.'],
  C:['','Thú Rank C: thả đi sẽ không lấy lại được.'],
  B:['o','⚠ Thú Rank B khá mạnh, hãy cân nhắc kỹ trước khi thả.'],
  A:['o','⚠ Thú Rank A rất mạnh và khó kiếm, hãy cân nhắc kỹ!'],
  S:['r','⚠ Thú Rank S cực hiếm! Thả đi là mất vĩnh viễn.'],
  SS:['r','⚠ Thú Rank SS huyền thoại! Thả đi là mất vĩnh viễn.'],
  SR:['r','⚠ Thú Rank SR cực kỳ hiếm (khoảng 1/1000)! Thả đi là mất vĩnh viễn, gần như không thể kiếm lại.']
};
function moTha(t){
  var a=anhThu(t),rk=RKC[t.bac]?t.bac:'C',lv=Math.max(1,Math.floor(t.lv||1)),tien=Math.min(3,Math.max(1,Math.floor(t.tien||1))),cb=THA_CB[rk],
   mn=(window.TTGTH&&TTGTH.tenManh)?TTGTH.tenManh(t.id):'',   /* tên Mảnh của loài này ('' nếu loài chưa có item Mảnh) */
   mh=mn?'<br>Thả sẽ nhận <b>1 '+esc(mn)+'</b> (dùng để tiến hóa).':'';
  if(window.TTGTBAO){
    var tit='Bạn chắc chắn muốn thả <b>'+esc(tenThu(t))+'</b> <span style="color:#fff3c4">Lv.'+lv+' · V'+tien+' · Rank</span> '+TTGTBAO.rankHtml(rk)+'?';
    var txt='Thú sẽ rời khỏi kho và không lấy lại được. Sách kỹ năng đang gắn (nếu có) được trả về Balo.'+mh+'<br><span class="'+(cb[0]?'tbo-w'+(cb[0]==='r'?' r':''):'')+'">'+cb[1]+'</span>';
    var body=TTGTBAO.info({bac:t.bac,ts:true,icon:(a?'<canvas class="pc" width="192" height="192" data-u="'+esc(a)+'"></canvas>':'?')+TTGTBAO.corner(rk),title:tit,tc:'y',text:txt},
     [{t:'Thả',cls:'d',cb:function(){tha(t.uid);}},{t:'Hủy',cb:function(){hidePop();}}]);
    try{var pc=body.querySelector('.tbo-ic canvas.pc');if(pc)pcPaint(pc);}catch(x){}   /* tự phóng vừa khung: thú nhỏ/vừa/to đều đầy đặn như ô kho */
    return;}
  E.in.innerHTML='<div class="tt-ii"><span class="i">'+(a?'<img src="'+esc(a)+'" alt="">':'?')+'</span><div class="n">Thả '+esc(tenThu(t))+'?</div><div class="d">Thú sẽ rời khỏi kho và không lấy lại được. Sách kỹ năng đang gắn (nếu có) được trả về Balo.'+mh+'</div></div>'
   +'<div class="tt-pb"><button type="button" class="d">Thả</button><button type="button">Hủy</button></div>';
  var bs=E.in.querySelectorAll('button');
  bs[0].addEventListener('click',function(){tha(t.uid);});
  bs[1].addEventListener('click',function(){hidePop();});
  E.ls.style.display='none';E.ov.style.display='block';E.in.style.display='flex';
}
function tha(u){
  var t=byUid(u);if(!t||t.uid===rt)return;
  var idx=thus.indexOf(t),kn=Array.isArray(t.kn)?t.kn:[],ten=tenThu(t),mt=null;
  if(window.TTGBALO)kn.forEach(function(id){if(id)TTGBALO.add(id,1);});   /* trả sách kỹ năng về Balo */
  if(window.TTGTH&&TTGTH.manhKhiTha){try{mt=TTGTH.manhKhiTha(t);}catch(e){}}   /* THẢ 1 con = 1 Mảnh CỦA CHÍNH LOÀI đó (bất kể Rank / hệ); giết thú không còn rơi Mảnh (75-tien-hoa-thu.js) */
  thus.splice(idx,1);
  if(u.indexOf('canh-')===0&&thaList.indexOf(u)<0){thaList.push(u);if(!demo){try{localStorage.setItem(KTHA,JSON.stringify(thaList));}catch(e){}}}   /* thú đồng bộ từ sảnh: nhớ đã thả để không tự thêm lại */
  save();
  sel=thus[idx]?thus[idx].uid:(thus[idx-1]?thus[idx-1].uid:null);
  hidePop();render();toast('Đã thả '+ten+(mt?' · +'+mt.q+' '+mt.ten:''));
}

/* ĐỒNG BỘ THÚ Ở SẢNH: game-moi/index.html lưu thú đang đứng ở sảnh vào khóa ttg_moi_v1 {thu:loài, bm:bậc 1-3}.
   Chưa có cơ chế bắt thú thật, nên mỗi loài thú từng dùng ở sảnh được coi là ĐÃ CÓ và tự vào danh sách (mỗi loài 1 con, uid 'canh-<loài>').
   Con 'canh-' luôn cập nhật tiến hóa (tien) theo bậc bm hiện tại. Sau này có bắt thú thì bỏ hàm này (hoặc chỉ giữ để nhập thú cũ).
   21/11/2026: TẮT bằng DONGBO=false vì đã có chọn thú đầu game (TTGTHU.khoiTao) + bắt thú thật. Cần lại thì đặt true. */
var DONGBO=false;
function dongBo(){
  if(!DONGBO||demo||!window.THU_MOI||!THU_MOI.byId)return;
  try{
    var sv=JSON.parse(localStorage.getItem('ttg_moi_v1')||'{}'),id=sv&&sv.thu;
    if(!id||!THU_MOI.byId[id])return;
    var tien=Math.max(1,Math.min(3,(sv.bm|0)||1)),u='canh-'+id,t=byUid(u),i,co=false;
    if(thaList.indexOf(u)>=0)return;   /* đã thả con này rồi */
    for(i=0;i<thus.length;i++)if(thus[i].id===id){co=true;break;}
    if(t){if(t.tien!==tien){t.tien=tien;save();}}
    else if(!co){thus.push({uid:u,id:id,tien:tien,chiso:{}});save();}
  }catch(e){}
}
function open(){
  dongBo();
  if(window.TTGBALO&&TTGBALO.close)TTGBALO.close();   /* mở panel này -> đóng Balo */
  if(!root)build();
  if(!byUid(sel))sel=(rt&&byUid(rt))?rt:(thus[0]?thus[0].uid:null);   /* mặc định chọn thú đang ra trận, không có thì thú đầu tiên */
  isOpen=true;openAt=performance.now();root.classList.add('on');unit();render();
}
function close(){if(window.TTGTB)TTGTB.close();if(window.TTGKH)TTGKH.close();if(!root)return;hidePop();isOpen=false;root.classList.remove('on');E.ts.style.display='none';}

/* ===== ICON NÚT THÚ THẦN (SVG vẽ tay, màu SÁNG: dấu chân thú xanh ngọc, viền tối, ngọc vàng ở giữa) =====
   id gradient dùng tiền tố tt để không trùng icon Balo. */
var ICON='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="ttP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2fff9"/><stop offset=".55" stop-color="#55eedc"/><stop offset="1" stop-color="#14b8c8"/></linearGradient><linearGradient id="ttY" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6b0"/><stop offset="1" stop-color="#ffab25"/></linearGradient></defs><g fill="url(#ttP)" stroke="#04464f" stroke-width="2.4" stroke-linejoin="round"><ellipse cx="11.5" cy="29" rx="5.8" ry="7.8" transform="rotate(-24 11.5 29)"/><ellipse cx="23" cy="17.5" rx="6.2" ry="8.8" transform="rotate(-8 23 17.5)"/><ellipse cx="41" cy="17.5" rx="6.2" ry="8.8" transform="rotate(8 41 17.5)"/><ellipse cx="52.5" cy="29" rx="5.8" ry="7.8" transform="rotate(24 52.5 29)"/><path d="M32 29C41 29 48.4 37.5 49.4 46C50.2 52.8 45 58.4 38.6 57.6C35.8 57.2 34 56 32 56C30 56 28.2 57.2 25.4 57.6C19 58.4 13.8 52.8 14.6 46C15.6 37.5 23 29 32 29Z"/></g><g fill="#fff" fill-opacity=".6"><ellipse cx="21.4" cy="13.4" rx="2" ry="3.6" transform="rotate(-8 21.4 13.4)"/><ellipse cx="39.4" cy="13.4" rx="2" ry="3.6" transform="rotate(8 39.4 13.4)"/></g><path d="M32 36L38.4 45 32 54.4 25.6 45Z" fill="url(#ttY)" stroke="#6b3a00" stroke-width="1.9" stroke-linejoin="round"/><path d="M32 39L35.2 45H32Z" fill="#fff" fill-opacity=".85"/><path d="M56 4.5L57.2 8 60.7 9.2 57.2 10.4 56 14 54.8 10.4 51.3 9.2 54.8 8Z" fill="#fff"/><path d="M8.5 6.5L9.3 8.7 11.5 9.5 9.3 10.3 8.5 12.5 7.7 10.3 5.5 9.5 7.7 8.7Z" fill="#fff6b0"/></svg>';

/* Nút thêm sau nút Balo, r:0 = CÙNG HÀNG (hàng trên) với Balo, nằm ngay bên phải. Chữ "Thú Thần" dài hơn "Balo" nên thu nhỏ chữ để không tràn khung nút. */
var btn=TTGNV.add({id:'thu-than',ten:'Thú Thần',icon:ICON,onTap:open,r:0});
var tx=btn.querySelector('.nv-tx');
if(tx){tx.style.fontSize='.8em';tx.style.letterSpacing='0';}   /* chỉnh .82em nếu chữ vẫn tràn / còn nhỏ */

/* ===== API CÔNG KHAI ===== */
/* add(thu): thu = {id (loài, bắt buộc), ten?, bac?, tien?, chiso?:{hp,tc,pt,td,mm}}; không có uid thì tự tạo. Trả về uid. */
function add(t){
  t=Object.assign({},t||{});
  if(!t.uid||byUid(t.uid))t.uid=uid();
  if(!t.chiso)t.chiso={};
  thus.push(t);save();
  if(isOpen){if(!sel)sel=t.uid;render();}
  return t.uid;
}
var RK_ORD=['E','D','C','B','A','S','SS','SR'];
function doiRank(){var t=rt&&byUid(rt);if(!t)return null;var i=RK_ORD.indexOf(RKC[t.bac]?t.bac:'C');t.bac=RK_ORD[(i+1)%RK_ORD.length];save();if(isOpen)render();return t.bac;}   /* NÚT TEST: đổi Rank thú ra trận theo vòng E>D>C>B>A>S>SS>SR */
/* setTien(uid,n): đổi bậc tiến hóa (1-3) của 1 thú, lưu + vẽ lại panel. Dùng cho khung Tiến Hóa (75-tien-hoa-thu.js). Trả bậc mới hoặc null nếu không có thú. */
function setTien(u,n){var t=byUid(u);if(!t)return null;n=Math.max(1,Math.min(3,Math.floor(n)||1));t.tien=n;save();if(isOpen)render();return n;}
function list(){dongBo();return thus.map(function(t){return Object.assign({},t);});}
function getRaTran(){var t=rt&&byUid(rt);return t?Object.assign({},t):null;}   /* sau này nối vào trận đấu/sảnh bằng hàm này */
/* khoiTao(thu): TÀI KHOẢN MỚI. Xóa sạch kho + thú ra trận + danh sách thả (bộ nhớ và localStorage), thêm đúng con `thu`, cho ra trận luôn. Trả uid (null nếu đang ở chế độ ?thu=demo hoặc thiếu id). Không đụng Balo. */
function khoiTao(t){
  if(demo||!t||!t.id)return null;
  thus=[];rt=null;sel=null;row0=0;page=0;thaList=[];
  try{localStorage.removeItem(KTHA);}catch(e){}
  var u=add(t);   /* add() đã lưu kho; ra trận đặt ngay sau đó */
  rt=u;sel=u;save();
  if(isOpen)render();
  return u;
}

/* ===== EXP / CẤP của thú đang ra trận (công thức: TTGCS.expCan, trần cấp: TTGCS.CFG.capMax hoặc 100) ===== */
function capGoc(){return (window.TTGCS&&TTGCS.CFG&&TTGCS.CFG.capMax)||100;}
function capMax(){var m=capGoc();if(window.TTGDV&&TTGDV.tran){var c=TTGDV.tran();if(c>0)m=Math.min(m,c);}return m;}   /* trần cấp = min(100, trần theo Danh Vọng) (80-danh-vong.js); thú đã vượt trần thì giữ nguyên, chỉ ngừng nhận EXP */
function expInfo(){var t=rt&&byUid(rt);if(!t||!window.TTGCS)return null;var lv=Math.max(1,Math.floor(t.lv||1)),mx=lv>=capMax();return {uid:t.uid,lv:lv,exp:mx?0:Math.max(0,Math.floor(t.exp||0)),need:mx?0:TTGCS.expCan(lv),max:mx,tran:mx&&lv<capGoc()};}
function addExp(n){var t=rt&&byUid(rt);n=Math.max(0,Math.floor(n)||0);if(!t||!window.TTGCS)return null;var lv0=Math.max(1,Math.floor(t.lv||1)),lv=lv0,e=Math.max(0,Math.floor(t.exp||0))+n;
  while(lv<capMax()&&e>=TTGCS.expCan(lv)){e-=TTGCS.expCan(lv);lv++;}
  var tr=lv>=capMax()&&lv<capGoc();if(lv>=capMax())e=0;t.lv=lv;t.exp=e;save();return {gain:(lv0>=capMax()?0:n),lv0:lv0,lv1:lv,exp:e,need:lv>=capMax()?0:TTGCS.expCan(lv),tran:tr};}
function lamMoi(){try{if(isOpen&&E&&E.cap)renderStats();}catch(e){}}   /* gọi khi đổi trang bị (55-trang-bi.js) để trang chỉ số cập nhật */
window.TTGTHU={lamMoi:lamMoi,tha:tha,open:open,close:close,isOpen:function(){return isOpen;},add:add,list:list,getRaTran:getRaTran,doiRank:doiRank,setTien:setTien,khoiTao:khoiTao,anh:anhThu,expInfo:expInfo,addExp:addExp,ten:tenThu,badges:drawBadges,pc:pcPaint};   /* pc(canvas có data-u=đường dẫn ảnh): vẽ thú tự phóng vừa ô (khung Tiến Hóa 72-khung-ren-cuong-hoa.js dùng) */   /* anh(thu) = đường dẫn ảnh thú (dùng cho khung Trang Bị) */
})();
