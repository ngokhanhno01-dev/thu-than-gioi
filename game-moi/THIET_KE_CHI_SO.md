# Thiết kế chỉ số (đã chốt 19/11/2026)

## 1. Chỉ số
- 5 chỉ số chính cố định: hp, tc (tấn công), pt (phòng thủ), td (tốc độ), mm (may mắn). Chỉ số phụ giữ khóa đã khai trong PAGES của 54-thu-than.js, mặc định 0.
- Chỉ số cuối (hp/tc/pt/td) = gốc loài x hs cấp x hs tiến hóa x hs bậc. (Trong trận cộng thêm buff/debuff.)
- mm: KHÔNG tăng theo cấp, KHÔNG nhân bậc. Chỉ tăng khi tiến hóa: gốc x 1 / 1,5 / 2,2. Tác dụng: nhân tỉ lệ rớt item = gốc x (1 + mm/100), tối đa x3.
- hs cấp: hp/tc/pt = 1 + 0,07 x (cấp-1); td = 1 + 0,02 x (cấp-1).
- hs tiến hóa (tien 1/2/3): hp,tc,pt = 1 / 1,35 / 1,8; td = 1 / 1,1 / 1,2. (Item tiến hóa chưa làm: chỉ chừa trường tien.)
- Gốc loài vùng z (z = 0,1,2... theo trường z trong 51-thu-moi.js), cấp 1, vai Cân bằng: hp 150, tc 40, pt 30, td 40, mm 10, tất cả hp/tc/pt/td nhân (1 + 0,3 x z). mm không nhân theo vùng.
- Nhân theo vai: Tank hp 1,3 tc 0,8 pt 1,4 td 0,7 | Công hp 0,9 tc 1,4 pt 0,8 td 1,0 | Nhanh hp 0,85 tc 1,0 pt 0,8 td 1,5 | Cân bằng tất cả 1.
- Boss: gốc x 1,6 (hp,tc,pt,td).
- Ví dụ kiểm tra: Tuyết Hùng (Tank, z=0), cấp 15, tien 1, bậc C = hp 386, tc 63, pt 83, td 36, mm 10. Bậc SS cùng cấp = hp 521, tc 86, pt 112, td 48, mm 10 (làm tròn kiểu Math.round).

## 2. Hệ (18 hệ, bảng khắc chế nằm trong 56-chi-so.js: BANG_HE)
- 18 hệ (khung khắc chế lấy theo Pokémon, đổi tên cho hợp game): thuong, hoa, thuy, loi, moc, bang, vo, doc, tho, phong, tam (Tâm Linh), trung, nham, ma, long, am, kim, tien. Muốn đổi quan hệ nào thì sửa BANG_HE; thêm hệ mới thì thêm vào HE_TEN và BANG_HE.
- Mỗi thú 1-2 hệ (hệ chủ đạo ghi trước). 3 thú khởi đầu vẫn là Hỏa / Mộc / Thủy.
- Hệ số một đòn lên MỖI hệ của mục tiêu: khắc = CFG.he.khac (1,5), bị kháng = CFG.he.kem (0,7), miễn nhiễm = CFG.he.mien (0,3); còn lại 1. Mục tiêu 2 hệ thì NHÂN hai hệ số (CFG.he.cheDo='nhan'); đặt 'tb' để lấy trung bình. Song hệ cùng yếu = 2,25, cùng kháng = 0,49. Muốn kiểu Pokémon gốc: khac 2, kem 0,5, mien 0.
- Đòn thường tự dùng hệ có lợi nhất của người đánh. Kỹ năng dùng hệ riêng của kỹ năng.
- Kiểm tra (mục tiêu Thủy+Thổ): Mộc đánh = 2,25; Lôi đánh = 0,45 (Thổ miễn Lôi); Hỏa đánh = 0,70; thú Thủy+Thổ đánh mục tiêu Hỏa = 1,5.

## 3. Bậc
- 7 bậc E,D,C,B,A,S,SS. Tỉ lệ tung: 28 / 24 / 20 / 14 / 8 / 4,5 / 1,5 (%). Hệ số hp,tc,pt,td: 0,85 / 0,92 / 1,00 / 1,08 / 1,16 / 1,25 / 1,35. mm không nhân bậc.
- Tung bậc: khi BẮT được thú (tung SAU khi bắt xong, kiểu gacha, người chơi không biết trước) và khi chọn thú đầu game. Random hoàn toàn, thú đầu game cũng random đủ E-SS.
- Thú hoang/quái/boss khi ĐANG đánh dùng bậc cố định: thú hoang C, quái C, boss A (chỉ để tính chỉ số trong trận). Bắt xong mới tung bậc thật (boss bị bắt cũng tung ngẫu nhiên).

## 4. Cấp, EXP, Sao
- Thú có cấp 1..100 và EXP. Người chơi KHÔNG có cấp, chỉ có sao (xong một loài thú vùng lần đầu = +1 sao; vùng 9 thú + 1 boss = 10 sao).
- Trần cấp = min(100, 10 + floor(sao x 0,55)).
- EXP cần để lên cấp từ n lên n+1 = round(25 x n^1,5).
- EXP thưởng một trận = round((10 + 8 x cấpQuái) x hsChenh), hsChenh = clamp(1 + 0,1 x (cấpQuái - cấpThú), 0,3, 1,5). Boss x5, thú hoang x1,3. Thú chạm trần cấp thì không nhận EXP.
- Cấp quái vùng z (chỉnh ở CFG): từ 1 + 8 x z đến 8 + 8 x z. Boss = cấp tối đa vùng + 2.
- Thú bắt được: cấp = cấp thú hoang lúc gặp.

