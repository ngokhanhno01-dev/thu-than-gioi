/* Cực quang lung linh cho Tuyết Nguyên (vùng 0).
   Bọc sceneBg (04-scenes.js): nhánh 'aurora' dùng 3 dải màn sáng mềm thay cho 3 đường kẻ cũ; các nền khác giữ nguyên.
   Chồng ở chế độ screen, alpha trần thấp để không che cực quang đã vẽ sẵn trong ảnh. Chỉ fillRect + 3 gradient/khung hình -> nhẹ cho điện thoại. */
const AUR_BANDS=[
 {rgb:'90,255,205',base:30,amp:13,fr:.021,sp:.55,ph:0,len:62,al:.30},
 {rgb:'110,175,255',base:44,amp:11,fr:.017,sp:-.42,ph:2.1,len:54,al:.26},
 {rgb:'175,140,255',base:22,amp:9,fr:.026,sp:.35,ph:4.3,len:44,al:.18}
];
function auroraShimmer(t){
 c.save();c.globalCompositeOperation='screen';
 const breathe=.78+.22*Math.sin(t*.45);
 for(let b=0;b<AUR_BANDS.length;b++){
  const B=AUR_BANDS[b];
  const g=c.createLinearGradient(0,0,0,B.len);
  g.addColorStop(0,'rgba('+B.rgb+',0)');g.addColorStop(.18,'rgba('+B.rgb+',1)');g.addColorStop(.55,'rgba('+B.rgb+',.35)');g.addColorStop(1,'rgba('+B.rgb+',0)');
  c.fillStyle=g;
  for(let x=0;x<W;x+=3){
   const y=B.base+Math.sin(x*B.fr+t*B.sp+B.ph)*B.amp+Math.sin(x*B.fr*2.3-t*B.sp*1.6+B.ph)*(B.amp*.35);
   const shimmer=.55+.45*Math.sin(x*.07+t*(1.1+b*.35)+B.ph*2);   /* sóng sáng chạy dọc dải */
   const ray=.7+.3*Math.sin(x*.9+b*5);                             /* sọc tia đứng như màn rèm */
   const edge=Math.min(1,Math.min(x,W-x)/40);                      /* mờ dần hai bên mép ảnh */
   c.globalAlpha=Math.max(0,B.al*breathe*shimmer*ray*edge);
   c.translate(0,y);c.fillRect(x,0,3,B.len*(.8+.2*shimmer));c.translate(0,-y);
  }
 }
 c.globalAlpha=1;
 /* điểm lấp lánh dọc mép trên của dải xanh lục */
 const B0=AUR_BANDS[0];
 for(let i=0;i<9;i++){
  const x=(i*41+Math.sin(t*.5+i)*14+W)%W,y=B0.base+Math.sin(x*B0.fr+t*B0.sp+B0.ph)*B0.amp+6;
  const a=Math.max(0,Math.sin(t*2.2+i*2.7));
  if(a<.15)continue;
  c.fillStyle='rgba(215,255,240,'+(a*.8)+')';c.fillRect(Math.round(x)-1,Math.round(y),3,1);c.fillRect(Math.round(x),Math.round(y)-1,1,3);
 }
 c.restore();
}
(()=>{
 const orig=sceneBg;
 sceneBg=function(b,t,A,F){if(b=='aurora')auroraShimmer(t);else orig(b,t,A,F)};
})();
