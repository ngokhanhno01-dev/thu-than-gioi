/* (22/11/2026) KHUNG MỚI 1667x865 (cắt nền xanh từ ảnh mới): 4 nút vẽ sẵn CHỌN / KHÓA / THÁO TRANG BỊ / VỨT BỎ + nút CHỈ SỐ dưới bục.
   CHỈ SỐ: mở bảng nổi liệt kê chỉ số cộng từ đồ đang mặc (TTGLT.tong) + buff bộ trang bị đang kích hoạt (TTGBO.sets). KHÓA: món khóa không vứt được (trường kh của món).
   CHỌN: bật chọn nhiều, hiện thêm 2 nút BỎ CHỌN / CHỌN TẤT CẢ (nut-trong.webp = khung nút CHỌN đã xóa chữ). THÁO TRANG BỊ: đổi thành "Trang Bị" khi món chọn chưa mặc.
   Các dòng mô tả bên dưới có thể còn ghi khung/nút cũ (1673x867, TRANG BỊ/VỨT BỎ): tọa độ MỚI ở khối khai báo bên dưới.
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
var BW=1667,BH=865,UB=1355,IMG='game-moi/khung-trang-bi.webp?v=4',OV_TRONG='game-moi/nut-trong.webp?v=1';   /* UB = thang đơn vị cũ cho cỡ chữ ({n}) */
var isOpen=false,openAt=0,root=null,fr=null,E={},raf=0,cur=null,petImg=null,petSrc='';
/* ===== THÚ TRÊN BỤC (chỗ chỉnh số, px ảnh khung 1798x798) =====
   cx = tâm ngang bục, by = đường chân thú (mặt bục), size = cạnh ảnh thú (ảnh gốc 192px, to quá sẽ mờ). */
var PET={cx:438,by:648,size:320};
var TXT={x:235,y:300,w:400,h:100};
/* THANH VÀNG TÊN + 3 Ô TRÒN (px ảnh khung 1673x867): tâm 3 ô tròn (353,240),(442,240),(531,240), ruột ~56px */
var HIEM={x:352,y:284,w:180,h:30};
var NM={x:292,y:160,w:300,h:36},OC_X=[353,442,531],OC_Y=240,OC_S=62;
/* vẽ thú + vòng rune/aura theo Rank trên canvas: CW x (CHU+DOWN) px ảnh, chân thú ở y=CHU. Thú vẽ 128 điểm logic (như ở sảnh) rồi phóng s=PET.size/128 lần */
var CV={w:460,up:420,down:70};
/* ===== VỊ TRÍ Ô (px ảnh khung 1673x867; ruột ô, vùng bấm nở ra 6px) ===== */
var SLOT_X=[115,670],SLOT_Y=[231,336,444,550],SLOT_W=85,SLOT_H=76;          /* 8 ô trang bị: cột trái = ô 0-3, cột phải = ô 4-7 */
var GRID_X=[887,981,1074,1170],GRID_Y=[191,297,406,513,620,724],GRID_W=70,GRID_H=75;   /* lưới túi 4x6 = 24 ô */
var INFO={x:1304,y:230,w:273,h:421};                                          /* bảng THÔNG TIN */
/* 4 NÚT đã VẼ SẴN trong ảnh khung mới (nút chỉ là vùng bấm trong suốt): hàng trên CHỌN / KHÓA, hàng dưới THÁO TRANG BỊ / VỨT BỎ. Nút CHỈ SỐ nằm dưới bục bên trái */
var BTN_CHON={x:1273,y:670,w:172,h:67},BTN_KHOA={x:1441,y:670,w:172,h:67},BTN_EQ={x:1268,y:741,w:177,h:64},BTN_VUT={x:1441,y:741,w:172,h:64},BTN_CS={x:322,y:790,w:240,h:52};
/* ảnh nút trống (nut-trong.webp, cắt từ nút CHỌN rồi xóa chữ) phủ lên nút vẽ sẵn khi đổi trạng thái, chữ viết bằng CSS: "Trang Bị" đè lên THÁO TRANG BỊ (món chọn chưa mặc), "Mở Khóa" đè lên KHÓA (món chọn đã khóa) */
/* 2 nút hiện thêm khi bật CHỌN (cũng từ nut-trong.webp), nằm cuối bảng THÔNG TIN: BỎ CHỌN (tắt chế độ chọn) / CHỌN TẤT CẢ */
var BTN_BC={x:1318,y:586,w:124,h:58},BTN_TC={x:1447,y:586,w:124,h:58};
/* bảng CHỈ SỐ (mở từ nút CHỈ SỐ): nằm giữa 2 cột ô trang bị, phía dưới 3 ô tròn */
var CSP={x:212,y:296,w:450,h:480};
/* BỐ CỤC 8 Ô: cột trái = ô 0-3, cột phải = ô 4-7 (từ trên xuống). 4 ô TRÊN = hàng 1-2 mỗi cột: ô 0 Vũ khí, ô 1 Áo giáp, ô 4 Nhẫn, ô 5 Ngọc bội. 4 ô DƯỚI (2, 3, 6, 7) = Bảo vật: dành cho 5 loại mới (Pháp Khí, Pháp Bảo, Linh Bảo, Tiên Khí, Thần Khí), mỗi ô nhận loại nào cũng được */
var SLOTN=['Vũ khí','Áo giáp','Danh hiệu (khung Nhân Vật)','Khung UI (khung Nhân Vật)','Nhẫn','Ngọc bội','Bảo vật 3','Bảo vật 4'];
/* ===== KHO TRANG BỊ =====
   items: [{uid,id,ten,ic|img,slot(0-7),mo}] (mọi món sở hữu), eq: {slot:uid} (món đang mặc). Túi = món không nằm trong eq.
   Lưu localStorage 'ttg_moi_trangbi_v1'. ?trangbi=demo: có sẵn vài món mẫu, không lưu. */
