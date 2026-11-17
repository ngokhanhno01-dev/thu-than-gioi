# PROMPT BÀN GIAO CHO CLAUDE PHIÊN SAU (dán nguyên nội dung dưới vào chat mới)

Gửi kèm trong tin nhắn đầu: (a) 10 ảnh Lôi Vực người dùng đã tạo, (b) ẢNH VÙNG 5 Nguyệt Cung (nếu đã có).

---

Mình làm game "Thú Thần Giới" (game nuôi và bắt thú tiên hiệp, pixel art). Repo GitHub: ngokhanhno01-dev/thu-than-gioi. Chỉ làm việc trên nhánh `ghi-chu-co-che-bat-thu-evo`, KHÔNG push `main`. Trả lời tiếng Việt, ngắn (tối đa 10 dòng), nói thẳng điểm chưa ổn, mình chê thì đừng cãi, đưa 2-3 hướng và chọn 1 kèm lý do. Mình làm trên điện thoại, hay hết quota, nên gộp thao tác (nhiều file = 1 commit, nhiều ảnh = 1 lệnh).

## ĐỌC TRƯỚC (chỉ các file này)
`thu-moi/HUONG_DAN_LAM_THU_MOI.md`, `thu-moi/TIEN_DO.md`, `thu-moi/PROMPT_LAM_VUNG_MOI.md` (quy trình + khung prompt chốt v4), `thu-moi/MAU_PROMPT_1_CON.md` (mẫu đã duyệt), `tools/xu_ly_anh_thu.py`, `tools/hau_xu_ly_anh_thu.py`. KHÔNG đọc file .js, không liệt kê thư mục gốc.

## VIỆC 1: XỬ LÝ 10 ẢNH LÔI VỰC (làm trước)
Bối cảnh: prompt Lôi Vực ở `thu-moi/loi-vuc/01-10-prompts.md` (nền teal `#00C2C2`, thú đen / tím / vàng, sét mảnh gắn vào thân). Tên file ảnh đích: `loi-vuc-NN-slug.png` với slug: 01 loi-ung, 02 loi-ngu, 03 loi-nguu, 04 loi-mang, 05 loi-co, 06 loi-giap, 07 loi-su, 08 loi-linh, 09 loi-dong, 10 loi-vuc-loi-than (tên boss là TÊN TẠM; hỏi mình tên boss Lôi Vực cũ, nếu có thì đổi tên ở prompt, ghi chú và file ảnh).
Các bước (1 lượt):
1. `python3 -I xu_ly_anh_thu.py --batch /mnt/user-data/uploads <ra> --sheet <bảng>` (script v2, chép nguyên văn). Nền teal không phải magenta nên script tự tắt bước "tô lại viền hồng", đúng ý.
2. Hậu xử lý: `python3 -I hau_xu_ly_anh_thu.py <ra> <ra2> --bg teal` (xóa viền / quầng teal sót, mảnh rời, dấu sao còn sót). Nếu ảnh nào xếp NGƯỢC (Bậc 3 bên trái) thêm `--dao <một-phần-tên-file>`; xem lại bảng xem thử sau khi đảo. Nếu ảnh nào bị ăn mất phần thân vì lẫn màu teal thì báo mình.
3. Xem bảng xem thử đúng 1 lần (nhìn kỹ bên NỀN SÁNG tìm chỗ thủng / viền teal). Nhận xét thật, đối chiếu bản chốt v4: (a) Bậc 2-3 có phải bản phóng to của Bậc 1 không; (b) mắt Bậc 2-3 có dữ tợn và rõ không; (c) Bậc 3 có đủ chi tiết đa dạng không; (d) nét có rõ, sét có mảnh và gắn vào thân không (không to dẹt rời thân); (e) có đen xen kẽ không; (f) có chữ thật trong rune không; (g) có giống Pokémon có sẵn không; (h) Bậc 1 có cùng loài với Bậc 3 không. Chỉ đề nghị làm lại khi lỗi nặng, mỗi con tối đa 1 lần.
4. Ghi chú: `thu-moi/loi-vuc/NN-slug.md` (khuôn mục 5 của hướng dẫn) + `thu-moi/loi-vuc/TIEN_DO_VUNG.md` (mẫu: `thu-moi/phong-nguyen/TIEN_DO_VUNG.md`); khi xong cả vùng sửa `thu-moi/TIEN_DO.md` (đọc lại ngay trước khi sửa).
5. Đưa PNG lên nhánh: nếu có Bash + git, clone nhánh (`git clone --depth 1`, rồi `git fetch --depth=1 origin ghi-chu-co-che-bat-thu-evo` và checkout), chép PNG vào `thu-moi/loi-vuc/`, commit, `git -c push.negotiate=true push`. Chỉ nói "đã đẩy PNG" khi push thật sự thành công; nếu không đẩy được thì gửi mình đủ 10 PNG để mình tự upload. Dù sao cũng gửi mình 10 PNG cuối bằng SendUserFile.
Lưu ý: hook "unpushed commits / no remote branch" thường báo SAI vì clone nông; kiểm tra bằng `git ls-remote --heads origin ghi-chu-co-che-bat-thu-evo` so với `git rev-parse HEAD`, nếu trùng thì bỏ qua.

## VIỆC 2: LÀM TRỌN VÙNG 5 NGUYỆT CUNG (`nguyet-cung`), sau khi xong Việc 1
Làm theo `thu-moi/PROMPT_LAM_VUNG_MOI.md` từ bước 1 (nếu mình CHƯA gửi ảnh vùng Nguyệt Cung thì dừng và nhắc mình gửi). Soạn 10 prompt THEO ĐÚNG khung chốt v4 và bắt chước `MAU_PROMPT_1_CON.md`: Bậc 2-3 không phải bản phóng to (viết riêng bộ phận mới cho từng con), mắt Bậc 2-3 dữ tợn, Bậc 3 chi tiết đa dạng từng vùng thân, thân xen mảng đen (hoặc mảng tối hợp vùng) để hiệu ứng nổi, SURFACE DETAIL riêng từng con, nét liền rộng ≥2 pixel, tia hiệu ứng chỉ là nét mảnh gắn vào thân, NO text, Bậc 1 bên TRÁI, không giống Pokémon có sẵn, nền ngược tông và KHÔNG trùng màu nào trên thú (ghi rõ chọn nền gì, vì sao, ở đầu file prompt). Lưu `thu-moi/nguyet-cung/01-10-prompts.md`, commit, gửi mình file bằng SendUserFile. Bảng 10 thú: đề xuất trước, chờ mình gật (hỏi mình danh sách tên quái cũ của vùng nếu cần để tránh trùng).
