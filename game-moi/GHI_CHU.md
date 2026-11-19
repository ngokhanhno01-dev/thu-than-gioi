# Game mới (màn ngang)

Mở: `game-moi/index.html` (có `<base href="../">` nên dùng chung `51-thu-moi.js`, `thu-game/` và mọi ảnh ở gốc repo).

## Đã chốt
- Thú vẽ **128px, 1:1**, hệ số bậc 1/1/1.
- Màn ngang toàn màn hình, scale **nguyên** K = round(chiều cao máy / 360). Kích thước logic W×H đổi theo máy, bố cục bám cạnh, chừa vùng tai thỏ.
- Lưu riêng khóa `ttg_moi_v1` (localStorage). **Chưa nối online/Firebase.**

## Trạng thái
Khung + trận mẫu (Tuyết Cầu 1a đấu chính nó, 3 bậc đổi được). Quái dùng tạm thú 1a.

## Việc kế tiếp
1. Bạn thử trên điện thoại, báo dòng chữ nhỏ trên cùng (x? và W×H) + nút bấm có vừa tay không.
2. Đưa quái thật (`img-mobs-*`) vào.
3. Màn chọn thú, rồi mới tới các hệ thống khác.

## Chế độ HD (18/11/2026, thử nghiệm)
Mặc định BẬT. Canvas vẽ theo độ phân giải thật của máy (không còn pixel to x3) và dùng ảnh thú `-256` nếu có (hiện chỉ 1a và 6j), thiếu thì tự dùng ảnh 128. Thêm `?hd=0` vào link để tắt và so sánh với bản cũ. Chỉ sửa `game-moi/index.html` và hàm `draw` trong `51-thu-moi.js` (ảnh 256 vẽ nhỏ lại thì làm mượt); không đụng game chính.

Nút **Khung: HD 256 / 128** (cùng hàng với nút đổi bậc): bấm để đổi qua lại, nhớ lựa chọn (khóa `ttg_moi_hd`). `?hd=0` / `?hd=1` trên link vẫn ghi đè.

## Khung mới (19/11/2026)
- **Khung trên (chỗ thú đứng)** = `game-moi/khung-sanh.webp` (1843x830): có họa tiết "Danh Vọng" góc trái, ô tròn góc phải. Đã sửa chữ "Vộng" -> "Vọng" (xóa dấu mũ thừa bằng inpaint).
- **Khung dưới (hàng nút)** = `game-moi/khung-hang-nut.webp` (2126x740). Ô nút vuông nhỏ vẫn là `khung-nut.webp` (không đổi).
- Hai ảnh đã tách nền xanh, nền trong suốt. Số đo mảnh góc/độ dày viền khai ở `FRM` trong `game-moi/index.html`; thay ảnh khác thì chỉ cần sửa `FRM` (w,h,sl,sr,st,sb,e). Tỉ lệ vẽ tự tính để cao khít khung, chỉ giãn ngang mảnh giữa.
- Ảnh cũ `khung-game.webp` (ở gốc repo) không còn được game-moi dùng, chưa xóa.

## Nút vuông mới (19/11/2026)
- `khung-nut.webp` thay bằng khung vàng + nền sao (cắt từ ảnh mẫu nut-mau.png, ô giữa trong suốt, ảnh vuông 373x373). Ô trong suốt chiếm 21%-79% mỗi cạnh.
- Bỏ hộp nền nhỏ có viền; thay bằng quầng sáng mềm (`.nv-gl`, nhấp nháy chậm) + icon phát sáng (drop-shadow vàng/lam) + chữ trắng ngà viền nâu, phát sáng vàng. Chữ nằm trên lớp khung.
- Icon Balo (vàng cam + túi lam) và Thú Thần (dấu chân ngọc lam + ngọc vàng) vẽ lại màu sáng. Chỉnh độ sáng ở CSS `.nv-ic` (filter), `.nv-gl`, `.nv-tx` trong 52-nut-vuong.js; cỡ chữ Thú Thần ở 54-thu-than.js (`.8em`).
