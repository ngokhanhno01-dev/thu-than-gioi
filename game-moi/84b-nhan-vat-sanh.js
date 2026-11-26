/* ===== 84b-nhan-vat-sanh.js (TTGNVSANH): NHÂN VẬT ĐỨNG CHUNG VỚI THÚ Ở SẢNH + TƯƠNG TÁC (26/11/2026) =====
   Nhân vật người chơi đã chọn (64b-chon-nhan-vat.js, kèm skin) đứng cạnh thú ở khung trên của sảnh, mặt hướng về thú:
   - [26/11/2026] ĐI TỰ DO 2 CHIỀU: nhân vật tự đi dạo khắp khung trên (trái/phải/lên/xuống, khung đi ngang + chính diện + quay lưng, 8 khung/giây), nghỉ giữa các lần đi,
     KHÔNG còn bám theo thú. Né các ô HUD (Danh Vọng, EXP + Level, Tinh Thạch + Thú Thần Thạch) bằng vùng cấm của TTGSANH (83-sanh-song.js).
   - CHẠM VÀO THÚ: nhân vật chạy lại gần, vuốt ve thú (nhảy nhẹ 2 lần, trái tim bay lên), thú phản ứng + nói 1 câu vui (TTGSANH.say).
   - CHẠM VÀO NHÂN VẬT: nhân vật quay mặt ra phía người chơi (ảnh chính diện), nhảy chào và nói 1 câu trong bong bóng.
   - TỰ ĐỘNG: thỉnh thoảng nhân vật hiện emoji nhỏ hoặc nói 1 câu. LÂU LÂU MỚI (CFG.tuongTac, mặc định 40-80 giây) nhân vật mới đi tới vuốt thú 1 lần
     (thú đứng yên chờ nhờ TTGSANH.hold), vuốt xong hai bên lại đi riêng. Người chơi chạm vào thú thì vẫn vuốt ngay.
   NỐI VỚI index.html: dòng vẽ sảnh gọi TTGNVSANH.draw(ctx,ts,groundY) ngay sau petSanh (nhân vật nằm trên thú, dưới bong bóng của thú).
   Cần: TTGSANH.info() (83-sanh-song.js) cho vị trí thú; TTGNHANVAT.anhDi() (64b) cho dải khung 512x512 x 4. Thiếu một trong hai hoặc ảnh chưa tải xong thì không vẽ gì (sảnh y như cũ).
   CHỈNH: khối CFG bên dưới (cỡ, khoảng cách tới thú, tốc độ đi) và bảng LINES / EMO (thêm câu = thêm 1 chuỗi). Mọi lỗi đều bị nuốt (try/catch). ?nvsanh=0 trong link để tắt (thử so sánh).
   [26/11/2026] TRONG TRẬN ĐẤU: nhân vật cũng đứng phía SAU thú của bạn (dáng chờ), thú tấn công thì nhân vật chỉ tay ra lệnh (xem khối "NHÂN VẬT TRONG TRẬN ĐẤU" gần cuối file, chỉnh ở CFG.tran; ?nvtran=0 để tắt). Không cần sửa index.html. */
