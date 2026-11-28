# Thiết kế Nhiệm vụ (28/11/2026)

45 nhiệm vụ / tuần = 5 nhiệm vụ ngày x 7 ngày + 10 nhiệm vụ tuần. Mỗi tab có thanh điểm hoạt động + 4 rương (25/50/75/100) riêng.
Điểm cộng khi BẤM NHẬN. Ngày reset 0h mỗi ngày, tuần reset 0h sáng thứ Hai; phần chưa nhận thì mất.
Sửa số liệu ở `CFG` đầu file `109-nhiem-vu.js`. Đấu Trường KHÔNG thưởng Thú Thần Thạch (là tiền nạp). Tinh Thạch đã nâng lên (chợ 50 -> 200).

## Nhiệm vụ ngày (100 điểm)
| # | Tên | Yêu cầu | Điểm | Thưởng |
|---|---|---|---|---|
| 1 | Dạo Chợ Kỳ Trân | Mua 1 món ở Kỳ Trân Các | 15 | 200 Tinh Thạch |
| 2 | Thám Hiểm | Thắng 10 trận Thám Hiểm | 15 | 500 Tinh Thạch |
| 3 | Săn Thú | Bắt thành công 3 thú | 20 | Ngự Thú Châu bậc 1 x5 |
| 4 | Rèn Luyện | Cường hóa trang bị 3 lần | 25 | 400 Tinh Thạch |
| 5 | Diệt Thủ Lĩnh | Hạ 2 Boss khi Thám Hiểm | 25 | 2 Thú Thần Thạch |

Rương ngày: 25đ 1000 Tinh Thạch | 50đ Châu bậc 1 x10 | 75đ 5 Thú Thần Thạch | 100đ 1 Hộp Ngự Thú Ngẫu Nhiên

## Nhiệm vụ tuần (10 x 10 = 100 điểm)
| # | Tên | Yêu cầu | Thưởng |
|---|---|---|---|
| 1 | Thám Hiểm Bền Bỉ | Thắng 60 trận Thám Hiểm | 2500 Tinh Thạch |
| 2 | Bậc Thầy Săn Thú | Bắt 20 thú | Châu bậc 2 x5 |
| 3 | Du Hành Các Vùng | Thám Hiểm ở 3 vùng khác nhau | 1800 Tinh Thạch |
| 4 | Thợ Rèn Chăm Chỉ | Cường hóa trang bị 20 lần | 2200 Tinh Thạch |
| 5 | Tiến Hóa | Tiến hóa thú 1 lần | 5 Thú Thần Thạch |
| 6 | Sát Thủ Lĩnh | Hạ 10 Boss khi Thám Hiểm | 8 Thú Thần Thạch |
| 7 | Đại Gia Kỳ Trân | Chi 2000 Tinh Thạch ở Kỳ Trân Các | 3 Thú Thần Thạch |
| 8 | Siêng Năng | Đủ 100 điểm hoạt động ngày, 5 lần | Châu bậc 3 x3 |
| 9 | Săn Boss Thế Giới | Đánh Boss Thế Giới 3 lần | 10 Thú Thần Thạch |
| 10 | Đấu Trường | Thắng 5 trận Vạn Thú Tranh Phong | 3000 Tinh Thạch |

Rương tuần: 25đ 3500 Tinh Thạch | 50đ Châu bậc 3 x5 | 75đ 15 Thú Thần Thạch | 100đ 1 Rương Ngự Thú Tự Chọn

## Nguồn đếm tiến độ (đã nối)
- `thang` (thắng trận Thám Hiểm, kèm boss/vùng): index.html, hàm `xong` cuối trận
- `bat`: 62-bat-thu.js `giveBeast` | `cuonghoa`: 74-ren-cuong-hoa.js `chDo` | `tienhoa`: 75-tien-hoa-thu.js
- `mua`, `chi`: 85-cua-hang.js `muaMon` / `muaChau` | `bosstg`: 103-boss-than-the-gioi.js `ketThuc` (thắng hoặc thua đều tính)
- `daydu`: tự phát khi tab Ngày đủ 100 điểm | `daututruong`: CHƯA nối (hệ Vạn Thú Tranh Phong chưa làm)

## Còn lại
- Icon nhiệm vụ đang là emoji tạm (đổi ảnh sau). Icon Châu lấy từ Balo (có ảnh thì hiện ảnh).
- Test nhanh trong console: `TTGNHIEMVU.sk('thang',{boss:true,vung:1})`, `TTGNHIEMVU.xong('d2')`, `TTGNHIEMVU.setDiem(60)`, `TTGNHIEMVU.reset()`.
