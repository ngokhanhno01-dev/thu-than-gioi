/* ===== 108-do-giam.js (TTGDOGIAM): MÀN ĐỒ GIÁM, LẬT TRANG BỘ ẢNH 8 KHUNG + NỘI DUNG THÚ (28/11/2026) =====
   Mở: nút Đồ Giám (81-nut-moi.js). Chạm mũi tên ở góc trang, hoặc vuốt ngang, hoặc chạm vùng trống của trang = lật. Chạm 1 ô thú = mở bảng chi tiết (chạm bất kỳ đâu để đóng bảng).
   Đóng: nút X trên khung, chạm ngoài sách, Esc (Esc đóng bảng chi tiết trước).
   Ảnh: game-moi/do-giam/lat-0..7.webp (1280x718, nền trong suốt): 0 = sách phẳng (khung nghỉ), 1..7 = các khung lật. Lật tới: 0,1,2,3,4,5,6,7,0; lật lùi chạy ngược. Chỉnh nhịp lật ở NHIP.
   NỘI DUNG: mỗi VÙNG ĐÃ MỞ (THU_MOI.zones, xếp theo z) = 1 cặp trang, đúng 10 con: trang trái 6 con (3 Thường + 3 Hiếm), trang phải 4 con (2 Sử Thi trên; Huyền Thoại + Truyền Thuyết dưới), xếp theo độ hiếm (con thứ 10 là boss vùng, viền vàng). Cuối sách: 1 cặp trang Thú Thần (boss thế giới, 3 con ở trang trái; trang phải ghi lịch xuất hiện).
     Vùng chưa mở KHÔNG có trong THU_MOI.zones nên tự ẩn, số trang tự tính; thêm vùng mới vào 51-thu-moi.js là sách tự dài thêm.
     Ô thú: ĐÃ BẮT = ảnh màu + tên; CHƯA BẮT = bóng đen + "???". Cả hai đều hiện ĐỘ HIẾM (TTGCS.hiemInfo). Bảng chi tiết: V1/V2/V3 (ảnh b1..b3), Hệ (TTGCS.loai), Độ hiếm, NƠI GẶP (vùng / boss vùng / lịch boss Thần theo TTGBTG.CFG), trạng thái.
     "Đã bắt" = có trong kho thú hiện tại (TTGTHU.list) HOẶC từng bắt: nhớ ở khóa localStorage ttg_moi_dg_dabat_v1 (có tiền tố ttg_moi_ nên 51-thu-moi.js xóa cùng kho thú khi XOA_KHI_MO bật = chế độ test offline reset khi thoát game; khi tắt XOA_KHI_MO thì giữ lâu dài), nên thả thú đi vẫn không mất trong Đồ Giám. */
