/* 52-nut-vuong.js - NÚT VUÔNG (khung game-moi/khung-nut.webp) xếp lưới ở KHUNG DƯỚI của game-moi.
   Mỗi nút: khung vàng + icon SVG ở giữa + chữ nhỏ bên dưới icon. Nút là DOM nằm trên canvas (z-index 6, trên #ui).
   DÙNG:  TTGNV.add({id:'balo', ten:'Balo', icon:'<svg ...>', onTap:function(){...}});
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
  frame:'game-moi/khung-nut.webp'
};
var list=[],M=null;
var st=document.createElement('style');
st.textContent=[
'.nv{position:fixed;left:0;top:0;z-index:6;display:none;margin:0;padding:0;border:0;background:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;transition:transform .08s ease}',
'.nv:focus{outline:none}',
'.nv:active{transform:scale(.92)}',
'.nv .nv-bg{position:absolute;left:17%;right:17%;top:16%;bottom:16%;border-radius:12%;background:radial-gradient(ellipse at 50% 28%,#3b3a9c 0%,#1f1d5c 58%,#12123a 100%)}',
'.nv .nv-ic{position:absolute;left:20%;right:20%;top:17%;height:47%;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 .1em rgba(255,214,120,.55))}',
'.nv .nv-ic svg,.nv .nv-ic img{width:100%;height:100%;display:block;object-fit:contain}',
'.nv .nv-tx{position:absolute;left:12%;right:12%;top:63%;height:19%;display:flex;align-items:center;justify-content:center;font-weight:700;letter-spacing:.03em;line-height:1;white-space:nowrap;color:#ffe9a0;text-shadow:0 0 .14em #000,.07em 0 0 #000,-.07em 0 0 #000,0 .07em 0 #000,0 -.07em 0 #000}',
'.nv .nv-fr{position:absolute;left:0;top:0;width:100%;height:100%;background:url('+CFG.frame+') 0 0/100% 100% no-repeat;pointer-events:none}'
].join('\n');
document.head.appendChild(st);

function add(o){
  var e=document.createElement('button');e.type='button';e.className='nv';e.setAttribute('data-id',o.id);e.setAttribute('aria-label',o.ten||o.id);
  e.innerHTML='<i class="nv-bg"></i><i class="nv-ic">'+(o.icon||'')+'</i><span class="nv-tx"></span><i class="nv-fr"></i>';
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
  list.forEach(function(it,i){
    var c,r;if(CFG.fill==='row'){r=Math.floor(i/6);c=i%6;}else{c=Math.floor(i/rows);r=i%rows;}
    var e=it.e,s2=e.style;
    s2.display='block';s2.width=s+'px';s2.height=s+'px';s2.left=Math.round(x0+c*(s+g))+'px';s2.top=Math.round(y0+r*(s+g))+'px';
    s2.fontSize=(s*.17).toFixed(2)+'px';
  });}
window.TTGNV={cfg:CFG,add:add,layout:layout};
})();
