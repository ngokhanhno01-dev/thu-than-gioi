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
- Thêm 27/11/2026: Thủy Long Phá Nguyệt (7j) và Viêm Long Phá Nhật (8j), sprite `fx-boss/thuy-long.png` + `thuy-don-thuong.png` (`60-fx-thuy-nguyet.js`), `fx-boss/viem-long.png` (`60b-fx-viem-long.js`); chưa thêm vào `tools/fx-boss-demo.html`, chưa chạy thử trong game.
- Thêm 27/11/2026: Vạn Mộc Hồi Xuân (boss 9j Thanh Lâm Cùng Kỳ, hệ mộc), KỸ NĂNG TỰ DÙNG đầu tiên (`tuHoi` trong KY_NANG_BOSS): hồi 20% máu tối đa ngay, không sát thương/không né. Nội tại Mộc Tâm (`mocTam`): mỗi lần dùng +1 Mộc Tâm (tối đa 10, giữ đến hết trận); cuối mỗi lượt của chính bên đó hồi 5% máu tối đa x số tâm (5%..50%); tâm vừa nhận ở lượt dùng thì lượt đó chưa tính. cd 3. Code trận: `mocCast`/`mocTick` (index.html), icon `icon-kn/van-moc-hoi-xuan.png`, `icon-st/moc-tam.png`, sprite `fx-boss/van-moc.png` (`60c-fx-van-moc.js`). Chưa thêm vào `tools/fx-boss-demo.html`, chưa chạy thử trong game.
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
- **Trần cấp thú nuôi** = theo VÙNG ĐÃ MỞ (không còn theo Danh Vọng): `TTGCS.tranCap(số vùng mở)` = min(270, 15 x số vùng mở) (`CFG.capMoiVung` ở 56-chi-so.js). Mới vào Tuyết Nguyên = Lv.15, mở Sương Cốc = Lv.30, mỗi vùng +15. Danh Vọng chỉ còn là điều kiện mở vùng. `capMax()` trong 54-thu-than.js đọc `TTGDV.tran()`; đạt trần thì ngừng nhận EXP, vòng EXP hiện "Lv.Max". Thú đã vượt trần thì giữ nguyên cấp.
- **Chọn vùng**: nút dài `nut-chon-vung.webp` (chữ là DOM nên đổi theo vùng) nằm dưới nút Thám hiểm; bấm mở bảng danh sách. Vùng thứ n cần 10 x (n-1) Danh Vọng (`CFG.moiVung`), không bị tiêu hao. Thám hiểm gặp thú/quái của vùng đã chọn (61-tham-hiem-tran.js đọc `TTGDV.vung()`), lưu `ttg_moi_vung`.
- Thử nhanh: thêm `?dv=30` vào link để tạm cộng 30 Danh Vọng (không lưu).
- Lưu ý: vùng 7, 8, 9 (Thủy Nguyệt Cảnh, Xích Hỏa Địa, Thanh Lâm) hiện mới có 1 loài mỗi vùng trong `51-thu-moi.js`, nên chưa đủ loài để kiếm đủ Danh Vọng mở các vùng sau.

## Gom nút test + bỏ khung nút vuông (23/11/2026)
- **Menu ẩn**: 6 nút test/admin (Nhận châu, Đổi rank, Lấy sách, Lấy đồ TH, Admin, NL test) không còn nằm ở thanh nút. `TTGNV.add` thấy id trong `CFG.dev` (52-nut-vuong.js) hoặc `o.dev:true` thì cất vào `TTGNV.dev`. Chạm chữ "Danh Vọng" ở khung trên mở menu liệt kê chúng (80-danh-vong.js: vùng chạm `HOT`, số lần chạm `CFG.devTaps`, nên đặt 3-5 khi ra bản thật). Muốn bỏ hẳn: xóa nút ở file gốc hoặc đặt `CFG.nutTest=false`.
- **Nút vuông không khung**: `TTGNV.cfg.khung=false` (mặc định): bỏ khung vàng + nền, chỉ icon + chữ, icon to hơn. Đặt `true` để về kiểu cũ. Khi có icon riêng thì dùng `image:` trong `TTGNV.add` (ảnh vẽ nguyên nút, không chữ). Chỉ nút dài Thám hiểm và Chọn vùng giữ khung.

## Icon mới + nút Thám hiểm giữa (23/11/2026)
- Icon (đã tách nền, có chữ tên nằm trong ảnh) ở `game-moi/icon/`: tham-hiem, thu-than (Linh Thú), trang-bi (Pháp Bảo), ren (Luyện Khí), balo (Túi Trữ Vật), cuong-hoa. Gắn theo id trong `TTGNV.cfg.art` (52-nut-vuong.js); thêm icon mới: bỏ ảnh webp vào thư mục đó + 1 dòng trong `art`. Ảnh gốc nền xanh đêm được tách bằng color-to-alpha (giữ hiệu ứng phát sáng).
- **Nút Thám hiểm** = icon lớn `hero:true`, luôn nằm GIỮA thanh nút và cách đều viền trên/dưới (`cfg.heroH` = cao, `cfg.heroCy` = tâm dọc, đã đo: hở trên = hở dưới). Hai nút dài cũ (Thám hiểm, Chọn vùng) đã bỏ. Khung dài cuối icon hiện **tên vùng + số vùng**; chạm khung đó mở bảng chọn vùng, chạm phần còn lại đi thám hiểm.
- Còn 24 ô: bên trái nút thường, bên phải đặt `rc`/`r` (Đấu trường, Phó bản, Cửa hàng, Đấu giá...).

## Bảng chọn vùng (23/11/2026)
- Bấm icon Thám hiểm -> hiện bảng `icon/khung-chon-vung.webp` (18 ô, cột trái vùng 1-9, cột phải vùng 10-18; ô chưa có vùng ghi "Sắp ra mắt"). Mỗi ô: tên vùng, số loài đã giết / tổng, hoặc "🔒 Cần N ★". Chọn vùng đã mở = đổi vùng + đi Thám hiểm luôn (`TTGDV.CFG.batDauNgay=false` thì chỉ đổi vùng). Bấm ô khóa: dòng nhắc hiện ngay dưới khung. Danh Vọng + trần cấp hiện dưới khung.
- Thanh dưới icon Thám hiểm chỉ hiển thị vùng đang ở (không bấm chọn nữa).

