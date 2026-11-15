/* ===== 49-dungeon.js — PHÓ BẢN NHÓM · BƯỚC 1: LẬP NHÓM (tối đa 5 người) [v3] =====
   Nút "🏰 Phó bản nhóm" nằm ngay dưới hàng Thám hiểm / Đấu trường / Cửa hàng. Bấm mở khung Phó bản:
     - Tạo phòng: chọn vùng (boss của vùng đó) + độ khó (Trấn Thủ / Chúa Tể / Thiên Ma) -> được MÃ PHÒNG 5 ký tự.
     - Vào phòng: nhập mã phòng, hoặc bấm ✔ ở "Lời mời" do bạn bè gửi.
     - Trưởng nhóm mời bạn trong danh sách 👥 Bạn bè, mời người ra khỏi phòng (✖), hoặc giải tán phòng. Tối đa 5 người kể cả trưởng nhóm.
     - Nút "Bắt đầu" CHƯA hoạt động: trận đánh làm ở bước 2-3.
   Dữ liệu trên Realtime Database (cùng chỗ với chat/online, rất nhẹ):
     dungeon/rooms/{MÃ}     = {host, hostName, zone, rank, st:'lobby', t, m:{ uid:{name,lv,sp,bl,pi} }}
     dungeon/inv/{uid}/{MÃ} = {from, z, k, t}   lời mời gửi tới uid (chỉ người nhận đọc được)
   Tự dọn: đóng game / mất mạng thì thành viên tự rời phòng; trưởng nhóm mất mạng thì phòng tự đóng (onDisconnect).
   Lưu ý: onDisconnect phải đăng ký SAU khi phòng đã được tạo (luật chỉ cho xóa phòng đã tồn tại của chính host).
   v3: khi Firebase từ chối, bảng báo rõ bước nào bị chặn (đọc phòng / tạo phòng / đăng ký tự đóng) kèm mã [v3] để biết bản mới đã nạp.
   Không sửa file cũ: bọc TTGNET.start/setName của 20-online.js như 21-card.js / 22-friends.js.
   Nạp SAU 22-friends.js và 26-arena.js, TRƯỚC 19-save.js. Luật cần dán: RTDB_RULES_FINAL.json (mục "dungeon"). */
