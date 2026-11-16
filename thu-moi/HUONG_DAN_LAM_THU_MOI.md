# Hướng dẫn cho Claude: làm thú mới cho vùng Tuyết Nguyên (game "thu-than-gioi")

Tài liệu bàn giao giữa các phiên Claude. Đọc hết trước khi làm. Trả lời người dùng ngắn gọn bằng tiếng Việt, nói thẳng điểm chưa ổn của ảnh, không hỏi lại nhiều.

> Lưu ý: file `CLAUDE.md` ở nhánh `main` là hướng dẫn thay icon trang bị / nguyên liệu và dặn push thẳng lên `main`. **Việc thú mới này khác**: làm trên nhánh `ghi-chu-co-che-bat-thu-evo`, KHÔNG push lên `main`.

## 1. Bối cảnh
- Game đang thiết kế cơ chế mới: **Bắt thú theo vùng + Tiến hóa 3 bậc + Evo (ghép 2 con thành 1)**. Xem `THIET_KE_BAT_THU_EVO.md` (vẫn chỉ là ghi chú, CHƯA làm vào code).
- 17 vùng, mỗi vùng 10 thú. Người dùng muốn làm **cả 17 vùng**, lần lượt từng vùng, từng con một, đủ 10 con rồi mới sang vùng kế. **Tuyết Nguyên (vùng 0) đã xong 10/10. Đang làm Sương Cốc (vùng 1)**, xem mục 2b. Danh sách 17 vùng ở `CLAUDE.md` của `main`; chủ đề / quái / lore từng vùng ở `VAN_KIEP_ZONES` trong `06-mobs.js`.
- Mỗi con có **3 bậc trong 1 ảnh xếp ngang** (trái → phải = Bậc 1 → 2 → 3).
- Người dùng tạo ảnh bằng **Canva Pro (AI)** theo prompt do Claude soạn, rồi gửi ảnh cho Claude. Claude kiểm ảnh, thêm vào nhánh, báo ngắn gọn và đề xuất con kế tiếp.

## 2. Tiến độ Tuyết Nguyên (10 con)

**Trạng thái: Tuyết Nguyên 10/10 xong (08, 09, 10 đã gửi; kiểm remote xem ảnh `08`-`10` đã upload đủ chưa). Vùng kế: Sương Cốc, xem mục 2b. Cập nhật lần cuối: 16/11/2026.**

| # | Tên (1 tên chung cả 3 bậc) | Ý tưởng / dáng | Ảnh |
|---|---|---|---|
| 01 | Tuyết Cầu | quả cầu tuyết tròn, dễ thương | `01-tuyet-cau.png` |
| 02 | Tuyết Tinh | bông tuyết sáu cánh, đối xứng góc cạnh | `02-tuyet-tinh.png` |
| 03 | Tuyết Quang | thân dài uốn lượn (cực quang) | `03-tuyet-quang.png` |
| 04 | Golem Băng Giá | golem đá nặng, đứng hai chân | `04-golem-bang-gia.png` |
| 05 | Băng Đăng | đèn lồng băng biết bay | `05-bang-dang.png` |
| 06 | Băng Kỳ Lân | kỳ lân thần thoại bốn chân, chạy nhanh | `06-bang-ky-lan.png` |
| 07 | Băng Tích | bò sát băng thân dài thấp, đuôi dài đầu pha lê, hàng gai băng dọc lưng, có hiệu ứng bông tuyết / tia sáng / sương mũi. Chỉ 4 chân (chưa đủ 6 như dự định, người dùng chưa yêu cầu sửa). Bậc 3 lấy từ bản hàng dưới (ngậm miệng) | `07-bang-tich.png` |
| 08 | Tuyết Nhĩ | nấm tuyết: mũ tròn xoè rộng nhiều nếp lượn như tai, thân ngắn mập, hai chân nhỏ. Dáng ô rộng, khác Tuyết Cầu (quả cầu). Bậc 3 mũ nhiều tầng + sừng pha lê. Chưa ổn: bông tuyết tím-hồng, chớp sáng đè mắt phải Bậc 3, Bậc 1-2 nhìn thẳng | `08-tuyet-nhi.png` |
| 09 | Băng Linh | linh hồn băng nhỏ nhắn đội mũ trùm pha lê, áo choàng, mang đèn lồng và gậy / trượng; dáng người đứng thẳng, mảnh. Tên do người dùng đổi từ "Tuyết Lữ". Chưa ổn: không quay trái hẳn, đèn lồng gần Băng Đăng | `09-bang-linh.png` |
| 10 | Băng Sơn Cự Thú (boss) | khổng lồ làm toàn bằng tinh thể băng ghép lại, dáng golem hai chân (người dùng biết trùng dáng với 04, chọn giữ). Tên 4 từ là chủ ý. Chưa ổn: mắt Bậc 3 khó đọc, vụn băng ám tím | `10-bang-son-cu-thu.png` |

