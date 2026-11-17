# PROMPT LÀM TRỌN MỘT VÙNG THÚ (dán nguyên nội dung dưới vào chat mới)

Đổi `<VÙNG>` / `<slug-vùng>` / số vùng cho đúng (vùng tiếp theo: 4 Lôi Vực, `loi-vuc`). Gửi kèm ẢNH VÙNG ngay trong tin nhắn đầu. File này là NGUỒN DUY NHẤT của khung prompt tạo ảnh (không chép khung sang file khác).

---

Mình làm game "Thú Thần Giới" (game nuôi và bắt thú tiên hiệp, pixel art). Repo GitHub: ngokhanhno01-dev/thu-than-gioi. Chỉ làm việc trên nhánh `ghi-chu-co-che-bat-thu-evo`, KHÔNG push `main`. Hãy làm trọn vùng <VÙNG> (10 thú) từ đầu đến cuối. Ảnh của vùng mình gửi kèm tin nhắn này.

## ĐỌC TRƯỚC (chỉ 3 file, đừng đọc gì khác)
1. `thu-moi/HUONG_DAN_LAM_THU_MOI.md` (quy tắc đã chốt, bài học)
2. `thu-moi/TIEN_DO.md`
3. `tools/xu_ly_anh_thu.py` (bản v2, xem mục Xử lý ảnh)
Lấy bằng `get_file_contents` với ref `refs/heads/ghi-chu-co-che-bat-thu-evo`. KHÔNG đọc file .js (nhất là `06-mobs.js`), không liệt kê thư mục gốc.

## ĐIỀU QUAN TRỌNG NHẤT (ghi đè hướng dẫn cũ)
Đây là game về THẦN THÚ, nên ảnh phải NHIỀU CHI TIẾT, uy nghi, như thú thần thật sự. Quy tắc cũ "chi tiết ít, khối đặc, Bậc 3 chỉ vài chi tiết thêm, không glow" ở mẫu prompt cũ BỊ BỎ. Cụ thể:
- **Bậc 3 phải thật nhiều chi tiết**: hoa văn chạm khắc, cổ ngữ / rune phát sáng chạy dọc thân, phụ kiện theo vùng (vòng cổ, bông tai, vòng chân, vòng tay, mão / vương miện, chuông, đèn lồng, ruy băng, ngọc...), giáp / khớp trang trí. Bậc 2 vừa phải (rune bắt đầu hiện + 1-2 phụ kiện). Bậc 1 ít chi tiết, dễ thương, nhưng cùng một họa tiết với Bậc 3.
- **Hiệu ứng theo vùng** xuất hiện quanh thú, nhiều nhất ở Bậc 3. Ví dụ: Vân Đảo = mây, pha lê tím, đảo bay; Tuyết Nguyên = tinh thể băng, bông tuyết. Vùng mới: lấy từ ảnh vùng mình gửi.
- **Tông màu theo vùng**: lấy từ ảnh vùng mình gửi, KHÔNG dùng một bảng màu chung. Quy tắc cũ "cấm tím/hồng" chỉ áp cho vùng lạnh; vùng nào ảnh nền có màu nào thì dùng màu đó.
- Vẫn giữ: viền navy dày, ĐỒNG ĐỀU cả 3 bậc, rõ ở Bậc 3; mắt to, dễ đọc, cùng kiểu mắt 3 bậc; Bậc 1 là bản thu nhỏ của Bậc 3 (cùng khung, số chân, sừng / mào); mỗi con 1 tên cho cả 3 bậc. Dáng thú vẫn phải đọc rõ từ xa: chi tiết phủ lên thân, hiệu ứng nằm quanh, không che mặt và mắt.
- Hiệu ứng và rune vẽ bằng pixel ĐẶC (alpha cứng), không dùng quầng sáng mờ / trong suốt, vì công cụ tách nền cắt cứng nên quầng mờ sẽ bị cắt xấu.

## MÀU NỀN KHI TẠO ẢNH (chọn theo từng vùng để tách nền dễ)
Nguyên tắc: chọn nền có TÔNG NGƯỢC với màu chủ đạo của thú để tách nền dễ nhất. Nền là một màu phẳng, KHÁC hẳn mọi màu trên thú (kể cả màu nhạt, viền, hiệu ứng).
- Ví dụ: thú chủ đạo hồng / magenta (như Vân Đảo) thì dùng nền **tím xanh đậm** (khoảng `#4B4170`); thú chủ đạo xanh lam / xanh lá / trắng / vàng thì dùng nền **magenta** `#FF00FF`. Hai màu này là gợi ý hay dùng, KHÔNG bắt buộc: nếu thú có cả tím lẫn magenta, hoặc màu chủ đạo khác, chọn màu ngược tông khác cho hợp (xanh lá đậm, cam...), miễn không trùng màu nào trên thú.
- Sau khi nhìn ảnh vùng và bảng màu, nói rõ chọn nền nào và vì sao, ghi vào đầu file prompt. Dùng 1 màu nền cho cả vùng (10 con) để dễ kiểm.
- Công cụ tách nền nhận được MỌI màu nền phẳng (lấy màu ở 4 góc), không riêng magenta hay tím. Chỉ cần nền không lẫn vào thân thú.

