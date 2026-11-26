/* 90-nhan-vat-bang.js - BẢNG NHÂN VẬT (TTGNVB) (26/11/2026). Mở bằng icon "Nhân Vật" ở thanh nút (ngoài cùng bên phải), nạp động từ 81-nut-moi.js.
   ẢNH: game-moi/khung-nhan-vat.webp (1406x768, đã tách nền xanh, xóa dấu sao ở góc) + game-moi/icon/nhan-vat.webp (icon nút). Mọi tọa độ ở khối BOX, tính theo pixel ảnh khung (SW x SH).
   BỐ CỤC: trái = nhân vật đứng trên bục (dáng chờ của skin đang chọn), tên bục = BIỆT DANH; 8 ô hai bên = chỗ để dành cho trang bị nhân vật (chưa có hệ thống, chạm báo "sắp ra mắt");
   phải = lưới 24 ô = các SKIN của giới đang chọn (SKINS ở 64b-chon-nhan-vat.js), khung Thông Tin, 4 nút:
     Chọn = mặc skin đang chọn | Khóa = khóa/mở khóa skin (skin khóa không vứt bỏ được; lưu ttg_moi_nhanvat_khoa_v1) | Tháo Trang Bị = về skin mặc định | Vứt Bỏ = bỏ skin đã mở (không áp dụng cho skin mặc định).
   Thêm skin: khai trong SKINS của 64b + ảnh <skin>-chon.png và <skin>-tran-tu-the.png; bảng này tự hiện. Đóng: nút X, chạm ngoài khung, Esc. API: TTGNVB.open()/close()/isOpen(). */
