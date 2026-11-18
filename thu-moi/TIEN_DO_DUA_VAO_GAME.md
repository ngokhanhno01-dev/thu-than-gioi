# TIẾN ĐỘ ĐƯA THÚ MỚI VÀO GAME

## Kiểu cắt đã chốt: D (BẮT BUỘC cho mọi con từ nay)
Lệnh: `python3 tools/cat_3_bac.py <anh-goc> thu-game/<slug-vung> <NN-slug> 128 --kieu-d` (thêm `--gan-gan-nhat` nếu các bậc chồng nhau về x).
D = thu 2 bước LANCZOS, tô màu gần nhất vào vùng trong suốt rồi UnsharpMask (radius 0.9, percent 70, threshold 3), làm mịn alpha (gaussian 0.7) rồi alpha cứng 0/255 ngưỡng 110, bỏ nhú 1px và mảnh lẻ dưới 4px.
Lý do: bản cũ (LANCZOS 1 phát từ ~1770px xuống 128px) bị mờ. Đã so mắt trên 1d: A (cũ) mờ; B (2 bước + sắc mạnh) lởm chởm; C (thêm tương phản/bão hòa) gắt; D mịn viền, nét hơn A; E (D + gom 32 màu) gần như không khác D mà có rủi ro vỡ dải màu hào quang nên không dùng. Không bỏ cờ --kieu-d, không tự đổi tham số khi chưa được người dùng cho phép.
Trạng thái áp dụng D: ĐÃ cắt lại toàn bộ vùng 1, 2, 3 (30 con, 1a-3j) theo kiểu D. Các con có tham số riêng đã dùng đúng lại (1b/1j: `3:870-1000`, 2a: `2:440-470`, vùng 3: `--gan-gan-nhat`, 3b: `3:870-1000`). Đã đối chiếu: chạy cách cũ trên ảnh nguồn trong repo cho ra đúng từng pixel bản đang có, nên ảnh nguồn đúng là bản đã duyệt. Vùng 4, 5, 6 dùng D ngay từ đầu.

