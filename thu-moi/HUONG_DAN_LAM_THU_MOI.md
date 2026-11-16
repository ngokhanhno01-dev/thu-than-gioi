# Hướng dẫn cho Claude: làm thú mới cho vùng Tuyết Nguyên (game "thu-than-gioi")

Tài liệu bàn giao giữa các phiên Claude. Đọc hết trước khi làm. Trả lời người dùng ngắn gọn bằng tiếng Việt, nói thẳng điểm chưa ổn của ảnh, không hỏi lại nhiều.

> Lưu ý: file `CLAUDE.md` ở nhánh `main` là hướng dẫn thay icon trang bị / nguyên liệu và dặn push thẳng lên `main`. **Việc thú mới này khác**: làm trên nhánh `ghi-chu-co-che-bat-thu-evo`, KHÔNG push lên `main`.

## 1. Bối cảnh
- Game đang thiết kế cơ chế mới: **Bắt thú theo vùng + Tiến hóa 3 bậc + Evo (ghép 2 con thành 1)**. Xem `THIET_KE_BAT_THU_EVO.md` (vẫn chỉ là ghi chú, CHƯA làm vào code).
- 17 vùng, mỗi vùng 10 thú. Đang làm **Tuyết Nguyên (vùng 0)**, đủ 10 con rồi mới sang vùng khác.
- Mỗi con có **3 bậc trong 1 ảnh xếp ngang** (trái → phải = Bậc 1 → 2 → 3).
- Người dùng tạo ảnh bằng **Canva Pro (AI)** theo prompt do Claude soạn, rồi gửi ảnh cho Claude. Claude kiểm ảnh, thêm vào nhánh, báo ngắn gọn và đề xuất con kế tiếp.

## 2. Tiến độ Tuyết Nguyên (10 con)

**Trạng thái: 9/10 xong (09 đã nhận ảnh, đã xử lý; chờ người dùng upload `09-bang-linh.png` + ghi chú lên nhánh). Kế tiếp: 10 (boss của vùng). Cập nhật lần cuối: 16/11/2026.**

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
| 10 | (chưa làm) | dự kiến: khổng lồ, kiểu boss của vùng | |

Ảnh nằm ở **thư mục gốc của nhánh**; ghi chú từng con ở `thu-moi/tuyet-nguyen/NN-slug.md` (đọc 1-2 file mẫu để làm theo).

## 3. Quy tắc người dùng đã chốt
1. **Mỗi con 1 tên duy nhất dùng chung cho cả 3 bậc**, không đặt tên riêng từng bậc. Bỏ chữ "Linh" ở cuối tên.
2. Tên kiểu Hán-Việt hai từ, ưu tiên bắt đầu bằng "Tuyết" / "Băng" cho hợp vùng (ngoại lệ do người dùng tự chọn: "Golem Băng Giá"). Không trùng tên con khác.
3. **Sáng tạo, không bám khuôn con vật có thật** (người dùng bỏ con nai vì "lấy khuôn thế giới động vật"). Pokémon rất đa dạng: **mỗi con phải khác dáng cơ thể** các con trước (tròn, đối xứng, uốn lượn, nặng hai chân, vật thể bay, bốn chân thần thoại...). Sinh thú thần thoại hoặc vật thể sống là ổn.
4. Phong cách: **pixel art kiểu Pokémon (Gen 5)**, sắc cạnh, viền navy dày, đổ bóng theo mảng, thân sáng. Người dùng từng chê: quá mịn, quá nhợt trắng, quá giống nai thật.
5. Người dùng thích nhất: Tuyết Cầu, Băng Đăng, Băng Kỳ Lân (liền khối, dễ nhìn, dễ thương hoặc ngầu). Từng chê hướng "các khối băng rời nhau" là xấu.

## 4. Prompt mẫu (đã chạy tốt, dán vào Canva rồi chỉ đổi đoạn "Creature concept")
```
Pokémon-style pixel art evolution line sprite sheet. ONE original fantasy
creature (NOT based on any real animal) in 3 evolution stages side by side in a
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
- Ảnh: `NN-slug.png` ở **thư mục gốc**. Ghi chú: `thu-moi/tuyet-nguyen/NN-slug.md` gồm: vùng, loài + mô tả dáng, tên (1 tên chung), ảnh (file, kích thước, nền trong suốt chưa, đã xoá dấu sao chưa), đặc điểm hình ảnh từng bậc, lưu ý khi cắt (hiệu ứng ngoài thân, điểm cần chừa lề, điểm lệch phong cách).
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
