/* 43-gear-scene.js — đã BỎ phần aura bộ trang bị (sảnh/đấu trường). Chỉ giữ hiệu ứng SỰ KIỆN KÍCH HOẠT của bộ trang bị.
   TTGGearScene chỉ còn là cờ rỗng để 57-fx-ky-nang-boss.js biết phải chờ khối "4A sửa" (API.__procfix) bọc xong. */
(()=>{
 'use strict';
 window.TTGGearScene={cur:null};
})();

/* ===== [FX 4A sửa] Sự kiện bộ trang bị (Dung Nham / Lôi Kích / Phong Nhận) chỉ chạy hiệu ứng SỰ KIỆN, không chạy kèm đòn thường =====
   Nguyên nhân: đấu trường đặt nhãn "Dung Nham -N", "Lôi Kích -N", "Phong Nhận -N" khác nhãn thám hiểm ("Dung Nham Phun Trào",
   "Lôi Phạt giáng xuống") nên các lớp 33–40 không nhận ra đây là sự kiện đặc biệt → vẽ thêm cả đòn đánh thường rồi mới tới hiệu ứng sự kiện.
   Cách sửa (chỉ VẼ, không đụng sát thương/chỉ số/lưu): ở pha ra đòn, đổi tên tạm cho khớp nhãn thám hiểm để các lớp trước giao lại cho hiệu ứng gốc
   của 31 (dung nham nứt đất / sét giáng); Phong Nhận không vẽ pha ra đòn (vệt gió vẽ ở pha trúng); fxClass coi Dung Nham đấu trường là lớp 2 (không lao tới). */
(()=>{
 'use strict';
 const LAVA=/Dung Nham(?! Phun Trào)\s*-/,THUN=/Lôi Kích\s*-/,WIND=/Phong Nhận(?: chém thêm| -)/;
 let tries=0;
 function boot(){
  const API=window.TTGCombatFX;
  if(!API||!API.drawAttack||!API.__fx3a){if(tries++<240)setTimeout(boot,50);return}   /* chờ 40-attack-fx-3a bọc xong để bọc ngoài cùng */
  if(API.__procfix)return;API.__procfix=1;
  const prev=API.drawAttack;
  API.drawAttack=function(g,T,S){
   const t=(S&&S.text)||'';
   if(WIND.test(t))return true;
   let t2=t;
   if(LAVA.test(t))t2=t.replace('Dung Nham','Dung Nham Phun Trào');
   else if(THUN.test(t))t2=t.replace('Lôi Kích','Lôi Phạt giáng xuống');
   if(t2===t)return prev.apply(this,arguments);
   S.text=t2;
   try{return prev.apply(this,arguments)}finally{S.text=t}
  };
 }
 boot();
 const F=window.TTGFX;
 if(F&&typeof F.fxClass==='function'&&!F.fxClass.__proc){
  const o=F.fxClass,w=function(x){return LAVA.test((x&&x.t)||'')?2:o(x)};
  w.__proc=1;F.fxClass=w;
 }
})();

/* ===== [FX 4A] Nhãn tên SỰ KIỆN bộ trang bị ngay trên thú (thú mình và thú đối thủ đều có) =====
   Khi buff bộ kích hoạt (ví dụ Dung Nham Phun Trào) → hiện 1 dòng chữ tên sự kiện phía trên đầu thú CHỦ BUFF, hiện nhanh, giữ, rồi mờ dần.
   Chỉ VẼ: không đụng sát thương/chỉ số/lưu. Gọi: window.TTGEvBanner(g, fx) với fx={text, q (1→0), pp (true = bên bạn là bên ra sự kiện)}.
   [regex khớp, tên hiển thị, màu, chủ buff: 0 = bên ra sự kiện, 1 = bên đối diện (buff phòng thủ / bên bị đánh)] */
(()=>{
 'use strict';
 const EVN=[
  [/Dung Nham Phun Trào|Dung Nham\s*-/,'Dung Nham Phun Trào','#ff8a3a',0],
  [/Lôi Phạt giáng|Lôi Kích\s*-/,'Lôi Phạt Giáng Xuống','#ffe53a',0],
  [/Phong Nhận(?: chém thêm| -)/,'Phong Nhận Chém Thêm','#a0ffd0',0],
  [/Nguyệt Ảnh phản kích/,'Nguyệt Ảnh Phản Kích','#b8a8ff',0],
  [/Sinh Cơ(?: Cổ Thụ)? \+/,'Sinh Cơ Cổ Thụ','#8be04a',0],
  [/\(Ngọc Hộ Mệnh\)/,'Ngọc Hộ Mệnh','#ffe27a',0],
  [/ẩn mình trong mây/,'Vân Ẩn','#c9d8ff',1],
  [/·\s\S+\sSương Tán/,'Sương Tán','#9fd9c8',1],
  [/·\s\S+\sDương Diệm/,'Dương Diệm','#ffb84a',0],
  [/·\s\S+\sThần Phán/,'Thần Phán','#ffd24a',0],
  [/·\s\S+\sTinh Quang/,'Tinh Quang','#c08aff',0],
  [/·\s\S+\sThiên Uy/,'Thiên Uy','#fff0a0',0],
  [/bị đóng băng, mất lượt/,'Băng Phong','#9fe4ff',1]   /* bên bị đóng băng là bên ra sự kiện → chủ buff là bên đối diện */
 ];
 function evNames(t){const o=[];for(const a of EVN)if(a[0].test(t))o.push(a);return o}
 function banner(g,fx){
  const list=evNames(fx.text||'');if(!list.length)return;
  const q=Math.max(0,Math.min(1,fx.q||0));
  const al=Math.min(1,q/.1,(1-q)/.25+.15);       /* hiện nhanh, giữ, mờ dần ở cuối */
  if(!(al>.01))return;
  const y0=158,used={};   /* giữa thân thú, nằm dưới bảng thông tin nên không bị che */
  g.save();
  g.globalAlpha=Math.max(0,Math.min(1,al));g.font='bold 13px monospace';g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';g.lineWidth=4;
  list.forEach(a=>{
   const own=a[3]?!fx.pp:!!fx.pp;               /* true = thú của mình (bên trái x=85), false = thú đối thủ (x=272) */
   const side=own?0:1,n=used[side]||0;used[side]=n+1;
   const w=g.measureText(a[1]).width,x=Math.max(w/2+4,Math.min(356-w/2,own?85:272)),y=y0-q*6+n*15;
   g.strokeStyle='rgba(16,8,24,.92)';g.strokeText(a[1],x,y);
   g.fillStyle=a[2];g.fillText(a[1],x,y);
  });
  g.restore();
 }
 window.TTGEvBanner=banner;
 const F=window.TTGFX;
 if(F&&typeof F.impact==='function'&&!F.impact.__evn){
  const o=F.impact,w=function(g,fx){
   const r=o.apply(this,arguments);
   try{if(fx)banner(g,fx)}catch(_){}
   return r;
  };
  w.__evn=1;F.impact=w;
 }
})();
