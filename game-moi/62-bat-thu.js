/* 62-bat-thu.js — BẮT THÚ (Bước 3): nút Bắt, giao diện Ném, khung chọn châu, hoạt ảnh bóng, kết quả.
   Cần nạp sau 58-bong-bat.js, 61-tham-hiem-tran.js (dùng TTGBONG, TTGBALO, TTGCS, TTGTHU, THU_MOI).
   index.html nối vào bằng: TTGBAT.attach(host), TTGBAT.frame(ts) (đầu draw), TTGBAT.draw(ctx,ts) (sau khi vẽ thú), TTGBAT.enemyFx(ts) (trong pet('en')).
   LUỒNG: bấm BẮT (đang đánh, thú hoang <60% máu) -> trận đóng băng -> giao diện Ném (3 lần, 60 giây) -> NÉM: bóng bay vòng cung -> TRÚNG (chớp) -> BẬT NGƯỢC -> MỞ -> HÚT thú -> ĐÓNG+RƠI -> RUNG 3 đợt (~5s) -> thành công / vỡ.
   Mỗi lần ném tốn 1 châu. Thành công: thú vào kho bậc tiến hóa 1, tung bậc chất lượng bằng TTGCS.tungBac (E..SS). Hết lượt: thú chạy thoát, về sảnh.
   ẢNH châu: game-moi/img/chau/<slug>-<dạng>.png với dạng = dong, mo, rung, thanhcong, thatbai. Bậc chưa có ảnh thì dùng ảnh Thương Hải Châu đổi màu tạm (hue). */
