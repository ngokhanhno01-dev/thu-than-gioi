/* CHỌN THÚ ĐỒNG HÀNH (màn chọn thú lúc mới vào game).
   Hiện ngay sau màn chờ (nằm DƯỚI màn chờ nên khi màn chờ mờ đi là thấy luôn). Phủ toàn màn hình ngang (780x360 logic, co giãn theo máy).
   Khung = game-moi/khung-chon-thu.webp (1670x941 từ 25/11/2026, đã bỏ dấu X vẽ sẵn, nền trong suốt; chưa có thì thử khung-chon-thu.png; không có cả hai thì vẽ khung tạm).
   Mọi vị trí (tiêu đề, thanh thông tin, 3 bục, 3 bảng tên, nút Xác Nhận, nút X) tính theo TỌA ĐỘ ẢNH GỐC 2505x1412 (hàm B bên dưới), đổi ảnh khung thì chỉnh số ở đó.

   THÚ: 3 thú khởi đầu k2 Lưu Diêu (Thủy), k1 Viêm Sư (Hỏa), k3 Lâm Trư (Mộc), id khớp THU_MOI (51-thu-moi.js). Id nào chưa có trong THU_MOI thì bục hiện dấu "?".
   TEST: ALWAYS=true => mỗi lần mở game đều hiện. Khi làm thật đổi ALWAYS=false => chỉ hiện khi chưa chọn thú. Link có ?chon-thu=1 luôn ép hiện.
   LƯU: lựa chọn ghi ở khóa ttg_moi_starter_v1 = {slot, id, bac, t}.
   BẤM XÁC NHẬN (21/11/2026) = BẮT ĐẦU TÀI KHOẢN MỚI, XÓA TRẮNG như người chơi lần đầu: xóa MỌI khóa localStorage ttg_moi_* (kho thú, thú ra trận, danh sách thả, thú ở sảnh, Balo/Châu/sách, khóa đồ, kiểu xếp...) TRỪ lựa chọn thú đầu, bố cục nút (ttg_moi_layout_v1) và cài đặt khung HD (ttg_moi_hd) (xem GIU bên dưới); đồng thời reset Balo trong bộ nhớ bằng TTGBALO.xoaTrang() (53-balo.js). Rồi phát đúng 1 con thú vừa chọn vào kho với Lv.1, Bậc 1 và RANK RANDOM bằng TTGCS.tungBac() (cùng bảng tỉ lệ E..SS như lúc bắt thú ở Thám hiểm), cho RA TRẬN luôn => sảnh hiện đúng thú đã chọn. Việc xóa kho thú + phát thú do TTGTHU.khoiTao() (54-thu-than.js) làm.
   QUÀ KHỞI ĐẦU (25/11/2026): ngay SAU khi xóa trắng + phát thú, tặng CFG_CHAU_DAU (mặc định 10) Ngự Thú Châu BẬC 1 vào Balo (TTGBALO.add(TTGBONG.idBong(1), n), 58-bong-bat.js). Chỉ cộng khi bấm Xác Nhận thật (nút X không cộng). Sau khi màn chọn đóng, hiện BẢNG THÔNG BÁO nhận châu (baoQua). Chế độ ?thu=demo thì KHÔNG tặng (giữ nguyên Balo demo).
   Sự kiện 'ttg-starter' (detail = {slot,id,bac,uid}) vẫn bắn như cũ; TTGSTARTER.get() trả lựa chọn đã lưu.
   CHỌN NHÂN VẬT (26/11/2026): trước màn chọn thú có màn chọn Nam/Nữ (64b-chon-nhan-vat.js, TTGNHANVAT.show). Xác Nhận ở màn đó xong mới mở màn chọn thú này. Không nạp 64b thì mở thẳng như cũ.
   KHÔNG CÒN NÚT X (25/11/2026): người chơi bắt buộc chọn thú rồi bấm Xác Nhận mới vào game, không đóng được màn này. Nút Xác Nhận chỉ bấm được sau khi chọn 1 bục. */
