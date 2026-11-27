/* ===== 82-tham-hiem-auto.js (TTGTX): THÁM HIỂM TỰ ĐỘNG (VÒNG LẶP) =====
   LUỒNG: bấm Thám hiểm -> màn BẢN ĐỒ tìm kiếm (CFG.tim = 8,5 giây, thú chibi nhảy lóc cóc + bong bóng biểu cảm)
          -> bảng "Phát hiện mục tiêu" (CFG.bao = 3 giây, chạm màn hình là đóng ngay) -> vào TRẬN
          -> THẮNG (hoặc bắt thú xong / thú hoang bỏ chạy) tự quay lại BẢN ĐỒ, lặp tiếp.
          Bấm nút "Quay lại" (hoặc phím Esc) => dừng vòng lặp, về màn hình chính. THUA / HÒA: mặc định vẫn lặp tiếp (CFG.tiepKhiThua=true); đặt false thì thua là dừng.
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
var BG_DU_PHONG=DIR+'bg-khoi-dau.webp',V='?v=3';
var CFG={tiepKhiThua:true};
/* thứ tự thử ảnh: bản đồ riêng -> bg-<slug>.webp -> bg-khoi-dau.webp */
function mapChain(slug){var a=[],m=MAP_VUNG[slug];if(m)a.push(m+V);if(slug)a.push(DIR+'bg-'+slug+'.webp');a.push(BG_DU_PHONG);return a;}

var S={on:false,npcId:null,ov:null,timers:[],anims:[],phase:'',pre:null,ev:null,tok:0,cur:{x:0,y:0},face:1,sz:72,sprTry:0,bub:'',onKey:null};
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
function stop(){
  S.on=false;S.pre=null;S.ev=null;
  try{if(root.TTGMAP)root.TTGMAP.close();}catch(e){}
  cleanup();
}

/* ---------- mở bản đồ thám hiểm ---------- */
function build(zi){
  if(!root.TTGMAP||typeof root.TTGMAP.open!=='function'){S.on=false;return false;}
  S.on=true;S.phase='map';S.pre=null;S.ev=null;
  var ok=false;
  try{ok=!!root.TTGMAP.open({
    vung:zi.slug,
    onTouch:function(ev){
      if(!S.on||!ev)return;
      S.ev=ev;
      if(!root.TTGMAP||!root.TTGMAP.pause)return;
      root.TTGMAP.pause();
      var pre=null,btg=null,B=root.TTGBTG;
      if(ev.loai==='than'){   /* boss Thần: xin vào đánh (1 vs 1, bị khóa / có người đang đánh thì không vào được) */
        btg=B&&B.vaoDanh?B.vaoDanh(B.uid()):null;
        if(!btg||!btg.ok){
          try{if(root.TTGTBAO&&root.TTGTBAO.toast)root.TTGTBAO.toast((btg&&btg.loi)||'Chưa khiêu chiến được boss Thần',2600);}catch(e){}
          try{root.TTGMAP.resume({});}catch(e){}S.ev=null;return;}}
      try{pre=root.TTGMAP.tungDich(ev);}catch(e){pre=null;}
      if(!pre){if(btg){try{B.huy(B.uid());}catch(e){}}try{root.TTGMAP.resume({});}catch(e){}S.ev=null;return;}
      if(btg&&pre.enemy)pre.enemy.btg={moc:btg.mocChay,hp:btg.hp,uid:B.uid(),maLan:btg.maLan};   /* index.html đọc: máu bắt đầu = hp toàn cục, mốc bỏ chạy */
      S.pre=pre;
      root.TTGTX.vaoTran(pre);
    },
    onStop:function(){stop();}
  });}catch(e){ok=false;}
  if(!ok){S.on=false;S.phase='';}
  return ok;
}

/* TTGMAP tự điều khiển di chuyển và phát hiện điểm; không còn vòng tìm giả 8,5 giây/AFK. */
function script(){return !!(root.TTGMAP&&root.TTGMAP.active&&root.TTGMAP.active());}

/* vào trận với địch dựng sẵn từ TTGMAP; không hủy phiên bản đồ */
function vaoTran(pre){
  if(!S.on||!pre)return false;
  var ok=false;
  try{ok=!!(H().battle&&H().battle(pre));}catch(e){ok=false;}
  if(!ok){
    if(pre.enemy&&pre.enemy.btg){try{root.TTGBTG.huy(pre.enemy.btg.uid);}catch(e){}}   /* không vào được trận: nhả boss Thần, không phạt */
    S.pre=null;S.ev=null;
    try{if(root.TTGMAP)root.TTGMAP.resume({});}catch(e){}
  }
  return ok;
}

/* ---------- vòng lặp ---------- */
function cycle(){if(!S.on)build(zoneInfo());else if(root.TTGMAP&&root.TTGMAP.resume)root.TTGMAP.resume({});}
function begin(){if(S.on)return;warm();build(zoneInfo());script();}
function next(kq){
  if(!S.on)return;
  var ev=S.ev||{},result=kq||{};
  if(result.diemId==null&&ev.diemId!=null)result.diemId=ev.diemId;
  if(result.boss==null&&ev.loai==='boss')result.boss=true;
  S.pre=null;S.ev=null;S.phase='map';
  try{if(root.TTGMAP&&root.TTGMAP.resume)root.TTGMAP.resume(result);}catch(e){}
}
function active(){return S.on;}

function warm(){try{var l=mapChain(zoneInfo().slug);if(l[0]){var im=new Image();im.src=l[0];S.warm=im;}}catch(e){}}   /* tải ngầm bản đồ vùng đang chọn */
root.TTGTX={warm:warm,begin:begin,next:next,stop:stop,active:active,vaoTran:vaoTran,CFG:CFG,MAP_VUNG:MAP_VUNG,mapChain:mapChain};
})(typeof window!=='undefined'?window:globalThis);
