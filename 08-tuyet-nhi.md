# 08 · Tuyết Nhĩ (Tuyết Nguyên)

![Tuyết Nhĩ](../../08-tuyet-nhi.png)

- **Vùng:** Tuyết Nguyên (vùng 0)
- **Loài:** Tuyết Nhĩ (nấm tuyết), con số 8 trong 10 loài của vùng. Sinh vật nấm: mũ tròn xoè rộng nhiều nếp lượn như tai, thân ngắn mập, hai chân nhỏ. Dáng ô rộng, khác Tuyết Cầu (quả cầu).
- **Tên:** Tuyết Nhĩ, dùng chung cho cả 3 bậc (không đặt tên riêng từng bậc).
- **Ảnh:** `08-tuyet-nhi.png` (ở thư mục gốc của nhánh), 688×384, 1 ảnh gồm 3 bậc xếp ngang, trái → phải = Bậc 1 → 2 → 3. Ảnh từ Canva đã có sẵn nền trong suốt; đã **xoá dấu sao hồng** ở góc dưới phải, chuyển **alpha cứng 0/255** (ảnh gốc có ~24k pixel bán trong suốt gây viền hồng nhạt), không thu nhỏ. Còn 56 mảnh rời (bông tuyết, mây, tinh thể nhỏ, vạch bóng đổ) là thiết kế, đã giữ.

## Đặc điểm hình ảnh
- Bậc 1: nấm con nhỏ, mũ trơn xanh băng nhạt, thân navy tròn mập, mắt cyan to có điểm sáng, nhìn thẳng.
- Bậc 2: mũ nhiều nếp hơn, có gai tinh thể và 1 cụm nấm nhỏ trên mũ, thân có vân băng, mây và bông tuyết quanh người.
- Bậc 3: to nhất, mũ nhiều tầng như sóng, sừng pha lê lớn ở giữa, trụ băng nhỏ quanh mũ, nhiều cột băng rủ xuống mép mũ, tinh thể ở ngực, mây và tinh thể dưới chân.

## Điểm chưa ổn
- Bông tuyết / sao lấp lánh màu **tím-hồng** (~3k pixel hồng-tím), trái bảng màu "không tím, không hồng". Nằm rời nên có thể xoá khi cắt sprite.
- Bậc 3: chớp sáng trắng đè lên mắt phải, mặt nhỏ và bị mũ che gần hết, thân tối.
- Bậc 1-2 nhìn thẳng chứ không quay trái như prompt; vạch bóng đổ dạng chấm.
- Bậc 1 thân navy tối hơn yêu cầu "thân sáng".
- Ảnh không phải lưới pixel đều (~55k màu), giống các con trước.

## Lưu ý khi cắt
- Bậc 3 có nhiều hiệu ứng tràn ngoài thân (mây, bông tuyết, tinh thể): chừa lề rộng cả bốn phía; cân nhắc xoá hiệu ứng khi ra sprite 128×128.
- Mắt đọc được rõ ở Bậc 1-2; Bậc 3 cần xoá hoặc dịch chớp sáng khỏi mắt phải.
