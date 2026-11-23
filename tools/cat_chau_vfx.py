#!/usr/bin/env python3
"""Tách nền + cắt sprite Ngự Thú Châu (6 bậc) và texture VFX hút linh thú.

Chạy:  python3 tools/cat_chau_vfx.py <thu_muc_chua_12_anh> [thu_muc_game_moi]
Sinh ra:
  game-moi/img/chau/bac{N}-{closed|absorbing|shaking|success|failed}.png   (RGBA trong suốt, cắt sát, đã thu nhỏ SCALE)
  game-moi/img/vfx/hut-bac{N}-{vortex|particle|stream}.png                 (RGB nền đen, vẽ bằng 'lighter')
  game-moi/img/chau/meta.json                                              (kích thước, điểm neo, tỉ lệ)
Yêu cầu: numpy, scipy, Pillow.
"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

SRC = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'game-moi'
SCALE_CHAU = 0.65     # thu nhỏ sprite châu (1536x1024 -> kích thước dùng trong game, nhẹ hơn ~58%)
SCALE_VFX = 0.5       # thu nhỏ texture VFX
CLOSED_UNITS = 42.0   # bề ngang sprite 'closed' trong đơn vị game (khớp ~40 của bản cũ)
STATES = ['closed', 'absorbing', 'shaking', 'success', 'failed']

# Điểm neo (toạ độ TUYỆT ĐỐI trên sheet 1536x1024) của tâm lõi/châu cho các trạng thái không đối xứng.
# absorbing = tâm lõi pha lê (nơi đặt tâm vortex + mũi luồng hút); success = tâm quả châu (phía trên vòng trận).
CORE_ABS = {1: (762, 205), 2: (768, 215), 3: (768, 185), 4: (768, 195), 5: (765, 215), 6: (770, 190)}
ORB_SUCCESS = {1: (435, 700), 2: (445, 665), 3: (450, 665), 4: (478, 688), 5: (457, 632), 6: (445, 690)}


def border_bg(a):
    """Màu nền chuẩn: lấy mẫu pixel (0,0) rồi lấy trung vị vành biên (nền có nhiễu/gradient nhẹ)."""
    ring = np.concatenate([a[0, :], a[-1, :], a[:, 0], a[:, -1]]).reshape(-1, 3)
    med = np.median(ring, axis=0)
    return a[0, 0], med


def key_alpha(a, bg):
    """Trả về (alpha float 0..1, ảnh đã khử viền/spill). Lấp loang từ biên nên phần vỏ tối bên trong châu không bị xoá."""
    dark = bg.max() < 40                      # nền đen (chau-bac4)
    if dark:
        d = a.max(axis=2)                      # L-inf: phát sáng trên nền đen => alpha theo độ sáng
        lo, hi = 8.0, 70.0
    else:
        d = np.sqrt(((a - bg) ** 2).sum(axis=2))
        lo, hi = 48.0, 110.0
    cand = d < hi
    lab, n = ndi.label(cand)
    edge = set(np.unique(np.concatenate([lab[0, :], lab[-1, :], lab[:, 0], lab[:, -1]]))) - {0}
    region = np.isin(lab, list(edge)) if edge else np.zeros_like(cand)
    if not dark:
        region |= d < lo * 0.8                # túi nền hồng/xanh bị kẹt giữa khói / mảnh vỡ
    al = np.ones(d.shape, np.float32)
    t = np.clip((d - lo) / (hi - lo), 0, 1)
    al[region] = (t * t * (3 - 2 * t))[region]
    al[region & (d <= lo)] = 0
    # khử viền: bỏ phần màu nền trộn vào pixel bán trong suốt (c = (obs-(1-a)bg)/a)
    out = a.copy()
    m = (al > 0.003) & (al < 0.999)
    aa = al[m][:, None]
    out[m] = np.clip((a[m] - (1 - aa) * bg) / aa, 0, 255)
    if not dark:
        # spill suppression cho viền: kéo kênh thừa (magenta: R,B > G / xanh lá: G > R,B) về mức hợp lý ở dải sát nền
        near = ndi.binary_dilation(al < 0.02, iterations=2) & (al > 0.003)
        if bg[1] > 200:   # nền xanh lá
            lim = np.maximum(out[..., 0], out[..., 2])
            out[..., 1] = np.where(near, np.minimum(out[..., 1], lim * 1.05 + 8), out[..., 1])
        else:             # nền hồng
            lim = out[..., 1]
            out[..., 0] = np.where(near, np.minimum(out[..., 0], lim * 1.4 + 40), out[..., 0])
            out[..., 2] = np.where(near, np.minimum(out[..., 2], lim * 1.4 + 40), out[..., 2])
    return al, out


def slot_of(cx, cy):
    if cy < 512:
        return 0 if cx < 512 else (1 if cx < 1024 else 2)
    return 3 if cx < 768 else 4


def slice_chau(n):
    path = os.path.join(SRC, f'chau-bac{n}.png')
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
    h, w = a.shape[:2]
    corner, bg = border_bg(a)
    al, rgb = key_alpha(a, bg)
    mask = al > 0.06
    # gom thành cụm rồi gán cụm vào ô theo trọng tâm. Thử giãn 3 -> 2 -> 1 (x4px) lấy mức lớn nhất mà 5 ô vẫn tách sạch (không dính nhau)
    small = mask[::4, ::4]
    slotmap = None
    for it in (3, 2, 1):
        dil = ndi.binary_dilation(small, iterations=it)
        lab, cnt = ndi.label(dil)
        labf = np.kron(lab, np.ones((4, 4), dtype=lab.dtype))[:h, :w]
        sm = np.full((h, w), -1, np.int8)
        ok, seen = True, set()
        for k in range(1, cnt + 1):
            ys, xs = np.nonzero(lab == k)
            if len(ys) < 12:
                continue
            if (xs.max() - xs.min()) * 4 > 900:
                ok = False
                break
            s_ = slot_of(xs.mean() * 4, ys.mean() * 4)
            seen.add(s_)
            sm[labf == k] = s_
        if ok and len(seen) == 5:
            slotmap, used = sm, it
            break
    merged = slotmap is None
    if merged:   # dự phòng cuối: cắt theo ô cố định
        slotmap = np.full((h, w), -1, np.int8)
        for yy0, yy1, xx0, xx1, s_ in [(0, 512, 0, 512, 0), (0, 512, 512, 1024, 1), (0, 512, 1024, 1536, 2),
                                       (512, 1024, 0, 768, 3), (512, 1024, 768, 1536, 4)]:
            slotmap[yy0:yy1, xx0:xx1] = np.where(mask[yy0:yy1, xx0:xx1], s_, -1)
    res = {}
    for s, name in enumerate(STATES):
        sel = (slotmap == s) & mask
        ys, xs = np.nonzero(sel)
        if len(ys) == 0:
            raise SystemExit(f'bac{n}: không tìm thấy ô {name}')
        pad = 4
        x0, x1 = max(0, xs.min() - pad), min(w, xs.max() + 1 + pad)
        y0, y1 = max(0, ys.min() - pad), min(h, ys.max() + 1 + pad)
        A = np.where(slotmap[y0:y1, x0:x1] == s, al[y0:y1, x0:x1], 0)
        rgba = np.dstack([np.clip(rgb[y0:y1, x0:x1], 0, 255), A * 255]).astype(np.uint8)
        im = Image.fromarray(rgba, 'RGBA')
        nw, nh = max(1, round(im.width * SCALE_CHAU)), max(1, round(im.height * SCALE_CHAU))
        im = im.resize((nw, nh), Image.LANCZOS)
        # điểm neo (px sau thu nhỏ)
        if name == 'absorbing':
            ax, ay = CORE_ABS[n]
        elif name == 'success':
            ax, ay = ORB_SUCCESS[n]
        else:
            ax, ay = (x0 + x1) / 2, (y0 + y1) / 2
        res[name] = {'w': nw, 'h': nh, 'ax': round((ax - x0) * SCALE_CHAU, 1), 'ay': round((ay - y0) * SCALE_CHAU, 1)}
        d = os.path.join(OUT, 'img', 'chau')
        os.makedirs(d, exist_ok=True)
        im.save(os.path.join(d, f'bac{n}-{name}.png'), optimize=True)
    res['_corner'] = [int(v) for v in corner]
    res['_bg'] = [int(v) for v in bg]
    res['_merged'] = bool(merged)
    res['_dil'] = None if merged else used
    return res


def lum(a):
    return a.max(axis=2).astype(np.float32)


def crop_vfx(a, x0, y0, x1, y1, thr=14):
    sub = a[y0:y1, x0:x1]
    m = lum(sub) > thr
    ys, xs = np.nonzero(m)
    return x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1


def slice_vfx(n):
    path = os.path.join(SRC, f'hut-vao-bac{n}.png')
    a = np.asarray(Image.open(path).convert('RGB'))
    L = lum(a)
    # đường cắt tự dò: cột trống nhất giữa xoáy và hạt (x 740..920), hàng trống nhất giữa nửa trên và luồng (y 530..600)
    colp = ndi.uniform_filter1d(L[:556].sum(axis=0), 9)
    cx_cut = 740 + int(np.argmin(colp[740:920]))
    rowp = ndi.uniform_filter1d(L.sum(axis=1), 9)
    cy_cut = 530 + int(np.argmin(rowp[530:600]))
    parts = {
        'vortex': (0, 0, cx_cut, cy_cut),
        'particle': (cx_cut, 0, 1536, cy_cut),
        'stream': (0, cy_cut, 1536, 1024),
    }
    meta = {'_cut': [cx_cut, cy_cut]}
    d = os.path.join(OUT, 'img', 'vfx')
    os.makedirs(d, exist_ok=True)
    for name, (x0, y0, x1, y1) in parts.items():
        bx0, by0, bx1, by1 = crop_vfx(a, x0, y0, x1, y1)
        pad = 3
        bx0, by0 = max(x0, bx0 - pad), max(y0, by0 - pad)
        bx1, by1 = min(x1, bx1 + pad), min(y1, by1 + pad)
        sub = a[by0:by1, bx0:bx1]
        Ls = lum(sub)
        # tâm = trọng tâm các pixel sáng nhất (lõi trắng nóng)
        thr = np.percentile(Ls, 99.7)
        yy, xx = np.nonzero(Ls >= thr)
        wgt = Ls[yy, xx]
        ccx, ccy = (xx * wgt).sum() / wgt.sum(), (yy * wgt).sum() / wgt.sum()
        im = Image.fromarray(sub, 'RGB')
        nw, nh = max(1, round(im.width * SCALE_VFX)), max(1, round(im.height * SCALE_VFX))
        im = im.resize((nw, nh), Image.LANCZOS)
        im.save(os.path.join(d, f'hut-bac{n}-{name}.png'), optimize=True)
        r = {'w': nw, 'h': nh}
        if name in ('vortex', 'particle'):
            r['cx'], r['cy'] = round(ccx * SCALE_VFX, 1), round(ccy * SCALE_VFX, 1)
        else:
            # mũi nhọn = đầu phải: trọng tâm sáng của 4% cột ngoài cùng bên phải; gốc đuôi = mép trái
            k = max(4, int(sub.shape[1] * 0.04))
            col = Ls[:, -k:]
            ys2, xs2 = np.nonzero(col > 40)
            tip_y = float(ys2.mean()) if len(ys2) else sub.shape[0] / 2
            tip_x = sub.shape[1] - 1
            r['tx'], r['ty'] = 0.0, round(tip_y * SCALE_VFX, 1)       # trục luồng nằm ngang qua mũi nhọn
            r['hx'], r['hy'] = round(tip_x * SCALE_VFX, 1), round(tip_y * SCALE_VFX, 1)
        meta[name] = r
    return meta


def main():
    meta = {'chau': {}, 'vfx': {}}
    for n in range(1, 7):
        c = slice_chau(n)
        meta['chau'][n] = c
        meta['vfx'][n] = slice_vfx(n)
        cw = c['closed']['w']
        c['sc'] = round(CLOSED_UNITS / min(cw, c['closed']['h']), 5)
        for _s in STATES:
            for _k in ('ax', 'ay'):
                c[_s][_k] = float(c[_s][_k])          # đơn vị game / pixel (quả châu 'closed' ~42 đơn vị)
        print(f'bac{n}: corner={c["_corner"]} bg={c["_bg"]} merged={c["_merged"]} dil={c["_dil"]} closed={c["closed"]} sc={c["sc"]} cut={meta["vfx"][n]["_cut"]}')
        for s in STATES:
            print('   ', s, c[s])
    with open(os.path.join(OUT, 'img', 'chau', 'meta.json'), 'w') as f:
        json.dump(meta, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
