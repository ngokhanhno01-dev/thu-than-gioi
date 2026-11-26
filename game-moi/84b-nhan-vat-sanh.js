/* ===== 84b-nhan-vat-sanh.js (TTGNVSANH): NHÂN VẬT ĐỨNG CHUNG VỚI THÚ Ở SẢNH + TƯƠNG TÁC (26/11/2026) =====
   Nhân vật người chơi đã chọn (64b-chon-nhan-vat.js, kèm skin) đứng cạnh thú ở khung trên của sảnh, mặt hướng về thú:
   - Thú nhảy sang chỗ khác thì nhân vật đi theo (dùng khung đi bộ ngang, 8 khung/giây), tới nơi thì đứng thở nhẹ.
   - CHẠM VÀO THÚ: nhân vật chạy lại gần, vuốt ve thú (nhảy nhẹ 2 lần, trái tim bay lên), thú phản ứng + nói 1 câu vui (TTGSANH.say).
   - CHẠM VÀO NHÂN VẬT: nhân vật quay mặt ra phía người chơi (ảnh chính diện), nhảy chào và nói 1 câu trong bong bóng.
   - TỰ ĐỘNG: thỉnh thoảng nhân vật hiện emoji nhỏ, nói 1 câu, hoặc tự đi vuốt thú (khi thú đang không nói để khỏi chồng bong bóng).
   NỐI VỚI index.html: dòng vẽ sảnh gọi TTGNVSANH.draw(ctx,ts,groundY) ngay sau petSanh (nhân vật nằm trên thú, dưới bong bóng của thú).
   Cần: TTGSANH.info() (83-sanh-song.js) cho vị trí thú; TTGNHANVAT.anhDi() (64b) cho dải khung 512x512 x 4. Thiếu một trong hai hoặc ảnh chưa tải xong thì không vẽ gì (sảnh y như cũ).
   CHỈNH: khối CFG bên dưới (cỡ, khoảng cách tới thú, tốc độ đi) và bảng LINES / EMO (thêm câu = thêm 1 chuỗi). Mọi lỗi đều bị nuốt (try/catch). ?nvsanh=0 trong link để tắt (thử so sánh). */
