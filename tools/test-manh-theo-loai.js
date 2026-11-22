/* test-manh-theo-loai.js - kiểm tra logic Mảnh THEO LOÀI trong game-moi/75-tien-hoa-thu.js (Balo / TTGTHU giả, TTGCS thật từ 56b-loai.js).
   Chạy từ thư mục gốc repo:  node tools/test-manh-theo-loai.js
   (Phần trọng số gặp theo độ hiếm thuộc mục 2, sẽ thêm test khi làm mục 2.) */
'use strict';
var path = require('path'), assert = require('assert');
var ROOT = path.join(__dirname, '..');
var ok = 0;
function t(ten, fn) { try { fn(); ok++; console.log('  ok  ' + ten); } catch (e) { console.log('  LỖI ' + ten + '\n      ' + e.message); process.exitCode = 1; } }

/* nạp lại 75 với môi trường giả mới; inv0 = túi đồ ban đầu */
function nap(inv0, thuRaTran) {
  ['TTGBALO', 'TTGTHU', 'TTGCS', 'TTGNV', 'TTGKH', 'TTGTBAO', 'THU_MOI'].forEach(function (k) { delete globalThis[k]; });
  delete require.cache[require.resolve(path.join(ROOT, 'game-moi/56b-loai.js'))];
  delete require.cache[require.resolve(path.join(ROOT, 'game-moi/75-tien-hoa-thu.js'))];
  var inv = Object.assign({}, inv0 || {}), CAT = {};
  globalThis.TTGBALO = {
    CAT: CAT,
    reg: function (o) { for (var k in o) CAT[k] = o[k]; },
    count: function (i) { return inv[i] | 0; },
    add: function (i, n) { var c = (inv[i] | 0) + n; if (c <= 0) delete inv[i]; else inv[i] = c; return Math.max(0, c); },
    inv: inv
  };
  var thu = thuRaTran || null;
  globalThis.TTGTHU = {
    getRaTran: function () { return thu; },
    list: function () { return thu ? [thu] : []; },
    setTien: function (uid, n) { if (thu && thu.uid === uid) thu.tien = n; }
  };
  require(path.join(ROOT, 'game-moi/56b-loai.js'));   /* TTGCS thật: loai, dsLoai */
  require(path.join(ROOT, 'game-moi/75-tien-hoa-thu.js'));
  return { inv: inv, CAT: CAT, TH: globalThis.TTGTH };
}

console.log('Test Mảnh theo loài');

t('không còn item th-z*-manh trong danh mục; có th-m-<id> cho 10 loài vùng 0 và 10 loài vùng 1, chưa có vùng khác', function () {
  var e = nap();
  Object.keys(e.CAT).forEach(function (k) { assert(!/^th-z\d+-manh$/.test(k), 'còn ' + k); });
  ['1a', '1b', '1c', '1d', '1e', '1f', '1g', '1h', '1i', '1j', '2a', '2b', '2c', '2d', '2e', '2f', '2g', '2h', '2i', '2j'].forEach(function (id) {
    assert(e.CAT['th-m-' + id], 'thiếu th-m-' + id);
    assert.strictEqual(e.CAT['th-m-' + id].img, 'game-moi/icon-th/th-m-' + id + '.png');
    assert(/^Mảnh /.test(e.CAT['th-m-' + id].ten));
  });
  assert.strictEqual(Object.keys(e.CAT).filter(function (k) { return /^th-m-/.test(k); }).length, 20);
  assert.strictEqual(Object.keys(e.CAT).filter(function (k) { return /^th-z\d+-(loi|chau|an)$/.test(k); }).length, 27);
});

t('dọn khóa th-z*-manh cũ còn trong Balo', function () {
  var e = nap({ 'th-z0-manh': 5, 'th-z3-manh': 2, 'th-z0-loi': 4 });
  assert(!('th-z0-manh' in e.inv) && !('th-z3-manh' in e.inv));
  assert.strictEqual(e.inv['th-z0-loi'], 4);   /* giữ nguyên Lõi */
});

t('thú hoang rơi Mảnh CỦA CHÍNH LOÀI (100%, 2-4 mảnh), không rơi mảnh loài khác', function () {
  var e = nap(), i, r, min = 99, max = 0;
  for (i = 0; i < 300; i++) {
    r = e.TH.roiDo({ source: 'demo', boss: false, id: '1f', vung: 0 }, 0);
    var m = r.filter(function (d) { return d.id === 'th-m-1f'; });
    assert.strictEqual(m.length, 1, 'phải luôn rơi mảnh');
    min = Math.min(min, m[0].q); max = Math.max(max, m[0].q);
    r.forEach(function (d) { assert(!/^th-m-/.test(d.id) || d.id === 'th-m-1f'); assert(d.id !== 'th-z0-an', 'thú thường không rơi Thần Ấn'); });
  }
  assert(min >= 2 && max <= 4 && min === 2 && max === 4, 'khoảng ' + min + '-' + max);
  Object.keys(e.inv).forEach(function (k) { assert(!/^th-m-/.test(k) || k === 'th-m-1f'); });
});

