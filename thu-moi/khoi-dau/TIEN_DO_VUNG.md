# Tiến độ: 3 thú khởi đầu (hệ Thường + hệ phụ)

- 21/11/2026: chốt Thường + Thủy / Hỏa / Mộc. Prompt ở `01-03-prompts.md`.
- 21/11/2026: người dùng đã tạo ảnh 3 thú + 3 nền vùng (Thủy Nguyệt Cảnh, Xích Hỏa Địa, Thanh Lâm). Đã tách nền (xu_ly_anh_thu v2 + hau_xu_ly), cắt 3 bậc 192 kiểu D.
- Mỗi thú khởi đầu nằm trong 1 vùng mới (tạm chỉ 1 con) để dùng nền của vùng đó:
  - k1 Viêm Sư (Thường + Hỏa, công) -> `xich-hoa-dia` (z7), nền `game-moi/bg-xich-hoa-dia.webp`
  - k2 Lưu Diêu (Thường + Thủy, nhanh) -> `thuy-nguyet-canh` (z6), nền `game-moi/bg-thuy-nguyet-canh.webp`
  - k3 Lâm Trư (Thường + Mộc, tank) -> `thanh-lam` (z8), nền `game-moi/bg-thanh-lam.webp`
- Ảnh gốc đã tách nền: `thu-moi/<vùng>/<vùng>-01-<slug>.png`; sprite 192: `thu-game/<vùng>/01-<slug>-b1..b3-192.png`.
- Chỉ số: 56b-loai.js cho 3 con `vung = 0` (tính chỉ số ngang thú vùng 1), không phải boss. Khi làm đủ 10 thú cho 3 vùng này thì sắp lại bảng.
- Màn chọn thú (`game-moi/65-chon-thu-dau.js`): bục trái Lưu Diêu, giữa Viêm Sư, phải Lâm Trư.
- Hiệu ứng nền (index.html, BG_FX_ZONE): Thủy = sương + hạt sáng xanh, Hỏa = tàn lửa cam + khói, Mộc = lá bay + đom đóm.
- Chưa làm: ghi chú .md từng con, đổi tên chính thức, phát thú vào túi khi chọn, tên chưa kiểm trùng quái cũ.
- 21/11/2026: NGOẠI LỆ NỀN. Cả 3 thú khởi đầu dùng chung nền `game-moi/bg-khoi-dau.webp` (sân vườn anh đào, 1520x702, cắt từ ảnh gốc 1672x941 cho gần tỉ lệ các nền vùng khác), KHÔNG dùng nền vùng của mình nữa. Cách làm: cờ `nen:'khoi-dau'` trên k1/k2/k3 trong `51-thu-moi.js` (t.zone giữ nguyên để tìm ảnh thú); `bgSync`/`bgWant` trong `game-moi/index.html` lấy `t.nen||t.zone`; cấu hình `'khoi-dau'` trong `BG_FX_ZONE` (hiệu ứng: cánh hoa hồng rơi + hạt sáng xanh nhạt). 3 nền cũ (thuy-nguyet-canh, xich-hoa-dia, thanh-lam) vẫn còn trong BG_FX_ZONE cho quái/thú hoang của vùng đó.
