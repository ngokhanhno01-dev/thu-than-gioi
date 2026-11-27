// 51-thu-moi.js - Đăng ký thú mới (chỉ khai báo + hàm vẽ, không tự chạy, không móc vào chức năng nào)
// Ảnh nạp LƯỜI: chỉ nạp khi vẽ lần đầu. Tên là TÊN TẠM, đổi tên chỉ sửa ở file này.
// [XÓA DỮ LIỆU TẠM] Chưa có kho + tài khoản online nên MỖI LẦN MỞ GAME xóa sạch dữ liệu cũ = coi như người chơi vào lần đầu (thấy lại video giới thiệu, màn chọn thú đầu).
// Đặt ở đây vì đây là file game-moi nạp ĐẦU TIÊN, trước mọi module đọc localStorage. Xóa mọi khóa ttg_moi_* TRỪ cài đặt giao diện (bố cục nút ttg_moi_layout_v1, khung HD ttg_moi_hd), cùng danh sách với GIU của 65-chon-thu-dau.js. Không đụng khóa game bản cũ (khác tiền tố). Không chạy khi chưa cài app (TTG_BLOCK).
// Khi đã có kho/tài khoản: đổi XOA_KHI_MO = false (hoặc xóa khối này).
(function () {
  var XOA_KHI_MO = true, GIU = ['ttg_moi_layout_v1', 'ttg_moi_hd'];
  try {
    if (!XOA_KHI_MO || window.TTG_BLOCK || !document.getElementById('tb-scene')) return;
    var ks = [], i;
    for (i = 0; i < localStorage.length; i++) ks.push(localStorage.key(i));
    ks.forEach(function (k) { if (k && k.indexOf('ttg_moi_') === 0 && GIU.indexOf(k) < 0) localStorage.removeItem(k); });
  } catch (e) {}
})();
// [INTRO] Video giới thiệu lần đầu vào game: nạp module riêng game-moi/85-video-gioi-thieu.js (chỉ ở trang có màn chờ của game-moi; lỗi/thiếu file thì bỏ qua, không ảnh hưởng game).
(function () { try { if (document.getElementById('tb-scene')) { var s = document.createElement('script'); s.src = 'game-moi/85-video-gioi-thieu.js'; document.head.appendChild(s); } } catch (e) {} })();
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
    ] },
    { z: 6, slug: 'thuy-nguyet-canh', ten: 'Thủy Nguyệt Cảnh', thu: [
      { id: 'k2', slug: '01-luu-dieu', ten: 'Lưu Diêu', boss: false, nen: 'khoi-dau' },
      { id: '7a', slug: '01-thuy-giap-tuong', ten: 'Thủy Giáp Tướng', boss: false },
      { id: '7b', slug: '02-thuy-lang-quy', ten: 'Thủy Lãng Quỳ', boss: false },
      { id: '7c', slug: '03-thuy-linh-nhu', ten: 'Thủy Linh Nhu', boss: false },
      { id: '7d', slug: '04-thuy-huyen-quy', ten: 'Thủy Huyền Quy', boss: false },
      { id: '7e', slug: '05-thuy-sat-giao', ten: 'Thủy Sát Giao', boss: false },
      { id: '7f', slug: '06-thuy-nguyet-lien', ten: 'Thủy Nguyệt Liên', boss: false },
      { id: '7g', slug: '07-thuy-vu-ve', ten: 'Thủy Vũ Vệ', boss: false },
      { id: '7h', slug: '08-thuy-thuong-long', ten: 'Thủy Thương Long', boss: false },
      { id: '7i', slug: '09-thuy-thanh-trach', ten: 'Thủy Thánh Trạch', boss: false },
      { id: '7j', slug: '10-hoai-thuy-vo-chi-ky', ten: 'Hoài Thủy Vô Chi Kỳ', boss: true }
    ] },
    { z: 7, slug: 'xich-hoa-dia', ten: 'Xích Hỏa Địa', thu: [
      { id: 'k1', slug: '01-viem-su', ten: 'Viêm Sư', boss: false, nen: 'khoi-dau' },
      { id: '8a', slug: '01-hoa-tinh-thu', ten: 'Hỏa Tinh Thử', boss: false },
      { id: '8b', slug: '02-hoa-nham-giac', ten: 'Hỏa Nham Giác', boss: false },
      { id: '8c', slug: '03-hoa-nham-yet', ten: 'Hỏa Nham Yết', boss: false },
      { id: '8d', slug: '04-hoa-diem-dau', ten: 'Hỏa Diễm Đấu', boss: false },
      { id: '8e', slug: '05-hoa-da-buc', ten: 'Hỏa Dạ Bức', boss: false },
      { id: '8f', slug: '06-tam-nhan-hoa-vien', ten: 'Tam Nhãn Hỏa Viên', boss: false },
      { id: '8g', slug: '07-hoa-linh-phuong', ten: 'Hỏa Linh Phương', boss: false },
      { id: '8h', slug: '08-hoa-viem-giao', ten: 'Hỏa Viêm Giao', boss: false },
      { id: '8i', slug: '09-hoa-thanh-ly', ten: 'Hỏa Thanh Ly', boss: false },
      { id: '8j', slug: '10-xich-diem-ma-vuong', ten: 'Xích Diễm Ma Vương', boss: true }
    ] },
    { z: 8, slug: 'thanh-lam', ten: 'Thanh Lâm', thu: [
      { id: 'k3', slug: '01-lam-tru', ten: 'Lâm Trư', boss: false, nen: 'khoi-dau' },
      { id: '9a', slug: '01-moc-nhi-tho', ten: 'Mộc Nhĩ Thố', boss: false },
      { id: '9b', slug: '02-moc-giac-tuong', ten: 'Mộc Giác Tượng', boss: false },
      { id: '9c', slug: '03-moc-phong-trung', ten: 'Mộc Phong Trùng', boss: false },
      { id: '9d', slug: '04-moc-linh-loc', ten: 'Mộc Linh Lộc', boss: false },
      { id: '9e', slug: '05-moc-nha-tru', ten: 'Mộc Nha Trư', boss: false },
      { id: '9f', slug: '06-moc-diep-linh', ten: 'Mộc Điệp Linh', boss: false },
      { id: '9g', slug: '07-moc-khong-tuoc', ten: 'Mộc Khổng Tước', boss: false },
      { id: '9h', slug: '08-moc-nham-hung', ten: 'Mộc Nham Hùng', boss: false },
      { id: '9i', slug: '09-moc-thanh-lan', ten: 'Mộc Thanh Lân', boss: false },
      { id: '9j', slug: '10-thanh-lam-cung-ky', ten: 'Thanh Lâm Cùng Kỳ', boss: true }
    ] }
  ];
  /* THÚ THẦN (boss thế giới, 27/11/2026): KHÔNG nằm trong zones (không thành vùng, không tính Danh Vọng/map/thám hiểm). Chỉ đăng ký vào byId để vẽ + hiện ở bảng thú.
     Ảnh: thu-game/than/<slug>-b<bậc>-192.png. Thêm Thời Gian / Thái Cực: thêm dòng vào thanZone.thu. */
  var thanZone = { z: 17, slug: 'than', ten: 'Thần', thu: [
    { id: 'th1', slug: 'de-giang', ten: 'Đế Giang', boss: true, nen: 'tinh-vuc-doan-khong' },
    { id: 'th2', slug: 'chuc-long', ten: 'Chúc Long', boss: true, nen: 'thoi-quang-co-vuc' },
    { id: 'th3', slug: 'vo-cuc', ten: 'Vô Cực', boss: true, nen: 'con-luan-thien-canh' }
  ] };
  var byId = {}, cache = {};
  zones.forEach(function (zn) {
    zn.thu.forEach(function (t) {
      t.z = zn.z; t.zone = zn.slug; t.frame = FRAME;
      byId[t.id] = t;
    });
  });
  thanZone.thu.forEach(function (t) { t.z = thanZone.z; t.zone = thanZone.slug; t.frame = FRAME; byId[t.id] = t; });
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
  function draw(ctx, id, bac, cx, by, size, fine) { // fine=true: KHÔNG làm tròn toạ độ (cho chuyển động mượt như nhịp thở ở sảnh)
    var im = getImg(id, bac); if (!im) return false;
    size = size || FRAME; // vẽ ở size = khung là 1:1
    var old = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = (FRAME !== 128 && size < FRAME); // ảnh 192/256 vẽ nhỏ lại thì làm mượt, còn lại giữ pixel cứng
    if (ctx.imageSmoothingEnabled) ctx.imageSmoothingQuality = 'high';
    if (fine) ctx.drawImage(im, cx - size / 2, by - size, size, size);
    else ctx.drawImage(im, Math.round(cx - size / 2), Math.round(by - size), size, size);
    ctx.imageSmoothingEnabled = old;
    return true;
  }
  function setFrame(n) { FRAME = (n === 256 || n === 192) ? n : 128; THU_MOI.FRAME = FRAME; } // chỉ để xem thử
  window.THU_MOI = { FRAME: FRAME, setFrame: setFrame, zones: zones, than: thanZone, byId: byId, draw: draw, onload: null };
})();
