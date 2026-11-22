/* 75-tien-hoa-thu.js - TIẾN HÓA THÚ bằng item: khai item, công thức, nguồn rơi, và giao diện khung "Tiến Hóa Thú".
   Khung ảnh nằm ở 72-khung-ren-cuong-hoa.js (khung 'th', mở từ nút "Tiến Hóa" trong panel Thú Thần). File này nạp SAU 72 và 54, dùng móc TTGKH.on('open'|'btn'|'pick') + TTGKH.frame('th') (giống 74-ren-cuong-hoa.js).
   Đổi bậc thú dùng TTGTHU.setTien(uid,n) (54-thu-than.js). Chỉ số sau tiến hóa do TTGCS.tinh tính theo tien.

   ITEM THEO VÙNG: 9 vùng (z0..z8) x 3 loại (Lõi, Châu, Thần Ấn) = 27 item (z6 Thủy Nguyệt Cảnh, z7 Xích Hỏa Địa, z8 Thanh Lâm = vùng của 3 thú khởi đầu, chưa mở: icon làm sẵn), loai:'th' (chỉ hiện trong túi của khung Tiến Hóa, không hiện ở Balo chính). Id: th-z<vùng>-<loi|chau|an>. Ảnh: game-moi/icon-th/<id>.png (128x128).
   ITEM MẢNH THEO LOÀI (thay Mảnh theo vùng cũ th-z*-manh, đã xóa; khóa cũ còn trong Balo được dọn lúc nạp): mỗi loài thú có 1 Mảnh riêng, id th-m-<id thú> (vd th-m-1f), tên "Mảnh <tên thú>", ảnh game-moi/icon-th/th-m-<id>.png tạo bằng tools/tao-manh-ghep.py. Danh sách loài đọc từ TTGCS.dsLoai (không gõ tay). Mảnh chỉ khai cho vùng có trong CFG.vungManh (vùng đã làm ảnh mảnh xong); thêm vùng mới = thêm số vùng vào CFG.vungManh sau khi chạy script tạo ảnh.
   CÔNG THỨC (CFG.cong, khóa = bậc ĐÍCH): Lõi/Châu/Thần Ấn theo VÙNG GỐC của thú (TTGCS.loai(id).goc), riêng 'manh' = Mảnh CỦA CHÍNH LOÀI ĐÓ; 3 ô vòng = 3 món.
      Bậc 1 -> 2: Mảnh loài x6 + Lõi x2 + Châu x1   Bậc 2 -> 3: Lõi x5 + Châu x3 + Thần Ấn x1 (không dùng Mảnh)
   RƠI: CHỈ thú hoang (địch source 'demo') và boss thú hoang CHẾT mới rơi (gọi từ index.html lúc thắng trận); quái vùng (source 'main') đã có bộ item riêng ở 73-luat-trang-bi.js nên KHÔNG rơi ở đây. Bắt thú không rơi.
      Mảnh: rơi Mảnh CỦA CHÍNH LOÀI địch (kể cả boss), CFG.manh = {tl % rơi (mặc định 100), min, max} (mặc định 2-4 mảnh), KHÔNG nhân may mắn.
      Lõi/Châu/Thần Ấn (CFG.roi): nhân hệ số may mắn giống 73 (tối đa x3). Thần Ấn chỉ rơi từ boss thú hoang.
   Thú khởi đầu dùng item của vùng gốc của mình: Lưu Diêu (k2) -> z6, Viêm Sư (k1) -> z7, Lâm Trư (k3) -> z8. Số vùng theo 56b-loai.js (goc) = 51-thu-moi.js (z). LƯU Ý: 73-luat-trang-bi.js đánh số vùng khác (z6 = Dương Sơn...) vì đó là danh sách 17 vùng trang bị; id item ở đây KHÔNG dùng số của 73.
   Chưa mở vùng 6-8 thì chưa có nguồn rơi: item chỉ lấy được bằng nút test "Lấy đồ TH".
   API: TTGTH.roiDo(enemy,mm) | .moTa(list) | .yeuCau(thu) | .tienHoa(uid) | .cap(n) (test: +item cho thú đang ra trận) | .id(z,loai) | .idManh(idThu) | .CFG */