## 8 nút mới + bảng bố cục nút (23/11/2026)
- 8 icon mới (đã tách nền, 420x420) ở `game-moi/icon/`: `dau-truong` (Vạn Thú Tranh Phong), `boss-the-gioi`, `pho-ban` (Bí Cảnh), `thap-thi-luyen`, `cua-hang` (Kỳ Trân Các), `diem-danh`, `nhiem-vu`, `do-giam` (Đồ Giám = sưu tầm). Đăng ký ở `81-nut-moi.js`; **chức năng chưa làm**, bấm chỉ hiện thông báo "sắp ra mắt". Gắn chức năng thật: sửa hàm trong bảng `FN` của file đó.
- **Vị trí mọi nút nằm ở MỘT bảng**: `TTGNV.cfg.bo` (52-nut-vuong.js), dạng `id: ['l'|'r', cột, hàng]`. `l` = đếm cột từ mép trái, `r` = đếm từ mép phải (0 = ngoài cùng); hàng 0 trên, 1 dưới. Nút có trong bảng thì bỏ qua `r`/`rc` cũ.
- Bố cục hiện tại: **Trái** = nhân vật/sưu tầm (hàng trên: Linh Thú, Pháp Bảo, Luyện Khí; hàng dưới: Túi Trữ Vật, Đồ Giám, Cường hóa). **Phải** = hoạt động (hàng trên từ mép: Vạn Thú Tranh Phong, Boss Thế Giới, Bí Cảnh, Tháp Thí Luyện; hàng dưới: Kỳ Trân Các, Điểm danh, Nhiệm vụ). Ô trống để dành nằm sát nút Thám hiểm (trái còn 3 cột, phải còn 2 cột), thêm nút mới = thêm 1 dòng vào `bo` ở cột kế tiếp.
- Lưu ý: icon Vạn Thú Tranh Phong là ảnh ngang nên hiện nhỏ hơn các icon khác trong ô vuông; chữ tên trên icon nhỏ, nếu khó đọc thì tăng `CFG.size` hoặc gửi bản ảnh vuông.
- (23/11 b) Phóng to thanh nút: `BP` 86->98, `CFG.size` 38->43, `heroH` 79->90, `heroCy` 47.6 (khung trên thấp hơn 12 đơn vị). Bí Cảnh đặt ngay bên phải nút Thám hiểm, to 62 (`beside:'r'`, `w`, `h` trong 81-nut-moi.js; `beside:'l'` để sang trái), không chiếm ô lưới.
- (23/11 c) Kẹp hai bên nút Thám hiểm: Vạn Thú Tranh Phong (`beside:'l'`, 74 vì ảnh ngang nên cần ô lớn hơn) và Bí Cảnh (`beside:'r'`, 62). Bên phải còn Boss Thế Giới, Tháp Thí Luyện / Kỳ Trân Các, Điểm danh, Nhiệm vụ.
- (23/11 d) Nền thanh nút = ảnh `game-moi/nen-hang-nut.png` (2172x724, 71KB), vẽ ở `draw()` trong index.html (biến `NHN`), phủ kín + canh giữa (cắt 2 mép hoặc trên/dưới theo tỉ lệ máy); chưa nạp được thì dùng dải màu cũ. Đổi nền: thay file ảnh (tăng `?v=` ở dòng `NHN.im.src`).

## Thám hiểm tự động - vòng lặp + màn bản đồ (23/11/2026)
- Module mới `82-tham-hiem-auto.js` (TTGTX). Luồng: bấm Thám hiểm -> màn BẢN ĐỒ 5s (thú chibi 64-80px nhảy lóc cóc / thoắt ẩn thoắt hiện / thò đầu ngó nghiêng, bong bóng ❓🧐 -> 💦💢😵‍💫 -> ❗🤩) -> bảng "Phát hiện mục tiêu" 3s (chạm màn hình là đóng ngay) -> vào trận (không còn toast "Gặp..." và không chờ thêm) -> THẮNG / bắt thú xong / thú hoang bỏ chạy thì tự quay lại bản đồ. THUA hoặc HÒA (thú hết HP) và nút **Dừng** (hoặc phím Esc) dừng vòng lặp.
- Thanh trạng thái trên cùng: 🔍 lắc qua lại + "Đang thám hiểm [Tên vùng]..." + nút Dừng. Trong lúc ở màn bản đồ, toast thắng trận được đẩy xuống đáy màn hình (CSS `body.tx-on .tbo.tst`) để không che thanh này.
- Ảnh bản đồ: bảng `MAP_VUNG` đầu file 82 (18 vùng). 9 vùng đã có `map-tham-hiem-<slug>.webp` (cùng thư mục với `bg-...webp`). 9 vùng "Sắp ra mắt" ghi tạm `vung-10..vung-18: null` kèm dòng `// TODO: Chưa có ảnh bản đồ thám hiểm (...)`; gọi tới thì tự dùng `bg-<slug>.webp`, không có thì `bg-khoi-dau.webp`. Khi mở vùng mới: đổi khóa thành slug thật trong 51-thu-moi.js + điền đường dẫn ảnh.
- Nối vào `index.html` (tìm "TTGTX"): `startExplore` tách thành `prepExplore()` (tung địch) + `startExplore(pre)` (vào trận); `TTGTHAMHIEM.prep/battle/start`; hết trận gọi `TTGTX.next()` (thắng) hoặc `TTGTX.stop()` (thua/hòa); `host.end` của bắt thú gọi `TTGTX.next()`. Mọi timer/animation/rAF/listener của màn bản đồ được hủy trong `cleanup()` (Dừng, vào trận, đầu chu kỳ mới).
- Chỉnh: thời gian ở `TTGTX.CFG` (tim 5000, bao 3000, size [64,80], hop, peekTiLe); vùng thú đi lại ở hàm `pt()`/`clampPt()`; kịch bản từng giây ở hàm `script()`.
- (23/11/2026, lần 2) Tìm kiếm kéo dài 8,5s (`TTGTX.CFG.tim`): 2 lượt đổi chỗ xa + nhảy tìm, nghỉ thở dốc, rồi mới thấy mục tiêu (mốc 7,0s ❗). Đổi `tim` thì chỉnh lại các mốc trong `script()`.
- Màn chờ (boot) nay TẢI TRƯỚC ảnh khung/nút/icon/nền (mảng `PRE` trong script boot của index.html), chờ thêm font, sự kiện load, ảnh thú và module nạp muộn (TTGDV/TTGNV/TTGTX); thanh chỉ tới 100% khi xong hết (quá 30s vẫn cho vào). Vào game xong thì tải ngầm bản đồ thám hiểm của vùng đang chọn (`TTGTX.warm`).
- (23/11/2026, lần 3) Bảng "Phát hiện mục tiêu" có ô hình địch (thú hoang vẽ theo V tiến hóa, quái nguồn main dùng `quai/<imageFile>`), nhãn **V1/V2/V3** cạnh tên (chỉ thú hoang) và dòng "⚔ Kỹ năng: ..." nếu là boss thú hoang (đọc từ sách của boss). THUA/HÒA nay vẫn lặp tiếp; muốn thua là dừng thì đặt `TTGTX.CFG.tiepKhiThua=false`.
- (23/11/2026, lần 4) **Nút Chạy** trong trận Thám hiểm (index.html, khối "NÚT CHẠY": chayDo / chaySync / chayPhat): ngay TRÊN chữ VS (thu nhỏ vừa khoảng trống), ẩn lúc đếm ngược / đang bắt thú. Bấm -> hỏi xác nhận -> tính như thua nhưng trừ ĐỦ Tinh Thạch của lần thắng (thua chỉ trừ một nửa); không đủ thì trừ hết số đang có. Sau đó đi theo `TTGTX.CFG.tiepKhiThua` như thua.

