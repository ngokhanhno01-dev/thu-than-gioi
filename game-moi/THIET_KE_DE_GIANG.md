# Boss Thần Đế Giang (hệ Không Gian, phẩm chất Thần) - cập nhật 27/11/2026

Bổ sung cho THIET_KE_CHI_SO.md (mục 7b có kỹ năng và debuff Diệt Thế).

- id `th1`, vai Công, hệ `khonggian` (HE_TEN + BANG_HE trong 56-chi-so.js): khắc Ma, Long, Ám, Tâm Linh, Tiên; bị Kim kháng.
- Độ hiếm Thần: bậc 6 trên Truyền Thuyết (DO_HIEM.than trong 56b-loai.js), nhãn vàng ánh kim `#ffd76a`, trọng số gặp 0,1.
- CHỈ SỐ (chốt lại 27/11/2026): **x2 chỉ số boss thú hoang vùng 18** (z17, `vung` 17, boss x1,6, vai Công). Cấu hình `CFG.hsBossLoai.th1 = 2` nhân hp,tc,pt,td, chỉ khi tinh() nhận `thu.boss === true` từ trận. Đã BỎ cách cũ (tính như z16, x1,5 phẩm chất Thần, Máu x10): `CFG.hsThan` đặt 1 (không nhân).
  - Cấp 270, tiến hóa 3, bậc C, lúc đánh boss: Máu 94.061, Tấn công 39.018, Giáp 16.722, Tốc độ 5.978, May mắn 22 (boss thú hoang z17 vai Công cùng điều kiện: 47.030 / 19.509 / 8.361 / 2.989).
  - Thú nở từ trứng (không có cờ boss) không nhân x2; thú non cấp 1, tiến hóa 1.
- Kỹ năng Tinh Hà Vẫn Lạc + debuff Diệt Thế: xem 56c-buff.js (boss id `th1`).
- CHƯA LÀM: cơ chế bỏ chạy (mỗi lần tụt 10% máu thì chạy sang vùng khác, từ 10% trở xuống không chạy), rớt trứng thay cho bắt bằng châu, ẩn trên map + icon đánh nhau + khóa 1 phút khi thua, đăng ký vùng/map và 51-thu-moi.js (chờ ảnh), lịch xuất hiện, FX kỹ năng, Thời Gian, Thái Cực. Xem PROMPT_DE_GIANG_PHIEN_MOI.md.
