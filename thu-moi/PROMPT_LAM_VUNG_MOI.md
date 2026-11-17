# PROMPT LÀM TRỌN MỘT VÙNG THÚ (dán nguyên nội dung dưới vào chat mới)

Đổi `<VÙNG>` / `<slug-vùng>` / số vùng cho đúng (vùng đang làm: 4 Lôi Vực, `loi-vuc`, đã có 10 prompt, chờ ảnh; vùng chưa làm tiếp theo: 5 Nguyệt Cung, `nguyet-cung`). Gửi kèm ẢNH VÙNG ngay trong tin nhắn đầu. File này là NGUỒN DUY NHẤT của khung prompt tạo ảnh (không chép khung sang file khác).

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
- Vẫn giữ: viền navy-đen dày, ĐỒNG ĐỀU cả 3 bậc, rõ ở Bậc 3; mỗi con 1 tên cho cả 3 bậc; cùng loài, cùng bảng màu và họa tiết chính ở 3 bậc. Dáng thú vẫn phải đọc rõ từ xa: chi tiết phủ lên thân, hiệu ứng nằm quanh, không che mặt và mắt.
- **CHỐT (bản mẫu Lôi Vực, đã được người dùng khen "prompt quá đỉnh, thú đẹp lắm"):**
  1. Bậc 2 và 3 KHÔNG phải bản phóng to của Bậc 1: Bậc 1 dáng chibi (đầu to, chi ngắn); Bậc 2 đổi tỉ lệ (đầu nhỏ lại, chi / cổ dài ra, mọc bộ phận mới); Bậc 3 là dáng trưởng thành hoàn toàn mới, silhouette mới. Mỗi con phải viết riêng bộ phận mới của Bậc 2 và Bậc 3.
  2. Mắt: Bậc 1 tròn to dễ thương; Bậc 2-3 DỮ TỢN (mắt hẹp xếch, gờ mày dày, đồng tử khe, mống mắt sáng, Bậc 3 dữ nhất), vẫn rõ ít nhất 3x2 pixel có điểm sáng.
  3. Bậc 3 chi tiết NHIỀU và ĐA DẠNG: mỗi vùng thân (đầu, cổ, vai, lưng, ngực, chi, đuôi) một kiểu chi tiết khác nhau, pha nhiều chất liệu, ít nhất 3 kiểu rune, ngọc nhiều cỡ, xích, tua, gai, vết nứt phát sáng, giáp nhiều lớp, chi tiết lệch đối xứng.
  4. Mỗi con có SURFACE DETAIL riêng (từng chiếc lông, vảy, mảnh giáp, đốt, đinh tán... tùy loài); mọi đường chi tiết liền nét, rộng tối thiểu 2 pixel, tương phản mạnh.
  5. Thân thú xen kẽ nhiều mảng ĐEN (obsidian, khoảng 35-40%) với màu chủ đạo vùng, để hiệu ứng và rune sáng nổi bật.
  6. Hiệu ứng "tia" (sét, gió, băng...) chỉ là nét MẢNH sạch khắc trên thân + vài tia ngắn LUÔN chạm vào thân; cấm biểu tượng to dẹt, mảng nhọn lớn, tia lơ lửng rời. Màu nhấn (vàng...) tối đa 10%.
- Hiệu ứng và rune vẽ bằng pixel ĐẶC (alpha cứng), không dùng quầng sáng mờ / trong suốt, vì công cụ tách nền cắt cứng nên quầng mờ sẽ bị cắt xấu.

