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
- Chúc Long (th2, Thời Gian) - trứng + item tiến hóa (27/11/2026, phiên 3): trứng `icon-item/trung-chuc-long.png` (id `trung-chuc-long`, `104-trung-than.js`, rơi 0,5% TẠM bằng Đế Giang, nút test ẩn "Lấy trứng Chúc Long"). Bộ item riêng khóa nội bộ z18 (`75-tien-hoa-thu.js`: ZT2, THAN_Z = {th1:17, th2:18}, `zoneOf` tra THAN_Z trước goc): Lõi Thời Luân (đồng hồ) / Châu Thời Cảnh (quả cầu) / Thần Ấn Chúc Long (đồng hồ cát), ảnh `icon-th/th-z18-loi|chau|an.png`; tên TẠM chờ chốt. Mảnh `th-m-th2.png` tạo bằng tao-manh-ghep.py --vung 17. Công thức tiến hóa giống mọi loài (V1->V2: Mảnh x6 + Lõi x2 + Châu x1; V2->V3: Lõi x5 + Châu x3 + Thần Ấn x1). Chưa nối rơi vào trận (boss chưa đánh được); `TTGTH.roiThan('th2')` và `TTGTRUNG.roi('th2')` sẵn sàng.
- Vô Cực (th3, Thần thứ 3) (27/11/2026, phiên 4): đăng ký thú (nền `con-luan-thien-canh`), đánh thường `fx-boss/vo-cuc-don-thuong.png` (60d), trứng `trung-vo-cuc` (rơi 0,5% TẠM, nút test ẩn "Lấy trứng Vô Cực"), bộ item z19: Lõi Lưỡng Nghi / Châu Hỗn Nguyên / Thần Ấn Vô Cực + Mảnh th-m-th3. TẠM, chờ chốt: vai Tank, hệ `vocuc` trung tính, tên item, chỉ số x2 boss z17. Chưa có kỹ năng, chưa nối rơi vào trận.

## Thái Cực Đồ (sách Vô Cực, 27/11/2026)
- Đỡ 5 đòn (không giới hạn lượt). Mỗi đòn phản 60% Công, đòn 5 phản 200% Công: sát thương chuẩn, có thể chí mạng. Hồi chiêu 8 (đã chốt), chỉ đếm khi khiên đã mất. Đỡ Vạn Mộc Hồi Xuân: lấy buff VÀ phản (đã chốt). Chỉnh số ở `56c-buff.js` (`thaiCuc:{hits,pct,last}`).
- Đỡ kỹ năng: debuff dội lại người tung, buff của kỹ năng về người giữ khiên.
- Người dùng chốt 27/11/2026: Vạn Mộc Hồi Xuân (địch tự buff) bị lấy buff và TỐN 1 tầng; Thời Gian Tỉnh Lặng KHÔNG bị cướp (buff chỉ sống trong kỹ năng đó), khiên chỉ chặn cú nổ; sát thương phụ không tốn tầng; đòn phản CÓ hút máu (bản chất là "chuyển đòn đánh").
- Cách làm hiện tại: tầng nào bị trừ thì phản 1 đòn (kể cả đỡ Vạn Mộc, cú nổ). Khiên đỡ trước né/hụt; thiêu đốt/debuff dính từ trước vẫn còn; phản đòn không kích khiên bên kia.
- Hình (`60g-fx-thai-cuc.js`): đòn 1-4 dùng dạng 2,3,4,5; đòn 5 chạy dạng 3->4->5->6. CHƯA xem trong game.

## PvP (LÀM SAU, ý người dùng 27/11/2026, CHƯA CÓ CODE)
- Hai bên tới lượt dùng kỹ năng cùng lúc: tốc độ cao hơn dùng trước.
- Tốc độ bằng nhau: không chạy 2 cảnh kỹ năng, chỉ 1 hiệu ứng nổ ở giữa, HÒA: mỗi bên mất máu bằng Công của đối thủ, và vẫn nhận buff / dính debuff của kỹ năng. Mục tiêu: giảm hiệu ứng nhưng giữ cái hay của kỹ năng.
- ĐÃ CHỐT: sát thương hòa = 100% Công đối thủ, sát thương chuẩn, KHÔNG chí mạng.
- ĐÃ CHỐT: kỹ năng kéo dài (Thái Cực Đồ, Thời Gian Tỉnh Lặng) khi hòa KHÔNG kích hoạt.
- ĐÃ CHỐT: "tốc bằng nhau" = trước khi ra chiêu, 2 thanh đánh cùng đầy trong 1 lượt (trong code là nhánh 'both' của `gaugeStep`, hiện cho sai lệch CLASH_MS=60 ms).
- ĐÃ CHỐT: khi hòa, cả 2 bên tính là đã dùng chiêu (vào hồi chiêu).
- Code hiện tại (`actClash`, CLASH_MS=60 trong index.html) khác luật này: 2 kỹ năng đối kháng thì tung lần lượt cả hai.
- Cân bằng Thái Cực Đồ (440% Công): người dùng đã tính, giữ nguyên.

