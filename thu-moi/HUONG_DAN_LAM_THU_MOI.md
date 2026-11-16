# Làm thú mới cho game thu-than-gioi (ĐỌC FILE NÀY + `thu-moi/TIEN_DO.md` + file tiến độ của vùng, XONG, đừng đọc gì khác)

Trả lời ngắn (tối đa 10 dòng) bằng tiếng Việt, nói thẳng điểm chưa ổn. Làm trên nhánh `ghi-chu-co-che-bat-thu-evo`, KHÔNG push `main`.

## 0. Tiết kiệm quota (bắt buộc)
- KHÔNG liệt kê thư mục gốc (hàng trăm ảnh). Chỉ `get_file_contents` đường dẫn trực tiếp; chỉ được liệt kê `thu-moi/<vùng>`.
- KHÔNG đọc: mọi file `.js` (nhất là `06-mobs.js`), `GHI_CHU_*.md`, `THIET_KE_BAT_THU_EVO.md` (chỉ khi người dùng hỏi cơ chế), ghi chú các con cũ, file `NN-MM-prompts.md` đã soạn, file vừa tự ghi.
- Không dùng danh sách việc (TaskCreate), không kể từng bước, không in lại nội dung dài.
- Gộp: nhiều file = 1 `push_files`; nhiều ảnh = 1 lệnh Bash, 1 lần xem preview, 1 lần SendUserFile.

## 1. Bối cảnh
Game có Bắt thú theo vùng + Tiến hóa 3 bậc + Evo. 17 vùng x 10 thú. Mỗi con = 1 ảnh xếp ngang 3 bậc (trái -> phải = Bậc 1 -> 2 -> 3). Người dùng làm ảnh bằng Canva Pro (AI) theo prompt Claude soạn, gửi ảnh lại; Claude tách nền, ghi chú. Claude KHÔNG tự tạo được ảnh. PNG lên nhánh do người dùng tự upload (công cụ GitHub chỉ đẩy file văn bản).

## 2. Quy tắc người dùng đã chốt
1. Mỗi con 1 tên cho cả 3 bậc, Hán-Việt hai từ, bắt đầu bằng từ chủ đề vùng. Boss giữ tên boss cũ. Không trùng quái cũ (danh sách ở file tiến độ vùng).
2. Được lấy khuôn động vật (thật / thần thoại) làm khung nhưng phải có nét riêng theo vùng; không vẽ y nguyên (từng bỏ con nai vì quá giống thật).
3. Đa dạng như Pokémon: phủ đủ môi trường (trời, nước, mặt đất, lòng đất, thực vật, khe đá/giáp, thần thoại, linh khí, người nhỏ, boss), mỗi con một dáng khác nhau; vật thể sống tối đa 1-2 con / vùng.
4. Phong cách pixel art Gen 5 Pokémon: sắc cạnh, viền navy dày đồng đều 3 bậc, đổ bóng theo mảng, thân sáng. Chê: quá mịn, quá nhợt trắng, các khối rời nhau. Thích: Tuyết Cầu, Băng Đăng, Băng Kỳ Lân (liền khối).
5. Chủ đề vùng quyết định chất liệu + bảng màu, không quyết định dáng. Cấm tím / hồng, chớp sáng đè mắt.
6. Người dùng nói xấu: đừng cãi, đưa 2-3 hướng khác, chọn 1 và nói vì sao.
7. Bảng 10 con của vùng mới: tự kiểm đủ môi trường, không trùng dáng, ít vật thể, tên không trùng quái cũ; cột Khung / Môi trường / Dáng.

## 3. Làm THEO LÔ (đây là chỗ tăng tốc, không làm từng con một)
**Lô A, soạn prompt:** soạn TẤT CẢ prompt còn lại của vùng trong 1 file `thu-moi/<vùng>/NN-MM-prompts.md` (1 commit). Báo người dùng chạy Canva song song, gửi nhiều ảnh một lượt. Vùng mới: đề xuất bảng 10 con trước (mục 2.7), người dùng gật là soạn luôn cả 10 prompt.
**Lô B, nhận ảnh:** người dùng gửi 1 hoặc nhiều ảnh. Làm tất cả trong một lượt: chạy script (mục 4) cho từng ảnh trong 1 lệnh Bash; xem preview đúng 1 lần (ghép nhiều preview thành 1 ảnh nếu nhiều con); SendUserFile gửi mọi PNG; `push_files` mọi ghi chú ngắn (mục 5) + file tiến độ vùng. Báo ngắn.
**Chấp nhận đủ dùng:** chỉ đề nghị làm lại khi lỗi nặng (Bậc 1 khác hẳn loài, mất mắt, nền lẫn nặng, sai vùng màu). Lỗi nhỏ ghi 1 dòng, không làm lại. Mỗi con tối đa 1 lần làm lại.
**Song song nhiều Claude:** được, miễn mỗi phiên một vùng, chỉ sửa `thu-moi/<vùng>/`. Chỉ sửa `thu-moi/TIEN_DO.md` khi xong cả vùng, và đọc lại ngay trước khi sửa.

Sau MỖI lô, cập nhật file tiến độ của vùng (`thu-moi/<vùng>/TIEN_DO_VUNG.md`), gộp chung trong push_files của lô đó.

