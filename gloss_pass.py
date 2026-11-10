#!/usr/bin/env python3
"""Bước làm 'nổi + đậm nét + bóng' chạy SAU upgrade_pets.process():
 1) chi tiết (vây, vảy, lông, vân) sáng rực theo màu nhấn của hệ
 2) đường nét đậm: viền ngoài + đường tối bên trong đậm hơn
 3) độ bóng: điểm sáng phản chiếu cứng kiểu pixel-art + viền sáng góc trên-trái"""
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
from skimage.color import rgb2hsv, hsv2rgb
import upgrade_pets as U

def blur(a,s): return ndi.gaussian_filter(a,s)

def gloss(img,e,detail=1.0,line=1.0,spec=1.0):
    a=np.array(img.convert('RGBA')).astype(np.float32)/255
    mask=a[...,3]>=0.5
    rgb=a[...,:3].copy()
    H,W=mask.shape
    er1=ndi.binary_erosion(mask,iterations=1)
    er2=ndi.binary_erosion(mask,iterations=2)
    inner=er1                       # trong viền tối
    ah,as_=U.TWO[e][3],U.TWO[e][4]
    hsv=rgb2hsv(rgb); lum=hsv[...,2]
    m=mask.astype(np.float32)
    # --- 1) chi tiết nổi: điểm sáng cục bộ -> màu nhấn rực
    lm=blur(lum*m,2.2)/np.maximum(blur(m,2.2),1e-3)
    d=(lum-lm)*inner
    t=np.clip((d-0.035)/0.09,0,1)*0.85*detail
    # thân hơi đậm lại để chi tiết bật lên
    V=hsv[...,2]*(1-0.16*(1-t)*inner)
    S=np.clip(hsv[...,1]*1.08,0,1)
    # tô điểm nhấn
    acc_h=np.full_like(lum,ah); acc_s=np.full_like(lum,np.clip(as_,0.45,1.0)); acc_v=np.clip(0.80+lum*0.32,0,1)
    # blend theo t (xoay vòng hue ngắn nhất)
    dh=((acc_h-hsv[...,0]+0.5)%1.0)-0.5
    Hn=(hsv[...,0]+dh*t)%1.0
    Sn=S*(1-t)+acc_s*t
    Vn=V*(1-t)+acc_v*t
    out=hsv2rgb(np.dstack([Hn,Sn,Vn]))
    # --- 2) đường nét đậm
    lum2=out.mean(-1)
    lm2=blur(lum2*m,1.2)/np.maximum(blur(m,1.2),1e-3)
    dark=np.clip((lm2-lum2-0.02)/0.10,0,1)*inner*line     # đường tối nội bộ
    out=out*(1-0.55*dark[...,None])
    edge=mask&~er1                                             # viền ngoài hiện có
    ring2=er1&~er2
    out[edge]=out[edge]*0.28
    out[ring2]=out[ring2]*(1-0.35*line)
    # --- 3) độ bóng
    hgt=ndi.distance_transform_edt(mask)
    hgt=blur(hgt,2.2)*1.6+blur(lum*m,2.0)*1.2
    gy,gx=np.gradient(hgt)
    nx,ny,nz=-gx,-gy,np.full_like(gx,1.0)
    nrm=np.sqrt(nx**2+ny**2+nz**2); nx/=nrm; ny/=nrm; nz/=nrm
    L=np.array([-0.55,-0.65,0.52]); L/=np.linalg.norm(L)
    Hh=L+np.array([0,0,1.0]); Hh/=np.linalg.norm(Hh)
    sp=np.clip(nx*Hh[0]+ny*Hh[1]+nz*Hh[2],0,1)**14
    sp=sp*inner
    # đốm bóng tròn đặt ở chỗ sáng nhất mỗi mảng cơ thể (không kéo thành vệt)
    pk=(sp>=ndi.maximum_filter(sp,size=21))&(sp>0.30)&inner
    ys,xs=np.nonzero(pk)
    if len(ys)>4:
        order=np.argsort(-sp[ys,xs])[:4]
        pk=np.zeros_like(pk); pk[ys[order],xs[order]]=True
    plus=ndi.generate_binary_structure(2,1)
    core=ndi.binary_dilation(pk,structure=plus)
    ring=ndi.binary_dilation(core,structure=plus)&~core
    hard=core.astype(np.float32)*spec
    soft=(ring&inner).astype(np.float32)*spec*0.9
    wh=np.array([1.0,0.98,0.92],np.float32)
    out=out*(1-soft[...,None]*0.40)+wh*soft[...,None]*0.40
    out=out*(1-hard[...,None])+wh*hard[...,None]
    # viền sáng góc trên-trái (ngay trong viền tối)
    up=np.zeros_like(mask); up[1:,:]=er1[:-1,:]
    lf=np.zeros_like(mask); lf[:,1:]=er1[:,:-1]
    tl=er1&(~up|~lf)&~ring2
    out[tl]=np.clip(out[tl]*1.18+0.12,0,1)
    res=np.dstack([np.clip(out,0,1),a[...,3]])
    res[~mask,:3]=a[~mask,:3]
    return Image.fromarray((res*255).astype(np.uint8),'RGBA')

