# Tiến độ vùng Phong Nguyên

**Trạng thái: ĐANG LÀM LẠI bằng khung v4 (bắt đầu 17/11/2026). Đã duyệt bảng 10 thú mới, đã soạn 10 prompt, CHỜ ảnh mới.** Bản cũ (PNG + ghi chú `01-phong-diep.md` ... `10-phong-nguyen-co-thu.md`, `phong-nguyen-NN-<slug cũ>.png`) vẫn nằm trong thư mục này, CHƯA xóa cho tới khi người dùng xác nhận.

## Chủ đề vùng (từ ảnh vùng người dùng gửi)
Đồng cỏ xanh mênh mông, núi nhọn xanh teal, đảo đá lơ lửng, cây thông bonsai, cỏ lau lay trong gió, đá bia khắc xoắn ốc, mây trắng, vệt gió xoáy mảnh bám sườn đồi. Gió là chủ đề chính.
- Bảng màu thú: obsidian #0A1620 (35-40%), navy #12305A, teal #1E9C8C, mint #8FE8C8, lục cỏ #6CC832, trắng mây #EAF8F2, nhấn kem-vàng #F0DC8C (tối đa 10%). Cấm tím / hồng / đỏ / cam.
- Nền tạo ảnh: magenta #FF00FF (ngược tông thú xanh, không lẫn). Một màu cho cả vùng.
- Hiệu ứng: vệt gió xoáy mảnh gắn vào thân, lá nhỏ dính theo vệt gió, cỏ lau, đá bia xoắn ốc, mây đặc có viền. Khác Sương Cốc: lông / lông vũ / cánh / dải vải bay; KHÔNG rêu, sương đặc, ngọc, nấm.

## Bảng 10 thú mới (đã duyệt)
| STT | Tên | Khung / môi trường / dáng | Nhóm | Nguy cơ giống IP | Trạng thái |
|---:|---|---|---|---|---|
| 1 | Phong Túc | chim khủng bố Phorusrhacos; đồng cỏ; hai chân chạy nhanh | tiền sử | Doduo / Dodrio | chờ ảnh |
| 2 | Phong Phi | chồn bay lượn bằng màng; cây / núi; dáng lượn | thật | Emolga | chờ ảnh |
| 3 | Phong Giác | Elasmotherium (tê giác một sừng); đồng cỏ; bốn chân nặng | tiền sử | Rhydon | chờ ảnh |
| 4 | Phong Liêm | Phi Liêm thần gió (báo-chim-rắn); trời / núi; bốn chân có cánh | thần thoại | Zebstrika | chờ ảnh |
| 5 | Phong Ngư | cá bay cạn, vây như cánh; nước; lượn trên mặt ao | thật + viễn tưởng | Mantine | chờ ảnh |
| 6 | Phong Tiêu | chồn đất canh gác; lòng đất / đồng cỏ; đứng thẳng bên ụ đất | thật | Furret | chờ ảnh |
| 7 | Phong Bi | đá bia xoắn ốc sống; đá; khối đứng (vật thể 1) | viễn tưởng | Regirock | chờ ảnh |
| 8 | Phong Lô | cỏ lau thần; thực vật; bụi cỏ có mặt (vật thể 2) | viễn tưởng | Tangela | chờ ảnh |
| 9 | Phong Tích | thằn lằn cổ dù; núi đá; bò thấp, dù cổ như cánh | thật | Sceptile | chờ ảnh |
| 10 | Phong Nguyên Vũ Xà (boss) | rắn lông vũ Quetzalcoatl; trời; cuộn thân, cánh lông vũ | thần thoại | Rayquaza | chờ ảnh |

Loài tránh trùng vùng khác: không dùng pterosaur / hổ răng kiếm (Sương Cốc), chim ưng / rắn (Lôi Vực), Côn Bằng / chuồn chuồn (Vân Đảo), hạc / ngỗng (Nguyệt Cung), cây thông (Sương Cốc Vụ Tùng).
Tên quái cũ trong game: chưa lấy được danh sách (search_code không ra); cần người dùng gửi nếu muốn kiểm trùng tên. Boss: đổi tên từ "Phong Nguyên Cổ Thú" (cũ giống Suicune) sang "Phong Nguyên Vũ Xà".

## Việc tiếp theo
1. Người dùng tạo 10 ảnh theo prompt (`phong-nguyen-01-10-prompts.md`, đã gửi file, chưa commit lên repo) rồi gửi lại.
2. Xử lý ảnh (tách nền theo 3 góc, `hau_xu_ly_anh_thu.py --bg magenta`), nhận xét theo v4, ghi chú `phong-nguyen-NN-slug.md`.
3. Khi người dùng xác nhận mới xóa ảnh và ghi chú cũ của Phong Nguyên (chỉ file đúng tên cũ).

## Bản cũ (tham khảo, chưa xóa)
10 con: Phong Điệp, Phong Thiền, Phong Oa, Phong Miêu, Phong Ngạc, Phong Chu, Phong Tằm, Phong Thử, Phong Đường, Phong Nguyên Cổ Thú. Nhận xét: 06, 07 Bậc 3 kém chi tiết, 05 Bậc 1 giống Totodile, 10 giống Suicune, 08 có chữ RUNE trên giáp. Ảnh 04 gốc xếp Bậc 3 -> 1 đã đảo lại.
