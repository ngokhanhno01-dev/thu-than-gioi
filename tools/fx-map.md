# Bản đồ hiệu ứng chiến đấu (bước FX 0)

Ghi chú cho người/Claude làm tiếp. Không ảnh hưởng game (file này không được trang nào nạp).
Nhánh làm việc: `fx-ve-bang-code` (tạo từ `main` tại commit 5fd71bb, sau khi PR #1 merge).

## 1. Kiến trúc hiện tại
- `31-combat-fx.js` (nền): `window.TTGCombatFX = {zones, getZone, getStartBuffs, begin, drawBack, drawField, drawArenaPanels, drawArenaBack, drawArenaBuffs, drawCountdown, drawAttack, drawImpact}`.
- `33-attack-fx.js` BỌC `drawAttack` và `drawImpact` của 31. Nó dùng `Proxy` trên canvas context để chặn lần `drawImage` đầu (sprite chính) rồi tô màu/xoay/phóng to. Khi bỏ ảnh thì cách này vô nghĩa: phải viết lại 33 (không còn Proxy/tinted/hook), lỗi thì rơi về hàm gốc của 31 (`try/catch` đang có).
- Thứ tự nạp trong `index.html`: ... `26-arena.js`, `27`...`30`, `31-combat-fx.js`, `32-prefight.js`, `33-attack-fx.js`, rồi Firebase, `24-mail.js`, `19-save.js`.
- `32-prefight.js` KHÔNG dính hiệu ứng (chỉ bảng so sánh HTML).
- Không được nạp bởi index.html: `vfx-art.js`, `10-drops-shop (1).js`, các file `.py`.

## 2. Khung vẽ và toạ độ
- Canvas game: 360x250 (`#cv`, `#mob-c`). Bảng chữ trong 31 dùng CW=360, CH=230.
- Thú x=85, quái x=272, thân y≈208 (tâm vẽ đòn y=148/150), mặt đất y≈204.
- drawAttack: `sx=pa?112:248`, `tx=pa?255:105`, `ty=148` (pa = thú người chơi đang đánh).
- drawImpact: `target=(block/heal/stun)?(pp?90:270):(pp?272:90)`, `y=150`.

## 3. Giao diện hàm và thời điểm (PHẢI GIỮ)
`drawAttack(g,T,S)` — S: `s`(vùng của bên đánh) `u`(tiến độ 0..1) `pa` `text` `miss` `cr`(chí mạng) `i`(số thứ tự đòn).
- Đánh xa: u<.035 không vẽ; .035–.18 tụ lực tại `sx`; .18–.43 bay từ `sx` tới `tx` (chạm đích ở u=.43); sau đó trả `true` (phần trúng do drawImpact).
- Cận chiến: u<.23 không vẽ; .23–.60 nhát chém ở `tx`; ≥.60 trả `true`.
- Hàm trả boolean (true = đã vẽ xong/ổn).
`drawImpact(g,fx,T)` — fx: `k`('block','heal','stun','miss','crit', hoặc undefined = trúng thường) `s` `q`(0..1) `pp` `text` `i`.
`drawBack(g,T,elapsed,i,R,shP,shM,hp,mh,petSp,hold)` gọi từ `06-mobs.js` TRƯỚC `aura()/drawPet`: `TTGCombatFX.drawBack(g,tt,(T0-t0)/1000,e.m.zone,R,shp,shm,hp,mh,pet.sp,CD)`.
`drawArenaBack(g,T,t,spP,spM,bP,bM)` gọi từ `26-arena.js`: `TTGCombatFX.drawArenaBack(g,tt,T,pet.sp,oppSP,zbP,zbM)`.
`drawField` (lớp trên: nhãn + viền khiên + bảng thông tin), `drawArenaBuffs`, `drawArenaPanels`, `drawCountdown`, `begin`, `getStartBuffs`: chưa xem chỗ gọi cụ thể trong 06-mobs.js/26-arena.js (xem mục 7).

## 4. Chuỗi chữ (text) mà hiệu ứng đang bắt bằng regex (không được đổi dữ liệu)
- drawAttack/33: `Dung Nham Phun Trào|Thiêu đốt -|Xích Diệm vùng|Lôi Phạt giáng` (đòn đặc biệt); `Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích` (ép cận chiến); `Lôi Phạt giáng|Dung Nham Phun Trào` (ép đánh xa).
- drawImpact: `Khiên hấp thụ|Chắn đòn`, `hồi sức|Sinh Cơ Cổ Thụ|Hồi sinh`, `Hút máu`, `Lôi Phạt|Lôi Kích -`, `Dung Nham|Thiêu đốt|Xích Diệm`, `Phản đòn|Phản Chấn|Nguyệt Ảnh phản kích`, `Xuyên giáp`, `Liên kích -`, `Phong Nhận(chém| -)`, và gearProc: `Dương Diệm`, `Thần Phán|Tinh Quang`, `Thiên Uy`, `Sương Tán`.
- Loại sự kiện `fx.k`: block, heal, stun, miss, crit.

## 5. Chỗ đang dùng ẢNH (cần thay bằng vẽ code)
31-combat-fx.js:
- Hạ tầng ảnh: `RECTS`, `seq/one/lone/fxs`, `pathFor`, `getAtlas/ready` (còn dùng `ATLAS_SRC` KHÔNG được khai báo = lỗi tiềm ẩn nếu gọi), `LOOSE/looseImg` (đọc `fx/`), `frame`, `tinted`, `paint`, preload bằng `setTimeout` sau 800ms.
- Dữ liệu: `ZONES[].attack` và `ZONES[].field` (ảnh đòn đánh + ảnh buff vùng, kèm tham số `bt` độ nhuộm); `SHIELD`, `LIGHTNING`, `LAVA`, `HEAL`, `WARM`, `AURA(c)`, `GEAR_AURA` (17 bộ: frost, mist, cloud, wind, thunder, counter, sun, shield, thorn, revive, grove, lava, ambush, star, first, weaken, judge), `gearArt`, `gearCol`, `gearProc`.
- Nơi vẽ ảnh: `backZone` (paint z.field), `backGear` (paint gearArt), `drawBack` (Bất khuất: AURA('red') cho thú và quái khi máu <50%), `drawField` (khiên SHIELD), `drawAttack` (LAVA, LIGHTNING, đòn xa/gần), `drawImpact` (SHIELD, HEAL, LIGHTNING, LAVA, đòn trúng thường, proc bộ trang bị).
- Hạt "pixel" thô: `mote()` (fillRect/đa giác nhỏ) trong 31; `part()` trong 33 (nhiều fillRect).
33-attack-fx.js: `PROF` (17 vùng, kiểu quỹ đạo lob/wave/zig/drop/down/helix/S/bounce/none), `FACE`, `ZT`, `tinted`, `hook` (Proxy), `drawMain`, `halo`, `pillar`, `atkRanged`, `atkMelee`, `drawAttackX`, `drawImpactX`.
Ngoài 31/33: chưa kiểm được (xem mục 7). Ảnh nằm ở `fx/` (97 file) và ~600 file lẻ ở gốc repo, `combat-fx-atlas.png` 6,5MB (code không còn nạp).

## 6. Hướng thay thế đề xuất
- Viết lại 33 thành bộ vẽ theo từng vùng (hàm riêng cho mỗi vùng: tụ lực/ra đòn/trúng), dùng engine mới đặt trong 31 (PRNG riêng, hạt có pool, ribbon, blob mềm, đa giác tinh thể, vòng/sóng). Bỏ Proxy.
- Giữ nguyên tên hàm, chữ ký, mốc thời gian ở mục 3.
- Mọi ngẫu nhiên của hiệu ứng dùng PRNG riêng (31 đã có `rnd(seed)`, 33 có LCG riêng); KHÔNG dùng `Math.random()` của logic trận.

## 7. Chưa kiểm
- Tìm kiếm mã (search_code) không dùng được trên repo này (chưa lập chỉ mục), nên chưa liệt kê hết chỗ gọi API và chỗ dùng ảnh hiệu ứng riêng lẻ trong `06-mobs.js` (143KB) và `26-arena.js` (83KB). Khi làm bước cần chỗ gọi nào thì đọc đúng file đó và tìm: `TTGCombatFX`, `Image(`, `.png`, `impact-burst`, `critical-flare`, `dodge-dome`, `revive-orb`, `shield-orb`.
