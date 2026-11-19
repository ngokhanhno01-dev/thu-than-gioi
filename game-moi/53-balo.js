/* 53-balo.js - BALO của game-moi: nút Balo (khung vuông + icon) + bảng Balo + dữ liệu túi đồ.
   Cần 52-nut-vuong.js (TTGNV) nạp trước. Ảnh khung bảng: game-moi/khung-balo.webp (1464x665).
   BẢNG: nửa TRÁI = Bóng bắt thú (danh sách thanh, sau này dùng khung thanh dài + bấm mở bảng nổi có nút Dùng/Đóng);
         nửa PHẢI = lưới 24 ô Nguyên liệu (chia trang, tổng CAP ô) + khung thông tin item (icon phóng to, tên, mô tả, số lượng).
   Mọi vị trí bên dưới tính theo pixel ẢNH GỐC 1464x665 (BW x BH), tự co theo cỡ màn hình bằng biến --u (= 1 px ảnh gốc).
   DỮ LIỆU: kho đồ {id: số lượng} lưu ở khóa ttg_moi_balo_v1. Danh mục item (CAT) khai ở khối "DANH MỤC ITEM" bên dưới hoặc gọi TTGBALO.reg({...}).
   API: TTGBALO.open()/close(), .add(id,n) (n âm = trừ), .count(id), .reg(items).
   THỬ BẢNG: thêm ?balo=demo vào link -> có sẵn vài item mẫu (không lưu lại). */