var KEY='ttg_moi_trangbi_v1',demo=/[?&]trangbi=demo/.test(location.search),items=[],eq={},sel=null,multi=false,picks={},csOpen=false;
(function(){if(demo){items=[{uid:'d1',id:'mu-da',ten:'Mũ da thú',ic:'🪖',slot:0,mo:'Mũ da cơ bản, nhẹ và bền.'},{uid:'d2',id:'ao-vai',ten:'Áo giáp vải',ic:'🥋',slot:1,mo:'Áo giáp vải dày.'},{uid:'d3',id:'giay-co',ten:'Giày cỏ linh',ic:'👢',slot:3,mo:'Giày bện từ cỏ linh, đi êm.'},{uid:'d4',id:'kiem-go',ten:'Kiếm gỗ',ic:'🗡️',slot:4,mo:'Kiếm tập luyện.'},{uid:'d5',id:'nhan-bac',ten:'Nhẫn bạc',ic:'💍',slot:6,mo:'Nhẫn bạc trơn.'},{uid:'d6',id:'mu-sat',ten:'Mũ sắt',ic:'⛑️',slot:0,mo:'Mũ sắt chắc chắn.'}];eq={0:'d1'};return;}
  try{var v=JSON.parse(localStorage.getItem(KEY)||'{}');if(v&&Array.isArray(v.items))items=v.items.filter(function(t){return t&&t.uid&&t.slot>=0&&t.slot<8;});if(v&&v.eq&&typeof v.eq==='object')eq=v.eq;}catch(e){}
  Object.keys(eq).forEach(function(k){if(!byUid(eq[k]))delete eq[k];});})();
function save(){try{if(window.TTGTHU&&TTGTHU.lamMoi)TTGTHU.lamMoi();}catch(e){}   /* đổi đồ -> trang chỉ số của Thú Thần cập nhật theo */
  if(demo)return;try{localStorage.setItem(KEY,JSON.stringify({items:items,eq:eq}));}catch(e){}}
