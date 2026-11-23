/* test-manh-theo-loai.js - kiểm tra logic Mảnh THEO LOÀI + tỉ lệ tiến hóa trong game-moi/75-tien-hoa-thu.js (Balo / TTGTHU giả, TTGCS thật từ 56b-loai.js).
   Chạy từ thư mục gốc repo:  node tools/test-manh-theo-loai.js
   Luật (23/11/2026): Mảnh KHÔNG rơi khi giết; mỗi lần THẢ 1 con thú = 1 Mảnh của chính loài đó (bất kể Rank/hệ). Tỉ lệ tiến hóa: V1->V2 100%, V2->V3 50%. */
'use strict';
var path = require('path'), assert = require('assert');
var ROOT = path.join(__dirname, '..');
var ok = 0;
function t(ten, fn) { try { fn(); ok++; console.log('  ok  ' + ten); } catch (e) { console.log('  LỖI ' + ten + '\n      ' + e.message); process.exitCode = 1; } }

/* chạy fn với Math.random trả giá trị cố định v (khôi phục sau khi chạy) */
function voiRandom(v, fn) { var g = Math.random; Math.random = function () { return v; }; try { return fn(); } finally { Math.random = g; } }

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

console.log('Test Mảnh theo loài (thả thú = 1 mảnh)');

t('không còn item th-z*-manh trong danh mục; có th-m-<id> cho 10 loài mỗi vùng 0-5 + 3 thú khởi đầu (k1,k2,k3)', function () {
  var e = nap();
  Object.keys(e.CAT).forEach(function (k) { assert(!/^th-z\d+-manh$/.test(k), 'còn ' + k); });
  var ids = [];
  [1, 2, 3, 6, 4, 5].forEach(function (v) { 'abcdefghij'.split('').forEach(function (c) { ids.push(v + c); }); });
  ids.push('k1', 'k2', 'k3');
  ids.forEach(function (id) {
    assert(e.CAT['th-m-' + id], 'thiếu th-m-' + id);
    assert.strictEqual(e.CAT['th-m-' + id].img, 'game-moi/icon-th/th-m-' + id + '.png');
    assert(/^Mảnh /.test(e.CAT['th-m-' + id].ten));
  });
  assert.strictEqual(Object.keys(e.CAT).filter(function (k) { return /^th-m-/.test(k); }).length, 63);
  assert.strictEqual(Object.keys(e.CAT).filter(function (k) { return /^th-z\d+-(loi|chau|an)$/.test(k); }).length, 27);
});

t('mô tả Mảnh nói rõ nhận bằng cách THẢ, không còn ghi "rơi khi thắng"', function () {
  var e = nap();
  Object.keys(e.CAT).filter(function (k) { return /^th-m-/.test(k); }).forEach(function (k) {
    assert(/THẢ/.test(e.CAT[k].mo), k + ' mô tả chưa nói về thả');
    assert(!/Rơi khi thắng/.test(e.CAT[k].mo), k + ' còn mô tả rơi khi thắng');
  });
});

t('dọn khóa th-z*-manh cũ còn trong Balo', function () {
  var e = nap({ 'th-z0-manh': 5, 'th-z3-manh': 2, 'th-z0-loi': 4 });
  assert(!('th-z0-manh' in e.inv) && !('th-z3-manh' in e.inv));
  assert.strictEqual(e.inv['th-z0-loi'], 4);   /* giữ nguyên Lõi */
});

/* ---------- GIẾT THÚ KHÔNG RƠI MẢNH ---------- */
t('giết thú hoang KHÔNG còn rơi Mảnh nào (kể cả khi vận may cao); vẫn có thể rơi Lõi/Châu', function () {
  var e = nap(), i, r, loi = 0;
  for (i = 0; i < 400; i++) {
    r = e.TH.roiDo({ source: 'demo', boss: false, id: '1f', vung: 0 }, 300);
    r.forEach(function (d) { assert(!/^th-m-/.test(d.id), 'không được rơi mảnh: ' + d.id); assert(d.id !== 'th-z0-an', 'thú thường không rơi Thần Ấn'); if (d.id === 'th-z0-loi') loi++; });
  }
  Object.keys(e.inv).forEach(function (k) { assert(!/^th-m-/.test(k), 'Balo có mảnh: ' + k); });
  assert(loi > 0, 'Lõi vẫn phải rơi được');
});