Ảnh nằm ở **thư mục gốc của nhánh**; ghi chú từng con ở `thu-moi/tuyet-nguyen/NN-slug.md` (đọc 1-2 file mẫu để làm theo).

## 2b. Tiến độ Sương Cốc (vùng 1)

**Trạng thái: 1/10 xong (01 Vụ Hồ đã thêm vào nhánh). Bảng 10 con đã được làm lại lần 2 sau khi người dùng đổi cơ chế sang cho phép khuôn động vật (bản đầu "Sương Lộ / giọt sương" bị bỏ vì quá đơn giản); người dùng cần xác nhận bảng này (chưa phản đối). Vụ Hồ xong (người dùng chấp nhận các điểm nhỏ, đã thay bằng bản tách từ ảnh gốc 1376×768), con kế: 02 Sương Ngư (cá chép, chờ người dùng đồng ý và soạn prompt). Cập nhật lần cuối: 16/11/2026.**

Chủ đề: sương dày, rêu, khe đá, ngọc xanh. Buff vùng: Hồi phục. Bảng màu: xanh ngọc đậm (deep teal), xanh ngọc (jade green), xanh rêu, xám xanh của sương, trắng sương, viền navy. Cấm tím / hồng. Quái cũ của vùng (không đặt tên trùng, và nên chọn con vật khung khác: quái cũ đã dùng nai, dơi, bò, ếch, cóc, nhện): Sương Vũ Lộc, Mù Sương Dơi, Vụ Giáp Ngưu, Bạch Thủy Ếch, Sương Nham Thiềm, Sương Mộc Nhện, Vạn Trượng Vụ Thú.

| # | Tên | Con vật khung | Môi trường | Dáng cơ thể | Ảnh |
|---|---|---|---|---|---|
| 01 | Vụ Hồ (xong) | cáo | mặt đất | thú bốn chân nhỏ nhanh nhẹn, tai to, đuôi xù như sương, dễ thương | `suong-coc-01-vu-ho.png` |
| 02 | Sương Ngư | cá chép | dưới nước | cá nhìn ngang, vây như lá, đuôi dải sương, vảy ngọc | |
| 03 | Sương Xuyên | tê tê | lòng đất | thú bốn chân thấp cuộn tròn được, vảy đá phủ rêu, móng đào | |
| 04 | Vụ Điệp | bướm đêm | trên trời (côn trùng) | cánh rộng đối xứng, vảy cánh là sương, râu lông vũ | |
| 05 | Vụ Hạc | hạc | chim cao, lội nước | chim cao thanh mảnh, cổ dài, cánh xoè, đuôi như dải sương | |
| 06 | Vụ Long | rồng thần thoại | trời / nước | thân dài uốn lượn, bốn chân ngắn, râu và bờm sương | |
| 07 | Lục Giáp | bọ cánh cứng | khe đá (côn trùng giáp) | sáu chân, dáng thấp rộng, vỏ giáp ngọc, sừng | |
| 08 | Vụ Quy | rùa | đầm sương (bò sát) | thân tròn nặng, mai phủ rêu và cây nhỏ, chân to | |
| 09 | Sương Viên | vượn | cây rừng sương | thú có vú đứng thẳng, tay dài, đuôi cuộn, lông sương | |
| 10 | Vạn Trượng Vụ Thú | thú ghép giả tưởng | boss | thú khổng lồ bốn chân bằng sương và đá, giữ tên boss cũ của vùng | |