/* fixEq(): đồng bộ eq theo ô thật của từng món (73 đổi ô cho món cũ) - món trùng ô thì trả về túi */
function fixEq(){var ne={},ch=false;Object.keys(eq).forEach(function(k){var t=byUid(eq[k]);if(!t)return;if(String(t.slot)!==k)ch=true;if(ne[t.slot]===undefined)ne[t.slot]=t.uid;else ch=true;});if(ch){eq=ne;save();if(isOpen)renderItems();}}
function byUid(u){for(var i=0;i<items.length;i++)if(items[i].uid===u)return items[i];return null;}
function isEq(u){for(var k in eq)if(eq[k]===u)return true;return false;}
/* (26/11/2026) Danh hiệu (dh) + Khung UI (khui) đã CHUYỂN sang khung Nhân Vật (90-nhan-vat-bang.js): khung Trang Bị của thú không hiện chúng nữa, dữ liệu vẫn nằm trong kho này */
function isNv(t){return !!(t&&(t.dh||t.khui));}
function bag(){return items.filter(function(t){return !isEq(t.uid)&&!isNv(t);});}
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
'.tb-pl{display:none;align-items:center;justify-content:center;background:url('+OV_TRONG+') 0 0/100% 100% no-repeat;font-family:var(--fh);font-weight:800;line-height:1;white-space:nowrap;color:#ffe9a0;-webkit-text-stroke:{1.2} #3b2200;paint-order:stroke fill;text-shadow:0 {2} 0 #5a3000,0 0 {6} rgba(0,0,0,.7)}',
'.tb-pl.on{display:flex}','.tb-pl.btn{cursor:pointer;touch-action:manipulation;border:0;padding:0}','.tb-pl.btn:active{filter:brightness(1.25)}',
'.tb-b.act{box-shadow:0 0 {14} {3} rgba(95,240,224,.85)}',
'.tb-c.pk::before{content:\"\";position:absolute;left:{3};top:{3};right:{3};bottom:{3};border:{3} solid #5ff0e0;border-radius:{6};box-shadow:0 0 {12} rgba(95,240,224,.7);pointer-events:none}',
'.tb-lk{position:absolute;left:{9};top:{7};font-size:{17};line-height:1;text-shadow:0 0 {3} #000;pointer-events:none}',
'.tb-cs{display:none;flex-direction:column;gap:{8};padding:{14} {16};background:rgba(6,12,44,.95);border:{3} solid #d9b13c;border-radius:{12};box-shadow:0 0 {26} rgba(0,0,0,.8);overflow:hidden}',
'.tb-cs.on{display:flex}',
'.tb-cs .h{display:flex;align-items:center;justify-content:space-between;font-family:var(--fh);font-weight:800;font-size:{25};color:#ffe58a;flex:none}',
'.tb-cs .h button{padding:0 {14};height:{34};border-radius:{8};border:{2} solid #c9992f;background:#1d1d5a;color:#ffe9a0;font-family:var(--fh);font-weight:800;font-size:{17};cursor:pointer}',
'.tb-cs .bd{padding-right:{6}}',
'.tb-cs .sec{margin:{8} 0 {4};font-family:var(--fh);font-weight:800;font-size:{19};color:#9fe4ff;border-bottom:{1} solid rgba(159,228,255,.35);padding-bottom:{3}}',
'.tb-cs .ln{display:flex;justify-content:space-between;font-size:{19};line-height:1.5;color:#dfe6ff}','.tb-cs .ln b{color:#46e07a;font-weight:800}',
'.tb-cs .bo{margin:{4} 0 {6};padding:{6} {10};border-radius:{8};background:rgba(40,60,140,.45);border:{1} solid rgba(255,211,77,.5)}',
'.tb-cs .bo .t{font-weight:800;font-size:{19};color:#ffe58a}','.tb-cs .bo .d{font-size:{17};color:#cfd6ff;line-height:1.45;margin-top:{3}}','.tb-cs .bo .d.m{color:#8a90c0}','.tb-cs .bo .d.a{color:#9dffb8}','.tb-cs .bo.off .t{color:#8a90c0}','.tb-cs .note{font-size:{16};color:#8a90c0;line-height:1.4;margin-bottom:{4}}',
'.tb-cs .em{font-size:{19};color:#8a90c0;padding:{4} 0}',
'.tb-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer}',   /* vùng bấm trong suốt đè lên nút X vẽ sẵn trong ảnh */
'.tb-cv{pointer-events:none}',
'.tb-oc{pointer-events:none;image-rendering:auto}',
'.tb-hiem{z-index:2;display:flex;align-items:center;justify-content:center;font-family:var(--fh);font-weight:800;font-size:{18};line-height:1;white-space:nowrap;border-radius:{14};background:rgba(4,12,40,.78);border:{1.5} solid currentColor;text-shadow:0 {1} {2} #000;pointer-events:none}',
'.tb-nm{display:flex;align-items:center;justify-content:center;padding:0 {10};font-family:var(--fh);font-weight:800;font-size:{20};line-height:1;white-space:nowrap;overflow:hidden;color:#3b2406;text-shadow:0 {1} 0 rgba(255,246,200,.7);pointer-events:none}',
'.tb-emp{display:flex;align-items:center;justify-content:center;text-align:center;font-size:{28};line-height:1.4;color:#7c83b8;padding:0 {20}}',
'.tb-c{padding:0;border:0;background:transparent;cursor:pointer;border-radius:{10};display:flex;align-items:center;justify-content:center;color:#fff}',
'.tb-c span{font-size:{40};line-height:1;filter:drop-shadow(0 {2} {3} rgba(0,0,0,.7))}','.tb-c img{width:76%;height:76%;object-fit:contain}',
'.tb-c.sel{box-shadow:0 0 0 {3} #fff3a0,0 0 {14} {4} rgba(255,211,77,.85);background:rgba(255,211,77,.12)}',
'.tb-c.eqd::after{content:\"\";position:absolute;right:{6};top:{6};width:{14};height:{14};border-radius:50%;background:#46e07a;box-shadow:0 0 {6} #46e07a;border:{2} solid #0b2a14}',
'.tb-c{position:absolute}',
'.tb-info{display:flex;flex-direction:column;align-items:center;gap:{6};padding:{16} {14};text-align:center;overflow:hidden;pointer-events:none}',
'.tb-info.mu{padding-bottom:{78}}',
'.tb-info .ic{width:100%;height:{132};flex:none;display:flex;align-items:center;justify-content:center}','.tb-info .ic span{font-size:{74}}','.tb-info .ic img{width:100%;height:100%;object-fit:contain}',
'.tb-info .nm{flex:none;font-family:var(--fh);font-weight:800;font-size:{25};color:#ffe58a;line-height:1.2}',
'.tb-info .sl{flex:none;font-size:{18};color:#9fe4ff}','.tb-info .st{flex:none;font-size:{18};color:#46e07a;font-weight:700}',
/* mô tả dài: THANH CUỘN (vuốt dọc / lăn chuột / kéo thanh vàng bên phải) */
'.tb-info .ds,.tb-cs .bd{flex:1 1 auto;min-height:0;width:100%;overflow-y:auto;overflow-x:hidden;touch-action:pan-y;pointer-events:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin;scrollbar-color:#d9b13c rgba(0,0,0,.35)}',
'.tb-info .ds{font-size:{20};line-height:1.45;color:#dfe6ff;text-align:left;padding-right:{6}}',
'.tb-info .ds::-webkit-scrollbar,.tb-cs .bd::-webkit-scrollbar{width:{7}}','.tb-info .ds::-webkit-scrollbar-track,.tb-cs .bd::-webkit-scrollbar-track{background:rgba(0,0,0,.35);border-radius:{4}}','.tb-info .ds::-webkit-scrollbar-thumb,.tb-cs .bd::-webkit-scrollbar-thumb{background:#d9b13c;border-radius:{4}}',
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
/* chọn: sel = uid món đang chọn (trong túi hoặc đang mặc). Bật CHỌN (multi) thì chạm nhiều ô, picks = {uid:1} */
function tgt(){var a=multi?Object.keys(picks).filter(function(u){return byUid(u);}):(sel&&byUid(sel)?[sel]:[]);return a;}
function tap(u){if(multi){if(picks[u])delete picks[u];else picks[u]=1;sel=u;}else sel=(sel===u)?null:u;renderItems();}
function pickBag(k){var t=bag()[k];if(!t){if(!multi)sel=null;renderItems();return;}tap(t.uid);}
function pickSlot(k){if(k===2||k===3){toast('Danh hiệu / Khung UI đã chuyển sang khung Nhân Vật');return;}var u=eq[k];if(!u){if(!multi)sel=null;renderItems();toast('Ô '+SLOTN[k]+' đang trống');return;}tap(u);}
/* KHÓA: món khóa không vứt được. Tất cả món đang chọn đã khóa -> mở khóa, ngược lại -> khóa hết */
function doKhoa(){var a=tgt();if(!a.length){toast('Chưa chọn trang bị');return;}
  var allL=a.every(function(u){return byUid(u).kh;});
  a.forEach(function(u){var t=byUid(u);if(allL)delete t.kh;else t.kh=1;});save();renderItems();toast(allL?'Đã mở khóa':'Đã khóa '+a.length+' món');}
