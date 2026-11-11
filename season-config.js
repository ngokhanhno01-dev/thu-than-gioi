/* ===== season-config.js — HẰNG SỐ DÙNG CHUNG cho GAME (trình duyệt) và SCRIPT CHỐT MÙA (Node, GitHub Actions) =====
   Đổi số ở ĐÂY là cả hai bên cùng đổi. Nạp trong index.html TRƯỚC 24-mail.js (xem hướng dẫn).
   Không chứa bí mật gì, an toàn để công khai trong repo. */
(function(root, factory){
  var cfg = factory();
  if(typeof module === 'object' && module.exports) module.exports = cfg;
  else root.TTGCFG = cfg;
})(typeof self !== 'undefined' ? self : this, function(){
  'use strict';

  var WEEK_MS = 7 * 24 * 3600 * 1000;

  var cfg = {
    /* ---- Mùa (khớp 25-season.js) ---- */
    START_MONDAY_MS: Date.parse('2026-11-09T00:00:00+07:00'),   // mốc Mùa 1
    WEEK_MS: WEEK_MS,
    CALENDAR_SEASONS: 104,           // script ghi sẵn lịch 104 mùa (~2 năm) lên RTDB seasonCal để Rules biết "mùa hiện tại"

    /* ---- Vé (khớp 25-season.js) ---- */
    TICKET_MAX: 10,
    TICKET_REGEN_MS: 30 * 60 * 1000,

    /* ---- Giới hạn uy danh (dùng cho Rules + chống gian lận) ----
       Thắng 1 trận tối đa 28 (FAME_WIN_MAX) × 1,6 (Danh vọng +60%) = 44,8 → làm tròn 45. */
    FAME_MAX_PER_FIGHT: 45,

    /* ---- Điều kiện nhận thưởng (chống nuôi tài khoản phụ) ---- */
    MIN_WINS: 3,                     // tối thiểu số trận thắng người thật trong mùa
    MIN_FOES: 2,                     // tối thiểu số đối thủ KHÁC NHAU đã thắng
    MIN_FAME: 20,                    // tối thiểu uy danh cuối mùa để được "Tham gia"

    /* ---- Nghi ngờ gian lận → GIỮ LẠI, không tự phát thưởng ---- */
    SUS_WINS_MIN: 12,                // thắng từ 12 trận trở lên mà chỉ với ≤ SUS_FOES_MAX đối thủ → đáng ngờ
    SUS_FOES_MAX: 3,
    SUS_REPORTS: 3,                  // từ 3 người KHÁC NHAU báo cáo → đáng ngờ
    SUS_REP_MASS: 8,                 // người báo cáo ≥ 8 người khác nhau trong mùa bị coi là báo cáo hàng loạt, không tính

    /* ---- Hộp thư ---- */
    MAIL_CLAIMED_HIDE_DAYS: 7,       // thư ĐÃ NHẬN: ẩn sau 7 ngày
    MAIL_KEEP_DAYS: 60,              // thư CHƯA nhận: ẩn sau 60 ngày (game), script xóa sau 67 ngày
    ARENALOG_KEEP_DAYS: 3,           // script dọn arenaLog cũ hơn 3 ngày
    SEASON_RANK_KEEP: 3,             // script giữ seasonRank của 3 mùa gần nhất, xóa mùa cũ hơn

    /* ---- BẢNG THƯỞNG THEO BẬC ----
       tier: 1 = Hạng 1 · 2 = Hạng 2-3 (hạng 2 và 3 có danh hiệu riêng) · 4 = Hạng 4-10 · 5 = Hạng 11-30 · 6 = Tham gia
       xu: số xu · box: số HỘP nguyên liệu chế trang bị (người chơi chọn vùng khi nhận)
       blood: {huyet, thuoc, tinh} = Giọt Huyết Mạch / Thảo Dược / Tinh Hoa hệ của thú (nâng huyết mạch)
       title: có danh hiệu hay không. Danh hiệu hiển thị kèm "· Mùa N". */
    TIERS: [
      { id: 'r1',   from: 1,  to: 1,  name: 'Hạng 1',     xu: 5000, box: 3, blood: { huyet: 5, thuoc: 10, tinh: 15 }, title: 1 },
      { id: 'r2',   from: 2,  to: 2,  name: 'Hạng 2',     xu: 3000, box: 2, blood: { huyet: 3, thuoc: 6,  tinh: 10 }, title: 2 },
      { id: 'r3',   from: 3,  to: 3,  name: 'Hạng 3',     xu: 2000, box: 2, blood: { huyet: 2, thuoc: 4,  tinh: 8  }, title: 3 },
      { id: 'r4_10',  from: 4,  to: 10, name: 'Hạng 4–10',  xu: 800,  box: 1, blood: { huyet: 1, thuoc: 2,  tinh: 4  }, title: 0 },
      { id: 'r11_30', from: 11, to: 30, name: 'Hạng 11–30', xu: 300,  box: 0, blood: { huyet: 0, thuoc: 1,  tinh: 2  }, title: 0 },
      { id: 'join',   from: 0,  to: 0,  name: 'Tham gia',   xu: 100,  box: 0, blood: { huyet: 0, thuoc: 0,  tinh: 0  }, title: 0 }
    ],

    /* Danh hiệu: giống nhau mọi mùa, game thêm đuôi " · Mùa N" */
    TITLES: { 1: 'Chí Tôn Đấu Trường', 2: 'Vô Địch Đấu Trường', 3: 'Cao Thủ Đấu Trường' },
    TITLE_ICONS: { 1: '👑', 2: '🥈', 3: '🥉' }
  };

  /* Bậc thưởng theo hạng (1..N) — trả object tier hoặc null. Hạng 0/không có → null (dùng tierJoin). */
  cfg.tierForRank = function(rank){
    for(var i = 0; i < cfg.TIERS.length; i++){
      var t = cfg.TIERS[i];
      if(t.from > 0 && rank >= t.from && rank <= t.to) return t;
    }
    return null;
  };
  cfg.tierJoin = function(){ return cfg.TIERS[cfg.TIERS.length - 1]; };
  cfg.tierById = function(id){ for(var i = 0; i < cfg.TIERS.length; i++) if(cfg.TIERS[i].id === id) return cfg.TIERS[i]; return null; };

  /* Mùa → thời điểm bắt đầu / kết thúc (ms) */
  cfg.seasonBegin = function(s){ return cfg.START_MONDAY_MS + (s - 1) * WEEK_MS; };
  cfg.seasonEnd   = function(s){ return cfg.START_MONDAY_MS + s * WEEK_MS; };
  cfg.seasonAt    = function(ms){ return ms < cfg.START_MONDAY_MS ? 1 : Math.floor((ms - cfg.START_MONDAY_MS) / WEEK_MS) + 1; };

  /* Tên danh hiệu đầy đủ: "Chí Tôn Đấu Trường · Mùa 12" */
  cfg.titleText = function(titleTier, season){
    var n = cfg.TITLES[titleTier];
    return n ? (n + ' · Mùa ' + season) : '';
  };

  /* Trần uy danh có thể đạt được tại thời điểm ms của mùa s (chống gian lận, khớp với Rules):
     vé đầy ban đầu + vé hồi suốt mùa, mỗi vé thắng tối đa FAME_MAX_PER_FIGHT. */
  cfg.fameCeiling = function(s, ms){
    var el = Math.max(0, ms - cfg.seasonBegin(s));
    return Math.floor(cfg.FAME_MAX_PER_FIGHT * (cfg.TICKET_MAX + el / cfg.TICKET_REGEN_MS));
  };

  /* Rương nguyên liệu: tên loại thưởng hiển thị */
  cfg.rewardText = function(t){
    var p = [];
    if(t.xu) p.push(t.xu + ' xu');
    if(t.box) p.push(t.box + ' hộp nguyên liệu');
    if(t.blood && (t.blood.huyet || t.blood.thuoc || t.blood.tinh)){
      var b = [];
      if(t.blood.huyet) b.push(t.blood.huyet + ' Giọt Huyết Mạch');
      if(t.blood.thuoc) b.push(t.blood.thuoc + ' Thảo Dược');
      if(t.blood.tinh)  b.push(t.blood.tinh + ' Tinh Hoa hệ thú');
      p.push(b.join(', '));
    }
    return p.join(' · ');
  };

  return cfg;
});