(function(root){
'use strict';
var D=document,IW=1280,IH=718,N=8,DIR='game-moi/do-giam/lat-',KDB='ttg_moi_dg_dabat_v1';
var NHIP=[{giu:0,hoa:55},{giu:15,hoa:55},{giu:15,hoa:55},{giu:15,hoa:55},{giu:15,hoa:55},{giu:15,hoa:60},{giu:15,hoa:70},{giu:20,hoa:130}];   /* 8 chặng: gốc->k1, k1->k2, ..., k6->k7, k7->gốc (tổng ~650ms) */
var XB={x:1197,y:122,r:48};   /* tâm + bán kính chạm của nút X, theo pixel ảnh */
/* BỐ CỤC (pixel ảnh 1280x718): tâm trang trái/phải, ô thú 140x138, hàng 1 = 3 ô, hàng 2 = 2 ô; mũi tên + số trang ở y=PY */
var CXT=367,CXP=919,CW=140,CH=138,GAPX=15,Y1=222,Y2=366,PY=517,AR={r:30,dx:-218};
var IMG=[],ov=null,cv=null,cx=null,page=0,anim=null,raf=0,down=null,chon=null,thieu=0,retry=0,rt=0,SIL={},dabat={};
/* ----- DỮ LIỆU ----- */
var TH_HIEM=['thuong','hiem','suthi','huyenthoai','truyenthuyet','than'];
function xepHiem(a){var k=function(t){var h=null;try{h=TTGCS.doHiem(t.id);}catch(e){}var i=TH_HIEM.indexOf(h);return i<0?0:i;};return a.map(function(t,i){return[t,i];}).sort(function(x,y){return(k(x[0])-k(y[0]))||(x[1]-y[1]);}).map(function(x){return x[0];});}
function trangList(){var L=[],zs=(root.THU_MOI&&THU_MOI.zones||[]).slice().sort(function(a,b){return a.z-b.z;});
  zs.forEach(function(z){L.push({k:'vung',z:z,thu:xepHiem(z.thu)});});
  if(root.THU_MOI&&THU_MOI.than&&THU_MOI.than.thu&&THU_MOI.than.thu.length)L.push({k:'than',z:THU_MOI.than,thu:THU_MOI.than.thu});
  return L;}
function docDaBat(){var o={};try{var a=JSON.parse(localStorage.getItem(KDB)||'{}');if(Array.isArray(a))a.forEach(function(i){o[i]=1;});else if(a&&typeof a==='object')Object.keys(a).forEach(function(i){o[i]=Math.max(1,Math.min(3,+a[i]||1));});}catch(e){}return o;}
function capNhatDaBat(){dabat=docDaBat();var moi=false;
  try{if(root.TTGTHU&&TTGTHU.list)TTGTHU.list().forEach(function(t){if(!t||!t.id)return;var v=Math.max(1,Math.min(3,+t.tien||1));if((dabat[t.id]||0)<v){dabat[t.id]=v;moi=true;}});}catch(e){}
  if(moi){try{localStorage.setItem(KDB,JSON.stringify(dabat));}catch(e){}}}
function heTen(k){return(root.TTGCS&&TTGCS.HE_TEN&&TTGCS.HE_TEN[k])||k;}
var HE_THAN={th1:['khonggian'],th2:['thoigian'],th3:['vocuc']};
function heCua(id){var l=null;try{l=root.TTGCS&&TTGCS.loai?TTGCS.loai(id):null;}catch(e){}var h=(l&&l.he&&l.he.length)?l.he:(HE_THAN[id]||[]);return h.map(heTen).join(' · ')||'Chưa rõ';}
function hiemCua(id){var h=null;try{h=root.TTGCS&&TTGCS.hiemInfo?TTGCS.hiemInfo(id):null;}catch(e){}return h||{ten:'Chưa rõ',mau:'#b9c0c9'};}
function gioStr(h){return h+'h';}
function noiGap(t,z,than){
  if(than){var C=(root.TTGBTG&&TTGBTG.CFG)||{},tt=C.thuTu||['th1','th2','th3'],i=tt.indexOf(t.id),kg=C.khungGio||4,ck=kg*tt.length,b=(C.batDauPhut||0),m=C.coMatPhut||30;
    var g=i<0?'':' · '+gioStr(i*kg)+(b?'':'')+' và '+gioStr(i*kg+ck)+' mỗi ngày (giờ VN), '+m+' phút';
    return['Boss thế giới'+g,'Vùng ngẫu nhiên, ai cũng thấy · Chỉ 1 người đánh 1 lúc'];}
  return[t.boss?'Boss vùng '+z.ten:'Vùng '+z.ten,t.boss?'Thám hiểm vùng này để chạm trán boss':'Gặp khi thám hiểm vùng này'];}
/* ----- NẠP ẢNH ----- */
function nap(){if(IMG.length)return;for(var i=0;i<N;i++){var im=new Image();im.onload=ve;im.src=DIR+i+'.webp?v=2';IMG.push(im);}}
function san(){return IMG.length===N&&IMG.every(function(i){return i.complete&&i.naturalWidth>0;});}
function build(){
  var s=D.createElement('style');s.textContent='#dg-ov{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(2,4,18,.78);-webkit-tap-highlight-color:transparent;touch-action:none;user-select:none;-webkit-user-select:none}#dg-ov canvas{position:static;display:block;image-rendering:auto}';D.head.appendChild(s);
  ov=D.createElement('div');ov.id='dg-ov';cv=D.createElement('canvas');ov.appendChild(cv);D.body.appendChild(ov);cx=cv.getContext('2d');
  ov.addEventListener('pointerdown',function(e){down={x:e.clientX,y:e.clientY};});
  ov.addEventListener('pointerup',function(e){if(!down)return;var d=down;down=null;var r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*IW,y=(e.clientY-r.top)/r.height*IH,dx=e.clientX-d.x;
    if(anim)return;
    if(Math.hypot(x-XB.x,y-XB.y)<=XB.r){close();return;}
    if(chon){chon=null;ve();return;}
    if(Math.abs(dx)>40){lat(dx<0?1:-1);return;}
    if(x<0||x>IW||y<0||y>IH){close();return;}
    if(Math.hypot(x-(CXT+AR.dx),y-PY)<=AR.r+8){lat(-1);return;}
    if(Math.hypot(x-(CXP-AR.dx),y-PY)<=AR.r+8){lat(1);return;}
    var o=oTai(x,y);if(o){chon=o;ve();return;}
    if(y>150&&y<560)lat(x>IW/2?1:-1);});
  ov.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();});
  root.addEventListener('resize',function(){if(isOpen()){size();ve();}});
  D.addEventListener('keydown',function(e){if(!isOpen())return;if(e.key==='Escape'){if(chon){chon=null;ve();}else close();}else if(e.key==='ArrowRight')lat(1);else if(e.key==='ArrowLeft')lat(-1);});}