/* CHỌN: bật/tắt chế độ chọn nhiều; BỎ CHỌN = tắt hẳn chế độ + xóa lựa chọn; CHỌN TẤT CẢ = chọn mọi món trong túi */
function doChon(){multi=!multi;picks={};if(multi&&sel)picks[sel]=1;toast(multi?'Chọn nhiều: chạm các ô cần chọn':'Đã tắt chọn nhiều');renderItems();}
function doBoChon(){multi=false;picks={};toast('Đã bỏ chọn');renderItems();}
function doChonAll(){var b=bag();if(!b.length){toast('Túi không có trang bị');return;}b.forEach(function(t){picks[t.uid]=1;});sel=b[0].uid;toast('Đã chọn tất cả '+b.length+' món');renderItems();}
/* TRANG BỊ / THÁO: nút dưới-trái vẽ sẵn chữ "Tháo Trang Bị"; khi món chọn CHƯA mặc thì ảnh phủ đổi thành "Trang Bị". Chọn nhiều: bấm = tháo hết món đang mặc trong số đã chọn (mặc đồ thì làm từng món). */
function doThao(){
  var a=tgt();if(!a.length){toast('Chưa chọn trang bị');return;}
  var mac=a.filter(isEq);
  if(!mac.length){if(multi){toast('Mặc đồ làm từng món: tắt Chọn rồi chọn 1 món');return;}doMac(a[0]);return;}
  mac.forEach(function(u){for(var k in eq)if(eq[k]===u)delete eq[k];});save();renderItems();
  toast(mac.length===1?'Đã tháo '+byUid(mac[0]).ten:'Đã tháo '+mac.length+' món');}
