#!/usr/bin/env python3
"""Cắt sạch ảnh hiệu ứng: bỏ mảnh thừa dính từ ảnh khác, cắt sát viền, làm mờ mép bị cắt cụt.
Chạy:  python3 tools/clean_fx.py     (đọc ảnh gốc ở thư mục gốc repo, ghi ảnh sạch vào fx/)
Ảnh gốc KHÔNG bị sửa. Game chỉ nạp ảnh trong fx/ (xem 31-combat-fx.js)."""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'fx')
os.makedirs(OUT, exist_ok=True)

def feather_edges(a, fade=12):
    """Mép nào của ảnh bị sprite chạm vào (bị cắt cụt) thì cho mờ dần ra thay vì để lộ đường cắt thẳng."""
    h, w = a.shape[:2]
    al = a[..., 3].astype(np.float32)
    def touched(line): return (line > 40).sum() >= 6
    sides = {'top': touched(al[0, :]), 'bottom': touched(al[-1, :]), 'left': touched(al[:, 0]), 'right': touched(al[:, -1])}
    m = np.ones((h, w), np.float32)
    ramp = lambda n: (np.arange(n, dtype=np.float32) / max(1, n - 1)) ** 1.5
    fh, fw = min(fade, h // 3), min(fade, w // 3)
    if sides['top'] and fh > 1:    m[:fh, :] *= ramp(fh)[:, None]
    if sides['bottom'] and fh > 1: m[-fh:, :] *= ramp(fh)[::-1][:, None]
    if sides['left'] and fw > 1:   m[:, :fw] *= ramp(fw)[None, :]
    if sides['right'] and fw > 1:  m[:, -fw:] *= ramp(fw)[::-1][None, :]
    a = a.copy(); a[..., 3] = (al * m).astype(np.uint8)
    return a

def clean(path, keep_ratio=0.12, merge=4, drop_border_small=True, pad=3, fade=12, alpha_cut=24, cut_below=None):
    im = Image.open(path).convert('RGBA'); a = np.array(im)
    if cut_below: a[int(a.shape[0] * cut_below):, :, 3] = 0   # bỏ vụn thừa ở đáy ảnh
    al = a[..., 3]
    solid = al > alpha_cut
    merged = ndi.binary_dilation(solid, iterations=merge)
    lab, n = ndi.label(merged, structure=np.ones((3, 3)))
    if n == 0: return im
    h, w = al.shape
    areas = ndi.sum(solid, lab, index=range(1, n + 1))
    big = max(areas)
    keep = np.zeros(n + 1, bool)
    for i in range(1, n + 1):
        if areas[i - 1] < big * keep_ratio: continue
        if drop_border_small and areas[i - 1] < big * 0.5:
            ys, xs = np.where(lab == i)
            if ys.min() == 0 or xs.min() == 0 or ys.max() == h - 1 or xs.max() == w - 1: continue   # mảnh bị cắt dính mép = thừa từ ảnh bên cạnh
        keep[i] = True
    mask = keep[lab]
    a[..., 3] = np.where(mask, al, 0).astype(np.uint8)
    a[a[..., 3] == 0] = 0
    ys, xs = np.where(a[..., 3] > 6)
    y0, y1, x0, x1 = max(0, ys.min() - pad), min(h, ys.max() + 1 + pad), max(0, xs.min() - pad), min(w, xs.max() + 1 + pad)
    a = a[y0:y1, x0:x1]
    # đệm 1 hàng trong suốt quanh ảnh để feather không ăn vào thân
    a = np.pad(a, ((2, 2), (2, 2), (0, 0)))
    return Image.fromarray(feather_edges(a, fade))

def ring_only(path):
    """dome-shield: chỉ giữ viền + nền rất nhạt, bỏ đĩa xám đặc (đó là 'cái khung' trước đây)."""
    im = Image.open(path).convert('RGBA'); a = np.array(im).astype(np.float32)
    al = a[..., 3]
    a[..., 3] = np.where(al > 150, al, al * 0.16)
    ys, xs = np.where(a[..., 3] > 8)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    return Image.fromarray(a.astype(np.uint8))

def save(name, im, scale_to=None):
    if scale_to and max(im.size) > scale_to:
        s = scale_to / max(im.size); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    im.save(os.path.join(OUT, name + '.png'), optimize=True)

SINGLES = [  # (tên mới, ảnh gốc, tuỳ chọn)
 # ---- đòn đánh xa (mỗi vùng 1 ảnh riêng) ----
 ('atk-tuyet-nguyen', 'magic-bolts-a_04.png', {}),
 ('atk-van-dao', 'song-bang-xanh_01.png', {'cut_below': .8}),
 ('atk-loi-vuc', 'magic-bolts-a_03.png', {}),
 ('atk-duong-son', 'thien-thach-cam_01.png', {}),
 ('atk-ngoc-dong', 'magic-bolts-a_06.png', {}),
 ('atk-xich-hoa', 'lasers-c_14.png', {}),
 ('atk-tu-tinh', 'magic-bolts-a_01.png', {}),
 ('atk-thien-khong', 'lasers-c_10.png', {}),
 ('atk-linh-hoa', 'projectiles-b_10.png', {}),
 ('atk-than-dien', 'lasers-c_06.png', {}),
 # ---- buff vùng (nhóm 1) ----
 ('bz-cau-xanh', 'cau-nang-luong-xanh_01.png', {}),
 ('bz-cau-khien', 'cau-xanh-khien_01.png', {}),
 ('bz-cau-den', 'cau-den-tim_01.png', {}),
 ('bz-dome-hong', 'dome-hong_01.png', {}),
 ('bz-dome-tim-lua', 'dome-tim-lua_01.png', {}),
 ('bz-dome-tim-nho', 'dome-tim-nho_01.png', {}),
 ('bz-set', 'sam-set-mat-dat_01.png', {}),
 ('bz-no-lua', 'no-lua-mat-dat_01.png', {}),
 ('bz-linh-hon', 'linh-hon-xanh-la_01.png', {}),
]
SEQ = {  # chuỗi khung cho đòn cận chiến / buff nền: (tiền tố, danh sách số khung, tuỳ chọn)
 'mel-suong-coc':   ('swirl-blue_',        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], {'keep_ratio': .05}),
 'mel-phong-nguyen':('crescent-blue_',     [1, 2, 3, 4, 5, 9], {'keep_ratio': .05}),
 'mel-nguyet-cung': ('crescent-purple_',   [2, 3, 7, 8, 12, 13, 17, 18], {'keep_ratio': .05}),
 'mel-huyen-uyen':  ('attack-pack-cyan_',  [4, 5, 6, 7], {'keep_ratio': .05}),
 'mel-kim-khoang':  ('attack-pack-cyan_',  [26, 27, 29, 34], {'keep_ratio': .05}),
 'mel-thanh-lam':   ('slash-pixel-sheet_', [33, 34, 35, 36], {'keep_ratio': .05}),
 'mel-hac-am':      ('slash-pixel-sheet_', [9, 10, 11, 12], {'keep_ratio': .05}),
}