## Thú ở sảnh "đang sống" (23/11/2026) — `83-sanh-song.js` (TTGSANH)
- Thú đứng ở sảnh không còn đứng im: nghỉ 1,5-3,6s rồi nhảy lóc cóc sang chỗ khác (giống màn Thám hiểm: nảy lên, tiếp đất bẹp, quay mặt theo hướng đi), nhảy tại chỗ, hoặc ngó nghiêng. Đi lại trong ±28% bề rộng khung quanh giữa khung; vòng rune Rank đi theo chân thú; danh hiệu nổi trên đầu đi theo thú (78-danh-hieu-tren-dau.js tự lật lại để chữ không bị ngược khi thú quay mặt).
- **Emoji** lâu lâu mới hiện (cách nhau 9-16s, mỗi lần 2,6-3,4s): ❓🧐💦💢😵‍💫🤩✨😆✨💤🎵❗😏😤🥱😴💭. Bảng `EMO`.
- **Khung chat**: vài giây nói 1 câu (nghỉ 3,5-7s giữa 2 câu, hiện lâu theo độ dài câu, chữ hiện dần như đang nói). Viền + chip emoji góc theo tâm trạng: 😏 châm chọc, 😒 trách móc, 😡 tức giận (thú rung), 😄 vui vẻ (thú nhảy 2 nhịp), 😩 than vãn (thú xìu xuống), 💡 mẹo hướng dẫn chức năng, 😖 bị chạm. Không chồng nhau: đang nói thì không hiện emoji.
- Câu nói ở bảng `LINES` (thêm câu = thêm 1 chuỗi vào đúng nhóm, túi xáo nên không lặp ngay). Trọng số nhóm ở `W_NHOM` (mẹo 25%). ~18% câu theo tình trạng thật: hết Ngự Thú Châu, sắp hết châu, đang có Tinh Thạch, tên thú ra trận. Các mẹo bám đúng chức năng hiện có; sửa luật game thì sửa câu mẹo cho khớp.
- **Chạm vào thú** ở sảnh: thú dừng đi lại, phản ứng và nói ngay (nhóm 😖, 35% là tức giận). Chống bấm dồn 0,9s.
- Chỉnh nhịp/tần suất ở `TTGSANH.CFG` (`idle`, `hopDur`, `hopH`, `emo`, `chat`, `range`, `maxW`, `font`). Tắt hẳn: `TTGSANH.CFG.on=false`. Thử câu nào đó: gõ trong console `TTGSANH.say('gianDu')` hoặc `TTGSANH.say('meo','nội dung')`.
- Nối vào `index.html`: hàm `petSanh` (lấy `TTGSANH.pose` rồi vẽ thú theo tư thế) và cuối nhánh sảnh của `draw()` (`TTGSANH.draw`); thêm 1 dòng `<script>`. Không có module thì sảnh chạy như cũ.

