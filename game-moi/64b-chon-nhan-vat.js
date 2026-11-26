/* CHỌN NHÂN VẬT (TTGNHANVAT): màn chọn Nam / Nữ, hiện SAU màn chờ và TRƯỚC màn chọn thú (65-chon-thu-dau.js).
   LUỒNG: màn chờ -> chọn nhân vật (file này) -> chọn thú đồng hành (65) -> vào game.
   65-chon-thu-dau.js gọi TTGNHANVAT.show(callback) khi cần mở màn chọn thú; người chơi bấm Xác Nhận ở đây xong mới chạy callback (mở màn chọn thú).
   Không có màn này (file chưa nạp) thì 65 mở thẳng như cũ.

   LƯU: khóa ttg_moi_nhanvat_v1 = {gioi:'nu'|'nam', skin:'mac-dinh', t}. Khóa này nằm trong GIU của 65 nên KHÔNG bị xóa khi xóa trắng tài khoản.
   BẮT BUỘC chọn: không có nút đóng, phải chọn 1 nhân vật rồi bấm Xác Nhận.
   TEST: link có ?nhan-vat=1 luôn ép hiện (kể cả đã chọn). Chế độ bình thường: chỉ hiện khi chưa chọn nhân vật, HOẶC khi 65 đang để ALWAYS=true (test) thì 65 gọi show(cb,true) để hiện mỗi lần.

   SKIN (phần thưởng, làm sau): mọi ảnh nằm ở game-moi/nhan-vat/<gioi>/<skin>-chon.png (nhìn thẳng, 512x512, dùng ở màn chọn) và <skin>-map.png (quay PHẢI, 512x512, dùng ở bản đồ thám hiểm, chân sát đáy ảnh, giữa ảnh theo chiều ngang).
   Thêm skin mới: (1) bỏ 2 ảnh trên vào game-moi/nhan-vat/<gioi>/ với tên <idSkin>-chon.png và <idSkin>-map.png, (2) thêm 1 dòng vào SKINS bên dưới, (3) mở khóa cho người chơi bằng TTGNHANVAT.moKhoa('<gioi>','<idSkin>') rồi TTGNHANVAT.datSkin('<idSkin>').
   Skin đã mở lưu ở ttg_moi_nhanvat_skin_v1 (cũng nằm trong GIU để không mất khi xóa trắng). Skin 'mac-dinh' luôn mở sẵn.
   API: get() (lựa chọn đã lưu hoặc null), show(cb,ep), anhMap() (đường dẫn ảnh map của nhân vật đang chọn, dùng ở 89-tham-hiem-map.js), anhChon(), gioi(), skin(), datSkin(id), moKhoa(gioi,id), daMo(gioi,id), SKINS. */
