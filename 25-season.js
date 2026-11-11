/* ===== 25-season.js — Đồng hồ mùa, vé Đấu trường, reset uy danh theo mùa
   Nạp SAU 20-online.js (cần TTGNET.offset) và TRƯỚC hoặc CÙNG lúc 19-save gọi afterLogin.
   Mùa 7 ngày, đổi lúc 00:00 thứ Hai giờ Việt Nam.
   START_MONDAY = mốc Mùa 1 (Thứ Hai 2026-11-09 00:00 VN).

   Bước 2: vé + reset uy danh + ghi seasonRank khi vào mùa mới.
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

  /* ---------- VÉ ĐẤU TRƯỜNG ----------
     - Tối đa TICKET_MAX.
     - Hồi 1 vé mỗi TICKET_REGEN_MS (30 phút) theo giờ máy chủ.
     - Tích cả lúc offline: khi mở game / gọi ensureTickets sẽ cộng đủ số vé
       tương ứng thời gian trôi qua (không cộng đôi với offline() của 19-save).
     - arenaTickets + arenaTicketAt nằm trong bản lưu (19-save.js).
  */
  function _getTickets(){
    return (typeof arenaTickets === 'number' && isFinite(arenaTickets))
      ? Math.max(0, Math.min(TICKET_MAX, Math.floor(arenaTickets)))
      : 0;
  }
  function _getTicketAt(){
    return (typeof arenaTicketAt === 'number' && isFinite(arenaTicketAt) && arenaTicketAt > 0)
      ? arenaTicketAt
      : 0;
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
      if(typeof arenaTickets === 'undefined' || arenaTickets === null){
        arenaTickets = TICKET_MAX;
      }else{
        arenaTickets = Math.max(0, Math.min(TICKET_MAX, Math.floor(arenaTickets)));
      }
      arenaTicketAt = now;
      return _getTickets();
    }

    if(tix >= TICKET_MAX){
      // Đã full: giữ mốc = now để không "dồn" quá khứ khi dùng 1 vé
      arenaTicketAt = now;
      arenaTickets = TICKET_MAX;
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
      arenaTickets = tix;
      arenaTicketAt = at;
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
    arenaTickets = _getTickets() - 1;
    // Nếu vừa từ full xuống, bắt đầu đếm hồi từ bây giờ
    if(_getTicketAt() <= 0 || _getTickets() + 1 >= TICKET_MAX){
      arenaTicketAt = nowSrv();
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
     - Máy chủ KHÔNG sửa bản lưu; mỗi máy tự reset.
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
   * fame ở đây là uy danh "gốc" (chưa trừ lost) — Bước 5 mới xử lý lost.
   * Gọi khi: vào mùa mới, sau trận (Bước 3), đổi cấp.
   */
  function writeSeasonRank(opts){
    opts = opts || {};
    if(_isGuest()) return Promise.resolve();
    const uid = _playerUid();
    if(!uid) return Promise.resolve();

    let rdb = null;
    try{ rdb = firebase.database(); }catch(e){ console.warn('[season] thiếu RTDB', e); return Promise.resolve(); }

    const s = opts.season || currentSeason();
    const nick = (opts.nick || _playerNick()).slice(0, 20);
    const f = Math.max(0, Math.floor(opts.fame != null ? opts.fame : (typeof fame === 'number' ? fame : 0)));
    const lv = Math.max(1, Math.min(100, Math.floor(opts.lv != null ? opts.lv : (typeof level === 'number' ? level : 1))));
    const wins = Math.max(0, Math.floor(opts.wins != null ? opts.wins : 0));
    const foes = Math.max(0, Math.floor(opts.foes != null ? opts.foes : 0));
    // lost chỉ được TĂNG bởi người tấn công (Rules). Chủ chỉ được ghi lost >= giá trị cũ, thường giữ nguyên.
    // Khi tạo mới: lost = 0. Khi cập nhật sau trận thắng của mình: không đụng lost.
    const payload = {
      nick: nick,
      fame: f,
      lost: 0,          // tạo mới = 0; khi update sẽ đọc lại (xem dưới)
      lv: lv,
      wins: wins,
      foes: foes,
      t: firebase.database.ServerValue.TIMESTAMP
    };

    const ref = rdb.ref('seasonRank/' + s + '/' + uid);
    // Đọc lost hiện tại để không ghi đè xuống (Rules bắt lost chỉ tăng)
    return ref.once('value').then(function(sn){
      if(sn.exists()){
        const cur = sn.val() || {};
        payload.lost = Math.max(0, Math.floor(Number(cur.lost) || 0));
        // Giữ wins/foes nếu không truyền mới
        if(opts.wins == null && cur.wins != null) payload.wins = Math.max(0, Math.floor(Number(cur.wins) || 0));
        if(opts.foes == null && cur.foes != null) payload.foes = Math.max(0, Math.floor(Number(cur.foes) || 0));
      }
      return ref.set(payload);
    }).catch(function(e){
      console.warn('[season] ghi seasonRank lỗi', e);
    });
  }

  /**
   * Kiểm tra và reset uy danh nếu sang mùa mới.
   * Trả true nếu vừa reset.
   */
  function checkSeasonReset(opts){
    opts = opts || {};
    const cur = currentSeason();
    let fs = (typeof fameSeason === 'number' && isFinite(fameSeason)) ? Math.floor(fameSeason) : 0;

    // fameSeason = 0 (bản lưu cũ) → coi như mùa hiện tại, gán luôn, không reset uy danh lần đầu
    if(fs <= 0){
      fameSeason = cur;
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
    fameSeason = cur;
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

    // 3) Kiểm tra mỗi phút khi đang chơi (đổi mùa đúng lúc 00:00 thứ Hai)
    if(_tickTimer) clearInterval(_tickTimer);
    _tickTimer = setInterval(function(){
      try{
        ensureTickets();
        checkSeasonReset();
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
    afterLogin: afterLogin
  };

  // Tiện lợi gọi tắt
  window.currentSeason = currentSeason;
  window.nowSrv = nowSrv;

})();
