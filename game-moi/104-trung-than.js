/* ===== 104-trung-than.js (TTGTRUNG): TRỨNG BOSS THẦN (27/11/2026) =====
   Boss Thần không bắt bằng châu; giết thì có tỉ lệ rơi TRỨNG. Trứng nằm trong Túi Trữ Vật (Balo), bấm "Mở" thì nở ngay:
   thú non cấp 1, tiến hóa 1 (V1), đúng loài/hệ của boss (phẩm chất Thần theo độ hiếm loài), Rank (E..SR) tung ngẫu nhiên bằng TTGCS.tungBac.
   Thú nở từ trứng KHÔNG có cờ boss nên không bị nhân hsBossLoai.
   API: TTGTRUNG.CFG, .idTrung(loaiBoss), .roi(loaiBoss[,rng]) (tung tỉ lệ rơi, trúng thì +1 trứng vào Balo, trả id trứng hoặc null), .mo(idTrung) (nở trứng, trả uid thú hoặc null), .lay(n) (TEST).
   ĐÃ NỐI vào trận (index.html, hàm xong: giết boss Thần -> TTGTRUNG.roi(enemy.id)); trứng vào Balo, thông báo rơi do baoRoi.
   THÔNG BÁO (27/11/2026): trứng rơi = thẻ 106-thong-bao-roi.js (TTGDROP), TÊN TRỨNG 7 MÀU + icon + nháy sáng; dòng chạy ngang báo toàn màn hình. Trứng nở = thẻ màu theo Rank (SR cũng 7 màu).
   NÚT TEST ẨN: menu ẩn (chạm chữ "Danh Vọng") -> "Lấy trứng Đế Giang". Xóa khối cuối file khi ra bản thật. */
