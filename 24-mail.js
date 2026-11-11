/* ===== 24-mail.js — HỘP THƯ (Realtime Database)
   - Nút nằm trên thanh trên (cùng hàng số online).
   - mail/{uid}/{mid} = { type, title, body, season?, rewards?, claimed, t }
   - Người chơi chỉ được ghi ĐÚNG trường mail/{uid}/{id}/claimed từ false sang true, 1 lần (Rules chặn mọi thứ khác).
   - Chống nhận đôi + chống mất thưởng: xem doClaim / recoverPending (nhật ký tạm trong máy + mailDone trong bản lưu).
   - Nhận thưởng: ghi claimed = true TRƯỚC, thành công rồi mới cộng vào bản lưu.
   - Hỗ trợ thư thưởng mùa có chọn vùng (chooseZone: true).
   - Móc vào game: gọi TTGMAIL.start({db, uid, guest}) sau khi đăng nhập (19-save.js đã gọi).
*/
(()=>{
'use strict';

const CFGV = () => (window.TTGCFG || {});
const HIDE_CLAIMED_MS = () => (CFGV().MAIL_CLAIMED_HIDE_DAYS || 7) * 86400000;
const HIDE_UNCLAIMED_MS = () => (CFGV().MAIL_KEEP_DAYS || 60) * 86400000;
const nowMs = () => (window.TTGSEASON && TTGSEASON.nowSrv) ? TTGSEASON.nowSrv() : Date.now();
/* thư quá hạn thì ẩn (script chốt mùa sẽ xóa hẳn) */
function visible(m){
  const t = Number(m.t) || 0;
  if(!t) return true;
  const age = nowMs() - t;
  return age < (m.claimed ? HIDE_CLAIMED_MS() : HIDE_UNCLAIMED_MS());
}
function toList(val){
  return Object.keys(val || {}).map(id => Object.assign({id}, val[id])).filter(m => m && typeof m === 'object' && visible(m));
}

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let rdb = null, me = null, guest = true;
let list = [];          // mảng thư {id, ...data}
let open = false;
let unread = 0;
let mailBtn = null;
let panel = null;
let claiming = false;   // chống bấm đôi

/* ---------- CSS ---------- */
{const s = document.createElement('style');
 s.textContent =
  '#mail-btn{position:relative;margin-left:6px}'+
  '#mail-btn b{position:absolute;top:-6px;right:-6px;min-width:16px;height:16px;padding:0 4px;border-radius:9px;background:#e74c3c;color:#fff;font-size:10px;font-weight:800;line-height:16px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,.5);display:none}'+
  '#mail-btn.has-unread b{display:block}'+
  '#mail-ov{position:fixed;inset:0;z-index:90000;background:rgba(0,0,0,.55);display:none;align-items:flex-end;justify-content:center;padding:0}'+
  '#mail-ov.show{display:flex}'+
  '#mail-panel{width:100%;max-width:380px;max-height:78vh;background:#1a1218;border:3px solid #75613b;border-bottom:none;border-radius:14px 14px 0 0;box-shadow:0 -6px 28px rgba(0,0,0,.6);display:flex;flex-direction:column;overflow:hidden}'+
  '#mail-panel .mh{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#2a1e26;border-bottom:2px solid #75613b}'+
  '#mail-panel .mh h3{margin:0;font-size:15px;color:#ffd24a;font-weight:800}'+
  '#mail-panel .mh button{width:32px;height:32px;padding:0;margin:0;border-radius:8px;border:2px solid #75613b;background:#20373a;color:#f6e9e4;font-size:16px;cursor:pointer}'+
  '#mail-list{flex:1;overflow-y:auto;padding:8px;min-height:120px}'+
  '.mail-item{background:#241c22;border:2px solid #5a4a3a;border-radius:10px;padding:10px;margin-bottom:8px;cursor:pointer}'+
  '.mail-item.unread{border-color:#e8c36d;box-shadow:0 0 0 1px #e8c36d40}'+
  '.mail-item.claimed{opacity:.55}'+
  '.mail-item .mt{font-size:13px;font-weight:800;color:#ffd24a;margin-bottom:3px}'+
  '.mail-item .mb{font-size:12px;color:#d0c0b0;line-height:1.4;margin-bottom:6px}'+
  '.mail-item .mf{font-size:11px;color:#9a8a7a}'+
  '.mail-item .ma{margin-top:8px;display:flex;gap:6px;flex-wrap:wrap}'+
  '.mail-item button{flex:1;min-width:90px;padding:7px 0;border-radius:8px;border:2px solid #72e4b0;background:#1a3a32;color:#72e4b0;font-weight:800;font-size:12px;cursor:pointer}'+
  '.mail-item button:disabled{opacity:.4;cursor:not-allowed}'+
  '.mail-item button.sec{border-color:#75613b;background:#2a1e26;color:#f6e9e4}'+
  '#mail-empty{text-align:center;padding:30px 12px;color:#9a8a7a;font-size:13px}'+
  '#mail-zone{position:fixed;inset:0;z-index:91000;background:rgba(0,0,0,.7);display:none;align-items:center;justify-content:center;padding:16px}'+
  '#mail-zone.show{display:flex}'+
  '#mail-zone .box{width:100%;max-width:320px;background:#1a1218;border:3px solid #e8c36d;border-radius:12px;padding:14px}'+
  '#mail-zone h4{margin:0 0 10px;color:#ffd24a;font-size:14px;text-align:center}'+
  '#mail-zone .zl{display:grid;grid-template-columns:1fr 1fr;gap:6px;max-height:240px;overflow-y:auto}'+
  '#mail-zone .zl button{padding:8px 4px;border-radius:8px;border:2px solid #75613b;background:#2a1e26;color:#f6e9e4;font-size:12px;font-weight:700;cursor:pointer}'+
  '#mail-zone .act{display:flex;gap:8px;margin-top:12px}'+
  '#mail-zone .act button{flex:1;padding:9px;border-radius:8px;border:2px solid #75613b;background:#2a1e26;color:#f6e9e4;font-weight:800;cursor:pointer}'+
  '#mail-zone .act button.ok{border-color:#72e4b0;background:#1a3a32;color:#72e4b0}';
 document.head.appendChild(s);
}

/* ---------- Nút trên thanh trên ---------- */
function ensureBtn(){
  if(mailBtn) return;
  const top = $('ol-top');
  if(!top){ setTimeout(ensureBtn, 400); return; }
  mailBtn = document.createElement('button');
  mailBtn.type = 'button';
  mailBtn.className = 'ol-pill';
  mailBtn.id = 'mail-btn';
  mailBtn.title = 'Hộp thư';
  mailBtn.innerHTML = '📩<b>0</b>';
  mailBtn.onclick = () => toggle();
  top.appendChild(mailBtn);
}

function setBadge(n){
  unread = n;
  if(!mailBtn) return;
  const b = mailBtn.querySelector('b');
  if(b){ b.textContent = n > 99 ? '99+' : n; }
  mailBtn.classList.toggle('has-unread', n > 0);
}

/* ---------- Panel ---------- */
function buildPanel(){
  if(panel) return;
  panel = document.createElement('div');
  panel.id = 'mail-ov';
  panel.innerHTML =
    '<div id="mail-panel">'+
      '<div class="mh"><h3>📩 Hộp thư</h3><button type="button" id="mail-x">✕</button></div>'+
      '<div id="mail-list"><div id="mail-empty">Chưa có thư nào.</div></div>'+
    '</div>';
  document.body.appendChild(panel);
  $('mail-x').onclick = () => toggle(false);
  panel.addEventListener('click', e => { if(e.target === panel) toggle(false); });

  // Zone picker
  const z = document.createElement('div');
  z.id = 'mail-zone';
  z.innerHTML =
    '<div class="box">'+
      '<h4>Chọn vùng nhận nguyên liệu</h4>'+
      '<div class="zl" id="mail-zl"></div>'+
      '<div class="act"><button type="button" id="mail-zc">Hủy</button><button type="button" class="ok" id="mail-zo" disabled>Nhận</button></div>'+
    '</div>';
  document.body.appendChild(z);
  $('mail-zc').onclick = () => { z.classList.remove('show'); pendingZone = null; };
}

let pendingZone = null; // { mail, zoneId }

function toggle(force){
  open = force === undefined ? !open : !!force;
  buildPanel();
  panel.classList.toggle('show', open);
  if(open) renderList();
}

function renderList(){
  const box = $('mail-list');
  if(!box) return;
  if(!list.length){
    box.innerHTML = '<div id="mail-empty">Chưa có thư nào.<br><small style="opacity:.7">Thư thưởng mùa và thông báo sẽ hiện ở đây.</small></div>';
    return;
  }
  // Sắp xếp: chưa nhận trước, mới nhất trước
  const sorted = list.slice().sort((a,b) => {
    if(!!a.claimed !== !!b.claimed) return a.claimed ? 1 : -1;
    return (b.t||0) - (a.t||0);
  });
  let h = '';
  for(const m of sorted){
    const un = !m.claimed;
    const time = m.t ? new Date(m.t).toLocaleString('vi-VN',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}) : '';
    let rewardTxt = '';
    if(m.rewards){
      const r = m.rewards;
      const parts = [];
      if(r.gold) parts.push('🪙 '+r.gold+' xu');
      if(r.items && r.items.length) parts.push(r.items.map(it => {
        let nm = it.n || it.id;
        try{ if(typeof ITEMS !== 'undefined' && ITEMS[it.id]) nm = ITEMS[it.id].n; }catch(_){}
        return nm+' ×'+(it.q||1);
      }).join(', '));
      if(r.blood) parts.push('🩸 '+(r.blood.huyet||0)+' Giọt Huyết Mạch, '+(r.blood.thuoc||0)+' Thảo Dược, '+(r.blood.tinh||0)+' Tinh Hoa hệ thú');
      if(r.boxes) parts.push('📦 '+r.boxes+' hộp nguyên liệu chế trang bị (chọn vùng khi nhận)');
      else if(r.chooseZone) parts.push('📦 Rương nguyên liệu '+(r.zoneQty||'')+' (chọn vùng)');
      if(r.title) parts.push('🏅 '+r.title);
      if(parts.length) rewardTxt = '<div class="mf">Phần thưởng: '+parts.map(esc).join(' · ')+'</div>';
    }
    h += '<div class="mail-item'+(un?' unread':'')+(m.claimed?' claimed':'')+'" data-id="'+esc(m.id)+'">'+
      '<div class="mt">'+(un?'🔴 ':'')+esc(m.title||'Thư')+'</div>'+
      '<div class="mb">'+esc(m.body||'')+'</div>'+
      rewardTxt+
      '<div class="mf">'+time+(m.season ? ' · Mùa '+m.season : '')+'</div>'+
      (un ? '<div class="ma"><button type="button" data-act="claim">Nhận thưởng</button></div>' : '<div class="mf" style="margin-top:6px;color:#72e4b0">✓ Đã nhận</div>')+
    '</div>';
  }
  box.innerHTML = h;
  box.querySelectorAll('[data-act="claim"]').forEach(btn => {
    btn.onclick = ev => {
      ev.stopPropagation();
      const id = btn.closest('.mail-item').dataset.id;
      const mail = list.find(x => x.id === id);
      if(mail) startClaim(mail);
    };
  });
}

/* ---------- Nhận thưởng ----------
   Chống nhận đôi:  Rules chỉ cho ghi claimed false→true MỘT lần (lần 2 bị từ chối).
   Chống mất thưởng khi mất mạng / đóng game giữa chừng:
     1. Trước khi ghi claimed, máy ghi "nhật ký tạm" (localStorage) = {id, vùng}.
     2. Ghi claimed=true lên máy chủ.
     3. Cộng thưởng + thêm id vào mailDone (nằm TRONG bản lưu) + lưu ngay.
     4. Xóa nhật ký tạm.
   Nếu game đóng giữa bước 2 và 3: lần mở sau, recoverPending() thấy nhật ký tạm, đọc máy chủ thấy claimed=true mà mailDone chưa có id
   → cộng thưởng bù (đúng 1 lần nhờ mailDone). Nếu máy chủ vẫn claimed=false thì bỏ nhật ký, người chơi nhận lại bình thường. */
const PEND_KEY = () => 'ttg_mail_pend_' + me;
function getPend(){ try{ return JSON.parse(localStorage.getItem(PEND_KEY())) || null; }catch(_){ return null; } }
function setPend(o){ try{ if(o) localStorage.setItem(PEND_KEY(), JSON.stringify(o)); else localStorage.removeItem(PEND_KEY()); }catch(_){} }
function doneList(){ try{ if(typeof mailDone !== 'undefined' && Array.isArray(mailDone)) return mailDone; }catch(_){} return null; }
function isDone(id){ const d = doneList(); return !!(d && d.indexOf(id) >= 0); }
function markDone(id){ const d = doneList(); if(d){ d.push(id); if(d.length > 300) d.splice(0, d.length - 300); } }

function startClaim(mail){
  if(claiming || mail.claimed) return;
  if(window.TTGGUARD && TTGGUARD.banned && TTGGUARD.banned()){ TTGGUARD.say(); return; }
  const r = mail.rewards || {};
  if(r.chooseZone){
    pendingZone = { mail };
    showZonePicker();
    return;
  }
  doClaim(mail, null);
}

function showZonePicker(){
  const z = $('mail-zone');
  const zl = $('mail-zl');
  if(!z || !zl) return;
  let zones = [];
  try{
    if(typeof VAN_KIEP_ZONES !== 'undefined' && VAN_KIEP_ZONES.length){
      zones = VAN_KIEP_ZONES.map((v,i) => ({id:i, name: v.name || ('Vùng '+i)}));
    } else if(typeof EPI !== 'undefined'){
      zones = EPI.map((e,i) => ({id:i, name: e[0] || ('Vùng '+i)}));
    }
  }catch(_){}
  if(!zones.length){
    for(let i=0;i<17;i++) zones.push({id:i, name:'Vùng '+i});
  }
  zl.innerHTML = zones.map(v => '<button type="button" data-z="'+v.id+'">'+esc(v.name)+'</button>').join('');
  let selected = null;
  zl.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      zl.querySelectorAll('button').forEach(x => x.style.borderColor = '#75613b');
      b.style.borderColor = '#72e4b0';
      selected = +b.dataset.z;
      $('mail-zo').disabled = false;
    };
  });
  $('mail-zo').disabled = true;
  $('mail-zo').onclick = () => {
    if(selected == null || !pendingZone) return;
    z.classList.remove('show');
    const m = pendingZone.mail;
    pendingZone = null;
    doClaim(m, selected);
  };
  z.classList.add('show');
}

