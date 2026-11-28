# Thiết kế TÁI SINH + chỉnh cân bằng

Trạng thái (28/11/2026): **mục 3 và 4 ĐÃ làm vào game. Tái sinh (mục 1, 2) LÀM SAU** (còn phải vẽ icon, khung giao diện).

## 1. Tái sinh (luật đã chốt, CHƯA làm)

- Thú phải lên **V3** mới được tái sinh.
- Thành công: thú về **V1, cấp 1**. Gốc mới = **chỉ số V3 ở cấp 1** (không tính trang bị, không tính phần tăng do cấp).
- **Nhân dồn** qua mỗi lần. Tối đa **5 lần**.
- **Thất bại: mất thú.**
- **Không có bùa hộ mệnh.** Muốn mạnh phải liều.

Mỗi lần tái sinh, gốc được nhân: máu, công, thủ x1,8; tốc độ x1,2; may mắn x2,2.

Ví dụ thú Cân bằng, Rank C, chưa tính trang bị và thưởng khác (gốc V1 cấp 1, số làm tròn):

| Số lần | Máu | Công | Thủ | Tốc độ | May mắn |
|---|---|---|---|---|---|
| 0 | 150 | 40 | 30 | 40 | 10 |
| 1 | 270 | 72 | 54 | 48 | 22 |
| 2 | 486 | 130 | 97 | 58 | 48 |
| 3 | 875 | 233 | 175 | 69 | 106 |
| 4 | 1575 | 420 | 315 | 83 | 234 |
| 5 | 2834 | 756 | 567 | 100 | 515 |

Lưu ý khi code:
- Nên lưu **số lần tái sinh** (0 đến 5) trên từng con, rồi tính hệ số = hệ số V3 mũ số lần. Không lưu số đã làm tròn, để tránh sai số dồn.
- Rank, vai trò, độ hiếm chỉ nhân **1 lần**, không nhân lại mỗi lần tái sinh.

## 2. Tỉ lệ thành công (TẠM ĐỀ XUẤT, chờ chốt)

| Lần | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Tỉ lệ mỗi lần | 80% | 65% | 50% | 35% | 20% |
| Đi từ đầu tới lần này | 80% | 52% | 26% | 9,1% | 1,82% |

Trung bình khoảng 55 thú liều tới cùng mới được 1 con tái sinh 5.

## 3. Bỏ hệ số vùng trong chỉ số (ĐÃ làm)

- `56-chi-so.js`: `hsVungMoiZ` từ 0.3 thành **0**.
- **Giữ nguyên phần thưởng:** hệ số vùng của EXP (`hsExpVungMoiZ`) và Tinh Thạch (`66-tien-te.js`) không đổi.
- Quái vẫn tăng cấp theo vùng.
- Ảnh hưởng: thú vùng cao người chơi đang nuôi sẽ yếu đi; chỉ số cộng thẳng của trang bị cũng giảm theo (`73-luat-trang-bi.js` dùng chung số này).

**Boss Thần (đã chốt):** tính theo cách cũ, chỉ bỏ hệ số vùng. Giữ `hsBossLoai` = **2**. Riêng máu: cả 3 boss tăng lên khoảng **2 triệu** ở cấp 270, bằng cách đổi `hsBossHp`:

| Boss | `hsBossHp` cũ | `hsBossHp` mới | Máu |
|---|---|---|---|
| th1 Đế Giang | 30 | **129.7** | 1.999.949 |
| th2 Chúc Long | 30 | **137.33** | 1.999.958 |
| th3 Vô Cực | 30 | **89.79** | 1.999.898 |

**Boss Thần không dùng Rank** (boss chỉ xuất hiện 30 phút), nên máu cố định như bảng trên. Code hiện đã làm đúng: `61-tham-hiem-tran.js` đặt mốc cố định `'C'` (hệ số x1) và ẩn Rank. Rank chỉ tung khi trứng nở.

Bảng dưới là chỉ số trước khi tăng máu (`hsBossHp` = 30). Công, thủ, tốc độ không đổi khi tăng máu.

Ví dụ Đế Giang cấp 270, V3 (chưa tính khắc hệ và buff):

| | Máu | Công | Thủ | Tốc độ |
|---|---|---|---|---|
| Hiện tại (có x vùng) | 2.821.825 | 39.018 | 16.722 | 5.978 |
| Sau khi bỏ x vùng | 462.594 | 6.396 | 2.741 | 980 |

Boss và thú Thần người chơi nuôi đều giảm khoảng 6,1 lần ở máu, công, thủ, tốc độ.

**Cập nhật sau khi thử (ĐÃ làm, thay cho số 2 triệu ở trên):**

- Máu 3 boss Thần: khoảng **1.000.000** (`hsBossHp`: th1 64.85, th2 68.665, th3 44.895).
- Thua trận chờ **15 giây** (`khoaGiay`).
- Rơi trứng khi giết boss Thần: **1,5%** (`104-trung-than.js`), **tính may mắn** giống sách: tỉ lệ x (1 + may mắn/100), tối đa x3.
- Dự định sau này (CHƯA làm): vật phẩm trả tiền thật **x2 tỉ lệ rơi**.
- Rơi sách khi giết boss Thần: **5%** (`TY_LE_ROI_SACH_THAN`), vẫn nhân may mắn như trước. Boss thường giữ 1,5%.

## 4. Hệ Thần (ĐÃ làm)

- Không Gian, Thời Gian, Vô Cực đánh 18 hệ vùng: từ x1,5 xuống **x1,2**.
- Hệ vùng khắc nhau vẫn x1,5. Cần **một con số riêng** cho hệ Thần, không sửa số chung `CFG.he.khac`.

## 5. Chưa quyết

1. Có đòi cấp tối thiểu để tái sinh không (gợi ý: 100). Code hiện không đòi cấp khi tiến hóa.
2. May mắn nhân dồn tới khoảng x51,5: giữ vậy hay giới hạn. Cần xem may mắn ảnh hưởng rơi đồ thế nào.
3. Trang bị: gợi ý tự trả về balo trước khi tái sinh.
4. Gợi ý có bảng xác nhận ghi rõ tỉ lệ và cảnh báo mất thú.
5. Nếu có đấu giữa người chơi: có cần luật riêng cho thú tái sinh cao không.

## 6. Hệ lai tạo

Tạm cất `THIET_KE_HE_MOI.md`, chưa làm.
