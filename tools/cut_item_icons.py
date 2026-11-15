"""Tách icon vật phẩm lẻ (sheet nền phẳng, vài icon nằm ngang) bằng MẶT NẠ CỨNG: alpha chỉ 0/255, giữ nguyên màu điểm ảnh gốc.
Dùng: python3 tools/cut_item_icons.py <bộ> <ảnh> [thư-mục-ra] [thr]      bộ: thuoc-x2 (thêm ở PRESETS)
Ra: img-item-<tên>.webp 256x256. Đăng ký ảnh trong 10-drops-shop.js."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

PRESETS = {
    'thuoc-x2': dict(bg=(48, 57, 66), thr=60, min_area=10, close_r=3, blank=[(900, 930, 1024, 1024)],
                     regions=[('bt-exp', 50, 340, 330, 690), ('bt-xu', 350, 360, 690, 690), ('bt-drop', 690, 340, 1000, 690)]),
}
SET, SRC = sys.argv[1], sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else '.'
P = PRESETS[SET]
if len(sys.argv) > 4:
    P['thr'] = int(sys.argv[4])
SIZE, MARGIN, R = 256, 8, P['close_r']
se = np.hypot(*np.mgrid[-R:R + 1, -R:R + 1]) <= R
img = np.array(Image.open(SRC).convert('RGB'))
H, W, _ = img.shape
fg = np.abs(img.astype(int) - np.array(P['bg'])).sum(2) > P['thr']
for x0, y0, x1, y1 in P.get('blank', []):
    fg[y0:y1, x0:x1] = False
for name, x0, y0, x1, y1 in P['regions']:
    reg = np.zeros_like(fg); reg[y0:y1, x0:x1] = fg[y0:y1, x0:x1]
    lab, n = ndi.label(reg)
    sz = ndi.sum(reg, lab, range(1, n + 1))
    main = 1 + int(np.argmax(sz)); keep = [main]
    for i, s in enumerate(sz, 1):                    # giữ mảnh rời thuộc thiết kế (tia sáng, bọt), bỏ mảnh chạm mép khung
        if i == main or s < P['min_area']:
            continue
        ys_, xs_ = np.where(lab == i)
        if xs_.min() <= x0 or xs_.max() >= x1 - 1 or ys_.min() <= y0 or ys_.max() >= y1 - 1:
            continue
        keep.append(i)
    m = np.isin(lab, keep)
    pad = R + 2
    m = ndi.binary_closing(np.pad(m, pad), structure=se)[pad:-pad, pad:-pad]
    m = ndi.binary_fill_holes(m)
    ys, xs = np.where(m)
    ty0, ty1, tx0, tx1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    c, a = img[ty0:ty1, tx0:tx1].astype(float), m[ty0:ty1, tx0:tx1].astype(float)
    h, w = a.shape
    k = (SIZE - 2 * MARGIN) / max(h, w)
    nw, nh = max(1, round(w * k)), max(1, round(h * k))
    pa = np.array(Image.fromarray((a * 255).astype(np.uint8)).resize((nw, nh), Image.BOX)).astype(float) / 255
    chs = []
    for ch in range(3):                              # màu chỉ lấy trung bình giữa các điểm ảnh thuộc icon (không pha nền)
        pc = np.array(Image.fromarray((c[..., ch] * a).clip(0, 255).astype(np.uint8)).resize((nw, nh), Image.BOX)).astype(float) / 255
        chs.append(np.where(pa > 0, pc / np.maximum(pa, 1e-6), 0))
    rgb = np.clip(np.stack(chs, 2) * 255, 0, 255).round().astype(np.uint8)
    alpha = np.where(pa >= 0.5, 255, 0).astype(np.uint8)
    rgba = np.dstack([rgb, alpha]); rgba[alpha == 0, :3] = 0
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(Image.fromarray(rgba), ((SIZE - nw) // 2, (SIZE - nh) // 2))
    canvas.save(f'{OUT}/img-item-{name}.webp', lossless=True, method=6, exact=True)
    print(name, (w, h), '->', (nw, nh), np.unique(np.array(canvas)[..., 3]))
