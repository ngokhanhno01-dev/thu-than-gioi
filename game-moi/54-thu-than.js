/* 54-thu-than.js - Nút "Thú Thần" + panel Thú Thần (chứa và trang bị thú đã bắt).
   Cần 52-nut-vuong.js (TTGNV) nạp trước; nạp SAU 53-balo.js (để đóng Balo khi mở panel này) và sau 51-thu-moi.js (lấy ảnh thú).
   Ảnh khung: game-moi/khung-thu.webp (2200x996). Hiển thị đúng cỡ gốc (1 pixel ảnh = 1 pixel máy) để không bị mờ; đóng bằng nút X / bấm ngoài / Esc.
   MỌI TỌA ĐỘ bên dưới tính theo PIXEL ẢNH ĐÃ CẮT 2200x996 (BW x BH), tự co theo màn hình bằng biến --u (= 1 px ảnh).
   TIẾN ĐỘ: BƯỚC 1 (nút + icon) xong. BƯỚC 2 (khung + đóng) xong. BƯỚC 3 (bố cục + chọn thú + ra trận) xong.
   CHƯA LÀM: bậc thú SS..D (chỉ chừa trường bac), buff/debuff/kỹ năng có sẵn (3 ô tròn), gắn/gỡ sách kỹ năng (6 ô "+"), bảng nổi.
   QUY TẮC: mở Thú Thần thì đóng Balo, mở Balo thì đóng Thú Thần (53-balo.js gọi TTGTHU.close()).
   DỮ LIỆU: danh sách thú {uid, id (loài, khớp THU_MOI.byId), ten, bac (tùy chọn: SS/S/A/B/C/D), tien (tiến hóa 1-3 = ảnh -b1/-b2/-b3, mặc định 1), chiso:{hp,tc,pt,td,mm}}
            lưu ở khóa localStorage ttg_moi_thu_v1; uid thú ra trận lưu ở ttg_moi_thu_ratran_v1. Kho tạm KHÔNG giới hạn số thú.
   KỸ NĂNG (5a): mỗi thú có thu.kn = mảng 6 ô (id sách hoặc null). Bấm ô "+" -> danh sách sách kỹ năng trong Balo -> bấm 1 sách -> bảng nổi (Dùng/Đóng);
                 bấm ô đã gắn -> bảng nổi (Gỡ/Đóng). Dùng = trừ 1 sách ở Balo, Gỡ = trả sách về Balo. Danh mục sách mẫu: khối SACH bên dưới (chỗ thêm/sửa kỹ năng).
   API: TTGTHU.open() / .close() / .isOpen() / .add(thu) (trả về uid) / .list() / .getRaTran() (trả thú đang ra trận hoặc null).
   THỬ: thêm ?thu=demo vào link -> có sẵn vài thú mẫu (không lưu lại). */