function size(){var w=Math.min(innerWidth*.98,innerHeight*.98*IW/IH),h=w*IH/IW,d=Math.min(3,root.devicePixelRatio||1);cv.style.width=w+'px';cv.style.height=h+'px';cv.width=Math.round(w*d);cv.height=Math.round(h*d);}
/* trạng thái lúc t ms: [khung đang có, khung đang hòa vào, độ hòa 0..1, chặng] ; null = lật xong. Chỉ số khung 0..7 = ảnh lat-0..7 */
function moc(t,huong){var seq=huong>0?[0,1,2,3,4,5,6,7,0]:[0,7,6,5,4,3,2,1,0],i,n;
  for(i=0;i<N;i++){n=NHIP[i];if(t<n.giu)return[seq[i],seq[i],0,i];t-=n.giu;if(t<n.hoa){var u=t/n.hoa;return[seq[i],seq[i+1],u*u*(3-2*u),i];}t-=n.hoa;}
  return null;}
/* ----- Ô THÚ: danh sách ô của trang p = [{t,z,than,x,y,w,h,boss}] ----- */
function oCua(p){var tr=trangList()[p],o=[];if(!tr)return o;var th=tr.thu,than=tr.k==='than';
  for(var i=0;i<th.length;i++){var tp=i<6?0:1,j=tp?i-6:i,hang=tp?(j<2?0:1):(j<3?0:1),vt=tp?j%2:j%3,so=tp?2:3,cxx=tp?CXP:CXT;   /* trái 6 con (3+3: Thường, Hiếm), phải 4 con (2+2: Sử Thi / Huyền Thoại, Truyền Thuyết) */
    if(than){if(tp)continue;so=th.length;vt=i;hang=0;}
    var x0=cxx-(so*CW+(so-1)*GAPX)/2+vt*(CW+GAPX),y=hang?Y2:Y1;
    o.push({t:th[i],z:tr.z,than:than,x:x0,y:y,w:CW,h:CH,boss:!!th[i].boss&&!than});}
  return o;}
