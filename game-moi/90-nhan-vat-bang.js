/* 90-nhan-vat-bang.js - BẢNG NHÂN VẬT (TTGNVB) (26/11/2026). Mở bằng icon "Nhân Vật" ở thanh nút (ngoài cùng bên phải), nạp động từ 81-nut-moi.js.
   ẢNH: game-moi/khung-nhan-vat.webp (1406x768, đã tách nền xanh, bỏ dấu sao góc) + nut-trong-nv.webp (miếng che chữ "Tháo Trang Bị" để chữ do code vẽ) + icon/nhan-vat.webp. Mọi tọa độ ở khối BOX, tính theo pixel ảnh khung (SW x SH).
   BỐ CỤC: trái = nhân vật đứng trên bục (nhỏ lại để chừa chỗ DANH HIỆU nổi trên đầu), thanh vàng = biệt danh; 8 ô hai bên: ô 1 (trên-trái) = DANH HIỆU, ô 2 = KHUNG UI (2 ô này đã chuyển từ khung Trang Bị của thú sang đây), ô 3 = TRANG PHỤC (skin đang mặc), 5 ô còn lại để dành;
   phải = lưới 15 ô (3x5, nhiều hơn thì lật trang: lăn chuột / vuốt dọc / chạm số trang) gồm các SKIN chưa mặc của giới đang chọn + Danh hiệu / Khung UI trong túi (món đang mang nằm ở ô bên trái), khung Thông Tin, 4 nút:
     Chọn = mặc món đang chọn | Khóa = khóa/mở khóa (món khóa không vứt bỏ được) | TRANG BỊ / THÁO TRANG BỊ = nút đổi chữ: món đang chọn chưa mặc -> "Trang Bị" (bấm để mặc), món đang mặc -> "Tháo Trang Bị" (bấm để tháo; skin tháo = về bộ mặc định) | Vứt Bỏ = bỏ skin đã mở / xóa danh hiệu, khung UI (không áp dụng món mặc định / đang mặc).
   DỮ LIỆU Danh hiệu + Khung UI vẫn nằm trong kho TTGTB (55-trang-bi.js: món có trường dh / khui, ô 2 và 3); khung Trang Bị của thú không còn hiện chúng. API dùng: TTGTB.macVao / thao / vut / isMac.
   Thêm skin: khai trong SKINS của 64b + ảnh <skin>-chon.png và <skin>-tran-tu-the.png; bảng này tự hiện. Đóng: nút X, chạm ngoài khung, Esc. API: TTGNVB.open()/close()/isOpen(). */