## Kỳ Trân Các (cửa hàng) - bước 1: khung + tiền tệ (25/11/2026) — `85-cua-hang.js` (TTGSHOP)
- Khung = `game-moi/khung-cua-hang.webp` (1672x941, đã tách nền ngoài). Chữ tiêu đề, nút X, 4 nhãn trái (Tất Cả / Đạo Cụ / Pháp Bảo / Đặc Biệt), 8 ô trống, 2 ô tiền đều vẽ sẵn trong ảnh. Bấm nút Kỳ Trân Các (`81-nut-moi.js` gọi `TTGSHOP.open()`) để mở; đóng bằng nút X, chạm ngoài khung hoặc Esc.
- **Chưa có vật phẩm / mua bán.** Hiện chỉ hiện tiền: ô trái (ngọc lam) = Tinh Thạch, ô phải (ngọc tím) = Thú Thần Thạch, đọc từ `TTGTIEN` (66-tien-te.js), cập nhật mỗi 0,5s khi bảng mở.
- Mọi tọa độ (nút X, 2 ô tiền, 4 tab, 8 ô, ô thông tin) ở khối `BOX` đầu file, tính theo pixel ảnh khung. Thêm vật phẩm sau này: vẽ vào các ô theo `BOX`, dùng `TTGBALO.add`/`TTGTIEN.add` để mua.
- **Bước 2 (25/11/2026)**: khung nay được làm lại (`khung-cua-hang.webp?v=2`): đã xóa 8 ô vuông và xóa viền sáng của tab Tất Cả (cả 4 tab ở trạng thái thường). Ảnh tách thêm: `cua-hang-sang.webp` (viền sáng vàng cắt từ tab Tất Cả), `cua-hang-tab-mask.webp` (hình bóng tab, để làm sáng thân tab), `cua-hang-o.webp` (1 ô vuông, nhân bản thành lưới).
  - **Tab**: Tất Cả / Đạo Cụ / Pháp Bảo / Đặc Biệt. Bấm tab nào thì tab đó bật viền sáng + thân sáng nhẹ, lưới về đầu. `TTGSHOP.tab()` / `TTGSHOP.setTab(id)` (id: all, dao-cu, phap-bao, dac-biet).
  - **Lưới cuộn**: 4 cột, cuộn dọc bằng thanh cuộn vàng. Số ô = max(`CFG.oToiThieu`, số món làm tròn lên bội 4). Hiện 16 ô trống để thử cuộn; có món thật thì đặt 8 và sửa hàm `items(tab)`.
  - **Làm mới**: `CFG.lamMoiPhut=30`, thanh dài dưới trái hiện "Làm mới sau: mm:ss". Mốc chu kỳ lưu ở khóa `ttg_moi_cuahang_lm` (tính theo giờ máy, tắt game vẫn chạy). Hết chu kỳ gọi các hàm đăng ký bằng `TTGSHOP.onRefresh(fn)`.

## Chọn nhân vật Nam/Nữ + skin (26/11/2026) — `64b-chon-nhan-vat.js` (TTGNHANVAT)
- **Luồng mới**: màn chờ -> **chọn nhân vật** (Nam/Nữ) -> chọn thú đồng hành (65) -> vào game. 65 gọi `TTGNHANVAT.show(callback)`; bấm Xác Nhận ở màn nhân vật xong mới mở màn chọn thú. Người chơi cũ đã có thú mà chưa có nhân vật vẫn được nhắc chọn.
- Lưu `ttg_moi_nhanvat_v1 = {gioi:'nu'|'nam', skin, t}`; skin đã mở lưu `ttg_moi_nhanvat_skin_v1`. Cả hai nằm trong GIU của 65 nên không mất khi xóa trắng tài khoản. Thử nhanh: `?nhan-vat=1` ép hiện màn chọn.
- Ảnh: `game-moi/nhan-vat/<nu|nam>/<skin>-chon.png` (nhìn thẳng, 512x512, màn chọn) và `<skin>-map.png` (quay PHẢI, 512x512, bản đồ thám hiểm). `mac-dinh-4-goc-nhin.png` là bản gốc 4 góc nhìn (nền hồng) để làm sprite đi bộ sau.
- Bản đồ thám hiểm (89-tham-hiem-map.js) tự dùng `TTGNHANVAT.anhMap()` nếu `CFG.nhanVat.anh` để null. Hiện mới là 1 ảnh đứng yên có nhún khi đi; sprite đi bộ 4 hướng làm sau.
- **Thêm skin thưởng**: thêm 2 ảnh `<idSkin>-chon.png` + `<idSkin>-map.png`, thêm 1 dòng vào `SKINS` trong 64b, rồi `TTGNHANVAT.moKhoa(gioi,id)` + `TTGNHANVAT.datSkin(id)`.
- **Khung đi bộ (26/11/2026)**: `<skin>-di-phai.png` (ngang, quay phải, trái thì lật) và `<skin>-di-truoc.png` (chính diện) là dải 2048x512 = 4 khung 512x512 xếp ngang (khung 1, 3 = bước chân; 2, 4 = chuyển/đứng; đứng yên dùng khung 2). Map đi xuống rõ rệt dùng chính diện, còn lại dùng ngang. Đi lên rõ rệt dùng quay lưng (`-di-sau.png`). Có `mac-dinh-di-cheo.png` (nghiêng 3/4) chưa dùng. Đã có đủ ngang/chính diện/quay lưng cho cả Nam và Nữ; thiếu file thì map tự dùng ảnh đứng yên.

## Nhân vật ở sảnh + tương tác với thú (26/11/2026) — `84b-nhan-vat-sanh.js` (TTGNVSANH)
- Nhân vật người chơi đứng cạnh thú ở khung trên sảnh, mặt hướng về thú; thú nhảy sang chỗ khác thì nhân vật đi theo (khung đi bộ ngang, 8 khung/giây).
- **Chạm thú**: nhân vật chạy lại gần, vuốt ve (nhảy nhẹ 2 lần + tim bay lên), thú phản ứng và nói 1 câu vui (`TTGSANH.say('vui')`).
- **Chạm nhân vật**: quay ra nhìn người chơi (ảnh chính diện), nhảy chào, nói 1 câu trong bong bóng.
- **Tự động**: 9-18 giây một lần nhân vật hiện emoji, nói 1 câu, hoặc tự đi vuốt thú (không làm khi thú đang nói để khỏi chồng bong bóng).
- Nối ở `index.html` (1 lệnh `TTGNVSANH.draw(ctx,ts,gy())` ngay sau `petSanh`) và `TTGSANH.info()` trong 83. Tắt thử bằng `?nvsanh=0`. Chỉnh cỡ/khoảng cách/tốc độ ở `CFG`, thêm câu ở `LINES` / `EMO` trong file 84b.
- CHƯA TEST TRONG GAME (viết xong chỉ kiểm cú pháp): cần xem cỡ nhân vật (`CFG.kich`), vị trí đứng (`CFG.gap`) có hợp khung sảnh không.