## 5. Sát thương
- sát thương = tc x hsKyNang x tc/(tc+pt) x hsHe x (chí mạng ? 1,5 : 1). Làm tròn xuống, tối thiểu 1.
- Đòn thường hsKyNang = 1.

## 6. Hiệu ứng và kháng
- Kháng hiệu ứng (khu) CHỈ tác dụng lên DEBUFF: mỗi debuff vừa gắn có khu% bị hủy; debuff theo giá trị (vd -15% tốc độ) thì giảm hiệu lực theo (1 - khu/100). Buff không bị ảnh hưởng.
- Đóng băng và choáng đều là debuff mất lượt. Đóng băng bị khu chặn. Choáng bị kc (kháng choáng) chặn, không dùng khu. Sau khi bị đóng băng, mục tiêu miễn nhiễm đóng băng 2 lượt.
- Buff/debuff VÙNG áp cho MỌI thú thuộc loài của vùng đó: thú, quái, boss, thú người chơi. Debuff vùng gắn lên đối thủ khi vào trận, kéo dài cả trận (vẫn bị giảm theo khu).
- Boss: 2 buff (buff vùng + buff riêng), 1 debuff (debuff vùng), 2 kỹ năng (kỹ năng cơ bản của vùng + kỹ năng độc quyền).

## 7. Buff, debuff, kỹ năng 6 vùng (z = 0..5)
Mỗi vùng: debuff / buff / kỹ năng cơ bản / boss (buff riêng + kỹ năng độc quyền). hồi chiêu = lượt.
- z0 Tuyết Nguyên: debuff Hàn Khí (đối thủ -15% td) | buff Đông Cứng (mỗi đòn gắn 1 lớp lạnh, đủ 4 lớp thì đóng băng 1 lượt, xóa lớp) | KN Băng Tinh (130% tc, gắn thêm 1 lớp lạnh, cd 3, fx có sẵn bên main) | Boss Băng Sơn Cự Thú: buff riêng Băng Giáp (+20% pt), KN Băng Sơn Áp Đỉnh (180% tc, gắn 2 lớp lạnh, cd 5)
- z1 Sương Cốc: debuff Sương Mù (đối thủ -15% cx) | buff Sương Tức (hồi 3% hp tối đa mỗi lượt) | KN Sương Phủ (120% tc, đối thủ -15% cx 2 lượt, cd 3) | Boss Vạn Trượng Vụ Thú: Sương Dày (+20% ne), KN Sương Nuốt (150% tc, hút 30% sát thương thành máu, cd 5)
- z2 Vân Đảo: debuff Vân Nặng (đối thủ -10% tc) | buff Vân Hộ (đầu trận có khiên = 15% hp tối đa) | KN Vân Tỏa (100% tc, thêm khiên 20% hp 2 lượt, cd 4) | Boss Vân Đảo Côn Bằng: Phi Thiên (+25% ne 2 lượt đầu), KN Côn Bằng Triển Sí (200% tc, tự +30% td 2 lượt, cd 5)
- z3 Phong Nguyên: debuff Cuồng Phong (đối thủ -10% ne) | buff Phong Tích (+15% td; mỗi đòn gắn 1 lớp gió, đủ 3 lớp thì thêm 1 đòn liên kích 60% tc) | KN Phong Nhận (3 nhát, mỗi nhát 50% tc, cd 3) | Boss Phong Nguyên Vũ Xà: Xà Hành (+20% td lượt đầu), KN Vũ Xà Triền (140% tc, đối thủ -50% td 2 lượt, cd 5)
- z4 Lôi Vực: debuff Tĩnh Điện (đối thủ -15% khu) | buff Lôi Kích (+15% cm; mỗi lần chí mạng 20% làm choáng 1 lượt) | KN Sấm Rền (160% tc, 20% choáng, cd 4) | Boss Lôi Vực Chiến Thần: Lôi Giáp (pd +15% phản đòn), KN Thiên Lôi Giáng (220% tc, 40% choáng, cd 6)
- z5 Nguyệt Cung: debuff Nguyệt Quang (đối thủ -20% cm) | buff Nguyệt Ảnh (+15% ne; né thành công thì lượt sau +30% tc) | KN Nguyệt Huy (140% tc, hồi 10% hp, cd 4) | Boss Nguyệt Thực Tế Quân: Nguyệt Thực (dưới 30% hp thì +30% tc và hút máu 15%), KN Nguyệt Thực Nuốt (200% tc, đối thủ -20% td, cd 5)
- Hệ của kỹ năng = hệ chủ đạo của vùng (mục 8).

## 8. Hệ chủ đạo 6 vùng và bảng loài mẫu Tuyết Nguyên (z0)
- Hệ chủ đạo vùng (hệ của kỹ năng cơ bản vùng): z0 Tuyết Nguyên = bang, z1 Sương Cốc = thuy, z2 Vân Đảo = tien, z3 Phong Nguyên = phong, z4 Lôi Vực = loi, z5 Nguyệt Cung = tam.
- Tuyết Nguyên: 1a Tuyết Cầu: Cân bằng, bang | 1b Tuyết Hùng: Tank, bang+tho | 1c Băng Lộc: Nhanh, bang+moc | 1d Tuyết Báo: Công, bang+vo | 1e Băng Hải: Tank, bang+thuy | 1f Tuyết Cú: Nhanh, bang+phong | 1g Băng Dương: Cân bằng, bang+tho | 1h Băng Linh: Công, bang+tam | 1i Băng Nham: Tank, bang+nham | 1j Băng Sơn Cự Thú (boss): Tank, bang+nham