(function(root){'use strict';
var CFG={
  on:!/[?&]nvsanh=0/.test(location.search),
  nang:9,               /* nâng nhân vật lên bấy nhiêu điểm cho chân ngang chân thú (thú được nâng PET_LIFT=16 trong index.html; tăng số này = nhân vật đứng cao hơn) */
  kich:92,              /* cỡ ô vuông vẽ nhân vật (điểm game); nhân vật cao ~92% ô */
  gap:78,gapGan:36,     /* gap: chỗ đứng lúc mới vào sảnh; gapGan: khoảng cách ngang tới thú khi vuốt ve */
  toc:92,               /* tốc độ đi (điểm game/giây) */
  box:{w:18,h:84},      /* hộp né HUD của nhân vật: nửa rộng, cao (điểm game) */
  wander:{nghi:[1800,4800],toc:.7,minPet:64},   /* đi dạo: nghỉ giữa 2 lần đi (ms), tốc độ so với toc, khoảng cách tối thiểu tới thú */
  tuongTacDau:[18000,32000],tuongTac:[40000,80000],   /* lần đầu / các lần sau nhân vật mới đi vuốt thú (ms): LÂU LÂU mới 1 lần */
  fps:8,                /* khung đi bộ mỗi giây */
  tuDong:[9000,18000],  /* nghỉ giữa 2 việc tự động (ms) */
  chance:{emo:.55,noi:.45},   /* việc tự động chỉ còn emoji / nói; vuốt thú có lịch riêng (tuongTac) */
  bong:{show:[2600,3400],maxW:130,font:'bold 10px "Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',lh:12,pad:6},
  thoiMat:{truoc:1600}  /* nhân vật nhìn ra người chơi bao lâu sau khi bị chạm (ms) */
};
var EMO=['🎵','💭','😊','✨','😄','💪','🌟'];
var LINES={
  chao:[
    'Chào bạn! Hôm nay mình đi thám hiểm nhé?',
    'Có mình và thú ở đây rồi, đừng lo!',
    'Hehe, bạn gọi mình hả?',
    'Nhớ mang đủ Ngự Thú Châu trước khi đi nhé.',
    'Hôm nay tuyết đẹp ghê, đi săn thú thôi!',
    'Thú của mình ngoan lắm đó, bạn thấy chưa?',
    'Tu luyện chăm chỉ thì lên cấp nhanh thôi!',
    'Mở thêm vùng mới là thú mạnh thêm đó!'
  ],
  vuot:[
    'Ngoan nào, ngoan nào!',
    'Giỏi lắm, hôm nay con giỏi lắm!',
    'Lại đây, để ta vuốt cho.',
    'Con là thú tuyệt nhất sảnh này!',
    'Cố lên nhé, chúng ta cùng mạnh lên!'
  ],
  tuNoi:[
    'Hôm nay thú trông khỏe ghê nhỉ.',
    'Không biết vùng tiếp theo có thú gì hay ho...',
    'Mình muốn bắt thật nhiều thú hiếm!',
    'Hít thở không khí trong lành thật dễ chịu.'
  ]
};
var S={m:null,cv:null,bound:false,x:null,cy:0,gy:0,w:null,wait:0,nextTalk:0,nextTT:0,face:1,side:-1,walking:false,t0:0,bong:null,hearts:[],front:0,pat:null,hop:null,bag:{},last:0,info:null};
function rnd(a,b){return a+Math.random()*(b-a);}
function rr(r){return rnd(r[0],r[1]);}
function clamp(x,a,b){return x<a?a:(x>b?b:x);}
function pick(a){return a[Math.floor(Math.random()*a.length)];}
function take(k){var b=S.bag[k];if(!b||!b.length){b=S.bag[k]=LINES[k].slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=b[i];b[i]=b[j];b[j]=t;}}return b.pop();}

/* ---------- ảnh khung đi bộ ---------- */
var IMG={};
function strip(h){
  if(!root.TTGNHANVAT||!TTGNHANVAT.anhDi)return null;
  var src=TTGNHANVAT.anhDi(h),e=IMG[src];
  if(!e){e=IMG[src]={img:new Image(),ok:false,bad:false};e.img.onload=function(){e.ok=true;};e.img.onerror=function(){e.bad=true;};e.img.src=src;}
  return(e.ok&&!e.bad)?e.img:null;}

/* ---------- bong bóng nói / emoji / tim ---------- */
function say(ts,text,emo){S.bong={t0:ts,text:text||null,emo:emo||null,dur:text?Math.min(5200,1800+text.length*55):rr(CFG.bong.show),lay:null};}
function heart(ts,x,y){S.hearts.push({t0:ts,x:x+rnd(-14,14),y:y,dx:rnd(-8,8)});}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();}
function wrap(c,text,maxW){var w=text.split(' '),L=[],cur='',i,t;for(i=0;i<w.length;i++){t=cur?cur+' '+w[i]:w[i];if(c.measureText(t).width>maxW&&cur){L.push(cur);cur=w[i];}else cur=t;}if(cur)L.push(cur);return L;}
/* đẩy bong bóng xuống dưới các ô HUD nếu đè lên (vùng cấm lấy từ TTGSANH) */
function avoidBong(x,w,top,h){try{var Z=root.TTGSANH&&TTGSANH.zone?TTGSANH.zone():null,i,k;if(Z)for(i=0;i<Z.k.length;i++){k=Z.k[i];if(x+w>k.x0&&x<k.x1&&top+h>k.y0&&top<k.y1)top=k.y1+3;}}catch(e){}return top;}
function drawBong(c,ts,o,cx,top){
  var b=S.bong;if(!b)return;var age=ts-b.t0;if(age<0)return;
  if(age>b.dur+250){S.bong=null;return;}
  var alpha=1,fade=b.dur+250-age;if(fade<250)alpha=Math.max(0,fade/250);
  var sc=age<260?.4+.6*Math.min(1,age/260)+.12*Math.sin(Math.min(1,age/260)*Math.PI):1;
  c.save();c.globalAlpha=alpha;
  if(b.text){
    c.font=CFG.bong.font;
    if(!b.lay){var L=wrap(c,b.text,CFG.bong.maxW),w=0,i;for(i=0;i<L.length;i++)w=Math.max(w,c.measureText(L[i]).width);b.lay={L:L,w:Math.ceil(w)+CFG.bong.pad*2,h:L.length*CFG.bong.lh+CFG.bong.pad*2-2};}
    var w2=b.lay.w,h2=b.lay.h,bx=clamp(cx-w2/2,o.l+6,Math.max(o.l+6,o.r-6-w2)),by=avoidBong(bx,w2,Math.max(o.t+26,top-h2-10),h2),tx=clamp(cx,bx+12,bx+w2-12);
    c.translate(cx,by+h2+8);c.scale(sc,sc);c.translate(-cx,-(by+h2+8));
    c.shadowColor='rgba(0,0,0,.35)';c.shadowBlur=5;c.shadowOffsetY=2;
    c.fillStyle='rgba(240,250,255,.97)';c.strokeStyle='#5aa6d8';c.lineWidth=1.8;
    rrect(c,bx,by,w2,h2,8);c.fill();
    c.beginPath();c.moveTo(tx-5,by+h2-1);c.lineTo(tx,by+h2+8);c.lineTo(tx+5,by+h2-1);c.closePath();c.fill();
    c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetY=0;
    rrect(c,bx,by,w2,h2,8);c.stroke();
    c.fillStyle='rgba(240,250,255,.97)';c.fillRect(tx-4,by+h2-2,8,3);
    c.beginPath();c.moveTo(tx-5,by+h2);c.lineTo(tx,by+h2+8);c.lineTo(tx+5,by+h2);c.stroke();
    c.fillStyle='#17304a';c.font=CFG.bong.font;c.textAlign='left';c.textBaseline='top';
    var y=by+CFG.bong.pad-1,i2;for(i2=0;i2<b.lay.L.length;i2++){c.fillText(b.lay.L[i2],bx+CFG.bong.pad,y);y+=CFG.bong.lh;}
  }else{
    c.font='16px sans-serif';var w3=30,h3=26,ex=clamp(cx,o.l+w3/2+6,o.r-w3/2-6),ey=avoidBong(ex-w3/2,w3,Math.max(o.t+26,top-h3-8),h3)+Math.sin(ts/260)*1.2;
    c.translate(ex,ey+h3/2);c.scale(sc,sc);c.translate(-ex,-(ey+h3/2));
    c.shadowColor='rgba(0,0,0,.3)';c.shadowBlur=4;c.shadowOffsetY=2;c.fillStyle='rgba(240,250,255,.97)';c.strokeStyle='#5aa6d8';c.lineWidth=1.5;
    rrect(c,ex-w3/2,ey,w3,h3,13);c.fill();c.shadowColor='transparent';c.shadowBlur=0;c.shadowOffsetY=0;c.stroke();
    c.fillStyle='#000';c.textAlign='center';c.textBaseline='middle';c.fillText(b.emo,ex,ey+h3/2+1);
  }
  c.restore();}
