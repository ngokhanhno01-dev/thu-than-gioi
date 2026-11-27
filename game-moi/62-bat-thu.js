/* 62-bat-thu.js — BẮT THÚ (Bước 3): nút Bắt, giao diện Ném, khung chọn châu, hoạt ảnh bóng, kết quả.
   Cần nạp sau 58-bong-bat.js, 61-tham-hiem-tran.js (dùng TTGBONG, TTGBALO, TTGCS, TTGTHU, THU_MOI).
   index.html nối vào bằng: TTGBAT.attach(host), TTGBAT.frame(ts) (đầu draw), TTGBAT.draw(ctx,ts) (sau khi vẽ thú), TTGBAT.enemyFx(ts) (trong pet('en')).
   LUỒNG (27/11/2026): đánh thú hoang (nguồn demo, kể cả boss thú hoang; KHÔNG gồm thú Thần) HẾT MÁU -> index.html gọi TTGBAT.hoi(enemy, xong) -> thú nằm gục mờ,
   thanh nhỏ dưới đáy: [Giết] [đếm 30s] [Bắt]. Bắt -> khung chọn châu (số lượng + % từng châu) -> Chọn = NÉM luôn: bóng bay -> TRÚNG -> BẬT NGƯỢC -> MỞ -> HÚT -> ĐÓNG+RƠI -> RUNG -> thành công / vỡ.
   Tối đa CFG.tx.soLanNem (2) lần, mỗi lần 1 châu, trúng thì dừng. 30 giây DÙNG CHUNG cho chọn + ném (không đếm lại), đang bay/hút/rung thì không xét hết giờ.
   Kết quả trả về xong(kq): 'giet' (bấm Giết, hoặc hết giờ khi CHƯA ném lần nào) | 'bat' (bắt được) | 'chay' (hụt hết lượt, hoặc hết giờ khi đã ném hụt). index.html phát thưởng theo kq.
   Thành công: thú vào kho bậc tiến hóa 1, Rank = Rank lúc gặp (châu thường) hoặc TTGBONG.rankKhiBat (châu Đặc Biệt, TẠM).
   ẢNH châu: game-moi/img/chau/bac{1..6}-{closed,absorbing,shaking,success,failed}.png (nền trong suốt, sinh từ chau-bac{N}.png bằng tools/cat_chau_vfx.py). Mã nội bộ: dong=closed, mo=absorbing, rung=shaking, thanhcong=success, thatbai=failed.
   CHUỖI THU PHỤC: closed (bay tới) > absorbing + VFX hút hut-vao-bac[N] (62b-hut-vfx.js) > shaking (rung ngang 3 nhịp, tắt VFX) > success (vòng trận pháp ~1.3s) / failed (vỡ, mờ dần, hiện lại thú). */
