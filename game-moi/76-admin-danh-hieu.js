/* 76-admin-danh-hieu.js - nút ADMIN (demo) + DANH HIỆU làm món trang bị CÓ CỘNG CHỈ SỐ.
   Danh hiệu lấy theo main (28-title.js, mảng MANUAL: Quản Trị Viên, 7 bậc VIP, 3 Top Đấu Trường Mùa 1).
   CƠ CHẾ (22/11/2026):
     - Nút Admin (hàng dưới cụm nút test bên phải khung dưới, cột 3 từ mép phải) mở bảng: mỗi danh hiệu 1 nút Trao ("Đã có" nếu đã nhận) + Trao tất cả.
     - TRAO = thêm 1 món vào kho Trang Bị (TTGTB.addItem, trường dh = id danh hiệu) vào ô Bảo vật 1 (slot 2 trong khung Trang Bị, 55-trang-bi.js). Mặc / tháo / vứt bỏ làm ngay trong khung Trang Bị (vứt bỏ = mất danh hiệu, Admin trao lại được). Không còn kho riêng.
     - CHỈ SỐ: bọc TTGLT.tong (bảng Chỉ số trong khung Trang Bị) và TTGLT.apDung (chỉ số thú trong trận) của 73-luat-trang-bi.js, cộng thêm cs của danh hiệu ĐANG MẶC. HP/Tấn công/Phòng thủ/Tốc độ tính theo % chỉ số thú (lớn dần theo bậc, cấp, vùng), các chỉ số còn lại cộng thẳng (điểm %; May mắn cộng số).
     - SỐ LIỆU Ở BẢNG LIST BÊN DƯỚI (trường cs) LÀ SỐ MẪU chờ chỉnh. Sửa cs rồi tải lại game: mô tả món đã nhận tự cập nhật (hàm sync).
   CHƯA có: ảnh danh hiệu (main có img-title-*.webp), hiển thị trên đầu thú / trong trận, 3 ô Bảo vật còn lại (khung UI chỉ số, hiệu ứng vào trận, hiệu ứng kết liễu), đổi tên ô Bảo vật 1-4 trong 55 (SLOTN).
   API: TTGDH.LIST | .by(id) | .has(id) | .give(id) -> 'ok'|'had'|'err' | .owned() | .mo(d) | .extra(base) | .open() | .close()
   Nạp bằng đoạn tạm trong 59-nut-tham-tiem.js (giống 65-chon-thu-dau.js). Nạp SAU 52-nut-vuong.js, 55-trang-bi.js, 64-thong-bao.js, 73-luat-trang-bi.js (cái nào chưa có thì đợi, thử lại mỗi 0,2 giây tối đa 20 giây). */