Ghi chú từng con để ở `thu-moi/suong-coc/NN-slug.md` (tạo thư mục mới cho vùng này; ảnh vẫn để ở thư mục gốc của nhánh).

## 3. Quy tắc người dùng đã chốt
1. **Mỗi con 1 tên duy nhất dùng chung cho cả 3 bậc**, không đặt tên riêng từng bậc. Bỏ chữ "Linh" ở cuối tên.
2. Tên kiểu Hán-Việt hai từ, ưu tiên bắt đầu bằng "Tuyết" / "Băng" cho hợp vùng (ngoại lệ do người dùng tự chọn: "Golem Băng Giá"). Không trùng tên con khác.
3. **CƠ CHẾ MỚI (người dùng sửa lại 16/11/2026, thay quy tắc cũ "không bám khuôn con vật thật"): ĐƯỢC lấy hình dáng động vật thật, côn trùng, chim, bò sát, cá, thú có vú, và cả con vật giả tưởng / thần thoại** làm khung cho thú. Lý do: thiết kế dạng vật thể / giọt sương quá đơn giản, thêm chi tiết cỡ nào cũng không ổn. Vẫn phải **tạo hình riêng của game** (pixel Gen 5, chất liệu và họa tiết theo chủ đề vùng, không phải bản sao thật). Pokémon rất đa dạng: **mỗi con phải khác dáng cơ thể** các con trước (tròn, đối xứng, uốn lượn, nặng hai chân, bay, bốn chân...). Ghi chú: người dùng từng bỏ con nai ở Tuyết Nguyên vì quá giống thật, nên vẫn thêm nét riêng (sừng / vảy / cánh / hoa văn theo chủ đề vùng), đừng vẽ y nguyên con vật.
4. Phong cách: **pixel art kiểu Pokémon (Gen 5)**, sắc cạnh, viền navy dày, đổ bóng theo mảng, thân sáng. Người dùng từng chê: quá mịn, quá nhợt trắng, quá giống nai thật.
5. Người dùng thích nhất: Tuyết Cầu, Băng Đăng, Băng Kỳ Lân (liền khối, dễ nhìn, dễ thương hoặc ngầu). Từng chê hướng "các khối băng rời nhau" là xấu.

