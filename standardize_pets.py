#!/usr/bin/env python3
"""Đưa 102 ảnh thú về CHUẨN MẪU (phượng Tử Tinh Hải): thân đậm bão hòa + điểm nhấn sáng rực
+ vài điểm sáng dấu cộng + viền mỏng 1px + pixel-art nét (không mờ).

Chạy:  python3 standardize_pets.py <thư_mục_gốc_thú(B)> <thư_mục_ảnh_hiện_tại(G)> <thư_mục_ra>
 - B: ảnh thú gốc trong game (cấu trúc sáng-tối đầy đủ, viền dày)
 - G: ảnh bước 1 (cùng hình dạng nhưng viền đã mỏng) -> lấy làm hình dạng/alpha
Ghi lại đúng tên file img-sprites-*.png (128x128, alpha 0/255) để chép đè vào game."""
import sys, os, numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage.color import rgb2hsv, hsv2rgb

BL = ['ho', 'hu', 'lan', 'long', 'tuoc', 'vu']
NAMES = ['Tuyết','Sương','Vân','Phong','Lôi','Nguyệt','Dương','Huyền','Kim','Ngọc','Thanh','Xích','Hắc','Tử','Thiên','Linh','Thần']
# (hue thân, sat thân, V tối, V sáng) , (hue nhấn, sat nhấn) , màu sparkle (hue, sat)
PAL = {
 0: ((0.575, 0.62, 0.30, 0.80), (0.50, 0.28), (0.52, 0.10)),   # Tuyết: xanh băng, nhấn trắng-xanh
 1: ((0.470, 0.58, 0.28, 0.70), (0.37, 0.55), (0.40, 0.15)),   # Sương: lam-xám lục, nhấn bạc hà
 2: ((0.745, 0.68, 0.30, 0.74), (0.88, 0.42), (0.80, 0.18)),   # Vân: tím, nhấn hồng nhạt
 3: ((0.385, 0.78, 0.28, 0.70), (0.20, 0.85), (0.25, 0.20)),   # Phong: lục bảo, nhấn chanh
 4: ((0.675, 0.80, 0.26, 0.64), (0.145, 0.92), (0.14, 0.25)),  # Lôi: chàm, nhấn vàng sét
 5: ((0.625, 0.78, 0.30, 0.70), (0.52, 0.38), (0.56, 0.15)),   # Nguyệt: xanh đêm, nhấn bạc-lam
 6: ((0.050, 0.88, 0.40, 0.90), (0.125, 0.85), (0.12, 0.25)),  # Dương: cam lửa, nhấn vàng
 7: ((0.705, 0.72, 0.24, 0.58), (0.55, 0.75), (0.55, 0.30)),   # Huyền: tím-đen, nhấn lam điện
 8: ((0.105, 0.88, 0.26, 0.66), (0.14, 0.45), (0.14, 0.20)),   # Kim: đồng, nhấn vàng trắng
 9: ((0.495, 0.82, 0.24, 0.62), (0.345, 0.55), (0.40, 0.20)),  # Ngọc: lục lam, nhấn ngọc
 10: ((0.330, 0.85, 0.24, 0.62), (0.185, 0.88), (0.20, 0.25)), # Thanh: lục rừng, nhấn vàng chanh
 11: ((0.985, 0.90, 0.30, 0.72), (0.075, 0.92), (0.07, 0.25)), # Xích: đỏ thẫm, nhấn cam vàng
 12: ((0.775, 0.78, 0.24, 0.58), (0.88, 0.85), (0.85, 0.25)),  # Hắc: tím đen, nhấn hồng đậm
 13: ((0.700, 0.82, 0.30, 0.72), (0.935, 0.85), (0.80, 0.20)), # Tử: chàm, nhấn hồng (mẫu)
 14: ((0.565, 0.80, 0.34, 0.82), (0.47, 0.50), (0.50, 0.20)),  # Thiên: xanh trời, nhấn lam ngọc
 15: ((0.900, 0.62, 0.40, 0.84), (0.965, 0.28), (0.95, 0.12)), # Linh: hồng sen, nhấn hồng trắng
 16: ((0.100, 0.85, 0.24, 0.62), (0.135, 0.48), (0.13, 0.25)), # Thần: vàng đồng, nhấn vàng sáng
}

def path(d, s, i):
    for p in (f'{d}/img-sprites-{s}-{i}.png', f'{d}/img-sprites-2-{s}-{i}.png'):
        if os.path.exists(p): return p

def hsv(h, s, v): return hsv2rgb(np.array([[[h % 1.0, np.clip(s, 0, 1), np.clip(v, 0, 1)]]]))[0, 0]