def crisp(img,amount=1.4,sat=1.25,lo=0.10,hi=0.98):
    """Chống 'mờ': làm nét cục bộ (unsharp trên độ sáng), kéo giãn sáng-tối, tăng bão hòa. Giữ nguyên viền/alpha."""
    a=np.array(img.convert('RGBA')).astype(np.float32)/255
    mask=a[...,3]>=0.5
    inner=ndi.binary_erosion(mask,iterations=1)
    hsv=rgb2hsv(a[...,:3]); v=hsv[...,2]
    m=mask.astype(np.float32)
    lm=blur(v*m,1.3)/np.maximum(blur(m,1.3),1e-3)
    v2=np.clip(v+(v-lm)*amount,0,1)
    vals=v2[inner]
    p1,p99=np.percentile(vals,2),np.percentile(vals,98)
    v3=np.clip((v2-p1)/max(p99-p1,1e-3),0,1)*(hi-lo)+lo
    v3=np.where(inner,v3,v)
    s2=np.clip(hsv[...,1]*sat,0,1)
    out=hsv2rgb(np.dstack([hsv[...,0],np.where(inner,s2,hsv[...,1]),v3]))
    res=np.dstack([out,a[...,3]]); res[~mask,:3]=a[~mask,:3]
    return Image.fromarray((np.clip(res,0,1)*255).astype(np.uint8),'RGBA')

def deepen(img,hue=0.78,body_s=0.85,vmul=0.62):
    """Thân đục/xám -> tím đậm bão hòa cao; điểm nhấn sáng giữ nguyên. Giữ cấu trúc sáng-tối để còn nét."""
    a=np.array(img.convert('RGBA')).astype(np.float32)/255
    mask=a[...,3]>=0.5; inner=ndi.binary_erosion(mask,iterations=1)
    hsv=rgb2hsv(a[...,:3]); h,s,v=hsv[...,0],hsv[...,1],hsv[...,2]
    accent=(s>0.55)&(v>0.72)|(v>0.93)
    acc=ndi.binary_dilation(accent,iterations=1)&inner
    w=acc.astype(np.float32)
    w=blur(w,0.6)
    body_h=np.full_like(h,hue)
    vv=np.clip(0.06+v*vmul,0,1)
    H=h*w+body_h*(1-w)
    S=s*w+np.clip(body_s*(0.6+0.4*s),0,1)*(1-w)
    V=v*w+vv*(1-w)
    out=hsv2rgb(np.dstack([H,S,V]))
    res=np.dstack([out,a[...,3]]); res[~inner,:3]=a[~inner,:3]
    return Image.fromarray((np.clip(res,0,1)*255).astype(np.uint8),'RGBA')
