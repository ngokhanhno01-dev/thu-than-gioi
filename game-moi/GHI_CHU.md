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
