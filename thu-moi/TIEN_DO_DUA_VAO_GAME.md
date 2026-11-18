# TIẾN ĐỘ ĐƯA THÚ MỚI VÀO GAME

## Cỡ khung đã chốt
128x128 (hằng FRAME trong 51-thu-moi.js). Cùng 1 tỉ lệ thu cho 3 bậc/con; LANCZOS rồi alpha cứng (ngưỡng 110). Chân chạm đáy, căn giữa ngang, lề 3px cho bậc lớn nhất.

## Đã xong
- 1a Tuyết Cầu (mẫu, đang chờ duyệt). Cắt tại khe trống alpha=0 (x=321-446 và x=898-951 của ảnh gốc), không cắt vào hình.
- 1b Tuyết Hùng (chờ duyệt): cắt bằng `tools/cat_3_bac.py` theo thành phần liên thông. Khe trống alpha=0 chỉ có giữa bậc 1 và 2 (x=337-358); giữa bậc 2 và 3 không có vì hơi thở của bậc 3 chồng về x với bậc 2 (khác y, không dính nhau) nên gán mảnh theo hình, không cắt dọc. Tỉ lệ thu 0.1396; bậc 3 bị giới hạn bởi chiều ngang (hơi thở + đuôi) nên thân hơi nhỏ (cao 95px).

## Cần upload thủ công (PNG không đẩy được qua công cụ GitHub)
Vào thư mục `thu-game/tuyet-nguyen/`: 01-tuyet-cau-b1.png, -b2.png, -b3.png; 02-tuyet-hung-b1.png, -b2.png, -b3.png

## Chưa làm
- Chưa thêm dòng `<script src="51-thu-moi.js"></script>` vào index.html (sau 50-skin.js). Trang demo tự nạp file này nên vẫn chạy.

## Việc kế tiếp
Chờ duyệt 1a và 1b, rồi 1c Băng Lộc (nói "tiếp").