(function (root) {
  'use strict';
  var B = root.TTGBALO;
  if (!B) return;
  /* nạp động module thông báo rơi đồ (106) nếu chưa có */
  (function () { try { var D = root.document; if (root.TTGDROP || root.__tdrLoad || !D) return; root.__tdrLoad = 1; var cs = D.currentScript, s = D.createElement('script'); s.src = (cs && cs.src ? cs.src.replace(/[^\/?#]*([?#].*)?$/, '') : 'game-moi/') + '106-thong-bao-roi.js?v=2'; D.head.appendChild(s); } catch (e) {} })();
  var CFG = {
    tiLeRoi: { th1: 0.005, th2: 0.005, th3: 0.005 },   /* 0,5% khi giết boss Thần, cả 3 con (người dùng chốt 27/11/2026). Sách kỹ năng boss Thần: 1,5% như boss thường (TY_LE_ROI_SACH, 56c-buff.js) */
    soTest: 3                  /* nút test: số trứng mỗi lần bấm */
  };
  var TRUNG = {   /* id vật phẩm -> loài boss */
    'trung-de-giang': { loai: 'th1', ten: 'Trứng Đế Giang', img: 'game-moi/icon-item/trung-de-giang.png',
      mo: 'Trứng của Đế Giang, Thú Đặc Biệt hệ Không Gian. Bấm Mở: nở ngay thành Đế Giang cấp 1 (tiến hóa 1), Rank ngẫu nhiên từ E đến SR.' },
    'trung-chuc-long': { loai: 'th2', ten: 'Trứng Chúc Long', img: 'game-moi/icon-item/trung-chuc-long.png',
      mo: 'Trứng của Chúc Long, Thú Đặc Biệt hệ Thời Gian. Bấm Mở: nở ngay thành Chúc Long cấp 1 (tiến hóa 1), Rank ngẫu nhiên từ E đến SR.' },
    'trung-vo-cuc': { loai: 'th3', ten: 'Trứng Vô Cực', img: 'game-moi/icon-item/trung-vo-cuc.png',
      mo: 'Trứng của Vô Cực, Thú Đặc Biệt hệ Vô Cực. Bấm Mở: nở ngay thành Vô Cực cấp 1 (tiến hóa 1), Rank ngẫu nhiên từ E đến SR.' }
  };
  var items = {};
  Object.keys(TRUNG).forEach(function (id) { items[id] = { loai: 'nl', ten: TRUNG[id].ten, img: TRUNG[id].img, mo: TRUNG[id].mo }; });
  B.reg(items);

  function idTrung(loai) { for (var id in TRUNG) if (TRUNG[id].loai === loai) return id; return null; }
  function toast(t) { try { var b = root.TTGBAO || root.TTGTBAO; if (b && b.toast) b.toast(t, 2600); } catch (e) {} }
  function tenLoai(loai) { var o = root.THU_MOI && THU_MOI.byId && THU_MOI.byId[loai]; return (o && o.ten) || loai; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function nm(ten, muc) { return root.TTGDROP ? TTGDROP.tenHtml(ten, muc) : '<b>' + esc(ten) + '</b>'; }

  /* THÔNG BÁO TRỨNG RƠI: thẻ 7 màu + dòng chạy ngang */
  function baoRoi(id) {
    var T = TRUNG[id]; if (!T) return;
    if (root.TTGDROP) TTGDROP.show({ tieude: 'Boss Thần rơi vật phẩm!', ten: T.ten, so: 1, muc: 'than', nhan: 'Đặc Biệt', nguon: 'Rơi từ boss ' + tenLoai(T.loai), icon: T.img, fb: '' });
    else toast('Nhận được ' + T.ten + '!');
    try { if (root.TTGBAOBTG && TTGBAOBTG.show) TTGBAOBTG.show('<span class="ic"><img src="' + T.img + '" alt=""></span> Bạn đã nhặt được ' + nm(T.ten, 'than') + ' từ boss Thần ' + nm(tenLoai(T.loai), 'than') + '! <b style="color:#ffe066">Cực hiếm!</b>', 'roi'); } catch (e) {}
  }

  function roi(loai, rng) {
    var id = idTrung(loai), p = CFG.tiLeRoi[loai];
    if (!id || !p) return null;
    if (((rng || Math.random)()) < p) { B.add(id, 1); baoRoi(id); return id; }
    return null;
  }

  function mo(id) {
    var T = TRUNG[id];
    if (!T || B.count(id) <= 0) return null;
    if (!root.TTGTHU || !TTGTHU.add) { toast('Chưa mở được trứng'); return null; }
    var bac = (root.TTGCS && TTGCS.tungBac) ? TTGCS.tungBac() : 'E';
    B.add(id, -1);
    var uid = TTGTHU.add({ id: T.loai, ten: tenLoai(T.loai), bac: bac, tien: 1, lv: 1, chiso: {}, kn: [null, null, null, null, null, null] });
    if (root.TTGDROP) TTGDROP.show({ no: T.loai, tieude: 'Trứng nở!', ten: tenLoai(T.loai), muc: bac, nhan: 'Rank ' + bac, nguon: 'Thú Đặc Biệt · cấp 1 · tiến hóa 1', icon: (TTGTHU.anh && TTGTHU.anh({ id: T.loai, tien: 1 })) || T.img, fb: '', ms: (bac === 'SR' ? 5200 : 3600) });
    else toast('Trứng nở! Nhận ' + tenLoai(T.loai) + ' (Rank ' + bac + ')');
    return uid;
  }

  function lay(n, loai) { n = n || CFG.soTest; var ten = []; Object.keys(TRUNG).forEach(function (id) { if (loai && TRUNG[id].loai !== loai) return; B.add(id, n); ten.push(TRUNG[id].ten); }); toast('TEST: +' + n + ' ' + ten.join(', ')); }

  /* nút "Mở" trong Balo: dùng chung nút của 86-hop-ruong.js (nạp động, có thể đến sau file này) */
  var tries = 0;
  (function dk() {
    if (root.TTGHOP && TTGHOP.dangKy) { Object.keys(TRUNG).forEach(function (id) { TTGHOP.dangKy(id, function () { mo(id); }); }); return; }
    if (tries++ < 200) setTimeout(dk, 100);
  })();

  /* NÚT TEST ẨN */
  if (root.TTGNV && root.TTGNV.add) {
    root.TTGNV.add({ id: 'lay-trung-dg', dev: true, ten: 'Lấy trứng Đế Giang', onTap: function () { lay(null, 'th1'); } });
    root.TTGNV.add({ id: 'lay-trung-cl', dev: true, ten: 'Lấy trứng Chúc Long', onTap: function () { lay(null, 'th2'); } });
    root.TTGNV.add({ id: 'lay-trung-vc', dev: true, ten: 'Lấy trứng Vô Cực', onTap: function () { lay(null, 'th3'); } });
    root.TTGNV.add({ id: 'test-bao-trung', dev: true, ten: 'Test thông báo rơi trứng', onTap: function () { baoRoi('trung-de-giang'); } });
  }

  root.TTGTRUNG = { CFG: CFG, TRUNG: TRUNG, idTrung: idTrung, roi: roi, mo: mo, lay: lay, bao: baoRoi };
})(typeof window !== 'undefined' ? window : globalThis);
