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
- `68-hud-tran.js` + `khung-chien-dau.webp` thay thanh máu cũ ở trận: khung thú bạn (vòng Rank bên trái), khung địch lật gương (vòng Rank bên phải). Chữ Tên/Bậc/Lv/Khiên/Tốc Độ đã xóa khỏi ảnh, tất cả vẽ bằng canvas (tên dài tự co chữ). Bố cục mới từ trên xuống: Khiên (tô lam) / Máu + Lv / Tốc Độ (tô vàng, độ dài = td so với bên nhanh nhất, nhãn Đánh trước/Đánh sau).
- Vòng tròn = Rank; ô xanh dưới vòng = Hệ (1 hoặc 2 hệ, mỗi hệ một màu; quái nguồn main lấy hệ chủ đạo của vùng); thanh kem = Tên + Bậc 1-3; thanh to = Máu "hiện/tối đa"; thanh nhỏ = Giáp (tối đa 0 thì "0/0", không tô); ô góc = Lv.N (tối đa Lv.100).
- Giáp = khiên đầu trận `TTGCS.khienDau` (hiện chỉ vùng Vân Đảo có buff Vân Hộ). Trong `index.html`: `st.shMe/shEn` (+ `shMaxMe/shMaxEn`) khởi tạo ở startExplore, hàm `hit()` cho giáp đỡ sát thương trước rồi mới trừ máu.
- Chỉnh bố cục: `G` trong 68-hud-tran.js (tọa độ theo ảnh file 1622x483); cỡ/vị trí khung: `HM`, `hw`, `hy` trong `index.html` (đoạn "KHUNG THÔNG TIN").
- `69-dem-nguoc.js` (TTGDEM): chữ **VS** to giữa 2 khung thông tin + **đếm ngược 3 · 2 · 1 · CHIẾN!** trước mỗi trận (Thám hiểm và trận mẫu). Đếm xong mới cho auto đánh (`cdStart()` trong index.html giữ `nextAt=Infinity` tới lúc đó). Toàn bộ vẽ bằng canvas, không dùng ảnh.
- VS tự co theo khe giữa 2 khung trừ lề: đổi khung HUD (`HM`, `hw` trong index.html) thì VS tự chỉnh. Chỉnh lề/cỡ/độ cao ở `TTGDEM.CFG.vs` (`margin`, `max`, `min`, `dy`). Thời gian mỗi nhịp đếm: `TTGDEM.CFG.dur`; màu: bảng `COL`.
- **Kỹ năng boss (6 boss thú hoang)**: dữ liệu `TTGCS.KY_NANG_BOSS` (56c-buff.js, khớp theo id boss `1j..6j`), hình `57-fx-ky-nang-boss.js` + ảnh `fx-boss/*.png`, engine `31-combat-fx.js` (chép từ bản game cũ, 57 bọc `TTGCombatFX.drawAttack`). Nối vào trận ở `index.html` (khối "KỸ NĂNG ĐỘC QUYỀN BOSS"): `bossSkill` / `knDecide` / `castSkill` / `drawSkillFx`. Chỉ boss THÚ HOANG (source demo) có kỹ năng; boss quái và thú bị bắt về thì không.
  - Boss dùng kỹ năng THAY đòn thường khi hết hồi chiêu; lần đầu sau `KN_START` (=1) lượt đánh thường (tức dùng ở lượt 2), sau đó cứ `cd` lượt dùng lại một lần (cd 5: lượt 2, 7, 12...). FX trúng ở 0,665s (`KN_T_HIT`), lượt kéo dài `KN_T_END`.
  - Đã làm (chạy thật trong trận): sát thương (hsTc + hệ kỹ năng), hút máu (Sương Nuốt), nội tại: giảm giáp/tấn công, hút máu theo lượt, xuyên giáp, khiên, mù, choáng (kc chặn). Chi tiết từng loại: chú thích trên bảng KY_NANG_BOSS (56c-buff.js).
  - ĐÃ BỎ khỏi thiết kế kỹ năng boss (22/11/2026): lớp lạnh, tự tăng tốc độ (Côn Bằng), giảm tốc độ đối thủ (Vũ Xà, Nguyệt Thực). Bản cũ có khai trong dữ liệu nhưng trận không chạy, nên đã xóa để mô tả sách không nói sai.
  - Xem thử hiệu ứng riêng: `tools/fx-boss-demo.html`. Việc kế: item Sách kỹ năng + rơi 1,5% khi GIẾT boss (bắt không rơi), thú cùng hệ chính/phụ mới trang bị được.
