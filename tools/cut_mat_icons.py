"""Tách 6 icon NGUYÊN LIỆU của một vùng (Tinh Hoa boss, Linh Cốt, Móng Vuốt, Vảy Giáp, Nanh Thú, Nhãn Châu)
từ ảnh sheet "<Vùng> Materials" (nền sương mù + chữ chú thích). GrabCut + mặt nạ biên (loại sương), alpha CỨNG, 256x256 webp.

Dùng:  python3 -I tools/cut_mat_icons.py <vùng> <ảnh-sheet.jpg> [thư-mục-ra]      vd: ... suong-coc sheet.jpg out
Ra:    img-mat-<vùng>-{essence,bone,claw,scale,fang,eye}.webp  (+ prev-*.png xem thử trên nền tối/sáng)
Vùng mới: thêm 1 mục vào PRESETS (đo toạ độ bằng cách vẽ lưới lên ảnh), chạy, xem prev-*.png, chỉnh, rồi khai báo ảnh trong MAT_IMG (12-equip.js).

Khoá PRESETS:
  bg        màu nền (RGB) của sheet
  pfg/fg    ngưỡng "khác nền" (d) để coi là có thể/chắc là icon; lum_pfg/lum_fg: ngưỡng độ sáng tương ứng
            (sheet tối như Sương Cốc cần ngưỡng thấp hơn sheet sáng như Tuyết Nguyên)
  edge      ngưỡng biên cho mặt nạ biên (thấp hơn nếu icon tương phản yếu với nền)
  frag_lum  mảnh rời phải sáng hơn mức này mới giữ (tinh thể, đốm sáng); mảnh sương mờ bị bỏ
  smart_fill  True = lỗ trong thân có màu ≈ nền được để trong suốt (khe hở thật giữa các phần của icon)
  regions   (tên, x0, y0, x1, y1, (seed_x, seed_y)): khung từng icon, TRÁNH chữ chú thích; seed = điểm chắc chắn thuộc icon
  opt       theo icon: {'disc': (cx, cy, r)} khoanh vật thể TRÒN có viền chìm vào nền (Nhãn Cầu, đĩa xoáy Tinh Hoa);
            {'hull': True} lấy bao lồi của khối chính
  excl      theo icon: các khung xoá (toạ độ canvas 256x256) cho vệt khói còn sót; dùng khung NHỎ, xem lại kẻo cắt trúng thân
"""
import sys
import numpy as np
import cv2
from scipy import ndimage as ndi
from PIL import Image

SIZE, PAD = 256, 8

PRESETS = {
    'tuyet-nguyen': dict(
        bg=(30, 45, 60), pfg=70, lum_pfg=110, fg=130, lum_fg=140, edge=24, frag_lum=135, smart_fill=False,
        regions=[('essence', 80, 75, 410, 372, (245, 225)), ('bone', 500, 75, 820, 372, (660, 235)),
                 ('claw', 90, 440, 395, 735, (250, 570)), ('scale', 520, 445, 800, 735, (660, 600)),
                 ('fang', 100, 812, 385, 1048, (260, 930)), ('eye', 530, 815, 800, 1050, (665, 930))],
        opt={},
        excl={'claw': [(72, 174, 112, 206), (58, 188, 112, 214), (10, 160, 30, 200)]}),
    'suong-coc': dict(
        bg=(38, 43, 46), pfg=26, lum_pfg=75, fg=55, lum_fg=85, edge=11, frag_lum=80, smart_fill=True,
        regions=[('essence', 100, 95, 375, 345, (235, 225)), ('bone', 520, 100, 805, 345, (660, 240)),
                 ('claw', 105, 470, 345, 710, (210, 570)), ('scale', 535, 470, 800, 705, (660, 610)),
                 ('fang', 95, 815, 360, 1042, (270, 880)), ('eye', 530, 815, 795, 1042, (665, 925))],
        opt={'essence': {'disc': (235, 226, 104)}, 'eye': {'disc': (665, 930, 87)}},
        excl={'fang': [(196, 152, 240, 182)]}),
}

ZONE, SRC = sys.argv[1], sys.argv[2]
OUT = sys.argv[3] if len(sys.argv) > 3 else '.'
P = PRESETS[ZONE]
PFX = f'img-mat-{ZONE}'

img = cv2.imread(SRC)
bgc = np.array(P['bg'], np.float32)[::-1]  # BGR