## 3b. NGUYÊN TẮC ĐA DẠNG (người dùng nhấn mạnh, BẮT BUỘC cho mọi vùng, không để người dùng nhắc lại)
Mục tiêu: bộ 10 con của MỖI vùng phải **đa dạng như Pokémon**, loài nào cũng có, không lặp ý. Người dùng đã chê bản đề xuất đầu của Sương Cốc vì "toàn đồ vật (chuông, gương, hồ lô, lá), đơn điệu".
1. **Phủ đủ môi trường sống** trong 10 con của một vùng: trên trời (bay lượn), dưới nước, mặt đất / cỏ, lòng đất (đào hang), thực vật (cây / hoa biết đi), khe đá / giáp trụ (côn trùng-giáp), thần thoại (rồng, kỳ thú), linh khí / ma quái / vật thể sống (chuông, đèn, bóng), người nhỏ / tiểu đồng, và 1 boss khổng lồ. Mỗi con ghi rõ **môi trường** và **dáng cơ thể** trong bảng đề xuất.
2. **Mỗi con một kiểu cơ thể khác nhau** trong cùng vùng: giọt tròn, nhìn ngang kiểu cá, bốn chân thấp, cánh rộng, đứng thẳng, thân dài uốn lượn, sáu chân, lơ lửng, hai chân, thú lớn... Không có hai con cùng dáng. Cũng tránh trùng dáng với vùng trước (vd Golem Băng Giá và Băng Sơn Cự Thú đã trùng dáng golem, người dùng chấp nhận nhưng không muốn lặp lại).
3. **Hạn chế vật thể sống** (chuông, đèn lồng, gương, giọt nước...): tối đa 1-2 con trong 10 con, và nên có tay chân / mặt rõ. Phần lớn là **sinh vật thật hoặc giả tưởng**: thú có vú, chim, cá, bò sát, côn trùng, rồng... (người dùng đã chê dạng giọt sương "quá đơn giản").
4. **Được lấy khuôn động vật** (xem quy tắc 3 mục 3): chọn con vật làm khung theo môi trường rồi gắn chất liệu / họa tiết của vùng (vd cáo có đuôi sương, tê tê vảy đá rêu, bướm đêm cánh sương). Nhớ nêu tên con vật làm khung trong bảng đề xuất.
5. **Chủ đề vùng quyết định chất liệu và màu**, không quyết định dáng: dáng phải đa dạng, còn chất liệu, bảng màu, họa tiết đồng bộ theo vùng (Tuyết Nguyên = băng; Sương Cốc = sương, rêu, ngọc xanh). Tên Hán-Việt hai từ, bắt đầu bằng từ chủ đề vùng (Tuyết / Băng; Sương / Vụ ...), trừ boss có thể giữ tên boss cũ của vùng (`VAN_KIEP_ZONES`).
6. **Trước khi đề xuất bảng 10 con**, tự kiểm: (a) đủ môi trường chưa, (b) có hai con trùng dáng không, (c) quá nhiều vật thể không, (d) tên trùng quái / thú cũ không (đối chiếu `06-mobs.js`, tên file `img-mobs-*`). Đề xuất một bảng 10 con có cột Con vật khung + Môi trường + Dáng, cho người dùng chốt, rồi làm từng con (một con một lần).
7. Prompt cho mỗi vùng: chép prompt mẫu ở mục 4, ĐỔI bảng màu sang tông của vùng (vẫn cấm tím / hồng / chớp sáng đè mắt, thêm "NO neutral grey" nếu vùng không dùng xám), đổi phần "Creature concept" theo môi trường và dáng.

## 4. Prompt mẫu (đã chạy tốt, dán vào Canva rồi chỉ đổi đoạn "Creature concept")
```
Pokémon-style pixel art evolution line sprite sheet. ONE original creature
inspired by <TÊN CON VẬT KHUNG> (a stylized fantasy version, not a realistic copy) in 3 evolution stages side by side in a
single row, left to right = Stage 1, Stage 2, Stage 3. Wide landscape image,
three equal sections, all facing left, all on the same ground line (or floating
if the creature flies), clear empty space between stages, nothing overlapping.

Art style: Gen 5 Pokémon battle sprite quality, crisp hard pixel edges, NO
anti-aliasing, NO blur, NO glow, NO semi-transparent effects, every pixel fully
opaque. The SAME thick dark navy outline on ALL three stages, same line weight.
Rich cel shading with 5-6 shades per color area. Palette strictly: deep navy,
royal blue, sky blue, cyan, ice white. The body must stay bright: mainly sky
blue, cyan and ice white, use dark navy only for the outline and small
shadows. No purple, no pink, no grey.

Creature concept: <MÔ TẢ CON MỚI: chất liệu + dáng cơ thể khác các con trước>
- Stage 1: <nhỏ, dễ thương, mắt tròn to>
- Stage 2: <lớn hơn, chi tiết hơn, dáng khác Bậc 1>
- Stage 3: <to nhất, uy nghi, hiệu ứng ít và đặc (pixel đặc)>
EYES: on every stage the eye must be large and clearly readable: bright cyan
with a white highlight on a dark navy socket, at least 3x3 pixels, visible
even at small size. The same eye design on all 3 stages.
All 3 stages share the same face, the same eyes and the same colors, each
stage clearly bigger and more elaborate than the previous one.
Size: Stage 1 is about half the height of Stage 3.

Background: one flat solid pure magenta (#FF00FF). No text, no labels,
no arrows, no shadow, no frame.
```
Bài học đã gộp vào prompt mẫu: viền lệch giữa các bậc (Tuyết Quang), thân quá tối (Golem), mắt mất ở Bậc 2-3 (Băng Đăng), hiệu ứng mờ trong suốt và pixel tím lẻ (nai đầu tiên), dáng bốn chân bị ra giống nai/ngựa (thêm "NOT a deer, NOT a horse" khi cần). Màu lục cho cực quang mà Canva vẫn bỏ qua: nếu cần màu ngoài palette thì ghi rõ tên màu và chỗ dùng.