t('boss thú hoang rơi Mảnh của chính nó (+ có thể Thần Ấn vùng)', function () {
  var e = nap(), i, an = 0;
  for (i = 0; i < 400; i++) {
    var r = e.TH.roiDo({ source: 'demo', boss: true, id: '1j', vung: 0 }, 0);
    assert(r.some(function (d) { return d.id === 'th-m-1j'; }), 'boss phải rơi mảnh của nó');
    if (r.some(function (d) { return d.id === 'th-z0-an'; })) an++;
  }
  assert(an > 0, 'boss phải có lúc rơi Thần Ấn');
});

t('quái (source main) không rơi gì', function () {
  var e = nap(); var r = e.TH.roiDo({ source: 'main', boss: false, id: '1f', vung: 0 }, 0);
  assert.deepStrictEqual(r, []); assert.deepStrictEqual(Object.keys(e.inv), []);
  r = e.TH.roiDo({ source: 'main', boss: true, id: '1j', vung: 0 }, 0); assert.deepStrictEqual(r, []);
});

t('thú hoang vùng 1 rơi Mảnh đúng loài (2a)', function () {
  var e = nap(); var r = e.TH.roiDo({ source: 'demo', boss: false, id: '2a', vung: 1 }, 0);
  assert(r.some(function (d) { return d.id === 'th-m-2a'; }));
});

t('thú hoang vùng chưa mở Mảnh (vd 3a) không rơi Mảnh (chưa có item)', function () {
  var e = nap(); var r = e.TH.roiDo({ source: 'demo', boss: false, id: '3a', vung: 2 }, 0);
  assert(!r.some(function (d) { return /^th-m-/.test(d.id); }));
});

t('công thức lần 1 dùng Mảnh ĐÚNG LOÀI x6 + Lõi x2 + Châu x1 (vùng gốc)', function () {
  var thu = { uid: 'u1', id: '1f', tien: 1 };
  var e = nap({ 'th-m-1a': 6, 'th-z0-loi': 2, 'th-z0-chau': 1 }, thu);   /* có mảnh loài KHÁC, thiếu mảnh 1f */
  var y = e.TH.yeuCau(thu);
  assert.strictEqual(y.items[0].id, 'th-m-1f'); assert.strictEqual(y.items[0].n, 6);
  assert.strictEqual(y.items[1].id, 'th-z0-loi'); assert.strictEqual(y.items[1].n, 2);
  assert.strictEqual(y.items[2].id, 'th-z0-chau'); assert.strictEqual(y.items[2].n, 1);
  assert.strictEqual(y.ok, false);
  var r = e.TH.tienHoa('u1'); assert(r.err, 'phải báo thiếu'); assert.strictEqual(thu.tien, 1);
  assert.strictEqual(e.inv['th-m-1a'], 6, 'không được trừ gì khi thiếu');
});

t('tiến hóa 1 trừ đúng item, lên V2; lần 2 không dùng Mảnh; không vượt 3', function () {
  var thu = { uid: 'u1', id: '1f', tien: 1 };
  var e = nap({ 'th-m-1f': 8, 'th-m-1a': 3, 'th-z0-loi': 9, 'th-z0-chau': 5, 'th-z0-an': 1 }, thu);
  var r = e.TH.tienHoa('u1'); assert(r.ok && r.from === 1 && r.to === 2 && thu.tien === 2);
  assert.strictEqual(e.inv['th-m-1f'], 2); assert.strictEqual(e.inv['th-z0-loi'], 7); assert.strictEqual(e.inv['th-z0-chau'], 4);
  assert.strictEqual(e.inv['th-m-1a'], 3);
  var y = e.TH.yeuCau(thu); assert(y.items.every(function (x) { return !/^th-m-/.test(x.id); }), 'lần 2 không dùng Mảnh');
  r = e.TH.tienHoa('u1'); assert(r.ok && thu.tien === 3);
  assert.strictEqual(e.inv['th-m-1f'], 2, 'lần 2 không trừ mảnh'); assert.strictEqual(e.inv['th-z0-loi'], 2); assert.strictEqual(e.inv['th-z0-chau'], 1); assert(!('th-z0-an' in e.inv));
  r = e.TH.tienHoa('u1'); assert(r.err && thu.tien === 3, 'không vượt V3');
});

t('nút test cap(1): đủ Mảnh loài đang ra trận + Lõi/Châu/Thần Ấn vùng gốc', function () {
  var thu = { uid: 'u1', id: '1h', tien: 1 };
  var e = nap({}, thu); var r = e.TH.cap(1);
  assert(!r.err && r.manh && r.z === 0);
  assert.strictEqual(e.inv['th-m-1h'], 6); assert.strictEqual(e.inv['th-z0-loi'], 7); assert.strictEqual(e.inv['th-z0-chau'], 4); assert.strictEqual(e.inv['th-z0-an'], 1);
  assert(e.TH.tienHoa('u1').ok); assert(e.TH.tienHoa('u1').ok); assert.strictEqual(thu.tien, 3);
  e = nap({}, null); assert(e.TH.cap(1).err, 'không có thú ra trận phải báo');
});

console.log(ok + ' test đạt' + (process.exitCode ? ', CÓ LỖI' : ''));