t('giết boss thú hoang cũng KHÔNG rơi Mảnh (vẫn có lúc rơi Thần Ấn vùng)', function () {
  var e = nap(), i, an = 0;
  for (i = 0; i < 400; i++) {
    var r = e.TH.roiDo({ source: 'demo', boss: true, id: '1j', vung: 0 }, 0);
    assert(!r.some(function (d) { return /^th-m-/.test(d.id); }), 'boss không được rơi mảnh');
    if (r.some(function (d) { return d.id === 'th-z0-an'; })) an++;
  }
  assert(an > 0, 'boss phải có lúc rơi Thần Ấn');
  Object.keys(e.inv).forEach(function (k) { assert(!/^th-m-/.test(k), 'Balo có mảnh: ' + k); });
});

t('quái (source main) không rơi gì', function () {
  var e = nap(); var r = e.TH.roiDo({ source: 'main', boss: false, id: '1f', vung: 0 }, 0);
  assert.deepStrictEqual(r, []); assert.deepStrictEqual(Object.keys(e.inv), []);
  r = e.TH.roiDo({ source: 'main', boss: true, id: '1j', vung: 0 }, 0); assert.deepStrictEqual(r, []);
});

/* ---------- THẢ THÚ = 1 MẢNH ---------- */
t('thả 1 con = đúng 1 Mảnh của chính loài đó (không cộng mảnh loài khác)', function () {
  var e = nap(); var r = e.TH.manhKhiTha({ uid: 'u1', id: '1f', tien: 1, bac: 'C' });
  assert.deepStrictEqual([r.id, r.q], ['th-m-1f', 1]);
  assert.strictEqual(r.ten, 'Mảnh ' + e.CAT['th-m-1f'].ten.replace(/^Mảnh /, ''));
  assert.deepStrictEqual(Object.keys(e.inv), ['th-m-1f']); assert.strictEqual(e.inv['th-m-1f'], 1);
});

t('thả nhiều con cộng dồn: 5 con cùng loài = 5 mảnh', function () {
  var e = nap(), i; for (i = 0; i < 5; i++) e.TH.manhKhiTha({ uid: 'u' + i, id: '2a', tien: 1 });
  assert.strictEqual(e.inv['th-m-2a'], 5); assert.deepStrictEqual(Object.keys(e.inv), ['th-m-2a']);
});

t('thả luôn 1 mảnh bất kể Rank (E..SR), bậc (V1-V3) hay vùng/hệ (0-8)', function () {
  var e = nap(), banks = ['E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SR', undefined], ids = ['1a', '2a', '3a', '6a', '4a', '5a', 'k1', 'k2', 'k3'], n = 0;
  ids.forEach(function (id, i) {
    var r = e.TH.manhKhiTha({ uid: 'u' + i, id: id, tien: 1 + (i % 3), bac: banks[i] });
    assert(r && r.q === 1 && r.id === 'th-m-' + id, id + ' phải nhận đúng 1 mảnh');
    assert.strictEqual(e.inv['th-m-' + id], 1); n++;
  });
  assert.strictEqual(Object.keys(e.inv).length, n);
});

t('thả mỗi loài trong 63 loài đều ra 1 Mảnh', function () {
  var e = nap(), ids = Object.keys(e.CAT).filter(function (k) { return /^th-m-/.test(k); }).map(function (k) { return k.slice(5); });
  assert.strictEqual(ids.length, 63);
  ids.forEach(function (id) { assert.strictEqual(e.TH.manhKhiTha({ id: id }).q, 1, id); });
  ids.forEach(function (id) { assert.strictEqual(e.inv['th-m-' + id], 1, id); });
});

t('loài chưa có item Mảnh / thú rỗng: manhKhiTha trả null, Balo không đổi', function () {
  var e = nap();
  assert.strictEqual(e.TH.manhKhiTha({ id: 'zz-khong-co' }), null);
  assert.strictEqual(e.TH.manhKhiTha(null), null); assert.strictEqual(e.TH.manhKhiTha({}), null);
  assert.deepStrictEqual(Object.keys(e.inv), []);
});

t('tenManh: có tên cho loài đã khai, rỗng cho loài lạ', function () {
  var e = nap();
  assert(/^Mảnh /.test(e.TH.tenManh('1f'))); assert.strictEqual(e.TH.tenManh('zz-khong-co'), '');
});

