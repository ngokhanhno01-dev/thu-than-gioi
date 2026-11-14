# GHI CHÚ [FX 3C] — Vẽ lại BUFF BỘ TRANG BỊ (17 bộ) cho claude sau

Người dùng chê buff bộ cũ "quá sơ sài". Làm LẦN LƯỢT TỪNG BỘ. Người dùng hay hết quota nên làm từng bước nhỏ.
Trả lời tiếng Việt, ngắn gọn.

## !!! QUY TẮC MỚI NHẤT CỦA NGƯỜI DÙNG (ưu tiên cao nhất, ghi đè các mục bên dưới nếu mâu thuẫn)
1. MÀU PHẢI THEO VÙNG: mỗi bộ dùng đúng màu vùng tương ứng (xem bảng QUY TẮC MÀU). Không tự chọn màu khác.
2. KHÔNG CẦN GỬI HÌNH CHO NGƯỜI DÙNG DUYỆT NỮA (người dùng đã bảo ở bộ 7): làm xong 1 bộ thì TỰ KIỂM TRA (node --check, harness, tự chụp ảnh nếu môi trường chụp được để tự xem và tự chỉnh) rồi COMMIT + ĐẨY LUÔN lên nhánh `fx-ve-bang-code`, không chờ duyệt, không gửi ảnh.
   - Commit `[FX 3C-<số bộ>] ...` + cập nhật bảng tiến độ trong cùng commit. Báo ngắn 1-2 dòng là đã đẩy.
   - Nếu người dùng góp ý chỉnh sau đó: sửa rồi đẩy tiếp `[FX 3C-<số bộ> sửa] ...`.
   - Vẫn TUYỆT ĐỐI KHÔNG ghi vào main, và không đẩy bản lỗi cú pháp/chưa chạy thử.
   - Chụp ảnh tự kiểm tra: không có Chromium thì dùng node-canvas (xem mục "Cách xem thử"), không cần xin người dùng bật mạng.
3. Mỗi lượt chỉ làm ĐÚNG MỘT bộ rồi dừng chờ người dùng nói "tiếp".

## QUY TẮC MÀU (người dùng dặn: "làm theo kiểu màu từng vùng")
Mỗi bộ trang bị ứng với 1 vùng theo đúng thứ tự (bộ 0 = vùng 0 ...). Bộ mới PHẢI dùng màu của vùng đó (màu ZONES trong 31-combat-fx.js) làm màu chủ đạo:
deep = tối hơn, main = gần màu vùng, light = sáng hơn, core = gần trắng. KHÔNG tự chọn màu khác (counter lúc đầu làm màu đỏ là SAI, đã sửa sang màu Nguyệt Cung).
| Bộ | Vùng | Màu vùng |
|----|------|---------|
| frost | Tuyết Nguyên | #9fe4ff |
| mist | Sương Cốc | #a3e1d4 |
| cloud | Vân Đảo | #c9a8ff |
| wind | Phong Nguyên | #82f0bb |
| thunder | Lôi Vực | #ffe53a |
| counter | Nguyệt Cung | #a8b8ff |
| sun | Dương Sơn | #ffa94d |
| shield | Huyền Uyên | #947aff |
| thorn | Kim Khoáng | #e0b038 |
| revive | Ngọc Động | #18e0b0 |
| grove | Thanh Lâm | #8be04a |
| lava | Xích Hỏa Địa | #ff5a1e |
| ambush | Hắc Ám Lâm | #b0206a |
| star | Tử Tinh Hải | #b45cff |
| first | Thiên Không | #6ac4ff |
| weaken | Linh Hoa Viên | #ff7ac0 |
| judge | Thần Điện | #fff0a0 |
Nét riêng nên lấy từ tên/biểu tượng vùng (vd Nguyệt Cung = trăng khuyết → counter có trăng khuyết loảng; Dương Sơn = mặt trời/thiên thạch lửa).

