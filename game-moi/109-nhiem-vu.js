/* 109-nhiem-vu.js - BẢNG NHIỆM VỤ (nút "Nhiệm vụ" ở thanh nút, 81-nut-moi.js gọi TTGNHIEMVU.open).
   BƯỚC 1 (28/11/2026): khung + rương điểm hoạt động. BƯỚC 2: 2 tab đổi sáng + danh sách cuộn + thanh cuộn thật.
   BƯỚC 3 (28/11/2026): NỘI DUNG NHIỆM VỤ THẬT: Ngày 5 nhiệm vụ (100 điểm), Tuần 10 nhiệm vụ (100 điểm) => 35 + 10 = 45 nhiệm vụ / tuần.
   ẢNH: khung-nhiem-vu.webp (khung trống 1281x1164) | nhiem-vu-hang-trong.webp (1 hàng, KHÔNG có nút) | nhiem-vu-nut-sang.webp (nút Nhận sáng: đã xong, bấm được) | nhiem-vu-nut-xam.webp (nút Nhận xám: chưa xong) | "Đã nhận" = chữ xám vẽ bằng CSS | nhiem-vu-tab-sang.webp, nhiem-vu-ic-ngay/tuan.webp.
   3 TRẠNG THÁI NÚT: chưa xong = xám (bấm báo tiến độ) | xong chưa nhận = sáng (bấm để nhận thưởng + cộng điểm) | đã nhận = dấu "Đã nhận".
   ĐIỂM HOẠT ĐỘNG: cộng khi BẤM NHẬN (không cộng lúc hoàn thành). Mỗi tab có thanh điểm + 4 rương riêng (mốc 25/50/75/100).
   LÀM MỚI: tab Ngày reset 0h mỗi ngày; tab Tuần reset 0h sáng thứ Hai (giờ máy người chơi). Phần chưa nhận thì mất.
   LƯU: localStorage khóa ttg_moi_nhiemvu_v2.
   ĐẾM TIẾN ĐỘ: các file khác gọi TTGNHIEMVU.sk(sự kiện, giá trị). Sự kiện: 'thang' (thắng trận Thám Hiểm, truyền enemy), 'bat' (bắt thành công 1 thú), 'cuonghoa', 'tienhoa', 'mua' (1 lần mua ở Kỳ Trân Các), 'chi' (số Tinh Thạch đã chi, truyền số), 'bosstg' (đánh Boss Thế Giới), 'daututruong' (thắng Vạn Thú Tranh Phong - hệ thống chưa làm), 'daydu' (tự phát khi tab Ngày đủ 100 điểm).
   PHẦN THƯỞNG: {t:'tt'|'ttt'|'chau'|'hop'|'ruong', n:số, cap:bậc châu}. tt = Tinh Thạch, ttt = Thú Thần Thạch (TIỀN NẠP: chỉ phát ở chỗ đã chốt, KHÔNG cho ở Đấu Trường). Sửa số ở CFG.ngay / CFG.tuan / CFG.ruong.
   API: TTGNHIEMVU.open() | .close() | .isOpen() | .tab(t) | .sk(ev,v) | .diem() | .setDiem(n) (thử) | .xong(id) (thử: đặt nhiệm vụ đã đủ) | .daNhan(i) | .reset()
   Đóng: nút X, chạm ngoài khung, Esc. */