/* Danh sách vật phẩm sẽ cộng vào balo. Hàm thuần (dễ kiểm thử).
   Hỗ trợ cả thư cũ của Admin: items[], chooseZone + zoneQty (nguyên liệu mat{vùng}). */
function buildItems(r, zoneId, env){
  env = env || {};
  const out = [];
  const add = (id, q) => { q = Math.floor(+q || 0); if(id && q > 0) out.push({id, q}); };
  if(Array.isArray(r.items)) r.items.forEach(it => { if(it && it.id) add(it.id, it.q || 1); });
  // Nguyên liệu nâng huyết mạch: Giọt Huyết Mạch, Thảo Dược, Tinh Hoa hệ của thú hiện tại
  if(r.blood && typeof r.blood === 'object'){
    add('huyet', r.blood.huyet);
    add('thuoc', r.blood.thuoc);
    const sp = (env.petSp != null && env.petSp >= 0) ? env.petSp : 0;
    add('mat' + sp, r.blood.tinh);
  }
  // Hộp nguyên liệu chế trang bị: mỗi hộp = Tinh Hoa boss + Linh Cốt dùng chung + nửa số nguyên liệu chính của 4 loại, theo giá rèn của vùng
  if(r.chooseZone && zoneId != null){
    if(r.boxes){
      const need = env.eqNeed ? env.eqNeed(zoneId) : {boss: 1 + Math.floor(zoneId/6), main: 5 + Math.floor(zoneId/4), shared: 3 + Math.floor(zoneId/5)};
      const n = Math.floor(+r.boxes) || 0;
      add('zb' + zoneId, need.boss * n);
      add('zm' + zoneId + '_4', need.shared * n);
      for(let s = 0; s < 4; s++) add('zm' + zoneId + '_' + s, Math.ceil(need.main / 2) * n);
    } else if(r.zoneQty){
      add('mat' + zoneId, r.zoneQty);          // thư Admin kiểu cũ
    }
  }
  return out;
}

