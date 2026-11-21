/* 68-hud-tran.js - KHUNG THÔNG TIN CHIẾN ĐẤU (thay thanh máu cũ): 1 khung cho thú bạn (vòng tròn bên trái) + 1 khung cho địch (LẬT GƯƠNG, vòng tròn bên phải).
   Ảnh: game-moi/khung-chien-dau.webp (đã tách nền, đã xóa chữ Tên/Bậc/Lv. vẽ sẵn; mọi chữ vẽ bằng canvas). Tọa độ G tính theo ảnh GỐC 2161x728 (ảnh file thu nhỏ còn 1080x364, vẽ tự co theo bề rộng).
   - Vòng tròn = RANK (chữ neon theo màu rank, giống kho/thông báo). Ô xanh bên dưới vòng = HỆ (1 hệ: "Băng"; 2 hệ: "Băng · Võ", mỗi hệ một màu).
   - Thanh vàng kem: TÊN (tự co chữ nếu dài) + BẬC 1/2/3.   - Thanh to: MÁU "hiện/tối đa" ở giữa.   - Thanh nhỏ: GIÁP (khiên); tối đa 0 thì hiện "0/0" và KHÔNG có phần tô.   - Ô nhỏ: "Lv.N" (tới Lv.100), tự co vừa ô.
   API: TTGHUD.draw(ctx,{x,y,w,mirror,rank,name,bac,lv,he:[..],hp,hpMax,sh,shMax,enemy}) ; TTGHUD.ratio (cao/rộng) ; TTGHUD.G */