(function(root){
'use strict';
var SLOT=2;                                  /* ô Bảo vật 1 */
var PCT4={hp:1,tc:1,pt:1,td:1};              /* 4 chỉ số chính: cs là % của chỉ số thú */
var KN={hp:'HP',tc:'Tấn công',pt:'Phòng thủ',td:'Tốc độ',mm:'May mắn',cm:'Chí mạng',stcm:'ST chí mạng',stdb:'ST đặc biệt',xg:'Xuyên giáp'};
/* cs = chỉ số cộng khi MẶC (SỐ MẪU). hp/tc/pt/td = % chỉ số thú; còn lại = điểm (cm, stcm, stdb, xg là %; mm là số) */
var LIST=[
 {id:'admin',ten:'Quản Trị Viên',ic:'🛠️',img:'game-moi/danh-hieu/img-title-admin.webp?v=2',col:'#ff5a6a',nhom:'Admin',cs:{}},
 {id:'vip1',ten:'Tinh Anh Kỵ Sĩ',ic:'🛡️',img:'game-moi/danh-hieu/img-title-vip1.webp',col:'#8fc4ee',nhom:'VIP',cs:{hp:2,pt:2}},
 {id:'vip2',ten:'Ngự Thú Nam Tước',ic:'🐺',img:'game-moi/danh-hieu/img-title-vip2.webp',col:'#6fd08a',nhom:'VIP',cs:{hp:3,tc:2,pt:3}},
 {id:'vip3',ten:'Linh Thú Bá Tước',ic:'🦌',img:'game-moi/danh-hieu/img-title-vip3.webp',col:'#7fb4ff',nhom:'VIP',cs:{hp:4,tc:3,pt:4,td:2}},
 {id:'vip4',ten:'Thánh Thú Hầu Tước',ic:'🦄',img:'game-moi/danh-hieu/img-title-vip4.webp',col:'#c08aff',nhom:'VIP',cs:{hp:5,tc:4,pt:5,td:3,cm:2}},
 {id:'vip5',ten:'Long Thần Công Tước',ic:'🐲',img:'game-moi/danh-hieu/img-title-vip5.webp',col:'#ff8a4a',nhom:'VIP',cs:{hp:6,tc:5,pt:6,td:4,cm:3,stcm:4}},
 {id:'vip6',ten:'Vạn Thú Quân Vương',ic:'👑',img:'game-moi/danh-hieu/img-title-vip6.webp',col:'#ffd24a',nhom:'VIP',cs:{hp:8,tc:7,pt:8,td:5,cm:4,stcm:6,mm:3}},
 {id:'vip7',ten:'Thần Thú Đế Tôn',ic:'🌟',img:'game-moi/danh-hieu/img-title-vip7.webp',col:'#ff7be0',glow:true,nhom:'VIP',cs:{hp:10,tc:9,pt:10,td:7,cm:6,stcm:10,mm:5,stdb:5}},
 {id:'top1',ten:'Chí Tôn Đấu Trường · Mùa 1',ic:'👑',img:'game-moi/danh-hieu/img-title-top1-s1.webp',col:'#ffd24a',glow:true,nhom:'Top mùa',cs:{tc:8,td:6,cm:5,stcm:8,xg:4}},
 {id:'top2',ten:'Cao Thủ Đấu Trường · Mùa 1',ic:'🥈',img:'game-moi/danh-hieu/img-title-top2-s1.webp',col:'#e0a060',nhom:'Top mùa',cs:{tc:6,td:4,cm:3,stcm:5,xg:3}},
 {id:'top3',ten:'Vô Địch Đấu Trường · Mùa 1',ic:'🥉',img:'game-moi/danh-hieu/img-title-top3-s1.webp',col:'#9fc7ff',nhom:'Top mùa',cs:{tc:4,td:3,cm:2,stcm:3,xg:2}}];
function esc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function r1(x){return Math.round(x*10)/10;}
function toast(m){if(root.TTGTBAO&&TTGTBAO.toast)TTGTBAO.toast(m,1800);}
function by(id){var i;for(i=0;i<LIST.length;i++)if(LIST[i].id===id)return LIST[i];return null;}
function lines(d){var a=[],k;for(k in d.cs)a.push('+'+d.cs[k]+(k==='mm'?'':'%')+' '+(KN[k]||k));return a;}
function mo(d){var a=lines(d);return 'Danh hiệu '+d.nhom+' · '+(a.length?a.join(' · '):'chỉ để nhận diện, không cộng chỉ số');}

/* ===================== KHO (món trong Trang Bị) ===================== */
function TB(){return(root.TTGTB&&TTGTB.list&&TTGTB.addItem)?root.TTGTB:null;}
function has(id){var tb=TB();return !!(tb&&tb.list().some(function(t){return t.dh===id;}));}
function owned(){return LIST.filter(function(d){return has(d.id);});}
function give(id){var d=by(id),tb=TB();if(!d||!tb)return 'err';if(has(id))return 'had';
 return tb.addItem({id:'dh-'+id,dh:id,ten:d.ten,ic:d.ic,img:d.img,slot:SLOT,mo:mo(d)})?'ok':'err';}
/* món đã nhận mà số liệu / tên trong LIST đổi -> cập nhật lại */
function sync(){var tb=TB();if(!tb||!tb.update)return;
 tb.list().forEach(function(t){var d=t.dh?by(t.dh):null;if(d&&(t.mo!==mo(d)||t.ten!==d.ten||t.ic!==d.ic||t.img!==d.img||t.slot!==SLOT))tb.update(t.uid,{mo:mo(d),ten:d.ten,ic:d.ic,img:d.img,slot:SLOT});});}

/* ===================== CỘNG CHỈ SỐ ===================== */
function worn(){var tb=TB(),o=[];try{(tb&&tb.dangMac?tb.dangMac():[]).forEach(function(t){var d=t&&t.dh?by(t.dh):null;if(d)o.push(d);});}catch(e){}return o;}
/* base = chỉ số thú ({hp,tc,pt,td}); trả {khóa: giá trị cộng} (4 chỉ số chính đã đổi từ % sang số) */
function extra(base){var ex={};worn().forEach(function(d){var k,v;for(k in d.cs){v=d.cs[k];if(PCT4[k])v=Math.round(((base&&base[k])||0)*v/100);ex[k]=(ex[k]||0)+v;}});return ex;}
function raBase(){try{var t=root.TTGTHU&&TTGTHU.getRaTran?TTGTHU.getRaTran():null;if(!t)return null;var c=t.chiso;
 if(!(c&&Object.keys(c).some(function(k){return c[k]>0;}))&&root.TTGCS)c=TTGCS.tinh(t);return c||null;}catch(e){return null;}}
function patch(){
 var L=root.TTGLT;if(!L||!L.tong||!L.apDung||!TB())return false;
 if(!L.__dh){L.__dh=1;var oT=L.tong,oA=L.apDung;
  L.tong=function(){var T=oT.apply(this,arguments)||{},ex=extra(raBase()),k;for(k in ex)T[k]=r1((T[k]||0)+ex[k]);return T;};
  L.apDung=function(ps){var o=oA.apply(this,arguments);if(!o)return o;var ex=extra(ps),k;
   for(k in ex)o[k]=PCT4[k]?Math.round((o[k]||0)+ex[k]):r1((o[k]||0)+ex[k]);return o;};}
 sync();return true;}
(function(){var n=0,iv=setInterval(function(){n++;var ok=false;try{ok=patch();}catch(e){console.warn('[TTGDH]',e);}if(ok||n>100)clearInterval(iv);},200);})();
try{localStorage.removeItem('ttg_dh_own');}catch(e){}   /* kho riêng của bản thử đầu, không còn dùng */

/* ===================== BẢNG ADMIN ===================== */
var ov=null,bd=null;
function css(){
 if(document.getElementById('adh-css'))return;var s=document.createElement('style');s.id='adh-css';
 s.textContent='#adh-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:70;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif}'+
 '#adh-ov.on{display:flex}'+
 '#adh-bx{width:min(94vw,440px);max-height:92vh;display:flex;flex-direction:column;background:linear-gradient(#12236f,#0a1240);border:2px solid #e0b050;border-radius:12px;box-shadow:0 0 0 2px #3b2200,0 6px 22px rgba(0,0,0,.75);color:#e9eeff;overflow:hidden}'+
 '#adh-hd{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:linear-gradient(#1c36a0,#10206a);border-bottom:2px solid #e0b050;font-weight:900;font-size:15px;color:#ffe58a;text-shadow:0 1px 2px #000}'+
 '#adh-x{width:28px;height:28px;border:0;border-radius:50%;background:#c0392b;color:#fff;font-size:16px;font-weight:900;line-height:1;cursor:pointer;touch-action:manipulation}'+
 '#adh-sub{padding:5px 10px 0;font-size:11px;line-height:1.4;color:#9fb0e8}'+
 '#adh-ls{overflow-y:auto;padding:6px 8px;display:flex;flex-direction:column;gap:4px;-webkit-overflow-scrolling:touch}'+
 '.adh-g{margin:4px 0 0;font-size:11px;font-weight:800;color:#9fb0e8;letter-spacing:.04em}'+
 '.adh-r{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}'+
 '.adh-r.on{background:rgba(125,255,176,.12);border-color:rgba(125,255,176,.5)}'+
 '.adh-ic{flex:none;width:26px;text-align:center;font-size:19px;line-height:1}'+
 '.adh-n{flex:1;min-width:0;font-size:13px;font-weight:800;line-height:1.2}'+
 '.adh-n small{display:block;font-size:10.5px;font-weight:600;color:#aeb9e6;text-shadow:none}'+
 '.adh-n.gl b{text-shadow:0 0 6px currentColor}'+
 '.adh-b{flex:none;min-width:62px;padding:5px 10px;border:1px solid #3b2200;border-radius:8px;background:linear-gradient(#ffe58a,#d9a02c);color:#3b2200;font-size:12px;font-weight:900;cursor:pointer;touch-action:manipulation}'+
 '.adh-b:active{filter:brightness(1.2)}'+
 '.adh-k{flex:none;min-width:62px;text-align:center;font-size:12px;font-weight:800;color:#7dffb0}'+
 '#adh-ft{display:flex;gap:8px;padding:8px 10px;border-top:1px solid rgba(255,255,255,.14)}'+
 '#adh-ft .adh-b{flex:1}';
 document.head.appendChild(s);}
function build(){
 if(ov)return;css();
 ov=document.createElement('div');ov.id='adh-ov';
 ov.innerHTML='<div id="adh-bx"><div id="adh-hd"><span>🛠️ Admin · Danh hiệu</span><button type="button" id="adh-x" aria-label="Đóng">✕</button></div>'+
  '<div id="adh-sub"></div><div id="adh-ls"></div>'+
  '<div id="adh-ft"><button type="button" class="adh-b" data-a="all">Trao tất cả</button></div></div>';
 document.body.appendChild(ov);bd=ov.querySelector('#adh-ls');
 ov.addEventListener('click',function(e){
  var t=e.target;if(t===ov||t.id==='adh-x'){close();return;}
  var b=t.closest?t.closest('button'):null;if(!b)return;
  var a=b.getAttribute('data-a'),id=b.getAttribute('data-id');
  if(!TB()){toast('Chưa nạp khung Trang Bị');return;}
  if(a==='all'){var n=0;LIST.forEach(function(d){if(give(d.id)==='ok')n++;});toast(n?'Đã trao '+n+' danh hiệu, mặc ở Trang Bị':'Đã có đủ danh hiệu rồi');render();return;}
  if(id){var d2=by(id),r=give(id);toast(r==='ok'?'Đã trao: '+d2.ten+' (mặc ở Trang Bị)':r==='had'?'Đã có danh hiệu này rồi':'Chưa trao được');render();}});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov&&ov.classList.contains('on')){e.stopImmediatePropagation();close();}},true);}