## Cỡ khung đã chốt
128x128 (hằng FRAME trong 51-thu-moi.js). Cùng 1 tỉ lệ thu cho 3 bậc/con; kiểu D ở trên (alpha cứng ngưỡng 110). Chân chạm đáy, căn giữa ngang, lề 3px cho bậc lớn nhất.

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
- 2a Sương Thát (chờ duyệt): tỉ lệ thu 0.1473; bậc 1 cao 36px, bậc 2 cao 52px, bậc 3 cao 73px; mặt dây chuyền ngọc của bậc 2 (x≈455) bị gán nhầm sang bậc 1, đã ép về bậc 2 bằng `2:440-470`.
- 2b Vụ Dực (chờ duyệt): tỉ lệ thu 0.1424; bậc 1 cao 47px, bậc 2 cao 69px, bậc 3 cao 107px; sạch; mỏ dài và cánh khống chế chiều ngang.
- 2c Sương Xuyên (chờ duyệt): tỉ lệ thu 0.1412; bậc 1 cao 33px, bậc 2 cao 46px, bậc 3 cao 68px; sạch; thân dẹt nên bậc 1 nhỏ.
- 2d Sương Khải (chờ duyệt): tỉ lệ thu 0.1388; bậc 1 cao 40px, bậc 2 cao 55px, bậc 3 cao 82px; sạch; mây dưới bụng giữ nguyên.
- 2e Sương Diệp (chờ duyệt): tỉ lệ thu 0.1514; bậc 1 cao 36px, bậc 2 cao 53px, bậc 3 cao 87px; sạch; râu cong rất mảnh có thể đứt nét khi thu nhỏ.
- 2f Vụ Tiêu (chờ duyệt): tỉ lệ thu 0.1609; bậc 1 cao 53px, bậc 2 cao 84px, bậc 3 cao 120px; sạch.
- 2g Sương Viên (chờ duyệt): tỉ lệ thu 0.1447; bậc 1 cao 42px, bậc 2 cao 69px, bậc 3 cao 101px; sạch.
- 2h Vụ Tùng (chờ duyệt): tỉ lệ thu 0.1479; bậc 1 cao 58px, bậc 2 cao 86px, bậc 3 cao 122px; sạch.
- 2i Sương Nha (chờ duyệt): tỉ lệ thu 0.1442; bậc 1 cao 37px, bậc 2 cao 59px, bậc 3 cao 91px; sạch.
- 2j Vạn Trượng Vụ Thú, BOSS (chờ duyệt): tỉ lệ thu 0.1435; bậc 1 cao 47px, bậc 2 cao 70px, bậc 3 cao 115px; sạch.
- **Vùng 2 Sương Cốc đã đủ 10 con (2a-2j).** Ảnh do người dùng gửi thẳng vào chat (tên file khớp mã), không dùng file bản cũ trong repo. PNG đã đẩy thẳng bằng git vào `thu-game/suong-coc/`.
- 3a Vân Cảnh (chờ duyệt): tỉ lệ thu 0.1477; bậc 1 cao 42px, bậc 2 cao 68px, bậc 3 cao 113px.
- 3b Vân Loa (chờ duyệt): tỉ lệ thu 0.1451; bậc 1 cao 48px, bậc 2 cao 80px, bậc 3 cao 110px.
- 3c Vân Địa Lãn (chờ duyệt): tỉ lệ thu 0.1493; bậc 1 cao 51px, bậc 2 cao 88px, bậc 3 cao 122px.
- 3d Vân Giáp (chờ duyệt): tỉ lệ thu 0.1566; bậc 1 cao 40px, bậc 2 cao 62px, bậc 3 cao 97px.
- 3e Vân Trãi (chờ duyệt): tỉ lệ thu 0.1595; bậc 1 cao 53px, bậc 2 cao 78px, bậc 3 cao 108px.
- 3f Vân Khổng (chờ duyệt): tỉ lệ thu 0.1501; bậc 1 cao 57px, bậc 2 cao 85px, bậc 3 cao 122px.
- 3g Vân Đình (chờ duyệt): tỉ lệ thu 0.1537; bậc 1 cao 35px, bậc 2 cao 76px, bậc 3 cao 121px.
- 3h Vân Châu (chờ duyệt): tỉ lệ thu 0.144; bậc 1 cao 52px, bậc 2 cao 88px, bậc 3 cao 122px.
- 3i Vân Đăng (chờ duyệt): tỉ lệ thu 0.1451; bậc 1 cao 58px, bậc 2 cao 87px, bậc 3 cao 122px.
- 3j Vân Đảo Côn Bằng, BOSS (chờ duyệt): tỉ lệ thu 0.1435; bậc 1 cao 30px, bậc 2 cao 61px, bậc 3 cao 112px.
- **Vùng 3 Vân Đảo đã đủ 10 con (3a-3j).** Ảnh người dùng gửi vào chat, đối chiếu khớp từng pixel alpha với bản v4 trong `thu-moi/van-dao/`. Nền teal: không còn pixel ám màu nền. PNG đã đẩy thẳng vào `thu-game/van-dao/`.
- **Tên theo ghi chú .md trong `van-dao/`** (khác prompt): 3a "Vân Cảnh" (prompt ghi Vân Canh), 3g "Vân Đình" (prompt ghi Vân Đĩnh). Chỉ là tên tạm, sửa trong `51-thu-moi.js`.
- **Công cụ:** vùng này các bậc chồng nhau về x (đảo đá, mây, đèn lồng rơi lẫn giữa bậc 2 và 3), cắt theo tâm x sẽ gán nhầm mảnh sang bậc 2. Đã thêm cờ `--gan-gan-nhat` cho `tools/cat_3_bac.py` (gán mảnh rời cho thân có pixel gần nhất); không dùng cờ thì chạy y như cũ. Vùng 1-2 cắt không dùng cờ, đã xem bảng thử thấy sạch.

- 4a Lôi Ưng (chờ duyệt): kiểu D, tỉ lệ thu 0.1535; bậc 1 cao 51px, bậc 2 cao 84px, bậc 3 cao 121px.
- 4b Lôi Ngư (chờ duyệt): kiểu D, tỉ lệ thu 0.158; bậc 1 cao 43px, bậc 2 cao 58px, bậc 3 cao 94px.
- 4c Lôi Ngưu (chờ duyệt): kiểu D, tỉ lệ thu 0.143; bậc 1 cao 47px, bậc 2 cao 68px, bậc 3 cao 94px.
- 4d Lôi Mãng (chờ duyệt): kiểu D, tỉ lệ thu 0.1508; bậc 1 cao 52px, bậc 2 cao 86px, bậc 3 cao 121px.
- 4e Lôi Cô (chờ duyệt): kiểu D, tỉ lệ thu 0.1451; bậc 1 cao 53px, bậc 2 cao 85px, bậc 3 cao 122px.
- 4f Lôi Giáp (chờ duyệt): kiểu D, tỉ lệ thu 0.1488; bậc 1 cao 43px, bậc 2 cao 61px, bậc 3 cao 90px.
- 4g Lôi Sư (chờ duyệt): kiểu D, tỉ lệ thu 0.1576; bậc 1 cao 56px, bậc 2 cao 76px, bậc 3 cao 99px.
- 4h Lôi Linh (chờ duyệt): kiểu D, tỉ lệ thu 0.1562; bậc 1 cao 52px, bậc 2 cao 80px, bậc 3 cao 121px.
- 4i Lôi Đồng (chờ duyệt): kiểu D, tỉ lệ thu 0.1434; bậc 1 cao 62px, bậc 2 cao 92px, bậc 3 cao 118px.
- 4j Lôi Vực Chiến Thần, BOSS (chờ duyệt): kiểu D, tỉ lệ thu 0.1422; bậc 1 cao 50px, bậc 2 cao 81px, bậc 3 cao 115px.
- **Vùng 4 Lôi Vực đã đủ 10 con (4a-4j).** Ảnh người dùng gửi vào chat, alpha khớp từng pixel với bản trong `thu-moi/loi-vuc/`. Tất cả dùng `--kieu-d --gan-gan-nhat`: không dùng cờ gán gần nhất thì mảnh tinh thể / mây của bậc 3 bị gán nhầm vào bậc 2 (đã so mắt trên 02, 03, 05, 06, 08, 09). PNG đã đẩy thẳng vào `thu-game/loi-vuc/`.

