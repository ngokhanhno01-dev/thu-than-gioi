/* ===== 105-bao-boss-than.js (TTGBAOBTG): THÔNG BÁO CHẠY NGANG + NÚT TEST BOSS THẦN (27/11/2026) =====
   1) Dòng chữ chạy ngang trên cùng màn hình (như thông báo toàn server): boss Thần XUẤT HIỆN (kèm vùng), BỎ CHẠY sang vùng khác (kèm máu còn lại), BỊ HẠ.
      Đọc TTGBTG.trangThai() mỗi CFG.pollMs; so với lần trước để biết sự kiện. Vừa vào game mà boss đang có mặt thì báo 1 lần. Sau này nối server: thay nguồn trangThai, giữ nguyên phần hiển thị.
   2) Nút TEST ẨN (menu ẩn: chạm chữ "Danh Vọng"): đặt 1 boss Thần giả ở VÙNG ĐANG CHỌN, không dính lịch/lần/khóa thật (TTGBTG.datTest). "Tắt test" trả về lịch thật.
   Xóa khối nút test ở cuối file khi ra bản thật. */
(function (root) {
  'use strict';
  var D = root.document;
  if (!D || !root.TTGBTG) return;
  var CFG = { pollMs: 1000, toc: 130, cao: 30 };   /* toc = px/giây */
  var bar = null, txt = null, queue = [], busy = false, last = null, timer = 0;

  function ensure() {
    if (bar) return;
    var st = D.createElement('style');
    st.textContent = '#ttgbtg-bar{position:fixed;left:0;right:0;top:0;height:' + CFG.cao + 'px;overflow:hidden;background:linear-gradient(90deg,rgba(40,16,70,.85),rgba(90,40,20,.85));border-bottom:1px solid #ffd76a;z-index:2147483000;pointer-events:none;display:none}' +
      '#ttgbtg-txt{position:absolute;left:0;top:0;line-height:' + CFG.cao + 'px;white-space:nowrap;font:bold 14px sans-serif;color:#ffd76a;text-shadow:0 1px 2px #000;will-change:transform}' +
      '@keyframes ttgbtg-run{from{transform:translateX(100vw)}to{transform:translateX(-100%)}}';
    D.head.appendChild(st);
    bar = D.createElement('div'); bar.id = 'ttgbtg-bar';
    txt = D.createElement('div'); txt.id = 'ttgbtg-txt';
    bar.appendChild(txt); D.body.appendChild(bar);
  }
  function pump() {
    if (busy || !queue.length) return;
    if (!D.body) { setTimeout(pump, 300); return; }
    busy = true; ensure();
    txt.textContent = queue.shift(); bar.style.display = 'block';
    var dur = ((root.innerWidth || 800) + txt.offsetWidth) / CFG.toc;
    txt.style.animation = 'none'; void txt.offsetWidth;
    txt.style.animation = 'ttgbtg-run ' + dur.toFixed(2) + 's linear forwards';
    clearTimeout(timer);
    timer = setTimeout(function () { bar.style.display = 'none'; busy = false; pump(); }, dur * 1000 + 250);
  }
  function show(msg) { queue.push(msg); if (queue.length > 4) queue.shift(); pump(); }

  function zoneTen(z) { try { var Z = root.THU_MOI.zones, i; for (i = 0; i < Z.length; i++) if (Z[i].z === z) return Z[i].ten; } catch (e) {} return 'một vùng bí ẩn'; }
  function bossTen(l) { var o = root.THU_MOI && THU_MOI.byId && THU_MOI.byId[l]; return (o && o.ten) || l; }

  function tick() {
    var s, key, pre;
    try { s = TTGBTG.trangThai(); } catch (e) { return; }
    if (!s) return;
    key = s.coMat ? s.maLan : null;
    pre = s.test ? '[TEST] ' : '';
    if (key && !s.chet) {
      if (!last || last.key !== key) show(pre + '⚔ Boss Thần ' + bossTen(s.loai) + ' đã xuất hiện tại ' + zoneTen(s.vung) + '! Mau đến khiêu chiến!');
      else if ((s.soChay || 0) > last.soChay) show(pre + '⚔ Boss Thần ' + bossTen(s.loai) + ' bị ' + (s.nguoiChay || 'một người chơi') + ' đánh bị thương, bỏ chạy sang ' + zoneTen(s.vung) + '! Còn ' + Math.round(s.hp * 100) + '% máu.');
    } else if (key && s.chet && last && !last.chet) {
      show(pre + '⚔ Boss Thần ' + bossTen(s.loai) + ' đã bị hạ bởi ' + (s.nguoiGiet || 'một người chơi') + '!');
    }
    last = key ? { key: key, soChay: s.soChay || 0, chet: !!s.chet } : null;
  }
  setInterval(tick, CFG.pollMs); setTimeout(tick, 1500);

  /* ---- NÚT TEST ẨN ---- */
  function toast(t) { try { var b = root.TTGBAO || root.TTGTBAO; if (b && b.toast) b.toast(t, 2600); } catch (e) {} }
  function batTest(loai) {
    var z = (root.TTGDV && TTGDV.vung) ? TTGDV.vung() : 0;
    TTGBTG.datTest(loai, z); tick();
    toast('TEST: ' + bossTen(loai) + ' ở ' + zoneTen(z) + ' (vùng đang chọn). Vào Thám hiểm để gặp');
  }
  if (root.TTGNV && root.TTGNV.add) {
    root.TTGNV.add({ id: 'test-btg-th1', dev: true, ten: 'Test boss Đế Giang', onTap: function () { batTest('th1'); } });
    root.TTGNV.add({ id: 'test-btg-th2', dev: true, ten: 'Test boss Chúc Long', onTap: function () { batTest('th2'); } });
    root.TTGNV.add({ id: 'test-btg-th3', dev: true, ten: 'Test boss Vô Cực', onTap: function () { batTest('th3'); } });
    root.TTGNV.add({ id: 'test-btg-off', dev: true, ten: 'Tắt test boss Thần', onTap: function () { TTGBTG.tatTest(); tick(); toast('Đã tắt test, về lịch thật'); } });
  }
  root.TTGBAOBTG = { CFG: CFG, show: show, tick: tick };
})(typeof window !== 'undefined' ? window : globalThis);
