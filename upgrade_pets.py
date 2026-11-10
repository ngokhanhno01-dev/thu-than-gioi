#!/usr/bin/env python3
"""Nâng cấp ảnh thú: mỗi HỆ có sắc độ + chất liệu riêng (không chỉ đổi màu).
Chạy:  python3 tools/upgrade_pets.py <thư_mục_ảnh_gốc> <thư_mục_ra>
Đọc img-sprites-{bl}-{e}.png (+ baby-{bl}.png) và ghi lại cùng tên (adult) và
img-sprites-baby-{bl}-{e}.png (baby theo hệ)."""
import sys, os, re, numpy as np
from PIL import Image, ImageFilter
from skimage.color import rgb2hsv, hsv2rgb

BL = ['ho','vu','long','tuoc','lan','hu']
# (tên, hue đích 0..1, hệ số bão hòa, hệ số sáng, kiểu chất liệu, màu nhấn sáng, màu nhấn tối)
EL = [
 # màu lấy theo bảng màu cảnh của từng vùng (SCN trong 04-scenes.js): hue thân, sáng/tối, ánh sáng cảnh
 ('Tuyết Nguyên',0.55,0.85,1.10,'frost',  '#dcf2ff','#2a4a6b'),
 ('Sương Cốc',   0.48,0.95,0.98,'mist',   '#d2ebe4','#3f5a58'),
 ('Vân Đảo',     0.74,1.15,1.00,'cloud',  '#f0e6ff','#3a3070'),
 ('Phong Nguyên',0.40,0.90,1.05,'wind',   '#c8ffe0','#134a2e'),
 ('Lôi Vực',     0.70,0.85,1.12,'bolt',   '#ffe86a','#2a2450'),
 ('Nguyệt Cung', 0.64,1.15,1.00,'moon',   '#d8d8ff','#1a2058'),
 ('Dương Sơn',   0.06,1.30,1.10,'sun',    '#ffd28a','#4a1e0c'),
 ('Huyền Uyên',  0.72,1.05,1.05,'void',   '#8c8cbe','#1a1a2e'),
 ('Kim Khoáng',  0.12,1.05,1.05,'metal',  '#ffd24a','#5a3e0c'),
 ('Ngọc Động',   0.45,1.10,0.95,'gem',    '#a8ffd8','#0a3a2e'),
 ('Thanh Lâm',   0.33,1.10,0.95,'leaf',   '#7affc0','#0c3016'),
 ('Xích Hỏa Địa',0.02,1.25,0.95,'ember',  '#ff9a5a','#5a1a10'),
 ('Hắc Ám Lâm',  0.80,1.00,0.95,'shadow', '#927795','#100818'),
 ('Tử Tinh Hải', 0.76,1.10,0.95,'star',   '#d89aff','#1a0a3a'),
 ('Thiên Không', 0.58,1.20,1.05,'feather','#e8f6ff','#4a7ab0'),
 ('Linh Hoa Viên',0.88,0.90,1.10,'petal', '#ffd0f0','#4a1a3a'),
 ('Thần Điện',   0.11,0.90,1.05,'divine', '#fff0bc','#9f783d'),
]
def hexrgb(h): return np.array([int(h[i:i+2],16) for i in (1,3,5)],np.float32)/255

def rng_for(bl,e): return np.random.RandomState(1000+BL.index(bl)*97+e*13)

def recolor(rgb,mask,hue,sat,val,strength=0.8):
    hsv=rgb2hsv(rgb)
    w=(hsv[...,1]*hsv[...,2])*mask
    # hue chủ đạo (vòng tròn)
    ang=hsv[...,0]*2*np.pi
    dom=(np.arctan2((np.sin(ang)*w).sum(),(np.cos(ang)*w).sum())/(2*np.pi))%1.0
    colored=hsv[...,1]>0.16
    h=hsv[...,0].copy()
    # kéo mọi màu về hue của hệ, chỉ giữ 40% độ lệch gốc => mỗi hệ có tông riêng nhưng vẫn có điểm nhấn
    off=((h-dom+0.5)%1.0)-0.5
    h[colored]=(hue+off[colored]*0.7)%1.0
    # vùng gần trắng/xám: nhuộm nhẹ theo hệ để không còn "trắng chung chung"
    g=~colored
    h[g]=hue
    s=hsv[...,1].copy()
    s[colored]=np.clip(s[colored]*sat,0,1)
    s[g]=np.clip(s[g]+0.22*min(sat,1.2),0,1)*(hsv[...,2][g]>0.25)
    v=np.clip(hsv[...,2]*val,0,1)
    return hsv2rgb(np.dstack([h,s,v]))


