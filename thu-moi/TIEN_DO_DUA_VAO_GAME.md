# TIẾN ĐỘ ĐƯA THÚ MỚI VÀO GAME

## Kiểu cắt đã chốt: D (BẮT BUỘC cho mọi con từ nay)
Lệnh: `python3 tools/cat_3_bac.py <anh-goc> thu-game/<slug-vung> <NN-slug> 128 --kieu-d` (thêm `--gan-gan-nhat` nếu các bậc chồng nhau về x).
D = thu 2 bước LANCZOS, tô màu gần nhất vào vùng trong suốt rồi UnsharpMask (radius 0.9, percent 70, threshold 3), làm mịn alpha (gaussian 0.7) rồi alpha cứng 0/255 ngưỡng 110, bỏ nhú 1px và mảnh lẻ dưới 4px.
Lý do: bản cũ (LANCZOS 1 phát từ ~1770px xuống 128px) bị mờ. Đã so mắt trên 1d: A (cũ) mờ; B (2 bước + sắc mạnh) lởm chởm; C (thêm tương phản/bão hòa) gắt; D mịn viền, nét hơn A; E (D + gom 32 màu) gần như không khác D mà có rủi ro vỡ dải màu hào quang nên không dùng. Không bỏ cờ --kieu-d, không tự đổi tham số khi chưa được người dùng cho phép.
Trạng thái áp dụng D: ĐÃ cắt lại toàn bộ vùng 1, 2, 3 (30 con, 1a-3j) theo kiểu D. Các con có tham số riêng đã dùng đúng lại (1b/1j: `3:870-1000`, 2a: `2:440-470`, vùng 3: `--gan-gan-nhat`, 3b: `3:870-1000`). Đã đối chiếu: chạy cách cũ trên ảnh nguồn trong repo cho ra đúng từng pixel bản đang có, nên ảnh nguồn đúng là bản đã duyệt. Vùng 4, 5, 6 dùng D ngay từ đầu.

## Cỡ khung đã chốt: 192x192 (người dùng chốt 18/11/2026)
Hằng FRAME = 192 trong 51-thu-moi.js. Ảnh 192 nằm cạnh ảnh cũ với hậu tố `-192`: `thu-game/<vùng>/NN-slug-b1-192.png` (-b2-192, -b3-192). Ảnh 128 (không hậu tố) và 256 thử (-256, chỉ 6j) GIỮ NGUYÊN, không xóa. Lệnh cắt: `python3 tools/cat_3_bac.py <anh-goc> <thư-mục-ra> <NN-slug> 192 --kieu-d [--gan-gan-nhat] [tham số ép bậc]` rồi đổi tên đầu ra thành `NN-slug-bN-192.png`. Lý do chọn 192: game vẽ x3 trên điện thoại nên 192 phóng đúng 2 lần, nét gần bằng 256, nhẹ hơn ~nửa.
(Ghi chú cũ về 128 bên dưới là lịch sử.) Cùng 1 tỉ lệ thu cho 3 bậc/con; kiểu D; Cùng 1 tỉ lệ thu cho 3 bậc/con; kiểu D ở trên (alpha cứng ngưỡng 110). Chân chạm đáy, căn giữa ngang, lề 3px cho bậc lớn nhất.

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
- 6j Phong Nguyên Vũ Xà, BOSS (chờ duyệt): THAY LẦN 3 bằng ảnh Đằng Xà do ChatGPT làm (rắn cuộn tròn trên mây, cánh dơi màng, bậc 3 sửa riêng cho cuộn gọn). Tách nền chroma-key magenta nối biên + `hau_xu_ly_anh_thu.py --bg magenta`, rồi `cat_3_bac.py ... 128 --kieu-d --gan-gan-nhat`. Tỉ lệ thu 0.1874 (bản trước 0.1437, to hơn ~30%); bậc 1 cao 76px, bậc 2 cao 106px, bậc 3 cao 122px (rộng 119px); 0 pixel ám magenta. Đã so mắt nền sáng/tối: 3 bậc không dính nhau. Điểm chưa ổn: vài viên ngọc hồng nhỏ trên xích bậc 3 bị xóa vì gần màu nền; bậc 1 hơi lớn so với bậc 3 (62%, nhỏ hơn nửa như prompt đòi). Chưa kiểm trong game thật.
- **Vùng 6 Phong Nguyên (z3) đã đủ 10 con (6a-6j), làm TRƯỚC vùng 5** vì người dùng gửi ảnh v4 trước. Ảnh gửi vào chat, alpha khớp từng pixel với `thu-moi/phong-nguyen/` trên nhánh. Tất cả dùng `--kieu-d --gan-gan-nhat` (không dùng cờ gán gần nhất thì lá / mây của bậc 3 dính vào bậc 2; đã so mắt trên 6a, 6d, 6g, 6h, 6j). PNG đã đẩy thẳng vào `thu-game/phong-nguyen/`.

