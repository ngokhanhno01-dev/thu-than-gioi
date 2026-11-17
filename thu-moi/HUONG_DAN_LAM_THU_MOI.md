# Làm thú mới cho game thu-than-gioi (ĐỌC FILE NÀY + `thu-moi/TIEN_DO.md` + file tiến độ của vùng, XONG, đừng đọc gì khác)

Trả lời ngắn (tối đa 10 dòng) bằng tiếng Việt, nói thẳng điểm chưa ổn. Làm trên nhánh `ghi-chu-co-che-bat-thu-evo`, KHÔNG push `main`.

**Khi soạn prompt tạo ảnh: dùng khung trong `thu-moi/PROMPT_LAM_VUNG_MOI.md` (nguồn duy nhất, cũng là prompt mẫu để dán vào phiên mới).**

## 0. Tiết kiệm quota (bắt buộc)
- KHÔNG liệt kê thư mục gốc (hàng trăm ảnh). Chỉ `get_file_contents` đường dẫn trực tiếp; chỉ được liệt kê `thu-moi/<vùng>`.
- KHÔNG đọc: mọi file `.js` (nhất là `06-mobs.js`), `GHI_CHU_*.md`, `THIET_KE_BAT_THU_EVO.md` (chỉ khi người dùng hỏi cơ chế), ghi chú các con cũ, file `NN-MM-prompts.md` đã soạn, file vừa tự ghi.
- Không dùng danh sách việc (TaskCreate), không kể từng bước, không in lại nội dung dài.
- Gộp: nhiều file = 1 `push_files`; nhiều ảnh = 1 lệnh Bash, 1 lần xem preview, 1 lần SendUserFile.

## 1. Bối cảnh
Game có Bắt thú theo vùng + Tiến hóa 3 bậc + Evo. 17 vùng x 10 thú. Mỗi con = 1 ảnh xếp ngang 3 bậc (trái -> phải = Bậc 1 -> 2 -> 3). Người dùng làm ảnh bằng Canva Pro hoặc Gemini (AI) theo prompt Claude soạn, gửi ảnh lại; Claude tách nền, ghi chú. Claude KHÔNG tự tạo được ảnh. PNG lên nhánh do người dùng tự upload (công cụ GitHub chỉ đẩy file văn bản). Vị trí PNG: Tuyết Nguyên giữ tên cũ ở thư mục gốc; từ Sương Cốc trở đi PNG nằm cùng ghi chú trong `thu-moi/<slug-vùng>/`.

## 2. Quy tắc người dùng đã chốt
1. Mỗi con 1 tên cho cả 3 bậc, Hán-Việt hai từ, bắt đầu bằng từ chủ đề vùng. Boss giữ tên boss cũ. Không trùng quái cũ (danh sách ở file tiến độ vùng).
2. Được lấy khuôn động vật (thật / thần thoại) làm khung nhưng phải có nét riêng theo vùng; không vẽ y nguyên (từng bỏ con nai vì quá giống thật).
3. Đa dạng như Pokémon: phủ đủ môi trường (trời, nước, mặt đất, lòng đất, thực vật, khe đá/giáp, thần thoại, linh khí, người nhỏ, boss), mỗi con một dáng khác nhau; vật thể sống tối đa 1-2 con / vùng.
4. Phong cách pixel art Gen 5 Pokémon: sắc cạnh, viền navy dày đồng đều 3 bậc, đổ bóng theo mảng, thân sáng. Đây là game THẦN THÚ nên NHIỀU CHI TIẾT, đặc biệt Bậc 3: hoa văn chạm khắc, cổ ngữ / rune, phụ kiện theo vùng (vòng cổ, bông tai, vòng chân, mão...), hiệu ứng theo vùng quanh thú. Chê: quá mịn, quá nhợt trắng, các khối rời nhau (chi tiết phải phủ lên thân liền khối, hiệu ứng nằm quanh, không che mặt và mắt). Thích: Tuyết Cầu, Băng Đăng, Băng Kỳ Lân (liền khối). CHỐT mới (17/11/2026, bản mẫu Lôi Vực): Bậc 2-3 không phải bản phóng to, mắt Bậc 2-3 dữ tợn, Bậc 3 chi tiết đa dạng từng vùng thân, thân xen mảng đen; xem `PROMPT_LAM_VUNG_MOI.md` và `MAU_PROMPT_1_CON.md`.
5. Chủ đề vùng quyết định chất liệu, bảng màu, hiệu ứng và phụ kiện; không quyết định dáng. Bảng màu và hiệu ứng lấy từ ảnh vùng người dùng gửi. Quy tắc "cấm tím / hồng" chỉ áp cho vùng lạnh (Tuyết Nguyên, Sương Cốc); Vân Đảo dùng tím / hồng là hợp lệ (đã chốt). Cấm chớp sáng đè mắt.
6. Người dùng nói xấu: đừng cãi, đưa 2-3 hướng khác, chọn 1 và nói vì sao.
7. Bảng 10 con của vùng mới: tự kiểm đủ môi trường, không trùng dáng, ít vật thể, tên không trùng quái cũ; cột Khung / Môi trường / Dáng.
8. Màu nền khi tạo ảnh: chọn nền TÔNG NGƯỢC với màu chủ đạo của thú để tách nền dễ (thú hồng / magenta -> nền tím xanh đậm; thú xanh / trắng / vàng -> nền magenta; hai màu này chỉ là gợi ý), một màu cho cả vùng, không trùng màu nào trên thú. Chi tiết trong `PROMPT_LAM_VUNG_MOI.md`.