## MÀU NỀN KHI TẠO ẢNH (chọn theo từng vùng để tách nền dễ)
Nguyên tắc: chọn nền có TÔNG NGƯỢC với màu chủ đạo của thú để tách nền dễ nhất. Nền là một màu phẳng, KHÁC hẳn mọi màu trên thú (kể cả màu nhạt, viền, hiệu ứng).
- Ví dụ: thú chủ đạo hồng / magenta (như Vân Đảo) thì dùng nền **tím xanh đậm** (khoảng `#4B4170`); thú chủ đạo xanh lam / xanh lá / trắng / vàng thì dùng nền **magenta** `#FF00FF`. Hai màu này là gợi ý hay dùng, KHÔNG bắt buộc: nếu thú có cả tím lẫn magenta, hoặc màu chủ đạo khác, chọn màu ngược tông khác cho hợp (xanh lá đậm, cam...), miễn không trùng màu nào trên thú.
- Sau khi nhìn ảnh vùng và bảng màu, nói rõ chọn nền nào và vì sao, ghi vào đầu file prompt. Dùng 1 màu nền cho cả vùng (10 con) để dễ kiểm.
- Công cụ tách nền nhận được MỌI màu nền phẳng (lấy màu ở 4 góc), không riêng magenta hay tím. Chỉ cần nền không lẫn vào thân thú.

## QUY TRÌNH
1. **Phân tích ảnh vùng** (mình gửi kèm): rút ra bảng màu (5-6 màu), hiệu ứng đặc trưng, họa tiết / rune hợp chủ đề, phụ kiện hợp vùng, màu nền nên dùng. Nếu mình CHƯA gửi ảnh vùng thì dừng lại và nhắc mình gửi.
2. **Bảng 10 thú**: tự kiểm đủ môi trường (trời, nước, mặt đất, lòng đất, thực vật, khe đá / giáp, thần thoại, linh khí, người nhỏ, boss), không trùng dáng, tối đa 1-2 vật thể sống, tên Hán-Việt hai từ bắt đầu bằng từ chủ đề vùng. Cột: Khung / Môi trường / Dáng. Hỏi mình 1 lần danh sách tên quái cũ của vùng để tránh trùng tên (hoặc dùng `search_code` tìm tên trong repo, không đọc cả `06-mobs.js`). Chờ mình gật.
3. **Soạn CẢ 10 prompt trong 1 lần** theo khung bên dưới (đọc thêm `thu-moi/MAU_PROMPT_1_CON.md`, mẫu đã được người dùng duyệt, bắt chước cấu trúc và độ chi tiết), lưu vào `thu-moi/<slug-vùng>/01-10-prompts.md` (1 commit) và **gửi thẳng FILE prompt này cho mình** bằng công cụ gửi file (mình làm trên điện thoại, không cần dán lại vào chat). Mình sẽ tạo ảnh bằng Canva hoặc Gemini rồi gửi lại nhiều ảnh một lượt.
4. **Nhận ảnh**: xử lý TẤT CẢ ảnh trong 1 lượt, xem bảng xem thử đúng 1 lần, nhận xét thật (điểm tốt, điểm chưa ổn, đủ chi tiết / rune / phụ kiện chưa, màu có đúng vùng không). Chỉ đề nghị làm lại khi lỗi nặng (Bậc 1 khác loài, mất mắt, sai màu vùng, Bậc 3 thiếu chi tiết hẳn); mỗi con tối đa 1 lần làm lại.
5. **Ghi chú + tiến độ**: mỗi lô 1 lần `push_files` gồm `thu-moi/<slug-vùng>/NN-slug.md` (khuôn ở mục 5 của hướng dẫn) + `thu-moi/<slug-vùng>/TIEN_DO_VUNG.md`. Khi xong cả vùng mới sửa `thu-moi/TIEN_DO.md` (đọc lại ngay trước khi sửa, cập nhật cả trạng thái PNG đã upload hay chưa).
6. **Khi đủ 10 con**: gửi mình đủ 10 PNG cuối để mình tự upload lên GitHub (công cụ GitHub của bạn không đẩy được PNG). KHÔNG nói đã đẩy PNG lên. Chỉ gửi bản cuối.

