// 51-thu-moi.js - Đăng ký thú mới (chỉ khai báo + hàm vẽ, không tự chạy, không móc vào chức năng nào)
// Ảnh nạp LƯỜI: chỉ nạp khi vẽ lần đầu. Tên là TÊN TẠM, đổi tên chỉ sửa ở file này.
(function () {
  var FRAME = 192; // cạnh khung CHỐT (px) = 192 (người dùng chốt 18/11/2026). Ảnh 192 có hậu tố -192; bản 128 cũ (không hậu tố) và 256 thử (-256) giữ nguyên để so sánh
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
    ] },
    { z: 4, slug: 'loi-vuc', ten: 'Lôi Vực', thu: [
      { id: '4a', slug: '01-loi-ung', ten: 'Lôi Ưng', boss: false },
      { id: '4b', slug: '02-loi-ngu', ten: 'Lôi Ngư', boss: false },
      { id: '4c', slug: '03-loi-nguu', ten: 'Lôi Ngưu', boss: false },
      { id: '4d', slug: '04-loi-mang', ten: 'Lôi Mãng', boss: false },
      { id: '4e', slug: '05-loi-co', ten: 'Lôi Cô', boss: false },
      { id: '4f', slug: '06-loi-giap', ten: 'Lôi Giáp', boss: false },
      { id: '4g', slug: '07-loi-su', ten: 'Lôi Sư', boss: false },
      { id: '4h', slug: '08-loi-linh', ten: 'Lôi Linh', boss: false },
      { id: '4i', slug: '09-loi-dong', ten: 'Lôi Đồng', boss: false },
      { id: '4j', slug: '10-loi-vuc-chien-than', ten: 'Lôi Vực Chiến Thần', boss: true }
    ] },
    { z: 5, slug: 'nguyet-cung', ten: 'Nguyệt Cung', thu: [
      { id: '5a', slug: '01-nguyet-tho', ten: 'Nguyệt Thố', boss: false },
      { id: '5b', slug: '02-nguyet-hac', ten: 'Nguyệt Hạc', boss: false },
      { id: '5c', slug: '03-nguyet-thiem', ten: 'Nguyệt Thiềm', boss: false },
      { id: '5d', slug: '04-nguyet-dang', ten: 'Nguyệt Đằng', boss: false },
      { id: '5e', slug: '05-nguyet-nga', ten: 'Nguyệt Nga', boss: false },
      { id: '5f', slug: '06-nguyet-kinh', ten: 'Nguyệt Kình', boss: false },
      { id: '5g', slug: '07-nguyet-tuong', ten: 'Nguyệt Tượng', boss: false },
      { id: '5h', slug: '08-nguyet-quy', ten: 'Nguyệt Quy', boss: false },
      { id: '5i', slug: '09-nguyet-tien', ten: 'Nguyệt Tiên', boss: false },
      { id: '5j', slug: '10-nguyet-thuc-te-quan', ten: 'Nguyệt Thực Tế Quân', boss: true }
    ] },
    { z: 3, slug: 'phong-nguyen', ten: 'Phong Nguyên', thu: [
      { id: '6a', slug: '01-phong-tuc', ten: 'Phong Túc', boss: false },
      { id: '6b', slug: '02-phong-phi', ten: 'Phong Phi', boss: false },
      { id: '6c', slug: '03-phong-giac', ten: 'Phong Giác', boss: false },
      { id: '6d', slug: '04-phong-liem', ten: 'Phong Liêm', boss: false },
      { id: '6e', slug: '05-phong-ngu', ten: 'Phong Ngư', boss: false },
      { id: '6f', slug: '06-phong-tieu', ten: 'Phong Tiêu', boss: false },
      { id: '6g', slug: '07-phong-bi', ten: 'Phong Bi', boss: false },
      { id: '6h', slug: '08-phong-lo', ten: 'Phong Lô', boss: false },
      { id: '6i', slug: '09-phong-tich', ten: 'Phong Tích', boss: false },
      { id: '6j', slug: '10-phong-nguyen-vu-xa', ten: 'Phong Nguyên Vũ Xà', boss: true }
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
      e.src = DIR + t.zone + '/' + t.slug + '-b' + bac + (FRAME === 128 ? '' : '-' + FRAME) + '.png';
    }
    return e.complete && e.naturalWidth ? e : null;
  }
  // Quy ước như drawStage: chân tại (cx, by), size = cạnh khung hiển thị. Trả true nếu đã vẽ.
  function draw(ctx, id, bac, cx, by, size) {
    var im = getImg(id, bac); if (!im) return false;
    size = size || FRAME; // vẽ ở size = khung là 1:1
    var old = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = (FRAME !== 128 && size < FRAME); // ảnh 192/256 vẽ nhỏ lại thì làm mượt, còn lại giữ pixel cứng
    if (ctx.imageSmoothingEnabled) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(im, Math.round(cx - size / 2), Math.round(by - size), size, size);
    ctx.imageSmoothingEnabled = old;
    return true;
  }
  function setFrame(n) { FRAME = (n === 256 || n === 192) ? n : 128; THU_MOI.FRAME = FRAME; } // chỉ để xem thử
  window.THU_MOI = { FRAME: FRAME, setFrame: setFrame, zones: zones, byId: byId, draw: draw, onload: null };
})();
