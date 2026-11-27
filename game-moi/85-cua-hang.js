/* 85-cua-hang.js - KỲ TRÂN CÁC (cửa hàng). BƯỚC 2 (25/11/2026): khung + tiền tệ + 4 TAB sáng viền + LƯỚI Ô CUỘN + ĐỒNG HỒ LÀM MỚI 30 PHÚT. CHƯA có vật phẩm, chưa mua bán.
   ẢNH (đều cắt từ ảnh khung gốc 1672x941):
     khung-cua-hang.webp   = khung chính, đã XÓA 8 ô vuông và XÓA viền sáng của tab Tất Cả (4 tab đều ở trạng thái thường). Tiêu đề, nút X, nhãn tab, ô tiền, thanh dài dưới trái vẽ sẵn trong ảnh.
     cua-hang-sang.webp    = VIỀN SÁNG VÀNG cắt từ tab Tất Cả (347x160, chỉ phần quầng ngoài viền). Phủ lên tab đang chọn.
     cua-hang-tab-mask.webp= hình bóng tab (287x100) để làm sáng nhẹ thân tab đang chọn.
     cua-hang-o.webp       = 1 ô vuông vật phẩm (240x235), nhân bản thành lưới cuộn.
   TAB: Tất Cả / Đạo Cụ / Pháp Bảo / Đặc Biệt. Bấm tab nào thì tab đó sáng, lưới về đầu. Tab hiện tại: TTGSHOP.tab().
   LƯỚI: 4 cột, cuộn dọc bằng thanh cuộn vàng bên phải (vuốt hoặc kéo thanh). Số ô = max(CFG.oToiThieu, số món làm tròn lên bội của 4). Hiện CHƯA có món nên hiện 16 ô trống để thử cuộn (CFG.oToiThieu); khi có món thì đổi hàm items(tab).
   LÀM MỚI: CFG.lamMoiPhut = 30. Thanh dài dưới trái hiện "Làm mới sau: mm:ss". Mốc bắt đầu chu kỳ lưu ở localStorage khóa ttg_moi_cuahang_lm nên tắt game vẫn tính thời gian trôi. Hết 30 phút thì sang chu kỳ mới và gọi các hàm đăng ký bằng TTGSHOP.onRefresh(fn) (sau này dùng để đổi hàng bán).
   TIỀN: đọc từ 66-tien-te.js (TTGTIEN): ô trái (ngọc lam) = Tinh Thạch 'tt', ô phải (ngọc tím) = Thú Thần Thạch 'ttt'.
   Mở: nút Kỳ Trân Các (81-nut-moi.js gọi TTGSHOP.open). Đóng: nút X, chạm ngoài khung, Esc. Mọi tọa độ ở khối BOX, tính theo pixel ảnh khung (SW x SH). */
/* BƯỚC 3 (25/11/2026): CÓ HÀNG BÁN. Tab Đặc Biệt (và Tất Cả) bán 2 món bằng Thú Thần Thạch, khai ở CFG.hang:
     Hộp Ngự Thú Ngẫu Nhiên 20 TTT, tối đa 10 hộp mỗi đợt làm mới | Rương Ngự Thú Tự Chọn 100 TTT, tối đa 5 rương mỗi đợt.
   Số lượt đã mua lưu ở khóa ttg_moi_cuahang_mua, gắn với mốc đợt làm mới (hết 30 phút sang đợt mới thì lượt mua về 0). Chạm ô -> hỏi xác nhận -> trừ tiền + cộng vào Balo (TTGBALO). Thêm món bán: thêm 1 dòng vào CFG.hang (id phải có trong TTGBALO.CAT; ten/ic chỉ là dự phòng). */