function currentEnv(){
  let petSp = null, eqNeedFn = null;
  try{ if(typeof pet !== 'undefined' && pet && Number.isInteger(pet.sp)) petSp = pet.sp; }catch(_){}
  try{ if(typeof eqNeed === 'function') eqNeedFn = eqNeed; }catch(_){}
  return { petSp: petSp, eqNeed: eqNeedFn };
}

/* Balo còn đủ chỗ để nhận danh sách này không? (kiểm tra TRƯỚC khi ghi claimed để không mất thưởng) */
function bagRoomOk(items){
  try{
    if(typeof bag === 'undefined' || typeof BAG_SLOTS === 'undefined' || typeof STACK === 'undefined') return true;
    let slots = 0;
    const byId = {};
    items.forEach(it => { byId[it.id] = (byId[it.id] || 0) + it.q; });
    Object.keys(byId).forEach(id => {
      let free = 0;
      bag.forEach(s => { if(s.id == id && s.n < STACK) free += STACK - s.n; });
      const need = Math.max(0, byId[id] - free);
      slots += Math.ceil(need / STACK);
    });
    return slots <= BAG_SLOTS - bag.length;
  }catch(_){ return true; }
}

function applyOnce(mail, zoneId){
  if(isDone(mail.id)) return false;
  const r = mail.rewards || {};
  const items = buildItems(r, zoneId, currentEnv()).filter(it => {
    try{ return typeof ITEMS === 'undefined' || !!ITEMS[it.id]; }catch(_){ return true; }
  });
  markDone(mail.id);                                   // đánh dấu TRƯỚC khi cộng: lỗi giữa chừng cũng không bao giờ cộng đôi
  if(r.gold && typeof gold !== 'undefined'){
    gold = Math.max(0, (gold || 0) + Math.floor(+r.gold || 0));
  }
  let lost = 0;
  items.forEach(it => {
    try{ const got = addItem(it.id, it.q); if(got < it.q) lost += it.q - got; }catch(e){ console.warn('[mail] addItem', it.id, e); }
  });
  try{ if(typeof stats === 'function') stats(); }catch(_){}
  try{
    if(typeof log === 'function'){
      log('📩 Đã nhận thư: <b>'+esc(mail.title)+'</b>.' + (lost ? ' <span style="color:#ff8a7a">(Balo đầy, mất '+lost+' vật phẩm.)</span>' : ''));
    }
  }catch(_){}
  try{ if(window.TTGSAVE && TTGSAVE.save) TTGSAVE.save(); }catch(_){}
  return true;
}