## QUY TRÌNH
1. **Phân tích ảnh vùng** (mình gửi kèm): rút ra bảng màu (5-6 màu), hiệu ứng đặc trưng, họa tiết / rune hợp chủ đề, phụ kiện hợp vùng, màu nền nên dùng. Nếu mình CHƯA gửi ảnh vùng thì dừng lại và nhắc mình gửi.
2. **Bảng 10 thú**: tự kiểm đủ môi trường (trời, nước, mặt đất, lòng đất, thực vật, khe đá / giáp, thần thoại, linh khí, người nhỏ, boss), không trùng dáng, tối đa 1-2 vật thể sống, tên Hán-Việt hai từ bắt đầu bằng từ chủ đề vùng. Cột: Khung / Môi trường / Dáng. Hỏi mình 1 lần danh sách tên quái cũ của vùng để tránh trùng tên (hoặc dùng `search_code` tìm tên trong repo, không đọc cả `06-mobs.js`). Chờ mình gật.
3. **Soạn CẢ 10 prompt trong 1 lần** theo khung bên dưới, lưu vào `thu-moi/<slug-vùng>/01-10-prompts.md` (1 commit) và **gửi thẳng FILE prompt này cho mình** bằng công cụ gửi file (mình làm trên điện thoại, không cần dán lại vào chat). Mình sẽ tạo ảnh bằng Canva hoặc Gemini rồi gửi lại nhiều ảnh một lượt.
4. **Nhận ảnh**: xử lý TẤT CẢ ảnh trong 1 lượt, xem bảng xem thử đúng 1 lần, nhận xét thật (điểm tốt, điểm chưa ổn, đủ chi tiết / rune / phụ kiện chưa, màu có đúng vùng không). Chỉ đề nghị làm lại khi lỗi nặng (Bậc 1 khác loài, mất mắt, sai màu vùng, Bậc 3 thiếu chi tiết hẳn); mỗi con tối đa 1 lần làm lại.
5. **Ghi chú + tiến độ**: mỗi lô 1 lần `push_files` gồm `thu-moi/<slug-vùng>/NN-slug.md` (khuôn ở mục 5 của hướng dẫn) + `thu-moi/<slug-vùng>/TIEN_DO_VUNG.md`. Khi xong cả vùng mới sửa `thu-moi/TIEN_DO.md` (đọc lại ngay trước khi sửa, cập nhật cả trạng thái PNG đã upload hay chưa).
6. **Khi đủ 10 con**: gửi mình đủ 10 PNG cuối để mình tự upload lên GitHub (công cụ GitHub của bạn không đẩy được PNG). KHÔNG nói đã đẩy PNG lên. Chỉ gửi bản cuối.

## XỬ LÝ ẢNH
Lấy `tools/xu_ly_anh_thu.py` bằng `get_file_contents` rồi `create_file` vào máy, chép nguyên văn, KHÔNG tự viết lại thuật toán. Chạy 1 lệnh cho cả lô:
`python3 -I xu_ly_anh_thu.py --batch /mnt/user-data/uploads <thư mục ra> --sheet <đường dẫn bảng>`
Script tự nhận nền magenta hay nền tím, tự xoá dấu sao Gemini ở góc dưới phải, giữ vùng tối bên trong thân, và ghép bảng xem thử (trái nền tối, phải nền sáng). Nhìn kỹ bên NỀN SÁNG tìm chỗ thủng. Dòng báo `dau sao: KHONG THAY` thì kiểm tra góc dưới phải ảnh gốc. Nếu ảnh có chỗ lớn rất gần màu nền (vì chọn nền trùng tông thú) thì báo mình để tạo lại với nền khác. Chi tiết các bẫy cũ: mục "Bẫy đã gặp" trong `thu-moi/XU_LY_ANH_VA_GIT.md`. Tên file ảnh: `<slug-vùng>-NN-slug.png` (slug không dấu, nối gạch).