## Skin "Giáng Sinh Nam" + "Giáng Sinh Nữ" (26/11/2026)
- 2 skin: `giang-sinh-nam` ("Giáng Sinh Nam", ảnh ở `nhan-vat/nam/`) và `giang-sinh-nu` ("Giáng Sinh Nữ", ảnh ở `nhan-vat/nu/`), khai trong `SKINS` (64b-chon-nhan-vat.js).
- **Skin KHÔNG phân giới**: Nam/Nữ trong tên chỉ để phân biệt bộ, nhân vật Nam hay Nữ đều mặc được cả hai. Sở hữu tính chung cả tài khoản (`daMo` không xét giới). Mỗi skin tự biết thư mục ảnh của mình qua `TTGNHANVAT.thuMuc(gioi, idSkin)` (riêng `mac-dinh` theo giới người chơi); `dsSkin(gioi)` = bộ mặc định + mọi skin thưởng của cả 2 giới. Ảnh đi bộ/trận/bảng Nhân Vật (64b, 84b, 90) đều đi qua `thuMuc`. Đổi giới tính không còn reset skin đã sở hữu. Thẻ chọn Nam/Nữ chỉ hiện skin cùng giới. Khóa skin (🔒) cũng tính chung.
- Đủ bộ ảnh mỗi skin: `<id>-chon`, `-map`, `-di-truoc`, `-di-phai`, `-di-sau` (dải 2048x512 = 4 khung), `-tran-tu-the`, `-tran-ra-lenh` (512x512, nền trong suốt, chân sát đáy), `-4-goc-nhin.png` (bảng gốc). Cỡ nhân vật căn theo đúng sprite mặc định của giới đó. Chưa có `di-cheo`.
- **Thêm skin thưởng mới**: bỏ ảnh vào `nhan-vat/<gioi>/<idSkin>-*.png`, thêm 1 dòng vào `SKINS` (id duy nhất toàn game, khuyến nghị đuôi `-nam`/`-nu`), rồi `TTGNHANVAT.moKhoa('nam'|'nu', idSkin)`.
- **Nút test ẩn**: chạm chữ "Danh Vọng" -> menu ẩn -> **Lấy tất cả skin** (cuối 64b, xóa khi ra bản thật). Bấm 1 lần = mở khóa MỌI skin đang khai trong `SKINS` (cả Nam lẫn Nữ, tự quét nên skin mới thêm vào `SKINS` tự có); chỉ MỞ KHÓA, mặc ở bảng Nhân Vật.
- Bảng Nhân Vật CHỈ hiện skin đã nhận (lọc `daMo` trong `entries()` của 90-nhan-vat-bang.js); vứt bỏ thì biến khỏi lưới. Nguồn nhận thật (sự kiện/cửa hàng) chưa làm.
- Nâng version nạp: 64b `?v=8`, 84b `?v=4` (59-nut-tham-hiem.js), 90 `?v=5` (81-nut-moi.js).

## Skin "Tết Nguyên Đán Nam" (26/11/2026)
- id `tet-nguyen-dan-nam`, tên "Tết Nguyên Đán Nam", ảnh `nhan-vat/nam/tet-nguyen-dan-nam-*.png` (đủ bộ như Giáng Sinh: chon, map, di-truoc/phai/sau, tran-tu-the, tran-ra-lenh, 4-goc-nhin). Khai trong `SKINS.nam`; không phân giới như các skin khác.
- Chân sau ở dải đi ngang hơi tối/nhạt là do ảnh gốc. Hiệu ứng ra lệnh (phong bao lì xì + hoa mai) vươn sát mép phải khung 512 nên có thể cụt vài pixel lấp lánh.
- Nâng version 64b `?v=9` (59-nut-tham-hiem.js).

## Skin "Tết Nguyên Đán Nữ" (26/11/2026)
- id `tet-nguyen-dan-nu`, tên "Tết Nguyên Đán Nữ", ảnh `nhan-vat/nu/tet-nguyen-dan-nu-*.png` (đủ bộ: chon, map, di-truoc/phai/sau, tran-tu-the, tran-ra-lenh, 4-goc-nhin). Khai trong `SKINS.nu`; ai cũng mặc được. Cỡ nhân vật căn theo sprite nữ mặc định. Nâng version 64b `?v=10`. Nút "Lấy tất cả skin" tự nhận luôn skin này.

## Skin "Thanh Long" (26/11/2026)
- id `thanh-long-nam`, tên "Thanh Long", ảnh `nhan-vat/nam/thanh-long-nam-*.png` (đủ bộ: chon, map, di-truoc/phai/sau, tran-tu-the, tran-ra-lenh, 4-goc-nhin). Khai trong `SKINS.nam`; ai cũng mặc được. Cỡ căn theo sprite nam mặc định. Nút "Lấy tất cả skin" tự nhận luôn skin này.

## Skin "Tiểu Hồ Ly" (26/11/2026)
- id `tieu-ho-ly`, tên "Tiểu Hồ Ly", ảnh `nhan-vat/nu/tieu-ho-ly-*.png` (đủ bộ: chon, map, di-truoc/phai/sau, tran-tu-the, tran-ra-lenh, 4-goc-nhin). Khai trong `SKINS.nu`; ai cũng mặc được. Cỡ căn theo sprite nữ mặc định. Nâng version 64b `?v=12`. Nút "Lấy tất cả skin" tự nhận luôn skin này.

## Skin "Tiêu Dao Tiên Tử" (26/11/2026)
- id `tieu-dao-tien-tu`, tên "Tiêu Dao Tiên Tử", ảnh `nhan-vat/nu/tieu-dao-tien-tu-*.png` (đủ bộ: chon, map, di-truoc/phai/sau, tran-tu-the, tran-ra-lenh, 4-goc-nhin). Khai trong `SKINS.nu`; ai cũng mặc được. Cỡ căn theo sprite nữ mặc định. Nâng version 64b `?v=13`. Voan trong suốt nên mép có thể còn vài điểm ám tím nhạt (do nền hồng gốc).

