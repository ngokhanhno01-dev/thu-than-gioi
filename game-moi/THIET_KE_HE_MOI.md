# Thiết kế HỆ KẾT HỢP (hệ mới sinh ra từ lai tạo)

Trạng thái: BẢN NHÁP (28/11/2026), chưa nhập vào code. Chỉnh thoải mái, chốt xong mới làm.

## Ý tưởng

Kết hợp 2 hệ ra một HỆ HOÀN TOÀN MỚI (không trùng 21 hệ đang có). Ví dụ Thủy + Tuyết ra Băng.

## Nguyên tắc

- Thứ tự không quan trọng (A + B giống B + A).
- Mỗi hệ mới có đúng 1 công thức. Cặp nào không có trong bảng thì không kết hợp được.
- Một hệ gốc có thể nằm trong nhiều công thức (ví dụ Hoa có 2).
- 3 hệ đặc biệt (Không Gian, Thời Gian, Vô Cực) hiện chỉ kết hợp với nhau.
- Có thể làm dần: chỉ nhập 5 đến 8 công thức trước (đánh dấu "làm trước" bên dưới), phần còn lại thêm sau.

## 16 hệ mới từ hệ vùng

| Công thức | Hệ mới | Lý do | Làm trước |
|---|---|---|---|
| Thủy + Tuyết | Băng | Nước gặp tuyết đóng thành băng | có |
| Hỏa + Ngọc | Nham | Lửa nung đá thành nham thạch | có |
| Phong + Lôi | Bão | Gió và sấm thành giông bão | có |
| Ám + Huyền | Ma | Bóng tối và bí thuật | có |
| Lâm + Ám | Độc | Rừng tối sinh chất độc | có |
| Hoa + Thiên | Tiên | Hoa trời, khí tiên | có |
| Dương + Nguyệt | Quang | Nhật nguyệt hợp lại là ánh sáng | |
| Phong + Ngọc | Sa | Gió mài đá thành cát | |
| Hoa + Huyền | Linh | Hoa linh thiêng, tinh linh | |
| Lâm + Ngọc | Thổ | Rễ cây và đá thành đất | |
| Lôi + Kim | Từ | Điện và kim loại sinh từ trường | |
| Thủy + Thiên | Long | Mây nước, rồng bay | |
| Hỏa + Phong | Viêm | Gió thổi lửa thành lửa dữ | |
| Sương + Ám | Vụ | Sương mù trong bóng tối | |
| Tinh + Nguyệt | Ngân | Trăng sao thành ngân hà | |
| Thần Điện + Dương | Thánh | Đền thiêng và mặt trời | |

## 3 hệ mới từ hệ đặc biệt

| Công thức | Hệ mới | Lý do |
|---|---|---|
| Không Gian + Thời Gian | Vũ Trụ | Vũ là không gian, trụ là thời gian |
| Không Gian + Vô Cực | Hư Vô | Không gian trống rỗng và vô cực |
| Thời Gian + Vô Cực | Luân Hồi | Thời gian lặp mãi không dứt |

## Khóa nội bộ đề xuất

Khóa cũ đã có sẵn trong HE_TEN (56-chi-so.js): bang, nham, doc, ma, long, tien, tho. Cần thêm mới:
bao, sa, quang, linh, tu, viem, vu, ngan, thanh, vutru, huvo, luanhoi.

## Kiểm tra bảng

- 19 công thức, không có 2 công thức nào cùng một cặp nguyên liệu.
- Tổng số hệ sau khi thêm: 21 + 19 = 40.

## Chưa quyết (hỏi lại sau)

1. Hệ đặc biệt kết hợp với hệ vùng thì ra gì (hiện: không kết hợp).
2. Có bỏ bớt hệ nào cho gọn không (gợi ý nếu muốn bớt: Vụ, Thánh, Viêm).
3. Khắc chế của 19 hệ mới (làm ở bước sau).
4. Tỉ lệ lai ra hệ mới, và hệ mới có được mang sách kỹ năng riêng không.