## Nối vào map và trận (bước 5, 27/11/2026)
- 1 vs 1: chỉ 1 người đánh boss Thần một lúc (bỏ ý "tối đa 5 người"). Người khác thấy boss ẨN + icon 2 kiếm chéo + chữ "Đang giao chiến".
- Map (`89`): boss đứng ở 1 ô đi được trong khu cao nhất của vùng mà `103` chọn (cố định theo lần xuất hiện + số lần chạy). Chạm -> `TTGBTG.vaoDanh` (82) -> trận. Bị khóa: boss mờ + đếm ngược, không chạm được.
- Trận (`61` opts.than): cấp 270, V3, KHÔNG có Rank (bậc C cố định làm mốc chỉ số, ẩn Rank; Rank chỉ tung khi nở trứng, người dùng chốt 27/11/2026), nền theo `nen` của thú Thần. Máu bắt đầu = máu toàn cục.
- Bỏ chạy: máu tụt tới mốc 10% kế tiếp (90/80/70...) và còn > 10% -> boss chạy sang vùng khác, giữ MÁU THỰC còn lại (không hồi), người đánh không nhận thưởng, không bị khóa. Máu <= 10% đánh đến cùng.
- Thua / hòa / bấm Chạy: boss hiện lại cùng vùng với máu còn lại, người đánh bị khóa 60 giây. Thắng: boss chết tới hết khung, thưởng như boss thú hoang + rơi trứng (`104`, 0,5%).
- Không bắt bằng châu (`62` catchable/rateOf chặn `e.than`).
- Chưa làm: hết thời gian trận; tài khoản thật/server (uid tạm lưu `ttg_btg_uid`); người đang đánh tắt trang thì sau 10 phút (`tranQuaHanGiay`) mới nhả boss.

### Cập nhật theo người dùng (27/11/2026)
- Thua / hòa / Chạy: KHÔNG trừ Tinh Thạch, chỉ khóa 60 giây. Giết lần đầu vẫn +1 Danh Vọng (cả 3 boss).
- Boss chạy giữ máu thực còn lại (bản đồ và thông báo đều hiện %).
- `105-bao-boss-than.js`: dòng chữ chạy ngang trên cùng khi boss xuất hiện (kèm vùng) / bỏ chạy (kèm vùng + % máu) / bị hạ.
- Nút test ẩn (chạm "Danh Vọng"): Test Đế Giang / Chúc Long / Vô Cực (đặt ở VÙNG ĐANG CHỌN) + Tắt test. Test không đụng lịch, lần, khóa thật (`TTGBTG.datTest/tatTest`).

## Máu boss Thần tăng (27/11/2026, phiên 5)
- Lý do: thú 270 đánh 1 đòn là tụt hơn 10% máu nên boss chạy ngay (đòn thường thú Công S ~7,7%, kỹ năng 500% ~38%).
- `CFG.hsBossHp = {th1:30, th2:30, th3:30}` (lần đầu x5, nâng x30 cùng ngày vì boss ở lại 30 phút) (56-chi-so.js): chỉ nhân Máu, chỉ khi `thu.boss === true`, sau `hsBossLoai`. Tấn công, Giáp, Tốc độ giữ nguyên. Thú nuôi/trứng không bị ảnh hưởng. Máu toàn cục lưu theo tỉ lệ 0..1 nên không hỏng lần đang chạy.
- Cấp 270, V3, bậc C: Đế Giang Máu 470.304 / Chúc Long 444.176 / Vô Cực 679.328 (trước x5: 94.061 / 88.835 / 135.866).
- Thú Công S 270 V3: đòn thường ~1,6% máu boss, kỹ năng 500% ~8% (Vô Cực tank: 0,8% / 3,8%).
- Đã kiểm tra: node --check, node tính lại chỉ số; thú nuôi th1 cấp 1 không đổi. CHƯA thử trong trận thật (chưa biết boss đánh thú mình có thắng nổi 10% đầu không).

- Máu x30: Đế Giang 2.821.825 / Chúc Long 2.665.057 / Vô Cực 4.075.969. Thú Công S 270: đòn thường ~0,26%, kỹ năng 500% ~1,3% (Vô Cực tank ~0,13% / 0,64%).
- Ý chưa làm (người dùng nêu 27/11): tốc độ boss vào trận chỉ 50 rồi mỗi đợt +50 để thú cấp thấp kịp đánh 1 cái. Chờ chốt 'đợt' là gì.
