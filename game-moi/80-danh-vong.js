/* ===== 80-danh-vong.js (TTGDV): DANH VỌNG + CHỌN VÙNG (23/11/2026) =====
   DANH VỌNG
   - Có được khi GIẾT thú hoang / boss thú hoang (source 'demo'). Mỗi LOÀI chỉ tính 1 lần đầu giết (1 vùng = 9 thú hoang + 1 boss = 10 Danh Vọng).
   - Lưu localStorage khóa ttg_moi_dv = {kills:{idLoài:1}}. Danh Vọng = số loài đã giết. Không bị tiêu hao (chỉ là mốc mở khóa + trần cấp).
   - TRẦN CẤP thú nuôi tính theo VÙNG ĐÃ MỞ (không còn theo Danh Vọng): TTGCS.tranCap(số vùng mở) = min(270, 15 x số vùng mở). Mới vào Tuyết Nguyên = Lv.15, mở Sương Cốc = Lv.30... (54-thu-than.js đọc TTGDV.tran()). Danh Vọng chỉ còn là điều kiện mở vùng.
   - Hiển thị: ngôi sao + số trong ô nhỏ dưới chữ "Danh Vọng" ở khung trên (draw, gọi từ index.html sau drawExp). Tọa độ theo pixel khung-sanh.webp: sửa PLATE.
   CHỌN VÙNG
   - Bấm icon Thám hiểm (59-nut-tham-hiem.js) -> bảng chọn vùng dùng khung icon/khung-chon-vung.webp (18 ô = 2 cột x 9 hàng, tọa độ SLOT); chọn vùng đã mở thì đi Thám hiểm ngay (CFG.batDauNgay). Thanh tên vùng dưới icon Thám hiểm chỉ hiển thị vùng đang ở.
   - Vùng thứ n (n = 1, 2, 3...; theo z tăng dần trong THU_MOI.zones) cần 10 x (n-1) Danh Vọng để mở: vùng 1 mở sẵn, vùng 2 cần 10, vùng 3 cần 20... (CFG.moiVung).
   - Vùng đang chọn lưu ở ttg_moi_vung; Thám hiểm gặp thú/quái của VÙNG ĐÃ CHỌN (61-tham-hiem-tran.js đọc TTGDV.vung()).
   - Thử nhanh: thêm ?dv=30 vào link để tạm cộng 30 Danh Vọng (không lưu). */
