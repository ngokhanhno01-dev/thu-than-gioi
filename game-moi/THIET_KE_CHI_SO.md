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
- Đòn thường (đòn cơ bản) LUÔN dùng hệ đứng trước (hệ chủ đạo) của người đánh. Hệ phụ KHÔNG dùng để đánh: nó dùng để PHÒNG THỦ (tính khắc/kháng khi bị đánh) và để MANG SÁCH KỸ NĂNG cùng hệ. Thú chỉ mang được sách kỹ năng thuộc 1 trong 2 hệ của nó (vd băng + võ: mang sách băng hoặc võ; hệ khác không mang được). Kỹ năng dùng hệ riêng của kỹ năng. (Sách kỹ năng: chưa làm.)
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
- Boss: 2 buff (buff vùng + buff riêng), 1 debuff (debuff vùng), đòn cơ bản của vùng + 1 kỹ năng độc quyền (mục 7b).

## 7. Buff (nội tại), debuff, đòn cơ bản 6 vùng (z = 0..5)
Giao diện thú có 3 ô tròn: ô 1 BUFF (nội tại), ô 2 DEBUFF, ô 3 ĐÒN CƠ BẢN.
- Đòn cơ bản = đánh thường: sát thương theo chỉ số (hsKyNang = 1), KHÔNG hồi chiêu, KHÔNG hiệu ứng kèm. Mỗi vùng chỉ có một TÊN riêng (và hình ảnh đòn đánh riêng của vùng).
- Mọi hiệu ứng đặc biệt (gắn lớp, hồi máu, khiên, choáng...) thuộc về BUFF nội tại, không thuộc đòn cơ bản.
- z0 Tuyết Nguyên: debuff Hàn Khí (đối thủ -15% td) | buff Đông Cứng (mỗi đòn gắn 1 lớp lạnh, đủ 4 lớp thì đóng băng đối thủ 1 lượt, xóa lớp) | đòn cơ bản Băng Tinh | Boss Băng Sơn Cự Thú: buff riêng Băng Giáp (+20% pt)
- z1 Sương Cốc: debuff Sương Mù (đối thủ -15% cx) | buff Sương Tức (hồi 3% hp tối đa mỗi lượt) | đòn cơ bản Sương Phủ | Boss Vạn Trượng Vụ Thú: Sương Dày (+20% ne)
- z2 Vân Đảo: debuff Vân Nặng (đối thủ -10% tc) | buff Vân Hộ (đầu trận có khiên = 15% hp tối đa) | đòn cơ bản Vân Tỏa | Boss Vân Đảo Côn Bằng: Phi Thiên (+25% ne 2 lượt đầu)
- z3 Phong Nguyên: debuff Cuồng Phong (đối thủ -10% ne) | buff Phong Tích (+15% td; mỗi đòn gắn 1 lớp gió, đủ 3 lớp thì thêm 1 đòn liên kích 60% tc) | đòn cơ bản Phong Nhận | Boss Phong Nguyên Vũ Xà: Xà Hành (+20% td lượt đầu)
- z4 Lôi Vực: debuff Tĩnh Điện (đối thủ -15% khu) | buff Lôi Kích (+15% cm; mỗi lần chí mạng 20% làm choáng 1 lượt) | đòn cơ bản Sấm Rền | Boss Lôi Vực Chiến Thần: Lôi Giáp (pd +15% phản đòn)
- z5 Nguyệt Cung: debuff Nguyệt Quang (đối thủ -20% cm) | buff Nguyệt Ảnh (+15% ne; né thành công thì lượt sau +30% tc) | đòn cơ bản Nguyệt Huy | Boss Nguyệt Thực Tế Quân: Nguyệt Thực (dưới 30% hp thì +30% tc và hút máu 15%)

