/* 72-khung-ren-cuong-hoa.js - 2 khung CƯỜNG HÓA và RÈN (mở từ 2 nút ở 71-nut-trang-bi.js).
   Ảnh: game-moi/khung-cuong-hoa.webp (1671x941), game-moi/khung-ren.webp (1672x941). Ảnh gốc PNG: game-moi/khung-goc/.
   Các ô mẫu màu hồng trong ảnh gốc đã được tô nền xanh đậm; ở đây đặt sẵn nút bấm trong suốt đúng vị trí từng ô.
   TIẾN ĐỘ: KHUNG + đóng (nút X / bấm ra ngoài / Esc) + ô đã có vị trí. CHƯA có logic Đập / Rèn (bấm nút: báo "Sắp có").
   Toạ độ tính theo PIXEL ẢNH. API: TTGKH.open('ch'|'ren') / .close() / .isOpen() / .slots(loai) -> [{el,k}] để gắn đồ vào ô. */
(function(){
'use strict';
var D={
 ch:{img:'game-moi/khung-cuong-hoa.webp?v=1',w:1671,h:941,x:{x:1530,y:68,s:116},
  btn:{x:140,y:716,w:400,h:110,t:'Đập'},
  sl:{
   main:[[278,233,149,136]],
   ring:[[129,446,92,92],[475,446,93,92],[297,561,109,104]],
   bag:(function(){var a=[],X=[1099,1219,1338,1456],Y=[239,345,449,552,656];Y.forEach(function(y){X.forEach(function(x){a.push([x,y,96,84]);});});return a;})()}},
 ren:{img:'game-moi/khung-ren.webp?v=1',w:1672,h:941,x:{x:1525,y:105,s:110},
  btn:{x:130,y:745,w:410,h:105,t:'Rèn'},
  sl:{
   top:[[306,255,76,75]],
   main:[[279,428,132,121]],
   side:[[113,557,78,77],[493,557,79,77]],
   set:(function(){var a=[],Y=[255,383,511,632];Y.forEach(function(y){a.push([673,y,128,94],[872,y,126,94]);});return a;})(),
   bag:(function(){var a=[],X=[1101,1220,1337,1456],Y=[283,400,517,636];Y.forEach(function(y){X.forEach(function(x){a.push([x,y,93,93]);});});return a;})()}}
};
var P={},cur=null,openAt=0;
function toast(t){if(window.TTGTBAO&&TTGTBAO.toast){TTGTBAO.toast(t,1800);return;}if(window.toast)window.toast(t);}
function build(k){
 var d=D[k],root=document.createElement('div');root.className='kh';
 var fr=document.createElement('div');fr.className='kh-fr';fr.style.aspectRatio=d.w+'/'+d.h;fr.style.width='min(98vw,calc(96vh*'+d.w+'/'+d.h+'))';fr.style.backgroundImage='url('+d.img+')';
 function box(c,x,y,w,h){var s=c.style;s.left=(x/d.w*100)+'%';s.top=(y/d.h*100)+'%';s.width=(w/d.w*100)+'%';s.height=(h/d.h*100)+'%';fr.appendChild(c);return c;}
 var slots={};
 Object.keys(d.sl).forEach(function(g){slots[g]=d.sl[g].map(function(r,i){var c=document.createElement('button');c.type='button';c.className='kh-c';c.setAttribute('data-g',g);c.setAttribute('data-k',i);box(c,r[0]-4,r[1]-4,r[2]+8,r[3]+8);return {el:c,k:i};});});
 var b=document.createElement('button');b.type='button';b.className='kh-b';b.setAttribute('aria-label',d.btn.t);box(b,d.btn.x,d.btn.y,d.btn.w,d.btn.h);b.addEventListener('click',function(){toast(d.btn.t+': sắp có');});
 var x=document.createElement('button');x.type='button';x.className='kh-x';x.setAttribute('aria-label','Đóng');box(x,d.x.x,d.x.y,d.x.s,d.x.s);x.addEventListener('click',close);
 root.appendChild(fr);
 root.addEventListener('click',function(e){if(e.target===root&&performance.now()-openAt>400)close();});
 document.body.appendChild(root);
 P[k]={root:root,slots:slots};
}
function css(){
 var s=document.createElement('style');
 s.textContent='.kh{position:fixed;left:0;top:0;right:0;bottom:0;z-index:63;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74)}'+
 '.kh.on{display:flex}.kh-fr{position:relative;background-size:100% 100%;background-repeat:no-repeat;max-width:1672px}'+
 '.kh-fr>*{position:absolute;box-sizing:border-box}.kh button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent;padding:0;border:0;background:transparent;cursor:pointer}'+
 '.kh-x{border-radius:50%}.kh-b{border-radius:14px}.kh-c{border-radius:8px}';
 document.head.appendChild(s);
}
function open(k){if(!D[k])return;if(cur)close();if(!document.querySelector('style[data-kh]')){css();document.head.lastChild.setAttribute('data-kh','1');}
 if(!P[k])build(k);cur=k;openAt=performance.now();P[k].root.classList.add('on');}
function close(){if(!cur)return;P[cur].root.classList.remove('on');cur=null;}
document.addEventListener('keydown',function(e){if(cur&&e.key==='Escape'){e.stopImmediatePropagation();close();}},true);
window.TTGKH={open:open,close:close,isOpen:function(){return !!cur;},slots:function(k){return P[k]?P[k].slots:null;}};
})();
