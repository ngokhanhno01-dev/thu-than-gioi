#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""tao-manh-ghep.py - TẠO ẢNH ITEM "MẢNH" THEO TỪNG LOÀI THÚ (game-moi/icon-th/th-m-<id>.png, 128x128, nền trong suốt).

Cách chạy (từ THƯ MỤC GỐC repo, cần Pillow):
    python3 tools/tao-manh-ghep.py --vung 0          # chỉ vùng 0 (Tuyết Nguyên)
    python3 tools/tao-manh-ghep.py --vung 0 1 2      # nhiều vùng
    python3 tools/tao-manh-ghep.py --tat-ca          # mọi vùng có trong 51-thu-moi.js
    python3 tools/tao-manh-ghep.py --vung 0 --form 3 # lấy ảnh dạng tiến hóa b3 thay vì b1

Mỗi mảnh = ĐẦU con thú (thấy mặt/mắt) cắt từ thu-game/<vùng>/<thú>-b<form>-<kích thước>.png, đặt lên nền tối màu vùng, rồi cắt thành
mảnh ghép jigsaw (vuông + 4 núm lồi/lõm, khác nhau theo từng thú). Viền = màu ĐỘ HIẾM của loài, quầng sáng = màu VÙNG.
Xong ghi thêm tools/xem-63-manh.png (ảnh ghép mọi mảnh đã có trong icon-th, có nhãn id) để duyệt bằng mắt.

THÊM VÙNG MỚI: khai vùng trong 51-thu-moi.js, bổ sung ZONE_MAU bên dưới (nếu thiếu), chạy lại với --vung <số>. Con thú nào cắt chưa trúng đầu
thì thêm 1 dòng vào CROP.

