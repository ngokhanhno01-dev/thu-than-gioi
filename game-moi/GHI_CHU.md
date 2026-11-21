# Game mới (màn ngang)

Mở: `game-moi/index.html` (có `<base href="../">` nên dùng chung `51-thu-moi.js`, `thu-game/` và mọi ảnh ở gốc repo).

## Đã chốt
- Thú vẽ **128px, 1:1**, hệ số bậc 1/1/1.
- Màn ngang toàn màn hình, scale **nguyên** K = round(chiều cao máy / 360). Kích thước logic W×H đổi theo máy, bố cục bám cạnh, chừa vùng tai thỏ.
- Lưu riêng khóa `ttg_moi_v1` (localStorage). **Chưa nối online/Firebase.**

## Trạng thái
Khung + trận mẫu (Tuyết Cầu 1a đấu chính nó, 3 bậc đổi được). Quái dùng tạm thú 1a.

## Việc kế tiếp
1. Bạn thử trên điện thoại, báo dòng chữ nhỏ trên cùng (x? và W×H) + nút bấm có vừa tay không.
2. Đưa quái thật (`img-mobs-*`) vào.
3. Màn chọn thú, rồi mới tới các hệ thống khác.

## Chế độ HD (18/11/2026, thử nghiệm)
Mặc định BẬT. Canvas vẽ theo độ phân giải thật của máy (không còn pixel to x3) và dùng ảnh thú `-256` nếu có (hiện chỉ 1a và 6j), thiếu thì tự dùng ảnh 128. Thêm `?hd=0` vào link để tắt và so sánh với bản cũ. Chỉ sửa `game-moi/index.html` và hàm `draw` trong `51-thu-moi.js` (ảnh 256 vẽ nhỏ lại thì làm mượt); không đụng game chính.

Nút **Khung: HD 256 / 128** (cùng hàng với nút đổi bậc): bấm để đổi qua lại, nhớ lựa chọn (khóa `ttg_moi_hd`). `?hd=0` / `?hd=1` trên link vẫn ghi đè.

## Khung mới (19/11/2026)
- **Khung trên (chỗ thú đứng)** = `game-moi/khung-sanh.webp` (1843x830): có họa tiết "Danh Vọng" góc trái, ô tròn góc phải. Đã sửa chữ "Vộng" -> "Vọng" (xóa dấu mũ thừa bằng inpaint).
- **Khung dưới (hàng nút)** = `game-moi/khung-hang-nut.webp` (2126x740). Ô nút vuông nhỏ vẫn là `khung-nut.webp` (không đổi).
- Hai ảnh đã tách nền xanh, nền trong suốt. Số đo mảnh góc/độ dày viền khai ở `FRM` trong `game-moi/index.html`; thay ảnh khác thì chỉ cần sửa `FRM` (w,h,sl,sr,st,sb,e). Tỉ lệ vẽ tự tính để cao khít khung, chỉ giãn ngang mảnh giữa.
- Ảnh cũ `khung-game.webp` (ở gốc repo) không còn được game-moi dùng, chưa xóa.

## Nút vuông mới (19/11/2026)
- `khung-nut.webp` thay bằng khung vàng + nền sao (cắt từ ảnh mẫu nut-mau.png, ô giữa trong suốt, ảnh vuông 373x373). Ô trong suốt chiếm 21%-79% mỗi cạnh.
- Bỏ hộp nền nhỏ có viền; thay bằng quầng sáng mềm (`.nv-gl`, nhấp nháy chậm) + icon phát sáng (drop-shadow vàng/lam) + chữ trắng ngà viền nâu, phát sáng vàng. Chữ nằm trên lớp khung.
- Icon Balo (vàng cam + túi lam) và Thú Thần (dấu chân ngọc lam + ngọc vàng) vẽ lại màu sáng. Chỉnh độ sáng ở CSS `.nv-ic` (filter), `.nv-gl`, `.nv-tx` trong 52-nut-vuong.js; cỡ chữ Thú Thần ở 54-thu-than.js (`.8em`).

## Thanh nút to hơn (19/11/2026)
- `BP` (cao khung dưới) 70 -> 88; nút vuông 29 -> 38, chừa góc trái 34 -> 42 (`CFG.left`). Khung trên còn cao 270 (trước 288), thú giữ nguyên cỡ.
- Sức chứa: màn rộng 780 ≈ 17 ô/hàng x 2 hàng; màn 640 ≈ 13 ô/hàng. Hàng 0 (r:0) cho chức năng chính, hàng 1 (r:1) cho chức năng phụ. Quá nhiều nút thì làm vuốt ngang hoặc nút "Thêm".

