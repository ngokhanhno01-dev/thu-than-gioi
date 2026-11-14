"""Tách 4 icon bộ Hắc Ám Lâm từ ảnh sheet bằng MẶT NẠ CỨNG.
- alpha chỉ 0 hoặc 255 (viền sắc), không làm mờ/feather.
- màu điểm ảnh lấy nguyên từ ảnh gốc (không pha với nền khi thu nhỏ).
Dùng: python3 tools/cut_hac_am_lam.py <ảnh-sheet.jpg> [thư-mục-ra]
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else '.'
SIZE, MARGIN = 256, 6
BG = np.array([21, 26, 30])
THR = 40            # khoảng cách màu so với nền; > THR là điểm ảnh của icon (gồm cả quầng sáng)
HOLE_MAX = 10**9    # lấp MỌI lỗ kín bên trong (khe nứt/lem trắng giữa các vệt quầng sáng); riêng lòng nhẫn khoét lại sau
CLOSE_R = 7         # đóng các khe nứt hẹp ăn vào từ mép
RING_HOLE_THR = 125 # lòng chiếc vòng có quầng tím mờ (d≈10-50) bị vỡ vụn ở THR=40 -> cắt riêng bằng ngưỡng cao hơn

# (tên, x0, y0, x1, y1) vùng chứa từng món trong ảnh sheet
REGIONS = [('vukhi', 0, 0, 456, 600), ('giap', 456, 0, 896, 600),
           ('vong', 0, 600, 440, 1200), ('ngoc', 440, 600, 896, 1100)]

img = np.array(Image.open(SRC).convert('RGB'))
H, W, _ = img.shape
fg = np.abs(img.astype(int) - BG).sum(2) > THR

for name, x0, y0, x1, y1 in REGIONS:
    reg = np.zeros_like(fg)
    reg[y0:y1, x0:x1] = fg[y0:y1, x0:x1]
    lab, n = ndi.label(reg)
    sizes = ndi.sum(reg, lab, range(1, n + 1))
    m = lab == (1 + int(np.argmax(sizes)))          # chỉ giữ khối lớn nhất (bỏ nhiễu / dấu sao)
    pad = CLOSE_R + 2                               # đóng khe nứt (có đệm để không dính mép ảnh)
    mp = np.pad(m, pad)
    mp = ndi.binary_closing(mp, structure=np.hypot(*np.mgrid[-CLOSE_R:CLOSE_R+1, -CLOSE_R:CLOSE_R+1]) <= CLOSE_R)
    m = mp[pad:-pad, pad:-pad]
    holes, hn = ndi.label(~m)                       # lấp lỗ nhỏ
    hs = ndi.sum(~m, holes, range(1, hn + 1))
    for i, s in enumerate(hs, 1):
        if s <= HOLE_MAX and not (holes[0, 0] == i):
            m |= holes == i
    if name == 'vong':                              # khoét lòng vòng: vùng tối-mờ nối với ngoài qua vài điểm viền mỏng
        dd = np.abs(img.astype(int) - BG).sum(2)    # -> mở (opening) để cắt cầu nối, lấy khối chứa tâm lòng, nở lại
        low = np.zeros_like(fg); low[y0:y1, x0:x1] = (dd <= RING_HOLE_THR)[y0:y1, x0:x1]
        disk = np.hypot(*np.mgrid[-9:10, -9:10]) <= 9
        core = ndi.binary_opening(low, structure=disk)
        cl, _ = ndi.label(core)
        hole = ndi.binary_dilation(cl == cl[900, 215], structure=disk) & low
        hole = ndi.binary_fill_holes(ndi.binary_opening(hole, structure=disk))   # làm mượt mép lòng nhẫn
        m &= ~hole
    ys, xs = np.where(m)
    ty0, ty1, tx0, tx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    c, a = img[ty0:ty1, tx0:tx1].astype(float), m[ty0:ty1, tx0:tx1].astype(float)
    h, w = a.shape
    k = (SIZE - 2 * MARGIN) / max(h, w)
    nw, nh = max(1, round(w * k)), max(1, round(h * k))
    # thu nhỏ: màu chỉ lấy trung bình giữa các điểm ảnh thuộc icon, mặt nạ ngưỡng 0.5 -> cứng
    pa = np.array(Image.fromarray((a * 255).astype(np.uint8)).resize((nw, nh), Image.BOX)).astype(float) / 255
    chs = []
    for ch in range(3):
        pc = np.array(Image.fromarray((c[..., ch] * a).clip(0, 255).astype(np.uint8)).resize((nw, nh), Image.BOX)).astype(float) / 255
        chs.append(np.where(pa > 0, pc / np.maximum(pa, 1e-6), 0))
    rgb = np.clip(np.stack(chs, 2) * 255, 0, 255).round().astype(np.uint8)
    alpha = np.where(pa >= 0.5, 255, 0).astype(np.uint8)
    rgba = np.dstack([rgb, alpha])
    rgba[alpha == 0, :3] = 0
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(Image.fromarray(rgba), ((SIZE - nw) // 2, (SIZE - nh) // 2))
    canvas.save(f'{OUT}/img-eq-hac-am-lam-{name}.webp', lossless=True, method=6, exact=True)
    print(name, (w, h), '->', (nw, nh), 'alpha values:', np.unique(np.array(canvas)[..., 3]))