(function(root){'use strict';
var CFG={
  on:!/[?&]nvsanh=0/.test(location.search),
  kich:92,              /* cỡ ô vuông vẽ nhân vật (điểm game); nhân vật cao ~92% ô */
  gap:78,gapGan:36,     /* khoảng cách ngang tới thú khi đứng chờ / khi vuốt ve */
  toc:92,               /* tốc độ đi (điểm game/giây) */
  fps:8,                /* khung đi bộ mỗi giây */
  tuDong:[9000,18000],  /* nghỉ giữa 2 việc tự động (ms) */
  chance:{emo:.4,noi:.35,vuot:.25},
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
var S={m:null,cv:null,bound:false,x:null,face:1,side:-1,walking:false,t0:0,next:0,bong:null,hearts:[],front:0,pat:null,hop:null,bag:{},last:0,info:null};
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
function drawBong(c,ts,o,cx,top){
  var b=S.bong;if(!b)return;var age=ts-b.t0;if(age<0)return;
  if(age>b.dur+250){S.bong=null;return;}
  var alpha=1,fade=b.dur+250-age;if(fade<250)alpha=Math.max(0,fade/250);
  var sc=age<260?.4+.6*Math.min(1,age/260)+.12*Math.sin(Math.min(1,age/260)*Math.PI):1;
  c.save();c.globalAlpha=alpha;
  if(b.text){
    c.font=CFG.bong.font;
    if(!b.lay){var L=wrap(c,b.text,CFG.bong.maxW),w=0,i;for(i=0;i<L.length;i++)w=Math.max(w,c.measureText(L[i]).width);b.lay={L:L,w:Math.ceil(w)+CFG.bong.pad*2,h:L.length*CFG.bong.lh+CFG.bong.pad*2-2};}
    var w2=b.lay.w,h2=b.lay.h,bx=clamp(cx-w2/2,o.l+6,Math.max(o.l+6,o.r-6-w2)),by=Math.max(o.t+26,top-h2-10),tx=clamp(cx,bx+12,bx+w2-12);
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
    c.font='16px sans-serif';var w3=30,h3=26,ex=clamp(cx,o.l+w3/2+6,o.r-w3/2-6),ey=Math.max(o.t+26,top-h3-8)+Math.sin(ts/260)*1.2;
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
function targetX(P,o){
  var gap=S.pat&&S.pat.st!=='xong'?CFG.gapGan:CFG.gap,L=o.l+34,R=o.r-34;
  /* đứng bên trái thú; sát tường trái thì sang phải (đổi bên có độ trễ để khỏi nhảy qua lại) */
  if(S.side<0&&P.px-gap<L)S.side=1;else if(S.side>0&&P.px+gap>R)S.side=-1;
  return clamp(P.px+S.side*gap,L,R);}
function vuot(ts){if(S.pat)return;S.pat={st:'di',t0:ts};S.next=ts+rr(CFG.tuDong);}
function chao(ts){S.front=ts+CFG.thoiMat.truoc;S.hop={t0:ts,n:1,dur:420,h:9};say(ts,take('chao'));S.next=Math.max(S.next,ts+6000);}
function tuDong(ts,P){
  var r=Math.random(),c=CFG.chance;S.next=ts+rr(CFG.tuDong);
  if(P.chat)return;                                  /* thú đang nói thì thôi, khỏi chồng bong bóng */
  if(r<c.emo)say(ts,null,pick(EMO));
  else if(r<c.emo+c.noi)say(ts,take('tuNoi'));
  else vuot(ts);}
function onTap(e){
  try{
    var cv=S.cv,m=S.m,I=S.info;if(!CFG.on||!cv||!m||!I||!I.o||performance.now()-S.last>300)return;
    var rc=cv.getBoundingClientRect();if(!rc.width||!rc.height)return;
    var cx=(e.clientX-rc.left)*cv.width/rc.width,cy=(e.clientY-rc.top)*cv.height/rc.height,lx=(cx-m.e)/m.a,ly=(cy-m.f)/m.d,ts=performance.now();
    var k=CFG.kich,fy=S.gy;
    if(S.x!=null&&Math.abs(lx-S.x)<k*.34&&ly>fy-k*.95&&ly<fy+6){chao(ts);return;}   /* chạm nhân vật */
    if(Math.abs(lx-I.px)<46&&ly>I.foot-112&&ly<I.foot+6)vuot(ts);                    /* chạm thú (TTGSANH tự cho thú phản ứng) */
  }catch(err){}}

/* ---------- API vẽ (gọi mỗi khung hình ở sảnh, sau petSanh) ---------- */
function draw(c,ts,gy){
  try{
    if(!CFG.on||!root.TTGSANH||!TTGSANH.info)return;
    var I=TTGSANH.info();if(!I||!I.o||!(ts-I.seen<200))return;
    var side=strip('phai');if(!side)return;
    var o=I.o,P={px:I.px,chat:I.chat},k=CFG.kich,dt=S.last?Math.min(.05,(ts-S.last)/1000):.016;
    S.last=ts;S.m=c.getTransform?c.getTransform():null;S.cv=c.canvas;S.info=I;S.gy=gy;
    if(!S.bound&&c.canvas){S.bound=true;c.canvas.addEventListener('pointerdown',onTap,{passive:true});}
    if(S.x==null){S.x=targetX(P,o);S.next=ts+rr(CFG.tuDong);}
    /* mốc thời gian dời theo khi tab bị ẩn lâu */
    if(dt>=.05&&S.next<ts-3000)S.next=ts+rr(CFG.tuDong);
    var tx=targetX(P,o),dx=tx-S.x,moving=false,dir=dx>=0?1:-1;
    if(Math.abs(dx)>3){var st=Math.min(Math.abs(dx),CFG.toc*(S.pat?1.35:1)*dt);S.x+=dir*st;moving=true;}
    if(!moving&&S.walking)S.t0=ts;
    S.walking=moving;
    /* mặt: đang đi thì hướng đi, đứng thì hướng về thú */
    S.face=moving?dir:(I.px>=S.x?1:-1);
    /* vuốt ve: tới gần thú thì bắt đầu nhảy + tim, xong thì thôi */
    var pt=S.pat;
    if(pt){
      if(pt.st==='di'){if(!moving&&Math.abs(S.x-tx)<=4||ts-pt.t0>4500){pt.st='vuot';pt.t0=ts;pt.h=0;S.hop={t0:ts,n:2,dur:380,h:7};
          try{TTGSANH.say('vui');}catch(e1){}say(ts,take('vuot'));}}
      else if(pt.st==='vuot'){
        if(ts-pt.h>260){pt.h=ts;heart(ts,I.px,I.foot-92);}
        if(ts-pt.t0>1500){pt.st='xong';S.pat=null;}}}
    else if(ts>=S.next)tuDong(ts,P);
    /* nhún nhảy */
    var oy=0,sy=1,sxs=1;
    if(S.hop){var e=ts-S.hop.t0,i=Math.floor(e/S.hop.dur);
      if(i>=S.hop.n)S.hop=null;else{var u=(e-i*S.hop.dur)/S.hop.dur;oy=-S.hop.h*Math.sin(Math.PI*u);sy=1+.04*Math.sin(Math.PI*u);sxs=1-.03*Math.sin(Math.PI*u);}}
    if(!S.hop&&!moving)oy=Math.sin(ts/420)*.9;      /* thở nhẹ */
    /* chọn dải khung: bị chạm thì nhìn ra người chơi */
    var front=ts<S.front&&!moving?strip('truoc'):null,img=front||side,fi=moving?Math.floor((ts-S.t0)/1000*CFG.fps)%4:1,face=front?1:S.face;
    c.save();
    c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(S.x,gy-1,k*.22,k*.05,0,0,Math.PI*2);c.fill();   /* bóng dưới chân */
    c.translate(S.x,gy+k*.03+oy);c.scale(face*sxs,sy);
    c.drawImage(img,fi*512,0,512,512,-k/2,-k,k,k);
    c.restore();
    drawHearts(c,ts);
    drawBong(c,ts,o,S.x,gy-k*.95+oy);
  }catch(err){try{c.restore();}catch(e2){}}}

root.TTGNVSANH={CFG:CFG,LINES:LINES,draw:draw,vuot:function(){vuot(performance.now());},chao:function(){chao(performance.now());}};
})(window);
