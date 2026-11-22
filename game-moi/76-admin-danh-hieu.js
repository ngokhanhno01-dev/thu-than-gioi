/* 76-admin-danh-hieu.js - nút ADMIN (demo) + kho DANH HIỆU của người chơi.
   Danh hiệu lấy theo main (28-title.js, mảng MANUAL: Quản Trị Viên, 7 bậc VIP, 3 Top Đấu Trường Mùa 1). Demo chưa có tài khoản / kho lưu trữ nên:
     - "đang sở hữu" lưu ở localStorage 'ttg_dh_own' = {id:1,...}
     - nút Admin (hàng dưới, cột thứ 3 từ mép phải, cạnh NL test / Lấy đồ TH) mở bảng: mỗi danh hiệu 1 nút Trao / Gỡ, kèm Trao tất cả / Gỡ tất cả.
   CHƯA có: chỉ số cộng của danh hiệu, ô Danh hiệu trong khung Trang Bị, ảnh danh hiệu (main có img-title-*.webp nhưng chưa chép sang game-moi), hiển thị trên đầu thú / trong trận. Làm ở các bước sau.
   API: TTGDH.LIST | .by(id) | .has(id) | .give(id) | .take(id) | .owned() -> [danh hiệu đang có] | .on(fn) (gọi khi đổi) | .open() | .close()
   Nạp bằng đoạn tạm trong 59-nut-tham-hiem.js (giống 65-chon-thu-dau.js). Nạp SAU 52-nut-vuong.js, 64-thong-bao.js. */
