import sys, numpy as np
from PIL import Image, ImageFilter
import colorsys

def enhance(im, sat=1.9, contrast=1.35, outline=True, rim=True):
    im = im.convert('RGBA')
    a = np.array(im).astype(np.float32)/255
    alpha = (a[...,3] >= 0.43).astype(np.float32)          # giống SOLID_ALPHA=110
    rgb = a[...,:3]
    # RGB -> HSV (vector)
    mx = rgb.max(-1); mn = rgb.min(-1); d = mx-mn
    h = np.zeros_like(mx)
    r,g,b = rgb[...,0],rgb[...,1],rgb[...,2]
    m = d>1e-6
    h[m&(mx==r)] = (((g-b)/np.where(d==0,1,d))%6)[m&(mx==r)]
    h[m&(mx==g)] = (((b-r)/np.where(d==0,1,d))+2)[m&(mx==g)]
    h[m&(mx==b)] = (((r-g)/np.where(d==0,1,d))+4)[m&(mx==b)]
    h = h/6.0
    s = np.where(mx>0, d/np.maximum(mx,1e-6), 0)
    v = mx
    # tăng bão hòa mạnh hơn ở vùng nhạt; kéo tương phản bằng đường cong S quanh trung vị
    s = np.clip(s*sat + (1-s)*0.10*(s>0.02), 0, 1)
    med = float(np.median(v[alpha>0])) if (alpha>0).any() else 0.6
    pivot = min(max(med,0.45),0.80)          # cân theo độ sáng riêng từng con, tránh con tối bị đen thui
    target = max(0.58, min(pivot, 0.66))
    v = np.clip((v-pivot)*contrast+target, 0.10, 1)
    # HSV -> RGB
    i = np.floor(h*6).astype(int)%6; f = h*6-np.floor(h*6)
    p = v*(1-s); q = v*(1-f*s); t = v*(1-(1-f)*s)
    out = np.stack([np.choose(i,[v,q,p,p,t,v]), np.choose(i,[t,v,v,q,p,p]), np.choose(i,[p,p,t,v,v,q])],-1)
    H,W = alpha.shape
    if rim:  # ánh sáng viền phía trên-trái, bóng phía dưới-phải => có khối
        up = np.zeros_like(alpha); up[1:,:] = alpha[:-1,:]
        lf = np.zeros_like(alpha); lf[:,1:] = alpha[:,:-1]
        edge_tl = (alpha>0)&((up==0)|(lf==0))
        out[edge_tl] = np.clip(out[edge_tl]*1.18+0.05,0,1)
    res = np.dstack([out, alpha])
    if outline:  # viền tối 1px, lấy màu chính của con vật làm tối đi => như quái
        dil = np.array(Image.fromarray((alpha*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)))/255
        ring = (dil>0)&(alpha==0)
        w = alpha[...,None]
        mean = (out*w).sum((0,1))/max(w.sum(),1)
        oc = np.clip(mean*0.18,0,1)
        res[ring,:3] = oc; res[ring,3] = 1
    return Image.fromarray((np.clip(res,0,1)*255).astype(np.uint8),'RGBA')

if __name__=='__main__':
    enhance(Image.open(sys.argv[1])).save(sys.argv[2])