def grab(sub, seed):
    h, w = sub.shape[:2]
    gm = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    b = 5
    gm[:b] = gm[-b:] = cv2.GC_BGD
    gm[:, :b] = gm[:, -b:] = cv2.GC_BGD
    d = np.abs(sub.astype(np.float32) - bgc).max(axis=2)
    lum = sub.astype(np.float32).mean(axis=2)
    gm[(d > P['pfg']) | (lum > P['lum_pfg'])] = cv2.GC_PR_FGD
    gm[(d > P['fg']) & (lum > P['lum_fg'])] = cv2.GC_FGD
    cv2.circle(gm, seed, 6, cv2.GC_FGD, -1)
    cv2.grabCut(sub, gm, None, np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64), 6, cv2.GC_INIT_WITH_MASK)
    return (gm == cv2.GC_FGD) | (gm == cv2.GC_PR_FGD)


def edge_mask(sub, thr, dil=2):
    f = cv2.GaussianBlur(sub.astype(np.float32), (0, 0), 0.8)
    gx = cv2.Sobel(f, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(f, cv2.CV_32F, 0, 1, ksize=3)
    g = np.sqrt(gx ** 2 + gy ** 2).max(axis=2) / 4.0
    lab, _ = ndi.label(~ndi.binary_dilation(g > thr, iterations=dil))
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    return ndi.binary_erosion(~np.isin(lab, list(border)), iterations=dil)


def fill_holes(m, sub):
    filled = ndi.binary_fill_holes(m)
    if not P['smart_fill']:
        return filled
    holes = filled & ~m
    hl, hn = ndi.label(holes)
    d = np.abs(sub.astype(np.float32) - bgc).max(axis=2)
    out = m.copy()
    for i in range(1, hn + 1):
        c = hl == i
        if c.sum() < 40 or d[c].mean() > 18:
            out |= c
    return out


for nm, x0, y0, x1, y1, (sx, sy) in P['regions']:
    sub = np.ascontiguousarray(img[y0:y1, x0:x1])
    m = grab(sub, (sx - x0, sy - y0))
    m &= ndi.binary_dilation(edge_mask(sub, P['edge']), iterations=1)
    m = ndi.binary_opening(m, iterations=1)
    m = ndi.binary_closing(m, iterations=2)
    o = P['opt'].get(nm, {})
    if 'disc' in o:
        yy, xx = np.mgrid[0:m.shape[0], 0:m.shape[1]]
        cx_, cy_, r_ = o['disc']
        m |= (xx - (cx_ - x0)) ** 2 + (yy - (cy_ - y0)) ** 2 <= r_ ** 2
    m = fill_holes(m, sub)
    if o.get('hull'):
        lb, nb = ndi.label(m)
        if nb:
            bigc = lb == (1 + int(np.argmax(ndi.sum(m, lb, range(1, nb + 1)))))
            hm = np.zeros(m.shape, np.uint8)
            cv2.fillConvexPoly(hm, cv2.convexHull(np.argwhere(bigc)[:, ::-1].astype(np.int32)), 1)
            m = m | (hm > 0)
    lab, n = ndi.label(m)
    if n:
        sz = ndi.sum(m, lab, range(1, n + 1))
        keep = np.zeros_like(m)
        big = sz.max()
        lum = sub.astype(np.float32).mean(axis=2)
        for i, s in enumerate(sz, 1):
            comp = lab == i
            if s == big or (s >= 25 and lum[comp].mean() > P['frag_lum']):  # mảnh rời phải đủ sáng, bỏ mảnh sương
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
    # thu nhỏ trên màu đã nhân alpha để viền không lem màu nền
    a = np.asarray(crop).astype(np.float32)
    al = a[..., 3:4] / 255.0
    pm = Image.fromarray(np.dstack([a[..., :3] * al, a[..., 3:4]]).astype(np.uint8), 'RGBA').resize((nw, nh), Image.LANCZOS)
    p = np.asarray(pm).astype(np.float32)
    A = p[..., 3:4] / 255.0
    rgb = np.where(A > 0.02, p[..., :3] / np.maximum(A, 1e-3), 0)
    A = (A > 0.5).astype(np.float32)  # alpha cứng, viền sắc
    out = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), A * 255]).astype(np.uint8), 'RGBA')
    canvas = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    canvas.paste(out, ((SIZE - nw) // 2, (SIZE - nh) // 2), out)
    for (ex0, ey0, ex1, ey1) in P['excl'].get(nm, []):
        canvas.paste((0, 0, 0, 0), (ex0, ey0, ex1, ey1))
    canvas.save(f'{OUT}/{PFX}-{nm}.webp', 'WEBP', quality=92, method=6)
    for tag, col in (('dark', (24, 30, 40)), ('light', (200, 205, 215))):
        bgim = Image.new('RGBA', (SIZE, SIZE), col + (255,))
        bgim.alpha_composite(canvas)
        bgim.convert('RGB').save(f'{OUT}/prev-{nm}-{tag}.png')
