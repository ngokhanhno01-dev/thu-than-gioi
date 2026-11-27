# Boss Thần Đế Giang (hệ Không Gian, phẩm chất Thần) - chốt 27/11/2026

Bổ sung cho THIET_KE_CHI_SO.md (mục 7b có kỹ năng và debuff Diệt Thế).

- id `th1`, vai Công, hệ `khonggian` (HE_TEN + BANG_HE trong 56-chi-so.js): khắc Ma, Long, Ám, Tâm Linh, Tiên; bị Kim kháng.
- PHẨM CHẤT THẦN: bậc 6 trên Truyền Thuyết (DO_HIEM.than trong 56b-loai.js), nhãn vàng ánh kim `#ffd76a`, trọng số gặp 0,1 (Truyền Thuyết = 1). Chỉ số hp,tc,pt,td nhân thêm `CFG.hsThan` = 1,5 (mm không nhân). Muốn "áp đảo hẳn" thì đổi lên 2.
- Chỉ số tính như boss vùng cuối z16 (Thần Điện), cấp tối đa 270 (capMax). Công thức giữ nguyên, chỉ thêm hsThan.
  - Cấp 1, tiến hóa 1, bậc C: Máu 1.879, Tấn công 780, Giáp 334, Tốc độ 557, May mắn 10.
  - Cấp 100, tiến hóa 3, bậc C: Máu 26.824, Tấn công 11.127, Giáp 4.769, Tốc độ 1.991.
  - Cấp 270, tiến hóa 3, bậc C: Máu 67.076, Tấn công 27.824, Giáp 11.925, Tốc độ 4.263.
- MÁU x10 CHỈ LÚC ĐÁNH BOSS (`CFG.hsMauBossLoai.th1 = 10`): tinh() chỉ nhân khi nhận `thu.boss === true` từ trận (61, 88, ganSachBoss). Cấp 270 khi đánh boss: Máu 670.762. Thú bắt về không mang cờ boss nên giữ chỉ số bình thường (Máu 67.076). Thiết kế cho kiểu nhiều người đánh chung (tối đa 5); chưa có online nên chỉ số boss ghi như bản 1 người, sau này nhân theo số người trong phòng.
- Kỹ năng Tinh Hà Vẫn Lạc + debuff Diệt Thế: xem 56c-buff.js (boss id `th1`).
- CHƯA LÀM: đăng ký vào vùng/map và 51-thu-moi.js (chờ ảnh thú), lịch xuất hiện ngẫu nhiên theo vùng (có mặt 30 phút, nghỉ 2 giờ 30, chu kỳ 3 giờ), FX kỹ năng (lỗ đen, tinh cầu), Thời Gian và Thái Cực (chưa chốt vai, tên chiêu, mô tả).
