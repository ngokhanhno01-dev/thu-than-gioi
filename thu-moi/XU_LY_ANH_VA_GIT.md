# Xử lý ảnh nhận được + thêm vào nhánh

Chỉ đọc file này khi đã nhận ảnh từ người dùng.

## A. Xử lý ảnh (3 bước, 1 lệnh cho cả lô)
Công cụ: `tools/xu_ly_anh_thu.py` (bản v2). Có numpy, scipy, PIL; không cài được gói mới. Ảnh người dùng gửi nằm ở `/mnt/user-data/uploads/` (hoặc `/mnt/user-data/attachments/`, xem đường dẫn trong tin nhắn). Thứ tự ảnh hiển thị trong tin nhắn có thể ngược với danh sách file: đối chiếu bằng TÊN file, đừng đoán.

1. **Lấy script vào máy làm việc**: bash không có mạng nên `get_file_contents` (owner `ngokhanhno01-dev`, repo `thu-than-gioi`, ref `refs/heads/ghi-chu-co-che-bat-thu-evo`, path `tools/xu_ly_anh_thu.py`) rồi `create_file` vào `/home/claude/xu_ly_anh_thu.py`, chép nguyên văn. Có git + mạng thì dùng thẳng file trong clone. KHÔNG tự viết lại thuật toán từ đầu.
2. **Chạy cả lô** (10 ảnh ~ vài giây):
   `python3 -I xu_ly_anh_thu.py --batch /mnt/user-data/uploads /home/claude/out --sheet /home/claude/xem`
   Mỗi ảnh in 1 dòng báo cáo: kích thước, số mảnh, màu nền, `dau sao: da xoa`. Nếu thấy `KHONG THAY` thì mở góc dưới phải ảnh gốc kiểm tra. Một ảnh: `python3 -I xu_ly_anh_thu.py vao.png ra.png --preview xem.png`.
3. **Soi 1 lần**: công cụ tự ghép bảng xem thử `xem_0.jpg`, `xem_1.jpg` (5 ảnh / bảng, trái = nền tối, phải = nền sáng). `view` mỗi bảng đúng 1 lần. Nhìn trên NỀN SÁNG: chỗ thủng, mảnh rời, viền ám màu. Ổn thì copy PNG sang `/mnt/user-data/outputs/` và `present_files` (PNG không đẩy lên GitHub được, người dùng tự upload).

Công cụ tự nhận nền: nền magenta (~(248,3,250)) hay nền tím Gemini (~(79,67,102)) đều xử lý đúng, không cần cờ; màu nền phẳng khác cũng được (lấy màu ở 4 góc). Ép tay nếu cần: `--fringe` / `--no-fringe`; ảnh người dùng đã tự xoá nền: `--rgba`.

### Bẫy đã gặp (bản cũ làm hỏng ảnh, đừng lặp lại)
- **Tách nền theo ngưỡng khoảng cách toàn ảnh (d >= 70) làm THỦNG thân**: các vùng tối gần màu nền tím (bia đá của Quy, mái đình + thân Kình, bóng tối của Lân) thành trong suốt, chỉ lộ ra khi xem trên nền sáng. Bản v2 chỉ coi là nền vùng rất gần màu nền (d < 32) chạm biên hoặc >= 150 px, rồi nới 2 px quanh mép.
- **Xoá dấu sao quá tay**: bản cũ xoá MỌI mảnh nhỏ ở góc dưới phải, mất tàn mây / tia sáng / đốm sương là thiết kế (Kình, Lân, Xà, Liên, Tinh). Dấu sao thật chỉ là 1 mảnh ~820 px, gần vuông (~48x48). v2 chỉ xoá đúng mảnh 500-1200 px, <= 90 px, gần vuông.
- **Tô lại "viền ám tím" khi nền KHÔNG phải magenta** sẽ tô nhầm tinh thể / rune hồng sát mép thành navy. Chỉ bật cho nền magenta (v2 tự quyết).
- Số "pixel ám hồng" không phải chỉ báo lỗi (ảnh vốn có rune/tinh thể hồng), v2 không in nữa.
- Không thu nhỏ ảnh (không có lưới pixel đều). Chỉ cắt riêng 3 bậc khi người dùng yêu cầu, và nói rõ.
- Alpha cứng 0/255, không làm mờ. Giới hạn đã biết: quầng sáng đèn lồng và sương hồng mờ bị cắt cứng, không còn mờ dần; mảnh rời khác (bong bóng, mảnh băng, đốm sương, vạch bóng đổ) là thiết kế: GIỮ.
- Đã kiểm thử v2 trên 10 ảnh Vân Đảo (nền tím, 1376x768 / 1024x1024 / 1264x848 / 1792x592), kết quả đã được duyệt.

