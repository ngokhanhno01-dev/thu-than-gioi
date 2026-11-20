# FX kỹ năng boss bằng ảnh — hướng dẫn bàn giao

Nhánh: `fx-ky-nang-boss`. File chính: `game-moi/57-fx-ky-nang-boss.js`. Demo: `tools/fx-boss-demo.html`.
Ảnh sprite: `game-moi/fx-boss/<tên>.png` (3 cột x 2 hàng, mỗi ô vuông 768px, nền trong suốt do người dùng tự tách).

## Tiến độ
| # | id kỹ năng | trạng thái | ảnh |
|---|---|---|---|
| 1 | `bang-son-ap-dinh` | xong | `bang-son-ap-dinh.png` |
| 2 | `suong-nuot` | xong | `suong-nuot.png` |
| 3 | `con-bang-trien-si` | xong (bỏ khung 1, không vòng ấn dưới chân địch) | `con-bang.png` |
| 4 | `vu-xa-trien` | xong, chờ người dùng xem hình thật | `vu-xa.png` |
| 5 | `thien-loi-giang` | CHƯA | dự kiến `thien-loi.png` |
| 6 | `nguyet-thuc-nuot` | CHƯA | dự kiến `nguyet-thuc.png` |

## Hằng số game (đã có trong file 57)
Canvas FX 360x250, mặt đất `GY=204`, trúng đích `TH=.665`s, kết thúc `END=1.68`s, `t=u*1.9`.
`aim(S)` trả `{dir,x,scale,miss}`: địch ở x=272 nếu `S.pa` (dir=1, người đánh bên trái) ngược lại x=85 (dir=-1).
Hạt/sóng vẽ qua `pixelLayer` (ép màu pixel); ảnh sprite vẽ thẳng lên `g` để giữ màu. FX chỉ phụ thuộc canvas 360x250, không phụ thuộc hướng màn hình.

## Quy trình mỗi skill
1. Người dùng gửi ảnh sheet đã tách nền. Kiểm tra: kích thước, bbox từng ô (ô nào chạm mép), viền màu lệch (xem trên nền tối bằng mắt).
2. Nếu viền bị ám màu lạ: xử lý bằng script riêng (script cũ `fx_sprite_fix.py` đã mất, viết lại nếu cần). Ảnh sạch thì dùng thẳng.
3. Đo neo: mặt đất mỗi ô (y trong ảnh gốc), tâm ngang, mũi/đầu nếu có vật bay.
4. Thêm vào file 57 theo mẫu: loader ảnh (đầu IIFE, đọc `document.currentScript.src`), `xxxSprite` + `xxxSpriteFx`, nhánh `else if(S.kyNang==='<id>'&&XS.ok)` trong `API.drawAttack` đứng TRƯỚC nhánh `else pixelLayer(...run...)` (bản dự phòng khi ảnh lỗi). Mẫu: `iceSprite`, `mistSprite` (cắt đôi hàm), `whaleSprite` (vật bay), `snakeSprite` (bảng SNK_SPR, lật theo dir).
5. Kiểm tra: `node --check`, rồi harness giả (`window.TTGCombatFX`, `Image`, canvas Proxy), quét u=0..1, cả hai `pa`, miss/crit, xem `window.__fxBossErr` và NaN.
6. Commit tách 2 lần (ảnh / code), đẩy lên nhánh, người dùng tự test ở `tools/fx-boss-demo.html`.

## Lưu ý đã gặp
- Ảnh chạm mép ô bị cắt thẳng: làm mờ mép hoặc vẽ lại.
- Bóng ellipse/vòng ấn dính trong ảnh sẽ nằm dưới chân địch: skill lao tới KHÔNG được có vòng ấn.
- Vật thể bất đối xứng vẽ một hướng (quay phải), lật bằng `g.scale(dir,1)`.
- Địch ở x=272 làm ảnh rộng bị cắt mép phải: kẹp tâm ảnh `ax=clamp(x,half,360-half)`.
- Tia năng lượng, hạt, mưa, dòng chảy để code vẽ.
- KHÔNG lưu token GitHub vào repo; thu hồi token đã dán trong chat.

## Mốc thời gian gợi ý cho 2 skill còn lại
- Thiên Lôi Giáng: 1 mây tụ 0–.2 · 2 mây tối, tia nhỏ .2–.4 · 3 sét chính giáng .4–.665 · 4 nổ chói lúc trúng .665–.9 · 5 cột sét phụ + điện bò .9–1.3 · 6 khói, tàn lửa 1.3–END. Code cũ: sét chính ở TH-.06, ba cột phụ ở TH+.13, +.29, +.44.
- Nguyệt Thực Nuốt: 1 trăng đen hiện 0–.2 · 2 ánh sáng nhỏ giọt .2–.4 · 3 xoáy tối ở chân, tia bạc bị hút .4–.665 · 4 nổ tối + vòng bạc .665–.9 · 5 sóng tối lan .9–1.3 · 6 tan 1.3–END. Trăng cố định trên đầu địch (y≈59, bán kính ≈46 trong code cũ), tan sau TH+.2.