(function(root){
'use strict';
var D='game-moi/icon-th/',NZ=9,KIND=['loi','chau','an'];
var ZONE=['Tuyết Nguyên','Sương Cốc','Vân Đảo','Phong Nguyên','Lôi Vực','Nguyệt Cung','Thủy Nguyệt Cảnh','Xích Hỏa Địa','Thanh Lâm'];
var TEN=[
 ['Lõi Hàn Sương','Châu Tuyết Phách','Thần Ấn Băng Sơn'],
 ['Lõi Vụ Linh','Châu Mộc Sương','Thần Ấn Vụ Thú'],
 ['Lõi Phù Vân','Châu Mộng Vân','Thần Ấn Côn Bằng'],
 ['Lõi Cuồng Phong','Châu Lục Phong','Thần Ấn Vũ Xà'],
 ['Lõi Thiên Lôi','Châu Tử Điện','Thần Ấn Chiến Thần'],
 ['Lõi Ngân Quang','Châu Nguyệt Quế','Thần Ấn Tế Quân'],
 ['Lõi Triều Nguyệt','Châu Lam Ba','Thần Ấn Thủy Nguyệt'],
 ['Lõi Xích Diễm','Châu Liệt Diễm','Thần Ấn Viêm Vương'],
 ['Lõi Thanh Diệp','Châu Cổ Thụ','Thần Ấn Lâm Chủ']];
var CFG={
 nutTest:true,   /* nút test "Lấy đồ TH" (hàng dưới, cạnh Lấy sách). Đặt false khi đã có nguồn rơi ổn định */
 /* vùng ĐÃ có ảnh Mảnh theo loài (chạy tools/tao-manh-ghep.py --vung <z> rồi thêm số vùng vào đây). Vùng chưa có thì chưa khai Mảnh, chưa rơi Mảnh */
 vungManh:[0,1,2,3,4,5],
 /* công thức: khóa = bậc đích (tien mới). Mỗi phần tử = [loại item, số lượng], theo thứ tự ô vòng: trái, phải, dưới.
    'manh' = Mảnh CỦA CHÍNH LOÀI thú đang tiến hóa (th-m-<id thú>); loi/chau/an = item của vùng gốc */
 cong:{2:[['manh',6],['loi',2],['chau',1]],3:[['loi',5],['chau',3],['an',1]]},
 /* rơi Mảnh của chính loài địch khi THẮNG thú hoang / boss thú hoang: tl = % rơi (100 = luôn rơi), min-max mảnh mỗi lần. Không nhân may mắn */
 manh:{tl:100,min:2,max:4},
 /* rơi Lõi/Châu/Thần Ấn theo vùng: [loại item, % rơi, số lượng tối thiểu, tối đa] (nhân may mắn) */
 roi:{thuong:[['loi',20,1,1],['chau',20,1,1]],
      boss:[['loi',20,1,1],['chau',20,1,1],['an',30,1,1]]}
};
var MO={loi:'Lõi tinh hoa',chau:'Châu tinh hoa',an:'Thần Ấn'};
function id(z,k){return 'th-z'+z+'-'+k;}
function idManh(t){return 'th-m-'+t;}
/* danh sách loài của vùng z: [{id,ten}] lấy từ TTGCS.dsLoai, dự phòng THU_MOI */
function dsThu(z){
 if(root.TTGCS&&TTGCS.dsLoai){var L=TTGCS.dsLoai(z);if(L&&L.length)return L;}
 var zs=root.THU_MOI&&root.THU_MOI.zones||[],i;for(i=0;i<zs.length;i++)if(zs[i].z===z)return zs[i].thu;
 return [];}
function reg(){
 if(!root.TTGBALO||!TTGBALO.reg)return;var o={},z,i,k;
 for(z=0;z<NZ;z++)for(i=0;i<3;i++){k=KIND[i];
  o[id(z,k)]={loai:'th',ten:TEN[z][i],img:D+id(z,k)+'.png',
   mo:MO[k]+' của vùng '+ZONE[z]+'. Dùng tiến hóa thú gốc vùng này'+(k==='an'?' (V2 → V3). Chỉ rơi từ boss thú hoang.':'. Rơi từ thú hoang vùng này.')};}
 /* Mảnh theo từng loài (chỉ vùng đã có ảnh) */
 CFG.vungManh.forEach(function(zv){dsThu(zv).forEach(function(s){
  o[idManh(s.id)]={loai:'th',ten:'Mảnh '+s.ten,img:D+idManh(s.id)+'.png',
   mo:'Mảnh của '+s.ten+' (vùng '+ZONE[zv]+'). Dùng để tiến hóa chính loài này lần 1. Rơi khi thắng '+s.ten+' hoang dã.'};});});
 TTGBALO.reg(o);}
/* dọn khóa Mảnh theo vùng CŨ (th-z*-manh) còn sót trong Balo (localStorage): trừ hết số đang có */
function donManhCu(){
 if(!root.TTGBALO||!TTGBALO.count||!TTGBALO.add)return;var z,i,n;
 for(z=0;z<NZ;z++){i='th-z'+z+'-manh';n=TTGBALO.count(i);if(n>0)TTGBALO.add(i,-n);}}
function cnt(i){return root.TTGBALO?TTGBALO.count(i):0;}
function nm(i){var c=root.TTGBALO&&TTGBALO.CAT[i];if(c)return c.ten;
 if(i.indexOf('th-m-')===0){var L=root.TTGCS&&TTGCS.loai?TTGCS.loai(i.slice(5)):null;return 'Mảnh '+(L?L.ten:i.slice(5));}
 return i;}
function ra(){return root.TTGTHU&&TTGTHU.getRaTran?TTGTHU.getRaTran():null;}

/* ===================== LUẬT ===================== */
function zoneOf(t){var L=root.TTGCS&&TTGCS.loai?TTGCS.loai(t.id):null,z=L&&L.goc!=null?L.goc:0;return (z>=0&&z<NZ)?z:0;}
/* yêu cầu tiến hóa của 1 thú: {max:true} nếu đã Bậc 3, ngược lại {tien,next,z,items:[{id,ten,n,have}],ok} */
function yeuCau(t){
 if(!t)return null;var tien=Math.min(3,Math.max(1,(t.tien|0)||1));
 if(tien>=3)return {max:true,tien:tien};
 var nx=tien+1,z=zoneOf(t),it=CFG.cong[nx].map(function(r){var i=r[0]==='manh'?idManh(t.id):id(z,r[0]);return {id:i,ten:nm(i),n:r[1],have:cnt(i)};});
 return {max:false,tien:tien,next:nx,z:z,items:it,ok:it.every(function(x){return x.have>=x.n;})};}
function thieu(r){return r.items.filter(function(x){return x.have<x.n;}).map(function(x){return x.ten+' ('+x.have+'/'+x.n+')';}).join(', ');}
/* tiến hóa thật: trừ item, tăng bậc. Trả {ok,from,to} hoặc {err} */
function tienHoa(uid){
 var t=null,L=root.TTGTHU&&TTGTHU.list?TTGTHU.list():[],i;
 for(i=0;i<L.length;i++)if(L[i].uid===uid){t=L[i];break;}
 if(!t)return {err:'Không tìm thấy thú.'};
 var r=yeuCau(t);
 if(r.max)return {err:'Thú đã đạt V3 (tối đa).'};
 if(!r.ok)return {err:'Chưa đủ nguyên liệu: '+thieu(r)};
 if(!root.TTGTHU||!TTGTHU.setTien)return {err:'Thiếu hàm TTGTHU.setTien (54-thu-than.js).'};
 r.items.forEach(function(x){TTGBALO.add(x.id,-x.n);});
 TTGTHU.setTien(uid,r.next);
 return {ok:true,from:r.tien,to:r.next};}

/* ===================== RƠI ĐỒ ===================== */
/* enemy: địch vừa thua ({source,boss,vung}); mm: may mắn của người chơi. Chỉ thú hoang (source 'demo'). Trả [{id,q}] đã cộng vào Balo. */
function roiDo(enemy,mm){
 var out=[];if(!enemy||enemy.source!=='demo'||!root.TTGBALO)return out;
 var z=enemy.vung|0;if(z<0||z>=NZ)return out;
 var bonus=Math.min(3,1+Math.max(0,+mm||0)/100),im=enemy.id?idManh(enemy.id):null,M=CFG.manh,q,i;
 /* Mảnh CỦA CHÍNH LOÀI địch (thú hoang và boss thú hoang đều rơi mảnh của chính nó); không nhân may mắn; chỉ rơi nếu loài đã có item Mảnh (vùng trong CFG.vungManh) */
 if(im&&TTGBALO.CAT&&TTGBALO.CAT[im]&&Math.random()*100<M.tl){q=M.min+Math.floor(Math.random()*(M.max-M.min+1));TTGBALO.add(im,q);out.push({id:im,q:q});}
 CFG.roi[enemy.boss?'boss':'thuong'].forEach(function(d){
  if(Math.random()*100<Math.min(100,d[1]*bonus)){q=d[2]+Math.floor(Math.random()*(d[3]-d[2]+1));i=id(z,d[0]);TTGBALO.add(i,q);out.push({id:i,q:q});}});
 return out;}
function moTa(list){return (list||[]).map(function(d){return nm(d.id)+' x'+d.q;}).join(', ');}
/* TEST: cấp n bộ ĐỦ để thử cả 2 lần tiến hóa cho THÚ ĐANG RA TRẬN: Mảnh CỦA LOÀI đó + Lõi/Châu/Thần Ấn của vùng gốc nó (số lượng cộng từ CFG.cong). Trả {z,ten,manh} hoặc {err} */
function cap(n){n=n||1;var t=ra();if(!t)return {err:'Chưa có thú ra trận: hãy đưa 1 thú ra trận ở panel Thú Thần.'};
 var z=zoneOf(t),tot={},k,st,j,im=idManh(t.id),coManh=!!(root.TTGBALO.CAT&&TTGBALO.CAT[im]);
 for(st in CFG.cong)CFG.cong[st].forEach(function(r){tot[r[0]]=(tot[r[0]]||0)+r[1];});
 if(coManh)TTGBALO.add(im,(tot.manh||0)*n);
 for(k in tot)if(k!=='manh')TTGBALO.add(id(z,k),tot[k]*n);
 return {z:z,ten:nm(im).replace(/^Mảnh /,''),manh:coManh};}

root.TTGTH={CFG:CFG,id:id,idManh:idManh,yeuCau:yeuCau,tienHoa:tienHoa,roiDo:roiDo,moTa:moTa,cap:cap,ZONE:ZONE};
reg();donManhCu();

/* nút test (hàng dưới, cạnh "Lấy sách") */
if(CFG.nutTest&&root.TTGNV&&root.TTGBALO){
 root.TTGNV.add({id:'lay-do-th',ten:'Lấy đồ TH',r:1,rc:0,onTap:function(){
  var r=cap(1),T=root.TTGTBAO&&TTGTBAO.toast;if(!T)return;
  if(r.err)TTGTBAO.toast(r.err,2600);
  else TTGTBAO.toast('TEST: +Mảnh '+r.ten+' (x6) +Lõi/Châu/Thần Ấn vùng '+ZONE[r.z]+(r.manh?'':' (loài này chưa có item Mảnh: vùng chưa mở trong CFG.vungManh)'),3200);
 },icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 6l10 18-10 8-10-8z" fill="#7be0ff" stroke="#0b4a7a" stroke-width="3" stroke-linejoin="round"/><path d="M22 24l10 8 10-8 8 14-18 18-18-18z" fill="#4aa8ff" stroke="#0b4a7a" stroke-width="3" stroke-linejoin="round"/></svg>'});}

/* ===================== GIAO DIỆN KHUNG TIẾN HÓA ===================== */
if(!root.TTGKH||!TTGKH.on)return;
var KH=root.TTGKH,S={put:[false,false,false]},W=null;
function esc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function toast(t){if(root.TTGTBAO&&TTGTBAO.toast)TTGTBAO.toast(t,2600);else console.log('[TTG]',t);}
function imgOf(i){var c=root.TTGBALO&&TTGBALO.CAT[i];return c&&c.img?'<img src="'+esc(c.img)+'" alt="" draggable="false">':'';}
function mk(p,cls,x,y,w,h){var el=document.createElement('div'),d=p.d,st=el.style;el.className=cls;var H=d.h+(d.ex||0);st.left=(x/d.w*100)+'%';st.top=(y/H*100)+'%';st.width=(w/d.w*100)+'%';st.height=(h/H*100)+'%';p.fr.appendChild(el);return el;}
function css(){
 if(document.querySelector('style[data-th]'))return;var s=document.createElement('style');s.setAttribute('data-th','1');
 s.textContent='.th-st{display:grid;grid-template-rows:repeat(5,1fr);pointer-events:none}'+
 '.th-r{display:flex;align-items:center;gap:calc(var(--u)*7);font-size:calc(var(--u)*21);font-weight:800;color:#e9eeff;white-space:nowrap;text-shadow:0 1px 2px #000,0 0 3px #000}'+
 '.th-r i{font-style:normal;color:#9fb0e8}.th-r b{color:#7dffb0}'+
 '.th-cd{display:flex;flex-direction:column;justify-content:center;gap:calc(var(--u)*5);padding:0 calc(var(--u)*14);pointer-events:none;font-size:calc(var(--u)*21);font-weight:700;color:#dfe6ff;text-shadow:0 1px 2px #000,0 0 3px #000}'+
 '.th-cd h6{margin:0 0 calc(var(--u)*4);text-align:center;font-size:calc(var(--u)*24);font-weight:900;color:#ffe58a}'+
 '.th-l{display:flex;justify-content:space-between;gap:calc(var(--u)*10)}.th-ok{color:#9dffb8}.th-no{color:#ff9a8a}.th-em{text-align:center;color:#b7c2ee}'+
 '.th-rt{display:flex;align-items:center;font-size:calc(var(--u)*26);font-weight:900;color:#7dffb0;text-shadow:0 1px 2px #000,0 0 3px #000;pointer-events:none}'+
 '.kh-c.th-on{box-shadow:0 0 0 calc(var(--u)*3) #7dffb0,0 0 calc(var(--u)*14) calc(var(--u)*3) rgba(125,255,176,.8);background:rgba(125,255,176,.12)}';
 document.head.appendChild(s);}
function ensure(){
 if(W)return W;css();var p=KH.frame('th');if(!p)return null;W={p:p};
 /* chỗ trống trong ảnh khung (tọa độ pixel ảnh 1536x868): cột giá trị 5 chỉ số / bảng điều kiện / ô tỉ lệ */
 W.st=mk(p,'th-st',815,217,172,232);W.cd=mk(p,'th-cd',545,490,450,170);W.rt=mk(p,'th-rt',890,727,110,44);
 p.slots.ring.forEach(function(c,i){c.el.addEventListener('click',function(){togglePut(i);});});
 return W;}
function stat(t,tien){try{return TTGCS.tinh(Object.assign({},t,{tien:tien}));}catch(e){return {};}}
function render(){
 var w=ensure();if(!w)return;var t=ra(),r=yeuCau(t),sl=w.p.slots.ring,i,ks=['hp','tc','pt','td','mm'];
 if(r&&!r.max)for(i=0;i<3;i++)if(S.put[i]&&r.items[i].have<r.items[i].n)S.put[i]=false;
 for(i=0;i<3;i++){var el=sl[i].el;
  if(!r||r.max){el.innerHTML='';el.classList.remove('th-on');el.title='';continue;}
  var it=r.items[i],on=!!S.put[i];
  el.innerHTML='<span class="kh-i" style="opacity:'+(on?1:.45)+'">'+imgOf(it.id)+'</span><span class="kh-q" style="color:'+(it.have>=it.n?'#9dffb8':'#ff9a8a')+'">'+it.have+'/'+it.n+'</span>';
  el.classList.toggle('th-on',on);el.title=it.ten;}
 if(!t){w.st.innerHTML='';w.cd.innerHTML='<div class="th-em">Chưa có thú ra trận.<br>Hãy đưa 1 thú ra trận ở panel Thú Thần.</div>';w.rt.textContent='';return;}
 var cur=stat(t,t.tien|0||1),nx=r.max?null:stat(t,r.next);
 w.st.innerHTML=ks.map(function(k){var a=Math.round(cur[k]||0);return '<div class="th-r">'+a+(nx?' <i>→</i> <b>'+Math.round(nx[k]||0)+'</b>':'')+'</div>';}).join('');
 if(r.max){w.cd.innerHTML='<div class="th-em">Thú đã đạt <b>V3</b> (tối đa).</div>';w.rt.textContent='';return;}
 w.cd.innerHTML='<h6>V'+r.tien+' → V'+r.next+' · vùng '+esc(ZONE[r.z])+'</h6>'+r.items.map(function(x,j){var ok=x.have>=x.n;return '<div class="th-l"><span class="'+(ok?'th-ok':'th-no')+'">'+(S.put[j]?'✔ ':ok?'○ ':'✖ ')+esc(x.ten)+'</span><span class="'+(ok?'th-ok':'th-no')+'">'+x.have+'/'+x.n+'</span></div>';}).join('');
 w.rt.textContent='100%';}
function togglePut(i){
 var r=yeuCau(ra());if(!r){toast('Chưa có thú ra trận để tiến hóa.');return;}
 if(r.max){toast('Thú đã đạt V3, không tiến hóa thêm được.');return;}
 var it=r.items[i];
 if(S.put[i])S.put[i]=false;
 else if(it.have<it.n){toast('Chưa đủ '+it.ten+' ('+it.have+'/'+it.n+')');return;}
 else S.put[i]=true;
 render();}
function doEvo(){
 var t=ra();if(!t){toast('Chưa có thú ra trận để tiến hóa.');return;}
 var r=yeuCau(t);if(r.max){toast('Thú đã đạt V3, không tiến hóa thêm được.');return;}
 if(!S.put.every(Boolean)){toast(r.ok?'Hãy đặt đủ 3 nguyên liệu vào 3 ô (chạm ô hoặc chạm món trong túi).':'Chưa đủ nguyên liệu: '+thieu(r));return;}
 var res=tienHoa(t.uid);if(res.err){toast(res.err);render();return;}
 S.put=[false,false,false];KH.refresh('th');render();
 toast('Tiến hóa thành công! '+(root.TTGTHU&&TTGTHU.ten?TTGTHU.ten(t):'Thú')+' V'+res.from+' → V'+res.to);}
function auto(){
 var t=ra(),r=yeuCau(t);if(!r){toast('Chưa có thú ra trận để tiến hóa.');return;}
 if(r.max){toast('Thú đã đạt V3, không tiến hóa thêm được.');return;}
 S.put=r.items.map(function(x){return x.have>=x.n;});render();
 toast(r.ok?'Đã đặt đủ nguyên liệu. Bấm Tiến Hóa.':'Chưa đủ nguyên liệu: '+thieu(r));}
KH.on('open',function(k){if(k!=='th')return;S.put=[false,false,false];render();});
KH.on('change',function(k){if(k==='th')render();});   /* khóa / vứt bỏ xong: vẽ lại số nguyên liệu */
KH.on('btn',function(k,label){
 if(k!=='th')return false;
 if(label==='Tiến Hóa'){doEvo();return true;}
 if(label==='Tự Động'){auto();return true;}
 return false;});
KH.on('pick',function(k,item){
 if(k!=='th'||!item)return;
 var r=yeuCau(ra());if(!r){toast('Chưa có thú ra trận để tiến hóa.');return;}
 if(r.max){toast('Thú đã đạt V3, không tiến hóa thêm được.');return;}
 var key=String(item.key),j,idx=-1;for(j=0;j<r.items.length;j++)if(r.items[j].id===key)idx=j;
 if(idx<0){toast(nm(key)+': không dùng được cho thú này (V'+r.tien+' → V'+r.next+' cần item vùng '+ZONE[r.z]+').');return;}
 togglePut(idx);});
})(typeof window!=='undefined'?window:globalThis);
