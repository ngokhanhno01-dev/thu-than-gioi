# Tiến độ làm thú mới (tổng quan; chi tiết từng vùng ở `thu-moi/<vùng>/TIEN_DO_VUNG.md`)

**Cập nhật: 17/11/2026.**

**Hoàn tất 6/17 vùng (60/170 thú): Tuyết Nguyên (đã LÀM LẠI bằng khung v4, 10 ảnh mới đã duyệt 17/11/2026; ảnh và ghi chú CŨ đã xóa khỏi nhánh), Sương Cốc, Vân Đảo, Phong Nguyên, Lôi Vực, Nguyệt Cung (PNG Nguyệt Cung chờ upload). Việc kế tiếp: upload PNG + ghi chú Tuyết Nguyên mới vào `thu-moi/tuyet-nguyen/` (hiện thư mục này đang trống trên nhánh); rồi làm vùng 6 Dương Sơn. Mẫu prompt chốt cho các vùng sau: `thu-moi/MAU_PROMPT_1_CON.md`.**

Vị trí file: Tuyết Nguyên bản MỚI là `thu-moi/tuyet-nguyen/tuyet-nguyen-NN-slug.png` + `tuyet-nguyen-NN-slug.md` (chờ upload). Từ Sương Cốc trở đi, PNG `<slug-vùng>-NN-slug.png` và ghi chú cùng nằm trong `thu-moi/<slug-vùng>/`.

Khi làm vùng mới: dán prompt trong `thu-moi/PROMPT_LAM_VUNG_MOI.md` (cũng là nguồn khung prompt tạo ảnh) vào chat mới, kèm ảnh vùng.

## 17 vùng (số z) và trạng thái

0 Tuyết Nguyên (XONG 10/10, làm lại v4, PNG mới chờ upload), 1 Sương Cốc (XONG 10/10, đủ PNG), 2 Vân Đảo (XONG 10/10, đủ PNG), 3 Phong Nguyên (XONG 10/10, đủ PNG), 4 Lôi Vực (XONG 10/10, đủ PNG), 5 Nguyệt Cung (XONG 10/10, PNG chờ upload), 6 Dương Sơn, 7 Huyền Uyên, 8 Kim Khoáng, 9 Ngọc Động, 10 Thanh Lâm, 11 Xích Hỏa Địa, 12 Hắc Ám Lâm, 13 Tử Tinh Hải, 14 Thiên Không, 15 Linh Hoa Viên, 16 Thần Điện.

## Tuyết Nguyên (làm lại v4)

10 con mới: Tuyết Cầu (chim cánh cụt), Tuyết Hùng (gấu), Băng Lộc (tuần lộc), Tuyết Báo (báo tuyết), Băng Hải (hải cẩu), Tuyết Cú (cú), Băng Dương (dê núi), Băng Linh (linh khí), Băng Nham (golem), Băng Sơn Cự Thú (boss, voi ma mút). Bảng màu: obsidian, royal blue, sky blue, ice white, cyan cực quang; nền tạo ảnh magenta. Chi tiết: `tuyet-nguyen/TIEN_DO_VUNG.md` (sau khi upload). Bản cũ (Tuyết Cầu, Tuyết Tinh, Tuyết Quang, Golem Băng Giá, Băng Đăng, Băng Kỳ Lân, Băng Tích, Tuyết Nhĩ, Băng Linh, Băng Sơn Cự Thú) đã xóa 17/11/2026 theo yêu cầu người dùng.

## Vân Đảo

10 con: Vân Hồ, Vân Điểu, Vân Kình, Vân Lân, Vân Quy, Vân Xà, Vân Phong, Vân Liên, Vân Tinh, Vân Thiên Long. Ảnh đã xử lý, có ghi chú, PNG đã upload (`thu-moi/van-dao/`). Bảng màu tím / hồng là hợp lệ của vùng này (ngoại lệ so với quy tắc cấm tím / hồng của vùng lạnh; tông màu theo từng vùng).

## Lôi Vực

10 con: Lôi Ưng, Lôi Ngư, Lôi Ngưu, Lôi Mãng, Lôi Cô, Lôi Giáp, Lôi Sư, Lôi Linh, Lôi Đồng, Lôi Vực Chiến Thần (boss). Bảng màu đen / tím / vàng, nền tạo ảnh teal. Chi tiết và điểm chưa ổn: `loi-vuc/TIEN_DO_VUNG.md`.

## Nguyệt Cung

10 con: Nguyệt Thố, Nguyệt Hạc, Nguyệt Thiềm, Nguyệt Đằng, Nguyệt Nga, Nguyệt Kình, Nguyệt Tượng, Nguyệt Quy, Nguyệt Tiên, Nguyệt Thực Tế Quân (boss, sói trăng). Nền cam, thú xanh / tím / bạc. Chi tiết: `nguyet-cung/TIEN_DO_VUNG.md`.

## Phong Nguyên

10 con: Phong Điệp, Phong Thiền, Phong Oa, Phong Miêu, Phong Ngạc, Phong Chu, Phong Tằm, Phong Thử, Phong Đường, Phong Nguyên Cổ Thú. Ảnh đã xử lý, có ghi chú; PNG đã upload vào `thu-moi/phong-nguyen/`. Bảng màu xanh ngọc / teal, mint, trắng băng, xanh lá, navy; nền tạo ảnh magenta. Nhắc: 05 Bậc 1 giống Totodile, 10 giống Suicune, 08 có chữ RUNE trên giáp (chi tiết ở `phong-nguyen/TIEN_DO_VUNG.md`).

## Bàn giao phiên sau

Prompt bàn giao: `thu-moi/PROMPT_PHIEN_TIEP.md`. Script hậu xử lý ảnh (xóa viền màu nền, đảo bậc, xóa sao sót): `tools/hau_xu_ly_anh_thu.py`. Lưu ý: `tools/xu_ly_anh_thu.py` (bước tách nền) hiện KHÔNG có trên nhánh; lần Tuyết Nguyên đã tự viết lại bước tách nền magenta.