/* BƯỚC 2 NGỰ THÚ CHÂU (25/11/2026): tab Đạo Cụ (và Tất Cả) bán 3 ô Ngự Thú Châu NGẪU NHIÊN bằng TINH THẠCH, bốc lại mỗi đợt làm mới 30 phút. Cấu hình ở CFG.chau (trọng số bậc, số lượng, giá mỗi cái). 3 ô lưu ở khóa ttg_moi_cuahang_chau gắn với mốc anchor nên tải lại không đổi; mỗi ô chỉ mua 1 lần/đợt (xong hiện "Hết hàng"). Không đụng Hộp/Rương (86-hop-ruong.js). Bậc 6 không bán. */
/* (25/11/2026) CHẠM Ô: chạm HÌNH/TÊN = xem thông tin vật phẩm (hộp thoại, không trừ tiền); chạm NÚT GIÁ TIỀN mới là mua (hỏi xác nhận). Áp dụng mọi ô; chỉ đổi cách chạm ở file này, không đụng 86-hop-ruong.js. */
(function(){
'use strict';
var SW=1672,SH=941,V='?v=2',D='game-moi/';
var IMG=D+'khung-cua-hang.webp'+V,GLOW=D+'cua-hang-sang.webp'+V,MASK=D+'cua-hang-tab-mask.webp'+V,SLOT=D+'cua-hang-o.webp'+V;
var CFG={
  icTT:'game-moi/icon-tien/tt.webp?v=1',icTTT:'game-moi/icon-tien/ttt.webp?v=1',   /* icon tiền cắt từ khung-tien.webp */
  moTa:{'hop-ngu-thu-ngau-nhien':'Hộp quà chứa Ngự Thú Châu, mở ra mới biết bậc nào.','ruong-ngu-thu-tu-chon':'Rương quà chứa Ngự Thú Châu, bạn tự chọn loại khi mở.'},   /* dòng "Là gì" trong bảng thông tin (chỉ để đọc, không ảnh hưởng gì khác) */
  lamMoiPhut:30,      /* chu kỳ làm mới hàng (phút) */
  oToiThieu:16,       /* số ô tối thiểu mỗi tab (bội của 4). 16 = 4 hàng trống để thử cuộn; đặt 8 khi đã có món thật */
  key:'ttg_moi_cuahang_lm',
  keyMua:'ttg_moi_cuahang_mua',
  hang:[   /* tab: 'dao-cu' | 'phap-bao' | 'dac-biet'; tien: 'ttt' = Thú Thần Thạch, 'tt' = Tinh Thạch; toiDa = số lượt mua tối đa mỗi đợt làm mới */
    {id:'hop-ngu-thu-ngau-nhien',tab:'dac-biet',tien:'ttt',gia:20,toiDa:10,ten:'Hộp Ngự Thú Ngẫu Nhiên',ic:'🎁'},
    {id:'ruong-ngu-thu-tu-chon',tab:'dac-biet',tien:'ttt',gia:100,toiDa:5,ten:'Rương Ngự Thú Tự Chọn',ic:'🧰'}
  ],
  /* NGỰ THÚ CHÂU (Bước 2, 25/11/2026): 3 ô ngẫu nhiên, bán bằng TINH THẠCH, bốc lại mỗi đợt làm mới. Ai cũng có thể ra mọi bậc 1-5 theo trọng số (không giới hạn theo tiến độ). Bậc 6 KHÔNG bán (chỉ nhận từ NPC).
     trongSo = trọng số bốc bậc | soLuong = các số lượng có thể ra theo bậc (chọn đều) | gia = Tinh Thạch MỖI CÁI. Giá 1 ô = gia[bậc] x số lượng. Mỗi ô chỉ mua 1 lần mỗi đợt. */
  chau:{
    tab:'dao-cu',soO:3,key:'ttg_moi_cuahang_chau',
    trongSo:{1:30,2:25,3:20,4:12},   /* chỉ bán châu thường 1-4 (Hoàng..Thiên Giai). Châu 5, 6 (Đặc Biệt) KHÔNG bán ở Kỳ Trân Các (27/11/2026) */
    soLuong:{1:[10,5,3],2:[10,5,3],3:[5,3,1],4:[5,3,1]},
    gia:{1:30,2:50,3:70,4:90}
  }
};
var BOX={
  close:{x:1515,y:128,w:130,h:130},                        /* vùng bấm phủ lên nút X vẽ sẵn */
  tt:{x:1128,y:802,w:168,h:62},   /* căn giữa phần ô tối bên phải ngọc: tâm x=1212 */
  mtt:{x:1056,y:791,w:82,h:82},                            /* icon Tinh Thạch phủ lên ngọc vẽ sẵn (cùng icon ngoài sảnh) */
  mttt:{x:1334,y:791,w:82,h:82},                           /* icon Thú Thần Thạch phủ lên ngọc tím vẽ sẵn */
                              /* ô tiền trái: Tinh Thạch */
  ttt:{x:1408,y:802,w:176,h:62},                           /* ô tiền phải: Thú Thần Thạch */
  tab:{x:86,y0:279,w:287,h:100,pitch:110},                 /* 4 tab xếp dọc: y = y0 + pitch * thứ tự */
  glow:{ox:-30,oy:-30,w:347,h:160},                        /* viền sáng: lệch so với góc tab, cỡ ảnh cua-hang-sang.webp */
  list:{x:396,y:244,w:1160,h:484,padL:9,padT:4,cw:284,ch:245,sw:240,sh:235},   /* vùng cuộn; padL/padT = ô đầu cách mép; cw/ch = bước cột/hàng; sw/sh = cỡ 1 ô */
  timer:{x:122,y:818,w:462,h:54}                           /* thanh dài dưới trái: đồng hồ làm mới */
};
var TABS=[{id:'all',ten:'Tất Cả'},{id:'dao-cu',ten:'Đạo Cụ'},{id:'phap-bao',ten:'Pháp Bảo'},{id:'dac-biet',ten:'Đặc Biệt'}];
var root,fr,E={},isOpen=false,openAt=0,timer=0,cur='all',anchor=0,hooks=[];

var css=[
'.sh{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.sh.on{display:flex}',
'.sh-fr{position:relative;width:min(98vw,calc(96vh*'+SW+'/'+SH+'));aspect-ratio:'+SW+'/'+SH+';background:url('+IMG+') 0 0/100% 100% no-repeat;--u:1px;animation:sh-in .18s ease-out}',
'@keyframes sh-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}',
'.sh-fr>*{position:absolute;box-sizing:border-box}',
'.sh-x{padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer;touch-action:manipulation}',
'.sh-x:active{box-shadow:0 0 calc(var(--u)*24) rgba(255,224,102,.85),inset 0 0 calc(var(--u)*24) rgba(255,224,102,.35)}',
'.sh-m{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*34);line-height:1;white-space:nowrap;overflow:hidden;pointer-events:none;text-shadow:0 0 calc(var(--u)*6) #02061c,calc(var(--u)*2) calc(var(--u)*2) 0 #02061c,calc(var(--u)*-2) calc(var(--u)*2) 0 #02061c}',
'.sh-mi{object-fit:contain;pointer-events:none;filter:drop-shadow(0 0 calc(var(--u)*4) rgba(2,6,28,.8))}',
'.sh-m.sh-tt{color:#bdf3ff}.sh-m.sh-ttt{color:#e6c8ff}',
'.sh-m.lm{color:#ffe9a0;font-size:calc(var(--u)*34);letter-spacing:calc(var(--u)*.5)}',   /* đồng hồ làm mới */
/* TAB: nút trong suốt phủ lên nhãn vẽ sẵn; tab đang chọn bật viền sáng (.sh-gl) + làm sáng thân (.sh-lt) */
'.sh-tab{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation;overflow:visible;z-index:1}',
'.sh-tab.on{z-index:2}',
'.sh-gl,.sh-lt{position:absolute;pointer-events:none;opacity:0;transition:opacity .18s}',
'.sh-gl{background:url('+GLOW+') 0 0/100% 100% no-repeat}',
'.sh-lt{left:0;top:0;width:100%;height:100%;background:linear-gradient(180deg,#ffc24d,#e07a10);mix-blend-mode:screen;-webkit-mask:url('+MASK+') 0 0/100% 100% no-repeat;mask:url('+MASK+') 0 0/100% 100% no-repeat}',
'.sh-tab.on .sh-gl{opacity:1}',
'.sh-tab.on .sh-lt{opacity:.16}',
'.sh-tab:active .sh-lt{opacity:.3}',
/* LƯỚI Ô CUỘN */
'.sh-ls{overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch}',
'.sh-ls::-webkit-scrollbar{width:calc(var(--u)*20)}',
'.sh-ls::-webkit-scrollbar-track{margin:calc(var(--u)*10) 0;border-radius:calc(var(--u)*10);background:rgba(2,8,40,.72);border:calc(var(--u)*2) solid #8a6a22}',
'.sh-ls::-webkit-scrollbar-thumb{border-radius:calc(var(--u)*10);border:calc(var(--u)*2) solid #5a3a00;background:linear-gradient(90deg,#ffe48a,#d99a24 55%,#ffd66b)}',
'.sh-gd{display:grid;grid-template-columns:repeat(4,calc(var(--u)*'+BOX.list.sw+'));grid-auto-rows:calc(var(--u)*'+BOX.list.sh+');column-gap:calc(var(--u)*'+(BOX.list.cw-BOX.list.sw)+');row-gap:calc(var(--u)*'+(BOX.list.ch-BOX.list.sh)+');padding:calc(var(--u)*'+BOX.list.padT+') 0 calc(var(--u)*10) calc(var(--u)*'+BOX.list.padL+')}',
'.sh-o{position:relative;width:calc(var(--u)*'+BOX.list.sw+');height:calc(var(--u)*'+BOX.list.sh+');background:url('+SLOT+') 0 0/100% 100% no-repeat}',
'.sh-o.hg{cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.sh-o.hg:active{filter:brightness(1.25)}',
'.sh-o.het .sh-ic,.sh-o.het .sh-nm{opacity:.4;filter:grayscale(.7)}',
'.sh-o>*{position:absolute;box-sizing:border-box;pointer-events:none}',
'.sh-o.hg .sh-pr{pointer-events:auto;cursor:pointer}',   /* CHỈ nút giá nhận chạm để MUA; chạm hình/tên/phần còn lại của ô thì xem thông tin */
/* BẢNG THÔNG TIN VẬT PHẨM (chạm hình/tên ô): chữ nhỏ gọn, phần mô tả có thanh cuộn */
'.sh-tin{left:0;top:0;right:0;bottom:0;display:none;align-items:center;justify-content:center;background:rgba(2,4,20,.62);z-index:5}',
'.sh-tin.on{display:flex}',
'.sh-tb{width:calc(var(--u)*600);max-width:92%;max-height:86%;box-sizing:border-box;display:flex;flex-direction:column;gap:calc(var(--u)*10);padding:calc(var(--u)*18) calc(var(--u)*22);border:calc(var(--u)*3) solid #c9992f;border-radius:calc(var(--u)*12);background:linear-gradient(180deg,#10226f,#07123f);box-shadow:0 0 calc(var(--u)*30) rgba(0,0,0,.8),inset 0 0 calc(var(--u)*20) rgba(80,140,255,.25);color:#e8ecff}',
'.sh-th{display:flex;align-items:center;gap:calc(var(--u)*16);flex:none}',
'.sh-ti{width:calc(var(--u)*88);height:calc(var(--u)*88);flex:none;display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*56);border:calc(var(--u)*2) solid #c9992f;border-radius:calc(var(--u)*10);background:radial-gradient(circle at 50% 35%,#34348f,#12123a)}',
'.sh-ti img{width:88%;height:88%;object-fit:contain}',
'.sh-tn{font-weight:800;font-size:calc(var(--u)*26);line-height:1.15;color:#ffe9a0}',
'.sh-tm{margin-top:calc(var(--u)*4);font-size:calc(var(--u)*17);line-height:1.3;color:#9fe8de}',
'.sh-td{flex:1 1 auto;min-height:calc(var(--u)*56);overflow-y:auto;overflow-x:hidden;padding-right:calc(var(--u)*8);font-size:calc(var(--u)*18);line-height:1.45;color:#cfd6ff;touch-action:pan-y;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}',
'.sh-td p{margin:0 0 calc(var(--u)*8)}',
'.sh-td b{color:#ffe9a0}',
'.sh-td::-webkit-scrollbar{width:calc(var(--u)*10)}',
'.sh-td::-webkit-scrollbar-track{border-radius:calc(var(--u)*5);background:rgba(2,8,40,.72)}',
'.sh-td::-webkit-scrollbar-thumb{border-radius:calc(var(--u)*5);background:linear-gradient(90deg,#ffe48a,#d99a24)}',
'.sh-tx{flex:none;align-self:center;min-width:calc(var(--u)*150);height:calc(var(--u)*42);padding:0 calc(var(--u)*20);border:calc(var(--u)*2) solid #8a6a22;border-radius:calc(var(--u)*8);background:linear-gradient(180deg,#fff3bd,#f7cf62 45%,#e0a232);color:#3a2206;font-family:inherit;font-weight:800;font-size:calc(var(--u)*20);line-height:1;cursor:pointer;touch-action:manipulation}',
'.sh-tx:active{filter:brightness(1.15)}',
'.sh-ic{left:calc(var(--u)*30);top:calc(var(--u)*22);width:calc(var(--u)*180);height:calc(var(--u)*112);display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*80)}',
'.sh-ic img{width:100%;height:100%;object-fit:contain}',
'.sh-nm{left:calc(var(--u)*16);right:calc(var(--u)*16);top:calc(var(--u)*130);height:calc(var(--u)*44);display:flex;align-items:center;justify-content:center;text-align:center;font-weight:800;font-size:calc(var(--u)*21);line-height:1.1;color:#fff3c4;text-shadow:0 0 calc(var(--u)*5) #02061c,calc(var(--u)*2) calc(var(--u)*2) 0 #02061c}',
'.sh-sl{right:calc(var(--u)*26);top:calc(var(--u)*24);font-weight:800;font-size:calc(var(--u)*22);color:#ffe9a0;text-shadow:0 0 calc(var(--u)*4) #000,calc(var(--u)*1.5) calc(var(--u)*1.5) 0 #000}',
'.sh-pr{left:calc(var(--u)*43);top:calc(var(--u)*184);width:calc(var(--u)*157);height:calc(var(--u)*38);padding:0 calc(var(--u)*14) 0 calc(var(--u)*6);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*28);line-height:1;white-space:nowrap;color:#3a2206;background:linear-gradient(180deg,#fff3bd 0%,#f7cf62 42%,#e0a232 100%);clip-path:polygon(4% 0,96% 0,100% 50%,96% 100%,4% 100%,0 50%);box-shadow:inset 0 calc(var(--u)*-3) calc(var(--u)*4) rgba(150,90,10,.45);text-shadow:0 calc(var(--u)*1.5) 0 rgba(255,248,210,.85)}',
'.sh-ci{width:calc(var(--u)*34);height:calc(var(--u)*34);flex:none;object-fit:contain;filter:drop-shadow(0 calc(var(--u)*1.5) calc(var(--u)*2) rgba(60,30,0,.55))}',
'.sh-pn{flex:1;display:block;text-align:center;line-height:1;font-variant-numeric:tabular-nums;padding-top:calc(var(--u)*1)}',
'.sh-o.het .sh-pr{color:#7a1414;font-size:calc(var(--u)*24)}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);
[GLOW,MASK,SLOT].forEach(function(u){try{(new Image()).src=u;}catch(e){}});   /* tải trước cho lần mở đầu không nháy */

function box(c,b){var s=c.style;s.left=(b.x/SW*100)+'%';s.top=(b.y/SH*100)+'%';s.width=(b.w/SW*100)+'%';s.height=(b.h/SH*100)+'%';return c;}
function mk(tag,cls,b){var c=document.createElement(tag);c.className=cls;box(c,b);fr.appendChild(c);return c;}
function unit(){if(fr)fr.style.setProperty('--u',(fr.clientWidth/SW)+'px');}
function fmt(n){return window.TTGTIEN&&TTGTIEN.fmt?TTGTIEN.fmt(n):String(n);}
function get(k){return window.TTGTIEN?TTGTIEN.get(k):0;}
function fit(el,t,f0){if(el.textContent===t&&!el._dirty)return;el.textContent=t;el.style.fontSize='';var f=f0||34;while(f>12&&el.scrollWidth>el.clientWidth+1){f--;el.style.fontSize='calc(var(--u)*'+f+')';}}

/* ===== ĐỒNG HỒ LÀM MỚI ===== */
function chu(){return Math.max(1,CFG.lamMoiPhut)*60000;}
function loadAnchor(){var v=0;try{v=+localStorage.getItem(CFG.key)||0;}catch(e){}anchor=v;}
function saveAnchor(){try{localStorage.setItem(CFG.key,String(anchor));}catch(e){}}
/* Cập nhật mốc theo giờ máy; trả về số chu kỳ đã qua kể từ lần kiểm tra trước (>=1 nghĩa là vừa làm mới) */
function tick(){
  var now=Date.now(),C=chu(),n=0;
  if(!anchor||anchor>now){anchor=now;saveAnchor();return 0;}   /* lần đầu, hoặc đồng hồ máy bị chỉnh lùi: bắt đầu chu kỳ mới */
  if(now-anchor>=C){n=Math.floor((now-anchor)/C);anchor+=n*C;saveAnchor();hooks.forEach(function(f){try{f(n);}catch(e){}});}
  return n;
}
function remaining(){tick();return Math.max(0,chu()-(Date.now()-anchor));}
function mmss(ms){var s=Math.ceil(ms/1000),m=Math.floor(s/60);s%=60;return (m<10?'0':'')+m+':'+(s<10?'0':'')+s;}

/* ===== LƯỚI ===== */
function items(tab){return CFG.hang.filter(function(h){return tab==='all'||h.tab===tab;});}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function cat(h){var c=window.TTGBALO&&TTGBALO.CAT&&TTGBALO.CAT[h.id];return c||{ten:h.ten,ic:h.ic};}
/* ===== LƯỢT MUA MỖI ĐỢT LÀM MỚI ===== */
var mua={a:0,n:{}};
try{var mv=JSON.parse(localStorage.getItem(CFG.keyMua)||'null');if(mv&&typeof mv==='object'&&mv.n)mua=mv;}catch(e){}
function saveMua(){try{localStorage.setItem(CFG.keyMua,JSON.stringify(mua));}catch(e){}}
function daMua(id){tick();if(mua.a!==anchor){mua={a:anchor,n:{}};saveMua();}return mua.n[id]|0;}   /* sang đợt mới (mốc đổi) thì lượt mua về 0 */
function conLai(h){return Math.max(0,h.toiDa-daMua(h.id));}
function tenTien(k){return k==='tt'?'Tinh Thạch':'Thú Thần Thạch';}
/* ===== 3 Ô NGỰ THÚ CHÂU: bốc 1 lần mỗi đợt làm mới, lưu theo mốc `anchor` (khóa CFG.chau.key) nên tải lại trang / mở lại cửa hàng KHÔNG đổi ô ===== */
var chau={a:0,o:[]};
try{var cv=JSON.parse(localStorage.getItem(CFG.chau.key)||'null');if(cv&&typeof cv==='object'&&Array.isArray(cv.o))chau=cv;}catch(e){}
function saveChau(){try{localStorage.setItem(CFG.chau.key,JSON.stringify(chau));}catch(e){}}
function idBong(c){return (window.TTGBONG&&TTGBONG.idBong)?TTGBONG.idBong(c):'bong-'+c;}
function bocBac(){var T=CFG.chau.trongSo,k,tong=0;for(k in T)tong+=T[k];var r=Math.random()*tong;for(k in T){r-=T[k];if(r<0)return +k;}return 1;}
function bocO(){var cap=bocBac(),L=CFG.chau.soLuong[cap]||[1];return {cap:cap,sl:L[Math.floor(Math.random()*L.length)],mua:0};}
function chauSet(){
  tick();
  var ok=chau.a===anchor&&chau.o.length===CFG.chau.soO&&chau.o.every(function(o){return o&&CFG.chau.gia[o.cap]&&o.sl>0;});
  if(!ok){chau={a:anchor,o:[]};for(var i=0;i<CFG.chau.soO;i++)chau.o.push(bocO());saveChau();}   /* sang đợt mới (mốc đổi) hoặc dữ liệu hỏng: bốc lại cả 3 ô */
  return chau;
}
function giaO(o){return CFG.chau.gia[o.cap]*o.sl;}
function catChau(o){var id=idBong(o.cap),c=window.TTGBALO&&TTGBALO.CAT&&TTGBALO.CAT[id];return c||{ten:'Ngự Thú Châu bậc '+o.cap,ic:'⚪'};}
function ents(tab){
  var L=items(tab).map(function(m){return {h:m};});
  if(tab==='all'||tab===CFG.chau.tab)chauSet().o.forEach(function(o,j){L.push({c:o,j:j});});   /* châu xếp SAU hàng cũ để không đổi vị trí Hộp/Rương */
  return L;
}
function cell(attr,het,it,nm,sl,pr){
  return '<div class="sh-o hg'+(het?' het':'')+'" '+attr+'><div class="sh-ic">'+(it.img?'<img src="'+esc(it.img)+'" alt="">':'<b style="font-weight:400">'+esc(it.ic||'?')+'</b>')+'</div><div class="sh-nm">'+esc(nm)+'</div><div class="sh-sl">'+sl+'</div><div class="sh-pr">'+pr+'</div></div>';
}
function renderList(){
  var L=ents(cur),n=Math.max(CFG.oToiThieu,Math.ceil(L.length/4)*4),h='',i,sc=E.ls?E.ls.scrollTop:0;
  for(i=0;i<n;i++){
    var e=L[i];
    if(!e){h+='<div class="sh-o"></div>';continue;}
    if(e.h){
      var m=e.h,it=cat(m),cl=conLai(m);
      h+=cell('data-i="'+CFG.hang.indexOf(m)+'"',cl<=0,it,it.ten||m.ten,cl+'/'+m.toiDa,(cl<=0?'Hết hàng':'<img class="sh-ci" src="'+(m.tien==='tt'?CFG.icTT:CFG.icTTT)+'" alt=""><span class="sh-pn">'+fmt(m.gia)+'</span>'));
    }else{
      var o=e.c,ic=catChau(o);
      h+=cell('data-c="'+e.j+'"',!!o.mua,ic,ic.ten,'x'+o.sl,(o.mua?'Hết hàng':'<img class="sh-ci" src="'+CFG.icTT+'" alt=""><span class="sh-pn">'+fmt(giaO(o))+'</span>'));
    }
  }
  E.gd.innerHTML=h;E.ls.scrollTop=sc;
}
function toast(t){if(window.TTGBAO)TTGBAO.toast(t,2200);}
function muaMon(m){
  var it=cat(m),cl=conLai(m);
  if(cl<=0){toast('Hết lượt mua, chờ đợt làm mới');return;}
  if(get(m.tien)<m.gia){toast('Không đủ '+tenTien(m.tien));return;}
  var xong=function(){
    if(conLai(m)<=0||get(m.tien)<m.gia||!window.TTGBALO||!window.TTGTIEN)return;
    TTGTIEN.add(m.tien,-m.gia);TTGBALO.add(m.id,1);mua.n[m.id]=(mua.n[m.id]|0)+1;saveMua();
    renderList();render();toast('Đã mua '+(it.ten||m.ten));
  };
  if(window.TTGBAO)TTGBAO.confirm('<div>Mua <b>'+esc(it.ten||m.ten)+'</b> với <b>'+fmt(m.gia)+'</b> '+tenTien(m.tien)+'?<br><small>Còn '+cl+'/'+m.toiDa+' lượt mua trong đợt này.</small></div>',[{t:'Mua',cb:xong},{t:'Hủy'}]);
  else xong();
}
function muaChau(j){
  var S=chauSet(),o=S.o[j];if(!o)return;
  if(o.mua){toast('Ô này đã mua, chờ đợt làm mới');return;}
  var it=catChau(o),tong=giaO(o),a0=S.a,nm=(it.ten||'Ngự Thú Châu')+' x'+o.sl;
  if(get('tt')<tong){toast('Không đủ '+tenTien('tt'));return;}
  var xong=function(){
    var S2=chauSet(),o2=S2.o[j];
    if(S2.a!==a0||!o2||o2.mua||get('tt')<tong||!window.TTGBALO||!window.TTGTIEN)return;   /* đợt đã làm mới / đã mua / hết tiền trong lúc hỏi xác nhận thì thôi */
    TTGTIEN.add('tt',-tong);TTGBALO.add(idBong(o2.cap),o2.sl);o2.mua=1;saveChau();
    renderList();render();toast('Đã mua '+nm);
  };
  if(window.TTGBAO)TTGBAO.confirm('<div>Mua <b>'+esc(nm)+'</b> với <b>'+fmt(tong)+'</b> '+tenTien('tt')+'?<br><small>('+CFG.chau.gia[o.cap]+' '+tenTien('tt')+' mỗi cái, mỗi ô chỉ mua được 1 lần mỗi đợt)</small></div>',[{t:'Mua',cb:xong},{t:'Hủy'}]);
  else xong();
}
/* XEM THÔNG TIN: chạm hình/tên ô hiện bảng nhỏ gọn (là gì + dùng làm gì), không trừ tiền. Chạm nút giá mới là mua. */
function hopTin(it,ten,meta,muc){
  if(!E.tin)return;
  var ic=it.img?'<img src="'+esc(it.img)+'" alt="">':'<b style="font-weight:400">'+esc(it.ic||'?')+'</b>';
  var ds=muc.filter(function(m){return m[1];}).map(function(m){return '<p><b>'+esc(m[0])+':</b> '+esc(m[1])+'</p>';}).join('')||'<p>Chưa có mô tả.</p>';
  E.tin.innerHTML='<div class="sh-tb"><div class="sh-th"><div class="sh-ti">'+ic+'</div><div><div class="sh-tn">'+esc(ten)+'</div><div class="sh-tm">'+meta+'</div></div></div><div class="sh-td">'+ds+'</div><button type="button" class="sh-tx">Đóng</button></div>';
  E.tin.classList.add('on');E.tinAt=performance.now();
}
function dongTin(){if(E.tin)E.tin.classList.remove('on');}
function xemMon(m){var it=cat(m),cl=conLai(m);
  hopTin(it,it.ten||m.ten,'Giá '+fmt(m.gia)+' '+tenTien(m.tien)+' · Còn '+cl+'/'+m.toiDa+' lượt đợt này',[['Thông tin',CFG.moTa[m.id]],['Công dụng',it.mo]]);}
function xemChau(j){var o=chauSet().o[j];if(!o)return;var it=catChau(o);
  hopTin(it,it.ten||('Ngự Thú Châu bậc '+o.cap),'Bậc '+o.cap+' · x'+o.sl+' · '+fmt(giaO(o))+' Tinh Thạch ('+CFG.chau.gia[o.cap]+'/cái)'+(o.mua?' · Đã mua':''),
   [['Thông tin','Ngự Thú Châu bậc '+o.cap+', quả châu dùng để bắt thú hoang.'],['Công dụng','Ném vào thú hoang khi thám hiểm để thu phục. '+(it.mo||'')]]);}
function setTab(id){
  cur=id;
  E.tabs.forEach(function(b){b.classList.toggle('on',b.getAttribute('data-id')===id);b.setAttribute('aria-pressed',b.getAttribute('data-id')===id?'true':'false');});
  renderList();E.ls.scrollTop=0;
}
function render(){if(!root)return;fit(E.tt,fmt(get('tt')));fit(E.ttt,fmt(get('ttt')));fit(E.lm,'Làm mới sau: '+mmss(remaining()));}

function build(){
  root=document.createElement('div');root.className='sh';
  fr=document.createElement('div');fr.className='sh-fr';root.appendChild(fr);
  E.ls=mk('div','sh-ls',BOX.list);E.gd=document.createElement('div');E.gd.className='sh-gd';E.ls.appendChild(E.gd);
  E.gd.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('.sh-o[data-i],.sh-o[data-c]');if(!c)return;var bamGia=!!(e.target.closest&&e.target.closest('.sh-pr'));if(c.hasAttribute('data-c')){var j=+c.getAttribute('data-c');if(bamGia)muaChau(j);else xemChau(j);return;}var m=CFG.hang[+c.getAttribute('data-i')];if(!m)return;if(bamGia)muaMon(m);else xemMon(m);});
  E.tabs=TABS.map(function(t,i){
    var T=BOX.tab,b=mk('button','sh-tab',{x:T.x,y:T.y0+T.pitch*i,w:T.w,h:T.h});b.type='button';b.setAttribute('data-id',t.id);b.setAttribute('aria-label',t.ten);
    var g=document.createElement('span'),l=document.createElement('span'),G=BOX.glow;g.className='sh-gl';l.className='sh-lt';
    g.style.left=(G.ox/T.w*100)+'%';g.style.top=(G.oy/T.h*100)+'%';g.style.width=(G.w/T.w*100)+'%';g.style.height=(G.h/T.h*100)+'%';
    b.appendChild(g);b.appendChild(l);
    b.addEventListener('click',function(){if(cur!==t.id)setTab(t.id);});
    return b;});
  E.tin=document.createElement('div');E.tin.className='sh-tin';fr.appendChild(E.tin);   /* bảng thông tin vật phẩm, phủ lên cả khung */
  E.tin.addEventListener('click',function(e){if(e.target===E.tin||(e.target.closest&&e.target.closest('.sh-tx'))){if(performance.now()-E.tinAt>250)dongTin();}});
  E.x=mk('button','sh-x',BOX.close);E.x.type='button';E.x.setAttribute('aria-label','Đóng');
  E.mtt=mk('img','sh-mi',BOX.mtt);E.mtt.src=CFG.icTT;E.mttt=mk('img','sh-mi',BOX.mttt);E.mttt.src=CFG.icTTT;E.tt=mk('div','sh-m sh-tt',BOX.tt);E.ttt=mk('div','sh-m sh-ttt',BOX.ttt);E.lm=mk('div','sh-m lm',BOX.timer);
  document.body.appendChild(root);
  E.x.addEventListener('click',close);
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape'){if(E.tin&&E.tin.classList.contains('on'))dongTin();else close();}});
  window.addEventListener('resize',function(){unit();E.tt._dirty=E.ttt._dirty=E.lm._dirty=true;render();E.tt._dirty=E.ttt._dirty=E.lm._dirty=false;});
}
function open(){
  if(window.TTGBALO&&TTGBALO.close)TTGBALO.close();
  if(window.TTGTHU&&TTGTHU.close)TTGTHU.close();
  if(!root)build();
  isOpen=true;openAt=performance.now();root.classList.add('on');unit();
  setTab('all');render();
  clearInterval(timer);timer=setInterval(function(){var was=anchor;render();if(anchor!==was&&isOpen)renderList();},250);   /* hết 30 phút -> làm mới lưới */
}
function close(){if(!root)return;dongTin();isOpen=false;root.classList.remove('on');clearInterval(timer);}

loadAnchor();tick();   /* chu kỳ chạy theo giờ máy kể cả khi chưa mở cửa hàng */
window.TTGSHOP={open:open,close:close,BOX:BOX,CFG:CFG,isOpen:function(){return isOpen;},tab:function(){return cur;},setTab:function(id){if(root)setTab(id);else cur=id;},lamMoiNgay:function(){anchor=Date.now()-chu();saveAnchor();tick();if(isOpen){renderList();render();}},remaining:remaining,onRefresh:function(f){if(typeof f==='function')hooks.push(f);}};
})();

/* NÚT TEST ẨN (menu ẩn khi chạm chữ "Danh Vọng", xem 80-danh-vong.js): +500 Thú Thần Thạch và +1000 Tinh Thạch để thử mua. Xóa khối này khi ra bản thật. */
(function(){
var T=window.TTGNV;if(!T||!T.add)return;
T.add({id:'lay-ttt',dev:true,ten:'Lấy Thú Thần Thạch',onTap:function(){
  if(!window.TTGTIEN)return;TTGTIEN.add('ttt',500);TTGTIEN.add('tt',1000);
  if(window.TTGBAO)TTGBAO.toast('TEST: +500 Thú Thần Thạch, +1.000 Tinh Thạch',2200);}});
T.add({id:'lam-moi-shop',dev:true,ten:'Làm mới Kỳ Trân Các',onTap:function(){   /* ép sang đợt mới ngay để thử bốc lại 3 ô châu + reset lượt mua */
  if(window.TTGSHOP&&TTGSHOP.lamMoiNgay)TTGSHOP.lamMoiNgay();if(window.TTGBAO)TTGBAO.toast('TEST: đã sang đợt làm mới mới',2000);}});
})();
