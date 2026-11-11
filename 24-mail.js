/* ===== 24-mail.js — HỘP THƯ (Realtime Database)
   - Nút nằm trên thanh trên (cùng hàng số online).
   - mail/{uid}/{mid} = { type, title, body, season?, rewards?, claimed, t }
   - Người chơi chỉ được đổi claimed: false → true (Rules chặn mọi thứ khác).
   - Nhận thưởng: ghi claimed = true TRƯỚC, thành công rồi mới cộng vào bản lưu.
   - Hỗ trợ thư thưởng mùa có chọn vùng (chooseZone: true).
   - Móc vào game: gọi TTGMAIL.start({db, uid, guest}) sau khi đăng nhập (19-save.js đã gọi).
*/
(()=>{
'use strict';

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
      if(r.items && r.items.length) parts.push(r.items.map(it => (it.n||it.id)+' ×'+(it.q||1)).join(', '));
      if(r.title) parts.push('🏅 '+r.title);
      if(r.chooseZone) parts.push('📦 Rương nguyên liệu (chọn vùng)');
      if(parts.length) rewardTxt = '<div class="mf">Phần thưởng: '+parts.join(' · ')+'</div>';
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

/* ---------- Nhận thưởng ---------- */
function startClaim(mail){
  if(claiming || mail.claimed) return;
  if(mail.rewards && mail.rewards.chooseZone){
    // Hiện chọn vùng
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
  // Lấy danh sách vùng từ game nếu có
  let zones = [];
  try{
    if(typeof VAN_KIEP_ZONES !== 'undefined' && VAN_KIEP_ZONES.length){
      zones = VAN_KIEP_ZONES.map((z,i) => ({id:i, name: z.name || ('Vùng '+i)}));
    } else if(typeof EPI !== 'undefined'){
      zones = EPI.map((e,i) => ({id:i, name: e[0] || ('Vùng '+i)}));
    }
  }catch(_){}
  if(!zones.length){
    for(let i=0;i<17;i++) zones.push({id:i, name:'Vùng '+i});
  }
  zl.innerHTML = zones.map(z => '<button type="button" data-z="'+z.id+'">'+esc(z.name)+'</button>').join('');
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
    doClaim(pendingZone.mail, selected);
    pendingZone = null;
  };
  z.classList.add('show');
}

function doClaim(mail, zoneId){
  if(claiming || !rdb || !me || mail.claimed) return;
  claiming = true;
  const ref = rdb.ref('mail/'+me+'/'+mail.id);

  // 1. Ghi claimed = true trước (Rules chỉ cho phép thao tác này)
  ref.transaction(cur => {
    if(!cur || cur.claimed) return;          // đã nhận hoặc không tồn tại → hủy
    return Object.assign({}, cur, {claimed: true});
  }).then(res => {
    if(!res.committed){
      claiming = false;
      if(typeof popToast === 'function') popToast('⚠️ Không nhận được','Thư đã được nhận hoặc không còn tồn tại.','bad');
      loadMails();
      return;
    }
    // 2. Cộng thưởng vào bản lưu
    try{
      applyRewards(mail.rewards || {}, zoneId);
      if(typeof log === 'function') log('📩 Đã nhận thư: <b>'+esc(mail.title)+'</b>.');
      if(typeof popToast === 'function') popToast('✅ NHẬN THÀNH CÔNG', esc(mail.title),'ok');
      if(typeof window.TTGSAVE !== 'undefined' && TTGSAVE.save) TTGSAVE.save();
    }catch(e){
      console.warn('[mail] apply', e);
    }
    claiming = false;
    loadMails();
  }).catch(e => {
    claiming = false;
    console.warn('[mail] claim', e);
    if(typeof popToast === 'function') popToast('⚠️ Lỗi mạng','Không ghi được trạng thái nhận. Thử lại.','bad');
  });
}

function applyRewards(r, zoneId){
  if(r.gold && typeof gold !== 'undefined'){
    gold = Math.max(0, (gold||0) + (+r.gold||0));
    if(typeof stats === 'function') stats();
  }
  if(r.items && Array.isArray(r.items) && typeof addItem === 'function'){
    r.items.forEach(it => {
      const id = it.id;
      const q = +it.q || 1;
      if(id) addItem(id, q);
    });
  }
  // Rương chọn vùng → giao nguyên liệu mat{zoneId}
  if(r.chooseZone && zoneId != null && typeof addItem === 'function'){
    const matId = 'mat' + zoneId;
    const qty = r.zoneQty || 5;
    if(typeof ITEMS !== 'undefined' && ITEMS[matId]){
      addItem(matId, qty);
    } else {
      // fallback: vẫn cố thêm
      try{ addItem(matId, qty); }catch(_){}
    }
  }
  if(r.title && typeof window !== 'undefined'){
    // Danh hiệu sẽ được ghi bởi GitHub Actions vào titles/{uid}/{season}
    // Ở đây chỉ thông báo, không tự ghi
  }
}

/* ---------- Load & listen ---------- */
function loadMails(){
  if(!rdb || !me || guest){
    list = [];
    setBadge(0);
    if(open) renderList();
    return;
  }
  rdb.ref('mail/'+me).once('value').then(snap => {
    const val = snap.val() || {};
    list = Object.keys(val).map(id => Object.assign({id}, val[id]));
    const n = list.filter(m => !m.claimed).length;
    setBadge(n);
    if(open) renderList();
  }).catch(e => console.warn('[mail] load', e));
}

function watchMails(){
  if(!rdb || !me || guest) return;
  const ref = rdb.ref('mail/'+me);
  ref.on('value', snap => {
    const val = snap.val() || {};
    list = Object.keys(val).map(id => Object.assign({id}, val[id]));
    const n = list.filter(m => !m.claimed).length;
    setBadge(n);
    if(open) renderList();
  }, e => console.warn('[mail] watch', e));
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
