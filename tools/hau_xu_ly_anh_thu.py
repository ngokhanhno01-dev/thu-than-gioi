#!/usr/bin/env python3
"""Hau xu ly SAU xu_ly_anh_thu.py --batch (chay tren thu muc PNG da tach nen).
Dung:  python3 -I hau_xu_ly_anh_thu.py <thu_muc_vao> <thu_muc_ra> [--bg magenta|teal|auto] [--dao slug1,slug2]
  1. Xoa pixel con lai mau nen (vien/quang): magenta -> pixel hong/tim; teal -> pixel xanh lo/teal
     (an toan khi thu KHONG co mau do; neu thu co xanh teal thi KHONG dung --bg teal).
  2. Bo manh roi < 30px; xoa dau sao Gemini con sot (manh < 1500px, bbox <= 70px, goc duoi phai).
  3. --dao: dao thu tu 3 bac (khi anh ra Bac 3 -> 1, vd Phong Mieu) bang cach cat theo 2 cot thua nhat
     (cua so 40-55% va 68-82% chieu rong). Xem lai bang xem thu sau khi dao.
Can numpy, scipy, PIL.
"""
import sys, os, glob
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def bad_mask(arr, a, bg):
    R, G, B = [arr[..., i].astype(int) for i in range(3)]
    if bg == 'teal':
        m = a & (G - R > 40) & (B - R > 40)
        m2 = a & (G - R > 15) & (B - R > 15)
    else:
        m = a & (R - G > 35) & (B - G > 35)
        m2 = a & (R - G > 15) & (B - G > 15)
    return m | (ndi.binary_dilation(m, iterations=1) & m2)

def crop(arr, pad=24):
    ys, xs = np.where(arr[..., 3] > 0)
    y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad + 1, arr.shape[0])
    x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad + 1, arr.shape[1])
    return arr[y0:y1, x0:x1]

def reverse(arr):
    W = arr.shape[1]
    prof = ndi.uniform_filter1d((arr[..., 3] > 0).sum(0).astype(float), 15)
    cut = lambda lo, hi: int(W * lo) + int(np.argmin(prof[int(W * lo):int(W * hi)]))
    c1, c2 = cut(0.40, 0.55), cut(0.68, 0.82)
    def tight(s):
        ys, xs = np.where(s[..., 3] > 0); return s[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    segs = [tight(arr[:, :c1]), tight(arr[:, c1:c2]), tight(arr[:, c2:])][::-1]
    H = max(s.shape[0] for s in segs); g = 70
    out = np.zeros((H, sum(s.shape[1] for s in segs) + 2 * g, 4), np.uint8); x = 0
    for s in segs:
        out[H - s.shape[0]:, x:x + s.shape[1]] = s; x += s.shape[1] + g
    return out

def main():
    a = sys.argv[1:]
    if len(a) < 2: print(__doc__); sys.exit(1)
    din, dout = a[0], a[1]
    bg = a[a.index('--bg') + 1] if '--bg' in a else 'magenta'
    dao = a[a.index('--dao') + 1].split(',') if '--dao' in a else []
    os.makedirs(dout, exist_ok=True)
    for f in sorted(glob.glob(os.path.join(din, '*.png'))):
        arr = np.array(Image.open(f).convert('RGBA')); al = arr[..., 3] > 0
        bad = bad_mask(arr, al, bg); al2 = al & ~bad
        lab, n = ndi.label(al2); H, W = al2.shape; star = 0
        for i in range(1, n + 1):
            m = lab == i; s = m.sum(); ys, xs = np.where(m)
            if s < 30: al2 &= ~m
            elif (xs.min() >= 0.93 * W and ys.min() >= 0.7 * H and 400 <= s <= 1500
                  and xs.max() - xs.min() < 70 and ys.max() - ys.min() < 70
                  and abs((xs.max() - xs.min()) - (ys.max() - ys.min())) <= 12):
                al2 &= ~m; star += 1
        arr[..., 3] = np.where(al2, 255, 0)
        if any(d and d in f for d in dao): arr = reverse(arr)
        arr = crop(arr)
        Image.fromarray(arr, 'RGBA').save(os.path.join(dout, os.path.basename(f)))
        print(os.path.basename(f), arr.shape[1], 'x', arr.shape[0], '| xoa mau nen:', int(bad.sum()), '| sao:', star)

main()