function doMac(u){
  var t=byUid(u);if(!t){toast('Chưa chọn trang bị');return;}
  if(isEq(t.uid)){toast('Món này đang được trang bị');return;}
  if(t.lv){var rt=window.TTGTHU&&TTGTHU.getRaTran?TTGTHU.getRaTran():null,lp=rt?Math.max(1,Math.floor(rt.lv||1)):1;if(lp<t.lv){toast('Cần thú đạt cấp '+t.lv+' để mặc món này');return;}}   /* như main: đủ cấp mới được mang */
  var old=eq[t.slot]?byUid(eq[t.slot]):null;eq[t.slot]=t.uid;save();renderItems();
  toast('Đã trang bị '+t.ten+(old?' (đã cất '+old.ten+' vào túi)':''));}
/* VỨT BỎ: hỏi lại, xóa hẳn món khỏi kho. Món đang mặc hoặc đã KHÓA thì không vứt được (chọn nhiều: bỏ qua các món đó). */
function doVut(){
  var a=tgt();if(!a.length){toast('Chưa chọn trang bị');return;}
  var ok=a.filter(function(u){return !isEq(u)&&!byUid(u).kh;});
  if(!ok.length){toast(a.every(isEq)?'Món đang mặc, hãy tháo hoặc thay món khác trước':'Trang bị đang khóa');return;}
  var xoa=function(){items=items.filter(function(x){return ok.indexOf(x.uid)<0;});ok.forEach(function(u){delete picks[u];if(sel===u)sel=null;});save();renderItems();toast(ok.length===1?'Đã vứt bỏ':'Đã vứt bỏ '+ok.length+' món');};
  var tx=ok.length===1?'Vứt bỏ <b>'+esc(byUid(ok[0]).ten)+'</b>?':'Vứt bỏ <b>'+ok.length+'</b> trang bị?';
  if(ok.length<a.length)tx+='<br><small>(bỏ qua '+(a.length-ok.length)+' món đang mặc/đã khóa)</small>';
  if(window.TTGTBAO&&TTGTBAO.confirm){TTGTBAO.confirm(tx,[{t:'Vứt bỏ',cls:'d',cb:xoa},{t:'Hủy'}]);return;}
  if(window.confirm('Vứt bỏ '+ok.length+' trang bị?'))xoa();}