# THÂN đậm + ĐIỂM NHẤN sáng (vây, vảy, sọc, đuôi...). Màu lấy theo cảnh từng vùng.
TWO={
 0:(0.57,0.30,0.95, 0.60,0.95), 1:(0.48,0.35,0.78, 0.44,0.80), 2:(0.74,0.65,0.78, 0.88,0.80),
 3:(0.38,0.70,0.72, 0.23,0.85), 4:(0.70,0.70,0.80, 0.15,0.95), 5:(0.64,0.75,0.80, 0.55,0.40),
 6:(0.04,0.85,0.88, 0.12,0.90), 7:(0.72,0.65,0.85, 0.62,0.55), 8:(0.09,0.80,0.80, 0.14,0.70),
 9:(0.47,0.80,0.72, 0.36,0.60), 10:(0.33,0.80,0.68, 0.20,0.85), 11:(0.00,0.85,0.78, 0.09,0.90),
 12:(0.80,0.70,0.80, 0.86,0.80), 13:(0.72,0.80,0.85, 0.86,0.85), 14:(0.58,0.80,0.90, 0.13,0.55),
 15:(0.90,0.70,0.88, 0.95,0.35), 16:(0.10,0.70,0.85, 0.13,0.25),
}
def recolor2(rgb,mask,e):
    bh,bs,bv,ah,as_=TWO[e]
    hsv=rgb2hsv(rgb); h,sv,v=hsv[...,0],hsv[...,1],hsv[...,2]
    w=sv*v*mask
    ang=h*2*np.pi
    dom=(np.arctan2((np.sin(ang)*w).sum(),(np.cos(ang)*w).sum())/(2*np.pi))%1.0
    off=np.abs(((h-dom+0.5)%1.0)-0.5)
    vm=v[mask]; thr=np.percentile(vm,82) if mask.any() else 1
    acc=((off>0.06)&(sv>0.28))|((v>=thr)&(sv>0.30)&(off>0.02))
    acc=acc&mask
    # làm mượt mặt nạ điểm nhấn 1 chút để không lởm chởm
    accw=acc.astype(np.float32)
    # thân
    vb=np.clip(0.10+v*bv*1.05,0,1)
    sb=np.clip(bs+sv*0.35,0,1)*(v>0.2)
    hb=np.full_like(h,bh)
    # điểm nhấn
    va=np.clip(0.62+v*0.45,0,1)
    sa=np.clip(as_*(0.75+0.25*sv),0,1)
    ha=np.full_like(h,ah)
    H=np.where(acc,ha,hb); S=np.where(acc,sa,sb); V=np.where(acc,va,vb)
    return hsv2rgb(np.dstack([H,S,V]))