(function(root){
'use strict';

/* ================= CFG: CHỈNH Ở ĐÂY ================= */
var CFG={
  dir:'game-moi/img/chau/',
  file:{dong:'closed',mo:'absorbing',rung:'shaking',thanhcong:'success',thatbai:'failed'},   /* mã trạng thái nội bộ > tên file */
  /* THEO TỪNG BẬC (sinh tự động bởi tools/cat_chau_vfx.py > img/chau/meta.json): sc = đơn vị game / pixel (quả châu closed ~42 đơn vị, MỌI trạng thái cùng tỉ lệ nên không méo/lệch cỡ); mỗi trạng thái = điểm neo [x,y] theo TỈ LỆ ảnh (mo = tâm lõi pha lê, thanhcong = tâm quả châu phía trên vòng trận, còn lại = tâm ảnh) */
  meta:{1:{"sc":0.16342,"dong":[0.5008,0.4996],"mo":[0.5031,0.4196],"rung":[0.5003,0.5007],"thanhcong":[0.5019,0.4308],"thatbai":[0.4998,0.5007]},2:{"sc":0.14533,"dong":[0.5003,0.4993],"mo":[0.5003,0.4372],"rung":[0.5,0.5],"thanhcong":[0.5379,0.3361],"thatbai":[0.5,0.4993]},3:{"sc":0.15613,"dong":[0.5004,0.5],"mo":[0.4978,0.3646],"rung":[0.4994,0.5007],"thanhcong":[0.4989,0.3567],"thatbai":[0.5005,0.5]},4:{"sc":0.15672,"dong":[0.4996,0.4996],"mo":[0.5003,0.406],"rung":[0.5,0.5003],"thanhcong":[0.5181,0.4638],"thatbai":[0.5,0.5006]},5:{"sc":0.15789,"dong":[0.5,0.4996],"mo":[0.4935,0.4496],"rung":[0.5,0.5003],"thanhcong":[0.5126,0.2907],"thatbai":[0.4995,0.5006]},6:{"sc":0.14094,"dong":[0.5007,0.4994],"mo":[0.5067,0.3622],"rung":[0.5,0.5006],"thanhcong":[0.5004,0.453],"thatbai":[0.5002,0.4994]}},
  macDinh:'cao',                   /* châu chọn sẵn khi vào giao diện Ném: 'cao' = bậc cao nhất đang có (dùng được), 'thap' = thấp nhất */
  t:{bay:750,trung:150,bat:450,mo:400,hut:1400,roi:350,rung:2900,ok:1300,fail:1200},   /* thời gian từng giai đoạn (ms): bay > trúng > bật ngược > mở > hút > đóng+rơi > rung lắc > ok/fail. hut: 1000 -> 1400 để kịp nhìn rõ 6 kiểu hút riêng */
  to:1.3,                          /* phóng to châu ở giai đoạn rơi / rung / thành công / thất bại (1 = cỡ gốc) */
  rung:{dot:3,lac:600,nghi:300},   /* RUNG: 3 nhịp, mỗi nhịp lắc ngang 600ms rồi nghỉ 300ms (nhịp sau mạnh hơn); phần dư của t.rung là nghỉ cuối */
  bat:{dx:-144,dy:-40},              /* điểm bóng lơ lửng sau khi bật ngược, lệch so với thú (đơn vị game; dx âm = về phía người chơi) */
  mau:['#00E5FF','#00E676','#FF9100','#D500F9','#7C4DFF','#FFD600'],   /* màu ánh sáng theo bậc châu 1..6 (Thủy · Mộc · Hỏa · Lôi · Thiên Hà · Hỗn Độn); màu chi tiết từng bậc nằm ở TTGHUT.TIERS (62b-hut-vfx.js) */
  mauBac:{E:'#ffffff',D:'#3dff6a',C:'#3fa9ff',B:'#b36bff',A:'#ffd21f',S:'#ff8a1f',SS:'#ff3030',SR:'#ff5cf0'}
};
var host=null,els=null,IMGS={};
/* VFX HÚT mới nằm ở 62b-hut-vfx.js (TTGHUT), nạp động ngay cạnh file này. Chưa nạp xong / lỗi => tự dùng 6 hiệu ứng hút cũ bên dưới làm dự phòng. */
(function(){try{var cs=document.currentScript,sc=document.createElement('script');sc.src=(cs&&cs.src?cs.src.replace(/[^\/?#]*([?#].*)?$/,''):'game-moi/')+'62b-hut-vfx.js';sc.async=false;document.head.appendChild(sc);}catch(e){}})();
var S={mode:'off',t0:0,cap:1,capUsed:1,left:0,time:0,sel:false,win:false,last:0,got:null,selCap:1,key:'',nem:0,cb:null,e:null};

/* ================= TIỆN ÍCH ================= */
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function txc(){return (root.TTGBONG&&TTGBONG.CFG&&TTGBONG.CFG.tx)||{};}
function nLan(){return Number(txc().soLanNem)||2;}
function nGiay(){return Number(txc().thoiGianChonGiay)||30;}
function nBong(){return Number(txc().bongMoiLanNem)||1;}
function battle(){return host&&host.battle?host.battle():null;}
function enemy(){if(S.e)return S.e;var b=battle();return b&&b.enemy||null;}
function toast(t){if(host&&host.toast)host.toast(t);else{try{console.log(t);}catch(e){}}}
function itemOf(cap){var B=root.TTGBALO;return B&&B.CAT?B.CAT[TTGBONG.idBong(cap)]:null;}
function countOf(cap){return root.TTGBALO?TTGBALO.count(TTGBONG.idBong(cap)):0;}
function hiemOf(e){return (root.TTGCS&&TTGCS.doHiem&&TTGCS.doHiem(e.id))||e.rarity||'thuong';}   /* độ hiếm LOÀI (56b) trước; e.rarity của boss bị ép 'truyenthuyet' */
function rateOf(cap){var e=enemy();if(!e)return null;return TTGBONG.tiLeBat(cap,e.boss?'truyenthuyet':hiemOf(e),e.vung||0);}
function owned(){var a=[],c;for(c=1;c<=TTGBONG.CFG.capBongMax;c++)if(countOf(c)>0)a.push(c);return a;}
function usable(){return owned().filter(function(c){return rateOf(c)!=null;});}
function pickDefault(){var u=usable();if(!u.length)return 0;return CFG.macDinh==='thap'?u[0]:u[u.length-1];}
function icHtml(it){return it&&it.img?'<img src="'+esc(it.img)+'" alt="">':'<b>'+esc((it&&it.ic)||'?')+'</b>';}

/* ================= ẢNH CHÂU ================= */
function sprites(cap){
  if(IMGS[cap])return IMGS[cap];
  var o={};
  Object.keys(CFG.file).forEach(function(n){var im=new Image();im.ok=false;im.onload=function(){im.ok=true;};im.src=CFG.dir+'bac'+cap+'-'+CFG.file[n]+'.png';o[n]=im;});
  IMGS[cap]=o;return o;
}
function pic(cap,n){
  var o=sprites(cap)[n];return o&&o.ok?{im:o}:null;   /* chưa nạp xong ảnh => vẽ hình tròn tạm (không còn đổi màu ảnh bậc khác) */
}
function spr(ctx,n,cap,x,y,sc,rot,alpha){
  var p=pic(cap,n),r=20;
  ctx.save();
  if(alpha!=null)ctx.globalAlpha=alpha;
  if(!p){ctx.translate(x,y);ctx.fillStyle='#4fc3d9';ctx.strokeStyle='#103c52';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*sc,0,6.2832);ctx.fill();ctx.stroke();ctx.restore();return false;}
  var im=p.im,M=CFG.meta[cap]||CFG.meta[1],k=M.sc*sc,w=im.naturalWidth*k,h=im.naturalHeight*k,a=M[n]||[.5,.5];   /* một hệ số k cho cả 2 chiều => KHÔNG méo tỉ lệ */
  ctx.imageSmoothingEnabled=true;try{ctx.imageSmoothingQuality='high';}catch(e){}
  ctx.translate(x,y);if(rot)ctx.rotate(rot);
  ctx.drawImage(im,-w*a[0],-h*a[1],w,h);
  ctx.restore();return true;
}

/* ================= TRẠNG THÁI ================= */
/* thú này có được hỏi Bắt/Giết không: chỉ thú hoang (nguồn demo, kể cả boss thú hoang); quái main, NPC boss, thú Thần (chỉ có từ trứng) thì không */
function catchable(e){
  if(!e||e.source!=='demo'||!root.TTGBONG||!TTGBONG.tiLeBat)return false;
  return TTGBONG.tiLeBat(1,e.boss?'truyenthuyet':hiemOf(e),e.vung||0)!=null;
}
/* index.html gọi khi thắng trận. Trả về true = module nhận xử lý và SẼ gọi xong(kq) đúng 1 lần; false = index.html tự phát thưởng giết như cũ */
function hoi(e,xong){
  if(!host||S.mode!=='off'||!catchable(e)||typeof xong!=='function')return false;
  S.e=e;S.cb=xong;S.nem=0;S.left=nLan();S.time=nGiay()*1000;S.sel=false;S.got=null;S.cap=pickDefault();S.mode='hoi';S.t0=performance.now();S.key='';
  return true;
}
function done(kq){   /* kết thúc, trả kết quả về index.html đúng 1 lần */
  var cb=S.cb;S.cb=null;abort();S.e=null;
  if(cb)try{cb(kq);}catch(x){try{console.error(x);}catch(y){}}
}
function abort(){S.mode='off';S.sel=false;if(els){els.sel.className='bts';els.res.className='btr';}}
function kill(){if(S.mode==='hoi'||S.mode==='ready')done('giet');}
function start(){   /* bấm BẮT trên thanh: mở khung chọn châu */
  if(S.mode!=='hoi')return;
  if(!owned().length){toast('Hết Ngự Thú Châu');return;}
  S.mode='ready';openSel();
}
function hetGio(){done(S.nem>0?'chay':'giet');toast(S.nem>0?'Hết giờ, thú hoang đã chạy mất!':'Hết giờ: tính là Giết');}
function doThrow(){
  if(S.mode!=='ready')return;
  var cap=S.cap,r=rateOf(cap);
  if(!cap||countOf(cap)<=0){toast('Hết châu này');return;}
  if(r==null){toast('Châu này không dùng được ở đây');return;}
  closeSel();
  TTGBALO.add(TTGBONG.idBong(cap),-nBong());
  sprites(cap);if(root.TTGHUT&&TTGHUT.preload)TTGHUT.preload(cap);   /* nạp sẵn sprite + texture VFX của bậc này trước khi tới pha hút */
  S.left--;S.nem++;S.capUsed=cap;S.win=Math.random()<r;S.mode='fly';S.t0=performance.now();
}
function bacBat(e){   /* Rank thú nhận khi bắt = ĐÚNG Rank đã tung lúc gặp (e.bac, hiện ở thanh máu). Chỉ khi thiếu/lạ mới tung dự phòng. */
  var ok=e&&e.bac&&root.TTGCS&&TTGCS.BAC&&TTGCS.BAC.indexOf(e.bac)>=0;
  var b=ok?e.bac:((root.TTGCS&&TTGCS.tungBac)?TTGCS.tungBac():'E');
  return (root.TTGBONG&&TTGBONG.rankKhiBat)?TTGBONG.rankKhiBat(S.capUsed,b):b;   /* châu Đặc Biệt (5, 6): tung lại Rank trong khoảng riêng (TẠM) */
}
function giveBeast(){
  var e=enemy();if(!e)return;
  var bac=bacBat(e),tien=Number(txc().bacKhiBat)||1,uid=null;
  try{uid=TTGTHU.add({id:e.id,ten:e.ten,bac:bac,tien:tien,lv:e.lv,chiso:{},kn:[null,null,null,null,null,null]});}catch(x){}
  S.got={uid:uid,id:e.id,ten:e.ten,bac:bac,tien:tien,lv:e.lv,boss:!!e.boss};
}
function afterFail(){
  if(S.time<=0){hetGio();return;}
  if(S.left>0){
    if(!(countOf(S.cap)>0&&rateOf(S.cap)!=null))S.cap=pickDefault();
    S.mode='hoi';S.sel=false;S.t0=performance.now();S.key='';toast('Thú thoát ra! Còn '+S.left+' lần ném');
  }else{done('chay');}
}

/* ================= FRAME / ENEMY FX / DRAW ================= */
function frame(ts){
  if(!host)return;
  var dt=Math.min(100,Math.max(0,ts-(S.last||ts)));S.last=ts;
  if(S.mode!=='off'&&(host.scene()!=='tran'||!battle())){S.cb=null;S.e=null;abort();}   /* trận bị hủy ngoài ý muốn: bỏ, không gọi xong */
  var t=Math.max(0,ts-S.t0),T=CFG.t;
  if(S.mode==='hoi'||S.mode==='ready'){S.time-=dt;if(S.time<=0)hetGio();}   /* 30 giây chung: đếm cả lúc mở khung chọn châu; đang ném thì không đếm */
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
    var j=root.TTGHUT?TTGHUT.beast(ts,t,CFG.t.hut):null;   /* thú rung nhẹ khi bị hút */
    return {a:1-p*.85,s:1-p*.92,dx:CFG.bat.dx*q+(j?j.dx:0),dy:CFG.bat.dy*q+(j?j.dy:0),r:p*3.5,hide:p>=1};}
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
/* ===== HÚT: 6 KIỂU RIÊNG, mỗi bậc châu một chủ đề: 1 Nước xoáy · 2 Dây leo + lá · 3 Lửa · 4 Sét tím · 5 Chòm sao · 6 Hỗn độn (thiên hà cầu vồng).
   Chữ ký chung: (ctx,ts,t,ex,ey,Hx,Hy): ex,ey = chỗ thú; Hx,Hy = miệng châu; t = ms kể từ lúc bắt đầu hút (dài CFG.t.hut). ===== */
function hsh(n){var x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);}   /* ngẫu nhiên cố định theo n (0..1) */
function sm(u){return u*u*(3-2*u);}
function lp(a,b,u){return a+(b-a)*u;}
function xoay(i,u,ts,ex,ey,Hx,Hy,r0,vong,toc){   /* điểm u (0 = thú .. 1 = châu) trên đường xoáy số i: tiến vào châu, quay quanh trục nối, bán kính thu về 0 */
  var e=sm(u),a=i*2.399+u*vong*6.2832+ts*toc,r=r0*(1-e);
  return [lp(ex,Hx,e)+Math.cos(a)*r,lp(ey,Hy,e)+Math.sin(a)*r*.8];
}
function duong(ctx,f,u0,u1,n){ctx.beginPath();for(var k=0;k<=n;k++){var q=f(lp(u0,u1,k/n));if(k)ctx.lineTo(q[0],q[1]);else ctx.moveTo(q[0],q[1]);}}
function hutTong(t){var p=Math.min(1,t/CFG.t.hut);return {p:p,I:.55+.45*p,rev:Math.min(1,t/240)};}   /* p: tiến độ 0..1; I: độ đậm; rev: đoạn đường đã "mọc" ra */

/* 1. THƯƠNG HẢI: dòng nước xoáy + bong bóng + vòng xoáy thu nhỏ quanh thú */
function daiHai(i,u,ts,ex,ey,Hx,Hy){return xoay(i,u,ts,ex,ey,Hx,Hy,34+(i%3)*8,1.6,.0018);}
function hutHai(ctx,ts,t,ex,ey,Hx,Hy){
  var g=hutTong(t),p=g.p,I=g.I,i,k,u,q,P,n,f;
  glow(ctx,Hx,Hy,20+16*p,'#4fd8ff',.3+.4*p);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(i=0;i<3;i++){u=(t/650+i/3)%1;q=6+(1-u)*60;
    ctx.globalAlpha=Math.sin(Math.PI*u)*.6*I;ctx.strokeStyle='#c8f8ff';ctx.lineWidth=.8+2.6*(1-u);
    ctx.beginPath();ctx.ellipse(ex,ey+10,q,q*.36,0,0,6.2832);ctx.stroke();}
  for(i=0;i<5;i++){
    f=(function(ii){return function(uu){return daiHai(ii,uu,ts,ex,ey,Hx,Hy);};})(i);
    for(k=0;k<3;k++){
      ctx.strokeStyle=k===0?'#1a86bd':(k===1?'#5fd4f2':'#f0ffff');ctx.lineWidth=k===0?9:(k===1?4.5:1.8);ctx.globalAlpha=(k===0?.3:(k===1?.75:.95))*I;
      if(k===2){ctx.setLineDash([12,9]);ctx.lineDashOffset=-ts/16;}else ctx.setLineDash([]);
      duong(ctx,f,0,g.rev,44);ctx.stroke();}
  }
  ctx.setLineDash([]);
  n=8+Math.round(10*p);
  for(i=0;i<n;i++){u=(t/700+i*.37)%1;if(u>g.rev)continue;
    P=daiHai(i%5,u,ts,ex,ey,Hx,Hy);q=(2+3*hsh(i+5))*(1-u*.35);
    ctx.globalAlpha=.9*I*Math.min(1,u*6);ctx.fillStyle='rgba(170,240,255,.22)';ctx.strokeStyle='#e8ffff';ctx.lineWidth=1.1;
    ctx.beginPath();ctx.arc(P[0],P[1],q,0,6.2832);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(P[0]-q*.35,P[1]-q*.35,q*.28,0,6.2832);ctx.fill();}
  ctx.restore();
}

/* 2. THANH MỘC: dây leo mọc ra từ châu + lá bay theo dây + phấn hoa */
function vineP(i,u,ts,ex,ey,Hx,Hy){
  var a=i*2.399+1,r0=30+(i%3)*7,sx=ex+Math.cos(a)*r0,sy=ey+Math.sin(a)*r0*.8,dx=Hx-sx,dy=Hy-sy,L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L,amp=15+(i%3)*4,
      off=amp*(1-u)*Math.sin(u*8+i*1.9-ts/170)+amp*.65*Math.sin(Math.PI*u)*(i%2?1:-1);
  return [sx+dx*u+nx*off,sy+dy*u+ny*off];
}
function laFx(ctx,x,y,s,rot,c1,c2){
  ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=c1;ctx.beginPath();ctx.moveTo(-s,0);ctx.quadraticCurveTo(0,-s*.8,s,0);ctx.quadraticCurveTo(0,s*.8,-s,0);ctx.fill();
  ctx.strokeStyle=c2;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-s,0);ctx.lineTo(s*.8,0);ctx.stroke();ctx.restore();}
function hutMoc(ctx,ts,t,ex,ey,Hx,Hy){
  var g=hutTong(t),p=g.p,I=g.I,i,k,u,P,P2,n,f,cl=['#8de85a','#4fb83c','#c8f27a','#35a34a'];
  glow(ctx,Hx,Hy,20+16*p,'#76f36a',.3+.4*p);
  ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
  for(i=0;i<4;i++){
    f=(function(ii){return function(uu){return vineP(ii,uu,ts,ex,ey,Hx,Hy);};})(i);
    for(k=0;k<3;k++){
      ctx.strokeStyle=k===0?'#13501f':(k===1?'#4fb23a':'#c4f580');ctx.lineWidth=k===0?6.5:(k===1?3.4:1.2);ctx.globalAlpha=(k===0?.55:(k===1?.9:.8))*I;
      duong(ctx,f,0,g.rev,44);ctx.stroke();}
  }
  n=14+Math.round(16*p);
  for(i=0;i<n;i++){u=(t/850+i*.618)%1;if(u>g.rev)continue;
    P=vineP(i%4,u,ts,ex,ey,Hx,Hy);P2=vineP(i%4,Math.min(1,u+.03),ts,ex,ey,Hx,Hy);
    ctx.globalAlpha=Math.min(1,u*7,(1-u)*5+.3)*I;
    laFx(ctx,P[0],P[1],(7+5*hsh(i))*(1-u*.4),Math.atan2(P2[1]-P[1],P2[0]-P[0])+Math.sin(ts/170+i*2)*.9,cl[i%4],'#1d5a22');}
  ctx.restore();
  for(i=0;i<12;i++){u=(t/1100+i*.083)%1;P=xoay(i,u,ts,ex,ey,Hx,Hy,38,1.2,.0015);glow(ctx,P[0],P[1],6,'#e6ff8a',.75*Math.sin(Math.PI*u)*I);}
}

/* 3. XÍCH VIÊM: lưỡi lửa chảy vào châu + tàn lửa + hơi nóng quanh thú */
function giotLua(ctx,a,b,r,c,w){   /* giọt lửa: đầu TRÒN ở a, đuôi nhọn kéo về b, đuôi lắc theo w */
  var dx=a[0]-b[0],dy=a[1]-b[1],L=Math.sqrt(dx*dx+dy*dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux,an=Math.atan2(ny,nx),tx=b[0]+nx*w,ty=b[1]+ny*w;
  ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(tx,ty);
  ctx.quadraticCurveTo((a[0]+tx)/2+nx*r*.9,(a[1]+ty)/2+ny*r*.9,a[0]+nx*r,a[1]+ny*r);
  ctx.arc(a[0],a[1],r,an,an-Math.PI,true);
  ctx.quadraticCurveTo((a[0]+tx)/2-nx*r*.9,(a[1]+ty)/2-ny*r*.9,tx,ty);ctx.fill();}
function hutViem(ctx,ts,t,ex,ey,Hx,Hy){
  var g=hutTong(t),p=g.p,I=g.I,i,j,m,u,a,b,r,n,w,gr,fl=Math.floor(ts/80);
  glow(ctx,ex,ey+8,36,'#ff5a12',.38*I);
  glow(ctx,Hx,Hy,20+18*p,'#ff8a30',.3+.45*p);
  ctx.save();
  for(j=0;j<5;j++)for(m=0;m<6;m++){
    u=(t/620+m/6+j*.17)%1;if(u>g.rev)continue;
    a=xoay(j,u,ts,ex,ey,Hx,Hy,30+(j%3)*7,.9,.0016);b=xoay(j,Math.max(0,u-.2),ts,ex,ey,Hx,Hy,30+(j%3)*7,.9,.0016);
    r=lp(10,4,u)*(.8+.45*hsh(fl+j*7+m));w=(hsh(fl+m*3+j)-.5)*6;
    ctx.globalAlpha=.92*I*Math.min(1,u*8);
    giotLua(ctx,a,b,r*1.15,'#a81004',w);giotLua(ctx,a,b,r*.85,'#ff5a12',w*.8);giotLua(ctx,a,b,r*.5,'#ffc23a',w*.5);giotLua(ctx,a,b,r*.22,'#fff6c8',w*.3);}
  ctx.globalCompositeOperation='lighter';
  for(j=0;j<5;j+=2)for(m=0;m<6;m+=2){u=(t/620+m/6+j*.17)%1;if(u>g.rev)continue;a=xoay(j,u,ts,ex,ey,Hx,Hy,30+(j%3)*7,.9,.0016);
    gr=ctx.createRadialGradient(a[0],a[1],0,a[0],a[1],16);gr.addColorStop(0,'rgba(255,140,40,.42)');gr.addColorStop(1,'rgba(255,60,10,0)');ctx.globalAlpha=I*Math.min(1,u*8);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(a[0],a[1],16,0,6.2832);ctx.fill();}
  ctx.fillStyle='#ffc060';
  n=10+Math.round(10*p);
  for(i=0;i<n;i++){u=(t/420+hsh(i)+i*.21)%1;if(u>g.rev)continue;
    a=xoay(i%5,u,ts,ex,ey,Hx,Hy,36,.7,.0016);r=1.2+1.6*hsh(i+3);
    ctx.globalAlpha=Math.sin(Math.PI*u)*I;ctx.beginPath();ctx.arc(a[0],a[1]-14*Math.sin(Math.PI*u),r,0,6.2832);ctx.fill();}
  ctx.restore();
}

/* 4. TỬ TIÊU: sét tím đánh từ thú vào châu + sương tím + chớp sáng */
function setPts(x0,y0,x1,y1,seed,amp,seg){
  var dx=x1-x0,dy=y1-y0,L=Math.sqrt(dx*dx+dy*dy)||1,nx=-dy/L,ny=dx/L,k,u,o,pts=[[x0,y0]];
  for(k=1;k<seg;k++){u=k/seg;o=(hsh(seed+k*7.3)-.5)*2*amp*Math.min(1,u*4,(1-u)*2.2);pts.push([x0+dx*u+nx*o,y0+dy*u+ny*o]);}
  pts.push([x1,y1]);return pts;}
function veSet(ctx,pts){ctx.beginPath();for(var k=0;k<pts.length;k++){if(k)ctx.lineTo(pts[k][0],pts[k][1]);else ctx.moveTo(pts[k][0],pts[k][1]);}ctx.stroke();}
function hutTieu(ctx,ts,t,ex,ey,Hx,Hy){
  var g=hutTong(t),p=g.p,I=g.I,i,k,u,P,q,b=Math.floor(ts/55),nb=3+Math.round(2*p),pts,sd,a,al,gr,fk,ix,fa;
  glow(ctx,Hx,Hy,18+14*p+8*hsh(b),'#b97cff',.35+.45*p);
  for(i=0;i<7;i++){u=(t/800+i/7)%1;P=xoay(i,u,ts,ex,ey,Hx,Hy,34,.8,.0012);q=12+14*(1-u);
    gr=ctx.createRadialGradient(P[0],P[1],0,P[0],P[1],q);gr.addColorStop(0,'rgba(170,110,255,'+(.32*Math.sin(Math.PI*u)*I)+')');gr.addColorStop(1,'rgba(90,40,170,0)');
    ctx.fillStyle=gr;ctx.beginPath();ctx.arc(P[0],P[1],q,0,6.2832);ctx.fill();}
  if(hsh(b*3.7)>.9)glow(ctx,ex,ey,54,'#e6d0ff',.75);
  ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.lineJoin='round';
  for(i=0;i<nb;i++){
    sd=b*17+i*31;a=i*2.1+hsh(b+i*3.3)*3;q=26+hsh(b+i)*18;al=(.55+.45*hsh(b+i*9))*I*Math.min(1,g.rev*2);
    pts=setPts(ex+Math.cos(a)*q,ey+Math.sin(a)*q*.8,Hx+(hsh(sd)-.5)*8,Hy+(hsh(sd+1)-.5)*8,sd,14+8*hsh(sd+2),9);
    for(k=0;k<3;k++){ctx.strokeStyle=k===0?'#7a3cd8':(k===1?'#c59bff':'#ffffff');ctx.lineWidth=k===0?8:(k===1?3:1.2);ctx.globalAlpha=(k===0?.28:(k===1?.8:1))*al;veSet(ctx,pts);}
    for(fk=0;fk<2;fk++){ix=2+Math.floor(hsh(sd+fk*5)*5);fa=hsh(sd+fk*9)*6.2832;
      var fp=setPts(pts[ix][0],pts[ix][1],pts[ix][0]+Math.cos(fa)*24,pts[ix][1]+Math.sin(fa)*24,sd+fk*3,6,4);
      ctx.strokeStyle='#c59bff';ctx.lineWidth=1.6;ctx.globalAlpha=.7*al;veSet(ctx,fp);}
  }
  ctx.fillStyle='#e8d4ff';
  for(i=0;i<5;i++){a=hsh(b+i*4)*6.2832;q=8+hsh(b+i*6)*16;ctx.globalAlpha=.9*I;ctx.beginPath();ctx.arc(Hx+Math.cos(a)*q,Hy+Math.sin(a)*q,1.4+hsh(b+i)*1.4,0,6.2832);ctx.fill();}
  ctx.restore();
}

/* 5. TINH THẦN: sao 4 cánh bay theo chùm xoáy, nối thành chòm sao, vòng rune thu nhỏ quanh thú, tia lóe ở châu */
function hutTinh(ctx,ts,t,ex,ey,Hx,Hy){
  var g=hutTong(t),p=g.p,I=g.I,n=18+Math.round(6*p),i,k,u=[],P=[],rr,L,an,col=['#ffffff','#bcd8ff','#a9b8ff','#d6b0ff'];
  glow(ctx,Hx,Hy,20+16*p,'#8fb0ff',.3+.45*p);
  ctx.save();ctx.globalCompositeOperation='lighter';
  rr=8+(1-p)*54;
  for(k=0;k<2;k++){ctx.strokeStyle='#8fd4ff';ctx.lineWidth=k?1:1.7;ctx.globalAlpha=(k?.35:.6)*I;if(k)ctx.setLineDash([5,5]);
    ctx.beginPath();ctx.ellipse(ex,ey+6,rr*(k?.72:1),rr*(k?.72:1)*.4,0,0,6.2832);ctx.stroke();ctx.setLineDash([]);}
  for(k=0;k<8;k++){an=ts/600+k*.7854;ctx.globalAlpha=.9*I;ctx.fillStyle='#dff0ff';star4(ctx,ex+Math.cos(an)*rr,ey+6+Math.sin(an)*rr*.4,3,ts/300+k);ctx.fill();}
  for(i=0;i<n;i++){u[i]=(t/1100+i/n)%1;P[i]=xoay(i%3,u[i],ts,ex,ey,Hx,Hy,44,1.15,.0012);}
  ctx.strokeStyle='#cfe0ff';ctx.lineWidth=1.2;ctx.globalAlpha=.55*I;
  for(i=0;i+3<n;i++)if(u[i+3]>u[i]&&u[i+3]<=g.rev&&Math.abs(P[i][0]-P[i+3][0])+Math.abs(P[i][1]-P[i+3][1])<90){ctx.beginPath();ctx.moveTo(P[i][0],P[i][1]);ctx.lineTo(P[i+3][0],P[i+3][1]);ctx.stroke();}
  for(i=0;i<n;i++){if(u[i]>g.rev)continue;
    L=lp(9,3.5,u[i])*(.7+.3*Math.sin(ts/90+i*3));ctx.globalAlpha=Math.min(1,u[i]*8)*I;
    ctx.fillStyle=col[i%4];star4(ctx,P[i][0],P[i][1],L,ts/700+i);ctx.fill();
    ctx.fillStyle='#fff';star4(ctx,P[i][0],P[i][1],L*.45,ts/700+i);ctx.fill();}
  L=14+26*p;ctx.strokeStyle='#e8f0ff';ctx.lineWidth=1.6;ctx.globalAlpha=(.3+.6*p);
  ctx.beginPath();ctx.moveTo(Hx-L,Hy);ctx.lineTo(Hx+L,Hy);ctx.moveTo(Hx,Hy-L);ctx.lineTo(Hx,Hy+L);ctx.stroke();
  ctx.restore();
}

/* 6. HỖN ĐỘN: lỗ đen nhỏ + vành cầu vồng ở miệng châu, 3 nhánh thiên hà đổi màu cuốn từ thú vào, vòng méo không gian */
function hutDon(ctx,ts,t,ex,ey,Hx,Hy){
  var g=hutTong(t),p=g.p,I=g.I,i,k,s,u,u1,P,Q,R=18+12*p,gr,n,h;
  ctx.save();
  gr=ctx.createRadialGradient(Hx,Hy,0,Hx,Hy,R*1.15);gr.addColorStop(0,'rgba(5,0,14,'+(.85*I)+')');gr.addColorStop(.7,'rgba(20,6,40,'+(.5*I)+')');gr.addColorStop(1,'rgba(20,6,40,0)');
  ctx.fillStyle=gr;ctx.beginPath();ctx.arc(Hx,Hy,R*1.15,0,6.2832);ctx.fill();
  ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
  for(i=0;i<2;i++){u=(t/800+i*.5)%1;h=6+(1-u)*58;ctx.strokeStyle='hsl('+((ts/4+i*180)%360)+',100%,70%)';ctx.globalAlpha=Math.sin(Math.PI*u)*.6*I;ctx.lineWidth=.8+2.2*(1-u);
    ctx.beginPath();ctx.ellipse(ex,ey+8,h,h*.38,0,0,6.2832);ctx.stroke();}
  ctx.lineWidth=2.4;
  for(k=0;k<3;k++)for(s=0;s<40;s++){u=s/40*g.rev;u1=(s+1)/40*g.rev;P=xoay(k,u,ts,ex,ey,Hx,Hy,46,2.1,.0012);Q=xoay(k,u1,ts,ex,ey,Hx,Hy,46,2.1,.0012);
    ctx.strokeStyle='hsl('+((k*120+u*320+ts/7)%360)+',100%,62%)';ctx.globalAlpha=.6*I;ctx.beginPath();ctx.moveTo(P[0],P[1]);ctx.lineTo(Q[0],Q[1]);ctx.stroke();}
  n=3*(7+Math.round(7*p));
  for(i=0;i<n;i++){u=(t/900+i*.137)%1;if(u>g.rev)continue;k=i%3;P=xoay(k,u,ts,ex,ey,Hx,Hy,46,2.1,.0012);
    ctx.fillStyle='hsl('+((u*300+ts/6+k*120)%360)+',100%,72%)';ctx.globalAlpha=Math.min(1,u*8)*I;ctx.beginPath();ctx.arc(P[0],P[1],1.4+2*(1-u*.5),0,6.2832);ctx.fill();}
  for(i=0;i<4;i++){u=(t/1000+i*.25)%1;if(u>g.rev)continue;P=xoay(i%3,u,ts,ex,ey,Hx,Hy,46,2.1,.0012);ctx.fillStyle='#ffffff';ctx.globalAlpha=Math.sin(Math.PI*u)*I;star4(ctx,P[0],P[1],4+3*Math.sin(ts/80+i),ts/500+i);ctx.fill();}
  ctx.lineWidth=3;ctx.lineCap='butt';
  for(k=0;k<24;k++){h=ts/500+k*.2618;ctx.strokeStyle='hsl('+((k*15+ts/6)%360)+',100%,62%)';ctx.globalAlpha=.85*I;ctx.beginPath();ctx.ellipse(Hx,Hy,R,R*.55,.5,h,h+.3);ctx.stroke();}
  ctx.restore();
}

var HUT_FX=[hutHai,hutMoc,hutViem,hutTieu,hutTinh,hutDon];
function hutFx(ctx,ts,t,cap,ex,ey,Hx,Hy){(HUT_FX[cap-1]||hutHai)(ctx,ts,t,ex,ey,Hx,Hy);}
function star4(ctx,x,y,r,rot){   /* ngôi sao 4 cánh */
  ctx.beginPath();for(var i=0;i<8;i++){var a=rot+i*.7854,rr=i%2?r*.3:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();}
function okFx(ctx,ts,t,x,y){   /* THÀNH CÔNG: lóe sáng + vòng sáng + sao 4 cánh vàng bắn ra lấp lánh */
  var u,i;
  if(t<380){u=t/380;glow(ctx,x,y,40+100*u,'#fff8d0',1-u);glow(ctx,x,y,24+40*u,'#ffe066',(1-u)*.8);
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#ffe066';ctx.lineWidth=3;ctx.globalAlpha=1-u;ctx.beginPath();ctx.arc(x,y,10+90*u,0,6.2832);ctx.stroke();ctx.restore();}
  ctx.save();ctx.globalCompositeOperation='lighter';
  for(i=0;i<26;i++){
    var dl=(i%3)*110,life=1000+((i*37)%5)*70,tt=(t-dl)/life;if(tt<0||tt>1)continue;
    var ang=i*2.399,spd=46+((i*53)%7)*13,e=1-(1-tt)*(1-tt),px=x+Math.cos(ang)*spd*e,py=y+Math.sin(ang)*spd*e*.9-16*tt,
        sz=(5+((i*11)%5)*1.6)*Math.pow(Math.sin(Math.PI*tt),.6)*(.65+.35*Math.sin(ts/55+i*2));
    ctx.globalAlpha=Math.max(0,1-tt*tt*tt);ctx.fillStyle='#ffd23a';star4(ctx,px,py,sz,ts/380+i);ctx.fill();
    ctx.fillStyle='#fffbe0';star4(ctx,px,py,sz*.5,ts/380+i);ctx.fill();}
  ctx.restore();}
function failFx(ctx,ts,t,x,y,m){   /* THẤT BẠI: chớp đỏ toàn màn hình 2 nhịp + quầng đỏ + khói xịt bốc lên */
  var u=t/520,i,T=CFG.t.fail;
  if(u<1){ctx.save();ctx.globalAlpha=.36*Math.abs(Math.sin(u*6.2832))*(1-u*.3);ctx.fillStyle='#ff2418';ctx.fillRect(0,0,m.W,m.H);ctx.restore();}
  glow(ctx,x,y,46+30*Math.min(1,t/300),'#ff3020',.85*Math.max(0,1-t/T));
  for(i=0;i<12;i++){
    var tt=(t-i*50)/700;if(tt<0||tt>1)continue;
    var px=x+Math.sin(tt*5+i)*10+((i%3)-1)*7,py=y-6-tt*78,r=8+22*tt,al=.6*Math.pow(1-tt,1.2),g;
    g=ctx.createRadialGradient(px,py,0,px,py,r);g.addColorStop(0,'rgba(95,95,100,'+al+')');g.addColorStop(1,'rgba(40,40,46,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(px,py,r,0,6.2832);ctx.fill();}
}
function draw(ctx,ts){
  if(S.mode==='off'||!host)return;
  var m=host.m(),t=Math.max(0,ts-S.t0),T=CFG.t,cap=S.mode==='ready'?S.cap:S.capUsed;
  var hx=m.cx,hy=m.gy-78+Math.sin(ts/420)*3,ex=m.ex,ey=m.gy-60,gb=m.gy-20,Hx=ex+CFG.bat.dx,Hy=ey+CFG.bat.dy,p,q,amp;
  if(S.mode==='ready'||S.mode==='hoi'){
    /* thanh Bắt/Giết hoặc khung chọn châu đang hiện (DOM): không vẽ gì lên trận */
  }else if(S.mode==='fly'){
    p=Math.min(1,t/T.bay);spr(ctx,'dong',cap,hx+(ex-hx)*p,hy+(ey-hy)*p-Math.sin(Math.PI*p)*70,1,p*12.5);
  }else if(S.mode==='trung'){
    spr(ctx,'dong',cap,ex,ey,1,12.5);hitFx(ctx,ex,ey,t/(T.trung*2));
  }else if(S.mode==='bat'){
    p=Math.min(1,t/T.bat);q=1-(1-p)*(1-p);
    spr(ctx,'dong',cap,ex+(Hx-ex)*q,ey+(Hy-ey)*q-46*Math.sin(Math.PI*p),1,12.5+4*q);hitFx(ctx,ex,ey,(T.trung+t)/(T.trung*2));
  }else if(S.mode==='mo'){
    p=Math.min(1,t/T.mo);spr(ctx,'mo',cap,Hx,Hy+Math.sin(ts/240)*1.5,.55+.45*(1-(1-p)*(1-p)),0);
    if(root.TTGHUT)TTGHUT.open(ctx,ts,t,cap,Hx,Hy,T.mo);   /* châu kích hoạt: trận pháp xoay + sóng xung kích */
  }else if(S.mode==='hut'){
    p=Math.min(1,t/T.hut);
    if(root.TTGHUT){   /* VFX mới: lớp sau (thú, trận pháp) -> ảnh châu (nảy 1.0>1.18>1.0) -> lớp trước (dải lụa, hạt, lõi xoáy, phong ấn) */
      TTGHUT.back(ctx,ts,t,cap,ex,ey,Hx,Hy,T.hut);
      spr(ctx,'mo',cap,Hx,Hy+Math.sin(ts/240)*1.5,TTGHUT.orbScale(ts,t,T.hut),0);
      TTGHUT.front(ctx,ts,t,cap,ex,ey,Hx,Hy,T.hut);
    }else{hutFx(ctx,ts,t,cap,ex,ey,Hx,Hy);spr(ctx,'mo',cap,Hx,Hy+Math.sin(ts/240)*1.5,1+.03*Math.sin(ts/90),0);}
  }else if(S.mode==='roi'){   /* đóng lại, rơi xuống đất, nảy nhẹ một cái */
    p=Math.min(1,t/T.roi);q=Math.min(1,p/.65);
    var bx=Hx+(ex-Hx)*q,by=Hy+(gb-Hy)*q*q;
    if(p>.65){bx=ex;by=gb-9*Math.sin(Math.PI*(p-.65)/.35);}
    spr(ctx,'rung',cap,bx,by,CFG.to,0);   /* tắt VFX hút: châu chuyển sang sprite shaking và rơi xuống chỗ thú */
  }else if(S.mode==='rung'){   /* 3 nhịp lắc NGANG (sprite shaking) xen nghỉ đứng yên + ánh sáng nhấp nháy */
    var R=CFG.rung,per=R.lac+R.nghi,idx=Math.floor(t/per),wi=t-idx*per,mau=CFG.mau[cap-1]||'#fff';
    if(idx<R.dot&&wi<R.lac){
      var env=Math.min(1,wi/70,(R.lac-wi)/100);amp=(5+idx*3)*env;
      spr(ctx,'rung',cap,ex+Math.sin(ts/(15-idx*2))*amp,gb,CFG.to,Math.sin(ts/(19-idx*2))*(.03+.02*idx)*env);
    }else{
      spr(ctx,'rung',cap,ex,gb,CFG.to,0);glow(ctx,ex,gb,24,mau,.25+.25*Math.sin(ts/80));
    }
  }else if(S.mode==='ok'){
    spr(ctx,'thanhcong',cap,ex,gb-4,CFG.to*(1+.05*Math.sin(ts/120)),0);okFx(ctx,ts,t,ex,gb-4);
  }else if(S.mode==='fail'){
    spr(ctx,'thatbai',cap,ex,gb,CFG.to,0,1-Math.max(0,(t-T.fail*.4)/(T.fail*.6)));failFx(ctx,ts,t,ex,gb,m);
  }
}

/* ================= DOM ================= */
var CSS=[
'.btx{position:fixed;z-index:7;display:none;box-sizing:border-box;border:2px solid #d9a93a;border-radius:9px;background:linear-gradient(#2a5fb0,#143a78);color:#fff3c4;font:800 14px/1 "Segoe UI",system-ui,sans-serif;text-shadow:0 1px 0 #000;box-shadow:0 0 10px rgba(255,214,102,.45);touch-action:manipulation;-webkit-tap-highlight-color:transparent;cursor:pointer;padding:0;align-items:center;justify-content:center;gap:5px}',
'.btx.bi{background:url(game-moi/nut-bat.webp) 50% 50%/contain no-repeat;border:0;border-radius:0;box-shadow:none;text-shadow:none;font-size:0;color:transparent}',
'.btx.g{background:linear-gradient(#5b5f73,#33364a);border-color:#8a8da0;color:#ddd;box-shadow:none}',
'.btx.chip{font-size:11px;line-height:1.15;padding:0 6px;text-align:left}',
'.btx .ci{width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:20px}',
'.btx .ci img{width:100%;height:100%;object-fit:contain}',
'.btx .ct{display:flex;flex-direction:column}',
'.btx.kh{background:url(game-moi/nut-khung.webp) 50% 50%/100% 100% no-repeat;border:0;border-radius:0;box-shadow:none;padding:0 18px;white-space:nowrap;overflow:visible}',   /* khung ảnh cho Thôi / Ném / chip châu */
'.btx.kh.g{filter:grayscale(.9) brightness(.9)}',
'.btx.dem{pointer-events:none;cursor:default;font-size:15px;color:#ffe9a0}',   /* ô đếm giây giữa [Giết] và [Bắt] */
'.btx.dem.gap{color:#ff6b6b}',
'.bts-dem{left:0;right:0;top:calc(var(--u)*-6);text-align:center;font-weight:800;font-size:calc(var(--u)*40);color:#ffe9a0;text-shadow:0 0 4px #000,1px 1px 0 #000;pointer-events:none}',
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
  /* thanh Bắt/Giết khi thú hoang gục: [Giết] [đếm giây] [Bắt] */
  els.giet=btn('kh g','Giết',kill);
  els.dem=btn('kh dem','',function(){});
  els.bat=btn('kh','Bắt',start);
  /* khung chọn châu */
  els.sel=document.createElement('div');els.sel.className='bts';
  els.fr=document.createElement('div');els.fr.className='bts-fr';els.sel.appendChild(els.fr);
  els.demSel=box(document.createElement('div'),0,8,FW,60);els.demSel.className='bts-dem';els.fr.appendChild(els.demSel);   /* đếm giây chung, vẫn chạy khi đang chọn châu */
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
  build();if(!(countOf(S.cap)>0))S.cap=pickDefault();
  S.sel=true;S.selCap=S.cap||selList()[0]||1;els.sel.className='bts on';unitSel();renderSel();
}
function closeSel(){S.sel=false;if(els)els.sel.className='bts';if(S.mode==='ready'){S.mode='hoi';S.key='';}}   /* đóng khung (X / chạm ngoài) = quay lại thanh Bắt/Giết, giờ vẫn chạy */
function pickSlot(i){var l=selList();if(l[i]){S.selCap=l[i];renderSel();}}
function confirmSel(){
  var cap=S.selCap,r=rateOf(cap);
  if(!cap||countOf(cap)<=0){toast('Chưa chọn châu');return;}
  if(r==null){toast('Châu này không dùng được ở vùng này');return;}
  S.cap=cap;doThrow();   /* Chọn = ném luôn */
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
  els.info.innerHTML='<div class="ic">'+icHtml(it)+'</div><div class="nm">'+esc(it.ten)+'</div><div class="mt">'+esc(it.bac||('Cấp '+c))+' · Có: x'+countOf(c)+'</div>'
    +'<div class="rt">'+(r==null?'Không dùng được':'Tỉ lệ bắt: '+Math.round(r*100)+'%')+'</div><div class="ds">'+esc(it.mo||'')+'</div>';
}

/* hiển thị / vị trí các nút theo trạng thái */
function setShow(e,on){var d=on?'flex':'none';if(e.style.display!==d)e.style.display=d;}
function place(e,cxCss,cyCss,w,h){var s=e.style;s.width=w+'px';s.height=h+'px';s.left=Math.round(cxCss-w/2)+'px';s.top=Math.round(cyCss-h/2)+'px';}
function syncDom(){
  var hoiOn=S.mode==='hoi';
  if(!els){if(!hoiOn)return;build();}
  setShow(els.giet,hoiOn);setShow(els.dem,hoiOn);setShow(els.bat,hoiOn);
  var giay=Math.max(0,Math.ceil(S.time/1000));
  if(S.sel&&els.demSel){var tx='Còn '+giay+' giây · '+S.left+' lần ném';if(els.demSel.textContent!==tx)els.demSel.textContent=tx;}
  if(!hoiOn)return;
  var m=host.m(),f=m.K/m.DPR,cc=Math.round(m.cx*f),key=[m.K,m.DPR,m.W,m.H,m.th,m.gy,m.cx,m.I.t,S.mode,giay,S.left,owned().length].join('|');
  if(key===S.key)return;S.key=key;
  var cy=(m.gy-34)*f;   /* sát khung dưới, dưới chân 2 thú (chỗ nút Ném cũ) => không che thú / hiệu ứng */
  place(els.giet,cc-60-8-50,cy,100,34);place(els.dem,cc,cy,120,34);place(els.bat,cc+60+8+50,cy,100,34);
  els.dem.textContent=giay+'s'+(S.nem?' · còn '+S.left:'');els.dem.className='btx kh dem'+(giay<=5?' gap':'');
  els.bat.className='btx kh'+(owned().length?'':' g');
}
function r2(x){return x;}

/* bảng kết quả */
function showPanel(win){
  build();S.mode='panel';S.win=win;closeSel();
  var h;
  /* KHUNG THÔNG BÁO MỚI (64-thong-bao.js): bảng kết quả nằm trong khung chung; chưa nạp module thì rơi xuống bảng cũ bên dưới */
  if(root.TTGBAO){
    var Pn=root.TTGBAO,fin=function(){done(win?'bat':'chay');},cvw=null;
    if(win&&S.got){
      var g2=S.got,lo2=root.TTGCS&&TTGCS.loai?TTGCS.loai(g2.id):null,hT=root.TTGCS&&TTGCS.HE_TEN||{},he2=lo2&&lo2.he?lo2.he.map(function(x){return hT[x]||x;}).join(' / '):'?';
      var rk2=g2.bac&&Pn.RKC&&Pn.RKC[g2.bac]?g2.bac:'C',cb2={B:'Thú Rank B khá mạnh!',A:'Thú Rank A rất mạnh và khó kiếm!',S:'⚠ Thú Rank S cực hiếm!',SS:'⚠ Thú Rank SS huyền thoại!'}[rk2];   /* chữ Rank ở góc ô hình như kho; Rank cao có thêm dòng chúc mừng */
       var body=Pn.info({icon:'<canvas width="128" height="128"></canvas>'+Pn.corner(rk2),bac:g2.bac,title:'Bắt thành công!',sub:esc(g2.ten)+(g2.boss?' <span style="color:#ff9f6f">[BOSS]</span>':''),text:'Hệ: '+esc(he2)+' · Lv.<b>'+g2.lv+'</b> · Bậc <b>'+g2.tien+'</b> · Rank '+Pn.rankHtml(rk2)+(cb2?'<br><span class="tbo-w'+(rk2==='S'||rk2==='SS'?' r':'')+'">'+cb2+'</span>':''),modal:true},[{t:'Tiếp tục',cb:fin}]);
      try{cvw=body.parentNode.querySelector('.tbo-ic canvas');var c3=cvw.getContext('2d'),tryN=0;cvw.width=cvw.height=192;(function paint(){THU_MOI.setFrame(192);
          /* vẽ 1:1 ra canvas phụ, đo khung chứa hình thú (bỏ phần trong suốt), rồi phóng vừa ô và căn GIỮA => thú bậc nhỏ/lớn đều đầy đặn; ảnh chưa nạp thì thử lại ~3 giây */
          var tmp=document.createElement('canvas');tmp.width=tmp.height=192;var tc=tmp.getContext('2d');
          if(THU_MOI.draw(tc,g2.id,g2.tien,96,192,192)){
            var d=tc.getImageData(0,0,192,192).data,x0=192,y0=192,x1=-1,y1=-1,i,j;
            for(j=0;j<192;j++)for(i=0;i<192;i++)if(d[(j*192+i)*4+3]>24){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j;}
            if(x1<0){x0=0;y0=0;x1=191;y1=191;}
            var bw=x1-x0+1,bh=y1-y0+1,sc=Math.min(176/bw,176/bh,4),dw=bw*sc,dh=bh*sc;
            c3.clearRect(0,0,192,192);c3.imageSmoothingEnabled=false;
            c3.drawImage(tmp,x0,y0,bw,bh,(192-dw)/2,(192-dh)/2,dw,dh);
          }else if(tryN++<30&&cvw.isConnected)setTimeout(paint,100);})();}catch(x){}
    }else Pn.info({title:'Bắt thất bại',tc:'y',text:'Thú hoang đã chạy thoát.',modal:true},[{t:'Tiếp tục',cb:fin}]);
    return;
  }
  var h;
  if(win&&S.got){
    var g=S.got,lo=root.TTGCS&&TTGCS.loai?TTGCS.loai(g.id):null,heTen=root.TTGCS&&TTGCS.HE_TEN||{},he=lo&&lo.he?lo.he.map(function(x){return heTen[x]||x;}).join(' / '):'?';
    h='<div class="btr-c"><h3>Bắt thành công!</h3><canvas width="128" height="128"></canvas><div class="ln"><b>'+esc(g.ten)+'</b>'+(g.boss?' <span style="color:#ff9f6f">[BOSS]</span>':'')+'<br>Hệ: '+esc(he)+'<br>Bậc: <b style="color:'+(CFG.mauBac[g.bac]||'#fff')+'">'+esc(g.bac)+'</b> · Tiến hóa '+g.tien+' · Cấp '+g.lv+'</div><button type="button">Tiếp tục</button></div>';
    els.res.innerHTML=h;
    try{var cv=els.res.querySelector('canvas'),c2=cv.getContext('2d');c2.imageSmoothingEnabled=false;THU_MOI.setFrame(192);THU_MOI.draw(c2,g.id,g.tien,64,124,128);}catch(x){}
  }else{
    h='<div class="btr-c"><h3>Bắt thất bại</h3><div class="ln">Thú hoang đã chạy thoát.</div><button type="button">Tiếp tục</button></div>';
    els.res.innerHTML=h;
  }
  els.res.className='btr on';
  els.res.querySelector('button').addEventListener('click',function(){done(win?'bat':'chay');});
}

/* NÚT TEST TẠM: bấm để nhận mỗi bậc châu +5 (xóa khi đã có nguồn châu thật ở Bước 5). Tắt bằng CFG.nutTest=false */
CFG.nutTest=true;
if(CFG.nutTest&&root.TTGNV&&root.TTGBALO&&root.TTGBONG){
  root.TTGNV.add({id:'nhan-chau',ten:'Nhận châu',r:0,rc:2,onTap:function(){   /* 3 nút test nằm bên PHẢI khung dưới (rc = cột từ mép phải) */
    for(var c=1;c<=TTGBONG.CFG.capBongMax;c++)TTGBALO.add(TTGBONG.idBong(c),5);
    toast('TEST: +5 mỗi bậc Ngự Thú Châu');
  },icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="20" fill="#3ec9d6" stroke="#0b4a5c" stroke-width="3"/><path d="M32 18v28M18 32h28" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>'});
}

/* NÚT TEST TẠM (cạnh Nhận châu): 1) Đổi rank thú đang ra trận (vòng E>D>C>B>A>S>SS>SR, có hiệu lực từ trận sau) 2) Lấy sách kỹ năng (6 sách boss, mỗi loại +2) */
if(CFG.nutTest&&root.TTGNV&&root.TTGBALO){
  root.TTGNV.add({id:'doi-rank',ten:'Đổi rank',r:0,rc:1,onTap:function(){
    var b=root.TTGTHU&&TTGTHU.doiRank?TTGTHU.doiRank():null;
    toast(b?'TEST: Rank thú ra trận = '+b+' (áp dụng từ trận sau)':'TEST: chưa có thú ra trận');
  },icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 8l7 15 16 2-12 11 3 16-14-8-14 8 3-16L9 25l16-2z" fill="#ffd24a" stroke="#7a4a00" stroke-width="3" stroke-linejoin="round"/></svg>'});
  root.TTGNV.add({id:'lay-sach',ten:'Lấy sách',r:0,rc:0,onTap:function(){
    var ids=['sach-bang-son-ap-dinh','sach-suong-nuot','sach-con-bang-trien-si','sach-vu-xa-trien','sach-thien-loi-giang','sach-nguyet-thuc-nuot','sach-thuy-long-pha-nguyet','sach-viem-long-pha-nhat','sach-van-moc-hoi-xuan','sach-tinh-ha-van-lac','sach-thoi-gian-tinh-lang','sach-thai-cuc-do'];
    ids.forEach(function(i){TTGBALO.add(i,2);});
    toast('TEST: +2 mỗi loại sách kỹ năng boss');
  },icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="14" y="10" width="36" height="44" rx="4" fill="#5b3cc4" stroke="#1d0f5c" stroke-width="3"/><rect x="14" y="10" width="8" height="44" rx="3" fill="#3a2494"/><path d="M36 20l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="#ffd24a"/></svg>'});
}

root.TTGBAT={
  CFG:CFG,fx:{hut:hutFx,glow:glow,star4:star4},attach:function(h){host=h;},frame:frame,draw:draw,enemyFx:enemyFx,start:start,kill:kill,hoi:hoi,catchable:catchable,
  active:function(){return S.mode!=='off';},mode:function(){return S.mode;}
};
})(typeof window!=='undefined'?window:globalThis);