(function(root){
'use strict';

/* ================= CFG: CHỈNH Ở ĐÂY ================= */
var CFG={
  dir:'game-moi/img/chau/',
  slug:['thuong-hai','thanh-moc','xich-viem','tu-tieu','tinh-than','hon-don'],   /* tên file ảnh theo bậc châu 1..6 */
  hue:[0,-55,185,105,45,150],      /* độ xoay màu tạm khi bậc đó CHƯA có ảnh (lấy ảnh bậc 1 đổi màu) */
  sc:{dong:.156,mo:.145,rung:.145,thanhcong:.145,thatbai:.145},   /* đơn vị game / pixel ảnh: quả châu ~40 đơn vị */
  neo:{mo:[.42,.53]},              /* điểm neo (tỉ lệ) của ảnh: mo = viên ngọc nằm lệch trái */
  macDinh:'cao',                   /* châu chọn sẵn khi vào giao diện Ném: 'cao' = bậc cao nhất đang có (dùng được), 'thap' = thấp nhất */
  t:{bay:750,trung:150,bat:450,mo:400,hut:1000,roi:350,rung:5000,ok:1500,fail:1200},   /* thời gian từng giai đoạn (ms): bay > trúng > bật ngược > mở > hút > đóng+rơi > rung lắc > ok/fail */
  rung:{dot:3,lac:1000,nghi:500},   /* RUNG: 3 đợt, mỗi đợt lắc 1000ms rồi nghỉ 500ms (đợt sau mạnh hơn); phần dư của t.rung là nghỉ cuối */
  bat:{dx:-36,dy:-14},              /* điểm bóng lơ lửng sau khi bật ngược, lệch so với thú (đơn vị game; dx âm = về phía người chơi) */
  mau:['#7fe8ff','#8cf08c','#ff9a5a','#c9a0ff','#8fb0ff','#ffe066'],   /* màu hạt hút / ánh sáng theo bậc châu 1..6 */
  mauBac:{E:'#9aa3b5',D:'#6fcf6f',C:'#4fb3ff',B:'#b57bff',A:'#ffb347',S:'#ff6f6f',SS:'#ffe066'}
};
var host=null,els=null,IMGS={};
var S={mode:'off',t0:0,cap:1,capUsed:1,left:0,time:0,sel:false,win:false,last:0,got:null,selCap:1,key:''};

/* ================= TIỆN ÍCH ================= */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function txc(){return (root.TTGBONG&&TTGBONG.CFG&&TTGBONG.CFG.tx)||{};}
function nLan(){return Number(txc().soLanNem)||3;}
function nGiay(){return Number(txc().thoiGianNemGiay)||60;}
function nBong(){return Number(txc().bongMoiLanNem)||1;}
function battle(){return host&&host.battle?host.battle():null;}
function enemy(){var b=battle();return b&&b.enemy||null;}
function hpPct(){var s=host.st();return s&&s.maxEn?(s.en/s.maxEn*100):100;}
function hpMax(){var m=TTGBONG.CFG.mocHP;return m[m.length-1];}
function toast(t){if(host&&host.toast)host.toast(t);else{try{console.log(t);}catch(e){}}}
function itemOf(cap){var B=root.TTGBALO;return B&&B.CAT?B.CAT[TTGBONG.idBong(cap)]:null;}
function countOf(cap){return root.TTGBALO?TTGBALO.count(TTGBONG.idBong(cap)):0;}
function rateOf(cap){var e=enemy();if(!e)return null;return TTGBONG.tinhTiLe(cap,hpPct(),!!e.boss,e.vung||0);}
function owned(){var a=[],c;for(c=1;c<=TTGBONG.CFG.capBongMax;c++)if(countOf(c)>0)a.push(c);return a;}
function usable(){return owned().filter(function(c){return rateOf(c)!=null;});}
function pickDefault(){var u=usable();if(!u.length)return 0;return CFG.macDinh==='thap'?u[0]:u[u.length-1];}
function icHtml(it){return it&&it.img?'<img src="'+esc(it.img)+'" alt="">':'<b>'+esc((it&&it.ic)||'?')+'</b>';}

/* ================= ẢNH CHÂU ================= */
function sprites(cap){
  if(IMGS[cap])return IMGS[cap];
  var o={},ns=['dong','mo','rung','thanhcong','thatbai'];
  ns.forEach(function(n){var im=new Image();im.ok=false;im.onload=function(){im.ok=true;};im.src=CFG.dir+CFG.slug[cap-1]+'-'+n+'.png';o[n]=im;});
  IMGS[cap]=o;return o;
}
function pic(cap,n){
  var o=sprites(cap)[n];if(o.ok)return {im:o,hue:0};
  if(cap!==1){var f=sprites(1)[n];if(f.ok)return {im:f,hue:CFG.hue[cap-1]||0};}
  return null;
}
function spr(ctx,n,cap,x,y,sc,rot,alpha){
  var p=pic(cap,n),r=20;
  ctx.save();
  if(alpha!=null)ctx.globalAlpha=alpha;
  if(!p){ctx.translate(x,y);ctx.fillStyle='#4fc3d9';ctx.strokeStyle='#103c52';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*sc,0,6.2832);ctx.fill();ctx.stroke();ctx.restore();return false;}
  var im=p.im,k=CFG.sc[n]*sc,w=im.naturalWidth*k,h=im.naturalHeight*k,a=CFG.neo[n]||[.5,.5];
  ctx.imageSmoothingEnabled=true;try{ctx.imageSmoothingQuality='high';}catch(e){}
  if(p.hue&&('filter' in ctx))ctx.filter='hue-rotate('+p.hue+'deg)';
  ctx.translate(x,y);if(rot)ctx.rotate(rot);
  ctx.drawImage(im,-w*a[0],-h*a[1],w,h);
  ctx.restore();return true;
}

/* ================= TRẠNG THÁI ================= */
function canCatch(){
  var e=enemy(),s=host&&host.st();
  return !!(e&&e.source==='demo'&&s&&s.en>0&&s.me>0&&host.scene()==='tran');
}
function start(){   /* bấm nút BẮT */
  if(S.mode!=='off')return;
  if(!canCatch()){toast('Không thể bắt lúc này');return;}
  if(hpPct()>=hpMax()){toast('Thú hoang còn quá khỏe (cần dưới '+hpMax()+'% máu)');return;}
  if(!owned().length){toast('Hết Ngự Thú Châu');return;}
  if(!usable().length){toast('Châu hiện có không dùng được ở vùng này');return;}
  host.freeze();
  S.mode='ready';S.t0=performance.now();S.left=nLan();S.time=nGiay()*1000;S.sel=false;S.cap=pickDefault();S.got=null;
}
function abort(){S.mode='off';S.sel=false;if(els){els.sel.className='bts';els.res.className='btr';}}
function cancel(){   /* nút THÔI: tiếp tục trận */
  if(S.mode!=='ready')return;
  abort();host.resume();
}
function flee(msg){abort();host.end(msg||'Thú hoang đã bỏ chạy!');}
function doThrow(){
  if(S.mode!=='ready'||S.sel)return;
  var cap=S.cap,r=rateOf(cap);
  if(!cap||countOf(cap)<=0){toast('Hết châu này');return;}
  if(r==null){toast('Châu này không dùng được ở đây');return;}
  TTGBALO.add(TTGBONG.idBong(cap),-nBong());
  S.left--;S.capUsed=cap;S.win=Math.random()<r;S.mode='fly';S.t0=performance.now();
}
function tungBacChau(cap){   /* CHỖ GẮN CHÂU GACHA RIÊNG (ra bậc từ B đến SS) sau này: kiểm tra cap hoặc id châu ở đây. Hiện mọi châu: E..SS theo TTGCS.tungBac */
  return (root.TTGCS&&TTGCS.tungBac)?TTGCS.tungBac():'E';
}
function giveBeast(){
  var e=enemy();if(!e)return;
  var bac=tungBacChau(S.capUsed),tien=Number(txc().bacKhiBat)||1,uid=null;
  try{uid=TTGTHU.add({id:e.id,ten:e.ten,bac:bac,tien:tien,lv:e.lv,chiso:{},kn:[null,null,null,null,null,null]});}catch(x){}
  S.got={uid:uid,id:e.id,ten:e.ten,bac:bac,tien:tien,lv:e.lv,boss:!!e.boss};
}
function afterFail(){
  if(S.left>0&&usable().length){
    if(!(countOf(S.cap)>0&&rateOf(S.cap)!=null))S.cap=pickDefault();
    S.mode='ready';S.sel=false;S.t0=performance.now();toast('Thú thoát ra! Còn '+S.left+' lần ném');
  }else showPanel(false);
}

/* ================= FRAME / ENEMY FX / DRAW ================= */
function frame(ts){
  if(!host)return;
  var dt=Math.min(100,Math.max(0,ts-(S.last||ts)));S.last=ts;
  if(S.mode!=='off'&&(host.scene()!=='tran'||!battle())){abort();}
  var t=Math.max(0,ts-S.t0),T=CFG.t;
  if(S.mode==='ready'&&!S.sel){S.time-=dt;if(S.time<=0)flee('Hết giờ, thú hoang đã bỏ chạy!');}
  else if(S.mode==='fly'&&t>=T.bay){S.mode='trung';S.t0=ts;}
  else if(S.mode==='trung'&&t>=T.trung){S.mode='bat';S.t0=ts;}
  else if(S.mode==='bat'&&t>=T.bat){S.mode='mo';S.t0=ts;}
  else if(S.mode==='mo'&&t>=T.mo){S.mode='hut';S.t0=ts;}
  else if(S.mode==='hut'&&t>=T.hut){S.mode='roi';S.t0=ts;}
  else if(S.mode==='roi'&&t>=T.roi){S.mode='rung';S.t0=ts;}
  else if(S.mode==='rung'&&t>=T.rung){S.mode=S.win?'ok':'fail';S.t0=ts;if(S.win)giveBeast();}
  else if(S.mode==='ok'&&t>=T.ok)showPanel(true);
  else if(S.mode==='fail'&&t>=T.fail)afterFail();
  syncDom();
}
function enemyFx(ts){
  var m=S.mode,t=Math.max(0,ts-S.t0),p;
  if(m==='trung'){p=Math.min(1,t/CFG.t.trung);return {a:(Math.floor(t/50)%2?.55:1),s:1,dx:7*(1-p),dy:0,r:0};}   /* trúng: giật lùi + nháy */
  if(m==='bat'){p=Math.max(0,1-t/250);return p>0?{a:1,s:1,dx:6*p,dy:0,r:0}:null;}
  if(m==='hut'&&host){   /* hút: thú thu nhỏ, xoay nhẹ, mờ dần, bay về phía bóng (dx,dy = độ lệch từ chỗ thú đến bóng) */
    var mm=host.m(),ey=mm.gy-60;p=Math.max(0,Math.min(1,(t-100)/(CFG.t.hut-100)));var q=p*p;
    return {a:1-p*.85,s:1-p*.92,dx:CFG.bat.dx*q,dy:CFG.bat.dy*q,r:p*3.5,hide:p>=1};}
  if(m==='roi'||m==='rung'||m==='ok'||(m==='panel'&&S.win))return {hide:true};
  if(m==='fail'){p=Math.min(1,t/450);return {a:p,s:.25+.75*p,dx:0,dy:0};}
  return null;
}
/* ----- hiệu ứng canvas: ánh sáng, va chạm, hạt hút ----- */
function glow(ctx,x,y,r,col,a){ctx.save();ctx.globalCompositeOperation='lighter';var g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');ctx.globalAlpha=Math.max(0,Math.min(1,a));ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,6.2832);ctx.fill();ctx.restore();}
function hitFx(ctx,x,y,u){   /* chớp sáng trắng + tia tóe ra tại điểm chạm, u: 0..1 */
  if(u>=1)return;glow(ctx,x,y,12+30*u,'#ffffff',1-u);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#fff6c0';ctx.lineWidth=2;ctx.lineCap='round';ctx.globalAlpha=1-u;
  for(var i=0;i<8;i++){var a=i*.7854+.3,c=Math.cos(a),s=Math.sin(a),r0=8+10*u,r1=14+34*u;ctx.beginPath();ctx.moveTo(x+c*r0,y+s*r0);ctx.lineTo(x+c*r1,y+s*r1);ctx.stroke();}
  ctx.restore();}
function hutFx(ctx,ts,t,cap,ex,ey,Hx,Hy){   /* hạt/tia sáng xoáy từ thú vào tâm bóng, mật độ tăng dần */
  var p=Math.min(1,t/CFG.t.hut),n=8+Math.round(28*p),col=CFG.mau[cap-1]||'#fff',i;
  function pos(i,u){var ang=i*2.399+u*3.5,r0=26+((i*7)%5)*7,e=u*u*(3-2*u);return [ex+(Hx-ex)*e+Math.cos(ang)*r0*(1-e),ey+(Hy-ey)*e+Math.sin(ang)*r0*.8*(1-e)];}
  glow(ctx,Hx,Hy,16+14*p,col,.3+.4*p);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineCap='round';
  for(i=0;i<n;i++){
    var u=(t/520+(i*.6180339)%1)%1,a=pos(i,u),b=pos(i,Math.max(0,u-.07)),sz=1.4+2*u;
    ctx.globalAlpha=(u<.15?u/.15:1)*.9;ctx.lineWidth=sz;ctx.beginPath();ctx.moveTo(b[0],b[1]);ctx.lineTo(a[0],a[1]);ctx.stroke();
    ctx.beginPath();ctx.arc(a[0],a[1],sz,0,6.2832);ctx.fill();}
  ctx.restore();}
function draw(ctx,ts){
  if(S.mode==='off'||!host)return;
  var m=host.m(),t=Math.max(0,ts-S.t0),T=CFG.t,cap=S.mode==='ready'?S.cap:S.capUsed;
  var hx=m.cx,hy=m.gy-78+Math.sin(ts/420)*3,ex=m.ex,ey=m.gy-60,gb=m.gy-20,Hx=ex+CFG.bat.dx,Hy=ey+CFG.bat.dy,p,q,amp;
  if(S.mode==='ready'){
    spr(ctx,'dong',cap,hx,hy,1,Math.sin(ts/700)*.08);
    ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 13px sans-serif';ctx.lineWidth=3;ctx.strokeStyle='#000';ctx.fillStyle='#fff';
    var tx='Ném: còn '+S.left+'/'+nLan()+' lần   ⏱ '+Math.max(0,Math.ceil(S.time/1000))+'s',ty=m.gy-118;
    ctx.strokeText(tx,hx,ty);ctx.fillText(tx,hx,ty);ctx.restore();
  }else if(S.mode==='fly'){
    p=Math.min(1,t/T.bay);spr(ctx,'dong',cap,hx+(ex-hx)*p,hy+(ey-hy)*p-Math.sin(Math.PI*p)*70,1,p*12.5);
  }else if(S.mode==='trung'){
    spr(ctx,'dong',cap,ex,ey,1,12.5);hitFx(ctx,ex,ey,t/(T.trung*2));
  }else if(S.mode==='bat'){
    p=Math.min(1,t/T.bat);q=1-(1-p)*(1-p);
    spr(ctx,'dong',cap,ex+(Hx-ex)*q,ey+(Hy-ey)*q-18*Math.sin(Math.PI*p),1,12.5+4*q);hitFx(ctx,ex,ey,(T.trung+t)/(T.trung*2));
  }else if(S.mode==='mo'){
    p=Math.min(1,t/T.mo);spr(ctx,'mo',cap,Hx,Hy+Math.sin(ts/240)*1.5,.55+.45*(1-(1-p)*(1-p)),0);
  }else if(S.mode==='hut'){
    p=Math.min(1,t/T.hut);hutFx(ctx,ts,t,cap,ex,ey,Hx,Hy);
    spr(ctx,'mo',cap,Hx,Hy+Math.sin(ts/240)*1.5,1+.03*Math.sin(ts/90),0);
  }else if(S.mode==='roi'){   /* đóng lại, rơi xuống đất, nảy nhẹ một cái */
    p=Math.min(1,t/T.roi);q=Math.min(1,p/.65);
    var bx=Hx+(ex-Hx)*q,by=Hy+(gb-Hy)*q*q;
    if(p>.65){bx=ex;by=gb-9*Math.sin(Math.PI*(p-.65)/.35);}
    spr(ctx,'dong',cap,bx,by,1,-(1-p)*6.2832);
  }else if(S.mode==='rung'){   /* 3 đợt lắc (ảnh rung) xen nghỉ đứng yên (ảnh dong + ánh sáng nhấp nháy) */
    var R=CFG.rung,per=R.lac+R.nghi,idx=Math.floor(t/per),wi=t-idx*per,mau=CFG.mau[cap-1]||'#fff';
    if(idx<R.dot&&wi<R.lac){
      var env=Math.min(1,wi/80,(R.lac-wi)/120);amp=(4+idx*3)*env;
      spr(ctx,'rung',cap,ex+Math.sin(ts/(17-idx*2))*amp,gb,1,Math.sin(ts/(21-idx*3))*(.08+.07*idx)*env);
    }else{
      spr(ctx,'dong',cap,ex,gb,1,0);glow(ctx,ex,gb,24,mau,.25+.25*Math.sin(ts/80));
    }
  }else if(S.mode==='ok'){
    spr(ctx,'thanhcong',cap,ex,gb-4,1+.05*Math.sin(ts/120),0);
  }else if(S.mode==='fail'){
    spr(ctx,'thatbai',cap,ex,gb,1,0,1-Math.max(0,(t-T.fail*.7)/(T.fail*.3)));
  }
}

/* ================= DOM ================= */
var CSS=[
'.btx{position:fixed;z-index:7;display:none;box-sizing:border-box;border:2px solid #d9a93a;border-radius:9px;background:linear-gradient(#2a5fb0,#143a78);color:#fff3c4;font:800 14px/1 "Segoe UI",system-ui,sans-serif;text-shadow:0 1px 0 #000;box-shadow:0 0 10px rgba(255,214,102,.45);touch-action:manipulation;-webkit-tap-highlight-color:transparent;cursor:pointer;padding:0;align-items:center;justify-content:center;gap:5px}',
'.btx:active{transform:scale(.94)}',
'.btx.g{background:linear-gradient(#5b5f73,#33364a);border-color:#8a8da0;color:#ddd;box-shadow:none}',
'.btx.chip{font-size:11px;line-height:1.15;padding:0 6px;text-align:left}',
'.btx .ci{width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:20px}',
'.btx .ci img{width:100%;height:100%;object-fit:contain}',
'.btx .ct{display:flex;flex-direction:column}',
'.bts,.btr{position:fixed;left:0;top:0;right:0;bottom:0;z-index:9;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.72);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'.bts.on,.btr.on{display:flex}',
'.bts-fr{position:relative;height:min(96vh,calc(96vw*1142/1268));aspect-ratio:1268/1142;background:url(game-moi/khung-chon-chau.webp) 0 0/100% 100% no-repeat;color:#e8ecff;--u:1px}',
'.bts-fr>*{position:absolute;box-sizing:border-box}',
'.bts button{font-family:inherit;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
'.bts-x,.bts-ok{border:0;background:transparent;cursor:pointer;padding:0;border-radius:50%}',
'.bts-ok{border-radius:calc(var(--u)*30)}',
'.bts-x:active,.bts-ok:active{background:rgba(255,224,102,.3)}',
'.bts-sl{display:flex;align-items:center;justify-content:center;border:0;background:none;cursor:pointer;padding:0}',
'.bts-sl img{width:auto;height:70%;max-width:44%;object-fit:contain}',
'.bts-sl b{font-weight:400;font-size:calc(var(--u)*70)}',
'.bts-sl.sel{box-shadow:inset 0 0 0 calc(var(--u)*5) #ffe066,0 0 calc(var(--u)*18) rgba(255,224,102,.75)}',
'.bts-sl .q{position:absolute;right:6%;bottom:4%;font-weight:800;font-size:calc(var(--u)*30);color:#fff;text-shadow:0 0 3px #000,1px 1px 0 #000}',
'.bts-sl .r{position:absolute;left:6%;bottom:4%;font-weight:800;font-size:calc(var(--u)*28);color:#9ff5a8;text-shadow:0 0 3px #000,1px 1px 0 #000}',
'.bts-sl.off{opacity:.45}',
'.bts-in{display:flex;flex-direction:column;align-items:center;padding:calc(var(--u)*18) calc(var(--u)*16);text-align:center;overflow:hidden}',
'.bts-in .ic{width:calc(var(--u)*190);height:calc(var(--u)*190);display:flex;align-items:center;justify-content:center;font-size:calc(var(--u)*120);flex:none}',
'.bts-in .ic img{width:100%;height:100%;object-fit:contain}',
'.bts-in .nm{margin-top:calc(var(--u)*10);font-weight:800;font-size:calc(var(--u)*44);color:#ffe9a0;line-height:1.1}',
'.bts-in .mt{margin-top:calc(var(--u)*8);font-size:calc(var(--u)*32);color:#9fe8de}',
'.bts-in .rt{margin-top:calc(var(--u)*14);font-weight:800;font-size:calc(var(--u)*46);color:#9ff5a8}',
'.bts-in .ds{margin-top:calc(var(--u)*12);font-size:calc(var(--u)*30);line-height:1.35;color:#cfd6ff}',
'.btr-c{min-width:260px;max-width:86vw;padding:16px 22px;border:3px solid #d9a93a;border-radius:14px;background:linear-gradient(#1a2a6a,#0b123a);color:#e8ecff;text-align:center;box-shadow:0 0 30px rgba(0,0,0,.8)}',
'.btr-c h3{margin:0 0 8px;font-size:18px;color:#ffe9a0}',
'.btr-c canvas{width:112px;height:112px;display:block;margin:0 auto;image-rendering:auto}',
'.btr-c .ln{font-size:13px;line-height:1.5}',
'.btr-c button{margin-top:12px;min-width:120px;height:38px;border-radius:9px;border:2px solid #d9a93a;background:linear-gradient(#2a5fb0,#143a78);color:#fff3c4;font:800 15px "Segoe UI",system-ui,sans-serif;cursor:pointer}'
].join('\n');
var SL_COL=[91,404],SL_ROW=[[273,134],[449,132],[623,131],[798,132],[972,110]],FW=1268,FH=1142;
function box(c,x,y,w,h){var s=c.style;s.left=(x/FW*100)+'%';s.top=(y/FH*100)+'%';s.width=(w/FW*100)+'%';s.height=(h/FH*100)+'%';return c;}
function btn(cls,html,fn){var b=document.createElement('button');b.type='button';b.className='btx '+(cls||'');b.innerHTML=html;b.addEventListener('click',fn);document.body.appendChild(b);return b;}
function build(){
  if(els)return;
  var st=document.createElement('style');st.textContent=CSS;document.head.appendChild(st);
  els={};
  els.bat=btn('','BẮT',start);
  els.nem=btn('','NÉM',doThrow);
  els.thoi=btn('g','Thôi',cancel);
  els.chip=btn('chip','',function(){openSel();});
  /* khung chọn châu */
  els.sel=document.createElement('div');els.sel.className='bts';
  els.fr=document.createElement('div');els.fr.className='bts-fr';els.sel.appendChild(els.fr);
  els.x=box(document.createElement('button'),1076,64,120,120);els.x.className='bts-x';els.x.type='button';els.x.setAttribute('aria-label','Đóng');els.x.addEventListener('click',closeSel);els.fr.appendChild(els.x);
  els.slots=[];
  for(var i=0;i<10;i++){var r=Math.floor(i/2),c=i%2,b=box(document.createElement('button'),SL_COL[c]+4,SL_ROW[r][0]+4,242,SL_ROW[r][1]-8);b.className='bts-sl';b.type='button';(function(k){b.addEventListener('click',function(){pickSlot(k);});})(i);els.fr.appendChild(b);els.slots.push(b);}
  els.info=box(document.createElement('div'),713,324,425,607);els.info.className='bts-in';els.fr.appendChild(els.info);
  els.ok=box(document.createElement('button'),760,985,360,90);els.ok.className='bts-ok';els.ok.type='button';els.ok.setAttribute('aria-label','Chọn');els.ok.addEventListener('click',confirmSel);els.fr.appendChild(els.ok);
  els.sel.addEventListener('click',function(e){if(e.target===els.sel)closeSel();});
  document.body.appendChild(els.sel);
  /* bảng kết quả */
  els.res=document.createElement('div');els.res.className='btr';document.body.appendChild(els.res);
  window.addEventListener('resize',function(){S.key='';unitSel();});
}
function unitSel(){if(els&&els.fr)els.fr.style.setProperty('--u',(els.fr.clientWidth/FW)+'px');}

/* khung chọn châu: các ô theo thứ tự bậc 1..6 (chỉ hiện châu đang có) */
function selList(){return owned();}
function openSel(){
  if(S.mode!=='ready')return;
  S.sel=true;S.selCap=S.cap||selList()[0]||1;els.sel.className='bts on';unitSel();renderSel();
}
function closeSel(){S.sel=false;if(els)els.sel.className='bts';}
function pickSlot(i){var l=selList();if(l[i]){S.selCap=l[i];renderSel();}}
function confirmSel(){
  var cap=S.selCap,r=rateOf(cap);
  if(!cap||countOf(cap)<=0){toast('Chưa chọn châu');return;}
  if(r==null){toast('Châu này không dùng được ở vùng này');return;}
  S.cap=cap;closeSel();
}
function renderSel(){
  var l=selList(),i,it,c,r,h;
  for(i=0;i<els.slots.length;i++){
    var b=els.slots[i];c=l[i];
    if(!c){b.innerHTML='';b.className='bts-sl';b.style.visibility='hidden';continue;}
    b.style.visibility='visible';it=itemOf(c);r=rateOf(c);
    b.className='bts-sl'+(c===S.selCap?' sel':'')+(r==null?' off':'');
    b.innerHTML=icHtml(it)+'<span class="q">x'+countOf(c)+'</span><span class="r">'+(r==null?'--':Math.round(r*100)+'%')+'</span>';
  }
  c=S.selCap;it=itemOf(c);r=rateOf(c);
  if(!c||!it){els.info.innerHTML='<div class="ds">Chưa có Ngự Thú Châu</div>';return;}
  els.info.innerHTML='<div class="ic">'+icHtml(it)+'</div><div class="nm">'+esc(it.ten)+'</div><div class="mt">Cấp '+c+' · Có: x'+countOf(c)+'</div>'
    +'<div class="rt">'+(r==null?'Không dùng được':'Tỉ lệ bắt: '+Math.round(r*100)+'%')+'</div><div class="ds">'+esc(it.mo||'')+'</div>';
}

/* hiển thị / vị trí các nút theo trạng thái */
function setShow(e,on){var d=on?'flex':'none';if(e.style.display!==d)e.style.display=d;}
function place(e,cxCss,cyCss,w,h){var s=e.style;s.width=w+'px';s.height=h+'px';s.left=Math.round(cxCss-w/2)+'px';s.top=Math.round(cyCss-h/2)+'px';}
function syncDom(){
  if(!els){if(S.mode==='off'&&!(host&&canCatch()))return;build();}
  var inBattle=host&&canCatch(),ready=S.mode==='ready'&&!S.sel;
  setShow(els.bat,S.mode==='off'&&inBattle);
  setShow(els.nem,ready);setShow(els.thoi,ready);setShow(els.chip,ready);
  if(!(S.mode==='off'&&inBattle)&&!ready)return;
  var m=host.m(),f=m.K/m.DPR,cc=Math.round(r2(m.cx*f)),key=[m.K,m.DPR,m.W,m.H,m.th,m.gy,m.cx,m.I.t,S.mode,S.cap,S.left,countOf(S.cap)].join('|');
  if(key===S.key)return;S.key=key;
  place(els.bat,m.cx*f,(m.I.t+54)*f,80,32);
  var cy=(m.gy-34)*f;
  place(els.nem,cc,cy,96,38);place(els.thoi,cc-48-8-28,cy,56,38);place(els.chip,cc+48+8+62,cy,124,38);
  if(ready){var it=itemOf(S.cap),r=rateOf(S.cap);els.chip.innerHTML='<span class="ci">'+icHtml(it)+'</span><span class="ct"><span>Cấp '+S.cap+' · x'+countOf(S.cap)+'</span><span>'+(r==null?'--':Math.round(r*100)+'%')+'</span></span>';}
}
function r2(x){return x;}

/* bảng kết quả */
function showPanel(win){
  build();S.mode='panel';S.win=win;closeSel();
  var h;
  if(win&&S.got){
    var g=S.got,lo=root.TTGCS&&TTGCS.loai?TTGCS.loai(g.id):null,heTen=root.TTGCS&&TTGCS.HE_TEN||{},he=lo&&lo.he?lo.he.map(function(x){return heTen[x]||x;}).join(' / '):'?';
    h='<div class="btr-c"><h3>Bắt thành công!</h3><canvas width="128" height="128"></canvas><div class="ln"><b>'+esc(g.ten)+'</b>'+(g.boss?' <span style="color:#ff9f6f">[BOSS]</span>':'')+'<br>Hệ: '+esc(he)+'<br>Bậc: <b style="color:'+(CFG.mauBac[g.bac]||'#fff')+'">'+esc(g.bac)+'</b> · Tiến hóa '+g.tien+' · Cấp '+g.lv+'</div><button type="button">Về sảnh</button></div>';
    els.res.innerHTML=h;
    try{var cv=els.res.querySelector('canvas'),c2=cv.getContext('2d');c2.imageSmoothingEnabled=false;THU_MOI.setFrame(192);THU_MOI.draw(c2,g.id,g.tien,64,124,128);}catch(x){}
  }else{
    h='<div class="btr-c"><h3>Bắt thất bại</h3><div class="ln">Thú hoang đã chạy thoát.</div><button type="button">Về sảnh</button></div>';
    els.res.innerHTML=h;
  }
  els.res.className='btr on';
  els.res.querySelector('button').addEventListener('click',function(){abort();host.end();});
}

/* NÚT TEST TẠM: bấm để nhận mỗi bậc châu +5 (xóa khi đã có nguồn châu thật ở Bước 5). Tắt bằng CFG.nutTest=false */
CFG.nutTest=true;
if(CFG.nutTest&&root.TTGNV&&root.TTGBALO&&root.TTGBONG){
  root.TTGNV.add({id:'nhan-chau',ten:'Nhận châu',onTap:function(){
    for(var c=1;c<=TTGBONG.CFG.capBongMax;c++)TTGBALO.add(TTGBONG.idBong(c),5);
    toast('TEST: +5 mỗi bậc Ngự Thú Châu');
  },icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="#3ec9d6" stroke="#0b4a5c" stroke-width="3"/><path d="M32 18v28M18 32h28" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>'});
}

root.TTGBAT={
  CFG:CFG,attach:function(h){host=h;},frame:frame,draw:draw,enemyFx:enemyFx,start:start,
  active:function(){return S.mode!=='off';},mode:function(){return S.mode;}
};
})(typeof window!=='undefined'?window:globalThis);
