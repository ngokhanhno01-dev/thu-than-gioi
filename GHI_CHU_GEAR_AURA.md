# GHI CHÚ [FX 3C] — Vẽ lại BUFF BỘ TRANG BỊ (17 bộ) cho claude sau

Người dùng chê buff bộ cũ "quá sơ sài". Làm LẦN LƯỢT TỪNG BỘ. Người dùng hay hết quota nên làm từng bước nhỏ.
Trả lời tiếng Việt, ngắn gọn.

## !!! QUY TẮC MỚI NHẤT CỦA NGƯỜI DÙNG (ưu tiên cao nhất, ghi đè các mục bên dưới nếu mâu thuẫn)

### A. QUY TẮC VỀ NỘI DUNG HIỆU ỨNG (người dùng dặn sau khi xem bộ 7 shield — ĐỌC KỸ, đừng làm sai nữa)
1. TÊN TRONG DEMO PHẢI LÀ TÊN VÙNG, không phải tên hình/vật (không "Shield · Khiên", "Thorn · Gai"...). Ô chọn bộ ở `fx-demo.html` và `tools/fx-demo.html` hiện đúng tên vùng (Tuyết Nguyên, Sương Cốc, Vân Đảo, ..., Huyền Uyên, Kim Khoáng...). Chỉ đổi chữ hiển thị, giữ nguyên value (frost, mist, ..., shield, thorn...) để code không hỏng. ĐÃ SỬA XONG cả 2 file (17 bộ); bộ mới thêm sau này không cần sửa gì thêm ở demo.
2. LẤY MẤY VÙNG TRƯỚC ĐÃ HOÀN THÀNH LÀM MẪU (frost, mist, cloud, wind, thunder, counter, sun) rồi làm theo cùng kiểu: trận pháp dưới chân + lốc xoắn + nét riêng của vùng.
3. ĐỪNG LÀM NHƯ KIỂU "KHIÊN" HAY "GAI" (tên kind chỉ là nhãn nội bộ): bước đó CÓ NGƯỜI LÀM RỒI (4 món trang bị của vùng đã có sẵn). Không vẽ cái khiên, cái gai... làm hiệu ứng chính. Chủ đề phải lấy từ VÙNG (tên vùng, môi trường, biểu tượng vùng).
   - Vd Huyền Uyên: vực xoáy, xúc tu, mắt vực (KHÔNG phải khiên). Kim Khoáng (bộ 8): khoáng thạch, mạch kim loại, tinh thể vàng, bụi quặng (KHÔNG phải gai nhọn).
4. HIỆU ỨNG NÀY LÀ HIỆU ỨNG KHI MẶC NGUYÊN 1 BỘ 4 MÓN TRANG BỊ CỦA VÙNG ĐÓ (buff bộ), nên phải thể hiện sức mạnh/không khí của cả vùng, không phải 1 món đồ.

### B. QUY TẮC LÀM VIỆC (người dùng dặn trước đó)
1. MÀU PHẢI THEO VÙNG: mỗi bộ dùng đúng màu vùng tương ứng (xem bảng QUY TẮC MÀU). Không tự chọn màu khác.
2. KHÔNG CẦN GỬI HÌNH CHO NGƯỜI DÙNG DUYỆT NỮA (người dùng đã bảo ở bộ 7): làm xong 1 bộ thì TỰ KIỂM TRA (node --check, harness, tự chụp ảnh nếu môi trường chụp được để tự xem và tự chỉnh) rồi COMMIT + ĐẨY LUÔN lên nhánh `fx-ve-bang-code`, không chờ duyệt, không gửi ảnh.
   - Commit `[FX 3C-<số bộ>] ...` + cập nhật bảng tiến độ trong cùng commit. Báo ngắn 1-2 dòng là đã đẩy.
   - Nếu người dùng góp ý chỉnh sau đó: sửa rồi đẩy tiếp `[FX 3C-<số bộ> sửa] ...`.
   - Vẫn TUYỆT ĐỐI KHÔNG ghi vào main, và không đẩy bản lỗi cú pháp/chưa chạy thử.
   - Chụp ảnh tự kiểm tra: không có Chromium thì dùng node-canvas (xem mục "Cách xem thử"), không cần xin người dùng bật mạng.
