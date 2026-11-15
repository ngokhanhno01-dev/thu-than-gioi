"""Tách 6 icon NGUYÊN LIỆU của một vùng (Tinh Hoa boss, Linh Cốt, Móng Vuốt, Vảy Giáp, Nanh Thú, Nhãn Châu)
từ ảnh sheet có nền sương mù + chữ chú thích. Dùng GrabCut + mặt nạ biên (loại sương), alpha cứng, 256x256 webp.
Dùng:  python3 -I tools/cut_mat_icons.py <ảnh-sheet.jpg> <thư-mục-ra> <tiền-tố>   vd: ... img-mat-tuyet-nguyen
Ra:    <tiền-tố>-{essence,bone,claw,scale,fang,eye}.webp (+ prev-*.png xem thử trên nền tối/sáng)
Lưu ý: REG (khung từng icon, tránh chữ chú thích + điểm seed) và EXCL (vùng xoá vệt khói sót, toạ độ canvas 256)
đang chỉnh theo sheet Tuyết Nguyên 896x1200; sheet vùng khác bố cục khác thì sửa REG/EXCL cho khớp.
Sau đó khai báo ảnh trong MAT_IMG (12-equip.js)."""
import sys
import numpy as np, cv2
from scipy import ndimage as ndi
from PIL import Image

SRC, OUT, PFX = sys.argv[1], sys.argv[2], sys.argv[3]
SIZE, PAD = 256, 8

# (tên, x0, y0, x1, y1)  — tránh chữ chú thích; seed = điểm chắc chắn thuộc icon
REG = [
    ('essence', 80, 75, 410, 372, (245, 225)),
    ('bone',    500, 75, 820, 372, (660, 235)),
    ('claw',     90, 440, 395, 735, (250, 570)),
    ('scale',   520, 445, 800, 735, (660, 600)),
    ('fang',    100, 812, 385, 1048, (260, 930)),
    ('eye',     530, 815, 800, 1050, (665, 930)),
]

img = cv2.imread(SRC)
H, W = img.shape[:2]
bgc = np.array([30, 45, 60], np.float32)[::-1]  # BGR xấp xỉ màu nền


def grab(sub, seed):
    h, w = sub.shape[:2]
    gm = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    b = 5
    gm[:b] = gm[-b:] = cv2.GC_BGD
    gm[:, :b] = gm[:, -b:] = cv2.GC_BGD
    # xác suất nền/icon theo độ khác nền + độ sáng
    d = np.abs(sub.astype(np.float32) - bgc).max(axis=2)
    lum = sub.astype(np.float32).mean(axis=2)
    gm[(d > 70) | (lum > 110)] = cv2.GC_PR_FGD
    gm[(d > 130) & (lum > 140)] = cv2.GC_FGD
    sx, sy = seed
    cv2.circle(gm, (sx, sy), 6, cv2.GC_FGD, -1)
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(sub, gm, None, bgd, fgd, 6, cv2.GC_INIT_WITH_MASK)
    return (gm == cv2.GC_FGD) | (gm == cv2.GC_PR_FGD)


def edge_mask(sub, thr=24, dil=2):
    f = cv2.GaussianBlur(sub.astype(np.float32), (0, 0), 0.8)
    gx = cv2.Sobel(f, cv2.CV_32F, 1, 0, ksize=3); gy = cv2.Sobel(f, cv2.CV_32F, 0, 1, ksize=3)
    g = np.sqrt(gx ** 2 + gy ** 2).max(axis=2) / 4.0
    Ed = ndi.binary_dilation(g > thr, iterations=dil)
    lab, n = ndi.label(~Ed)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    m = ~np.isin(lab, list(border))
    return ndi.binary_erosion(m, iterations=dil)


# vùng xoá thêm (toạ độ trên canvas 256×256): vệt khói còn sót cạnh icon
EXCL = {'claw': [(72, 174, 112, 206), (58, 188, 112, 214), (10, 160, 30, 200)]}

prev = []
for nm, x0, y0, x1, y1, (sx, sy) in REG:
    sub = np.ascontiguousarray(img[y0:y1, x0:x1])
    m = grab(sub, (sx - x0, sy - y0))
    m &= ndi.binary_dilation(edge_mask(sub), iterations=1)
    m = ndi.binary_opening(m, iterations=1)
    m = ndi.binary_closing(m, iterations=2)
    m = ndi.binary_fill_holes(m)
    lab, n = ndi.label(m)
    if n:
        sz = ndi.sum(m, lab, range(1, n + 1))
        keep = np.zeros_like(m)
        big = sz.max()
        lum = sub.astype(np.float32).mean(axis=2)
        for i, s in enumerate(sz, 1):
            comp = lab == i
            if s == big or (s >= 25 and lum[comp].mean() > 135):  # mảnh rời phải đủ sáng (tinh thể/đốm), bỏ mảnh sương
                keep |= comp
        m = keep
    ys, xs = np.where(m)
    bx0, bx1, by0, by1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    print(nm, 'bbox', bx0, bx1, by0, by1, 'area', int(m.sum()))
    rgba = np.dstack([cv2.cvtColor(sub, cv2.COLOR_BGR2RGB), (m * 255).astype(np.uint8)])
    crop = Image.fromarray(rgba[by0:by1, bx0:bx1], 'RGBA')
    w, h = crop.size
    sc = (SIZE - 2 * PAD) / max(w, h)
    nw, nh = max(1, round(w * sc)), max(1, round(h * sc))
    # thu nhỏ trên màu đã nhân alpha để không viền lem nền
    a = np.asarray(crop).astype(np.float32)
    al = a[..., 3:4] / 255.0
    pm = Image.fromarray(np.dstack([a[..., :3] * al, a[..., 3:4]]).astype(np.uint8), 'RGBA')
    pm = pm.resize((nw, nh), Image.LANCZOS)
    p = np.asarray(pm).astype(np.float32)
    A = p[..., 3:4] / 255.0
    rgb = np.where(A > 0.02, p[..., :3] / np.maximum(A, 1e-3), 0)
    A = (A > 0.5).astype(np.float32)  # alpha cứng, viền sắc
    out = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), A * 255]).astype(np.uint8), 'RGBA')
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(out, ((SIZE - nw) // 2, (SIZE - nh) // 2), out)
    for (ex0, ey0, ex1, ey1) in EXCL.get(nm, []):
        canvas.paste((0, 0, 0, 0), (ex0, ey0, ex1, ey1))
    canvas.save(f'{OUT}/{PFX}-{nm}.webp', 'WEBP', quality=92, method=6)
    for tag, col in (('dark', (24, 30, 40)), ('light', (200, 205, 215))):
        bgim = Image.new('RGBA', (SIZE, SIZE), col + (255,))
        bgim.alpha_composite(canvas)
        bgim.convert('RGB').save(f'{OUT}/prev-{nm}-{tag}.png')