- **Icon kỹ năng trong trận**: hàng icon nhỏ ngay dưới khung thông tin (bạn: trái, địch: phải, tối đa 3/bên). Đang hồi chiêu = icon mờ + số lượt còn lại (4·3·2·1), hết hồi chiêu = icon sáng viền vàng, lượt sau dùng lại. cd 5 = chu kỳ 5 lượt. Ảnh: `game-moi/icon-kn/<id kỹ năng>.webp` (chưa có thì vẽ icon tạm theo hệ). Chỉnh cỡ/khoảng cách ở `KN_ICON`. Bên bạn đọc từ `st.knMe` (danh sách `{k:kỹ năng, cd}`), chưa gắn vì chưa có sách/trang bị sách.
- **Sách kỹ năng boss + nút test (22/11/2026)**: 6 icon kỹ năng ở `game-moi/icon-kn/<id kỹ năng>.png` (128x128). 6 sách khai trong `54-thu-than.js` (khối SACH, trường `ky` = id kỹ năng trong KY_NANG_BOSS, `he` = hệ sách). Gắn sách (nút Dùng) chỉ được khi thú có hệ chính HOẶC phụ trùng hệ sách (`TTGCS.mangDuocSach`), khác hệ báo "Thú không cùng hệ với sách này". Trận: thú bạn đọc `kn` -> `st.knMe`, dùng kỹ năng thay đòn thường khi hết hồi chiêu (sát thương theo hsTc + hệ, Sương Nuốt hút máu). 2 nút test cạnh Nhận châu (62-bat-thu.js, tắt bằng CFG.nutTest=false): **Đổi rank** (vòng E>D>C>B>A>S>SS>SR cho thú ra trận, áp dụng từ trận sau), **Lấy sách** (+2 mỗi sách boss). Chưa làm: rơi 1,5% khi giết boss.
- **Sách = nguồn duy nhất (22/11/2026)**: mỗi sách trong `KY_NANG_BOSS` (56c-buff.js) gồm kỹ năng (hsTc, cd, hệ, ev), `mod` chỉ số sách, `noiTai` {ten, mod, ev}. (Bản đầu có `mod` chỉ số sách; đã BỎ, sách không cộng chỉ số, chỉ còn kỹ năng + nội tại. Số liệu chính thức nằm ở bảng này.) Boss thú hoang được GÁN sách của mình (`ganSachBoss` trong index.html: `e.kn=[id sách]`, tính lại chỉ số có mod sách) và dùng kỹ năng đọc từ sách; thú người chơi gắn sách (`thu.kn`) thì được y hệt (chỉ số cộng vào `TTGCS.tinh` qua `sachMod`, khiên đầu trận qua `khienDau`, kỹ năng trong trận). FX người chơi dùng cùng sprite với boss nhưng đánh từ trái sang địch (pa:true, đích x=272). Mô tả sách trong Balo/bảng thú tự sinh từ bảng (`TTGCS.sachMoTa`). Rơi sách: chỉ khi GIẾT boss thú hoang (bắt không rơi), 1,5% x (1+mm/100), tối đa x3, vào Balo, báo trong thông báo thắng. Chưa làm: hồi máu mỗi lượt từ nội tại.
- Sách kỹ năng (hoàn thiện): CHỈ SỐ = % sát thương theo hệ (vd 180% sát thương Băng) + hồi chiêu; NỘI TẠI = hiệu ứng kèm theo (vd Lạnh Thấu Xương: giảm 20% Giáp đối thủ trong 2 lượt, bị giảm theo Kháng của người bị gắn); HIỆU ỨNG = hình ảnh kỹ năng. Sách KHÔNG còn cộng chỉ số cho thú mang sách. Boss và thú bạn dùng chung một đường xử lý (index.html: effS/dbApply/dbTick, debuff làm cho Giáp pt và Tấn công tc). Mọi số (cd, hsTc, nội tại) nằm ở bảng KY_NANG_BOSS (56c-buff.js), chỉnh tại đó.
- Nội tại 5 sách (dùng skill xong mới kích): Sương Nuốt hút 10% sát thương gây ra 3 lượt; Côn Bằng nhận khiên 20% máu tối đa; Vũ Xà Xuyên Giáp +15% 3 lượt; Thiên Lôi 30% choáng 1 lượt; Nguyệt Thực gây mù (đánh hụt 40%, 2 lượt). Hồi chiêu chốt 22/11/2026: Băng Sơn 5, Sương Nuốt 5, Vũ Xà 4, Nguyệt Thực 5, Côn Bằng 5, Thiên Lôi 6 (đã giảm từ 8-9 vì quá lâu). Icon trạng thái: game-moi/icon-st/ (cuối khung chỉ số, ngược phía icon CD, số góc = số lượt nếu > 1). Code: index.html (bfOf/addBf/noiTai/stList/stIcon).
- FX kỹ năng làm chậm theo KN_SLOW=1.15 (index.html; 1 = tốc độ gốc). Sát thương kỹ năng nhân hệ số khắc hệ (kém 0.7 / khắc 1.5 / miễn 0.3), nay hiện nhãn "Kém hiệu quả ×0.7"/"Khắc hệ! ×1.5" trên đầu mục tiêu. Chữ Rank trên khung HUD trận vẽ bằng TTGTHU.badges (cùng kiểu Thú Thần), cache theo rank (68-hud-tran.js: rankBadge).
- Dùng kỹ năng: trận DỪNG KN_INTRO=900ms, tên kỹ năng bật lên ở thân người dùng (drawSkillIn, chữ nhỏ kiểu CHIẾN/THẮNG, màu theo hệ), xong mới chạy FX + áp sát thương. Cooldown đầu trận KN_START=1. Chỉnh thời gian dừng ở KN_INTRO (index.html).
- **CHECKLIST thêm / sửa kỹ năng sách (đọc trước khi làm, để không lệch giữa dữ liệu, mô tả và trận)**:
  1. Số liệu (hsTc, cd, hệ, ev, nội tại) chỉ khai MỘT chỗ: bảng `KY_NANG_BOSS` trong `56c-buff.js`. `54-thu-than.js` chỉ thêm dòng sách (id, tên, `ky`, `he`, `img`), `cd` và mô tả tự đọc từ bảng (`cdSach`, `sachMoTa`), không gõ tay số vào đây.
  2. Mô tả sách người chơi đọc là TỰ SINH từ bảng. Khai hiệu ứng nào là người chơi thấy hiệu ứng đó, nên CHỈ khai hiệu ứng trận đã chạy được (danh sách ở chú thích trên bảng và ở khối "KỸ NĂNG ĐỘC QUYỀN BOSS" trong `index.html`).
  3. Hiệu ứng chưa có code thì làm code trước (`index.html`: dbApply / noiTai / addBf), thêm vào danh sách "ĐÃ CHẠY", rồi mới khai cho kỹ năng. Hiện chưa có: đổi tốc độ giữa trận, lớp lạnh, tự buff (`tuBuff`). Gợi ý làm debuff tốc độ: cho phép stat `td` trong điều kiện của `dbApply` (và nhãn `STAT_VI_TRAN`); thứ tự đánh đã tính lại mỗi vòng theo `effS` nên sẽ ăn ngay.
  4. Thêm kỹ năng mới cần đủ: dòng trong `KY_NANG_BOSS`, dòng sách trong `54-thu-than.js`, icon `icon-kn/<id>.png`, sprite `fx-boss/<tên>.png` + hàm vẽ trong `57-fx-ky-nang-boss.js`, mục trong `tools/fx-boss-demo.html`.
  5. Sửa xong cập nhật `THIET_KE_CHI_SO.md` mục 7b và ghi chú này, rồi mở trận thử xem mô tả sách có khớp những gì xảy ra.
