/* 53-balo.js - BALO của game-moi: nút Balo (khung vuông + icon) + bảng Balo + dữ liệu túi đồ.
   Cần 52-nut-vuong.js (TTGNV) nạp trước. Ảnh khung bảng: game-moi/khung-balo.webp (1761x847, khung xanh-vàng mới: chữ BALO, nút X, chữ 4 nút KHÓA/CHỌN/VỨT BỎ/SẮP XẾP đã VẼ SẴN trong ảnh; 4x4 ô + bảng thông tin bên phải).
   BẢNG: nửa TRÁI = Ngự Thú Châu (danh sách thanh, sau này dùng khung thanh dài + bấm mở bảng nổi có nút Dùng/Đóng);
         nửa PHẢI = lưới 16 ô (4x4) Nguyên liệu (chia trang, tổng CAP ô) + bảng thông tin item (icon phóng to, tên, mô tả, số lượng)
         + 4 khung ngang dưới lưới = 4 nút: KHÓA (khóa/mở khóa), CHỌN (bật chọn nhiều ô), VỨT BỎ (có hỏi lại, món khóa không vứt được), SẮP XẾP (đổi kiểu xếp).
         Sức chứa (trái) + chuyển trang (phải) nằm ngay trên lưới ô.
   Mọi vị trí bên dưới tính theo pixel ẢNH ĐÃ CẮT 1761x847 (BW x BH). Cỡ chữ/độ dày trong CSS ({n}) vẫn tính theo thang cũ 1469 (UB) nên không phải chỉnh lại; --u = clientWidth/UB.
   DỮ LIỆU: kho đồ {id: số lượng} lưu ở khóa ttg_moi_balo_v1. Danh mục item (CAT) khai ở khối "DANH MỤC ITEM" bên dưới hoặc gọi TTGBALO.reg({...}).
   API: TTGBALO.open()/close(), .add(id,n) (n âm = trừ), .count(id), .reg(items), .xoaTrang(), .list() (đọc lưới túi cho khung Cường hóa).
   XÓA TRẮNG (21/11/2026): TTGBALO.xoaTrang() = xóa sạch túi đồ + khóa + kiểu sắp xếp (bộ nhớ và localStorage). Gọi từ màn chọn thú đầu game (65-chon-thu-dau.js) để mô phỏng người chơi lần đầu. Bỏ qua ở chế độ demo.
   THỬ BẢNG: thêm ?balo=demo vào link -> có sẵn vài item mẫu (không lưu lại). */