## Skin "Hắc Long Tôn Giả" (26/11/2026)
- id `hac-long-ton-gia-nam`, tên "Hắc Long Tôn Giả", ảnh `nhan-vat/nam/hac-long-ton-gia-nam-*.png` (đủ bộ: chon, map, di-truoc/phai/sau, tran-tu-the, tran-ra-lenh, 4-goc-nhin). Khai trong `SKINS.nam`; ai cũng mặc được. Cỡ căn theo sprite nam mặc định. Nâng version 64b `?v=14`. Ảnh trận tư thế và ra lệnh đứng cùng vị trí chân; ra lệnh có rồng lửa lớn nên nhân vật dịch trái hơn các skin khác.

## Chỉnh 26/11/2026 (sau khi thử Hắc Long Tôn Giả)
- Bảng Nhân Vật lệch bệ: do ảnh `tran-tu-the` của skin bị dịch trái để chừa chỗ rồng lửa. Quy tắc: `tran-tu-the` luôn đặt thân GIỮA ảnh 512 (bbox giữa ở x=256). `tran-ra-lenh` có thể RỘNG HƠN 512 (cao vẫn 512), thân đặt trùng tâm chân với tu-the, hiệu ứng tràn sang phải; code 84b vẽ theo `naturalWidth` nên ảnh 512 cũ không đổi.
- Trong trận dịch thú/quái vào trong để chừa chỗ cho nhân vật và phụ kiện sau này: PET_X .218 -> .27 (index.html, thú phải đối xứng 1-PET_X) và CFG.tran.petX .27 (84b). Nhân vật đứng theo thú (pet - gap) nên cũng dịch vào theo. Muốn sát/xa hơn thì sửa 2 số này CÙNG LÚC.
- Nâng cache: ảnh trận `?v=2` (84b), bảng Nhân Vật `?v=4` (90).

## Thay ảnh map thám hiểm mới (26/11/2026)
- Đã thay `map-tham-hiem-tuyet-nguyen.webp` và `map-tham-hiem-suong-coc.webp` bằng map mới (webp thật 1536x1024, ~0,5 MB mỗi ảnh; có đường mòn rõ, 4 khu, 16 chỗ núp, 4 biển KHU 1-4, cổng/hang boss trên cùng). 7 vùng còn lại chưa có map mới, giữ ảnh cũ.
- Các ảnh `bg-<slug>.webp` là ảnh nền vùng (cảnh nhìn ngang), KHÔNG phải map thám hiểm, không đụng tới.
- Nâng cache: 89 `?v=5` (ảnh tuyết nguyên `?v=2`), 82 `?v=3` (V = `?v=2`).
- VUNG['tuyet-nguyen'] vẫn là số liệu CŨ (mask rỗng, 16 điểm + boss ước lượng theo ảnh cũ), sẽ làm lại ở Bước 1-2 cho ảnh mới.

## Thay ảnh map thám hiểm 7 vùng còn lại (26/11/2026)
- Đã thay map mới (webp 1536x1024) cho: thanh-lam, thuy-nguyet-canh, xich-hoa-dia, nguyet-cung, loi-vuc, van-dao, phong-nguyen. Giờ cả 9 vùng đều có map mới.
- Nâng cache: 82 `?v=4` (V = `?v=3`). Chưa vùng nào ngoài tuyet-nguyen có trong VUNG của 89-tham-hiem-map.js; mask/điểm núp làm ở phiên sau.

## Sửa lỗi Debug Mask không vuốt vẽ được (26/11/2026)
- Nét vẽ dùng chung biến `s.last` với mốc thời gian khung hình nên chỉ tô được chấm đầu, sau đó vẽ điểm rung báo lỗi createRadialGradient. Đổi nét vẽ sang `s.last2`.
- Nâng cache: 89 `?v=6`. Đã thử cảm ứng giả lập: một đường vuốt 10 ô -> 124 ô, không còn lỗi.
- Tuyết Nguyên đang ở Bước 1: chờ chủ game khoanh mask và gửi chuỗi.

## Mask Tuyết Nguyên, Bước 1 (26/11/2026)
- Chủ game đã duyệt ảnh xem trước. Kiểu đi thoải mái: chỉ chặn vật to (núi, vách, thác, sông, hồ, 2 hang, cây khô, cây thông, cột đá, cụm tháp + bậc đá); bụi tuyết, đá thấp, tinh thể nhỏ đi được. Các vùng sau khoanh theo kiểu này.
- Nâng cache: 89 `?v=7`.
- Còn lại: Bước 2 (đặt lại điểm núp/boss, bỏ vòng banKinhMaskDiem đang "mở lối" qua chỗ chặn), Bước 3 (dấu hiệu + bóng thú).

## Tuyết Nguyên, Bước 2: điểm núp (26/11/2026)
- 16 điểm đặt lại cạnh chỗ núp trên map mới (đã kiểm tra trên lưới: đi được, nối với xuất phát, cách chỗ chặn ~2 ô). Boss giữ (780,168).
- banKinhMaskDiem = 0; boss giữ vòng banKinhCham=38. Thêm checkToi() vào checkCfg().
- Vị trí điểm cố định, spawnSpots không có jitter vị trí (chỉ jitter thời gian) nên không sửa.
- Nâng cache: 89 `?v=8`. Chưa chạy thử trong game (chủ game yêu cầu tiết kiệm quota).
- Tiếp theo: Bước 3.

## Tuyết Nguyên: thêm chỗ núp (26/11/2026)
- Chủ game: dùng hết chỗ núp mỗi khu, vẫn hiện ngẫu nhiên 3-4 con. Số chỗ khu 1-4: 9, 10, 7, 6. Các vùng sau làm như vậy.
- Nâng cache: 89 `?v=9`. Chưa chạy thử trong game.