## XỬ LÝ ẢNH
Lấy `tools/xu_ly_anh_thu.py` bằng `get_file_contents` rồi `create_file` vào máy, chép nguyên văn, KHÔNG tự viết lại thuật toán. Chạy 1 lệnh cho cả lô:
`python3 -I xu_ly_anh_thu.py --batch /mnt/user-data/uploads <thư mục ra> --sheet <đường dẫn bảng>`
Script tự nhận nền magenta hay nền tím, tự xoá dấu sao Gemini ở góc dưới phải, giữ vùng tối bên trong thân, và ghép bảng xem thử (trái nền tối, phải nền sáng). Nhìn kỹ bên NỀN SÁNG tìm chỗ thủng. Dòng báo `dau sao: KHONG THAY` thì kiểm tra góc dưới phải ảnh gốc. Nếu ảnh có chỗ lớn rất gần màu nền (vì chọn nền trùng tông thú) thì báo mình để tạo lại với nền khác. Chi tiết các bẫy cũ: mục "Bẫy đã gặp" trong `thu-moi/XU_LY_ANH_VA_GIT.md`. Tên file ảnh: `<slug-vùng>-NN-slug.png` (slug không dấu, nối gạch).

## KHUNG PROMPT TẠO ẢNH (Canva / Gemini, tiếng Anh; đổi các phần trong <...>; BẢN CHỐT v4)
Mẫu hoàn chỉnh 1 con để bắt chước câu chữ: `thu-moi/MAU_PROMPT_1_CON.md` (Lôi Ưng). Bản đủ 10 con của một vùng: `thu-moi/loi-vuc/01-10-prompts.md`. Mỗi con phải tự viết riêng các phần <...>, KHÔNG dùng chung nội dung giữa các con.
```
Pokémon-style pixel art evolution line sprite sheet of a DIVINE SPIRIT BEAST
from a Vietnamese-Chinese cultivation (tu tien) fantasy game. ONE original
creature inspired by <KHUNG: stylized fantasy version, NOT a realistic copy,
add "NOT a deer / NOT a horse / NOT a phoenix" when needed> in 3 evolution
stages side by side in a single row, left to right = Stage 1 on the LEFT,
Stage 2 in the middle, Stage 3 on the RIGHT (largest). Wide landscape image,
three sections, all in side view facing left, all on the same ground line (or
floating if it flies), clear empty space between stages, nothing overlapping.

Art style: highly detailed pixel art, crisp hard pixel edges, NO blur. Every
effect (runes, crystals, clouds, sparks, <HIỆU ỨNG>) is drawn as solid opaque
pixel shapes, NO soft glow, NO halo, NO transparency, NO circle or aura behind
the creature. The SAME thick dark navy-black outline on ALL three stages, same
line weight, clearly visible on Stage 3 too. Rich cel shading with 5-6 shades
per color area. Palette: <near-black obsidian #0E0A1F (armor plates, underbelly,
horns, claws, patches of body, about 35-40% of the creature)>, <MÀU CHỦ ĐẠO
VÙNG, ghi từng màu + mã + chỗ dùng>, <MÀU NHẤN sáng cho rune / mắt / phụ kiện>.
Black and the main colors are interleaved in patches so the bright details pop
against the dark parts. NO <màu cấm, vd. màu trùng nền> anywhere on the creature.

SURFACE DETAIL (must be clearly visible on Stage 2 and especially Stage 3;
Stage 1 shows a simpler version of the same texture): <RIÊNG TỪNG LOÀI: EVERY
feather / scale / armor plate drawn individually..., ridges, fur strands,
segments, rivets, cracks>.
Creature concept: <DÁNG: số chân, sừng / mào / cánh, tư thế, khác các con trước>.
- Stage 1 (baby): chibi proportions: a very big round head, short stubby limbs,
  small soft rounded body, big round cute eyes, a few simple markings mixing
  black and the main color, one tiny accessory (<PHỤ KIỆN NHỎ>).
- Stage 2 (teen): NOT an enlarged copy of Stage 1. The body proportions CHANGE:
  smaller head relative to the body, longer limbs and neck, a leaner stronger
  build, sharper angular shapes, NEW body parts appear: <BỘ PHẬN MỚI Bậc 2>.
  Also glowing <màu nhấn> rune markings, <1-2 PHỤ KIỆN>, partial black ornamental
  armor, and a little of the region effect (<HIỆU ỨNG VÙNG>).
- Stage 3 (adult): NOT an enlarged copy of Stage 2. A completely mature, heroic,
  menacing body with a NEW silhouette: <BỘ PHẬN / SILHOUETTE MỚI Bậc 3>. It has
  the MOST DETAIL and the MOST VARIETY of all stages: every area of the body gets
  a DIFFERENT kind of detail (head, neck, shoulders, back, chest, limbs and tail
  each look different), mixing textures (fur / feather / scale / plate / stone),
  engraved patterns, at least three different rune scripts and patterns, gem
  inlays of different sizes, chains, tassels, spikes, bands, banners, glowing
  cracks, scars, layered armor of different materials, and asymmetrical details;
  ornate accessories (<PHỤ KIỆN VÙNG: necklace, earrings, anklets, bracers,
  crown, bells, lanterns, ribbons...>); many region effects (<HIỆU ỨNG VÙNG>)
  around it. Keep the silhouette and face readable: effects stay around the
  body, never cover the face or eyes.
EYES: Stage 1 has big round cute eyes with a bright highlight. Stages 2 and 3
have FIERCE, AGGRESSIVE eyes: narrow angled eyes under a heavy dark brow ridge
slanting down toward the nose, sharp slit-like pupils, a bright glowing iris, a
menacing glare (Stage 3 the most ferocious, with a thin light line). Every eye
is still clearly readable, at least 3x2 pixels, with a bright highlight on a
dark socket, same color on all stages. All 3 stages share the same species, the
same color scheme and the same key markings, but the body shape and proportions
evolve. Stage 1 is about half the height of Stage 3. Original design, NOT
resembling any existing Pokémon.

LINE RULE: all detail lines (engraved veins, rune lines, armor edges, feather
and scale edges) must be CLEAN, SHARP and CLEARLY VISIBLE: at least 2 pixels
wide, continuous (no broken scribbles), high contrast, bright lines drawn on the
black and dark parts, light edge lines on the dark parts. <Nếu vùng có tia
(sét / gió / băng): the effect is drawn as a few clean 2-pixel jagged lines
engraved along the body, plus a few short arcs that always TOUCH the creature or
link two crystals. NO messy thin scribbles floating around, NO big fat cartoon
icons, NO large wedge or spike shapes, NO detached floating bolts.> The accent
color covers at most 10% of the creature (small accents only); the body stays
mostly black and the main colors. Dense texture and many fine details are wanted
as long as the main silhouette and the face stay clear.

NO text, NO letters, NO numbers, NO writing anywhere (runes are abstract glyphs
only).

Background: <one flat solid MÀU NỀN NGƯỢC TÔNG, vd. vivid teal #00C2C2>. The
background color must NOT appear anywhere on the creature, not even as a tint.
No labels, no arrows, no shadow, no gradient, no frame.
```
Bài học vẫn dùng: Bậc 1 phải cùng loài với Bậc 3 (ghi rõ cùng loài, cùng màu, cùng họa tiết chính dù tỉ lệ khác); viền navy hay mỏng ở Bậc 3 (giữ câu "clearly visible on Stage 3 too"); sương / mây phải là hình đặc có viền; dáng 4 chân hay ra nai / ngựa (thêm "NOT a deer, NOT a horse"); màu ngoài palette thì ghi rõ tên màu và chỗ dùng; mỏ / móng / sừng ghi rõ màu; luôn có "NO text" (từng ra chữ thật trên giáp); luôn ghi Bậc 1 bên TRÁI (từng bị xếp ngược); cấm quầng tròn hồng / tím; tránh dáng giống Pokémon có sẵn (cá sấu đứng kiểu Totodile, thú bốn chân kiểu Suicune).
Chọn nền: màu chủ đạo của thú quyết định. Lôi Vực (đen / tím / vàng) dùng nền teal #00C2C2; Phong Nguyên (xanh ngọc) dùng magenta; Vân Đảo (hồng / tím) dùng tím xanh đậm.

## CÁCH TRẢ LỜI
Tiếng Việt, ngắn (tối đa 10 dòng), nói thẳng điểm chưa ổn, không kể từng bước. Mình làm trên điện thoại và hay hết quota nên gộp thao tác: nhiều file = 1 `push_files`, nhiều ảnh = 1 lệnh. Mình chê thì đừng cãi, đưa 2-3 hướng khác và chọn 1 kèm lý do.

Bắt đầu bằng bước 1.