## Tiến độ
| # | Bộ | Trạng thái | Ảnh mẫu |
|---|----|-----------|---------|
| 0 | frost (băng) | XONG (người dùng đã bảo làm tiếp) | tools/ref-gear/tuyet-nguyen.jpg |
| 1 | mist (sương) | XONG (người dùng bảo làm tiếp) | tools/ref-gear/suong-coc.jpg |
| 2 | cloud (mây) | XONG (người dùng bảo làm tiếp) | tools/ref-gear/van-dao.jpg |
| 3 | wind (gió) | XONG bản đầu, chờ người dùng duyệt | tools/ref-gear/phong-nguyen.jpg |
| 4 | thunder (sấm) | XONG (người dùng đã xem trên điện thoại, bảo làm tiếp) | tools/ref-gear/loi-vuc.jpg |
| 5 | counter (phản đòn) | XONG, người dùng bảo "ổn"; đã đổi sang màu Nguyệt Cung theo quy tắc màu, chờ người dùng xem lại màu | tự thiết kế: xanh tím trăng, lưỡi gai cong, vòng sáng co vào, mũi tên V, trăng khuyết |
| 6 | sun (mặt trời) | XONG, người dùng bảo "ổn" (commit ca90e8f) | tự thiết kế màu Dương Sơn #ffa94d: mặt trời mờ + tia lửa sau lưng, ngọn lửa mọc quanh trận pháp, nứt đất rỉ lửa, 4 thiên thạch bay vòng kéo đuôi lửa, mưa thiên thạch lúc vào trận |
| 7 | shield (khiên) | XONG, đã đẩy thẳng không gửi ảnh duyệt (theo yêu cầu mới của người dùng) | tự thiết kế màu Huyền Uyên #947aff: mái vòm lục giác nửa sau có sóng sáng chạy từ đỉnh xuống, 6 khiên nhỏ bay quanh, vực tím sát đất, bong bóng vực nổi lên, lúc vào trận vòm bung rộng + khiên rơi xuống |
| 8–16 | thorn, revive, grove, lava, ambush, star, first, weaken, judge | CHƯA, KHÔNG có ảnh mẫu: tự thiết kế theo màu vùng (bảng trên). Bộ kế tiếp: 8 thorn (Kim Khoáng #e0b038) | (dùng 5 ảnh mẫu làm chuẩn phong cách) |

Bộ chưa làm vẫn chạy bằng code cũ (backGear pixel) nên game không hỏng giữa chừng.

## Yêu cầu người dùng (từ ảnh mẫu — "làm thật giống từ chi tiết, trận pháp, hiệu ứng")
- Dưới chân thú có TRẬN PHÁP lớn: đĩa phát sáng, viền kép, dải rune quay, sao 6 cánh + hình thoi quay ngược, lõi sáng giữa, vết nứt đất đen từ rìa.
- Quanh thú có LỐC XOẮN: nhiều dải lưỡi liềm thon hai đầu uốn quanh (mặt tối + thân + gân sáng).
- Mỗi nguyên tố có nét RIÊNG (không chỉ đổi màu): băng = cụm tinh thể + bông tuyết; sương = mây sương cuộn + giọt nước/bong bóng;
  sấm = trụ sét vàng + nhánh sét + đá nứt; gió = lá bay + dải gió; mây = mây tím cuộn + khói tím + sao.
- Dày chi tiết, rõ trên màn hình nhỏ, vẫn nằm SAU thú (lớp nền). Nền rest luôn rõ; lúc vào trận (q>0) bừng hơn + sóng bung.
- Vẫn là canvas mịn (không ô vuông to). Không ảnh. Không Math.random (dùng hash theo chỉ số). Không đụng cơ chế trận.

## Cách code
- File: `41-gear-aura.js` (nạp sau 40 trong index.html, fx-demo.html, tools/fx-demo.html).
- Móc: `31-combat-fx.js` › `backGear()` dòng đầu: nếu `TTGGearAura[kind]` có thì gọi `(g,x,q,T,e,FXE)` rồi return (try/catch → lỗi thì rơi về code cũ).
- Thêm bộ mới: viết `REG.<kind>=function(g,x,q,T,e,E){...}` (kind = frost, mist, cloud, wind, thunder, counter, sun, shield, thorn, revive, grove, lava, ambush, star, first, weaken, judge).
- KIT dùng chung trong file: `circle(g,E,x,P,T,al,{r,ph,runeDir,cracks})` trận pháp, `swirl(g,E,x,P,T,al,{n,H,R,turns,spin,wmax,ph})` lốc xoắn,
  `sparks`, `spark4`, `halo` (quầng + sóng lúc vào trận), `level(q,T,id)` (độ đậm). Palette P = {deep,main,light,core}.
  Hàm của engine E: glow, blob, ribbon (o.add=false → vẽ thường), crystal, wave, rgba, mix. Xem `frost` làm mẫu.
- Helper có sẵn dùng lại: `curl`, `gem`, `crescent`, `wisp`, `leaf`, `slash` (vệt chém cung), `flake`, `bead`; của thunder: `zig` (đường gãy khúc), `bolt` (tia sét 3 lớp), `tree` (cành sét), `rock` (đá nứt dung nham), `dswirl` (lốc xoắn tối viền vàng; ribbon tối phải dùng add:false vì mặc định cộng sáng sẽ mất màu tối); của counter: `blade` (lưỡi gai cong); của sun: `flame` (ngọn lửa 4 lớp bập bùng), `sunDisc` (mặt trời + tia uốn), `meteor` (thiên thạch có đuôi lửa; truyền mảng pts từ đuôi → đầu); của shield: `hexp` (lục giác), `shieldIcon` (khiên nhỏ xoay), `dome` (mái vòm lục giác nửa sau + sóng sáng).
- Toạ độ: thú x=85, mặt đất GY=203, trận pháp elip tỉ lệ SQ=.4, bán kính ~58, thân y≈150, lốc cao ~110.
- Bài học: KHÔNG đặt vật thể ở cung PHÍA TRƯỚC trận pháp (che mất rune) — tinh thể/cột chỉ ở hai bên và phía sau; mọi thứ vẽ trước thú nên thú che phần giữa.
- Tham số `e` = giây từ lúc bắt đầu (dùng cho hiệu ứng mọc lên lúc vào trận); `q` = 1→0 trong 2.4s đầu trận, sau đó 0.
- Mỗi bộ thêm vào 41 phải đẩy lại CẢ file 41 (GitHub connector không vá từng đoạn): lấy bản mới nhất bằng get_file_contents rồi chèn trước `})();`.

## Chế độ pixel art (xem thử)
- File `42-gear-pixel.js` (nạp sau 41) tự bọc MỌI bộ trong `TTGGearAura`: `TTGGearAura.style='pixel'` → vẽ vào khung 240x160, nén sáng + ép 6 mức/kênh + độ trong 4 mức (dither Bayer), phóng không làm mịn. Người dùng đã CHỌN PIXEL ART (hợp với thú pixel; bản mượt bị chê quá bóng): mặc định 'pixel'. Pixel pass: alpha 3 tầng: đặc (>=.5) / bán trong suốt (.14–.5, dùng cho sương/khói: vẽ alpha ~.2–.4) / trong, màu ép mức, viền tối 1px quanh hình.
- Trang demo (fx-demo.html, tools/fx-demo.html) có ô "Kiểu: mượt / pixel art" ở chế độ buff bộ. Game thật dùng pixel mặc định.
- Bộ mới chỉ cần thêm vào 41; 42 tự bọc. Bộ mới: kiểm tra bằng ảnh chụp ở chế độ PIXEL (đừng chỉ nhìn bản mượt); tránh vật mảnh <1px (biến mất khi pixel hoá), ưu tiên khối/nét dày ≥1.5 đơn vị.

## QUY TRÌNH LÀM VIỆC (claude sau làm ĐÚNG như vậy)
1. Đọc file này + xem bảng tiến độ để biết bộ kế tiếp. Chỉ làm ĐÚNG MỘT bộ mỗi lượt, rồi dừng chờ người dùng nói "tiếp".
2. Nhìn ảnh mẫu của bộ đó trong `tools/ref-gear/` (bộ không có ảnh mẫu: tự thiết kế theo 5 ảnh làm chuẩn + MÀU VÙNG theo bảng trên, mỗi nguyên tố nét riêng).
3. Viết `REG.<kind>` trong `41-gear-aura.js` (thêm TRƯỚC dòng `})();` cuối file), dùng lại KIT (circle, swirl, sparks, halo, level, curl, gem...). Không viết lại engine. Làm trong thư mục tạm, kiểm tra xong mới đẩy.
4. `node --check` các file đã sửa; chạy harness kiểm tra không lỗi/NaN (`tools/render-gear.js` gọi thẳng REG.<kind> để lộ lỗi).
5. TỰ CHỤP HÌNH ở chế độ PIXEL (cách chụp ở mục "Cách xem thử"), tự xem ảnh, chỉnh ít nhất 1 vòng cho đến khi đúng ảnh mẫu / đúng màu vùng. Kiểm tra cả khi có thú giả che giữa.
6. KHÔNG gửi ảnh, KHÔNG hỏi duyệt (người dùng đã bảo không cần). Đi thẳng bước 7.
7. Tự kiểm tra xong là đẩy luôn: cập nhật bảng tiến độ TRONG CÙNG commit, commit `[FX 3C-<số bộ>] ...` (sửa theo góp ý: `[FX 3C-<số bộ> sửa] ...`), đẩy nhánh `fx-ve-bang-code`. TUYỆT ĐỐI KHÔNG ghi vào main. Báo ngắn 1-2 dòng là đã đẩy, rồi dừng chờ "tiếp".
8. Người dùng không rành code, dùng điện thoại Android, hay hết quota → trả lời ngắn, mỗi lượt đúng một việc nhỏ, không đẩy bản chưa kiểm tra cú pháp/chạy thử.

## Điều người dùng ĐÃ DUYỆT / ĐÃ YÊU CẦU (đừng làm trái)
- Làm theo ảnh mẫu "thật giống từ chi tiết, trận pháp, hiệu ứng".
- Màu mỗi bộ = màu vùng tương ứng (xem QUY TẮC MÀU).
- KHÔNG cần gửi ảnh cho người dùng duyệt nữa, làm xong đẩy luôn lên nhánh (xem QUY TẮC MỚI NHẤT ở đầu file). Quy tắc "gửi ảnh duyệt trước" cũ đã bị HỦY.
- Kiểu PIXEL ART là mặc định (thú của game là pixel art; bản vẽ mượt bị chê quá bóng và quá rõ khi đặt gần thú). Đã duyệt pixel pass hiện tại (alpha cứng + viền tối 1px + tầng bán trong suốt).
- Frost (0), Mist (1), Cloud (2), Thunder (4): người dùng đã xem và bảo làm tiếp (coi như duyệt). Counter (5): người dùng bảo "ổn" nhưng yêu cầu màu theo vùng (đã sửa). Wind (3): đã đẩy, chờ người dùng xem. Sun (6): người dùng bảo "ổn". Shield (7): đẩy thẳng theo quy tắc mới, chưa có phản hồi.
- Mist: sương phải MỜ, TRONG SUỐT, không che nền (đã sửa theo góp ý; sương/khói nói chung vẽ alpha ~.2–.4 để rơi vào tầng bán trong suốt).
- Buff vẫn là lớp NỀN vẽ trước thú; không đè lên thân thú.
- Những bộ chưa làm tiếp tục chạy code cũ, không được làm hỏng game giữa chừng.

## Cách xem thử
- Điện thoại: mở `fx-demo.html` của nhánh → chọn "Buff bộ trang bị" → chọn bộ. (Trang demo cố định elapsed=.7 nên chỉ thấy trạng thái lúc vào trận.)
- Chụp hình để tự kiểm tra, ưu tiên cách node-canvas (KHÔNG cần Chromium, không cần mạng ngoài npm): `npm i canvas` rồi `node tools/render-gear.js <kind>` ở gốc repo → ra `tools/tam/gear_<kind>_rest.png` và `_enter.png` (phóng x2, chế độ pixel, có thú giả). Mở ảnh để tự xem. Script cũng gọi thẳng `TTGGearAura[kind]` vì backGear nuốt lỗi (try/catch). Đừng commit ảnh trong `tools/tam/`.
- Cách dự phòng bằng Chrome/Chromium + playwright (nếu có `/usr/bin/google-chrome`): chạy `python3 -m http.server` ở gốc repo, trang test gọi
  `TTGCombatFX.drawBack(g,T,elapsed,0,{startBuffs:[{kind}],zoneBuff:null},0,0,100,100,0,0)` với elapsed=10 (nền) và .7 (vào trận),
  canvas 360x240 phóng x3, chụp bằng playwright (launch executable_path=/usr/bin/google-chrome, args --no-sandbox). Nhớ vẽ 1 hình bầu dục giả làm thú để thấy che chắn.
