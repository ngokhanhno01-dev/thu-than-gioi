/* ===== 29-guard.js — CẢNH BÁO DỮ LIỆU BẤT THƯỜNG + THÔNG BÁO TÀI KHOẢN BỊ KHÓA =====
   1) Tài khoản bị khóa (banned/{uid} do Admin ghi): hiện thông báo to, chặn Khiêu chiến. Máy chủ (Rules) đã chặn ghi chat/xếp hạng/nhận thư.
   2) Dữ liệu bất thường: uy danh cao hơn mức MÀ MỘT NGƯỜI THẬT có thể đạt được tại thời điểm đó (tính từ vé + giờ máy chủ),
      hoặc Rules máy chủ từ chối ghi uy danh. Khi phát hiện: hiện ⚠️, đưa uy danh về 0, chặn Khiêu chiến trên máy này
      và GHI DẤU flags/{uid} lên máy chủ → khi chốt mùa, tài khoản này bị GIỮ LẠI, không tự nhận thưởng.
   Giới hạn nói thẳng: game chạy trên máy người chơi nên người rành kỹ thuật có thể tắt đoạn mã này.
   Lớp chặn THẬT là Rules máy chủ (trần uy danh theo mùa) + chốt mùa bằng GitHub Actions. File này chỉ là lớp báo hiệu.
   Admin (admins/{uid} = true) được miễn kiểm tra để bạn test. Nạp SAU 26-arena.js. */
(()=>{
'use strict';
const SLACK=60;
let locked=false,banned=null,flagged=false,uid='';
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rdb(){try{return firebase.database()}catch(_){return null}}
function me(){try{const u=firebase.auth().currentUser;return u&&!u.isAnonymous?u.uid:''}catch(_){return ''}}
function isAdmin(){try{return typeof window.isAdminUser==='function'&&window.isAdminUser()}catch(_){return false}}
function srvNow(){return(window.TTGSEASON&&TTGSEASON.nowSrv)?TTGSEASON.nowSrv():Date.now()}
function say(h){try{if(typeof log==='function')log(h)}catch(_){}}

{const s=document.createElement('style');
 s.textContent='#gd-ov{position:fixed;inset:0;z-index:99990;background:rgba(4,10,14,.9);display:none;align-items:center;justify-content:center;padding:14px;box-sizing:border-box}'+
 '#gd-ov.show{display:flex}#gd-box{width:min(92vw,330px);border:3px solid #e0615a;background:#14272d;color:#f5edcf;padding:14px;text-align:center;font-size:16px;line-height:1.35}'+
 '#gd-box h3{margin:0 0 8px;font-size:20px;color:#ffb8aa}#gd-box button{margin-top:12px;padding:8px 22px;font-size:16px;cursor:pointer;color:#f5edcf;background:#3b4a4f;border:2px solid #040a0e}';
 document.head.appendChild(s)}
function box(title,html){
  let o=$('gd-ov');
  if(!o){o=document.createElement('div');o.id='gd-ov';o.innerHTML='<div id="gd-box"><h3></h3><div id="gd-t"></div><button type="button" id="gd-x">Đã hiểu</button></div>';document.body.appendChild(o);$('gd-x').onclick=()=>o.classList.remove('show')}
  o.querySelector('h3').textContent=title;$('gd-t').innerHTML=html;o.classList.add('show')}

/* ---------- 1) Bị khóa ---------- */
function checkBan(){
  const r=rdb(),u=me();if(!r||!u)return;uid=u;
  /* khóa Khiêu chiến trên máy này kéo dài đến hết MÙA đã phát hiện (sang mùa mới tự mở, nếu tài khoản không bị khóa hẳn) */
  try{const g=localStorage.getItem('ttg_guard_'+u);if(g&&window.TTGSEASON&&+g===TTGSEASON.currentSeason()){locked=true;flagged=true}}catch(_){}
  r.ref('banned/'+u).once('value').then(sn=>{
    if(!sn.exists()){banned=null;return}
    banned=sn.val()||{};locked=true;
    box('🚫 Tài khoản bị khóa','Tài khoản này bị Ban Quản Trị khóa khỏi các tính năng trực tuyến (Đấu trường, chat, nhận thư).<br><small>Lý do: '+esc(banned.why||'(không ghi)')+'</small><br><small>Nếu bạn cho rằng bị nhầm, hãy liên hệ Ban Quản Trị.</small>')
  }).catch(()=>{})}

/* ---------- 2) Dữ liệu bất thường ---------- */
function ceiling(){
  const C=window.TTGCFG;if(!C||!window.TTGSEASON)return Infinity;
  const s=TTGSEASON.currentSeason();
  return C.fameCeiling(s,srvNow())+SLACK}
function flag(code){
  if(flagged)return;flagged=true;locked=true;
  try{localStorage.setItem('ttg_guard_'+(uid||me()),String(window.TTGSEASON?TTGSEASON.currentSeason():1))}catch(_){}
  const r=rdb(),u=me();
  if(r&&u)r.ref('flags/'+u).set({c:String(code).slice(0,40),t:firebase.database.ServerValue.TIMESTAMP}).catch(()=>{});
  try{if(typeof fame==='number'){fame=0}if(typeof fameLost!=='undefined'){fameLost=0}if(typeof stats==='function')stats()}catch(_){}
  try{if(window.TTGSAVE&&TTGSAVE.save)TTGSAVE.save()}catch(_){}
  say('⚠️ <b>Phát hiện dữ liệu bất thường</b> trên tài khoản này.');
  box('⚠️ Phát hiện dữ liệu bất thường','Uy danh của tài khoản vượt mức mà một trận đấu bình thường có thể đạt được.<br>Uy danh đã bị đưa về 0, tài khoản bị <b>khóa Khiêu chiến</b> và bị <b>ghi nhận để Ban Quản Trị kiểm tra</b>. Phần thưởng mùa sẽ bị giữ lại cho đến khi kiểm tra xong.')}
function scan(){
  if(locked||flagged||isAdmin()||!me())return;
  try{if(typeof fame==='number'&&fame>ceiling())flag('fame-ceiling')}catch(_){}}

/* theo dõi Rules từ chối ghi uy danh → nếu uy danh thật sự quá trần thì báo */
function hookWrite(){
  if(!window.TTGSEASON||!TTGSEASON.writeSeasonRank||TTGSEASON.writeSeasonRank.__g)return;
  const w=TTGSEASON.writeSeasonRank;
  const g=function(){return w.apply(this,arguments).then(res=>{
    try{if(res&&!res.ok&&/PERMISSION_DENIED/i.test(String(res.error))&&!isAdmin()&&typeof fame==='number'&&fame>ceiling()*0.9)flag('rules-denied')}catch(_){}
    return res})};
  g.__g=1;TTGSEASON.writeSeasonRank=g}

window.TTGGUARD={locked:()=>locked,banned:()=>banned,scan,
  say(){if(banned)box('🚫 Tài khoản bị khóa','Bạn không thể dùng tính năng này.');else if(flagged)box('⚠️ Đang chờ kiểm tra','Tài khoản đang được Ban Quản Trị kiểm tra dữ liệu bất thường.')}};
setInterval(()=>{try{hookWrite();scan()}catch(_){}},20000);
setTimeout(()=>{try{hookWrite();checkBan();scan()}catch(_){}},5000);
})();