function doClaim(mail, zoneId){
  if(claiming || !rdb || !me || mail.claimed) return;
  if(isDone(mail.id)){ if(typeof popToast === 'function') popToast('ℹ️ Đã nhận rồi','Phần thưởng này đã có trong bản lưu.','ok'); return; }
  const r = mail.rewards || {};
  const items = buildItems(r, zoneId, currentEnv());
  if(!bagRoomOk(items)){
    if(typeof popToast === 'function') popToast('🎒 Balo không đủ chỗ','Hãy dọn bớt balo rồi nhận lại. Thư vẫn còn đó, bạn không mất gì.','bad');
    return;
  }
  claiming = true;
  const prev = getPend();
  const hadPrev = !!(prev && prev.id === mail.id);                  // lần bấm trước (mất mạng) có thể đã ghi được lên máy chủ
  setPend({id: mail.id, zone: hadPrev && prev.zone != null ? prev.zone : zoneId, t: Date.now()});           // bước 1: nhật ký tạm
  let finished = false;
  const release = () => { claiming = false; };
  const timer = setTimeout(() => {                                  // mạng chậm: không khóa nút mãi
    if(finished) return;
    release();
    if(typeof popToast === 'function') popToast('⏳ Mạng chậm','Chưa xác nhận được. Nếu thư đã nhận, phần thưởng sẽ tự cộng khi có mạng. Đừng bấm lại nhiều lần.','bad');
  }, 15000);

  // bước 2: ghi claimed=true (Rules: chỉ false→true, 1 lần; lần 2 bị từ chối)
  rdb.ref('mail/'+me+'/'+mail.id+'/claimed').set(true).then(() => {
    finished = true; clearTimeout(timer);
    try{ applyOnce(mail, zoneId); }                                 // bước 3
    catch(e){ console.warn('[mail] apply', e); }
    setPend(null);                                                  // bước 4
    if(typeof popToast === 'function') popToast('✅ NHẬN THÀNH CÔNG', esc(mail.title), 'ok');
    release();
    loadMails();
  }).catch(e => {
    finished = true; clearTimeout(timer);
    release();
    const code = String((e && (e.code || e.message)) || e);
    if(/PERMISSION_DENIED/i.test(code)){
      // đã nhận rồi (máy khác / lần trước mất mạng) hoặc tài khoản bị khóa
      if(!hadPrev) setPend(null);        // lần bấm này không ghi được gì → không để lại nhật ký (tránh cộng bù nhầm). Nếu LẦN TRƯỚC mất mạng, giữ nhật ký để cộng bù.
      if(typeof popToast === 'function') popToast('⚠️ Không nhận được','Thư đã được nhận trước đó, hoặc tài khoản đang bị hạn chế.','bad');
      loadMails();
    } else {
      console.warn('[mail] claim', e);
      if(typeof popToast === 'function') popToast('⚠️ Lỗi mạng','Không ghi được trạng thái nhận. Thử lại.','bad');
    }
  });
}

