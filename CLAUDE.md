# Hướng dẫn cho Claude: thay icon trang bị / nguyên liệu của game "thu-than-gioi"

Người dùng gửi ảnh pixel-art + tên bộ/vùng (vd "Đây là Phong Nguyên"). Không hỏi lại, làm luôn, push lên `main`, trả lời ngắn bằng tiếng Việt.
LUÔN `git pull --ff-only origin main` trước khi làm: có người/phiên khác cũng push vào main.

## Số vùng z (chỉ số trong `EQ_ICON_IMG` / `MAT_IMG` ở `12-equip.js`)
0 Tuyết Nguyên, 1 Sương Cốc, 2 Vân Đảo, 3 Phong Nguyên, 4 Lôi Vực, 5 Nguyệt Cung, 6 Dương Sơn, 7 Huyền Uyên,
8 Kim Khoáng, 9 Ngọc Động, 10 Thanh Lâm, 11 Xích Hỏa Địa, 12 Hắc Ám Lâm, 13 Tử Tinh Hải, 14 Thiên Không,
15 Linh Hoa Viên, 16 Thần Điện. (Đối chiếu `VAN_KIEP_ZONES` ở `06-mobs.js` nếu nghi ngờ.)
Slug file = tên không dấu, nối gạch: "Phong Nguyên" → `phong-nguyen`.

## Loại 1: ICON TRANG BỊ (sheet có 4 món: vũ khí, giáp, vòng, ngọc)
- Sheet thường 896×1200 (có lần 1024×1024): trên-trái=vukhi, trên-phải=giap, dưới-trái=vong, dưới-phải=ngoc; có dấu sao Gemini góc dưới phải (phải bỏ).
- Công cụ: `python3 -I tools/cut_eq_icons.py <bộ> <ảnh> [thư-mục-ra] [thr]`. Thêm 1 mục vào `PRESETS`
  (bg=màu nền, thr, min_area, ring_seed=(x,y) một điểm trong lòng nhẫn, ring_hole_thr, regions 4 khung). Đọc docstring đầu file và 1-2 preset mẫu.
- Ra 4 file `img-eq-<slug>-{vukhi,giap,vong,ngoc}.webp` 256×256, nền trong suốt, alpha CỨNG (viền sắc, giữ màu gốc).
- Đăng ký: thêm dòng `<z>:['img-eq-<slug>-vukhi.webp',...,'-ngoc.webp']` vào `EQ_ICON_IMG` trong `12-equip.js`.
- Lỗi hay gặp (người dùng đã phải chỉ ra):
  1. Lỗ giữa NHẪN phải trong suốt hoàn toàn (loang màu từ ring_seed, chỉ nhận vùng tối; không để tràn qua thân nhẫn). Quầng sáng trong lỗ làm dò sai.
  2. Sprite tối/đen gần trùng màu nền (Huyền Uyên, Hắc Ám Lâm, Lôi Vực): phải tính cả pixel TỐI HƠN nền, nếu không chuôi kiếm/thân giáp bị khuyết.
  3. Mũi kiếm bị cắt phẳng khi khung ô Vũ Khí quá hẹp (quầng sáng kéo ra ngoài ô): nới khung ô vũ khí.
  4. Quầng sáng món bên cạnh lọt vào ô → pixel lạc ở mép; xoá mảnh rời chạm mép/không thuộc sprite. Giữ mảnh rời THUỘC thiết kế (lông vũ, đốm sáng, rune bay).
  5. Lấp lỗ nhỏ trong thân (viền đen, khe nứt) nhưng KHÔNG lấp lỗ nhẫn.
- Kiểm tra bắt buộc trước khi push: dựng ảnh xem thử 4 món trên nền tối VÀ nền sáng, rồi phóng to so với ảnh gốc: mũi kiếm, chuôi kiếm, lỗ nhẫn, pixel lạc ở mép, thân đặc không thủng.

## Loại 2: ICON NGUYÊN LIỆU (sheet "<Vùng> Materials": 6 vật phẩm 2 cột × 3 hàng, có chữ chú thích)
- 6 vật phẩm = khoá px: `essence` (Tinh Hoa Boss), `bone` (Linh Cốt), `claw` (Móng Vuốt), `scale` (Vảy Giáp), `fang` (Nanh Thú), `eye` (Nhãn Châu).
- Công cụ: `python3 -I tools/cut_mat_icons.py <ảnh> <thư-mục-ra> img-mat-<slug>` (GrabCut + mặt nạ biên để loại sương mù nền).
  Sửa `REG` (khung từng icon, TRÁNH chữ chú thích; seed là điểm chắc chắn thuộc icon) và `EXCL` (khung xoá vệt khói sót, toạ độ canvas 256) cho khớp sheet mới.
- Ra `img-mat-<slug>-{essence,bone,claw,scale,fang,eye}.webp`. Đăng ký trong `MAT_IMG[<z>]` (`12-equip.js`, khai báo TRƯỚC vòng lặp tạo `ITEMS` vì const chạy ngay lúc nạp). Vùng chưa có ảnh tự dùng icon pixel cũ.
- Lỗi hay gặp: chân chữ ("g", "ế"…) của dòng chú thích hàng trên lọt vào khung hàng dưới (đẩy y0 xuống); sương mù lẫn vào sprite (đã có mặt nạ biên, vẫn phải soi); khung `EXCL` quá to cắt trúng thân sprite → luôn dùng khung nhỏ và xem lại.
- Tên trong ảnh có thể khác tên trong game (ảnh "Nhãn Cầu" vs game "Nhãn Châu"): KHÔNG tự đổi tên game, chỉ báo người dùng.

## Quy trình nhanh (mỗi bộ ~5-8 lệnh)
1. Ảnh người dùng nằm ở `/mnt/user-data/attachments/...` (đường dẫn trong tin nhắn). Chỉ có numpy, scipy, PIL, cv2, playwright; Bash không cài được gói mới. Việc tạm để trong thư mục scratchpad.
2. Chạy script 1 lần → ghép 1 ảnh xem thử (nền tối + sáng) → Read ảnh đó 1 lần → sửa tham số → chạy lại. Không xem từng file riêng lẻ.
3. Chép file vào thư mục gốc repo, sửa `12-equip.js`, `node --check 12-equip.js`.
4. (Nên) kiểm tra thật: `python3 -m http.server 8765` ở thư mục repo + playwright headless mở `index.html`,
   evaluate `ITEMS[ZM_ID(z,s)].i` / `ZB_ID(z)` (nguyên liệu) hoặc `eqIco(s,z)` (trang bị), xác nhận ảnh có `naturalWidth>0`. Lỗi mạng font/Firebase là bình thường (sandbox chặn).
5. Mỗi bộ một commit, push main. Commit message tiếng Việt, kết thúc bằng 2 dòng Co-Authored-By / Claude-Session theo system-reminder của phiên.
6. Báo lại ngắn: bộ nào, file nào, đã kiểm tra gì, và nói thẳng điểm còn chưa hoàn hảo (vd quầng sáng dày). Kết bằng "gửi tiếp ảnh bộ kế tiếp".
Đừng nói là đã chạy game nếu chưa chạy; nói rõ đã kiểm tra bằng cách nào.