(function(){
'use strict';
if(!window.TTGNV)return;
var KEY='ttg_moi_balo_v1',CAP=100,PAGE=24,BW=1464,BH=665,IMG='game-moi/khung-balo.webp';
var demo=/[?&]balo=demo/.test(location.search);
var LOAI={nl:'Nguyên liệu',bong:'Bóng bắt thú'};
/* ===== DANH MỤC ITEM ===== mỗi item: id:{loai:'nl'|'bong', ten, mo (mô tả), ic (emoji tạm) hoặc img (đường dẫn ảnh icon), cap (cấp bóng)} */
var CAT={};
function reg(o){for(var k in o)CAT[k]=o[k];}
var inv={},page=0,sel=null,isOpen=false,openAt=0,root,fr,E={};
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
function ids(loai){return Object.keys(inv).filter(function(id){return CAT[id]&&CAT[id].loai===loai&&inv[id]>0;});}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function ic(it){return it.img?'<img src="'+esc(it.img)+'" alt="">':'<b>'+esc(it.ic||'?')+'</b>';}

/* ===== CSS: {n} = n px ảnh gốc (tự co theo --u) ===== */
var css=[
'.bl{position:fixed;left:0;top:0;right:0;bottom:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.bl.on{display:flex}',
'.bl-fr{position:relative;width:min(98vw,calc(96vh*1464/665));aspect-ratio:1464/665;background:url('+IMG+') 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.bl-fr>*{position:absolute;box-sizing:border-box}',
'.bl button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.bl-t{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:{36};letter-spacing:{4};color:#ffe9a0;text-shadow:0 0 {8} rgba(255,200,80,.6),0 {2} 0 #000}',
'.bl-x{display:flex;align-items:center;justify-content:center;padding:0;border-radius:50%;border:{2.5} solid #d9a93c;background:radial-gradient(circle at 50% 30%,#3d3da0,#14143e);color:#ffe9a0;font-size:{24};line-height:1;cursor:pointer;box-shadow:0 0 {10} rgba(0,0,0,.6)}',
'.bl-x:active{transform:scale(.92)}',
'.bl-cap{display:flex;align-items:center;justify-content:center;font-weight:700;font-size:{24};color:#bfeee8;text-shadow:0 {2} 0 #000;white-space:nowrap}',
'.bl-pg{display:flex;align-items:center;justify-content:space-between;color:#ffe9a0;font-weight:700;font-size:{22};text-shadow:0 {2} 0 #000}',
'.bl-pg button{width:{34};height:{34};padding:0;border-radius:{8};border:{2} solid #c9992f;background:#1d1d5a;color:#ffe9a0;font-size:{22};line-height:1;cursor:pointer}',
'.bl-pg button:disabled{opacity:.3}',
'.bl-pl{display:flex;align-items:center;justify-content:center;font-weight:800;font-size:{18};letter-spacing:{.5};color:#4a3008;text-shadow:0 {1} 0 rgba(255,246,200,.65);white-space:nowrap}',
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
'.bl-dt{display:flex;flex-direction:column;align-items:center;padding:{10} {8};overflow:hidden}',
'.dt-ic{display:flex;align-items:center;justify-content:center;width:{172};height:{172};flex:none;font-size:{104};border-radius:{14};border:{3} solid #c9992f;background:radial-gradient(circle at 50% 35%,#34348f,#12123a);box-shadow:inset 0 0 {18} rgba(0,0,0,.6)}',
'.dt-ic b{font-weight:400}',
'.dt-nm{margin-top:{12};font-weight:800;font-size:{27};color:#ffe9a0;text-align:center;line-height:1.15}',
'.dt-mt{margin-top:{5};font-size:{19};color:#9fe8de;text-align:center}',
'.dt-ds{margin-top:{10};font-size:{19};line-height:1.35;color:#cfd6ff;text-align:center;overflow:hidden}',
'.dt-hint{margin:auto;font-size:{20};line-height:1.4;color:#8a90c0;text-align:center}'
].join('\n').replace(/\{(\d+(?:\.\d+)?)\}/g,'calc(var(--u)*$1)');
var stl=document.createElement('style');stl.textContent=css;document.head.appendChild(stl);

/* ===== DỰNG BẢNG (một lần) ===== */
function box(c,x,y,w,h){var s=c.style;s.left=(x/BW*100)+'%';s.top=(y/BH*100)+'%';s.width=(w/BW*100)+'%';s.height=(h/BH*100)+'%';return c;}
function mk(tag,cls,x,y,w,h,txt){var c=document.createElement(tag);if(cls)c.className=cls;if(txt!=null)c.textContent=txt;if(w)box(c,x,y,w,h);fr.appendChild(c);return c;}
var COLS=[766,844,923,1002],ROWS=[159,239,319,399,479,558],SL=71;
function build(){
  root=document.createElement('div');root.className='bl';
  fr=document.createElement('div');fr.className='bl-fr';root.appendChild(fr);
  mk('div','bl-t',205,50,200,50,'BALO');
  E.x=mk('button','bl-x',142,53,46,46,'✕');E.x.type='button';E.x.setAttribute('aria-label','Đóng');
  E.cap=mk('div','bl-cap',1128,56,96,44);
  var pg=mk('div','bl-pg',1226,56,112,44);
  E.pv=document.createElement('button');E.pv.type='button';E.pv.textContent='‹';E.pg=document.createElement('span');E.nx=document.createElement('button');E.nx.type='button';E.nx.textContent='›';
  pg.appendChild(E.pv);pg.appendChild(E.pg);pg.appendChild(E.nx);
  mk('div','bl-pl',269,143,209,30,'Bóng bắt thú');
  E.balls=mk('div','bl-balls',88,190,580,402);
  E.slots=[];
  for(var r=0;r<6;r++)for(var c=0;c<4;c++){var b=mk('button','bl-sl',COLS[c],ROWS[r],SL,SL);b.type='button';(function(i){b.addEventListener('click',function(){clickSlot(i);});})(r*4+c);E.slots.push(b);}
  E.dt=mk('div','bl-dt',1122,172,252,448);
  document.body.appendChild(root);
  E.x.addEventListener('click',close);
  E.pv.addEventListener('click',function(){if(page>0){page--;render();}});
  E.nx.addEventListener('click',function(){if(page<pages()-1){page++;render();}});
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close();});
  window.addEventListener('resize',unit);
}
function unit(){if(fr)fr.style.setProperty('--u',(fr.clientWidth/BW)+'px');}
function pages(){return Math.max(1,Math.ceil(CAP/PAGE));}
function clickSlot(i){var id=ids('nl')[page*PAGE+i];if(!id)return;sel=id;render();}
function render(){
  var nl=ids('nl'),bg=ids('bong'),i;
  if(page>pages()-1)page=pages()-1;
  if(sel&&(!CAT[sel]||count(sel)<=0))sel=null;
  E.cap.textContent=nl.length+'/'+CAP;E.pg.textContent=(page+1)+'/'+pages();E.pv.disabled=page<=0;E.nx.disabled=page>=pages()-1;
  for(i=0;i<E.slots.length;i++){var id=nl[page*PAGE+i],b=E.slots[i];
    if(id){var it=CAT[id];b.innerHTML='<span class="i">'+ic(it)+'</span><span class="q">'+(count(id)>1?count(id):'')+'</span>';b.setAttribute('aria-label',it.ten);}
    else{b.innerHTML='';b.removeAttribute('aria-label');}
    b.classList.toggle('sel',id===sel&&!!id);}
  E.balls.innerHTML='';
  if(!bg.length){var em=document.createElement('div');em.className='bl-emp';em.textContent='Chưa có bóng bắt thú';E.balls.appendChild(em);}
  bg.forEach(function(id){var it=CAT[id],r=document.createElement('div');r.className='bl-row'+(id===sel?' sel':'');
    r.innerHTML='<span class="i">'+ic(it)+'</span><span class="n">'+esc(it.ten)+'</span>'+(it.cap?'<span class="l">Cấp '+it.cap+'</span>':'')+'<span class="q">x'+count(id)+'</span>';
    r.addEventListener('click',function(){sel=id;render();});E.balls.appendChild(r);});
  var d=E.dt;
  if(sel){var s=CAT[sel];d.innerHTML='<div class="dt-ic">'+ic(s)+'</div><div class="dt-nm">'+esc(s.ten)+'</div><div class="dt-mt">'+esc(LOAI[s.loai]||'')+(s.cap?' · Cấp '+s.cap:'')+' · Số lượng: '+count(sel)+'</div><div class="dt-ds">'+esc(s.mo||'')+'</div>';}
  else d.innerHTML='<div class="dt-hint">Chạm một ô để xem thông tin</div>';
}
function open(){if(!root)build();isOpen=true;openAt=performance.now();root.classList.add('on');unit();render();}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');}

