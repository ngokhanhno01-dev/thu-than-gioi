// 51-thu-moi.js - Đăng ký thú mới (chỉ khai báo + hàm vẽ, không tự chạy, không móc vào chức năng nào)
// Ảnh nạp LƯỜI: chỉ nạp khi vẽ lần đầu. Tên là TÊN TẠM, đổi tên chỉ sửa ở file này.
(function () {
  var FRAME = 128; // cạnh khung chốt (px) - ảnh bậc 128x128, chân chạm đáy. Bản thử 256 có hậu tố -256 (xem setFrame)
  var DIR = 'thu-game/';
  var zones = [
    { z: 0, slug: 'tuyet-nguyen', ten: 'Tuyết Nguyên', thu: [
      { id: '1a', slug: '01-tuyet-cau', ten: 'Tuyết Cầu', boss: false },
      { id: '1b', slug: '02-tuyet-hung', ten: 'Tuyết Hùng', boss: false },
      { id: '1c', slug: '03-bang-loc', ten: 'Băng Lộc', boss: false },
      { id: '1d', slug: '04-tuyet-bao', ten: 'Tuyết Báo', boss: false },
      { id: '1e', slug: '05-bang-hai', ten: 'Băng Hải', boss: false },
      { id: '1f', slug: '06-tuyet-cu', ten: 'Tuyết Cú', boss: false },
      { id: '1g', slug: '07-bang-duong', ten: 'Băng Dương', boss: false },
      { id: '1h', slug: '08-bang-linh', ten: 'Băng Linh', boss: false },
      { id: '1i', slug: '09-bang-nham', ten: 'Băng Nham', boss: false },
      { id: '1j', slug: '10-bang-son-cu-thu', ten: 'Băng Sơn Cự Thú', boss: true }
    ] },
    { z: 1, slug: 'suong-coc', ten: 'Sương Cốc', thu: [
      { id: '2a', slug: '01-suong-that', ten: 'Sương Thát', boss: false },
      { id: '2b', slug: '02-vu-duc', ten: 'Vụ Dực', boss: false },
      { id: '2c', slug: '03-suong-xuyen', ten: 'Sương Xuyên', boss: false },
      { id: '2d', slug: '04-suong-khai', ten: 'Sương Khải', boss: false },
      { id: '2e', slug: '05-suong-diep', ten: 'Sương Diệp', boss: false },
      { id: '2f', slug: '06-vu-tieu', ten: 'Vụ Tiêu', boss: false },
      { id: '2g', slug: '07-suong-vien', ten: 'Sương Viên', boss: false },
      { id: '2h', slug: '08-vu-tung', ten: 'Vụ Tùng', boss: false },
      { id: '2i', slug: '09-suong-nha', ten: 'Sương Nha', boss: false },
      { id: '2j', slug: '10-van-truong-vu-thu', ten: 'Vạn Trượng Vụ Thú', boss: true }
    ] },
    { z: 2, slug: 'van-dao', ten: 'Vân Đảo', thu: [
      { id: '3a', slug: '01-van-canh', ten: 'Vân Cảnh', boss: false },
      { id: '3b', slug: '02-van-loa', ten: 'Vân Loa', boss: false },
      { id: '3c', slug: '03-van-dia-lan', ten: 'Vân Địa Lãn', boss: false },
      { id: '3d', slug: '04-van-giap', ten: 'Vân Giáp', boss: false },
      { id: '3e', slug: '05-van-trai', ten: 'Vân Trãi', boss: false },
      { id: '3f', slug: '06-van-khong', ten: 'Vân Khổng', boss: false },
      { id: '3g', slug: '07-van-dinh', ten: 'Vân Đình', boss: false },
      { id: '3h', slug: '08-van-chau', ten: 'Vân Châu', boss: false },
      { id: '3i', slug: '09-van-dang', ten: 'Vân Đăng', boss: false },
      { id: '3j', slug: '10-van-dao-con-bang', ten: 'Vân Đảo Côn Bằng', boss: true }
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
