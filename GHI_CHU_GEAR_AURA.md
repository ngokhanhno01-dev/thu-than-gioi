# GHI CHÚ [FX 3C] — Vẽ lại BUFF BỘ TRANG BỊ (17 bộ) cho claude sau

Người dùng chê buff bộ cũ "quá sơ sài". Làm LẦN LƯỢT TỪNG BỘ, xong bộ nào commit + đẩy nhánh `fx-ve-bang-code` ngay
(commit `[FX 3C-<tên bộ>] ...`), rồi mới làm bộ kế. Người dùng hay hết quota nên luôn cập nhật bảng tiến độ dưới đây TRONG CÙNG commit.
Trả lời tiếng Việt, ngắn gọn. Xong mỗi bộ: báo + gửi ảnh chụp, hỏi duyệt/chỉnh rồi dừng chờ "tiếp".

## Tiến độ
| # | Bộ | Trạng thái | Ảnh mẫu |
|---|----|-----------|---------|
| 0 | frost (băng) | XONG (người dùng đã bảo làm tiếp) | tools/ref-gear/tuyet-nguyen.jpg |
| 1 | mist (sương) | XONG (người dùng bảo làm tiếp) | tools/ref-gear/suong-coc.jpg |
| 2 | cloud (mây) | XONG (người dùng bảo làm tiếp) | tools/ref-gear/van-dao.jpg |
| 3 | wind (gió) | XONG bản đầu, chờ người dùng duyệt | tools/ref-gear/phong-nguyen.jpg |
| 4 | thunder (sấm) | CHƯA | tools/ref-gear/loi-vuc.jpg |
| 5–16 | counter, sun, shield, thorn, revive, grove, lava, ambush, star, first, weaken, judge | CHƯA, KHÔNG có ảnh mẫu: tự thiết kế cùng phong cách | (dùng 5 ảnh mẫu làm chuẩn) |

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
- Toạ độ: thú x=85, mặt đất GY=203, trận pháp elip tỉ lệ SQ=.4, bán kính ~58, thân y≈150, lốc cao ~110.
- Bài học: KHÔNG đặt vật thể ở cung PHÍA TRƯỚC trận pháp (che mất rune) — tinh thể/cột chỉ ở hai bên và phía sau; mọi thứ vẽ trước thú nên thú che phần giữa.
- Tham số `e` = giây từ lúc bắt đầu (dùng cho hiệu ứng mọc lên lúc vào trận); `q` = 1→0 trong 2.4s đầu trận, sau đó 0.

## Chế độ pixel art (xem thử)
- File `42-gear-pixel.js` (nạp sau 41) tự bọc MỌI bộ trong `TTGGearAura`: `TTGGearAura.style='pixel'` → vẽ vào khung 240x160, nén sáng + ép 6 mức/kênh + độ trong 4 mức (dither Bayer), phóng không làm mịn. Người dùng đã CHỌN PIXEL ART (hợp với thú pixel; bản mượt bị chê quá bóng): mặc định 'pixel'. Pixel pass: alpha 3 tầng: đặc (>=.5) / bán trong suốt (.14–.5, dùng cho sương/khói: vẽ alpha ~.2–.4) / trong, màu ép mức, viền tối 1px quanh hình.
- Trang demo (fx-demo.html, tools/fx-demo.html) có ô "Kiểu: mượt / pixel art" ở chế độ buff bộ. Game thật dùng pixel mặc định.
- Bộ mới chỉ cần thêm vào 41; 42 tự bọc. Bộ mới: kiểm tra bằng ảnh chụp ở chế độ PIXEL (đừng chỉ nhìn bản mượt); tránh vật mảnh <1px (biến mất khi pixel hoá), ưu tiên khối/nét dày ≥1.5 đơn vị.

## Cách xem thử
- Điện thoại: mở `fx-demo.html` của nhánh → chọn "Buff bộ trang bị" → chọn bộ. (Trang demo cố định elapsed=.7 nên chỉ thấy trạng thái lúc vào trận.)
- Chụp hình để tự kiểm tra (máy có /usr/bin/google-chrome + playwright): chạy `python3 -m http.server` ở gốc repo, trang test gọi
  `TTGCombatFX.drawBack(g,T,elapsed,0,{startBuffs:[{kind}],zoneBuff:null},0,0,100,100,0,0)` với elapsed=10 (nền) và .7 (vào trận),
  canvas 360x240 phóng x3, chụp bằng playwright (launch executable_path=/usr/bin/google-chrome, args --no-sandbox). Nhớ vẽ 1 hình bầu dục giả làm thú để thấy che chắn.
