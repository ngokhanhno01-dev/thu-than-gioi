// 51-thu-moi.js - Đăng ký thú mới (chỉ khai báo + hàm vẽ, không tự chạy, không móc vào chức năng nào)
// Ảnh nạp LƯỜI: chỉ nạp khi vẽ lần đầu. Tên là TÊN TẠM, đổi tên chỉ sửa ở file này.
(function () {
  var FRAME = 128; // cạnh khung chốt (px) - ảnh bậc 128x128, chân chạm đáy. Bản thử 256 có hậu tố -256 (xem setFrame)
  var DIR = 'thu-game/';
  var zones = [
    { z: 0, slug: 'tuyet-nguyen', ten: 'Tuyết Nguyên', thu: [
      { id: '1a', slug: '01-tuyet-cau', ten: 'Tuyết Cầu', boss: false },
      { id: '1b', slug: '02-tuyet-hung', ten: 'Tuyết Hùng', boss: false },
      { id: '1c', slug: '03-bang-loc', ten: 'Băng Lộc', boss: false }
    ] }
  ];
  var byId = {}, cache = {};
  zones.forEach(function (zn) {
    zn.thu.forEach(function (t) {
      t.z = zn.z; t.zone = zn.slug; t.frame = FRAME;
      byId[t.id] = t;
    });
  });
  function getImg(id, bac) {
    var t = byId[id]; if (!t) return null;
    var k = id + '-' + bac + '-' + FRAME, e = cache[k];
    if (!e) {
      e = cache[k] = new Image();
      e.onload = function () { if (THU_MOI.onload) THU_MOI.onload(id, bac); };
      e.src = DIR + t.zone + '/' + t.slug + '-b' + bac + (FRAME === 256 ? '-256' : '') + '.png';
    }
    return e.complete && e.naturalWidth ? e : null;
  }
  // Quy ước như drawStage: chân tại (cx, by), size = cạnh khung hiển thị. Trả true nếu đã vẽ.
  function draw(ctx, id, bac, cx, by, size) {
    var im = getImg(id, bac); if (!im) return false;
    size = size || FRAME; // khung 256 vẽ ở size 256 là 1:1
    var old = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(im, Math.round(cx - size / 2), Math.round(by - size), size, size);
    ctx.imageSmoothingEnabled = old;
    return true;
  }
  function setFrame(n) { FRAME = n === 256 ? 256 : 128; THU_MOI.FRAME = FRAME; } // chỉ để xem thử
  window.THU_MOI = { FRAME: FRAME, setFrame: setFrame, zones: zones, byId: byId, draw: draw, onload: null };
})();