function drawHearts(c,ts){
  var i,h,age,u;
  for(i=S.hearts.length-1;i>=0;i--){h=S.hearts[i];age=ts-h.t0;if(age>1300){S.hearts.splice(i,1);continue;}if(age<0)continue;
    u=age/1300;c.save();c.globalAlpha=u<.7?1:1-(u-.7)/.3;c.font=(10+8*Math.min(1,u*3))+'px sans-serif';c.textAlign='center';c.textBaseline='middle';
    c.fillText('❤️',h.x+h.dx*u+Math.sin(u*9)*3,h.y-u*34);c.restore();}}

/* ---------- logic ---------- */
/* cy = độ lệch LÊN (<=0) so với đường đất của nhân vật; gc = đường đất nhân vật (đã nâng) */
function freeC(x,cy,gc){var T=root.TTGSANH;return(T&&T.free)?T.free(x,gc+cy,CFG.box.w,CFG.box.h,gc+3):true;}
function pathC(xa,ca,xb,cb,gc){for(var i=0;i<=6;i++){var u=i/6;if(!freeC(xa+(xb-xa)*u,ca+(cb-ca)*u,gc))return false;}return true;}
function upMax(){var T=root.TTGSANH;return(T&&T.CFG&&T.CFG.dy&&T.CFG.dy.up)||80;}
/* điểm đến đi dạo: trong khung, không vào ô HUD, không sát thú; null nếu thử 30 lần không được */
function pickChar(I,gc){
  var T=root.TTGSANH,Z=T&&T.zone?T.zone():null,k,x,cy;
  if(!Z)return null;
  for(k=0;k<30;k++){
    x=rnd(Z.xl+CFG.box.w,Z.xr-CFG.box.w);cy=-upMax()*Math.pow(Math.random(),1.15);
    if(Math.hypot(x-S.x,(cy-S.cy)*1.4)<40)continue;
    if(Math.hypot(x-I.px,(cy-I.dy)*1.5)<CFG.wander.minPet)continue;
    if(!freeC(x,cy,gc)||!pathC(S.x,S.cy,x,cy,gc))continue;
    return {x:x,cy:cy};}
  return null;}