function render(){
 if(!ov)return;var sub=ov.querySelector('#adh-sub'),n=owned().length,g='',h='';
 sub.textContent='Đang có '+n+'/'+LIST.length+' danh hiệu. Trao xong vào Trang Bị > ô Danh hiệu để mặc. Muốn bỏ: Trang Bị > chọn món > Vứt bỏ.';
 LIST.forEach(function(d){
  if(d.nhom!==g){g=d.nhom;h+='<div class="adh-g">'+esc(g.toUpperCase())+'</div>';}
  var on=has(d.id),l=lines(d).join(' · ');
  h+='<div class="adh-r'+(on?' on':'')+'"><span class="adh-ic">'+(d.img?'<img src="'+esc(d.img)+'" alt="" draggable="false" style="width:46px;height:30px;object-fit:contain;display:block">':d.ic)+'</span><span class="adh-n'+(d.glow?' gl':'')+'" style="color:'+d.col+'"><b>'+esc(d.ten)+'</b><small>'+esc(l||'Không cộng chỉ số')+'</small></span>'+
   (on?'<span class="adh-k">✔ Đã có</span>':'<button type="button" class="adh-b" data-id="'+d.id+'">Trao</button>')+'</div>';});
 bd.innerHTML=h;}
function open(){build();render();ov.classList.add('on');}
function close(){if(ov)ov.classList.remove('on');}

root.TTGDH={LIST:LIST,by:by,has:has,give:give,owned:owned,mo:mo,extra:extra,open:open,close:close};

/* nút Admin (cụm nút test bên phải khung dưới: hàng dưới, cột 3 từ mép phải) */
if(root.TTGNV){
 root.TTGNV.add({id:'admin',ten:'Admin',r:1,rc:2,onTap:open,
  icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 6l20 8v16c0 14-9 24-20 28C21 54 12 44 12 30V14z" fill="#ffd24a" stroke="#6b3d00" stroke-width="3" stroke-linejoin="round"/><path d="M22 36l5-12 5 7 5-7 5 12z" fill="#b8321f" stroke="#6b3d00" stroke-width="2.5" stroke-linejoin="round"/></svg>'});}
})(typeof window!=='undefined'?window:globalThis);