## Tuyết Nguyên, Bước 3: dấu hiệu + bóng thú (26/11/2026)
- Bỏ vòng tròn hình thoi. Xa: xoáy tuyết + tinh thể (DAUHIEU.tuyet, VUNG.dauHieu). Gần (CFG.hienThu 150->70): bóng đen -> thú thật + hào quang màu HIEM.
- Hào quang vẽ riêng (haoQuang), không dùng TTGRUNE.ring vì ảnh rune theo Rank D..SR, không theo 4 màu độ hiếm.
- Thú tung sẵn lúc nhân vật lại gần, ép vào trận qua opts.chon (61-tham-hiem-tran.js). Rank (bac), cấp vẫn tung lúc vào trận.
- Bỏ vòng đếm ngược; còn <3s thì nhấp nháy.
- Nâng cache: 89 `?v=10`, 61 `?v=3`. CHƯA chạy thử, chưa có ảnh chụp (chủ game yêu cầu tiết kiệm quota); chờ chủ game duyệt trên máy.

## Giãn thú trên map thám hiểm (26/11/2026)
- Chủ game test: thú hiện dày, chắn lối. soDiemHien [3,4] -> [2,2]; thêm cachNhau=180, cachNguoi=130; cỡ thú 68 -> 56. Thay cho yêu cầu cũ 3-4 con mỗi khu.
- Nâng cache: 89 `?v=11`. Chưa chạy thử, chờ chủ game.

## Thú nhảy trên map thám hiểm (26/11/2026)
- Chủ game yêu cầu (thay quy tắc rung 20s cũ): mỗi con tồn tại 60s, đếm ngược trên đầu, hết giờ biến mất (không còn tự gia hạn).
- Nhảy quanh chỗ núp (CFG.nhay theo khu). Sử thi/huyền thoại tới gần thì nhảy tránh 3 cú rồi nghỉ 5s (CFG.chay). Không nhảy lên cầu (VUNG.camNhay), không vào ô chặn. Boss đứng yên.
- cooldownSauTran 900 -> 3000 ms.
- Nâng cache: 89 `?v=12`. Chưa chạy thử, chờ chủ game.

## Quái nhào vào, thú bỏ chạy (26/11/2026)
- Chủ game làm rõ: QUÁI (chon.source=main, mọi độ hiếm) tự nhào về người chơi (CFG.nhao); THÚ (demo) sử thi/huyền thoại chỉ chạy tránh (CFG.chay). Không nhào trong 3s sau trận, không lên cầu.
- Nâng cache: 89 `?v=13`. Chưa chạy thử.

## Sương Cốc: mask + chỗ núp + dấu hiệu (26/11/2026)
- Chủ game đã duyệt ảnh mask. VUNG['suong-coc'] mới: điểm xuất phát (740,990), boss (780,168), 2 cầu gỗ trong camNhay, DAUHIEU.suong. Tên khu là TÊN TẠM.
- Nhảy/nhào/chạy/60s dùng chung với Tuyết Nguyên.
- Nâng cache: 89 `?v=14`. Chưa chạy thử (chỉ kiểm tra trên lưới + cú pháp). Còn 7 vùng.

## Vân Đảo: mask + chỗ núp + dấu hiệu (26/11/2026)
- Chủ game đã duyệt ảnh mask (sửa 4 lần: thu mép đảo, bỏ chỗ thác khu 3/4, rìa phải khu 2, mở pha lê trái khu 1). VUNG['van-dao']: xuất phát (740,990), boss (800,170), 3 cầu gỗ trong camNhay, DAUHIEU.van (mây trôi + cánh hoa tím). Tên khu là TÊN TẠM.
- Chỗ núp: khu1 10, khu2 10, khu3 8, khu4 6. checkCfg() sạch.
- Nâng cache: 89 `?v=15`. Chưa chạy thử (chỉ kiểm tra trên lưới + cú pháp). Còn 6 vùng: phong-nguyen, loi-vuc, nguyet-cung, thuy-nguyet-canh, xich-hoa-dia, thanh-lam.

## Nút ẩn "Mở all map" (26/11/2026)
- Menu ẩn (chạm chữ "Danh Vọng") có thêm nút đầu tiên "Mở all map: BẬT/TẮT". Bật = mọi vùng mở (bỏ qua Danh Vọng), lưu localStorage `ttg_moi_moall`; tắt = về như cũ. Chỉ để thử; khi bật, trần cấp cũng tính theo số vùng mở.
- Nâng cache: 80 `?v=10` (trong 59), 59 `?v=17x`. Chưa chạy thử.

## Boss Sương Cốc vào giữa + Boss luôn V3 (26/11/2026)
- Sương Cốc: boss dời (780,168) -> (835,160) giữa quảng trường (chủ game báo bị lệch); chỗ núp 4c dời (882,196) -> (924,196) để cách boss >=95. checkCfg() sạch.
- 61-tham-hiem-tran.js: trận Boss (thú & quái) luôn tien = TTGBONG.CFG.tx.bacBoss (3) = V3; bắt về vẫn V1 (bacKhiBat ở 62, không đổi).
- Nâng cache: 61 `?v=4`, 89 `?v=16`. Chưa chạy thử.

## Phong Nguyên: mask + chỗ núp + dấu hiệu (26/11/2026)
- VUNG['phong-nguyen']: mask từ phiên trước (đi thoải mái, chặn cây/trụ đá/biển/đá lớn), xuất phát (800,1000), boss (770,150) giữa quảng trường đá, 2 cầu gỗ trong camNhay, DAUHIEU.phong (gió xoáy + lá đỏ). Tên khu là TÊN TẠM.
- Chỗ núp: khu1 10, khu2 10, khu3 8, khu4 5 (đã kiểm trên mask: đi được, cách nhau >=55, cách boss >=95). checkCfg() sạch.
- Chủ game CHƯA duyệt mask bằng mắt trong phiên này; nếu cần sửa thì chỉnh lại mask.
- Nâng cache: 89 `?v=17`. Chưa chạy thử. Còn 5 vùng: loi-vuc, nguyet-cung, thuy-nguyet-canh, xich-hoa-dia, thanh-lam.