## KHUNG PROMPT TẠO ẢNH (Canva / Gemini, tiếng Anh; đổi các phần trong <...>)
```
Pokémon-style pixel art evolution line sprite sheet of a DIVINE SPIRIT BEAST
from a Vietnamese-Chinese cultivation (tu tien) fantasy game. ONE original
creature inspired by <KHUNG> (a stylized fantasy version, NOT a realistic copy)
in 3 evolution stages side by side in a single row, left to right = Stage 1,
Stage 2, Stage 3. Wide landscape image, three sections, all in side view facing
left, all on the same ground line (or floating if it flies), clear empty space
between stages, nothing overlapping.

Art style: highly detailed pixel art, crisp hard pixel edges, NO blur. Every
effect (runes, crystals, mist, sparks) is drawn as solid opaque pixel shapes,
NO soft glow, NO transparency. The SAME thick dark navy outline on ALL three
stages, same line weight, clearly visible on Stage 3 too. Rich cel shading with
5-6 shades per color area. Palette: <BẢNG MÀU VÙNG, ghi từng màu và chỗ dùng>.

Creature concept: <CHẤT LIỆU + DÁNG, khác các con trước>
- Stage 1: a small cute baby version of Stage 3, same species, same silhouette
  and same number of legs / horns / crest, large eyes, a few simple markings,
  one tiny accessory (<PHỤ KIỆN NHỎ>).
- Stage 2: bigger and more elaborate: glowing rune markings starting to appear,
  <1-2 PHỤ KIỆN>, partial ornamental armor, a little of the region effect
  (<HIỆU ỨNG VÙNG>).
- Stage 3: the LARGEST and most majestic, a true divine beast with VERY RICH
  DETAIL: intricate engraved patterns across the body, ancient rune script
  running along the body and limbs, ornate accessories (<PHỤ KIỆN VÙNG: necklace,
  earrings, anklets, bracers, crown, bells, lanterns, ribbons...>), many
  region effects (<HIỆU ỨNG VÙNG>) floating around it. Keep the creature's
  silhouette and face readable: effects stay around the body, never cover the
  face or eyes.
EYES: on every stage the eye must be large and clearly readable, with a bright
highlight on a dark socket, at least 3x3 pixels, the same eye design on all 3
stages. All 3 stages share the same face, same patterns and same colors, each
stage clearly bigger and more elaborate than the previous. Stage 1 is about half
the height of Stage 3.

Background: one flat solid <MÀU NỀN NGƯỢC TÔNG VỚI THÚ, ví dụ pure magenta
#FF00FF hoặc dark blue-purple #4B4170>. The background color must NOT appear
anywhere on the creature, not even as a tint. No text, no labels, no arrows, no
shadow, no gradient, no frame.
```
Bài học vẫn dùng: Bậc 1 hay ra loài khác (ghi rõ là bản thu nhỏ của Bậc 3); viền navy hay mỏng ở Bậc 3 (giữ câu "clearly visible on Stage 3 too"); sương / mây phải là hình đặc có viền, không phải sương mờ; dáng 4 chân hay ra nai / ngựa (thêm "NOT a deer, NOT a horse" khi cần); màu ngoài palette thì ghi rõ tên màu và chỗ dùng; mỏ / móng / sừng ghi rõ màu để khỏi ra xám.

Bài học thêm từ Phong Nguyên (đưa vào prompt từng con): ghi rõ "NO text, NO letters, NO writing anywhere (runes are abstract glyphs only)" vì có con bị ra chữ thật; ghi rõ "all 3 stages in one row, Stage 1 on the LEFT, Stage 3 on the RIGHT" vì có ảnh bị xếp ngược; cấm quầng sáng / vòng tròn tím hồng quanh thú; mắt Bậc 3 phải to bằng Bậc 1-2, mở, có điểm sáng (không nhắm, không chấm trắng nhỏ); Bậc 3 phải có rune + phụ kiện (không chỉ có hiệu ứng); giữ chất liệu đúng khung (vd. vỏ cây, không ra băng / bạc); tránh dáng giống thú Pokémon có sẵn (cá sấu đứng kiểu Totodile, thú bốn chân kiểu Suicune): thêm nét riêng khác hẳn; Bậc 1 giữ cùng đặc điểm với Bậc 2-3 (đuôi, mũ, số chân).
Lôi Vực: tông chủ đạo dự kiến vàng / tím / xanh điện, nên nền KHÔNG dùng magenta hay tím (dễ lẫn rune tím); chọn sau khi xem ảnh vùng, gợi ý xanh lá đậm hoặc xanh teal đậm, và ghi rõ ở đầu file prompt.

## CÁCH TRẢ LỜI
Tiếng Việt, ngắn (tối đa 10 dòng), nói thẳng điểm chưa ổn, không kể từng bước. Mình làm trên điện thoại và hay hết quota nên gộp thao tác: nhiều file = 1 `push_files`, nhiều ảnh = 1 lệnh. Mình chê thì đừng cãi, đưa 2-3 hướng khác và chọn 1 kèm lý do.

Bắt đầu bằng bước 1.
