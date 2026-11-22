/* 55-trang-bi.js - Khung TRANG BỊ của thú (mở từ nút "Trang Bị" trong panel Thú Thần, 54-thu-than.js).
   Ảnh khung: game-moi/khung-trang-bi.webp (1798x798, khung xanh-vàng mới: chữ TRANG BỊ, nút X, chữ THÔNG TIN, 2 nút TRANG BỊ / VỨT BỎ đã VẼ SẴN trong ảnh). Hiển thị đúng cỡ gốc (1 pixel ảnh = 1 pixel máy) để không bị mờ, màn nhỏ thì tự co.
   MỌI TỌA ĐỘ tính theo PIXEL ẢNH ĐÃ CẮT 1798x798 (BW x BH). Cỡ chữ/độ dày trong CSS ({n}) vẫn tính theo thang cũ 1456 (UB) nên không phải chỉnh lại; --u = clientWidth/UB.
   TIẾN ĐỘ: KHUNG + đóng (nút X / bấm ra ngoài / Esc) + thú RA TRẬN đứng trên bục bên trái (có nhịp thở như ở sảnh).
   Không có thú ra trận (TTGTHU.getRaTran() = null) thì KHÔNG hiện thú, chỉ hiện chữ "Chưa có Thú ra trận".
   (21/11/2026) Khung mới 1673x867: thanh vàng = tên, 3 ô tròn = Lv/Bậc/Rank, thú có vòng rune + aura theo Rank (67-rune-rank.js).
   (21/11/2026) 8 ô trang bị + lưới túi 4x6 + bảng Thông Tin + nút TRANG BỊ / VỨT BỎ đã chạy (kho riêng 'ttg_moi_trangbi_v1', thử bằng ?trangbi=demo). Nút TRANG BỊ đổi thành \"Đã Trang Bị\" khi món chọn đang mặc.
   CHƯA LÀM: chỉ số cộng từ trang bị, nguồn rơi đồ, tháo trang bị, chia trang khi túi quá 24 món.
   Mở nằm ĐÈ LÊN panel Thú Thần (đóng khung này thì quay lại Thú Thần); đóng panel Thú Thần/mở Balo thì khung này cũng đóng.
   API: TTGTB.open() / .close() / .isOpen() */
