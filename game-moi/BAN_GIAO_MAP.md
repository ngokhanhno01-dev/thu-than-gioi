# BÀN GIAO MỚI: map thám hiểm (26/11/2026). Thay cho file gui-claude-9-vung.md cũ ở những chỗ khác nhau.

## Cách làm việc
- Repo ngokhanhno01-dev/thu-than-gioi, nhánh feature-map-movement, đẩy thẳng (không nhánh con, không PR). Không có quyền đẩy thì xin chủ game cấp quyền / token mới.
- Chủ game không rành lập trình, dùng điện thoại. Trả lời tiếng Việt, ngắn.
- TIẾT KIỆM QUOTA: KHÔNG chạy thử game (playwright) trừ khi chủ game yêu cầu. Chỉ `node --check` + TTGMAP.checkCfg(). Báo rõ là chưa chạy thử. Không đọc cả file .js, chỉ grep đúng đoạn.
- Chủ game KHÔNG tự khoanh mask (khó): Claude khoanh, gửi ảnh xem trước, chủ game nhắn "được" mới đưa vào game.

## Tiến độ: XONG tuyet-nguyen, suong-coc, van-dao, phong-nguyen. CÒN: loi-vuc, nguyet-cung, thuy-nguyet-canh, xich-hoa-dia, thanh-lam
Ảnh cả 7 vùng đã có: game-moi/map-tham-hiem-<slug>.webp (1536x1024). Chủ game chưa duyệt bằng mắt 7 ảnh này -> mở xem trước.

## Mỗi vùng mới (file game-moi/89-tham-hiem-map.js; lấy VUNG['suong-coc'] làm mẫu)
1. Khoanh: cắt ảnh 4 phần, phóng x2, kẻ lưới toạ độ 64 -> vẽ đa giác bằng PIL (vẽ x4, thu về 192x128, ô >=50% là đi được) -> flood-fill từ xuất phát, bỏ ô cô lập -> mã hoá RLE đúng maskEnc ("192x128:<bit đầu>:<độ dài hệ 36, phẩy>") -> ảnh phủ xanh/đỏ gửi duyệt.
   - Kiểu chủ game thích: ĐI THOẢI MÁI. Chỉ chặn vật to (núi, vách, cây to, nước, thác, hang, cột, tháp, cổng đá, vực). Bụi nhỏ, đá thấp, tinh thể nhỏ đi được.
2. Thêm vào VUNG: anh (?v=3), xuatPhat, 4 khu (y0/y1 theo biển KHU; tỉ lệ như mẫu), diem, boss, dauHieu, camNhay (khung cầu/lối hẹp thú không được nhảy vào).
   - Chỗ núp: DÙNG HẾT bụi/đá/tinh thể/nấm đi tới được (5-10 chỗ mỗi khu), đặt ở ô đi được cạnh vật, chừa 1-2 ô, cách nhau >=55, cách boss >=95, đúng khoảng y của khu.
3. Thêm 1 hàm vẽ dấu hiệu vào bảng DAUHIEU (mẫu: tuyet, suong). Gợi ý từng vùng xem file bàn giao cũ.
4. Không phải sửa 82 (đã có đủ 9 slug). Nâng ?v= của 89 trong game-moi/index.html, ghi game-moi/GHI_CHU.md, commit, đẩy.

## Quy tắc chơi hiện tại (dùng chung mọi vùng, ĐÃ CÓ SẴN trong CFG, thay quy tắc cũ rung 20s / 3-4 điểm)
- Mỗi khu tối đa 2 con, cách nhau 180, không hiện sát người; sống 60s có đếm ngược; hồi chỗ 15s; an toàn 3s sau trận.
- Xa: dấu hiệu môi trường. Gần: bóng đen -> thú thật + hào quang màu độ hiếm. Thấy gì đánh nấy (opts.chon trong 61-tham-hiem-tran.js).
- Nhảy quanh chỗ núp, khu cao lanh hơn. QUÁI (source main) mọi độ hiếm tự nhào vào người. THÚ (demo) chỉ sử thi/huyền thoại bỏ chạy 1 đoạn. Boss đứng yên.
