# Xử lý ảnh nhận được + thêm vào nhánh

Chỉ đọc file này khi đã nhận ảnh từ người dùng.

## A. Xử lý ảnh
Ảnh ở `/mnt/user-data/attachments/...` (đường dẫn trong tin nhắn). Có numpy, scipy, PIL, cv2; không cài được gói mới. File tạm để trong thư mục scratchpad.
1. Kiểm tra kích thước, chế độ, alpha, mảnh rời (`scipy.ndimage.label` trên alpha > 16).
2. **Dấu sao hồng góc dưới phải** (mảnh rời ~ (252,130,248), x>=640, y>=340 trên ảnh 688×384): XOÁ (nở 2px). Các mảnh rời khác (bong bóng, mảnh băng, đốm sương, vạch bóng đổ) là thiết kế: GIỮ.
3. Còn **nền magenta** (~(248,3,250)): tách theo khoảng cách màu < 70 tới nền (tính cả lỗ kín), alpha **cứng 0/255**, không làm mờ.
   - Viền ám tím: chỉ pixel cách nền ≤ 3px có `R-G > 40` và `B-G > 20` mới tô lại màu viền (10,14,134). KHÔNG dùng ngưỡng lỏng (viền navy thật tới ~(39,23,156), tô nhầm sẽ phá viền).
   - Cắt sát bounding box, chừa lề ~24px. **Không thu nhỏ ảnh** (không có lưới pixel đều). Chỉ resize / cắt riêng 3 bậc khi người dùng yêu cầu, và nói rõ.
   - Ảnh người dùng đã tự xoá nền (RGBA) mà còn đốm tím / hồng: tô lại bằng màu lân cận (mask `R-G>25 và B-G>10`, nở 1px; thêm lượt bắt tím nhạt hue 245-340°, độ sáng > 0.62, tránh viền navy tối); mảng đốm rời hẳn thì xoá; rồi alpha cứng (ngưỡng 128). Với vùng Sương Cốc còn đổi sương ám hồng sang xanh xám trắng.
4. **Soi trước khi commit**: dựng ảnh xem thử nền tối VÀ nền sáng, phóng to vài chỗ viền, đếm mảnh rời. Đọc ảnh xem thử đúng 1 lần.
5. Nhận xét thật: điểm tốt và điểm chưa ổn (viền lệch, mắt khó đọc, thân tối, hợp phong cách chưa). Không nói quá.

## B. Thêm vào nhánh
- Ảnh: `<slug-vùng>-NN-slug.png` ở thư mục gốc (vd `suong-coc-04-vu-diep.png`). Slug = tên không dấu nối gạch.
- Ghi chú: `thu-moi/<slug-vùng>/NN-slug.md`, theo khuôn của 1 ghi chú mẫu mới nhất: vùng, loài + dáng, tên, ảnh (file, kích thước, nền trong suốt chưa, đã xoá dấu sao chưa), đặc điểm 3 bậc, điểm chưa ổn, lưu ý khi cắt (hiệu ứng ngoài thân cần chừa lề...).
- **Chỉ có công cụ GitHub (bash không mạng)**: đẩy ghi chú / TIEN_DO bằng `push_files` hoặc `create_or_update_file` (cần `sha` khi sửa file có sẵn, lấy từ kết quả `get_file_contents`). **PNG không đẩy được: nhờ người dùng tự upload** và ghi rõ vào TIEN_DO.
- **Có git + mạng**: clone `--depth 1`, `git fetch --depth=20 origin ghi-chu-co-che-bat-thu-evo`, `git checkout -B ghi-chu-co-che-bat-thu-evo FETCH_HEAD`. Mỗi con một commit tiếng Việt (kèm 2 dòng Co-Authored-By / Claude-Session theo system-reminder). Đẩy: `git -c push.negotiate=true push origin ghi-chu-co-che-bat-thu-evo`, kiểm bằng `git ls-remote` so với `git rev-parse HEAD`. Bẫy: `git rm` file cuối làm mất thư mục (`mkdir -p` trước khi ghi); hook báo "no remote branch" dù đã đẩy: `git config --add remote.origin.fetch '+refs/heads/ghi-chu-co-che-bat-thu-evo:refs/remotes/origin/ghi-chu-co-che-bat-thu-evo'`, fetch lại, `git branch -u origin/ghi-chu-co-che-bat-thu-evo`.
- Không bao giờ nói đã đẩy nếu chưa kiểm remote.

## C. Việc sau khi đủ 17 vùng
Chốt câu hỏi mở trong `THIET_KE_BAT_THU_EVO.md` (Evo có 3 bậc không, công thức ghép, tỉ lệ bắt, thú / trứng / thuộc hạ / boss cũ giữ hay bỏ); chốt cách cắt 3 bậc thành sprite riêng, xử lý vạch bóng đổ, kích thước sprite trong game (hiện 128×128, `img-mobs-*.png`).