/* chỗ đứng khi vuốt thú: cạnh thú, cùng đường đất với thú (cy = độ lệch của thú); bên nào vướng HUD/tường thì sang bên kia */
function patTarget(I,gc){
  var x=I.px+S.side*CFG.gapGan;
  if(!freeC(x,I.dy,gc)){S.side=-S.side;x=I.px+S.side*CFG.gapGan;}
  return {x:x,cy:I.dy};}
function vuot(ts){if(S.pat)return;S.pat={st:'di',t0:ts};S.w=null;S.nextTT=ts+rr(CFG.tuongTac);}
function chao(ts){S.front=ts+CFG.thoiMat.truoc;S.hop={t0:ts,n:1,dur:420,h:9};say(ts,take('chao'));S.w=null;S.wait=Math.max(S.wait,S.front+rr(CFG.wander.nghi));}
function tuNoi(ts,P){
  S.nextTalk=ts+rr(CFG.tuDong);
  if(P.chat||S.bong)return;                          /* thú đang nói thì thôi, khỏi chồng bong bóng */
  if(Math.random()<CFG.chance.emo/(CFG.chance.emo+CFG.chance.noi))say(ts,null,pick(EMO));else say(ts,take('tuNoi'));}
function onTap(e){
  try{
    var cv=S.cv,m=S.m,I=S.info;if(!CFG.on||!cv||!m||!I||!I.o||S.x==null||performance.now()-S.last>300)return;
    var rc=cv.getBoundingClientRect();if(!rc.width||!rc.height)return;
    var cx=(e.clientX-rc.left)*cv.width/rc.width,cy=(e.clientY-rc.top)*cv.height/rc.height,lx=(cx-m.e)/m.a,ly=(cy-m.f)/m.d,ts=performance.now();
    var k=CFG.kich,fy=S.gy+S.cy;
    if(Math.abs(lx-S.x)<k*.34&&ly>fy-k*.95&&ly<fy+6){chao(ts);return;}   /* chạm nhân vật */
    if(Math.abs(lx-I.px)<46&&ly>I.foot-112&&ly<I.foot+6)vuot(ts);        /* chạm thú (TTGSANH tự cho thú phản ứng) */
  }catch(err){}}