def accent_mask(rgb, mask):
    """Điểm nhấn = chi tiết sáng nhất / lệch màu so với thân (vây, sọc, vảy, lông cánh, đuôi)."""
    h = rgb2hsv(rgb); H, S, V = h[..., 0], h[..., 1], h[..., 2]
    m = mask.astype(np.float32)
    lum = rgb @ np.array([0.30, 0.59, 0.11])
    lo, hi = np.percentile(lum[mask], [4, 97])
    n = np.clip((lum - lo) / max(hi - lo, 1e-3), 0, 1)
    blur = lambda a, s: ndi.gaussian_filter(a * m, s) / np.maximum(ndi.gaussian_filter(m, s), 1e-3)
    detail = n - blur(n, 2.4)                                  # sáng hơn vùng xung quanh
    w = S * V * mask
    ang = H * 2 * np.pi
    dom = (np.arctan2((np.sin(ang) * w).sum(), (np.cos(ang) * w).sum()) / (2 * np.pi)) % 1.0
    off = np.abs(((H - dom + 0.5) % 1.0) - 0.5)               # lệch hue so với thân
    score = 0.9 * np.clip(detail / 0.22, 0, 1) + 0.55 * np.clip((n - 0.78) / 0.2, 0, 1) \
          + 0.8 * np.clip((off - 0.05) / 0.10, 0, 1) * np.clip((S - 0.2) / 0.3, 0, 1)
    thr = np.percentile(score[mask], 85)                       # ~15% diện tích, nét mảnh theo đường lông/vảy/sọc
    acc = (score >= max(thr, 0.50)) & mask
    acc = ndi.binary_closing(acc, iterations=1) & mask
    lab, k = ndi.label(acc, structure=np.ones((3, 3)))        # bỏ đốm lẻ
    if k:
        sizes = ndi.sum(acc, lab, range(1, k + 1))
        keep = np.isin(lab, 1 + np.nonzero(sizes >= 6)[0])
        acc = keep
    return acc, n

def sparkles(canvas, mask, acc, rng, color, count=6):
    H, W = mask.shape
    safe = ndi.binary_erosion(mask, iterations=5) & ~ndi.binary_dilation(acc, iterations=1)
    ys, xs = np.nonzero(safe)
    if len(ys) == 0: return
    placed = []
    for _ in range(400):
        if len(placed) >= count: break
        i = rng.randint(len(ys)); y, x = ys[i], xs[i]
        if any((y - py) ** 2 + (x - px) ** 2 < 15 ** 2 for py, px in placed): continue
        placed.append((y, x))
        for dy, dx in [(0, 0), (1, 0), (-1, 0), (0, 1), (0, -1), (2, 0), (-2, 0), (0, 2), (0, -2)]:
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W and mask[yy, xx]:
                a = 0.95 if dy == 0 and dx == 0 else 0.8 if abs(dy) + abs(dx) == 1 else 0.6
                canvas[yy, xx] = canvas[yy, xx] * (1 - a) + color * a

def process(src_rgb, alpha, e, seed):
    (bh, bs, vlo, vhi), (ah, as_), (sh, ss) = PAL[e]
    mask = alpha >= 128
    acc, n = accent_mask(src_rgb, mask)
    er1 = ndi.binary_erosion(mask, iterations=1)
    inner = er1
    # --- thân: gradient mượt, bão hòa cao, đủ sáng để nổi (mẫu: S~1.0, V 0.47-1.0)
    mf = mask.astype(np.float32)
    ns = ndi.gaussian_filter(n * mask, 0.6) / np.maximum(ndi.gaussian_filter(mf, 0.6), 1e-3)
    soft = ndi.gaussian_filter(n * mask, 1.6) / np.maximum(ndi.gaussian_filter(mf, 1.6), 1e-3)
    line = np.clip((soft - n - 0.03) / 0.14, 0, 1) * er1        # đường tối nội bộ (khe lông, vảy, sọc)
    Vb = (vlo + 0.12) + (vhi + 0.10 - vlo - 0.12) * ns ** 1.05
    Sb = np.clip(bs + 0.22 - ns * 0.10, 0, 1)
    Hb = bh + (ns - 0.5) * 0.03
    body = hsv2rgb(np.dstack([Hb % 1.0, Sb, np.clip(Vb, 0, 1)]))
    # --- điểm nhấn: sáng rực, 3 bậc để có khối
    qa = np.round(ns * 2) / 2
    Va = 0.86 + 0.14 * qa
    Sa = np.clip(as_ * (1.0 - 0.15 * qa), 0, 1)
    accimg = hsv2rgb(np.dstack([np.full_like(n, ah), Sa, Va]))
    body = body * (1 - 0.55 * line[..., None])
    out = np.where(acc[..., None], accimg * (1 - 0.30 * line[..., None]), body)
    # --- viền 1px rất đậm cùng tông thân; lớp sát viền sáng nhẹ (rim light) => nổi khối như mẫu
    edge = mask & ~er1
    ring2 = er1 & ~ndi.binary_erosion(mask, iterations=2)
    out[edge] = hsv(bh, 1.0, 0.09)
    rim = hsv(ah, min(1, as_ * 0.8), 0.95)
    out[ring2 & ~acc] = out[ring2 & ~acc] * 0.55 + rim * 0.45
    # --- điểm sáng dấu cộng
    sc = np.clip(hsv(sh, ss, 1.0) * 0.55 + 0.45, 0, 1)
    sparkles(out, mask, acc, np.random.RandomState(seed), sc)
    res = np.zeros(mask.shape + (4,), np.float32)
    res[..., :3] = out; res[..., 3] = mask
    res[~mask, :3] = 0
    return Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8), 'RGBA')

def run(B, G, out, only=None, skip=()):
    os.makedirs(out, exist_ok=True)
    for bi, s in enumerate(BL):
        for e in range(17):
            if only and (s, e) not in only: continue
            pg, pb = path(G, s, e), path(B, s, e)
            if (s, e) in skip:
                Image.open(pg).save(os.path.join(out, os.path.basename(pg))); continue
            alpha = np.array(Image.open(pg).convert('RGBA'))[..., 3]
            rgb = np.array(Image.open(pb).convert('RGBA'))[..., :3].astype(np.float32) / 255
            process(rgb, alpha, e, 1000 + bi * 97 + e * 13).save(os.path.join(out, os.path.basename(pg)))

if __name__ == '__main__':
    run(sys.argv[1], sys.argv[2], sys.argv[3], skip=[('tuoc', 13)])
