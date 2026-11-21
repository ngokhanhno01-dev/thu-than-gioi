/* 68-hud-tran.js - KHUNG THÔNG TIN CHIẾN ĐẤU (thay thanh máu cũ): 1 khung cho thú bạn (vòng tròn bên trái) + 1 khung cho địch (LẬT GƯƠNG, vòng tròn bên phải).
   Ảnh: game-moi/khung-chien-dau.webp (đã tách nền, đã xóa chữ Tên/Bậc/Lv./Khiên/Tốc Độ vẽ sẵn để lật gương không bị ngược chữ; mọi chữ vẽ bằng canvas). Tọa độ G tính theo chính ảnh file 1622x483 (vẽ tự co theo bề rộng).
   - Vòng tròn = RANK (chữ neon theo màu rank, giống kho/thông báo). Ô xanh bên dưới vòng = HỆ (1 hệ: "Băng"; 2 hệ: "Băng · Võ", mỗi hệ một màu).
   - Thanh vàng kem: TÊN (tự co chữ nếu dài) + BẬC 1/2/3.   - Thanh KHIÊN (trên, tô xanh lam): "hiện/tối đa"; tối đa 0 thì "0/0" và KHÔNG có phần tô.   - Thanh to giữa: MÁU "hiện/tối đa".   - Ô nhỏ: "Lv.N" (tới Lv.100).
   - Thanh TỐC ĐỘ (dưới, tô vàng) = THANH HÀNH ĐỘNG: số ở giữa là td, thanh chạy đầy theo td (o.gauge 0..1 do trận truyền); đầy là tới lượt đánh.
   API: TTGHUD.draw(ctx,{x,y,w,mirror,rank,name,bac,lv,he:[..],hp,hpMax,sh,shMax,td,tdMax,gauge,enemy}) ; TTGHUD.ratio (cao/rộng) ; TTGHUD.G */
