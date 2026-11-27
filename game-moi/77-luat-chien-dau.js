/* 77-luat-chien-dau.js - LUẬT CHIẾN ĐẤU CỦA CÁC CHỈ SỐ PHỤ (công thức thuần, không đụng giao diện/trận; trận gọi qua TTGLCS ở index.html).
   NGUYÊN TẮC (theo ý người thiết kế): KHÔNG có trần chỉ số. Chỉ số của bên tấn công TRỪ THẲNG chỉ số kháng tương ứng của bên bị đánh;
   né 111% mà gặp Kháng né / Chính xác đủ cao thì vẫn bị đánh trúng. Người chơi tự tính để dựng bộ khắc chế.
   Mọi hàm nhận a = chỉ số bên LÀM (đã tính buff/debuff + trang bị, effS), t = chỉ số bên BỊ (effS/effT). Thiếu chỉ số = 0. Số % là số thẳng (4 = 4%).

   BẢNG LUẬT (đổi số ở CFG hoặc công thức ở từng hàm):
   1. Né tránh / Chính xác / Kháng né : tỉ lệ ĐÒN TRÚNG = 100 + Chính xác(a) - max(0, Né(t) - Kháng né(a)), kẹp 0..100 (CFG.sanTrung = trúng tối thiểu, mặc định 0 = không sàn).
   2. Chí mạng / ST chí mạng          : tỉ lệ chí mạng = Chí mạng(a)%. Sát thương chí mạng nhân (CFG.chiMang của TTGCS, 1,5) + ST chí mạng/100.
   3. Choáng / Kháng choáng           : mỗi đòn thường TRÚNG, xác suất choáng đối thủ 1 lượt = max(0, Choáng(a) - Kháng choáng(t))%; không choáng chồng khi đang choáng.
   4. Hút máu / Hồi máu + kháng       : hút máu = max(0, Hút máu(a) - Kháng hút máu(t))% sát thương gây ra. Hồi máu mỗi lượt của chính mình = max(0, Hồi máu(mình) - Kháng hồi máu(đối thủ))% HP tối đa.
   5. Phản đòn / Kháng phản đòn       : khi bị đòn thường trúng, xác suất phản = max(0, Phản đòn(t) - Kháng phản đòn(a))%, dội lại CFG.phanDonHs (30%) sát thương vừa nhận.
   6. Liên kích / Kháng liên kích     : sau đòn thường trúng, xác suất đánh thêm 1 đòn = max(0, Liên kích(a) - Kháng liên kích(t))%, bằng CFG.lienKichHs (50%) sát thương đòn đó (không liên kích chồng).
   7. ST đặc biệt / Kháng đặc biệt    : sát thương KỸ NĂNG x (1 + max(0, ST đặc biệt(a) - Kháng đặc biệt(t))/100). Xuyên giáp: bỏ qua Xuyên giáp(a)% phòng thủ của đối thủ (cộng với buff Xuyên Giáp có sẵn).
   (Kháng hiệu ứng `khu` và May mắn `mm` đã có luật ở nơi khác: giảm debuff kỹ năng / nhân tỉ lệ rơi.) */
(function(root){
'use strict';
var CFG={
  sanTrung:0,        /* % trúng tối thiểu dù né bao nhiêu. 0 = không sàn (né >= 100 + chính xác thì không bao giờ bị trúng) */
  phanDonHs:.30,     /* phản đòn dội lại bao nhiêu % sát thương vừa nhận */
  lienKichHs:.50,    /* đòn liên kích bằng bao nhiêu % sát thương đòn vừa đánh */
  chiMangGoc:1.5     /* nhân chí mạng gốc nếu không đọc được TTGCS.CFG.chiMang */
};
function v(o,k){var x=o&&+o[k];return x>0?x:0;}
function rnd(r){return (r||Math.random)()*100;}
function clamp(x,a,b){return x<a?a:(x>b?b:x);}
function chiMangGoc(){var c=root.TTGCS&&root.TTGCS.CFG&&root.TTGCS.CFG.chiMang;return c>0?c:CFG.chiMangGoc;}
/* 1. tỉ lệ đòn trúng (0..100) */
function cxRaw(a){var x=a&&+a.cx;return x?x:0;}   /* Chính xác CHO PHÉP ÂM (debuff Diệt Thế): âm thì đòn của bên đó trượt thêm, kể cả khi đối thủ không có Né */
function tiLeTrung(a,t){return clamp(100+cxRaw(a)-Math.max(0,v(t,'ne')-v(a,'kne')),clamp(CFG.sanTrung,0,100),100);}
function truot(a,t,r){return rnd(r)>=tiLeTrung(a,t);}                 /* true = đòn BỊ NÉ */
/* 2. chí mạng */
function chiMang(a,r){return rnd(r)<v(a,'cm');}
function stChiMang(d,a){var g=chiMangGoc(),m=g+v(a,'stcm')/100;return Math.max(1,Math.round(d*m/g));}   /* d đã nhân sẵn chí mạng gốc -> nâng lên chí mạng + ST chí mạng */
/* 3. choáng */
function tiLeChoang(a,t){return Math.max(0,v(a,'choang')-v(t,'kc'));}
function choang(a,t,r){return rnd(r)<tiLeChoang(a,t);}
/* 4. hút máu / hồi máu */
function hutMau(a,t){return Math.max(0,v(a,'hutm')-v(t,'khutm'));}   /* % sát thương được hút */
function hoiMau(self,opp){return Math.max(0,v(self,'hm')-v(opp,'khm'));}   /* % HP tối đa hồi mỗi lượt của mình */
/* 5. phản đòn: a = bên đánh, t = bên bị đánh (người phản) */
function tiLePhanDon(a,t){return Math.max(0,v(t,'pd')-v(a,'kpd'));}
function phanDon(a,t,r){return rnd(r)<tiLePhanDon(a,t);}
/* 6. liên kích */
function tiLeLienKich(a,t){return Math.max(0,v(a,'lk')-v(t,'klk'));}
function lienKich(a,t,r){return rnd(r)<tiLeLienKich(a,t);}
/* 7. ST đặc biệt (kỹ năng) / xuyên giáp */
function stDacBiet(d,a,t){var p=Math.max(0,v(a,'stdb')-v(t,'kdb'));return p>0?Math.max(1,Math.round(d*(1+p/100))):d;}
function xuyenGiap(a){return v(a,'xg');}
root.TTGLCS={CFG:CFG,tiLeTrung:tiLeTrung,truot:truot,chiMang:chiMang,stChiMang:stChiMang,tiLeChoang:tiLeChoang,choang:choang,hutMau:hutMau,hoiMau:hoiMau,
  tiLePhanDon:tiLePhanDon,phanDon:phanDon,tiLeLienKich:tiLeLienKich,lienKich:lienKich,stDacBiet:stDacBiet,xuyenGiap:xuyenGiap};
if(typeof module!=='undefined'&&module.exports)module.exports=root.TTGLCS;
})(typeof window!=='undefined'?window:globalThis);
