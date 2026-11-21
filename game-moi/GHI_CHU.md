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