(()=>{
'use strict';
const MAX_MEM=5;               /* tối đa người trong phòng (kể cả trưởng nhóm) */
const ROOM_TTL=2*3600*1000;    /* phòng cũ hơn 2 giờ thì không cho vào */
const INV_TTL=10*60*1000;      /* lời mời hết hạn sau 10 phút */
const CODE_CH='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';   /* bỏ I, O, 0, 1 cho khỏi nhầm */
const BLS=['ho','vu','long','tuoc','lan','hu'];

const $=id=>document.getElementById(id);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const SVR=()=>firebase.database.ServerValue.TIMESTAMP;
const nowS=()=>Date.now()+((window.TTGNET&&TTGNET.offset&&TTGNET.offset())||0);

let rdb=null,me=null,started=false,open=false,working=false,leaving=false;
let rid='',room=null,roomRef=null,roomHandler=null;
let invs={},invRef=null;
let selZone=-1,selRank=0,codeVal='';
const invited={};              /* uid -> lúc đã mời (chỉ để hiện "Đã mời") */

/* ---------- dữ liệu game (đọc từ 06-mobs.js / 03-game-core.js) ---------- */
const zoneList=()=>typeof VAN_KIEP_ZONES!=='undefined'?VAN_KIEP_ZONES:[];
const zName=i=>(zoneList()[i]||{}).name||('Vùng '+(i+1));
const zStart=i=>{const b=typeof VAN_KIEP_ZONE_BOUNDS!=='undefined'&&VAN_KIEP_ZONE_BOUNDS[i];return b?b.start:1};
const zRange=i=>{const b=typeof VAN_KIEP_ZONE_BOUNDS!=='undefined'&&VAN_KIEP_ZONE_BOUNDS[i];return b?'Cấp '+b.start+'–'+b.end:''};
const zMax=()=>typeof VAN_KIEP_ZONE_AT_LEVEL==='function'?VAN_KIEP_ZONE_AT_LEVEL(level):0;
const TIER_FALLBACK=[{n:'Trấn Thủ',c:'#c9a0ff'},{n:'Chúa Tể',c:'#ff5a6a'},{n:'Thiên Ma',c:'#ffd24a'}];
const tier=k=>(window.TRB_&&window.TRB_[k])||TIER_FALLBACK[k]||TIER_FALLBACK[0];
const bossOf=z=>(typeof M!=='undefined'&&M.find(m=>m.zone===z&&m.boss))||null;
const hasPet=()=>typeof hatched!=='undefined'&&hatched&&typeof pet!=='undefined'&&pet;
const spName=(bl,sp)=>{try{return genOf(bl,sp).name}catch(_){return '?'}};
const pName=pi=>{try{return PL[Math.max(0,Math.min(4,Math.floor(pi)))][1]}catch(_){return ''}};

/* ---------- CSS ---------- */
{const s=document.createElement('style');
 s.textContent=
 '#dg-btn{position:relative;margin-top:6px}'+
 '#dg-btn b{display:none;position:absolute;top:-9px;right:-9px;min-width:18px;padding:0 4px;font-size:14px!important;line-height:18px;text-align:center;color:#fff;background:#e34e48;border:2px solid #040a0e}'+
 '#dg-btn.has b{display:block}'+
 '#dg-panel{position:fixed;left:50%;transform:translateX(-50%);top:calc(48px + env(safe-area-inset-top,0px));z-index:91;width:min(94vw,340px);max-height:min(76vh,520px);display:none;flex-direction:column;box-sizing:border-box;border:3px solid #f6c66a;background-color:#14272d;background-image:repeating-conic-gradient(#1a3335 0 25%,#12262e 0 50%);background-size:4px 4px;box-shadow:0 3px 0 0 #040a0e,0 0 0 2px #040a0e,inset 0 0 0 2px #78613a;color:#f5edcf}'+
 '#dg-panel.show{display:flex}'+
 '#dg-panel .h{display:flex;justify-content:space-between;align-items:center;padding:4px 8px;border-bottom:2px solid #78613a;font-size:20px!important;color:#f6c66a;text-shadow:1px 1px 0 #071116}'+
 '#dg-panel .h button{width:auto;margin:0;min-height:0;height:auto;padding:0 8px;font-size:20px!important;line-height:1.1;cursor:pointer;color:#f5edcf;background:#3b4a4f;border:2px solid #040a0e;box-shadow:inset 0 -2px 0 #232e32;border-radius:0}'+
 '#dg-msg{padding:2px 8px;font-size:16px!important;line-height:1.1;text-align:center;color:#ff9a8f}'+
 '#dg-msg.ok{color:#72e4b0}'+
 '#dg-msg:empty{display:none}'+
 '#dg-body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:4px 8px 8px;font-size:18px!important;line-height:1.15}'+
 '#dg-body .s{margin:8px 0 3px;font-size:16px!important;color:#f6c66a;border-bottom:1px solid #78613a}'+
 '#dg-body .e{color:#b7bda9;font-size:16px!important;text-align:center;margin:3px 0}'+
 '#dg-body .r{display:flex;justify-content:space-between;align-items:center;gap:6px;margin:0 0 3px;font-size:18px!important}'+
 '#dg-body .nm{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f5edcf;font-size:18px!important}'+
 '#dg-body .sm{display:block;color:#9fb0a4;font-size:15px!important;white-space:normal}'+
 '#dg-body .bad{color:#ff9a8f}'+
 '#dg-body .ac{display:flex;gap:4px;flex:none}'+
 '#dg-body button{width:auto;margin:0;min-height:0;height:auto;padding:1px 9px;font-size:17px!important;line-height:1.2;cursor:pointer;color:#f5edcf;background:#3b4a4f;border:2px solid #040a0e;box-shadow:inset 0 -2px 0 #232e32;border-radius:0}'+
 '#dg-body button.y{color:#14272d;background:#72e4b0;box-shadow:inset 0 -2px 0 #397858}'+
 '#dg-body button.n{background:#a72f42;box-shadow:inset 0 -2px 0 #6e1d2b}'+
 '#dg-body button.sel{color:#14272d;background:#f6c66a;box-shadow:inset 0 -2px 0 #b58a2e}'+
 '#dg-body button.big{display:block;width:100%;margin:6px 0 0;padding:4px 10px;font-size:20px!important}'+
 '#dg-body button:disabled{opacity:.5;cursor:default}'+
 '#dg-body select,#dg-body input{flex:1;min-width:0;width:auto;margin:0;padding:3px 6px;font-size:17px!important;color:#f5edcf;background:#0b1a20;border:2px solid #78613a;border-radius:0;outline:none;font-family:inherit}'+
 '#dg-body input{text-transform:uppercase;letter-spacing:3px;text-align:center}'+
 '#dg-body .code{text-align:center;margin:4px 0;font-size:17px!important;color:#cfd8c4}'+
 '#dg-body .code b{display:inline-block;margin:0 6px;padding:0 8px;font-size:30px!important;letter-spacing:5px;color:#f6c66a;border:2px dashed #78613a}';
 document.head.appendChild(s)}

/* ---------- Khung giao diện ---------- */
function buildUI(){
  if($('dg-panel'))return;
  /* nút "🏰 Phó bản nhóm": chèn ngay dưới hàng Thám hiểm / Đấu trường / Cửa hàng */
  const sm=$('s-main'),grid=sm&&sm.querySelector('.grid');
  if(grid&&grid.parentNode){
    const b=document.createElement('button');b.type='button';b.className='jade';b.id='dg-btn';b.title='Phó bản nhóm: cùng bạn bè (tối đa 5 người) đánh boss';
    b.innerHTML='<span class="ic">🏰</span>Phó bản nhóm<b></b>';
    grid.parentNode.insertBefore(b,grid.nextSibling);
    b.onclick=()=>toggle();
  }
  const p=document.createElement('div');p.id='dg-panel';
  p.innerHTML='<div class="h"><div>🏰 Phó bản nhóm</div><button type="button" id="dg-x" title="Đóng">✕</button></div><div id="dg-msg"></div><div id="dg-body"></div>';
  document.body.appendChild(p);
  $('dg-x').onclick=()=>toggle(false);
  $('dg-body').addEventListener('click',onClick);
  $('dg-body').addEventListener('input',e=>{if(e.target&&e.target.id==='dg-code')codeVal=e.target.value});
  $('dg-body').addEventListener('change',e=>{if(e.target&&e.target.id==='dg-zone'){selZone=+e.target.value;render()}});
  p.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape')toggle(false)});   /* gõ chữ không kích hoạt phím tắt của game */
  p.addEventListener('keyup',e=>e.stopPropagation());
}
function toggle(v){
  open=v===undefined?!open:v;
  const p=$('dg-panel');if(!p)return;
  p.classList.toggle('show',open);
  if(open){
    const c=$('ol-chat');if(c)c.classList.remove('show');       /* tránh các khung chồng nhau */
    const f=$('fr-panel');if(f)f.classList.remove('show');
    setMsg('');render()}}
function setMsg(t,ok){const m=$('dg-msg');if(!m)return;m.textContent=t||'';m.className=ok?'ok':''}
function badge(){const b=$('dg-btn');if(!b)return;const n=Object.keys(invs).length;b.classList.toggle('has',n>0);b.querySelector('b').textContent=n>99?'99+':String(n)}

function bossLine(z,k){
  const b=bossOf(z),t=tier(k);
  return '<span style="color:'+esc(t.c)+';font-weight:700">['+esc(t.n)+']</span> 👑 '+esc(b?b.n:'Boss')+' · '+esc(zName(z));
}

/* ---------- Vẽ nội dung ---------- */
function render(){
  badge();
  const body=$('dg-body');if(!body||!open)return;
  body.innerHTML=(rid&&room)?roomHtml():homeHtml();
}
function homeHtml(){
  const mx=zMax();if(selZone<0||selZone>mx)selZone=mx;
  let h='<div class="s">🏰 Tạo phòng mới</div>';
  if(!hasPet())h+='<div class="e">Bạn cần nở thú trước khi vào phó bản.</div>';
  let opts='';for(let i=0;i<=mx;i++)opts+='<option value="'+i+'"'+(i===selZone?' selected':'')+'>'+esc(zName(i))+' · '+esc(zRange(i))+'</option>';
  h+='<div class="r"><span>Vùng</span><select id="dg-zone">'+opts+'</select></div>';
  h+='<div class="r"><span>Độ khó</span><span class="ac">'+[0,1,2].map(k=>'<button type="button" data-a="rank" data-v="'+k+'" class="'+(k===selRank?'sel':'')+'">'+esc(tier(k).n)+'</button>').join('')+'</span></div>';
  h+='<div class="e">'+bossLine(selZone,selRank)+'</div>';
  h+='<button type="button" class="big y" data-a="create"'+(hasPet()?'':' disabled')+'>Tạo phòng</button>';
  h+='<div class="s">🔑 Vào bằng mã phòng</div><div class="r"><input id="dg-code" type="text" maxlength="5" placeholder="MÃ PHÒNG" autocomplete="off" value="'+esc(codeVal)+'"><button type="button" class="y" data-a="join"'+(hasPet()?'':' disabled')+'>Vào</button></div>';
  const ks=Object.keys(invs).sort((a,b)=>(+invs[b].t||0)-(+invs[a].t||0));
  h+='<div class="s">📨 Lời mời ('+ks.length+')</div>';
  if(!ks.length)h+='<div class="e">Chưa có lời mời nào.</div>';
  ks.forEach(k=>{const v=invs[k];
    h+='<div class="r"><span class="nm">'+esc(v.from||'?')+'<span class="sm">'+bossLine(+v.z||0,+v.k||0)+'</span></span><span class="ac"><button type="button" class="y" data-a="acc" data-v="'+esc(k)+'" title="Vào phòng">✔</button><button type="button" class="n" data-a="dec" data-v="'+esc(k)+'" title="Từ chối">✖</button></span></div>'});
  return h}

function roomHtml(){
  const isHost=room.host===me.uid,m=room.m||{},ids=Object.keys(m),need=zStart(room.zone);
  /* trưởng nhóm đứng đầu danh sách, còn lại theo thứ tự tên */
  ids.sort((a,b)=>a===room.host?-1:b===room.host?1:String(m[a].name).localeCompare(String(m[b].name),'vi'));
  let h='<div class="code">Mã phòng<b>'+esc(rid)+'</b><button type="button" data-a="copy">Chép</button></div>';
  h+='<div class="e">'+bossLine(room.zone,room.rank)+'<br>'+esc(zRange(room.zone))+'</div>';
  h+='<div class="s">👥 Thành viên ('+ids.length+'/'+MAX_MEM+')</div>';
  ids.forEach(u=>{const v=m[u],low=v.lv<need;
    h+='<div class="r"><span class="nm">'+(u===room.host?'👑 ':'')+esc(v.name)+(u===me.uid?' (bạn)':'')+
      '<span class="sm">Cấp '+(+v.lv||1)+' · '+esc(spName(v.bl,v.sp))+' · '+esc(pName(v.pi))+(low?' <span class="bad">⚠ chưa đủ cấp '+need+'</span>':'')+'</span></span>'+
      (isHost&&u!==me.uid?'<span class="ac"><button type="button" class="n" data-a="kick" data-v="'+esc(u)+'" title="Mời ra khỏi phòng">✖</button></span>':'')+'</div>'});
  for(let i=ids.length;i<MAX_MEM;i++)h+='<div class="r"><span class="nm" style="color:#6f7d76">— trống —</span></div>';
  if(isHost){
    const fl=(window.TTGFRIENDS&&TTGFRIENDS.list&&TTGFRIENDS.list())||[];
    h+='<div class="s">📤 Mời bạn bè</div>';
    const cand=fl.filter(f=>!m[f.uid]);
    if(!fl.length)h+='<div class="e">Chưa có danh sách bạn. Mở 👥 Bạn bè một lần để tải, rồi quay lại đây.</div><div class="e"><button type="button" data-a="openfr">Mở 👥 Bạn bè</button></div>';
    else if(!cand.length)h+='<div class="e">Tất cả bạn bè đã ở trong phòng.</div>';
    cand.forEach(f=>{const did=invited[f.uid]&&Date.now()-invited[f.uid]<INV_TTL;
      h+='<div class="r"><span class="nm">'+esc(f.nick||'Ẩn danh')+'</span><span class="ac"><button type="button" class="y" data-a="invite" data-v="'+esc(f.uid)+'" data-n="'+esc(f.nick||'')+'"'+(did?' disabled':'')+'>'+(did?'Đã mời':'Mời')+'</button></span></div>'});
    h+='<button type="button" class="big" disabled>▶ Bắt đầu (sắp có ở bước sau)</button>';
    h+='<button type="button" class="big n" data-a="leave">Giải tán phòng</button>';
  }else{
    h+='<div class="e">Chờ trưởng nhóm bắt đầu...</div><button type="button" class="big n" data-a="leave">Rời phòng</button>';
  }
  return h}

/* ---------- Thao tác ---------- */
function onClick(e){
  const b=e.target.closest('button[data-a]');if(!b||b.disabled)return;
  const a=b.dataset.a,v=b.dataset.v;
  if(a==='rank'){selRank=+v;render()}
  else if(a==='create')createRoom();
  else if(a==='join')joinRoom((($('dg-code')||{}).value)||codeVal);
  else if(a==='acc')joinRoom(v);
  else if(a==='dec')removeInvite(v,true);
  else if(a==='leave')leave();
  else if(a==='kick')kick(v);
  else if(a==='invite')sendInvite(v,b.dataset.n);
  else if(a==='copy')copyCode();
  else if(a==='openfr'){toggle(false);try{TTGFRIENDS.open()}catch(_){}}}

const isPerm=e=>/permission/i.test(String((e&&(e.code||e.message))||e));
const errTxt=(e,step)=>isPerm(e)
  ?'[v3] Firebase từ chối'+(step?' ở bước "'+step+'"':'')+'. Có thể luật "dungeon" chưa được Publish đúng trên Firebase.'
  :'[v3] Lỗi'+(step?' ở bước "'+step+'"':'')+': '+String((e&&(e.code||e.message))||e).slice(0,70);
const genCode=()=>{let s='';for(let i=0;i<5;i++)s+=CODE_CH[Math.floor(Math.random()*CODE_CH.length)];return s};

function memberData(){
  return{name:String(me.name||'').slice(0,20)||'Người chơi',lv:Math.max(1,Math.min(100,Math.floor(level)||1)),
    sp:Math.max(0,Math.min(16,pet.sp|0)),bl:BLS.includes(pet.bl)?pet.bl:'ho',pi:Math.max(0,Math.min(4,+pet.pi||0))};
}

async function createRoom(){
  if(working||rid)return;
  if(!hasPet()){setMsg('Bạn cần nở thú trước.');return}
  if(selZone<0||selZone>zMax()||level<zStart(selZone)){setMsg('Thú chưa đủ cấp cho vùng này.');return}
  if(!bossOf(selZone)){setMsg('Vùng này chưa có boss.');return}
  working=true;setMsg('');
  let step='';
  try{
    for(let i=0;i<6;i++){
      const code=genCode(),ref=rdb.ref('dungeon/rooms/'+code);
      step='đọc phòng';
      const ex=await ref.once('value');if(ex.exists())continue;        /* trùng mã: đổi mã khác */
      const d={host:me.uid,hostName:memberData().name,zone:selZone,rank:selRank,st:'lobby',t:SVR(),m:{}};d.m[me.uid]=memberData();
      step='tạo phòng';
      await ref.set(d);                                                /* tạo phòng TRƯỚC */
      step='đăng ký tự đóng';
      try{await ref.onDisconnect().remove()}                           /* rồi mới đăng ký: trưởng nhóm mất mạng -> phòng tự đóng */
      catch(err){ref.remove().catch(()=>{});throw err}
      attach(code);setMsg('Đã tạo phòng '+code+'. Gửi mã cho bạn bè hoặc mời từ danh sách bạn.',true);return}
    setMsg('Không tạo được phòng, thử lại nhé.');
  }catch(e){console.warn('[dungeon] tạo phòng lỗi ('+step+')',e);setMsg(errTxt(e,step))}
  finally{working=false}}

async function joinRoom(code){
  code=String(code||'').trim().toUpperCase();
  if(!/^[A-Z0-9]{5}$/.test(code)){setMsg('Mã phòng gồm 5 chữ hoặc số.');return}
  if(!hasPet()){setMsg('Bạn cần nở thú trước.');return}
  if(rid){setMsg('Bạn đang ở trong một phòng rồi.');return}
  if(working)return;working=true;setMsg('');
  let step='';
  try{
    step='đọc phòng';
    const ref=rdb.ref('dungeon/rooms/'+code),r=(await ref.once('value')).val();
    if(!r){setMsg('Không tìm thấy phòng '+code+'.');removeInvite(code);return}
    if(r.st!=='lobby'){setMsg('Phòng này đã bắt đầu trận.');return}
    if(nowS()-(+r.t||0)>ROOM_TTL){setMsg('Phòng này đã quá cũ.');return}
    const m=r.m||{};
    if(!m[me.uid]&&Object.keys(m).length>=MAX_MEM){setMsg('Phòng đã đầy ('+MAX_MEM+'/'+MAX_MEM+').');return}
    if(level<zStart(r.zone)){setMsg('Chưa đủ cấp! Vùng '+zName(r.zone)+' cần thú cấp '+zStart(r.zone)+' (hiện cấp '+level+').');return}
    const mref=ref.child('m/'+me.uid);
    step='đăng ký tự rời';
    await mref.onDisconnect().remove();                                /* mất mạng -> tự rời phòng */
    step='vào phòng';
    try{await mref.set(memberData())}catch(err){mref.onDisconnect().cancel().catch(()=>{});throw err}
    attach(code);removeInvite(code);
  }catch(e){console.warn('[dungeon] vào phòng lỗi ('+step+')',e);setMsg(errTxt(e,step))}
  finally{working=false}}

/* theo dõi phòng đang ở: phòng đóng / bị mời ra thì quay về màn đầu */
function attach(code){
  rid=code;roomRef=rdb.ref('dungeon/rooms/'+code);room=null;leaving=false;
  roomHandler=roomRef.on('value',s=>{
    if(leaving)return;
    const r=s.val();
    if(!r){leaveLocal('Phòng đã đóng.');return}
    if(!(r.m&&r.m[me.uid])){leaveLocal('Bạn không còn trong phòng (bị mời ra hoặc mất mạng).');return}
    room=r;render()
  },e=>{console.warn('[dungeon] mất kết nối phòng',e);leaveLocal('Mất kết nối với phòng.')});
  render()}
function leaveLocal(msg){
  try{if(roomRef&&roomHandler)roomRef.off('value',roomHandler)}catch(_){}
  rid='';room=null;roomRef=null;roomHandler=null;leaving=false;
  setMsg(msg||'');render()}

async function leave(){
  if(!rid||!roomRef||leaving)return;
  const ref=roomRef,host=room&&room.host===me.uid;
  leaving=true;
  try{
    if(host){await ref.onDisconnect().cancel();await ref.remove()}
    else{const mref=ref.child('m/'+me.uid);await mref.onDisconnect().cancel();await mref.remove()}
    leaveLocal(host?'Đã giải tán phòng.':'Đã rời phòng.')
  }catch(e){leaving=false;console.warn('[dungeon] rời phòng lỗi',e);setMsg(errTxt(e,'rời phòng'))}}

function kick(uid){
  if(!room||room.host!==me.uid||uid===me.uid)return;
  roomRef.child('m/'+uid).remove().then(()=>setMsg('Đã mời người đó ra khỏi phòng.',true)).catch(e=>setMsg(errTxt(e,'mời ra')))}

function sendInvite(uid,nick){
  if(!room||room.host!==me.uid||!uid)return;
  if(Object.keys(room.m||{}).length>=MAX_MEM){setMsg('Phòng đã đủ '+MAX_MEM+' người.');return}
  rdb.ref('dungeon/inv/'+uid+'/'+rid).set({from:memberData().name,z:room.zone,k:room.rank,t:SVR()})
    .then(()=>{invited[uid]=Date.now();setMsg('Đã mời '+(nick||'bạn')+'.',true);render()})
    .catch(e=>{console.warn('[dungeon] mời lỗi',e);setMsg(isPerm(e)?'Đã mời người này rồi (đợi 10 phút để mời lại).':errTxt(e,'gửi lời mời'))})}

function removeInvite(code,show){
  if(!invRef||!code)return;
  invRef.child(code).remove().catch(()=>{});
  if(invs[code]){delete invs[code];badge();if(show){setMsg('Đã từ chối lời mời.',true);render()}}}

function listenInv(){
  invRef=rdb.ref('dungeon/inv/'+me.uid);
  invRef.on('value',s=>{
    invs=s.val()||{};
    Object.keys(invs).forEach(k=>{if(nowS()-(+invs[k].t||0)>INV_TTL){invRef.child(k).remove().catch(()=>{});delete invs[k]}});   /* dọn lời mời quá hạn */
    badge();if(open&&!rid)render()
  },e=>console.warn('[dungeon] nghe lời mời lỗi (đã dán luật dungeon chưa?)',e))}

function copyCode(){
  try{navigator.clipboard.writeText(rid).then(()=>setMsg('Đã chép mã '+rid+'.',true),()=>setMsg('Không chép được, hãy ghi lại mã '+rid+'.'))}
  catch(_){setMsg('Không chép được, hãy ghi lại mã '+rid+'.')}}

/* ---------- Khởi động ---------- */
function startDungeon(o){
  if(!o||!o.db||o.guest||started)return;
  started=true;me={uid:o.uid,name:o.name||''};
  try{rdb=firebase.database()}catch(e){console.warn('[dungeon] thiếu firebase-database',e);return}
  buildUI();listenInv()}

window.TTGDUNGEON={
  open:()=>toggle(true),
  room:()=>room?JSON.parse(JSON.stringify(room)):null,   /* bước 2-3 dùng để lấy danh sách thành viên */
  code:()=>rid,
  isHost:()=>!!(room&&me&&room.host===me.uid)
};

/* Bọc TTGNET (20-online.js) để không phải sửa 19-save.js */
const N=window.TTGNET;
if(N){
  const st=N.start,sn=N.setName;
  N.start=function(o){const r=st.apply(this,arguments);try{startDungeon(o)}catch(e){console.warn('[dungeon]',e)}return r};
  N.setName=function(n){const r=sn.apply(this,arguments);if(me)me.name=String(n).slice(0,20);return r};
}
})();
