# Thiết kế Nhiệm vụ (28/11/2026)

45 nhiệm vụ / tuần = 5 nhiệm vụ ngày x 7 ngày + 10 nhiệm vụ tuần. Mỗi tab có thanh điểm hoạt động + 4 rương (25/50/75/100) riêng.
Điểm cộng khi BẤM NHẬN. Ngày reset 0h mỗi ngày, tuần reset 0h sáng thứ Hai; phần chưa nhận thì mất.
Sửa số liệu ở `CFG` đầu file `109-nhiem-vu.js`. Đấu Trường KHÔNG thưởng Thú Thần Thạch (là tiền nạp). Tinh Thạch đã nâng lên (chợ 50 -> 200).

## XOAY VÒNG (cập nhật 28/11/2026)
Không còn 5/10 nhiệm vụ cố định. Mỗi **ô** nhiệm vụ có nhiều biến thể (khác tên, yêu cầu, thưởng); mỗi kỳ game chọn 1 biến thể cho mỗi ô.
- **Ngày**: 5 ô (điểm 15/15/20/25/25 = 100). Biến thể mỗi ô: 6/6/6/7/7. Chọn theo NGÀY TRONG THÁNG => 31 ngày 31 bộ khác nhau, sang tháng sau lặp lại.
- **Tuần**: 10 ô (mỗi ô 10 điểm = 100), mỗi ô 4 biến thể. Chọn theo số tuần (thứ Hai) => chu kỳ 4 tuần, 2 tuần liền nhau luôn khác bộ, hết 4 tuần lặp lại.
- Ô cố định theo loại: Ngày = [nhẹ mua/đánh/bắt/rèn, vừa, săn/rèn/boss, nặng, rất nặng (thủ lĩnh, chinh phạt)]. Tuần = [thắng trận, bắt thú, số vùng, cường hóa, tiến hóa, hạ boss, chi Kỳ Trân, đủ điểm ngày, Boss Thế Giới, Đấu Trường].
- Thú Thần Thạch (tiền nạp) chỉ ở ô Ngày 5 (2 TTT, khoảng 2/7 biến thể) và các ô Tuần đã chốt; Đấu Trường không có TTT.
- Toàn bộ nằm ở `CFG.slot` trong `109-nhiem-vu.js` (hàm Q(tên, mô tả, icon, sự kiện, mục tiêu, thưởng)). Thêm biến thể = thêm 1 dòng Q vào ô đó (ô ngày: giữ số biến thể 6 và 7 để 31 ngày không trùng bộ; nếu đổi số lượng thì chạy lại `TTGNHIEMVU.lich('ngay','2026-12-05')` kiểm tra).
- Xem bộ của một ngày bất kỳ: `TTGNHIEMVU.lich('ngay','2026-12-05')`, `TTGNHIEMVU.lich('tuan','2026-12-07')`; bộ đang chạy: `TTGNHIEMVU.hienTai('ngay'|'tuan')`.
- Rương hoạt động giữ cố định theo tab:
  - Ngày: 25đ 1000 Tinh Thạch | 50đ Châu bậc 1 x10 | 75đ 5 Thú Thần Thạch | 100đ 1 Hộp Ngự Thú Ngẫu Nhiên
  - Tuần: 25đ 3500 Tinh Thạch | 50đ Châu bậc 3 x5 | 75đ 15 Thú Thần Thạch | 100đ 1 Rương Ngự Thú Tự Chọn

## Nguồn đếm tiến độ (đã nối)
- `thang` (thắng trận Thám Hiểm, kèm boss/vùng): index.html, hàm `xong` cuối trận
- `bat`: 62-bat-thu.js `giveBeast` | `cuonghoa`: 74-ren-cuong-hoa.js `chDo` | `tienhoa`: 75-tien-hoa-thu.js
- `mua`, `chi`: 85-cua-hang.js `muaMon` / `muaChau` | `bosstg`: 103-boss-than-the-gioi.js `ketThuc` (thắng hoặc thua đều tính)
- `daydu`: tự phát khi tab Ngày đủ 100 điểm | `daututruong`: CHƯA nối (hệ Vạn Thú Tranh Phong chưa làm)

## Còn lại
- Icon nhiệm vụ đang là emoji tạm (đổi ảnh sau). Icon Châu lấy từ Balo (có ảnh thì hiện ảnh).
- Test nhanh trong console: `TTGNHIEMVU.sk('thang',{boss:true,vung:1})`, `TTGNHIEMVU.xong('d2')`, `TTGNHIEMVU.setDiem(60)`, `TTGNHIEMVU.reset()`.
