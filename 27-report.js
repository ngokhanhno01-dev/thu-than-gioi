/* ===== 27-report.js — BÁO CÁO GIAN LẬN (người chơi giúp dò hack) =====
   Nút "🚩 Báo cáo gian lận" nằm trong cửa sổ thẻ thú (23-view.js), nên dùng được từ: bảng xếp hạng,
   danh sách Khiêu chiến, danh sách Bạn bè.
   Dữ liệu: Realtime Database reports/{uidBịBáoCáo}/{uidNgườiBáo} = {r: lý do, n: biệt danh, t: giờ máy chủ}
   - Mỗi người chỉ báo cáo mỗi đối tượng 1 lần. Người bị báo cáo và người chơi khác KHÔNG đọc được báo cáo.
   - Báo cáo KHÔNG tự khóa ai. Chỉ hiện trong bảng Admin để bạn kiểm tra (tránh bị báo cáo oan hàng loạt).
   - Khách (chưa đăng nhập) không báo cáo được. Mỗi người tối đa DAY_LIMIT báo cáo mỗi ngày (giới hạn trên máy).
   Nạp SAU 23-view.js. */
(()=>{
'use strict';
const DAY_LIMIT=5;                 /* số báo cáo tối đa mỗi người mỗi ngày (đổi ở đây) */
const LS_KEY='ttg_rep';
const REASONS=[['fame','🏅 Uy danh tăng nhanh / cao phi lý'],['pet','🐾 Thú hoặc chỉ số mạnh phi lý'],['gold','🪙 Xu / vật phẩm nhiều phi lý'],['other','❓ Lý do khác']];

const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function me(){try{const u=firebase.auth().currentUser;return u&&!u.isAnonymous?u.uid:null}catch(_){return null}}
function rdb(){try{return firebase.database()}catch(_){return null}}
function ls(){try{return JSON.parse(localStorage.getItem(LS_KEY)||'{}')||{}}catch(_){return{}}}
function lsSave(o){try{localStorage.setItem(LS_KEY,JSON.stringify(o))}catch(_){}}
function today(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}

let target='',tnick='',sel='',busy=false;

{const s=document.createElement('style');
 s.textContent=
 '#rp-ov{position:fixed;inset:0;z-index:97;display:none;align-items:center;justify-content:center;background:rgba(4,10,14,.78);padding:10px;box-sizing:border-box}'+
 '#rp-ov.show{display:flex}'+
 '#rp-box{width:min(96vw,330px);max-height:88vh;overflow-y:auto;box-sizing:border-box;border:3px solid #e0615a;background:#14272d;padding:8px 10px 10px;color:#f5edcf;font-size:17px!important;line-height:1.2}'+
 '#rp-box .t{font-size:20px!important;color:#ffb8aa;text-align:center;margin-bottom:4px}'+
 '#rp-box .n{text-align:center;color:#f6c66a;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '#rp-box .r{display:block;width:100%;margin:4px 0;padding:6px 8px;text-align:left;font-size:16px!important;cursor:pointer;color:#f5edcf;background:#23353b;border:2px solid #040a0e;box-sizing:border-box}'+
 '#rp-box .r.on{border-color:#f6c66a;background:#3b4a2f;color:#fff}'+
 '#rp-box .w{font-size:14px!important;color:#b7bda9;margin:6px 0}'+
 '#rp-box .m{min-height:18px;font-size:15px!important;color:#ffc978;text-align:center;margin:4px 0}'+
 '#rp-box .b{display:flex;gap:8px;margin-top:6px}'+
 '#rp-box .b button{flex:1;margin:0;padding:6px 0;font-size:17px!important;cursor:pointer;color:#f5edcf;background:#3b4a4f;border:2px solid #040a0e}'+
 '#rp-box .b button.go{background:#a72f42;border-color:#ff7654}'+
 '#rp-box .b button:disabled{opacity:.5}';
 document.head.appendChild(s)}

function build(){
  if($('rp-ov'))return;
  const o=document.createElement('div');o.id='rp-ov';
  o.innerHTML='<div id="rp-box"><div class="t">🚩 Báo cáo gian lận</div><div class="n" id="rp-nm"></div>'+
    '<div id="rp-rs">'+REASONS.map(r=>'<button type="button" class="r" data-r="'+r[0]+'">'+r[1]+'</button>').join('')+'</div>'+
    '<div class="w">Chỉ báo cáo khi số liệu thật sự phi lý. Báo cáo không tự động khóa ai, Ban quản trị sẽ kiểm tra. Báo cáo sai nhiều lần sẽ không được tính.</div>'+
    '<div class="m" id="rp-msg"></div>'+
    '<div class="b"><button type="button" id="rp-x">Hủy</button><button type="button" class="go" id="rp-go">Gửi báo cáo</button></div></div>';
  document.body.appendChild(o);
  o.addEventListener('click',e=>{if(e.target===o)show(false)});
  $('rp-x').onclick=()=>show(false);
  $('rp-go').onclick=submit;
  $('rp-rs').addEventListener('click',e=>{
    const b=e.target.closest&&e.target.closest('.r');if(!b)return;
    sel=b.getAttribute('data-r');
    $('rp-rs').querySelectorAll('.r').forEach(x=>x.classList.toggle('on',x===b))})}
function show(v){const o=$('rp-ov');if(o)o.classList.toggle('show',v)}
function msg(t){const m=$('rp-msg');if(m)m.textContent=t||''}

function open(uid,nick){
  if(!me()){return alert('Cần đăng nhập tài khoản để báo cáo.')}
  if(!uid||uid===me())return;
  build();target=uid;tnick=String(nick||'').slice(0,20);sel='';busy=false;
  $('rp-nm').textContent=tnick||'(người chơi)';
  $('rp-rs').querySelectorAll('.r').forEach(x=>x.classList.remove('on'));
  $('rp-go').disabled=false;msg('');show(true);
  const r=rdb();   /* đã báo cáo người này rồi? (báo cáo của chính mình đọc được) */
  if(r)r.ref('reports/'+uid+'/'+me()).once('value').then(sn=>{
    if(sn.exists()&&target===uid){msg('Bạn đã báo cáo người này rồi.');$('rp-go').disabled=true}}).catch(()=>{})}

async function submit(){
  if(busy)return;
  const m=me(),r=rdb();
  if(!m||!r)return msg('Cần đăng nhập và có mạng để báo cáo.');
  if(!sel)return msg('Hãy chọn lý do trước.');
  const st=ls();if(st.d!==today()){st.d=today();st.n=0}
  if((st.n||0)>=DAY_LIMIT)return msg('Hôm nay bạn đã báo cáo '+DAY_LIMIT+' lần. Hãy quay lại ngày mai.');
  busy=true;$('rp-go').disabled=true;msg('Đang gửi...');
  try{
    await r.ref('reports/'+target+'/'+m).set({r:sel,n:tnick,t:firebase.database.ServerValue.TIMESTAMP});
    st.n=(st.n||0)+1;st.done=st.done||{};st.done[target]=1;lsSave(st);
    msg('✅ Đã gửi. Cảm ơn bạn đã giúp giữ game công bằng!');
    const b=$('cv-rp');if(b)b.textContent='✔ Đã báo cáo';
    setTimeout(()=>show(false),1400)}
  catch(e){
    console.warn('[report]',e);busy=false;$('rp-go').disabled=false;
    msg(e&&e.code==='PERMISSION_DENIED'||/permission/i.test(String(e&&e.message))?'Không gửi được: có thể bạn đã báo cáo người này rồi, hoặc tài khoản đang bị hạn chế.':'Không gửi được, thử lại sau.')}}

window.TTGREPORT={
  open,
  can:uid=>!!uid&&!!me()&&uid!==me(),            /* có nên hiện nút báo cáo cho người này không */
  done:uid=>!!(ls().done||{})[uid]
};
})();
