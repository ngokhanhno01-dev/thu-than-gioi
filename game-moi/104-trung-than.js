/* ===== 104-trung-than.js (TTGTRUNG): TRỨNG BOSS THẦN (27/11/2026) =====
   Boss Thần không bắt bằng châu; giết thì có tỉ lệ rơi TRỨNG. Trứng nằm trong Túi Trữ Vật (Balo), bấm "Mở" thì nở ngay:
   thú non cấp 1, tiến hóa 1 (V1), đúng loài/hệ của boss (phẩm chất Thần theo độ hiếm loài), Rank (E..SR) tung ngẫu nhiên bằng TTGCS.tungBac.
   Thú nở từ trứng KHÔNG có cờ boss nên không bị nhân hsBossLoai.
   API: TTGTRUNG.CFG, .idTrung(loaiBoss), .roi(loaiBoss[,rng]) (tung tỉ lệ rơi, trúng thì +1 trứng vào Balo, trả id trứng hoặc null), .mo(idTrung) (nở trứng, trả uid thú hoặc null), .lay(n) (TEST).
   CHƯA nối vào trận: boss Thần chưa đánh được (chưa lên map). Khi nối: gọi TTGTRUNG.roi('th1') ngay lúc boss chết.
   NÚT TEST ẨN: menu ẩn (chạm chữ "Danh Vọng") -> "Lấy trứng Đế Giang". Xóa khối cuối file khi ra bản thật. */
(function (root) {
  'use strict';
  var B = root.TTGBALO;
  if (!B) return;
  var CFG = {
    tiLeRoi: { th1: 0.005 },   /* 0,5% khi giết Đế Giang (người dùng chốt 27/11/2026) */
    soTest: 3                  /* nút test: số trứng mỗi lần bấm */
  };
  var TRUNG = {   /* id vật phẩm -> loài boss */
    'trung-de-giang': { loai: 'th1', ten: 'Trứng Đế Giang', img: 'game-moi/icon-item/trung-de-giang.png',
      mo: 'Trứng của Đế Giang, Thú Thần hệ Không Gian. Bấm Mở: nở ngay thành Đế Giang cấp 1 (tiến hóa 1), Rank ngẫu nhiên từ E đến SR.' }
  };
  var items = {};
  Object.keys(TRUNG).forEach(function (id) { items[id] = { loai: 'nl', ten: TRUNG[id].ten, img: TRUNG[id].img, mo: TRUNG[id].mo }; });
  B.reg(items);

  function idTrung(loai) { for (var id in TRUNG) if (TRUNG[id].loai === loai) return id; return null; }
  function toast(t) { try { var b = root.TTGBAO || root.TTGTBAO; if (b && b.toast) b.toast(t, 2600); } catch (e) {} }
  function tenLoai(loai) { var o = root.THU_MOI && THU_MOI.byId && THU_MOI.byId[loai]; return (o && o.ten) || loai; }

  function roi(loai, rng) {
    var id = idTrung(loai), p = CFG.tiLeRoi[loai];
    if (!id || !p) return null;
    if (((rng || Math.random)()) < p) { B.add(id, 1); return id; }
    return null;
  }

  function mo(id) {
    var T = TRUNG[id];
    if (!T || B.count(id) <= 0) return null;
    if (!root.TTGTHU || !TTGTHU.add) { toast('Chưa mở được trứng'); return null; }
    var bac = (root.TTGCS && TTGCS.tungBac) ? TTGCS.tungBac() : 'E';
    B.add(id, -1);
    var uid = TTGTHU.add({ id: T.loai, ten: tenLoai(T.loai), bac: bac, tien: 1, lv: 1, chiso: {}, kn: [null, null, null, null, null, null] });
    toast('Trứng nở! Nhận ' + tenLoai(T.loai) + ' (Rank ' + bac + ')');
    return uid;
  }

  function lay(n) { n = n || CFG.soTest; Object.keys(TRUNG).forEach(function (id) { B.add(id, n); }); toast('TEST: +' + n + ' ' + 'Trứng Đế Giang'); }

  /* nút "Mở" trong Balo: dùng chung nút của 86-hop-ruong.js (nạp động, có thể đến sau file này) */
  var tries = 0;
  (function dk() {
    if (root.TTGHOP && TTGHOP.dangKy) { Object.keys(TRUNG).forEach(function (id) { TTGHOP.dangKy(id, function () { mo(id); }); }); return; }
    if (tries++ < 200) setTimeout(dk, 100);
  })();

  /* NÚT TEST ẨN */
  if (root.TTGNV && root.TTGNV.add) root.TTGNV.add({ id: 'lay-trung-dg', dev: true, ten: 'Lấy trứng Đế Giang', onTap: function () { lay(); } });

  root.TTGTRUNG = { CFG: CFG, TRUNG: TRUNG, idTrung: idTrung, roi: roi, mo: mo, lay: lay };
})(typeof window !== 'undefined' ? window : globalThis);
