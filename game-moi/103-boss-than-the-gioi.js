/* ===== 103-boss-than-the-gioi.js (TTGBTG): TRẠNG THÁI THẾ GIỚI + LỊCH 3 BOSS THẦN (27/11/2026) =====
   ĐÃ NỐI (27/11/2026, bước 5): map 89 (vẽ boss, ẩn + icon 2 kiếm khi có người đánh, đếm khóa), cầu nối 82 (vaoDanh/huy), trận index.html (bỏ chạy ở mốc, thua khóa, thắng rớt trứng). File này thuần logic, không DOM; mọi số ở CFG.
   1 vs 1 (người dùng chốt 27/11/2026): chỉ 1 người đánh 1 lúc, bỏ hẳn ý 'tối đa 5 người đánh chung'.

   LỊCH (phương án A, người dùng chốt 27/11/2026): giờ Việt Nam (UTC+7). Chu kỳ 12 tiếng chia 3 khung 4 tiếng:
     0-4h & 12-16h: Đế Giang (th1) · 4-8h & 16-20h: Chúc Long (th2) · 8-12h & 20-24h: Vô Cực (th3).
     Trong khung của mình boss CÓ MẶT 30 phút, bắt đầu từ đầu khung + CFG.batDauPhut (mặc định 0 => 0:00-0:30, 4:00-4:30, ...).
     Vùng xuất hiện: ngẫu nhiên từ HẠT GIỐNG (ngày VN + số khung) => mọi người chơi thấy giống nhau, sau nối server không phải sửa.
     Chỉ chọn trong danh sách vùng đang có (CFG.dsVung, mặc định lấy THU_MOI.zones). Số vùng ở đây = z trong code (0 = Vùng 1).

   MÁU TOÀN CỤC + BỎ CHẠY: mỗi lần xuất hiện (1 khung) có 1 trạng thái: hp (tỉ lệ 0..1 máu tối đa), vùng, người đang đánh, đã chết.
     vaoDanh(uid) trả mocChay = mốc 10% kế tiếp DƯỚI máu hiện tại (1,0 -> 0,9; 0,85 -> 0,8). Trận đánh xuống tới mốc đó thì gọi chay(uid, hp):
     boss sang vùng KHÁC (ngẫu nhiên theo hạt giống + số lần chạy), giữ máu còn lại. Máu <= 10% (CFG.khongChayDuoi): mocChay = null, đánh đến cùng.
     Người làm boss chạy: mặc định KHÔNG nhận thưởng (index.html quyết định, ghi ở đây để nhớ).
     ketThuc(uid, {kq:'thang'|'thua', hp}): thắng => boss chết tới hết khung; thua => boss hiện lại cùng vùng, máu = hp truyền vào (giữ sát thương đã gây), người thua bị khóa CFG.khoaGiay (60s).
   TRÊN MAP: trangThai().dangDanh != null => người khác thấy boss ẩn + icon 2 kiếm chéo (bước 5 vẽ).
   LƯU: localStorage khóa 'ttg_btg_v1' (KHÔNG dùng tiền tố ttg_moi_ vì 51-thu-moi.js xóa các khóa đó). Sau này thay load()/save() bằng server.
   AN TOÀN: người đang đánh mà tắt trang thì sau CFG.tranQuaHanGiay giây coi như bỏ trận (nhả boss, máu giữ nguyên). Hết thời gian trận thật / tối đa 5 người đánh chung: CHƯA LÀM.
   API: TTGBTG.CFG, .lich(t) | .trangThai(t) | .vaoDanh(uid,t) | .chay(uid,hp,t) | .ketThuc(uid,ketQua,t) | .khoaCon(uid,t) | .datDongHo(fn) (test) | .xoa() (test). t = ms epoch, bỏ trống = bây giờ. */
