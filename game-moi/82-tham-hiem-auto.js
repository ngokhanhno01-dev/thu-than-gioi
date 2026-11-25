/* ===== 82-tham-hiem-auto.js (TTGTX): THÁM HIỂM TỰ ĐỘNG (VÒNG LẶP) =====
   LUỒNG: bấm Thám hiểm -> màn BẢN ĐỒ tìm kiếm (CFG.tim = 8,5 giây, thú chibi nhảy lóc cóc + bong bóng biểu cảm)
          -> bảng "Phát hiện mục tiêu" (CFG.bao = 3 giây, chạm màn hình là đóng ngay) -> vào TRẬN
          -> THẮNG (hoặc bắt thú xong / thú hoang bỏ chạy) tự quay lại BẢN ĐỒ, lặp tiếp.
          Bấm nút "Dừng" (hoặc phím Esc) => dừng vòng lặp, về màn hình chính. THUA / HÒA: mặc định vẫn lặp tiếp (CFG.tiepKhiThua=true); đặt false thì thua là dừng.
   NỐI VỚI index.html (chỉ 4 chỗ nhỏ, tìm "TTGTX" trong index.html):
     - TTGTHAMHIEM.prep()   = chọn thú ra trận + tung địch cho vùng đang chọn (không vào trận), trả {player,ps,enemy,tag} hoặc null.
     - TTGTHAMHIEM.battle(pre) = vào trận với địch đã tung (startExplore). Trả true nếu vào được.
     - Hết trận THẮNG gọi TTGTX.next(); THUA/HÒA gọi TTGTX.stop().  host.end (bắt thú xong/bỏ chạy) gọi TTGTX.next().
   BẢN ĐỒ THEO VÙNG: bảng MAP_VUNG bên dưới (khóa = slug vùng trong 51-thu-moi.js). Vùng chưa có ảnh: để null + dòng TODO, tạm dùng bg-<slug>.webp, không có thì bg-khoi-dau.webp.
   DỌN DẸP: mọi setTimeout / animation / rAF / listener đều ghi vào S và được hủy trong cleanup() (gọi khi bấm Dừng, khi vào trận, khi bắt đầu chu kỳ mới).
   Chỉnh nhịp: CFG (tim, bao, cỡ thú, thời gian mỗi bước nhảy). Chỉnh vùng thú đi lại: hàm pt() (tỉ lệ theo màn hình). */
