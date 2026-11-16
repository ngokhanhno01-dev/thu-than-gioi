#!/usr/bin/env python3
"""Xu ly 1 anh sheet 3 bac (Canva) thanh PNG trong suot, 1 lenh.

Dung:  python3 -I tools/xu_ly_anh_thu.py <anh_vao> <anh_ra.png> [--rgba] [--preview xem.png]

Lam:
  1. Xoa dau sao Gemini goc duoi phai (manh roi nho o x>85%, y>80%).
  2. Tach nen: anh nen magenta -> tach theo khoang cach mau (nen = median 4 goc).
     Anh da RGBA (nguoi dung tu xoa nen) -> them --rgba: to lai pixel am hong/tim.
  3. Vien am tim sat nen -> to lai vien navy (10,14,134).
  4. Alpha cung 0/255, bo manh roi < 30 px, cat sat chua le 24 px. KHONG thu nho.
  5. In bao cao (kich thuoc, so manh, so cum 3 bac) va ghep anh xem thu nen toi + nen sang (--preview).
Nhieu anh: dung vong for trong Bash, moi anh 1 lan chay.
"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi

def main():
    a = sys.argv[1:]
    if len(a) < 2: print(__doc__); sys.exit(1)
    src, dst = a[0], a[1]
    rgba_mode = '--rgba' in a
    prev = a[a.index('--preview') + 1] if '--preview' in a else None
    im = Image.open(src).convert('RGBA')
    arr = np.array(im).astype(int)
    H, W = arr.shape[:2]
    rgb, al = arr[..., :3], arr[..., 3]

    if rgba_mode:
        fg = al > 128
    else:
        cs = np.array([rgb[2, 2], rgb[2, W - 3], rgb[H - 3, 2], rgb[H - 3, W - 3]])
        bg = np.median(cs, axis=0)
        d = np.sqrt(((rgb - bg) ** 2).sum(-1))
        fg = d >= 70
    fg0 = fg.copy()

    # 1. xoa dau sao: manh roi nho o goc duoi phai
    lab, n = ndi.label(fg)
    for i in range(1, n + 1):
        m = lab == i
        ys, xs = np.where(m)
        if xs.min() >= 0.85 * W and ys.min() >= 0.80 * H and m.sum() < 0.01 * W * H:
            fg &= ~ndi.binary_dilation(m, iterations=2)

    # 2. vien am tim / am hong
    R, G, B = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    if rgba_mode:
        bad = fg & (R - G > 25) & (B - G > 10)
        bad = ndi.binary_dilation(bad, iterations=1) & fg
        if bad.any():
            good = fg & ~bad
            idx = ndi.distance_transform_edt(~good, return_distances=False, return_indices=True)
            rgb = rgb.copy()
            rgb[bad] = rgb[idx[0][bad], idx[1][bad]]
    else:
        near = ndi.binary_dilation(~fg0, iterations=3) & fg
        bad = near & (R - G > 40) & (B - G > 20)
        rgb = rgb.copy()
        rgb[bad] = (10, 14, 134)

    # 3. bo manh roi < 30 px
    lab, n = ndi.label(fg)
    sz = ndi.sum(fg, lab, range(1, n + 1))
    for i, s in enumerate(sz, 1):
        if s < 30: fg &= lab != i

    # 4. cat sat + le 24
    ys, xs = np.where(fg)
    pad = 24
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, H)
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, W)
    out = np.zeros((y1 - y0, x1 - x0, 4), np.uint8)
    out[..., :3] = rgb[y0:y1, x0:x1].clip(0, 255)
    out[..., 3] = np.where(fg[y0:y1, x0:x1], 255, 0)
    Image.fromarray(out, 'RGBA').save(dst)

    # bao cao
    lab, n = ndi.label(out[..., 3] > 0)
    big = [i for i in range(1, n + 1) if (lab == i).sum() > 400]
    cols = np.where((out[..., 3] > 0).any(0))[0]
    gaps = np.where(np.diff(cols) > 12)[0]
    print(f'{dst}: {out.shape[1]}x{out.shape[0]}, manh={n} (lon={len(big)}), cum-x={len(gaps) + 1}')
    pink = ((out[..., 0].astype(int) - out[..., 1] > 40) & (out[..., 2].astype(int) - out[..., 1] > 20) & (out[..., 3] > 0)).sum()
    print(f'pixel am hong con lai: {pink} (lon thi soi lai)')

    if prev:
        h, w = out.shape[:2]
        sheet = Image.new('RGBA', (w, h * 2), (255, 255, 255, 255))
        sheet.paste(Image.new('RGBA', (w, h), (20, 24, 40, 255)), (0, 0))
        im_o = Image.fromarray(out, 'RGBA')
        sheet.alpha_composite(im_o, (0, 0))
        sheet.alpha_composite(im_o, (0, h))
        sheet.convert('RGB').save(prev)
        print('xem thu (tren nen toi, duoi nen sang):', prev)

main()