(function(){
'use strict';
if(!window.TTGNV)return;
var BW=2200,BH=996,IMG='game-moi/khung-thu.webp?v=5';   /* ảnh khung gốc 2200x996 (không phóng to, nén không mất chất lượng) */
var KEY='ttg_moi_thu_v1',KRT='ttg_moi_thu_ratran_v1';
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
var ANH_THU=340;    /* cỡ ảnh thú lớn bên trái (px ảnh khung). Ảnh thú gốc 192px nên to quá sẽ mờ: chỉnh 288~384 */
var BAR_Y=270,BAR_DY=56.5,BAR_X=921,BAR_W=442,BAR_H=36;             /* 5 thanh chỉ số */
var GR_X=[1532,1671,1810,1949],GR_Y=[237,379,522,664],GR_W=127,GR_H=128;  /* lưới thú 4 cột x 4 hàng */
var SK_X=[936,1071,1205],SK_Y=[631,770],SK_S=108;                    /* 6 ô kỹ năng (3 cột x 2 hàng) */
var RAIL={x:2096,y:240,w:17,h:552};                                  /* rãnh cuộn bên phải lưới */
/* ----- KỸ NĂNG / SÁCH (5a) ----- */
var NSK=6;                  /* số ô gắn kỹ năng */
var NOI_IMG='';             /* ẢNH KHUNG BẢNG NỔI (nền xanh đã tách, ô giữa trong suốt): khi có file thì điền vd 'game-moi/khung-noi.webp'. Để trống = dùng khung vẽ bằng CSS tạm. */
var POP_LS={x:880,y:215,w:560,h:640};    /* bảng danh sách sách (px ảnh khung) */
var POP_IN={x:940,y:290,w:440,h:500};    /* bảng nổi thông tin kỹ năng */
/* Danh mục sách kỹ năng MẪU. Mỗi sách là 1 item Balo: loai:'sach', ten (tên sách), kn (tên kỹ năng), mo (mô tả), cd (hồi chiêu, lượt), ic (emoji tạm) hoặc img. Muốn thêm: thêm dòng vào đây (hoặc TTGBALO.reg). */
var SACH={
  'sach-chem-gio':{loai:'sach',ten:'Sách Chém Gió',kn:'Chém Gió',ic:'🌪️',cd:3,mo:'Chém một đường gió sắc, gây 150% tấn công lên 1 mục tiêu.'},
  'sach-bang-giap':{loai:'sach',ten:'Sách Băng Giáp',kn:'Băng Giáp',ic:'🛡️',cd:4,mo:'Phủ giáp băng, tăng 30% phòng thủ trong 3 lượt.'},
  'sach-hoi-xuan':{loai:'sach',ten:'Sách Hồi Xuân',kn:'Hồi Xuân',ic:'🌿',cd:5,mo:'Hồi 25% máu tối đa cho bản thân.'},
  'sach-loi-de':{loai:'sach',ten:'Sách Lôi Đế',kn:'Lôi Đế',ic:'⚡',cd:5,mo:'Triệu sấm sét gây 200% tấn công, có 20% làm choáng 1 lượt.'},
  'sach-doc-vu':{loai:'sach',ten:'Sách Độc Vụ',kn:'Độc Vụ',ic:'☠️',cd:4,mo:'Phun sương độc, gây sát thương theo thời gian trong 3 lượt (debuff).'},
  'sach-tang-toc':{loai:'sach',ten:'Sách Tăng Tốc',kn:'Tăng Tốc',ic:'💨',cd:3,mo:'Tăng 40% tốc độ trong 2 lượt (buff).'}
};
if(window.TTGBALO&&TTGBALO.reg)TTGBALO.reg(SACH);   /* đăng ký vào Balo (sách đã sở hữu từ trước vẫn nhận ra) */
if(demo&&window.TTGBALO)Object.keys(SACH).forEach(function(k,i){TTGBALO.add(k,i%3+1);});   /* ?thu=demo: tặng sách mẫu (Balo demo, không lưu) */

/* ===== DỮ LIỆU ===== */
var thus=[],rt=null,sel=null,page=0,row0=0;
function uid(){return 't'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function demoChiso(k){var c={hp:300+k*37,tc:40+k*7,pt:30+k*5,td:20+(k*11)%60,mm:5+(k*3)%30},n=0;
  PAGES.slice(1).forEach(function(p){p.ds.forEach(function(d){c[d[0]]=((k*7+(n++)*13)%240)/10;});});return c;}   /* chỉ số phụ mẫu 0~24% */
function demoData(){
  var ids=['1a','1b','1d','2a','3a','4a','5a','6a','1c','2b','3b','4b','5b','6b','1e','2c','3c','4c','5c','6j'],bacs=['S','A','B','C','D','SS'];
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
function anhThu(t){var b=info(t);return b?'thu-game/'+b.zone+'/'+b.slug+'-b'+(t.tien||1)+'-192.png':'';}   /* ảnh 192px, cùng đường dẫn 51-thu-moi.js */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}

/* ===== CSS: {n} = n px ảnh (tự co theo --u) ===== */
var css=[
'.tt{--fh:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.tt.on{display:flex}',
'.tt-fr{position:relative;width:min(98vw,calc(96vh*2200/996));aspect-ratio:2200/996;background:url('+IMG+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.tt-fr>*{position:absolute;box-sizing:border-box}',
'.tt button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.tt-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}',   /* vùng bấm trong suốt đè lên nút X vẽ sẵn trong ảnh */
/* TRÁI: tên + ảnh thú */
'.tt-nm{display:flex;align-items:center;justify-content:center;gap:{10};padding:0 {30};font-family:var(--fh);font-weight:800;font-size:{34};line-height:1;white-space:nowrap;overflow:hidden;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7)}',
'.tt-nm i{font-style:normal;font-size:{30};color:#7a1f10}',
'.tt-ph{display:flex;align-items:center;justify-content:center;overflow:hidden}',
'.tt-ph img{width:{'+ANH_THU+'};height:{'+ANH_THU+'};object-fit:contain;filter:drop-shadow(0 {6} {10} rgba(0,0,0,.55));-webkit-user-drag:none;user-select:none}',
'.tt-eq{display:flex;align-items:center;justify-content:center;padding:0 0 {2};border:0;border-radius:{26};background:transparent;font-family:var(--fh);font-weight:800;font-size:{30};letter-spacing:{1};line-height:1;color:#ffe9a0;text-shadow:0 0 {6} rgba(255,190,60,.7),0 {2} 0 #000;cursor:pointer;white-space:nowrap}',
'.tt-eq:active{background:rgba(255,224,102,.18)}',
'.tt-emp{text-align:center;font-size:{26};line-height:1.45;color:#7c83b8;padding:0 {20}}',
/* GIỮA TRÊN: chỉ số */
'.tt-cap{display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{21};letter-spacing:{1};color:#bfeee8;text-shadow:0 {2} 0 #000}',
'.tt-bar{display:flex;align-items:center;justify-content:space-between;padding:0 {26};font-weight:700;font-size:{25};line-height:1;color:#e8ecff;text-shadow:0 {2} 0 #000;white-space:nowrap}',
'.tt-bar b{font-weight:800;color:#ffe9a0;font-size:{26}}',
'.tt-bar span{color:#bfeee8}',
'.tt-mid{display:flex;align-items:center;justify-content:center;text-align:center;font-size:{24};color:#7c83b8}',
'.tt-pg{display:flex;align-items:center;justify-content:center;padding:0;border-radius:{10};border:{3} solid #c9992f;background:#1d1d5a;color:#ffe9a0;font-size:{36};line-height:1;cursor:pointer}',
'.tt-pg:disabled{opacity:.3;cursor:default}',
'.tt-pg:active:not(:disabled){transform:scale(.92)}',
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
'.tt-c .b{position:absolute;left:{9};top:{7};font-family:var(--fh);font-weight:800;font-size:{22};line-height:1;color:#ffe9a0;text-shadow:0 0 {4} #000,{1} {1} 0 #000,-{1} {1} 0 #000}',
'.tt-c .rt{position:absolute;left:8%;right:8%;bottom:{9};height:{25};display:flex;align-items:center;justify-content:center;border-radius:{6};background:linear-gradient(180deg,#ffe58a,#c58a1e);color:#3b2406;font-family:var(--fh);font-weight:800;font-size:{17};line-height:1;white-space:nowrap}',
'.tt-c.sel::after{content:"";position:absolute;left:{3};top:{3};right:{3};bottom:{3};border:{4} solid #ffe066;border-radius:{6};box-shadow:0 0 {16} rgba(255,224,102,.85),inset 0 0 {14} rgba(255,224,102,.4);pointer-events:none}',
/* rãnh + thumb cuộn (phủ kín rãnh vẽ sẵn trong ảnh để không lộ thumb vẽ sẵn ở trên cùng) */
'.tt-rail{border-radius:{9};background:#0d0e34;border:{2} solid #8a6a2a;touch-action:none;cursor:pointer}',
'.tt-th{position:absolute;left:{2};right:{2};border-radius:{7};background:linear-gradient(90deg,#c9992f,#ffe58a,#c9992f);box-shadow:0 0 {6} rgba(255,224,102,.5)}',
/* NÚT RA TRẬN */
'.tt-go{display:flex;align-items:center;justify-content:center;padding:0;border:0;border-radius:{14};background:transparent;font-family:var(--fh);font-weight:800;font-size:{42};letter-spacing:{1};color:#3b2406;text-shadow:0 {2} 0 rgba(255,246,200,.75);cursor:pointer;white-space:nowrap}',
'.tt-go:active:not(:disabled){background:rgba(255,255,255,.18)}',
'.tt-go:disabled{cursor:default;opacity:.55}',
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
'.tt-pb button:active{transform:scale(.95)}'
].join('\n').replace(/\{(\d+(?:\.\d+)?)\}/g,'calc(var(--u)*$1)');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* ===== DỰNG PANEL (một lần) ===== */
function box(c,x,y,w,h){var s=c.style;s.left=(x/BW*100)+'%';s.top=(y/BH*100)+'%';s.width=(w/BW*100)+'%';s.height=(h/BH*100)+'%';return c;}
function mk(tag,cls,x,y,w,h,txt){var c=document.createElement(tag);if(cls)c.className=cls;if(txt!=null)c.textContent=txt;if(w)box(c,x,y,w,h);fr.appendChild(c);return c;}
/* đặt phần tử con theo pixel ảnh, tính trong khung cha có gốc (ox,oy) cỡ (W,H) */
function boxIn(c,x,y,w,h,ox,oy,W,H){var s=c.style;s.left=((x-ox)/W*100)+'%';s.top=((y-oy)/H*100)+'%';s.width=(w/W*100)+'%';s.height=(h/H*100)+'%';return c;}
/* KHÔNG PHÓNG TO QUÁ CỠ GỐC: chiều rộng khung tối đa = BW / devicePixelRatio (CSS px) => đúng 1 pixel ảnh = 1 pixel màn hình, nét nhất.
   Màn nhỏ hơn thì tự thu nhỏ lại. Muốn khung to hơn (đổi nét lấy kích thước): đổi MAXSCALE lên >1 (vd 1.3). */
var MAXSCALE=1;
function unit(){if(!fr)return;var d=window.devicePixelRatio||1;fr.style.maxWidth=(BW*MAXSCALE/d)+'px';fr.style.setProperty('--u',(fr.clientWidth/BW)+'px');}
var tt=0,lastDrag=0;
function toast(t){E.ts.textContent=t;E.ts.style.display='flex';clearTimeout(tt);tt=setTimeout(function(){E.ts.style.display='none';},1500);}

function build(){
  var i,j;
  root=document.createElement('div');root.className='tt';
  fr=document.createElement('div');fr.className='tt-fr';root.appendChild(fr);
  /* nút X đã vẽ sẵn trong ảnh (tâm ~ x2101,y112 trên ảnh đã cắt): chỉ đặt vùng bấm trong suốt đè lên, đường kính 190 */
  var x=mk('button','tt-x',2006,17,190,190);x.type='button';x.setAttribute('aria-label','Đóng');x.addEventListener('click',close);

  /* --- TRÁI: thanh vàng tên + bậc (x202-631,y211-272), ảnh thú trong ô vuông lớn (khung trong x214-618,y362-770) --- */
  E.nm=mk('div','tt-nm',202,211,429,61);
  E.ph=mk('div','tt-ph',214,362,404,408);
  /* nút TRANG BỊ: đè lên viên thuốc vàng dưới ô ảnh thú (x256-576,y777-837). Bấm = mở khung trang bị (55-trang-bi.js) */
  var eq=mk('button','tt-eq',256,777,320,60,'Trang Bị');eq.type='button';
  eq.addEventListener('click',function(){if(window.TTGTB)TTGTB.open();else toast('Sắp có');});
  /* 3 ô tròn bên dưới (tâm (278,907),(418,907),(558,907), bán kính ~55): CHƯA LÀM (icon buff/debuff/kỹ năng có sẵn), để trống */

  /* --- GIỮA TRÊN: chữ trang + 5 thanh chỉ số + 2 nút ‹ › --- */
  E.cap=mk('div','tt-cap',921,243,442,26);
  E.bars=[];
  for(i=0;i<5;i++)E.bars.push(mk('div','tt-bar',BAR_X,BAR_Y+BAR_DY*i,BAR_W,BAR_H));
  E.mid=mk('div','tt-mid',921,330,442,150);   /* chữ báo trang trống (vd "Chưa có chỉ số phụ") */
  E.pv=mk('button','tt-pg',833,376,56,56,'‹');E.pv.type='button';E.pv.setAttribute('aria-label','Trang trước');
  E.nx=mk('button','tt-pg',1395,376,56,56,'›');E.nx.type='button';E.nx.setAttribute('aria-label','Trang sau');
  E.pv.addEventListener('click',function(){if(page>0){page--;renderStats();}});
  E.nx.addEventListener('click',function(){if(page<PAGES.length-1){page++;renderStats();}});

  /* --- GIỮA DƯỚI: 6 ô gắn kỹ năng (CHƯA làm chức năng: bấm "+" chỉ báo "Sắp có") --- */
  E.sk=[];
  for(j=0;j<2;j++)for(i=0;i<3;i++){var s=mk('button','tt-sk',SK_X[i],SK_Y[j],SK_S,SK_S);s.type='button';s.setAttribute('aria-label','Kỹ năng '+(j*3+i+1));E.sk.push(s);   /* nội dung (số thứ tự + dấu + hoặc icon kỹ năng) do renderSkills vẽ */
    (function(k){s.addEventListener('click',function(){moSlot(k);});})(j*3+i);}   /* k = số ô 0..5 */
  E.ts=mk('div','tt-ts',900,540,480,64);

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

  /* --- NÚT RA TRẬN: tấm vàng dưới-phải (x1654-1974,y851-941) --- */
  E.go=mk('button','tt-go',1654,851,320,90);E.go.type='button';E.go.addEventListener('click',function(){if(sel&&sel!==rt){rt=sel;save();render();}});

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
    if(dn.drag)setRow(dn.row-Math.round(dy/(142.3*fr.clientWidth/BW)));   /* 142.3 = khoảng cách giữa 2 hàng (px ảnh) */
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
      c.innerHTML=(a?'<img src="'+esc(a)+'" alt="">':'')+(t.bac?'<span class="b">'+esc(t.bac)+'</span>':'')+(t.uid===rt?'<span class="rt">Ra trận</span>':'');
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
    if(d&&t){var v=t.chiso&&t.chiso[d[0]];b.innerHTML='<b>'+esc(d[1])+'</b><span>'+(v==null?'-':esc(v)+(d[2]||''))+'</span>';}
    else if(d){b.innerHTML='<b>'+esc(d[1])+'</b><span>-</span>';}
    else b.innerHTML='';
  }
  E.mid.textContent=pg.ds.length?'':'Chưa có '+pg.ten.toLowerCase();
}
function renderLeft(){
  var t=byUid(sel);
  if(t){E.nm.innerHTML=esc(tenThu(t))+(t.bac?'<i>['+esc(t.bac)+']</i>':'');
    var a=anhThu(t);E.ph.innerHTML=a?'<img src="'+esc(a)+'" alt="'+esc(tenThu(t))+'">':'';}
  else{E.nm.textContent='Chưa Có Thú';E.ph.innerHTML='<div class="tt-emp">Chưa có thú nào<br>Bắt thú để cất vào đây</div>';}
}
function renderGo(){
  var on=!!sel&&sel===rt;
  E.go.textContent=on?'Đang ra trận':'Ra trận';
  E.go.disabled=!sel||on;
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
  E.in.innerHTML='<div class="tt-ii"><span class="i">'+icSach(it)+'</span><div class="n">'+esc(it.kn||it.ten)+'</div><div class="m">'+esc(it.ten)+(it.cd?' · Hồi chiêu '+it.cd+' lượt':'')+'</div><div class="d">'+esc(it.mo||'')+'</div></div>'
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
  TTGBALO.add(id,-1);kn[k]=id;save();hidePop();renderSkills();toast('Đã gắn kỹ năng');
}
/* GỠ: trả sách về Balo, trống ô k */
function go(k){
  var t=byUid(sel);if(!t)return;var kn=knOf(t),id=kn[k];if(!id)return;
  if(window.TTGBALO)TTGBALO.add(id,1);kn[k]=null;save();hidePop();renderSkills();toast('Đã gỡ, sách về Balo');
}

/* ĐỒNG BỘ THÚ Ở SẢNH: game-moi/index.html lưu thú đang đứng ở sảnh vào khóa ttg_moi_v1 {thu:loài, bm:bậc 1-3}.
   Chưa có cơ chế bắt thú thật, nên mỗi loài thú từng dùng ở sảnh được coi là ĐÃ CÓ và tự vào danh sách (mỗi loài 1 con, uid 'canh-<loài>').
   Con 'canh-' luôn cập nhật tiến hóa (tien) theo bậc bm hiện tại. Sau này có bắt thú thì bỏ hàm này (hoặc chỉ giữ để nhập thú cũ). */
function dongBo(){
  if(demo||!window.THU_MOI||!THU_MOI.byId)return;
  try{
    var sv=JSON.parse(localStorage.getItem('ttg_moi_v1')||'{}'),id=sv&&sv.thu;
    if(!id||!THU_MOI.byId[id])return;
    var tien=Math.max(1,Math.min(3,(sv.bm|0)||1)),u='canh-'+id,t=byUid(u),i,co=false;
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
function close(){if(window.TTGTB)TTGTB.close();if(!root)return;hidePop();isOpen=false;root.classList.remove('on');E.ts.style.display='none';}

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
function list(){dongBo();return thus.map(function(t){return Object.assign({},t);});}
function getRaTran(){var t=rt&&byUid(rt);return t?Object.assign({},t):null;}   /* sau này nối vào trận đấu/sảnh bằng hàm này */

window.TTGTHU={open:open,close:close,isOpen:function(){return isOpen;},add:add,list:list,getRaTran:getRaTran,anh:anhThu};   /* anh(thu) = đường dẫn ảnh thú (dùng cho khung Trang Bị) */
})();
