/* ===== 25-season.js — Đồng hồ mùa & khung dữ liệu Đấu trường
   Nạp SAU 20-online.js (cần TTGNET.offset).
   Mùa 7 ngày, đổi lúc 00:00 thứ Hai giờ Việt Nam.
   START_MONDAY = mốc Mùa 1 (Thứ Hai 2026-11-09 00:00 VN).
*/
(function(){
  'use strict';

  /* ---------- HẰNG SỐ ---------- */
  // Mốc bắt đầu Mùa 1: Thứ Hai 9/11/2026 00:00 giờ Việt Nam (UTC+7)
  const START_MONDAY_MS = Date.parse('2026-11-09T00:00:00+07:00');
  const WEEK_MS = 7 * 24 * 3600 * 1000;

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
    // VN = UTC+7
    const d = new Date(end);
    const pad = n => (n < 10 ? '0' : '') + n;
    // Dùng getUTC* rồi +7
    const vn = new Date(end + 7 * 3600000);
    return pad(vn.getUTCDate()) + '/' + pad(vn.getUTCMonth() + 1) + ' ' +
           pad(vn.getUTCHours()) + ':' + pad(vn.getUTCMinutes()) + ' VN';
  }

  /* ---------- XUẤT RA NGOÀI ---------- */
  window.TTGSEASON = {
    START_MONDAY_MS: START_MONDAY_MS,
    WEEK_MS: WEEK_MS,
    nowSrv: nowSrv,
    currentSeason: currentSeason,
    seasonBounds: seasonBounds,
    msToSeasonEnd: msToSeasonEnd,
    countdownStr: countdownStr,
    seasonEndVN: seasonEndVN
  };

  // Tiện lợi gọi tắt
  window.currentSeason = currentSeason;
  window.nowSrv = nowSrv;

})();
