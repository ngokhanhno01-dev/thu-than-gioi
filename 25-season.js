/* ===== 25-season.js — Đồng hồ mùa, vé Đấu trường, reset uy danh theo mùa
   Nạp SAU 20-online.js (cần TTGNET.offset) và TRƯỚC hoặc CÙNG lúc 19-save gọi afterLogin.
   Mùa 7 ngày, đổi lúc 00:00 thứ Hai giờ Việt Nam.
   START_MONDAY = mốc Mùa 1 (Thứ Hai 2026-11-09 00:00 VN).

   Bước 2: vé + reset uy danh + ghi seasonRank khi vào mùa mới.
   Bước 5: áp uy danh bị trừ (lost) khi bị thách đấu, nghe node của mình.
*/
(function(){
  'use strict';

  /* ---------- HẰNG SỐ ---------- */
  // Mốc bắt đầu Mùa 1: Thứ Hai 9/11/2026 00:00 giờ Việt Nam (UTC+7)
  const START_MONDAY_MS = Date.parse('2026-11-09T00:00:00+07:00');
  const WEEK_MS = 7 * 24 * 3600 * 1000;

  // Vé đấu trường
  const TICKET_MAX = 10;                 // tối đa 10 vé
  const TICKET_REGEN_MS = 30 * 60 * 1000; // 1 vé / 30 phút (giờ máy chủ)

  // Kiểm tra đổi mùa mỗi phút khi đang chơi
  const SEASON_CHECK_MS = 60 * 1000;

  /* ---------- GIỜ MÁY CHỦ ---------- */
  function nowSrv(){
    try{
      if(window.TTGNET && typeof TTGNET.offset === 'function'){
        return Date.now() + (TTGNET.offset() || 0);
      }
    }catch(_){}
    return Date.now();
  }

  /* ---------- MÙA HIỆN TẠI ---------- */
  /** Trả về số mùa hiện tại (1, 2, 3...) */
  function currentSeason(){
    const n = nowSrv();
    if(n < START_MONDAY_MS) return 1;
    return Math.max(1, Math.floor((n - START_MONDAY_MS) / WEEK_MS) + 1);
  }

  /** { begin, end } — timestamp ms của mùa s (hoặc mùa hiện tại nếu bỏ trống) */
  function seasonBounds(s){
    s = s || currentSeason();
    const begin = START_MONDAY_MS + (s - 1) * WEEK_MS;
    return { begin: begin, end: begin + WEEK_MS };
  }

  /** Còn bao nhiêu ms đến hết mùa hiện tại */
  function msToSeasonEnd(){
    const b = seasonBounds();
    return Math.max(0, b.end - nowSrv());
  }

  /** Chuỗi đếm ngược gọn: "2n 14g 30p" hoặc "45p 12s" */
  function countdownStr(){
    let ms = msToSeasonEnd();
    if(ms <= 0) return '0p';
    const d = Math.floor(ms / 86400000); ms %= 86400000;
    const h = Math.floor(ms / 3600000); ms %= 3600000;
    const m = Math.floor(ms / 60000); ms %= 60000;
    const s = Math.floor(ms / 1000);
    if(d > 0) return d + 'n ' + h + 'g ' + m + 'p';
    if(h > 0) return h + 'g ' + m + 'p';
    if(m > 0) return m + 'p ' + s + 's';
    return s + 's';
  }

  /** Ngày giờ kết thúc mùa (giờ VN, chuỗi ngắn) */
  function seasonEndVN(){
    const end = seasonBounds().end;
    const pad = n => (n < 10 ? '0' : '') + n;
    const vn = new Date(end + 7 * 3600000); // ép +7 bằng cách cộng ms rồi lấy UTC
    return pad(vn.getUTCDate()) + '/' + pad(vn.getUTCMonth() + 1) + ' ' +
           pad(vn.getUTCHours()) + ':' + pad(vn.getUTCMinutes()) + ' VN';
  }


  /* ---------- LỚP TRUY CẬP: chạy được cả khi 19-save.js CŨ chưa khai báo biến vé/mùa ----------
     Nếu 19-save.js mới có biến toàn cục (arenaTickets, arenaTicketAt, fameSeason) thì dùng chúng
     (được lưu cùng bản lưu game). Nếu không, dùng bản dự phòng lưu trong localStorage của máy. */
  const FB_KEY = 'ttg_arena_fb';
  const FB = (function(){ try{ return JSON.parse(localStorage.getItem(FB_KEY)) || {}; }catch(_){ return {}; } })();
  function _fbSave(){ try{ localStorage.setItem(FB_KEY, JSON.stringify(FB)); }catch(_){} }
  function _hasT(){ try{ return typeof arenaTickets !== 'undefined' && typeof arenaTicketAt !== 'undefined'; }catch(_){ return false; } }
  function _hasS(){ try{ return typeof fameSeason !== 'undefined'; }catch(_){ return false; } }
  function _gT(){ return _hasT() ? arenaTickets : FB.tix; }
  function _gAt(){ return _hasT() ? arenaTicketAt : FB.at; }
  function _gFs(){ return _hasS() ? fameSeason : FB.fs; }
  function _sT(v){ if(_hasT()) arenaTickets = v; else { FB.tix = v; _fbSave(); } }
  function _sAt(v){ if(_hasT()) arenaTicketAt = v; else { FB.at = v; _fbSave(); } }
  function _sFs(v){ if(_hasS()) fameSeason = v; else { FB.fs = v; _fbSave(); } }
  /* fameLost = tổng uy danh bị trừ do bị thách đấu đã áp vào bản lưu (Bước 5) */
  function _hasL(){ try{ return typeof fameLost !== 'undefined'; }catch(_){ return false; } }
  function _gL(){ const v = _hasL() ? fameLost : FB.fl; return (typeof v === 'number' && isFinite(v)) ? Math.max(0, Math.floor(v)) : 0; }
  function _sL(v){ v = Math.max(0, Math.floor(v) || 0); if(_hasL()) fameLost = v; else { FB.fl = v; _fbSave(); } }

  /* ---------- VÉ ĐẤU TRƯỜNG ----------
     - Tối đa TICKET_MAX.
     - Hồi 1 vé mỗi TICKET_REGEN_MS (30 phút) theo giờ máy chủ.
     - Tích cả lúc offline: khi mở game / gọi ensureTickets sẽ cộng đủ số vé
       tương ứng thời gian trôi qua (không cộng đôi với offline() của 19-save).
     - arenaTickets + arenaTicketAt nằm trong bản lưu (19-save.js).
  */
  function _getTickets(){
    const v = _gT();
    return (typeof v === 'number' && isFinite(v)) ? Math.max(0, Math.min(TICKET_MAX, Math.floor(v))) : 0;
  }
  function _getTicketAt(){
    const v = _gAt();
    return (typeof v === 'number' && isFinite(v) && v > 0) ? v : 0;
  }

  /**
   * Tính lại số vé dựa trên giờ máy chủ.
   * Gọi khi: đăng nhập, sau mỗi trận, trước khi hiện UI vé, mỗi phút.
   * Không tự trừ vé — chỉ hồi.
   */
  function ensureTickets(){
    const now = nowSrv();
    let tix = _getTickets();
    let at = _getTicketAt();

    // Lần đầu (chưa có mốc): cho full vé, đặt mốc = now
    if(!at || at <= 0){
      if(_gT() == null){
        _sT(TICKET_MAX);
      }else{
        _sT(Math.max(0, Math.min(TICKET_MAX, Math.floor(_gT()))));
      }
      _sAt(now);
      return _getTickets();
    }

    if(tix >= TICKET_MAX){
      // Đã full: giữ mốc = now để không "dồn" quá khứ khi dùng 1 vé
      _sAt(now);
      _sT(TICKET_MAX);
      return TICKET_MAX;
    }

    // Cộng số vé hồi được
    const elapsed = Math.max(0, now - at);
    const gained = Math.floor(elapsed / TICKET_REGEN_MS);
    if(gained > 0){
      tix = Math.min(TICKET_MAX, tix + gained);
      // Chỉ tiến mốc theo đúng số vé đã cộng (phần dư giữ lại)
      at = at + gained * TICKET_REGEN_MS;
      // Nếu đã full thì reset mốc = now
      if(tix >= TICKET_MAX){
        tix = TICKET_MAX;
        at = now;
      }
      _sT(tix);
      _sAt(at);
    }
    return _getTickets();
  }

  /** Số vé hiện tại (đã ensure) */
  function getTickets(){
    return ensureTickets();
  }

  /**
   * Trừ 1 vé. Trả true nếu trừ thành công, false nếu hết vé.
   * Gọi TRƯỚC khi bắt đầu Khiêu chiến (Bước 3).
   */
  function useTicket(){
    ensureTickets();
    if(_getTickets() < 1) return false;
    _sT(_getTickets() - 1);
    // Nếu vừa từ full xuống, bắt đầu đếm hồi từ bây giờ
    if(_getTicketAt() <= 0 || _getTickets() + 1 >= TICKET_MAX){
      _sAt(nowSrv());
    }
    // Lưu sớm để không mất vé khi thoát
    try{ if(window.TTGSAVE && typeof TTGSAVE.save === 'function') TTGSAVE.save(); }catch(_){}
    return true;
  }

  /** Còn bao nhiêu ms đến vé tiếp theo (0 nếu đang full hoặc đã có vé) */
  function nextTicketIn(){
    ensureTickets();
    if(_getTickets() >= TICKET_MAX) return 0;
    const at = _getTicketAt();
    const nextAt = at + TICKET_REGEN_MS;
    return Math.max(0, nextAt - nowSrv());
  }

  /** Chuỗi hiển thị: "Vé 7/10 · +1 sau 12p 30s" */
  function ticketsStr(){
    const n = getTickets();
    if(n >= TICKET_MAX) return 'Vé ' + n + '/' + TICKET_MAX + ' (đầy)';
    const ms = nextTicketIn();
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return 'Vé ' + n + '/' + TICKET_MAX + ' · +1 sau ' + m + 'p ' + s + 's';
  }

  /* ---------- RESET UY DANH THEO MÙA ----------
     - Khi đăng nhập / mỗi phút: nếu fameSeason < mùa hiện tại
       → fame = 0, fameSeason = mùa hiện tại, lưu, thông báo, ghi seasonRank.
     - Máy chủ KHÔNG sửa bản lưu); mỗi máy tự reset.
  */
  function _playerNick(){
    try{
      if(window.TTGNET && TTGNET.me && TTGNET.me.name) return String(TTGNET.me.name).slice(0, 20);
    }catch(_){}
    try{
      if(window.TTGSAVE && TTGSAVE.user && TTGSAVE.user.name) return String(TTGSAVE.user.name).slice(0, 20);
    }catch(_){}
    return 'Người chơi';
  }

  function _playerUid(){
    try{
      if(window.TTGNET && TTGNET.me && TTGNET.me.uid) return TTGNET.me.uid;
    }catch(_){}
    try{
      if(window.TTGSAVE && TTGSAVE.user && TTGSAVE.user.key) return TTGSAVE.user.key;
    }catch(_){}
    return null;
  }

  function _isGuest(){
    try{
      if(window.TTGNET && TTGNET.me) return !!TTGNET.me.guest;
    }catch(_){}
    try{
      if(window.TTGSAVE && TTGSAVE.user) return TTGSAVE.user.key === '__guest';
    }catch(_){}
    return true;
  }

  /**
   * Ghi / cập nhật mục của mình trên seasonRank/{mùa}/{uid}.
   * BƯỚC 5: node.fame = uy danh trong bản lưu + fameLost (phần đã bị trừ và đã áp vào bản lưu).
   *         Uy danh hiển thị = max(0, node.fame - node.lost) = uy danh bản lưu - phần bị trừ CHƯA áp.
   * Chủ node CHỈ ghi các trường của mình (nick, fame, lv, wins, foes, t) bằng update(),
   * KHÔNG đụng lost / hit / prot / lg (do người tấn công ghi) nên không bao giờ ghi đè mất lượt trừ.
   */
  function writeSeasonRank(opts){
    opts = opts || {};
    if(_isGuest()) return Promise.resolve({ok:false, error:'guest'});
    const uid = _playerUid();
    if(!uid) return Promise.resolve({ok:false, error:'no-uid'});

    let rdb = null;
    try{ rdb = firebase.database(); }catch(e){ console.warn('[season] thiếu RTDB', e); return Promise.resolve({ok:false, error:'no-rtdb'}); }

    const s = opts.season || currentSeason();
    const nick = (opts.nick || _playerNick()).slice(0, 20);
    const net = Math.max(0, Math.floor(opts.fame != null ? opts.fame : (typeof fame === 'number' ? fame : 0)));
    const f = net + _gL();
    const lv = Math.max(1, Math.min(100, Math.floor(opts.lv != null ? opts.lv : (typeof level === 'number' ? level : 1))));
    let wins = Math.max(0, Math.floor(opts.wins != null ? opts.wins : 0));
    let foes = Math.max(0, Math.floor(opts.foes != null ? opts.foes : 0));

    const ref = rdb.ref('seasonRank/' + s + '/' + uid);
    return ref.once('value').then(function(sn){
      const T = firebase.database.ServerValue.TIMESTAMP;
      if(sn.exists()){
        const cur = sn.val() || {};
        if(opts.wins == null && cur.wins != null) wins = Math.max(0, Math.floor(Number(cur.wins) || 0));
        if(opts.foes == null && cur.foes != null) foes = Math.max(0, Math.floor(Number(cur.foes) || 0));
        if(opts.addWins) wins += Math.floor(opts.addWins);
        if(opts.addFoes) foes += Math.floor(opts.addFoes);
        // update() chỉ chạm các trường của chủ → lost/hit/prot/lg của người tấn công được giữ nguyên
        return ref.update({ nick: nick, fame: f, lv: lv, wins: wins, foes: foes, t: T });
      }
      if(opts.addWins) wins += Math.floor(opts.addWins);
      if(opts.addFoes) foes += Math.floor(opts.addFoes);
      return ref.set({ nick: nick, fame: f, lost: 0, lv: lv, wins: wins, foes: foes, t: T });
    }).then(function(){
      return {ok:true};
    }).catch(function(e){
      console.warn('[season] ghi seasonRank lỗi', e);
      return {ok:false, error:String((e && (e.code || e.message)) || e)};
    });
  }

  /* ---------- BƯỚC 5: ÁP "UY DANH BỊ TRỪ" KHI BỊ THÁCH ĐẤU ----------
     Người tấn công cộng dồn node.lost (trên bảng). Máy của chủ nghe node của mình:
     lost mới > fameLost (đã áp) → trừ phần chênh vào fame trong bản lưu, rồi nhớ fameLost = lost.
     Nhờ vậy không bao giờ trừ hai lần, dù đăng nhập lại hay đổi máy (fameLost nằm trong bản lưu). */
  let _myNode = null;       // bản sao node của mình (lost, hit, prot...) để giao diện đọc
  let _ownRef = null, _ownCb = null, _ownSeason = 0;

  function applyLost(L){
    L = Math.max(0, Math.floor(Number(L) || 0));
    const applied = _gL();
    if(L <= applied) return 0;
    const d = L - applied;
    const before = (typeof fame === 'number' ? fame : 0);
    fame = Math.max(0, before - d);
    _sL(L);
    try{
      if(typeof log === 'function') log('🛡️ Bạn bị thách đấu khi vắng mặt/đang chơi: uy danh <b>-' + (before - fame) + '</b> (còn ' + fame + ').');
      if(typeof stats === 'function') stats();
    }catch(_){}
    try{ if(window.TTGSAVE && typeof TTGSAVE.save === 'function') TTGSAVE.save(); }catch(_){}
    return before - fame;
  }

  function stopOwnListen(){
    if(_ownRef && _ownCb){ try{ _ownRef.off('value', _ownCb); }catch(_){} }
    _ownRef = null; _ownCb = null; _ownSeason = 0; _myNode = null;
  }

  function startOwnListen(){
    if(_isGuest()) return;
    const uid = _playerUid();
    if(!uid) return;
    let rdb = null;
    try{ rdb = firebase.database(); }catch(_){ return; }
    const s = currentSeason();
    if(_ownRef && _ownSeason === s) return;
    stopOwnListen();
    _ownSeason = s;
    _ownRef = rdb.ref('seasonRank/' + s + '/' + uid);
    _ownCb = _ownRef.on('value', function(sn){
      _myNode = sn.exists() ? (sn.val() || {}) : null;
      if(_myNode) applyLost(_myNode.lost);
    }, function(err){ console.warn('[season] nghe node mình lỗi', err); });
  }

  /** hết hạn bảo vệ lúc nào (ms giờ máy chủ), 0 nếu không có */
  function myProtUntil(){
    const p = _myNode ? Number(_myNode.prot) : 0;
    return (p && p > nowSrv()) ? p : 0;
  }

  /**
   * Kiểm tra và reset uy danh nếu sang mùa mới.
   * Trả true nếu vừa reset.
   */
  function checkSeasonReset(opts){
    opts = opts || {};
    const cur = currentSeason();
    const _fv = _gFs();
    let fs = (typeof _fv === 'number' && isFinite(_fv)) ? Math.floor(_fv) : 0;

    // fameSeason = 0 (bản lưu cũ) → coi như mùa hiện tại, gán luôn, không reset uy danh lần đầu
    if(fs <= 0){
      _sFs(cur);
      ensureTickets();
      // Vẫn ghi seasonRank để xuất hiện trong danh sách khiêu chiến
      writeSeasonRank({ season: cur, fame: (typeof fame === 'number' ? fame : 0) });
      try{ if(window.TTGSAVE && typeof TTGSAVE.save === 'function') TTGSAVE.save(); }catch(_){}
      return false;
    }

    if(fs >= cur){
      // Cùng mùa: chỉ đảm bảo có mục trên bảng (đầu mùa / lần đầu)
      ensureTickets();
      writeSeasonRank({ season: cur, fame: (typeof fame === 'number' ? fame : 0) });
      return false;
    }

    // Sang mùa mới → reset
    const oldFame = (typeof fame === 'number' ? fame : 0);
    fame = 0;
    _sL(0);                 // mùa mới: phần bị trừ cũ không còn liên quan
    _sFs(cur);
    ensureTickets();

    try{
      if(typeof log === 'function'){
        log('🏆 <b>Mùa ' + cur + ' bắt đầu</b>. Uy danh về 0 (trước đó ' + oldFame + '). Kiểm tra hộp thư để nhận thưởng mùa cũ.');
      }
      if(typeof stats === 'function') stats();
    }catch(_){}

    writeSeasonRank({ season: cur, fame: 0, wins: 0, foes: 0 });

    try{ if(window.TTGSAVE && typeof TTGSAVE.save === 'function') TTGSAVE.save(); }catch(_){}
    return true;
  }

  /* ---------- KHỞI ĐỘNG SAU KHI VÀO GAME ---------- */
  let _started = false;
  let _tickTimer = null;

  function afterLogin(o){
    if(_started) return;
    _started = true;
    o = o || {};

    // 1) Hồi vé theo thời gian offline (giờ máy chủ)
    ensureTickets();

    // 2) Reset uy danh nếu sang mùa (hoặc gán fameSeason lần đầu)
    checkSeasonReset();

    // 2b) Bước 5: nghe node của mình để áp uy danh bị trừ; nghe nhật ký bị thách đấu
    try{ startOwnListen(); }catch(e){ console.warn('[season] own listen', e); }
    try{ if(window.TTGARENA && TTGARENA.startLogListen) TTGARENA.startLogListen(); }catch(e){ console.warn('[season] log listen', e); }

    // 3) Kiểm tra mỗi phút khi đang chơi (đổi mùa đúng lúc 00:00 thứ Hai)
    if(_tickTimer) clearInterval(_tickTimer);
    _tickTimer = setInterval(function(){
      try{
        ensureTickets();
        checkSeasonReset();
        startOwnListen();   // sang mùa mới thì nghe node của mùa mới
      }catch(e){ console.warn('[season] tick', e); }
    }, SEASON_CHECK_MS);

    // Log gọn cho test
    try{
      if(typeof log === 'function'){
        log('🎫 ' + ticketsStr() + ' · Mùa ' + currentSeason() + ' (còn ' + countdownStr() + ')');
      }
    }catch(_){}
  }

  /* ---------- XUẤT RA NGOÀI ---------- */
  window.TTGSEASON = {
    START_MONDAY_MS: START_MONDAY_MS,
    WEEK_MS: WEEK_MS,
    TICKET_MAX: TICKET_MAX,
    TICKET_REGEN_MS: TICKET_REGEN_MS,
    nowSrv: nowSrv,
    currentSeason: currentSeason,
    seasonBounds: seasonBounds,
    msToSeasonEnd: msToSeasonEnd,
    countdownStr: countdownStr,
    seasonEndVN: seasonEndVN,
    // Vé
    ensureTickets: ensureTickets,
    getTickets: getTickets,
    useTicket: useTicket,
    nextTicketIn: nextTicketIn,
    ticketsStr: ticketsStr,
    // Mùa + xếp hạng
    checkSeasonReset: checkSeasonReset,
    writeSeasonRank: writeSeasonRank,
    afterLogin: afterLogin,
    // Bước 5
    applyLost: applyLost,
    startOwnListen: startOwnListen,
    myProtUntil: myProtUntil,
    myNode: function(){ return _myNode; },
    getFameLost: _gL
  };

  // Tiện lợi gọi tắt
  window.currentSeason = currentSeason;
  window.nowSrv = nowSrv;

})();