- **Thứ tự đánh theo tốc độ + nhịp trận (22/11/2026)**: `index.html` hàm `ordFirst()` (td cao hơn đánh trước, bằng nhau thì bạn trước, tính lại mỗi vòng theo `effS`), `act(s0,w)` thực hiện lượt của một bên và trả về thời gian lượt, `atk()` nối hai lượt theo thứ tự rồi mới xét thắng/thua (`fin`). Bên bị hạ gục trước lượt của mình thì mất lượt (vẫn giữ nhịp `T_DON`). Nhịp: `GAP` 350→450, `T_DON` (mới, trước là số 650 gõ cứng) =750; chỉnh nhanh ở dòng khai báo `GAP`/`T_DON`/`END_WAIT`. Trận mẫu không có `BATTLE` giữ như cũ (bạn đánh trước). Lưu ý: trước đây boss bị choáng vẫn mất hồi chiêu kỹ năng; giờ vẫn giữ y như vậy (chọn kỹ năng trước, rồi mới xét choáng).

## Thanh đánh thường (thanh vàng) + hồi chiêu theo thời gian (index.html: gaugeStep / atkIv / cdT)
- Thời gian giữa 2 đòn đánh thường = `ATK_MS`x100/(100+td) ms (ATK_MS=2400, chọn để td 20 = 2,0s): td0=2,4s · td20=2,0s · td40=1,71s · td50=1,6s · td100=1,2s · td200=0,8s. Công thức giảm dần nên không có trần và không bao giờ về 0. Chỉnh `ATK_MS` (nền) và `TD_K` (độ dốc: lớn = tốc độ ít tác dụng).
- Vào trận cả 2 thanh ĐẦY: td cao đánh trước, bên kia ngay sau (bằng nhau: tung ngẫu nhiên; `BATTLE.seed` giống nhau ở 2 máy/server thì giống nhau). Thanh chạy thời gian thật, đầy thì đánh; không giới hạn lượt liền.
- Hồi chiêu kỹ năng tính theo LƯỢT ĐÁNH của chính bên đó (sách ghi 5 lượt = 5 lần bên đó đánh), như bản trước; tốc độ chỉ làm lượt đến nhanh/chậm. Hết hồi chiêu thì kỹ năng thay đòn thường ở lượt đó. Icon hiện số lượt còn lại.
- Choáng/buff/debuff vẫn đếm theo lượt đánh của từng bên (buff: bên đánh; debuff: bên bị đánh; `dbTick(side)`, cờ `fresh`). Boss giữ hệ số td 1,6.
- ĐỐI KHÁNG (`actClash`): 2 thanh đầy cùng lúc (lệch <= `CLASH_MS`=60ms; lượt mở màn không tính): 2 đòn thường = cả 2 trúng nhau, CẢ 2 MẤT MÁU; 1 kỹ năng + 1 đòn thường = kỹ năng trúng đủ (sát thương + nội tại) lên bên đánh thường, đòn thường bị chặn; 2 kỹ năng = cả 2 tung đủ lần lượt. Tối đa `HOA_MAX`=2 lần liền rồi đánh lần lượt. Bên đang choáng thì không đối kháng.

