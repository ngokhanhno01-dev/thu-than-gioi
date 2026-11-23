/* 52-nut-vuong.js - NÚT VUÔNG (khung game-moi/khung-nut.webp) xếp lưới ở KHUNG DƯỚI của game-moi.
   Mỗi nút: khung vàng-xanh đêm (khung-nut.webp, ô giữa trong suốt) + quầng sáng + icon SVG sáng có phát sáng + chữ sáng bên dưới icon. Nút là DOM nằm trên canvas (z-index 6, trên #ui).
   DÙNG:  TTGNV.add({id:'balo', ten:'Balo', icon:'<svg ...>', onTap:function(){...}, r:0});
   r (tùy chọn) = hàng muốn đứng (0 = hàng trên, 1 = hàng dưới); các nút cùng r xếp ngang cạnh nhau. Không có r thì xếp theo CFG.fill.
   rc (tùy chọn) = đặt nút theo cột tính từ MÉP PHẢI của khung dưới (0 = ngoài cùng bên phải, 1 = sát bên trong nó...), dùng cùng r để chọn hàng; nút có rc không chiếm ô lưới bên trái.
   Nút xếp theo CỘT (trên -> dưới rồi sang cột kế): nút 1 ở hàng trên cùng bên trái, nút 2 ngay dưới nó, nút 3 sang cột bên cạnh...
   Chỉnh to/nhỏ, khe, số hàng, chỗ chừa họa tiết góc: sửa CFG bên dưới (đơn vị game, giống BP = 88 của khung dưới trong index.html).
   index.html gọi TTGNV.layout(...) mỗi lần đổi cỡ màn hình (hàm resize) để đặt lại vị trí. */