## Hai khung sát nhau, bỏ viền xanh phát sáng ở chỗ giáp (19/11/2026)
- `khung-sanh.webp`: cắt 14 hàng đáy (dải xanh phát sáng ngoài vạch vàng) -> 1843x816. `FRM.top`: h 816, sb 248, e.b 30.
- `khung-hang-nut.webp`: xóa trong suốt 18 hàng đỉnh (dải sao ngoài) ở PHẦN GIỮA, giữ nguyên 2 góc (sừng rồng chồng lên khung trên ~2 đơn vị). `FRM.bot.ct = 18`: khung dưới vẽ lấn lên trên đúng bằng số hàng này.
- `BP` 88 -> 86 (viền trên khung dưới mỏng hơn nên vẫn đủ chỗ 2 hàng nút 38). `GAPB` = 0. Khung trên cao 274, chân thú ở y≈264 (trước ≈257): vùng cảnh rộng thêm ~7 đơn vị. `CFG.dy` (52-nut-vuong.js) dịch khối nút lên/xuống cho cân.

## Khung thông tin chiến đấu (21/11/2026)
- `68-hud-tran.js` + `khung-chien-dau.webp` thay thanh máu cũ ở trận: khung thú bạn (vòng Rank bên trái), khung địch lật gương (vòng Rank bên phải). Chữ Tên/Bậc/Lv đã xóa khỏi ảnh, tất cả vẽ bằng canvas (tên dài tự co chữ).
- Vòng tròn = Rank; ô xanh dưới vòng = Hệ (1 hoặc 2 hệ, mỗi hệ một màu; quái nguồn main lấy hệ chủ đạo của vùng); thanh kem = Tên + Bậc 1-3; thanh to = Máu "hiện/tối đa"; thanh nhỏ = Giáp (tối đa 0 thì "0/0", không tô); ô góc = Lv.N (tối đa Lv.100).
- Giáp = khiên đầu trận `TTGCS.khienDau` (hiện chỉ vùng Vân Đảo có buff Vân Hộ). Trong `index.html`: `st.shMe/shEn` (+ `shMaxMe/shMaxEn`) khởi tạo ở startExplore, hàm `hit()` cho giáp đỡ sát thương trước rồi mới trừ máu.
- Chỉnh bố cục: `G` trong 68-hud-tran.js (tọa độ ảnh gốc 2161x728); cỡ/vị trí khung: `HM`, `hw`, `hy` trong `index.html` (đoạn "KHUNG THÔNG TIN").
- `69-dem-nguoc.js` (TTGDEM): chữ **VS** to giữa 2 khung thông tin + **đếm ngược 3 · 2 · 1 · CHIẾN!** trước mỗi trận (Thám hiểm và trận mẫu). Đếm xong mới cho auto đánh (`cdStart()` trong index.html giữ `nextAt=Infinity` tới lúc đó). Toàn bộ vẽ bằng canvas, không dùng ảnh.
- VS tự co theo khe giữa 2 khung trừ lề: đổi khung HUD (`HM`, `hw` trong index.html) thì VS tự chỉnh. Chỉnh lề/cỡ/độ cao ở `TTGDEM.CFG.vs` (`margin`, `max`, `min`, `dy`). Thời gian mỗi nhịp đếm: `TTGDEM.CFG.dur`; màu: bảng `COL`.
- **Kỹ năng boss (6 boss thú hoang)**: dữ liệu `TTGCS.KY_NANG_BOSS` (56c-buff.js, khớp theo id boss `1j..6j`), hình `57-fx-ky-nang-boss.js` + ảnh `fx-boss/*.png`, engine `31-combat-fx.js` (chép từ bản game cũ, 57 bọc `TTGCombatFX.drawAttack`). Nối vào trận ở `index.html` (khối "KỸ NĂNG ĐỘC QUYỀN BOSS"): `bossSkill` / `knDecide` / `castSkill` / `drawSkillFx`. Chỉ boss THÚ HOANG (source demo) có kỹ năng; boss quái và thú bị bắt về thì không.
  - Boss dùng kỹ năng THAY đòn thường khi hết hồi chiêu; lần đầu sau `KN_START` (=2) lượt, sau đó theo `cd`. FX trúng ở 0,665s (`KN_T_HIT`), lượt kéo dài `KN_T_END`.
  - Đã làm: sát thương (hsTc + hệ kỹ năng), hút máu (Sương Nuốt), choáng (Thiên Lôi Giáng, bị kc chặn). Chưa làm: lớp lạnh (Băng Sơn), tăng/giảm tốc độ (Côn Bằng, Vũ Xà, Nguyệt Thực) vì trận demo chưa có hệ lớp/tốc độ.
  - Xem thử hiệu ứng riêng: `tools/fx-boss-demo.html`. Việc kế: item Sách kỹ năng + rơi 1,5% khi GIẾT boss (bắt không rơi), thú cùng hệ chính/phụ mới trang bị được.
- **Icon kỹ năng trong trận**: hàng icon nhỏ ngay dưới khung thông tin (bạn: trái, địch: phải, tối đa 3/bên). Đang hồi chiêu = icon mờ + số lượt còn lại (4·3·2·1), hết hồi chiêu = icon sáng viền vàng, lượt sau dùng lại. cd 5 = chu kỳ 5 lượt. Ảnh: `game-moi/icon-kn/<id kỹ năng>.webp` (chưa có thì vẽ icon tạm theo hệ). Chỉnh cỡ/khoảng cách ở `KN_ICON`. Bên bạn đọc từ `st.knMe` (danh sách `{k:kỹ năng, cd}`), chưa gắn vì chưa có sách/trang bị sách.