(function(root){
'use strict';
if(root.TTG_BLOCK)return;
var SW=1406,SH=768,D='game-moi/',V='?v=3',DIR=D+'nhan-vat/',KEYK='ttg_moi_nhanvat_khoa_v1';
var BOX={
  close:{x:1268,y:14,w:120,h:104},
  ten:{x:227,y:135,w:295,h:33},                 /* thanh vàng đầu cột trái: biệt danh */
  stand:{cx:372,by:552,w:255},                  /* nhân vật: tâm ngang, đáy chân (trên mặt bục), bề rộng (nhỏ lại để danh hiệu nổi trên đầu) */
  dh:{w:190,maxh:78,gap:2},                     /* danh hiệu nổi trên đầu: bề rộng, cao tối đa, hở so với đỉnh đầu */
  headTop:0.076,                                /* tỉ lệ đỉnh đầu trong ảnh nhân vật (hàng pixel đầu tiên có hình / cao ảnh) */
  tin:{x:1092,y:195,w:228,h:350},               /* khung Thông Tin */
  btn:{chon:{x:1072,y:563,w:136,h:49},khoa:{x:1210,y:563,w:132,h:49},thao:{x:1072,y:621,w:136,h:57},vut:{x:1210,y:621,w:132,h:57}},
  thaoCover:{x:1083,y:629,w:117,h:41},          /* miếng che chữ "Tháo Trang Bị" (nut-trong-nv.webp), chữ "Trang Bị" do code vẽ đè lên */
  slotL:{xs:[144,603.5],ys:[227.5,317,404,494],s:78},   /* 8 ô bên nhân vật: 2 cột x 4 hàng. Thứ tự ô = cột trái từ trên xuống (0-3), rồi cột phải (4-7). Ô 0 = Danh hiệu, ô 1 = Khung UI, ô 2 = Trang Phục (skin đang mặc) */
  grid:{xs:[789,897,1003.5],ys:[212,327,437,534,632],s:84},   /* 15 ô: 3 cột x 5 hàng */
  page:{x:857,y:680,w:80,h:17}                  /* số trang (chỉ hiện khi quá 15 món) */
};
var PAGE=15;
var root_,fr,E={},isOpen=false,openAt=0,sel={k:'skin',id:'mac-dinh'},page=0;
function N(){return root.TTGNHANVAT||null;}
function TB(){return(root.TTGTB&&TTGTB.list&&TTGTB.macVao)?root.TTGTB:null;}
function rd(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function toast(s){try{if(root.TTGTBAO&&TTGTBAO.toast)TTGTBAO.toast(s,2200);}catch(e){}}
function gioi(){var n=N();return n?n.gioi():'nu';}
function dsSkin(){var n=N();return(n&&n.dsSkin&&n.dsSkin(gioi()))||(n&&n.SKINS&&n.SKINS[gioi()])||[{id:'mac-dinh',ten:'Mặc định'}];}   /* gồm skin của CẢ 2 giới (không phân giới) */
function fd(id){var n=N();return(n&&n.thuMuc)?n.thuMuc(gioi(),id):gioi();}   /* thư mục ảnh của skin */
function skinInfo(id){var a=dsSkin();for(var i=0;i<a.length;i++)if(a[i].id===id)return a[i];return a[0];}
function dangMac(){var n=N();return n?n.skin():'mac-dinh';}
function daMo(id){var n=N();return n?n.daMo(gioi(),id):id==='mac-dinh';}
function khoaMap(){return rd(KEYK)||{};}
function daKhoa(id){var o=khoaMap(),k;for(k in o)if(o[k]&&o[k][id])return true;return false;}
function setKhoa(id,v){var o=khoaMap(),k;for(k in o)if(o[k])delete o[k][id];if(v){if(!o.chung)o.chung={};o.chung[id]=1;}wr(KEYK,o);}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function pc(v,t){return (v/t*100).toFixed(3)+'%';}
function place(el,b){el.style.left=pc(b.x,SW);el.style.top=pc(b.y,SH);el.style.width=pc(b.w,SW);el.style.height=pc(b.h,SH);}
function mk(tag,cls,b){var e=document.createElement(tag);e.className=cls;if(b)place(e,b);fr.appendChild(e);return e;}
function cell(cx,cy,s){return{x:cx-s/2,y:cy-s/2,w:s,h:s};}

/* ===== MÓN DANH HIỆU / KHUNG UI (kho TTGTB) ===== */
function isNv(t){return !!(t&&(t.dh||t.khui));}
function loaiNv(t){return t.dh?'Danh hiệu':'Khung UI';}
function allNv(){var tb=TB();return tb?tb.list().filter(isNv):[];}
function macNv(loai){var tb=TB();if(!tb)return null;var a=tb.dangMac(),i;for(i=0;i<a.length;i++)if(a[i]&&(loai==='dh'?a[i].dh:a[i].khui))return a[i];return null;}
function trongTui(){var tb=TB();return allNv().filter(function(t){return !tb.isMac(t.uid);});}
function iconNv(t){return t.img?'<img alt="" draggable="false" src="'+esc(t.img)+'">':'<span class="em">'+esc(t.ic||'❔')+'</span>';}
function curItem(){if(sel.k!=='item')return null;var tb=TB(),t=tb&&tb.get(sel.uid);return(t&&isNv(t))?t:null;}
function isEquipped(){
  if(sel.k==='item'){var tb=TB();return !!(tb&&tb.isMac(sel.uid));}
  return sel.id===dangMac();}
function isLocked(){var t=curItem();if(sel.k==='item')return !!(t&&t.kh);return daKhoa(sel.id);}
function selKey(e){return e.k==='skin'?'s:'+e.id:'i:'+e.uid;}
/* danh sách ô lưới: skin của giới + danh hiệu/khung UI chưa mang */
function entries(){
  var mac=dangMac(),o=dsSkin().filter(function(s){return s.id!==mac&&daMo(s.id);}).map(function(s){return{k:'skin',id:s.id};});   /* bộ đang mặc nằm ở ô Trang Phục, không lặp trong lưới */
  trongTui().forEach(function(t){o.push({k:'item',uid:t.uid});});
  return o;}

var css=[
'.nvb{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Noto Serif","Palatino Linotype",Georgia,"Times New Roman",serif;-webkit-tap-highlight-color:transparent}',
'.nvb.on{display:flex}',
'.nvb-fr{position:relative;width:min(98vw,calc(96vh*'+SW+'/'+SH+'));aspect-ratio:'+SW+'/'+SH+';background:url('+D+'khung-nhan-vat.webp'+V+') 0 0/100% 100% no-repeat;--u:1px;animation:nvb-in .18s ease-out;touch-action:manipulation}',
'@keyframes nvb-in{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:none}}',
'.nvb-fr>*{position:absolute;box-sizing:border-box}',
'.nvb button{padding:0;border:0;background:transparent;cursor:pointer;touch-action:manipulation;color:inherit;font:inherit}',
'.nvb-x{border-radius:50%}',
'.nvb-x:active,.nvb-b:active{box-shadow:0 0 calc(var(--u)*22) rgba(255,224,102,.85),inset 0 0 calc(var(--u)*22) rgba(255,224,102,.35)}',
'.nvb-b{border-radius:calc(var(--u)*10)}',
'.nvb-b.dis::after{content:"";position:absolute;left:3%;right:3%;top:6%;bottom:6%;border-radius:calc(var(--u)*10);background:rgba(2,4,22,.55);pointer-events:none}',
/* chữ đổi được trên nút Tháo Trang Bị: miếng che + chữ "Trang Bị" */
'.nvb-pl{display:none;align-items:center;justify-content:center;background:url('+D+'nut-trong-nv.webp'+V+') 0 0/100% 100% no-repeat;font-weight:800;font-size:calc(var(--u)*24);line-height:1;white-space:nowrap;color:#ffe9a0;-webkit-text-stroke:calc(var(--u)*1.2) #3b2200;paint-order:stroke fill;text-shadow:0 calc(var(--u)*2) 0 #5a3000,0 0 calc(var(--u)*6) rgba(0,0,0,.7);pointer-events:none}',
'.nvb-pl.on{display:flex}',
'.nvb-ten{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*22);line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#4a2600;text-shadow:0 calc(var(--u)*1) 0 rgba(255,246,200,.85);pointer-events:none;padding:0 4%}',
'.nvb-nv,.nvb-dh{pointer-events:none;image-rendering:auto;transform-origin:50% 100%;animation:nvb-bob 2.6s ease-in-out infinite}',
'.nvb-nv{filter:drop-shadow(0 0 calc(var(--u)*8) rgba(120,190,255,.55))}',
'.nvb-dh{filter:drop-shadow(0 calc(var(--u)*2) calc(var(--u)*4) rgba(0,0,0,.6));object-fit:contain;object-position:50% 100%}',
'@keyframes nvb-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(calc(var(--u)*-5))}}',
'.nvb-sh{pointer-events:none;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,.55) 0%,rgba(0,0,0,0) 70%)}',
'.nvb-sl{border-radius:calc(var(--u)*8);overflow:visible}',
/* icon nằm TRỌN trong ô (không còn lòi chân ra ngoài): bọc trong .in có overflow ẩn, ảnh co vừa khung (contain) */
'.nvb-sl .in{position:absolute;left:5%;top:5%;right:5%;bottom:5%;overflow:hidden;border-radius:calc(var(--u)*7);display:flex;align-items:center;justify-content:center;pointer-events:none}',
'.nvb-sl .in img{width:100%;height:100%;object-fit:contain;object-position:50% 50%;pointer-events:none}',
'.nvb-sl .in .em{font-size:calc(var(--u)*40);line-height:1;filter:drop-shadow(0 calc(var(--u)*2) calc(var(--u)*3) rgba(0,0,0,.7))}',
'.nvb-sl.on::before{content:"";position:absolute;left:-2%;top:-2%;right:-2%;bottom:-2%;border-radius:calc(var(--u)*9);box-shadow:0 0 0 calc(var(--u)*3) #ffe27a,0 0 calc(var(--u)*16) rgba(255,226,122,.9);pointer-events:none;animation:nvb-gl 1.3s ease-in-out infinite}',
'@keyframes nvb-gl{0%,100%{opacity:.7}50%{opacity:1}}',
'.nvb-sl.lk .in img{filter:grayscale(.85) brightness(.55)}',
'.nvb-bd{position:absolute;right:6%;bottom:6%;font-size:calc(var(--u)*17);line-height:1;pointer-events:none;text-shadow:0 0 calc(var(--u)*4) #000,0 0 calc(var(--u)*2) #000}',
'.nvb-bd.mac{left:auto;right:7%;top:7%;bottom:auto;width:calc(var(--u)*20);height:calc(var(--u)*20);display:flex;align-items:center;justify-content:center;border-radius:50%;background:linear-gradient(180deg,#7dffa0,#1fa84a);color:#04240f;font-size:calc(var(--u)*14);font-weight:900;text-shadow:none;box-shadow:0 0 calc(var(--u)*6) rgba(120,255,160,.9)}',
'.nvb-pg{display:none;align-items:center;justify-content:center;font-weight:800;font-size:calc(var(--u)*13);line-height:1;color:#ffe9a0;text-shadow:0 0 calc(var(--u)*4) #02061c,0 calc(var(--u)*1) 0 #02061c;cursor:pointer;touch-action:manipulation}',
'.nvb-pg.on{display:flex}',
'.nvb-tin{display:flex;flex-direction:column;gap:calc(var(--u)*6);padding:calc(var(--u)*10) calc(var(--u)*12);color:#e8f2ff;font-size:calc(var(--u)*17);line-height:1.3;overflow:hidden;text-shadow:0 calc(var(--u)*1) 0 #02061c,0 0 calc(var(--u)*5) #02061c}',
'.nvb-tin .t{font-weight:800;font-size:calc(var(--u)*23);color:#ffe9a0;text-align:center;line-height:1.15}',
'.nvb-tin .s{text-align:center;color:#9fd8ff;font-size:calc(var(--u)*17)}',
'.nvb-tin .r{display:flex;justify-content:space-between;gap:calc(var(--u)*6)}',
'.nvb-tin .r b{color:#ffd978;font-weight:700;text-align:right}',
'.nvb-tin .mo{margin-top:calc(var(--u)*4);color:#bcd2ff;font-size:calc(var(--u)*16);font-style:italic}',
'.nvb-tin .ok{color:#8dff9a}.nvb-tin .no{color:#ff9a8a}'
].join('\n');

function build(){
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  root_=document.createElement('div');root_.className='nvb';
  fr=document.createElement('div');fr.className='nvb-fr';root_.appendChild(fr);
  /* chỗ nhân vật: bóng + ảnh + danh hiệu nổi trên đầu */
  var S=BOX.stand;
  E.sh=mk('div','nvb-sh',{x:S.cx-95,y:S.by-22,w:190,h:44});
  E.nv=mk('img','nvb-nv',{x:S.cx-S.w/2,y:S.by-S.w,w:S.w,h:S.w});E.nv.alt='';E.nv.draggable=false;
  E.nv.onerror=function(){if(E.nv._fb)return;E.nv._fb=1;var n=N();if(n)E.nv.src=n.anhChon(gioi());};
  E.dh=mk('img','nvb-dh',{x:S.cx-BOX.dh.w/2,y:0,w:BOX.dh.w,h:BOX.dh.maxh});E.dh.alt='';E.dh.draggable=false;E.dh.style.display='none';
  E.dh.onload=fitDh;
  E.ten=mk('div','nvb-ten',BOX.ten);
  /* 8 ô bên nhân vật: ô 0 = Danh hiệu, ô 1 = Khung UI, còn lại để dành */
  E.slots=[];
  BOX.slotL.xs.forEach(function(x,ci){BOX.slotL.ys.forEach(function(y,ri){var i=ci*4+ri,b=mk('button','nvb-sl',cell(x,y,BOX.slotL.s));b.type='button';b._i=i;
    b.setAttribute('aria-label',i===0?'Ô Danh hiệu':(i===1?'Ô Khung UI':(i===2?'Ô Trang Phục':'Ô trang bị nhân vật')));
    b.addEventListener('click',function(){tapSlot(i);});E.slots.push(b);});});
  /* lưới 15 ô */
  E.cells=[];
  BOX.grid.ys.forEach(function(y){BOX.grid.xs.forEach(function(x){var b=mk('button','nvb-sl',cell(x,y,BOX.grid.s));b.type='button';b._i=E.cells.length;
    b.addEventListener('click',function(){var e=entries()[page*PAGE+b._i];if(e){sel=e;render();}});E.cells.push(b);});});
  E.pg=mk('div','nvb-pg',BOX.page);E.pg.addEventListener('click',function(){goPage(1,true);});
  E.tin=mk('div','nvb-tin',BOX.tin);
  var B=BOX.btn;
  E.chon=mk('button','nvb-b',B.chon);E.khoa=mk('button','nvb-b',B.khoa);E.thao=mk('button','nvb-b',B.thao);E.vut=mk('button','nvb-b',B.vut);
  E.ovEq=mk('div','nvb-pl',BOX.thaoCover);E.ovEq.textContent='Trang Bị';   /* pointer-events none: bấm vẫn xuống nút Tháo/Trang Bị bên dưới */
  E.chon.setAttribute('aria-label','Chọn');E.khoa.setAttribute('aria-label','Khóa');E.thao.setAttribute('aria-label','Trang bị / Tháo trang bị');E.vut.setAttribute('aria-label','Vứt bỏ');
  [E.chon,E.khoa,E.thao,E.vut].forEach(function(b){b.type='button';});
  E.chon.addEventListener('click',aChon);E.khoa.addEventListener('click',aKhoa);E.thao.addEventListener('click',aThao);E.vut.addEventListener('click',aVut);
  E.x=mk('button','nvb-x',BOX.close);E.x.type='button';E.x.setAttribute('aria-label','Đóng');E.x.addEventListener('click',close);
  document.body.appendChild(root_);
  root_.addEventListener('click',function(e){if(e.target===root_&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close();});
  /* lật trang lưới: lăn chuột / vuốt dọc trên vùng lưới */
  function inGrid(cx,cy){var r=fr.getBoundingClientRect(),x=(cx-r.left)/r.width*SW,y=(cy-r.top)/r.height*SH;return x>=735&&x<=1058&&y>=155&&y<=685;}
  fr.addEventListener('wheel',function(e){if(inGrid(e.clientX,e.clientY)&&pages()>1){e.preventDefault();goPage(e.deltaY>0?1:-1);}},{passive:false});
  var t0=null;
  fr.addEventListener('touchstart',function(e){var t=e.touches[0];t0=inGrid(t.clientX,t.clientY)?{x:t.clientX,y:t.clientY}:null;},{passive:true});
  fr.addEventListener('touchend',function(e){if(!t0||!e.changedTouches.length)return;var t=e.changedTouches[0],dx=t.clientX-t0.x,dy=t.clientY-t0.y;t0=null;
    if(Math.abs(dy)>40&&Math.abs(dy)>Math.abs(dx)*1.3&&pages()>1)goPage(dy<0?1:-1);},{passive:true});
  root.addEventListener('resize',unit);
}
function unit(){if(!fr)return;fr.style.setProperty('--u',(fr.clientWidth/SW).toFixed(4)+'px');}
function pages(){return Math.max(1,Math.ceil(entries().length/PAGE));}
function goPage(d,wrap){var n=pages(),p=page+d;if(p>=n)p=wrap?0:n-1;if(p<0)p=wrap?n-1:0;if(p!==page){page=p;render();}}
/* danh hiệu nổi trên đầu nhân vật: đáy danh hiệu = đỉnh đầu (nhân vật đã thu nhỏ để có chỗ) */
function fitDh(){
  if(!E.dh||!E.dh.naturalWidth)return;
  var S=BOX.stand,w=BOX.dh.w,h=w*E.dh.naturalHeight/E.dh.naturalWidth;
  if(h>BOX.dh.maxh){w*=BOX.dh.maxh/h;h=BOX.dh.maxh;}
  var bottom=S.by-S.w+BOX.headTop*S.w-BOX.dh.gap;
  place(E.dh,{x:S.cx-w/2,y:bottom-h,w:w,h:h});}

/* ===== HÀNH ĐỘNG ===== */
function nvChanged(){var n=N();try{root.dispatchEvent(new CustomEvent('ttg-nhanvat',{detail:n?n.get():null}));}catch(e){}}
function aChon(){if(isEquipped()){toast('Đang mặc rồi');return;}doEq();}
function aThao(){doEq();}
/* nút Trang Bị / Tháo Trang Bị: món chưa mặc -> mặc; món đang mặc -> tháo */
function doEq(){
  var n=N(),tb=TB();
  if(sel.k==='item'){
    var t=curItem();if(!t||!tb){toast('Chưa chọn trang bị');return;}
    if(tb.isMac(t.uid)){tb.thao(t.uid);toast('Đã tháo '+t.ten);}
    else{tb.macVao(t.uid);toast('Đã mang '+t.ten);}
    if(!trongTui().some(function(x){return x.uid===sel.uid;})&&!tb.isMac(sel.uid))sel={k:'skin',id:dangMac()};
    render();return;}
  if(!n)return;
  if(!daMo(sel.id)){toast('Bạn chưa sở hữu bộ này');return;}
  if(sel.id===dangMac()){
    if(sel.id==='mac-dinh'){toast('Đây là bộ mặc định, không cần tháo');return;}
    if(n.datSkin('mac-dinh')){nvChanged();sel={k:'skin',id:'mac-dinh'};toast('Đã tháo, về bộ mặc định');render();}
    return;}
  if(n.datSkin(sel.id)){nvChanged();toast('Đã mặc: '+skinInfo(sel.id).ten);render();}
}
function aKhoa(){
  if(sel.k==='item'){var t=curItem(),tb=TB();if(!t||!tb)return;var k=!t.kh;tb.update(t.uid,{kh:k?1:0});toast(k?'Đã khóa: không thể vứt bỏ':'Đã mở khóa');render();return;}
  if(!daMo(sel.id)){toast('Bạn chưa sở hữu bộ này');return;}
  var k2=!daKhoa(sel.id);setKhoa(sel.id,k2);toast(k2?'Đã khóa: không thể vứt bỏ':'Đã mở khóa');render();}
function aVut(){
  var n=N(),tb=TB();
  if(sel.k==='item'){
    var t=curItem();if(!t||!tb){toast('Chưa chọn trang bị');return;}
    if(tb.isMac(t.uid)){toast('Đang mang, hãy tháo trước');return;}
    if(t.kh){toast('Đang khóa, hãy mở khóa trước');return;}
    var u=t.uid,nm0=t.ten,xoa=function(){if(tb.vut(u)){sel={k:'skin',id:dangMac()};toast('Đã vứt bỏ');render();}};
    if(root.TTGTBAO&&TTGTBAO.confirm)TTGTBAO.confirm('Vứt bỏ <b>'+esc(nm0)+'</b>?<br>Món này sẽ biến mất khỏi kho.',[{t:'Vứt bỏ',cls:'d',cb:xoa},{t:'Hủy'}]);else xoa();
    return;}
  if(!n)return;
  if(sel.id==='mac-dinh'){toast('Không thể vứt bỏ bộ mặc định');return;}
  if(!daMo(sel.id)){toast('Bạn chưa sở hữu bộ này');return;}
  if(daKhoa(sel.id)){toast('Bộ này đang khóa, hãy mở khóa trước');return;}
  var id=sel.id,nm=skinInfo(id).ten;
  if(root.TTGTBAO&&TTGTBAO.confirm){TTGTBAO.confirm('Vứt bỏ <b>'+esc(nm)+'</b>?<br>Bộ này sẽ biến mất khỏi kho.',[{t:'Vứt bỏ',cls:'d',cb:function(){if(n.boSkin(gioi(),id)){sel={k:'skin',id:'mac-dinh'};toast('Đã vứt bỏ');render();}}},{t:'Hủy'}]);}
  else if(n.boSkin(gioi(),id)){sel={k:'skin',id:'mac-dinh'};render();}}
/* chạm ô bên trái: ô 0 Danh hiệu, ô 1 Khung UI. Đang mang món thì chọn nó (rồi bấm Tháo Trang Bị) */
function tapSlot(i){
  if(i===2){sel={k:'skin',id:dangMac()};render();return;}
  if(i>2){toast('Trang bị nhân vật: sắp ra mắt');return;}
  var t=macNv(i===0?'dh':'khui');
  if(!t){toast(i===0?'Chưa mang danh hiệu: chọn danh hiệu trong túi rồi bấm Trang Bị':'Chưa mang khung UI: chọn khung UI trong túi rồi bấm Trang Bị');return;}
  sel={k:'item',uid:t.uid};render();}

/* ===== VẼ ===== */
function render(){
  if(!fr)return;
  var n=N(),g=gioi(),mac=dangMac(),tb=TB(),i,a=entries();
  /* chọn hợp lệ */
  if(sel.k==='item'){if(!curItem())sel={k:'skin',id:mac};}
  else if(!dsSkin().some(function(x){return x.id===sel.id;})||!daMo(sel.id))sel={k:'skin',id:mac};
  var nm=(n&&n.ten&&n.ten())||'Chưa đặt tên';
  E.ten.textContent=nm;
  /* nhân vật: xem trước skin đang chọn (chọn món khác loại skin thì hiện bộ đang mặc) */
  var showId=sel.k==='skin'?sel.id:mac,src=DIR+fd(showId)+'/'+showId+'-tran-tu-the.png'+V;
  if(E.nv.getAttribute('data-s')!==src){E.nv._fb=0;E.nv.setAttribute('data-s',src);E.nv.src=src;}
  /* danh hiệu đang mang nổi trên đầu */
  var dh=macNv('dh');
  if(dh&&dh.img){if(E.dh.getAttribute('data-s')!==dh.img){E.dh.setAttribute('data-s',dh.img);E.dh.src=dh.img;}E.dh.style.display='';fitDh();}
  else{E.dh.style.display='none';E.dh.removeAttribute('data-s');}
  /* 3 ô trái: Danh hiệu, Khung UI, Trang Phục đang mang */
  for(i=0;i<E.slots.length;i++){var sb=E.slots[i],it=i===0?dh:(i===1?macNv('khui'):null);
    if(i===2){sb.innerHTML='<span class="in"><img alt="" draggable="false" src="'+DIR+fd(mac)+'/'+mac+'-chon.png'+V+'"></span>';sb.className='nvb-sl'+(sel.k==='skin'&&sel.id===mac?' on':'');}
    else if(it){sb.innerHTML='<span class="in">'+iconNv(it)+'</span>'+(it.kh?'<span class="nvb-bd">🔒</span>':'');sb.className='nvb-sl'+(sel.k==='item'&&sel.uid===it.uid?' on':'');}
    else{sb.innerHTML='';sb.className='nvb-sl';}}
  /* lưới (có lật trang) */
  var np=pages();if(page>=np)page=np-1;if(page<0)page=0;
  for(i=0;i<E.cells.length;i++){var c=E.cells[i],e=a[page*PAGE+i];
    if(!e){c.style.visibility='hidden';c.innerHTML='';continue;}
    c.style.visibility='visible';
    var on=selKey(e)===selKey(sel);
    if(e.k==='skin'){
      var s=skinInfo(e.id),mo=daMo(e.id),kh=daKhoa(e.id);
      c.className='nvb-sl'+(on?' on':'')+(mo?'':' lk');
      c.innerHTML='<span class="in"><img alt="" draggable="false" src="'+DIR+fd(e.id)+'/'+e.id+'-chon.png'+V+'"></span>'+(e.id===mac?'<span class="nvb-bd mac">✓</span>':'')+(kh?'<span class="nvb-bd">🔒</span>':(mo?'':'<span class="nvb-bd">🚫</span>'));
      c.setAttribute('aria-label',s.ten);}
    else{
      var t=tb&&tb.get(e.uid);
      if(!t){c.style.visibility='hidden';c.innerHTML='';continue;}
      c.className='nvb-sl'+(on?' on':'');
      c.innerHTML='<span class="in">'+iconNv(t)+'</span>'+(t.kh?'<span class="nvb-bd">🔒</span>':'');
      c.setAttribute('aria-label',t.ten);}}
  E.pg.classList.toggle('on',np>1);E.pg.textContent=np>1?'‹ '+(page+1)+'/'+np+' ›':'';
  /* khung thông tin */
  var tin='';
  if(sel.k==='item'){
    var ti=curItem(),dm=isEquipped();
    tin='<div class="t">'+esc(ti.ten)+'</div><div class="s">'+loaiNv(ti)+'</div>'+
      '<div class="r"><span>Trạng thái</span><b>'+(dm?'<span class="ok">Đang mang</span>':'Trong túi')+'</b></div>'+
      '<div class="r"><span>Khóa</span><b>'+(ti.kh?'Đang khóa':'Không')+'</b></div>'+
      (ti.mo?'<div class="mo">'+esc(ti.mo)+'</div>':'');}
  else{
    var si=skinInfo(sel.id),mo2=daMo(sel.id),gi=null,L=(n&&n.list)||[],j;for(j=0;j<L.length;j++)if(L[j].id===fd(sel.id))gi=L[j];
    var tt=sel.id===mac?'<span class="ok">Đang dùng</span>':(mo2?'Đã sở hữu':'<span class="no">Chưa sở hữu</span>');
    var tp=mac==='mac-dinh'?'Mặc định':skinInfo(mac).ten;   /* Trang Phục = bộ nhân vật đang mặc */
    tin='<div class="t">'+esc(si.ten)+'</div><div class="s">'+esc(gi?gi.ten:'')+'</div>'+
      '<div class="r"><span>Trang Phục</span><b>'+esc(tp)+'</b></div>'+
      '<div class="r"><span>Trạng thái</span><b>'+tt+'</b></div>'+
      '<div class="r"><span>Khóa</span><b>'+(daKhoa(sel.id)?'Đang khóa':'Không')+'</b></div>'+
      (gi?'<div class="mo">'+esc(gi.mota)+'</div>':'');}
  E.tin.innerHTML=tin;
  /* nút: chữ "Trang Bị" khi món chọn chưa mặc; đang mặc thì hiện "Tháo Trang Bị" vẽ sẵn trong khung */
  var eqd=isEquipped(),owned=sel.k==='item'?true:daMo(sel.id),isDef=sel.k==='skin'&&sel.id==='mac-dinh';
  E.ovEq.classList.toggle('on',!eqd);
  E.thao.classList.toggle('dis',!owned||(eqd&&isDef));
  E.chon.classList.toggle('dis',!owned||eqd);
  E.khoa.classList.toggle('dis',!owned);
  E.vut.classList.toggle('dis',isDef||!owned||isLocked()||(sel.k==='item'&&eqd));
}

function open(){
  try{if(root.TTGBALO&&TTGBALO.close)TTGBALO.close();}catch(e){}
  try{if(root.TTGTHU&&TTGTHU.close)TTGTHU.close();}catch(e){}
  try{if(root.TTGSHOP&&TTGSHOP.close)TTGSHOP.close();}catch(e){}
  if(!root_)build();
  isOpen=true;openAt=performance.now();sel={k:'skin',id:dangMac()};page=0;root_.classList.add('on');unit();render();}
function close(){if(!root_)return;isOpen=false;root_.classList.remove('on');}
root.TTGNVB={open:open,close:close,isOpen:function(){return isOpen;},BOX:BOX,render:function(){if(isOpen)render();}};
root.addEventListener('ttg-nhanvat-ten',function(){if(isOpen)render();});

/* NÚT TRÊN THANH NÚT: ngoài cùng bên phải, cao 2 hàng. Vị trí cột ở bảng CFG.bo của 52-nut-vuong.js ('nhan-vat'); cỡ + offsetY chỉnh ở đây. */
try{if(root.TTGNV&&TTGNV.add)TTGNV.add({id:'nhan-vat',ten:'Nhân Vật',image:D+'icon/nhan-vat.webp?v=1',w:62,h:64,offsetY:22.5,onTap:open});}catch(e){}
})(window);