(function(root){
'use strict';
var KEY='ttg_moi_dv',KEYV='ttg_moi_vung';
var FW=1672,FH=941,SLOT={x:[167,852],y:[161,238,316,392,468,544,620,695,769],w:654,h:60,rows:9,n:18};   /* khung-chon-vung.webp: 2 cột x 9 hàng = 18 ô, tọa độ theo ảnh gốc 1672x941. Cột trái = vùng 1-9, cột phải = vùng 10-18 */
var CFG={moiVung:10,devTaps:1,batDauNgay:true};   /* batDauNgay: chọn vùng xong tự đi Thám hiểm luôn (false = chỉ đổi vùng). */   /* devTaps = số lần chạm liên tiếp (trong 1,2s) vào chữ "Danh Vọng" để mở menu ẩn các nút test; 1 = chạm 1 lần, đặt 3-5 khi ra bản thật. */
var HOT={x0:118,x1:298,y0:88,y1:238},TOPH=816,BLEED={l:10,t:6};   /* vùng chữ "Danh Vọng" (px ảnh khung-sanh.webp) + số đo khung trên giống index.html (FRM.top.h, BG_BLEED) */
var PLATE={cx:198.5,cy:283.5,w:112,h:26};   /* ô xanh dưới chữ Danh Vọng, theo pixel ảnh khung-sanh.webp (1843x816) */
var S={kills:{}},IDX=0,extra=0,mo0=[];
try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');if(o&&o.kills&&typeof o.kills==='object')S.kills=o.kills;}catch(e){}
try{IDX=Math.max(0,Math.floor(+localStorage.getItem(KEYV))||0);}catch(e){}
try{var m=/[?&]dv=(\d+)/.exec(location.search);if(m)extra=Math.min(9999,+m[1]);}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function zones(){var z=(root.THU_MOI&&root.THU_MOI.zones)||[];return z.slice().sort(function(a,b){return a.z-b.z;});}
function get(){return Object.keys(S.kills).length+extra;}
function can(i){return CFG.moiVung*Math.max(0,i);}              /* Danh Vọng cần để mở vùng thứ i+1 (i = 0..) */
var MOALL='ttg_moi_moall',moAll=false;try{moAll=localStorage.getItem(MOALL)==='1';}catch(e){}   /* nút ẩn "Mở all map" (menu chữ Danh Vọng): bật = mọi vùng mở, chỉ để thử */
function moRoi(i){return moAll||get()>=can(i);}
function soVungMo(){var l=zones(),n=0;for(var i=0;i<l.length;i++)if(moRoi(i))n++;return Math.max(1,n);}   /* số vùng đã mở (vùng 1 luôn mở sẵn) */
function tran(){return root.TTGCS&&root.TTGCS.tranCap?root.TTGCS.tranCap(soVungMo()):0;}   /* trần cấp theo VÙNG đã mở: 1 vùng = Lv.15, 2 vùng = Lv.30... (CFG.capMoiVung ở 56-chi-so.js) */
function chi(){var l=zones();if(IDX>=l.length||!moRoi(IDX))IDX=0;return IDX;}   /* chỉ số vùng đang chọn (hợp lệ) */
function vung(){var l=zones(),z=l[chi()];return z?z.z:0;}
function ten(){var l=zones(),z=l[chi()];return z?z.ten+' Vùng '+(chi()+1):'';}
function set(i){var l=zones();i=Math.floor(+i)||0;if(i<0||i>=l.length)return false;if(!moRoi(i))return false;IDX=i;try{localStorage.setItem(KEYV,String(i));}catch(e){}capNhat();return true;}
/* thú hoang / boss thú hoang chết: ghi loài lần đầu. Trả về số Danh Vọng mới (0 hoặc 1); moMoi() = tên vùng vừa được mở. */
function kill(e){
  mo0=[];if(!e||e.source!=='demo'||!e.id)return 0;
  if(root.THU_MOI&&root.THU_MOI.byId&&!root.THU_MOI.byId[e.id])return 0;
  if(S.kills[e.id])return 0;
  var a=get();S.kills[e.id]=1;save();var b=get(),l=zones();
  for(var i=1;i<l.length;i++)if(can(i)>a&&can(i)<=b)mo0.push(l[i].ten);
  return 1;}
function moMoi(){return mo0.slice();}
/* ---- vẽ ngôi sao + số trong ô Danh Vọng. (ox,oy,s) = gốc và tỉ lệ vẽ ảnh khung trên ở góc trái ---- */
function star(c,x,y,R){c.beginPath();for(var k=0;k<10;k++){var a=-Math.PI/2+k*Math.PI/5,r=k%2?R*.44:R;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();}
function draw(c,ox,oy,s){
  var n=String(get()),cx=ox+PLATE.cx*s,cy=oy+PLATE.cy*s,h=PLATE.h*s,R=h*.6,fs=Math.max(8,Math.round(h*.78)),gap=h*.2,w,tw,x0;
  c.save();c.lineJoin='round';c.textBaseline='middle';c.textAlign='left';
  c.font='bold '+fs+'px sans-serif';tw=c.measureText(n).width;
  while(fs>7&&R*2+gap+tw>PLATE.w*s){fs--;c.font='bold '+fs+'px sans-serif';tw=c.measureText(n).width;}
  w=R*2+gap+tw;x0=cx-w/2;
  var sx=x0+R,sy=cy;
  var g=c.createLinearGradient(0,sy-R,0,sy+R);g.addColorStop(0,'#fff6b0');g.addColorStop(.55,'#ffc93a');g.addColorStop(1,'#e07a10');
  c.shadowColor='rgba(255,210,90,.95)';c.shadowBlur=R*.7;star(c,sx,sy,R);c.fillStyle=g;c.fill();
  c.shadowBlur=0;c.lineWidth=Math.max(1,R*.1);c.strokeStyle='#7a3d00';c.stroke();star(c,sx,sy,R*.62);c.fillStyle='rgba(255,250,200,.28)';c.fill();
  c.lineWidth=Math.max(2,fs*.26);c.strokeStyle='#020618';c.fillStyle='#fff3c4';
  c.strokeText(n,x0+R*2+gap,cy+fs*.04);c.fillText(n,x0+R*2+gap,cy+fs*.04);
  c.restore();}
/* ---- nút chọn vùng + bảng chọn ---- */
var btn=null,span=null,ov=null,tmr=0;
function css(){var s=document.createElement('style');s.textContent=[
'.nv .dv-vt{position:absolute;left:15.5%;width:69%;top:86.5%;height:7.1%;display:flex;align-items:center;justify-content:center;white-space:nowrap;font-family:"Palatino Linotype","Book Antiqua",Georgia,"Times New Roman",serif;font-style:italic;font-weight:800;letter-spacing:.01em;line-height:1;color:#ffe27a;pointer-events:none;text-shadow:0 0 .1em #fff2a8,0 0 .3em rgba(255,176,40,.8),.06em 0 0 #3a1a00,-.06em 0 0 #3a1a00,0 .06em 0 #3a1a00,0 -.06em 0 #3a1a00}',
'#dv-ov{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(2,4,18,.68);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-tap-highlight-color:transparent}',
'#dv-ov .dvp{position:relative;background:url(game-moi/icon/khung-chon-vung.webp?v=1) 0 0/100% 100% no-repeat;color:#fff;user-select:none;-webkit-user-select:none}',
'#dv-ov .dvw{display:flex;flex-direction:column;align-items:center;gap:6px}',
'#dv-ov .dvw .in{display:flex;gap:18px;font-size:14px;color:#bcd2ff;white-space:nowrap;line-height:1;text-shadow:0 1px 3px #000,0 0 6px #000}',
'#dv-ov .dvw .in em{font-style:normal;color:#ffe27a;font-weight:800}',
'#dv-ov .dvp .x{position:absolute;left:86.2%;top:10.8%;width:3.4%;height:6%;border:0;background:rgba(10,18,50,.75);border-radius:50%;color:#ffe27a;font-size:30em;line-height:1;cursor:pointer;padding:0}',
'#dv-ov .dvp .r{position:absolute;box-sizing:border-box;display:flex;align-items:center;gap:.6em;padding:0 3.6%;cursor:pointer;font-size:29em;line-height:1;font-weight:700;color:#e8f0ff;border-radius:8em;transition:background .12s}',
'#dv-ov .dvp .r:active{background:rgba(255,212,90,.16)}',
'#dv-ov .dvp .r .n{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'#dv-ov .dvp .r .n i{font-style:normal;font-weight:400;color:#9fb4e8;font-size:.82em}',
'#dv-ov .dvp .r .t{font-size:.82em;color:#bcd2ff;white-space:nowrap;font-weight:600}',
'#dv-ov .dvp .r.on{background:linear-gradient(90deg,rgba(255,212,90,.28),rgba(255,212,90,.08));box-shadow:0 0 0 1px rgba(255,226,122,.9) inset,0 0 .9em rgba(255,212,90,.55)}',
'#dv-ov .dvp .r.on .t{color:#ffe27a;font-weight:800}',
'#dv-ov .dvp .r.kh{opacity:.5;cursor:not-allowed;filter:grayscale(.4)}',
'#dv-ov .dvp .r.em{opacity:.32;cursor:default}',
'#dv-hot{position:fixed;z-index:7;background:transparent;-webkit-tap-highlight-color:transparent;touch-action:manipulation;cursor:default}',
'#dv-dev .dv-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:8px;padding:6px 12px 14px;overflow:auto}',
'#dv-dev .dv-b{padding:12px 8px;border-radius:9px;border:1px solid #3a4a8a;background:linear-gradient(180deg,#1a2352,#10173a);color:#fff;font:700 14px "Segoe UI",system-ui,sans-serif;cursor:pointer}',
'#dv-dev .dv-b:active{border-color:#ffd45a;background:#222c66}'
].join('\n');document.head.appendChild(s);}
function fit(){if(!span||!btn)return;var ch=span.clientHeight,cw=span.clientWidth;if(!ch||!cw)return;
  var fs=ch*.92;span.style.fontSize=fs.toFixed(2)+'px';var sw=span.scrollWidth;
  if(sw>cw)span.style.fontSize=(fs*cw/sw*.97).toFixed(2)+'px';}   /* chữ cao ~92% khung tên; tên dài thì thu nhỏ cho vừa bề ngang */
function capNhat(){if(span){span.textContent=ten();requestAnimationFrame(fit);}if(ov&&ov.style.display==='flex')lap();}
function lap(){
  var l=zones(),dv=get(),cur=chi(),tc=tran(),p=ov.querySelector('.dvp');
  ov.querySelector('.in').innerHTML='<span>★ Danh Vọng <em>'+dv+'</em></span><span>Trần cấp thú nuôi <em>Lv.'+tc+'</em></span>';
  var rs=p.querySelectorAll('.r');for(var k=rs.length-1;k>=0;k--)rs[k].remove();
  for(var i=0;i<SLOT.n;i++){(function(i){
    var z=l[i],d=document.createElement('div'),c=Math.floor(i/SLOT.rows),r=i%SLOT.rows,x=SLOT.x[c],y=SLOT.y[r];
    d.style.left=(x/FW*100)+'%';d.style.top=(y/FH*100)+'%';d.style.width=(SLOT.w/FW*100)+'%';d.style.height=(SLOT.h/FH*100)+'%';
    if(!z){d.className='r em';d.innerHTML='<div class="n">Sắp ra mắt</div>';p.appendChild(d);return;}
    var mo=moRoi(i),n=0;(z.thu||[]).forEach(function(t){if(S.kills[t.id])n++;});
    d.className='r'+(i===cur?' on':'')+(mo?'':' kh');
    d.innerHTML='<div class="n">'+z.ten+' <i>· Vùng '+(i+1)+'</i></div><div class="t">'+(i===cur?'● Đang ở · ':'')+(mo?(n+'/'+(z.thu||[]).length):'🔒 Cần '+can(i)+' ★')+'</div>';
    d.addEventListener('click',function(){
      if(!moRoi(i)){var inf=ov.querySelector('.in');inf.innerHTML='<span>🔒 Cần <em>'+can(i)+'</em> Danh Vọng để mở '+z.ten+' (hiện có <em>'+dv+'</em>)</span>';clearTimeout(tmr);tmr=setTimeout(function(){if(ov.style.display==='flex')lap();},2600);return;}   /* nhắc ngay dưới khung, không dùng toast (toast che các ô) */
      set(i);dong();
      if(CFG.batDauNgay&&root.TTGTHAMHIEM&&root.TTGTHAMHIEM.start)root.TTGTHAMHIEM.start();else toast('Đã chọn '+z.ten+' Vùng '+(i+1));});
    p.appendChild(d);})(i);}}
function size(){if(!ov)return;var p=ov.querySelector('.dvp'),w=Math.min(innerWidth*.97,(innerHeight*.97-28)*FW/FH);p.style.width=Math.round(w)+'px';p.style.height=Math.round(w*FH/FW)+'px';p.style.fontSize=(w/FW)+'px';}
function toast(t){try{if(root.TTGTBAO&&root.TTGTBAO.toast){root.TTGTBAO.toast(t);return;}}catch(e){}
  var d=document.createElement('div');d.textContent=t;d.style.cssText='position:fixed;left:50%;top:14%;transform:translateX(-50%);z-index:70;background:rgba(10,14,40,.92);color:#ffe27a;border:1px solid #d9b45a;border-radius:8px;padding:8px 14px;font:700 14px "Segoe UI",sans-serif;max-width:90vw;text-align:center';document.body.appendChild(d);setTimeout(function(){d.remove();},2200);}
function mo(){if(!ov)return;size();lap();ov.style.display='flex';}
/* ---- menu ẩn: gom nút TEST/ADMIN (TTGNV.cfg.dev) ---- */
var hot=null,dev=null,taps=0,tapT=0;
function moDev(){if(!dev)return;var g=dev.querySelector('.dv-g'),l=(root.TTGNV&&root.TTGNV.dev)||[];g.innerHTML='';
    (function(){var b=document.createElement('button');b.type='button';b.className='dv-b';b.textContent='Mở all map: '+(moAll?'BẬT':'TẮT');
    b.addEventListener('click',function(){moAll=!moAll;try{localStorage.setItem(MOALL,moAll?'1':'0');}catch(e){}b.textContent='Mở all map: '+(moAll?'BẬT':'TẮT');capNhat();});g.appendChild(b);})();
  l.forEach(function(it){var b=document.createElement('button');b.type='button';b.className='dv-b';b.textContent=it.o.ten||it.o.id;
    b.addEventListener('click',function(){try{if(it.o.id==='admin')dongDev();if(it.o.onTap)it.o.onTap(it.e);}catch(e){}});g.appendChild(b);});
  dev.style.display='flex';}
function dongDev(){if(dev)dev.style.display='none';}
function datHot(m){if(!hot)return;m=m||(root.TTGNV&&root.TTGNV.m&&root.TTGNV.m());if(!m)return;
  var f=m.K/m.DPR,s=m.th/(TOPH-BLEED.t),x=(m.I.l-BLEED.l*s+HOT.x0*s)*f,y=(-BLEED.t*s+HOT.y0*s)*f;
  hot.style.left=Math.round(x)+'px';hot.style.top=Math.round(y)+'px';hot.style.width=Math.round((HOT.x1-HOT.x0)*s*f)+'px';hot.style.height=Math.round((HOT.y1-HOT.y0)*s*f)+'px';hot.style.display='block';}
function dong(){if(ov)ov.style.display='none';}
function init(){
  if(!root.TTGNV||!root.THU_MOI||!root.TTGNV.add){return false;}
  btn=document.querySelector('.nv[data-id="tham-hiem"]');if(!btn)return false;
  css();
  ov=document.createElement('div');ov.id='dv-ov';
  ov.innerHTML='<div class="dvw"><div class="dvp"><button type="button" class="x" aria-label="Đóng">✕</button></div><div class="in"></div></div>';
  ov.addEventListener('click',function(e){if(e.target===ov)dong();});
  ov.querySelector('.x').addEventListener('click',dong);
  document.body.appendChild(ov);
  dev=document.createElement('div');dev.id='dv-dev';dev.className='dv-o2';dev.style.cssText='position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(2,4,18,.55);font-family:"Segoe UI",system-ui,sans-serif';
  dev.innerHTML='<div class="dv-pn" style="width:min(440px,92vw);max-height:86vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#171d44,#0b0f26);border:2px solid #d9b45a;border-radius:12px;color:#fff"><div class="dv-hd" style="display:flex;align-items:center;padding:10px 12px 4px;font-weight:800;font-size:16px;color:#ffe27a"><b style="flex:1">Menu thử (ẩn)</b><button type="button" class="dv-x" style="width:30px;height:30px;border-radius:8px;border:1px solid #d9b45a;background:#1b2250;color:#ffe27a;font-size:16px;cursor:pointer">✕</button></div><div class="dv-g"></div></div>';
  dev.addEventListener('click',function(e){if(e.target===dev)dongDev();});dev.querySelector('.dv-x').addEventListener('click',dongDev);document.body.appendChild(dev);
  hot=document.createElement('div');hot.id='dv-hot';hot.setAttribute('aria-hidden','true');hot.style.display='none';
  hot.addEventListener('click',function(){var t=Date.now();taps=(t-tapT<1200)?taps+1:1;tapT=t;if(taps>=CFG.devTaps){taps=0;moDev();}});
  document.body.appendChild(hot);
  /* nút dài ngay dưới nút Thám hiểm (hàng 1, kéo lên sát nút trên): ảnh 1200x190 -> 200 x 31,7 */
  /* tên vùng nằm trong khung dài của icon Thám hiểm (59-nut-tham-hiem.js) */
  span=document.createElement('span');span.className='dv-vt';btn.appendChild(span);
  var lay0=root.TTGNV.layout;root.TTGNV.layout=function(m){lay0(m);datHot(m);requestAnimationFrame(fit);};
  capNhat();datHot();window.addEventListener('resize',function(){size();requestAnimationFrame(fit);});
  return true;}
root.TTGDV={CFG:CFG,PLATE:PLATE,get:get,tran:tran,can:can,kill:kill,moMoi:moMoi,vung:vung,ten:ten,set:set,draw:draw,mo:mo,dong:dong,zones:zones};
if(!init()){var tries=0,iv=setInterval(function(){if(init()||++tries>40)clearInterval(iv);},250);}
})(typeof window!=='undefined'?window:globalThis);