/* ===== ICON NÚT BALO (SVG vẽ tay: balo xanh đêm, viền vàng, khóa tinh thể ngọc) ===== */
var ICON='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="blB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d5ae6"/><stop offset="1" stop-color="#2b2a8c"/></linearGradient><linearGradient id="blF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8f7cff"/><stop offset="1" stop-color="#5242cf"/></linearGradient><linearGradient id="blG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b8"/><stop offset=".5" stop-color="#e6b13a"/><stop offset="1" stop-color="#a8701a"/></linearGradient><linearGradient id="blT" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9fff7"/><stop offset=".55" stop-color="#2fd1c5"/><stop offset="1" stop-color="#0b7f93"/></linearGradient></defs><path d="M25 14C25 5 39 5 39 14" fill="none" stroke="url(#blG)" stroke-width="3" stroke-linecap="round"/><path d="M9.5 38C6.5 41 6.5 49 10 52L14 52 14 37Z" fill="#232478" stroke="url(#blG)" stroke-width="1.4" stroke-linejoin="round"/><path d="M54.5 38C57.5 41 57.5 49 54 52L50 52 50 37Z" fill="#232478" stroke="url(#blG)" stroke-width="1.4" stroke-linejoin="round"/><path d="M14 27C14 18 21 12.5 32 12.5S50 18 50 27L51 52C51 57.5 47 60.5 42 60.5L22 60.5C17 60.5 13 57.5 13 52Z" fill="url(#blB)" stroke="url(#blG)" stroke-width="2" stroke-linejoin="round"/><path d="M14.6 27C14.6 18.6 21.4 13.2 32 13.2S49.4 18.6 49.4 27L49.4 33.5Q32 46 14.6 33.5Z" fill="url(#blF)" stroke="url(#blG)" stroke-width="1.6" stroke-linejoin="round"/><g fill="none" stroke="#ffe08a" stroke-opacity=".5" stroke-width=".9" stroke-linecap="round"><path d="M18 24q2.5 3 5 0M23 24q2.5 3 5 0M36 24q2.5 3 5 0M41 24q2.5 3 5 0M20.5 29q2.5 3 5 0M38.5 29q2.5 3 5 0M25.5 20.5q2.5 3 5 0M33.5 20.5q2.5 3 5 0"/></g><path d="M20 47.5H44V54.5Q44 58 40.5 58H23.5Q20 58 20 54.5Z" fill="#26268a" stroke="url(#blG)" stroke-width="1.3" stroke-linejoin="round"/><path d="M32 47.5V58" stroke="#e6b13a" stroke-opacity=".6" stroke-width=".9"/><circle cx="32" cy="52.7" r="1.7" fill="url(#blG)"/><path d="M32 30.5L38.4 38.8 32 47.2 25.6 38.8Z" fill="url(#blT)" stroke="url(#blG)" stroke-width="1.4" stroke-linejoin="round"/><path d="M32 33.2L35 38.8 32 38.8Z" fill="#fff" fill-opacity=".75"/><path d="M50.5 7.5L51.7 11 55.2 12.2 51.7 13.4 50.5 17 49.3 13.4 45.8 12.2 49.3 11Z" fill="#c9fff7"/><path d="M12.5 8.5L13.3 10.7 15.5 11.5 13.3 12.3 12.5 14.5 11.7 12.3 9.5 11.5 11.7 10.7Z" fill="#fff3b8"/></svg>';
TTGNV.add({id:'balo',ten:'Balo',icon:ICON,onTap:open});
window.TTGBALO={open:open,close:close,add:add,count:count,reg:reg,CAT:CAT};
})();