## Đợt 18/11/2026 (khung 192)
- Cắt lại 49 con (vùng 1, 2, 3, 4 và 6a-6i) ở 192: chạy lại ở 128 từ ảnh nguồn trong repo cho ra đúng từng pixel bản 128 đang có (147/150 ảnh trùng), nên ảnh nguồn và tham số đúng.
- 6j Phong Nguyên Vũ Xà: ảnh nguồn cũ trong `thu-moi/phong-nguyen/` là bản lỗi thời nên ĐÃ thêm ảnh nguồn đúng `phong-nguyen-10-phong-nguyen-vu-xa-chuan.png` (người dùng gửi 18/11, tách nền magenta + `hau_xu_ly_anh_thu.py --bg magenta`; file cũ giữ nguyên). Cắt 128 từ file này trùng từng pixel với bản 128 đang dùng, nên bản 192 của 6j giờ cắt THẲNG từ nguồn đúng (tỉ lệ thu 0.2857; bậc 1 cao 116px, bậc 2 cao 161px, bậc 3 cao 186px), không còn thu từ 256. Đã so mắt nền sáng/tối: 3 bậc không dính nhau, 0 pixel ám magenta. Vài viên ngọc hồng nhỏ bị xóa như trước.
- Vùng 5 Nguyệt Cung (5a-5j, 10 con) làm ở 192 với `--kieu-d --gan-gan-nhat`; đã so mắt bảng nền sáng/tối: 3 bậc không dính nhau, chân chạm đáy. Chưa kiểm trong game thật trên điện thoại.
  Tên tạm theo file: Nguyệt Thố, Nguyệt Hạc, Nguyệt Thiềm, Nguyệt Đằng, Nguyệt Nga, Nguyệt Kình, Nguyệt Tượng, Nguyệt Quy, Nguyệt Tiên, Nguyệt Thực Tế Quân (Boss).
  Điểm chưa ổn vùng 5: 5c Nguyệt Thiềm và 5f Nguyệt Kình thân dẹt rộng nên bậc 1 thấp (63px, 68px); 5d Nguyệt Đằng có nhiều cánh hoa nhỏ rời, chưa xem kỹ ở cỡ đúng.
- Đã thêm đúng 1 dòng `<script src="51-thu-moi.js">` vào `index.html` (sau 50-skin.js); file chỉ khai báo, không móc vào chức năng nào.
- `game-moi/index.html`: chế độ HD giờ dùng ảnh 192 (trước là 256).
- **Đủ 60 con (6 vùng), mỗi con 3 bậc ở 192.** Chờ bạn duyệt.

## Thử khung 256 (chỉ để so mắt, KHÔNG đổi cỡ đã chốt)
- 6j Phong Nguyên Vũ Xà có thêm bản 256: `thu-game/phong-nguyen/10-phong-nguyen-vu-xa-b1-256.png`, `-b2-256.png`, `-b3-256.png` (tỉ lệ thu 0.384; bậc 3 cao 250px, ~127KB/ảnh so với ~38KB bản 128). Xem trong `game-moi/index.html` (chế độ HD bật sẵn, thêm `?hd=0` để so với bản 128). `thu-moi-demo.html` đã xóa (18/11/2026), game-moi thay thế. Khung chốt vẫn là 128 cho tới khi người dùng quyết.