4. **Nhận xét thật** khi báo người dùng: điểm tốt và điểm chưa ổn (viền lệch, mắt khó đọc, thân tối, hợp phong cách chưa, quầng sáng bị cắt). Nói rõ nếu đã chỉnh công cụ hoặc chạy nhiều lượt, và chỉ gửi bản cuối. Không nói quá.

## B. Thêm vào nhánh
- Ảnh: `<slug-vùng>-NN-slug.png`, đặt trong `thu-moi/<slug-vùng>/` cùng ghi chú (từ Sương Cốc trở đi; riêng Tuyết Nguyên giữ tên cũ `NN-slug.png` ở thư mục gốc). Slug = tên không dấu nối gạch (vd `suong-coc-04-vu-diep.png`).
- Ghi chú: `thu-moi/<slug-vùng>/NN-slug.md`, theo khuôn của 1 ghi chú mẫu mới nhất: vùng, loài + dáng, tên, ảnh (file, kích thước, nền trong suốt chưa, đã xoá dấu sao chưa), đặc điểm 3 bậc, điểm chưa ổn, lưu ý khi cắt (hiệu ứng ngoài thân cần chừa lề...).
- **Chỉ có công cụ GitHub (bash không mạng)**: đẩy ghi chú / TIEN_DO bằng `push_files` hoặc `create_or_update_file` (cần `sha` khi sửa file có sẵn, lấy từ kết quả `get_file_contents`). **PNG không đẩy được: nhờ người dùng tự upload** và ghi rõ vào TIEN_DO.
- **Có git + mạng**: clone `--depth 1`, `git fetch --depth=20 origin ghi-chu-co-che-bat-thu-evo`, `git checkout -B ghi-chu-co-che-bat-thu-evo FETCH_HEAD`. Mỗi con một commit tiếng Việt (kèm 2 dòng Co-Authored-By / Claude-Session theo system-reminder). Đẩy: `git -c push.negotiate=true push origin ghi-chu-co-che-bat-thu-evo`, kiểm bằng `git ls-remote` so với `git rev-parse HEAD`. Bẫy: `git rm` file cuối làm mất thư mục (`mkdir -p` trước khi ghi); hook báo "no remote branch" dù đã đẩy: `git config --add remote.origin.fetch '+refs/heads/ghi-chu-co-che-bat-thu-evo:refs/remotes/origin/ghi-chu-co-che-bat-thu-evo'`, fetch lại, `git branch -u origin/ghi-chu-co-che-bat-thu-evo`.
- Không bao giờ nói đã đẩy nếu chưa kiểm remote.

## C. Việc sau khi đủ 17 vùng
Chốt câu hỏi mở trong `THIET_KE_BAT_THU_EVO.md` (Evo có 3 bậc không, công thức ghép, tỉ lệ bắt, thú / trứng / thuộc hạ / boss cũ giữ hay bỏ); chốt cách cắt 3 bậc thành sprite riêng, xử lý vạch bóng đổ, kích thước sprite trong game (hiện 128×128, `img-mobs-*.png`).