/* Khôi phục: có nhật ký tạm mà máy chủ đã claimed=true, bản lưu chưa có → cộng bù đúng 1 lần */
function recoverPending(){
  if(claiming) return;
  const p = getPend();
  if(!p || !p.id) return;
  const m = list.find(x => x.id === p.id);
  if(!m){ if(Date.now() - (p.t || 0) > 600000) setPend(null); return; }   // chưa thấy thư (đang tải) → chờ; quá 10 phút thì bỏ
  if(isDone(p.id)){ setPend(null); return; }
  if(m.claimed){
    applyOnce(m, p.zone);
    setPend(null);
    if(typeof popToast === 'function') popToast('✅ Đã khôi phục phần thưởng', esc(m.title), 'ok');
  } else if(Date.now() - (p.t || 0) > 120000){
    setPend(null);          // máy chủ vẫn claimed=false sau 2 phút → lần ghi trước không thành công, nhận lại bình thường
  }
}

/* ---------- Load & listen ---------- */
function setList(val){
  list = toList(val);
  setBadge(list.filter(m => !m.claimed).length);
  if(open) renderList();
  try{ recoverPending(); }catch(e){ console.warn('[mail] recover', e); }
}
function loadMails(){
  if(!rdb || !me || guest){
    list = [];
    setBadge(0);
    if(open) renderList();
    return;
  }
  rdb.ref('mail/'+me).once('value').then(snap => setList(snap.val())).catch(e => console.warn('[mail] load', e));
}