- 6a Phong Túc (chờ duyệt): kiểu D, tỉ lệ thu 0.1451; bậc 1 cao 51px, bậc 2 cao 78px, bậc 3 cao 113px.
- 6b Phong Phi (chờ duyệt): kiểu D, tỉ lệ thu 0.1625; bậc 1 cao 59px, bậc 2 cao 75px, bậc 3 cao 108px.
- 6c Phong Giác (chờ duyệt): kiểu D, tỉ lệ thu 0.1449; bậc 1 cao 42px, bậc 2 cao 60px, bậc 3 cao 81px.
- 6d Phong Liêm (chờ duyệt): kiểu D, tỉ lệ thu 0.1491; bậc 1 cao 54px, bậc 2 cao 73px, bậc 3 cao 119px.
- 6e Phong Ngư (chờ duyệt): kiểu D, tỉ lệ thu 0.1459; bậc 1 cao 40px, bậc 2 cao 72px, bậc 3 cao 121px.
- 6f Phong Tiêu (chờ duyệt): kiểu D, tỉ lệ thu 0.1442; bậc 1 cao 62px, bậc 2 cao 87px, bậc 3 cao 120px.
- 6g Phong Bi (chờ duyệt): kiểu D, tỉ lệ thu 0.1452; bậc 1 cao 59px, bậc 2 cao 82px, bậc 3 cao 121px.
- 6h Phong Lô (chờ duyệt): kiểu D, tỉ lệ thu 0.1424; bậc 1 cao 51px, bậc 2 cao 89px, bậc 3 cao 121px.
- 6i Phong Tích (chờ duyệt): kiểu D, tỉ lệ thu 0.1472; bậc 1 cao 48px, bậc 2 cao 80px, bậc 3 cao 117px.
- 6j Phong Nguyên Vũ Xà, BOSS (chờ duyệt): THAY LẦN 2 bằng ảnh người dùng gửi ngày 18/11/2026 (rắn cánh lông vũ xanh, nền magenta gốc, thay bản v5 trước). Tách nền bằng chroma-key magenta nối biên + `hau_xu_ly_anh_thu.py --bg magenta`, rồi `cat_3_bac.py ... 128 --kieu-d --gan-gan-nhat`. Tỉ lệ thu 0.1437; bậc 1 cao 53px, bậc 2 cao 96px, bậc 3 cao 121px; 0 pixel ám magenta. Đã so mắt trên nền sáng/tối: 3 bậc không dính nhau. Chưa kiểm trong game thật. Ảnh tách nền chưa nằm trong `thu-moi/phong-nguyen/` (thư mục chỉ đọc).
- **Vùng 6 Phong Nguyên (z3) đã đủ 10 con (6a-6j), làm TRƯỚC vùng 5** vì người dùng gửi ảnh v4 trước. Ảnh gửi vào chat, alpha khớp từng pixel với `thu-moi/phong-nguyen/` trên nhánh. Tất cả dùng `--kieu-d --gan-gan-nhat` (không dùng cờ gán gần nhất thì lá / mây của bậc 3 dính vào bậc 2; đã so mắt trên 6a, 6d, 6g, 6h, 6j). PNG đã đẩy thẳng vào `thu-game/phong-nguyen/`.

## PNG (từ 1e trở đi đã đẩy thẳng bằng git; 1a-1d đã upload tay)
Vào thư mục `thu-game/tuyet-nguyen/`: 01-tuyet-cau-b1.png, -b2.png, -b3.png; 02-tuyet-hung-b1.png, -b2.png, -b3.png; 03-bang-loc-b1.png, -b2.png, -b3.png; 04-tuyet-bao-b1.png, -b2.png, -b3.png; 05-bang-hai-b1.png, -b2.png, -b3.png; 06-tuyet-cu-b1.png, -b2.png, -b3.png; 07-bang-duong, 08-bang-linh, 09-bang-nham, 10-bang-son-cu-thu (mỗi con -b1/-b2/-b3.png)

## Chưa làm
- Chưa thêm dòng `<script src="51-thu-moi.js"></script>` vào index.html (sau 50-skin.js). Trang demo tự nạp file này nên vẫn chạy.

## Việc kế tiếp
Chờ duyệt vùng 1, 2, 3, 4, 6. Còn lại vùng 5 Nguyệt Cung: 5a Nguyệt Thố (nói "tiếp", gửi PNG kèm tên file). Sau vùng 5 là tổng kết 60 con.
