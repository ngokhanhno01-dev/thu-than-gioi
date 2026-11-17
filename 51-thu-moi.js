// 51-thu-moi.js - Đăng ký thú mới (chỉ khai báo + hàm vẽ, không tự chạy, không móc vào chức năng nào)
// Ảnh nạp LƯỜI: chỉ nạp khi vẽ lần đầu. Tên là TÊN TẠM, đổi tên chỉ sửa ở file này.
(function () {
  var FRAME = 128; // cạnh khung chốt (px) - mọi ảnh bậc đều là 128x128, chân chạm đáy
  var DIR = 'thu-game/';
  var zones = [
    { z: 0, slug: 'tuyet-nguyen', ten: 'Tuyết Nguyên', thu: [
      { id: '1a', slug: '01-tuyet-cau', ten: 'Tuyết Cầu', boss: false }
    ] }
  ];
  var byId = {}, cache = {};
  zones.forEach(function (zn) {
    zn.thu.forEach(function (t) {
      t.z = zn.z; t.zone = zn.slug; t.frame = FRAME;
      t.files = [1, 2, 3].map(function (b) { return DIR + zn.slug + '/' + t.slug + '-b' + b + '.png'; });
      byId[t.id] = t;
    });
  });
  function getImg(id, bac) {
    var t = byId[id]; if (!t) return null;
    var k = id + '-' + bac, e = cache[k];
    if (!e) {
      e = cache[k] = new Image();
      e.onload = function () { if (THU_MOI.onload) THU_MOI.onload(id, bac); };
      e.src = t.files[bac - 1];
    }
    return e.complete && e.naturalWidth ? e : null;
  }
  // Quy ước như drawStage: chân tại (cx, by), size = cạnh khung (128 = nguyên cỡ ảnh). Trả true nếu đã vẽ.
  function draw(ctx, id, bac, cx, by, size) {
    var im = getImg(id, bac); if (!im) return false;
    size = size || FRAME;
    var old = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(im, Math.round(cx - size / 2), Math.round(by - size), size, size);
    ctx.imageSmoothingEnabled = old;
    return true;
  }
  window.THU_MOI = { FRAME: FRAME, zones: zones, byId: byId, draw: draw, onload: null };
})();
