# Boss Thần Đế Giang (hệ Không Gian, phẩm chất Thần) - cập nhật 27/11/2026

Bổ sung cho THIET_KE_CHI_SO.md (mục 7b có kỹ năng và debuff Diệt Thế).

- id `th1`, vai Công, hệ `khonggian` (HE_TEN + BANG_HE trong 56-chi-so.js): khắc Ma, Long, Ám, Tâm Linh, Tiên; bị Kim kháng.
- Độ hiếm Thần: bậc 6 trên Truyền Thuyết (DO_HIEM.than trong 56b-loai.js), nhãn vàng ánh kim `#ffd76a`, trọng số gặp 0,1.
- CHỈ SỐ (chốt lại 27/11/2026): **x2 chỉ số boss thú hoang vùng 18** (z17, `vung` 17, boss x1,6, vai Công). Cấu hình `CFG.hsBossLoai.th1 = 2` nhân hp,tc,pt,td, chỉ khi tinh() nhận `thu.boss === true` từ trận. Đã BỎ cách cũ (tính như z16, x1,5 phẩm chất Thần, Máu x10).
  - Cấp 270, tiến hóa 3, bậc C, lúc đánh boss: Máu 94.061, Tấn công 39.018, Giáp 16.722, Tốc độ 5.978, May mắn 22 (boss thú hoang z17 vai Công cùng điều kiện: 47.030 / 19.509 / 8.361 / 2.989).
  - Thú nở từ trứng (không có cờ boss) không nhân x2; thú non cấp 1, tiến hóa 1.
- HỆ SỐ THEO ĐỘ HIẾM LOÀI (chốt 27/11/2026, `CFG.hsDoHiem` trong 56-chi-so.js): hp,tc,pt,td nhân Thường 1,00 / Hiếm 1,03 / Sử Thi 1,06 / Huyền Thoại 1,10 / Truyền Thuyết 1,20 / Thần 1,35 (mm không nhân). Áp cho thú nuôi và thú hoang thường; KHÔNG áp lúc `thu.boss === true` (trận đánh boss giữ chỉ số boss, nên Đế Giang khi đánh vẫn 94.061 Máu). Thú Thần nở cấp 1, V1: Máu 1.779, Tấn công 738, Giáp 316, Tốc độ 527. Boss bắt về (Truyền Thuyết) được x1,20.
- Kỹ năng Tinh Hà Vẫn Lạc + debuff Diệt Thế: xem 56c-buff.js (boss id `th1`).
- ĐÃ LÀM (27/11/2026, phiên 2): (1) Thú: `thu-game/than/de-giang-b1..b3-192.png`, đăng ký `th1` trong `51-thu-moi.js` qua `THU_MOI.than` (KHÔNG nằm trong `zones`, nên không thành vùng/Danh Vọng/map). Bậc 2 và 3 dính nhau ở đuôi/cánh trong ảnh gốc nên cắt tay theo tọa độ. (2) Đánh thường: sprite `fx-boss/de-giang-don-thuong.png` (3x2, ô 480x405, nền đen đổi sang alpha), `60d-fx-de-giang.js`; `index.html` thêm `FX_ZONE[17]=18` và cho phép zone 18 (zone 17 là số hiệu ứng của Thủy Nguyệt Cảnh). Mốc: lỗ đen 0-.2, tinh thể ló .13-.38, trúng .35, nổ .34-.56, vụn+tinh vân .48-.74, tan .62-.9. (3) Trứng: `104-trung-than.js` (TTGTRUNG), icon `icon-item/trung-de-giang.png`, rơi 0,5% (`CFG.tiLeRoi.th1`), nở cấp 1 V1 Rank `tungBac`; nút Mở dùng chung của `86-hop-ruong.js` (thêm `TTGHOP.dangKy`). (4) Nút test ẩn "Lấy trứng Đế Giang" (+3) trong menu ẩn chạm chữ Danh Vọng.
- CHƯA nối: `TTGTRUNG.roi('th1')` chưa gọi lúc boss chết (boss chưa đánh được), bậc `than` trong `bands` của 61-tham-hiem-tran.js, FX Tinh Hà Vẫn Lạc (ảnh sprite chưa gửi).
- CHƯA LÀM: cơ chế bỏ chạy (mỗi lần tụt 10% máu thì chạy sang vùng khác, từ 10% trở xuống không chạy), rớt trứng thay cho bắt bằng châu, ẩn trên map + icon đánh nhau + khóa 1 phút khi thua, đăng ký vùng/map và 51-thu-moi.js (chờ ảnh), lịch xuất hiện, FX kỹ năng, Thời Gian, Thái Cực. Xem PROMPT_DE_GIANG_PHIEN_MOI.md.

## Item tiến hóa của thú Thần (27/11/2026)
- 3 boss Thần KHÔNG thuộc vùng thám hiểm nào (thám hiểm hiện có 9/18 vùng). Số 17 trong code (`56b-loai.js` khóa 17, id item `th-z17-*`) chỉ là khóa nội bộ, không phải vùng.
- Mỗi con Thần có bộ riêng: Lõi, Châu, Thần Ấn (+ Mảnh theo loài). Đế Giang: Lõi Tinh Hà, Châu Hư Thiên, Thần Ấn Đế Giang. Thời Gian, Thái Cực: bộ riêng khi có ảnh.
- Item CHỈ rơi khi hạ boss Thần (`TTGTH.roiThan('th1', mayMan)`), không rơi từ thú hoang thường (`roiDo` bỏ qua z17). Tỉ lệ tạm = boss thú hoang (Lõi 20%, Châu 20%, Ấn 30%), chưa chốt. Chưa nối vào trận vì boss Thần chưa ra map.