## Hiệu ứng đòn 17 vùng + bộ trang bị trong trận (22/11/2026)
- **Đòn thường theo vùng**: 33–40 (chép từ main) chạy theo vùng của bên đánh; nối ở `index.html` (khối "HIỆU ỨNG ĐÒN THƯỜNG THEO VÙNG": `atkStart` / `drawAtkFx` / `atkOff`). Sát thương áp lúc TRÚNG.
- **KHÔNG có aura bộ trang bị** (đã có hiệu ứng Rank). Đã xóa `41-gear-aura.js`, `42-gear-pixel.js`, `43-gear-scene.js` (thay bằng `43-su-kien-bo.js` nhỏ) và mọi mã vẽ aura trong `index.html`. Hàm `backGear` trong `31-combat-fx.js` là bản chép nguyên từ main, demo không gọi tới.
- **Luật bộ trang bị** = `70-bo-trang-bi.js`, chép đúng luật main (`12-equip.js` EQ_SETS + EQFX): 17 bộ theo vùng z, mặc >=2 món cùng bộ buff v2, đủ 4 món buff v4, giá trị nhân (1 + z x 0,03); CHƯA có phẩm nên coi phẩm = 0. Món trang bị khai trường `bo` = số vùng 0..16. Xem thử không cần đồ: thêm `?bo=11` hoặc `?bo=lava` vào link (mang đủ 4 món bộ đó).
- Hiệu ứng kích hoạt: chữ tên sự kiện hiện trên đầu thú CHỦ BỘ (đúng bên trái/phải); Dung Nham, Lôi Phạt, Phong Nhận, Nguyệt Ảnh chạy thêm hiệu ứng đòn với nhãn của main.
- Khác main (trận demo chạy thanh thời gian thật, không có "hiệp"): "cuối hiệp" = ngay sau lượt đánh của bên có bộ (Sinh Cơ, Dung Nham, Vân Ẩn); "né đòn" (Nguyệt Ảnh) = đòn địch bị Mù/Vân Ẩn làm hụt; Thiên Uy = ra đòn trước ở lượt đầu; Ngọc Hộ Mệnh hồi sinh trước khi xét thắng/thua (1 lần/trận). Tinh Quang chỉ nổ khi chí mạng, hiện chỉ có chí mạng từ U Ảnh Ám Sát vì đòn thường demo chưa tung chí mạng theo chỉ số `cm`.
- Chỉ người chơi có bộ; địch chưa có. Thêm bên địch: điền `st.bo.en.fx` ở `TTGBO.start()`.