## Lôi Vực: mask + chỗ núp + dấu hiệu (26/11/2026)
- VUNG['loi-vuc']: mask Claude khoanh, chủ game đã duyệt ảnh xem trước (đã sửa quanh cột đá khu 2). Xuất phát (740,990), boss (777,150) giữa quảng trường cổng, cầu đá trong camNhay, DAUHIEU.loi (tia chớp tím + tia lửa). Tên khu là TÊN TẠM.
- Chỗ núp: khu1 7, khu2 7, khu3 7, khu4 5 (đã kiểm: đi được, cách nhau >=55, cách boss >=95).
- Nâng cache: 89 `?v=18`. Chưa chạy thử. Còn 4 vùng: nguyet-cung, thuy-nguyet-canh, xich-hoa-dia, thanh-lam (van-dao: xem trạng thái repo).

## Nguyệt Cung: mask + chỗ núp + dấu hiệu (26/11/2026)
- VUNG['nguyet-cung']: mask Claude khoanh trước đó, chủ game đã chốt (lấy lại từ ảnh xem trước). Xuất phát (800,1000), boss (868,214) dịch phải cho giữa cổng, cầu đá cong khu 2 trong camNhay, DAUHIEU.nguyet (đom đóm trăng + cánh hoa hồng rơi). Tên khu là TÊN TẠM.
- Chỗ núp: khu1 7, khu2 6, khu3 6, khu4 4 (đã kiểm: đi được, cách nhau >=55, cách boss >=95). checkCfg() sạch.
- Nâng cache: 89 `?v=19`. Chưa chạy thử. Còn 3 vùng: thuy-nguyet-canh, xich-hoa-dia, thanh-lam.

## Thủy Nguyệt Cảnh + Xích Hỏa Địa + Thanh Lâm: mask + chỗ núp + dấu hiệu (26/11/2026)
- Cả 3 vùng thêm vào VUNG (mask 192x128, xuất phát (790,1000)/(790,1000)/(780,1000), boss ở cuối đường, camNhay ở cầu). Mask khoanh nhanh bằng đa giác (Xích Hỏa Địa có trừ vùng dung nham theo màu ảnh), CHƯA duyệt kỹ bằng mắt: chủ game test rồi báo chỗ nào lệch thì chỉnh.
- Chỗ núp: tự chọn ô đi được cạnh vật cản (cách nhau >=62, cách boss >=100), mỗi khu 4-7 chỗ. DAUHIEU thêm: thuy (gợn sóng), hoa (tàn lửa), lam (đom đóm xanh).
- Nâng cache: 89 `?v=20`. Chưa chạy thử game. Tất cả 9 vùng đã đủ.
- Thêm 27/11/2026: BẤM ĐÈ ICON TRONG TRẬN HIỆN THÔNG TIN (index.html, khối `ICH/TIP/drawTip`): giữ 0,32s trên icon kỹ năng hoặc icon trạng thái (buff/debuff) thì hiện khung mô tả ngay dưới icon, nhả tay là ẩn. Icon kỹ năng: tên + mô tả sách (`TTGCS.sachMoTa`) + còn mấy lượt hồi chiêu. Icon trạng thái: tên `t` + mô tả `m` khai ngay trong `stList()` (muốn thêm trạng thái mới thì thêm t/m ở đó). Mộc Tâm luôn hiện số, mô tả 'Hồi (5 x số tâm)% máu tối đa mỗi lượt'. Chưa chạy thử trong game.
- Thêm 27/11/2026: màn thám hiểm (89-tham-hiem-map.js): GỠ nút Debug Mask + bảng công cụ + phím M; nút Dừng đổi thành nút QUAY LẠI (khung `khung-nut.webp` vàng-xanh đêm + mũi tên cong phát sáng + chữ vàng, góc trên phải, cỡ chỉnh ở `BACK_S`), chức năng giữ nguyên (về sảnh, Esc vẫn dùng được). Chưa chạy thử trong game.
- 27/11/2026: nút Quay lại đổi MÀU ĐỎ: khung `khung-nut-do.webp` (bản đỏ của khung-nut.webp, tạo bằng đổi hue xanh/tím -> đỏ, giữ viền vàng), nền trong đỏ sẫm, mũi tên phát sáng đỏ (89-tham-hiem-map.js).
- 27/11/2026: (1) Map thám hiểm BỎ `requestFullscreen` (gây thông báo Chrome 'Để thoát khỏi chế độ toàn màn hình...'); muốn toàn màn hình thật thì chơi bản cài (PWA, manifest display fullscreen). (2) index.html chặn chọn chữ/menu 'Tìm kiếm Google' khi đè giữ: CSS `*{user-select:none;-webkit-touch-callout:none}` + chặn selectstart/contextmenu/dragstart (trừ ô nhập liệu).

## Hiệu ứng tiến hóa thú (28/11/2026)
`110-hieu-ung-tien-hoa.js` (TTGTHFX): khi bấm Tiến Hóa, kết quả được tính trước rồi chiếu hiệu ứng toàn màn hình: hình thú hiện giữa màn hình, trắng dần, tia sáng "chíu chíu" hút vào kèm tiếng, lóe trắng, rồi hiện THÀNH CÔNG (thú bậc mới, tia vàng) hoặc THẤT BẠI (thú xám, mảnh vỡ tím). Chạm khi đang tích tụ = nhảy tới lúc lóe; chạm sau khi có kết quả = đóng. Toast kết quả hiện sau khi đóng. Thử không đổi dữ liệu: `TTGTHFX.test(true|false)` trong console (cần có thú ra trận). Chỉnh thời gian/âm thanh ở `TTGTHFX.CF`. Móc gọi nằm ở `doEvo` / `fx` trong `75-tien-hoa-thu.js`.