(function(){
'use strict';
if(!window.TTGNV)return;
var KEY='ttg_moi_balo_v1',CAP=100,PAGE=16,BW=1761,BH=847,UB=1469,IMG='game-moi/khung-balo.webp?v=3',OV_KHOA='game-moi/nut-mo-khoa.webp?v=1',OV_CHON='game-moi/nut-bo-chon.webp?v=1';   /* UB = thang đơn vị cũ cho cỡ chữ/độ dày ({n}) */
var demo=/[?&](balo|thu)=demo/.test(location.search);   /* ?thu=demo cũng bật demo Balo để có sách kỹ năng mẫu cho panel Thú Thần (không lưu) */
var LOAI={nl:'Nguyên liệu',bong:'Ngự Thú Châu',sach:'Sách kỹ năng'};   /* sách kỹ năng nằm chung lưới 4x4 với nguyên liệu; danh mục sách khai ở 54-thu-than.js */
/* ===== DANH MỤC ITEM ===== mỗi item: id:{loai:'nl'|'bong', ten, mo (mô tả), ic (emoji tạm) hoặc img (đường dẫn ảnh icon), cap (cấp bóng)} */
var CAT={};
function reg(o){for(var k in o)CAT[k]=o[k];}
var inv={},page=0,sel=null,isOpen=false,openAt=0,root,fr,E={};
var KLOCK='ttg_moi_balo_khoa_v1',KSORT='ttg_moi_balo_xep_v1',lock={},sortMode=0,multi=false,picks={},tt=0;
var SORTN=['Xếp theo thứ tự nhặt','Xếp theo tên','Xếp theo số lượng (nhiều → ít)'];
try{var lk=JSON.parse(localStorage.getItem(KLOCK)||'{}');if(lk&&typeof lk==='object')lock=lk;sortMode=(+localStorage.getItem(KSORT))||0;}catch(e){}
function saveMeta(){try{localStorage.setItem(KLOCK,JSON.stringify(lock));localStorage.setItem(KSORT,String(sortMode));}catch(e){}}
if(demo){
  reg({'bong-thuong':{loai:'bong',ten:'Bóng thường',cap:1,ic:'⚪',mo:'Bóng bắt thú cơ bản.'},
       'bong-bac':{loai:'bong',ten:'Bóng bạc',cap:2,ic:'🥈',mo:'Tỉ lệ bắt cao hơn bóng thường.'},
       'bong-vang':{loai:'bong',ten:'Bóng vàng',cap:3,ic:'🥇',mo:'Bóng bắt thú cao cấp.'},
       'nl-tinhthe':{loai:'nl',ten:'Tinh thể lam',ic:'💎',mo:'Mảnh tinh thể rơi từ thú vùng Tuyết Nguyên.'},
       'nl-long':{loai:'nl',ten:'Lông thú',ic:'🪶',mo:'Lông mềm, dùng làm nguyên liệu chế tạo.'},
       'nl-nanh':{loai:'nl',ten:'Nanh sắc',ic:'🦷',mo:'Nanh của thú hoang.'},
       'nl-co':{loai:'nl',ten:'Cỏ linh',ic:'🌿',mo:'Thảo dược mọc ở Sương Cốc.'},
       'nl-ngoc':{loai:'nl',ten:'Ngọc sương',ic:'🔮',mo:'Ngọc nhỏ ngưng tụ từ sương mù.'}});
  inv={'bong-thuong':12,'bong-bac':5,'bong-vang':1,'nl-tinhthe':7,'nl-long':23,'nl-nanh':4,'nl-co':15,'nl-ngoc':2};
}else{try{var v=JSON.parse(localStorage.getItem(KEY)||'{}');if(v&&typeof v==='object')inv=v;}catch(e){}}
function save(){if(demo)return;try{localStorage.setItem(KEY,JSON.stringify(inv));}catch(e){}}
function count(id){return inv[id]|0;}
function add(id,n){var c=count(id)+(n==null?1:n);if(c<=0)delete inv[id];else inv[id]=c;save();if(isOpen)render();return Math.max(0,c);}
/* xoaTrang(): TÀI KHOẢN MỚI. Xóa sạch túi đồ, khóa, kiểu sắp xếp (bộ nhớ + localStorage). Bỏ qua ở chế độ demo. */
function xoaTrang(){if(demo)return;inv={};lock={};picks={};sel=null;sortMode=0;page=0;multi=false;try{localStorage.removeItem(KEY);localStorage.removeItem(KLOCK);localStorage.removeItem(KSORT);}catch(e){}if(isOpen)render();}
function ids(loai){var a=Object.keys(inv).filter(function(id){var c=CAT[id];return c&&(loai==='luoi'?(c.loai==='nl'||c.loai==='sach'):c.loai===loai)&&inv[id]>0;});   /* 'luoi' = mọi món hiện trong lưới ô (nguyên liệu + sách kỹ năng) */
  if(loai==='bong')a.sort(function(x,y){function b(i){return (CAT[i]&&+CAT[i].cap)||(parseInt(String(i).replace(/\D/g,''),10))||0;}return b(x)-b(y);});   /* Ngự Thú Châu: luôn bậc 1→6, bỏ qua nút Sắp xếp */
  else if(sortMode===1)a.sort(function(x,y){return String(CAT[x].ten).localeCompare(String(CAT[y].ten),'vi');});
  else if(sortMode===2)a.sort(function(x,y){return inv[y]-inv[x];});
  return a;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ic(it){return it.img?'<img src="'+esc(it.img)+'" alt="">':'<b>'+esc(it.ic||'?')+'</b>';}

/* ===== CSS: {n} = n px ảnh (tự co theo --u) ===== */
/* PHÔNG CHỮ BÚT LÔNG (tiêu đề BALO + 4 nút): đặt file font vào game-moi/font-brush.ttf (hoặc .woff2). Chưa có file thì tự dùng Kaushan Script (Google Fonts), thiếu dấu tiếng Việt thì dùng Noto Serif. */
var css=[
'@font-face{font-family:"FZBrush";src:url(game-moi/font-brush.woff2) format("woff2"),url(game-moi/font-brush.ttf) format("truetype");font-display:swap}',
'.bl{--fh:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;--fb:"FZBrush","Kaushan Script","Noto Serif",Georgia,serif;position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.bl.on{display:flex}',
'.bl-fr{position:relative;width:min(98vw,calc(96vh*1761/847));aspect-ratio:1761/847;background:url('+IMG+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.bl-fr>*{position:absolute;box-sizing:border-box}',
'.bl button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.bl-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer} /* nút X đã vẽ sẵn trong khung: nút này chỉ là vùng bấm trong suốt */',
'.bl-x:active{box-shadow:0 0 {16} rgba(255,224,102,.85),inset 0 0 {16} rgba(255,224,102,.35)}',
'.bl-cap{display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{19};color:#bfeee8;text-shadow:0 {2} 0 #000;white-space:nowrap}',
'.bl-pg{display:flex;align-items:center;justify-content:space-between;color:#ffe9a0;font-weight:700;font-size:{19};text-shadow:0 {2} 0 #000}',
'.bl-pg button{width:{26};height:{26};padding:0;border-radius:{6};border:{2} solid #c9992f;background:#1d1d5a;color:#ffe9a0;font-size:{18};line-height:1;cursor:pointer}',
'.bl-pg button:disabled{opacity:.3}',
'.bl-pl{display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{19};letter-spacing:{1};line-height:1;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7);white-space:nowrap}',
'.bl-balls{overflow-y:auto;overflow-x:hidden;touch-action:pan-y;scrollbar-width:none;padding:{4}}',
'.bl-balls::-webkit-scrollbar{display:none}',
'.bl-emp{display:flex;align-items:center;justify-content:center;height:100%;font-size:{22};color:#7c83b8;text-align:center}',
'.bl-row{position:relative;display:flex;align-items:center;gap:{14};height:{66};margin-bottom:{8};padding:0 {14};border:{2} solid #b88a2e;border-radius:{10};background:linear-gradient(90deg,rgba(66,54,150,.7),rgba(24,24,80,.7));cursor:pointer;color:#e8ecff}',
'.bl-row.sel{box-shadow:0 0 0 {2} #ffe066,0 0 {14} rgba(255,224,102,.45)}',
'.bl-row .i{display:flex;align-items:center;justify-content:center;width:{48};height:{48};font-size:{34};border-radius:{8};background:rgba(8,8,40,.72)}',
'.bl-row .n{flex:1;font-weight:700;font-size:{23}}',
'.bl-row .l{font-size:{19};color:#ffe9a0}',
'.bl-row .q{min-width:{64};text-align:right;font-weight:800;font-size:{23};color:#bfeee8}',
'.bl-sl{display:flex;align-items:center;justify-content:center;padding:0;border:0;background:none;cursor:pointer}',
'.bl-sl .i{display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-size:{40}}',
'.bl-sl .i b{font-weight:400}',
'.bl-sl img,.bl-row img,.dt-ic img{width:76%;height:76%;object-fit:contain}',
'.bl-sl .q{position:absolute;right:{7};bottom:{3};font-weight:800;font-size:{17};color:#fff;text-shadow:0 0 {3} #000,{1} {1} 0 #000,-{1} {1} 0 #000}',
'.bl-sl.sel::after{content:"";position:absolute;left:{3};top:{3};right:{3};bottom:{3};border:{3} solid #ffe066;border-radius:{4};box-shadow:0 0 {12} rgba(255,224,102,.75),inset 0 0 {10} rgba(255,224,102,.35);pointer-events:none}',
'.bl-bt{padding:0;border:0;border-radius:{34};background:transparent;cursor:pointer} /* chữ KHÓA/CHỌN/VỨT BỎ/SẮP XẾP đã vẽ sẵn trong khung: nút chỉ là vùng bấm trong suốt, trạng thái đổi bằng ảnh phủ .bl-ov */','.bl-bt:active{background:rgba(255,224,102,.25)}',
'.bl-ov{display:none;pointer-events:none}',   /* ảnh nút MỞ KHÓA / BỎ CHỌN đè lên nút KHÓA / CHỌN khi đổi trạng thái */
'.bl-ov.on{display:block}',
'.bl-sl .lk,.bl-row .lk{position:absolute;left:{6};top:{4};font-size:{17};line-height:1;text-shadow:0 0 {3} #000}',
'.bl-row .lk{position:static;font-size:{20}}',
'.bl-sl.pk::after{content:"";position:absolute;left:{3};top:{3};right:{3};bottom:{3};border:{3} solid #5ff0e0;border-radius:{4};box-shadow:0 0 {12} rgba(95,240,224,.7);pointer-events:none}',
'.bl-row.pk{box-shadow:0 0 0 {2} #5ff0e0,0 0 {14} rgba(95,240,224,.45)}',
'.bl-ts{display:none;align-items:center;justify-content:center;text-align:center;padding:0 {10};font-size:{21};font-weight:700;color:#ffe9a0;background:rgba(10,8,40,.92);border:{2} solid #c9992f;border-radius:{10};z-index:3}',
'.bl-cf{display:none;flex-direction:column;align-items:center;justify-content:center;gap:{18};padding:{16};text-align:center;font-size:{24};font-weight:700;line-height:1.3;color:#e8ecff;background:rgba(10,8,40,.96);border:{3} solid #c9992f;border-radius:{14};box-shadow:0 0 {30} rgba(0,0,0,.8);z-index:4}',
'.bl-cf .r{display:flex;gap:{20}}',
'.bl-cf button{min-width:{120};height:{46};padding:0 {16};border-radius:{8};border:{2} solid #c9992f;background:#1d1d5a;color:#ffe9a0;font-family:var(--fh);font-weight:800;font-size:{20};cursor:pointer}',
'.bl-cf button.d{background:#6b1f2e;border-color:#e0707e;color:#ffd9dd}',
'.bl-dt{display:flex;flex-direction:column;align-items:center;padding:{10} {8};overflow:hidden}',
'.dt-ic{display:flex;align-items:center;justify-content:center;width:{172};height:{172};flex:none;font-size:{104};border-radius:{14};border:{3} solid #c9992f;background:radial-gradient(circle at 50% 35%,#34348f,#12123a);box-shadow:inset 0 0 {18} rgba(0,0,0,.6)}',
'.dt-ic b{font-weight:400}',
'.dt-nm{flex:none;margin-top:{12};font-family:var(--fh);font-weight:800;font-size:{27};color:#ffe9a0;text-align:center;line-height:1.15}',
'.dt-mt{flex:none;margin-top:{5};font-size:{19};color:#9fe8de;text-align:center}',
'.dt-ds{margin-top:{10};font-size:{19};line-height:1.35;color:#cfd6ff;text-align:center;width:100%;flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
'.dt-ds::-webkit-scrollbar{display:none}',
'.dt-hint{margin:auto;font-size:{20};line-height:1.4;color:#8a90c0;text-align:center}'
].join('\n').replace(/\{(\d+(?:\.\d+)?)\}/g,'calc(var(--u)*$1)');
try{var lkf=document.createElement('link');lkf.rel='stylesheet';lkf.href='https://fonts.googleapis.com/css2?family=Noto+Serif:wght@700;800;900&family=Kaushan+Script&display=swap';document.head.appendChild(lkf);}catch(e){}
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ===== DỰNG BẢNG (một lần) ===== */
function box(c,x,y,w,h){var s=c.style;s.left=(x/BW*100)+'%';s.top=(y/BH*100)+'%';s.width=(w/BW*100)+'%';s.height=(h/BH*100)+'%';return c;}
function mk(tag,cls,x,y,w,h,txt){var c=document.createElement(tag);if(cls)c.className=cls;if(txt!=null)c.textContent=txt;if(w)box(c,x,y,w,h);fr.appendChild(c);return c;}
var COLS=[916,1024,1127,1233],ROWS=[209,306,405,504],SL=85; /* lưới 4 cột x 4 hàng, mỗi ô 85px ảnh (khung mới) */
function build(){
  root=document.createElement('div');root.className='bl';
  fr=document.createElement('div');fr.className='bl-fr';root.appendChild(fr);
  E.x=mk('button','bl-x',1618,57,94,94); /* nút đóng: phủ lên nút X đã vẽ sẵn ở góc trên phải khung */E.x.type='button';E.x.setAttribute('aria-label','Đóng');
  E.cap=mk('div','bl-cap',916,181,100,26); /* sức chứa: dải trống ngay trên lưới ô, sát góc trái */
  var pg=mk('div','bl-pg',1170,181,146,26); /* chuyển trang: ngay trên lưới ô, sát góc phải */
  E.pv=document.createElement('button');E.pv.type='button';E.pv.textContent='‹';E.pg=document.createElement('span');E.nx=document.createElement('button');E.nx.type='button';E.nx.textContent='›';
  pg.appendChild(E.pv);pg.appendChild(E.pg);pg.appendChild(E.nx);
  mk('div','bl-pl',295,192,262,38,'Ngự Thú Châu'); /* chữ nằm giữa thanh vàng (thanh: x295-557, y190-233) */
  E.balls=mk('div','bl-balls',105,252,705,470);
  E.slots=[];
  for(var r=0;r<6;r++)for(var c=0;c<4;c++){var b=mk('button','bl-sl',COLS[c],ROWS[r],SL,SL);b.type='button';(function(i){b.addEventListener('click',function(){clickSlot(i);});})(r*4+c);E.slots.push(b);}
  E.dt=mk('div','bl-dt',1385,235,290,535); /* bảng thông tin item bên phải */
  /* 4 nút: vùng bấm trong suốt đặt lên 4 nút đã vẽ sẵn: [x,y,rộng,cao] (chữ trên nút nằm trong ảnh khung nên không đổi được; trạng thái hiện bằng quầng sáng + thông báo nổi) */
  /* ảnh nút đổi trạng thái (cắt từ khung mới): [x,y,rộng,cao] khớp đúng vị trí nút KHÓA / CHỌN. Đổi ảnh thì giữ nguyên kích thước/vị trí */
  E.ovK=mk('img','bl-ov',888,604,232,96);E.ovK.src=OV_KHOA;E.ovK.alt='';E.ovK.draggable=false;
  E.ovC=mk('img','bl-ov',1120,604,232,96);E.ovC.src=OV_CHON;E.ovC.alt='';E.ovC.draggable=false;
  E.bt={};
  [['khoa',925,618,180,70,'Khóa',khoa],['chon',1138,618,190,70,'Chọn',chon],['vut',925,718,180,70,'Vứt bỏ',vut],['xep',1138,718,190,70,'Sắp xếp',xep]].forEach(function(d){
    var b=mk('button','bl-bt',d[1],d[2],d[3],d[4]);b.type='button';b.setAttribute('aria-label',d[5]);b.addEventListener('click',d[6]);E.bt[d[0]]=b;});
  E.ts=mk('div','bl-ts',230,665,360,52);
  E.cf=mk('div','bl-cf',215,320,470,230);
  document.body.appendChild(root);
  E.x.addEventListener('click',close);
  E.pv.addEventListener('click',function(){if(page>0){page--;render();}});
  E.nx.addEventListener('click',function(){if(page<pages()-1){page++;render();}});
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close();});
  window.addEventListener('resize',unit);
}
function unit(){if(fr)fr.style.setProperty('--u',(fr.clientWidth/UB)+'px');}
function pages(){return Math.max(1,Math.ceil(CAP/PAGE));}
function pick(id){sel=id;if(multi){if(picks[id])delete picks[id];else picks[id]=1;}render();}
function clickSlot(i){var id=ids('luoi')[page*PAGE+i];if(!id)return;pick(id);}
function targets(){var a=multi?Object.keys(picks).filter(function(id){return CAT[id]&&count(id)>0;}):[];if(!a.length&&sel&&!multi)a=[sel];return a;}
function toast(t){if(window.TTGTBAO){TTGTBAO.toast(t,1800);return;}E.ts.textContent=t;E.ts.style.display='flex';clearTimeout(tt);tt=setTimeout(function(){E.ts.style.display='none';},1800);}
/* KHÓA: món đã khóa không vứt được. Tất cả đang khóa -> mở khóa, ngược lại -> khóa hết */
function khoa(){var t=targets();if(!t.length){toast('Chưa chọn vật phẩm');return;}
  var allL=t.every(function(id){return lock[id];});
  t.forEach(function(id){if(allL)delete lock[id];else lock[id]=1;});saveMeta();toast(allL?'Đã mở khóa':'Đã khóa');render();}
/* CHỌN: bật/tắt chế độ chọn nhiều ô (chạm nhiều ô để KHÓA / VỨT BỎ cùng lúc) */
function chon(){multi=!multi;picks={};if(multi&&sel)picks[sel]=1;toast(multi?'Chọn nhiều: chạm các ô cần chọn':'Đã tắt chọn nhiều');render();}
/* VỨT BỎ: hỏi lại trước khi xóa; vứt cả chồng số lượng của món */
function vut(){var t=targets();if(!t.length){toast('Chưa chọn vật phẩm');return;}
  var ok=t.filter(function(id){return !lock[id];});
  if(!ok.length){toast('Vật phẩm đang khóa');return;}
  var tong=ok.reduce(function(n,id){return n+count(id);},0);
  var tx=ok.length===1?'Vứt bỏ '+esc(CAT[ok[0]].ten)+' x'+tong+'?':'Vứt bỏ '+ok.length+' loại ('+tong+' món)?';
  if(ok.length<t.length)tx+='<br><small>(bỏ qua '+(t.length-ok.length)+' món đã khóa)</small>';
  var xoa=function(){ok.forEach(function(id){delete inv[id];delete picks[id];if(sel===id)sel=null;});save();toast('Đã vứt bỏ');render();};
  if(window.TTGTBAO){TTGTBAO.confirm(tx,[{t:'Vứt bỏ',cls:'d',cb:xoa},{t:'Hủy'}]);return;}
  E.cf.innerHTML='<div>'+tx+'</div><div class=\"r\"><button type=\"button\" class=\"d\">Vứt bỏ</button><button type=\"button\">Hủy</button></div>';
  E.cf.style.display='flex';
  var bs=E.cf.querySelectorAll('button');
  bs[0].addEventListener('click',function(){E.cf.style.display='none';xoa();});
  bs[1].addEventListener('click',function(){E.cf.style.display='none';});}
/* SẮP XẾP: bấm đổi kiểu xếp (nhặt -> tên -> số lượng) */
function xep(){sortMode=(sortMode+1)%3;saveMeta();page=0;toast(SORTN[sortMode]);render();}
function render(){
  var nl=ids('luoi'),bg=ids('bong'),i;
  if(page>pages()-1)page=pages()-1;
  if(sel&&(!CAT[sel]||count(sel)<=0))sel=null;
  E.cap.textContent=nl.length+'/'+CAP;E.pg.textContent=(page+1)+'/'+pages();E.pv.disabled=page<=0;E.nx.disabled=page>=pages()-1;
  for(i=0;i<E.slots.length;i++){var id=nl[page*PAGE+i],b=E.slots[i];
    if(id){var it=CAT[id];b.innerHTML='<span class="i">'+ic(it)+'</span>'+(lock[id]?'<span class="lk">🔒</span>':'')+'<span class="q">'+(count(id)>1?count(id):'')+'</span>';b.setAttribute('aria-label',it.ten);}
    else{b.innerHTML='';b.removeAttribute('aria-label');}
    b.classList.toggle('sel',id===sel&&!!id&&!multi);b.classList.toggle('pk',!!id&&!!picks[id]);}
  E.balls.innerHTML='';
  if(!bg.length){var em=document.createElement('div');em.className='bl-emp';em.textContent='Chưa có Ngự Thú Châu';E.balls.appendChild(em);}
  bg.forEach(function(id){var it=CAT[id],r=document.createElement('div');r.className='bl-row'+(id===sel&&!multi?' sel':'')+(picks[id]?' pk':'');
    r.innerHTML='<span class="i">'+ic(it)+'</span><span class="n">'+esc(it.ten)+'</span>'+(lock[id]?'<span class="lk">🔒</span>':'')+(it.cap?'<span class="l">Cấp '+it.cap+'</span>':'')+'<span class="q">x'+count(id)+'</span>';
    r.addEventListener('click',function(){pick(id);});E.balls.appendChild(r);});
  for(var k in picks)if(!CAT[k]||count(k)<=0)delete picks[k];
  var tg=targets(),allLk=!!(tg.length&&tg.every(function(x){return lock[x];}));
  E.bt.khoa.setAttribute('aria-label',allLk?'Mở khóa':'Khóa');E.ovK.classList.toggle('on',allLk);   /* đang chọn món đã khóa -> hiện nút MỞ KHÓA */
  E.bt.chon.setAttribute('aria-label',multi?'Bỏ chọn':'Chọn');E.ovC.classList.toggle('on',multi);   /* đang chọn nhiều -> hiện nút BỎ CHỌN */
  var d=E.dt,oldDs=d.querySelector('.dt-ds'),keepSc=(oldDs&&d.getAttribute('data-sel')===String(sel))?oldDs.scrollTop:0;
  d.setAttribute('data-sel',sel?String(sel):'');
  if(sel){var s=CAT[sel];d.innerHTML='<div class="dt-ic">'+ic(s)+'</div><div class="dt-nm">'+esc(s.ten)+'</div><div class="dt-mt">'+esc(LOAI[s.loai]||'')+(s.loai==='sach'&&s.he&&window.TTGCS&&TTGCS.heVi?' · Hệ '+TTGCS.heVi(s.he):'')+(s.cap?' · Cấp '+s.cap:'')+' · Số lượng: '+count(sel)+(lock[sel]?' · 🔒':'')+'</div><div class="dt-ds">'+esc(s.mo||'')+'</div>';var nds=d.querySelector('.dt-ds');if(nds)nds.scrollTop=keepSc;}
  else d.innerHTML='<div class="dt-hint">Chạm một ô để xem thông tin</div>';
}
function open(){if(window.TTGTHU&&TTGTHU.close)TTGTHU.close();/* mở Balo -> đóng panel Thú Thần */
  if(!root)build();isOpen=true;openAt=performance.now();root.classList.add('on');unit();render();}
function close(){if(!root)return;E.cf.style.display='none';multi=false;picks={};isOpen=false;root.classList.remove('on');}

/* ===== ICON NÚT BALO (SVG vẽ tay, màu SÁNG để nổi trên nền tối: balo vàng cam, túi xanh lam, khóa ngọc; nút tự có quầng sáng + phát sáng ở 52-nut-vuong.js) ===== */
var ICON='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="bkG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe680"/><stop offset="1" stop-color="#ff9a1f"/></linearGradient><linearGradient id="bkC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a6f6ff"/><stop offset="1" stop-color="#2d9cff"/></linearGradient></defs><path d="M24 14C24 3 40 3 40 14" fill="none" stroke="#5a2a00" stroke-width="5.6" stroke-linecap="round"/><path d="M24 14C24 3 40 3 40 14" fill="none" stroke="#fff0a8" stroke-width="3" stroke-linecap="round"/><rect x="5.5" y="33" width="9.5" height="19" rx="4.5" fill="url(#bkC)" stroke="#5a2a00" stroke-width="2.2"/><rect x="49" y="33" width="9.5" height="19" rx="4.5" fill="url(#bkC)" stroke="#5a2a00" stroke-width="2.2"/><path d="M14 28C14 18 21 12 32 12S50 18 50 28V52C50 58 47 61 42 61H22C17 61 14 58 14 52Z" fill="url(#bkG)" stroke="#5a2a00" stroke-width="2.6" stroke-linejoin="round"/><path d="M14 28C14 18 21 12 32 12S50 18 50 28C44 34 20 34 14 28Z" fill="#fff0a0" stroke="#5a2a00" stroke-width="2.2" stroke-linejoin="round"/><rect x="19.5" y="41" width="25" height="15" rx="4.5" fill="url(#bkC)" stroke="#5a2a00" stroke-width="2.2"/><path d="M20 47H44" stroke="#fff" stroke-opacity=".75" stroke-width="1.5"/><path d="M32 26.5L36.6 32 32 38.5 27.4 32Z" fill="#8ff6ff" stroke="#05556b" stroke-width="1.8" stroke-linejoin="round"/><path d="M32 28.5L34.2 32H32Z" fill="#fff"/><path d="M18.5 24C19.5 19 23.5 15.5 28 14.5" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2.2" stroke-linecap="round"/><path d="M56 6L57.2 9.6 60.8 10.8 57.2 12 56 15.6 54.8 12 51.2 10.8 54.8 9.6Z" fill="#fff"/></svg>';
TTGNV.add({id:'balo',ten:'Balo',icon:ICON,onTap:open,r:0}); /* r:0 = hàng trên, cùng hàng với Thú Thần */
/* list(): danh sách món trong lưới Balo (nguyên liệu + sách kỹ năng) theo kiểu sắp xếp hiện tại: [{id,n,ten,loai,ic,img,mo}]. Khung Cường hóa (72-khung-ren-cuong-hoa.js) đọc túi chính bằng hàm này. */
function list(){return ids('luoi').map(function(id){var c=CAT[id];return {id:id,n:inv[id]|0,ten:c.ten,loai:c.loai,ic:c.ic,img:c.img,mo:c.mo};});}
window.TTGBALO={open:open,close:close,add:add,count:count,reg:reg,CAT:CAT,xoaTrang:xoaTrang,list:list};
})();