(function(root){
'use strict';
var IW=1622,IH=483;
var G={cx:257,cy:237,r:150,                       /* vòng tròn Rank */
  name:{x0:575,x1:1060,y:75},bac:{x:1194,w:240,y:75},   /* thanh kem: tên | bậc */
  sh:{x0:639,x1:1297,y0:154,y1:202,lx:565,ly:177,lw:112},      /* thanh KHIÊN (trên) + nhãn */
  hp:{x0:500,x1:1375,y0:224,y1:292},                           /* thanh MÁU (giữa, to) */
  sp:{x0:639,x1:1532,y0:309,y1:357,lx:563,ly:333,lw:118},      /* thanh TỐC ĐỘ (dưới) + nhãn */
  lv:{x:1478,y:262,w:140},he:{x:257,y:407,w:165}};
var HE_TEN={thuong:'Thường',hoa:'Hỏa',thuy:'Thủy',loi:'Lôi',moc:'Mộc',bang:'Băng',vo:'Võ',doc:'Độc',tho:'Thổ',phong:'Phong',tam:'Tâm Linh',trung:'Trùng',nham:'Nham',ma:'Ma',long:'Long',am:'Ám',kim:'Kim',tien:'Tiên'};
var HE_MAU={thuong:'#f0f0f0',hoa:'#ff8a5c',thuy:'#58c4ff',loi:'#ffe45c',moc:'#6ce57a',bang:'#a8ecff',vo:'#ffb872',doc:'#c27cff',tho:'#d6a866',phong:'#a6f5d8',tam:'#ff98e6',trung:'#c4e45a',nham:'#c8c0b0',ma:'#b088e0',long:'#ffd24a',am:'#9a8aea',kim:'#fff0b8',tien:'#fff6d0'};
var FS='"Noto Serif","Palatino Linotype",Georgia,serif',FB='bold 10px sans-serif';
var img=new Image(),ok=false;img.onload=function(){ok=true;};img.src='game-moi/khung-chien-dau.webp?v=2';
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.arcTo(x+w,y,x+w,y+r,r);c.lineTo(x+w,y+h-r);c.arcTo(x+w,y+h,x+w-r,y+h,r);c.lineTo(x+r,y+h);c.arcTo(x,y+h,x,y+h-r,r);c.lineTo(x,y+r);c.arcTo(x,y,x+r,y,r);c.closePath();}
/* chữ căn giữa tại (cx,cy), tự co cỡ chữ (tối thiểu fmin) rồi ép ngang nếu vẫn dài; viền tối + màu */
function fit(c,t,cx,cy,maxW,fs,fmin,font,col,stroke,lw){
  c.font=font.replace('{S}',fs);var w=c.measureText(t).width;
  if(w>maxW&&fs>fmin){fs=Math.max(fmin,Math.floor(fs*maxW/w));c.font=font.replace('{S}',fs);w=c.measureText(t).width;}
  var sx=w>maxW?maxW/w:1;
  c.save();c.translate(cx,cy);c.scale(sx,1);c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  if(stroke){c.lineWidth=lw||8;c.strokeStyle=stroke;c.strokeText(t,0,0);}
  c.fillStyle=col;c.fillText(t,0,0);c.restore();}
function barFill(c,b,p,mir,c1,c2,n){
  n=n||6;var w=b.x1-b.x0,h=b.y1-b.y0,x=mir?IW-b.x1:b.x0;
  c.save();rr(c,x+n,b.y0+n,w-2*n,h-2*n,(h-2*n)/2);c.clip();
  if(p>0){var fw=(w-2*n)*p,fx=mir?x+w-n-fw:x+n,g=c.createLinearGradient(0,b.y0,0,b.y1);g.addColorStop(0,c1);g.addColorStop(1,c2);
    c.fillStyle=g;c.fillRect(fx,b.y0+n,fw,h-2*n);
    c.fillStyle='rgba(255,255,255,.28)';c.fillRect(fx,b.y0+n+2,fw,(h-2*n)*.28);}   /* vệt sáng trên */
  c.restore();}
var RBC={};
/* ảnh chữ Rank neon giống trang Thú Thần: vẽ bằng TTGTHU.badges vào canvas 208x208, nhớ theo rank (SR đổi màu nên vẽ lại ~8 lần/giây). Chưa nạp font thì không nhớ. */
function rankBadge(rk){if(!rk||!root.TTGTHU||!root.TTGTHU.badges)return null;var fo=!document.fonts||!document.fonts.check||document.fonts.check('40px TTGRank'),now=Date.now(),e=RBC[rk];
  if(e&&(rk!=='SR'||now-e.t<120))return e.c;
  var cv=[0,1,2].map(function(){var c=document.createElement('canvas');c.width=c.height=208;return c;});
  try{root.TTGTHU.badges(cv,{lv:1,tien:1,bac:rk});}catch(x){return e?e.c:null;}
  if(fo||rk==='SR')RBC[rk]={c:cv[2],t:now};return cv[2];}
function draw(ctx,o){
  if(!ok||!o)return false;
  var m=!!o.mirror,s=o.w/IW,X=function(x){return m?IW-x:x;};
  ctx.save();ctx.translate(o.x,o.y);ctx.scale(s,s);
  /* nền tối trong vòng Rank */
  var rg=ctx.createRadialGradient(G.cx,G.cy,10,G.cx,G.cy,G.r+10);rg.addColorStop(0,'#1a3d86');rg.addColorStop(1,'#050b22');
  var cx=X(G.cx);ctx.fillStyle=rg;ctx.beginPath();ctx.arc(cx,G.cy,G.r+10,0,6.2832);ctx.fill();
  /* khung (lật gương cho địch) */
  ctx.save();if(m){ctx.translate(IW,0);ctx.scale(-1,1);}ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,IW,IH);ctx.restore();
  /* RANK */
  var RK=(root.TTGBAO&&root.TTGBAO.RKC)||{},rk=o.rank,cl=(rk&&RK[rk]?RK[rk]:(rk?['#00d0ff','#3de0ff']:['#8899bb','#c8d2ea'])).map(function(v){return typeof v==='function'?v():v;}),rt=rk||'?';   /* SR: màu là hàm theo thời gian */
  var bd=rankBadge(rk);
  if(bd){var D=G.r*2.05;ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(bd,cx-D/2,G.cy-D/2,D,D);ctx.restore();}   /* chữ Rank vẽ bằng ĐÚNG hàm của trang Thú Thần (TTGTHU.badges) */
  else{ctx.save();ctx.shadowColor=cl[0];ctx.shadowBlur=40;
  fit(ctx,rt,cx,G.cy+4,225,190,90,'{S}px TTGRank,"Kaushan Script",cursive',rt==='SR'?'#ffd1f6':cl[1],'rgba(0,6,30,.9)',12);
  ctx.shadowBlur=0;ctx.restore();}
  /* TÊN + BẬC */
  fit(ctx,o.name||'',X((G.name.x0+G.name.x1)/2),G.name.y,G.name.x1-G.name.x0,56,34,'bold {S}px '+FS,'#0c1f45',null);
  fit(ctx,'Bậc '+(o.bac||1),X(G.bac.x),G.bac.y,G.bac.w,56,38,'bold {S}px '+FS,'#7a2a10',null);
  /* nhãn Khiên / Tốc Độ (chữ vẽ bằng canvas để lật gương không bị ngược) */
  fit(ctx,'Khiên',X(G.sh.lx),G.sh.ly+1,G.sh.lw,38,24,'bold {S}px sans-serif','#fff','rgba(0,0,0,.85)',7);
  fit(ctx,'Tốc Độ',X(G.sp.lx),G.sp.ly+1,G.sp.lw,38,24,'bold {S}px sans-serif','#fff','rgba(0,0,0,.85)',7);
  /* KHIÊN (trên, tô xanh lam): tối đa 0 thì 0/0 và không tô */
  var sM=Math.max(0,o.shMax||0),sh=Math.max(0,Math.min(sM,o.sh||0));
  barFill(ctx,G.sh,sM>0?sh/sM:0,m,'#7fd4ff','#1f7fe0',5);
  fit(ctx,Math.ceil(sh)+'/'+Math.ceil(sM),X((G.sh.x0+G.sh.x1)/2),(G.sh.y0+G.sh.y1)/2+2,G.sh.x1-G.sh.x0-90,36,24,'bold {S}px sans-serif','#fff','rgba(0,0,0,.85)',7);
  /* MÁU */
  var hpM=Math.max(1,o.hpMax||1),hp=Math.max(0,Math.min(hpM,o.hp||0));
  barFill(ctx,G.hp,hp/hpM,m,o.enemy?'#f06060':'#58e05a',o.enemy?'#a21c1c':'#1f9b2a',7);
  fit(ctx,Math.ceil(hp)+'/'+Math.ceil(hpM),X((G.hp.x0+G.hp.x1)/2),(G.hp.y0+G.hp.y1)/2+2,G.hp.x1-G.hp.x0-100,50,32,'bold {S}px sans-serif','#fff','rgba(0,0,0,.85)',9);
  /* TỐC ĐỘ (dưới, tô vàng) = THANH HÀNH ĐỘNG: đầy thì tới lượt đánh; chạy nhanh/chậm theo td. gauge 0..1 do trận truyền vào (không có thì tô theo td/tdMax) */
  var hasTd=o.td!=null,td=Math.max(0,o.td||0),tdM=Math.max(td,o.tdMax||0,1),gp=o.gauge!=null?o.gauge:(hasTd?td/tdM:0);
  barFill(ctx,G.sp,Math.max(0,Math.min(1,gp)),m,gp>=.999?'#fff0a0':'#ffe27a',gp>=.999?'#f0b020':'#d9921a',5);
  fit(ctx,hasTd?String(Math.round(td)):'-',X((G.sp.x0+G.sp.x1)/2),(G.sp.y0+G.sp.y1)/2+2,300,36,24,'bold {S}px sans-serif','#fff','rgba(60,30,0,.9)',7);
  /* LV */
  fit(ctx,'Lv.'+Math.max(1,Math.min(100,Math.floor(o.lv||1))),X(G.lv.x),G.lv.y+2,G.lv.w,46,26,'bold {S}px sans-serif','#fff3c4','rgba(40,20,0,.9)',7);
  /* HỆ (1 hoặc 2 hệ, mỗi hệ một màu) */
  var he=(o.he||[]).filter(Boolean).slice(0,2),HT=(root.TTGCS&&root.TTGCS.HE_TEN)||HE_TEN;
  if(he.length){
    var fs=44,fnt='bold {S}px sans-serif',names=he.map(function(k){return HT[k]||HE_TEN[k]||k;}),sep=' · ';
    var meas=function(f){ctx.font=fnt.replace('{S}',f);return names.reduce(function(a,n){return a+ctx.measureText(n).width;},0)+(names.length>1?ctx.measureText(sep).width:0);};
    var tw=meas(fs);while(tw>G.he.w&&fs>28){fs-=2;tw=meas(fs);}
    var sx=tw>G.he.w?G.he.w/tw:1;
    ctx.save();ctx.translate(X(G.he.x),G.he.y);ctx.scale(sx,1);ctx.font=fnt.replace('{S}',fs);ctx.textAlign='left';ctx.textBaseline='middle';ctx.lineJoin='round';
    var px=-tw/2;
    names.forEach(function(n,i){
      if(i){ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,30,.9)';ctx.strokeText(sep,px,0);ctx.fillStyle='#cfe3ff';ctx.fillText(sep,px,0);px+=ctx.measureText(sep).width;}
      ctx.lineWidth=6;ctx.strokeStyle='rgba(0,0,30,.9)';ctx.strokeText(n,px,0);ctx.fillStyle=HE_MAU[he[i]]||'#fff';ctx.fillText(n,px,0);px+=ctx.measureText(n).width;});
    ctx.restore();}
  ctx.restore();return true;}
root.TTGHUD={draw:draw,ratio:IH/IW,G:G,ready:function(){return ok;}};
})(typeof window!=='undefined'?window:globalThis);