## PNG (từ 1e trở đi đã đẩy thẳng bằng git; 1a-1d đã upload tay)
Vào thư mục `thu-game/tuyet-nguyen/`: 01-tuyet-cau-b1.png, -b2.png, -b3.png; 02-tuyet-hung-b1.png, -b2.png, -b3.png; 03-bang-loc-b1.png, -b2.png, -b3.png; 04-tuyet-bao-b1.png, -b2.png, -b3.png; 05-bang-hai-b1.png, -b2.png, -b3.png; 06-tuyet-cu-b1.png, -b2.png, -b3.png; 07-bang-duong, 08-bang-linh, 09-bang-nham, 10-bang-son-cu-thu (mỗi con -b1/-b2/-b3.png)

## Chưa làm
- (Đã xong) dòng script 51-thu-moi.js đã có trong index.html.

## Việc kế tiếp
Bạn duyệt cả 60 con ở `game-moi/index.html` (nút Khung đổi 192/128). Còn lại: đổi tên chính thức (chỉ sửa trong 51-thu-moi.js). Bước sau (sửa cơ chế, bỏ thú và trứng cũ) tính riêng.

## Dọn ảnh cũ (18/11/2026)
Đã xóa toàn bộ PNG 128 (không hậu tố) và 6 PNG 256 trong `thu-game/` theo yêu cầu người dùng. Chỉ còn 180 ảnh `-192.png` (60 con x 3 bậc). Ảnh nguồn trong `thu-moi/` không đụng. `game-moi/index.html` luôn vẽ ảnh 192 (nút Khung chỉ còn đổi độ phân giải canvas). Muốn lấy lại ảnh cũ: xem commit `0e73656` trở về trước.

## Giao diện: màn hình chờ (18/11/2026)
Đã đưa màn chờ có sẵn của `main` (index.html: nền `img-boot-bg.webp` + thanh tiến trình % + nút BẮT ĐẦU) vào `game-moi/index.html`, giữ nguyên kiểu và mã của main (đổi chữ thành "Đang tải thú mới..."). `TTGBOOT.ready()` được gọi khi ảnh 192 của thú đang chọn (cả 2 bên) đã nạp xong; quá 30 giây thì tự cho hiện nút. Không đụng cơ chế game và không đụng `main`. Đã chạy thử bằng trình duyệt giả lập 780x360: thanh chạy, hiện nút, bấm thì vào game, 0 lỗi JS. Việc kế: trang trí phong cách (bạn chốt sau), chỉnh bố cục nút bị đè (Sắp xếp / Chọn thú).
- Màn chờ bản NGANG (18/11/2026): trong `game-moi/index.html`, khi `orientation:landscape` thì tranh nền hiện NGUYÊN VẸN bên trái (khung viền vàng, không bị cắt logo), chữ + thanh % + nút BẮT ĐẦU xếp dọc bên phải, hai bên nền là bản mờ của chính tranh; có chừa vùng tai thỏ (safe-area). Màn dọc giữ như `main`. Đã chụp thử 780x360, 667x375, 932x430, 2340x1080: không phần tử nào tràn màn, 0 lỗi JS. Chưa thử trên điện thoại thật.
- Màn chờ bản MỚI (18/11/2026, thay bản trái-tranh/phải-nút): luồng `game-moi/index.html`:
  1) Màn DỌC: nền tối + chữ "Chạm vào màn hình để xoay ngang"; chạm thì vào toàn màn hình + khóa ngang (nếu máy cho phép; sau 1,2 giây vẫn dọc thì đổi chữ thành "Hãy xoay ngang điện thoại để chơi").
  2) Màn NGANG: ảnh nền `img-boot-ngang.webp` (ảnh bạn gửi, phủ toàn màn hình, 169 KB; đã xóa dấu sao ở góc dưới phải bằng cách vá nền) + thanh tiến trình % ở đáy. Đã BỎ nút BẮT ĐẦU.
  3) Tải xong: dòng "Chạm vào màn hình để vào Thú Thần Giới" nhấp nháy ở khoảng 61% chiều cao (dưới logo, không đè logo); chạm bất kỳ đâu thì vào game. Chạm sớm lúc đang tải thì không vào.
  `img-boot-bg.webp` (ảnh dọc cũ) giữ nguyên cho `main`. Đã chạy thử trình duyệt giả lập: dọc 390x780, ngang 780x360 / 667x375 / 932x430, 0 lỗi JS. Chưa thử xoay thật trên điện thoại (khóa ngang tùy trình duyệt).