/* ---------- TỈ LỆ TIẾN HÓA ---------- */
console.log('Test tỉ lệ tiến hóa (V1->V2 100%, V2->V3 50%)');

t('CFG.tiLe: V2 = 100, V3 = 50; yeuCau báo đúng tl theo bậc đích', function () {
  var thu = { uid: 'u1', id: '1f', tien: 1 }, e = nap({}, thu);
  assert.strictEqual(e.TH.CFG.tiLe[2], 100); assert.strictEqual(e.TH.CFG.tiLe[3], 50);
  assert.strictEqual(e.TH.yeuCau(thu).tl, 100);
  thu.tien = 2; assert.strictEqual(e.TH.yeuCau(thu).tl, 50);
  assert.strictEqual(e.TH.tiLe(2), 100); assert.strictEqual(e.TH.tiLe(3), 50);
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

t('V1->V2 luôn thành công (100%) kể cả khi random xấu nhất; trừ đúng item', function () {
  [0, 0.5, 0.9999].forEach(function (v) {
    var thu = { uid: 'u1', id: '1f', tien: 1 };
    var e = nap({ 'th-m-1f': 8, 'th-m-1a': 3, 'th-z0-loi': 9, 'th-z0-chau': 5 }, thu);
    var r = voiRandom(v, function () { return e.TH.tienHoa('u1'); });
    assert(r.ok && r.from === 1 && r.to === 2 && r.tl === 100 && thu.tien === 2, 'random ' + v);
    assert.strictEqual(e.inv['th-m-1f'], 2); assert.strictEqual(e.inv['th-z0-loi'], 7); assert.strictEqual(e.inv['th-z0-chau'], 4);
    assert.strictEqual(e.inv['th-m-1a'], 3);
  });
});

t('V1->V2 trong 2000 lần thử không có lần nào thất bại (random thật)', function () {
  var i, fail = 0;
  for (i = 0; i < 2000; i++) {
    var thu = { uid: 'u1', id: '1f', tien: 1 }, e = nap({ 'th-m-1f': 6, 'th-z0-loi': 2, 'th-z0-chau': 1 }, thu);
    var r = e.TH.tienHoa('u1'); if (!r.ok || thu.tien !== 2) fail++;
  }
  assert.strictEqual(fail, 0);
});

t('V2->V3 theo ngưỡng 50%: random 0.49 thành công, 0.50 và 0.99 thất bại', function () {
  var cases = [[0, true], [0.49, true], [0.5, false], [0.99, false]];
  cases.forEach(function (c) {
    var thu = { uid: 'u1', id: '1f', tien: 2 };
    var e = nap({ 'th-z0-loi': 5, 'th-z0-chau': 3, 'th-z0-an': 1 }, thu);
    var r = voiRandom(c[0], function () { return e.TH.tienHoa('u1'); });
    if (c[1]) { assert(r.ok && r.to === 3 && r.tl === 50 && thu.tien === 3, 'random ' + c[0] + ' phải thành công'); assert.deepStrictEqual(Object.keys(e.inv), [], 'trừ hết nguyên liệu'); }
    else { assert(r.that && !r.ok && !r.err && r.from === 2 && r.to === 3 && r.tl === 50, 'random ' + c[0] + ' phải thất bại'); assert.strictEqual(thu.tien, 2, 'thú giữ nguyên V2'); }
  });
});

t('V2->V3 thất bại (mặc định) MẤT nguyên liệu, thú vẫn V2, không âm kho', function () {
  var thu = { uid: 'u1', id: '1f', tien: 2 };
  var e = nap({ 'th-z0-loi': 7, 'th-z0-chau': 4, 'th-z0-an': 2, 'th-m-1f': 3 }, thu);
  assert.strictEqual(e.TH.CFG.matKhiThat, true);
  var r = voiRandom(0.99, function () { return e.TH.tienHoa('u1'); });
  assert(r.that && r.mat === true && thu.tien === 2);
  assert.strictEqual(e.inv['th-z0-loi'], 2); assert.strictEqual(e.inv['th-z0-chau'], 1); assert.strictEqual(e.inv['th-z0-an'], 1);
  assert.strictEqual(e.inv['th-m-1f'], 3, 'mảnh không bị đụng ở lần 2');
});

t('CFG.matKhiThat=false: thất bại GIỮ nguyên liệu', function () {
  var thu = { uid: 'u1', id: '1f', tien: 2 };
  var e = nap({ 'th-z0-loi': 5, 'th-z0-chau': 3, 'th-z0-an': 1 }, thu);
  e.TH.CFG.matKhiThat = false;
  var r = voiRandom(0.99, function () { return e.TH.tienHoa('u1'); });
  assert(r.that && r.mat === false && thu.tien === 2);
  assert.strictEqual(e.inv['th-z0-loi'], 5); assert.strictEqual(e.inv['th-z0-chau'], 3); assert.strictEqual(e.inv['th-z0-an'], 1);
});

t('V2->V3 trong 20000 lần thử, tỉ lệ thành công xấp xỉ 50%', function () {
  var i, win = 0, N = 20000;
  for (i = 0; i < N; i++) {
    var thu = { uid: 'u1', id: '1f', tien: 2 }, e = nap({ 'th-z0-loi': 5, 'th-z0-chau': 3, 'th-z0-an': 1 }, thu);
    if (e.TH.tienHoa('u1').ok) win++;
  }
  var p = win / N; assert(p > 0.48 && p < 0.52, 'tỉ lệ ' + p);
});

t('thiếu nguyên liệu vẫn báo lỗi (không tung tỉ lệ, không trừ gì); V3 không tiến hóa nữa', function () {
  var thu = { uid: 'u1', id: '1f', tien: 2 }, e = nap({ 'th-z0-loi': 5, 'th-z0-chau': 3 }, thu);   /* thiếu Thần Ấn */
  var r = voiRandom(0, function () { return e.TH.tienHoa('u1'); });
  assert(r.err && !r.ok && !r.that && thu.tien === 2); assert.strictEqual(e.inv['th-z0-loi'], 5);
  thu.tien = 3; r = voiRandom(0, function () { return e.TH.tienHoa('u1'); }); assert(r.err && thu.tien === 3);
});

t('đi hết đường V1 -> V2 -> V3: lần 2 không dùng Mảnh, không vượt 3', function () {
  var thu = { uid: 'u1', id: '1f', tien: 1 };
  var e = nap({ 'th-m-1f': 8, 'th-m-1a': 3, 'th-z0-loi': 9, 'th-z0-chau': 5, 'th-z0-an': 1 }, thu);
  var r = voiRandom(0, function () { return e.TH.tienHoa('u1'); }); assert(r.ok && r.from === 1 && r.to === 2 && thu.tien === 2);
  var y = e.TH.yeuCau(thu); assert(y.items.every(function (x) { return !/^th-m-/.test(x.id); }), 'lần 2 không dùng Mảnh');
  r = voiRandom(0, function () { return e.TH.tienHoa('u1'); }); assert(r.ok && thu.tien === 3);
  assert.strictEqual(e.inv['th-m-1f'], 2, 'lần 2 không trừ mảnh'); assert.strictEqual(e.inv['th-z0-loi'], 2); assert.strictEqual(e.inv['th-z0-chau'], 1); assert(!('th-z0-an' in e.inv));
  r = voiRandom(0, function () { return e.TH.tienHoa('u1'); }); assert(r.err && thu.tien === 3, 'không vượt V3');
});

t('nút test cap(1): đủ Mảnh loài đang ra trận + Lõi/Châu/Thần Ấn vùng gốc (đủ cho cả 2 lần tiến hóa khi may mắn)', function () {
  var thu = { uid: 'u1', id: '1h', tien: 1 };
  var e = nap({}, thu); var r = e.TH.cap(1);
  assert(!r.err && r.manh && r.z === 0);
  assert.strictEqual(e.inv['th-m-1h'], 6); assert.strictEqual(e.inv['th-z0-loi'], 7); assert.strictEqual(e.inv['th-z0-chau'], 4); assert.strictEqual(e.inv['th-z0-an'], 1);
  voiRandom(0, function () { assert(e.TH.tienHoa('u1').ok); assert(e.TH.tienHoa('u1').ok); }); assert.strictEqual(thu.tien, 3);
  e = nap({}, null); assert(e.TH.cap(1).err, 'không có thú ra trận phải báo');
});

console.log(ok + ' test đạt' + (process.exitCode ? ', CÓ LỖI' : ''));