## 3. Làm THEO LÔ (đây là chỗ tăng tốc, không làm từng con một)
**Lô A, soạn prompt:** soạn TẤT CẢ prompt còn lại của vùng trong 1 file `thu-moi/<vùng>/NN-MM-prompts.md` (1 commit) và gửi thẳng file đó cho người dùng bằng công cụ gửi file. Báo người dùng chạy Canva / Gemini song song, gửi nhiều ảnh một lượt. Vùng mới: đề xuất bảng 10 con trước (mục 2.7), người dùng gật là soạn luôn cả 10 prompt.
**Lô B, nhận ảnh:** người dùng gửi 1 hoặc nhiều ảnh. Làm tất cả trong một lượt: chạy script (mục 4) cho cả lô trong 1 lệnh Bash; xem bảng xem thử đúng 1 lần mỗi bảng; SendUserFile gửi mọi PNG; `push_files` mọi ghi chú ngắn (mục 5) + file tiến độ vùng. Báo ngắn.
**Chấp nhận đủ dùng:** chỉ đề nghị làm lại khi lỗi nặng (Bậc 1 khác hẳn loài, mất mắt, nền lẫn nặng, sai vùng màu, Bậc 3 thiếu chi tiết hẳn). Lỗi nhỏ ghi 1 dòng, không làm lại. Mỗi con tối đa 1 lần làm lại.
**Song song nhiều Claude:** được, miễn mỗi phiên một vùng, chỉ sửa `thu-moi/<vùng>/`. Chỉ sửa `thu-moi/TIEN_DO.md` khi xong cả vùng, và đọc lại ngay trước khi sửa.

Sau MỖI lô, cập nhật file tiến độ của vùng (`thu-moi/<vùng>/TIEN_DO_VUNG.md`), gộp chung trong push_files của lô đó.

## 4. Xử lý ảnh bằng script (1 lệnh cho cả lô, không tự viết code)
Chi tiết đầy đủ + các bẫy đã gặp: `thu-moi/XU_LY_ANH_VA_GIT.md` mục A. Tóm tắt: ảnh người dùng ở `/mnt/user-data/uploads/`. Lấy `tools/xu_ly_anh_thu.py` (bản v2) 1 lần mỗi phiên bằng `get_file_contents` rồi `create_file`, chép nguyên văn. Chạy:
`python3 -I xu_ly_anh_thu.py --batch /mnt/user-data/uploads <thư mục ra> --sheet <đường dẫn bảng>`
Script tự nhận nền (magenta, tím, màu phẳng khác), xóa dấu sao Gemini, giữ vùng tối bên trong thân, alpha cứng, bỏ mảnh rời nhỏ, cắt sát chừa lề 24px, KHÔNG thu nhỏ, và ghép bảng xem thử (trái nền tối, phải nền sáng). Soi bên NỀN SÁNG. Gửi PNG cho người dùng bằng SendUserFile, nhờ họ upload vào `thu-moi/<slug-vùng>/`.
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

## 6. Khung prompt tạo ảnh
Khung prompt Canva / Gemini (v4 chốt, mẫu 1 con ở `thu-moi/MAU_PROMPT_1_CON.md`; v2: nhiều chi tiết, rune, phụ kiện, hiệu ứng và tông màu theo vùng, nền ngược tông) nằm duy nhất trong `thu-moi/PROMPT_LAM_VUNG_MOI.md`. Không chép khung sang đây. Bảng màu đã dùng và bài học cũ: `thu-moi/PROMPT_MAU.md`.
