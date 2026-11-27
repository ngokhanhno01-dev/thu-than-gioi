/* 86-hop-ruong.js - HAI VẬT PHẨM MỞ RA NHẬN NGỰ THÚ CHÂU (25/11/2026), nhánh demo-thu-moi. Nạp động từ 81-nut-moi.js (không sửa index.html).
   1) HỘP NGỰ THÚ NGẪU NHIÊN (id hop-ngu-thu-ngau-nhien): bấm Mở -> trúng NGẪU NHIÊN 1 bậc châu theo CFG.tiLe, nhận số lượng của bậc đó theo CFG.qty.
   2) RƯƠNG NGỰ THÚ TỰ CHỌN (id ruong-ngu-thu-tu-chon): bấm Mở -> khung "Chọn Vật Phẩm" (6 bậc châu trong lưới 3x3), chọn ĐÚNG 1 món rồi bấm Chọn -> nhận số lượng của bậc đó (CFG.qty). Dùng xong rương mất.
   Số lượng theo bậc (CFG.qty) lấy đúng bảng "gói Ngự Thú Châu": bậc 1 x10, bậc 2 x8, bậc 3 x5, bậc 4 x3, bậc 5 x2, bậc 6 x1. Muốn đổi tỉ lệ / số lượng: sửa CFG ngay dưới, mô tả item trong Balo tự cập nhật.
   BALO: 53-balo.js chưa có nút Dùng nên file này tự gắn nút "Mở" vào bảng thông tin của Balo (hiện khi đang chọn đúng 1 trong 2 món, ẩn lúc bật Chọn nhiều). Cần: 53-balo.js (TTGBALO), 58-bong-bat.js (TTGBONG), 64-thong-bao.js (TTGBAO, có thể thiếu).
   ẢNH: game-moi/khung-chon-vat-pham.webp (1502x881, nền trong suốt; tiêu đề, 9 ô, ô xem, nút Chọn, nút X đã vẽ sẵn),
        game-moi/img/vat-pham/hop-ngu-thu-ngau-nhien.webp, game-moi/img/vat-pham/ruong-ngu-thu-tu-chon.webp (icon 384x384, nền trong suốt). Chưa có file icon thì item dùng emoji tạm.
   Tọa độ khung (px ảnh SW x SH) ở khối BOX. THỬ NHANH: thêm ?hop=demo vào link (+5 mỗi loại), hoặc menu ẩn (chạm chữ "Danh Vọng") -> nút "Lấy hộp". */