function watchMails(){
  if(!rdb || !me || guest) return;
  rdb.ref('mail/'+me).on('value', snap => setList(snap.val()), e => console.warn('[mail] watch', e));
}

/* ---------- API ---------- */
window.TTGMAIL = {
  start({db, uid, guest: g}){
    if(!uid) return;
    rdb = (window.TTGNET && TTGNET.rdb) ? TTGNET.rdb : (window.firebase && firebase.apps.length ? firebase.database() : null);
    if(!rdb) return;
    me = uid;
    guest = !!g;
    ensureBtn();
    if(!guest){
      loadMails();
      watchMails();
    } else {
      setBadge(0);
    }
  },
  refresh(){ loadMails(); },
  _buildItems: buildItems,
  _startClaim: startClaim,
  _list: function(){ return list; },
  _recover: recoverPending,
  _doClaim: doClaim,
  _bagRoomOk: bagRoomOk,
  // Dùng khi test: tạo thư giả (chỉ admin / console)
  _debugAdd(title, body, rewards){
    if(!rdb || !me) return Promise.reject('no auth');
    const mid = 'dbg_'+Date.now();
    return rdb.ref('mail/'+me+'/'+mid).set({
      type: 'system',
      title: title || 'Thư thử',
      body: body || 'Nội dung thử nghiệm.',
      rewards: rewards || {gold: 100},
      claimed: false,
      t: Date.now()
    });
  }
};

// Tự gắn nút sớm nếu thanh trên đã có
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', ensureBtn);
} else {
  ensureBtn();
}
})();