SHIFT={0:-0.04,1:0.09,2:0.12,3:0.09,5:0.10,6:0.05,7:-0.08,9:0.08,12:0.07,14:-0.44,15:0.06}
def accent_pop(orig,rgb,mask,e=0):
    """Điểm nhấn (vây/vảy/sọc/đuôi có hue khác thân) sáng và rực hơn, thân đậm hơn => nhìn có nét, có chiều sâu."""
    ho=rgb2hsv(orig); h,sv,v=ho[...,0],ho[...,1],ho[...,2]
    w=sv*v*mask
    ang=h*2*np.pi
    dom=(np.arctan2((np.sin(ang)*w).sum(),(np.cos(ang)*w).sum())/(2*np.pi))%1.0
    off=np.abs(((h-dom+0.5)%1.0)-0.5)
    t=np.clip((off-0.03)/0.07,0,1)*np.clip((sv-0.18)/0.25,0,1)      # 0 = thân, 1 = điểm nhấn (mượt)
    vm=v[mask]; thr=np.percentile(vm,88) if mask.any() else 1
    t=np.maximum(t,0.8*np.clip((v-thr)/(1-thr+1e-6),0,1)*np.clip((sv-0.25)/0.2,0,1))
    t=t*mask
    hn=rgb2hsv(rgb)
    S=hn[...,1]; V=hn[...,2]
    V2=np.where(t>0, np.clip(V*(1+0.30*t)+0.10*t,0,1), V*(0.90))
    V2=V*(1-t)*0.88+np.clip(V*1.30+0.10,0,1)*t
    S2=np.clip(S*(1-t)*1.08+np.clip(S*1.15+0.05,0,1)*t,0,1)
    H2=(hn[...,0]+SHIFT.get(e,0)*t)%1.0
    out=hsv2rgb(np.dstack([H2,S2,V2]))
    return np.where(mask[...,None],out,rgb)

def edges(mask,n=1):
    m=Image.fromarray((mask*255).astype(np.uint8))
    er=np.array(m.filter(ImageFilter.MinFilter(2*n+1)))>0
    return mask&~er, er

def shade_grad(h,w,top,bot):
    y=np.linspace(0,1,h)[:,None]*np.ones((1,w))
    return top+(bot-top)*y

def blobs(shape,mask,r,count,minr,maxr):
    """trả về mặt nạ các đốm tròn nằm trong mask"""
    H,W=shape; out=np.zeros(shape,bool)
    ys,xs=np.nonzero(mask)
    if len(ys)==0: return out
    yy,xx=np.mgrid[0:H,0:W]
    for _ in range(count):
        i=r.randint(len(ys)); cy,cx=ys[i],xs[i]; rad=r.uniform(minr,maxr)
        out|=((yy-cy)**2+(xx-cx)**2)<=rad*rad
    return out&mask

