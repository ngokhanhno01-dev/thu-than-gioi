/* 109-nhiem-vu.js - BẢNG NHIỆM VỤ (nút "Nhiệm vụ" ở thanh nút, 81-nut-moi.js gọi TTGNHIEMVU.open).
   BƯỚC 1 (28/11/2026): ĐƯA KHUNG VÀO GAME + RƯƠNG ĐIỂM HOẠT ĐỘNG. CHƯA có danh sách nhiệm vụ (5 hàng trong khung đang trống), chưa có tab Tuần.
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
var SW=1281,SH=1164,V='?v=1',IMG='game-moi/khung-nhiem-vu.webp'+V;
var CFG={
  key:'ttg_moi_nhiemvu',
  moc:[25,50,75,100],
  thuong:[null,null,null,null]   /* thuong[i]=function(i){...} chạy khi nhận rương i (0..3); sau này nối phần thưởng thật */
};
var BOX={
  close:{x:1137,y:58,w:104,h:104},
  tabNgay:{x:296,y:168,w:333,h:75},
  tabTuan:{x:652,y:168,w:334,h:75},
  ruong:[{cx:394},{cx:626},{cx:864},{cx:1099}],   /* tâm x từng rương (khớp mốc 25/50/75/100 vẽ sẵn) */
  ruongY:{y:925,h:170,w:120},                     /* vùng chạm: từ đỉnh rương xuống hết ô số mốc */
  stamp:{cy:974,w:142,h:48},                      /* chữ Đã nhận đè lên thân rương */
  bar:{x:283,y:1016,h:14,xs:[283,394,626,864,1099]}  /* thanh điểm: đầu thanh rồi tới tâm 4 rương (chạy từng đoạn) */
};
var root,fr,E={},isOpen=false,openAt=0,S={diem:0,nhan:[0,0,0,0]};

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
'.nv-tab:active{background:rgba(255,200,80,.14);border-radius:calc(var(--u)*18)}',
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
try{(new Image()).src=IMG;}catch(e){}

function pct(v,t){return (v/t*100)+'%';}
function box(c,b){var s=c.style;s.left=pct(b.x,SW);s.top=pct(b.y,SH);s.width=pct(b.w,SW);s.height=pct(b.h,SH);return c;}
function mk(tag,cls,b){var c=document.createElement(tag);c.className=cls;if(b)box(c,b);fr.appendChild(c);return c;}
function unit(){if(fr)fr.style.setProperty('--u',(fr.clientWidth/SW)+'px');}

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
  E.tn=mk('button','nv-tab',BOX.tabNgay);E.tn.type='button';E.tn.setAttribute('aria-label','Nhiệm vụ ngày');
  E.tt=mk('button','nv-tab',BOX.tabTuan);E.tt.type='button';E.tt.setAttribute('aria-label','Nhiệm vụ tuần');
  E.tt.addEventListener('click',function(){toast('Nhiệm vụ tuần: sắp ra mắt');});
  E.x=mk('button','nv-x',BOX.close);E.x.type='button';E.x.setAttribute('aria-label','Đóng');
  document.body.appendChild(root);
  E.x.addEventListener('click',close);
  root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
  document.addEventListener('keydown',function(e){if(isOpen&&e.key==='Escape')close();});
  window.addEventListener('resize',unit);
}
function open(){
  if(!root){load();build();}
  openAt=performance.now();isOpen=true;root.classList.add('on');unit();render();
}
function close(){if(!root)return;isOpen=false;root.classList.remove('on');}

window.TTGNHIEMVU={
  open:open,close:close,isOpen:function(){return isOpen;},
  diem:function(){return S.diem;},
  setDiem:function(n){if(!root)load();S.diem=Math.max(0,Math.min(100,+n||0));save();render();return S.diem;},
  congDiem:function(n){return window.TTGNHIEMVU.setDiem(S.diem+(+n||0));},
  daNhan:function(i){return !!S.nhan[i];},
  reset:function(){S={diem:0,nhan:[0,0,0,0]};save();render();}
};
})();