## Trang bị / Rèn / Cường hóa / Nguyên liệu - luật chép từ main (22/11/2026)
- **Ảnh** (178 file) nằm ở `game-moi/img/trang-bi/` (17 bộ x 4 món), `game-moi/img/cuong-hoa/` (đá bậc 1-6, Đá Ngũ Sắc, Vé Bảo Hộ), `game-moi/img/nguyen-lieu/` (17 vùng x 6 loại: claw/scale/fang/eye/bone/essence).
- `73-luat-trang-bi.js` (`TTGLT`) = luật, chép số của main (12-equip, 46-enh-items, 48-enh-ui, 10-drops-shop): phẩm Phàm/Linh/Địa/Thiên/Thần gacha 55/28/12/4/1 (cộng 0/10/22/38/60%), 1 chỉ số mặc định + 2 dòng bốc, nhân vùng (1+z*0,03), rèn = Tinh Hoa boss + nguyên liệu chính + Linh Cốt + Tinh Thạch (`need(z)`), cường hóa +0..+10 (+4%/cấp, tỉ lệ 95..15%, từ +4 thất bại tụt cấp, Vé Bảo Hộ cứu, Ngũ Sắc +5%), đá bậc 1-6 theo vùng. Đăng ký 110 item vào Balo (`zm{z}_{0-4}` nguyên liệu, `zb{z}` Tinh Hoa, `da_ch1-6`, `ve_bao_ho`, `da_ngu_sac`).
- `74-ren-cuong-hoa.js` = giao diện khung Rèn / Cường hóa (qua móc `TTGKH.on('open'|'close'|'btn'|'pick')` của 72). Rèn: 3 ô tam giác = Tinh Hoa/nguyên liệu chính/Linh Cốt, nút "Bộ Trang Bị" chọn vùng, cột giữa chọn món. Cường hóa: nút "Chọn Trang Bị", vòng trái = đá, phải = vé, dưới = Ngũ Sắc, nút "Đập".
- **Khác main (đã quyết, sửa ở khối CẤU HÌNH của 73):** "xu" = Tinh Thạch; 4 món -> ô Vũ khí(4) / Áo giáp(1) / Dây chuyền(5) / Ngọc bội(7); atk->tc, def->pt, spd->td, Pháp Công cộng 30% vào tc, eva->ne, stun->choang, regen->hm, crit->cm (trần 45/35/8/60); chỉ số cố định = 7% (mặc định ô 9-20%) chỉ số thú điển hình của vùng; Rank E..SR đổi sang bậc của main (`TIER_NORMAL`/`TIER_BOSS`); chỉ quái nguồn main rơi nguyên liệu + đá (tỉ lệ x(1+mm/100), tối đa x3); mặc món cần thú ra trận đủ cấp (như main).
- Buff bộ (70) nay nhân thêm phẩm trung bình của các món cùng bộ. Chỉ số trang bị được cộng vào thú ở `startExplore` qua `TTGLT.apDung`; trang Chỉ số của Thú Thần chưa hiện phần cộng này.
- **CHƯA có:** cửa hàng bán Vé Bảo Hộ / Đá Ngũ Sắc (main bán 1.000 / 1.500 xu), Hộp Nguyên Liệu, bán trang bị, hiệu ứng 3 giây của Đập. Hiện 2 món kia chưa có nguồn nhận (trừ demo).
- **Thử nhanh:** thêm `?luat=demo` vào link, mở Rèn/Cường hóa lần đầu được tặng sẵn nguyên liệu 17 bộ, đá, vé, Ngũ Sắc, 20.000 Tinh Thạch (1 lần mỗi phiên).


