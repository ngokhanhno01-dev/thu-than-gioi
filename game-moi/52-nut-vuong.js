/* 52-nut-vuong.js - NÚT VUÔNG (khung game-moi/khung-nut.webp) xếp lưới ở KHUNG DƯỚI của game-moi.
   Mỗi nút: khung vàng-xanh đêm (khung-nut.webp, ô giữa trong suốt) + quầng sáng + icon SVG sáng có phát sáng + chữ sáng bên dưới icon. Nút là DOM nằm trên canvas (z-index 6, trên #ui).
   DÙNG:  TTGNV.add({id:'balo', ten:'Balo', icon:'<svg ...>', onTap:function(){...}, r:0});
   r (tùy chọn) = hàng muốn đứng (0 = hàng trên, 1 = hàng dưới); các nút cùng r xếp ngang cạnh nhau. Không có r thì xếp theo CFG.fill.
   Nút xếp theo CỘT (trên -> dưới rồi sang cột kế): nút 1 ở hàng trên cùng bên trái, nút 2 ngay dưới nó, nút 3 sang cột bên cạnh...
   Chỉnh to/nhỏ, khe, số hàng, chỗ chừa họa tiết góc: sửa CFG bên dưới (đơn vị game, giống BP = 70 của khung dưới trong index.html).
   index.html gọi TTGNV.layout(...) mỗi lần đổi cỡ màn hình (hàm resize) để đặt lại vị trí. */
(function(){
'use strict';
var CFG={
  size:29,    /* cạnh nút. 2 hàng: 2*size + gap phải nhỏ hơn BP (70) trừ viền khung */
  gap:2,      /* khe giữa các nút */
  rows:2,     /* số hàng trong khung dưới */
  left:34,    /* chừa bên trái cho họa tiết góc khung dưới */
  fill:'col', /* 'col' = xếp theo cột (nút 2 nằm dưới nút 1) | 'row' = xếp theo hàng */
  frame:'game-moi/khung-nut.webp?v=2'
};
var list=[],M=null;
var st=document.createElement('style');
st.textContent=[
'.nv{position:fixed;left:0;top:0;z-index:6;display:none;margin:0;padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;transition:transform .08s ease}',
'.nv:focus{outline:none}',
'.nv:active{transform:scale(.92)}',
'.nv .nv-bg{position:absolute;left:21%;right:21%;top:21%;bottom:21%;border-radius:10%;background:radial-gradient(ellipse at 50% 42%,rgba(86,92,230,.55) 0%,rgba(40,44,140,.35) 55%,rgba(14,16,60,0) 100%)}',
'.nv .nv-gl{position:absolute;left:14%;right:14%;top:12%;height:56%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(255,226,130,.5) 0%,rgba(255,190,80,.2) 45%,rgba(255,190,80,0) 72%);animation:nvg 2.4s ease-in-out infinite;pointer-events:none}',
'@keyframes nvg{0%,100%{opacity:.55;transform:scale(.92)}50%{opacity:1;transform:scale(1.06)}}',
'.nv .nv-ic{position:absolute;left:17%;right:17%;top:12%;height:48%;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 .08em #fff6c8) drop-shadow(0 0 .22em rgba(255,200,80,.95)) drop-shadow(0 0 .45em rgba(90,200,255,.7))}',
'.nv .nv-ic svg,.nv .nv-ic img{width:100%;height:100%;display:block;object-fit:contain}',
'.nv .nv-tx{position:absolute;left:3%;right:3%;top:60%;height:19%;display:flex;align-items:center;justify-content:center;font-weight:800;letter-spacing:.02em;line-height:1;white-space:nowrap;color:#fffbe0;text-shadow:0 0 .1em #fff2a8,0 0 .28em #ffb830,0 0 .5em rgba(255,170,40,.85),.06em 0 0 #3a1a00,-.06em 0 0 #3a1a00,0 .06em 0 #3a1a00,0 -.06em 0 #3a1a00}',
'.nv .nv-fr{position:absolute;left:0;top:0;width:100%;height:100%;background:url('+CFG.frame+') 0 0/100% 100% no-repeat;pointer-events:none}'
].join('\n');
document.head.appendChild(st);

function add(o){
  var e=document.createElement('button');e.type='button';e.className='nv';e.setAttribute('data-id',o.id);e.setAttribute('aria-label',o.ten||o.id);
  e.innerHTML='<i class="nv-bg"></i><i class="nv-gl"></i><i class="nv-ic">'+(o.icon||'')+'</i><i class="nv-fr"></i><span class="nv-tx"></span>';
  e.querySelector('.nv-tx').textContent=o.ten||'';
  e.addEventListener('click',function(){if(o.onTap)o.onTap(e);});
  document.body.appendChild(e);list.push({o:o,e:e});
  if(M)layout(M);
  return e;}
/* m = {K,DPR,W,H,I,th,BP,GAPB} do index.html truyền vào. Đổi đơn vị game -> px CSS: nhân K/DPR. */
function layout(m){
  M=m||M;if(!M)return;
  var f=M.K/M.DPR,s=CFG.size*f,g=CFG.gap*f,x0=(M.I.l+CFG.left)*f,pt=(M.th+M.GAPB)*f,rows=Math.max(1,CFG.rows),
      blk=rows*s+(rows-1)*g,y0=pt+Math.max(0,(M.BP*f-blk)/2);
  var used={},pos=[];
  /* lượt 1: nút có chỉ định hàng (o.r: 0 = hàng trên, 1 = hàng dưới) -> đứng ở ô trống đầu tiên của hàng đó, nên Balo và Thú Thần nằm CÙNG HÀNG */
  list.forEach(function(it,i){if(it.o.r==null)return;var r=Math.min(Math.max(0,it.o.r|0),rows-1),c=0;while(used[c+','+r])c++;used[c+','+r]=1;pos[i]=[c,r];});
  /* lượt 2: nút không chỉ định hàng -> xếp vào ô trống đầu tiên theo kiểu CFG.fill */
  list.forEach(function(it,i){if(pos[i])return;var n=0,c,r;
    for(;;n++){if(CFG.fill==='row'){r=Math.floor(n/6);c=n%6;}else{c=Math.floor(n/rows);r=n%rows;}if(!used[c+','+r])break;}
    used[c+','+r]=1;pos[i]=[c,r];});
  list.forEach(function(it,i){
    var c=pos[i][0],r=pos[i][1],e=it.e,s2=e.style;
    s2.display='block';s2.width=s+'px';s2.height=s+'px';s2.left=Math.round(x0+c*(s+g))+'px';s2.top=Math.round(y0+r*(s+g))+'px';
    s2.fontSize=(s*.17).toFixed(2)+'px';
  });}
window.TTGNV={cfg:CFG,add:add,layout:layout};
})();