(function(root){
'use strict';
var IW=2161,IH=728;
var G={cx:366,cy:340,r:196,                       /* vòng tròn Rank */
  name:{x0:790,x1:1400,y:112},bac:{x:1608,w:300,y:112},   /* thanh kem: tên | bậc */
  hp:{x0:695,x1:2029,y0:266,y1:387},sh:{x0:691,x1:1800,y0:450,y1:521},lv:{x:1941,y:493,w:168},he:{x:360,y:585,w:262}};
var HE_TEN={thuong:'Thường',hoa:'Hỏa',thuy:'Thủy',loi:'Lôi',moc:'Mộc',bang:'Băng',vo:'Võ',doc:'Độc',tho:'Thổ',phong:'Phong',tam:'Tâm Linh',trung:'Trùng',nham:'Nham',ma:'Ma',long:'Long',am:'Ám',kim:'Kim',tien:'Tiên'};
var HE_MAU={thuong:'#f0f0f0',hoa:'#ff8a5c',thuy:'#58c4ff',loi:'#ffe45c',moc:'#6ce57a',bang:'#a8ecff',vo:'#ffb872',doc:'#c27cff',tho:'#d6a866',phong:'#a6f5d8',tam:'#ff98e6',trung:'#c4e45a',nham:'#c8c0b0',ma:'#b088e0',long:'#ffd24a',am:'#9a8aea',kim:'#fff0b8',tien:'#fff6d0'};
var FS='"Noto Serif","Palatino Linotype",Georgia,serif',FB='bold 10px sans-serif';
var img=new Image(),ok=false;img.onload=function(){ok=true;};img.src='game-moi/khung-chien-dau.webp?v=1';
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.arcTo(x+w,y,x+w,y+r,r);c.lineTo(x+w,y+h-r);c.arcTo(x+w,y+h,x+w-r,y+h,r);c.lineTo(x+r,y+h);c.arcTo(x,y+h,x,y+h-r,r);c.lineTo(x,y+r);c.arcTo(x,y,x+r,y,r);c.closePath();}
/* chữ căn giữa tại (cx,cy), tự co cỡ chữ (tối thiểu fmin) rồi ép ngang nếu vẫn dài; viền tối + màu */
function fit(c,t,cx,cy,maxW,fs,fmin,font,col,stroke,lw){
  c.font=font.replace('{S}',fs);var w=c.measureText(t).width;
  if(w>maxW&&fs>fmin){fs=Math.max(fmin,Math.floor(fs*maxW/w));c.font=font.replace('{S}',fs);w=c.measureText(t).width;}
  var sx=w>maxW?maxW/w:1;
  c.save();c.translate(cx,cy);c.scale(sx,1);c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';
  if(stroke){c.lineWidth=lw||8;c.strokeStyle=stroke;c.strokeText(t,0,0);}
  c.fillStyle=col;c.fillText(t,0,0);c.restore();}
function barFill(c,b,p,mir,c1,c2){
  var w=b.x1-b.x0,h=b.y1-b.y0,x=mir?IW-b.x1:b.x0;
  c.save();rr(c,x+8,b.y0+8,w-16,h-16,(h-16)/2);c.clip();
  if(p>0){var fw=(w-16)*p,fx=mir?x+w-8-fw:x+8,g=c.createLinearGradient(0,b.y0,0,b.y1);g.addColorStop(0,c1);g.addColorStop(1,c2);
    c.fillStyle=g;c.fillRect(fx,b.y0+8,fw,h-16);
    c.fillStyle='rgba(255,255,255,.28)';c.fillRect(fx,b.y0+10,fw,(h-16)*.28);}   /* vệt sáng trên */
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
  fit(ctx,rt,cx,G.cy+6,300,250,120,'{S}px TTGRank,"Kaushan Script",cursive',rt==='SR'?'#ffd1f6':cl[1],'rgba(0,6,30,.9)',16);
  ctx.shadowBlur=0;ctx.restore();}
  /* TÊN + BẬC */
  fit(ctx,o.name||'',X((G.name.x0+G.name.x1)/2),G.name.y,G.name.x1-G.name.x0,76,46,'bold {S}px '+FS,'#0c1f45',null);
  fit(ctx,'Bậc '+(o.bac||1),X(G.bac.x),G.bac.y,G.bac.w,76,50,'bold {S}px '+FS,'#7a2a10',null);
  /* MÁU */
  var hpM=Math.max(1,o.hpMax||1),hp=Math.max(0,Math.min(hpM,o.hp||0));
  barFill(ctx,G.hp,hp/hpM,m,o.enemy?'#f06060':'#58e05a',o.enemy?'#a21c1c':'#1f9b2a');
  fit(ctx,Math.ceil(hp)+'/'+Math.ceil(hpM),X((G.hp.x0+G.hp.x1)/2),(G.hp.y0+G.hp.y1)/2+2,G.hp.x1-G.hp.x0-120,84,50,'bold {S}px sans-serif','#fff','rgba(0,0,0,.85)',12);
  /* GIÁP: tối đa 0 thì 0/0 và không tô */
  var sM=Math.max(0,o.shMax||0),sh=Math.max(0,Math.min(sM,o.sh||0));
  barFill(ctx,G.sh,sM>0?sh/sM:0,m,'#8fdcff','#2a8fd0');
  fit(ctx,Math.ceil(sh)+'/'+Math.ceil(sM),X((G.sh.x0+G.sh.x1)/2),(G.sh.y0+G.sh.y1)/2+2,G.sh.x1-G.sh.x0-120,56,34,'bold {S}px sans-serif','#fff','rgba(0,0,0,.85)',9);
  /* LV */
  fit(ctx,'Lv.'+Math.max(1,Math.min(100,Math.floor(o.lv||1))),X(G.lv.x),G.lv.y+2,G.lv.w,66,34,'bold {S}px sans-serif','#fff3c4','rgba(40,20,0,.9)',9);
  /* HỆ (1 hoặc 2 hệ, mỗi hệ một màu) */
  var he=(o.he||[]).filter(Boolean).slice(0,2),HT=(root.TTGCS&&root.TTGCS.HE_TEN)||HE_TEN;
  if(he.length){
    var fs=62,fnt='bold {S}px sans-serif',names=he.map(function(k){return HT[k]||HE_TEN[k]||k;}),sep=' · ';
    var meas=function(f){ctx.font=fnt.replace('{S}',f);return names.reduce(function(a,n){return a+ctx.measureText(n).width;},0)+(names.length>1?ctx.measureText(sep).width:0);};
    var tw=meas(fs);while(tw>G.he.w&&fs>40){fs-=2;tw=meas(fs);}
    var sx=tw>G.he.w?G.he.w/tw:1;
    ctx.save();ctx.translate(X(G.he.x),G.he.y);ctx.scale(sx,1);ctx.font=fnt.replace('{S}',fs);ctx.textAlign='left';ctx.textBaseline='middle';ctx.lineJoin='round';
    var px=-tw/2;
    names.forEach(function(n,i){
      if(i){ctx.lineWidth=8;ctx.strokeStyle='rgba(0,0,30,.9)';ctx.strokeText(sep,px,0);ctx.fillStyle='#cfe3ff';ctx.fillText(sep,px,0);px+=ctx.measureText(sep).width;}
      ctx.lineWidth=8;ctx.strokeStyle='rgba(0,0,30,.9)';ctx.strokeText(n,px,0);ctx.fillStyle=HE_MAU[he[i]]||'#fff';ctx.fillText(n,px,0);px+=ctx.measureText(n).width;});
    ctx.restore();}
  ctx.restore();return true;}
root.TTGHUD={draw:draw,ratio:IH/IW,G:G,ready:function(){return ok;}};
})(typeof window!=='undefined'?window:globalThis);