## 5. Quy trình khi nhận ảnh từ người dùng
Ảnh nằm ở `/mnt/user-data/attachments/...` (đường dẫn trong tin nhắn). Công cụ có sẵn: numpy, scipy, PIL, cv2; Bash không cài được gói mới. File tạm để trong thư mục scratchpad của phiên.
1. Kiểm tra: kích thước, chế độ, alpha, các mảnh rời (`scipy.ndimage.label` trên alpha > 16). 
2. **Dấu sao hồng ở góc dưới phải** (mảnh rời màu ~ (252,130,248), khoảng x>=640, y>=340 trên ảnh 688×384) là dấu trình tạo ảnh: **xoá** (xoá mảnh đó, nở 2px). Các mảnh rời khác (bong bóng, mảnh băng, bông tuyết nhỏ, vạch bóng đổ) là thiết kế: **giữ**.
3. Nếu ảnh còn **nền magenta** (~(248,3,250), nhiễu nhẹ): tách theo khoảng cách màu `< 70` tới nền (tính cả lỗ kín như vòng đuôi), alpha **cứng 0/255**, không làm mờ.
   - Pixel viền ám tím do nền: chỉ những pixel cách nền ≤ 3px có `R-G > 40` và `B-G > 20` mới tô lại bằng màu viền (10,14,134). **ĐỪNG dùng ngưỡng lỏng** (như `R-G > 8`): màu viền navy thật của ảnh là xanh hơi tím (tới ~(39,23,156)), ngưỡng lỏng sẽ tô nhầm hàng nghìn pixel viền và phá viền.
   - Cắt sát bounding box, chừa lề ~24px.
   - **Không thu nhỏ** ảnh (không có lưới pixel đều, thu nhỏ làm viền mờ). Nếu người dùng cần đúng 688×384 hoặc cần cắt riêng 3 bậc thì làm theo yêu cầu và nói rõ.
4. **Soi trước khi commit:** dựng ảnh xem thử trên nền tối VÀ nền sáng, phóng to vài chỗ viền, đếm lại mảnh rời. Đọc ảnh xem thử 1 lần, không xem từng file riêng.
5. Nhận xét thật với người dùng: điểm tốt và điểm chưa ổn (viền lệch, mắt khó đọc, thân tối, hợp phong cách game chưa...). Đừng nói quá.

