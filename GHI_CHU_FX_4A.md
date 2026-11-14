# Ghi chú bàn giao — làm lại 4 hiệu ứng 4A (nhánh fx-ve-bang-code)

## Đã code xong (CHƯA kiểm thử bằng harness, CHƯA ai xem hình thật)
`node --check 31-combat-fx.js` đã OK. Việc còn lại: chạy harness (fake canvas) xem không lỗi/NaN, hạt tối đa <1000, đếm draw call; rồi nhờ người dùng xem /tools/fx-demo.html (mục "Trạng thái / sự kiện · 4A").

1. **Hồi sinh** → hàm mới `statusRevive` (gọi từ đầu `statusHeal` khi text có "hồi sinh"): pháp trận → 7 tia sáng bắn thẳng lên lần lượt → năng lượng tụ về ngực thú thành quả cầu → nở ra. Thêm helper `ringPix`.
2. **Đóng băng** → `statusFreeze` viết lại: khối băng lớn nửa trong suốt trùm qua đầu thú, tinh thể băng quanh chân + trên đỉnh, vỡ thành mảnh ở cuối.
3. **Dung nham** → `pixelLava` viết lại kiểu núi lửa: đất rung + nứt đỏ → 5 cột dung nham phun lên → cục nham bắn cung rơi + khói. Trong `drawLavaAttackCode` đoạn cuối đổi thành `return true` (phần phun do drawImpact vẽ, tránh vẽ 2 lần).
4. **Bất khuất** → `bqAura` viết lại (cuồng nộ): bùng nổ lúc kích hoạt (sóng đất, cột lửa đỏ-đen, mảnh bắn), aura lửa dữ dội, gân giận, đối thủ run + mồ hôi lạnh vài giây đầu. State `BQ.t0` (reset trong `burnReset` và khi hết điều kiện máu<50%). Demo: tools/fx-demo.html chạy bq với `t%7` để bùng nổ lặp lại.

## Cần kiểm tra kỹ
- Dung nham: có còn bị vẽ 2 lần không; vị trí khói/cột không đè lên thú quá nhiều.
- Bất khuất: `FXE.seed('bq-act:'+side, age)` có ổn định (chỉ nổ 1 lần) không — nếu không, đổi sang cờ trong BQ.
- Đóng băng: khối băng không che kín thú (alpha đã giảm ~.4–.55).
- Chi phí draw call (mục tiêu mỗi hiệu ứng mới < ~700/khung).

## Quy tắc bất di bất dịch (nhắc lại)
Chỉ sửa hiệu ứng; không đụng cơ chế/chỉ số/lưu/UI/âm thanh/vẽ thú; dùng E.rng/E.seed không Math.random; không rung màn hình; không flash trắng che mục tiêu; KHÔNG ghi vào main. Commit bắt đầu "[FX 4A] …".

## Việc sau đó (chờ người dùng nói "tiếp")
Bước 4B: gỡ hạ tầng ảnh (giữ fx/khien-xanh.png, fx/khien-do.png; tools/ref-* chỉ demo, liệt kê chứ không xoá), bước 5: kiểm tra cuối + mở PR cho người dùng merge. Trả lời tiếng Việt, ngắn gọn, người dùng dùng điện thoại, ngại hết quota.

## Cập nhật sau phản hồi (12:20)
- Hồi sinh: đổi thành 22 tia nhỏ, mảnh, ngắn, rải đều quanh pháp trận (ảnh mẫu: cột sáng + hạt lấp lánh xanh/vàng).
- Dung nham: tách `lavaCracks` — đất nứt TỪ TỪ + rung trong lúc tung chiêu (drawLavaAttackCode, u 0→1), rồi lúc trúng (drawImpact→pixelLava) mới phun trào 7 cột to + khói đen viền cam (ảnh mẫu).
- Đã chạy harness t11.js: 0 lỗi. Chưa đo draw call, chưa xem hình thật.
