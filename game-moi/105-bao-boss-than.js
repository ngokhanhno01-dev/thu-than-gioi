/* ===== 105-bao-boss-than.js (TTGBAOBTG): THÔNG BÁO CHẠY NGANG + NÚT TEST BOSS THẦN (27/11/2026) =====
   1) Dòng chữ chạy ngang trên cùng màn hình (như thông báo toàn server): boss Thần XUẤT HIỆN (kèm vùng), BỎ CHẠY sang vùng khác (kèm máu còn lại), BỊ HẠ.
      Đọc TTGBTG.trangThai() mỗi CFG.pollMs; so với lần trước để biết sự kiện. Vừa vào game mà boss đang có mặt thì báo 1 lần. Sau này nối server: thay nguồn trangThai, giữ nguyên phần hiển thị.
      GỌN + MÀU (27/11/2026): mỗi loại sự kiện có icon + màu viền riêng (xuất hiện = vàng, bỏ chạy = cam, bị hạ = xanh lá, rơi đồ = hồng 7 màu). Tên boss Thần tô 7 MÀU, vùng = lam nhạt, người chơi = vàng, máu còn lại đổi xanh/cam/đỏ theo %.
      show(html, tone) nhận HTML (tone: 'xh' | 'chay' | 'ha' | 'roi'). Module khác (104 trứng rơi) gọi TTGBAOBTG.show để báo lên dòng chạy.
   2) Nút TEST ẨN (menu ẩn: chạm chữ "Danh Vọng"): đặt 1 boss Thần giả ở VÙNG ĐANG CHỌN, không dính lịch/lần/khóa thật (TTGBTG.datTest). "Tắt test" trả về lịch thật.
   Xóa khối nút test ở cuối file khi ra bản thật. */