CROP[id] = [cx, cy, canh]: tâm vùng cắt theo TỈ LỆ khung bao (bbox) của con thú (0..1 theo chiều ngang / dọc), cạnh = tỉ lệ so với cạnh dài
của bbox. Mặc định MAC_DINH = phía trên-giữa. Thú nằm / rắn / ốc ... có đầu lệch thì ghi đè.
"""
import argparse
import glob
import hashlib
import os
import re
import sys

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

RA = 128           # cạnh ảnh mảnh cuối
SS = 4             # siêu lấy mẫu: vẽ mặt nạ gấp 4 rồi thu nhỏ cho mịn cạnh
MAC_DINH = (0.5, 0.30, 0.56)

# Ghi đè vị trí cắt đầu cho từng thú: id -> (cx, cy, cạnh) theo tỉ lệ bbox. Chỉnh tại đây khi xem ảnh ghép thấy chưa rõ mặt.
CROP = {
    # --- vùng 0 Tuyết Nguyên (ảnh b1; sprite nằm sát đáy khung 192 nên bbox nhỏ) ---
    '1a': (0.40, 0.20, 0.46),   # Tuyết Cầu (chim): đầu trên-trái
    '1b': (0.28, 0.38, 0.46),   # Tuyết Hùng (gấu): đầu bên trái
    '1c': (0.38, 0.27, 0.46),   # Băng Lộc (hươu): đầu + gạc phía trên
    '1d': (0.17, 0.38, 0.36),   # Tuyết Báo (báo nằm ngang): đầu bên trái
    '1e': (0.20, 0.30, 0.42),   # Băng Hải (thú nằm ngang): đầu bên trái
    '1f': (0.38, 0.22, 0.50),   # Tuyết Cú (cú): đầu trên
    '1g': (0.27, 0.31, 0.44),   # Băng Dương (dê sừng cuộn): đầu + sừng
    '1h': (0.50, 0.55, 0.45),   # Băng Linh (linh thể lá): mặt ở giữa thân
    '1i': (0.28, 0.50, 0.45),   # Băng Nham (khủng long giáp): đầu bên trái
    '1j': (0.30, 0.45, 0.55),   # Băng Sơn Cự Thú (voi ma mút): đầu + ngà bên trái
}

# Màu QUẦNG SÁNG theo vùng (z -> hex). Khóa theo số vùng của 51-thu-moi.js
ZONE_MAU = {
    0: '#8fe8ff',   # Tuyết Nguyên (băng)
    1: '#4a90ff',   # Sương Cốc (thủy)
    2: '#c9a8ff',   # Vân Đảo (tiên)
    3: '#66e0b0',   # Phong Nguyên (phong)
    4: '#ffe14a',   # Lôi Vực (lôi)
    5: '#d9d0ff',   # Nguyệt Cung (nguyệt)
    6: '#4a90ff',   # Thủy Nguyệt Cảnh
    7: '#ff6a3a',   # Xích Hỏa Địa
    8: '#6adf5a',   # Thanh Lâm
}

# Màu VIỀN theo ĐỘ HIẾM (0..4). Chọn kiểu kim loại / đá quý, tránh bảng neon của Rank (E..SR).
# TODO(độ hiếm): bảng này và DO_HIEM_MAC_DINH phải khớp với TTGCS.DO_HIEM / bảng độ hiếm ở 56b-loai.js khi mục 2 xong.
DO_HIEM_TEN = ['Thường', 'Hiếm', 'Sử Thi', 'Huyền Thoại', 'Truyền Thuyết']
DO_HIEM_MAU = ['#b9c0c9', '#3ec9a7', '#b06cff', '#ffb020', '#ff3d5a']


def do_hiem_mac_dinh(chi_so, boss):
    """Quy tắc mặc định: trong 9 thú thường: 3 Thường, 3 Hiếm, 2 Sử Thi, 1 Huyền Thoại; thú thứ 10 (boss) Truyền Thuyết."""
    if boss:
        return 4
    return [0, 0, 0, 1, 1, 1, 2, 2, 3][min(chi_so, 8)]


def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def doc_thu_moi(duong_dan):
    """Đọc 51-thu-moi.js bằng regex -> {z: {'slug':..., 'thu':[{id,slug,ten,boss}]}}"""
    s = open(duong_dan, encoding='utf-8').read()
    ds, z_hien = {}, None
    for m in re.finditer(r"\{\s*z:\s*(\d+)\s*,\s*slug:\s*'([^']+)'|\{\s*id:\s*'([^']+)'\s*,\s*slug:\s*'([^']+)'\s*,\s*ten:\s*'([^']+)'\s*,\s*boss:\s*(true|false)", s):
        if m.group(1) is not None:
            z_hien = int(m.group(1))
            ds[z_hien] = {'slug': m.group(2), 'thu': []}
        elif z_hien is not None:
            ds[z_hien]['thu'].append({'id': m.group(3), 'slug': m.group(4), 'ten': m.group(5), 'boss': m.group(6) == 'true'})
    return ds


def tim_anh(goc, slug_vung, slug_thu, form):
    """Chọn bản độ phân giải LỚN NHẤT có sẵn: -<n> lớn nhất trong thu-game/<vùng>/ (192, 256...) """
    mau = os.path.join(goc, 'thu-game', slug_vung, '%s-b%d-*.png' % (slug_thu, form))
    ds = []
    for f in glob.glob(mau):
        m = re.search(r'-(\d+)\.png$', f)
        if m:
            ds.append((int(m.group(1)), f))
    if not ds:
        return None
    return sorted(ds)[-1][1]


def cat_dau(anh, thu_id):
    """Cắt vùng ĐẦU từ ảnh thú theo CROP (hoặc MAC_DINH), trả ảnh RGBA vuông."""
    anh = anh.convert('RGBA')
    bb = anh.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()
    if not bb:
        return Image.new('RGBA', (8, 8))
    bx0, by0, bx1, by1 = bb
    w, h = bx1 - bx0, by1 - by0
    cx, cy, canh = CROP.get(thu_id, MAC_DINH)
    c = max(w, h) * canh
    x0, y0 = bx0 + cx * w - c / 2, by0 + cy * h - c / 2
    box = (int(round(x0)), int(round(y0)), int(round(x0 + c)), int(round(y0 + c)))
    return anh.crop(box)   # Pillow tự đệm trong suốt nếu vượt khung


def mat_na_jigsaw(thu_id):
    """Mặt nạ mảnh ghép ở độ phân giải RA*SS: vuông + 4 núm (lồi/lõm, vị trí lệch nhẹ) theo seed từ id."""
    n = RA * SS
    h = hashlib.md5(thu_id.encode('utf-8')).digest()
    # 4 cạnh: trên, phải, dưới, trái -> dấu +1 lồi / -1 lõm (đảm bảo có ít nhất 1 lồi, 1 lõm)
    dau = [1 if (h[i] & 1) else -1 for i in range(4)]
    if all(d == 1 for d in dau):
        dau[h[4] % 4] = -1
    if all(d == -1 for d in dau):
        dau[h[5] % 4] = 1
    lech = []
    for i in range(4):
        if dau[i] == 1:
            lech.append(((h[6 + i] % 9) - 4) / 4.0 * 0.12)             # núm lồi: lệch nhẹ quanh giữa cạnh
        else:
            sg = 1 if (h[(i + 10) % 16] & 1) else -1
            lech.append(sg * (0.22 + 0.06 * (h[(i + 3) % 16] % 3) / 2.0))   # núm LÕM: dời về phía góc để không khoét vào mặt thú
    le = 24 * SS               # lề từ mép ảnh tới thân vuông (chừa chỗ cho núm + quầng)
    s0, s1 = le, n - le        # thân vuông
    canh = s1 - s0
    r = int(canh * 0.13)       # bán kính đầu núm
    co = int(r * 0.9)          # độ nhô của tâm núm khỏi cạnh
    ban_co = int(r * 0.55)     # nửa bề rộng cổ núm
    m_ = Image.new('L', (n, n), 0)
    d = ImageDraw.Draw(m_)
    d.rectangle([s0, s0, s1, s1], fill=255)
    gm = (s0 + s1) // 2
    # tâm núm theo từng cạnh: (x, y, hướng ra ngoài)
    vt = [
        (gm + int(lech[0] * canh), s0, (0, -1)),   # trên
        (s1, gm + int(lech[1] * canh), (1, 0)),    # phải
        (gm + int(lech[2] * canh), s1, (0, 1)),    # dưới
        (s0, gm + int(lech[3] * canh), (-1, 0)),   # trái
    ]
    for i, (x, y, (dx, dy)) in enumerate(vt):
        mau = 255 if dau[i] == 1 else 0
        sg = 1 if dau[i] == 1 else -1
        cxn, cyn = x + dx * co * sg, y + dy * co * sg
        d.ellipse([cxn - r, cyn - r, cxn + r, cyn + r], fill=mau)
        # cổ núm: hình chữ nhật hẹp nối đầu núm với thân
        if dx == 0:
            d.rectangle([x - ban_co, min(y, cyn), x + ban_co, max(y, cyn)], fill=mau)
        else:
            d.rectangle([min(x, cxn), y - ban_co, max(x, cxn), y + ban_co], fill=mau)
    return m_


def nen_vung(mau_vung):
    """Nền tối chuyển sắc theo màu vùng để mảnh không bị lỗ ở chỗ ảnh thú trong suốt."""
    n = RA * SS
    r, g, b = hex2rgb(mau_vung)
    nen = Image.new('RGB', (n, n))
    px = nen.load()
    cx = cy = n / 2
    maxd = (n * 0.72)
    for y in range(n):
        for x in range(n):
            t = min(1.0, (((x - cx) ** 2 + (y - cy) ** 2) ** 0.5) / maxd)
            k = 0.42 - 0.30 * t          # sáng ở giữa, tối dần ra rìa
            px[x, y] = (int(18 + r * k), int(24 + g * k), int(40 + b * k))
    return nen.convert('RGBA')


def tao_manh(thu_id, anh_thu, mau_vung, mau_viem):
    n = RA * SS
    mat_na = mat_na_jigsaw(thu_id)
    # 1) nền + đầu thú (phủ vừa thân vuông, hơi tràn ra núm)
    nen = nen_vung(mau_vung)
    dau = cat_dau(anh_thu, thu_id)
    canh_dau = int(n * 0.80)
    dau = dau.resize((canh_dau, canh_dau), Image.LANCZOS)
    nen.alpha_composite(dau, ((n - canh_dau) // 2, (n - canh_dau) // 2))
    # 2) viền trong (vòng sáng mảnh) + viền màu độ hiếm
    vien_w = 3 * SS
    xoi = mat_na.filter(ImageFilter.MinFilter(2 * vien_w + 1))
    vien = ImageChops.subtract(mat_na, xoi)   # viền = mặt nạ trừ phần đã co vào
    thanh = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    thanh.paste(nen, (0, 0), mat_na)
    lop_vien = Image.new('RGBA', (n, n), hex2rgb(mau_viem) + (255,))
    thanh.paste(lop_vien, (0, 0), vien)
    # vạch tối mảnh ngay trong viền để nổi khối
    xoi2 = xoi.filter(ImageFilter.MinFilter(SS + 1))
    vach = ImageChops.subtract(xoi, xoi2)
    thanh.paste(Image.new('RGBA', (n, n), (0, 0, 0, 120)), (0, 0), vach)
    # 3) quầng sáng màu vùng phía sau
    qu = mat_na.filter(ImageFilter.MaxFilter(3 * SS + 1)).filter(ImageFilter.GaussianBlur(4 * SS))
    qu = qu.point(lambda a: int(a * 0.75))
    ra = Image.new('RGBA', (n, n), (0, 0, 0, 0))
    ra.paste(Image.new('RGBA', (n, n), hex2rgb(mau_vung) + (255,)), (0, 0), qu)
    ra.alpha_composite(thanh)
    return ra.resize((RA, RA), Image.LANCZOS)


def xuat_anh_ghep(thu_muc_icon, ra_file):
    ds = sorted(glob.glob(os.path.join(thu_muc_icon, 'th-m-*.png')))
    if not ds:
        return
    cot = 10
    hang = (len(ds) + cot - 1) // cot
    o = 150
    sheet = Image.new('RGBA', (cot * o, hang * o), (28, 30, 38, 255))
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(ds):
        im = Image.open(f).convert('RGBA')
        x, y = (i % cot) * o, (i // cot) * o
        sheet.alpha_composite(im, (x + 11, y + 4))
        d.text((x + 8, y + 134), os.path.basename(f)[5:-4], fill=(220, 225, 235, 255), font=font)
    os.makedirs(os.path.dirname(ra_file) or '.', exist_ok=True)
    sheet.convert('RGB').save(ra_file)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--goc', default='.', help='thư mục gốc repo (có thu-game/, game-moi/, 51-thu-moi.js)')
    ap.add_argument('--vung', type=int, nargs='*', default=[], help='số vùng cần tạo (0..8)')
    ap.add_argument('--tat-ca', action='store_true', help='tạo mọi vùng có ảnh')
    ap.add_argument('--form', type=int, default=1, choices=[1, 2, 3], help='dạng tiến hóa lấy ảnh để cắt đầu (mặc định b1)')
    ap.add_argument('--ra', default=None, help='thư mục xuất (mặc định <goc>/game-moi/icon-th)')
    ap.add_argument('--sheet', default=None, help='file ảnh ghép xem (mặc định <goc>/tools/xem-63-manh.png)')
    a = ap.parse_args()
    thu_moi = doc_thu_moi(os.path.join(a.goc, '51-thu-moi.js'))
    zs = sorted(thu_moi) if a.tat_ca else a.vung
    if not zs:
        print('Chưa chọn vùng: dùng --vung 0 hoặc --tat-ca'); sys.exit(1)
    ra = a.ra or os.path.join(a.goc, 'game-moi', 'icon-th')
    os.makedirs(ra, exist_ok=True)
    n_ok = 0
    for z in zs:
        v = thu_moi.get(z)
        if not v:
            print('Không có vùng', z); continue
        mau_vung = ZONE_MAU.get(z, '#9fb0e8')
        thu_thuong = [t for t in v['thu'] if not t['boss']]
        for t in v['thu']:
            f = tim_anh(a.goc, v['slug'], t['slug'], a.form)
            if not f:
                print('  thiếu ảnh', v['slug'], t['slug'], 'b%d' % a.form); continue
            chi_so = thu_thuong.index(t) if not t['boss'] else 9
            dh = do_hiem_mac_dinh(chi_so, t['boss'])
            im = Image.open(f)
            out = tao_manh(t['id'], im, mau_vung, DO_HIEM_MAU[dh])
            out.save(os.path.join(ra, 'th-m-%s.png' % t['id']))
            n_ok += 1
            print('  th-m-%s  %-20s %s  (%s)' % (t['id'], t['ten'], DO_HIEM_TEN[dh], os.path.basename(f)))
    xuat_anh_ghep(ra, a.sheet or os.path.join(a.goc, 'tools', 'xem-63-manh.png'))
    print('Xong: %d mảnh -> %s' % (n_ok, ra))


if __name__ == '__main__':
    main()