(function(){
'use strict';
if(window.TTG_BLOCK)return;
var KEY='ttg_moi_nhanvat_v1',KEYSK='ttg_moi_nhanvat_skin_v1',DIR='game-moi/nhan-vat/',V='?v=1';
var GIOI=[
 {id:'nu',ten:'Nữ Tu Sĩ',mota:'Lanh lợi, nhẹ nhàng như tuyết'},
 {id:'nam',ten:'Nam Tu Sĩ',mota:'Kiên cường, thẳng như trúc'}];
var SKINS={
 nu:[{id:'mac-dinh',ten:'Đệ Tử Tuyết Môn'}],
 nam:[{id:'mac-dinh',ten:'Đệ Tử Tuyết Môn'}]};
var root=null,sel=-1,locked=false,cb=null;
function rd(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function get(){var o=rd(KEY);return(o&&(o.gioi==='nu'||o.gioi==='nam'))?o:null;}
function gioi(){var o=get();return o?o.gioi:'nu';}
function skin(){var o=get();return(o&&o.skin)||'mac-dinh';}
function daMo(g,id){if(id==='mac-dinh')return true;var o=rd(KEYSK)||{};return !!(o[g]&&o[g][id]);}
function moKhoa(g,id){var o=rd(KEYSK)||{};if(!o[g])o[g]={};o[g][id]=1;wr(KEYSK,o);}
function datSkin(id){var o=get();if(!o||!daMo(o.gioi,id))return false;o.skin=id;wr(KEY,o);return true;}
function anh(g,s,loai){return DIR+g+'/'+s+'-'+loai+'.png'+V;}
function anhMap(){var o=get();var g=o?o.gioi:'nu',s=(o&&o.skin)||'mac-dinh';if(!daMo(g,s))s='mac-dinh';return anh(g,s,'map');}
/* dải khung đi bộ: 4 khung 512x512 xếp ngang (2048x512): khung 1 và 3 = bước chân, 2 và 4 = tư thế đứng/chuyển. huong: 'phai' (ngang, quay phải; quay trái thì lật) hoặc 'truoc' (chính diện). Chưa có file -> map tự dùng ảnh đứng yên anhMap(). */
function anhDi(huong){var o=get();var g=o?o.gioi:'nu',s=(o&&o.skin)||'mac-dinh';if(!daMo(g,s))s='mac-dinh';return DIR+g+'/'+s+'-di-'+huong+'.png'+V;}
function anhChon(g){var o=get();var s=(o&&o.gioi===g&&o.skin)||'mac-dinh';if(!daMo(g,s))s='mac-dinh';return anh(g,s,'chon');}
function css(){
 var s=document.createElement('style');
 s.textContent=
 '#cnv{position:fixed;left:0;right:0;top:0;bottom:0;z-index:101;opacity:0;transition:opacity .4s ease;touch-action:none;-webkit-tap-highlight-color:transparent;font-family:sans-serif;color:#fff;-webkit-user-select:none;user-select:none;background:radial-gradient(ellipse at 50% 38%,#26337a 0%,#10173f 55%,#070a22 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:env(safe-area-inset-top,0) env(safe-area-inset-right,0) env(safe-area-inset-bottom,0) env(safe-area-inset-left,0)}'+
 '#cnv.on{opacity:1}#cnv.off{opacity:0;pointer-events:none}'+
 '#cnv .tt{font-weight:800;font-size:clamp(14px,5.2vh,30px);color:#ffe9a0;letter-spacing:.04em;text-shadow:0 0 1.4vh rgba(255,200,80,.7),0 .3vh 0 #1a1000;margin-bottom:.6vh}'+
 '#cnv .inf{min-height:1.4em;font-size:clamp(10px,3.4vh,17px);color:#bfefff;text-shadow:0 .25vh 0 #02122a;margin-bottom:1.6vh;text-align:center;padding:0 3%}'+
 '#cnv .inf.warn{color:#ffd45a;animation:cnvsk .35s}'+
 '#cnv .row{display:flex;gap:clamp(14px,5vw,56px);align-items:stretch;justify-content:center}'+
 '#cnv .cd{position:relative;justify-content:space-between;width:clamp(120px,32vh,230px);cursor:pointer;display:flex;flex-direction:column;align-items:center;padding:1.2vh 1vh 1.6vh;border-radius:2vh;border:.4vh solid rgba(217,178,76,.45);background:linear-gradient(180deg,rgba(40,56,130,.55),rgba(14,20,60,.7));transition:transform .2s,border-color .2s,box-shadow .2s}'+
 '#cnv .cd img{width:100%;aspect-ratio:1/1;object-fit:contain;image-rendering:pixelated;pointer-events:none;filter:brightness(.8) saturate(.85);transition:filter .2s,transform .2s;transform-origin:50% 100%}'+
 '#cnv .cd .nm{margin-top:.6vh;font-weight:800;font-size:clamp(10px,3.6vh,18px);color:#fff2c0;text-shadow:0 .25vh 0 #02122a}'+
 '#cnv .cd .ms{margin-top:.3vh;font-size:clamp(8px,2.6vh,13px);color:#a9c4ff;text-align:center;line-height:1.2}'+
 '#cnv .cd.on{transform:translateY(-1vh);border-color:#ffe9a0;box-shadow:0 0 0 .3vh #ffe9a0,0 0 3vh rgba(255,226,122,.75)}'+
 '#cnv .cd.on img{filter:none;transform:scale(1.06);animation:cnvfl 2s ease-in-out infinite}'+
 '#cnv .ok{margin-top:2.2vh;padding:1.1vh 5vh;border-radius:3vh;border:.35vh solid #d9b24c;background:rgba(4,8,36,.6);color:#8a93b8;font-weight:800;font-size:clamp(11px,3.8vh,19px);letter-spacing:.05em;cursor:pointer;transition:all .25s}'+
 '#cnv.ready .ok{background:linear-gradient(180deg,#ffe27a,#d9962a);color:#3a1a00;box-shadow:0 0 2.2vh rgba(255,226,122,.8);animation:cnvgl 1.2s ease-in-out infinite}'+
 '@keyframes cnvgl{0%,100%{filter:brightness(.9)}50%{filter:brightness(1.25)}}'+
 '@keyframes cnvfl{0%,100%{transform:scale(1.06) translateY(0)}50%{transform:scale(1.06) translateY(-.8vh)}}'+
 '@keyframes cnvsk{0%,100%{transform:translateX(0)}25%{transform:translateX(-1vh)}75%{transform:translateX(1vh)}}';
 document.head.appendChild(s);}
var HINT='Chạm vào một nhân vật để chọn';
function say(t,warn){var e=root&&root.querySelector('.inf');if(!e)return;e.textContent=t;e.className='inf'+(warn?' warn':'');}
function pick(i){if(locked)return;sel=i;
 var cs=root.querySelectorAll('.cd');for(var k=0;k<cs.length;k++)cs[k].classList.toggle('on',k===i);
 say(GIOI[i].ten+' — '+GIOI[i].mota);root.classList.add('ready');}
function xacNhan(){if(locked)return;
 if(sel<0){say('Hãy chọn một nhân vật trước!',true);setTimeout(function(){if(sel<0&&!locked)say(HINT);},1400);return;}
 locked=true;var g=GIOI[sel].id,old=get();
 var keep=(old&&old.gioi===g&&old.skin&&daMo(g,old.skin))?old.skin:'mac-dinh';   /* đổi giới tính thì về skin mặc định */
 var r={gioi:g,skin:keep,t:Date.now()};wr(KEY,r);
 say('Đã chọn '+GIOI[sel].ten+'!');
 try{window.dispatchEvent(new CustomEvent('ttg-nhanvat',{detail:r}));}catch(e){}
 setTimeout(function(){dong();},500);}
function dong(){if(!root)return;var r=root;root=null;r.className=r.className.replace(' on','')+' off';
 var f=cb;cb=null;
 if(f)setTimeout(function(){try{f();}catch(e){}},120);   /* mở tiếp màn chọn thú gần như ngay, 2 màn mờ nối nhau */
 setTimeout(function(){if(r.parentNode)r.parentNode.removeChild(r);},500);}
function build(){
 css();
 root=document.createElement('div');root.id='cnv';
 var h='<div class="tt">Chọn Nhân Vật</div><div class="inf">'+HINT+'</div><div class="row">';
 for(var i=0;i<GIOI.length;i++){var g=GIOI[i];
  h+='<div class="cd" data-i="'+i+'"><img alt="'+g.ten+'" src="'+anhChon(g.id)+'" draggable="false"><div class="nm">'+g.ten+'</div><div class="ms">'+g.mota+'</div></div>';}
 h+='</div><div class="ok" id="cnv-ok">Xác Nhận</div>';
 root.innerHTML=h;document.body.appendChild(root);
 var cs=root.querySelectorAll('.cd');
 for(i=0;i<cs.length;i++)cs[i].addEventListener('click',(function(k){return function(){pick(k);};})(i));
 document.getElementById('cnv-ok').addEventListener('click',xacNhan);
 var o=get();if(o){for(i=0;i<GIOI.length;i++)if(GIOI[i].id===o.gioi)pick(i);}   /* đã từng chọn: sáng sẵn lựa chọn cũ */
 requestAnimationFrame(function(){root.className+=' on';});}
/* show(cb, ep): mở màn chọn nhân vật rồi gọi cb khi xong. Đã có nhân vật và không ép (ep, hoặc ?nhan-vat=1) thì gọi cb ngay. */
function show(f,ep){
 if(root)return;
 if(get()&&!ep&&!/[?&]nhan-vat=1/.test(location.search)){if(f)f();return;}
 sel=-1;locked=false;cb=f||null;
 var imgs=[0,1].map(function(i){return anhChon(GIOI[i].id);}),left=imgs.length,done=false;
 function go(){if(done)return;done=true;build();}
 imgs.forEach(function(u){var im=new Image();im.onload=im.onerror=function(){if(--left<=0)go();};im.src=u;});
 setTimeout(go,1500);}   /* ảnh chậm quá 1,5 giây vẫn hiện màn, ảnh sẽ tự hiện khi tải xong */
window.TTGNHANVAT={get:get,show:show,gioi:gioi,skin:skin,datSkin:datSkin,moKhoa:moKhoa,daMo:daMo,anhMap:anhMap,anhDi:anhDi,anhChon:anhChon,list:GIOI,SKINS:SKINS,
 reset:function(){try{localStorage.removeItem(KEY);}catch(e){}}};
})();