/* ---------- API vẽ (gọi mỗi khung hình ở sảnh, sau petSanh) ---------- */
function draw(c,ts,gy){
  try{
    if(!CFG.on||!root.TTGSANH||!TTGSANH.info)return;
    var I=TTGSANH.info();if(!I||!I.o||!(ts-I.seen<200))return;
    var side=strip('phai');if(!side)return;
    var o=I.o,P={px:I.px,chat:I.chat},k=CFG.kich,dt=S.last?Math.min(.05,(ts-S.last)/1000):.016,away=S.last?ts-S.last:0;
    gy-=CFG.nang;S.gy=gy;S.m=c.getTransform?c.getTransform():null;S.cv=c.canvas;S.info=I;
    /* quay lại sau khi tab bị ẩn / rời sảnh lâu: dời mọi mốc thời gian để không dồn cục */
    if(away>1500){var sh=away-16;S.nextTalk+=sh;S.nextTT+=sh;S.wait+=sh;if(S.front)S.front+=sh;if(S.pat)S.pat.t0+=sh;if(S.hop)S.hop.t0+=sh;}
    S.last=ts;
    if(!S.bound&&c.canvas){S.bound=true;c.canvas.addEventListener('pointerdown',onTap,{passive:true});}
    if(S.x==null){
      S.x=I.px-CFG.gap;S.cy=I.dy;
      if(!freeC(S.x,S.cy,gy)){S.x=I.px+CFG.gap;if(!freeC(S.x,S.cy,gy)){var p0=pickChar(I,gy);if(p0){S.x=p0.x;S.cy=p0.cy;}}}
      S.nextTalk=ts+rr(CFG.tuDong);S.nextTT=ts+rr(CFG.tuongTacDau);S.wait=ts+rr(CFG.wander.nghi);}
    /* đổi cỡ màn hình làm chỗ đứng hiện tại thành vùng cấm: dời sang chỗ hợp lệ */
    if(!freeC(S.x,S.cy,gy)){var rp=pickChar(I,gy);if(rp){S.x=rp.x;S.cy=rp.cy;S.w=null;}}
    /* chọn đích: đang vuốt thú -> tới cạnh thú (thú đứng yên chờ); vừa bị chạm -> đứng nhìn người chơi; còn lại -> đi dạo riêng */
    var pt=S.pat,tgt=null,moving=false,vx=0,vy=0,arrived=true,dxx,dyy,dd;
    if(pt&&pt.st==='di'){tgt=patTarget(I,gy);try{TTGSANH.hold(2500);}catch(e0){}}
    else if(pt){try{TTGSANH.hold(2000);}catch(e0){}}
    else if(ts>=S.front){
      if(!S.w&&ts>=S.wait){S.w=pickChar(I,gy);if(!S.w)S.wait=ts+1500;}
      tgt=S.w;}
    if(tgt){
      dxx=tgt.x-S.x;dyy=tgt.cy-S.cy;dd=Math.hypot(dxx,dyy);
      if(dd>3){var stp=Math.min(dd,CFG.toc*(pt?1.35:CFG.wander.toc)*dt);vx=dxx/dd;vy=dyy/dd;S.x+=vx*stp;S.cy+=vy*stp;moving=true;arrived=false;}
      else if(!pt&&S.w===tgt){S.w=null;S.wait=ts+rr(CFG.wander.nghi);}}   /* tới nơi: đứng nghỉ rồi mới đi tiếp */
    if(!moving&&S.walking)S.t0=ts;
    S.walking=moving;
    var vert=moving&&Math.abs(vy)>Math.abs(vx)*1.25;   /* đi chủ yếu lên/xuống: dùng khung quay lưng / chính diện */
    if(!vert)S.face=moving?(vx>=0?1:-1):(I.px>=S.x?1:-1);   /* đi ngang thì hướng đi, đứng thì hướng về thú */
    /* vuốt ve: tới gần thú thì bắt đầu nhảy + tim, xong thì thôi và hai bên lại đi riêng */
    if(pt){
      if(pt.st==='di'){if(arrived||ts-pt.t0>6500){pt.st='vuot';pt.t0=ts;pt.h=0;S.hop={t0:ts,n:2,dur:380,h:7};
          try{TTGSANH.say('vui');}catch(e1){}say(ts,take('vuot'));}}
      else if(pt.st==='vuot'){
        if(ts-pt.h>260){pt.h=ts;heart(ts,I.px,I.foot-92);}
        if(ts-pt.t0>1500){S.pat=null;S.w=null;S.wait=ts+rr([1200,2600]);S.nextTT=ts+rr(CFG.tuongTac);}}}
    else{
      if(ts>=S.nextTT){if(I.chat)S.nextTT=ts+4000;else vuot(ts);}   /* LÂU LÂU mới tương tác với thú 1 lần */
      else if(ts>=S.nextTalk)tuNoi(ts,P);}
    /* nhún nhảy */
    var oy=0,sy=1,sxs=1;
    if(S.hop){var e=ts-S.hop.t0,i=Math.floor(e/S.hop.dur);
      if(i>=S.hop.n)S.hop=null;else{var u=(e-i*S.hop.dur)/S.hop.dur;oy=-S.hop.h*Math.sin(Math.PI*u);sy=1+.04*Math.sin(Math.PI*u);sxs=1-.03*Math.sin(Math.PI*u);}}
    if(!S.hop&&!moving)oy=Math.sin(ts/420)*.9;      /* thở nhẹ */
    /* chọn dải khung: bị chạm thì nhìn ra người chơi; đi dọc thì chính diện / quay lưng */
    var front=ts<S.front&&!moving?strip('truoc'):null,img=front||side,fi=moving?Math.floor((ts-S.t0)/1000*CFG.fps)%4:1,face=front?1:S.face;
    if(vert){var vi=strip(vy>0?'truoc':'sau');if(vi){img=vi;face=1;}}
    var ds=1-(TTGSANH.CFG&&TTGSANH.CFG.depth||0)*clamp(-S.cy/upMax(),0,1),fy=gy+S.cy;   /* đi lên (xa) thì nhỏ dần giống thú */
    c.save();
    c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(S.x,fy-1,k*.22*ds,k*.05*ds,0,0,Math.PI*2);c.fill();   /* bóng dưới chân */
    c.translate(S.x,fy+k*.03*ds+oy);c.scale(face*sxs*ds,sy*ds);
    c.drawImage(img,fi*512,0,512,512,-k/2,-k,k,k);
    c.restore();
    drawHearts(c,ts);
    drawBong(c,ts,o,S.x,fy-k*.95*ds+oy);
  }catch(err){try{c.restore();}catch(e2){}}}