function oTai(x,y){var L=oCua(page);for(var i=0;i<L.length;i++){var o=L[i];if(x>=o.x&&x<=o.x+o.w&&y>=o.y&&y<=o.y+o.h)return o;}return null;}
/* ----- VẼ ----- */
function rr(x,y,w,h,r){cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath();}
function chuVe(t,x,y,px,mau,bold,vien,maxW,al){cx.save();cx.font=(bold?'bold ':'')+px+'px "Noto Serif",Georgia,serif';cx.textAlign=al||'center';cx.textBaseline='middle';
  if(maxW){var w=cx.measureText(t).width;if(w>maxW){px=Math.max(9,Math.floor(px*maxW/w));cx.font=(bold?'bold ':'')+px+'px "Noto Serif",Georgia,serif';}}
  if(vien){cx.lineWidth=px>16?5:4;cx.lineJoin='round';cx.strokeStyle='rgba(4,10,50,.9)';cx.strokeText(t,x,y);}
  cx.fillStyle=mau;cx.fillText(t,x,y);cx.restore();}
var CROP={};
function crop(id,bac){var k=id+'-'+bac,c=CROP[k];if(c)return c;if(!root.THU_MOI)return null;
  var t=D.createElement('canvas');t.width=t.height=192;var g=t.getContext('2d');
  if(!THU_MOI.draw(g,id,bac,96,192,192,false)){thieu=1;return null;}
  var d=g.getImageData(0,0,192,192).data,x0=192,y0=192,x1=-1,y1=-1,x,y;
  for(y=0;y<192;y++)for(x=0;x<192;x++)if(d[(y*192+x)*4+3]>24){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
  if(x1<0)return null;var w=x1-x0+1,h=y1-y0+1,c1=D.createElement('canvas');c1.width=w;c1.height=h;c1.getContext('2d').drawImage(t,x0,y0,w,h,0,0,w,h);
  var c2=D.createElement('canvas');c2.width=w;c2.height=h;var g2=c2.getContext('2d');g2.drawImage(c1,0,0);g2.globalCompositeOperation='source-in';g2.fillStyle='#050b2c';g2.fillRect(0,0,w,h);
  return CROP[k]={c:c1,s:c2,w:w,h:h};}
/* vẽ thú CẮT SÁT VIỀN, phóng vừa khít khung bw x bh, giữa theo x, chân tại by. da=false: bóng đen + dấu ? nằm trong thân. */
function veThu(id,bac,x,by,bw,bh,da){var e=crop(id,bac);if(!e)return false;
  var k=Math.min(bw/e.w,bh/e.h),w=e.w*k,h=e.h*k,dx=x-w/2,dy=by-h;
  cx.save();cx.imageSmoothingEnabled=true;try{cx.imageSmoothingQuality='high';}catch(er){}
  if(da)cx.drawImage(e.c,dx,dy,w,h);else{cx.globalAlpha=.92;cx.drawImage(e.s,dx,dy,w,h);}
  cx.restore();
  if(!da)chuVe('?',x,dy+h*.5,Math.max(18,Math.round(Math.min(w,h)*.5)),'rgba(170,200,255,.92)',true,true);
  return true;}
function veO(o){var t=o.t,id=t.id,da=!!dabat[id],h=hiemCua(id);
  cx.save();rr(o.x,o.y,o.w,o.h,12);cx.fillStyle=da?'rgba(10,22,78,.62)':'rgba(4,8,36,.58)';cx.fill();
  cx.lineWidth=o.boss?3:2;cx.strokeStyle=o.boss?'#ffd76a':(da?h.mau:'rgba(120,150,230,.55)');cx.stroke();
  if(o.boss){rr(o.x+4,o.y+4,o.w-8,o.h-8,9);cx.lineWidth=1;cx.strokeStyle='rgba(255,215,106,.55)';cx.stroke();}
  cx.restore();
  var mx=o.x+o.w/2;
  veThu(id,da?dabat[id]:1,mx,o.y+99,o.w-22,86,da);
  chuVe(da?t.ten:'???',mx,o.y+114,15,da?'#ffe9a8':'#9fb2e8',true,true,o.w-12);
  chuVe(h.ten,mx,o.y+129,11,h.mau,true,true,o.w-12);
  if(o.boss)chuVe('BOSS',o.x+o.w-24,o.y+14,10,'#ffd76a',true,true);}
function veMuiTen(huong,x,ok){cx.save();cx.globalAlpha=ok?1:.28;cx.beginPath();cx.arc(x,PY,AR.r-6,0,7);cx.fillStyle='rgba(8,18,70,.7)';cx.fill();cx.lineWidth=2;cx.strokeStyle='#ffd76a';cx.stroke();
  cx.beginPath();var d=huong*7;cx.moveTo(x-d,PY-9);cx.lineTo(x+d,PY);cx.lineTo(x-d,PY+9);cx.closePath();cx.fillStyle='#ffe9a8';cx.fill();cx.restore();}
function veTrang(a){
  var L=trangList(),tr=L[page];cx.save();cx.globalAlpha=a;
  if(!tr){chuVe('Chưa có nội dung',640,360,26,'#ffe9a8',true,true);cx.restore();return;}
  var than=tr.k==='than',z=tr.z,th=tr.thu,nb=0;th.forEach(function(t){if(dabat[t.id])nb++;});
  chuVe(than?'Thú Thần':z.ten,CXT,196,26,'#ffe9a8',true,true);
  if(than){chuVe('Boss thế giới',CXP,196,24,'#ffe9a8',true,true);
    var C=(root.TTGBTG&&TTGBTG.CFG)||{},m=C.coMatPhut||30,kg=C.khungGio||4,n=(C.thuTu||[1,2,3]).length;
    ['Mỗi boss xuất hiện '+m+' phút, cứ '+kg*n+' tiếng một lần','(giờ Việt Nam, xem giờ từng con khi chạm vào ô).','Vùng xuất hiện ngẫu nhiên, mọi người chơi','thấy giống nhau. Chỉ 1 người đánh 1 lúc.','','Chạm vào ô thú để xem chi tiết.'].forEach(function(s,i){chuVe(s,CXP,262+i*30,17,'#cfe0ff',false,true,440);});}
  else{var he=(root.TTGCS&&TTGCS.HE_VUNG&&TTGCS.HE_VUNG[z.z]);chuVe(he?'Hệ chủ đạo: '+heTen(he):'',CXP,196,20,'#9fd0ff',true,true);}
  chuVe('Đã bắt '+nb+'/'+th.length,150,200,14,'#cfe0ff',false,true,170,'left');   /* góc trên trái */
  oCua(page).forEach(veO);
  chuVe('Trang '+(page+1)+'/'+L.length,1130,200,14,'#cfe0ff',false,true,170,'right');   /* góc trên phải */
  veMuiTen(-1,CXT+AR.dx,page>0);veMuiTen(1,CXP-AR.dx,page<L.length-1);
  cx.restore();}
function veChiTiet(o){
  var t=o.t,id=t.id,da=!!dabat[id],h=hiemCua(id),ng=noiGap(t,o.z,o.than),px=250,py=178,pw=780,ph=350;
  cx.save();cx.fillStyle='rgba(14,30,104,.98)';rr(px,py,pw,ph,18);cx.fill();cx.lineWidth=3;cx.strokeStyle=o.boss||o.than?'#ffd76a':h.mau;cx.stroke();cx.restore();
  /* V1 V2 V3 */
  var xs=[px+95,px+235,px+375],ss=[104,128,150];
  for(var b=1;b<=3;b++){var i=b-1;veThu(id,b,xs[i],py+215,ss[i]*1.05,ss[i]*1.15,da&&b<=dabat[id]);chuVe('V'+b,xs[i],py+238,16,'#ffe9a8',true,true);}
  var tx=px+470,l=0;
  function dong(nh,gt,mau,px2,gd){chuVe(nh,tx,py+60+l,15,'#9fb2e8',false,true,260,'left');l+=gd?0:22;chuVe(gt,tx,py+60+l,px2||19,mau||'#ffe9a8',true,true,290,'left');l+=34;}
  chuVe(da?t.ten:'???',tx,py+34,28,da?'#ffe9a8':'#9fb2e8',true,true,290,'left');
  l=26;
  dong('Hệ',heCua(id));
  dong('Độ hiếm',h.ten,h.mau);
  chuVe('Nơi gặp',tx,py+60+l,15,'#9fb2e8',false,true,260,'left');l+=22;
  /* nơi gặp có thể dài: tự ngắt dòng ở dấu ' · ' */
  ng.forEach(function(s,i){var ps=s.split(' · ');ps.forEach(function(p){chuVe(p,tx,py+60+l,i?14:17,i?'#cfe0ff':'#7be0ff',!i,true,290,'left');l+=i?20:23;});});
  chuVe(da?'Đã bắt':'Chưa bắt',tx,py+ph-24,17,da?'#7dffa8':'#ff9a9a',true,true,290,'left');
  chuVe('Chạm để đóng',px+pw-20,py+ph-18,13,'rgba(207,224,255,.7)',false,true,200,'right');}
function ve(){
  if(!cx||!isOpen())return;thieu=0;cx.setTransform(1,0,0,1,0,0);cx.clearRect(0,0,cv.width,cv.height);
  if(!san())return;cx.setTransform(cv.width/IW,0,0,cv.height/IH,0,0);cx.imageSmoothingEnabled=true;try{cx.imageSmoothingQuality='high';}catch(e){}
  var m=anim?moc(performance.now()-anim.t0,anim.huong):null,a=1;
  if(!m){cx.drawImage(IMG[0],0,0);}
  else{cx.drawImage(IMG[m[0]],0,0);if(m[2]>0){cx.globalAlpha=m[2];cx.drawImage(IMG[m[1]],0,0);cx.globalAlpha=1;}
    a=0;if(m[3]===N-1)a=m[2];}   /* nội dung ẩn lúc trang bay, hiện dần khi sách phẳng lại */
  if(a>0){veTrang(a);if(chon&&!anim)veChiTiet(chon);}
  if(thieu&&retry<40&&!rt){retry++;rt=setTimeout(function(){rt=0;ve();},220);}}   /* ảnh thú nạp chậm: thử vẽ lại */
function buoc(){raf=0;if(!anim)return;if(!moc(performance.now()-anim.t0,anim.huong)){anim=null;ve();return;}ve();raf=requestAnimationFrame(buoc);}
/* huong: 1 = trang sau, -1 = trang trước. Đang lật hoặc hết trang thì bỏ qua. Trả true nếu bắt đầu lật. */
function lat(huong){if(anim||!isOpen()||!san())return false;var p=page+huong;if(p<0||p>=trangList().length)return false;chon=null;page=p;anim={t0:performance.now(),huong:huong};if(!raf)raf=requestAnimationFrame(buoc);return true;}
function isOpen(){return !!ov&&ov.style.display==='flex';}
function open(){nap();if(!ov)build();capNhatDaBat();page=0;chon=null;anim=null;retry=0;ov.style.display='flex';size();ve();}
function close(){anim=null;chon=null;if(raf){cancelAnimationFrame(raf);raf=0;}if(rt){clearTimeout(rt);rt=0;}if(ov)ov.style.display='none';}
root.TTGDOGIAM={open:open,close:close,isOpen:isOpen,lat:lat,NHIP:NHIP,trang:function(){return page;},soTrang:function(){return trangList().length;}};
})(typeof window!=='undefined'?window:globalThis);