if __name__ == '__main__':
    os.chdir(ROOT)
    for name, src, opt in SINGLES:
        save(name, clean(src, **opt))
    for name, (pre, nums, opt) in SEQ.items():
        for i, n in enumerate(nums, 1):
            save('%s-%02d' % (name, i), clean('%s%02d.png' % (pre, n), **opt))
    save('bz-khien-vong', ring_only('dome-shield.png'), scale_to=300)
    # ngọn lửa nền: chỉ lấy khung 1–2 (khung 3–4 là mảnh bị cắt dở từ tờ sprite)
    for color in ['do', 'gold', 'jade', 'blue', 'red', 'pink', 'xanh-ngoc', 'hong-do', 'vang', 'xanh-duong-nhat', 'xanh-lo-nhat', 'vang-dam', 'xanh-duong-dam', 'xanh-ngoc-dam']:
        for k in (1, 2):
            for sep in ('_', '-'):
                p = 'aura-%s%s%d.png' % (color, sep, k)
                if os.path.exists(p): save('aura-%s-%d' % (color, k), clean(p, keep_ratio=.3, merge=2, fade=0))
    for i in range(1, 10):
        save('flame-%02d' % i, clean('ground-flame-%02d.png' % i, keep_ratio=.3, fade=6))
    print('xong:', len(os.listdir(OUT)), 'ảnh trong fx/')