(function(){
'use strict';
var SW=1281,SH=1164,V='?v=3',D='game-moi/',IMG=D+'khung-nhiem-vu.webp'+V,SANG=D+'nhiem-vu-tab-sang.webp'+V,ICN=D+'nhiem-vu-ic-ngay.webp'+V,ICT=D+'nhiem-vu-ic-tuan.webp'+V,HANG=D+'nhiem-vu-hang-trong.webp'+V,BSANG=D+'nhiem-vu-nut-sang.webp'+V,BXAM=D+'nhiem-vu-nut-xam.webp'+V;
var IC={tt:D+'icon-tien/tt.webp?v=1',ttt:D+'icon-tien/ttt.webp?v=1',hop:D+'img/vat-pham/hop-ngu-thu-ngau-nhien.webp',ruong:D+'img/vat-pham/ruong-ngu-thu-tu-chon.webp'};
/* ===== DỮ LIỆU NHIỆM VỤ (chốt 28/11/2026) =====
   id | ten | mo (dòng mô tả) | ic (emoji tạm, đổi ảnh sau) | ev (sự kiện đếm) | need (mục tiêu) | diem (điểm hoạt động khi bấm Nhận) | th (thưởng)
   Điểm: Ngày 15+15+20+25+25 = 100 | Tuần 10 x 10 = 100. Đấu trường KHÔNG thưởng Thú Thần Thạch. Tinh Thạch đã nâng (chợ 50 -> 200). */
var CFG={
  key:'ttg_moi_nhiemvu_v2',
  moc:[25,50,75,100],
  ngay:[
    {id:'d1',ten:'Dạo Chợ Kỳ Trân',mo:'Mua 1 món ở Kỳ Trân Các',ic:'🛒',ev:'mua',need:1,diem:15,th:{t:'tt',n:200}},
    {id:'d2',ten:'Thám Hiểm',mo:'Thắng 10 trận Thám Hiểm',ic:'⚔️',ev:'thang',need:10,diem:15,th:{t:'tt',n:500}},
    {id:'d3',ten:'Săn Thú',mo:'Bắt thành công 3 thú',ic:'🐾',ev:'bat',need:3,diem:20,th:{t:'chau',cap:1,n:5}},
    {id:'d4',ten:'Rèn Luyện',mo:'Cường hóa trang bị 3 lần',ic:'🔨',ev:'cuonghoa',need:3,diem:25,th:{t:'tt',n:400}},
    {id:'d5',ten:'Diệt Thủ Lĩnh',mo:'Hạ 2 Boss khi Thám Hiểm',ic:'👹',ev:'bosskill',need:2,diem:25,th:{t:'ttt',n:2}}
  ],
  tuan:[
    {id:'w1',ten:'Thám Hiểm Bền Bỉ',mo:'Thắng 60 trận Thám Hiểm',ic:'🛡️',ev:'thang',need:60,diem:10,th:{t:'tt',n:2500}},
    {id:'w2',ten:'Bậc Thầy Săn Thú',mo:'Bắt 20 thú',ic:'🏹',ev:'bat',need:20,diem:10,th:{t:'chau',cap:2,n:5}},
    {id:'w3',ten:'Du Hành Các Vùng',mo:'Thám Hiểm ở 3 vùng khác nhau',ic:'🗺️',ev:'vung',need:3,diem:10,th:{t:'tt',n:1800}},
    {id:'w4',ten:'Thợ Rèn Chăm Chỉ',mo:'Cường hóa trang bị 20 lần',ic:'⚒️',ev:'cuonghoa',need:20,diem:10,th:{t:'tt',n:2200}},
    {id:'w5',ten:'Tiến Hóa',mo:'Tiến hóa thú 1 lần',ic:'🌟',ev:'tienhoa',need:1,diem:10,th:{t:'ttt',n:5}},
    {id:'w6',ten:'Sát Thủ Lĩnh',mo:'Hạ 10 Boss khi Thám Hiểm',ic:'💀',ev:'bosskill',need:10,diem:10,th:{t:'ttt',n:8}},
    {id:'w7',ten:'Đại Gia Kỳ Trân',mo:'Chi 2000 Tinh Thạch ở Kỳ Trân Các',ic:'💰',ev:'chi',need:2000,diem:10,th:{t:'ttt',n:3}},
    {id:'w8',ten:'Siêng Năng',mo:'Đạt đủ 100 điểm hoạt động ngày, 5 lần',ic:'📅',ev:'daydu',need:5,diem:10,th:{t:'chau',cap:3,n:3}},
    {id:'w9',ten:'Săn Boss Thế Giới',mo:'Đánh Boss Thế Giới 3 lần',ic:'🐉',ev:'bosstg',need:3,diem:10,th:{t:'ttt',n:10}},
    {id:'w10',ten:'Đấu Trường',mo:'Thắng 5 trận Vạn Thú Tranh Phong',ic:'🏟️',ev:'daututruong',need:5,diem:10,th:{t:'tt',n:3000}}
  ],
  ruong:{   /* rương mốc 25/50/75/100 điểm của từng tab */
    ngay:[{t:'tt',n:1000},{t:'chau',cap:1,n:10},{t:'ttt',n:5},{t:'hop',n:1}],
    tuan:[{t:'tt',n:3500},{t:'chau',cap:3,n:5},{t:'ttt',n:15},{t:'ruong',n:1}]
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
var root,fr,E={},isOpen=false,openAt=0,tab='ngay',loaded=false,S={ngay:null,tuan:null};

/* ===== TRẠNG THÁI + LÀM MỚI NGÀY/TUẦN ===== */
function dayKey(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function weekKey(){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return 'T'+d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function keyOf(t){return t==='ngay'?dayKey():weekKey();}
function blank(t){return {k:keyOf(t),diem:0,nhan:[0,0,0,0],q:{},vung:[]};}
function checkReset(){['ngay','tuan'].forEach(function(t){if(!S[t]||S[t].k!==keyOf(t))S[t]=blank(t);});}
function ld(){
  if(loaded){checkReset();return;}
  loaded=true;
  try{var j=JSON.parse(localStorage.getItem(CFG.key)||'null');
    if(j)['ngay','tuan'].forEach(function(t){var o=j[t];if(o&&typeof o==='object'&&o.k===keyOf(t)){S[t]={k:o.k,diem:Math.max(0,Math.min(100,+o.diem||0)),nhan:[0,1,2,3].map(function(i){return o.nhan&&o.nhan[i]?1:0;}),q:o.q&&typeof o.q==='object'?o.q:{},vung:Array.isArray(o.vung)?o.vung:[]};}});
  }catch(e){}
  checkReset();
}
function save(){try{localStorage.setItem(CFG.key,JSON.stringify(S));}catch(e){}}
function toast(t){var T=window.TTGTBAO&&TTGTBAO.toast;if(T)T(t,2400);}
function qs(t,id){var o=S[t].q;return o[id]||(o[id]={p:0,c:0});}

/* ===== PHẦN THƯỞNG ===== */
function chauItem(cap){try{return TTGBALO.CAT[TTGBONG.idBong(cap)]||null;}catch(e){return null;}}
function fmtN(n){return n>=1000?(Math.round(n/100)/10)+'K':String(n);}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function tenTh(r){
  if(r.t==='tt')return r.n+' Tinh Thạch';
  if(r.t==='ttt')return r.n+' Thú Thần Thạch';
  if(r.t==='hop')return r.n+' Hộp Ngự Thú Ngẫu Nhiên';
  if(r.t==='ruong')return r.n+' Rương Ngự Thú Tự Chọn';
  var it=chauItem(r.cap);return r.n+' '+(it&&it.ten?it.ten:('Ngự Thú Châu bậc '+r.cap));
}
function icTh(r){
  var u=IC[r.t],it;
  if(r.t==='chau'){it=chauItem(r.cap);if(it&&it.img)return '<img src="'+esc(it.img)+'" alt="">';return esc((it&&it.ic)||'⚪');}
  return u?'<img src="'+esc(u)+'" alt="">':'🎁';
}
function give(r){
  try{
    if(r.t==='tt'||r.t==='ttt'){if(window.TTGTIEN)TTGTIEN.add(r.t,r.n);}
    else if(r.t==='chau'){if(window.TTGBALO&&window.TTGBONG)TTGBALO.add(TTGBONG.idBong(r.cap),r.n);}
    else if(r.t==='hop'){if(window.TTGBALO)TTGBALO.add('hop-ngu-thu-ngau-nhien',r.n);}
    else if(r.t==='ruong'){if(window.TTGBALO)TTGBALO.add('ruong-ngu-thu-tu-chon',r.n);}
  }catch(e){}
}

/* ===== ĐẾM TIẾN ĐỘ (các file khác gọi TTGNHIEMVU.sk) ===== */
function tang(ev,n){
  if(!(n>0))return;
  ['ngay','tuan'].forEach(function(t){CFG[t].forEach(function(q){if(q.ev!==ev)return;var o=qs(t,q.id);if(o.c||o.p>=q.need)return;o.p=Math.min(q.need,o.p+n);});});
}
function vungMoi(z){
  var T=S.tuan;z=String(z);
  if(T.vung.indexOf(z)>=0)return;
  T.vung.push(z);
  CFG.tuan.forEach(function(q){if(q.ev==='vung'){var o=qs('tuan',q.id);if(!o.c)o.p=Math.min(q.need,T.vung.length);}});
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
'.nv{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.nv.on{display:flex}',
'.nv-fr{position:relative;width:min(98vw,calc(96vh*'+SW+'/'+SH+'));aspect-ratio:'+SW+'/'+SH+';background:url('+IMG+') 0 0/100% 100% no-repeat;--u:1px;animation:nv-in .18s ease-out}',
'@keyframes nv-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}',
'.nv-fr>*{position:absolute;box-sizing:border-box}',
'.nv-x,.nv-tab{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation}',
'.nv-x{border-radius:50%}',
'.nv-x:active{box-shadow:0 0 calc(var(--u)*24) rgba(255,224,102,.85),inset 0 0 calc(var(--u)*24) rgba(255,224,102,.35)}',
'.nv-tab:active{background:rgba(255,200,80,.12);border-radius:calc(var(--u)*18)}',
/* tab sáng + nhãn */
'.nv-sang{pointer-events:none;background:url('+SANG+') 0 0/100% 100% no-repeat;opacity:0;transition:opacity .2s}',
'.nv-sang.on{opacity:1}',
'.nv-ic{pointer-events:none;background:no-repeat center/100% 100%}',
'.nv-tx{pointer-events:none;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*33);line-height:1;white-space:nowrap;overflow:hidden;color:#c6ccdb;text-shadow:0 0 calc(var(--u)*4) #0a1638,calc(var(--u)*2) calc(var(--u)*2) 0 #0a1638,calc(var(--u)*-2) calc(var(--u)*2) 0 #0a1638,calc(var(--u)*2) calc(var(--u)*-2) 0 #0a1638,calc(var(--u)*-2) calc(var(--u)*-2) 0 #0a1638;transition:color .2s}',
'.nv-tx.on{color:#fff3d4;text-shadow:0 0 calc(var(--u)*4) #4a2400,calc(var(--u)*2) calc(var(--u)*2) 0 #4a2400,calc(var(--u)*-2) calc(var(--u)*2) 0 #4a2400,calc(var(--u)*2) calc(var(--u)*-2) 0 #4a2400,calc(var(--u)*-2) calc(var(--u)*-2) 0 #4a2400}',
/* danh sách cuộn (thanh cuộn hệ thống ẩn, dùng thanh vẽ riêng) */
'.nv-ls{overflow-y:scroll;overflow-x:hidden;overscroll-behavior:contain;touch-action:pan-y;-webkit-overflow-scrolling:touch;scrollbar-width:none}',
'.nv-ls::-webkit-scrollbar{display:none}',
'.nv-h{width:100%;height:calc(var(--u)*'+BOX.list.rowH+');background:url('+HANG+') 0 0/100% 100% no-repeat;flex:none}',
'.nv-th{border-radius:calc(var(--u)*13);border:calc(var(--u)*2) solid #3a1c04;background:linear-gradient(90deg,#c25a02 0,#ffb81e 22%,#fff45c 40%,#ffc02a 62%,#e8820a 86%,#8a3402 100%);box-shadow:0 0 calc(var(--u)*6) rgba(255,190,60,.55);cursor:grab;touch-action:none}',
'.nv-th:active{cursor:grabbing;filter:brightness(1.12)}',
'.nv-tk,.nv-ar{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation}',
'.nv-ar:active{background:rgba(255,220,110,.28);border-radius:calc(var(--u)*8)}',
/* thanh điểm hoạt động (nằm dưới rương, trên nền thanh vẽ sẵn) */
'.nv-bar{pointer-events:none;border-radius:calc(var(--u)*8);background:linear-gradient(180deg,#fff3a8,#ffc83a 50%,#e08a12);box-shadow:0 0 calc(var(--u)*8) rgba(255,210,80,.7);transition:width .35s ease}',
/* vùng chạm rương */
'.nv-r{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.nv-r:active{filter:brightness(1.25)}',
/* chữ ĐÃ NHẬN màu đỏ đè lên rương */
'.nv-st{display:none;pointer-events:none;align-items:center;justify-content:center;font-weight:900;font-size:calc(var(--u)*30);line-height:1;letter-spacing:calc(var(--u)*1);white-space:nowrap;color:#e3141c;border:calc(var(--u)*4) solid #e3141c;border-radius:calc(var(--u)*8);background:rgba(12,4,10,.38);transform:rotate(-14deg);text-shadow:0 0 calc(var(--u)*3) #fff3,calc(var(--u)*2) calc(var(--u)*2) 0 rgba(40,0,0,.85),calc(var(--u)*-1) calc(var(--u)*-1) 0 rgba(255,220,220,.35);box-shadow:0 0 calc(var(--u)*10) rgba(0,0,0,.65),inset 0 0 calc(var(--u)*6) rgba(227,20,28,.35)}',
'.nv-st.on{display:flex;animation:nv-stamp .22s cubic-bezier(.2,1.6,.4,1)}',
'@keyframes nv-stamp{from{opacity:0;transform:rotate(-14deg) scale(2.2)}to{opacity:1;transform:rotate(-14deg) scale(1)}}',
'.nv-dim{pointer-events:none;background:radial-gradient(ellipse at 50% 50%,rgba(2,6,28,.5) 0,rgba(2,6,28,.4) 45%,rgba(2,6,28,0) 70%);opacity:0;transition:opacity .2s}',
'.nv-dim.on{opacity:1}',
/* ===== HÀNG NHIỆM VỤ (toạ độ theo sprite hàng 1160x136; --u = 1px ảnh khung) ===== */
'.nv-h{position:relative}',
'.nv-h>*{position:absolute;box-sizing:border-box}',
'.nv-hi{display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*62);line-height:1;filter:drop-shadow(0 calc(var(--u)*2) calc(var(--u)*3) rgba(0,0,0,.7))}',
'.nv-hi img{max-width:84%;max-height:84%;object-fit:contain}',
'.nv-hn{display:flex;align-items:center;font-weight:800;font-size:calc(var(--u)*30);line-height:1;color:#ffd75a;text-shadow:0 calc(var(--u)*2) calc(var(--u)*3) #1a0c00,0 0 calc(var(--u)*6) rgba(255,190,60,.35);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.nv-hm{display:flex;align-items:center;font-weight:600;font-size:calc(var(--u)*23);line-height:1.1;color:#d4dcf2;text-shadow:0 calc(var(--u)*2) calc(var(--u)*3) #050a1c;overflow:hidden}',
'.nv-hp{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*24);line-height:1;color:#fff;text-shadow:0 calc(var(--u)*2) calc(var(--u)*3) #000}',
'.nv-hf{border-radius:calc(var(--u)*9);background:linear-gradient(180deg,#fff3a8,#ffc83a 50%,#e08a12);box-shadow:0 0 calc(var(--u)*6) rgba(255,200,70,.6);pointer-events:none}',
'.nv-hr{display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*56);line-height:1;filter:drop-shadow(0 calc(var(--u)*2) calc(var(--u)*3) rgba(0,0,0,.7))}',
'.nv-hr img{max-width:82%;max-height:82%;object-fit:contain}',
'.nv-hq{display:flex;align-items:flex-end;justify-content:flex-end;padding:0 calc(var(--u)*7) calc(var(--u)*4) 0;font-weight:900;font-size:calc(var(--u)*25);line-height:1;color:#fff;text-shadow:0 0 calc(var(--u)*3) #000,calc(var(--u)*2) calc(var(--u)*2) 0 #000,calc(var(--u)*-2) calc(var(--u)*2) 0 #000;pointer-events:none}',
'.nv-bt{padding:0;border:0;background:no-repeat center/100% 100%;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.nv-bt.on:active{filter:brightness(1.25)}',
'.nv-bt.xam{cursor:default}',
'.nv-dn{display:flex;align-items:center;justify-content:center;pointer-events:none;font-weight:900;font-size:calc(var(--u)*34);letter-spacing:calc(var(--u)*1);color:#7f8ba6;border:calc(var(--u)*4) solid #7f8ba6;border-radius:calc(var(--u)*9);background:rgba(8,14,36,.55);transform:rotate(-8deg);text-shadow:0 calc(var(--u)*2) calc(var(--u)*2) rgba(0,0,0,.6)}',
'.nv-h.done .nv-hi,.nv-h.done .nv-hr{opacity:.55}'

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
  var q=CFG[t][i],o=qs(t,q.id),done=o.p>=q.need,f=Math.min(1,o.p/q.need),h;
  h='<div class="nv-h'+(o.c?' done':'')+'" data-i="'+i+'">'
   +'<div class="nv-hi" style="'+rb(R.ic)+'">'+esc(q.ic)+'</div>'
   +'<div class="nv-hn" style="'+rb(R.ten)+'">'+esc(q.ten)+'</div>'
   +'<div class="nv-hm" style="'+rb(R.mo)+'">'+esc(q.mo)+'</div>'
   +'<div class="nv-hp" style="'+rb(R.p)+'">'+fmtN(o.p)+'/'+fmtN(q.need)+'</div>'
   +(f>0?'<div class="nv-hf" style="'+rb({x:R.bar.x,y:R.bar.y,w:R.bar.w*f,h:R.bar.h})+'"></div>':'')
   +'<div class="nv-hr" style="'+rb(R.rw)+'">'+icTh(q.th)+'</div>'
   +'<div class="nv-hq" style="'+rb(R.rw)+'">'+fmtN(q.th.n)+'</div>';
  if(o.c)h+='<div class="nv-dn" style="'+rb({x:R.bt.x+20,y:R.bt.y+22,w:R.bt.w-40,h:R.bt.h-44})+'">Đã nhận</div>';
  else if(done)h+='<button type="button" class="nv-bt on" data-a="n" aria-label="Nhận thưởng" style="'+rb(R.bt)+'background-image:url('+BSANG+')"></button>';
  else h+='<button type="button" class="nv-bt xam" data-a="n" aria-label="Chưa hoàn thành" style="'+rb(R.bt)+'background-image:url('+BXAM+')"></button>';
  return h+'</div>';
}
function dsHang(keep){
  var n=CFG[tab].length,h='',i,y=E.ls.scrollTop;
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
  tab=t;E.tn.classList.toggle('on',t==='ngay');E.tt.classList.toggle('on',t==='tuan');
  E.sN.classList.toggle('on',t==='ngay');E.sT.classList.toggle('on',t==='tuan');
  E.txN.classList.toggle('on',t==='ngay');E.txT.classList.toggle('on',t==='tuan');
  render();dsHang();
}
function nhanNV(i){
  ld();var q=CFG[tab][i];if(!q)return;
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
  if(T.diem<can)return toast('Cần '+can+' điểm hoạt động (hiện có '+T.diem+'). Rương có '+tenTh(r));
  T.nhan[i]=1;save();give(r);render();
  toast('Mở rương '+can+' điểm: nhận '+tenTh(r));
}
function build(){
  root=document.createElement('div');root.className='nv';
  fr=document.createElement('div');fr.className='nv-fr';root.appendChild(fr);
  E.bar=mk('div','nv-bar',{x:BOX.bar.x,y:BOX.bar.y,w:0,h:BOX.bar.h});E.bar.style.width='0%';
  E.r=[];E.st=[];E.dim=[];
  BOX.ruong.forEach(function(Rg,i){
    var Y=BOX.ruongY,S2=BOX.stamp;
    E.dim[i]=mk('div','nv-dim',{x:Rg.cx-70,y:Y.y-8,w:140,h:130});
    E.r[i]=mk('button','nv-r',{x:Rg.cx-Y.w/2,y:Y.y,w:Y.w,h:Y.h});E.r[i].type='button';
    E.r[i].addEventListener('click',function(){nhanRuong(i);});
    E.st[i]=mk('div','nv-st',{x:Rg.cx-S2.w/2,y:S2.cy-S2.h/2,w:S2.w,h:S2.h});E.st[i].textContent='Đã nhận';
  });
  /* tab: sprite sáng -> icon -> nhãn -> nút bấm (trong suốt) trên cùng */
  E.sN=mk('div','nv-sang',BOX.sang.ngay);E.sT=mk('div','nv-sang',BOX.sang.tuan);
  E.icN=mk('div','nv-ic',BOX.icNgay);E.icN.style.backgroundImage='url('+ICN+')';
  E.icT=mk('div','nv-ic',BOX.icTuan);E.icT.style.backgroundImage='url('+ICT+')';
  E.txN=mk('div','nv-tx',BOX.txNgay);E.txN.textContent='Nhiệm vụ ngày';
  E.txT=mk('div','nv-tx',BOX.txTuan);E.txT.textContent='Nhiệm vụ tuần';
  E.tn=mk('button','nv-tab',BOX.tabNgay);E.tn.type='button';E.tn.setAttribute('aria-label','Nhiệm vụ ngày');
  E.tt=mk('button','nv-tab',BOX.tabTuan);E.tt.type='button';E.tt.setAttribute('aria-label','Nhiệm vụ tuần');
  E.tn.addEventListener('click',function(){setTab('ngay');});
  E.tt.addEventListener('click',function(){setTab('tuan');});
  /* danh sách cuộn + thanh cuộn */
  E.ls=mk('div','nv-ls',BOX.list);
  E.ls.addEventListener('scroll',syncThumb);
  E.ls.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-a]');if(!b)return;var h=b.closest('.nv-h');if(h)nhanNV(+h.getAttribute('data-i'));});
  var T=BOX.track;
  E.tk=mk('button','nv-tk',{x:T.x,y:T.y0,w:T.w,h:T.y1-T.y0});E.tk.type='button';E.tk.setAttribute('aria-label','Thanh cuộn');
  E.tk.addEventListener('click',function(e){if(e.target!==E.tk)return;var r=E.tk.getBoundingClientRect(),y=e.clientY-r.top,thTop=E.th.getBoundingClientRect().top-r.top;scrollBy((y<thTop?-1:1)*E.ls.clientHeight*.8);});
  E.th=mk('div','nv-th',{x:T.x,y:T.y0,w:T.w,h:T.min});
  (function(){var dy=0,st=0,on=false,sc=0;
    E.th.addEventListener('pointerdown',function(e){on=true;dy=e.clientY;st=E.ls.scrollTop;sc=fr.clientWidth/SW;try{E.th.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
    E.th.addEventListener('pointermove',function(e){if(!on)return;var L=(T.y1-T.y0)*sc-E.thLen*sc,ms=maxScroll();if(L>0)E.ls.scrollTop=st+(e.clientY-dy)/L*ms;});
    function up(){on=false;}E.th.addEventListener('pointerup',up);E.th.addEventListener('pointercancel',up);})();
  E.au=mk('button','nv-ar',BOX.up);E.au.type='button';E.au.setAttribute('aria-label','Cuộn lên');E.au.addEventListener('click',function(){scrollBy(-BOX.list.rowH);});
  E.ad=mk('button','nv-ar',BOX.down);E.ad.type='button';E.ad.setAttribute('aria-label','Cuộn xuống');E.ad.addEventListener('click',function(){scrollBy(BOX.list.rowH);});
  E.x=mk('button','nv-x',BOX.close);E.x.type='button';E.x.setAttribute('aria-label','Đóng');
  document.body.appendChild(root);
  E.x.addEventListener('click',close);
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close();});
  window.addEventListener('resize',function(){unit();fitAll();syncThumb();});
}
function open(){
  ld();if(!root)build();
  openAt=performance.now();isOpen=true;root.classList.add('on');unit();E.ls.innerHTML='';setTab('ngay');fitAll();syncThumb();
}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');}
function refresh(){if(isOpen){render();dsHang(true);}}

window.TTGNHIEMVU={
  open:open,close:close,tab:function(t){if(t&&root)setTab(t);return tab;},isOpen:function(){return isOpen;},sk:sk,
  diem:function(){ld();return S[tab].diem;},
  setDiem:function(n){ld();S[tab].diem=Math.max(0,Math.min(100,+n||0));save();render();return S[tab].diem;},
  congDiem:function(n){ld();return window.TTGNHIEMVU.setDiem(S[tab].diem+(+n||0));},
  xong:function(id){ld();['ngay','tuan'].forEach(function(t){CFG[t].forEach(function(q){if(q.id===id)qs(t,id).p=q.need;});});save();refresh();},
  daNhan:function(i){ld();return !!S[tab].nhan[i];},
  reset:function(){ld();S={ngay:blank('ngay'),tuan:blank('tuan')};save();refresh();},
  CFG:CFG
};
})();
