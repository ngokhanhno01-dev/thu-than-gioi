# TIẾN ĐỘ ĐƯA THÚ MỚI VÀO GAME

## Cỡ khung đã chốt
128x128 (hằng FRAME trong 51-thu-moi.js). Cùng 1 tỉ lệ thu cho 3 bậc/con; LANCZOS rồi alpha cứng (ngưỡng 110). Chân chạm đáy, căn giữa ngang, lề 3px cho bậc lớn nhất.

## Đã xong
- 1a Tuyết Cầu (mẫu, đang chờ duyệt). Cắt tại khe trống alpha=0 (x=321-446 và x=898-951 của ảnh gốc), không cắt vào hình.
- 1b Tuyết Hùng (chờ duyệt): cắt bằng `tools/cat_3_bac.py` theo thành phần liên thông. Khe trống alpha=0 chỉ có giữa bậc 1 và 2 (x=337-358); giữa bậc 2 và 3 không có vì hơi thở của bậc 3 chồng về x với bậc 2 (khác y, không dính nhau) nên gán mảnh theo hình, không cắt dọc. Tỉ lệ thu 0.1396; bậc 3 bị giới hạn bởi chiều ngang (hơi thở + đuôi) nên thân hơi nhỏ (cao 95px).
- 1c Băng Lộc (chờ duyệt): cắt bằng `tools/cat_3_bac.py`, 3 thân tách sẵn (không mảnh rời, không cần gán tay). Tỉ lệ thu 0.144; bậc 3 cao 122px (khống chế bởi chiều cao, gạc + dải sáng), bậc 1 cao 59px, bậc 2 cao 87px. Xem thử trên game mới: `game-moi/index.html?thu=1c`.
- 1d Tuyết Báo (chờ duyệt): cắt bằng `tools/cat_3_bac.py`; 3 thân + 3 mảnh tinh thể rời (2 thuộc bậc 3, 1 thuộc bậc 2) tự gán đúng theo tâm gần nhất. Tỉ lệ thu 0.1644; bậc 1 cao 41px, bậc 2 cao 65px, bậc 3 cao 88px (bị giới hạn bởi chiều ngang 122px, đuôi dài).
- 1e Băng Hải (chờ duyệt): cắt bằng `tools/cat_3_bac.py`, 3 thân tách sẵn, không mảnh rời. Tỉ lệ thu 0.1546; bậc 1 cao 39px, bậc 2 cao 56px, bậc 3 cao 90px (bị giới hạn bởi chiều ngang 122px, đuôi tinh thể dài). Xem thử: `game-moi/index.html?thu=1e`.
- 1f Tuyết Cú (chờ duyệt): cắt bằng `tools/cat_3_bac.py`, 3 thân (có đế đá băng, giữ nguyên vì là thiết kế). Tỉ lệ thu 0.1409; bậc 1 cao 58px, bậc 2 cao 83px, bậc 3 cao 112px (cánh xòe rộng 122px nên bị khống chế chiều ngang). Xem thử: `game-moi/index.html?thu=1f`.
- 1g Băng Dương (chờ duyệt): 3 thân tách sẵn, sạch. Tỉ lệ thu 0.1607; bậc 1 cao 65px, bậc 2 cao 92px, bậc 3 cao 122px (bị khống chế bởi chiều cao, sừng cong).
- 1h Băng Linh (chờ duyệt): 3 thân tách sẵn, sạch. Tỉ lệ thu 0.142; bậc 1 cao 57px, bậc 2 cao 88px, bậc 3 cao 122px (chiều cao, ngọn tinh thể).
- 1i Băng Nham (chờ duyệt): 3 thân tách sẵn, sạch. Tỉ lệ thu 0.1468; bậc 1 cao 51px, bậc 2 cao 76px, bậc 3 cao 122px (chiều cao).
- 1j Băng Sơn Cự Thú, BOSS (chờ duyệt): bậc 3 có hiệu ứng gió/bông tuyết rời (giữ vì là thiết kế). Một số mảnh hiệu ứng nằm lẫn về x với bậc 2 nên ép về bậc 3 bằng tham số `3:870-1000` của `tools/cat_3_bac.py`. Tỉ lệ thu 0.1354; bậc 1 cao 47px, bậc 2 cao 66px, bậc 3 cao 98px (bị khống chế bởi chiều ngang 122px do hiệu ứng gió rộng).
- **Vùng 1 Tuyết Nguyên đã đủ 10 con (1a-1j).**

## PNG (từ 1e trở đi đã đẩy thẳng bằng git; 1a-1d đã upload tay)
Vào thư mục `thu-game/tuyet-nguyen/`: 01-tuyet-cau-b1.png, -b2.png, -b3.png; 02-tuyet-hung-b1.png, -b2.png, -b3.png; 03-bang-loc-b1.png, -b2.png, -b3.png; 04-tuyet-bao-b1.png, -b2.png, -b3.png; 05-bang-hai-b1.png, -b2.png, -b3.png; 06-tuyet-cu-b1.png, -b2.png, -b3.png; 07-bang-duong, 08-bang-linh, 09-bang-nham, 10-bang-son-cu-thu (mỗi con -b1/-b2/-b3.png)

## Chưa làm
- Chưa thêm dòng `<script src="51-thu-moi.js"></script>` vào index.html (sau 50-skin.js). Trang demo tự nạp file này nên vẫn chạy.

## Việc kế tiếp
Chờ duyệt 1a-1j (cả vùng 1), rồi vùng 2 Sương Cốc: 2a Sương Thát (nói "tiếp").