## 4. Xử lý ảnh bằng script (1 lệnh/ảnh, không tự viết code)
Ảnh người dùng ở `/mnt/user-data/uploads/...`. Lấy script 1 lần mỗi phiên: `get_file_contents tools/xu_ly_anh_thu.py` (ref nhánh) rồi Write ra scratchpad. Chạy:
`python3 -I <scratchpad>/xu_ly_anh_thu.py <ảnh vào> <scratchpad>/<slug-vùng>-NN-slug.png --preview <scratchpad>/xem-NN.png`
Ảnh người dùng đã tự xóa nền (RGBA) thì thêm `--rgba`. Script tự: xóa dấu sao góc dưới phải, tách nền magenta, tô lại viền ám tím, alpha cứng, bỏ mảnh rời nhỏ, cắt sát chừa lề 24px, KHÔNG thu nhỏ; in bảo cáo (kích thước, số mảnh, số cụm; mong đợi cụm = 3). Soi preview (nền tối + sáng): viền, mắt, pixel tím lẻ. Gửi PNG cho người dùng bằng SendUserFile, nhờ họ upload lên thư mục gốc nhánh.
Không có file ảnh trên máy (chỉ thấy trong chat): ghi trong tiến độ là chưa tách và nhờ gửi lại file. Không cài được gói mới; script chỉ cần numpy, scipy, PIL.

## 5. Ghi chú ngắn cho mỗi con (`thu-moi/<vùng>/NN-slug.md`, khoảng 10 dòng)
```
# NN · Tên (Vùng)
Ảnh: <slug-vùng>-NN-slug.png (WxH, nền trong suốt, đã xóa sao; chờ upload / đã upload)
Khung + môi trường + dáng: ...
Bậc 1 / 2 / 3: mỗi bậc 1 dòng đặc điểm
Điểm chưa ổn: tối đa 4 dòng, nói thật
Lưu ý khi cắt: hiệu ứng ngoài thân cần chừa lề, mảnh rời là thiết kế
```

## 6. Prompt mẫu Canva (chỉ dùng khi soạn prompt mới; đổi KHUNG, bảng màu, 3 bậc)
```
Pokémon-style pixel art evolution line sprite sheet. ONE original creature
inspired by <KHUNG> (a stylized fantasy version, NOT a realistic copy) in 3
evolution stages side by side in a single row, left to right = Stage 1,
Stage 2, Stage 3. Wide landscape image, three equal sections, all in pure side
view facing left, all on the same ground line (or floating if it flies), clear
empty space between stages, nothing overlapping.

Art style: Gen 5 Pokémon battle sprite quality, crisp hard pixel edges, NO
anti-aliasing, NO blur, NO glow, NO semi-transparent effects, every pixel fully
opaque. The SAME thick dark navy outline on ALL three stages, same line weight,
clearly visible on Stage 3 too. Rich cel shading with 5-6 shades per color
area. Palette strictly: <BẢNG MÀU VÙNG>. The body must stay bright: mainly
<2-3 MÀU SÁNG>, dark navy only for outline and small shadows. No purple, no
pink, NO neutral grey.

Creature concept: <CHẤT LIỆU + DÁNG, khác các con trước; chi tiết ít, khối đặc>
- Stage 1: <bản THU NHỎ của Bậc 3: cùng khung, cùng số chân, cùng sừng/mào; dễ thương, mắt to>
- Stage 2: <lớn hơn, chi tiết hơn>
- Stage 3: <to nhất, uy nghi, chỉ vài chi tiết thêm, hiệu ứng ít và đặc>
EYES: on every stage the eye must be large and clearly readable: bright cyan
with a white highlight on a dark navy socket, at least 3x3 pixels, visible
even at small size. The same eye design on all 3 stages. No fake eye spots.
All 3 stages share the same face, the same eyes and the same colors, each
stage clearly bigger and more elaborate than the previous one.
Size: Stage 1 is about half the height of Stage 3.

Background: one flat solid pure magenta (#FF00FF). No text, no labels,
no arrows, no shadow, no frame.
```
Bảng màu: Tuyết Nguyên = deep navy, royal blue, sky blue, cyan, ice white. Sương Cốc = deep navy, deep teal, jade green, moss green, mist white.

**Bài học gộp (đã rút từ 17 con):**
- Bậc 1 hay ra loài khác (06 Vụ Long ra con thú tròn): ghi rõ Bậc 1 là bản thu nhỏ của Bậc 3, cùng khung và số chân.
- Bậc 3 hay quá nhiều chi tiết, sương che thân, rune: ghi only a few extra details, keep the silhouette clean.
- Viền navy hay mỏng dần ở Bậc 3 (05, 06): giữ câu clearly visible on Stage 3 too.
- Sương hay nhạt, xám, chìm trên nền sáng: ghi solid opaque mist white shapes with navy outline, not fog.
- Dáng 4 chân hay ra nai / ngựa: thêm NOT a deer, NOT a horse. Màu ngoài palette: ghi rõ tên màu và chỗ dùng. Không dùng đốm mắt giả.
- Mỏ / móng / sừng hay ra xám: ghi rõ màu (mist white hoặc moss green).