(function(root){
'use strict';
if(root.TTG_BLOCK)return;
var SW=1406,SH=768,D='game-moi/',V='?v=1',DIR=D+'nhan-vat/',KEYK='ttg_moi_nhanvat_khoa_v1';
var BOX={
  close:{x:1268,y:14,w:120,h:104},
  ten:{x:227,y:135,w:295,h:33},                 /* thanh vàng đầu cột trái: biệt danh */
  stand:{cx:372,by:552,w:330},                  /* nhân vật: tâm ngang, đáy chân (trên mặt bục), bề rộng */
  tin:{x:1092,y:195,w:228,h:350},               /* khung Thông Tin */
  btn:{chon:{x:1072,y:563,w:136,h:49},khoa:{x:1210,y:563,w:132,h:49},thao:{x:1072,y:621,w:136,h:57},vut:{x:1210,y:621,w:132,h:57}},
  slotL:{xs:[144,603.5],ys:[227.5,317,404,494],s:78},   /* 8 ô trang bị: 2 cột x 4 hàng */
  grid:{xs:[776.5,854.5,932,1013],ys:[194,283,373,462.5,549.5,638],s:72}   /* 24 ô skin: 4 cột x 6 hàng */
};
var root_,fr,E={},isOpen=false,openAt=0,sel='mac-dinh';
function N(){return root.TTGNHANVAT||null;}
function rd(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function toast(s){try{if(root.TTGTBAO&&TTGTBAO.toast)TTGTBAO.toast(s,2200);}catch(e){}}
function gioi(){var n=N();return n?n.gioi():'nu';}
function dsSkin(){var n=N();return(n&&n.SKINS&&n.SKINS[gioi()])||[{id:'mac-dinh',ten:'Mặc định'}];}
function skinInfo(id){var a=dsSkin();for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return a[0];}
function dangMac(){var n=N();return n?n.skin():'mac-dinh';}
function daMo(id){var n=N();return n?n.daMo(gioi(),id):id==='mac-dinh';}
function khoaMap(){return rd(KEYK)||{};}
function daKhoa(id){var o=khoaMap();return !!(o[gioi()]&&o[gioi()][id]);}
function setKhoa(id,v){var o=khoaMap(),g=gioi();if(!o[g])o[g]={};if(v)o[g][id]=1;else delete o[g][id];wr(KEYK,o);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pc(v,t){return (v/t*100).toFixed(3)+'%';}
function place(el,b){el.style.left=pc(b.x,SW);el.style.top=pc(b.y,SH);el.style.width=pc(b.w,SW);el.style.height=pc(b.h,SH);}
function mk(tag,cls,b){var e=document.createElement(tag);e.className=cls;if(b)place(e,b);fr.appendChild(e);return e;}
function cell(cx,cy,s){return{x:cx-s/2,y:cy-s/2,w:s,h:s};}

var css=[
'.nvb{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.nvb.on{display:flex}',
'.nvb-fr{position:relative;width:min(98vw,calc(96vh*'+SW+'/'+SH+'));aspect-ratio:'+SW+'/'+SH+';background:url('+D+'khung-nhan-vat.webp'+V+') 0 0/100% 100% no-repeat;--u:1px;animation:nvb-in .18s ease-out}',
'@keyframes nvb-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}',
'.nvb-fr>*{position:absolute;box-sizing:border-box}',
'.nvb button{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation;color:inherit;font:inherit}',
'.nvb-x{border-radius:50%}',
'.nvb-x:active,.nvb-b:active{box-shadow:0 0 calc(var(--u)*22) rgba(255,224,102,.85),inset 0 0 calc(var(--u)*22) rgba(255,224,102,.35)}',
'.nvb-b{border-radius:calc(var(--u)*10)}',
'.nvb-b.dis::after{content:"";position:absolute;left:3%;right:3%;top:6%;bottom:6%;border-radius:calc(var(--u)*10);background:rgba(2,4,22,.55);pointer-events:none}',
'.nvb-ten{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*22);line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#4a2600;text-shadow:0 calc(var(--u)*1) 0 rgba(255,246,200,.85);pointer-events:none;padding:0 4%}',
'.nvb-nv{pointer-events:none;image-rendering:auto;transform-origin:50% 100%;animation:nvb-bob 2.6s ease-in-out infinite;filter:drop-shadow(0 0 calc(var(--u)*8) rgba(120,190,255,.55))}',
'@keyframes nvb-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--u)*-5))}}',
'.nvb-sh{pointer-events:none;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 70%)}',
'.nvb-sl{border-radius:calc(var(--u)*8);overflow:visible}',
'.nvb-sl img{position:absolute;left:-14%;top:-14%;width:128%;height:128%;object-fit:contain;image-rendering:pixelated;pointer-events:none}',
'.nvb-sl.on::before{content:"";position:absolute;left:-2%;top:-2%;right:-2%;bottom:-2%;border-radius:calc(var(--u)*9);box-shadow:0 0 0 calc(var(--u)*3) #ffe27a,0 0 calc(var(--u)*16) rgba(255,226,122,.9);pointer-events:none;animation:nvb-gl 1.3s ease-in-out infinite}',
'@keyframes nvb-gl{0%,100%{opacity:.7}50%{opacity:1}}',
'.nvb-sl.lk img{filter:grayscale(.85) brightness(.55)}',
'.nvb-bd{position:absolute;right:2%;bottom:2%;font-size:calc(var(--u)*17);line-height:1;pointer-events:none;text-shadow:0 0 calc(var(--u)*4) #000,0 0 calc(var(--u)*2) #000}',
'.nvb-bd.mac{left:auto;right:3%;top:3%;bottom:auto;width:calc(var(--u)*20);height:calc(var(--u)*20);display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(180deg,#7dffa0,#1fa84a);color:#04240f;font-size:calc(var(--u)*14);font-weight:900;text-shadow:none;box-shadow:0 0 calc(var(--u)*6) rgba(120,255,160,.9)}',
'.nvb-tin{display:flex;flex-direction:column;gap:calc(var(--u)*6);padding:calc(var(--u)*10) calc(var(--u)*12);color:#e8f2ff;font-size:calc(var(--u)*17);line-height:1.3;overflow:hidden;text-shadow:0 calc(var(--u)*1) 0 #02061c,0 0 calc(var(--u)*5) #02061c}',
'.nvb-tin .t{font-weight:800;font-size:calc(var(--u)*23);color:#ffe9a0;text-align:center;line-height:1.15}',
'.nvb-tin .s{text-align:center;color:#9fd8ff;font-size:calc(var(--u)*17)}',
'.nvb-tin .r{display:flex;justify-content:space-between;gap:calc(var(--u)*6)}',
'.nvb-tin .r b{color:#ffd978;font-weight:700}',
'.nvb-tin .mo{margin-top:calc(var(--u)*4);color:#bcd2ff;font-size:calc(var(--u)*16);font-style:italic}',
'.nvb-tin .ok{color:#8dff9a}.nvb-tin .no{color:#ff9a8a}'
].join('\n');

function build(){
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  root_=document.createElement('div');root_.className='nvb';
  fr=document.createElement('div');fr.className='nvb-fr';root_.appendChild(fr);
  /* chỗ nhân vật: bóng + ảnh */
  var S=BOX.stand;
  E.sh=mk('div','nvb-sh',{x:S.cx-95,y:S.by-22,w:190,h:44});
  E.nv=mk('img','nvb-nv',{x:S.cx-S.w/2,y:S.by-S.w,w:S.w,h:S.w});E.nv.alt='';E.nv.draggable=false;
  E.nv.onerror=function(){if(E.nv._fb)return;E.nv._fb=1;var n=N();if(n)E.nv.src=n.anhChon(gioi());};
  E.ten=mk('div','nvb-ten',BOX.ten);
  /* 8 ô trang bị để dành */
  BOX.slotL.xs.forEach(function(x){BOX.slotL.ys.forEach(function(y){var b=mk('button','nvb-sl',cell(x,y,BOX.slotL.s));b.type='button';b.setAttribute('aria-label','Ô trang bị nhân vật');b.addEventListener('click',function(){toast('Trang bị nhân vật: sắp ra mắt');});});});
  /* lưới skin */
  E.cells=[];
  BOX.grid.ys.forEach(function(y){BOX.grid.xs.forEach(function(x){var b=mk('button','nvb-sl',cell(x,y,BOX.grid.s));b.type='button';b._i=E.cells.length;
    b.addEventListener('click',function(){var a=dsSkin(),it=a[b._i];if(it){sel=it.id;render();}});E.cells.push(b);});});
  E.tin=mk('div','nvb-tin',BOX.tin);
  var B=BOX.btn;
  E.chon=mk('button','nvb-b',B.chon);E.khoa=mk('button','nvb-b',B.khoa);E.thao=mk('button','nvb-b',B.thao);E.vut=mk('button','nvb-b',B.vut);
  E.chon.setAttribute('aria-label','Chọn');E.khoa.setAttribute('aria-label','Khóa');E.thao.setAttribute('aria-label','Tháo trang bị');E.vut.setAttribute('aria-label','Vứt bỏ');
  [E.chon,E.khoa,E.thao,E.vut].forEach(function(b){b.type='button';});
  E.chon.addEventListener('click',aChon);E.khoa.addEventListener('click',aKhoa);E.thao.addEventListener('click',aThao);E.vut.addEventListener('click',aVut);
  E.x=mk('button','nvb-x',BOX.close);E.x.type='button';E.x.setAttribute('aria-label','Đóng');E.x.addEventListener('click',close);
  document.body.appendChild(root_);
  root_.addEventListener('click',function(e){if(e.target===root_&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close();});
  root.addEventListener('resize',unit);
}
function unit(){if(!fr)return;fr.style.setProperty('--u',(fr.clientWidth/SW).toFixed(4)+'px');}

/* HÀNH ĐỘNG */
function aChon(){var n=N();if(!n)return;
  if(!daMo(sel)){toast('Bạn chưa sở hữu bộ này');return;}
  if(sel===dangMac()){toast('Đang mặc bộ này rồi');return;}
  if(n.datSkin(sel)){try{root.dispatchEvent(new CustomEvent('ttg-nhanvat',{detail:n.get()}));}catch(e){}toast('Đã mặc: '+skinInfo(sel).ten);render();}}
function aKhoa(){if(!daMo(sel)){toast('Bạn chưa sở hữu bộ này');return;}
  var k=!daKhoa(sel);setKhoa(sel,k);toast(k?'Đã khóa: không thể vứt bỏ':'Đã mở khóa');render();}
function aThao(){var n=N();if(!n)return;
  if(dangMac()==='mac-dinh'){toast('Đang mặc bộ mặc định');return;}
  if(n.datSkin('mac-dinh')){try{root.dispatchEvent(new CustomEvent('ttg-nhanvat',{detail:n.get()}));}catch(e){}sel='mac-dinh';toast('Đã tháo, về bộ mặc định');render();}}
function aVut(){var n=N();if(!n)return;
  if(sel==='mac-dinh'){toast('Không thể vứt bỏ bộ mặc định');return;}
  if(!daMo(sel)){toast('Bạn chưa sở hữu bộ này');return;}
  if(daKhoa(sel)){toast('Bộ này đang khóa, hãy mở khóa trước');return;}
  var id=sel,nm=skinInfo(id).ten;
  if(root.TTGTBAO&&TTGTBAO.confirm){TTGTBAO.confirm('Vứt bỏ <b>'+esc(nm)+'</b>?<br>Bộ này sẽ biến mất khỏi kho.',[{t:'Vứt bỏ',cls:'d',cb:function(){if(n.boSkin(gioi(),id)){sel='mac-dinh';toast('Đã vứt bỏ');render();}}},{t:'Hủy'}]);}
  else if(n.boSkin(gioi(),id)){sel='mac-dinh';render();}}

/* VẼ */
function render(){
  if(!fr)return;
  var n=N(),g=gioi(),a=dsSkin(),mac=dangMac(),i;
  if(!skinInfo(sel)||!a.some(function(x){return x.id===sel;}))sel=mac;
  var nm=(n&&n.ten&&n.ten())||'Chưa đặt tên';
  E.ten.textContent=nm;
  var src=DIR+g+'/'+sel+'-tran-tu-the.png'+V;
  if(E.nv.getAttribute('data-s')!==src){E.nv._fb=0;E.nv.setAttribute('data-s',src);E.nv.src=src;}
  for(i=0;i<E.cells.length;i++){var c=E.cells[i],it=a[i];
    if(!it){c.style.visibility='hidden';c.innerHTML='';continue;}
    c.style.visibility='visible';
    var mo=daMo(it.id),kh=daKhoa(it.id);
    c.className='nvb-sl'+(it.id===sel?' on':'')+(mo?'':' lk');
    c.innerHTML='<img alt="" draggable="false" src="'+DIR+g+'/'+it.id+'-chon.png'+V+'">'+(it.id===mac?'<span class="nvb-bd mac">✓</span>':'')+(kh?'<span class="nvb-bd">🔒</span>':(mo?'':'<span class="nvb-bd">🚫</span>'));
    c.setAttribute('aria-label',it.ten);}
  /* khung thông tin */
  var s=skinInfo(sel),mo2=daMo(sel),gi=null,L=(n&&n.list)||[];for(i=0;i<L.length;i++)if(L[i].id===g)gi=L[i];
  var tt=sel===mac?'<span class="ok">Đang dùng</span>':(mo2?'Đã sở hữu':'<span class="no">Chưa sở hữu</span>');
  E.tin.innerHTML='<div class="t">'+esc(s.ten)+'</div><div class="s">'+esc(gi?gi.ten:'')+'</div>'+
    '<div class="r"><span>Biệt danh</span><b>'+esc(nm)+'</b></div>'+
    '<div class="r"><span>Trạng thái</span><b>'+tt+'</b></div>'+
    '<div class="r"><span>Khóa</span><b>'+(daKhoa(sel)?'Đang khóa':'Không')+'</b></div>'+
    (gi?'<div class="mo">'+esc(gi.mota)+'</div>':'');
  /* nút mờ khi không dùng được */
  E.chon.classList.toggle('dis',!mo2||sel===mac);
  E.khoa.classList.toggle('dis',!mo2);
  E.thao.classList.toggle('dis',mac==='mac-dinh');
  E.vut.classList.toggle('dis',sel==='mac-dinh'||!mo2||daKhoa(sel));
}

function open(){
  try{if(root.TTGBALO&&TTGBALO.close)TTGBALO.close();}catch(e){}
  try{if(root.TTGTHU&&TTGTHU.close)TTGTHU.close();}catch(e){}
  try{if(root.TTGSHOP&&TTGSHOP.close)TTGSHOP.close();}catch(e){}
  if(!root_)build();
  isOpen=true;openAt=performance.now();sel=dangMac();root_.classList.add('on');unit();render();}
function close(){if(!root_)return;isOpen=false;root_.classList.remove('on');}
root.TTGNVB={open:open,close:close,isOpen:function(){return isOpen;},BOX:BOX,render:function(){if(isOpen)render();}};
root.addEventListener('ttg-nhanvat-ten',function(){if(isOpen)render();});

/* NÚT TRÊN THANH NÚT: ngoài cùng bên phải, cao 2 hàng. Vị trí cột ở bảng CFG.bo của 52-nut-vuong.js ('nhan-vat'); cỡ + offsetY chỉnh ở đây. */
try{if(root.TTGNV&&TTGNV.add)TTGNV.add({id:'nhan-vat',ten:'Nhân Vật',image:D+'icon/nhan-vat.webp?v=1',w:62,h:64,offsetY:22.5,onTap:open});}catch(e){}
})(window);