function renderItems(){
  if(!E.cell)return;
  var b=bag(),i;
  if(sel&&!byUid(sel))sel=null;
  for(var pk in picks)if(!byUid(pk))delete picks[pk];
  for(i=0;i<E.cell.length;i++){var t=b[i],c=E.cell[i];c.innerHTML=t?icon(t)+(t.kh?'<span class="tb-lk">🔒</span>':''):'';c.classList.toggle('sel',!!t&&!multi&&t.uid===sel);c.classList.toggle('pk',!!t&&!!picks[t.uid]);c.classList.remove('eqd');}
  for(i=0;i<8;i++){var u=eq[i],ti=u&&byUid(u),c2=E.slot[i];if(isNv(ti))ti=null;c2.innerHTML=ti?icon(ti)+(ti.kh?'<span class="tb-lk">🔒</span>':''):'';c2.classList.toggle('sel',!!ti&&!multi&&ti.uid===sel);c2.classList.toggle('pk',!!ti&&!!picks[ti.uid]);c2.classList.toggle('eqd',!!ti);}
  var s=sel&&byUid(sel),a=tgt(),ik=multi?'m':(s?s.uid:''),od=E.info.querySelector('.ds'),sc=(od&&E.infoKey===ik)?od.scrollTop:0;
  E.infoKey=ik;
  if(multi){
    E.info.className='tb-info mu';
    E.info.innerHTML='<div class="nm">Chọn nhiều</div><div class="sl">Đã chọn '+a.length+' món</div><div class="ds">'+(a.length?a.map(function(u){return esc(byUid(u).ten)+(byUid(u).kh?' 🔒':'');}).join('<br>'):'Chạm vào các ô trang bị cần chọn')+'</div>';}
  else if(s){E.info.className='tb-info';E.info.innerHTML='<div class="ic">'+icon(s)+'</div><div class="nm">'+esc(s.ten)+(s.kh?' 🔒':'')+'</div><div class="sl">'+SLOTN[s.slot]+'</div>'+(isEq(s.uid)?'<div class="st">Đang trang bị</div>':'')+'<div class="ds">'+esc(s.mo||'').split(' · ').join('<br>')+'</div>';}
  else{E.info.className='tb-info em';E.info.textContent='Chọn một trang bị';}
  var nd=E.info.querySelector('.ds');if(nd&&sc)nd.scrollTop=sc;
  E.bChon.classList.toggle('act',multi);E.bBC.classList.toggle('on',multi);E.bTC.classList.toggle('on',multi);
  E.ovEq.classList.toggle('on',!a.some(isEq));          /* chưa chọn / món chọn chưa mặc -> nút hiện "Trang Bị"; món đã mặc -> hiện "Tháo Trang Bị" vẽ sẵn */
  E.ovKh.classList.toggle('on',!!a.length&&a.every(function(u){return byUid(u).kh;}));   /* món chọn đã khóa -> nút hiện "Mở Khóa" */
  if(csOpen)renderCs();
}
function btn(r,label,fn){var b=mk('button','tb-b',r.x,r.y,r.w,r.h);b.type='button';b.setAttribute('aria-label',label);b.addEventListener('click',fn);return b;}
function pl(r,txt,fs){var d=mk('div','tb-pl',r.x,r.y,r.w,r.h,txt);d.style.fontSize='calc(var(--u)*'+fs+')';return d;}
function plb(r,txt,fn){var b=mk('button','tb-pl btn',r.x,r.y,r.w,r.h,txt);b.type='button';b.style.fontSize='calc(var(--u)*19)';b.addEventListener('click',fn);return b;}
/* ===== BẢNG CHỈ SỐ: chỉ số cộng thêm từ đồ đang mặc + buff bộ ===== */
function fmtV(S,v){var t=S?S.t:'n';return '+'+(t==='f'?Math.round(v):Math.round(v*10)/10)+(t==='p'?'%':'');}
/* MÔ TẢ CHI TIẾT từng bộ (theo luật chiến đấu ở 70-bo-trang-bi.js); v = {ch,pct,mul} */
var BD={
 frost:function(v){return 'Khi bị đánh: '+v.ch+'% làm đối thủ choáng 1 lượt.';},
 mist:function(v){return 'Khi bị đánh: '+v.ch+'% giảm 50% sát thương nhận vào.';},
 cloud:function(v){return 'Cuối mỗi lượt: '+v.ch+'% ẩn mình trong mây, đòn kế tiếp của đối thủ bị hụt.';},
 wind:function(v){return 'Sau mỗi đòn trúng: '+v.ch+'% chém thêm, gây thêm '+v.pct+'% sát thương của đòn đó.';},
 thunder:function(v){return 'Sau mỗi đòn trúng: '+v.ch+'% giáng sét, gây thêm sát thương bằng '+(100+v.pct)+'% đòn vừa đánh.';},
 counter:function(v){return 'Khi đòn của đối thủ bị hụt: '+v.ch+'% phản kích, gây '+v.mul+'% sát thương cơ bản.';},
 sun:function(v){return 'Đánh mục tiêu còn trên 60% HP: +'+v.pct+'% sát thương.';},
 shield:function(v){return 'Đầu trận: nhận khiên bằng '+v.pct+'% HP tối đa.';},
 thorn:function(v){return 'Khi bị đánh: '+v.ch+'% phản lại '+v.pct+'% sát thương đã nhận.';},
 revive:function(v){return 'Khi gục lần đầu trong trận: hồi sinh với '+v.pct+'% HP tối đa (1 lần mỗi trận).';},
 grove:function(v){return 'Cuối mỗi lượt: hồi '+v.pct+'% HP tối đa (gấp đôi khi HP dưới 50%).';},
 lava:function(v){return 'Cuối mỗi lượt: '+v.ch+'% phun dung nham, gây sát thương bằng '+v.pct+'% Tấn công.';},
 ambush:function(v){return 'Đầu trận: '+v.ch+'% đòn đánh đầu tiên chắc chắn chí mạng.';},
 star:function(v){return 'Đòn chí mạng gây thêm +'+v.pct+'% sát thương.';},
 first:function(v){return 'Luôn ra đòn trước; đòn đầu tiên gây thêm +'+v.pct+'% sát thương.';},
 weaken:function(v){return 'Đầu trận: giảm '+v.pct+'% Tấn công của đối thủ.';},
 judge:function(v){return 'Đánh mục tiêu dưới 30% HP: +'+v.pct+'% sát thương.';}};
