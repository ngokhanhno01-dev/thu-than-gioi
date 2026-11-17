#!/usr/bin/env python3
"""Xu ly anh sheet 3 bac (Canva/Gemini) thanh PNG trong suot. Ban v2.

Dung (1 anh):
  python3 -I xu_ly_anh_thu.py <anh_vao> <anh_ra.png> [--preview xem.png] [--rgba]
Dung (CA THU MUC, khuyen dung, nhanh nhat - 1 lenh cho 10 anh + bang xem thu):
  python3 -I xu_ly_anh_thu.py --batch <thu_muc_vao> <thu_muc_ra> [--sheet /duong/dan/bang]
  -> ghi <thu_muc_ra>/<cung ten>.png va bang xem thu <bang>_0.jpg, <bang>_1.jpg (5 anh / bang,
     moi anh: nua trai nen toi, nua phai nen sang). Chi can doc bang xem thu 1 lan.

Tu dong:
  - Nen = median 4 goc. Nen magenta (R>200,B>200,G<80) -> bat buoc buoc "to lai vien am tim".
    Nen khac (tim Gemini ~ (79,67,102), ...) -> TAT buoc do (neu bat se to nham tinh the/rune hong sat mep).
    Ep tay: --fringe / --no-fringe.
  - Tach nen CHAT (mac dinh): chi coi la nen vung rat gan mau nen (d<32) cham bien anh hoac du lon
    (>=150px, khe giua chan/cuon duoi), roi nho them 2px quanh mep (d<70). Vung toi ben trong than
    (bia da, mai dinh, bong toi) duoc GIU. Ban cu (nguong d>=70 toan anh) --old-bg: lam THUNG than.
  - Xoa dau sao Gemini: chi manh ~500-1200px, gan vuong (<=90px), o goc duoi phai. KHONG xoa cac manh
    nho khac (tan may, tia sang, dom suong la thiet ke - ban cu xoa nham).
  - Alpha cung 0/255, bo manh roi < 30px, cat sat chua le 24px. KHONG thu nho.
  --rgba: anh nguoi dung da tu xoa nen (to lai pixel am hong/tim bang mau lan can).
Can: numpy, scipy, PIL. Luon chay voi python3 -I.
"""
import sys, os, glob
import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def process(src, dst, rgba_mode=False, fringe=None, old_bg=False):
    im = Image.open(src).convert('RGBA')
    arr = np.array(im).astype(int)
    H, W = arr.shape[:2]
    rgb, al = arr[..., :3], arr[..., 3]
    note = []

    if rgba_mode:
        fg = al > 128
        if fringe is None: fringe = False
    else:
        cs = np.array([rgb[2, 2], rgb[2, W - 3], rgb[H - 3, 2], rgb[H - 3, W - 3]])
        bg = np.median(cs, axis=0)
        if fringe is None:
            fringe = bool(bg[0] > 200 and bg[2] > 200 and bg[1] < 80)
        d = np.sqrt(((rgb - bg) ** 2).sum(-1))
        if old_bg:
            fg = d >= 70
        else:
            strict = d < 32
            labb, nb = ndi.label(strict)
            keep = np.zeros(nb + 1, bool)
            border = np.unique(np.concatenate([labb[0], labb[-1], labb[:, 0], labb[:, -1]]))
            areas = ndi.sum(strict, labb, range(1, nb + 1))
            keep[border] = True
            keep[1:] |= areas >= 150
            keep[0] = False
            bgm = keep[labb]
            halo = ndi.binary_dilation(bgm, iterations=2) & (d < 70)
            fg = ~(bgm | halo)
        note.append('nen=(%d,%d,%d)%s' % (bg[0], bg[1], bg[2], ' magenta' if fringe else ''))
    fg0 = fg.copy()

    # 1. xoa dau sao Gemini (chi dung manh co kich thuoc/hinh dang cua sao)
    lab, n = ndi.label(fg)
    star = 0
    for i in range(1, n + 1):
        m = lab == i
        ys, xs = np.where(m)
        bw, bh = xs.max() - xs.min() + 1, ys.max() - ys.min() + 1
        if (xs.min() >= 0.85 * W and ys.min() >= 0.80 * H and 500 <= m.sum() <= 1200
                and bw <= 90 and bh <= 90 and abs(int(bw) - int(bh)) <= 12):
            fg &= ~ndi.binary_dilation(m, iterations=2)
            star += 1
    note.append('dau sao: %s' % ('da xoa' if star else 'KHONG THAY (kiem tra goc duoi phai!)'))

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
    elif fringe:
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

    lab, n = ndi.label(out[..., 3] > 0)
    big = sum(1 for i in range(1, n + 1) if (lab == i).sum() > 400)
    print('%s: %dx%d, manh=%d (lon=%d); %s' % (os.path.basename(dst), out.shape[1], out.shape[0], n, big, '; '.join(note)))
    return out


def over(out, color):
    s = Image.new('RGBA', (out.shape[1], out.shape[0]), color)
    s.alpha_composite(Image.fromarray(out, 'RGBA'))
    return s.convert('RGB')


def preview_one(out, path):
    d, l = over(out, (20, 24, 40, 255)), over(out, (255, 255, 255, 255))
    sheet = Image.new('RGB', (d.width, d.height * 2))
    sheet.paste(d, (0, 0)); sheet.paste(l, (0, d.height))
    sheet.save(path)
    print('xem thu (tren nen toi, duoi nen sang):', path)


def sheets(outs, prefix, per=5, cw=640):
    rows = []
    for out in outs:
        r = cw / out.shape[1]
        sz = (cw, max(1, int(out.shape[0] * r)))
        d = over(out, (20, 24, 40, 255)).resize(sz, Image.NEAREST)
        l = over(out, (255, 255, 255, 255)).resize(sz, Image.NEAREST)
        row = Image.new('RGB', (cw * 2, sz[1]))
        row.paste(d, (0, 0)); row.paste(l, (cw, 0)); rows.append(row)
    for k in range(0, len(rows), per):
        grp = rows[k:k + per]
        sh = Image.new('RGB', (cw * 2, sum(r.height for r in grp)))
        y = 0
        for r in grp: sh.paste(r, (0, y)); y += r.height
        p = '%s_%d.jpg' % (prefix, k // per)
        sh.save(p, quality=85)
        print('bang xem thu:', p)


def main():
    a = sys.argv[1:]
    if len(a) < 2: print(__doc__); sys.exit(1)
    fringe = True if '--fringe' in a else (False if '--no-fringe' in a else None)
    kw = dict(rgba_mode='--rgba' in a, fringe=fringe, old_bg='--old-bg' in a)
    if a[0] == '--batch':
        din, dout = a[1], a[2]
        os.makedirs(dout, exist_ok=True)
        files = sorted(glob.glob(os.path.join(din, '*.png')))
        outs = [process(f, os.path.join(dout, os.path.basename(f)), **kw) for f in files]
        prefix = a[a.index('--sheet') + 1] if '--sheet' in a else os.path.join(dout, '_xem_thu')
        if outs: sheets(outs, prefix)
        return
    out = process(a[0], a[1], **kw)
    if '--preview' in a: preview_one(out, a[a.index('--preview') + 1])


main()