(function(root){
'use strict';
var D=document,DIR='game-moi/';
/* ---------- CẤU HÌNH BẢN ĐỒ THÁM HIỂM CHO 18 VÙNG ---------- */
var MAP_VUNG={
  /* 9 vùng đã có ảnh bản đồ thám hiểm riêng */
  'tuyet-nguyen':DIR+'map-tham-hiem-tuyet-nguyen.webp',
  'suong-coc':DIR+'map-tham-hiem-suong-coc.webp',
  'van-dao':DIR+'map-tham-hiem-van-dao.webp',
  'phong-nguyen':DIR+'map-tham-hiem-phong-nguyen.webp',
  'loi-vuc':DIR+'map-tham-hiem-loi-vuc.webp',
  'nguyet-cung':DIR+'map-tham-hiem-nguyet-cung.webp',
  'thuy-nguyet-canh':DIR+'map-tham-hiem-thuy-nguyet-canh.webp',
  'xich-hoa-dia':DIR+'map-tham-hiem-xich-hoa-dia.webp',
  'thanh-lam':DIR+'map-tham-hiem-thanh-lam.webp',
  /* 9 vùng còn lại (đang "Sắp ra mắt"): CHƯA có tên/slug thật, tạm đặt vung-10..vung-18. Khi mở vùng: đổi khóa thành slug thật (trùng slug trong 51-thu-moi.js) và điền đường dẫn ảnh. */
  'vung-10':null, // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-10.webp) - Bổ sung khi mở vùng
  'vung-11':null, // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-11.webp) - Bổ sung khi mở vùng
  'vung-12':null, // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-12.webp) - Bổ sung khi mở vùng
  'vung-13':null, // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-13.webp) - Bổ sung khi mở vùng
  'vung-14':null, // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-14.webp) - Bổ sung khi mở vùng
  'vung-15':null, // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-15.webp) - Bổ sung khi mở vùng
  'vung-16':null, // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-16.webp) - Bổ sung khi mở vùng
  'vung-17':null, // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-17.webp) - Bổ sung khi mở vùng
  'vung-18':null  // TODO: Chưa có ảnh bản đồ thám hiểm (map-tham-hiem-vung-18.webp) - Bổ sung khi mở vùng
};
var BG_DU_PHONG=DIR+'bg-khoi-dau.webp',V='?v=1';
var CFG={tiepKhiThua:true,tim:8500,bao:3000,size:[64,80],hop:400,peekTiLe:.6};
/* thứ tự thử ảnh: bản đồ riêng -> bg-<slug>.webp -> bg-khoi-dau.webp */
function mapChain(slug){var a=[],m=MAP_VUNG[slug];if(m)a.push(m+V);if(slug)a.push(DIR+'bg-'+slug+'.webp');a.push(BG_DU_PHONG);return a;}

var S={on:false,npcId:null,ov:null,timers:[],anims:[],phase:'',pre:null,tok:0,cur:{x:0,y:0},face:1,sz:72,sprTry:0,bub:'',onKey:null};
var EMO_TIM=['❓','🧐'],EMO_LUC=['💦','💢','😵‍💫'],EMO_VUI=['🤩','✨😆✨'];

function H(){return root.TTGTHAMHIEM||{};}
function rnd(a,b){return a+Math.random()*(b-a);}
function pick(a,not){var r,n=0;do{r=a[Math.floor(Math.random()*a.length)];}while(r===not&&++n<9);return r;}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function T(fn,ms){var id=setTimeout(function(){var i=S.timers.indexOf(id);if(i>=0)S.timers.splice(i,1);fn();},ms);S.timers.push(id);return id;}
function A(el,kf,opt){if(!el||!el.animate)return null;var a=el.animate(kf,opt);S.anims.push(a);return a;}

/* ---------- vùng đang chọn ---------- */
function zoneInfo(){
  var zs=(root.THU_MOI&&root.THU_MOI.zones)||[],z=root.TTGDV&&root.TTGDV.vung?root.TTGDV.vung():0,i;
  for(i=0;i<zs.length;i++)if(zs[i].z===z)return {slug:zs[i].slug,ten:zs[i].ten};
  return zs[0]?{slug:zs[0].slug,ten:zs[0].ten}:{slug:'',ten:'?'};}

/* ---------- CSS (nạp 1 lần) ---------- */
function css(){
  if(D.getElementById('tx-css'))return;
  var s=D.createElement('style');s.id='tx-css';
  s.textContent=[
'#tx-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:50;overflow:hidden;background:#05070f;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent;font-family:"Palatino Linotype","Book Antiqua",Georgia,"Times New Roman",serif}',
'#tx-ov .tx-bg{position:absolute;left:0;top:0;right:0;bottom:0;background:#0b1020 50% 50%/cover no-repeat;opacity:0;transition:opacity .35s}',
'#tx-ov .tx-vig{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.5),rgba(0,0,0,0) 24%),radial-gradient(ellipse at center,rgba(0,0,0,0) 62%,rgba(0,0,0,.38))}',
'#tx-ov .tx-fxl{position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none}',
'#tx-ov .tx-rip{position:absolute;border-radius:50%;border:2px solid rgba(255,255,255,.75);background:rgba(255,255,255,.12);pointer-events:none}',
'#tx-ov .tx-puff{position:absolute;pointer-events:none;line-height:1;transform:translate(-50%,-50%)}',
'#tx-ov .tx-pet{position:absolute;left:0;top:0;will-change:transform;pointer-events:none}',
'#tx-ov .tx-sh{position:absolute;left:19%;bottom:-3%;width:62%;height:13%;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,.5),rgba(0,0,0,0) 72%)}',
'#tx-ov .tx-spr{position:absolute;left:0;top:0;width:100%;height:100%;transform-origin:50% 100%}',
'#tx-ov .tx-spr canvas{display:block}',
'#tx-ov .tx-bw{position:absolute;left:50%;bottom:100%;margin-bottom:3px;transform:translateX(-50%);pointer-events:none}',
'#tx-ov .tx-bub{position:relative;display:none;padding:.12em .42em .16em;background:#fff8e1;border:2px solid #d9b878;border-radius:.6em;font-size:calc(var(--sz)*.38);line-height:1.15;white-space:nowrap;box-shadow:0 2px 5px rgba(0,0,0,.4);transform-origin:50% 100%}',
'#tx-ov .tx-bub:after{content:"";position:absolute;left:50%;bottom:-.34em;margin-left:-.26em;border:.26em solid transparent;border-top-color:#d9b878;border-bottom:0}',
'#tx-ov .tx-bub:before{content:"";position:absolute;left:50%;bottom:-.24em;margin-left:-.2em;border:.2em solid transparent;border-top-color:#fff8e1;border-bottom:0;z-index:2}',
'#tx-ov .tx-bar{position:absolute;left:50%;top:calc(env(safe-area-inset-top,0px) + 8px);transform:translateX(-50%);display:flex;align-items:center;gap:.6em;max-width:94vw;box-sizing:border-box;padding:.35em .45em .35em .9em;border-radius:999px;font-size:clamp(12px,3.9vh,18px);font-weight:800;color:#ffe9a8;background:linear-gradient(180deg,rgba(58,34,8,.94),rgba(22,12,4,.94));border:2px solid #e2b75a;box-shadow:0 3px 12px rgba(0,0,0,.65),inset 0 0 10px rgba(255,214,120,.28),0 0 14px rgba(255,190,80,.35)}',
'#tx-ov .tx-lens{display:inline-block;font-size:1.35em;line-height:1;transform-origin:60% 60%;animation:tx-lens 1s ease-in-out infinite alternate}',
'@keyframes tx-lens{0%{transform:translate(-.28em,.05em) rotate(-16deg)}50%{transform:translate(0,-.12em) rotate(2deg)}100%{transform:translate(.28em,.05em) rotate(16deg)}}',
'#tx-ov .tx-txt{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 0 6px rgba(255,170,40,.6),1px 1px 0 #3a1a00,-1px 1px 0 #3a1a00}',
'#tx-ov .tx-stop{flex:none;cursor:pointer;font:inherit;font-size:.92em;color:#fff;padding:.28em .9em;border-radius:999px;border:2px solid #ffb4a8;background:linear-gradient(180deg,#e0523f,#a82a1d);text-shadow:1px 1px 0 #5a0f08;box-shadow:0 2px 0 #5a0f08;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'#tx-ov .tx-stop:active{transform:translateY(2px);box-shadow:none}',
'#tx-ov .tx-resw{position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;pointer-events:none;background:rgba(2,4,18,.28)}',
'#tx-ov .tx-res{position:relative;flex:none;background:0 0/100% 100% no-repeat;filter:drop-shadow(0 0 calc(var(--u)*24) rgba(60,140,255,.55));animation:tx-pop .5s cubic-bezier(.2,1.5,.4,1) both}',
'@keyframes tx-pop{0%{opacity:0;transform:scale(.25)}55%{opacity:1;transform:scale(1.12)}78%{transform:scale(.96)}100%{opacity:1;transform:scale(1)}}',
'#tx-ov .tx-rb{position:absolute;left:8.96%;top:32.9%;width:82%;height:56%;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;gap:calc(var(--u)*34);padding:0 calc(var(--u)*30);box-sizing:border-box;overflow:hidden;font-weight:800;line-height:1.2;text-shadow:0 0 calc(var(--u)*8) #02061c,calc(var(--u)*3) calc(var(--u)*3) 0 #02061c,calc(var(--u)*-3) calc(var(--u)*3) 0 #02061c}',
'#tx-ov .tx-ic{flex:none;width:calc(var(--u)*300);height:calc(var(--u)*300);display:flex;align-items:center;justify-content:center;box-sizing:border-box;border:calc(var(--u)*6) solid #d9a93c;border-radius:calc(var(--u)*24);background:linear-gradient(160deg,rgba(40,60,160,.75),rgba(8,12,60,.9));box-shadow:inset 0 0 calc(var(--u)*30) rgba(110,170,255,.45),0 0 calc(var(--u)*18) rgba(255,210,100,.35)}',
'#tx-ov canvas{position:static!important;left:auto!important;top:auto!important;max-width:100%;max-height:100%;image-rendering:auto!important}',/* canvas toàn game bị ép position:fixed + pixelated trong index.html => phải ghi đè, kẻo hình bị phóng to ra cả màn hình */
'#tx-ov .tx-ic canvas{display:block}',
'#tx-ov .tx-tx{flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*6);text-align:left}',
'#tx-ov .tx-rt{font-size:calc(var(--u)*46);color:#9ff5a8}',
'#tx-ov .tx-rn{font-size:calc(var(--u)*72);color:#fff3c4;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'#tx-ov .tx-rn b{display:inline-block;margin-left:.3em;padding:0 .3em;font-size:.6em;vertical-align:.12em;color:#fff7b0;border:calc(var(--u)*4) solid #ffb800;border-radius:calc(var(--u)*14);background:rgba(120,70,0,.55)}',
'#tx-ov .tx-ri{font-size:calc(var(--u)*40);color:#cfe3ff;font-weight:700}',
'#tx-ov .tx-rk{font-size:calc(var(--u)*36);color:#ffd27a;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'body.tx-on .tbo.tst{align-items:flex-end;padding-top:0;padding-bottom:3vh}'/* thông báo thắng trận hiện ở đáy màn hình để không che thanh trạng thái */
  ].join('\n');
  D.head.appendChild(s);}

/* ---------- dọn dẹp ---------- */
function cleanup(){
  var i;S.tok++;
  for(i=0;i<S.timers.length;i++)clearTimeout(S.timers[i]);S.timers=[];
  for(i=0;i<S.anims.length;i++){try{S.anims[i].cancel();}catch(e){}}S.anims=[];
  if(S.onKey){D.removeEventListener('keydown',S.onKey,true);S.onKey=null;}
  if(S.ov){try{S.ov.remove();}catch(e){if(S.ov.parentNode)S.ov.parentNode.removeChild(S.ov);}}
  S.ov=null;S.phase='';S.bub='';
  if(D.body)D.body.classList.remove('tx-on');}
function stop(){S.on=false;cleanup();}

/* ---------- dựng màn bản đồ ---------- */
function build(zi){
  css();cleanup();
  var tok=S.tok,ov=D.createElement('div');ov.id='tx-ov';
  ov.innerHTML='<div class="tx-bg"></div><div class="tx-vig"></div><div class="tx-fxl"></div>'
   +'<div class="tx-pet"><div class="tx-sh"></div><div class="tx-spr"><canvas></canvas></div><div class="tx-bw"><div class="tx-bub"></div></div></div>'
   +'<div class="tx-bar"><span class="tx-lens">🔍</span><span class="tx-txt">Đang thám hiểm '+esc(zi.ten)+'...</span><button type="button" class="tx-stop">Dừng</button></div>';
  D.body.appendChild(ov);D.body.classList.add('tx-on');
  S.ov=ov;S.phase='map';S.bub='';
  S.bg=ov.querySelector('.tx-bg');S.fxl=ov.querySelector('.tx-fxl');S.pet=ov.querySelector('.tx-pet');S.sh=ov.querySelector('.tx-sh');
  S.spr=ov.querySelector('.tx-spr');S.cv=ov.querySelector('canvas');S.bw=ov.querySelector('.tx-bw');S.bubEl=ov.querySelector('.tx-bub');
  var h=ov.clientHeight||innerHeight;
  S.sz=Math.max(CFG.size[0],Math.min(CFG.size[1],Math.round(h*.2)));
  S.pet.style.width=S.pet.style.height=S.sz+'px';S.pet.style.setProperty('--sz',S.sz+'px');
  S.spr.style.opacity=1;S.face=1;S.spr.style.transform='scale(1,1)';S.cur={x:-999,y:-999};S.pet.style.transform='translate(-999px,-999px)';
  /* nút Dừng: hủy tất cả ngay */
  var sb=ov.querySelector('.tx-stop');
  sb.addEventListener('pointerdown',function(e){e.stopPropagation();});
  sb.addEventListener('click',function(e){e.stopPropagation();e.preventDefault();stop();});
  /* chạm vào màn hình: đóng bảng kết quả ngay (chỉ có tác dụng khi bảng đang hiện) */
  ov.addEventListener('click',function(){if(S.phase==='popup')enter();});
  S.onKey=function(e){if(e.key==='Escape'){e.stopPropagation();stop();}};D.addEventListener('keydown',S.onKey,true);
  /* ảnh bản đồ: thử lần lượt bản đồ riêng -> bg vùng -> bg-khoi-dau */
  var chain=mapChain(zi.slug),k=0;
  (function tryNext(){if(tok!==S.tok||k>=chain.length)return;var src=chain[k++],im=new Image();
    im.onload=function(){if(tok!==S.tok)return;S.bg.style.backgroundImage='url("'+src+'")';S.bg.style.opacity=1;};
    im.onerror=function(){tryNext();};im.src=src;})();
  /* sprite thú đang ra trận */
  S.sprTry=0;paintSprite();}

function paintSprite(){
  if(!S.ov||!S.pre)return;var tok=S.tok,p=S.pre.player,sz=S.sz,cv=S.cv,dpr=Math.min(3,root.devicePixelRatio||1),c,ok=false;
  cv.width=cv.height=Math.round(sz*dpr);cv.style.width=cv.style.height=sz+'px';
  c=cv.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,sz,sz);
  try{if(root.THU_MOI){if(THU_MOI.setFrame)THU_MOI.setFrame(192);ok=THU_MOI.draw(c,p.id,Math.max(1,Math.min(3,(p.tien|0)||1)),sz/2,sz,sz,true);}}catch(e){}
  if(!ok&&++S.sprTry<30)T(function(){if(tok===S.tok)paintSprite();},120);}   /* ảnh chưa nạp xong thì thử lại (tối đa ~3,6s) */

/* ---------- vị trí / chuyển động ---------- */
function vp(){return {w:S.ov.clientWidth||innerWidth,h:S.ov.clientHeight||innerHeight};}
function tr(x,y){return 'translate('+(x-S.sz/2)+'px,'+(y-S.sz)+'px)';}
function setPos(x,y){S.cur.x=x;S.cur.y=y;S.pet.style.transform=tr(x,y);}
function setFace(f){S.face=f;S.spr.style.transform='scale('+f+',1)';}
function pt(){var v=vp();return {x:rnd(.14,.86)*v.w,y:rnd(.44,.86)*v.h};}   /* chân thú: chừa thanh trạng thái phía trên và mép dưới */
function clampPt(x,y){var v=vp();return {x:Math.max(.1*v.w,Math.min(.9*v.w,x)),y:Math.max(.42*v.h,Math.min(.88*v.h,y))};}
function ripple(x,y){if(!S.ov)return;var e=D.createElement('div'),w=S.sz*.9,h=S.sz*.28;e.className='tx-rip';e.style.cssText='left:'+(x-w/2)+'px;top:'+(y-h/2)+'px;width:'+w+'px;height:'+h+'px';S.fxl.appendChild(e);
  var a=A(e,[{transform:'scale(.3)',opacity:.9},{transform:'scale(1.7)',opacity:0}],{duration:520,easing:'ease-out',fill:'forwards'});
  if(a)a.onfinish=function(){try{e.remove();}catch(x){}};else T(function(){try{e.remove();}catch(x){}},520);}
function puff(x,y){if(!S.ov)return;var e=D.createElement('div');e.className='tx-puff';e.textContent='💨';e.style.cssText='left:'+x+'px;top:'+y+'px;font-size:'+Math.round(S.sz*.55)+'px';S.fxl.appendChild(e);
  var a=A(e,[{transform:'translate(-50%,-50%) scale(.4)',opacity:.95},{transform:'translate(-50%,-90%) scale(1.5)',opacity:0}],{duration:560,easing:'ease-out',fill:'forwards'});
  if(a)a.onfinish=function(){try{e.remove();}catch(x){}};else T(function(){try{e.remove();}catch(x){}},560);}

/* bong bóng biểu cảm */
function bub(txt){if(!S.ov)return;S.bub=txt;var b=S.bubEl;b.textContent=txt;b.style.display='block';A(b,[{transform:'scale(.3)',opacity:0},{transform:'scale(1.22)',opacity:1,offset:.55},{transform:'scale(.94)',offset:.8},{transform:'scale(1)',opacity:1}],{duration:340,easing:'ease-out'});}
function bubHide(){if(S.bubEl)S.bubEl.style.display='none';}
function bubSide(side){S.bw.style.left=side==='l'?'78%':side==='r'?'22%':'50%';}

/* một bước NHẢY (hop): nảy lên xuống + nghiêng + lật hướng, tiếp đất có squash + vòng sóng */
function hop(x1,y1,h,dur,tilt){
  var x0=S.cur.x;if(Math.abs(x1-x0)>2)setFace(x1<x0?-1:1);
  var f=S.face,y0=S.cur.y;
  A(S.pet,[{transform:tr(x0,y0)},{transform:tr(x1,y1)}],{duration:dur,easing:'linear'});
  S.cur.x=x1;S.cur.y=y1;S.pet.style.transform=tr(x1,y1);
  A(S.spr,[
    {transform:'translateY(0) rotate(0deg) scale('+f+',1)',easing:'cubic-bezier(.2,.75,.4,1)'},
    {transform:'translateY('+(-h)+'px) rotate('+tilt+'deg) scale('+(f*.94)+',1.07)',offset:.46,easing:'cubic-bezier(.55,0,.85,.4)'},
    {transform:'translateY(0) rotate(0deg) scale('+(f*1.13)+',.86)',offset:.88},
    {transform:'translateY(0) rotate(0deg) scale('+f+',1)'}],{duration:dur});
  A(S.sh,[{transform:'scale(1)',opacity:1},{transform:'scale(.66)',opacity:.45,offset:.46},{transform:'scale(1.08)',opacity:1,offset:.88},{transform:'scale(1)',opacity:1}],{duration:dur});
  T(function(){ripple(x1,y1);},Math.round(dur*.88));}
/* n bước nhảy ngắn liên tiếp tới (x1,y1) */
function hopTo(x1,y1,n,dur,t0){
  var x0=S.cur.x,y0=S.cur.y,i;
  for(i=1;i<=n;i++)(function(i){T(function(){hop(x0+(x1-x0)*i/n,y0+(y1-y0)*i/n,S.sz*.34,dur,i%2?-9:9);},t0+(i-1)*dur);})(i);}
/* THOẮT ẨN THOẮT HIỆN: thu nhỏ + khói 💨 rồi bật nảy ở chỗ mới (x1,y1) */
function dash(x1,y1,faceTo){
  var f=S.face,x0=S.cur.x,y0=S.cur.y,sz=S.sz,out,tok=S.tok;
  bubHide();puff(x0,y0-sz*.4);
  out=A(S.spr,[{transform:'scale('+f+',1)',opacity:1},{transform:'scale('+(f*1.15)+',.85)',opacity:1,offset:.3},{transform:'scale('+(f*.08)+',.08)',opacity:0}],{duration:210,easing:'ease-in',fill:'forwards'});
  A(S.sh,[{opacity:1},{opacity:0}],{duration:210,fill:'forwards'});
  T(function(){if(tok!==S.tok)return;
    var nf=faceTo||(x1<x0?-1:1);setPos(x1,y1);setFace(nf);S.spr.style.opacity=1;puff(x1,y1-sz*.4);
    A(S.spr,[{transform:'scale('+(nf*.08)+',.08)',opacity:0},{transform:'scale('+(nf*1.3)+',.78)',opacity:1,offset:.42},{transform:'scale('+(nf*.92)+',1.12)',opacity:1,offset:.72},{transform:'scale('+nf+',1)',opacity:1}],{duration:400,easing:'ease-out'});
    A(S.sh,[{opacity:0,transform:'scale(.4)'},{opacity:1,transform:'scale(1)'}],{duration:400});
    if(out)try{out.cancel();}catch(e){}
    T(function(){ripple(x1,y1);},300);},230);}
/* THÒ ĐẦU NGÓ NGHIÊNG: lấp ló từ mép (l/r/b) rồi nghiêng đầu 2 bên; trả thời gian đã dùng */
function peek(side){
  var v=vp(),sz=S.sz,hid,pk,y=rnd(.5,.78)*v.h;
  if(side==='l'){hid={x:-sz*.62,y:y};pk={x:sz*.04,y:y};setFace(1);}
  else if(side==='r'){hid={x:v.w+sz*.62,y:y};pk={x:v.w-sz*.04,y:y};setFace(-1);}
  else{var x=rnd(.3,.7)*v.w;hid={x:x,y:v.h+sz*1.1};pk={x:x,y:v.h+sz*.52};setFace(Math.random()<.5?-1:1);}
  bubSide(side);setPos(hid.x,hid.y);
  var f=S.face;
  T(function(){A(S.pet,[{transform:tr(hid.x,hid.y)},{transform:tr(pk.x,pk.y)}],{duration:260,easing:'ease-out'});setPos(pk.x,pk.y);bub(pick(EMO_TIM));},40);
  T(function(){A(S.spr,[{transform:'rotate(0deg) scale('+f+',1)'},{transform:'rotate(-15deg) scale('+f+',1)',offset:.25},{transform:'rotate(15deg) scale('+f+',1)',offset:.75},{transform:'rotate(0deg) scale('+f+',1)'}],{duration:760,easing:'ease-in-out'});},320);
  return 1080;}

/* ---------- KỊCH BẢN (CFG.tim = 8,5 giây; đổi CFG.tim thì chỉnh lại các mốc trong script) ---------- */
function script(){
  var tok=S.tok,sz=S.sz,P0=pt(),h=CFG.hop,mode=Math.random()<CFG.peekTiLe?'peek':'pop',tHop;
  /* 0 - 1,5s: tò mò dò tìm (❓/🧐) */
  if(mode==='peek'){
    var side=pick(['l','r','b']),used=peek(side);            /* thò đầu ngó nghiêng ~1,1s */
    T(function(){bubSide('c');hop(P0.x,P0.y,sz*.62,400,side==='l'?-10:10);},used);   /* rồi bật nhảy ra */
  }else{
    S.spr.style.opacity=0;
    T(function(){dash(P0.x,P0.y,Math.random()<.5?-1:1);T(function(){bub(pick(EMO_TIM));},330);},0);
    T(function(){var f=S.face;A(S.spr,[{transform:'rotate(0deg) scale('+f+',1)'},{transform:'rotate(-9deg) scale('+f+',1)',offset:.3},{transform:'rotate(9deg) scale('+f+',1)',offset:.7},{transform:'rotate(0deg) scale('+f+',1)'}],{duration:620,easing:'ease-in-out'});},560);
    T(function(){setFace(-S.face);},980);   /* ngó sang hướng kia */
  }
  /* tìm kiếm kéo dài: 2 lượt "đổi chỗ xa (pop/dash) + nhảy lóc cóc tìm" với biểu cảm 💦/💢/😵‍💫, càng lúc càng sốt ruột */
  function leg(t0,n,emo1){
    T(function(){
      var best=null,i,c,d,bd=-1;for(i=0;i<8;i++){c=pt();d=Math.abs(c.x-S.cur.x)+Math.abs(c.y-S.cur.y)*.5;if(d>bd){bd=d;best=c;}}
      dash(best.x,best.y);
      T(function(){bub(emo1);},360);
    },t0);
    T(function(){
      var v=vp(),ang=rnd(0,Math.PI*2),step=v.w*.07,c=clampPt(S.cur.x+Math.cos(ang)*step*n,S.cur.y+Math.sin(ang)*step*n*.4);
      hopTo(c.x,c.y,n,h,0);
    },t0+650);
    T(function(){bub(pick(EMO_LUC,S.bub));},t0+650+Math.round(n*h*.55));   /* biểu cảm thứ hai giữa đường nhảy (khác cái trước) */
  }
  T(function(){bub(pick(EMO_TIM,S.bub));},1500);   /* vẫn đang tò mò, đổi sang biểu cảm kia */
  leg(1900,3,pick(EMO_LUC));
  leg(4300,4,pick(EMO_LUC));
  T(function(){var f=S.face;bub('💦');A(S.spr,[{transform:'rotate(0deg) scale('+f+',1)'},{transform:'rotate(-10deg) scale('+f+',1)',offset:.25},{transform:'rotate(10deg) scale('+f+',1)',offset:.55},{transform:'rotate(-6deg) scale('+f+',1)',offset:.8},{transform:'rotate(0deg) scale('+f+',1)'}],{duration:900,easing:'ease-in-out'});},6500);   /* nghỉ thở dốc một nhịp trước khi thấy mục tiêu */
  /* phát hiện mục tiêu: ❗ rồi 🤩 / ✨😆✨, nhảy cẫng tại chỗ */
  T(function(){
    bub('❗');
    var i;for(i=0;i<3;i++)(function(i){T(function(){hop(S.cur.x,S.cur.y,sz*.6,420,i%2?7:-7);},i*430);})(i);
  },7000);
  T(function(){bub(pick(EMO_VUI));},7750);
  /* hết giờ: bảng kết quả */
  T(showResult,CFG.tim);}

/* ---------- bảng kết quả ---------- */
function showResult(){
  if(!S.ov||S.phase!=='map')return;
  if(S.npcId){gapNpc();return;}   /* lượt này gặp NPC thay cho bảng "Phát hiện mục tiêu" */
  S.phase='popup';
  var e=(S.pre&&S.pre.enemy)||{},tag=(S.pre&&S.pre.tag)||'',IW=2121,IH=724,v=vp(),w=Math.round(Math.min(v.w*.92,560,v.h*.82*IW/IH)),
      ico=e.boss?'👑':(e.source==='main'?'👹':'🐾'),wr=D.createElement('div'),r=D.createElement('div');
  wr.className='tx-resw';r.className='tx-res';r.style.width=w+'px';r.style.height=Math.round(w*IH/IW)+'px';r.style.setProperty('--u',(w/IW)+'px');
  r.style.backgroundImage='url("'+DIR+'khung-tb-0.webp?v=1")';
  var kn=null,k0=null;try{if(e.boss&&e.kn&&e.kn[0]&&root.TTGCS&&TTGCS.sachKyNang)k0=TTGCS.sachKyNang(e.kn[0]);}catch(x){}
  if(k0){var he=(root.TTGCS&&TTGCS.heVi?TTGCS.heVi(k0.he):k0.he);kn='⚔ Kỹ năng: '+k0.ten+' · '+Math.round(k0.hsTc*100)+'% sát thương '+he+' · hồi '+k0.cd+' lượt';}   /* chỉ boss thú hoang mới có kỹ năng (đọc từ sách của boss) */
  r.innerHTML='<div class="tx-rb"><div class="tx-ic"><canvas></canvas></div><div class="tx-tx"><div class="tx-rt">Phát hiện mục tiêu!</div><div class="tx-rn">'+ico+' '+esc(e.ten||'?')+(e.source==='demo'?'<b>V'+esc(e.tien||1)+'</b>':'')+'</div><div class="tx-ri">'+esc(tag)+(e.hienBac?' · Rank '+esc(e.bac):'')+' · Lv.'+esc(e.lv)+'</div>'+(kn?'<div class="tx-rk">'+esc(kn)+'</div>':'')+'</div></div>';
  wr.appendChild(r);S.ov.appendChild(wr);paintEnemy(r.querySelector('canvas'),e,w);
  T(enter,CFG.bao);}   /* tự đóng sau 3 giây (chạm màn hình = đóng ngay, xem listener click trong build) */

/* khung bao quanh phần có hình (alpha > 16) của ảnh; lỗi (ảnh khác nguồn...) thì lấy cả ảnh */
function bbox(src,sw,sh){
  try{var k=Math.min(1,256/Math.max(sw,sh)),cw=Math.max(1,Math.round(sw*k)),ch=Math.max(1,Math.round(sh*k)),cc=D.createElement('canvas');cc.width=cw;cc.height=ch;
    var x=cc.getContext('2d');x.drawImage(src,0,0,cw,ch);var d=x.getImageData(0,0,cw,ch).data,x0=cw,y0=ch,x1=-1,y1=-1,i,j;
    for(j=0;j<ch;j++)for(i=0;i<cw;i++)if(d[(j*cw+i)*4+3]>16){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j;}
    if(x1>=x0&&y1>=y0)return {x:x0/k,y:y0/k,w:(x1-x0+1)/k,h:(y1-y0+1)/k};}catch(e){}
  return {x:0,y:0,w:sw,h:sh};}
/* hình địch trong bảng kết quả: thú hoang vẽ bằng THU_MOI (ảnh 192), quái vùng nguồn main dùng ảnh game-moi/quai/<imageFile> */
function paintEnemy(cv,e,w){
  if(!cv)return;var tok=S.tok,sz=Math.round(w*300/2121*.9),dpr=Math.min(3,root.devicePixelRatio||1),c=cv.getContext('2d'),n=0,im=null;
  cv.width=cv.height=Math.max(8,Math.round(sz*dpr));
  cv.style.width=cv.style.height=sz+'px';
  function draw(){
    if(tok!==S.tok)return;var ok=false;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,sz,sz);
    try{
      /* VỪA KHUNG: vẽ ảnh gốc ra canvas phụ, đo vùng có hình (bỏ phần trong suốt) rồi phóng/thu vùng đó cho vừa ô, canh giữa -> thú nhỏ, vừa, lớn đều to bằng nhau trong khung */
      var src=null,sw=0,sh=0;
      if(e.source==='demo'&&root.THU_MOI){if(THU_MOI.setFrame)THU_MOI.setFrame(192);var oc=D.createElement('canvas');oc.width=oc.height=192;var o2=oc.getContext('2d');
        if(THU_MOI.draw(o2,e.id,Math.max(1,Math.min(3,(e.tien|0)||1)),96,192,192,true)){src=oc;sw=sh=192;}}
      else if(im&&im.complete&&im.naturalWidth){src=im;sw=im.naturalWidth;sh=im.naturalHeight;}
      if(src){
        var bb=bbox(src,sw,sh),box=sz*.9,f=Math.min(box/bb.w,box/bb.h),dw=bb.w*f,dh=bb.h*f;
        c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
        c.drawImage(src,bb.x,bb.y,bb.w,bb.h,(sz-dw)/2,(sz-dh)/2,dw,dh);ok=true;}
    }catch(x){}
    if(!ok&&++n<30)T(draw,120);}
  if(e.source!=='demo'){var fl=e.record&&e.record.imageFile;if(fl){im=new Image();im.onload=function(){draw();};im.src=DIR+'quai/'+fl;}}
  draw();}