def material(rgb,mask,inner,kind,light,dark,r):
    H,W=mask.shape; out=rgb.copy()
    yy,xx=np.mgrid[0:H,0:W]
    L=hexrgb(light); D=hexrgb(dark)
    lum=rgb.mean(-1)
    lit=inner&(lum>np.percentile(lum[mask],45))
    rim=inner&~np.array(Image.fromarray((inner*255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)))>0   # lớp 1px ngay trong viền tối
    def paint(m,col,a=1.0):
        if isinstance(a,np.ndarray): a=a[m][:,None]
        out[m]=out[m]*(1-a)+col*a
    if kind=='frost':
        paint(blobs((H,W),lit,r,26,0.6,1.2),L,0.95)
        # tinh thể tuyết (dấu cộng)
        for _ in range(7):
            ys,xs=np.nonzero(lit)
            if len(ys)==0: break
            i=r.randint(len(ys)); y,x=ys[i],xs[i]
            for dy,dx in((0,0),(1,0),(-1,0),(0,1),(0,-1)):
                if mask[min(H-1,max(0,y+dy)),min(W-1,max(0,x+dx))]: out[y+dy,x+dx]=L
        paint(rim&(yy<np.median(yy[mask])),hexrgb('#cfefff'),0.6)
    elif kind=='mist':
        g=np.clip((yy-yy[mask].min())/(np.ptp(yy[mask])+1),0,1)
        paint(inner&(g>0.55),L,0.30*(g-0.55)/0.45+0.1)
        paint(blobs((H,W),inner&(g>0.35),r,10,1.2,2.4),L,0.45)
    elif kind=='cloud':
        for _ in range(5):
            ys,xs=np.nonzero(inner)
            if len(ys)==0: break
            i=r.randint(len(ys)); cy,cx=ys[i],xs[i]
            for dx,dy,rad in((0,0,3),(3,1,2.4),(-3,1,2.4),(0,2,2)):
                m=((yy-cy-dy)**2+(xx-cx-dx)**2)<=rad*rad
                paint(m&inner,L,0.55)
            m=((yy-cy-3)**2+(xx-cx)**2)<=2
            paint(m&inner,D,0.35)
    elif kind=='wind':
        for k in range(9):
            y0=r.randint(int(yy[mask].min()),int(yy[mask].max())); x0=r.randint(int(xx[mask].min()),int(xx[mask].max()))
            ln=r.randint(6,13)
            for t in range(ln):
                y=int(y0+t*0.35); x=x0+t
                if 0<=y<H and 0<=x<W and inner[y,x]: out[y,x]=L if t%5 else D
    elif kind=='bolt':
        for _ in range(4):
            ys,xs=np.nonzero(inner)
            if len(ys)==0: break
            i=r.randint(len(ys)); y,x=ys[i],xs[i]
            for t in range(r.randint(6,11)):
                if 0<=y<H and 0<=x<W and inner[y,x]:
                    out[y,x]=L
                    if x+1<W and inner[y,x+1]: out[y,x+1]=np.minimum(1,L*0.9+0.1)
                y+=1; x+=r.choice([-1,1,1,-1,0])
        paint(rim,L,0.5)
    elif kind=='moon':
        paint(blobs((H,W),lit,r,16,0.5,0.9),L,1.0)
        for _ in range(3):
            ys,xs=np.nonzero(inner)
            i=r.randint(len(ys)); cy,cx=ys[i],xs[i]
            m=(((yy-cy)**2+(xx-cx)**2)<=6.5)&~(((yy-cy+1)**2+(xx-cx-2)**2)<=5)
            paint(m&inner,L,0.95)
        paint(rim,L,0.45)
    elif kind=='sun':
        g=np.clip((yy-yy[mask].min())/(np.ptp(yy[mask])+1),0,1)
        paint(inner,L,0.30*(1-g))
        paint(blobs((H,W),lit,r,12,0.6,1.1),L,0.9)
        paint(rim,L,0.55)
    elif kind=='void':
        paint(inner,D,0.35)
        paint(blobs((H,W),inner,r,14,0.6,1.1),L,0.95)
        paint(rim,L,0.4)
    elif kind=='metal':
        band=((xx+yy*0.8)%15)<3
        paint(inner&band&lit,L,0.7)
        band2=((xx+yy*0.8+7)%15)<2
        paint(inner&band2&~lit,D,0.45)
        paint(rim,L,0.55)
    elif kind=='gem':
        for _ in range(9):
            ys,xs=np.nonzero(lit)
            if len(ys)==0: break
            i=r.randint(len(ys)); y,x=ys[i],xs[i]
            for dy,dx in((0,0),(-1,0),(1,0),(0,-1),(0,1)):
                yy2,xx2=y+dy,x+dx
                if 0<=yy2<H and 0<=xx2<W and inner[yy2,xx2]: out[yy2,xx2]=L
        paint(rim,L,0.35)
    elif kind=='leaf':
        for _ in range(11):
            ys,xs=np.nonzero(inner)
            if len(ys)==0: break
            i=r.randint(len(ys)); y,x=ys[i],xs[i]
            for t in range(4):
                for yy2,xx2,col in((y-t,x+t,L),(y-t+1,x+t,D)):
                    if 0<=yy2<H and 0<=xx2<W and inner[yy2,xx2]: out[yy2,xx2]=col
    elif kind=='ember':
        g=np.clip((yy-yy[mask].min())/(np.ptp(yy[mask])+1),0,1)
        paint(inner&(g>0.6),hexrgb('#ff8a1a'),0.45*(g-0.6)/0.4+0.1)
        paint(blobs((H,W),inner,r,13,0.5,1.0),L,0.95)
        paint(rim,hexrgb('#ff7a20'),0.5)
    elif kind=='shadow':
        paint(inner,D,0.30)
        paint(blobs((H,W),inner,r,9,0.7,1.3),hexrgb('#5a2a70'),0.7)
        paint(rim,L,0.35)
    elif kind=='star':
        for _ in range(8):
            ys,xs=np.nonzero(lit)
            if len(ys)==0: break
            i=r.randint(len(ys)); y,x=ys[i],xs[i]
            for dy,dx in((0,0),(-1,0),(1,0),(0,-1),(0,1),(-2,0),(2,0),(0,-2),(0,2)):
                yy2,xx2=y+dy,x+dx
                if 0<=yy2<H and 0<=xx2<W and inner[yy2,xx2]: out[yy2,xx2]=L if abs(dy)+abs(dx)<2 else np.minimum(1,L*0.85)
        paint(rim,L,0.35)
    elif kind=='feather':
        for _ in range(12):
            ys,xs=np.nonzero(inner)
            if len(ys)==0: break
            i=r.randint(len(ys)); y,x=ys[i],xs[i]
            for t in range(5):
                yy2,xx2=y+t//2,x+t
                if 0<=yy2<H and 0<=xx2<W and inner[yy2,xx2]: out[yy2,xx2]=L if t<4 else D
        paint(rim,L,0.5)
    elif kind=='petal':
        for _ in range(10):
            ys,xs=np.nonzero(lit)
            if len(ys)==0: break
            i=r.randint(len(ys)); y,x=ys[i],xs[i]
            for dy,dx in((0,0),(-1,0),(1,0),(0,-1),(0,1),(1,1)):
                yy2,xx2=y+dy,x+dx
                if 0<=yy2<H and 0<=xx2<W and inner[yy2,xx2]: out[yy2,xx2]=L if (dy,dx)!=(1,1) else D
        paint(rim,L,0.4)
    elif kind=='divine':
        g=np.clip((yy-yy[mask].min())/(np.ptp(yy[mask])+1),0,1)
        paint(inner,hexrgb('#ffe9a0'),0.25*(1-g)+0.05)
        paint(blobs((H,W),lit,r,16,0.5,1.0),L,1.0)
        paint(rim,hexrgb('#ffe27a'),0.7)
    return np.clip(out,0,1)