function setTxt(k,v){return BD[k]?BD[k](v):'';}
function renderCs(){
  if(!E.cs)return;
  var mac=dangMac(),h='',LT=window.TTGLT,BO=window.TTGBO,k;
  h+='<div class="h"><span>Chỉ số trang bị</span><button type="button" data-x="1">Đóng</button></div><div class="bd">';
  h+='<div class="ln"><span>Đang mặc</span><b>'+mac.length+'/6 món</b></div>';
  h+='<div class="sec">Chỉ số cộng thêm</div>';
  var T=LT&&LT.tong?LT.tong():{},n=0;
  if(LT&&LT.STATS)for(k in LT.STATS){if(T[k]){n++;h+='<div class="ln"><span>'+esc(LT.STATS[k].n)+'</span><b>'+fmtV(LT.STATS[k],T[k])+'</b></div>';}}
  if(!n)h+='<div class="em">'+(mac.length?'Các món đang mặc chưa có chỉ số':'Chưa mặc trang bị nào')+'</div>';
  h+='<div class="sec">Buff bộ trang bị</div>';
  h+='<div class="note">Mặc từ 2 món cùng bộ: kích hoạt mốc 2 món; đủ 4 món: mốc 4 món (mạnh hơn). Giá trị đang áp dụng đã nhân theo phẩm và vùng của các món.</div>';
  var act=BO&&BO.sets?BO.sets():[],cnt={},names={},m=0,on={};
  mac.forEach(function(t){var z=Math.floor(Number(t.bo));if(z>=0&&BO&&BO.SETS&&BO.SETS[z]){cnt[z]=(cnt[z]||0)+1;(names[z]=names[z]||[]).push(t.ten);}});
  function tiers(z,cur){var S=BO.SETS[z],K=S.k;return '<div class="d'+(cur===2?' a':' m')+'">'+(cur===2?'✔ ':'')+'Mốc 2 món (gốc): '+esc(setTxt(K,S.v2))+'</div><div class="d'+(cur===4?' a':' m')+'">'+(cur===4?'✔ ':'')+'Mốc 4 món (gốc): '+esc(setTxt(K,S.v4))+'</div>';}
  act.forEach(function(x){m++;h+='<div class="bo"><div class="t">'+esc(x.ten)+' ('+x.n+'/4) · '+(x.full?'Đủ bộ':'Mốc 2 món')+'</div>'
    +(names[x.z]?'<div class="d m">Đang mặc: '+esc(names[x.z].join(', '))+'</div>':'')
    +'<div class="d a">Đang áp dụng: '+esc(setTxt(x.k,x.v))+'</div>'+tiers(x.z,x.full?4:2)+'</div>';});
  act.forEach(function(x){on[x.z]=1;});
  for(var kk in cnt)if(!on[kk]){m++;h+='<div class="bo off"><div class="t">'+esc(BO.SETS[kk].ten)+' ('+cnt[kk]+'/4) · chưa kích hoạt</div><div class="d m">Đang mặc: '+esc(names[kk].join(', '))+'</div><div class="d">Cần mặc thêm '+(2-cnt[kk])+' món cùng bộ để kích hoạt.</div>'+tiers(+kk,0)+'</div>';}
  if(!m)h+='<div class="em">Chưa kích hoạt buff bộ nào (mặc từ 2 món cùng bộ)</div>';
  h+='</div>';
  E.cs.innerHTML=h;
  var x=E.cs.querySelector('[data-x]');if(x)x.addEventListener('click',toggleCs);}