## 6. Thêm vào nhánh (git)
- Ảnh: `NN-slug.png` ở **thư mục gốc** (với vùng khác Tuyết Nguyên, số NN là số con trong vùng nên dễ trùng tên file: đặt `<slug-vùng>-NN-slug.png`, vd `suong-coc-01-suong-lo.png`; Tuyết Nguyên giữ nguyên tên cũ). Ghi chú: `thu-moi/<slug-vùng>/NN-slug.md` (vd `thu-moi/tuyet-nguyen/`, `thu-moi/suong-coc/`) gồm: vùng, loài + mô tả dáng, tên (1 tên chung), ảnh (file, kích thước, nền trong suốt chưa, đã xoá dấu sao chưa), đặc điểm hình ảnh từng bậc, lưu ý khi cắt (hiệu ứng ngoài thân, điểm cần chừa lề, điểm lệch phong cách).
- Slug = tên không dấu nối gạch: "Băng Kỳ Lân" → `bang-ky-lan`.
- Quyền ghi: gọi `add_repo` với `access:"push"`, clone `--depth 1` vào `/home/claude/thu-than-gioi`. Lấy nhánh bằng `git fetch --depth=20 origin ghi-chu-co-che-bat-thu-evo` rồi `git checkout -B ghi-chu-co-che-bat-thu-evo FETCH_HEAD` (không dùng `origin/...` vì fetch kiểu này không tạo tham chiếu).
- Mỗi con một commit, tiếng Việt, kết thúc bằng 2 dòng Co-Authored-By / Claude-Session theo system-reminder của phiên. Đẩy bằng `git -c push.negotiate=true push origin ghi-chu-co-che-bat-thu-evo`, rồi kiểm lại bằng `git ls-remote origin refs/heads/ghi-chu-co-che-bat-thu-evo` so với `git rev-parse HEAD`.
- Bẫy đã gặp: (a) `git rm` file cuối trong thư mục làm mất thư mục, phải `mkdir -p` trước khi ghi file mới; (b) hook báo "unpushed commits / no remote branch" dù đã đẩy thành công: sửa bằng `git config --add remote.origin.fetch '+refs/heads/ghi-chu-co-che-bat-thu-evo:refs/remotes/origin/ghi-chu-co-che-bat-thu-evo'`, `git fetch origin` nhánh đó rồi `git branch -u origin/ghi-chu-co-che-bat-thu-evo`.
- Không bao giờ nói đã đẩy nếu chưa kiểm remote.

## 7. Nhịp làm việc mỗi con
Đề xuất ý tưởng + dáng (nhấn mạnh khác con trước) → soạn prompt từ mẫu ở mục 4 → người dùng làm ảnh trên Canva và gửi lại → kiểm + tách nền/xoá dấu sao → thêm vào nhánh → báo ngắn (file, commit, nhận xét thật) → đề xuất con kế tiếp. Khi người dùng nói "xấu", đừng cãi: đưa 2-3 hướng khác và chọn 1 hướng mạnh nhất, nêu vì sao.

**Yêu cầu của người dùng (16/11/2026): sau MỖI bước, Claude tự cập nhật bảng tiến độ ở mục 2 (dòng "Trạng thái" và dòng của con đang làm), không đợi người dùng nhắc.** Các mốc cần cập nhật: người dùng chọn hướng thiết kế, đã soạn prompt, nhận ảnh, đã thêm ảnh + ghi chú vào nhánh, chuyển sang con kế tiếp. Nếu người dùng không nói gì mà phiên mới bắt đầu, đọc file này để biết đang ở bước nào và cập nhật cho đúng.

## 8. Việc còn lại sau khi đủ 10 con
- Chốt các câu hỏi mở trong `THIET_KE_BAT_THU_EVO.md` (Evo có 3 bậc không, công thức ghép, tỉ lệ bắt, thú/trứng/thuộc hạ/boss hiện tại giữ hay bỏ).
- Chốt cách cắt ảnh 3 bậc thành sprite riêng, xử lý vạch bóng đổ, kích thước sprite trong game (sprite thú hiện có là 128×128, `img-mobs-*.png`).
- Làm tiếp các vùng khác theo cùng quy trình (danh sách 17 vùng ở `CLAUDE.md` của `main`).
