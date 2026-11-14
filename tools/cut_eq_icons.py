"""Tách 4 icon trang bị (vukhi, giap, vong, ngoc) từ ảnh sheet bằng MẶT NẠ CỨNG.
- alpha chỉ 0 hoặc 255 (viền sắc), không làm mờ/feather.
- màu điểm ảnh lấy nguyên từ ảnh gốc (không pha với nền khi thu nhỏ).
Dùng: python3 tools/cut_eq_icons.py <bộ> <ảnh-sheet.jpg> [thư-mục-ra] [thr]
  bộ: hac-am-lam | thien-khong | linh-hoa-vien | than-dien (thêm bộ mới ở PRESETS)
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

# bg: màu nền; thr: ngưỡng cách nền (> thr là điểm ảnh icon); regions: (tên,x0,y0,x1,y1);
# min_area: giữ mảnh rời >= ngần này điểm ảnh (10**9 = chỉ giữ khối lớn nhất); ring_seed: (x,y) một điểm trong lòng nhẫn; ring_hole_thr: ngưỡng riêng khoét lòng nhẫn
PRESETS = {
    'hac-am-lam': dict(bg=(21, 26, 30), thr=40, min_area=10**9, ring_seed=(215, 900), ring_hole_thr=125,
                       regions=[('vukhi', 0, 0, 456, 600), ('giap', 456, 0, 896, 600),
                                ('vong', 0, 600, 440, 1200), ('ngoc', 440, 600, 896, 1100)]),
    'thien-khong': dict(bg=(25, 28, 35), thr=100, min_area=12, ring_seed=(224, 980), ring_hole_thr=125,
                        regions=[('vukhi', 0, 0, 456, 600), ('giap', 456, 0, 896, 600),
                                 ('vong', 0, 600, 405, 1200), ('ngoc', 405, 600, 896, 1100)]),
    'linh-hoa-vien': dict(bg=(26, 29, 36), thr=100, min_area=12, ring_seed=(210, 990), ring_hole_thr=125,
                          regions=[('vukhi', 0, 0, 456, 600), ('giap', 456, 0, 896, 600),
                                   ('vong', 0, 600, 420, 1200), ('ngoc', 420, 600, 896, 1100)]),
    'than-dien': dict(bg=(25, 28, 35), thr=40, min_area=6, close_r=3, hole_max=400, ring_seed=(215, 1010), ring_hole_thr=125,
                      regions=[('vukhi', 0, 0, 462, 600), ('giap', 462, 0, 896, 600),
                               ('vong', 0, 600, 422, 1200), ('ngoc', 422, 600, 896, 1100)]),
}
SET, SRC = sys.argv[1], sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else '.'
P = PRESETS[SET]
if len(sys.argv) > 4:
    P['thr'] = int(sys.argv[4])
SIZE, MARGIN = 256, 6
BG, THR = np.array(P['bg']), P['thr']
CLOSE_R = P.get('close_r', 7)       # đóng các khe nứt hẹp ăn vào từ mép (nhỏ hơn = giữ chi tiết rời như chấm, vòng đứt)
HOLE_MAX = P.get('hole_max', 10**9)  # chỉ lấp lỗ kín có diện tích <= HOLE_MAX (điểm ảnh gốc)
MIN_AREA = P['min_area']  # giữ cả các mảnh rời (lông vũ bay, đốm sáng) có diện tích >= MIN_AREA điểm ảnh gốc
disk = np.hypot(*np.mgrid[-9:10, -9:10]) <= 9
close_se = np.hypot(*np.mgrid[-CLOSE_R:CLOSE_R + 1, -CLOSE_R:CLOSE_R + 1]) <= CLOSE_R

img = np.array(Image.open(SRC).convert('RGB'))
H, W, _ = img.shape
dd = np.abs(img.astype(int) - BG).sum(2)
fg = dd > THR

for name, x0, y0, x1, y1 in P['regions']:
    reg = np.zeros_like(fg)
    reg[y0:y1, x0:x1] = fg[y0:y1, x0:x1]
    lab, n = ndi.label(reg)
    sizes = ndi.sum(reg, lab, range(1, n + 1))
    main = 1 + int(np.argmax(sizes))
    keep = [main]                                   # khối lớn nhất + các mảnh rời đủ lớn (lông vũ, đốm sáng)
    for i, sz in enumerate(sizes, 1):
        if i == main or sz < MIN_AREA:
            continue
        ys_, xs_ = np.where(lab == i)               # bỏ mảnh chạm đường chia vùng (là rìa quầng của icon bên cạnh)
        if (xs_.min() <= x0 and x0 > 0) or (xs_.max() >= x1 - 1 and x1 < W) or (ys_.min() <= y0 and y0 > 0) or (ys_.max() >= y1 - 1 and y1 < H):
            continue
        keep.append(i)
    m = np.isin(lab, keep)
    pad = CLOSE_R + 2                               # đóng khe nứt (có đệm để không dính mép ảnh)
    m = ndi.binary_closing(np.pad(m, pad), structure=close_se)[pad:-pad, pad:-pad]
    holes_, hn_ = ndi.label(~m)                     # lấp lỗ kín (khe nứt/lem trắng); riêng lòng nhẫn khoét lại sau
    if hn_:
        hs_ = ndi.sum(~m, holes_, range(1, hn_ + 1))
        outside_ = {holes_[0, 0], holes_[0, -1], holes_[-1, 0], holes_[-1, -1]}
        for i_, a_ in enumerate(hs_, 1):
            if a_ <= HOLE_MAX and i_ not in outside_:
                m |= holes_ == i_
    if name == 'vong':                              # lòng nhẫn nối với ngoài qua vài điểm viền mỏng
        low = np.zeros_like(fg); low[y0:y1, x0:x1] = (dd <= P['ring_hole_thr'])[y0:y1, x0:x1]
        core = ndi.binary_opening(low, structure=disk)     # mở để cắt cầu nối, lấy khối chứa tâm lòng, nở lại
        cl, _ = ndi.label(core)
        sx, sy = P['ring_seed']
        hole = ndi.binary_dilation(cl == cl[sy, sx], structure=disk) & low
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
    canvas.save(f'{OUT}/img-eq-{SET}-{name}.webp', lossless=True, method=6, exact=True)
    print(name, (w, h), '->', (nw, nh), 'alpha values:', np.unique(np.array(canvas)[..., 3]))