function toggleCs(){csOpen=!csOpen;if(!E.cs)return;E.cs.classList.toggle('on',csOpen);if(csOpen)renderCs();}
function dangMac(){var o=[];for(var k in eq){var t=byUid(eq[k]);if(t&&!isNv(t))o.push(t);}return o;}
function build(){
  root=document.createElement('div');root.className='tb';
  fr=document.createElement('div');fr.className='tb-fr';root.appendChild(fr);
  /* thanh vàng = TÊN thú; 3 ô tròn = Lv / Bậc / Rank (cùng cách vẽ với panel Thú Thần); tiêu đề TRANG BỊ đã vẽ sẵn trong khung */
  E.nm=mk('div','tb-nm',NM.x,NM.y,NM.w,NM.h);
  E.hiem=mk('div','tb-hiem',HIEM.x,HIEM.y,HIEM.w,HIEM.h);   /* nhãn ĐỘ HIẾM loài: ngay dưới hàng 3 ô tròn */
   E.oc=OC_X.map(function(cx){var c=mk('canvas','tb-oc',cx-OC_S/2,OC_Y-OC_S/2,OC_S,OC_S);c.width=c.height=208;return c;});
  E.cv=mk('canvas','tb-cv',PET.cx-CV.w/2,PET.by-CV.up,CV.w,CV.up+CV.down);
  E.emp=mk('div','tb-emp',TXT.x,TXT.y,TXT.w,TXT.h,'Chưa có Thú ra trận');
  /* 8 ô trang bị (2 cột bên) + lưới túi 4x6 + bảng THÔNG TIN + 2 nút dưới bảng */
  E.slot=[];for(var i=0;i<8;i++)(function(k){var c=cell(SLOT_X[k<4?0:1],SLOT_Y[k%4],SLOT_W,SLOT_H);c.setAttribute('aria-label',SLOTN[k]);c.addEventListener('click',function(){pickSlot(k);});E.slot.push(c);})(i);
  E.cell=[];for(var r=0;r<6;r++)for(var q=0;q<4;q++)(function(k){var c=cell(GRID_X[k%4],GRID_Y[(k/4)|0],GRID_W,GRID_H);c.addEventListener('click',function(){pickBag(k);});E.cell.push(c);})(r*4+q);
  E.info=mk('div','tb-info',INFO.x,INFO.y,INFO.w,INFO.h);
  E.bChon=btn(BTN_CHON,'Chọn',doChon);E.bKhoa=btn(BTN_KHOA,'Khóa',doKhoa);E.bThao=btn(BTN_EQ,'Tháo Trang Bị',doThao);btn(BTN_VUT,'Vứt Bỏ',doVut);btn(BTN_CS,'Chỉ Số',toggleCs);
  E.ovEq=pl(BTN_EQ,'Trang Bị',25);E.ovKh=pl(BTN_KHOA,'Mở Khóa',25);   /* ảnh nút trống phủ khi đổi trạng thái (pointer-events none: bấm vẫn xuống nút trong suốt bên dưới) */
  E.ovEq.style.pointerEvents='none';E.ovKh.style.pointerEvents='none';
  E.bBC=plb(BTN_BC,'Bỏ chọn',doBoChon);E.bTC=plb(BTN_TC,'Chọn tất cả',doChonAll);   /* chỉ hiện khi bật CHỌN */
  E.cs=mk('div','tb-cs',CSP.x,CSP.y,CSP.w,CSP.h);
  E.ts=document.createElement('div');E.ts.className='tb-ts';root.appendChild(E.ts);
  /* nút X vẽ sẵn trong ảnh (tâm ~ x1587,y84): vùng bấm trong suốt 124x124 */
  var x=mk('button','tb-x',1525,22,124,124);x.type='button';x.setAttribute('aria-label','Đóng');x.addEventListener('click',close);
  document.body.appendChild(root);
  /* bấm ra ngoài khung thì đóng (chặn 400ms đầu để cú chạm mở không đóng luôn) */
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  /* Esc: bắt ở pha capture và chặn lại, để chỉ đóng khung này, KHÔNG đóng luôn panel Thú Thần bên dưới */
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape'){e.stopImmediatePropagation();if(csOpen){toggleCs();return;}close();}},true);
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
  var hm=t&&window.TTGCS&&TTGCS.hiemInfo?TTGCS.hiemInfo(t.id):null;E.hiem.style.display=hm?'flex':'none';if(hm){E.hiem.textContent=hm.ten;E.hiem.style.color=hm.mau;E.hiem.classList.toggle('ttg-cau',!!hm.cau);}
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
function open(){if(!root)build();multi=false;picks={};csOpen=false;E.cs.classList.remove('on');render();renderItems();isOpen=true;openAt=performance.now();root.classList.add('on');unit();sizeCv();fitName();if(!raf)raf=requestAnimationFrame(loop);}
function close(){if(!root)return;isOpen=false;multi=false;picks={};csOpen=false;if(E.cs)E.cs.classList.remove('on');root.classList.remove('on');}

function setBo(on){}   /* giữ lại cho tương thích: nút đổi Trang Bị/Tháo Trang Bị nay tự theo món đang chọn */
function apiMacVao(u){var t=byUid(u);if(!t||!(t.slot>=0&&t.slot<8))return false;eq[t.slot]=t.uid;save();if(isOpen)renderItems();return true;}   /* mang 1 món vào ô của nó (món cũ ở ô đó về túi) */
function apiThao(u){var f=false;for(var k in eq)if(eq[k]===u){delete eq[k];f=true;}if(f){save();if(isOpen)renderItems();}return f;}
function apiVut(u){var t=byUid(u);if(!t)return false;items=items.filter(function(x){return x.uid!==u;});for(var k in eq)if(eq[k]===u)delete eq[k];delete picks[u];if(sel===u)sel=null;save();if(isOpen)renderItems();return true;}   /* xóa hẳn khỏi kho (khung Nhân Vật dùng cho danh hiệu / khung UI) */
window.TTGTB={macVao:apiMacVao,thao:apiThao,vut:apiVut,isMac:isEq,isNv:isNv,fixEq:fixEq,open:open,close:close,isOpen:function(){return isOpen;},setBo:setBo,addItem:addItem,get:getItem,update:updItem,list:function(){return items.slice();},equipped:function(){return Object.assign({},eq);},dangMac:function(){var o=[];for(var k in eq){var t=byUid(eq[k]);if(t)o.push(t);}return o;}};   /* dangMac: danh sách món ĐANG MẶC (đọc trường bo = số vùng 0..16 của bộ, dùng cho luật bộ trang bị trong trận: 70-bo-trang-bi.js) */
})();
