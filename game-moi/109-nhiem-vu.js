/* 109-nhiem-vu.js - BẢNG NHIỆM VỤ (nút "Nhiệm vụ" ở thanh nút, 81-nut-moi.js gọi TTGNHIEMVU.open).
   BƯỚC 1 (28/11/2026): ĐƯA KHUNG VÀO GAME + RƯƠNG ĐIỂM HOẠT ĐỘNG.
   BƯỚC 2 (28/11/2026): 2 TAB ĐỔI SÁNG QUA LẠI (Nhiệm vụ ngày / Nhiệm vụ tuần) + DANH SÁCH HÀNG CUỘN ĐƯỢC với THANH CUỘN THẬT. Tab Ngày 5 hàng, tab Tuần 10 hàng (CFG.soHang). Các hàng đang TRỐNG (chưa có nội dung nhiệm vụ).
   ẢNH: khung-nhiem-vu.webp đã xóa chữ + viền sáng của 2 tab (cả hai ở trạng thái tối) và xóa thanh trượt vẽ sẵn. nhiem-vu-tab-sang.webp = tab SÁNG (phủ lên tab đang chọn); nhiem-vu-ic-ngay/tuan.webp = icon cuộn giấy / lịch; nhãn tab là CHỮ thật vẽ bằng CSS (đổi màu theo trạng thái); nhiem-vu-hang.webp = 1 hàng nhiệm vụ (nhân bản thành danh sách, cao 136px ảnh).
   ẢNH: game-moi/khung-nhiem-vu.webp = khung trống đã tách nền xanh (1281x1164). Tiêu đề, nút X, 2 tab, 5 hàng, 4 rương + mốc 25/50/75/100 vẽ sẵn trong ảnh.
        Mọi tọa độ ở khối BOX, tính theo pixel ảnh khung (SW x SH).
   RƯƠNG HOẠT ĐỘNG: 4 rương ở mốc CFG.moc = [25,50,75,100]. Đủ điểm -> chạm rương để nhận (chạm khi chưa đủ: báo "Cần X điểm hoạt động").
        Nhận rồi -> chữ "Đã nhận" MÀU ĐỎ đè lên rương, rương tối đi một chút. Thanh vàng dưới rương chạy theo số điểm.
        PHẦN THƯỞNG RƯƠNG: chưa khai -> CFG.thuong[i] = hàm(i) gọi khi nhận (sau này nối Balo / tiền tệ). Hiện chỉ đánh dấu đã nhận.
   LƯU: localStorage khóa ttg_moi_nhiemvu = {diem:số, nhan:[0|1 x4]}. CHƯA reset theo ngày (chờ chốt luật làm mới).
   API: TTGNHIEMVU.open() | .close() | .isOpen() | .diem() | .setDiem(n) (thử / sau này hệ nhiệm vụ gọi) | .congDiem(n) | .daNhan(i) | .reset()
   Đóng: nút X, chạm ngoài khung, Esc. */
(function(){
'use strict';
var SW=1281,SH=1164,V='?v=2',D='game-moi/',IMG=D+'khung-nhiem-vu.webp'+V,SANG=D+'nhiem-vu-tab-sang.webp'+V,ICN=D+'nhiem-vu-ic-ngay.webp'+V,ICT=D+'nhiem-vu-ic-tuan.webp'+V,HANG=D+'nhiem-vu-hang.webp'+V;
var CFG={
  key:'ttg_moi_nhiemvu',
  moc:[25,50,75,100],
  soHang:{ngay:5,tuan:10},   /* số hàng mỗi tab; sau này thay bằng danh sách nhiệm vụ thật */
  thuong:[null,null,null,null]   /* thuong[i]=function(i){...} chạy khi nhận rương i (0..3); sau này nối phần thưởng thật */
};
var BOX={
  sang:{ngay:{x:294,y:166,w:337,h:79},tuan:{x:650,y:166,w:337,h:79}},   /* sprite tab sáng phủ lên tab đang chọn */
  icNgay:{x:338,y:172,w:62,h:64},icTuan:{x:700,y:174,w:58,h:60},
  txNgay:{x:400,y:179,w:196,h:52},txTuan:{x:770,y:179,w:178,h:52},
  list:{x:50,y:256,w:1160,h:654,rowH:136},                          /* vùng danh sách cuộn */
  track:{x:1215,y0:316,y1:868,w:26,min:64},                         /* thanh cuộn: x/bề rộng thanh trượt, y0..y1 = đoạn chạy */
  up:{x:1214,y:284,w:30,h:30},down:{x:1214,y:876,w:30,h:30},         /* mũi tên trên / dưới */
  close:{x:1137,y:58,w:104,h:104},
  tabNgay:{x:296,y:168,w:333,h:75},
  tabTuan:{x:652,y:168,w:334,h:75},
  ruong:[{cx:394},{cx:626},{cx:864},{cx:1099}],   /* tâm x từng rương (khớp mốc 25/50/75/100 vẽ sẵn) */
  ruongY:{y:925,h:170,w:120},                     /* vùng chạm: từ đỉnh rương xuống hết ô số mốc */
  stamp:{cy:974,w:142,h:48},                      /* chữ Đã nhận đè lên thân rương */
  bar:{x:283,y:1016,h:14,xs:[283,394,626,864,1099]}  /* thanh điểm: đầu thanh rồi tới tâm 4 rương (chạy từng đoạn) */
};
var root,fr,E={},isOpen=false,openAt=0,tab='ngay',S={diem:0,nhan:[0,0,0,0]};

function load(){try{var j=JSON.parse(localStorage.getItem(CFG.key)||'null');if(j&&typeof j.diem==='number'){S.diem=Math.max(0,Math.min(100,j.diem));S.nhan=[0,1,2,3].map(function(i){return j.nhan&&j.nhan[i]?1:0;});}}catch(e){}}
function save(){try{localStorage.setItem(CFG.key,JSON.stringify(S));}catch(e){}}
function toast(t){var T=window.TTGTBAO&&TTGTBAO.toast;if(T)T(t,2200);}

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
'.nv-h{width:100%;height:calc(var(--u)*'+BOX.list.rowH+');background:url('+HANG+') 0 0/100% 100% no-repeat}',
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
'.nv-dim.on{opacity:1}'
].join('\n');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);
[IMG,SANG,ICN,ICT,HANG].forEach(function(u){try{(new Image()).src=u;}catch(e){}});   /* tải trước cho lần mở đầu không nháy */