(function (root) {
  'use strict';
  var CFG = {
    thuTu: ['th1', 'th2', 'th3'],     /* thứ tự khung trong chu kỳ */
    khungGio: 4,                      /* mỗi khung 4 tiếng; 3 khung = chu kỳ 12 tiếng */
    coMatPhut: 30,                    /* boss có mặt 30 phút mỗi khung */
    batDauPhut: 0,                    /* phút bắt đầu có mặt tính từ đầu khung */
    lechGio: 7,                       /* múi giờ Việt Nam UTC+7 */
    mocChay: 0.10,                    /* mỗi lần tụt thêm 10% máu tối đa thì chạy */
    khongChayDuoi: 0.10,              /* máu <= 10%: không chạy nữa */
    khoaGiay: 60,                     /* người thua bị khóa 60 giây */
    tranQuaHanGiay: 600,              /* người đang đánh không báo kết quả sau 10 phút: nhả boss */
    dsVung: null,                     /* null = lấy THU_MOI.zones (các vùng đang có). Hoặc mảng z, vd [0,1,2] */
    key: 'ttg_btg_v1'
  };
  var nowFn = function () { return Date.now(); };
  var DB = { lan: {}, khoa: {} };     /* lan[maLan] = {hp, vung, soChay, dangDanh, tDanh, chet}; khoa[uid] = ms hết khóa */
  try { var o = JSON.parse(root.localStorage.getItem(CFG.key) || 'null'); if (o && o.lan && o.khoa) DB = o; } catch (e) {}
  function save() { try { root.localStorage.setItem(CFG.key, JSON.stringify(DB)); } catch (e) {} }

  function T(t) { return t == null ? nowFn() : +t; }
  function dsVung() {
    if (CFG.dsVung && CFG.dsVung.length) return CFG.dsVung.slice();
    var z = (root.THU_MOI && root.THU_MOI.zones) || [];
    var a = z.map(function (x) { return x.z; }).filter(function (x) { return typeof x === 'number'; }).sort(function (a, b) { return a - b; });
    return a.length ? a : [0];
  }
  /* số ngẫu nhiên 0..1 cố định theo chuỗi hạt giống (FNV-1a + xorshift) */
  function hat(s) {
    var h = 2166136261, i;
    for (i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0;
    return h / 4294967296;
  }
  /* khung đang chạy tại thời điểm t */
  function lich(t) {
    t = T(t);
    var H = 3600000, lech = CFG.lechGio * H, tv = t + lech, kh = CFG.khungGio * H;
    var soKhung = Math.floor(tv / kh), dauKhung = soKhung * kh - lech;      /* số khung tính từ epoch (giờ VN) */
    var n = CFG.thuTu.length, loai = CFG.thuTu[((soKhung % n) + n) % n];
    var bd = dauKhung + CFG.batDauPhut * 60000, kt = bd + CFG.coMatPhut * 60000;
    var d = new Date(dauKhung + lech), ngay = d.getUTCFullYear() + '-' + (d.getUTCMonth() + 1) + '-' + d.getUTCDate();
    var khTrongNgay = Math.floor((tv % (24 * H)) / kh);
    var vs = dsVung(), vung = vs[Math.floor(hat(ngay + '|' + khTrongNgay) * vs.length)];
    var sauKhung = (soKhung + 1) * kh - lech, loaiSau = CFG.thuTu[(((soKhung + 1) % n) + n) % n];
    return { maLan: ngay + '#' + khTrongNgay, loai: loai, batDau: bd, ketThuc: kt, coMat: t >= bd && t < kt, vungGoc: vung, ngay: ngay,
             tiepTheo: { loai: loaiSau, batDau: sauKhung + CFG.batDauPhut * 60000 } };
  }
  function lanCua(L) {
    var s = DB.lan[L.maLan];
    if (!s) {
      s = DB.lan[L.maLan] = { hp: 1, vung: L.vungGoc, soChay: 0, dangDanh: null, tDanh: 0, chet: false };
      Object.keys(DB.lan).forEach(function (k) { if (k !== L.maLan) delete DB.lan[k]; });   /* chỉ giữ lần hiện tại */
      save();
    }
    return s;
  }
  function nhaQuaHan(s, t) {
    if (s.dangDanh && t - s.tDanh > CFG.tranQuaHanGiay * 1000) { s.dangDanh = null; save(); }
  }
  function khoaCon(uid, t) {   /* số giây còn bị khóa (0 = khiêu chiến được) */
    t = T(t); var u = DB.khoa[uid] || 0;
    if (u && u <= t) { delete DB.khoa[uid]; save(); return 0; }
    return u ? Math.ceil((u - t) / 1000) : 0;
  }
  function mocKe(hp) {   /* mốc chạy kế tiếp dưới hp; null nếu đã <= khongChayDuoi */
    if (hp <= CFG.khongChayDuoi + 1e-9) return null;
    var m = CFG.mocChay, k = Math.ceil(hp / m - 1e-9) - 1, v = Math.round(k * m * 1000) / 1000;
    return v < CFG.khongChayDuoi - 1e-9 ? null : v;
  }
  function trangThai(t) {
    t = T(t); var L = lich(t);
    var out = { loai: L.loai, coMat: L.coMat, batDau: L.batDau, ketThuc: L.ketThuc, tiepTheo: L.tiepTheo, maLan: L.maLan, vung: null, hp: 1, dangDanh: null, chet: false };
    if (!L.coMat) return out;
    var s = lanCua(L); nhaQuaHan(s, t);
    out.vung = s.vung; out.hp = s.hp; out.dangDanh = s.dangDanh; out.chet = s.chet; out.soChay = s.soChay;
    out.hien = !s.chet && !s.dangDanh;   /* hiện trên map (không ai đánh, chưa chết) */
    return out;
  }
  function loi(m) { return { ok: false, loi: m }; }
  var uidMem = null;
  function uid() {   /* id người chơi tạm (chưa có tài khoản/server): tạo 1 lần, lưu localStorage 'ttg_btg_uid' (khác tiền tố ttg_moi_ nên không bị xóa) */
    if (uidMem) return uidMem;
    var k = 'ttg_btg_uid', v = null;
    try { v = root.localStorage.getItem(k); } catch (e) {}
    if (!v) { v = 'u' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); try { root.localStorage.setItem(k, v); } catch (e) {} }
    return (uidMem = v);
  }
  function vaoDanh(uid, t) {
    t = T(t); var L = lich(t);
    if (!L.coMat) return loi('Boss Thần chưa xuất hiện');
    var s = lanCua(L); nhaQuaHan(s, t);
    if (s.chet) return loi('Boss đã bị hạ');
    var k = khoaCon(uid, t); if (k > 0) return loi('Còn ' + k + ' giây mới khiêu chiến lại được');
    if (s.dangDanh && s.dangDanh !== uid) return loi('Đang có người khiêu chiến');
    s.dangDanh = uid; s.tDanh = t; save();
    return { ok: true, loai: L.loai, vung: s.vung, hp: s.hp, mocChay: mocKe(s.hp), maLan: L.maLan };
  }
  function cuaToi(uid, t) {
    var L = lich(t); if (!L.coMat) return null;
    var s = DB.lan[L.maLan]; return s && s.dangDanh === uid ? s : null;
  }
  function chay(uid, hp, t) {   /* trận đánh tới mốc chạy: boss sang vùng khác, giữ máu */
    t = T(t); var s = cuaToi(uid, t); if (!s) return loi('Không phải trận của bạn');
    var L = lich(t);
    s.hp = Math.max(0, Math.min(1, +hp || 0)); s.soChay++;
    var vs = dsVung().filter(function (z) { return z !== s.vung; });
    if (vs.length) s.vung = vs[Math.floor(hat(L.maLan + '|chay' + s.soChay) * vs.length)];
    s.dangDanh = null; save();
    return { ok: true, vung: s.vung, hp: s.hp };
  }
  function huy(u, t) {   /* nhả boss KHÔNG phạt (lỗi dựng trận, không vào được trận): không khóa, giữ nguyên máu */
    t = T(t); var s = cuaToi(u, t); if (!s) return loi('Không phải trận của bạn');
    s.dangDanh = null; save(); return { ok: true };
  }
  function ketThuc(uid, kq, t) {   /* kq = {kq:'thang'|'thua', hp} */
    t = T(t); var s = cuaToi(uid, t); if (!s) return loi('Không phải trận của bạn');
    kq = kq || {};
    if (kq.kq === 'thang') { s.hp = 0; s.chet = true; }
    else { if (kq.hp != null) s.hp = Math.max(0.0001, Math.min(1, +kq.hp)); DB.khoa[uid] = t + CFG.khoaGiay * 1000; }
    s.dangDanh = null; save();
    return { ok: true, chet: s.chet, hp: s.hp, khoa: s.chet ? 0 : CFG.khoaGiay };
  }
  root.TTGBTG = { CFG: CFG, lich: lich, trangThai: trangThai, vaoDanh: vaoDanh, chay: chay, ketThuc: ketThuc, khoaCon: khoaCon, mocKe: mocKe, uid: uid, huy: huy,
    datDongHo: function (fn) { nowFn = typeof fn === 'function' ? fn : function () { return Date.now(); }; },
    xoa: function () { DB = { lan: {}, khoa: {} }; save(); } };
})(typeof window !== 'undefined' ? window : globalThis);