/* ---------- [26/11/2026] NHÂN VẬT TRONG TRẬN ĐẤU: đứng phía SAU thú của bạn, ra lệnh khi thú tấn công ----------
   Ảnh (512x512, nền trong suốt, chân sát đáy, cùng một thân để 2 dáng khớp nhau): game-moi/nhan-vat/<gioi>/<skin>-tran-tu-the.png (đứng chờ sau lưng thú)
   và <skin>-tran-ra-lenh.png (chỉ tay ra lệnh, lúc thú tấn công). Chưa có ảnh (vd nhân vật Nữ) thì trong trận không vẽ gì, y như cũ.
   KHÔNG SỬA index.html: tự gắn vào 2 chỗ đã có sẵn bằng cách bọc hàm (giống 83-sanh-song.js bọc TTGRUNE.ring):
   - TTGDEM.under(ctx,ts,DA) (69-dem-nguoc.js) mỗi khung hình của trận; DA = khung trên {x,y,w,h}. Từ DA suy ra chỗ đứng của thú bạn bằng PET_X + FLOOR của index.html (ghi ở CFG.tran.petX / floor: index đổi thì đổi theo).
   - TTGCombatFX.drawAttack(ctx,t,o) (31-combat-fx.js): o.pa = true là thú CỦA BẠN đang đánh (o.u = tiến độ 0..1) -> nhân vật đổi sang dáng ra lệnh tới khi đòn đi được lenhU, rồi giữ thêm lenhTre ms.
   CHỈNH: khối CFG.tran bên dưới. ?nvtran=0 trong link để tắt riêng trong trận. Mọi lỗi đều bị nuốt (try/catch). */
CFG.tran={
  on:!/[?&]nvtran=0/.test(location.search),
  kich:124,                /* cỡ ô vẽ nhân vật trong trận (điểm game); sảnh vẫn 92. Thú vẽ 128 nên 120-130 là ngang tầm thú */
  nang:9,                  /* nâng chân ngang chân thú (thú trong trận cũng được nâng PET_LIFT=16) */
  gap:100,                 /* cách tâm thú về phía SAU thú (bên trái) bao nhiêu điểm; tăng = đứng xa thú hơn */
  le:30,                     /* chừa lề trái khung (viền khung + nửa thân) */
  petX:.218,floor:22,      /* = PET_X và FLOOR trong index.html (vị trí thú bạn trong khung trên, độ dày nền đất) */
  lenhU:.5,lenhTre:180,    /* giữ dáng ra lệnh khi đòn của thú chạy tới u<lenhU (0..1), rồi giữ thêm bấy nhiêu ms */
  vao:450                  /* hiện dần + trượt vào lúc vào trận (ms) */
};
var TR={seen:0,t0:0,lenh:0,was:false,hop:null,x:null,fy:0};
function tranSrc(loai){var N=root.TTGNHANVAT;if(!N||!N.gioi)return null;var g=N.gioi(),s=N.skin();if(N.daMo&&!N.daMo(g,s))s='mac-dinh';return 'game-moi/nhan-vat/'+g+'/'+s+'-tran-'+loai+'.png?v=1';}
function tranImg(loai){
  var src=tranSrc(loai);if(!src)return null;var e=IMG[src];
  if(!e){e=IMG[src]={img:new Image(),ok:false,bad:false};e.img.onload=function(){e.ok=true;};e.img.onerror=function(){e.bad=true;};e.img.src=src;}
  return(e.ok&&!e.bad)?e.img:null;}