## 22/11/2026 - Khung Trang Bị mới + Chỉ Số / Khóa / Chọn
- `khung-trang-bi.webp` thay bằng khung mới 1667x865 (đã cắt nền xanh). Tọa độ ô, lưới, bảng Thông Tin, 4 nút, nút Chỉ Số đều ở khối khai báo đầu `55-trang-bi.js`.
- `nut-trong.webp` (176x78) = khung nút CHỌN đã xóa chữ, dùng cho: "Trang Bị" (phủ lên nút Tháo Trang Bị khi món chọn chưa mặc), "Mở Khóa", "Bỏ chọn", "Chọn tất cả". Chữ viết bằng CSS (font tiêu đề của game).
- **Chỉ Số**: bảng nổi, đọc `TTGLT.tong()` (chỉ số cộng từ đồ đang mặc) và `TTGBO.sets()` (buff bộ), kèm bộ mới có 1 món (chưa đủ 2 món để kích hoạt).
- **Khóa**: trường `kh` trên từng món trang bị (lưu cùng kho `ttg_moi_trangbi_v1`). Món khóa / đang mặc không vứt được.
- **Chọn**: bật chọn nhiều (nút Chọn phát sáng) -> hiện 2 nút Bỏ chọn (tắt chế độ + xóa lựa chọn) / Chọn tất cả. Khóa, Vứt Bỏ, Tháo Trang Bị áp dụng cho mọi món đã chọn. Balo (`53-balo.js`) có cùng 2 nút; nút Chọn của Balo không còn đổi sang ảnh "Bỏ chọn" (chỉ phát sáng).
- Chưa dùng nữa (có thể xóa nếu muốn): `nut-da-trang-bi.webp`, `nut-bo-trang-bi.webp`, `nut-bo-chon.webp`.

## 22/11/2026 (2) - Thanh cuộn mô tả, mô tả buff bộ chi tiết, nút cho khung Tiến Hóa
- Bảng Thông Tin của Trang Bị: phần mô tả cuộn được (vuốt dọc / thanh vàng). Bảng Chỉ Số cũng có thanh cuộn.
- Buff bộ: mỗi bộ có mô tả hiệu ứng thật (bảng BD trong 55-trang-bi.js, theo luật 70-bo-trang-bi.js), hiện giá trị đang áp dụng + mốc 2 món / 4 món (gốc) + danh sách món đang mặc.
- Khung Tiến Hóa (72 + 75): thêm thanh nút dưới khung (ảnh khung giữ nguyên, thêm `ex:76` px phía dưới): Chọn / Khóa(Mở Khóa) / Vứt Bỏ, và Bỏ chọn / Chọn tất cả khi bật Chọn. Khóa + Vứt dùng chung với Balo qua TTGBALO.isLocked / setLock / xoa (53-balo.js). Hook mới TTGKH.on('change').

## Danh Vọng + Chọn vùng (23/11/2026) — `80-danh-vong.js` (TTGDV)
- **Danh Vọng** = số LOÀI thú hoang / boss thú hoang đã giết (mỗi loài tính 1 lần đầu; 1 vùng = 9 thú + 1 boss = 10). Lưu `ttg_moi_dv`. Hiện ngôi sao + số trong ô nhỏ dưới chữ "Danh Vọng" (tọa độ `PLATE` trong file, theo pixel khung-sanh.webp; vẽ từ index.html ngay sau `drawExp`).
- **Trần cấp thú nuôi** = `TTGCS.tranCap(Danh Vọng)` = min(100, 10 + floor(DV x 0,55)): DV 0 -> Lv.10, DV 10 -> Lv.15 (hệ số ở 56-chi-so.js `tranCapNen`, `tranCapMoiSao`). `capMax()` trong 54-thu-than.js đọc `TTGDV.tran()`; đạt trần thì ngừng nhận EXP, vòng EXP hiện "Lv.Max" (khi có thêm Danh Vọng thì EXP chạy tiếp). Thú đã vượt trần thì giữ nguyên cấp.
- **Chọn vùng**: nút dài `nut-chon-vung.webp` (chữ là DOM nên đổi theo vùng) nằm dưới nút Thám hiểm; bấm mở bảng danh sách. Vùng thứ n cần 10 x (n-1) Danh Vọng (`CFG.moiVung`), không bị tiêu hao. Thám hiểm gặp thú/quái của vùng đã chọn (61-tham-hiem-tran.js đọc `TTGDV.vung()`), lưu `ttg_moi_vung`.
- Thử nhanh: thêm `?dv=30` vào link để tạm cộng 30 Danh Vọng (không lưu).
- Lưu ý: vùng 7, 8, 9 (Thủy Nguyệt Cảnh, Xích Hỏa Địa, Thanh Lâm) hiện mới có 1 loài mỗi vùng trong `51-thu-moi.js`, nên chưa đủ loài để kiếm đủ Danh Vọng mở các vùng sau.