(function(){
'use strict';
if(window.TTG_BLOCK)return;
var ALWAYS=true,KEY='ttg_moi_starter_v1',IW=2505,IH=1412,TIER=1;
var CFG_CHAU_DAU=10;   /* số Ngự Thú Châu BẬC 1 tặng khi chọn thú đầu (đặt 0 để tắt) */
var TXT_QUA_TIEU_DE='Quà Khởi Đầu',TXT_QUA_MO_TA='Ngự Thú Châu dùng để bắt thú hoang khi thám hiểm. Châu đã được cất trong Túi Trữ Vật, hãy mở Túi Trữ Vật để xem.';   /* chữ trong bảng thông báo quà (dễ sửa) */
var GIU=['ttg_moi_starter_v1','ttg_moi_layout_v1','ttg_moi_hd','ttg_moi_nhanvat_v1','ttg_moi_nhanvat_skin_v1'];   /* khóa KHÔNG xóa khi xóa trắng: lựa chọn thú đầu + nhân vật/skin (64b-chon-nhan-vat.js) + cài đặt giao diện (không phải dữ liệu chơi) */
var STARTERS=[
 {id:'k2',ten:'Lưu Diêu',mota:'Thường + Thủy · Nhanh'},
 {id:'k1',ten:'Viêm Sư',mota:'Thường + Hỏa · Công'},
 {id:'k3',ten:'Lâm Trư',mota:'Thường + Mộc · Tank'}];
var PX=[500,1255,2015];/* tâm 3 bục (px ảnh gốc) */
var HINT='Chạm vào một bục để chọn thú đồng hành';
var SRC=['game-moi/khung-chon-thu.webp?v=2','game-moi/khung-chon-thu.png?v=2'];
var root=null,sel=-1,raf=0,locked=false,cvs=[],infoEl,okDim,frameOk=false;
function read(){try{return JSON.parse(localStorage.getItem(KEY)||'null');}catch(e){return null;}}
function B(x0,y0,x1,y1){return 'left:'+(x0/IW*100).toFixed(3)+'%;top:'+(y0/IH*100).toFixed(3)+'%;width:'+((x1-x0)/IW*100).toFixed(3)+'%;height:'+((y1-y0)/IH*100).toFixed(3)+'%;';}
function css(){
 var s=document.createElement('style');
 s.textContent=
 '#cht{position:fixed;left:0;right:0;top:0;bottom:0;z-index:100;opacity:0;transition:opacity .4s ease;touch-action:none;-webkit-tap-highlight-color:transparent;font-family:sans-serif;color:#fff;-webkit-user-select:none;user-select:none}'+
 '#cht.on{opacity:1}#cht.off{opacity:0;pointer-events:none}'+
 '#cht .bx{position:absolute;left:env(safe-area-inset-left,0px);right:env(safe-area-inset-right,0px);top:0;bottom:env(safe-area-inset-bottom,0px);background-size:100% 100%;background-repeat:no-repeat}'+
 '#cht.nofr .bx{background:linear-gradient(180deg,#0b1030,#1d1650);box-shadow:inset 0 0 0 .6vh #d9b24c}'+
 '#cht .a{position:absolute;box-sizing:border-box}'+
 '#cht .tx{display:flex;align-items:center;justify-content:center;text-align:center;font-weight:bold;font-size:clamp(9px,3.2vh,18px);line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 1%;text-shadow:0 0 .7vh #02122a,0 .25vh 0 #02122a,0 -.25vh 0 #02122a,.25vh 0 0 #02122a,-.25vh 0 0 #02122a}'+
 '#cht .inf{color:#bfefff}#cht .inf.warn{color:#ffd45a;animation:chtsk .35s}'+
 '#cht .nm{color:#fff2c0}'+
 '#cht.nofr .inf,#cht.nofr .nm{border:1px solid #d9b24c;background:rgba(0,0,40,.5)}'+
 '#cht .slot{cursor:pointer}'+
 '#cht .gl{opacity:0;transition:opacity .25s;background:radial-gradient(ellipse at 50% 50%,rgba(255,236,150,.95) 0%,rgba(120,255,240,.55) 38%,rgba(120,255,240,0) 70%);pointer-events:none}'+
 '#cht .slot.on .gl{opacity:1;animation:chtgl 1.2s ease-in-out infinite}'+
 '#cht .pl{position:absolute;pointer-events:none;border-radius:1vh;transition:box-shadow .25s}'+
 '#cht .slot.on .pl{box-shadow:0 0 0 .35vh #ffe9a0,0 0 2.4vh rgba(120,255,240,.9)}'+
 '#cht canvas.pt{position:absolute;image-rendering:auto;pointer-events:none;transition:transform .25s,filter .25s;transform-origin:50% 100%}'+
 '#cht .slot.on canvas.pt{transform:scale(1.1);filter:drop-shadow(0 0 1.4vh #ffe27a)}'+
 '#cht .q{position:absolute;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:15vh;line-height:1;color:rgba(170,235,255,.9);text-shadow:0 0 2.5vh #4fd8ff,0 0 .8vh #fff;pointer-events:none;animation:chtfl 2.6s ease-in-out infinite}'+
 '#cht .slot.on .q{color:#fff2c0;text-shadow:0 0 3vh #ffd45a,0 0 .8vh #fff}'+
 '#cht .ok{cursor:pointer}'+
 '#cht .okd{background:rgba(4,8,36,.58);border-radius:2.2vh;pointer-events:none;transition:opacity .25s}'+
 '#cht.ready .okd{opacity:0}#cht.ready .okg{animation:chtgl 1.2s ease-in-out infinite;opacity:1}'+
 '#cht .okg{opacity:0;border-radius:2.2vh;box-shadow:0 0 2.2vh rgba(255,236,150,.9);pointer-events:none}'+
 '#cht.nofr .ok{border:1px solid #d9b24c;background:rgba(0,0,40,.6)}'+
 '@keyframes chtgl{0%,100%{filter:brightness(.8)}50%{filter:brightness(1.25)}}'+
 '@keyframes chtfl{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.2vh)}}'+
 '@keyframes chtsk{0%,100%{transform:translateX(0)}25%{transform:translateX(-1vh)}75%{transform:translateX(1vh)}}';
 document.head.appendChild(s);}
function build(src){
 css();frameOk=!!src;
 root=document.createElement('div');root.id='cht';if(!frameOk)root.className='nofr';
 var h='<div class="bx" id="cht-bx"'+(frameOk?' style="background-image:url('+src+')"':'')+'>';
 h+='<div class="a tx inf" id="cht-inf" style="'+B(535,228,1975,312)+'">'+HINT+'</div>';
 for(var i=0;i<3;i++){var cx=PX[i];
  h+='<div class="a slot" data-i="'+i+'" style="'+B(cx-300,330,cx+300,1050)+'">'+
   '<div class="a gl" style="'+B(cx-300,740-330,cx+300,890-330)+'"></div>'+
   '<div class="pl" style="'+B(cx-210,893-330,cx+210,1003-330)+'"></div>'+
   '<div class="q" data-q="'+i+'" style="'+B(cx-150,420-330,cx+150,820-330)+'">?</div>'+
   '<canvas class="pt" data-c="'+i+'"></canvas>'+
   '<div class="a tx nm" style="'+B(cx-175,903-330,cx+175,993-330)+'">'+STARTERS[i].ten+'</div></div>';}
 h+='<div class="a ok tx" id="cht-ok" style="'+B(900,1150,1610,1320)+'">'+(frameOk?'':'Xác Nhận')+'</div>';
 h+='<div class="a okd" id="cht-okd" style="'+B(975,1183,1535,1292)+'"></div><div class="a okg" style="'+B(975,1183,1535,1292)+'"></div>';
 h+='</div>';
 root.innerHTML=h;document.body.appendChild(root);
 infoEl=document.getElementById('cht-inf');okDim=document.getElementById('cht-okd');
 /* slot: tọa độ con tính theo ô slot (bắt đầu ở y=330 của ảnh gốc, ngang tâm khác nhau => đổi lại left theo ô slot) */
 var slots=root.querySelectorAll('.slot');
 for(i=0;i<3;i++){var sl=slots[i],cx2=PX[i],sw=600,ch=sl.querySelectorAll('.a,.pl,.q');
  /* left của phần tử con tính lại tương đối ô slot (ô slot rộng 600 px ảnh gốc, tâm = cx) */
  for(var j=0;j<ch.length;j++){var e=ch[j],l=parseFloat(e.style.left)/100*IW,w=parseFloat(e.style.width)/100*IW;e.style.left=((l-(cx2-300))/sw*100).toFixed(3)+'%';e.style.width=(w/sw*100).toFixed(3)+'%';
   var t=parseFloat(e.style.top)/100*IH,hh=parseFloat(e.style.height)/100*IH;e.style.top=(t/720*100).toFixed(3)+'%';e.style.height=(hh/720*100).toFixed(3)+'%';}
  cvs[i]=sl.querySelector('canvas.pt');
  sl.addEventListener('click',(function(k){return function(){pick(k);};})(i));}
 document.getElementById('cht-ok').addEventListener('click',confirm);
 sizeCv();window.addEventListener('resize',sizeCv);
 for(i=0;i<3;i++)if(STARTERS[i].id)root.querySelector('[data-q="'+i+'"]').style.display='none';
 requestAnimationFrame(function(){root.className+=' on';});
 loop();}
/* khung thú trên mỗi bục: vuông, cao ~ 30,8% chiều cao màn hình, đáy nằm trên mặt bục (y=835 ảnh gốc) */
function sizeCv(){if(!root)return;var d=window.devicePixelRatio||1,ph=innerHeight*.308,sl=root.querySelectorAll('.slot');
 for(var i=0;i<3;i++){var c=cvs[i],r=sl[i].getBoundingClientRect();if(!c)continue;
  c.style.width=ph+'px';c.style.height=ph+'px';c.style.left=((r.width-ph)/2)+'px';c.style.top=((835-330)/720*r.height-ph)+'px';
  c.width=Math.max(2,Math.round(ph*d));c.height=c.width;}}
function loop(){raf=0;if(!root||root.className.indexOf('off')>=0)return;
 if(!document.hidden&&window.THU_MOI){
  for(var i=0;i<3;i++){var id=STARTERS[i].id,c=cvs[i];if(!id||!c||!THU_MOI.byId||!THU_MOI.byId[id])continue;
   var g=c.getContext('2d'),sc=c.width/130,bob=Math.sin(performance.now()/380+i)*2;
   g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,c.width,c.height);g.setTransform(sc,0,0,sc,0,0);
   try{THU_MOI.setFrame(192);THU_MOI.draw(g,id,TIER,65,126+bob,176,true);}catch(e){}}}
 raf=requestAnimationFrame(loop);}
function say(s,warn){infoEl.textContent=s;infoEl.className='a tx inf'+(warn?' warn':'');}
function pick(i){if(locked)return;sel=i;
 var sl=root.querySelectorAll('.slot');for(var k=0;k<3;k++)sl[k].classList.toggle('on',k===i);
 say(STARTERS[i].ten+' — '+STARTERS[i].mota);root.classList.add('ready');}
/* XÓA TRẮNG: xóa mọi khóa localStorage ttg_moi_* (trừ GIU) + reset Balo trong bộ nhớ. Kho thú do TTGTHU.khoiTao() lo (gọi SAU hàm này vì nó ghi lại kho). */
function xoaTrang(){
 try{var ks=[],i;for(i=0;i<localStorage.length;i++)ks.push(localStorage.key(i));
  ks.forEach(function(k){if(k&&k.indexOf('ttg_moi_')===0&&GIU.indexOf(k)<0)localStorage.removeItem(k);});}catch(e){}
 try{if(window.TTGBALO&&TTGBALO.xoaTrang)TTGBALO.xoaTrang();}catch(e){}
}
/* TẶNG CHÂU KHỞI ĐẦU: cộng CFG_CHAU_DAU Ngự Thú Châu bậc 1 vào Balo. Gọi SAU xoaTrang() (nếu không sẽ bị xóa mất). Trả số châu đã cộng (0 nếu không cộng được / đang ?thu=demo). */
function tangChau(){
 if(!(CFG_CHAU_DAU>0)||/[?&]thu=demo/.test(location.search))return 0;
 try{if(window.TTGBALO&&TTGBALO.add&&window.TTGBONG&&TTGBONG.idBong){TTGBALO.add(TTGBONG.idBong(1),CFG_CHAU_DAU);return CFG_CHAU_DAU;}}catch(e){}
 return 0;}
/* BẢNG THÔNG BÁO QUÀ KHỞI ĐẦU: hiện sau khi màn chọn thú đã đóng, để người chơi biết mình vừa nhận gì và châu dùng làm gì (64-thong-bao.js, TTGTBAO.info). Tên/icon châu lấy từ Balo nên luôn khớp tên trong Balo. */
function baoQua(n){
 if(!(n>0)||!window.TTGTBAO||!TTGTBAO.info)return;
 var it=(window.TTGBALO&&TTGBALO.CAT&&window.TTGBONG&&TTGBONG.idBong)?TTGBALO.CAT[TTGBONG.idBong(1)]:null,
  ten=(it&&it.ten)||'Ngự Thú Châu',ic=it?(it.img?'<img src="'+it.img+'" alt="">':(it.ic||'?')):'?';
 TTGTBAO.info({icon:ic,tc:'y',modal:true,title:TXT_QUA_TIEU_DE,sub:'Nhận được <b>'+ten+' x'+n+'</b> (bậc 1)',text:TXT_QUA_MO_TA},[{t:'Đã hiểu'}]);}
/* XÁC NHẬN: bắt đầu tài khoản mới (xóa trắng). Rank tung bằng TTGCS.tungBac() = cùng bảng tỉ lệ với lúc bắt thú (62-bat-thu.js, tungBacChau). Chưa nạp TTGCS thì rơi về 'E'. */
function confirm(){if(locked)return;
 if(sel<0){say('Hãy chọn một thú trước!',true);setTimeout(function(){if(sel<0&&!locked)say(HINT);},1400);return;}
 locked=true;
 var s=STARTERS[sel],bac=(window.TTGCS&&TTGCS.tungBac)?TTGCS.tungBac():'E',uid=null;
 var r={slot:sel,id:s.id||null,bac:bac,t:Date.now()};
 xoaTrang();
 try{localStorage.setItem(KEY,JSON.stringify(r));}catch(e){}
 if(s.id&&window.TTGTHU&&TTGTHU.khoiTao){
  try{uid=TTGTHU.khoiTao({id:s.id,ten:s.ten,bac:bac,tien:1,lv:1,chiso:{},kn:[null,null,null,null,null,null]});}catch(e){}}
 r.uid=uid;
 var nChau=tangChau();
 say('Đã chọn '+s.ten+' · Rank '+bac+(nChau?' · +'+nChau+' Ngự Thú Châu bậc 1':'')+'!');
 try{window.dispatchEvent(new CustomEvent('ttg-starter',{detail:r}));}catch(e){}
 setTimeout(function(){close(true);setTimeout(function(){baoQua(nChau);},520);},700);}   /* đợi màn chọn mờ hẳn (~500ms) rồi mới hiện bảng quà */
function close(){if(!root)return;root.className=root.className.replace(' on','').replace(' ready','')+' off';
 var r=root;root=null;if(raf){cancelAnimationFrame(raf);raf=0;}window.removeEventListener('resize',sizeCv);
 setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);},500);}
var daQuaNV=false;
function show(force){if(root)return;
 var NV=window.TTGNHANVAT&&TTGNHANVAT.show?TTGNHANVAT:null;
 if(!force&&!ALWAYS&&read()){   /* đã chọn thú rồi: chỉ nhắc chọn nhân vật nếu người chơi cũ chưa có nhân vật */
  if(NV&&!daQuaNV&&!NV.get()){daQuaNV=true;NV.show();}
  return;}
 /* LUỒNG: màn chờ -> CHỌN NHÂN VẬT (64b-chon-nhan-vat.js) -> chọn thú. Chọn nhân vật xong mới mở màn chọn thú. */
 if(NV&&!daQuaNV){daQuaNV=true;NV.show(function(){show(force);},ALWAYS||force);return;}
 sel=-1;locked=false;cvs=[];
 var im=new Image(),n=0;
 im.onload=function(){build(SRC[n]);};
 im.onerror=function(){n++;if(n<SRC.length)im.src=SRC[n];else build(null);};
 im.src=SRC[0];}
window.TTGSTARTER={get:read,show:function(){show(true);},reset:function(){try{localStorage.removeItem(KEY);}catch(e){}},list:STARTERS};
show(/[?&]chon-thu=1/.test(location.search));
})();