(function(){
'use strict';
var BW=1673,BH=867,UB=1355,IMG='game-moi/khung-trang-bi.webp?v=3',OV_BO='game-moi/nut-da-trang-bi.webp?v=1';   /* UB = thang đơn vị cũ cho cỡ chữ ({n}) */
var isOpen=false,openAt=0,root=null,fr=null,E={},raf=0,cur=null,petImg=null,petSrc='';
/* ===== THÚ TRÊN BỤC (chỗ chỉnh số, px ảnh khung 1798x798) =====
   cx = tâm ngang bục, by = đường chân thú (mặt bục), size = cạnh ảnh thú (ảnh gốc 192px, to quá sẽ mờ). */
var PET={cx:437,by:656,size:320};
var TXT={x:235,y:300,w:400,h:100};
/* THANH VÀNG TÊN + 3 Ô TRÒN (px ảnh khung 1673x867): tâm 3 ô tròn (353,240),(442,240),(531,240), ruột ~56px */
var HIEM={x:352,y:284,w:180,h:30};
var NM={x:292,y:160,w:300,h:36},OC_X=[353,442,531],OC_Y=240,OC_S=62;
/* vẽ thú + vòng rune/aura theo Rank trên canvas: CW x (CHU+DOWN) px ảnh, chân thú ở y=CHU. Thú vẽ 128 điểm logic (như ở sảnh) rồi phóng s=PET.size/128 lần */
var CV={w:460,up:420,down:70};
/* ===== VỊ TRÍ Ô (px ảnh khung 1673x867; ruột ô, vùng bấm nở ra 6px) ===== */
var SLOT_X=[122,672],SLOT_Y=[231,337,447,556],SLOT_W=80,SLOT_H=76;          /* 8 ô trang bị: cột trái = ô 0-3, cột phải = ô 4-7 */
var GRID_X=[885,982,1077,1172],GRID_Y=[191,296,403,512,622,734],GRID_W=72,GRID_H=78;   /* lưới túi 4x6 = 24 ô */
var INFO={x:1303,y:221,w:283,h:496};                                          /* bảng THÔNG TIN */
var BTN_EQ={x:1284,y:746,w:153,h:66},BTN_VUT={x:1449,y:746,w:150,h:66};       /* nút TRANG BỊ / VỨT BỎ (đã vẽ sẵn trong ảnh) */
var OV_BOX={x:1276,y:738,w:170,h:82};                                         /* ảnh phủ \"Đã Trang Bị\" đè lên nút TRANG BỊ */
/* BỐ CỤC 8 Ô: cột trái = ô 0-3, cột phải = ô 4-7 (từ trên xuống). 4 ô TRÊN = hàng 1-2 mỗi cột: ô 0 Vũ khí, ô 1 Áo giáp, ô 4 Nhẫn, ô 5 Ngọc bội. 4 ô DƯỚI (2, 3, 6, 7) = Bảo vật: dành cho 5 loại mới (Pháp Khí, Pháp Bảo, Linh Bảo, Tiên Khí, Thần Khí), mỗi ô nhận loại nào cũng được */
var SLOTN=['Vũ khí','Áo giáp','Bảo vật 1','Bảo vật 2','Nhẫn','Ngọc bội','Bảo vật 3','Bảo vật 4'];
/* ===== KHO TRANG BỊ =====
   items: [{uid,id,ten,ic|img,slot(0-7),mo}] (mọi món sở hữu), eq: {slot:uid} (món đang mặc). Túi = món không nằm trong eq.
   Lưu localStorage 'ttg_moi_trangbi_v1'. ?trangbi=demo: có sẵn vài món mẫu, không lưu. */
var KEY='ttg_moi_trangbi_v1',demo=/[?&]trangbi=demo/.test(location.search),items=[],eq={},sel=null;
(function(){if(demo){items=[{uid:'d1',id:'mu-da',ten:'Mũ da thú',ic:'🪖',slot:0,mo:'Mũ da cơ bản, nhẹ và bền.'},{uid:'d2',id:'ao-vai',ten:'Áo giáp vải',ic:'🥋',slot:1,mo:'Áo giáp vải dày.'},{uid:'d3',id:'giay-co',ten:'Giày cỏ linh',ic:'👢',slot:3,mo:'Giày bện từ cỏ linh, đi êm.'},{uid:'d4',id:'kiem-go',ten:'Kiếm gỗ',ic:'🗡️',slot:4,mo:'Kiếm tập luyện.'},{uid:'d5',id:'nhan-bac',ten:'Nhẫn bạc',ic:'💍',slot:6,mo:'Nhẫn bạc trơn.'},{uid:'d6',id:'mu-sat',ten:'Mũ sắt',ic:'⛑️',slot:0,mo:'Mũ sắt chắc chắn.'}];eq={0:'d1'};return;}
  try{var v=JSON.parse(localStorage.getItem(KEY)||'{}');if(v&&Array.isArray(v.items))items=v.items.filter(function(t){return t&&t.uid&&t.slot>=0&&t.slot<8;});if(v&&v.eq&&typeof v.eq==='object')eq=v.eq;}catch(e){}
  Object.keys(eq).forEach(function(k){if(!byUid(eq[k]))delete eq[k];});})();
function save(){try{if(window.TTGTHU&&TTGTHU.lamMoi)TTGTHU.lamMoi();}catch(e){}   /* đổi đồ -> trang chỉ số của Thú Thần cập nhật theo */
  if(demo)return;try{localStorage.setItem(KEY,JSON.stringify({items:items,eq:eq}));}catch(e){}}
/* fixEq(): đồng bộ eq theo ô thật của từng món (73 đổi ô cho món cũ) - món trùng ô thì trả về túi */
function fixEq(){var ne={},ch=false;Object.keys(eq).forEach(function(k){var t=byUid(eq[k]);if(!t)return;if(String(t.slot)!==k)ch=true;if(ne[t.slot]===undefined)ne[t.slot]=t.uid;else ch=true;});if(ch){eq=ne;save();if(isOpen)renderItems();}}
function byUid(u){for(var i=0;i<items.length;i++)if(items[i].uid===u)return items[i];return null;}
function isEq(u){for(var k in eq)if(eq[k]===u)return true;return false;}
function bag(){return items.filter(function(t){return !isEq(t.uid);});}
function getItem(u){var t=byUid(u);return t?Object.assign({},t):null;}   /* bản sao 1 món theo uid (73-luat-trang-bi.js dùng khi cường hóa) */
function updItem(u,p){var t=byUid(u);if(!t||!p)return false;for(var k in p)t[k]=p[k];save();if(isOpen)renderItems();return true;}   /* sửa trường của 1 món (tên/cấp cường hóa...) rồi lưu */
function addItem(t){if(!t||!t.ten||!(t.slot>=0&&t.slot<8))return null;var o=Object.assign({},t);o.uid=o.uid||('tb'+Date.now().toString(36)+Math.random().toString(36).slice(2,6));items.push(o);save();if(isOpen)renderItems();return o.uid;}
function esc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function icon(t){return t.img?'<img src=\"'+esc(t.img)+'\" alt=\"\" draggable=\"false\">':'<span>'+esc(t.ic||'❔')+'</span>';}   /* khối chữ "Chưa có Thú ra trận" (giữa 2 cột ô trang bị, phía trên bục) */
/* NHỊP THỞ: giống sảnh, nhấp nhô sin(ts/380)*2 điểm logic (ảnh thú 128). */

var css=[
'.tb{--fh:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;position:fixed;left:0;top:0;right:0;bottom:0;z-index:62;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.tb.on{display:flex}',
'.tb-fr{position:relative;width:min(98vw,calc(96vh*1673/867));aspect-ratio:1673/867;background:url('+IMG+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.tb-fr>*{position:absolute;box-sizing:border-box}',
'.tb button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.tb-ov{display:none;pointer-events:none}','.tb-ov.on{display:block}',
'.tb-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}',   /* vùng bấm trong suốt đè lên nút X vẽ sẵn trong ảnh */
'.tb-cv{pointer-events:none}',
'.tb-oc{pointer-events:none;image-rendering:auto}',
'.tb-hiem{display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{18};line-height:1;white-space:nowrap;border-radius:{14};background:rgba(4,12,40,.78);border:{1.5} solid currentColor;text-shadow:0 {1} {2} #000;pointer-events:none}',
'.tb-nm{display:flex;align-items:center;justify-content:center;padding:0 {10};font-family:var(--fh);font-weight:800;font-size:{20};line-height:1;white-space:nowrap;overflow:hidden;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7);pointer-events:none}',
'.tb-emp{display:flex;align-items:center;justify-content:center;text-align:center;font-size:{28};line-height:1.4;color:#7c83b8;padding:0 {20}}',
'.tb-c{padding:0;border:0;background:transparent;cursor:pointer;border-radius:{10};display:flex;align-items:center;justify-content:center;color:#fff}',
'.tb-c span{font-size:{40};line-height:1;filter:drop-shadow(0 {2} {3} rgba(0,0,0,.7))}','.tb-c img{width:76%;height:76%;object-fit:contain}',
'.tb-c.sel{box-shadow:0 0 0 {3} #fff3a0,0 0 {14} {4} rgba(255,211,77,.85);background:rgba(255,211,77,.12)}',
'.tb-c.eqd::after{content:\"\";position:absolute;right:{6};top:{6};width:{14};height:{14};border-radius:50%;background:#46e07a;box-shadow:0 0 {6} #46e07a;border:{2} solid #0b2a14}',
'.tb-c{position:absolute}',
'.tb-info{display:flex;flex-direction:column;align-items:center;gap:{8};padding:{22} {16};text-align:center;overflow:hidden;pointer-events:none}',
'.tb-info .ic{width:{110};height:{110};display:flex;align-items:center;justify-content:center}','.tb-info .ic span{font-size:{82}}','.tb-info .ic img{width:100%;height:100%;object-fit:contain}',
'.tb-info .nm{font-family:var(--fh);font-weight:800;font-size:{26};color:#ffe58a;line-height:1.2}',
'.tb-info .sl{font-size:{18};color:#9fe4ff}','.tb-info .ds{font-size:{20};line-height:1.45;color:#dfe6ff}','.tb-info .st{font-size:{18};color:#46e07a;font-weight:700}',
'.tb-info.em{justify-content:center;font-size:{20};color:#7c83b8}',
'.tb-b{padding:0;border:0;background:transparent;cursor:pointer;border-radius:{12}}',
'.tb-b:active{background:rgba(255,230,140,.22)}',
'.tb-ts{position:fixed;left:50%;bottom:8%;transform:translateX(-50%);z-index:70;display:none;max-width:86vw;padding:.6em 1.2em;border-radius:12px;background:rgba(6,12,40,.92);border:1px solid #d9b13c;color:#fff3c4;font-size:15px;text-align:center;pointer-events:none}',
'.tb-t{display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{26};line-height:1;white-space:nowrap;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7)}'
].join('\n').replace(/\{(\d+(?:\.\d+)?)\}/g,'calc(var(--u)*$1)');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

function box(c,x,y,w,h){var s=c.style;s.left=(x/BW*100)+'%';s.top=(y/BH*100)+'%';s.width=(w/BW*100)+'%';s.height=(h/BH*100)+'%';return c;}
function mk(tag,cls,x,y,w,h,txt){var c=document.createElement(tag);if(cls)c.className=cls;if(txt!=null)c.textContent=txt;if(w)box(c,x,y,w,h);fr.appendChild(c);return c;}
/* KHÔNG PHÓNG TO QUÁ CỠ GỐC (như panel Thú Thần): muốn khung to hơn thì đổi MAXSCALE lên >1 */
var MAXSCALE=1;
function unit(){if(!fr)return;var d=window.devicePixelRatio||1;fr.style.maxWidth=(BW*MAXSCALE/d)+'px';fr.style.setProperty('--u',(fr.clientWidth/UB)+'px');sizeCv();}

function cell(x,y,w,h){var c=mk('button','tb-c',x-6,y-6,w+12,h+12);c.type='button';return c;}
var tsT=0;
function toast(t){if(window.TTGTBAO&&TTGTBAO.toast){TTGTBAO.toast(t,1800);return;}E.ts.textContent=t;E.ts.style.display='block';clearTimeout(tsT);tsT=setTimeout(function(){E.ts.style.display='none';},1800);}
/* chọn: sel = uid món đang chọn (trong túi hoặc đang mặc) */
function pickBag(k){var t=bag()[k];if(!t){sel=null;}else sel=(sel===t.uid)?null:t.uid;renderItems();}
function pickSlot(k){var u=eq[k];if(!u){sel=null;renderItems();toast('Ô '+SLOTN[k]+' đang trống');return;}sel=(sel===u)?null:u;renderItems();}
/* TRANG BỊ: mặc món chọn vào đúng ô; món cũ ở ô đó trở về túi. Món đang mặc thì nút hiện \"Đã Trang Bị\" (bấm chỉ báo). */
function doEquip(){
  var t=sel&&byUid(sel);if(!t){toast('Chưa chọn trang bị');return;}
  if(isEq(t.uid)){toast('Món này đang được trang bị');return;}
  if(t.lv){var rt=window.TTGTHU&&TTGTHU.getRaTran?TTGTHU.getRaTran():null,lp=rt?Math.max(1,Math.floor(rt.lv||1)):1;if(lp<t.lv){toast('Cần thú đạt cấp '+t.lv+' để mặc món này');return;}}   /* như main: đủ cấp mới được mang */
  var old=eq[t.slot]?byUid(eq[t.slot]):null;eq[t.slot]=t.uid;save();renderItems();
  toast('Đã trang bị '+t.ten+(old?' (đã cất '+old.ten+' vào túi)':''));}
/* VỨT BỎ: hỏi lại, xóa hẳn món khỏi kho. Món đang mặc không vứt được. */
function doVut(){
  var t=sel&&byUid(sel);if(!t){toast('Chưa chọn trang bị');return;}
  if(isEq(t.uid)){toast('Món đang mặc, hãy thay món khác trước');return;}
  var xoa=function(){items=items.filter(function(x){return x.uid!==t.uid;});if(sel===t.uid)sel=null;save();renderItems();toast('Đã vứt bỏ '+t.ten);};
  var tx='Vứt bỏ <b>'+esc(t.ten)+'</b>?';
  if(window.TTGTBAO&&TTGTBAO.confirm){TTGTBAO.confirm(tx,[{t:'Vứt bỏ',cls:'d',cb:xoa},{t:'Hủy'}]);return;}
  if(window.confirm('Vứt bỏ '+t.ten+'?'))xoa();}
function renderItems(){
  if(!E.cell)return;
  var b=bag(),i;
  if(sel&&!byUid(sel))sel=null;
  for(i=0;i<E.cell.length;i++){var t=b[i],c=E.cell[i];c.innerHTML=t?icon(t):'';c.classList.toggle('sel',!!t&&t.uid===sel);c.classList.remove('eqd');}
  for(i=0;i<8;i++){var u=eq[i],ti=u&&byUid(u),c2=E.slot[i];c2.innerHTML=ti?icon(ti):'';c2.classList.toggle('sel',!!ti&&ti.uid===sel);c2.classList.toggle('eqd',!!ti);}
  var s=sel&&byUid(sel);
  if(s){E.info.className='tb-info';E.info.innerHTML='<div class=\"ic\">'+icon(s)+'</div><div class=\"nm\">'+esc(s.ten)+'</div><div class=\"sl\">'+SLOTN[s.slot]+'</div><div class=\"ds\">'+esc(s.mo||'')+'</div>'+(isEq(s.uid)?'<div class=\"st\">Đang trang bị</div>':'');}
  else{E.info.className='tb-info em';E.info.textContent='Chọn một trang bị';}
  setBo(!!s&&isEq(s.uid));
}
function build(){
  root=document.createElement('div');root.className='tb';
  fr=document.createElement('div');fr.className='tb-fr';root.appendChild(fr);
  /* thanh vàng = TÊN thú; 3 ô tròn = Lv / Bậc / Rank (cùng cách vẽ với panel Thú Thần); tiêu đề TRANG BỊ đã vẽ sẵn trong khung */
  E.nm=mk('div','tb-nm',NM.x,NM.y,NM.w,NM.h);
  E.hiem=mk('div','tb-hiem',HIEM.x,HIEM.y,HIEM.w,HIEM.h);   /* nhãn ĐỘ HIẾM loài: ngay dưới hàng 3 ô tròn */
   E.oc=OC_X.map(function(cx){var c=mk('canvas','tb-oc',cx-OC_S/2,OC_Y-OC_S/2,OC_S,OC_S);c.width=c.height=208;return c;});
  E.cv=mk('canvas','tb-cv',PET.cx-CV.w/2,PET.by-CV.up,CV.w,CV.up+CV.down);
  E.emp=mk('div','tb-emp',TXT.x,TXT.y,TXT.w,TXT.h,'Chưa có Thú ra trận');
  /* nút BỎ TRANG BỊ: ảnh phủ (x1376,y682 cỡ 182x74) đè lên nút TRANG BỊ vẽ sẵn khi đang chọn món ĐÃ mặc; bật/tắt bằng TTGTB.setBo(true/false) (chờ làm 8 ô trang bị để nối) */
  E.ovB=mk('img','tb-ov',OV_BOX.x,OV_BOX.y,OV_BOX.w,OV_BOX.h);E.ovB.src=OV_BO;E.ovB.alt='';E.ovB.draggable=false;
  /* 8 ô trang bị (2 cột bên) + lưới túi 4x6 + bảng THÔNG TIN + 2 nút dưới bảng */
  E.slot=[];for(var i=0;i<8;i++)(function(k){var c=cell(SLOT_X[k<4?0:1],SLOT_Y[k%4],SLOT_W,SLOT_H);c.setAttribute('aria-label',SLOTN[k]);c.addEventListener('click',function(){pickSlot(k);});E.slot.push(c);})(i);
  E.cell=[];for(var r=0;r<6;r++)for(var q=0;q<4;q++)(function(k){var c=cell(GRID_X[k%4],GRID_Y[(k/4)|0],GRID_W,GRID_H);c.addEventListener('click',function(){pickBag(k);});E.cell.push(c);})(r*4+q);
  E.info=mk('div','tb-info',INFO.x,INFO.y,INFO.w,INFO.h);
  var bE=mk('button','tb-b',BTN_EQ.x,BTN_EQ.y,BTN_EQ.w,BTN_EQ.h);bE.type='button';bE.setAttribute('aria-label','Trang Bị');bE.addEventListener('click',doEquip);
  var bV=mk('button','tb-b',BTN_VUT.x,BTN_VUT.y,BTN_VUT.w,BTN_VUT.h);bV.type='button';bV.setAttribute('aria-label','Vứt Bỏ');bV.addEventListener('click',doVut);
  E.ts=document.createElement('div');E.ts.className='tb-ts';root.appendChild(E.ts);
  /* nút X vẽ sẵn trong ảnh (tâm ~ x1587,y84): vùng bấm trong suốt 124x124 */
  var x=mk('button','tb-x',1525,22,124,124);x.type='button';x.setAttribute('aria-label','Đóng');x.addEventListener('click',close);
  document.body.appendChild(root);
  /* bấm ra ngoài khung thì đóng (chặn 400ms đầu để cú chạm mở không đóng luôn) */
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  /* Esc: bắt ở pha capture và chặn lại, để chỉ đóng khung này, KHÔNG đóng luôn panel Thú Thần bên dưới */
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape'){e.stopImmediatePropagation();close();}},true);
  window.addEventListener('resize',unit);
}
/* hiện thú ra trận (lấy từ TTGTHU.getRaTran()); không có thì ẩn thú, hiện chữ */
function fitName(){var fs=20;E.nm.style.fontSize='calc(var(--u)*'+fs+')';while(E.nm.scrollWidth>E.nm.clientWidth+1&&fs>10){fs--;E.nm.style.fontSize='calc(var(--u)*'+fs+')';}}
function render(){
  var t=window.TTGTHU&&TTGTHU.getRaTran&&TTGTHU.getRaTran(),a=t&&TTGTHU.anh?TTGTHU.anh(t):'';
  cur=a?t:null;
  if(a){if(petSrc!==a){petSrc=a;petImg=new Image();petImg.src=a;}E.cv.style.display='';E.emp.style.display='none';}
  else{petSrc='';petImg=null;E.cv.style.display='none';E.emp.style.display='flex';}
  E.nm.textContent=t&&TTGTHU.ten?TTGTHU.ten(t):'';if(t)fitName();
  if(TTGTHU&&TTGTHU.badges)TTGTHU.badges(E.oc,t||null);
  var hm=t&&window.TTGCS&&TTGCS.hiemInfo?TTGCS.hiemInfo(t.id):null;E.hiem.style.display=hm?'flex':'none';if(hm){E.hiem.textContent=hm.ten;E.hiem.style.color=hm.mau;}
}
/* canvas thú + vòng rune + aura (giống sảnh/Thám Hiểm: lượt 'sau' = vòng+aura, vẽ thú, lượt 'truoc' = nửa vòng đè chân thú) */
function sizeCv(){if(!E.cv)return;var r=E.cv.getBoundingClientRect(),d=window.devicePixelRatio||1,w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(E.cv.width!==w||E.cv.height!==h){E.cv.width=w;E.cv.height=h;}}
function drawPet(ts){
  var cv=E.cv;if(!cv||cv.style.display==='none')return;
  var ctx=cv.getContext('2d'),S=PET.size/128,k=(cv.width/CV.w)*S,x=CV.w/2/S,gy=CV.up/S;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);ctx.setTransform(k,0,0,k,0,0);
  var rk=cur?(cur.bac||'C'):null;if(rk&&!(window.TTGBAO&&TTGBAO.RKC&&TTGBAO.RKC[rk]))rk='C';
  var R=window.TTGRUNE;
  if(R&&rk)R.ring(ctx,rk,x,gy,ts,'sau');
  var im=petImg&&petImg.complete&&petImg.naturalWidth?petImg:null;
  if(im){var sc=Math.min(128/im.naturalWidth,128/im.naturalHeight),w=im.naturalWidth*sc,h=im.naturalHeight*sc,bob=Math.sin(ts/380)*2;
    ctx.fillStyle='rgba(0,0,0,.2)';ctx.beginPath();ctx.ellipse(x,gy,34,5,0,0,6.2832);ctx.fill();
    ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(im,x-w/2,gy-h+bob,w,h);}
  if(R&&rk)R.ring(ctx,rk,x,gy,ts,'truoc');
}
function loop(ts){if(!isOpen){raf=0;return;}drawPet(ts);raf=requestAnimationFrame(loop);}
function open(){if(!root)build();render();renderItems();isOpen=true;openAt=performance.now();root.classList.add('on');unit();sizeCv();fitName();if(!raf)raf=requestAnimationFrame(loop);}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');}

function setBo(on){if(E.ovB)E.ovB.classList.toggle('on',!!on);}   /* on=true: hiện nút BỎ TRANG BỊ đè lên TRANG BỊ */
window.TTGTB={fixEq:fixEq,open:open,close:close,isOpen:function(){return isOpen;},setBo:setBo,addItem:addItem,get:getItem,update:updItem,list:function(){return items.slice();},equipped:function(){return Object.assign({},eq);},dangMac:function(){var o=[];for(var k in eq){var t=byUid(eq[k]);if(t)o.push(t);}return o;}};   /* dangMac: danh sách món ĐANG MẶC (đọc trường bo = số vùng 0..16 của bộ, dùng cho luật bộ trang bị trong trận: 70-bo-trang-bi.js) */
})();