## 7b. Kỹ năng độc quyền của boss + sách kỹ năng (chốt 19/11/2026, cập nhật số liệu 22/11/2026)
- Mỗi boss có 1 kỹ năng độc quyền, có hồi chiêu (cd, tính lượt). Hết cd thì boss tự dùng, thay đòn cơ bản ở lượt đó. Hệ của kỹ năng là một hệ của chính boss.
- Kỹ năng cũng là một SÁCH KỸ NĂNG: CHỈ rơi khi GIẾT CHẾT boss (bắt boss không rơi), tỉ lệ 1,5% mỗi lần (độc quyền nên hiếm). mm vẫn nhân tỉ lệ rớt như mục 1 (tối đa x3). Thú chỉ mang được nếu có hệ của sách (mục 2).
- Sát thương kỹ năng = công thức mục 5 với hsKyNang bên dưới; hệ của kỹ năng đánh theo hệ kỹ năng. Debuff và mù của nội tại bị giảm theo khu (mục 6), choáng bị chặn theo kc. Mô tả sách trong game TỰ SINH từ bảng KY_NANG_BOSS (56c-buff.js), nên mục này phải khớp bảng đó.
- ks0 Băng Sơn Áp Đỉnh (boss Băng Sơn Cự Thú, hệ băng): 180% tc, cd 5. Nội tại Lạnh Thấu Xương: giảm 20% giáp đối thủ trong 2 lượt. Mô tả: khối băng khổng lồ từ trên trời giáng xuống đè đối thủ, vỡ tan thành tinh thể băng.
- ks1 Sương Nuốt (Vạn Trượng Vụ Thú, hệ thủy): 150% tc, hút 30% sát thương gây ra thành máu cho người dùng, cd 5. Nội tại Huyết Sương: sau khi dùng kỹ năng, hút thêm 10% sát thương gây ra thành máu trong 3 lượt. Mô tả: màn sương dày bao trùm đối thủ rồi bị hút về miệng boss, sương cuộn thành xoáy.
- ks2 Côn Bằng Triển Sí (Vân Đảo Côn Bằng, hệ phong): 200% tc, cd 5. Nội tại Vân Cánh: sau khi dùng kỹ năng, nhận khiên bằng 20% máu tối đa. Mô tả: Côn Bằng là cá voi khổng lồ mọc đôi cánh nhiều tầng, vỗ cánh cuốn gió và mây rồi lao xuống đâm vào đối thủ, vỡ thành cột nước và sóng quét ngang.
- ks3 Vũ Xà Triền (Phong Nguyên Vũ Xà, hệ phong): 140% tc, cd 4. Nội tại Xà Hành: sau khi dùng kỹ năng, Xuyên Giáp +15% trong 3 lượt. Mô tả: thân rắn gió quấn chặt đối thủ rồi siết lại, vòng xoáy gió trói chân.
- ks4 Thiên Lôi Giáng (Lôi Vực Chiến Thần, hệ lôi): 220% tc, cd 6. Nội tại Lôi Kích: 30% làm choáng đối thủ 1 lượt (bị kc chặn). Mô tả: chiến thần giơ vũ khí gọi cột sét từ trời đánh thẳng xuống đối thủ.
- ks5 Nguyệt Thực Nuốt (Nguyệt Thực Tế Quân, hệ ám): 200% tc, cd 5. Nội tại Nguyệt Mê: sau khi dùng kỹ năng, gây mù, đối thủ đánh hụt 40% trong 2 lượt. Mô tả: mặt trăng bị bóng đen che khuất, vòng tối nuốt lấy đối thủ.
- Lưu ý: hệ ks2 (phong) và ks5 (ám) là hệ chủ đạo của boss, khác hệ vùng (tiên, tâm linh). Muốn đổi số thì sửa một dòng trong KY_NANG_BOSS (56c-buff.js), rồi cập nhật mục này.
- ĐÃ BỎ (22/11/2026): lớp lạnh (ks0), tự +30% tốc độ (ks2), giảm tốc độ đối thủ (ks3, ks5). Lý do: trận chưa có hệ tốc độ/lớp lạnh nên không chạy, trong khi mô tả sách lại nói có. QUY TẮC: chỉ khai hiệu ứng mà trận ĐÃ chạy được (danh sách ở chú thích trên bảng KY_NANG_BOSS). Muốn thêm hiệu ứng mới thì viết code trận trước, rồi mới khai vào kỹ năng.

## 8. Hệ chủ đạo 6 vùng và bảng loài mẫu Tuyết Nguyên (z0)
- Hệ chủ đạo vùng (hệ của đòn cơ bản vùng): z0 Tuyết Nguyên = bang, z1 Sương Cốc = thuy, z2 Vân Đảo = tien, z3 Phong Nguyên = phong, z4 Lôi Vực = loi, z5 Nguyệt Cung = tam.
- Tuyết Nguyên: 1a Tuyết Cầu: Cân bằng, bang | 1b Tuyết Hùng: Tank, bang+tho | 1c Băng Lộc: Nhanh, bang+moc | 1d Tuyết Báo: Công, bang+vo | 1e Băng Hải: Tank, bang+thuy | 1f Tuyết Cú: Nhanh, bang+phong | 1g Băng Dương: Cân bằng, bang+tho | 1h Băng Linh: Công, bang+tam | 1i Băng Nham: Tank, bang+nham | 1j Băng Sơn Cự Thú (boss): Tank, bang+nham
