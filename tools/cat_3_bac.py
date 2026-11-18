#!/usr/bin/env python3
"""Cắt ảnh 3 bậc -> 3 PNG khung vuông cho game (đưa thú mới vào game).
Dùng: python3 tools/cat_3_bac.py <anh-goc.png> <thu-game/slug-vung> <NN-slug> [khung=128] [b3_comp_x_min:x_max ...]
- Tách theo thành phần liên thông (alpha>0), gán vào bậc theo vị trí x; mảnh rời gán theo tâm gần nhất.
- Cùng 1 tỉ lệ thu cho cả 3 bậc, lề 3px cho bậc lớn nhất, căn giữa ngang, chân chạm đáy.
- LANCZOS rồi alpha cứng 0/255 (ngưỡng 110 như SOLID_ALPHA ở 02-sprites-engine.js).
Cờ --kieu-d (LUÔN DÙNG): kiểu D đã chốt = thu 2 bước + làm sắc nhẹ + làm mịn viền alpha + bỏ pixel lẻ (xem TIEN_DO_DUA_VAO_GAME.md). Không có cờ = LANCZOS cũ (chỉ để so sánh).
Cờ --gan-gan-nhat: mảnh rời (đảo đá, mây, đèn lồng) gán theo thân gần nhất thay vì theo tâm x.
Tham số cuối dạng 'stage:xmin-xmax' (vd 3:880-1010) ép mảnh có tâm x trong khoảng đó vào bậc chỉ định."""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
src, outdir, name = sys.argv[1:4]
F = int(sys.argv[4]) if len(sys.argv) > 4 and sys.argv[4].isdigit() else 128
force = []
for s in sys.argv[4:]:
    if ':' in s:
        st, r = s.split(':'); lo, hi = r.split('-'); force.append((int(st), int(lo), int(hi)))
im = Image.open(src).convert('RGBA'); A = np.array(im); al = A[:, :, 3] > 0
lab, n = ndi.label(al, structure=np.ones((3, 3)))
objs = ndi.find_objects(lab); sizes = ndi.sum(al, lab, range(1, n + 1))
big = sorted([i for i in range(n) if sizes[i] > 3000], key=lambda i: objs[i][1].start)
assert len(big) >= 3, f'chỉ thấy {len(big)} thân lớn'
# 3 thân lớn nhất theo kích thước, xếp trái->phải
big = sorted(sorted(big, key=lambda i: -sizes[i])[:3], key=lambda i: objs[i][1].start)
cen = [(objs[i][1].start + objs[i][1].stop) / 2 for i in big]
stage = {}
KIEU_D = '--kieu-d' in sys.argv
NEAR = '--gan-gan-nhat' in sys.argv  # mảnh rời gán cho thân có pixel GẦN NHẤT (không theo tâm x); dùng khi các bậc chồng nhau về x
if NEAR: dist = [ndi.distance_transform_edt(lab != (i + 1)) for i in big]
for i in range(n):
    o = objs[i]; c = (o[1].start + o[1].stop) / 2
    if i in big: stage[i + 1] = big.index(i) + 1; continue
    s = None
    for st, lo, hi in force:
        if lo <= c <= hi: s = st
    if s is None and NEAR:
        s = 1 + int(np.argmin([dist[k][lab == i + 1].min() for k in range(3)]))
    if s is None: s = 1 + int(np.argmin([abs(c - x) for x in cen]))
    stage[i + 1] = s
masks = {s: np.isin(lab, [k for k, v in stage.items() if v == s]) for s in (1, 2, 3)}
boxes = {}
for s, m in masks.items():
    ys, xs = np.where(m); boxes[s] = (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)
    print('bậc', s, 'bbox', boxes[s], 'px', int(m.sum()))
M = 3
sc = min((F - 2 * M) / max(b[2] - b[0] for b in boxes.values()), (F - 2 * M) / max(b[3] - b[1] for b in boxes.values()))
print('tỉ lệ thu', round(sc, 4))
import os; os.makedirs(outdir, exist_ok=True)
for s in (1, 2, 3):
    x0, y0, x1, y1 = boxes[s]; B = A.copy(); B[~masks[s]] = 0
    crop = Image.fromarray(B[y0:y1, x0:x1], 'RGBA')
    w, h = max(1, round(crop.width * sc)), max(1, round(crop.height * sc))
    if KIEU_D:
        mid = crop.resize((w * 3, h * 3), Image.LANCZOS) if crop.width > w * 3 else crop  # thu 2 bước
        r = np.array(mid.resize((w, h), Image.LANCZOS))
        ia = ndi.distance_transform_edt(r[:, :, 3] == 0, return_distances=False, return_indices=True)
        rgb = Image.fromarray(r[ia[0], ia[1], :3], 'RGB')  # tô màu gần nhất vào vùng trong suốt để làm sắc không ám viền
        r[:, :, :3] = np.array(rgb.filter(ImageFilter.UnsharpMask(radius=0.9, percent=70, threshold=3)))
        m = ndi.gaussian_filter(r[:, :, 3].astype(float), 0.7) >= 110  # làm mịn viền alpha
        m = ndi.binary_opening(m, structure=np.ones((2, 2))) | ndi.binary_erosion(m)  # bỏ nhú 1px
        lb, k = ndi.label(m, structure=np.ones((3, 3)))
        for j, z in enumerate(ndi.sum(m, lb, range(1, k + 1))):
            if z < 4: m[lb == j + 1] = False  # bỏ pixel/mảnh lẻ dưới 4px
        r[:, :, 3] = np.where(m, 255, 0)
    else:
        r = np.array(crop.resize((w, h), Image.LANCZOS))
        r[:, :, 3] = np.where(r[:, :, 3] >= 110, 255, 0)
    r[r[:, :, 3] == 0] = 0
    ys, xs = np.where(r[:, :, 3] > 0); r = r[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = r.shape[:2]; assert w <= F and h <= F
    fr = np.zeros((F, F, 4), np.uint8); ox = (F - w) // 2; oy = F - h
    fr[oy:oy + h, ox:ox + w] = r
    Image.fromarray(fr, 'RGBA').save(f'{outdir}/{name}-b{s}.png')
    mag = ((fr[:, :, 0] > 150) & (fr[:, :, 2] > 150) & (fr[:, :, 1] < 100) & (fr[:, :, 3] > 0)).sum()
    print(f'b{s}: {w}x{h} đặt x={ox}..{ox+w-1} y={oy}..{F-1}; px ám magenta={int(mag)}')