(function(){
'use strict';
var CFG={
  size:43,    /* cạnh nút. 2 hàng: 2*size + gap phải nhỏ hơn BP (86 trong index.html) trừ viền khung (~9) */
  gap:2,      /* khe giữa các nút */
  rows:2,     /* số hàng trong khung dưới */
  dy:-1.5,   /* dịch cả khối nút lên (-) / xuống (+) cho cân với ô trong khung (viền trên mỏng hơn viền dưới) */
  left:42,    /* chừa bên trái cho họa tiết góc khung dưới */
  fill:'col', /* 'col' = xếp theo cột (nút 2 nằm dưới nút 1) | 'row' = xếp theo hàng */
  frame:'game-moi/khung-nut.webp?v=2',
  khung:false,   /* false = nút vuông KHÔNG có khung/nền (chỉ icon + chữ; sau này thay bằng ảnh icon riêng qua o.image). true = khung vàng-xanh đêm như cũ. Chỉ nút dài (Thám hiểm, Chọn vùng) luôn dùng ảnh riêng có khung. */
  art:{'balo':'game-moi/icon/balo.webp','thu-than':'game-moi/icon/thu-than.webp','trang-bi':'game-moi/icon/trang-bi.webp','ren':'game-moi/icon/ren.webp','cuong-hoa':'game-moi/icon/cuong-hoa.webp','dau-truong':'game-moi/icon/dau-truong.webp','boss-the-gioi':'game-moi/icon/boss-the-gioi.webp','pho-ban':'game-moi/icon/pho-ban.webp','thap-thi-luyen':'game-moi/icon/thap-thi-luyen.webp','cua-hang':'game-moi/icon/cua-hang.webp','diem-danh':'game-moi/icon/diem-danh.webp','nhiem-vu':'game-moi/icon/nhiem-vu.webp','do-giam':'game-moi/icon/do-giam.webp'},   /* id nút -> ảnh icon đã tách nền (có chữ tên nằm sẵn trong ảnh). Thêm icon mới: bỏ ảnh vào game-moi/icon/ rồi thêm 1 dòng ở đây. Nút có o.image thì dùng ảnh của nó. */
  ten:{'balo':'Túi Trữ Vật','thu-than':'Linh Thú','trang-bi':'Pháp Bảo','ren':'Luyện Khí'},   /* tên hiển thị mới (aria-label); chữ trên icon do ảnh tự mang */
  heroH:90,   /* cao nút lớn giữa thanh (icon Thám hiểm) theo đơn vị game; ô trong khung dưới cao khoảng 81 (từ pixel đo được) */
  heroCy:47.6, /* tâm dọc ô trong khung dưới, tính từ mép trên khung dưới (đã đo: cách đều viền vàng trên và dưới) */
  /* BỐ CỤC 20 Ô: nút Thám hiểm (hero) nằm GIỮA, 2 bên mỗi bên 6 cột x 2 hàng = 24 ô (đang dùng 5 bên trái). Bên TRÁI = nút thường (tự xếp theo cột); bên PHẢI = đặt rc (cột tính từ mép phải) + r (hàng): vd TTGNV.add({id:'dau-truong',image:'...',rc:0,r:0}). */
  /* BẢNG BỐ CỤC (nơi DUY NHẤT chỉnh vị trí nút): id -> ['l'|'r', cột, hàng]. 'l' = đếm cột từ mép TRÁI khung dưới, 'r' = đếm từ mép PHẢI (0 = ngoài cùng); hàng 0 = trên, 1 = dưới. Ô trống để dành nằm sát nút Thám hiểm ở giữa nên thêm nút mới chỉ cần thêm 1 dòng vào đây (cột kế tiếp). Nút không có trong bảng thì xếp tự động như cũ (o.r / o.rc). */
  bo:{
    'thu-than':['l',0,0],'trang-bi':['l',1,0],'ren':['l',2,0],
    'balo':['l',0,1],'do-giam':['l',1,1],'cuong-hoa':['l',2,1],
    'boss-the-gioi':['r',0,0],'thap-thi-luyen':['r',1,0],
    'cua-hang':['r',0,1],'diem-danh':['r',1,1],'nhiem-vu':['r',2,1]
  },
  dev:['nhan-chau','doi-rank','lay-sach','lay-do-th','admin','nl-test']   /* nút TEST/ADMIN: không đặt ra thanh nút, gom vào menu ẩn (chạm chữ "Danh Vọng", xem 80-danh-vong.js). Thêm id vào đây hoặc đặt o.dev:true cho nút test mới. */
};
var list=[],M=null,devList=[];
var st=document.createElement('style');
st.textContent=[
'.nv{position:fixed;left:0;top:0;z-index:6;display:none;margin:0;padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;transition:transform .08s ease}',
'.nv:focus{outline:none}',
'.nv .nv-bg{position:absolute;left:21%;right:21%;top:21%;bottom:21%;border-radius:10%;background:radial-gradient(ellipse at 50% 42%,rgba(86,92,230,.55) 0%,rgba(40,44,140,.35) 55%,rgba(14,16,60,0) 100%)}',
'.nv .nv-gl{position:absolute;left:14%;right:14%;top:12%;height:56%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(255,226,130,.5) 0%,rgba(255,190,80,.2) 45%,rgba(255,190,80,0) 72%);animation:nvg 2.4s ease-in-out infinite;pointer-events:none}',
'@keyframes nvg{0%,100%{opacity:.55;transform:scale(.92)}50%{opacity:1;transform:scale(1.06)}}',
'.nv .nv-ic{position:absolute;left:17%;right:17%;top:12%;height:48%;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 .08em #fff6c8) drop-shadow(0 0 .22em rgba(255,200,80,.95)) drop-shadow(0 0 .45em rgba(90,200,255,.7))}',
'.nv .nv-ic svg,.nv .nv-ic img{width:100%;height:100%;display:block;object-fit:contain}',
'.nv .nv-tx{position:absolute;left:3%;right:3%;top:60%;height:19%;display:flex;align-items:center;justify-content:center;font-weight:800;letter-spacing:.02em;line-height:1;white-space:nowrap;color:#fffbe0;text-shadow:0 0 .1em #fff2a8,0 0 .28em #ffb830,0 0 .5em rgba(255,170,40,.85),.06em 0 0 #3a1a00,-.06em 0 0 #3a1a00,0 .06em 0 #3a1a00,0 -.06em 0 #3a1a00}',
'.nv .nv-fr{position:absolute;left:0;top:0;width:100%;height:100%;background:url('+CFG.frame+') 0 0/100% 100% no-repeat;pointer-events:none}',
'.nv.nv-nf .nv-ic{left:6%;right:6%;top:2%;height:64%}',
'.nv.nv-nf .nv-tx{left:0;right:0;top:68%;height:24%}',
  '.nv.nv-img .nv-art{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;-webkit-user-drag:none;user-select:none}'
].join('\n');
document.head.appendChild(st);

function add(o){
  if(o.dev||CFG.dev.indexOf(o.id)>=0){var d=document.createElement('button');d.type='button';d.setAttribute('data-id',o.id);devList.push({o:o,e:d});return d;}   /* nút test: không lên thanh nút, vào menu ẩn */
  if(!o.image&&CFG.art[o.id])o.image=CFG.art[o.id]+'?v=1';
  if(CFG.ten[o.id])o.ten=CFG.ten[o.id];
  var e=document.createElement('button');e.type='button';e.className='nv'+(o.hero?' nv-hero':'');e.setAttribute('data-id',o.id);e.setAttribute('aria-label',o.ten||o.id);
  if(o.image){e.className+=' nv-img';var im=document.createElement('img');im.className='nv-art';im.src=o.image;im.alt='';im.draggable=false;e.appendChild(im);}
  else{if(!CFG.khung)e.className+=' nv-nf';e.innerHTML=(CFG.khung?'<i class="nv-bg"></i>':'')+'<i class="nv-gl"></i><i class="nv-ic">'+(o.icon||'')+'</i>'+(CFG.khung?'<i class="nv-fr"></i>':'')+'<span class="nv-tx"></span>';e.querySelector('.nv-tx').textContent=o.ten||'';}
  e.addEventListener('click',function(ev){if(o.onTap)o.onTap(e,ev);});
  document.body.appendChild(e);list.push({o:o,e:e});
  if(M)layout(M);
  return e;}
/* m = {K,DPR,W,H,I,th,BP,GAPB} do index.html truyền vào. Đổi đơn vị game -> px CSS: nhân K/DPR. */
function layout(m){
  M=m||M;if(!M)return;
  var f=M.K/M.DPR,s=CFG.size*f,g=CFG.gap*f,x0=(M.I.l+CFG.left)*f,pt=(M.th+M.GAPB)*f,rows=Math.max(1,CFG.rows),
      blk=rows*s+(rows-1)*g,y0=pt+Math.max(0,(M.BP*f-blk)/2)+(CFG.dy||0)*f;
  var used={},pos=[],centered={},rcol={};
  function dim(o){return o.hero?[CFG.heroH*(o.ratio||1.0922),CFG.heroH]:[o.w>0?o.w:CFG.size,o.h>0?o.h:CFG.size];}
  /* lượt 1: nút có chỉ định hàng (o.r: 0 = hàng trên, 1 = hàng dưới); nút center chiếm các ô lưới giao với ảnh để nút thêm sau không đè lên. */
  /* lượt 0: nút có trong bảng bố cục CFG.bo -> đặt đúng ô chỉ định ('l' = cột từ mép trái, 'r' = cột từ mép phải) */
  list.forEach(function(it,i){var b=CFG.bo&&CFG.bo[it.o.id];if(!b||it.o.center)return;var r=Math.min(Math.max(0,b[2]|0),rows-1),c=Math.max(0,b[1]|0);
    if(b[0]==='r'){rcol[i]=c;pos[i]=[0,r];}else{used[c+','+r]=1;pos[i]=[c,r];}});
  list.forEach(function(it,i){
    if(pos[i]||it.o.beside)return;
    if(it.o.center){var r=Math.min(Math.max(0,it.o.r==null?0:it.o.r|0),rows-1),w=dim(it.o)[0],step=CFG.size+CFG.gap,base=M.I.l+CFG.left,left=M.I.l+(M.W-M.I.l-M.I.r)/2-w/2,first=Math.max(0,Math.floor((left-base)/step)),last=Math.max(first,Math.ceil((left+w-base)/step)-1);for(var cc=first;cc<=last;cc++){if(it.o.hero){for(var rr=0;rr<rows;rr++)used[cc+','+rr]=1;}else used[cc+','+r]=1;}pos[i]=[first,r];centered[i]=1;return;}
    if(it.o.rc!=null){rcol[i]=Math.max(0,it.o.rc|0);pos[i]=[0,Math.min(Math.max(0,it.o.r==null?0:it.o.r|0),rows-1)];return;}   /* đặt theo mép phải: không chiếm ô lưới trái */
    if(it.o.r==null)return;var r=Math.min(Math.max(0,it.o.r|0),rows-1),c=0;while(used[c+','+r])c++;used[c+','+r]=1;pos[i]=[c,r];});
  /* lượt 2: nút không chỉ định hàng -> xếp vào ô trống đầu tiên theo kiểu CFG.fill */
  list.forEach(function(it,i){if(pos[i]||it.o.beside)return;var n=0,c,r;
    for(;;n++){if(CFG.fill==='row'){r=Math.floor(n/6);c=n%6;}else{c=Math.floor(n/rows);r=n%rows;}if(!used[c+','+r])break;}
    used[c+','+r]=1;pos[i]=[c,r];});
  list.forEach(function(it,i){
    if(it.o.beside){var hh=null;list.forEach(function(x){if(x.o.hero)hh=x;});var hw=(hh?dim(hh.o)[0]:CFG.heroH)*f,cx=(M.I.l+(M.W-M.I.l-M.I.r)/2)*f,d2=dim(it.o),w2=d2[0]*f,h2=d2[1]*f,gp=(it.o.gap==null?3:it.o.gap)*f,s3=it.e.style;
      s3.display='block';s3.width=w2+'px';s3.height=h2+'px';s3.left=Math.round(it.o.beside==='l'?cx-hw/2-gp-w2:cx+hw/2+gp)+'px';s3.top=Math.round(pt+CFG.heroCy*f-h2/2)+'px';s3.fontSize=(s*.17).toFixed(2)+'px';return;}
    var c=pos[i][0],r=pos[i][1],e=it.e,s2=e.style,dm=dim(it.o),iw=dm[0]*f,ih=dm[1]*f;
    s2.display='block';s2.width=iw+'px';s2.height=ih+'px';s2.left=Math.round(rcol[i]!=null?(M.W-M.I.r-CFG.left)*f-(rcol[i]+1)*s-rcol[i]*g:centered[i]?(M.I.l+(M.W-M.I.l-M.I.r)/2)*f-iw/2:x0+c*(s+g))+'px';s2.top=Math.round(it.o.hero?pt+(CFG.heroCy-dm[1]/2)*f:y0+r*(s+g)+(s-ih)/2+(it.o.offsetY||0)*f)+'px';
    s2.fontSize=(s*.17).toFixed(2)+'px';
  });}
window.TTGNV={cfg:CFG,add:add,layout:layout,dev:devList,m:function(){return M;}};
})();