/* thú của bạn đang đánh (gọi từ drawAttack đã bọc) */
function noteAtk(u){if(u<CFG.tran.lenhU)TR.lenh=performance.now()+CFG.tran.lenhTre;}
function drawTran(c,ts,da){
  var Q=CFG.tran;if(!CFG.on||!Q.on||!da||!(da.w>0))return;
  var stI=tranImg('tu-the'),li=tranImg('ra-lenh');if(!stI)return;   /* gọi cả 2 mỗi khung để ảnh được tải sẵn từ lúc vào trận */
  var now=performance.now(),k=Q.kich;
  if(now-TR.seen>600){TR.t0=now;TR.lenh=0;TR.was=false;TR.hop=null;}   /* vừa vào trận mới */
  TR.seen=now;
  var pet=Math.round(da.x+da.w*Q.petX),fy=da.h-Q.floor-Q.nang,x=Math.max(da.x+Q.le+k*.3,pet-Q.gap);
  var cmd=now<TR.lenh,img=(cmd&&li)?li:stI;
  if(cmd&&!TR.was)TR.hop={t0:now,dur:300,h:6};
  TR.was=cmd;
  var oy=0,e=now-TR.t0,al=Math.min(1,e/Q.vao),slide=(1-al)*(1-al)*26;
  if(TR.hop){var u=(now-TR.hop.t0)/TR.hop.dur;if(u>=1)TR.hop=null;else oy=-TR.hop.h*Math.sin(Math.PI*u);}
  else if(!cmd)oy=Math.sin(ts/420)*.9;      /* thở nhẹ */
  TR.x=x;TR.fy=fy;
  c.save();c.globalAlpha=al;
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(x-slide,fy-1,k*.22,k*.05,0,0,Math.PI*2);c.fill();   /* bóng dưới chân */
  c.imageSmoothingEnabled=true;
  c.drawImage(img,0,0,512,512,x-slide-k/2,fy+k*.03+oy-k,k,k);
  c.restore();}
/* bọc 2 hàm có sẵn để không phải sửa index.html; hàm gốc vẫn chạy đủ (chỉ thêm 1 bước phụ phía trước) */
function hookFx(){var A=root.TTGCombatFX;if(!A||!A.drawAttack)return false;if(A.drawAttack.__nv)return true;
  var o=A.drawAttack;
  A.drawAttack=function(c,t,p){try{if(p&&p.pa&&!p.text&&p.u>=0&&p.u<1)noteAtk(p.u);}catch(e){}return o.apply(this,arguments);};
  A.drawAttack.__nv=1;return true;}
function hookUnder(){var D=root.TTGDEM;if(!D||!D.under)return false;if(D.under.__nv)return true;
  var o=D.under;
  D.under=function(c,ts,da){try{drawTran(c,ts,da);}catch(e){try{c.restore();}catch(e2){}}return o.apply(this,arguments);};
  D.under.__nv=1;return true;}
function hookAll(){var a=hookFx(),b=hookUnder();return a&&b;}
hookAll();setInterval(hookAll,1000);   /* module nạp muộn / bị thay thì tự gắn lại (đã gắn rồi thì bỏ qua) */
root.TTGNVSANH={CFG:CFG,LINES:LINES,draw:draw,pos:function(){return S.x==null?null:{x:S.x,fy:S.gy+S.cy};},vuot:function(){vuot(performance.now());},chao:function(){chao(performance.now());},
  tran:{pos:function(){return TR.x==null?null:{x:TR.x,fy:TR.fy};},lenh:function(){TR.lenh=performance.now()+700;}}};   /* tran.lenh(): thử dáng ra lệnh bằng tay (gõ TTGNVSANH.tran.lenh() trong console lúc đang ở trận) */
})(window);