(function(root){
'use strict';
var KEY='ttg_dh_own';
var LIST=[
 {id:'admin',ten:'Quản Trị Viên',ic:'🛠️',col:'#ff5a6a',nhom:'Admin'},
 {id:'vip1',ten:'Tinh Anh Kỵ Sĩ',ic:'🛡️',col:'#8fc4ee',nhom:'VIP'},
 {id:'vip2',ten:'Ngự Thú Nam Tước',ic:'🐺',col:'#6fd08a',nhom:'VIP'},
 {id:'vip3',ten:'Linh Thú Bá Tước',ic:'🦌',col:'#7fb4ff',nhom:'VIP'},
 {id:'vip4',ten:'Thánh Thú Hầu Tước',ic:'🦄',col:'#c08aff',nhom:'VIP'},
 {id:'vip5',ten:'Long Thần Công Tước',ic:'🐲',col:'#ff8a4a',nhom:'VIP'},
 {id:'vip6',ten:'Vạn Thú Quân Vương',ic:'👑',col:'#ffd24a',nhom:'VIP'},
 {id:'vip7',ten:'Thần Thú Đế Tôn',ic:'🌟',col:'#ff7be0',glow:true,nhom:'VIP'},
 {id:'top1',ten:'Chí Tôn Đấu Trường · Mùa 1',ic:'👑',col:'#ffd24a',glow:true,nhom:'Top mùa'},
 {id:'top2',ten:'Cao Thủ Đấu Trường · Mùa 1',ic:'🥈',col:'#e0a060',nhom:'Top mùa'},
 {id:'top3',ten:'Vô Địch Đấu Trường · Mùa 1',ic:'🥉',col:'#9fc7ff',nhom:'Top mùa'}];
var OWN={},LS=[];
function esc(x){return String(x==null?'':x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function toast(m){if(root.TTGTBAO&&TTGTBAO.toast)TTGTBAO.toast(m,1800);}
function load(){try{var o=JSON.parse(localStorage.getItem(KEY)||'{}');OWN=(o&&typeof o==='object')?o:{};}catch(e){OWN={};}
 Object.keys(OWN).forEach(function(k){if(!by(k))delete OWN[k];});}
function save(){try{localStorage.setItem(KEY,JSON.stringify(OWN));}catch(e){}}
function by(id){var i;for(i=0;i<LIST.length;i++)if(LIST[i].id===id)return LIST[i];return null;}
function has(id){return !!OWN[id];}
function owned(){return LIST.filter(function(d){return OWN[d.id];});}
function fire(){LS.forEach(function(fn){try{fn();}catch(e){console.warn('[TTGDH]',e);}});if(ov&&ov.classList.contains('on'))render();}
function give(id){if(!by(id)||OWN[id])return false;OWN[id]=1;save();fire();return true;}
function take(id){if(!OWN[id])return false;delete OWN[id];save();fire();return true;}
function giveAll(){var n=0;LIST.forEach(function(d){if(!OWN[d.id]){OWN[d.id]=1;n++;}});if(n){save();fire();}return n;}
function takeAll(){var n=Object.keys(OWN).length;if(n){OWN={};save();fire();}return n;}

/* ===================== BẢNG ADMIN ===================== */
var ov=null,bd=null;
function css(){
 if(document.getElementById('adh-css'))return;var s=document.createElement('style');s.id='adh-css';
 s.textContent='#adh-ov{position:fixed;left:0;top:0;right:0;bottom:0;z-index:70;display:none;align-items:center;justify-content:center;background:rgba(3,4,18,.74);font-family:"Segoe UI",system-ui,-apple-system,Roboto,sans-serif}'+
 '#adh-ov.on{display:flex}'+
 '#adh-bx{width:min(94vw,440px);max-height:92vh;display:flex;flex-direction:column;background:linear-gradient(#12236f,#0a1240);border:2px solid #e0b050;border-radius:12px;box-shadow:0 0 0 2px #3b2200,0 6px 22px rgba(0,0,0,.75);color:#e9eeff;overflow:hidden}'+
 '#adh-hd{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:linear-gradient(#1c36a0,#10206a);border-bottom:2px solid #e0b050;font-weight:900;font-size:15px;color:#ffe58a;text-shadow:0 1px 2px #000}'+
 '#adh-x{width:28px;height:28px;border:0;border-radius:50%;background:#c0392b;color:#fff;font-size:16px;font-weight:900;line-height:1;cursor:pointer;touch-action:manipulation}'+
 '#adh-sub{padding:5px 10px 0;font-size:11px;color:#9fb0e8}'+
 '#adh-ls{overflow-y:auto;padding:6px 8px;display:flex;flex-direction:column;gap:4px;-webkit-overflow-scrolling:touch}'+
 '.adh-g{margin:4px 0 0;font-size:11px;font-weight:800;color:#9fb0e8;letter-spacing:.04em}'+
 '.adh-r{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:8px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}'+
 '.adh-r.on{background:rgba(125,255,176,.12);border-color:rgba(125,255,176,.5)}'+
 '.adh-ic{flex:none;width:26px;text-align:center;font-size:19px;line-height:1}'+
 '.adh-n{flex:1;min-width:0;font-size:13px;font-weight:800;line-height:1.2}'+
 '.adh-n.gl{text-shadow:0 0 6px currentColor}'+
 '.adh-b{flex:none;min-width:58px;padding:5px 10px;border:1px solid #3b2200;border-radius:8px;background:linear-gradient(#ffe58a,#d9a02c);color:#3b2200;font-size:12px;font-weight:900;cursor:pointer;touch-action:manipulation}'+
 '.adh-b.go{background:linear-gradient(#ffb0a8,#d9503c);color:#3b0b06}'+
 '.adh-b:active{filter:brightness(1.2)}'+
 '#adh-ft{display:flex;gap:8px;padding:8px 10px;border-top:1px solid rgba(255,255,255,.14)}'+
 '#adh-ft .adh-b{flex:1}';
 document.head.appendChild(s);}
function build(){
 if(ov)return;css();
 ov=document.createElement('div');ov.id='adh-ov';
 ov.innerHTML='<div id="adh-bx"><div id="adh-hd"><span>🛠️ Admin · Danh hiệu</span><button type="button" id="adh-x" aria-label="Đóng">✕</button></div>'+
  '<div id="adh-sub"></div><div id="adh-ls"></div>'+
  '<div id="adh-ft"><button type="button" class="adh-b" data-a="all">Trao tất cả</button><button type="button" class="adh-b go" data-a="none">Gỡ tất cả</button></div></div>';
 document.body.appendChild(ov);bd=ov.querySelector('#adh-ls');
 ov.addEventListener('click',function(e){
  var t=e.target;if(t===ov){close();return;}
  if(t.id==='adh-x'){close();return;}
  var b=t.closest?t.closest('button'):null;if(!b)return;
  var a=b.getAttribute('data-a'),id=b.getAttribute('data-id');
  if(a==='all'){var n=giveAll();toast(n?'Đã trao '+n+' danh hiệu':'Đã có đủ danh hiệu rồi');return;}
  if(a==='none'){var m=takeAll();toast(m?'Đã gỡ '+m+' danh hiệu':'Chưa có danh hiệu nào');return;}
  if(id){var d=by(id);if(OWN[id]){take(id);toast('Đã gỡ: '+d.ten);}else{give(id);toast('Đã trao: '+d.ten);}}});
 document.addEventListener('keydown',function(e){if(e.key==='Escape'&&ov&&ov.classList.contains('on')){e.stopImmediatePropagation();close();}},true);}
function render(){
 if(!ov)return;var sub=ov.querySelector('#adh-sub'),n=owned().length,g='',h='';
 sub.textContent='Đang có '+n+'/'+LIST.length+' danh hiệu. Lưu trong máy này (chưa có tài khoản).';
 LIST.forEach(function(d){
  if(d.nhom!==g){g=d.nhom;h+='<div class="adh-g">'+esc(g.toUpperCase())+'</div>';}
  var on=!!OWN[d.id];
  h+='<div class="adh-r'+(on?' on':'')+'"><span class="adh-ic">'+d.ic+'</span><span class="adh-n'+(d.glow?' gl':'')+'" style="color:'+d.col+'">'+esc(d.ten)+'</span>'+
   '<button type="button" class="adh-b'+(on?' go':'')+'" data-id="'+d.id+'">'+(on?'Gỡ':'Trao')+'</button></div>';});
 bd.innerHTML=h;}
function open(){build();render();ov.classList.add('on');}
function close(){if(ov)ov.classList.remove('on');}

root.TTGDH={LIST:LIST,by:by,has:has,give:give,take:take,owned:owned,on:function(fn){if(typeof fn==='function')LS.push(fn);},open:open,close:close};
load();

/* nút Admin (cụm nút test bên phải khung dưới: hàng dưới, cột 3 từ mép phải) */
if(root.TTGNV){
 root.TTGNV.add({id:'admin',ten:'Admin',r:1,rc:2,onTap:open,
  icon:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 6l20 8v16c0 14-9 24-20 28C21 54 12 44 12 30V14z" fill="#ffd24a" stroke="#6b3d00" stroke-width="3" stroke-linejoin="round"/><path d="M22 36l5-12 5 7 5-7 5 12z" fill="#b8321f" stroke="#6b3d00" stroke-width="2.5" stroke-linejoin="round"/></svg>'});}
})(typeof window!=='undefined'?window:globalThis);
