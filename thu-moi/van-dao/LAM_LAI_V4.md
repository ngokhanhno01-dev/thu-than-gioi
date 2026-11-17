# Vân Đảo: kế hoạch làm lại bằng khung v4 (17/11/2026)

Trạng thái: ĐÃ XONG ảnh (17/11/2026). Đã duyệt bảng 10 thú, soạn 10 prompt, tạo ảnh, tách nền, nhận xét, soạn ghi chú. Ảnh và ghi chú CŨ của Vân Đảo (van-ho, van-dieu..., van-thien-long) CHƯA xóa, chờ người dùng xác nhận. Còn lại: upload PNG + ghi chú lên nhánh, sửa `TIEN_DO.md`.

- Nền tạo ảnh: teal `#00C2C2` (thú tím / hồng / kem / vàng). Cấm cyan / teal / xanh ngọc trên thú.
- Bảng màu: obsidian #0E0A1F, indigo-violet #2E1F7A, royal purple #6A47D6, lavender #A98BF0, mist #DCD0FF, hồng hoàng hôn #E58FC0 (nhấn nhỏ), vàng đèn lồng #FFC85A, kem #FFF1D6.
- Hiệu ứng: đảo đá lơ lửng, mây đặc có viền, thác mảnh rủ từ đảo, pha lê tím, đèn lồng nhỏ.
- Hướng chọn loài: ưu tiên loài tiền sử, cổ đại, thần thoại, viễn tưởng (người dùng yêu cầu thêm đa dạng); không trùng loài các vùng khác.
- File ảnh mới: `van-dao-NN-slug.png` (slug mới không trùng slug cũ).

| # | Tên | Slug | Khung | Môi trường / dáng | Nhóm |
|---:|---|---|---|---|---|
| 1 | Vân Cảnh | van-canh | khủng long cổ dài, đảo vườn nhỏ trên lưng | mặt đất, 4 chân, cổ dài | tiền sử |
| 2 | Vân Loa | van-loa | ốc anh vũ / cúc đá | nước và mây, vỏ xoắn, tua dài | cổ đại |
| 3 | Vân Địa Lãn | van-dia-lan | lười đất khổng lồ Megatherium | cây bonsai, vuốt dài | tiền sử |
| 4 | Vân Giáp | van-giap | tatu giáp khổng lồ Glyptodon | khe đá / giáp, mai vòm, đuôi chùy | tiền sử |
| 5 | Vân Trãi | van-trai | Giải Trãi, thú một sừng mặt sư tử | mặt đất | thần thoại |
| 6 | Vân Khổng | van-khong | khổng tước thần | trời / mặt đất, đuôi xòe | thần thoại |
| 7 | Vân Đình | van-dinh | chuồn chuồn khổng lồ Meganeura | trời, 4 cánh | cổ đại |
| 8 | Vân Châu | van-chau | sứa mây pha lê | lơ lửng, chuông tròn, tua | viễn tưởng |
| 9 | Vân Đăng | van-dang | linh khí đèn lồng ngọc (vật thể sống) | lơ lửng, đuôi mây | viễn tưởng |
| 10 | Vân Đảo Côn Bằng | van-dao-con-bang | Côn Bằng nửa cá nửa chim (boss) | trời, cánh khổng lồ | thần thoại |

Ghi chú: Sloth đặt tên Vân Địa Lãn (slug van-dia-lan) để khỏi trùng slug van-lan của Vân Lân cũ. Nguy cơ giống Pokémon (đã ghi NOT trong prompt): Loa (Omanyte), Châu (Tentacool), Địa Lãn (Slakoth), Giáp (Bastiodon), Đình (Yanma), Đăng (Lampent), Bằng (Lugia). Chưa kiểm tên trùng quái cũ Vân Đảo (người dùng chưa gửi danh sách).

## Kết quả xử lý ảnh (17/11/2026)

- Tách nền: nền thực tế khoảng (1, 208, 215), sáng hơn `#00C2C2` một chút. Chạy `hau_xu_ly_anh_thu.py --bg teal`, không cần `--dao` (Bậc 1 đã ở bên trái). Kết quả sạch viền, không mảnh rời, không thủng; thác, ô lưới đèn và cánh chuồn chuồn ngả xanh nhạt vẫn còn nguyên.
- Nhận xét v4: cả 10 con đạt, không có lỗi nặng, đề nghị duyệt hết, không làm lại.
- Lỗi nhẹ (chấp nhận): 05 bờm Bậc 1-2 có hồng và xanh lam hơi nhiều; 10 vân nứt hồng neon nhiều hơn mức nhấn nhỏ, mắt Bậc 3 hơi nhỏ; 07 có vài tinh thể xanh cobalt; 03 Bậc 1 hơi giống lửng; 02 đầu giống chim hơn ốc; 04 giống rùa hơn glyptodon.
- Tốt nhất vùng: 06 Vân Khổng.
- File giao: `van-dao-png.zip` (10 PNG `van-dao-NN-slug.png`), `ghi-chu-van-dao.zip` (10 `van-dao-NN-slug.md` + `TIEN_DO_VUNG.md`), `xem-thu-1.png`, `xem-thu-2.png`.
- Việc còn lại: người dùng upload PNG và ghi chú lên nhánh `ghi-chu-co-che-bat-thu-evo`, sửa `TIEN_DO.md` thành "Vân Đảo xong", rồi báo để xóa file cũ.
