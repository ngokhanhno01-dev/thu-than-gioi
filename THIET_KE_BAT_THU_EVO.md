# Cơ chế mới: Bắt thú theo vùng + Tiến hóa 3 bậc + Evo (lai tạo)

> Ghi chú thiết kế để lưu lại. CHƯA làm vào code game.
> Ngày ghi: 2026-11-16

## Ý tưởng chính (của chủ game)

- Hiện có **17 vùng đất**. Mỗi vùng có **10 con thú khác nhau** → **17 × 10 = 170 con**.
- Mỗi con có **3 bậc tiến hóa** (Bậc 1 → Bậc 2 → Bậc 3). **1 ảnh chứa cả 3 hình dáng** → chỉ cần **170 lượt tạo ảnh** (mỗi lượt = 1 con, 3 bậc).
- **Bỏ hẳn phần nuôi lớn / baby**. Thay bằng cơ chế **tiến hóa**: tiến hóa lên thì **đổi sang hình dáng mới** (bậc kế tiếp).
- Thêm **cơ chế Evo**: **kết hợp 2 con để tạo ra 1 con mới**.
  - 170 ÷ 2 = **85 con dạng Evo**.
  - 85 + 170 = **255 con** tổng cộng.
- **Thay cơ chế Roll bằng cơ chế Bắt thú** (đi tới vùng đất thì bắt thú của vùng đó).

## Tóm tắt con số

| Loại | Số lượng | Ghi chú |
|---|---|---|
| Vùng đất | 17 | hiện có |
| Thú gốc mỗi vùng | 10 | khác nhau |
| Tổng thú gốc | 170 | 17 × 10 |
| Bậc tiến hóa mỗi con | 3 | Bậc 1 → 2 → 3, gom trong 1 ảnh |
| Lượt tạo ảnh thú gốc | 170 | 1 ảnh = 3 bậc |
| Con dạng Evo | 85 | 170 ÷ 2 (ghép 2 → 1) |
| Tổng | 255 | 85 + 170 |

## Nhận xét tham khảo (từ cuộc trò chuyện với AI khác, chưa kiểm chứng)

Điểm mạnh được nêu:
- Có động lực khám phá từng vùng đất: đi tới vùng mới để săn 10 loài đặc trưng của vùng đó, kích thích cày hơn là đứng một chỗ bấm Roll.
- Cơ chế Evo tạo chiều sâu chiến thuật: có lý do quay lại vùng cũ bắt thêm thú làm nguyên liệu dung hợp, và tò mò mở khóa đủ bộ sưu tập Evo ẩn.
- Gom 3 bậc tiến hóa trên 1 tấm ảnh rất tối ưu: 1 lần tạo ảnh có trọn bộ 3 hình dáng cho 1 loài, không còn phải ghép 3 tấm như khi làm 10 cấp.

Lưu ý được nêu:
- Con số 255 lượt tạo ảnh cho 1 người làm vẫn khá nặng nếu không chia lộ trình thông minh.

## Câu hỏi còn mở (chưa quyết, cần chốt sau)

- 85 con Evo có cũng 3 bậc / 1 ảnh 3 hình như thú gốc không? Hay mỗi con Evo chỉ 1 hình? (Quyết định này làm số lượt tạo ảnh là 170 + 85 = 255 hay khác.)
- Cách ghép Evo: cặp nào ghép ra con nào (cố định theo công thức, hay theo vùng / hệ)? Có cần cùng bậc, cùng vùng không?
- Tỉ lệ và cách bắt thú trong vùng (bắt thế nào, tỉ lệ xuất hiện từng con, thú hiếm).
- Lộ trình chia nhỏ việc tạo ảnh (làm theo vùng nào trước).
- Thú hiện tại (6 tộc × 17 hệ) và hệ thống trứng / thuộc hạ / boss sẽ giữ, đổi hay bỏ khi chuyển sang bắt thú.