def outline(rgb,mask,mean):
    m=Image.fromarray((mask*255).astype(np.uint8))
    dil=np.array(m.filter(ImageFilter.MaxFilter(3)))>0
    ring=dil&~mask
    col=np.clip(mean*0.16,0,1)
    return ring,col

def process(img,bl,e,baby=False):
    name,hue,sat,val,kind,light,dark=EL[e]
    a=np.array(img.convert('RGBA')).astype(np.float32)/255
    mask=a[...,3]>=0.43
    rgb=a[...,:3]
    orig=rgb
    rgb=recolor(rgb,mask,hue,sat,val)
    rgb=accent_pop(orig,rgb,mask,e)
    edge,er=edges(mask,1)
    inner=er
    r=rng_for(bl,e+(50 if baby else 0))
    rgb=material(rgb,mask,inner,kind,light,dark,r)
    # giữ nguyên cấu trúc sáng-tối và viền của ảnh gốc (ảnh gốc đã có viền tối) => giữ độ nét
    out=np.dstack([rgb,a[...,3]])
    out[~mask,3]=a[~mask,3]
    out[mask,3]=1.0
    return Image.fromarray((np.clip(out,0,1)*255).astype(np.uint8),'RGBA')

def run(src,dst,only=None):
    os.makedirs(dst,exist_ok=True)
    for bl in BL:
        for e in range(17):
            if only and (bl,e) not in only: continue
            # file adult: dùng đúng tên trong 01-assets.js
            f=[x for x in os.listdir(src) if re.fullmatch(rf'img-sprites-(2-)?{bl}-{e}\.png',x)]
            if not f: continue
            for fn in f:
                process(Image.open(os.path.join(src,fn)),bl,e).save(os.path.join(dst,fn))
            bb=Image.open(os.path.join(src,f'img-sprites-baby-{bl}.png'))
            process(bb,bl,e,True).save(os.path.join(dst,f'img-sprites-baby-{bl}-{e}.png'))
if __name__=='__main__':
    run(sys.argv[1],sys.argv[2])