/* ---------- gặp NPC (87-npc.js): thay cho bảng "Phát hiện mục tiêu" + trận ----------
   Hiện cửa sổ NPC. [Rời đi] / hết 30 giây => chạy tiếp vòng lặp (next). Khiêu chiến (NPC Boss) => đóng với lý do 'khieu-chien' rồi gọi vaoTran(pre) bên dưới. */
function gapNpc(){
  var id=S.npcId,tok=S.tok,ok=false;S.npcId=null;S.phase='npc';
  try{ok=!!(root.TTGNPC&&TTGNPC.mo(id,{onClose:function(ly){
    if(ly==='khieu-chien'||ly==='thay')return;          /* đang vào trận / đang đổi NPC: không chạy tiếp ở đây */
    if(tok!==S.tok||!S.on)return;                        /* đã bấm Dừng (Esc) hoặc đã sang chu kỳ khác */
    next();}}));}catch(e){ok=false;}
  if(!ok){S.phase='popup';enter();}}                     /* không mở được NPC thì vào trận thường như cũ */
/* vào trận với địch dựng sẵn (pre) từ NPC; trả true nếu vào được */
function vaoTran(pre){
  if(!S.on||!pre)return false;
  cleanup();var ok=false;try{ok=!!(H().battle&&H().battle(pre));}catch(e){ok=false;}
  if(!ok)S.on=false;return ok;}