function pct(v,t){return (v/t*100)+'%';}
function box(c,b){var s=c.style;s.left=pct(b.x,SW);s.top=pct(b.y,SH);s.width=pct(b.w,SW);s.height=pct(b.h,SH);return c;}
function mk(tag,cls,b){var c=document.createElement(tag);c.className=cls;if(b)box(c,b);fr.appendChild(c);return c;}
function unit(){if(fr)fr.style.setProperty('--u',(fr.clientWidth/SW)+'px');}

function fit(el){el.style.fontSize='';var f=33;while(f>14&&el.scrollWidth>el.clientWidth+1){f--;el.style.fontSize='calc(var(--u)*'+f+')';}}
function fitAll(){if(E.txN){fit(E.txN);fit(E.txT);}}
/* ===== DANH SÁCH + THANH CUỘN ===== */
function dsHang(){var n=CFG.soHang[tab]||0,h='',i;for(i=0;i<n;i++)h+='<div class="nv-h" data-i="'+i+'"></div>';E.ls.innerHTML=h;E.ls.scrollTop=0;syncThumb();}
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
  dsHang();
}
function barW(){   /* điểm -> bề rộng thanh (px ảnh), chạy từng đoạn theo vị trí 4 rương */
  var xs=BOX.bar.xs,p=S.diem,m=CFG.moc,i,a=0,x=xs[0];
  for(i=0;i<m.length;i++){var b=m[i];if(p>=b){x=xs[i+1];a=b;}else{x=xs[i]+(xs[i+1]-xs[i])*(p-a)/(b-a);break;}}
  return Math.max(0,x-xs[0]);
}
function render(){
  if(!root)return;
  E.bar.style.width=pct(barW(),SW);
  CFG.moc.forEach(function(m,i){
    var on=!!S.nhan[i];
    E.st[i].classList.toggle('on',on);E.dim[i].classList.toggle('on',on);
    E.r[i].setAttribute('aria-label','Rương '+m+' điểm'+(on?' (đã nhận)':''));
  });
}
function nhanRuong(i){
  if(S.nhan[i])return toast('Rương này đã nhận rồi');
  var can=CFG.moc[i];
  if(S.diem<can)return toast('Cần '+can+' điểm hoạt động (hiện có '+S.diem+')');
  S.nhan[i]=1;save();
  try{if(typeof CFG.thuong[i]==='function')CFG.thuong[i](i);}catch(e){}
  render();
}
function build(){
  root=document.createElement('div');root.className='nv';
  fr=document.createElement('div');fr.className='nv-fr';root.appendChild(fr);
  E.bar=mk('div','nv-bar',{x:BOX.bar.x,y:BOX.bar.y,w:0,h:BOX.bar.h});E.bar.style.width='0%';
  E.r=[];E.st=[];E.dim=[];
  BOX.ruong.forEach(function(R,i){
    var Y=BOX.ruongY,S2=BOX.stamp;
    E.dim[i]=mk('div','nv-dim',{x:R.cx-70,y:Y.y-8,w:140,h:130});
    E.r[i]=mk('button','nv-r',{x:R.cx-Y.w/2,y:Y.y,w:Y.w,h:Y.h});E.r[i].type='button';
    E.r[i].addEventListener('click',function(){nhanRuong(i);});
    E.st[i]=mk('div','nv-st',{x:R.cx-S2.w/2,y:S2.cy-S2.h/2,w:S2.w,h:S2.h});E.st[i].textContent='Đã nhận';
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
  if(!root){load();build();}
  openAt=performance.now();isOpen=true;root.classList.add('on');unit();render();E.ls.innerHTML='';setTab('ngay');fitAll();syncThumb();
}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');}

window.TTGNHIEMVU={
  open:open,close:close,tab:function(t){if(t)setTab(t);return tab;},isOpen:function(){return isOpen;},
  diem:function(){return S.diem;},
  setDiem:function(n){if(!root)load();S.diem=Math.max(0,Math.min(100,+n||0));save();render();return S.diem;},
  congDiem:function(n){return window.TTGNHIEMVU.setDiem(S.diem+(+n||0));},
  daNhan:function(i){return !!S.nhan[i];},
  reset:function(){S={diem:0,nhan:[0,0,0,0]};save();render();}
};
})();