(function (root) {
  'use strict';
  var D = root.document;
  if (!D || !root.TTGBTG) return;
  /* nạp động module thông báo rơi đồ (106) nếu chưa có (để tô 7 màu tên boss) */
  (function () { try { if (root.TTGDROP || root.__tdrLoad) return; root.__tdrLoad = 1; var cs = D.currentScript, s = D.createElement('script'); s.src = (cs && cs.src ? cs.src.replace(/[^\/?#]*([?#].*)?$/, '') : 'game-moi/') + '106-thong-bao-roi.js?v=4'; D.head.appendChild(s); } catch (e) {} })();
  var CFG = { pollMs: 1000, toc: 130, cao: 64 };   /* toc = px/giây */
  var TONE = {   /* [màu viền, nền trái, nền phải] */
    xh:   ['#ffd76a', 'rgba(40,16,70,.92)', 'rgba(120,44,20,.92)'],
    chay: ['#ff9a3d', 'rgba(60,30,10,.92)', 'rgba(130,56,10,.92)'],
    ha:   ['#7dff8a', 'rgba(10,50,30,.92)', 'rgba(20,100,56,.92)'],
    roi:  ['#ff7be8', 'rgba(40,10,74,.94)', 'rgba(10,54,100,.94)']
  };
  var bar = null, txt = null, queue = [], busy = false, last = null, timer = 0;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function boss(t) { return root.TTGDROP ? TTGDROP.tenHtml(t, 'than') : '<b style="color:#ffe066">' + esc(t) + '</b>'; }   /* tên boss Thần: 7 màu */
  function vung(t) { return '<b style="color:#7fe9ff">' + esc(t) + '</b>'; }
  function nguoi(t) { return '<b style="color:#ffe066">' + esc(t) + '</b>'; }
  function mau(hp) { var p = Math.round(hp * 100), c = p > 50 ? '#7dff8a' : p > 20 ? '#ffb347' : '#ff5a6e'; return '<b style="color:' + c + '">' + p + '%</b>'; }
  function ic(l) { var p = ''; try { p = root.TTGTHU && TTGTHU.anh ? TTGTHU.anh({ id: l, tien: 3 }) : ''; } catch (e) {} return p ? '<span class="ic"><img src="' + p + '" data-crop="1" alt=""></span>' : ''; }   /* icon = ảnh thật của boss */

  function ensure() {
    if (bar) return;
    var st = D.createElement('style');
    st.textContent = '#ttgbtg-bar{position:fixed;left:0;right:0;top:0;height:' + CFG.cao + 'px;overflow:hidden;background:linear-gradient(90deg,rgba(40,16,70,.92),rgba(120,44,20,.92));border-bottom:2px solid #ffd76a;box-shadow:0 2px 10px rgba(0,0,0,.5);z-index:2147483000;pointer-events:none;display:none}' +
      '#ttgbtg-txt{position:absolute;left:0;top:0;line-height:' + CFG.cao + 'px;white-space:nowrap;font:700 19px "Noto Serif",sans-serif;color:#fff3c4;text-shadow:0 1px 2px #000;will-change:transform}' +
      '#ttgbtg-txt .ic{display:inline-block;margin-right:6px;font-size:18px;vertical-align:-2px}' +
      '#ttgbtg-txt .ic img{width:60px;height:60px;object-fit:contain;vertical-align:middle;margin-top:-4px;filter:drop-shadow(0 1px 2px #000)}' +
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
    var it = queue.shift(), t = TONE[it.tone] || TONE.xh;
    bar.style.background = 'linear-gradient(90deg,' + t[1] + ',' + t[2] + ')'; bar.style.borderBottomColor = t[0];
    txt.innerHTML = it.html; bar.style.display = 'block';
    try { var ims = txt.querySelectorAll('img[data-crop]'), k; for (k = 0; k < ims.length; k++) (function (im) { if (root.TTGDROP && TTGDROP.cropAnh) TTGDROP.cropAnh(im.getAttribute('src'), function (u) { im.src = u; }); })(ims[k]); } catch (e) {}
    var dur = ((root.innerWidth || 800) + txt.offsetWidth) / CFG.toc;
    txt.style.animation = 'none'; void txt.offsetWidth;
    txt.style.animation = 'ttgbtg-run ' + dur.toFixed(2) + 's linear forwards';
    clearTimeout(timer);
    timer = setTimeout(function () { bar.style.display = 'none'; busy = false; pump(); }, dur * 1000 + 250);
  }
  function show(html, tone) { queue.push({ html: html, tone: tone || 'xh' }); if (queue.length > 4) queue.shift(); pump(); }

  function zoneTen(z) { try { var Z = root.THU_MOI.zones, i; for (i = 0; i < Z.length; i++) if (Z[i].z === z) return Z[i].ten; } catch (e) {} return 'một vùng bí ẩn'; }
  function bossTen(l) { var o = root.THU_MOI && THU_MOI.byId && THU_MOI.byId[l]; return (o && o.ten) || l; }

  function tick() {
    var s, key, pre;
    try { s = TTGBTG.trangThai(); } catch (e) { return; }
    if (!s) return;
    key = s.coMat ? s.maLan : null;
    pre = s.test ? '<span style="color:#9aa3d6">[TEST]</span> ' : '';
    if (key && !s.chet) {
      if (!last || last.key !== key) show(pre + ic(s.loai) + 'Boss Thần ' + boss(bossTen(s.loai)) + ' đã xuất hiện tại ' + vung(zoneTen(s.vung)) + '! <b style="color:#ffe066">Mau đến khiêu chiến!</b>', 'xh');
      else if ((s.soChay || 0) > last.soChay) show(pre + ic(s.loai) + 'Boss Thần ' + boss(bossTen(s.loai)) + ' bị ' + nguoi(s.nguoiChay || 'một người chơi') + ' đánh bị thương, bỏ chạy sang ' + vung(zoneTen(s.vung)) + '! Còn ' + mau(s.hp) + ' máu.', 'chay');
    } else if (key && s.chet && last && !last.chet) {
      show(pre + ic(s.loai) + 'Boss Thần ' + boss(bossTen(s.loai)) + ' đã bị hạ bởi ' + nguoi(s.nguoiGiet || 'một người chơi') + '!', 'ha');
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