(function(root){
'use strict';
var B=root.TTGBALO,G=root.TTGBONG;
if(!B||!G)return;
var D='game-moi/',V='?v=1',SW=1502,SH=881,FRAME=D+'khung-chon-vat-pham.webp'+V;
var ID_HOP='hop-ngu-thu-ngau-nhien',ID_RUONG='ruong-ngu-thu-tu-chon';
var CFG={
  capMax:5,                                  /* 27/11/2026: hộp + rương CHỈ ra châu 1..5. BỎ châu 6 (Hỗn Độn Thần Châu) */
  qty:{1:10,2:8,3:5,4:3,5:2},                /* số Ngự Thú Châu nhận được theo châu (cả hộp lẫn rương) */
  tiLe:{1:40,2:28,3:17,4:9,5:4}              /* HỘP: trọng số trúng từng châu (% tự chia lại theo tổng). Châu càng cao càng hiếm */
};
var BOX={
  slotX:[167,376,585],slotY:[289,467,644],slotW:155,slotH:131,   /* 9 ô lưới 3x3 (ruột ô, đọc theo hàng); chỉ dùng 6 ô đầu cho bậc 1-6 */
  view:{x:829,y:300,w:537,h:332},                                /* ô xem bên phải */
  ok:{x:930,y:692,w:370,h:118},                                  /* nút Chọn (vùng bấm phủ lên nút vẽ sẵn) */
  close:{x:1340,y:100,w:120,h:120}                               /* nút X */
};
var ITEMS={};   /* id -> {open:fn} cho nút Mở trong Balo */
var frameState=0;   /* 0 chờ, 1 có ảnh khung, -1 thiếu ảnh */
(function(){var im=new Image();im.onload=function(){frameState=1;};im.onerror=function(){frameState=-1;};im.src=FRAME;})();

/* ================= TIỆN ÍCH ================= */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function chauId(cap){return G.idBong(cap);}
function chauItem(cap){return B.CAT[chauId(cap)]||{ten:'Ngự Thú Châu',ic:'⚪'};}
function chauTen(cap){return chauItem(cap).ten;}
function icHtml(it){return it&&it.img?'<img src="'+esc(it.img)+'" alt="">':'<b>'+esc((it&&it.ic)||'?')+'</b>';}
function maxCap(){return Math.min(CFG.capMax,G.CFG.capBongMax||6);}
function bacTen(c){return chauItem(c).bac||('Bậc '+c);}   /* Hoàng / Huyền / Địa / Thiên Giai / Đặc Biệt (58-bong-bat.js) */
function toast(t){if(root.TTGBAO)TTGBAO.toast(t,2200);}
function tong(){var s=0,c;for(c=1;c<=maxCap();c++)s+=Math.max(0,+CFG.tiLe[c]||0);return s;}
function roll(){   /* chọn 1 bậc theo trọng số CFG.tiLe */
  var t=tong(),r=Math.random()*t,c;
  if(t<=0)return 1;
  for(c=1;c<=maxCap();c++){r-=Math.max(0,+CFG.tiLe[c]||0);if(r<0)return c;}
  return maxCap();
}
function pct(c){var t=tong();return t>0?Math.round((+CFG.tiLe[c]||0)/t*1000)/10:0;}
function give(cap){var n=CFG.qty[cap]|0;B.add(chauId(cap),n);return n;}

/* ================= KHAI ITEM VÀO BALO ================= */
function moTaHop(){
  var a=[],c;for(c=1;c<=maxCap();c++)a.push(chauTen(c)+': x'+CFG.qty[c]+' ('+pct(c)+'%)');
  return 'Mở ra nhận ngẫu nhiên 1 loại Ngự Thú Châu (châu càng cao càng hiếm). '+a.join(' · ')+'.';
}
function moTaRuong(){
  var a=[],c;for(c=1;c<=maxCap();c++)a.push(chauTen(c)+' x'+CFG.qty[c]);
  return 'Mở ra rồi tự chọn ĐÚNG 1 loại Ngự Thú Châu: '+a.join(', ')+'. Chọn xong rương sẽ mất.';
}
var DEF={};
DEF[ID_HOP]={loai:'nl',ten:'Hộp Ngự Thú Ngẫu Nhiên',ic:'🎁',mo:moTaHop(),imgSrc:D+'img/vat-pham/hop-ngu-thu-ngau-nhien.webp'+V};
DEF[ID_RUONG]={loai:'nl',ten:'Rương Ngự Thú Tự Chọn',ic:'🧰',mo:moTaRuong(),imgSrc:D+'img/vat-pham/ruong-ngu-thu-tu-chon.webp'+V};
function dangKy(){
  var o={};Object.keys(DEF).forEach(function(id){var d=DEF[id];o[id]={loai:d.loai,ten:d.ten,ic:d.ic,mo:d.mo};});
  B.reg(o);
  /* nâng emoji lên ảnh khi file icon tải được (thiếu file thì giữ emoji) */
  Object.keys(DEF).forEach(function(id){var d=DEF[id],im=new Image();
    im.onload=function(){var it=B.CAT[id];if(it){it.img=d.imgSrc;var u={};u[id]=it;B.reg(u);}};im.src=d.imgSrc;});
}
dangKy();

/* ================= MỞ HỘP ================= */
function moHop(){
  if(B.count(ID_HOP)<=0)return;
  var cap=roll(),n=give(cap);B.add(ID_HOP,-1);
  var it=chauItem(cap),con=B.count(ID_HOP),hiem=cap>=5;
  var text='Nhận <b>x'+n+'</b> · Bậc <b>'+cap+'</b>'+(hiem?'<br><span style="color:#ffd21f">Bậc cao hiếm, chúc mừng!</span>':'')+(con>0?'<br><small>Còn '+con+' hộp</small>':'');
  if(root.TTGBAO){
    var bt=con>0?[{t:'Mở tiếp',cb:moHop},{t:'Đóng'}]:[{t:'Đóng'}];
    TTGBAO.info({icon:icHtml(it),title:'Mở hộp!',tc:'y',sub:esc(it.ten),text:text,modal:true},bt);
  }
}

/* ================= RƯƠNG TỰ CHỌN: KHUNG CHỌN VẬT PHẨM ================= */
var css=[
'.hr{position:fixed;left:0;top:0;right:0;bottom:0;z-index:150;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.hr.on{display:flex}',
'.hr-fr{position:relative;width:min(98vw,calc(96vh*'+SW+'/'+SH+'));aspect-ratio:'+SW+'/'+SH+';background:url('+FRAME+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px;animation:hr-in .18s ease-out}',
'@keyframes hr-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}',
'.hr-fr>*{position:absolute;box-sizing:border-box}',
'.hr button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.hr-x,.hr-ok{padding:0;border:0;background:transparent;cursor:pointer;border-radius:50%}',
'.hr-ok{border-radius:calc(var(--u)*50)}',
'.hr-x:active,.hr-ok:active{background:rgba(255,224,102,.3)}',
'.hr-sl{display:flex;align-items:center;justify-content:center;padding:0;border:0;background:none;cursor:pointer}',
'.hr-sl img{width:84%;height:84%;object-fit:contain}',
'.hr-sl b{font-weight:400;font-size:calc(var(--u)*80)}',
'.hr-sl .q{position:absolute;right:calc(var(--u)*7);bottom:calc(var(--u)*4);font-weight:800;font-size:calc(var(--u)*30);color:#fff;text-shadow:0 0 3px #000,1px 1px 0 #000,-1px 1px 0 #000}',
'.hr-sl .b{position:absolute;left:calc(var(--u)*8);top:calc(var(--u)*5);font-weight:800;font-size:calc(var(--u)*22);color:#ffe9a0;text-shadow:0 0 3px #000,1px 1px 0 #000}',
'.hr-sl.sel::after{content:"";position:absolute;left:calc(var(--u)*-6);top:calc(var(--u)*-6);right:calc(var(--u)*-6);bottom:calc(var(--u)*-6);border:calc(var(--u)*5) solid #ffe066;border-radius:calc(var(--u)*10);box-shadow:0 0 calc(var(--u)*20) rgba(255,224,102,.8),inset 0 0 calc(var(--u)*16) rgba(255,224,102,.35);pointer-events:none}',
'.hr-vw{display:flex;align-items:center;gap:calc(var(--u)*24);padding:calc(var(--u)*20) calc(var(--u)*28);overflow:hidden}',
'.hr-vw .ic{flex:none;width:calc(var(--u)*190);height:calc(var(--u)*190);display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*110)}',
'.hr-vw .ic img{width:100%;height:100%;object-fit:contain}',
'.hr-vw .tx{flex:1;min-width:0;height:100%;display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*8)}',
'.hr-vw .nm{font-weight:800;font-size:calc(var(--u)*38);color:#ffe9a0;line-height:1.15}',
'.hr-vw .mt{font-weight:700;font-size:calc(var(--u)*30);color:#9fe8de}',
'.hr-vw .rt{font-weight:800;font-size:calc(var(--u)*36);color:#9ff5a8}',
'.hr-vw .ds{font-size:calc(var(--u)*24);line-height:1.3;color:#cfd6ff;overflow-y:auto;min-height:0;touch-action:pan-y;scrollbar-width:none}',
'.hr-vw .ds::-webkit-scrollbar{display:none}',
'.hr-vw.hint{justify-content:center;text-align:center;font-size:calc(var(--u)*32);font-weight:700;color:#8a90c0;line-height:1.4}',
'.bl-dt.hr-pad{padding-bottom:calc(var(--u)*76)}'   /* chừa chỗ cho nút Mở trong bảng thông tin Balo */
].join('\n');
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var P=null,E={},sel=0,isOpen=false,openAt=0;
function pos(c,x,y,w,h){var s=c.style;s.left=(x/SW*100)+'%';s.top=(y/SH*100)+'%';s.width=(w/SW*100)+'%';s.height=(h/SH*100)+'%';return c;}
function unit(){if(E.fr)E.fr.style.setProperty('--u',(E.fr.clientWidth/SW)+'px');}
function build(){
  P=document.createElement('div');P.className='hr';
  E.fr=document.createElement('div');E.fr.className='hr-fr';P.appendChild(E.fr);
  E.slots=[];
  for(var i=0;i<9;i++){
    var b=document.createElement('button');b.type='button';b.className='hr-sl';
    pos(b,BOX.slotX[i%3],BOX.slotY[Math.floor(i/3)],BOX.slotW,BOX.slotH);
    (function(k){b.addEventListener('click',function(){pick(k+1);});})(i);
    E.fr.appendChild(b);E.slots.push(b);
  }
  E.vw=document.createElement('div');E.vw.className='hr-vw hint';pos(E.vw,BOX.view.x,BOX.view.y,BOX.view.w,BOX.view.h);E.fr.appendChild(E.vw);
  E.ok=document.createElement('button');E.ok.type='button';E.ok.className='hr-ok';E.ok.setAttribute('aria-label','Chọn');pos(E.ok,BOX.ok.x,BOX.ok.y,BOX.ok.w,BOX.ok.h);E.ok.addEventListener('click',chon);E.fr.appendChild(E.ok);
  E.x=document.createElement('button');E.x.type='button';E.x.className='hr-x';E.x.setAttribute('aria-label','Đóng');pos(E.x,BOX.close.x,BOX.close.y,BOX.close.w,BOX.close.h);E.x.addEventListener('click',dong);E.fr.appendChild(E.x);
  document.body.appendChild(P);
  P.addEventListener('click',function(e){if(e.target===P&&performance.now()-openAt>400)dong();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')dong();});
  window.addEventListener('resize',unit);
}
function render(){
  var i,c,it;
  for(i=0;i<E.slots.length;i++){var b=E.slots[i];c=i+1;
    if(c>maxCap()){b.style.visibility='hidden';b.innerHTML='';continue;}
    it=chauItem(c);b.style.visibility='visible';b.className='hr-sl'+(c===sel?' sel':'');
    b.innerHTML=icHtml(it)+'<span class="b">'+esc(bacTen(c))+'</span><span class="q">x'+CFG.qty[c]+'</span>';
    b.setAttribute('aria-label',it.ten);}
  if(!sel){E.vw.className='hr-vw hint';E.vw.innerHTML='Chạm một Ngự Thú Châu để xem,<br>rồi bấm Chọn (chỉ nhận được 1 loại)';return;}
  it=chauItem(sel);E.vw.className='hr-vw';
  E.vw.innerHTML='<div class="ic">'+icHtml(it)+'</div><div class="tx"><div class="nm">'+esc(it.ten)+'</div><div class="mt">'+esc(bacTen(sel))+'</div><div class="rt">Nhận: x'+CFG.qty[sel]+'</div><div class="ds">'+esc(it.mo||'')+'</div></div>';
}
function pick(c){if(c>maxCap())return;sel=c;render();}
function moRuong(){
  if(B.count(ID_RUONG)<=0)return;
  if(frameState<0){toast('Thiếu ảnh game-moi/khung-chon-vat-pham.webp');return;}
  if(!P)build();
  sel=0;isOpen=true;openAt=performance.now();P.classList.add('on');unit();render();
}
function dong(){if(!P)return;isOpen=false;P.classList.remove('on');}
function chon(){
  if(!sel){toast('Chưa chọn vật phẩm');return;}
  var cap=sel,n=CFG.qty[cap],ten=chauTen(cap);
  var nhan=function(){
    if(B.count(ID_RUONG)<=0){dong();return;}
    B.add(ID_RUONG,-1);give(cap);dong();toast('Đã nhận '+ten+' x'+n);
  };
  if(root.TTGBAO)TTGBAO.confirm('<div>Chọn <b>'+esc(ten)+' x'+n+'</b>?<br><small>Chỉ chọn được 1 món, chọn xong rương sẽ mất.</small></div>',[{t:'Nhận',cb:nhan},{t:'Hủy'}]);
  else nhan();
}

/* ================= GẮN NÚT "MỞ" VÀO BALO ================= */
ITEMS[ID_HOP]={open:moHop};ITEMS[ID_RUONG]={open:moRuong};
function hookBalo(fr){
  var dt=fr.querySelector('.bl-dt');
  if(!dt||fr._hr)return;fr._hr=1;
  var b=document.createElement('button');b.type='button';b.className='bl-p2';b.textContent='Mở';b.setAttribute('aria-label','Mở');
  /* tọa độ theo ảnh khung Balo 1761x847: nằm cuối bảng thông tin, giữa cột */
  b.style.left=(1425/1761*100)+'%';b.style.top=(702/847*100)+'%';b.style.width=(210/1761*100)+'%';b.style.height=(62/847*100)+'%';
  fr.appendChild(b);
  b.addEventListener('click',function(){var id=dt.getAttribute('data-sel'),it=ITEMS[id];if(it)it.open();});
  function sync(){
    var id=dt.getAttribute('data-sel'),ok=!!ITEMS[id]&&!dt.classList.contains('mu');
    b.classList.toggle('on',ok);dt.classList.toggle('hr-pad',ok);
    if(ok){var mt=dt.querySelector('.dt-mt');if(mt&&mt.textContent.indexOf('Nguyên liệu')===0)mt.textContent=mt.textContent.replace('Nguyên liệu','Vật phẩm đặc biệt');}
  }
  new MutationObserver(sync).observe(dt,{childList:true,attributes:true,attributeFilter:['data-sel']});   /* Balo vẽ lại bảng thông tin mỗi lần render => childList đổi */
  sync();
}
(function(){
  var f=document.querySelector('.bl-fr');
  if(f){hookBalo(f);return;}
  var mo=new MutationObserver(function(){var x=document.querySelector('.bl-fr');if(x){mo.disconnect();hookBalo(x);}});   /* Balo chỉ dựng bảng ở lần mở đầu tiên */
  mo.observe(document.body,{childList:true});
})();

/* ================= THỬ NHANH ================= */
function lay(){B.add(ID_HOP,3);B.add(ID_RUONG,3);toast('TEST: +3 Hộp, +3 Rương Ngự Thú');}
if(/[?&]hop=demo/.test(location.search)){B.add(ID_HOP,5);B.add(ID_RUONG,5);}
if(root.TTGNV)root.TTGNV.add({id:'lay-hop',ten:'Lấy hộp',dev:true,onTap:lay,icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="12" y="26" width="40" height="28" rx="4" fill="#d83a3a" stroke="#5a0f0f" stroke-width="3"/><rect x="10" y="18" width="44" height="12" rx="3" fill="#ffd24a" stroke="#7a4a00" stroke-width="3"/><path d="M32 18v36" stroke="#ffd24a" stroke-width="5"/></svg>'});

root.TTGHOP={dangKy:function(id,fn){ITEMS[id]={open:fn};},   /* module khác đăng ký vật phẩm có nút Mở trong Balo (104-trung-than.js) */
CFG:CFG,BOX:BOX,roll:roll,moHop:moHop,moRuong:moRuong,ID_HOP:ID_HOP,ID_RUONG:ID_RUONG};
})(typeof window!=='undefined'?window:globalThis);