/* ---------- vào trận ---------- */
function enter(){
  if(S.phase!=='popup')return;
  var pre=S.pre;cleanup();                 /* dọn sạch timer/animation TRƯỚC khi đổi cảnh */
  var ok=false;try{ok=!!(H().battle&&H().battle(pre));}catch(e){ok=false;}
  if(!ok)S.on=false;}

/* ---------- vòng lặp ---------- */
function cycle(){
  var h=H();if(!h.prep||!h.battle){S.on=false;return;}
  var pre=h.prep();if(!pre){stop();return;}   /* prep tự báo lý do (chưa chọn thú, không có quái...) */
  S.pre=pre;S.on=true;S.npcId=(root.TTGNPC&&TTGNPC.tungGap)?TTGNPC.tungGap():null;   /* bước tung NPC (tỉ lệ + ?npc=...) chen TRƯỚC khi vào trận; 95% còn lại giữ nguyên tỉ lệ thú/quái/boss cũ */
  build(zoneInfo());script();}
function begin(){if(S.ov)return;warm();cycle();}
function next(){if(!S.on)return;cycle();}
function active(){return S.on;}

function warm(){try{var l=mapChain(zoneInfo().slug);if(l[0]){var im=new Image();im.src=l[0];S.warm=im;}}catch(e){}}   /* tải ngầm bản đồ vùng đang chọn */
root.TTGTX={warm:warm,begin:begin,next:next,stop:stop,active:active,vaoTran:vaoTran,CFG:CFG,MAP_VUNG:MAP_VUNG,mapChain:mapChain};
})(typeof window!=='undefined'?window:globalThis);