3. Mỗi lượt chỉ làm ĐÚNG MỘT bộ rồi dừng chờ người dùng nói "tiếp".
4. LÀM XONG PHẢI CẬP NHẬT GHI CHÚ NÀY (bảng tiến độ + quy tắc mới nếu có) TRONG CÙNG COMMIT, để claude sau hiểu và làm theo. Đừng đẩy mỗi file code mà quên ghi chú. (Lượt làm bộ 9 đã quên bước này → lượt sau phải cập nhật bù. Đừng để lặp lại: commit code và ghi chú CÙNG LÚC, hoặc đẩy ghi chú NGAY sau code trước khi dừng.)

## VIỆC CÒN TỒN
- [x] Đổi tên hiển thị trong ô chọn bộ của `fx-demo.html` và `tools/fx-demo.html` thành tên vùng (XONG, commit ee10771 và 000f987).
- [x] Bộ 8 thorn (Kim Khoáng) — XONG (commit 12e0690).
- [x] Bộ 9 revive (Ngọc Động) — XONG (commit aed3d69), đã tự chụp ảnh pixel + chạy NaN-harness 54 tổ hợp (q,e,T) 0 lỗi. Chờ người dùng xem.
- [x] Bộ 10 grove (Thanh Lâm) — XONG (commit 21fc95b), đã tự chụp ảnh pixel + chỉnh (tăng cỡ rễ/nấm, thêm đom đóm + lá xoáy) + harness 0 lỗi/NaN. Chờ người dùng xem.
- [x] Bộ 11 lava (Xích Hỏa Địa) — XONG, đã đẩy, CHƯA tự chụp ảnh (lượt đó không có mạng/node-canvas; chỉ `node --check` + harness giả 63 tổ hợp (q,e,T) 0 lỗi/NaN). Chờ người dùng xem; lượt sau nếu chụp được thì chụp bù (`node tools/render-gear.js lava`).
- [x] Bộ 12 ambush (Hắc Ám Lâm) — XONG, đã đẩy, CHƯA tự chụp ảnh (không có mạng/node-canvas; chỉ `node --check` + harness giả 63 tổ hợp (q,e,T) 0 lỗi/NaN). Chờ người dùng xem; lượt sau chụp được thì chụp bù bộ 11 lava và 12 ambush (`node tools/render-gear.js <kind>`).
- [x] Bộ 13 star (Tử Tinh Hải) — XONG, đã đẩy, CHƯA tự chụp ảnh (không có mạng/node-canvas; chỉ `node --check` + `node tools/nan-harness.js star` 0 lỗi/NaN). Chờ người dùng xem.
- [x] Bộ 14 first (Thiên Không) — XONG, đã đẩy, CHƯA tự chụp ảnh (không có mạng/node-canvas; `node --check` + `node tools/nan-harness.js first` 0 lỗi/NaN). Chờ người dùng xem.
- [x] Bộ 15 weaken (Linh Hoa Viên) — XONG, đã đẩy, CHƯA tự chụp ảnh (không có mạng/node-canvas; `node --check` + `node tools/nan-harness.js weaken` 0 lỗi/NaN). Chờ người dùng xem. Lưu ý hiệu năng: bộ này nặng hơn (~2000 lệnh vẽ/khung, các bộ khác ~900) do nhiều hoa; nếu game giật thì giảm số dây leo/hoa.
- [ ] Bộ kế tiếp: 16 judge (Thần Điện #fff0a0) — BỘ CUỐI. Làm theo quy tắc A (điện thần vàng nhạt: cột đá điện, cán cân/ấn pháp, tia sáng phán xét từ trên, ký tự/rune thiêng, cánh cửa điện; KHÔNG trùng bộ 14 first (cổng trời xanh) và bộ 4 thunder (vàng sét); chủ đề là không khí cả vùng). Làm xong báo người dùng đã đủ 17 bộ và đề nghị chụp bù ảnh các bộ 8, 11–16 khi có node-canvas.
- Lưu ý khi sửa 2 file demo: chúng hơi khác nhau (bản tools có thêm khiên/thiêu đốt lặp/ảnh mẫu). Chỉ sửa đúng chỗ cần, đừng ghi đè file này bằng bản của file kia.
- Lưu ý môi trường: lượt kiểm tra bù bộ 9 có mạng: `git clone` nhánh + `npm i canvas` chạy được, nên bộ 8 vẫn nên được chụp bù nếu chưa chụp (`node tools/render-gear.js thorn`).
- Lưu ý môi trường (cũ): có lượt Claude không có mạng (không `npm i canvas`, không clone repo). Khi đó vẫn kiểm tra được bằng harness giả (Proxy cho ctx và E, stub KIT) để bắt lỗi cú pháp/NaN, nhưng KHÔNG xem được ảnh → ghi rõ "chưa tự chụp ảnh" trong báo cáo, và lượt sau nếu có môi trường chụp được thì chụp bù bộ đó.

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
Nét riêng nên lấy từ tên/biểu tượng vùng (vd Nguyệt Cung = trăng khuyết → counter có trăng khuyết loảng; Dương Sơn = mặt trời/thiên thạch lửa; Huyền Uyên = vực xoáy/xúc tu/mắt vực; Kim Khoáng = tinh thể vàng/khối quặng mạch vàng; Ngọc Động = ngọc bích/măng đá ngọc/giọt ngọc/hang động).

## Tiến độ
| # | Bộ (vùng) | Trạng thái | Ảnh mẫu |
|---|----|-----------|---------|
| 0 | frost (Tuyết Nguyên) | XONG (người dùng đã bảo làm tiếp) | tools/ref-gear/tuyet-nguyen.jpg |
| 1 | mist (Sương Cốc) | XONG (người dùng bảo làm tiếp) | tools/ref-gear/suong-coc.jpg |
| 2 | cloud (Vân Đảo) | XONG (người dùng bảo làm tiếp) | tools/ref-gear/van-dao.jpg |
| 3 | wind (Phong Nguyên) | XONG bản đầu, chờ người dùng duyệt | tools/ref-gear/phong-nguyen.jpg |
| 4 | thunder (Lôi Vực) | XONG (người dùng đã xem trên điện thoại, bảo làm tiếp) | tools/ref-gear/loi-vuc.jpg |
| 5 | counter (Nguyệt Cung) | XONG, người dùng bảo "ổn"; đã đổi sang màu Nguyệt Cung theo quy tắc màu, chờ người dùng xem lại màu | tự thiết kế: xanh tím trăng, lưỡi gai cong, vòng sáng co vào, mũi tên V, trăng khuyết |
| 6 | sun (Dương Sơn) | XONG, người dùng bảo "ổn" (commit ca90e8f) | tự thiết kế màu Dương Sơn #ffa94d: mặt trời mờ + tia lửa sau lưng, ngọn lửa mọc quanh trận pháp, nứt đất rỉ lửa, 4 thiên thạch bay vòng kéo đuôi lửa, mưa thiên thạch lúc vào trận |
| 7 | shield (Huyền Uyên) | XONG BẢN VẼ LẠI (commit 3a179c9 `[FX 3C-7 sửa]`): vẽ lại theo chủ đề vùng Huyền Uyên #947aff = mắt vực, vực xoáy, xúc tu; ĐÃ BỎ hình khiên. Bản đầu (mái vòm lục giác + 6 khiên nhỏ) bị người dùng chê là sai hướng. Chờ người dùng xem. | tự thiết kế, xem `REG.shield` trong 41-gear-aura.js |
| 8 | thorn (Kim Khoáng) | XONG, đã đẩy thẳng (commit 12e0690), CHƯA tự chụp ảnh (môi trường lượt đó không có mạng/node-canvas; chỉ qua `node --check` + harness giả 0 lỗi/NaN với q∈{0,.3,1}, e∈{null,0..3}). Chờ người dùng xem; nếu lệch thì sửa `[FX 3C-8 sửa]`. Chủ đề vùng Kim Khoáng #e0b038 (KHÔNG vẽ gai): chùm tia tinh thể vàng mờ sau lưng, cụm tinh thể vàng (E.crystal) + khối quặng có mạch vàng ở hai bên/sau trận pháp, nứt đất đen rỉ vàng, mảnh kim loại góc cạnh bay quanh, bụi quặng vàng bốc lên, lúc vào trận quặng vàng rơi từ trên cao + sóng va đất | tự thiết kế, xem `REG.thorn` trong 41-gear-aura.js |
| 9 | revive (Ngọc Động) | XONG, đã đẩy (commit aed3d69), ĐÃ tự chụp ảnh pixel (node-canvas) + NaN-harness 0 lỗi. Chủ đề vùng Ngọc Động #18e0b0 (KHÔNG vẽ cánh/thập tự): vòng ngọc bích mờ sau lưng (`bi`), măng đá ngọc hai bên/sau trận pháp (`stalag`), sương hang động bán trong suốt, giọt ngọc rơi chạm đất toả gợn sóng, 3 vòng sinh khí dâng lên, 5 ngọc châu bay quanh (`pearl`), đom đóm ngọc; lúc vào trận vòng ngọc bừng to + 6 ngọc châu toả hình quạt. Chờ người dùng xem; nếu lệch thì sửa `[FX 3C-9 sửa]`. | tự thiết kế, xem `REG.revive` trong 41-gear-aura.js |
| 10 | grove (Thanh Lâm) | XONG, đã đẩy (commit 21fc95b), đã tự chụp ảnh pixel + harness 0 lỗi. Chủ đề vùng Thanh Lâm #8be04a (KHÔNG vẽ cây/khiên đơn lẻ): tán lá toả tia mờ sau lưng (`canopy`), rễ cổ thụ vỏ nâu có gân rêu + lá non (`rootv`) và nấm phát sáng (`shroom`) hai bên/sau trận pháp, sương rừng bán trong suốt, 12 lá lớn xoáy quanh thú (vàng-lục), đom đóm lập loè, bào tử xanh bốc lên; lúc vào trận tán lá bừng to + 8 lá bắn hình quạt. Chờ người dùng xem; nếu lệch thì sửa `[FX 3C-10 sửa]`. | tự thiết kế, xem `REG.grove` trong 41-gear-aura.js |
| 11 | lava (Xích Hỏa Địa) | XONG, đã đẩy, CHƯA tự chụp ảnh (chỉ node --check + harness giả 0 lỗi/NaN). Chủ đề vùng #ff5a1e (KHÔNG vẽ mặt trời/thiên thạch): núi lửa mờ sau lưng có dòng dung nham chảy sườn + miệng núi toả sáng (`volcano`), nứt đất rộng rực đỏ, cột đá bazan mạch lửa (`column`) + hồ dung nham sủi bọt (`pool`) hai bên/sau, bom dung nham bay vòng cung có đuôi (`lbomb`), tro đen rơi + than hồng bốc lên; lúc vào trận miệng núi bùng nổ + 8 bom toả quạt. Chờ người dùng xem; lệch thì sửa `[FX 3C-11 sửa]`. | tự thiết kế, xem `REG.lava` trong 41-gear-aura.js |
| 12 | ambush (Hắc Ám Lâm) | XONG, đã đẩy, CHƯA tự chụp ảnh (chỉ node --check + harness giả 0 lỗi/NaN). Chủ đề vùng #b0206a (rừng tối phục kích, KHÔNG trùng grove): trăng đen viền hồng sau lưng (`bmoon`), cây khô đen gân hồng (`dtree`) + dây gai đen (`thornvine`) hai bên/sau trận pháp, các cặp mắt hồng mở/nhắm trong bóng tối (`eyes`), dơi bay vòng quanh thú (`bat`), 6 bàn tay bóng tối trồi lên từ đất hai bên/sau (`hand`, người dùng yêu cầu thêm ở `[FX 3C-12 sửa]`), sương đen tím bán trong suốt; lúc vào trận trăng đen bừng, mắt bật mở, bầy dơi toả quạt. Chờ người dùng xem; lệch thì sửa `[FX 3C-12 sửa]`. | tự thiết kế, xem `REG.ambush` trong 41-gear-aura.js |
| 13 | star (Tử Tinh Hải) | XONG, đã đẩy, CHƯA tự chụp ảnh (chỉ node --check + nan-harness 0 lỗi/NaN). Chủ đề vùng #b45cff (biển sao tím, KHÔNG trùng cloud/shield): thiên hà xoắn ốc mờ sau lưng (`galaxy`), sóng biển tím cuộn cao có bọt sao hai bên/sau trận pháp (`swell`), sao 5 cánh nổi quanh thú (`star5`), sao băng rơi chéo (`comet`), bụi sao; lúc vào trận thiên hà bừng to + 8 sao 5 cánh toả quạt. Chờ người dùng xem; lệch thì sửa `[FX 3C-13 sửa]`. | tự thiết kế, xem `REG.star` trong 41-gear-aura.js |
| 14 | first (Thiên Không) | XONG, đã đẩy, CHƯA tự chụp ảnh (chỉ node --check + nan-harness 0 lỗi/NaN). Chủ đề vùng #6ac4ff (bầu trời cao, KHÔNG trùng frost/cloud/wind): cổng trời vòm cung mờ sau lưng toả tia (`gate`), cột sáng từ trời chiếu xuống hai bên/sau trận pháp (`beam`), mây cao nhỏ trôi, chim sáng bay vòng (`bird`), lông vũ sáng rơi chậm (`feather`); lúc vào trận cổng trời bừng to + chim/lông vũ toả quạt. Chờ người dùng xem; lệch thì sửa `[FX 3C-14 sửa]`. | tự thiết kế, xem `REG.first` trong 41-gear-aura.js |
| 15 | weaken (Linh Hoa Viên) | XONG, đã đẩy, CHƯA tự chụp ảnh (chỉ node --check + nan-harness 0 lỗi/NaN). Chủ đề vùng #ff7ac0 (vườn hoa linh, hồng sáng ngọt, KHÔNG trùng grove/ambush): đoá hoa khổng lồ 8 cánh mờ sau lưng (`blossom`), dây leo nâu hồng nở hoa (`flowervine`) + hoa đất hai bên/sau trận pháp, bướm hoa vỗ cánh bay vòng (`butterfly`), cánh hoa rơi xoáy (`petal`), phấn hoa; lúc vào trận đoá hoa nở bừng to + 8 cánh hoa toả quạt. Chờ người dùng xem; lệch thì sửa `[FX 3C-15 sửa]`. | tự thiết kế, xem `REG.weaken` trong 41-gear-aura.js |
| 16 | judge | CHƯA, KHÔNG có ảnh mẫu: tự thiết kế theo MÀU + CHỦ ĐỀ VÙNG (bảng trên, quy tắc A). Bộ kế tiếp và CUỐI: 16 judge (Thần Điện #fff0a0) | (dùng các bộ 0–6 đã xong làm chuẩn phong cách) |

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
- Thêm bộ mới: viết `REG.<kind>=function(g,x,q,T,e,E){...}` (kind = frost, mist, cloud, wind, thunder, counter, sun, shield, thorn, revive, grove, lava, ambush, star, first, weaken, judge). `kind` chỉ là nhãn nội bộ, KHÔNG quyết định hình dạng hiệu ứng (xem quy tắc A.3).
- KIT dùng chung trong file: `circle(g,E,x,P,T,al,{r,ph,runeDir,cracks})` trận pháp, `swirl(g,E,x,P,T,al,{n,H,R,turns,spin,wmax,ph})` lốc xoắn,
  `sparks`, `spark4`, `halo` (quầng + sóng lúc vào trận), `level(q,T,id)` (độ đậm). Palette P = {deep,main,light,core}.
  Hàm của engine E: glow, blob, ribbon (o.add=false → vẽ thường), crystal (palette riêng {dark,mid,light,edge}), wave, rgba, mix. Xem `frost` làm mẫu.
- Helper có sẵn dùng lại: `curl`, `gem`, `crescent`, `wisp`, `leaf`, `slash` (vệt chém cung), `flake`, `bead`; của thunder: `zig` (đường gãy khúc), `bolt` (tia sét 3 lớp), `tree` (cành sét), `rock` (đá nứt dung nham), `dswirl` (lốc xoắn tối viền vàng; ribbon tối phải dùng add:false vì mặc định cộng sáng sẽ mất màu tối); của counter: `blade` (lưỡi gai cong); của sun: `flame` (ngọn lửa 4 lớp bập bùng), `sunDisc` (mặt trời + tia uốn), `meteor` (thiên thạch có đuôi lửa; truyền mảng pts từ đuôi → đầu); của shield (Huyền Uyên): `eye` (mắt vực ◉), `vortex` (vực xoáy), `tendril` (xúc tu); của thorn (Kim Khoáng): `ore` (khối quặng mạch vàng), `lode` (chùm tia tinh thể toả sau lưng), `shard` (mảnh kim loại góc cạnh); của revive (Ngọc Động): `bi` (vòng ngọc bích), `stalag` (măng đá ngọc có giọt rơi), `pearl` (ngọc châu bóng); của grove (Thanh Lâm): `canopy` (tán lá toả tia mờ), `rootv` (rễ cổ thụ có rêu + lá non), `shroom` (nấm phát sáng); của lava (Xích Hỏa Địa): `volcano` (núi lửa mờ), `column` (cột bazan mạch lửa), `pool` (hồ dung nham), `lbomb` (bom dung nham); của ambush (Hắc Ám Lâm): `bmoon` (trăng đen), `dtree` (cây khô gân hồng), `thornvine` (dây gai đen), `eyes` (cặp mắt hồng), `bat` (dơi), `hand` (bàn tay trồi từ đất); của star (Tử Tinh Hải): `galaxy` (thiên hà xoắn ốc), `swell` (sóng biển tím cuộn), `star5` (sao 5 cánh), `comet` (sao băng); của first (Thiên Không): `gate` (cổng trời), `beam` (cột sáng từ trời), `feather` (lông vũ sáng), `bird` (chim sáng); của weaken (Linh Hoa Viên): `blossom` (đoá hoa n cánh), `flowervine` (dây leo nở hoa), `petal` (cánh hoa rơi), `butterfly` (bướm hoa).
- Toạ độ: thú x=85, mặt đất GY=203, trận pháp elip tỉ lệ SQ=.4, bán kính ~58, thân y≈150, lốc cao ~110.
- Bài học: KHÔNG đặt vật thể ở cung PHÍA TRƯỚC trận pháp (che mất rune) — tinh thể/cột chỉ ở hai bên và phía sau; mọi thứ vẽ trước thú nên thú che phần giữa.
- Tham số `e` = giây từ lúc bắt đầu (dùng cho hiệu ứng mọc lên lúc vào trận); `q` = 1→0 trong 2.4s đầu trận, sau đó 0.
- Mỗi bộ thêm vào 41 phải đẩy lại CẢ file 41 (GitHub connector không vá từng đoạn): lấy bản mới nhất bằng get_file_contents rồi chèn trước `})();`. Sau khi đẩy, dùng get_commit (detail stats) kiểm tra commit chỉ có dòng THÊM (additions≈số dòng bộ mới, deletions=0) để chắc không làm hỏng chỗ khác.

## Chế độ pixel art (xem thử)
- File `42-gear-pixel.js` (nạp sau 41) tự bọc MỌI bộ trong `TTGGearAura`: `TTGGearAura.style='pixel'` → vẽ vào khung 240x160, nén sáng + ép 6 mức/kênh + độ trong 4 mức (dither Bayer), phóng không làm mịn. Người dùng đã CHỌN PIXEL ART (hợp với thú pixel; bản mượt bị chê quá bóng): mặc định 'pixel'. Pixel pass: alpha 3 tầng: đặc (>=.5) / bán trong suốt (.14–.5, dùng cho sương/khói: vẽ alpha ~.2–.4) / trong, màu ép mức, viền tối 1px quanh hình.
- Trang demo (fx-demo.html, tools/fx-demo.html) có ô "Kiểu: mượt / pixel art" ở chế độ buff bộ. Game thật dùng pixel mặc định.
- Bộ mới chỉ cần thêm vào 41; 42 tự bọc. Bộ mới: kiểm tra bằng ảnh chụp ở chế độ PIXEL (đừng chỉ nhìn bản mượt); tránh vật mảnh <1px (biến mất khi pixel hoá), ưu tiên khối/nét dày ≥1.5 đơn vị.

## QUY TRÌNH LÀM VIỆC (claude sau làm ĐÚNG như vậy)
1. Đọc file này + xem bảng tiến độ và mục "VIỆC CÒN TỒN" để biết việc kế tiếp. Chỉ làm ĐÚNG MỘT bộ mỗi lượt, rồi dừng chờ người dùng nói "tiếp".
2. Nhìn ảnh mẫu của bộ đó trong `tools/ref-gear/` (bộ không có ảnh mẫu: tự thiết kế theo các bộ 0–6 làm chuẩn + MÀU VÙNG + CHỦ ĐỀ VÙNG, mỗi nguyên tố nét riêng). Nhớ quy tắc A: không vẽ theo tên kind (khiên/gai...).
3. Viết `REG.<kind>` trong `41-gear-aura.js` (thêm TRƯỚC dòng `})();` cuối file), dùng lại KIT (circle, swirl, sparks, halo, level, curl, gem...). Không viết lại engine. Làm trong thư mục tạm, kiểm tra xong mới đẩy.
4. `node --check` các file đã sửa; chạy harness kiểm tra không lỗi/NaN (`tools/render-gear.js` gọi thẳng REG.<kind> để lộ lỗi; nếu không có repo/mạng thì dùng harness giả như ghi ở "VIỆC CÒN TỒN").
5. TỰ CHỤP HÌNH ở chế độ PIXEL (cách chụp ở mục "Cách xem thử"), tự xem ảnh, chỉnh ít nhất 1 vòng cho đến khi đúng ảnh mẫu / đúng màu + chủ đề vùng. Kiểm tra cả khi có thú giả che giữa. (Không chụp được thì ghi rõ trong báo cáo + bảng tiến độ.)
6. KHÔNG gửi ảnh, KHÔNG hỏi duyệt (người dùng đã bảo không cần). Đi thẳng bước 7.
7. Tự kiểm tra xong là đẩy luôn: cập nhật bảng tiến độ + ghi chú TRONG CÙNG COMMIT, commit `[FX 3C-<số bộ>] ...` (sửa theo góp ý: `[FX 3C-<số bộ> sửa] ...`), đẩy nhánh `fx-ve-bang-code`. TUYỆT ĐỐI KHÔNG ghi vào main. Báo ngắn 1-2 dòng là đã đẩy, rồi dừng chờ "tiếp".
8. Người dùng không rành code, dùng điện thoại Android, hay hết quota → trả lời ngắn, mỗi lượt đúng một việc nhỏ, không đẩy bản chưa kiểm tra cú pháp/chạy thử.

## CÁCH LÀM NHANH (cách đã làm bộ 10–13, người dùng khen "rất nhanh, rất hợp ý" → claude sau làm đúng thế này)
1. Chuẩn bị (1–2 lệnh): `add_repo` (access push) → `git clone --depth 1 --branch fx-ve-bang-code <url> /home/claude/thu-than-gioi` → `register_repo_root`. Chỉ đọc `GHI_CHU_GEAR_AURA.md` + đuôi `41-gear-aura.js` (bộ gần nhất làm MẪU, đọc 1 lần ~130 dòng cuối là đủ; KIT đầu file đã có tóm tắt ở mục "Cách code"). Không cần đọc 31/42.
2. Bash KHÔNG có mạng trên tài khoản này → không `npm i canvas` được → không chụp được ảnh. Đừng mất lượt loay hoay: kiểm bằng `node --check 41-gear-aura.js` rồi `node tools/nan-harness.js <kind>` (canvas giả, 63 tổ hợp q/e/T, bắt lỗi chạy + NaN). Báo thẳng "chưa chụp ảnh" cho người dùng. (Có canvas thì dùng `tools/render-gear.js` như mục "Cách xem thử".)
3. Khung chuẩn của 1 bộ (copy từ bộ trước rồi đổi, mọi bộ 9–13 đều cùng khung): `halo` → vật lớn mờ sau lưng (vòng ngọc/tán lá/núi lửa/trăng đen/thiên hà, vẽ ở GY-86) → `circle` (r:58, ph mới, runeDir đổi chiều) → sương `E.blob` sát đất → danh sách vật hai bên/sau trận pháp (góc `ang0=-.3+t*1.75`, rp≈58·(.97+hash·.12), KHÔNG đặt ở cung trước), `sort` theo y, vẽ y<GY → `swirl` ×2 → vẽ y>=GY → vật bay quanh thú (6–12 cái, vòng quay theo T) → khối riêng khi vào trận (`if(a>0&&e!=null&&e<1)`: vật to bừng + 6–8 cái toả quạt) → bụi/đom đóm bốc lên → `sparks`. 100–140 dòng/bộ.
4. Mỗi bộ chỉ cần ~4–5 helper riêng (viết ngay trên REG, dùng lại `E.ribbon/E.glow/E.blob/E.wave`, `leaf/flame/crystal...`), mỗi helper nhận `al` và thoát sớm khi `al<=.02`. Mọi số ngẫu nhiên dùng `hash(...)`, không Math.random. Màu nền tối của vật (đá/cây khô) dùng `add:false` hoặc `source-over` để không bị cộng sáng mất màu tối.
5. Sửa bằng Python/Edit: thêm bộ mới bằng Edit thay đoạn đuôi file (`sparks(...);\n  }finally{g.restore()}\n };\n})();` là duy nhất ở cuối) — SAU KHI thay chuỗi bằng Python phải `grep` kiểm lại chỗ vừa sửa đã thật sự đổi (đã từng thay trượt 1 dòng `dI`), rồi chạy lại harness.
6. Commit CHUNG code + ghi chú (bảng tiến độ, "VIỆC CÒN TỒN", danh sách helper, mục "ĐÃ DUYỆT") trong 1 commit `[FX 3C-<số>] ...`, cuối message thêm 2 dòng `Co-Authored-By: Claude ... <noreply@anthropic.com>` + `Claude-Session: ...` theo system-reminder; đẩy bằng `git -c push.negotiate=true push origin fx-ve-bang-code`. Sau đó `git show --stat HEAD` xác nhận chỉ có dòng THÊM.
7. Báo người dùng ngắn bằng tiếng Việt: đã đẩy commit nào, có gì trong hiệu ứng (1–2 câu), chưa chụp ảnh (nếu vậy), mời xem demo rồi nói "tiếp". Người dùng hay xin thêm chi tiết nhỏ (vd bộ 12: "thêm bàn tay trồi từ đất") → làm ngay thành commit `[FX 3C-<số> sửa]` 1 helper mới + 1 khối nhỏ trong danh sách vật, không viết lại cả bộ.
8. Gợi ý chủ đề các bộ còn lại: 14 first = Thiên Không (cổng trời, cột sáng từ trên, cánh sáng/chim, mây cao); 15 weaken = Linh Hoa Viên (vườn hoa hồng #ff7ac0: hoa nở, cánh hoa rơi, dây leo hoa, bướm/phấn hoa); 16 judge = Thần Điện (điện thần vàng nhạt #fff0a0: cột đá điện, cán cân/ấn pháp, tia sáng phán xét, ký tự thiêng). Làm đủ 17 bộ thì báo người dùng.

## Điều người dùng ĐÃ DUYỆT / ĐÃ YÊU CẦU (đừng làm trái)
- Làm theo ảnh mẫu "thật giống từ chi tiết, trận pháp, hiệu ứng".
- Màu mỗi bộ = màu vùng tương ứng (xem QUY TẮC MÀU). Chủ đề mỗi bộ = chủ đề vùng, KHÔNG phải hình khiên/gai... (quy tắc A).
- Tên trong demo = tên vùng (quy tắc A.1, đã làm).
- KHÔNG cần gửi ảnh cho người dùng duyệt nữa, làm xong đẩy luôn lên nhánh (xem QUY TẮC B.2). Quy tắc "gửi ảnh duyệt trước" cũ đã bị HỦY.
- Kiểu PIXEL ART là mặc định (thú của game là pixel art; bản vẽ mượt bị chê quá bóng và quá rõ khi đặt gần thú). Đã duyệt pixel pass hiện tại (alpha cứng + viền tối 1px + tầng bán trong suốt).
- Frost (0), Mist (1), Cloud (2), Thunder (4): người dùng đã xem và bảo làm tiếp (coi như duyệt). Counter (5): người dùng bảo "ổn" nhưng yêu cầu màu theo vùng (đã sửa). Wind (3): đã đẩy, chờ người dùng xem. Sun (6): người dùng bảo "ổn". Shield (7): bản đầu (khiên) bị chê sai hướng → đã vẽ lại theo chủ đề vùng Huyền Uyên, chưa có phản hồi. Thorn (8): đã đẩy, chưa có phản hồi. Revive (9): đã đẩy, chưa có phản hồi. Grove (10): đã đẩy, người dùng đang xem trên demo, chưa có phản hồi. Lava (11): đã đẩy, chưa chụp ảnh, chưa có phản hồi. Ambush (12): đã đẩy, người dùng khen hợp ý và xin thêm bàn tay trồi từ đất (đã thêm). Star (13): đã đẩy, người dùng khen "xuất sắc". First (14): đã đẩy, chưa chụp ảnh, chưa có phản hồi. Weaken (15): mới đẩy, chưa chụp ảnh, chưa có phản hồi. Người dùng nhận xét tiến độ làm nhanh + hợp ý → giữ đúng cách làm ở mục "CÁCH LÀM NHANH" bên dưới.
- Mist: sương phải MỜ, TRONG SUỐT, không che nền (đã sửa theo góp ý; sương/khói nói chung vẽ alpha ~.2–.4 để rơi vào tầng bán trong suốt).
- Buff vẫn là lớp NỀN vẽ trước thú; không đè lên thân thú.
- Những bộ chưa làm tiếp tục chạy code cũ, không được làm hỏng game giữa chừng.

## Cách xem thử
- Điện thoại: mở `fx-demo.html` của nhánh → chọn "Buff bộ trang bị" → chọn bộ. (Trang demo cố định elapsed=.7 nên chỉ thấy trạng thái lúc vào trận.)
- Chụp hình để tự kiểm tra, ưu tiên cách node-canvas (KHÔNG cần Chromium, không cần mạng ngoài npm): `npm i canvas` rồi `node tools/render-gear.js <kind>` ở gốc repo → ra `tools/tam/gear_<kind>_rest.png` và `_enter.png` (phóng x2, chế độ pixel, có thú giả). Mở ảnh để tự xem. Script cũng gọi thẳng `TTGGearAura[kind]` vì backGear nuốt lỗi (try/catch). Đừng commit ảnh trong `tools/tam/`.
- Cách dự phòng bằng Chrome/Chromium + playwright (nếu có `/usr/bin/google-chrome`): chạy `python3 -m http.server` ở gốc repo, trang test gọi
  `TTGCombatFX.drawBack(g,T,elapsed,0,{startBuffs:[{kind}],zoneBuff:null},0,0,100,100,0,0)` với elapsed=10 (nền) và .7 (vào trận),
  canvas 360x240 phóng x3, chụp bằng playwright (launch executable_path=/usr/bin/google-chrome, args --no-sandbox). Nhớ vẽ 1 hình bầu dục giả làm thú để thấy che chắn.
