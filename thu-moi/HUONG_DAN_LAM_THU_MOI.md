# Làm thú mới cho game "thu-than-gioi" (ĐỌC FILE NÀY TRƯỚC, CHỈ CẦN FILE NÀY ĐỂ BẮT ĐẦU)

Trả lời người dùng ngắn gọn bằng tiếng Việt, nói thẳng điểm chưa ổn, không hỏi lại nhiều. Làm trên nhánh `ghi-chu-co-che-bat-thu-evo`, KHÔNG push `main`.

## 0. TIẾT KIỆM QUOTA (bắt buộc, đã có phiên hết quota chỉ vì đọc)
- **KHÔNG liệt kê thư mục gốc của nhánh** (hàng trăm ảnh, ~200 KB kết quả). Luôn gọi `get_file_contents` bằng đường dẫn trực tiếp. Chỉ được liệt kê thư mục con nhỏ như `thu-moi/<vùng>`.
- **KHÔNG đọc**: `CLAUDE.md` (của việc icon trang bị, bảo push main, sai việc này), `THIET_KE_BAT_THU_EVO.md` (chỉ khi người dùng hỏi về cơ chế), `GHI_CHU_*.md`, mọi file `.js`, đặc biệt `06-mobs.js` (144 KB). Kiểm tên trùng bằng danh sách quái cũ trong `TIEN_DO.md`, không mở `06-mobs.js`.
- Chỉ đọc đúng file cần cho bước đang làm (mục 4). Ghi chú mẫu: đọc **1 file mới nhất**, không đọc hết.
- `thu-moi/HUONG_DAN_LAM_THU_MOI.md` này là bản duy nhất; file cùng tên ở thư mục gốc chỉ là con trỏ.
- Không đọc lại file vừa tự ghi; không in lại nội dung dài vào hội thoại.

## 1. Bối cảnh
Game đang thiết kế **Bắt thú theo vùng + Tiến hóa 3 bậc + Evo**. 17 vùng × 10 thú, làm lần lượt từng vùng, từng con, đủ 10 con mới sang vùng kế. Mỗi con = **1 ảnh xếp ngang 3 bậc** (trái → phải = Bậc 1 → 2 → 3). Người dùng làm ảnh bằng **Canva Pro (AI)** theo prompt Claude soạn, gửi ảnh lại; Claude kiểm ảnh, tách nền, thêm vào nhánh. Claude KHÔNG tự tạo được ảnh.

## 2. Quy tắc người dùng đã chốt
1. **Mỗi con 1 tên duy nhất cho cả 3 bậc.** Tên Hán-Việt hai từ, bắt đầu bằng từ chủ đề vùng (Tuyết / Băng; Sương / Vụ...). Boss được giữ tên boss cũ của vùng. Không trùng quái / thú cũ.
2. **Được lấy khuôn động vật** (thật hoặc thần thoại) làm khung, nhưng phải có nét riêng theo chủ đề vùng (vảy, cánh, sừng, họa tiết), không vẽ y nguyên con vật. Người dùng từng bỏ con nai vì quá giống thật.
3. **Đa dạng như Pokémon**: trong 10 con phủ đủ môi trường (trời, nước, mặt đất, lòng đất, thực vật, khe đá / giáp, thần thoại, linh khí, người nhỏ, boss). **Mỗi con một dáng cơ thể khác nhau**, không trùng dáng con trước. **Vật thể sống (chuông, đèn, gương...) tối đa 1-2 con / vùng**, nên có tay chân / mặt rõ. Người dùng đã chê bộ "toàn đồ vật".
4. Phong cách: **pixel art Gen 5 Pokémon**, sắc cạnh, viền navy dày, đổ bóng theo mảng, thân sáng. Từng bị chê: quá mịn, quá nhợt trắng, "các khối rời nhau". Thích: Tuyết Cầu, Băng Đăng, Băng Kỳ Lân (liền khối, dễ nhìn).
5. Chủ đề vùng quyết định chất liệu + bảng màu, không quyết định dáng. Cấm tím / hồng, chớp sáng đè mắt.
6. Khi người dùng nói "xấu": đừng cãi, đưa 2-3 hướng khác, chọn 1 hướng mạnh nhất và nói vì sao.
7. Trước khi đề xuất bảng 10 con cho vùng mới: tự kiểm đủ môi trường, không trùng dáng, ít vật thể, tên không trùng quái cũ. Bảng có cột Con vật khung / Môi trường / Dáng.

## 3. Nhịp làm việc mỗi con
Đề xuất ý tưởng + dáng (khác con trước) → soạn prompt → người dùng làm ảnh Canva, gửi lại → kiểm + tách nền + xoá dấu sao → thêm ảnh + ghi chú vào nhánh → báo ngắn (file, nhận xét thật) → đề xuất con kế.
**Sau MỖI bước, tự cập nhật `thu-moi/TIEN_DO.md`** (dòng Trạng thái + dòng con đang làm), không đợi người dùng nhắc. Mốc: chọn hướng, đã soạn prompt, nhận ảnh, đã thêm vào nhánh, sang con kế.

## 4. Đọc file nào, khi nào
| Bước | File cần đọc |
|---|---|
| Bắt đầu phiên | `thu-moi/TIEN_DO.md` (nhỏ, luôn đọc) |
| Soạn prompt | `thu-moi/PROMPT_MAU.md` |
| Nhận ảnh / thêm vào nhánh | `thu-moi/XU_LY_ANH_VA_GIT.md` + 1 ghi chú mẫu mới nhất ở `thu-moi/<vùng>/` |
| Chỉnh prompt 1 con đã soạn | `thu-moi/<vùng>/NN-slug-prompt.md` nếu có |
