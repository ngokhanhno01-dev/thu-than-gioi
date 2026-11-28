# Thiết kế Nhiệm vụ (28/11/2026)

45 nhiệm vụ / tuần = 5 nhiệm vụ ngày x 7 ngày + 10 nhiệm vụ tuần. Mỗi tab có thanh điểm hoạt động + 4 rương (25/50/75/100) riêng.
Điểm cộng khi BẤM NHẬN. Ngày reset 0h mỗi ngày, tuần reset 0h sáng thứ Hai; phần chưa nhận thì mất.
Sửa số liệu ở `CFG` đầu file `109-nhiem-vu.js`. Nhiệm vụ và rương KHÔNG còn thưởng Thú Thần Thạch (là tiền nạp, đã thay bằng Hộp/Rương Ngự Thú, Ngự Thú Châu, nguyên liệu Tiến Hóa). Tinh Thạch đã nâng lên (chợ 50 -> 200).

## XOAY VÒNG (cập nhật 28/11/2026)
Không còn 5/10 nhiệm vụ cố định. Mỗi **ô** nhiệm vụ có nhiều biến thể (khác tên, yêu cầu, thưởng); mỗi kỳ game chọn 1 biến thể cho mỗi ô.
- **Ngày**: 5 ô (điểm 15/15/20/25/25 = 100). Biến thể mỗi ô: 6/6/6/7/7. Chọn theo NGÀY TRONG THÁNG => 31 ngày 31 bộ khác nhau, sang tháng sau lặp lại.
- **Tuần**: 10 ô (mỗi ô 10 điểm = 100), mỗi ô 4 biến thể. Chọn theo số tuần (thứ Hai) => chu kỳ 4 tuần, 2 tuần liền nhau luôn khác bộ, hết 4 tuần lặp lại.
- Ô cố định theo loại: Ngày = [nhẹ mua/đánh/bắt/rèn, vừa, săn/rèn/boss, nặng, rất nặng (thủ lĩnh, chinh phạt)]. Tuần = [thắng trận, bắt thú, số vùng, cường hóa, tiến hóa, hạ boss, chi Kỳ Trân, đủ điểm ngày, Boss Thế Giới, Đấu Trường].
- Phần thưởng thay Thú Thần Thạch (28/11/2026): Ngày 5 = Hộp Ngự Thú x1 / Châu bậc 3 x3. Tuần: Tiến hóa = Lõi/Châu tinh hoa (vùng 0-3), Hạ Boss = Thần Ấn (vùng 0-3), Chi Kỳ Trân = Hộp x1-2 / Châu bậc 2 / Rương Tự Chọn, Boss Thế Giới = Rương Tự Chọn / Hộp / Châu bậc 4.
- Toàn bộ nằm ở `CFG.slot` trong `109-nhiem-vu.js` (hàm Q(tên, mô tả, icon, sự kiện, mục tiêu, thưởng)). Thêm biến thể = thêm 1 dòng Q vào ô đó (ô ngày: giữ số biến thể 6 và 7 để 31 ngày không trùng bộ; nếu đổi số lượng thì chạy lại `TTGNHIEMVU.lich('ngay','2026-12-05')` kiểm tra).
- Xem bộ của một ngày bất kỳ: `TTGNHIEMVU.lich('ngay','2026-12-05')`, `TTGNHIEMVU.lich('tuan','2026-12-07')`; bộ đang chạy: `TTGNHIEMVU.hienTai('ngay'|'tuan')`.
- Rương hoạt động giữ cố định theo tab:
  - Ngày: 25đ 1000 Tinh Thạch | 50đ Châu bậc 1 x10 | 75đ Châu bậc 2 x6 | 100đ 1 Hộp Ngự Thú Ngẫu Nhiên
  - Tuần: 25đ 3500 Tinh Thạch | 50đ Châu bậc 3 x5 | 75đ Châu bậc 4 x3 | 100đ 1 Rương Ngự Thú Tự Chọn
  - Một rương có thể chứa nhiều phần thưởng: đặt mảng, vd `[TT(500),HOP(1)]` trong `CFG.ruong`.

## Nguồn đếm tiến độ (đã nối)
- `thang` (thắng trận Thám Hiểm, kèm boss/vùng): index.html, hàm `xong` cuối trận
- `bat`: 62-bat-thu.js `giveBeast` | `cuonghoa`: 74-ren-cuong-hoa.js `chDo` | `tienhoa`: 75-tien-hoa-thu.js
- `mua`, `chi`: 85-cua-hang.js `muaMon` / `muaChau` | `bosstg`: 103-boss-than-the-gioi.js `ketThuc` (thắng hoặc thua đều tính)
- `daydu`: tự phát khi tab Ngày đủ 100 điểm | `daututruong`: CHƯA nối (hệ Vạn Thú Tranh Phong chưa làm)

## Còn lại
## Icon pixel art + bảng thông tin (28/11/2026)
- Icon nhiệm vụ là PIXEL ART 2D 16x16 vẽ bằng dữ liệu chữ (khối `PX` trong `109-nhiem-vu.js`, 15 icon: gio kiem chan bua tien ngoc bando khien quy vuong sao rong lich catcat cup). Tham số thứ 3 của `Q()` là TÊN icon. Thêm icon = thêm 1 dòng 256 ký tự vào `PX` (bảng màu `PXP`). Icon phần thưởng lấy từ ảnh game / Balo.
- Bấm vào ô PHẦN THƯỞNG trong hàng nhiệm vụ: hiện bảng tên, loại, số lượng, mô tả vật phẩm (mô tả lấy từ Balo `TTGBALO.CAT`, riêng Tinh Thạch viết trong hàm `info()`).
- Bấm vào RƯƠNG: hiện bảng liệt kê sẽ nhận được gì + trạng thái (chưa đủ điểm / đủ điểm có nút Nhận / đã nhận). Rương không còn tự nhận khi chạm, phải bấm Nhận trong bảng.
- Đóng bảng: nút Đóng, chạm ra ngoài thẻ, hoặc Esc. Test: `TTGNHIEMVU.xemThuong({t:'tt',n:500})`.
- Test nhanh trong console: `TTGNHIEMVU.sk('thang',{boss:true,vung:1})`, `TTGNHIEMVU.xong('d2')`, `TTGNHIEMVU.setDiem(60)`, `TTGNHIEMVU.reset()`.

## Icon thật của game (28/11/2026)
Icon nhiệm vụ không còn dùng pixel art: bảng `RIC` trong `109-nhiem-vu.js` ánh xạ tên icon (tham số 3 của `Q()`) sang ảnh thật trong `game-moi/icon`, `icon-tien`, `img/chau`. Đổi icon = sửa 1 dòng trong `RIC`. Tên không có trong `RIC` vẫn rơi về pixel art `PX`.

Icon BẮT THÚ (chan, ngoc) = `icon-nv/bat-thu.webp`: icon Thú Thần Thạch (`icon-tien/ttt.webp`) đổi sang màu xanh lục + thêm vài tia sáng. Không dùng icon Ngự Thú Châu vì châu đã là phần thưởng.
